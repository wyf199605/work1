/// <amd-module name="QueryBuilder"/>
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import sys = BW.sys;
import d = G.d;
import {SelectInput, ISelectInputPara} from "../../../global/components/form/selectInput/selectInput";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {TextInput} from "../../../global/components/form/text/text";
import {DatetimeMb} from "../../../global/components/form/datetime/datetimeInput.mb";
import {Datetime, IDatetimePara} from "../../../global/components/form/datetime/datetime";
import {DropDown} from "../../../global/components/ui/dropdown/dropdown";
import {NumInput} from "../../../global/components/form/numInput/numInput";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {FormCom} from "../../../global/components/form/basic";
import {Modal} from 'global/components/feedback/modal/Modal';
import {Picker, PickerList} from "../../../global/components/ui/picker/picker";

interface QueryComs {
    field?: SelectInput;
    operator?: SelectInput; //
    not?: CheckBox;
    input1?: TextInput;
    input2?: TextInput;
    andOr?: CheckBox;
}

interface QueryDisplayControl {
    drop?: boolean;
    input1?: boolean;
    input2?: boolean;
    readonly?: boolean;
    placeholder?: string;
    inputType?: 'select' | 'text' | 'datetime' | 'bool' | 'scan'
}

interface QueryBuilderPara{
    queryConfigs: QueryConf[], // 查询字段名、值等一些配置，后台数据直接传入
    queryName?: string, // 联动查询时需要的参数名
    tpl?: () => HTMLElement, // 必须在tpl中包含data-type属性的div, 值有:field | not | operator | input1 | input2
    resultDom: HTMLElement, // 查询条件容器
    setting: QueryParam  // 默认值
    atVarDataGet?(): obj;
    isTransCase?(): boolean;
    on2dScan?(code: string):void;
}

let dateRange = tools.date.range;
const shortDateOpts : ListItem[] = [
    {text: '今天', value: dateRange.today()},
    {text: '昨天', value: dateRange.yesterday()},
    {text: '本周', value: dateRange.thisWeek()},
    {text: '上周', value: dateRange.lastWeek()},
    {text: '本月', value: dateRange.thisMonth()},
    {text: '上月', value: dateRange.lastMonth()},
    {text: '本季度', value: dateRange.thisSeason()},
    {text: '上季度', value: dateRange.lastSeason()},
    {text: '今年', value: dateRange.thisYear()},
    {text: '去年', value: dateRange.lastYear()}
];
/**
 * 控件转化工厂
 * @param {TextInput} com - 原来的控件 null为没有
 * @param {obj} para - 控件参数
 * @param {string} comType - 需要转成的控件类型
 * @param {HTMLElement} container - 初始化控件的dom
 * @param {boolean} isMb
 * @return {TextInput}
 */
function inputTransFactory(com: TextInput, para: obj, comType: string, container:HTMLElement, isMb) {
    switch (comType) {
        case 'datetime' :
            // if (com instanceof Datetime) {
            //     com.format((para as IDatetimePara).format);
            // } else {
            reNew(isMb ? DatetimeMb : Datetime, para);
            // }
            break;

        case 'text':
            if ((com && com.constructor !== TextInput) || !(com instanceof TextInput)) {
                reNew(TextInput, para);
            }
            break;

        case 'select':
        case 'bool': // bool类用下拉框选择是否
            if (com instanceof SelectInput) {
                com.setPara(para as ISelectInputPara);
            } else {
                reNew(isMb ? SelectInputMb : SelectInput, para);
            }
            break;

        case 'number':
            if (com instanceof NumInput) {

            } else {
                reNew(NumInput, para);
            }
            break;
        default:
    }
    tools.isMb && com && (com.isScan = para && para.isScan);

    return com;


    function reNew(Constructor : typeof TextInput, para){
        com && com.destroy();
        para.container = container;
        com = new Constructor(para);
        com.on('paste', function(e:ClipboardEvent) {
            let text = e.clipboardData.getData('Text').replace(/\r\n/g, ',');
            com.set(text);
            e.preventDefault();
        });
        // com.set(value);
    }

}

