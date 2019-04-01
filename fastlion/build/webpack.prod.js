const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require("./webpack.common.js");
const cleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin=require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin=require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = merge(common, {
    mode: "production",
    module: {
        rules: [ {
            test: /\.(css|sass|scss)$/,
            use: [
                {
                    loader:MiniCssExtractPlugin.loader,
                    options:{
                        publicPath: '../'
                    }
                },
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 2,
                        sourceMap: false
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => [
                            require('autoprefixer')
                        ],
                        sourceMap: false
                    }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: false
                    }
                }
            ]
    },]
    },
    plugins: [
        new cleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
        })
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: false
                }
            })
        ],
        runtimeChunk: {
            name: "manifest"
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }
    },
})