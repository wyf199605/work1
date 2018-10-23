/// <amd-module name="RfidBarCode"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Toggle} from "../../../../global/components/form/toggle/toggle";
import d = G.d;
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {SelectInput} from "../../../../global/components/form/selectInput/selectInput";
import {SelectInputMb} from "../../../../global/components/form/selectInput/selectInput.mb";

interface IRfidBarCode extends IComponentPara{
    ajaxData?:object[];
    nameId?:string,
    codeStype?:object[],
    url?:string,
    SHO_ID?:string,
    USERID?:string
    uniqueFlag?:string,
    downUrl:string,
    uploadUrl:string,
    analysis:string

}
interface registParams {
    optionStype:number,
    num:number,
    nameId:number
    Where?:obj
}


export class RfidBarCode extends  Component {
   private stepByone:string ="0";
   private accumulation:string = "0";
   private mode:object = {"00":"替换","01":"累加","10":"逐一","11":"请选择"}
   private domHash:object = {"title":null, "title1":"","inventory":null, "category":null, "barcode":null ,"category1":null,"Commodity":null,"num":null,"scanamout":null,"count":null }
   private type:number = 0;
   private params:registParams;
   private regist;

    constructor(para:IRfidBarCode){
        super(para);
        let key = this.stepByone + this.accumulation;
        if(key && this.mode[key]){
            d.query(".shelf-nums>.shelf-mode").innerText = this.mode[key];
        }
        let body = <div></div>;
        new Modal({
            className:'rfid-bar-code',
            zIndex:1000,
            body:body,
            header:"条码扫码"
        });

        this.container = body;
        this.InitRfidBarCode();
        this.downData(para);

    }
    protected wrapperInit(para:IRfidBarCode): HTMLElement {
        return <div class="rfidBarCode-page">
            <div class="rfid-barCode-body">
             <div class="rfid-barCode-title">
                <span class="barCode-title">盘点单 </span>
                <span class="barCode-title1">饰品</span>
             </div>
            <div class="rfid-barCode-inventory">
                511X16020400000
            </div>
                <div className="rfid-shelf-number"><i className="iconfont icon-huojiaqu-"></i><span
                    className="shelf-category">货架号:<span className="shelf-number">1002004</span> </span>
                </div>
            <div class="rfid-barCode-content">
                <div class="rfid-barCode-left">
                    <p class="title">分类-标题2</p>
                    <p class="value2" style="color:rgb(0, 122, 255)">100000</p>
                    <p className="title">分类-标题3</p>
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
                           <div>逐一扫描</div><Toggle size={20} custom={{check:"ON",noCheck:"OFF"}} onClick ={(isChecked)=> {
                               console.log(isChecked)
                              isChecked ? this.stepByone = "1" : this.stepByone = "0";
                           let key = this.stepByone + this.accumulation;
                           if(key && this.mode[key]){
                               d.query(".shelf-nums>.shelf-mode").innerText = this.mode[key];
                           }
                           if(isChecked){
                              d.query('.shelf-nums>input')['disabled'] = true;
                           }else {
                               d.query('.shelf-nums>input')['disabled'] = false;
                           }

                       }}></Toggle>
                       </div>
                       <div class="set-row">
                           <div>累加</div><Toggle size={20} custom={{check:"ON",noCheck:"OFF"}} onClick = {(isChecked)=>{
                               isChecked ? this.accumulation = "1" : this.accumulation = "0";
                           let key = this.stepByone + this.accumulation;
                           if(key && this.mode[key]){
                               d.query(".shelf-nums>.shelf-mode").innerHTML = this.mode[key];
                           }
                           }
                       }></Toggle>
                       </div>
                   </div>
                <div class="shelf-nums">
                   数量(<span class="shelf-mode"></span>)<input type="number"/>
               </div>
                <div class="total-nums">
                    <i class="iconfont icon-zonghesum1"></i>数量:<span style="color:#007aff">6</span>
                </div>
            </div>
            <div class="total-rfid">
                <p class="bar-code-scan">共扫描<span>2</span>项</p>
                <p class="bar-code-amount">总数量为<span>11</span></p>
            </div>
            </div>
            <div class="rfid-barCode-footer">
                <div>
                    <button onclick={ ()=> {

                        let mode = new Modal({
                            isMb:false,
                            position:"center",
                            header: '请输入条码',
                            isOnceDestroy: true,
                            isBackground:true,
                            body: d.create(`<div data-code="barcodeModal">
                                        <form>
                                            <label>条码:</label>
                                            <input type="text" class="set-rfid-code" style="height: 30px">
                                        </form>
                                    </div>`),
                            footer:{
                            },
                            onOk: () => {
                                let val = d.query('.set-rfid-code')['value'];
                                console.log(d.query('.set-rfid-code')['value']);
                                //console.log(d.query('.set-rfid-code').value);
                                d.query('.rfid-barCode-content>.rfid-barCode-right>.value').innerHTML = val;
                                console.log("打印了")

                                mode.destroy();
                            },
                            onClose: () => {
                                Modal.toast('输入成功');
                            }

                        })

                    }}>输入条码</button>
                    <button onclick={
                        ()=> {
                            console.log(para.codeStype)
                             let str = [];
                            para.codeStype.forEach((val)=>{
                                let obj = {};
                              obj['value'] = val['IMPORTDATAMODE'];
                              obj['text'] = val['IMPORTDATAMODE'];
                                str.push(obj);
                            })
                            console.log(str);
                             let updataEl;


                             let mode = new Modal({
                                isMb:false,
                                position:"center",
                                header: '上传数据 ',
                                isOnceDestroy: true,
                                 isBackground:true,
                                body:  <div data-code="updataModal">
                                    <p>设备存在数据,信息如下</p>
                                    <p>{this.domHash['title'].innerText} {this.domHash['title1'].innerText}</p>
                                    <p>{this.domHash['inventory'].innerHTML}</p>
                                    <p>操作者信息:{para.USERID + "店" + para.SHO_ID}</p>
                                    <p>{this.domHash['scanamout'].innerText}，{this.domHash['count'].innerText}</p>
                                    <div>
                                        <p>上传数据处理方式</p>
                                        {
                                            updataEl = <SelectInputMb  data={str}/>
                                        }
                                    </div>
                                </div>,
                                footer:{
                                    rightPanel:[{
                                        content:"上传",
                                        onClick:function () {
                                            console.log(updataEl.getText());;
                                            console.log("上传成功")
                                        }
                                    }]
                                },
                                onOk: () => {

                                    console.log("打印了")
                                    mode.destroy();
                                },
                                onClose: () => {
                                    Modal.toast('输入成功');
                                    mode.destroy();
                                }

                            })
                        }
                    }>上传数据</button>
                    <button onclick={()=>{

                        let deleteEL;
                        let deModel = new Modal({
                            isMb:false,
                            position:"center",
                            header: '请选择删除数据范围 ',
                            isOnceDestroy: true,
                            isBackground:true,
                            body:  <div data-code="deleteModal">

                                <div>
                                    {
                                        deleteEL = <SelectInputMb  data={[{value:"",text:"所有"},{value:"",text:this.domHash['category'].innerText},{
                                            value:"",text:this.domHash['category'].innerText +"条码" + this.domHash['barcode'].innerText
                                        },{value:'',text:'条码'+ this.domHash['barcode'].innerText}]}/>
                                    }
                                </div>
                            </div>,
                            footer:{
                                rightPanel:[{
                                    content:"确认删除",
                                    onClick:function () {
                                        console.log(deleteEL.showItems());
                                        console.log(deleteEL.getText());
                                        console.log(deleteEL.get())
                                        console.log("上传成功")
                                    }
                                }]
                            },
                            onOk: () => {

                                console.log("打印了")
                                deModel.destroy();
                            },
                            onClose: () => {
                                Modal.toast('输入成功');
                                deModel.destroy();
                            }

                        })

                    }
                    }>删除数据</button>
                    <button  onclick={ ()=> {

                        let mode = new Modal({
                            isMb:false,
                            position:"center",
                            header: '请输入货架号',
                            isOnceDestroy: true,
                            isBackground:true,
                            body: d.create(`<div data-code="barcodeModal">
                                        <form>
                                            <label>货架号:</label>
                                            <input type="text" class="set-rfid-shelf" style="height: 30px">
                                        </form>
                                    </div>`),
                            footer:{
                            },
                            onOk: () => {
                                let val = d.query('.set-rfid-shelf')['value'];
                                //console.log(d.query('.set-rfid-code').value);
                                d.query('.rfid-shelf-number>.shelf-category>.shelf-number').innerText = val;
                                console.log("打印了")

                                mode.destroy();
                            },
                            onClose: () => {
                                Modal.toast('输入成功');
                            }

                        })

                    }}>输入货架号</button>
                </div>

            </div>

        </div>
    }

