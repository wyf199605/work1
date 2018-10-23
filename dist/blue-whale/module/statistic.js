define("StatisticBasic", ["require", "exports", "BwRule", "SelectBox", "statistic", "Modal", "Button", "InputBox", "StatisticBase"], function (require, exports, BwRule_1, selectBox_1, statistic_1, Modal_1, Button_1, InputBox_1, statisticBasic_1) {
    "use strict";
    var _a;
    /// <amd-module name="StatisticBasic"/>
    var dom = G.d;
    var sys = BW.sys;
    return (_a = /** @class */ (function (_super) {
            __extends(StatisticBasic, _super);
            function StatisticBasic(para) {
                var _this = _super.call(this) || this;
                _this.para = para;
                _this.modal = null; //统计表的模态框
                _this.coms = {}; //存放data-type节点
                _this.statisticsContent = []; //存放内容
                _this.statisticsField = []; //存放统计字段
                _this.statisticsRange = []; //存放范围
                _this.groupingField = []; //存放分组字段
                _this.initModal();
                _this.getSelectData();
                _this.replaceDataName();
                return _this;
            }
            /*
             * 获取统计表的模态框
             * */
            StatisticBasic.prototype.getModal = function () {
                return this.modal;
            };
            /*
             * 初始化弹框中需要统计的字段
             * */
            StatisticBasic.prototype.getSelectData = function () {
                var statisticsOptions = [], i, groupingOptions = [];
                var visibleCol = this.para.getVisibleCol();
                for (i = 0; i < this.para.cols.length; i++) {
                    if (BwRule_1.BwRule.isNumber(this.para.cols[i].dataType) && visibleCol.indexOf(this.para.cols[i].name) > -1) {
                        statisticsOptions.push({ value: this.para.cols[i].name, text: this.para.cols[i].title });
                    }
                }
                for (i = 0; i < this.para.cols.length; i++) {
                    if (visibleCol.indexOf(this.para.cols[i].name) > -1) {
                        groupingOptions.push({ value: this.para.cols[i].name, text: this.para.cols[i].title });
                    }
                }
                this.groupingField = groupingOptions;
                this.statisticsField = statisticsOptions;
                this.statisticsContent = [{ value: 'sum', text: '合计值' },
                    { value: 'avg', text: '平均值' },
                    { value: 'max', text: '最大值' },
                    { value: 'min', text: '最小值' },
                    { value: 'stDev', text: '标准差' },
                    { value: 'nullCount', text: '空值数' },
                    { value: 'percent', text: '百分比' },
                    { value: 'groupPercent', text: '组内百分比' }];
                this.statisticsRange = [{ value: '0', text: '全部数据' },
                    { value: '1', text: '选定数据' }];
            };
            /*
             * 替换data-name属性为相应的节点并且将所有节点保存到coms数组中
             * */
            StatisticBasic.prototype.initDataName = function (name, el) {
                var self = this;
                switch (name) {
                    case 'statisticsContent':
                        this.coms['statisticsContent'] = new selectBox_1.SelectBox({
                            container: el,
                            select: {
                                multi: true,
                                callback: function (index) {
                                    var statisticsContent = self.coms['statisticsContent'];
                                    function contains(val) {
                                        for (var i = 0; i < statisticsContent.get().length; i++) {
                                            if (statisticsContent.get()[i] === val) {
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                    if (index === 6) {
                                        statisticsContent.unSet([7]);
                                        if (contains(6)) {
                                            statisticsContent.unsetDisabled([7]);
                                        }
                                        else {
                                            statisticsContent.setDisabled([7]);
                                        }
                                    }
                                }
                            },
                            data: this.statisticsContent
                        });
                        break;
                    case 'statisticsField':
                        if (this.statisticsField.length > 0) {
                            this.coms['statisticsField'] = new selectBox_1.SelectBox({
                                container: el,
                                select: {
                                    multi: true
                                },
                                data: this.statisticsField
                            });
                        }
                        else {
                            el.innerHTML = "无可统计的字段";
                        }
                        break;
                    case 'statisticsRange':
                        this.coms['statisticsRange'] = new selectBox_1.SelectBox({
                            container: el,
                            select: {
                                multi: false
                            },
                            data: this.statisticsRange
                        });
                        break;
                    case 'groupingField':
                        if (this.statisticsField.length > 0) {
                            this.coms['groupingField'] = new selectBox_1.SelectBox({
                                container: el,
                                select: {
                                    multi: false,
                                    isRadioNotchecked: true,
                                    callback: function (index) {
                                        function getIndex() {
                                            for (var i = 0; i < self.statisticsField.length; i++) {
                                                if (self.statisticsField[i].value === self.groupingField[index].value) {
                                                    return i;
                                                }
                                            }
                                        }
                                        var statisticsField = self.coms['statisticsField'], statisticsContent = self.coms['statisticsContent'], groupingField = self.coms['groupingField'];
                                        if (self.lastIndex >= 0) {
                                            statisticsField.unsetDisabled([self.lastIndex]);
                                        }
                                        if (getIndex() >= 0) {
                                            statisticsField.unSet([getIndex()]);
                                            statisticsField.setDisabled([getIndex()]);
                                            self.lastIndex = getIndex();
                                        }
                                        statisticsContent.unSet([1, 2, 3, 4, 5]);
                                        if (groupingField.get().length > 0) {
                                            statisticsContent.setDisabled([1, 2, 3, 4, 5]);
                                            statisticsContent.unsetDisabled([6]);
                                        }
                                        else {
                                            statisticsContent.unSet([1, 2, 3, 4, 5, 6, 7]);
                                            statisticsContent.unsetDisabled([1, 2, 3, 4, 5]);
                                            statisticsContent.setDisabled([6]);
                                            if (self.lastIndex >= 0) {
                                                statisticsField.unsetDisabled([self.lastIndex]);
                                            }
                                        }
                                    }
                                },
                                data: this.groupingField
                            });
                        }
                        else {
                            el.innerHTML = "无可统计的字段";
                        }
                        break;
                }
            };
            /*
             * 初始化统计表模态框
             * */
            StatisticBasic.prototype.initModal = function () {
                var self = this;
                var okFun = function () {
                    if (self.statisticsField.length === 0) {
                        return false;
                    }
                    var stats = [], i = 0, cols = [], result, statisticsContent = self.coms['statisticsContent'].get(), statisticsField = self.coms['statisticsField'].get(), groupingField = '';
                    for (i = 0; i < statisticsContent.length; i++) {
                        if (statisticsContent[i] === 7) {
                            statisticsContent.splice(i, 1);
                        }
                    }
                    if (self.coms['groupingField'].get().length > 0) {
                        groupingField = self.groupingField[self.coms['groupingField'].get()[0]].value;
                    }
                    for (i = 0; i < statisticsContent.length; i++) {
                        stats.push({
                            title: StatisticBasic.mathMethodCn[self.statisticsContent[statisticsContent[i]].value],
                            method: statistic_1.Statistic.math[self.statisticsContent[statisticsContent[i]].value]
                        });
                    }
                    for (i = 0; i < statisticsField.length; i++) {
                        cols.push(self.statisticsField[self.coms['statisticsField'].get()[i]].value);
                    }
                    result = self.colStatistic(cols, stats, groupingField);
                    self.tableRender(result, self.para.container);
                    return false;
                };
                if (sys.isMb) {
                    this.modal = new Modal_1.Modal({
                        header: '统计',
                        position: 'full',
                        isOnceDestroy: true
                    });
                    this.modal.modalHeader.rightPanel = (function () {
                        var rightInputBox = new InputBox_1.InputBox(), okBtn = new Button_1.Button({
                            key: 'okBtn',
                            content: '确认',
                            type: 'primary',
                            onClick: okFun
                        });
                        rightInputBox.addItem(okBtn);
                        return rightInputBox;
                    })();
                    this.modal.bodyWrapper.setAttribute('style', 'height:calc(100vh - 44px);');
                    this.modal.bodyWrapper.parentElement.classList.add('statistic');
                }
                else {
                    this.modal = new Modal_1.Modal({
                        header: '统计',
                        className: 'statistic',
                        width: '560px',
                        container: this.para.container,
                        isBackground: false,
                        footer: {},
                        isOnceDestroy: true
                    });
                }
                this.modal.onOk = okFun;
            };
            /*
             * 替换dom中含有data-name属性的节点
             * */
            StatisticBasic.prototype.replaceDataName = function () {
                var _this = this;
                this.body = this.modal.bodyWrapper;
                var tpl = StatisticBasic.getDom();
                this.body.innerHTML = tpl;
                dom.queryAll('[data-name]', this.body).forEach(function (el) {
                    _this.initDataName(el.dataset.name, el);
                });
                var statisticsContent = this.coms['statisticsContent'];
                statisticsContent.setDisabled([6, 7]);
            };
            /*
            * 获取某一列在表格数据中的序号
            * */
            StatisticBasic.prototype.colName2index = function (col) {
                for (var i = 0; i < this.para.cols.length; i++) {
                    if (this.para.cols[i].name === col) {
                        return i;
                    }
                }
            };
            /*
            * 统计过程
            * */
            StatisticBasic.prototype.colStatistic = function (cols, stats, groupCol) {
                var self = this, confCols = cols.map(function (col) { return self.para.cols[self.colName2index(col)]; }), // 参数 cols
                colsData = cols.map(function (col) { return self.para.colDataGet(col); }), groupColData = {}, statConf = {
                    cols: null,
                    data: null,
                };
                if (groupCol) {
                    // 用分组的数据作为键值
                    var groupConfCol = self.para.cols[self.colName2index(groupCol)];
                    self.para.colDataGet(groupCol).forEach(function (data, i) {
                        // data = <string>data;
                        var colData = cols.map(function (col, j) {
                            return colsData[j][i];
                        });
                        if (!(data in groupColData)) {
                            groupColData[data] = [];
                        }
                        if (!groupColData[data][0]) {
                            groupColData[data] = colData.map(function (cd) { return [cd]; });
                        }
                        else {
                            groupColData[data].forEach(function (arr, i) {
                                arr.push(colData[i]);
                            });
                        }
                    });
                    var totalArr_1 = [];
                    var _loop_1 = function (col) {
                        var i = 0;
                        groupColData[col].map(function (data) {
                            if (!totalArr_1[i]) {
                                totalArr_1[i] = 0;
                            }
                            totalArr_1[i] = totalArr_1[i] + statistic_1.Statistic.math.sum(data);
                            i++;
                        });
                    };
                    for (var col in groupColData) {
                        _loop_1(col);
                    }
                    var _loop_2 = function (col) {
                        if (!groupColData.hasOwnProperty(col)) {
                            return "continue";
                        }
                        var j = -1;
                        groupColData[col] = groupColData[col].map(function (data) {
                            return stats.map(function (stat) {
                                if (stat.title !== '百分比') {
                                    return stat.method(data);
                                }
                                else {
                                    j++;
                                    return statistic_1.Statistic.math.percent(data, totalArr_1[j]);
                                }
                            });
                        });
                    };
                    for (var col in groupColData) {
                        _loop_2(col);
                    }
                    statConf.cols = [groupConfCol].concat((function () {
                        var newCols = [];
                        confCols.forEach(function (confCol) {
                            stats.forEach(function (stat) {
                                var tmpConfCol = G.tools.obj.copy(confCol);
                                tmpConfCol.title = tmpConfCol.title + stat.title;
                                tmpConfCol.name = tmpConfCol.name + stat.title;
                                if (tmpConfCol.name.match('百分比')) {
                                    tmpConfCol.dataType = BwRule_1.BwRule.DT_PERCENT;
                                }
                                newCols.push(tmpConfCol);
                            });
                        });
                        return newCols;
                    })());
                    statConf.data = (function () {
                        var data = [];
                        Object.keys(groupColData).forEach(function (groupData) {
                            var d = {};
                            d[groupCol] = groupData;
                            groupColData[groupData].forEach(function (statData, colIndex) {
                                stats.forEach(function (stat, statIndex) {
                                    d[confCols[colIndex].name + stat.title] = statData[statIndex];
                                });
                            });
                            data.push(d);
                        });
                        return data;
                    })();
                }
                else {
                    statConf.cols = [{ title: '统计', name: '_method' }].concat(confCols);
                    statConf.data = stats.map(function (stat) {
                        var data = { '_method': stat.title };
                        // data['_method'] = stat.title;
                        colsData.forEach(function (dataArr, i) {
                            data[cols[i]] = stat.method(dataArr.slice(0));
                        });
                        return data;
                    });
                }
                return statConf;
            };
            /*
             * 初始化界面Dom
             * */
            StatisticBasic.getDom = function () {
                return '<div class="row">' +
                    '<div class="col-xs-5">' +
                    '<fieldset class="col-xs-12">' +
                    '<legend>内容</legend>' +
                    '<div class="statisticsContent">' +
                    '<div data-name="statisticsContent"></div>' +
                    '</div>' +
                    '</fieldset>' +
                    '<fieldset class="col-xs-12">' +
                    '<legend>范围</legend>' +
                    '<div class="statisticsRange">' +
                    '<div data-name="statisticsRange"></div>' +
                    '</div>' +
                    '</fieldset>' +
                    '</div>' +
                    '<fieldset class="col-xs-3">' +
                    '<legend>统计字段</legend>' +
                    '<div class="statisticsField">' +
                    '<div data-name="statisticsField"></div>' +
                    '</div>' +
                    '</fieldset>' +
                    '<fieldset class="col-xs-3 groupingField_grouping">' +
                    '<legend>分组字段</legend>' +
                    '<div class="groupingField">' +
                    '<div data-name="groupingField"></div>' +
                    '</div>' +
                    '</fieldset>' +
                    '</div>';
            };
            return StatisticBasic;
        }(statisticBasic_1.StatisticBase)),
        _a.mathMethodCn = {
            'sum': '合计值',
            'avg': '平均值',
            'max': '最大值',
            'min': '最小值',
            'stDev': '标准差',
            'nullCount': '空值数',
            'percent': '百分比',
            'groupPercent': '组内百分比',
        },
        _a);
});

define("CrossTabBasic", ["require", "exports", "Button", "Modal", "BwRule", "SelectBox", "statistic", "InputBox", "StatisticBase"], function (require, exports, Button_1, Modal_1, BwRule_1, selectBox_1, statistic_1, InputBox_1, statisticBasic_1) {
    "use strict";
    var dom = G.d;
    var sys = BW.sys;
    return /** @class */ (function (_super) {
        __extends(CrossTabBasic, _super);
        function CrossTabBasic(conf) {
            var _this = _super.call(this) || this;
            _this.conf = conf;
            _this.modal = null; //交叉制表的模态框
            _this.coms = {}; //存放data-type节点
            _this.statisticRow = []; //存放行数据
            _this.statisticCol = []; //存放列数据
            _this.statisticVal = []; //存放值数据
            _this.initModal();
            _this.getSelectData();
            _this.replaceDataName();
            return _this;
        }
        /*
         * 获取交叉制表的模态框
         * */
        CrossTabBasic.prototype.getModal = function () {
            return this.modal;
        };
        /*
         * 初始化弹框中需要统计的字段
         * */
        CrossTabBasic.prototype.getSelectData = function () {
            var statisticsRowAndColOptions = [], i, statisticsValOptions = [];
            var visibleCol = this.conf.getVisibleCol();
            for (i = 0; i < this.conf.cols.length; i++) {
                if (BwRule_1.BwRule.isNumber(this.conf.cols[i].dataType) && visibleCol.indexOf(this.conf.cols[i].name) > -1) {
                    statisticsValOptions.push({ value: this.conf.cols[i].name, text: this.conf.cols[i].title });
                }
            }
            for (i = 0; i < this.conf.cols.length; i++) {
                if (visibleCol.indexOf(this.conf.cols[i].name) > -1) {
                    statisticsRowAndColOptions.push({ value: this.conf.cols[i].name, text: this.conf.cols[i].title });
                }
            }
            this.statisticRow = statisticsRowAndColOptions;
            this.statisticCol = statisticsRowAndColOptions;
            this.statisticVal = statisticsValOptions;
        };
        /*
         * 替换data-name属性为相应的节点并且将所有节点保存到coms数组中
         * */
        CrossTabBasic.prototype.initDataName = function (name, el) {
            var self = this;
            switch (name) {
                case 'row':
                    this.coms['row'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: true,
                            callback: function (index) {
                                self.cancleSame('row', index);
                            }
                        },
                        data: this.statisticRow
                    });
                    break;
                case 'col':
                    this.coms['col'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: true,
                            callback: function (index) {
                                self.cancleSame('col', index);
                            }
                        },
                        data: this.statisticCol
                    });
                    break;
                case 'val':
                    this.coms['val'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: true,
                            callback: function (index) {
                                self.cancleSame('val', index);
                            }
                        },
                        data: this.statisticVal
                    });
                    break;
                case 'statistic_select':
                    this.coms['statistic_select'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: false,
                            callback: function (index) { }
                        },
                        data: [{ value: 0, text: '基于全部数据' }, { value: 1, text: '基于选定数据' }]
                    });
                    break;
                case 'statistic_sum':
                    this.coms['statistic_sum'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: true,
                            callback: function (index) { }
                        },
                        data: [{ value: 0, text: '生成合计值' }]
                    });
                    break;
            }
        };
        /*
         * 初始化交叉制表模态框
         * */
        CrossTabBasic.prototype.initModal = function () {
            var self = this, inputBox = new InputBox_1.InputBox(), savaBtn = new Button_1.Button({
                key: 'savaBtn',
                content: '设为默认值',
                type: 'primary',
                onClick: function () {
                    self.modal.isShow = false;
                }
            });
            var okFun = function () {
                var row = self.coms['row'], col = self.coms['col'], val = self.coms['val'], rowTmp = [], colTmp = [], valTmp = [], i, statistic, result;
                if (row.get().length === 0 || col.get().length === 0 || val.get().length === 0) {
                    Modal_1.Modal.alert('行,列,值不允许为空');
                    return false;
                }
                for (i = 0; i < row.get().length; i++) {
                    rowTmp.push(self.statisticRow[row.get()[i]].value);
                }
                for (i = 0; i < col.get().length; i++) {
                    colTmp.push(self.statisticCol[col.get()[i]].value);
                }
                for (i = 0; i < val.get().length; i++) {
                    valTmp.push(self.statisticVal[val.get()[i]].value);
                }
                if (self.coms['statistic_select'].get()[0] === 1) {
                    if (self.conf.selectedData().length === 0) {
                        Modal_1.Modal.alert("数据为空，无法统计");
                        return;
                    }
                }
                statistic = new statistic_1.Statistic();
                result = statistic.crossTab({
                    row: rowTmp,
                    col: colTmp,
                    val: valTmp,
                    cols: self.conf.cols,
                    data: self.coms['statistic_select'].get()[0] === 0 ? self.conf.allData() : self.conf.selectedData()
                });
                self.tableRender(result, self.conf.container, true);
                // self.modal.isShow = false;
                return false;
            };
            if (sys.isMb) {
                this.modal = new Modal_1.Modal({
                    position: 'full',
                    isOnceDestroy: true,
                    header: '交叉制表'
                });
                this.modal.modalHeader.rightPanel = (function () {
                    var rightInputBox = new InputBox_1.InputBox(), okBtn = new Button_1.Button({
                        key: 'okBtn',
                        content: '确认',
                        type: 'primary',
                        onClick: okFun
                    });
                    rightInputBox.addItem(okBtn);
                    return rightInputBox;
                })();
                this.modal.bodyWrapper.setAttribute('style', 'height:calc(100vh - 44px);');
                this.modal.bodyWrapper.parentElement.classList.add('crossTab');
            }
            else {
                this.modal = new Modal_1.Modal({
                    className: 'crossTab',
                    width: '560px',
                    container: this.conf.container,
                    header: '交叉制表',
                    isBackground: false,
                    footer: {
                        leftPanel: inputBox
                    },
                    isOnceDestroy: true
                });
            }
            this.modal.onOk = okFun;
        };
        /*
         * 替换dom中含有data-name属性的节点
         * */
        CrossTabBasic.prototype.replaceDataName = function () {
            var _this = this;
            this.body = this.modal.bodyWrapper;
            var tpl = CrossTabBasic.getDom();
            this.body.innerHTML = tpl;
            dom.queryAll('[data-name]', this.body).forEach(function (el) {
                _this.initDataName(el.dataset.name, el);
            });
        };
        /*
        * 取消选择相同的行列或者值
        * */
        CrossTabBasic.prototype.cancleSame = function (type, index) {
            var row = this.coms['row'], col = this.coms['col'], val = this.coms['val'], rowSel = G.tools.obj.merge(true, [], row.get()), colSel = G.tools.obj.merge(true, [], col.get()), valSel = G.tools.obj.merge(true, [], val.get()), i;
            rowSel = G.tools.obj.toArr(rowSel);
            colSel = G.tools.obj.toArr(colSel);
            valSel = G.tools.obj.toArr(valSel);
            if (type === 'row') {
                col.set([]);
                val.set([]);
                for (i = 0; i < colSel.length; i++) {
                    if (this.statisticRow[index].value === this.statisticCol[colSel[i]].value) {
                        colSel.splice(i, 1);
                    }
                }
                for (i = 0; i < valSel.length; i++) {
                    if (this.statisticRow[index].value === this.statisticVal[valSel[i]].value) {
                        valSel.splice(i, 1);
                    }
                }
                col.set(colSel);
                val.set(valSel);
            }
            else if (type === 'col') {
                row.set([]);
                val.set([]);
                for (i = 0; i < rowSel.length; i++) {
                    if (this.statisticCol[index].value === this.statisticRow[rowSel[i]].value) {
                        rowSel.splice(i, 1);
                    }
                }
                for (i = 0; i < valSel.length; i++) {
                    if (this.statisticCol[index].value === this.statisticVal[valSel[i]].value) {
                        valSel.splice(i, 1);
                    }
                }
                row.set(rowSel);
                val.set(valSel);
            }
            else {
                row.set([]);
                col.set([]);
                for (i = 0; i < rowSel.length; i++) {
                    if (this.statisticVal[index].value === this.statisticRow[rowSel[i]].value) {
                        rowSel.splice(i, 1);
                    }
                }
                for (i = 0; i < colSel.length; i++) {
                    if (this.statisticVal[index].value === this.statisticCol[colSel[i]].value) {
                        colSel.splice(i, 1);
                    }
                }
                row.set(rowSel);
                col.set(colSel);
            }
        };
        /*
         * 初始化界面Dom
         * */
        CrossTabBasic.getDom = function () {
            return '<div class="row">' +
                '<div class="col-xs-4">' +
                '<fieldset class="col-xs-12">' +
                '<legend>行</legend>' +
                '<div class="statistic_row">' +
                '<div data-name="row"></div>' +
                '</div>' +
                '</legend>' +
                '</fieldset>' +
                '</div>' +
                '<div class="col-xs-4">' +
                '<fieldset class="col-xs-12">' +
                '<legend>列</legend>' +
                '<div class="statistic_col">' +
                '<div data-name="col"></div>' +
                '</div>' +
                '</legend>' +
                '</fieldset>' +
                '</div>' +
                '<div class="col-xs-4">' +
                '<fieldset class="col-xs-12">' +
                '<legend>值</legend>' +
                '<div class="statistic_val">' +
                '<div data-name="val"></div>' +
                '</div>' +
                '</legend>' +
                '</fieldset>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-xs-8">' +
                '<div data-name="statistic_select" class="statistic_select"></div>' +
                '</div>' +
                '<div class="col-xs-4">' +
                '<div data-name="statistic_sum" class="statistic_sum"></div>' +
                '</div>' +
                '</div>';
        };
        return CrossTabBasic;
    }(statisticBasic_1.StatisticBase));
});

