const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const common = require("./webpack.common.js");
const cleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const env = {
    NODE_ENV: '"production"'
}
module.exports = merge(common, {
    module: {
        rules: [{
            // 用正则去匹配要用该 loader 转换的 CSS 文件
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                publicPath: "../",
                fallback: 'style-loader',
                use: ['css-loader', 'sass-loader']
            })
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': env
        }),
        new cleanWebpackPlugin(),
        new ExtractTextPlugin({
            filename: "css/[name].[contenthash].css",
            allChunks: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module, count) {
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                )
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vendor']
        }),
        // new BundleAnalyzerPlugin(
        //     {
        //         analyzerMode: 'server',
        //         analyzerHost: '127.0.0.1',
        //         analyzerPort: 8888,
        //         reportFilename: 'report.html',
        //         defaultSizes: 'parsed',
        //         openAnalyzer: true,
        //         generateStatsFile: false,
        //         statsFilename: 'stats.json',
        //         statsOptions: null,
        //         logLevel: 'info'
        //     }
        // ),
    ]
})