/// <amd-module name="DetailModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import {NewFormEdit, NewFormFactory} from "./NewFormFactory";
import {DetailCellType, ListItemDetailCell} from "./ListItemDetailCell";
import {ListItemDetail} from "./ListItemDetail";

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
        let emPara: NewFormEdit = {fields: [], defaultData: this.para.defaultData},
            formWrapper = <div className="form-wrapper"/>,
            fields = para.fm.fields || [],
            groupInfo = para.fm.groupInfo;
        if (tools.isMb || tools.isEmpty(groupInfo)) {
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
        } else {
            let fieldsArr = [...fields];
            groupInfo.forEach(group => {
                let result = this.getGroupFormPara(group,fieldsArr,formWrapper);
                emPara.fields = emPara.fields.concat(result.para);
                fieldsArr = result.fields;
            })
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
                    if (this.validate()) {
                        // 验证成功
                        tools.isFunction(para.confirm) && para.confirm(this.dataGet()).then(() => {
                            modal.isShow = false;
                            this.para && this.destroy();
                        });
                    }
                }
            }
        };

        let modal: Modal;
        if (tools.isMb) {
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
        } else {
            modal = new Modal({
                header: para.fm.caption + ' - 编辑',
                width: para.width || '90%',
                height: para.height || '90%',
                className: para.isPC ? 'detail-modal detail-edit' : 'detail-modal',
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

    private getGroupFormPara(groupInfo: IGroupInfo, fields: R_Field[], wrapper: HTMLElement): obj {
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
            </div>,
            emPara: ComInitP[] = [];
        wrapper.appendChild(groupWrapper);
        for (let i = 0; i < groupFields.length; i++) {
            let f = groupFields[i],
                className = ListItemDetail.COLUMN_CLASS_ARR[parseInt(groupInfo.columnNumber) - 1],
                type = this.getType(f.dataType || f.atrrs.dataType || '');
            if (~['textarea', 'file', 'img'].indexOf(type)) {
                className = 'one-column';
            }
            if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && f.noAdd) || (this.para.uiType == 'update' && f.noShow) || (this.para.uiType == 'flow' && f.noShow) || (this.para.uiType == 'detail' && f.noShow)) {
                continue;
            }
            let field = {
                dom: this.createFormWrapper(f, cellsWrapper,className),
                field: f
            };
            emPara.push(field);
            if ((['insert', 'associate'].indexOf(this.para.uiType) > -1 ? field.field.noModify : field.field.noEdit) && (['file', 'img'].indexOf(field.field.comType) < 0)) {
                field.dom && field.dom.classList.add('disabled');
            }
        }
        return {
            fields:fieldsArr,
            para:emPara
        };
    }

    private createFormWrapper(field: R_Field, wrapper: HTMLElement, className?: string): HTMLElement {
        if (field.comType === 'file' || field.comType === 'img') {
            return wrapper;
        } else {
            let elementType = tools.isNotEmpty(field.elementType) ? field.elementType : '';
            let formGroupWrapper = <div className={"detail-cell " + className || ''} data-name={field.name}
                                        data-type={field.comType} data-element-type={elementType}>
                <div className="detail-cell-title" data-input-type={field.comType}>{field.caption}</div>
            </div>;
            wrapper.appendChild(formGroupWrapper);
            return formGroupWrapper;
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
    private validate() {
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

    destroy() {
        document.body.classList.remove('edit-overflow-hidden');
        this.para.fm.fields.forEach(f => {
            this.editModule.destroy(f.name);
        });
        this.editModule = null;
        this.para = null;
    }
}