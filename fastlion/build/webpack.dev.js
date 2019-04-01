const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require("./webpack.common");
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const config = require("./config")
    // common.entry.unshift('webpack-hot-middleware/client?noInfo=true&reload=true');
    // common.entry.unshift("babel-polyfill")
    // common.entry.unshift("react-hot-loader/patch");
common.entry.whm = 'webpack-hot-middleware/client?noInfo=true&reload=true';
common.entry.bp = "babel-polyfill";
common.entry.rhl = "react-hot-loader/patch";
module.exports = merge(common, {
    mode: "development",
    devtool: 'source-map',
    module: {
        rules: [{
            // 用正则去匹配要用该 loader 转换的 CSS 文件
            test: /\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
        }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new OpenBrowserPlugin({ url: 'http://localhost:' + config.server.port })
    ]
})