///<amd-module name="Inputs"/>
import d = G.d;
import CONF = BW.CONF;
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Toast} from "../../../global/components/feedback/toast/Toast";
import {BwRule} from "../../common/rule/BwRule";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";

interface InputsPara {
    inputs: R_Input[]
    container: HTMLElement
    keyField? : string
    table? : Function
    afterScan? : Function
    tableModule? : Function
    queryModule? : Function
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
        return this.ajax(ajaxUrl);
    }

    private ajax(aUrl){
        return BwRule.Ajax.fetch(aUrl)
            .then(({response}) => {
                this.condition(response,aUrl)
            })
    }

    private condition(response, aUrl){
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
            ftable = tools.isFunction(this.p.table) && this.p.table();

        this.url = category.url;
        switch (catType) {
            case 0:
                // 数据覆盖
                this.logTip(showText);
                break;
            case 1:
                // 标签打印
                ftable.labelPrint.show(ftable.labelBtn.wrapper, category.printList, () => {
                    this.ajax(CONF.siteUrl + this.url);
                });
                this.logTip(showText);
                break;
            case 2:
                // 提示错误信息
                Modal.alert(showText);
                break;
            case 3:
                // 提示信息,确定(下一步)/取消
                Modal.confirm({
                    msg: showText,
                    btns: ['取消', '确定'],
                    callback: (index) => {
                        if (index === true) {
                            this.ajax(CONF.siteUrl + this.url);
                        } else {
                            this.url = null;
                        }
                    }
                });
                break;
            case 4:
                // 提示信息,自动下一步
                this.ajax(CONF.siteUrl + this.url);
                this.logTip(showText);
                break;
        }
        if(dataType === 0){
            this.dataCover(ftable, response);
        }
        if (tools.isEmpty(catType)) {
            this.logTip(showText);
        }
        if(atvarObj){
            this.atvarParams(atvarObj.atvarparams, atvarObj.subButtons, aUrl);
        }
    }

    private dataCover(ftable, response : obj){
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
        }else {
            ftable && (ftable.data = data);
        }
    }

    private logTip(showText){
        this.m && this.m.destroy();
        this.m = new Toast({
            type: 'simple',
            className : 'max-index',
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
                modal.isShow = false;
                BwRule.Ajax.fetch(url,{
                    type : 'get',
                }).then(({response}) => {
                    this.condition(response, aUrl);
                })
            }
        });


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
            require(['KeyStep'], (e) => {
                new e.KeyStep({
                    inputs : para.inputs,
                    callback : (ajaxData, input) => {
                        return this.matchPass(input, ajaxData);
                    }
                })
            });
            return;
        }
        // let container = d.query('.tables', para.container) as HTMLElement;
        para.container.tabIndex = parseInt(G.tools.getGuid());
        para.inputs.forEach(obj => {
            let text = '', timer = null, timeInterval = obj.timeout;
            d.on(para.container, 'keydown', (e: KeyboardEvent) => {
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
            if (d.fieldRegex) {
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