//导入工具包
let gulp = require('gulp'),
    fs = require('fs'),
    GulpCommon = require('../gulp-common'),
    config = require('./gulp.conf'),
    compiler = new GulpCommon('../tsconfig.json', '../global/', config, [
        'typings/*.d'
    ]);

let path = config.path;
path.page = path.root + 'pages/';
path.global = path.root;
path.css = path.root + 'css/';
path.module = path.root + 'module/';

/**
 * ------------ css -------------
 */
gulp.task('css', function() {
    compiler.scss(
        'style/style',
        'develop.css',
        path.css,
        '**/*'
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

gulp.task('js', function() {
    compiler.ts(['*', 'page/**/*'], 'common.js', path.root);
    gulpTsModule('loginInfo/LoginInfoModule', 'logininfomodule.js');
    // gulpTsModule('../../blue-whale/module/privilege/*', 'privilege.js');
    gulpTsModule('dropDown/DropDownModule', 'dropdownmodule.js');
    gulpTsModule('menuDesign/MenuDesignModule', 'menudesignmodule.js');
    gulpTsModule('queryDevice/OverviewModule', 'overviewmodule.js');
    gulpTsModule('queryDevice/MainFuncModule', 'mainfuncmodule.js');
    gulpTsModule('queryDevice/ProductScriptModule', 'productscriptmodule.js');
    gulpTsModule('textInput/TextInputModule', 'textinputmodule.js');
    gulpTsModule('queryDevice/OperationModule', 'operationmodule.js');
    gulpTsModule('util/DVAjax', 'dvajax.js');
    gulpTsModule('stepBar/StepBar', 'stepbar.js');
    gulpTsModule('mountMenu/MountMenu', 'mountmenu.js');
});

// 拷贝文件
function copyfile(oldPath, newPath) {
    let stat = fs.lstatSync(oldPath);
    if (stat.isDirectory()) {
        return false;
    }
    let readStream = fs.createReadStream(oldPath);
    let writeStream = fs.createWriteStream(newPath);
    readStream.pipe(writeStream);
    readStream.on('end', function() {

    });
    readStream.on('error', function() {

    });
}

/**
 * ------------ Js ---------------
 */
//定义默认任务
gulp.task('DV_Watch', ['js', 'css'], function() {
    //拷贝HTML文件
    gulp.watch('page/pick/index.html', function(e) {
        var oldPath = e.path;
        var newPath = oldPath.split('\\app\\')[0] + '\\dist\\develop\\tpl.html';
        var newDirPath = oldPath.split('\\app\\')[0] + '\\dist\\develop\\';
        // 修改或增加时
        if ('added' == e.type || 'changed' == e.type || 'renamed' == e.type) {
            // 判断目录是否存在，不存在则创建
            fs.exists(newDirPath, function(exists) {
                if (exists) {
                    copyfile(oldPath, newPath);
                } else {
                    mkdirs(newDirPath);
                    // 延时，等待目录创建完成
                    setTimeout(function() {
                        copyfile(oldPath, newPath);
                    }, 200);
                }
            });
        } else if ('deleted' == e.type) {
            //删除
            fs.unlink(newPath, function(err) {
                console.log('删除' + newPath + err);
            });
        }
    });
});
//编译所有任务
gulp.task('DV_Start', ['js', 'css'], function() {
    gulp.start(compiler.allTask);
});

//压缩
gulp.task('DV_Compressor', function() {
    GulpCommon.compressor('css', `${path.root}css/*.css`, `${path.min}css/`);

    GulpCommon.compressor('js', `${path.root}*.js`, path.min);
    GulpCommon.compressor('js', `${path.page}*.js`, `${path.min}pages/`);
    GulpCommon.compressor('js', `${path.module}*.js`, `${path.min}module/`);

});

// //清空page,
// gulp.task('DV_Clean', function() {
//     return gulp.src( [path.page + '**/*'], {read: false} ) // 清理page文件
//         .pipe(clean({force: true}));
// });


//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组)
//gulp.dest(path[, options]) 处理完后文件生成路径