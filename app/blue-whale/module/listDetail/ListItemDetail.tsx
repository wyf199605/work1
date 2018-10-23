/// <amd-module name="ListItemDetail"/>

import {BwRule} from "../../common/rule/BwRule";
import {DetailCellType, ListItemDetailCell} from "./ListItemDetailCell";
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";

export class ListItemDetail {
    // DOM容器
    private wrapper: HTMLElement;
    private cells: objOf<ListItemDetailCell> = {};
    private defaultData:obj = {};
    constructor(private para: EditPagePara) {
        let wrapper = <div className="list-item-detail-wrapper"/>;
        para.dom.appendChild(wrapper);
        this.wrapper = wrapper;
        this.initDetailTpl(para.fm.fields);
        this.initDetailData(para.fm.fields).then(data => {
            let cells = this.cells;
            for (let key in cells){
                cells[key].render(data[key] || '');
            }
        });
        this.initDetailButtons(para.fm.subButtons);
    }

    initDetailTpl(fields: R_Field[]) {
        fields.forEach(field => {
            if (!!!field.noShow) {
                this.cells[field.name] = new ListItemDetailCell({
                    caption: field.caption,
                    type: this.getType(field.dataType || field.atrrs.dataType || ''),
                    container: this.wrapper
                });
            }
        })
    }

    // 初始化详情DOM
    initDetailData(fields: R_Field[]): Promise<obj> {
        return new Promise<obj>((resolve, reject) => {
            let data: obj = {};
            let dataAddr = this.para.fm.dataAddr;
            if (tools.isNotEmpty(dataAddr)) {
                BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(dataAddr)).then(({response}) => {
                    let res = response.data[0] || {};
                    this.defaultData = res;
                    if (tools.isNotEmpty(res)){
                        for (let key in this.cells){
                            let field = fields.filter((f) => f.name === key)[0],
                                value = tools.isNotEmpty(res[key]) ? this.handlerValue(res[key],field) : '';
                            data[key] = value;
                        }
                    }
                    resolve(data);
                })
            } else {
                resolve(data);
            }
        })
    }

    // 设置详情数据
    render(data: obj) {

    }

    // 初始化详情按钮
    initDetailButtons(buttons: R_Button[]) {
        if (tools.isNotEmpty(buttons)){
            this.wrapper.appendChild(<div className="list-item-detail-buttons">
                <Button content="上一页" className="list-detail-btn prev-page" color="success"/>
                <Button content="下一页" className="list-detail-btn next-page" color="warning"/>
            </div>)
        }
    }

    getType(t: string): DetailCellType {
        let type: DetailCellType;
        if (t === '18') {
            type = 'textarea';
        } else if (t === '20' || t === '22' || t === '24') {
            type = 'img';
        } else if (t === '43' || t === '44') {
            type = 'file';
        } else if (t === '12') {
            type = 'date';
        } else if (t === '13') {
            type = 'datetime';
        } else {
            type = 'text';
        }
        return type;
    }

    handlerValue(text, format: R_Field): string | string[] {
        let t: string = '',
            v = text,
            type = tools.isNotEmpty(format) ? format.dataType || format.atrrs.dataType : '';
        if (type === '18') {
            t = 'textarea';
        } else if (type === '20' || type === '22' || type === '24') {
            t = 'img';
        } else if (type === '43' || type === '44') {
            t = 'file';
        } else {
            t = 'text';
        }
        let types = ['10', '11', '12', '13', '14', '17', '30', '31', '43'];
        if (types.indexOf(type)) {
            v = G.Rule.formatTableText(text, format);
        } else {
            if (type === '18') {
                // 多行文本
                v = text;
            } else if (type === '20' || type === '40') {
                // BLOB类型
                v = BW.CONF.siteUrl + text;
            } else if (type === '21' || type === '22') {
                // 单图和多图（md5）
                let addrArr = text.split(',');
                addrArr.forEach(ad => {
                    // 根据md5获取文件地址
                    v.push(BwRule.fileUrlGet(ad, format.name || format.atrrs.fieldName, true));
                })
            } else if (type === '24' || type === '25') {
                // 单图和多图（相对地址）
                let addrArr = text.split(',');
                addrArr.forEach(ad => {
                    v.push(BW.CONF.siteUrl + ad)
                })
            }
        }
        return v;
    }
}