/// <amd-module name="MountMenuModal"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {DVAjax} from "../util/DVAjax";
import {Tree} from "../../../global/components/navigation/tree/Tree";
import {MenuDesignModule} from "../menuDesign/MenuDesignModule";
import {IElementTreeNodePara} from "../../../global/components/navigation/elementTreeBase/ElementTreeNode";
import d = G.d;
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {TextInputModule} from "../textInput/TextInputModule";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {DropDownModule} from "../dropDown/DropDownModule";
import {TextInput} from "../../../global/components/form/text/text";
import Component = G.Component;
import IComponentPara = G.IComponentPara;

export class MountMenuModal extends Modal {
    constructor(itemId?: string, itemCaption?: string) {
        let mountMenu = new MountMenu({
            itemId: itemId,
            itemCaption: itemCaption,
            success: () => {
                this.destroy();
            }
        });
        super({
            header: {
                title: '挂载菜单'
            },
            body: mountMenu.wrapper,
            isShow: true,
            width: '800px',
            height: '500px',
            className: 'mount-body',
        });
    }
}

interface IMountMenuPara extends IComponentPara {
    itemId?: string;
    itemCaption?: string;
    success?: () => void;
}

export class MountMenu extends Component {

    protected wrapperInit(): HTMLElement {
        return d.create("<div class='mountmenu'><div class='tree'></div><div class='content'><div class='saveBtn'></div></div></div>");
    }

    private tree: Tree;
    private content: MenuDesignModule;
    private itemId: string;
    private itemCaption: string;
    private ds: string[];
    private success:()=>void;
    constructor(para: IMountMenuPara) {
        super();
        this.itemCaption = para.itemCaption;
        this.itemId = para.itemId;
        this.initTreeMenus();
        this.initContent();
        this.success = para.success;
        DVAjax.dataSourceQueryAjax((res) => {
            // 获取到焦点时弹出选择
            res.unshift('请选择');
            this.ds = res;
        });
        let allItems = this.content.allItems;
        allItems['varId'].textInput.on('focus', (e) => {
            if (this.varModal) {
                let obj = {
                    var_id: '',
                    var_name: '',
                    var_sql: '',
                    datasource: ''
                };
                this.varAjaxPara = obj;
                this.varModal.isShow = true
            } else {
                this.createVarModal(this.ds);
            }
        });

        allItems['iconName'].textInput.on('focus', (e) => {
            if (this.iconModal) {
                this.iconModal.isShow = true
            } else {
                this.createIconModal();
            }
        });
    }

