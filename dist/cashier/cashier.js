define("KeyModal", ["require", "exports", "Modal", "ItemList", "Com", "EventAction"], function (require, exports, Modal_1, ItemList_1, com_1, EvenAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="KeyModal"/>
    var tools = C.tools;
    var d = C.d;
    /**
     * 模态框模块
     */
    var KeyModal = /** @class */ (function (_super) {
        __extends(KeyModal, _super);
        function KeyModal(para) {
            var _this = _super.call(this, {
                header: para.title,
                body: para.body,
                container: para.container,
                className: 'modal-cashier',
                isBackground: false,
                isAdaptiveCenter: true,
                isOnceDestroy: true,
                keyDownHandle: para.keyDownHandle
            }) || this;
            _this.inputArr = [];
            _this.disabledEsc = false; // 禁用esc
            _this.isClear = false;
            _this.handler = function (e) {
                e.preventDefault();
                var box = _this.inputBox, code = e.keyCode || e.which || e.charCode;
                if (_this.inputBox) {
                    // 清空
                    if (_this.isClear) {
                        box.innerHTML = '';
                        _this.isClear = false;
                    }
                    if (box.innerHTML === '') {
                        _this.timer = Date.now();
                    }
                    var len = box.innerHTML.length, format = box.dataset.type;
                    // 如果有小数点，只能输入到小数点后一位
                    var index = box.innerHTML.indexOf('.');
                    if (((48 <= code && code <= 57) || (65 <= code && code <= 90) || (96 <= code && code <= 105)) && len < 19 ||
                        ((format.indexOf('.') > -1) && (code === 110 || code === 190) && tools.isNotEmpty(box.innerHTML))) {
                        // 存在“.”且小数点后只能输入一位
                        if (index > -1 && (len > index + 1 || [110, 190].includes(code))) {
                        }
                        else {
                            box.innerHTML += e.key;
                        }
                    }
                    //回退
                    if (code === 8) {
                        box.innerHTML = box.innerHTML.substr(0, box.innerHTML.length - 1);
                    }
                }
                if (code === 27 && _this.escKey) {
                    com_1.Com.keyFlag = true;
                    com_1.Com.closeLastModalPanel();
                }
                if (code === 13) {
                    var type = com_1.Com.checkScan(_this.timer, box && box.innerHTML);
                    if (!box) { // 键盘选择表格数据
                        type = com_1.Com.KEYSELECT;
                    }
                    _this.p.callback(e, box && box.innerHTML, type);
                    box && !_this.bill && (box.innerHTML = '');
                }
            };
            _this.wrapper.style.top = '40%';
            _this.wrapper.style.transform = 'translate(-50%, -40%)';
            com_1.Com.keyModal.push(_this);
            _this.p = para;
            if (para.data && para.data.panelId === "s0_p312") {
                _this.wrapper.classList.add('width-500');
            }
            var pData = para.data, inputs = pData && pData.inputs, panelId = pData && pData.panelId, uiTmpl = pData && pData.uiTmpl, shortcuts = para.shortcuts;
            var parent = _this.bodyWrapper;
            parent.dataset.name = panelId;
            // 表格
            var tableList = pData && pData.tabeList;
            // 按键事件
            if (shortcuts) {
                _this.handlerKey = function (e) {
                    EvenAction_1.eventActionHandler(para, e);
                };
                // 添加按键ui
                var fragment_1 = document.createDocumentFragment();
                shortcuts.forEach(function (p) {
                    var dom = d.create("<div class=\"swipe\">" + p.shortKey + p.shortName + "</div>");
                    fragment_1.appendChild(dom);
                });
                para.body.appendChild(fragment_1);
            }
            if (uiTmpl === 'sale-bill') {
                d.append(para.body, _this.billTpl());
            }
            //输入类型
            inputs && inputs.forEach(function (i) {
                // 标题
                if (i.caption) {
                    d.append(parent, d.create("<div class=\"cashier-caption\">" + i.caption + "</div>"));
                }
                // 输入框
                if (!_this.inputBox && (i.inputType === '2' || i.inputType === '1')) {
                    _this.inputBox = d.create("<div class=\"inputBox\" data-name=\"" + i.fieldName + "\" data-type=\"" + (i.atrrs && i.atrrs.displayFormat || '') + "\"></div>");
                }
            });
            // 提示框
            if (shortcuts) {
                d.append(parent, d.create("<div class=\"modal-short-tip\"></div>"));
            }
            _this.inputBox && d.append(parent, _this.inputBox);
            if (tableList && tableList[0]) {
                com_1.Com.itemList[panelId] = {};
                var tableInit_1 = function (index) {
                    var table = tableList[index];
                    index++;
                    if (!table) {
                        com_1.Com.keyFlag = true;
                        return;
                    }
                    com_1.Com.itemList[panelId][table.itemId] = new ItemList_1.ItemList({
                        dom: _this.body,
                        data: pData,
                        table: table,
                        nextField: para.nextField,
                        afterInit: function () {
                            tableInit_1(index);
                        }
                    });
                    _this.itemList = com_1.Com.itemList[panelId][table.itemId];
                    if (shortcuts) {
                        com_1.Com.modalMainItemList = _this.itemList;
                    }
                };
                tableInit_1(0);
            }
            else {
                com_1.Com.keyFlag = true;
            }
            if (uiTmpl) {
                para.body.parentElement.classList.add(uiTmpl);
            }
            para.body.parentElement.classList.add('cashier-body');
            //打开模态框自身的键盘监听事件
            _this.on();
            return _this;
        }
        /**
         * 结账
         * @returns {HTMLElement|DocumentFragment|HTMLElement|null}
         */
        KeyModal.prototype.billTpl = function () {
            var bill = d.create("<div class=\"sale-bill\"></div>");
            this.bill = d.create("<div class=\"bill-content\"></div>");
            d.append(bill, this.bill);
            return bill;
        };
        KeyModal.prototype.destroy = function () {
            var _this = this;
            com_1.Com.keyModal = com_1.Com.keyModal.filter(function (km) { return km !== _this; });
            // console.trace();
            _super.prototype.destroy.call(this);
            if (com_1.Com.modalMainItemList === this.itemList) {
                com_1.Com.modalMainItemList = null;
            }
            this.itemList && this.itemList.destroy();
            // this.off();
            this.inputArr = [];
            this.inputBox = null;
            this.scanGun = null;
            this.p = null;
            this.handlerKey = null;
            this.itemList = null;
            // 所有模态框关闭时候都必须是销毁，除了f2设置
            if ((Modal_1.Modal.count === 0 || (Modal_1.Modal.count === 1 && com_1.Com.confModal)) && com_1.Com.mainItemList && com_1.Com.mainItemList.mainTable) {
                com_1.Com.mainItemList.mainTable.wrapper.focus();
            }
        };
        KeyModal.prototype.get = function () {
            return this.inputBox.innerHTML;
        };
        KeyModal.prototype.on = function () {
            var wrapper = this.wrapper;
            d.on(wrapper, 'keydown', this.handler);
            this.handlerKey && d.on(wrapper, 'keydown', this.handlerKey);
        };
        KeyModal.prototype.getSelect = function () {
            return this.itemList && this.itemList.getSelect();
        };
        return KeyModal;
    }(Modal_1.Modal));
    exports.KeyModal = KeyModal;
});

define("Print", ["require", "exports", "Draw", "QrCode"], function (require, exports, draw_1, QRCode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Print"/>
    var Shell = C.Shell;
    var fontSize = 25, Y = fontSize * 6 / 5; // 一个文字高度差
    var x0 = 0, // 起始位置
    x1 = 300, // head 右边x位置
    x2 = 380, // detail，foot 右边x位置
    x3 = 170, // foot 中间位置
    x4 = 140, // 热线位置
    x5 = 450; // 优惠券张数位置
    function cashReceiptPrint(print) {
        var conf = window.localStorage.getItem('printerConf'), printerConf = JSON.parse(conf), text = printerConf.text;
        printReceipt(print, text);
        if (printerConf.check) {
            printReceipt(print, '本条仅用于促销，不作为退换货凭据！');
        }
    }
    exports.cashReceiptPrint = cashReceiptPrint;
    function printReceipt(print, printText) {
        var para = print.data;
        if (print.isTest) {
            var test = new draw_1.Draw({
                width: 800,
                height: 200,
            });
            text(test, '打印机打印测试成功。', 150, 130, 2);
            test.insertImg({ x: 150, y: 0, w: 250, h: 100 }, "img/sanfu1.png", labelPrintMethod);
            // document.body.appendChild(
            //     test.getCanvas()
            // );
            return;
        }
        var noteArr = strSub(para.PrintNote, 25); // 每24个字符就换行
        var textArr = strSub(printText, 25);
        var voucherNum = 0, voucherArr = [], voucherH = 0;
        if (para.voucher) {
            voucherH = Y;
            para.voucher.forEach(function (v) {
                voucherNum += (v[2] ? v[2] : 0);
                var arr = strSub(v[1], 22), len = arr.length;
                voucherArr.push({
                    name: v[0],
                    num: v[2],
                    arr: arr,
                });
                voucherH = voucherH + (len + 1) * Y;
            });
        }
        var hData = para.header, dData = para.detail, fData = para.footer, cData = para.coupon && para.coupon.value;
        var hLen = (hData && hData.length) ? hData.length : 0, dLen = (dData && dData.length) ? dData.length : 0, fLen = (fData && fData.length) ? fData.length : 0, cLen = (cData && cData.length) ? cData.length : 0, dLong = dLen * (4 * fontSize), // 详情总长度
        f = Math.ceil(fLen / 3) + 1, logoH = 100, // logo高度100
        headY = logoH + 10, // 头部位置 = logo高度 + 10
        headH = Math.ceil(hLen / 2) * Y, // 头部高度
        detailY = headY + headH + Y, // 详情位置 = head高度 + head位置 + 2Y
        footY = detailY + dLong, // foot位置 = 详情位置 + 详情高度
        giftY = footY + f * Y, // 赠送优惠券 = foot位置 + foot高度 + Y
        noteY = giftY + (cLen === 0 ? 0 : Y), // 提示位置 = 赠送优惠券位置 + (Y 如果有赠送优惠券多一行赠送优惠券提示)
        // noteH = 2 * fontSize + 10,// 提示高度100
        lineY = noteY + noteArr.length * Y, // 热线位置 = 提示位置 + 提示高度
        textY = lineY + 2 * Y, // text位置 = 热线位置 + 2Y
        textH = textArr.length * Y, // text高度
        voucherY = textH + textY, // 已使用优惠券位置 = text高度 + 热线高度 + Y
        codeY = voucherH + voucherY + Y, // 优惠券位置 = voucher高度 + voucher位置
        height = codeY + cLen * 250 + 50; // 凭条总长度 ，50为底部预留高度
        var canvas = new draw_1.Draw({
            width: 800,
            height: height,
        });
        // if(!CA.Config.isProduct){
        //     document.body.innerHTML = '';
        //     document.body.appendChild(
        //         canvas.getCanvas()
        //     );
        // }
        canvasConfig(canvas);
        var prints = function () {
            header(canvas, para.header, headY);
            detail(canvas, para.detail, detailY);
            footer(canvas, para.footer, footY);
            if (cLen > 0) {
                text(canvas, '本单赠送' + cLen + '张优惠券', x4, giftY, 2);
            }
            /*--note、hotLine--*/
            noteArr.forEach(function (obj, i) {
                text(canvas, obj, 0, noteY + Y * i, 1);
            });
            text(canvas, para.HotLineNumber, x4, lineY, 2);
            textArr.forEach(function (obj, i) {
                text(canvas, printText, 0, textY + i * Y, 2);
            });
            // 已使用优惠券
            voucher(canvas, voucherArr, voucherNum, voucherY);
            // 赠送优惠券
            coupon(canvas, para.coupon, codeY);
        };
        prints();
        prints();
        prints();
        /*--logo--*/
        canvas.insertImg({ x: 150, y: 0, w: 250, h: logoH }, "img/sanfu1.png", labelPrintMethod);
    }
    function voucher(canvas, data, voucherNum, voucherY) {
        if (C.tools.isEmpty(data)) {
            return;
        }
        var y = voucherY + Y;
        text(canvas, '-------------------------------------------------------------', 0, voucherY, 1);
        text(canvas, '本单使用' + voucherNum + '张优惠券', x4, y, 2);
        data.forEach(function (obj, i) {
            if (i > 0) {
                y = y + (data[i - 1].arr.length + 1) * Y;
            }
            text(canvas, obj.name, x0, y + Y, 1);
            text(canvas, obj.num + '', x5, y + Y, 1);
            obj.arr.forEach(function (arr, n) {
                text(canvas, arr + '', x0, y + (2 + n) * Y, 1);
            });
        });
    }
    function strSub(str, num) {
        if (!str) {
            return [];
        }
        var strLen = str.length, data = [], i = 0, position = 0;
        while (position < strLen) {
            var sub = str.substr(position, num);
            data.push(sub);
            position += sub.length;
        }
        return data;
    }
    function canvasConfig(canvas) {
        // 修改背景，默认全黑
        canvas.getCanvasCt().fillStyle = 'rgb(255,255,255)';
        canvas.getCanvasCt().fillRect(0, 0, canvas.getCanvas().width, canvas.getCanvas().height);
        canvas.graph(3, { x: 0, y: 282 }, { penStyle: 1 });
        canvas.getCanvasCt().font = " BOLD 25px Courier New2";
        canvas.getCanvasCt().fillStyle = "black";
    }
    function coupon(canvas, coupon, codeY) {
        var data = coupon && coupon.value;
        if (C.tools.isEmpty(data)) {
            return;
        }
        var config = coupon.config, fieldName = null;
        config.forEach(function (conf) {
            switch (conf.type) {
                case '15':
                    fieldName = conf.fieldName;
                    break;
            }
        });
        text(canvas, '-------------------------------------------------------------', 0, codeY, 1);
        data.forEach(function (val, i) {
            var y = (i * 250) + codeY;
            var keys = Object.keys(val);
            text(canvas, val[keys[0]], 0, y + Y, 0);
            text(canvas, val[keys[1]], x1, y + Y, 3);
            if (fieldName) {
                canvas.insertCanvas(QRCode_1.QrCode.toCanvas(val[fieldName], 120, 120), 30, y + 70);
            }
            text(canvas, val[keys[2]], 0, y + 220, 3);
        });
    }
    function text(canvas, content, x, y, alignment, w, h) {
        canvas.text(content, { x: x, y: y, w: w, h: h }, {
            font: {
                fontSize: fontSize,
                fontStyle: 2
            },
            wrapping: true,
            alignment: alignment
        });
    }
    function footer(canvas, data, y) {
        if (C.tools.isEmpty(data)) {
            return;
        }
        text(canvas, '-------------------------------------------------------------', 0, y, 1);
        data.forEach(function (foot, i) {
            var index = Math.floor(i / 3), footY = y + Y * (index + 1), footX = getFootX(i), value = foot.caption + ':' + foot.value;
            var position = 0;
            if ([2, 5].includes(i)) {
                position = 1;
            }
            text(canvas, value, footX, footY, position);
        });
    }
    function header(canvas, data, headY) {
        if (C.tools.isEmpty(data)) {
            return;
        }
        data.forEach(function (head, i) {
            var value = head.caption + ':' + head.value;
            text(canvas, value, x1 * (i % 2 === 0 ? 0 : 1), headY + Math.floor(i / 2) * Y, 1);
        });
    }
    function detail(canvas, data, detailY) {
        if (C.tools.isEmpty(data)) {
            return;
        }
        text(canvas, '-------------------------------------------------------------', 0, detailY - Y, 1);
        var y = detailY;
        data.forEach(function (obj, i) {
            var y0 = y + i * (3 * Y + 10), y1 = y0 + Y, y2 = y1 + Y;
            // 男装
            text(canvas, obj[0], 0, y0, 1);
            // 编码
            text(canvas, obj[1], x2, y0, 2);
            // 衬衫
            text(canvas, obj[2] + ' ' + obj[3], 0, y1, 1);
            // 3705的的面料
            text(canvas, obj[4] + ' ' + obj[5], x2, y1, 2);
            // 价格 X 件数
            text(canvas, obj[6] + 'X' + obj[7], 0, y2, 2);
            // 退货原因
            text(canvas, obj[8], x3, y2, 2);
            // 价格
            text(canvas, obj[9] + '', x2, y2, 2);
        });
    }
    function getFootX(i) {
        var x = 0;
        switch (i % 3) {
            case 1:
                x = x3;
                break;
            case 2:
                x = x2;
                break;
            case 0:
                x = x0;
                break;
        }
        return x;
    }
    function labelPrintMethod(sag) {
        var conf = window.localStorage.getItem('printerConf'), printerConf = JSON.parse(conf), driveCode = 0;
        if (printerConf && printerConf.printer) {
            driveCode = printerConf.printer;
        }
        Shell.printer.labelPrint(1, driveCode, sag, function (re) { });
    }
});

