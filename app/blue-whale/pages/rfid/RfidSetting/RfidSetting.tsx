/// <amd-module name="RfidSetting"/>
import IComponentPara = G.IComponentPara; import Component = G.Component;
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {Loading} from "../../../../global/components/ui/loading/loading";
import d = G.d;
import {MbPage} from "../../../../global/components/view/mbPage/MbPage";
export class RfidSettingModal extends Modal{
    private rfidSetting: RfidSetting;
    constructor() {
        let rfidSetting = new RfidSetting({});
        super({
            isShow: true,
            height: '100%',
            width: '100%',
            isOnceDestroy: true,
            className: 'modal-mbPage',
            position: 'down',
            onClose:()=>{
                rfidSetting.rfidClose();
            }
        });

        new MbPage({
            container: this.bodyWrapper,
            body: rfidSetting.wrapper,
            title: "rfid配置",
            left: [{
                icon: 'mui-icon-left-nav',
                iconPre: 'mui-icon',
                onClick : () => {
                    this.isShow = false
                }
            }]
        });


        this.rfidSetting = rfidSetting;
    }

    destroy(){
        super.destroy();
        this.rfidSetting.destroy();
    }
}

export class RfidSetting extends Component {
    constructor(para) {
        super(para);
        this.rfidOpen();
        this.getband();
        this.getMinMaxBand();
        this.rfidsave();
        this.clearCook();
        this.keyupReduce();
        this.keyupAdd();
    }


    protected wrapperInit(para: IComponentPara): HTMLFormElement {
        return <form className='rfid-setting-page'>
            <div className="rfid-power">
                <span>输出功率:</span>
                <div>
                    <select name="power" class="power">
                        <option value="0">--请选择--</option>
                        <option value="功率">--功率--</option>
                    </select>
                    dMB
                </div>
            </div>
            <div className="rfid-frequency">
                <span>输出频率:</span>
                <select name="frequency" id="frequency">
                    <option value="0">--请选择--</option>
                    <option value="哈哈">--请选择--</option>
                </select>
            </div>
            <div className="rfid-model">
                <span>蜂鸣模式:</span>
                <div>
                    <label>连续 <input name="mode" type="radio" value="lianxu"/></label>
                    <label>不连续 <input name="mode" type="radio" value="nolianxu"/></label>
                </div>
            </div>
            <div className="rfid-job">
                <span>工作模式:</span>
                <div className="rfid-number">
                    <div className="rfid-reduce rfid-job-reduce">-</div>
                    <input type="number" className="rifd-job-input"/>
                    <div className="rfid-add rfid-job-add">+</div>
                </div>
                MS
            </div>
            <div className="rfid-rest">
                <span>休息模式:</span>
                <div className="rfid-number">
                    <div className="rfid-reduce rfid-rest-reduce">-</div>
                    <input type="number" className="rifd-rest-input"/>
                    <div className="rfid-add rfid-rest-add">+</div>
                </div>
                MS
            </div>
            <div className="rfid-gun">
                <span>盘点棒:</span>
                <div class="rfid-gun-set">
                    <select name="rod" id="rod" class="rfid-rod">
                        <option value="0" class="rod-f" >否</option>
                        <option value="1" class="rod-t">是</option>
                    </select>
                </div>
            </div>
            <div className="rfid-setting-btn">
                <input type="button" value="保存"></input>
            </div>
            <div className="rfid-setting-btn rfid-clear">
                <input type="button" value="清除缓存"/>
            </div>
        </form>;
    }

    private powerEl  = d.query('.power', this.wrapper);
    private frequenEl = d.query('#frequency',this.wrapper);
    private rfidcs = d.query('.rfid-setting-btn>input',this.wrapper) ;
    private rfidcl = d.query('.rfid-clear>input',this.wrapper);
    private jobReduce = d.query('.rfid-job-reduce',this.wrapper);
    private restReduce = d.query('.rfid-rest-reduce',this.wrapper);
    private jobInput = d.query('.rifd-job-input',this.wrapper);
    private restInput = d.query('.rifd-rest-input',this.wrapper);
    private jobAdd = d.query('.rfid-job-add',this.wrapper);
    private restAdd = d.query('.rfid-rest-add',this.wrapper);

