/// <amd-module name="DetailBtnModule"/>

import {DetailModule, IDetailModulePara} from "./detailModule";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {BtnGroup} from "../../../global/components/ui/buttonGroup/btnGroup";
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import {ListItemDetail} from "../listDetail/ListItemDetail";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {DetailEditModule} from "./detailEditModule";

export class DetailBtnModule extends DetailModule{
    constructor(para:IDetailModulePara){
        super(para);
        let subButton = this.ui.subButtons || [];
        this.btnManager.init();
        this.ui.uiType !== 'view' && this.paging.init(this.btnManager.box);
        this.editBtn.init(this.btnManager.box);

        subButton.forEach((btn) => {
            this.btnManager.addBtn(btn);
        });

        // this.on(DetailModule.EVT_RENDERED, () => {
        //     if (this.dataManager.total <= 1){
        //         this.btnManager.box.delItem('next');
        //         this.btnManager.box.delItem('prev');
        //     }
        // })
    }

    protected paging = (() => {
        let nextBtn,
            prevBtn,
            handler;
        return {
            init: (box: InputBox) => {
                if(!prevBtn) {
                    prevBtn = new Button({
                        content: '上一页',
                        key:'prev',
                        onClick: tools.pattern.throttling(() => {
                            this.dataManager && !this.dataManager.toPrev()
                        }, 500)
                    });
                    box.addItem(prevBtn,0);
                }
                if(!nextBtn){
                    nextBtn = new Button({
                        content: '下一页',
                        key:'next',
                        onClick: tools.pattern.throttling(() => {
                            this.dataManager && !this.dataManager.toNext()
                        }, 500)
                    });
                    box.addItem(nextBtn,1);
                }
                this.off(DetailModule.EVT_RENDERED, handler);
                this.on(DetailModule.EVT_RENDERED, handler = () => {
                    this.paging.initState();
                });
            },
            initState: () => {
                let dataManager = this.dataManager;
                if(dataManager){
                    nextBtn && (nextBtn.isDisabled = !dataManager.isToNext);
                    prevBtn && (prevBtn.isDisabled = !dataManager.isToPrev);
                }
            }
        }
    })();

    protected editBtn = (() => {
        let editBox: InputBox,
            detailEdit: DetailEditModule;
        let initEditState = () => {
            let inputBox = new InputBox({
                    container: this.btnWrapper
                }),
                saveBtn = new Button({
                    content: '保存',
                    onClick: () => {
                        // this.edit.save(btn).then(() => {
                        //     onFinish && onFinish();
                        //     inputBox.destroy();
                        // }).catch(() => {
                        //     Modal.alert('保存失败')
                        // });
                        this.detailEdit && this.detailEdit.save().then(() => {
                            close();
                            this.refresh().then(() => {
                                Modal.toast('保存成功');
                            }).catch((e) => {
                                console.log(e);
                            });
                        }).catch((e) => {
                            console.log(e);
                            Modal.alert('保存失败')
                        });
                    }
                }),
                cancelBtn = new Button({
                    content: '取消',
                    onClick: () => {
                        // this.edit.cancel();
                        close();
                        this.render();
                    }
                });
            inputBox.addItem(saveBtn);
            inputBox.addItem(cancelBtn);
            editBox.wrapper.classList.add('hide');
            let close = () => {

                this.detailEdit && this.detailEdit.cancel();
                inputBox.destroy();
                editBox.wrapper.classList.remove('hide');
            }
        };
        return {
            init: (box: InputBox) => {
                let editType = this.editType;
                detailEdit = this.detailEdit;
                editBox = box;
                if(detailEdit){
                    if(detailEdit.isUpdate){
                        box.addItem(new Button({
                            key: 'edit',
                            content: '编辑',
                            onClick: () => {
                                detailEdit.start(editType);
                                if(editType !== 'modal'){
                                    initEditState();
                                }
                            }
                        }))
                    }
                    if(detailEdit.isDelete){
                        box.addItem(new Button({
                            content: '删除',
                            key: 'del',
                            onClick: () => {
                                Modal.confirm({
                                    msg: '确定要删除吗？',
                                    callback: (flag) => {
                                        if(flag){
                                            detailEdit.del().then(() => {
                                                Modal.alert('删除成功');
                                                this.refresh();
                                            }).catch(() => {
                                                Modal.alert('删除失败');
                                            })
                                        }
                                    }
                                });
                            }
                        }))
                    }
                    if(detailEdit.isInsert){
                        box.addItem(new Button({
                            content: '新增',
                            key: 'insert',
                            onClick: () => {
                            }
                        }))
                    }
                }
            },
        }
    })();

    protected btnManager = (() => {
        let box: InputBox;

        let initButton = (btn: R_Button): Button =>{
            return new Button({
                content: btn.caption,
                onClick: () => {
                    let data = this.getData();
                    ButtonAction.get().clickHandle(btn, data, () => {
                    }, this.pageUrl || '');
                }
            })
        };
        return {
            init: (btns: R_Button[] = []) => {
                if(!box){
                    box = new InputBox({
                        container: this.btnWrapper,
                        isResponsive: true,
                        limitCount: 3,
                    });
                }
                btns.forEach((btn) => {
                    box.addItem(initButton(btn));
                });
            },
            addBtn(btn: R_Button, position?){
                box && box.addItem(initButton(btn), position);
            },
            get box(){
                return box;
            }
        }
    })();
}
