/// <amd-module name="EditDetail"/>

import { DetailBase, IDetailBasePara } from "./DetailBase";
import { Button } from "../../../global/components/general/button/Button";
import { Modal } from "../../../global/components/feedback/modal/Modal";
import { ListItemDetail } from "./ListItemDetail";
import { DetailModal } from "./DetailModal";
import { ActionSheet, IActionSheetButton } from "../../../global/components/ui/actionSheet/actionSheet";
import { ButtonAction } from "../../common/rule/ButtonAction/ButtonAction";
import tools = G.tools;

export class EditDetail extends DetailBase {

    constructor(para: IDetailBasePara) {
        super(para);
        if (this.para.uiType === 'edit_view') {
            this.wrapper.classList.add('edit_view');
        }
        this.initAllButtons();
        // this.isEdit = para.isEdit;
    }

    protected initDetailButtonsModule() {
    }

    set isEdit(isEdit: boolean) {
        this._isEdit = isEdit;
        if (this.totalNumber === 0 && this.para.uiType !== 'edit_view') {
            this.cancelBtn.disabled = true;
            this.updateBtn.disabled = true;
            this.saveBtn.disabled = true;
            tools.isNotEmpty(this.moreBtn) && (this.moreBtn.disabled = false);
            this.fields.forEach(f => {
                if (!f.noShow && !f.noEdit) {
                    this.detailForm.editModule.getDom(f.name).disabled = true;
                }
            });
            if (tools.isPc) {
                this.actionButtons.forEach(btn => {
                    btn.disabled = btn.custom.subType !== 'insert_save';
                })
            }
        } else {
            // if (tools.isPc) {
            //     this.actionButtons.forEach(btn => {
            //         btn.disabled = isEdit;
            //     })
            // }
            //编辑状态下也可以点击新增
            console.log(111)
            if (!tools.isPc) {
               setTimeout(() => {
                this.moreBtn.disabled=false;
               }, 1000);
            }
            this.cancelBtn.disabled = !isEdit;
            this.updateBtn.disabled = isEdit;
            this.saveBtn.disabled = !isEdit;
            tools.isNotEmpty(this.moreBtn) && (this.moreBtn.disabled = isEdit);
            this.fields.forEach(f => {
                if (!f.noShow && !f.noEdit) {
                    this.detailForm.editModule.getDom(f.name).disabled = !isEdit;
                }
            })
        }
    }

    get isEdit() {
        return this._isEdit;
    }

    private actionSheet: ActionSheet;
    private saveBtn: Button;
    private updateBtn: Button;
    private cancelBtn: Button;
    private updateBtnPara: R_Button;
    private moreBtn: Button;
    private actionButtons: Button[] = []; // PC端专用

