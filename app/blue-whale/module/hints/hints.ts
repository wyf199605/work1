///<amd-module name="Hints"/>
import d = G.d;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import {Tab} from "../../../global/components/ui/tab/tab";
import sys = BW.sys;
import CONF = BW.CONF;
import {BwRule} from "../../common/rule/BwRule";
interface HintsPara{
    data : {
        dataMap : dataMapPara[],
        hintIds : string,
        userId : string
    }
}
interface dataMapPara{
    content : {
        caption : string,
        content : string,
        link : string
    },
    createDate : string,
    hintId : string,
    objectName : string,
    sender : string
}
/**
 * hint系统提醒
 */
export class Hints{
    private modal : Modal;
    private tab : Tab;
    private index : number = 0;
    private len : number;
    private upButton :Button;
    private nextButton :Button;
    private openButton :Button;
    private noWarmButton :Button;
    private dataMap : dataMapPara[];
    constructor(para : HintsPara){
        this.init(para);
    }

    private init(para : HintsPara){
        let inputBox = new InputBox(),
            lInputBox = new InputBox();

        this.dataMap = para.data.dataMap;
        this.len = this.dataMap.length;
        this.upButton = new Button({
            content : '上一条',
            type :  'primary',
            onClick : () => {
                this.tab.active(this.index - 1);
            }
        });
        this.nextButton = new Button({
            content : '下一条',
            type :  'primary',
            onClick : () => {
                this.tab.active(this.index + 1);
            }
        });
        this.openButton = new Button({
            content : '打开',
            type : 'primary',
            onClick : () => {
                let active = d.query('.tab-pane.active [data-url]', this.modal.bodyWrapper);
                sys.window.open({
                    url : CONF.siteUrl + active.dataset.url
                })
            }
        });
        this.noWarmButton = new Button({
            content : '今日不提醒',
            type : 'primary',
            onClick : (e) => {
                BwRule.Ajax.fetch(CONF.siteUrl + (<HTMLElement>e.target).dataset.url, {
                    type: 'POST',
                }).then(({response}) => {
                    this.noWarmButton.getDom().classList.add('disabled');
                    Modal.toast(response.msg)
                });
            }
        });
        lInputBox.addItem(this.openButton);
        lInputBox.addItem(this.noWarmButton);
        inputBox.addItem(this.upButton);
        inputBox.addItem(this.nextButton);
        this.modal = new Modal({
            header : '提醒',
            width : '600px',
            isBackground : false,
            body : d.create(`<div class="hints-body"></div>`),
            footer : {
                rightPanel : inputBox,
                leftPanel : lInputBox
            },
        });
        this.modal.onClose = () => {
            this.modal.destroy();
        };
        let tabs = [];
        para.data.dataMap.forEach(obj => {
           tabs.push({
               title : obj.content.caption,
               dom : d.create(`<div data-url="${obj.content.link}">${obj.content.content || ''}</div>`)
           })
        });
        this.tab = new Tab({
            tabParent: this.modal.body as HTMLElement,
            panelParent: this.modal.body as HTMLElement,
            tabs: tabs,
            onClick : (index) => {
                this.ajaxLoad(index);
            }
        });
    }

    /**
     * disabled控制
     * @param index
     * @param msg
     * @param url
     * @param btnUrl
     * @param btnCaption
     */
    private showMsg(index:number, msg : string, url : string, btnUrl : string, btnCaption : string){
        if(index === 0){
            this.upButton.getDom().classList.add('disabled');
        }else{
            this.upButton.getDom().classList.remove('disabled');
        }
        if(index === this.len - 1){
            this.nextButton.getDom().classList.add('disabled');
        }else {
            this.nextButton.getDom().classList.remove('disabled');
        }
        //按钮可点击
        if(btnUrl){
            this.noWarmButton.getDom().classList.remove('disabled');
            this.noWarmButton.getDom().dataset.url = btnUrl;
        }else {
            this.noWarmButton.getDom().classList.add('disabled');
        }
        //按钮存在
        if(btnCaption){
            this.noWarmButton.getDom().innerHTML = btnCaption;
            this.noWarmButton.getDom().classList.remove('hide');
        }else {
            this.noWarmButton.getDom().classList.add('hide');
        }


        this.index = index;

        let active = d.query('.tab-pane.active [data-url]', this.modal.bodyWrapper);
        active.innerHTML = msg;
        active.dataset.url = url;
        if(active.dataset.url){
            this.openButton.getDom().classList.remove('disabled');
        }else {
            this.openButton.getDom().classList.add('disabled');
        }
    }

    destroy(){
        this.modal.destroy();
    }

    private ajax = new BwRule.Ajax();
    private ajaxLoad(index : number){
        let data = this.dataMap[index];
        if(!data){
            return;
        }
        let url = data.content.link;
        this.ajax.fetch(CONF.siteUrl + url, {
            type: 'GET',
            cache: true,
        }).then(({response}) => {
            let element = response.body.elements[0],
                btnAddr = element.btnAddr && element.btnAddr.dataAddr,
                addr = element.openlink && element.openlink.dataAddr || '';

            this.showMsg(index, element.textMsg, addr, btnAddr, element.btnCaption);
        });
    }

}