const path = require('path');

module.exports = {
  entry: {
    background: './src/background/background.js',
    content: './src/content/content.js',
    popup: './src/popup/popup.js',
    options: './src/options/options.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.css']
  },
  devtool: 'source-map',
  // 复制静态资源到 dist 目录
  plugins: [
    // 如果需要复制文件，可以使用 copy-webpack-plugin
  ]
};