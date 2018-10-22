define("Gesture", ["require", "exports"], function (require, exports) {
    "use strict";
    /// <amd-module name="Gesture"/>
    var d = G.d;
    return /** @class */ (function () {
        function Gesture(GesturePara) {
            this.GesturePara = GesturePara;
            this.initHtml();
            this.initEvent();
        }
        Gesture.prototype.initHtml = function () {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = window.screen.availWidth;
            this.canvas.height = window.screen.availHeight;
            this.canvas.style.background = 'rgba(0,0,0,0.3)';
            this.initIcon();
            this.drawText('请绘制手势');
        };
        Gesture.prototype.initIcon = function () {
            this.container = document.createElement('div');
            this.container.setAttribute('style', 'z-index:1001; position:fixed;top:0px;');
            var iconGes = document.createElement('i');
            iconGes.setAttribute('style', 'z-index:-1;position:absolute; top:50%; left:50%; margin-top:0px; margin-left:-100px; font-size:200px; color:rgb(130,130,130);');
            iconGes.className = 'iconfont icon-gesture';
            this.container.appendChild(this.canvas);
            this.container.appendChild(iconGes);
            this.GesturePara.container.appendChild(this.container);
        };
        Gesture.prototype.initEvent = function () {
            var _this = this;
            this.points = new Array();
            this.dollarRecognizer = new DollarRecognizer();
            this.ctx.fillStyle = "rgb(0,0,225)";
            this.ctx.strokeStyle = "rgb(0,0,225)";
            this.ctx.lineWidth = 3;
            this.ctx.font = "16px Gentilis";
            this.rect = this.getCanvasRect();
            this.isDown = false;
            d.on(this.canvas, 'touchstart', function (event) {
                var el = event.target;
                if (!(el.classList.contains('icon-quxiao') || el.classList.contains('icon-fasongyoujian'))) {
                    _this.mouseDownEvent(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
                }
            });
            d.on(this.canvas, 'touchmove', function (event) {
                var el = event.target;
                if (!(el.classList.contains('icon-quxiao') || el.classList.contains('icon-fasongyoujian'))) {
                    _this.mouseMoveEvent(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
                }
                event.preventDefault();
                event.stopPropagation();
            });
            d.on(this.canvas, 'touchend', function (event) {
                var el = event.target;
                if (!(el.classList.contains('icon-quxiao') || el.classList.contains('icon-fasongyoujian'))) {
                    _this.mouseUpEvent(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                }
                _this.container.remove(); //关闭时删除该节点
                _this.GesturePara.onFinsh.call(_this, _this.shape);
            });
        };
        Gesture.prototype.getCanvasRect = function () {
            var w = this.canvas.width;
            var h = this.canvas.height;
            var cx = this.canvas.offsetLeft;
            var cy = this.canvas.offsetTop;
            while (this.canvas.offsetParent != null) {
                this.canvas = this.canvas.offsetParent;
                cx += this.canvas.offsetLeft;
                cy += this.canvas.offsetTop;
            }
            return { x: cx, y: cy, width: w, height: h };
        };
        Gesture.prototype.getScrollY = function () {
            var scrollY = document.body.scrollTop;
            return scrollY;
        };
        Gesture.prototype.mouseDownEvent = function (x, y) {
            document.onselectstart = function () { return false; };
            document.ontouchstart = function () { return false; };
            this.isDown = true;
            x -= this.rect.x;
            y -= this.rect.y - this.getScrollY();
            if (this.points.length > 0)
                this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
            this.points.length = 1; // clear
            this.points[0] = new Point(x, y);
            //  this.drawText("Recording unistroke...");
            this.ctx.fillRect(x - 4, y - 3, 9, 9);
        };
        Gesture.prototype.mouseMoveEvent = function (x, y) {
            if (this.isDown) {
                x -= this.rect.x;
                y -= this.rect.y - this.getScrollY();
                this.points[this.points.length] = new Point(x, y); // append
                this.drawConnectedPoint(this.points.length - 2, this.points.length - 1);
            }
        };
        Gesture.prototype.mouseUpEvent = function (x, y) {
            document.onselectstart = function () { return true; };
            document.ontouchstart = function () { return true; };
            if (this.isDown) {
                this.isDown = false;
                if (this.points.length >= 10) {
                    var result = this.dollarRecognizer.Recognize(this.points, true);
                    //  this.drawText("Result: " + result.Name + " (" + this.round(result.Score,2) + ").");
                    this.shape = result.Name;
                }
                else {
                    this.shape = "无法识别";
                    //   this.drawText("Too few points made. Please try again.");
                }
            }
        };
        Gesture.prototype.drawText = function (str) {
            this.ctx.font = "25px Arial";
            var textWidth = this.ctx.measureText(str).width;
            this.ctx.fillText(str, this.canvas.width / 2 - textWidth / 2, this.canvas.height / 2 + 150);
        };
        Gesture.prototype.drawConnectedPoint = function (from, to) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.points[from].X, this.points[from].Y);
            this.ctx.lineTo(this.points[to].X, this.points[to].Y);
            this.ctx.closePath();
            this.ctx.stroke();
        };
        Gesture.prototype.round = function (n, d) {
            d = Math.pow(10, d);
            return Math.round(n * d) / d;
        };
        return Gesture;
    }());
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
