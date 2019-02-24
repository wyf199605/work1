/// <amd-module name="OfflineBtn"/>
import {BtnGroup} from "../../../global/components/ui/buttonGroup/btnGroup";
import {IButton} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {ManagerImages} from "../uploadModule/ManagerImages";
import {Loading} from "../../../global/components/ui/loading/loading";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {TextInput} from "../../../global/components/form/text/text";
import IComponentPara = G.IComponentPara;
import Shell = G.Shell;
import tools = G.tools;
import Component = G.Component;
import {DetailBtnModule} from "../detailModule/detailBtnModule";
import {GroupTabsPage} from "../../pages/groupTabs/GroupTabsPage";
import {EditModule} from "../edit/editModule";

interface IBtnModulePara {
    subButtons: R_Button[]
    container: HTMLElement
    data?: IRfidBarCode
    btn : R_Button
}

interface IRfidBarCode extends IComponentPara {
    ajaxData?: object[];
    nameId?: string,
    codeStype?: object[],
    url?: string,
    SHO_ID?: string,
    USERID?: string
    uniqueFlag?: string,
    downUrl: string,
    uploadUrl: string,
    analysis?: string
    picFields?: string
    picAddr?: string
}

interface IparaCode {
    value: string //扫到的数据
    uniqueFlag?: string //主键
    where?: obj //条件
    option?: number //状态
    num?: number //替换的数据
}
interface IGeneralPara {
    ui? : IBW_Slave_Ui;
    numName? : string; // 替换逐一累加对应的name
    uniqueFlag? : string; // 地址作为唯一键
    mainId : string
    subId : string
    mainKey : R_Field
    subKey : R_Field
}
/**
 * 离线按钮操作：如条码盘点
 */
export class OfflineBtn{
    private btnGroup: BtnGroup;
    private groupTabsPage : GroupTabsPage;
    private btn : R_Button;
    private option: string; // 1.逐一 2.替换 3.累加
    private para : IGeneralPara;

