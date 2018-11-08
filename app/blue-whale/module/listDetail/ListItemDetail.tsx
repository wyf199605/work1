/// <amd-module name="ListItemDetail"/>

import {BwRule} from "../../common/rule/BwRule";
import {DetailCellType, ListItemDetailCell} from "./ListItemDetailCell";
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {DetailModal} from "./DetailModal";
import {ActionSheet, IActionSheetButton} from "../../../global/components/ui/actionSheet/actionSheet";
import sys = BW.sys;

export class ListItemDetail {
    // DOM容器
    private wrapper: HTMLElement;
    private cells: objOf<ListItemDetailCell> = {};
    public defaultData: obj = {};
    public currentPage: number = 1;
    public totalNumber: number = 1;
    private ajaxUrl: string = '';
    private actionSheet: ActionSheet;

    constructor(private para: EditPagePara) {
        let wrapper = <div className="list-item-detail-wrapper"/>,
            dom = para.dom || document.body;
        dom.appendChild(wrapper);
        this.wrapper = wrapper;
        this.ajaxUrl = tools.isNotEmpty(para.fm.dataAddr) ? BW.CONF.siteUrl + BwRule.reqAddr(para.fm.dataAddr) : '';
        this.initDetailTpl(para.fm.fields);
        this.initDetailData().then(data => {
            this.render(data);
            this.initDetailButtons();
        });
    }

    // 初始化详情DOM
    initDetailTpl(fields: R_Field[]) {
        let cellsWrapper = <div className="list-detail-cells-wrapper"/>;
        this.wrapper.appendChild(cellsWrapper);
        fields.forEach(field => {
            if (!field.noShow) {
                this.cells[field.name] = new ListItemDetailCell({
                    caption: field.caption,
                    type: this.getType(field.dataType || field.atrrs.dataType || ''),
                    container: cellsWrapper,
                    detailPage: this,
                    field: field
                });
            }
        })
    }

    // 初始化详情数据
    initDetailData(): Promise<obj> {
        let fields: R_Field[] = this.para.fm.fields;
        return new Promise<obj>((resolve, reject) => {
            let data: obj = {};
            if (tools.isNotEmpty(this.ajaxUrl)) {
                let url = tools.url.addObj(this.ajaxUrl, {
                    pageparams: '{"index"=' + this.currentPage + ', "size"=' + 1 + ',"total"=1}'
                });
                BwRule.Ajax.fetch(url).then(({response}) => {
                    let res: obj = {};
                    let meta = response.body.bodyList[0].meta,
                        dataTab = response.body.bodyList[0].dataList[0];
                    for (let i = 0, len = meta.length; i < len; i++) {
                        res[meta[i]] = dataTab[i];
                    }
                    if (this.para.uiType === 'detail') {
                        this.totalNumber = response.head.totalNum;
                    }
                    this.defaultData = res;
                    if (tools.isNotEmpty(res)) {
                        let cells = this.cells;
                        for (let key in cells) {
                            let field = fields.filter((f) => f.name === key)[0];
                            data[key] = tools.isNotEmpty(res[key]) ? this.handlerValue(res[key], field) : '';
                        }
                    }
                    resolve(data);
                })
            } else {
                for (let key in this.cells) {
                    data[key] = '';
                }
                Modal.alert('无数据地址!');
                resolve(data);
            }
        })
    }

    // 上一页下一页加载数据
    changePage(page = -1) {
        if (page > 0) {
            if (page > this.totalNumber) {
                this.currentPage = this.totalNumber;
            } else {
                this.currentPage = page;
            }
        }
        this.checkPageButtonDisabled();
        this.scrollToTop();
        this.initDetailData().then(data => {
            this.render(data);
        });
    }

    // 设置详情数据
    render(data: obj) {
        let cells = this.cells;
        for (let key in cells) {
            cells[key].render(data[key] || '');
        }
    }

