const express = require('express');
const webpack = require('webpack');
// 从 webpack.config.js 文件中读取 Webpack 配置
const webpackconfig = require('./webpack.dev.js');
const config=require("./config")
// 实例化一个 Expressjs app
const app = express();

// 用读取到的 Webpack 配置实例化一个 Compiler
const compiler = webpack(webpackconfig);

// 给 app 注册 webpackMiddleware 中间件
app.use(require('webpack-dev-middleware')(compiler, {
  hot: true,
  historyApiFallback: true,
  quiet: false,
  noInfo: false
}));
// 为了支持模块热替换
app.use(require("webpack-hot-middleware")(compiler));

// 启动 HTTP 服务器，监听在 3000 端口
app.listen(config.server.port, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.info('成功监听在 3000');
});