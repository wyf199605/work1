///<amd-module name="Inputs"/>
import d = G.d;
import CONF = BW.CONF;
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Toast} from "../../../global/components/feedback/toast/Toast";
import {BwRule} from "../../common/rule/BwRule";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";

interface InputsPara {
    inputs: R_Input[]
    container: HTMLElement
    keyField? : string
    table? : FastTable
    afterScan? : Function
    tableModule? : Function
}

/**
 * monitorKey
 */
export class Inputs {
    private p: InputsPara;
    private m: Toast;
    private url: string;  //记录当前请求的url步骤,每次请求从该步骤开始
    constructor(private para: InputsPara) {
        this.p = para;
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
        this.keyStep(ajaxUrl);
    }

    private keyStep(aUrl){
        BwRule.Ajax.fetch(aUrl)
            .then(({response}) => {
                let elements = response.body && response.body.elements && response.body.elements[0] && response.body.elements[0];
                if(elements){
                    this.atvarParams(elements.atvarparams, elements.subButtons, aUrl);
                    return;
                }
                let category = response.body && response.body.bodyList && response.body.bodyList[0].category || {},
                    type = category.type,
                    showText = category.showText,
                    ftable = this.p.table || this.p.tableModule && this.p.tableModule().main.ftable;
                // ButtonAction.get().checkAction()
                this.url = category.url;
                switch (type) {
                    case 0:
                        //数据覆盖
                        response.data && (ftable.data = response.data);
                        this.logTip(showText);
                        break;
                    case 1:
                        //标签打印
                        // debugger
                        ftable.labelPrint.show(ftable.labelBtn.wrapper, category.printList, () => {
                            this.keyStep(CONF.siteUrl + this.url);
                        });
                        this.logTip(showText);
                        break;
                    case 2:
                        //提示错误信息
                        Modal.alert(showText);
                        break;
                    case 3:
                        //提示信息,确定(下一步)/取消
                        Modal.confirm({
                            msg: showText,
                            btns: ['取消', '确定'],
                            callback: (index) => {
                                if (index === true) {
                                    this.keyStep(CONF.siteUrl + this.url);
                                } else {
                                    this.url = null;
                                }
                            }
                        });
                        break;
                    case 4:
                        //提示信息,自动下一步
                        this.keyStep(CONF.siteUrl + this.url);
                        this.logTip(showText);
                        break;
                }
                if (!type && type !== 0) {
                    this.logTip(showText);
                }
            })
    }

    private logTip(showText){
        this.m && this.m.destroy();
        this.m = new Toast({
            duration: 0,
            type: 'simple',
            isClose: true,
            position: 'bottom',
            content: showText,
            container: this.para.container
        });
    }

    private atvarParams(atvarparams : obj, subButtons : obj[], aUrl){
        let atv, modal =  new Modal({
            header : {
              title : '提示'
            },
            isOnceDestroy : true,
            isMb : tools.isMb,
            body : d.create('<div class="keystep"></div>') as HTMLElement,
            footer : {},
            onOk : () => {
                modal.isShow = false;
                BwRule.Ajax.fetch(CONF.siteUrl + subButtons[0].actionAddr.dataAddr,{
                    data : atv.dataGet(),
                    type : 'get',
                }).then(({response}) => {
                    this.keyStep(aUrl)
                })
            }
        });


        require(['QueryBuilder'], (q) => {
            atv = new q.AtVarBuilder({
                queryConfigs: atvarparams,
                resultDom: modal.bodyWrapper,
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
            require(['MobileScan'], (e) => {
                new e.MobileScan({
                    scannableType : 0,
                    callback : (ajaxData) => {
                        let text = ajaxData.mobilescan,
                            len = text.length;
                        para.inputs.forEach(obj => {
                            if (obj.minLength <= len && len <= obj.maxLength) {
                                let reg = this.regExpMatch(para.inputs, text);
                                //匹配成功
                                reg && this.matchPass(reg, text);
                            }
                        })
                    }
                })
            });
            return;
        }
        let container = d.query('.tables', para.container) as HTMLElement;
        container.tabIndex = parseInt(G.tools.getGuid());
        para.inputs.forEach(obj => {
            let text = '', timer = null, timeInterval = obj.timeout;
            d.on(container, 'keydown', (e: KeyboardEvent) => {
                text += e.key;
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    let len = text.length;
                    if (obj.minLength <= len && len <= obj.maxLength) {
                        let reg = this.regExpMatch(para.inputs, text);
                        //匹配成功
                        reg && this.matchPass(reg, text);
                    }
                    timer = null;
                    text = '';
                }, timeInterval);
            });
        });
    }

    /**
     * 正则匹配按键
     * @param inputs
     * @param inputContent
     * @returns {boolean}
     */
    private regExpMatch(inputs, inputContent: string) {
        let regArr,
            data;
        inputs.forEach(d => {
            if (d.fieldRegex && d.inputType === '2') {
                regArr = d.fieldRegex.split(';');
                regArr.forEach(r => {
                    let patt = inputContent.match(r);
                    if (patt && patt[0] === inputContent) {
                        data = d;
                    }
                });
            }
        });
        return data;
    }

}