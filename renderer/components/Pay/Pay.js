import React from 'react'
import PropTypes from 'prop-types'
import config from 'config'
import debounce from 'lodash.debounce'
import { Box, Flex } from 'rebass'
import { animated, Keyframes, Transition } from 'react-spring/renderprops.cjs'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { decodePayReq, getMinFee, getMaxFee, isOnchain, isLn } from '@zap/utils/crypto'
import get from 'lodash.get'
import { convert } from '@zap/utils/btc'
import {
  Bar,
  Form,
  Message,
  LightningInvoiceInput,
  Panel,
  Text,
  TransactionFeeInput,
  Toggle,
  Label,
} from 'components/UI'
import { CurrencyFieldGroup, CryptoValue } from 'containers/UI'
import PaySummaryLightning from 'containers/Pay/PaySummaryLightning'
import PaySummaryOnChain from 'containers/Pay/PaySummaryOnChain'
import PayButtons from './PayButtons'
import PayHeader from './PayHeader'
import {
  TRANSACTION_SPEED_SLOW,
  TRANSACTION_SPEED_MEDIUM,
  TRANSACTION_SPEED_FAST,
} from './constants'
import messages from './messages'

/**
 * Animation to handle showing/hiding the payReq field.
 */
const ShowHidePayReq = Keyframes.Spring({
  small: { height: 48 },
  big: async (next, cancel, ownProps) => {
    ownProps.context.focusPayReqInput()
    await next({ height: 110, immediate: true })
  },
})

/**
 * Animation to handle showing/hiding the form buttons.
 */
const ShowHideButtons = Keyframes.Spring({
  show: { opacity: 1 },
  hide: { opacity: 0 },
})

/**
 * Animation to handle showing/hiding the amount fields.
 */
const ShowHideAmount = Keyframes.Spring({
  show: async (next, cancel, ownProps) => {
    await next({ display: 'block' })
    ownProps.context.focusAmountInput()
    await next({ opacity: 1, height: 'auto' })
  },
  hide: { opacity: 0, height: 0, display: 'none' },
  remove: { opacity: 0, height: 0, display: 'none', immediate: true },
})

/**
 * Payment form (onchain & offchain)
 */
class Pay extends React.Component {
  static propTypes = {
    chain: PropTypes.string.isRequired,
    changeFilter: PropTypes.func.isRequired,
    channelBalance: PropTypes.number.isRequired,
    closeModal: PropTypes.func.isRequired,
    cryptoCurrency: PropTypes.string.isRequired,
    cryptoCurrencyTicker: PropTypes.string.isRequired,
    cryptoName: PropTypes.string.isRequired,
    fetchTickers: PropTypes.func.isRequired,
    initialAmountCrypto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    initialAmountFiat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    intl: intlShape.isRequired,
    isProcessing: PropTypes.bool,
    isQueryingFees: PropTypes.bool,
    lndTargetConfirmations: PropTypes.shape({
      fast: PropTypes.number.isRequired,
      medium: PropTypes.number.isRequired,
      slow: PropTypes.number.isRequired,
    }).isRequired,
    network: PropTypes.string.isRequired,
    onchainFees: PropTypes.shape({
      fast: PropTypes.number,
      medium: PropTypes.number,
      slow: PropTypes.number,
    }),
    payInvoice: PropTypes.func.isRequired,
    payReq: PropTypes.object,
    queryFees: PropTypes.func.isRequired,
    queryRoutes: PropTypes.func.isRequired,
    routes: PropTypes.array,
    sendCoins: PropTypes.func.isRequired,
    setPayReq: PropTypes.func.isRequired,
    walletBalanceConfirmed: PropTypes.number.isRequired,
  }

  static defaultProps = {
    payReq: null,
    initialAmountCrypto: null,
    initialAmountFiat: null,
    isProcessing: false,
    onchainFees: {},
    routes: [],
  }

  state = {
    currentStep: 'address',
    previousStep: null,
    isPayReqSetOnMount: false,
    isLn: null,
    isOnchain: null,
  }

  amountInput = React.createRef()
  payReqInput = React.createRef()

  updateFees = debounce(() => {
    const { isOnchain } = this.state
    if (!isOnchain) {
      return
    }
    const { queryFees } = this.props
    const formState = this.formApi.getState()
    const { payReq: address } = formState.values
    queryFees(address, this.amountInSats())
  }, 500)

