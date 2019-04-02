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
        });
        let handler;
        this.on(DetailModule.EVT_RENDERED, handler = () => {
            let btn = this.btnManager.box.getItem('edit');
            btn && this.autoEdit && btn.wrapper && btn.wrapper.click();
            this.off(DetailModule.EVT_RENDERED, handler)
        });
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
                if (detailEdit) {
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
                    if (detailEdit.isDelete) {
                        box.addItem(new Button({
                            content: '删除',
                            key: 'del',
                            onClick: () => {
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
            initState: () => {
                if(!editBox){
                    return ;
                }
                let editBtn = editBox.getItem('edit'),
                    delBtn = editBox.getItem('del');
                editBtn && (editBtn.isDisabled = this.total === 0);
                delBtn && (delBtn.isDisabled = this.total === 0);
            }
        }
    })();

    protected btnManager = (() => {
        let box: InputBox;

        let initStatus = () => {
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
                    let data = this.getData();
                    ButtonAction.get().clickHandle(btn, data, () => { }, this.pageUrl || '');

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
