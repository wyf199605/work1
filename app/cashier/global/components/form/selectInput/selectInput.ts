/// <amd-module name="SelectInput"/>
import tools = C.tools;
import d = C.d;
import {TextInput, TextInputBasicPara, TextInputPara} from "../text/text";
import {DropDown, DropDownPara, ListData, SelectDataPara} from "../../ui/dropdown/dropdown";

export interface SelectInputPara extends TextInputBasicPara, SelectDataPara {
    onSet?(item: ListItem, index?: number): void;

    useInputVal?: boolean; // get值时是否用input的值
    clickType?: number; // 点击出现下拉框的位置, 0: 整个输入框, 1:下拉图标, 默认下拉图标

    multi?:boolean;
    multiSplit?:string;
    dropClassName?: string;
}

export class SelectInput extends TextInput {
    onSet: (val) => {};

    private defaultVal: any;

    protected para: SelectInputPara;
    protected dropdown: DropDown;


    private toggle() {
        this.dropdown.toggle(this._wrapper);
    }

    constructor(para: SelectInputPara) {

        super(<TextInputPara>tools.obj.merge(para, {
            icons: ['iconfont icon-arrow-down'],
            iconHandle: para.clickType !== 0 ? () => {
                this.toggle();
            } : null
        }));

        this.tabIndex = para.tabIndex;
        this.ajaxFun(para);
        this.para = para;
        // clickType为0时
        if (para.clickType === 0) {
            this.input.style.cursor = 'pointer';

            d.on(this._wrapper, 'click', (e: Event) => {
                e.stopPropagation();
                this.toggle();
            })
        }
        let dropPara: DropDownPara = {
            el: document.body,
            data: para.data,
            ajax: para.ajax,
            multi: para.multi,
            className: para.dropClassName

        };
        this.para.multi ? (dropPara['onMultiSelect'] = (selected, index) => {

            let splitCode = this.para.multiSplit ? this.para.multiSplit : ',';
            let innerVal = '';
            if(Array.isArray(selected) && selected[0]){
                innerVal += selected[0].value;
                for(let i = 1;i < selected.length; i++) {
                    innerVal += `${splitCode}${selected[i].value}`;
                }
                this.input.value = innerVal;
            }
            this.para.onSet && this.para.onSet(selected, index);

        }): (dropPara['onSelect'] =(item, index) => {
            this.input.value = this.para.useInputVal ? item.value.toString() : item.text;
            this.para.onSet && this.para.onSet(item, index);
        });

        this.dropdown = new DropDown(dropPara);
    }

    protected keyHandle = (e: KeyboardEvent) => {

        let data = this.getData();
        if( Array.isArray(data) ){
            let index = this.dropdown.selectedIndex,
                length = this.getData().length;

            if(e.keyCode === 38) {
                index --;
            }else if(e.keyCode === 40) {
                index ++;
            }

            if(index < 0){
                index = 0;
            }
            if(index >= length - 1){
                index = length - 1;
            }
            this.set((<any>data[index]).value)
        }

    };


    private ajaxFun(para: SelectDataPara) {
        if (para.ajax) {
            let fun = para.ajax.fun;
            para.ajax.fun = (url, value, callback) => {
                fun(url, value === '' ? super.get() : value, callback)
            }
        }
    }

    getData() : ListData{
        return this.para.data;
    }

    set(value) {
        if (!this.dropdown.select(value)) {
            this.defaultVal = value;
            super.set(value);

            typeof this.onSet === 'function' && this.onSet(value);
        }
        // super.set(value);
    }


    get() {
        if(this.para.multi){
            let seleArr = this.dropdown.get();
            let cacheData = this.para.data;
            let result = cacheData[seleArr[0]]['value'];
            if(seleArr.length > 1){
                for(let j = 1,len = seleArr.length;j < len;j++){
                    result += ','+cacheData[seleArr[j]]['value'];
                }
            }
            return result;
        }
        else{
            let selected = this.dropdown.get();
            if (this.para.useInputVal) {
                return super.get();
            } else {
                return selected === null ? this.defaultVal : selected.value;
            }
        }
    }

    getText() {
        return this.input.value;
    }

    showItems(indexes: number[]) {
        this.dropdown.showItems(indexes);
    }

    setPara(para: SelectDataPara) {
        this.ajaxFun(para);
        this.dropdown.setPara(para);
    }

    destroy() {
        super.destroy();
        this.dropdown.destroy();
    }
}