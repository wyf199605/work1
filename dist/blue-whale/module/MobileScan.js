define("MobileScan", ["require", "exports", "Button", "ShellAction", "Modal"], function (require, exports, Button_1, ShellAction_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="MobileScan"/>
    var tools = G.tools;
    var d = G.d;
    var Shell = G.Shell;
    var MobileScan = /** @class */ (function () {
        function MobileScan(para) {
            var _this = this;
            this.rfidFlag = true;
            this.scanFlag = true;
            this.rfidArr = [];
            this.scanArr = [];
            this.p = para;
            var can2dScan = Shell.inventory.can2dScan, type = para.scannableType || 0;
            var btn = new Button_1.Button({
                type: 'link',
                content: (type === 0 || type === 2) ? (can2dScan ? '按下扫码枪查询' : '扫码查询') : 'RFID扫码',
                size: 'large',
                container: para.container,
                className: 'mobile-scan',
                icon: can2dScan ? '' : 'richscan_icon',
                onClick: (type === 0 && can2dScan) ? null : function () {
                    switch (type) {
                        case 1:
                            if (_this.rfidFlag) { // 开启
                                _this.startEpc(btn);
                            }
                            else { // 查询并关闭
                                _this.stopEpc(btn, para);
                            }
                            break;
                        case 2:
                            if (!can2dScan) {
                                Modal_1.Modal.alert('该操作只支持扫码枪');
                                return;
                            }
                            if (_this.scanFlag) {
                                btn.wrapper.innerHTML = '结束扫码';
                                _this.scanFlag = false;
                                Shell.inventory.scan2dOn(function (res) {
                                    var data = res && res.data;
                                    if (res && res.success && data !== 'openSuponScan') {
                                        !_this.scanArr.includes(data) && _this.scanArr.push(data);
                                    }
                                });
                            }
                            else {
                                btn.wrapper.innerHTML = '按下扫码枪查询';
                                _this.scanFlag = true;
                                if (tools.isFunction(para && para.callback)) {
                                    para.callback({
                                        selection: _this.scanArr.join(',')
                                    });
                                }
                                _this.scanArr = [];
                            }
                            break;
                        default:
                            var cols = para.cols;
                            if (Array.isArray(cols)) {
                                var tip_1 = '';
                                cols.forEach(function (obj) {
                                    if (obj.name === para.scannableField) {
                                        tip_1 = obj.caption;
                                    }
                                });
                                Modal_1.Modal.toast('只能扫描' + tip_1);
                                setTimeout(function () {
                                    _this.open(para);
                                }, 500);
                            }
                            else {
                                _this.open(para);
                            }
                    }
                    // 处理扫码枪会自动触发按钮的点击bug
                    btn.wrapper.blur();
                }
            });
            // 开启扫码枪事件
            if (type === 0 && can2dScan) {
                this.scanOpen().then(function (res) {
                    if (tools.isFunction(para.callback) && res.success && res.data !== 'openSuponScan') {
                        para.callback({ mobilescan: res.data });
                    }
                });
            }
            // 拖动
            d.on(btn.wrapper, 'touchstart', function (e) {
                var ev = e.touches[0], wrapper = btn.wrapper, distanceX = ev.clientX - wrapper.offsetLeft, distanceY = ev.clientY - wrapper.offsetTop;
                var moveHandler = function (e) {
                    e.preventDefault();
                    var ev = e.touches[0];
                    wrapper.style.left = ev.clientX - distanceX + 'px';
                    wrapper.style.top = ev.clientY - distanceY + 'px';
                };
                var endHandler = function () {
                    d.off(document, 'touchmove', moveHandler);
                    d.off(document, 'touchend', endHandler);
                };
                d.on(document, 'touchmove', moveHandler);
                d.on(document, 'touchend', endHandler);
            });
        }
        MobileScan.prototype.scanOpen = function () {
            // Shell.inventory.supon()
            return new Promise(function (resolve, reject) {
                Shell.inventory.openScan(function (res) {
                    resolve(res);
                });
            });
        };
        /**
         * type0 rfid及手机扫码
         * @param {IScanButtonPara} para
         */
        MobileScan.prototype.open = function (para) {
            ShellAction_1.ShellAction.get().device().scan({
                callback: function (even) {
                    var data = JSON.parse(even.detail).data;
                    if (typeof para.callback === 'function') {
                        para.callback({ mobilescan: data });
                    }
                }
            });
            // para.callback(355751);
        };
        MobileScan.prototype.startEpc = function (btn) {
            var _this = this;
            this.rfidArr = [];
            this.rfidFlag = false;
            var time = (this.p.scannableTime || 0) * 1000;
            btn.wrapper.innerHTML = '结束扫描';
            Shell.inventory.clearEpc(null, function (res) {
                if (res.success) {
                    var back_1 = function (result) {
                        // Modal.toast(JSON.stringify(result))
                        if (result.success) {
                            if (time !== 0) {
                                _this.rfidArr = [];
                            }
                            Array.isArray(result.data) && result.data.forEach(function (obj) {
                                _this.rfidArr.push(obj.epc);
                            });
                            if (time === 0) {
                                btn.wrapper.innerHTML = '结束扫描(' + _this.rfidArr.length + ')';
                            }
                            else {
                                _this.p.callback({
                                    selection: _this.rfidArr.join(',')
                                }).then(function () {
                                    if (!_this.rfidFlag) {
                                        Shell.inventory.returnEpcbyTime(null, time, true, back_1);
                                    }
                                }).catch(function () {
                                    // Modal.alert('后台请求出错，重新调用returnEpcbyTime')
                                    if (!_this.rfidFlag) {
                                        Shell.inventory.returnEpcbyTime(null, time, true, back_1);
                                    }
                                });
                            }
                        }
                        else {
                            Modal_1.Modal.alert(result.msg);
                        }
                    };
                    Shell.inventory.returnEpcbyTime(null, time, true, back_1);
                }
            });
        };
        MobileScan.prototype.stopEpc = function (btn, para) {
            // Shell.inventory.stopEpc(null, function (res) {});
            var time = this.p.scannableTime || 0;
            Shell.inventory.returnEpcbyTime(null, time, false, function (result) { });
            if (time === 0) {
                para.callback({
                    selection: this.rfidArr.join(',')
                });
            }
            btn.wrapper.innerHTML = 'RFID扫码';
            this.rfidFlag = true;
        };
        return MobileScan;
    }());
    exports.MobileScan = MobileScan;
});

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

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
