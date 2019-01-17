/// <amd-module name="GlobalTestModule"/>

import {RingProgress} from "./components/ui/progress/ringProgress";
import {Progress} from "./components/ui/progress/progress";
import {Modal} from "./components/feedback/modal/Modal";

function crossTable(data: Array<Array<string | number>>, colLength: number = 1, isTotal = true){
    let rows: Array<Array<string>> = [],
        cols: Array<Array<string>> = [],
        pos: Array<{row: number, col: number, value: number, isTotal: boolean}> = [],
        rowLength = data[0].length - colLength - 1;

    data.forEach((datum, index) => {
        let colItem: Array<string> = [],
            rowItem: Array<string> = [],
            posItem = {
                row: -1,
                col: -1,
                value: null,
                isTotal: false
            };

        for(let i = 0; i < cols.length; i++){
            let col = cols[i];
            if(col.every((val, index) => {
                    return val == datum[index]
                })){
                posItem.col = i;
                break;
            }
        }

        for(let i = 0; i < rows.length; i++){
            let row = rows[i];
            if(row.every((val, index) => {
                    return val == datum[colLength + index]
                })){
                posItem.row = i;
                break;
            }
        }

        for(let i = 0; i < datum.length; i++){
            let value = datum[i];
            if(i < colLength) {
                colItem.push(value as string);
            }else if(i < datum.length - 1){
                rowItem.push(value as string);
            }else{
                posItem.value = Number(value);
            }
        }
        if(posItem.col === -1){
            colItem['index'] = cols.length;
            posItem.col = cols.push(colItem) - 1;
        }
        if(posItem.row === -1){
            rowItem['index'] = rows.length;
            posItem.row = rows.push(rowItem) - 1;
        }
        pos.push(posItem);
    });

    let tableData: Array<{row: number, col: number, value: number, isTotal: boolean}> = [];
    pos.forEach((datum) => {
        let isAdd = false;
        for(let i = 0; i < tableData.length; i ++){
            let data = tableData[i];
            if(data.row === datum.row && data.col === datum.col){
                tableData[i].value = tableData[i].value + datum.value;
                isAdd = true;
                break;
            }
        }
        !isAdd && tableData.push(datum);
    });

    if(isTotal){
        let rowItem = new Array(rowLength),
            rowCount = rows.length,
            colItem = new Array(colLength),
            colCount = cols.length;
        colItem[0] = '合计';
        colItem['index'] = colCount;
        cols.push(colItem);

        rowItem[0] = '合计';
        rowItem['index'] = rowCount;
        rows.push(rowItem);

        for(let i = 0; i < colCount; i ++){
            let value = tableData.reduce((previousValue, currentValue) => {
                let val = !currentValue.isTotal && currentValue.col === i
                    ? currentValue.value : 0;
                return previousValue + val;
            }, 0);
            tableData.push({
                row: rowCount,
                col: i,
                value: value,
                isTotal: true
            })
        }

        for(let i = 0; i < rowCount; i ++){
            let value = tableData.reduce((previousValue, currentValue) => {
                let val = !currentValue.isTotal && currentValue.row === i
                    ? currentValue.value : 0;
                return previousValue + val;
            }, 0);
            tableData.push({
                row: i,
                col: colCount,
                value: value,
                isTotal: true
            });
        }

    }
    console.log(cols.sort());
    console.log(rows.sort());
    console.log(pos);
    console.log(tableData);
}

let datas = [
    ['P1001','ipad','京东','100'],
    ['P1001','ipad','苏宁','101'],
    ['P1002','touch','国美','102'],
    ['P1003','iphone','国美','103'],
    ['P1003','iphone','当当','103'],
    ['P1001','ipad','京东','101'],
    ['P1001','ipad','亚马逊','100'],
    ['P1001','ipad','京东','100'],
    ['P1001','ipad','京东','100'],
    ['P1001','ipad','京东','100']
];

let data = [
    ['基期1','分类1','指标1','上期','1'],
    ['基期1','分类1','指标1','同期','2'],
    ['基期1','分类1','指标2','上期','3'],
    ['基期1','分类2','指标1','同期','4'],
    ['基期1','分类1','指标3','上期','5'],
    ['基期1','分类2','指标4','同期','6'],
    ['基期1','分类2','指标4','上期','7'],
    ['基期1','分类3','指标1','同期','8'],
    ['基期1','分类3','指标2','上期','9'],
    ['基期1','分类4','指标1','同期','10'],
    ['基期2','分类1','指标2','上期','11'],
    ['基期3','分类1','指标3','上期','12'],
    ['基期4','分类2','指标1','上期','13'],
    ['基期4','分类1','指标2','同期','14'],
    ['基期4','分类2','指标1','同期','15'],
    ['基期4','分类2','指标1','本季','16'],
    ['基期4','分类2','指标2','上期','17'],
    ['基期4','分类1','指标1','上期','18']
];

crossTable(data, 1);
