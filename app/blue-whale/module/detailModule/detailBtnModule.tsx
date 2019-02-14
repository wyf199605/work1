/// <amd-module name="DetailBtnModule"/>

import {DetailModule} from "./detailModule";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {BtnGroup} from "../../../global/components/ui/buttonGroup/btnGroup";
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import {ListItemDetail} from "../listDetail/ListItemDetail";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";

export class DetailBtnModule extends DetailModule{
    constructor(para){
        super(para);
        let subButton = this.ui.subButtons || [];
        this.btnManager.init();
        this.paging.init(this.btnManager.box);
        subButton.forEach((btn) => {
            this.btnManager.addBtn(btn);
        })
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
                        onClick: tools.pattern.throttling(() => {
                            this.dataManager && !this.dataManager.toPrev()
                        }, 500)
                    });
                    box.addItem(prevBtn);
                }
                if(!nextBtn){
                    nextBtn = new Button({
                        content: '下一页',
                        onClick: tools.pattern.throttling(() => {
                            this.dataManager && !this.dataManager.toNext()
                        }, 500)
                    });
                    box.addItem(nextBtn);
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
        let onFinish;
        return {
            init: (btn: R_Button) => {
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
                            this.detailEdit && this.detailEdit.save();
                        }
                    }),
                    cancelBtn = new Button({
                        content: '取消',
                        onClick: () => {
                            // this.edit.cancel();
                            this.detailEdit && this.detailEdit.cancel();
                            onFinish && onFinish();
                            inputBox.destroy();
                        }
                    });
                inputBox.addItem(saveBtn);
                inputBox.addItem(cancelBtn);
            },
            set onFinish(flag){
                onFinish = flag;
            }
        }
    })();

    protected btnManager = (() => {
        let box: InputBox;

        let initButton = (btn: R_Button): Button =>{
            return new Button({
                content: btn.caption,
                onClick: () => {
                    switch (btn.subType){
                        case 'update_save': {
                            this.editing = true;
                            box && box.wrapper.classList.add('hide');
                            this.editBtn.init(btn);
                            this.editBtn.onFinish = () => {
                                box && box.wrapper.classList.remove('hide');
                            };
                            break;
                        }
                        case 'delete_save': {
                            if(this.dataManager && this.dataManager.total !== 0){
                                this.detailEdit && this.detailEdit.del()
                            }else{
                                Modal.alert('没有数据可以删除！');
                            }
                            break;
                        }
                        default: {
                            let data = this.detailData;
                            ButtonAction.get().clickHandle(btn, data, () => {
                            }, this.pageUrl || '');
                            break;
                        }
                    }
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