define("ItemList", ["require", "exports", "Com", "SqlLiteRequest", "TableLite"], function (require, exports, com_1, CashierRequest_1, TableLite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="ItemList"/>
    var tools = C.tools;
    var d = C.d;
    var Rule = C.Rule;
    /**
     * 表格模块
     * 1.tableLite 常规表格型
     * 2.非tableLite 数据类型与表格一致，展示方法非表格形式。
     */
    var allTableLite = [];
    var ItemList = /** @class */ (function () {
        function ItemList(para) {
            var _this = this;
            this.trSelect = function (e) {
                e.preventDefault();
                var code = e.keyCode || e.which || e.charCode;
                if ([37, 38, 39, 40, 98, 99, 104, 110].includes(code)) {
                    // e.stopPropagation();
                    var table = _this.props.dom, select = d.query('.tr-select', table);
                    if (!select) {
                        var tr = d.query('tr[data-index="0"]', table);
                        tr && tr.classList.add('tr-select');
                        return;
                    }
                    var index = parseInt(select.dataset.index), selectHeight = select.offsetHeight, head = d.query('thead', table), headHeight = head.offsetHeight, // head高度
                    minus = select.offsetTop - table.scrollTop + headHeight + selectHeight, sum = headHeight + 2 * selectHeight + 10, nextIndex = void 0, next = void 0;
                    switch (code) {
                        case 98: // 数字键盘2下一条
                        case 40: // ↓
                        case 39: // →
                        // case 50: // 数字字母键盘2
                        case 110: // 数字键盘'.'
                            nextIndex = index + 1;
                            if (minus <= table.offsetHeight) {
                                selectHeight = 0;
                            }
                            break;
                        // case 99: // 数字键盘3下一页
                        // nextIndex = index + 15;
                        // selectHeight = 15 * selectHeight - 5;
                        // break;
                        case 104: // 数字键盘8上一条
                        case 99: // 数字键盘3
                        case 38: // ↑
                        case 37: // ←
                            // case 51: // 数字字母键盘3
                            // case 56: // 数字字母键盘8
                            nextIndex = index - 1;
                            if (minus < sum) {
                                selectHeight = -selectHeight + 0.5;
                            }
                            else {
                                selectHeight = 0;
                            }
                            break;
                        // case 105: // 数字键盘9上一页
                        // case 57:  // 数字字母键盘9
                        //     nextIndex = index - 15;
                        //     selectHeight = -15*selectHeight + 5;
                        //     break
                        default:
                            return;
                    }
                    // debugger;
                    next = d.query('tr[data-index ="' + nextIndex + '"]', table);
                    table.scrollTop += selectHeight;
                    head.style.transform = "translateY(" + table.scrollTop + "px)";
                    if (next) {
                        select.classList.remove('tr-select');
                        next.classList.add('tr-select');
                    }
                }
            };
            this.props = para;
            var tag = para.data.tag;
            this.hasEvent = typeof para.hasEvent === 'undefined' ? [1, 3, 5, 7].includes(tag) : para.hasEvent;
            // 加载表格数据
            this.ajaxLoad(function (response) {
                var data = response.data;
                _this.initTable(data ? data : []);
                var text = response.showText;
                tools.isNotEmpty(text) && _this.logTip(text);
            });
        }
        ItemList.prototype.logTip = function (str) {
            if (!this._tipEl) {
                this._tipEl = d.query('.reminder-msg', document);
            }
            this._tipEl.innerHTML = str;
        };
        ItemList.prototype.initTable = function (tableData) {
            var _this = this;
            var num = 0, sum = 0, data = this.props.data;
            this.wrapper = d.create("<table class=\"table-container\"></table>");
            this.props.dom.appendChild(this.wrapper);
            // 售货员一栏三个表格宽度计算
            if (data.uiTmpl === 'sale-info') {
                data.tabeList.forEach(function (table) {
                    table.cols.forEach(function (col) {
                        if (!col.noShow) {
                            sum++;
                        }
                    });
                });
                this.props.table.cols.forEach(function (obj) {
                    if (!obj.noShow) {
                        num++;
                    }
                });
                this.wrapper.style.width = num / sum * 100 + '%';
            }
            // 应收一栏初始化添加一行空数据
            if (data.uiTmpl === 'sale-count' && !tableData[0]) {
                tableData.push({});
                this.props.table.cols.forEach(function (c) {
                    tableData[0][c.fieldName] = '';
                });
            }
            var tag = data.tag;
            tools.isEmpty(tag) && (tag = 0);
            this.mainTable = new TableLite_1.TableLite({
                cols: this.props.table.cols,
                table: this.wrapper,
                data: tableData,
                hasNumber: [4, 5, 6, 7].includes(tag),
                onChange: function (newField, col, data, tr) {
                    tools.isNotEmpty(newField) && _this.assign(col, data, tr);
                },
                toFixed: function (field, col) {
                    var toFixed = col && col.toFixed;
                    if (tools.isNotEmpty(toFixed)) {
                        // console.log(field,col);
                        if (typeof field === 'string') {
                            field = Number(field);
                        }
                        field = field.toFixed(toFixed) + '';
                    }
                    return field;
                },
                showField: function (showField, col) {
                    // if(col.dataType === Rule.DT_MONEY)
                    var format = col.displayFormat;
                    if (Rule.isNumber(col.dataType) && typeof showField === 'string' && format) {
                        showField = Number(showField);
                    }
                    return Rule.formatText(showField, {
                        dataType: col.dataType,
                        displayFormat: format ? format : ''
                    }, true, true);
                }
            });
            if (this.hasEvent) {
                allTableLite.push(this.mainTable);
                this.mainTable.wrapper.focus();
                this.on();
            }
            if ([0, 1, 4, 5].includes(tag)) {
                // 菜单
                this.wrapper.classList.add('menu-bar');
            }
            else {
                // 表格
                this.wrapper.parentElement.classList.add('has-table');
                if ([1, 3, 5, 7].includes(tag)) {
                    this.mainTable.select(0);
                }
            }
            com_1.Com.count(data.dataRules, data.panelId);
            this.props.afterInit && this.props.afterInit();
        };
        /**
         *
         * @param col
         * @param data
         * @param tr
         */
        ItemList.prototype.assign = function (col, data, tr) {
            var _this = this;
            var assignAddr = col.assignAddr;
            if (!assignAddr) {
                return;
            }
            assignAddr['data'] = data;
            CashierRequest_1.CashierRequest(assignAddr).then(function (_a) {
                var response = _a.response;
                var newField, resData = response.data && response.data[0], fields = col.assignSelectFields || [];
                fields.forEach(function (field) {
                    newField = null;
                    for (var item in resData) {
                        if (item === field) {
                            newField = resData[item];
                        }
                    }
                    newField && _this.mainTable.resetData(field, newField, tr.dataset.index);
                    // 写死当实售价发生变化时候出发dataRule
                    if (field === 'REALPRICE') {
                        var name_1 = _this.wrapper.parentElement.dataset.name, data_1 = com_1.Com.data[name_1], dataRules = data_1 && data_1.dataRules, panelId = data_1 && data_1.panelId;
                        dataRules && com_1.Com.count(dataRules, panelId, newField);
                    }
                });
            });
        };
        /**
         * 表格数据获取
         * @param cb
         */
        ItemList.prototype.ajaxLoad = function (cb) {
            var data = this.props.data;
            if (!data || !data.tabeList) {
                return;
            }
            var table = this.props.table, addr = table.dataAddr, nextField = this.props.nextField;
            tools.isNotEmpty(nextField) && (addr['data'] = nextField);
            if (table.loadData === 0) {
                cb([]);
                return;
            }
            CashierRequest_1.CashierRequest(addr).then(function (_a) {
                var response = _a.response;
                cb(response);
            });
        };
        ItemList.prototype.getData = function () {
            return this.mainTable && this.mainTable.get().data;
        };
        ItemList.prototype.on = function () {
            d.on(this.mainTable.wrapper, 'keydown', this.trSelect);
        };
        ItemList.prototype.off = function () {
            d.off(this.mainTable.wrapper, 'keydown', this.trSelect);
        };
        ItemList.prototype.select = function (index) {
            this.mainTable.select(index);
        };
        ItemList.prototype.getSelect = function () {
            return this.mainTable && this.mainTable.getSelect();
        };
        ItemList.prototype.resetData = function (name, newField, index) {
            this.mainTable.resetData(name, newField, index + '');
        };
        ItemList.prototype.addByData = function (data) {
            if (com_1.Com.mainItemList === this) {
                var confData = com_1.Com.local.getItem('printerConf'), row = confData && tools.isNotEmpty(confData.row) ? confData.row : 10;
                if (tools.isNotEmpty(row) && row !== 0) {
                    var len = com_1.Com.mainItemList.getData().length;
                    if (len >= row) {
                        com_1.Com.logTip('超出数据固定行数，无法添加商品数据。', true);
                        return;
                    }
                }
            }
            this.mainTable.addByData(data);
            this.tableSelect();
        };
        ItemList.prototype.tableSelect = function () {
            var tag = this.props.data.tag;
            if ([1, 3, 5, 7].includes(tag)) {
                var d_1 = this.mainTable.get().data;
                this.mainTable.select(d_1 && d_1.length - 1);
            }
        };
        ItemList.prototype.refresh = function (data, isChange) {
            if (isChange === void 0) { isChange = true; }
            if (!data) {
                return;
            }
            this.mainTable.refresh(data, isChange);
            this.tableSelect();
        };
        ItemList.prototype.emptied = function () {
            this.mainTable.emptied();
            // 应收一栏清空时候默认添加一行空数据
            if (this.props && this.props.data && this.props.data.uiTmpl === 'sale-count') {
                var para = com_1.Com.countItemList.get(), tableData_1 = [{}];
                para.cols.forEach(function (c) {
                    tableData_1[0][c.fieldName] = '';
                });
                com_1.Com.countItemList.addByData(tableData_1);
            }
        };
        ItemList.prototype.get = function () {
            return this.mainTable.get();
        };
        ItemList.prototype.destroy = function () {
            var _this = this;
            if (this.hasEvent) {
                allTableLite = allTableLite.filter(function (km) { return km !== _this.mainTable; });
            }
            var last = allTableLite[allTableLite.length - 1];
            last && last.wrapper.focus();
            this.mainTable = null;
        };
        return ItemList;
    }());
    exports.ItemList = ItemList;
});

define("OffLine", ["require", "exports", "SqlLiteRequest", "Modal", "BwWebsocket", "Com"], function (require, exports, CashierRequest_1, Modal_1, websocket_1, com_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OffLine = /** @class */ (function () {
        function OffLine() {
            // private shell;
            this.endPosData = false;
            this.endPosVer = false;
            this.url = {
                frontFile: '/pos/frontFile/',
                data: '/pos/data/'
            };
        }
        // constructor(){
        // this.operateFile()
        //        Modal.alert( this.shell.pcHandle('sqlLiteQuery',{
        //            query: `CREATE TABLE COMPANY(
        //    ID INT PRIMARY KEY     NOT NULL,
        //    NAME           TEXT    NOT NULL,
        //    AGE            INT     NOT NULL,
        //    ADDRESS        CHAR(50),
        //    SALARY         REAL
        // )`,
        //        }))
        //        Modal.alert( shell.pcHandle('sqliteMetaDataQuery',JSON.stringify({
        //            query : 'alltable'
        //        })))
        // Modal.alert( shell.pcHandle('fileUnzip',JSON.stringify({
        //     path : 'D:/wpeinit.zip',
        //     outdir : 'D:/test'
        // })))
        // Modal.alert( shell.pcHandle('fileSave',JSON.stringify({
        //     path : 'D:/test/text.txt',
        //     file : 'MTExMTIzMjIx',
        //     isAppend : false
        //     // outdir : 'D:/test'
        // })))
        // }
        OffLine.prototype.init = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!window.navigator.onLine) {
                    com_1.Com.sceneVersion = JSON.parse(window.localStorage.getItem('sceneVersion'));
                    if (!com_1.Com.sceneVersion) {
                        Modal_1.Modal.alert('网络异常，首次登陆请确保网络连接正常!');
                    }
                    resolve(false);
                }
                else {
                    // this.storage = new ShellStoragePc();
                    // this.shell = AppShell.postMessage();
                    _this.websocket(resolve);
                }
            });
        };
        /**
         * 开启websocket
         */
        OffLine.prototype.websocket = function (resolve) {
            var _this = this;
            console.log(com_1.Com.urlSite);
            var url = com_1.Com.urlSite.match(/\/\/(\S*)\//)[0];
            new websocket_1.BwWebsocket({
                url: 'wss:' + url + 'cashier/pos/websocket/',
                sendData: JSON.stringify(this.upLoad()),
                onMessage: function (r) {
                    var data = JSON.parse(r.data);
                    // console.log(data);
                    switch (data.respType) {
                        case 'posver':
                            _this.posVer(data, resolve);
                            break;
                        case 'posdata':
                            _this.posData(data, resolve);
                            break;
                    }
                },
                onOpen: function (r) {
                },
            });
        };
        /**
         * 1.从shell获取离线数据传
         * 2.从本地提取配置信息
         */
        OffLine.prototype.upLoad = function () {
            // 获取配置信息，获取离线数据
            var sceneVersion = window.localStorage.getItem('sceneVersion'), verData = sceneVersion && JSON.parse(sceneVersion), id, ver, instance = [], table = [];
            if (C.tools.isNotEmpty(verData)) {
                var panel = verData.panel;
                panel && panel.forEach(function (obj) {
                    instance.push(obj[0]);
                });
                // table = this.shell.pcHandle('');
                id = verData.sceneId;
                ver = verData.version;
            }
            var data = {
                scene: 'cashier_test',
                instance: instance,
                table: table // 从shell获取
            };
            id && (data['sceneId'] = id);
            ver && (data['version'] = ver);
            return {
                reqType: "posver",
                data: data
            };
        };
        /**
         * H5传递数据给shell，shell创建表
         */
        OffLine.prototype.posData = function (addr, resolve) {
            var _this = this;
            console.log(addr, 'posData');
            if (!addr.data || !addr.data.dataAddr) {
                return;
            }
            CashierRequest_1.CashierRequest(addr.data).then(function (_a) {
                var response = _a.response;
                var sql = '', tableName = response.tableName, meta = response.meta, pcHandle = AppShell.postMessage;
                // 构造sql语句
                response.datalist && response.datalist.forEach(function (obj) {
                    sql = sql + 'INSERT INTO ' + tableName + '[( ' + meta + ')]\n' + 'VALUES(' + obj.join(',') + ');\n';
                });
                response.upType === 1 && pcHandle('sqlLiteQuery', tableName); // 删除表
                pcHandle('sqlLiteQuery', response.sql); // 创建表
                pcHandle('sqlLiteQuery', sql); // 插入表数据
                _this.endPosData = true;
                _this.resolve(resolve);
            });
        };
        /**
         * 版本请求，存储版本信息及ui数据，panel,item,(cond权限判断)
         */
        OffLine.prototype.posVer = function (addr, resolve) {
            var _this = this;
            console.log(addr, 'posVer');
            if (!addr.data || !addr.data.dataAddr) {
                return;
            }
            CashierRequest_1.CashierRequest(addr.data).then(function (_a) {
                var response = _a.response;
                // console.log(response,'setScene');
                window.localStorage.setItem('sceneVersion', JSON.stringify(response));
                _this.endPosVer = true;
                _this.resolve(resolve);
            });
        };
        OffLine.prototype.resolve = function (resolve) {
            if (this.endPosData && this.endPosVer) {
                this.endPosData = false;
                this.endPosVer = false;
                resolve(true);
            }
        };
        return OffLine;
    }());
    exports.OffLine = OffLine;
});

