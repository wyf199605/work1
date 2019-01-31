/// <amd-module name="RfidBarCode"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Toggle} from "../../../../global/components/form/toggle/toggle";
import d = G.d;
import tools = G.tools;
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {SelectInput} from "../../../../global/components/form/selectInput/selectInput";
import {SelectInputMb} from "../../../../global/components/form/selectInput/selectInput.mb";
import {Loading} from "../../../../global/components/ui/loading/loading";
import {UploadImages} from "../../../module/uploadModule/uploadImages";
import {BwLayoutImg} from "../../../module/uploadModule/bwLayoutImg";
import sys = BW.sys;
import {ManagerImages} from "../../../module/uploadModule/ManagerImages";


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
    picFields?:string
    picAddr?:string

}

interface registParams {
    optionStype: number,
    num: number,
    nameId: string
    Where?: obj
    codeName?: string
}

interface Ifiedls {
    index: number,
    title: string,
    name: string
}
interface IparaCode {
    value:string //扫到的数据
    uniqueFlag?:string //主键
    where?:any //条件
    option?:number //状态
    num?:number //替换的数据
}


export class RfidBarCode extends Component {
    private stepByone: string = "1";
    private accumulation: string = "1";
    private mode: object = {"00": "替换", "01": "累加", "10": "逐一", "11": "(查询状态)"};
    private domHash: object = {};
    private params: registParams;
    //private regist;
    private fields: Ifiedls[];
    private photoImg: ManagerImages;
    private amountType : boolean = false;

    constructor(para: IRfidBarCode) {
        super(para);
        let key = this.stepByone + this.accumulation;
        if (key && this.mode[key]) {
            d.query(".shelf-nums>.shelf-mode").innerText = this.mode[key];
        }
        let body = <div></div>;
        let barcode = new Modal({
            className: 'rfid-bar-code',
            body: body,
            header: "条码扫码",
            position: sys.isMb ? 'full' : '',
            onClose: () => {
                console.log('关闭成功')
                barcode.destroy();
                this.operateTbaleD = {
                    value:''
                }
            }
        });


        this.container = body;
        this.InitRfidBarCode(para);
        this.downData(para);


    }

