/// <amd-module name="LeTablePage"/>

import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {LeTableModule} from "../../modules/LeTable/LeTableModule";
import {LeQueryModule} from "../../modules/query/LeQueryModule";
import {LeButtonGroup} from "../../modules/LeButton/LeButtonGroup";
import {LeBasicPage} from "../LeBasicPage";
import tools = G.tools;
import {Tab} from "../../../global/components/ui/tab/tab";
import {LeTableEditModule} from "../../modules/edit/LeTableEditModule";
import {FastTable} from "../../../global/components/newTable/FastTable";
import d = G.d;

interface ILeTablePagePara extends IComponentPara {
    table?: ILE_Table;
    basePage: LeBasicPage;
    querier?: ILE_Query;
    queryData?: obj;
    editor?: ILE_Editor;
    common: obj;
    inTab: boolean;
    onReady?:()=>void;
}

export class LeTablePage extends Component {
    protected _tableModule: LeTableModule;
    protected queryModule: LeQueryModule;
    protected buttonGroup: LeButtonGroup;
    protected editModule: LeTableEditModule;
    set tableModule(table: LeTableModule) {
        this._tableModule = table;
    }

    get tableModule() {
        return this._tableModule;
    }

    constructor(para: ILeTablePagePara) {
        super(para);
    }

    protected wrapperInit(para: ILeTablePagePara): HTMLElement {
        let multiBtns = (para.table.button || []).filter(button => button.multi !== 1);
        if (tools.isNotEmpty(multiBtns)) {
            let buttonWrapper = para.inTab ? <div className="basic-page-btns"/> : para.basePage.buttonGroupEl;
            if(para.inTab) {
                setTimeout(() => {
                    d.prepend(this.wrapper, buttonWrapper);
                })
            }
            this.buttonGroup = <LeButtonGroup
                c-var="buttonGroup"
                container={buttonWrapper}
                buttons={multiBtns}
                dataGet={() => this.tableModule.main.ftable.selectedRowsData}
            />
        }

        let wrapper = <div className="table-single-page">
            {para.querier ?
                this.queryModule = <LeQueryModule
                    c-var="queryModule"
                    ui={para.querier}
                    fields={para.common.fields}
                    defaultData={para.queryData}
                    search={(searchData) => this.tableModule.refresh(searchData)}
                    selects={para.table.edit ? para.table.edit.selects : null}
                    toggle={(names, isCheck) => {
                        this.setColShow(names, isCheck);
                    }}
                /> : null
            }
            {
                para.editor ?
                    this.editModule = <LeTableEditModule
                        isAutoLoad={false}
                        isWrapLine={false}
                        ui={para.editor}
                        fields={para.common.fields}/> : null
            }
        </div>;

        setTimeout(() => {
            // 防止加载框不居中
            this.tableModule = <LeTableModule
                ajaxData={this.queryModule ? this.queryModule.json : null}
                tableUi={para.table}
                container={wrapper}
                fields={para.common.fields}/>;

            if (this.editModule) {
                let mftable = this.tableModule.main.ftable,
                    pseudoTable = mftable.pseudoTable;

                mftable.on(FastTable.EVT_RENDERED, () => {
                    // let sub = this.sub || this.subInit(subUi);
                    if (mftable.editing) {
                        return;
                    }

                    let firstRow = mftable.rowGet(0);
                    firstRow.selected = true;
                    setTimeout(() => {
                        this.editModule.loadDefaultData(firstRow.data);
                        pseudoTable && pseudoTable.setPresentSelected(0);
                    }, 200);
                });

                let self = this;
                mftable.click.add('.section-inner-wrapper.pseudo-table tbody tr[data-index]', function () {
                    let rowIndex = parseInt(this.dataset.index),
                        row = mftable.rowGet(rowIndex);

                    if (row && row.selected) {
                        self.editModule.loadDefaultData(row.data);
                        pseudoTable && pseudoTable.setPresentSelected(rowIndex);
                    }
                });
            }
            tools.isNotEmpty(para.onReady) && para.onReady();
        }, 10);

        return wrapper;
    }

    setColShow(names: string[], isShow: boolean) {
        Array.isArray(names) && names.forEach((name) => {
            let column = this.tableModule.main.ftable.columnGet(name);
            column && (column.show = isShow);
        })
    }

    destroy() {
        super.destroy();
        this.queryModule && this.queryModule.destroy();
        this._tableModule && this._tableModule.destroy();
        this.buttonGroup && this.buttonGroup.destroy();
        this.queryModule = null;
        this._tableModule = null;
        this.buttonGroup = null;
    }
}