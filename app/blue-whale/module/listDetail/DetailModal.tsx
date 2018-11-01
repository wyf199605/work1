/// <amd-module name="DetailModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FormCom} from "../../../global/components/form/basic";
import {BwRule} from "../../common/rule/BwRule";
import {EditModule} from "../edit/editModule";
import {Datetime} from "../../../global/components/form/datetime/datetime";
import {PickModule} from "../edit/pickModule";
import {RichTextMb} from "../../../global/components/form/richText/richTextMb";
import {RichText} from "../../../global/components/form/richText/richText";
import {TextInput} from "../../../global/components/form/text/text";
import {Toggle} from "../../../global/components/form/toggle/toggle";
import AssignModule from "../edit/assignModule/assignModule";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {RichTextModal} from "../../../global/components/form/richTextModal/richTextModal";
import {Virtual} from "../../../global/components/form/virtual";
import {AssignTextModule} from "../edit/assignModule/assignTextModule";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {DatetimeMb} from "../../../global/components/form/datetime/datetimeInput.mb";
import {LookupModule} from "../edit/lookupModule";
import {Validate, ValidateResult, ValidateRule} from "../../../global/utils/validate";
import tools = G.tools;
import CONF = BW.CONF;
import {UploadImages} from "../uploadModule/uploadImages";
import {Accessory} from "../uploadModule/accessory";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {ListItemDetail} from "./ListItemDetail";

interface ComInitFun {
    (para: ComInitP): FormCom
}

interface IDetailModal extends EditPagePara {
    defaultData?: obj;
    button?:R_Button;
    listDetail?:ListItemDetail;
}
interface NewFormEdit{
    fields? : ComInitP[],
    auto? : boolean; //是否自动初始化dom
    type? : string;
    container?: HTMLElement;
    defaultData?:obj;
}

export class DetailModal {
    private editModule: NewMBForm;
    constructor(private para: IDetailModal) {
        document.body.classList.add('edit-overflow-hidden');
        let emPara: NewFormEdit = {fields: [],defaultData:this.para.listDetail.defaultData};
        let formWrapper = <div className="form-wrapper"/>,
            fields = para.fm.fields || [];
        for (let i = 0, len = fields.length; i < len; i++) {
            let f = fields[i];
            if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && f.noAdd) || (this.para.uiType == 'update' && f.noShow) || (this.para.uiType == 'flow' && f.noShow) || (this.para.uiType == 'detail' && f.noShow)) {
                continue;
            }
            let field = {
                dom: this.createFormWrapper(f, formWrapper),
                field: f
            };
            emPara.fields.push(field);
            if ((['insert', 'associate'].indexOf(para.uiType) > -1 ? field.field.noModify : field.field.noEdit) && (['file', 'img'].indexOf(field.field.comType) < 0)) {
                field.dom && field.dom.classList.add('disabled');
            }
        }
        let modal = new Modal({
            isMb: true,
            className: 'detail-modal',
            isModal: true,
            isOnceDestroy: true,
            body: formWrapper,
            footer: {
                leftPanel: [{
                    content: '取消',
                    className: 'modal-btn edit-cancel',
                    onClick: () => {
                        Modal.confirm({
                            msg: '确定取消编辑吗?',
                            callback: (flag) => {
                                flag && (modal.isShow = false,this.destroy());
                            }
                        })
                    }
                }],
                rightPanel: [{
                    content: '确定',
                    className: 'modal-btn eidt-confirm',
                    onClick: () => {
                        let data = this.dataGet();
                        console.log(data);
                        if (this.validate(data)){
                            // 验证成功
                            // let button = this.para.button;
                            // button.refresh = 1;
                            // ButtonAction.get().clickHandle(button,data,() => {
                            //     switch (button.subType){
                            //         case 'insert_save':{
                            //             this.para.listDetail.changePage(this.para.listDetail.totalNumber + 1);
                            //         }
                            //         break;
                            //         case 'update_save':{
                            //             this.para.listDetail.changePage(this.para.listDetail.currentPage);
                            //         }
                            //         break;
                            //     }
                            //     modal.isShow = false;
                            //     this.destroy();
                            // });
                        }
                    }
                }]
            }
        });
        this.editModule = new NewMBForm(emPara);
        tools.isNotEmpty(para.defaultData) && this.editModule.set(para.defaultData);
    }

    private createFormWrapper(field: R_Field, wrapper: HTMLElement): HTMLElement {
        let span = null;
        if (field.comType == 'tagsInput') {
            span = <span class="mui-icon mui-icon-plus" data-action="picker"/>;
        }
        if (field.comType === 'file' || field.comType === 'img') {
            return wrapper;
        } else {
            let elementType = tools.isNotEmpty(field.elementType) ? field.elementType : '';
            let formGroupWrapper = <div className="detail-cell" data-name={field.name}
                                        data-type={field.comType} data-element-type={elementType}>
                <div className="detail-cell-title" data-input-type={field.comType}>{field.caption}</div>
            </div>;
            wrapper.appendChild(formGroupWrapper);
            return formGroupWrapper
        }
    }
    // 获取数据
    private dataGet() {
        let data = this.editModule.get();
        this.para.fm.fields.forEach(field => {
            let name = field.name,
                val = field.atrrs.defaultValue;
            if (field.noEdit && !tools.isEmpty(val)) {
                data[name.toLowerCase()] = val;
            }
        });
        return data;
    }
    // 验证
    private validate(pageData?: obj) {
        let result = this.editModule.validate.start();
        if (tools.isNotEmpty(result)) {
            for (let key in result) {
                Modal.alert(result[key].errMsg);
                return false;
            }
        } else {
            return true;
        }
    }
    destroy() {
        document.body.classList.remove('edit-overflow-hidden')
        this.para.fm.fields.forEach(f => {
            this.editModule.destroy(f.name);
        });
        this.editModule = null;
        this.para = null;

    }
}