define("LoginReg", ["require", "exports", "Modal", "SqlLiteRequest", "Com", "OffLine"], function (require, exports, Modal_1, CashierRequest_1, com_1, OffLine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name="LoginReg"/>
    var SPAPage = C.SPAPage;
    var Shell = C.Shell;
    var SPA = C.SPA;
    var d = C.d;
    var ConfPage = /** @class */ (function (_super) {
        __extends(ConfPage, _super);
        function ConfPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ConfPage.prototype.init = function (para, p) {
            var _this = this;
            this.p = Object.assign({}, p);
            var device = Shell.base.device, data = device && device.data;
            if (!data || !data.uuid) {
                Modal_1.Modal.alert('未获取到设备信息，请使用速狮客户端登陆。');
                if (CA.Config.isProduct) {
                    return;
                }
            }
            if (!CA.Config.isProduct) {
                d.on(document, 'keydown', function (e) {
                    if (e.key === 'F11') {
                        window.location.reload();
                    }
                });
            }
            this.wrapper.classList.remove('hide');
            this.printConf = {
                printer: 0,
                row: 10,
                text: '本单为退换凭据，退换货条款详见店堂公告',
                check: false,
                scenes: 'cashier',
                boot: false,
                shutDown: false
            };
            this.rfidConf = {
                line: 0,
                ip: '192.168.1.200',
                port: 100,
                com: 'COM1',
                baud: 115200,
                aerial: 5,
                buzz: false,
                led: false,
            };
            var rfidConf = com_1.Com.local.getItem('rfidConf'), conf = com_1.Com.local.getItem('printerConf');
            !rfidConf && com_1.Com.local.setItem('rfidConf', this.rfidConf);
            !conf && com_1.Com.local.setItem('printerConf', this.printConf);
            var cashierConf = com_1.Com.local.getItem('printerConf'), serverUrl = window.localStorage.getItem('serverUrl');
            com_1.Com.urlSite = serverUrl + 'cashier';
            new OffLine_1.OffLine().init().then(function (e) {
                console.log(e);
            });
            this.getConfig(cashierConf.scenes)
                .then(function () {
                _this.startAction();
            });
        };
        ConfPage.prototype.startAction = function () {
            var _this = this;
            CashierRequest_1.CashierRequest({
                dataAddr: com_1.Com.url.registered
            }).then(function (_a) {
                var response = _a.response;
                switch (response.req) {
                    case '0': // 注册成功
                        com_1.Com.scene().then(function () {
                            _this.wrapper.classList.add('hide');
                        });
                        break;
                    case '1': // 未注册
                        _this.wrapper.classList.add('hide');
                        SPA.open(SPA.hashCreate('index', 'reg'), response.req);
                        break;
                }
            });
        };
        /**
         * 获取配置信息
         */
        ConfPage.prototype.getConfig = function (scenes) {
            return CashierRequest_1.CashierRequest({
                dataAddr: com_1.Com.url.config + '?setmode=' + scenes
            }).then(function (_a) {
                var response = _a.response;
                com_1.Com.config = response.dataArr;
            });
        };
        ConfPage.prototype.wrapperInit = function () {
            return h("div", { class: "main" },
                h("div", { className: 'text-loading' }, "\u9875\u9762\u8DF3\u8F6C\u4E2D..."),
                h("div", { className: 'loading-anim' },
                    h("div", { className: 'border out' }),
                    h("div", { className: 'border in' }),
                    h("div", { className: 'border mid' }),
                    h("div", { className: 'circle' },
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }),
                        h("span", { className: 'dot' }))));
        };
        Object.defineProperty(ConfPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = '配置页';
            },
            enumerable: true,
            configurable: true
        });
        return ConfPage;
    }(SPAPage));
    exports.ConfPage = ConfPage;
});

define("KeyModalPage", ["require", "exports", "KeyModal", "Com", "EventAction"], function (require, exports, KeyModal_1, com_1, EvenAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name="KeyModalPage"/>
    var SPAPage = C.SPAPage;
    var tools = C.tools;
    var d = C.d;
    var KeyModalPage = /** @class */ (function (_super) {
        __extends(KeyModalPage, _super);
        function KeyModalPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(KeyModalPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = '模态框';
            },
            enumerable: true,
            configurable: true
        });
        KeyModalPage.prototype.init = function (para, data) {
            var _this = this;
            var res = data && data.data, clearGlobal = res && res.clearGlobal;
            var p = {
                title: res && res.panelName,
                body: d.create("<div></div>"),
                callback: function (e, content, type) {
                    if (res && res.inputs) {
                        var code = e.keyCode || e.which || e.charCode;
                        if (code === 13) {
                            if (com_1.Com.keyFlag) {
                                com_1.Com.keyFlag = false;
                            }
                            else {
                                return;
                            }
                            EvenAction_1.inputs(type, res, content, data.nextField);
                        }
                    }
                },
                keyDownHandle: function (e) {
                    if (_this.keyModal.disabledEsc) {
                        return;
                    }
                    var code = e.keyCode || e.which || e.charCode;
                    if (code === 27 && clearGlobal === 1) {
                        var tData = _this.keyModal.itemList.getData()[0];
                        EvenAction_1.inputs(com_1.Com.KEYBOARD, res, tData.AFTERCOUPONPRICE, data.nextField);
                    }
                }
            };
            this.keyModal = new KeyModal_1.KeyModal(tools.obj.merge(p, data));
            if (clearGlobal === 1) {
                this.keyModal.escKey = false;
            }
        };
        KeyModalPage.prototype.wrapperCreate = function () {
            return null;
        };
        KeyModalPage.prototype.wrapperInit = function () {
            return null;
        };
        KeyModalPage.prototype.destroy = function () {
            this.keyModal && this.keyModal.destroy();
        };
        return KeyModalPage;
    }(SPAPage));
    exports.KeyModalPage = KeyModalPage;
});

define("MainPage", ["require", "exports", "Com", "EventAction", "ItemList"], function (require, exports, com_1, EvenAction_1, ItemList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name="MainPage"/>
    var SPAPage = C.SPAPage;
    var d = C.d;
    var Shell = C.Shell;
    var MainPage = /** @class */ (function (_super) {
        __extends(MainPage, _super);
        function MainPage() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.beforeClose = function (page) {
                _this.off();
            };
            _this.domReady = function () {
                // this.wrapper.focus();
                // 禁用鼠标
                _this.wrapper.onmousedown = function (e) {
                    return false;
                };
            };
            return _this;
        }
        MainPage.prototype.init = function (para, data) {
            var _this = this;
            this.p = data;
            var container = d.query('.cash-content', this.wrapper), elem = this.p.elements || [];
            elem.forEach(function (obj) {
                var uiTmpl = obj.uiTmpl, el, panelId = obj.panelId, height = uiTmpl === 'sale-table' ? obj.height + '% - 10px' : obj.height + '%', dom = h("div", { className: uiTmpl + " align-center", style: "height:calc(" + height + ")", "data-name": panelId });
                container.appendChild(dom);
                if (uiTmpl === 'hot-key') {
                    el = _this.hotKeyInit();
                }
                else {
                    if (uiTmpl === 'sale-header') {
                        el = _this.initHeader();
                    }
                    _this.initTable(obj, dom);
                }
                el && dom.appendChild(el);
                com_1.Com.data[panelId] = obj;
            });
            var keyData = {
                shortcuts: this.p.shortcuts,
                elements: this.p.elements
            };
            this.handlerMain = function (e) {
                if (com_1.Com.keyModal[0]) {
                    return;
                }
                EvenAction_1.eventActionHandler(keyData, e);
                EvenAction_1.mainKeyDownEvent(keyData, e);
            };
            var tagArr = [], timer;
            var element = null;
            keyData.elements.forEach(function (obj) {
                if (obj.inputType && obj.inputType.includes(com_1.Com.RFID)) {
                    element = obj;
                }
            });
            // 开启rfid
            var rfidConf = com_1.Com.local.getItem('rfidConf'), str = rfidConf.ip, num = rfidConf.port;
            if (rfidConf.line) {
                str = rfidConf.com;
                num = rfidConf.baud;
            }
            console.log(str, num);
            Shell.rfid.start(str, num, function (data) {
                var modal = com_1.Com.keyModal[com_1.Com.keyModal.length - 1], value = data && data.data && data.data[0];
                if (modal || !value) {
                    return;
                }
                timer && clearTimeout(timer);
                timer = setTimeout(function () {
                    tagArr = [];
                }, 1000);
                if (com_1.Com.keyFlag) {
                    com_1.Com.keyFlag = false;
                }
                else {
                    return;
                }
                if (!tagArr.includes(value)) {
                    tagArr.push(value);
                    EvenAction_1.inputs(com_1.Com.RFID, element, value);
                }
                else {
                    com_1.Com.keyFlag = true;
                }
            });
            this.focusHandle = function () {
                com_1.Com.focusHandle();
            };
            this.on();
        };
        MainPage.prototype.initTable = function (obj, dom) {
            var uiTmpl = obj.uiTmpl, panelId = obj.panelId;
            com_1.Com.itemList[panelId] = {};
            obj.tabeList.forEach(function (table) {
                // debugger;
                var itemId = table.itemId;
                com_1.Com.itemList[panelId][itemId] = new ItemList_1.ItemList({
                    dom: dom,
                    data: obj,
                    table: table,
                    hasEvent: uiTmpl === 'sale-table',
                });
                if (uiTmpl === 'sale-table') {
                    com_1.Com.mainItemList = com_1.Com.itemList[panelId][itemId];
                }
                if (uiTmpl === 'sale-count') {
                    com_1.Com.countItemList = com_1.Com.itemList[panelId][itemId];
                }
                if (uiTmpl !== 'sale-header') {
                    if (uiTmpl === 'sale-count') {
                        itemId = 'sale-count';
                    }
                    com_1.Com.clearItem[itemId] = com_1.Com.itemList[panelId][table.itemId];
                }
            });
        };
        MainPage.prototype.on = function () {
            // this.wrapper.tabIndex = parseInt(C.tools.getGuid(''));
            // this.wrapper.focus();
            d.on(document.body, 'keydown', this.handlerMain);
            // 聚焦到当前模态框
            d.on(document.body, 'click', this.focusHandle);
        };
        MainPage.prototype.off = function () {
            d.off(document.body, 'keydown', this.handlerMain);
            d.off(document.body, 'click', this.focusHandle);
        };
        /**
         * 按键图标面板
         */
        MainPage.prototype.hotKeyInit = function () {
            var shortcuts = this.p.shortcuts || [];
            var el = h("div", { className: "sale-navigation" },
                h("div", { className: "sale-hotkey" })), saleHotKeyEl = d.query('.sale-hotkey', el);
            shortcuts.forEach(function (s) {
                return d.append(saleHotKeyEl, h("div", null,
                    h("img", { height: "50", src: "img/" + s.shortIcon + ".png", alt: "" }),
                    h("p", null, s.shortKey + s.shortName)));
            });
            { /*<div><span className={s.shortIcon}></span><p>{s.shortKey + s.shortName}</p></div>));*/ }
            return el;
        };
        /**
         * 标题面板
         */
        MainPage.prototype.initHeader = function () {
            var tpl = h("div", null,
                h("div", { className: "sale-title" },
                    h("div", { className: "sale-light" },
                        h("span", { class: "online" },
                            h("img", { src: "img/onLine.png", width: "35px", alt: "" }),
                            "\u5728\u7EBF"),
                        h("span", { class: "disconnect" },
                            h("img", { src: "img/disconnect.png", width: "35px", alt: "" }),
                            "\u65AD\u5F00")),
                    h("table", { className: "table-container" }),
                    h("span", { className: "sale-time" })));
            this.onLineMonitor(tpl);
            var timeDom = d.query('.sale-time', tpl);
            var time = function () {
                timeDom.innerHTML = new Date().toLocaleString();
            };
            setInterval(time, 1000);
            time();
            return tpl;
        };
        /**
         * online or offline监听
         */
        MainPage.prototype.onLineMonitor = function (dom) {
            var light = d.query('.sale-light', dom), onLine = d.query('.online', light), disconnect = d.query('.disconnect', light), isOnLine = window.navigator.onLine;
            // d.classToggle(light, 'green', window.navigator.onLine);
            d.classToggle(onLine, 'hide', !isOnLine);
            d.classToggle(disconnect, 'hide', isOnLine);
            d.on(window, 'online', function (r) {
                disconnect.classList.add('hide');
                onLine.classList.remove('hide');
            });
            d.on(window, 'offline', function (r) {
                onLine.classList.add('hide');
                disconnect.classList.remove('hide');
            });
        };
        MainPage.prototype.wrapperInit = function () {
            return h("div", { tabindex: C.tools.getGuid(''), id: "container", style: "height: 100%", oncontextmenu: "return false;", oncopy: "return false;", oncut: "return false;", onselectstart: "return false" },
                h("div", { className: "cash-content" }),
                h("div", { className: "sale-log" },
                    h("span", { class: "iconfont icon-xinxi" }),
                    h("label", { className: "reminder-msg" }),
                    h("div", { class: "log-loading" },
                        h("span", null),
                        h("span", null),
                        h("span", null),
                        h("span", null),
                        h("span", null),
                        h("span", null),
                        h("span", null),
                        h("span", null))));
        };
        Object.defineProperty(MainPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = '主页';
            },
            enumerable: true,
            configurable: true
        });
        return MainPage;
    }(SPAPage));
    exports.MainPage = MainPage;
});

