/// <amd-module name="SignBackModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {SignBackItem, SignBackPara} from "./SignBackItem";
import tools = G.tools;

export class SignBackModule extends Component {
    protected wrapperInit(para: IComponentPara): HTMLElement {
        let signBackModuleWrapper = <div className="row hide">
            <SignBackItem c-var="signBackItem"/>
        </div>;
        return signBackModuleWrapper;
    }

    constructor(para: IComponentPara) {
        super(para);
    }

    set disabled(disabled:boolean){
        if (tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        (this.innerCom.signBackItem as SignBackItem).disabled = disabled;
    }
    get disabled(){
        return this._disabled;
    }
    set(data: SignBackPara) {
        if (tools.isNotEmpty(data)){
            (this.innerCom.signBackItem as SignBackItem).set(data);
        }else{
            (this.innerCom.signBackItem as SignBackItem).set({})
        }
    }

    get() {
        let signBack = (this.innerCom.signBackItem as SignBackItem).get();
        if (!!!signBack) {
            return false;
        }
        return true;
    }
}