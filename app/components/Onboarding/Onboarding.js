import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'

import LoadingBolt from 'components/LoadingBolt'

import FormContainer from './FormContainer'
import ConnectionType from './ConnectionType'
import ConnectionDetails from './ConnectionDetails'
import ConnectionConfirm from './ConnectionConfirm'
import BtcPayServer from './BtcPayServer'
import Alias from './Alias'
import Autopilot from './Autopilot'
import Login from './Login'
import Signup from './Signup'
import RecoverForm from './RecoverForm'
import NewWalletSeed from './NewWalletSeed'
import ReEnterSeed from './ReEnterSeed'
import NewWalletPassword from './NewWalletPassword'
import styles from './Onboarding.scss'

const Onboarding = ({
  t,
  onboarding: {
    step,
    previousStep,
    connectionType,
    connectionString,
    connectionHost,
    connectionCert,
    connectionMacaroon,
    alias,
    autopilot,
    startingLnd,
    createWalletPassword,
    seed,
    fetchingSeed
  },
  connectionTypeProps,
  connectionDetailProps,
  connectionConfirmProps,
  changeStep,
  startLnd,
  submitNewWallet,
  recoverOldWallet,
  aliasProps,
  initWalletProps,
  autopilotProps,
  recoverFormProps,
  newWalletSeedProps,
  newWalletPasswordProps,
  reEnterSeedProps
}) => {
  const renderStep = () => {
    switch (step) {
      case 0.1:
        return (
          <FormContainer
            title={t('connection_title')}
            description={t('connection_description')}
            back={null}
            next={() => {
              switch (connectionType) {
                case 'custom':
                  changeStep(0.2)
                  break
                case 'btcpayserver':
                  changeStep(0.3)
                  break
                default:
                  changeStep(1)
              }
            }}
          >
            <ConnectionType {...connectionTypeProps} />
          </FormContainer>
        )

      case 0.2:
        return (
          <FormContainer
            title="Connection details"
            description="Enter the connection details for your Lightning node."
            back={() => changeStep(0.1)}
            next={() => {
              // dont allow the user to move on if we don't at least have a hostname.
              if (!connectionDetailProps.connectionHostIsValid) {
                return
              }

              changeStep(0.4)
            }}
          >
            <ConnectionDetails {...connectionDetailProps} />
          </FormContainer>
        )

      case 0.3:
        return (
          <FormContainer
            title="BTCPay Server"
            description="Enter the connection details for your BTCPay Server node."
            back={() => changeStep(0.1)}
            next={() => {
              // dont allow the user to move on if the connection string is invalid.
              if (!connectionDetailProps.connectionStringIsValid) {
                return
              }

              changeStep(0.4)
            }}
          >
            <BtcPayServer {...connectionDetailProps} />
          </FormContainer>
        )

      case 0.4:
        return (
          <FormContainer
            title="Confirm connection"
            description="Confirm the connection details for your Lightning node."
            back={() => changeStep(previousStep)}
            next={() => {
              startLnd({
                type: connectionType,
                string: connectionString,
                host: connectionHost,
                cert: connectionCert,
                macaroon: connectionMacaroon
              })
            }}
          >
            <ConnectionConfirm {...connectionConfirmProps} />
          </FormContainer>
        )

      case 1:
        return (
          <FormContainer
            title={t('alias_title')}
            description={t('alias_description')}
            back={() => changeStep(0.1)}
            next={() => changeStep(2)}
          >
            <Alias {...aliasProps} />
          </FormContainer>
        )
      case 2:
        return (
          <FormContainer
            title={t('autopilot_title')}
            description={t('autopilot_description')}
            back={() => changeStep(1)}
            next={() => startLnd({ type: connectionType, alias, autopilot })}
          >
            <Autopilot {...autopilotProps} />
          </FormContainer>
        )
      case 3:
        // eslint-disable-next-line no-case-declarations
        let message = 'It looks like you already have a wallet'
        if (initWalletProps.loginProps.existingWalletDir && connectionType === 'local') {
          message += ` (we found one at ${initWalletProps.loginProps.existingWalletDir})`
        } else {
          message += ` at ${connectionHost.split(':')[0]}`
        }
        message += '. Please enter your wallet password to unlock it.'
        return (
          <FormContainer
            title={t('login_title')}
            description={`${message}`}
            back={null}
            next={null}
          >
            <Login {...initWalletProps.loginProps} />
          </FormContainer>
        )
      case 4:
        return (
          <FormContainer
            title="Welcome!"
            description="Looks like you are new here. Set a password to encrypt your wallet. This password will be needed to unlock Zap in the future" // eslint-disable-line max-len
            back={null}
            next={() => {
              // dont allow the user to move on if the confirmation password doesnt match the original password
              // if the password is less than 8 characters or empty dont allow users to proceed
              if (
                newWalletPasswordProps.passwordMinCharsError ||
                !newWalletPasswordProps.createWalletPassword ||
                !newWalletPasswordProps.createWalletPasswordConfirmation ||
                newWalletPasswordProps.showCreateWalletPasswordConfirmationError
              ) {
                return
              }

              changeStep(5)
            }}
          >
            <NewWalletPassword {...newWalletPasswordProps} />
          </FormContainer>
        )
      case 5:
        return (
          <FormContainer
            title={t('signup_title')}
            description={t('signup_description')}
            back={() => changeStep(4)}
            next={() => {
              // require the user to select create wallet or import wallet
              if (
                !initWalletProps.signupProps.signupForm.create &&
                !initWalletProps.signupProps.signupForm.import
              ) {
                return
              }

              changeStep(initWalletProps.signupProps.signupForm.create ? 6 : 5.1)
            }}
          >
            <Signup {...initWalletProps.signupProps} />
          </FormContainer>
        )
      case 5.1:
        return (
          <FormContainer
            title={t('import_title')}
            description={t('import_description')}
            back={() => changeStep(5)}
            next={() => {
              const recoverySeed = recoverFormProps.recoverSeedInput.map(input => input.word)

              recoverOldWallet(createWalletPassword, recoverySeed)
            }}
          >
            <RecoverForm {...recoverFormProps} />
          </FormContainer>
        )
      case 6:
        return (
          <FormContainer
            title={t('save_seed_title')}
            description={t('save_seed_description')}
            back={() => changeStep(5)}
            next={() => changeStep(7)}
          >
            <NewWalletSeed {...newWalletSeedProps} />
          </FormContainer>
        )
      case 7:
        return (
          <FormContainer
            title={t('retype_seed_title')}
            description={`${t('retype_seed_description')} ${reEnterSeedProps.seedIndexesArr[0]}, ${
              reEnterSeedProps.seedIndexesArr[1]
            } and ${reEnterSeedProps.seedIndexesArr[2]}`}
            back={() => changeStep(6)}
            next={() => {
              // don't allow them to move on if they havent re-entered the seed correctly
              if (!reEnterSeedProps.reEnterSeedChecker) {
                return
              }

              submitNewWallet(createWalletPassword, seed)
            }}
          >
            <ReEnterSeed {...reEnterSeedProps} />
          </FormContainer>
        )
      default:
        return <LoadingBolt />
    }
  }

  if (startingLnd) {
    return <LoadingBolt />
  }
  if (fetchingSeed) {
    return <LoadingBolt />
  }

  return <div className={styles.container}>{renderStep()}</div>
}

Onboarding.propTypes = {
  t: PropTypes.func.isRequired,
  onboarding: PropTypes.object.isRequired,
  connectionTypeProps: PropTypes.object.isRequired,
  connectionDetailProps: PropTypes.object.isRequired,
  connectionConfirmProps: PropTypes.object.isRequired,
  aliasProps: PropTypes.object.isRequired,
  autopilotProps: PropTypes.object.isRequired,
  initWalletProps: PropTypes.object.isRequired,
  newWalletSeedProps: PropTypes.object.isRequired,
  newWalletPasswordProps: PropTypes.object.isRequired,
  recoverFormProps: PropTypes.object.isRequired,
  reEnterSeedProps: PropTypes.object.isRequired,
  changeStep: PropTypes.func.isRequired,
  startLnd: PropTypes.func.isRequired,
  submitNewWallet: PropTypes.func.isRequired,
  recoverOldWallet: PropTypes.func.isRequired
}

export default translate('onboarding')(Onboarding)
