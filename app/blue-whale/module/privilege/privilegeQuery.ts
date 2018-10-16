/// <amd-module name="PrivilegeQuery"/>
import CONF = BW.CONF;
import d = G.d;
import tools = G.tools;
import BasicPage from "../../pages/basicPage";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import TableModulePc = require( "../table/tableModulePc");
import {BwRule} from "../../common/rule/BwRule";
import {TextInput} from "../../../global/components/form/text/text";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {ModalFooter} from "../../../global/components/feedback/modal/ModalFooter";
import {Button} from "../../../global/components/general/button/Button";
import {SearchInput} from "../../../global/components/form/searchInput/searchInput";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Tab} from "../../../global/components/ui/tab/tab";
import {ITreePara, Tree} from "../../../global/components/navigation/tree/Tree";
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {Loading} from "../../../global/components/ui/loading/loading";

/**
 * 权限查询
 */
export class PrivilegeQuery extends BasicPage {
    private nodeData: string;
    private userId: string[] = [];
    private userModal: Modal;
    private groupModal: Modal;
    private nodeModal: Modal;
    private tab: Tab;
    private tree: Tree;
    private groupSearch: SearchInput;
    private spinner: Spinner;
    private loading: Loading;
    private ajaxUrl: string;
    private iurl: string;

    constructor(private para) {
        super(para);
        this.ajaxUrl = tools.isNotEmpty(para.url) ? para.url : '';
        this.iurl = tools.isNotEmpty(para.iurl) ? para.iurl : '';
        this.init();
    }

    private init() {
        let tpl = this.initTpl();
        this.para.dom.appendChild(tpl);
        let dropDom = d.query('.priv-user-drop', tpl);

        //节点
        let text = new TextInput({
            container: d.query('.priv-node', tpl),
            readonly: true,
            icons: ['iconfont icon-arrow-down'],
            iconHandle: (value) => {
                if (!this.nodeModal) {
                    let rightPanel = this.clearBtn(text, () => {

                        this.nodeModal.isShow = false;
                    });
                    rightPanel.addItem(new Button({
                        content: '确定',
                        onClick: () => {
                            // let tnode = this.tree.find((node) => {
                            //     if(node.content && node.content.nodeId === 'node_m1') {
                            //         return node;
                            //     }
                            // });
                            // console.log(tnode);
                            let select = this.tree.getSelectedNodes(),
                                data = [], str = '';

                            select && (data = select.map(node => node.content));

                            this.nodeData = '';
                            data.forEach(obj => {
                                str += obj.title + '；';
                                this.nodeData += obj.nodeId + ',';
                            });
                            this.nodeData = this.nodeData.substring(0, this.nodeData.length - 1);
                            text.set(str);
                            this.nodeModal.isShow = false;
                        }
                    }));
                    this.nodeModal = new Modal({
                        container: this.para.dom,
                        className: 'priv-query-modal',
                        // isShow : false,
                        body: d.create(`<div></div>`),
                        footer: {
                            rightPanel: rightPanel
                        },
                        width: '250px'
                    });

                    this.nodeSuccess(this.nodeModal.body)


                } else {
                    this.nodeModal.isShow = true;
                }
            }
        });

        let userInput = new SelectInput({
            container: d.query('.priv-user', tpl),
            data: [{
                text: '用户',
                value: 'USER',
            }, {
                text: '用户组',
                value: 'GROUP'
            }],
            onSet: (data) => {
            }
        });
        userInput.set('USER');
        let u = tools.isNotEmpty(this.iurl) ?
            this.iurl : tools.url.addObj(CONF.siteAppVerUrl + '/ui/pick/n1174_data-4/pick-4', {isMb: true}, false);
        //用户or用户组
        let iframe = <HTMLIFrameElement>d.create(
            `<iframe class="pageIframe" src="${u}"></iframe>`);

        let tableText = new TextInput({
            container: dropDom,
            readonly: true,
            icons: ['iconfont icon-arrow-down'],
            className: 'user-drop',
            iconHandle: () => {
                this.textClick(userInput, text, iframe, tableText)
            }
        });
        let tableModule;
        let queryBtn = new Button({
            content: '查询',
            type: 'primary',
            container: d.query('.priv-query-btn', tpl),
            onClick: (btn) => {
                let userType = userInput.get(), id;
                this.ajaxLoad([{
                    select_type: "getoperprivsbynodeidoruser",
                    user_id: this.userId.join(','),   //用户编号或用户组编号
                    user_type: userType,
                    node_id: this.nodeData
                }]).then((response) => {
                    console.log(response, 'user');
                    if (response.meta.indexOf('USER_ID') > -1) {
                        id = 'USER_ID';
                    } else {
                        id = 'GROUP_ID';
                    }

                    let parentDom = <HTMLElement>d.query('.parent-table', tpl),
                        childDom = <HTMLElement>d.query('.child-table', tpl),
                        tableDom = <HTMLTableElement>d.create(`<table><tbody></tbody></table>`);
                    parentDom.innerHTML = null;
                    parentDom.appendChild(tableDom);
                    tableModule = this.createTable(tableDom, parentDom, response.data, this.resetCols(response.head.cols), 108);

                    tableModule.table.clickEvent.add('tbody tr', (e: any) => {
                        let data = tableModule.table.rowDataGet(d.closest(e.target, 'tr').dataset.index),
                            oper = d.query('.oper-priv', tpl),
                            prop = d.query('.prop-priv', tpl),
                            level = d.query('.level-priv', tpl);
                        console.log(data);
                        if (!this.tab) {
                            this.tab = new Tab({
                                tabParent: childDom,
                                panelParent: childDom,
                                tabs: [
                                    {
                                        title: '功能',
                                        dom: oper,
                                        name: 'OPER_PRIVS'
                                    }, {
                                        title: '属性',
                                        dom: prop,
                                        name: 'PROP_PRIVS'
                                    }, {
                                        title: '层级',
                                        dom: level,
                                        name: 'LEVEL_PRIVS'
                                    }
                                ],
                                onClick: (index) => {
                                    let dom, action;
                                    switch (index) {
                                        case 0 :
                                            dom = oper;
                                            action = 'OPER_PRIVS';
                                            break;
                                        case 1 :
                                            dom = prop;
                                            action = 'PROP_PRIVS';
                                            break;
                                        case 2 :
                                            dom = level;
                                            action = 'LEVEL_PRIVS';
                                            break;
                                    }
                                    this.tabLoad(action, dom, data[id], userType, data);
                                }
                            });
                        }
                        this.tabLoad('OPER_PRIVS', oper, data[id], userType, data);
                    });
                })
            }
        })
    }

