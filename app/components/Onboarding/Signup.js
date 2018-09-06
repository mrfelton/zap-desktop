import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import FaCircle from 'react-icons/lib/fa/circle'
import FaCircleThin from 'react-icons/lib/fa/circle-thin'
import styles from './Signup.scss'

const Signup = ({ t, signupForm, setSignupCreate, setSignupImport }) => (
  <div className={styles.container}>
    <section className={`${styles.enable} ${signupForm.create ? styles.active : undefined}`}>
      <div onClick={setSignupCreate}>
        {signupForm.create ? <FaCircle /> : <FaCircleThin />}
        <span className={styles.label}>{t('signup_create')}</span>
      </div>
    </section>
    <section className={`${styles.disable} ${signupForm.import ? styles.active : undefined}`}>
      <div onClick={setSignupImport}>
        {signupForm.import ? <FaCircle /> : <FaCircleThin />}
        <span className={styles.label}>{t('signup_import')}</span>
      </div>
    </section>
  </div>
)

Signup.propTypes = {
  t: PropTypes.func.isRequired,
  signupForm: PropTypes.object.isRequired,
  setSignupCreate: PropTypes.func.isRequired,
  setSignupImport: PropTypes.func.isRequired
}

export default translate('onboarding')(Signup)
