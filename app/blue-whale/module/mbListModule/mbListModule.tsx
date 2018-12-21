/// <amd-module name="MbListModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {MbList} from "../../../global/components/mbList/MbList";
import {BwRule} from "../../common/rule/BwRule";
import {MbListItemData} from "../../../global/components/mbList/MbListItem";
import tools = G.tools;
import d = G.d;
import sys = BW.sys;
import {SlidePopover} from "../../../global/components/ui/slidePopover/slidePopover";
import {Button, IButton} from "../../../global/components/general/button/Button";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {DetailModal} from "../listDetail/DetailModal";
import {Modal} from "../../../global/components/feedback/modal/Modal";

export interface IMbListModule extends IComponentPara {
    ui: IBW_UI<IBW_Table>;
    url?: string;
    ajaxData?: obj;
}

export class MbListModule extends Component {
    protected wrapperInit(para: IMbListModule): HTMLElement {
        return <div className="mb-list-module"/>;
    }

    private isImgTpl: boolean = false;
    private layout: obj = {};
    private captions: string[] = [];
    private isMulti: boolean = false;
    private defaultData: obj[] = [];
    private hasQuery: boolean = false;

    constructor(private para: IMbListModule) {
        super(para);
        let tableListEl = para.ui.body.elements[0];
        tableListEl.subButtons = (tableListEl.subButtons || []).concat(para.ui.body.subButtons || []);
        let querier = this.para.ui.body.elements[0].querier;
        this.hasQuery = querier && ([3, 13].includes(querier.queryType)) || this.para.ui.body.elements[0].noQuery;
        this.getButtons(tableListEl.subButtons);
        this.initGlobalButtons();
        this.handlerLayout(tableListEl.layout);
        tools.isNotEmpty(this.layout['body']) && this.getBodyCaption(this.layout, tableListEl.cols);
        this.initMbList();
        this.initEvents.on();
    }

    /**
     * @author WUML
     * @date 2018/12/12
     * @Description: 刷新
     */
    refresh(ajaxData?: obj) {
        return this.mbList.dataManager.refresh(ajaxData || {});
    }


    /**
     * @author WUML
     * @date 2018/12/12
     * @Description: 初始化全局按钮
     */
    private initGlobalButtons() {
        let globalButtons = this.allButtons[0] || [];
        if (tools.isNotEmpty(globalButtons)) {
            if (tools.isMb) {
                let sliderPopover = new SlidePopover({
                    container: this.wrapper
                });
                let btnArr: IButton[] = [];
                globalButtons.forEach((btn) => {
                    btnArr.push({
                        content: btn.caption,
                        // icon: btn.icon ? btn.icon.split(' ')[1] : '',
                        // iconPre: btn.icon ? btn.icon.split(' ')[0] : '',
                        onClick: () => {
                            switch (btn.subType) {
                                case 'insert_save': {
                                    getFormFields(tools.url.addObj(BW.CONF.siteUrl + BwRule.reqAddr(btn.actionAddr), {
                                        output: 'json'
                                    }));
                                }
                                    break;
                                default:
                                    ButtonAction.get().clickHandle(btn, {});
                                    sliderPopover.modal.isShow = false;
                                    break;
                            }
                        }
                    })
                });
                sliderPopover.buttons = btnArr;
            } else {
                let globalButtonWrapper = <div className="global-button-wrapper"/>;
                this.wrapper.appendChild(globalButtonWrapper);
                let buttons: Button[] = [];
                let box = new InputBox({
                    container: globalButtonWrapper
                });
                globalButtons.forEach((btn) => {
                    buttons.push(new Button({
                        content: btn.caption,
                        container: box.wrapper,
                        onClick: () => {
                            switch (btn.subType) {
                                case 'insert_save': {
                                    getFormFields(tools.url.addObj(BW.CONF.siteUrl + BwRule.reqAddr(btn.actionAddr), {
                                        output: 'json'
                                    }));
                                }
                                    break;
                                default:
                                    ButtonAction.get().clickHandle(btn, {});
                                    break;
                            }
                        }
                    }))
                });
                box.children = buttons;
            }
        }
        let self = this;

        function getFormFields(url: string) {
            BwRule.Ajax.fetch(url, {
                loading: {
                    msg: '加载中,请稍后...',
                    disableEl: document.body
                }
            }).then(({response}) => {
                let element = response.body.elements[0];
                new DetailModal(Object.assign({}, {
                    fm: {
                        caption: element.caption,
                        fields: element.fields
                    }
                }, {
                    defaultData: {},
                    isAdd: true,
                    isPC: !tools.isMb,
                    confirm(data) {
                        return new Promise((resolve) => {
                            ButtonAction.get().clickHandle(element.subButtons[0], data, () => {
                                resolve();
                            }, self.para.url || '');
                        })
                    },
                    isNotDetail: true
                }))
            })
        }
    }