    // 初始化详情按钮
    initDetailButtons() {
        let buttons: R_Button[] = this.para.fm.subButtons,
            self = this;

        // 更多按钮
        function createMoreBtn(buttons: R_Button[], wrapper: HTMLElement, isPage: boolean) {
            new Button({
                content: '更多',
                className: 'more',
                container: wrapper,
                onClick: () => {
                    // 点击更多
                    self.actionSheet.isShow = true;
                }
            });
            let actionBtns: IActionSheetButton[] = [];
            buttons.forEach((b, index) => {
                actionBtns.push({
                    content: b.caption,
                    onClick: () => {
                        self.actionSheet.isShow = false;
                        subBtnEvent(isPage ? index : index + 2);
                    }
                })
            });
            self.actionSheet = new ActionSheet({
                buttons: actionBtns
            });
        }

        if (tools.isNotEmpty(buttons)) {
            let btnWrapper = <div className="list-item-detail-buttons"/>;
            this.wrapper.appendChild(btnWrapper);
            if (this.para.uiType === 'detail') {
                createMoreBtn(buttons, btnWrapper, true);
                this.createPageButton(btnWrapper);
            } else {
                if (buttons.length > 2) {
                    let btns = buttons.slice(0, 2), moreBtns = buttons.slice(2);
                    createMoreBtn(moreBtns, btnWrapper, false);
                    btns.forEach((button, index) => {
                        new Button({
                            content: button.caption,
                            container: btnWrapper,
                            className: 'list-detail-btn',
                            onClick: () => {
                                this.actionSheet.isShow = false;
                                subBtnEvent(index);
                            }
                        })
                    });
                } else {
                    buttons.forEach((button, index) => {
                        new Button({
                            content: button.caption,
                            container: btnWrapper,
                            className: 'list-detail-btn',
                            onClick: () => {
                                subBtnEvent(index);
                            }
                        })
                    });
                }
            }
        } else {
            if (this.para.uiType === 'detail') {
                let btnWrapper = <div className="list-item-detail-buttons"/>;
                this.wrapper.appendChild(btnWrapper);
                this.createPageButton(btnWrapper);
            } else {
                this.wrapper.style.paddingBottom = '0px';
            }
        }

        // 处理按钮触发
        function subBtnEvent(index) {
            let btn = self.para.fm.subButtons[index];
            switch (btn.subType) {
                case 'update_save' :
                case 'insert_save':
                    let isAdd = btn.subType === 'update_save' ? false : true;
                    new DetailModal(Object.assign({}, self.para, {
                        defaultData: btn.subType === 'update_save' ? self.defaultData : {},
                        isAdd:isAdd,
                        confirm(data){
                            return new Promise((resolve,reject)=>{
                                ButtonAction.get().clickHandle(btn, data, () => {
                                    switch (btn.subType) {
                                        case 'insert_save': {
                                            self.changePage(self.totalNumber + 1);
                                            resolve();
                                        }
                                            break;
                                        case 'update_save': {
                                            self.changePage();
                                            resolve();
                                        }
                                            break;
                                    }
                                });
                            })
                        }
                    }));
                    break;
                case 'delete_save': {
                    ButtonAction.get().clickHandle(btn, self.defaultData, () => {
                        if (self.para.uiType === 'detail') {
                            // 删除后显示下一页，如果已是最后一页，则显示上一页
                            let currentPage = self.currentPage >= self.totalNumber ? self.currentPage - 1 : self.currentPage;
                            if(currentPage <= 0){
                                sys.window.close();
                            }else{
                                self.changePage(currentPage);
                            }
                        }
                    });
                }
                    break;
                default:
                    // 其他按钮
                    ButtonAction.get().clickHandle(btn, self.defaultData, () => {
                    });
                    break;
            }
        }
    }

    private prev: Button = null;
    private next: Button = null;

    private createPageButton(btnWrapper: HTMLElement) {
        this.prev = new Button({
            content: '上一页',
            className: 'list-detail-btn',
            container: btnWrapper,
            onClick: () => {
                if (this.currentPage !== 1){
                    let current = this.currentPage - 1;
                    this.changePage(current);
                }
            }
        });
        this.next = new Button({
            content: '下一页',
            container: btnWrapper,
            onClick: () => {
                if(this.currentPage !== this.totalNumber){
                    let current = this.currentPage + 1;
                    this.changePage(current);
                }
            },
            className: 'list-detail-btn'
        });
        this.checkPageButtonDisabled();
    }

    private checkPageButtonDisabled = () => {
        if (this.totalNumber === 1) {
            this.prev.disabled = true;
            this.next.disabled = true;
            return;
        }
        if (this.currentPage === 1) {
            this.prev.disabled = true;
        } else if (this.currentPage === this.totalNumber) {
            this.next.disabled = true;
        } else {
            this.prev.disabled = false;
            this.next.disabled = false;
        }
    };

    private scrollToTop() {
        (function smoothscroll() {
            let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                window.scrollTo(0, currentScroll - (currentScroll / 5));
            }
        })();
    }

    private getType(t: string): DetailCellType {
        let type: DetailCellType;
        if (t === '18') {
            type = 'textarea';
        } else if (t === '20' || t === '27' || t === '28') {
            type = 'img';
        } else if (t === '43' || t === '47' || t === '48') {
            type = 'file';
        } else if (t === '12') {
            type = 'date';
        } else if (t === '13') {
            type = 'datetime';
        } else {
            type = 'text';
        }
        return type;
    }

    handlerValue(text, format: R_Field): string | string[] {
        let v,
            type = tools.isNotEmpty(format) ? format.dataType || format.atrrs.dataType : '';
        let types = ['10', '11', '12', '13', '14', '17', '30', '31'];
        if (types.indexOf(type) >= 0) {
            v = G.Rule.formatTableText(text, format);
        } else {
            if (type === '18') {
                // 多行文本
                v = text;
            } else if (type === '20') {
                v = tools.isNotEmpty(format.link) ? [BW.CONF.siteUrl + BwRule.reqAddr(format.link, this.defaultData)] : '';
            } else if (type === '27' || type === '28') {
                // 单图和多图（唯一值） 单文件和多文件(唯一值)
                if (tools.isNotEmpty(text)){
                    let addrArr = text.split(','),
                        arr = [];
                    addrArr.forEach(md5 => {
                        // 根据md5获取文件地址
                        arr.push(BwRule.fileUrlGet(md5, format.name || format.atrrs.fieldName, true));
                    });
                    v = arr;
                }else{
                    v = [];
                }
            } else if (type === '47' || type === '48') {
                // 获取文件信息地址 （md5,unique）
                v = tools.isNotEmpty(format.fileInfo) ? BW.CONF.siteUrl + BwRule.reqAddr(format.fileInfo, this.defaultData) : '';
            } else if (type === '43') {
                // 附件名称 , Blob类型
                if (tools.isNotEmpty(text)) {
                    let obj = {
                        fileName: text,
                        fileSize: 0,
                        addr: ''
                    };
                    v = JSON.stringify([obj]);
                } else {
                    v = '';
                }
            } else {
                // dataType为空按照text类型处理
                v = text;
            }
        }
        return v;
    }

    destroy() {
        this.actionSheet.destroy();
        this.actionSheet = null;
        for (let key in this.cells) {
            this.cells[key].destroy();
        }
        this.cells = null;
        this.wrapper = null;
        this.defaultData = null;
    }
}