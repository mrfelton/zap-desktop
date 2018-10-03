require('babel-register')

const baseConfig = require('../internals/webpack/webpack.config.base')
const merge = require('webpack-merge')

const config = merge.smart(baseConfig, {
  default: {
    module: {
      rules: [
        {
          test: /\.stories\.jsx?$/,
          loaders: [require.resolve('@storybook/addon-storysource/loader')],
          enforce: 'pre',
        }
      ]
    }
  }
})

console.log('config', config)
module.exports = config
