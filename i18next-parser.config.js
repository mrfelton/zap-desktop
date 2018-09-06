module.exports = {
  lexers: {
    js: ['JsxLexer']
  },

  locales: [
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
  ],

  output: 'app/locales/$LOCALE/$NAMESPACE.json',

  input: ['app/components/**/*.js', 'app/containers/**/*.js', 'app/routes/**/*.js'],

  reactNamespace: true,

  verbose: true
}
