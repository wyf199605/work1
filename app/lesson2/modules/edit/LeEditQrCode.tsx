///<amd-module name="LeEditQrCode"/>
import {FormCom} from "../../../global/components/form/basic";

export class LeEditQrCode extends FormCom {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="le-edit-qrcode"/>;
    }


    get(): any {
        return this.value
    }

    set(any): void {
        this.value = any;
    }

    get value() {
        return this._value;
    }

    protected timerId: number;
    set value(val: string){
        if(val){
            let [value, time] = val.split('_'),
                timeVal = parseInt(time);

            require(['QrCode'], (q) => {
                q.QrCode.toCanvas(value + '_' + Math.floor(Date.now() / 1000), 200, 200, this.wrapper);
                if(!this.timerId && timeVal) {
                    this.timerId = setInterval(() => {
                        this.wrapper.innerHTML= '';
                        q.QrCode.toCanvas(value + '_' + Math.floor(Date.now() / 1000), 200, 200, this.wrapper);
                    }, parseInt(time) * 1000);
                }
            });
            this._value = val;
        }
    }

    destroy(){
        super.destroy();
        clearTimeout(this.timerId)
    }
}