define("AnalysisBasic", ["require", "exports", "SelectBox", "statistic", "TextInput", "BwRule", "Modal", "Button", "InputBox", "StatisticBase"], function (require, exports, selectBox_1, statistic_1, text_1, BwRule_1, Modal_1, Button_1, InputBox_1, statisticBasic_1) {
    "use strict";
    /// <amd-module name="AnalysisBasic"/>
    var dom = G.d;
    var tools = G.tools;
    return /** @class */ (function (_super) {
        __extends(AnalysisBasic, _super);
        function AnalysisBasic(conf) {
            var _this = _super.call(this) || this;
            _this.conf = conf;
            _this.modal = null; //ABC分析的模态框
            _this.coms = {}; //存放data-type节点
            _this.statisticClassify = []; //存放所有分类数据
            _this.statisticValue = []; //存放所有值的数据
            _this.initModal();
            _this.getSelectData();
            _this.replaceDataName();
            return _this;
        }
        /*
        * 获取ABC分析的模态框
        * */
        AnalysisBasic.prototype.getModal = function () {
            return this.modal;
        };
        /*
        * 初始化弹框中需要统计的字段
        * */
        AnalysisBasic.prototype.getSelectData = function () {
            var statisticsClassifyOptions = [], i, statisticsValueOptions = [];
            var visibleCol = this.conf.getVisibleCol();
            for (i = 0; i < this.conf.cols.length; i++) {
                if (BwRule_1.BwRule.isNumber(this.conf.cols[i].dataType) && visibleCol.indexOf(this.conf.cols[i].name) > -1) {
                    statisticsValueOptions.push({ value: this.conf.cols[i].name, text: this.conf.cols[i].title });
                }
            }
            for (i = 0; i < this.conf.cols.length; i++) {
                if (visibleCol.indexOf(this.conf.cols[i].name) > -1) {
                    statisticsClassifyOptions.push({ value: this.conf.cols[i].name, text: this.conf.cols[i].title });
                }
            }
            this.statisticClassify = statisticsClassifyOptions;
            this.statisticValue = statisticsValueOptions;
        };
        /*
        * 初始化ABC分析表模态框
        * */
        AnalysisBasic.prototype.initModal = function () {
            var _this = this;
            var self = this, inputBox = new InputBox_1.InputBox(), savaBtn = new Button_1.Button({
                content: '设为默认值',
                key: 'savaBtn',
                type: 'primary',
                onClick: function () {
                    _this.modal.isShow = false;
                }
            });
            inputBox.addItem(savaBtn);
            var okFun = function () {
                var proport = self.coms['proport'], statistic_select = self.coms['statistic_select'], statistic_showClass = self.coms['statistic_showClass'], result, statistic, statisticResult;
                statisticResult = self.getUserInput();
                if (statisticResult && statistic_select.get()[0] === 1) {
                    statisticResult.data = self.conf.selectedData();
                }
                if (!self.checkIsOk(statisticResult)) {
                    return false;
                }
                statistic = new statistic_1.Statistic();
                result = statistic.abc(statisticResult);
                self.tableRender(result, self.conf.container);
                // self.modal.isShow = false;
                return false;
            };
            if (tools.isMb) {
                this.modal = new Modal_1.Modal({
                    position: 'full',
                    isOnceDestroy: true,
                    body: G.d.create("<div>" + AnalysisBasic.getDom() + "</div>"),
                    header: 'abc分析'
                });
                this.modal.modalHeader.rightPanel = (function () {
                    var rightInputBox = new InputBox_1.InputBox(), okBtn = new Button_1.Button({
                        key: 'okBtn',
                        content: '确认',
                        type: 'primary',
                        onClick: okFun
                    });
                    rightInputBox.addItem(okBtn);
                    return rightInputBox;
                })();
                this.modal.bodyWrapper.setAttribute('style', 'height:calc(100vh - 44px);');
                this.modal.bodyWrapper.parentElement.classList.add('analysis');
            }
            else {
                this.modal = new Modal_1.Modal({
                    className: 'analysis',
                    container: this.conf.container,
                    header: 'ABC分析',
                    body: G.d.create("<div>" + AnalysisBasic.getDom() + "</div>"),
                    isBackground: false,
                    footer: {
                        leftPanel: inputBox
                    },
                    isOnceDestroy: true
                });
            }
            this.modal.onOk = okFun;
        };
        /*
        * 替换data-name属性为相应的节点并且将所有节点保存到coms数组中
        * */
        AnalysisBasic.prototype.initDataName = function (name, el) {
            var self = this;
            switch (name) {
                case 'classify':
                    this.coms['classify'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: false,
                            callback: function (index) {
                            }
                        },
                        data: this.statisticClassify
                    });
                    break;
                case 'value':
                    this.coms['value'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: false,
                            callback: function (index) {
                            }
                        },
                        data: this.statisticValue
                    });
                    break;
                case 'proport':
                    this.coms['proport'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: false,
                            callback: function (index) {
                            }
                        },
                        data: [{ value: 0, text: '自动查找' }, { value: 1, text: '手工设置' }]
                    });
                    break;
                case 'aClass':
                    this.coms['aClass'] = new text_1.TextInput({
                        container: el
                    });
                    break;
                case 'bClass':
                    this.coms['bClass'] = new text_1.TextInput({
                        container: el
                    });
                    break;
                case 'statistic_select':
                    this.coms['statistic_select'] = new selectBox_1.SelectBox({
                        container: el,
                        select: {
                            multi: false,
                            callback: function (index) {
                            }
                        },
                        data: [{ value: 0, text: '基于全部数据' }, { value: 1, text: '基于选定数据' }]
                    });
                    break;
                /*    case 'statistic_showClass':
                        this.coms['statistic_showClass'] = new SelectBox({
                            container: el,
                            select: {
                                multi: true,
                                callback: function (index) {
                                }
                            },
                            data: [{value: 0, text: '显示每一类的列表'}]
                        });
                        break;*/
            }
        };
        /*
        * 判断用户输入是否合法
        * */
        AnalysisBasic.prototype.checkIsOk = function (statisticResult) {
            if (statisticResult === void 0) { statisticResult = {}; }
            var aClass = this.coms['aClass'], bClass = this.coms['bClass'];
            if (isNaN(parseInt(aClass.get()))) {
                Modal_1.Modal.alert("A类不允许为空或字符串");
                return false;
            }
            else if (parseInt(aClass.get()) > 99 || parseInt(aClass.get()) < 0) {
                Modal_1.Modal.alert("A类输入范围为0-99");
                return false;
            }
            else if (isNaN(parseInt(bClass.get()))) {
                Modal_1.Modal.alert("B类不允许为空或字符串");
                return false;
            }
            else if (parseInt(bClass.get()) > 99 || parseInt(bClass.get()) < 0) {
                Modal_1.Modal.alert("B类输入范围为0-99");
                return false;
            }
            else if (parseInt(bClass.get()) < parseInt(aClass.get())) {
                Modal_1.Modal.alert("B类范围不可小于A类");
                return false;
            }
            else if (statisticResult.data.length === 0) {
                Modal_1.Modal.alert("数据为空，无法统计");
                return false;
            }
            else if (statisticResult.a > statisticResult.b) {
                Modal_1.Modal.alert("A类不可高于B类");
                return false;
            }
            return true;
        };
        /*
        * 替换dom中含有data-name属性的节点
        * */
        AnalysisBasic.prototype.replaceDataName = function () {
            var _this = this;
            this.body = this.modal.bodyWrapper;
            // let tpl = AnalysisBasic.getDom();
            var self = this;
            // this.body.innerHTML = tpl;
            dom.queryAll('[data-name]', this.body).forEach(function (el) {
                _this.initDataName(el.dataset.name, el);
            });
            var aClass = this.coms['aClass'], bClass = this.coms['bClass'], aInput = aClass['wrapper'].firstChild, bInput = bClass['wrapper'].firstChild;
            aInput.value = '65';
            bInput.value = '85';
            aClass.on('blur', function () {
                aClass.get() !== '' && (dom.query('.bFirst', self.body).innerText = aClass.get());
            });
            bClass.on('blur', function () {
                bClass.get() !== '' && (dom.query('.cFirst', self.body).innerText = bClass.get());
            });
        };
        /*
        * 获取用户输入
        * */
        AnalysisBasic.prototype.getUserInput = function () {
            var classify = this.coms['classify'], value = this.coms['value'], bClass = this.coms['bClass'], aClass = this.coms['aClass'], i;
            if (value.get().length > 0 && aClass.get() && bClass.get()) {
                return {
                    classify: this.statisticClassify[classify.get()[0]].value,
                    val: this.statisticValue[value.get()[0]].value,
                    a: parseInt(aClass.get()),
                    b: parseInt(bClass.get()),
                    cols: this.conf.cols,
                    data: this.conf.allData()
                };
            }
            return false;
        };
        /*
        * 初始化界面Dom
        * */
        AnalysisBasic.getDom = function () {
            return '<div class="row">' +
                '<div class="col-xs-4">' +
                '<fieldset class="col-xs-12">' +
                '<legend>分类</legend>' +
                '<div class="statistic_classify">' +
                '<div data-name="classify"></div>' +
                '</div>' +
                '</legend>' +
                '</fieldset>' +
                '</div>' +
                '<div class="col-xs-4">' +
                '<fieldset class="col-xs-12">' +
                '<legend>值</legend>' +
                '<div class="statistic_value">' +
                '<div data-name="value"></div>' +
                '</div>' +
                '</legend>' +
                '</fieldset>' +
                '</div>' +
                '<div class="col-xs-4">' +
                '<fieldset class="col-xs-12">' +
                '<legend>占比段</legend>' +
                '<div class="statistic_proport">' +
                '<div data-name="proport"></div>' +
                '<div class = "aClass" data-name="aClass"><span>A类:<span>0%-</span></span></div>' +
                '<div class = "bClass" data-name="bClass"><span>B类:<span><span class="bFirst">65</span>%-</span></span></div>' +
                '<div class = "cClass"><span>C类:<span><span class="cFirst">85</span>%-100%</span></span></div>' +
                '</div>' +
                '</legend>' +
                '</fieldset>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-xs-8">' +
                '<div data-name="statistic_select" class="statistic_select"></div>' +
                '</div>' +
                /* '<div class="col-xs-4">' +
                 '<div data-name="statistic_showClass" class="statistic_showClass"></div>' +
                 '</div>' +*/
                '</div>';
        };
        return AnalysisBasic;
    }(statisticBasic_1.StatisticBase));
});

