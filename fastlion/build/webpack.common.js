const webpack = require('webpack');
const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: [
        path.resolve(__dirname, '../src/index.tsx')
    ],
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, '../dist')
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [{
            // 用正则去匹配要用该 loader 转换的 tsx 文件
            test: /\.tsx$/,
            use: [
                {loader:'babel-loader'},
                {loader:"ts-loader"}
            ],
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
            filename: 'index.html',
            template: 'index.html',
            inject: true
        })
    ]
}