import { send } from 'redux-electron-ipc'
import { createSelector } from 'reselect'
import { proxyValue } from 'comlinkjs'
import { bitcoind } from 'workers'
import { showSystemNotification } from '@zap/utils/notifications'
import { setHasSynced } from './info'
import createReducer from './utils/createReducer'

// ------------------------------------
// Initial State
// ------------------------------------

const initialState = {
  isBitcoindRunning: false,
  isStartingBitcoind: false,
  isStoppingBitcoind: false,
  isBitcoindCrashed: false,
  isGrpcActive: false,
  blockHeight: 0,
  bitcoindFirstBlockHeight: 0,
  bitcoindBlockHeight: 0,
  startBitcoindError: null,
  stopBitcoindError: null,
  bitcoindCrashCode: null,
  bitcoindCrashSignal: null,
  bitcoindCrashLastError: null,
  syncStatus: 'pending',
}

// ------------------------------------
// Constants
// ------------------------------------

export const START_BITCOIND = 'START_BITCOIND'
export const START_BITCOIND_SUCCESS = 'START_BITCOIND_SUCCESS'
export const START_BITCOIND_FAILURE = 'START_BITCOIND_FAILURE'

export const STOP_BITCOIND = 'STOP_BITCOIND'
export const STOP_BITCOIND_SUCCESS = 'STOP_BITCOIND_SUCCESS'
export const STOP_BITCOIND_FAILURE = 'STOP_BITCOIND_FAILURE'

export const RECEIVE_CURRENT_BLOCK_HEIGHT = 'RECEIVE_CURRENT_BLOCK_HEIGHT'
export const RECEIVE_BITCOIND_BLOCK_HEIGHT = 'RECEIVE_BITCOIND_BLOCK_HEIGHT'

export const SET_SYNC_STATUS_PENDING = 'SET_SYNC_STATUS_PENDING'
export const SET_SYNC_STATUS_IN_PROGRESS = 'SET_SYNC_STATUS_IN_PROGRESS'
export const SET_SYNC_STATUS_COMPLETE = 'SET_SYNC_STATUS_COMPLETE'

export const SET_RPC_ACTIVE = 'SET_RPC_ACTIVE'

export const BITCOIND_CRASHED = 'BITCOIND_CRASHED'
export const BITCOIND_RESET = 'BITCOIND_RESET'

const SYNC_DEBOUNCE = {
  wait: 500,
  maxWait: 1000,
}

// ------------------------------------
// Helpers
// ------------------------------------

/**
 * parseHeightUpdates - Get the first and last e4ntry in a list of block heights.
 *
 * @param  {Array} data List of height updates
 * @returns {{ first, last }} First and last height in list
 */
const parseHeightUpdates = data => {
  if (!data || !data.length) {
    return {}
  }
  const { height: first } = data[0]
  const { height: last } = data[data.length - 1]
  return { first, last }
}

// ------------------------------------
// IPC
// ------------------------------------

/**
 * killBitcoind - IPC handler for 'killBitcoind' message.
 *
 * @param {object} event Event
 * @param {string} signal Kill signal
 * @returns {Function} Thunk
 */
export const killBitcoind = (event, signal) => async dispatch => {
  await bitcoind.shutdown({ signal })
  dispatch(send('killBitcoindSuccess'))
}

// ------------------------------------
// Actions
// ------------------------------------

/**
 * setRpcActive - Set the current grpc active interface.
 *
 * @returns {object} Action
 */
export const setRpcActive = () => {
  return {
    type: SET_RPC_ACTIVE,
  }
}

/**
 * bitcoindCrashed - Signal a bitcoind crash.
 *
 * @param {object} options Options
 * @param {string} options.code Exit code
 * @param {string} options.code Exit signal code
 * @param {string} options.lastError Last message output to bitcoind's stderror stream
 * @returns {object} Action
 */
export const bitcoindCrashed = ({ code, signal, lastError }) => {
  return {
    type: BITCOIND_CRASHED,
    code,
    signal,
    lastError,
  }
}

