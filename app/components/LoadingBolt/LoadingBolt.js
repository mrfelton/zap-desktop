import React from 'react'
import Isvg from 'react-inlinesvg'
import { I18n } from 'react-i18next'

import cloudboltIcon from 'icons/cloudbolt.svg'

import styles from './LoadingBolt.scss'

const LoadingBolt = () => (
  <I18n>
    {t => (
      <div className={styles.container}>
        <div className={styles.content}>
          <Isvg className={styles.bolt} src={cloudboltIcon} />
          <h1>{t('loading')}</h1>
        </div>
      </div>
    )}
  </I18n>
)

export default LoadingBolt
