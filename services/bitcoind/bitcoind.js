import split2 from 'split2'
import EventEmitter from 'events'
import { normalize } from 'path'
import { promisify } from 'util'
import { mkdir } from 'fs'
import { spawn } from 'child_process'
import delay from '@zap/utils/delay'
import { mainLog, bitcoindLog } from '@zap/utils/log'
import fetchBlockHeight from '@zap/utils/fetchBlockHeight'

const mkdirAsync = promisify(mkdir)

// Sync statuses.
export const BITCOIND_CHAIN_SYNC_PENDING = 'BITCOIND_CHAIN_SYNC_PENDING'
export const BITCOIND_CHAIN_SYNC_IN_PROGRESS = 'BITCOIND_CHAIN_SYNC_IN_PROGRESS'
export const BITCOIND_CHAIN_SYNC_COMPLETE = 'BITCOIND_CHAIN_SYNC_COMPLETE'

// Events.
export const BITCOIND_SHUTDOWN = 'BITCOIND_SHUTDOWN'
export const BITCOIND_ERROR = 'BITCOIND_ERROR'
export const BITCOIND_EXIT = 'BITCOIND_EXIT'
export const BITCOIND_RPC_ACTIVE = 'BITCOIND_RPC_ACTIVE'
export const BITCOIND_GOT_CURRENT_BLOCK_HEIGHT = 'BITCOIND_GOT_CURRENT_BLOCK_HEIGHT'
export const BITCOIND_GOT_BITCOIND_BLOCK_HEIGHT = 'BITCOIND_GOT_BITCOIND_BLOCK_HEIGHT'

// Constants.
export const BITCOIND_SHUTDOWN_TIMEOUT = 10000

class Bitcoind extends EventEmitter {
  constructor() {
    super()
    this.resetState()
  }

  static incrementIfHigher = (context, property, newVal) => {
    if (Number.isNaN(newVal)) {
      return false
    }
    const { [property]: oldVal } = context
    if (newVal > oldVal) {
      context[property] = newVal
      return true
    }
    return false
  }

  /**
   * resetState - Initialise state data.
   */
  resetState() {
    this.process = null
    this.isRpcActive = false
    this.chainSyncStatus = BITCOIND_CHAIN_SYNC_PENDING
    this.currentBlockHeight = 0
    this.bitcoindBlockHeight = 0
    this.lastError = null
  }

  /**
   * init - Initialize the service.
   *
   * @param  {object} bitcoindConfig LndConfig
   */
  init(bitcoindConfig = {}) {
    mainLog.info(`Initializing Bitcoind with options: %o`, bitcoindConfig)
    this.bitcoindConfig = bitcoindConfig
  }

  /**
   * start - Start the Lnd process in Bitcoind mode.
   *
   * @returns {Promise<number>} PID of the Lnd process that was started.
   */
  async start() {
    if (this.getPid()) {
      return Promise.reject(new Error(`Bitcoind process with PID ${this.getPid()} already exists.`))
    }

    const { binaryPath, datadir, network } = this.bitcoindConfig
    mainLog.info('Starting bitcoind with config: %o', this.bitcoindConfig)
    mainLog.info(' > binaryPath', binaryPath)
    mainLog.info(' > datadir', datadir)
    mainLog.info(' > network', network)

    // The height returned from the Bitcoind log output may not be the actual current block height (this is the case
    // when BTCD is still in the middle of syncing the blockchain) so try to fetch thhe current height from from
    // some block explorers so that we have a good starting point.
    fetchBlockHeight('bitcoin', network)
      .then(blockHeight => this.setCurrentBlockHeight(blockHeight))
      .catch(err => mainLog.warn(`Unable to fetch block height: ${err.message}`))

    const bitcoindArgs = await this.getBitcoindArgs()

    // Log the final config.
    mainLog.info('Spawning Bitcoind process: %s %s', normalize(binaryPath), bitcoindArgs.join(' '))

    // Eensure datadir exists
    if (binaryPath) {
      await mkdirAsync(datadir, { recursive: true })
    }

    // Spawn bitcoind process)
    this.process = spawn(normalize(binaryPath), bitcoindArgs)

    // Attach event handlers and output stream processors.
    this.attachEventHandlers(this.process)
    this.attachStderrProcessors(this.process.stderr)
    this.attachStdoutProcessors(this.process.stdout)

    // Rewturn the pid.
    return this.process.pid
  }

