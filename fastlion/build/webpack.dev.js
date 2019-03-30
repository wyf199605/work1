const webpack = require('webpack');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');
const merge = require('webpack-merge');
const common = require("./webpack.common");
common.entry.unshift('webpack-hot-middleware/client');
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
        new HotModuleReplacementPlugin()
    ]
})