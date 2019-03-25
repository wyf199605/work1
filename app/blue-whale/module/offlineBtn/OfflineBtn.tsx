/// <amd-module name="OfflineBtn"/>
import { BtnGroup } from "../../../global/components/ui/buttonGroup/btnGroup";
import { Modal } from "../../../global/components/feedback/modal/Modal";
import { Loading } from "../../../global/components/ui/loading/loading";
import { TextInput } from "../../../global/components/form/text/text";
import Shell = G.Shell;
import tools = G.tools;
import { GroupTabsPage } from "../../pages/groupTabs/GroupTabsPage";
import CONF = BW.CONF;
import d = G.d;
import { CheckBox } from "../../../global/components/form/checkbox/checkBox";
import { SelectInputMb } from "../../../global/components/form/selectInput/selectInput.mb";
import { ButtonAction } from "../../common/rule/ButtonAction/ButtonAction";
import sys = BW.sys;

interface IGeneralPara {
    ui?: IBW_Slave_Ui;  // 当前按钮对应ui
    uniqueFlag?: string; // 当前按钮对应唯一键
    mainId: string   // 主表主键id
    subId: string   // 子表主键id
    mainKey: R_Field  // 主表主键
    subKey: R_Field  // 子表主键
    itemId: string // 当前id
}

/**
 * 离线按钮操作：如条码盘点
 */
export class OfflineBtn {
    private btnGroup: BtnGroup;
    private groupTabsPage: GroupTabsPage;
    private btn: R_Button;  // 当前按钮ui
    private para: IGeneralPara;

    init(btn: R_Button, groupTabsPage: GroupTabsPage, itemId: string) {
        this.groupTabsPage = groupTabsPage;
        this.btn = btn;
        const mainUi = this.imports.mainUiGet(),
            subUi = this.imports.subUiGet();

        this.para = {
            mainId: mainUi.itemId,
            subId: subUi && subUi.itemId,
            uniqueFlag: mainUi.uniqueFlag,
            mainKey: mainUi.fields.map(e => {
                if (e.name === mainUi.keyField) return e
            })[0],
            subKey: subUi && subUi.fields.map(e => {
                if (e.name === subUi.keyField) return e
            })[0],
            itemId
        };
        const { ui } = this.imports.getKeyField(itemId);  // 当前按钮对应的ui
        this.para.ui = ui;
        switch (btn.openType) {
            case 'import-manual-input':
                this.barCode();
                break;
            case 'import-number-set':
                this.setting();
                break;
            case 'import-upload':
                this.uploadCheck();
                break;
            case 'import-download':
                this.downData();
                break;
            case 'import-delete':
                this.deleteData();
                break;
            case 'import-scanning-single':
                this.scan();
                break;
            case 'import-scanning-many':
                this.manyScan();
                break;
            case 'import-commit':
                this.commit();
                break;
            default:
                let { edit } = this.imports.getKeyField(itemId);
                ButtonAction.get().clickHandle(btn, edit.get(), () => { }, '');
        }
    }

    private commit() {
        const { keyField, value } = this.imports.getKeyField(this.para.itemId);
        this.imports.query(value[keyField]);
        this.imports.isModify = false;
    }

    private manyScan() {
        Shell.inventory.openScanCode(1, () => { }, (result) => {
            if (result.success) {
                this.imports.query(result.data);
            } else {
                Modal.toast(result.msg);
            }
        });
    }

    private scan() {
        Shell.inventory.openScanCode(0, (result) => {
            if (result.success) {
                this.imports.query(result.data);
            } else {
                Modal.toast(result.msg);
            }
        })
    }

    private downData() {
        const loading = new Loading({
            msg: "下载数据中",
            duration: 99999,
            disableEl: document.body
        });

        const url = CONF.siteUrl + this.btn.actionAddr.dataAddr;
        Shell.imports.downloadbarcode(this.para.uniqueFlag, url, false, (result) => {
            loading.destroy();
            Modal.toast(result.msg)
        })
    }

    private uploadCheck() {
        const option = this.imports.getOption();
        if (['2', '3'].includes(option) && this.imports.isModify) {
            Modal.confirm({
                msg: '存在未提交数据，确定放弃提交直接上传？',
                callback: flag => {
                    flag && this.uploadData();
                }
            })
        } else {
            this.uploadData();
        }
    }


    private uploadData() {
        const loading = new Loading({
            msg: "数据上传中",
            duration: 99999,
            disableEl: document.body
        });

        const url = CONF.siteUrl + this.btn.actionAddr.dataAddr;
        Shell.imports.uploadcodedata(this.para.uniqueFlag, url, (result) => {
            if (result.success) {
                Modal.toast('上传成功');
                // 上传成功后清空主表，子表数据
                this.imports.clear(this.para.mainId);
                let sub = this.imports.editModule.sub;
                sub && this.imports.clear(this.para.subId);
            } else {
                Modal.toast(result.msg);
            }
            loading.destroy();
        });
    }

