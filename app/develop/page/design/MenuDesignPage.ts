/// <amd-module name="MenuDesignPage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import {DropDownModule} from "../../module/dropDown/DropDownModule";
import {Button} from "global/components/general/button/Button";
import {Tree} from "global/components/navigation/tree/Tree";
import {MenuDesignModule} from "../../module/menuDesign/MenuDesignModule";
import config = DV.CONF;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {
    ElementTreeNode,
    IElementTreeNodePara
} from "../../../global/components/navigation/elementTreeBase/ElementTreeNode";
import {IMenuPara, Menu} from "../../../global/components/navigation/menu/Menu";
import {DVAjax} from "../../module/util/DVAjax";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {TextInputModule} from "../../module/textInput/TextInputModule";
import {TextInput} from "../../../global/components/form/text/text";

type EditingType = 'insert' | 'update' | 'delete' | 'none'

export class MenuDesignPage extends SPAPage {
    set title(str: string) {
        this._title = str;
    }

    get title() {
        return this._title;
    }

    protected wrapperInit() {
        return d.create(`<div class="menuDesign">
        <div class="topSelectItem">
            <div class="topDropDown">
                <div class="dropDownItems">
                    <div class="dropdown0"></div>
                    <div class="dropdown1"></div>
                    <div class="clear"></div>
                </div>
            </div>
            <div class="topButtons"></div>
            <div class="clear"></div>
        </div>
        <div class="bottomContent">
            <div class="treeMenus">
                
            </div>
            <div class="content">
                <div class="contentButtons"></div>
                <div class="designContent"></div>
            </div>
            <div class="clear"></div>
        </div>
        </div>`);
    }

    private menuDesignModule: obj;
    private ds: string[];

    init(para, data) {
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

        DVAjax.dataSourceQueryAjax((res) => {
            // 获取到焦点时弹出选择
            res.unshift('请选择');
            this.ds = res;
        });

        let allItems = this.menuDesignModule.designContent.allItems;
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

        allItems['itemId'].textInput.on('focus', (e) => {
            if (this.itemModal) {
                let obj = {
                    item_id: '',
                    item_type: '',
                    caption_sql: '',
                    data_source: ''
                };
                this.itemAjaxPara = obj;
                this.itemModal.isShow = true
            } else {
                this.createItemModal(this.ds);
            }
        });
        allItems['iconName'].textInput.on('focus', (e) => {
            if (this.iconModal) {
                this.iconModal.isShow = true
            } else {
                this.createIconModal();
            }
        });


        // 开启右键菜单
        setTimeout(() => {
            this.contextMenuEvent.on();
            this.mouseupEvent.on();
            this.scrollEvent.on();
        }, 100)
    }

    private varModal: Modal;
    private varTable: FastTable;

