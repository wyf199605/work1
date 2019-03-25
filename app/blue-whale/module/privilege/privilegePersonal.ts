/// <amd-module name="PrivilegePersonal"/>
import CONF = BW.CONF;
import d = G.d;
import tools = G.tools;
import {PrivilegeDP} from "./privilegeDP";
import TableModulePc = require("../table/tableModulePc");
import {BasicTable} from "../../../global/components/table/basicTable";
import {SearchInput} from "../../../global/components/form/searchInput/searchInput";
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {ITreePara, Tree} from "../../../global/components/navigation/tree/Tree";
import {BwRule} from "../../common/rule/BwRule";

export class PrivilegePersonal extends PrivilegeDP {

    /**
     * 功能模块
     * */
    private standardTable: BasicTable;
    private actiondTable: BasicTable;
    private handleTable: BasicTable;
    private associateTable: BasicTable;
    private opergroupTable: BasicTable;
    private standardLi: HTMLElement;
    private lastLi: HTMLElement;
    private functionLi: HTMLElement;
    private lastSwitchLi: HTMLElement;

    /**
     * 信息平台模块
     * */
    private infoPFSearchInput: SearchInput;    //信息平台搜索组件
    private infoPFSearchDom: HTMLElement;  //信息平台搜索组 件装载容器
    private urls;
    private tree: Tree;
    private controllUrl:string;
    constructor(protected dom,url?:string,controllUrl?:string) {
        super(dom,url);
        this.controllUrl = controllUrl;
        this.pageType = 'PERSONAL';
        this.urls = [
            this.confUrl('function/reset',url),
            this.confUrl('function/save',url),
            this.confUrl('function/del',url),
            this.confUrl('col/reset',url),
            this.confUrl('col/save',url),
            this.confUrl('col/del',url),
            this.confUrl('level/reset',url),
            this.confUrl('level/save',url),
            this.confUrl('level/del',url)
        ];
        this.generate();

    }

    private generate() {
        let infoPlatEl = d.create(`<div class="info-platform"></div>`),
            privGroupEl = d.create('<div class="priv-group"></div>'),
            confWrapper = d.create(`<div class="priv-wrapper"></div>`),
            div = d.create(`<div class="control-area"></div>`),
            tip = d.create(`<div class="priv-tip">请先选中一个节点</div>`);
        this.dom.appendChild(infoPlatEl);
        this.dom.appendChild(div);
        div.appendChild(tip);
        div.appendChild(privGroupEl);
        div.appendChild(confWrapper);

        this.generateInfoPlatform(infoPlatEl);
        this.generatePrivGroup(privGroupEl);

        this.confSearchDom = d.create(`<div class="conf-search"></div>`);
        this.confSaveDom = d.create(`<div class="conf-save"></div>`);
        this.confContentDom = d.create(`<div class="conf-content"></div>`);
        confWrapper.appendChild(this.confSearchDom);
        confWrapper.appendChild(this.confSaveDom);
        confWrapper.appendChild(this.confContentDom);

        //构建保存模块
        this.generateSave();
        //默认构建功能搜索框
        this.generateFunctionSearch();
        //构建属性、层级切换菜单模块
        this.generatePLSwitchMenu();
    }

