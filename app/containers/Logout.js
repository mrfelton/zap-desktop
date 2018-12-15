import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { stopLnd } from 'reducers/lnd'
import { resetApp } from 'reducers/app'
import { setIsWalletOpen } from 'reducers/wallet'

/**
 * Root component that deals with mounting the app and managing top level routing.
 */
class Logout extends React.Component {
  static propTypes = {
    resetApp: PropTypes.func.isRequired,
    setIsWalletOpen: PropTypes.func.isRequired,
    stopLnd: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    })
  }

  async componentDidMount() {
    const { history, resetApp, setIsWalletOpen, stopLnd } = this.props
    stopLnd()
    setIsWalletOpen(false)
    resetApp()
    history.push('/')
  }

  render() {
    return null
  }
}

const mapDispatchToProps = {
  resetApp,
  stopLnd,
  setIsWalletOpen
}

export default connect(
  null,
  mapDispatchToProps
)(withRouter(Logout))
