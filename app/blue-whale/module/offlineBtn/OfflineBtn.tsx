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
    ui : IBW_Detail;
    numName : string; // 替换逐一累加对应的name
    uniqueFlag : string; // 地址作为唯一键
}
/**
 * 离线按钮操作：如条码盘点
 */
export class OfflineBtn{
    private btnGroup: BtnGroup;
    private btnModule : DetailBtnModule;
    private btn : R_Button;
    private option: number; // 1.逐一 2.替换 3.累加
    private para : IGeneralPara;

    init(btn : R_Button, btnModule : DetailBtnModule){
        console.log(btn);
        this.btnModule = btnModule;
        this.btn = btn;
        this.para = {
            ui : btnModule.uiPara,
            numName : btnModule.uiPara.correlation.numberName,
            uniqueFlag :  btn.actionAddr.dataAddr
        };
        // this.barCode();
        this.setting();
        switch (btn.openType) {
            case 'barcode':
                this.barCode();
                break;
            case 'setting':
                this.setting();
                break;
            case 'uploadData':
                this.uploadData();
                break;
            case 'deleteData':
                this.deleteData();
                break;
            case 'singleScan':
                this.scan();
                break;
            case 'continueScan':
                this.scan(true);
                break;
            default:
                // Modal.alert('未知类型openType');
        }
    }

    private scan(reScan = false) {
        Shell.inventory.openScanCode(1, (res) => {
            this.query(res.data, reScan);
        })
    }

    query(value : string, reScan = false){
        Shell.imports.operateScanTable(value, this.option, this.para.uniqueFlag, this.para.ui.fields, this.para.numName, this.btnModule.getNum(), (result) => {
            if(result.success){
                this.btnModule.render(result.data);
                reScan && this.scan(reScan);
            }
        });
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
        // let downUrl = BW.CONF.siteUrl + this.p.data.downUrl,
        //     uploadUrl = BW.CONF.siteUrl + this.p.data.uploadUrl;
        Shell.imports.downloadbarcode(this.para.uniqueFlag, false, (res) => {
            loading.destroy();
            if (res.success) {
                let data = G.Shell.inventory.getTableInfo(this.para.uniqueFlag);
                let pageName = data.data;

                //只需要注册一个监听事件
                // this.rigisterRifd();
                //判断状态
                //造数据条件
            }
            else {
                //发现有未上传数据
                let mode1 = new Modal({
                    isMb: false,
                    position: "center",
                    header: '提示',
                    zIndex: 1022,
                    isOnceDestroy: true,
                    isBackground: true,
                    body: <div><h5>有未上传数据，是否继续</h5></div>,
                    footer: {},
                    onOk: () => {
                        // this.getHeadTable();
                        // let ScanData =  G.Shell.inventory.getScanData(this.uniqueFlag);
                        // if(ScanData.success){
                        //     loading.destroy();
                        //     let res = ScanData.data.data;
                        //     //重新定义数据
                        //     //存储obj数据结构 跟 res数据比对 拼接 以及重新刷新条件传值参数
                        //
                        //
                        //     if(res){
                        //         let str = '';
                        //         for(let val in this.DataclassInfoCp[0]) {
                        //             for(let obj in res[0]){
                        //                 // alert(obj + 'ppp');
                        //                 if (obj == val) {
                        //                     str += res[0][val];
                        //                     // alert(data[i][val] + 'oo')
                        //                 }
                        //             }
                        //             // alert(str + '字符串')
                        //             this.domHash['categoryVal1'].innerHTML = str;
                        //         }
                        //         let strs = '';
                        //
                        //         for(let val in  this.DataclassInfoCp[1]){
                        //             for(let obj in res[0]){
                        //                 if(obj == val){
                        //                     strs += res[0][val];
                        //                 }
                        //             }
                        //             this.domHash['categoryVal2'].innerHTML = strs;
                        //         }
                        //         let strss = '';
                        //
                        //         for(let val in  this.DataclassInfoCp[2]){
                        //             for(let obj in res[0]){
                        //                 if(obj == val){
                        //                     strss += res[0][val];
                        //                 }
                        //             }
                        //             this.domHash['categoryVal3'].innerHTML = strss;
                        //         }
                        //
                        //     }
                        //     //更新数据条件
                        //     this.domHash['barcode'].innerHTML =  res[0][this.keyField];
                        //     this.domHash['Commodity'].innerHTML = res[0][this.nameField];
                        //     this.domHash['count'].innerHTML = res[0]['AMOUNT'] ? res[0]['AMOUNT']: 0 + '';
                        //
                        // }

                        //
                        mode1.destroy();
                    },
                    onClose: () => {
                        // G.Shell.inventory.downloadbarcode(para.uniqueFlag, BW.CONF.siteUrl + para.downUrl, BW.CONF.siteUrl + para.uploadUrl,true, (res=>{
                        //     alert(res.msg)
                        //     if(res.success){
                        //         loading.destroy();
                        //         this.getHeadTable(para);
                        //     }
                        // }))
                        //Modal.toast('输入成功');

                    }

                })
            }

        })

    }

    uploadData() {
        let body = <div data-code="updataModal">

        </div>;
        this.modalInit('uploadData', '上传数据', body, () => {
        }, {
            rightPanel: [{
                content: "上传",
                onClick: () => {
                    // let field = para.picFields,
                    //     IMAOBJ = {};
                    // IMAOBJ[field] = this.photoImgData;
                    // let IMA = [];
                    // IMA.push(IMAOBJ);
                    let s = new Loading({
                        msg: '上传中'
                    });
                    s.show();
                    // let typeValue = {};
                    // typeValue[typeName] = updataEl.getText()? updataEl.getText() : null;
                    // console.log( updataEl.getText());
                    // let mes = G.Shell.inventory.uploadcodedata(para.uniqueFlag, para.picAddr,(tools.isNotEmpty(para.picFields)) ? IMA : '','atvarparams',JSON.stringify(typeValue),(res) => {
                    //     d.query('.total-rfid>.bar-code-scan>span').innerText = 0 + '';
                    //     this.stepArry = [];
                    //     s.destroy();
                    //     // alert('再次返回上传接口数据')
                    //     if (!res.success) {
                    //         alert('上传失败');
                    //     } else {
                    //         this.domHash['scanamout'].innerHTML = 0 + '';
                    //         this.domHash['count'].innerHTML = 0 + '';
                    //         alert(res.msg);
                    //     }
                    // })
                }
            }]
        });
    }

    deleteData() {
        let body = <div data-code="deleteModal"/>;
        let select = new SelectInputMb({
            container: body,
            data: []
        });
        this.modalInit('deleteData', '请选择删除数据范围', <div className="rfid-barCode-set"/>, () => {
            select.get();
        });
    }

    setting() {
        let body = <div className="barcode-setting"/>,
            operation = this.btn.operation,
            data = operation && operation.content || [{text: "逐一", value: "1"}, {text: "替换", value: "2"}, {text: "累加", value: "3"}];
        let selectBox = new SelectBox({
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
            this.option = Number(selectBox.getSelect()[0].value);
            this.btnModule.invesetCount(this.option);
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

    modalInit(name: string, title: string, body: HTMLElement, onOk: () => void, footer = {}) {
      new Modal({
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
            onClose: this.destroy
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
    }

}