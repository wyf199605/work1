/// <amd-module name="EditModule"/>
import tools = G.tools;
import CONF = BW.CONF;
import sys = BW.sys;
import AssignModule from "assignModule/assignModule";
import {AssignTextModule} from "./assignModule/assignTextModule";
import {PickModule} from "./pickModule";
import {FormCom} from "../../../global/components/form/basic";
import {TextInput} from "../../../global/components/form/text/text";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {Virtual} from "../../../global/components/form/virtual";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {Datetime} from "../../../global/components/form/datetime/datetime";
import {RichText} from "../../../global/components/form/richText/richText";
import {RichTextMb} from "../../../global/components/form/richText/richTextMb";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {DatetimeMb} from "../../../global/components/form/datetime/datetimeInput.mb";
import {Toggle} from "../../../global/components/form/toggle/toggle";
import {LookupModule} from "./lookupModule";
import {Validate, ValidateResult, ValidateRule} from "../../../global/utils/validate";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import {RichTextModal} from "../../../global/components/form/richTextModal/richTextModal";
import {BwUploader} from "../uploadModule/bwUploader";
import {UploadImages} from "../uploadModule/uploadImages";
import {Accessory} from "../uploadModule/accessory";
import {TextAreaInput} from "../../../global/components/form/text/TextInput";

interface ComInitFun {
    (para: ComInitP): FormCom
}

export class EditModule {
    private coms: objOf<FormCom> = {};
    private comsExtraData: objOf<obj> = {};

    private nameFields: objOf<ComInitP> = {};

    private ajax = new BwRule.Ajax();
    protected defaultData: obj = {};

    get assignPromise() {
        return this.ajax.promise;
    }

    constructor(private para: EditModulePara) {
        this.defaultData = para.defaultData || {};
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
        if (tools.isEmpty(dataArr)) {
            for (let key in this.comsExtraData[name]) {
                this.comsExtraData[name][key] = '';
            }
        }
        if (this.comsExtraData[name] && cip.onExtra) {
            cip.onExtra(tools.obj.copy(this.comsExtraData[name]), fieldNames, false, true, true);
        }

        this.assign.checkAssign(this.comsExtraData[name], cip.onExtra);
    }