    protected wrapperInit(para: IRfidBarCode): HTMLElement {
        return <div class="rfidBarCode-page">
            <div class="rfid-barCode-body">
                <div class="rfid-barCode-title">
                    <span class="barCode-title"> </span>
                    <span class="barCode-title1"></span>
                </div>
                <div class="rfid-barCode-inventory">

                </div>
                <div className="rfid-shelf-number"><span
                    className="shelf-category"></span><span className="shelf-number"></span>
                </div>
                <div class="rfid-barCode-content">
                    <div class="rfid-barCode-left">
                        <span class="title2"> </span>
                        <span class="value2" style="color:rgb(0, 122, 255)"></span><br/>
                        <span className="title3"></span>
                        <span class="value3" style="color:rgb(0, 122, 255)"></span><br/>
                        <span className="title4"></span>
                        <span className="value4" style="color:rgb(0, 122, 255)"></span>
                    </div>
                    <div class="rfid-barCode-right">
                        <span class="title"></span>
                        <span class="value" style="color:red"></span>
                    </div>
                </div>
                <div class="rifd-bar-code-describe"></div>
                <div class="rfid-barCode-nums">
                    <div class="shelf-nums">
                        <span class="shelf-name"></span>(<span class="shelf-mode"></span>)<input type="number"/>
                    </div>
                    <div className="rfid-barCode-set" style=" display: none;">
                        <div className="set-row">
                            <div>逐一扫描</div>
                            <Toggle size={20} checked={true} custom={{check: "ON", noCheck: "OFF"}}
                                    onClick={(isChecked) => {
                                        isChecked ? this.stepByone = "1" : this.stepByone = "0";
                                        let key = this.stepByone + this.accumulation;
                                        if (key && this.mode[key]) {
                                            d.query(".shelf-nums>.shelf-mode").innerText = this.mode[key];
                                        }
                                        if (isChecked) {
                                            d.query('.shelf-nums>input')['disabled'] = true;
                                        } else {
                                            d.query('.shelf-nums>input')['disabled'] = false;
                                        }
                                        // 切换注入监听事件


                                        if (this.mode[key] == '逐一') {
                                            //造数据
                                            this.operateTbaleD.option = 1;

                                        } else if (this.mode[key] == '替换') {
                                            //造数据
                                            let num = d.query('.total-nums>span').innerText;
                                            if(isNaN(parseInt(num))){
                                                this.operateTbaleD.num = 0;
                                            }else {
                                                this.operateTbaleD.num = parseInt(num);
                                            }
                                            this.operateTbaleD.option = 2;
                                        } else if (this.mode[key] == '累加') {
                                            let num = d.query('.total-nums>span').innerText;
                                            if(isNaN(parseInt(num))){
                                                this.operateTbaleD.num = 0;
                                            }else {
                                                this.operateTbaleD.num = parseInt(num);
                                            }

                                            //造数据
                                            this.operateTbaleD.option = 3;
                                        } else {
                                            //造数据
                                            this.operateTbaleD.option = 0;
                                        }


                                    }}></Toggle>
                        </div>
                        <div className="set-row">
                            <div>累加</div>
                            <Toggle size={20} checked={true} custom={{check: "ON", noCheck: "OFF"}}
                                    onClick={(isChecked) => {
                                        isChecked ? this.accumulation = "1" : this.accumulation = "0";
                                        let key = this.stepByone + this.accumulation;
                                        if (key && this.mode[key]) {
                                            d.query(".shelf-nums>.shelf-mode").innerHTML = this.mode[key];
                                        }
                                        // 切换注入监听事件



                                        if (this.mode[key] == '累加') {
                                            this.operateTbaleD.option = 3;
                                            //重新获取输入框数据
                                            let num = d.query('.total-nums>span').innerText;
                                            if(isNaN(parseInt(num))){
                                                this.operateTbaleD.num = 0;
                                            }else {
                                                this.operateTbaleD.num = parseInt(num);
                                            }
                                            //造数据
                                        } else if (this.mode[key] == '替换') {
                                            //造数据
                                            let num = d.query('.total-nums>span').innerText;
                                            if(isNaN(parseInt(num))){
                                                this.operateTbaleD.num = 0;
                                            }else {
                                                this.operateTbaleD.num = parseInt(num);
                                            }
                                            this.operateTbaleD.option = 2;
                                            //重新获取输入框


                                        } else if (this.mode[key] == '逐一') {
                                            //造数据
                                            this.operateTbaleD.option = 1;
                                        } else {
                                            //造数据
                                            this.operateTbaleD.option = 0;

                                        }


                                    }}></Toggle>
                        </div>
                    </div>
                    <div class="total-nums">
                        <i class="iconfont icon-zonghesum1"></i><span class="total-name"></span>:<span class="total-color" style="color:#007aff">0</span>
                    </div>
                </div>
                <div class="total-rfid">
                    <p class="bar-code-scan">共扫描<span>0</span>项</p>
                    <p class="bar-code-amount">总数量为<span>0</span></p>
                </div>
            </div>
            <div class="rfid-barCode-footer">
                <div class="rfid-button">
                    <button onclick={() => {
                        let optionStype = 0;
                        let mode = new Modal({
                            isMb: false,
                            position: "center",
                            header: '请输入条码',
                            zIndex:1022,
                            isOnceDestroy: true,
                            isBackground: true,
                            body: d.create(`<div data-code="barcodeModal">
                                        <form class="barcode-form">
                                            <label>条码:</label>
                                            <input type="text" class="set-rfid-code" style="height: 30px">
                                        </form>
                                    </div>`),
                            footer: {},
                            onOk: () => {
                                let val = d.query('.barcode-form > input');
                                this.operateTbaleD.value = val['value'];
                                // alert(JSON.stringify(this.operateTbaleD) + '输入')
                                this.rigisterTable(this.operateTbaleD)

                                mode.destroy();
                            },
                            onClose: () => {
                                //Modal.toast('输入成功');
                            }

                        })

                    }}>输入条码
                    </button>

                    { (!this.amountType) ? (<button class="button-set" onclick={() => {
                        let optionStype = 0;
                        let step = true;
                        let step1 = true;
                        console.log(this.stepByone);
                        if(this.stepByone == '0'){
                            step = false;
                        }else {
                            step = true;
                        }
                        if(this.accumulation == '0'){
                            step1 = false;
                        }else {
                            step1 = true;
                        }

                        console.log(this.accumulation);
                        let mode = new Modal({
                            isMb: false,
                            position: "center",
                            header: '请输入设置',
                            zIndex: 1022,
                            isOnceDestroy: true,
                            isBackground: true,
                            body:  <div className="rfid-barCode-set">
                        <div className="set-row">
                            <div>逐一扫描</div>
                            <Toggle size={20} checked={step} custom={{check: "ON", noCheck: "OFF"}}
                                    onClick={(isChecked) => {
                                        isChecked ? this.stepByone = "1" : this.stepByone = "0";
                                        let key = this.stepByone + this.accumulation;
                                        if (key && this.mode[key]) {
                                            d.query(".shelf-nums>.shelf-mode").innerText = this.mode[key];
                                        }
                                        if (isChecked) {
                                            d.query('.shelf-nums>input')['disabled'] = true;
                                        } else {
                                            d.query('.shelf-nums>input')['disabled'] = false;
                                        }
                                        // 切换注入监听事件


                                        if (this.mode[key] == '逐一') {
                                            //造数据
                                            this.operateTbaleD.option = 1;

                                        } else if (this.mode[key] == '替换') {
                                            //造数据
                                            let num = d.query('.total-nums>span').innerText;
                                            if(isNaN(parseInt(num))){
                                                this.operateTbaleD.num = 0;
                                            }else {
                                                this.operateTbaleD.num = parseInt(num);
                                            }
                                            this.operateTbaleD.option = 2;
                                        } else if (this.mode[key] == '累加') {
                                            let num = d.query('.total-nums>span').innerText;
                                            if(isNaN(parseInt(num))){
                                                this.operateTbaleD.num = 0;
                                            }else {
                                                this.operateTbaleD.num = parseInt(num);
                                            }

                                            //造数据
                                            this.operateTbaleD.option = 3;
                                        } else {
                                            //造数据
                                            this.operateTbaleD.option = 0;
                                        }


                                    }}></Toggle>
                        </div>
                        <div className="set-row">
                            <div>累加</div>
                            <Toggle size={20} checked={step1} custom={{check: "ON", noCheck: "OFF"}}
                                    onClick={(isChecked) => {
                                        isChecked ? this.accumulation = "1" : this.accumulation = "0";
                                        let key = this.stepByone + this.accumulation;
                                        if (key && this.mode[key]) {
                                            d.query(".shelf-nums>.shelf-mode").innerHTML = this.mode[key];
                                        }
                                        // 切换注入监听事件



                                        if (this.mode[key] == '累加') {
                                            this.operateTbaleD.option = 3;
                                            //重新获取输入框数据
                                            let num = d.query('.total-nums>span').innerText;
                                            if(isNaN(parseInt(num))){
                                                this.operateTbaleD.num = 0;
                                            }else {
                                                this.operateTbaleD.num = parseInt(num);
                                            }
                                            //造数据
                                        } else if (this.mode[key] == '替换') {
                                            //造数据
                                            let num = d.query('.total-nums>span').innerText;
                                            if(isNaN(parseInt(num))){
                                                this.operateTbaleD.num = 0;
                                            }else {
                                                this.operateTbaleD.num = parseInt(num);
                                            }
                                            this.operateTbaleD.option = 2;
                                            //重新获取输入框


                                        } else if (this.mode[key] == '逐一') {
                                            //造数据
                                            this.operateTbaleD.option = 1;
                                        } else {
                                            //造数据
                                            this.operateTbaleD.option = 0;

                                        }


                                    }}></Toggle>
                        </div>
                    </div>,
                            footer: {},
                            onOk: () => {

                                mode.destroy();
                            },
                            onClose: () => {
                                //Modal.toast('输入成功');
                            }

                        })

                    }}>设置
                    </button>): ''}
                    <button onclick={
                        () => {
                            console.log(para.codeStype)
                            let str = [],typeName = '';
                            if(tools.isNotEmpty(para.codeStype)){
                                for (let i = 0, data = para.codeStype; i < data.length; i++) {
                                    let obj = {};
                                    for (let s in data[i]) {
                                        typeName = s;
                                        obj['value'] = data[i][s];
                                        obj['text'] = data[i][s];
                                    }
                                    str.push(obj);
                                }
                            }
                            console.log(str);
                            let updataEl;
                            let div = <div>

                                {
                                    updataEl = <SelectInputMb data={str}/>
                                }

                            </div>

                            let mode = new Modal({
                                isMb: false,
                                position: "center",
                                header: '上传数据 ',
                                zIndex:1022,
                                isOnceDestroy: true,
                                isBackground: true,
                                body: <div data-code="updataModal">
                                    <p>设备存在数据,信息如下</p>
                                    <p>{this.domHash['title'].innerText} {this.domHash['title1'].innerText}</p>
                                    <p>{this.domHash['inventory'].innerHTML}</p>
                                    <p>操作者信息:{para.USERID + "店" + para.SHO_ID}</p>
                                    <p>{'共扫描' + this.domHash['scanamout'].innerText + '项'}，{'总数量为' + this.domHash['count'].innerText}</p>
                                    <p>上传数据处理方式:</p>
                                    {
                                        tools.isNotEmpty(para.codeStype) ? div : ''
                                    }
                                </div>,
                                footer: {
                                    rightPanel: [{
                                        content: "上传",
                                        onClick:  ()=> {
                                            let field = para.picFields,
                                                IMAOBJ = {};
                                            IMAOBJ[field] = this.photoImgData;
                                            let IMA = [];
                                            IMA.push(IMAOBJ);
                                            let s = new Loading({
                                                msg:'上传中'
                                            })
                                            s.show();
                                            let typeValue = {};
                                            typeValue[typeName] = updataEl.getText()? updataEl.getText() : null;
                                            console.log( updataEl.getText());
                                            let mes = G.Shell.inventory.uploadcodedata(para.uniqueFlag, para.picAddr,(tools.isNotEmpty(para.picFields)) ? IMA : '','atvarparams',JSON.stringify(typeValue),(res) => {
                                                d.query('.total-rfid>.bar-code-scan>span').innerText = 0 + '';
                                                this.stepArry = [];
                                                s.destroy();
                                                // alert('再次返回上传接口数据')
                                                if (!res.success) {
                                                    alert('上传失败');
                                                } else {
                                                    this.domHash['scanamout'].innerHTML = 0 + '';
                                                    this.domHash['count'].innerHTML = 0 + '';
                                                    alert(res.msg);
                                                }
                                            })
                                            mode.destroy();
                                        }
                                    }]
                                },
                                onOk: () => {

                                    console.log("打印了")
                                    mode.destroy();
                                },
                                onClose: () => {
                                    mode.destroy();
                                }

                            })
                        }
                    }>上传数据
                    </button>
                    <button onclick={() => {

                        let deleteEL, uid, category;
                        uid = this.keyField;
                        this.fields && this.fields.forEach((res) => {
                            if (res.index == 1) {
                                category = res.name;
                            }
                        })
                        let modeldata = [{
                            value: '所有',
                            text: "所有"
                        }, {
                            value: this.domHash['category1'].innerText + this.domHash['categoryVal1'].innerText,
                            text: this.domHash['category1'].innerText + this.domHash['categoryVal1'].innerText
                        }, {
                            value: '当前所有分类下:' + "条码:" + this.domHash['barcode'].innerText,
                            text: '当前所有分类下:' + "条码:" + this.domHash['barcode'].innerText
                        }, {
                            value: '条码' + this.domHash['barcode'].innerText,
                            text: '条码' + this.domHash['barcode'].innerText
                        }], modeldata1 = [
                            {
                                value: '条码' + this.domHash['barcode'].innerText,
                                text: '条码' + this.domHash['barcode'].innerText
                            }]
                        let tempCateGory = this.domHash['categoryVal1'].innerHTML;
                        let stepStatus = this.stepStatus;
                        if (tools.isEmpty(tempCateGory)) {
                            stepStatus = true;
                        }else {
                            stepStatus = false;
                        }
                        let deModel = new Modal({
                            isMb: false,
                            position: "center",
                            zIndex:1022,
                            header: '请选择删除数据范围 ',
                            isOnceDestroy: true,
                            isBackground: true,
                            body: <div data-code="deleteModal">

                                <div>
                                    {
                                        deleteEL = <SelectInputMb data={stepStatus ? modeldata1 : modeldata}/>
                                    }
                                </div>
                            </div>,
                            footer: {
                                rightPanel: [{
                                    content: "确认删除",
                                    onClick: () => {

                                        let value = deleteEL.get(),
                                            where = {};
                                        console.log(value);
                                        switch (value) {
                                            case "所有":
                                                where[uid] = '';
                                                where[this.DataclassInfo[0]] = '';
                                                break;
                                            case this.domHash['category1'].innerText + this.domHash['categoryVal1'].innerText:
                                                where[uid] = '';
                                                where[this.DataclassInfo[0]] = this.domHash['categoryVal1'].innerHTML;
                                                break;
                                            case '当前所有分类下:' + "条码:" + this.domHash['barcode'].innerText:
                                                where[uid] = this.domHash['barcode'].innerText;
                                                this.DataclassInfo[0] && (where[this.DataclassInfo[0]] = this.domHash['categoryVal1'].innerText);
                                                this.DataclassInfo[1] && ( where[this.DataclassInfo[1]] = this.domHash['categoryVal2'].innerText);
                                                break;
                                            case '条码' + this.domHash['barcode'].innerText:
                                                where[uid] = this.domHash['barcode'].innerText;
                                                where[this.DataclassInfo[0]] = '';
                                                break;
                                        }
                                        let success = false;
                                        let del = G.Shell.inventory.delInventoryData(para.uniqueFlag, where, (res) => {
                                            if (res.success) {
                                                this.domHash['scanamout'].innerHTML = 0 + '';
                                                this.domHash['count'].innerHTML = 0 + '';

                                                this.stepArry = [];
                                                alert('删除成功');
                                            } else {
                                                alert('删除失败');
                                            }

                                        })
                                        //进行重新渲染

                                        deModel.destroy();
                                    }
                                }]
                            },
                            onOk: () => {

                                console.log("打印了")
                                deModel.destroy();
                            },
                            onClose: () => {

                                deModel.destroy();
                            }

                        })

                    }
                    }>删除数据
                    </button>
                    {
                        ( tools.isNotEmpty(para.picFields) ) ? (<button onclick={() => {
                            if (tools.isEmpty(para.picFields)) {
                                alert('不支持拍照功能')
                            } else {
                                this.photoImg.click();
                            }
                        }
                        }>拍照
                        </button>): ''
                    }
                    <button onclick={tools.pattern.debounce(() => {
                        G.Shell.inventory.openScanCode(0, (res) => {
                            // alert(JSON.stringify(res));
                        })
                    }, 50)
                    }>单扫
                    </button>
                    <button onclick={tools.pattern.debounce(() => {
                        G.Shell.inventory.openScanCode(1, (res) => {
                            // alert(JSON.stringify(res));
                        })
                    }, 50)
                    }>连扫
                    </button>
                </div>

            </div>

        </div>
    }

