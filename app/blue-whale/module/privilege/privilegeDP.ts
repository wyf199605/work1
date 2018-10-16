/// <amd-module name="PrivilegeDP"/>
import CONF = BW.CONF;
import d = G.d;
import tools = G.tools;
import {SearchInput} from "../../../global/components/form/searchInput/searchInput";
import TableModulePc = require( "../table/tableModulePc");
import {BwRule} from "../../common/rule/BwRule";
import {Button} from "../../../global/components/general/button/Button";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {ModalFooter} from "../../../global/components/feedback/modal/ModalFooter";
import {BasicTable} from "../../../global/components/table/basicTable";
import {ITreePara, Tree} from "../../../global/components/navigation/tree/Tree";

export class PrivilegeDP {

    protected switchType: string;//记录功能/属性/层级切换记录（其值分别为"FUNCTION","FIELD","LEVEL"）
    protected pageType: string;//记录当前为个性权限配置模块("DEFAULT")，还是缺省权限配置模块("PERSONAL")（因为在个性模块，功能/属性/层级必须得勾选节点，其数据才有值，而缺省模块则不然）


    /**
     * 【权限配置模块】
     * */
    protected url: string;  //权限配置模块通用url

    /**
     * 功能模块
     * */
    protected operateContentDom: HTMLElement;  //功能模块装载容器
    protected operType: number;
    protected operateListString = [{
        type: 'STANDARD',
        name: 'OPER_ID',
        title: 'OPER_NAME',
        typeName: '标准操作'
    },
        {type: 'ACTION', name: 'ELEMENT_ID', title: 'CAPTION', typeName: '数据操作'},
        {type: 'HANDLE', name: 'ELEMENT_ID', title: 'CAPTION', typeName: '全局操作'},
        {type: 'ASSOCIATE', name: 'ELEMENT_ID', title: 'CAPTION', typeName: '关联操作'},
        {type: 'OPERGROUP', name: 'OPER_GROUP_ID', title: 'OPER_GROUP_NAME', typeName: '操作组'}];
    protected operTypeArr: Array<number> = [1, 2, 3, 4, 0];
    protected lastOperTable: BasicTable;  //记录上次选择的操作表格


    /**
     * 【权限组模块】
     * */
    protected privGroupSearchDom: HTMLElement; //权限组搜索框装载容器
    protected privGroupSearchInput: SearchInput; //权限组搜索框组件

    /**
     *  配置部分的搜索框模块
     * */
    protected confSearchDom: HTMLElement;    //搜索框的总父容器
    protected fieldSearchDom: HTMLElement;   //属性搜索框装载容器
    protected fieldSearchInput: SearchInput; //属性搜索框
    protected functionSearchDom: HTMLElement;    //功能搜索框装载容器
    protected functionSearchInput: SearchInput;//功能搜索框

    /**
     *  配置模块的功能、属性、层级部分
     * */
    protected confContentDom: HTMLElement;//功能、属性、层级模块总父容器
    protected fieldContentDom: HTMLElement;   //属性模块内容装载容器
    protected levelContentDom: HTMLElement;   //层级模块内容装载容器
    protected localeContentDom: HTMLElement;    //地区模块内容装载容器
    protected goodContentDom: HTMLElement;  //商品模块内容装载容器
    protected localeVariateSelectBox: SelectBox; //地区模块变量的选项组
    protected localeConsValueDom: HTMLElement;  //地区模块定值的选项组装载容器
    protected goodVariateSelectBox: SelectBox; //商品模块变量的选项组
    protected goodConsValueDom: HTMLElement;  //商品模块定值的选项组装载容器
    protected localeVariateDom: HTMLElement; //地区模块变量装载容器
    protected goodVariateDom: HTMLElement; //商品模块变量装载容器
    protected levelModal: Modal;//层级模块的模态框，使其仅创建一次
    protected databaseData: any; //存储层级模块的数据库数据

    /**
     * 保存模块
     * */
    protected confSaveDom: HTMLElement;  //保存装载容器
    protected levelTreeType: string;   //记录的层级树类型,"LOCATE"或"GOOD"
    protected privGroupTable: BasicTable;//权限组表格
    protected privGroudId: string = '';//权限组id
    protected infoPlatSelected: Array<string> = [];   //信息平台id
    protected confSaveSelectBox: SelectBox;  //重置授权、增量授权、增量回收功能
    protected fieldTable: BasicTable;    //属性模块表格
    protected localeSelectd;   //地区模块选中数据，二维数组[层级][各层级选对应中的数据]  | 在getLevelData()中初始化
    protected goodSelectd; //商品模块选中数据，二维数组[层级][各层级选对应中的数据]  | 在getLevelData()中初始化
    protected localeInsType: string; //1为变量,2为定值
    protected goodInsType: string; //1为变量,2为定值
    protected localeLevelId: string = '1'; //存放勾选了地区的哪一层,默认为1(即层级序号)
    protected goodLevelId: string = '1';   //存放勾选了商品的哪一层,默认为1(即层级序号)
    protected localeCaption: string = '地区'; //默认为"地区"
    protected goodCaption: string = '分部';   //默认为"分部"
    protected resLevelData;//层级模块中返回的待增加数据
    protected delLevelData;//层级模块回显数据中被删除的部分
    protected localSelectBox: SelectBox;
    protected goodSelectBox: SelectBox;

    constructor(protected dom, url: string) {
        this.url = tools.isNotEmpty(url) ? url + '?deal_type=select' : CONF.ajaxUrl.rmprivsSelect;
    }


    /**
     * 构造权限组
     * */
    protected generatePrivGroup(container: HTMLElement) {
        if (tools.isEmpty(container)) {
            return;
        }
        this.privGroupSearchDom = d.create(`<div class="priv-group-search"></div>`);
        let privGroupContent = d.create(`<div class="priv-group-content"></div>`);

        container.appendChild(this.privGroupSearchDom);
        container.appendChild(privGroupContent);

        let self = this;
        this.privGroupSearchInput = new SearchInput({
            container: self.privGroupSearchDom,
            className: 'w',
            placeholder: '搜索...',
            ajax: {
                url: self.url,
                fun(url, data, recentValue, cb) {
                    self.getPrivGroupData(privGroupContent, recentValue);
                }
            }
        });
        this.getPrivGroupData(privGroupContent, '');
    }

