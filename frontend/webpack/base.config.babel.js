import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';

const isProd = process.env.NODE_ENV === 'production';

export default function (options) {
  return ({
    entry: { app: './src/index' },
    output: options.output,
    devtool: options.devtool,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: ['babel-loader', 'eslint-loader'],
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{ loader: 'css-loader', options: { minimize: process.env.NODE_ENV === 'production' } }]
          })
        },
        {
          test: /\.scss$/, use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{
              loader: 'css-loader',
              options: { minimize: isProd, importLoaders: 1 }
            }, { loader: 'sass-loader' }]
          }),
        },
        { test: /\.jpe?g$|\.gif$|\.png$/, loader: 'url-loader?limit=100000?name=./images/[name].[ext]?[hash]' },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url-loader?limit=10000&mimetype=application/font-woff&name=./fonts/[name].[ext]?[hash]"
        },
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "file-loader?name=./fonts/[name].[ext]?[hash]"
        },
      ],
    },
    plugins: options.plugins.concat([
      // Clear out `build` directory between builds
      new CleanWebpackPlugin(['dist'], {
        root: process.cwd(),
      }),
      // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
      // inside your code for any environment checks; UglifyJS will automatically
      // drop any unreachable code.
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        },
      }),
    ]),
    devServer: options.devServer || {},
    target: 'web', // Make web variables accessible to webpack, e.g. window
    performance: options.performance || {},
  });
}