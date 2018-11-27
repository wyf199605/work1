///<amd-module name="Inputs"/>
import d = G.d;
import CONF = BW.CONF;
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Toast} from "../../../global/components/feedback/toast/Toast";
import {BwRule} from "../../common/rule/BwRule";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {FastBtnTable} from "../../../global/components/FastBtnTable/FastBtnTable";
import {Button} from "../../../global/components/general/button/Button";
import {ShellAction} from "../../../global/action/ShellAction";
import Shell = G.Shell;

interface InputsPara {
    inputs: R_Input[]
    locationLine? : string
    container: HTMLElement
    keyField? : string
    table? : Function
    afterScan? : Function
    tableModule? : Function
    queryModule? : Function
}
interface IKeyStepPara{
    callback(text : string, input? : R_Input) : Promise<any>
    container? : HTMLElement
    inputs? : R_Input[]
    locationLine? : string
}
/**
 * Inputs在pc端为按键输入，移动端为扫码
 */
export class Inputs {
    private p: InputsPara;
    private m: Toast;
    private isProcess : boolean = false;
    private url: string;  //记录当前请求的url步骤,每次请求从该步骤开始
    constructor(private para: InputsPara) {
        this.p = para;
        para.container.tabIndex = parseInt(G.tools.getGuid());
        this.eventInit(para);
    }

    /**
     * 匹配成功
     * @param data
     * @param text
     */
    private matchPass(data: R_Input, text: string) {
        let newUrl = this.url ? this.url : data.dataAddr.dataAddr;
        if (newUrl.indexOf('?') > -1) {
            newUrl += '&';
        } else {
            newUrl += '?';
        }
        let ajaxUrl = CONF.siteUrl + newUrl + data.fieldName.toLowerCase() + '=' + text;
        return this.ajax(ajaxUrl);
    }

    private ajax(aUrl : string){
        this.isProcess = true;
        return BwRule.Ajax.fetch(aUrl)
            .then(({response}) => {
                this.condition(response,aUrl);
                return response;
            }).catch(() => {
                this.isProcess = false;
            })
    }

    private condition(response : obj, aUrl : string){
        let elements = response.body && response.body.elements && response.body.elements[0] && response.body.elements[0];
        if(elements){
            this.atvarParams(elements.atvarparams, elements.subButtons, aUrl);
            return;
        }
        let body = response.body && response.body.bodyList && response.body.bodyList[0],
            category = body.category || {},
            dataType = body.dataType,
            atvarObj = body.atvarObj,
            catType = category.type,
            showText = category.showText,
            ftable : FastBtnTable = tools.isFunction(this.p.table) && this.p.table();

        this.url = category.url;
        switch (catType) {
            case 0:
                // 数据覆盖
                this.isProcess = false;
                break;
            case 1:
                // 标签打印
                let tableModule = this.p.tableModule();
                tableModule.labelPrint.show(tableModule.labelBtn.wrapper, category.printList, () => {
                    this.ajax(CONF.siteUrl + this.url);
                });
                break;
            case 2:
                // 提示错误信息
                let m = Modal.alert(showText, '提示', () => {
                    this.isProcess = false;
                });
                m.onClose = () => {
                    this.isProcess = false;
                };
                break;
            case 3:
                // 提示信息,确定(下一步)/取消
                let c = Modal.confirm({
                    msg: showText,
                    btns: ['取消', '确定'],
                    callback: (index) => {
                        if (index === true) {
                            this.ajax(CONF.siteUrl + this.url);
                        } else {
                            this.url = null;
                        }
                        this.isProcess = false;
                    }
                });
                c.onClose = () => {
                    this.isProcess = false;
                };
                break;
            case 4:
                // 提示信息,自动下一步
                this.ajax(CONF.siteUrl + this.url);
                break;
            default :
                this.isProcess = false;
        }
        if(dataType === 0){
            this.dataCover(ftable, response);
        }

        if(catType !== 2 || catType !== 3){
            this.logTip(showText);
        }

        if(atvarObj){
            this.atvarParams(atvarObj.atvarparams, atvarObj.subButtons, aUrl);
        }
    }

    private dataCover(ftable : FastBtnTable, response : obj){
        let data = response.data,
            queryModule = this.para.queryModule && this.para.queryModule();

        if(tools.isEmpty(data)){
            return;
        }
        queryModule && queryModule.hide();
        if(queryModule && !ftable){
            queryModule.para.refresher({}, true).then(() => {
                this.p.table().data = data;
            })
        }else if(ftable){
            ftable.data = data;
        }
    }

    private logTip(showText : string){
        if(tools.isEmpty(showText)){
            return;
        }
        this.m && this.m.destroy();
        this.m = new Toast({
            type: 'simple',
            className : 'max-index',
            position: 'bottom',
            content: showText,
            container: this.para.container
        });
    }

