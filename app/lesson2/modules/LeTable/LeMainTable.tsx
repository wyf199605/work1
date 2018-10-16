/// <amd-module name="LeMainTableModule"/>
import tools = G.tools;
import d = G.d;
import {Button} from "../../../global/components/general/button/Button";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {ILeTableModulePara, LeBaseTable} from "./LeBaseTable";

export class LeMainTableModule extends LeBaseTable {

    constructor(para: ILeTableModulePara) {
        super(para);
        d.classAdd(this.wrapper, 'table-module-main');
    }

    // protected ftableReady(){
    //     super.ftableReady();
    //     // this.tableHeightInit()
    // }

    protected tdClickHandler(field: ILE_Field, rowData: obj)  {
        super.tdClickHandler(field, rowData);
        // linkName 快捷点击按键
        // let fieldName = field.name;
        // if(this.btnsLinkName.includes(fieldName)) {
        //     let allBtn = (this.subBtns.box && this.subBtns.box.children) || [];
        //     for (let btn of allBtn) {
        //         let rBtn: R_Button = btn.data;
        //         if (rBtn && rBtn.linkName && rBtn.linkName === fieldName) {
        //
        //             // 等待表格行选中后
        //             setTimeout(() => {
        //                 btn.onClick.call(btn, null);
        //             }, 100);
        //         }
        //     }
        // }
    }
    clickInit(){
        super.clickInit();

        // let ftable = this.ftable;
        //
        // this.ftable.click.add(`${clickableSelector} tbody td`, function () {
        //     // 是否为快捷按钮
        //
        //
        //
        // });


    }
    // private tableHeightInit(){
    //     let ui = this.ui,
    //         tableHeight = 0,
    //         clientHeight = document.body.clientHeight;
    //
    //     if(tools.isMb) {
    //         // tableHeight += 10;
    //         if(tools.isNotEmpty(ui.subButtons) || tools.isNotEmpty(this.editParam)) {
    //             tableHeight += 37;
    //         }
    //         if(ui.rfidCols && ui.rfidCols.amountFlag){
    //             tableHeight += 42;
    //
    //         }
    //         if(ui.reportTitle){
    //
    //             tableHeight += 42;
    //         }
    //         this.ftable.wrapper.style.height = clientHeight - tableHeight - 37  + 'px';
    //     }
    // }
    // public subBtns = (() => {
    //     let box: InputBox = null,
    //         ftable: FastTable = null;
    //
    //     let init = (wrapper: HTMLElement) => {
    //         ftable = this.ftable;
    //
    //         box = new InputBox({
    //             container: wrapper,
    //             isResponsive: !tools.isMb,
    //             className: !tools.isMb ? 'pull-right' : ''
    //         });
    //
    //         let btnsUi = this.ui.button;
    //
    //         Array.isArray(btnsUi) && btnsUi.forEach((btnUi) => {
    //             let btn = new Button({
    //                 icon: btnUi.icon,
    //                 content: btnUi.title,
    //                 isDisabled: !(btnUi.multiselect === 0 || btnUi.multiselect === 2 && btnUi.selectionFlag),
    //                 data: btnUi,
    //                 onClick: () => {
    //
    //                         let btnUi = btn.data as R_Button,
    //                             {multiselect, selectionFlag} = btnUi,
    //                             selectedData = multiselect === 2 && selectionFlag ?
    //                                 ftable.unselectedRowsData : ftable.selectedRowsData;
    //
    //                         // if (multiselect === 2 && !selectedData[0]) {
    //                         //     // 验证多选
    //                         //     Modal.alert('请至少选一条数据');
    //                         //     return;
    //                         // } else if (btn.data.multiselect === 1 && (!selectedData[0] || selectedData[1])) {
    //                         //     // 单选验证
    //                         //     Modal.alert('请选最多一条数据');
    //                         //     return;
    //                         // }
    //
    //                         // ButtonAction.get().clickHandle(btnUi, multiselect === 1 ? selectedData[0] : selectedData,(res)=>{},this.pageUrl);
    //
    //                 }
    //             });
    //             box.addItem(btn);
    //         });
    //
    //         // 根据选中行数判断按钮是否可操作
    //         this.ftable.on(FastTable.EVT_SELECTED, () => {
    //             let selectedLen = ftable.selectedRows.length,
    //                 allLen = ftable.rows.length;
    //
    //             box.children.forEach(btn => {
    //                 let selectionFlag = btn.data.selectionFlag,
    //                     len = btn.data.selectionFlag ? allLen - selectedLen : selectedLen;
    //
    //                 if (len === 0) {
    //                     btn.isDisabled = selectionFlag ? false : btn.data.multiselect > 0;
    //                 } else if (selectedLen === 1) {
    //                     btn.isDisabled = false;
    //                 } else {
    //                     btn.isDisabled = btn.data.multiselect !== 2;
    //                 }
    //             });
    //         });
    //     };
    //
    //     return {
    //         init,
    //         get box() {
    //             return box
    //         }
    //     }
    // })();
}