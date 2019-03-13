'use strict';
let fs = require('fs'),
    Path = require('path');

// 递归创建目录 同步方法
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(Path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

module.exports = function(request, rConfig){
    let root = rConfig.path.root;
    let path = root + rConfig.requireConfig.filename;
    let configContent = fs.readFileSync('../required.config.js');

    if (!fs.existsSync(path)) {
        mkdirsSync(root);
        fs.writeFileSync(path, configContent);
    }
    let pathContent = fs.readFileSync(path);
    pathContent = pathContent.toString() === '' ? configContent : pathContent;
    let paths, bundles;
    pathContent.toString('utf8')
        .replace(/\s+/g,' ')
        .replace(/paths:\s?({[\w\W]*}),\s?bundles:\s?({[\w\W]*})\s?},\s?urlArg\)/, ($1, $2, $3) => {
            paths = JSON.parse($2);
            bundles = JSON.parse($3);
        });
    let version = new Date().getTime() + '';
    for(let attr in request){
        let path =request[attr].url.replace(/^.+dist\//, '');
        let modules = request[attr].modules;
        if(/\.js/gi.test(path)){
            if(modules.length > 1){
                let arr = [];
                for(let i = 0; i<modules.length; i++){
                    arr.push(modules[i]);
                }
                let create = true;
                for(let attr in bundles){
                    if(attr.indexOf(path) !== -1){
                        delete bundles[attr];
                        bundles[path + '?v=' + version] = arr;
                        create = false;
                    }
                }
                if(create){
                    bundles[path + '?v=' + version] = arr;
                }
            }else {
                modules[0] = modules[0].replace(/\.([a-zA-Z])/g, ($1, $2) => {
                    return $2.slice(0, 1).toUpperCase() + $2.slice(1);
                });
                paths[modules[0]] = path + '?v=' + version;
            }

        }
    }
    pathContent = pathContent.toString('utf8')
        .replace(/\s+/g, ' ')
        .replace(/paths:\s?({[\w\W]*}),\s?bundles:\s?({[\w\W]*})\s?},\s?urlArg\)/, ($1) => {
            return "paths: " + JSON.stringify(paths, null, 4) + ", bundles: " + JSON.stringify(bundles, null, 4) + " }, urlArg)";
        });
    mkdirsSync(path);
    fs.writeFileSync(path, pathContent);
};

function parsePath(path) {
    let extname = Path.extname(path);
    return {
        dirname: Path.dirname(path).replace(/[a-zA-Z\\]+app\\/, ''),
        basename: Path.basename(path, extname),
        extname: extname
    };
}