export class NewMBForm {
    private coms: objOf<FormCom> = {};
    private comsExtraData: objOf<obj> = {};
    private nameFields: objOf<ComInitP> = {};
    private ajax = new BwRule.Ajax();
    get assignPromise() {
        return this.ajax.promise;
    }
    constructor(private para: NewFormEdit) {
        if (Array.isArray(para.fields)) {
            para.fields.forEach((f) => {
                this.nameFields[f.field.name] = f;
            });
            if (typeof para.auto === 'undefined' || para.auto) {
                for (let f of para.fields) {
                    this.init(f.field.name);
                }
            }
        }
    }
    getDom(name: string) {
        return this.coms[name];
    }
    /**
     * 外部初始化调用
     * @param name
     * @param p
     */
    public init(name: string, p?: ComInitP) {
        let f = this.nameFields[name];
        if (f || p) {
            if (p && p.field) {
                f = this.nameFields[name] = p;
            }

            // if(!this.coms[name]){
            this.coms[name] = this.initFactory(f.field.comType, f);
            // }else{

            // }
        }

        return this.coms[name];
    }
    private pickOnGet(cip: ComInitP, dataArr: obj[], otherField: string) {
        let name = cip.field.name,
            fieldNames = otherField ? otherField.split(',') : [];

        dataArr.forEach((data) => {
            for (let key in data) {
                if (!this.comsExtraData[name]) {
                    this.comsExtraData[name] = {};
                }
                fieldNames && fieldNames.forEach(f => {
                    if (f === key) {
                        this.comsExtraData[name][key] = data[key];
                    }
                });
            }
        });
        if (this.comsExtraData[name] && cip.onExtra) {
            cip.onExtra(tools.obj.copy(this.comsExtraData[name]), fieldNames);
        }

        this.assign.checkAssign(this.comsExtraData[name], cip.onExtra);
    }
    private comTnit: objOf<ComInitFun> = {
        pickInput: (p) => {
            return new PickModule({
                container: p.dom,
                field: p.field,
                data: p.data,
                dataGet: () => p.data ? p.data : this.get(),
                onGetData: (dataArr: obj[], otherField: string) => {
                    this.pickOnGet(p, dataArr, otherField);
                }
            });
        },

        tagsInput: (p) => {
            if (this.para.type === 'table') {
                return this.comTnit['assignText'](p);
            } else {
                let sepValue = ';';
                return new AssignModule({
                    data: p.data,
                    container: p.dom,
                    name: p.field.name,
                    pickerUrl: p.field.dataAddr ? CONF.siteUrl + BwRule.reqAddr(p.field.dataAddr) : '',
                    ajaxUrl: p.field.assignAddr ? CONF.siteUrl + BwRule.reqAddr(p.field.assignAddr) : '',
                    multi: true, //field.multiValue,
                    sepValue: sepValue,
                    onSet: this.getAssignSetHandler(p.field),
                    onGetData: (dataArr: obj[], otherField: string) => {
                        this.pickOnGet(p, dataArr, otherField);
                    }
                });
            }
        },
        assignText: (p) => {
            return new AssignTextModule({
                data: p.data,
                container: p.dom,
                name: p.field.name,
                pickerUrl: p.field.dataAddr ? CONF.siteUrl + BwRule.reqAddr(p.field.dataAddr) : '',
                ajaxUrl: p.field.assignAddr ? CONF.siteUrl + BwRule.reqAddr(p.field.assignAddr) : '',
                onSet: this.getAssignSetHandler(p.field),
                onGetData: (dataArr: obj[], otherField: string) => {
                    this.pickOnGet(p, dataArr, otherField);
                }
            });
        },

        file: (p): FormCom => {
            let com = new Accessory({
                nameField: p.field.name,
                container: p.dom,
                uploadUrl: BW.CONF.ajaxUrl.fileUpload,
                field: p.field,
                pageData:this.para.defaultData,
                onComplete: (response) => {
                    let data = response.data,
                        type = p.field.dataType || p.field.atrrs.dataType;
                    // fileId 值加入额外数据中
                    if (type === '43'){
                        let upperKeyData = {};
                        for (let field in data) {
                            let {key, value} = data[field];
                            upperKeyData[key.toLocaleUpperCase()] = tools.str.toEmpty(value);
                        }
                        p.onExtra && p.onExtra(upperKeyData, Object.keys(upperKeyData));
                        this.comsExtraData[p.field.name] = {};
                        for (let name in upperKeyData) {
                            if (this.coms[name]) {
                                this.set({[name]: upperKeyData[name]});
                            } else {
                                this.comsExtraData[p.field.name][name] = data[name];
                            }
                        }
                    }
                },
                onDelete(){
                    this.comsExtraData[p.field.name] = {};
                }
            });
            return com;
        },

        richText: (p) => {
            let Rich = tools.isMb ? RichTextMb : RichText;
            return new Rich({
                container: p.dom
            });
        },

        richTextInput: (p) => {
            return new RichTextModal({
                container: p.dom,
            });
        },

        text: (p) => {
            return new TextInput({
                container: p.dom
            });
        },

        selectInput: (p) => {
            if (p.field.elementType === 'lookup') {
                return new LookupModule({
                    container: p.dom,
                    field: p.field,
                    rowData: p.data,
                    onExtra: (item) => {
                        if (item) {
                            setTimeout(() => {
                                let data = {
                                    [p.field.name]: item.text,
                                    [p.field.lookUpKeyField]: item.value
                                };
                                p.onExtra(data, [p.field.lookUpKeyField])
                            }, 100)
                        }
                    }
                })
            } else {
                let ajaxFun = (url: string, value: string, cb: Function) => {
                    BwRule.Ajax.fetch(url, {
                        needGps: p.field.dataAddr.needGps
                    }).then(({response}) => {
                        let fields = [];
                        if (response.data[0]) {
                            fields = Object.keys(response.data[0]);
                        }
                        let options = response.data.map(data => {
                            // id name 都添加到条件
                            return {
                                value: data[p.field.name],
                                text: fields.map((key) => data[key]).join(','),
                            };
                        });
                        cb(options);
                    }).finally(() => {
                        cb();
                    });
                };

                let valueList = p.field.atrrs.valueLists ? p.field.atrrs.valueLists.split(/,|;/) : null,
                    comData = Array.isArray(valueList) ? valueList : null,
                    ajax = p.field.dataAddr ? {
                        fun: ajaxFun,
                        url: CONF.siteUrl + BwRule.reqAddr(p.field.dataAddr, p.data)
                    } : null;

                return new (tools.isMb ? SelectInputMb : SelectInput)({
                    container: p.dom,
                    data: comData,
                    ajax,
                    useInputVal: true

                    // readonly: field.noEdit
                });
            }
        },

        virtual: (p) => {
            return new Virtual();
        },

        toggle: (p) => {
            if (this.para.type === 'table') {
                return new SelectInput({
                    container: p.dom,
                    data: [
                        {value: '1', text: '是'},
                        {value: '0', text: '否'}
                    ]
                });
            } else {
                if (tools.isMb) {
                    return new Toggle({container: p.dom});
                } else {
                    return new CheckBox({container: p.dom});
                }
            }
        },

        datetime: (p) => {
            return new (tools.isMb ? DatetimeMb : Datetime)({
                container: p.dom,
                format: p.field.displayFormat
            });
        },

        // 流程引擎附件
        img: (p) => {
            return new UploadImages({
                container: p.dom,
                nameField: p.field.name,
                uploadUrl: BW.CONF.ajaxUrl.fileUpload,
                pageData:this.para.defaultData,
                field:p.field
            });
        }

    };
    static tableComTypeGet(type: string) {
        let map = {
            richText: 'richTextInput',
            // toggle : 'selectInput'
        };

        return type in map ? map[type] : type;
    }
    /**
     * 初始化控件工厂
     * @param type - 类型
     * @param initP
     * @return {FormCom}
     */
    private initFactory(type: string, initP?: ComInitP): FormCom {
        this.para.type === 'table' && (type = EditModule.tableComTypeGet(type));

        let field = initP ? initP.field : null;

        if (field) {
            if (field.multiPick && field.name === 'ELEMENTNAMELIST' || field.elementType === 'pick') {
                type = 'pickInput';
            } else if (field.elementType === 'value' || field.elementType === 'lookup' || field.atrrs.valueLists) {
                type = 'selectInput';
            }
        }

        if (!(type in this.comTnit)) {
            type = 'text';
        }

        if (!initP || !initP.dom) {
            type = 'virtual';
        }

        let com = this.comTnit[type](initP);
        this.assign.init(com, initP);

        return com;
    };
    protected assign = (() => {

        let init = (com: FormCom, p?: ComInitP) => {
            if (!p) {
                return;
            }
            let {field, data, onExtra} = p;
            if (field && (p.field.comType === 'tagsinput')) {
                return;
            }

            com.onSet = (val) => {
                // debugger;
                // setTimeout(() => {
                //     if(val == com.get()){
                //         return;
                //     }
                data = data || {};
                if (data[field.name] != val) {
                    assignSend(field, val, Object.assign({}, data, {[field.name]: val}), onExtra);
                }

                // }, 30);
            };
        };


        let assign2extra = (field: R_Field, assignData: objOf<any[]>) => {
            // assign 设置
            let sepValue = ';',
                selectFields = field.assignSelectFields,
                fieldName = field.name;
            // debugger;
            Array.isArray(selectFields) && selectFields.forEach((key) => {
                let data = assignData[key];
                if (key === fieldName) {
                    return;
                }

                if (this.coms[key]) {

                    this.set({[key]: data});

                } else {
                    //assign 值加入额外数据中
                    if (!this.comsExtraData[fieldName]) {
                        this.comsExtraData[fieldName] = {}
                    }
                    this.comsExtraData[fieldName][key] = data;
                }
            });
        };


        /**
         * 发送assign请求
         * @param {R_Field} field
         * @param val
         * @param {obj} data
         * @param {Function} onExtra
         */
        let assignSend = (field: R_Field, val, data: obj, onExtra: Function) => {
            if (tools.isEmpty(val) || tools.isEmpty(field.assignAddr)) {
                return;
            }
            this.ajax.fetch(CONF.siteUrl + BwRule.reqAddr(field.assignAddr, data), {
                cache: true,
            }).then(({response}) => {
                let resData = tools.keysVal(response, 'data', 0),
                    assignData = assignDataGet(val, resData);

                for (let key in assignData) {
                    assignData[key] = Array.isArray(assignData[key]) ? assignData[key].join(';') : ''
                }

                assign2extra(field, assignData);
                // debugger;
                onExtra && onExtra(assignData, field.assignSelectFields, true);
            })
        };


        let checkAssign = (data: obj, onExtra: Function) => {

            for (let fieldName in data) {
                let field = this.nameFields[fieldName];
                if (field && field.field && field.field.assignAddr) {
                    assignSend(field.field, data[fieldName], data, onExtra);
                }
            }
        };

        return {init, assign2extra, assignSend, checkAssign};

    })();
    private getAssignSetHandler(field: R_Field) {
        let sepValue = ';';

        return (assignData: objOf<any[]>) => {
            // assign 设置
            if (typeof assignData !== 'object') {
                return;
            }

            let selectFields = field.assignSelectFields;
            Array.isArray(selectFields) && selectFields.forEach((key) => {
                let data = assignData && Array.isArray(assignData[key]) ? assignData[key].join(sepValue) : '';

                if (this.coms[key]) {
                    if (key !== field.name) {
                        this.set({[key]: data});
                    }
                } else {
                    //assign 值加入额外数据中
                    if (!this.comsExtraData[field.name]) {
                        this.comsExtraData[field.name] = {}
                    }
                    this.comsExtraData[field.name][key] = data;
                }
            });
        }
    }
    /**
     * 设置值
     * @param data
     */
    public set(data: obj) {
        let coms = this.coms;
        for (let name in data) {
            if (!coms[name]) {
                //页面没有这个输入控件，则启用虚拟输入控件
                coms[name] = this.initFactory('virtual', this.nameFields[name]);
            }
            //给控件赋值
            coms[name].set(tools.str.toEmpty(data[name]));
        }
    }
    /**
     * 获取值
     * @param [name] - 指定返回某个控件的值
     * @return obj
     */
    public get(name?: string) {
        let pageData: obj = {},
            coms = this.coms,
            extras = this.comsExtraData;
        let allDateGet = (name: string) => {
            let extra = extras[name],
                dataObj = {[name]: coms[name].get()};
            // 字符串转数字
            for (let name in dataObj) {
                let field = (tools.keysVal(this.nameFields, name, 'field') as R_Field),
                    data = dataObj[name];
                if (!field) {
                    continue;
                }
                if (data && !isNaN(data) && BwRule.isNumber(field.dataType)) {
                    data = Number(data);
                }
                dataObj[name] = BwRule.maxValue(data, field.dataType, field.atrrs.maxValue);
            }
            return extra ? tools.obj.merge(extra, dataObj) : dataObj;
        };
        // 返回指定name的数据
        if (name) {
            return allDateGet(name);
        }
        // 返回所有数据
        for (let n in coms) {
            pageData = tools.obj.merge(pageData, allDateGet(n));
        }
        return pageData;
    }
    public validate = (() => {
        let v: Validate = null;
        let init = () => {
            if (v !== null) {
                return;
            }
            v = new Validate();
        };
        let ruleAdd = (field: R_Field) => {
            // 防止重复添加
            if (v.get(field.name)) {
                return;
            }
            let rules: ValidateRule[] = [];
            if (BwRule.isNumber(field.dataType)) {
                if (tools.isNotEmpty(field.caption)) {
                    rules.push({
                        rule: 'number',
                        title: field.caption
                    })
                } else {
                    rules.push({
                        rule: 'number'
                    })
                }
            }
            ['maxLength', 'maxValue', 'minLength', 'minValue', 'requieredFlag', 'regExp'].forEach(ruleName => {
                let ruleVal = field.atrrs[ruleName];
                if (!tools.isEmpty(ruleVal)) {
                    rules.push({
                        rule: ruleName,
                        value: ruleVal,
                    });
                }
            });
            v.add(field.name, rules);
        };
        let valid = (name: string, data?: any) => {
            let com = this.coms[name],
                f = this.nameFields[name];

            if (com && f) {
                ruleAdd(f.field);
                data = tools.isUndefined(data) ? this.get(f.field.name)[f.field.name] : data;
                return v.start({[name]: data});
            }
        };
        let start = (name?: string, data?: any) => {
            if (v === null) {
                init();
            }
            let result: ValidateResult = {};
            if (name) {
                result = valid(name, data);
            } else {
                this.para.fields.forEach(f => {
                    result = tools.obj.merge(valid(f.field.name), result);
                })
            }
            return result;
        };
        return {start};
    })();
    destroy(name: string) {
        if (this.coms[name]) {
            this.coms[name].destroy();
            this.comsExtraData[name] = null;
            delete this.coms[name];
        }
    }
}

function assignDataGet(data, resData): obj {
    let assignValueArr = {},
        assignData: obj = {};

    if (typeof resData !== 'object' || !resData) {
        return assignData;
    }

    let keyArr = Object.keys(resData);

    keyArr.forEach(key => {
        let data = resData[key];
        assignValueArr[key] = typeof data === 'string' ? data.split(';') : [data];
    });

    (typeof data === 'string' ? data.split(';') : [data]).forEach((v, i) => {
        if (tools.isEmpty(v)) {
            return;
        }
        // let assignD : obj = {};
        keyArr.forEach((key) => {
            if (!assignData[key]) {
                assignData[key] = [];
            }
            assignData[key].push(assignValueArr[key][i])
        });
    });

    return assignData;
}
