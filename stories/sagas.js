import * as wallet from 'sagas/walletSagas'

const sagas = { ...wallet }

export default function registerSagas(middleware) {
  for (let name in sagas) {
    middleware.run(sagas[name])
  }
}
