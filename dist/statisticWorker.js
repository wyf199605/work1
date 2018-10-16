onmessage = function (ev) {
    var result = null;
    switch (ev.data.type) {
        case "cols":
            result = crossTable.getCols(ev.data.data.config);
            break;
        case "data":
            result = crossTable.getData(ev.data.data);
            break;
    }
    postMessage({ type: ev.data.type, result: result }, void 0);
};
var crossTable = (function () {
    var cols = [];
    var getCols = function (conf) {
        var result = null, resultLength = conf.col.length + (conf.val.length === 1 ? 0 : 1);
        cols = conf.cols;
        if (conf.colsSum) {
            result = getSumCols(conf.col, conf.val, conf.data, resultLength);
        }
        else {
            result = getNotSumCols(conf.col, conf.val, conf.data, resultLength);
        }
        conf.row.forEach(function (name, index) {
            var title = getTitle(name);
            result[0].splice(index, 0, {
                title: title,
                name: name,
                rowspan: resultLength,
                isFixed: conf.isFixed,
            });
        });
        return result;
    };
    var getNotSumCols = function (colNames, values, colsData, resultLength) {
        var scope = values.length, valSum = 0, result = Array.from({ length: resultLength }, function () { return []; });
        colNames.forEach(function (name, index) {
            colsData.forEach(function (data, i) {
                // conf.val.forEach(val => {
                var colspan = scope;
                result[index].push({
                    title: data[name],
                    name: name + '-' + i,
                    colspan: colspan
                });
                valSum += colspan;
                // });
            });
        });
        if (scope > 1) {
            var _loop_1 = function (i, valLen) {
                var num = i / valLen;
                values.forEach(function (name, index) {
                    var title = getTitle(name);
                    result[result.length - 1].push({
                        title: title,
                        name: name + '-' + num,
                    });
                });
            };
            for (var i = 0, valLen = values.length; i < valSum; i += valLen) {
                _loop_1(i, valLen);
            }
        }
        else {
            var lastIndex = result.length - 1;
            var _loop_2 = function (i, valLen) {
                var name_1 = values[i];
                result[lastIndex].forEach(function (item, index) {
                    if ((index - i) % valLen === 0) {
                        item.name = name_1 + '-' + (index - i) / valLen;
                    }
                });
            };
            for (var i = 0, valLen = values.length; i < valLen; i++) {
                _loop_2(i, valLen);
            }
        }
        return result;
    };
    var getSumCols = function (colNames, values, colData, resultLength) {
        var colLength = colNames.length, scope = values.length, valSum = 0, result = Array.from({ length: resultLength }, function () { return []; });
        colNames.forEach(function (name, index) {
            colData.forEach(function (data, i) {
                var colspan = (colLength - index) * scope;
                result[index].push({
                    title: data[name],
                    name: name + '-' + i,
                    colspan: colspan,
                });
                if (index > 0) {
                    result[index].push({
                        title: '合计',
                        name: name + '-total-' + i,
                        rowspan: colLength - index,
                        colspan: scope
                    });
                }
                else {
                    valSum += colspan;
                }
            });
        });
        result[0].push({
            title: '合计',
            name: 'total',
            rowspan: colLength,
            colspan: scope,
        });
        var totalIndex = 0;
        if (scope > 1) {
            for (var i = 0, valLen = values.length; i < valSum; i += valLen) {
                var num = i / valLen;
                values.forEach(function (name, index) {
                    var title = getTitle(name);
                    result[result.length - 1].push({
                        title: title,
                        name: name + '-total-' + totalIndex,
                    });
                });
                totalIndex++;
            }
        }
        else {
            var name_2 = values[0];
            result[0].forEach(function (item, index) {
                item.name = name_2 + '-' + index;
            });
        }
        values.forEach(function (name, index) {
            var title = getTitle(name);
            result[result.length - 1].push({
                title: title,
                name: name + '-total',
            });
        });
        return result;
    };
    var getTitle = function (name) {
        for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
            var value = cols_1[_i];
            if (Object.values(value).includes(name)) {
                return value.title;
            }
        }
        return '';
    };
    var getSumData = function (config, defaultObj) {
        var result = [];
        config.data.forEach(function () {
        });
        return result;
    };
    var getNotSumData = function (config, defaultObj) {
        var result = [];
        config.data.forEach(function (data, index) {
            var obj = {};
            config.row.forEach(function (name, i) {
                obj[name] = data[name];
            });
            config.val.forEach(function (name, i) {
                obj[name + '-' + index] = data[name];
            });
            result.push(Object.assign({}, defaultObj, obj));
        });
        return result;
    };
    var getData = function (_a) {
        var cols = _a.cols, config = _a.config;
        var result = [];
        var defaultObj = {};
        for (var _i = 0, cols_2 = cols; _i < cols_2.length; _i++) {
            var col = cols_2[_i];
            defaultObj[col.name] = null;
        }
        if (config.colsSum) {
            result = getSumData(config, defaultObj);
        }
        else {
            result = getNotSumData(config, defaultObj);
        }
        return result;
    };
    return {
        getCols: getCols,
        getData: getData,
    };
})();

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="components/Component.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>
