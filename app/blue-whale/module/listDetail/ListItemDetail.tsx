/// <amd-module name="ListItemDetail"/>
/// <amd-dependency path="hammer" name="Hammer"/>

declare const Hammer;
import {ActionSheet, IActionSheetButton} from "../../../global/components/ui/actionSheet/actionSheet";
import {BwRule} from "../../common/rule/BwRule";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {ListItemDetailCell} from "./ListItemDetailCell";
import {Button} from "../../../global/components/general/button/Button";
import {DetailModal} from "./DetailModal";
import tools = G.tools;
import d = G.d;

export class ListItemDetail {
    // DOM容器
    private wrapper: HTMLElement;
    private cells: objOf<ListItemDetailCell> = {};
    public defaultData: obj = {};
    public currentPage: number = 1;
    public totalNumber: number = 0;
    private ajaxUrl: string = '';
    private actionSheet: ActionSheet;

    constructor(private para: EditPagePara) {
        let wrapper = <div className="list-item-detail-wrapper"/>,
            dom = para.dom || document.body;
        dom.appendChild(wrapper);
        this.wrapper = wrapper;
        this.ajaxUrl = tools.isNotEmpty(para.fm.dataAddr) ? BW.CONF.siteUrl + BwRule.reqAddr(para.fm.dataAddr) : '';
        this.initDetailTpl(para.fm.fields);
        let self = this;
        this.initDetailData().then(data => {
            this.render(data);
            this.initDetailButtons();
            if (para.uiType === 'detail' && tools.isMb){
                let hammertime = new Hammer(para.dom);
                hammertime.on('swipeleft', function() {
                    // 下一页
                    if (self.currentPage !== self.totalNumber) {
                        let current = self.currentPage + 1;
                        self.changePage(current);
                    }
                });
                hammertime.on('swiperight', function() {
                    // 上一页
                    if (self.currentPage !== 1) {
                        let current = self.currentPage - 1;
                        self.changePage(current);
                    }
                });
            }
        });
    }

    // 初始化详情DOM
    initDetailTpl(fields: R_Field[]) {
        let groupInfo = this.para.fm.groupInfo || [];
        let cellsWrapper = <div className="list-detail-cells-wrapper"/>;
        this.wrapper.appendChild(cellsWrapper);
        if (tools.isMb || tools.isEmpty(groupInfo)) {
            if (!tools.isMb) {
                cellsWrapper.classList.add('no-group');
            }
            fields.forEach(field => {
                if (!field.noShow) {
                    this.cells[field.name] = new ListItemDetailCell({
                        caption: field.caption,
                        type: DetailModal.getType(field.dataType || field.atrrs.dataType || ''),
                        container: cellsWrapper,
                        detailPage: this,
                        field: field,
                        link: field.supportLink === true ? field.link : null
                    });
                }
            });
        } else {
            let fieldsArr = [...fields];
            groupInfo.forEach(group => {
                fieldsArr = this.initPCGroupTpl(group, fieldsArr, cellsWrapper);
            });
        }
    }

    static COLUMN_CLASS_ARR = ['one-column', 'two-column', 'three-column'];

    private initPCGroupTpl(groupInfo: IGroupInfo, fields: R_Field[], wrapper: HTMLElement): R_Field[] {
        if (tools.isEmpty(groupInfo.cloNames)) {
            return fields;
        }
        let groupsArr = groupInfo.cloNames.split(','),
            groupFields: R_Field[] = [],
            fieldsArr = [...fields];
        groupsArr.forEach(field => {
            let gFields = fieldsArr.filter(f => f.name === field);
            if (tools.isNotEmptyArray(gFields)) {
                groupFields.push(gFields[0]);
                let index = fieldsArr.indexOf(gFields[0]);
                fieldsArr.splice(index, 1);
            }
        });
        let cellsWrapper, groupWrapper = <div className="group-wrapper">
            <div className="group-title">{groupInfo.groupName}</div>
            {cellsWrapper = <div className="group-cells-wrapper"/>}
        </div>;
        wrapper.appendChild(groupWrapper);
        groupFields.forEach(field => {
            let className = ListItemDetail.COLUMN_CLASS_ARR[parseInt(groupInfo.columnNumber) - 1],
                type = DetailModal.getType(field.dataType || field.atrrs.dataType || '');
            if (~['textarea', 'file', 'img'].indexOf(type)) {
                className = 'one-column';
            }
            if (!field.noShow) {
                this.cells[field.name] = new ListItemDetailCell({
                    caption: field.caption,
                    type: type,
                    container: cellsWrapper,
                    detailPage: this,
                    field: field,
                    className: className,
                    link: field.supportLink === true ? field.link : null
                });
            }
        });
        return fieldsArr;
    }

