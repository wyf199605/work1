/// <amd-module name="GlobalTestModule"/>
/// <amd-dependency path="D3" name="D3"/>

import {RingProgress} from "./components/ui/progress/ringProgress";
import {Progress} from "./components/ui/progress/progress";
import {Modal} from "./components/feedback/modal/Modal";
import {SvgDraw} from "./utils/svgDraw";
import {SelectBox} from "./components/form/selectBox/selectBox";
import {RadioBoxGroup} from "./components/form/selectBoxGroup/selectBoxGroup";
import {RadioBox} from "./components/form/radiobox/radioBox";
import {CustomBoxLayout} from "./components/view/customLayout/customBoxLayout";

<CustomBoxLayout items={[{
    width: 250,
    height: 250,
    resize: true, // 是否可改变宽高
    fullScreen: false, // 是否可以放大
    content: <h1>测试块11111111</h1>,
    drag:true,
}, {
    width: 200,
    height: 200,
    resize: false, // 是否可改变宽高
    fullScreen: false, // 是否可以放大
    content: <h1>测试块2222222</h1>,
    drag:true,
}, {
    width: 100,
    height: 100,
    resize: true, // 是否可改变宽高
    fullScreen: false, // 是否可以放大
    content: <h1>测试块333333333</h1>,
    drag:true,
}, {
    width: 300,
    height: 300,
    resize: false, // 是否可改变宽高
    fullScreen: false, // 是否可以放大
    content: <h1>测试块4444444</h1>,
    drag:true,
}]}/>

