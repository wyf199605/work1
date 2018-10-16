/// <amd-module name="SignInModule"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {SignInItem} from "./SignInItem";
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import {SignContentPara} from "../ReportActivityData";

export class SignInModule extends Component {
    private _signInItemArr: SignInItem[];
    set signInItemArr(s: SignInItem[]) {
        this._signInItemArr = s;
    }

    get signInItemArr() {
        return this._signInItemArr;
    }

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        let signInWrapper = <div className="row addRow">
            <SignInItem c-var="add" isAdd={true} addBtnHandler={() => {
                this.createNewSignInItem();
            }}/>
        </div>;
        return signInWrapper;
    }

    constructor(para: IComponentPara) {
        super(para);
        this.signInItemArr = [(this.innerCom.add as SignInItem)]
    }

    private createNewSignInItem(signContent?: SignContentPara) {
        let item = new SignInItem({
            container: this.wrapper,
            isAdd: false,
            removeBtnHandler: () => {
                item.destroy();
                let a = this.signInItemArr,
                    index = a.indexOf(item);
                a.splice(index, 1);
                this.signInItemArr = a;
            },
            defaultValue: signContent
        });
        if (tools.isEmpty(signContent)) {
            item.set({});
        }
        let arr = this.signInItemArr;
        this.signInItemArr = arr.concat(item);
    }

    set disabled(disabled: boolean) {
        if (tools.isEmpty(disabled)) {
            return;
        }
        this._disabled = disabled;
        tools.isNotEmpty(this.signInItemArr) && this.signInItemArr.forEach(signItem => {
            (signItem as SignInItem).disabled = disabled;
        });
    }

    get disabled() {
        return this._disabled;
    }

    set(data: SignContentPara[]) {
        if (tools.isNotEmpty(data)) {
            let firstValue: SignContentPara,
                otherValue = [];
            if (tools.isNotEmptyArray(data)) {
                firstValue = data[0];
                otherValue = data.slice(1);
            }
            (this.innerCom.add as SignInItem).set(firstValue);
            otherValue.forEach(val => {
                this.createNewSignInItem(val);
            })
        } else {
            (this.innerCom.add as SignInItem).set({});
        }
    }

    get() {
        let signContent = [];
        for (let i = 0; i < this.signInItemArr.length; i++) {
            let item = this.signInItemArr[i],
                value = item.get();
            if (!!!value) {
                return false;
            }
            signContent.push(value);
        }
        if (signContent.length === 0) {
            Modal.alert('签到内容不能为空!');
            return false;
        }
        return signContent;
    }
}