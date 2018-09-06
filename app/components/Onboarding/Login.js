import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import styles from './Login.scss'

const Login = ({
  t,
  password,
  updatePassword,
  unlockingWallet,
  unlockWallet,
  unlockWalletError
}) => (
  <div className={styles.container}>
    <input
      type="password"
      placeholder="Password"
      className={`${styles.password} ${unlockWalletError.isError ? styles.inputError : undefined}`}
      ref={input => input && input.focus()}
      value={password}
      onChange={event => updatePassword(event.target.value)}
      onKeyPress={event => {
        if (event.key === 'Enter') {
          unlockWallet(password)
        }
      }}
    />
    <p className={`${unlockWalletError.isError ? styles.active : undefined} ${styles.error}`}>
      {unlockWalletError.message}
    </p>

    <section className={styles.buttons}>
      <div>
        <span
          className={`${!unlockingWallet ? styles.active : undefined} ${styles.button}`}
          onClick={() => unlockWallet(password)}
        >
          {unlockingWallet ? <i className={styles.spinner} /> : t('unlock')}
        </span>
      </div>
    </section>
  </div>
)

Login.propTypes = {
  t: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  updatePassword: PropTypes.func.isRequired,
  unlockingWallet: PropTypes.bool.isRequired,
  unlockWallet: PropTypes.func.isRequired,
  unlockWalletError: PropTypes.object.isRequired
}

export default translate('onboarding')(Login)
