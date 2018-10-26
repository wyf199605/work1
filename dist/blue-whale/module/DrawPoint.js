define("DrawPoint", ["require", "exports", "D3"], function (require, exports, D3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-dependency path="D3" name="D3"/>
    var DrawPoint = /** @class */ (function () {
        function DrawPoint(para) {
            this.point = [2];
            this.map = D3.map(this.points, function (d, i) {
                return i;
            });
            this.r = D3.scale.linear()
                .domain([1, 6])
                .range([5.5, 1]);
            this.InitSvg(para);
            this.test();
        }
        DrawPoint.prototype.InitSvg = function (para) {
            var _this = this;
            this.svg = D3.select(para.wraperId).append('svg')
                .attr('width', para.width)
                .attr('height', para.height)
                .on('mousedown', function () {
                return _this.mousedown();
            });
            console.log(para.wraperId);
            console.log(D3.select(para.wraperId));
            this.g = this.svg.append('g');
            this.g.append('image'); //添加背景图
        };
        DrawPoint.prototype.mousedown = function () {
            var svg = D3.select('svg').select('g');
            console.log(D3.mouse(svg.node()));
            console.log(this.point);
            this.point.push(this.selected = D3.mouse(svg.node()));
            console.log(this.points);
            this.map.set(this.index, this.points);
            console.log(this.map);
            this.redraw();
        };
        DrawPoint.prototype.test = function () {
            console.log(this.point);
        };
        //绘图
        DrawPoint.prototype.redraw = function () {
            var _this = this;
            var svg = D3.select('svg').select('g');
            svg.select("#path" + this.index)
                .attr("d", function (d, i) {
                return _this.line(_this.map.get(_this.index));
            })
                .style("stroke-dasharray", "10 5");
            // .on("mouseover",function(d,i){
            //     d3.select(this).style("stroke-width", 8)
            //
            //     lineSelect = true
            // })
            // .on("mouseout", function (d, i) {
            //
            //     d3.select(this).style("stroke-width", 4)
            //
            //     lineSelect = false
            // });
            var circle = svg.selectAll("circle").data(this.map.get(this.index), function (d, i) {
                return d;
            });
            circle.enter().append("circle")
                .attr("r", 1e-2)
                .transition()
                .duration(750)
                .ease("elastic")
                .attr('r', this.r(2));
            circle.classed("selected", function (d) {
                return d === this.selected;
            }).attr("cx", function (d) {
                return d[0];
            })
                .attr("cy", function (d) {
                return d[1];
            });
            circle.exit().remove();
            if (D3.event) {
                //d3.event.stopPropagation();
            }
            //svg.selectAll("circle").call(drag);
        };
        DrawPoint.prototype.createPath = function () {
            var _this = this;
            if (this.map.get(this.index) == undefined) {
                this.map.set(this.index, []);
            }
            console.log("创建了" + this.map.get(this.index));
            var svg = D3.select('svg').select('g');
            svg.append("path")
                .datum(this.map.get(this.index))
                .attr("class", 'line')
                .attr("id", "path" + this.index)
                .attr('stroke-width', 3)
                .on('click', function (d, i) {
                var indexStr = D3.select(_this).attr('id');
                _this.index = parseInt(indexStr.slice(4, indexStr.length));
                _this.points = _this.map.get(_this.index);
                alert("这是区域");
            });
        };
        //开启描点
        DrawPoint.prototype.Drawing = function () {
            this.createPath();
        };
        return DrawPoint;
    }());
    exports.DrawPoint = DrawPoint;
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
