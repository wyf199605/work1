define("RegPage", ["require", "exports", "BwRule", "Modal", "ShellAction", "UnBinding"], function (require, exports, BwRule_1, Modal_1, ShellAction_1, UnBinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="RegPage"/>
    var sys = BW.sys;
    var CONF = BW.CONF;
    var d = G.d;
    var tools = G.tools;
    var Shell = G.Shell;
    /**
     * 移动和电脑的注册页面
     */
    var RegPage = /** @class */ (function () {
        function RegPage(props) {
            var _this = this;
            this.props = props;
            this.deviceData = {};
            var self = this;
            self.getDevice();
            // self.setVerifyCode();
            d.on(props.goLogin, 'click', function () {
                sys.window.load(CONF.url.login);
            });
            if (tools.isMb) {
                this.code = this.renderCheckCode(props.verifyELCode);
                d.on(props.verifyELCode.parentElement, 'click', function () {
                    // self.setVerifyCode();
                    var canvas = h("canvas", { width: "80", height: "30" });
                    d.replace(canvas, props.verifyELCode);
                    props.verifyELCode = canvas;
                    _this.code = _this.renderCheckCode(props.verifyELCode);
                });
            }
            d.on(props.saveReg, 'click', function () {
                if (props.tel.value.trim().length === 0) {
                    Modal_1.Modal.alert('请输入手机号');
                    return;
                }
                if (props.verifyELCodeInput) {
                    if (!self.confirmLocalCode()) {
                        return;
                    }
                }
                if (props.smsCheckCode.value.trim().length === 0) {
                    Modal_1.Modal.alert('请输入短信验证码');
                    return;
                }
                BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.register, {
                    type: 'POST',
                    data: {
                        check_code: props.smsCheckCode.value,
                        mobile: props.tel.value,
                        uuid: _this.deviceData['uuid'],
                        os_name: _this.deviceData['name'],
                        os_version: _this.deviceData['version'],
                        model: _this.deviceData['model'],
                        vendor: _this.deviceData['vendor'],
                        screen_width: _this.deviceData['resolutionWidth'],
                        screen_height: _this.deviceData['resolutionHeight'],
                        screen_size: _this.deviceData['scale'],
                        support_finger: '1',
                        finger_type: '1',
                    },
                    data2url: true,
                }).then(function (_a) {
                    var response = _a.response;
                    if (response.msg.indexOf('成功') > -1) {
                        Modal_1.Modal.toast('注册成功!');
                        sys.window.logout();
                    }
                    else {
                        Modal_1.Modal.confirm({
                            msg: response.msg,
                            btns: ['取消', '前往解绑'],
                            callback: function (index) {
                                if (index === true) {
                                    new UnBinding_1.UnBinding(response.data);
                                    // self.deviceMange(response.data);
                                }
                            }
                        });
                    }
                });
            });
            d.on(props.sendVerify, 'click', function (e) {
                var sendVerify = this;
                var mobile = G.tools.str.toEmpty(props.tel.value);
                if (G.tools.isEmpty(mobile) || !G.tools.valid.isTel(mobile)) {
                    Modal_1.Modal.alert('手机号格式有误');
                    return;
                }
                // mb端，验证本地验证码
                if (props.verifyELCodeInput) {
                    if (!self.confirmLocalCode()) {
                        return;
                    }
                }
                var countdown = 60;
                sendVerify.classList.add('disabled');
                sendVerify.innerHTML = countdown + 's';
                var timer = setInterval(function () {
                    countdown--;
                    if (countdown == 0) {
                        clearInterval(timer);
                        sendVerify.classList.remove('disabled');
                        sendVerify.innerHTML = '获取';
                    }
                    else {
                        sendVerify.classList.add('disabled');
                        sendVerify.innerHTML = countdown + 's';
                    }
                }, 1000);
                BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.smsSend, {
                    data: {
                        mobile: mobile,
                        uuid: self.deviceData['uuid']
                    },
                    data2url: true,
                    type: 'POST',
                    headers: { uuid: self.deviceData['uuid'] }
                }).then(function () {
                    Modal_1.Modal.toast('验证码发送成功');
                }).catch(function () {
                }).finally(function () {
                    sendVerify.innerHTML = '获取';
                    sendVerify.classList.add('disabled');
                });
                e.stopPropagation();
            });
            if (sys.os !== 'pc') {
                sys.window.close = double_back;
            }
        }
        RegPage.prototype.getDevice = function () {
            var _this = this;
            if (sys.os === 'ip') {
                var shell = ShellAction_1.ShellAction.get();
                shell.device().getInfo({ callback: function (e) {
                        var json = JSON.parse(e.detail);
                        if (json.success) {
                            _this.deviceData = json.msg;
                        }
                        else {
                            Modal_1.Modal.toast(json.msg);
                        }
                    } });
            }
            else if (sys.os === 'ad') {
                var shell = ShellAction_1.ShellAction.get();
                var data = shell.device().getInfo().data;
                if (data.success) {
                    this.deviceData = (data.msg);
                }
                else {
                    Modal_1.Modal.toast(data.msg);
                }
            }
            else if ('AppShell' in window) {
                this.deviceData = Shell.base.device.data;
            }
            else if ('BlueWhaleShell' in window) {
                var shell = ShellAction_1.ShellAction.get();
                this.deviceData = shell.device().getInfo().data;
            }
            else {
                //let deviceInfo={"model":"AT/AT COMPATIBLE","name":"Windows 7","version":"6.1.7601","vendor":"LENOVO","scale":16.3,"resolutionWidth":1366,"resolutionHeight":768,"uuid":"28-D2-44-0C-4E-B5"};
                //showDevice(deviceInfo);
            }
            /*function showDevice(deviceInfo) {
                let inputs = self.props.dataSysinfo;
                for (let i = 0; i < inputs.length; i++) {
                    let key = inputs[i].dataset.sysinfo.split('.');
                    inputs[i].value = deviceInfo[key[1]];
                }
            }*/
        };
        /**
         * 生成本地验证码
         */
        RegPage.prototype.renderCheckCode = function (c1) {
            function rn(min, max) {
                return parseInt(Math.random() * (max - min) + min);
            }
            //2.新建一个函数产生随机颜色
            function rc(min, max) {
                var r = rn(min, max);
                var g = rn(min, max);
                var b = rn(min, max);
                return "rgb(" + r + "," + g + "," + b + ")";
            }
            var ctx = c1.getContext("2d"), result = '';
            //3.填充背景颜色,颜色要浅一点
            var w = c1.width;
            var h = c1.height;
            ctx.clearRect(0, 0, w, h);
            // ctx.fillStyle = rc(180, 230);
            // ctx.fillRect(0, 0, w, h);
            //4.随机产生字符串
            var pool = "1234567890";
            for (var i = 0; i < 4; i++) {
                var c = pool[rn(0, pool.length)]; //随机的字
                result += c;
                var fs = rn(h / 3 * 2, h); //字体的大小
                var deg = rn(-30, 30); //字体的旋转角度
                ctx.font = fs + 'px Simhei';
                ctx.textBaseline = "top";
                ctx.fillStyle = rc(80, 150);
                ctx.save();
                ctx.translate(20 * i + 15, 15);
                ctx.rotate(deg * Math.PI / 180);
                ctx.fillText(c, -15 + 5, -15);
                ctx.restore();
            }
            //5.随机产生5条干扰线,干扰线的颜色要浅一点
            for (var i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(rn(0, w), rn(0, h));
                ctx.lineTo(rn(0, w), rn(0, h));
                ctx.strokeStyle = rc(180, 230);
                ctx.closePath();
                ctx.stroke();
            }
            //6.随机产生40个干扰的小点
            for (var i = 0; i < 40; i++) {
                ctx.beginPath();
                ctx.arc(rn(0, w), rn(0, h), 1, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fillStyle = rc(150, 200);
                ctx.fill();
            }
            return result;
        };
        /* private getVerifyElCode() : any[]{
             let randomArray = [],
                 resultArray = [];
             for (let i = 48; i <= 57; i++) {
                 randomArray.push(String.fromCharCode(i));
             }
             for (let i = 65; i <= 90; i++) {
                 randomArray.push(String.fromCharCode(i));
             }
             for (let i = 97; i <= 122; i++) {
                 randomArray.push(String.fromCharCode(i));
             }
             let len = randomArray.length;
             
             while (resultArray.length < 5){
                 let random = Math.floor(Math.random() * len);
                 let randomCode = randomArray[random];
                 if (resultArray.indexOf(randomCode) == -1) {
                     resultArray.push(randomCode);
                 }
             }
     
             return resultArray;
         }*/
        /**
         * 设置本地验证码
         */
        /*private setVerifyCode(){
            let codeArr = this.getVerifyElCode(),
                codeItemArray = d.queryAll(".verifyCodeItem",this.props.verifyELCode),
                len = codeItemArray.length;
            this.code = codeArr.join('');
            for (let i = 0; i < len; i++) {
                let span = codeItemArray[i];
                span.innerHTML = codeArr[i];
                let randomAngle = Math.random() * 20;
                let symbol = Math.random() > 0.5 ? '+' : '-';
                span.style.transform = 'rotate(' + symbol+randomAngle +'deg)';
            }
        }*/
        /**
         * 验证输入的内容是否和本地验证码一致
         */
        RegPage.prototype.confirmLocalCode = function () {
            var value = this.props.verifyELCodeInput.value.toLowerCase();
            if (this.code.toLowerCase() !== value) {
                Modal_1.Modal.alert('验证码输入不正确');
                return false;
            }
            return true;
        };
        return RegPage;
    }());
    exports.RegPage = RegPage;
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
