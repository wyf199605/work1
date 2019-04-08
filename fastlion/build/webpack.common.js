const webpack = require('webpack');
const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
    entry: {
        pc: path.resolve(__dirname, '../src/main.pc.tsx'),
        mb: path.resolve(__dirname, '../src/main.mb.tsx')
    },
    output: {
        filename: 'js/[name].[hash:7].js',
        path: path.resolve(__dirname, '../dist'),
        chunkFilename: 'js/[name].[chunkhash:5].chunk.js', // chunk文件名字
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [{
            // 用正则去匹配要用该 loader 转换的 tsx 文件
            test: /\.(tsx|ts)$/,
            exclude: /node_modules/,
            use: [
                { loader: 'babel-loader' },
                { loader: "ts-loader" }
            ]
        }, {
            test: /\.(png|svg|jpg|gif)$/,
            use: [{
                loader: 'url-loader', //是指定使用的loader和loader的配置参数
                options: {
                    limit: 500, //是把小于500B的文件打成Base64的格式，写入JS
                    name: 'images/[name]_[hash:7].[ext]'
                }
            }]
        }]
    },
    plugins: [
        new WebpackNotifierPlugin(),
        new HtmlWebpackPlugin({
            chunks: ['pc', 'vendor', 'manifest'],
            filename: 'index.pc.html',
            template: path.resolve(__dirname, '../index.pc.html'),
            inject: true
        }),
        new HtmlWebpackPlugin({
            chunks: ['mb', 'vendor', 'manifest'],
            filename: 'index.mb.html',
            template: path.resolve(__dirname, '../index.mb.html'),
            inject: true
        }),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, "../index.html"),
            to: path.resolve(__dirname, "../dist")
        }])
    ]
}