    /**
     * 加载权限组表格数据
     * user_input  ：表示权限组对应搜索框中用户输入的字符串
     * */
    private getPrivGroupData(container: HTMLElement, user_input: string) {
        //获取权限组数据,并装载到指定容器中
        let tempTable = <HTMLTableElement>d.create('<table><tbody></tbody></table>'),
            self = this;
        container.innerHTML = '';
        container.appendChild(tempTable);
        let data = [];
        // Rule.ajax(this.url, {
        //     type: 'Post',
        //     defaultCallback: false,
        //     data: `[{ "select_type":"getprivgroupbyuserinput","user_input":"${user_input}"}]`,
        //     cache: true,
        //     success(response) {
        //         let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'];
        //         if (bodylist) {
        //             bodylist.forEach((d) => {
        //                 let obj = {
        //                     'PRIV_GROUP_ID': d['privGroupId'],
        //                     'PRIV_GROUP_NAME': d['privGroupName']
        //                 };
        //                 data.push(obj);
        //             });
        //         }
        //         let tableConf: TableModulePara = {
        //             cols: [{
        //                 title: "权限组",
        //                 name: "PRIV_GROUP_NAME"
        //             }, {
        //                 title: "权限编号",
        //                 name: "PRIV_GROUP_ID"
        //             }],
        //             multPage: 2,//2前台分页
        //             isSub: true,
        //             data: data
        //         };
        //         let scrollEl = d.query('.priv-group-content', self.dom);
        //         self.privGroupTable = new TableModulePc({
        //             tableEl: tempTable,
        //             scrollEl: scrollEl,
        //             // fixTop: 160
        //         }, tableConf).table;
        //         self.privGroupTable.on('rowSelect', (e: CustomEvent) => {
        //             let selectData = self.privGroupTable.rowSelectDataGet();
        //             if (selectData.length === 1) {
        //                 self.privGroudId = selectData[0]['PRIV_GROUP_ID'];
        //             } else {
        //                 self.privGroudId = '';
        //             }
        //             if (selectData.length > 1 && self.confSaveSelectBox) {
        //                 self.confSaveSelectBox.show();
        //             } else if (self.confSaveSelectBox) {
        //                 self.confSaveSelectBox.hide();
        //             }
        //             //点击权限组，将更新功能、属性、层级模块的数据
        //             if (self.switchType === 'FIELD') {
        //                 self.generateFieldContent();
        //             }
        //             else if (self.operateContentDom && self.lastOperTable && self.operType && self.switchType === 'FUNCTION') {
        //                 let container = d.query('.operate-conf', self.operateContentDom),
        //                     index = self.operTypeArr.indexOf(self.operType),
        //                     operate = self.operateListString[index];
        //                 self.getActionType(container, operate.type, operate.name, operate.title, self.operType);
        //             }
        //             else if (self.switchType === 'LEVEL' && self.levelContentDom) {
        //                 self.generateLGContent();
        //             }
        //         })
        //     }
        // });
        //
        BwRule.Ajax.fetch(this.url, {
            type: 'Post',
            defaultCallback: false,
            data: `[{ "select_type":"getprivgroupbyuserinput","user_input":"${user_input}"}]`,
            cache: true,
        }).then(({response}) => {
            let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'];
            if (bodylist) {
                bodylist.forEach((d) => {
                    let obj = {
                        'PRIV_GROUP_ID': d['privGroupId'],
                        'PRIV_GROUP_NAME': d['privGroupName']
                    };
                    data.push(obj);
                });
            }
            let tableConf: TableModulePara = {
                cols: [{
                    title: "权限组",
                    name: "PRIV_GROUP_NAME"
                }, {
                    title: "权限编号",
                    name: "PRIV_GROUP_ID"
                }],
                multPage: 2,//2前台分页
                isSub: true,
                data: data
            };
            let scrollEl = d.query('.priv-group-content', self.dom);
            self.privGroupTable = new TableModulePc({
                tableEl: tempTable,
                scrollEl: scrollEl,
                // fixTop: 160
            }, tableConf).table;
            self.privGroupTable.on('rowSelect', (e: CustomEvent) => {
                let selectData = self.privGroupTable.rowSelectDataGet();
                if (selectData.length === 1) {
                    self.privGroudId = selectData[0]['PRIV_GROUP_ID'];
                } else {
                    self.privGroudId = '';
                }
                if (selectData.length > 1 && self.confSaveSelectBox) {
                    self.confSaveSelectBox.show();
                } else if (self.confSaveSelectBox) {
                    self.confSaveSelectBox.hide();
                }
                //点击权限组，将更新功能、属性、层级模块的数据
                if (self.switchType === 'FIELD') {
                    self.generateFieldContent();
                }
                else if (self.operateContentDom && self.lastOperTable && self.operType && self.switchType === 'FUNCTION') {
                    let container = d.query('.operate-conf', self.operateContentDom),
                        index = self.operTypeArr.indexOf(self.operType),
                        operate = self.operateListString[index];
                    self.getActionType(container, operate.type, operate.name, operate.title, self.operType);
                }
                else if (self.switchType === 'LEVEL' && self.levelContentDom) {
                    self.generateLGContent();
                }
            })
        })
    }


    /**
     * 获取功能模块对应的操作数据（此处主要是为了点击权限组时调用PrivilegePersonal类中的该方法不报错）
     * */
    protected getActionType(container: HTMLElement, type: string, name, title, operType) {

    }