    /**
     * 构造功能/属性/层级菜单
     * */
    private generatePLSwitchMenu() {
        let navContent = d.create('<div class="nav-content"></div>'),
            plSwitchDom = d.create(`<div class="switch-menu"></div>`),
            plContent = d.create(`<div class="pl-content"></div>`),
            fieldLi = d.create(`<li><i class="iconfont icon-tongji"></i>属性</li>`),
            levelLi = d.create(`<li><i class="iconfont icon-function"></i>层级</li>`);

        this.functionLi = d.create(`<li class="li-select"><i class="iconfont icon-tongji"></i>功能</li>`);
        plSwitchDom.appendChild(this.functionLi);
        plSwitchDom.appendChild(fieldLi);
        plSwitchDom.appendChild(levelLi);
        navContent.appendChild(plSwitchDom);
        this.confContentDom.appendChild(navContent);
        this.confContentDom.appendChild(plContent);
        this.generateConfSavaSelectBox(navContent);

        //【功能/属性/层级】切换，默认显示为功能模块
        if (!this.operateContentDom) {
            this.operateContentDom = d.create(`<div class="operate-content"></div>`);
            plContent.appendChild(this.operateContentDom);
            this.generateOperateContent();
            this.lastSwitchLi = this.functionLi;
            this.switchType = 'FUNCTION';
        }

        d.on(this.functionLi, 'click', () => {
            levelLi.classList.remove('li-select');
            fieldLi.classList.remove('li-select');
            this.functionLi.classList.add('li-select');
            if (this.levelContentDom) {
                this.levelContentDom.style.display = 'none';
            }
            this.operateContentDom.style.display = 'block';
            if (this.fieldContentDom) {
                this.fieldContentDom.style.display = 'none';
                this.fieldSearchDom.style.display = 'none';
            }
            this.functionSearchDom.style.display = 'block';
            this.switchType = 'FUNCTION';
            this.lastSwitchLi = this.functionLi;


            if (this.operateContentDom && this.lastOperTable && this.operType) {
                let container = d.query('.operate-conf', this.operateContentDom),
                    index = this.operTypeArr.indexOf(this.operType),
                    operate = this.operateListString[index];
                if (container) {
                    this.getActionType(container, operate.type, operate.name, operate.title, this.operType);
                }
            }
        });

        d.on(fieldLi, 'click', () => {
            levelLi.classList.remove('li-select');
            this.functionLi.classList.remove('li-select');
            fieldLi.classList.add('li-select');
            if (!this.fieldContentDom) {
                this.fieldContentDom = d.create(`<div class="field-content"></div>`);
                plContent.appendChild(this.fieldContentDom);
            }
            this.generateFieldContent();
            if (this.levelContentDom) {
                this.levelContentDom.style.display = 'none';
            }
            this.operateContentDom.style.display = 'none';
            this.fieldContentDom.style.display = 'block';
            if (!this.fieldSearchDom) {
                this.generateFieldSearch();
            }
            this.functionSearchDom.style.display = 'none';
            this.fieldSearchDom.style.display = 'block';
            this.switchType = 'FIELD';
            this.lastSwitchLi = fieldLi;
        });
        d.on(levelLi, 'click', () => {
            fieldLi.classList.remove('li-select');
            this.functionLi.classList.remove('li-select');
            levelLi.classList.add('li-select');
            if (!this.levelContentDom) {
                this.levelContentDom = d.create(`<div class="level-content"></div>`);
                plContent.appendChild(this.levelContentDom);
            }
            this.generateLGContent();
            if (this.fieldContentDom) {
                this.fieldContentDom.style.display = 'none';
            }
            this.operateContentDom.style.display = 'none';
            this.levelContentDom.style.display = 'block';
            this.switchType = 'LEVEL';
            this.lastSwitchLi = levelLi;
        });
    }

