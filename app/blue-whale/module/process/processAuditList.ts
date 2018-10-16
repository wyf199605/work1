/// <amd-module name="ProcessAuditList"/>

import BasicPage from "../../pages/basicPage";
import d = G.d;
import TableModulePc = require("../table/tableModulePc");
import {Button} from "../../../global/components/general/button/Button";
import sys = BW.sys;
import {Modal} from "global/components/feedback/modal/Modal";
import CONF = BW.CONF;


export class ProcessAuditList extends BasicPage{
    private container: HTMLElement;
    private checkBut : Button;
    private table;
    constructor(private para){
        super(para);
        this.container = para.dom;
        this.initPage();
    }
    private initPage(){
        let butHtml : string;
        butHtml = `<div data-name = "check" class="check"></div>`;
        this.container.innerHTML = butHtml;
        this.initTable();
        this.replaceType();
    }
    private initTable(){
        let tempTable = <HTMLTableElement>d.create('<table><tbody></tbody></table>');
        this.container.appendChild(tempTable);
        let tableConf:TableModulePara = {
            cols : [{
                title : "表单名称",
                name : "caption"
            },{
                title : "申请者",
                name : "createUserName"
            },{
                title : "申请日期",
                name : "taskCreateTime"
            },{
                title : "上个签核者",
                name : "lastUpdateUserName"
            },{
                title : "表单号",
                name : "formNo"
            }],
            dataAddr : {
                dataAddr: `/${CONF.appid}/${CONF.version}/flow/system/auditlist/?output=json`
            },
            fixedNum : 1,
            multPage : 2,
            isSub : true,
            multiSelect :false
        };
        this.table = new TableModulePc({
            tableEl: tempTable,
            scrollEl: this.container
        },tableConf).table;
    }
    private replaceType(){
        let self = this;
        d.queryAll('[data-name]',this.container).forEach(el => {
            switch (el.dataset.name) {
                case 'check':
                    this.checkBut = new Button({
                        container : el,
                        content : '审阅',
                        type : 'primary',
                        onClick : (e)=>{
                            if(this.table.rowSelectDataGet().length === 0){
                                Modal.alert('请选择一条数据');
                                return false;
                            }
                            let url = '/sf' + self.table.rowSelectDataGet()[0].auditUrl + '?page=processLeave';
                            sys.window.open({url});
                        }
                    });
                    break;
            }
        });
    }
}