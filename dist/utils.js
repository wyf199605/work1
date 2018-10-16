define("BarCode", ["require", "exports", "JsBarcode"], function (require, exports, JsBarcode) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-dependency path="JsBarcode" name="JsBarcode"/>
    var BarCode = /** @class */ (function () {
        function BarCode(svgDom, loc, sty) {
            this.init();
            this.draw(svgDom, loc, sty);
        }
        BarCode.prototype.init = function () {
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.id = 'tempSvg';
            document.body.appendChild(this.svg);
        };
        BarCode.prototype.draw = function (svgDom, loc, sty) {
            JsBarcode("#tempSvg", sty.codeData, {
                lineColor: "#000000",
                //width: (loc.w-88)/68+1,
                width: sty.codeType === 3 ? 2 : 1,
                height: loc.h,
                margin: 0,
                displayValue: false,
                format: BarCode.CodeType[sty.codeType]
            });
            this.svg.setAttribute('x', "" + loc.x);
            this.svg.setAttribute('y', "" + loc.y);
            document.body.removeChild(this.svg);
            svgDom.appendChild(this.svg);
        };
        BarCode.CodeType = {
            0: 'ITF',
            3: 'CODE39',
            4: 'CODE39',
            5: 'CODE128A',
            6: 'CODE128B',
            7: 'CODE128C',
        };
        return BarCode;
    }());
    exports.BarCode = BarCode;
});