function initShortData(com1:TextInput, com2 : TextInput){
    // 触发快捷选择时间的事件名

    let shortDateEvent = sys.isMb ? 'press' : 'contextmenu';
    let handler = function (e) {
        if(sys.isMb){
            let pick = <PickerList onSet={(option) => {
                    com1.set(option[0].value[0]);
                    com2.set(option[0].value[1]);
                }}>
                    <Picker optionData={shortDateOpts}/>
                </PickerList>
            // Picker.show(shortDateOpts, function (option) {
            //
            //     com1.set(option[0].value[0]);
            //     com2.set(option[0].value[1]);
            // })
        }else{
            e.preventDefault();

            let shortDatePick = new DropDown({
                el: this,
                data: shortDateOpts,
                onSelect(item) {
                    com1.set(item.value[0]);
                    com2.set(item.value[1]);
                    shortDatePick.destroy();
                },
            });
            shortDatePick.showList();
        }

    };

    d.on(com1.wrapper, shortDateEvent, handler);
    d.on(com2.wrapper, shortDateEvent, handler);
}

export class QueryBuilder {
    /**
     * 删除数组元素时会保留数组长度，所以用rowsLen 和 rowsIndex 来区分长度和最大下标
     */
    protected rowsCom : QueryComs[] = [];
    protected rowsLen = 0; // 当前条数
    protected rowsIndex = 0;// 当前最大数组下标

    // 不同的实例独立的数据
    // 字段名选项
    protected fieldOptions : ListItem[];

    // protected fieldConfigs : objOf<QueryConf>;

    protected queryConfigs: QueryConf[];

    /**
     *
     * @param configs
     * @return {PickerOption[]}
     */
    private static config2Options(configs: QueryConf[]): ListItem[] {
        // console.log(configs);
        return configs.map(function (conf) {
            return {
                text: conf.caption,
                value: conf.field_name
            };
        });
    }

    /**
     *
     */
    constructor(protected para : QueryBuilderPara) {

        let self = this;

        if(!para.tpl){
            para.tpl = tplGet;
        }

        this.queryConfigs = para.queryConfigs;

        // 配置得出字段名选项
        self.fieldOptions = QueryBuilder.config2Options(this.queryConfigs);

        this.initSettings();

        if(!this.rowsCom[0]){
            this.rowAdd();
        }

        d.on(para.resultDom, 'click', '[data-action]', function () {
            switch (this.dataset.action) {
                case 'add':
                    self.rowAdd();
                    break;
                case 'del':
                    // 最少要留一条不让删除

                    if(self.rowsLen > 1){
                        let index = parseInt(d.closest(this.parentElement, '[data-index]').dataset.index);
                        self.rowDel(index);
                    }else{
                        Modal.toast('至少需要一个条件');
                    }
                    break;
            }
        });
    }

    private ajax = new BwRule.Ajax();

    /**
     * 初始化默认值
     */
    protected initSettings(){
        let setting = this.para.setting;
        if(!setting || !setting.params || !setting.params[0]){return;}

        setting.params.forEach(p => {

            if(!this.confGetByFieldName(p.field)){
                return;
            }

            this.rowAdd(p);
            let lastCom = this.rowsCom[this.rowsIndex - 1];

            lastCom.not.set(p.not);
            lastCom.operator.set(p.op);
            lastCom.andOr.set(p.andOr);
            Array.isArray(p.values) && p.values.forEach((v, i) => {
                switch (p.op){
                    case 3 :case 4 :case 8 : case 9 :
                        i ++;
                        break;
                }
                lastCom[`input${i + 1}`] && lastCom[`input${i + 1}`].set(v);
            });
        });
    }

    // 新增时默认值
    protected defaultParamGet(): QueryParam{
        let selectedFields = this.rowsCom.map((com) => {
                return com.field.get() as string
            }),
            confs = this.queryConfigs;

        // 找到没有被选择过的字段
        for(let c of confs){
            if(selectedFields.indexOf(c.field_name) === -1){
                return {
                    field: c.field_name,
                    not: false,
                    andOr: true
                }
            }
        }

        return {
            field: confs[0].field_name,
            not: false,
            andOr: true
        }
    };