    private initAllButtons() {
        let subButtons: R_Button[] = this.para.fm.subButtons,
            buttons: R_Button[] = [],
            self = this;

        // 更多按钮
        function createMoreBtn(buttons: R_Button[], wrapper: HTMLElement) {
            self.moreBtn = new Button({
                content: '更多',
                className: 'more',
                container: wrapper,
                onClick: () => {
                    // 点击更多
                    self.actionSheet.isShow = true;
                }
            });
            let actionBtns: IActionSheetButton[] = [];
            buttons.forEach((b) => {
                actionBtns.push({
                    content: b.caption,
                    onClick: () => {
                        subBtnEvent(b);
                    }
                });
            });
            self.actionSheet = new ActionSheet({
                buttons: actionBtns
            });
        }

        // 创建PC按钮
        function createPcButtons(buttons: R_Button[], wrapper: HTMLElement) {
            console.log(buttons)
            buttons.forEach((btn) => {
                self.actionButtons.push(new Button({
                    content: btn.caption,
                    // icon: btn.icon && btn.icon.split(' ')[1],
                    // iconPre: btn.icon && btn.icon.split(' ')[0],
                    custom: btn,
                    className: 'action-btn',
                    onClick: () => {
                        subBtnEvent(btn);
                    },
                    container: wrapper
                }));
            });
        }

        function createEditBtn(wrapper: HTMLElement) {
            self.updateBtn = new Button({
                content: '编辑',
                className: 'edit-btn',
                container: wrapper,
                onClick: () => {
                    self.isEdit = true;
                }
            });
            self.saveBtn = new Button({
                content: '保存',
                className: 'edit-btn',
                container: wrapper,
                onClick: () => {
                    if (self.validate()) {
                        // 验证成功
                        self.updateBtnPara.refresh = 0;
                        let data = self.detailForm.editModule.get();
                        if (tools.isNotEmpty(self.updateBtnPara.actionAddr.varList)) {
                            data = ListItemDetail.getOldFieldData(self.updateBtnPara, data);
                        }
                        ButtonAction.get().clickHandle(self.updateBtnPara, data, () => {
                            if (self.isKeyStep === true) {
                                let keyStepData = self.keyStepData || [];
                                keyStepData[self.currentPage - 1] = data;
                                self.keyStepData = keyStepData;
                            }
                            self.isEdit = false;
                        }, self.para.url || '');
                    }
                }
            });
            self.cancelBtn = new Button({
                content: '取消',
                className: 'edit-btn',
                container: wrapper,
                onClick: () => {
                    self.getDetailData().then((data) => {
                        self.detailForm.editData = data;
                        self.isEdit = false;
                    });
                }
            })
        }

        if (tools.isNotEmpty(subButtons)) {
            subButtons.forEach(btn => {
                if (btn.subType === 'update_save') {
                    this.updateBtnPara = btn;
                } else {
                    buttons.push(btn);
                }
            });
            if (tools.isNotEmpty(buttons)) {
                let btnWrapper = <div className="list-item-detail-buttons" />;
                this.wrapper.appendChild(btnWrapper);
                if (tools.isMb) {
                    createMoreBtn(buttons, btnWrapper);
                    createEditBtn(btnWrapper);
                    if (~DetailBase.detailTypes.indexOf(this.para.uiType)) {
                        this.initPageButtons();
                    }
                } else {
                    // PC 按钮
                    let pcBtnWrapper = <div className="item-buttons" />,
                        pageBtnWrapper = <div className="page-buttons" />;
                    if (tools.isNotEmpty(buttons)) {
                        btnWrapper.appendChild(pcBtnWrapper);
                        createEditBtn(pcBtnWrapper);
                        createPcButtons(buttons, pcBtnWrapper);
                    }
                    if (~DetailBase.detailTypes.indexOf(this.para.uiType)) {
                        this.initPageButtons(pageBtnWrapper);
                    }
                    btnWrapper.appendChild(pageBtnWrapper);
                }
            }
        }

        // 处理按钮触发
        function subBtnEvent(btn: R_Button) {
            let varList = btn.actionAddr.varList,
                def_data = self.defaultData;
            if (tools.isNotEmpty(varList)) {
                def_data = ListItemDetail.getOldFieldData(btn, def_data || {})
            }
            switch (btn.subType) {
                case 'insert_save':
                    btn.refresh = 0;
                    new DetailModal(Object.assign({}, self.para, {
                        defaultData: {},
                        isAdd: true,
                        isPC: !tools.isMb,
                        confirm(data) {
                            return new Promise((resolve) => {
                                let old_data = data;
                                if (tools.isNotEmpty(varList)) {
                                    old_data = ListItemDetail.getOldFieldData(btn, old_data);
                                }
                                ButtonAction.get().clickHandle(btn, old_data, () => {
                                    if (self.isKeyStep === true) {
                                        let keyStepData = self.keyStepData;
                                        keyStepData.push(data);
                                        self.keyStepData = keyStepData;
                                        self.totalNumber = self.totalNumber + 1;
                                        self.currentPage = self.totalNumber;
                                    } else {
                                        self.totalNumber += 1;
                                    }
                                    self.refresh();
                                    resolve();
                                });
                            })
                        }
                    }));
                    break;
                case 'delete_save': {
                    if (self.totalNumber !== 0) {
                        btn.refresh = 0;
                        ButtonAction.get().clickHandle(btn, def_data, () => {
                            // 删除后显示下一页，如果已是最后一页，则显示上一页
                            if (self.isKeyStep === true) {
                                let keyStepData = self.keyStepData || [];
                                keyStepData.splice(self.currentPage - 1, 1);
                                self.keyStepData = keyStepData;
                            }
                            let currentPage = self.currentPage >= self.totalNumber ? self.currentPage - 1 : self.currentPage;
                            self.totalNumber = self.totalNumber - 1;
                            self.refresh(currentPage);
                        });
                    } else {
                        Modal.alert('无数据可以删除!');
                    }
                }
                    break;
                case 'flow_save':
                    if (!self.validate()) {
                        return false;
                    }
                    btn.hintAfterAction = true;
                    self.save(btn, self.detailForm.editModule.get(), () => {
                    });
                    break;
                case 'flow_submit':
                    if (!self.validate()) {
                        return false;
                    }
                    btn.hintAfterAction = true;
                    // 先保存再发送
                    let edit_data = self.detailForm.editModule.get();
                    ButtonAction.get().clickHandle(btn, edit_data, () => {
                    }, self.para.url);
                    break;
                default:
                    // 其他按钮
                    let data = self.defaultData;
                    if (tools.isNotEmpty(varList)) {
                        data = ListItemDetail.getOldFieldData(btn, data || {});
                    }
                    ButtonAction.get().clickHandle(btn, data, () => {
                    }, self.para.url || '');
                    break;
            }
        }
    }

