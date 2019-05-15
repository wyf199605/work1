///<amd-module name="Inputs"/>
import d = G.d;
import CONF = BW.CONF;
import tools = G.tools;
import { Modal } from "../../../global/components/feedback/modal/Modal";
import { Toast } from "../../../global/components/feedback/toast/Toast";
import { BwRule } from "../../common/rule/BwRule";
import { SelectInputMb } from "../../../global/components/form/selectInput/selectInput.mb";
import { FastBtnTable } from "../../../global/components/FastBtnTable/FastBtnTable";
import { Button } from "../../../global/components/general/button/Button";
import { ShellAction } from "../../../global/action/ShellAction";
import Shell = G.Shell;
import { BarCode } from "cashier/global/utils/barCode";

interface InputsPara {
    inputs: R_Input[]
    locationLine?: string
    container: HTMLElement
    keyField?: string
    table?: Function    // 获取表格ftable
    afterScan?: Function
    tableModule?: Function // 获取表格模块
    queryModule?: Function // 查询器
    setListItemData?: (data: obj[]) => void // 设置单页数据
}
interface IKeyStepPara {
    callback(text: string, input?: R_Input, open?: Function): Promise<any>
    container?: HTMLElement
    inputs?: R_Input[]
    locationLine?: string
}
interface IRfidConfPara {
    line: number,
    ip: string,
    port: number,
    com: string,
    baud: number,
    aerial: number,
    buzz: boolean,
    led: boolean,
}
/**
 * Inputs在pc端为按键输入，移动端为扫码,根据后台返回类型区分各种操作
 */
export class Inputs {
    private p: InputsPara;
    private m: Toast;
    private isProcess: boolean = false; // 连续扫码，记录当前操作是否结束
    private url: string;  //记录当前请求的url步骤,每次请求从该步骤开始
    private keyStep: KeyStep;
    private port: any;
    constructor(private para: InputsPara) {
        console.log('------------', para);
        this.p = para;
        para.container.tabIndex = parseInt(G.tools.getGuid());
        this.eventInit(para);
        /**rfid设置 */
        let result:any=Shell.other.getData();
        let conf = JSON.parse(result);
        this.port = getRfidPort(conf);
        console.log("RFID" + JSON.stringify(this.port))
        Shell.rfid.start(this.port.str, this.port.num, (result) => {
            // console.log(result);
            /**
             * result={data:["300833B2DDD9014000000000"],msg:"插入成功",success:true}
             */
            // alert(JSON.stringify(result));
            let msg = result.success ? 'rfid开启成功' : 'rfid开启失败',
                data = result.data;
            console.log(msg);
            console.log(data);
            if (result.success) {
                // data.forEach(item => {
                   
                // })
                para.inputs.forEach(input => {
                    let line = para.locationLine;
                    let reg = regExpMatch(input, data[0]);
                    //匹配成功
                    if (reg) {
                        this.matchPass(reg,  data[0]);
                    } else if (line) {
                        this.rowSelect(line,  data[0]);
                    }
                });
                // this.matchPass(reg, text);

            }

        });

        // setTimeout(() => {
        //     this.ajax("http://192.168.1.222:8080/sf/app_sanfu_retail/null/monitorkey/n1-move-19?needparam=%5B%7B%22n%22%3A%22toshopid%22%7D%2C%7B%22n%22%3A%22TOSHOPID%22%7D%5D&toshopid=1111&inputtext=8100247691", () => {

        // })
        // }, 1000);
    }

    /**
     * 匹配成功
     * @param data
     * @param text
     * @param open
     */
    private matchPass(data: R_Input, text: string, open?: Function) {
        let newUrl = this.url ? this.url : data.dataAddr.dataAddr;
        if (newUrl.indexOf('?') > -1) {
            newUrl += '&';
        } else {
            newUrl += '?';
        }
        let ajaxUrl = CONF.siteUrl + newUrl + data.fieldName.toLowerCase() + '=' + text;
        return this.ajax(ajaxUrl, open);
    }

    private ajax(aUrl: string, open: Function) {
        this.isProcess = true;
        return BwRule.Ajax.fetch(aUrl)
            .then(({ response }) => {
                this.condition(response, aUrl, open);
                return response;
            }).catch(() => {
                this.isProcess = false;
            }).finally(() => {
                this.isProcess = false;
            })
    }

