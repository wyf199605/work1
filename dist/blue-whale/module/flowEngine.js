define("FlowDesigner", ["require", "exports", "raphael", "Modal", "BwRule"], function (require, exports, Raphael, Modal_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    Raphael.fn.connection = function (obj1, obj2, line, bg) {
        bg = '#b6d1e0';
        if (obj1.line && obj1.from && obj1.to) {
            line = obj1;
            obj1 = line.from;
            obj2 = line.to;
        }
        var bb1 = obj1.getBBox(), bb2 = obj2.getBBox(), p = [{ x: bb1.x + bb1.width / 2, y: bb1.y - 1 },
            { x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1 },
            { x: bb1.x - 1, y: bb1.y + bb1.height / 2 },
            { x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2 },
            { x: bb2.x + bb2.width / 2, y: bb2.y - 1 },
            { x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1 },
            { x: bb2.x - 1, y: bb2.y + bb2.height / 2 },
            { x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2 }], d = {}, dis = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 4; j < 8; j++) {
                var dx = Math.abs(p[i].x - p[j].x), dy = Math.abs(p[i].y - p[j].y);
                if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                    dis.push(dx + dy);
                    d[dis[dis.length - 1]] = [i, j];
                }
            }
        }
        if (dis.length == 0) {
            var res = [0, 4];
        }
        else {
            res = d[Math.min.apply(Math, dis)];
        }
        var x1 = p[res[0]].x, y1 = p[res[0]].y, x4 = p[res[1]].x, y4 = p[res[1]].y;
        dx = Math.max(Math.abs(x1 - x4) / 2, 10);
        dy = Math.max(Math.abs(y1 - y4) / 2, 10);
        var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3), y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3), x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3), y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
        var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
        if (line && line.line) {
            line.bg && line.bg.attr({ path: path });
            line.line.attr({ path: path });
        }
        else {
            var color = typeof line == "string" ? line : "#b6d1e0";
            return {
                bg: bg && bg.split && this.path(path).attr({
                    stroke: bg.split("|")[0],
                    fill: "none",
                    "stroke-width": bg.split("|")[1] || 2
                }),
                line: this.path(path).attr({ stroke: color, fill: "none" }),
                from: obj1,
                to: obj2
            };
        }
    };
    var FlowDesigner = /** @class */ (function () {
        function FlowDesigner(url) {
            var _this_1 = this;
            this.initEvents = (function () {
                var clickSVG = function (e) {
                    var target = e.target;
                    if (target.tagName === 'svg') {
                        FlowDesigner.removeAllActive();
                        // FlowDesigner.flowEditor.show = true;
                    }
                };
                return {
                    on: function () {
                        d.on(d.query('#design-canvas'), 'click', 'svg', clickSVG);
                    },
                    off: function () {
                        d.off(d.query('#design-canvas'), 'click', 'svg', clickSVG);
                    }
                };
            })();
            var body = h("div", { className: "design-canvas", id: "design-canvas" });
            var modal = new Modal_1.Modal({
                body: body,
                header: '新增流程',
                className: 'flow-modal',
                width: '90%',
                height: '90%',
                onClose: function () {
                    _this_1.destroy();
                    modal.destroy();
                }
            });
            var Tip;
            tools.isEmpty(url) && (Tip = new Tips({
                container: body
            }));
            var paper = window.getComputedStyle(body), paperWidth = paper.width, paperHeight = paper.height;
            FlowDesigner.PAPER = Raphael('design-canvas', parseInt(paperWidth.slice(0, paperWidth.length - 2)), parseInt(paperHeight.slice(0, paperHeight.length - 2)));
            // FlowDesigner.flowEditor = new FlowEditor({
            //     type: 'flow-designer',
            //     container: d.query('#design-canvas')
            // });
            this.initEvents.on();
            // 如果有url传入，根据url获取xml==>根据xml绘制流程（流程不可修改）
            // 如果没有则需要自己绘制流程
            if (tools.isNotEmpty(url)) {
                BwRule_1.BwRule.Ajax.fetch(url).then(function (_a) {
                    var response = _a.response;
                    // 从xml中读取时，节点、连接线都不可操作,标题需要改变
                    d.query('#design-canvas').style.pointerEvents = 'none';
                    modal.modalHeader.title = '查看流程';
                    // 从字符串中加载
                    function LoadXMLStr(xmlStr) {
                        var parseXML;
                        if (typeof DOMParser == "function") {
                            parseXML = function (xmlStr) {
                                return (new DOMParser()).parseFromString(xmlStr, "text/xml");
                            };
                        }
                        else if (typeof window['ActiveXObject'] != 'undefined' && new Window['ActiveXObject']('Microsoft.XMLDOM')) {
                            parseXML = function (xmlStr) {
                                var xmlDOC = new Window['ActiveXObject']("Microsoft.XMLDOM");
                                xmlDOC.async = 'false';
                                xmlDOC.loadXML(xmlStr);
                                return xmlDOC;
                            };
                        }
                        else {
                            throw new Error("No XML parser found");
                        }
                        return parseXML(xmlStr);
                    }
                    var xmlStr = response.body.bodyList[0].dataList[0].toString(), rootElement = LoadXMLStr(xmlStr).documentElement;
                    // 绘制xml中的所有节点
                    rootElement.childNodes.forEach(function (child) {
                        if (child.nodeType === 1) {
                            var layout = child.attributes.layout.value.split(',').map(function (item) { return parseInt(item); }), isComplete = false, displayName = void 0;
                            // 存在xml中没有isComplete属性情况
                            'isComplete' in child.attributes && (isComplete = child.attributes.isComplete.value === 'true' ? true : false);
                            'displayName' in child.attributes && (displayName = child.attributes.displayName.value);
                            var shape = new FlowItem({
                                type: child.tagName,
                                text: displayName,
                                position: { x: layout[0], y: layout[1] },
                                width: layout[2],
                                height: layout[3],
                                isComplete: isComplete,
                                container: d.query('#design-canvas')
                            });
                            // 设置节点的data-id
                            shape.wrapper.dataset.id = child.attributes.name.value;
                            var arr = FlowDesigner.ALLITEMS || [];
                            FlowDesigner.ALLITEMS = arr.concat([shape]);
                            // 开始节点的內圆也要改变颜色
                            if (shape.isStart && shape.isComplete) {
                                d.query('.inner-circle', shape.wrapper).style.backgroundColor = '#31ccff';
                            }
                        }
                    });
                    // 根据data-id寻找对应的节点
                    function searchFlowItem(id) {
                        return FlowDesigner.ALLITEMS.filter(function (item) { return item.wrapper.dataset.id === id; })[0];
                    }
                    // 绘制连接线
                    rootElement.childNodes.forEach(function (child) {
                        if (child.nodeType === 1) {
                            var transition = d.query('transition', child);
                            if (tools.isNotEmpty(transition) && tools.isNotEmpty(transition.attributes['to'].value)) {
                                var start = searchFlowItem(child.attributes.name.value), end = searchFlowItem(transition.attributes['to'].value) || null;
                                // xml中最后的节点可能有to属性，但是最后的节点是没有连线的
                                if (tools.isEmpty(end)) {
                                    return;
                                }
                                var lineItem = new LineItem({
                                    startNode: start.rectNode,
                                    endNode: end.rectNode,
                                    container: d.query('#design-canvas')
                                });
                                lineItem.active = false;
                                var relationsArr = start.relations || [], lineItems = start.lineItems || [], allLineItems = FlowDesigner.AllLineItems || [];
                                FlowDesigner.AllLineItems = allLineItems.concat([lineItem]);
                                start.relations = relationsArr.concat(end);
                                start.lineItems = lineItems.concat([lineItem]);
                                FlowDesigner.removeAllActive();
                            }
                        }
                    });
                    // 如果节点已经完成，则对应的连接线的颜色也要改变
                    FlowDesigner.ALLITEMS.filter(function (item) { return item.isComplete; }).forEach(function (item) {
                        tools.isNotEmptyArray(item.lineItems) && item.lineItems.forEach(function (lineItem) {
                            lineItem.line.attr({
                                stroke: '#31ccff'
                            });
                        });
                    });
                    // FlowDesigner.flowEditor.show = true;
                }).catch(function (err) {
                    console.log(err);
                });
            }
        }
        FlowDesigner.removeAllActive = function () {
            FlowItem.removeAllActiveClass();
            LineItem.removeAllActive();
        };
        FlowDesigner.prototype.destroy = function () {
            FlowDesigner.AllLineItems = [];
            FlowDesigner.CURRENT_SELECT_TYPE = '';
            FlowDesigner.PAPER = null;
            FlowDesigner.ALLITEMS = [];
            FlowDesigner.connections = [];
            this.initEvents.off();
        };
        return FlowDesigner;
    }());
    exports.FlowDesigner = FlowDesigner;
    var FlowItem = /** @class */ (function (_super) {
        __extends(FlowItem, _super);
        function FlowItem(para) {
            var _this_1 = _super.call(this, para) || this;
            _this_1.para = para;
            _this_1.x = para.position.x;
            _this_1.y = para.position.y;
            _this_1.isComplete = para.isComplete || false;
            if (para.type === 'start') {
                // 开始节点
                _this_1.isStart = true;
                _this_1.isEnd = false;
                _this_1.wrapper.style.left = (para.position.x - 20) + 'px';
                _this_1.wrapper.style.top = (para.position.y - 20) + 'px';
                _this_1.wrapper.classList.add('start-circle');
                _this_1.wrapper.appendChild(h("div", { className: "inner-circle" }));
                _this_1.rectNode = FlowDesigner.PAPER.circle(para.position.x, para.position.y, 20).attr(_this_1.getDefaultAttr(para.position.x, para.position.y));
            }
            else if (para.type === 'end') {
                // 结束节点
                _this_1.isEnd = true;
                _this_1.isStart = false;
                _this_1.wrapper.style.left = (para.position.x - 20) + 'px';
                _this_1.wrapper.style.top = (para.position.y - 20) + 'px';
                _this_1.wrapper.classList.add('end-circle');
                _this_1.rectNode = FlowDesigner.PAPER.circle(para.position.x, para.position.y, 20).attr(_this_1.getDefaultAttr(para.position.x, para.position.y));
            }
            else {
                // 其他节点
                _this_1.isStart = false;
                _this_1.isEnd = false;
                var diamondArr = ['decision', 'fork', 'join'];
                _this_1.wrapper.style.left = para.position.x + 'px';
                _this_1.wrapper.style.top = para.position.y + 'px';
                _this_1.width = para.width || 50;
                _this_1.height = para.height || 50;
                if (diamondArr.indexOf(para.type) >= 0) {
                    _this_1.wrapper.classList.add('diamond');
                    _this_1.wrapper.appendChild(h("div", { className: "diamond-text" }, para.type));
                    _this_1.rectNode = FlowDesigner.PAPER.rect(para.position.x, para.position.y, _this_1.width, _this_1.height).attr(_this_1.getDefaultAttr(para.position.x, para.position.y)).transform('r45');
                }
                else {
                    _this_1.text = para.text || para.type;
                    var areaObj = _this_1.calcWidthAndHeight();
                    _this_1.rectNode = FlowDesigner.PAPER.rect(para.position.x, para.position.y, para.width || areaObj.width, para.height || areaObj.height, 5).attr(_this_1.getDefaultAttr(para.position.x, para.position.y));
                }
            }
            var self = _this_1;
            _this_1.rectNode.drag(_this_1.draggerMoveHandler(), _this_1.draggerStartHandler(), _this_1.draggerEndHandler());
            _this_1.flowEditor = new FlowEditor({
                type: para.type,
                container: d.query('#design-canvas')
            });
            _this_1.rectNode.click(_this_1.clickHandler());
            _this_1.rectNode.dblclick(_this_1.dblclickHandler()); // 双击编辑属性
            return _this_1;
        }
        FlowItem.prototype.wrapperInit = function (para) {
            return h("div", { className: "flow-item" });
        };
        Object.defineProperty(FlowItem.prototype, "rectNode", {
            get: function () {
                return this._rectNode;
            },
            set: function (rectNode) {
                this._rectNode = rectNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "relations", {
            get: function () {
                return this._relations;
            },
            set: function (relations) {
                this._relations = relations;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "lineItems", {
            get: function () {
                return this._lineItems;
            },
            set: function (lineItems) {
                this._lineItems = lineItems;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (y) {
                this._y = y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (width) {
                this._width = width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (height) {
                this._height = height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "isComplete", {
            get: function () {
                return this._isComplete;
            },
            set: function (isComplete) {
                if (isComplete) {
                    this.wrapper.style.borderColor = '#31ccff';
                }
                else {
                    this.wrapper.style.borderColor = '#b6d1e0';
                }
                this._isComplete = isComplete;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (text) {
                this._text = text;
                this.wrapper.innerHTML = text;
            },
            enumerable: true,
            configurable: true
        });
        FlowItem.prototype.clickHandler = function () {
            var self = this;
            return function () {
                LineItem.removeAllActive();
                // FlowDesigner.flowEditor.show = false;
                self.active === false && (self.active = true);
                if (FlowDesigner.CURRENT_SELECT_TYPE === 'transition') {
                    var arr = Tips.TransitionItems || [];
                    // 是否连接自己
                    if (self === Tips.TransitionItems[0]) {
                        self.active = false;
                        // FlowDesigner.flowEditor.show = true;
                    }
                    else {
                        Tips.TransitionItems = arr.concat([self]);
                    }
                    if (Tips.TransitionItems.length === 2) {
                        var lineItem = new LineItem({
                            startNode: Tips.TransitionItems[0].rectNode,
                            endNode: Tips.TransitionItems[1].rectNode,
                            container: d.query('#design-canvas')
                        });
                        FlowDesigner.removeAllActive();
                        // FlowDesigner.flowEditor.show = false;
                        lineItem.line.attr({
                            stroke: '#005bac'
                        });
                        lineItem.active = true;
                        var relationsArr = Tips.TransitionItems[0].relations || [], lineItems = Tips.TransitionItems[0].lineItems || [], allLineItems = FlowDesigner.AllLineItems || [];
                        FlowDesigner.AllLineItems = allLineItems.concat([lineItem]);
                        Tips.TransitionItems[0].relations = relationsArr.concat([Tips.TransitionItems[1]]);
                        Tips.TransitionItems[0].lineItems = lineItems.concat([lineItem]);
                        Tips.TransitionItems = [];
                    }
                    FlowDesigner.CURRENT_SELECT_TYPE = '';
                    Tips.removeActive();
                }
            };
        };
        FlowItem.prototype.dblclickHandler = function () {
            var self = this;
            return function () {
                // 双击节点进行编辑属性时，flowEditor的第一个属性获得焦点，并成为可编辑状态
                if (self.isStart || self.isEnd) {
                    return;
                }
                var input = document.createElement("input"), attr = d.queryAll('div', self.flowEditor.wrapper)[1];
                d.append(self.flowEditor.wrapper, input);
                input.value = attr.textContent;
                attr.textContent = '';
                input.focus();
                d.on(input, 'blur', function (focusEvent) {
                    // 失去焦点时，将input移除并将input的值更新到流程编辑的属性和节点的文本上
                    attr.textContent = input.value;
                    self.wrapper.textContent = input.value;
                    d.remove(input);
                });
            };
        };
        FlowItem.prototype.draggerStartHandler = function () {
            var _this = this;
            return function () {
                LineItem.removeAllActive();
                // FlowDesigner.flowEditor.show = false;
                if (_this.active !== true) {
                    FlowItem.removeAllActiveClass();
                    _this.active = true;
                }
                this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
                this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
                var diamondArr = ['decision', 'fork', 'join'];
                if (diamondArr.indexOf(_this.para.type) >= 0) {
                    this.transform('r0');
                }
                this.animate({ "fill-opacity": .2 }, 500);
            };
        };
        FlowItem.prototype.draggerMoveHandler = function () {
            var _this = this;
            return function (dx, dy) {
                if (this.type !== 'rect') {
                    var att = { cx: this.ox + dx, cy: this.oy + dy };
                    this.attr(att);
                    _this.wrapper.style.top = (this.oy - 20 + dy) + 'px';
                    _this.wrapper.style.left = (this.ox - 20 + dx) + 'px';
                }
                else {
                    var att = { x: this.ox + dx, y: this.oy + dy };
                    this.attr(att);
                    _this.wrapper.style.top = this.oy + dy + 'px';
                    _this.wrapper.style.left = this.ox + dx + 'px';
                }
                this.x = this.ox + dx;
                this.y = this.oy + dy;
                // 移动flow-item
                if (tools.isNotEmpty(FlowDesigner.connections)) {
                    for (var i = FlowDesigner.connections.length; i--; i >= 0) {
                        FlowDesigner.PAPER.connection(FlowDesigner.connections[i]);
                    }
                }
                if (tools.isNotEmpty(FlowDesigner.AllLineItems)) {
                    for (var i = 0; i < FlowDesigner.AllLineItems.length; i++) {
                        FlowDesigner.AllLineItems[i].setTextWrapperPosition();
                    }
                }
            };
        };
        FlowItem.prototype.draggerEndHandler = function () {
            var _this = this;
            return function () {
                var diamondArr = ['decision', 'fork', 'join'];
                if (diamondArr.indexOf(_this.para.type) >= 0) {
                    this.transform('r45');
                }
                this.animate({ "fill-opacity": 0 }, 500);
            };
        };
        // 计算文本内容的宽高
        FlowItem.prototype.calcWidthAndHeight = function () {
            var style = window.getComputedStyle(this.wrapper), widthStr = style.width, heightStr = style.height;
            return {
                width: Number(widthStr.slice(0, widthStr.length - 2)),
                height: Number(heightStr.slice(0, heightStr.length - 2))
            };
        };
        // 默认的样式
        FlowItem.prototype.getDefaultAttr = function (x, y) {
            if (this.isStart === true || this.isEnd === true) {
                return {
                    stroke: 'none',
                    fill: '#ffffff',
                    "fill-opacity": 0,
                    cx: x,
                    cy: y
                };
            }
            else {
                return {
                    stroke: 'none',
                    fill: '#ffffff',
                    "fill-opacity": 0,
                    x: x,
                    y: y
                };
            }
        };
        // 移除所有 flow-item 的 active 样式
        FlowItem.removeAllActiveClass = function () {
            // FlowDesigner.flowEditor.show = false;
            d.queryAll('.flow-item').forEach(function (item) {
                item.classList.remove('active');
                item.classList.remove('active');
            });
            var arr = FlowDesigner.ALLITEMS || [];
            arr.forEach(function (item) {
                item._active = false;
                item.flowEditor.show = false;
            });
        };
        Object.defineProperty(FlowItem.prototype, "active", {
            get: function () {
                return this._active;
            },
            set: function (active) {
                this.wrapper.classList.toggle('active', active);
                this._active = active;
                this.flowEditor.show = active;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "isStart", {
            get: function () {
                return this._isStart;
            },
            set: function (isStart) {
                this._isStart = isStart;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "isEnd", {
            get: function () {
                return this._isEnd;
            },
            set: function (isEnd) {
                this._isEnd = isEnd;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlowItem.prototype, "flowEditor", {
            get: function () {
                return this._flowEditor;
            },
            set: function (flowEditor) {
                this._flowEditor = flowEditor;
            },
            enumerable: true,
            configurable: true
        });
        FlowItem.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return FlowItem;
    }(Component));
    exports.FlowItem = FlowItem;
    var LineItem = /** @class */ (function (_super) {
        __extends(LineItem, _super);
        function LineItem(para) {
            var _this_1 = _super.call(this, para) || this;
            _this_1.initEvents = (function () {
                var clickWrapper = function () {
                    if (_this_1.active === false) {
                        FlowDesigner.removeAllActive();
                        _this_1.line.attr({
                            stroke: '#005bac'
                        });
                        _this_1.active = true;
                    }
                };
                return {
                    on: function () {
                        d.on(_this_1.wrapper, 'click', clickWrapper);
                    },
                    off: function () {
                        d.off(_this_1.wrapper, 'click', clickWrapper);
                    }
                };
            })();
            var arr = FlowDesigner.connections || [];
            var line = FlowDesigner.PAPER.connection(para.startNode, para.endNode);
            FlowDesigner.connections = arr.concat([line]);
            _this_1.line = line.line;
            _this_1.wrapper.innerText = '';
            _this_1.setTextWrapperPosition();
            var _this = _this_1;
            line.line.click(function () {
                if (_this.active === false) {
                    FlowDesigner.removeAllActive();
                    _this.line.attr({
                        stroke: '#005bac'
                    });
                    _this.active = true;
                }
            });
            _this_1.flowEditor = new FlowEditor({
                type: 'line',
                container: d.query('#design-canvas')
            });
            _this_1.initEvents.on();
            return _this_1;
        }
        LineItem.prototype.wrapperInit = function (para) {
            return h("div", { className: "lineItem" });
        };
        Object.defineProperty(LineItem.prototype, "line", {
            get: function () {
                return this._line;
            },
            set: function (line) {
                this._line = line;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LineItem.prototype, "flowEditor", {
            get: function () {
                return this._flowEditor;
            },
            set: function (flowEditor) {
                this._flowEditor = flowEditor;
            },
            enumerable: true,
            configurable: true
        });
        LineItem.prototype.setTextWrapperPosition = function () {
            var path = this.line.attrs.path, x1 = path[0][1], y1 = path[0][2], x2 = path[1][5], y2 = path[1][6];
            var style = window.getComputedStyle(this.wrapper), widthStr = style.width, heightStr = style.height, width = Number(widthStr.slice(0, widthStr.length - 2)), height = Number(heightStr.slice(0, heightStr.length - 2));
            this.wrapper.style.left = x1 + (x2 - x1) / 2 - width / 2 + 'px';
            this.wrapper.style.top = y1 + (y2 - y1) / 2 - height / 2 + 'px';
        };
        LineItem.removeAllActive = function () {
            // FlowDesigner.flowEditor.show = false;
            var arr = FlowDesigner.AllLineItems || [];
            arr.forEach(function (item) {
                item.line.attr({
                    stroke: '#b6d1e0'
                });
                item.active = false;
                item.flowEditor.show = false;
            });
        };
        Object.defineProperty(LineItem.prototype, "active", {
            get: function () {
                return this._active;
            },
            set: function (active) {
                this.flowEditor.show = active;
                this._active = active;
            },
            enumerable: true,
            configurable: true
        });
        LineItem.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return LineItem;
    }(Component));
    var Tips = /** @class */ (function (_super) {
        __extends(Tips, _super);
        function Tips(para) {
            var _this_1 = _super.call(this, para) || this;
            _this_1.initEvents = (function () {
                var selectItem = function (e) {
                    var movefollow = h("span", { className: "move-follow" });
                    movefollow.innerHTML = d.closest(e.target, '.drag-item').innerHTML;
                    movefollow.style.left = e.clientX + 12 + 'px';
                    movefollow.style.top = e.clientY + 12 + 'px';
                    document.body.appendChild(movefollow);
                    setActive(d.closest(e.target, '.tip-item-inner'));
                    Tips.TransitionItems = [];
                    var selectItemMove = tools.pattern.throttling(function (moveEvent) {
                        movefollow.style.left = moveEvent.clientX + 12 + 'px';
                        movefollow.style.top = moveEvent.clientY + 12 + 'px';
                    }, 10);
                    d.on(document, 'mousemove', selectItemMove);
                    var selectItemMoveUp = function (moveUpEvent) {
                        document.body.removeChild(movefollow);
                        // 画对应的圆
                        if (moveUpEvent.target.nodeName === 'svg') {
                            // FlowDesigner.CURRENT_SELECT_TYPE = d.closest(e.target, '.drag-item').dataset.name;
                            FlowDesigner.CURRENT_SELECT_TYPE = '';
                            var top_1 = Number(tools.offset.top(d.query('#design-canvas'))), left = Number(tools.offset.left(d.query('#design-canvas')));
                            var flowItem = new FlowItem({
                                type: d.closest(e.target, '.drag-item').dataset.name,
                                text: '',
                                position: {
                                    x: moveUpEvent.clientX - left + 15,
                                    y: moveUpEvent.clientY - top_1 + 15
                                },
                                container: d.query('#design-canvas')
                            });
                            var arr = FlowDesigner.ALLITEMS || [];
                            FlowDesigner.ALLITEMS = arr.concat([flowItem]);
                            FlowDesigner.removeAllActive();
                            flowItem.active = true;
                        }
                        d.off(document, 'mousemove', selectItemMove);
                        d.off(document, 'mouseup', selectItemMoveUp);
                    };
                    d.on(document, 'mouseup', selectItemMoveUp);
                };
                var clickItemHandler = function (e) {
                    FlowDesigner.CURRENT_SELECT_TYPE = d.closest(e.target, '.click-item').dataset.name;
                    setActive(d.closest(e.target, '.tip-item-inner'));
                    Tips.TransitionItems = [];
                    if (FlowDesigner.CURRENT_SELECT_TYPE === 'transition') {
                        if (tools.isNotEmpty(FlowDesigner.ALLITEMS)) {
                            FlowDesigner.ALLITEMS.forEach(function (item) {
                                item.active === true && (Tips.TransitionItems = [item]);
                            });
                        }
                    }
                };
                var setActive = function (target) {
                    d.queryAll('.tip-item-inner').forEach(function (tip) {
                        tip.classList.remove('active');
                    });
                    target.classList.add('active');
                };
                return {
                    on: function () {
                        d.on(_this_1.wrapper, 'mousedown', '.drag-item', selectItem);
                        d.on(_this_1.wrapper, 'click', '.click-item', clickItemHandler);
                    },
                    off: function () {
                        d.off(_this_1.wrapper, 'mousedown', '.drag-item', selectItem);
                        d.off(_this_1.wrapper, 'click', '.click-item', clickItemHandler);
                    }
                };
            })();
            _this_1.initEvents.on();
            return _this_1;
        }
        Tips.prototype.wrapperInit = function (para) {
            return h("div", { className: "tips" },
                h("div", { className: "tip-header" }, "\u5DE5\u5177\u96C6"),
                h("div", { className: "tip-items" },
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner", id: "save" },
                            h("i", { className: "appcommon app-baocun1" }),
                            "\u4FDD\u5B58")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner", id: "otherSave" },
                            h("i", { className: "appcommon app-baocun1" }),
                            "\u53E6\u5B58\u4E3A")),
                    h("div", { className: "tip-line" }),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner click-item", "data-name": "select" },
                            h("i", { className: "appcommon app-Select" }),
                            "Select")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner click-item", "data-name": "transition" },
                            h("i", { className: "appcommon app-transition" }),
                            "Transition")),
                    h("div", { className: "tip-line" }),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner drag-item", "data-name": "start" },
                            h("i", { className: "appcommon app-start" }),
                            "Start")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner drag-item", "data-name": "end" },
                            h("i", { className: "appcommon app-end" }),
                            "End")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner drag-item task-item", "data-name": "task" },
                            h("i", { className: "appcommon app-task" }),
                            "task")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner drag-item", "data-name": "custom" },
                            h("i", { className: "appcommon app-custom" }),
                            "custom")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner drag-item", "data-name": "subprocess" },
                            h("i", { className: "appcommon app-subprocess" }),
                            "subprocess")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner drag-item", "data-name": "decision" },
                            h("i", { className: "appcommon app-decision1" }),
                            "decision")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner drag-item", "data-name": "fork" },
                            h("i", { className: "appcommon app-fork" }),
                            "fork")),
                    h("div", { className: "tip-item" },
                        h("div", { className: "tip-item-inner drag-item", "data-name": "join" },
                            h("i", { className: "appcommon app-join" }),
                            "join"))));
        };
        // 移除所有item的active效果
        Tips.removeActive = function () {
            d.queryAll('.tip-item-inner').forEach(function (tip) {
                tip.classList.remove('active');
            });
        };
        Tips.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.initEvents.off();
        };
        return Tips;
    }(Component));
    var FlowEditor = /** @class */ (function (_super) {
        __extends(FlowEditor, _super);
        function FlowEditor(para) {
            return _super.call(this, para) || this;
        }
        FlowEditor.prototype.wrapperInit = function (para) {
            return h("div", { className: "flow-editor" },
                h("div", { className: "tip-header" }, "\u5C5E\u6027"),
                h("div", null, para.type));
        };
        Object.defineProperty(FlowEditor.prototype, "show", {
            get: function () {
                return this._show;
            },
            set: function (show) {
                this._show = show;
                this.wrapper.classList.toggle('hide', !show);
            },
            enumerable: true,
            configurable: true
        });
        return FlowEditor;
    }(Component));
});

/// <amd-module name="FlowEngine"/>
define("FlowEngine", ["require", "exports", "BasicPage", "FlowDesigner", "Button"], function (require, exports, basicPage_1, FlowDesigner_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FlowEngine = /** @class */ (function (_super) {
        __extends(FlowEngine, _super);
        function FlowEngine(para) {
            var _this = _super.call(this, para) || this;
            new Button_1.Button({
                content: '流程设计',
                container: para.dom,
                onClick: function () {
                    new FlowDesigner_1.FlowDesigner();
                }
            });
            return _this;
        }
        return FlowEngine;
    }(basicPage_1.default));
    exports.FlowEngine = FlowEngine;
});

define("FlowListPC", ["require", "exports", "BasicPage", "newTableModule", "Tab", "BwRule"], function (require, exports, basicPage_1, newTableModule_1, tab_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var FlowListPC = /** @class */ (function (_super) {
        __extends(FlowListPC, _super);
        function FlowListPC(para) {
            var _this = _super.call(this, para) || this;
            _this.tableUIUrls = [];
            _this.subTables = {};
            if (tools.isNotEmpty(para.elements)) {
                var elements = para.elements, tabsTitle_1 = [];
                elements.forEach(function (ele) {
                    _this.tableUIUrls.push(tools.url.addObj(BW.CONF.siteUrl + ele.menuPath.dataAddr, {
                        output: 'json'
                    }));
                    tabsTitle_1.push(ele.menuName);
                });
                var tabWrapper = para.dom || document.body, tabs = [];
                var tab_2 = new tab_1.Tab({
                    panelParent: tabWrapper,
                    tabParent: tabWrapper,
                    tabs: tabs,
                    onClick: function (index) {
                        if (!tools.isNotEmpty(_this.subTables[index])) {
                            // 表格不存在
                            BwRule_1.BwRule.Ajax.fetch(_this.tableUIUrls[index]).then(function (_a) {
                                var response = _a.response;
                                var tabEl = d.query(".tab-pane[data-index=\"" + index + "\"]", tab_2.getPanel());
                                _this.subTables[index] = new newTableModule_1.NewTableModule({
                                    bwEl: response.body.elements[0],
                                    container: tabEl
                                });
                            });
                        }
                        else {
                            // 表格存在 刷新并显示
                            // this.subTables[index].refresh().catch();
                        }
                    }
                });
                tabsTitle_1.forEach(function (sub) {
                    tab_2.addTab([{
                            title: sub,
                            dom: null
                        }]);
                });
                tab_2.active(0);
            }
            return _this;
        }
        return FlowListPC;
    }(basicPage_1.default));
    exports.FlowListPC = FlowListPC;
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
