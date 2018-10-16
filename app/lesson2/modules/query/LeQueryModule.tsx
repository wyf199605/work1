/// <amd-module name="LeQueryModule"/>

import {Button} from "../../../global/components/general/button/Button";
import d = G.d;
import tools = G.tools;
import {FormFactory, IFormFactoryPara} from "../../common/FormFactory";
import IComponentPara = G.IComponentPara;
import {BasicBoxGroup, CheckBoxGroup} from "../../../global/components/form/selectBoxGroup/selectBoxGroup";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";

interface ILeQueryModulePara extends IFormFactoryPara {
    ui: ILE_Query;
    search?: (data) => Promise<any>;
    selects: ILE_TableEditSelect[];
    toggle?: (names: string[], isShow: boolean) => void;
}

export class LeQueryModule extends FormFactory {

    protected optionsWrapper: HTMLElement;
    protected options: CheckBoxGroup[];
    protected selects: ILE_TableEditSelect[];

    constructor(para: ILeQueryModulePara) {
        let ui = para.ui;
        super(Object.assign({}, para, {
            cond: ui.cond,
            isWrapLine: true,
        }) as IFormFactoryPara);

        this.selects = para.selects;
        this.toggle = para.toggle;
        this.search = para.search;

        this.initOption(ui.options);
        // 查询函数
        // 初始化查询按钮
        if (this.forms.length > 0) {
            d.append(d.query('.form-com-wrapper', this.wrapper), <div className="form-com-item">
                <Button className="query-search-btn" content="查询" onClick={() => {
                    typeof this.search === 'function' && this.search(this.json);
                }}/>
            </div>);
        }
    }

    protected initOption(options: ILE_Query_Option[]){
        if(Array.isArray(options)){
            if(!this.optionsWrapper){
                this.optionsWrapper = <div className="query-options-wrapper"/>;
                d.prepend(this.wrapper, this.optionsWrapper);
            }
            this.options = [];

            if(tools.isNotEmpty(this.fields)){
                let data = this.fields.map((field) => {return {title: field.caption, value: field.name}});

                options.forEach((option) => {
                    let boxGroup: CheckBoxGroup,
                        BoxGroup = CheckBoxGroup,
                        Box = CheckBox;
                    let fileNames = data.filter((field) => option.fieldNames.indexOf(field.value) > -1);
                    d.append(this.optionsWrapper, <div className="query-option-wrapper">
                        {tools.isNotEmpty(option.caption) ? <div className="query-option-caption">{option.caption}</div> : null}
                        <div className="query-option-tag">
                            {boxGroup = <BoxGroup type="tag" custom={option}>
                                {fileNames.map((filed) => {
                                    let box: CheckBox = <Box value={filed.value} text={filed.title}/>;
                                    box.checked = true;
                                    box.onClick = (checked) => {
                                        if(typeof this.toggle === 'function'){
                                            let result = [filed.value];
                                            if(Array.isArray(this.selects)){
                                                for(let select of this.selects){
                                                    if(select.relateFields === filed.value){
                                                        select.titleField && result.push(select.titleField);
                                                    }
                                                }
                                            }
                                            console.log(result, checked);
                                            this.toggle(result, checked);
                                        }
                                    };
                                    return box;
                                })}
                            </BoxGroup>}
                        </div>
                    </div>);
                    boxGroup.onSet = (e) => {
                        typeof this.search === 'function' && this.search(this.json);
                    };
                    this.options.push(boxGroup)
                });
            }

        }
    }

    // 初始化formCom额外参数
    protected selectParaInit(cond: ILE_Query_Cond) {
        let result: obj = {},
            type = cond.type,
            titleField = cond.titleField;

        cond.auto && (result.onSet = () => {
            typeof this.search === 'function' && this.search(this.json);
        });

        if(cond.relateFields && this.fields){
             for(let field of this.fields){
                 if(field.name === titleField){
                     result.placeholder = field.caption;
                     break;
                 }
             }
        }

        // switch (type){
        //     case "selectText":
        //         break;
        //     case "date":
        //         break;
        //     case "datetime":
        //         break;
        //     case "tag":
        //         break;
        //     case "selectBox":
        //         break;
        //     case "number":
        //         break;
        //     case "text":
        //     default:
        //         break;
        // }
        return result;
    }


    protected wrapperInit(para: ILeQueryModulePara): HTMLElement {
        return <div className="query-module-wrapper"/>;
    }

    // 获取数据
    get json() {
        let json: obj = {};
        this.forms.forEach(form => {
            let cond: ILE_Query_Cond = form.custom,
                value = form.value;
            // console.log(value);
            // if(cond.relateFields){
            //
            // }
            json.params = json.params || [];
            if(form instanceof BasicBoxGroup && Array.isArray(value)){
                value = value.join(',');
            }
            value = Array.isArray(value) ? value : [value];
            if(!(value.length === 1 && tools.isEmpty(value[0]))){
                if(!(value.length === 2 && tools.isEmpty(value[0]) && tools.isEmpty(value[1]))){
                    json.params.push([cond.fieldName, value])
                }
            }

        });
        if(this.options){
            json.option = json.option || {};
            for(let option of this.options){
                let type = option.custom.type;
                if(tools.isNotEmpty(option.value)){
                    json.option[type] = option.value;
                }
            }
        }
        for(let key in json){
            json[key] = JSON.stringify(json[key]);
        }
        console.log(json);
        return json;
    }

    protected _search: (data) => Promise<any>;
    set search(flag){
        this._search = flag;
    }
    get search(){
        return this._search;
    }

    protected _toggle: (names: string[], isShow: boolean) => void;
    set toggle(flag: (names: string[], isShow: boolean) => void){
        this._toggle = flag;
    }
    get toggle(){
        return this._toggle;
    }
}