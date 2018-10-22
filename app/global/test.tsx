/// <amd-module name="GlobalTestModule"/>

import {MbList} from "./components/mbList/MbList";

new MbList({
    data: [
        {
            title: '9825445464456 驼色',
            body: [
                ['码数', '张三'],
                ['库存量', '2016-8-23 08:00'],
                ['异店库存','2016-8-23 08:00']
            ],
            label: ['手工确认完成', '谢晋超'],
            imgLabel: '标签',
            btns: ['确认核验', '加入色码打印', '测试'],
            status: 1,
        }
    ],
    isMulti: true
});


