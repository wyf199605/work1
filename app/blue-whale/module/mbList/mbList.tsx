/// <amd-module name="BwMbList"/>

import {MbListItemData} from "../../../global/components/mbList/MbListItem";
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;

export interface IBwMbList extends IComponentPara {
    ui: IBW_UI<IBW_Table>;
}

export class BwMbList extends Component {
    protected wrapperInit(para: IBwMbList): HTMLElement {
        return <div className="mb-list-page"/>;
    }

    private isImgTpl: boolean = false;
    private layout: IBW_Layout = {};
    private captions: string[] = [];

    constructor(para: IBwMbList) {
        super(para);
        this.getButtons(para.ui.body.elements[0].subButtons);
        this.handlerLayout(para.ui.body.elements[0].layout, para.ui.body.elements[0].cols);
        tools.isNotEmpty(this.layout['body']) && this.getBodyCaption(this.layout, para.ui.body.elements[0].cols);
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
        tools.isNotEmpty(layout['img']) && (this.isImgTpl = true);
        return layout;
    }

    private handlerResponseData({body,head,errorCode}) {
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
        return captions;
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
                        itemObj['img'] = item[layout['img']];
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
}