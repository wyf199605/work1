/// <amd-module name="GlobalTestModule"/>

// import {SlidePopover} from "./components/ui/slidePopover/slidePopover";

// let slidePopover = new SlidePopover({
//     buttons: [
//         {
//             content: 'button1',
//             onClick: function () {
//                 console.log('This is button1');
//             }
//         }, {
//             content: 'button2',
//             onClick: function () {
//                 console.log('This is button2');
//             }
//         }, {
//             content: 'button3',
//             onClick: function () {
//                 console.log('This is button3');
//             }
//         }, {
//             content: 'button4',
//             onClick: function () {
//                 console.log('This is button4');
//             }
//         }, {
//             content: 'button5',
//             onClick: function () {
//                 console.log('This is button5');
//             }
//         }, {
//             content: 'button6',
//             onClick: function () {
//                 console.log('This is button6');
//             }
//         }, {
//             content: 'button7',
//             onClick: function () {
//                 console.log('This is button6');
//             }
//         }, {
//             content: 'button8',
//             onClick: function () {
//                 console.log('This is button6');
//             }
//         }, {
//             content: 'button9',
//             onClick: function () {
//                 console.log('This is button6');
//             }
//         }
//     ]
// });

import Component = G.Component;

class A extends Component{
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div c-var='ab'>
            <div className="a">aaa</div>
            <div className="b">bbb</div>
        </div>;
    }
}

let a = new A();