    /**
     *  重置授权、增量授权、增量回收功能，即多选权限组时出现的三个按钮
     * */
    protected generateConfSavaSelectBox(container: HTMLElement) {
        let tempDiv = d.create(`<div class="conf-save-content"></div>`);
        container.appendChild(tempDiv);
        this.confSaveSelectBox = new SelectBox({
            container: tempDiv,
            select: {
                multi: false
            },
            data: [{value: 'reset', text: '重置授权'}, {value: 'grant', text: '增量授权'}, {value: 'back', text: '增量收回'}]
        });
        this.confSaveSelectBox.hide();
    }

    /**
     * 构造属性搜索框
     * */
    protected generateFieldSearch() {
        let self = this;
        this.fieldSearchDom = d.create(`<div class="field-search"></div>`);
        this.confSearchDom.appendChild(this.fieldSearchDom);
        this.fieldSearchInput = new SearchInput({
            container: self.fieldSearchDom,
            className: 'w',
            placeholder: '搜索...',
            ajax: {
                url: self.url,
                fun(url, data, recentValue, cb) {
                    self.generateFieldContent(recentValue);
                }
            }
        });
    }

    /**
     * 构造属性内容
     * */
    protected generateFieldContent(user_input: string = '') {
        //获取权限组数据,并装载到指定容器中
        let tempTable = <HTMLTableElement>d.create('<table><tbody></tbody></table>'),
            data = [],
            self = this;
        if (!this.fieldContentDom) {
            return;
        }
        this.fieldContentDom.innerHTML = '';
        this.fieldContentDom.appendChild(tempTable);
        let ajaxData = [{
            select_type: 'getpropbyuserinput',
            user_input: user_input,
            node_id: self.infoPlatSelected.length === 1 ? self.infoPlatSelected[0] : '',
            priv_group_id: self.privGroudId
        }];
        // Rule.ajax(this.url, {
        //     type: 'Post',
        //     data: JSON.stringify(ajaxData),
        //     success(response) {
        //         console.log(response);
        //         let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'],
        //             checkedArr = [];
        //
        //         if (bodylist && bodylist.meta) {
        //             let index = bodylist.meta.indexOf('IS_CHECKED');
        //             bodylist.dataList[0] && bodylist.dataList.forEach((d, i) => {
        //                 let obj = {};
        //                 bodylist.meta[0] && bodylist.meta.forEach((m, j) => {
        //                     obj[m] = d[j];
        //                 });
        //                 data.push(obj);
        //                 if (index > -1 && d[index]) {
        //                     checkedArr.push(i);
        //                 }
        //             });
        //         }
        //
        //         //当前页面为个性权限配置页面，且未勾选信息平台节点时，或未勾选权限组时，表格数据为空
        //         if ((self.pageType === 'PERSONAL' && self.infoPlatSelected.length < 1) || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
        //             data = [];
        //         }
        //         let tableConf: TableModulePara = {
        //             cols: [{
        //                 title: "字段名",
        //                 name: "CAPTION"
        //             }, {
        //                 title: "字段编号",
        //                 name: "FIELD_NAME"
        //             }],
        //             multPage: 2,//2前台分页
        //             isSub: true,
        //             data: data
        //         };
        //
        //         self.fieldTable = new TableModulePc({
        //             tableEl: tempTable,
        //             scrollEl: self.fieldContentDom,
        //             fixTop: 190
        //         }, tableConf).table;
        //
        //         self.privEcho(response, tempTable);
        //         self.fieldTable.on('render', () => {
        //             self.privEcho(response, tempTable);
        //         });
        //     }
        // });
        BwRule.Ajax.fetch(this.url, {
            type: 'Post',
            data: JSON.stringify(ajaxData),
        }).then(({response}) => {
            console.log(response);
            let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'],
                checkedArr = [];

            if (bodylist && bodylist.meta) {
                let index = bodylist.meta.indexOf('IS_CHECKED');
                bodylist.dataList[0] && bodylist.dataList.forEach((d, i) => {
                    let obj = {};
                    bodylist.meta[0] && bodylist.meta.forEach((m, j) => {
                        obj[m] = d[j];
                    });
                    data.push(obj);
                    if (index > -1 && d[index]) {
                        checkedArr.push(i);
                    }
                });
            }

            //当前页面为个性权限配置页面，且未勾选信息平台节点时，或未勾选权限组时，表格数据为空
            if ((self.pageType === 'PERSONAL' && self.infoPlatSelected.length < 1) || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
                data = [];
            }
            let tableConf: TableModulePara = {
                cols: [{
                    title: "字段名",
                    name: "CAPTION"
                }, {
                    title: "字段编号",
                    name: "FIELD_NAME"
                }],
                multPage: 2,//2前台分页
                isSub: true,
                data: data
            };

            self.fieldTable = new TableModulePc({
                tableEl: tempTable,
                scrollEl: self.fieldContentDom,
                fixTop: 190
            }, tableConf).table;

            self.privEcho(response, tempTable);
            self.fieldTable.on('render', () => {
                self.privEcho(response, tempTable);
            });
        })
    }

    /**
     * 权限回显
     * @param response
     * @param tempTable
     */
    protected privEcho(response, tempTable) {
        let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'];
        if (bodylist.meta && bodylist.meta.indexOf('IS_CHECKED') > -1) {
            //00白，01蓝，11深蓝，10黄色，选择绿色
            response.data.forEach((obj, i) => {
                let tr = d.query(`[data-index="${i}"]`, tempTable);
                if (tr) {
                    tr.dataset.checked = 'true';
                    if (obj.IS_CONTROL === 1) {
                        tr.classList.add('bg-yellow');
                    }
                    //权限回显
                    if (obj.IS_CHECKED === 1) {
                        tr.dataset.checked = 'true';
                        tr.classList.add('bg-blue');
                    }
                }
            })
        }

    }