    // 变量弹窗
    private createVarModal(ds: string[]) {
        let varIdModule = this.menuDesignModule.designContent.allItems['varId'],
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
                    let url = config.ajaxUrl.varDesign + '?pageparams=' + queryStr;
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
            footer: {
                leftPanel:[{
                    content:'置空',
                    onClick:()=>{
                        varIdModule.set('');
                        self.varModal.isShow = false;
                    }
                }]
            },
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

    // item弹窗
    private itemModal: Modal;
    private itemTable: FastTable;

    private createItemModal(ds: string[]) {
        let itemIdModel = this.menuDesignModule.designContent.allItems['itemId'],
            captionModel = this.menuDesignModule.designContent.allItems['caption'],
            captionExplainModal = this.menuDesignModule.designContent.allItems['captionExplain'],
            self = this,
            body = d.create('<div class="modal-body-container"></div>');
        body.appendChild(d.create('<div class="conditions"></div>'));
        body.appendChild(d.create('<div class="table"></div>'));
        let titleArr = ['页面编码', '名称'],
            inputModules = [];
        titleArr.forEach((title) => {
            let inputModule = new TextInputModule({
                title: title,
                container: d.query('.conditions', body)
            });
            inputModules.push(inputModule);
            inputModule.textInput.on('blur', () => {
                handlerItemConditions();
            })
        });
        let itemType = new DropDownModule({
            title: '页面类型',
            container: d.query('.conditions', body),
            disabled: false,
            dropClassName: 'modalit',
            className: 'modalit',
            changeValue: () => {
                handlerItemConditions();
            }
        });
        itemType.dpData = ['请选择', '查询器', '目录', '自定义'];
        let dataSource = new DropDownModule({
            title: '数据源',
            container: d.query('.conditions', body),
            disabled: false,
            dropClassName: 'modalds',
            changeValue: () => {
                handlerItemConditions();
            }
        });
        dataSource.dpData = ds;

        this.itemTable = new FastTable({
            container: d.query('.table', body),
            cols: [[{name: 'itemId', title: 'ITEM ID'},
                {name: 'itemType', title: 'ITEM 类型'},
                {name: 'captionSql', title: '标题'},
                {name: 'dataSource', title: '数据源'},
                {name: 'keyField', title: '主键字段'},
                {name: 'pause', title: '是否启用'}
            ]],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1},"size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = config.ajaxUrl.itemQuery + '?pageparams=' + queryStr;
                    url = url + this.handlerAjaxPara(this.itemAjaxPara);
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

        function handlerItemConditions() {
            let item_id = inputModules[0].get().replace(/\s+/g, ""),
                caption_sql = inputModules[1].get().replace(/\s+/g, ""),
                datasource = tools.isNotEmpty(dataSource) ? dataSource.get().replace(/\s+/g, "") : '请选择',
                item_type = tools.isNotEmpty(itemType) ? itemType.get().replace(/\s+/g, "") : '请选择',
                itemTypeMap = {
                    "请选择": '',
                    "查询器": 'list',
                    "目录": 'menu',
                    "自定义": 'custom'
                };
            datasource = datasource === '请选择' ? '' : datasource;
            item_type = itemTypeMap[item_type];
            let ajaxPara = {
                item_id: item_id,
                item_type: item_type,
                caption_sql: caption_sql,
                datasource: datasource
            };
            self.itemAjaxPara = ajaxPara;
        }

        this.itemModal = new Modal({
            body: body,
            header: {
                title: '请选择页面编码'
            },
            width: '800px',
            footer: {},
            className: 'itemModal',
            onOk: () => {
                let selectedRow = this.itemTable.selectedRows;
                if (selectedRow.length <= 0) {
                    Modal.alert('请先选择页面编码');
                } else if (selectedRow.length > 1) {
                    Modal.alert('请只选择一个页面编码');
                } else {
                    let itemId = selectedRow[0].cells[0].text,
                        caption = selectedRow[0].cells[2].text;
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
    }

    private _itemAjaxPara: obj;
    set itemAjaxPara(obj) {
        this._itemAjaxPara = obj;
        this.itemTable && this.itemTable._clearAllSelectedCells();
        this.itemTable && this.itemTable.tableData.refresh();
    }

    get itemAjaxPara() {
        if (!this._itemAjaxPara) {
            this._itemAjaxPara = {
                item_id: '',
                item_type: '',
                data_source: '',
                caprion_sql: ''
            }
        }
        return this._itemAjaxPara;
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
            width: '800px',
            height:'500px',
            className: 'iconModal',
            footer:{
                rightPanel:[{
                    content:'置空',
                    onClick:()=>{
                        this.menuDesignModule.designContent.allItems['iconName'].set('');
                        iconModal.isShow = false;
                    }
                }]
            }
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
            this.menuDesignModule.designContent.allItems['iconName'].set(iconName);
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

    // 滚动时取消右键菜单
    private scrollEvent = (() => {
        let handler = (e) => {
            this.menuDesignModule.contextMenu.wrapper.classList.add('hideContextMenu');
        };
        return {
            on: () => d.on(d.query('.treeMenus', this.wrapper), 'scroll', handler),
            off: () => d.off(d.query('.treeMenus', this.wrapper), 'scroll', handler)
        }
    })();

    // 鼠标谈起取消右键菜单
    private mouseupEvent = (() => {
        let handler = (e) => {
            let contextMenu = this.menuDesignModule.contextMenu;
            if (!contextMenu.wrapper.contains(e.target)) {
                contextMenu.wrapper.classList.add('hideContextMenu');
            }
        };
        return {
            on: () => d.on(document, 'mouseup', handler),
            off: () => d.off(document, 'mouseup', handler)
        }
    })();

    // 右键菜单
    private contextMenuEvent = (() => {
        let handler = (e) => {
            e.preventDefault();
            if (this.isEditing !== 'none') {
                Modal.alert('请先保存当前修改');
                return;
            }
            let contextMenu = this.menuDesignModule.contextMenu;
            contextMenu.wrapper.classList.remove('hideContextMenu');
            let y = e.clientY;
            if (y + 100 > window.innerHeight){
                y = window.innerHeight - 100;
            }
            contextMenu.wrapper.style.left = e.clientX + 'px';
            contextMenu.wrapper.style.top = y + 'px';
        };

        return {
            on: () => d.on(d.query('.treeMenus', this.wrapper), 'contextmenu', '.tree-text-wrapper', handler),
            off: () => d.off(d.query('.treeMenus', this.wrapper), 'contextmenu', '.tree-text-wrapper', handler)
        }
    })();

    // 初始化右键菜单
    private initContextMenu() {
        let menuData: IMenuPara[] = [
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

        let menu = new Menu({
            children: menuData,
            expand: true,
            isHoverExpand: false,
            container: d.query('body')
        });
        menu.wrapper.classList.add('contextMenu');
        menu.onOpen = (node) => {
            this.showContent(true);
            let tree = this.menuDesignModule['tree'];
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
                this.addNewMenu(false);
            } else if (node.text === '新增子菜单') {
                // let title = {
                //     nodeId: "子菜单编码",
                //     itemId: "子菜单页面编码",
                //     caption: "子菜单标题",
                //     captionExplain: "子菜单标题说明",
                //     iconName: "子菜单图标",
                // };
                // this.setTitle(title);
                tree.getSelectedNodes()[0].expand = true;
                this.addNewMenu(true);
            } else {
                // 删除
                this.isEditing = 'delete';
                menu.wrapper.classList.add('hideContextMenu');
                Modal.confirm({
                    msg: '确认要删除该菜单吗？', title: '温馨提示', callback: (flag) => {
                        if (flag) {
                            this.changeNode(tree.getSelectedNodes()[0]);
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
    }

    // 设置label标题
    private setTitle(title: obj) {
        let designContent = this.menuDesignModule.designContent.allItems;
        for (let key in title) {
            designContent[key].title = title[key];
        }
    }

    // 右键菜单操作
    private addNewMenu(isLeaf: boolean) {
        let selectedNode = this.menuDesignModule.tree.getSelectedNodes()[0];
        if (selectedNode.isLeaf === true) {
            Modal.alert('叶子节点不能再添加子菜单');
            return;
        }
        this.isEditing = 'insert';
        let designObj = this.menuDesignModule.designContent.allItems;
        for (let key in designObj) {
            if (key === 'isLeaf') {
                designObj['isLeaf'].set(isLeaf);
            } else if (key === 'parentId') {
                designObj['parentId'].disabled = true;
                if (tools.isNotEmpty(selectedNode.content)) {
                    designObj['parentId'].set(selectedNode.content.itemId);
                } else {
                    designObj['parentId'].set('menuroot');
                }
            }else if (key === 'caption'){
                designObj['caption'].disabled = true;
            } else{
                designObj[key].set('');
                designObj[key].disabled = false;
            }
        }
        this.menuDesignModule.contextMenu.wrapper.classList.add('hideContextMenu');
    }

    // 初始化左侧树
    private initTreeMenus() {
        let tree = new Tree({
            container: this.wrapper.querySelector('.treeMenus'),
            isShowCheckBox: false,
            isVirtual: false,
            isLeaf: false,
            expand: true,
            icon: 'iconfont icon-folder',
            text: '菜单',
            ajax: (node) => {
                let url = config.ajaxUrl.menuQuery;
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
        // 选择某个节点
        tree.onSelect = function (node) {
            self.isEditing = 'none';
            self.menuDesignModule.contextMenu.wrapper.classList.add('hideContextMenu');
            let designContent = self.menuDesignModule.designContent;
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
            let newObj = self.handleNode(node);
            // 设置右侧内容
            for (const key in designContent.allItems) {
                if (key === 'isLeaf') {
                    designContent.allItems['isLeaf'].set(newObj['isLeaf']);
                }
                else {
                    designContent.allItems[key].set(newObj[key]);
                }
            }
        };
        return tree;
    }

    private showContent(isShow: boolean) {
        let designContent = this.menuDesignModule.designContent;
        designContent.isShow = isShow;
        this.btns.forEach((btn) => {
            btn.isDisabled = !isShow;
        })
    }

    // item转node
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


    // node 转 item
    private handleNode(node: ElementTreeNode) {
        let obj = {
            captionExplain: '',
            iconName: '',
            varId: ''
        };
        obj.captionExplain = node.text;
        obj.iconName = node.icon;
        let newObj = tools.obj.merge(obj, node.content);
        return newObj;
    }

    private btns: Button[];

    // 初始化按钮
    private initBottomButtons() {

        let self = this;
        let btnTitleArr = ['修改', '保存'];
        let classArr = ['de-xiugai', 'de-baocun'];
        this.btns = [];
        btnTitleArr.forEach((value, index) => {
            let tree = this.menuDesignModule.tree;
            let btn = new Button({
                container: this.wrapper.querySelector('.contentButtons'),
                content: value,
                icon: classArr[index],
                iconPre: 'dev',
                onClick: function () {
                    if (index === 0) {
                        if (tools.isEmpty(tree.getSelectedNodes())) {
                            Modal.alert('请先选择一个节点');
                            return;
                        }
                        if (self.isEditing !== 'none') {
                            Modal.alert('正在编辑，请稍候...');
                            return;
                        }
                    }
                    let currentSelectNode = tree.getSelectedNodes()[0];
                    switch (index) {
                        case 0 : {
                            if (self.isEditing === 'none') {
                                self.isEditing = 'update';
                            }
                        }
                            break;
                        case 1: {
                            if (self.isEditing !== 'none') {
                                self.changeNode(currentSelectNode);
                            }
                        }
                            break;
                        default:
                            break
                    }
                }
            });
            this.btns.push(btn);
        });

        new Button({
            container: this.wrapper.querySelector('.contentButtons'),
            content: '预览',
            className: 'preview-btn',
            onClick: function (event) {
                if (self.isEditing === 'insert' || self.isEditing === 'update') {
                    Modal.alert('请先保存当前修改');
                    return;
                }
                DVAjax.interface((res) => {
                    if (res.errorCode === 0) {
                        let body = d.create('<div class="inputModal"></div>'),
                            loginUrl = res.data.sso.loginUrl,
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
            }
        });
    }

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
    private handleItem() {
        let item = {
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
        let selectedNode = this.menuDesignModule.tree.getSelectedNodes()[0];
        let designObj = this.menuDesignModule.designContent.allItems;
        for (const key in item) {
            if (key === 'appId' || key === 'psuse' || key === 'terminalFlag' || key === 'seqNo') {
                continue;
            }
            if (key === 'isEnd') {
                item[key] = designObj['isLeaf'].get() === true ? 1 : 0;
            } else if (key === 'itemId') {
                if (tools.isNotEmpty(designObj['itemId'])) {
                    item[key] = designObj['itemId'].get();
                }
            } else if (key === 'treeId') {
                if (tools.isNotEmpty(selectedNode.content)) {
                    item['treeId'] = selectedNode.content.treeId;
                } else {
                    item['treeId'] = '';
                }
            } else {
                item[key] = designObj[key].get();
            }
        }
        return item;
    }

    // 初始化菜单内容显示
    private initDesignContent() {
        return new MenuDesignModule({
            menuDesignData: [],
            container: this.wrapper.querySelector('.designContent')
        });
    }

    // 当前编辑状态
    private _isEditing: EditingType;
    private set isEditing(isEditing) {
        this._isEditing = isEditing;
        let designObj = this.menuDesignModule.designContent.allItems,
            editingType = ['none', 'delete'];
        if (editingType.indexOf(this._isEditing) === -1) {
            for (let key in designObj) {
                if (key === 'iconName' || key === 'captionExplain' || key === 'varId' || key === 'isLeaf') {
                    designObj[key].disabled = false;
                } else {
                    designObj[key].disabled = true;
                }
            }
        } else {
            for (let key in designObj) {
                designObj[key].disabled = true;
            }
        }
    }

    private get isEditing() {
        if (this._isEditing === undefined) {
            this._isEditing = 'none';
        }
        return this._isEditing;
    }

    // 修改+删除+新增 节点
    private changeNode(selectedNode: ElementTreeNode) {
        let paraObj: obj = {};
        paraObj.type = 'tree';
        let nodeItem = this.handleItem();
        paraObj[this.isEditing] = [nodeItem];
        let nodeId = tools.isNotEmpty(selectedNode.content) ? selectedNode.content.nodeId : '',
            treeId = '';
        if (tools.isEmpty(nodeId)) {
            treeId = '?topmenu=1';
        }
        DVAjax.menuQueryAjax(nodeId, (response) => {
            if (response.errorCode === 0) {
                // 更新tree
                switch (this.isEditing) {
                    case 'update': {
                        let node = this.itemToNode(nodeItem);
                        selectedNode.text = nodeItem.captionExplain;
                        selectedNode.content = node.content;
                        selectedNode.icon = node.icon;
                        selectedNode.isLeaf = node.isLeaf;
                    }
                        break;
                    case 'insert': {
                        let node = this.itemToNode(nodeItem);
                        selectedNode.childrenAdd(node);
                        selectedNode.refresh();
                    }
                        break;
                    case 'delete': {
                        selectedNode.parent.refresh();
                        this.menuDesignModule['designContent'].isShow = false;
                    }
                        break;
                    default:
                        break;
                }
                this.isEditing = 'none';
                Modal.toast(response.msg);
            }
        }, {type: 'POST', data: paraObj}, treeId)
    }

    destroy() {
        super.destroy();
        this.contextMenuEvent.off();
        this.mouseupEvent.off();
        this.scrollEvent.off();
    }
}