/* eslint-disable import/no-commonjs */

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PORT = 3000;

const babelrc = JSON.parse(
  fs.readFileSync(path.join(__dirname, '.babelrc'), 'utf-8').toString()
);

const entry = [ './client/src/index.js' ];

module.exports = (env = { NODE_ENV: 'development' }) => ({
  devtool: 'source-map',
  entry: env.NODE_ENV === 'production'
    ? entry
    : [
      `webpack-dev-server/client?http://localhost:${PORT}`,
      'webpack/hot/only-dev-server',
      ...entry,
    ],
  output: {
    path: path.resolve(__dirname, 'static'),
    publicPath: '/static/',
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(env.NODE_ENV) },
    }),
    new ExtractTextPlugin({ filename: 'styles.css', allChunks: true }),
  ].concat(
    env.NODE_ENV === 'production'
      ? [
        new webpack.LoaderOptionsPlugin({ minimize: true, debug: false }),
        new webpack.optimize.UglifyJsPlugin({
          compress: { warnings: false },
          sourceMap: true,
        }),
      ]
      : [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
      ]
  ),
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          publicPath: '/client/dist',
          fallback: 'style-loader',
          use: [ 'css-loader'],
        }),
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: (
          env.NODE_ENV !== 'production'
            ? [ { loader: 'react-hot-loader' } ]
            : []
          ).concat([
            {
              loader: 'babel-loader',
              options: babelrc,
            },
          ]),
      },
      {
        test: /\.(bmp|gif|jpg|jpeg|png|svg|webp|ttf|otf)$/,
        use: { loader: 'url-loader', options: { limit: 25000 } },
      },
    ],
  },
  devServer: {
    contentBase: '.',
    hot: true,
    port: PORT,
    proxy: env.NODE_ENV !== 'production'
      ? {
       '/api': 'http://localhost:5000'
      }
      : undefined
  },
});