    private condition(response: obj, aUrl: string, open: Function) {
        let elements = response.body && response.body.elements && response.body.elements[0] && response.body.elements[0];
        if (elements) {
            this.atvarParams(elements.atvarparams, elements.subButtons, aUrl, open);
            return;
        }
        let body = response.body && response.body.bodyList && response.body.bodyList[0],
            category = body.category || {},
            dataType = body.dataType,
            atvarObj = body.atvarObj,
            catType = category.type,
            showText = category.showText,
            ftable: FastBtnTable = tools.isFunction(this.p.table) && this.p.table();

        if (atvarObj) {
            this.atvarParams(atvarObj.atvarparams, atvarObj.subButtons, aUrl, open);
        }

        this.url = category.url;
        switch (catType) { // 有atvarObj时候只允许配置catType为0，否者会出现多个弹框问题及连续扫码bug
            case 0:
                // 数据覆盖
                this.isProcess = false;
                !atvarObj && this.reOpen(open);
                break;
            case 1:
                // 标签打印
                let tableModule = this.p.tableModule();
                tableModule.labelPrint.show(tableModule.labelBtn.wrapper, category.printList, () => {
                    this.ajax(CONF.siteUrl + this.url, open);
                });
                break;
            case 2:
                // 提示错误信息
                let m = Modal.alert(showText, '提示', () => {
                    this.isProcess = false;
                    this.reOpen(open);
                });
                m.onClose = () => {
                    this.isProcess = false;
                    this.reOpen(open);
                };
                break;
            case 3:
                // 提示信息,确定(下一步)/取消
                let c = Modal.confirm({
                    msg: showText,
                    btns: ['取消', '确定'],
                    noHide: true,
                    callback: (index) => {
                        if (index === true) {
                            this.ajax(CONF.siteUrl + this.url, open);
                        } else {
                            this.url = null;
                            this.reOpen(open);
                        }
                        this.isProcess = false;
                        c.destroy();
                    }
                });
                c.onClose = () => {
                    this.isProcess = false;
                    this.reOpen(open);
                };
                break;
            case 4:
                // 提示信息,自动下一步
                this.ajax(CONF.siteUrl + this.url, open);
                break;
            case 5:
                BW.sys.window.open({ url: CONF.siteUrl + this.url });
                this.url = '';
                break;
            default:
                this.isProcess = false;
                !atvarObj && this.reOpen(open);
        }

        dataType === 0 && this.dataCover(ftable, response);
        ![2, 3].includes(catType) && this.logTip(showText);

    }

    /**
     * 再次打开摄像头
     * @param open
     */
    private reOpen(open: Function) {
        typeof open === 'function' && open();
    }

    /**
     * 数据刷新
     * @param ftable
     * @param response
     */
    private dataCover(ftable: FastBtnTable, response: obj) {
        let data = response.data,
            queryModule = this.para.queryModule && this.para.queryModule();
        if (tools.isEmpty(data)) return;

        queryModule && queryModule.hide();
        if (queryModule && !ftable) {
            queryModule.para.refresher({}, true).then(() => {
                this.p.table().data = data;
            })
        } else if (ftable) {
            setTimeout(() => {
                ftable.data = data;
            }, 1000);
        } else if (tools.isFunction(this.para.setListItemData)) {
            this.para.setListItemData(data);
        }
    }

    /**
     * 提示信息
     * @param showText
     */
    private logTip(showText: string) {
        if (tools.isEmpty(showText)) {
            return;
        }
        this.m && this.m.destroy();
        this.m = new Toast({
            type: 'simple',
            className: 'max-index',
            position: 'bottom',
            content: showText,
            container: this.para.container
        });
    }

