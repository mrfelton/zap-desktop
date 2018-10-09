import Duck from 'extensible-duck'
import { createSelector } from 'reselect'
import model from './model'

export default model({ namespace: 'zap', store: 'wallet' }).extend({
  // Action types.
  types: [
    'SET_CURRENT_WALLET',
    'OPEN_WALLET_SETTINGS',
    'SAVE_WALLET_SETTINGS',
    'SAVE_WALLET_SETTINGS_SUCCEEDED',
    'SAVE_WALLET_SETTINGS_FAILED',
    'UNLOCK_WALLET',
    'UNLOCK_WALLET_SUCCEEDED',
    'UNLOCK_WALLET_FAILED'
  ],

  // Reducers.
  reducer: (state, action, duck) => {
    switch (action.type) {
      case duck.types.SET_CURRENT_WALLET:
        return {
          ...state,
          currentItem: action.payload.id
        }

      default:
        return { ...state }
    }
  },

  // Selectors.
  selectors: {
    getWalletsState: state => state.wallet.entities.byId,
    getCurrentWalletState: state => state.wallet.currentItem,
    getCurrentWallet: new Duck.Selector(selectors =>
      createSelector(
        selectors.getWalletsState,
        selectors.getCurrentWalletState,
        (wallets, currentWallet) => wallets[currentWallet]
      )
    )
  },

  // Action creators.
  creators: duck => ({
    setCurrentWallet: payload => ({
      type: duck.types.SET_CURRENT_WALLET,
      payload
    }),
    openWalletSettings: payload => ({
      type: duck.types.OPEN_WALLET_SETTINGS,
      payload
    }),

    saveWalletSettings: payload => ({
      type: duck.types.SAVE_WALLET_SETTINGS,
      payload
    }),
    saveWalletSettingsSucceeded: payload => ({
      type: duck.types.SAVE_WALLET_SETTINGS_SUCCEEDED,
      payload
    }),
    saveWalletSettingsFailed: payload => ({
      type: duck.types.SAVE_WALLET_SETTINGS_FAILED,
      payload
    }),

    unlockWallet: payload => ({
      type: duck.types.UNLOCK_WALLET,
      payload
    }),
    unlockWalletSucceeded: payload => ({
      type: duck.types.UNLOCK_WALLET_SUCCEEDED,
      payload
    }),
    unlockWalletFailed: payload => ({
      type: duck.types.UNLOCK_WALLET_FAILED,
      payload
    })
  })
})
