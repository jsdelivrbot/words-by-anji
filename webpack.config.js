/* eslint-disable import/no-commonjs */

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const PORT = 3000;

const babelrc = JSON.parse(
  fs.readFileSync(path.join(__dirname, '.babelrc'), 'utf-8').toString()
);

const entry = ['./www/client/src/index.js'];

module.exports = (env = { NODE_ENV: 'production' }) => ({
  devtool: 'source-map',
  entry: entry,
  output: {
    path: path.resolve(__dirname, 'www/client/dist'),
    publicPath: 'www/client/dist/',
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(env.NODE_ENV) },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use:
          [
            {
              loader: 'babel-loader',
              options: babelrc,
            },
          ],
      },
      {
        test: /\.(bmp|gif|jpg|jpeg|png|svg|webp|ttf|otf)$/,
        use: { loader: 'url-loader', options: { limit: 25000 } },
      },
    ],
  }
});
