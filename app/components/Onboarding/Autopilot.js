import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import FaCircle from 'react-icons/lib/fa/circle'
import FaCircleThin from 'react-icons/lib/fa/circle-thin'
import styles from './Autopilot.scss'

const Autopilot = ({ t, autopilot, setAutopilot }) => (
  <div className={styles.container}>
    <section className={`${styles.enable} ${autopilot ? styles.active : undefined}`}>
      <div onClick={() => setAutopilot(true)}>
        {autopilot ? <FaCircle /> : <FaCircleThin />}
        <span className={styles.label}>{t('enable')} Autopilot</span>
      </div>
    </section>
    <section
      className={`${styles.disable} ${
        !autopilot && autopilot !== null ? styles.active : undefined
      }`}
    >
      <div onClick={() => setAutopilot(false)}>
        {!autopilot && autopilot !== null ? <FaCircle /> : <FaCircleThin />}
        <span className={styles.label}>{t('disable')} Autopilot</span>
      </div>
    </section>
  </div>
)

Autopilot.propTypes = {
  t: PropTypes.func.isRequired,
  autopilot: PropTypes.bool,
  setAutopilot: PropTypes.func.isRequired
}

export default translate('onboarding')(Autopilot)