    // 初始化详情数据
    initDetailData(): Promise<obj> {
        let fields: R_Field[] = this.para.fm.fields;
        return new Promise<obj>((resolve) => {
            let data: obj = {};
            if (tools.isNotEmpty(this.ajaxUrl)) {
                let url = tools.url.addObj(this.ajaxUrl, {
                    pageparams: '{"index"=' + this.currentPage + ', "size"=' + 1 + ',"total"=1}'
                });
                BwRule.Ajax.fetch(url, {
                    loading: {
                        msg: '数据加载中...',
                        disableEl: this.wrapper
                    }
                }).then(({response}) => {
                    if (tools.isNotEmpty(response.body.bodyList[0]) && tools.isNotEmpty(response.body.bodyList[0].dataList)) {
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
                    } else {
                        Modal.alert('暂无数据!');
                        resolve(BwRule.getDefaultByFields(fields));
                    }
                });
            } else {
                Modal.alert('无数据地址!');
                resolve(BwRule.getDefaultByFields(fields));
            }
        })
    }

    // 上一页下一页加载数据
    changePage(page?: number) {
        if (this.para.uiType === 'detail') {
            if (tools.isNotEmpty(page)) {
                if (page > 0) {
                    if (page > this.totalNumber) {
                        this.currentPage = this.totalNumber;
                    } else {
                        this.currentPage = page;
                    }
                } else {
                    this.totalNumber = 0;
                    this.currentPage = 1;
                }
            }
            this.checkPageButtonDisabled();
            this.scrollToTop();
            this.initDetailData().then(data => {
                this.render(data);
            });
        } else {
            this.scrollToTop();
            this.initDetailData().then(data => {
                this.render(data);
            });
        }
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
                        subBtnEvent(isPage ? index : index + 2);
                    }
                })
            });
            self.actionSheet = new ActionSheet({
                buttons: actionBtns
            });
        }

        function createPcButtons(buttons: R_Button[], wrapper: HTMLElement) {
            buttons.forEach((btn, index) => {
                new Button({
                    content: btn.caption,
                    icon: btn.icon && btn.icon.split(' ')[1],
                    iconPre: btn.icon && btn.icon.split(' ')[0],
                    onClick: () => {
                        subBtnEvent(index);
                    },
                    container: wrapper
                })
            })
        }

        if (tools.isNotEmpty(buttons)) {
            let btnWrapper = <div className="list-item-detail-buttons"/>;
            d.before(d.query('.list-detail-cells-wrapper', this.wrapper), btnWrapper);
            if (this.para.uiType === 'detail') {
                if (tools.isMb) {
                    createMoreBtn(buttons, btnWrapper, true);
                    this.createPageButton(btnWrapper);
                } else {
                    // PC 按钮
                    let pcBtnWrapper = <div className="item-buttons"/>,
                        pageBtnWrapper = <div className="page-buttons"/>;
                    if (tools.isNotEmpty(buttons)) {
                        btnWrapper.appendChild(pcBtnWrapper);
                        createPcButtons(buttons, pcBtnWrapper);
                    }
                    btnWrapper.appendChild(pageBtnWrapper);
                    this.createPageButton(pageBtnWrapper);
                }
            } else {
                if (tools.isMb) {
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
                } else {
                    // PC 按钮
                    if (tools.isNotEmpty(buttons)) {
                        let pcBtnWrapper = <div className="item-buttons"/>;
                        btnWrapper.appendChild(pcBtnWrapper);
                        createPcButtons(buttons, pcBtnWrapper);
                    }
                }
            }
        } else {
            if (tools.isMb) {
                d.query('.list-detail-cells-wrapper', this.wrapper).classList.add('full-height');
                if (this.para.uiType === 'detail') {
                    let btnWrapper = <div className="list-item-detail-buttons"/>;
                    this.wrapper.appendChild(btnWrapper);
                    this.createPageButton(btnWrapper);
                } else {
                    this.wrapper.style.paddingBottom = '0px';
                }
            }
        }

        // 处理按钮触发
        function subBtnEvent(index) {
            let btn = self.para.fm.subButtons[index];
            switch (btn.subType) {
                case 'update_save' :
                case 'insert_save':
                    let isAdd = btn.subType !== 'update_save';
                    if (!isAdd && self.totalNumber === 0 && self.para.uiType === 'detail') {
                        Modal.alert('没有数据可以编辑!');
                        return;
                    }
                    btn.refresh = 0;
                    new DetailModal(Object.assign({}, self.para, {
                        defaultData: btn.subType === 'update_save' ? self.defaultData : {},
                        isAdd: isAdd,
                        isPC: !tools.isMb,
                        confirm(data) {
                            return new Promise((resolve) => {
                                ButtonAction.get().clickHandle(btn, data, () => {
                                    switch (btn.subType) {
                                        case 'insert_save': {
                                            self.totalNumber += 1;
                                            self.changePage(1);
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
                    if (self.totalNumber !== 0) {
                        btn.refresh = 0;
                        ButtonAction.get().clickHandle(btn, self.defaultData, () => {
                            if (self.para.uiType === 'detail') {
                                // 删除后显示下一页，如果已是最后一页，则显示上一页
                                let currentPage = self.currentPage >= self.totalNumber ? self.currentPage - 1 : self.currentPage;
                                self.totalNumber = self.totalNumber - 1;
                                self.changePage(currentPage);
                            }
                        });
                    } else {
                        Modal.alert('无数据可以删除!');
                    }
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
                if (this.currentPage !== 1) {
                    let current = this.currentPage - 1;
                    this.changePage(current);
                }
            }
        });
        this.next = new Button({
            content: '下一页',
            container: btnWrapper,
            onClick: () => {
                if (this.currentPage !== this.totalNumber) {
                    let current = this.currentPage + 1;
                    this.changePage(current);
                }
            },
            className: 'list-detail-btn'
        });
        this.checkPageButtonDisabled();
    }

    private checkPageButtonDisabled = () => {
        if (this.totalNumber === 1 || this.totalNumber === 0) {
            this.prev.disabled = true;
            this.next.disabled = true;
            return;
        }
        if (this.currentPage === 1) {
            this.prev.disabled = true;
            this.next.disabled = false;
        } else if (this.currentPage === this.totalNumber) {
            this.next.disabled = true;
            this.prev.disabled = false;
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
            } else if (type === '26' || type === '27' || type === '28') {
                // 单图和多图（唯一值）
                if (tools.isNotEmpty(text)) {
                    let addrArr = text.split(','),
                        arr = [];
                    tools.isNotEmpty(addrArr) && addrArr.forEach(md5 => {
                        // 根据md5获取文件地址
                        arr.push(BwRule.fileUrlGet(md5, format.name || format.atrrs.fieldName, true));
                    });
                    v = arr;
                } else {
                    v = [];
                }
            } else if (type === '47' || type === '48') {
                // 获取文件信息地址 （md5,unique）
                v = tools.isNotEmpty(format.fileInfo) ? BW.CONF.siteUrl + BwRule.reqAddr(format.fileInfo, this.defaultData) : '';
            } else if (type === '43') {
                // 附件名称 , Blob类型
                if (tools.isNotEmpty(text)) {
                    let obj = {
                        filename: text,
                        filesize: 0,
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

    getCells(): ListItemDetailCell[] {
        return [...Object.values(this.cells)];
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