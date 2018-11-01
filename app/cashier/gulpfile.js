//导入工具包
let gulp = require('gulp'),
    GulpCommon = require('../gulp-common'),
    zip = require('gulp-zip'),
    compiler = new GulpCommon('./tsconfig.json','D:/bw/img/web/app/cashier/global/', [
        'typings/*.d'
    ]);

let path = {
    starPage : 'D:/bw/cashier/startPage/',
    starPageHtml : 'D:/bw/cashier/',
    cashier :  'D:/bw/cashier/cashierwebfile/cashier/',  // 壳路径
    distMin : 'D:/bw/cashier/cashierwebfile/', // 压缩src
    // zipPath : 'D:/bw/cashier/cashierwebfile/', // 压缩到path

    // starPage : '../../dist.min/cashier/startPage/',
    // cashier :  '../../dist.min/cashier/',   // web路径
    // distMin : '../../dist.min/', // 压缩src
    sqlPath : 'D:/bw/cashier/cashierwebfile/sql/', // sql路径，独立存放
    zipPath : 'D:/bw/panda/panda-cashier/src/main/webapp/zip/full', // 压缩到path
};

/**
 * ------------ css -------------
 */
gulp.task('css', function () {
    compiler.scss(['style','!startPage/startPage'],'cashier.css',path.cashier,['style','module/**/*']);
});


/**
 * ------------ Js ---------------
 */

gulp.task('js',function () {
    compiler.ts([
        'module/**/*',
        'offLine/*',
        'page/*/*',
        'request/*',
        'tableLite/*',
        'typings/*',
        '*',
    ], 'cashier.js', path.cashier);
});

gulp.task('sql',function () {
    compiler.ts(['sqlMonitor/sqlMonitor'], 'SqlMonitor.js',path.sqlPath + 'sql/')
    compiler.scss(['sqlMonitor/sqlMonitor'], 'sqlMonitor.css',path.sqlPath)
});
/**
 * ------------ Js ---------------
 */

/**
 * ------------ html ---------------
 */
gulp.task('html', function () {
    compiler.gulpTask('index.html', ['index.html'], null, 'index.html', path.cashier, ['index.html']);
});

gulp.task('sqlHtml', function () {
    compiler.gulpTask('sql.html', ['sqlMonitor/sql.html'], null, 'sql.html', path.sqlPath, ['sql.html']);
});
/**
 * ------------ html ---------------
 */

//启动页
gulp.task('starPage',function () {
    compiler.ts(['startPage/StartPage'], 'startPage.js', path.starPage);
    compiler.gulpTask('index.html', ['startPage/index.html'], null, 'index.html', path.starPageHtml, ['index.html']);
    compiler.scss(['startPage/startPage'], 'startPage.css', path.starPage);
});


//编译所有任务
gulp.task('CC_Start', ['js', 'css', 'starPage','CC_G_Watch','html','sqlHtml', 'sql'], function () {
    gulp.start(compiler.allTask);
});

//压缩
gulp.task('CC_Compressor',function(){
    GulpCommon.compressor('css', `${path.root}*.css`, `${path.cashier}`);
    GulpCommon.compressor('js', `${path.root}*.js`, `${path.cashier}`);
});

gulp.task('CC_G_Watch',['CC_G_Compressor'], function () {
    let mbScss = '**/*.mb',
        pcScss = '**/*.pc';

    compiler.scss('global/style/global.pc', 'global.pc.css', path.cashier, ['**/*', `!${mbScss}`]);

    let arr = [
        'global/pollfily',
        'tools',
        'dom',
        'ajax',
        'spa',
        'shell',
        'rule',
        'storage',
        'requireConfig',
        '*',
        'core/*',
        'action/*',
        '**/*',
        'components/**/*',
        'components/**/**/*',
        '!components/dialog/*',
        '!components/feedback/*',
        // '!components/newTable/**/*'
    ];
    /*global*/
    compiler.ts(arr.map(src => 'global/' + src), 'global.js', path.cashier);
});

//启动页
gulp.task('CC_G_StartPage',function () {
    compiler.ts(['global/ajax','global/tools','global/shell', 'global/dom'], 'global.js', para.starPage)
});

gulp.task('CC_G_Start', ['CC_G_Watch'], function () {
    gulp.start(compiler.allTask);
});


gulp.task('CC_G_Compressor', function () {
    GulpCommon.compressor('css', `${path.cashier}global.css`, path.cashier);
    GulpCommon.compressor('js', `${path.cashier}global.js`, path.cashier);
});

//压缩文件(全量压缩到full，每次更新版本，full必须上传一份全量代码)
gulp.task('CC_Zip', function () {
   gulp.src([
       `${path.distMin}cashier`,
       `${path.distMin}cashier/*`,
       `${path.distMin}cashier/*/*`,
       `${path.distMin}cashier/*/*/*`,
       `!${path.distMin}cashier/startPage`,
       `!${path.distMin}cashier/startPage/*`,
   ])
       .pipe(zip('cashier.zip'))
       .pipe(gulp.dest(path.zipPath))
});