    /**
     * 该部分由前端半写死生成
     */
    private deleteData() {
        const body = <div className="delete-modal" />,
            mainKey = this.para.mainKey && this.para.mainKey.name,
            subKey = this.para.subKey && this.para.subKey.name,
            mainValue = this.imports.editModule.main.get(mainKey),
            subValue = this.imports.editModule.sub && this.imports.editModule.sub.get(subKey),
            mainId = this.para.mainId,
            subId = this.para.subId;

        let checks: CheckBox[] = [],
            inputEl: HTMLInputElement,
            data = [{
                text: '清空操作数据',
                value: Object.assign({}, mainValue, subValue || {}),
                name: mainKey + ',' + subKey,
                item: ''
            }, {
                text: '删除下载数据',
                value: mainValue,
                name: mainKey,
                item: mainId
            }, {
                text: this.para.mainKey.caption + '：',
                value: mainValue,
                name: mainKey,
                item: mainId
            }];

        if (this.para.subId) {
            data.push({
                text: this.para.subKey.caption + '：',
                value: subValue,
                name: subKey,
                item: subId
            });
        }

        data.forEach((m, i) => {
            let checkBox: CheckBox,
                input: HTMLInputElement,
                el = <div className="delete-cell">
                    <div className="delete-text">{m.text}</div>
                    {i !== 0 ? (input = <input value={m.value[m.name] || ''} data-name={m.name} data-item={m.item} className="delete-input" type="text" />) : ``}
                    {checkBox = <CheckBox value={m.value} onClick={() => {
                        checks.forEach(check => {
                            check.checked = false;
                        });
                        checkBox.checked = true;
                        inputEl = input;
                    }} className="delete-check" />}
                </div>;
            if (i === 0) {
                checkBox.checked = true;
            }
            checks.push(checkBox);
            d.append(body, el);
        });

        const getSelect = (): { id: string, value: string, keyField: string,type?:any }[] => {
            let value = null, index = 0, arr = [];
            console.log(checks)
            checks.forEach((check, i) => {
                if (check.checked) {
                    value = check.value;
                    index = i
                }
            });
            if (index === 0) {
                arr.push({ id: mainId });
                if (this.para.subId) {
                    arr.push({ id: subId });
                }
            } else if (index === 1) {
                arr.push({ id: mainId, type: 'deleteAll' });
                if (this.para.subId) {
                    arr.push({ id: subId });
                }
            } else {
                let value = inputEl.value,
                    id = inputEl.dataset.item,
                    name = inputEl.dataset.name,
                    { edit } = this.imports.getKeyField(id);

                if (tools.isEmpty(value)) {
                    value = edit.get(name)[name];
                }
                arr.push({ id, value, keyField: name })
            }
            return arr;
        };
        const del = (itemId: string, keyField: string, value: string = '', type: string = 'delete') => {
            let where = {
                [keyField]: value
            };
            if (!keyField) {
                where = {};
            }

            Shell.imports.operateTable(this.para.uniqueFlag, itemId, {}, where, type, result => {
                console.log(result.data, 'operateTable删除表');
                if (result.success) {
                    Modal.toast('删除成功');
                    // 若为主表，则同时清空子表数据
                    if (itemId === this.para.mainId) {
                        this.para.subId && this.imports.clear(this.para.subId);
                    }
                    this.imports.clear(itemId);
                } else {
                    Modal.toast('删除失败');
                }
            });
        };
        this.modalInit('请选择删除数据范围', body, () => {
            getSelect().forEach(obj => {
                del(obj.id, obj.keyField, obj.value, obj.type);
            })
        });

    }

    private selectBox: SelectInputMb;
    private setting() {
        const body = <div className="barcode-setting" />,
            operation = this.btn.operation,
            data = operation && operation.content;
        this.selectBox = new SelectInputMb({
            container: body,
            data,
        });
        let value = operation && operation.default || "1", index = 1;
        data.forEach((obj, i) => {
            if (obj.value === value) {
                index = i;
            }
        });
        this.selectBox.set(value);

        this.modalInit('设置', body, () => {
            const value = this.selectBox.get();
            if (value !== this.imports.getOption()) {
                this.imports.setCount(value);
                this.imports.setText('');
            }
            this.imports.toggleComBtn(value);
        });
    }

    get imports() {
        return this.groupTabsPage.imports;
    }

    private barCode() {
        let { key } = this.imports.getKeyField(this.para.itemId),
            textInput: TextInput,
            body = <div data-code="barcodeModal">
                <label>{key.caption + ":"}</label>
                {textInput = <TextInput className='set-rfid-code' />}
            </div>;
        this.modalInit('请输入', body, () => {
            const val = textInput.get();
            if (tools.isEmpty(val)) return Modal.alert('条码不能为空');
            this.imports.query(val);
        });
    }

    private modal: Modal;

    private modalInit(title: string, body: HTMLElement, onOk: () => void, footer = {}) {
        this.modal = new Modal({
            isMb: false,
            isOnceDestroy: true,
            position: "center",
            header: title,
            body: body,
            footer: footer,
            onOk: () => {
                onOk();
                this.destroy();
            },
            onClose: () => {
                this.destroy();
            }
        });
    }

    destroy() {
        this.btnGroup && this.btnGroup.destroy();
        this.modal && this.modal.destroy();
        this.selectBox && this.selectBox.destroy();
        // this.selectBox = null;
        // this.btnGroup = null;
        // this.modal = null;
        // this.btn = null;
        // this.para = null;
    }
}