    private save(btn: R_Button, pageData: obj, callback?) {
        ButtonAction.get().clickHandle(btn, pageData, response => {
            btn.buttonType = 2;
            let data = response.data && response.data[0] ? response.data[0] : null;
            if (data) {
                this.detailForm.editData = data;
            }
            typeof callback === 'function' && callback(response);
        }, this.para.url);
    }

    private initPageButtons(wrapper?: HTMLElement) {
        let btnWrapper = wrapper ? wrapper : <div className="page-buttons" />;
        this.wrapper.appendChild(btnWrapper);
        this.prev = new Button({
            content: '上一页',
            className: 'list-detail-btn',
            container: btnWrapper,
            onClick: () => {
                if (this.currentPage !== 1) {
                    if (this.isEdit && this.checkIsSave()) {
                        Modal.confirm({
                            msg: '还有数据未保存，确定跳转上一页吗?',
                            callback: (flag) => {
                                if (flag) {
                                    let current = this.currentPage - 1;
                                    this.refresh(current);
                                }
                            }
                        })
                    } else {
                        let current = this.currentPage - 1;
                        this.refresh(current);
                    }
                }
            }
        });
        this.next = new Button({
            content: '下一页',
            container: btnWrapper,
            onClick: () => {
                if (this.currentPage !== this.totalNumber) {
                    if (this.isEdit && this.checkIsSave()) {
                        Modal.confirm({
                            msg: '还有数据未保存，确定跳转下一页吗?',
                            callback: (flag) => {
                                if (flag) {
                                    let current = this.currentPage + 1;
                                    this.refresh(current);
                                }
                            }
                        })
                    } else {
                        let current = this.currentPage + 1;
                        this.refresh(current);
                    }
                }
            },
            className: 'list-detail-btn'
        });
        this.checkPageButtonDisabled();
    }

    private checkIsSave(): boolean {
        let data = this.detailForm.editModule.get(),
            defaultData = this.defaultData;
        for (let key in defaultData) {
            if (tools.isNotEmpty(defaultData[key])) {
                if (defaultData[key] != data[key]) {
                    return true;
                }
            } else {
                if (tools.isNotEmpty(data[key])) {
                    return true;
                }
            }
        }
        return false;
    }

    destroy() {
        this.actionSheet && this.actionSheet.destroy();
        this.actionSheet = null;
        this.saveBtn && this.saveBtn.destroy();
        this.saveBtn = null;
        this.updateBtn && this.updateBtn.destroy();
        this.updateBtn = null;
        this.cancelBtn && this.cancelBtn.destroy();
        this.cancelBtn = null;
        this.moreBtn && this.moreBtn.destroy();
        this.moreBtn = null;
        this.actionButtons = null;
        super.destroy();
    }
}