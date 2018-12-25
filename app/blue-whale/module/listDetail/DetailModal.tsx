/// <amd-module name="DetailModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import {DetailCellType} from "./ListItemDetailCell";
import {ListItemDetail} from "./ListItemDetail";
import {EditModule} from "../edit/editModule";

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
    private editModule: EditModule;
    private fields: R_Field[] = [];

    constructor(private para: IDetailModal) {
        document.body.classList.add('edit-overflow-hidden');
        let emPara: EditModulePara = {fields: [], defaultData: this.para.defaultData},
            formWrapper = <div className="form-wrapper"/>,
            fields = para.fm.fields || [],
            groupInfo = para.fm.groupInfo;
        this.fields = fields;
        BwRule.beforeHandle.fields(fields, para.uiType);
        if (tools.isMb || tools.isEmpty(groupInfo)) {
            tools.isPc && formWrapper.classList.add('no-group');
            for (let i = 0, len = fields.length; i < len; i++) {
                let f = fields[i];
                emPara.fields.push(this.handleField(f, formWrapper));
            }
        } else {
            let fieldsArr = [...fields];
            groupInfo.forEach(group => {
                let result = this.getGroupFormPara(group, fieldsArr, formWrapper);
                emPara.fields = emPara.fields.concat(result.para);
                fieldsArr = result.fields;
            });
            // 不在组中的字段，一般为隐藏字段
            if (tools.isNotEmpty(fieldsArr)) {
                fieldsArr.forEach(f => {
                    emPara.fields.push(this.handleField(f, formWrapper, '', true));
                })
            }
        }
        let modal: Modal;
        let footButtons = {
            leftPanel: {
                content: '取消',
                className: 'modal-btn edit-cancel',
                onClick: () => {
                    Modal.confirm({
                        msg: '确定取消编辑吗?',
                        callback: (flag) => {
                            if (flag) {
                                modal && (modal.isShow = false);
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

        if (tools.isMb) {
            modal = new Modal({
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
        this.editModule = new EditModule(emPara);
        emPara.fields.forEach((f) => {
            let field = f.field,
                name = field.name,
                isNotEdit = para.isAdd ? field.noModify : field.noEdit;
            if (isNotEdit && !field.noShow) {
                let com = this.editModule.getDom(name);
                com && (com.disabled = true);
                if (tools.isMb) {
                    let wrapper = com.wrapper || com.container;
                    wrapper && wrapper.addEventListener('click', () => {
                        Modal.toast(field.caption + '不可以修改～');
                    });
                }
            }
        });
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
                let defaultValue = BwRule.getDefaultByFields(this.para.fm.fields);
                if (tools.isNotEmpty(para.defaultData)){
                    defaultValue = Object.assign({}, defaultValue, para.defaultData);
                }
                this.editModule.set(defaultValue);
            }
        } else {
            let defaultValue = BwRule.getDefaultByFields(this.para.fm.fields);
            if (tools.isNotEmpty(para.defaultData)){
                defaultValue = Object.assign({}, defaultValue, para.defaultData);
            }
            this.editModule.set(defaultValue);
        }
    }

    // 处理字段
    private handleField(f: R_Field, wrapper: HTMLElement, className?: string, isVirtual = false): ComInitP {
        let self = this;
        if (f.comType === 'file') {
            f.comType = 'newFile';
        }
        if (isVirtual === true) {
            f.comType = 'virtual';
        }
        if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && f.noAdd) || f.noShow) {
            f.comType = 'virtual';
        }
        return {
            dom: f.comType === 'virtual' ? null : DetailModal.createFormWrapper(f, wrapper, className || ''),
            field: f,
            data: this.para.defaultData,
            onExtra: (data, relateCols) => {
                let com = self.editModule.getDom(f.name);
                for (let key of relateCols) {
                    let hCom = self.editModule.getDom(key);
                    if (hCom && hCom !== com) {
                        let hField = hCom.custom as R_Field;
                        hCom.set(data[key] || '');
                        if (hField.assignSelectFields && hField.assignAddr) {
                            BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(hField.assignAddr, this.dataGet()), {
                                cache: true,
                            }).then(({response}) => {
                                let res = response.data;
                                if (res && res[0]) {
                                    hField.assignSelectFields.forEach((name) => {
                                        let assignCom = self.editModule.getDom(name);
                                        assignCom && assignCom.set(res[0][name]);
                                    });
                                    let data = this.dataGet();
                                    this.fields.forEach((field) => {
                                        if (field.elementType === 'lookup') {
                                            let lCom = self.editModule.getDom(field.name);
                                            if (!data[field.lookUpKeyField]) {
                                                lCom.set('');
                                            } else {
                                                let options = this.lookUpData[field.name] || [];
                                                for (let opt of options) {
                                                    if (opt.value == data[field.lookUpKeyField]) {
                                                        lCom.set(opt.value);
                                                    }
                                                }
                                            }
                                        }
                                    })
                                }

                            })
                        }
                    }
                }
            }
        };
    }

    private _lookUpData: objOf<ListItem[]> = {};
    get lookUpData() {
        return this._lookUpData || {};
    }


    // 处理分组
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
                type = DetailModal.getType(f.dataType || f.atrrs.dataType || '');
            if (~['textarea', 'file', 'img'].indexOf(type)) {
                className = 'one-column';
            }
            emPara.push(this.handleField(f, cellsWrapper, className));
        }
        return {
            fields: fieldsArr,
            para: emPara
        };
    }

    // 创建表单项wrappaer
    static createFormWrapper(field: R_Field, wrapper: HTMLElement, className?: string): HTMLElement {
        if (field.comType === 'newFile' || field.comType === 'image') {
            return wrapper;
        } else {
            let elementType = tools.isNotEmpty(field.elementType) ? field.elementType : '';
            className = tools.isNotEmpty(className) ? "detail-cell " + className : 'detail-cell';
            let formGroupWrapper = <div className={className} data-name={field.name}
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
        let result:obj = this.editModule.validate.start();
        if (tools.isNotEmpty(result)) {
            for (let key in result) {
                let errMsg = result[key].errMsg;
                if(tools.isNotEmpty(errMsg)){
                    Modal.alert(result[key]);
                    return false;
                }
            }
        } else {
            return true;
        }
    }

    static getType(t: string): DetailCellType {
        let type: DetailCellType;
        if (t === '18') {
            type = 'textarea';
        } else if (t === '20' || t === '26' || t === '27' || t === '28') {
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