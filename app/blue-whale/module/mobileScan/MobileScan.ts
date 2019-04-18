/// <amd-module name="MobileScan"/>
import tools = G.tools;
import d = G.d;
import { Button } from "../../../global/components/general/button/Button";
import { ShellAction } from "../../../global/action/ShellAction";
import { Modal } from "../../../global/components/feedback/modal/Modal";
import Shell = G.Shell;
interface IScanButtonPara {
    callback?(ajaxData: obj): Promise<any>
    container?: HTMLElement
    scannableField?: string
    scannableType?: number // 0扫码（rfid设备为扫码枪，手机设备为二维码）1.rfid扫码（支持多个）2.多条码扫码（不支持手机扫二维码）
    scannableTime?: number
    cols?: R_Field[]
}
export class MobileScan {
    private rfidFlag: boolean = true;
    private scanFlag: boolean = true;
    private rfidArr: string[] = [];
    private scanArr: string[] = [];
    private p: IScanButtonPara;
    constructor(para: IScanButtonPara) {
        this.p = para;
        let can2dScan = Shell.inventory.can2dScan,
            type = para.scannableType || 0;

        let btn = new Button({
            type: 'link',
            content: (type === 0 || type === 2) ? (can2dScan ? '按下扫码枪查询' : '扫码查询') : 'RFID扫码',
            size: 'large',
            container: para.container,
            className: 'mobile-scan',
            icon: can2dScan ? '' : 'richscan_icon'
        });

        // 开启扫码枪事件
        if (type === 0 && can2dScan) {
            this.scanOpen().then((res: obj) => {
                if (tools.isFunction(para.callback) && res.success && res.data !== 'openSuponScan') {
                    para.callback({ mobilescan: res.data });
                }
            });
        }

        d.on(btn.wrapper, 'click',  (e: TouchEvent)=> {
            // e.preventDefault();
            if (type === 0 && can2dScan) {
                return false;
            } else {
                switch (type) {
                    case 1:
                        if (this.rfidFlag) { // 开启
                            this.startEpc(btn);
                        } else { // 查询并关闭
                            this.stopEpc(btn, para)
                        }
                        break;
                    case 2:
                        if (!can2dScan) {
                            Modal.alert('该操作只支持扫码枪');
                            return;
                        }
                        if (this.scanFlag) {
                            btn.wrapper.innerHTML = '结束扫码';
                            this.scanFlag = false;
                            Shell.inventory.scan2dOn((res) => {
                                let data = res && res.data;
                                if (res && res.success && data !== 'openSuponScan') {
                                    !this.scanArr.includes(data) && this.scanArr.push(data);
                                }
                            });
                        } else {
                            btn.wrapper.innerHTML = '按下扫码枪查询';
                            this.scanFlag = true;
                            if (tools.isFunction(para && para.callback)) {
                                para.callback({
                                    selection: this.scanArr.join(',')
                                });
                            }
                            this.scanArr = [];
                        }
                        break;
                    default:
                        let cols = para.cols;
                        if (Array.isArray(cols)) {
                            let tip = '';
                            cols.forEach(obj => {
                                if (obj.name === para.scannableField) {
                                    tip = obj.caption;
                                }
                            });

                            Modal.toast('只能扫描' + tip);
                            setTimeout(() => {
                                this.open(para);
                            }, 500);
                        } else {
                            this.open(para);
                        }
                }

                // 处理扫码枪会自动触发按钮的点击bug
                btn.wrapper.blur();
            }
        })
        // 拖动
        d.on(btn.wrapper, 'touchstart', function (e: TouchEvent) {
         
            let ev = e.touches[0],
                wrapper = btn.wrapper,
                distanceX = ev.clientX - wrapper.offsetLeft,
                distanceY = ev.clientY - wrapper.offsetTop;

            let moveHandler = function (e: TouchEvent) {
                e.preventDefault();
                let ev = e.touches[0];
                wrapper.style.left = ev.clientX - distanceX + 'px';
                wrapper.style.top = ev.clientY - distanceY + 'px';
            };

            let endHandler = function () {
                d.off(document, 'touchmove', moveHandler);
                d.off(document, 'touchend', endHandler);
            };

            d.on(document, 'touchmove', moveHandler);
            d.on(document, 'touchend', endHandler);
        })
        d.on(btn.wrapper,"touchmove",function(e:TouchEvent){
            e.preventDefault();
        })
    }

    scanOpen() {
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
    open(para: IScanButtonPara) {
        ShellAction.get().device().scan({
            callback: (even) => {
                let data = JSON.parse(even.detail).data;

                if (typeof para.callback === 'function') {
                    para.callback({ mobilescan: data });
                }
            }
        });
        // para.callback(355751);
    }

    startEpc(btn) {
        this.rfidArr = [];
        this.rfidFlag = false;
        let time = (this.p.scannableTime || 0) * 1000;
        btn.wrapper.innerHTML = '结束扫描';

        Shell.inventory.clearEpc(null, (res) => {
            if (res.success) {
                let back = (result) => {
                    // Modal.toast(JSON.stringify(result))
                    if (result.success) {
                        if (time !== 0) {
                            this.rfidArr = [];
                        }

                        Array.isArray(result.data) && result.data.forEach(obj => {
                            this.rfidArr.push(obj.epc);
                        });
                        if (time === 0) {
                            btn.wrapper.innerHTML = '结束扫描(' + this.rfidArr.length + ')';
                        } else {
                            this.p.callback({
                                selection: this.rfidArr.join(',')
                            }).then(() => {
                                if (!this.rfidFlag) {
                                    Shell.inventory.returnEpcbyTime(null, time, true, back);
                                }
                            }).catch(() => {
                                // Modal.alert('后台请求出错，重新调用returnEpcbyTime')
                                if (!this.rfidFlag) {
                                    Shell.inventory.returnEpcbyTime(null, time, true, back);
                                }
                            })
                        }
                    } else {
                        Modal.alert(result.msg);
                    }
                };
                Shell.inventory.returnEpcbyTime(null, time, true, back);
            }
        });

    }

    stopEpc(btn, para?: IScanButtonPara) {
        // Shell.inventory.stopEpc(null, function (res) {});
        let time = this.p.scannableTime || 0;
        Shell.inventory.returnEpcbyTime(null, time, false, (result) => { });

        if (time === 0) {
            para.callback({
                selection: this.rfidArr.join(',')
            });
        }

        btn.wrapper.innerHTML = 'RFID扫码';
        this.rfidFlag = true;
    }
}


