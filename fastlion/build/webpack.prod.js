const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require("./webpack.common.js");
const config=require("./config");
const cleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
module.exports = merge(common, {
    mode: "production",
    stats:config.stats,
    module: {
        rules: [{
            test: /\.(css|sass|scss)$/,
            use: [{
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: '../'
                }
            },
            {
                loader: 'css-loader'
            },
            {
                loader: 'postcss-loader',
                options: {
                    plugins: () => [
                        require('autoprefixer')
                    ]
                }
            },
            {
                loader: 'sass-loader'
            }
            ]
        },]
    },
    plugins: [
        new cleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/[name]_[hash:7].css",
        })
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: false
                }
            }),
            new OptimizeCssAssetsPlugin()
        ],
        runtimeChunk: {
            name: "manifest"
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all",
                    minChunks: 1
                }
            }
        }
    },
})