    private comTnit: objOf<ComInitFun> = {
        image: (p) => {
            return new UploadImages({
                container: p.dom,
                nameField: p.field.name,
                uploadUrl: BW.CONF.ajaxUrl.fileUpload,
                pageData: this.defaultData,
                field: p.field,
                // unique: tools.isNotEmpty(p.data) ?  p.data[p.field.name] : ''
            })
        },

        pickInput: (p) => {
            // console.log(dom,field,6)
            return new PickModule({
                custom: p.field,
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
                    custom: p.field,
                    name: p.field.name,
                    pickerUrl: p.field.dataAddr ? CONF.siteUrl + BwRule.reqAddr(p.field.dataAddr) : '',
                    ajaxUrl: p.field.assignAddr ? CONF.siteUrl + BwRule.reqAddr(p.field.assignAddr) : '',
                    multi: p.field.atrrs && p.field.atrrs.multiValueFlag ? p.field.atrrs.multiValueFlag === 1 : true, //field.multiValue,
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
                custom: p.field,
                name: p.field.name,
                pickerUrl: p.field.dataAddr ? CONF.siteUrl + BwRule.reqAddr(p.field.dataAddr) : '',
                ajaxUrl: p.field.assignAddr ? CONF.siteUrl + BwRule.reqAddr(p.field.assignAddr) : '',
                onSet: this.getAssignSetHandler(p.field),
                onGetData: (dataArr: obj[], otherField: string) => {
                    this.pickOnGet(p, dataArr, otherField);
                }
            });
        },

        newFile: (p): FormCom => {
            let upperKeyData = {};
            return new Accessory({
                nameField: p.field.name,
                container: p.dom,
                uploadUrl: BW.CONF.ajaxUrl.fileUpload,
                field: p.field,
                pageData: this.defaultData,
                // uniques:tools.isNotEmpty(p.data) ?  p.data[p.field.name] : '',
                onComplete: (response) => {
                    let data = response.data,
                        type = p.field.dataType || p.field.atrrs.dataType;
                    // fileId 值加入额外数据中
                    if (type === '43') {
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
                onDelete: () => {
                    if (tools.isNotEmpty(upperKeyData)) {
                        for (let name in upperKeyData) {
                            if (this.coms[name]) {
                                this.set({[name]: ''});
                            } else {
                                this.comsExtraData[p.field.name][name] = '';
                            }
                        }
                    }
                }
            });
        },

        file: (p): FormCom => {
            let com = new BwUploader({
                nameField: p.field.name,
                custom: p.field,
                container: p.dom,
                text: '点击上传',
                isChangeText: true,
                uploadUrl: BW.CONF.ajaxUrl.fileUpload,
                onSuccess: (response) => {
                    let data = response.data;
                    // if(!this.para.fields.some(f => f.field.name.toLowerCase() === data['md5Field'].key.toLowerCase())) {
                    //     Modal.alert('无法找到附件，附件是否进行过改造');
                    //     com.com.text = '';
                    //     return;
                    // }

                    //fileId 值加入额外数据中
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
            });
            return com;
        },

        richText: (p) => {
            let Rich = sys.isMb ? RichTextMb : RichText;
            return new Rich({
                container: p.dom,
                custom: p.field,
            });
        },

        richTextInput: (p) => {
            return new RichTextModal({
                container: p.dom,
                custom: p.field,
            });
        },

        text: (p) => {
            return new TextInput({
                container: p.dom,
                custom: p.field,
                // readonly: field.noEdit
            });
        },

        selectInput: (p) => {
            if (p.field.elementType === 'lookup') {
                return new LookupModule({
                    container: p.dom,
                    field: p.field,
                    custom: p.field,
                    rowData: p.data,
                    onExtra: (item) => {
                        if (item) {
                            setTimeout(() => {
                                let data = {
                                    [p.field.name]: item.text,
                                    [p.field.lookUpKeyField]: item.value
                                };
                                p.onExtra && p.onExtra(data, [p.field.lookUpKeyField])
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

                return new (sys.isMb ? SelectInputMb : SelectInput)({
                    container: p.dom,
                    data: comData,
                    ajax,
                    custom: p.field,
                    useInputVal: true

                    // readonly: field.noEdit
                });
            }
        },

        virtual: (p) => {
            return new Virtual({
                custom: p && p.field
            });
        },

        toggle: (p) => {
            if (this.para.type === 'table') {
                return new SelectInput({
                    container: p.dom,
                    custom: p.field,
                    data: [
                        {value: '1', text: '是'},
                        {value: '0', text: '否'}
                    ]
                });
            } else {
                if (sys.isMb) {
                    return new Toggle({container: p.dom, custom: p.field});
                } else {
                    return new CheckBox({container: p.dom, custom: p.field});
                }
            }
        },

        datetime: (p) => {
            return new (sys.isMb ? DatetimeMb : Datetime)({
                container: p.dom,
                custom: p.field,
                format: p.field.displayFormat,
                // readonly: field.noEdit
            });
        },

        textarea: (p) => {
            return new TextAreaInput({
                container: p.dom,
                custom: p.field
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
            } else if (BwRule.isImage(field.dataType) || BwRule.isImage(field.atrrs.dataType)) {
                type = 'image';
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
        let assignData: obj = {};

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
                    assignData = Object.assign({}, data, assignData, {[field.name]: val});
                    assignSend(field, val, assignData, onExtra);
                }

                // }, 30);
            };
        };


        let assign2extra = (field: R_Field, assignData: objOf<any[]>) => {
            // assign 设置
            let selectFields = field.assignSelectFields,
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
                if (field.assignSelectFields) {
                    let assignData = {};
                    field.assignSelectFields.forEach((name) => {
                        assignData[name] = null;
                    });
                    onExtra && onExtra(assignData, field.assignSelectFields, false, false, true);
                }
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
                onExtra && onExtra(assignData, field.assignSelectFields, true, false, true);
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
                if (!this.nameFields[name]) {
                    this.nameFields[name] = null;
                }
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
            nameField = this.nameFields,
            extras = this.comsExtraData;

        let allDateGet = (name: string) => {
            let extra = extras[name],
                dataObj = {[name]: coms[name].get()};

            // 字符串转数字
            for (let name in dataObj) {
                let field = <R_Field>tools.keysVal(this.nameFields, name, 'field'),
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
        for (let name in nameField) {
            if (coms[name]) {
                pageData = tools.obj.merge(pageData, allDateGet(name));
            } else {
                pageData = tools.obj.merge(pageData, {[name]: this.defaultData[name] || ''});
            }
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

            // for(let name in this.nameFields){
            //     let field = this.nameFields[name].field;
            //     ruleAdd(field);
            // }
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

            ['maxLength', 'maxValue', 'minLength', 'minValue', 'requieredFlag', 'regExp', 'validChars'].forEach(ruleName => {
                let ruleVal = field.atrrs[ruleName];
                if (!tools.isEmpty(ruleVal)) {
                    rules.push({
                        rule: ruleName,
                        value: ruleVal,
                        title: field.caption,
                        errMsg: field.atrrs.inputHint || ''
                    });
                }
            });
            v.add(field.name, rules);
        };

        let valid = (name: string, data?: any) => {
            let com = this.coms[name],
                f = this.nameFields[name];

            if (f) {
                ruleAdd(f.field);
                data = tools.isUndefined(data) ? (com ? this.get(f.field.name)[f.field.name] : null) : data;
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

    static checkValue(field: R_Field, rowData: obj, clear: Function, name = field.name): Promise<CheckValueResult> {
        let chkAddr = field.chkAddr;
        // checkCols = field.chkAddr.varList.map(v => v.varName),
        // emptyCheckResult: CheckValueResult = {errors:[], okNames:[]};

        // for (let colName of checkCols){
        //     if(rowData[colName] === null || (typeof rowData[colName]) === 'undefined'){
        //         emptyCheckResult.errors.push({name: colName, msg: '不能为空'});
        //     }else{
        //         emptyCheckResult.okNames.push(colName)
        //     }
        // }

        return new Promise((resolve, reject) => {
            // if(emptyCheckResult.errors[0]) {
            //     resolve(emptyCheckResult);
            //     return;
            // }

            let {addr, data} = BwRule.reqAddrFull(chkAddr, rowData);

            // checkValue验证
            BwRule.Ajax.fetch(CONF.siteUrl + addr, {
                silent: true,
                type: 'POST',
                data: [data],
            }).then(({response}) => {
                let data = tools.keysVal(response, 'body', 'bodyList', 0),
                    {type, showText} = data || {type: '', showText: ''};

                if (type === 1) {
                    // Modal.alert(showText);
                    // errorStyle(showText);
                    Modal.confirm({
                        msg: showText,
                        callback: (flag: boolean) => {
                            if (!flag) {
                                clear();
                                reject();
                            } else {
                                resolve({
                                    okNames: chkAddr.varList.map(v => v.varName)
                                });
                            }
                        }
                    });
                } else {
                    resolve({
                        errors: [{name, msg: showText}],
                    });
                }

            }).catch(() => {
                resolve({
                    okNames: chkAddr.varList.map(v => v.varName)
                });
            })
        });
    }

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