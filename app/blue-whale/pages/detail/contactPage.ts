import BasicPage from "basicPage";
import sys = BW.sys;
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "global/components/feedback/modal/Modal";
import {PopMenu} from "../../../global/components/ui/popMenu/PopMenu";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import d = G.d;
import tools = G.tools;
import CONF = BW.CONF;

export = class contactPage extends BasicPage {
    constructor(private para) {
        super(para);
        let self = this;
        if(self.isMb){
            // mui.init({
            //     gestureConfig: {
            //         longtap: true //默认为false
            //     }
            // });

            d.on(d.query('.mui-table-view'), 'press', '.col-content', function () {
                let menuBtn = [],
                    colContent = this;
                menuBtn.push("复制");
                if(colContent.dataset.col === 'MOBILE'){
                    menuBtn.push("拨号");
                    menuBtn.push("短信");
                }
                if(menuBtn.length > 0){
                    let popMenu = new PopMenu({
                        arr: menuBtn,
                        callback(target: HTMLElement, custom) {
                            if(target.innerHTML === '复制'){
                                sys.window.copy(colContent.textContent);
                            }else if(target.innerHTML === '拨号'){
                                sys.window.load('tel:' + colContent.textContent);
                            }else if(target.innerHTML === '短信'){
                                sys.window.load('sms:' + colContent.textContent);
                            }

                            popMenu.destroy();
                        }
                    });

                    let position = colContent.getBoundingClientRect(),
                        x1 = colContent.offsetWidth / 2,
                        x2 = position.left,
                        y1 = position.top;

                    popMenu.show(y1, x1 + x2);
                    // tools.menu.show(colContent, menuBtn, function (btn) {
                    //
                    // });
                }
            });
            //初始化单页的区域滚动
            // mui('.mui-scroll-wrapper').scroll();
        }
        if (para.keyField.length === 0) {
            Modal.alert('keyField 为空');
        }
        else {
            let userId = tools.url.getPara('userid', this.url);
            BwRule.Ajax.fetch(CONF.ajaxUrl.myself, {
                data: userId ? {userid: userId} : null
            }).then(({response}) => {
                    let dataCols = sys.isMb ? d.queryAll('.mui-table-view-cell [data-col]') :
                        d.queryAll('.list-group-item [data-col]', para.dom);

                    dataCols.forEach(function (el) {
                        let html = response.data[0][el.dataset.col];
                        if (html === null || html === undefined) {
                            d.remove(el.parentElement.parentElement);
                        } else {
                            el.innerHTML = html;
                        }
                    });
                    // detailData = response.data[0];
                if(tools.isMb) {
                    self.btnInit();
                }
                });
        }
    }
    private btnInit(){
        let inputBox = new InputBox({
            container : this.para.wrapper,
            size : 'middle',
            compactWidth : 1,
            className : 'button-call'
        });
        let mobile = d.query('[data-col="MOBILE"]');
        if(mobile.textContent){
            inputBox.addItem(new Button({
                content : '拨号',
                icon : 'call',
                className : 'call',
                onClick : () => {
                    sys.window.load('tel:' + mobile.textContent);
                }
            }));
            inputBox.addItem(new Button({
                content : '短信',
                icon : 'xiaoxi',
                className : 'xiaoxi',
                onClick : () => {
                    sys.window.load('sms:' + mobile.textContent);
                }
            }));
        }
        inputBox.addItem(new Button({
            content : '邮件',
            icon : 'message',
            className : 'message',
            onClick : () => {
                let userId = d.query('[data-col="USERID"]').textContent;
                BW.sys.window.open({
                    url: tools.url.addObj(BW.CONF.url.mail, {
                        defaultvalue: '{"RECEIVERID":"'+userId+'"}'
                    })
                });
                // sys.window.load('sms:' + mobile.textContent);
            }
        }));
    }
}