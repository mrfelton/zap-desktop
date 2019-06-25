import config from 'config'
import { createSelector } from 'reselect'
import errorToUserFriendly from '@zap/utils/userFriendlyErrors'
import { decodePayReq, getNodeAlias } from '@zap/utils/crypto'
import { convert } from '@zap/utils/btc'
import delay from '@zap/utils/delay'
import { grpcService } from 'workers'
import { fetchBalance } from './balance'
import { fetchChannels } from './channels'
import { networkSelectors } from './network'
import { showError } from './notification'

// ------------------------------------
// Initial State
// ------------------------------------

const initialState = {
  paymentLoading: false,
  payment: null,
  payments: [],
  paymentsSending: [],
}

// ------------------------------------
// Constants
// ------------------------------------

export const SET_PAYMENT = 'SET_PAYMENT'
export const GET_PAYMENTS = 'GET_PAYMENTS'
export const RECEIVE_PAYMENTS = 'RECEIVE_PAYMENTS'
export const SEND_PAYMENT = 'SEND_PAYMENT'
export const PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL'
export const PAYMENT_FAILED = 'PAYMENT_FAILED'
export const DECREASE_PAYMENT_RETRIES = 'DECREASE_PAYMENT_RETRIES'

// ------------------------------------
// Helpers
// ------------------------------------

/**
 * decoratePayment - Decorate payment object with custom/computed properties.
 *
 * @param  {object} payment Payment
 * @param  {Array} nodes Nodes
 * @returns {object} Decorated payment
 */
const decoratePayment = (payment, nodes = []) => {
  // Add basic type information.
  const decoration = {
    type: 'payment',
  }

  // Older versions of lnd provided the sat amount in `value`.
  // This is now deprecated in favor of `value_sat` and `value_msat`.
  // Patch data returned from older clients to match the current format for consistency.
  const { value } = payment
  if (value && (!payment.value_sat || !payment.value_msat)) {
    Object.assign(decoration, {
      value_sat: value,
      value_msat: convert('sats', 'msats', value),
    })
  }

  // First try to get the pubkey from payment.path
  let pubkey = payment.path && payment.path[payment.path.length - 1]

  // If we don't have a pubkey, try to get it from the payment request.
  if (!pubkey && payment.payment_request) {
    const paymentRequest = decodePayReq(payment.payment_request)
    pubkey = paymentRequest.payeeNodeKey
  }

  // Try to add some info about the destination of the payment.
  if (pubkey) {
    Object.assign(decoration, {
      dest_node_pubkey: pubkey,
      dest_node_alias: getNodeAlias(pubkey, nodes),
    })
  }

  return {
    ...payment,
    ...decoration,
  }
}

// ------------------------------------
// Actions
// ------------------------------------

export function setPayment(payment) {
  return {
    type: SET_PAYMENT,
    payment,
  }
}

export function getPayments() {
  return {
    type: GET_PAYMENTS,
  }
}

export const sendPayment = data => dispatch => {
  const invoice = decodePayReq(data.paymentRequest)
  const paymentHashTag = invoice.tags ? invoice.tags.find(t => t.tagName === 'payment_hash') : null

  if (!paymentHashTag || !paymentHashTag.data) {
    dispatch(showError('Unable to send payment: Invalid invoice (no payment hash)'))
    return
  }

  const payment = {
    ...data,
    status: 'sending',
    isSending: true,
    creation_date: Math.round(new Date() / 1000),
    payment_hash: paymentHashTag.data,
  }

  dispatch({
    type: SEND_PAYMENT,
    payment,
  })
}

// Send IPC event for payments
export const fetchPayments = () => async dispatch => {
  dispatch(getPayments())
  const grpc = await grpcService
  const payments = await grpc.services.Lightning.listPayments()
  dispatch(receivePayments(payments))
}

// Receive IPC event for payments
export const receivePayments = ({ payments }) => dispatch => {
  dispatch({ type: RECEIVE_PAYMENTS, payments })
}

const decPaymentRetry = paymentRequest => ({ type: DECREASE_PAYMENT_RETRIES, paymentRequest })

export const payInvoice = ({
  payReq,
  amt,
  feeLimit,
  isRetry = false,
  retries = 0,
}) => async dispatch => {
  // if it's a retry - only decrease number of retries left
  if (isRetry) {
    dispatch(decPaymentRetry(payReq))
  }
  // Otherwise, add to sendingPayments in the state.
  else {
    dispatch(
      sendPayment({
        paymentRequest: payReq,
        feeLimit,
        value: amt,
        remainingRetries: retries,
        maxRetries: retries,
      })
    )
  }

  // Submit the payment to LND.
  try {
    const grpc = await grpcService
    const data = await grpc.services.Lightning.sendPayment({
      payment_request: payReq,
      amt,
      fee_limit: { fixed: feeLimit },
    })
    dispatch(paymentSuccessful(data))
  } catch (e) {
    dispatch(
      paymentFailed({
        error: e.message,
        payment_request: e.payload.payment_request,
      })
    )
  }
}

// Find the latest temporary paymentsSending entry for the payment.
const getLastSendingEntry = (state, paymentRequest) =>
  [...state.payment.paymentsSending]
    .sort((a, b) => b.creation_date - a.creation_date)
    .find(p => p.paymentRequest === paymentRequest)

