define("EditModule", ["require", "exports", "AssignModule", "UploadModule", "AssignTextModule", "PickModule", "TextInput", "SelectInput", "Virtual", "CheckBox", "Datetime", "RichText", "RichTextMb", "SelectInputMb", "DatetimeMb", "Toggle", "LookupModule", "Validate", "Modal", "BwRule", "RichTextModal"], function (require, exports, assignModule_1, uploadModule_1, assignTextModule_1, pickModule_1, text_1, selectInput_1, virtual_1, checkBox_1, datetime_1, richText_1, richTextMb_1, selectInput_mb_1, datetimeInput_mb_1, toggle_1, lookupModule_1, validate_1, Modal_1, BwRule_1, richTextModal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="EditModule"/>
    var tools = G.tools;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var EditModule = /** @class */ (function () {
        function EditModule(para) {
            var _this = this;
            this.para = para;
            this.coms = {};
            this.comsExtraData = {};
            this.nameFields = {};
            this.ajax = new BwRule_1.BwRule.Ajax();
            this.comTnit = {
                pickInput: function (p) {
                    // console.log(dom,field,6)
                    return new pickModule_1.PickModule({
                        container: p.dom,
                        field: p.field,
                        data: p.data,
                        dataGet: function () { return p.data ? p.data : _this.get(); },
                        onGetData: function (dataArr, otherField) {
                            _this.pickOnGet(p, dataArr, otherField);
                        }
                    });
                },
                tagsInput: function (p) {
                    if (_this.para.type === 'table') {
                        return _this.comTnit['assignText'](p);
                    }
                    else {
                        var sepValue = ';';
                        return new assignModule_1.default({
                            data: p.data,
                            container: p.dom,
                            name: p.field.name,
                            pickerUrl: p.field.dataAddr ? CONF.siteUrl + BwRule_1.BwRule.reqAddr(p.field.dataAddr) : '',
                            ajaxUrl: p.field.assignAddr ? CONF.siteUrl + BwRule_1.BwRule.reqAddr(p.field.assignAddr) : '',
                            multi: true,
                            sepValue: sepValue,
                            onSet: _this.getAssignSetHandler(p.field),
                            onGetData: function (dataArr, otherField) {
                                _this.pickOnGet(p, dataArr, otherField);
                            }
                        });
                    }
                },
                assignText: function (p) {
                    return new assignTextModule_1.AssignTextModule({
                        data: p.data,
                        container: p.dom,
                        name: p.field.name,
                        pickerUrl: p.field.dataAddr ? CONF.siteUrl + BwRule_1.BwRule.reqAddr(p.field.dataAddr) : '',
                        ajaxUrl: p.field.assignAddr ? CONF.siteUrl + BwRule_1.BwRule.reqAddr(p.field.assignAddr) : '',
                        onSet: _this.getAssignSetHandler(p.field),
                        onGetData: function (dataArr, otherField) {
                            _this.pickOnGet(p, dataArr, otherField);
                        }
                    });
                },
                file: function (p) {
                    var com = new uploadModule_1.default({
                        nameField: p.field.name,
                        container: p.dom,
                        uploadUrl: BW.CONF.ajaxUrl.fileUpload,
                        onComplete: function (response) {
                            var _a;
                            var data = response.data;
                            // if(!this.para.fields.some(f => f.field.name.toLowerCase() === data['md5Field'].key.toLowerCase())) {
                            //     Modal.alert('无法找到附件，附件是否进行过改造');
                            //     com.com.text = '';
                            //     return;
                            // }
                            //fileId 值加入额外数据中
                            var upperKeyData = {};
                            for (var field in data) {
                                var _b = data[field], key = _b.key, value = _b.value;
                                upperKeyData[key.toLocaleUpperCase()] = tools.str.toEmpty(value);
                            }
                            p.onExtra && p.onExtra(upperKeyData, Object.keys(upperKeyData));
                            _this.comsExtraData[p.field.name] = {};
                            for (var name_1 in upperKeyData) {
                                if (_this.coms[name_1]) {
                                    _this.set((_a = {}, _a[name_1] = upperKeyData[name_1], _a));
                                }
                                else {
                                    _this.comsExtraData[p.field.name][name_1] = data[name_1];
                                }
                            }
                        }
                    });
                    return com;
                },
                richText: function (p) {
                    var Rich = sys.isMb ? richTextMb_1.RichTextMb : richText_1.RichText;
                    return new Rich({
                        container: p.dom
                    });
                },
                richTextInput: function (p) {
                    return new richTextModal_1.RichTextModal({
                        container: p.dom,
                    });
                },
                text: function (p) {
                    return new text_1.TextInput({
                        container: p.dom,
                    });
                },
                selectInput: function (p) {
                    if (p.field.elementType === 'lookup') {
                        return new lookupModule_1.LookupModule({
                            container: p.dom,
                            field: p.field,
                            rowData: p.data,
                            onExtra: function (item) {
                                if (item) {
                                    setTimeout(function () {
                                        var _a;
                                        var data = (_a = {},
                                            _a[p.field.name] = item.text,
                                            _a[p.field.lookUpKeyField] = item.value,
                                            _a);
                                        p.onExtra(data, [p.field.lookUpKeyField]);
                                    }, 100);
                                }
                            }
                        });
                    }
                    else {
                        var ajaxFun = function (url, value, cb) {
                            BwRule_1.BwRule.Ajax.fetch(url, {
                                needGps: p.field.dataAddr.needGps
                            }).then(function (_a) {
                                var response = _a.response;
                                var fields = [];
                                if (response.data[0]) {
                                    fields = Object.keys(response.data[0]);
                                }
                                var options = response.data.map(function (data) {
                                    // id name 都添加到条件
                                    return {
                                        value: data[p.field.name],
                                        text: fields.map(function (key) { return data[key]; }).join(','),
                                    };
                                });
                                cb(options);
                            }).finally(function () {
                                cb();
                            });
                        };
                        var valueList = p.field.atrrs.valueLists ? p.field.atrrs.valueLists.split(/,|;/) : null, comData = Array.isArray(valueList) ? valueList : null, ajax = p.field.dataAddr ? { fun: ajaxFun, url: CONF.siteUrl + BwRule_1.BwRule.reqAddr(p.field.dataAddr, p.data) } : null;
                        return new (sys.isMb ? selectInput_mb_1.SelectInputMb : selectInput_1.SelectInput)({
                            container: p.dom,
                            data: comData,
                            ajax: ajax,
                            useInputVal: true
                            // readonly: field.noEdit
                        });
                    }
                },
                virtual: function (p) {
                    return new virtual_1.Virtual();
                },
                toggle: function (p) {
                    if (_this.para.type === 'table') {
                        return new selectInput_1.SelectInput({
                            container: p.dom,
                            data: [
                                { value: '1', text: '是' },
                                { value: '0', text: '否' }
                            ]
                        });
                    }
                    else {
                        if (sys.isMb) {
                            return new toggle_1.Toggle({ container: p.dom });
                        }
                        else {
                            return new checkBox_1.CheckBox({ container: p.dom });
                        }
                    }
                },
                datetime: function (p) {
                    return new (sys.isMb ? datetimeInput_mb_1.DatetimeMb : datetime_1.Datetime)({
                        container: p.dom,
                        format: p.field.displayFormat,
                    });
                },
                // 流程引擎附件
                accessory: function (p) {
                    // return new Accessory({
                    //     container: p.dom
                    // });
                    return null;
                }
            };
            this.assign = (function () {
                var init = function (com, p) {
                    if (!p) {
                        return;
                    }
                    var field = p.field, data = p.data, onExtra = p.onExtra;
                    if (field && (p.field.comType === 'tagsinput')) {
                        return;
                    }
                    com.onSet = function (val) {
                        var _a;
                        // debugger;
                        // setTimeout(() => {
                        //     if(val == com.get()){
                        //         return;
                        //     }
                        data = data || {};
                        if (data[field.name] != val) {
                            assignSend(field, val, Object.assign({}, data, (_a = {}, _a[field.name] = val, _a)), onExtra);
                        }
                        // }, 30);
                    };
                };
                var assign2extra = function (field, assignData) {
                    // assign 设置
                    var sepValue = ';', selectFields = field.assignSelectFields, fieldName = field.name;
                    // debugger;
                    Array.isArray(selectFields) && selectFields.forEach(function (key) {
                        var _a;
                        var data = assignData[key];
                        if (key === fieldName) {
                            return;
                        }
                        if (_this.coms[key]) {
                            _this.set((_a = {}, _a[key] = data, _a));
                        }
                        else {
                            //assign 值加入额外数据中
                            if (!_this.comsExtraData[fieldName]) {
                                _this.comsExtraData[fieldName] = {};
                            }
                            _this.comsExtraData[fieldName][key] = data;
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
                var assignSend = function (field, val, data, onExtra) {
                    if (tools.isEmpty(val) || tools.isEmpty(field.assignAddr)) {
                        return;
                    }
                    _this.ajax.fetch(CONF.siteUrl + BwRule_1.BwRule.reqAddr(field.assignAddr, data), {
                        cache: true,
                    }).then(function (_a) {
                        var response = _a.response;
                        var resData = tools.keysVal(response, 'data', 0), assignData = assignDataGet(val, resData);
                        for (var key in assignData) {
                            assignData[key] = Array.isArray(assignData[key]) ? assignData[key].join(';') : '';
                        }
                        assign2extra(field, assignData);
                        // debugger;
                        onExtra && onExtra(assignData, field.assignSelectFields, true);
                    });
                };
                var checkAssign = function (data, onExtra) {
                    for (var fieldName in data) {
                        var field = _this.nameFields[fieldName];
                        if (field && field.field && field.field.assignAddr) {
                            assignSend(field.field, data[fieldName], data, onExtra);
                        }
                    }
                };
                return { init: init, assign2extra: assign2extra, assignSend: assignSend, checkAssign: checkAssign };
            })();
            this.validate = (function () {
                var v = null;
                var init = function () {
                    if (v !== null) {
                        return;
                    }
                    v = new validate_1.Validate();
                    // for(let name in this.nameFields){
                    //     let field = this.nameFields[name].field;
                    //     ruleAdd(field);
                    // }
                };
                var ruleAdd = function (field) {
                    // 防止重复添加
                    if (v.get(field.name)) {
                        return;
                    }
                    var rules = [];
                    if (BwRule_1.BwRule.isNumber(field.dataType)) {
                        if (tools.isNotEmpty(field.caption)) {
                            rules.push({
                                rule: 'number',
                                title: field.caption
                            });
                        }
                        else {
                            rules.push({
                                rule: 'number'
                            });
                        }
                    }
                    ['maxLength', 'maxValue', 'minLength', 'minValue', 'requieredFlag', 'regExp'].forEach(function (ruleName) {
                        var ruleVal = field.atrrs[ruleName];
                        if (!tools.isEmpty(ruleVal)) {
                            rules.push({
                                rule: ruleName,
                                value: ruleVal,
                            });
                        }
                    });
                    v.add(field.name, rules);
                };
                var valid = function (name, data) {
                    var _a;
                    var com = _this.coms[name], f = _this.nameFields[name];
                    if (com && f) {
                        ruleAdd(f.field);
                        data = tools.isUndefined(data) ? _this.get(f.field.name)[f.field.name] : data;
                        return v.start((_a = {}, _a[name] = data, _a));
                    }
                };
                var start = function (name, data) {
                    if (v === null) {
                        init();
                    }
                    var result = {};
                    if (name) {
                        result = valid(name, data);
                    }
                    else {
                        _this.para.fields.forEach(function (f) {
                            result = tools.obj.merge(valid(f.field.name), result);
                        });
                    }
                    return result;
                };
                return { start: start };
            })();
            if (Array.isArray(para.fields)) {
                para.fields.forEach(function (f) {
                    _this.nameFields[f.field.name] = f;
                });
                if (typeof para.auto === 'undefined' || para.auto) {
                    for (var _i = 0, _a = para.fields; _i < _a.length; _i++) {
                        var f = _a[_i];
                        this.init(f.field.name);
                    }
                }
            }
        }
        Object.defineProperty(EditModule.prototype, "assignPromise", {
            get: function () {
                return this.ajax.promise;
            },
            enumerable: true,
            configurable: true
        });
        EditModule.prototype.getDom = function (name) {
            return this.coms[name];
        };
        /**
         * 外部初始化调用
         * @param name
         * @param p
         */
        EditModule.prototype.init = function (name, p) {
            var f = this.nameFields[name];
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
        };
        EditModule.prototype.pickOnGet = function (cip, dataArr, otherField) {
            var _this = this;
            var name = cip.field.name, fieldNames = otherField ? otherField.split(',') : [];
            dataArr.forEach(function (data) {
                var _loop_1 = function (key) {
                    if (!_this.comsExtraData[name]) {
                        _this.comsExtraData[name] = {};
                    }
                    fieldNames && fieldNames.forEach(function (f) {
                        if (f === key) {
                            _this.comsExtraData[name][key] = data[key];
                        }
                    });
                };
                for (var key in data) {
                    _loop_1(key);
                }
            });
            if (this.comsExtraData[name] && cip.onExtra) {
                cip.onExtra(tools.obj.copy(this.comsExtraData[name]), fieldNames);
            }
            this.assign.checkAssign(this.comsExtraData[name], cip.onExtra);
        };
        EditModule.tableComTypeGet = function (type) {
            var map = {
                richText: 'richTextInput',
            };
            return type in map ? map[type] : type;
        };
        /**
         * 初始化控件工厂
         * @param type - 类型
         * @param initP
         * @return {FormCom}
         */
        EditModule.prototype.initFactory = function (type, initP) {
            this.para.type === 'table' && (type = EditModule.tableComTypeGet(type));
            var field = initP ? initP.field : null;
            if (field) {
                if (field.multiPick && field.name === 'ELEMENTNAMELIST' || field.elementType === 'pick') {
                    type = 'pickInput';
                }
                else if (field.elementType === 'value' || field.elementType === 'lookup' || field.atrrs.valueLists) {
                    type = 'selectInput';
                }
            }
            if (!(type in this.comTnit)) {
                type = 'text';
            }
            if (!initP || !initP.dom) {
                type = 'virtual';
            }
            var com = this.comTnit[type](initP);
            this.assign.init(com, initP);
            return com;
        };
        ;
        EditModule.prototype.getAssignSetHandler = function (field) {
            var _this = this;
            var sepValue = ';';
            return function (assignData) {
                // assign 设置
                if (typeof assignData !== 'object') {
                    return;
                }
                var selectFields = field.assignSelectFields;
                Array.isArray(selectFields) && selectFields.forEach(function (key) {
                    var _a;
                    var data = assignData && Array.isArray(assignData[key]) ? assignData[key].join(sepValue) : '';
                    if (_this.coms[key]) {
                        if (key !== field.name) {
                            _this.set((_a = {}, _a[key] = data, _a));
                        }
                    }
                    else {
                        //assign 值加入额外数据中
                        if (!_this.comsExtraData[field.name]) {
                            _this.comsExtraData[field.name] = {};
                        }
                        _this.comsExtraData[field.name][key] = data;
                    }
                });
            };
        };
        /**
         * 设置值
         * @param data
         */
        EditModule.prototype.set = function (data) {
            var coms = this.coms;
            for (var name_2 in data) {
                if (!coms[name_2]) {
                    //页面没有这个输入控件，则启用虚拟输入控件
                    coms[name_2] = this.initFactory('virtual', this.nameFields[name_2]);
                }
                //给控件赋值
                coms[name_2].set(tools.str.toEmpty(data[name_2]));
            }
        };
        /**
         * 获取值
         * @param [name] - 指定返回某个控件的值
         * @return obj
         */
        EditModule.prototype.get = function (name) {
            var _this = this;
            var pageData = {}, coms = this.coms, extras = this.comsExtraData;
            var allDateGet = function (name) {
                var _a;
                var extra = extras[name], dataObj = (_a = {}, _a[name] = coms[name].get(), _a);
                // 字符串转数字
                for (var name_3 in dataObj) {
                    var field = tools.keysVal(_this.nameFields, name_3, 'field'), data = dataObj[name_3];
                    if (!field) {
                        continue;
                    }
                    if (data && !isNaN(data) && BwRule_1.BwRule.isNumber(field.dataType)) {
                        data = Number(data);
                    }
                    dataObj[name_3] = BwRule_1.BwRule.maxValue(data, field.dataType, field.atrrs.maxValue);
                }
                return extra ? tools.obj.merge(extra, dataObj) : dataObj;
            };
            // 返回指定name的数据
            if (name) {
                return allDateGet(name);
            }
            // 返回所有数据
            for (var n in coms) {
                pageData = tools.obj.merge(pageData, allDateGet(n));
            }
            return pageData;
        };
        EditModule.checkValue = function (field, rowData, clear) {
            var name = field.name, chkAddr = field.chkAddr, checkCols = field.chkAddr.varList.map(function (v) { return v.varName; }), emptyCheckResult = { errors: [], okNames: [] };
            for (var _i = 0, checkCols_1 = checkCols; _i < checkCols_1.length; _i++) {
                var colName = checkCols_1[_i];
                if (rowData[colName] === null || (typeof rowData[colName]) === 'undefined') {
                    emptyCheckResult.errors.push({ name: colName, msg: '不能为空' });
                }
                else {
                    emptyCheckResult.okNames.push(colName);
                }
            }
            return new Promise(function (resolve) {
                if (emptyCheckResult.errors[0]) {
                    resolve(emptyCheckResult);
                    return;
                }
                var _a = BwRule_1.BwRule.reqAddrFull(chkAddr, rowData), addr = _a.addr, data = _a.data;
                // checkValue验证
                BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + addr, {
                    silent: true,
                    type: 'POST',
                    data: [data],
                }).then(function (_a) {
                    var response = _a.response;
                    var data = tools.keysVal(response, 'body', 'bodyList', 0), _b = data || { type: '', showText: '' }, type = _b.type, showText = _b.showText;
                    if (type === 0) {
                        // Modal.alert(showText);
                        // errorStyle(showText);
                        resolve({
                            errors: [{ name: name, msg: showText }],
                        });
                    }
                    else {
                        if (type === 1) {
                            Modal_1.Modal.confirm({
                                msg: showText,
                                callback: function (flag) {
                                    if (!flag) {
                                        clear();
                                    }
                                }
                            });
                        }
                        resolve({
                            okNames: chkAddr.varList.map(function (v) { return v.varName; })
                        });
                    }
                }).catch(function () {
                    resolve({
                        okNames: chkAddr.varList.map(function (v) { return v.varName; })
                    });
                });
            });
        };
        EditModule.prototype.destroy = function (name) {
            if (this.coms[name]) {
                this.coms[name].destroy();
                this.comsExtraData[name] = null;
                delete this.coms[name];
            }
        };
        return EditModule;
    }());
    exports.EditModule = EditModule;
    function assignDataGet(data, resData) {
        var assignValueArr = {}, assignData = {};
        if (typeof resData !== 'object' || !resData) {
            return assignData;
        }
        var keyArr = Object.keys(resData);
        keyArr.forEach(function (key) {
            var data = resData[key];
            assignValueArr[key] = typeof data === 'string' ? data.split(';') : [data];
        });
        (typeof data === 'string' ? data.split(';') : [data]).forEach(function (v, i) {
            if (tools.isEmpty(v)) {
                return;
            }
            // let assignD : obj = {};
            keyArr.forEach(function (key) {
                if (!assignData[key]) {
                    assignData[key] = [];
                }
                assignData[key].push(assignValueArr[key][i]);
            });
        });
        return assignData;
    }
});

define("LookupModule", ["require", "exports", "FormCom", "SelectInput", "SelectInputMb", "BwRule"], function (require, exports, basic_1, selectInput_1, selectInput_mb_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sys = BW.sys;
    var tools = G.tools;
    var LookupModule = /** @class */ (function (_super) {
        __extends(LookupModule, _super);
        function LookupModule(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.options = [];
            _this.selectInput = new (sys.isMb ? selectInput_mb_1.SelectInputMb : selectInput_1.SelectInput)({
                container: _this.para.container,
                ajax: {
                    fun: function (url, val, cb) {
                        _this.ajax(cb);
                    }
                },
                readonly: !!para.field.noEdit,
                onSet: function (item, index) {
                    _this.set(item.value);
                    _this.para.onExtra && _this.para.onExtra(item);
                }
            });
            return _this;
        }
        LookupModule.prototype.ajax = function (callback) {
            var _this = this;
            var _a = this.para, field = _a.field, rowData = _a.rowData;
            BwRule_1.BwRule.getLookUpOpts(field, rowData).then(function (options) {
                _this.options = options;
                callback(options ? options.map(function (o) { return Object.assign({}, o); }) : []);
            });
        };
        LookupModule.prototype.get = function () {
            return this.value;
        };
        LookupModule.prototype.set = function (value) {
            this.value = value;
        };
        Object.defineProperty(LookupModule.prototype, "value", {
            get: function () {
                return this.selectInput.getText();
            },
            set: function (value) {
                var _this = this;
                value = (typeof value === 'object' && value !== null) ? value.value : value;
                if (tools.isEmpty(this.options)) {
                    this.ajax(function (options) {
                        _this.selectInput.setPara({
                            data: options
                        });
                        for (var i = 0; i < options.length; i++) {
                            var option = options[i];
                            if (option.value === value) {
                                _this.selectInput.set(option);
                                typeof _this.onSet === 'function' && _this.onSet(option);
                                break;
                            }
                        }
                    });
                }
                else {
                    for (var i = 0; i < this.options.length; i++) {
                        var option = this.options[i];
                        if (option.value === value) {
                            this.selectInput.set(option);
                            typeof this.onSet === 'function' && this.onSet(option);
                            break;
                        }
                    }
                    // this.selectInput.set(value);
                    // typeof this.onSet === 'function' && this.onSet(value);
                }
            },
            enumerable: true,
            configurable: true
        });
        LookupModule.prototype.wrapperInit = function (para) {
            return undefined;
        };
        return LookupModule;
    }(basic_1.FormCom));
    exports.LookupModule = LookupModule;
});

define("PickModule", ["require", "exports", "Modal", "SelectBox", "DropDown", "TextInput", "Spinner", "BwRule", "NewTablePage"], function (require, exports, Modal_1, selectBox_1, dropdown_1, text_1, spinner_1, BwRule_1, newTablePage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="PickModule"/>
    var d = G.d;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var PickModule = /** @class */ (function (_super) {
        __extends(PickModule, _super);
        function PickModule(para) {
            var _this = _super.call(this, {
                icons: ['iconfont icon-arrow-down'],
                readonly: true,
                iconHandle: function () {
                    _this.pickInit();
                },
                container: para.container,
            }) || this;
            _this.component = [];
            _this.p = para;
            return _this;
        }
        PickModule.prototype.pickInit = function () {
            if (!this.modal) {
                var self_1 = this, isDefault = true, 
                // dataGet = this.p.dataGet(),
                ajaxData = void 0, dataAddr = void 0;
                if (this.p.field.multiPick) {
                    //元素列表
                    dataAddr = self_1.p.field.multiPick.dataAddr;
                    // ajaxUrl = CONF.siteUrl + Rule.reqAddr(dataAddr, dataGet);
                }
                else if (this.p.field.elementType === 'pick') {
                    //表格pick
                    dataAddr = self_1.p.field.dataAddr;
                    self_1.body = h("div", null);
                    ajaxData = { output: 'json' };
                    isDefault = false;
                }
                self_1.ajaxLoad(CONF.siteUrl + BwRule_1.BwRule.reqAddr(dataAddr, this.p.dataGet()), ajaxData, isDefault);
            }
            else {
                this.modal.isShow = true;
            }
        };
        PickModule.prototype.getData = function () {
            var self = this;
            var elementData = '';
            //获取数据
            if (!self.p.field.multiPick) {
                var data_1 = [], getData = self.bwTable.tableModule.main.ftable.selectedRowsData;
                getData.forEach(function (s) {
                    for (var key in s) {
                        if (key === self.fromField) {
                            data_1.push(s[key]);
                        }
                    }
                });
                // set数据
                self.set(data_1.join(';'));
                // 传给后台的otherField
                self.p.onGetData(getData, self.otherField);
            }
            else {
                // let comsExtraData = [] ;
                for (var item in self.component) {
                    var data = self.component[item].getSelect();
                    data[0] && data.forEach(function (d, i) {
                        elementData += d.text + ';';
                        // comsExtraData.push(data[i]);
                    });
                }
                elementData = elementData.substr(0, elementData.length - 1);
                //set数据
                self.set(elementData);
            }
            self.modal.isShow = false;
        };
        /**
         * 数据加载
         * @param ajaxUrl
         * @param ajaxData
         * @param isDefault
         */
        PickModule.prototype.ajaxLoad = function (ajaxUrl, ajaxData, isDefault) {
            var self = this;
            //加载效果
            if (self.p.field.multiPick) {
                self.spinner = new spinner_1.Spinner({
                    el: d.query('.btn-group', self.p.container),
                    type: 1
                });
                self.spinner.show();
            }
            BwRule_1.BwRule.Ajax.fetch(ajaxUrl, {
                data: ajaxData
            }).then(function (_a) {
                var response = _a.response;
                if (self.p.field.multiPick) {
                    self.multiPick(response);
                    self.spinner.hide();
                }
                else {
                    var res = response.body.elements[0];
                    self.modalInit();
                    self.bwTable = new newTablePage_1.BwTableElement({
                        tableEl: res,
                        container: self.body
                    });
                    self.fromField = res.fromField;
                    self.otherField = res.otherField;
                }
            });
        };
        PickModule.prototype.modalInit = function () {
            var _this = this;
            var width = '', className = 'modal-pick';
            if (sys.os === 'pc') {
                width = '500px';
            }
            else {
                if (this.p.field.multiPick) {
                    className = 'modal-multiPick';
                }
                else {
                    width = '300px';
                }
            }
            this.modal = new Modal_1.Modal({
                body: this.body,
                header: this.p.field.caption,
                className: className,
                width: width,
                height: '80%',
                container: d.closest(this.para.container, '.page-container[data-src]'),
                isBackground: false,
                footer: {},
                top: 40,
                isMb: false
            });
            this.modal.onOk = function () {
                _this.getData();
            };
        };
        /**
         * 生成multi
         * @param response
         */
        PickModule.prototype.multiPick = function (response) {
            var self = this;
            var data = response.data;
            // console.log(data,7)
            if (data[0]) {
                this.body = h("div", { className: "element-box" });
            }
            else {
                this.body = h("div", null, "\u6682\u65E0\u6570\u636E");
            }
            //第一层
            data.forEach(function (o) {
                self.Dom = h("div", { className: "element-col" });
                self.body.appendChild(self.Dom);
                self.titleAppend(o, 'one-trees');
                var oneFloor = [];
                //第二层
                o.child.forEach(function (t) {
                    if (t.child[0]) {
                        var twoFloor_1 = [];
                        self.titleAppend(t, 'two-trees', o);
                        //第三层
                        t.child.forEach(function (s) {
                            if (s.child[0]) {
                                var threeFloor_1 = [];
                                self.titleAppend(s, 'three-trees', o);
                                //第四层
                                s.child.forEach(function (f) {
                                    self.dataPush(threeFloor_1, f);
                                });
                                //创建组件
                                threeFloor_1[0] && self.createComponent(threeFloor_1, s, 'four-trees');
                            }
                            else {
                                self.dataPush(twoFloor_1, s);
                            }
                        });
                        //创建组件
                        twoFloor_1[0] && self.createComponent(twoFloor_1, t, 'three-trees');
                    }
                    else {
                        self.dataPush(oneFloor, t);
                    }
                });
                //创建组件
                oneFloor[0] && self.createComponent(oneFloor, o, 'two-trees');
            });
            self.modalInit();
        };
        /**
         * 生成multi的title
         * @param element
         * @param parentElement
         * @param style 类
         */
        PickModule.prototype.titleAppend = function (element, style, parentElement) {
            var parentId = parentElement && parentElement.ELEMENTTYPEID;
            if (parentElement && parentId === 1 || parentId === 2) {
                this.createComponent([{
                        text: element.ELEMENTNAME,
                        value: element.ELEMENTID
                    }], element, 'two-trees');
            }
            else {
                //title
                var title = h("h5", { className: style }, element.ELEMENTNAME);
                element.MEMO && title.setAttribute('title', element.MEMO);
                this.Dom.appendChild(title);
            }
        };
        /**
         * 获取数据集
         * @param arr
         * @param element
         */
        PickModule.prototype.dataPush = function (arr, element) {
            arr.push({
                value: element.ELEMENTID,
                text: element.ELEMENTNAME
            });
        };
        /**
         * 生成selectBox或dropDown
         * @param data
         * @param resData
         * @param style
         */
        PickModule.prototype.createComponent = function (data, resData, style) {
            //生成selectBox
            if (resData.ELEMENTTYPEID === 1) {
                var dropDom = h("div", { className: style });
                this.Dom.appendChild(dropDom);
                this.component[resData.ELEMENTID] = new selectBox_1.SelectBox({
                    select: {
                        multi: false,
                        isRadioNotchecked: resData.REQUIRED === 0,
                        callback: function () {
                            // console.log(resData)
                        }
                    },
                    container: dropDom,
                    data: data,
                });
                //生成dropDown
            }
            else {
                this.component[resData.ELEMENTID] = new dropdown_1.DropDown({
                    el: this.Dom,
                    data: data,
                    multi: true,
                    inline: true,
                    className: style,
                    onMultiSelect: function () {
                        // console.log(12)
                    }
                });
            }
        };
        return PickModule;
    }(text_1.TextInput));
    exports.PickModule = PickModule;
});

define("AssignModule", ["require", "exports", "AssignModuleBasic", "TagsInput", "Modal", "BwRule"], function (require, exports, assignModuleBasic_1, tagsInput_1, Modal_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="AssignModule"/>
    var tools = G.tools;
    var AssignModule = /** @class */ (function (_super) {
        __extends(AssignModule, _super);
        function AssignModule(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            // private assignData : obj[] = [];
            _this.assignData = {};
            // private contactModal : G.Modal;
            _this.ajax = new BwRule_1.BwRule.Ajax();
            _this.para = _this.paraInit(para);
            _this.tagsInput = new tagsInput_1.TagsInput(_this.para);
            _this.initDeleteEvent();
            var pickDom = _this.para.container.parentElement.querySelector('span[data-action="picker"]');
            _this.para.container.parentElement.dataset.name = para.name;
            _this.initPicker(pickDom, _this.para.pickerUrl, para.data, function (detail) {
                var dataStr = detail.data.map(function (obj) { return obj[detail.fromField]; }).join(';');
                _this.set(dataStr);
                _this.para.onGetData(detail.data, detail.otherField);
            });
            return _this;
        }
        AssignModule.prototype.paraInit = function (para) {
            var _this = this;
            if (!para.ajaxUrl) {
                return;
            }
            para.ajax = function (data) {
                var _a;
                return _this.ajax.fetch(para.ajaxUrl, {
                    cache: true,
                    data: (_a = {}, _a[para.name] = data, _a),
                }).then(function (_a) {
                    var response = _a.response;
                    return ajaxSuccess(data, response);
                });
            };
            var ajaxSuccess = function (data, response) {
                var resData = response.data[0], keyArr = Object.keys(resData), items = [];
                if (!resData[keyArr[0]]) {
                    Modal_1.Modal.alert("\u67E5\u8BE2\"" + data + "\"\u65E0\u7ED3\u679C");
                    return [];
                }
                _this.assignData = _this.assignDataGet(data, resData);
                // let assignValueArr = {};
                // keyArr.forEach( (key) => {
                //     assignValueArr[key] = resData[key].split(this.sepValue);
                // });
                //
                data.split(para.sepValue).forEach(function (v, i) {
                    if (tools.isEmpty(v)) {
                        return;
                    }
                    items.push({
                        value: v,
                        text: _this.assignData[keyArr[0]][i] + '(' + v + ')',
                    });
                });
                _this.para.onSet(_this.assignData);
                return items;
            };
            return para;
        };
        AssignModule.prototype.initDeleteEvent = function () {
            var _this = this;
            this.tagsInput.on('beforeItemRemove', function (event) {
                var deleteIndex = -1;
                _this.tagsInput.get().forEach(function (value, index) {
                    value === event.item && (deleteIndex = index);
                });
                for (var key in _this.assignData) {
                    _this.assignData[key].splice(deleteIndex, 1);
                }
                _this.para.onSet(_this.assignData);
            });
        };
        AssignModule.prototype.get = function () {
            var _this = this;
            var tagsValue = '';
            this.tagsInput.get().forEach(function (tag) {
                tagsValue += tag.value;
                tagsValue += _this.sepValue;
            });
            return tagsValue.slice(0, -1);
        };
        AssignModule.prototype.set = function (data) {
            this.tagsInput.set(data);
        };
        Object.defineProperty(AssignModule.prototype, "value", {
            get: function () {
                var _this = this;
                var tagsValue = '';
                this.tagsInput.get().forEach(function (tag) {
                    tagsValue += tag.value;
                    tagsValue += _this.sepValue;
                });
                return tagsValue.slice(0, -1);
            },
            set: function (data) {
                this.tagsInput.set(data);
            },
            enumerable: true,
            configurable: true
        });
        return AssignModule;
    }(assignModuleBasic_1.AssignModuleBasic));
    exports.default = AssignModule;
});

define("AssignTextModule", ["require", "exports", "AssignModuleBasic", "TextInput"], function (require, exports, assignModuleBasic_1, text_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var AssignTextModule = /** @class */ (function (_super) {
        __extends(AssignTextModule, _super);
        function AssignTextModule(p) {
            var _this = this;
            p.readonly = false;
            _this = _super.call(this, Object.assign({}, p, {
                icons: p.pickerUrl ? ['iconfont icon-arrow-down'] : null
            })) || this;
            _this.para = p;
            _this.assignBasic = new assignModuleBasic_1.AssignModuleBasic();
            if (p.pickerUrl) {
                _this.iconGroup.parentElement.dataset.name = p.name;
                _this.assignBasic.initPicker(_this.iconGroup, _this.para.pickerUrl, p.data, function (detail) {
                    var dataStr = detail.data.map(function (obj) { return obj[detail.fromField]; }).join(';');
                    _this.set(dataStr);
                    _this.para.onGetData(detail.data, detail.otherField);
                });
            }
            return _this;
        }
        AssignTextModule.prototype.set = function (str) {
            if (this.input) {
                this.input.value = str;
            }
            typeof this.onSet === 'function' && this.onSet(str);
        };
        AssignTextModule.prototype.destroy = function () {
            if (this.assignBasic && this.assignBasic.iframe) {
                d.remove(this.assignBasic.iframe.get());
                this.assignBasic.destroy();
            }
        };
        return AssignTextModule;
    }(text_1.TextInput));
    exports.AssignTextModule = AssignTextModule;
});

define("AssignModuleBasic", ["require", "exports", "FormCom", "Modal"], function (require, exports, basic_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="AssignModuleBasic"/>
    var tools = G.tools;
    var d = G.d;
    var sys = BW.sys;
    var AssignModuleBasic = /** @class */ (function (_super) {
        __extends(AssignModuleBasic, _super);
        function AssignModuleBasic() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.sepValue = ';';
            return _this;
        }
        AssignModuleBasic.prototype.get = function () { return undefined; };
        AssignModuleBasic.prototype.set = function () {
            var any = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                any[_i] = arguments[_i];
            }
        };
        Object.defineProperty(AssignModuleBasic.prototype, "value", {
            get: function () { return undefined; },
            set: function (any) { },
            enumerable: true,
            configurable: true
        });
        AssignModuleBasic.prototype.initPicker = function (pickDom, href, data, onSelect) {
            var _this = this;
            var isAppend = true;
            if (pickDom) {
                var captionName_1 = pickDom.parentElement.dataset.name;
                if (sys.isMb) {
                    // this.destroy();
                    this.iframe = tools.iPage(href, { id: 'iframe_' + captionName_1 });
                }
                d.on(pickDom, 'click', function () {
                    // contactModal.show();
                    localStorage.setItem('fromPickCaption', captionName_1);
                    localStorage.setItem('fromPickData', JSON.stringify(tools.str.toEmpty(data)));
                    if (sys.os === 'pc') {
                        if (isAppend) {
                            _this.initIframe(href);
                            isAppend = false;
                        }
                        _this.contactModal.isShow = true;
                    }
                    else {
                        _this.iframe.show();
                    }
                    d.once(window, 'selectContact', function (e) {
                        if (_this.contactModal) {
                            _this.contactModal.isShow = false;
                        }
                        onSelect(e.detail);
                    });
                });
            }
        };
        AssignModuleBasic.prototype.initIframe = function (href) {
            var _this = this;
            /*初始化收件人模态框*/
            if (!href) {
                return;
            }
            var iframe = h("iframe", { className: "pageIframe", src: tools.url.addObj(href, { isMb: true }, false) });
            this.contactModal = new Modal_1.Modal({
                body: iframe,
                className: 'contact-modal',
            });
            iframe.onload = function () {
                var contactIframe = _this.contactModal.body, iframeBody = contactIframe.contentDocument.body, ulDom = iframeBody.querySelector('#list ul.mui-table-view'), list = iframeBody.querySelector('#list'), div = document.createElement('div'), htmlDom = h("style", null, "header a.sys-action-back{display: none} .ulOverFlow{ height:448px; overflow-y : auto} #list{height: 100vh}");
                contactIframe.contentDocument.head.appendChild(htmlDom);
                list.querySelector('.mui-scroll').remove();
                var scrollbar = list.querySelector('.mui-scrollbar');
                scrollbar && scrollbar.remove();
                div.classList.add('ulOverFlow');
                div.appendChild(ulDom);
                list.appendChild(div);
            };
        };
        AssignModuleBasic.prototype.assignDataGet = function (data, resData) {
            var _this = this;
            var assignValueArr = {}, assignData = {};
            if (typeof resData !== 'object' || !resData) {
                return assignData;
            }
            var keyArr = Object.keys(resData);
            keyArr.forEach(function (key) {
                var data = resData[key];
                assignValueArr[key] = typeof data === 'string' ? data.split(_this.sepValue) : [data];
            });
            (typeof data === 'string' ? data.split(this.sepValue) : [data]).forEach(function (v, i) {
                if (tools.isEmpty(v)) {
                    return;
                }
                // let assignD : obj = {};
                keyArr.forEach(function (key) {
                    if (!assignData[key]) {
                        assignData[key] = [];
                    }
                    assignData[key].push(assignValueArr[key][i]);
                });
            });
            return assignData;
        };
        AssignModuleBasic.prototype.wrapperInit = function () {
            return undefined;
        };
        return AssignModuleBasic;
    }(basic_1.FormCom));
    exports.AssignModuleBasic = AssignModuleBasic;
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
