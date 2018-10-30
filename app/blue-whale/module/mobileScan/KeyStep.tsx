/// <amd-module name="MobileScan"/>
import tools = G.tools;
import d = G.d;
import {Button} from "../../../global/components/general/button/Button";
import {ShellAction} from "../../../global/action/ShellAction";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import Shell = G.Shell;
interface IScanButtonPara{
    callback?(ajaxData : obj) : Promise<any>
    container? : HTMLElement
    scannableField? : string
    scannableType? : number // 0扫码（rfid设备为扫码枪，手机设备为二维码）1.rfid扫码（支持多个）2.多条码扫码（不支持手机扫二维码）
    scannableTime? : number
    cols? : R_Field[]
}
export class MobileScan{
    private rfidFlag : boolean = true;
    private rfidArr : string[] = [];
    private p : IScanButtonPara;
    constructor(para : IScanButtonPara){
        this.p = para;
        let can2dScan = Shell.inventory.can2dScan,
            btn : Button,
            type = para.scannableType || 0;

        if(!can2dScan && type !== 2){
            btn = new Button({
                type: 'link',
                content: '扫码查询',
                size: 'large',
                container: para.container,
                className: 'mobile-scan',
                icon:  'richscan_icon',
                onClick: () => {
                    switch (type){
                        case 0:
                            let cols = para.cols;
                            if(Array.isArray(cols)){
                                let tip = '';
                                cols.forEach(obj => {
                                    if (obj.name === para.scannableField) {
                                        tip = obj.caption;
                                    }
                                });

                                tip && Modal.toast('只能扫描' + tip);
                                setTimeout(() => {
                                    this.open(para);
                                }, 500);
                            }else {
                                this.open(para);
                            }
                            break;
                        case 1:
                            if(this.rfidFlag){ // 开启
                                this.startEpc(btn);
                            }else { // 查询并关闭
                                this.stopEpc(btn)
                            }
                            break;
                    }
                }
            });
        }else {
            this.evenHandle(para,can2dScan)
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

    evenHandle(para, can2dScan : boolean, btn? : Button){
        let type = para.scannableType || 0;
        switch (type) {
            case 0:
                if(can2dScan){
                    this.scanOpen().then((res : obj) => {
                        if(tools.isFunction(para.callback) && res.success && res.data !== 'openSuponScan') {
                            para.callback({mobilescan : res.data});
                        }
                    });
                }else {
                    let cols = para.cols;
                    if(Array.isArray(cols)){
                        let tip = '';
                        cols.forEach(obj => {
                            if (obj.name === para.scannableField) {
                                tip = obj.caption;
                            }
                        });

                        tip && Modal.toast('只能扫描' + tip);
                        setTimeout(() => {
                            this.open(para);
                        }, 500);
                    }else {
                        this.open(para);
                    }
                }
                break;
            case 1:
                if(can2dScan){
                    this.startEpc();
                }else {
                    if(this.rfidFlag){ // 开启
                        this.startEpc(btn);
                    }else { // 查询并关闭
                        this.stopEpc(btn)
                    }
                }
                break;
            case 2:
                can2dScan && Shell.inventory.scan2dOn( (res) => {
                    let data = res && res.data;
                    if( res && res.success && data !== 'openSuponScan') {
                        if(tools.isFunction(para && para.callback)){
                            para.callback({
                                selection : data
                            });
                        }
                    }
                });
                break;
        }
    }

    scanOpen(){
        // Shell.inventory.supon()
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
        ShellAction.get().device().scan({
            callback: (even) => {
                let data = JSON.parse(even.detail).data;

                if(typeof para.callback === 'function'){
                    para.callback({mobilescan : data});
                }
            }
        });
        // para.callback(355751);
    }

    startEpc(btn? : Button){
        this.rfidArr = [];
        this.rfidFlag = false;

        Shell.inventory.clearEpc(null,  (res) => {
            if(res.success){
                let back =  (result) => {
                    // Modal.toast(JSON.stringify(result))
                    if(result.success){
                        Array.isArray(result.data) && result.data.forEach(obj => {
                            this.rfidArr.push(obj.epc);
                        });
                        btn && (btn.wrapper.innerHTML = '结束扫描(' + this.rfidArr.length + ')');
                        Shell.inventory.startEpc(null, back);

                    }else {
                        Modal.alert(result.msg);
                    }
                };
                Shell.inventory.startEpc(null, back);
            }
        });
    }

    stopEpc(btn){
        Shell.inventory.stopEpc(null, (result) => {});
        btn && (btn.wrapper.innerHTML = 'RFID扫码');
        this.rfidFlag = true;
    }
}


