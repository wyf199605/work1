/// <amd-module name="ProcessLeave"/>

import BasicPage from "../../pages/basicPage";
import CONF = BW.CONF;
import d = G.d;
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {TextInput} from "../../../global/components/form/text/text";
import {EditModule} from "../edit/editModule";
import sys = BW.sys;
import {BwRule} from "../../common/rule/BwRule";
interface ProcessLeavePara extends BasicPagePara{
    pageUrl? : string;
    // ui?: obj;
}

export class ProcessLeave extends BasicPage{
    private container: HTMLElement;
    private resultData : obj;
    private detailData : obj;
    private but : obj = {};//存放button节点
    private auditMemo : TextInput;//存放操作备注节点
    constructor(private para:ProcessLeavePara) {
        super(para);
        this.container = para.dom;
        this.getLeaveData();
    }
    initPage(){
        let  eleData = this.resultData.body.elements[0],i,
             footerBody:string = '',
             buttonHtml:string = '',
                butName:string = '',
             headerHtml:string,
             footerHtml:string,
                   html:string;
        for(i = 0;i < eleData.fields.length;i++) {
            footerBody +=`<li class="list-group-item col-xs-12 col-md-3 col-sm-4 col-lg-4" data-href="" data-var-list="">
                            <div class="list-left">
                                <div>${eleData.fields[i].caption}<span class="colon">：</span></div>
                            </div>
                            <div data-col=${eleData.fields[i].name} class="list-right ellipsis-row3 fold">                  
                            </div>
                            </li>`
        }
        footerHtml = `<div class="expense-footer" style="border: 1px solid #ddd;">
                                     <ul class="list-group full-height has-footer row" style="border: 1px solid #ddd;">
                                        ${footerBody}
                                     </ul>
                           </div>`;

        for(i = 0;i < eleData.subButtons.length;i++){
            butName = ProcessLeave.butName[eleData.subButtons[i].title];
            buttonHtml += `<div data-name = "${butName}" data-caption="${eleData.subButtons[i].caption}" class="but${i}"></div>`;
        }
        headerHtml =  `<div class="expense-header">
                                   ${buttonHtml}
                                    <h1>${this.resultData.caption}</h1>
                                    <p>
                                        <span style="margin-left: 15px;">申请人:<a>${eleData.createUserName}(${eleData.createUser})/${eleData.createUserPhone}</a></span>
                                        <span style="float: right; margin-right: 15px;">表单号: ${eleData.formNo} &nbsp;&nbsp;申请日期:${eleData.createTime} </span>
                                    </p>
                             </div>`;
        html = `<div class="detailPage">
                    ${headerHtml} 
                    <div class="auditMemo" data-name = 'auditMemo'></div>
                    ${footerHtml}           
                </div>`;
        this.container.innerHTML = html;
        this.replaceType();
    }
    private replaceType(){
        let self = this,fields = [],i = 0;
        d.queryAll('[data-name]',this.container).forEach(el => {
            switch (el.dataset.name) {
                case 'saveButton':
                    this.but['saveButton'] = new Button({
                        container : el,
                        content : '保存',
                        type : 'primary',
                        onClick : function(e){
                            self.butAction(this.parentElement.dataset.caption);
                        }
                    });
                    break;
                case 'subButton':
                    this.but['subButton'] = new Button({
                        container : el,
                        content : '提交',
                        type : 'primary',
                        onClick : function(e){
                            self.butAction(this.parentElement.dataset.caption);
                        }
                    });
                    break;
                case 'backButton':
                    this.but['backButton'] = new Button({
                        container : el,
                        content : '退回',
                        type : 'primary',
                        onClick : function(e){
                            self.butAction(this.parentElement.dataset.caption);
                        }
                    });
                    break;
                case 'passButton':
                    this.but['passButton'] = new Button({
                        container : el,
                        content : '通过',
                        type : 'primary',
                        onClick : function(e){
                            self.butAction(this.parentElement.dataset.caption);
                        }
                    });
                    break;
                case 'auditMemo':
                    self.auditMemo = new TextInput({
                        container : el,
                        placeholder : '请输入操作备注'
                    });
                    break;
            }
        });
        d.queryAll('[data-col]',d.query('.expense-footer',this.container)).forEach(el =>{
            fields.push({
                dom : el,
                field :this.resultData.body.elements[0].fields[i]
            });
            i++;
        });
        let editModule = new EditModule({
            fields : fields
        });
        editModule.set(this.detailData.data[0]);

    }
    private dealResData(res : obj){
        //参数
        let table = res.body.elements[0], //sfTable
            uiType = res.uiType; //sfHtml.uiType

        let  cols = table.fields, fixedNum = 0;
        for(let i = 0,col;i < cols.length;i++){
            col = cols[i];
            if(col.noShow && col.noShow){
                continue;
            }
                col.valueLists = col.atrrs.valueLists;
                col.noSum = col.atrrs.noSum; //是否记录总数
                col.dataType = col.atrrs.dataType; //展示格式
                col.displayFormat = col.atrrs.displayFormat; //数据类型
                col.trueExpr =  col.atrrs.trueExpr; //数据为真的值
                col.displayWidth =  col.atrrs.displayWidth; //显示长度
            // 下钻地址
            if(uiType == 'drill'){
                fixedNum = 1; // 下钻时锁列数固定为1
            }
            // 自定义钻取地址
            else if(uiType == 'web' || uiType == 'webdrill'){
                fixedNum = 1; //下钻时锁列数固定为1
            }
            // 锁列数
            else if(i < 2 && (col.name == table.nameField)){
                fixedNum = fixedNum + 1;
            }

            if(col.elementType == 'lookup'){
                //look up
                col['comType'] = 'selectInput';

            } else if((col.elementType == 'treepick' || col.elementType == 'pick')){
                //PICK UP
                col['comType'] = 'tagsInput';
                col['multiValue'] = col.atrrs.multValue; //单选或多选
            }else if(col.assignAddr){
                col['comType'] = 'assignText';
            } else if(col.atrrs.dataType == '43'){
                //文件上传
                col['comType'] = 'file';
            } else if(col.atrrs.dataType == '30'){
                //富文本
                col['comType'] = 'richText';
            } else if(col.atrrs.dataType == '17'){
                //toggle
                col['comType'] = 'toggle';
            } else if(col.atrrs.dataType == '12'){
                //日期时间控件
                col['comType'] = 'datetime';
            }else{
                col['comType'] = 'input';
            }
        }
        table['fixedNum'] = fixedNum > 0 ? fixedNum : 1; //锁列数;;;;;;;;;;;;;;
        table['pageLen'] = table.multPage == 0 ? 0 : 20;
    }
    private butAction(butName : string){
        let butData = this.resultData.body.elements[0].subButtons,dealBut,tableData = {};
        for(let i = 0;i < butData.length;i++){
            if(butData[i].caption === butName){
                dealBut = butData[i];
                break;
            }
        }
        d.queryAll('[data-col]',d.query('.expense-footer',this.container)).forEach(el => {
            let key = el.dataset.col,inputEle = <HTMLInputElement>d.query('input',el),val = inputEle.value;
            tableData[key] = val;
        });

        let result = BwRule.reqAddr(dealBut.actionAddr,tableData);
        BwRule.Ajax.fetch(CONF.siteUrl + result, {
            data: (dealBut.caption === '提交' || dealBut.caption === '保存') ? null : {audit_memo: this.auditMemo.get()}
        }).then(({response}) => {
            Modal.alert(response.msg);
        });

        // Rule.ajax(CONF.siteUrl + result,{
        //     data : (dealBut.caption === '提交' || dealBut.caption ==='保存') ? null :{audit_memo : this.auditMemo.get()},
        //     success: (response) =>{
        //         Modal.alert(response.msg);
        //     }
        // });
        /* let url = d.closest(this.container, '.page-container[data-src]').dataset.src;
        sys.window.close('', null, url);
        sys.window.open({url});*/
    }
    getLeaveData(){
        this.dealResData(this.para.ui);
        this.resultData = this.para.ui;
        let getDetail = ()=>{
            // Rule.ajax(CONF.siteUrl + this.resultData.body.elements[0].dataAddr.dataAddr,{
            //     success: (response) => {
            //         this.detailData = response;
            //         this.initPage();
            //     },
            //     error(){
            //         console.log('error');
            //     },
            //     netError(){
            //         console.log('netError');
            //     }
            // });
            BwRule.Ajax.fetch(CONF.siteUrl + this.resultData.body.elements[0].dataAddr.dataAddr)
                .then(({response}) => {
                    this.detailData = response;
                    this.initPage();
                });
        };
        getDetail();
    }
    static butName = {
        '提交' : 'subButton',
        '保存' : 'saveButton',
        '退回' : 'backButton',
        '通过' : 'passButton'
    }
}