    protected rowDel(index : number){
        let coms = this.rowsCom[index];
        if(coms){
            tools.obj.toArr(coms).forEach((c : TextInput) => c.destroy());

            coms = null;

            // 保留数组下标，以免更新dom中的data-index
            delete this.rowsCom[index];

            d.remove(d.query(`:scope > [data-index="${index}"]`, this.para.resultDom));

            this.rowsLen --;
        }
    }

    /**
     * 添加一行,设置默认值
     * @param {QueryParam} param
     */
    public rowAdd(param : QueryParam = this.defaultParamGet()){
        let lastRow = this.rowCreate(this.rowsIndex);
        if(lastRow){

            lastRow.field.set(param.field);
            lastRow.not.set(param.not);
            lastRow.andOr.set(param.andOr);

            this.rowsIndex ++;
            this.rowsLen ++;
        }
    }

    /**
     * 创建行
     * @return {QueryComs}
     */
    protected rowCreate(index : number){
        let row = this.para.tpl(),
            coms : QueryComs = {};

        row.dataset.index = index.toString();

        d.queryAll('[data-type]', row).forEach((container) => {
            let type = container.dataset.type;
            coms[type] = this.rowInitFactory[type](container, index) as FormCom;
        });

        if(coms){
            this.rowsCom.push(coms);
            d.append(this.para.resultDom, row);
        }
        return coms;
    }

    /**
     * 初始化行的工厂
     */
    protected rowInitFactory = (()  => {
        let field = (dom : HTMLElement, rowIndex : number) => {
            let para = {
                clickType : 0,
                readonly : true,
                data : this.fieldOptions,
                onSet : (item, index) => {
                    this.fieldSet(index, this.rowsCom[rowIndex]);
                }
            };
            return inputTransFactory(null, para, 'select', dom, sys.isMb );

        };

        let not = (dom : HTMLElement, rowIndex : number) => {
            return new CheckBox({
                container : dom,
                text: tools.isPc ? '不' : ''
                // ICustomCheck: {}

            })
        };

        let andOr = (dom: HTMLElement, rowIndex: number) => {

            return new CheckBox({
                container : dom,
                onSet: (isChecked) => {
                    let rowDom = d.closest(dom, '[data-index]');
                    if(rowDom){
                        rowDom.classList[isChecked ? 'remove' : 'add']('orCondition');
                    }
                }
            })
        };

        let operator = (dom : HTMLElement, rowIndex : number) => {
            let para = {
                clickType : 0,
                readonly: true,
                data: BwRule.QUERY_OP,
                onSet: (item, index) => {
                    this.operateSet(index, this.rowsCom[rowIndex]);
                }
            };
            return inputTransFactory(null, para,'select', dom, sys.isMb );
        };

        let input1 = function (dom : HTMLElement, rowIndex : number) {
            return null;
        };

        return {field, not, operator, input1, input2 : input1, andOr}
    })();

    /**
     * 设置字段框
     * @param fieldIndex
     * @param coms
     */
    protected fieldSet(fieldIndex : number, coms: QueryComs){
        let strNotShowIndex = null, // [0,6,7,8], //[1,2,3,4,5]
            numNotShowIndex = [0,1,2,3,4,5,6,8], //[7]

            conf = this.queryConfigs[fieldIndex],
            opIndex = BwRule.isTime(conf.atrrs.dataType) ? 5 : 0,
            control = QueryBuilder.displayControl(conf);

        coms.operator.showItems(BwRule.isNumber(conf.atrrs.dataType) ? numNotShowIndex : strNotShowIndex);

        coms.operator.set(BwRule.QUERY_OP[opIndex].value);

        this.domDisplayMethod(control, coms);
    }


