/// <amd-module name="DetailModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import {NewFormEdit, NewFormFactory} from "./NewFormFactory";

interface IDetailModal extends EditPagePara {
    defaultData?: obj;
    isAdd?: boolean;

    cancel?(); // 取消回调
    confirm?(data: obj): Promise<any>; //确定回调
    width?: string;
    height?: string;
    isPC?: boolean;
}

export class DetailModal {
    private editModule: NewFormFactory;

    constructor(private para: IDetailModal) {
        document.body.classList.add('edit-overflow-hidden');
        let emPara: NewFormEdit = {fields: [], defaultData: this.para.defaultData};
        let formWrapper = <div className="form-wrapper"/>,
            fields = para.fm.fields || [];
        for (let i = 0, len = fields.length; i < len; i++) {
            let f = fields[i];
            if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && f.noAdd) || (this.para.uiType == 'update' && f.noShow) || (this.para.uiType == 'flow' && f.noShow) || (this.para.uiType == 'detail' && f.noShow)) {
                continue;
            }
            let field = {
                dom: this.createFormWrapper(f, formWrapper),
                field: f
            };
            emPara.fields.push(field);
            if ((['insert', 'associate'].indexOf(para.uiType) > -1 ? field.field.noModify : field.field.noEdit) && (['file', 'img'].indexOf(field.field.comType) < 0)) {
                field.dom && field.dom.classList.add('disabled');
            }
        }

        let footButtons = {
            leftPanel: {
                content: '取消',
                className: 'modal-btn edit-cancel',
                onClick: () => {
                    Modal.confirm({
                        msg: '确定取消编辑吗?',
                        callback: (flag) => {
                            if (flag) {
                                modal.isShow = false;
                            }
                        }
                    })
                }
            },
            rightPanel: {
                content: '确定',
                className: 'modal-btn eidt-confirm',
                type: 'primary',
                onClick: () => {
                    let data = this.dataGet();
                    if (this.validate(data)) {
                        // 验证成功
                        tools.isFunction(para.confirm) && para.confirm(data).then(() => {
                            modal.isShow = false;
                            this.para && this.destroy();
                        });
                    }
                }
            }
        };

        let modal:Modal;
        if (tools.isMb){
            new Modal({
                header: para.fm.caption + ' - 编辑',
                isMb: tools.isMb,
                className: 'detail-modal',
                isModal: tools.isMb,
                isOnceDestroy: true,
                body: formWrapper,
                onClose: () => {
                    this.para && this.destroy();
                    tools.isFunction(para.cancel) && para.cancel();
                },
                footer: {
                    leftPanel: [footButtons.leftPanel],
                    rightPanel: [footButtons.rightPanel]
                }
            });
        }else{
            modal = new Modal({
                header: para.fm.caption + ' - 编辑',
                width: para.width || '100%',
                height: para.height || '100%',
                className: para.isPC ? 'detail-modal full-screen' : 'detail-modal',
                isOnceDestroy: true,
                body: formWrapper,
                onClose: () => {
                    this.para && this.destroy();
                    tools.isFunction(para.cancel) && para.cancel();
                },
                footer: para.isPC ? {
                    leftPanel: [footButtons.leftPanel],
                    rightPanel: [footButtons.rightPanel]
                } : {
                    rightPanel: [
                        {
                            content: '取消',
                            className: 'modal-btn edit-cancel',
                            onClick: () => {
                                modal.isShow = false;
                                this.para && this.destroy();
                            }
                        },
                        footButtons.rightPanel
                    ]
                }
            });
        }
        this.editModule = new NewFormFactory(emPara);
        if (para.isAdd) {
            if (tools.isNotEmpty(para.fm.defDataAddrList)) {
                BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(para.fm.defDataAddrList[0])).then(({response}) => {
                    // 字段默认值
                    this.editModule.set(BwRule.getDefaultByFields(this.para.fm.fields));
                    // 新增时的默认值
                    let res: obj = {};
                    let meta = response.body.bodyList[0].meta,
                        dataTab = response.body.bodyList[0].dataList[0];
                    for (let i = 0, len = meta.length; i < len; i++) {
                        res[meta[i]] = dataTab[i];
                    }
                    this.editModule.set(res);
                })
            } else {
                this.editModule.set(BwRule.getDefaultByFields(this.para.fm.fields));
            }
        } else {
            // 字段默认值
            this.editModule.set(BwRule.getDefaultByFields(this.para.fm.fields));
            // 修改时字段的值
            tools.isNotEmpty(para.defaultData) && this.editModule.set(para.defaultData);
        }
    }

    private createFormWrapper(field: R_Field, wrapper: HTMLElement): HTMLElement {
        if (field.comType === 'file' || field.comType === 'img') {
            return wrapper;
        } else {
            let elementType = tools.isNotEmpty(field.elementType) ? field.elementType : '';
            let formGroupWrapper = <div className="detail-cell" data-name={field.name}
                                        data-type={field.comType} data-element-type={elementType}>
                <div className="detail-cell-title" data-input-type={field.comType}>{field.caption}</div>
            </div>;
            wrapper.appendChild(formGroupWrapper);
            return formGroupWrapper
        }
    }

    // 获取数据
    private dataGet() {
        let data = this.editModule.get();
        this.para.fm.fields.forEach(field => {
            let name = field.name,
                val = field.atrrs.defaultValue;
            if (field.noEdit && !tools.isEmpty(val)) {
                data[name.toLowerCase()] = val;
            }
        });
        return data;
    }

    // 验证
    private validate(pageData?: obj) {
        let result = this.editModule.validate.start();
        if (tools.isNotEmpty(result)) {
            for (let key in result) {
                Modal.alert(result[key].errMsg);
                return false;
            }
        } else {
            return true;
        }
    }

    destroy() {
        document.body.classList.remove('edit-overflow-hidden');
        this.para.fm.fields.forEach(f => {
            this.editModule.destroy(f.name);
        });
        this.editModule = null;
        this.para = null;
    }
}