    /**
     * 构建层级模块(包括地区/商品部分)
     * */
    protected generateLGContent() {
        let btnWrapper = d.create(`<div class="conf-btn"></div>`),
            tableWrapper = d.create(`<div class="table-wrapper"></div>`),
            childWrapper = d.create(`<div class="child-table-wrapper"></div>`),
            tempTable = <HTMLTableElement>d.create('<table><tbody></tbody></table>'),
            tempBody,
            self = this,
            sp = new Spinner({
                el: <HTMLElement> self.levelContentDom,
                type: Spinner.SHOW_TYPE.cover,
            }),
            tableModule = null,
            childModule = null;
        tableWrapper.appendChild(tempTable);

        self.levelContentDom.innerHTML = '';
        self.levelContentDom.appendChild(tableWrapper);
        self.levelContentDom.appendChild(childWrapper);
        self.levelContentDom.appendChild(btnWrapper);

        sp.show();

        self.resLevelData = [];
        self.delLevelData = [];

        let obj = {
            select_type: 'getprivsbyprivgroupid',
            node_id: self.infoPlatSelected.length === 1 ? self.infoPlatSelected[0] : '',
            priv_group_id: self.privGroudId,
            privs_type: 'LEVEL_PRIVS',
        };
        //请求所有数据
        this.dataAjax([obj], (res) => {
            this.databaseData = res.data;
        });

        let mainAjaxData = obj;
        mainAjaxData['privs_sub_type'] = 2;
        //请求主表数据
        this.dataAjax([mainAjaxData], (response) => {
            console.log(response, '主表数据');
            sp.hide();
            let checkedArr = [];
            // if (data.dataList && data.meta) {
            //     let index = data.meta.indexOf('IS_CHECKED');
            //     data.dataList[0] && data.dataList.forEach((d, i) => {
            //         let obj = {};
            //         response.head.cols.forEach((col) => {
            //             let index = data.meta.indexOf(col.name);
            //             obj[col.name] = d[index] + '';
            //         });
            //         colsData.push(obj);
            //         if (index > -1 && d[index]) {
            //             checkedArr.push(i);
            //         }
            //     });
            // }
            //当前页面为个性权限配置页面，且未勾选信息平台节点时，或未勾选权限组时，表格数据为空
            // if ((self.pageType === 'PERSONAL' && self.infoPlatSelected.length < 1) || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
            //     data = [];
            // }
            tableModule = new TableModulePc({
                tableEl: tempTable,
                scrollEl: tableWrapper,
                fixTop: 200,
                tablePara: {
                    rowMenu: [{
                        title: '删除行',
                        callback: (btn: BT_Btn, targets: HTMLElement[], target: HTMLElement) => {
                            let index = d.closest(target, 'tr').dataset.index,
                                delData = tableModule.table.rowSelectDataGet()[0],
                                treeParam = delData['TREE_ID'],
                                nameParam = delData['TREE_NAME'];
                            tableModule.table.rowHide(index);

                            //除去数据库中的数据
                            this.databaseData.forEach(obj => {
                                if (obj['TREE_ID'] === treeParam && obj['TREE_NAME'] === nameParam) {
                                    if (!(this.delLevelData.indexOf(obj) > -1)) {
                                        this.delLevelData.push(obj);
                                    }
                                }
                            });
                            //清空子表
                            childWrapper.innerHTML = null;
                        }
                    }]
                },
            }, this.tableConf(this.resetCols(response.head.cols), response.data));

            //行点击生成子表
            tableModule.table.clickEvent.add('tbody tr', (e: any) => {
                this.subTable(tableModule.table.rowDataGet(d.closest(e.target, 'tr').dataset.index), childWrapper, childModule);
            });
            !tools.isEmpty(checkedArr[0]) && checkedArr.forEach((index) => {
                let tr = d.query(`[data-index="${index}"]`, tempTable);
                tr.classList.add('selected');
            });
        });

        if (!this.levelModal) {
            tempBody = d.create(`<div class="privilege-modal" style="height:450px;"></div>`);
            self.levelModal = new Modal({
                header: '权限定值配置',
                body: tempBody,
                isShow: false,
                width: '800px',
                className: 'privilege-modal',
                footer: {}
            });
            this.generateLGModalSwitch(tempBody);
        }

        //层级模块
        this.levelModal.onOk = () => {
            //层级数据添加
            let localeV = this.localeVariateSelectBox && this.localeVariateSelectBox.getSelect(),
                goodV = this.goodVariateSelectBox && this.goodVariateSelectBox.getSelect(),
                resData = [];

            let goodSelect = this.goodSelectBox && this.goodSelectBox.getSelect()[0],
                localSelect = this.localSelectBox && this.localSelectBox.getSelect()[0],
                localNodes = this.localTree && this.localTree.getCheckedNodes(),
                goodNodes = this.goodTree && this.goodTree.getCheckedNodes();

            let localeL = nodeData(localNodes, localSelect),
                goodL = nodeData(goodNodes, goodSelect);


            //地区变量、定值
            let caption = this.localeCaption, //层级
                type = '1';
            resData = resData.concat(this.restarData(localeV, localSelect.value, localSelect.levelNo, 'LOCALE', '地点层级', caption, type));
            resData = resData.concat(this.restarData(localeL, localSelect.value, localSelect.levelNo, 'LOCALE', '地点层级', caption, type));

            if (goodSelect) {
                //商品变量、定值
                caption = this.goodCaption;
                type = '1';
                resData = resData.concat(this.restarData(goodV, goodSelect.value, goodSelect.levelNo, 'GOOD', '商品层级', caption, type));
                resData = resData.concat(this.restarData(goodL, goodSelect.value, goodSelect.levelNo, 'GOOD', '商品层级', caption, type));
                console.log(goodL, '商品定值');
            }
            console.log(resData, '22');
            if (resData[0]) {
                Modal.confirm({
                    msg: '是否保存',
                    title: '提示',
                    btns: ['取消', '保存'],
                    callback: (flag: boolean) => {
                        if (flag) {
                            this.resLevelData = resData;
                            this.generateSave();
                            self.levelModal.isShow = false;
                        }
                    }
                });
            } else {
                Modal.alert('请选择一条数据');
            }

            //获取input参数
            function nodeData(data, select) {
                let newData = [], flag = false;
                data && data.forEach(tree => {
                    if (tree.deep === 0) {
                        newData = [];
                        tree.content.text = '当前层级所有' + select.text;
                        newData.push(tree.content);
                        flag = true;
                    }
                    if (!flag && tree.deep === select.levelNo) {
                        newData.push(tree.content);
                    }
                });
                return newData;
            }
        };
        new Button({
            content: '配置',
            container: btnWrapper,
            type: 'primary',
            onClick: () => {
                if (this.delLevelData[0]) {
                    Modal.confirm({
                        msg: '已执行删除操作，是否保存？',
                        title: '提示',
                        btns: ['取消', '保存'],
                        callback: (flag: boolean) => {
                            if (flag) {
                                this.generateSave();
                                self.levelModal.isShow = true;
                            }
                        }
                    });
                } else {
                    self.levelModal.isShow = true;
                }
            }
        });
    }

