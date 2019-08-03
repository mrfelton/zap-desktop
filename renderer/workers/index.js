import { proxy } from 'comlinkjs'
import proxymise from './proxymise'

const Neutrino = proxy(new Worker(`./neutrino.worker.js`))
const Bitcoind = proxy(new Worker(`./bitcoind.worker.js`))
const ZapGrpc = proxy(new Worker('./grpc.worker.js'))

/**
 * Neutrino worker service singleton instance.
 */
class NeutrinoInstance {
  constructor() {
    if (!NeutrinoInstance.instance) {
      NeutrinoInstance.instance = new Neutrino()
    }
    return NeutrinoInstance.instance
  }
}

export const neutrino = proxymise(new NeutrinoInstance())

/**
 * Bitcoind worker service singleton instance.
 */
class BitcoindInstance {
  constructor() {
    if (!BitcoindInstance.instance) {
      BitcoindInstance.instance = new Bitcoind()
    }
    return BitcoindInstance.instance
  }
}
export const bitcoind = proxymise(new BitcoindInstance())

/**
 * Grpp worker service singleton instance.
 */
class GrpcInstance {
  constructor() {
    if (!GrpcInstance.instance) {
      GrpcInstance.instance = new ZapGrpc()
    }
    return GrpcInstance.instance
  }
}

export const grpc = proxymise(new GrpcInstance())
