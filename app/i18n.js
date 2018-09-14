import { app, remote } from 'electron'
import { addLocaleData } from 'react-intl'

// Fetch locale data.
import bgLocaleData from 'react-intl/locale-data/bg'
import csLocaleData from 'react-intl/locale-data/cs'
import deLocaleData from 'react-intl/locale-data/de'
import elLocaleData from 'react-intl/locale-data/el'
import enLocaleData from 'react-intl/locale-data/en'
import esLocaleData from 'react-intl/locale-data/es'
import frLocaleData from 'react-intl/locale-data/fr'
import hrLocaleData from 'react-intl/locale-data/hr'
import jaLocaleData from 'react-intl/locale-data/ja'
import nlLocaleData from 'react-intl/locale-data/nl'
import ptLocaleData from 'react-intl/locale-data/pt'
import roLocaleData from 'react-intl/locale-data/ro'
import ruLocaleData from 'react-intl/locale-data/ru'
import svLocaleData from 'react-intl/locale-data/sv'
import trLocaleData from 'react-intl/locale-data/tr'
import ukLocaleData from 'react-intl/locale-data/uk'
import zhLocaleData from 'react-intl/locale-data/zh'

// Fetch translation data.
import bgTranslationMessages from './translations/bg.json'
import csTranslationMessages from './translations/cs.json'
import deTranslationMessages from './translations/de.json'
import elTranslationMessages from './translations/el.json'
import enTranslationMessages from './translations/en.json'
import esTranslationMessages from './translations/es.json'
import frTranslationMessages from './translations/fr.json'
import hrTranslationMessages from './translations/hr.json'
import jaTranslationMessages from './translations/ja.json'
import nlTranslationMessages from './translations/nl.json'
import ptTranslationMessages from './translations/pt.json'
import roTranslationMessages from './translations/ro.json'
import ruTranslationMessages from './translations/ru.json'
import svTranslationMessages from './translations/sv.json'
import trTranslationMessages from './translations/tr.json'
import ukTranslationMessages from './translations/uk.json'
import zhTranslationMessages from './translations/zh.json'

// Add locale data for each supported locale.
addLocaleData(enLocaleData)
addLocaleData(deLocaleData)
addLocaleData(bgLocaleData)
addLocaleData(zhLocaleData)
addLocaleData(hrLocaleData)
addLocaleData(csLocaleData)
addLocaleData(nlLocaleData)
addLocaleData(frLocaleData)
addLocaleData(elLocaleData)
addLocaleData(jaLocaleData)
addLocaleData(ptLocaleData)
addLocaleData(roLocaleData)
addLocaleData(ruLocaleData)
addLocaleData(esLocaleData)
addLocaleData(svLocaleData)
addLocaleData(trLocaleData)
addLocaleData(ukLocaleData)

function getDefaltLocale() {
  // Detect user language.
  let defaultLocale = (app || remote.app).getLocale()

  // If the detected language is not available, strip out any regional component and check again.
  if (!appLocales.includes(defaultLocale)) {
    defaultLocale = defaultLocale.split('-')[0]
  }
  // If we still can't find the users language, default to english.
  if (!appLocales.includes(defaultLocale)) {
    defaultLocale = 'en'
  }
  return defaultLocale
}

// Defaine list of language that we will support.
export const appLocales = [
  'en',
  'bg',
  'zh',
  'hr',
  'cs',
  'nl',
  'fr',
  'de',
  'el',
  'ja',
  'pt',
  'ro',
  'ru',
  'es',
  'sv',
  'tr',
  'uk'
]

export const DEFAULT_LOCALE = getDefaltLocale()

// Collate all translations.
export const translationMessages = {
  en: enTranslationMessages,
  bg: bgTranslationMessages,
  zh: zhTranslationMessages,
  hr: hrTranslationMessages,
  cs: csTranslationMessages,
  nl: nlTranslationMessages,
  fr: frTranslationMessages,
  de: deTranslationMessages,
  el: elTranslationMessages,
  ja: jaTranslationMessages,
  pt: ptTranslationMessages,
  ro: roTranslationMessages,
  ru: ruTranslationMessages,
  es: esTranslationMessages,
  sv: svTranslationMessages,
  tr: trTranslationMessages,
  uk: ukTranslationMessages
}
