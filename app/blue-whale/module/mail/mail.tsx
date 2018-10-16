/// <amd-module name="Mail"/>
import d = G.d;
import tools = G.tools;
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import sys = BW.sys;
import CONF = BW.CONF;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Loading} from "../../../global/components/ui/loading/loading";
import {UserSelect} from "../../../global/components/other/userSelect/userSelect";
import {BwRule} from "../../common/rule/BwRule";
import {BwMainTableModule} from "../table/BwMainTable";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {InventoryBtn} from "../table/InventoryBtn";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
interface MailPara{
    container : HTMLElement,
    // subButtons : R_Button[],
    // urlArr : string[],
    index : number,
    link: string;
    modal : Modal,
    table : BwMainTableModule,
    callback?() : void,
    onChange: (index: number) => void,
}
export class Mail{

    private tpl : HTMLElement;
    private spinner : Loading;
    private index : number;
    private prePage : Button;
    private nextPage : Button;
    private p : MailPara;
    private ajaxData : obj;
    private isOne : boolean = true;
    private len : number;
    constructor(para : MailPara){
        this.p = para;
        this.len = para.table.ftable.data.length;
        this.ajaxLoad(para.link, para.index);

        new UserSelect({
            target : para.container,
        })
    }

    private btnEvent(fields){
        this.tpl = this.detailTpl(fields);
        this.p.container.appendChild(this.tpl);
        let down = d.query('.icon-arrow-down', this.tpl),
            up = d.query('.icon-arrow-up', this.tpl),
            mailHide = d.query('.mail-hide', this.tpl),
            avatar = d.query('.mail-avatar', this.tpl),
            rightBtn = d.query('.btn-group-right', this.tpl),
            title = d.query('.mail-title', this.tpl);

        //翻页
        let rightBox = new InputBox({
            container: rightBtn,
            size: 'small',
        });
        this.prePage = new Button({
            content : '上一封',
            size : 'small',
            onClick : () => {
                if(this.index > 0){
                    this.turnPage(this.index - 1);
                }
            }
        });
        this.nextPage = new Button({
            content : '下一封',
            size : 'small',
            onClick : () => {
                if(this.index < this.len - 1){
                    this.turnPage(this.index + 1);
                }
            }
        });
        rightBox.addItem(this.prePage);
        rightBox.addItem(this.nextPage);

        //更多
        if(down){
            d.on(down, 'click', () => {
                mailHide.classList.remove('mail-hide');
            });
            d.on(up, 'click', () => {
                mailHide.classList.add('mail-hide');
            });
        }
        let self = this;
        d.on(this.p.container, 'click', '.txt-left [data-href]:not([data-href=""])', function () {
            BwRule.link({
                link: this.dataset.href,
                varList: JSON.parse(this.dataset.varList),
                data: self.ajaxData,
                dataType: this.dataset.dataType,
                // openUrl : this.dataset.url,
            });
        });

        //头像
        // let avatar5 = new Avatar({
        //     container: avatar,
        //     size:'large',
        //     shape:'square',
        //     type:'text',
        //     content:'陈'
        // });
    }

    /**
     * 设置表格数据量
     * @param data
     * @param length
     */
    // setArr(data,length){
    //     this.p.urlArr = data;
    //     this.len = length;
    // }
    private turnPage(newIndex){
        typeof this.p.onChange === 'function' && this.p.onChange(newIndex)
        // let trs = d.queryAll('tbody tr[data-index]', this.p.table.wrapper);
        // this.ajaxLoad(this.p.urlArr[newIndex], newIndex);
        // trs[newIndex].classList.remove('tr-read');
        // //选中效果
        // this.p.table.table.rowSelect(trs[newIndex]);
    }
    dataAdd(data : obj, index : number){
        this.index = index;
        if(index === 0){
            this.prePage.getDom().classList.add('disabled');
        }else {
            this.prePage.getDom().classList.remove('disabled');
        }
        if(index === this.len - 1){
            this.nextPage.getDom().classList.add('disabled');
        }else {
            this.nextPage.getDom().classList.remove('disabled');
        }
        for(let item in data){
            if(item !== 'READSTATE') {
                let dom = d.query('[data-name="' + item + '"]', this.tpl);
                if(dom){
                    dom.innerHTML = data[item];
                    let classList =  dom.parentElement.classList;
                    if(item === 'ATTACHNAME'){
                        classList = dom.parentElement.parentElement.classList;
                    }
                    if(!data[item]){
                        classList.add('hide');
                    }else {
                        classList.remove('hide');
                    }
                }
            }
        }
    }

