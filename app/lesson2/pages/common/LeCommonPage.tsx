/// <amd-module name="LeCommonPage"/>
import {LeBasicPage} from "../LeBasicPage";
import {LeRule} from "../../common/rule/LeRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import {Tab} from "../../../global/components/ui/tab/tab";
import d = G.d;
import {Button} from "../../../global/components/general/button/Button";
import {buttonAction} from "../../modules/LeButton/LeButtonGroup";
import {LeTablePage} from "../table/LeTablePage";
import {LeEditPage} from "../edit/LeEditPage";

export class LeCommonPage extends LeBasicPage {
    protected tab: Tab;
    protected pages: any[];

    protected init(para: obj, data?) {
        let url = para.url;
        if (!url) {
            Modal.alert('界面地址为空');
        }
        this.modal && (this.modal.width = '700px');

        let tablePage: LeTablePage = null;
        LeRule.Ajax.fetch(LE.CONF.siteUrl + url, {
            data: {output: "json"},
            loading: {
                msg: '页面加载中...',
                container: this.container
            }
        }).then(({response}) => {
            let lePage: ILE_Page = response.data || {},
                {head: leHead, body: leBody, common: leCommon} = lePage;
            let headerTitle = tools.isNotEmpty(this.header) ? this.header : this;
            headerTitle.title = leHead ? leHead.caption : '页面';

            if (tools.isEmpty(leBody)) {
                Modal.alert('页面UI数据为空');
                return;
            }

            this.fieldsInit(leCommon && leCommon.fields);

            // Header Buttons
            if (tools.isNotEmpty(leBody.buttons)) {
                leBody.buttons.forEach((btn) => {
                    new Button({
                        content: btn.caption,
                        container: this.header.buttonGroupEl,
                        onClick: () => {
                            let data = {};
                            if (btn.multi !== 1 && tools.isNotEmpty(tablePage)) {
                                data = tablePage.tableModule.main.ftable.selectedRowsData;
                            }
                            buttonAction.click(btn, data)
                        }
                    })
                })
            }

            let tabsUi = leBody.container && leBody.container.tab;

            this.pages = this.pages || [];
            if (tools.isNotEmptyArray(tabsUi)) {
                let tabContainer = <div className="le-tabs menu-tabs"/>;
                d.after(this.header.wrapper, tabContainer);

                let moudleParaArr: obj[] = [];
                this.tab = new Tab({
                    tabParent: tabContainer,
                    panelParent: this.body,
                    onClick: (index) => {
                        let modulePara = moudleParaArr[index];
                        // 确保第一次时才初始化
                        if (!this.pages[index] && modulePara) {
                            delete moudleParaArr[index];
                            let tabEl = d.query(`.tab-pane[data-index="${index}"]`, this.tab.getPanel());

                            if (modulePara.custom) {
                                let {dataAddr: pageName, varList} = modulePara.custom.link;
                                require([pageName], (module) => {
                                    this.pages[index] = new module[pageName]({
                                        container: tabEl
                                    });
                                    if (pageName = 'ActivityDetailModule') {
                                        this.pages[index].set(varList[0].varValue)
                                    }
                                });
                            } else if (modulePara.table) {
                                require(['LeTablePage'], (module) => {
                                    this.pages[index] = new module.LeTablePage(Object.assign({
                                        container: tabEl,
                                        basePage: this,
                                        queryData: para.query ? JSON.parse(para.query) : null,
                                        common: lePage.common,
                                        inTab: true
                                    }, modulePara));
                                });
                            }
                        }
                    }
                });
                // 控件UI分组
                tabsUi.forEach((tabUi) => {
                    let modulePara = {};
                    ['querier', 'editor', 'table', 'custom'].forEach(key => {
                        let id = tabUi[key] && tabUi[key][0],
                            le = id ? (leBody[key] || []).filter(leKey => leKey.id === id)[0] : null;
                        if (le) {
                            modulePara[key] = le;
                        }
                    });
                    this.tab.addTab([{
                        title: tabUi.caption,
                        dom: null
                    }]);
                    moudleParaArr.push(modulePara);
                });

                this.tab.active(leBody.container.deftPage);

            } else {
                if (tools.isNotEmpty(leBody.editor)) {
                    let page = new LeEditPage({
                        container: this.body,
                        pageEl: lePage,
                        basePage: this,
                    });
                    this.pages.push(page);
                }

                let modulePara = {};
                ['querier', 'table'].forEach(key => {
                    let le = (leBody[key] || [])[0];
                    if (le) {
                        modulePara[key] = le;
                    }
                });
                if (tools.isNotEmpty(modulePara)) {
                    require(['LeTablePage'], (module) => {
                        tablePage = new module.LeTablePage(Object.assign({
                            container: this.body,
                            basePage: this,
                            common: lePage.common,
                            queryData: para.query ? JSON.parse(para.query) : null


                        }, modulePara));

                        this.pages.push(tablePage);
                    })
                }

            }
        });
    }

    protected fieldsInit(fields: ILE_Field[]) {
        Array.isArray(fields) && fields.forEach(field => {
            if (field) {
                if (field.dataType === LeRule.DT_DATETIME && !field.displayFormat) {
                    field.displayFormat = 'yyyy-MM-dd HH:mm:ss';
                }

                if (field.dataType === LeRule.DT_TIME && !field.displayFormat) {
                    field.displayFormat = 'HH:mm:ss';
                }
            }
        })
    }

    destroy() {
        super.destroy();
        this.pages && this.pages.forEach(page => page && page.destroy());
        this.pages = [];
        this.tab = null;
    }
}