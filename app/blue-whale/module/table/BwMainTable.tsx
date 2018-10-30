/// <amd-module name="BwMainTableModule"/>
import {BwTableModule, IBwTableModulePara} from "./BwTableModule";
import tools = G.tools;
import d = G.d;
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Inputs} from "../inputs/inputs";

export class BwMainTableModule extends BwTableModule{

    constructor(protected para: IBwTableModulePara) {
        super(para);
        d.classAdd(this.wrapper, 'table-module-main');

    }
    protected ftableReady(){
        super.ftableReady();
        this.keyStep();
        this.tableHeightInit();
        if(!tools.isMb) {
            if (this.ui.printList && this.ui.printList.length > 0) {
                this.initLabelPrint();
                this.initFormPrint();
            }
        }
    }

    private keyStep(){
        setTimeout(() => {
            if (this.ui.inputs) {
                new Inputs({
                    inputs: this.ui.inputs,
                    container: this.wrapper,
                    table: this.ftable,
                })
            }
        }, 200);
    }

    protected tdClickHandler(field: R_Field, rowData: obj)  {
        super.tdClickHandler(field, rowData);
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
            clientHeight = document.body.clientHeight;

        // 移动端计算表格的高度
        if(tools.isMb) {
            if(tools.isNotEmpty(ui.subButtons) || tools.isNotEmpty(this.editParam)) {
                clientHeight -= 37;
            }
            if(ui.rfidCols && ui.rfidCols.amountFlag){
                clientHeight -= 42;

            }
            if(ui.reportTitle){
                clientHeight -= 42;
            }
            clientHeight -= 45;

            // iphone x 兼容
            if(CSS && CSS.supports && CSS.supports('height: env(safe-area-inset-bottom)')){
                this.ftable.wrapper.style.height  = `calc(${clientHeight}px - env(safe-area-inset-bottom) - env(safe-area-inset-bottom))`;
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
    protected initLabelPrint(callback?: Function) {
        let label,
            isFirst = true;

        this.ftable.btnAdd('labelPrint', {
            content: '标签打印',
            icon: 'label',
            onClick: () => {
                if(isFirst) {
                    isFirst = false;
                    let sp = new Spinner({
                        el : this.ftable.btnGet('labelPrint').wrapper,
                        size : 14,
                        type  : Spinner.SHOW_TYPE.replace,
                    });
                    sp.show();

                    require(['LabelPrintModule'], (Print) => {
                        let moneys = {};
                        this.ftable.columnsVisible.forEach((col) => {
                            if(col.content && col.content.dataType === '11'){
                                moneys[col.name.toLowerCase()] = col.content;
                            }
                        });
                        let defalutVal;
                        try{
                            defalutVal = JSON.parse(this.ui.printSetting);
                        }catch (e){
                            console.log(e);
                        }
                        try{
                        label = new Print({
                            moneys,
                            defaultVal: defalutVal,
                            printList: this.para.ui.printList,
                            container: this.wrapper,
                            cols: this.ftable.columns,
                            getData: () => this.ftable.data,
                            selectedData: () => this.ftable.selectedRowsData,
                            callBack : () => {
                                callback && callback();
                            },
                            onSetDefault: (data: string) => {
                                console.log(data);
                                BwRule.Ajax.fetch(tools.url.addObj(BW.CONF.ajaxUrl.labelDefault, {'item_id': this.ui.itemId}), {
                                    type: 'POST',
                                    data: {
                                        printSetting: data
                                    }
                                }).then(() => {
                                    Modal.toast('设置默认值成功');
                                }).catch(() => {
                                    Modal.toast('设置默认值失败');
                                })
                            }
                        });
                        }catch (e){
                            console.log(e);
                        }
                        sp.hide();
                    });
                }else{
                    label.modal.isShow = true;
                }
            }
        }, 0);
    }
}