    protected btnWrapper: HTMLElement;
    protected initSubBtns(btnsUi){
        this.btnWrapper = <div className="mail-btn-group"/>;
        let box = new InputBox({
            container: this.btnWrapper,
            isResponsive: !tools.isMb,
        });
        let ftable = this.p.table.ftable;

        Array.isArray(btnsUi) && btnsUi.forEach((btnUi) => {
            let btn = new Button({
                icon: btnUi.icon,
                content: btnUi.title,
                isDisabled: !(btnUi.multiselect === 0 || btnUi.multiselect === 2 && btnUi.selectionFlag),
                data: btnUi,
                onClick: () => {

                    if(btn.data.openType.indexOf('rfid') === -1){
                        let btnUi = btn.data as R_Button,
                            {multiselect, selectionFlag} = btnUi,
                            selectedData = multiselect === 2 && selectionFlag ?
                                ftable.unselectedRowsData : ftable.selectedRowsData;

                        // if (multiselect === 2 && !selectedData[0]) {
                        //     // 验证多选
                        //     Modal.alert('请至少选一条数据');
                        //     return;
                        // } else if (btn.data.multiselect === 1 && (!selectedData[0] || selectedData[1])) {
                        //     // 单选验证
                        //     Modal.alert('请选最多一条数据');
                        //     return;
                        // }
                        console.log(multiselect === 1 ? selectedData[0] : selectedData);
                        ButtonAction.get().clickHandle(btnUi,
                            multiselect === 1 ? selectedData[0] : selectedData,
                            (res)=>{}, this.p.table.pageUrl);
                    } else {
                        InventoryBtn(btn, this.p.table);
                    }
                }
            });
            box.addItem(btn);
        });

        // 根据选中行数判断按钮是否可操作
        let selectedLen = ftable.selectedRows.length,
            allLen = ftable.rows.length;

        box.children.forEach(btn => {
            let selectionFlag = btn.data.selectionFlag,
                len = btn.data.selectionFlag ? allLen - selectedLen : selectedLen;

            if (len === 0) {
                btn.isDisabled = selectionFlag ? false : btn.data.multiselect > 0;
            } else if (selectedLen === 1) {
                btn.isDisabled = false;
            } else {
                btn.isDisabled = btn.data.multiselect !== 2;
            }
        });
    }

    private ajax = new BwRule.Ajax();
    ajaxLoad(ajaxUrl : string, index : number){
        if(!this.spinner){
            this.spinner = new Loading({})
        }else {
            this.spinner.show();
        }

        this.ajax.fetch(CONF.siteUrl + ajaxUrl, {
            cache: true,
            data: {output: 'json'}

        }).then(({response}) => {
            let elements: any = response.body.elements[0];
            let btnsUi = elements.subButtons;
            !Array.isArray(btnsUi) && (btnsUi = []);
            if(Array.isArray(response.body.subButtons)){
                response.body.subButtons.forEach((btn) => {
                    btnsUi.push(btn);
                })
            }
            this.initSubBtns(btnsUi);
            if (this.isOne) {
                this.btnEvent(elements.fields);
            }

            return this.ajax.fetch(CONF.siteUrl + elements.dataAddr.dataAddr, {
                cache: true,

            }).then(({response}) => {
                this.ajaxData = response.data[0];
                this.dataAdd(this.ajaxData, index);
                // this.spinner.hide();
                if (this.isOne) {
                    this.p.modal.isShow = true;
                    this.isOne = false;
                }
            })

        }).finally(() => {
            this.spinner.hide();
        })

    }

    private detailTpl(cols : R_Field[]) : HTMLElement{
        let more = ``, three = ``, title, attachname, content, n = 0, icon = ``;
        cols.forEach((c) => {
            let link = c.link ? c.link.dataAddr : '';
            let varList = JSON.stringify(c.link ? c.link.varList : '');

            let div = `<div class="txt-left"><span class="caption">${c.caption}：</span>
            <span data-name="${c.name}" data-href="${link}" data-var-list=${varList} data-data-type="${c.atrrs.dataType}" 
            data-display-format="${!c.atrrs.displayFormat}"></span></div>`;

            let noTitle = `<div class="txt-left">
            <span data-name="${c.name}" data-href="${link}" data-var-list=${varList} data-data-type="${c.atrrs.dataType}" 
            data-display-format="${!c.atrrs.displayFormat}"></span></div>`;

            if(c.name !== 'READSTATE'){
                if(c.name === 'TITLE'){
                    title = noTitle;
                }else if(c.name === 'ATTACHNAME'){
                    attachname = div;
                }else if(c.name === 'CONTENT'){
                    content = noTitle;
                }else {
                    if( n < 3){
                        n ++;
                        three += div;
                    }else{
                        more += div;
                    }
                }
            }
        });
        if(more !== ``){
            icon = ` <div class="mail-icon"><span class="iconfont icon-arrow-down"></span><span
                            class="iconfont icon-arrow-up"></span>
                    </div>`;
        }
        let contentEl = d.create(`<div>
            <div class="mail-head mail-hide">
                <div class="mail-title">
                    ${title}
                    <div class="btn-group-right"></div>
                    <div class="avatar-right">
                        <div class="mail-avatar"></div>
                        ${icon}
                    </div>
                </div>
                <div class="mail-three">
                    ${three}
                </div>
                <div class="mail-more">
                    ${more}
                </div>
            </div>
            <div class="mail-body">${attachname}</div>
            <div class="mail-content">
                ${content}
            </div>
        </div>`);
        return <div className="mail-detail">
            {this.btnWrapper}
            {contentEl}
        </div>;
    }

}