    private atvarParams(atvarparams: obj, subButtons: obj[], aUrl: string, open: Function) {
        this.isProcess = true;
        let atv, modal = new Modal({
            header: {
                title: '提示'
            },
            isOnceDestroy: true,
            isMb: false,
            top: 50,
            body: d.create('<div class="inputs-atv"></div>') as HTMLElement,
            footer: {},
            onOk: () => {
                let atvData = atv.dataGet(),
                    url = tools.url.addObj(CONF.siteUrl + subButtons[0].actionAddr.dataAddr, atvData ? { 'atvarparams': JSON.stringify(atv.dataGet()) } : null);

                //必选判断
                let errTip = '';
                atvarparams.forEach(obj => {
                    if (obj.atrrs.requiredFlag === 1 && atvData[obj.field_name] === '') {
                        errTip += obj.caption + ',';
                    }
                });
                if (errTip !== '') {
                    Modal.alert(errTip.substring(0, errTip.length - 1) + '不能为空');
                    return;
                }
                modal.destroy();
                BwRule.Ajax.fetch(url, {
                    type: 'get',
                }).then(({ response }) => {
                    this.condition(response, aUrl, open);
                }).catch(() => {
                    this.isProcess = false;
                })
            }
        });
        modal.onClose = () => {
            this.isProcess = false;
            this.reOpen(open);
        };

        require(['QueryBuilder'], (q) => {
            atv = new q.AtVarBuilder({
                queryConfigs: atvarparams,
                resultDom: modal.body,
                tpl: () => d.create(`<div class="self_dis2 atvarDom atvar-auto"><div style="display: inline-block;" data-type="title"></div>
                <div data-type="input"></div></div>`),
                setting: null
            });
            let dom = d.query(".self_dis2").parentNode as HTMLElement;
            let inputList = Array.prototype.slice.call(dom.querySelectorAll('input'), 0);
            let areaList = Array.prototype.slice.call(dom.querySelectorAll('textarea'), 0);
            let all = inputList.concat(areaList);
            let status = false;
            for (var i = 0; i < all.length; i++) {
                let item = all[i] as any;
                if (item.hasAttribute('readonly')) {
                    item.style.cssText = "color:#9e9e9e;cursor:not-allowed";
                    item.parentNode.style.position = "relative";
                    let htl = d.create('<div class="undisalbe"></div>')
                    item.parentNode.appendChild(htl)
                }
                if (!status && !item.hasAttribute('readonly')) {
                    item.focus();
                    status = true;
                }
            }

            let coms = atv.coms,
                keys = Object.keys(coms);
            if (keys && keys.length === 1 && coms[keys[0]] instanceof SelectInputMb) {
                coms[keys[0]].showList();
            }
        });

    }

    /**
     * 初始化按键事件 
     * @param para
     */
    private eventInit(para: InputsPara) {
        console.log('keyStep', para)
        if (G.tools.isMb) {
            this.keyStep = new KeyStep({
                inputs: para.inputs,
                callback: (ajaxData, input, open) => {
                    if (input && !this.isProcess) {
                        return this.matchPass(input, ajaxData, open);
                    } else if (para.locationLine) {
                        return this.rowSelect(para.locationLine, ajaxData);
                    } else {
                        return new Promise(resolve => { resolve() })
                    }
                }
            });
            return;
        }
        para.inputs.forEach(input => {
            let text = '', timer = null,
                timeInterval = input.timeout,
                line = para.locationLine;
            d.on(para.container, 'keydown', (e: KeyboardEvent) => {
                let handle = () => {
                    if (text.indexOf('Shift') > -1) {
                        text = text.replace('Shift', '')
                    }
                    // console.log(text)
                    let reg = regExpMatch(input, text);
                    //匹配成功
                    if (reg) {
                        this.matchPass(reg, text);
                    } else if (line) {
                        this.rowSelect(line, text);
                    }

                    timer = null;
                    text = '';
                },
                    code = e.keyCode || e.which || e.charCode;
                if (code === 13) {
                    handle();
                } else {
                    text += e.key;
                    if (timer) {
                        clearTimeout(timer);
                    }
                }

                timer = setTimeout(handle, timeInterval);
            });
        });
    }

    private rowSelect(line: string, text: string) {
        return new Promise(resolve => {
            let fstable = tools.isFunction(this.para.table) && this.para.table(),
                index = fstable && fstable.locateToRow(line, text, true),
                tableModule = tools.isFunction(this.para.tableModule) && this.para.tableModule();

            if (tools.isNotEmpty(index) && tableModule && tableModule.bwEl.subTableList) {
                tableModule.subRefreshByIndex(index);
            }
            resolve();
        })
    }
    destory() {
        Shell.rfid.stop(() => { });
    }
}

/**
 *
 */
