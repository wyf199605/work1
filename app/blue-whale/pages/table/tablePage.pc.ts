///<amd-module name="TablePagePc"/>
import TableModulePc = require('../../module/table/tableModulePc');
import d = G.d;
import {BwRule} from "../../common/rule/BwRule";
import {TablePage} from "./tablePage";

export = class TablePagePc extends TablePage {
    protected initTable(TableModule: typeof TableModulePc,newMtPara : TableModulePara,queryData : obj) {

        this.addConf(newMtPara);
        this.para.tableDom = <HTMLTableElement>d.create('<table class="mobileTable"><tbody></tbody></table>');
        this.para.dom.appendChild(this.para.tableDom);

        this.tableModule = new TableModule({
            tableEl: this.para.tableDom,
            scrollEl: this.dom.parentElement,
            fixTop: 40,
            ajaxData : queryData
        }, newMtPara);

        this.on('wake', () => {
            this.tableModule.table && this.tableModule.table.resize();
            this.tableModule.lockBottom(true);
        });
    }

    private addConf(newMtPara : TableModulePara){
        let buttons = G.tools.isEmpty(newMtPara.subButtons) ? [] : newMtPara.subButtons;
        let subTables = G.tools.isEmpty(newMtPara.subTableList) ? [] : newMtPara.subTableList;

        if(buttons){
            newMtPara.subButtons = buttons;
            if(this.para.bodySubButtons){
                newMtPara.subButtons = buttons.concat(this.para.bodySubButtons);
            }
        }

        //从表
        for(let sTable of subTables){
            BwRule.beforeHandle.table(sTable);
        }
    }
}