    // 初始化左侧树
    private initTreeMenus() {
        let tree = new Tree({
            container: d.query('.tree', this.wrapper),
            isShowCheckBox: false,
            isVirtual: false,
            isLeaf: false,
            expand: true,
            icon: 'iconfont icon-folder',
            text: '菜单',
            ajax: (node) => {
                let url = DV.CONF.ajaxUrl.menuQuery;
                if (node.deep !== 0) {
                    url = url + '/' + node.content.nodeId;
                }
                return DVAjax.Ajax.fetch(url).then(({response}) => {
                    let arr = [];
                    response.dataArr.forEach((treeObj) => {
                        let obj = this.itemToNode(treeObj);
                        arr.push(obj);
                    });
                    return arr;
                })
            }
        });
        let self = this;
        this.tree = tree;
        // 选择某个节点
        tree.onSelect = function (node) {
            let isLeaf = tools.isNotEmpty(node.content) ? node.content.isLeaf : false,
                allItems = self.content.allItems;
            if (isLeaf) {
                Modal.alert('不能挂载到叶子节点');
                return;
            } else {
                let parentId = 'menuroot',
                    treeId = '';
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
    }

    private itemToNode(node: obj): IElementTreeNodePara {
        let obj: IElementTreeNodePara = {
            text: '',
            content: {},
            icon: '',
            isLeaf: false
        };
        let contentObj = {};
        for (const key in node) {
            if (key === 'captionExplain') {
                obj.text = node['captionExplain'];
            } else if (key === 'iconName') {
                obj.icon = node['iconName'];
            } else if (key === 'isEnd') {
                obj.isLeaf = node['isEnd'] === 0 ? false : true;
                contentObj['isLeaf'] = node['isEnd'] === 0 ? false : true;
            }
            else {
                contentObj[key] = node[key];
            }
        }
        obj.content = contentObj;
        return obj;
    }

    private initContent() {
        new Button({
            content: '保存',
            icon: 'de-baocun',
            iconPre: 'dev',
            onClick: () => {
                let allItems = this.content.allItems;
                this.newMenuItem.nodeId = allItems['nodeId'].get();
                this.newMenuItem.captionExplain = allItems['captionExplain'].get();
                this.newMenuItem.varId = allItems['varId'].get();
                this.newMenuItem.iconName = allItems['iconName'].get();
                let nodeItem = this.newMenuItem,
                    paraObj: obj = {
                        type: 'tree',
                        insert: [nodeItem]
                    },
                    isOk = true;
                if (tools.isEmpty(nodeItem.nodeId)){
                    Modal.alert('菜单编码不能为空!');
                    isOk = false;
                }
                if (isOk && tools.isEmpty(nodeItem.captionExplain)){
                    Modal.alert('菜单名称不能为空!');
                    isOk = false;
                }
                if (isOk && tools.isEmpty(nodeItem.parentId)){
                    Modal.alert('父页面编码不能为空!');
                    isOk = false;
                }
                if (isOk){
                    let selectedNode = this.tree.getSelectedNodes()[0],
                        nodeId = tools.isNotEmpty(selectedNode.content) ? selectedNode.content.nodeId : '',
                        treeId = '';
                    if (tools.isEmpty(nodeId)) {
                        treeId = '?topmenu=1';
                    }
                    DVAjax.menuQueryAjax(nodeId, (response) => {
                        this.success();
                        DVAjax.itemInterface(this.itemId,(res) => {
                            if (res.errorCode === 0) {
                                let body = d.create('<div class="inputModal"></div>'),
                                    loginUrl = res.data.sso.loginUrl,
                                    nodeId = res.data.nodeId,
                                    userInput = new TextInput({
                                        container: body,
                                        className: 'userInput',
                                        placeholder: '请输入用户名'
                                    });
                                let m = new Modal({
                                    header: '请输入登录用户名',
                                    body: body,
                                    footer: {},
                                    isOnceDestroy: true,
                                    onOk: () => {
                                        let userId = userInput.get().replace(/\s+/g, '');
                                        if (tools.isEmpty(userId)) {
                                            Modal.alert('登录用户名不能为空!');
                                        } else {
                                            let url = tools.url.addObj(loginUrl, {
                                                userid: userId.toUpperCase(),
                                                forwardurl: 'commonui/pageroute?page=static%2Fmain'
                                            });
                                            url = url + `#page=/ui/select/${nodeId}`;
                                            window.open(url);
                                            m.destroy();
                                        }
                                    },
                                    onCancel: () => {
                                        m.destroy();
                                    }
                                })
                            }
                        })
                    }, {type: 'POST', data: paraObj}, treeId);
                }
            },
            container: d.query('.saveBtn', this.wrapper)
        });
        let content = new MenuDesignModule({
            container: d.query('.content', this.wrapper)
        });
        content.isShow = true;
        content.allItems['itemId'].set(this.itemId);
        content.allItems['caption'].set(this.itemCaption);
        content.allItems['captionExplain'].set(this.itemCaption);
        this.content = content;
        let allItems = content.allItems,
            abledArr = ['iconName', 'captionExplain', 'varId', 'isLeaf', 'nodeId'];
        for (let key in allItems) {
            if (abledArr.indexOf(key) >= 0) {
                allItems[key].disabled = false;
            } else {
                allItems[key].disabled = true;
            }
        }
    }

    private _newMenuItem:obj;
    get newMenuItem() {
        if (!this._newMenuItem){
            this._newMenuItem = {
                nodeId: '',
                captionExplain: '',
                treeId: '',
                itemId:this.itemId,
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
    }

    private varModal: Modal;
    private varTable: FastTable;

    // 变量弹窗
    private createVarModal(ds: string[]) {
        let varIdModule = this.content.allItems['varId'],
            body = d.create('<div class="modal-body-container"></div>'),
            self = this;
        body.appendChild(d.create('<div class="conditions"></div>'));
        body.appendChild(d.create('<div class="table"></div>'));
        let titleArr = ['变量ID', '变量名称', '变量SQL'],
            inputModules = [];
        titleArr.forEach((title) => {
            let inputModule = new TextInputModule({
                title: title,
                container: d.query('.conditions', body)
            });
            inputModules.push(inputModule);
            inputModule.textInput.on('blur', () => {
                handlerVarConditions();
            })
        });
        let dataSource = new DropDownModule({
            title: '数据源',
            container: d.query('.conditions', body),
            disabled: false,
            dropClassName: 'modalds',
            changeValue: () => {
                handlerVarConditions();
            }
        });
        dataSource.dpData = ds;

        function handlerVarConditions() {
            let var_id = inputModules[0].get().replace(/\s+/g, ""),
                var_name = inputModules[1].get().replace(/\s+/g, ""),
                var_sql = inputModules[2].get().replace(/\s+/g, ""),
                datasource = dataSource.get().replace(/\s+/g, "");
            datasource = datasource === '请选择' ? '' : datasource;
            let ajaxPara = {
                var_id: var_id,
                var_name: var_name,
                var_sql: var_sql,
                data_source: datasource
            };
            self.varAjaxPara = ajaxPara;
        }

        this.varTable = new FastTable({
            container: d.query('.table', body),
            cols: [[{name: 'varId', title: '变量ID'},
                {name: 'dataSource', title: '数据源'},
                {name: 'varName', title: '变量名称'},
                {name: 'varSql', title: '变量SQL'}]],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = DV.CONF.ajaxUrl.varDesign + '?pageparams=' + queryStr;
                    url = url + this.handlerAjaxPara(this.varAjaxPara);
                    return DVAjax.Ajax.fetch(url).then(({response}) => {
                        let data = response.dataArr,
                            total = 0;
                        tools.isNotEmptyArray(data) && (total = response.head.total);
                        return {data: data, total: total};
                    })
                },
                auto: true,
                once: false
            },
            page: {
                size: 20,
                options: [20, 50]
            }
        });
        this.varModal = new Modal({
            body: body,
            header: {
                title: '请选择变量'
            },
            width: '800px',
            footer: {},
            className: 'varModal',
            onOk: () => {
                let selectedRow = this.varTable.selectedRows;
                if (selectedRow.length <= 0) {
                    Modal.alert('请先选择变量');
                } else if (selectedRow.length > 1) {
                    Modal.alert('请只选择一个变量');
                } else {
                    let varId = selectedRow[0].cells[0].text;
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
    }

    private _varAjaxPara: obj;
    set varAjaxPara(obj) {
        this._varAjaxPara = obj;
        this.varTable && this.varTable._clearAllSelectedCells();
        this.varTable && this.varTable.tableData.refresh();
    }

    get varAjaxPara() {
        if (!this._varAjaxPara) {
            this._varAjaxPara = {
                var_id: '',
                var_name: '',
                data_source: '',
                var_sql: ''
            }
        }
        return this._varAjaxPara;
    }

    private handlerAjaxPara(ajaxPara): string {
        let str = '&fuzzyparams={',
            paraStr = '';
        for (let key in ajaxPara) {
            if (tools.isNotEmpty(ajaxPara[key])) {
                paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(ajaxPara[key]) ? '"' + ajaxPara[key] + '"' : '""') + ',';
            }
        }
        if (tools.isNotEmpty(paraStr)) {
            paraStr = paraStr.slice(0, paraStr.length - 1);
            str = str + paraStr + '}';
            return encodeURI(str);
        } else {
            return '';
        }
    }

    // 图标弹窗
    private iconModal: Modal;
    private createIconModal() {
        let body = d.create('<div class="modal-body-container"></div>');
        body.appendChild(d.create('<div class="conditions"></div>'));
        let iconInputModal = new TextInputModule({
            title: '搜索图标',
            container: d.query('.conditions', body)
        });
        let iconText = '';
        iconInputModal.textInput.on('input', () => {
            let text = iconInputModal.get().replace(/\s+/g, '');
            if (text === iconText) {
                return;
            }
            iconText = text;
            d.remove(d.query('.iconBody', body));
            body.appendChild(this.getIconModalBody(text));
        });
        body.appendChild(this.getIconModalBody());
        let iconModal = new Modal({
            body: body,
            header: '图标选择',
            width: '600px',
            height: '500px',
            className: 'iconModal',
        });
        this.iconModal = iconModal;
        d.on(body, 'mousedown', '.icon-item', (e) => {
            let iconEle = d.closest(e.target as HTMLElement, '.icon-item');
            iconEle.classList.add('active');
        });
        d.on(body, 'mouseup', '.icon-item', (e) => {
            let iconEle = d.closest(e.target as HTMLElement, '.icon-item'),
                iconName = iconEle.dataset.icon;
            iconEle.classList.remove('active');
            this.content.allItems['iconName'].set(iconName);
            iconModal && (iconModal.isShow = false);
        })
    }

    private getIconModalBody(searchStr?: string): HTMLElement {
        let icons = ["iconfont icon-wenben", "iconfont icon-house", "iconfont icon-shanchu", "iconfont icon-shuaxin1", "iconfont icon-diannao", "iconfont icon-cuowu1", "iconfont icon-jiantou", "iconfont icon-calendar", "iconfont icon-weixin", "iconfont icon-suo4", "iconfont icon-zhuce1", "iconfont icon-ordinaryprint", "iconfont icon-label", "iconfont icon-yidong1", "iconfont icon-close", "iconfont icon-tishi", "iconfont icon-msnui-logo-chrome", "iconfont icon-jiahao", "iconfont icon-sousuo", "iconfont icon-wushuju", "iconfont icon-wangluo", "iconfont icon-tongji", "iconfont icon-shop1", "iconfont icon-caiwuguanli", "iconfont icon-shuaxin2", "iconfont icon-xiao41", "iconfont icon-shuaxin", "iconfont icon-favour", "iconfont icon-fangzi", "iconfont icon-xiaoxi", "iconfont icon-users", "iconfont icon-statistic", "iconfont icon-mp-institution", "iconfont icon-shou", "iconfont icon-gesture", "iconfont icon-denglu", "iconfont icon-suoding", "iconfont icon-jingyingfenxi", "iconfont icon-zhexiantu", "iconfont icon-zhuzhuangtu", "iconfont icon-device-mb", "iconfont icon-youhuiquanguanli", "iconfont icon-fasongyoujian", "iconfont icon-xinzeng", "iconfont icon-device-pc", "iconfont icon-bangong0", "iconfont icon-icon07", "iconfont icon-arrow-right-2", "iconfont icon-num", "iconfont icon-7", "iconfont icon-fenxi", "iconfont icon-iconset0254", "iconfont icon-shoujianxiang", "iconfont icon-xiaoshou", "iconfont icon-youhuiquan", "iconfont icon-jiantouarrow477", "iconfont icon-jiantouarrow484", "iconfont icon-fuzhi", "iconfont icon-gugeliulanqi", "iconfont icon-light", "iconfont icon-wendang", "iconfont icon-asc", "iconfont icon-avatar", "iconfont icon-bingzhuangtu", "iconfont icon-ri", "iconfont icon-iconfont icon-supplier", "iconfont icon-ai-copy", "iconfont icon-baocun", "iconfont icon-zuzhiguanli", "iconfont icon-sort-small-copy", "iconfont icon-sort-small-copy1", "iconfont icon-shaixuan", "iconfont icon-arrow-down", "iconfont icon-quyu1", "iconfont icon-update-text", "iconfont icon-pdf", "iconfont icon-tongxunlu1", "iconfont icon-shejiqijiaohuanxinglie", "iconfont icon-gongyongwushuju", "iconfont icon-gongyongzanwushuju", "iconfont icon-user", "iconfont icon-daochu", "iconfont icon-maximize", "iconfont icon-jiahao1", "iconfont icon-qunzu", "iconfont icon-meiri", "iconfont icon-fuzhicopy20", "iconfont icon-qiandai", "iconfont icon-copy", "iconfont icon-excel", "iconfont icon-xinxi", "iconfont icon-fenxi11", "iconfont icon-cash", "iconfont icon-wenjian", "iconfont icon-xinzeng2", "iconfont icon-ai36", "iconfont icon-qian", "iconfont icon-wenjianjia", "iconfont icon-nodata", "iconfont icon-jianhao", "iconfont icon-006pinglunhuifu", "iconfont icon-023tuceng", "iconfont icon-shengji", "iconfont icon-daochu2", "iconfont icon-wuwangluozhuangtai", "iconfont icon-add", "iconfont icon-weihu", "iconfont icon-layers", "iconfont icon-buoumaotubiao12", "iconfont icon-buoumaotubiao25", "iconfont icon-shouye-copy", "iconfont icon-xitongcuowu", "iconfont icon-tubiao121", "iconfont icon-shuxie", "iconfont icon-shangpin", "iconfont icon-jisuanqi", "iconfont icon-shuben", "iconfont icon-zhiwen", "iconfont icon-expanse", "iconfont icon-saleman", "iconfont icon-renyuan", "iconfont icon-woshimaijia", "iconfont icon-e66f", "iconfont icon-dian", "iconfont icon-download", "iconfont icon-14", "iconfont icon-gupiao2", "iconfont icon-billing", "iconfont icon-jingyu-OK", "iconfont icon-gongnengguanli", "iconfont icon-card", "iconfont icon-ji", "iconfont icon-iconfont icon-yuanzhuti", "iconfont icon-fenxi1", "iconfont icon-iconfont icon-test", "iconfont icon-cancel", "iconfont icon-44", "iconfont icon-67", "iconfont icon-80", "iconfont icon-icon_folder", "iconfont icon-fukuan", "iconfont icon-paixu", "iconfont icon-pin4", "iconfont icon-pinlei", "iconfont icon-arrow-left-2", "iconfont icon-xiugai", "iconfont icon-csv1", "iconfont icon-account", "iconfont icon-biaoge", "iconfont icon-folder", "iconfont icon-danhangchenlie", "iconfont icon-dagou", "iconfont icon-zi", "iconfont icon-history-record", "iconfont icon-renyuanguanli", "iconfont icon-desc", "iconfont icon-chaibaoguoqujian-xianxing", "iconfont icon-diqu", "iconfont icon-pinleiguanli", "iconfont icon-arrow-right", "iconfont icon-guanliyuan", "iconfont icon-quyu", "iconfont icon-nian", "iconfont icon-annex", "iconfont icon-diyu", "iconfont icon-huojiachenlie", "iconfont icon-jujueweituo", "iconfont icon-png", "iconfont icon-yue", "iconfont icon-gongyingshangguanli", "iconfont icon-ABC", "iconfont icon-wenjianshangchuan", "iconfont icon-shizhong", "iconfont icon-quxiao", "iconfont icon-zhexiantu1", "iconfont icon-message", "iconfont icon-caiwuguanli1", "iconfont icon-jianhao1", "iconfont icon-dingdan", "iconfont icon-call", "iconfont icon-shop", "iconfont icon-two-arrow-down", "iconfont icon-liulanqi-IE", "iconfont icon-function", "    iconfont icon-pie-chart_icon", "iconfont icon-richscan_icon", "iconfont icon-cross-circle", "iconfont icon-fenxiangfasong", "iconfont icon-xiazai", "iconfont icon-arrow-left", "iconfont icon-magnifier", "iconfont icon-arrow-up", "iconfont icon-shangdian", "iconfont icon-dagou1", "iconfont icon-xuanze", "iconfont icon-fl-renyuan", "iconfont icon-wangyuanjing", "iconfont icon-fl-shuju", "iconfont icon-mendianjingyinghuizong", "iconfont icon-duibi", "iconfont icon-tianqiyubao", "iconfont icon-fasong", "iconfont icon-word", "iconfont icon-yidong", "iconfont icon-zhankaishousuo-zhankai", "iconfont icon-zhankaishousuo-shousuo", "iconfont icon-check-circle", "iconfont icon-woshou", "iconfont icon-drxx63", "iconfont icon-huatong", "iconfont icon-left-element", "iconfont icon-taiyang", "iconfont icon-caogao", "iconfont icon-zhengque", "iconfont icon-dangan", "iconfont icon-tubiaozhizuomoban", "iconfont icon-yunshu", "iconfont icon-xiaoyuan-", "iconfont icon-youjianjieshou", "iconfont icon--", "iconfont icon-chazhao", "iconfont icon--wenjianjia", "iconfont icon-diannao1", "iconfont icon-14-copy", "iconfont icon-023tuceng-copy", "iconfont icon-023tuceng-copy-copy", "iconfont icon-ai36-copy", "iconfont icon-ai36-copy-copy", "iconfont icon-pie-chart_icon_blue-copy", "iconfont icon-pie-chart_icon_blue-red-copy"],
            showIconArr = icons;
        if (tools.isNotEmpty(searchStr)) {
            showIconArr = icons.filter((icon) => {
                return icon.indexOf(searchStr) !== -1;
            })
        }
        let iconBody = d.create(`<div class="iconBody"></div>`);
        showIconArr.forEach((icon) => {
            iconBody.appendChild(d.create(`
            <div class="icon-item" data-icon="${icon}">
            <i class="iconfont ${icon}"></i>
            <span>${icon}</span>
</div>
            `));
        });
        return iconBody;
    }
}