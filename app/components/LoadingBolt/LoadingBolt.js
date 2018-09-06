import React from 'react'
import PropTypes from 'prop-types'
import Isvg from 'react-inlinesvg'
import { translate } from 'react-i18next'

import cloudboltIcon from 'icons/cloudbolt.svg'

import styles from './LoadingBolt.scss'

const LoadingBolt = ({ t }) => (
  <div className={styles.container}>
    <div className={styles.content}>
      <Isvg className={styles.bolt} src={cloudboltIcon} />
      <h1>{t('loading')}</h1>
    </div>
  </div>
)

LoadingBolt.propTypes = {
  t: PropTypes.func.isRequired
}

export default translate('onboarding')(LoadingBolt)