  // Set a flag so that we can trigger form submission in componentDidUpdate once the form is loaded.
  componentDidMount() {
    const { fetchTickers, payReq, queryFees } = this.props
    if (payReq) {
      this.setState({ isPayReqSetOnMount: true })
    }
    fetchTickers()
    queryFees()
  }

  componentDidUpdate(prevProps, prevState) {
    const { payReq, queryRoutes } = this.props
    const { currentStep, isPayReqSetOnMount, invoice, isOnchain } = this.state

    const { address, amount } = payReq || {}
    const { payReq: prevPayReq } = prevProps || {}
    const { address: prevAddress, amount: prevAmount } = prevPayReq || {}

    // If isPayReqSetOnMount was set in the when the component mounted, reset the form and submit as new.
    if (isPayReqSetOnMount && isPayReqSetOnMount !== prevState.isPayReqSetOnMount) {
      return this.autoFillForm(address, amount)
    }

    // If payReq address or amount has has changed update the relevant form values.
    const isChangedAddress = address !== prevAddress
    const isChangedAmount = amount !== prevAmount
    if (isChangedAddress || isChangedAmount) {
      return this.autoFillForm(address, amount)
    }

    // If we have gone back to the address step, unmark all fields from being touched.
    if (currentStep !== prevState.currentStep) {
      if (currentStep === 'address') {
        Object.keys(this.formApi.getState().touched).forEach(field => {
          this.formApi.setTouched(field, false)
        })
      }
    }

    // If we now have a valid onchain address, trigger the form submit to move to the amount step.
    const isNowOnchain = isOnchain && isOnchain !== prevState.isOnchain
    if (currentStep === 'address' && isNowOnchain) {
      this.formApi.submitForm()
    }

    // If we now have a valid lightning invoice submit the form.
    const isNowLightning = invoice && invoice !== prevState.invoice
    if (currentStep === 'address' && isNowLightning) {
      this.formApi.submitForm()
    }

    // update route
    if (invoice && prevState.currentStep === 'address' && currentStep === 'summary') {
      const { payeeNodeKey } = invoice
      queryRoutes(payeeNodeKey, this.amountInSats())
    }
  }

  componentWillUnmount() {
    const { setPayReq } = this.props
    setPayReq(null)
  }

  /**
   * Autofill the form and submit to the latest possible point.
   */
  autoFillForm = (address, amount) => {
    if (address && amount) {
      this.setState({ currentStep: 'address' }, () => {
        this.formApi.reset()
        this.formApi.setValue('payReq', address)
        this.formApi.setValue('amountCrypto', amount)
        this.formApi.submitForm()
      })
    } else if (address) {
      this.setState({ currentStep: 'address' }, () => {
        this.formApi.reset()
        this.formApi.setValue('payReq', address)
      })
    }
  }

  /**
   * Get the current per byte fee based on the form values.
   */
  getFee = () => {
    const formState = this.formApi.getState()
    const { speed } = formState.values
    return this.getFeeRate(speed)
  }

  getFeeRate = speed => {
    const { onchainFees } = this.props

    switch (speed) {
      case TRANSACTION_SPEED_SLOW:
        return get(onchainFees, 'slow', null)
      case TRANSACTION_SPEED_MEDIUM:
        return get(onchainFees, 'medium', null)
      case TRANSACTION_SPEED_FAST:
        return get(onchainFees, 'fast', null)
    }
  }

  setCoinSweep = isEnabled => {
    if (isEnabled) {
      const { cryptoCurrency, walletBalanceConfirmed } = this.props
      let onChainBalance = convert('sats', cryptoCurrency, walletBalanceConfirmed)
      this.formApi.setValue('amountCrypto', onChainBalance.toString())
    }
  }

  amountInSats = () => {
    const { isLn, isOnchain, invoice } = this.state
    const { cryptoCurrency } = this.props
    const amount = this.formApi.getValue('amountCrypto')

    if (isLn && invoice) {
      const { satoshis, millisatoshis } = invoice
      return (
        satoshis ||
        convert('msats', 'sats', millisatoshis) ||
        convert(cryptoCurrency, 'sats', amount)
      )
    } else if (isOnchain) {
      return convert(cryptoCurrency, 'sats', amount)
    }
  }