    init(btn : R_Button, groupTabsPage : GroupTabsPage, itemId : string){
        this.groupTabsPage = groupTabsPage;
        this.btn = btn;
        console.log(btn);
        let mainUi = this.groupTabsPage.imports.mainUiGet(),
            subUi = this.groupTabsPage.imports.subUiGet();

        this.para = {
            mainId : mainUi.itemId,
            subId : subUi.itemId,
            mainKey : mainUi.fields.map(e => {
                if(e.name === mainUi.keyField){
                    return e
                }
            })[0],
            subKey : subUi.fields.map(e => {
                if(e.name === subUi.keyField){
                    return e
                }
            })[0]
        };
        let {ui} = this.getKeyField(itemId);  // 当前按钮对应的ui
        this.para.ui = ui;
        this.para.numName = ui.correlation && ui.correlation.numberName;
        this.para.uniqueFlag = ui.uniqueFlag;
        console.log(btn, ui);

        // this.barCode();
        // this.setting();
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
                this.scan(true);
                break;
            default:
                // Modal.alert('未知类型openType');
        }
        if(ui.supportRfid){
            this.openRfid();
        }
    }

    private openRfid(){
        Shell.inventory.startEpc(null, (result) => {
            this.query(result.data);
        })
    }

    private scan(reScan = false) {
        Shell.inventory.openScanCode(1, (result) => {
            this.query(result.data, reScan);
        })
    }

    query(value : string, reScan = false){
        let keyField = this.para.mainKey.name;
        Shell.imports.operateScanTable(value, this.option, this.para.uniqueFlag, {
            [keyField] : this.groupTabsPage.imports.editModule.main.get(keyField)[keyField]
        }, this.para.numName, this.groupTabsPage.imports.getNum(), (result) => {
            if(result.success){
                let data = result.data;
                if(data.itemid === this.para.mainId){
                    this.groupTabsPage.imports.editModule.main.set(data.array);
                }
                reScan && this.scan(reScan);
                this.groupTabsPage.imports.clearText();
                this.getCountData();
                this.getAggrData();
            }
        });
    }

    private fieldName = 'amountcount ';
    private getCountData(){
        let data = this.groupTabsPage.imports.getTextPara(),
            id = data.itemId,
            {keyField, value} = this.getKeyField(id);

        Shell.imports.getCountData(this.para.uniqueFlag, data.itemId, this.fieldName, data.expression, {
            [keyField] : value
        }, result => {
            if(result.success){
                this.groupTabsPage.imports.setAmount(result.data[this.fieldName]);
            }
        });
    }

    private getKeyField(itemId : string) : {keyField : string, value : string, ui : IBW_Slave_Ui, edit : EditModule}{
        let keyField, ui, edit, value;
        if(itemId === this.para.subId){
            keyField = this.para.subKey.name;
            value = this.groupTabsPage.imports.editModule.sub.get(keyField);
            ui = this.groupTabsPage.imports.subUiGet() as IBW_Slave_Ui;
            edit = this.groupTabsPage.imports.editModule.sub;
        }else {
            keyField = this.para.mainKey.name;
            value = this.groupTabsPage.imports.editModule.main.get(keyField);
            ui = this.groupTabsPage.imports.mainUiGet() as IBW_Slave_Ui;
            edit = this.groupTabsPage.imports.editModule.main;
        }
        return {keyField,value, ui, edit}
    }

    private getAggrData(){
        this.groupTabsPage.imports.aggrArr.forEach(arr => {
            let  id = arr.itemId,
                {keyField, value} = this.getKeyField(id);
            Shell.imports.getCountData(this.para.uniqueFlag, id, this.fieldName, arr.expression, {
                [keyField] : value
            }, result => {
                if(result.success){
                    this.groupTabsPage.imports.setAggr(result.data[this.fieldName], id, keyField);
                }
            });
        })
    }

    private getHeadTable() {
        let data = G.Shell.inventory.getTableInfo(this.para.uniqueFlag)

    }

    private registRfid() {
        G.Shell.inventory.openRegistInventory(0, {}, (res) => {
            // this.operateTbaleD.value = res.data;
            //实时更新方法
            // this.registerTable(this.operateTbaleD);
        })
    }

    private registerTable(data: IparaCode) {
        G.Shell.inventory.codedataOperate(data.value, data.uniqueFlag, data.where, data.option, data.num, (res) => {
            let data = res.data.data;
            if (res.success) {
                //判断是否是替换 如果是替换value值不变 如果是其他的状态需要清空为0
            }
        })
    }

    private randNum() {
        return new Date().getTime() + Math.random() * 10 + '.jpg';
    }

    private downData() {
        let loading = new Loading({
            msg: "下载数据中"
        });
        Shell.imports.downloadbarcode(this.btn.actionAddr.dataAddr,this.para.uniqueFlag, false, (result) => {
            loading.destroy();
            Modal.toast(result.msg)
        })
    }

    uploadData() {
        let loading = new Loading({
            msg: "数据上传中"
        });
        Shell.imports.uploadcodedata(this.para.uniqueFlag, (result) => {
            if(result.success){
                Modal.toast('上传成功');
            }else {
                Modal.toast('上传失败');
            }
            loading.destroy();
        });
    }

    deleteData() {
        let body = <div data-code="delete-modal"/>;
        let mainKey = this.para.mainKey && this.para.mainKey.name,
            subKey = this.para.subKey && this.para.subKey.name,
            main = {[this.para.mainId] : mainKey},
            sub = {[this.para.subId] : subKey};

        let data = [{
            text : '所有',
            value : mainKey + ',' + subKey,
            data : Object.assign(main, sub)
        },{
            text : this.para.mainKey.caption,
            value : mainKey,
            data : main
        },{
            text : this.para.subKey.caption,
            value : subKey,
            data : sub
        }];
        let select = new SelectBox({
            container: body,
            className : 'imports-select',
            data: data,
            select : {
                multi : false,
            }
        });
        let del = (itemId : string, keyField : string) => {
            let {edit} = this.getKeyField(itemId);
            Shell.imports.operateTable(this.para.uniqueFlag, itemId, {}, {
                [keyField] : edit.get(keyField)[keyField]
            }, 'delete', result => {

            });
        };
        this.modalInit('deleteData', '请选择删除数据范围', body, () => {
            let data = select.getSelect()[0].data as obj;
            for(let item in data){
                del(item, data[item]);
            }
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
            if(obj.value === value){
                index = i;
            }
        });
        selectBox.set([index]);

        this.modalInit('setting', '请输入设置', body, () => {
            this.option = selectBox.data[selectBox.getChecked()[0]].value;
            this.groupTabsPage.imports.setCount(this.option);
        });
    }

    barCode() {
        let textInput: TextInput,
            body = <div data-code="barcodeModal">
                <form className="barcode-form">
                    <label>条码:</label>
                    {textInput = <TextInput className='set-rfid-code'/>}
                </form>
            </div>;
        this.modalInit('barcode', '请输入条码', body, () => {
            let val = textInput.get();
            if(tools.isEmpty(val)){
                Modal.alert('条码不能为空');
                return;
            }
            this.query(val);
        });
    }

    private modal : Modal;
    modalInit(name: string, title: string, body: HTMLElement, onOk: () => void, footer = {}) {
      this.modal = new Modal({
            isMb: false,
            isOnceDestroy : true,
            position: "center",
            header: title,
            body: body,
            footer: footer,
            onOk: () => {
                onOk();
                this.destroy();
            },
            onClose : () => {
                this.destroy();
            }
        });
    }

    count(): HTMLElement {
        return <div class="barcode-count">
            <div class="barcode-row">
                <div>
                    <div>累加/替换数值：</div>
                    <TextInput iconHandle={() => {
                        alert(1)
                    }} placeholder="请输入"/>
                </div>
                <div>
                    <div>∑数量：</div>
                    <input type="text"/>
                </div>
            </div>
            <div class="barcode-row">
                <div>
                    <div>共扫描项数：</div>
                    <TextInput placeholder="请输入"/>
                </div>
                <div>
                    <div>总数量：</div>
                    <input type="text"/>
                </div>
            </div>
        </div>
    }

    destroy() {
        this.btnGroup && this.btnGroup.destroy();
        this.btnGroup = null;
        this.modal && this.modal.destroy();
        this.modal = null;
    }

}