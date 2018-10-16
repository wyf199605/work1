/// <amd-module name="Count"/>

import {StatisticBase} from "./statisticBasic";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {Modal} from "global/components/feedback/modal/Modal";
import {ModalFooter} from "global/components/feedback/modal/ModalFooter";
import sys = BW.sys;
import d = G.d;
import tools = G.tools;
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";

interface countPara{
    container: HTMLElement;//模态框所放的父容器
    colDataGet(colName : string) ; any;
    getVisibleCol() : obj;
    cols: R_Field[],//获取所有的列;
}

export = class Count extends StatisticBase{
    private modal: Modal = null;
        constructor(private para : countPara){
            super();
            this.initModal();
        }

        private count(colName: string){
            let colData = this.para.colDataGet(colName),
                groupObj:objOf<number> = {};

            colData.forEach(cellData => {
                cellData = tools.isEmpty(cellData) ? '-空-' : cellData;
                if(cellData in groupObj) {
                    groupObj[cellData] ++;
                } else {
                    groupObj[cellData] = 1;
                }
            });

            return groupObj;
        }

        private initModal(){

            this.modal =  new Modal({
                header: '统计',
                body: d.create('<span></span>'),
                className: 'statistic',
                width: '220px',
                container: this.para.container,
                isBackground: false,
                footer: {},
                onOk: () => {
                    let tablePara = {
                        cols : [{'title': "列名", 'name': "colName"},{'title': "数量", 'name': "count"}],
                        data : []
                    };
                    let result = this.count(selectInput.get());
                    for(let key in result){
                        tablePara.data.push({
                            colName : key,
                            count : result[key]
                        })
                    }
                    this.tableRender(tablePara,this.para.container);
                }
            });


            let listItems:ListItem[] = this.para.getVisibleCol().map(colName => {
                let cols = this.para.cols,
                    colIndex = -1;

                for(let i = 0, col:COL ; col = cols[i]; i++){
                    if(col.name === colName){
                        colIndex = i;
                        break;
                    }
                }

                return {
                    text: cols[colIndex].title,
                    value: colName
                }
            });

            let selectInput = new (sys.isMb ? SelectInputMb : SelectInput)({
                container: this.modal.bodyWrapper,
                data: listItems,
                readonly: true,
                clickType: 0

            });

            selectInput.set(listItems[0].value);
        }

        private getModal() {
            return this.modal;
        }

}