    private stepStatus: boolean = false;
    private replaceVal: number;
    private photoImgData:obj = [];
    private  operateTbaleD :IparaCode = {
        value:'',
    }
    private randNum(){
        let d2 = new Date().getTime()+ '',
            d1 = (Math.random()* 10),
            rand = d2 + d1 + '.jpg';
        return rand;
    }


    private InitRfidBarCode(para) {
        //拍照上传的数据
        // this.photoImg = new BwLayoutImg({
        //     isShow: false,
        //     autoClear:false,
        //     autoUpload:false,
        //     isCloseMsg:true,
        //     onFinish: () => {
        //         return new Promise((resolve)=>{
        //             this.photoImgData = [];
        //             let ss = this.photoImg.getBase64().then((data)=>{
        //                 for(let i = 0 ,len = data.length;i<len; i++){
        //                     let obj = {};
        //                     obj['file_name'] = this.randNum();
        //                     obj['file_data'] = data[i].replace(/data:.+?,/, '')
        //                     this.photoImgData.push(obj);
        //                 }
        //             })
        //             resolve();
        //         })
        //     },
        //     buttons:[{
        //         content:'图片管理',
        //         onClick:() =>{
        //             this.photoImg.modalShow = true;
        //         }
        //     }]
        // })
        this.photoImg = new ManagerImages({
            imagesContainer: d.query('.rfidBarCode-page>.rfid-barCode-body', this.container),
            autoUpload:false,
            onFinish: () => {
                this.photoImgData = [];
                let ss = this.photoImg.getBase64().then((data) => {
                    for (let i = 0, len = data.length; i < len; i++) {
                        let obj = {};
                        obj['file_name'] = this.randNum();
                        obj['file_data'] = data[i].replace(/data:.+?,/, '');
                        this.photoImgData.push(obj);
                    }
                })
            }
        });
        let key = this.stepByone + this.accumulation;
        if (this.mode[key] == '(查询状态)') {
            d.query('.shelf-nums>input')['disabled'] = true;
        }

        //初始化监听输入框的值
        let modeVal = d.query('.shelf-nums>input')
        console.log(modeVal);
        modeVal.onblur = () => {
            console.log('开始改变')
            let num = d.query('.total-nums>.total-color')
            let key = this.stepByone + this.accumulation;
            console.log(modeVal['value']);
            if (this.mode[key] == "累加" && modeVal['value'] !== "") {
                //num.innerText = parseInt(num.innerText) + parseInt(modeVal['value']) + ""
                //添加新的传值接口
                num.innerText = parseInt(modeVal['value']) + "";

                if(isNaN(parseInt(num.innerText))){
                    this.operateTbaleD.num = 0;
                }else {
                    this.operateTbaleD.num = parseInt(num.innerText);
                }



            } else if (this.mode[key] == "替换" && modeVal['value'] !== "") {
                num.innerText = parseInt(modeVal['value']) + "";
                //添加新的传值接口
                if(isNaN(parseInt(num.innerText))){
                    this.operateTbaleD.num = 0;
                }else {
                    this.operateTbaleD.num = parseInt(num.innerText);
                }
                // Modal.alert(G.Shell.inventory.dealbarcode)

            }
        }
        let category = d.query('.rfid-shelf-number>.shelf-category'),
            barcode = d.query('.rfid-barCode-content>.rfid-barCode-right>.value'),
            barcodeTitl = d.query('.rfid-barCode-content>.rfid-barCode-right>.title'),
            categoryVal = d.query('.rfid-shelf-number>.shelf-number'),
            category1 = d.query('.rfid-barCode-content>.rfid-barCode-left>.title2'),
            category2 = d.query('.rfid-barCode-content>.rfid-barCode-left>.title3'),
            category3 = d.query('.rfid-barCode-content>.rfid-barCode-left>.title4'),
            categoryVal1 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value2'),
            categoryVal2 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value3'),
            categoryVal3 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value4'),
            Commodity = d.query('.rifd-bar-code-describe'),
            num = d.query('.shelf-nums>.total-color'),
            totalName = d.query('.total-nums>.total-name'),
            scanamout = d.query('.total-rfid >.bar-code-scan>span'),
            count = d.query('.total-rfid>.bar-code-amount>span'),
            title = d.query('.rfid-barCode-title>.barCode-title'),
            title1 = d.query('.rfid-barCode-title>.barCode-title1'),
            inventory = d.query('.rfid-barCode-body>.rfid-barCode-inventory'),
            shelfName = d.query('.rfid-barCode-nums>.shelf-nums>.shelf-name')

        this.domHash['category'] = category;
        this.domHash['barcode'] = barcode;
        this.domHash['categoryVal'] = categoryVal;
        this.domHash['category1'] = category1;
        this.domHash['category2'] = category2;
        this.domHash['category3'] = category3;
        this.domHash['categoryVal1'] = categoryVal1;
        this.domHash['categoryVal2'] = categoryVal2;
        this.domHash['categoryVal3'] = categoryVal3;
        this.domHash['barcodeTitl'] = barcodeTitl;
        this.domHash['Commodity'] = Commodity;
        this.domHash['num'] = num;
        this.domHash['scanamout'] = scanamout;
        this.domHash['count'] = count;
        this.domHash['title'] = title;
        this.domHash['title1'] = title1;
        this.domHash['inventory'] = inventory;
        this.domHash['shelfName'] = shelfName;
        this.domHash['totalName'] = totalName;


    }

