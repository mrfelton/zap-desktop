import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import styles from './ConnectionConfirm.scss'

const ConnectionConfirm = ({ t, connectionHost }) => (
  <div className={styles.container}>
    <p>
      {t('verify_host_title')}
      <span className={styles.host}>{connectionHost.split(':')[0]}</span>?{' '}
    </p>
    <p>
      <strong>{t('verify_host_description')}</strong>
    </p>
  </div>
)

ConnectionConfirm.propTypes = {
  t: PropTypes.func.isRequired,
  connectionHost: PropTypes.string.isRequired
}

export default translate('onboarding')(ConnectionConfirm)
