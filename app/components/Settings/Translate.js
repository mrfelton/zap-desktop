import React from 'react'
import PropTypes from 'prop-types'

import { translate } from 'react-i18next'
import FaAngleLeft from 'react-icons/lib/fa/angle-left'
import Isvg from 'react-inlinesvg'
import checkIcon from 'icons/check.svg'
import ISO6391 from 'iso-639-1'
import styles from './Translate.scss'

const Translate = ({ i18n, disableSubMenu }) => {
  const changeLanguage = lng => {
    i18n.changeLanguage(lng)
  }

  return (
    <div>
      <header className={styles.submenuHeader} onClick={disableSubMenu}>
        <FaAngleLeft />
        <span>Language</span>
      </header>
      <ul className={styles.languages}>
        {Object.keys(i18n.options.resources)
          .filter(lang => lang !== 'dev')
          .map(lang => {
            return (
              <li
                key={lang}
                className={i18n.languages.includes(lang) ? styles.active : ''}
                onClick={() => changeLanguage(lang)}
              >
                <span>{ISO6391.getName(lang.split('-')[0])}</span>
                {i18n.languages.includes(lang) && <Isvg src={checkIcon} />}
              </li>
            )
          })}
      </ul>
    </div>
  )
}

Translate.propTypes = {
  i18n: PropTypes.object.isRequired,
  disableSubMenu: PropTypes.func.isRequired
}

export default translate()(Translate)
