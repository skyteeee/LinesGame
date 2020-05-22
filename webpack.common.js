const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './js/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle-[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.xml$/,
        use: [
          'xml-loader',
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns: ['**/*', '!img*', '!img/*', '!fonts*', '!fonts/*']}),
    new HtmlWebpackPlugin({
      // If you pass a plain object, it will be merged with the default values
      // (New in version 4)
      templateParameters: {
        'version': 'v0.6.0'
      },
      template: 'index.ejs'
    })
  ]
};