define("LoginPage", ["require", "exports", "TextInput", "SelectInput", "CheckBox", "Modal", "NumInput", "Tab", "Com", "SqlLiteRequest", "Print", "Button", "SelectBox"], function (require, exports, text_1, selectInput_1, checkBox_1, Modal_1, numInput_1, tab_1, com_1, CashierRequest_1, Print_1, Button_1, selectBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name="LoginPage"/>
    var SPAPage = C.SPAPage;
    var d = C.d;
    var SPA = C.SPA;
    var Shell = C.Shell;
    var LoginPage = /** @class */ (function (_super) {
        __extends(LoginPage, _super);
        function LoginPage() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.confModalHandle = function (e) {
                var keyCode = e.keyCode || e.which || e.charCode, altKey = e.altKey;
                _this.altCombKey(altKey, keyCode);
                switch (keyCode) {
                    case 27:
                        _this.finger();
                        break;
                    case 9: // Tab
                        var okDom = d.query('.button-type-primary', com_1.Com.confModal.modalFooter.wrapper);
                        okDom.onblur = function (e) {
                            setTimeout(function () {
                                com_1.Com.confModal.wrapper.focus();
                            }, 100);
                        };
                        break;
                    case 13:
                        _this.confModalOnOk();
                        break;
                }
            };
            _this.afterClose = function (hash) {
                _this.off();
            };
            return _this;
        }
        LoginPage.prototype.init = function (para) {
            var _this = this;
            this.handle = function (e) {
                e.preventDefault();
                var keyCode = e.keyCode || e.which || e.charCode;
                switch (keyCode) {
                    case 113: // F2
                        Shell.finger.cancel(function () { });
                        if (!com_1.Com.confModal) {
                            com_1.Com.confModal = new Modal_1.Modal({
                                header: {
                                    title: '收银台设置',
                                },
                                body: d.create("<div></div>"),
                                className: 'cashier-conf',
                                isBackground: false,
                                width: '360px',
                                keyDownHandle: _this.confModalHandle,
                                footer: {}
                            });
                            _this.initTab();
                            com_1.Com.confModal.onOk = function () {
                                _this.confModalOnOk();
                            };
                            com_1.Com.confModal.onCancel = function () {
                                com_1.Com.confModal.isShow = false;
                                _this.finger();
                            };
                        }
                        else {
                            com_1.Com.confModal.isShow = true;
                            com_1.Com.confModal.wrapper.focus();
                        }
                        break;
                    case 123: // F12
                        Print_1.cashReceiptPrint({
                            isTest: true
                        });
                        break;
                    case 27:
                        var conf = com_1.Com.local.getItem('printerConf');
                        // 自动关机
                        if (conf && conf.shutDown) {
                            Shell.startUp.shutDown(function () {
                                window.close();
                            });
                        }
                        else {
                            window.close();
                        }
                        break;
                }
            };
            this.show();
        };
        LoginPage.prototype.confModalOnOk = function () {
            var msgDom = d.query('.print-msg', this._printTpl), status = msgDom.dataset.status;
            switch (status) {
                case '0':
                    com_1.Com.local.setItem('rfidConf', {
                        line: this.select.getChecked()[0],
                        ip: this.ip.get(),
                        port: parseInt(this.port.get()),
                        com: this.com.get(),
                        baud: this.baud.get(),
                        aerial: this.aerial.get(),
                        buzz: this.buzz.get() === 1,
                        led: this.led.get() === 1,
                    });
                    var server = this.serverText.get(), boot = this.boot.get() === 1, showDown = this.showDown.get() === 1, scenes = this.scenes.get();
                    com_1.Com.local.setItem('printerConf', {
                        scenes: scenes,
                        printer: this.print.get(),
                        row: this.row.get(),
                        check: this.doubleCoupon.get() === 1,
                        text: this.text.get(),
                        boot: boot,
                        shutDown: showDown,
                    });
                    window.localStorage.setItem('serverUrl', server);
                    // 开机启动项
                    Shell.startUp.start(boot);
                    var urlSite = server + 'cashier';
                    if (com_1.Com.urlSite !== urlSite) {
                        com_1.Com.urlSite = urlSite;
                        window.location.reload();
                    }
                    else {
                        this.finger();
                        com_1.Com.confModal.isShow = false;
                    }
                    break;
                case '1':
                    Modal_1.Modal.alert('服务器连接失败。');
                    break;
                case '2':
                    Modal_1.Modal.alert('请先点击测试连接，确保服务器能正常连接。');
                    break;
                case '3':
                    Modal_1.Modal.alert('服务器地址手动修改过，请先点击测试连接。');
                    break;
            }
        };
        LoginPage.prototype.altCombKey = function (altKey, keyCode) {
            if (altKey) {
                switch (keyCode) {
                    case 83: // S服务器
                        this.sever.tabIndexElGet().focus();
                        break;
                    case 84: // T测试连接
                        this.btn.wrapper.focus();
                        break;
                    case 80: // P打印机
                        this.print.tabIndexElGet().focus();
                        break;
                    case 70: // F固定行数
                        this.row.tabIndexElGet().focus();
                        break;
                    case 68: // D为促销
                        this.doubleCoupon.tabIndexElGet().focus();
                        break;
                    case 77: // M收银模式
                        this.scenes.tabIndexElGet().focus();
                        break;
                    case 78: // N备注
                        this.text.tabIndexElGet().focus();
                        break;
                    case 66: // B自动启动
                        this.boot.wrapper.focus();
                        break;
                    case 79: // O自动关机
                        this.showDown.wrapper.focus();
                        break;
                }
            }
        };
        LoginPage.prototype.finger = function () {
            var _this = this;
            if (!CA.Config.isProduct) {
                d.once(this.tpl, 'click', function () {
                    CashierRequest_1.CashierRequest({
                        dataAddr: com_1.Com.url.login,
                        method: 'post',
                        addParam: 'cpuserialno=526058-101713920-2113600447--1075053569',
                        data: {
                            fingertype: 1,
                            fingerprint: '3401000001002001F9DC88A46FA34463AE21E1B30BF000917522D615F2237256BBFD2BCD3A30BC6C60344C1E54513EF6AD3CB72659ABF8D0D7DFFA1801DC01A8825CA6A4B93B436BBDEDDB3F5C6C0255A5CC0B11AA0274710CD5F30B6F6EED9B4DAB4105C80BA21C5F072BC27DBBE7065888C81B89DF523A16BDF543B126345A9E16BA3B0A5909EA973A257ABD7EE645C2E96E196E2B64B85418CD43E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6E4A45FD600BB4CE6'
                        },
                        notVarList: true
                    }).then(function (_a) {
                        var response = _a.response;
                        _this.tip.innerHTML = response.msg;
                        var type = response.type;
                        if (type === '1') {
                            _this.openMainPage();
                        }
                        else if (type === '0') {
                            // 失败
                            // this.p.fingerCb(response);
                        }
                    });
                });
            }
            com_1.Com.finger(this.tip, com_1.Com.url.login, function (res) {
                _this.openMainPage();
            });
        };
        LoginPage.prototype.openMainPage = function () {
            this.tip.innerHTML = '正在前往主界面...';
            CashierRequest_1.CashierRequest(com_1.Com.mainAddr).then(function (_a) {
                var response = _a.response;
                SPA.open(SPA.hashCreate('main', ''), response);
            });
        };
        LoginPage.prototype.on = function () {
            d.on(document, 'keydown', this.handle);
        };
        LoginPage.prototype.off = function () {
            d.off(document, 'keydown', this.handle);
        };
        LoginPage.prototype.show = function () {
            this.on();
            this.finger();
            this.onLineTip();
        };
        LoginPage.prototype.initTab = function () {
            new tab_1.Tab({
                tabParent: com_1.Com.confModal.body,
                panelParent: com_1.Com.confModal.body,
                tabs: [{
                        title: '收银设置',
                        dom: this.printTpl(),
                    }, {
                        title: 'RFID设置',
                        dom: this.rfidTpl(),
                    }],
                tabIndex: true,
                tabIndexKey: 32
            });
            return d.create("<div></div>");
        };
        LoginPage.prototype.onLineTip = function () {
            var dom = d.query('.msg-login', this.tpl), version = 'V ' + window.localStorage.getItem('sqlQueryData'), onlineMsg = version + ' 网络连接正常', offlineMsg = version + ' 网络连接断开';
            if (!window.navigator.onLine) {
                dom.innerHTML = offlineMsg;
            }
            else {
                dom.innerHTML = onlineMsg;
            }
            d.on(window, 'online', function (r) {
                dom.innerHTML = onlineMsg;
            });
            d.on(window, 'offline', function (r) {
                dom.innerHTML = offlineMsg;
            });
        };
        LoginPage.prototype.rfidTpl = function () {
            var _this = this;
            this._rfidTpl = d.create("<div class=\"rfid-conf\">\n            <div class=\"rfid-row\">\n                <div class=\"row-left\">\n                    <div class=\"rfid-select\"></div>\n                </div>\n                <div class=\"row-right\">\n                     <div class=\"rfid-row line\">\n                         <div class=\"text\">ip</div>\n                         <div class=\"rfid-ip\"></div>\n                         <div class=\"text text-port\">\u7AEF\u53E3</div>\n                         <div class=\"rfid-port\"></div>\n                    </div>\n                     <div class=\"rfid-row unline\">\n                        <div class=\"text\">\u4E32\u53E3</div>\n                        <div class=\"rfid-com\"></div>\n                        <div class=\"text text-baud\">\u6CE2\u7279\u7387</div>\n                        <div class=\"rfid-baud\"></div>\n                    </div>\n                </div>\n                \n            </div>\n            <div class=\"rfid-row\">\n                <div class=\"text\">\u5929\u7EBF\u529F\u7387</div>\n                <div class=\"rfid-aerial\"></div>\n                <div class=\"rfid-buzz\"></div>\n                <div class=\"rfid-led\"></div>\n            </div>\n            <div class=\"rfid-content\"></div>\n            <div class=\"rfid-row btn-group\"\">\n                <div class=\"btn-left reset\"></div>\n                <div class=\"btn-center begin-test\"></div>\n                <div class=\"btn-right end-test\"></div>\n            </div></div>");
            var q = function (name) {
                return d.query(name, _this._rfidTpl);
            };
            var com = q('.rfid-com'), select = q('.rfid-select'), line = q('.line'), unLine = q('.unline'), baud = q('.rfid-baud'), ip = q('.rfid-ip'), port = q('.rfid-port'), aerial = q('.rfid-aerial'), buzz = q('.rfid-buzz'), led = q('.rfid-led'), content = q('.rfid-content'), reset = q('.reset'), test = q('.begin-test'), end = q('.end-test'), ipInput, portInput;
            var rfidConf = com_1.Com.local.getItem('rfidConf'), lineDisabled = function () {
                ipInput.setAttribute('disabled', '');
                portInput.setAttribute('disabled', '');
                unLine.classList.remove('disabled');
                line.classList.add('disabled');
            }, unLineDisabled = function () {
                ipInput.removeAttribute('disabled');
                portInput.removeAttribute('disabled');
                line.classList.remove('disabled');
                unLine.classList.add('disabled');
            };
            this.com = new selectInput_1.SelectInput({
                container: com,
                clickType: 0,
                tabIndex: true,
                readonly: true,
                data: [{
                        text: 'COM1',
                        value: 'COM1',
                    }, {
                        text: 'COM2',
                        value: 'COM2',
                    }, {
                        text: 'COM3',
                        value: 'COM3',
                    }, {
                        text: 'COM4',
                        value: 'COM4',
                    }, {
                        text: 'COM5',
                        value: 'COM5',
                    }, {
                        text: 'COM6',
                        value: 'COM6',
                    }, {
                        text: 'COM7',
                        value: 'COM7',
                    }, {
                        text: 'COM8',
                        value: 'COM8',
                    }, {
                        text: 'COM9',
                        value: 'COM9',
                    }]
            });
            this.select = new selectBox_1.SelectBox({
                container: select,
                tabIndex: true,
                tabIndexKey: 32,
                select: {
                    multi: false,
                    callback: function (index) {
                        if (index === 0) {
                            unLineDisabled();
                        }
                        else if (index === 1) {
                            lineDisabled();
                        }
                    }
                },
                data: [{
                        text: '网线',
                        value: 'unLine'
                    }, {
                        text: '串口',
                        value: 'line'
                    }],
            });
            this.baud = new selectInput_1.SelectInput({
                container: baud,
                clickType: 0,
                readonly: true,
                tabIndex: true,
                data: [{
                        text: '2400',
                        value: '2400',
                    }, {
                        text: '4800',
                        value: '4800',
                    }, {
                        text: '9600',
                        value: '9600',
                    }, {
                        text: '19200',
                        value: '19200',
                    }, {
                        text: '38400',
                        value: '38400',
                    }, {
                        text: '57600',
                        value: '57600',
                    }, {
                        text: '115200',
                        value: '115200',
                    }]
            });
            this.ip = new text_1.TextInput({
                container: ip,
            });
            this.port = new text_1.TextInput({
                container: port,
            });
            this.aerial = new numInput_1.NumInput({
                container: aerial,
                max: 9999,
                min: 1,
                tabIndex: true,
                defaultNum: 5,
            });
            this.buzz = new checkBox_1.CheckBox({
                container: buzz,
                tabIndex: true,
                tabIndexKey: 32,
                text: '蜂鸣器'
            });
            this.led = new checkBox_1.CheckBox({
                container: led,
                tabIndex: true,
                tabIndexKey: 32,
                text: 'LED灯'
            });
            var back = function (result, msg) {
                if (result.data) {
                    msg = result.msg + '：' + result.data[0];
                }
                content.appendChild(d.create("<div class=\"r\">" + msg + "</div>"));
                content.scrollTop = 100000;
            };
            this.reset = new Button_1.Button({
                container: reset,
                content: '复位',
                tabIndex: true,
                size: 'small',
                tabIndexKey: 32,
                onClick: function () {
                    var conf = _this.getRfidPreConf(), isFirst = true;
                    Shell.rfid.config(conf.str, conf.num, {
                        power: _this.aerial.get(),
                        buzzer: _this.buzz.get() === 1,
                        led: _this.led.get() === 1
                    }, function (result) {
                        back(result, result.success ? '天线功率、蜂鸣器和led配置成功' : '天线功率、蜂鸣器和led配置失败');
                        if (isFirst) {
                            isFirst = false;
                            Shell.rfid.reset(conf.str, conf.num, function (result) {
                                back(result, result.success ? '重启读写器成功' : '重启读写器失败');
                            });
                        }
                    });
                }
            });
            this.test = new Button_1.Button({
                container: test,
                content: '开始测试',
                size: 'small',
                onClick: function () {
                    end.classList.remove('disabled');
                    test.classList.add('disabled');
                    content.innerHTML = null;
                    var conf = _this.getRfidPreConf();
                    Shell.rfid.start(conf.str, conf.num, function (result) {
                        back(result, result.success ? 'rfid开启成功' : 'rfid开启失败');
                    });
                }
            });
            this.end = new Button_1.Button({
                container: end,
                content: '结束测试',
                size: 'small',
                tabIndex: true,
                tabIndexKey: 32,
                onClick: function () {
                    test.classList.remove('disabled');
                    end.classList.add('disabled');
                    content.innerHTML = '';
                    Shell.rfid.stop(function (result) {
                        content.innerHTML = result && result.msg;
                    });
                }
            });
            end.classList.add('disabled');
            this.select.set([rfidConf.line]);
            this.ip.set(rfidConf.ip);
            this.port.set(rfidConf.port);
            this.com.set(rfidConf.com);
            this.baud.set(rfidConf.baud);
            this.aerial.set(rfidConf.aerial);
            this.buzz.set(rfidConf.buzz);
            this.led.set(rfidConf.led);
            ipInput = q('.rfid-ip input');
            portInput = q('.rfid-port input');
            if (rfidConf.line === 0) {
                unLineDisabled();
            }
            else {
                lineDisabled();
            }
            return this._rfidTpl;
        };
        LoginPage.prototype.getRfidPreConf = function () {
            var line = this.select.get()[0], str = this.ip.get(), num = this.port.get(), power = this.aerial.get(), buzzer = this.buzz.get() === 1, led = this.led.get() === 1;
            if (line === 1) {
                str = this.com.get();
                num = this.baud.get();
            }
            num = parseInt(num);
            return { str: str, num: num, power: power, buzzer: buzzer, led: led };
        };
        LoginPage.prototype.printTpl = function () {
            var _this = this;
            this._printTpl = d.create("<div class=\"print-conf\">\n            <div class=\"conf-row\">\n                <div class=\"text\">\u670D\u52A1\u5668(S)</div>\n                <div class=\"print-server\"></div>\n            </div>\n        \n             <div class=\"conf-row\">\n                <div class=\"print-btn\"></div>\n                <div class=\"print-server-text\"></div>\n                <div class=\"print-msg\" data-status=\"2\">\u672A\u6D4B\u8BD5</div>\n            </div>\n             <div class=\"conf-row\">\n                <div class=\"text\">\u6A21\u5F0F(M)</div>\n                <div class=\"print-scenes\"></div>\n            </div>\n            <div class=\"conf-row\">\n                <div class=\"text\">\u6253\u5370\u673A(P)</div>\n                <div class=\"print-printer\"></div>\n            </div>\n            <div class=\"conf-row\">\n                <div class=\"text\">\u56FA\u5B9A\u884C\u6570(F)</div>\n                <div class=\"print-row\"></div>\n            </div>\n            <div class=\"conf-row\">\n                <div class=\"print-check\"></div>\n            </div>\n            <div class=\"conf-row\">\n                <div class=\"text\">\u6536\u94F6\u5907\u6CE8(N)</div>\n                <div class=\"print-text\"></div>      \n            </div>\n            <div class=\"conf-row\">\n                <div class=\"print-boot\"></div>\n                <div class=\"print-showdown\"></div>\n            </div> \n        </div>");
            var q = function (name) {
                return d.query(name, _this._printTpl);
            };
            var server = q('.print-server'), serverText = q('.print-server-text'), printer = q('.print-printer'), scenes = q('.print-scenes'), row = q('.print-row'), text = q('.print-text'), btn = q('.print-btn'), check = q('.print-check'), boot = q('.print-boot'), showdown = q('.print-showdown'), msgDom = q('.print-msg');
            var conf = com_1.Com.local.getItem('printerConf');
            this.sever = new selectInput_1.SelectInput({
                container: server,
                clickType: 0,
                tabIndex: true,
                readonly: true,
                useInputVal: false,
                data: [{
                        text: '三福开发环境',
                        value: 'https://bwd.sanfu.com/',
                    }, {
                        text: '三福测试环境',
                        value: 'https://bwt.sanfu.com/',
                    }],
                onSet: function (data) {
                    _this.serverText.set(data.value);
                    _this.checkLink();
                }
            });
            this.serverText = new text_1.TextInput({
                container: serverText
            });
            d.on(d.query('input', serverText), 'input', function () {
                msgDom.dataset.status = '3';
            });
            this.btn = new Button_1.Button({
                container: btn,
                content: '测试连接(T)',
                size: 'small',
                type: 'primary',
                className: 'link-test',
                onClick: function () {
                    _this.checkLink();
                }
            });
            this.scenes = new selectInput_1.SelectInput({
                container: scenes,
                clickType: 0,
                tabIndex: true,
                readonly: true,
                useInputVal: false,
                data: [{
                        text: '收银模式',
                        value: 'cashier',
                    }, {
                        text: '练习模式',
                        value: 'practice',
                    }]
            });
            this.row = new numInput_1.NumInput({
                container: row,
                defaultNum: 10,
                tabIndex: true,
                min: 0,
                max: 100,
            });
            this.text = new text_1.TextInput({
                container: text,
            });
            this.doubleCoupon = new checkBox_1.CheckBox({
                container: check,
                tabIndex: true,
                tabIndexKey: 32,
                text: '为促销多打印一份收银条(D)'
            });
            this.boot = new checkBox_1.CheckBox({
                container: boot,
                tabIndex: true,
                tabIndexKey: 32,
                text: '自动启动(B)',
            });
            this.showDown = new checkBox_1.CheckBox({
                container: showdown,
                tabIndex: true,
                tabIndexKey: 32,
                text: '自动关机(O)',
            });
            var result = C.Shell.printer.get(), printData = [];
            result && result.data && result.data.driveList && result.data.driveList.forEach(function (d) {
                printData.push({
                    text: d.driveName,
                    value: d.driveCode,
                });
            });
            this.print = new selectInput_1.SelectInput({
                container: printer,
                readonly: true,
                tabIndex: true,
                useInputVal: false,
                clickType: 0,
                data: printData
            });
            var str = window.localStorage.getItem('server');
            if (!str) {
                window.localStorage.setItem('server', 'https://bwd.sanfu.com/');
            }
            var serverUrl = window.localStorage.getItem('serverUrl');
            this.text.set(conf.text);
            this.doubleCoupon.set(conf.check);
            this.serverText.set(serverUrl);
            this.row.set(conf.row);
            this.scenes.set(conf.scenes);
            this.sever.set(serverUrl); // 需要在scenes.set之后执行
            printData[0] && this.print.set(conf.printer);
            this.boot.set(conf.boot);
            this.showDown.set(conf.shutDown);
            return this._printTpl;
        };
        LoginPage.prototype.checkLink = function () {
            var msgDom = d.query('.print-msg', this._printTpl), url = this.serverText.get() + 'cashier', scenes = this.scenes.get();
            msgDom.innerHTML = '测试中...';
            C.Ajax.fetch(url + com_1.Com.url.config + '?setmode=' + scenes, {
                dataType: 'json',
            }).then(function (_a) {
                var response = _a.response;
                if (response && response.dataArr) {
                    msgDom.innerHTML = '连接成功！';
                    msgDom.dataset.status = '0';
                }
            }).catch(function (e) {
                // console.log(e);
                msgDom.dataset.status = '1';
                msgDom.innerHTML = '连接失败！';
            });
        };
        LoginPage.prototype.wrapperInit = function () {
            this.tpl = d.create("<div id=\"login\">\n            <div class=\"main-login\">\n                <div class=\"center-title\">\n                    <img src=\"img/logo.png\" data-action=\"selectServer\">\n                        <span>\u901F\u72EE\u6536\u94F6\u53F0</span>\n                </div>\n                <div class=\"center-log\">\u6B63\u5728\u7B49\u5F85\u6536\u94F6\u5458\u4E0A\u5C97</div>\n                <div class=\"info\">\n                    <div class=\"status status_browser js_status normal\" id=\"wx_default_tip\">\n                        <p>\u8BBE\u5907\u51C6\u5907\u5C31\u7EEA\uFF0C\u6B63\u5728\u7B49\u5F85\u6307\u7EB9\u5F55\u5165</p>\n                        <!--<a href=\"javascript:location.reload(true)\"> \u5237\u65B0</a>-->\n                    </div>\n                </div>\n            </div>\n            <div class=\"msg-login\"></div>\n        </div>");
            this.tip = d.query('.status p', this.tpl);
            return this.tpl;
        };
        Object.defineProperty(LoginPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = '登录';
            },
            enumerable: true,
            configurable: true
        });
        return LoginPage;
    }(SPAPage));
    exports.LoginPage = LoginPage;
});

