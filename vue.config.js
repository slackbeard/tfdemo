const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Tensorflow Demo',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
  },
  publicPath: process.env.NODE_ENV == 'production'? '/tfdemo/':'/',
  chainWebpack(config) {

    config.plugin('CompressionPlugin')
      .use(
      CompressionPlugin,
      [{
        test: /\.js$/i,
      }]
      );
    config.devtool('source-map');
  }
};