    /**
     * 构建保存模块
     * */
    private saveBtn: Button;

    generateSave() {
        if (!this.saveBtn) {
            this.saveBtn = new Button({
                content: '保存',
                type: 'primary',
                container: this.confSaveDom,
                onClick: () => {
                    this.saveBtnCb();
                }
            });
        } else {
            this.saveBtnCb();
        }
    }

    protected saveBtnCb() {

    }

    /**
     * 子表生成
     * @param trData
     * @param childWrapper
     * @param childModule
     */
    private subTable(trData, childWrapper, childModule) {
        this.delLevelData = [];
        let subAjaxData = {
            select_type: 'getprivsbyprivgroupid',
            node_id: this.infoPlatSelected.length === 1 ? this.infoPlatSelected[0] : '',
            priv_group_id: this.privGroudId,
            privs_type: 'LEVEL_PRIVS',
        };
        subAjaxData['privs_sub_type'] = 3;
        subAjaxData['privs_sub_type_param'] = trData['TREE_ID'];
        let sp = new Spinner({
            el: <HTMLElement> childWrapper,
            type: Spinner.SHOW_TYPE.cover,
        });
        sp.show();
        this.dataAjax([subAjaxData], (res) => {
            let tableEl = d.create('<table><tbody></tbody></table>');
            childWrapper.innerHTML = null;
            childWrapper.appendChild(tableEl);
            childModule = new TableModulePc({
                tableEl: <HTMLTableElement>tableEl,
                scrollEl: childWrapper,
                tablePara: {
                    rowMenu: [{
                        title: '删除选中行',
                        multi: true,
                        callback: (btn: BT_Btn, targets: HTMLElement[], target: HTMLElement) => {
                            // targets.forEach(obj => {
                            this.rowDelete(childModule, targets, trData);
                            // })
                        }
                    }]
                },
                // fixTop: 200,
            }, this.tableConf(this.resetCols(res.head.cols), res.data, true));
            sp.hide();
        })
    }

    private rowDelete(tableModule, targets, trData) {
        let arr = [];
        targets.forEach(obj => {
            let index = obj.dataset.index,
                delData = tableModule.table.rowDataGet(index);
            tableModule.table.rowHide(index);
            this.delLevelData.push((<any>Object).assign(delData, trData));
            arr.push(parseInt(index));
        });

        //重新渲染表格
        let tableData = tableModule.table.data.get(),
            newData = [];
        tableData.forEach((obj, i) => {
            if (!(arr.indexOf(i) > -1)) {
                newData.push(obj);
            }
        });
        tableModule.tableData.setNewData(newData);
        console.log(this.delLevelData, 'deldata')
    }

    /**
     * 表格配置
     * @param cols
     * @param data
     * @param multi
     * @returns {{cols: any, multPage: number, isSub: boolean, data: any, multiSelect: boolean}}
     */
    private tableConf(cols, data, multi = false) {
        return {
            cols: cols,
            multPage: 2,//2前台分页
            isSub: true,
            data: data,
            multiSelect: multi,
        };
    }

    private dataAjax(ajaxData, cb) {
        BwRule.Ajax.fetch(this.url, {
            type: 'post',
            data: JSON.stringify(ajaxData),
        }).then(({response}) => {
            typeof cb === 'function' && cb(response);
        });
        // Rule.ajax(this.url,{
        //     type : 'post',
        //     data : JSON.stringify(ajaxData),
        //     success : (response) => {
        //         typeof cb === 'function' && cb(response);
        //     }
        // })
    }

    /**
     * 表格数据构造
     * @param data
     * @param levelId
     * @param levelNo
     * @param treeId
     * @param treeName
     * @param caption
     * @param type
     */
    private restarData(data, levelId, levelNo, treeId, treeName, caption, type): obj[] {
        let resData = [];
        data && data.forEach((obj) => {
            let newObj = {
                LEVEL_ID: levelId,
                TREE_ID: treeId,
                LEVEL_NO: levelNo,
                TREE_NAME: treeName,
                CAPTION: caption,
                INS_TYPE: type,
                INS_VALUE: obj.value,
                INS_VALUE_NAME: obj.text
            };

            //不存在数据库中则添加到res
            if (!(this.databaseData.indexOf(newObj) > -1)) {
                resData.push(newObj);
            }
        });
        return resData;
    }


