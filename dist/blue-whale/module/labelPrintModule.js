/// <amd-module name="LabelPrintModule"/>
define("LabelPrintModule", ["require", "exports", "BwRule", "Modal", "Button", "Spinner", "SelectInput", "NumInput", "TextInput", "SelectBox", "CheckBox", "Tooltip", "Tab", "QrCode", "BarCode", "DrawSvg", "InputBox"], function (require, exports, BwRule_1, Modal_1, Button_1, spinner_1, selectInput_1, numInput_1, text_1, selectBox_1, checkBox_1, tooltip_1, tab_1, QRCode_1, barCode_1, drawSvg_1, InputBox_1) {
    "use strict";
    var _a;
    var dom = G.d;
    var CONF = BW.CONF;
    var d = G.d;
    return (_a = /** @class */ (function () {
            function LabelPrintModule(para) {
                this.para = para;
                this.pageSvgArray = []; //一张纸大小canvas的预览缓存数组
                this.jsonData = []; //后台数据转换之后的数据
                this.coms = {}; //存放data-type节点
                this.isLarge = false; //判断预览框是否放大
                /**
                 * 工具方法
                 * @type {{getPrinterList: (() => any); dealVarType: ((data) => obj); setInputDefault: (() => any); onePageSize: ((pageData: IPagePara) => {rowNum: number; colNum: number}); getUserInputVal: (() => any); printLabel: ((data, x: number, y: number, currentPageCanvas: number) => any)}}
                 */
                this.printUtil = (function (self) {
                    /**
                    * 获取打印机数据
                    */
                    var getPrinterList = function () {
                        if ('BlueWhaleShell' in window) {
                            var printerListStr = BlueWhaleShell.postMessage('getPrintDrive', '{}').replace(/\\/g, ""), driveList = void 0;
                            var printerList = JSON.parse(printerListStr);
                            printerList.msg && (driveList = printerList.msg.driveList);
                            if (driveList) {
                                LabelPrintModule.selectInputJson.printer = [];
                                LabelPrintModule.selectInputJson.printer.push({ text: "默认", value: driveList[0].driveCode });
                                if (driveList.length > 1) {
                                    for (var i = 1, l = driveList.length; i < l; i++) {
                                        LabelPrintModule.selectInputJson.printer.push({ text: driveList[i].driveName, value: driveList[i].driveCode });
                                    }
                                }
                            }
                        }
                    };
                    /**
                     * 设置页面输入框默认值
                     */
                    var setInputDefault = function () {
                        self.coms['printer'].get() !== 0 && self.coms['printer'].set(0);
                        self.coms['port'].get() !== 25 && self.coms['port'].set(25);
                        self.coms['paper'].get() !== '215.9*279.4' && self.coms['paper'].set('215.9*279.4');
                        self.coms['labelType'].get() !== 0 && self.coms['labelType'].set(0);
                        self.coms['up'].set(0);
                        self.coms['down'].set(0);
                        self.coms['left'].set(0);
                        self.coms['right'].set(0);
                        self.coms['rowSpace'].set(10);
                        self.coms['colSpace'].set(10);
                        var width = self.coms['width'], height = self.coms['height'];
                        width.on('change', function () {
                            self.coms['paper'].set(0);
                        });
                        height.on('change', function () {
                            self.coms['paper'].set(0);
                        });
                        self.labelType = 0;
                    };
                    /**
                     * 判断一页纸张能放几个标签
                     * @param {IPagePara} pageData
                     * @returns {{rowNum: number; colNum: number}}
                     */
                    var onePageSize = function (pageData) {
                        var rowNum = 0;
                        var colNum = 0;
                        var rowCurSize = pageData.left + pageData.right;
                        var colCurSize = pageData.up + pageData.down;
                        while (rowCurSize <= pageData.paperWidth) {
                            rowCurSize = rowCurSize + pageData.labelWidth;
                            if (rowCurSize <= pageData.paperWidth) {
                                colNum++;
                            }
                            rowCurSize = rowCurSize + pageData.colSpace;
                        }
                        while (colCurSize <= pageData.paperHeight) {
                            colCurSize = colCurSize + pageData.labelHeight;
                            if (colCurSize <= pageData.paperHeight) {
                                rowNum++;
                            }
                            colCurSize = colCurSize + pageData.rowSpace;
                        }
                        return {
                            rowNum: rowNum === 0 ? 1 : rowNum,
                            colNum: colNum === 0 ? 1 : colNum
                        };
                    };
                    /**
                     * 获取用户输入的各种数值
                     */
                    var getUserInputVal = function () {
                        var tempObj = {
                            paperWidth: self.coms['width'].get() * 3.78,
                            paperHeight: self.coms['height'].get() * 3.78,
                            up: self.coms['up'].get() * 3.78,
                            down: self.coms['down'].get() * 3.78,
                            left: self.coms['left'].get() * 3.78,
                            right: self.coms['right'].get() * 3.78,
                            rowSpace: self.coms['rowSpace'].get() * 3.78,
                            colSpace: self.coms['colSpace'].get() * 3.78,
                            copies: self.coms['copies'].get()
                        };
                        self.userInputValObj = tempObj;
                    };
                    /**
                     打印标签的业务逻辑
                     * data（Ajax获取的数据)
                     * @param data
                     * @param {number} x
                     * @param {number} y
                     * @param {number} currentPageCanvas
                     */
                    var printLabel = function (data, x, y, currentPageCanvas) {
                        if (data.body !== undefined) {
                            var drawSvg = new drawSvg_1.DrawSvg({
                                width: data.body.bodyList[0].width * 3.78,
                                height: data.body.bodyList[0].height * 3.78
                            });
                            var codeData = data.body.bodyList[0].lableCodes; //一维码以及二维码数据
                            var textData = data.body.bodyList[0].lableDatas; //文字的数据
                            var shapeData = data.body.bodyList[0].lableShapes; //图形的数据
                            var lableGraphs = data.body.bodyList[0].lableGraphs; //小图标数据
                            if (lableGraphs) {
                                for (var j = 0; j < lableGraphs.length; j++) {
                                    if ((typeof lableGraphs[j].condition) === 'undefined' || lableGraphs[j].condition) {
                                        drawSvg.icon(lableGraphs[j].lgraphId, {
                                            x: lableGraphs[j].leftPos * 3.78,
                                            y: lableGraphs[j].topPos * 3.78,
                                            w: lableGraphs[j].width ? lableGraphs[j].width * 3.78 : 0,
                                            h: lableGraphs[j].height ? lableGraphs[j].height * 3.78 : 0
                                        });
                                    }
                                }
                            }
                            if (shapeData) {
                                for (var j = 0; j < shapeData.length; j++) {
                                    if ((typeof shapeData[j].condition) === 'undefined' || shapeData[j].condition) {
                                        drawSvg.graph(shapeData[j].shapeKind, {
                                            x: shapeData[j].leftPos * 3.78,
                                            y: shapeData[j].topPos * 3.78,
                                            w: shapeData[j].width ? shapeData[j].width * 3.78 : 0,
                                            h: shapeData[j].height ? shapeData[j].height * 3.78 : 0
                                        }, {
                                            brushColor: shapeData[j].brushColor !== undefined ? shapeData[j].brushColor : 0,
                                            penColor: shapeData[j].penColor !== undefined ? shapeData[j].penColor : 0,
                                            brushStyle: shapeData[j].brushStyle !== undefined ? shapeData[j].brushStyle : 1,
                                            penStyle: shapeData[j].penStyle !== undefined ? shapeData[j].penStyle : 0,
                                            penWidth: shapeData[j].penWidth !== undefined ? shapeData[j].penWidth : 1
                                        });
                                    }
                                } //循环调用绘制图形方法进行图形绘制
                            }
                            if (textData) {
                                for (var i = 0; i < textData.length; i++) {
                                    if ((typeof textData[i].condition) === 'undefined' || textData[i].condition) {
                                        var tempFont = G.tools.obj.merge({}, textData[i].font ? textData[i].font : data.body.bodyList[0].defaultFont);
                                        tempFont.fontSize = tempFont.fontSize * 3.78;
                                        drawSvg.text(textData[i].dataName, {
                                            x: textData[i].leftPos * 3.78,
                                            y: textData[i].topPos * 3.78,
                                            w: textData[i].width ? textData[i].width * 3.78 : 0,
                                            h: textData[i].height ? textData[i].height * 3.78 : 0
                                        }, {
                                            alignment: textData[i].alignment !== undefined ? textData[i].alignment : 0,
                                            backColor: textData[i].backColor !== undefined ? textData[i].backColor : 16777215,
                                            font: tempFont,
                                            forFill: textData[i].forFill !== undefined ? textData[i].forFill : false,
                                            autoSize: textData[i].autoSize !== undefined ? textData[i].autoSize : false,
                                            stretch: textData[i].stretch !== undefined ? textData[i].stretch : false,
                                            transparent: textData[i].transparent !== undefined ? textData[i].transparent : false,
                                            wrapping: textData[i].wrapping !== undefined ? textData[i].wrapping : false
                                        });
                                    }
                                } //循环调用绘制文字方法进行文字绘制
                            }
                            if (codeData) {
                                for (var k = 0; k < codeData.length; k++) {
                                    if ((typeof codeData[k].condition) === 'undefined' || codeData[k].condition) {
                                        if (codeData[k].codeType === 99) {
                                            new QRCode_1.QrCode(drawSvg.getSvg(), {
                                                x: codeData[k].leftPos * 3.78,
                                                y: codeData[k].topPos * 3.78,
                                                w: codeData[k].width * 3.78,
                                                h: codeData[k].height * 3.78
                                            }, {
                                                codeData: codeData[k].codeData ? codeData[k].codeData : 'noData'
                                            });
                                        }
                                        else {
                                            new barCode_1.BarCode(drawSvg.getSvg(), {
                                                x: codeData[k].leftPos * 3.78,
                                                y: codeData[k].topPos * 3.78,
                                                w: codeData[k].width * 3.78,
                                                h: codeData[k].height * 3.78
                                            }, {
                                                codeData: codeData[k].codeData ? codeData[k].codeData : 'noData',
                                                codeType: codeData[k].codeType
                                            });
                                        }
                                    }
                                } //循环调用绘制一维码或者二维码
                            }
                            //渲染到大纸张上
                            var svgData = drawSvg.getSvg();
                            svgData.setAttribute('x', "" + x);
                            svgData.setAttribute('y', "" + y);
                            self.pageSvgArray[currentPageCanvas].appendChild(svgData);
                        }
                    };
                    var dealVarType = function (data) {
                        var varType = self.para.printList[self.labelType].dataAddr.dataAddr.varType, ajaxData = data, ajaxObj = {};
                        if (varType === 3) {
                            if (!Array.isArray(data)) {
                                ajaxData = [data];
                            }
                            ajaxData = JSON.stringify(data);
                        }
                        ajaxObj['ajaxData'] = ajaxData;
                        ajaxObj['varType'] = varType;
                        return ajaxObj;
                    };
                    return { getPrinterList: getPrinterList, dealVarType: dealVarType, setInputDefault: setInputDefault, onePageSize: onePageSize, getUserInputVal: getUserInputVal, printLabel: printLabel };
                })(this);
                /**
                 * 公共工具方法
                 * @type {{dealScroll: ((direction: number) => any); scrollFunc: ((e) => any)}}
                 */
                this.commonUtil = (function (self) {
                    var dealScroll = function (direction) {
                        var previewBody = self.previewModal.body, previewBodyFot = self.previewModal.modalFooter.wrapper, slideInput = dom.query('.range', previewBodyFot), rangeSize = dom.query('.rangeSize', previewBodyFot), currentVal = parseInt(slideInput.value);
                        function setZoom(val) {
                            (val > 30) && (val = 30);
                            (val <= 10) && (val = 10);
                            slideInput.value = "" + val;
                            rangeSize.innerText = val * 10 + "%";
                            previewBody.style.zoom = val / 10;
                        }
                        if (direction > 0) { //放大
                            currentVal = currentVal + 5;
                            setZoom(currentVal);
                        }
                        else { //缩小
                            currentVal = currentVal - 5;
                            setZoom(currentVal);
                        }
                    };
                    var scrollFunc = function (e) {
                        e = e || window.event;
                        e.preventDefault();
                        if (e.wheelDelta) { //IE/Opera/Chrome
                            dealScroll(e.wheelDelta);
                        }
                        else if (e.detail) { //Firefox
                            dealScroll(e.detail);
                        }
                    };
                    var bindPreviewEvent = function () {
                        //动态添加滑动组件用作svg画布的放大缩小
                        var sliderDiv = h("div", null,
                            h("span", { className: "rangeLabel" }, "\u7F29\u653E\u6BD4\u4F8B:"),
                            h("input", { className: "range", type: "range", min: "10", max: "30", value: "10" }),
                            h("span", { className: "rangeSize" }, "100%")), modalFooter = self.previewModal.modalFooter.wrapper;
                        modalFooter.appendChild(sliderDiv);
                        var slideInput = dom.query('.range', sliderDiv);
                        var rangeSize = dom.query('.rangeSize', sliderDiv);
                        var previewBody = self.previewModal.body, previewBodyPar = previewBody.parentElement;
                        dom.on(slideInput, 'input', function () {
                            var rangeValue = parseInt(slideInput.value);
                            previewBody.style.zoom = rangeValue / 10;
                            rangeSize.innerText = rangeValue * 10 + "%";
                        });
                        /*注册滚动事件*/
                        if (document.addEventListener) {
                            previewBody.parentElement.addEventListener('DOMMouseScroll', scrollFunc, false);
                        }
                        previewBody.parentElement.onmousewheel = previewBody.parentElement.onmousewheel = scrollFunc; //IE/Opera/Chrome
                        previewBody.onmousedown = function (ev) {
                            var lastX = null, lastY = null;
                            document.onmousemove = function (event) {
                                var curX = event.clientX, curY = event.clientY;
                                if (lastX == null || lastY == null) {
                                    lastX = curX;
                                    lastY = curY;
                                    return;
                                }
                                if (curX - lastX > 10) {
                                    previewBodyPar.scrollLeft = previewBodyPar.scrollLeft - 45;
                                }
                                else if (lastX - curX > 10) {
                                    previewBodyPar.scrollLeft = previewBodyPar.scrollLeft + 45;
                                }
                                if (curY - lastY > 10) {
                                    previewBodyPar.scrollTop = previewBodyPar.scrollTop - 45;
                                }
                                else if (lastY - curY > 10) {
                                    previewBodyPar.scrollTop = previewBodyPar.scrollTop + 45;
                                }
                                lastX = curX;
                                lastY = curY;
                            };
                            document.onmouseup = function () {
                                document.onmousemove = null; //把鼠标移动清楚
                                document.onmouseup = null; //把鼠标松开清楚
                            };
                        };
                    };
                    return { bindPreviewEvent: bindPreviewEvent };
                })(this);
                this.initModal();
                this.printUtil.getPrinterList();
            }
            /**
             * 初始化模态框
             */
            LabelPrintModule.prototype.initModal = function () {
                var _this = this;
                var leftInputBox = new InputBox_1.InputBox(), savaBtn = new Button_1.Button({
                    key: 'savaBtn',
                    content: '设为默认值',
                    type: 'primary',
                    onClick: function () {
                        _this.printUtil.setInputDefault();
                        return false;
                    }
                }), rightInputBox = new InputBox_1.InputBox(), cancelBtn = new Button_1.Button({ content: '取消', key: 'cancelBtn', type: 'default' }), okBtn = new Button_1.Button({
                    key: 'okBtn',
                    content: '打印',
                    type: 'primary',
                    onClick: function () {
                        _this.printHandle(okBtn);
                    }
                }), previewBtn = new Button_1.Button({
                    content: '预览',
                    type: 'primary',
                    onClick: function () {
                        _this.previewHanle(previewBtn);
                        return false;
                    }
                });
                leftInputBox.addItem(savaBtn);
                rightInputBox.addItem(cancelBtn);
                rightInputBox.addItem(okBtn);
                rightInputBox.addItem(previewBtn);
                this.modal = new Modal_1.Modal({
                    className: 'labelPrint',
                    container: this.para.container,
                    width: '750px',
                    header: '标签打印',
                    body: h("div", null),
                    footer: {
                        leftPanel: leftInputBox,
                        rightPanel: rightInputBox
                    },
                    onClose: function () {
                        _this.para.callBack();
                    }
                });
                //初始化下拉框
                for (var num = 0; num < this.para.printList.length; num++) {
                    LabelPrintModule.selectInputJson.labelType.push({ text: "" + this.para.printList[num].caption, value: num });
                }
                var bodyHtml = LabelPrintModule.htmlTpl();
                var body = this.modal.bodyWrapper;
                new tab_1.Tab({
                    tabParent: this.modal.bodyWrapper,
                    panelParent: this.modal.bodyWrapper,
                    tabs: [{ title: '设置', dom: d.query('.setDom', bodyHtml) },
                        { title: '选项', dom: d.query('.labelTypeDom', bodyHtml) }
                    ]
                });
                d.queryAll('[data-name]', this.modal.bodyWrapper).forEach(function (el) {
                    _this.replaceNameDom(el.dataset.name, el);
                });
                new tooltip_1.Tooltip({
                    el: dom.query('.printer', body),
                    errorMsg: "\ue6bb 打印机",
                    length: 'medium'
                });
                new tooltip_1.Tooltip({
                    el: dom.query('.port', body),
                    errorMsg: '\ue609 端口',
                    length: 'small'
                });
                new tooltip_1.Tooltip({
                    el: dom.query('.paper', body),
                    errorMsg: '\ue879 纸型',
                    length: 'medium'
                });
                this.printUtil.setInputDefault(); //设置初始化输入框等数值
            };
            /**
             * ajax请求后台模板
             * @param {string} url
             * @param {string} type
             * @param {Spinner} sp
             */
            LabelPrintModule.prototype.doAjax = function (url, type, sp) {
                var self = this, userInp = self.userInputValObj;
                self.allTableData = self.coms['printData'].get()[0] ? self.para.selectedData() : self.para.getData();
                BwRule_1.BwRule.Ajax.fetch(url)
                    .then(function (_a) {
                    var response = _a.response;
                    self.template = JSON.stringify(response);
                    //设置页面分布数据
                    self.pageData = Object.assign({
                        labelWidth: response.body.bodyList[0].width * 3.78,
                        labelHeight: response.body.bodyList[0].height * 3.78
                    }, userInp);
                    self.onePageRowAndCol = self.printUtil.onePageSize(self.pageData); //获取一张纸排布的行和列的值
                    var totalLabel = self.allTableData.length, //一共多少个标签
                    pageSize = self.onePageRowAndCol.rowNum * self.onePageRowAndCol.colNum;
                    self.totalPage = Math.ceil(totalLabel / pageSize);
                    if (type === 'preview') { //处理预览
                        var sizeCache = self.allTableData.slice(0, pageSize);
                        var _b = BwRule_1.BwRule.reqAddrFull(self.para.printList[self.labelType].dataAddr, sizeCache), addr = _b.addr, data = _b.data;
                        self.getPrintData(addr, self.printUtil.dealVarType(data), type, sp, sizeCache);
                    }
                    if (type === 'print') { //处理打印
                        for (var i = 0; i < self.totalPage; i++) {
                            var para = self.allTableData.slice(i * pageSize, (i + 1) * pageSize);
                            var _c = BwRule_1.BwRule.reqAddrFull(self.para.printList[self.labelType].dataAddr, para), addr = _c.addr, data = _c.data;
                            self.getPrintData(addr, self.printUtil.dealVarType(data), 'print', sp, para);
                        }
                    }
                })
                    .catch(function () {
                    sp.hide(); //隐藏预览按钮loading
                });
            };
            /**
             * 请求后台具体数据用来替换模板
             * @param tempUrl
             * @param ajaxObj
             * @param type
             * @param sp
             * @param shouldData
             */
            LabelPrintModule.prototype.getPrintData = function (tempUrl, ajaxObj, type, sp, shouldData) {
                var self = this, tempTemplateData, shouldLength = shouldData.length, selectFieldNames = self.para.printList[self.labelType].selectFields, isAjax = false; // 判断selectFieldNames中的所有字段在表格中是否存在  都存在直接使用表格数据，不存在则请求后台
                // 循环替换模板数据
                function re(data, jsonData) {
                    var parseURLReg = /\[(\S+?)]/g;
                    for (var key in data) {
                        if (typeof data[key] === 'object') {
                            var _loop_1 = function (key2) {
                                var value = data[key][key2];
                                if (typeof value === 'string') {
                                    var isJs_1 = value.match(/^javascript:/i), tempResult = void 0;
                                    tempResult = data[key][key2].replace(parseURLReg, function (word, $1) {
                                        var replaced = G.tools.str.toEmpty(jsonData[$1.toUpperCase()]).toString();
                                        return isJs_1 ? "'" + replaced.replace(/'/g, "/'") + "'" : replaced;
                                    });
                                    if (isJs_1) {
                                        tempResult = tempResult.replace(/^javascript:/i, '');
                                        tempResult = '(function(){' + tempResult;
                                        tempResult = tempResult + '}())';
                                        data[key][key2] = eval(tempResult);
                                    }
                                    else {
                                        data[key][key2] = tempResult;
                                    }
                                }
                            };
                            for (var key2 in data[key]) {
                                _loop_1(key2);
                            }
                        }
                    }
                }
                //根据返回数据执行预览或者打印
                function dealData(data) {
                    var templateData = self.template;
                    for (var i = 0; i < data.length; i++) {
                        tempTemplateData = templateData;
                        tempTemplateData = JSON.parse(tempTemplateData);
                        re(tempTemplateData.body.bodyList[0].lableCodes, data[i]);
                        re(tempTemplateData.body.bodyList[0].lableDatas, data[i]);
                        self.jsonData.push(tempTemplateData);
                    }
                    if (data.length < shouldLength) {
                        for (var i = 0; i < shouldLength - data.length; i++) {
                            self.jsonData.push({});
                        }
                    }
                    if (type === 'preview') {
                        self.dealPreview();
                        sp.hide();
                    }
                    else if (type === 'print') {
                        if (self.jsonData.length === self.allTableData.length) { //当数据加载完之后执行打印任务
                            self.dealPrint();
                            sp.hide();
                        }
                    }
                    else if (type === 'next') {
                        var tRow = self.onePageRowAndCol.rowNum, tCol = self.onePageRowAndCol.colNum, tPaData = self.pageData, curSize = (self.currentPage - 1) * tRow * tCol;
                        for (var row = 0; row < tRow; row++) {
                            for (var col = 0; col < tCol; col++) {
                                var cursize = curSize + (row) * tCol + col;
                                if (self.jsonData[cursize]) {
                                    self.printUtil.printLabel(self.jsonData[cursize], tPaData.left + col * (tPaData.labelWidth + tPaData.colSpace), tPaData.up + row * (tPaData.labelHeight + tPaData.rowSpace), self.currentPage - 1);
                                }
                            }
                        }
                        self.para.container.getElementsByClassName('previewBody')[0].appendChild(self.pageSvgArray[self.currentPage - 1]);
                        sp.hide();
                    }
                }
                //判断selectFieldNames中所有字段是否在表格字段中都存在
                for (var j = 0; j < selectFieldNames.length; j++) {
                    if (self.para.cols.indexOf(selectFieldNames[j]) === -1) {
                        isAjax = true;
                        break;
                    }
                }
                if (isAjax) {
                    BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + tempUrl, {
                        data2url: ajaxObj.varType !== 3,
                        // type: 'GET',
                        data: ajaxObj.ajaxData,
                    }).then(function (_a) {
                        var response = _a.response;
                        if ((response.data instanceof Array) && response.data.length > 0) {
                            dealData(response.data);
                        }
                        else {
                            Modal_1.Modal.toast("暂无数据");
                            sp.hide(); //隐藏预览按钮loading
                        }
                    }).catch(function () {
                        sp.hide(); //隐藏预览按钮loading
                    });
                }
                else {
                    dealData(shouldData);
                }
            };
            /**
             * 处理页面绘制逻辑
             */
            LabelPrintModule.prototype.dealPreview = function () {
                this.currentPage = 1;
                var tRow = this.onePageRowAndCol.rowNum, tCol = this.onePageRowAndCol.colNum, tPaData = this.pageData, curSize = (this.currentPage - 1) * tRow * tCol;
                if (this.allTableData.length <= tRow * tCol) {
                    dom.queryAll('.btn', this.previewModal.wrapper)[2].setAttribute('disabled', 'disabled');
                } //设置开始时下一页为禁止点击状态，当后台返回的数据小于等于页面分页的数据
                else {
                    dom.queryAll('.btn', this.previewModal.wrapper)[2].removeAttribute('disabled');
                }
                //循环绘制图形
                for (var row = 0; row < tRow; row++) {
                    for (var col = 0; col < tCol; col++) {
                        var size = curSize + (row) * tCol + col;
                        if (this.jsonData[size]) {
                            this.printUtil.printLabel(this.jsonData[size], tPaData.left + col * (tPaData.labelWidth + tPaData.colSpace), tPaData.up + row * (tPaData.labelHeight + tPaData.rowSpace), this.currentPage - 1);
                        }
                    }
                }
                this.para.container.getElementsByClassName('previewBody')[0].appendChild(this.pageSvgArray[0]);
                this.previewModal.isShow = true;
            };
            /**
             * 处理打印功能的函数
             */
            LabelPrintModule.prototype.dealPrint = function () {
                var tRow = this.onePageRowAndCol.rowNum, tCol = this.onePageRowAndCol.colNum, tPaData = this.pageData;
                for (var num = 0; num < this.totalPage; num++) { //循环生成每页的图像
                    var pageSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    pageSvg.setAttribute('width', "" + this.userInputValObj.paperWidth);
                    pageSvg.setAttribute('height', "" + this.userInputValObj.paperHeight);
                    pageSvg.setAttribute('style', 'background-color:white;');
                    this.pageSvgArray.push(pageSvg);
                    var curSize = num * tRow * tCol;
                    for (var row = 0; row < tRow; row++) {
                        for (var col = 0; col < tCol; col++) {
                            var size = curSize + row * tCol + col;
                            if (this.jsonData[size]) {
                                this.printUtil.printLabel(this.jsonData[size], tPaData.left + col * (tPaData.labelWidth + tPaData.colSpace), tPaData.up + row * (tPaData.labelHeight + tPaData.rowSpace), num);
                            }
                        }
                    }
                }
                var Base64 = {
                    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                    encode: function (input) {
                        var output = "";
                        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                        var i = 0;
                        input = Base64._utf8_encode(input);
                        while (i < input.length) {
                            chr1 = input.charCodeAt(i++);
                            chr2 = input.charCodeAt(i++);
                            chr3 = input.charCodeAt(i++);
                            enc1 = chr1 >> 2;
                            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                            enc4 = chr3 & 63;
                            if (isNaN(chr2)) {
                                enc3 = enc4 = 64;
                            }
                            else if (isNaN(chr3)) {
                                enc4 = 64;
                            }
                            output = output +
                                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
                        }
                        return output;
                    },
                    _utf8_encode: function (string) {
                        string = string.replace(/\r\n/g, "\n");
                        var utftext = "";
                        for (var n = 0; n < string.length; n++) {
                            var c = string.charCodeAt(n);
                            if (c < 128) {
                                utftext += String.fromCharCode(c);
                            }
                            else if ((c > 127) && (c < 2048)) {
                                utftext += String.fromCharCode((c >> 6) | 192);
                                utftext += String.fromCharCode((c & 63) | 128);
                            }
                            else {
                                utftext += String.fromCharCode((c >> 12) | 224);
                                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                                utftext += String.fromCharCode((c & 63) | 128);
                            }
                        }
                        return utftext;
                    }
                };
                var dealPrintData = function (uri) {
                    if ('BlueWhaleShell' in window) {
                        var result = BlueWhaleShell.postMessage('callPrint', '{"quantity":1,"driveCode":"3","image":"' + uri + '"}');
                        Modal_1.Modal.alert(result);
                    }
                };
                var s = new XMLSerializer().serializeToString(this.pageSvgArray[0]);
                var encodedData = Base64.encode(s);
                console.log(encodedData);
                /* for(let i = 0,l = this.pageSvgArray.length;i < l;i++){
                     let s = new XMLSerializer().serializeToString(this.pageSvgArray[i]);
                     let encodedData = Base64.encode(s);
                     dealPrintData(encodedData);
                     if(i = l-1){
                         this.para.callBack();
                     }
                 }*/
            };
            /**
             * 打印按钮点击之后的回调函数
             * @param {Button} okBtn
             * @returns {boolean}
             */
            LabelPrintModule.prototype.printHandle = function (okBtn) {
                var btn = okBtn.wrapper, par = this.para, data, sp;
                data = this.coms['printData'].get()[0] ? par.selectedData() : par.getData();
                if (data.length === 0) { //判断打印是否有数据
                    Modal_1.Modal.alert("暂无数据，无法打印");
                    return false;
                }
                sp = new spinner_1.Spinner({
                    el: btn,
                    size: 14,
                    type: spinner_1.Spinner.SHOW_TYPE.replace,
                });
                sp.show();
                this.printUtil.getUserInputVal(); //获取用户输入数据
                this.pageSvgArray = []; //清空页面缓存的canvas数组
                this.jsonData = []; //清空存放后台数据转换之后的数据
                this.doAjax(CONF.siteUrl + par.printList[this.labelType].templateLink.dataAddr, 'print', sp); //执行ajax调用后台操作
            };
            /**
             * 预览按钮点击之后的回调函数
             * @param {Button} previewBtn
             * @returns {boolean}
             */
            LabelPrintModule.prototype.previewHanle = function (previewBtn) {
                var _this = this;
                var sp, //加载效果对象
                data; //用户选择的打印数据临时对象
                this.printUtil.getUserInputVal(); //更新this.userInputValObj的值
                if (this.previewModal) {
                    d.closest(this.previewModal.body, '.modal-wrapper').style.width = this.userInputValObj.paperWidth + "px";
                }
                var btn = previewBtn.wrapper;
                data = this.coms['printData'].get()[0] ? this.para.selectedData() : this.para.getData();
                if (data.length === 0) {
                    Modal_1.Modal.alert("暂无数据，无法打印");
                    return false;
                }
                sp = new spinner_1.Spinner({
                    el: btn,
                    size: 14,
                    type: spinner_1.Spinner.SHOW_TYPE.replace,
                });
                sp.show();
                this.pageSvgArray = []; //清空存放页面canvas数组
                this.jsonData = []; //清空存放后台数据转换之后的数据
                var userInp = this.userInputValObj;
                if (!this.previewModal) {
                    var previewRB = new InputBox_1.InputBox(), cancelBtn = new Button_1.Button({ content: '取消', key: 'cancelBtn', type: 'default' }), okBtn = new Button_1.Button({
                        key: 'okBtn',
                        content: '上一页',
                        type: 'primary',
                        onClick: function () {
                            var tempEl = _this.para.container.getElementsByClassName('previewBody')[0];
                            _this.currentPage--;
                            if (_this.currentPage <= 1) {
                                dom.queryAll('.btn', _this.previewModal.wrapper)[1].setAttribute('disabled', 'disabled');
                            }
                            if (_this.currentPage == _this.totalPage - 1) {
                                dom.queryAll('.btn', _this.previewModal.wrapper)[2].removeAttribute('disabled');
                            }
                            if (_this.pageSvgArray[_this.currentPage - 1]) {
                                tempEl.innerHTML = '';
                                tempEl.appendChild(_this.pageSvgArray[_this.currentPage - 1]);
                            }
                            return false;
                        }
                    }), nextPageBtn_1 = new Button_1.Button({
                        content: '下一页',
                        type: 'primary',
                        onClick: function () {
                            var tempEl = _this.para.container.getElementsByClassName('previewBody')[0];
                            _this.currentPage++;
                            if (_this.currentPage >= _this.totalPage) {
                                dom.queryAll('.btn', _this.previewModal.wrapper)[2].setAttribute('disabled', 'disabled');
                            }
                            if (_this.currentPage == 2) {
                                dom.queryAll('.btn', _this.previewModal.wrapper)[1].removeAttribute('disabled');
                            }
                            if (_this.pageSvgArray[_this.currentPage - 1]) {
                                tempEl.innerHTML = '';
                                tempEl.appendChild(_this.pageSvgArray[_this.currentPage - 1]);
                            }
                            else {
                                sp = new spinner_1.Spinner({
                                    el: nextPageBtn_1.wrapper,
                                    size: 14,
                                    type: spinner_1.Spinner.SHOW_TYPE.replace,
                                });
                                sp.show();
                                tempEl.innerHTML = '';
                                var pageSvg_1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                pageSvg_1.setAttribute('width', "" + _this.userInputValObj.paperWidth);
                                pageSvg_1.setAttribute('height', "" + _this.userInputValObj.paperHeight);
                                pageSvg_1.setAttribute('style', 'background-color:white;');
                                _this.pageSvgArray.push(pageSvg_1);
                                var pageSize = _this.onePageRowAndCol.rowNum * _this.onePageRowAndCol.colNum;
                                var para = _this.allTableData.slice((_this.currentPage - 1) * pageSize, _this.currentPage * pageSize);
                                var _a = BwRule_1.BwRule.reqAddrFull(_this.para.printList[_this.labelType].dataAddr, para), addr = _a.addr, data_1 = _a.data;
                                _this.getPrintData(addr, _this.printUtil.dealVarType(data_1), 'next', sp, para);
                            }
                            return false;
                        }
                    });
                    previewRB.addItem(cancelBtn);
                    previewRB.addItem(okBtn);
                    previewRB.addItem(nextPageBtn_1);
                    this.previewModal = new Modal_1.Modal({
                        body: h("div", { className: "previewBody" }),
                        className: 'preview',
                        container: this.para.container,
                        width: userInp.paperWidth + "px",
                        footer: {
                            rightPanel: previewRB
                        },
                        header: {
                            title: '预览',
                            isFullScreen: true
                        },
                        top: 0,
                        onLarge: function () {
                            var previewBody = _this.previewModal.body, preParSty = previewBody.parentElement.style, preFirPar = previewBody.parentElement.parentElement, header = dom.query('.head-wrapper', preFirPar), footer = dom.query('.modal-footer', preFirPar), bodyHeight = preFirPar.offsetHeight - header.offsetHeight - footer.offsetHeight, bodyWidth = previewBody.scrollWidth;
                            if (!_this.isLarge) {
                                preParSty.maxHeight = 'none';
                                preParSty.marginLeft = '50%';
                                preParSty.left = "-" + bodyWidth / 2 + "px";
                                preParSty.height = bodyHeight + 'px';
                                _this.isLarge = true;
                            }
                            else {
                                preParSty.maxHeight = '500px';
                                preParSty.left = '0px';
                                preParSty.marginLeft = '0px';
                                _this.isLarge = false;
                            }
                        }
                    });
                    this.previewModal.onClose = function () {
                        if (_this.isLarge) {
                            var fullBut = dom.query('span[data-fullscreen="enlarge"]', _this.previewModal.body.parentElement.parentElement);
                            fullBut.click();
                        }
                    };
                    this.previewModal.isShow = false;
                    //添加预览放大缩小拖拽等效果
                    this.commonUtil.bindPreviewEvent();
                }
                dom.queryAll('.btn', this.previewModal.wrapper)[1].setAttribute('disabled', 'disabled'); //设置开始时上一页为禁止点击状态
                this.para.container.getElementsByClassName('previewBody')[0].innerHTML = '';
                this.para.container.getElementsByClassName('preview')[0].getElementsByClassName('modal-body')[0].setAttribute('style', "width:" + userInp.paperWidth + "px;\n             height:" + userInp.paperHeight + "px");
                //初始化一张纸大小的cancas的宽高
                var pageSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                pageSvg.setAttribute('width', "" + userInp.paperWidth);
                pageSvg.setAttribute('height', "" + userInp.paperHeight);
                pageSvg.setAttribute('style', 'background-color:white;');
                this.pageSvgArray.push(pageSvg);
                //执行ajax调用后台操作
                this.doAjax(CONF.siteUrl + this.para.printList[this.labelType].templateLink.dataAddr, 'preview', sp);
            };
            /**
             * 初始化模板标签
             * @param {string} name
             * @param {HTMLElement} el
             */
            LabelPrintModule.prototype.replaceNameDom = function (name, el) {
                var self = this;
                switch (name) {
                    case 'printer':
                        this.coms['printer'] = new selectInput_1.SelectInput({
                            container: el,
                            data: LabelPrintModule.selectInputJson['printer'],
                            placeholder: '默认',
                            onSet: function (item, index) {
                            },
                            className: 'selectInput',
                            clickType: 1
                        });
                        break;
                    case 'port':
                        this.coms['port'] = new selectInput_1.SelectInput({
                            container: el,
                            data: LabelPrintModule.selectInputJson['port'],
                            placeholder: '默认',
                            onSet: function (item, index) {
                            },
                            className: 'selectInput',
                            clickType: 1
                        });
                        break;
                    case 'paper':
                        this.coms['paper'] = new selectInput_1.SelectInput({
                            container: el,
                            data: LabelPrintModule.selectInputJson['paper'],
                            placeholder: '默认',
                            onSet: function (item, index) {
                                if (item.value != 0) {
                                    var widthAndHeight = item.value.split('*');
                                    self.coms['width'].set(widthAndHeight[0]);
                                    self.coms['height'].set(widthAndHeight[1]);
                                }
                            },
                            className: 'selectInput',
                            clickType: 1
                        });
                        break;
                    case 'scale':
                        this.coms['scale'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                    case 'ratio':
                        this.coms['ratio'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                    case 'width':
                        this.coms['width'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        break;
                    case 'height':
                        this.coms['height'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        break;
                    case 'pageRange':
                        this.coms['pageRange'] = new selectBox_1.SelectBox({
                            container: el,
                            select: {
                                multi: false,
                                isRadioNotchecked: false,
                                callback: function (index) {
                                }
                            },
                            data: [{ value: 0, text: '所有页' }, { value: 1, text: '指定页' }]
                        });
                        break;
                    case 'from':
                        this.coms['from'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                    case 'to':
                        this.coms['to'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                    case 'up':
                        this.coms['up'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        break;
                    case 'down':
                        this.coms['down'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        break;
                    case 'left':
                        this.coms['left'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        break;
                    case 'right':
                        this.coms['right'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        break;
                    case 'direction':
                        this.coms['direction'] = new selectBox_1.SelectBox({
                            container: el,
                            select: {
                                multi: false,
                                isRadioNotchecked: false,
                                callback: function (index) {
                                }
                            },
                            data: [{ value: 0, text: '横向' }, { value: 1, text: '纵向' }]
                        });
                        break;
                    case 'rowSpace':
                        this.coms['rowSpace'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                    case 'colSpace':
                        this.coms['colSpace'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                    case 'horizontalRank':
                        this.coms['horizontalRank'] = new checkBox_1.CheckBox({
                            container: el,
                            text: '横向排列'
                        });
                        break;
                    case 'fillMethod':
                        this.coms['fillMethod'] = new checkBox_1.CheckBox({
                            container: el,
                            text: '填空方式'
                        });
                        break;
                    case 'printData':
                        this.coms['printData'] = new selectBox_1.SelectBox({
                            container: el,
                            select: {
                                multi: false,
                                isRadioNotchecked: false,
                                callback: function (index) {
                                }
                            },
                            data: [{ value: 0, text: '全部数据' }, { value: 1, text: '选定数据' }]
                        });
                        break;
                    case 'copies':
                        this.coms['copies'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                    case 'labelType':
                        this.coms['labelType'] = new selectInput_1.SelectInput({
                            container: el,
                            data: LabelPrintModule.selectInputJson['labelType'],
                            placeholder: '默认',
                            onSet: function (item, index) {
                                self.labelType = index;
                            },
                            className: 'selectInput',
                            clickType: 0
                        });
                        break;
                }
            };
            return LabelPrintModule;
        }()),
        /**
         * 下拉框数据
         * @type {{printer: [{text: string; value: number}]; port: [{text: string; value: number} , {text: string; value: number}]; paper: [{value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: number; text: string}]; labelType: Array}}
         */
        _a.selectInputJson = {
            printer: [{ text: '默认', value: 0 }],
            port: [{ text: '25', value: 25 }, { text: '8080', value: 8080 }],
            paper: [{ value: '215.9*279.4', text: '信纸(215.9*279.4毫米)' },
                { value: '279.4*431.8', text: '小报(279.4*431.8毫米)' },
                { value: '215.9*355.6', text: '文书(215.9*355.6毫米)' },
                { value: '139.7*215.9', text: '申明(139.7*215.9毫米)' },
                { value: '190.5*254.0', text: '公函(190.5*254.0毫米)' },
                { value: '297.0*420.0', text: 'A3(297.0*420.0毫米)' },
                { value: '210.0*297.0', text: 'A4(210.0*297.0毫米)' },
                { value: '148.0*210.0', text: 'A5(148.0*210.0毫米)' },
                { value: '250.0*354.0', text: 'B4(250.0*354.0毫米)' },
                { value: '182.0*257.0', text: 'B5(182.0*257.0毫米)' },
                { value: '215.9*330.2', text: '2开(215.9*330.2毫米)' },
                { value: '215.0*275.0', text: '4开(215.0*275.0毫米)' },
                { value: '254.0*355.6', text: '大4开(254.0*355.6毫米)' },
                { value: '215.9*279.0', text: '便条(215.9*279.0毫米)' },
                { value: '98.4*225.4', text: '9号信封(98.4*225.4毫米)' },
                { value: '104.8*241.3', text: '10号信封(104.8*241.3毫米)' },
                { value: '114.3*263.5', text: '11号信封(114.3*263.5毫米)' },
                { value: '101.6*279.4', text: '12号信封(101.6*279.4毫米)' },
                { value: '127.0*292.1', text: '14号信封(127.0*292.1毫米)' },
                { value: '100.0*100.0', text: '方纸(100.0*100.0毫米)' },
                { value: 0, text: '自定义' }],
            labelType: []
        },
        /**
         * 获取打印标签html模板
         * @returns {string}
         */
        _a.htmlTpl = function () {
            return h("div", null,
                h("div", { className: "setDom" },
                    h("div", { className: 'leftSet' },
                        h("div", { className: "printer", "data-name": "printer" }),
                        h("div", { className: "port", "data-name": "port" }),
                        h("div", { className: "scale", "data-name": "scale" },
                            h("span", null, "\u7F29\u653E")),
                        h("div", { className: "ratio", "data-name": "ratio" },
                            h("span", null, "\u5206\u8FA8\u7387")),
                        h("div", { className: "range" },
                            h("fieldset", null,
                                h("legend", null, "\u8303\u56F4"),
                                h("div", { "data-name": "pageRange" }),
                                h("div", { className: "inline", "data-name": "from" },
                                    h("span", null, "\u4ECE")),
                                h("div", { className: "inline", "data-name": "to" },
                                    h("span", null, "\u5230")))),
                        h("div", { className: "direction" },
                            h("fieldset", { className: "col-xs-12" },
                                h("legend", null, "\u65B9\u5411"),
                                h("div", { "data-name": "direction" }))),
                        h("div", { className: "content" },
                            h("fieldset", { className: "col-xs-12" },
                                h("legend", null, "\u5185\u5BB9"),
                                h("div", { "data-name": "printData" })))),
                    h("div", { className: 'rightSet' },
                        h("div", { className: "paper", "data-name": "paper" }),
                        h("div", { className: 'size' },
                            h("div", { "data-name": "width" },
                                h("span", null, "\u5BBD\u5EA6")),
                            h("div", { "data-name": "height" },
                                h("span", null, "\u9AD8\u5EA6"))),
                        h("div", { className: "pagePadding" },
                            h("div", { "data-name": "up" },
                                h("span", null, "\u4E0A\u8FB9\u8DDD")),
                            h("div", { "data-name": "down" },
                                h("span", null, "\u4E0B\u8FB9\u8DDD")),
                            h("div", { "data-name": "left" },
                                h("span", null, "\u5DE6\u8FB9\u8DDD")),
                            h("div", { "data-name": "right" },
                                h("span", null, "\u53F3\u8FB9\u8DDD"))),
                        h("div", { className: "otherSetting" },
                            h("div", { "data-name": "horizontalRank" }),
                            h("div", { "data-name": "fillMethod" }),
                            h("div", { "data-name": "rowSpace" },
                                h("span", null, "\u884C\u8DDD")),
                            h("div", { "data-name": "colSpace" },
                                h("span", null, "\u5217\u8DDD"))),
                        h("div", { className: "copies", "data-name": "copies" },
                            h("span", null, "\u4EFD\u6570")))),
                h("div", { className: "labelTypeDom" },
                    h("div", { "data-name": "labelType" },
                        " ",
                        h("span", null, " \u6807\u7B7E\u7C7B\u578B "),
                        " ")));
        },
        _a);
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