export class KeyStep {
    private p: IKeyStepPara;
    constructor(para: IKeyStepPara) {
        this.p = para;
        let can2dScan = Shell.inventory.can2dScan,
            btn: Button;

        if (!can2dScan && tools.isMb) {
            btn = new Button({
                type: 'link',
                content: '扫码查询',
                size: 'large',
                container: para.container,
                className: 'keystep',
                icon: 'richscan_icon',
                onClick: () => {
                    this.evenHandle(para, can2dScan);
                }
            });
        } else {
            this.evenHandle(para, can2dScan);
        }
        // 拖动
        d.on(btn.wrapper, 'touchstart', function (e: TouchEvent) {
            let ev = e.touches[0],
                wrapper = btn.wrapper,
                evX = ev.clientX,
                evY = ev.clientY,
                top = wrapper.offsetTop,
                left = wrapper.offsetLeft;

            let moveHandler = function (i: TouchEvent) {
                let iv = i.touches[0],
                    ivX = iv.clientX,
                    ivY = iv.clientY,
                    distanceX = evX - ivX,
                    distanceY = evY - ivY;
                wrapper.style.left = left - distanceX - 30 + 'px';
                wrapper.style.top = top - distanceY + 'px';
            };

            let endHandler = function () {
                d.off(document, 'touchmove', moveHandler);
                d.off(document, 'touchend', endHandler);
            };

            d.on(document, 'touchmove', moveHandler);
            d.on(document, 'touchend', endHandler);
        })
    }

    evenHandle(para: IKeyStepPara, can2dScan: boolean) {
        if (Array.isArray(para.inputs)) {
            para.inputs.forEach(input => {
                let type = input.inputType;
                switch (type) {
                    case '0':
                    case '2': // 移动端支持连续扫码
                        if (can2dScan) {
                            let open = () => {
                                this.scanOpen().then((res: obj) => {
                                    if (res.success && res.data !== 'openSuponScan') {
                                        this.p.callback(res.data, regExpMatch(input, res.data))
                                    }
                                    open();
                                });
                            };
                            open();
                        } else {
                            let open = () => {
                                this.open(para).then((text: string) => {
                                    let reg = regExpMatch(input, text),
                                        conScan = tools.isMb && type === '2';

                                    this.p.callback(text, reg, conScan && open);

                                    // 没有通过正则匹配
                                    !reg && conScan && open();
                                });
                            };
                            open();

                        }
                        break;
                    case '1':
                        if (can2dScan) {
                            this.startEpc(input);
                        }
                        break;
                }
            })
        } else if (para.locationLine) { // 定位功能
            if (can2dScan) {
                let open = () => {
                    this.scanOpen().then((res: obj) => {
                        if (res.success && res.data !== 'openSuponScan') {
                            this.p.callback(res.data).then()
                        }
                        open();
                    });
                };
                open();
            } else {
                this.open(para).then((text: string) => {
                    this.p.callback(text).then()
                });

            }
        }
    }

    scanOpen() {
        return new Promise((resolve) => {
            Shell.inventory.scan2dOn((res) => {
                resolve(res)
            });
        })

    }

    /**
     * type0 rfid及手机扫码
     * @param {IKeyStepPara} para
     */
    open(para: IKeyStepPara) {
        return new Promise((resolve) => {
            (ShellAction.get().device().scan as any)({
                callback: (even) => {
                    resolve(JSON.parse(even.detail).data)
                }
            });
        })
    }

    startEpc(input: R_Input) {
        let timer = null, isLoading = false, arr = [];
        Shell.inventory.startEpc(null, (result) => {
            if (result.success) {
                result.data.forEach(obj => {
                    let reg = regExpMatch(input, obj.epc);
                    reg && arr.push(obj.epc);
                });

                if (!timer && !isLoading) {
                    timer = setTimeout(() => {
                        isLoading = true;
                        if (tools.isNotEmpty(arr)) {
                            this.p.callback(arr.join(','), input)
                                .then(() => isLoading = false);
                        }
                        arr = [];
                        timer = null;
                    }, 1000);
                }
            }
        });
    }
}

/**
 * 正则匹配
 * @param input
 * @param inputContent
 */
function regExpMatch(input: R_Input, inputContent: string) {
    let regArr = null,
        data = null,
        len = inputContent.length,
        minLen = input.minLength,
        maxLen = input.maxLength;

    if (input.fieldRegex && minLen <= len && len <= maxLen) {
        regArr = input.fieldRegex.split(';');
        regArr.forEach(r => {
            let patt = inputContent.match(r);
            if (patt && patt[0] === inputContent) {
                data = input;
            }
        });
    }
    return data
}

/**rfid */
var getRfidPort = (conf: IRfidConfPara) => {
    let str, num;
    if (conf.line === 1) {
        str = conf.com;
        num = conf.baud;
    } else {
        str = conf.ip;
        num = conf.port;
    }
    num = parseInt(num);
    return { str, num }
};