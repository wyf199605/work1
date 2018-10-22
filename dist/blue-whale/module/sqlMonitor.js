define("SqlMonitor", ["require", "exports", "BasicPage", "Button", "TextInput", "BwRule", "SelectInput", "Modal"], function (require, exports, basicPage_1, Button_1, text_1, BwRule_1, selectInput_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var CONF = BW.CONF;
    var SqlMonitor = /** @class */ (function (_super) {
        __extends(SqlMonitor, _super);
        function SqlMonitor(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.btns = {}; //存放button节点
            _this.coms = {}; //存放data-type节点
            _this.container = para.dom;
            _this.initPage();
            return _this;
        }
        SqlMonitor.prototype.initPage = function () {
            // let html:string,
            //     butHtml:string,
            //     inputHtml:string,
            //     content:string;
            // inputHtml =    `
            //                 <div data-name = "appid"  class="inputArea" ><span >APPID:</span></div>
            //                 <!--<div data-name = "appserver" class="inputArea"><span >服务器:</span></div>-->
            //                 <div data-name = "clientIp" class="inputArea" ><span >数据库:</span></div>
            //                 <div data-name = "clientUser" class="inputArea" ><span>用户工号:</span></div>
            //                 <div data-name = "deviceType"  class="inputArea" ><span >设备类型:</span></div>
            //                 <div data-name = "urlAddr" class="inputArea"><span>地址:</span></div>
            //
            //                 <div data-name = "uuid" class="inputArea"><span >MAC地址:</span></div>
            //                 <div data-name = "nodeId" class="inputArea"><span>节点:</span></div>
            //                 <div data-name = "monitorType" class="inputArea"><span>显示类型:</span></div>
            //                 <div data-name = "sqlType" class="inputArea"><span >SQL类型:</span></div>`
            // butHtml =  `<div data-name = "search" class="inputArea searchInp"><span >查找:</span></div>
            //             <div style="clear: both;"></div>
            //             <div data-name = "clearBut" class="clearBut" style="margin-right: 70px;"></div>
            //             <div data-name = "end" class="end"></div>
            //             <div data-name = "start" class="start"></div>
            //             `;
            // content = `<div id='sqlMonitorContent' class = 'content'></div>`;
            // html =  '<div class="sqlTop"><div class="sql-input">'+ inputHtml +'</div>' + butHtml + '</div>' + content;
            var _this = this;
            d.append(this.container, h("div", { className: "sqlTop" },
                h("div", { className: "sql-input" },
                    h("div", { "data-name": "appid", className: "inputArea" },
                        h("span", null, "APPID:")),
                    h("div", { "data-name": "clientIp", className: "inputArea" },
                        h("span", null, "\u6570\u636E\u5E93:")),
                    h("div", { "data-name": "clientUser", className: "inputArea" },
                        h("span", null, "\u7528\u6237\u5DE5\u53F7:")),
                    h("div", { "data-name": "deviceType", className: "inputArea" },
                        h("span", null, "\u8BBE\u5907\u7C7B\u578B:")),
                    h("div", { "data-name": "urlAddr", className: "inputArea" },
                        h("span", null, "\u5730\u5740:")),
                    h("div", { "data-name": "uuid", className: "inputArea" },
                        h("span", null, "MAC\u5730\u5740:")),
                    h("div", { "data-name": "nodeId", className: "inputArea" },
                        h("span", null, "\u8282\u70B9:")),
                    h("div", { "data-name": "monitorType", className: "inputArea" },
                        h("span", null, "\u663E\u793A\u7C7B\u578B:")),
                    h("div", { "data-name": "sqlType", className: "inputArea" },
                        h("span", null, "SQL\u7C7B\u578B:"))),
                h("div", { "data-name": "search", className: "inputArea searchInp" },
                    h("span", null, "\u67E5\u627E:")),
                h("div", { style: "clear: both;" }),
                h("div", { "data-name": "clearBut", className: "clearBut", style: "margin-right: 70px;" }),
                h("div", { "data-name": "end", className: "end" }),
                h("div", { "data-name": "start", className: "start" })));
            d.append(this.container, h("div", { id: 'sqlMonitorContent', className: 'content' }));
            this.replaceType();
            this.btns['end'].wrapper.classList.add('disabled');
            var sqlMonitorContent = d.query('.content', this.container);
            var sqlTop = d.query('.sqlTop', this.container);
            var pageContainer = d.closest(this.container, '.page-container');
            var breadcrumb = d.query('.breadcrumb', pageContainer);
            sqlMonitorContent.style.marginTop = sqlTop.offsetHeight + breadcrumb.offsetHeight + 'px';
            pageContainer.style.backgroundColor = 'white';
            breadcrumb.style.position = 'fixed';
            breadcrumb.style.top = '40px';
            var searchInp = d.query('.searchInp', this.container);
            var inputDom = d.query('input', searchInp);
            var searchFun = function () {
                var searchInp = _this.coms['search'].get();
                var curContent = sqlMonitorContent.innerText;
                var reg = new RegExp("(" + searchInp + ")", "g");
                if (curContent.indexOf(searchInp) === -1 || searchInp === "") {
                    Modal_1.Modal.toast('没有查到相关数据');
                    return false;
                }
                curContent = curContent.replace(/<span style="color:red;">([\s\S]*?)<\/span>/g, "$1");
                curContent = curContent.replace(reg, "<span style='color:red;'>$1</span>");
                curContent = curContent.replace(/([\n]+)/g, '</br></br>');
                curContent = curContent.slice(5, curContent.length);
                sqlMonitorContent.innerHTML = curContent;
            };
            d.on(inputDom, 'keydown', function (e) {
                if (e.keyCode === 13) {
                    searchFun();
                }
            });
            var endBut = d.query('.end > .btn', this.container);
            endBut.classList.remove('disabled');
            endBut.click();
        };
        SqlMonitor.prototype.replaceType = function () {
            var _this = this;
            var self = this;
            d.queryAll('[data-name]', document.body).forEach(function (el) {
                switch (el.dataset.name) {
                    case 'start':
                        _this.btns['start'] = new Button_1.Button({
                            container: el,
                            content: '开始',
                            type: 'primary',
                            onClick: function (e) {
                                var clientUser = self.coms['clientUser'], searchInp = d.query('.searchInp', self.container), sqlInput = d.query('.sql-input', self.container);
                                // if(clientUser.get() === ""){
                                //     Modal.toast("请输入用户工号");
                                //     return;
                                // }
                                self.startSqlMonitor();
                                sqlInput.classList.add('disabled');
                                // searchInp.classList.add('disabled');
                                self.btns['start'].wrapper.classList.add('disabled');
                                self.btns['end'].wrapper.classList.remove('disabled');
                            }
                        });
                        break;
                    case 'end':
                        _this.btns['end'] = new Button_1.Button({
                            container: el,
                            content: '停止',
                            type: 'primary',
                            onClick: function (e) {
                                var searchInp = d.query('.searchInp', self.container), sqlInput = d.query('.sql-input', self.container);
                                self.stopSqlMonitor();
                                sqlInput.classList.remove('disabled');
                                // searchInp.classList.remove('disabled');
                                self.btns['start'].wrapper.classList.remove('disabled');
                                self.btns['end'].wrapper.classList.add('disabled');
                            }
                        });
                        break;
                    case 'clearBut':
                        _this.btns['clearBut'] = new Button_1.Button({
                            container: el,
                            content: '清空',
                            type: 'primary',
                            onClick: function (e) {
                                var sqlMonitorContent = d.query('.content', self.container);
                                var pageContainer = d.closest(self.container, '.page-container');
                                sqlMonitorContent.innerHTML = "";
                                pageContainer.scrollTop = 0;
                            }
                        });
                        break;
                    case 'search':
                        _this.coms['search'] = new text_1.TextInput({
                            container: el,
                            className: 'text',
                            placeholder: '请输入查找关键字'
                        });
                        break;
                    case 'appid':
                        _this.coms['appid'] = new text_1.TextInput({
                            container: el,
                            className: 'text'
                        });
                        _this.coms['appid'].set(CONF.appid);
                        break;
                    case 'appserver':
                        // ajaxLoad('/lookup/n1000_monitor-01/monitor-01','appserver', el);
                        break;
                    case 'clientIp':
                        ajaxLoad('/lookup/n1000_monitor-01/monitor-02', 'clientIp', el);
                        break;
                    case 'clientUser':
                        _this.coms['clientUser'] = new text_1.TextInput({
                            container: el,
                            // readonly : true,
                            className: 'text'
                        });
                        // this.coms['clientUser'].set(User.get().userid);
                        break;
                    case 'deviceType':
                        _this.coms['deviceType'] = new selectInput_1.SelectInput({
                            container: el,
                            readonly: true,
                            data: SqlMonitor.deviceType,
                            className: 'selectInput',
                            clickType: 0
                        });
                        _this.coms['deviceType'].set(0);
                        break;
                    case 'uuid':
                        _this.coms['uuid'] = new text_1.TextInput({
                            container: el,
                            className: 'text'
                        });
                        break;
                    case 'nodeId':
                        _this.coms['nodeId'] = new text_1.TextInput({
                            container: el,
                            className: 'text'
                        });
                        break;
                    case 'urlAddr':
                        _this.coms['urlAddr'] = new text_1.TextInput({
                            container: el,
                            placeholder: '可输入部分地址',
                            className: 'text'
                        });
                        break;
                    case 'monitorType':
                        _this.coms['monitorType'] = new selectInput_1.SelectInput({
                            container: el,
                            readonly: true,
                            data: [{ value: 2, text: '--- ---' }, { value: 0, text: '平台' }, { value: 1, text: '业务' }],
                            placeholder: '默认',
                            onSet: function (item, index) {
                            },
                            className: 'selectInput',
                            clickType: 0
                        });
                        _this.coms['monitorType'].set(2);
                        break;
                    case 'sqlType':
                        _this.coms['sqlType'] = new selectInput_1.SelectInput({
                            container: el,
                            readonly: true,
                            data: [{ value: 0, text: '原始sql' }, { value: 1, text: '带参sql' }],
                            className: 'selectInput',
                            clickType: 0
                        });
                        _this.coms['sqlType'].set(0);
                        break;
                }
            });
            function ajaxLoad(url, name, el) {
                BwRule_1.BwRule.Ajax.fetch(CONF.siteAppVerUrl + url, {
                    type: 'POST'
                }).then(function (_a) {
                    var response = _a.response;
                    var data = [], caption = response.meta[0];
                    response.data.forEach(function (obj) {
                        if (!obj[caption]) {
                            data.unshift({
                                value: '',
                                text: '--- ---'
                            });
                        }
                        else {
                            data.push({
                                value: obj[caption],
                                text: obj[caption]
                            });
                        }
                    });
                    self.coms[name] = new selectInput_1.SelectInput({
                        container: el,
                        data: data,
                        readonly: true,
                        placeholder: '默认',
                        onSet: function (item, index) {
                            console.log(item);
                        },
                        className: 'selectInput',
                        clickType: 0
                    });
                    self.coms[name].set('');
                });
                // Rule.ajax(CONF.siteAppVerUrl + url,{
                //     type : 'POST',
                //     success : (res) => {
                //         let data = [],
                //             caption = res.meta[0];
                //         res.data.forEach(obj => {
                //             if(!obj[caption]){
                //                 data.unshift({
                //                     value : '',
                //                     text : '--- ---'
                //                 })
                //             }else {
                //                 data.push({
                //                     value : obj[caption],
                //                     text : obj[caption]
                //                 })
                //             }
                //
                //         });
                //         self.coms[name] =  new SelectInput({
                //             container: el,
                //             data: data,
                //             readonly : true,
                //             placeholder: '默认',
                //             onSet: function (item, index) {
                //                 console.log(item)
                //             },
                //             className: 'selectInput',
                //             clickType: 0
                //         });
                //         self.coms[name].set('');
                //     }
                // });
            }
        };
        SqlMonitor.prototype.stopSqlMonitor = function () {
            BwRule_1.BwRule.Ajax.fetch(CONF.siteAppVerUrl + "/monitor/log/stop", {
                defaultCallback: false,
            });
            // Rule.ajax(`${CONF.siteAppVerUrl}/monitor/log/stop`, {
            //         defaultCallback: false,
            //     }
            // );
        };
        SqlMonitor.prototype.startSqlMonitor = function () {
            var appid = this.coms['appid'], 
            // appserver = <SelectInput>this.coms['appserver'],
            clientIp = this.coms['clientIp'], clientUser = this.coms['clientUser'], deviceType = this.coms['deviceType'], uuid = this.coms['uuid'], urlAddr = this.coms['urlAddr'], nodeId = this.coms['nodeId'], monitorType = this.coms['monitorType'], sqlType = this.coms['sqlType'], data = {
                "appId": appid.get(),
                // "appServer":appserver.get(),
                "dataSource": clientIp.get(),
                "clientUser": clientUser.get(),
                "deviceType": SqlMonitor.deviceType[deviceType.get()].value === 0 ? '' : SqlMonitor.deviceType[deviceType.get()].text,
                "uuid": uuid.get(),
                "urlAddr": urlAddr.get(),
                "nodeId": nodeId.get(),
                "monitorType": monitorType.get()
            };
            if (sqlType.get() !== 2) {
                data["sqlType"] = sqlType.get();
            }
            for (var key in data) {
                if (data[key] === "") {
                    delete data[key];
                }
            }
            BwRule_1.BwRule.Ajax.fetch(CONF.siteAppVerUrl + "/monitor/log/start", {
                type: 'POST',
                defaultCallback: false,
                data: data
            });
            //
            // Rule.ajax(`${CONF.siteAppVerUrl}/monitor/log/start`, {
            //     type: 'POST',
            //     defaultCallback: false,
            //     data: JSON.stringify(data)
            // });
        };
        SqlMonitor.deviceType = [{ value: 0, text: '--- ---' }, { value: 1, text: 'Android' }, { value: 2, text: 'IOS' }, { value: 3, text: 'PC' }];
        return SqlMonitor;
    }(basicPage_1.default));
    exports.SqlMonitor = SqlMonitor;
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
