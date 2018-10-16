/// <amd-module name="LeTableModule"/>
import {LeRule} from "../../common/rule/LeRule";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import tools = G.tools;
import IComponentPara = G.IComponentPara;
import {LeMainTableModule} from "./LeMainTable";
import {LeSubTableModule} from "./LeSubTable";
import Component = G.Component;

export interface ITableModulePara extends IComponentPara{
    tableUi: ILE_Table;
    ajaxData?: obj;
    fields: ILE_Field[];
}

export class LeTableModule extends Component{

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="le-table-module"></div>;
    }


    main: LeMainTableModule = null;
    sub: LeSubTableModule = null;
    private fields: objOf<ILE_Field> = {};

    constructor(para: ITableModulePara) {
        super(para);
        this.bwEl = para.tableUi;
        let subUi = this.bwEl.children && this.bwEl.children[0];

        para.fields.forEach(field => {
            this.fields[field.name] = field;
        });

        // this.mainEditable = !!mainVarList;
        // this.subEditable = !!subVarList;
        let main = this.main = new LeMainTableModule({
            ui: para.tableUi,
            container: this.wrapper,
            ajaxData: para.ajaxData,
            tableModule: this
        });

        //
        // if(tools.isNotEmpty(this.bwEl.subButtons)) {
        //     main.subBtns.init(this.btnWrapper);
        // }
        //
        // if (this.editable) {
        //     this.editBtns.init(this.btnWrapper);
        // }
        // this.editInit(para.bwEl);

        if(subUi) {
            let mftable = main.ftable,
                pseudoTable = mftable.pseudoTable;
            mftable.on(FastTable.EVT_RENDERED, () => {
                // let sub = this.sub || this.subInit(subUi);
                if(mftable.editing) {
                    return;
                }

                let firstRow = mftable.rowGet(0);
                if(!firstRow) {
                    this.mobileModal && (this.mobileModal.isShow = false);
                    return;
                }
                firstRow.selected = true;
                setTimeout(() => {
                    this.subRefresh(firstRow.data);
                    pseudoTable && pseudoTable.setPresentSelected(0);
                }, 200);
            });

            let self = this;
            mftable.click.add('.section-inner-wrapper.pseudo-table tbody tr[data-index]', function () {
                let rowIndex = parseInt(this.dataset.index),
                    row = mftable.rowGet(rowIndex);
                if(row && row.selected){
                    self.subRefresh(row.data);
                    pseudoTable && pseudoTable.setPresentSelected(rowIndex);
                }else{
                    self.mobileModal && (self.mobileModal.isShow = false);
                }
            });
        }
    }

    subRefresh(rowData?:obj) {
        let bwEl = this.bwEl,
            subUi = bwEl.children && bwEl.children[0],
            main = this.main,
            mftable = main.ftable;

        if(tools.isEmpty(subUi)) {
            return;
        }

        let selectedData = rowData ? rowData : (mftable.selectedRowsData[0] || {}),
            ajaxData = Object.assign({}, main.ajaxData, LeRule.varList(subUi.link.varList, selectedData));

        // 查询从表时不需要带上选项参数
        delete ajaxData['queryoptionsparam'];

        if(!this.sub) {
            this.subInit(subUi, ajaxData);
        } else {
            this.mobileModal && (this.mobileModal.isShow = true);
            this.sub.refresh(ajaxData).catch();
        }
    }

    private mobileModal: Modal = null;
    private subWrapper: HTMLElement = null;
    subInit(ui: ILE_Table, ajaxData?: obj) {

        // ui.tableAddr
        this.sub = new LeSubTableModule({
            container: this.wrapper,
            ui,
            ajaxData,
            isSub: true,
            tableModule: this
        });

        this.subWrapper = this.sub.wrapper;
    }

    private bwEl: ILE_Table;
    refresh(data?: obj) {
        return this.main.refresh(data).then(() => {
            this.main.aggregate.get();
        });
    }

    fieldGet(name: string): ILE_Field;
    fieldGet(name: string[]): ILE_Field[];
    fieldGet(name: string | string[]) {
        if(Array.isArray(name)) {
            return name.map(n => this.fields[n] || {})
        }else if(typeof name === 'string') {
            return this.fields[name] || {name: name, caption: name}
        }else{
            return {}
        }
    }

    destroy(){
        this.main && this.main.destroy();
        this.sub && this.sub.destroy();
        this.main = null;
        this.sub = null;
        // this.edit = null;
        this.bwEl = null;
        // this._btnWrapper = null;
    }


}

