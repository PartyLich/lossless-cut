const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


const dev = process.env.NODE_ENV !== 'production';
const outputPath = (dev)
  ? path.resolve(__dirname, 'watch-build')
  : path.resolve(__dirname, 'build');

// Webpack Configuration
const config = {
  target: 'electron-renderer',
  mode: dev ? 'development' : 'production',
  context: path.join(__dirname, 'src'),
  // Entry
  entry: {
    renderer: './renderer.js',
    vendor: [
      'react',
      'react-dom',
      'lodash',
      'bluebird',
    ],
  },
  // Output
  output: {
    path: outputPath,
    filename: '[name].[hash].js',
  },
  // Resolve modules
  resolve: {
    modules: [
      path.resolve('./src'),
      'node_modules',
    ],
  },
  // Loaders
  module: {
    rules: [
      // JavaScript/JSX Files
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      // CSS Files
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it uses publicPath in webpackOptions.output
              // publicPath: '../',
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          // Creates `style` nodes from JS strings
          // 'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      // images and html
      {
        test: /.\.(png|svg|jpg|gif|jshaml)$/,
        use: ['file-loader'],
      },
      // the url-loader uses DataUrls.
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: ['url-loader?limit=10000&mimetype=application/font-woff'],
      },
      // the file-loader emits files.
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: ['file-loader'],
      },
    ],
  },
  // Plugins
  plugins: [
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
      },
    },
  },
  // Development Tools (Map Errors To Source File)
  devtool: dev ? 'source-map' : 'none',
};

const rendererConfig = Object.assign({}, config, {
  target: 'electron-renderer',
  entry: {
    renderer: './renderer.js',
    vendor: [
      'react',
      'react-dom',
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
  ],
});

const mainConfig = Object.assign({}, config, {
  target: 'electron-main',
  entry: {
    index: './index.js',
  },
  output: {
    path: outputPath,
    filename: '[name].js',
  },
});

// Bundle analysis. Avoid unsightly KBs
if (dev) {
  rendererConfig.plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    reportFilename: 'webpack-report.html',
    openAnalyzer: false,
  }));
}


// Exports
module.exports = [
  rendererConfig,
  mainConfig,
];
