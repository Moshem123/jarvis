import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import baseConfig from './base.config.babel.js';

export default baseConfig({
    output: {
        publicPath: '/',
        path: path.resolve(process.cwd(), 'dist'),
        filename: '[name].[chunkhash].js',
    },
    devtool: 'source-map',
    performance: {
        assetFilter: (assetFilename) => !(/(\.map$)|(^(app\.|favicon\.))/.test(assetFilename)),
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        // Minify and optimize the index.html
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
            inject: true,
        }),
        // Hash the files using MD5 so that their names change when the content changes.
        new WebpackMd5Hash(),
        // Bundle CSS
        new ExtractTextPlugin('[name].[chunkhash].css'),
        // Bundle vendor files
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: '[name].[chunkhash].js',
            minChunks: (module) => {
                return typeof module.userRequest === 'string' && !!module.userRequest.split('!').pop().match(/(node_modules|b‌​ower_components|libr‌​aries)/);
            }
        }),
        // Minify JS
        new UglifyJsPlugin({
            sourceMap: true,
        }),
    ],
});