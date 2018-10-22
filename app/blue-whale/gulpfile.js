//导入工具包
let gulp = require('gulp'),
    GulpCommon = require('../gulp-common'),
    config = require('./gulp.conf'),
    compiler = new GulpCommon('../tsconfig.json', '../global/', config, [
        'typings/*.d', 'index'
    ]);

let path = config.path;
path.page = path.root + 'pages/';
path.global = path.root;
path.css = path.root + 'css/';
path.module = path.root + 'module/';

/**
 * ------------ css -------------
 */
gulp.task('css', function () {

    const globalArr = [
        'module/**/*',
        'pages/**/*'
    ];

    const pcArr = [
        'style/*.pc',
        'style/**/*.pc',
        'module/**/*.pc',
        'pages/**/*.pc'
    ];

    const mbArr = [
        'style/*.mb',
        'style/**/*.mb',
        'pages/**/*.mb',
        'module/**/*.mb'
    ];

    function not(arr) {
        return arr.map(function (a) {
            return '!' + a;
        })
    }

    compiler.scss(
        'style/app.pc',
        'app.pc.css',
        path.css,
        globalArr.concat(pcArr).concat(not(mbArr))
    );
    compiler.scss(
        'style/app.mb',
        'app.mb.css',
        path.css,
        globalArr.concat(mbArr).concat(not(pcArr))
    );

});

/**
 * ------------ css -----------
 */

/**
 * ------------ Js ---------------
 */
function gulpTsModule(src, rname) {
    compiler.ts(GulpCommon.srcPrefix('module/', src), rname, path.module);
}

function gulpTsPage(src, rname) {
    compiler.ts(GulpCommon.srcPrefix('pages/', src), rname, path.page);
}

