import { dirname, join } from 'path'
import isDev from 'electron-is-dev'
import appRootPath from '@zap/utils/appRootPath'

/**
 * bitcoindBinaryPath - Get the OS specific path to the bitcoind binary.
 *
 * @returns {string} Path to the bitcoind binary
 */
const bitcoindBinaryPath = () => {
  return isDev
    ? join(dirname(require.resolve('bitcoind-binary/package.json')), 'vendor/bitcoin/bin/bitcoind')
    : join(appRootPath(), 'resources', 'bin', 'bitcoind')
}

export default bitcoindBinaryPath