/**
 * bitcoindReset - Reset Bitcoind reducer to its initial state.
 *
 * @returns {object} Action
 */
export const bitcoindReset = () => {
  return {
    type: BITCOIND_RESET,
  }
}

/**
 * initBitcoind - Initialise bitcoind service.
 * Attaches event handlers.
 *
 * @returns {Function} Thunk
 */
export const initBitcoind = () => async (dispatch, getState) => {
  bitcoind.on(
    'BITCOIND_RPC_ACTIVE',
    proxyValue(() => {
      dispatch(setRpcActive('lightning'))
    })
  )

  // Hook up event listeners for process termination.
  bitcoind.on(
    'BITCOIND_EXIT',
    proxyValue(data => {
      // Notify the main process that the process has terminated.
      dispatch(send('processExit', { name: 'bitcoind', ...data }))

      // If the netrino process didn't terminate as a result of us asking it TO stop then it must have crashed.
      const { isStoppingBitcoind } = getState().bitcoind
      if (!isStoppingBitcoind) {
        dispatch(bitcoindCrashed(data))
      }
    })
  )

  // Hook up event listeners for sync progress updates.
  bitcoind.on(
    'BITCOIND_GOT_CURRENT_BLOCK_HEIGHT',
    proxyValue(height => dispatch(currentBlockHeight(height)))
  )
  bitcoind.on(
    'BITCOIND_GOT_BITCOIND_BLOCK_HEIGHT',
    proxyValue(height => dispatch(bitcoindBlockHeight(height)))
  )

  // Hook up event listeners for sync status updates.
  bitcoind.on(
    'BITCOIND_CHAIN_SYNC_PENDING',
    proxyValue(() => dispatch(bitcoindSyncStatus('BITCOIND_CHAIN_SYNC_PENDING')))
  )
  bitcoind.on(
    'BITCOIND_CHAIN_SYNC_IN_PROGRESS',
    proxyValue(() => dispatch(bitcoindSyncStatus('BITCOIND_CHAIN_SYNC_IN_PROGRESS')))
  )
  bitcoind.on(
    'BITCOIND_CHAIN_SYNC_COMPLETE',
    proxyValue(() => dispatch(bitcoindSyncStatus('BITCOIND_CHAIN_SYNC_COMPLETE')))
  )
}

/**
 * startBitcoind - Start bitcoind process.
 *
 * @param  {object} bitcoindConfig Bitcoind config instance
 * @returns {Function} Thunk
 */
export const startBitcoind = (bitcoindConfig = {}) => async (dispatch, getState) => {
  const { isStartingBitcoind } = getState().bitcoind
  if (isStartingBitcoind) {
    return
  }

  dispatch({ type: START_BITCOIND })

  Object.assign(bitcoindConfig, {
    binaryPath: window.Zap.bitcoindBinaryPath(),
    datadir: `${window.Zap.getUserDataDir()}/bitcoind/mainnet`,
    server: true,
    rpcuser: 'zap',
    rpcpassword: 'zap',
    zmqpubrawblock: 'tcp://127.0.0.1:28332',
    zmqpubrawtx: 'tcp://127.0.0.1:28333',
    network: 'mainnet',
  })

  try {
    // Initialise the Bitcoind service.
    await bitcoind.init(bitcoindConfig)

    const waitForRpc = new Promise((resolve, reject) => {
      // If the services shuts down in the middle of starting up, abort the start process.
      bitcoind.on(
        'BITCOIND_SHUTDOWN',
        proxyValue(() => {
          bitcoind.removeAllListeners('BITCOIND_SHUTDOWN')
          reject(new Error('Nuetrino was shut down mid-startup.'))
        })
      )
      // Resolve as soon as the rpc interface interface is active.
      bitcoind.on(
        'BITCOIND_RPC_ACTIVE',
        proxyValue(() => {
          bitcoind.removeAllListeners('BITCOIND_SHUTDOWN')
          resolve()
        })
      )
    })

    const pid = await bitcoind.start()

    // Notify the main process of the pid of the active bitcoind process.
    // This allows the main process to force terminate the process if it needs to.
    dispatch(send('processSpawn', { name: 'bitcoind', pid }))

    //Wait for the wallet unlocker service to become available before notifying of a successful start.
    await waitForRpc
    dispatch(startBitcoindSuccess())
  } catch (error) {
    dispatch(startBitcoindFailure(error))

    // Rethrow the error so that callers of this method are able to handle errors themselves.
    throw error
  } finally {
    // Finally, Remove the shutdown listener.
    bitcoind.removeAllListeners('BITCOIND_SHUTDOWN')
  }
}

