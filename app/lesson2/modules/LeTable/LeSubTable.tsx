/// <amd-module name="LeSubTableModule"/>
import d = G.d;
import tools = G.tools;
import {ILeTableModulePara, LeBaseTable} from "./LeBaseTable";
import {LeButtonGroup} from "../LeButton/LeButtonGroup";

export class LeSubTableModule extends LeBaseTable {
    constructor(para: ILeTableModulePara) {
        super(para);
        d.classAdd(this.wrapper, 'table-module-sub');
    }

    private buttonGroup: LeButtonGroup;

    protected wrapperInit(para: ILeTableModulePara): HTMLElement {
        let wrapper = super.wrapperInit(para),
            multiBtns = (para.ui.button || []).filter(button => button.multi !== 1);
        //
        // multiBtns.forEach(btn => {
        //     if(btn.multi === 0){
        //         btn.multi = 1;
        //     }
        // });
        if (tools.isNotEmpty(multiBtns)) {
            this.buttonGroup = <LeButtonGroup
                c-var="buttonGroup"
                container={wrapper}
                buttons={multiBtns}
                dataGet={() =>this.tableModule.main.ftable.selectedRowsData[0]}
            />;
        }


        return wrapper;
    }

}