define("ChartBasic", ["require", "exports", "echarts", "Modal", "SelectBox", "SelectInput", "Echart", "Button", "InputBox", "BwRule"], function (require, exports, echarts, Modal_1, selectBox_1, selectInput_1, echart_1, Button_1, InputBox_1, BwRule_1) {
    "use strict";
    var _a;
    var tools = G.tools;
    var dom = G.d;
    var d = G.d;
    var sys = BW.sys;
    var CONF = BW.CONF;
    return (_a = /** @class */ (function () {
            function ChartBasic(para) {
                this.para = para;
                this.coms = {}; //存放data-type节点
                this.chartType = []; //存放图形的类型数组
                this.chartRow = []; //存放横坐标的类型数组
                this.chartCol = []; //存放纵坐标的类型数组
                this.isPie = false; //判断是否为饼状图
                this.isLarge = true; //判断是否放大图形
                this.hasLinkCol = {}; //存放钻取数据的链接列
                this.getCols = function (title) {
                    var cols = this.para.cols;
                    for (var i = 0, l = cols.length; i < l; i++) {
                        if (cols[i].title === title) {
                            return cols[i];
                        }
                    }
                };
                /**
                 * 获取相应图形的echart参数
                 * @type {Array}
                 */
                this.generateChartOption = (function (self) {
                    var chartArr = [];
                    chartArr[0] = function (para) {
                        var series = [], echart, count = -1, yAxis = [], color = [], fontSize = sys.isMb ? 8 : 12;
                        for (var key1 in para['ySeries']) {
                            if (!tools.isEmpty(para['ySeries'][key1])) {
                                count++;
                                for (var key2 in para['ySeries'][key1]) {
                                    series.push({
                                        name: key2,
                                        type: 'line',
                                        yAxisIndex: count,
                                        symbolSize: 12,
                                        data: para['ySeries'][key1][key2]
                                    });
                                }
                                yAxis.push({
                                    name: ChartBasic.yType[key1],
                                    type: ChartBasic.yType[key1] === '时间' ? 'time' : 'value',
                                    axisLabel: {
                                        fontSize: fontSize
                                    }
                                });
                            }
                        }
                        // 指定图表的配置项和数据
                        echart = new echart_1.Echart();
                        echart.legend = sys.isMb ? {
                            type: 'scroll',
                            bottom: "0px",
                            left: 0,
                            data: para['legend']
                        } :
                            {
                                type: 'scroll',
                                orient: 'vertical',
                                right: '3%',
                                top: 20,
                                bottom: 0,
                                data: para['legend']
                            };
                        echart.xAxis = {
                            type: 'category',
                            boundaryGap: false,
                            data: para['xData'],
                            triggerEvent: true
                        };
                        var isDrill = ['web', 'webdrill', 'drill'].indexOf(self.para.getTablePara().uiType) > -1;
                        if ((sys.isMb && !isDrill) || (!sys.isMb)) {
                            echart.dataZoom = [
                                {
                                    type: 'inside',
                                    show: true,
                                    xAxisIndex: [0]
                                },
                                {
                                    type: 'inside',
                                    show: true,
                                    yAxisIndex: [0]
                                }
                            ];
                        }
                        if (!sys.isMb) {
                            echart.tooltip = {
                                trigger: 'axis',
                                show: true,
                                axisPointer: {
                                    type: 'cross',
                                    crossStyle: {
                                        color: '#999'
                                    }
                                },
                                formatter: function (datas) {
                                    var res = datas[0].name + '<br/>', val;
                                    for (var i = 0, length_1 = datas.length; i < length_1; i++) {
                                        val = BwRule_1.BwRule.formatText(datas[i].value, self.getCols(datas[i].seriesName), false);
                                        res += datas[i].seriesName + '：' + val + '<br/>';
                                    }
                                    return res;
                                }
                            };
                        }
                        echart.yAxis = yAxis;
                        echart.series = series;
                        for (var i = 0; i < para['legend'].length; i++) {
                            color.push(ChartBasic.getRandomCol());
                        }
                        echart.color = color;
                        return echart.getOption();
                    }; //折线图参数
                    chartArr[1] = function (para) {
                        var series = [], echart, count = -1, yAxis = [], color = [], fontSize = sys.isMb ? 8 : 12;
                        for (var key1 in para['ySeries']) {
                            if (!tools.isEmpty(para['ySeries'][key1])) {
                                count++;
                                for (var key2 in para['ySeries'][key1]) {
                                    series.push({
                                        name: key2,
                                        type: 'bar',
                                        yAxisIndex: count,
                                        data: para['ySeries'][key1][key2]
                                    });
                                }
                                yAxis.push({
                                    name: ChartBasic.yType[key1],
                                    type: ChartBasic.yType[key1] === '时间' ? 'time' : 'value',
                                    axisLabel: {
                                        fontSize: fontSize
                                    }
                                });
                            }
                        }
                        // 指定图表的配置项和数据
                        echart = new echart_1.Echart();
                        echart.legend = sys.isMb ? {
                            type: 'scroll',
                            bottom: "0px",
                            left: 0,
                            data: para['legend']
                        } : {
                            type: 'scroll',
                            orient: 'vertical',
                            right: '3%',
                            top: 20,
                            bottom: 0,
                            data: para['legend']
                        };
                        echart.xAxis = {
                            type: 'category',
                            data: para['xData'],
                            triggerEvent: true,
                            axisPointer: {
                                type: 'shadow'
                            }
                        };
                        for (var i = 0; i < para['legend'].length; i++) {
                            color.push(ChartBasic.getRandomCol());
                        }
                        echart.color = color;
                        echart.yAxis = yAxis;
                        echart.series = series;
                        var isDrill = ['web', 'webdrill', 'drill'].indexOf(self.para.getTablePara().uiType) > -1;
                        if ((sys.isMb && !isDrill) || (!sys.isMb)) {
                            echart.dataZoom = [
                                {
                                    type: 'inside',
                                    show: true,
                                    xAxisIndex: [0]
                                },
                                {
                                    type: 'inside',
                                    show: true,
                                    yAxisIndex: [0]
                                }
                            ];
                        }
                        if (!sys.isMb) {
                            echart.tooltip = {
                                trigger: 'axis',
                                show: true,
                                axisPointer: {
                                    type: 'cross',
                                    crossStyle: {
                                        color: '#999'
                                    }
                                },
                                formatter: function (datas) {
                                    var res = datas[0].name + '<br/>', val;
                                    for (var i = 0, length_2 = datas.length; i < length_2; i++) {
                                        val = BwRule_1.BwRule.formatText(datas[i].value, self.getCols(datas[i].seriesName), false);
                                        res += datas[i].seriesName + '：' + val + '<br/>';
                                    }
                                    return res;
                                }
                            };
                        }
                        return echart.getOption();
                    }; //柱状图参数
                    chartArr[2] = function (para) {
                        var series = [], echart, count = 0, color = [];
                        for (var key1 in para['ySeries']) {
                            if (!tools.isEmpty(para['ySeries'][key1])) {
                                for (var key2 in para['ySeries'][key1]) {
                                    var data = [];
                                    for (var i = 0; i < para['xData'].length; i++) {
                                        data.push({
                                            value: para['ySeries'][key1][key2][i],
                                            name: para['xData'][i]
                                        });
                                    }
                                    series.push({
                                        name: key2,
                                        type: 'pie',
                                        radius: sys.isMb ? '120px' : '150px',
                                        center: ['50%', count * 400 + 200 + "px"],
                                        label: {
                                            normal: {
                                                formatter: sys.isMb ? '{b}\n{d}%' : '{a}\n {b}: {d}%'
                                            }
                                        },
                                        data: data
                                    });
                                    count++;
                                }
                            }
                        }
                        // 指定图表的配置项和数据
                        echart = new echart_1.Echart();
                        echart.title = {
                            text: '订单明细图',
                            x: 'center'
                        };
                        if (!sys.isMb) {
                            echart.tooltip = {
                                trigger: 'item',
                                show: true,
                                axisPointer: {
                                    type: 'cross',
                                    crossStyle: {
                                        color: '#999'
                                    }
                                },
                                formatter: function (datas) {
                                    var res = '', val;
                                    val = BwRule_1.BwRule.formatText(datas.value, self.getCols(datas.seriesName), false);
                                    res += datas.seriesName + '：' + val + '<br/>';
                                    return res;
                                }
                            };
                        }
                        echart.title = sys.isMb ? {
                            text: '订单明细图',
                            x: 'center',
                            top: '20px'
                        } : {
                            text: '订单明细图',
                            x: 'center'
                        };
                        echart.legend = sys.isMb ? {
                            type: 'scroll',
                            top: "0%",
                            left: 0,
                            data: para['legend']
                        } : {
                            type: 'scroll',
                            orient: 'vertical',
                            right: '3%',
                            top: 20,
                            bottom: 0,
                            data: para['xData'],
                            pageIconColor: 'red'
                        };
                        for (var i = 0; i < para['xData'].length; i++) {
                            color.push(ChartBasic.getRandomCol());
                        }
                        echart.color = color;
                        echart.series = series;
                        return echart.getOption();
                    }; //饼状图参数
                    chartArr[3] = function (para) {
                        var lineOption = chartArr[0].call(this, para), i;
                        for (i = 0; i < lineOption.series.length; i++) {
                            lineOption.series[i]['smooth'] = true;
                            lineOption.series[i]['areaStyle'] = {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                            offset: 0,
                                            color: lineOption.color[i],
                                            opacity: 1
                                        }, {
                                            offset: 1,
                                            color: lineOption.color[i],
                                            opacity: 1
                                        }])
                                }
                            };
                        }
                        return lineOption;
                    }; //面积图参数
                    return chartArr;
                })(this);
                this.initModal();
                this.getSelectData();
                this.replaceDataName();
                var allData = para.allData();
                var keyField = this.para.getTablePara().keyField;
                for (var i = 0; i < allData.length; i++) {
                    this.getLinkCol(allData[i], keyField);
                }
            }
            /**
             * 获取表格中的统计字段
             */
            ChartBasic.prototype.getSelectData = function () {
                var visibleCol = this.para.getVisibleCol();
                var statisticsRow = [], i, statisticsCol = [];
                for (i = 0; i < this.para.cols.length; i++) {
                    if (BwRule_1.BwRule.isNumber(this.para.cols[i].dataType) && visibleCol.indexOf(this.para.cols[i].name) > -1) {
                        statisticsCol.push({ value: this.para.cols[i].name, text: this.para.cols[i].title });
                    }
                }
                for (i = 0; i < this.para.cols.length; i++) {
                    if (visibleCol.indexOf(this.para.cols[i].name) > -1) {
                        statisticsRow.push({ value: this.para.cols[i].name, text: this.para.cols[i].title });
                    }
                }
                this.chartRow = statisticsRow;
                this.chartCol = statisticsCol;
                this.chartType = [{ value: 0, text: '折线图' },
                    { value: 1, text: '柱形图' },
                    { value: 2, text: '饼图' },
                    { value: 3, text: '面积图' },
                ];
            };
            /**
             * 初始化弹框
             */
            ChartBasic.prototype.initModal = function () {
                var _this = this;
                var self = this, inputBox = new InputBox_1.InputBox(), okBtn = new Button_1.Button({
                    key: 'okBtn',
                    content: '确认',
                    type: 'primary',
                    onClick: function () {
                        var doSta = true;
                        if (_this.chartCol.length === 0) {
                            Modal_1.Modal.toast('纵坐标无统计字段，无法统计');
                            doSta = false;
                        }
                        if (_this.coms['col'].get().length === 0) {
                            Modal_1.Modal.toast('请选择至少一个纵坐标');
                            doSta = false;
                        }
                        if ((_this.coms['range'].get()[0] ? _this.para.selectedData().length : _this.para.allData().length) === 0) {
                            Modal_1.Modal.toast('无可统计数据，请重新选择');
                            doSta = false;
                        }
                        if (doSta) {
                            _this.modal.isShow = false;
                            var isDrill = ['web', 'webdrill', 'drill'].indexOf(_this.para.getTablePara().uiType) > -1;
                            //如果是钻取则初始化钻取的按钮（图形统计，返回表格）
                            if (isDrill) {
                                var wrapper = _this.para.getWrapper(), wrapperParent_1 = sys.isMb ? d.closest(wrapper, 'li') : wrapper.parentElement, child = void 0, echartBody_1, tableBut = void 0, fullScreenBut = void 0;
                                child = d.query('.mobileTableWrapper', wrapper);
                                child.style.display = 'none';
                                echartBody_1 = document.createElement('div');
                                echartBody_1.className = 'Echart_body';
                                echartBody_1.style.height = sys.isMb ? '82vh' : '450px';
                                echartBody_1.style.width = sys.isMb ? '700px' : wrapper.offsetWidth + 'px';
                                var hasChart = d.query('.Echart_body', wrapper);
                                if (hasChart) {
                                    wrapper.removeChild(hasChart);
                                }
                                wrapper.appendChild(echartBody_1);
                                var chartType = self.coms['type'], jsonData = self.getChartInput();
                                self.generateGraph(echartBody_1, chartType.get()[0], jsonData);
                                echartBody_1.style.background = 'white';
                                tableBut = d.query('.statisticsChart', wrapperParent_1).lastChild;
                                tableBut.style.display = 'inline-block';
                                //处理电脑端放大之后的图形统计重新渲染事件
                                var firstHeight_1 = wrapperParent_1.offsetHeight;
                                fullScreenBut = d.query('.panel-tools', wrapperParent_1.parentElement);
                                fullScreenBut && d.on(fullScreenBut, 'click', '.panel-heading', function (e) {
                                    setTimeout(function () {
                                        var parEle = wrapperParent_1.parentElement, hasFull = parEle.classList.contains('is-fullscreen');
                                        var shouldHeight = firstHeight_1 > parEle.offsetHeight ? firstHeight_1 : parEle.offsetHeight;
                                        var tempWidth = parEle.offsetWidth + 'px';
                                        var tempHeight = hasFull ? shouldHeight - d.query('.panel-heading', parEle).offsetHeight : firstHeight_1;
                                        echartBody_1.style.width = tempWidth;
                                        echartBody_1.style.height = tempHeight + 'px';
                                        parEle.style.overflowY = 'scroll';
                                        parEle.style.overflowX = 'hidden';
                                        _this.myChart.resize();
                                    }, 0);
                                });
                            }
                            else if (!isDrill && sys.isMb) {
                                require(['Modal', 'Button'], function (M, B) {
                                    var chartBody = d.create('<div class="Echart_body" style="width: 100vw; height: calc(100vh - 44px); overflow-x: hidden;"></div>');
                                    var m = new M.Modal({
                                        position: 'full',
                                        body: chartBody,
                                        isOnceDestroy: true
                                    });
                                    m.body.parentElement.parentElement.classList.add('myChart');
                                    m.body.parentElement.style.maxHeight = 'none';
                                    m.body.parentElement.setAttribute('style', 'height:calc(100vh - 44px);');
                                    var chartType = self.coms['type'], jsonData = self.getChartInput();
                                    self.generateGraph(m.body, chartType.get()[0], jsonData);
                                });
                            }
                            //否则初始化图形统计的弹框显示
                            else {
                                var tempModal = new Modal_1.Modal({
                                    className: 'tempModal',
                                    body: dom.create("<div class=\"Echart_body\" style=\"height:450px; width: 700px;\"></div>"),
                                    container: self.para.container,
                                    isOnceDestroy: true,
                                    isBackground: false,
                                    onLarge: function () {
                                        var cacheModal = d.query('.tempModal', document.body), cacheHeader = d.query('.head-wrapper', cacheModal), cacheEchart = d.query('.Echart_body', cacheModal), lHeight = cacheModal.offsetHeight - cacheHeader.offsetHeight, lWidth = cacheModal.offsetWidth - 40, echartSty = cacheEchart.style, echartParSty = cacheEchart.parentElement.style;
                                        if (_this.isLarge) {
                                            echartParSty.height = lHeight + 'px';
                                            echartParSty.maxHeight = 'none';
                                        }
                                        else {
                                            echartSty.width = '700px';
                                            echartParSty.height = '500px';
                                        }
                                        if (_this.isLarge && !_this.isPie) {
                                            echartSty.width = lWidth + 'px';
                                            echartSty.height = lHeight + 'px';
                                            _this.isLarge = false;
                                        }
                                        else if (!_this.isLarge && !_this.isPie) {
                                            echartSty.height = '450px';
                                            _this.isLarge = true;
                                        }
                                        else if (_this.isLarge && _this.isPie) {
                                            echartSty.width = lWidth + 'px';
                                            _this.isLarge = false;
                                        }
                                        else if (!_this.isLarge && _this.isPie) {
                                            _this.isLarge = true;
                                        }
                                        _this.myChart.resize();
                                    },
                                    header: {
                                        title: '统计结果',
                                        isFullScreen: true
                                    }
                                });
                                var chartType = self.coms['type'], jsonData = self.getChartInput();
                                self.generateGraph(tempModal.body, chartType.get()[0], jsonData);
                            }
                        }
                    }
                });
                inputBox.addItem(okBtn);
                if (sys.isMb) {
                    this.modal = new Modal_1.Modal({
                        header: '图表统计',
                        position: 'full',
                        container: this.para.container,
                        isOnceDestroy: true
                    });
                    this.modal.modalHeader.rightPanel = inputBox;
                    this.modal.bodyWrapper.parentElement.classList.add('myChart');
                }
                else {
                    this.modal = new Modal_1.Modal({
                        header: '图表统计',
                        container: this.para.container,
                        className: 'echart',
                        width: sys.isMb ? null : '500px',
                        isBackground: false,
                        footer: {
                            rightPanel: inputBox
                        }
                    });
                }
            };
            /**
             * 内部方法由initHtmlTpl调用
             * @param {string} name
             * @param {HTMLElement} el
             */
            ChartBasic.prototype.initHtmlTpl = function (name, el) {
                var self = this;
                switch (name) {
                    case 'type':
                        this.coms['type'] = new selectBox_1.SelectBox({
                            container: el,
                            select: {
                                multi: false,
                                callback: function (index) { }
                            },
                            data: this.chartType
                        });
                        break;
                    case 'row':
                        this.coms['row'] = new selectInput_1.SelectInput({
                            container: el,
                            data: this.chartRow,
                            onSet: function (item, index) {
                            },
                            className: 'selectInput',
                            clickType: 1,
                            readonly: true
                        });
                        break;
                    case 'col':
                        this.coms['col'] = new selectBox_1.SelectBox({
                            container: el,
                            select: {
                                multi: true,
                                callback: function (index) {
                                    var tempType = self.getDataType(self.chartCol[index].text), col = self.coms['col'], i;
                                    if (tempType === BwRule_1.BwRule.DT_DATETIME || tempType === BwRule_1.BwRule.DT_TIME) {
                                        for (i = 0; i < self.chartCol.length; i++) {
                                            var tempType2 = self.getDataType(self.chartCol[i].text);
                                            if (tempType2 != BwRule_1.BwRule.DT_DATETIME && tempType2 != BwRule_1.BwRule.DT_TIME) {
                                                col.unSet([i]);
                                            }
                                        }
                                    }
                                    else {
                                        for (i = 0; i < self.chartCol.length; i++) {
                                            var tempType2 = self.getDataType(self.chartCol[i].text);
                                            if (tempType2 === BwRule_1.BwRule.DT_DATETIME || tempType2 === BwRule_1.BwRule.DT_TIME) {
                                                col.unSet([i]);
                                            }
                                        }
                                    }
                                }
                            },
                            data: this.chartCol
                        });
                        var moneyArr = [];
                        for (var i = 0; i < this.chartCol.length; i++) {
                            if (self.getDataType(this.chartCol[i].text) === BwRule_1.BwRule.DT_MONEY) {
                                moneyArr.push(i);
                            }
                        }
                        this.coms['col'].set(moneyArr);
                        break;
                    case 'range':
                        this.coms['range'] = new selectBox_1.SelectBox({
                            container: el,
                            select: {
                                multi: false,
                                callback: function (index) { }
                            },
                            data: [{ value: 0, text: '全部数据' }, { value: 1, text: '选定数据' }]
                        });
                        break;
                }
            };
            /**
             * 替换data-name为具体的节点
             */
            ChartBasic.prototype.replaceDataName = function () {
                var _this = this;
                this.body = this.modal.bodyWrapper;
                var tpl = this.htmlTpl();
                this.body.innerHTML = tpl;
                dom.queryAll('[data-name]', this.body).forEach(function (el) {
                    _this.initHtmlTpl(el.dataset.name, el);
                });
                var row = this.coms['row'];
                this.chartRow[0] && row.set(this.chartRow[0].value);
            };
            /**
             * 调用echart插件方法，生成对应图表
             * @param parentEle
             * @param type
             * @param para
             */
            ChartBasic.prototype.generateGraph = function (parentEle, type, para) {
                var _this = this;
                this.myChart = echarts.init(parentEle);
                var option = this.generateChartOption[type].call(this, para), chartHeight;
                if (option.series[0] && (option.series[0].type === 'pie')) {
                    parentEle.parentElement.style.overflowY = 'scroll';
                    parentEle.parentElement.parentElement.style.overflowY = 'scroll';
                    chartHeight = 400;
                    parentEle.style.height = chartHeight * option.series.length + 'px';
                    this.isPie = true;
                    this.myChart.resize();
                }
                else {
                    this.isPie = false;
                }
                this.isLarge = true;
                this.myChart.setOption(option);
                this.myChart.on('click', function (params) {
                    var hasLink = false;
                    var getDetail = function (fn) {
                        var i, key;
                        for (key in _this.hasLinkCol) {
                            for (i = 0; i < _this.hasLinkCol[key].length; i++) {
                                if (_this.hasLinkCol[key][i].name == params.value) {
                                    fn(_this.hasLinkCol[key][i].src);
                                    break;
                                }
                            }
                        }
                    };
                    if (sys.isMb) {
                        getDetail(function () {
                            hasLink = true;
                        });
                        var removeDiv = d.query('.detailDiv', parentEle);
                        removeDiv && parentEle.removeChild(removeDiv);
                        var val = params.value;
                        if (params.seriesName) {
                            val = BwRule_1.BwRule.formatText(params.value, _this.getCols(params.seriesName), false);
                        }
                        var divInner = void 0;
                        if (params.componentType === 'xAxis') {
                            divInner = "<p style=\"color:white; margin:0 0;\">" + params.value + "</p> ";
                        }
                        else {
                            divInner = "<p style=\"color:white; margin:0 0;\">" + params.name + "</p>\n                            <p style=\"color:white; margin:0 0;\">" + params.seriesName + ":" + val + "</p>\n                            ";
                        }
                        var tempDiv = document.createElement("div");
                        tempDiv.className = 'detailDiv';
                        tempDiv.setAttribute('style', "top:" + (params.event.offsetY - 55) + "px;left:" + (params.event.offsetX + 10) + "px");
                        tempDiv.innerHTML = divInner;
                        if (hasLink) {
                            var but = document.createElement('p');
                            but.setAttribute('style', 'color:white;text-align:center;');
                            but.innerHTML = '点击查看>>';
                            tempDiv.appendChild(but);
                            d.on(but, 'click', function (e) {
                                getDetail(function (para) {
                                    var tempUrl = CONF.siteUrl + para;
                                    sys.window.open({ url: tempUrl });
                                });
                            });
                        }
                        parentEle.appendChild(tempDiv);
                    }
                    else {
                        getDetail(function (para) {
                            var tempUrl = CONF.siteUrl + para;
                            sys.window.open({ url: tempUrl });
                        });
                    }
                });
            };
            /**
             * 模态框html模版
             * @returns {string}
             */
            ChartBasic.prototype.htmlTpl = function () {
                return '<div class="EChart_tabFirst">' +
                    '<div class="row">' +
                    '<div class="col-xs-4">' +
                    '<fieldset>' +
                    '<legend>类型</legend>' +
                    '<div data-name="type">' +
                    '</div>' +
                    '</fieldset>' +
                    '</div>' +
                    '<div class="col-xs-4">' +
                    '<fieldset>' +
                    '<legend>纵坐标</legend>' +
                    '<div class="colClass">' +
                    '<div data-name="col"></div>' +
                    '</div>' +
                    '</fieldset>' +
                    '</div>' +
                    '<div class="col-xs-4">' +
                    '<fieldset>' +
                    '<legend>横坐标</legend>' +
                    '<div class="rowClass">' +
                    '<div data-name="row"></div>' +
                    '</div>' +
                    '</fieldset>' +
                    '<fieldset>' +
                    '<legend>范围</legend>' +
                    '<div data-name="range">' +
                    '</div>' +
                    '</fieldset>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            };
            /**
             * 获取模态框
             * @returns {Modal}
             */
            ChartBasic.prototype.getModal = function () {
                return this.modal;
            };
            /**
             * 获取用户输入数据，并统计数据以及构造数据格式
             * @returns {{}}
             */
            ChartBasic.prototype.getChartInput = function () {
                function unique(arr) {
                    var res = [], json = {}, i;
                    for (i = 0; i < arr.length; i++) {
                        if (!json[arr[i]]) {
                            res.push(arr[i]);
                            json[arr[i]] = 1;
                        }
                    }
                    return res;
                }
                var rowSel = this.coms['row'].get(), //选择的x轴
                colSel = this.coms['col'].get(), colSelArr = [], //y轴选择的value值，用来获取相应列的具体数据
                legend = [], //y轴统计的字段的名称(text);
                xData = [], //x轴数组
                yData = {}, //y轴统计字段的具体数值之和对象
                statisticData = this.coms['range'].get()[0] ? this.para.selectedData() : this.para.allData(), i, j, k;
                for (i = 0; i < colSel.length; i++) {
                    colSelArr.push(this.chartCol[colSel[i]].value);
                    legend.push(this.chartCol[colSel[i]].text);
                }
                xData = unique(this.para.colDataGet(rowSel)); //去重之后的x轴横坐标数组
                if (xData.indexOf(null) > -1) {
                    xData.splice(xData.indexOf(null), 1); //去除横坐标为null的情况
                }
                for (j = 0; j < xData.length; j++) {
                    for (i = 0; i < statisticData.length; i++) {
                        if (statisticData[i][rowSel] === xData[j]) {
                            for (k = 0; k < colSelArr.length; k++) {
                                if (!yData[legend[k]]) {
                                    yData[legend[k]] = {};
                                }
                                if (!yData[legend[k]][xData[j]]) {
                                    yData[legend[k]][xData[j]] = 0;
                                }
                                yData[legend[k]][xData[j]] = yData[legend[k]][xData[j]] + statisticData[i][colSelArr[k]];
                            }
                        }
                    }
                }
                var ySeries = {
                    'money': {},
                    'count': {},
                    'time': {}
                };
                for (var key1 in yData) {
                    var tempType = this.getDataType(key1);
                    if (tempType === BwRule_1.BwRule.DT_MONEY) {
                        ySeries['money'][key1] = [];
                    }
                    else if (tempType === BwRule_1.BwRule.DT_DATETIME || tempType === BwRule_1.BwRule.DT_TIME) {
                        ySeries['time'][key1] = [];
                    }
                    else {
                        ySeries['count'][key1] = [];
                    }
                    xData = [];
                    for (var key2 in yData[key1]) {
                        xData.push(key2);
                        if (tempType === BwRule_1.BwRule.DT_MONEY) {
                            ySeries['money'][key1].push(yData[key1][key2]);
                        }
                        else if (tempType === BwRule_1.BwRule.DT_DATETIME || tempType === BwRule_1.BwRule.DT_TIME) {
                            ySeries['time'][key1].push(yData[key1][key2]);
                        }
                        else {
                            ySeries['count'][key1].push(yData[key1][key2]);
                        }
                    }
                }
                var jsonData = {};
                jsonData['legend'] = legend;
                jsonData['ySeries'] = ySeries;
                jsonData['xData'] = xData;
                return jsonData;
            };
            /**
             * 内部方法，用来判断列的数值类型
             * @param {string} name
             * @returns {string}
             */
            ChartBasic.prototype.getDataType = function (name) {
                for (var i = 0; i < this.para.cols.length; i++) {
                    if (this.para.cols[i].title === name) {
                        return this.para.cols[i].dataType;
                    }
                }
            };
            ;
            ChartBasic.prototype.getLinkCol = function (trData, keyField) {
                var _this = this;
                var cols = this.para.cols;
                var inLinkCol = function (col, src) {
                    if (!_this.hasLinkCol[col.caption]) {
                        _this.hasLinkCol[col.caption] = [];
                    }
                    _this.hasLinkCol[col.caption].push({
                        name: trData[col.name],
                        src: src
                    });
                };
                cols.forEach(function (col, index) {
                    if (col.drillAddr && col.drillAddr.dataAddr) {
                        var drillAddr = BwRule_1.BwRule.drillAddr(col.drillAddr.dataAddr, trData, keyField);
                        if (drillAddr) {
                            inLinkCol(col, drillAddr);
                        }
                    }
                    if (col.webDrillAddr && col.webDrillAddr.dataAddr) {
                        var webDrillAddr = BwRule_1.BwRule.webDrillAddr(col.webDrillAddr, trData, keyField);
                        if (webDrillAddr) {
                            inLinkCol(col, webDrillAddr);
                        }
                    }
                    if (col.webDrillAddrWithNull && col.webDrillAddrWithNull.dataAddr) {
                        var webDrillAddrWithNull = BwRule_1.BwRule.webDrillAddrWithNull(col.webDrillAddrWithNull, trData, keyField);
                        if (webDrillAddrWithNull) {
                            inLinkCol(col, webDrillAddrWithNull);
                        }
                    }
                });
            };
            return ChartBasic;
        }()),
        _a.getRandomCol = function () {
            var r = Math.floor(Math.random() * 256);
            var g = Math.floor(Math.random() * 256);
            var b = Math.floor(Math.random() * 256);
            return "rgb(" + r + ',' + g + ',' + b + ")";
        },
        /**
         * 图标统计的三种统计字段类型
         * @type {{money: string; count: string; time: string}}
         */
        _a.yType = {
            'money': '金额',
            'count': '数量',
            'time': '时间'
        },
        _a);
});

