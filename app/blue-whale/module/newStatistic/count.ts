/// <amd-module name="NewCount"/>

import {NewStatisticBase} from "./statisticBasic";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {Modal} from "global/components/feedback/modal/Modal";
import {ModalFooter} from "global/components/feedback/modal/ModalFooter";
import sys = BW.sys;
import d = G.d;
import tools = G.tools;
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";

interface countPara{
    container: HTMLElement;//模态框所放的父容器
    colDataGet(colName : string): any;
    getVisibleCol() : obj;
    cols: R_Field[],//获取所有的列;
}


export = class NewCount extends NewStatisticBase{
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
                top: 200,
                container: this.para.container,
                isBackground: tools.isMb,
                position: tools.isMb ? 'center' : 'default',
                footer: {},
                isMb: false,
                onOk: () => {
                    let tablePara = {
                        cols : [{'title': selectInput.getText(), 'name': "colName"},{'title': "数量", 'name': "count"}],
                        data : []
                    };
                    let data = this.para.colDataGet(selectInput.get());
                    for(let key in data){
                        tablePara.data.push({
                            colName: key,
                            count: data[key]
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
                if(colIndex === -1){
                    return null;
                }

                return {
                    text: cols[colIndex].title,
                    value: colName
                }
            }).filter((item) => item);

            let selectInput = new (sys.isMb ? SelectInputMb : SelectInput)({
                container: <HTMLElement>this.modal.body,
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