    /**
     * @author WUML
     * @date 2018/12/19
     * @Description: 外部使用，添加查询按钮
     */
    queryBtnAdd(btn: IButton) {
        let btnWrapper = d.query('.global-button-wrapper', this.wrapper);
        if (tools.isNotEmpty(btnWrapper)) {
            new Button(Object.assign({}, btn, {
                container: btnWrapper
            }));
        } else {
            let globalButtonWrapper = <div className="global-button-wrapper single-query"/>;
            this.wrapper.appendChild(globalButtonWrapper);
            new Button(Object.assign({}, btn, {
                container: globalButtonWrapper
            }));
        }
    }

    /**
     * @author WUML
     * @date 2018/12/11
     * @Description: 初始化列表
     */
    private mbList: MbList = null;

    private initMbList() {
        let multiButtons = [], itemButtons = [];
        this.allButtons[1] && this.allButtons[1].forEach(btn => {
            itemButtons.push(btn.caption);
        });
        this.allButtons[2] && this.allButtons[2].forEach(btn => {
            multiButtons.push(btn.caption);
        });
        let wrapper: HTMLElement;
        d.append(this.wrapper, wrapper = <div className="mblist-page-mblist-wrapper"/>);
        if (tools.isNotEmpty(this.allButtons[0])) {
            wrapper.classList.add('global-buttons-height');
        }
        this.mbList = new MbList({
            isImg: this.isImgTpl,
            isMulti: this.isMulti,
            itemButtons: itemButtons,
            multiButtons: multiButtons,
            buttonsClick: (btnIndex, itemIndex) => {
                let buttons = this.allButtons[1] || [],
                    btn = buttons[btnIndex],
                    data = this.defaultData[itemIndex],
                    self = this;
                switch (btn.subType) {
                    case 'update_save': {
                        BwRule.Ajax.fetch(tools.url.addObj(BW.CONF.siteUrl + BwRule.reqAddr(btn.actionAddr), {
                            output: 'json'
                        }), {
                            loading: {
                                msg: '加载中,请稍后...',
                                disableEl: document.body
                            }
                        }).then(({response}) => {
                            let element = response.body.elements[0];
                            new DetailModal(Object.assign({}, {
                                fm: {
                                    caption: element.caption,
                                    fields: element.fields
                                }
                            }, {
                                defaultData: data,
                                isAdd: false,
                                isPC: !tools.isMb,
                                confirm(data) {
                                    return new Promise((resolve) => {
                                        ButtonAction.get().clickHandle(element.subButtons[0], data, () => {
                                            resolve();
                                        }, self.para.url || '');
                                    })
                                },
                                isNotDetail: true
                            }))
                        })
                    }
                        break;
                    default:
                        ButtonAction.get().clickHandle(btn, data, () => {
                        }, self.para.url || '');
                        break;
                }
            },
            itemClick: (index) => {
                let data = this.defaultData[index],
                    addr: R_ReqAddr = this.para.ui.body.elements[0].layoutDrill;
                if (tools.isNotEmpty(addr)) {
                    sys.window.open({
                        url: tools.url.addObj(BW.CONF.siteUrl + addr.dataAddr, G.Rule.parseVarList(addr.parseVarList, data))
                    })
                }
            },
            multiClick: (btnIndex, itemsIndexes) => {
                if (itemsIndexes.length <= 0) {
                    Modal.alert('请选择数据!');
                    return;
                }
                let buttons = this.allButtons[2] || [],
                    btn = buttons[btnIndex],
                    data = [];
                this.defaultData.forEach((da, index) => {
                    itemsIndexes.indexOf(index) > -1 && data.push(da);
                });
                ButtonAction.get().clickHandle(btn, data, () => {
                    this.mbList.setSelectStatus(false);
                }, this.para.url || '');
            },
            container: wrapper,
            dataManager: {
                pageSize: tools.isMb ? 10 : 4,
                isPulldownRefresh: true,
                render: (start: number, length: number, data: obj[]) => {
                    this.mbList.wrapper.classList.toggle('no-data', tools.isEmpty(data));
                    this.defaultData = data;
                    this.mbList.render(this.getListData(this.layout, data, this.captions));
                },
                auto: !this.hasQuery,
                ajaxFun: ({current, pageSize, isRefresh, sort, custom}) => {
                    return new Promise<{ data: obj[], total: number }>((resolve) => {
                        let dataAddr: R_ReqAddr = this.para.ui.body.elements[0].dataAddr,
                            url = BW.CONF.siteUrl + BwRule.reqAddr(dataAddr);
                        url = tools.url.addObj(url, Object.assign({}, {
                            pageparams: '{"index"=' + (current + 1) + ', "size"=' + pageSize + ',"total"=1}'
                        }, custom));
                        BwRule.Ajax.fetch(url, {
                            loading: {
                                msg: '加载中，请稍后...',
                                disableEl: document.body
                            }
                        }).then(({response}) => {
                            let body = response.body,
                                head = response.head;
                            resolve({
                                total: head.totalNum,
                                data: this.handlerResponseData(body)
                            })
                        })
                    })
                },
                ajaxData: tools.isNotEmpty(this.para.ajaxData) ? this.para.ajaxData : null
            }
        });
    }