define("Draw", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Draw = /** @class */ (function () {
        function Draw(can) {
            this.shapeKindFun = (function (self) {
                var arr = [];
                arr[Draw.graphKind.rectangle] = function (ctx, loc, sty) {
                    ctx.save();
                    if (sty.angle) {
                        var rectCenterPoint = void 0;
                        loc.h ? rectCenterPoint = { x: loc.x + loc.w / 2, y: loc.y + loc.h / 2 } : rectCenterPoint = { x: loc.x + loc.w / 2, y: loc.y + loc.w / 2 };
                        ctx.translate(rectCenterPoint.x, rectCenterPoint.y);
                        ctx.rotate(sty.angle);
                        ctx.translate(-rectCenterPoint.x, -rectCenterPoint.y);
                    }
                    if (sty.penStyle == 6) {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + sty.penWidth, loc.y + sty.penWidth);
                        ctx.lineTo(loc.x + loc.w - sty.penWidth, loc.y + sty.penWidth);
                        loc.h ? ctx.lineTo(loc.x + loc.w - sty.penWidth, loc.y + loc.h - sty.penWidth) : ctx.lineTo(loc.x + loc.w - sty.penWidth, loc.y + loc.w - sty.penWidth);
                        loc.h ? ctx.lineTo(loc.x + sty.penWidth, loc.y + loc.h - sty.penWidth) : ctx.lineTo(loc.x + sty.penWidth, loc.y + loc.w - sty.penWidth);
                        ctx.lineTo(loc.x + sty.penWidth, loc.y + sty.penWidth);
                        Draw.brushStyleFun.brush(ctx, sty);
                        ctx.lineWidth = 1;
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(loc.x, loc.y);
                        ctx.lineTo(loc.x + loc.w, loc.y);
                        ctx.lineTo(loc.x + loc.w, loc.y + loc.h);
                        ctx.lineTo(loc.x, loc.y + loc.h);
                        ctx.lineTo(loc.x, loc.y);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    else {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + sty.penWidth / 2, loc.y + sty.penWidth / 2);
                        ctx.lineTo(loc.x + loc.w - sty.penWidth / 2, loc.y + sty.penWidth / 2);
                        loc.h ? ctx.lineTo(loc.x + loc.w - sty.penWidth / 2, loc.y + loc.h - sty.penWidth / 2) : ctx.lineTo(loc.x + loc.w - sty.penWidth / 2, loc.y + loc.w - sty.penWidth / 2);
                        loc.h ? ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + loc.h - sty.penWidth / 2) : ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + loc.w - sty.penWidth / 2);
                        ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + sty.penWidth / 2);
                        Draw.brushStyleFun.brush(ctx, sty);
                        ctx.fill();
                        ctx.stroke();
                    }
                    ctx.restore();
                };
                arr[Draw.graphKind.circle] = function (ctx, loc, sty) {
                    ctx.save();
                    if (sty.angle) {
                        var rectCenterPoint = void 0;
                        rectCenterPoint = { x: loc.x, y: loc.y };
                        ctx.translate(rectCenterPoint.x, rectCenterPoint.y);
                        ctx.rotate(sty.angle);
                        ctx.translate(-rectCenterPoint.x, -rectCenterPoint.y);
                    }
                    if (loc.h) {
                        if (sty.penStyle == 6) {
                            ctx.save();
                            var r = (loc.w > loc.h) ? loc.w : loc.h;
                            var ratioX = loc.w / r;
                            var ratioY = loc.h / r;
                            ctx.scale(ratioX, ratioY);
                            ctx.beginPath();
                            ctx.arc(loc.x / ratioX, loc.y / ratioY, r - sty.penWidth, 0, 2 * Math.PI, false);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.lineWidth = 1;
                            ctx.fill();
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.arc(loc.x / ratioX, loc.y / ratioY, r, 0, 2 * Math.PI, false);
                            ctx.stroke();
                            ctx.restore();
                        }
                        else {
                            ctx.save();
                            var r = (loc.w > loc.h) ? loc.w : loc.h;
                            var ratioX = loc.w / r;
                            var ratioY = loc.h / r;
                            ctx.scale(ratioX, ratioY);
                            ctx.beginPath();
                            ctx.arc(loc.x / ratioX, loc.y / ratioY, r - sty.penWidth / 2, 0, 2 * Math.PI, false);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.fill();
                            ctx.stroke();
                            ctx.restore();
                        }
                    }
                    else {
                        if (sty.penStyle == 6) {
                            ctx.beginPath();
                            ctx.arc(loc.x, loc.y, loc.w - sty.penWidth, 0, 2 * Math.PI);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.lineWidth = 1;
                            ctx.fill();
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.arc(loc.x, loc.y, loc.w, 0, 2 * Math.PI);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                        else {
                            ctx.beginPath();
                            ctx.arc(loc.x, loc.y, loc.w - sty.penWidth / 2, 0, 2 * Math.PI);
                            Draw.brushStyleFun.brush(ctx, sty);
                            ctx.fill();
                            ctx.stroke();
                        }
                    }
                    ctx.restore();
                };
                arr[Draw.graphKind.verticalLine] = function (ctx, loc, sty) {
                    ctx.save();
                    if (sty.penStyle == 6) {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + 0.5, loc.y + 0.5);
                        ctx.lineTo(loc.x + sty.penWidth - 0.5, loc.y + 0.5);
                        ctx.lineTo(loc.x + sty.penWidth - 0.5, loc.y + loc.h - 0.5);
                        ctx.lineTo(loc.x + 0.5, loc.y + loc.h - 0.5);
                        ctx.lineTo(loc.x + 0.5, loc.y + 0.5);
                        Draw.brushStyleFun.brushLine(ctx, sty);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    else {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + sty.penWidth / 2, loc.y);
                        ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + loc.h);
                        Draw.brushStyleFun.brushLine(ctx, sty);
                        ctx.stroke();
                    }
                    ctx.restore();
                };
                arr[Draw.graphKind.line] = function (ctx, loc, sty) {
                    ctx.save();
                    if (sty.penStyle == 6) {
                        ctx.beginPath();
                        ctx.moveTo(loc.x + 0.5, loc.y + 0.5);
                        ctx.lineTo(loc.x + loc.w - 0.5, loc.y + 0.5);
                        ctx.lineTo(loc.x + loc.w - 0.5, loc.y + sty.penWidth - 0.5);
                        ctx.lineTo(loc.x + 0.5, loc.y + sty.penWidth - 0.5);
                        ctx.lineTo(loc.x + 0.5, loc.y + 0.5);
                        Draw.brushStyleFun.brushLine(ctx, sty);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    else {
                        ctx.beginPath();
                        ctx.moveTo(loc.x, loc.y + sty.penWidth / 2);
                        ctx.lineTo(loc.x + loc.w, loc.y + sty.penWidth / 2);
                        Draw.brushStyleFun.brushLine(ctx, sty);
                        ctx.stroke();
                    }
                    ctx.restore();
                };
                arr[Draw.graphKind.upAndDownParallelLine] = function (ctx, loc, sty) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(loc.x, loc.y + sty.penWidth / 2);
                    ctx.lineTo(loc.x + loc.w, loc.y + sty.penWidth / 2);
                    ctx.moveTo(loc.x, loc.y + sty.penWidth / 2 + loc.h);
                    ctx.lineTo(loc.x + loc.w, loc.y + sty.penWidth / 2 + loc.h);
                    Draw.brushStyleFun.brushLine(ctx, sty);
                    ctx.stroke();
                    ctx.restore();
                };
                arr[Draw.graphKind.leftAndRightParallelLine] = function (ctx, loc, sty) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(loc.x + sty.penWidth / 2, loc.y);
                    ctx.lineTo(loc.x + sty.penWidth / 2, loc.y + loc.h);
                    ctx.moveTo(loc.x + sty.penWidth / 2 + loc.w, loc.y);
                    ctx.lineTo(loc.x + sty.penWidth / 2 + loc.w, loc.y + loc.h);
                    Draw.brushStyleFun.brushLine(ctx, sty);
                    ctx.stroke();
                    ctx.restore();
                };
                return arr;
            }(this));
            this.textStyleFun = (function (self) {
                var arr = [];
                arr['backColor'] = function (tempCtx, loc, sty) {
                    tempCtx.save();
                    sty.transparent === true ? tempCtx.globalAlpha = 0 : '';
                    sty.transparent === false ? tempCtx.globalAlpha = 1 : '';
                    typeof sty.transparent == 'number' ? tempCtx.globalAlpha = Number(sty.transparent) : '';
                    tempCtx.fillStyle = '#' + sty['backColor'].toString(16);
                    tempCtx.fillRect(0, 0, loc.w, loc.h);
                    tempCtx.restore();
                };
                arr['font'] = function (tempCtx, loc, sty) {
                    tempCtx.fillStyle = '#' + sty['font']['fontColor'].toString(16);
                    if (sty['font']['fontStyle'] === 1) {
                        tempCtx.font = "bolder " + sty['font']['fontSize'] + "px" + " " + 'Source Han Sans CN';
                    }
                    else {
                        tempCtx.font = sty['font']['fontSize'] + "px" + " " + 'Source Han Sans CN';
                    }
                };
                arr['forFill'] = function () {
                };
                arr['stretch'] = function (tempCtx, loc, sty) {
                    if (!sty['autoSize'] && sty['stretch']) {
                        tempCtx.font = loc.h + "px" + " " + sty['font']['fontName'];
                    }
                };
                return arr;
            }(this));
            this.contains = function (key) {
                var tempArr = ['dataName', 'alignment', 'autoSize', 'transparent', 'wrapping'];
                var index = tempArr.length;
                while (index--) {
                    if (tempArr[index] === key) {
                        return true;
                    }
                }
                return false;
            };
            this.init(can);
        }
        Draw.prototype.init = function (can) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = can.width * window.devicePixelRatio;
            this.canvas.height = can.height * window.devicePixelRatio;
            this.canvas.style.width = can.width + "px";
            this.canvas.style.height = can.height + "px";
            this.ctx = this.canvas.getContext('2d');
        };
        Draw.prototype.graph = function (shapeKind, loc, sty) {
            sty = G.tools.obj.merge(Draw.defaultPara.shapeDefaultPara, sty);
            this.shapeKindFun[shapeKind].call(this, this.ctx, loc, sty); //根据图形字段调用相应图形函数
        };
        Draw.prototype.text = function (data, loc, sty) {
            if (data) {
                data = data.replace(/null/g, "");
                sty = G.tools.obj.merge(true, Draw.defaultPara.textDefaultPara, sty);
                if (loc.w && loc.h) {
                    var tempCanvas = document.createElement("canvas"); //创建一个临时canvas保存字体的背景以及字体的内容
                    var tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = loc.w;
                    tempCanvas.height = loc.h;
                    for (var key in sty) {
                        if (!this.contains(key))
                            this.textStyleFun[key].call(this, tempCtx, loc, sty);
                    }
                    tempCtx.textBaseline = "top"; //设置文字的基线为top
                    this.drawText(data, tempCtx, loc, sty); //绘制文字
                    var imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    this.ctx.putImageData(imgData, loc.x, loc.y);
                }
                else {
                    this.ctx.save();
                    for (var key in sty) {
                        if (!this.contains(key))
                            this.textStyleFun[key].call(this, this.ctx, loc, sty);
                    }
                    this.ctx.textBaseline = "top"; //设置文字的基线为top
                    this.ctx.fillText(data, loc.x, loc.y);
                    this.ctx.restore();
                }
            }
        };
        Draw.prototype.getPng = function () {
            return this.canvas.toDataURL("image/png");
        };
        Draw.prototype.getCanvasCt = function () {
            return this.ctx;
        };
        Draw.prototype.getCanvas = function () {
            return this.canvas;
        };
        Draw.prototype.drawText = function (data, tempCtx, loc, sty) {
            /*传进alignment需要根据居中，左对齐，右对齐来相应的调整文字显示的位置
             *如果autoSize为false 且 stretch为true则自动将文字填充为width和height的大小，
             *此时需要调整文字显示位置不为居中而是从0,0开始显示
            * */
            //debugger
            if (sty['wrapping'] && (tempCtx.measureText(data).width) > loc.w) {
                var tempTextArr = data.split("\r\n");
                if (tempTextArr.length > 1) {
                    for (var j = 0; j < tempTextArr.length; j++) {
                        tempCtx.fillText(tempTextArr[j], 0, (j * sty.font.fontSize) + 5 * j);
                    }
                }
                else {
                    var wrapText = tempCtx.measureText(data).width;
                    var tempText = [];
                    var tempLen = Math.floor((loc.w / wrapText) * data.length);
                    var i = 0;
                    while (tempLen == Math.floor((loc.w / wrapText) * data.length)) {
                        var tempWrapText = data.substring(i * Math.floor((loc.w / wrapText) * data.length), (i + 1) * Math.floor((loc.w / wrapText) * data.length));
                        tempText.push(tempWrapText);
                        i++;
                        tempLen = tempWrapText.length;
                    }
                    tempCtx.textAlign = Draw.alignMent[0];
                    for (var j = 0; j < tempText.length; j++) {
                        tempCtx.fillText(tempText[j], 0, (j * sty.font.fontSize) + 3 * j);
                    }
                }
            }
            else {
                var tempTextArr = data.split("\r\n");
                if (tempTextArr.length >= 1) {
                    for (var j = 0; j < tempTextArr.length; j++) {
                        tempCtx.fillText(tempTextArr[j], 0, (j * sty.font.fontSize) + 5 * j);
                    }
                }
                else {
                    tempCtx.textAlign = Draw.alignMent[sty["alignment"]];
                    sty['alignment'] == 0 ?
                        loc.w && loc.h ? tempCtx.fillText(data, 0, (!sty['autoSize'] && sty['stretch']) ? 0 : (loc.h - sty.font.fontSize) / 2) : tempCtx.fillText(data, 0, 0) : "";
                    sty['alignment'] == 1 ?
                        loc.w && loc.h ? tempCtx.fillText(data, 0 + loc.w, (!sty['autoSize'] && sty['stretch']) ? 0 : (loc.h - sty.font.fontSize) / 2) : tempCtx.fillText(data, 0, 0) : "";
                    sty['alignment'] == 2 ?
                        loc.w && loc.h ? tempCtx.fillText(data, 0 + loc.w / 2, (!sty['autoSize'] && sty['stretch']) ? 0 : (loc.h - sty.font.fontSize) / 2) : tempCtx.fillText(data, 0, 0) : "";
                }
            }
        };
        Draw.toCanvas = function (dom) {
            var beginData = 'data:image/svg+xml,' + '<svg xmlns="http://www.w3.org/2000/svg" style="top:100px;" width="' + dom.offsetWidth + '" height="' + dom.offsetHeight + '">' +
                '<foreignObject width="100%" height="100%">' +
                '<div xmlns="http://www.w3.org/1999/xhtml">';
            var endData = '</div>' +
                '</foreignObject>' +
                '</svg>';
            var data = '';
            var innerHtml = dom.innerHTML;
            data = beginData + innerHtml + +111111111111 + endData;
            var canvas = document.createElement("canvas");
            canvas.width = dom.offsetWidth ? dom.offsetWidth : 100;
            canvas.height = dom.offsetHeight ? dom.offsetHeight : 100;
            var ctx = canvas.getContext('2d');
            var img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 0, 0);
                console.log(canvas.toDataURL("image/png"));
            };
            img.onerror = function () {
                console.log("error");
            };
            img.src = data;
            return canvas;
        };
        Draw.defaultPara = {
            textDefaultPara: {
                alignment: 0,
                backColor: 16777215,
                font: { fontName: '黑体', fontSize: 7, fontColor: 0, fontStyle: 0 },
                forFill: false,
                autoSize: true,
                stretch: true,
                transparent: false,
                wrapping: false
            },
            shapeDefaultPara: {
                brushColor: 0,
                brushStyle: 0,
                penColor: 0,
                penStyle: 0,
                penWidth: 1 //默认画笔宽度 1
            }
        };
        Draw.brushStyleFun = {
            brush: function (ctx, sty) {
                var p = document.createElement("canvas");
                p.width = 16;
                p.height = 8;
                var pctx = p.getContext('2d');
                sty.penStyle == 6 ? '' : ctx.setLineDash(Draw.lineStyle[sty.penStyle]);
                pctx.strokeStyle = '#' + sty['brushColor'].toString(16);
                ctx.strokeStyle = '#' + sty['penColor'].toString(16);
                pctx.lineWidth = sty['fillPenWidth'] ? sty['fillPenWidth'] : 1;
                ctx.lineWidth = sty['borderPenWidth'] ? sty['borderPenWidth'] : sty['penWidth'];
                var offset = 16;
                var x0 = 0, y0 = 0, x1 = 0, y1 = 0;
                if (sty.brushStyle == 1) {
                    ctx.fillStyle = "white";
                }
                else if (sty.brushStyle == 2) {
                    p.width = 16;
                    p.height = 6;
                    pctx.strokeStyle = '#' + sty['brushColor'].toString(16);
                    pctx.beginPath();
                    pctx.moveTo(0, 3);
                    pctx.lineTo(16, 3);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 3) {
                    p.width = 6;
                    p.height = 16;
                    pctx.strokeStyle = '#' + sty['brushColor'].toString(16);
                    pctx.beginPath();
                    pctx.moveTo(3, 0);
                    pctx.lineTo(3, 16);
                    pctx.closePath();
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 4) {
                    x0 = -2;
                    x1 = 18;
                    y0 = -1;
                    y1 = 9;
                    pctx.beginPath();
                    pctx.moveTo(x0, y0);
                    pctx.lineTo(x1, y1);
                    pctx.moveTo(x0 - offset, y0);
                    pctx.lineTo(x1 - offset, y1);
                    pctx.moveTo(x0 + offset, y0);
                    pctx.lineTo(x1 + offset, y1);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 5) {
                    x0 = 18;
                    x1 = -2;
                    y0 = -1;
                    y1 = 9;
                    pctx.beginPath();
                    pctx.moveTo(x0, y0);
                    pctx.lineTo(x1, y1);
                    pctx.moveTo(x0 - offset, y0);
                    pctx.lineTo(x1 - offset, y1);
                    pctx.moveTo(x0 + offset, y0);
                    pctx.lineTo(x1 + offset, y1);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 6) {
                    p.width = 10;
                    p.height = 10;
                    pctx.strokeStyle = '#' + sty['brushColor'].toString(16);
                    pctx.beginPath();
                    pctx.moveTo(0, 5);
                    pctx.lineTo(10, 5);
                    pctx.moveTo(5, 0);
                    pctx.lineTo(5, 10);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else if (sty.brushStyle == 7) {
                    x0 = -2;
                    x1 = 18;
                    y0 = -1;
                    y1 = 9;
                    pctx.strokeStyle = '#' + sty['brushColor'].toString(16);
                    pctx.lineWidth = sty['penWidth'];
                    pctx.beginPath();
                    pctx.moveTo(x0, y0);
                    pctx.lineTo(x1, y1);
                    pctx.moveTo(x0 - offset, y0);
                    pctx.lineTo(x1 - offset, y1);
                    pctx.moveTo(x0 + offset, y0);
                    pctx.lineTo(x1 + offset, y1);
                    pctx.stroke();
                    x0 = 18;
                    x1 = -2;
                    y0 = -1;
                    y1 = 9;
                    pctx.beginPath();
                    pctx.moveTo(x0, y0);
                    pctx.lineTo(x1, y1);
                    pctx.moveTo(x0 - offset, y0);
                    pctx.lineTo(x1 - offset, y1);
                    pctx.moveTo(x0 + offset, y0);
                    pctx.lineTo(x1 + offset, y1);
                    pctx.stroke();
                    ctx.fillStyle = ctx.createPattern(p, 'repeat');
                }
                else {
                    ctx.fillStyle = '#' + sty['penColor'].toString(16);
                }
            },
            brushLine: function (ctx, sty) {
                sty.penStyle == 6 ? '' : ctx.setLineDash(Draw.lineStyle[sty.penStyle]);
                ctx.lineWidth = sty.penWidth;
                ctx.strokeStyle = '#' + sty['penColor'].toString(16);
            }
        };
        Draw.lineStyle = {
            0: [],
            1: [5, 5],
            2: [2, 2],
            3: [10, 10, 4, 10],
            4: [30, 10, 4, 10, 4, 10],
            5: [0, 1000] //无
            // 6:透视效果在程序中判断
        };
        Draw.graphKind = {
            rectangle: 0,
            circle: 1,
            verticalLine: 2,
            line: 3,
            upAndDownParallelLine: 4,
            leftAndRightParallelLine: 5 //左右平行线
        };
        Draw.alignMent = {
            0: 'left',
            1: 'right',
            2: 'center' //居中
        };
        return Draw;
    }());
    exports.Draw = Draw;
});