  /**
   * Form submit handler.
   *
   * @param  {object} values submitted form values.
   */
  onSubmit = values => {
    const { currentStep, isOnchain } = this.state
    const {
      cryptoCurrency,
      payInvoice,
      routes,
      sendCoins,
      changeFilter,
      closeModal,
      setPayReq,
    } = this.props
    if (currentStep === 'summary') {
      if (isOnchain) {
        // Determine the fee rate to use.
        const satPerByte = this.getFee()

        // Send the coins.
        sendCoins({
          addr: values.payReq,
          value: values.amountCrypto,
          currency: cryptoCurrency,
          satPerByte: satPerByte,
          isCoinSweep: values.isCoinSweep,
        })
        // Close the form modal once the transaction has been sent
        changeFilter('ALL_ACTIVITY')
        closeModal()
      } else {
        payInvoice({
          payReq: values.payReq,
          amt: this.amountInSats(),
          feeLimit: getMaxFee(routes),
          retries: config.invoices.retryCount,
        })
        // clear payment request
        setPayReq(null)
        // Close the form modal once the payment has been sent
        changeFilter('ALL_ACTIVITY')
        closeModal()
      }
    } else {
      this.nextStep()
    }
  }

  /**
   * Store the formApi on the component context to make it available at this.formApi.
   */
  setFormApi = formApi => {
    this.formApi = formApi
  }

  /**
   * Focus the payReq input.
   */
  focusPayReqInput = () => {
    if (this.payReqInput.current) {
      this.payReqInput.current.focus()
    }
  }

  /**
   * Focus the amount input.
   */
  focusAmountInput = () => {
    if (this.amountInput.current) {
      this.amountInput.current.focus()
    }
  }

  /**
   * List of enabled form steps.
   */
  steps = () => {
    const { isLn, isOnchain, invoice } = this.state
    let steps = ['address']
    if (isLn) {
      // If we have an invoice and the invoice has an amount, this is a 2 step form.
      if (invoice && (invoice.satoshis || invoice.millisatoshis)) {
        steps.push('summary')
      }
      // Othersise, it will be a three step process.
      else {
        steps = ['address', 'amount', 'summary']
      }
    } else if (isOnchain) {
      steps = ['address', 'amount', 'summary']
    }
    return steps
  }

  /**
   * Go back to previous form step.
   */
  previousStep = () => {
    const { currentStep } = this.state
    const nextStep = Math.max(this.steps().indexOf(currentStep) - 1, 0)
    if (currentStep !== nextStep) {
      this.setState({ currentStep: this.steps()[nextStep], previousStep: currentStep })
    }
  }

  /**
   * Progress to next form step.
   */
  nextStep = () => {
    const { currentStep } = this.state
    const nextStepIndex = Math.min(this.steps().indexOf(currentStep) + 1, this.steps().length - 1)
    const nextStep = this.steps()[nextStepIndex]
    if (currentStep !== nextStepIndex) {
      this.setState({ currentStep: nextStep, previousStep: currentStep })
    }
  }

  /**
   * Set isLn/isOnchain state based on payReq value.
   */
  handlePayReqChange = payReq => {
    const { chain, network } = this.props
    const state = {
      currentStep: 'address',
      isLn: null,
      isOnchain: null,
      invoice: null,
    }

    // See if the user has entered a valid lightning payment request.
    if (isLn(payReq, chain, network)) {
      let invoice
      try {
        invoice = decodePayReq(payReq)
        state.invoice = invoice
      } catch (e) {
        return
      }
      state.isLn = true
    }

    // Otherwise, see if we have a valid onchain address.
    else if (isOnchain(payReq, chain, network)) {
      state.isOnchain = true
    }

    // Update the state with our findings.
    this.setState(state)
  }

  renderHelpText = () => {
    const { cryptoName, cryptoCurrencyTicker, payReq } = this.props
    const { currentStep, previousStep } = this.state

    // Do not render the help text if the form has just loadad with an initial payment request.
    if (payReq && !previousStep) {
      return null
    }

    return (
      <Transition
        enter={{ opacity: 1, height: 80 }}
        from={{ opacity: 0, height: 0 }}
        initial={{ opacity: 1, height: 80 }}
        items={currentStep === 'address'}
        leave={{ opacity: 0, height: 0 }}
        native
      >
        {show =>
          show &&
          (styles => (
            <animated.div style={styles}>
              <Box mb={4}>
                <Text textAlign="justify">
                  <FormattedMessage
                    {...messages.description}
                    values={{ chain: cryptoName, ticker: cryptoCurrencyTicker }}
                  />
                </Text>
              </Box>
            </animated.div>
          ))
        }
      </Transition>
    )
  }