    /**
     * 获取地区/商品的模态框切换栏部分
     * */
    private generateLGModalSwitch(container: HTMLElement) {
        let lgSwitchDom = d.create(`<ul class="nav nav-tabs nav-tabs-line"></ul>`),
            lgContent = d.create(`<div class="lg-content"></div>`),
            localeLi = d.create(`<li class="active"><a><i class="iconfont icon-tongji"></i>地区</a></li>`),
            goodLi = d.create(`<li><a><i class="iconfont icon-function"></i>商品</a></li>`);

        lgSwitchDom.appendChild(localeLi);
        lgSwitchDom.appendChild(goodLi);
        container.appendChild(lgSwitchDom);
        container.appendChild(lgContent);

        //【地区/商品】切换，默认显示为地区模块
        this.levelTreeType = 'LOCALE';
        if (!this.localeContentDom) {
            this.localeContentDom = d.create(`<div class="locale-wrapper"></div>`);
            lgContent.appendChild(this.localeContentDom);
            this.generateLGModalContent(this.localeContentDom, 'LOCALE');
        } else {
            this.localeContentDom.style.display = 'block';
        }

        d.on(localeLi, 'click', () => {
            goodLi.classList.remove('active');
            localeLi.classList.add('active');
            if (this.goodContentDom) {
                this.goodContentDom.style.display = 'none';
            }
            this.localeContentDom.style.display = 'block';
            this.levelTreeType = 'LOCALE';
        });
        d.on(goodLi, 'click', () => {
            localeLi.classList.remove('active');
            goodLi.classList.add('active');
            if (!this.goodContentDom) {
                this.goodContentDom = d.create(`<div class="good-wrapper"></div>`);
                lgContent.appendChild(this.goodContentDom);
                this.generateLGModalContent(this.goodContentDom, 'GOOD');
            } else {
                this.goodContentDom.style.display = 'block';
            }
            this.localeContentDom.style.display = 'none';
            this.goodContentDom.style.display = 'block';
            this.levelTreeType = 'GOOD';
        });
    }

    /**
     * 获取地区/商品的模态框配置部分
     * */
    private generateLGModalContent(container: HTMLElement, type: string) {
        let menu = d.create(`<ul class="vc-menu"></ul>`),
            content = d.create(`<div class="vc-content"></div>`),
            variate = d.create(`<li class="li-select"><a>变量</a></li>`),
            consValue = d.create(`<li><a>定值</a></li>`);

        menu.appendChild(variate);
        menu.appendChild(consValue);
        container.appendChild(menu);
        container.appendChild(content);

        if (type === 'LOCALE') {
            this.localeVariateDom = d.create(`<div class="locale-variate"></div>`);
            this.getConsValueData(this.localeVariateDom, type, content, false);
            this.localeInsType = '1';
            d.on(variate, 'click', () => {
                consValue.classList.remove('li-select');
                variate.classList.add('li-select');
                this.localeVariateDom.style.display = 'inline-block';
                if (this.localeConsValueDom) {
                    this.localeConsValueDom.style.display = 'none';
                }
                this.localeInsType = '1';
            });

            this.localeConsValueDom = d.create(`<div class="locale-consvalue"></div>`);
            content.appendChild(this.localeConsValueDom);
            this.getConsValueData(this.localeConsValueDom, 'LOCALE');

            d.on(consValue, 'click', () => {
                variate.classList.remove('li-select');
                consValue.classList.add('li-select');
                this.localeVariateDom.style.display = 'none';
                this.localeConsValueDom.style.display = 'block';
                this.localeInsType = '0';
            });
        } else if (type === 'GOOD') {
            this.goodVariateDom = d.create(`<div class="good-variate"></div>`);
            this.getConsValueData(this.goodVariateDom, type, content, false);
            this.goodInsType = '1';
            d.on(variate, 'click', () => {
                consValue.classList.remove('li-select');
                variate.classList.add('li-select');
                this.goodVariateDom.style.display = 'block';
                if (this.goodConsValueDom) {
                    this.goodConsValueDom.style.display = 'none';
                }
                this.goodInsType = '1';
            });

            this.goodConsValueDom = d.create(`<div class="good-consvalue"></div>`);
            content.appendChild(this.goodConsValueDom);
            this.getConsValueData(this.goodConsValueDom, 'GOOD');

            d.on(consValue, 'click', () => {
                variate.classList.remove('li-select');
                consValue.classList.add('li-select');
                this.goodVariateDom.style.display = 'none';
                this.goodConsValueDom.style.display = 'block';
                this.goodInsType = '0';
            });
        }
    }

    /**
     * 获取地区/商品变量
     * */
    private ajax = new BwRule.Ajax();

    private getVariateData(container: HTMLElement, type: string) {
        let self = this,
            sp = new Spinner({
                el: <HTMLElement> container,
                type: Spinner.SHOW_TYPE.cover,
            });
        sp.show();
        // Rule.ajax(self.url, {
        //     type: 'Post',
        //     defaultCallback: false,
        //     data: ` [{"select_type":"getinsparaminfo"}]`,
        //     cache: true,
        //     success(response) {

        //         let data = response && response.body && response.body.bodyList && response.body.bodyList['0'];
        //         if (data && data.dataList) {
        //             let dataArr = [];
        //             data.dataList[0] && data.dataList.forEach((d) => {
        //                 if (d[0] && d[1]) {
        //                     dataArr.push({
        //                         value: d[0],
        //                         text: d[1]
        //                     });
        //                 }
        //             });
        //             sp.hide();
        //             if (type === 'LOCALE') {
        //                 self.localeVariateSelectBox = createBox(container, dataArr)
        //             } else if (type === 'GOOD') {
        //                 self.goodVariateSelectBox = createBox(container, dataArr)
        //             }
        //         }
        //         function createBox(dom, data){
        //             return new SelectBox({
        //                 container: dom,
        //                 select: {
        //                     multi: true,
        //                     callback: index => {
        //                     }
        //                 },
        //                 data: data
        //             });
        //         }
        //     }
        // });
        BwRule.Ajax.fetch(self.url, {
            type: 'Post',
            data: ` [{"select_type":"getinsparaminfo"}]`,
            cache: true,
        }).then(({response}) => {
            let data = response && response.body && response.body.bodyList && response.body.bodyList['0'];
            if (data && data.dataList) {
                let dataArr = [];
                data.dataList[0] && data.dataList.forEach((d) => {
                    if (d[0] && d[1]) {
                        dataArr.push({
                            value: d[0],
                            text: d[1]
                        });
                    }
                });
                sp.hide();
                if (type === 'LOCALE') {
                    self.localeVariateSelectBox = createBox(container, dataArr)
                } else if (type === 'GOOD') {
                    self.goodVariateSelectBox = createBox(container, dataArr)
                }
            }

            function createBox(dom, data) {
                return new SelectBox({
                    container: dom,
                    select: {
                        multi: true,
                        callback: index => {
                        }
                    },
                    data: data
                });
            }
        });
    }

