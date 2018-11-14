/// <amd-module name="BwMbList"/>

import {MbListItemData} from "../../../global/components/mbList/MbListItem";
import tools = G.tools;
import d = G.d;
import IComponentPara = G.IComponentPara;
import {MbList} from "../../../global/components/mbList/MbList";
import {BwRule} from "../../common/rule/BwRule";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import BasicPage from "../basicPage";

export interface IBwMbList extends IComponentPara {
    ui: IBW_UI<IBW_Table>;
    ajaxData?: obj;
    dom:HTMLElement;
}

export class BwMbList extends BasicPage {
    private isImgTpl: boolean = false;
    private layout: obj = {};
    private captions: string[] = [];
    private imgLabelColor: string = '';
    // private statusColor: string = '';
    private isMulti: boolean = false;
    private defaultData:obj[] = [];
    constructor(private para: IBwMbList) {
        super(para);
        this.getButtons(para.ui.body.elements[0].subButtons);
        this.initGlobalButtons();
        this.handlerLayout(para.ui.body.elements[0].layout, para.ui.body.elements[0].cols);
        tools.isNotEmpty(this.layout['body']) && this.getBodyCaption(this.layout, para.ui.body.elements[0].cols);
        this.initMbList();
        this.initEvents.on();
    }

    // 创建全局按钮
    private initGlobalButtons() {
        let globalButtons = this.allButtons[0] || [];
        if (tools.isNotEmpty(globalButtons)) {
            let globalButtonWrapper = <div className="global-buttons-wrapper"/>,
                btnArr = [];
            globalButtons.forEach((btn, index) => {
                let className = '';
                switch (index) {
                    case 1: {
                        className = 'clear-data';
                    }
                        break;
                    case 2: {
                        className = 'add-data';
                    }
                        break;
                }
                btnArr.push(`<div class="global-btn-item ${className}" data-index="${index}">${btn.caption}</div>`);
            });
            globalButtonWrapper.innerHTML = btnArr.join('');
            this.para.dom.appendChild(globalButtonWrapper);
        }
    }

    // 创建列表
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
        d.append(this.para.dom, wrapper = <div className="mblist-page-mblist-wrapper"/>);
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
                    data = this.defaultData[itemIndex];
                console.log(data);
            },
            itemClick: (index) => {
                let data = this.defaultData[index];
                console.log(data);
            },
            multiClick:(btnIndex, itemsIndexes) => {
                let buttons = this.allButtons[1] || [],
                    btn = buttons[btnIndex],
                    data = [];
                this.defaultData.forEach((da,index) => {
                    itemsIndexes.indexOf(index) > -1 && data.push(da);
                });
                console.log(data);
            },
            container: wrapper,
            dataManager: {
                pageSize: 10,
                isPulldownRefresh: true,
                render: (start: number, length: number, data: obj[], isRefresh: boolean) => {
                    this.defaultData = data;
                    this.mbList.render(this.getListData(this.layout, data, this.captions));
                },
                ajaxFun: ({current, pageSize, isRefresh, sort, custom}) => {
                    return new Promise<{ data: obj[], total: number }>((resolve, reject) => {
                        let dataAddr: R_ReqAddr = this.para.ui.body.elements[0].dataAddr,
                            url = BW.CONF.siteUrl + BwRule.reqAddr(dataAddr, custom);
                        url = tools.url.addObj(url, {
                            pageparams: '{"index"=' + (current + 1) + ', "size"=' + pageSize + ',"total"=1}'
                        });
                        BwRule.Ajax.fetch(url).then(({response}) => {
                            let body = response.body,
                                head = response.head;
                            resolve({
                                total: head.totalNum,
                                data: this.handlerResponseData(body)
                            })
                        })
                    })
                },
                ajaxData: this.para.ajaxData || {}
            }
        })
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

    private handlerLayout(layout: IBW_Layout, cols: R_Field[]) {
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
                        titleField.forEach((field, index) => {
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
                        itemObj['countDown'] = new Date(item[layout['countDown']]).getTime();
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
                            this.imgLabelColor = '#' + parseInt(r.toString(), 16) + parseInt(g.toString(), 16) + parseInt(b.toString(), 16) + '';
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
            // ButtonAction.get().clickHandle(buttons[index],{});
        };
        return {
            on: () => {
                d.on(this.para.dom, 'click', '.global-buttons-wrapper .global-btn-item', globalBtnClick);
            },
            off: () => {
                d.off(this.para.dom, 'click', '.global-buttons-wrapper .global-btn-item', globalBtnClick);
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