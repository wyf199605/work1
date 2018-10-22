define("FormPrintModule", ["require", "exports", "DrawSvg", "Modal", "Button", "InputBox", "Tab", "SelectInput", "TextInput", "SelectBox", "NumInput"], function (require, exports, drawSvg_1, Modal_1, Button_1, InputBox_1, tab_1, selectInput_1, text_1, selectBox_1, numInput_1) {
    "use strict";
    var _a;
    var d = G.d;
    var tools = G.tools;
    return (_a = /** @class */ (function () {
            function FormPrintModule(para) {
                this.para = para;
                this.coms = {}; //存放data-type节点
                this.pageSvgArray = []; //一张纸大小svg的预览缓存数组
                this.printUtil = (function (self) {
                    /**
                     * 获取表格的行列大小信息
                     */
                    var getColsSize = function () {
                        var ths = d.queryAll('.section-inner-wrapper:not(.pseudo-table) th', self.para.middleTable);
                        var size = {}, indexToName = {};
                        for (var i = 0, l = ths.length; i < l; i++) {
                            var temp = ths[i].offsetWidth;
                            size[i] = temp <= 150 ? temp : 150;
                            indexToName[i] = ths[i].dataset['name'];
                        }
                        self.colSize = size;
                        self.indexToName = indexToName;
                    };
                    /**
                     * 获取能放多少行与列
                     * @param width 宽度
                     * @param height 高度
                     * @param lineHeight 行高
                     */
                    var getTableConf = function (width, height, lineHeight) {
                        var col = 0, row = 0, temp = 0, widthLeave, heightLeave;
                        for (var key in self.colSize) {
                            col++;
                            temp += self.colSize[key];
                            if (temp > width) {
                                col--;
                                widthLeave = width - (temp - self.colSize[key]);
                                break;
                            }
                        }
                        !widthLeave && (widthLeave = width - temp);
                        temp = 0;
                        while (temp < height) {
                            row++;
                            temp += lineHeight;
                        }
                        heightLeave = height - (temp - lineHeight);
                        row = Math.floor(height / lineHeight);
                        return {
                            row: row,
                            col: col,
                            widthLeave: widthLeave,
                            heightLeave: heightLeave
                        };
                    };
                    /**
                     * 获取用户输入数据
                     */
                    var getUserInput = function () {
                        var tempObj = {
                            paperWidth: self.coms['width'].get() * 3.78,
                            paperHeight: self.coms['height'].get() * 3.78,
                            up: self.coms['up'].get() * 3.78,
                            down: self.coms['down'].get() * 3.78,
                            left: self.coms['left'].get() * 3.78,
                            right: self.coms['right'].get() * 3.78,
                            rowSpace: self.coms['rowSpace'].get() * 3.78,
                            colSpace: self.coms['colSpace'].get() * 3.78
                        };
                        self.userInp = tempObj;
                        return tempObj;
                    };
                    /**
                     * 获取打印机数据
                     */
                    var getPrinterList = function () {
                        if ('BlueWhaleShell' in window) {
                            var printerListStr = BlueWhaleShell.postMessage('getPrintDrive', '{}').replace(/\\/g, ""), driveList = void 0;
                            var printerList = JSON.parse(printerListStr);
                            printerList.msg && (driveList = printerList.msg.driveList);
                            if (driveList) {
                                FormPrintModule.selectInputJson.printer = [];
                                FormPrintModule.selectInputJson.printer.push({ text: "默认", value: driveList[0].driveCode });
                                if (driveList.length > 1) {
                                    for (var i = 1, l = driveList.length; i < l; i++) {
                                        FormPrintModule.selectInputJson.printer.push({ text: driveList[i].driveName, value: driveList[i].driveCode });
                                    }
                                }
                            }
                        }
                    };
                    return { getColsSize: getColsSize, getTableConf: getTableConf, getUserInput: getUserInput, getPrinterList: getPrinterList };
                })(this);
                this.printUtil.getPrinterList();
                this.initModal();
            }
            FormPrintModule.prototype.getVisableCols = function () {
                return this.para.cols;
            };
            /**
             * 初始化模态框
             */
            FormPrintModule.prototype.initModal = function () {
                var _this = this;
                // 模态框初始化
                var leftBox = new InputBox_1.InputBox(), rightBox = new InputBox_1.InputBox(), savaBtn = new Button_1.Button({
                    content: '设置默认值',
                    type: 'primary',
                    onClick: function () { },
                    key: 'saveBtn'
                }), cancelBtn = new Button_1.Button({ content: '取消', type: 'default', key: 'cancelBtn' }), printBtn = new Button_1.Button({
                    content: '打印',
                    type: 'primary',
                    onClick: function () { },
                    key: 'printBtn'
                }), previewBtn = new Button_1.Button({
                    content: '预览',
                    type: 'primary',
                    onClick: function () {
                        _this.dealPreview();
                    },
                    key: 'previewBtn'
                });
                leftBox.addItem(savaBtn);
                rightBox.addItem(printBtn);
                rightBox.addItem(previewBtn);
                rightBox.addItem(cancelBtn);
                this.modal = new Modal_1.Modal({
                    container: this.para.container,
                    header: '报表打印',
                    body: document.createElement('div'),
                    className: 'formPrint',
                    footer: {
                        leftPanel: leftBox,
                        rightPanel: rightBox
                    }
                });
                var bodyHtml = FormPrintModule.tpl();
                new tab_1.Tab({
                    tabParent: this.modal.bodyWrapper,
                    panelParent: this.modal.bodyWrapper,
                    tabs: [{ title: '设置', dom: d.query('.setDom', bodyHtml) },
                        { title: '选项', dom: d.query('.optionDom', bodyHtml) },
                        { title: '数据', dom: d.query('.dataDom', bodyHtml) },
                        { title: '补充', dom: d.query('.suppleDom', bodyHtml) }]
                });
                d.queryAll('[data-name]', this.modal.bodyWrapper).forEach(function (el) {
                    _this.replaceNameDom(el.dataset.name, el);
                });
                this.modal.isShow = true;
            };
            /**
             * 画报表表格
             * @param drawSvg
             * @param startX
             * @param startY
             * @param tableWidth
             * @param tableHeight
             */
            FormPrintModule.prototype.drawTable = function (drawSvg, startX, startY, tableWidth, tableHeight) {
                var graphConf = {
                    brushColor: 0,
                    penColor: 0,
                    brushStyle: 1,
                    penStyle: 0,
                    penWidth: 1
                };
                var rowSpa = 30 + this.userInp.rowSpace;
                var rowWidth = tableWidth - this.tableConf.widthLeave;
                var colHeight = tableHeight - this.tableConf.heightLeave;
                //循环绘制表格横向
                for (var i = 0; i <= this.tableConf.row; i++) {
                    drawSvg.graph(drawSvg_1.DrawSvg.graphKind.line, {
                        x: startX,
                        y: i * rowSpa + startY,
                        w: rowWidth,
                        h: 1.5
                    }, graphConf);
                }
                //画表格第一条竖线
                drawSvg.graph(drawSvg_1.DrawSvg.graphKind.verticalLine, { x: startX, y: startY, w: 1.5, h: colHeight }, graphConf);
                var offsetX = 0;
                //循环绘制表格其它竖线
                for (var i = 0; i < this.tableConf.col; i++) {
                    offsetX += this.colSize[i];
                    drawSvg.graph(drawSvg_1.DrawSvg.graphKind.verticalLine, {
                        x: offsetX + startX,
                        y: startY,
                        w: 1.5,
                        h: colHeight
                    }, graphConf);
                }
            };
            /**
             * 画报表头部信息
             * @param drawSvg
             * @param title
             */
            FormPrintModule.prototype.drawTop = function (drawSvg, title) {
                var textConf = {
                    alignment: 0,
                    backColor: 16777215,
                    font: { fontColor: 0, fontName: "宋体", fontSize: 12, fontStyle: 1 },
                    forFill: false,
                    autoSize: false,
                    stretch: false,
                    transparent: false,
                    wrapping: false
                };
                drawSvg.icon(3, {
                    x: this.userInp.left,
                    y: this.userInp.up + 7,
                    w: 60,
                    h: 60
                });
                drawSvg.text(title, {
                    x: this.userInp.left + 60,
                    y: this.userInp.up + 30,
                    w: 0,
                    h: 0
                }, textConf);
                drawSvg.text(title, {
                    x: this.userInp.paperWidth / 2 - 30,
                    y: this.userInp.up + 80,
                    w: 0,
                    h: 0
                }, textConf);
            };
            /**
             * 画报表底部信息
             * @param drawSvg
             */
            FormPrintModule.prototype.drawBottom = function (drawSvg) {
                var textConf = {
                    alignment: 0,
                    backColor: 16777215,
                    font: { fontColor: 0, fontName: "宋体", fontSize: 12, fontStyle: 1 },
                    forFill: false,
                    autoSize: false,
                    stretch: false,
                    transparent: false,
                    wrapping: false
                }, graphConf = {
                    brushColor: 0,
                    penColor: 0,
                    brushStyle: 1,
                    penStyle: 0,
                    penWidth: 1
                };
                drawSvg.graph(3, {
                    x: this.userInp.left,
                    y: this.userInp.paperHeight - this.userInp.down - 20,
                    w: this.userInp.paperWidth - this.userInp.left - this.userInp.right,
                    h: 1.5
                }, graphConf);
                drawSvg.text("打印者：肖映崎", {
                    x: this.userInp.left,
                    y: this.userInp.paperHeight - this.userInp.down - 10,
                    w: 0,
                    h: 0
                }, textConf);
                drawSvg.text("\u6253\u5370\u65F6\u95F4\uFF1A" + G.tools.date.format(new Date, 'yyyy-MM-dd HH:mm:ss'), {
                    x: this.userInp.paperWidth / 2 - 100,
                    y: this.userInp.paperHeight - this.userInp.down - 10,
                    w: 0,
                    h: 0
                }, textConf);
                drawSvg.text("\u7B2C " + this.currentPage + " \u9875 \u5171 " + this.totalPage + " \u9875", {
                    x: this.userInp.paperWidth - this.userInp.right - 90,
                    y: this.userInp.paperHeight - this.userInp.down - 10,
                    w: 0,
                    h: 0
                }, textConf);
            };
            /**
             * 画报表表格表体内容信息
             * @param drawSvg
             */
            FormPrintModule.prototype.drawText = function (drawSvg) {
                var _this = this;
                var getColsIndex = function (name) {
                    var cols = _this.para.cols;
                    for (var i = 0, l = cols.length; i < l; i++) {
                        if (cols[i].name === name) {
                            return i;
                        }
                    }
                    return null;
                };
                var colsCache = this.para.cols; //缓存列数据
                var tableLeft = this.userInp.left + this.tableConf.widthLeave / 2, //表格距离左侧距离
                tableTop = this.userInp.up + 100; //表格距离上侧距离
                var textConf = {
                    alignment: 0,
                    backColor: 16777215,
                    font: { fontColor: 0, fontName: "宋体", fontSize: 12, fontStyle: 1 },
                    forFill: false,
                    autoSize: false,
                    stretch: false,
                    transparent: false,
                    wrapping: true
                };
                var middleText = (30 + this.userInp.rowSpace - 12) / 2; //一个单元格的y轴中间点位置
                var leftCache = 0; //缓存当前单元格距离表格右侧距离 叠加
                var headCache = {
                    x: 10 + tableLeft,
                    y: middleText + tableTop
                };
                //填写表头
                for (var col = -1; col < this.tableConf.col - 1; col++) {
                    col !== -1 && (leftCache += this.colSize[col]);
                    var index = getColsIndex(this.indexToName[col + 1]);
                    // 通过当前单元格的name获取title
                    if (index !== null) {
                        drawSvg.text(colsCache[index].title, {
                            x: (col === -1) ? headCache.x : (leftCache + headCache.x),
                            y: headCache.y,
                            w: 0,
                            h: 0
                        }, textConf);
                    }
                }
                var bodyCache = {
                    x: 10 + tableLeft,
                    y1: this.userInp.rowSpace + 30,
                    y2: middleText + tableTop
                };
                //填写表体
                for (var row = 1; row < this.tableConf.row; row++) {
                    var curRowData = this.tableData.shift();
                    leftCache = 0;
                    if (curRowData) {
                        for (var col = -1; col < this.tableConf.col - 1; col++) {
                            col !== -1 && (leftCache += this.colSize[col]);
                            var text = tools.str.toEmpty(curRowData[this.indexToName[col + 1]]);
                            var width = this.colSize[col + 1] - 10;
                            // text = `<span class="svgText" style="width: ${width}px;">${text}</span>`;//通过添加span标签用来控制文本溢出
                            //获取当前表格数据的第row+1项因为每一个表格都有表头 所以要加一
                            drawSvg.text(text, {
                                x: (col === -1) ? bodyCache.x : (leftCache + bodyCache.x),
                                y: row * (bodyCache.y1) + bodyCache.y2,
                                w: width,
                                h: 0
                            }, textConf);
                        }
                    }
                    else {
                        break;
                    }
                }
            };
            /**
             * 初始化模板标签
             * @param {string} name
             * @param {HTMLElement} el
             */
            FormPrintModule.prototype.replaceNameDom = function (name, el) {
                var self = this;
                switch (name) {
                    case 'printer':
                        this.coms['printer'] = new selectInput_1.SelectInput({
                            container: el,
                            data: FormPrintModule.selectInputJson['printer'],
                            placeholder: '默认',
                            onSet: function (item, index) { },
                            className: 'selectInput',
                            clickType: 1
                        });
                        break;
                    case 'paper':
                        this.coms['paper'] = new selectInput_1.SelectInput({
                            container: el,
                            data: FormPrintModule.selectInputJson['paper'],
                            placeholder: '默认',
                            onSet: function (item, index) {
                                if (self.coms['width'] && self.coms['height']) {
                                    var size = self.coms['paper'].get().split("*");
                                    self.coms['width'].set(size[0]);
                                    self.coms['height'].set(size[1]);
                                }
                            },
                            className: 'selectInput',
                            clickType: 1
                        });
                        this.coms['paper'].set('210.0*297.0');
                        break;
                    case 'width':
                        this.coms['width'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        if (this.coms['paper']) {
                            var width = this.coms['paper'].get().split("*");
                            this.coms['width'].set(width[0]);
                        }
                        break;
                    case 'height':
                        this.coms['height'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        if (this.coms['paper']) {
                            var height = this.coms['paper'].get().split("*");
                            this.coms['height'].set(height[1]);
                        }
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
                        this.coms['up'].set(0);
                        break;
                    case 'down':
                        this.coms['down'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        this.coms['down'].set(10);
                        break;
                    case 'left':
                        this.coms['left'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        this.coms['left'].set(10);
                        break;
                    case 'right':
                        this.coms['right'] = new text_1.TextInput({
                            container: el,
                            placeholder: '请输入',
                            className: 'text'
                        });
                        this.coms['right'].set(10);
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
                    case 'rowSpace':
                        this.coms['rowSpace'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        this.coms['rowSpace'].set(1);
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
                        this.coms['colSpace'].set(1);
                        break;
                    case 'lanNum':
                        this.coms['lanNum'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                    case 'lanSpace':
                        this.coms['lanSpace'] = new numInput_1.NumInput({
                            container: el,
                            defaultNum: 1,
                            max: 100,
                            min: 1,
                            step: 1,
                            className: 'numInput'
                        });
                        break;
                }
            };
            FormPrintModule.prototype.dealPreview = function () {
                var _this = this;
                this.currentPage = 1;
                var previewRB = new InputBox_1.InputBox(), cancelBtn = new Button_1.Button({ content: '取消', key: 'cancelBtn', type: 'default' }), okBtn = new Button_1.Button({
                    key: 'okBtn',
                    content: '上一页',
                    type: 'primary',
                    onClick: function () {
                        _this.currentPage--;
                        var previewBody = _this.previewModal.body;
                        if (_this.currentPage <= 1) {
                            d.queryAll('.btn', _this.previewModal.wrapper)[1].setAttribute('disabled', 'disabled');
                        }
                        if (_this.currentPage == _this.totalPage - 1) {
                            d.queryAll('.btn', _this.previewModal.wrapper)[2].removeAttribute('disabled');
                        }
                        if (_this.pageSvgArray[_this.currentPage - 1]) {
                            previewBody.innerHTML = '';
                            previewBody.appendChild(_this.pageSvgArray[_this.currentPage - 1]);
                        }
                        return false;
                    }
                }), nextPageBtn = new Button_1.Button({
                    content: '下一页',
                    type: 'primary',
                    onClick: function () {
                        _this.currentPage++;
                        if (_this.currentPage >= _this.totalPage) {
                            d.queryAll('.btn', _this.previewModal.wrapper)[2].setAttribute('disabled', 'disabled');
                        }
                        if (_this.currentPage == 2) {
                            d.queryAll('.btn', _this.previewModal.wrapper)[1].removeAttribute('disabled');
                        }
                        var previewBody = _this.previewModal.body;
                        if (_this.pageSvgArray[_this.currentPage - 1]) {
                            previewBody.innerHTML = '';
                            previewBody.appendChild(_this.pageSvgArray[_this.currentPage - 1]);
                        }
                        else {
                            previewBody.innerHTML = '';
                            var drawSvg_2 = new drawSvg_1.DrawSvg({
                                width: _this.userInp.paperWidth,
                                height: _this.userInp.paperHeight
                            });
                            _this.pageSvgArray.push(drawSvg_2.getSvg());
                            previewBody.appendChild(drawSvg_2.getSvg());
                            _this.drawTable(drawSvg_2, userInp.left + _this.tableConf.widthLeave / 2, //表格距离左侧距离
                            userInp.up + 100, //表格距离上侧距离
                            tableWidth, tableHeight); //表格高度
                            _this.drawTop(drawSvg_2, '条码库存表');
                            _this.drawBottom(drawSvg_2);
                            _this.drawText(drawSvg_2);
                        }
                        return false;
                    }
                });
                previewRB.addItem(cancelBtn);
                previewRB.addItem(okBtn);
                previewRB.addItem(nextPageBtn);
                var userInp = this.printUtil.getUserInput();
                this.previewModal = new Modal_1.Modal({
                    body: d.create("<div class=\"previewBody\"></div>"),
                    className: 'preview',
                    container: this.para.container,
                    header: '预览',
                    width: userInp.paperWidth + "px",
                    footer: {
                        rightPanel: previewRB
                    },
                    top: 0,
                });
                d.queryAll('.btn', this.previewModal.wrapper)[1].setAttribute('disabled', 'disabled'); //设置开始时上一页为禁止点击状态
                this.printUtil.getColsSize();
                var drawSvg = new drawSvg_1.DrawSvg({
                    width: this.userInp.paperWidth,
                    height: this.userInp.paperHeight
                });
                this.pageSvgArray = [];
                this.pageSvgArray[0] = drawSvg.getSvg();
                this.previewModal.body.appendChild(drawSvg.getSvg());
                var tableWidth = userInp.paperWidth - userInp.left - userInp.right, //表格宽度 纸张宽度-纸张左间距-纸张右间距
                tableHeight = userInp.paperHeight - userInp.up - userInp.down - 100 - 30;
                this.tableConf = this.printUtil.getTableConf(tableWidth, tableHeight, 30 + this.userInp.rowSpace);
                this.totalPage = Math.ceil(this.para.tableData().length / this.tableConf.row);
                this.tableData = JSON.parse(JSON.stringify(this.para.tableData())); //缓存表格数据，深度复制
                this.drawTable(drawSvg, userInp.left + this.tableConf.widthLeave / 2, //表格距离左侧距离
                userInp.up + 100, //表格距离上侧距离
                tableWidth, tableHeight); //表格高度
                this.drawTop(drawSvg, '条码库存表');
                this.drawBottom(drawSvg);
                this.drawText(drawSvg);
            };
            return FormPrintModule;
        }()),
        //报表html模版
        _a.tpl = function () {
            return d.create("<div><div class = \"setDom\">\n                      <div class = 'leftSet'>\n                          <div class=\"printer\" data-name=\"printer\" ></div>\n                          <div class = \"range\">\n                                <fieldset>\n                                <legend>\u8303\u56F4</legend>\n                                <div data-name=\"pageRange\"></div>\n                                <div class = \"inline\" data-name=\"from\"><span>\u4ECE</span></div>\n                                <div class = \"inline\" data-name=\"to\"><span>\u5230</span></div>\n                                </fieldset>\n                          </div>\n                          <div class=\"direction\">\n                                <fieldset class=\"col-xs-12\">\n                                <legend>\u65B9\u5411</legend>\n                                <div data-name=\"direction\"></div>\n                                </fieldset>\n                          </div>\n                          <div class=\"content\">\n                                <fieldset class=\"col-xs-12\">\n                                <legend>\u5185\u5BB9</legend>\n                                <div data-name=\"printData\"></div>\n                                </fieldset>\n                           </div>\n                      </div>\n                      <div class = 'rightSet'>\n                          <div class=\"paper\" data-name=\"paper\" ></div>\n                          <div class = 'size'>\n                               <div  data-name=\"width\"><span>\u5BBD\u5EA6</span></div>\n                               <div  data-name=\"height\"><span>\u9AD8\u5EA6</span></div>\n                          </div>\n                          <div class = \"pagePadding\">                                               \n                                <div data-name=\"up\"><span>\u4E0A\u8FB9\u8DDD</span></div>\n                                <div data-name=\"down\"><span>\u4E0B\u8FB9\u8DDD</span></div>                         \n                                <div data-name=\"left\"><span>\u5DE6\u8FB9\u8DDD</span></div>\n                                <div data-name=\"right\"><span>\u53F3\u8FB9\u8DDD</span></div>                      \n                          </div>   \n                           <div class = \"otherSetting\">                                               \n                                <div  data-name=\"lanNum\"><span>\u680F\u6570</span></div>\n                                <div  data-name=\"lanSpace\"><span>\u680F\u8DDD</span></div>\n                                <div  data-name=\"rowSpace\"><span>\u884C\u8DDD</span></div>\n                                <div  data-name=\"colSpace\"><span>\u5217\u8DDD</span></div>\n                          </div>              \n                      </div>\n             </div>\n            <div class = \"optionDom\">\n                               \n            </div>\n            <div class = \"dataDom\">\n                                \n            </div>\n            <div class = \"suppleDom\">\n                               \n            </div></div>");
        },
        /*
         * 下拉框数据
         * */
        _a.selectInputJson = {
            printer: [{ text: '默认', value: 0 }],
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
                { value: 0, text: '自定义' }]
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
