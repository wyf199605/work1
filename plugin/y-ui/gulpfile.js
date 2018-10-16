const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins'); //自动加载插件 省去一个一个require进来
const fileinclude = require('gulp-file-include');
const minifyCSS = require('gulp-minify-css');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync');  //浏览器同步
const merge = require('merge2');  // Requires separate installation
const getEntry = require('./build/getEntry');
const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('clean' , function(){
   return gulp.src([
      'dist', //删除dist整个文件夹
      'dist/test/**/*', //删除dist下的test写任意子文件夹里的文件
      '!package.json'  //不删除package.json文件
     ] ).pipe($.clean());
});

// ../dist/styles目录下会生成 对应的 *.css 和 *.css.map
gulp.task('styles' , ()=>{
  var page = getEntry('scss', ['./src/assets/scss/**/*.scss']);
    for(let i=0; i<page.length; i++) {
        gulp.src("src/assets/scss/" + page[i] + "/*.scss") //指明源文件路径 读取其数据流
          .pipe($.plumber()) //替换错误的pipe方法  使数据流正常运行
          .pipe($.sourcemaps.init()) //压缩环境出现错误能找到未压缩的错误来源
          .pipe($.sass.sync({        //预编译sass
              outputStyle: 'expanded', //CSS编译后的方式
              precision: 10,//保留小数点后几位
              includePaths: ['.']
          }).on('error', $.sass.logError))
          .pipe($.concat(page[i]+'.css'))
          .pipe($.autoprefixer({
              /*last 2 versions: the last 2 versions for each browser.
              last 2 Chrome versions: the last 2 versions of Chrome browser.
              > 5% or >= 5%: versions selected by global usage statistics.
              > 5% in US: uses USA usage statistics. It accepts two-letter country code.
              > 5% in my stats: uses custom usage data.
              ie 6-8: selects an inclusive range of versions.
              Firefox > 20: versions of Firefox newer than 20.
              Firefox >= 20: versions of Firefox newer than or equal to 20.
              Firefox < 20: versions of Firefox less than 20.
              Firefox <= 20: versions of Firefox less than or equal to 20.
              Firefox ESR: the latest [Firefox ESR] version.
              iOS 7: the iOS browser version 7 directly.
              not ie <= 8: exclude browsers selected before by previous queries. You can add not to any query.*/
              browsers: ['last 2 Chrome versions', '> 5%'],
              cascade: false
          }))
          .pipe(minifyCSS())
          //.pipe($.autoprefixer({browsers:['> 1%', 'last 2 versions', 'Firefox ESR']}))     //自动匹配浏览器支持的后缀
          .pipe($.sourcemaps.write('./'))  //map文件命名
          .pipe(gulp.dest('dist/assets/y-ui/css'))  //指定输出路径

    }
});

// 通过对比图片大小，可以看出压缩了多少
gulp.task('images',()=>{
    return gulp.src('src/assets/images/**/*')
        .pipe($.plumber())
        .pipe ($.cache ($.imagemin ({ //使用cache只压缩改变的图片
              optimizationLevel: 3,         //压缩级别
              progressive: true, 
              interlaced: true})
        )).pipe (gulp.dest('dist/assets/y-ui/images'));
});

// ../dist/fonts目录下会生成 对应的文件
gulp.task('fonts', () => {
    return gulp.src('src/assets/fonts/**/*')
        .pipe($.plumber())
        .pipe(gulp.dest('dist/assets/y-ui/fonts'))
    }
);

// demo样式
gulp.task('copy_demo_css',  function() {
  return gulp.src('src/demo/css/*')
    .pipe($.plumber()) //替换错误的pipe方法  使数据流正常运行
    .pipe($.sass.sync({        //预编译sass
        outputStyle: 'expanded', //CSS编译后的方式
        precision: 10,//保留小数点后几位
        includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.concat('demo.css'))
    .pipe($.autoprefixer({
        /*last 2 versions: the last 2 versions for each browser.
        last 2 Chrome versions: the last 2 versions of Chrome browser.
        > 5% or >= 5%: versions selected by global usage statistics.
        > 5% in US: uses USA usage statistics. It accepts two-letter country code.
        > 5% in my stats: uses custom usage data.
        ie 6-8: selects an inclusive range of versions.
        Firefox > 20: versions of Firefox newer than 20.
        Firefox >= 20: versions of Firefox newer than or equal to 20.
        Firefox < 20: versions of Firefox less than 20.
        Firefox <= 20: versions of Firefox less than or equal to 20.
        Firefox ESR: the latest [Firefox ESR] version.
        iOS 7: the iOS browser version 7 directly.
        not ie <= 8: exclude browsers selected before by previous queries. You can add not to any query.*/
        browsers: ['last 2 Chrome versions', '> 5%'],
        cascade: false
    }))
    .pipe(gulp.dest('dist/demo/assets/css'))  //指定输出路径
});
// 插件
gulp.task('copy_bower',  function() {
  return gulp.src('bower_components/bootstrap/dist/**/*')
    .pipe(gulp.dest('dist/demo/assets'))
});

gulp.task('home_html', function () {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('dist/'));
});
gulp.task('copy_demo_js', function () {
    return gulp.src('src/demo/js/*.js')
        .pipe($.plumber())
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/demo/assets/js'));
});

gulp.task('html', ['home_html', 'copy_bower', 'copy_demo_js', 'copy_demo_css'], function () {
    return gulp.src(['src/demo/*.html', 'src/demo/**/*.html'])
        .pipe($.plumber())
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(gulp.dest('dist/demo'));
});

gulp.task('scripts', function () {
    var page = getEntry('components', ['./src/components/**/*.ts']);
    for(let i=0; i<page.length; i++) {
        gulp.src("src/components/" + page[i] + "/*.ts")
            .pipe($.plumber())
            .pipe($.typescript({
                  noImplicitAny: true,
                  outFile: page[i] + ".min.js"
            }))
            .pipe($.sourcemaps.init())
            .pipe($.uglify())
            .pipe($.sourcemaps.write('./'))
            .pipe(gulp.dest('dist/assets/y-ui/js'));
    }
});

gulp.task('build' , ['html' , 'scripts', 'styles', 'images' , 'fonts'],()=>{
    return gulp.src('dist/**/*')
    .pipe($.size({title:'build' , gzip:true}));
});

gulp.task('serve', ['build'] , ()=>{
    browserSync({
        notify : false,
        port:9000,  //端口号
        server:{
            baseDir:['dist'] //确定根目录
        }
    });

    gulp.watch('src/assets/scss/**/*', ['styles']);
    gulp.watch('src/assets/images/**/*', ['images']);
    gulp.watch('src/assets/fonts/**/*', ['fonts']);
    gulp.watch(['src/index.html', 'src/demo/*', 'src/demo/**/*'] , ['html']);
    gulp.watch('src/components/**/*', ['scripts']);

    gulp.watch([
        'dist/**/*.css', 
        'dist/**/*.js' 
    ], {readDelay: 1000}).on('change', reload);
});

gulp.task('default' ,['clean'],()=>{
    gulp.start('build');
});