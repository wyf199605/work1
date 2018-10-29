/// <amd-module name="RfidBarCode"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Toggle} from "../../../../global/components/form/toggle/toggle";
import d = G.d;
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {SelectInput} from "../../../../global/components/form/selectInput/selectInput";
import {SelectInputMb} from "../../../../global/components/form/selectInput/selectInput.mb";
import {Loading} from "../../../../global/components/ui/loading/loading";


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


export class RfidBarCode extends Component {
    private stepByone: string = "1";
    private accumulation: string = "1";
    private mode: object = {"00": "替换", "01": "累加", "10": "逐一", "11": "(可查询状态)"};
    private domHash: object = {

    };
    private params: registParams;
    //private regist;
    private fields: Ifiedls[];


    constructor(para: IRfidBarCode) {
        super(para);
        let key = this.stepByone + this.accumulation;
        if (key && this.mode[key]) {
            d.query(".shelf-nums>.shelf-mode").innerText = this.mode[key];
        }
        let body = <div></div>;
        let barcode =  new Modal({
            className: 'rfid-bar-code',
            zIndex: 1000,
            body: body,
            header: "条码扫码",
            onClose:()=>{
                console.log('关闭成功')
                barcode.destroy();
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
                    <span class="barCode-title">盘点单 </span>
                    <span class="barCode-title1">饰品</span>
                </div>
                <div class="rfid-barCode-inventory">
                    511X16020400000
                </div>
                <div className="rfid-shelf-number"><span
                    className="shelf-category">货架号:</span><span className="shelf-number">1002004</span>
                    <i className="iconfont icon-shuxie" onclick={() => {

                        let mode = new Modal({
                            isMb: false,
                            position: "center",
                            header: this.domHash['category'],
                            isOnceDestroy: true,
                            isBackground: true,
                            body: d.create(`<div data-code="barcodeModal">
                                        <form>
                                            <label>请输入:</label>
                                            <input type="text" class="set-rfid-shelf" style="height: 30px">
                                        </form>
                                    </div>`),
                            footer: {},
                            onOk: () => {
                                let val = d.query('.set-rfid-shelf')['value'];
                                //console.log(d.query('.set-rfid-code').value);
                                d.query('.rfid-shelf-number>.shelf-number').innerText = val;
                                console.log("打印了")

                                mode.destroy();
                            },
                            onClose: () => {
                                Modal.toast('输入成功');
                            }

                        })

                    }}></i>
                </div>
                <div class="rfid-barCode-content">
                    <div class="rfid-barCode-left">
                        <span class="title2">分类-标题2 </span><i className="iconfont icon-shuxie" onclick={
                        () => {
                            let s;

                            let mode = new Modal({
                                isMb: false,
                                position: "center",
                                header: this.domHash['category1'],
                                isOnceDestroy: true,
                                isBackground: true,
                                body: d.create(`<div data-code="barcodeModal">
                                        <form>
                                            <label>请输入:</label>
                                            <input type="text" class="set-rfid-shelf" style="height: 30px">
                                        </form>
                                    </div>`),
                                footer: {},
                                onOk: () => {
                                    let val = d.query('.set-rfid-shelf')['value'];
                                    //console.log(d.query('.set-rfid-code').value);
                                    this.domHash['categoryVal1'].innerText = val;
                                    console.log("打印了")

                                    mode.destroy();
                                },
                                onClose: () => {
                                    Modal.toast('输入成功');
                                }

                            })

                        }
                    }></i>
                        <p class="value2" style="color:rgb(0, 122, 255)">100000</p>
                        <span className="title3">分类-标题3 </span> <i className="iconfont icon-shuxie" onClick={() => {

                        let mode = new Modal({
                            isMb: false,
                            position: "center",
                            header: this.domHash['category2'],
                            isOnceDestroy: true,
                            isBackground: true,
                            body: d.create(`<div data-code="barcodeModal">
                                        <form>
                                            <label>请输入:</label>
                                            <input type="text" class="set-rfid-shelf" style="height: 30px">
                                        </form>
                                    </div>`),
                            footer: {},
                            onOk: () => {
                                let val = d.query('.set-rfid-shelf')['value'];
                                //console.log(d.query('.set-rfid-code').value);
                                this.domHash['categoryVal2'].innerText = val;
                                console.log("打印了")

                                mode.destroy();
                            },
                            onClose: () => {
                                Modal.toast('输入成功');
                            }

                        })

                    }}></i>
                        <p class="value3" style="color:rgb(0, 122, 255)">2321312</p>
                    </div>
                    <div class="rfid-barCode-right">
                        <p class="title">条码</p>
                        <p class="value" style="color:red"></p>
                    </div>
                </div>
                <div class="rifd-bar-code-describe">卅达夏 包袋OL/明媚481 109 黑色</div>
                <div class="rfid-barCode-nums">
                    <div class="rfid-barCode-set">
                        <div class="set-row">
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
                                        let optionStype, Where = {},
                                            modeVal = d.query('.shelf-nums>input');
                                        if (G.tools.isNotEmpty(this.fields)) {

                                            for (let i = 0; i < this.fields.length; i++) {
                                                if (i == 0) {
                                                    Where[this.fields[i].name] = this.domHash['categoryVal'].innerText;
                                                } else if (i == 1) {
                                                    Where[this.fields[i].name] = this.domHash['categoryVal1'].innerText;
                                                } else if (i == 2) {
                                                    Where[this.fields[i].name] = this.domHash['categoryVal2'].innerText;
                                                }
                                            }
                                        }
                                        let params = {
                                            optionStype: optionStype,
                                            num: modeVal['value'] || 0,
                                            nameId: para.uniqueFlag,
                                            Where: Where,
                                            codeName: this.uid
                                        }
                                        if (this.mode[key] == '逐一') {

                                            params['optionStype'] = 2;

                                            //先关闭之前的监听重新开启

                                            let s = G.Shell.inventory.openRegistInventory(2, params, (res) => {
                                                alert('触发2')
                                                alert(JSON.stringify(res))
                                                let num = d.query('.total-nums>span');
                                                num.innerText = (parseInt(num.innerText) + 1) + '';
                                                let data = res.data;
                                                if (data.name) {
                                                    let arr = data.array;
                                                    for (let i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value)
                                                        this.domHash['barcode'].innerText = arr[i].barcode;
                                                        this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        this.domHash['count'].innerText = arr[i].count;
                                                        this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        this.domHash['Commodity'].innerText = arr[i].name;
                                                    }

                                                }
                                            })
                                            alert(s + '注册成功')

                                        } else if (this.mode[key] == '替换') {
                                            params['optionStype'] = 0;

                                            let s = G.Shell.inventory.openRegistInventory(2, params, (res) => {
                                                //alert(JSON.stringify(res))
                                                let data = res.data;
                                                this.fields.forEach((res) => {
                                                    if (res.index == 1) {
                                                        //分类一
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal'] = arr[i].value
                                                            }
                                                        }
                                                    } else if (res.index == 2) {
                                                        //分类二
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal1'] = arr[i].value
                                                            }
                                                        }
                                                    } else {
                                                        //分类三
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal2'] = arr[i].value
                                                            }
                                                        }
                                                    }
                                                })
                                                if (data.name == this.uid) {

                                                    let arr = data.array;
                                                    for (let i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value)
                                                        this.domHash['barcode'].innerText = arr[i].barcode;
                                                        this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        this.domHash['count'].innerText = arr[i].count;
                                                        this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        this.domHash['Commodity'].innerText = arr[i].name;
                                                    }

                                                }

                                            })
                                            alert(s + '注册成功')
                                        } else if (this.mode[key] == '累加') {
                                            params['optionStype'] = 1;
                                            G.Shell.inventory.openRegistInventory(2, params, (res) => {
                                                alert(JSON.stringify(res))
                                                let data = res.data;
                                                if (data.name) {
                                                    let arr = data.array;
                                                    for (let i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value)
                                                        this.domHash['barcode'].innerText = arr[i].barcode;
                                                        this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        this.domHash['count'].innerText = arr[i].count;
                                                        this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        this.domHash['Commodity'].innerText = arr[i].name;
                                                    }

                                                }
                                            })
                                        } else {
                                            G.Shell.inventory.openRegistInventory(1, this.params, (res) => {
                                                //alert(JSON.stringify(res))
                                                let data = res.data;
                                                this.fields.forEach((res) => {
                                                    if (res.index == 1) {
                                                        //分类一
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal'] = arr[i].value
                                                            }
                                                        }
                                                    } else if (res.index == 2) {
                                                        //分类二
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal1'] = arr[i].value
                                                            }
                                                        }
                                                    } else {
                                                        //分类三
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal2'] = arr[i].value
                                                            }
                                                        }
                                                    }
                                                })
                                                if (data.name == this.uid) {

                                                    let arr = data.array;
                                                    for (let i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value)
                                                        this.domHash['barcode'].innerText = arr[i].barcode;
                                                        this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        this.domHash['count'].innerText = arr[i].count;
                                                        this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        this.domHash['Commodity'].innerText = arr[i].name;
                                                    }

                                                }

                                            })
                                        }


                                    }}></Toggle>
                        </div>
                        <div class="set-row">
                            <div>累加</div>
                            <Toggle size={20} checked={true} custom={{check: "ON", noCheck: "OFF"}}
                                    onClick={(isChecked) => {
                                        isChecked ? this.accumulation = "1" : this.accumulation = "0";
                                        let key = this.stepByone + this.accumulation;
                                        if (key && this.mode[key]) {
                                            d.query(".shelf-nums>.shelf-mode").innerHTML = this.mode[key];
                                        }
                                        // 切换注入监听事件
                                        let optionStype, Where = {},
                                            modeVal = d.query('.shelf-nums>input');
                                        if (G.tools.isNotEmpty(this.fields)) {
                                            for (let i = 0; i < this.fields.length; i++) {
                                                if (i == 0) {
                                                    Where[this.fields[i].name] = this.domHash['categoryVal'].innerText;
                                                } else if (i == 1) {
                                                    Where[this.fields[i].name] = this.domHash['categoryVal1'].innerText;
                                                } else if (i == 2) {
                                                    Where[this.fields[i].name] = this.domHash['categoryVal2'].innerText;
                                                }
                                            }
                                        }
                                        let params = {
                                            optionStype: optionStype,
                                            num: modeVal['value'] || 0,
                                            nameId: para.uniqueFlag,
                                            Where: Where,
                                            codeName: this.uid
                                        }
                                        if (this.mode[key] == '累加') {
                                            params['optionStype'] = 1

                                            //先关闭之前的监听重新开启
                                            //开启重新的
                                            G.Shell.inventory.openRegistInventory(2, params, (res) => {
                                                alert(JSON.stringify(res))
                                                let data = res.data;
                                                if (data.name) {
                                                    let arr = data.array;
                                                    for (let i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value)
                                                        this.domHash['barcode'].innerText = arr[i].barcode;
                                                        this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        this.domHash['count'].innerText = arr[i].count;
                                                        this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        this.domHash['Commodity'].innerText = arr[i].name;
                                                    }

                                                }
                                            })
                                            //
                                        } else if (this.mode[key] == '替换') {
                                            params['optionStype'] = 0;
                                            G.Shell.inventory.openRegistInventory(2, params, (res) => {
                                                //alert(JSON.stringify(res))
                                                let data = res.data;
                                                this.fields.forEach((res) => {
                                                    if (res.index == 1) {
                                                        //分类一
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal'] = arr[i].value
                                                            }
                                                        }
                                                    } else if (res.index == 2) {
                                                        //分类二
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal1'] = arr[i].value
                                                            }
                                                        }
                                                    } else {
                                                        //分类三
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal2'] = arr[i].value
                                                            }
                                                        }
                                                    }
                                                })
                                                if (data.name == this.uid) {

                                                    let arr = data.array;
                                                    for (let i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value)
                                                        this.domHash['barcode'].innerText = arr[i].barcode;
                                                        this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        this.domHash['count'].innerText = arr[i].count;
                                                        this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        this.domHash['Commodity'].innerText = arr[i].name;
                                                    }

                                                }

                                            })
                                        } else if (this.mode[key] == '逐一') {
                                            params['optionStype'] = 2;
                                            G.Shell.inventory.openRegistInventory(2, params, (res) => {
                                                alert('触发2')
                                                alert(JSON.stringify(res))
                                                let num = d.query('.total-nums>span');
                                                num.innerText = (parseInt(num.innerText) + 1) + '';
                                                let data = res.data;
                                                if (data.name) {
                                                    let arr = data.array;
                                                    for (let i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value)
                                                        this.domHash['barcode'].innerText = arr[i].barcode;
                                                        this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        this.domHash['count'].innerText = arr[i].count;
                                                        this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        this.domHash['Commodity'].innerText = arr[i].name;
                                                    }

                                                }
                                            })
                                        } else {
                                            G.Shell.inventory.openRegistInventory(1, this.params, (res) => {
                                                //alert(JSON.stringify(res))
                                                let data = res.data;
                                                this.fields.forEach((res) => {
                                                    if (res.index == 1) {
                                                        //分类一
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal'] = arr[i].value
                                                            }
                                                        }
                                                    } else if (res.index == 2) {
                                                        //分类二
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal1'] = arr[i].value
                                                            }
                                                        }
                                                    } else {
                                                        //分类三
                                                        if (data.name == res.name) {
                                                            let arr = data.array;
                                                            for (let i = 0; i < arr.length; i++) {
                                                                this.domHash['categoryVal2'] = arr[i].value
                                                            }
                                                        }
                                                    }
                                                })
                                                if (data.name == this.uid) {

                                                    let arr = data.array;
                                                    for (let i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value)
                                                        this.domHash['barcode'].innerText = arr[i].barcode;
                                                        this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        this.domHash['count'].innerText = arr[i].count;
                                                        this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        this.domHash['Commodity'].innerText = arr[i].name;
                                                    }

                                                }

                                            })
                                        }


                                    }}></Toggle>
                        </div>
                    </div>
                    <div class="shelf-nums">
                        数量(<span class="shelf-mode"></span>)<input type="number"/>
                    </div>
                    <div class="total-nums">
                        <i class="iconfont icon-zonghesum1"></i>数量:<span style="color:#007aff">0</span>
                    </div>
                </div>
                <div class="total-rfid">
                    <p class="bar-code-scan">共扫描<span>0</span>项</p>
                    <p class="bar-code-amount">总数量为<span>0</span></p>
                </div>
            </div>
            <div class="rfid-barCode-footer">
                <div>
                    <button onclick={() => {
                        let optionStype = 0;
                        let mode = new Modal({
                            isMb: false,
                            position: "center",
                            header: '请输入条码',
                            isOnceDestroy: true,
                            isBackground: true,
                            body: d.create(`<div data-code="barcodeModal">
                                        <form>
                                            <label>条码:</label>
                                            <input type="text" class="set-rfid-code" style="height: 30px">
                                        </form>
                                    </div>`),
                            footer: {},
                            onOk: () => {
                                let val = d.query('.set-rfid-code')['value'],
                                    category = [];
                                category.push(d.query('.rfid-shelf-number>.shelf-number').innerText);
                                d.query('.rfid-barCode-content>.rfid-barCode-right>.value').innerText = val;
                                //替换，累加，上传 参数值需要实时变化
                                let key = this.stepByone + this.accumulation;
                                if (this.mode[key] == '替换') {
                                    optionStype = 0;
                                } else if (this.mode[key] == '逐一') {
                                    optionStype = 2;
                                } else if (this.mode[key] == '累加') {
                                    optionStype = 1;
                                } else {
                                    optionStype = 0;
                                }
                                alert("111111");
                                let s =  G.Shell.inventory.inputcodedata(optionStype, para.uniqueFlag, val, category, (res) => {
                                    alert('00000')
                                    alert(JSON.stringify(res))
                                    let data = res.data;
                                    let arr = data.array;
                                    for (let i = 0; i < arr.length; i++) {
                                        if (arr[i].name) {
                                            this.domHash['barcode'].innerText = arr[i].barcode;
                                            this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                            this.domHash['scanamout'].innerText = arr[i].scanCount;
                                            this.domHash['count'].innerText = arr[i].count;
                                            this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                            this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                            this.domHash['Commodity'].innerText = arr[i].name;
                                        }

                                    }

                                })
                                alert("22222222" + s)

                                mode.destroy();
                            },
                            onClose: () => {
                                //Modal.toast('输入成功');
                            }

                        })

                    }}>输入条码
                    </button>
                    <button onclick={
                        () => {
                            console.log(para.codeStype)
                            let str = [];
                            para.codeStype.forEach((val) => {
                                let obj = {};
                                obj['value'] = val['IMPORTDATAMODE'];
                                obj['text'] = val['IMPORTDATAMODE'];
                                str.push(obj);
                            })
                            console.log(str);
                            let updataEl;


                            let mode = new Modal({
                                isMb: false,
                                position: "center",
                                header: '上传数据 ',
                                isOnceDestroy: true,
                                isBackground: true,
                                body: <div data-code="updataModal">
                                    <p>设备存在数据,信息如下</p>
                                    <p>{this.domHash['title'].innerText} {this.domHash['title1'].innerText}</p>
                                    <p>{this.domHash['inventory'].innerHTML}</p>
                                    <p>操作者信息:{para.USERID + "店" + para.SHO_ID}</p>
                                    <p>{'共扫描' + this.domHash['scanamout'].innerText + '项'}，{'总数量为' + this.domHash['count'].innerText}</p>
                                    <div>
                                        <p>上传数据处理方式</p>
                                        {
                                            updataEl = <SelectInputMb data={str}/>
                                        }
                                    </div>
                                </div>,
                                footer: {
                                    rightPanel: [{
                                        content: "上传",
                                        onClick: function () {
                                            console.log(updataEl.getText());
                                            ;
                                            G.Shell.inventory.uploadcodedata(para.uniqueFlag, (res) => {
                                                alert(JSON.stringify(res))
                                            })
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
                        uid = this.uid;
                        this.fields && this.fields.forEach((res) => {
                            if (res.index == 1) {
                                category = res.name;
                            }
                        })
                        let deModel = new Modal({
                            isMb: false,
                            position: "center",
                            header: '请选择删除数据范围 ',
                            isOnceDestroy: true,
                            isBackground: true,
                            body: <div data-code="deleteModal">

                                <div>
                                    {
                                        deleteEL = <SelectInputMb data={[{
                                            value: {'barcode': '', 'category': ''},
                                            text: "所有"
                                        }, {
                                            value: {'barcode': '', 'category': this.domHash['categoryVal'].innerHTML},
                                            text: this.domHash['category'].innerText + this.domHash['categoryVal'].innerText
                                        }, {
                                            value: {
                                                'barcode': this.domHash['barcode'].innerText,
                                                'category': this.domHash['categoryVal'].innerText
                                            },
                                            text: this.domHash['category'].innerText + ":" + this.domHash['categoryVal'].innerText + "条码:" + this.domHash['barcode'].innerText
                                        }, {
                                            value: {'barcode': this.domHash['barcode'].innerText, 'category': ''},
                                            text: '条码' + this.domHash['barcode'].innerText
                                        }]}/>
                                    }
                                </div>
                            </div>,
                            footer: {
                                rightPanel: [{
                                    content: "确认删除",
                                    onClick: function () {
                                        console.log(deleteEL.getText());
                                        console.log(deleteEL.get())
                                        let value = deleteEL.get(),
                                            where = {};
                                        where[uid] = value.barcode;
                                        where[category] = value.category
                                        let success = false;
                                        let del = G.Shell.inventory.delInventoryData(para.uniqueFlag, where, (res) => {
                                            alert(JSON.stringify(res))
                                            if (res.success) {

                                                let optionStype = 0;
                                                let key = this.stepByone + this.accumulation;
                                                if (this.mode[key] == '替换') {
                                                    optionStype = 0;
                                                } else if (this.mode[key] == '逐一') {
                                                    optionStype = 2;
                                                } else if (this.mode[key] == '累加') {
                                                    optionStype = 1;
                                                } else {
                                                    optionStype = 0;
                                                }
                                                let val = d.query('.set-rfid-code')['value'] || 0;
                                                // G.Shell.inventory.inputcodedata(optionStype, para.uniqueFlag, val, category, (res) => {
                                                //     alert(JSON.stringify(res))
                                                //     let data = res.data;
                                                //     let arr = data.array;
                                                //     for (let i = 0; i < arr.length; i++) {
                                                //         if (arr[i].name) {
                                                //             this.domHash['barcode'].innerText = arr[i].barcode;
                                                //             this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                //             this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                //             this.domHash['count'].innerText = arr[i].count;
                                                //             this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                //             this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                //             this.domHash['Commodity'].innerText = arr[i].name;
                                                //         }
                                                //
                                                //     }
                                                //
                                                // })
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

                </div>

            </div>

        </div>
    }


    private InitRfidBarCode(para) {
        //初始化监听输入框的值
        let modeVal = d.query('.shelf-nums>input')
        console.log(modeVal);
        modeVal.onchange = () => {
            console.log('开始改变')
            let num = d.query('.total-nums>span')
            let key = this.stepByone + this.accumulation;
            console.log(modeVal['value']);
            if (this.mode[key] == "累加" && modeVal['value'] !== "") {
                alert('这是累加')
                num.innerText = parseInt(num.innerText) + parseInt(modeVal['value']) + ""
                //添加新的传值接口

                let  Where = {};
                if (G.tools.isNotEmpty(this.fields)) {

                    for (let i = 0; i < this.fields.length; i++) {
                        if (i == 0) {
                            Where[this.fields[i].name] = this.domHash['categoryVal'].innerText;
                        } else if (i == 1) {
                            Where[this.fields[i].name] = this.domHash['categoryVal1'].innerText;
                        } else if (i == 2) {
                            Where[this.fields[i].name] = this.domHash['categoryVal2'].innerText;
                        }
                    }
                }

                let params = {
                    optionStype: 1,
                    num: modeVal['value'] || 0,
                    nameId: para.uniqueFlag,
                    Where: Where,
                    codeName: this.uid || '',
                    barcode: this.domHash['barcode'].innerText || ''
                }
                alert(JSON.stringify(para.uniqueFlag) + '这' )
                G.Shell.inventory.dealbarcode(2,params,(res)=>{

                })

            } else if (this.mode[key] == "替换" && modeVal['value'] !== "") {
                num.innerText = parseInt(modeVal['value']) + "";
                //添加新的传值接口

                let  Where = {};
                alert(JSON.stringify(this.fields));
                if (G.tools.isNotEmpty(this.fields)) {

                    for (let i = 0; i < this.fields.length; i++) {
                        if (i == 0) {
                            Where[this.fields[i].name] = this.domHash['categoryVal'].innerText;
                        } else if (i == 1) {
                            Where[this.fields[i].name] = this.domHash['categoryVal1'].innerText;
                        } else if (i == 2) {
                            Where[this.fields[i].name] = this.domHash['categoryVal2'].innerText;
                        }
                    }
                }
                let params = {
                    optionStype: 0,
                    num: modeVal['value'] || 0,
                    nameId: para.uniqueFlag,
                    Where: Where,
                    codeName: this.uid || '',
                    barcode: this.domHash['barcode'].innerText||''
                }
                alert('替换' + JSON.stringify(params))
                // Modal.alert(G.Shell.inventory.dealbarcode)
                G.Shell.inventory.dealbarcode(2,params,(res)=>{
                    alert(res);

                })
            }
        }

        let category = d.query('.rfid-shelf-number>.shelf-category'),
            barcode = d.query('.rfid-barCode-content>.rfid-barCode-right>.value'),
            barcodeTitl = d.query('.rfid-barCode-content>.rfid-barCode-right>.title'),
            categoryVal = d.query('.rfid-shelf-number>.shelf-number'),
            category1 = d.query('.rfid-barCode-content>.rfid-barCode-left>.title2'),
            category2 = d.query('.rfid-barCode-content>.rfid-barCode-left>.title3'),
            categoryVal1 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value2'),
            categoryVal2 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value3'),
            Commodity = d.query('.rifd-bar-code-describe'),
            num = d.query('.shelf-nums'),
            scanamout = d.query('.total-rfid >.bar-code-scan>span'),
            count = d.query('.total-rfid>.bar-code-amount>span'),
            title = d.query('.rfid-barCode-title>.barCode-title'),
            title1 = d.query('.rfid-barCode-title>.barCode-title1'),
            inventory = d.query('.rfid-barCode-body>.rfid-barCode-inventory')
        this.domHash['category'] = category;
        this.domHash['barcode'] = barcode;
        this.domHash['categoryVal'] = categoryVal;
        this.domHash['category1'] = category1;
        this.domHash['category2'] = category2;
        this.domHash['categoryVal1'] = categoryVal1;
        this.domHash['categoryVal2'] = categoryVal2;
        this.domHash['barcodeTitl'] = barcodeTitl;
        this.domHash['Commodity'] = Commodity;
        this.domHash['num'] = num;
        this.domHash['scanamout'] = scanamout;
        this.domHash['count'] = count;
        this.domHash['title'] = title;
        this.domHash['title1'] = title1;
        this.domHash['inventory'] = inventory;


    }

    private uid: string;

    private downData(para) {
        let loading = new Loading({
            msg: "加载中"
        })
        this.params = {
            optionStype: 0,
            num: 0,
            nameId: para.uniqueFlag,
        }
        //需要加个加载中
        let s = G.Shell.inventory.downloadbarcode(para.uniqueFlag, BW.CONF.siteUrl + para.downUrl, BW.CONF.siteUrl + para.uploadUrl, (res) => {
            let data = G.Shell.inventory.getTableInfo(para.uniqueFlag)
            let pageName = data.data;;
            this.uid = pageName.uid;
            this.domHash['inventory'].innerHTML = pageName.AffilTitle;
            this.domHash['title'].innerText = pageName.funTitle;
            this.domHash['barcodeTitl'].innerHTML = pageName.uidName;
            //分类字段
            this.domHash['count'].innerHTML = pageName.count;
            this.fields = pageName.fields;
            this.fields.forEach((val) => {
                if (val.index == 1) {
                    this.domHash['category'].innerText = val.title;
                } else if (val.index == 2) {
                    this.domHash['category1'].innerText = val.title;
                } else {
                    this.domHash['category2'].innerText = val.title;
                }
            })
            loading.destroy();

        })

        G.Shell.inventory.openRegistInventory(1, this.params, (res) => {
            //alert(JSON.stringify(res))
            let data = res.data;
            this.fields.forEach((res) => {
                let arr = data.array;
                if (res.index == 1) {
                    //分类一
                    if (data.name == res.name) {
                        for (let i = 0; i < arr.length; i++) {
                            this.domHash['categoryVal'] = arr[i].value
                        }
                    }
                } else if (res.index == 2) {
                    //分类二
                    if (data.name == res.name) {
                        for (let i = 0; i < arr.length; i++) {
                            this.domHash['categoryVal1'] = arr[i].value
                        }
                    }
                } else {
                    //分类三
                    if (data.name == res.name) {
                        for (let i = 0; i < arr.length; i++) {
                            this.domHash['categoryVal2'] = arr[i].value
                        }
                    }
                }
            })
            if (data.name == this.uid) {

                let arr = data.array;
                for (let i = 0; i < arr.length; i++) {
                    this.domHash['barcode'].innerText = arr[i].barcode;
                    this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                    this.domHash['scanamout'].innerText = arr[i].scanCount;
                    this.domHash['count'].innerText = arr[i].count;
                    this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                    this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                    this.domHash['Commodity'].innerText = arr[i].name;
                }

            }

        })
    }
}