    /**
     * 设置操作符框
     * @param fieldIndex
     * @param coms
     */
    protected operateSet(fieldIndex : number, coms: QueryComs){
        let control : QueryDisplayControl = {},
            op = coms.operator.get();

        // 是否出现第一个选择框
    /*   control.input1 = op !== 10;

        // 是否出现第二个选择框
        control.input2 = op === 7; // 7:between, 8:in*/

        //根据不同操作符显示不同的时间选择器
        switch(op){
            case 2 :case 5 :case 6 ://等于 小于 小于等于 显示第一个 隐藏第二个
                control.input1 = true;
                control.input2 = false;
               break;
            case 3 :case 4 :case 8 : case 9 : //大于 大于等于 包含于 包含 隐藏第一个 显示第二个
                control.input1 = false;
                control.input2 = true;
                break;
            case 7 ://介于 两个全显示
                control.input1 = true;
                control.input2 = true;
                break;
            case 10 ://为空 两个都隐藏
                control.input1 = false;
                control.input2 = false;
                break;
        }
        this.domDisplayMethod(control, coms);
    }

    /**
     * 输入框的下拉图标、第二行、是否可编辑控制
     * @param conf
     */
    private static displayControl(conf : QueryConf){

        let isDatetime = BwRule.isTime(conf.atrrs.dataType),
            isBool = conf.atrrs.dataType === BwRule.DT_BOOL,
            placeholderArr = [], // 10 isnull;
            control : QueryDisplayControl = {
                // drop: true,
                placeholder:'',
                inputType : 'text',
            };

        // 是否显示输入框的下拉图标
        if( conf.type || isDatetime || isBool ){
            if(conf.type){
                placeholderArr.push('下拉选择');
                control.inputType = 'select';
            }
            else if(isDatetime) {
                control.inputType = 'datetime';
                placeholderArr.push(sys.isMb ? '长按快捷选择' : '右键快捷选择');
            }
            else if(isBool){
                control.inputType = 'bool';
                placeholderArr.push('下拉选择');
            }
        }

        // 输入框是否可编辑
        control.readonly = isDatetime || isBool;

        if(!control.readonly){
            placeholderArr.length < 1 && placeholderArr.push('输入值');
        }

        control.placeholder = `请${placeholderArr.join('、')}...`;

        return control;
    }

    protected confGetByFieldName(fieldName : string) : QueryConf{
        for(let i = 0, c:QueryConf = null; c = this.queryConfigs[i]; i ++){
            if(c.field_name  === fieldName){
                return this.queryConfigs[i];
            }
        }
        return null;
    }

    protected domDisplayMethod(control : QueryDisplayControl, coms : QueryComs){

        let domIndex = this.rowsCom.indexOf(coms),
            conf = this.confGetByFieldName(coms.field.get()),//field字段
            resultDom = this.para.resultDom,
            containers = {
                input1 : d.query(`[data-index="${domIndex}"] [data-type="input1"]`, resultDom),
                input2 : d.query(`[data-index="${domIndex}"] [data-type="input2"]`, resultDom)
            },
            para =  this.conf2comPara(control.inputType, conf, domIndex);

        ['input1', 'input2'].forEach(name => {
            //初始化事件选择器 默认小时 与 默认分钟参数
            !para && (para = {});
            if(control.inputType === 'datetime' && name === 'input2' ) {
                Object.assign(para, {defaultHour:23, defaultMinute:59, defaultSeconds: 59});
            }

            if(BwRule.DT_NUMBER === conf.atrrs.dataType){
                para['type'] = 'number';
            }
            let com:TextInput = coms[name] = inputTransFactory(coms[name], para, control.inputType, containers[name], sys.isMb);

            if (name in control) {
                containers[name].classList[control[name] ? 'remove' : 'add']('hide');
            }

            if ('readonly' in control) {
                com.readonly(control.readonly);
            }

            if ('placeholder' in control) {
                com.placeholder(control.placeholder);
            }
        });

        if (control.inputType === 'datetime' && coms.input1 && coms.input2) {
            initShortData(coms.input1, coms.input2)
        }

        if('input1' in control &&  'input2' in control){
            containers.input1.classList[control.input1 && control.input2 ? 'add' : 'remove']('has-two-input');

            if(!coms['input1']){
                return;
            }

            if(BwRule.DT_NUMBER === conf.atrrs.dataType){
                coms['input1'].inputType = 'number';
                coms['input2'].inputType = 'number';
            }else {
                coms['input1'].inputType = 'text';
                coms['input2'].inputType = 'text';
            }
        }
    }

