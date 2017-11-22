/*
 Copyright (C) 2017 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const _ = require('lodash');
const path = require('path');
const ENV = process.env;
const isProd = ENV.NODE_ENV === 'production';
var BundleAnalyzerPlugin;

const STATIC_FOLDER = '/static/';

module.exports = function (env) {
  const extractSass = new ExtractTextPlugin({
    filename: isProd ? '[name].[chunkhash].css' : '[name].css',
    allChunks: true,
    // disable: isDev
  });
  const config = {
    entry: {
      vendor: 'entrypoints/vendor',
      styles: 'entrypoints/styles',
      dashboard: ['entrypoints/dashboard'].concat(getExtraModules())
        .concat(['entrypoints/dashboard/bootstrap']),
      login: 'entrypoints/login',
    },
    output: {
      filename: isProd ? '[name].[chunkhash].js' : '[name].js',
      sourceMapFilename: '[file].map',
      path: path.join(__dirname, './src/ggrc/static/'),
      publicPath: STATIC_FOLDER,
    },
    module: {
      rules: [{
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        include: /node_modules/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[hash:8].[ext]',
          }
        }],
      }, {
        test: /\.css$/,
        use: extractSass.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
          },
        }),
      }, {
        test: /\.(png|jpe?g|gif)$/,
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, 'src', 'ggrc', 'assets', 'images'),
          path.resolve(__dirname, 'third_party'),
        ],
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }],
      }, {
        test: /\.svg$/,
        include: [
          path.resolve(__dirname, 'src', 'ggrc', 'assets', 'images'),
        ],
        use: [{
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]?[hash:8]'
          }
        }],
      }, {
        test: /\.ico$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }],
      }, {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [{
            loader: 'css-loader',
          }, {
            loader: 'sass-loader',
          }],
          fallback: 'style-loader',
        }),
      }, {
        test: /wysihtml5-0\.4\.0pre\.js$/,
        loader: 'exports-loader?wysihtml5',
      }, {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery',
        }, {
          loader: 'expose-loader',
          options: '$',
        }],
      }, {
        test: /\.mustache/,
        loader: 'raw-loader',
      }, {
        test: /\.js$/,
        exclude: /(node_modules|third_party)/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
        },
      }],
    },
    devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
    resolve: {
      modules: ['node_modules', 'third_party']
        .map(function (dir) {
          return path.join(__dirname, dir);
        }),
      alias: {
        can: 'canjs/amd/can/',
        entrypoints: './src/ggrc/assets/javascripts/entrypoints',
      },
    },
    plugins: [
      extractSass,
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        _: 'lodash',
        moment: 'moment',
      }),
      new webpack.DefinePlugin({
        GGRC_SETTINGS_MODULE: JSON.stringify(process.env.GGRC_SETTINGS_MODULE),
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new ManifestPlugin({
        publicPath: STATIC_FOLDER,
      }),
      new WebpackShellPlugin({
        onBuildEnd: ['cp src/ggrc/static/manifest.json src/ggrc/manifest.json'],
      }),
    ],
    stats: {
      errorDetails: true,
    },
  };

  if (isProd) {
    config.plugins.push(new UglifyJSPlugin({
      sourceMap: true,
      output: {
        comments: false,
        beautify: false,
      },
    }));

    config.plugins.push(new CleanWebpackPlugin(['./src/ggrc/static/'], {
      exclude: ['dashboard-templates*'],
    }));
  }

  if (env && env.debug) {
    BundleAnalyzerPlugin =
      require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    config.plugins.push(new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
    }));
  }

  return config;
};

function getExtraModules() {
  var modules = ENV.GGRC_SETTINGS_MODULE.split(' ');

  return _.compact(_.map(modules, function (module) {
    var name;
    if (/^ggrc/.test(module)) {
      name = module.split('.')[0];
    }

    if (!name) {
      return '';
    }
    return './src/' + name + '/assets/javascripts';
  }));
}