    /**
     * 获取地区/商品定值
     * */
    private localTree: Tree;
    private goodTree: Tree;

    private getConsValueData(container: HTMLElement, type: string, content?: HTMLElement, defaults = true) {
        let levelSelectEl = d.create(`<div class="level-select"></div>`),
            levelWrapper = d.create(`<div><span>层级</span></div>`),
            consContent = d.create(`<div class="lg-conf-content"></div>`),
            tempDiv = d.create(`<div><span class="priv-conf">可配置权限</span></div>`),
            consWrapper = d.create(`<div data-level="1" class="level-conf select-box-small menu"></div>`);

        content && content.appendChild(container);

        levelSelectEl.appendChild(levelWrapper);
        consContent.appendChild(tempDiv);
        tempDiv.appendChild(consWrapper);


        container.appendChild(levelSelectEl);
        container.appendChild(consContent);
        if (defaults) {
            // this.createLi('当前层级所有','0', 0,consWrapper, type, 0);
            if (type === 'LOCALE') {
                this.localTree = this.createTree(consWrapper, type);
            } else {
                this.goodTree = this.createTree(consWrapper, type);
            }

        } else {
            this.getVariateData(consWrapper, type)
        }
        this.getLevelData(type, levelWrapper);
    }

    /**
     * 获取地区/商品层级树
     * */
    private getLevelData(type: string, levelSelectEl: HTMLElement) {
        let self = this;

        // Rule.ajax(this.url, {
        //     type: 'Post',
        //     data: ` [{"select_type":"getlevelinfo"}]`,
        //     cache: true,
        //     success(response) {
        //         let data = response.data,dataArr = [],index;
        //         let callback = (node) => {
        //             if(node.deep >= index + 1){
        //                 node.expand = false;
        //                 node.isLeaf = true;
        //             }else {
        //                 node.isLeaf = false;
        //             }
        //         };
        //         if (data[0]) {
        //             data.forEach((obj) => {
        //                 if (obj['TREE_ID'] === type) {
        //                     dataArr.push({
        //                         value: obj['LEVEL_ID'],
        //                         text: obj['CAPTION'],
        //                         levelNo : obj['LEVEL_NO']
        //                     });
        //                 }
        //             });
        //             let len = dataArr.length;
        //             if(type === 'GOOD'){
        //                 self.goodSelectBox = createSelectBox((i) => {
        //                     index = i;
        //                     self.goodTree.each(callback);
        //                 });
        //
        //             }else if(type === 'LOCALE'){
        //                 self.localSelectBox = createSelectBox((i) => {
        //                     index = i;
        //                     self.localTree.each(callback);
        //                 });
        //             }
        //
        //             //初始化地区/商品记录数据的二维数组
        //             if (type === 'LOCALE' && !self.localeSelectd) {
        //                 self.localeSelectd = [];
        //                 for (let i = 0; i <= len; i++) {
        //                     self.localeSelectd[i] = [];
        //                 }
        //             } else if (type === 'GOOD' && !self.goodSelectd) {
        //                 self.goodSelectd = [];
        //                 for (let i = 0; i <= len; i++) {
        //                     self.goodSelectd[i] = [];
        //                 }
        //             }
        //         }
        //         function createSelectBox(cb){
        //             return new SelectBox({
        //                 container: levelSelectEl,
        //                 select: {
        //                     multi: false,
        //                     callback: (index,item) => {
        //                         cb(index);
        //                     }
        //                 },
        //                 data: dataArr
        //             });
        //         }
        //     }
        // });

        BwRule.Ajax.fetch(this.url, {
            type: 'POST',
            data: [{select_type: "getlevelinfo"}],
            cache: true,
        }).then(({response}) => {
            let data = response.data, dataArr = [], index;
            let callback = (node) => {
                if (node.deep >= index + 1) {
                    node.expand = false;
                    node.isLeaf = true;
                } else {
                    node.isLeaf = false;
                }
            };
            if (data[0]) {
                data.forEach((obj) => {
                    if (obj['TREE_ID'] === type) {
                        dataArr.push({
                            value: obj['LEVEL_ID'],
                            text: obj['CAPTION'],
                            levelNo: obj['LEVEL_NO']
                        });
                    }
                });
                let len = dataArr.length;
                if (type === 'GOOD') {
                    self.goodSelectBox = createSelectBox((i) => {
                        index = i;
                        self.goodTree.each(callback);
                    });

                } else if (type === 'LOCALE') {
                    self.localSelectBox = createSelectBox((i) => {
                        index = i;
                        self.localTree.each(callback);
                    });
                }

                //初始化地区/商品记录数据的二维数组
                if (type === 'LOCALE' && !self.localeSelectd) {
                    self.localeSelectd = [];
                    for (let i = 0; i <= len; i++) {
                        self.localeSelectd[i] = [];
                    }
                } else if (type === 'GOOD' && !self.goodSelectd) {
                    self.goodSelectd = [];
                    for (let i = 0; i <= len; i++) {
                        self.goodSelectd[i] = [];
                    }
                }
            }

            function createSelectBox(cb) {
                return new SelectBox({
                    container: levelSelectEl,
                    select: {
                        multi: false,
                        callback: (index, item) => {
                            cb(index);
                        }
                    },
                    data: dataArr
                });
            }
        });
    }


    /**
     * 树children构造
     * @param response
     * @returns {Array}
     */
    private treeChild(response) {
        let data = [], meta = response.meta;
        response.data.forEach(obj => {
            data.push({
                text: obj[meta[1]],
                content: {
                    value: obj[meta[0]],
                    isLeaf: obj.IS_LEAF,
                    text: obj[meta[1]]
                },
                isAccordion: true,
                isLeaf: true,
            })
        });
        return data;
    }

