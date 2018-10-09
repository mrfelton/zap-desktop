import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import WalletSettings from 'components/WalletSettings'
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
    saveWalletSettings: settings => dispatch(wallet.creators.saveWalletSettings(settings))
  }
}

// Export connected component.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(WalletSettings))
