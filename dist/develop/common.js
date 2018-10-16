var DV;
(function (DV) {
    DV.CONF = {
        app_id: 'app_sanfu_retail',
        rootUrl: 'http://bwd.fastlion.cn:7776/dp',
        ajaxUrl: {
            menuQuery: 'root/app_dp/tree/app_id',
            datasourceQuery: 'root/app_dp/global/datasource',
            baseTableQuery: 'root/app_dp/global/keyfield',
            varDesign: 'root/app_dp/global/var',
            itemQuery: 'root/app_dp/sysitem/dplist',
            primaryFunction: 'root/app_dp/dplist',
            elementDesign: 'root/app_dp/syselement',
            fieldEditor: 'root/app_dp/global/field',
            encyption: 'root/app_dp/dpcommon/encyption?str=',
            login: 'root/app_dp/dplogin',
            logout: 'root/app_dp/dplogout',
            queryCondition: 'root/app_dp/global/cond',
            queryItemRelatedElements: 'root/app_dp/related/element',
            queryItemRelatedCond: 'root/app_dp/related/cond',
            getAppId: 'root/app_dp/dpcommon/init',
            interface: 'root/app_dp/dpoutinterface/menu',
            dmlsql: 'root/app_dp/global/dmlsql',
            downloadScript: 'root/rest/dp/download/file',
            uploadfile: 'root/rest/dp/upload/file',
            itemMenuDelete: 'root/app_dp/sysitem',
            itemInterface: 'root/app_dp/dpoutinterface/item',
        }
    };
})(DV || (DV = {}));
for (var key in DV.CONF.ajaxUrl) {
    var urlStr = DV.CONF.ajaxUrl[key];
    if (urlStr.indexOf('root/') === 0) {
        urlStr = urlStr.replace('root', DV.CONF.rootUrl);
    }
    if (urlStr.indexOf('app_id') !== -1) {
        urlStr = urlStr.replace('app_id', DV.CONF.app_id);
    }
    DV.CONF.ajaxUrl[key] = urlStr;
}

define("DevelopApp", ["require", "exports", "MainPage", "HomePage", "MenuDesignPage", "QueryDevicePage", "FieldEditorPage", "PageDesignPage", "VarDesignPage", "ElementDesignPage", "MenuDevelopPage", "LoginPage", "AppPackaging", "AppPublish", "CondDesignPage", "AuthorityConfigPage", "AuthoritySearchPage"], function (require, exports, MainPage_1, HomePage_1, MenuDesignPage_1, QueryDevicePage_1, FieldEditorPage_1, PageDesignPage_1, VarDesignPage_1, ElementDesignPage_1, MenuDevelopPage_1, LoginPage_1, AppPackaging_1, AppPublish_1, CondDesignPage_1, AuthorityConfigPage_1, AuthoritySearchPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="DevelopApp"/>
    var SPA = G.SPA;
    var SPATab = G.SPATab;
    var d = G.d;
    var developRouter = {
        main: MainPage_1.MainPage,
        home: HomePage_1.HomePage,
        menuDesign: MenuDesignPage_1.MenuDesignPage,
        queryDevice: QueryDevicePage_1.QueryDevicePage,
        elementDesign: ElementDesignPage_1.ElementDesignPage,
        fieldEditor: FieldEditorPage_1.FieldEditorPage,
        pageDesign: PageDesignPage_1.PageDesignPage,
        varDesign: VarDesignPage_1.VarDesignPage,
        menuDevelop: MenuDevelopPage_1.MenuDevelopPage,
        appPublish: AppPublish_1.AppPublish,
        appPackaging: AppPackaging_1.AppPackaging,
        condDesign: CondDesignPage_1.CondDesignPage,
        authorityConfig: AuthorityConfigPage_1.AuthorityConfigPage,
        authoritySearch: AuthoritySearchPage_1.AuthoritySearchPage
    };
    function init() {
        SPA.init([
            {
                name: 'loginReg',
                container: 'body',
                max: 1,
                router: {
                    login: LoginPage_1.LoginPage
                },
                defaultRouter: {
                    login: null,
                }
            },
            {
                name: 'develop',
                container: '#body',
                router: developRouter,
                main: {
                    router: ['main', []],
                    container: '.dev-main',
                },
                defaultRouter: {
                    home: null
                },
                // index0: routerName, index1: router's para
                max: 9,
                // isLocalHistory?: boolean;
                tab: {
                    container: d.query('.dev-tab'),
                    TabClass: DVTab
                }
            }
        ]);
    }
    exports.init = init;
    var DVTab = /** @class */ (function (_super) {
        __extends(DVTab, _super);
        function DVTab() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DVTab.prototype.wrapperInit = function () {
            return d.create("<div class='dev-tab'></div>");
        };
        DVTab.prototype.itemCreate = function () {
            return d.create("<div data-role=\"item\">\n            <span data-role=\"title\"></span>\n            <span data-role=\"close\" class=\"dev de-guanbi\"></span>\n        </div>");
        };
        return DVTab;
    }(SPATab));
});

define("HomePage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="HomePage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var HomePage = /** @class */ (function (_super) {
        __extends(HomePage, _super);
        function HomePage() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.treeDataArr = [];
            return _this;
        }
        Object.defineProperty(HomePage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        HomePage.prototype.init = function (para, data) {
            this.title = "首页";
            this.treeInit();
        };
        HomePage.prototype.wrapperInit = function () {
            return d.create("<div class=\"homepage trees\">\n        <img src=\"../../img/develop/sy.jpg\" alt=\"\">\n        </div>");
        };
        HomePage.prototype.treeInit = function () {
            // this.treeDataArr = [
            //
            // ];
            // this.treeDataArr.forEach((value, index, arr) => {
            //     new Tree({
            //         text: arr[index].title,
            //         container: this.wrapper.querySelector('.tree' + (index + 1)),
            //         children:arr[index].content,
            //         isShowCheckBox:false,
            //         expand:true,
            //         isVirtual:false
            //     })
            // })
        };
        return HomePage;
    }(SPAPage));
    exports.HomePage = HomePage;
});

define("MainPage", ["require", "exports", "LoginInfoModule", "Button", "Menu", "Modal"], function (require, exports, LoginInfoModule_1, Button_1, Menu_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="MainPage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var SPA = G.SPA;
    var tools = G.tools;
    var MainPage = /** @class */ (function (_super) {
        __extends(MainPage, _super);
        function MainPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(MainPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        MainPage.prototype.wrapperInit = function () {
            return d.create('<div></div>');
        };
        MainPage.prototype.init = function (para, data) {
            var _this = this;
            var mainHeaderArray = d.queryAll('[data-name]', d.query('.dev-main'));
            this.modules = {
                menu: null,
                quickDevelopButton: null,
                userInfo: null,
            };
            mainHeaderArray.forEach(function (ele) {
                var dataName = ele.dataset['name'];
                // 左侧菜单
                if (dataName === 'header-menu') {
                    var leftMenuData = [
                        {
                            text: '首页',
                            icon: 'dev de-shouye f-font',
                            content: 'home'
                        },
                        {
                            text: '设计',
                            icon: 'dev de-sheji f-font',
                            children: [
                                {
                                    text: '页面设计',
                                    icon: 'dev de-yemiansheji',
                                    content: 'pageDesign'
                                },
                                {
                                    text: '元素设计',
                                    icon: 'dev de-yuansusheji',
                                    content: 'elementDesign'
                                },
                                {
                                    text: '变量设计',
                                    content: 'varDesign',
                                    icon: 'dev de-bianliangsheji'
                                },
                                {
                                    text: '条件设计',
                                    content: 'condDesign',
                                    icon: 'dev de-tiaojiansheji'
                                },
                                {
                                    text: '菜单设计',
                                    icon: 'dev de-caidansheji',
                                    content: 'menuDesign'
                                }
                            ]
                        },
                        {
                            text: '工具',
                            icon: 'dev de-gongju f-font',
                            children: [
                                {
                                    text: '权限编辑器',
                                    icon: 'dev de-quanxianshezhi',
                                    children: [
                                        {
                                            text: '权限配置',
                                            content: 'authorityConfig'
                                        },
                                        {
                                            text: '权限查询',
                                            content: 'authoritySearch'
                                        }
                                    ]
                                },
                                {
                                    text: '字段编辑器',
                                    content: 'fieldEditor',
                                    icon: 'dev de-ziduanbianjiqi'
                                }
                            ]
                        },
                        {
                            text: '发布管理',
                            icon: 'dev de-fabuguanli f-font',
                            children: [
                                {
                                    text: '应用打包',
                                    icon: 'dev de-yingyongdabao',
                                    content: 'appPackaging'
                                },
                                {
                                    text: '应用发布',
                                    icon: 'dev de-yingyongfabu',
                                    content: 'appPublish'
                                }
                            ]
                        },
                    ];
                    var leftMenu = new Menu_1.Menu({
                        container: ele,
                        children: leftMenuData,
                        expand: true,
                        isOutline: true,
                        isHoverExpand: true,
                    });
                    var self_1 = _this;
                    leftMenu.onOpen = function (node) {
                        if (node.content !== undefined) {
                            SPA.open(SPA.hashCreate('develop', node.content));
                        }
                    };
                    _this.modules.menu = leftMenu;
                }
                // 快速开发按钮
                if (dataName === 'quick-develop-btn') {
                    var btn = new Button_1.Button({
                        container: ele,
                        content: '快速开发',
                        onClick: function (event) {
                            var modalBody = d.create("<div class=\"modalBody\"></div>");
                            new Button_1.Button({
                                content: '查询器快速开发',
                                container: modalBody,
                                onClick: function (e) {
                                    SPA.open(SPA.hashCreate('develop', 'queryDevice'));
                                    modal.destroy();
                                }
                            });
                            new Button_1.Button({
                                content: '目录开发',
                                container: modalBody,
                                onClick: function (e) {
                                    SPA.open(SPA.hashCreate('develop', 'menuDevelop'));
                                    modal.destroy();
                                }
                            });
                            var modal = new Modal_1.Modal({
                                body: modalBody,
                                top: 150
                            });
                        },
                        icon: 'de-kuaisukaifa',
                        iconPre: 'dev'
                    });
                    _this.modules.quickDevelopButton = btn;
                }
                //个人信息
                if (dataName === 'user-info') {
                    var userInfo = new LoginInfoModule_1.LoginInfoModule({
                        container: ele,
                        headerImgUrl: '../../img/develop/user.png'
                    });
                    _this.modules.userInfo = userInfo;
                }
            });
            d.query('.dev-main').style.display = 'block';
            SPA.onChange(function (newHash, oldHash) {
                if (newHash.routeName === 'authority') {
                    var userId = localStorage.getItem('userId');
                    if (tools.isEmpty(userId)) {
                        SPA.open(SPA.hashCreate('loginReg', 'login'));
                    }
                }
            });
        };
        MainPage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.modules['menu'].destroy();
            this.modules['quickDevelopButton'].destroy();
            this.modules['userInfo'].destroy();
            this.modules = null;
        };
        return MainPage;
    }(SPAPage));
    exports.MainPage = MainPage;
});

define("AppPackaging", ["require", "exports", "DVAjax", "FastTable", "Button", "TextInputModule", "Datetime", "Modal"], function (require, exports, DVAjax_1, FastTable_1, Button_1, TextInputModule_1, datetime_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="AppPackaging"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var config = DV.CONF;
    var tools = G.tools;
    var AppPackaging = /** @class */ (function (_super) {
        __extends(AppPackaging, _super);
        function AppPackaging() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(AppPackaging.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = title;
            },
            enumerable: true,
            configurable: true
        });
        AppPackaging.prototype.wrapperInit = function () {
            return d.create("<div class=\"app-packaging\">\n            <div class=\"conditions\"></div>\n            <div class=\"table\"></div>\n            <div class=\"publish-btn\"></div>\n</div>");
        };
        AppPackaging.prototype.init = function (para, data) {
            var _this = this;
            this.title = "应用打包";
            this.initConditions();
            this.initTable();
            new Button_1.Button({
                content: '生成脚本并打包',
                container: d.query('.publish-btn', this.wrapper),
                onClick: function () {
                    var selectRows = _this.table.selectedRows;
                    if (selectRows.length <= 0) {
                        Modal_1.Modal.alert('请先选择一条数据!');
                    }
                    else {
                        var dmlLogId_1 = [];
                        selectRows.forEach(function (row) {
                            dmlLogId_1.push(row.cells[0].text);
                        });
                        DVAjax_1.DVAjax.packaing(dmlLogId_1);
                        _this.clearAjaxData();
                    }
                }
            });
        };
        AppPackaging.prototype.clearAjaxData = function () {
            var cond = this.conditions;
            cond['resourceType'].set('');
            cond['appId'].set('');
            cond['dmlOperatorId'].set('');
            cond['dmlTime'].set('');
            this.getAllconditionsData();
        };
        AppPackaging.prototype.initConditions = function () {
            var _this = this;
            var inputData = [
                {
                    title: '类型',
                    id: 'resourceType'
                },
                {
                    title: '应用ID',
                    id: 'appId'
                },
                {
                    title: '操作用户',
                    id: 'dmlOperatorId'
                }
            ];
            this.conditions = {
                resourceType: '',
                appId: '',
                dmlOperatorId: '',
                dmlTime: ''
            };
            var container = d.query('.conditions', this.wrapper);
            for (var i = 0; i < inputData.length; i++) {
                var module = new TextInputModule_1.TextInputModule({
                    container: container,
                    title: inputData[i].title
                });
                module.textInput.on('blur', function (e) {
                    _this.getAllconditionsData();
                });
                this.conditions[inputData[i].id] = module;
            }
            container.appendChild(d.create('<div class="time"' +
                '><label>操作时间:</label></div>'));
            var currentTime = new Date().getTime(), maxDate = new Date(currentTime + 24 * 60 * 60);
            var dmlTime = new datetime_1.Datetime({
                isRange: true,
                container: d.query('.time', container),
                format: 'Y-M-d H:m:s',
                onClose: function () {
                    _this.getAllconditionsData();
                },
                maxDate: maxDate
            });
            d.query('.time', container).appendChild(d.create('<div class="clear"></div>'));
            this.conditions['dmlTime'] = dmlTime;
        };
        AppPackaging.prototype.getAllconditionsData = function () {
            var cond = this.conditions, resourceType = cond['resourceType'].get(), appId = cond['appId'].get(), dmlOperatorId = cond['dmlOperatorId'].get(), dmlTime = cond['dmlTime'].get(), timeData = [];
            if (dmlTime.indexOf(' 至 ') !== -1) {
                var timeArr = dmlTime.split(' 至 '), time1 = timeArr[0], time2 = timeArr[1];
                timeData.push(time1, time2);
            }
            var paraObj = {
                resource_type: resourceType,
                dml_time: timeData,
                dml_operator_id: dmlOperatorId,
                app_id: appId
            };
            this.tableAjaxPara = paraObj;
        };
        Object.defineProperty(AppPackaging.prototype, "tableCols", {
            get: function () {
                if (!this._tableCols) {
                    this._tableCols = [
                        { name: 'dmlLogId', title: '日志ID' },
                        { name: 'appId', title: '应用ID' },
                        { name: 'dmlOperatorId', title: '操作用户' },
                        { name: 'dmlTime', title: '时间' },
                        { name: 'resourceType', title: '类型' },
                        { name: 'dmlSql', title: 'DML语句' },
                        { name: 'exportflag', title: '是否已经导出' }
                    ];
                }
                return this._tableCols;
            },
            enumerable: true,
            configurable: true
        });
        AppPackaging.prototype.initTable = function () {
            var _this = this;
            this.table = new FastTable_1.FastTable({
                container: d.query('.table', this.wrapper),
                cols: [this.tableCols],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.dmlsql + '?pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara();
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            var data = response.dataArr, total = 0;
                            tools.isNotEmptyArray(data) && data.map(function (row) {
                                row.exportflag = row.exportflag === 0 ? '否' : '是';
                            });
                            tools.isNotEmptyArray(data) && (total = response.head.total);
                            return { data: data, total: total };
                        });
                    },
                    auto: true,
                    once: false
                },
                page: {
                    size: 50,
                    options: [50, 100]
                }
            });
        };
        Object.defineProperty(AppPackaging.prototype, "tableAjaxPara", {
            get: function () {
                if (!this._tableAjaxPara) {
                    this._tableAjaxPara = {
                        resource_type: '',
                        dml_time: [],
                        dml_operator_id: '',
                        app_id: ''
                    };
                }
                return this._tableAjaxPara;
            },
            set: function (para) {
                this._tableAjaxPara = para;
                this.table && this.table._clearAllSelectedCells();
                this.table && this.table.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        AppPackaging.prototype.handlerAjaxPara = function () {
            var str = '&fuzzyparams={', paraStr = '';
            for (var key in this.tableAjaxPara) {
                if (tools.isNotEmpty(this.tableAjaxPara[key])) {
                    if (key === 'dml_time') {
                        var timeData = this.tableAjaxPara[key];
                        paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(timeData) ? '"' + timeData[0] + ',' + timeData[1] + '"' : '""') + ',';
                    }
                    else {
                        var data = this.tableAjaxPara[key];
                        paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(data) ? '"' + data + '"' : '""') + ',';
                    }
                }
            }
            if (tools.isNotEmpty(paraStr)) {
                paraStr = paraStr.slice(0, paraStr.length - 1);
                str = str + paraStr + '}';
                return encodeURI(str);
            }
            else {
                return '';
            }
        };
        return AppPackaging;
    }(SPAPage));
    exports.AppPackaging = AppPackaging;
});

