/// <amd-module name="BwMainTableModule"/>
import {BwTableModule, IBwTableModulePara} from "./BwTableModule";
import tools = G.tools;
import d = G.d;
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";

export class BwMainTableModule extends BwTableModule{

    constructor(protected para: IBwTableModulePara) {
        super(para);
        d.classAdd(this.wrapper, 'table-module-main');

        // 根据UI 的initShow 判断是否先展示图表， 先默认设置为展示图表
        this.wrapper.style.display = 'none';
    }
    protected ftableReady(){
        super.ftableReady();
        this.tableHeightInit();
        if(!tools.isMb) {
            if (this.ui.printList && this.ui.printList.length > 0) {
                this.initLabelPrint();
                this.initFormPrint();
            }
        }
    }

    protected tdClickHandler(field: R_Field, rowData: obj, empty = false)  {
        super.tdClickHandler(field, rowData, empty);
        // linkName 快捷点击按键
        if(!field) return;

        let fieldName = field.name;
        if(this.btnsLinkName.includes(fieldName)) {
            let allBtn = (this.subBtns.box && this.subBtns.box.children) || [];
            for (let btn of allBtn) {
                let rBtn: R_Button = btn.data;
                if (rBtn && rBtn.linkName && rBtn.linkName === fieldName) {

                    // 等待表格行选中后
                    setTimeout(() => {
                        btn.onClick.call(btn, null);
                    }, 100);
                }
            }
        }
    }
    clickInit(){
        super.clickInit();

        let ftable = this.ftable;
        //
        // this.ftable.click.add(`${clickableSelector} tbody td`, function () {
        //     // 是否为快捷按钮
        //
        //
        //
        // });


    }
    private tableHeightInit(){
        let ui = this.ui,
            clientHeight = this.wrapper.clientHeight;

        // 移动端计算表格的高度
        if(tools.isMb) {
            if(tools.isNotEmpty(ui.subButtons) || tools.isNotEmpty(this.editParam)) {
                clientHeight -= 40;
            }
            if(ui.rfidCols && ui.rfidCols.amountFlag){
                clientHeight -= 42;

            }
            if(ui.reportTitle){
                clientHeight -= 42;
            }
            // clientHeight -= 45;

            // iphone x 兼容
            if(tools.cssSupports('height', 'env(safe-area-inset-bottom)')){

                this.ftable.wrapper.style.height  = `calc(${clientHeight + 30}px - env(safe-area-inset-bottom)`;
                console.log(this.ftable.wrapper.style.height + '----------------------------')
            }else{
                this.ftable.wrapper.style.height = clientHeight + 'px';
            }
        }
    }

    /*
    * 初始化报表打印
    * */
    protected initFormPrint(){
        let formPri,
            isFirst = true;

        this.ftable.btnAdd('formPrint', {
            content: '报表打印',
            icon: 'label',
            onClick: () => {
                if(isFirst){
                    isFirst = false;
                    let sp = new Spinner({
                        el : this.ftable.btnGet('formPrint').wrapper,
                        size : 14,
                        type  : Spinner.SHOW_TYPE.replace,
                    });
                    sp.show();

                    require(['FormPrintModule'], (formPrint) => {
                        formPri = new formPrint({
                            container: this.wrapper,
                            cols : this.ftable.dataTools.getCols(),
                            middleTable : this.ftable.mainTable.head.wrapper,
                            tableData: () => this.ftable.data
                        });
                        // formPri.modal.isShow = true;
                        sp.hide();
                    });

                }else{
                    formPri.modal.isShow = true;
                }
            }
        }, 1);
    }

    /*
    * 初始化标签打印
    * */
    protected initLabelPrint() {
        this.ftable.btnAdd('labelPrint', {
            content: '标签打印',
            icon: 'label',
            onClick: () => {
                let sp = new Spinner({
                    el : this.ftable.btnGet('labelPrint').wrapper,
                    size : 14,
                    type  : Spinner.SHOW_TYPE.replace,
                });
                sp.show();
                this.initLabelModal(this.ui.printList, () => sp.hide());
            }
        }, 0);
    }

    protected labelModal;
    initLabelModal(printList: printListArr[] = this.ui.printList, callback?: Function){
        if(!this.labelModal){
            require(['NewLabelPrint'], (Print) => {
                this.labelModal = new Print.NewLabelPrint({
                    container: this.wrapper,
                    getData: () => this.ftable.data,
                    getSelectedData: () => this.ftable.selectedRowsData,
                    ui: Object.assign({}, this.ui, {printList})
                });
                callback && callback();
            });
        }else{
            this.labelModal.modalShow = true;
            callback && callback();
        }
    }
}