  /**
   * shutdown - Shutdown bitcoind process.
   *
   * @param  {object}  [options={}] Shutdown options.
   * @returns {Promise} Promise
   */
  async shutdown(options = {}) {
    const signal = options.signal || 'SIGINT'
    const timeout = options.timeout || BITCOIND_SHUTDOWN_TIMEOUT

    mainLog.info('Shutting down Bitcoind...')
    this.emit(BITCOIND_SHUTDOWN)

    if (!this.getPid()) {
      mainLog.info('No Bitcoind process found.')
      return
    }

    await this._shutdownBitcoind(signal, timeout)
    mainLog.info('Bitcoind shutdown complete.')
  }

  /**
   * _shutdownBitcoind - Attempt to gracefully terminate the bitcoind process. If it fails, force kill it.
   *
   * @param  {string}  signal  process signal
   * @param  {number}  timeout timeout before force killing with SIGKILL
   * @returns {Promise} Promise
   */
  async _shutdownBitcoind(signal, timeout) {
    let hasCompleted = false

    // promisify BITCOIND_EXIT callback.
    const bitcoindExitComplete = new Promise(resolve => {
      this.once(BITCOIND_EXIT, () => {
        hasCompleted = true
        resolve()
      })
    })

    // Force kill process if it has not already exited after `timeout` ms.
    const forceShutdown = async () => {
      await delay(timeout)
      // If graceful shutdown has not completed, we need to force shutdown.
      if (!hasCompleted) {
        mainLog.warn('Graceful shutdown failed to complete within 10 seconds. Killing Bitcoind.')
        this.kill('SIGKILL')
      }
      return bitcoindExitComplete
    }

    // Kill the Bitcoind process (sends `signal` to Bitcoind process).
    this.kill(signal)
    return Promise.race([bitcoindExitComplete, forceShutdown()])
  }

  /**
   * getPid - Get the pid of the currently running bitcoind process.
   *
   * @returns {number|null} PID of currently running bitcoind process.
   */
  getPid() {
    return this.process ? this.process.pid : null
  }

  /**
   * signalName - Stop the Lnd process.
   *
   * @param  {string} [signalName='SIGINT'] signal to kill lnd with.
   */
  kill(signalName = 'SIGINT') {
    if (this.process) {
      mainLog.info('Killing Bitcoind process...')
      this.process.kill(signalName)
    }
  }

  /**
   * is - Check if the current state matches the pasted in state.
   *
   * @param  {string} state State to compare against the current state.
   * @returns {boolean} Boolean indicating if the current state matches the passed in state.
   */
  is(state) {
    return this.chainSyncStatus === state
  }

  /**
   * setState - Set the current state and emit an event to notify others if the state as changed.
   *
   * @param {string} state Target state.
   */
  setState(state) {
    if (state !== this.chainSyncStatus) {
      mainLog.info('Set bitcoind state', state)
      this.chainSyncStatus = state
      this.emit(state)
    }
  }

  /**
   * setCurrentBlockHeight - Set the current block height and emit an event to notify others if it has changed.
   *
   * @param {string|number} height Block height
   */
  setCurrentBlockHeight(height) {
    const heightAsNumber = Number(height)
    const changed = Bitcoind.incrementIfHigher(this, 'currentBlockHeight', heightAsNumber)
    if (changed) {
      mainLog.info('Set current block height', heightAsNumber)
      this.emit(BITCOIND_GOT_CURRENT_BLOCK_HEIGHT, heightAsNumber)
    }
  }

  /**
   * setBitcoindBlockHeight - Set the lnd block height and emit an event to notify others if it has changed.
   *
   * @param {string|number} height Block height
   */
  setBitcoindBlockHeight(height) {
    const heightAsNumber = Number(height)
    const changed = Bitcoind.incrementIfHigher(this, 'bitcoindBlockHeight', heightAsNumber)
    if (changed) {
      mainLog.info('Set bitcoind block height', heightAsNumber)
      this.emit(BITCOIND_GOT_BITCOIND_BLOCK_HEIGHT, heightAsNumber)
      this.setCurrentBlockHeight(heightAsNumber)
    }
  }