define("RegPage", ["require", "exports", "Modal", "Com", "Loading", "SelectInput", "SqlLiteRequest"], function (require, exports, Modal_1, com_1, loading_1, selectInput_1, CashierRequest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="RegPage"/>
    var Shell = C.Shell;
    var d = C.d;
    var SPAPage = C.SPAPage;
    var Ajax = C.Ajax;
    var RegPage = /** @class */ (function (_super) {
        __extends(RegPage, _super);
        function RegPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RegPage.prototype.init = function (para, data) {
        };
        Object.defineProperty(RegPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = '注册';
            },
            enumerable: true,
            configurable: true
        });
        RegPage.prototype.show = function () {
            this.tpl.classList.remove('hide');
        };
        RegPage.prototype.hide = function () {
            this.tpl.classList.add('hide');
        };
        // private deviceCheck(msg?){
        //     this.wrapper.classList.add('disabled');
        //     new Modal({
        //         header : {
        //           title : '提示'
        //         },
        //         body : d.create(`<div class="font-size-16">${msg ? msg : '设备审核中'}</div>`),
        //         isBackground : false
        //     });
        //     let inputs = d.queryAll('.msg-device .input-row [type="text"]', this.wrapper);
        //     inputs.forEach(input => {
        //         input.setAttribute('readonly', '');
        //     })
        // }
        RegPage.prototype.wrapperInit = function () {
            var _this = this;
            var device = Shell.base.device, data = device && device.data;
            this.tpl = d.create("<div class=\"content\">\n            <div class=\"reg-head\">\n                <h2 class=\"reg-title\">\u6CE8\u518C\u8BBE\u5907</h2>\n            </div>\n            <div class=\"reg-content\">\n                <div class=\"msg-tip\">\n                    <h5>\u8F93\u5165\u624B\u673A\u53F7\u7801\u5B8C\u6210\u6CE8\u518C\uFF0C\u8BF7\u786E\u4FDD\u624B\u673A\u53F7\u7801\u6B63\u786E\uFF0C\u65B9\u4FBF\u6211\u4EEC\u6709\u95EE\u9898\u4E0E\u60A8\u8054\u7CFB</h5>\n                </div>\n                <form class=\"msg-device\" style=\"color: #777\" >\n                    <div class=\"input-row\">\n                        <label>\u5E97\u53F7</label>\n                        <input type=\"text\" data-name=\"sho_id\" placeholder=\"\u8BF7\u8F93\u5165\u5E97\u53F7\" maxlength=\"4\">\n                    </div>\n                    <div class=\"input-row\">\n                        <label>\u6B3E\u53F0\u53F7</label>\n                        <div data-name=\"mac_id\"></div>\n                    </div>\n                      <div class=\"input-row\">\n                        <label>\u7535\u8BDD\u53F7\u7801</label>\n                        <input type=\"text\" data-name=\"mobile\" placeholder=\"\u8BF7\u8F93\u5165\u8054\u7CFB\u4EBA\u7535\u8BDD\u53F7\u7801\" maxlength=\"11\">\n                    </div>\n                    <div class=\"input-row\">\n                        <label>CPU</label>\n                        <input value=\"" + (data && data.cpu) + "\" type=\"text\" data-name=\"cpuserialno\" readonly>\n                    </div>\n                    <div class=\"input-row\">\n                        <label>\u7F51\u5361</label>\n                        <input value=\"" + (data && data.uuid) + "\" type=\"text\" data-name=\"adapteraddress\" readonly>\n                    </div>\n                    <div class=\"input-row\">\n                        <label>\u786C\u76D8</label>\n                        <input value=\"" + (data && data.disk) + "\" type=\"text\" data-name=\"diskserialno\" readonly>\n                    </div>\n                </form>\n                <div class=\"reg-btn\">\n                    <button id=\"saveReg\">\u6CE8\u518C</button>\n                </div>\n            </div>\n        </div>");
            var btn = d.query('#saveReg', this.tpl), inputs = d.queryAll('input[data-name]', this.tpl), macEl = d.query('[data-name="mac_id"]', this.tpl), sho_id, mac_id, mobile, macData = [], mac;
            CashierRequest_1.CashierRequest({
                dataAddr: com_1.Com.url.macList,
            }).then(function (_a) {
                var response = _a.response;
                console.log(response);
                var data = response && response.req && response.req.dataList || [];
                data.forEach(function (obj) {
                    macData.push({
                        text: obj[0],
                        value: obj[0],
                    });
                });
                mac = new selectInput_1.SelectInput({
                    container: macEl,
                    clickType: 0,
                    readonly: true,
                    tabIndex: true,
                    data: macData
                });
            });
            var isOne = true;
            d.on(btn, 'click', function () {
                var p = {};
                inputs.forEach(function (i) {
                    var name = i.dataset.name;
                    switch (name) {
                        case 'sho_id':
                            sho_id = i.value;
                            break;
                        case 'mobile':
                            mobile = i.value;
                            break;
                    }
                    p[name] = i.value;
                });
                mac_id = mac.getText();
                p['mac_id'] = mac_id;
                if (!isOne) {
                    return;
                }
                else {
                    isOne = false;
                }
                if (!sho_id) {
                    var m = Modal_1.Modal.alert('店号不能为空');
                    m.onClose = function () {
                        isOne = true;
                    };
                    return;
                }
                if (!mac_id) {
                    var m = Modal_1.Modal.alert('款台号不能为空');
                    m.onClose = function () {
                        isOne = true;
                    };
                    return;
                }
                if (!mobile) {
                    var m = Modal_1.Modal.alert('电话号码不能为空');
                    m.onClose = function () {
                        isOne = true;
                    };
                    return;
                }
                if (!_this.spinner) {
                    _this.spinner = new loading_1.Loading({});
                }
                else {
                    _this.spinner.show();
                }
                Ajax.fetch(com_1.Com.urlSite + com_1.Com.url.register, {
                    type: 'get',
                    dataType: 'json',
                    headers: {
                        uuid: com_1.Com.geTuuid()
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    data: p
                }).then(function (_a) {
                    var response = _a.response;
                    _this.spinner.hide();
                    var data = response && response.data, type = data && data.type, showText = data && data.showText;
                    switch (type) {
                        case '1':
                            var m = Modal_1.Modal.alert(showText);
                            m.onClose = function () {
                                isOne = true;
                            };
                            return;
                    }
                    if (data === '2') {
                        Modal_1.Modal.alert('注册失败,请联系IT人员处理');
                    }
                    else if (data === '1') {
                        Modal_1.Modal.alert(response && response.msg);
                    }
                    else if (data === '0') {
                        Modal_1.Modal.alert('注册成功', '提示', function () {
                            com_1.Com.scene();
                        });
                    }
                    isOne = true;
                }).catch(function (e) {
                    Modal_1.Modal.alert('请求超时或后台出错');
                    _this.spinner.hide();
                    isOne = true;
                });
            });
            return this.tpl;
        };
        ;
        return RegPage;
    }(SPAPage));
    exports.RegPage = RegPage;
});

define("SqlLiteRequest", ["require", "exports", "BaseShellImpl", "Com", "Modal"], function (require, exports, BaseShellImpl_1, com_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<reference path="../com.ts"/>
    /// <amd-module name="SqlLiteRequest"/>
    var Ajax = C.Ajax;
    var tools = C.tools;
    function CashierRequest(dataAddr, error) {
        var ajaxUrl = '', setting, addr = Object.assign({}, dataAddr), method = addr.method, data = addr.data;
        var timeOut = 300000;
        if (dataAddr && (dataAddr.type === 'wxpay')) {
            timeOut = 1200000;
        }
        var ajaxData = null;
        if (!method) {
            method = 'GET';
        }
        if (method === 'GET') {
            ajaxUrl = com_1.Com.reqAddr(addr, data);
        }
        else if (dataAddr.notVarList) {
            // 无需匹配varList
            ajaxData = data;
            ajaxUrl = com_1.Com.addParam(dataAddr).dataAddr;
        }
        else {
            if (data && !Array.isArray(data)) {
                data = [data];
            }
            var addrFull = data ? com_1.Com.reqAddrFull(addr, data) : com_1.Com.reqAddrFull(addr);
            ajaxUrl = addrFull.addr;
            ajaxData = addrFull.data;
            !setting && (setting = {});
        }
        com_1.Com.loading();
        return new Promise((function (resolve, reject) {
            (function () {
                if (window.navigator.onLine) {
                    return Ajax.fetch(com_1.Com.urlSite + ajaxUrl, {
                        type: method,
                        timeout: timeOut,
                        dataType: 'json',
                        headers: {
                            uuid: CA.Config.isProduct ? com_1.Com.geTuuid() : '8C-16-45-1C-AC-15'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        data: ajaxData
                    });
                }
                else {
                    return SqlLiteRequest.fetch(addr, setting);
                }
            })().then(function (_a) {
                var response = _a.response, statusText = _a.statusText, xhr = _a.xhr;
                com_1.Com.loading(false);
                response = restartData(response);
                if (tools.isNotEmpty(response.errorCode) && response.errorCode !== 0) {
                    com_1.Com.keyFlag = true;
                    Modal_1.Modal.alert(response && response.msg);
                    reject({ response: response, statusText: statusText, xhr: xhr });
                }
                else {
                    resolve({ response: response, statusText: statusText, xhr: xhr });
                }
            }).catch(function (_a) {
                var response = _a.response, statusText = _a.statusText, xhr = _a.xhr;
                com_1.Com.loading(false);
                com_1.Com.keyFlag = true;
                if (statusText === 'timeout') {
                    Modal_1.Modal.alert('请求超时');
                }
                else {
                    Modal_1.Modal.alert(response);
                }
                reject({ response: response, statusText: statusText, xhr: xhr });
            });
        }));
    }
    exports.CashierRequest = CashierRequest;
    var SqlLiteRequest = /** @class */ (function () {
        function SqlLiteRequest() {
        }
        SqlLiteRequest.prototype.get = function (addr) {
            // 根据itemId查找sql或json
            var sceneVersion = com_1.Com.sceneVersion, data, json, type = addr.type;
            // console.log(sceneVersion);
            if (type === 'panel') {
                data = sceneVersion.panel;
            }
            else if (type === 'item') {
                data = sceneVersion.item;
                // }if(sceneVersion.scene in addr.dataAddr){
            }
            if (addr.dataAddr.indexOf(sceneVersion.scene) > -1) {
                json = sceneVersion.json;
            }
            if (data) {
                try {
                    data.forEach(function (obj) {
                        if (obj[0].split(',')[0] === addr.objId) {
                            json = obj[2];
                            throw 'break';
                        }
                    });
                }
                catch (e) {
                    if (e !== 'break') {
                        throw e;
                    }
                }
                if (type === 'item') {
                    json = new BaseShellImpl_1.BaseShellImpl().pcHandle('sqliteQuery', data);
                }
            }
            return JSON.parse(json);
        };
        SqlLiteRequest.prototype.fetch = function (addr, setting) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.request(addr, setting, function (result) {
                    resolve(result);
                }, function (result) {
                    reject(result);
                });
            });
        };
        SqlLiteRequest.prototype.request = function (addr, setting, success, error) {
            var data = this.get(addr);
            // TODO 数据处理
            // SqlLiteRequest.errRes();
            success(SqlLiteRequest.sucRes(data));
        };
        SqlLiteRequest.errRes = function (xhr, statusText, errorThrown) {
            return { xhr: xhr, statusText: statusText, errorThrown: errorThrown };
        };
        SqlLiteRequest.sucRes = function (response, statusText, xhr) {
            return { response: response, statusText: statusText, xhr: xhr };
        };
        SqlLiteRequest.fetch = function (addr, setting) {
            return new SqlLiteRequest().fetch(addr, setting);
        };
        return SqlLiteRequest;
    }());
    function restartData(response) {
        if (!response)
            return;
        var dataList = [], meta = [], newData = [];
        if (response.data && response.data.dataList && response.data.dataList[0]) {
            var data = response.data;
            dataList = data.dataList;
            meta = Array.isArray(data.meta) ? data.meta : [];
        }
        dataList.forEach(function (datas, keyIndex) {
            newData.push({});
            meta.forEach(function (key, dataIndex) {
                newData[keyIndex][key] = datas[dataIndex];
            });
        });
        response.req = response.data;
        response.data = newData;
        response.meta = meta;
        return response;
    }
});

