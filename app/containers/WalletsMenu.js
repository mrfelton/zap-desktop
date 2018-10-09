import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import WalletsMenu from 'components/WalletsMenu'
import wallet from 'modules/wallet'

// Configure state mapping for redux connect.
const mapStateToProps = state => {
  return {
    wallets: wallet.selectors.getWalletsState(state)
  }
}

// Configure dispatch mapping for redux connect.
const mapDispatchToProps = dispatch => {
  return {
    openWalletSettings: walletId => dispatch(wallet.creators.openWalletSettings(walletId))
  }
}

// Export connected component.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(WalletsMenu))
