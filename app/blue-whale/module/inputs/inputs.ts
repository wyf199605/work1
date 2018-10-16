///<amd-module name="Inputs"/>
import d = G.d;
import CONF = BW.CONF;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Toast} from "../../../global/components/feedback/toast/Toast";
import {BwRule} from "../../common/rule/BwRule";
import {FastTable} from "../../../global/components/newTable/FastTable";
interface InputsPara{
    inputs : R_Input[]
    container : HTMLElement
    table : FastTable
}
/**
 * monitorKey
 */
export class Inputs{
    private p : InputsPara;
    private m : Toast;
    private url : string;  //记录当前请求的url步骤,每次请求从该步骤开始
    constructor (private para : InputsPara){
        this.p = para;
        this.eventInit(para);

    }

    /**
     * 匹配成功
     * @param data
     * @param text
     */
    private matchPass(data : R_Input, text : string) {
        let newUrl = this.url ? this.url : data.dataAddr.dataAddr;
        if (newUrl.indexOf('?') > -1) {
            newUrl += '&';
        } else {
            newUrl += '?';
        }
        let ajaxUrl = CONF.siteUrl + newUrl + data.fieldName.toLowerCase() + '=' + text;
        let self = this;
        ajaxLoad(ajaxUrl);

        function ajaxLoad(aUrl) {
            BwRule.Ajax.fetch(aUrl)
                .then(({response}) => {
                    let category = response.body.bodyList[0].category,
                        type = category.type,
                        showText = category.showText;

                    self.url = category.url;
                    switch (type) {
                        case 0:
                            //数据覆盖
                            response.data && (self.p.table.data = response.data);
                            logTip();
                            break;
                        case 1:
                            //标签打印
                            // debugger
                            self.p.table.labelPrint.show(self.p.table.labelBtn.wrapper, category.printList, () => {
                                ajaxLoad(CONF.siteUrl + self.url);
                            });
                            logTip();
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
                                        ajaxLoad(CONF.siteUrl + self.url);
                                    } else {
                                        self.url = null;
                                    }
                                }
                            });
                            break;
                        case 4:
                            //提示信息,自动下一步
                            ajaxLoad(CONF.siteUrl + self.url);
                            logTip();
                            break;
                    }
                    if (!type && type !== 0) {
                        logTip();
                    }

                    function logTip() {
                        self.m && self.m.destroy();
                        self.m = new Toast({
                            duration: 0,
                            type: 'simple',
                            isClose: true,
                            position: 'bottom',
                            content: showText,
                            container: self.para.container
                        });
                    }
                })

        }
    }


    /**
     * 初始化按键事件
     * @param para
     */
    private eventInit(para : InputsPara){
        para.inputs.forEach(obj => {
            let container = d.closest(para.container,'.mobileTableWrapper'),
                text = '', timer = null, timeInterval = obj.timeout;
            d.on(container, 'keydown', (e:KeyboardEvent) => {
                text += e.key;
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() =>{
                    let len = text.length;
                    if(obj.minLength<= len && len <= obj.maxLength){
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
            if(d.fieldRegex && d.inputType === '2'){
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