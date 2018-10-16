/// <amd-module name="FormFactory"/>

import {FormCom} from "../../global/components/form/basic";
import {SelectInput} from "../../global/components/form/selectInput/selectInput";
import {Datetime} from "../../global/components/form/datetime/datetime";
import {NumInput} from "../../global/components/form/numInput/numInput";
import {TextInput} from "../../global/components/form/text/text";
import {BasicBoxGroup, CheckBoxGroup, RadioBoxGroup} from "../../global/components/form/selectBoxGroup/selectBoxGroup";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import {CheckBox} from "../../global/components/form/checkbox/checkBox";
import {RadioBox} from "../../global/components/form/radiobox/radioBox";
import {BasicCheckBox} from "../../global/components/form/checkbox/basicCheckBox";
import {LeRule} from "./rule/LeRule";
import {ReportUploadModule} from "../pages/activity/reportActivity/basicInfo/ReportUploadModule";
import {ImgUploader} from "../modules/upload/UploadModule";
import {LePickModule} from "../modules/pickModule/LePickModule";
import {TextAreaInput} from "../../global/components/form/text/TextInput";
import {LeEditQrCode} from "../modules/edit/LeEditQrCode";

export interface IFormFactoryPara extends IComponentPara {
    cond?: ILE_Form[], // 用于构造formCom
    isTitle?: boolean,
    fields?: ILE_Field[];
    defaultData?: obj;
    isWrapLine?: boolean; // 是否换行，默认是
}

export abstract class FormFactory extends Component {
    protected abstract selectParaInit(cond: ILE_Form, para: IFormFactoryPara): obj // 初始化FormCom控件额外参数
    protected forms: FormCom[];
    protected isTitle: boolean;
    protected fields: ILE_Field[];
    protected defaultData: obj;
    protected isWrapLine: boolean;

    constructor(para: IFormFactoryPara) {
        // console.log(para);
        super(para);
        this.isWrapLine = tools.isEmpty(para.isWrapLine) ? true : para.isWrapLine;
        this.fields = para.fields;
        // console.log(para.fields);
        this.defaultData = para.defaultData || {};
        this.isTitle = para.isTitle || false;
        this.__initForms(para);
    }

    // 初始化FormCom控件
    private __initForms(para: IFormFactoryPara) {
        let cond: ILE_Form[] = para.cond || [];
        this.forms = [];
        tools.isNotEmpty(this.wrapper) && d.append(this.wrapper, <div className="form-com-wrapper">
            {cond.map(c => {
                let com,
                    isMulti = c.multi || false,
                    props = Object.assign({
                        custom: c,
                        showFlag: true,
                        placeholder: this.isTitle ? '' : c.caption,
                    }, this.selectParaInit(c, para) || {}),
                    isBlock = false,
                    fieldName = c.fieldName,
                    titleField = c.titleField || fieldName;

                switch (c.type) {
                    case 'img':
                        com = <ImgUploader remark="支持图片小于1M" isMulti={isMulti} field={fieldName}
                                           nameField={fieldName} size={4 * 1024 * 1024} {...props}/>;
                        break;
                    case 'file':
                        com = <ReportUploadModule isShowImg={false} content="选择文件" title="图片" field={fieldName}
                                                  nameField={fieldName} remarkClassName="" {...props}/>;
                        break;
                    case 'richText':
                        break;
                    case 'selectText':
                        com = <SelectInput multi={isMulti} clickType={0} readonly={true}
                            data={tools.isEmpty(c.data) ? [] : c.data.map((res) => {
                                let data = FormFactory.formatData(res);
                                return {text: data.title, value: data.value};
                            })}
                            ajax={tools.isEmpty(c.link) ? void 0 : {
                                fun: (url, val, callback) => {
                                    this.ajaxData(c.link, titleField, c.relateFields).then((data) => {
                                        typeof callback === 'function' && callback(data.sort());
                                    });
                                }
                            }} {...props}/>;
                        break;
                    case 'date':
                        com = <Datetime format="yyyy-MM-dd" {...props}/>;
                        break;
                    case 'datetime':
                        com = <Datetime format="yyyy-MM-dd HH:mm:ss" {...props}/>;
                        break;
                    case 'tag':
                        let BoxGroup: typeof BasicBoxGroup = isMulti ? CheckBoxGroup : RadioBoxGroup,
                            Box: typeof BasicCheckBox = isMulti ? CheckBox : RadioBox;
                        com = <BoxGroup size="middle" type="button" {...props}>
                            {tools.isEmpty(c.data) ? [] : tools.toArray(c.data).map((res) => {
                                let data = FormFactory.formatData(res);
                                return <Box value={data.value} text={data.title}/>
                            })}
                        </BoxGroup>;
                        this.ajaxData(c.link, titleField, c.relateFields).then((response) => {

                        });
                        isBlock = true;
                        break;
                    case 'selectBox': {
                        let BoxGroup: typeof BasicBoxGroup = isMulti ? CheckBoxGroup : RadioBoxGroup,
                            Box: typeof BasicCheckBox = isMulti ? CheckBox : RadioBox;
                        com = <BoxGroup size="middle" {...props}>
                            {tools.isEmpty(c.data) ? [] : tools.toArray(c.data).map((res) => {
                                let data = FormFactory.formatData(res);
                                return <Box name={data.value} text={data.title}/>
                            })}
                        </BoxGroup>;
                        this.ajaxData(c.link, titleField, c.relateFields).then((response) => {

                        });
                    }
                        break;
                    case 'textarea':
                        com = <TextAreaInput {...props}/>;
                        break;
                    case 'pick':
                        com = <LePickModule ui={props.ui} fields={para.fields} {...props}/>;
                        break;
                    case 'number':
                        com = <NumInput defaultNum={0} {...props}/>;
                        break;
                    case 'qrcode':
                        com = <LeEditQrCode {...props}/>;
                        break;
                    case 'text':
                    default:
                        com = <TextInput {...props}/>;
                }

                if(fieldName in this.defaultData){
                    tools.isNotEmpty(this.defaultData[fieldName])
                    && com.set(this.defaultData[fieldName]);
                }

                this.forms.push(com);
                return props.showFlag ? <div style={((isBlock || this.isWrapLine) ? '' : 'display: inline-block')}
                                             className={"form-com-item "}>
                    {this.isTitle ? <div className="form-com-title">{c.caption + '：'}</div> : null}
                    {com}
                    {tools.isNotEmpty(c.tip) ? <div className="form-com-tip">{c.tip}</div> : null}
                </div> : com.wrapper && d.remove(com.wrapper);
            })}
        </div>);
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
                    let body = response.data,
                        dataList = body ? body.data : [],
                        result = [];
                    dataList.forEach((item) => {
                        let json: obj = {};
                        for(let key in item){
                            json[key] = item[key];
                            if(key === fieldName){
                                json.text = item[key];
                            }
                            if(key === relateName){
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

    protected static formatData(data: { title: string, value: string } | string): { title: string, value: string } {
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
        super.destroy();
    }
}