define("AppPublish", ["require", "exports", "Uploader", "Modal"], function (require, exports, uploader_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="AppPublish"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    // import {StepBar} from "../../module/stepBar/StepBar";
    var AppPublish = /** @class */ (function (_super) {
        __extends(AppPublish, _super);
        function AppPublish() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(AppPublish.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = title;
            },
            enumerable: true,
            configurable: true
        });
        AppPublish.prototype.wrapperInit = function () {
            return d.create("<div class=\"app-publish\">\n<div class=\"uploadBtn function-btn\"></div>\n<!--<div class=\"stepBar\"></div>-->\n<!--<div class=\"content\">-->\n<!--<div class=\"app-item buttons\"></div>-->\n<!--<div class=\"app-item hide\">-->\n<!--<div class=\"table\"></div>-->\n<!--<div class=\"btn\"></div>-->\n<!--</div>-->\n<!--<div class=\"app-item buttons hide\"></div>-->\n</div>\n</div>");
        };
        // private stepBar: StepBar;
        AppPublish.prototype.init = function (para, data) {
            this.title = "应用发布";
            // 步骤条
            // this.stepBar = new StepBar({
            //     btnArr:['导入脚本','功能列表','发布'],
            //     // changePage:(index)=>{
            //     //     this.showItem(index);
            //     // },
            //     container:d.query('.stepBar',this.wrapper),
            //     allowClickNum:false
            // });
            // let items = d.queryAll('.app-item',this.wrapper);
            // items.forEach((item,index)=>{
            //     if (index === 0){
            //         // 导入脚本
            //         new Button({
            //             content:'导入脚本',
            //             container:item,
            //             className:'function-btn',
            //             onClick:()=>{
            //
            //             }
            //         });
            //         new Button({
            //             content:'下一步',
            //             container:item,
            //             className:'step-btn',
            //             onClick:()=>{
            //                 this.showItem(1);
            //                 this.stepBar.currentIndex = 1;
            //             }
            //         });
            //     }
            //     else if (index === 1){
            //         // 功能列表
            //         new Button({
            //             content:'上一步',
            //             container:d.query('.btn',item),
            //             className:'prev-step-btn',
            //             onClick:()=>{
            //                 this.showItem(0);
            //                 this.stepBar.currentIndex = 0;
            //             }
            //         });
            //         new Button({
            //             content:'下一步',
            //             container:d.query('.btn',item),
            //             className:'step-btn',
            //             onClick:()=>{
            //                 this.showItem(2);
            //                 this.stepBar.currentIndex = 2;
            //             }
            //         });
            //     }
            //     else {
            //         // 发布
            //         new Button({
            //             content:'发布',
            //             container:item,
            //             className:'function-btn',
            //             onClick:()=>{
            //
            //             }
            //         });
            //         new Button({
            //             content:'上一步',
            //             container:item,
            //             className:'step-btn',
            //             onClick:()=>{
            //                 this.showItem(1);
            //                 this.stepBar.currentIndex = 1;
            //             }
            //         });
            //     }
            // })
            var uploader = new uploader_1.Uploader({
                uploadUrl: DV.CONF.ajaxUrl.uploadfile,
                nameField: 'FILE_ID',
                onComplete: function (res) {
                    if (parseInt(res.code) === 200) {
                        Modal_1.Modal.toast('上传并发布成功');
                    }
                },
                container: d.query('.uploadBtn', this.wrapper),
                text: '导入脚本并发布'
            });
            var ext = ['txt', 'sql'];
            uploader.on('fileQueued', function (file) {
                if (ext.indexOf(file.ext) !== -1) {
                    uploader.upload();
                }
                else {
                    Modal_1.Modal.alert('请导入以sql或txt为后缀的文件');
                }
            });
            // new Button({
            //     content: '发布',
            //     container: d.query('.app-publish', this.wrapper),
            //     className: 'function-btn',
            //     onClick: () => {
            //
            // });
        };
        return AppPublish;
    }(SPAPage));
    exports.AppPublish = AppPublish;
});

define("LogQuery", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LogQuery"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var LogQuery = /** @class */ (function (_super) {
        __extends(LogQuery, _super);
        function LogQuery() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(LogQuery.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = title;
            },
            enumerable: true,
            configurable: true
        });
        LogQuery.prototype.wrapperInit = function () {
            return d.create("<div class=\"log-query\"></div>");
        };
        LogQuery.prototype.init = function (para, data) {
            this.title = "日志查询";
        };
        return LogQuery;
    }(SPAPage));
    exports.LogQuery = LogQuery;
});

/// <amd-module name="AuthorityConfigPage"/>
define("AuthorityConfigPage", ["require", "exports", "PrivilegeControl"], function (require, exports, privilegeControl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPAPage = G.SPAPage;
    var d = G.d;
    var AuthorityConfigPage = /** @class */ (function (_super) {
        __extends(AuthorityConfigPage, _super);
        function AuthorityConfigPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(AuthorityConfigPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = title;
            },
            enumerable: true,
            configurable: true
        });
        AuthorityConfigPage.prototype.wrapperInit = function () {
            return d.create('<div class="authorityConfigPage" data-src="http://127.0.0.1?uiTypeTest=privilegeConfigure"></div>');
        };
        AuthorityConfigPage.prototype.init = function (para, data) {
            this.title = "权限配置";
            this.wrapper.dataset.src = "http://127.0.0.1?uiTypeTest=privilegeConfigure";
            new privilegeControl_1.PrivilegeControl({
                dom: d.query('.authorityConfigPage', this.wrapper),
                url: 'http://bwd.fastlion.cn:7776/sf/app_sanfu_retail/v1/inter/dp/priv-1/privsget'
            });
        };
        return AuthorityConfigPage;
    }(SPAPage));
    exports.AuthorityConfigPage = AuthorityConfigPage;
});

/// <amd-module name="AuthoritySearchPage"/>
define("AuthoritySearchPage", ["require", "exports", "PrivilegeControl", "DVAjax"], function (require, exports, privilegeControl_1, DVAjax_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var AuthoritySearchPage = /** @class */ (function (_super) {
        __extends(AuthoritySearchPage, _super);
        function AuthoritySearchPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(AuthoritySearchPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = title;
            },
            enumerable: true,
            configurable: true
        });
        AuthoritySearchPage.prototype.wrapperInit = function () {
            return d.create('<div class="authoritySearchPage" data-src="http://127.0.0.1?uiTypeTest=privilegeSearch"></div>');
        };
        AuthoritySearchPage.prototype.init = function (para, data) {
            this.title = "权限查询";
            this.wrapper.dataset.src = "http://127.0.0.1?uiTypeTest=privilegeSearch";
            var url = tools.url.addObj('http://bwd.fastlion.cn:7776/sf/app_sanfu_retail/v1/sso', {
                userid: localStorage.getItem('userId'),
                forwardurl: tools.url.addObj('ui/pick/n1174_data-4/pick-4', { isMb: true, output: 'json' })
            });
            DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                var response = _a.response;
                var body = response.body;
                if (tools.isNotEmpty(body)) {
                    var dataAddr = body.elements[0].dataAddr.dataAddr, pick = dataAddr.split('/'), urlStrem = '';
                    for (var i = 3; i < pick.length; i++) {
                        if (i === 3) {
                            urlStrem = urlStrem + pick[i];
                        }
                        else {
                            urlStrem = urlStrem + '/' + pick[i];
                        }
                    }
                    dataAddr = tools.url.addObj('/app_sanfu_retail/v1/sso', {
                        userid: localStorage.getItem('userId'),
                        forwardurl: tools.url.addObj(urlStrem, { isMb: true, output: 'json' })
                    });
                    body.elements[0].dataAddr.dataAddr = dataAddr;
                    localStorage.setItem('authority_search_elements', JSON.stringify(response.body.elements[0]));
                }
            });
            new privilegeControl_1.PrivilegeControl({
                dom: d.query('.authoritySearchPage', this.wrapper),
                url: 'http://bwd.fastlion.cn:7776/sf/app_sanfu_retail/v1/inter/dp/priv-1/privsget',
                iurl: './tpl.html'
            });
        };
        return AuthoritySearchPage;
    }(SPAPage));
    exports.AuthoritySearchPage = AuthoritySearchPage;
});

/// <amd-module name="FieldEditorPage"/>
define("FieldEditorPage", ["require", "exports", "Modal", "Button", "FastTable", "TextInputModule", "CheckBox", "DVAjax", "DropDownModule"], function (require, exports, Modal_1, Button_1, FastTable_1, TextInputModule_1, checkBox_1, DVAjax_1, DropDownModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPAPage = G.SPAPage;
    var d = G.d;
    var config = DV.CONF;
    var tools = G.tools;
    var FieldEditorPage = /** @class */ (function (_super) {
        __extends(FieldEditorPage, _super);
        function FieldEditorPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(FieldEditorPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        FieldEditorPage.prototype.wrapperInit = function () {
            return d.create("<div class=\"fieldEditorPage\">\n<div class=\"conditions\"></div>\n<div class=\"buttons\"></div>\n<div class=\"table\"></div>\n</div>");
        };
        FieldEditorPage.prototype.init = function (para, data) {
            this.title = '字段编辑器';
            this.initConditions();
            this.initButtons();
            this.createPageTable();
        };
        FieldEditorPage.prototype.initConditions = function () {
            var _this = this;
            var captionValue = '';
            var caption = new TextInputModule_1.TextInputModule({
                title: '字段名称',
                container: d.query('.conditions', this.wrapper),
            });
            caption.textInput.on('change', function (e) {
                var input = e.target;
                if (input.value === captionValue) {
                    return;
                }
                _this.getAllConditionsData();
                captionValue = input.value;
            });
            var filedNameValue = '';
            var fieldName = new TextInputModule_1.TextInputModule({
                title: '字段标题',
                container: d.query('.conditions', this.wrapper),
            });
            fieldName.textInput.on('change', function (e) {
                var input = e.target;
                if (input.value === filedNameValue) {
                    return;
                }
                _this.getAllConditionsData();
                filedNameValue = input.value;
            });
            this.conditions = {
                fieldName: fieldName,
                caption: caption
            };
            d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'));
        };
        FieldEditorPage.prototype.getAllConditionsData = function () {
            var cond = this.conditions;
            if (cond) {
                var fieldName = cond.fieldName.get().replace(/\s+/g, ""), caption = cond.caption.get().replace(/\s+/g, "");
                var obj = {
                    field_name: fieldName,
                    caption: caption
                };
                this.ajaxPara = obj;
            }
        };
        Object.defineProperty(FieldEditorPage.prototype, "ajaxPara", {
            get: function () {
                if (!this._ajaxPara) {
                    this._ajaxPara = {
                        field_name: '',
                        caption: ''
                    };
                }
                return this._ajaxPara;
            },
            set: function (para) {
                this._ajaxPara = para;
                this._table && this._table._clearAllSelectedCells();
                this._table && this._table.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        FieldEditorPage.prototype.handlerAjaxPara = function () {
            var str = '&fuzzyparams={', paraStr = '', ajaxParaData = this.ajaxPara;
            for (var key in ajaxParaData) {
                if (tools.isNotEmpty(ajaxParaData[key])) {
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(ajaxParaData[key]) ? '"' + ajaxParaData[key] + '"' : '""') + ',';
                }
            }
            if (tools.isNotEmpty(paraStr)) {
                paraStr = paraStr.slice(0, paraStr.length - 1);
                str = str + paraStr + '}';
                return encodeURI(str);
            }
            else {
                return '';
            }
        };
        Object.defineProperty(FieldEditorPage.prototype, "tableCol", {
            get: function () {
                if (!this._tableCol) {
                    this._tableCol = [
                        { name: 'caption', title: '字段名称' },
                        { name: 'fieldName', title: '字段标题' },
                        { name: 'alignment', title: '对齐方式' },
                        { name: 'allowScan', title: '允许扫描输入' },
                        { name: 'dataType', title: '数据类型' },
                        { name: 'dataTypeFlag', title: '数据类型标识' },
                        { name: 'displayWidth', title: '显示宽度' },
                        { name: 'displayFormat', title: '显示格式' },
                        { name: 'editFormt', title: '编辑格式' },
                        { name: 'imeCare', title: '操纵输入法' },
                        { name: 'imeOpen', title: '打开输入法' },
                        { name: 'inputHint', title: '输入提示' },
                        { name: 'validChars', title: '有效字符' },
                        { name: 'invalidChars', title: '无效字符' },
                        { name: 'checkExpress', title: '校验表达式' },
                        { name: 'checkMessage', title: '校验信息' },
                        { name: 'maxLength', title: '最大长度' },
                        { name: 'minLength', title: '最小长度' },
                        { name: 'maxValue', title: '最大值' },
                        { name: 'minValue', title: '最小值' },
                        { name: 'defaultValue', title: '默认值' },
                        { name: 'multiValueFlag', title: '多值标识' },
                        { name: 'noCopy', title: '不可复制' },
                        { name: 'noEdit', title: '不可编辑' },
                        { name: 'noSort', title: '不可排序' },
                        { name: 'noSum', title: '不可汇总' },
                        { name: 'readOnlyFlag', title: '只读标识' },
                        { name: 'requieredFlag', title: '必输' },
                        { name: 'valueListType', title: '字段值的列表类型' },
                        { name: 'valueLists', title: '字段值的列表' },
                        { name: 'hyperRes', title: '链接资源' },
                        { name: 'trueExpr', title: '真值表达' },
                        { name: 'falseExpr', title: '假值表达' },
                        { name: 'nameRuleFlag', title: '命名规则标识' },
                        { name: 'nameRuleId', title: '命名规则编号' },
                    ];
                }
                return this._tableCol;
            },
            enumerable: true,
            configurable: true
        });
        FieldEditorPage.prototype.initButtons = function () {
            var _this = this;
            var btnArr = [
                {
                    name: '新增',
                    iconPre: 'dev',
                    icon: 'de-xinzeng'
                },
                {
                    name: '修改',
                    iconPre: 'dev',
                    icon: 'de-xiugai'
                },
                {
                    name: '删除',
                    iconPre: 'dev',
                    icon: 'de-shanchu'
                }
            ];
            btnArr.forEach(function (btn, index) {
                new Button_1.Button({
                    content: btn.name,
                    iconPre: btn.iconPre,
                    icon: btn.icon,
                    container: d.query('.buttons', _this.wrapper),
                    onClick: function (e) {
                        switch (index) {
                            case 0:
                                {
                                    // 新增
                                    _this.editModal(true);
                                }
                                break;
                            case 1:
                                {
                                    // 修改
                                    _this.editModal(false);
                                }
                                break;
                            case 2:
                                {
                                    // 删除
                                    var selectRows = _this._table.selectedRows, deleteItem_1 = [];
                                    if (selectRows.length <= 0) {
                                        Modal_1.Modal.alert("请先选择要删除的字段");
                                        return;
                                    }
                                    selectRows.forEach(function (row) {
                                        var item = {};
                                        row.cells.forEach(function (cell) {
                                            item[cell.name] = cell.text;
                                        });
                                        deleteItem_1.push(item);
                                    });
                                    var para_1 = {
                                        type: "field",
                                        delete: deleteItem_1
                                    };
                                    Modal_1.Modal.confirm({
                                        msg: '确定要删除吗？',
                                        title: '温馨提示',
                                        callback: function (flag) {
                                            flag && DVAjax_1.DVAjax.fieldManagerAjax({ type: 'POST', data: para_1 }, function (res) {
                                                Modal_1.Modal.toast(res.msg);
                                                _this.clearAjaxPara();
                                            });
                                        }
                                    });
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
            });
        };
        FieldEditorPage.prototype.clearAjaxPara = function () {
            var cond = this.conditions;
            cond['fieldName'].set('');
            cond['caption'].set('');
            this.getAllConditionsData();
        };
        FieldEditorPage.prototype.createPageTable = function () {
            var _this = this;
            var alignment = ['左对齐', '右对齐', '剧中'];
            this._table = new FastTable_1.FastTable({
                container: d.query('.table', this.wrapper),
                cols: [this.tableCol],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.fieldEditor + '?pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara();
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            var data = response.dataArr, total = 0;
                            tools.isNotEmptyArray(data) && (total = response.head.total);
                            data.forEach(function (item) {
                                item.noCopy = item.noCopy === 0 ? '否' : '是';
                                item.noEdit = item.noEdit === 0 ? '否' : '是';
                                item.noSort = item.noSort === 0 ? '否' : '是';
                                item.noSum = item.noSum === 0 ? '否' : '是';
                                item.readOnlyFlag = item.readOnlyFlag === 0 ? '否' : '是';
                                item.allowScan = item.allowScan === 0 ? '否' : '是';
                                item.imeCare = item.imeCare === 0 ? '否' : '是';
                                item.imeOpen = item.imeOpen === 0 ? '否' : '是';
                                item.requieredFlag = item.requieredFlag === 0 ? '否' : '是';
                                item.alignment = alignment[item.alignment];
                            });
                            return { data: data, total: total };
                        });
                    },
                    auto: true,
                    once: false
                },
                page: {
                    size: 50,
                    options: [50, 100, 200]
                }
            });
        };
        FieldEditorPage.prototype.editModal = function (isNew) {
            var _this = this;
            var modalBody = d.create("\n        <div class=\"field-modal\">\n        <div class=\"long-inputs\"></div>\n        <div class=\"checkbox-items\"></div>\n</div>\n        ");
            var textInputArr = [
                {
                    title: '字段名称*',
                    id: 'caption'
                },
                {
                    title: '字段标题*',
                    id: 'fieldName'
                },
                {
                    title: '对齐方式*',
                    value: ['左对齐', '右对齐', '居中'],
                    id: 'alignment'
                },
                {
                    title: '数据类型',
                    id: 'dataType'
                },
                {
                    title: '链接资源',
                    id: 'hyperRes'
                },
                {
                    title: '输入提示',
                    id: 'inputHint'
                },
                {
                    title: '显示格式',
                    id: 'displayFormat'
                },
                {
                    title: '编辑格式',
                    id: 'editFormat'
                },
                {
                    title: "最大长度",
                    id: 'maxLength'
                },
                {
                    title: "最小长度",
                    id: 'minLength'
                },
                {
                    title: "显示宽度",
                    id: 'displayWidth'
                },
                {
                    title: "最大值",
                    id: 'maxValue'
                },
                {
                    title: "最小值",
                    id: 'minValue'
                },
                {
                    title: "默认值",
                    id: 'defaultValue'
                },
                {
                    title: '有效字符',
                    id: 'validChars'
                },
                {
                    title: '无效字符',
                    id: 'invalidChars'
                },
                {
                    title: '校验表达式',
                    id: 'checkExpress'
                },
                {
                    title: '校验信息',
                    id: 'checkMessage'
                },
                {
                    title: '真值表达',
                    id: 'trueExpr'
                },
                {
                    title: '假值表达',
                    id: 'falseExpr'
                },
                {
                    title: '数据类型标识',
                    id: 'dataTypeFlag'
                },
                {
                    title: '字段值的列表',
                    id: 'valueLists'
                },
                {
                    title: '字段值的列表类型',
                    id: 'valueListType',
                    className: 'valueListType'
                }
            ];
            textInputArr.forEach(function (value, index, arr) {
                var shortInput = null;
                if (Array.isArray(value.value)) {
                    shortInput = new DropDownModule_1.DropDownModule({
                        container: d.query('.long-inputs', modalBody),
                        title: value.title,
                        data: value.value,
                        disabled: false,
                        dropClassName: value.id
                    });
                    d.query('.long-inputs', modalBody).appendChild(d.create('<div class="clear"></div>'));
                }
                else {
                    shortInput = new TextInputModule_1.TextInputModule({
                        container: d.query('.long-inputs', modalBody),
                        title: value.title,
                        className: tools.isNotEmpty(value.className) ? value.className : ''
                    });
                }
                _this.modalItems[value.id] = shortInput;
            });
            d.query('.long-inputs', modalBody).appendChild(d.create('<div class="clear"></div>'));
            var checkBoxArr = [
                {
                    text: "*必输",
                    id: 'requieredFlag'
                },
                {
                    text: '*只读',
                    id: 'readOnlyFlag'
                },
                {
                    text: "*不可编辑",
                    id: 'noEdit'
                },
                {
                    text: "*不可复制",
                    id: 'noCopy'
                },
                {
                    text: "*不可排序",
                    id: 'noSort'
                },
                {
                    text: '*操纵输入法',
                    id: 'imeCare'
                },
                {
                    text: '*打开输入法',
                    id: 'imeOpen'
                },
                {
                    text: "不可汇总",
                    id: 'noSum'
                },
                {
                    text: '允许扫描输入',
                    id: 'allowScan'
                },
                {
                    text: '多值标识',
                    id: 'multiValueFlag'
                },
                {
                    text: '命名规则标识',
                    id: 'nameRuleFlag'
                },
                {
                    text: '命名规则编号',
                    id: 'nameRuleId'
                }
            ];
            checkBoxArr.forEach(function (value) {
                var check = new checkBox_1.CheckBox({
                    text: value.text,
                    container: d.query('.checkbox-items', modalBody)
                });
                _this.modalItems[value.id] = check;
            });
            d.query('.checkbox-items', modalBody).appendChild(d.create('<div class="clear"></div>'));
            d.queryAll('label', modalBody).forEach(function (label) {
                label.innerHTML = tools.highlight(label.innerText, '*', 'red');
            });
            d.queryAll('.select-box span', modalBody).forEach(function (span) {
                span.innerHTML = tools.highlight(span.innerText, '*', 'red');
            });
            if (isNew === false) {
                if (!this.setModalBodyContent()) {
                    return;
                }
            }
            var header = isNew ? '新增字段' : '修改字段';
            var modal = new Modal_1.Modal({
                body: modalBody,
                header: header,
                width: '600px',
                footer: {},
                onOk: function () {
                    var editType = isNew ? 'insert' : 'update';
                    var para = {
                        type: 'field'
                    };
                    var isOk = true;
                    if (tools.isEmpty(_this.modalItems['caption'].get().replace(/\s+/g, ''))) {
                        Modal_1.Modal.alert('字段名称不能为空!');
                        isOk = false;
                    }
                    if (isOk) {
                        if (tools.isEmpty(_this.modalItems['fieldName'].get().replace(/\s+/g, ''))) {
                            Modal_1.Modal.alert('字段标题不能为空!');
                            isOk = false;
                        }
                    }
                    if (isOk) {
                        para[editType] = [_this.getFormContent()];
                        DVAjax_1.DVAjax.fieldManagerAjax({ type: 'POST', data: para }, function (res) {
                            Modal_1.Modal.toast(res.msg);
                            modal.destroy();
                        });
                    }
                },
                onCancel: function () {
                    Modal_1.Modal.confirm({
                        msg: '确认取消编辑?',
                        title: '温馨提示',
                        callback: function (flag) {
                            if (flag) {
                                modal.destroy();
                            }
                        }
                    });
                }
            });
        };
        Object.defineProperty(FieldEditorPage.prototype, "modalItems", {
            get: function () {
                if (!this._modalItems) {
                    this._modalItems = {
                        fieldName: null,
                        caption: null,
                        requieredFlag: null,
                        inputHint: null,
                        validChars: null,
                        invalidChars: null,
                        checkExpress: null,
                        checkMessage: null,
                        readOnlyFlag: null,
                        noEdit: null,
                        noCopy: null,
                        noSum: null,
                        noSort: null,
                        alignment: null,
                        maxLength: null,
                        minLength: null,
                        displayWidth: null,
                        displayFormat: null,
                        editFormat: null,
                        dataType: null,
                        maxValue: null,
                        minValue: null,
                        defaultValue: null,
                        imeCare: null,
                        imeOpen: null,
                        valueLists: null,
                        valueListType: null,
                        hyperRes: null,
                        multiValueFlag: null,
                        trueExpr: null,
                        falseExpr: null,
                        nameRuleFlag: null,
                        nameRuleId: null,
                        dataTypeFlag: null,
                        allowScan: null
                    };
                }
                return this._modalItems;
            },
            enumerable: true,
            configurable: true
        });
        FieldEditorPage.prototype.setModalBodyContent = function () {
            var selectRows = this._table.selectedRows;
            if (selectRows.length <= 0) {
                Modal_1.Modal.alert('请先选择修改的字段');
                return false;
            }
            else if (selectRows.length > 1) {
                Modal_1.Modal.alert('请只选择一个字段');
                return false;
            }
            else {
                var cells = selectRows[0].cells;
                var obj_1 = {};
                var arr_1 = ['noCopy', 'noSort', 'noSum', 'noEdit', 'readOnlyFlag', 'allowScan', 'requiredFlag', 'imeCare', 'imeOpen', 'multiValueFlag', 'nameRuleFlag', 'nameRuleId'];
                cells.forEach(function (cell) {
                    if (arr_1.indexOf(cell.name) !== -1) {
                        obj_1[cell.name] = (cell.text === '否' || tools.isEmpty(cell.text) || cell.text === '0') ? 0 : 1;
                    }
                    else {
                        obj_1[cell.name] = cell.text;
                    }
                });
                for (var key in this.modalItems) {
                    if (obj_1.hasOwnProperty(key)) {
                        this.modalItems[key].set(obj_1[key]);
                    }
                }
                return true;
            }
        };
        FieldEditorPage.prototype.getFormContent = function () {
            var obj = {}, alignment = ['左对齐', '右对齐', '剧中'];
            for (var key in this.modalItems) {
                obj[key] = this.modalItems[key].get();
                if (typeof obj[key] === 'boolean') {
                    obj[key] = obj[key] ? 1 : 0;
                }
                if (tools.isEmpty(obj[key])) {
                    obj[key] = 0;
                }
            }
            return obj;
        };
        return FieldEditorPage;
    }(SPAPage));
    exports.FieldEditorPage = FieldEditorPage;
});

define("LoginPage", ["require", "exports", "Button", "TextInput", "CheckBox", "Modal", "DVAjax", "SelectInput"], function (require, exports, Button_1, text_1, checkBox_1, Modal_1, DVAjax_1, selectInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LoginPage"/>
    var SPAPage = G.SPAPage;
    var tools = G.tools;
    var d = G.d;
    var SPA = G.SPA;
    var LoginPage = /** @class */ (function (_super) {
        __extends(LoginPage, _super);
        function LoginPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(LoginPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = '登录';
            },
            enumerable: true,
            configurable: true
        });
        LoginPage.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"loginPage\">\n        <div class=\"logo\"><img src=\"../../img/develop/login-logo.png\" alt=\"\"></div>\n        <div class=\"login-form\">\n        <div class=\"account from-group\"><label>\u8D26\u53F7&nbsp;&nbsp;&nbsp;</label></div>\n        <div class=\"pwd from-group\"><label>\u5BC6\u7801&nbsp;&nbsp;&nbsp;</label></div>\n        <div class=\"select-sys from-group\"><label>\u5B50\u7CFB\u7EDF&nbsp;&nbsp;&nbsp;</label></div>\n        <div class=\"remember-pwd from-group\"><label></label></div>\n        <div class=\"login-btn from-group\"><label></label></div>\n        \n</div>\n<div class=\"info\">\u00A9 2018 \u901F\u72EE\u8F6F\u4EF6\u7248\u6743\u6240\u6709</div>\n</div>\n        ");
        };
        LoginPage.prototype.init = function (para, data) {
            var _this = this;
            this.title = "登录";
            var account = new text_1.TextInput({
                placeholder: '请输入账号',
                container: d.query('.account', this.wrapper)
            });
            account.on('input', function (e) {
                var input = e.target, value = input.value.replace(/\s+/g, "");
                input.value = value.toUpperCase();
                if (tools.isNotEmpty(localStorage.getItem(value))) {
                    _this.formItems.pwd.set(localStorage.getItem(value));
                }
            });
            var pwd = new text_1.TextInput({
                placeholder: '请输入密码',
                container: d.query('.pwd', this.wrapper),
                type: 'password'
            });
            var selectSys = new selectInput_1.SelectInput({
                container: d.query('.select-sys', this.wrapper),
                dropClassName: 'appId'
            });
            DVAjax_1.DVAjax.getAppId(function (res) {
                selectSys.setPara({ data: res });
                tools.isNotEmptyArray(res) && selectSys.set('app_sanfu_retail');
            });
            var rememberPwd = new checkBox_1.CheckBox({
                text: '记住密码',
                container: d.query('.remember-pwd', this.wrapper)
            });
            this.formItems = {
                account: account,
                pwd: pwd,
                rememberPwd: rememberPwd,
                selectSys: selectSys
            };
            var localAccount = localStorage.getItem('account'), localPwd = localStorage.getItem(localAccount);
            if (tools.isNotEmpty(localAccount) && tools.isNotEmpty(localPwd)) {
                account.set(localAccount);
                pwd.set(localPwd);
                selectSys.set(localStorage.getItem('app_id'));
                rememberPwd.set(true);
            }
            var loginBtn = new Button_1.Button({
                content: '登录',
                container: d.query('.login-btn', this.wrapper),
                onClick: function () {
                    var formItems = _this.formItems, account = formItems.account.get().replace(/\s+/g, ""), pwd = formItems.pwd.get().replace(/\s+/g, ""), isSave = formItems.rememberPwd.get(), app_id = formItems.selectSys.get(), self = _this;
                    if (tools.isEmpty(account)) {
                        Modal_1.Modal.toast('请填写账号');
                        return;
                    }
                    if (tools.isEmpty(pwd)) {
                        Modal_1.Modal.toast('请填写密码');
                        return;
                    }
                    // 登录
                    DVAjax_1.DVAjax.encyptionPassword(pwd, function (res) {
                        if (res.errorCode === 0) {
                            var encyptionPwd = res.data;
                            DVAjax_1.DVAjax.login({
                                type: 'POST',
                                data: [{ "userid": account, "password": encyptionPwd, "oappid": app_id }]
                            }, function (logRes) {
                                if (logRes.errorCode === 0) {
                                    Modal_1.Modal.toast(logRes.msg);
                                    if (isSave) {
                                        self.savePwd(account, pwd);
                                    }
                                    // 存app_id
                                    localStorage.setItem('app_id', selectSys.get());
                                    // 存userId
                                    localStorage.setItem('userId', logRes.data.userId);
                                    SPA.open(SPA.hashCreate('develop', 'home'));
                                }
                            });
                        }
                    });
                }
            });
        };
        LoginPage.prototype.savePwd = function (account, pwd) {
            localStorage.setItem('account', account);
            localStorage.setItem(account, pwd);
        };
        return LoginPage;
    }(SPAPage));
    exports.LoginPage = LoginPage;
});