    /**
     * 生成功能模块对应的各个操作
     * */
    private generateOperateContent() {
        let operateMenuDom = d.create(`<ul class="operate-menu select-box-small"></ul>`),
            operateConfDom = d.create(`<div class="operate-conf select-box-small"></div>`);
        this.operateContentDom.appendChild(operateMenuDom);
        this.operateContentDom.appendChild(operateConfDom);
        this.operateListString.forEach((obj) => {
            let str = obj.typeName,
                liDom = d.create(`<li class="menu-item">${str}</li>`);
            operateMenuDom.appendChild(liDom);
            d.on(liDom, 'click', () => {
                if (this.lastLi && this.lastLi !== liDom) {
                    this.lastLi.classList.remove('li-select');
                }
                this.lastLi = liDom;
                liDom.classList.add('li-select');
                switch (str) {
                    case '标准操作':
                        this.getActionType(operateConfDom, 'STANDARD', 'OPER_ID', 'OPER_NAME', 1);
                        break;
                    case '数据操作':
                        this.getActionType(operateConfDom, 'ACTION', 'ELEMENT_ID', 'CAPTION', 2);
                        break;
                    case '全局操作':
                        this.getActionType(operateConfDom, 'HANDLE', 'ELEMENT_ID', 'CAPTION', 3);
                        break;
                    case '关联操作':
                        this.getActionType(operateConfDom, 'ASSOCIATE', 'ELEMENT_ID', 'CAPTION', 4);
                        break;
                    case '操作组':
                        this.getActionType(operateConfDom, 'OPERGROUP', 'OPER_GROUP_ID', 'OPER_GROUP_NAME', 0);
                        break;
                }

            });
        });

        //默认加载标准操作
        if (operateMenuDom && operateMenuDom.firstChild) {
            (<HTMLElement>operateMenuDom.firstChild).classList.add('li-select');
            this.standardLi = <HTMLElement> operateMenuDom.firstChild;
            this.lastLi = <HTMLElement> operateMenuDom.firstChild;
            this.getActionType(operateConfDom, 'STANDARD', 'OPER_ID', 'OPER_NAME', 1);
        }
    }

    //获取动作组数据
    protected getActionType(container: HTMLElement, type: string, name, title, operType, user_input = '') {
        container.innerHTML = '';
        let tempTable = <HTMLTableElement>d.create('<table><tbody></tbody></table>'),
            ajaxData = [{
                select_type: 'getoperidbyuserinput',
                input_type: type,
                user_input: user_input,
                node_id: this.infoPlatSelected.length === 1 ? this.infoPlatSelected[0] : '',
                priv_group_id: this.privGroudId
            }],
            data = [],
            self = this;

        container.appendChild(tempTable);

        // Rule.ajax(this.url, {
        //     type: 'Post',
        //     data: JSON.stringify(ajaxData),
        //     success(response) {
        //         let bodylist = response && response.body && response.body.bodyList && response.body.bodyList['0'],
        //             checkedArr = [];
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
        //         //如果未勾选信息平台节点时，或未勾选权限组时，表格数据为空。
        //         if (self.infoPlatSelected.length < 1 || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
        //             data = [];
        //         }
        //         let tableConf: TableModulePara = {
        //             cols: [{
        //                 title: "操作名称",
        //                 name: title
        //             }, {
        //                 title: "操作编号",
        //                 name: name
        //             }],
        //             multPage: 2,//2前台分页
        //             isSub: true,
        //             data: data
        //         };
        //
        //         switch (type) {
        //             case 'STANDARD':
        //                 createTable(self.standardTable);
        //                 break;
        //             case 'ACTION':
        //                 createTable(self.actiondTable);
        //                 break;
        //             case 'HANDLE':
        //                 createTable(self.handleTable);
        //                 break;
        //             case 'ASSOCIATE':
        //                 createTable(self.associateTable);
        //                 break;
        //             case 'OPERGROUP':
        //                 createTable(self.opergroupTable);
        //                 break;
        //         }
        //         function createTable(action) {
        //             action = new TableModulePc({
        //                 tableEl: tempTable,
        //                 scrollEl: container,
        //                 fixTop: 0
        //             }, tableConf).table;
        //             if (self.lastOperTable && self.lastOperTable !== action) {
        //                 self.lastOperTable.wrapperGet().style.display = 'none';
        //             }
        //             self.lastOperTable = action;
        //
        //             //对权限回显出的数据（IS_CHECK为真）做高亮显示
        //             self.privEcho(response, tempTable);
        //             action.on('render', () => {
        //                 self.privEcho(response, tempTable);
        //             });
        //         }
        //
        //         self.operType = operType;
        //     }
        // });
        BwRule.Ajax.fetch(this.url,{
            type: 'Post',
            data: JSON.stringify(ajaxData),
        }).then(({response}) => {
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
            //如果未勾选信息平台节点时，或未勾选权限组时，表格数据为空。
            if (self.infoPlatSelected.length < 1 || !self.privGroupTable || self.privGroupTable.rowSelectDataGet().length < 1) {
                data = [];
            }
            let tableConf: TableModulePara = {
                cols: [{
                    title: "操作名称",
                    name: title
                }, {
                    title: "操作编号",
                    name: name
                }],
                multPage: 2,//2前台分页
                isSub: true,
                data: data
            };

            switch (type) {
                case 'STANDARD':
                    createTable(self.standardTable);
                    break;
                case 'ACTION':
                    createTable(self.actiondTable);
                    break;
                case 'HANDLE':
                    createTable(self.handleTable);
                    break;
                case 'ASSOCIATE':
                    createTable(self.associateTable);
                    break;
                case 'OPERGROUP':
                    createTable(self.opergroupTable);
                    break;
            }
            function createTable(action) {
                action = new TableModulePc({
                    tableEl: tempTable,
                    scrollEl: container,
                    fixTop: 0
                }, tableConf).table;
                if (self.lastOperTable && self.lastOperTable !== action) {
                    self.lastOperTable.wrapperGet().style.display = 'none';
                }
                self.lastOperTable = action;

                //对权限回显出的数据（IS_CHECK为真）做高亮显示
                self.privEcho(response, tempTable);
                action.on('render', () => {
                    self.privEcho(response, tempTable);
                });
            }

            self.operType = operType;
        })
    }