    private uid: string;
    private stepArry = [];
    private dataWhere = {};
    private DataclassInfo = [];
    private DataclassInfoCp = [];
    private DataCI = [];
    private nameField = '';
    private  keyField = '';

    private downData(para) {
        let loading = new Loading({
            msg: "加载中"
        })
        let where = {};
        this.params = {
            optionStype: 0,
            num: 0,
            nameId: para.uniqueFlag,
        }
        console.log(para.uniqueFlag);
        //需要加个加载中
        let s = G.Shell.inventory.downloadbarcode(para.uniqueFlag, BW.CONF.siteUrl + para.downUrl, BW.CONF.siteUrl + para.uploadUrl,false, (res) => {
            alert(res.msg);
            if(res.success){
                loading.destroy();
                let data = G.Shell.inventory.getTableInfo(para.uniqueFlag)
                let pageName = data.data;
                this.domHash['inventory'].innerHTML = pageName.subTitle;
                this.domHash['title'].innerText = pageName.title;
                this.domHash['barcodeTitl'].innerHTML = pageName.keyName ? pageName.keyName  : '';
                this.nameField = pageName.nameField;
                this.keyField = pageName.keyField;
                this.domHash['shelfName'].innerHTML = pageName.amountName ? pageName.amountName  : '';
                this.domHash['totalName'].innerHTML = pageName.amountName ? pageName.amountName  : '';
                //有可能没有分类  有可能有分类
                // if(pageName.classInfo){
                //     this.DataclassInfo = pageName.classInfo;
                //     this.dataWhere = pageName.classInfoObj;
                // }
                if(tools.isNotEmpty(pageName.classInfo)){
                    this.DataclassInfo = pageName.classInfo;
                    this.DataclassInfoCp = pageName.classInfoObj;
                    for(let i = 0;i< pageName.classInfoObj.length;i++){
                        let obj = pageName.classInfoObj;
                        for(let s in obj[i]){
                            this.dataWhere[s] = '';
                        }
                    }
                    // alert(JSON.stringify(this.dataWhere) + 'cccccc')

                    this.domHash['category1'].innerHTML =  pageName.classInfoObj[0][pageName.classInfo[0]] + ':';

                    if ( pageName.classInfo[1] && pageName.classInfoObj[1]){
                        this.domHash['category2'].innerHTML = pageName.classInfoObj[1][pageName.classInfo[1]] + ':';
                    }

                    if (pageName.classInfo[2] &&  pageName.classInfoObj[2]){
                        this.domHash['category3'].innerHTML = pageName.classInfoObj[2][pageName.classInfo[2]] + ':';
                    }
                }
                if(pageName.amount == 'SCANNUM'){
                    this.amountType = true;
                    this.stepStatus = false;
                    d.query('.rfidBarCode-page>.rfid-barCode-body>.rfid-barCode-nums').style.display = 'none';
                    d.query('.rfid-barCode-footer>.rfid-button>.button-set').style.display = 'none';
                }


                //只需要注册一个监听事件
                this.rigisterRifd();
                //判断状态
                //造数据条件
                this.operateTbaleD.value = '';
                this.operateTbaleD.uniqueFlag = para.uniqueFlag;
                this.operateTbaleD.num = 0;
                if(pageName.classInfo){
                    //还原键值对得形式
                    this.operateTbaleD.where = this.dataWhere;
                }else {
                    this.operateTbaleD.where = '';
                }

                this.operateTbaleD.option = 0;
                // alert('kvvvvvk')
                // alert(JSON.stringify(this.operateTbaleD) + 's')
            }
            else {
                //发现有未上传数据
                let mode1 = new Modal({
                    isMb: false,
                    position: "center",
                    header: '提示',
                    zIndex:1022,
                    isOnceDestroy: true,
                    isBackground: true,
                    body:<div><h5>有未上传数据，是否继续</h5></div>,
                    footer: {},
                    onOk: () => {
                       this.getHeadTable(para);
                       let ScanData =  G.Shell.inventory.getScanData(para.uniqueFlag);
                        if(ScanData.success){
                            loading.destroy();
                           let res = ScanData.data.data;
                           //重新定义数据
                            //存储obj数据结构 跟 res数据比对 拼接 以及重新刷新条件传值参数


                            if(res){

                                let str = '';
                                for(let val in this.DataclassInfoCp[0]) {
                                    for(let obj in res[0]){
                                        // alert(obj + 'ppp');
                                        if (obj == val) {
                                            str += res[0][val];
                                            // alert(data[i][val] + 'oo')
                                        }
                                    }
                                    // alert(str + '字符串')
                                    this.domHash['categoryVal1'].innerHTML = str;
                                }
                                let strs = '';

                                for(let val in  this.DataclassInfoCp[1]){
                                    for(let obj in res[0]){
                                        if(obj == val){
                                            strs += res[0][val];
                                        }
                                    }
                                    this.domHash['categoryVal2'].innerHTML = strs;
                                }
                                let strss = '';

                                for(let val in  this.DataclassInfoCp[2]){
                                    for(let obj in res[0]){
                                        if(obj == val){
                                            strss += res[0][val];
                                        }
                                    }
                                    this.domHash['categoryVal3'].innerHTML = strss;
                                }

                            }
                            //更新数据条件
                            this.domHash['barcode'].innerHTML =  res[0][this.keyField];
                            this.domHash['Commodity'].innerHTML = res[0][this.nameField];
                            this.domHash['count'].innerHTML = res[0]['AMOUNT'] ? res[0]['AMOUNT']: 0 + '';

                        }

                        //
                        mode1.destroy();
                    },
                    onClose: () => {
                        G.Shell.inventory.downloadbarcode(para.uniqueFlag, BW.CONF.siteUrl + para.downUrl, BW.CONF.siteUrl + para.uploadUrl,true, (res=>{
                            alert(res.msg)
                            if(res.success){
                                loading.destroy();
                                this.getHeadTable(para);
                            }
                        }))
                        //Modal.toast('输入成功');

                    }

                })
            }

        })

    }

