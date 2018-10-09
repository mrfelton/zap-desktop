import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import WalletUnlocker from 'components/WalletUnlocker'
import wallet from 'modules/wallet'

// Configure state mapping for redux connect.
const mapStateToProps = state => {
  return {
    wallet: wallet.selectors.getCurrentWallet(state)
  }
}

// Configure dispatch mapping for redux connect.
const mapDispatchToProps = dispatch => {
  return {
    unlockWallet: settings => dispatch(wallet.creators.unlockWallet(settings))
  }
}

// Export connected component.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(WalletUnlocker))
