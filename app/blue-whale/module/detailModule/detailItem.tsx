/// <amd-module name="DetailItem"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import {DetailModule} from "./detailModule";
import {BwRule} from "../../common/rule/BwRule";
import {FormCom} from "../../../global/components/form/basic";
import {Modal} from "../../../global/components/feedback/modal/Modal";

export interface IDetailFormatData{
    text: string | Node,
    color?: string;
    bgColor?: string;
    classes?: string[],
    data?: any
}

export interface IDetailItemPara extends IComponentPara{
    field: R_Field;
    format: (field: R_Field, data: any, rowData: obj) => Promise<IDetailFormatData>;
    detail: DetailModule;
}

export class DetailItem extends Component{
    wrapperInit(para: IDetailItemPara){
        let field = para.field,
            name = field.name,
            title = field.caption,
            isShow = !field.noShow,
            dataType = field.dataType || field.atrrs.dataType;

        this._name = name;

        let className = DetailItem.isBlock(dataType) ? 'col-xs-12' :' col-xs-12 col-md-4 col-sm-6';
        if(tools.isMb){
            className = 'col-xs-12'
        }

        return isShow ? <div className={"detail-item " + className} data-name={name}>
            {this._titleEl = <div className="detail-item-title">{title}</div>}
            {this._contentEl = <div className="detail-item-content"/>}
        </div> : null;
    }

    static isBlock(dataType: string){
        return !!~[
            BwRule.DT_HTML,
            BwRule.DT_MULTI_TEXT,
            BwRule.DT_SIGN,
            BwRule.DT_IMAGE,
            BwRule.DT_FILE,
            BwRule.DT_UNI_MUL_FILE,
            BwRule.DT_UNI_FILE,
            BwRule.DT_UNI_MUL_IMAGE,
            BwRule.DT_UNI_IMAGE,
        ].indexOf(dataType);
    }

    protected _name: string;
    get name(){
        return this._name;
    }

    protected _titleEl: HTMLElement;
    get titleEl(){
        return this._titleEl;
    }
    protected _contentEl: HTMLElement;
    get contentEl(){
        return this._contentEl;
    }

    public custom: R_Field;
    public detail: DetailModule;

    protected format: (field: R_Field, data: any, rowData: obj) => Promise<IDetailFormatData>;

    constructor(para: IDetailItemPara){
        super(para);
        this.detail = para.detail;
        this.format = para.format;
        this.custom = para.field;
    }

    protected _itemData: any;
    get itemData(){
        return this._itemData;
    }
    set itemData(data: any){
        this._itemData = data;
        this.render(data);
    }

    render(data: any = this.itemData){
        this.format && this.detail.addPromise(this.format(this.custom, data, this.detail.detailData).then(({text, color, classes, bgColor}) => {
            let contentEl = this.contentEl;
            if(contentEl){
                contentEl.innerHTML = '';
                if(text instanceof Node){
                    contentEl && d.append(contentEl, text);
                }else {
                    text = tools.isEmpty(text) ? '' : text;
                    contentEl.innerHTML = text;
                }
            }

            this.classes = classes;
            this.color = color;
            this.background = bgColor;
        }));
    }

    static EVT_EDIT = '__event_data_change__';

    edit = (() => {
        let com: FormCom;
        return {
            init: (inputInit: (field: R_Field, item: DetailItem) => FormCom) => {
                let field = this.custom,
                    isEdit = !field.noEdit;

                this.contentEl && (this.contentEl.innerHTML = '');
                com = inputInit(this.custom, this);
                if(this.wrapper){
                    this.wrapper.classList.add('editing');
                }
                

                if(com instanceof FormCom){
                    let onSet = com.onSet;
                    com.onSet = (val) => {
                        onSet && onSet(val);
                        this.trigger(DetailItem.EVT_EDIT, com);
                    }
                }else{
                    this.render();
                }

                this.disabled = false;
                if(!isEdit && com){
                    com.disabled = true;
                    this.disabled = true;
                    tools.isMb && com.wrapper && com.wrapper.addEventListener('click', () => {
                        Modal.toast(field.caption + '不可编辑');
                    });
                }
            },
            cancel: () => {
                if(com){
                    this.itemData = com.get();
                    com.destroy();
                    com = null;
                }
                this.disabled = false;
            }
        }
    })();

    // 设置颜色
    set color(color: string) {
        color = color || null;
        this.wrapper && (this.wrapper.style.color = color);
    }
    get color() {
        return this.wrapper ? this.wrapper.style.color : '';
    }

    // 设置背景颜色
    set background(color: string) {
        color = color || null;
        this.wrapper && (this.wrapper.style.background = color);
    }
    get background(){
        return this.wrapper ? this.wrapper.style.background : '';
    }

    private _classes:string[] = [];
    set classes(strArr: string[]) {
        if(tools.isNotEmptyArray(strArr)){
            d.classRemove(this.wrapper, strArr);
            d.classAdd(this.wrapper, strArr);
            this._classes = [...strArr];
        }

    }
    get classes() {
        return [...(this._classes || [])]
    }
}