var CA;
(function (CA) {
    CA.Config = {
        isDebug: true,
        // isProduct: true,
        isProduct: false,
    };
})(CA || (CA = {}));

define("Com", ["require", "exports", "SqlLiteRequest", "Print"], function (require, exports, CashierRequest_1, Print_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = C.tools;
    var Rule = C.Rule;
    var Shell = C.Shell;
    var SPA = C.SPA;
    var d = C.d;
    /**
     * 全局变量，全局函数方法
     */
    var Com = /** @class */ (function () {
        function Com() {
        }
        Com.resetCom = function (isClear) {
            if (isClear === void 0) { isClear = true; }
            Com.itemList = {};
            Com.keyModal = [];
            Com.data = [];
            Com.mainAddr = null;
            Com.isClose = false;
            Com.mainItemList = null;
            Com.countItemList = null;
            Com.modalMainItemList = null;
            Com.tipEl = null;
            Com.loadingEl = null;
            Com.sceneVersion = null;
            Com.keyFlag = true;
            Com.status = 0;
            Com.clearItem = {};
            Com.config = null;
            Shell.rfid.stop(function () { });
            if (isClear) {
                Com.posClear(Com.url.posClear).then(function () {
                    SPA.open(SPA.hashCreate('index', 'login'));
                });
            }
            else {
                SPA.open(SPA.hashCreate('index', 'login'));
            }
        };
        Com.closeLastModalPanel = function () {
            var modal = Com.keyModal[Com.keyModal.length - 1];
            if (!modal) {
                return;
            }
            var src = window.location.href;
            var str = src.substr(src.indexOf('#') + 1, src.length);
            SPA.close(str);
        };
        /**
         * 开启指纹验证
         * @param msgDom  指纹信息提示的Dom
         * @param url
         * @param cb
         */
        Com.finger = function (msgDom, url, cb) {
            var device = Shell.base.device, devData = device && device.data;
            Shell.finger.get({
                type: 0,
                option: 0,
            }, function (ev) {
                msgDom.innerHTML = ev.msg;
                if (ev.success === true) {
                    var data = ev.data;
                    msgDom.innerHTML = '正在加载数据';
                    CashierRequest_1.CashierRequest({
                        dataAddr: url,
                        method: 'post',
                        addParam: 'cpuserialno=' + (devData && devData.cpu),
                        data: {
                            fingertype: data.fingerType,
                            fingerprint: data.fingerPrint,
                        },
                        notVarList: true
                    }).then(function (_a) {
                        var response = _a.response;
                        msgDom.innerHTML = response.msg;
                        var type = response.type;
                        if (type === '1') {
                            cb(response);
                        }
                        else {
                            Com.finger(msgDom, url, cb);
                        }
                    }).catch(function (e) {
                        Com.finger(msgDom, url, cb);
                    });
                }
            }, function (ev) {
                //指纹实时信息返回
                msgDom.innerHTML = ev.msg;
            });
        };
        /**
         * 全局变量规则
         * @param fieldName 变量名
         * @param value
         */
        Com.fieldRule = function (fieldName, value) {
            var rule = {};
            switch (fieldName) {
                case 'CURCUSID': // 时间戳判定
                    var val_1 = 0;
                    Com.config.forEach(function (obj) {
                        if (obj.cfgName === "TimeStampSeconds") {
                            val_1 = parseInt(obj.cfgValue);
                        }
                    });
                    var timestamp = Date.parse(new Date().toString()) / 1000, time = void 0;
                    var index = value.indexOf('_');
                    if (index > -1) {
                        time = value.slice(index + 1, value.length);
                    }
                    var isTimeOut = timestamp - parseInt(time) > val_1;
                    rule = {
                        isTimeOut: isTimeOut,
                        msg: '会员卡号已失效：10  ' + Com.timestamp(time * 1000)
                    };
            }
            return rule;
        };
        /**
         * 时间戳转日期
         * @param value
         * @returns {any}
         */
        Com.timestamp = function (value) {
            Date.prototype.Format = function (fmt) {
                var o = {
                    "M+": this.getMonth() + 1,
                    "d+": this.getDate(),
                    "h+": this.getHours(),
                    "m+": this.getMinutes(),
                    "s+": this.getSeconds(),
                    "q+": Math.floor((this.getMonth() + 3) / 3),
                    "S": this.getMilliseconds() //毫秒
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            };
            return new Date(value).Format("yyyy-MM-dd hh:mm:ss");
        };
        /**
         * 清空主界面数据
         */
        Com.empty = function () {
            for (var item in Com.clearItem) {
                var itemList = Com.clearItem[item];
                if (itemList) {
                    itemList.emptied();
                }
            }
        };
        /**
         * 全局变量状态位判断
         * @param status
         * @param cb
         */
        Com.statusJudge = function (status, cb) {
            // 从1->0清空,置0
            if (status === 0 && Com.status === 1) {
                Com.status = 0;
                Com.empty();
                Com.posClear().then(function () {
                    cb && cb();
                });
            }
            else if (status === 1 && Com.status === 0) {
                // 从0->1，置1
                Com.status = 1;
                cb && cb();
            }
            else {
                cb && cb();
            }
        };
        Com.posClear = function (url) {
            return CashierRequest_1.CashierRequest({
                dataAddr: url ? url : Com.url.reset
            });
        };
        /**
         * 1.计算金额 2.字符串连接 3.条件判断
         * @param dataRules
         * @param content
         * @param panelId  父节点id
         */
        Com.count = function (dataRules, panelId, content) {
            dataRules && dataRules.forEach(function (obj) {
                var fieldRule = obj.fieldRule.replace(')', '').split('('), itemList = Com.itemList[panelId], toItemList = Com.itemList[obj.toPanelId], res = Com.data[panelId], when = obj.when, data = [], changeItems, // 数据变动的item
                whenData = [], pass = true, upType = obj.upType, ruleType = obj.ruleType, resData = {}, sum = 0, items;
                if (res && res.inputs) {
                    res.inputs.forEach(function (r) {
                        resData[r.fieldName] = content;
                    });
                }
                if (upType === 1) {
                    items = itemList;
                    changeItems = toItemList;
                }
                else if (upType === 2) {
                    items = toItemList;
                    changeItems = itemList;
                }
                else if (upType === 0) {
                    return;
                }
                if (!itemList || !toItemList) {
                    return;
                }
                // debugger;
                Object.keys(items).forEach(function (key) {
                    var item = items[key], getData = item.getData();
                    getData && getData.forEach(function (p) {
                        // 浅拷贝、对象属性的合并
                        var newObj = Object.assign(resData, p);
                        // 添加（解析模版 模板中的{{xxx}} 对应 data中的属性名xxx）
                        data.push(tools.str.parseTpl(fieldRule[1] ? fieldRule[1] : fieldRule[0], newObj));
                        when && (whenData.push(tools.str.parseTpl(when, newObj)));
                    });
                    // 后台条件判断
                    whenData.forEach(function (w) {
                        if (!eval(w)) {
                            pass = false;
                        }
                    });
                    if (!pass) {
                        return;
                    }
                    if (ruleType === 1) {
                        //值计算
                        data.forEach(function (d) {
                            if (tools.isEmpty(d)) {
                                return;
                            }
                            d = d.replace('--', '-').replace('¥', ''); // 减去一个负值会出现 -- 情况
                            if (fieldRule[0] === 'sum') {
                                sum += tools.calc(d);
                            }
                            else {
                                sum = tools.calc(d);
                            }
                        });
                    }
                    else if (ruleType === 2) {
                        sum = '';
                        data.forEach(function (d) {
                            sum += d;
                        });
                    }
                    var fieldName = obj.fieldName;
                    Object.keys(changeItems).forEach(function (o) {
                        (changeItems[o]).resetData(fieldName, sum);
                    });
                });
            });
        };
        /**
         * 多个请求同时触发，在最后一个请求完成时调用done
         * @param arr
         * @param cb
         * @param done
         */
        Com.multiAsync = function (arr, cb, done) {
            var len = arr.length, count = 0;
            arr.forEach(function (obj) {
                cb(obj, function () {
                    count++;
                    if (len === count) {
                        done();
                    }
                });
            });
        };
        Com.reqAddrFull = function (addr, data) {
            return Rule.reqAddrFull(Com.addParam(addr), data);
        };
        Com.reqAddr = function (addr, data) {
            return Rule.reqAddr(Com.addParam(addr), data);
        };
        Com.addParam = function (addr) {
            var dataAddr = Object.assign({}, addr);
            if (dataAddr.addParam) {
                if (typeof dataAddr.addParam === 'string') {
                    dataAddr.dataAddr = dataAddr.dataAddr + (dataAddr.dataAddr.indexOf('?') > -1 ? '&' : '?') + dataAddr.addParam;
                }
            }
            return dataAddr;
        };
        Com.scene = function () {
            return CashierRequest_1.CashierRequest({
                dataAddr: Com.url.index
            }).then(function (_a) {
                var response = _a.response;
                Com.mainAddr = response && response.elements && response.elements[0].mainAddr;
                if (response && response.elements && response.elements[0].loginAddr) {
                    SPA.open(SPA.hashCreate('index', 'login'));
                }
                else {
                    //主界面
                    SPA.open(SPA.hashCreate('main', ''));
                }
            });
        };
        Com.logTip = function (str, isRead, isOverLay) {
            if (isRead === void 0) { isRead = false; }
            if (isOverLay === void 0) { isOverLay = false; }
            var modalTip = d.query('.modal-short-tip');
            if (modalTip) {
                if (!isOverLay) {
                    modalTip.innerHTML = '';
                }
                var dom = d.create("<div class=\"padding-2-7\">" + str + "</div>");
                modalTip.appendChild(dom);
                return;
            }
            if (!Com.tipEl) {
                Com.tipEl = d.query('.reminder-msg', document);
            }
            if (!Com.tipEl) {
                return;
            }
            Com.tipEl.innerHTML = str;
            if (isRead) {
                Com.tipEl.classList.add('color-red');
            }
            else {
                Com.tipEl.classList.remove('color-red');
            }
        };
        Com.focusHandle = function () {
            var modal = Com.keyModal[Com.keyModal.length - 1];
            if (modal) {
                if (modal.itemList && modal.itemList.wrapper) {
                    modal.itemList.wrapper.focus();
                }
                else {
                    modal.wrapper.focus();
                }
            }
        };
        Com.printReceipt = function (printAddr) {
            if (printAddr) {
                CashierRequest_1.CashierRequest(printAddr).then(function (_a) {
                    var response = _a.response;
                    // console.log(response);
                    var printData = response.req, count = Com.countItemList.getData()[0];
                    // printData.footer= printData.footer.concat(count);
                    Print_1.cashReceiptPrint({
                        data: printData,
                    });
                    Com.posClear();
                });
            }
            else {
                Com.posClear();
            }
        };
        Com.geTuuid = function () {
            var device = Shell.base.device, data = device && device.data;
            return data && data.uuid;
        };
        Com.loading = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            if (!Com.loadingEl) {
                Com.loadingEl = d.query('.log-loading');
            }
            if (!Com.loadingEl) {
                return;
            }
            d.classToggle(Com.loadingEl, 'loading', isShow);
        };
        /**
         * 通过计算输入的长度和时间戳判断扫码枪or键盘输入
         * @param timer 开始时间
         * @param scanGunValue 值
         * @returns {string} 1.扫码枪 2.键盘输入
         */
        Com.checkScan = function (timer, scanGunValue) {
            var time = Date.now() - timer, len = scanGunValue.length, type = Com.KEYBOARD;
            if (len && len > 5 && time / len < 10) { // 扫码枪
                type = Com.SCAN;
            }
            // console.log(time/len,scanGunValue, type)
            return type;
        };
        Com.SCAN = '1';
        Com.KEYBOARD = '2';
        Com.KEYSELECT = '3';
        Com.RFID = '5';
        Com.url = {
            registered: '/pos/posregistered',
            register: '/pos/posregister',
            index: '/index?output=json',
            config: '/pos/config/cashier',
            login: '/pos/poslogin/s0',
            page: '/pos/page/cashier/{sceneId}',
            printer: '/pos/posprint/s0/s0_p1',
            posClear: '/pos/pclear',
            reset: '/pos/posclear',
            macList: '/pos/posconfig/mac_list' // mac_id列表地址
        };
        Com.itemList = {}; // 表格
        Com.keyModal = [];
        Com.data = []; // 表格数据
        Com.isClose = false; // 是否关闭上一个模态框
        Com.keyFlag = true; // 处理按键多次触发,只有当前按键操作并加载完成后才可以执行下一次按键
        Com.status = 0;
        Com.clearItem = {}; // 需要清空数据的item
        Com.local = {
            setItem: function (name, data) {
                window.localStorage.setItem(name, JSON.stringify(data));
            },
            getItem: function (name) {
                var data = window.localStorage.getItem(name);
                return data && JSON.parse(data);
            }
        };
        return Com;
    }());
    exports.Com = Com;
});