/// <amd-module name="DrawSvg"/>
define("DrawSvg", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DrawSvg = /** @class */ (function () {
        function DrawSvg(para) {
            this.defsColor = []; //填充类型颜色缓存
            this.drawText = (function (self) {
                var drawWHText = function (textDom, data, sty, loc) {
                    textDom.setAttribute('x', "" + loc.x);
                    textDom.setAttribute('y', "" + loc.y);
                    textDom.setAttribute('width', "" + loc.w);
                    textDom.setAttribute('height', "" + loc.h);
                    textDom.setAttribute('dominant-baseline', 'text-before-edge');
                    var tempTextArr = data.split("\r\n"), innerText = '';
                    if (tempTextArr.length > 1) {
                        for (var j = 0; j < tempTextArr.length; j++) {
                            innerText += "<tspan xml:space='preserve' x=\"" + loc.x + "\" dy=\"" + (j * sty.font.fontSize + 3) + "\">" + tempTextArr[j] + "</tspan>";
                        }
                        textDom.innerHTML = innerText;
                    }
                    else {
                        if (data.indexOf(" ") > -1) {
                            data = data.replace(/\s/g, "&ensp;");
                        }
                        textDom.innerHTML = data;
                    }
                };
                var drawNotWHText = function (textDom, data, sty, loc) {
                    textDom.setAttribute('x', "" + loc.x);
                    textDom.setAttribute('y', "" + loc.y);
                    textDom.setAttribute('dominant-baseline', 'text-before-edge');
                    if (data.indexOf(" ") > -1) {
                        data = data.replace(/\s/g, "&ensp;");
                    }
                    textDom.innerHTML = data;
                };
                return { drawWHText: drawWHText, drawNotWHText: drawNotWHText };
            })(this);
            this.textStyleFun = (function (self) {
                var arr = [];
                arr['font'] = function (textDom, sty) {
                    if (sty['font']['fontStyle'] === 1) {
                        textDom.setAttribute('font-weight', "bold");
                    }
                    textDom.setAttribute('font-size', sty.font.fontSize + "px");
                    textDom.setAttribute('font-family', "" + sty.font.fontName);
                    textDom.setAttribute('fill', '#' + sty['font']['fontColor'].toString(16));
                };
                arr['hasWHSty'] = function (textDom, sty, loc) {
                    sty.transparent && textDom.setAttribute('opacity', '0');
                    typeof sty.transparent == 'number' && textDom.setAttribute('opacity', "" + Number(sty.transparent));
                    textDom.setAttribute('style', "text-align:" + DrawSvg.alignMent[sty.alignment] + ";");
                    if (!sty['autoSize'] && sty['stretch']) {
                        textDom.setAttribute('font-size', loc.h + "px");
                    }
                    if (sty['autoSize']) {
                        textDom.setAttribute('width', textDom.innerHTML.length * sty.font.fontSize + "px");
                        textDom.setAttribute('height', sty.font.fontSize + "px");
                    }
                };
                return arr;
            }(this));
            this.shapeKindFun = (function (self) {
                var arr = [];
                arr[DrawSvg.graphKind.rectangle] = function (loc, sty) {
                    var rect = document.createElementNS(DrawSvg.svgUrl, 'rect'), rectStyle, borderDom = null;
                    var fillColor = sty.brushColor ? '#' + sty['brushColor'].toString(16) : 'black';
                    var borderColor = sty.penColor ? '#' + sty['penColor'].toString(16) : 'black';
                    if (!(sty.brushStyle === 0 || sty.brushStyle === 1)) {
                        rectStyle = "fill:url(#" + DrawSvg.fillKindNumber[sty.brushStyle] + fillColor + ");stroke:" + borderColor + ";stroke-width:" + (sty.penStyle === 6 ? 1 : sty.penWidth); //设置边框颜色，填充颜色，边框线条宽度
                    }
                    else {
                        rectStyle = "fill:" + (sty.brushStyle ? 'white' : fillColor) + ";stroke:" + borderColor + ";stroke-width:" + (sty.penStyle === 6 ? 1 : sty.penWidth); //设置边框颜色，填充颜色，边框线条宽度
                    }
                    if (sty.penStyle !== 6) {
                        rect.setAttribute('stroke-dasharray', DrawSvg.lineStyle[sty.penStyle]);
                        rect.setAttribute('width', "" + (loc.w - sty.penWidth));
                        rect.setAttribute('height', "" + (loc.h - sty.penWidth));
                        rect.setAttribute('x', "" + loc.x);
                        rect.setAttribute('y', "" + loc.y);
                    }
                    else {
                        borderDom = document.createElementNS(DrawSvg.svgUrl, 'rect'); //透视边框节点
                        borderDom.setAttribute('width', "" + loc.w);
                        borderDom.setAttribute('height', "" + loc.h);
                        borderDom.setAttribute('x', "" + loc.x);
                        borderDom.setAttribute('y', "" + loc.y);
                        borderDom.setAttribute('style', "fill:white;stroke:" + borderColor + ";stroke-width:1;");
                        rect.setAttribute('width', "" + (loc.w - 2 * sty.penWidth));
                        rect.setAttribute('height', "" + (loc.h - 2 * sty.penWidth));
                        rect.setAttribute('x', "" + (loc.x + sty.penWidth));
                        rect.setAttribute('y', "" + (loc.y + sty.penWidth));
                    }
                    rect.setAttribute('style', rectStyle);
                    borderDom && self.svg.appendChild(borderDom);
                    self.svg.appendChild(rect);
                };
                arr[DrawSvg.graphKind.circle] = function (loc, sty) {
                    var fillColor = sty.brushColor ? '#' + sty['brushColor'].toString(16) : 'black';
                    var borderColor = sty.penColor ? '#' + sty['penColor'].toString(16) : 'black';
                    var circle, circleStyle, borderDom = null;
                    if (!(sty.brushStyle === 0 || sty.brushStyle === 1)) {
                        circleStyle = "fill:url(#" + DrawSvg.fillKindNumber[sty.brushStyle] + fillColor + ");stroke:" + borderColor + ";stroke-width:" + (sty.penStyle === 6 ? 1 : sty.penWidth); //设置边框颜色，填充颜色，边框线条宽度
                    }
                    else {
                        circleStyle = "fill:" + (sty.brushStyle ? 'white' : fillColor) + ";stroke:" + borderColor + ";stroke-width:" + (sty.penStyle === 6 ? 1 : sty.penWidth); //设置边框颜色，填充颜色，边框线条宽度
                    }
                    if (loc.w && loc.h && (loc.w !== loc.h)) {
                        circle = document.createElementNS(DrawSvg.svgUrl, 'ellipse');
                        if (sty.penStyle !== 6) {
                            circle.setAttribute('rx', "" + (loc.w / 2 - sty.penWidth / 2));
                            circle.setAttribute('ry', "" + (loc.h / 2 - sty.penWidth / 2));
                            circle.setAttribute('cx', "" + (loc.x + loc.w / 2));
                            circle.setAttribute('cy', "" + (loc.y + loc.h / 2));
                            circle.setAttribute('stroke-dasharray', DrawSvg.lineStyle[sty.penStyle]);
                        }
                        else {
                            borderDom = document.createElementNS(DrawSvg.svgUrl, 'circle'); //透视边框节点
                            borderDom.setAttribute('rx', "" + loc.w / 2);
                            borderDom.setAttribute('ry', "" + loc.h / 2);
                            borderDom.setAttribute('cx', "" + (loc.x + loc.w / 2));
                            borderDom.setAttribute('cy', "" + (loc.y + loc.h / 2));
                            borderDom.setAttribute('style', "fill:white;stroke:" + borderColor + ";stroke-width:1;");
                            circle.setAttribute('rx', "" + (loc.w / 2 - sty.penWidth));
                            circle.setAttribute('ry', "" + (loc.h / 2 - sty.penWidth));
                            circle.setAttribute('cx', "" + (loc.x + loc.w / 2));
                            circle.setAttribute('cy', "" + (loc.y + loc.h / 2));
                        }
                        circle.setAttribute('style', circleStyle);
                        borderDom && self.svg.appendChild(borderDom);
                        self.svg.appendChild(circle);
                    }
                    else {
                        circle = document.createElementNS(DrawSvg.svgUrl, 'circle');
                        var r = loc.w ? loc.w / 2 : loc.h / 2;
                        if (sty.penStyle !== 6) {
                            circle.setAttribute('r', "" + (r - sty.penWidth / 2));
                            circle.setAttribute('cx', "" + (loc.x + r));
                            circle.setAttribute('cy', "" + (loc.y + r));
                            circle.setAttribute('stroke-dasharray', DrawSvg.lineStyle[sty.penStyle]);
                        }
                        else {
                            borderDom = document.createElementNS(DrawSvg.svgUrl, 'circle'); //透视边框节点
                            borderDom.setAttribute('r', "" + r);
                            borderDom.setAttribute('cx', "" + (loc.x + r));
                            borderDom.setAttribute('cy', "" + (loc.y + r));
                            borderDom.setAttribute('style', "fill:white;stroke:" + borderColor + ";stroke-width:1;");
                            circle.setAttribute('r', "" + (r - sty.penWidth));
                            circle.setAttribute('cx', "" + (loc.x + r));
                            circle.setAttribute('cy', "" + (loc.y + r));
                        }
                    }
                    circle.setAttribute('style', circleStyle);
                    borderDom && self.svg.appendChild(borderDom);
                    self.svg.appendChild(circle);
                };
                arr[DrawSvg.graphKind.verticalLine] = function (loc, sty) {
                    var line = document.createElementNS(DrawSvg.svgUrl, 'line'), lineStyle, borderDom = null;
                    var borderColor = sty.penColor ? '#' + sty['penColor'].toString(16) : 'black';
                    lineStyle = "stroke:" + borderColor + ";stroke-width:" + (sty.penStyle === 6 ? 1 : sty.penWidth); //设置边框颜色，边框线条宽度
                    if (sty.penStyle !== 6) {
                        line.setAttribute('x1', "" + loc.x);
                        line.setAttribute('y1', "" + loc.y);
                        line.setAttribute('x2', "" + loc.x);
                        line.setAttribute('y2', "" + (loc.y + loc.h));
                        line.setAttribute('style', lineStyle);
                        line.setAttribute('stroke-dasharray', DrawSvg.lineStyle[sty.penStyle]);
                    }
                    else {
                        borderDom = document.createElementNS(DrawSvg.svgUrl, 'rect');
                        borderDom.setAttribute('style', "stroke:" + borderColor + ";stroke-width:1;");
                        borderDom.setAttribute('x', "" + loc.x);
                        borderDom.setAttribute('y', "" + loc.y);
                        borderDom.setAttribute('width', "" + sty.penWidth);
                        borderDom.setAttribute('height', "" + loc.h);
                        borderDom.setAttribute('stroke-dasharray', DrawSvg.lineStyle[sty.penStyle]);
                    }
                    self.svg.appendChild(borderDom ? borderDom : line);
                };
                arr[DrawSvg.graphKind.line] = function (loc, sty) {
                    var line = document.createElementNS(DrawSvg.svgUrl, 'line'), lineStyle, borderDom = null;
                    var borderColor = sty.penColor ? '#' + sty['penColor'].toString(16) : 'black';
                    lineStyle = "stroke:" + borderColor + ";stroke-width:" + (sty.penStyle === 6 ? 1 : sty.penWidth); //设置边框颜色，边框线条宽度
                    if (sty.penStyle !== 6) {
                        line.setAttribute('x1', "" + loc.x);
                        line.setAttribute('y1', "" + loc.y);
                        line.setAttribute('x2', "" + (loc.x + loc.w));
                        line.setAttribute('y2', "" + loc.y);
                        line.setAttribute('style', lineStyle);
                        line.setAttribute('stroke-dasharray', DrawSvg.lineStyle[sty.penStyle]);
                    }
                    else {
                        borderDom = document.createElementNS(DrawSvg.svgUrl, 'rect');
                        borderDom.setAttribute('style', "stroke:" + borderColor + ";stroke-width:1;");
                        borderDom.setAttribute('x', "" + loc.x);
                        borderDom.setAttribute('y', "" + loc.y);
                        borderDom.setAttribute('width', "" + loc.w);
                        borderDom.setAttribute('height', "" + sty.penWidth);
                        borderDom.setAttribute('stroke-dasharray', DrawSvg.lineStyle[sty.penStyle]);
                    }
                    self.svg.appendChild(borderDom ? borderDom : line);
                };
                arr[DrawSvg.graphKind.upAndDownParallelLine] = function (loc, sty) {
                    var upLine = document.createElementNS(DrawSvg.svgUrl, 'line'), downLine = document.createElementNS(DrawSvg.svgUrl, 'line'), lineStyle;
                    var borderColor = sty.penColor ? '#' + sty['penColor'].toString(16) : 'black';
                    lineStyle = "stroke:" + borderColor + ";stroke-width:" + sty.penWidth; //设置边框颜色，边框线条宽度
                    upLine.setAttribute('x1', "" + loc.x);
                    upLine.setAttribute('y1', "" + loc.y);
                    upLine.setAttribute('x2', "" + (loc.x + loc.w));
                    upLine.setAttribute('y2', "" + loc.y);
                    upLine.setAttribute('style', "" + lineStyle);
                    downLine.setAttribute('x1', "" + loc.x);
                    downLine.setAttribute('y1', "" + (loc.y + loc.h));
                    downLine.setAttribute('x2', "" + (loc.x + loc.w));
                    downLine.setAttribute('y2', "" + (loc.y + loc.h));
                    downLine.setAttribute('style', "" + lineStyle);
                    self.svg.appendChild(upLine);
                    self.svg.appendChild(downLine);
                };
                arr[DrawSvg.graphKind.leftAndRightParallelLine] = function (loc, sty) {
                    var leftLine = document.createElementNS(DrawSvg.svgUrl, 'line'), rightLine = document.createElementNS(DrawSvg.svgUrl, 'line'), lineStyle;
                    var borderColor = sty.penColor ? '#' + sty['penColor'].toString(16) : 'black';
                    lineStyle = "stroke:" + borderColor + ";stroke-width:" + sty.penWidth; //设置边框颜色，边框线条宽度
                    leftLine.setAttribute('x1', "" + loc.x);
                    leftLine.setAttribute('y1', "" + loc.y);
                    leftLine.setAttribute('x2', "" + loc.x);
                    leftLine.setAttribute('y2', "" + (loc.y + loc.h));
                    leftLine.setAttribute('style', "" + lineStyle);
                    rightLine.setAttribute('x1', "" + (loc.x + loc.w));
                    rightLine.setAttribute('y1', "" + loc.y);
                    rightLine.setAttribute('x2', "" + (loc.x + loc.w));
                    rightLine.setAttribute('y2', "" + (loc.y + loc.h));
                    rightLine.setAttribute('style', "" + lineStyle);
                    self.svg.appendChild(leftLine);
                    self.svg.appendChild(rightLine);
                };
                return arr;
            }(this));
            this.shapeFillStyle = (function () {
                var arr = [];
                arr[DrawSvg.fillKind.shuiping] = function (color, svgDom) {
                    (color === '#0') && (color = 'black');
                    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    defs.innerHTML = " <pattern id=\"shuiping" + color + "\" width=\"5\" height=\"5\" patternUnits=\"userSpaceOnUse\">\n                                        <line x1=\"0\" y1=\"2.5\" x2=\"5\" y2=\"2.5\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                </pattern>";
                    svgDom.appendChild(defs);
                };
                arr[DrawSvg.fillKind.chuizhi] = function (color, svgDom) {
                    (color === '#0') && (color = 'black');
                    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    defs.innerHTML = " <pattern id=\"chuizhi" + color + "\" width=\"5\" height=\"5\" patternUnits=\"userSpaceOnUse\">\n                                    <line x1=\"2.5\" y1=\"0\" x2=\"2.5\" y2=\"5\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                </pattern>";
                    svgDom.appendChild(defs);
                };
                arr[DrawSvg.fillKind.youxie] = function (color, svgDom) {
                    (color === '#0') && (color = 'black');
                    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    defs.innerHTML = " <pattern id=\"youxie" + color + "\" width=\"7\" height=\"7\" patternUnits=\"userSpaceOnUse\">\n                                    <line x1=\"0\" y1=\"0\" x2=\"7\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"-7\" y1=\"0\" x2=\"0\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"7\" y1=\"0\" x2=\"14\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                </pattern>";
                    svgDom.appendChild(defs);
                };
                arr[DrawSvg.fillKind.zuoxie] = function (color, svgDom) {
                    (color === '#0') && (color = 'black');
                    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    defs.innerHTML = "  <pattern id=\"zuoxie" + color + "\" width=\"7\" height=\"7\" patternUnits=\"userSpaceOnUse\">\n                                    <line x1=\"7\" y1=\"0\" x2=\"0\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"0\" y1=\"0\" x2=\"-7\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"14\" y1=\"0\" x2=\"7\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                </pattern>";
                    svgDom.appendChild(defs);
                };
                arr[DrawSvg.fillKind.fangge] = function (color, svgDom) {
                    (color === '#0') && (color = 'black');
                    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    defs.innerHTML = "<pattern id=\"fangge" + color + "\" width=\"5\" height=\"5\" patternUnits=\"userSpaceOnUse\">\n                                <line x1=\"0\" y1=\"2.5\" x2=\"5\" y2=\"2.5\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                <line x1=\"2.5\" y1=\"0\" x2=\"2.5\" y2=\"5\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                            </pattern>";
                    svgDom.appendChild(defs);
                };
                arr[DrawSvg.fillKind.xiefangge] = function (color, svgDom) {
                    (color === '#0') && (color = 'black');
                    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    defs.innerHTML = " <pattern id=\"xiefangge" + color + "\" width=\"7\" height=\"7\" patternUnits=\"userSpaceOnUse\">\n                                    <line x1=\"0\" y1=\"0\" x2=\"7\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"-7\" y1=\"0\" x2=\"0\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"7\" y1=\"0\" x2=\"14\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"7\" y1=\"0\" x2=\"0\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"0\" y1=\"0\" x2=\"-7\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                    <line x1=\"14\" y1=\"0\" x2=\"7\" y2=\"7\"  style=\"stroke:" + color + ";stroke-width:1\" />\n                                </pattern>";
                    svgDom.appendChild(defs);
                };
                return arr;
            })();
            this.init(para);
        }
        DrawSvg.prototype.graph = function (shapeKind, loc, sty) {
            //如果为非实心填充或者空心填充添加图形填充类型
            if (!(sty.brushStyle === 0 || sty.brushStyle === 1)) {
                this.appendDefs(sty);
            }
            this.shapeKindFun[shapeKind].call(this, loc, sty); //根据图形字段调用相应图形函数
        };
        DrawSvg.prototype.text = function (data, loc, sty) {
            data = data + "";
            if (loc.w || loc.h) {
                loc.h === 0 && (loc.h = sty.font.fontSize);
                //如果需要换行则创建换行的标签foreignObject；否则为不自动换行标签text
                var textDom = (sty.wrapping ?
                    document.createElementNS(DrawSvg.svgUrl, 'foreignObject') :
                    document.createElementNS(DrawSvg.svgUrl, 'text'));
                this.drawText.drawWHText(textDom, data, sty, loc);
                this.textStyleFun['font'].call(this, textDom, sty);
                this.textStyleFun['hasWHSty'].call(this, textDom, sty, loc);
                //为有宽高的字设置背景颜色，需要新创建一个矩形作为背景
                /* let fillColor = '#' + sty['backColor'].toString(16);
                 let back = document.createElementNS(DrawSvg.svgUrl,'rect');
                 back.setAttribute('x',`${loc.x}`);
                 back.setAttribute('y',`${loc.y}`);
                 back.setAttribute('width',`${loc.w}`);
                 back.setAttribute('height',`${loc.h}`);
                 back.setAttribute('fill',fillColor);
                 this.svg.appendChild(back);*/
                this.svg.appendChild(textDom);
            }
            else {
                var textDom = document.createElementNS(DrawSvg.svgUrl, 'text');
                this.drawText.drawNotWHText(textDom, data, sty, loc);
                this.textStyleFun['font'].call(this, textDom, sty);
                this.svg.appendChild(textDom);
            }
        };
        DrawSvg.prototype.icon = function (iconKind, loc) {
            this.drawIcon(iconKind, loc);
        };
        DrawSvg.prototype.getSvg = function () {
            return this.svg;
        };
        DrawSvg.prototype.init = function (can) {
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttribute('width', "" + can.width);
            this.svg.setAttribute('height', "" + can.height);
            /*document.body.innerHTML = '';
            document.body.appendChild(this.svg);*/
        };
        DrawSvg.prototype.drawIcon = function (iconKind, loc) {
            var svgimg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            svgimg.setAttributeNS(null, 'height', "" + loc.h);
            svgimg.setAttributeNS(null, 'width', "" + loc.w);
            svgimg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "http://" + location.host + "/img/img/label/" + iconKind + DrawSvg.iconSuffix[iconKind]);
            svgimg.setAttributeNS(null, 'x', "" + loc.x);
            svgimg.setAttributeNS(null, 'y', "" + loc.y);
            svgimg.setAttributeNS(null, 'visibility', 'visible');
            this.svg.appendChild(svgimg);
        };
        ;
        /**
         * 根据图形的brushColor来生成svg的不同defs，用作填充类型的使用
         * @param {shapeCss} sty
         */
        DrawSvg.prototype.appendDefs = function (sty) {
            var fillColor = '#' + sty['brushColor'].toString(16);
            if (this.defsColor.indexOf(fillColor) === -1) {
                this.defsColor.push(fillColor);
                this.shapeFillStyle[sty.brushStyle].call(this, fillColor, this.svg);
            }
        };
        DrawSvg.svgUrl = 'http://www.w3.org/2000/svg';
        DrawSvg.lineStyle = {
            0: "",
            1: "5,5",
            2: "2, 2",
            3: "10,10,4,10",
            4: "30,10,4,10,4,10",
            5: "0,1000" //无
            // 6:透视效果在程序中判断
        };
        DrawSvg.graphKind = {
            rectangle: 0,
            circle: 1,
            verticalLine: 2,
            line: 3,
            upAndDownParallelLine: 4,
            leftAndRightParallelLine: 5 //左右平行线
        };
        DrawSvg.fillKind = {
            shixing: 0,
            kongxin: 1,
            shuiping: 2,
            chuizhi: 3,
            youxie: 4,
            zuoxie: 5,
            fangge: 6,
            xiefangge: 7 //斜方格填充
        };
        DrawSvg.fillKindNumber = ['shixing', 'kongxin', 'shuiping', 'chuizhi', 'youxie', 'zuoxie', 'fangge', 'xiefangge'];
        DrawSvg.alignMent = {
            0: 'left',
            1: 'right',
            2: 'center' //居中
        };
        DrawSvg.iconSuffix = {
            1: '.bmp',
            2: '.bpm',
            3: '.gif',
            50000: '.bmp',
            50001: '.bmp',
            90000: '.jpeg',
            90001: '.jpeg'
        }; //图表对应的图片后缀
        return DrawSvg;
    }());
    exports.DrawSvg = DrawSvg;
});

