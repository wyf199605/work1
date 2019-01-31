/// <amd-module name="GlobalTestModule"/>
/// <amd-dependency path="D3" name="D3"/>

import {RingProgress} from "./components/ui/progress/ringProgress";
import {Progress} from "./components/ui/progress/progress";
import {Modal} from "./components/feedback/modal/Modal";
import {SvgDraw} from "./utils/svgDraw";
import {SelectBox} from "./components/form/selectBox/selectBox";
import {RadioBoxGroup} from "./components/form/selectBoxGroup/selectBoxGroup";
import {RadioBox} from "./components/form/radiobox/radioBox";
let text = 'abcdef&ensp;ghijk';

console.log(SvgDraw.textLineFeed(text, 40, '20px'));

let svg = new SvgDraw({
    container: document.body,
    width: 500,
    height: 500
});

svg.drawText({
    x: 0,
    y: 0,
    data: text,
    font:{
        size: 20,
    },
    width: 40,
    isWrap: true,
    isItalic: true,
});

svg.drawImage({
    data: G.requireBaseUrl + `/../img/label/1.bmp`,
    x: 40,
    y: 40,
    width: 100,
    height: 100
});

svg.drawBarCode({
    data: '123312',
    x: 10,
    y: 10,
    height: 30,
    width: 200,
    align: 'middle',
    barCodeWidth: 2
});


svg.drawCircle({
    x: 100,
    y: 100,
    width: 100,
    height: 200,
    fill: "green",
    stroke: {
        color: 'red',
        width: 10
    }
});
svg.drawCircle({
    x: 300,
    y: 100,
    width: 100,
    height: 200,
    fill: "green",
    stroke: {
        color: 'red',
        width: 1
    }
});

let div = document.createElement('div');
// document.body.appendChild(div);
console.log(div.getBoundingClientRect());