    protected conf2comPara(type: string, conf: QueryConf, rowIndex: number) {
        let atrrs = conf.atrrs, hasScan = conf.atrrs.allowScan === 1;

        let ajaxFun = (url: string, value:string, cb: Function) => {
            // 带上用户输入的值
            let ajaxData : obj = {};

            if (conf.type === 'QRYVALUE') {
                ajaxData.inputedtext = value;
            }

            // 联动
            if (conf.dynamic === 1) {
                let paramsData = this.dataGet(rowIndex);
                ajaxData[this.para.queryName] = paramsData === null ? '' : JSON.stringify(paramsData);

                // console.log(qc.atVarQc);
                let atDataGet = this.para.atVarDataGet;
                if(typeof atDataGet === 'function'){
                    let atData = atDataGet();
                    ajaxData['atvarparams'] = atData === null ? '' : JSON.stringify(atData);
                }
            }

            this.ajax.fetch(url, {
                data: ajaxData,
                cache: true,
            }).then(({response}) => {
                let fields = [];
                if (response.data[0]) {
                    fields = Object.keys(response.data[0]);
                }
                let options = response.data.map(data => {
                    // id name 都添加到条件
                    return {
                        value: data[conf.field_name],
                        text: fields.map((key) => data[key]).join(','),
                    };
                });
                cb(options);
            }).catch(() => {
                cb();
            });
            //
            // Rule.ajax(url, {
            //     data: ajaxData,
            //     cache: true,
            //     success: (response) => {
            //         let fields = [];
            //         if (response.data[0]) {
            //             fields = Object.keys(response.data[0]);
            //         }
            //         let options = response.data.map(data => {
            //             // id name 都添加到条件
            //             return {
            //                 value: data[conf.field_name],
            //                 text: fields.map((key) => data[key]).join(','),
            //             };
            //         });
            //         cb(options);
            //     },
            //     error: () => {cb();},
            //     netError: () => {cb();}
            // })
        };

        switch (type){
            case 'datetime' :
                let format: string = atrrs.displayFormat;
                return {format};

            case 'text':
                return hasScan ? {isScan : hasScan} : {};

            case 'select':
                let data = conf.type === 'VALUELIST' && Array.isArray(conf.value_list) ? conf.value_list : null,
                    ajax = conf.type && conf.link ? {fun: ajaxFun, url: BW.CONF.siteUrl + conf.link} : null;
                return {data, ajax, useInputVal: true, isScan : hasScan};

            case 'bool':
                // 布尔值 ，是否
                let boolData = [{
                    value: atrrs.trueExpr,
                    text: `是`
                }, {
                    value: atrrs.falseExpr,
                    text: `否`
                }];
                return {data : boolData, useInputVal: false};
        }
    }

    //
    // /**
    //  * 输入值验证
    //  * @param currentParam
    //  * @param input1
    //  * @param input2
    //  * @return {{success: boolean, msg: string, input: HTMLElement}}
    //  */
    // protected static inputValidate(currentParam, input1, input2): {success : boolean, input : HTMLElement, msg : string}{
    //     let v = input1.value,
    //         v2 = input2.value;
    //
    //     function responseGet(success : boolean, msg : string = '', input : HTMLElement = null){
    //         return {
    //             success : success,
    //             msg : msg,
    //             input : input
    //         }
    //     }
    //
    //     // 不为空时需要填值
    //     if(currentParam.op !== 10){
    //         if(v === ''){
    //             return responseGet(false, '请输入值', input1);
    //         }
    //
    //         if(currentParam.op === 7 && v2 === ''){
    //             return responseGet(false, '请输入第二个值', input2);
    //         }
    //     }
    //
    //     return responseGet(true);
    //
    // }
    //

