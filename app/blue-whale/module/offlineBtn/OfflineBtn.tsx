/// <amd-module name="OfflineBtn"/>
import {BtnGroup} from "../../../global/components/ui/buttonGroup/btnGroup";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Loading} from "../../../global/components/ui/loading/loading";
import {TextInput} from "../../../global/components/form/text/text";
import Shell = G.Shell;
import tools = G.tools;
import {GroupTabsPage} from "../../pages/groupTabs/GroupTabsPage";
import CONF = BW.CONF;
import d = G.d;
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";

interface IGeneralPara {
    ui?: IBW_Slave_Ui;  // 当前按钮对应ui
    numName?: string; // 主表替换逐一累加对应的name
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
        let mainUi = this.imports.mainUiGet(),
            subUi = this.imports.subUiGet();

        this.para = {
            mainId: mainUi.itemId,
            subId: subUi && subUi.itemId,
            numName: this.imports.getTextPara().name,
            uniqueFlag : mainUi.uniqueFlag,
            mainKey: mainUi.fields.map(e => {
                if (e.name === mainUi.keyField) {
                    return e
                }
            })[0],
            subKey: subUi && subUi.fields.map(e => {
                if (e.name === subUi.keyField) {
                    return e
                }
            })[0],
            itemId
        };
        let {ui} = this.imports.getKeyField(itemId);  // 当前按钮对应的ui
        this.para.ui = ui;
        console.log(btn, ui);

        switch (btn.openType) {
            case 'import-manual-input':
                this.barCode();
                break;
            case 'import-number-set':
                this.setting();
                break;
            case 'import-upload':
                this.uploadData();
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
                Modal.alert('未知类型openType');
        }
    }

    private commit(){
        this.imports.getCountData();
    }

    private manyScan(){
        Shell.inventory.openScanCode(1, () => {},(result) => {
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
        let loading = new Loading({
            msg: "下载数据中"
        });

        let url = CONF.siteUrl + this.btn.actionAddr.dataAddr;
        Shell.imports.downloadbarcode(this.para.uniqueFlag, url, false, (result) => {
            loading.destroy();
            Modal.toast(result.msg)
        })
    }

    private uploadData() {
        let loading = new Loading({
            msg: "数据上传中"
        });

        let url = CONF.siteUrl + this.btn.actionAddr.dataAddr;
        Shell.imports.uploadcodedata(this.para.uniqueFlag, url, (result) => {
            if (result.success) {
                Modal.toast('上传成功');
            } else {
                Modal.toast(result.msg);
            }
            loading.destroy();
        });
    }

    private deleteData() {
        let body = <div className="delete-modal" />;
        let mainKey = this.para.mainKey && this.para.mainKey.name,
            subKey = this.para.subKey && this.para.subKey.name,
            mainValue = this.imports.editModule.main.get(mainKey),
            subValue = this.imports.editModule.sub && this.imports.editModule.sub.get(subKey),
            mainId = this.para.mainId,
            subId = this.para.subId,
            checks: CheckBox[] = [],
            inputEl: HTMLInputElement,
            data = [{
                text: '所有',
                value: Object.assign({}, mainValue, subValue || {}),
                name: mainKey + ',' + subKey,
                item: ''
            },{
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
                    {i !== 0 ? (input = <input value={m.value[m.name] || ''} data-name={m.name} data-item={m.item} className="delete-input" type="text"/>) : ``}
                    {checkBox = <CheckBox value={m.value} onClick={() => {
                        checks.forEach(check => {
                            check.checked = false;
                        });
                        checkBox.checked = true;
                        inputEl = input;
                    }} className="delete-check"/>}
                </div>;
            if (i === 0) {
                checkBox.checked = true;
            }
            checks.push(checkBox);
            d.append(body, el);
        });

        let get = (): { id: string, value: string, keyField: string }[] => {
            let value = null, index = 0, arr = [];
            checks.forEach((check, i) => {
                if (check.checked) {
                    value = check.value;
                    index = i
                }
            });
            if (index === 0) {
                arr.push({id: mainId});
                if (this.para.subId) {
                    arr.push({id: subId});
                }
            } else {
                let value = inputEl.value,
                    id = inputEl.dataset.item,
                    name = inputEl.dataset.name,
                    {edit} = this.imports.getKeyField(id);

                if (tools.isEmpty(value)) {
                    value = edit.get(name)[name];
                }
                arr.push({id, value, keyField: name})
            }
            return arr;
        };
        let del = (itemId: string, keyField: string, value: string = '') => {
            let where = {
                [keyField]: value
            };
            if (!keyField) {
                where = {};
            }

            Shell.imports.operateTable(this.para.uniqueFlag, itemId, {}, where, 'delete', result => {
                console.log(result.data, 'operateTable删除表');
                if(result.success){
                    Modal.toast('删除表（' + itemId + ')成功');
                    let {edit} = this.imports.getKeyField(itemId);
                    this.imports.editSet(edit, {});
                }else {
                    Modal.toast('删除表（' + itemId + ')失败');
                }
            });
        };
        this.modalInit('请选择删除数据范围', body, () => {
            get().forEach(obj => {
                del(obj.id, obj.keyField, obj.value);
            })
        });

    }

    private selectBox : SelectInputMb;
    private setting() {
        let body = <div className="barcode-setting"/>,
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
            let value = this.selectBox.get();
            if (value !== this.imports.getOption()) {
                this.imports.setCount(value);
                this.imports.setText('');
            }
        });
    }

    get imports() {
        return this.groupTabsPage.imports;
    }

    private barCode() {
        let {key} = this.imports.getKeyField(this.para.itemId),
            textInput: TextInput,
            body = <div data-code="barcodeModal">
                <label>{key.caption + ":"}</label>
                {textInput = <TextInput className='set-rfid-code'/>}
            </div>;
        this.modalInit('请输入', body, () => {
            let val = textInput.get();
            if (tools.isEmpty(val)) {
                Modal.alert('条码不能为空');
                return;
            }
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
        this.selectBox = null;
        this.btnGroup = null;
        this.modal = null;
        this.btn = null;
        this.para = null;
    }
}