define("StatisticBase", ["require", "exports", "Modal"], function (require, exports, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="StatisticBase"/>
    var dom = G.d;
    var sys = BW.sys;
    var StatisticBase = /** @class */ (function () {
        function StatisticBase() {
        }
        /**
         * 生成统计结果的表格弹窗
         * @param {resType} result 表格数据
         * @param {HTMLElement} container
         * @param {boolean} isMulit 是否是多维表头
         */
        StatisticBase.prototype.tableRender = function (result, container, isMulit) {
            if (isMulit === void 0) { isMulit = false; }
            var tempTable = dom.create('<table><tbody></tbody></table>'), tempResult = {
                cols: isMulit ? result.colsIndex : result.cols,
                data: result.data,
                multPage: 2,
                isSub: sys.isMb,
                isInModal: true
            };
            if (result.data.length > 0) {
                for (var i = 0, l = result.data.length; i < l; i++) {
                    for (var key in result.data[i]) {
                        if (result.data[i][key] === '--') {
                            result.data[i][key] = "";
                        }
                    }
                }
            }
            var width, resColsLen = isMulit ? result.cols[0].length : result.cols.length;
            if (resColsLen <= 3) {
                width = '300px';
            }
            else if (resColsLen > 3 && resColsLen <= 8) {
                width = '600px';
            }
            else {
                width = '1000px';
            }
            sys.isMb ? new Modal_1.Modal({
                header: '统计结果',
                body: tempTable,
                position: 'full',
                container: container,
                isOnceDestroy: true
            }) : new Modal_1.Modal({
                body: tempTable,
                isOnceDestroy: true,
                isBackground: false,
                container: container,
                width: width,
                header: {
                    title: '统计结果',
                    isFullScreen: true
                }
            });
            require([sys.isMb ? 'TableModuleMb' : 'TableModulePc'], function (table) {
                var conf = {
                    tableEl: tempTable,
                    scrollEl: tempTable.parentElement,
                    tableConf: {
                        indexCol: 'number'
                    }
                };
                if (isMulit) {
                    conf.tableConf['multi'] = {
                        enabled: true,
                        cols: result.cols,
                    };
                }
                new table(conf, tempResult);
            });
        };
        return StatisticBase;
    }());
    exports.StatisticBase = StatisticBase;
});

