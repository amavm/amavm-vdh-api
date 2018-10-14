const path = require('path');
const slsw = require('serverless-webpack');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const entries = {};

Object.keys(slsw.lib.entries).forEach(key => (
  entries[key] = ['./build/source-map-install.js', slsw.lib.entries[key]]
));

module.exports = {
  entry: entries,
  devtool: slsw.lib.webpack.isLocal ? 'eval-source-map' : '',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  target: 'node',
  stats: slsw.lib.webpack.isLocal ? 'normal' : 'minimal',
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.ts'
    ],
    plugins: [
      new TsconfigPathsPlugin()
    ],
    alias: {
      'handlebars' : 'handlebars/dist/handlebars.js'
    }
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/pem/, undefined),
    new webpack.ContextReplacementPlugin(/require_optional/, undefined),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true })
  ],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  module: {
    rules: [
      { loader: 'cache-loader' },
      { loader: 'thread-loader', options: { workers: require('os').cpus().length - 1 } },
      { loader: 'ts-loader', options: { happyPackMode: true } }
    ],
  },
  externals: {
    "aws-sdk": "aws-sdk"
  }
};
