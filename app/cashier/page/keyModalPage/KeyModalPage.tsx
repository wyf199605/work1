///<amd-module name="KeyModalPage"/>
import SPAPage = C.SPAPage;
import {KeyModal} from "../../module/keyModal/KeyModal";
import tools = C.tools;
import {Com} from "../../com";
import {inputs} from "../../EvenAction";
import d = C.d;

export class KeyModalPage extends SPAPage {
    keyModal: KeyModal;

    get title() {
        return this._title;
    }

    set title(title: string) {
        this._title = '模态框';
    }

    protected init(para: Primitive[], data : IKeyModalPara) {
        let res = data && data.data,
            clearGlobal = res && res.clearGlobal;

        let p : IKeyModalPara = {
            title: res && res.panelName,
            body: d.create(`<div></div>`),
            callback: (e: KeyboardEvent, content, type) => { // enter
                if (res && res.inputs) {
                    let code =  e.keyCode || e.which || e.charCode;
                    if(code === 13){
                        if (Com.keyFlag) {
                            Com.keyFlag = false;
                        } else {
                            return;
                        }
                        inputs(type, res, content, data.nextField);
                    }
                }
            },
            keyDownHandle : (e) => {  // esc 之前
                if(this.keyModal.disabledEsc){
                    return;
                }
                let code =  e.keyCode || e.which || e.charCode;
                if(code === 27 && clearGlobal === 1){
                    if (Com.keyFlag) {
                        Com.keyFlag = false;
                    } else {
                        return;
                    }
                    let tData = this.keyModal.itemList.getData()[0];
                    inputs(Com.KEYBOARD, res, tData.AFTERCOUPONPRICE, data.nextField);
                }
            }
        };

        this.keyModal = new KeyModal(tools.obj.merge(p, data));
        if(clearGlobal === 1){ // 取消esc关闭弹出功能
            this.keyModal.escKey = false;
        }
    }

    protected wrapperCreate() {
        return null
    }

    protected wrapperInit(): Node {
        return null;
    }

    protected destroy() {
        this.keyModal && this.keyModal.destroy();
    }
}

