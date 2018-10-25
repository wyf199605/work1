/// <amd-module name="BasicPage"/>
define("BasicPage", ["require", "exports", "ButtonAction", "Modal"], function (require, exports, ButtonAction_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sys = BW.sys;
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    var BasicPage = /** @class */ (function () {
        function BasicPage(para) {
            var _this = this;
            // this.isMb = sys.os !== 'pc';
            this.isMb = tools.isMb;
            if (this.isMb) {
                this.dom = document.body;
                this.url = window.location.href;
            }
            else {
                this.dom = para.dom;
                this.url = para.dom.parentElement.dataset.src;
                /*面包屑处理*/
                if (this.url) {
                    this.setTitle(para.title);
                }
                else {
                    /*在当前页面打开时*/
                    this.url = d.closest(para.dom, '.page-container[data-src]').dataset.src;
                }
            }
            this.on('page.destroy', function () {
                _this.destroy();
            });
            //判断是否是安卓5及以上版本才开启手势
            var version = 5;
            if (/(Android)/i.test(navigator.userAgent)) {
                var andrVersionArr = navigator.userAgent.match(/Android (\d+)\.(\d+)\.?(\d+)?/);
                //去除匹配的第一个下标的元素
                version = andrVersionArr[1] ? parseInt(andrVersionArr[1]) : 5;
            }
            if ( /*para.subButtons && */version > 4 && tools.isMb) {
                var timeOut_1 = null;
                d.on(document, 'touchstart', function () {
                    var gestureIcon = d.query('.blue-gesture', document.body);
                    // console.log(gestureIcon);
                    if (!gestureIcon) {
                        _this.initGesture(para);
                    }
                    else {
                        gestureIcon.style.display = 'block';
                    }
                });
                d.on(document, 'touchend', function () {
                    clearTimeout(timeOut_1);
                    timeOut_1 = setTimeout(function () {
                        var gestureIcon = d.query('.blue-gesture', document.body);
                        gestureIcon.style.display = 'none';
                    }, 3000);
                });
            }
            this.initWebscoket();
            this.initHelpMsg(para);
        }
        BasicPage.prototype.initHelpMsg = function (para) {
            // let element = para.ui && para.ui.body && para.ui.body.elements && para.ui.body.elements[0],
            //     helpId = element && element.helpId;
            // if(tools.isNotEmpty(helpId)){
            //     new HelpMsg({
            //         helpId : helpId
            //     });
            // }
        };
        BasicPage.prototype.initWebscoket = function () {
            if (!G.tools.isMb) {
                return;
            }
            require(['webscoket'], function (webscoket) {
                new webscoket({
                    mgrPath: BW.CONF.siteUrl,
                    wsUrl: BW.CONF.webscoketUrl
                });
            });
        };
        BasicPage.prototype.setTitle = function (title) {
            sys && sys.window.setTitle(this.url, title);
        };
        BasicPage.prototype.on = function (type, cb) {
            d.on(this.isMb ? window : this.dom.parentElement, type, cb);
        };
        BasicPage.prototype.initGesture = function (para) {
            var gestureIcon = d.create('<i class="iconfont icon-gesture blue-gesture"></i>');
            var sty = "position:fixed; right:40px; bottom : 40px; z-index:900; font-size:40px; color:rgb(0,122,255);";
            gestureIcon.setAttribute('style', sty);
            d.on(gestureIcon, 'click', function () {
                var gesture = {
                    'circle': 'cycle',
                    'delete': 'cross',
                    'triangle': 'tri',
                    'caret': 'backHome'
                };
                require(['Gesture'], function (ges) {
                    new ges({
                        container: document.body,
                        onFinsh: function (ges) {
                            var hasGesture = false;
                            if (gesture[ges] === 'backHome') {
                                Modal_1.Modal.confirm({
                                    msg: '是否跳转到首页？',
                                    callback: function (flag) {
                                        if (flag) {
                                            sys.window.open({
                                                url: CONF.url.main
                                            });
                                        }
                                    }
                                });
                                // 画个"/\"表示跳转到首页
                                hasGesture = true;
                            }
                            else {
                                var subButtomsPara = para.subButtons || {};
                                for (var i = 0, l = subButtomsPara.length; i < l; i++) {
                                    if (subButtomsPara[i].signId === gesture[ges]) {
                                        ButtonAction_1.ButtonAction.get().clickHandle(subButtomsPara[i], {}, function () { });
                                        hasGesture = true;
                                    }
                                }
                            }
                            if (!hasGesture) {
                                Modal_1.Modal.toast('未匹配到手势相应操作');
                            }
                        }
                    });
                });
            });
            document.body.appendChild(gestureIcon);
        };
        BasicPage.prototype.destroy = function () {
        };
        BasicPage.prototype.initPcSys = function () {
            // let u =  this.url,
            //     close = sys.window.close;
            // sys.window.close = (event, type, url = u) => {
            //     close(event, type, url);
            // };
            //
            // let fire = sys.window.fire;
            // sys.window.fire = (event, data, url = u) =>{
            //     fire(event, data, url);
            // };
            //
            // let open = sys.window.open;
            // sys.window.open = (o : winOpen, url = u) => {
            //     console.log(url);
            //     open(o, url);
            // }
        };
        return BasicPage;
    }());
    exports.default = BasicPage;
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
