/// <amd-module name="OfflineBtn"/>
import {BtnGroup} from "../../../global/components/ui/buttonGroup/btnGroup";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Loading} from "../../../global/components/ui/loading/loading";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {TextInput} from "../../../global/components/form/text/text";
import Shell = G.Shell;
import tools = G.tools;
import {GroupTabsPage} from "../../pages/groupTabs/GroupTabsPage";
import {EditModule} from "../edit/editModule";
import CONF = BW.CONF;
import d = G.d;
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";

interface IGeneralPara {
    ui?: IBW_Slave_Ui;  // 当前按钮对应ui
    numName?: string; // 主表替换逐一累加对应的name
    uniqueFlag?: string; // 当前按钮对应唯一键
    mainId: string   // 主表主键id
    subId: string   // 子表主键id
    mainKey: R_Field  // 主表主键
    subKey: R_Field  // 子表主键
    itemId: string
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
            numName: mainUi.correlation.numberName,
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
        let {ui} = this.getKeyField(itemId);  // 当前按钮对应的ui
        this.para.ui = ui;
        this.para.uniqueFlag = ui.uniqueFlag;
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
                this.scan(0);
                break;
            case 'import-scanning-many':
                this.scan(1);
                break;
            default:
                Modal.alert('未知类型openType');
        }
        if (ui.supportRfid) {
            this.openRfid();
        }
    }

    private openRfid() {
        Shell.inventory.startEpc(null, (result) => {
            this.query(result.data);
        })
    }

    private scan(type: number) {
        Shell.inventory.openScanCode(type, (result) => {
            // Modal.alert(result.data);
            this.query(result.data, type);
        })

    }

    /**
     * 数据查询
     * @param value
     * @param type
     */
    query(value: string, type = 0) {
        let keyField = this.para.mainKey.name;
        Shell.imports.operateScanTable(value, this.imports.getOption(), this.para.uniqueFlag, {
            [keyField]: this.imports.editModule.main.get(keyField)[keyField]
        }, this.para.numName, this.imports.getNum(), (result) => {
            Modal.alert(result);
            if (result.success) {
                let data = result.data;
                data.forEach(obj => {
                    let item = obj.item;
                    let {edit} = this.getKeyField(item);
                    Modal.alert(obj.array[0]);
                    edit.set(obj.array[0]);
                    this.imports.setText('');
                    this.getCountData();
                    this.getAggrData(item);
                });

            }
        });
    }

    private fieldName = 'amountcount ';

    /**
     * 请求shell查询count数据
     */
    private getCountData() {
        let data = this.imports.getTextPara(),
            id = data.itemId,
            {keyField, value} = this.getKeyField(id);

        Shell.imports.getCountData(this.para.uniqueFlag, data.itemId, this.fieldName, data.expression, {
            [keyField]: value
        }, result => {
            if (result.success) {
                this.imports.setAmount(result.data[this.fieldName]);
            }
        });
    }

    private getKeyField(itemId: string): { keyField: string, value: string, ui: IBW_Slave_Ui, edit: EditModule, key: R_Field } {
        let keyField, ui, edit, value, key;
        if (itemId === this.para.subId) {
            key = this.para.subKey;
            keyField = key.name;
            value = this.imports.editModule.sub.get(keyField);
            ui = this.imports.subUiGet() as IBW_Slave_Ui;
            edit = this.imports.editModule.sub;
        } else {
            key = this.para.mainKey;
            keyField = this.para.mainKey.name;
            value = this.imports.editModule.main.get(keyField);
            ui = this.imports.mainUiGet() as IBW_Slave_Ui;
            edit = this.imports.editModule.main;
        }
        return {keyField, value, ui, edit, key}
    }

    private getAggrData(item : string) {
        this.imports.aggrArr.forEach(aggr => {
            let id = aggr.itemId,
                {keyField, value} = this.getKeyField(id);

            if(item !== id){
                return;
            }
            Shell.imports.getCountData(this.para.uniqueFlag, id, this.fieldName, aggr.expression, {
                [keyField]: value
            }, result => {
                if (result.success) {
                    this.imports.setAggr(result.data[this.fieldName], id, keyField);
                }
            });
        })
    }

    // private getHeadTable() {
    //     let data = G.Shell.inventory.getTableInfo(this.para.uniqueFlag)
    //
    // }
    //
    // private registRfid() {
    //     G.Shell.inventory.openRegistInventory(0, {}, (res) => {
    //         // this.operateTbaleD.value = res.data;
    //         //实时更新方法
    //         // this.registerTable(this.operateTbaleD);
    //     })
    // }
    //
    // private registerTable(data: IparaCode) {
    //     G.Shell.inventory.codedataOperate(data.value, data.uniqueFlag, data.where, data.option, data.num, (res) => {
    //         let data = res.data.data;
    //         if (res.success) {
    //             //判断是否是替换 如果是替换value值不变 如果是其他的状态需要清空为0
    //         }
    //     })
    // }
    //
    // private randNum() {
    //     return new Date().getTime() + Math.random() * 10 + '.jpg';
    // }

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

    uploadData() {
        let loading = new Loading({
            msg: "数据上传中"
        });

        let url = CONF.siteUrl + this.btn.actionAddr.dataAddr;
        Shell.imports.uploadcodedata(this.para.uniqueFlag, url, (result) => {
            if (result.success) {
                Modal.toast('上传成功');
            } else {
                Modal.toast('上传失败');
            }
            loading.destroy();
        });
    }

    deleteData() {
        let body = <div className="delete-modal"/>;
        let mainKey = this.para.mainKey && this.para.mainKey.name,
            subKey = this.para.subKey && this.para.subKey.name,
            mainValue = this.imports.editModule.main.get(mainKey),
            subValue = this.imports.editModule.sub && this.imports.editModule.sub.get(subKey),
            mainId = this.para.mainId,
            subId = this.para.subId,
            mainObj = {
                text: this.para.mainKey.caption,
                value: mainValue,
                name: mainKey,
                item: mainId
            };

        let data = [{
            text: '所有',
            value: Object.assign({}, mainValue, subValue || {}),
            name: mainKey + ',' + subKey,
            item: ''
        }, mainObj, {
            text: this.para.subKey.caption,
            value: subValue,
            name: subKey,
            item: subId
        }];

        if(!this.para.subId){
            data = [mainObj];
        }
        let checks: CheckBox[] = [], inputEl: HTMLInputElement;
        data.forEach((m, i) => {
            let checkBox: CheckBox,
                input: HTMLInputElement,
                el = <div className="delete-cell">
                    <div className="delete-text">{m.text + '：'}</div>
                    {i !== 0 ? (input =
                        <input data-name={m.name} data-item={m.item} className="delete-input" type="text">
                            {m.value[m.name]}
                        </input>) : ``}
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
                if(this.para.subId){
                    arr.push({id: subId});
                }
            } else {
                let value = inputEl.value,
                    id = inputEl.dataset.item,
                    name = inputEl.dataset.name,
                    {edit} = this.getKeyField(id);

                if (tools.isEmpty(value)) {
                    value = edit.get(name)[name];
                }
                arr.push({id, value, keyField: name})
            }
            return arr;
        };
        let del = (itemId: string, keyField: string, value: string) => {
            let where = {
                [keyField] : value
            };
            if(!keyField){
                where = {};
            }

            Shell.imports.operateTable(this.para.uniqueFlag, itemId, {}, where, 'delete', result => {
                Modal.toast(result.msg);
            });
        };
        this.modalInit('deleteData', '请选择删除数据范围', body, () => {
            get().forEach(obj => {
                del(obj.id, obj.keyField, obj.value);
            })
        });

    }

    setting() {
        let body = <div className="barcode-setting"/>,
            operation = this.btn.operation,
            data = operation && operation.content,
            selectBox = new SelectBox({
                container: body,
                select: {
                    multi: false,
                },
                data,
            });
        let value = operation && operation.default || "1", index = 0;
        data.forEach((obj, i) => {
            if (obj.value === value) {
                index = i;
            }
        });
        selectBox.set([index]);

        this.modalInit('setting', '设置', body, () => {
            let value = selectBox.data[selectBox.getChecked()[0]].value;
            if(value !== this.imports.getOption()){
                this.imports.setCount(value);
                this.imports.setText('');
            }
        });
    }
    
    get imports(){
        return this.groupTabsPage.imports;
    }

    barCode() {
        let {key} = this.getKeyField(this.para.itemId),
            textInput: TextInput,
            body = <div data-code="barcodeModal">
                <label>{key.caption + ":"}</label>
                {textInput = <TextInput className='set-rfid-code'/>}
            </div>;
        this.modalInit('barcode', '请输入', body, () => {
            let val = textInput.get();
            if (tools.isEmpty(val)) {
                Modal.alert('条码不能为空');
                return;
            }
            this.query(val);
        });
    }

    private modal: Modal;

    modalInit(name: string, title: string, body: HTMLElement, onOk: () => void, footer = {}) {
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
        this.btnGroup = null;
        this.modal && this.modal.destroy();
        this.modal = null;
    }

}