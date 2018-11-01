/// <amd-module name="KeyStep"/>
import tools = G.tools;
import d = G.d;
import {Button} from "../../../global/components/general/button/Button";
import {ShellAction} from "../../../global/action/ShellAction";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import Shell = G.Shell;
interface IScanButtonPara{
    callback(ajaxData : obj, input? : R_Input) : Promise<any>
    container? : HTMLElement
    inputs? : R_Input[]
}
export class KeyStep{
    private p : IScanButtonPara;
    constructor(para : IScanButtonPara){
        this.p = para;
        let can2dScan = Shell.inventory.can2dScan,
            btn : Button;

        if(!can2dScan){
            btn = new Button({
                type: 'link',
                content: '扫码查询',
                size: 'large',
                container: para.container,
                className: 'keystep',
                icon:  'richscan_icon',
                onClick: () => {
                    this.evenHandle(para, can2dScan);
                }
            });
        }else {
            this.evenHandle(para, can2dScan);
        }
        // 拖动
        d.on(btn.wrapper, 'touchstart', function (e : TouchEvent) {
            let ev = e.touches[0],
                wrapper = btn.wrapper,
                distanceX = ev.clientX - wrapper.offsetLeft,
                distanceY = ev.clientY - wrapper.offsetTop;

            let moveHandler = function (e : TouchEvent) {
                e.preventDefault();
                let ev = e.touches[0];
                wrapper.style.left = ev.clientX - distanceX + 'px';
                wrapper.style.top = ev.clientY - distanceY + 'px';
            };

            let endHandler =  function () {
                d.off(document, 'touchmove', moveHandler);
                d.off(document, 'touchend', endHandler);
            };

            d.on(document, 'touchmove',moveHandler);
            d.on(document, 'touchend',endHandler);
        })
    }

    evenHandle(para : IScanButtonPara, can2dScan : boolean){
        para.inputs.forEach(input => {
            switch (input.inputType) {
                case '0':
                    if(can2dScan){
                        this.scanOpen().then((res : obj) => {
                            if(res.success && res.data !== 'openSuponScan') {
                                this.afterReg(input, res.data)
                            }
                        });
                    }else {
                        this.open(para).then((text : string) => {
                            this.afterReg(input, text)
                        });
                    }
                    break;
                case '1':
                    if(can2dScan){
                        this.startEpc(input);
                    }else {
                        this.startEpcMb(input);
                    }
                    break;
                case '2':
                    can2dScan && Shell.inventory.scan2dOn( (res) => {
                        let text = res && res.data;
                        if( res && res.success && text !== 'openSuponScan') {
                            this.afterReg(input, text);
                        }
                    });
                    break;
            }
        })
    }

    afterReg(input : R_Input, text: string){
        let regInput = this.regExpMatch(input, text);
        if(regInput){
            this.p.callback({
                mobilescan : text
            }, input)
        }
    }

    /**
     * 正则匹配按键
     * @param input
     * @param inputContent
     * @returns {boolean}
     */
    private regExpMatch(input : R_Input, inputContent: string) {
        let regArr = null,
            data = null,
            len = inputContent.length,
            minLen = input.minLength,
            maxLen = input.minLength;

            if (input.fieldRegex && minLen <= len && len <= maxLen) {
                regArr = input.fieldRegex.split(';');
                regArr.forEach(r => {
                    let patt = inputContent.match(r);
                    if (patt && patt[0] === inputContent) {
                        data = input;
                    }
                });
            }
        return data;
    }

    scanOpen(){
        return new Promise((resolve, reject) => {
            Shell.inventory.openScan((res) => {
                resolve(res)
            });
        })

    }

    /**
     * type0 rfid及手机扫码
     * @param {IScanButtonPara} para
     */
    open(para : IScanButtonPara){
        return new Promise((resolve, reject) => {
            ShellAction.get().device().scan({
                callback: (even) => {
                    resolve(JSON.parse(even.detail).data)
                }
            });
        })
    }

    startEpc(input : R_Input){
        let timer = null, isLoading = false, arr = [];
        Shell.inventory.startEpc(null, (result) => {
            if(result.success){
                let text = result.data,
                    reg = this.regExpMatch(input, text);
                reg && arr.push(text);

                if(!timer && !isLoading) {
                    timer = setTimeout(() => {
                        isLoading = true;
                        this.p.callback({selection : arr.join(',')}, input)
                            .then(() => isLoading = false);
                        arr = [];
                        timer = null;
                    },1000);
                }
            }
        });
    }

    startEpcMb(input : R_Input){
        Shell.inventory.clearEpc(null,  (res) => {
            if(res.success){
                Shell.inventory.startEpc(null, (result) => {
                    if(result.success){
                        let arr = [];
                        Array.isArray(result.data) && result.data.forEach(obj => {
                            let epc = obj.epc;
                            if(this.regExpMatch(input, epc)){
                                arr.push(epc);
                            }
                        });
                        this.p.callback({
                            selection : arr.join(',')
                        });
                        Shell.inventory.stopEpc(null, () => {});
                    }else {
                        Modal.alert(result.msg);
                    }
                });
            }
        });
    }
}


