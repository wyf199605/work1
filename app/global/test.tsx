/// <amd-module name="GlobalTestModule"/>

import {MbList} from "./components/mbList/MbList";

new MbList({
    data: [
        {
            title: '测试',
            body: [
                ['姓名', '阿猫'],
                ['性别', '公']
            ],
            label: ['动物', '性感'],
            status: 1,
        }
    ],
    isMulti: true
});