/// <amd-module name="NewStatisticBase"/>
import dom = G.d;
import tools = G.tools;
import sys = BW.sys;
import {Modal} from "global/components/feedback/modal/Modal";
import {FastBtnTable, IFastBtnTablePara} from "../../../global/components/FastBtnTable/FastBtnTable";
import {FastTableCell} from "../../../global/components/newTable/FastTableCell";
import {BwRule} from "../../common/rule/BwRule";

export interface resType{
    cols : Array<any>;
    data : Array<any>;
    colsIndex? : Array<any>;
}

export class NewStatisticBase {
    constructor(){}

    /**
     * 生成统计结果的表格弹窗
     * @param {resType} result 表格数据
     * @param {HTMLElement} container
     * @param {boolean} isMulit 是否是多维表头
     */
    protected tableRender(result : resType,container : HTMLElement, isMulit = false) {
        let tempTable  = dom.create('<div style="height: 100%;"></div>');
            // tempResult: TableModulePara = {
            //     cols: isMulit ? result.colsIndex : result.cols,
            //     data: result.data,
            //     multPage: 2,
            //     isSub: sys.isMb,
            //     isInModal: true
            // };

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
            last = result.cols.length - 1,
            resColsLen = isMulit ? result.cols[last].length : result.cols.length;
        if(resColsLen <= 2){
            width = '400px';
        }
        else if(resColsLen > 2 && resColsLen <= 7){
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
            className: 'statistic-modal',
            height: '90%',
            header: {
                title :  '统计结果',
                isFullScreen: true
            },
            onLarge: () => {
                if(ftable) {
                    ftable.recountWidth();
                }
            }
        });
        let para: IFastBtnTablePara = {
            cols: Array.isArray(result.cols[0]) ? result.cols : [result.cols],
            data: result.data,
            container: tempTable,
            // maxHeight: 400,
            isFullWidth: true,
            sort: true,
            pseudo: {
                type: "number",
            },
            isResizeCol: true,
            clickSelect: true,
            dragSelect: !tools.isMb,
            cellFormat: (cellData, cell: FastTableCell) => {
                let col = cell.column,
                    content = col.content;
                return new Promise((resolve) => {
                    let text = cellData,
                        classes = [];
                    if(content && content.content){
                        let field = content.content as R_Field;
                        text = BwRule.formatTableText(cellData, field);
                        let dataType = field.dataAddr || (field.atrrs && field.atrrs.dataType);
                        if (BwRule.isNumber(dataType)) {
                            classes.push('text-right');
                        }
                        resolve({text, classes});
                    }else{
                        resolve({text, classes});
                    }
                })
            }
        };
        !tools.isMb && (para['btn'] = {
            name:['search', 'statistic', 'export'],
            type: 'button',
        });

        let ftable = new FastBtnTable(para);
        // loading.hide();
        // require([sys.isMb ? 'TableModuleMb': 'TableModulePc'], (table) => {
        //     let conf = {
        //         tableEl: tempTable,
        //         scrollEl: tempTable.parentElement,
        //         tableConf: {
        //             indexCol: 'number'
        //         }
        //     };
        //     if(isMulit){
        //         conf.tableConf['multi'] = {
        //             enabled: true,
        //             cols: result.cols,
        //         }
        //     }
        //     new table(conf, tempResult);
        // });
    }
}