/// <amd-module name="CondDesignPage"/>
define("CondDesignPage", ["require", "exports", "TextInputModule", "DropDownModule", "DVAjax", "Button", "Modal", "FastTable"], function (require, exports, TextInputModule_1, DropDownModule_1, DVAjax_1, Button_1, Modal_1, FastTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPAPage = G.SPAPage;
    var d = G.d;
    var config = DV.CONF;
    var tools = G.tools;
    var CondDesignPage = /** @class */ (function (_super) {
        __extends(CondDesignPage, _super);
        function CondDesignPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(CondDesignPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = title;
            },
            enumerable: true,
            configurable: true
        });
        CondDesignPage.prototype.wrapperInit = function () {
            return d.create("<div class=\"condDesign\">\n<div class=\"conditions\"></div>\n            <div class=\"buttons\"></div>\n            <div class=\"table\"></div>\n</div>");
        };
        CondDesignPage.prototype.init = function (para, data) {
            this.title = "条件设计";
            this.initConditions();
            this.initButtons();
            this.initTable();
        };
        CondDesignPage.prototype.initConditions = function () {
            var _this = this;
            var condIdValue = '', condId = new TextInputModule_1.TextInputModule({
                title: '条件ID',
                container: d.query('.conditions', this.wrapper)
            });
            condId.textInput.on('blur', function (e) {
                var input = e.target;
                if (input.value === condIdValue) {
                    return;
                }
                _this.getAllConditions();
                condIdValue = input.value;
            });
            var condTypeValue = '', condType = new TextInputModule_1.TextInputModule({
                title: '条件类型',
                container: d.query('.conditions', this.wrapper)
            });
            condType.textInput.on('blur', function (e) {
                var input = e.target;
                if (input.value === condTypeValue) {
                    return;
                }
                _this.getAllConditions();
                condTypeValue = input.value;
            });
            var dataSource = new DropDownModule_1.DropDownModule({
                title: '数据源',
                container: d.query('.conditions', this.wrapper),
                disabled: false,
                changeValue: function () {
                    _this.getAllConditions();
                }
            });
            d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'));
            this.conditions = {
                condId: condId,
                condType: condType,
                dataSource: dataSource
            };
            DVAjax_1.DVAjax.dataSourceQueryAjax(function (res) {
                _this.dataSource = res.slice();
                res.unshift('请选择');
                dataSource.dpData = res;
            });
        };
        CondDesignPage.prototype.getAllConditions = function () {
            var cond = this.conditions, cond_id = cond['condId'].get().replace(/\s+/g, ""), cond_type = cond['condType'].get().replace(/\s+/g, ""), dataSource = cond['dataSource'].get().replace(/\s+/g, "");
            dataSource = dataSource === '请选择' ? '' : dataSource;
            var obj = {
                cond_id: cond_id,
                cond_type: cond_type,
                data_source: dataSource
            };
            this.condAjaxPara = obj;
        };
        Object.defineProperty(CondDesignPage.prototype, "condAjaxPara", {
            get: function () {
                return this._condAjaxPara;
            },
            set: function (para) {
                this._condAjaxPara = para;
                this.condTable && this.condTable._clearAllSelectedCells();
                this.condTable && this.condTable.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        CondDesignPage.prototype.initButtons = function () {
            var _this = this;
            var btnArr = [
                {
                    name: '新增',
                    iconPre: 'dev',
                    icon: 'de-xinzeng'
                },
                {
                    name: '修改',
                    iconPre: 'dev',
                    icon: 'de-xiugai'
                },
                {
                    name: '删除',
                    iconPre: 'dev',
                    icon: 'de-shanchu'
                }
            ];
            btnArr.forEach(function (btn, index) {
                var self = _this;
                new Button_1.Button({
                    content: btn.name,
                    iconPre: btn.iconPre,
                    icon: btn.icon,
                    container: d.query('.buttons', _this.wrapper),
                    onClick: function (e) {
                        switch (index) {
                            case 0:
                                {
                                    // 新增
                                    _this.updateOrInsertElement();
                                }
                                break;
                            case 1:
                                {
                                    var selectRows = _this.condTable.selectedRows;
                                    if (selectRows.length <= 0) {
                                        Modal_1.Modal.alert('请先选择一个条件');
                                    }
                                    else if (selectRows.length > 1) {
                                        Modal_1.Modal.alert('请只选择一个条件');
                                    }
                                    else {
                                        var row = selectRows[0], cellsData_1 = {};
                                        row.cells.forEach(function (cell) {
                                            cellsData_1[cell.name] = cell.text;
                                        });
                                        _this.updateOrInsertElement(cellsData_1);
                                    }
                                }
                                break;
                            case 2:
                                {
                                    // 删除
                                    var selectRows = _this.condTable.selectedRows, deleteItem_1 = [];
                                    if (selectRows.length <= 0) {
                                        Modal_1.Modal.alert("请先选择要删除的条件");
                                        return;
                                    }
                                    selectRows.forEach(function (row) {
                                        var item = {};
                                        row.cells.forEach(function (cell) {
                                            item[cell.name] = cell.text;
                                        });
                                        deleteItem_1.push(item);
                                    });
                                    var para_1 = {
                                        type: "cond",
                                        delete: deleteItem_1
                                    };
                                    Modal_1.Modal.confirm({
                                        msg: '确定要删除吗？',
                                        title: '温馨提示',
                                        callback: function (flag) {
                                            flag && DVAjax_1.DVAjax.handlerConditons({ type: 'POST', data: para_1 }, function (res) {
                                                Modal_1.Modal.toast(res.msg);
                                                self.clearCondAjaxPara();
                                            });
                                        }
                                    });
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
            });
        };
        Object.defineProperty(CondDesignPage.prototype, "condTableCols", {
            get: function () {
                if (!this._condTableCols) {
                    this._condTableCols = [{ name: 'condId', title: '条件 ID' },
                        { name: 'condSql', title: '条件Sql' },
                        { name: 'condType', title: '条件类型' },
                        { name: 'showText', title: '显示文本' },
                        { name: 'dataSource', title: '数据源' },
                        { name: 'condFieldName', title: '条件字段名称' }
                    ];
                }
                return this._condTableCols;
            },
            enumerable: true,
            configurable: true
        });
        CondDesignPage.prototype.initTable = function () {
            var _this = this;
            this.condTable = new FastTable_1.FastTable({
                container: d.query('.table', this.wrapper),
                cols: [this.condTableCols],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.queryCondition + '?pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara();
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            var data = response.dataArr, total = 0;
                            tools.isNotEmptyArray(data) && (total = response.head.total);
                            return { data: data, total: total };
                        });
                    },
                    auto: false,
                    once: false
                },
                page: {
                    size: 50,
                    options: [50, 100]
                }
            });
        };
        CondDesignPage.prototype.handlerAjaxPara = function () {
            var str = '&fuzzyparams={', paraStr = '', ajaxParaData = this.condAjaxPara;
            for (var key in ajaxParaData) {
                if (tools.isNotEmpty(ajaxParaData[key])) {
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(ajaxParaData[key]) ? '"' + ajaxParaData[key] + '"' : '""') + ',';
                }
            }
            if (tools.isNotEmpty(paraStr)) {
                paraStr = paraStr.slice(0, paraStr.length - 1);
                str = str + paraStr + '}';
                return encodeURI(str);
            }
            else {
                return '';
            }
        };
        CondDesignPage.prototype.updateOrInsertElement = function (obj) {
            var title = tools.isNotEmpty(obj) ? '修改条件' : '新增条件', // Modal的title
            cols = this.condTableCols, // 表单name对应
            html = this.createModalBody(cols, obj), // 获取Modal的body
            self = this;
            var modal = new Modal_1.Modal({
                header: {
                    title: title
                },
                body: html,
                footer: {},
                width: '700px',
                isOnceDestroy: true,
                className: 'condModal',
                onOk: function () {
                    var elements = d.queryAll('.form-control', d.query('.form-horizontal', document.body)), data = {};
                    for (var j = 0; j < elements.length; j++) {
                        var name_1 = elements[j].getAttribute('name'), element = elements[j];
                        if (element.value) {
                            data[name_1] = element.value;
                        }
                    }
                    var type = 'update';
                    if (!obj) {
                        // 新增
                        type = 'insert';
                    }
                    var condPara = {
                        type: 'cond',
                    };
                    condPara[type] = [data];
                    var isOk = true;
                    if (tools.isEmpty(data.condId)) {
                        Modal_1.Modal.alert('条件ID不能为空');
                        isOk = false;
                    }
                    if (isOk && data.dataSource === '请选择') {
                        Modal_1.Modal.alert('数据库不能为空');
                        isOk = false;
                    }
                    if (isOk && tools.isEmpty(data.condType)) {
                        Modal_1.Modal.alert('条件类型不能为空');
                        isOk = false;
                    }
                    if (isOk && tools.isEmpty(data.condSql)) {
                        Modal_1.Modal.alert('条件Sql不能为空');
                        isOk = false;
                    }
                    if (isOk) {
                        DVAjax_1.DVAjax.handlerConditons({ type: 'POST', data: condPara }, function (res) {
                            if (res.errorCode === 0) {
                                Modal_1.Modal.toast(res.msg);
                                modal.destroy();
                                self.clearCondAjaxPara();
                            }
                        });
                    }
                },
                onCancel: function (e) {
                    Modal_1.Modal.confirm({
                        msg: '确认要取消编辑吗？', title: '温馨提示', callback: function (flag) {
                            flag && modal.destroy();
                        }
                    });
                }
            });
        };
        CondDesignPage.prototype.clearCondAjaxPara = function () {
            var cond = this.conditions;
            cond['condId'].set('');
            cond['condType'].set('');
            cond['dataSource'].set('请选择');
            this.getAllConditions();
        };
        CondDesignPage.prototype.createModalBody = function (cols, data) {
            var _this = this;
            if (data === void 0) { data = {}; }
            var parentNode = {
                tag: 'from',
                props: {
                    className: 'form-horizontal'
                },
                children: []
            };
            var group = { tag: '' };
            cols.forEach(function (col) {
                if (col.name === 'dataSource') {
                    var value = '';
                    if (tools.isNotEmpty(data)) {
                        value = data[col.name];
                    }
                    group = _this.addDataSource(value);
                }
                else {
                    var type = 'text';
                    group = {
                        tag: 'div',
                        props: {
                            className: 'form-group'
                        },
                        children: [
                            {
                                tag: 'label',
                                props: {
                                    className: 'col-sm-2 control-label',
                                    for: col.name
                                },
                                children: [col.title]
                            }, {
                                tag: 'div',
                                props: {
                                    className: 'col-sm-10'
                                },
                                children: [
                                    {
                                        tag: 'input',
                                        props: {
                                            type: type,
                                            className: 'form-control',
                                            id: col.name,
                                            placeHolder: '请输入' + col.title,
                                            name: col.name
                                        }
                                    }
                                ]
                            }
                        ]
                    };
                    if (tools.isNotEmpty(data)) {
                        group.children[1].children[0].props['value'] = data[col.name];
                    }
                }
                parentNode.children.push(group);
            });
            return d.create(parentNode);
        };
        Object.defineProperty(CondDesignPage.prototype, "dataSource", {
            get: function () {
                return this._dataSource;
            },
            set: function (d) {
                this._dataSource = d;
            },
            enumerable: true,
            configurable: true
        });
        CondDesignPage.prototype.addDataSource = function (value) {
            if (value === void 0) { value = ''; }
            value = tools.isEmpty(value) ? this.dataSource[0] : value;
            var dataSource = {
                tag: 'div',
                props: {
                    className: 'form-group'
                },
                children: [
                    {
                        tag: 'label',
                        props: {
                            className: 'col-sm-2 control-label',
                            for: 'elementType'
                        },
                        children: ['数据源']
                    },
                    {
                        tag: 'div',
                        props: {
                            className: 'col-sm-10'
                        },
                        children: [
                            {
                                tag: 'select',
                                props: {
                                    className: 'form-control',
                                    id: 'dataSource',
                                    name: 'dataSource',
                                },
                                children: []
                            }
                        ]
                    }
                ]
            };
            this.dataSource.forEach(function (data) {
                var obj = {
                    tag: 'option',
                    children: [data]
                };
                if (data === value) {
                    obj.props = {
                        selected: 'selected'
                    };
                }
                var dataSourceGroup = dataSource.children[1];
                dataSourceGroup.children[0].children.push(obj);
            });
            return dataSource;
        };
        return CondDesignPage;
    }(SPAPage));
    exports.CondDesignPage = CondDesignPage;
});

define("ElementDesignPage", ["require", "exports", "DropDownModule", "TextInputModule", "DVAjax", "Button", "Modal", "FastTable"], function (require, exports, DropDownModule_1, TextInputModule_1, DVAjax_1, Button_1, Modal_1, FastTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ElementDesignPage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var config = DV.CONF;
    var ElementDesignPage = /** @class */ (function (_super) {
        __extends(ElementDesignPage, _super);
        function ElementDesignPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ElementDesignPage.prototype.init = function (para, data) {
            this.title = "元素设计";
            this.initButtons();
            this.initConditions();
            var elementTypeData = ['请选择', 'action', 'adt', 'aggregate', 'assign', 'associate', 'calculate', 'default', 'handle', 'import', 'lookup', 'pick', 'value'];
            this.conditions['elementType'].dpData = elementTypeData;
        };
        ElementDesignPage.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"elementManagerment\">\n            <div class=\"conditions\">\n            <div class=\"dropDown\"></div><div class=\"dropDown\"></div><div class=\"dropDown\"></div>\n            </div>\n            <div class=\"buttons\"></div>\n            <div class=\"table\"></div>\n        </div>");
        };
        Object.defineProperty(ElementDesignPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElementDesignPage.prototype, "elementManagermentData", {
            get: function () {
                if (!this._elementManagermentData) {
                    this._elementManagermentData = {
                        all: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'elementType', title: '元素类型' },
                                { name: 'dataSource', title: '数据源' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        action: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'caption', title: '标题' },
                                { name: 'iconName', title: '图标' },
                                { name: 'actionType', title: '操作类型' },
                                { name: 'actionSql', title: '操作SQL' },
                                // {name: 'portId', title: '接口ID'},
                                // {name: 'portSql', title: '接口SQL'},
                                // {name: 'lockSql', title: '锁SQL'},
                                // {name: 'filterExpress', title: '数据集过滤'},
                                // {name: 'updateFields', title: '修改的字段'},
                                { name: 'selectFields', title: '选中字段' },
                                { name: 'refreshFlag', title: '刷新标志' },
                                { name: 'multiPageFlag', title: '分页标志' },
                                { name: 'preFlag', title: '预处理标志' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        adt: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '抽象字段名' },
                                { name: 'caption', title: '抽象字段名称' },
                                { name: 'subFields', title: '子字段名称' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        aggregate: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '聚集字段名' },
                                { name: 'expression', title: '表达式' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        assign: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '字段名' },
                                { name: 'assignSql', title: '赋值SQL' },
                                { name: 'forceFlag', title: '强制标志' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        associate: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '关联字段' },
                                { name: 'associateType', title: '关联类型' },
                                { name: 'caption', title: '标题' },
                                { name: 'iconName', title: '图标' },
                                { name: 'dataType', title: '数据集类型' },
                                { name: 'nodeId', title: '节点ID' },
                                { name: 'pause', title: '是否禁用' }
                                // {name: 'dataSql', title: '数据集SQL'}
                            ]
                        },
                        calculate: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '计算字段' },
                                { name: 'expression', title: '表达式' },
                                { name: 'beforeField', title: '前置字段' },
                                { name: 'posindex', title: '位置编号' },
                                { name: 'dataSize', title: '数据长度' }
                            ]
                        },
                        default: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'defaultSql', title: '默认值SQL' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        handle: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '字段名' },
                                { name: 'fieldType', title: '字段类型' },
                                { name: 'caption', title: '标题' },
                                { name: 'iconName', title: '图标' },
                                // {name: 'hintFlag', title: '提示标志'},
                                { name: 'refreshFlag', title: '刷新标志' },
                                // {name: 'handleType', title: '全局操作类'},
                                // {name: 'baseTable', title: '基表'},
                                // {name: 'sourceSql', title: '源SQL'},
                                // {name: 'targetSql', title: '目标SQL'},
                                // {name: 'seqNo', title: '序号'},
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        import: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'caption', title: '标题' },
                                { name: 'iconName', title: '图标' },
                                { name: 'inventoryType', title: '盘点类型' },
                                { name: 'hotKey', title: '热键' },
                                { name: 'getTitleSql', title: '获取标题SQL' },
                                // {name: 'subTitleSql', title: '子标题SQL'},
                                { name: 'getDataSql', title: '获取数据SQL' },
                                { name: 'inventorySql', title: '判断SQL' },
                                // {name: 'classifySql', title: '分类SQL'},
                                { name: 'keyField', title: '主键字段' },
                                { name: 'nameFields', title: '名称字段' },
                                // {name: 'amountField', title: '数量字段'},
                                { name: 'readOnlyFlag', title: '只读标志' },
                                { name: 'refreshFlag', title: '刷新标志' },
                                { name: 'tagFlag', title: '标识标志' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        lookup: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '字段名' },
                                { name: 'lookUpSql', title: '列表SQL' },
                                { name: 'dataType', title: '数据类型' },
                                { name: 'keyField', title: '主键字段' },
                                // {name: 'resultField', title: '显示字段'},
                                { name: 'beforeField', title: '前置字段' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        pick: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '关联字段名' },
                                { name: 'caption', title: '图标' },
                                { name: 'pickSql', title: '选择SQL' },
                                { name: 'fromField', title: '来源字段' },
                                // {name: 'queryFields', title: '查询字段'},
                                // {name: 'otherFields', title: '其他字段'},
                                { name: 'treeField', title: '树形字段' },
                                // {name: 'levelField', title: '层级字段'},
                                // {name: 'imageNames', title: '图标名称'},
                                // {name: 'treeId', title: '层级树ID'},
                                // {name: 'seperator', title: '多值分隔符'},
                                { name: 'multiValueFlag', title: '多值标志' },
                                { name: 'recursionFlag', title: '递归树图标志' },
                                { name: 'customQuery', title: '自定义查询' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        value: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '字段名' },
                                { name: 'valueSql', title: '字段值SQL' },
                                { name: 'dynamicFlag', title: '限制标志' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        }
                    };
                }
                return this._elementManagermentData;
            },
            enumerable: true,
            configurable: true
        });
        ElementDesignPage.prototype.initButtons = function () {
            var _this = this;
            var btnArr = [
                {
                    name: '新增',
                    iconPre: 'dev',
                    icon: 'de-xinzeng'
                },
                {
                    name: '修改',
                    iconPre: 'dev',
                    icon: 'de-xiugai'
                },
                {
                    name: '删除',
                    iconPre: 'dev',
                    icon: 'de-shanchu'
                }
            ];
            btnArr.forEach(function (btn, index) {
                new Button_1.Button({
                    content: btn.name,
                    iconPre: btn.iconPre,
                    icon: btn.icon,
                    container: d.query('.buttons', _this.wrapper),
                    onClick: function (e) {
                        var elementType = _this.conditions['elementType'].get();
                        if (elementType === '请选择') {
                            Modal_1.Modal.alert("请先选择元素类型");
                            return;
                        }
                        switch (index) {
                            case 0:
                                {
                                    // 新增
                                    _this.updateOrInsertElement();
                                }
                                break;
                            case 1:
                                {
                                    // 修改
                                    var selectRows = _this._table.selectedRows;
                                    if (selectRows.length <= 0) {
                                        Modal_1.Modal.alert('请先选择一个元素');
                                        return;
                                    }
                                    if (selectRows.length > 1) {
                                        Modal_1.Modal.alert('请只选择一个元素');
                                        return;
                                    }
                                    var row = selectRows[0], cellsData_1 = {};
                                    row.cells.forEach(function (cell) {
                                        if (cell.name === 'pause') {
                                            cellsData_1[cell.name] = cell.text === '否' ? 0 : 1;
                                        }
                                        else {
                                            cellsData_1[cell.name] = cell.text;
                                        }
                                    });
                                    _this.updateOrInsertElement(cellsData_1);
                                }
                                break;
                            case 2:
                                {
                                    // 删除
                                    var selectRows = _this._table.selectedRows, deleteItem_1 = [];
                                    if (selectRows.length <= 0) {
                                        Modal_1.Modal.alert("请先选择要删除的元素");
                                        return;
                                    }
                                    selectRows.forEach(function (row) {
                                        var item = {};
                                        row.cells.forEach(function (cell) {
                                            if (cell.name === 'pause' || cell.name.indexOf('Flag') !== -1) {
                                                item[cell.name] = cell.text === '否' ? 0 : 1;
                                            }
                                            else {
                                                item[cell.name] = cell.text;
                                            }
                                        });
                                        deleteItem_1.push(item);
                                    });
                                    var para_1 = {
                                        type: "field",
                                        delete: deleteItem_1
                                    };
                                    Modal_1.Modal.confirm({
                                        msg: '确定要删除吗？',
                                        title: '温馨提示',
                                        callback: function (flag) {
                                            flag && DVAjax_1.DVAjax.elementDesignAjax(elementType, function (res) {
                                                Modal_1.Modal.toast(res.msg);
                                                _this.clearAjaxPara();
                                            }, { type: 'POST', data: para_1 });
                                        }
                                    });
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
            });
        };
        ElementDesignPage.prototype.clearAjaxPara = function () {
            this.conditions['elementId'].set('');
            this.conditions['dataSource'].set('请选择');
            this.getAllConditionsData();
        };
        // 更新或者新增element
        ElementDesignPage.prototype.updateOrInsertElement = function (obj) {
            var _this = this;
            if (obj === void 0) { obj = {}; }
            var title = tools.isNotEmpty(obj) ? '修改元素' : '新增元素', // Modal的title
            elementType = this.conditions['elementType'].get(); // 获取当前的elementType
            elementType = elementType === '请选择' ? 'all' : elementType;
            var cols = this.elementManagermentData[elementType].cols, // 表单name对应
            html = this.createModalBody(cols, obj), // 获取Modal的body
            paraType = elementType; // 参数中的type，insert->element 其他对应当前elementType
            var modal = new Modal_1.Modal({
                header: {
                    title: title
                },
                body: html,
                footer: {},
                width: '700px',
                isOnceDestroy: true,
                className: 'element-modal',
                onOk: function () {
                    var elements = d.queryAll('.form-control', d.query('.form-horizontal', document.body)), data = {};
                    for (var j = 0; j < elements.length; j++) {
                        var name_1 = elements[j].getAttribute('name'), element = elements[j];
                        if (element.value) {
                            if (name_1 === 'pause' || name_1.indexOf('Flag') !== -1) {
                                data[name_1] = parseInt(element.value);
                            }
                            else {
                                data[name_1] = element.value;
                            }
                        }
                    }
                    var type = 'update';
                    if (tools.isEmpty(obj)) {
                        // 新增
                        type = 'insert';
                        data['elementType'] = elementType;
                        paraType = 'element';
                    }
                    var elementPara = {
                        type: paraType,
                    };
                    elementPara[type] = [data];
                    DVAjax_1.DVAjax.elementDesignAjax(elementType, function (res) {
                        if (res.errorCode === 0) {
                            // 新增或修改成功 关闭模态框
                            Modal_1.Modal.toast(res.msg);
                            _this.clearAjaxPara();
                            modal.destroy();
                        }
                    }, { type: 'POST', data: elementPara });
                },
                onCancel: function (e) {
                    Modal_1.Modal.confirm({
                        msg: '确认要取消编辑吗？', title: '温馨提示', callback: function (flag) {
                            if (flag) {
                                modal.destroy();
                            }
                        }
                    });
                }
            });
        };
        /** 创建Modal的body
         *  cols 当前表格的列，用于生成对应表单
         *  data 当前为修改时传递的数据，新增默认为{}
         *  type 当前是新增还是修改,默认为false 表示修改
         * */
        ElementDesignPage.prototype.createModalBody = function (cols, data) {
            if (data === void 0) { data = {}; }
            var parentNode = {
                tag: 'from',
                props: {
                    className: 'form-horizontal'
                },
                children: []
            };
            if (tools.isEmpty(data)) {
                // type为true则表示insert，否则为update
                parentNode.children.push(this.addElementNeedPara());
            }
            cols.forEach(function (col) {
                var type = 'text', colName = col.name;
                var group = {
                    tag: 'div'
                };
                if (colName === 'pause' || colName.indexOf('Flag') !== -1) {
                    type = 'number';
                }
                if (colName.indexOf('Sql') > 0) {
                    group = {
                        tag: 'div',
                        props: {
                            className: 'form-group'
                        },
                        children: [
                            {
                                tag: 'label',
                                props: {
                                    className: 'col-sm-2 control-label',
                                    for: col.name
                                },
                                children: [col.title]
                            }, {
                                tag: 'div',
                                props: {
                                    className: 'col-sm-10'
                                },
                                children: [
                                    {
                                        tag: 'textarea',
                                        props: {
                                            type: type,
                                            className: 'form-control',
                                            id: col.name,
                                            placeHolder: '请输入' + col.title,
                                            name: col.name,
                                            style: 'resize:none;'
                                        }
                                    }
                                ]
                            }
                        ]
                    };
                }
                else {
                    group = {
                        tag: 'div',
                        props: {
                            className: 'form-group'
                        },
                        children: [
                            {
                                tag: 'label',
                                props: {
                                    className: 'col-sm-2 control-label',
                                    for: col.name
                                },
                                children: [col.title]
                            }, {
                                tag: 'div',
                                props: {
                                    className: 'col-sm-10'
                                },
                                children: [
                                    {
                                        tag: 'input',
                                        props: {
                                            type: type,
                                            className: 'form-control',
                                            id: col.name,
                                            placeHolder: '请输入' + col.title,
                                            name: col.name
                                        }
                                    }
                                ]
                            }
                        ]
                    };
                }
                // 如果是修改，则把当前内容填充到form表单中
                if (tools.isNotEmpty(data)) {
                    group.children[1].children[0].props['value'] = data[col.name];
                }
                parentNode.children.push(group);
            });
            return d.create(parentNode);
        };
        // 新增时需要添加的字段
        ElementDesignPage.prototype.addElementNeedPara = function () {
            var dataSource = {
                tag: 'div',
                props: {
                    className: 'form-group'
                },
                children: [
                    {
                        tag: 'label',
                        props: {
                            className: 'col-sm-2 control-label',
                            for: 'elementType'
                        },
                        children: ['数据源']
                    },
                    {
                        tag: 'div',
                        props: {
                            className: 'col-sm-10'
                        },
                        children: [
                            {
                                tag: 'select',
                                props: {
                                    className: 'form-control',
                                    id: 'dataSource',
                                    name: 'dataSource'
                                },
                                children: []
                            }
                        ]
                    }
                ]
            };
            this.dataSource.forEach(function (data) {
                var obj = {
                    tag: 'option',
                    children: [data]
                };
                var dataSourceGroup = dataSource.children[1];
                dataSourceGroup.children[0].children.push(obj);
            });
            return dataSource;
        };
        Object.defineProperty(ElementDesignPage.prototype, "ajaxPara", {
            get: function () {
                if (!this._ajaxPara) {
                    this._ajaxPara = {
                        element_id: '',
                        data_source: ''
                    };
                }
                return this._ajaxPara;
            },
            set: function (para) {
                this.isRefreshTable(para, true);
            },
            enumerable: true,
            configurable: true
        });
        ElementDesignPage.prototype.isRefreshTable = function (para, isRefresh) {
            this._ajaxPara = para;
            if (isRefresh) {
                this._table && this._table._clearAllSelectedCells();
                this._table && this._table.tableData.refresh();
            }
        };
        ElementDesignPage.prototype.getAllConditionsData = function () {
            var elementId = this.conditions['elementId'].get().replace(/\s+/g, ''), dataSource = this.conditions['dataSource'].get().replace(/\s+/g, '');
            dataSource = dataSource === '请选择' ? '' : dataSource;
            var paraObj = {
                element_id: elementId,
                data_source: dataSource
            };
            this.ajaxPara = paraObj;
        };
        Object.defineProperty(ElementDesignPage.prototype, "dataSource", {
            get: function () {
                return this._dataSource;
            },
            set: function (d) {
                this._dataSource = d;
            },
            enumerable: true,
            configurable: true
        });
        ElementDesignPage.prototype.initConditions = function () {
            var _this = this;
            var dropdowns = d.queryAll('.dropDown', this.wrapper);
            var text = '';
            var elementType = new DropDownModule_1.DropDownModule({
                container: dropdowns[0],
                title: '元素类型',
                changeValue: function (val) {
                    _this.conditions.elementId.set('');
                    text = '';
                    _this.getElementTableData();
                    _this.clearAjaxPara();
                },
                disabled: false,
                dropClassName: 'element'
            });
            var elementId = new TextInputModule_1.TextInputModule({
                container: dropdowns[1],
                title: '元素ID',
                disabled: false,
            });
            elementId.textInput.on('blur', function (e) {
                var inputValue = e.target.value.replace(/\s+/g, ' ');
                if (inputValue === text) {
                    return;
                }
                _this.getAllConditionsData();
                text = inputValue;
            });
            var dataSource = new DropDownModule_1.DropDownModule({
                container: dropdowns[2],
                title: '数据源',
                disabled: false,
                dropClassName: 'element',
                data: [''],
                changeValue: function (val) {
                    _this.getAllConditionsData();
                }
            });
            DVAjax_1.DVAjax.dataSourceQueryAjax(function (res) {
                _this.dataSource = res.slice();
                res.unshift('请选择');
                dataSource.dpData = res;
            });
            this.conditions = {
                elementType: elementType,
                elementId: elementId,
                dataSource: dataSource
            };
            d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'));
        };
        // 根据当前筛选条件获取表数据
        ElementDesignPage.prototype.getElementTableData = function () {
            // this._table.destroy();
            var items = this.conditions, elementType = items['elementType'].get().replace(/\s+/g, ""), url = '?';
            if (elementType === '请选择') {
                elementType = 'all';
            }
            else {
                url = "/" + elementType + "?";
            }
            d.query('.table', this.wrapper).innerHTML = '';
            // 清空ajaxPara
            var obj = {
                element_id: ''
            };
            this.isRefreshTable(obj, false);
            this.createPageTable(elementType, url);
        };
        ElementDesignPage.prototype.createPageTable = function (val, urlStrem) {
            var _this = this;
            this._table = new FastTable_1.FastTable({
                container: d.query('.table', this.wrapper),
                cols: [this.elementManagermentData[val].cols],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURI(queryStr);
                        var url = config.ajaxUrl.elementDesign + urlStrem + 'pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara();
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            var data = response.dataArr, total = 0;
                            tools.isNotEmptyArray(data) && data.map(function (item) {
                                if (item.hasOwnProperty('pause')) {
                                    item.pause = item.pause === 0 ? '否' : '是';
                                }
                                return item;
                            });
                            tools.isNotEmptyArray(data) && (total = response.head.total);
                            return { data: data, total: total };
                        });
                    },
                    auto: false,
                    once: false
                },
                page: {
                    size: 50,
                    options: [50, 100, 150]
                }
            });
        };
        ElementDesignPage.prototype.handlerAjaxPara = function () {
            var str = '&fuzzyparams={', paraStr = '', ajaxParaData = this.ajaxPara;
            for (var key in ajaxParaData) {
                if (tools.isNotEmpty(ajaxParaData[key])) {
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(ajaxParaData[key]) ? '"' + ajaxParaData[key] + '"' : '""') + ',';
                }
            }
            if (tools.isNotEmpty(paraStr)) {
                paraStr = paraStr.slice(0, paraStr.length - 1);
                str = str + paraStr + '}';
                return encodeURI(str);
            }
            else {
                return '';
            }
        };
        return ElementDesignPage;
    }(SPAPage));
    exports.ElementDesignPage = ElementDesignPage;
});

