define("LabelPrint", ["require", "exports", "Draw"], function (require, exports, draw_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LabelPrint = /** @class */ (function () {
        function LabelPrint(can) {
            this.init(can);
        }
        LabelPrint.prototype.init = function (can) {
            this.draw = new draw_1.Draw(can);
        };
        LabelPrint.prototype.text = function (data, loc, sty) {
            var style = Object.assign({}, LabelPrint.defaultPara.textDefaultPara, sty);
            var newRuler = {};
            for (var key1 in style) {
                var result = LabelPrint.textRuler[key1].call(this, style[key1]);
                for (var key2 in result) {
                    newRuler[key2] = result[key2];
                }
            }
            sty.isShow ? sty.isShow === true ? this.draw.text(data, loc, newRuler) : '' : this.draw.text(data, loc, newRuler);
        };
        LabelPrint.prototype.graph = function (shapeKind, loc, sty) {
            sty = Object.assign({}, LabelPrint.defaultPara.shapeDefaultPara, sty);
            var newRuler = {};
            for (var key1 in sty) {
                var result = LabelPrint.graphRuler[key1].call(this, sty[key1]);
                for (var key2 in result) {
                    newRuler[key2] = result[key2];
                }
            }
            sty.isShow ? sty.isShow === true ? this.draw.graph(shapeKind, loc, newRuler) : '' : this.draw.graph(shapeKind, loc, newRuler);
        };
        LabelPrint.prototype.getCtx = function () {
            return this.draw.getCanvasCt();
        };
        LabelPrint.textRuler = {
            align: function (value) {
                if (value == 'left') {
                    return { alignment: 0 };
                }
                else if (value == 'right') {
                    return { alignment: 1 };
                }
                else {
                    return { alignment: 2 };
                }
            },
            textBackColor: function (value) {
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                value = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?(\d+(\.\d+)?)?\)$/);
                return { backColor: parseInt((hex(value[1]) + hex(value[2]) + hex(value[3])), 16), transparent: Number(value[4]) };
            },
            font: function (value) {
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                var result = value.color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?(\d+(\.\d+)?)?\)$/);
                var fontSty = { font: {} };
                for (var key in value) {
                    key == 'name' ? fontSty.font['fontName'] = value[key] : '';
                    key == 'size' ? fontSty.font['fontSize'] = value[key] : '';
                    key == 'color' ? fontSty.font['fontColor'] = parseInt((hex(result[1]) + hex(result[2]) + hex(result[3])), 16) : '';
                    key == 'name' ? fontSty.font['fontName'] = value[key] : '';
                }
                return fontSty;
            },
            autoFill: function (value) {
                if (value) {
                    return { autoSize: false, stretch: true };
                }
                else {
                    return { autoSize: true };
                }
            },
            isShow: function (value) { },
            wordWrap: function (value) {
                return { wrapping: value };
            }
        };
        LabelPrint.graphRuler = {
            angle: function (value) {
                return { angle: value };
            },
            fill: function (value) {
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                var result = value.color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                return { brushColor: parseInt((hex(result[1]) + hex(result[2]) + hex(result[3])), 16), brushStyle: value.style, fillPenWidth: value.width };
            },
            border: function (value) {
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                var result = value.color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                return { penColor: parseInt((hex(result[1]) + hex(result[2]) + hex(result[3])), 16), penStyle: value.style, borderPenWidth: value.width };
            },
            isShow: function (value) {
            }
        };
        LabelPrint.graphKind = {
            rectangle: 0,
            circle: 1,
            verticalLine: 2,
            line: 3,
            parallelLine: 4 //上下平行线
        };
        LabelPrint.defaultPara = {
            textDefaultPara: {
                align: 'left',
                textBackColor: 'rgba(255,255,255,1)',
                autoFill: false,
                wordWrap: false,
                font: { name: '宋体', size: 10, color: 'rgb(0,0,0)' }
            },
            shapeDefaultPara: {
                fill: { color: 'rgb(0,0,0)', style: 1, width: 1 },
                border: { color: 'rgb(0,0,0)', style: 0, width: 1 }
            }
        };
        return LabelPrint;
    }());
    exports.LabelPrint = LabelPrint;
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
