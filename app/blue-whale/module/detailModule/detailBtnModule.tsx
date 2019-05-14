/// <amd-module name="DetailBtnModule"/>

import { DetailModule, IDetailModulePara } from "./detailModule";
import { InputBox } from "../../../global/components/general/inputBox/InputBox";
import { BtnGroup } from "../../../global/components/ui/buttonGroup/btnGroup";
import { Button } from "../../../global/components/general/button/Button";
import { Modal } from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import { ListItemDetail } from "../listDetail/ListItemDetail";
import { ButtonAction } from "../../common/rule/ButtonAction/ButtonAction";
import { DetailEditModule } from "./detailEditModule";
import { FlowDesigner } from "../flowDesigner/FlowDesigner";
import { BwRule } from "../../common/rule/BwRule";
import { ContactsModule } from "../flowDesigner/ContactsModule";

export class DetailBtnModule extends DetailModule {
    constructor(para: IDetailModulePara) {
        super(para);
        let subButton = this.ui.subButtons || [];
        this.btnManager.init();
        this.ui.uiType !== 'view' && this.paging.init(this.btnManager.box);
        this.editBtn.init(this.btnManager.box);
        // console.log(JSON.stringify(subButton))
        // subButton = [{ "caption": "查看图片", "title": "查看图片", "icon": "ICONLIST", "actionAddr": { "type": "table", "needGps": 0, "dataAddr": "/app_sanfu_retail/null/ui/assselect/node_wmq1/associate-22", "varList": [{ "varName": "ASSETID" }], "varType": 2, "addrType": false, "commitType": 1 }, "buttonType": 0, "subType": "associate", "openType": "newwin", "hintBeforeAction": false, "refresh": 0, "multiselect": 2, "level_no": 3 }, { "caption": "资产档案", "title": "资产档案", "icon": "REPLYMAIL", "actionAddr": { "type": "table", "needGps": 0, "dataAddr": "/app_sanfu_retail/null/ui/assselect/node_wmq1/associate-h22", "varList": [{ "varName": "ASSETID" }], "varType": 2, "addrType": false, "commitType": 1 }, "buttonType": 0, "subType": "associate", "openType": "newwin", "hintBeforeAction": false, "refresh": 0, "multiselect": 2, "level_no": 0 }];
        subButton.forEach((btn) => {
            this.btnManager.addBtn(btn);
        });

        // this.on(DetailModule.EVT_RENDERED, () => {
        //     if (this.dataManager.total <= 1){
        //         this.btnManager.box.delItem('next');
        //         this.btnManager.box.delItem('prev');
        //     }
        // });

        this.on(DetailModule.EVT_RENDERED, () => {
            this.paging.initState();
            this.editBtn.initState();
            this.btnManager.initStatus();
            this.autoEdit && this.detailEdit && this.detailEdit.start(this.editType);
        });
        // let handler;
        // this.on(DetailModule.EVT_RENDERED, handler = () => {
        //     // let btn = this.btnManager.box.getItem('edit');
        //     // btn && this.autoEdit && btn.wrapper && btn.wrapper.click();
        //     this.off(DetailModule.EVT_RENDERED, handler)
        // });
    }

    protected paging = (() => {
        let inputBox: InputBox,
            nextBtn,
            prevBtn;
        return {
            init: (box: InputBox) => {
                inputBox = box;
                if (!prevBtn) {
                    prevBtn = new Button({
                        content: '上一页',
                        key: 'prev',
                        onClick: tools.pattern.throttling(() => {
                            if(this.editBtn.isChanged){
                                return
                            }
                            this.dataManager && !this.dataManager.toPrev()
                        }, 500)
                    });
                    box.addItem(prevBtn, 0);
                }
                if (!nextBtn) {
                    nextBtn = new Button({
                        content: '下一页',
                        key: 'next',
                        onClick: tools.pattern.throttling(() => {
                            if(this.editBtn.isChanged){
                                return
                            }
                            this.dataManager && !this.dataManager.toNext()
                        }, 500)
                    });
                    box.addItem(nextBtn, 1);
                }
            },
            initState: (box: InputBox = inputBox) => {
                if (!inputBox) {
                    return;
                }
                // let preIndex = null,
                //     nextIndex = null;
                // for (let i = 0; i < box.children.length; i++) {
                //     let item = box.children[i];
                //     if (item.content === "上一页") {
                //         preIndex = i;

                //     }
                //     if (item.content === "下一页") {
                //         nextIndex = i;
                //     }
                // }
                if(this.total <= 1){
                    box.delItem('next');
                    box.delItem('prev');
                }else{
                    !box.getItem('next') && box.addItem(nextBtn, 0);
                    !box.getItem('prev') && box.addItem(prevBtn, 0);
                    let dataManager = this.dataManager;
                    if (dataManager) {
                        nextBtn && (nextBtn.isDisabled = !dataManager.isToNext);
                        prevBtn && (prevBtn.isDisabled = !dataManager.isToPrev);
                    }
                }

            }
        }
    })();