    /**
     * 选项卡ui
     * @param action
     * @param dom
     * @param data
     * @param inputType
     * @param tableData
     */
    private tabLoad(action, dom, data, inputType, tableData) {
        console.log(tableData);
        this.ajaxLoad([{
            select_type: 'getprivsinfo',
            user_input: data,
            input_type: inputType,
            node_id: tableData['NODE_ID'],
            privs_type: action
        }]).then((response) => {
            let tableDom = <HTMLTableElement>d.create(`<table><tbody></tbody></table>`);
            dom.innerHTML = null;
            dom.appendChild(tableDom);
            this.createTable(tableDom, dom, response.data, this.resetCols(response.head.cols));
        })
    }

    /**
     * 创建表格
     * @param tableDom
     * @param scrollEl
     * @param data
     * @param cols
     * @param fixTop
     * @returns {TableModulePc}
     */
    private createTable(tableDom: HTMLTableElement, scrollEl, data, cols, fixTop?: number) {
        let tableConf = {
            tableEl: <HTMLTableElement>tableDom,
            scrollEl: scrollEl,
        };
        if (fixTop) {
            tableConf['fixTop'] = fixTop;
        }
        return new TableModulePc(tableConf, {
            cols: cols,
            multPage: 2,
            isSub: true,
            data: data,
        });
    }

    /**
     * 模态框清除按钮
     * @param text
     * @param cb
     * @returns {InputBox}
     */
    private clearBtn(text, cb) {
        let clear = new InputBox();
        clear.addItem(new Button({
            content: '清除',
            onClick: () => {
                text.set('');
                cb();
            }
        }));
        return clear;
    }

    /**
     * 用户、用户组
     * @param userInput
     * @param text  节点
     * @param iframe
     * @param tableText
     */
    private textClick(userInput: SelectInput, text: TextInput, iframe, tableText: TextInput) {
        switch (userInput.get()) {
            case 'USER' :
                this.userUi(iframe, tableText);
                break;
            case 'GROUP' :
                this.groupUi(tableText);
                break;
        }
    }

    /**
     * 用户组ui
     * @param tableText
     */
    private groupUi(tableText) {
        let groupTable;
        this.ajaxLoad([{select_type: 'getusergroupbyuserinput', user_input: ''}], false
        ).then((response) => {
            if (!this.groupModal) {
                let rightPanel = this.clearBtn(tableText, () => {
                    this.userId = [];
                    this.groupModal.isShow = false;
                });
                rightPanel.addItem(new Button({
                    content: '确定',
                    onClick: () => {
                        let str = '';
                        this.userId = [];
                        groupTable.table.rowSelectDataGet().forEach(obj => {
                            str += obj['GROUP_NAME'] + ';';
                            this.userId.push(obj['GROUP_ID']);
                        });
                        tableText.set(str);
                        this.groupModal.isShow = false;
                    }
                }));
                this.groupModal = new Modal({
                    header: '用户组',
                    container: this.para.dom,
                    body: d.create(`<div><div class="group-search"></div><div class="scroll-el"><table><tbody></tbody></table></div></div>`),
                    className: 'priv-query-group-modal',
                    width: '435px',
                    footer: {
                        rightPanel: rightPanel
                    },
                });

                this.groupSearch = new SearchInput({
                    container: d.query('.group-search', <HTMLElement>this.groupModal.body),
                    placeholder: '搜索...',
                    ajax: {
                        fun: (url, data, recentValue, cb) => {
                            this.ajaxLoad([{
                                select_type: 'getusergroupbyuserinput',
                                user_input: recentValue
                            }]).then((res: any) => {
                                groupTable.tableData.setNewData(res.data);
                            })
                        }
                    }
                });

                let dom = <HTMLTableElement>d.query('table', this.groupModal.bodyWrapper),
                    scrollEl = d.query('.scroll-el', this.groupModal.bodyWrapper);

                groupTable = this.createTable(dom, scrollEl, response.data, this.resetCols(response.head.cols));

            } else {
                this.groupModal.isShow = true;
            }
        });
    }

