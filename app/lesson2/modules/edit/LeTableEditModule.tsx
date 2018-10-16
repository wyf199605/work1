///<amd-module name="LeTableEditModule"/>

import {LeButtonGroup} from "../LeButton/LeButtonGroup";
import {FormFactory, IFormFactoryPara} from "../../common/FormFactory";
import d = G.d;
import tools = G.tools;
import {LeRule} from "../../common/rule/LeRule";

export interface ILeTableEditModulePara extends IFormFactoryPara{
    ui: ILE_Editor;
    isAutoLoad?: boolean;
}

export class LeTableEditModule extends FormFactory{
    public static EDIT_COM_VIEW_CLASS = 'form-com-view';


    protected ui: ILE_Editor;
    protected selectParaInit(cond: ILE_Editor_Cond, para: ILeTableEditModulePara): obj {
        let result: any = {},
            view = para.ui.view || false,
            noShowField = para.ui.noShowField ? para.ui.noShowField.split(',') : [],
            noEditField = para.ui.noEditField ? para.ui.noEditField.split(',') : [],
            fieldName = cond.fieldName;

        if(this.fields && fieldName){
            if(noEditField && noEditField.indexOf(fieldName) > -1){
                result.disabled = true;
            }else{
                for(let item of this.fields){
                    if(fieldName === item.name){
                        result.disabled = !item.modifyFlag;
                        break;
                    }
                }
            }
        }

        if(cond.showFlag === false || (noShowField && noShowField.indexOf(fieldName) > -1)){
            result.showFlag = false
        }

        result.onSet = tools.isNotEmpty(cond.relateFields) ? (e) => {
            let targetCom = null;
            for(let item of this.forms){
                if(item.custom.fieldName === cond.relateFields){
                    targetCom = item;
                    break;
                }
            }
            if(typeof e === 'object' && cond.relateFields in e){
                targetCom && targetCom.set(e[cond.relateFields]);
            }
        } : void 0;

        if(cond.type === 'pick') {
            let edit = para.ui.edit;
            if (edit && Array.isArray(edit.picks)) {
                for (let pick of edit.picks) {
                    if (pick.fieldname === fieldName) {
                        result.ui = pick;
                        break;
                    }
                }
            }
        }

        if(view){
            result.className = LeTableEditModule.EDIT_COM_VIEW_CLASS;
            result.disabled = true;
            result.placeholder = ' ';
        }

        return result;
    }


    protected wrapperInit(para: ILeTableEditModulePara): HTMLElement {
        return <div className="edit-wrapper"/>;
    }

    constructor(para: ILeTableEditModulePara){
        super(Object.assign({}, para, {
            cond: para.ui.fields,
            isTitle: true,
        }));
        this.ui = para.ui;

        let btnWrapper = <div style={this.isWrapLine ? '' : 'display: inline-block'} className="form-com-item">
            <div className="form-com-title" style="opacity: 0;visibility: hidden;">按钮：</div>
        </div>;
        new LeButtonGroup({
            buttons: para.ui.button,
            dataGet: () => {
                return this.json;
            },
            container: btnWrapper,
        });
        let wrapper = this.isWrapLine ? this.wrapper : d.query('.form-com-wrapper', this.wrapper);
        d.append(d.query('.form-com-wrapper', this.wrapper), btnWrapper);

        let isAutoLoad = tools.isEmpty(para.isAutoLoad) ? true : para.isAutoLoad;

        if(isAutoLoad){
            let link = para.ui.link || (para.ui.defaults ? para.ui.defaults.link : null);
            this.initComData(link, para.ui.assigns);
        }

    }

    protected ajaxData(link: ILE_Link, fieldName: string, relateName: string = fieldName): Promise<Array<{ title: string, value: string }[] | string[]>> {
        return new Promise<any>((resolve, reject) => {
            if (tools.isEmpty(link)) {
                reject();
            } else {
                let request = {};
                for(let com of this.forms){
                    let fieldName = com.custom.fieldName;
                    request[fieldName] = com.get();
                }
                LeRule.linkReq(link, request).then(({response}) => {
                    console.log(response);
                    let body = response.data,
                        dataList = body ? body.data : [],
                        result = [];
                    dataList.forEach((item) => {
                        let json: obj = {};
                        for(let key in item){
                            json[key] = item[key];
                            if(key === fieldName){
                                json.text = item[key];
                                json.value = item[key];
                            }
                        }
                        result.push(json);
                    });
                    resolve(result);
                });
            }
        })
    }

    public loadDefaultData(data?: obj){
        let link = this.ui.link || (this.ui.defaults ? this.ui.defaults.link : null);
        this.initComData(link, this.ui.assigns, data);
    }

    protected initComData(link, assigns?: LE_Assign[], data?: obj){

        if(tools.isNotEmpty(link)){
            let objOfForms = {};
            for(let com of this.forms){
                objOfForms[com.custom.fieldName] = com;
            }
            LeRule.linkReq(link, data).then(({response}) => {
                let body = response.data,
                    data = body && body.data[0];

                if(data){
                    for(let key in data){
                        let com = objOfForms[key],
                            value = tools.isEmpty(data[key]) ? '' : data[key] + '';
                        // if(com instanceof ReportUploadModule){
                        //     value = tools.url.addObj(LE.CONF.ajaxUrl.fileDownload, {
                        //         md5_field: 'FILE_ID',
                        //         file_id: value,
                        //         down: 'allow'
                        //     })
                        // }
                        com && com.set(value);
                        // delete objOfForms[key];
                        // objOfForms[key] && objOfForms[key].set(data[key] + '');
                    }

                    for(let key in objOfForms){
                        let com = objOfForms[key],
                            custom = com.custom,
                            relateFields = custom.relateFields,
                            fieldName = custom.fieldName;
                        if(custom.link && relateFields && objOfForms[relateFields]){
                            let value = objOfForms[relateFields].get(),
                                request = {};
                            for(let com of this.forms){
                                let fieldName = com.custom.fieldName;
                                request[fieldName] = com.get();
                            }
                            LeRule.linkReq(custom.link, request).then(({response}) => {
                                let dataList = response.data.data;
                                if(Array.isArray(dataList)){
                                    for(let data of dataList){
                                        if(data[relateFields] === value){
                                            com && com.set(tools.isEmpty(data[fieldName]) ? '' : data[fieldName]);
                                            break;
                                        }
                                    }
                                }
                            }).catch((e) => {
                                console.log(e);
                            });
                        }
                        // for(let assign of assigns){
                        //     if(assign.fieldname === custom.relateFields){
                        //     }
                        // }
                    }
                }
            });

        }
    }

    get json(){
        let result = {};
        if(this.forms){
            for(let com of this.forms){
                let name = com.custom.fieldName,
                    value = com.get();
                result[name] = value;
            }
        }
        console.log(JSON.stringify(result));
        return result;
    }

}


