module.exports = {
    /*
    * 配置如何生成requirejs的配置文件,不用修改;
    * 生成filename文件
    **/
    "requireConfig": {
        "filename": "require.config.js",
        // "modules":["Search", "drillPage",""],
        // "files":["basicPage.js", ""]
    },
    /*
   * 编译到的文件夹, 不用修改
   * */
    "path": {
        "root": '../../dist/develop/',
        "min": '../../dist.min/develop/',
    },
    /*
    * 生成btl需要引入的文件版本号
    * filename => 文件地址
    * src => 生成指定模块地址
    * require.config.js => 生成require.config.js地址
    * */
    // "btl": {
        //filename不需要改
        // "filename": "blueWhale.fn",
        // // 这个要成自己的btl目录,文件名不要改
        // // 并且这个是一个数组, 一般需要填两个, 一个是btl的目录, 另一个是btl编译之后的目录,
        // // 因为直接修改文件, 后台不会自动编译, 所以我们生成两份
        // "dirs": ["../../../html/func/srcfiles/"],
        // // btl需要引用的文件, 一般不需要改
        // "src": {'blue-whale':["app.mb.css", "app.pc.css"]},
        // // btl中的requirejs 引用, 这个不用改
        // "require.config.js":'blue-whale/require.config.js'
    // },
};