    /**
     * 将用户选择或输入的数据转为服务器接收的格式
     * @param coms
     */
    protected paramBuild(coms : QueryComs) {
        if(!coms) {return;}

        let param : QueryParam = {},
            v1 = coms.input1.get(),
            v2 = coms.input2.get();

        param.op = coms.operator.get();
        param.field = coms.field.get();
        param.not = !!coms.not.get();
        param.andOr = !!coms.andOr.get();

        let conf = this.confGetByFieldName(param.field);

        // 大小写转化
        if(!this.para.isTransCase || (this.para.isTransCase && !this.para.isTransCase())) {
            v1 = BwRule.maxValue(v1, conf.atrrs.dataType, conf.atrrs.maxValue);
            v2 = BwRule.maxValue(v2, conf.atrrs.dataType, conf.atrrs.maxValue);
        }

        // param.datatype = conf.atrrs.dataType;

        // op为空时 values为空数组
        if(param.op === 10) {
            param.values = [];
        } else {
            //根据不同的比较规则  对应获取不同的时间查询参数
            if (param.op === 3 || param.op === 4 || param.op === 9){
                param.values = [v2];

            } else if(param.op === 2 || param.op === 5 || param.op === 6){
                param.values = [v1];

            } else if (param.op === 7) { // between
                param.values = [v1];
                // 没输入值则跳过
                if(tools.isEmpty(v2)){return null;}
                param.values.push(v2);

            } else if(param.op === 8) { // in
                v2.replace('，',',');
                param.values = v2.split(',');
            }

            // 没输入值则跳过
            if( param.values.every(v => tools.isEmpty(v))) {
                return null;
            }
        }



        return param;
    }

    /**
     * 生成传到后台的查询数据
     * @param {QueryParam[]} params
     * @param {number} beforeIndex - 获取前几行数据
     * @param {boolean} isSave - 是否获取保存的数据
     * @return {QueryParam}
     */
    protected static dataBuild(params: QueryParam[] ,beforeIndex:number, isSave:boolean = false): QueryParam{
        let currentParam: QueryParam = {
                not: false,
                op: 0,
                params: []
            },
            len = params.length;

        beforeIndex = beforeIndex === -1 ? len : beforeIndex;

        for(let i = 0, param: QueryParam; i < beforeIndex; i++){
            param = params[i];
            if(!param){
                continue;
            }

            let lastParam = params[i - 1],
                p:QueryParam = {
                    not: param.not,
                    op: param.op,
                    field: param.field,
                    values: param.values,
                };

            if(isSave){
                p.andOr = param.andOr;
            }

            // 非保存时 并且and or与上次不一样时 新建新的嵌套
            if(!isSave && i > 1 && lastParam.andOr !== param.andOr) {

                // 创建新的嵌套对象
                currentParam = {
                    not: false,
                    op: param.andOr ? 0 : 1,
                    params: [currentParam, p]
                };

            }else{
                // 第二个条件直接修改and or
                if(!isSave && i === 1) {
                    currentParam.op = param.andOr ? 0 : 1;
                }
                currentParam.params.push(p);
            }
        }

        return currentParam.params[0] ? currentParam : null;
    }

    public dataGet(beforeIndex:number = -1, isSave = false){
        let queryParams = this.rowsCom.map(coms => this.paramBuild(coms)).filter(p => p);
        return QueryBuilder.dataBuild(queryParams, beforeIndex, isSave);
    }
}

export class AtVarBuilder{
    protected queryConfigs: QueryConf[];
    protected coms : objOf<TextInput> = {};

    constructor(protected para : QueryBuilderPara){
        this.queryConfigs = this.para.queryConfigs;

        this.initSettings();

        this.queryConfigs.forEach((conf, index) => {
            let defaultValue = tools.str.toEmpty(conf.atrrs.defaultValue);
            this.rowAdd(index, conf , defaultValue);
        });
    }

