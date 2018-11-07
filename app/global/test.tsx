/// <amd-module name="GlobalTestModule"/>

import {MbList} from "./components/mbList/MbList";
import {MbListItem} from "./components/mbList/MbListItem";
import tools = G.tools;

let mbList = new MbList({
    isImg: true,
    isMulti: true,
    data: [{
        body: [['test1', 'test2']],
        label: ['label1', 'label2', 'label3'],
        title: 'test title',
        // imgLabel: 'test imgLabel',
        statusColor: 'red',
        countDown: tools.date.add(tools.date.today(), 0.0001).getTime(),
    }, {
        body: [['test1', 'test2'], ['test3', 'test4']],
        label: ['label1', 'label2', 'label3'],
        // title: 'test title',
        imgLabel: 'test imgLabel',
        statusColor: 'red',
        countDown: tools.date.add(tools.date.today(), 2).getTime(),
    }, {
        body: [['test1', 'test2'], ['test3', 'test4'], ['test5', 'test6']],
        label: ['label1', 'label2', 'label3'],
        title: 'test title',
        imgLabel: 'test imgLabel',
        statusColor: 'green',
        // countDown: tools.date.add(tools.date.today(), 1).getTime(),
    }]
});


// mbList.render([{
//     body: [['title1', 'body1'], ['title2', 'body2'], ['title3', 'body3']],
//     label: ['label1', 'label1', 'label1'],
//     title: 'test title111',
//     imgLabel: 'test imgLabel',
//     status: 2,
//     statusColor: 'blue',
//     countDown: tools.date.add(tools.date.today(), 10).getTime(),
// }, {
//     body: [['test2', 'test2'], ['test2', 'test2'], ['test2', 'test2']],
//     label: ['label2', 'label2', 'label2'],
//     title: 'test title222',
//     imgLabel: 'test imgLabel',
//     status: 2,
//     statusColor: 'red',
//     countDown: tools.date.add(tools.date.today(), 21).getTime(),
// }]);

console.log(mbList);