    /**
     * 用户ui
     * @param iframe
     * @param tableText
     */
    private userUi(iframe, tableText) {
        if (!this.userModal) {
            this.userModal = new Modal({
                body: iframe,
                className: 'priv-modal',
                container: this.para.dom,
                footer: {
                    rightPanel: this.clearBtn(tableText, () => {
                        this.userId = [];
                        this.userModal.isShow = false;
                    })
                }
            });
            iframe.onload = () => {
                let contactIframe = <HTMLIFrameElement>this.userModal.body,
                    iframeBody = contactIframe.contentDocument.body,
                    scrollDom = iframeBody.querySelector('#list .mui-scroll'),
                    list = iframeBody.querySelector('#list'),
                    div = document.createElement('div'),
                    htmlDom = <HTMLElement>G.d.create(`<style>header a.sys-action-back{display: none} .ulOverFlow{ height:424px; overflow-y : auto} #list{height: 100vh}</style>`);

                contactIframe.contentDocument.head.appendChild(htmlDom);

                scrollDom.classList.add('ulOverFlow');
                iframeBody.querySelector('header .mui-title').innerHTML = '用户名';
            };
        } else {
            this.userModal.isShow = true;
        }
        d.once(window, 'selectContact', (e: CustomEvent) => {
            if (this.userModal) {
                this.userModal.isShow = false;
            }
            let str = '';
            this.userId = [];
            e.detail.data.forEach(obj => {
                str += obj.USERID + ';';
                this.userId.push(obj.USERID);
            });
            tableText.set(str);
        });
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

    private initTpl() {
        return d.create(`<div class="priv-query">
        <div class="priv-condition">
            <div class="width-50">节点：</div>
            <div class="priv-node"></div>
            <div class="priv-user"></div>
            <div class="priv-user-drop"></div> 
            <div class="priv-query-btn"></div>
        </div>
        <div class="parent-table"></div>
        <div class="child-table">
            <div class="oper-priv"></div>
            <div class="prop-priv"></div>
            <div class="level-priv"></div>
        </div>
        </div>`)
    }

    private ajaxLoad(data, hasLoading = true) {

        if (hasLoading)
            if (!this.loading) {
                this.loading = new Loading({duration: 30})
            } else {
                this.loading.show();
            }
        let url = tools.isNotEmpty(this.ajaxUrl) ? this.ajaxUrl + '?deal_type=select' : CONF.ajaxUrl.rmprivsSelect;
        return BwRule.Ajax.fetch(url, {
            type: 'POST',
            data: JSON.stringify(data),
            // cache: true,
            timeout: 30000,
        }).then(({response}) => {
            hasLoading && this.loading.hide();
            return response;
        });
        // Rule.ajax(CONF.siteUrl + '/app_sanfu_retail/v1/rmprivs/privsget/select', {
        //     type: 'Post',
        //     data: JSON.stringify(data),
        //     cache: true,
        //     timeout : 30000,
        //     success : (response) => {
        //         typeof cb === 'function' && cb(response);
        //         hasLoading && this.loading.hide();
        //     }
        // });
    }


    private childData(response) {
        let data = [];
        response.data.forEach(obj => {
            data.push({
                text: obj.CAPTION_EXPLAIN,
                icon: obj.ICON_NAME,
                content: {
                    nodeId: obj.NODE_ID,
                    title: obj.CAPTION_EXPLAIN
                },
                // isAccordion : false,
                isLeaf: obj.IS_END === 1,
            })
        });
        return data;
    }

    /**
     * 节点ui
     * @param container
     */
    private nodeSuccess(container) {
        if (!this.spinner) {
            this.spinner = new Spinner({
                el: container,
                type: Spinner.SHOW_TYPE.cover,
            });
        }
        this.spinner.show();

        this.tree = new Tree({
            container: container,
            isAccordion: false,
            expand: true,
            isLeaf: false,
            multiSelect: true,
            toggleSelect: true,
            ajax: (node) => {
                this.spinner.hide();
                return <Promise<ITreePara[]>>this.ajaxLoad([{
                        select_type: 'getnextnodeinfo',
                        current_node_id: node.content && node.content.nodeId
                    }],
                    false
                ).then((response) => {
                    return this.childData(response)
                })
                // return <Promise<ITreePara>>this.childData(this.ajaxLoad([{
                //     select_type : 'getnextnodeinfo',
                //     current_node_id : node.content && node.content.nodeId}],
                // ));
            }
        })

    }
}