  /**
   * getBitcoindArgs - Get arguments to pass to bitcoind based on bitcoind config.
   *
   * @returns {Promise<Array>} Array of arguments
   */
  async getBitcoindArgs() {
    const {
      datadir,
      network,
      server,
      rpcuser,
      rpcpassword,
      zmqpubrawblock,
      zmqpubrawtx,
    } = this.bitcoindConfig

    const bitcoindArgs = [
      `--datadir=${datadir}`,
      `${server ? `--server` : ''}`,
      `${rpcuser ? `--rpcuser=${rpcuser}` : ''}`,
      `${rpcpassword ? `--rpcpassword=${rpcpassword}` : ''}`,
      `${zmqpubrawblock ? `--zmqpubrawblock=${zmqpubrawblock}` : ''}`,
      `${zmqpubrawtx ? `--zmqpubrawtx=${zmqpubrawtx}` : ''}`,
      `${network === 'testnet' ? `--testnet` : ''}`,
    ]

    return bitcoindArgs.filter(v => v != '')
  }

  /**
   * attachEventHandlers - Attach exit and error handlers to bitcoind process.
   *
   * @param  {object} process bitcoind process.
   */
  attachEventHandlers(process) {
    // Attach error handler.
    process.on('error', error => {
      this.lastError = error
      mainLog.error('Bitcoind process received "error" event with error: %s', error)
      this.emit(BITCOIND_ERROR, { error, lastError: this.lastError })
    })

    // Attach exit handler.
    process.on('exit', (code, signal) => {
      mainLog.info(
        'Bitcoind process received "exit" event with code %s and signal %s',
        code,
        signal
      )
      this.emit(BITCOIND_EXIT, { code, signal, lastError: this.lastError })
      this.resetState()
    })
  }

  /**
   * attachStderrProcessors - Listen for and process bitcoind stderr data.
   *
   * @param  {string} stderr log output line
   */
  attachStderrProcessors(stderr) {
    stderr.pipe(split2()).on('data', line => {
      bitcoindLog.error(line)
    })
  }

  /**
   * attachStdoutProcessors - Listen for and process bitcoind stdout data.
   *
   * @param  {string} stdout log output line
   */
  attachStdoutProcessors(stdout) {
    stdout.pipe(split2()).on('data', line => {
      bitcoindLog.debug(line)

      this.notifyRpcActivation(line)

      // If the sync has already completed then we don't need to do any more log processing.
      if (this.is(BITCOIND_CHAIN_SYNC_COMPLETE)) {
        return
      }
      this.notifyOnSyncComplete(line)

      // Listen for things that will take us out of the waiting state.
      if (this.is(BITCOIND_CHAIN_SYNC_PENDING)) {
        this.notifyOnSyncStarted(line)
      }

      // Listen for things that indicate sync progress.
      if (this.is(BITCOIND_CHAIN_SYNC_IN_PROGRESS)) {
        this.notifyOnSyncProgress(line)
      }
    })
  }

  /**
   * notifyRpcActivation - Update state if log line indicates Lightning RPC became active.
   *
   * @param  {string} line log output line
   */
  notifyRpcActivation(line) {
    if (line.includes('init message: Done loading')) {
      this.isRpcActive = true
      this.emit(BITCOIND_RPC_ACTIVE)
    }
  }

  /**
   * notifyOnSyncStarted - Update state if log line indicates sync has started.
   *
   * @param  {string} line log output line
   */
  notifyOnSyncStarted(line) {
    const match = line.match(/height=(\d+)/)
    if (match) {
      this.setState(BITCOIND_CHAIN_SYNC_IN_PROGRESS)
    }
  }

  /**
   * notifyOnSyncComplete - Update state if log line indicates that sync process has completed.
   *
   * @param  {string} line log output line
   */
  notifyOnSyncComplete(line) {
    if (line.includes('progress=1')) {
      this.setState(BITCOIND_CHAIN_SYNC_COMPLETE)
    }
  }

  /**
   * notifyOnSyncProgress - Update state if log line indicates that progress has been made in the sync process.
   *
   * @param  {string} line log output line
   */
  notifyOnSyncProgress(line) {
    let height

    // Check the log line to see if we can parse the current block header height from it.
    height = this.getBlockHeightIncrement(line)
    if (height) {
      this.setBitcoindBlockHeight(height)
    }
  }

  /**
   * getBlockHeightIncrement - Try to determine current block header height from log line.
   *
   * @param  {string}   line log output line
   * @returns {string}      Current block header height, if found
   */
  getBlockHeightIncrement(line) {
    let match, height

    if ((match = line.match(/UpdateTip:.* height=(\d+)/))) {
      height = match[1]
    }

    return height
  }
}

export default Bitcoind
