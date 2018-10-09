import React from 'react'
import PropTypes from 'prop-types'
import wallet from 'modules/wallet'
import { connect } from 'react-redux'

// Create a compooent that we use to initialise the redux state with data from the database.
// In the actual app, this would be done in the App component.
class DumyApp extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    fetch: PropTypes.func.isRequired,
    setCurrentWallet: PropTypes.func.isRequired
  }
  componentDidMount() {
    const { fetch, setCurrentWallet } = this.props
    fetch()
    setCurrentWallet({ id: 'd2a3594c-d695-4870-a8df-8eddbd197db1' })
  }
  render() {
    const { children } = this.props
    return children
  }
}
const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(wallet.creators.fetch()),
    setCurrentWallet: walletId => dispatch(wallet.creators.setCurrentWallet(walletId))
  }
}

export const DumyAppContainer = connect(
  null,
  mapDispatchToProps
)(DumyApp)