    protected editBtn = (() => {
        let editBox: InputBox,
            detailEdit: DetailEditModule,
            changeHandler = () => false;
        let initEditState = (boxInput?: InputBox) => {
            let inputBox = boxInput || new InputBox({
                container: this.btnWrapper
            }),
                saveBtn = new Button({
                    content: '保存',
                    onClick: () => {
                        save();
                    }
                }),
                cancelBtn = new Button({
                    content: '取消',
                    onClick: () => {
                        // this.edit.cancel();
                        close();
                    }
                });
            inputBox.addItem(saveBtn);
            inputBox.addItem(cancelBtn);
            boxInput || editBox.wrapper.classList.add('hide');

            changeHandler = () => {
                if(!this.autoEdit){
                    return false;
                }
                let isChanged = this.detailEdit ? this.detailEdit.isChanged() : false;

                if(isChanged){
                    Modal.confirm({
                        msg: '数据已修改，是否保存？',
                        callback: (flag) => {
                            if(flag){
                                save()
                            }else{
                                close();
                            }
                        }
                    })
                }

                return isChanged;
            };

            let save = () => {
                if(this.detailEdit){
                    let isChanged = this.detailEdit.isChanged();
                    if(isChanged){
                        this.detailEdit.save().then(() => {
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
                    }else{
                        Modal.toast('暂无数据改变');
                        close();
                        this.render();
                    }

                }
            };
            let close = () => {
                if(!boxInput){
                    this.detailEdit && this.detailEdit.cancel();
                    inputBox.destroy();
                    editBox.wrapper.classList.remove('hide');
                }
                this.render();
            }
        };
        return {
            init: (box: InputBox) => {
                let editType = this.editType;
                detailEdit = this.detailEdit;
                editBox = box;
                if (detailEdit) {
                    if(this.autoEdit){
                        initEditState(box);
                    }else{
                        if (detailEdit.isUpdate) {
                            box.addItem(new Button({
                                key: 'edit',
                                content: '编辑',
                                onClick: () => {
                                    detailEdit.start(editType);
                                    if (editType !== 'modal') {
                                        initEditState();
                                    }
                                }
                            }))
                        }
                    }

                    if (detailEdit.isDelete) {
                        box.addItem(new Button({
                            content: '删除',
                            key: 'del',
                            onClick: () => {
                                if(this.editBtn.isChanged){
                                    return
                                }
                                Modal.confirm({
                                    msg: '确定要删除吗？',
                                    callback: (flag) => {
                                        if (flag) {
                                            detailEdit.del().then(() => {
                                                Modal.alert('删除成功');
                                                if(this.total !== 1 && this.dataManager.current === this.total - 1){
                                                    this.dataManager.toPrev();
                                                }else{
                                                    this.refresh();
                                                }
                                            }).catch(() => {
                                                Modal.alert('删除失败');
                                            })
                                        }
                                    }
                                });
                            }
                        }))
                    }
                    if (detailEdit.isInsert) {
                        box.addItem(new Button({
                            content: '新增',
                            key: 'insert',
                            onClick: () => {
                                this.defData.then((defData) => {
                                    detailEdit.insert(Object.assign({}, defData, this.ajaxData || {}));
                                });
                            }
                        }))
                    }
                }
            },
            get isChanged(){
                return changeHandler();
            } ,
            initState: () => {
                if(!editBox){
                    return ;
                }
                let editBtn = editBox.getItem('edit'),
                    delBtn = editBox.getItem('del');

                let editExpress = this.detailData['EDITEXPRESS'],
                    isNotEdit = this.total === 0 || editExpress === 0;

                editBtn && (editBtn.isDisabled = isNotEdit);
                delBtn && (delBtn.isDisabled = isNotEdit);
            }
        }
    })();



    protected btnManager = (() => {
        let box: InputBox,
            btnHandler = () => {};

        let initStatus = () => {
            if(this.total <= 0){
                box && box.children.forEach((btn: Button) => {
                    let btnUi = btn.custom as R_Button;
                    btnUi && btnUi.multiselect !== 0 && (btn.isDisabled = false);
                });
                return ;
            }
            let data = this.detailData;
            box && box.children.forEach((btn: Button) => {
                let btnUi = btn.custom as R_Button;
                if (tools.isEmpty(btnUi && btnUi.judgefield)) {
                    return;
                }
                let judges = btnUi.judgefield.split(','),
                    flag = judges.every((judge) => tools.isNotEmpty(data[judge]) ? data[judge] === 1 : true);
                btn.isDisabled = !flag;
            })
        };

        let initButton = (btn: R_Button): Button => {
            return new Button({
                content: btn.caption,
                custom: btn,
                level: btn.level_no,
                onClick: () => {
                    if(this.editBtn.isChanged){
                        return
                    }

                    // 流程引擎操作按钮
                    if (btn.subType.indexOf("flow_add_sign") > -1) {
                        BwRule.Ajax.fetch(BW.CONF.ajaxUrl.useAddressList_user, {
                            loading: {
                                msg: '加载中...',
                                disableEl: document.body
                            }
                        }).then(({ response }) => {
                            let field = response.body.elements[0].cols[0];
                            new ContactsModule({
                                field: field,
                                onGetData: (datas) => {
                                    let userId = [];
                                    datas.forEach(data => {
                                        data['USERID'] && userId.push(data['USERID'].toLowerCase());
                                    });
                                    ButtonAction.get().clickHandle(btn, { USERID: userId }, () => {
                                        //isShowContacts = false;
                                    });
                                },
                                onDestroy: () => {
                                    //    isShowContacts = false;
                                }
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                        return false;
                    } else if (btn.openType.indexOf('flow') > -1) {

                        let btnUi = btn as R_Button,
                            { multiselect } = btnUi,
                            selectedData = [this.detailData];
                        let select = multiselect === 1 ? selectedData[0] : selectedData,
                            dataAddr = BW.CONF.siteUrl + btnUi.actionAddr.dataAddr,
                            varList = btnUi.actionAddr.varList;
                        if (tools.isNotEmpty(varList)) {
                            varList.forEach((li, index) => {
                                let name = li.varName;
                                for (let key in select) {
                                    if (key === name) {
                                        if (index === 0) {
                                            dataAddr += '?';
                                        } else {
                                            dataAddr += '&';
                                        }
                                        dataAddr = dataAddr + `${key.toLowerCase()}=${select[key]}`
                                    }
                                }
                            })
                        }
                        let field = btn.openType.split('-')[1];
                        switch (field) {
                            case 'look': {
                                BwRule.Ajax.fetch(dataAddr).then(({ response }) => {
                                    new FlowDesigner(response, field);
                                }).catch(err => {
                                    console.log(err);
                                });
                            }
                                break;
                            case 'design': {
                                BwRule.Ajax.fetch(dataAddr, {
                                    type: 'GET'
                                }).then(({ response }) => {
                                    new FlowDesigner(response, field);
                                }).catch(err => {
                                    console.log(err);
                                });
                            }
                                break;
                        }
                        return;
                    }
                    // 普通操作按钮
                    let btnAction = ButtonAction.get(),
                        data = this.getData();
                    btnAction.clickHandle(btn, data, () => {
                        this.off(DetailModule.EVT_RENDERED, btnHandler);
                        if(btn.refresh === 1){
                            this.on(DetailModule.EVT_RENDERED, btnHandler = () => {
                                this.off(DetailModule.EVT_RENDERED, btnHandler);
                                if(this.total === 0){
                                    window.sessionStorage.setItem(DetailModule.backUp, '1');
                                    btnAction.btnRefresh(3, this.pageUrl);
                                }
                            })
                        }
                    }, this.pageUrl || '');

                }
            })
        };
        return {
            init: (btns: R_Button[] = []) => {
                if (!box) {
                    box = new InputBox({
                        container: this.btnWrapper,
                        isResponsive: true,
                        limitCount: 3,
                    });
                }
                btns.forEach((btn) => {
                    box.addItem(initButton(btn));
                });
                initStatus();
            },
            addBtn(btn: R_Button, position?) {
                box && box.addItem(initButton(btn), position);
            },
            get box() {
                return box;
            },
            initStatus
        }
    })();
}
