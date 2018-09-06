import i18n from 'i18next'
import LanguageDetector from 'i18next-electron-language-detector'
import { reactI18nextModule } from 'react-i18next'

import resources from './locales'

i18n
  .use(LanguageDetector)
  .use(reactI18nextModule)
  .init({
    fallbackLng: 'en-US',

    resources,

    // lng: 'es-ES', //FIXME: testing only.

    ns: [
      'activity',
      'add_funds',
      'connect_manually',
      'invoice_modal',
      'network',
      'notifications',
      'onboarding',
      'payment_form',
      'payment_modal',
      'receive_modal',
      'request_form',
      'settings',
      'syncing',
      'wallet',
      'translation'
    ],

    debug: true,

    interpolation: {
      escapeValue: false // not needed for react!!
    },

    react: {
      wait: true
    }
  })

export default i18n