// Receive IPC event for successful payment.
export const paymentSuccessful = ({ payment_request }) => async (dispatch, getState) => {
  const state = getState()
  const paymentSending = getLastSendingEntry(state, payment_request)
  // If we found a related entery in paymentsSending, gracefully remove it and handle as success case.
  if (paymentSending) {
    const { creation_date, paymentRequest } = paymentSending

    // Ensure payment stays in sending state for at least 2 seconds.
    await delay(2000 - (Date.now() - creation_date * 1000))

    // Mark the payment as successful.
    dispatch({ type: PAYMENT_SUCCESSFUL, paymentRequest })

    // Wait for another second.
    await delay(1500)
  }

  // Refetch payments.
  dispatch(fetchPayments())

  // Fetch new balance.
  dispatch(fetchBalance())

  // Fetch updated channels.
  dispatch(fetchChannels())
}

// Receive IPC event for failed payment.
export const paymentFailed = ({ payment_request, error }) => async (dispatch, getState) => {
  const state = getState()
  const paymentSending = getLastSendingEntry(state, payment_request)
  // errors that trigger retry mechanism
  const RETRIABLE_ERRORS = [
    'unable to find a path to destination', // ErrNoPathFound
    'target not found', // ErrTargetNotInNetwork
  ]

  // If we found a related entery in paymentsSending, gracefully remove it and handle as error case.
  if (paymentSending) {
    const { creation_date, paymentRequest, remainingRetries, maxRetries } = paymentSending
    // if we have retries left and error is eligible for retry - rebroadcast payment
    if (remainingRetries && RETRIABLE_ERRORS.includes(error)) {
      const data = {
        ...paymentSending,
        payReq: paymentRequest,
        isRetry: true,
      }
      const retryIndex = maxRetries - remainingRetries + 1
      // add increasing delay
      await delay(config.invoices.baseRetryDelay * retryIndex * retryIndex)
      dispatch(payInvoice(data))
    } else {
      // Ensure payment stays in sending state for at least 2 seconds.
      await delay(2000 - (Date.now() - creation_date * 1000))

      // Mark the payment as failed.
      dispatch({ type: PAYMENT_FAILED, paymentRequest, error: errorToUserFriendly(error) })
    }
  }
}

// Decreases number of retries left for the given @paymentRequest
const handleDecreaseRetries = (state, { paymentRequest }) => {
  const paymentsSending = state.paymentsSending.map(payment => {
    if (payment.paymentRequest === paymentRequest) {
      return { ...payment, remainingRetries: payment.remainingRetries - 1 }
    }
    return payment
  })

  return {
    ...state,
    paymentsSending,
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------

const ACTION_HANDLERS = {
  [GET_PAYMENTS]: state => ({ ...state, paymentLoading: true }),
  [RECEIVE_PAYMENTS]: (state, { payments }) => ({
    ...state,
    paymentLoading: false,
    payments,
    paymentsSending: state.paymentsSending.filter(
      item => !payments.find(p => p.payment_hash === item.payment_hash)
    ),
  }),
  [SET_PAYMENT]: (state, { payment }) => ({ ...state, payment }),
  [SEND_PAYMENT]: (state, { payment }) => ({
    ...state,
    paymentsSending: [...state.paymentsSending, payment],
  }),
  [DECREASE_PAYMENT_RETRIES]: handleDecreaseRetries,
  [PAYMENT_SUCCESSFUL]: (state, { paymentRequest }) => {
    return {
      ...state,
      paymentsSending: state.paymentsSending.map(item => {
        if (item.paymentRequest !== paymentRequest) {
          return item
        }
        return {
          ...item,
          status: 'successful',
        }
      }),
    }
  },
  [PAYMENT_FAILED]: (state, { paymentRequest, error }) => {
    return {
      ...state,
      paymentsSending: state.paymentsSending.map(item => {
        if (item.paymentRequest !== paymentRequest) {
          return item
        }
        return {
          ...item,
          status: 'failed',
          error,
        }
      }),
    }
  },
}

// ------------------------------------
// Selectors
// ------------------------------------

const paymentSelectors = {}
const modalPaymentSelector = state => state.payment.payment
const paymentsSelector = state => state.payment.payments
const paymentsSendingSelector = state => state.payment.paymentsSending
const nodesSelector = state => networkSelectors.nodes(state)

paymentSelectors.payments = createSelector(
  paymentsSelector,
  nodesSelector,
  (payments, nodes) => payments.map(payment => decoratePayment(payment, nodes))
)

paymentSelectors.paymentsSending = createSelector(
  paymentsSendingSelector,
  nodesSelector,
  (paymentsSending, nodes) => paymentsSending.map(payment => decoratePayment(payment, nodes))
)

paymentSelectors.paymentModalOpen = createSelector(
  modalPaymentSelector,
  payment => !!payment
)

export { paymentSelectors }

// ------------------------------------
// Reducer
// ------------------------------------

/**
 * paymentReducer - Payment reducer.
 *
 * @param  {object} state = initialState Initial state
 * @param  {object} action Action
 * @returns {object} Final state
 */
export default function paymentReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