    private  InitDom(){

    }
    private InitRfidBarCode(){
     //初始化监听输入框的值
     let modeVal = d.query('.shelf-nums>input')
        console.log(modeVal);
        modeVal.onchange =()=>{
          console.log('开始改变')
            let num = d.query('.total-nums>span')
            let key = this.stepByone + this.accumulation;
          console.log(modeVal['value']);
          if( this.mode[key] == "累加" && modeVal['value'] !== ""){
                num.innerText = parseInt(num.innerText)  + parseInt(modeVal['value']) + ""
          }else if(this.mode[key] == "替换" && modeVal['value'] !== ""){
              num.innerText = parseInt(modeVal['value']) + "";
          }
        }

     let category = d.query('.rfid-shelf-number'),
         barcode = d.query('.rfid-barCode-content>.rfid-barCode-right>.value'),
         category1 = d.query('.rfid-barCode-content>.rfid-barCode-right>.value1'),
         category2 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value2'),
         category3 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value3'),
         Commodity = d.query('.rifd-bar-code-describe'),
         num = d.query('.shelf-nums'),
         scanamout = d.query('.total-rfid >.bar-code-scan'),
         count = d.query('.total-rfid>.bar-code-amount'),
         title = d.query('.rfid-barCode-title>.barCode-title'),
         title1 = d.query('.rfid-barCode-title>.barCode-title1'),
         inventory = d.query('.rfid-barCode-body>.rfid-barCode-inventory')
        console.log(num.innerText);
        console.log(scanamout.innerText);
        console.log(count.innerText);
        this.domHash['category'] = category;
        this.domHash['barcode'] = barcode;
        this.domHash['category1'] = category1;
        this.domHash['Commodity'] = Commodity;
        this.domHash['num'] = num;
        this.domHash['scanamout'] = scanamout;
        this.domHash['count'] = count;
        this.domHash['title'] = title;
        this.domHash['title1'] = title1;
        this.domHash['inventory'] = inventory;


    }
    private downData(para){
       alert('++')
        this.params = {
           optionStype:0,
            num:0,
            nameId:para.uniqueFlag,
        }
        let a =  G.Shell.inventory.getTableInfo(para.uniqueFlag,(resdata)=>{
            alert('进来了')
            alert(JSON.stringify(resdata))
        })
        alert(a);
       //  let s = G.Shell.inventory.downloadbarcode(para.uniqueFlag,BW.CONF.siteUrl+para.downUrl,BW.CONF.siteUrl+para.uploadUrl,para.analysis,(res)=>{
       //
       //
       //        let a =  G.Shell.inventory.getTableInfo(para.uniqueFlag,(resdata)=>{
       //             alert('进来了')
       //             alert(JSON.stringify(resdata))
       //         })
       // })



        //    this.regist = G.Shell.inventory.openRegistInventory(this.type,this.params,(res)=>{
        //     //alert(JSON.stringify(res.data))
        // })
    }
}
