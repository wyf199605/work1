define("MountMenuModal", ["require", "exports", "Modal", "DVAjax", "Tree", "MenuDesignModule", "Button", "TextInputModule", "FastTable", "DropDownModule", "TextInput"], function (require, exports, Modal_1, DVAjax_1, Tree_1, MenuDesignModule_1, Button_1, TextInputModule_1, FastTable_1, DropDownModule_1, text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var Component = G.Component;
    var MountMenuModal = /** @class */ (function (_super) {
        __extends(MountMenuModal, _super);
        function MountMenuModal(itemId, itemCaption) {
            var _this = this;
            var mountMenu = new MountMenu({
                itemId: itemId,
                itemCaption: itemCaption,
                success: function () {
                    _this.destroy();
                }
            });
            _this = _super.call(this, {
                header: {
                    title: '挂载菜单'
                },
                body: mountMenu.wrapper,
                isShow: true,
                width: '800px',
                height: '500px',
                className: 'mount-body',
            }) || this;
            return _this;
        }
        return MountMenuModal;
    }(Modal_1.Modal));
    exports.MountMenuModal = MountMenuModal;
    var MountMenu = /** @class */ (function (_super) {
        __extends(MountMenu, _super);
        function MountMenu(para) {
            var _this = _super.call(this) || this;
            _this.itemCaption = para.itemCaption;
            _this.itemId = para.itemId;
            _this.initTreeMenus();
            _this.initContent();
            _this.success = para.success;
            DVAjax_1.DVAjax.dataSourceQueryAjax(function (res) {
                // 获取到焦点时弹出选择
                res.unshift('请选择');
                _this.ds = res;
            });
            var allItems = _this.content.allItems;
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
            allItems['iconName'].textInput.on('focus', function (e) {
                if (_this.iconModal) {
                    _this.iconModal.isShow = true;
                }
                else {
                    _this.createIconModal();
                }
            });
            return _this;
        }
        MountMenu.prototype.wrapperInit = function () {
            return d.create("<div class='mountmenu'><div class='tree'></div><div class='content'><div class='saveBtn'></div></div></div>");
        };
        // 初始化左侧树
        MountMenu.prototype.initTreeMenus = function () {
            var _this = this;
            var tree = new Tree_1.Tree({
                container: d.query('.tree', this.wrapper),
                isShowCheckBox: false,
                isVirtual: false,
                isLeaf: false,
                expand: true,
                icon: 'iconfont icon-folder',
                text: '菜单',
                ajax: function (node) {
                    var url = DV.CONF.ajaxUrl.menuQuery;
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
            this.tree = tree;
            // 选择某个节点
            tree.onSelect = function (node) {
                var isLeaf = tools.isNotEmpty(node.content) ? node.content.isLeaf : false, allItems = self.content.allItems;
                if (isLeaf) {
                    Modal_1.Modal.alert('不能挂载到叶子节点');
                    return;
                }
                else {
                    var parentId = 'menuroot', treeId = '';
                    if (tools.isNotEmpty(node.content)) {
                        parentId = node.content.itemId;
                        treeId = node.content.treeId;
                    }
                    allItems['parentId'].set(parentId);
                    self.newMenuItem.parentId = parentId;
                    self.newMenuItem.treeId = treeId;
                }
            };
            return tree;
        };
        MountMenu.prototype.itemToNode = function (node) {
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
        MountMenu.prototype.initContent = function () {
            var _this = this;
            new Button_1.Button({
                content: '保存',
                icon: 'de-baocun',
                iconPre: 'dev',
                onClick: function () {
                    var allItems = _this.content.allItems;
                    _this.newMenuItem.nodeId = allItems['nodeId'].get();
                    _this.newMenuItem.captionExplain = allItems['captionExplain'].get();
                    _this.newMenuItem.varId = allItems['varId'].get();
                    _this.newMenuItem.iconName = allItems['iconName'].get();
                    var nodeItem = _this.newMenuItem, paraObj = {
                        type: 'tree',
                        insert: [nodeItem]
                    }, isOk = true;
                    if (tools.isEmpty(nodeItem.nodeId)) {
                        Modal_1.Modal.alert('菜单编码不能为空!');
                        isOk = false;
                    }
                    if (isOk && tools.isEmpty(nodeItem.captionExplain)) {
                        Modal_1.Modal.alert('菜单名称不能为空!');
                        isOk = false;
                    }
                    if (isOk && tools.isEmpty(nodeItem.parentId)) {
                        Modal_1.Modal.alert('父页面编码不能为空!');
                        isOk = false;
                    }
                    if (isOk) {
                        var selectedNode = _this.tree.getSelectedNodes()[0], nodeId = tools.isNotEmpty(selectedNode.content) ? selectedNode.content.nodeId : '', treeId = '';
                        if (tools.isEmpty(nodeId)) {
                            treeId = '?topmenu=1';
                        }
                        DVAjax_1.DVAjax.menuQueryAjax(nodeId, function (response) {
                            _this.success();
                            DVAjax_1.DVAjax.itemInterface(_this.itemId, function (res) {
                                if (res.errorCode === 0) {
                                    var body = d.create('<div class="inputModal"></div>'), loginUrl_1 = res.data.sso.loginUrl, nodeId_1 = res.data.nodeId, userInput_1 = new text_1.TextInput({
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
                            });
                        }, { type: 'POST', data: paraObj }, treeId);
                    }
                },
                container: d.query('.saveBtn', this.wrapper)
            });
            var content = new MenuDesignModule_1.MenuDesignModule({
                container: d.query('.content', this.wrapper)
            });
            content.isShow = true;
            content.allItems['itemId'].set(this.itemId);
            content.allItems['caption'].set(this.itemCaption);
            content.allItems['captionExplain'].set(this.itemCaption);
            this.content = content;
            var allItems = content.allItems, abledArr = ['iconName', 'captionExplain', 'varId', 'isLeaf', 'nodeId'];
            for (var key in allItems) {
                if (abledArr.indexOf(key) >= 0) {
                    allItems[key].disabled = false;
                }
                else {
                    allItems[key].disabled = true;
                }
            }
        };
        Object.defineProperty(MountMenu.prototype, "newMenuItem", {
            get: function () {
                if (!this._newMenuItem) {
                    this._newMenuItem = {
                        nodeId: '',
                        captionExplain: '',
                        treeId: '',
                        itemId: this.itemId,
                        parentId: '',
                        iconName: '',
                        varId: '',
                        appId: 'app_sanfu_retail',
                        isEnd: 0,
                        psuse: 0,
                        terminalFlag: 0,
                        seqNo: 1,
                        caption: this.itemCaption
                    };
                }
                return this._newMenuItem;
            },
            enumerable: true,
            configurable: true
        });
        // 变量弹窗
        MountMenu.prototype.createVarModal = function (ds) {
            var _this = this;
            var varIdModule = this.content.allItems['varId'], body = d.create('<div class="modal-body-container"></div>'), self = this;
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
                        var url = DV.CONF.ajaxUrl.varDesign + '?pageparams=' + queryStr;
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
        Object.defineProperty(MountMenu.prototype, "varAjaxPara", {
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
        MountMenu.prototype.handlerAjaxPara = function (ajaxPara) {
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
        MountMenu.prototype.createIconModal = function () {
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
                width: '600px',
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
                _this.content.allItems['iconName'].set(iconName);
                iconModal && (iconModal.isShow = false);
            });
        };
        MountMenu.prototype.getIconModalBody = function (searchStr) {
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
        return MountMenu;
    }(Component));
    exports.MountMenu = MountMenu;
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
