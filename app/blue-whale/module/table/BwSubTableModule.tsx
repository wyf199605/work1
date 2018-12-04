/// <amd-module name="BwSubTableModule"/>
import {BwTableModule, IBwTableModulePara} from "./BwTableModule";
import tools = G.tools;
import d = G.d;

export class BwSubTableModule extends BwTableModule{
    constructor(para: IBwTableModulePara) {
        super(para);

    }
    protected ftableReady() {
        tools.isNotEmpty(this.ui.subButtons) && this.subBtns.init(this.btnWrapper);
        super.ftableReady();
    }

    protected _btnWrapper: HTMLElement;
    get btnWrapper(){
        if (!this._btnWrapper) {
            // debugger;
            if (tools.isMb) {
                // let modal = this.tableModule.mobileModal;
                let btnWrapper = <div className="sub-btn-wrapper mui-bar-footer"/>;
                // modal.bodyWrapper.style.height = 'calc(100% - 39px)';
                d.append(this.wrapper, btnWrapper);
                this._btnWrapper = btnWrapper;
            } else {
                this._btnWrapper = this.ftable.btnWrapper
            }
        }
        return this._btnWrapper;
    }

    wrapperInit(para){
        let wrapper = super.wrapperInit(para);
        d.classAdd(wrapper, 'table-module-sub');
        return wrapper;
    }

}