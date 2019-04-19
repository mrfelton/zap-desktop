import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { appSelectors } from 'reducers/app'
import { initCurrency, initLocale } from 'reducers/locale'
import { initWallets, walletSelectors } from 'reducers/wallet'
import { initNeutrino } from 'reducers/neutrino'
import { startActiveWallet } from 'reducers/lnd'
import { initTickers } from 'reducers/ticker'
import { initAutopay } from 'reducers/autopay'
import { fetchSuggestedNodes, initChannels } from 'reducers/channels'

/**
 * Root component that deals with mounting the app and managing top level routing.
 */
class Initializer extends React.Component {
  static propTypes = {
    activeWallet: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activeWalletSettings: PropTypes.object,
    fetchSuggestedNodes: PropTypes.func.isRequired,
    hasWallets: PropTypes.bool,
    initAutopay: PropTypes.func.isRequired,
    initChannels: PropTypes.func.isRequired,
    initCurrency: PropTypes.func.isRequired,
    initLocale: PropTypes.func.isRequired,
    initNeutrino: PropTypes.func.isRequired,
    initTickers: PropTypes.func.isRequired,
    initWallets: PropTypes.func.isRequired,
    isRootReady: PropTypes.bool.isRequired,
    isWalletOpen: PropTypes.bool,
    lndConnect: PropTypes.string,
  }

  /**
   * Initialize app state.
   */
  componentDidMount() {
    const {
      fetchSuggestedNodes,
      initTickers,
      initLocale,
      initCurrency,
      initWallets,
      initChannels,
      initAutopay,
      initNeutrino,
    } = this.props
    initNeutrino()
    initTickers()
    initLocale()
    initCurrency()
    initAutopay()
    initWallets()
    initChannels()
    fetchSuggestedNodes()
  }

  /**
   * Returns current location based on app initialization state and referrer
   * or null if there is no location change
   */
  getLocation() {
    const {
      activeWallet,
      activeWalletSettings,
      isRootReady,
      isWalletOpen,
      hasWallets,
      lndConnect,
    } = this.props

    // still initializing - no location change
    if (!isRootReady) {
      return null
    }

    // Came here from an lnd connect link
    if (lndConnect) {
      return '/onboarding'
    }

    // we have either an open wallet or active wallet settings
    if (activeWalletSettings) {
      return isWalletOpen ? '/wallet-starter' : `/home/wallet/${activeWallet}`
    }

    // If we have at least one wallet send the user to the homepage.
    // Otherwise send them to the onboarding processes.
    return hasWallets ? '/home' : '/onboarding'
  }

  render() {
    const location = this.getLocation()
    return location && <Redirect to={location} />
  }
}

const mapStateToProps = state => ({
  lndConnect: state.onboarding.lndConnect,
  activeWallet: walletSelectors.activeWallet(state),
  activeWalletSettings: walletSelectors.activeWalletSettings(state),
  hasWallets: walletSelectors.hasWallets(state),
  isWalletOpen: walletSelectors.isWalletOpen(state),
  isRootReady: appSelectors.isRootReady(state),
})

const mapDispatchToProps = {
  startActiveWallet,
  fetchSuggestedNodes,
  initNeutrino,
  initTickers,
  initCurrency,
  initLocale,
  initWallets,
  initAutopay,
  initChannels,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Initializer)