    //注册监听事件操作

    private rigisterTable(data:IparaCode){
        G.Shell.inventory.codedataOperate(data.value,data.uniqueFlag,data.where,data.option,data.num,(res)=>{
            // alert(JSON.stringify(res))
            let data = res.data.data;
            // alert(JSON.stringify(data))
            if(res.success){
                let modeVal = d.query('.shelf-nums>input');
                modeVal['value'] = '';
                //判断是否是替换 如果是替换value值不变 如果是其他的状态需要清空为0
                let key = this.stepByone + this.accumulation;

                if ( this.mode[key] !== "替换") {
                    this.operateTbaleD.num = 0;
                }
                for(let i = 0; i< data.length; i++){
                    //stepArry 添加数组项
                    if(data[i]['BARCODE'] && this.stepArry.indexOf(data[i]['BARCODE']) == -1){
                        this.stepArry.push(data[i]['BARCODE'])
                    }
                    if(tools.isNotEmpty(this.DataclassInfo[0])){
                        //this.domHash['categoryVal1'].innerHTML = data[i][this.DataclassInfo[0]];
                        this.dataWhere[this.DataclassInfo[0]] = data[i][this.DataclassInfo[0]];
                    }
                    //更新数据条件e
                    if(i == 0){
                        // alert(JSON.stringify(this.DataclassInfoCp) + 'OUI ')
                        if(this.DataclassInfo[1]){
                            //this.domHash['categoryVal2'].innerHTML = data[i][this.DataclassInfo[1]];
                            this.dataWhere[this.DataclassInfo[1]] = data[i][this.DataclassInfo[1]];
                        }
                        if(this.DataclassInfo[2]){
                            //this.domHash['categoryVal2'].innerHTML = data[i][this.DataclassInfo[1]];
                            this.dataWhere[this.DataclassInfo[2]] = data[i][this.DataclassInfo[2]];
                        }
                        if(!data[i]['BARCODE']){
                            let str = '';
                            for(let val in this.DataclassInfoCp[0]) {
                                for(let obj in data[i]){
                                    if (obj == val) {
                                        str += data[i][val];
                                    }
                                }
                                this.domHash['categoryVal1'].innerHTML = str;
                            }
                            let strs = '';
                            for(let val in  this.DataclassInfoCp[1]){
                                for(let obj in data[i]){
                                    if(obj == val){
                                        strs += data[i][val];
                                    }
                                }
                                this.domHash['categoryVal2'].innerHTML = strs;
                            }
                            let strss = '';

                            for(let val in  this.DataclassInfoCp[2]){
                                for(let obj in data[i]){
                                    if(obj == val){
                                        strss += data[i][val];
                                    }
                                }
                                this.domHash['categoryVal3'].innerHTML = strss;
                            }

                        }

                        if(data[i][this.nameField]){
                            this.domHash['barcode'].innerText = data[i][this.keyField];

                            this.domHash['Commodity'].innerHTML = data[i][this.nameField];
                            if(data[i]['AMOUNT'] ){
                               // this.operateTbaleD.num = parseInt(data[i]['AMOUNT']);
                                this.domHash['count'].innerHTML = data[i]['AMOUNT'];
                            }else if(data[i]['SCANNUM']){
                                //this.operateTbaleD.num = parseInt(data[i]['SCANNUM']);
                                this.domHash['count'].innerHTML = data[i]['SCANNUM'];
                            }

                        }
                    }
                }
                this.countScanNum();
                this.operateTbaleD.where = tools.isNotEmpty(this.dataWhere) ? this.dataWhere: '';
            }else {
                alert('查询失败');
            }


        })
    }