    public getParam() {
        let powerRes;
        let that = this;
        powerRes = G.Shell.inventory.rfidGetParam({}, function (res) {
            let data = res.data;
            that.powerEl.innerHTML = "";
            that.frequenEl.innerHTML = "";
                let powerel = <option value={data.power}>{data.power}</option>;
                that.powerEl.appendChild(powerel);
                let freel = <option value={data.frequencyMode}>{data.frequencyMode}</option>;
                that.frequenEl.appendChild(freel)

        })



        //{“frequencyMode”:"美国标准(902~928MHz)","power":"30"} 渲染数据到页面上
    }

    private rfidOpen() {
        let   that = this,
               rfidGun = d.query('.rfid-rod',that.wrapper),
               rodSel =  d.queryAll('option',rfidGun),
              result =  G.Shell.inventory.defaultRfidDevice ("get",0);
        if( G.tools.isNotEmpty(result) && result.data === 0){
                //rodF['selected'] = "selected";
               // rodF['selected'] = true;
            rodSel[0]['selected'] = true

         }else {
               // rodT['selected'] = "selected";
            rodSel[1]['selected'] = true
        }
        G.Shell.inventory.getPwn((res)=>{
            let val = res.data;
            if(val) {
                that.jobInput['value'] = val.workTime;
                that.restInput['value'] =val.waitTime;
                this.getParam();
            }
        })
    }


    private getband() {
        let that = this;
       G.Shell.inventory.getBand({},function (res) {
            let resData = res.data;
           d.on(that.frequenEl, 'focus', function () {
               let frag = document.createDocumentFragment();
               this.innerHTML = "";
               for (let i = 0; i < resData.length; i++) {
                   let option = <option value={resData[i]}>{resData[i]}</option>;
                   frag.appendChild(option);
               }
               this.appendChild(frag);
           });
       })

    }

    private getMinMaxBand() {
        G.Shell.inventory.getMinMaxBand({},(res)=>{
            let data = res.data;
            d.on(this.powerEl,'click', (e)=> {

                e.stopPropagation();
                let frag = document.createDocumentFragment();
                this.powerEl.innerHTML = "";
                for (let i = 0; i < data.length; i++) {
                    let option = <option value={data[i]}>{data[i]}</option>;
                    frag.appendChild(option);
                }
                this.powerEl.appendChild(frag);
            })
        })

    }

// 保存
    private rfidsave() {

        d.on(this.rfidcs,'click', ()=> {
            let power = this.powerEl['value'];
            let fre  = this.frequenEl['value'];
            let jobInput = this.jobInput['value'];
            let resInput = this.restInput['value'];
            let data:obj = { 'band':fre,'powerBand':power},
                rfidGun = d.query('.rfid-rod',this.wrapper),
                rodSel =  d.queryAll('option',rfidGun);
            G.Shell.inventory.rfidSetParam(data,function (res) {

               if (res.data === "成功") {
                   G.Shell.inventory.setPwm({"workTime":jobInput,"waitTime":resInput},(res)=>{

                   })
                   let num = parseInt(rfidGun['value'])
                   G.Shell.inventory.defaultRfidDevice("set",num);
               }
            })

        })
    }

//清除缓存
    private clearCook() {
        d.on(this.rfidcl, 'click', function () {
            let re = G.Shell.inventory.clearData('',function (res) {

            })
        })
    }

     public  rfidClose () {
        let close = G.Shell.inventory.rfidClose(function (res) {

        })
    }
//监听减少和增加事件
    public keyupReduce () {
        d.on(this.jobReduce,'click',()=>{
            let val =this.jobInput['value'];
            if (val && val > 0) {
              this.jobInput['value'] = parseInt(val) - 1;
            }
        })
        d.on(this.restReduce,'click',()=>{
           let resVal = this.restInput['value'];
           if(resVal && resVal > 0) {
               this.restInput['value'] = parseInt(resVal) - 1;
           }
        })
    }

    public keyupAdd () {
         d.on(this.jobAdd,'click',()=>{
             let val = this.jobInput['value'];
             if (val && val > 0) {
                 this.jobInput['value'] = parseInt(val) + 1;
             }
         })

         d.on(this.restAdd,'click',()=>{
             let resVal = this.restInput['value'];
             if (resVal && resVal > 0) {
                 this.restInput['value'] =  parseInt(resVal) + 1;
             }
         })
    }

}
//操作 保存状态