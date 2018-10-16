// 导入工具包
let gulp = require('gulp'),
    GulpCommon = require('../gulp-common'),
    config = require('./gulp.conf'),
    compiler = new GulpCommon('../tsconfig.json', '../global/', config, [
        'typings/*.d', 'reference'
    ]);

let path = config.path;
path.page = path.root + 'pages/';
path.global = path.root;
path.css = path.root + 'css/';
path.module = path.root + 'modules/';


gulp.task('html', function () {
    compiler.gulpTask('index.html', ['index.html'], null, 'index.html', path.global, ['index.html']);
});

/**
 * ------------ css -------------
 */
gulp.task('css', function () {

    const globalArr = [
        'style/*',
        'modules/**/*',
        'pages/**/**/*'
    ];

    compiler.scss(
        'style/*',
        'style.css',
        path.css,
        globalArr
    );

});

/**
 * ------------ css -----------
 */

/**
 * ------------ Js ---------------
 */
function gulpTsModule(src, rname) {
    compiler.ts(GulpCommon.srcPrefix('modules/', src), rname, path.module);
}

function gulpTsPage(src, rname) {
    compiler.ts(GulpCommon.srcPrefix('pages/', src), rname, path.page);
}

gulp.task('js', function () {
    /*page*/
    compiler.ts([
        'common/Config',
        'index',
        'common/*',
        'common/*/*'
    ], 'common.js', path.global);

    gulpTsModule('LeTable/*', 'table-module.js');
    gulpTsModule('query/*', 'query-module.js');
    gulpTsModule('LeButton/*', 'button-module.js');
    gulpTsModule('edit/*', 'edit-module.js');
    gulpTsModule('richText/*', 'richTextModule.js');


    gulpTsPage(['LeBasicPage', 'LeBasicPageHeader', 'common/LeCommonPage'], 'basicPage.js');

    // MainPage
    gulpTsPage('main/*', 'mainPage.js');

    // 首页 HomePage
    gulpTsPage('home/*', 'homePage.js');

    // 登录 LoginPage
    gulpTsPage('loginAndRegist/**/*', 'loginAndRegist.js');

    // 数据分析
    gulpTsPage('dataAnalysis/**/*', 'dataAnalysis.js');

    //hiphop
    gulpTsPage('NoticePage/*', 'NoticePage.js');


    // 活动
    gulpTsPage('activity/**/**/*', 'activity.js');

    // 参数配置 ConfigParamPage
    gulpTsPage('configParam/*', 'configParamPage.js');

    // 系统管理 SysManagerPage
    gulpTsPage('systemManager/*', 'sysManagerPage.js');

    // 学生管理 StuManagerPage
    gulpTsPage('studentManager/*', 'stuManagerPage.js');

    gulpTsModule('reportCard/*', 'reportCard.js');

    /*module*/

    // 修改维度信息
    gulpTsModule('mapDimension/*', 'mapDimension.js');

    // pick
    gulpTsModule('pickModule/*', 'pickModule.js');

    // 学生模型详情
    gulpTsModule('stuModalDetail/*', 'stuModalDetail.js');

    // 权限管理
    gulpTsModule('privilege/*', 'privilege.js');

    // 表格
    gulpTsPage('table/*', 'table.js');

    // 编辑
    gulpTsPage('edit/*', 'editPage.js');

    gulpTsModule('upload/*', 'upload.js');

});

/**
 * ------------ Js ---------------
 */
//定义默认任务
gulp.task('LE_Watch', ['js', 'css', 'html'], function () {

});
//编译所有任务
gulp.task('LE_Start', ['js', 'css', 'html'], function () {
    gulp.start(compiler.allTask);
});

//压缩
gulp.task('LE_Compressor', function () {
    GulpCommon.compressor('css', `${path.root}css/*.css`, `${path.min}css/`);

    GulpCommon.compressor('js', `${path.root}*.js`, path.min);
    GulpCommon.compressor('js', `${path.page}*.js`, `${path.min}pages/`);
    GulpCommon.compressor('js', `${path.module}*.js`, `${path.min}modules/`);

});


//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options]) 处理完后文件生成路径