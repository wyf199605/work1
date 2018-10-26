define("QueryBuilder", ["require", "exports", "BwRule", "SelectInput", "CheckBox", "TextInput", "DatetimeMb", "Datetime", "DropDown", "NumInput", "SelectInputMb", "Modal", "Picker"], function (require, exports, BwRule_1, selectInput_1, checkBox_1, text_1, datetimeInput_mb_1, datetime_1, dropdown_1, numInput_1, selectInput_mb_1, Modal_1, picker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var sys = BW.sys;
    var d = G.d;
    var dateRange = tools.date.range;
    var shortDateOpts = [
        { text: '今天', value: dateRange.today() },
        { text: '昨天', value: dateRange.yesterday() },
        { text: '本周', value: dateRange.thisWeek() },
        { text: '上周', value: dateRange.lastWeek() },
        { text: '本月', value: dateRange.thisMonth() },
        { text: '上月', value: dateRange.lastMonth() },
        { text: '本季度', value: dateRange.thisSeason() },
        { text: '上季度', value: dateRange.lastSeason() },
        { text: '今年', value: dateRange.thisYear() },
        { text: '去年', value: dateRange.lastYear() }
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
    function inputTransFactory(com, para, comType, container, isMb) {
        switch (comType) {
            case 'datetime':
                // if (com instanceof Datetime) {
                //     com.format((para as IDatetimePara).format);
                // } else {
                reNew(isMb ? datetimeInput_mb_1.DatetimeMb : datetime_1.Datetime, para);
                // }
                break;
            case 'text':
                if ((com && com.constructor !== text_1.TextInput) || !(com instanceof text_1.TextInput)) {
                    reNew(text_1.TextInput, para);
                }
                break;
            case 'select':
            case 'bool': // bool类用下拉框选择是否
                if (com instanceof selectInput_1.SelectInput) {
                    com.setPara(para);
                }
                else {
                    reNew(isMb ? selectInput_mb_1.SelectInputMb : selectInput_1.SelectInput, para);
                }
                break;
            case 'number':
                if (com instanceof numInput_1.NumInput) {
                }
                else {
                    reNew(numInput_1.NumInput, para);
                }
                break;
            default:
        }
        tools.isMb && com && (com.isScan = para && para.isScan);
        return com;
        function reNew(Constructor, para) {
            com && com.destroy();
            para.container = container;
            com = new Constructor(para);
            com.on('paste', function (e) {
                var text = e.clipboardData.getData('Text').replace(/\r\n/g, ',');
                com.set(text);
                e.preventDefault();
            });
            // com.set(value);
        }
    }
    function initShortData(com1, com2) {
        // 触发快捷选择时间的事件名
        var shortDateEvent = sys.isMb ? 'longtap' : 'contextmenu';
        var handler = function (e) {
            if (sys.isMb) {
                h(picker_1.PickerList, { onSet: function (option) {
                        com1.set(option[0].value[0]);
                        com2.set(option[0].value[1]);
                    } },
                    h(picker_1.Picker, { optionData: shortDateOpts }));
                // Picker.show(shortDateOpts, function (option) {
                //
                //     com1.set(option[0].value[0]);
                //     com2.set(option[0].value[1]);
                // })
            }
            else {
                e.preventDefault();
                var shortDatePick_1 = new dropdown_1.DropDown({
                    el: this,
                    data: shortDateOpts,
                    onSelect: function (item) {
                        com1.set(item.value[0]);
                        com2.set(item.value[1]);
                        shortDatePick_1.destroy();
                    },
                });
                shortDatePick_1.showList();
            }
        };
        d.on(com1.wrapper, shortDateEvent, handler);
        d.on(com2.wrapper, shortDateEvent, handler);
    }
    var QueryBuilder = /** @class */ (function () {
        /**
         *
         */
        function QueryBuilder(para) {
            var _this = this;
            this.para = para;
            /**
             * 删除数组元素时会保留数组长度，所以用rowsLen 和 rowsIndex 来区分长度和最大下标
             */
            this.rowsCom = [];
            this.rowsLen = 0; // 当前条数
            this.rowsIndex = 0; // 当前最大数组下标
            this.ajax = new BwRule_1.BwRule.Ajax();
            /**
             * 初始化行的工厂
             */
            this.rowInitFactory = (function () {
                var field = function (dom, rowIndex) {
                    var para = {
                        clickType: 0,
                        readonly: true,
                        data: _this.fieldOptions,
                        onSet: function (item, index) {
                            _this.fieldSet(index, _this.rowsCom[rowIndex]);
                        }
                    };
                    return inputTransFactory(null, para, 'select', dom, sys.isMb);
                };
                var not = function (dom, rowIndex) {
                    return new checkBox_1.CheckBox({
                        container: dom,
                        text: tools.isPc ? '不' : ''
                        // ICustomCheck: {}
                    });
                };
                var andOr = function (dom, rowIndex) {
                    return new checkBox_1.CheckBox({
                        container: dom,
                        onSet: function (isChecked) {
                            var rowDom = d.closest(dom, '[data-index]');
                            if (rowDom) {
                                rowDom.classList[isChecked ? 'remove' : 'add']('orCondition');
                            }
                        }
                    });
                };
                var operator = function (dom, rowIndex) {
                    var para = {
                        clickType: 0,
                        readonly: true,
                        data: BwRule_1.BwRule.QUERY_OP,
                        onSet: function (item, index) {
                            _this.operateSet(index, _this.rowsCom[rowIndex]);
                        }
                    };
                    return inputTransFactory(null, para, 'select', dom, sys.isMb);
                };
                var input1 = function (dom, rowIndex) {
                    return null;
                };
                return { field: field, not: not, operator: operator, input1: input1, input2: input1, andOr: andOr };
            })();
            var self = this;
            if (!para.tpl) {
                para.tpl = tplGet;
            }
            this.queryConfigs = para.queryConfigs;
            // 配置得出字段名选项
            self.fieldOptions = QueryBuilder.config2Options(this.queryConfigs);
            this.initSettings();
            if (!this.rowsCom[0]) {
                this.rowAdd();
            }
            d.on(para.resultDom, 'click', '[data-action]', function () {
                switch (this.dataset.action) {
                    case 'add':
                        self.rowAdd();
                        break;
                    case 'del':
                        // 最少要留一条不让删除
                        if (self.rowsLen > 1) {
                            var index = parseInt(d.closest(this.parentElement, '[data-index]').dataset.index);
                            self.rowDel(index);
                        }
                        else {
                            Modal_1.Modal.toast('至少需要一个条件');
                        }
                        break;
                }
            });
        }
        /**
         *
         * @param configs
         * @return {PickerOption[]}
         */
        QueryBuilder.config2Options = function (configs) {
            // console.log(configs);
            return configs.map(function (conf) {
                return {
                    text: conf.caption,
                    value: conf.field_name
                };
            });
        };
        /**
         * 初始化默认值
         */
        QueryBuilder.prototype.initSettings = function () {
            var _this = this;
            var setting = this.para.setting;
            if (!setting || !setting.params || !setting.params[0]) {
                return;
            }
            setting.params.forEach(function (p) {
                if (!_this.confGetByFieldName(p.field)) {
                    return;
                }
                _this.rowAdd(p);
                var lastCom = _this.rowsCom[_this.rowsIndex - 1];
                lastCom.not.set(p.not);
                lastCom.operator.set(p.op);
                lastCom.andOr.set(p.andOr);
                Array.isArray(p.values) && p.values.forEach(function (v, i) {
                    lastCom["input" + (i + 1)].set(v);
                });
            });
        };
        // 新增时默认值
        QueryBuilder.prototype.defaultParamGet = function () {
            var selectedFields = this.rowsCom.map(function (com) {
                return com.field.get();
            }), confs = this.queryConfigs;
            // 找到没有被选择过的字段
            for (var _i = 0, confs_1 = confs; _i < confs_1.length; _i++) {
                var c = confs_1[_i];
                if (selectedFields.indexOf(c.field_name) === -1) {
                    return {
                        field: c.field_name,
                        not: false,
                        andOr: true
                    };
                }
            }
            return {
                field: confs[0].field_name,
                not: false,
                andOr: true
            };
        };
        ;
        QueryBuilder.prototype.rowDel = function (index) {
            var coms = this.rowsCom[index];
            if (coms) {
                tools.obj.toArr(coms).forEach(function (c) { return c.destroy(); });
                coms = null;
                // 保留数组下标，以免更新dom中的data-index
                delete this.rowsCom[index];
                d.remove(d.query(":scope > [data-index=\"" + index + "\"]", this.para.resultDom));
                this.rowsLen--;
            }
        };
        /**
         * 添加一行,设置默认值
         * @param {QueryParam} param
         */
        QueryBuilder.prototype.rowAdd = function (param) {
            if (param === void 0) { param = this.defaultParamGet(); }
            var lastRow = this.rowCreate(this.rowsIndex);
            if (lastRow) {
                lastRow.field.set(param.field);
                lastRow.not.set(param.not);
                lastRow.andOr.set(param.andOr);
                this.rowsIndex++;
                this.rowsLen++;
            }
        };
        /**
         * 创建行
         * @return {QueryComs}
         */
        QueryBuilder.prototype.rowCreate = function (index) {
            var _this = this;
            var row = this.para.tpl(), coms = {};
            row.dataset.index = index.toString();
            d.queryAll('[data-type]', row).forEach(function (container) {
                var type = container.dataset.type;
                coms[type] = _this.rowInitFactory[type](container, index);
            });
            if (coms) {
                this.rowsCom.push(coms);
                d.append(this.para.resultDom, row);
            }
            return coms;
        };
        /**
         * 设置字段框
         * @param fieldIndex
         * @param coms
         */
        QueryBuilder.prototype.fieldSet = function (fieldIndex, coms) {
            var strNotShowIndex = null, // [0,6,7,8], //[1,2,3,4,5]
            numNotShowIndex = [0, 1, 2, 3, 4, 5, 6, 8], //[7]
            conf = this.queryConfigs[fieldIndex], opIndex = BwRule_1.BwRule.isTime(conf.atrrs.dataType) ? 5 : 0, control = QueryBuilder.displayControl(conf);
            coms.operator.showItems(BwRule_1.BwRule.isNumber(conf.atrrs.dataType) ? numNotShowIndex : strNotShowIndex);
            coms.operator.set(BwRule_1.BwRule.QUERY_OP[opIndex].value);
            this.domDisplayMethod(control, coms);
        };
        /**
         * 设置操作符框
         * @param fieldIndex
         * @param coms
         */
        QueryBuilder.prototype.operateSet = function (fieldIndex, coms) {
            var control = {}, op = coms.operator.get();
            // 是否出现第一个选择框
            /*   control.input1 = op !== 10;
        
                // 是否出现第二个选择框
                control.input2 = op === 7; // 7:between, 8:in*/
            //根据不同操作符显示不同的时间选择器
            switch (op) {
                case 2:
                case 5:
                case 6: //等于 小于 小于等于 显示第一个 隐藏第二个
                    control.input1 = true;
                    control.input2 = false;
                    break;
                case 3:
                case 4:
                case 8:
                case 9: //大于 大于等于 包含于 包含 隐藏第一个 显示第二个
                    control.input1 = false;
                    control.input2 = true;
                    break;
                case 7: //介于 两个全显示
                    control.input1 = true;
                    control.input2 = true;
                    break;
                case 10: //为空 两个都隐藏
                    control.input1 = false;
                    control.input2 = false;
                    break;
            }
            this.domDisplayMethod(control, coms);
        };
        /**
         * 输入框的下拉图标、第二行、是否可编辑控制
         * @param conf
         */
        QueryBuilder.displayControl = function (conf) {
            var isDatetime = BwRule_1.BwRule.isTime(conf.atrrs.dataType), isBool = conf.atrrs.dataType === BwRule_1.BwRule.DT_BOOL, placeholderArr = [], // 10 isnull;
            control = {
                // drop: true,
                placeholder: '',
                inputType: 'text',
            };
            // 是否显示输入框的下拉图标
            if (conf.type || isDatetime || isBool) {
                if (conf.type) {
                    placeholderArr.push('下拉选择');
                    control.inputType = 'select';
                }
                else if (isDatetime) {
                    control.inputType = 'datetime';
                    placeholderArr.push(sys.isMb ? '长按快捷选择' : '右键快捷选择');
                }
                else if (isBool) {
                    control.inputType = 'bool';
                    placeholderArr.push('下拉选择');
                }
            }
            // 输入框是否可编辑
            control.readonly = isDatetime || isBool;
            if (!control.readonly) {
                placeholderArr.length < 1 && placeholderArr.push('输入值');
            }
            control.placeholder = "\u8BF7" + placeholderArr.join('、') + "...";
            return control;
        };
        QueryBuilder.prototype.confGetByFieldName = function (fieldName) {
            for (var i = 0, c = null; c = this.queryConfigs[i]; i++) {
                if (c.field_name === fieldName) {
                    return this.queryConfigs[i];
                }
            }
            return null;
        };
        QueryBuilder.prototype.domDisplayMethod = function (control, coms) {
            var domIndex = this.rowsCom.indexOf(coms), conf = this.confGetByFieldName(coms.field.get()), //field字段
            resultDom = this.para.resultDom, containers = {
                input1: d.query("[data-index=\"" + domIndex + "\"] [data-type=\"input1\"]", resultDom),
                input2: d.query("[data-index=\"" + domIndex + "\"] [data-type=\"input2\"]", resultDom)
            }, para = this.conf2comPara(control.inputType, conf, domIndex);
            ['input1', 'input2'].forEach(function (name) {
                //初始化事件选择器 默认小时 与 默认分钟参数
                !para && (para = {});
                if (control.inputType === 'datetime' && name === 'input2') {
                    Object.assign(para, { defaultHour: 23, defaultMinute: 59, defaultSeconds: 59 });
                }
                var com = coms[name] = inputTransFactory(coms[name], para, control.inputType, containers[name], sys.isMb);
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
                initShortData(coms.input1, coms.input2);
            }
            if ('input1' in control && 'input2' in control) {
                containers.input1.classList[control.input1 && control.input2 ? 'add' : 'remove']('has-two-input');
            }
        };
        QueryBuilder.prototype.conf2comPara = function (type, conf, rowIndex) {
            var _this = this;
            var atrrs = conf.atrrs, hasScan = conf.atrrs.allowScan === 1;
            var ajaxFun = function (url, value, cb) {
                // 带上用户输入的值
                var ajaxData = {};
                if (conf.type === 'QRYVALUE') {
                    ajaxData.inputedtext = value;
                }
                // 联动
                if (conf.dynamic === 1) {
                    var paramsData = _this.dataGet(rowIndex);
                    ajaxData[_this.para.queryName] = paramsData === null ? '' : JSON.stringify(paramsData);
                    // console.log(qc.atVarQc);
                    var atDataGet = _this.para.atVarDataGet;
                    if (typeof atDataGet === 'function') {
                        var atData = atDataGet();
                        ajaxData['atvarparams'] = atData === null ? '' : JSON.stringify(atData);
                    }
                }
                _this.ajax.fetch(url, {
                    data: ajaxData,
                    cache: true,
                }).then(function (_a) {
                    var response = _a.response;
                    var fields = [];
                    if (response.data[0]) {
                        fields = Object.keys(response.data[0]);
                    }
                    var options = response.data.map(function (data) {
                        // id name 都添加到条件
                        return {
                            value: data[conf.field_name],
                            text: fields.map(function (key) { return data[key]; }).join(','),
                        };
                    });
                    cb(options);
                }).catch(function () {
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
            switch (type) {
                case 'datetime':
                    var format = atrrs.displayFormat;
                    return { format: format };
                case 'text':
                    return hasScan ? { isScan: hasScan } : {};
                case 'select':
                    var data = conf.type === 'VALUELIST' && Array.isArray(conf.value_list) ? conf.value_list : null, ajax = conf.type && conf.link ? { fun: ajaxFun, url: BW.CONF.siteUrl + conf.link } : null;
                    return { data: data, ajax: ajax, useInputVal: true, isScan: hasScan };
                case 'bool':
                    // 布尔值 ，是否
                    var boolData = [{
                            value: atrrs.trueExpr,
                            text: "\u662F"
                        }, {
                            value: atrrs.falseExpr,
                            text: "\u5426"
                        }];
                    return { data: boolData, useInputVal: false };
            }
        };
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
        QueryBuilder.prototype.paramBuild = function (coms) {
            if (!coms) {
                return;
            }
            var param = {}, v1 = coms.input1.get(), v2 = coms.input2.get();
            param.op = coms.operator.get();
            param.field = coms.field.get();
            param.not = !!coms.not.get();
            param.andOr = !!coms.andOr.get();
            var conf = this.confGetByFieldName(param.field);
            // 大小写转化
            if (!this.para.isTransCase || (this.para.isTransCase && !this.para.isTransCase())) {
                v1 = BwRule_1.BwRule.maxValue(v1, conf.atrrs.dataType, conf.atrrs.maxValue);
                v2 = BwRule_1.BwRule.maxValue(v2, conf.atrrs.dataType, conf.atrrs.maxValue);
            }
            // param.datatype = conf.atrrs.dataType;
            // op为空时 values为空数组
            if (param.op === 10) {
                param.values = [];
            }
            else {
                //根据不同的比较规则  对应获取不同的时间查询参数
                if (param.op === 3 || param.op === 4 || param.op === 9) {
                    param.values = [v2];
                }
                else if (param.op === 2 || param.op === 5 || param.op === 6) {
                    param.values = [v1];
                }
                else if (param.op === 7) { // between
                    param.values = [v1];
                    // 没输入值则跳过
                    if (tools.isEmpty(v2)) {
                        return null;
                    }
                    param.values.push(v2);
                }
                else if (param.op === 8) { // in
                    v2.replace('，', ',');
                    param.values = v2.split(',');
                }
                // 没输入值则跳过
                if (param.values.every(function (v) { return tools.isEmpty(v); })) {
                    return null;
                }
            }
            return param;
        };
        /**
         * 生成传到后台的查询数据
         * @param {QueryParam[]} params
         * @param {number} beforeIndex - 获取前几行数据
         * @param {boolean} isSave - 是否获取保存的数据
         * @return {QueryParam}
         */
        QueryBuilder.dataBuild = function (params, beforeIndex, isSave) {
            if (isSave === void 0) { isSave = false; }
            var currentParam = {
                not: false,
                op: 0,
                params: []
            }, len = params.length;
            beforeIndex = beforeIndex === -1 ? len : beforeIndex;
            for (var i = 0, param = void 0; i < beforeIndex; i++) {
                param = params[i];
                if (!param) {
                    continue;
                }
                var lastParam = params[i - 1], p = {
                    not: param.not,
                    op: param.op,
                    field: param.field,
                    values: param.values,
                };
                if (isSave) {
                    p.andOr = param.andOr;
                }
                // 非保存时 并且and or与上次不一样时 新建新的嵌套
                if (!isSave && i > 1 && lastParam.andOr !== param.andOr) {
                    // 创建新的嵌套对象
                    currentParam = {
                        not: false,
                        op: param.andOr ? 0 : 1,
                        params: [currentParam, p]
                    };
                }
                else {
                    // 第二个条件直接修改and or
                    if (!isSave && i === 1) {
                        currentParam.op = param.andOr ? 0 : 1;
                    }
                    currentParam.params.push(p);
                }
            }
            return currentParam.params[0] ? currentParam : null;
        };
        QueryBuilder.prototype.dataGet = function (beforeIndex, isSave) {
            var _this = this;
            if (beforeIndex === void 0) { beforeIndex = -1; }
            if (isSave === void 0) { isSave = false; }
            var queryParams = this.rowsCom.map(function (coms) { return _this.paramBuild(coms); }).filter(function (p) { return p; });
            return QueryBuilder.dataBuild(queryParams, beforeIndex, isSave);
        };
        return QueryBuilder;
    }());
    exports.QueryBuilder = QueryBuilder;
    var AtVarBuilder = /** @class */ (function () {
        function AtVarBuilder(para) {
            var _this = this;
            this.para = para;
            this.coms = {};
            this.queryConfigs = this.para.queryConfigs;
            this.initSettings();
            this.queryConfigs.forEach(function (conf, index) {
                var defaultValue = tools.str.toEmpty(conf.atrrs.defaultValue);
                _this.rowAdd(index, conf, defaultValue);
            });
        }
        AtVarBuilder.prototype.initSettings = function () {
            var setting = this.para.setting;
            if (setting) {
                this.queryConfigs.forEach(function (p) {
                    p.atrrs.defaultValue = setting[p.field_name];
                });
            }
        };
        AtVarBuilder.prototype.conf2comPara = function (type, conf) {
            var atrrs = conf.atrrs, hasScan = conf.atrrs.allowScan === 1;
            switch (type) {
                case 'datetime':
                    var format = atrrs.displayFormat;
                    return { format: format };
                case 'text':
                    return { isScan: hasScan, on2dScan: this.para.on2dScan };
                case 'select':
                    var keys_1 = Object.keys(conf.data[0]), data = conf.data.map(function (d) {
                        return { text: keys_1.map(function (k) { return d[k]; }).join(','), value: tools.str.toEmpty(d[keys_1[0]]) };
                    });
                    var multi = conf.atrrs && conf.atrrs.multiValueFlag;
                    return { data: data, useInputVal: true, multi: multi === 1, isScan: hasScan };
                case 'number':
                    return { max: atrrs.maxValue, min: atrrs.minValue, isScan: hasScan };
            }
        };
        /**
         * 创建行
         * @return {QueryComs}
         */
        AtVarBuilder.prototype.rowAdd = function (index, conf, value) {
            var _this = this;
            var row = this.para.tpl();
            row.dataset.index = index.toString();
            d.queryAll('[data-type]', row).forEach(function (container) {
                var type = container.dataset.type;
                if (type === 'title') {
                    container.innerHTML = _this.queryConfigs[index].caption;
                }
                else if (type === 'input') {
                    // 判断输入框的类型
                    var inputType = (function () {
                        if ('valueStep' in conf.atrrs) {
                            return 'number';
                        }
                        else if (BwRule_1.BwRule.isTime(conf.atrrs.dataType)) {
                            return 'datetime';
                        }
                        else if ('data' in conf) {
                            return 'select';
                        }
                        else {
                            return 'text';
                        }
                    }());
                    // 初始化输入框
                    var para = _this.conf2comPara(inputType, conf);
                    var com = inputTransFactory(null, para, inputType, container, sys.isMb);
                    com.set(value);
                    _this.coms[conf.field_name] = com;
                }
            });
            // console.log(this.coms);
            this.queryConfigs.forEach(function (conf) {
                // console.log(conf);
                if (BwRule_1.BwRule.isTime(conf.atrrs.dataType)) {
                    var first = void 0, end = void 0;
                    if (conf.startFieldName) {
                        first = conf.startFieldName;
                        end = conf.field_name;
                    }
                    else if (conf.endFieldName) {
                        first = conf.field_name;
                        end = conf.endFieldName;
                    }
                    if (_this.coms[first] && _this.coms[end]) {
                        initShortData(_this.coms[first], _this.coms[end]);
                    }
                }
            });
            d.append(this.para.resultDom, row);
        };
        AtVarBuilder.prototype.dataGet = function (beforeIndex, full) {
            var _this = this;
            if (beforeIndex === void 0) { beforeIndex = -1; }
            if (full === void 0) { full = false; }
            var atVar = {};
            this.queryConfigs.forEach(function (conf, i) {
                atVar[conf.field_name] = _this.coms[conf.field_name].get();
            });
            return atVar;
        };
        return AtVarBuilder;
    }());
    exports.AtVarBuilder = AtVarBuilder;
    function tplGet() {
        var mb = h("li", { class: "mui-table-view-cell" },
            h("div", { class: "mui-slider-right mui-disabled", "data-action": "del" },
                h("a", { class: "mui-btn mui-btn-red" }, "\u5220\u9664")),
            h("div", { class: "mui-slider-left mui-disabled" },
                h("a", { class: "mui-btn", "data-type": "andOr" })),
            h("div", { class: "mui-slider-handle inner-padding-row" },
                h("div", { "data-type": "field" }),
                h("div", { "data-type": "not" }),
                h("div", { "data-type": "operator" }),
                h("div", { "data-type": "input1" }),
                h("div", { "data-type": "input2" })));
        var pc = h("div", { class: "row" },
            h("div", { class: "col-sm-3", "data-type": "field" }),
            h("div", { class: "col-sm-1", "data-type": "not" }),
            h("div", { class: "col-sm-2", "data-type": "operator" }),
            h("div", { class: "col-sm-3", "data-type": "input1" }),
            h("div", { class: "col-sm-3", "data-type": "input2" }),
            h("span", { "data-action": "del", class: "iconfont red icon-close" }),
            h("span", { "data-type": "andOr" }));
        return sys.isMb ? mb : pc;
    }
});

define("QueryModule", ["require", "exports", "QueryBuilder", "QueryConfig", "BwRule", "Loading", "Modal", "CheckBox"], function (require, exports, queryBuilder_1, queryConfig_1, BwRule_1, loading_1, Modal_1, checkBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="QueryModule"/>
    var tools = G.tools;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var d = G.d;
    var QueryModule = /** @class */ (function () {
        /**
         * 1. 默认值初始化
         * 2. 大小写初始化
         * 3. 将时间类型的字段提前
         * 4. 初始化查询控件
         * 5. 是否自动查询
         * @param para
         */
        function QueryModule(para) {
            var _this = this;
            this.para = para;
            this.queriesCpt = {};
            this.hasOption = true;
            /**
             * 初始化是否大小写
             */
            this.textCase = (function () {
                var checkBox = null;
                var init = function (value) {
                    var div = d.query('[data-com-type="textCase"]', _this.queryDomGet());
                    if (div) {
                        checkBox = new checkBox_1.CheckBox({
                            container: div,
                            text: sys.isMb ? '' : '区分大小写',
                            onClick: sys.isMb ? function () {
                                Modal_1.Modal.toast(checkBox.get() ? '区分大小写' : '不区分大小写');
                            } : null
                        });
                        checkBox.set(value);
                    }
                };
                var get = function () {
                    return checkBox ? checkBox.get() : false;
                };
                return { init: init, get: get };
            })();
            // 初始化setting默认值
            this.settingConf = para.qm.setting && para.qm.setting.setContent ? JSON.parse(para.qm.setting.setContent) : null;
            for (var name_1 in this.settingConf) {
                this.settingConf[name_1] = JSON.parse(this.settingConf[name_1]);
            }
            // 初始化是否大小写选项
            this.textCase.init();
            //查询
            var queriesCpt = this.queriesCpt;
            d.queryAll('[data-query-name]', this.queryDomGet()).forEach(function (form) {
                var queryName = form.dataset.queryName;
                // 将时间类型的字段提前
                if (queryName.indexOf('queryparam') >= 0) {
                    for (var j = 0, conf = void 0; conf = para.qm[queryName][j]; j++) {
                        if (conf.atrrs && (BwRule_1.BwRule.isTime(conf.atrrs.dataType))) {
                            para.qm[queryName].splice(j, 1);
                            para.qm[queryName].unshift(conf);
                        }
                    }
                }
                if (tools.isEmpty(para.qm[queryName])) {
                    return;
                }
                if (queryName !== 'atvarparams') {
                    queriesCpt[queryName] = new queryBuilder_1.QueryBuilder({
                        tpl: _this.queryParamTplGet,
                        queryName: queryName,
                        queryConfigs: para.qm[queryName],
                        resultDom: form,
                        setting: _this.settingConf && _this.settingConf[queryName],
                        atVarDataGet: (function () {
                            var atVar = queriesCpt['atvarparams'];
                            if (atVar) {
                                return function () { return atVar.dataGet(); };
                            }
                            else {
                                return null;
                            }
                        }()),
                        isTransCase: function () { return _this.textCase.get(); }
                    });
                }
                else {
                    queriesCpt[queryName] = new queryBuilder_1.AtVarBuilder({
                        tpl: _this.atVarTplGet,
                        queryConfigs: para.qm[queryName],
                        resultDom: form,
                        setting: _this.settingConf && _this.settingConf[queryName],
                        on2dScan: function (code) {
                            _this.search();
                        }
                    });
                }
            });
            if (para.qm.queryType === 13) {
                this.hide();
            }
            if (para.qm.autTag === 0) {
                setTimeout(function () {
                    _this.search();
                }, 10);
            }
        }
        Object.defineProperty(QueryModule.prototype, "wrapper", {
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });
        QueryModule.prototype.settingSave = function () {
            var settingSaveUrl = CONF.siteAppVerUrl + "/setting/" + this.para.qm.setting.settingId, queryJson = this.getQueryJson(true);
            queryJson.textCase = this.textCase.get();
            console.log(queryJson);
            BwRule_1.BwRule.Ajax.fetch(settingSaveUrl, {
                type: 'PUT',
                data2url: true,
                data: queryJson
            }).then(function () {
                Modal_1.Modal.toast('保存成功');
            });
            // Rule.ajax(settingSaveUrl, {
            //         type: 'PUT',
            //         urlData: true,
            //         data: queryJson,
            //         success: function (response) {
            //             Modal.toast('保存成功');
            //         }
            //     });
        };
        /**
         * 查询
         * @param param
         * @param {boolean} noQuery 扫码的时候不带非扫码的查询条件
         * @returns {any}
         */
        QueryModule.prototype.search = function (param, noQuery) {
            // if(sys.os === 'pc'){
            //     this.spinner = new Loading({
            //         msg : '加载中...'
            //     });
            // }
            if (noQuery === void 0) { noQuery = false; }
            var queryJson = this.getQueryJson(false);
            if (param) {
                queryJson = Object.assign(queryJson, param);
            }
            //必选判断
            if ('atvarparams' in queryJson) {
                var paramsData_1 = JSON.parse(queryJson.atvarparams), errTip_1 = '';
                this.para.qm['atvarparams'].forEach(function (obj) {
                    if (obj.atrrs.requiredFlag === 1 && paramsData_1[obj.field_name] === '') {
                        errTip_1 += obj.caption + ',';
                    }
                });
                if (errTip_1 !== '') {
                    Modal_1.Modal.alert(errTip_1.substring(0, errTip_1.length - 1) + '不能为空');
                    return Promise.reject('');
                }
            }
            // if (Object.keys(queryJson).length === 0) {
            //     return  '请先添加一个条件';
            //
            // }
            // 扫码不带查询条件，atv为必选条件需要带上
            if (noQuery) {
                var noQueryParam = param;
                noQueryParam.atvarparams = queryJson.atvarparams;
                queryJson = noQueryParam;
            }
            // 选项
            if (this.para.qm.hasOption && this.hasOption && !noQuery) {
                var data = JSON.parse(queryJson.queryoptionsparam);
                if (data.showFields && data.showFields.length === 0 && (data.itemSumCount || (data.groupByFields && data.groupByFields[0]))) {
                    Modal_1.Modal.alert('未设置显示字段');
                    return Promise.reject('');
                }
                if (data.section && !data.sectionParams.sections) {
                    Modal_1.Modal.alert('段位列表中无内容');
                    return Promise.reject('');
                }
                if (data.itemCount && data.showFields && !data.showFields[0]) {
                    return this.optionLoad(queryJson);
                }
                else {
                    return this.queryLoad(queryJson);
                }
            }
            else {
                return this.queryLoad(queryJson);
            }
        };
        //查询
        QueryModule.prototype.queryLoad = function (queryJson) {
            this.hide();
            return this.para.refresher(queryJson);
        };
        //仅查项数,不勾选显示字段
        QueryModule.prototype.optionLoad = function (ajaxData) {
            var self = this;
            // if(sys.os === 'pc'){
            if (!this.spinner) {
                this.spinner = new loading_1.Loading({
                    msg: '加载中...'
                });
            }
            else {
                self.spinner.show();
            }
            // }
            ajaxData.pageparams = JSON.stringify({
                index: 1,
                size: 3000
            });
            return BwRule_1.BwRule.Ajax.fetch(this.para.url, {
                data: ajaxData,
            }).then(function (_a) {
                var response = _a.response;
                var meta = response.body.bodyList[0].dataList[0], caption = ['项数'];
                Modal_1.Modal.alert(caption[0] + '：' + meta[0]);
                self.spinner.hide();
            });
        };
        QueryModule.prototype.getQueryJson = function (isSave) {
            if (isSave === void 0) { isSave = false; }
            var queryJson = {}, self = this, queryNum = 0;
            for (var queryName in this.queriesCpt) {
                if (!this.queriesCpt.hasOwnProperty(queryName)) {
                    continue;
                }
                var paramsData = this.queriesCpt[queryName].dataGet(-1, isSave);
                if (paramsData !== null) {
                    queryJson[queryName] = JSON.stringify(paramsData);
                    queryNum++;
                }
            }
            //是否有选项
            if (this.para.qm.hasOption) {
                var optionJson = this.getOptionJson(isSave), keys = Object.keys(optionJson);
                if (keys.length === 1 && optionJson.showFields && !optionJson.showFields[0]) {
                    self.hasOption = false;
                    return queryJson;
                }
                self.hasOption = true;
                if (queryNum === 0 && !optionJson) {
                    return null;
                }
                //参数合并
                queryJson.queryoptionsparam = JSON.stringify(optionJson);
            }
            return queryJson;
        };
        /**
         * 选项dom init
         * @returns {HTMLElement}
         */
        QueryModule.prototype.optionDomGet = function () {
            return h("div", { className: "option" },
                h("div", { className: "option-limit" },
                    h("div", { "data-action": "value", className: "checkbox-custom", "data-name": "itemRepeat" }),
                    h("div", { "data-action": "value", className: "checkbox-custom", "data-name": "itemCount" }),
                    h("div", { "data-action": "value", className: "checkbox-custom", "data-name": "itemSumCount" }),
                    h("div", { className: "limitInput", "data-name": "topN" },
                        "\u9650\u67E5\u524D",
                        h("div", { className: "topN" }),
                        "\u9879"),
                    h("div", { "data-action": "value", className: "checkbox-custom", "data-name": "restrictionFirst" })),
                h("div", { className: "multi-select" },
                    h("div", { className: "select-left" },
                        h("label", { className: "show-word" }, "\u663E\u793A\u5B57\u6BB5"),
                        h("span", { className: "all-dec" }, "\u5168\u6E05"),
                        h("span", { className: "all-select" }, "\u5168\u9009/")),
                    h("div", { className: "icon-box" },
                        h("span", { className: "iconfont icon-arrow-right-2 sort" }),
                        h("span", { className: "iconfont icon-close sort" }),
                        h("span", { className: "iconfont icon-arrow-right-2 group" }),
                        h("span", { className: "iconfont icon-close group" })),
                    h("div", { className: "select-right" },
                        h("label", { className: "sort-word" }, "\u6392\u5E8F\u5B57\u6BB5"),
                        h("label", { className: "group-word" }, "\u5206\u7EC4\u5B57\u6BB5"))),
                h("div", { className: "option-section" },
                    h("div", { className: "section-checkbox" },
                        h("div", { "data-name": "sectionQuery" }),
                        h("div", { "data-name": "leftOpenRightClose" })),
                    h("div", { className: "section" },
                        h("div", { className: "section-col" },
                            h("div", { className: "section-6", "data-name": "sectionField" },
                                h("label", null, "\u5206\u6BB5\u5B57\u6BB5")),
                            h("div", { className: "section-6 hide", "data-name": "sectionNorm" },
                                h("label", null, "\u5206\u6BB5\u6807\u51C6"))),
                        h("div", { "data-name": "avgSection" }),
                        h("div", { className: "customGrading" },
                            h("div", { "data-name": "numSection" },
                                h("label", { className: "segment hide" }, "\u6BB5\u4F4D"),
                                h("label", { className: "width" }, "\u5BBD\u5EA6")),
                            h("div", { className: "icon-box-2 hide" },
                                h("span", { className: "iconfont icon-arrow-right-2 col" }),
                                h("span", { className: "iconfont icon-close col" })),
                            h("div", { className: "section-6 hide", "data-name": "fieldCol" },
                                h("label", null, "\u6BB5\u4F4D\u5217\u8868"))))));
        };
        /**
         * 选项init
         */
        QueryModule.prototype.initQueryConf = function () {
            var self = this;
            self.optionDom = self.optionDomGet();
            self.queryConfig = new queryConfig_1.QueryConfig({
                limitDom: self.optionDom,
                cols: self.cols,
                setting: self.settingConf && self.settingConf.queryoptionsparam
            });
        };
        /**
         * 获取选项参数
         * @returns {QueryConfigPara}
         */
        QueryModule.prototype.getOptionJson = function (save) {
            if (save === void 0) { save = false; }
            return this.queryConfig.getPara(save);
        };
        return QueryModule;
    }());
    exports.QueryModule = QueryModule;
});

define("QueryModulePc", ["require", "exports", "QueryModule", "Tab", "Modal", "Button", "InputBox"], function (require, exports, queryModule_1, tab_1, Modal_1, Button_1, InputBox_1) {
    "use strict";
    var d = G.d;
    var tools = G.tools;
    return /** @class */ (function (_super) {
        __extends(QueryModulePc, _super);
        // private cols: R_Field[];
        // private optionDom: HTMLElement;
        /**
         * 初始化模态框
         * @param para
         */
        function QueryModulePc(para) {
            var _this = _super.call(this, para) || this;
            _this.cols = para.cols;
            // 模态框初始化
            var self = _this, leftBox = new InputBox_1.InputBox(), rightBox = new InputBox_1.InputBox(), cancelBtn = new Button_1.Button({ content: '取消', type: 'default', key: 'cancelBtn' }), queryBtn = new Button_1.Button({
                content: '查询',
                type: 'primary',
                onClick: function () {
                    self.search()
                        .then(function () {
                        self.modal.isShow = false;
                    })
                        .catch(function () {
                        self.spinner && self.spinner.hide();
                    });
                },
                key: 'queryBtn'
            });
            if (_this.para.qm.setting && _this.para.qm.setting.settingId) {
                leftBox.addItem(new Button_1.Button({
                    content: '设置默认值',
                    type: 'primary',
                    onClick: function () {
                        self.settingSave();
                    },
                    key: 'saveBtn'
                }));
            }
            rightBox.addItem(cancelBtn);
            rightBox.addItem(queryBtn);
            _this.modal = new Modal_1.Modal({
                container: para.container,
                header: '查询器',
                body: document.createElement('span'),
                className: 'queryBuilder',
                isBackground: false,
                isShow: _this.para.qm.autTag !== 0,
                footer: {
                    leftPanel: leftBox,
                    rightPanel: rightBox
                }
            });
            var tab = [{
                    title: '查询',
                    dom: _this.queryDom
                }];
            //是否有选项
            if (para.qm.hasOption === true) {
                _this.initQueryConf();
                tab.push({
                    title: '选项',
                    dom: _this.optionDom
                });
            }
            _this.tab = new tab_1.Tab({
                tabParent: _this.modal.bodyWrapper,
                panelParent: _this.modal.bodyWrapper,
                tabs: tab
            });
            if (_this.para.qm.autTag !== 0) {
                _this.modal.isShow = true;
            }
            return _this;
        }
        // 隐藏显示关闭按钮
        QueryModulePc.prototype.toggleCancle = function () {
            var closeIcon = d.query('.queryBuilder .close', this.para.container), closeBut = d.query('.right-plane button', this.para.container), toggle = function (dom) {
                dom.classList.toggle('hide');
            };
            toggle(closeIcon);
            toggle(closeBut);
        };
        QueryModulePc.prototype.queryDomGet = function () {
            var _this = this;
            if (!this.queryDom) {
                var container_1 = document.createElement('div');
                ['atvarparams', 'queryparams0', 'queryparams1'].forEach(function (name, i) {
                    tools.isNotEmpty(_this.para.qm[name]) && container_1.appendChild(h("div", { className: "filter-form " + (i === 0 ? 'row' : ''), "data-query-name": name }, i > 0 ? h("span", { "data-action": "add", className: "iconfont blue icon-jiahao" }) : ''));
                });
                // 是否大小写
                d.append(container_1, h("div", { "data-com-type": "textCase" }));
                this.queryDom = container_1;
            }
            return this.queryDom;
        };
        QueryModulePc.prototype.queryParamTplGet = function () {
            return h("div", { class: "row" },
                h("div", { class: "col-xs-3", "data-type": "field" }),
                h("div", { class: "col-xs-1", "data-type": "not" }),
                h("div", { class: "col-xs-2", "data-type": "operator" }),
                h("div", { class: "col-xs-3", "data-type": "input1" }),
                h("div", { class: "col-xs-3", "data-type": "input2" }),
                h("span", { "data-action": "del", class: "iconfont red icon-close" }),
                h("span", { "data-type": "andOr" }));
        };
        QueryModulePc.prototype.atVarTplGet = function () {
            return h("div", { class: "col-sm-5" },
                h("div", { "data-type": "title" }),
                h("div", { "data-type": "input" }));
        };
        QueryModulePc.prototype.show = function () {
            if (this.modal) {
                this.modal.isShow = true;
            }
        };
        QueryModulePc.prototype.hide = function () {
            if (this.modal) {
                this.modal.isShow = false;
            }
        };
        return QueryModulePc;
    }(queryModule_1.QueryModule));
});

define("QueryConfig", ["require", "exports", "NumInput", "CheckBox", "SelectBox", "DropDown", "SelectInput", "BwRule"], function (require, exports, numInput_1, checkBox_1, selectBox_1, dropdown_1, selectInput_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="QueryConfig"/>
    var tools = G.tools;
    var d = G.d;
    var QueryConfig = /** @class */ (function () {
        function QueryConfig(para) {
            this.para = para;
            this.p = {
                showFields: [],
                sectionParams: {
                    leftOpenRightClose: false,
                    sectionField: '',
                    sectionNorm: '',
                    avgSection: true,
                    sections: [1]
                }
            };
            this.isNorm = false;
            this.caption = [];
            this.numbers = [];
            this.hasNumber = true;
            this.normField = [{
                    text: '年',
                    value: 'year'
                }, {
                    text: '季度',
                    value: 'quarter'
                }, {
                    text: '月',
                    value: 'month'
                }, {
                    text: '周',
                    value: 'week'
                }, {
                    text: '日',
                    value: 'day'
                }, {
                    text: '天',
                    value: 'dayofyear'
                }, {
                    text: '时',
                    value: 'hour'
                }, {
                    text: '分',
                    value: 'minute'
                }, {
                    text: '秒',
                    value: 'second'
                },];
            this.dom = para;
            this.initLimit();
            this.initSort();
            this.initSection();
            //默认全选
            this.showFields.setAll();
            this.para.setting && this.setting();
        }
        QueryConfig.prototype.initSection = function () {
            var self = this, dom = self.dom.limitDom, optionSection = d.query('.option-section', dom), leftOpenRightClose = query('[data-name="leftOpenRightClose"]'), sectionQuery = query('[data-name="sectionQuery"]'), sectionField = query('[data-name="sectionField"]'), sectionNorm = query('[data-name="sectionNorm"]'), avgSection = query('[data-name="avgSection"]'), numSection = query('[data-name="numSection"]'), fieldCol = query('[data-name="fieldCol"]'), section = query('.section'), customGrading = query('.customGrading'), rightCol = query('.icon-arrow-right-2.col'), closeCol = query('.icon-close.col'), sortRightIcon = d.query('.icon-arrow-right-2.sort', dom), sortCloseIcon = d.query('.icon-close.sort', dom);
            function query(name) {
                return d.query(name, optionSection);
            }
            self.para.cols.forEach(function (col, i) {
                //只显示时间，数值类型
                var dataType = col.atrrs.dataType;
                if (BwRule_1.BwRule.isTime(dataType) || BwRule_1.BwRule.isNumber(dataType) || dataType === BwRule_1.BwRule.DT_BOOL) {
                    self.caption.push({
                        text: col.caption,
                        value: col.name,
                        dataType: dataType,
                        noSum: col.noSum
                    });
                    if (BwRule_1.BwRule.isNumber(dataType) && col.noSum !== 1) {
                        self.numbers.push(i);
                    }
                }
            });
            //无number字段时
            if (!self.caption[0]) {
                self.caption.push({
                    text: '',
                    value: '',
                    dataType: ''
                });
                self.hasNumber = false;
            }
            self.section = new checkBox_1.CheckBox({
                container: sectionQuery,
                text: '分段查询',
                onSet: function (isChecked) {
                    var disData = [leftOpenRightClose, section], disIcon = [sortRightIcon, sortCloseIcon];
                    self.sortFields.dataDelAll();
                    //勾选设置
                    if (isChecked) {
                        self.delDisabled(disData);
                        if (!self.itemCount.get()) {
                            self.setDisabled(disIcon);
                        }
                        self.showNumField();
                        //取消勾选分段字段的选中字段
                        self.showFields.unSet(self.showFields.transIndex([self.sectionField.get()]));
                    }
                    else {
                        self.setDisabled(disData);
                        if (!self.itemCount.get()) {
                            self.delDisabled(disIcon);
                        }
                    }
                }
            });
            self.leftOpenRightClose = new checkBox_1.CheckBox({
                container: leftOpenRightClose,
                text: '区间左开右闭'
            });
            //分段字段
            self.sectionField = new selectInput_1.SelectInput({
                container: sectionField,
                data: self.caption,
                readonly: true,
                clickType: 0,
                onSet: function (item) {
                    self.toggleNorm(item.dataType);
                    //控制勾选
                    self.showNumField();
                    self.showFields.unSet(self.showFields.transIndex([item.value]));
                }
            });
            //分段标准
            self.sectionNorm = new selectInput_1.SelectInput({
                container: sectionNorm,
                readonly: true,
                clickType: 0,
                data: self.normField
            });
            //宽度
            self.avgSectionTrue = new numInput_1.NumInput({
                container: numSection,
                className: 'average',
                defaultNum: 1,
                min: 1,
            });
            //段位
            self.avgSectionFalse = new numInput_1.NumInput({
                container: numSection,
                className: 'customize',
                defaultNum: 0
            });
            //平均，自定义
            self.avgSection = new selectBox_1.SelectBox({
                select: {
                    multi: false,
                    callback: function () {
                        self.toggleAvg();
                    }
                },
                container: avgSection,
                data: [{
                        value: '1',
                        text: '平均段位'
                    }, {
                        value: '2',
                        text: '自定义段位'
                    }]
            });
            //段位列表
            self.fieldCol = new dropdown_1.DropDown({
                el: fieldCol,
                inline: true,
                className: 'field-col'
            });
            //list
            self.listSelect(self.fieldCol.getUlDom());
            //rightBtn
            d.on(rightCol, 'click', function () {
                var num = self.avgSectionFalse.get(), colData = self.fieldCol.getData(), isExist = false;
                colData.forEach(function (e) {
                    if (num === e.value) {
                        isExist = true;
                    }
                });
                if (!isExist) {
                    self.fieldCol.dataAdd([{
                            text: num.toString(),
                            value: num
                        }]);
                }
            });
            //close
            self.deleteField(closeCol, fieldCol, self.fieldCol);
            //分段字段
            self.sectionField.set(self.caption[0].value);
            //分段标准
            self.sectionNorm.set('dayofyear');
            self.setDisabled([leftOpenRightClose, section]);
            var customize = d.query('.customize', dom);
            customize.classList.add('hide');
            if (!self.hasNumber) {
                self.setDisabled([sectionQuery]);
            }
        };
        QueryConfig.prototype.initLimit = function () {
            var self = this, dom = self.dom.limitDom, optionLimit = query('.option-limit'), itemRepeat = limitQuery('[data-name="itemRepeat"]'), itemCount = limitQuery('[data-name="itemCount"]'), itemSumCount = limitQuery('[data-name="itemSumCount"]'), topN = limitQuery('[data-name="topN"] .topN'), restrictionFirst = limitQuery('[data-name="restrictionFirst"]'), sectionQuery = query('[data-name="sectionQuery"]'), sortRightIcon = query('.icon-arrow-right-2.sort'), groupRightIcon = query('.icon-arrow-right-2.group'), sortCloseIcon = query('.icon-close.sort'), optionSection = query('.option-section'), groupCloseIcon = query('.icon-close.group');
            function limitQuery(name) {
                return d.query(name, optionLimit);
            }
            function query(name) {
                return d.query(name, dom);
            }
            //topN
            self.topN = new numInput_1.NumInput({
                container: topN,
                min: 0,
                className: 'topN-input',
                callback: function () {
                    if (self.topN && self.topN.get() >= 0) {
                        self.delDisabled([restrictionFirst]);
                    }
                    else {
                        self.setDisabled([restrictionFirst]);
                    }
                }
            });
            //项不重复
            self.itemRepeat = new checkBox_1.CheckBox({
                container: itemRepeat,
                text: '项不重复'
            });
            //仅查项数
            self.itemCount = new checkBox_1.CheckBox({
                container: itemCount,
                text: '仅查项数',
                onSet: function (isChecked) {
                    var disData = [itemSumCount, sortRightIcon, sortCloseIcon];
                    if (isChecked) {
                        if (self.section.get()) {
                            self.setDisabled([itemSumCount]);
                        }
                        else {
                            self.setDisabled(disData);
                        }
                        self.sortFields.dataDelAll();
                        self.showFields.set([]);
                    }
                    else {
                        if (self.section.get()) {
                            self.delDisabled([itemSumCount]);
                        }
                        else {
                            self.delDisabled(disData);
                        }
                    }
                }
            });
            //仅查总数
            self.itemSumCount = new checkBox_1.CheckBox({
                container: itemSumCount,
                text: '仅查总数',
                onSet: function (isChecked) {
                    var disData = [itemCount, sortRightIcon, sortCloseIcon, groupCloseIcon, groupRightIcon];
                    self.sortFields.dataDelAll();
                    self.groupByFields.dataDelAll();
                    if (isChecked) {
                        // if(self.section.get() === 1) {
                        //     self.section.checked = true
                        // }
                        self.setDisabled(disData);
                        self.showNumField();
                    }
                    else {
                        self.delDisabled(disData);
                    }
                    if (self.hasNumber) {
                        self.toggleDisabled([optionSection]);
                    }
                }
            });
            //限制在先
            self.restrictionFirst = new checkBox_1.CheckBox({
                container: restrictionFirst,
                text: '限制在先'
            });
            restrictionFirst.classList.add('disabled');
        };
        QueryConfig.prototype.initSort = function () {
            var self = this, dom = d.query('.multi-select', self.para.limitDom), leftDom = d.query('.select-left', dom), rightDom = d.query('.select-right', dom), iconDom = d.query('.icon-box', dom), allSelect = d.query('.all-select', dom), allDec = d.query('.all-dec', dom), caption = [];
            self.para.cols.forEach(function (e) {
                caption.push({
                    text: e.caption,
                    value: e.name,
                    dataType: e.dataType,
                    noSum: e.noSum
                });
            });
            //显示字段
            this.showFields = new dropdown_1.DropDown({
                el: leftDom,
                data: caption,
                multi: true,
                inline: true,
                className: 'show-field'
            });
            //排序字段
            this.sortFields = new dropdown_1.DropDown({
                el: rightDom,
                multi: true,
                inline: true,
                className: 'sort-field'
            });
            //分组字段
            this.groupByFields = new dropdown_1.DropDown({
                el: rightDom,
                inline: true,
                className: 'group-field'
            });
            //list
            this.listSelect(self.showFields.getUlDom());
            this.listSelect(self.groupByFields.getUlDom());
            this.listSelect(self.sortFields.getUlDom());
            //right
            self.rightBtnEven(d.query('.icon-arrow-right-2.sort', iconDom), self.sortFields);
            self.rightBtnEven(d.query('.icon-arrow-right-2.group', iconDom), self.groupByFields);
            d.on(d.query('.icon-arrow-right-2.group', iconDom), 'click', function () {
                if (d.query('li.select', leftDom)) {
                    var groupData = self.groupByFields.getData(), fieldData_1 = self.showFields.getData(), nums_1 = self.numbers.slice(0);
                    //显示字段默认勾选存在分组中的字段
                    groupData.forEach(function (e) {
                        fieldData_1.forEach(function (f, i) {
                            if (e.value === f.value) {
                                var hasNum_1 = false;
                                nums_1.forEach(function (n) {
                                    if (n === i) {
                                        hasNum_1 = true;
                                    }
                                });
                                if (!hasNum_1) {
                                    nums_1.push(i);
                                    hasNum_1 = false;
                                }
                            }
                        });
                    });
                    self.showFields.set([]);
                    self.showFields.addSelected(nums_1);
                    var num = self.showFields.get(), index_1 = d.query('li.select', dom) ? parseInt(d.query('li.select', dom).dataset.index) : null, isExist_1 = false;
                    if (index_1) {
                        num.forEach(function (e) {
                            if (e === index_1) {
                                isExist_1 = true;
                            }
                        });
                        if (!isExist_1) {
                            self.showFields.addSelected([index_1]);
                        }
                    }
                }
            });
            //close
            self.deleteField(d.query('.icon-close.sort', iconDom), d.query('.sort-field', rightDom), self.sortFields);
            self.deleteField(d.query('.icon-close.group', iconDom), d.query('.group-field', rightDom), self.groupByFields);
            d.on(allDec, 'click', function () {
                self.showFields.set([]);
                self.showFields.transIndex(['1']);
            });
            d.on(allSelect, 'click', function () {
                self.showFields.setAll();
            });
        };
        /**
         * 获取参数
         * @param save 是否保存
         * @returns {dataConfigPara}
         */
        QueryConfig.prototype.getPara = function (save) {
            if (save === void 0) { save = false; }
            var self = this, p = self.p;
            // 项不重复
            p.itemRepeat = self.itemRepeat.get();
            //仅查项数
            if (self.itemCount.get()) {
                p.itemCount = true;
                p.itemSumCount = false;
                //仅查总数
            }
            else if (self.itemSumCount.get()) {
                p.itemCount = false;
                p.itemSumCount = true;
            }
            else {
                p.itemCount = false;
                p.itemSumCount = false;
            }
            //topN
            if (self.topN.get() || self.topN.get() === 0) {
                self.p.topN = self.topN.get();
            }
            else {
                self.p.topN = null;
            }
            //限制在先
            p.restrictionFirst = (self.p.topN >= 0 && self.restrictionFirst.get());
            if (self.p.topN === null) {
                p.restrictionFirst = false;
            }
            //分段查询--与仅查总数不同时为true
            if (self.section.get() && !self.itemSumCount.get() || save) {
                p.section = self.section.get();
                //区间左开右闭
                p.sectionParams.leftOpenRightClose = self.leftOpenRightClose.get();
                //分段字段
                p.sectionParams.sectionField = self.sectionField.get();
                //分段标准
                if (self.isNorm) {
                    p.sectionParams.sectionNorm = self.sectionNorm.get();
                }
                else {
                    p.sectionParams.sectionNorm = '';
                }
                //宽度，段位列表
                if (self.avgSection.get()[0] === 0) {
                    p.sectionParams.avgSection = true;
                    p.sectionParams.sections = [self.avgSectionTrue.get()];
                }
                else {
                    p.sectionParams.avgSection = false;
                    var data_1 = self.fieldCol.getData(), values_1 = [];
                    data_1.forEach(function (d) {
                        values_1.push(d.value);
                    });
                    p.sectionParams.sections = values_1;
                }
            }
            else {
                p.section = false;
                // p.sectionParams = null;
            }
            //获取分组字段
            var groupData = self.groupByFields.getData(), values = [];
            if (groupData) {
                groupData.forEach(function (d) {
                    values.push(d.value);
                });
            }
            p.groupByFields = values;
            //获取显示字段
            var showFieldData = self.showFields.getData(), showSelect = self.showFields.get() || [], showValues = [];
            if (showSelect && showSelect[0]) {
                showSelect.forEach(function (s) {
                    // showFieldData.forEach(function (d, i) {
                    // if(s === i){
                    showValues.push(s.value);
                    // }
                    // })
                });
            }
            //分组字段必定要显示
            values.forEach(function (v) {
                var isExist = false;
                showValues.forEach(function (s) {
                    if (v === s) {
                        isExist = true;
                    }
                });
                if (!isExist) {
                    showValues.push(v);
                }
            });
            //全选默认不传
            if (showFieldData.length === showSelect.length) {
                showValues = null;
            }
            p.showFields = showValues;
            //获取排序字段
            var sortData = self.sortFields.getData(), select = self.sortFields.get(), sortValues = [];
            if (sortData) {
                sortData.forEach(function (d, i) {
                    var para = d.value;
                    select.forEach(function (e) {
                        if (i === e) {
                            para = d.value + ',desc';
                        }
                    });
                    if (typeof para !== 'undefined') {
                        sortValues.push(para);
                    }
                });
            }
            p.sortFields = sortValues;
            //剔除空数据
            // console.log(p,'before');
            var data = {};
            if (p.section === true || save) {
                data = { sectionParams: {} };
            }
            for (var key in p) {
                var d_1 = p[key];
                if (d_1 === false || d_1 === null) {
                }
                else if ((key === 'sortFields' && !d_1[0]) || (key === 'groupByFields' && !d_1[0])) {
                }
                else if (key === 'sectionParams') {
                    if (p.section === true || save) {
                        for (var item in p.sectionParams) {
                            if (!tools.isEmpty(d_1[item])) {
                                data.sectionParams[item] = d_1[item];
                            }
                        }
                    }
                }
                else if (!tools.isEmpty(p)) {
                    data[key] = d_1;
                }
            }
            if (save) {
                data.sectionNumber = self.avgSectionFalse.get();
            }
            // console.log(data,'after');
            return data;
        };
        /**
         * 从cols中取caption或者其他
         * @param name 索引名
         * @param type 要获取的属性
         * @returns {Array}
         */
        QueryConfig.prototype.getColCaption = function (name, type) {
            var cols = this.para.cols, caption = [];
            name.forEach(function (n) {
                cols.forEach(function (c) {
                    if (c.name === n) {
                        caption.push(c[type]);
                    }
                });
            });
            return caption;
        };
        /**
         * 保存
         */
        QueryConfig.prototype.setting = function () {
            var self = this, data = self.para.setting;
            // console.log(data,'setting');
            //分段字段set值
            var sectionField = data.sectionParams;
            if (sectionField) {
                //先开启分段查询
                self.section.checked = true;
                //左开右闭
                data.sectionParams.leftOpenRightClose && (self.leftOpenRightClose.checked = true);
                //分段字段
                self.sectionField.set(sectionField.sectionField);
                //分段标准
                self.sectionNorm && self.normField.forEach(function (n) {
                    if (n.value === sectionField.sectionNorm) {
                        self.sectionNorm.set(n.value);
                    }
                });
                //自定义
                if (sectionField.avgSection === false) {
                    self.avgSection.addSelected([1]);
                    self.toggleAvg();
                    //段位
                    self.avgSectionFalse.set(data.sectionNumber);
                    //段位列表
                    sectionField.sections && sectionField.sections.forEach(function (s) {
                        self.fieldCol.dataAdd([{
                                text: s.toString(),
                                value: s
                            }]);
                    });
                }
                else {
                    //平均段位
                    self.avgSectionTrue.set(sectionField.sections[0]);
                }
                //若无分段，关闭分段
                !data.section && (self.section.checked = false);
            }
            //限制字段checkbox
            for (var key in data) {
                var d_2 = data[key];
                if (d_2 === true && key !== 'section' && key !== 'restrictionFirst') {
                    //按钮命名与字段名相同
                    self[key].checked = true;
                }
                else if (key === 'topN') {
                    self.topN.set(d_2);
                    //限制在先
                    if (data.restrictionFirst) {
                        self.restrictionFirst.checked = true;
                    }
                }
            }
            var _loop_1 = function (key) {
                var d_3 = data[key];
                if (!data.showFields) {
                    this_1.showFields.setAll();
                }
                if (key === 'showFields') {
                    //显示字段不为空
                    if (d_3[0]) {
                        self.showFields.set(self.showFields.transIndex(d_3));
                    }
                }
                else if (key === 'sortFields' || key === 'groupByFields') {
                    //排序,分组
                    d_3.forEach(function (sort) {
                        var sortValue = sort.replace(',desc', ''), text = self.getColCaption([sortValue], 'caption')[0];
                        if (tools.isNotEmpty(text)) {
                            self[key].dataAdd([{
                                    text: text,
                                    value: sort.replace(',desc', '')
                                }]);
                            //降序时
                            if (sort.indexOf(',desc') >= 0) {
                                self.sortFields.addSelected(self.sortFields.transIndex([sortValue]));
                            }
                        }
                    });
                }
            };
            var this_1 = this;
            //显示字段dropDown set值操作
            for (var key in data) {
                _loop_1(key);
            }
        };
        /**
         * list选中事件
         * @param dom  ul dom
         */
        QueryConfig.prototype.listSelect = function (dom) {
            d.on(dom, 'click', 'li.drop-item', function () {
                var selectDom = d.query('li.select', dom);
                if (selectDom) {
                    selectDom.classList.remove('select');
                }
                this.classList.add('select');
            });
        };
        /**
         * 字段删除
         * @param icon 按钮dom
         * @param dom  要索引的dom
         * @param dropDown
         */
        QueryConfig.prototype.deleteField = function (icon, dom, dropDown) {
            d.on(icon, 'click', function () {
                var selectDom = d.query('li.select', dom);
                if (selectDom) {
                    var index = parseInt(selectDom.dataset.index);
                    dropDown.dataDel(index);
                }
            });
        };
        /**
         * 字段添加
         * @param dom 容器
         * @param dropDown
         */
        QueryConfig.prototype.rightBtnEven = function (dom, dropDown) {
            var self = this, leftDom = d.query('.select-left', self.para.limitDom);
            d.on(dom, 'click', function () {
                var selectDom = d.query('li.select', leftDom), isExist = false;
                if (selectDom) {
                    var index = parseInt(selectDom.dataset.index);
                    if (dropDown === self.sortFields) {
                        judgeExist(self.sortFields);
                    }
                    else {
                        judgeExist(self.groupByFields);
                    }
                    if (!isExist) {
                        dropDown.dataAdd([{
                                text: self.dom.cols[index].caption,
                                value: self.dom.cols[index].name
                            }]);
                    }
                }
                function judgeExist(dropDom) {
                    if (dropDom.getData()) {
                        dropDom.getData().forEach(function (k) {
                            if (k.text === selectDom.textContent) {
                                isExist = true;
                            }
                        });
                    }
                }
            });
        };
        /**
         * 控制显示字段只显示number字段
         */
        QueryConfig.prototype.showNumField = function () {
            this.showFields.set(this.numbers);
        };
        /**
         * 平均，自定义
         */
        QueryConfig.prototype.toggleAvg = function () {
            var self = this, dom = self.dom.limitDom, section = d.query('.option-section .section', dom), widthInput = query('.average'), spanSegment = query('.segment'), spanWidth = query('.width'), customGrading = query('.customGrading'), iconDom = query('.icon-box-2'), fieldCol = query('[data-name="fieldCol"]'), customInput = d.query('.customize', section);
            function query(name) {
                return d.query(name, section);
            }
            if (self.avgSection.get()[0] === 0) {
                self.addHide([iconDom, fieldCol, spanSegment, customInput]);
                self.removeHide([spanWidth, widthInput]);
            }
            else if (self.avgSection.get()[0] === 1) {
                self.removeHide([iconDom, fieldCol, spanSegment, customInput]);
                self.addHide([spanWidth, widthInput]);
            }
        };
        /**
         * 显示或隐藏分段标准
         * @param dataType
         */
        QueryConfig.prototype.toggleNorm = function (dataType) {
            var sectionNorm = d.query('[data-name="sectionNorm"]', this.para.limitDom);
            if (BwRule_1.BwRule.isTime(dataType)) {
                this.isNorm = true;
                sectionNorm.classList.remove('hide');
            }
            else {
                this.isNorm = false;
                sectionNorm.classList.add('hide');
            }
        };
        /**
         * disabled
         * @param dom
         */
        QueryConfig.prototype.toggleDisabled = function (dom) {
            dom.forEach(function (d) {
                if (d.classList.contains('disabled')) {
                    d.classList.remove('disabled');
                }
                else {
                    d.classList.add('disabled');
                }
            });
        };
        QueryConfig.prototype.setDisabled = function (dom) {
            dom.forEach(function (d) {
                d.classList.add('disabled');
            });
        };
        QueryConfig.prototype.delDisabled = function (dom) {
            dom.forEach(function (d) {
                d.classList.remove('disabled');
            });
        };
        QueryConfig.prototype.addHide = function (dom) {
            dom.forEach(function (d) {
                d.classList.add('hide');
            });
        };
        QueryConfig.prototype.removeHide = function (dom) {
            dom.forEach(function (d) {
                d.classList.remove('hide');
            });
        };
        /**
         * 获取分段名
         * @returns {string}
         */
        QueryConfig.prototype.getSection = function () {
            var section = d.query('[data-name="sectionField"] input', this.dom.limitDom);
            return section.value;
        };
        return QueryConfig;
    }());
    exports.QueryConfig = QueryConfig;
});

define("AsynQuery", ["require", "exports", "Button", "SlideUp"], function (require, exports, Button_1, SlideUp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="AsynQuery"/>
    var d = G.d;
    var tools = G.tools;
    var AsynQuery = /** @class */ (function () {
        function AsynQuery(para) {
            this.query = [];
            this.para = para;
            console.log(para, 'asyn');
            this.init();
        }
        AsynQuery.prototype.init = function () {
            var _this = this;
            var asynData = this.para.asynData, body = d.create("<ul class=\"asyn-ul\"></ul>");
            asynData.forEach(function (obj) {
                _this.liTpl(obj, body);
            });
            new SlideUp_1.SlideUp({
                container: this.para.dom ? this.para.dom : document.body,
                contentEl: body,
                contentTitle: '查询记录',
                width: 305,
                isShow: true,
                className: 'asynQuery'
            });
        };
        AsynQuery.prototype.liTpl = function (data, body) {
            var _this = this;
            var state, isDisabled = false, query;
            switch (data.taskState) {
                case '0':
                    state = '查看';
                    break;
                case '1':
                    state = '查询失败';
                    isDisabled = true;
                    break;
                case '2':
                    state = '正在查询';
                    isDisabled = true;
                    break;
            }
            var li = d.create("<li class=\"asyn-li\">\n            <div class=\"asyn-left\">\n                <div class=\"asyn-time\">\u65F6\u95F4\uFF1A" + data.createTime + "</div>\n            </div>\n            <div class=\"asyn-right\">\n               \n            </div>       \n        </li>");
            body.appendChild(li);
            var btn = new Button_1.Button({
                container: d.query('.asyn-left', li),
                type: 'link',
                icon: 'history-record',
                onClick: function () {
                    // 隐藏其他查询框
                    tools.isMb && _this.para.query.hide();
                    for (var item in _this.query) {
                        if (item !== data.taskId) {
                            _this.query[item].hide();
                        }
                    }
                    if (data.taskId in _this.query) {
                        _this.query[data.taskId].show();
                        return;
                    }
                    // 生成查询
                    var queryModuleName = BW.sys.isMb ? 'QueryModuleMb' : 'QueryModulePc', qm = _this.para.qm;
                    qm.setting.setContent = JSON.stringify(data.queryStr);
                    require([queryModuleName], function (Query) {
                        _this.query[data.taskId] = new Query({
                            qm: qm,
                            refresher: function () { },
                            cols: [],
                            url: null,
                            container: _this.para.container,
                            tableGet: function () { return null; }
                        });
                        var modal = _this.query[data.taskId].modal;
                        if (tools.isMb) {
                            d.query('.mbPage-body', modal.bodyWrapper).classList.add('disabled');
                            d.query('.mbPage-right', modal.bodyWrapper).classList.add('disabled');
                        }
                        else {
                            d.query('.tab-content', modal.bodyWrapper).classList.add('disabled');
                            d.query('h1', modal.modalHeader.wrapper).innerHTML = '时间：' + data.createTime;
                            modal.modalFooter.wrapper.classList.add('hide');
                        }
                    });
                }
            });
            btn.getDom().title = '查看记录';
            new Button_1.Button({
                content: state,
                container: d.query('.asyn-right', li),
                type: 'primary',
                isDisabled: isDisabled,
                onClick: function () {
                    // if(!this.loading){
                    //     this.loading = new Loading({});
                    // }else {
                    //     this.loading.show()
                    // }
                    _this.para.query.para.refresher({
                        taskId: data.taskId
                    }, function () {
                        // this.loading.hide();
                    });
                    _this.para.query.hide();
                    for (var item in _this.query) {
                        _this.query[item].hide();
                    }
                }
            });
        };
        return AsynQuery;
    }());
    exports.AsynQuery = AsynQuery;
});

/// <amd-module name="HorizontalQueryModule"/>
define("HorizontalQueryModule", ["require", "exports", "SelectInput", "Datetime", "NumInput", "TextInput", "BwRule", "BasicBoxGroup", "Button"], function (require, exports, selectInput_1, datetime_1, numInput_1, text_1, BwRule_1, selectBoxGroup_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var HorizontalQueryModule = /** @class */ (function (_super) {
        __extends(HorizontalQueryModule, _super);
        function HorizontalQueryModule(para) {
            var _this = _super.call(this, para) || this;
            _this.defaultData = _this.getDefaultData(para.qm.queryparams1);
            _this.search = para.search;
            _this.__initForms(para);
            if (_this.forms.length > 0 && (para.qm.queryType == 1 || para.qm.queryType == 3)) {
                d.append(d.query('.query-form', _this.wrapper), h("div", { className: "form-com-item" },
                    h(Button_1.Button, { className: "query-search-btn", content: "\u67E5\u8BE2", onClick: function () {
                            typeof _this.search === 'function' && _this.search(_this.json);
                        } })));
            }
            // 自定义内容
            d.append(d.query('.query-form', _this.wrapper), _this.extraWrapper);
            return _this;
        }
        HorizontalQueryModule.prototype.wrapperInit = function (para) {
            return h("div", { className: "horizontalQueryModule" });
        };
        Object.defineProperty(HorizontalQueryModule.prototype, "extraWrapper", {
            get: function () {
                if (!this._extraWrapper) {
                    this._extraWrapper = h("div", { className: "extra-wrapper" });
                }
                return this._extraWrapper;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HorizontalQueryModule.prototype, "search", {
            get: function () {
                return this._search;
            },
            set: function (flag) {
                this._search = flag;
            },
            enumerable: true,
            configurable: true
        });
        // 获取默认数据
        HorizontalQueryModule.prototype.getDefaultData = function (data) {
            var obj = {};
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                obj[item.field_name] = item.atrrs.defaultValue || '';
            }
            return obj;
        };
        // 初始化FormCom控件
        HorizontalQueryModule.prototype.__initForms = function (para) {
            var _this = this;
            var cond = para.qm.queryparams1 || [];
            this.forms = [];
            tools.isNotEmpty(this.wrapper) && d.append(this.wrapper, h("div", { className: "query-form" }, cond.map(function (c) {
                var extra = {};
                if (para.qm.queryType == 2 || para.qm.queryType == 4) {
                    extra.onSet = function () {
                        typeof _this.search === 'function' && _this.search(_this.json);
                    };
                }
                var com, props = Object.assign({}, {
                    custom: c,
                    showFlag: true,
                    placeholder: c.caption,
                }, extra), fieldName = c.field_name, type = c.type || c.atrrs.dataType;
                switch (type) {
                    case 'VALUELIST':
                        com = h(selectInput_1.SelectInput, __assign({ clickType: 0, readonly: true, data: tools.isEmpty(c.value_list) ? [] : c.value_list.map(function (res) {
                                var data = _this.formatData(res);
                                return { text: data.title, value: data.value };
                            }), ajax: tools.isEmpty(c.link) ? void 0 : {
                                fun: function (url, val, callback) {
                                    _this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name).then(function (result) {
                                        typeof callback === 'function' && callback(result);
                                    });
                                }
                            } }, props));
                        break;
                    case 'VALUE':
                        com = h(selectInput_1.SelectInput, __assign({ clickType: 0, readonly: true, data: tools.isEmpty(c.value_list) ? [] : c.value_list.map(function (res) {
                                var data = _this.formatData(res);
                                return { text: data.title, value: data.value };
                            }), ajax: tools.isEmpty(c.link) ? void 0 : {
                                fun: function (url, val, callback) {
                                    _this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name).then(function (result) {
                                        typeof callback === 'function' && callback(result);
                                    });
                                }
                            } }, props));
                        break;
                    case 'QRYVALUE':
                        com = h(selectInput_1.SelectInput, __assign({ clickType: 0, readonly: true, data: tools.isEmpty(c.value_list) ? [] : c.value_list.map(function (res) {
                                var data = _this.formatData(res);
                                return { text: data.title, value: data.value };
                            }), ajax: tools.isEmpty(c.link) ? void 0 : {
                                fun: function (url, val, callback) {
                                    _this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name).then(function (result) {
                                        typeof callback === 'function' && callback(result);
                                    });
                                }
                            } }, props));
                        break;
                    case 'RESVALUE':
                        com = h(selectInput_1.SelectInput, __assign({ clickType: 0, readonly: true, data: tools.isEmpty(c.value_list) ? [] : c.value_list.map(function (res) {
                                var data = _this.formatData(res);
                                return { text: data.title, value: data.value };
                            }), ajax: tools.isEmpty(c.link) ? void 0 : {
                                fun: function (url, val, callback) {
                                    _this.getDropDownData(BW.CONF.siteUrl + c.link, c.field_name).then(function (result) {
                                        typeof callback === 'function' && callback(result);
                                    });
                                }
                            } }, props));
                        break;
                    case '12':
                        com = h(datetime_1.Datetime, __assign({ format: "yyyy-MM-dd" }, props));
                        break;
                    case '13':
                        com = h(datetime_1.Datetime, __assign({ format: "yyyy-MM-dd HH:mm:ss" }, props));
                        break;
                    case '10':
                        com = h(numInput_1.NumInput, __assign({ defaultNum: 0 }, props));
                        break;
                    default:
                        com = h(text_1.TextInput, __assign({}, props));
                }
                if (fieldName in _this.defaultData) {
                    tools.isNotEmpty(_this.defaultData[fieldName])
                        && com.set(_this.defaultData[fieldName]);
                }
                _this.forms.push(com);
                return props.showFlag ? h("div", { className: "form-com-item" },
                    h("div", { className: "form-com-title" }, c.caption + '：'),
                    com) : com.wrapper && d.remove(com.wrapper);
            })));
        };
        Object.defineProperty(HorizontalQueryModule.prototype, "json", {
            // 获取数据
            get: function () {
                var json = {};
                this.forms.forEach(function (form) {
                    var cond = form.custom, value = form.value;
                    json.params = json.params || [];
                    if (form instanceof selectBoxGroup_1.BasicBoxGroup && Array.isArray(value)) {
                        value = value.join(',');
                    }
                    value = Array.isArray(value) ? value : [value];
                    if (!(value.length === 1 && tools.isEmpty(value[0]))) {
                        if (!(value.length === 2 && tools.isEmpty(value[0]) && tools.isEmpty(value[1]))) {
                            json.params.push([cond.field_name, value]);
                        }
                    }
                });
                for (var key in json) {
                    json[key] = JSON.stringify(json[key]);
                }
                return json;
            },
            enumerable: true,
            configurable: true
        });
        HorizontalQueryModule.prototype.getDropDownData = function (url, fieldName) {
            return new Promise(function (resolve, reject) {
                if (tools.isEmpty(url)) {
                    reject();
                }
                else {
                    BwRule_1.BwRule.Ajax.fetch(url).then(function (_a) {
                        var response = _a.response;
                        var fields = [];
                        if (response.data[0]) {
                            fields = Object.keys(response.data[0]);
                        }
                        var options = response.data.map(function (data) {
                            return {
                                value: data[fieldName],
                                text: fields.map(function (key) { return data[key]; }).join(','),
                            };
                        });
                        resolve(options);
                    });
                }
            });
        };
        HorizontalQueryModule.prototype.formatData = function (data) {
            if (data === void 0) {
                return undefined;
            }
            return {
                title: typeof data === 'string' ? data : data.title,
                value: typeof data === 'string' ? data : data.value,
            };
        };
        HorizontalQueryModule.prototype.destroy = function () {
            this.forms && this.forms.forEach(function (form) {
                form.destroy();
            });
            this.forms = null;
            this.search = null;
            _super.prototype.destroy.call(this);
        };
        return HorizontalQueryModule;
    }(Component));
    exports.HorizontalQueryModule = HorizontalQueryModule;
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="components/Component.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