define("EventAction", ["require", "exports", "Com", "SqlLiteRequest"], function (require, exports, com_1, CashierRequest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="EventAction"/>
    /// <reference path="module/keyModal/KeyModal.ts"/>
    var tools = C.tools;
    var d = C.d;
    var SPA = C.SPA;
    var Shell = C.Shell;
    /**
     * 按键操作控制台
     */
    var scanGunValue = '';
    var timer;
    /**
     * 主界面扫码
     * @param {ICashierPagePara} data
     * @param {KeyboardEvent} e
     */
    function mainKeyDownEvent(data, e) {
        if (scanGunValue === '') {
            timer = Date.now();
        }
        var code = e.keyCode || e.which || e.charCode;
        // A-Z,数字键盘0-9,小键盘0-9，字符-_
        if (((65 <= code && code <= 90) || (48 <= code && code <= 57) || (96 <= code && code <= 105)) || code === 189) {
            scanGunValue += e.key;
        }
        // 扫码录会员卡与商品
        if (code === 13) {
            var type_1 = com_1.Com.checkScan(timer, scanGunValue), index = scanGunValue.indexOf('_'), elements = data.elements || [];
            if (index > -1) { // 去掉'_'后面的字符串
                scanGunValue = scanGunValue.slice(0, index);
            }
            elements.forEach(function (elem) {
                if (elem.inputs) {
                    inputs(type_1, elem, scanGunValue);
                }
            });
            scanGunValue = '';
        }
    }
    exports.mainKeyDownEvent = mainKeyDownEvent;
    /**
     * 主界面按键F1-F6，esc，后台配置
     * @param {ICashierPagePara} data
     * @param {KeyboardEvent} e
     */
    function eventActionHandler(data, e) {
        var shortcuts = data.shortcuts || [];
        //取消的浏览器默认行为
        e.preventDefault();
        var keyCode = e.keyCode || e.which || e.charCode, altKey = e.altKey;
        if (altKey && keyCode === 115) { // alt+F4
            com_1.Com.resetCom();
        }
        else if (shortcuts) {
            if (com_1.Com.keyFlag) {
                com_1.Com.keyFlag = false;
            }
            else {
                return;
            }
            var hasKey_1 = false;
            shortcuts.forEach(function (s) {
                if (s.shortKey === e.key) {
                    hasKey_1 = true;
                    createPanel(s, null);
                }
            });
            if (!hasKey_1) {
                // 若没有匹配到按键
                com_1.Com.keyFlag = true;
            }
        }
        else {
            com_1.Com.keyFlag = true;
        }
    }
    exports.eventActionHandler = eventActionHandler;
    /**
     * 匹配input，执行按键操作
     * @param {string} type 输入类型1.扫码枪，2.按键输入，3.按键选择，5.rfid
     * @param {ICashierPanel} response
     * @param {string} value
     * @param {obj} nextField
     */
    function inputs(type, response, value, nextField) {
        var regInput = null, keyModal = com_1.Com.keyModal[com_1.Com.keyModal.length - 1], inputs = response.inputs, bill = keyModal && keyModal.bill, billContent = bill && bill.innerHTML; // 结账显示框
        // 匹配唯一的input
        var uiAddr, dataAddr, chkAddr, nextFieldParam = {}, param = {};
        if (!inputs) {
            com_1.Com.keyFlag = true;
            return;
        }
        var select = keyModal && keyModal.getSelect();
        if (select) {
            type = com_1.Com.KEYSELECT;
        }
        // 匹配input值
        inputs.forEach(function (i) {
            var inputType = i.inputType;
            if (regInput) {
                return;
            }
            if (inputType === type || tools.isEmpty(type)) {
                switch (inputType) {
                    case '1': // 扫描枪
                    case '2': // 键盘输入
                    case '5': // rfid输入
                        regInput = regExpMatch(i, value);
                        break;
                    case '3': // 键盘选中
                        value = select[i.fieldName];
                        regInput = i;
                        break;
                    case '4':
                        break;
                }
            }
        });
        if (!regInput) {
            com_1.Com.keyFlag = true;
            return;
        }
        // 带上F6窗口数据---写死
        if (com_1.Com.countItemList && com_1.Com.modalMainItemList) {
            var countData = com_1.Com.modalMainItemList.getData();
            param = countData && countData[0] || {};
        }
        // console.log(param);
        var input = Object.assign({}, regInput), inputType = input.inputType;
        if (input.inputId === 's0_i100h') { // 后台要求写死
            input.dataAddr.varList.push({
                varName: 'SELLERID'
            });
        }
        // 全局变量规则执行，判断会员卡是否超时。
        var rule = com_1.Com.fieldRule(input.fieldRule, value);
        if (rule.isTimeOut) {
            com_1.Com.logTip(rule.msg);
            return;
        }
        input.dataAddr && (dataAddr = input.dataAddr);
        input.uiAddr && (uiAddr = input.uiAddr);
        input.chkAddr && (chkAddr = input.chkAddr);
        var fieldName = input.fieldName;
        if (tools.isNotEmpty(value) && fieldName) {
            param[fieldName] = value;
        }
        // 结账，有billBox时
        if (bill) {
            // 提交，当输入值为空时
            var dAddr = dataAddr.dataAddr;
            if (tools.isEmpty(value) && input.dataAddr) {
                input.dataAddr.dataAddr = tools.url.addObj(dAddr, {
                    selection: tools.isNotEmpty(billContent) ? billContent : -1
                });
            }
        }
        if (response && response.uiTmpl === 'sale-bill') {
            if (chkAddr) {
                chkAddr.varList = [{
                        varName: fieldName
                    }];
            }
        }
        // chkAddr验证,当输入值不为空时
        if (chkAddr && tools.isNotEmpty(value)) {
            var cAddr = chkAddr.dataAddr;
            if (hasVarList(chkAddr, fieldName) && fieldName) {
                chkAddr.dataAddr = tools.url.addObj(cAddr, (_a = {},
                    _a[fieldName] = value,
                    _a));
            }
        }
        var outField = {};
        // 新面板的开启需要在padData规则执行完成之后在打开
        var padDone = function () {
            if (input.hintAddr) {
                CashierRequest_1.CashierRequest(input.hintAddr).then(function (_a) {
                    var response = _a.response;
                    var msg = response && response.req && response.req.dataList && response.req.dataList[0] && response.req.dataList[0][0];
                    msg && com_1.Com.logTip(msg);
                });
            }
            if (response.printAddr && inputType !== '1') { // 打印
                com_1.Com.printReceipt(response.printAddr);
            }
            var status = input.status;
            if (uiAddr) {
                var initUi_1 = function () {
                    if (keyModal) {
                        com_1.Com.isClose = true;
                    }
                    nextFieldParam = tools.obj.merge(nextFieldParam, param);
                    // nextField,outputField影响下个界面
                    var nextField = getNextField(input.nextFields, nextFieldParam);
                    createPanel(input, tools.obj.merge(param, nextField), tools.obj.merge(outField, nextField));
                };
                if (tools.isNotEmpty(status)) {
                    com_1.Com.statusJudge(input.status, function () {
                        initUi_1();
                    });
                }
                else {
                    initUi_1();
                }
            }
            else if (com_1.Com.keyModal[com_1.Com.keyModal.length - 1]) {
                if (tools.isNotEmpty(status)) {
                    com_1.Com.statusJudge(input.status, function () { });
                }
                com_1.Com.keyFlag = true;
                if (input.fieldName === "PCOUPONCODE" && com_1.Com.keyModal.length === 1) { // F6用完优惠券后不关闭F6框
                }
                else {
                    com_1.Com.closeLastModalPanel();
                }
                input.hint && com_1.Com.logTip(input.hint);
            }
            else {
                input.hint && com_1.Com.logTip(input.hint);
            }
        };
        param = tools.obj.merge(param, nextField);
        // response为dataAddr返回的数据
        check(input, param).then(function (response) {
            var itemData = response && response.data, fieldName = input.fieldName;
            // 除了复杂促销，field只会有一条数据，复杂促销不会有outputField
            outField = getOutPutField(input.outputField, itemData && itemData[0], value);
            param = tools.obj.merge(param, outField);
            nextFieldParam = itemData && itemData[0] || {};
            // 挂单
            var ftPadDatas = response && response.ftToPanel;
            if (ftPadDatas) {
                padData(ftPadDatas.padDatas, fieldName, param, padDone, response, value);
            }
            else {
                padData(input.padDatas, fieldName, param, padDone, response, value);
            }
        });
        var _a;
        // });
    }
    exports.inputs = inputs;
    function getOutPutField(outPutField, field, value) {
        // console.log(field, 'dataAddr返回的数据');
        // outputField在本界面(影响padData和ui)和下个界面生效
        var data = {};
        if (outPutField) {
            var arr = outPutField.split(',');
            arr.forEach(function (obj) {
                data[obj] = field ? field[obj] : value;
            });
        }
        return data;
    }
    function condition(response) {
        return new Promise(function (resolve, reject) {
            var condition = response && response.req, type = condition && condition.type, text = condition && condition.showText, modal = com_1.Com.keyModal[com_1.Com.keyModal.length - 1], isNext = false, isRepeat = false;
            // 无condition，直接进入下一步
            if (tools.isEmpty(type)) {
                isNext = true;
                resolve({ isNext: isNext, isRepeat: isRepeat });
                return;
            }
            com_1.Com.keyFlag = true;
            var msgDom = d.create("<div class=\"padding-30\">" + text + "</div>"), para = {
                body: msgDom,
                type: type,
                callback: function (e) {
                    var code = e.keyCode || e.which || e.charCode;
                    switch (type) {
                        case '0':
                        case '2':
                        case '13':
                            if (code === 13) {
                                com_1.Com.closeLastModalPanel();
                            }
                            break;
                        case '1':
                            if (code === 13) {
                                com_1.Com.isClose = true;
                                isRepeat = true;
                                resolve({ isNext: isNext, isRepeat: isRepeat });
                            }
                            break;
                        case '10':
                            if (code === 27) {
                                Shell.finger.cancel(function () { });
                            }
                            break;
                    }
                }
            };
            var box = modal && modal.inputBox, bill = modal && modal.bill;
            switch (type) {
                case '0':
                    com_1.Com.isClose = true;
                    initModal(para);
                    break;
                case '1':
                    com_1.Com.isClose = true;
                    initModal(para);
                    break;
                case '2':
                    initModal(para);
                    break;
                case '6': // 不创建ui
                    com_1.Com.printReceipt({
                        dataAddr: com_1.Com.url.printer,
                        type: 'GET',
                        varType: 0
                    });
                    com_1.Com.closeLastModalPanel();
                    setTimeout(function () {
                        com_1.Com.closeLastModalPanel();
                        initModal(para);
                    }, 1);
                    break;
                case '10':
                    var fingerTip = d.create("<div class=\"iconfont icon-zhiwen\"></div>");
                    d.append(msgDom, fingerTip);
                    com_1.Com.isClose = true;
                    initModal(para);
                    // 开启指纹
                    var url = com_1.Com.url.login + '';
                    if (condition.addparam) {
                        url = url + (url.indexOf('?') > -1 ? '&' : '?' + condition.addparam);
                    }
                    url = url + (url.indexOf('?') > -1 ? '&' : '?') + 'accounts=1';
                    com_1.Com.finger(fingerTip, url, function () {
                        isRepeat = true;
                        com_1.Com.closeLastModalPanel();
                        resolve({ isNext: isNext, isRepeat: isRepeat });
                    });
                    break;
                case '11':
                    com_1.Com.closeLastModalPanel();
                    com_1.Com.logTip(text);
                    isNext = true;
                    resolve({ isNext: isNext, isRepeat: isRepeat });
                    break;
                case '12': // 提示信息，清空输入框，
                    if (condition && condition.clearGlobal === 1) {
                        com_1.Com.printReceipt(condition.printAddr);
                    }
                    com_1.Com.logTip(text);
                    box && (box.innerHTML = '');
                    modal && (modal.isClear = true);
                    break;
                case '13': // 结账，生成提示框
                    if (bill) {
                        // 结账校验通过
                        var boxInner_1 = box.innerHTML, billInner = bill.innerHTML, isExist_1 = false, arr = billInner.split(',');
                        arr.forEach(function (obj) {
                            if (obj === boxInner_1) {
                                isExist_1 = true;
                            }
                        });
                        if (!isExist_1) {
                            if (bill.innerHTML) {
                                bill.innerHTML += ',';
                            }
                            bill.innerHTML += boxInner_1;
                        }
                        box.innerHTML = '';
                        modal && (modal.isClear = true);
                    }
                    initModal(para);
                    break;
                case '14': // 提示信息-》进入下一步
                    com_1.Com.logTip(text, false, true);
                    if (condition && condition.increase) { // 用优惠券后禁用掉f6的esc
                        var keyModal = com_1.Com.keyModal[0];
                        keyModal.disabledEsc = true;
                    }
                    isNext = true;
                    resolve({ isNext: isNext, isRepeat: isRepeat });
                    break;
            }
        });
    }
    /**
     * 创建面板
     * @param {IShortcutsPara} shortcut或者input
     * @param {obj} nextField 由上一级传下来的outputField和nextField
     * @param {obj} field 本界面请求参数
     */
    function createPanel(shortcut, field, nextField) {
        var cb = function (addParam, chkData) {
            // 若有addParam需要添加在url后
            var uiAddr = shortcut.uiAddr && Object.assign({}, shortcut.uiAddr);
            addParam && (uiAddr['addParam'] = addParam);
            // chkData为check返回的表格数据,返回的数据只有一条
            if (chkData && chkData[0]) {
                field = tools.obj.merge(field, chkData[0]);
            }
            if (uiAddr) {
                ajaxLoad(uiAddr, getMainTableData(shortcut, uiAddr.method, field))
                    .then(function (_a) {
                    var response = _a.response, shortcuts = _a.shortcuts, padDatas = _a.padDatas;
                    var openPage = function () {
                        shortcut && shortcut.hint && com_1.Com.logTip(shortcut.hint);
                        // 下岗
                        if (uiAddr.type === 'posloginout') {
                            com_1.Com.resetCom(false);
                        }
                        else {
                            condition(response).then(function (_a) {
                                var isNext = _a.isNext, isRepeat = _a.isRepeat;
                                if (isNext) {
                                    if (response) {
                                        initModal({
                                            data: response,
                                            shortcuts: shortcuts,
                                            nextField: field,
                                        });
                                    }
                                    else {
                                        com_1.Com.keyFlag = true;
                                        com_1.Com.closeLastModalPanel();
                                    }
                                }
                                else if (isRepeat) {
                                    var f = checkOutParam(response);
                                    cb(f.addParam, f.data);
                                }
                            });
                        }
                    };
                    // element同层的padDatas需要在执行所有操作之前先执行
                    if (padDatas && padDatas[0]) {
                        padData(padDatas, null, tools.obj.merge(field, nextField), function () {
                            openPage();
                        }, null, null);
                    }
                    else {
                        openPage();
                    }
                });
            }
            else {
                shortcut && shortcut.hint && com_1.Com.logTip(shortcut.hint);
                com_1.Com.keyFlag = true;
            }
        };
        if (!shortcut.inputId) {
            // F6
            if (shortcut.shortId === 's0_sh6') {
                shortcut.dataAddr.varList.push({
                    varName: 'DIS_NAME'
                }, {
                    varName: 'SELLERID'
                });
            }
            check(shortcut, field).then(function (response) {
                var f = checkOutParam(response);
                if (shortcut.padDatas) {
                    padData(shortcut.padDatas, '', null, function () {
                        cb(f.addParam, f.data);
                    }, response, '');
                }
                else {
                    cb(f.addParam, f.data);
                }
            });
        }
        else {
            cb(); // input已执行完成chkAddr-dataAddr，直接创建ui，无需check；
        }
    }
    /**
     * check返回参数重新构造
     * @param {obj} response
     * @returns {{addParam: string; data: obj[]}}
     */
    function checkOutParam(response) {
        var addParam = response && response.req && response.req.addparam, data = response && response.data;
        return { addParam: addParam, data: data };
    }
    /**
     * check校验chkAddr和dataAddr
     * @param {IShortcutsPara | IInputPara} s
     * @param field
     * @returns {Promise<IAjaxSuccess>}
     */
    function check(s, field) {
        var chkAddr = s.chkAddr, dataAddr = s.dataAddr, status = s.status;
        return new Promise((function (resolve) {
            if (chkAddr) {
                accessDataAddr(chkAddr, field, s).then(function () {
                    resolve();
                });
            }
            else {
                resolve();
            }
        })).then(function () {
            if (dataAddr) {
                return accessDataAddr(dataAddr, field, s).then(function (response) {
                    // console.log(response, 'data');
                    if (response.dataAddr) {
                        return CashierRequest_1.CashierRequest(response.dataAddr);
                    }
                    com_1.Com.statusJudge(status);
                    return response;
                });
            }
            else {
                com_1.Com.statusJudge(status);
            }
        });
    }
    /**
     * 判断varlist中是否有指定name的varName
     * @param dataAddr
     * @param name
     * @returns {boolean} true 不存在， false 存在
     */
    function hasVarList(dataAddr, name) {
        var tag = true;
        dataAddr.varList && dataAddr.varList.forEach(function (v) {
            if (v.varName === name) {
                tag = false;
            }
        });
        return tag;
    }
    function getMainTableData(s, method, field) {
        // 从panelId中取数据
        var panelId = s.panelId, mainData = null, panelItem;
        // 访问chkAddr前需取出panelId表格数据
        if (panelId) {
            panelItem = com_1.Com.itemList[panelId];
        }
        // 获取主表数据，这里只支持有一个itemList，F6表格
        if (panelItem) {
            for (var item in panelItem) {
                mainData = panelItem[item].getData()[0];
            }
        }
        // F1-4,F1-5, 复杂，挂单 复杂促销及挂单，写死,获取主表选中的数据
        if (['s0_i100d', 's0_i100e', 's0_i100i', 's0_i100h'].includes(s.inputId)) {
            mainData = tools.obj.merge(com_1.Com.mainItemList.getSelect(), mainData);
        }
        // console.log(mainData)
        var newData = [];
        // GET请求时候只传一条数据
        if (method === 'GET') {
            field = tools.obj.merge(mainData, field);
        }
        else {
            // 挂单操作
            mainData = com_1.Com.mainItemList.getData();
            mainData.forEach(function (obj) {
                newData.push(tools.obj.merge(obj, field));
            });
        }
        return newData[0] ? newData : field;
    }
    function accessDataAddr(addr, field, s) {
        var cb = function (addParam, chkData) {
            var dataAddr = Object.assign({}, addr);
            addParam && (dataAddr['addParam'] = addParam);
            // chkData为check返回的表格数据,返回的数据只有一条
            if (chkData && chkData[0]) {
                field = tools.obj.merge(field, chkData[0]);
            }
            // 访问dataAddr获取数据
            return ajaxLoad(dataAddr, getMainTableData(s, dataAddr && dataAddr.method, field))
                .then(function (_a) {
                var response = _a.response;
                // 若为chkAddr执行condition操作，否者next
                return condition(response).then(function (_a) {
                    var isNext = _a.isNext, isRepeat = _a.isRepeat;
                    if (isRepeat) {
                        // chk 返回的addParam需拼接在url后面
                        var f = checkOutParam(response);
                        return cb(f.addParam, f.data);
                    }
                    else if (isNext) {
                        return response;
                    }
                });
            });
        };
        return cb();
    }
    function keyField(res, itemList, cb) {
        var key = res && res.fieldName;
        var itemData = itemList.getData();
        var arr = [];
        res.data.forEach(function (r) {
            itemData.forEach(function (item, y) {
                if (r[key] === item[key]) {
                    arr.push({
                        index: y,
                        data: r,
                    });
                }
            });
        });
        arr.forEach(function (obj) {
            cb(obj.data, obj.index);
        });
    }
    function padData(padData, fieldName, param, cb, res, value) {
        var keyModal = com_1.Com.keyModal[com_1.Com.keyModal.length - 1];
        var pad = function (obj) {
            if (obj) {
                param = tools.obj.merge(param, obj);
            }
            var padDatas = function (index) {
                var p = padData && padData[index];
                if (!p) {
                    cb();
                    return;
                }
                var panelId = p.panelId, itemId = p.itemId, dataList = p.dataList, data = com_1.Com.data[panelId], tableList = data && data.tabeList || [];
                var ajaxData = keyModal && keyModal.getSelect();
                // 有itemId时只匹配并访问当前一个地址
                itemId && tableList.forEach(function (obj) {
                    if (obj.dataAddr.objId === itemId) {
                        tableList = [];
                        tableList.push(obj);
                    }
                });
                var request = function (n) {
                    var table = tableList[n], padType = p.padType;
                    n++;
                    if (!table) {
                        if (!panelId) {
                            tableDataModify(padType);
                        }
                        if (padType !== 11) {
                            var dataRules = data && data.dataRules, panelId_1 = data && data.panelId;
                            dataRules && com_1.Com.count(dataRules, panelId_1, value);
                        }
                        index++;
                        padDatas(index);
                        return;
                    }
                    var addr = table.dataAddr, itemId = table.itemId, itemList = com_1.Com.itemList[panelId][itemId], select = d.query('.tr-select', itemList.props.dom), num = select && select.dataset.index;
                    var tableOperate = function (tableData) {
                        // 复杂促销
                        var key = res && res.fieldName;
                        if (key && ([22, 24, 25].includes(padType))) {
                            keyField(res, itemList, function (d, index) {
                                if (padType === 22) {
                                    for (var name_1 in d) {
                                        if (name_1 !== key) {
                                            tableDataModify(padType, itemList, d, name_1, index, d, table);
                                        }
                                    }
                                }
                                else {
                                    tableDataModify(padType, itemList, d, fieldName, index, d, table, null, p.locFieldName);
                                }
                            });
                        }
                        else {
                            // padData有fieldName时候匹配padData的fieldName
                            if (p.fieldName) {
                                fieldName = p.fieldName.toUpperCase();
                            }
                            tableDataModify(padType, itemList, tableData, fieldName, num, param, table, value, p.locFieldName);
                        }
                        request(n);
                    };
                    // 刷新，添加数据时候先请求dataAddr获取表格数据
                    if (padType === 12 || padType === 13) {
                        param = tools.obj.merge(param, ajaxData);
                        var newData_1 = [];
                        if (padType === 12) {
                            // 如果是刷新数据，需取出原表格数据匹配varList,表格数据优先级低
                            var itemData = itemList.getData(), method = addr.method;
                            if (itemData && method === 'GET') {
                                param = tools.obj.merge(itemData[0], param);
                            }
                            else {
                                itemData[0] && itemData.forEach(function (obj) {
                                    newData_1.push(tools.obj.merge(obj, param));
                                });
                            }
                        }
                        addr['data'] = newData_1[0] ? newData_1 : param;
                        CashierRequest_1.CashierRequest(addr).then(function (_a) {
                            var response = _a.response;
                            tools.isNotEmpty(response.showText) && com_1.Com.logTip(response.showText);
                            tableOperate(response.data);
                        });
                    }
                    else {
                        tableOperate(dataList);
                    }
                };
                request(0);
            };
            padDatas(0);
        };
        var data = res && res.data;
        if (Array.isArray(data) && data[0]) {
            data.forEach(function (obj) {
                pad(obj);
            });
        }
        else {
            pad(data);
        }
    }
    /**
     * 表格操作
     * @param {number} padType 类型
     * @param {ItemList} itemList 要操作的表格
     * @param {obj[]} tableData 刷新，添加多条表格数据
     * @param {string} fieldName 要修改的字段名
     * @param num  要修改的第几行的数据
     * @param data 取数据的参数
     * @param {TableListPara} table 复杂促销时候要取table中的keyField
     * @param {string} inputValue  输入框的值
     * @param {string} locFieldName 要取的数据字段名
     */
    function tableDataModify(padType, itemList, tableData, fieldName, num, data, table, inputValue, locFieldName) {
        var selectData, locField = locFieldName ? locFieldName : fieldName;
        locField = locField && locField.toLocaleUpperCase();
        switch (padType) {
            case 9:
                com_1.Com.resetCom();
                break;
            case 10: // 清空主界面所有数据
                com_1.Com.empty();
                com_1.Com.posClear();
                break;
            case 11: // 清空
                itemList.emptied();
                break;
            case 12: // 刷新
                itemList.refresh(tableData);
                break;
            case 13: // 添加
                if (fieldName === 'EPC') {
                    var itemData_1 = itemList.getData(), barCode = '';
                    tableData.forEach(function (addData) {
                        var isExist = false;
                        itemData_1.forEach(function (item, n) {
                            if (addData.BARCODE && addData.BARCODE === item.BARCODE) {
                                isExist = true;
                                var epcCol = item.RFIDLIST, epcArr = epcCol.split(','), saleMount = item.SALEAMOUNT || '0', epcExist_1 = false;
                                epcArr.forEach(function (epc) {
                                    if (epc === inputValue) {
                                        epcExist_1 = true;
                                    }
                                });
                                if (epcExist_1) {
                                    return;
                                }
                                // 数量加1
                                itemList.resetData('SALEAMOUNT', eval(saleMount + '+1'), n);
                                itemList.resetData('RFIDLIST', epcCol + ',' + inputValue, n);
                            }
                        });
                        if (!isExist) {
                            addData.RFIDLIST = inputValue;
                            itemList.addByData([addData]);
                        }
                    });
                }
                else {
                    var keyField_1 = table.keyField, isExist_2 = false, n_1 = null;
                    if (keyField_1) {
                        var data_1 = itemList.getData();
                        tableData.forEach(function (d, m) {
                            data_1.forEach(function (obj, i) {
                                if (obj[keyField_1] === d[keyField_1]) {
                                    isExist_2 = true;
                                    n_1 = i;
                                }
                            });
                            if (isExist_2) {
                                itemList.select(n_1);
                                com_1.Com.logTip('已定位到当前商品数据');
                            }
                            else {
                                itemList.addByData(tableData[m]);
                            }
                            isExist_2 = false;
                        });
                    }
                    else {
                        itemList.addByData(tableData);
                    }
                }
                break;
            case 21: // 清空fieldName值
                itemList.resetData(fieldName, '', num);
                break;
            case 22: // 修改fieldName值
                itemList.resetData(fieldName, data[locField], num);
                break;
            case 23: // 修改fieldName值为负数
                selectData = itemList.getSelect();
                var resetField = '-' + selectData[locField];
                if (resetField.indexOf('--') > -1) {
                    resetField = resetField.substr(2, resetField.length);
                }
                itemList.resetData(fieldName, resetField, num);
                break;
            case 24: // 修改原fieldName全部行的值
                for (var item in data) {
                    itemList.resetData(item, data[item], num);
                }
                break;
            case 25: // 当前值为正则改为整数，为负则改为负数
                selectData = itemList.getSelect();
                var value = selectData[locField], preValue = data[locField];
                if (typeof value !== 'string') {
                    value = value.toString();
                }
                itemList.resetData(fieldName, (value && value.indexOf('-') > -1 ? '-' : '') + preValue, num);
                break;
            case 26: // 数值叠加
                var tData = itemList.getData(), tValue = tData[0] && tData[0][locField];
                itemList.resetData(fieldName, eval(data[locField] + '+' + (tValue ? tValue : '0')));
                break;
            case 27: // 取单不触发assign
                itemList.refresh(tableData, false);
                break;
        }
    }
    /**
     * 获取nextField字段作用于下个面板
     * @param {string} nextField
     * @param {obj} field
     * @returns {obj}
     */
    function getNextField(nextField, field) {
        var data = field ? field : {}, keyModal = com_1.Com.keyModal[com_1.Com.keyModal.length - 1];
        if (!keyModal || !keyModal.bodyWrapper) {
            return data;
        }
        var select = keyModal.getSelect();
        nextField && nextField.split(',').forEach(function (item) {
            // 本层nextField优先级大于上一层
            if (select) {
                data[item] = select[item];
            }
        });
        return data;
    }
    function initModal(para) {
        if (com_1.Com.isClose) {
            com_1.Com.isClose = false;
            com_1.Com.closeLastModalPanel();
        }
        var id = para.data && para.data.panelId || '';
        id += Date.now().toString();
        var hash = SPA.hashCreate('main', 'keyModalPage', [id]);
        SPA.open(hash, para);
    }
    function ajaxLoad(addr, field) {
        if (!addr) {
            return;
        }
        // debugger;
        tools.isNotEmpty(field) && (addr['data'] = field);
        return CashierRequest_1.CashierRequest(addr).then(function (_a) {
            var response = _a.response;
            tools.isNotEmpty(response.showText) && com_1.Com.logTip(response.showText);
            var elem = response.elements, data = elem ? elem[0] : response;
            if (elem && elem[0]) {
                com_1.Com.data[elem[0].panelId] = data;
            }
            return {
                response: data,
                shortcuts: response.shortcuts,
                padDatas: response.padDatas
            };
        });
    }
    function regExpMatch(input, inputContent) {
        if (!input) {
            return;
        }
        var regArr, data = null;
        if (inputContent && typeof inputContent !== 'string') {
            inputContent = inputContent.toString();
        }
        // inputs.forEach(input => {
        if (input.fieldRegex) {
            regArr = input.fieldRegex.split(';');
            regArr.forEach(function (r) {
                var patt = inputContent.match(r);
                if (patt && patt[0] === inputContent) {
                    data = input;
                }
            });
            // 正则为空时，匹配任何值
        }
        else if (input.fieldRegex === '') {
            data = input;
        }
        // });
        return data;
    }
});