/// <amd-module name="Count"/>
define("Count", ["require", "exports", "StatisticBase", "SelectInput", "Modal", "SelectInputMb"], function (require, exports, statisticBasic_1, selectInput_1, Modal_1, selectInput_mb_1) {
    "use strict";
    var sys = BW.sys;
    var d = G.d;
    var tools = G.tools;
    return /** @class */ (function (_super) {
        __extends(Count, _super);
        function Count(para) {
            var _this = _super.call(this) || this;
            _this.para = para;
            _this.modal = null;
            _this.initModal();
            return _this;
        }
        Count.prototype.count = function (colName) {
            var colData = this.para.colDataGet(colName), groupObj = {};
            colData.forEach(function (cellData) {
                cellData = tools.isEmpty(cellData) ? '-空-' : cellData;
                if (cellData in groupObj) {
                    groupObj[cellData]++;
                }
                else {
                    groupObj[cellData] = 1;
                }
            });
            return groupObj;
        };
        Count.prototype.initModal = function () {
            var _this = this;
            this.modal = new Modal_1.Modal({
                header: '统计',
                body: d.create('<span></span>'),
                className: 'statistic',
                width: '220px',
                container: this.para.container,
                isBackground: false,
                footer: {},
                onOk: function () {
                    var tablePara = {
                        cols: [{ 'title': "列名", 'name': "colName" }, { 'title': "数量", 'name': "count" }],
                        data: []
                    };
                    var result = _this.count(selectInput.get());
                    for (var key in result) {
                        tablePara.data.push({
                            colName: key,
                            count: result[key]
                        });
                    }
                    _this.tableRender(tablePara, _this.para.container);
                }
            });
            var listItems = this.para.getVisibleCol().map(function (colName) {
                var cols = _this.para.cols, colIndex = -1;
                for (var i = 0, col = void 0; col = cols[i]; i++) {
                    if (col.name === colName) {
                        colIndex = i;
                        break;
                    }
                }
                return {
                    text: cols[colIndex].title,
                    value: colName
                };
            });
            var selectInput = new (sys.isMb ? selectInput_mb_1.SelectInputMb : selectInput_1.SelectInput)({
                container: this.modal.bodyWrapper,
                data: listItems,
                readonly: true,
                clickType: 0
            });
            selectInput.set(listItems[0].value);
        };
        Count.prototype.getModal = function () {
            return this.modal;
        };
        return Count;
    }(statisticBasic_1.StatisticBase));
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