define("MenuDesignPage", ["require", "exports", "DropDownModule", "Button", "Tree", "MenuDesignModule", "Modal", "Menu", "DVAjax", "FastTable", "TextInputModule", "TextInput"], function (require, exports, DropDownModule_1, Button_1, Tree_1, MenuDesignModule_1, Modal_1, Menu_1, DVAjax_1, FastTable_1, TextInputModule_1, text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="MenuDesignPage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var config = DV.CONF;
    var MenuDesignPage = /** @class */ (function (_super) {
        __extends(MenuDesignPage, _super);
        function MenuDesignPage() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // 滚动时取消右键菜单
            _this.scrollEvent = (function () {
                var handler = function (e) {
                    _this.menuDesignModule.contextMenu.wrapper.classList.add('hideContextMenu');
                };
                return {
                    on: function () { return d.on(d.query('.treeMenus', _this.wrapper), 'scroll', handler); },
                    off: function () { return d.off(d.query('.treeMenus', _this.wrapper), 'scroll', handler); }
                };
            })();
            // 鼠标谈起取消右键菜单
            _this.mouseupEvent = (function () {
                var handler = function (e) {
                    var contextMenu = _this.menuDesignModule.contextMenu;
                    if (!contextMenu.wrapper.contains(e.target)) {
                        contextMenu.wrapper.classList.add('hideContextMenu');
                    }
                };
                return {
                    on: function () { return d.on(document, 'mouseup', handler); },
                    off: function () { return d.off(document, 'mouseup', handler); }
                };
            })();
            // 右键菜单
            _this.contextMenuEvent = (function () {
                var handler = function (e) {
                    e.preventDefault();
                    if (_this.isEditing !== 'none') {
                        Modal_1.Modal.alert('请先保存当前修改');
                        return;
                    }
                    var contextMenu = _this.menuDesignModule.contextMenu;
                    contextMenu.wrapper.classList.remove('hideContextMenu');
                    var y = e.clientY;
                    if (y + 100 > window.innerHeight) {
                        y = window.innerHeight - 100;
                    }
                    contextMenu.wrapper.style.left = e.clientX + 'px';
                    contextMenu.wrapper.style.top = y + 'px';
                };
                return {
                    on: function () { return d.on(d.query('.treeMenus', _this.wrapper), 'contextmenu', '.tree-text-wrapper', handler); },
                    off: function () { return d.off(d.query('.treeMenus', _this.wrapper), 'contextmenu', '.tree-text-wrapper', handler); }
                };
            })();
            return _this;
        }
        Object.defineProperty(MenuDesignPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        MenuDesignPage.prototype.wrapperInit = function () {
            return d.create("<div class=\"menuDesign\">\n        <div class=\"topSelectItem\">\n            <div class=\"topDropDown\">\n                <div class=\"dropDownItems\">\n                    <div class=\"dropdown0\"></div>\n                    <div class=\"dropdown1\"></div>\n                    <div class=\"clear\"></div>\n                </div>\n            </div>\n            <div class=\"topButtons\"></div>\n            <div class=\"clear\"></div>\n        </div>\n        <div class=\"bottomContent\">\n            <div class=\"treeMenus\">\n                \n            </div>\n            <div class=\"content\">\n                <div class=\"contentButtons\"></div>\n                <div class=\"designContent\"></div>\n            </div>\n            <div class=\"clear\"></div>\n        </div>\n        </div>");
        };
        MenuDesignPage.prototype.init = function (para, data) {
            var _this = this;
            this.title = "菜单设计";
            // 初始化Module
            this.menuDesignModule = {
                // dropDown: null,
                tree: null,
                designContent: null,
                contextMenu: null
            };
            this.menuDesignModule.contextMenu = this.initContextMenu();
            this.menuDesignModule.tree = this.initTreeMenus();
            this.initBottomButtons();
            this.menuDesignModule.designContent = this.initDesignContent();
            DVAjax_1.DVAjax.dataSourceQueryAjax(function (res) {
                // 获取到焦点时弹出选择
                res.unshift('请选择');
                _this.ds = res;
            });
            var allItems = this.menuDesignModule.designContent.allItems;
            allItems['varId'].textInput.on('focus', function (e) {
                if (_this.varModal) {
                    var obj = {
                        var_id: '',
                        var_name: '',
                        var_sql: '',
                        datasource: ''
                    };
                    _this.varAjaxPara = obj;
                    _this.varModal.isShow = true;
                }
                else {
                    _this.createVarModal(_this.ds);
                }
            });
            allItems['itemId'].textInput.on('focus', function (e) {
                if (_this.itemModal) {
                    var obj = {
                        item_id: '',
                        item_type: '',
                        caption_sql: '',
                        data_source: ''
                    };
                    _this.itemAjaxPara = obj;
                    _this.itemModal.isShow = true;
                }
                else {
                    _this.createItemModal(_this.ds);
                }
            });
            allItems['iconName'].textInput.on('focus', function (e) {
                if (_this.iconModal) {
                    _this.iconModal.isShow = true;
                }
                else {
                    _this.createIconModal();
                }
            });
            // 开启右键菜单
            setTimeout(function () {
                _this.contextMenuEvent.on();
                _this.mouseupEvent.on();
                _this.scrollEvent.on();
            }, 100);
        };
        // 变量弹窗
        MenuDesignPage.prototype.createVarModal = function (ds) {
            var _this = this;
            var varIdModule = this.menuDesignModule.designContent.allItems['varId'], body = d.create('<div class="modal-body-container"></div>'), self = this;
            body.appendChild(d.create('<div class="conditions"></div>'));
            body.appendChild(d.create('<div class="table"></div>'));
            var titleArr = ['变量ID', '变量名称', '变量SQL'], inputModules = [];
            titleArr.forEach(function (title) {
                var inputModule = new TextInputModule_1.TextInputModule({
                    title: title,
                    container: d.query('.conditions', body)
                });
                inputModules.push(inputModule);
                inputModule.textInput.on('blur', function () {
                    handlerVarConditions();
                });
            });
            var dataSource = new DropDownModule_1.DropDownModule({
                title: '数据源',
                container: d.query('.conditions', body),
                disabled: false,
                dropClassName: 'modalds',
                changeValue: function () {
                    handlerVarConditions();
                }
            });
            dataSource.dpData = ds;
            function handlerVarConditions() {
                var var_id = inputModules[0].get().replace(/\s+/g, ""), var_name = inputModules[1].get().replace(/\s+/g, ""), var_sql = inputModules[2].get().replace(/\s+/g, ""), datasource = dataSource.get().replace(/\s+/g, "");
                datasource = datasource === '请选择' ? '' : datasource;
                var ajaxPara = {
                    var_id: var_id,
                    var_name: var_name,
                    var_sql: var_sql,
                    data_source: datasource
                };
                self.varAjaxPara = ajaxPara;
            }
            this.varTable = new FastTable_1.FastTable({
                container: d.query('.table', body),
                cols: [[{ name: 'varId', title: '变量ID' },
                        { name: 'dataSource', title: '数据源' },
                        { name: 'varName', title: '变量名称' },
                        { name: 'varSql', title: '变量SQL' }]],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.varDesign + '?pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara(_this.varAjaxPara);
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            var data = response.dataArr, total = 0;
                            tools.isNotEmptyArray(data) && (total = response.head.total);
                            return { data: data, total: total };
                        });
                    },
                    auto: true,
                    once: false
                },
                page: {
                    size: 20,
                    options: [20, 50]
                }
            });
            this.varModal = new Modal_1.Modal({
                body: body,
                header: {
                    title: '请选择变量'
                },
                width: '800px',
                footer: {},
                className: 'varModal',
                onOk: function () {
                    var selectedRow = _this.varTable.selectedRows;
                    if (selectedRow.length <= 0) {
                        Modal_1.Modal.alert('请先选择变量');
                    }
                    else if (selectedRow.length > 1) {
                        Modal_1.Modal.alert('请只选择一个变量');
                    }
                    else {
                        var varId = selectedRow[0].cells[0].text;
                        varIdModule.set(varId);
                        self.varModal.isShow = false;
                        setValueForInput();
                    }
                },
                onCancel: function (e) {
                    self.varModal.isShow = false;
                    setValueForInput();
                }
            });
            function setValueForInput() {
                inputModules[0].set('');
                inputModules[1].set('');
                inputModules[2].set('');
                dataSource.set('请选择');
            }
        };
        Object.defineProperty(MenuDesignPage.prototype, "varAjaxPara", {
            get: function () {
                if (!this._varAjaxPara) {
                    this._varAjaxPara = {
                        var_id: '',
                        var_name: '',
                        data_source: '',
                        var_sql: ''
                    };
                }
                return this._varAjaxPara;
            },
            set: function (obj) {
                this._varAjaxPara = obj;
                this.varTable && this.varTable._clearAllSelectedCells();
                this.varTable && this.varTable.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        MenuDesignPage.prototype.createItemModal = function (ds) {
            var _this = this;
            var itemIdModel = this.menuDesignModule.designContent.allItems['itemId'], captionModel = this.menuDesignModule.designContent.allItems['caption'], captionExplainModal = this.menuDesignModule.designContent.allItems['captionExplain'], self = this, body = d.create('<div class="modal-body-container"></div>');
            body.appendChild(d.create('<div class="conditions"></div>'));
            body.appendChild(d.create('<div class="table"></div>'));
            var titleArr = ['页面编码', '名称'], inputModules = [];
            titleArr.forEach(function (title) {
                var inputModule = new TextInputModule_1.TextInputModule({
                    title: title,
                    container: d.query('.conditions', body)
                });
                inputModules.push(inputModule);
                inputModule.textInput.on('blur', function () {
                    handlerItemConditions();
                });
            });
            var itemType = new DropDownModule_1.DropDownModule({
                title: '页面类型',
                container: d.query('.conditions', body),
                disabled: false,
                dropClassName: 'modalit',
                className: 'modalit',
                changeValue: function () {
                    handlerItemConditions();
                }
            });
            itemType.dpData = ['请选择', '查询器', '目录', '自定义'];
            var dataSource = new DropDownModule_1.DropDownModule({
                title: '数据源',
                container: d.query('.conditions', body),
                disabled: false,
                dropClassName: 'modalds',
                changeValue: function () {
                    handlerItemConditions();
                }
            });
            dataSource.dpData = ds;
            this.itemTable = new FastTable_1.FastTable({
                container: d.query('.table', body),
                cols: [[{ name: 'itemId', title: 'ITEM ID' },
                        { name: 'itemType', title: 'ITEM 类型' },
                        { name: 'captionSql', title: '标题' },
                        { name: 'dataSource', title: '数据源' },
                        { name: 'keyField', title: '主键字段' },
                        { name: 'pause', title: '是否启用' }
                    ]],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + ",\"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.itemQuery + '?pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara(_this.itemAjaxPara);
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            var data = response.dataArr, total = 0;
                            tools.isNotEmptyArray(data) && (total = response.head.total);
                            return { data: data, total: total };
                        });
                    },
                    auto: true,
                    once: false
                },
                page: {
                    size: 20,
                    options: [20, 50]
                }
            });
            function handlerItemConditions() {
                var item_id = inputModules[0].get().replace(/\s+/g, ""), caption_sql = inputModules[1].get().replace(/\s+/g, ""), datasource = tools.isNotEmpty(dataSource) ? dataSource.get().replace(/\s+/g, "") : '请选择', item_type = tools.isNotEmpty(itemType) ? itemType.get().replace(/\s+/g, "") : '请选择', itemTypeMap = {
                    "请选择": '',
                    "查询器": 'list',
                    "目录": 'menu',
                    "自定义": 'custom'
                };
                datasource = datasource === '请选择' ? '' : datasource;
                item_type = itemTypeMap[item_type];
                var ajaxPara = {
                    item_id: item_id,
                    item_type: item_type,
                    caption_sql: caption_sql,
                    datasource: datasource
                };
                self.itemAjaxPara = ajaxPara;
            }
            this.itemModal = new Modal_1.Modal({
                body: body,
                header: {
                    title: '请选择页面编码'
                },
                width: '800px',
                footer: {},
                className: 'itemModal',
                onOk: function () {
                    var selectedRow = _this.itemTable.selectedRows;
                    if (selectedRow.length <= 0) {
                        Modal_1.Modal.alert('请先选择页面编码');
                    }
                    else if (selectedRow.length > 1) {
                        Modal_1.Modal.alert('请只选择一个页面编码');
                    }
                    else {
                        var itemId = selectedRow[0].cells[0].text, caption = selectedRow[0].cells[2].text;
                        itemIdModel.set(itemId);
                        captionModel.set(caption);
                        captionExplainModal.set(caption);
                        self.itemModal.isShow = false;
                        setValueForInput();
                    }
                },
                onCancel: function (e) {
                    self.itemModal.isShow = false;
                    setValueForInput();
                }
            });
            function setValueForInput() {
                inputModules[0].set('');
                inputModules[1].set('');
                itemType.set('请选择');
                dataSource.set('请选择');
            }
        };
        Object.defineProperty(MenuDesignPage.prototype, "itemAjaxPara", {
            get: function () {
                if (!this._itemAjaxPara) {
                    this._itemAjaxPara = {
                        item_id: '',
                        item_type: '',
                        data_source: '',
                        caprion_sql: ''
                    };
                }
                return this._itemAjaxPara;
            },
            set: function (obj) {
                this._itemAjaxPara = obj;
                this.itemTable && this.itemTable._clearAllSelectedCells();
                this.itemTable && this.itemTable.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        MenuDesignPage.prototype.handlerAjaxPara = function (ajaxPara) {
            var str = '&fuzzyparams={', paraStr = '';
            for (var key in ajaxPara) {
                if (tools.isNotEmpty(ajaxPara[key])) {
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(ajaxPara[key]) ? '"' + ajaxPara[key] + '"' : '""') + ',';
                }
            }
            if (tools.isNotEmpty(paraStr)) {
                paraStr = paraStr.slice(0, paraStr.length - 1);
                str = str + paraStr + '}';
                return encodeURI(str);
            }
            else {
                return '';
            }
        };
        MenuDesignPage.prototype.createIconModal = function () {
            var _this = this;
            var body = d.create('<div class="modal-body-container"></div>');
            body.appendChild(d.create('<div class="conditions"></div>'));
            var iconInputModal = new TextInputModule_1.TextInputModule({
                title: '搜索图标',
                container: d.query('.conditions', body)
            });
            var iconText = '';
            iconInputModal.textInput.on('input', function () {
                var text = iconInputModal.get().replace(/\s+/g, '');
                if (text === iconText) {
                    return;
                }
                iconText = text;
                d.remove(d.query('.iconBody', body));
                body.appendChild(_this.getIconModalBody(text));
            });
            body.appendChild(this.getIconModalBody());
            var iconModal = new Modal_1.Modal({
                body: body,
                header: '图标选择',
                width: '800px',
                height: '500px',
                className: 'iconModal',
            });
            this.iconModal = iconModal;
            d.on(body, 'mousedown', '.icon-item', function (e) {
                var iconEle = d.closest(e.target, '.icon-item');
                iconEle.classList.add('active');
            });
            d.on(body, 'mouseup', '.icon-item', function (e) {
                var iconEle = d.closest(e.target, '.icon-item'), iconName = iconEle.dataset.icon;
                iconEle.classList.remove('active');
                _this.menuDesignModule.designContent.allItems['iconName'].set(iconName);
                iconModal && (iconModal.isShow = false);
            });
        };
        MenuDesignPage.prototype.getIconModalBody = function (searchStr) {
            var icons = ["iconfont icon-wenben", "iconfont icon-house", "iconfont icon-shanchu", "iconfont icon-shuaxin1", "iconfont icon-diannao", "iconfont icon-cuowu1", "iconfont icon-jiantou", "iconfont icon-calendar", "iconfont icon-weixin", "iconfont icon-suo4", "iconfont icon-zhuce1", "iconfont icon-ordinaryprint", "iconfont icon-label", "iconfont icon-yidong1", "iconfont icon-close", "iconfont icon-tishi", "iconfont icon-msnui-logo-chrome", "iconfont icon-jiahao", "iconfont icon-sousuo", "iconfont icon-wushuju", "iconfont icon-wangluo", "iconfont icon-tongji", "iconfont icon-shop1", "iconfont icon-caiwuguanli", "iconfont icon-shuaxin2", "iconfont icon-xiao41", "iconfont icon-shuaxin", "iconfont icon-favour", "iconfont icon-fangzi", "iconfont icon-xiaoxi", "iconfont icon-users", "iconfont icon-statistic", "iconfont icon-mp-institution", "iconfont icon-shou", "iconfont icon-gesture", "iconfont icon-denglu", "iconfont icon-suoding", "iconfont icon-jingyingfenxi", "iconfont icon-zhexiantu", "iconfont icon-zhuzhuangtu", "iconfont icon-device-mb", "iconfont icon-youhuiquanguanli", "iconfont icon-fasongyoujian", "iconfont icon-xinzeng", "iconfont icon-device-pc", "iconfont icon-bangong0", "iconfont icon-icon07", "iconfont icon-arrow-right-2", "iconfont icon-num", "iconfont icon-7", "iconfont icon-fenxi", "iconfont icon-iconset0254", "iconfont icon-shoujianxiang", "iconfont icon-xiaoshou", "iconfont icon-youhuiquan", "iconfont icon-jiantouarrow477", "iconfont icon-jiantouarrow484", "iconfont icon-fuzhi", "iconfont icon-gugeliulanqi", "iconfont icon-light", "iconfont icon-wendang", "iconfont icon-asc", "iconfont icon-avatar", "iconfont icon-bingzhuangtu", "iconfont icon-ri", "iconfont icon-iconfont icon-supplier", "iconfont icon-ai-copy", "iconfont icon-baocun", "iconfont icon-zuzhiguanli", "iconfont icon-sort-small-copy", "iconfont icon-sort-small-copy1", "iconfont icon-shaixuan", "iconfont icon-arrow-down", "iconfont icon-quyu1", "iconfont icon-update-text", "iconfont icon-pdf", "iconfont icon-tongxunlu1", "iconfont icon-shejiqijiaohuanxinglie", "iconfont icon-gongyongwushuju", "iconfont icon-gongyongzanwushuju", "iconfont icon-user", "iconfont icon-daochu", "iconfont icon-maximize", "iconfont icon-jiahao1", "iconfont icon-qunzu", "iconfont icon-meiri", "iconfont icon-fuzhicopy20", "iconfont icon-qiandai", "iconfont icon-copy", "iconfont icon-excel", "iconfont icon-xinxi", "iconfont icon-fenxi11", "iconfont icon-cash", "iconfont icon-wenjian", "iconfont icon-xinzeng2", "iconfont icon-ai36", "iconfont icon-qian", "iconfont icon-wenjianjia", "iconfont icon-nodata", "iconfont icon-jianhao", "iconfont icon-006pinglunhuifu", "iconfont icon-023tuceng", "iconfont icon-shengji", "iconfont icon-daochu2", "iconfont icon-wuwangluozhuangtai", "iconfont icon-add", "iconfont icon-weihu", "iconfont icon-layers", "iconfont icon-buoumaotubiao12", "iconfont icon-buoumaotubiao25", "iconfont icon-shouye-copy", "iconfont icon-xitongcuowu", "iconfont icon-tubiao121", "iconfont icon-shuxie", "iconfont icon-shangpin", "iconfont icon-jisuanqi", "iconfont icon-shuben", "iconfont icon-zhiwen", "iconfont icon-expanse", "iconfont icon-saleman", "iconfont icon-renyuan", "iconfont icon-woshimaijia", "iconfont icon-e66f", "iconfont icon-dian", "iconfont icon-download", "iconfont icon-14", "iconfont icon-gupiao2", "iconfont icon-billing", "iconfont icon-jingyu-OK", "iconfont icon-gongnengguanli", "iconfont icon-card", "iconfont icon-ji", "iconfont icon-iconfont icon-yuanzhuti", "iconfont icon-fenxi1", "iconfont icon-iconfont icon-test", "iconfont icon-cancel", "iconfont icon-44", "iconfont icon-67", "iconfont icon-80", "iconfont icon-icon_folder", "iconfont icon-fukuan", "iconfont icon-paixu", "iconfont icon-pin4", "iconfont icon-pinlei", "iconfont icon-arrow-left-2", "iconfont icon-xiugai", "iconfont icon-csv1", "iconfont icon-account", "iconfont icon-biaoge", "iconfont icon-folder", "iconfont icon-danhangchenlie", "iconfont icon-dagou", "iconfont icon-zi", "iconfont icon-history-record", "iconfont icon-renyuanguanli", "iconfont icon-desc", "iconfont icon-chaibaoguoqujian-xianxing", "iconfont icon-diqu", "iconfont icon-pinleiguanli", "iconfont icon-arrow-right", "iconfont icon-guanliyuan", "iconfont icon-quyu", "iconfont icon-nian", "iconfont icon-annex", "iconfont icon-diyu", "iconfont icon-huojiachenlie", "iconfont icon-jujueweituo", "iconfont icon-png", "iconfont icon-yue", "iconfont icon-gongyingshangguanli", "iconfont icon-ABC", "iconfont icon-wenjianshangchuan", "iconfont icon-shizhong", "iconfont icon-quxiao", "iconfont icon-zhexiantu1", "iconfont icon-message", "iconfont icon-caiwuguanli1", "iconfont icon-jianhao1", "iconfont icon-dingdan", "iconfont icon-call", "iconfont icon-shop", "iconfont icon-two-arrow-down", "iconfont icon-liulanqi-IE", "iconfont icon-function", "    iconfont icon-pie-chart_icon", "iconfont icon-richscan_icon", "iconfont icon-cross-circle", "iconfont icon-fenxiangfasong", "iconfont icon-xiazai", "iconfont icon-arrow-left", "iconfont icon-magnifier", "iconfont icon-arrow-up", "iconfont icon-shangdian", "iconfont icon-dagou1", "iconfont icon-xuanze", "iconfont icon-fl-renyuan", "iconfont icon-wangyuanjing", "iconfont icon-fl-shuju", "iconfont icon-mendianjingyinghuizong", "iconfont icon-duibi", "iconfont icon-tianqiyubao", "iconfont icon-fasong", "iconfont icon-word", "iconfont icon-yidong", "iconfont icon-zhankaishousuo-zhankai", "iconfont icon-zhankaishousuo-shousuo", "iconfont icon-check-circle", "iconfont icon-woshou", "iconfont icon-drxx63", "iconfont icon-huatong", "iconfont icon-left-element", "iconfont icon-taiyang", "iconfont icon-caogao", "iconfont icon-zhengque", "iconfont icon-dangan", "iconfont icon-tubiaozhizuomoban", "iconfont icon-yunshu", "iconfont icon-xiaoyuan-", "iconfont icon-youjianjieshou", "iconfont icon--", "iconfont icon-chazhao", "iconfont icon--wenjianjia", "iconfont icon-diannao1", "iconfont icon-14-copy", "iconfont icon-023tuceng-copy", "iconfont icon-023tuceng-copy-copy", "iconfont icon-ai36-copy", "iconfont icon-ai36-copy-copy", "iconfont icon-pie-chart_icon_blue-copy", "iconfont icon-pie-chart_icon_blue-red-copy"], showIconArr = icons;
            if (tools.isNotEmpty(searchStr)) {
                showIconArr = icons.filter(function (icon) {
                    return icon.indexOf(searchStr) !== -1;
                });
            }
            var iconBody = d.create("<div class=\"iconBody\"></div>");
            showIconArr.forEach(function (icon) {
                iconBody.appendChild(d.create("\n            <div class=\"icon-item\" data-icon=\"" + icon + "\">\n            <i class=\"iconfont " + icon + "\"></i>\n            <span>" + icon + "</span>\n</div>\n            "));
            });
            return iconBody;
        };
        // 初始化右键菜单
        MenuDesignPage.prototype.initContextMenu = function () {
            var _this = this;
            var menuData = [
                {
                    text: '新增菜单目录'
                },
                {
                    text: '新增子菜单'
                },
                {
                    text: '删除'
                }
            ];
            var menu = new Menu_1.Menu({
                children: menuData,
                expand: true,
                isHoverExpand: false,
                container: d.query('body')
            });
            menu.wrapper.classList.add('contextMenu');
            menu.onOpen = function (node) {
                _this.showContent(true);
                var tree = _this.menuDesignModule['tree'];
                if (node.text === '新增菜单目录') {
                    // let title = {
                    //     nodeId: "菜单目录编码",
                    //     itemId: "菜单页面编码",
                    //     caption: "目录标题",
                    //     captionExplain: "目录标题说明",
                    //     iconName: "目录图标",
                    // };
                    // this.setTitle(title);
                    tree.getSelectedNodes()[0].expand = true;
                    _this.addNewMenu(false);
                }
                else if (node.text === '新增子菜单') {
                    // let title = {
                    //     nodeId: "子菜单编码",
                    //     itemId: "子菜单页面编码",
                    //     caption: "子菜单标题",
                    //     captionExplain: "子菜单标题说明",
                    //     iconName: "子菜单图标",
                    // };
                    // this.setTitle(title);
                    tree.getSelectedNodes()[0].expand = true;
                    _this.addNewMenu(true);
                }
                else {
                    // 删除
                    _this.isEditing = 'delete';
                    menu.wrapper.classList.add('hideContextMenu');
                    Modal_1.Modal.confirm({
                        msg: '确认要删除该菜单吗？', title: '温馨提示', callback: function (flag) {
                            if (flag) {
                                _this.changeNode(tree.getSelectedNodes()[0]);
                            }
                        }
                    });
                }
                if (menu.getSelectedNodes()) {
                    menu.getSelectedNodes()[0].selected = false;
                }
            };
            menu.wrapper.classList.add('hideContextMenu');
            menu.wrapper.classList.add('contextMenu');
            return menu;
        };
        // 设置label标题
        MenuDesignPage.prototype.setTitle = function (title) {
            var designContent = this.menuDesignModule.designContent.allItems;
            for (var key in title) {
                designContent[key].title = title[key];
            }
        };
        // 右键菜单操作
        MenuDesignPage.prototype.addNewMenu = function (isLeaf) {
            var selectedNode = this.menuDesignModule.tree.getSelectedNodes()[0];
            if (selectedNode.isLeaf === true) {
                Modal_1.Modal.alert('叶子节点不能再添加子菜单');
                return;
            }
            this.isEditing = 'insert';
            var designObj = this.menuDesignModule.designContent.allItems;
            for (var key in designObj) {
                if (key === 'isLeaf') {
                    designObj['isLeaf'].set(isLeaf);
                }
                else if (key === 'parentId') {
                    designObj['parentId'].disabled = true;
                    if (tools.isNotEmpty(selectedNode.content)) {
                        designObj['parentId'].set(selectedNode.content.itemId);
                    }
                    else {
                        designObj['parentId'].set('menuroot');
                    }
                }
                else if (key === 'caption') {
                    designObj['caption'].disabled = true;
                }
                else {
                    designObj[key].set('');
                    designObj[key].disabled = false;
                }
            }
            this.menuDesignModule.contextMenu.wrapper.classList.add('hideContextMenu');
        };
        // 初始化左侧树
        MenuDesignPage.prototype.initTreeMenus = function () {
            var _this = this;
            var tree = new Tree_1.Tree({
                container: this.wrapper.querySelector('.treeMenus'),
                isShowCheckBox: false,
                isVirtual: false,
                isLeaf: false,
                expand: true,
                icon: 'iconfont icon-folder',
                text: '菜单',
                ajax: function (node) {
                    var url = config.ajaxUrl.menuQuery;
                    if (node.deep !== 0) {
                        url = url + '/' + node.content.nodeId;
                    }
                    return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                        var response = _a.response;
                        var arr = [];
                        response.dataArr.forEach(function (treeObj) {
                            var obj = _this.itemToNode(treeObj);
                            arr.push(obj);
                        });
                        return arr;
                    });
                }
            });
            var self = this;
            // 选择某个节点
            tree.onSelect = function (node) {
                self.isEditing = 'none';
                self.menuDesignModule.contextMenu.wrapper.classList.add('hideContextMenu');
                var designContent = self.menuDesignModule.designContent;
                if (node.text === '菜单') {
                    self.showContent(false);
                    return;
                }
                self.showContent(true);
                // let title = {
                //     nodeId: "菜单编码",
                //     itemId: "页面编码",
                //     caption: "标题",
                //     captionExplain: "标题说明",
                //     iconName: "图标",
                // };
                // self.setTitle(title);
                var newObj = self.handleNode(node);
                // 设置右侧内容
                for (var key in designContent.allItems) {
                    if (key === 'isLeaf') {
                        designContent.allItems['isLeaf'].set(newObj['isLeaf']);
                    }
                    else {
                        designContent.allItems[key].set(newObj[key]);
                    }
                }
            };
            return tree;
        };
        MenuDesignPage.prototype.showContent = function (isShow) {
            var designContent = this.menuDesignModule.designContent;
            designContent.isShow = isShow;
            this.btns.forEach(function (btn) {
                btn.isDisabled = !isShow;
            });
        };
        // item转node
        MenuDesignPage.prototype.itemToNode = function (node) {
            var obj = {
                text: '',
                content: {},
                icon: '',
                isLeaf: false
            };
            var contentObj = {};
            for (var key in node) {
                if (key === 'captionExplain') {
                    obj.text = node['captionExplain'];
                }
                else if (key === 'iconName') {
                    obj.icon = node['iconName'];
                }
                else if (key === 'isEnd') {
                    obj.isLeaf = node['isEnd'] === 0 ? false : true;
                    contentObj['isLeaf'] = node['isEnd'] === 0 ? false : true;
                }
                else {
                    contentObj[key] = node[key];
                }
            }
            obj.content = contentObj;
            return obj;
        };
        // node 转 item
        MenuDesignPage.prototype.handleNode = function (node) {
            var obj = {
                captionExplain: '',
                iconName: '',
                varId: ''
            };
            obj.captionExplain = node.text;
            obj.iconName = node.icon;
            var newObj = tools.obj.merge(obj, node.content);
            return newObj;
        };
        // 初始化按钮
        MenuDesignPage.prototype.initBottomButtons = function () {
            var _this = this;
            var self = this;
            var btnTitleArr = ['修改', '保存'];
            var classArr = ['de-xiugai', 'de-baocun'];
            this.btns = [];
            btnTitleArr.forEach(function (value, index) {
                var tree = _this.menuDesignModule.tree;
                var btn = new Button_1.Button({
                    container: _this.wrapper.querySelector('.contentButtons'),
                    content: value,
                    icon: classArr[index],
                    iconPre: 'dev',
                    onClick: function () {
                        if (index === 0) {
                            if (tools.isEmpty(tree.getSelectedNodes())) {
                                Modal_1.Modal.alert('请先选择一个节点');
                                return;
                            }
                            if (self.isEditing !== 'none') {
                                Modal_1.Modal.alert('正在编辑，请稍候...');
                                return;
                            }
                        }
                        var currentSelectNode = tree.getSelectedNodes()[0];
                        switch (index) {
                            case 0:
                                {
                                    if (self.isEditing === 'none') {
                                        self.isEditing = 'update';
                                    }
                                }
                                break;
                            case 1:
                                {
                                    if (self.isEditing !== 'none') {
                                        self.changeNode(currentSelectNode);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
                _this.btns.push(btn);
            });
            new Button_1.Button({
                container: this.wrapper.querySelector('.contentButtons'),
                content: '预览',
                className: 'preview-btn',
                onClick: function (event) {
                    if (self.isEditing === 'insert' || self.isEditing === 'update') {
                        Modal_1.Modal.alert('请先保存当前修改');
                        return;
                    }
                    DVAjax_1.DVAjax.interface(function (res) {
                        if (res.errorCode === 0) {
                            var body = d.create('<div class="inputModal"></div>'), loginUrl_1 = res.data.sso.loginUrl, userInput_1 = new text_1.TextInput({
                                container: body,
                                className: 'userInput',
                                placeholder: '请输入用户名'
                            });
                            var m_1 = new Modal_1.Modal({
                                header: '请输入登录用户名',
                                body: body,
                                footer: {},
                                isOnceDestroy: true,
                                onOk: function () {
                                    var userId = userInput_1.get().replace(/\s+/g, '');
                                    if (tools.isEmpty(userId)) {
                                        Modal_1.Modal.alert('登录用户名不能为空!');
                                    }
                                    else {
                                        var url = tools.url.addObj(loginUrl_1, {
                                            userid: userId.toUpperCase(),
                                            forwardurl: 'commonui/pageroute?page=static%2Fmain'
                                        });
                                        window.open(url);
                                        m_1.destroy();
                                    }
                                },
                                onCancel: function () {
                                    m_1.destroy();
                                }
                            });
                        }
                    });
                }
            });
        };
        // private _tipsWrapper:HTMLElement;
        // get tipsWrapper(){
        //     if (!this._tipsWrapper){
        //         this._tipsWrapper = d.create('<ul class="tips"></ul>');
        //         document.body.appendChild(this._tipsWrapper);
        //     }
        //     return this._tipsWrapper;
        // }
        // private setTips(searchStr:string){
        //     let tips:string[] = JSON.parse(localStorage.getItem('tips'));
        //     if (!tools.isEmpty(tips)){
        //         this.tipsWrapper.style.display = 'block';
        //         this.tipsWrapper.innerHTML = '';
        //         tips.filter((t)=>{
        //             return t.indexOf(searchStr) !== -1;
        //         }).forEach((ti)=>{
        //             this.tipsWrapper.appendChild(d.create(`<li>${ti}</li>`));
        //         });
        //     }
        // }
        // 获取表单元素内容并转化为obj
        MenuDesignPage.prototype.handleItem = function () {
            var item = {
                nodeId: '',
                captionExplain: '',
                treeId: '',
                itemId: '',
                parentId: '',
                iconName: '',
                varId: '',
                appId: 'app_sanfu_retail',
                isEnd: 0,
                psuse: 0,
                terminalFlag: 0,
                seqNo: 1,
                caption: ''
            };
            var selectedNode = this.menuDesignModule.tree.getSelectedNodes()[0];
            var designObj = this.menuDesignModule.designContent.allItems;
            for (var key in item) {
                if (key === 'appId' || key === 'psuse' || key === 'terminalFlag' || key === 'seqNo') {
                    continue;
                }
                if (key === 'isEnd') {
                    item[key] = designObj['isLeaf'].get() === true ? 1 : 0;
                }
                else if (key === 'itemId') {
                    if (tools.isNotEmpty(designObj['itemId'])) {
                        item[key] = designObj['itemId'].get();
                    }
                }
                else if (key === 'treeId') {
                    if (tools.isNotEmpty(selectedNode.content)) {
                        item['treeId'] = selectedNode.content.treeId;
                    }
                    else {
                        item['treeId'] = '';
                    }
                }
                else {
                    item[key] = designObj[key].get();
                }
            }
            return item;
        };
        // 初始化菜单内容显示
        MenuDesignPage.prototype.initDesignContent = function () {
            return new MenuDesignModule_1.MenuDesignModule({
                menuDesignData: [],
                container: this.wrapper.querySelector('.designContent')
            });
        };
        Object.defineProperty(MenuDesignPage.prototype, "isEditing", {
            get: function () {
                if (this._isEditing === undefined) {
                    this._isEditing = 'none';
                }
                return this._isEditing;
            },
            set: function (isEditing) {
                this._isEditing = isEditing;
                var designObj = this.menuDesignModule.designContent.allItems, editingType = ['none', 'delete'];
                if (editingType.indexOf(this._isEditing) === -1) {
                    for (var key in designObj) {
                        if (key === 'iconName' || key === 'captionExplain' || key === 'varId' || key === 'isLeaf') {
                            designObj[key].disabled = false;
                        }
                        else {
                            designObj[key].disabled = true;
                        }
                    }
                }
                else {
                    for (var key in designObj) {
                        designObj[key].disabled = true;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        // 修改+删除+新增 节点
        MenuDesignPage.prototype.changeNode = function (selectedNode) {
            var _this = this;
            var paraObj = {};
            paraObj.type = 'tree';
            var nodeItem = this.handleItem();
            paraObj[this.isEditing] = [nodeItem];
            var nodeId = tools.isNotEmpty(selectedNode.content) ? selectedNode.content.nodeId : '', treeId = '';
            if (tools.isEmpty(nodeId)) {
                treeId = '?topmenu=1';
            }
            DVAjax_1.DVAjax.menuQueryAjax(nodeId, function (response) {
                if (response.errorCode === 0) {
                    // 更新tree
                    switch (_this.isEditing) {
                        case 'update':
                            {
                                var node = _this.itemToNode(nodeItem);
                                selectedNode.text = nodeItem.captionExplain;
                                selectedNode.content = node.content;
                                selectedNode.icon = node.icon;
                                selectedNode.isLeaf = node.isLeaf;
                            }
                            break;
                        case 'insert':
                            {
                                var node = _this.itemToNode(nodeItem);
                                selectedNode.childrenAdd(node);
                                selectedNode.refresh();
                            }
                            break;
                        case 'delete':
                            {
                                selectedNode.parent.refresh();
                                _this.menuDesignModule['designContent'].isShow = false;
                            }
                            break;
                        default:
                            break;
                    }
                    _this.isEditing = 'none';
                    Modal_1.Modal.toast(response.msg);
                }
            }, { type: 'POST', data: paraObj }, treeId);
        };
        MenuDesignPage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.contextMenuEvent.off();
            this.mouseupEvent.off();
            this.scrollEvent.off();
        };
        return MenuDesignPage;
    }(SPAPage));
    exports.MenuDesignPage = MenuDesignPage;
});

/// <amd-module name="MenuDevelopPage"/>
define("MenuDevelopPage", ["require", "exports", "OverviewModule", "Button", "DVAjax", "Modal"], function (require, exports, OverviewModule_1, Button_1, DVAjax_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var MenuDevelopPage = /** @class */ (function (_super) {
        __extends(MenuDevelopPage, _super);
        function MenuDevelopPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MenuDevelopPage.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"menu-develop\">\n        <div class=\"item\"></div>\n        <div class=\"saveBtn\"></div>\n</div>\n        ");
        };
        MenuDevelopPage.prototype.init = function (para, data) {
            var _this = this;
            this.title = '目录开发';
            if (tools.isNotEmpty(data)) {
                MenuDevelopPage.itemId = data[0] || ''; // 获取传过来的itemId
            }
            else {
                MenuDevelopPage.itemId = '';
            }
            this.initItems();
            new Button_1.Button({
                content: '保存',
                container: d.query('.saveBtn', this.wrapper),
                className: 'save',
                onClick: function () {
                    var editType = 'insert';
                    if (tools.isNotEmpty(MenuDevelopPage.itemId)) {
                        // 修改
                        editType = 'update';
                    }
                    var para = {
                        type: 'menu',
                    };
                    para[editType] = [_this.formElementToItem()];
                    DVAjax_1.DVAjax.itemQueryAjax(function (res) {
                        Modal_1.Modal.toast(res.msg);
                        if (editType === 'insert') {
                            _this.item.allItems['itemId'].set(res.data['itemId']);
                            // this.itemId = res.data['itemId'];
                        }
                    }, MenuDevelopPage.itemId, { type: 'POST', data: para });
                }
            });
        };
        MenuDevelopPage.prototype.formElementToItem = function () {
            var obj = {};
            for (var key in this.item.allItems) {
                if (tools.isNotEmpty(this.item.allItems[key].get())) {
                    obj[key] = this.item.allItems[key].get();
                }
                else {
                    obj[key] = '';
                }
            }
            return obj;
        };
        Object.defineProperty(MenuDevelopPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        MenuDevelopPage.prototype.initItems = function () {
            this.item = new OverviewModule_1.OverviewModule({
                container: d.query('.item', this.wrapper)
            });
            this.item.isShow = true;
            this.item.allItems['itemId'].disabled = true;
        };
        return MenuDevelopPage;
    }(SPAPage));
    exports.MenuDevelopPage = MenuDevelopPage;
});

define("PageDesignPage", ["require", "exports", "DropDownModule", "Button", "FastTable", "TextInputModule", "DVAjax", "Modal", "TextInput", "MountMenuModal"], function (require, exports, DropDownModule_1, Button_1, FastTable_1, TextInputModule_1, DVAjax_1, Modal_1, text_1, MountMenu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="PageDesignPage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var config = DV.CONF;
    var SPA = G.SPA;
    var PageDesignPage = /** @class */ (function (_super) {
        __extends(PageDesignPage, _super);
        function PageDesignPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PageDesignPage.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"pageDesign\">\n            <div class=\"conditions\">\n                \n            </div>\n            <div class=\"buttons\"></div>\n            <div class=\"table\"></div>\n        </div>");
        };
        Object.defineProperty(PageDesignPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        PageDesignPage.prototype.init = function (para, data) {
            this.title = "页面设计";
            this.initConditions();
            this.initBtn();
            this.initTable();
            // SPA.onChange((newHash, oldHash) => {
            //     if (newHash.routeName === 'pageDesign') {
            //         this.clearTableAjaxData();
            //     }
            // })
        };
        PageDesignPage.prototype.initConditions = function () {
            var _this = this;
            var itemIdText = '';
            var itemId = new TextInputModule_1.TextInputModule({
                container: d.query('.conditions', this.wrapper),
                title: '页面编码',
                disabled: false,
            });
            itemId.textInput.on('blur', function (e) {
                var inputValue = e.target.value.replace(/\s+/g, '');
                if (inputValue === itemIdText) {
                    return;
                }
                _this.queryByConditions();
                itemIdText = inputValue;
            });
            var captionSqlText = '';
            var captionSql = new TextInputModule_1.TextInputModule({
                container: d.query('.conditions', this.wrapper),
                title: '标题',
                disabled: false,
            });
            captionSql.textInput.on('blur', function (e) {
                var inputValue = e.target.value.replace(/\s+/g, '');
                if (inputValue === captionSqlText) {
                    return;
                }
                _this.queryByConditions();
                captionSqlText = inputValue;
            });
            var itemType = new DropDownModule_1.DropDownModule({
                container: d.query('.conditions', this.wrapper),
                title: '页面类型',
                disabled: false,
                data: ['请选择', '目录', '查询器', '自定义'],
                changeValue: function (val) {
                    _this.queryByConditions();
                }
            });
            var dataSource = new DropDownModule_1.DropDownModule({
                container: d.query('.conditions', this.wrapper),
                title: '数据源',
                disabled: false,
                changeValue: function (val) {
                    _this.queryByConditions();
                }
            });
            this.conditions = {
                itemId: itemId,
                dataSource: dataSource,
                itemType: itemType,
                captionSql: captionSql
            };
            DVAjax_1.DVAjax.dataSourceQueryAjax(function (res) {
                res.unshift('请选择');
                dataSource.dpData = res;
            });
            d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'));
        };
        PageDesignPage.prototype.initBtn = function () {
            var _this = this;
            var btnArr = [
                {
                    name: '新增',
                    iconPre: 'dev',
                    icon: 'de-xinzeng'
                },
                {
                    name: '修改',
                    iconPre: 'dev',
                    icon: 'de-xiugai'
                },
                {
                    name: '删除',
                    iconPre: 'dev',
                    icon: 'de-shanchu'
                },
                {
                    name: '预览',
                    iconPre: 'dev',
                    icon: 'de-yulan'
                }
            ];
            btnArr.forEach(function (btn, index) {
                new Button_1.Button({
                    content: btn.name,
                    iconPre: btn.iconPre,
                    icon: btn.icon,
                    container: d.query('.buttons', _this.wrapper),
                    onClick: function () {
                        var selectedRow = _this.table.selectedRows;
                        switch (index) {
                            case 0:
                                {
                                    // 新增
                                    var modalBody = d.create("<div class=\"modalBody\"></div>");
                                    new Button_1.Button({
                                        content: '新增查询器',
                                        container: modalBody,
                                        onClick: function (e) {
                                            SPA.close(SPA.hashCreate('develop', 'queryDevice'));
                                            SPA.open(SPA.hashCreate('develop', 'queryDevice'));
                                            modal_1.destroy();
                                        }
                                    });
                                    new Button_1.Button({
                                        content: '新增目录',
                                        container: modalBody,
                                        onClick: function (e) {
                                            SPA.close(SPA.hashCreate('develop', 'menuDevelop'));
                                            SPA.open(SPA.hashCreate('develop', 'menuDevelop'));
                                            modal_1.destroy();
                                        }
                                    });
                                    var modal_1 = new Modal_1.Modal({
                                        body: modalBody,
                                        top: 150
                                    });
                                }
                                break;
                            case 1:
                                {
                                    // 修改
                                    if (selectedRow.length <= 0) {
                                        Modal_1.Modal.alert('请先选择需要修改的Item');
                                    }
                                    else if (selectedRow.length > 1) {
                                        Modal_1.Modal.alert('请只选择一条数据修改');
                                    }
                                    else {
                                        var route = '';
                                        if (selectedRow[0].cells[1].text === 'list') {
                                            route = 'queryDevice';
                                        }
                                        else if (selectedRow[0].cells[1].text === 'menu') {
                                            route = 'menuDevelop';
                                        }
                                        else {
                                            Modal_1.Modal.alert('暂不支持CUSTOM类型的修改！');
                                            return;
                                        }
                                        SPA.close(SPA.hashCreate('develop', route));
                                        SPA.open(SPA.hashCreate('develop', route), [selectedRow[0].cells[0].text]);
                                    }
                                }
                                break;
                            case 2:
                                {
                                    // 删除
                                    if (selectedRow.length <= 0) {
                                        Modal_1.Modal.alert("请先选择要删除的ITEM");
                                        return;
                                    }
                                    var deleteObj = _this.jageDeleteItem(), type_1 = deleteObj.type;
                                    if (!deleteObj.isDelete) {
                                        Modal_1.Modal.alert('批量删除请选择统一类型的ITEM');
                                        return;
                                    }
                                    var para_1 = {
                                        type: type_1,
                                        delete: deleteObj.deleteData
                                    };
                                    Modal_1.Modal.confirm({
                                        msg: '确定要删除吗？',
                                        title: '温馨提示',
                                        callback: function (flag) {
                                            flag && DVAjax_1.DVAjax.itemDelete(function (res) {
                                                Modal_1.Modal.toast(res.msg);
                                                _this.clearTableAjaxData();
                                            }, { type: 'POST', data: para_1 }, type_1);
                                        }
                                    });
                                }
                                break;
                            case 3:
                                {
                                    if (selectedRow.length <= 0) {
                                        Modal_1.Modal.alert('请先选择需要预览的Item');
                                    }
                                    else if (selectedRow.length > 1) {
                                        Modal_1.Modal.alert('请只选择一个item进行预览');
                                    }
                                    else {
                                        var itemId_1 = selectedRow[0].cells[0].text, itemType = selectedRow[0].cells[1].text, itemCaption_1 = selectedRow[0].cells[2].text;
                                        if (itemType === 'custom') {
                                            Modal_1.Modal.alert('抱歉，暂不支持CUSTOM类型预览！');
                                            return;
                                        }
                                        if (tools.isNotEmpty(itemId_1)) {
                                            DVAjax_1.DVAjax.itemInterface(itemId_1, function (res) {
                                                if (res.errorCode === 0) {
                                                    var body = d.create('<div class="inputModal"></div>'), loginUrl_1 = res.data.sso.loginUrl, nodeId_1 = res.data.nodeId, userInput_1 = new text_1.TextInput({
                                                        container: body,
                                                        className: 'userInput',
                                                        placeholder: '请输入用户名'
                                                    });
                                                    var m_1 = new Modal_1.Modal({
                                                        header: '请输入预览登录用户名',
                                                        body: body,
                                                        footer: {},
                                                        isOnceDestroy: true,
                                                        onOk: function () {
                                                            var userId = userInput_1.get().replace(/\s+/g, '');
                                                            if (tools.isEmpty(userId)) {
                                                                Modal_1.Modal.alert('登录用户名不能为空!');
                                                            }
                                                            else {
                                                                var url = tools.url.addObj(loginUrl_1, {
                                                                    userid: userId.toUpperCase(),
                                                                    forwardurl: 'commonui/pageroute?page=static%2Fmain'
                                                                });
                                                                url = url + ("#page=/ui/select/" + nodeId_1);
                                                                window.open(url);
                                                                m_1.destroy();
                                                            }
                                                        },
                                                        onCancel: function () {
                                                            m_1.destroy();
                                                        }
                                                    });
                                                }
                                            }, function (error) {
                                                var errorRes = JSON.parse(error.xhr.responseText);
                                                console.log(errorRes);
                                                Modal_1.Modal.confirm({
                                                    msg: errorRes.msg,
                                                    title: '预览提示',
                                                    btns: ['取消预览', '挂载菜单'],
                                                    callback: function (flag) {
                                                        if (flag) {
                                                            new MountMenu_1.MountMenuModal(itemId_1, itemCaption_1);
                                                        }
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            Modal_1.Modal.alert('ITEM不存在，请重新选择！');
                                        }
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
            });
        };
        PageDesignPage.prototype.jageDeleteItem = function () {
            var selectRows = this.table.selectedRows, len = selectRows.length, fItemType = '', deleteData = [];
            var _loop_1 = function (i) {
                var row = selectRows[i], itemType = row.cells[1].text;
                if (i === 0) {
                    fItemType = itemType;
                }
                else {
                    if (fItemType !== itemType) {
                        return { value: {
                                type: '',
                                isDelete: false,
                                deleteData: []
                            } };
                    }
                }
                var item = {};
                row.cells.forEach(function (cell) {
                    if (cell.name.indexOf('Flag') !== -1 || cell.name === 'pause') {
                        item[cell.name] = cell.text === '否' ? 0 : 1;
                    }
                    else {
                        item[cell.name] = cell.text;
                    }
                });
                deleteData.push(item);
            };
            for (var i = 0; i < len; i++) {
                var state_1 = _loop_1(i);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            return {
                type: fItemType,
                isDelete: true,
                deleteData: deleteData
            };
        };
        Object.defineProperty(PageDesignPage.prototype, "itemCols", {
            get: function () {
                if (tools.isEmpty(this._itemCols)) {
                    this._itemCols = [
                        { name: 'itemId', title: '页面编码' },
                        { name: 'itemType', title: '页面类型' },
                        { name: 'captionSql', title: '标题' },
                        { name: 'dataSource', title: '数据源' },
                        { name: 'keyField', title: '主键字段' },
                        { name: 'pause', title: '是否启用' }
                    ];
                }
                return this._itemCols;
            },
            enumerable: true,
            configurable: true
        });
        PageDesignPage.prototype.initTable = function () {
            var _this = this;
            d.query('.table', this.wrapper).innerHTML = '';
            this.table = new FastTable_1.FastTable({
                container: d.query('.table', this.wrapper),
                cols: [this.itemCols],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.itemQuery + '?pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara();
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            // let data: obj[] = tools.isNotEmpty(response.dataArr) ? response.dataArr : [response.data],
                            var data = response.dataArr, total = 0;
                            data.forEach(function (item) {
                                item.pause = item.pause === 0 ? '否' : '是';
                            });
                            tools.isNotEmptyArray(data) && (total = response.head.total);
                            return { data: data, total: total };
                        });
                    },
                    auto: false,
                    once: false
                },
                page: {
                    size: 50,
                    options: [50, 100]
                }
            });
        };
        Object.defineProperty(PageDesignPage.prototype, "ajaxPara", {
            get: function () {
                if (!this._ajaxPara) {
                    this._ajaxPara = {
                        item_id: '',
                        data_source: '',
                        item_type: '',
                        caption_sql: ''
                    };
                }
                return this._ajaxPara;
            },
            set: function (para) {
                this._ajaxPara = para;
                this.table && this.table._clearAllSelectedCells();
                this.table && this.table.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        PageDesignPage.prototype.clearTableAjaxData = function () {
            var cond = this.conditions;
            cond['captionSql'].set('');
            cond['itemId'].set('');
            cond['itemType'].set('');
            cond['dataSource'].set('请选择');
            this.queryByConditions();
        };
        PageDesignPage.prototype.handlerAjaxPara = function () {
            var str = '&fuzzyparams={', paraStr = '', ajaxParaData = this.ajaxPara;
            for (var key in ajaxParaData) {
                if (tools.isNotEmpty(ajaxParaData[key])) {
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(ajaxParaData[key]) ? '"' + ajaxParaData[key] + '"' : '""') + ',';
                }
            }
            if (tools.isNotEmpty(paraStr)) {
                paraStr = paraStr.slice(0, paraStr.length - 1);
                str = str + paraStr + '}';
                return encodeURI(str);
            }
            else {
                return '';
            }
        };
        PageDesignPage.prototype.queryByConditions = function () {
            var items = this.conditions, captionSql = '', dataSource = '', itemType = '', itemId = '';
            if (tools.isNotEmpty(items)) {
                captionSql = items['captionSql'].get().replace(/\s+/g, '');
                dataSource = items['dataSource'].get().replace(/\s+/g, '');
                itemType = items['itemType'].get().replace(/\s+/g, '');
                itemId = items['itemId'].get().replace(/\s+/g, '');
                var typeObj = {
                    "自定义": 'custom',
                    "目录": 'menu',
                    "查询器": 'list',
                    "请选择": ''
                };
                itemType = typeObj[itemType];
            }
            dataSource = dataSource === '请选择' ? '' : dataSource;
            var obj = {
                item_id: itemId,
                data_source: dataSource,
                item_type: itemType,
                caption_sql: captionSql
            };
            this.ajaxPara = obj;
        };
        return PageDesignPage;
    }(SPAPage));
    exports.PageDesignPage = PageDesignPage;
});

define("QueryDevicePage", ["require", "exports", "OverviewModule", "MainFuncModule", "ProductScriptModule", "Button", "OperationModule", "StepBar"], function (require, exports, OverviewModule_1, MainFuncModule_1, ProductScriptModule_1, Button_1, OperationModule_1, StepBar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="QueryDevicePage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var QueryDevicePage = /** @class */ (function (_super) {
        __extends(QueryDevicePage, _super);
        function QueryDevicePage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(QueryDevicePage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        QueryDevicePage.prototype.init = function (para, data) {
            if (tools.isNotEmpty(data)) {
                QueryDevicePage.itemId = data[0] || ''; // 获取传过来的itemId
            }
            else {
                QueryDevicePage.itemId = '';
            }
            this.title = "查询器开发";
            this.initNav();
            this.initItems();
            this.initStepBtn();
            this.previousIndex = 0;
        };
        QueryDevicePage.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"queryDevicePage\">\n            <div class=\"queryItems\"></div>\n            <div class=\"queryContent\">\n                <div class=\"item1 item-container\"></div>\n                <div class=\"item2 item-container\"></div>\n                <div class=\"item3 item-container\"></div>\n                <div class=\"item4 item-container\"></div>\n            </div>\n            <div class=\"stepBtn\"></div>\n        </div>");
        };
        QueryDevicePage.prototype.initNav = function () {
            var _this = this;
            var btnTitleArray = ['概述', '主功能', '操作', '保存预览'];
            this.navStep = new StepBar_1.StepBar({
                container: this.wrapper.querySelector('.queryItems'),
                btnArr: btnTitleArray,
                changePage: function (index) {
                    _this.qdChangePage(index);
                },
                allowClickNum: true
            });
        };
        Object.defineProperty(QueryDevicePage.prototype, "previousIndex", {
            get: function () {
                return this._previousIndex;
            },
            set: function (index) {
                this._previousIndex = index;
            },
            enumerable: true,
            configurable: true
        });
        QueryDevicePage.prototype.qdChangePage = function (index) {
            if (index === 3) {
                this.stepBtn.isShow = false;
            }
            else {
                this.stepBtn.isShow = true;
            }
            if (index === this.previousIndex) {
                return;
            }
            if (this._previousIndex < 3) {
                // 离开的页面保存数据
                var leaveItem = this.allItems[this._previousIndex];
                QueryDevicePage._allQDData[this._previousIndex] = leaveItem.get();
            }
            this.allItems.forEach(function (item, i) {
                if (index === i) {
                    item.isShow = true;
                }
                else {
                    item.isShow = false;
                }
            });
            this.previousIndex = index;
        };
        QueryDevicePage.prototype.handleResponse = function (res) {
            var data = [];
            res.dataArr.forEach(function (item) {
                var obj = {
                    itemId: '',
                    captionSql: '',
                    itemType: '',
                    dataSource: '',
                    baseTable: '',
                    keyField: '',
                    nameField: '',
                    settingId: '',
                    pause: 0
                };
                var newObj = tools.obj.merge(obj, item);
                data.push(newObj);
            });
            return data;
        };
        QueryDevicePage.prototype.initStepBtn = function () {
            var _this = this;
            this.stepBtn = new Button_1.Button({
                container: d.query('.stepBtn', this.wrapper),
                content: '下一步',
                onClick: function (e) {
                    _this.navStep.currentIndex += 1;
                    _this.qdChangePage(_this.navStep.currentIndex);
                }
            });
        };
        QueryDevicePage.prototype.initItems = function () {
            this.allItems = [];
            var itemId = QueryDevicePage.itemId;
            // 概述
            var overview = new OverviewModule_1.OverviewModule({
                container: this.wrapper.querySelector('.item1'),
                isQuery: true
            });
            overview.isShow = true;
            this.allItems.push(overview);
            // 主功能
            var mainFunc = new MainFuncModule_1.MainFuncModule({
                container: this.wrapper.querySelector('.item2')
            });
            this.allItems.push(mainFunc);
            // 操作
            var operation = new OperationModule_1.OperationModule({
                container: this.wrapper.querySelector('.item3')
            });
            this.allItems.push(operation);
            // 保存预览
            var productScript = new ProductScriptModule_1.ProductScriptModule({
                container: this.wrapper.querySelector('.item4')
            });
            this.allItems.push(productScript);
        };
        Object.defineProperty(QueryDevicePage.prototype, "elementRelatedData", {
            get: function () {
                if (!this._elementRelatedData) {
                    this._elementRelatedData = {
                        action: [],
                        handle: [],
                        assign: [],
                        default: [],
                        adt: [],
                        aggregate: [],
                        associate: [],
                        calculate: [],
                        import: [],
                        lookup: [],
                        pick: [],
                        value: []
                    };
                }
                return this._elementRelatedData;
            },
            enumerable: true,
            configurable: true
        });
        QueryDevicePage._allQDData = [{}, {}, {}];
        return QueryDevicePage;
    }(SPAPage));
    exports.QueryDevicePage = QueryDevicePage;
});

/// <amd-module name="VarDesignPage" />
define("VarDesignPage", ["require", "exports", "DVAjax", "Button", "Modal", "FastTable", "TextInputModule", "DropDownModule"], function (require, exports, DVAjax_1, Button_1, Modal_1, FastTable_1, TextInputModule_1, DropDownModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPAPage = G.SPAPage;
    var d = G.d;
    var tools = G.tools;
    var config = DV.CONF;
    var VarDesignPage = /** @class */ (function (_super) {
        __extends(VarDesignPage, _super);
        function VarDesignPage() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._tableAjaxPara = null;
            return _this;
        }
        VarDesignPage.prototype.init = function (para, data) {
            this.title = "变量设计";
            this.initConditions(); // 筛选条件
            this.initButtons(); // 初始化按钮
            this.getAllVarData(); // 获取表数据
        };
        VarDesignPage.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"varDesign\">\n        <div class=\"conditions\"></div>\n            <div class=\"buttons\"></div>\n            <div class=\"table\"></div>\n        </div>");
        };
        Object.defineProperty(VarDesignPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (str) {
                this._title = str;
            },
            enumerable: true,
            configurable: true
        });
        VarDesignPage.prototype.initConditions = function () {
            var _this = this;
            var varIdText = '';
            var varId = new TextInputModule_1.TextInputModule({
                title: '变量 ID',
                container: d.query('.conditions', this.wrapper)
            });
            varId.textInput.on('change', function (e) {
                var input = e.target;
                if (input.value === varIdText) {
                    return;
                }
                _this.getAllConditions();
                varIdText = input.value;
            });
            var varNameText = '';
            var varName = new TextInputModule_1.TextInputModule({
                title: '变量名称',
                container: d.query('.conditions', this.wrapper)
            });
            varName.textInput.on('blur', function (e) {
                var input = e.target;
                if (input.value === varNameText) {
                    return;
                }
                _this.getAllConditions();
                varNameText = input.value;
            });
            var varSqlText = '';
            var varSql = new TextInputModule_1.TextInputModule({
                title: '变量Sql',
                container: d.query('.conditions', this.wrapper)
            });
            varSql.textInput.on('blur', function (e) {
                var input = e.target;
                if (input.value === varSqlText) {
                    return;
                }
                _this.getAllConditions();
                varSqlText = input.value;
            });
            var dataSource = new DropDownModule_1.DropDownModule({
                title: '数据源',
                container: d.query('.conditions', this.wrapper),
                disabled: false,
                changeValue: function (val) {
                    _this.getAllConditions();
                }
            });
            DVAjax_1.DVAjax.dataSourceQueryAjax(function (res) {
                _this.dataSource = res;
                var da = res.slice();
                da.unshift('请选择');
                dataSource.dpData = da;
            });
            d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'));
            this.conditions = {
                varId: varId,
                varName: varName,
                dataSource: dataSource,
                varSql: varSql
            };
        };
        VarDesignPage.prototype.initButtons = function () {
            var _this = this;
            var btnArr = [
                {
                    name: '新增',
                    iconPre: 'dev',
                    icon: 'de-xinzeng'
                },
                {
                    name: '修改',
                    iconPre: 'dev',
                    icon: 'de-xiugai'
                },
                {
                    name: '删除',
                    iconPre: 'dev',
                    icon: 'de-shanchu'
                }
            ];
            btnArr.forEach(function (btn, index) {
                var self = _this;
                new Button_1.Button({
                    content: btn.name,
                    iconPre: btn.iconPre,
                    icon: btn.icon,
                    container: d.query('.buttons', _this.wrapper),
                    onClick: function (e) {
                        switch (index) {
                            case 0:
                                {
                                    // 新增
                                    _this.updateOrInsertElement();
                                }
                                break;
                            case 1:
                                {
                                    var selectRows = _this._table.selectedRows;
                                    if (selectRows.length <= 0) {
                                        Modal_1.Modal.alert('请先选择一个变量');
                                    }
                                    else if (selectRows.length > 1) {
                                        Modal_1.Modal.alert('请只选择一个变量');
                                    }
                                    else {
                                        var row = selectRows[0], cellsData_1 = {};
                                        row.cells.forEach(function (cell) {
                                            cellsData_1[cell.name] = cell.text;
                                        });
                                        _this.updateOrInsertElement(cellsData_1);
                                    }
                                }
                                break;
                            case 2:
                                {
                                    // 删除
                                    var selectRows = _this._table.selectedRows, deleteItem_1 = [];
                                    if (selectRows.length <= 0) {
                                        Modal_1.Modal.alert("请先选择要删除的变量");
                                        return;
                                    }
                                    selectRows.forEach(function (row) {
                                        var item = {};
                                        row.cells.forEach(function (cell) {
                                            item[cell.name] = cell.text;
                                        });
                                        deleteItem_1.push(item);
                                    });
                                    var para_1 = {
                                        type: "var",
                                        delete: deleteItem_1
                                    };
                                    Modal_1.Modal.confirm({
                                        msg: '确定要删除吗？',
                                        title: '温馨提示',
                                        callback: function (flag) {
                                            flag && DVAjax_1.DVAjax.varDesignAjax(function (res) {
                                                Modal_1.Modal.toast(res.msg);
                                                _this.clearAjaxPara();
                                            }, { type: 'POST', data: para_1 });
                                        }
                                    });
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
            });
        };
        Object.defineProperty(VarDesignPage.prototype, "varTableCols", {
            get: function () {
                if (!this._varTableCols) {
                    this._varTableCols = [
                        { name: 'varId', title: '变量ID' },
                        { name: 'dataSource', title: '数据源' },
                        { name: 'varName', title: '变量名称' },
                        { name: 'varSql', title: '变量SQL' }
                    ];
                }
                return this._varTableCols;
            },
            enumerable: true,
            configurable: true
        });
        // 更新或者新增element
        VarDesignPage.prototype.updateOrInsertElement = function (obj) {
            var _this = this;
            var title = tools.isNotEmpty(obj) ? '修改变量' : '新增变量', // Modal的title
            cols = this.varTableCols, // 表单name对应
            html = this.createModalBody(cols, obj); // 获取Modal的body
            var modal = new Modal_1.Modal({
                header: {
                    title: title
                },
                body: html,
                footer: {},
                width: '700px',
                isOnceDestroy: true,
                className: 'varModal',
                onOk: function () {
                    var elements = d.queryAll('.form-control', d.query('.form-horizontal', document.body)), data = {};
                    for (var j = 0; j < elements.length; j++) {
                        var name_1 = elements[j].getAttribute('name'), element = elements[j];
                        if (element.value) {
                            data[name_1] = element.value;
                        }
                    }
                    var type = 'update';
                    if (!obj) {
                        // 新增
                        type = 'insert';
                    }
                    var varPara = {
                        type: 'var',
                    };
                    varPara[type] = [data];
                    var isOk = true;
                    if (tools.isEmpty(data.varId)) {
                        Modal_1.Modal.alert('变量ID不能为空');
                        isOk = false;
                    }
                    if (isOk && data.dataSource === '请选择') {
                        Modal_1.Modal.alert('数据库不能为空');
                        isOk = false;
                    }
                    if (isOk && tools.isEmpty(data.varSql)) {
                        Modal_1.Modal.alert('变量Sql不能为空');
                        isOk = false;
                    }
                    if (isOk) {
                        DVAjax_1.DVAjax.varDesignAjax(function (res) {
                            if (res.errorCode === 0) {
                                Modal_1.Modal.toast(res.msg);
                                modal.destroy();
                                _this.clearAjaxPara();
                            }
                        }, { type: 'POST', data: varPara });
                    }
                },
                onCancel: function (e) {
                    Modal_1.Modal.confirm({
                        msg: '确认要取消编辑吗？', title: '温馨提示', callback: function (flag) {
                            if (flag) {
                                modal.destroy();
                            }
                        }
                    });
                }
            });
        };
        VarDesignPage.prototype.clearAjaxPara = function () {
            var cond = this.conditions;
            cond['varId'].set('');
            cond['varName'].set('');
            cond['varSql'].set('');
            cond['dataSource'].set('请选择');
            this.getAllConditions();
        };
        Object.defineProperty(VarDesignPage.prototype, "dataSource", {
            get: function () {
                return this._dataSource;
            },
            set: function (data) {
                this._dataSource = data;
            },
            enumerable: true,
            configurable: true
        });
        // 创建Modal的body
        VarDesignPage.prototype.createModalBody = function (cols, data) {
            var _this = this;
            if (data === void 0) { data = {}; }
            var parentNode = {
                tag: 'from',
                props: {
                    className: 'form-horizontal'
                },
                children: []
            };
            var group = { tag: '' };
            cols.forEach(function (col) {
                if (col.name === 'dataSource') {
                    var value = '';
                    if (tools.isNotEmpty(data)) {
                        value = data[col.name];
                    }
                    group = _this.addDataSource(value);
                }
                else {
                    var type = 'text';
                    group = {
                        tag: 'div',
                        props: {
                            className: 'form-group'
                        },
                        children: [
                            {
                                tag: 'label',
                                props: {
                                    className: 'col-sm-2 control-label',
                                    for: col.name
                                },
                                children: [col.title]
                            }, {
                                tag: 'div',
                                props: {
                                    className: 'col-sm-10'
                                },
                                children: [
                                    {
                                        tag: 'input',
                                        props: {
                                            type: type,
                                            className: 'form-control',
                                            id: col.name,
                                            placeHolder: '请输入' + col.title,
                                            name: col.name
                                        }
                                    }
                                ]
                            }
                        ]
                    };
                    if (tools.isNotEmpty(data)) {
                        group.children[1].children[0].props['value'] = data[col.name];
                    }
                }
                parentNode.children.push(group);
            });
            return d.create(parentNode);
        };
        VarDesignPage.prototype.addDataSource = function (value) {
            if (value === void 0) { value = ''; }
            value = tools.isEmpty(value) ? this.dataSource[0] : value;
            var dataSource = {
                tag: 'div',
                props: {
                    className: 'form-group'
                },
                children: [
                    {
                        tag: 'label',
                        props: {
                            className: 'col-sm-2 control-label',
                            for: 'elementType'
                        },
                        children: ['数据源']
                    },
                    {
                        tag: 'div',
                        props: {
                            className: 'col-sm-10'
                        },
                        children: [
                            {
                                tag: 'select',
                                props: {
                                    className: 'form-control',
                                    id: 'dataSource',
                                    name: 'dataSource',
                                },
                                children: []
                            }
                        ]
                    }
                ]
            };
            this.dataSource.forEach(function (data) {
                var obj = {
                    tag: 'option',
                    children: [data]
                };
                if (data === value) {
                    obj.props = {
                        selected: 'selected'
                    };
                }
                var dataSourceGroup = dataSource.children[1];
                dataSourceGroup.children[0].children.push(obj);
            });
            return dataSource;
        };
        VarDesignPage.prototype.getAllConditions = function () {
            var varId = this.conditions.varId.get().replace(/\s+/g, ""), varName = this.conditions.varName.get().replace(/\s+/g, ""), dataSource = this.conditions.dataSource.get().replace(/\s+/g, ""), varSql = this.conditions.varSql.get().replace(/\s+/g, "");
            dataSource = dataSource === '请选择' ? '' : dataSource;
            var obj = {
                var_id: varId,
                var_name: varName,
                data_source: dataSource,
                var_sql: varSql
            };
            this.tableAjaxPara = obj;
        };
        Object.defineProperty(VarDesignPage.prototype, "tableAjaxPara", {
            get: function () {
                if (!this._tableAjaxPara) {
                    this._tableAjaxPara = {
                        var_id: '',
                        var_name: '',
                        data_source: '',
                        var_sql: ''
                    };
                }
                return this._tableAjaxPara;
            },
            set: function (obj) {
                this._tableAjaxPara = obj;
                this._table && this._table._clearAllSelectedCells();
                this._table && this._table.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        VarDesignPage.prototype.handlerAjaxPara = function () {
            var str = '&fuzzyparams={', paraStr = '', ajaxParaData = this.tableAjaxPara;
            for (var key in ajaxParaData) {
                if (tools.isNotEmpty(ajaxParaData[key])) {
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(ajaxParaData[key]) ? '"' + ajaxParaData[key] + '"' : '""') + ',';
                }
            }
            if (tools.isNotEmpty(paraStr)) {
                paraStr = paraStr.slice(0, paraStr.length - 1);
                str = str + paraStr + '}';
                return encodeURI(str);
            }
            else {
                return '';
            }
        };
        VarDesignPage.prototype.getAllVarData = function () {
            var _this = this;
            this._table = new FastTable_1.FastTable({
                container: d.query('.table', this.wrapper),
                cols: [this.varTableCols],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.varDesign + '?pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara();
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            var data = response.dataArr, total = 0;
                            tools.isNotEmptyArray(data) && (total = response.head.total);
                            return { data: data, total: total };
                        });
                    },
                    auto: false,
                    once: false
                },
                page: {
                    size: 50,
                    options: [50, 100]
                }
            });
        };
        return VarDesignPage;
    }(SPAPage));
    exports.VarDesignPage = VarDesignPage;
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
