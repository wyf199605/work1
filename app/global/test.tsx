/// <amd-module name="GlobalTestModule"/>
/// <amd-dependency path="JsBarcode" name="JsBarcode"/>
/// <amd-dependency path="D3" name="D3"/>
declare const JsBarcode;

import {RingProgress} from "./components/ui/progress/ringProgress";
import {Progress} from "./components/ui/progress/progress";
import {Modal} from "./components/feedback/modal/Modal";

let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
document.body.appendChild(svg);
JsBarcode(svg, '123321', {
    width: 1,
    height: 40,
    displayValue: false,
});
// d3.select(svg).select('g').selectAll('rect').each(function () {
//     d3.select(this).attr('x', () => {
//         return parseFloat(d3.select(this).attr('x')) * 2;
//     });
//     // d3.select(this).attr('width', () => {
//     //     return parseFloat(d3.select(this).attr('width')) * 2;
//     // });
// });
// let node = d3.select(svg).select('g').node() as SVGGElement,
//     obj = node.getBBox();
//
// d3.select(svg).attr('width', obj.width).attr('viewBox', () => {
//     return d3.select(svg).attr('viewBox')
// }).select('rect').attr('width', obj.width)