/**
 * startBitcoindSuccess - Start bitcoind success handler.
 *
 * @returns {object} Action
 */
export const startBitcoindSuccess = () => {
  return { type: START_BITCOIND_SUCCESS }
}

/**
 * startBitcoindFailure - Start bitcoind error handler.
 *
 * @param {string} startBitcoindError Error message
 * @returns {object} Action
 */
export const startBitcoindFailure = startBitcoindError => {
  return { type: START_BITCOIND_FAILURE, startBitcoindError }
}

/**
 * stopBitcoind - Stop bitcoind process.
 *
 * @returns {Function} Thunk
 */
export const stopBitcoind = () => async (dispatch, getState) => {
  const { isStoppingBitcoind } = getState().bitcoind
  if (isStoppingBitcoind) {
    return
  }

  dispatch({ type: STOP_BITCOIND })

  try {
    const bitcoind = await bitcoind

    // Remove grpc interface activation listeners prior to shutdown.
    bitcoind.removeAllListeners('BITCOIND_RPC_ACTIVE')

    // Shut down the service.
    await bitcoind.shutdown()

    dispatch({ type: STOP_BITCOIND_SUCCESS })
  } catch (error) {
    dispatch({ type: STOP_BITCOIND_FAILURE, stopBitcoindError: error })
  }
}

/**
 * currentBlockHeight - Receive current block height.
 *
 * @param  {number} height Block height
 * @returns {object} Action
 */
export const currentBlockHeight = height => ({
  type: RECEIVE_CURRENT_BLOCK_HEIGHT,
  blockHeight: height,
})

/**
 * bitcoindBlockHeight - Receive current bitcoind sync block height.
 *
 * @param  {number} height Block height
 * @returns {object} Action
 */
export const bitcoindBlockHeight = height => ({
  type: RECEIVE_BITCOIND_BLOCK_HEIGHT,
  data: { height },
  debounce: SYNC_DEBOUNCE,
})

/**
 * bitcoindBlockHeight - Receive BITCOIND sync status change.
 *
 * @param  {string} status Bitcoind service sync state.
 * @returns {Function} Thunk
 */