    // 处理按钮，数组一：无数据按钮，数组二：单选数据按钮，数组三：多选按钮
    private allButtons: [R_Button[], R_Button[], R_Button[]] = [[], [], []];

    private getButtons(subButtons: R_Button[]) {
        let buttons: [R_Button[], R_Button[], R_Button[]] = [[], [], []];
        subButtons.forEach(btn => {
            buttons[btn.multiselect].push(btn);
        });
        if (buttons[2].length > 0) {
            this.isMulti = true;
            buttons[1] = buttons[1].concat(buttons[2]);
        }
        this.allButtons = buttons;
    }

    private handlerLayout(layout: IBW_Layout) {
        let validLayout: obj = {};
        for (let key in layout) {
            tools.isNotEmpty(layout[key]) && (validLayout[key] = layout[key]);
        }
        tools.isNotEmpty(validLayout['img']) && (this.isImgTpl = true);
        this.layout = validLayout;
    }

    private handlerResponseData(body: obj) {
        let dataList: [string][] = body.bodyList[0].dataList,
            meta: string[] = body.bodyList[0].meta,
            data: obj[] = [];
        dataList.forEach((row) => {
            let rowObj: obj = {};
            meta.forEach((filed, index) => {
                rowObj[filed] = row[index];
            });
            data.push(rowObj);
        });
        return data;
    }

    private getBodyCaption(validLayout: IBW_Layout, cols: R_Field[]) {
        let captions = [];
        if (tools.isNotEmpty(validLayout['body'])) {
            validLayout['body'].forEach((field) => {
                captions.push(cols.filter((c) => c.name === field)[0].caption);
            })
        }
        this.captions = captions;
    }

    private getListData(layout: IBW_Layout, data: obj[], captions?: string[]): MbListItemData[] {
        let listData: MbListItemData[] = [];
        data.forEach((item) => {
            let itemObj: obj = {};
            for (let key in layout) {
                switch (key) {
                    case 'body': {
                        let bodyField: string[] = layout['body'],
                            bodyData = [];
                        bodyField.forEach((field, index) => {
                            bodyData.push([captions[index], item[field]]);
                        });
                        itemObj['body'] = bodyData;
                    }
                        break;
                    case 'label': {
                        let labelField: string[] = layout['label'],
                            labelData = [];
                        labelField.forEach((field) => {
                            item[field] && labelData.push(item[field]);
                        });
                        itemObj['label'] = labelData;
                    }
                        break;
                    case 'title': {
                        let titleField: string[] = layout['title'],
                            titleStr = '';
                        titleField.forEach((field) => {
                            titleStr += item[field];
                        });
                        itemObj['title'] = titleStr;
                    }
                        break;
                    case 'img': {
                        let field = layout['img'],
                            md5 = item[field];
                        itemObj['img'] = tools.isNotEmpty(md5) ? BwRule.fileUrlGet(md5, field) : '';
                    }
                        break;
                    case 'imgLabel': {
                        itemObj['imgLabel'] = item[layout['imgLabel']];
                    }
                        break;
                    case 'countDown': {
                        let time: string = item[layout['countDown']];
                        if (tools.isNotEmpty(time)) {
                            time = time.replace(/-/g, '/');
                            itemObj['countDown'] = new Date(time).getTime();
                        }
                    }
                        break;
                    case 'status': {
                        let field = layout['status'], md5 = item[field];
                        itemObj['status'] = tools.isNotEmpty(md5) ? BwRule.fileUrlGet(md5, field) : '';
                    }
                        break;
                    case  'imgLabelColor': {
                        let imgLabelColor = layout['imgLabelColor'];
                        if (tools.isNotEmpty(imgLabelColor)) {
                            let {r, g, b} = tools.val2RGB(item[imgLabelColor]);
                            itemObj['imgLabelColor'] = '#' + r.toString(16) + g.toString(16) + b.toString(16);
                        }
                    }
                        break;
                }
            }
            listData.push(itemObj);
        });
        return listData;
    }

    private initEvents = (() => {
        let globalBtnClick = (e) => {
            let index = parseInt(d.closest(e.target, '.global-btn-item').dataset.index),
                buttons = this.allButtons[0] || [];
            // 全局按钮不需要数据
            ButtonAction.get().clickHandle(buttons[index], {});
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.global-buttons-wrapper .global-btn-item', globalBtnClick);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.global-buttons-wrapper .global-btn-item', globalBtnClick);
            }
        }
    })();

    destroy() {
        this.layout = null;
        this.allButtons = null;
        this.mbList.destroy();
        this.mbList = null;
        this.initEvents.off();
        super.destroy();
    }

}