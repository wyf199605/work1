/// <amd-module name="BwSubTableModule"/>
import {BwTableModule, IBwTableModulePara} from "./BwTableModule";
import tools = G.tools;
import d = G.d;

export class BwSubTableModule extends BwTableModule{
    constructor(para: IBwTableModulePara) {
        super(para);

    }

    protected ftableReady() {
        super.ftableReady();
        tools.isNotEmpty(this.ui.subButtons) && this.subBtns.init(this.subBtnWrapper);
    }

    protected _subBtnWrapper: HTMLElement;
    get subBtnWrapper(){
        if (!this._subBtnWrapper) {
            // debugger;
            if (tools.isMb) {
                let modal = this.tableModule.mobileModal;
                let btnWrapper = <div className="sub-btn-wrapper mui-bar-footer"/>;
                modal.bodyWrapper.style.height = 'calc(100% - 39px)';
                d.after(modal.bodyWrapper, btnWrapper);
                this._subBtnWrapper = btnWrapper;

            } else {
                this._subBtnWrapper = this.ftable.btnWrapper
            }
        }
        return this._subBtnWrapper;
    }

    wrapperInit(para){
        let wrapper = super.wrapperInit(para);
        d.classAdd(wrapper, 'table-module-sub');
        return wrapper;
    }

}