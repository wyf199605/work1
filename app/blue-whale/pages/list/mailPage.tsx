/// <amd-module name="MailPage"/>

import {Mail} from "../../module/mail/mail";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import {FastTable} from "../../../global/components/newTable/FastTable";
import tools = G.tools;
import d = G.d;
import BasicPage from "../basicPage";
import {BwTableElement} from "../table/newTablePage";

interface IMailPagePara extends BasicPagePara{
}

export class MailPage extends BasicPage{
    protected TableElement: BwTableElement;
    protected mail: Mail;
    protected modal: Modal;
    protected wrapper: HTMLInputElement;

    constructor(protected para: IMailPagePara){
        super(para);
        this.wrapper = <div className="mail-wrapper"/>;
        para.dom.classList.add('mail-container');
        d.append(para.dom, this.wrapper);
        let uiBody = para.ui.body;
        // 去除编辑功能配置
        uiBody.elements[0] && delete uiBody.elements[0].tableAddr;
        // 获取subButton配置
        if(Array.isArray(uiBody.subButtons) && uiBody.elements[0]){
            let subBtn = uiBody.elements[0].subButtons;
            uiBody.elements[0].subButtons = Array.isArray(subBtn) ? subBtn : [];
            uiBody.subButtons.forEach((btn) => {
                uiBody.elements[0].subButtons.push(btn);
            });
        }

        // 去除链接
        for(let col of uiBody.elements[0].cols){
            if(col.name === 'READSTATE'){
                col.noShow = true;
            }
            // else if(tools.isNotEmpty(col.link)){
            //     delete col.link;
            // }
        }

        this.TableElement = new BwTableElement({
            tableEl: uiBody.elements[0],
            container: this.wrapper
        });
        let ftable = this.TableElement.tableModule.main.ftable,
            pseudoTable = ftable.pseudoTable,
            self = this;

        // 点击表格出现邮件详情页
        ftable.click.add('.section-inner-wrapper tbody tr[data-index]', function () {
            let rowIndex = parseInt(this.dataset.index),
                row = ftable.rowGet(rowIndex);
            if(row){
                pseudoTable && pseudoTable.setPresentSelected(rowIndex);
                self.initMail(rowIndex, ftable.data);
            }
        });

        this.on(BwRule.EVT_REFRESH, () => {
            this.TableElement && this.TableElement.tableModule.refresh();
        });
        
        // 初始化第一行的邮件详情页
        ftable.on(FastTable.EVT_RENDERED, () => {
            try {
                if(ftable.data.length > 0) {
                    pseudoTable && pseudoTable.setPresentSelected(0);
                    ftable.rows[0] && (ftable.rows[0].selected = true);
                    ftable._drawSelectedCells();
                    self.initMail(0, ftable.data);
                }
            }catch(e){
            }
        });
        // setTimeout(() => {
        //     this.initMail(0);
        //
        // }, 1000);
    }

    // 初始化邮件详情的模态框
    protected initModal(body: HTMLElement){
        // d.append(this.para.dom, mailWrapper);
        return new Modal({
            body: body,
            position : 'right',
            fullPosition : 'fixed',
            container : this.para.dom,
            isBackground : false,
            className : 'modal-mail',
            isAnimate : true,
            isShow: true,
            width: '400px',
            top: 50,
            header : {
                title : '详情',
                isFullScreen: true,
                // isDrag: true,
            },
            isDrag: true,
            isOnceDestroy: true
        });
    }

    protected initMail(index: number, data){
        let ftable = this.TableElement.tableModule.main.ftable,
            col = ftable.columnGet('READSTATE');
        if(col){
            let body = <div className="mail-body"/>,
                pseudoTable = ftable.pseudoTable,
                link = col.content.link;
            // 判断Modal是否存在，不存在重新初始化一个
            if(this.modal && this.modal.isShow){
                this.modal.body = body;
            }else{
                this.modal = this.initModal(body);
            }

            // 初始化邮件详情页内容
            this.mail = new Mail({
                link: BwRule.reqAddr(link, data[index]), // 邮件详情页链接
                index: index,
                container: body,
                modal: this.modal,
                table: this.TableElement.tableModule.main,
                onChange: (index) => {
                    // 点击邮件详情页上一封、下一封，触发的事件
                    ftable._clearAllSelectedCells();
                    pseudoTable && pseudoTable.setPresentSelected(index);
                    ftable.rows[index] &&(ftable.rows[index].selected = true);
                    ftable._drawSelectedCells();
                    this.initMail(index, data);
                }
            });
        }

        // !this.modal.isShow && (this.modal.isShow = true);
    }
}