    //构造功能搜索框控件
    private generateFunctionSearch() {
        let self = this;
        this.functionSearchDom = d.create(`<div class="function-search"></div>`);
        this.confSearchDom.appendChild(this.functionSearchDom);
        this.functionSearchInput = new SearchInput({
            container: self.functionSearchDom,
            className: 'w',
            placeholder: '搜索...',
            ajax: {
                url: self.url,
                fun(url, data, recentValue, cb) {
                    let container = d.query('.operate-conf', self.operateContentDom),
                        index = self.operTypeArr.indexOf(self.operType),
                        operate = self.operateListString[index];
                    if (container) {
                        self.getActionType(container, operate.type, operate.name, operate.title, self.operType, recentValue);
                    }
                }
            }
        });
    }

    /**
     * 构建信息平台模块
     * */
    private generateInfoPlatform(infoPlatEl: HTMLElement) {
        if (tools.isEmpty(infoPlatEl)) {
            return;
        }
        this.infoPFSearchDom = d.create(`<div class="info-platform-search"></div>`);
        let infoPFContent = d.create(`<div class="info-platform-content"></div>`);

        infoPlatEl.appendChild(this.infoPFSearchDom);
        infoPlatEl.appendChild(infoPFContent);
        //构造信息平台搜索框组件
        let self = this;
        this.infoPFSearchInput = new SearchInput({
            container: this.infoPFSearchDom,
            className: 'w',
            placeholder: '搜索...',
            ajax: {
                url: self.url,
                fun: (url, data, recentValue, callback) => {
                    if (recentValue !== '')
                        this.infoPlatFormInit(infoPFContent, (node) => {
                            return <Promise<ITreePara[]>>this.ajaxLoad(self.url, [{
                                select_type: 'getnodeinfobyuserinput',
                                user_input: recentValue
                            }]).then((res) => {
                                return this.childData(res, true);
                            });
                        });
                    else
                        loadTree(infoPFContent);
                }
            }
        });
        loadTree(infoPFContent);
        function loadTree(dom) {
            self.infoPlatFormInit(dom, (node) => {
                return <Promise<ITreePara[]>>self.ajaxLoad(self.url, [{
                    select_type: 'getnextnodeinfo',
                    current_node_id: node.content && node.content.nodeId
                }]).then((res) => {
                    return self.childData(res)
                });
            });
        }
    }

