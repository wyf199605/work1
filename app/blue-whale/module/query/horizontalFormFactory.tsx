/// <amd-module name="HorizontalQueryModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import {FormCom} from "../../../global/components/form/basic";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {Datetime} from "../../../global/components/form/datetime/datetime";
import {NumInput} from "../../../global/components/form/numInput/numInput";
import {TextInput} from "../../../global/components/form/text/text";
import {BwRule} from "../../common/rule/BwRule";
import {BasicBoxGroup} from "../../../global/components/form/selectBoxGroup/selectBoxGroup";
import {Button} from "../../../global/components/general/button/Button";

export interface IHorizontalQueryModule extends IComponentPara {
    qm: IBw_Query;
    search?: (data) => any;
}
export class HorizontalQueryModule extends Component {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="horizontalQueryModule"/>;
    }

    protected forms: FormCom[];
    protected defaultData: obj;
    private _extraWrapper:HTMLElement;
    get extraWrapper(){
        if (!this._extraWrapper){
            this._extraWrapper = <div className="extra-wrapper"/>;
        }
        return this._extraWrapper;
    }
    protected _search: (data) => any;
    set search(flag) {
        this._search = flag;
    }

    get search() {
        return this._search;
    }

    constructor(para: IHorizontalQueryModule) {
        super(para);
        this.defaultData = this.getDefaultData(para.qm.queryparams1);
        this.search = para.search;
        this.__initForms(para);
        if (this.forms.length > 0 && (para.qm.queryType == 1 || para.qm.queryType == 3)) {
            d.append(d.query('.query-form',this.wrapper), <div className="form-com-item">
                <Button className="query-search-btn" content="查询" onClick={() => {
                    typeof this.search === 'function' && this.search(this.json);
                }}/>
            </div>);
        }
        // 自定义内容
        d.append(d.query('.query-form',this.wrapper),this.extraWrapper);
    }

    // 获取默认数据
    private getDefaultData(data: QueryConf[]): obj {
        let obj: obj = {};
        for (let item of data) {
            obj[item.field_name] = item.atrrs.defaultValue || '';
        }
        return obj;
    }

    // 初始化FormCom控件
    private __initForms(para: IHorizontalQueryModule) {
        let cond: QueryConf[] = para.qm.queryparams1 || [];
        this.forms = [];
        tools.isNotEmpty(this.wrapper) && d.append(this.wrapper,<div className="query-form">
            {cond.map(c => {
                let extra: obj = {};
                if (para.qm.queryType == 2 || para.qm.queryType == 4) {
                    extra.onSet = () => {
                        typeof this.search === 'function' && this.search(this.json);
                    }
                }
                let com,
                    props = Object.assign({}, {
                        custom: c,
                        showFlag: true,
                        placeholder: c.caption,
                    }, extra),
                    fieldName = c.field_name,
                    type = c.type || c.atrrs.dataType;
                switch (type) {
                    case 'VALUELIST':
                        com = <SelectInput clickType={0} readonly={true}
                                           data={tools.isEmpty(c.value_list) ? [] : c.value_list.map((res) => {
                                               let data = this.formatData(res);
                                               return {text: data.title, value: data.value};
                                           })} ajax={tools.isEmpty(c.link) ? void 0 : {
                            fun: (url, val, callback) => {
                                this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name).then((result) => {
                                    typeof callback === 'function' && callback(result);
                                })
                            }
                        }} {...props}/>;
                        break;
                    case 'VALUE':
                        com = <SelectInput clickType={0} readonly={true}
                                           data={tools.isEmpty(c.value_list) ? [] : c.value_list.map((res) => {
                                               let data = this.formatData(res);
                                               return {text: data.title, value: data.value};
                                           })} ajax={tools.isEmpty(c.link) ? void 0 : {
                            fun: (url, val, callback) => {
                                this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name).then((result) => {
                                    typeof callback === 'function' && callback(result);
                                })
                            }
                        }} {...props}/>;
                        break;
                    case 'QRYVALUE':
                        com = <SelectInput clickType={0} readonly={true}
                                           data={tools.isEmpty(c.value_list) ? [] : c.value_list.map((res) => {
                                               let data = this.formatData(res);
                                               return {text: data.title, value: data.value};
                                           })} ajax={tools.isEmpty(c.link) ? void 0 : {
                            fun: (url, val, callback) => {
                                this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name).then((result) => {
                                    typeof callback === 'function' && callback(result);
                                })
                            }
                        }} {...props}/>;
                        break;
                    case 'RESVALUE':
                        com = <SelectInput clickType={0} readonly={true}
                                           data={tools.isEmpty(c.value_list) ? [] : c.value_list.map((res) => {
                                               let data = this.formatData(res);
                                               return {text: data.title, value: data.value};
                                           })} ajax={tools.isEmpty(c.link) ? void 0 : {
                            fun: (url, val, callback) => {
                                this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name).then((result) => {
                                    typeof callback === 'function' && callback(result);
                                })
                            }
                        }} {...props}/>;
                        break;
                    case '12':
                        com = <Datetime format="yyyy-MM-dd" {...props}/>;
                        break;
                    case '13':
                        com = <Datetime format="yyyy-MM-dd HH:mm:ss" {...props}/>;
                        break;
                    case '10':
                        com = <NumInput defaultNum={0} {...props}/>;
                        break;
                    default:
                        com = <TextInput {...props}/>;
                }

                if (fieldName in this.defaultData) {
                    tools.isNotEmpty(this.defaultData[fieldName])
                    && com.set(this.defaultData[fieldName]);
                }

                this.forms.push(com);
                return props.showFlag ? <div className={"form-com-item"}>
                    <div className="form-com-title">{c.caption + '：'}</div>
                    {com}
                </div> : com.wrapper && d.remove(com.wrapper);
            })}
        </div>);
    }

    // 获取数据
    get json() {
        let json: obj = {},str = [];
        this.forms.forEach(form => {
            let cond: QueryConf = form.custom,
                value = form.value;
            json[cond.field_name] = value;
            // json.params = json.params || [];
            // if (form instanceof BasicBoxGroup && Array.isArray(value)) {
            //     value = value.join(',');
            // }
            // value = Array.isArray(value) ? value : [value];
            // if (!(value.length === 1 && tools.isEmpty(value[0]))) {
            //     if (!(value.length === 2 && tools.isEmpty(value[0]) && tools.isEmpty(value[1]))) {
            //         json.params.push([cond.field_name, value])
            //     }
            // }
        });
        // for (let key in json) {
        //     json[key] = JSON.stringify(json[key]);
        // }
        return json;
    }

    private getDropDownData(url: string, fieldName: string): Promise<Array<{ title: string, value: string }[] | string[]>> {
        return new Promise<any>((resolve, reject) => {
            if (tools.isEmpty(url)) {
                reject();
            } else {
                BwRule.Ajax.fetch(url).then(({response}) => {
                    let fields = [];
                    if (response.data[0]) {
                        fields = Object.keys(response.data[0]);
                    }
                    let options = response.data.map(data => {
                        return {
                            value: data[fieldName],
                            text: fields.map((key) => data[key]).join(','),
                        };
                    });
                    resolve(options);
                })
            }
        })
    }


    private formatData(data: { title: string, value: string } | string): { title: string, value: string } {
        if (data === void 0) {
            return undefined;
        }
        return {
            title: typeof data === 'string' ? data : data.title,
            value: typeof data === 'string' ? data : data.value,
        };
    }

    destroy() {
        this.forms && this.forms.forEach((form) => {
            form.destroy();
        });
        this.forms = null;
        this.search = null;
        super.destroy();
    }
}