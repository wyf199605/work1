/// <amd-module name="StatisticBase"/>
import dom = G.d;
import sys = BW.sys;
import {Modal} from "global/components/feedback/modal/Modal";
import {ModalHeader} from "../../../global/components/feedback/modal/ModalHeader";

export interface resType{
    cols : Array<any>;
    data : Array<any>;
    colsIndex? : Array<any>;
}

export class StatisticBase {
    constructor(){}

    /**
     * 生成统计结果的表格弹窗
     * @param {resType} result 表格数据
     * @param {HTMLElement} container
     * @param {boolean} isMulit 是否是多维表头
     */
    protected tableRender(result : resType,container : HTMLElement,isMulit = false) {
        let tempTable  = dom.create('<table><tbody></tbody></table>'),
            tempResult: TableModulePara = {
                cols: isMulit ? result.colsIndex : result.cols,
                data: result.data,
                multPage: 2,
                isSub: sys.isMb,
                isInModal: true
            };

        if(result.data.length > 0){
            for(let i = 0,l = result.data.length;i < l;i++){
                for(let key in result.data[i]){
                    if(result.data[i][key] === '--'){
                        result.data[i][key] = "";
                    }
                }
            }
        }

        let width,
            resColsLen = isMulit ? result.cols[0].length : result.cols.length;
        if(resColsLen <= 3){
            width = '300px';
        }
        else if(resColsLen > 3 && resColsLen <= 8){
            width = '600px';
        }
        else{
            width = '1000px';
        }
        sys.isMb ? new Modal({
            header: '统计结果',
            body: tempTable,
            position: 'full',
            container: container,
            isOnceDestroy: true
        }) : new Modal({
            body: tempTable,
            isOnceDestroy: true,
            isBackground: false,
            container: container,
            width: width,
            header: {
                title :  '统计结果',
                isFullScreen: true
            }
        });

        require([sys.isMb ? 'TableModuleMb': 'TableModulePc'], (table) => {
            let conf = {
                tableEl: tempTable,
                scrollEl: tempTable.parentElement,
                tableConf: {
                    indexCol: 'number'
                }
            };
            if(isMulit){
                conf.tableConf['multi'] = {
                    enabled: true,
                    cols: result.cols,
                }
            }
            new table(conf, tempResult);
        });
    }
}