    /**
     * 树children构造
     * @param response
     * @param isLeaf
     * @returns {Array}
     */
    private childData(response, isLeaf = false) {
        let data = [];
        response.data.forEach(obj => {
            data.push({
                text: obj.CAPTION_EXPLAIN,
                icon: obj.ICON_NAME,
                content: {
                    nodeId: obj.NODE_ID,
                    title: obj.CAPTION_EXPLAIN
                },
                isAccordion: true,
                isLeaf: isLeaf === true ? isLeaf : obj.IS_END === 1,
            })
        });
        return data;
    }


    /**
     * 信息平台
     * @param container
     * @param callback
     */
    private infoPlatFormInit(container: HTMLElement, callback?) {
        if (this.tree) {
            this.tree.destroy();
        }
        this.tree = new Tree({
            container: container,
            isAccordion: true,
            expand: true,
            isLeaf: false,
            multiSelect: true,
            toggleSelect: true,
            ajax: (node) => {
                return callback(node);
            },
        });

        this.tree.onSelect = (node) => {
          this.judgeControl();
        };
    }

    /**
     * 是否受控
     */
    judgeControl(cb?){
        let treeSelect = this.tree.getSelectedNodes(), self = this;
        let tipDom = d.query('.priv-tip', this.dom);
        this.infoPlatSelected = treeSelect? treeSelect.map(node => node.content.nodeId) : [];
        if(treeSelect && treeSelect.length === 1){
            this.ajaxLoad(this.url,
                [{
                    select_type: 'getNodeIdIsPrivCtl',
                    node_id: this.infoPlatSelected.join(',')
                }],
                false
            ).then((r) => {
                if (treeSelect && treeSelect[0]) {
                    if (r.body.bodyList[0]) {
                        control(tipDom);
                    } else {
                        tipDom.classList.remove('hide');
                        tipDom.innerHTML = '该节点不可受控！';
                        new Button({
                            content: '添加受控',
                            container: tipDom,
                            type: 'primary',
                            onClick: (e) => {
                                let url = CONF.ajaxUrl.rmprivsInsert;
                                this.ajaxLoad(url, [{
                                    node_id: this.infoPlatSelected.join(',')
                                }], false).then((res) => {
                                    Modal.alert(res.msg);
                                    control(tipDom);
                                })

                            }
                        })
                    }
                }
            });
        }else {
            control(tipDom);
        }
        if(!treeSelect){
            tipDom.innerHTML = '请先选中一个节点';
            tipDom.classList.remove('hide');
        }

        function control(tipDom) {
            tipDom.classList.add('hide');
            self.initMultiPage();
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
        }
    }
    /**
     * 多选节点时，仅显示功能模块的标准操作
     * */
    private initMultiPage() {
        if (this.infoPlatSelected.length > 1) {
            this.dom.classList.add('hide-field-function');
            this.lastSwitchLi.classList.remove('li-select');
            this.functionLi.classList.add('li-select');
            if (this.levelContentDom) {
                this.levelContentDom.style.display = 'none';
            }
            if (this.fieldContentDom) {
                this.fieldSearchDom.style.display = 'none';
                this.fieldContentDom.style.display = 'none';
            }
            this.operateContentDom.style.display = 'block';
            this.functionSearchDom.style.display = 'block';
            this.switchType = 'FUNCTION';

            if (this.lastOperTable && this.standardTable && this.lastOperTable !== this.standardTable) {
                this.lastOperTable.wrapperGet().style.display = 'none';
                this.standardTable.wrapperGet().style.display = 'block';
                this.lastOperTable = this.standardTable;
                this.lastLi.classList.remove('li-select');
                this.standardLi.classList.add('li-select');
                this.operType = 1;
            }
        } else {
            this.dom.classList.remove('hide-field-function');
        }
    }


