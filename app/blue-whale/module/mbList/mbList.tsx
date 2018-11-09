/// <amd-module name="BwMbList"/>

import {MbListItemData} from "../../../global/components/mbList/MbListItem";
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {MbList} from "../../../global/components/mbList/MbList";
import {BwRule} from "../../common/rule/BwRule";

export interface IBwMbList extends IComponentPara {
    ui: IBW_UI<IBW_Table>;
    ajaxData?: obj;
}

export class BwMbList extends Component {
    protected wrapperInit(para: IBwMbList): HTMLElement {
        return <div className="mb-list-page"/>;
    }

    private isImgTpl: boolean = false;
    private layout: obj = {};
    private captions: string[] = [];
    private imgLabelColor: string = '';
    private statusColor: string = '';

    constructor(private para: IBwMbList) {
        super(para);
        this.getButtons(para.ui.body.elements[0].subButtons);
        this.handlerLayout(para.ui.body.elements[0].layout, para.ui.body.elements[0].cols);
        tools.isNotEmpty(this.layout['body']) && this.getBodyCaption(this.layout, para.ui.body.elements[0].cols);
        this.initMbList();
    }

    private mbList: MbList = null;

    private initMbList() {
        let multiButtons = [], itemButtons = [];
        this.allButtons[1] && this.allButtons[1].forEach(btn => {
            itemButtons.push(btn.caption);
        });
        this.allButtons[2] && this.allButtons[2].forEach(btn => {
            multiButtons.push(btn.caption);
        });
        this.mbList = new MbList({
            isImg: this.isImgTpl,
            itemButtons: itemButtons,
            multiButtons: multiButtons,
            container: this.wrapper,
            statusColor: this.statusColor,
            imgLabelColor: this.imgLabelColor,
            dataManager: {
                pageSize: 20,
                render: (start: number, length: number, data: obj[], isRefresh: boolean) => {
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
            switch (btn.multiselect) {
                case 0:
                case 1: {
                    buttons[btn.multiselect].push(btn);
                }
                    break;
                case 2: {
                    buttons[2].push(btn);
                    buttons[1].push(btn);
                }
                    break;
            }
        });
        this.allButtons = buttons;
    }

    private handlerLayout(layout: IBW_Layout, cols: R_Field[]) {
        let validLayout: obj = {};
        for (let key in layout) {
            tools.isNotEmpty(layout[key]) && (validLayout[key] = layout[key]);
        }
        tools.isNotEmpty(validLayout['img']) && (this.isImgTpl = true);
        if (tools.isNotEmpty(validLayout['imgLabelColor'])) {
            let {r, g, b} = tools.val2RGB(validLayout['imgLabelColor']);
            this.imgLabelColor = '#' + parseInt(r.toString(), 16) + parseInt(g.toString(), 16) + parseInt(b.toString(), 16) + '';
        }
        if (tools.isNotEmpty(validLayout['statusColor'])) {
            let {r, g, b} = tools.val2RGB(validLayout['statusColor']);
            this.statusColor = '#' + parseInt(r.toString(), 16) + parseInt(g.toString(), 16) + parseInt(b.toString(), 16) + '';
        }
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
                        labelField.forEach((field, index) => {
                            labelData.push(item[field]);
                        });
                        itemObj['label'] = labelField;
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
                        itemObj['countDown'] = item[layout['countDown']];
                    }
                        break;
                    case 'status': {

                    }
                        break;
                }
            }
            listData.push(itemObj);
        });
        return listData;
    }

    destroy() {
        this.layout = null;
        this.allButtons = null;
        this.mbList.destroy();
        this.mbList = null;
        super.destroy();
    }
}