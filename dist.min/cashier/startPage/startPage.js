/// <amd-module name="StartPage"/>
var Ajax = C.Ajax;
var d = C.d;
var Shell = C.Shell;
var src = './cashierwebfile/';
var zipSrc = src + 'cashier.zip';
var urlSite = null;
var isDevelop = false;
var url = {
    fontFile: 'cashier/pos/frontfile/',
    cashier: './cashierwebfile/cashier/index.html',
    downLoad: 'https://bwt.sanfu.com/',
};
/*获取前端版本信息*/
var fontFileUpdate = function () {
    var data = window.localStorage.getItem('sqlQueryData');
    if (C.tools.isEmpty(data)) {
        data = '1.0.0';
        window.localStorage.setItem('sqlQueryData', data);
    }
    tip('正在获取版本信息...');
    Ajax.fetch((isDevelop ? urlSite : url.downLoad) + url.fontFile + data, {
        dataType: 'json'
    }).then(function (_a) {
        var response = _a.response;
        operateFile(response && response.dataArr);
    }).catch(function (e) {
        tip('获取版本失败,请按F2配置服务器。');
    });
};
/**
 * 文件操作：1.增量  2.全量
 */
var operateFile = function (fileData) {
    if (fileData === void 0) { fileData = []; }
    var i = 0, len = fileData.length;
    var deal = function (i) {
        var data = fileData[i], index = '(' + (i + 1) + '/' + len + ')';
        if (!data) {
            location.href = url.cashier;
            return;
        }
        tip('正在下载文件' + index + '...');
        Ajax.fetch((isDevelop ? urlSite : url.downLoad) + 'cashier' + data.fileurl, {
            dataType: 'file',
        }).then(function (_a) {
            var response = _a.response;
            if (!response || !response.type) {
                tip('下载的文件格式出错');
                return;
            }
            var reader = new FileReader();
            reader.readAsDataURL(response);
            reader.onloadend = function () {
                var base64data = reader.result, upType = data.uptype || 1;
                var file = function () {
                    var base = base64data.substring(base64data.indexOf(',') + 1, base64data.length);
                    tip('文件下载完成，正在保存文件' + index);
                    Shell.file.save(zipSrc, base, false, function (saveResult) {
                        tip(saveResult.msg);
                        if (saveResult.success) {
                            tip('文件保存完成，待解压' + index);
                            Shell.file.unZip(zipSrc, src, function (unZipResult) {
                                if (unZipResult.success) {
                                    tip('文件解压缩完成' + index);
                                    window.localStorage.setItem('sqlQueryData', data.version);
                                    i++;
                                    if (len > i) {
                                        deal(i);
                                    }
                                    else {
                                        tip('正在前往收银界面');
                                        location.href = url.cashier;
                                    }
                                }
                                else {
                                    tip('文件解压缩失败' + index);
                                }
                            });
                        }
                    });
                };
                // 全量，删除所有文件
                if (upType === 2) {
                    Shell.file.directoryDelete(src + 'cashier');
                }
                file();
            };
        }).catch(function (e) {
            tip('下载文件失败,请按F2配置服务器。');
        });
    };
    deal(i);
};
var tip = function (tips) {
    typeof tips !== "string" && (tips = JSON.stringify(tips));
    var tip = d.query('.start-page-tip');
    tip.innerHTML = tips;
};
(function eventInit() {
    var login = d.query('#login'), server = d.query('.server-select'), serverText = d.query('#serverText'), sel = d.query('#sel'), img = d.query('.page-header img'), index = 0;
    var loginAction = function () {
        var text = serverText.value;
        server.classList.toggle('hide');
        window.localStorage.setItem('serverUrl', text);
        urlSite = text;
        fontFileUpdate();
    };
    d.on(login, 'click', function () {
        loginAction();
    });
    d.on(img, 'click', function () {
        index++;
        if (index === 5) {
            isDevelop = !isDevelop;
            if (isDevelop) {
                login.innerHTML = '开发者模式前往';
            }
            else {
                login.innerHTML = '前往';
            }
            index = 0;
        }
    });
    d.on(document.body, 'keydown', function (e) {
        var keyCode = e.keyCode || e.which || e.charCode;
        if (keyCode === 113) {
            server.classList.toggle('hide');
            sel.focus();
        }
        else if (keyCode === 13) {
            loginAction();
        }
        else if (keyCode === 27) {
            server.classList.add('hide');
        }
    });
})();
(function startPage() {
    // 全屏
    Shell.base.fullScreenSet(true, function (e) { });
    var serverUrl = window.localStorage.getItem('serverUrl'), server = d.query('.server-select');
    tip('正在检查壳程序更新...');
    Shell.base.versionUpdate((isDevelop ? urlSite : url.downLoad) + 'cashier/pos/shellfile', function (result) {
        tip(result.msg);
    }, function (result) {
        tip(result);
    }).then(function (response) {
        if (response && response.data && response.data.byteLength > 0) {
            return;
        }
        if (!serverUrl) {
            server.classList.toggle('hide');
            tip('请先配置服务器(F2)');
        }
        else {
            urlSite = serverUrl;
            fontFileUpdate();
        }
    }).catch(function () {
        tip('获取壳程序更新失败');
    });
})();

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="pollfily.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>