    saveBtnCb() {
        let self = this;
        let privGroupData = self.privGroupTable.rowSelectDataGet(),
            privGroupLen = privGroupData.length,
            fieldRowData = self.fieldTable && self.fieldTable.rowSelectDataGet();
        //单选节点
        if (this.infoPlatSelected.length === 1) {
            //单选权限组
            if (privGroupLen === 1 && self.privGroudId) {
                let delData = [],
                    addData = [];

                //功能模块
                if (self.switchType === 'FUNCTION') {
                    let resData = self.lastOperTable && self.lastOperTable.rowSelectDataGet();
                    if (!resData || !resData[0]) {
                        Modal.alert('请选择要配置的操作行！');
                        return;
                    }
                    resData.forEach((res) => {
                        let oper_name = Object.keys(res)[0],
                            operId = res[oper_name];
                        if (oper_name && operId) {
                            let obj = {
                                privGroupId: self.privGroudId,
                                nodeId: self.infoPlatSelected[0],
                                operType: self.operType,
                                operId: operId,
                            };
                            if (res['IS_CHECKED']) {
                                delData.push(obj);
                            } else {
                                addData.push(obj);
                            }
                        }
                    });
                    if(delData[0] && addData[0]){

                    }
                    delData[0] && self.saveResponse(self.urls[2], delData, !addData[0]);
                    addData[0] && self.saveResponse(self.urls[1], addData);
                }
                //属性模块
                else if (self.switchType === 'FIELD') {
                    if (fieldRowData.length < 1) {
                        Modal.alert('请选择要新增/删除的字段行');
                        return;
                    } else {
                        fieldRowData.forEach((d) => {
                            if (d['IS_CHECKED'] && d['FIELD_NAME']) {
                                delData.push(d['FIELD_NAME']);
                            } else if (d['FIELD_NAME']) {
                                addData.push(d['FIELD_NAME']);
                            }
                        })
                    }
                    //删除属性行
                    delData[0] && addRow(self.urls[5], delData, !addData[0]);
                    //添加属性行
                    addData[0] && addRow(self.urls[4], addData);
                }
                //层级模块
                else if (self.switchType === 'LEVEL') {
                    if (!self.delLevelData[0] && !self.resLevelData[0]) {
                        Modal.alert('请对层级权限进行配置！');
                        return;
                    }
                    if (self.delLevelData[0]) {
                        self.saveResponse(self.urls[8], mergeData(self.delLevelData, self.privGroudId), !addData[0]);
                    }
                    if (self.resLevelData[0]) {
                        self.saveResponse(self.urls[7], mergeData(self.resLevelData, self.privGroudId));
                    }

                }
            }
            //多选权限组
            else if (privGroupLen > 1 && self.confSaveSelectBox) {
                let privIds = [];
                privGroupData.forEach((priv) => {
                    privIds.push(priv['PRIV_GROUP_ID']);
                });
                //功能模块
                if (self.switchType === 'FUNCTION') {
                    let resData = self.lastOperTable && self.lastOperTable.rowSelectDataGet(),
                        json = [];
                    if (!resData || !resData[0]) {
                        Modal.alert('请选择要配置的操作行！');
                        return;
                    }
                    resData.forEach((res) => {
                        let oper_name = Object.keys(res)[0],
                            operId = res[oper_name];
                        if (oper_name && operId) {
                            let obj = {
                                privGroupId: privIds.join(','),
                                nodeId: self.infoPlatSelected[0],
                                operType: self.operType,
                                operId: operId,
                            };
                            json.push(obj);
                        }
                    });
                    self.saveResponse(self.urls[self.confSaveSelectBox.get()[0]], json);
                }
                //属性模块
                else if (self.switchType === 'FIELD') {
                    let json = [],
                        fieldNames = [];
                    if (fieldRowData.length < 1) {
                        Modal.alert('请选择要新增/删除的字段行');
                        return;
                    }
                    fieldRowData.forEach((d) => {
                        fieldNames.push(d['FIELD_NAME']);
                    });
                    json = [{
                        privGroupId: privIds.join(','),
                        operType: '1',
                        operId: '1',
                        fieldName: fieldNames.join(',')
                    }];
                    self.saveResponse(self.urls[self.confSaveSelectBox.get()[0] + 3], json);
                }
                //层级模块
                else if (self.switchType === 'LEVEL') {
                    if (!self.delLevelData[0] && !self.resLevelData[0]) {
                        Modal.alert('请对层级权限进行配置！');
                        return;
                    }
                    let json;
                    if (self.delLevelData[0] || self.resLevelData[0]) {
                        json = mergeData(self.delLevelData, privIds.join(','))
                    }
                    self.saveResponse(self.urls[self.confSaveSelectBox.get()[0] + 6], json);
                }
            } else {
                Modal.alert('请选择权限组！');
            }

        }
        //多选节点，仅存在功能模块的操作模块
        else if (this.infoPlatSelected.length > 1) {
            let resData = self.standardTable && self.standardTable.rowSelectDataGet();
            if (!resData || !resData[0]) {
                Modal.alert('请选择要配置的操作行！');
                return;
            }
            //单选权限组
            if (privGroupLen === 1 && self.privGroudId) {
                let delData = [],
                    addData = [];
                resData.forEach((res) => {
                    let oper_name = Object.keys(res)[0],
                        operId = res[oper_name];
                    if (oper_name && operId) {
                        let obj = [{
                            privGroupId: self.privGroudId,
                            nodeId: self.infoPlatSelected.join(','),
                            operType: self.operType,
                            operId: operId,
                        }];
                        if (res['IS_CHECKED']) {
                            delData.push(obj);
                        } else {
                            addData.push(obj);
                        }
                    }
                });
                delData[0] && self.saveResponse(self.urls[2], delData);
                addData[0] && self.saveResponse(self.urls[1], addData);

            }
            //多选权限组
            else if (privGroupLen > 1 && self.confSaveSelectBox) {
                let privIds = [];
                privGroupData.forEach((priv) => {
                    privIds.push(priv['PRIV_GROUP_ID']);
                });
                // resData.forEach((res) => {
                //     let oper_name = Object.keys(res)[0],
                //         operId = res[oper_name];
                //     if (oper_name && operId) {
                //         let obj = [{
                //             privGroupId: privIds.join(','),
                //             nodeId: self.infoPlatSelected.join(','),
                //             operType: self.operType,
                //             operId: operId,
                //         }];
                //         json.push(obj);
                //     }
                // });
                self.saveResponse(self.urls[self.confSaveSelectBox.get()[0]], confAjaxData(resData, privIds.join(',')));

            } else {
                Modal.alert('请选择权限组！');
            }
        }
        //未选节点
        else {
            Modal.alert('请选择节点！');
        }

        function confAjaxData(resData, privGroupId) {
            let data = [];
            resData.forEach((res) => {
                let oper_name = Object.keys(res)[0],
                    operId = res[oper_name];
                if (oper_name && operId) {
                    let obj = [{
                        privGroupId: privGroupId,
                        nodeId: self.infoPlatSelected.join(','),
                        operType: self.operType,
                        operId: operId,
                    }];
                    data.push(obj);
                }
            });
            return data;
        }

        function addRow(url, data, isAlert?) {
            self.saveResponse(url, [{
                privGroupId: self.privGroudId,
                operType: '1',
                operId: '1',
                fieldName: data.join(','),
                nodeId: self.infoPlatSelected[0]
            }], isAlert);
        }

        function mergeData(data, id) {
            let join = [];
            data.forEach((obj) => {
                let d = {
                    privGroupId: id,
                    operType: '1',
                    operId: '1',
                    levelId: obj['LEVEL_ID'],
                    insType: obj['INS_TYPE'],
                    insValue: obj['INS_VALUE'],
                    nodeId: self.infoPlatSelected[0]
                };
                join.push(d);
            });
            return join;
        }
    }

    private ajaxLoad(url, data, cache = true) {
        return BwRule.Ajax.fetch(url, {
            type: 'Post',
            data: JSON.stringify(data),
            cache: cache
        }).then(({response}) => {
            return response;
        })
        // Rule.ajax(CONF.siteUrl + url, {
        //     type: 'Post',
        //     data: JSON.stringify(data),
        //     cache: cache,
        //     success: (response) => {
        //
        //     }
        // })
    }
}