define("Echart", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Echart" />
    var sys = G.sys;
    var Echart = /** @class */ (function () {
        function Echart() {
            this.setDefault();
        }
        Echart.prototype.setDefault = function () {
            this._title = {
                text: '订单明细图',
                x: 'center'
            };
            this._grid = sys.isMb ? {
                left: '1%',
                right: '6%',
                bottom: '30px',
                containLabel: true
            } : {
                left: '1%',
                right: '15%',
                bottom: '3%',
                containLabel: true
            };
            this.option = {
                title: this._title,
                grid: this._grid
            };
        };
        Object.defineProperty(Echart.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                this._title = title;
                this.option['title'] = title;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Echart.prototype, "legend", {
            get: function () {
                return this._legend;
            },
            set: function (legend) {
                this._legend = legend;
                this.option['legend'] = legend;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Echart.prototype, "grid", {
            get: function () {
                return this._grid;
            },
            set: function (grid) {
                this._grid = grid;
                this.option['grid'] = grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Echart.prototype, "xAxis", {
            get: function () {
                return this._xAxis;
            },
            set: function (xAxis) {
                this._xAxis = xAxis;
                this.option['xAxis'] = xAxis;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Echart.prototype, "yAxis", {
            get: function () {
                return this._yAxis;
            },
            set: function (yAxis) {
                this._yAxis = yAxis;
                this.option['yAxis'] = yAxis;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Echart.prototype, "series", {
            get: function () {
                return this._series;
            },
            set: function (series) {
                this._series = series;
                this.option['series'] = series;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Echart.prototype, "tooltip", {
            get: function () {
                return this._tooltip;
            },
            set: function (tooltip) {
                this._tooltip = tooltip;
                this.option['tooltip'] = tooltip;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Echart.prototype, "dataZoom", {
            get: function () {
                return this._dataZoom;
            },
            set: function (dataZoom) {
                this._dataZoom = dataZoom;
                this.option['dataZoom'] = dataZoom;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Echart.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (color) {
                this._color = color;
                this.option['color'] = color;
            },
            enumerable: true,
            configurable: true
        });
        Echart.prototype.getOption = function () {
            return this.option;
        };
        return Echart;
    }());
    exports.Echart = Echart;
});


define("QrCode", ["require", "exports", "QRCode"], function (require, exports, QRCode) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-dependency path="QRCode" name="QRCode"/>
    var QrCode = /** @class */ (function () {
        function QrCode(svgDom, loc, sty) {
            this.init(svgDom, loc, sty);
        }
        QrCode.prototype.init = function (svgDom, loc, sty) {
            this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            var qrcode = new QRCode(this.g, {
                width: loc.w,
                height: loc.h,
                useSVG: true
            });
            qrcode.makeCode(sty.codeData);
            var gSvg = this.g.firstChild;
            gSvg.setAttribute('width', "" + loc.w);
            gSvg.setAttribute('height', "" + loc.h);
            gSvg.setAttribute('x', "" + loc.x);
            gSvg.setAttribute('y', "" + loc.y);
            svgDom.appendChild(this.g);
        };
        return QrCode;
    }());
    exports.QrCode = QrCode;
});

/// <amd-module name="statistic"/>
define("statistic", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Statistic = /** @class */ (function () {
        /**
         * 构造函数
         * @param paraConf
         */
        function Statistic() {
            // 交叉制表
            this.colFormula = [];
            this.colIndexTemp = 0;
            this.cols = []; // 存储表头顺序，用于渲染表格主体数据
            this.dataTemp = {}; // 用于临时存储聚合数据
            this.crossFunc = (function (self) {
                var childIndex = 0;
                // 构建取值列-交叉表
                function cols_getVal(vals, cols, opts) {
                    if (opts === void 0) { opts = {}; }
                    var result = [];
                    for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
                        var item = cols_1[_i];
                        if (vals.includes(item.name)) {
                            result.push(tools.obj.merge({
                                title: item.title,
                                name: item.name
                            }, opts));
                        }
                    }
                    return result;
                }
                // 构建交叉表头 [数组结构]-交叉表
                function buildCols(col, val, data) {
                    if (col.length > 0) {
                        var child_1 = col.shift(), colTree_1 = {}, result = [];
                        data.forEach(function (item, i) {
                            colTree_1[item[child_1]] = colTree_1[item[child_1]] || { title: item[child_1], data: [] };
                            colTree_1[item[child_1]].data.push(item);
                        });
                        for (var i in colTree_1) {
                            if (colTree_1.hasOwnProperty(i)) {
                                var childs = buildCols(col.concat(), val, colTree_1[i].data);
                                if (childs && (childs.length > 1 || childs[0].children)) {
                                    result.push({
                                        title: colTree_1[i].title,
                                        name: child_1,
                                        children: childs
                                    });
                                }
                                else {
                                    var name_1 = child_1;
                                    if (childs && childs.length === 1) {
                                        var childName = childs[0].name;
                                        childName = childName.replace(/^.*?=/, '');
                                        name_1 = child_1 + "=" + childName;
                                    }
                                    result.push({
                                        title: colTree_1[i].title,
                                        name: name_1
                                    });
                                }
                            }
                        }
                        //childIndex = 0;
                        return result;
                    }
                    else if (val) {
                        var childVal_1 = [];
                        val.forEach(function (item) {
                            childVal_1.push(G.tools.obj.merge(item, { name: item.name + "-" + childIndex++ }));
                        });
                        return childVal_1;
                    }
                }
                // 获取每列的运算条件-交叉表
                function getFormula(cols, val, parent) {
                    if (parent === void 0) { parent = []; }
                    if (cols) {
                        cols.forEach(function (item, i) {
                            var path = parent.concat();
                            if (item.type != 'val') {
                                path.push({ name: item.name, title: item.title });
                            }
                            getFormula(item.children, val, path);
                        });
                    }
                    else {
                        if (!val || val.length === 0) {
                            parent.push(null);
                        }
                        else {
                            var valItem = void 0;
                            self.colIndexTemp = self.colIndexTemp < val.length ? self.colIndexTemp : 0;
                            valItem = val[self.colIndexTemp];
                            valItem.group = self.colIndexTemp; // 用于计算汇总数据
                            parent.push(valItem);
                            self.colIndexTemp++;
                        }
                        //console.log('getFormula', cols, val, parent);
                        self.colFormula.push(parent);
                    }
                }
                // 构建交叉表格主体 [数组结构]-交叉表
                function buildRows(row, val, data, colFormula, cols, parent) {
                    if (cols === void 0) { cols = []; }
                    if (parent === void 0) { parent = {}; }
                    if (row.length > 0) {
                        var child_2 = row.shift(), colTree_2 = {}, result = [];
                        data.forEach(function (item, i) {
                            colTree_2[item[child_2]] = colTree_2[item[child_2]] || [];
                            colTree_2[item[child_2]].push(item);
                        });
                        for (var i in colTree_2) {
                            if (colTree_2.hasOwnProperty(i)) {
                                var col = cols.concat();
                                col.push({ name: child_2, title: i });
                                parent[child_2] = i;
                                result = result.concat(buildRows(row.concat(), val, colTree_2[i], colFormula, col, parent));
                            }
                        }
                        return result;
                    }
                    else {
                        var childTemp = {};
                        data.forEach(function (item, i) {
                            var rowData = {}, sumGroup = [], keys = [], key = '';
                            self.cols = [];
                            console.log(1111, colFormula);
                            colFormula.forEach(function (colItem, j) {
                                var check = true, currentCol = colItem[colItem.length - 1], group = currentCol.group, currentName = currentCol.name, colName = currentName + "-" + childIndex, sumName = currentName + "_SUM", colLength;
                                sumGroup[group] = sumGroup[group] || { name: "" + sumName, title: 0 };
                                // 判断是否有数据
                                // 单值
                                /*if(val.length===1) {
                                    colLength = colItem.length-2;
                                }
                                // 多值
                                else {
                                    colLength = colItem.length-1;
                                }*/
                                colLength = colItem.length - 1;
                                for (var k = 0, l = colLength; k < l; k++) {
                                    var name_2 = colItem[k].name;
                                    // 单值
                                    if (val.length === 1 && !!~name_2.indexOf('=')) {
                                        name_2 = name_2.replace(/=.*?$/, '');
                                        //console.log(name);
                                    }
                                    /*if(item['GOO_NAME'] === 'SANFU(SH)' && item['GOO_ID'] === '348577') {
                                        console.log('----->', name, colItem, item[name], colItem[k].title, typeof item[name] === 'undefined' || item[name] !== colItem[k].title);
                                    }*/
                                    if (typeof item[name_2] === 'undefined' || item[name_2] !== colItem[k].title) {
                                        check = false;
                                        break;
                                    }
                                }
                                /*if(item['GOO_NAME'] === 'SANFU(SH)' && item['GOO_ID'] === '348577') {
                                    console.log('>>>>', check, item);
                                }*/
                                // 单值
                                if (val.length === 1) {
                                    colName = colItem[colItem.length - 2].name;
                                }
                                if (check) {
                                    sumGroup[group].title += item[currentName];
                                    /*rowData.push({
                                        name: colName,
                                        title: item[currentName]
                                    });*/
                                    rowData[colName] = item[currentName];
                                    self.cols.push({
                                        name: colName,
                                        title: item[currentName]
                                    });
                                }
                                else {
                                    self.cols.push({ name: colName, title: '--' }); //单元格无数据
                                    rowData[colName] = '--';
                                }
                                childIndex++;
                            });
                            // 求总计
                            /*if(sumGroup.length>1) {
                                let val = sumGroup.reduce((sum, item)=>{return sum.title+item.title;});
                                sumGroup.unshift({
                                    name: 'STAT_SUM',
                                    title: val
                                });
                            }*/
                            sumGroup.forEach(function (item, i) {
                                rowData[item.name] = item.title;
                            });
                            //rowData = [...parent, ...rowData];
                            rowData = G.tools.obj.merge(rowData, parent);
                            self.cols = cols.concat(self.cols, sumGroup);
                            cols.forEach(function (colItem, j) {
                                keys.push(colItem.title);
                            });
                            key = keys.join('-');
                            // 聚合数据
                            if (self.dataTemp[key]) {
                                for (var rowItem in rowData) {
                                    if (typeof rowData[rowItem] === 'number') {
                                        if (typeof self.dataTemp[key][rowItem] === 'number') {
                                            self.dataTemp[key][rowItem] += rowData[rowItem];
                                        }
                                        else {
                                            self.dataTemp[key][rowItem] = rowData[rowItem];
                                        }
                                    }
                                }
                            }
                            else {
                                self.dataTemp[key] = rowData;
                            }
                            //children.push(rowData);
                            childIndex = 0;
                        });
                        //return children;
                    }
                }
                function createData(conf) {
                    var row = conf.row, col = conf.col, val = conf.val, rowCol, sum, result = {
                        cols: [],
                        data: []
                    };
                    val = cols_getVal(val, conf.cols, { type: 'val' });
                    rowCol = cols_getVal(row, conf.cols);
                    // 构建表头
                    childIndex = 0;
                    result.cols = buildCols(col, val, conf.data);
                    // 获取每列的筛选条件
                    self.colFormula = [];
                    getFormula(result.cols, val);
                    // 获取行数据
                    childIndex = 0;
                    self.dataTemp = {};
                    buildRows(row, val, conf.data, self.colFormula);
                    result.cols = rowCol.concat(result.cols);
                    result.data = [];
                    for (var dataItem in self.dataTemp) {
                        result.data.push(self.dataTemp[dataItem]);
                    }
                    // 添加汇总列
                    if (val.length > 1) {
                        sum = { title: '汇总', name: 'stat_SUM', children: [] };
                        val.forEach(function (item, i) {
                            sum.children.push({ title: item.title + '汇总', name: item.name + '_SUM' });
                        });
                    }
                    else {
                        var name_3 = 'stat_SUM';
                        if (val.length === 1) {
                            name_3 = val[0].name + '_SUM';
                        }
                        sum = { title: '汇总', name: name_3 };
                        /*val.forEach((item, i)=> {
                            sum.push({title: item.title + '汇总', name: item.name+'_SUM'});
                        });*/
                    }
                    result.cols.push(sum);
                    //for(let item)
                    return result;
                }
                // 转换为表格数据格式
                function tableFormat(data) {
                    data.cols = self.multiTable.createThead(data.cols);
                    data.colsIndex = self.cols;
                    data.data = data.data;
                    //data.data = self.multiTable.createTbody(self.cols, data.data);
                    return data;
                }
                function create(conf) {
                    var result = createData(conf);
                    result = tableFormat(result);
                    return result;
                }
                return {
                    create: create
                };
            })(this);
            // 多行表头数据格式化
            this.multiTable = (function (self) {
                var multiRow = [];
                // 计算每列的colspan
                function getColspan(item) {
                    if (item.children) {
                        var children = item.children, childCount = 0;
                        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                            var child = children_1[_i];
                            childCount += getColspan(child);
                        }
                        return childCount;
                    }
                    else {
                        return 1;
                    }
                }
                // 更新colspan=1的列，计算rowspan
                function updateRowspan(data) {
                    var len = data.length;
                    data.forEach(function (item, row) {
                        item.forEach(function (col, i) {
                            if (col.colspan === 1) {
                                var rowspan = len - row;
                                delete col.colspan;
                                if (rowspan !== 1) {
                                    col.rowspan = rowspan;
                                }
                            }
                        });
                    });
                    return data;
                }
                function initThead(data, result) {
                    if (result === void 0) { result = []; }
                    var rows = [], children = [];
                    //console.log('initThead', data);
                    data.forEach(function (item, i) {
                        var cell = {
                            colspan: getColspan(item)
                        };
                        for (var s in item) {
                            if (item.hasOwnProperty(s)) {
                                if (s === 'children' && item[s]) {
                                    children = children.concat(item[s]);
                                }
                                else {
                                    cell[s] = item[s];
                                }
                            }
                        }
                        rows.push(cell);
                    });
                    result.push(rows);
                    if (children.length === 0) {
                        return result;
                    }
                    else {
                        return initThead(children, result);
                    }
                }
                function createThead(data) {
                    var result = initThead(data);
                    result = updateRowspan(result);
                    return result;
                }
                // 计算每行的rowspan
                function getRowspan(item) {
                    if (item.children) {
                        var children = item.children, childCount = 0;
                        for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
                            var child = children_2[_i];
                            childCount += getRowspan(child);
                        }
                        return childCount;
                    }
                    else {
                        return 1;
                    }
                }
                function getCell(item) {
                    var cell = {}, rowspan = getRowspan(item);
                    if (rowspan > 1) {
                        cell['rowspan'] = rowspan;
                    }
                    for (var s in item) {
                        if (item.hasOwnProperty(s)) {
                            if (s !== 'children' && item[s]) {
                                cell[s] = item[s];
                            }
                        }
                    }
                    return cell;
                }
                function initTbody(cols, data, parentRow) {
                    if (parentRow === void 0) { parentRow = []; }
                    console.log('initTbody', cols, data);
                    /*if(data[0].children[0].children) {
                        data.forEach((item, i)=> {
                            if(item.children) {
                                let cell = getCell(item);
                                if(i===0) {
                                    let parent = [];
                                    parentRow.forEach((parentItem, i)=>{
                                        parent.push(G.tools.obj.merge({}, parentItem));
                                    });
                                    parent.push(cell);
                                    initTbody(cols, item.children, parent);
                                }
                                else {
                                    initTbody(cols, item.children, [cell]);
                                }
                            }
                        });
                    }
                    else {
                        let parent = [];
                        parentRow.forEach((parentItem)=>{
                            parent.push(G.tools.obj.merge({}, parentItem));
                        });
        
        
                        data.forEach((row, i)=>{
                            let cell = getCell(row),
                                childHead = [...parent, cell];
        
                            /!*console.log('============');
                            console.log('data', data);
                            console.log('row', row);
                            console.log('cell', cell);
                            console.log('parent', parent);
                            console.log('childHead', childHead);*!/
        
                            row.children.forEach((item, j)=>{
                                if(i===0) {
                                    multiRow.push([...childHead, ...item]);
                                }
                                else {
                                    multiRow.push([cell, ...item]);
                                }
                            });
                            parent = [];
                        });
                    }*/
                }
                /*function tbodyFormat(data) {
                    let result = [];
                    data.forEach((item)=>{
                        let colItem = {};
                        item.forEach((cell)=>{
                            colItem[cell.name] = cell.title;
                        });
                        result.push(colItem);
                    });
                    return result;
                }*/
                function createTbody(cols, data) {
                    multiRow = [];
                    initTbody(cols, data);
                    //multiRow = tbodyFormat(multiRow);
                    return multiRow;
                }
                return {
                    createThead: createThead,
                    createTbody: createTbody
                };
            })(this);
            this.abcFunc = (function (self) {
                // 构造field
                function createField(val, cols) {
                    var result = [];
                    for (var _i = 0, cols_2 = cols; _i < cols_2.length; _i++) {
                        var item = cols_2[_i];
                        if (val === item.name) {
                            var title = item.title;
                            result.push({ title: title + "\u7C7B", name: 'classify' });
                            result.push({ title: title + "\u9879\u6570", name: 'group' });
                            result.push({ title: title + "\u5360\u6BD4", name: 'ratio' });
                            result.push({ title: title + "\u603B\u4EF7\u5360\u6BD4", name: 'total_ratio' });
                            result.push({ title: title + "\u603B\u4EF7\u5747\u503C", name: 'total_avg' });
                        }
                    }
                    return result;
                }
                // 构造data
                function createData(conf) {
                    var row = conf.row, val = conf.val, a = conf.a, b = conf.b, cols = conf.cols, data = conf.data, total = 0, // 总价
                    count = 0, // 总项数
                    rowIndex = 0, valIndex = 0, currentRatio = 0, // 当前占比指针
                    arr = [], result = [
                        { classify: 'A类', group: 0, ratio: 0, total_ratio: 0, total_avg: 0 },
                        { classify: 'B类', group: 0, ratio: 0, total_ratio: 0, total_avg: 0 },
                        { classify: 'C类', group: 0, ratio: 0, total_ratio: 0, total_avg: 0 }
                    ];
                    // 提取目标列数据
                    data.forEach(function (item, i) {
                        arr.push([item[row], item[val]]);
                        total += item[val];
                        count++;
                    });
                    // 降序排序
                    arr.sort(function (a, b) {
                        return b[1] - a[1];
                    });
                    // 计算[累计占比]
                    arr.forEach(function (item, i) {
                        var index = 2; //C类索引
                        currentRatio += (item[1] / total) * 100;
                        currentRatio < a && (index = 0); // A类索引
                        currentRatio >= a && currentRatio < b && (index = 1); // B类索引
                        result[index].group = result[index].group + 1; // 项数
                        result[index].total_ratio = currentRatio; // 总价占比
                        result[index].total_avg = result[index].total_avg + item[1]; // 累计总价
                    });
                    // 由[累计占比]计算[总价占比]
                    result[2].total_ratio = (result[2].total_ratio - parseFloat(result[1].total_ratio)).toFixed(2) + '%';
                    result[1].total_ratio = (result[1].total_ratio - parseFloat(result[0].total_ratio)).toFixed(2) + '%';
                    result[0].total_ratio = result[0].total_ratio.toFixed(1) + '%';
                    result.forEach(function (item, i) {
                        // 由[累计总价]计算[总价均值]
                        result[i].total_avg = (result[i].total_avg / result[i].group).toFixed(2);
                        result[i].total_avg === 'NaN' && (result[i].total_avg = 0);
                        // 计算[项数占比]
                        result[i].ratio = ((result[i].group / count) * 100).toFixed(2) + '%';
                    });
                    return result;
                }
                function create(conf) {
                    var result = {
                        cols: createField(conf.val, conf.cols),
                        data: createData(conf)
                    };
                    return result;
                }
                return {
                    create: create
                };
            })(this);
        }
        // 交叉表
        Statistic.prototype.crossTab = function (args) {
            var self = this, conf, defaultConf = {
                colsSum: false,
                col: [],
                row: [],
                val: [],
                cols: [],
                data: [] // 表格数据
            };
            conf = G.tools.obj.merge(defaultConf, args);
            return self.crossFunc.create(conf);
        };
        // abc制表
        Statistic.prototype.abc = function (args) {
            var self = this, conf, defaultConf = {
                row: [],
                val: [],
                a: 65,
                b: 85,
                cols: [],
                data: []
            };
            conf = G.tools.obj.merge(defaultConf, args);
            return self.abcFunc.create(conf);
        };
        /**
         *_dataFilter 数据过滤-数据类型只能是数组，内容只能是数字
         * sum: 合计值
         * avg: 平均值
         * max: 最大值
         * min: 最小值
         * stDev: 标准差
         * null: 空值数
         * percent:百分比
         * groupPercent:组内百分比
         */
        Statistic.math = {
            _dataFilter: function (data) {
                if (!Array.isArray(data)) {
                    return false;
                }
                var length = data.length;
                for (var i = 0; i < length; i++) {
                    if (data[i] === "" || isNaN(data[i]) || data[i] === null) {
                        data.splice(i, 1);
                        i = i - 1;
                        length = length - 1;
                    }
                    else {
                        data[i] = Number(data[i]);
                    }
                }
                if (data.length === 0) {
                    data[0] = 0;
                }
                return data;
            },
            sum: function (data) {
                data = Statistic.math._dataFilter(data);
                if (data === false) {
                    return false;
                }
                var result = 0;
                var length = data.length;
                for (var i = 0; i < length; i++) {
                    result += data[i];
                }
                return result;
            },
            avg: function (data) {
                data = Statistic.math._dataFilter(data);
                if (data === false) {
                    return false;
                }
                var length = data.length;
                return Statistic.math.sum(data) / length;
            },
            max: function (data) {
                data = Statistic.math._dataFilter(data);
                if (!data) {
                    return false;
                }
                return Math.max.apply(Math, data);
            },
            min: function (data) {
                data = Statistic.math._dataFilter(data);
                if (!data) {
                    return false;
                }
                return Math.min.apply(Math, data);
            },
            stDev: function (data) {
                data = Statistic.math._dataFilter(data);
                if (data === false) {
                    return false;
                }
                var length = data.length;
                var temp = new Array(length);
                for (var i = 0; i < length; i++) {
                    var dev = data[i] - Statistic.math.avg(data);
                    temp[i] = Math.pow(dev, 2);
                }
                var powSum = Statistic.math.sum(temp);
                return Math.sqrt(powSum / length);
            },
            nullCount: function (data) {
                if (!Array.isArray(data)) {
                    return false;
                }
                var count = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i] === "" || isNaN(data[i]) || data[i] === null) {
                        count++;
                    }
                }
                return count;
            },
            percent: function (data, sum) {
                data = Statistic.math._dataFilter(data);
                if (data === false) {
                    return false;
                }
                var total = Statistic.math.sum(data);
                return total / sum;
            },
            groupPercent: function (data) {
                data = Statistic.math._dataFilter(data);
                if (!data) {
                    return false;
                }
            }
        };
        return Statistic;
    }());
    exports.Statistic = Statistic;
});

define("Validate", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var errMsgs = {
        number: '{{title}}必须是数字',
        maxLength: '{{title}}的最大长度不超过{{value}}',
        maxValue: '{{title}}超过最大值{{value}}或者为非数字',
        minLength: '{{title}}小于最小长度{{value}}或者为非字符串',
        minValue: '{{title}}小于最小值{{value}}或者为非数字',
        requieredFlag: '{{title}}为空',
        regExp: '{{title}}匹配正则规则{{value}}'
    };
    var strategies = {
        maxLength: function (data, value) {
            if (value === 0) {
                return true;
            }
            return typeof data == "string" ? !(data.length > value) : true;
        },
        maxValue: function (data, value) {
            return typeof data == "number" ? data < value : true;
        },
        minLength: function (data, value) {
            if (value === 0) {
                return true;
            }
            return typeof data == "string" ? !(data.length < value) : true;
        },
        minValue: function (data, value) {
            return typeof data == "number" ? !(data < value) : true;
        },
        requieredFlag: function (data, value) {
            return value ? (data !== null && data !== undefined && data !== "") : true;
        },
        regExp: function (data, value) {
            return data.match(new RegExp(value)) != null;
        },
        number: function (data, value) {
            return !isNaN(data);
        }
    };
    var Validate = /** @class */ (function () {
        function Validate() {
            this.name2Rules = {};
        }
        Validate.prototype.add = function (dataName, rules) {
            this.name2Rules[dataName] = rules;
        };
        Validate.prototype.get = function (dataName) {
            return this.name2Rules[dataName];
        };
        Validate.prototype.start = function (data) {
            var result = null;
            for (var name_1 in this.name2Rules) {
                var rules = this.name2Rules[name_1];
                for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
                    var r = rules_1[_i];
                    if (data[name_1] !== undefined || r.rule === 'requieredFlag') {
                        if (!strategies[r.rule](data[name_1], r.value)) {
                            var err = r.errMsg ? r.errMsg : errMsgs[r.rule];
                            err = G.tools.str.parseTpl(err, {
                                title: r.title,
                                value: r.value
                            });
                            if (result === null) {
                                result = {};
                            }
                            result[name_1] = {
                                errMsg: err,
                                rule: r.rule
                            };
                            break;
                        }
                    }
                }
            }
            return result;
        };
        return Validate;
    }());
    exports.Validate = Validate;
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="conf.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="sys.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="shell/sys.ad.ts"/>
/// <reference path="shell/sys.h5.ts"/>
/// <reference path="shell/sys.ip.ts"/>
/// <reference path="shell/sys.pc.ts"/>
/// <reference path="shell/sysHistory.pc.ts"/>
/// <reference path="shell/sysPage.pc.ts"/>
/// <reference path="shell/sysTab.pc.ts"/>
/// <reference path="components/index.ts"/>
