# 前端技术选型
 
 ---

### 1.css预处理器--Sass

### 2.去除btl模板，使用html

### 3.typescript

### 4.gulp构建工具

### 5.建议使用Swagger文档
 
 swagger的一个最大的优点是能实时同步api于文档，可提供模型备注，调试，方便前后端的调试沟通

![avatar](https://img-blog.csdn.net/20170913134633389?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdHVwb3NreQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

### 6.建议使用TSLint  

  >typescript格式验证工具

  规则配置，能自动检查，并提示错误


 ### 7.考虑使用Webpack

 Webpack 是一个打包模块化 JavaScript 的工具，在 Webpack 里一切文件皆模块，通过 Loader 转换文件，通过 Plugin 注入钩子，最后输出由多个模块组合成的文件。Webpack 专注于构建模块化项目。

 Webpack的优点是：

* 专注于处理模块化的项目，无需像目前gulp需要打包出各个模块的包

* 方便配置出不同的环境,在开发环境启动实时预览，sourcemap等，生产环境下开启代码压缩等

* 提供DevServer，除了通过重新刷新整个网页来实现实时预览，DevServer 还有一种被称作模块热替换的刷新技术。 模块热替换能做到在不重新加载整个网页的情况下，通过将被更新过的模块替换老的模块，再重新执行一次来实现实时预览