/// <amd-module name="SignInDetail"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {SignModule} from "./SignModule";
import tools = G.tools;

interface ISignInDetailPara extends IComponentPara {
    isSignIn?: boolean;
}

export class SignInDetail extends Component {
    private isSignIn: boolean;

    protected wrapperInit(para: ISignInDetailPara): HTMLElement {
        let signInDetailWrapper = <div className="detail-row sign">
        </div>;
        return signInDetailWrapper;
    }

    constructor(para: ISignInDetailPara) {
        super(para);
        this.isSignIn = para.isSignIn;
    }

    set(content: obj[]) {
        if (tools.isNotEmptyArray(content)) {
            content.forEach((c) => {
                new SignModule({
                    isSignIn: this.isSignIn,
                    content: c,
                    container: this.wrapper
                })
            })
        }else{
            new SignModule({
                isSignIn: this.isSignIn,
                content: {
                    
                },
                container: this.wrapper
            })
        }
    }

    private _isShow: boolean;
    set isShow(s: boolean) {
        this._isShow = s;
        this.wrapper.classList.toggle('hide', s === false);
    }

    get isShow() {
        return this._isShow;
    }
}