   private getHeadTable(para){
       let data = G.Shell.inventory.getTableInfo(para.uniqueFlag)
       let pageName = data.data;
       this.domHash['inventory'].innerHTML = pageName.subTitle;
       this.domHash['title'].innerText = pageName.title;
       this.domHash['barcodeTitl'].innerHTML = pageName.keyName ? pageName.keyName  : '';
       this.nameField = pageName.nameField;
       this.keyField = pageName.keyField;
       this.domHash['shelfName'].innerHTML = pageName.amountName ? pageName.amountName  : '';
       this.domHash['totalName'].innerHTML = pageName.amountName ? pageName.amountName  : '';
       //有可能没有分类  有可能有分类
       // if(pageName.classInfo){
       //     this.DataclassInfo = pageName.classInfo;
       //     this.dataWhere = pageName.classInfoObj;
       // }
       if(tools.isNotEmpty(pageName.classInfo)){
           this.DataclassInfo = pageName.classInfo;
           this.DataclassInfoCp = pageName.classInfoObj;
           for(let i = 0;i< pageName.classInfoObj.length;i++){
               let obj = pageName.classInfoObj;
               for(let s in obj[i]){
                   this.dataWhere[s] = '';
               }
           }
           // alert(JSON.stringify(this.dataWhere) + 'cccccc')

           this.domHash['category1'].innerHTML =  pageName.classInfoObj[0][pageName.classInfo[0]] + ':';

           if ( pageName.classInfo[1] && pageName.classInfoObj[1]){
               this.domHash['category2'].innerHTML = pageName.classInfoObj[1][pageName.classInfo[1]] + ':';
           }

           if (pageName.classInfo[2] &&  pageName.classInfoObj[2]){
               this.domHash['category3'].innerHTML = pageName.classInfoObj[2][pageName.classInfo[2]] + ':';
           }
       }
       if(pageName.amount == 'SCANNUM'){
           this.amountType = true;
           this.stepStatus = false;
           d.query('.rfidBarCode-page>.rfid-barCode-body>.rfid-barCode-nums').style.display = 'none';
       }


       //只需要注册一个监听事件
       this.rigisterRifd();
       //判断状态
       //造数据条件
       this.operateTbaleD.value = '';
       this.operateTbaleD.uniqueFlag = para.uniqueFlag;
       this.operateTbaleD.num = 0;
       if(pageName.classInfo){
           //还原键值对得形式
           this.operateTbaleD.where = this.dataWhere;
       }else {
           this.operateTbaleD.where = '';
       }

       this.operateTbaleD.option = 0;
   }

