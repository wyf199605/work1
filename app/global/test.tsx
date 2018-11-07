/// <amd-module name="GlobalTestModule"/>

import {MbList} from "./components/mbList/MbList";
import tools = G.tools;
import {MbListItemData} from "./components/mbList/MbListItem";

let url = 'http://127.0.0.1/sf/app_sanfu_retail/null/ui/select/n1_zsydata-1?p_n=zsy2000%3Bn1_zsydata-1&output=json';
G.Ajax.fetch(url).then(({response}) => {
    response = JSON.parse(response);
    let layout = response.body.elements[0].layout, validLayout: obj = {},
        cols = response.body.elements[0].cols;
    for (let key in layout) {
        tools.isNotEmpty(layout[key]) && (validLayout[key] = layout[key]);
    }
    let dataUrl = 'http://127.0.0.1/sf/app_sanfu_retail/null/list/n1_zsydata-1?pageparams=%7B%22index%22%3D1%2C%22size%22%3D50%2C%22total%22%3D1%7D&queryparams1=%7B%22not%22%3Afalse%2C%22op%22%3A0%2C%22params%22%3A%5B%7B%22not%22%3Afalse%2C%22op%22%3A2%2C%22field%22%3A%22BARCODE%22%2C%22values%22%3A%5B%2224196200%22%5D%7D%5D%7D';
    G.Ajax.fetch(dataUrl).then(({response}) => {
        let res = JSON.parse(response);
        let dataList: [string][] = res.body.bodyList[0].dataList,
            meta: string[] = res.body.bodyList[0].meta,
            data: obj[] = [];
        dataList.forEach((row) => {
            let rowObj: obj = {};
            meta.forEach((filed, index) => {
                rowObj[filed] = row[index];
            });
            data.push(rowObj);
        });
        let captions = [];
        if (tools.isNotEmpty(validLayout['body'])){
            validLayout['body'].forEach((field) => {
                captions.push(cols.filter((c) => c.name === field)[0].caption);
            })
        }
        handlerLayout(validLayout, data,captions);
    })
});

function handlerLayout(layout: obj, data: obj[],captions?:string[]) {
    console.log(layout);
    console.log(data);
    // body?: [string, string][];
    // label?: string[];
    // title?: string;
    // img?: string;
    // imgLabel?: string;
    // status?: number;
    // statusColor?: string;
    // countDown?: number;
    let listData:MbListItemData[] = [];
    data.forEach((item) => {
        let itemObj:obj = {};
        for (let key in layout) {
            switch (key){
                case 'body':{
                    let bodyField:string[] = layout['body'],
                        bodyData = [];
                    bodyField.forEach((field,index) => {
                        bodyData.push([captions[index],item[field]]);
                    });
                    itemObj['body'] = bodyData;
                }
                break;
                case 'label':{

                }
                    break;
                case 'title':{
                    let titleField:string[] = layout['title'],
                        titleStr = '';
                    titleField.forEach((field,index) => {
                        titleStr += item[field];
                    });
                    itemObj['title'] = titleStr;
                }
                    break;
                case 'img':{
                    itemObj['img'] = item[layout['img']];
                }
                    break;
                case 'imgLabel':{
                    itemObj['imgLabel'] = item[layout['imgLabel']];
                }
                    break;
                case 'countDown':{

                }
                    break;
                case 'status':{

                }
                    break;
            }
        }
        listData.push(itemObj);
    });
    console.log(listData);
}
