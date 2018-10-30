/// <amd-module name="ListItemDetail"/>

import {BwRule} from "../../common/rule/BwRule";
import {DetailCellType, ListItemDetailCell} from "./ListItemDetailCell";
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {DetailModal} from "./DetailModal";
import {ActionSheet, IActionSheetButton} from "../../../global/components/ui/actionSheet/actionSheet";

export class ListItemDetail {
    // DOM容器
    private wrapper: HTMLElement;
    private cells: objOf<ListItemDetailCell> = {};
    public defaultData: obj = {};
    private currentPage: number = 1;
    private totalNumber: number = 1;
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
                    detailPage:this
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
    private changePage() {
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
        function createMoreBtn(buttons: R_Button[], wrapper) {
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
                        subBtnEvent(index + 2);
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
                createMoreBtn(buttons, btnWrapper);
                this.createPageButton(btnWrapper);
            } else {
                if (buttons.length > 2) {
                    let btns = buttons.slice(0, 2), moreBtns = buttons.slice(2);
                    createMoreBtn(moreBtns, btnWrapper);
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
                    new DetailModal(Object.assign({},self.para,{defaultData:self.defaultData,button:btn}));
                    break;
                case 'insert_save':
                    new DetailModal(Object.assign({},self.para,{defaultData:self.defaultData,button:btn}));
                    break;
                default:
                    ButtonAction.get().clickHandle(btn, self.defaultData, () => {
                    });
                    break;
            }
        }
    }

    private createPageButton(btnWrapper: HTMLElement) {
        let prev = new Button({
                content: '上一页',
                className: 'list-detail-btn',
                container: btnWrapper,
                onClick: () => {
                    // 更新页数
                    this.currentPage !== 1 && (this.currentPage = this.currentPage - 1);
                    // 检测按钮是否可用
                    checkPageButtonDisabled();
                    // 加载数据
                    this.changePage();
                    this.scrollToTop();
                }
            }),
            next = new Button({
                content: '下一页',
                container: btnWrapper,
                onClick: () => {
                    this.currentPage !== this.totalNumber && (this.currentPage = this.currentPage + 1);
                    checkPageButtonDisabled();
                    this.changePage();
                    this.scrollToTop();
                },
                className: 'list-detail-btn'
            });
        let checkPageButtonDisabled = () => {
            if (this.totalNumber === 1) {
                prev.disabled = true;
                next.disabled = true;
                return;
            }
            if (this.currentPage === 1) {
                prev.disabled = true;
            } else if (this.currentPage === this.totalNumber) {
                next.disabled = true;
            } else {
                prev.disabled = false;
                next.disabled = false;
            }
        };
        checkPageButtonDisabled();
    }

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
        } else if (t === '43' || t === '47' || t === '48' || t === '40') {
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
            } else if (type === '20' || type === '27' || type === '28') {
                // 单图和多图（唯一值） 单文件和多文件(唯一值)
                let addrArr = text.split(','),
                    arr = [];
                addrArr.forEach(md5 => {
                    // 根据md5获取文件地址
                    arr.push(BwRule.fileUrlGet(md5, format.name || format.atrrs.fieldName, true));
                });
                v = arr;
            } else if (type === '47' || type === '48' || type === '40') {
                // 获取文件信息地址 （md5,unique）
                let uniques = text.split(',');
                uniques.forEach(uniq => {

                })
            } else if (type === '43') {
                // 附件名称

            } else {
                // dataType为空按照text类型处理
                v = text;
            }
        }
        return v;
    }

    // 获取文件信息地址
    private getFileInfoAddr(uniq?: string) {

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