export const bitcoindSyncStatus = status => async dispatch => {
  const notifTitle = 'Lightning Node Synced'
  const notifBody = "Visa who? You're your own payment processor now!"

  switch (status) {
    case 'BITCOIND_CHAIN_SYNC_PENDING':
      dispatch({ type: SET_SYNC_STATUS_PENDING })
      break
    case 'BITCOIND_CHAIN_SYNC_IN_PROGRESS':
      dispatch({ type: SET_SYNC_STATUS_IN_PROGRESS })
      break
    case 'BITCOIND_CHAIN_SYNC_COMPLETE':
      dispatch({ type: SET_SYNC_STATUS_COMPLETE })

      // Persist the fact that the wallet has been synced at least once.
      dispatch(setHasSynced(true))

      // HTML 5 desktop notification for sync completion
      showSystemNotification(notifTitle, notifBody)
      break
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------

const ACTION_HANDLERS = {
  [START_BITCOIND]: state => {
    state.isStartingBitcoind = true
    state.startBitcoindError = null
  },

  [START_BITCOIND_SUCCESS]: state => {
    state.isStartingBitcoind = false
    state.isBitcoindRunning = true
    state.startBitcoindError = null
  },

  [START_BITCOIND_FAILURE]: (state, { startBitcoindError }) => {
    state.isStartingBitcoind = false
    state.startBitcoindError = startBitcoindError
  },

  [STOP_BITCOIND]: state => {
    state.isStoppingBitcoind = true
    state.stopBitcoindError = null
  },
  [STOP_BITCOIND_SUCCESS]: state => ({
    ...state,
    ...initialState,
  }),
  [STOP_BITCOIND_FAILURE]: (state, { stopBitcoindError }) => ({
    ...state,
    ...initialState,
    stopBitcoindError,
  }),

  [RECEIVE_CURRENT_BLOCK_HEIGHT]: (state, { blockHeight }) => {
    state.blockHeight = blockHeight
  },
  [RECEIVE_BITCOIND_BLOCK_HEIGHT]: (state, { data }) => {
    const { first, last } = parseHeightUpdates(data)
    state.bitcoindBlockHeight = last
    state.bitcoindFirstBlockHeight = Math.min(state.bitcoindFirstBlockHeight || first, first)
  },

  [SET_SYNC_STATUS_PENDING]: state => {
    state.syncStatus = 'pending'
  },
  [SET_SYNC_STATUS_IN_PROGRESS]: state => {
    state.syncStatus = 'in-progress'
  },
  [SET_SYNC_STATUS_COMPLETE]: state => {
    state.syncStatus = 'complete'
  },

  [SET_RPC_ACTIVE]: state => {
    state.isGrpcActive = true
  },

  [BITCOIND_CRASHED]: (state, { code, signal, lastError }) => ({
    ...state,
    ...initialState,
    isBitcoindCrashed: true,
    bitcoindCrashCode: code,
    bitcoindCrashSignal: signal,
    bitcoindCrashLastError: lastError,
  }),

  [BITCOIND_RESET]: state => ({
    ...state,
    ...initialState,
  }),
}

// ------------------------------------
// Selectors
// ------------------------------------

const isStartingBitcoindSelector = state => state.bitcoind.isStartingBitcoind
const isBitcoindRunningSelector = state => state.bitcoind.isBitcoindRunning
const bitcoindSyncStatusSelector = state => state.bitcoind.syncStatus
const blockHeightSelector = state => state.bitcoind.blockHeight
const bitcoindBlockHeightSelector = state => state.bitcoind.bitcoindBlockHeight
const isBitcoindCrashedSelector = state => state.bitcoind.isBitcoindCrashed
const bitcoindCrashCodeSelector = state => state.bitcoind.bitcoindCrashCode
const bitcoindCrashSignalSelector = state => state.bitcoind.bitcoindCrashSignal
const bitcoindCrashLastErrorSelector = state => state.bitcoind.bitcoindCrashLastError

const bitcoindSelectors = {}
bitcoindSelectors.isStartingBitcoind = isStartingBitcoindSelector
bitcoindSelectors.isBitcoindRunning = isBitcoindRunningSelector
bitcoindSelectors.bitcoindSyncStatus = bitcoindSyncStatusSelector
bitcoindSelectors.blockHeight = blockHeightSelector
bitcoindSelectors.bitcoindBlockHeight = bitcoindBlockHeightSelector

bitcoindSelectors.bitcoindSyncPercentage = createSelector(
  blockHeightSelector,
  bitcoindBlockHeightSelector,
  (blockHeight, bitcoindBlockHeight) => {
    const percentage = (bitcoindBlockHeight / blockHeight) * 100

    return Number.isFinite(percentage) ? percentage : undefined
  }
)

bitcoindSelectors.isBitcoindCrashed = isBitcoindCrashedSelector

bitcoindSelectors.bitcoindCrashReason = createSelector(
  bitcoindCrashCodeSelector,
  bitcoindCrashSignalSelector,
  bitcoindCrashLastErrorSelector,
  (code, signal, error) => ({
    code,
    signal,
    error,
  })
)

export { bitcoindSelectors }

export default createReducer(initialState, ACTION_HANDLERS)