    private rigisterRifd(){
        G.Shell.inventory.openRegistInventory(0,{},(res)=>{
            this.operateTbaleD.value = res.data;
            //实时更新方法

            this.rigisterTable(this.operateTbaleD);

        })
    }
    //统计扫描项方法
    private countScanNum(){
        let num = this.stepArry.length;
        this.domHash['scanamout'].innerHTML = num + '';
    }

    private refreshCount(para){
        let where={};
        if (G.tools.isNotEmpty(this.fields)) {

            for (let i = 0; i < this.fields.length; i++) {
                if (i == 0) {
                    where[this.fields[i].name] = this.domHash['categoryVal'].innerText;
                } else if (i == 1) {
                    where[this.fields[i].name] = this.domHash['categoryVal1'].innerText;
                } else if (i == 2) {
                    where[this.fields[i].name] = this.domHash['categoryVal2'].innerText;
                }
            }
            where[this.uid] = this.domHash['barcode'].innerText;
        }
        if(!this.stepStatus){
            G.Shell.inventory.getCountData(para.uniqueFlag,where,(res)=>{
                // alert(JSON.stringify(res))
                if(res.success){
                    this.domHash['count'].innerText = res.data;
                    let num = d.query('.total-nums>span');
                    num.innerText = res.data;
                    this.domHash['scanamout'].innerText = res.data;
                    // let modeVal = d.query('.shelf-nums>input');
                    // modeVal['value'] = '';

                }
            })
        }

    }
}