gulp.task('js', function () {

    compiler.ts(['*', 'common/**/*'], 'bw.js', path.global);


    compiler.ts(['BwTableModule', 'BwMainTable', 'BwSubTableModule','newTableModule', 'InventoryBtn'].map(s => 'module/table/' + s), 'table.js', path.module);

    // pc 表格
    compiler.ts([
        '../global/components/table/basicTable',
        '../global/components/table/pcTable',
        '../global/components/scrollbar/scrollbar',
        'module/table/edit/TableImgEdit',
        'module/table/edit/TableEdit',
        'module/table/tableModulePc',
        'module/table/tableModule',
        'module/table/TableDataModule'
    ], 'table.pc.js', path.module);

    // mb表格
    compiler.ts([
        '../global/components/table/basicTable',
        '../global/components/table/mbTable',
        'module/table/edit/TableEdit',
        'module/table/edit/TableImgEdit',
        'module/table/tableModuleMb',
        'module/table/tableModule',
        'module/table/TableDataModule'
    ], 'table.mb.js', path.module);


    // mb查询器
    gulpTsModule([
        'query/queryBuilder',
        'query/queryModule',
        'query/queryModule.mb',
        'query/queryConfig',
        'query/asynQuery',
    ], 'query.mb.js');

    // pc查询器
    gulpTsModule([
        'query/queryBuilder',
        'query/queryModule',
        'query/queryModule.pc',
        'query/queryConfig',
        'query/asynQuery',
    ], 'query.pc.js');

    // mb编辑模块
    gulpTsModule([
        'edit/**/*',
        'edit/*',
    ], 'edit-module.js');

    //privilege模块
    gulpTsModule([
        'privilege/privilegeControl',
        'privilege/privilegeConfigure',
        'privilege/privilegeQuery',
        'privilege/privilegeDefault',
        'privilege/privilegePersonal',
        'privilege/privilegeDP',
    ], 'privilegeControl.js');

    //process模块
    gulpTsModule([
        'process/processLeave'
    ], 'processLeave.js');
    gulpTsModule([
        'process/processAuditList'
    ], 'processAuditList.js');
    gulpTsModule([
        'process/processSeekList'
    ], 'processSeekList.js');

    // TODO: 流程引擎模块
    // 流程设计
    gulpTsModule([
        'flowDesigner/FlowDesigner',
        'flowDesigner/FlowEngine',
        'flowDesigner/FlowListPC'
    ], 'flowEngine.js');

    gulpTsModule([
        'flowReport/FlowBase',
        'flowReport/FlowReport',
        'flowReport/FlowList',
        'flowReport/Accessory'
    ], 'flowReport.js');

    // 移动化详情页
    gulpTsModule([
        'listDetail/ListItemDetail',
        'listDetail/ListItemDetailCell',
    ], 'listDetail.js');

    //process模块
    gulpTsModule([
        'sqlMonitor/sqlMonitor'
    ], 'sqlMonitor.js');

    //search模块
    gulpTsModule(['search/search'], 'search.js');

    //mail模块
    gulpTsModule(['mail/mail'], 'mail.js');

    //upload模块
    gulpTsModule(['uploadModule/uploadModule'], 'uploadModule.js');

    //drawpoint模块
    gulpTsModule(['DrawPoint/DrawPoint'],'DrawPoint.js');

    //unBinding模块
    gulpTsModule(['unBinding/UnBinding'], 'unBinding.js');

    //inputs模块
    gulpTsModule(['inputs/inputs'], 'inputs.js');

    //hints模块
    gulpTsModule(['hints/hints'], 'hints.js');

    //turnPage模块
    gulpTsModule(['turnPage/TurnPage'],'turnPage.js');

    //help模块
    gulpTsModule(['helpMsg/HelpMsg'],'helpMsg.js');

    //label模块
    gulpTsModule(['labelPrint/labelPrint'], 'labelPrint.js');

    //labelModule模块
    gulpTsModule(['labelPrint/labelPrintModule'], 'labelPrintModule.js');

    //formPrintModule模块
    gulpTsModule(['labelPrint/formPrintModule'], 'formPrintModule.js');

    //fingerPrint
    gulpTsModule(['fingerPrint/*'], 'finger.js');

    //gesture
    gulpTsModule(['gesture/gesture'], 'gesture.js');

    gulpTsModule('webscoket/webscoket', 'webscoket.js');

    //BugReport
    gulpTsModule('BugReport/BugReport', 'BugReport.js');
    gulpTsModule('BugReport/BugList', 'BugList.js');

    gulpTsModule(['statistic/statistic', 'statistic/crosstab', 'statistic/analysis', 'statistic/chart', 'statistic/statisticBasic', 'statistic/count'], 'statistic.js');

    gulpTsModule(['newStatistic/statistic', 'newStatistic/crosstab', 'newStatistic/analysis', 'newStatistic/chart', 'newStatistic/statisticBasic', 'newStatistic/count'], 'newStatistic.js');
    /* gulpTsModule('newStatistic/crosstab', 'crosstab.js');
     gulpTsModule('newStatistic/analysis', 'analysis.js');*/

    // gulpTsModule('newStatistic/basic', 'basic.js');
    gulpTsModule('menuMrg/menuMrg', 'menu.mrg.js');


    gulpTsModule('mobileScan/MobileScan', 'MobileScan.js');

    /*page*/
    gulpTsPage('form/formPage', 'form-page.js');
    gulpTsPage('rfid/RfidBing/RfidBing', 'rfidbing.js');
    gulpTsPage('helper/HelperEdit', 'HelperEdit.js');
    gulpTsPage(['table/tablePage', 'table/tablePage.pc'], 'tablePage.pc.js');
    gulpTsPage(['table/tablePage', 'table/tablePage.mb'], 'tablePage.mb.js');
    gulpTsPage(['table/newTablePage'], 'tablePage.js');

    gulpTsPage('menu/menuMbPage', 'menuMbPage.js');
    gulpTsPage('menu/menuPage', 'menuPage.js');

    gulpTsPage('menu/homePage', 'homePage.js');

    gulpTsPage('list/listPage', 'listPage.js');
    // gulpTsPage('list/listPage.pc', 'listpage.pc.js');

    gulpTsPage('list/mailPage', 'mailPage.js');

    gulpTsPage('list/messagePage', 'messagePage.js');
    gulpTsPage('list/bugListPage', 'bugListPage.js');
    gulpTsPage('list/bugDetailPage', 'bugDetailPage.js');

    gulpTsPage('pick/contactsPage', 'contactsPage.js');

    gulpTsPage('fqa/fqa', 'fqa.js');

    gulpTsPage('myself/myselfMbPage', 'myselfMbPage.js');

    gulpTsPage('detail/detailMbPage', 'detailMbPage.js');

    gulpTsPage('detail/detailPage', 'detailPage.js');

    gulpTsPage('detail/versionPage', 'versionPage.js');
    gulpTsPage('detail/contactPage', 'contactPage.js');
    gulpTsPage(['main/mainPage', 'main/sideBar'], 'mainPage.js');

    // gulpTsPage('main/defaultTab', 'defaultTab.js');

    gulpTsPage('main/mainMbPage', 'mainMbPage.js');

    gulpTsPage('drill/drillPage', 'drillPage.js');
    gulpTsPage('drill/drillMbPage', 'drillMbPage.js');

    gulpTsPage('imgRotation/imgRotation', 'imgRotation.js');

    gulpTsPage('index/login', 'login.js');
    gulpTsPage('index/login.mb', 'login.mb.js');

    gulpTsPage('index/register', 'register.js');
    gulpTsPage('index/register.mb', 'register.mb.js');
    gulpTsPage('index/exception', 'exception.js');

    gulpTsPage('attendance/attendance', 'attendance.js');
    gulpTsPage('attendance/checkIn', 'checkIn.js');
    gulpTsPage('attendance/changePassword', 'changePassword.js');

    gulpTsPage('basicPage', 'basicPage.js');
    gulpTsPage('rfid/RfidSetting/RfidSetting', 'RfidSetting.js');

    gulpTsPage('rfid/RfidBarCode/RfidBarCode','RfidBarCode.js');
    gulpTsPage('plan/PlanPage','PlanPage.js');
});

/**
 * ------------ Js ---------------
 */
//定义默认任务
gulp.task('BW_Watch', ['js', 'css'], function () {
    // for(var i=0,len = pathSrc.length; i <= len - 1; i++){
    //     gulp.watch(pathSrc[i], [str[i]]);
    // }
});
//编译所有任务
gulp.task('BW_Start', ['js', 'css'], function () {
    gulp.start(compiler.allTask);
});

//压缩
gulp.task('BW_Compressor', function () {
    GulpCommon.compressor('css', `${path.root}css/*.css`, `${path.min}css/`);

    GulpCommon.compressor('js', `${path.root}*.js`, path.min);
    GulpCommon.compressor('js', `${path.page}*.js`, `${path.min}pages/`);
    GulpCommon.compressor('js', `${path.module}*.js`, `${path.min}module/`);

});

//清空page,
gulp.task('BW_Clean', function () {
    return gulp.src([path.page + '**/*'], {read: false}) // 清理page文件
        .pipe(clean({force: true}));
});


//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options]) 处理完后文件生成路径