    private atvarParams(atvarparams : obj, subButtons : obj[], aUrl : string){
        this.isProcess = true;
        let atv, modal =  new Modal({
            header : {
              title : '提示'
            },
            isOnceDestroy : true,
            isMb : false,
            top : 50,
            body : d.create('<div class="inputs-atv"></div>') as HTMLElement,
            footer : {},
            onOk : () => {
                let atvData = atv.dataGet(),
                    url = tools.url.addObj(CONF.siteUrl + subButtons[0].actionAddr.dataAddr, atvData ? {'atvarparams': JSON.stringify(atv.dataGet())} : null);

                //必选判断
                let errTip = '';
                atvarparams.forEach(obj => {
                    if(obj.atrrs.requiredFlag === 1 && atvData[obj.field_name] === ''){
                        errTip += obj.caption + ',';
                    }
                });
                if(errTip !== ''){
                    Modal.alert(errTip.substring(0,errTip.length - 1) + '不能为空');
                    return;
                }
                modal.destroy();
                BwRule.Ajax.fetch(url,{
                    type : 'get',
                }).then(({response}) => {
                    this.condition(response, aUrl);
                }).catch(() => {
                    this.isProcess = false;
                })
            }
        });
        modal.onClose = () => {
            this.isProcess = false;
        };

        require(['QueryBuilder'], (q) => {
            atv = new q.AtVarBuilder({
                queryConfigs: atvarparams,
                resultDom: modal.body,
                tpl: () => d.create(`<div class="atvarDom"><div style="display: inline-block;" data-type="title"></div>
                <span>：</span><div data-type="input"></div></div>`),
                setting: null
            });
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
        if(G.tools.isMb){
            new KeyStep({
                inputs : para.inputs,
                callback : (ajaxData, input) => {
                    if(input && !this.isProcess){
                        return this.matchPass(input, ajaxData);
                    }else if(para.locationLine){
                        return this.rowSelect(para.locationLine, ajaxData);
                    }else {
                        return new Promise(resolve => {resolve()})
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
                    let reg = regExpMatch(input, text);
                    //匹配成功
                    if(reg){
                        this.matchPass(reg, text);
                    }else if(line){
                        this.rowSelect(line, text);
                    }

                    timer = null;
                    text = '';
                },
                    code = e.keyCode || e.which || e.charCode;

                if(code === 13){
                    handle();
                }else {
                    text += e.key;
                    if (timer) {
                        clearTimeout(timer);
                    }
                }

                timer = setTimeout(handle, timeInterval);
            });
        });
    }

    private rowSelect(line : string, text : string){
        return new Promise(resolve => {
            let fstable = tools.isFunction(this.para.table) && this.para.table(),
                index = fstable && fstable.locateToRow(line, text, true),
                tableModule = tools.isFunction(this.para.tableModule) && this.para.tableModule();

            if(tools.isNotEmpty(index) && tableModule && tableModule.bwEl.subTableList) {
                tableModule.subRefreshByIndex(index);
            }
            resolve();
        })
    }
}

export class KeyStep{
    private p : IKeyStepPara;
    constructor(para : IKeyStepPara){
        this.p = para;
        let can2dScan = Shell.inventory.can2dScan,
            btn : Button;

        if(!can2dScan && tools.isMb){
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
                evX = ev.clientX,
                evY = ev.clientY,
                top = wrapper.offsetTop,
                left = wrapper.offsetLeft;

            let moveHandler = function (i : TouchEvent) {
                let iv = i.touches[0],
                    ivX = iv.clientX,
                    ivY = iv.clientY,
                    distanceX = evX - ivX,
                    distanceY = evY - ivY;
                wrapper.style.left = left - distanceX - 30 + 'px';
                wrapper.style.top = top - distanceY + 'px';
            };

            let endHandler =  function () {
                d.off(document, 'touchmove', moveHandler);
                d.off(document, 'touchend', endHandler);
            };

            d.on(document, 'touchmove',moveHandler);
            d.on(document, 'touchend',endHandler);
        })
    }

    evenHandle(para : IKeyStepPara, can2dScan : boolean){
        if(Array.isArray(para.inputs)){
            para.inputs.forEach(input => {
                let type = input.inputType;
                switch (type) {
                    case '0':
                    case '2': // 移动端支持连续扫码
                        if(can2dScan){
                            let open = () => {
                                this.scanOpen().then((res : obj) => {
                                    if(res.success && res.data !== 'openSuponScan') {
                                        this.p.callback(res.data, regExpMatch(input, res.data))
                                    }
                                    open();
                                });
                            };
                            open();
                        }else {
                            let open = () => {
                                this.open(para).then((text : string) => {
                                    let reg = regExpMatch(input, text),
                                        conScan = tools.isMb && type === '2';

                                    this.p.callback(text, reg).then((response) => {
                                        let body = response && response.body && response.body.bodyList && response.body.bodyList[0] || {},
                                            category = body.category || {},
                                            catType = category.type,
                                            dataType = body.dataType; // 0：表格数据覆盖

                                        if(conScan && dataType === 0 && ![1,2,3,4].includes(catType)){
                                            open();
                                        }
                                    });

                                    if(!reg && conScan){
                                        open();
                                    }
                                });
                            };
                            open();

                        }
                        break;
                    case '1':
                        if(can2dScan){
                            this.startEpc(input);
                        }
                        break;
                }
            })
        }else if(para.locationLine){ // 定位功能
            if(can2dScan){
                let open = () => {
                    this.scanOpen().then((res : obj) => {
                        if(res.success && res.data !== 'openSuponScan') {
                            this.p.callback(res.data)
                        }
                        open();
                    });
                };
                open();
            }else {
                this.open(para).then((text : string) => {
                    this.p.callback(text)
                });

            }
        }
    }

    scanOpen(){
        return new Promise((resolve, reject) => {
            Shell.inventory.scan2dOn((res) => {
                resolve(res)
            });
        })

    }

    /**
     * type0 rfid及手机扫码
     * @param {IKeyStepPara} para
     */
    open(para : IKeyStepPara){
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
                result.data.forEach(obj => {
                    let reg = regExpMatch(input, obj.epc);
                    reg && arr.push(obj.epc);
                });

                if(!timer && !isLoading) {
                    timer = setTimeout(() => {
                        isLoading = true;
                        if(tools.isNotEmpty(arr)){
                            this.p.callback(arr.join(','), input)
                                .then(() => isLoading = false);
                        }
                        arr = [];
                        timer = null;
                    },1000);
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
function regExpMatch(input : R_Input, inputContent: string) {
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
    return data;
}