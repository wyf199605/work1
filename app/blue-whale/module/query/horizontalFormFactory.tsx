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
import {Button} from "../../../global/components/general/button/Button";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {MbPage} from "../../../global/components/view/mbPage/MbPage";

export interface IHorizontalQueryModule extends IComponentPara {
    qm: IBw_Query;
    search?: (data) => Promise<any>;
}

export class HorizontalQueryModule extends Component {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="horizontalQueryModule"/>;
    }

    protected modal: QueryModal;
    protected forms: objOf<FormCom> = {};
    protected defaultData: obj;
    protected queryparams: QueryConf[];

    protected _search: (data) => any;
    set search(flag) {
        this._search = flag;
    }

    get search() {
        return this._search;
    }

    private atvarparams_fields:string[] = [];
    constructor(private para: IHorizontalQueryModule) {
        super(para);
        let queryparams: QueryConf[] = [];
        tools.isNotEmpty(para.qm.atvarparams) && para.qm.atvarparams.forEach(field => {
            this.atvarparams_fields.push(field.field_name);
        });
        [para.qm.queryparams1, para.qm.atvarparams].forEach((params) => {
            if(params){
                queryparams = queryparams.concat(params);
            }
        });

        this.queryparams = queryparams;
        this.defaultData = this.getDefaultData(this.queryparams);
        this.search = para.search;
        this.__initForms(para);
        // 自定义内容
        if (tools.isNotEmpty(this.forms) && (para.qm.queryType == 1 || para.qm.queryType == 3)) {
            if(tools.isMb){
                let queryBtn = d.query('[data-action="showQuery"]');
                queryBtn && d.on(queryBtn, 'click', () => {
                    this.modal.show = true;
                });
                this.modal = new QueryModal({
                    body: this.wrapper,
                    onClear: () => {
                        debugger;
                        for(let item of Object.values(this.forms || {})){
                            item.set('');
                            let itemWrap =   (d.query('input', item.wrapper) as HTMLInputElement);
                            itemWrap && ((d.query('input', item.wrapper) as HTMLInputElement).value = '');
                        }
                    },
                    onSearch: () => {
                        typeof this.search === 'function' && this.search(this.json).then(() => {
                            this.modal.show = false;
                        });
                    }
                });
            }else{
                d.append(d.query('.query-form', this.wrapper), <div className="form-com-item">
                    <Button className="query-search-btn" content="查询" onClick={() => {
                        typeof this.search === 'function' && this.search(this.json);
                    }}/>
                </div>);
            }
        }
        // setTimeout(()=>{
        //     if(para.qm.autTag === 0){
        //         typeof this.search === 'function' && this.search(this.json);
        //     }
        // },2500)

    }
    public autoTag(){
        typeof this.search === 'function' && this.search(this.json);
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
        let cond: QueryConf[] = this.queryparams || [];
        tools.isNotEmpty(this.wrapper) && d.append(this.wrapper, <div className="query-form">
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
                let SelectConstruct: typeof SelectInputMb | typeof SelectInput = tools.isMb ? SelectInputMb : SelectInput;
                if (~this.atvarparams_fields.indexOf(c.field_name)){
                    com = <SelectInput useInputVal={true}
                                           data={this.handleAtvarparams(c.field_name,c.data)} {...props}/>;
                }else{
                    switch (type) {
                        case 'VALUELIST':
                            com = <SelectConstruct useInputVal={true}
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
                            com = <SelectConstruct useInputVal={true}
                                                   data={tools.isEmpty(c.value_list) ? [] : c.value_list.map((res) => {
                                                       let data = this.formatData(res);
                                                       return {text: data.title, value: data.value};
                                                   })} ajax={tools.isEmpty(c.link) ? void 0 : {
                                fun: (url, val, callback) => {
                                    let querydata: obj = {}, forms = this.forms || {};
                                    if (c.dynamic === 1) {
                                        let params = [];
                                        for (let key in forms) {
                                            if (tools.isNotEmpty(forms[key].get()) && c.field_name !== key) {
                                                let paramObj: QueryParam = {
                                                    not: false,
                                                    op: 2,
                                                    field: key,
                                                    values: [forms[key].get()],
                                                };
                                                params.push(paramObj);
                                            }
                                        }
                                        if(tools.isNotEmpty(params[0])){
                                            querydata = {
                                                not: false,
                                                op: 0,
                                                params: params
                                            }
                                        }
                                    }
                                    this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name, querydata).then((result) => {
                                        typeof callback === 'function' && callback(result);
                                    })
                                }
                            }} {...props}/>;
                            break;
                        case 'QRYVALUE':
                            com = <SelectConstruct useInputVal={true}
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
                            com = <SelectConstruct useInputVal={true}
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
                }

                if (fieldName in this.defaultData) {
                    tools.isNotEmpty(this.defaultData[fieldName])
                    && com.set(this.defaultData[fieldName]);
                }
                this.forms[c.field_name] = com;
                return props.showFlag ? <div className={"form-com-item"}>
                    <div className="form-com-title">{c.caption + '：'}</div>
                    {com}
                </div> : com.wrapper && d.remove(com.wrapper);
            })}
        </div>);
    }

    // 获取数据
    get json() {
        let json: obj = {}, str = [];
        Object.values(this.forms).forEach(form => {
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

    private getDropDownData(url: string, fieldName: string, querydata?: obj): Promise<Array<{ title: string, value: string }[] | string[]>> {
        return new Promise<any>((resolve, reject) => {
            if (tools.isEmpty(url)) {
                reject();
            } else {
                let ajaxData = {};
                if (tools.isNotEmpty(querydata)){
                    ajaxData = {
                        "queryparams0": JSON.stringify(querydata)
                    };
                }
                BwRule.Ajax.fetch(url,{
                    data:ajaxData
                }).then(({response}) => {
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

    private handleAtvarparams(field_name:string,data:obj[]) {
        let result: obj[] = [];
        data.forEach(da => {
            result.push({
                text:da[field_name],
                value:da[field_name]
            })
        });
        return result;
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
        this.forms && Object.values(this.forms).forEach((form) => {
            form.destroy();
        });
        this.forms = null;
        this.search = null;
        super.destroy();
    }
}
interface IQueryModalPara{
    body: HTMLElement;
    onClear?: Function;
    onSearch?: Function;
}

class QueryModal{
    protected modal: Modal;
    protected mbPage: MbPage;
    constructor(para: IQueryModalPara){
        this.modal = new Modal({
            className: 'modal-mbPage queryBuilder',
            isBackground: false,
            zIndex : 500
        });
        let body = <div className="plan-query-form-body">
            {para.body}
            <div className="footer-btn-group">
                <Button content="重置" onClick={() => {
                    para.onClear && para.onClear();
                }}/>
                <Button content="搜索" type="primary" onClick={() => {
                    para.onSearch && para.onSearch();
                }}/>
            </div>
        </div>;

        let closeEl = <a className="mui-icon mui-icon-left-nav mui-pull-left" data-action="hide"/>;
        d.on(closeEl, 'click', () => {
            this.modal.isShow = false;
        });
        this.mbPage = new MbPage({
            container: this.modal.bodyWrapper,
            body: body,
            left: closeEl,
            title: '搜索',
            className: 'mbPage-query'
        });
    }

    set show(flag: boolean){
        this.modal.isShow = flag;
    }
}