define("CashierPage", ["require", "exports", "LoginReg", "LoginPage", "RegPage", "MainPage", "KeyModalPage"], function (require, exports, ConfPage_1, LoginPage_1, RegPage_1, MainPage_1, KeyModalPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name="CashierPage"/>
    var SPA = C.SPA;
    var cashierRouter = {
        mainPage: MainPage_1.MainPage,
        keyModalPage: KeyModalPage_1.KeyModalPage
    };
    var loginRegRouter = {
        login: LoginPage_1.LoginPage,
        reg: RegPage_1.RegPage,
        index: ConfPage_1.ConfPage
    };
    function init() {
        SPA.init([
            {
                name: 'index',
                main: {
                    router: ['index', []],
                    container: '#loginReg',
                },
                container: 'body',
                max: 1,
                router: loginRegRouter,
            },
            {
                name: 'main',
                // container: 'body',
                router: cashierRouter,
                main: {
                    router: ['mainPage', []],
                    container: 'body',
                },
                max: 100,
            }
        ]);
    }
    exports.init = init;
});
// const LOCAL_CASH_SPA_KEY = '__TEMP_CASH_SPA_PARA__';
// export let hashCreate = SPA.hashCreate;
// SPA.hashCreate = function (spaName : string, routeName : string, para?: obj | string[]) {
//     if(para) {
//         if (Array.isArray(para)) {
//             return hashCreate(spaName, routeName, para)
//         }else{
//             let paraStr = JSON.stringify(para),
//                 time = Date.now();
//
//             // localStorage.setItem(LOCAL_CASH_SPA_KEY + time, paraStr);
//             return hashCreate(spaName, routeName, [LOCAL_CASH_SPA_KEY + time]);
//         }
//     }
//     return hashCreate(spaName, routeName);
// };
// export function cashSpaParaGet(key : string){
//     let str = localStorage.getItem(key);
//     localStorage.removeItem(key);
//     return JSON.parse(str);
// }

function __setRequireBase(baseUrl, urlArg) {
    var modulePath = 'cashier/module/', pagePath = 'cashier/';
    function module(filename) {
        return modulePath + filename;
    }
    C.setRequire({
        baseUrl: baseUrl,
    }, urlArg);
}

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="pollfily.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>
