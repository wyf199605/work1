/// <amd-module name="GlobalTestModule"/>

import d = G.d;
import tool = G.tools;
import {CheckBox} from "./components/form/checkbox/checkBox";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Modal} from "./components/feedback/modal/Modal";
import {Progress} from "./components/ui/progress/progress";
import {RingProgress} from "./components/ui/progress/ringProgress";
import {ActionSheet} from "./components/ui/actionSheet/actionSheet";

// let ringProgress = new RingProgress({
//     percent: 25,
//     showInfo: true,
//     position: {
//         x: 100,
//         y: 100
//     },
//     radius: 50,
//     ringWidth: 10,
//     color: {
//         ring: 'red',
//         out: 'white',
//         // inner: 'blue',
//         font: 'red'
//     },
//     font:{
//         // style: 'normal',
//         // variant: 'normal',
//         // weight: 'normal',
//         size: 15,
//         family: 'Arial'
//     },
//     interval: 100,
//     step: 2,
//     container: d.query('#main')
// });


// let modal = new Modal({
//     width: '90%',
//     height: '90%',
//     position: 'down',
//     fullPosition: 'down',
//     body: <div className="someBody"></div>
// });

let actionSheet = new ActionSheet({
    hasCancel: true,
    buttons: [
        {
            content: '拍照或录像',
            onClick: function () {
                console.log('拍照或录像');
            },
            icon: 'weixin',
            bg: '#3bbb07',
            iconColor: '#fff'
        },
        {
            content: '选取现有的',
            onClick: function () {
                console.log('选取现有的');
            },
            icon: 'zhiwen',
            bg: '#ffb400',
            iconColor: '#fff'
        },
        {
            content: 'download',
            onClick: function () {
                console.log('download');
            },
            icon: 'download',
            iconColor: '#666',
            bg: '#fff'
        },
    ]
});