    // name,value,level_no,confEl,type, leaf
    private createTree(container: HTMLElement, type) {
        let tree = new Tree({
            text: '当前层级所有',
            container: container,
            content: {
                value: '0',
                isLeaf: 0,
                text: '当前层级所有'
            },
            isAccordion: false,
            isVirtual: false,
            isLeaf: false,
            isShowCheckBox: true,
            // multiSelect : true,
            ajax: (node) => {
                return <Promise<ITreePara[]>>BwRule.Ajax.fetch(this.url, {
                    type: 'Post',
                    data: JSON.stringify([{
                        select_type: 'getinsvalueinfo',
                        tree_id: type,
                        level_no: node.deep + 1,
                        current_id: node.content.value
                    }]),
                    cache: true,
                }).then(({response}) => {
                    return this.treeChild(response);
                })
            }
        });
        tree.onExpand = (node, isExpand) => {
            if (!isExpand) {
                return;
            }
            let index = this.localSelectBox.get()[0] + 1;
            tree.each((tnode) => {
                if (tnode.deep >= index || tnode.content.isLeaf === 1) {
                    tnode.isLeaf = true;
                } else {
                    tnode.isLeaf = false;
                }
            })
        };
        return tree;
    }

    // /**
    //  * 获取定值部分地区配置内容
    //  * */
    // private getConsValueConfData(confEl: HTMLElement, type: string, level_no = 1, current_id = '') {
    //     let self = this;
    //     debugger;
    //     Rule.ajax(this.url, {
    //         type: 'Post',
    //         data: JSON.stringify([{
    //             select_type : 'getinsvalueinfo',
    //             tree_id : type,
    //             level_no : level_no,
    //             current_id : current_id
    //         }]),
    //         cache: true,
    //         success(response) {
    //             let data = response.data,meta = response.meta;
    //             data.forEach((node) => {
    //                 // self.createLi(node[meta[1]],node[meta[0]],level_no,confEl,type,node['IS_LEAF'])
    //             });
    //         }
    //     });
    // }
    // /**
    //  * 创建checkBox层级树
    //  * @param name
    //  * @param value
    //  * @param level_no
    //  * @param confEl
    //  * @param type
    //  * @param leaf
    //  */
    // private createLi(name,value,level_no,confEl,type, leaf){
    //     let liDom = d.createByHTML(`<li></li>`),
    //         checkArr = [],
    //         toggle = d.createByHTML(`<div class="toggle" title="${name}"></div>`),
    //         menu = d.createByHTML(`<ul class="menu" data-level="${level_no + 1}"></ul>`),
    //         checkbox = CheckBox.initCom(tools.getGuid, ''),
    //         spanbox = d.createByHTML(`<a>${name}</a>`),
    //         input = <HTMLInputElement>d.query('input', checkbox);
    //     toggle.appendChild(checkbox);
    //     toggle.appendChild(spanbox);
    //     liDom.appendChild(toggle);
    //     liDom.appendChild(menu);
    //     confEl.appendChild(liDom);
    //     input.value = value;
    //     checkArr.push(checkbox);
    //     d.on(spanbox, 'click', () => {
    //         if (!menu.hasChildNodes() && leaf !== 1) {
    //             this.getConsValueConfData(menu, type, level_no + 1, value);
    //         }
    //         if (toggle.classList.contains('toggle-select')) {
    //             toggle.classList.remove('toggle-select');
    //             menu.style.display = 'none';
    //         } else {
    //             menu.style.display = 'block';
    //             toggle.classList.add('toggle-select');
    //         }
    //         if (type === 'LOCALE' && parseInt(this.localeLevelId) <= level_no) {
    //             menu.style.display = 'none';
    //         } else if (type === 'GOOD' && parseInt(this.goodLevelId) <= level_no) {
    //             menu.style.display = 'none';
    //         }
    //     });
    //     /**
    //      * 全选反选
    //      * @param childDom
    //      * @param isSelect
    //      */
    //     function allToggleSelect(childDom, isSelect = true){
    //         let children = d.queryAll('input', childDom);
    //         children[0] && children.forEach((obj : HTMLInputElement) => {
    //             obj.checked = isSelect
    //         })
    //     }
    //     //全选功能，主要是分成地区、商品两大块， 往localeSelectd和goodSelectd数组中添加或删除数据(取决于是否选中)，添加和删除都要判断是否存在。
    //     d.on(checkbox, 'click', () => {
    //         if(value !== '0' && level_no !== 0){
    //             checked( menu, input);
    //         }
    //     });
    //
    //     function checked(childDom, inputs){
    //         if (inputs.checked) {
    //             allToggleSelect(childDom);
    //         } else{
    //             allToggleSelect( childDom, false);
    //         }
    //     }
    // }

    /**
     *
     * @param url
     * @param json
     * @param isAlert  是否弹出保存成功（为了解决单选权限组时del和sava两次请求弹出两次保存成功的问题）
     */
    protected saveResponse(url: string, json, isAlert = true) {
        BwRule.Ajax.fetch(url, {
            type: 'POST',
            data: json,
        }).then(() => {
            if (isAlert) {
                Modal.alert('保存成功!');
                this.judgeControl();
            }
        });

        // Rule.ajax(url, {
        //         type: 'Post',
        //         defaultCallback: false,
        //         data: JSON.stringify(json),
        //         success : (response) => {
        //             if (isAlert) {
        //                 Modal.alert('保存成功!');
        //                 this.judgeControl();
        //             }
        //
        //         }
        //     });
    }

    protected judgeControl() {

    }

    /**
     * 表格cols构造
     * @param cols
     * @returns {Array}
     */
    private resetCols(cols: obj[]) {
        let data = [];
        cols.forEach(col => {
            data.push({
                name: col.name,
                title: col.caption
            })
        });
        return data;
    }

    protected confUrl(action: string, url?: string) {
        if (tools.isNotEmpty(url)) {
            return url + '/' + action + '?deal_type=select';
        } else {
            return CONF.siteAppVerUrl + '/rmprivs/' + action;
        }
    }
}