  renderAddressField = () => {
    const { currentStep, isLn } = this.state
    const { chain, payReq, network, intl } = this.props

    const payReq_label =
      currentStep === 'address'
        ? 'request_label_combined'
        : isLn
        ? 'request_label_offchain'
        : 'request_label_onchain'

    return (
      <Box className={currentStep === 'summary' ? 'element-hide' : 'element-show'}>
        <ShowHidePayReq context={this} state={currentStep === 'address' || isLn ? 'big' : 'small'}>
          {styles => (
            <React.Fragment>
              <LightningInvoiceInput
                chain={chain}
                css={{
                  resize: 'vertical',
                  'min-height': '48px',
                }}
                field="payReq"
                forwardedRef={this.payReqInput}
                initialValue={payReq && payReq.address}
                isReadOnly={currentStep !== 'address'}
                isRequired
                label={intl.formatMessage({ ...messages[payReq_label] })}
                name="payReq"
                network={network}
                onValueChange={this.handlePayReqChange}
                style={styles}
                validateOnBlur
                validateOnChange
                width={1}
                willAutoFocus
              />
            </React.Fragment>
          )}
        </ShowHidePayReq>
      </Box>
    )
  }

  renderAmountFields = () => {
    const { currentStep, isOnchain } = this.state
    const {
      intl,
      initialAmountCrypto,
      initialAmountFiat,
      isQueryingFees,
      lndTargetConfirmations,
    } = this.props
    const fee = this.getFee()

    const formState = this.formApi.getState()
    const { isCoinSweep } = formState.values

    return (
      <ShowHideAmount
        context={this}
        state={currentStep === 'amount' ? 'show' : currentStep === 'address' ? 'hide' : 'remove'}
      >
        {styles => (
          <Box style={styles}>
            <Bar my={3} variant="light" />

            <CurrencyFieldGroup
              formApi={this.formApi}
              forwardedRef={this.amountInput}
              initialAmountCrypto={initialAmountCrypto}
              initialAmountFiat={initialAmountFiat}
              isDisabled={currentStep !== 'amount' || isCoinSweep}
              isRequired
              onChange={this.updateFees}
            />

            {isOnchain && (
              <>
                <Bar my={3} variant="light" />

                <Flex alignItems="center" justifyContent="space-between">
                  <Label htmlFor="isCoinSweep">
                    <FormattedMessage {...messages.sweep_funds} />
                  </Label>
                  <Toggle field="isCoinSweep" id="isCoinSweep" onValueChange={this.setCoinSweep} />
                </Flex>

                <Bar my={3} variant="light" />

                <TransactionFeeInput
                  fee={fee}
                  field="speed"
                  isQueryingFees={isQueryingFees}
                  label={intl.formatMessage({ ...messages.fee })}
                  lndTargetConfirmations={lndTargetConfirmations}
                  required
                />
              </>
            )}
          </Box>
        )}
      </ShowHideAmount>
    )
  }

  renderSummary = () => {
    const { currentStep, isOnchain } = this.state
    const { routes } = this.props

    const formState = this.formApi.getState()
    const { speed, payReq, isCoinSweep } = formState.values
    let minFee, maxFee
    if (routes.length) {
      minFee = getMinFee(routes)
      maxFee = getMaxFee(routes)
    }
    const render = () => {
      // convert entered amount to satoshis
      const amount = this.amountInSats()

      if (isOnchain) {
        return (
          <PaySummaryOnChain
            address={payReq}
            amount={amount}
            fee={this.getFee()}
            isCoinSweep={isCoinSweep}
            mt={-3}
            speed={speed}
          />
        )
      } else if (isLn) {
        return (
          <PaySummaryLightning
            amount={amount}
            maxFee={maxFee}
            minFee={minFee}
            mt={-3}
            payReq={payReq}
          />
        )
      }
    }

    return (
      <Transition
        enter={{ opacity: 1, height: 'auto' }}
        from={{ opacity: 0, height: 0 }}
        initial={{ opacity: 1, height: 'auto' }}
        items={currentStep === 'summary'}
        leave={{ opacity: 0, height: 0 }}
        native
      >
        {show => show && (styles => <animated.div style={styles}>{render()}</animated.div>)}
      </Transition>
    )
  }

