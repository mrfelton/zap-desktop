import { combineReducers } from 'redux'
import wallet from 'modules/wallet'

const rootReducer = combineReducers({
  [wallet.store]: wallet.reducer
})

export default rootReducer