    private initSettings(){
        let setting = this.para.setting;
        if (tools.isNotEmpty(setting)) {
            this.queryConfigs.forEach( p => {
                p.atrrs.defaultValue = setting[p.field_name];
            });
        }
    }

    protected conf2comPara(type : string, conf:QueryConf) {
        let atrrs = conf.atrrs, hasScan = conf.atrrs.allowScan === 1;
        switch (type){
            case 'datetime' :
                let format: string = atrrs.displayFormat;
                return {format};

            case 'text':
                return {isScan : hasScan, on2dScan: this.para.on2dScan};

            case 'select':
                let keys = Object.keys(conf.data[0] ? conf.data[0] : {}),
                    data : ListItem[] = conf.data.map(d => {
                        return { text : keys.map((k) => d[k]).join(','), value : tools.str.toEmpty(d[keys[0]])}
                    });
                let multi = conf.atrrs && conf.atrrs.multiValueFlag;
                return {data, useInputVal: true, multi : multi === 1, isScan : hasScan};

            case 'number':
                return {max : atrrs.maxValue , min : atrrs.minValue, isScan : hasScan }
        }
    }

    /**
     * 创建行
     * @return {QueryComs}
     */
    protected rowAdd(index : number ,conf : QueryConf, value:any){
        let row = this.para.tpl();

        row.dataset.index = index.toString();

        d.queryAll('[data-type]', row).forEach((container) => {
            let type = container.dataset.type;
            if(type === 'title'){
                container.innerHTML = this.queryConfigs[index].caption;
            }else if (type === 'input'){
                // 判断输入框的类型
                let inputType = (function () {
                    if('valueStep' in conf.atrrs){
                        return 'number';
                    }else if (BwRule.isTime(conf.atrrs.dataType)){
                        return 'datetime'
                    }else if('data' in conf){
                        return 'select'
                    }else{
                        return'text';
                    }
                }());

                // 初始化输入框
                let para = this.conf2comPara(inputType, conf);
                if(BwRule.DT_NUMBER === conf.atrrs.dataType){
                    para['type'] = 'number';
                }
                let com = inputTransFactory(null, para, inputType, container, sys.isMb);

                com.set(value);

                this.coms[conf.field_name] = com;
            }
        });
        // console.log(this.coms);
        this.queryConfigs.forEach((conf) => {
            // console.log(conf);
            if(BwRule.isTime(conf.atrrs.dataType)) {
                let first : string, end : string;
                if(conf.startFieldName){
                    first = conf.startFieldName;
                    end = conf.field_name;
                }else if (conf.endFieldName){
                    first = conf.field_name;
                    end = conf.endFieldName;
                }
                if(this.coms[first] && this.coms[end]){
                    initShortData(this.coms[first], this.coms[end]);
                }
            }
        });

        d.append(this.para.resultDom, row);
    }

    dataGet(beforeIndex:number = -1, full = false){
        let atVar : obj = {};
        this.queryConfigs.forEach((conf, i) => {
            atVar[conf.field_name] = this.coms[conf.field_name].get();
        });
        return atVar;
    }
}

function tplGet(){
    let mb = <li class="mui-table-view-cell">
            <div class="mui-slider-right mui-disabled" data-action="del"><a class="mui-btn mui-btn-red">删除</a></div>
            <div class="mui-slider-left mui-disabled">
            <a class="mui-btn" data-type="andOr"></a>
            </div>
            <div class="mui-slider-handle inner-padding-row">
            <div data-type="field"></div>
            <div data-type="not"></div>
            <div data-type="operator"></div>
            <div data-type="input1"></div>
            <div data-type="input2"></div>
        </div></li>;

    let pc = <div class="row">
            <div class="col-sm-3" data-type="field"></div>
            <div class="col-sm-1" data-type="not"></div>
            <div class="col-sm-2" data-type="operator"></div>
            <div class="col-sm-3" data-type="input1"></div>
            <div class="col-sm-3" data-type="input2"></div>
            <span data-action="del" class="iconfont red icon-close"></span>
            <span data-type="andOr"></span>
        </div>;
    return sys.isMb ? mb : pc;
}