  /**
   * Form renderer.
   */
  render() {
    const { currentStep, invoice, isLn, isOnchain } = this.state
    const {
      chain,
      network,
      channelBalance,
      changeFilter,
      closeModal,
      cryptoCurrency,
      cryptoCurrencyTicker,
      cryptoName,
      fetchTickers,
      payReq,
      initialAmountCrypto,
      initialAmountFiat,
      isProcessing,
      isQueryingFees,
      lndTargetConfirmations,
      onchainFees,
      payInvoice,
      sendCoins,
      setPayReq,
      queryFees,
      queryRoutes,
      routes,
      walletBalanceConfirmed,
      ...rest
    } = this.props
    return (
      <Form
        css={{ height: '100%' }}
        width={1}
        {...rest}
        getApi={this.setFormApi}
        onSubmit={this.onSubmit}
      >
        {({ formState }) => {
          // Deterine which buttons should be visible.
          const hasBackButton = currentStep !== 'address'
          const hasSubmitButton = currentStep !== 'address' || (isOnchain || isLn)

          // convert entered amount to satoshis
          let amountInSats = this.amountInSats()

          // Determine wether we have enough funds available.
          let hasEnoughFunds = true
          if (isLn && invoice) {
            hasEnoughFunds = amountInSats <= channelBalance
          } else if (isOnchain) {
            hasEnoughFunds = amountInSats <= walletBalanceConfirmed
          }

          // Determine what the text should be for the next button.
          let nextButtonText = <FormattedMessage {...messages.next} />
          if (currentStep === 'summary') {
            const { isCoinSweep } = formState.values
            if (isCoinSweep) {
              nextButtonText = <FormattedMessage {...messages.send_all} />
            } else {
              nextButtonText = (
                <>
                  <FormattedMessage {...messages.send} />
                  {` `}
                  <CryptoValue value={amountInSats} />
                  {` `}
                  {cryptoCurrencyTicker}
                </>
              )
            }
          }
          return (
            <Panel>
              <Panel.Header>
                <PayHeader
                  title={
                    <>
                      <FormattedMessage {...messages.send} /> {cryptoName} ({cryptoCurrencyTicker})
                    </>
                  }
                  type={isLn ? 'offchain' : isOnchain ? 'onchain' : null}
                />
                <Bar mt={2} />
              </Panel.Header>

              <Panel.Body py={3}>
                {this.renderHelpText()}
                {this.renderAddressField()}
                {this.renderAmountFields()}
                {this.renderSummary()}
              </Panel.Body>
              <Panel.Footer>
                <ShowHideButtons state={hasBackButton || hasSubmitButton ? 'show' : 'show'}>
                  {styles => (
                    <Box style={styles}>
                      {currentStep === 'summary' && !hasEnoughFunds && (
                        <Message justifyContent="center" mb={2} variant="error">
                          <FormattedMessage {...messages.error_not_enough_funds} />
                        </Message>
                      )}

                      <PayButtons
                        hasBackButton={hasBackButton}
                        hasSubmitButton={hasSubmitButton}
                        isDisabled={
                          formState.pristine ||
                          formState.invalid ||
                          isProcessing ||
                          (currentStep === 'summary' && !hasEnoughFunds)
                        }
                        isProcessing={isProcessing}
                        nextButtonText={nextButtonText}
                        previousStep={this.previousStep}
                      />

                      {walletBalanceConfirmed !== null && (
                        <React.Fragment>
                          <Text fontWeight="normal" mt={3} textAlign="center">
                            <FormattedMessage {...messages.current_balance} />:
                          </Text>
                          <Text fontSize="xs" textAlign="center">
                            <CryptoValue value={walletBalanceConfirmed} />
                            {` `}
                            {cryptoCurrencyTicker} (onchain),
                          </Text>
                          <Text fontSize="xs" textAlign="center">
                            <CryptoValue value={channelBalance} />
                            {` `}
                            {cryptoCurrencyTicker} (in channels)
                          </Text>
                        </React.Fragment>
                      )}
                    </Box>
                  )}
                </ShowHideButtons>
              </Panel.Footer>
            </Panel>
          )
        }}
      </Form>
    )
  }
}

export default injectIntl(Pay)
