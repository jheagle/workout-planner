const babelConfig = require('js-build-tools/babel.config')
babelConfig.plugins.push(require.resolve('@babel/plugin-proposal-throw-expressions'))
module.exports = babelConfig
