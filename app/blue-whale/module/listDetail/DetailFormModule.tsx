/// <amd-module name="DetailFormModule"/>

import Component = G.Component;
import {EditModule} from "../edit/editModule";
import IComponentPara = G.IComponentPara;
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {DetailModal} from "./DetailModal";
import {ListItemDetail} from "./ListItemDetail";
import tools = G.tools;

interface IDetailFormModulePara extends IComponentPara {
    fields?: R_Field [];//面板中元素列表  input date 下拉等
    groupInfo?: IGroupInfo[];
    uiType?: string;
    defDataAddrList?: R_ReqAddr[];//默认值获取地址列表
}

export class DetailFormModule extends Component {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return tools.os.ios ? <div className="form-wrapper ios-form"/> : <div className="form-wrapper"/>;
    }

    constructor(private para: IDetailFormModulePara) {
        super(para);
        this.initEditModule(para);
    }

    public editModule: EditModule;

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 初始化表单控件(EditModule)
     */
    protected initEditModule(para: IDetailFormModulePara) {
        let emPara: EditModulePara = {fields: []},
            formWrapper = this.wrapper,
            fields = para.fields || [],
            groupInfo = para.groupInfo;
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
        this.editModule = new EditModule(emPara);
        emPara.fields.forEach((f) => {
            let field = f.field,
                name = field.name,
                isNotEdit = field.noEdit;
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
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 设置表单控件的数据
     */
    private _editData: obj;
    set editData(editData: obj) {
        this._editData = editData;
        if (tools.isEmpty(editData)) {
            this.para.fields.forEach(f => {
                if (!f.noShow) {
                    this.editModule.getDom(f.name).set('');
                }
            });
        } else {
            this.editModule.set(editData);
            this.setLookUp(editData);
        }
    }

    get editData() {
        return this._editData;
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 处理表单的字段，得到创建控件需要的参数
     */
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
        if (f.comType === 'textarea') {
            className = tools.isNotEmpty(className) ? className + ' textarea' : 'textarea';
        }
        return {
            dom: f.comType === 'virtual' ? null : DetailModal.createFormWrapper(f, wrapper, className || ''),
            field: f,
            data: {},
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
                                    this.para.fields.forEach((field) => {
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

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: PC端分组处理
     */
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

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 获取数据
     */
    private dataGet() {
        let data = this.editModule.get();
        this.para.fields.forEach(field => {
            let name = field.name,
                val = field.atrrs.defaultValue;
            if (field.noEdit && !tools.isEmpty(val)) {
                data[name.toLowerCase()] = val;
            }
        });
        return data;
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 设置lookup数据
     */
    private setLookUp(data: obj) {
        if (tools.isEmpty(data)) {
            return;
        }
        this.lookup.then(() => {
            this.para.fields.forEach((field) => {
                if (field.elementType === 'lookup') {
                    let lCom = this.editModule.getDom(field.name);
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
            });
        })
    }

    private _lookUpData: objOf<ListItem[]> = {};
    get lookUpData() {
        return this._lookUpData || {};
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 获取lookup数据
     */
    private get lookup(): Promise<void> {
        if (tools.isEmpty(this._lookUpData)) {
            let allPromise = this.para.fields.filter(col => col.elementType === 'lookup')
                .map(col => BwRule.getLookUpOpts(col).then((items) => {
                    // debugger;
                    this._lookUpData = this._lookUpData || {};
                    this._lookUpData[col.name] = items;
                }));

            return Promise.all(allPromise).then(() => {
            })
        } else {
            return Promise.resolve();
        }
    }

    destroy() {
        this.para.fields.forEach((f) => {
            this.editModule.getDom(f.name).destroy();
        });
        this.para = null;
        this.editModule = null;
        this._lookUpData = null;
        super.destroy();
    }
}