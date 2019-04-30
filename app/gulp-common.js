//导入工具包 require('node_modules里对应模块')
'use strict';
const gulp = require('gulp'), //gulp
    typescript = require('gulp-typescript'), //打包ts文件
    rename = require('gulp-rename'), //文件重命名
    concat = require('gulp-concat'), //合并文件
    minifyjs = require('gulp-uglify'), //压缩js文件
    stripDebug = require('gulp-strip-debug');
    minifycss = require('gulp-clean-css'), //压缩css文件
    css = require('gulp-scss'), //打包css文件
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    through = require('through2'),
    fs = require('fs'),
    Path = require('path'),
    createRequire = require('./gulp-require.config'); //创建require.congif.js文件
const babel = require('gulp-babel');


global.cookie = {};
module.exports = class Compiler {
    /**
     *
     * @param tsConfig - tsconfig.json配置路径
     * @param globalPath - 全局global文件夹的目录
     * @param requireConfig - gulp.conf的路径
     * @param commonTsSrc - 需要一起编译的公共ts文件src
     */
    constructor(tsConfig, globalPath, requireConfig, commonTsSrc) {
        this.tsConfig = tsConfig;
        this.allTask = []; // 当前所有任务

        this.globalPath = globalPath;

        this.commonTsSrc = commonTsSrc;

        this.rConfig = requireConfig;


        this.once = true; //只执行一次生成require.config.js
    }

    /**
     * 创建gulp任务
     * @param name - 任务名
     * @param src - 文件目录
     * @param fun - 模块方法
     * @param rname - 重命名名字
     * @param target - 目标文件夹
     * @param watchSrc - 监控文件
     * @return {*}
     */
    gulpTask(name, src, fun, rname, target, watchSrc = src) {
        global.cookie[rname] = (target + rname).replace(/.+dist\//, '');
        let self = this;
        this.allTask.push(name);
        let task = gulp.task(name, function() {
            gulp.src(src)
                .pipe(babel({
                    presets: ['@babel/env']
                }))
                .pipe(self.createConfig(rname, target));
            let funs = gulp.src(src);
            if (fun) {
                funs = funs.pipe(fun());
            }
            funs.pipe(autoprefixer({
                browsers: ['last 2 versions', 'Android >= 4.0'],
                cascade: true, //是否美化属性值 默认：true 像这样：
                //-webkit-transform: rotate(45deg);
                //        transform: rotate(45deg);
                remove:true //是否去掉不必要的前缀 默认：true
            }));

            if (rname) {
                funs.pipe(rename(rname))
                    .pipe(concat(rname))
            }
            funs.pipe(gulp.dest(target))
        });
        gulp.watch(watchSrc, [name]);
        return task;
    }


    /*
     * 生成url的信息
     * ranme => JSON 属性名称 即 编译的文件
     * target => rname 对应的文件夹名称
     * */
    createConfig(rname, target, urlList = ['require.config.js']) {
        let self = this,
            modules = [], //require.config.js 中 bundles 属性的模块
            config = {},
            filesrc = {}; //btl 的文件内容
        //遍历一条流
        let transform = (file, enc, cb) => {
            if (file.isBuffer()) {
                let paths = parsePath(file.path);
                let extname = paths.extname;
                if (/ts/gi.test(extname)) {
                    let contents = file.contents.toString('utf8');
                    let len = modules.length;
                    contents.replace(/\/\/\/[\s]?<amd-module\sname\s?=\s?"(\w+)"\s?\/?>/, ($1, $2) => {
                        modules.push($2);
                    });
                    if (!(/\/\/\/[\s]?<amd-module\sname\s?=\s?"(\w+)"\s?\/?>/.test(contents))) {
                        // console.log(file.path)
                        contents.replace(/export\s?=\s?class\s+([a-zA-Z]+)\s?({|extends)/g, ($1, $2) => {
                            modules.push($2)
                        })
                    }
                }
            }
            cb();
        };
        //每条流结束调用
        let flush = (cb) => {
            let extname = parsePath(rname).extname,
                basename = parsePath(rname).basename;
            let request = {};
            let version = new Date().getTime() + '';
            request[rname] = config;
            config.url = target + rname;
            if (/js/gi.test(extname)) {
                if (modules.length === 0) {
                    modules.push(basename);
                }
                modules.sort();
                config.modules = modules;
            }
            //创建 require.config.js
            if (typeof this.rConfig.requireConfig !== 'undefined' && typeof this.rConfig.path !== 'undefined') {
                createRequire(request, this.rConfig);
            }
            if (typeof this.rConfig.btl !== 'undefined' && typeof this.rConfig.btl.filename !== 'undefined') {
                for (let i = 0, len = this.rConfig.btl.dirs.length; i < len; i++) {
                    let filesurl = this.rConfig.btl.dirs[i] + this.rConfig.btl.filename;
                    //创建btl 文件
                    let data = {};
                    for (let i = 0, len = urlList.length; i < len; i++) {
                        let url = urlList[i];
                        if (typeof this.rConfig.btl[url] === 'string') {
                            data[url] = this.rConfig.btl[url];
                        }
                    }
                    if (this.once) {
                        this.once = false;
                        if (Object.keys(data).length === 0) {
                            self.promise = getPromise(filesurl, self.rConfig.btl.src, rname, target);
                        } else {
                            self.promise = getPromise(filesurl, self.rConfig.btl.src, rname, target, data);
                        }
                    } else {
                        self.promise.then(() => {
                            if (Object.keys(data).length === 0) {
                                return getPromise(filesurl, self.rConfig.btl.src, rname, target);
                            } else {
                                return getPromise(filesurl, self.rConfig.btl.src, rname, target, data);
                            }
                        }).catch((e, fd) => {
                            fd && fs.close(fd);
                        });
                    }
                    cb();
                }
            } else {
                console.log(rname.toString() + ' 编译成功');
            }
        };

        return through({ objectMode: true, allowHalfOpen: false }, transform, flush);
    }

    /**
     * 编译TS文件
     * @param src
     * @param rname - 打包输出文件名
     * @param target 
     * @param [watchSrc]
     */
    ts(src, rname, target, watchSrc = src) {
        global.cookie[rname] = (target + rname).replace(/.+dist\//, '');
        !Array.isArray(src) && (src = [src]);
        !Array.isArray(watchSrc) && (watchSrc = [watchSrc]);

        let allSrc = src.concat([`${this.globalPath}typings/*.d`, `${this.globalPath}index`]);

        if (Array.isArray(this.commonTsSrc)) {
            allSrc = allSrc.concat(this.commonTsSrc);
        }

        allSrc = addext(allSrc);
        watchSrc = addext(watchSrc);

        this.allTask.push(rname);
        gulp.task(rname, () => {
            gulp.src(allSrc)
                .pipe(this.createConfig(rname, target));
            gulp.src(allSrc)
                .pipe(typescript.createProject(this.tsConfig)())
                .js.pipe(concat(rname))
                .pipe(gulp.dest(target))
        });

        gulp.watch(watchSrc, [rname]);

        function addext(srcs) {
            return [...srcs].map(src => `${src}.{ts,tsx}`) //.concat([...srcs].map(src => `${src}.tsx`));
        }
    }

    /**
     * 编译SCSS文件
     * @param src
     * @param rname
     * @param target
     * @param [watchSrc]
     */
    scss(src, rname, target, watchSrc = src) {
        !Array.isArray(src) && (src = [src]);
        !Array.isArray(watchSrc) && (watchSrc = [watchSrc]);

        src = src.map(s => `${s}.scss`);
        watchSrc = watchSrc.map(s => `${s}.scss`);

        this.gulpTask(rname, src, sass, rname, target, watchSrc);
    }

    static compressor(type, src, target) {
        // let fun = type === 'js' ? minifyjs() : minifycss();
        
        // gulp.src(src)
        //     .pipe(fun)
        //     .pipe(gulp.dest(target));
        if (type === 'js') {
            gulp.src(src)
            .pipe(minifyjs())
            .pipe(stripDebug())
            .pipe(gulp.dest(target)); 
        } else {
            gulp.src(src)
            .pipe(minifycss())
            .pipe(gulp.dest(target));
        }
    }

    /**
     * 设置src的前缀
     * @param {string} prefix - 前缀
     * @param {string | string[]} src - 目录或文件
     * @return {string | string[]}
     */
    static srcPrefix(prefix, src) {
        if (Array.isArray(src)) {
            src = src.map(function(s) {
                return prefix + s
            })
        } else {
            src = prefix + src;
        }
        return src;
    }
};

function parsePath(path) {
    let extname = Path.extname(path);
    return {
        dirname: Path.dirname(path).replace(/[a-zA-Z\\:.]+app\\/, ''),
        basename: Path.basename(path, extname),
        extname: extname
    };
}

function getPromise(url, urlList, rname, target, extra) {
    return new Promise((resolve, reject) => {
        fs.open(url, 'r+', (err, fd) => {
            if (err) {
                fs.open(url, 'w+', (err, fd) => {
                    if (err)
                        return reject(err, fd);
                    fs.write(fd, strByBtl({}.toString()), () => {
                        readWrite(fd, resolve, reject);
                    })
                });
                return;
            }
            readWrite(fd, resolve, reject);
        })
    });

    function readWrite(fd, resolve, reject) {
        let buf = Buffer.alloc(1024 * 1024);
        fs.read(fd, buf, 0, buf.length, 0, (err, len) => {
            if (err)
                return reject(err, fd);
            // console.log(buf)
            // console.log(len)
            let data = strByBtl(buf.slice(0, len).toString(), true);
            if (typeof data !== 'object') {
                data = {};
            }
            let version = new Date().getTime() + '';
            let isChange = false;
            for (let attr in urlList) {
                if (typeof data[attr] === 'undefined') {
                    isChange = true;
                    data[attr] = {};
                }
                if (typeof extra !== 'undefined') {
                    isChange = true;
                    for (let key in extra) {
                        data[attr][key] = extra[key] + '?v=' + version;
                    }
                }
                urlList[attr].forEach((item, index) => {
                    if (item === rname) {
                        isChange = true;
                        data[attr] = typeof data[attr] === 'undefined' ? {} : data[attr];
                        data[attr][rname] = (target + rname + '?v=' + version).replace(/.+dist\//, '');
                    }
                });
            }
            fs.close(fd, () => {
                if (isChange) {
                    fs.open(url, 'w+', (err, fd) => {
                        if (err)
                            return reject(err, fd);
                        for (let attr in urlList) {
                            urlList[attr].forEach((item) => {
                                if (typeof data[attr][item] === 'undefined') {
                                    data[attr][item] = global.cookie[item] + '?v=' + version;
                                }
                            })
                        }
                        fs.write(fd, strByBtl(JSON.stringify(data, null, 4)), () => {
                            fs.close(fd, () => {
                                console.log(rname.toString() + ' 编译成功');
                                resolve();
                            })
                        });
                    })
                } else {
                    console.log(rname.toString() + ' 编译成功');
                    resolve();
                }
            })
        })
    }

    function strByBtl(str, replace = false) {
        if (replace) {
            let filesrc = {};
            str.replace(/var\s+filesrc\s?=\s?({[\s\S]+})/, ($1, $2) => {
                try {
                    filesrc = JSON.parse($2);
                } catch (e) {
                    filesrc = {};
                }
            });
            return filesrc;
        }
        return '<%\nvar filesrc = ' + str + ';\nreturn filesrc;\n%>';
    }
}