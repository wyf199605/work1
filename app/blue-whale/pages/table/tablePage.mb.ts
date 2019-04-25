///<amd-module name="TablePageMb"/>
import TableModuleMb = require('../../module/table/tableModuleMb');
import {BwRule} from "../../common/rule/BwRule";
import d = G.d;
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {TablePage} from "./tablePage";
export = class TablePageMb extends TablePage {
    protected initTable(tableModule: typeof TableModuleMb,newMtPara : TableModulePara,queryData : obj) {
        this.dealConf.add(newMtPara);
        console.log('table mb', this.para)
        if(!this.para.tableDom){
            this.para.tableDom = <HTMLTableElement>d.create('<table class="mobileTable"><tbody></tbody></table>');
            let mobileCon = d.query('body > .mui-content');
            d.append(mobileCon,this.para.tableDom);
        }
        console.log('table page mb',this.para);
        this.tableModule = new tableModule({
            tableEl: this.para.tableDom,
            scrollEl: document.body,
            // fixTop: 44,
            ajaxData : queryData
        }, newMtPara);
    }
    private dealConf = (()=>{
        let addBtn: R_Button = null;
        let headerBut : HTMLElement = null;
        let _clickHandle = function(){
            ButtonAction.get().clickHandle(addBtn, null);
        };
        let add = (newMtPara : TableModulePara)=>{
            destory();
            let buttons = G.tools.isEmpty(newMtPara.subButtons) ? [] : newMtPara.subButtons;
            let subTables = G.tools.isEmpty(newMtPara.subTableList) ? [] : newMtPara.subTableList;
            let btnArray = [];
            for(let btn of buttons){
                if(btn.subType === 'insert'){
                    addBtn = btn;
                }
                else{
                    btnArray.push(btn);
                }
            }
            newMtPara.subButtons = btnArray;
            if(addBtn) {
                let butHtml = '';
                let tempBut = [addBtn];
                for(let btn of tempBut){
                    let tblBtn = <R_Button>btn;
                    butHtml += `<a class="mui-pull-right"><span class="mui-icon ${tblBtn.icon}"></span>${tblBtn.title}</a>`;
                }
                headerBut = d.create(butHtml);
                d.before(d.query('body > header > .mui-pull-right'),headerBut);
                // 绑定header中的事件
                d.on(headerBut, 'tap', _clickHandle);
            }
            //从表
            for(let sTable of subTables){
                BwRule.beforeHandle.table(sTable);
            }
        };
        let destory = ()=>{
            if(headerBut){
                d.off(headerBut, 'tap', _clickHandle);
                d.remove(headerBut);
            }
        };
        return {add}
    })();
}