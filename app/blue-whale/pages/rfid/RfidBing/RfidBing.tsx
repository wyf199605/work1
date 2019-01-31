/// <amd-module name="RfidBing"/>
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import IComponentPara = G.IComponentPara; import Component = G.Component;
import {FastTable} from '../../../../global/components/newTable/FastTable';
import {MbPage} from "../../../../global/components/view/mbPage/MbPage";
import d = G.d;
import tools= G.tools;
import {Button} from "../../../../global/components/general/button/Button";
import {BwRule} from "../../../common/rule/BwRule";
import sys = BW.sys;

export class RfidBingModal extends Modal {
    private epcList: EpcList;

    constructor(para: IEpcListPara) {
        let epcList = new EpcList(para);
        super({
            isShow: true,
            height: '100%',
            width: '100%',
            className: 'bind-report',
            position: 'down'
        });

        new MbPage({
            container: this.bodyWrapper,
            body: epcList.wrapper,
            title: '解绑/绑定',
            left: [{
                icon: 'mui-icon-left-nav',
                iconPre: 'mui-icon',
                onClick: () => {
                    this.isShow = false
                }
            }]
        });
        this.epcList = epcList;
    }

    destroy() {
        super.destroy();
        this.epcList.destroy();
        this.epcList = null;
    }
}
interface IEpcListPara extends IComponentPara{
    bindBtn: {
        itemid: string;
        elementid: string;
        caption: string; //绑定 or 解绑 or 报废 后台配置
        type:string; //配置类型 可以判断是解绑页还是绑定页
        nohead:string;//配置字段，是否有 barcode 输入框显示
        param:obj;//上传参数
    };

    epc?: string;
}
/**
 *
 * @returns 根据调用壳接口 扫到EPC码 添加到表格的一行数据中
 * 可做删除操作。
 */
export class EpcList extends Component {
    private ftable: FastTable;
    private boundEl: HTMLElement; // 已绑定
    private scanNumEl: HTMLElement; // 扫描量
    private skuEl: HTMLInputElement; //SKU
    private btn:Button;
    private turn: boolean = false;
    private typeValue :string;

    constructor(para: IEpcListPara) {
        super(para);
        this.tableInit();
        this.btnInit(para.bindBtn);
        this.getSku(para.bindBtn.type);
        this.judge(para);
        this.colConfig(para.bindBtn);

    }

    protected wrapperInit(para: IEpcListPara): HTMLElement {
        return <div className="rfid-bing-page">
            <div className='bind-screen-top'>
                <label>SKU{this.skuEl = <input type="text"/>}</label>
               <div className='bind-data'>
                  <div className='bind-tied-up'>{para.bindBtn.type == '0'? '已解绑' : '已绑定'} : {this.boundEl = <span>0</span>}</div>
                  <div className='bing-scanning'>扫描量: {this.scanNumEl = <span>0</span>}</div>
               </div>
            </div>
        </div>;
    }
    private  bindtimer = null;
    private  bindBarTime = null;
    private btnInit( bindBtn: { itemid: string; elementid: string; caption: string; type:string,param:obj} ) {
        let wrapper = <div className="rfid-bing-btns"></div>,
            content = bindBtn.caption,
            param = tools.isNotEmpty(bindBtn.param) ? bindBtn.param : {};

        let address = tools.url.addObj(`/inventoryrfid/import/${bindBtn.itemid}/${bindBtn.elementid}`, param),
            ftables = this.ftable,
            scanNumEl = this.scanNumEl,
            boundEl= this.boundEl;


        let i = 0;
        let s = new Button({
            container: wrapper,
            content: '开始扫描',
            onClick: () => {

                //测试
                if (s.content === "开始扫描") {
                    G.Shell.inventory.startEpc({},  (res)=> {
                        let epcArr = res.data;
                        if (Array.isArray(epcArr)) {

                            epcArr.forEach((val)=>{
                                let epc = val.epc,
                                    table = this.ftable.data,
                                    flag = true;
                                for (let i = 0;i<table.length;i++){
                                   if(epc == table[i].epc){
                                       flag = false;
                                       break;
                                   }
                               }
                                if(flag){
                                   ftables.dataAdd(epcArr);
                                   //需要统计 表格里面的数据
                                   scanNumEl.innerHTML = parseInt(scanNumEl.innerHTML) + epcArr.length + '';
                                }
                            })
                           // 需要实时的在扫描过程中，持续上传数据
                            tools.pattern.debounce(this.senData,500)
                        }
                    });
                    this.updataCellData(bindBtn);
                    s.content = "停止扫描";

                } else {
                    console.log(this.ftable.data);
                    clearInterval(this.bindBarTime)
                    G.Shell.inventory.stopEpc({}, function (res) {});
                    s.content = "开始扫描";
                }
            }
        });


        let c = new Button({
            container: wrapper,
            content: '清除数据',
            onClick: () => {

                ftables.data = [];//清空 但是打印长度为原来的长度
                scanNumEl.innerHTML = 0 + '';
                //Modal.alert(ftables.rows.length);
                G.Shell.inventory.clearEpc([], (res) => {
                    if (res) {
                        ftables.data = []; //打印长度为原来的长度；
                    }
                })

            }
        });

        let j = new Button({
            container: wrapper,
            content: content,
            onClick: () => {
                //更新绑定量

                BwRule.Ajax.fetch(BW.CONF.siteAppVerUrl + address, {
                    type: 'post',
                    data: {
                        info: bindBtn.type === '0' ? {
                            epc: this.ftable.data.filter(data => !!data).map(res => res.epc)
                        } : {
                            sku: this.skuEl.value,
                            epc: this.ftable.data.filter(data => !!data).map(res => res.epc)
                        }
                    }
                }).then(({response}) => {
                    if (response) {
                        G.Shell.inventory.clearEpc([], (res) => {
                            if (res) {
                                Modal.alert(response.msg,"",()=>{
                                    if (content === "报废" || content === "调出" || content === "调入") {
                                        sys.window.close();
                                    }
                                });
                                boundEl.innerHTML = this.ftable.data.length + parseInt(boundEl.innerHTML) + '';
                                ftables.data = [];
                                scanNumEl.innerHTML = 0 + '';
                            }
                        });
                        sys.window.firePreviousPage(BwRule.EVT_REFRESH);
                    }
                })
            }

        });

        d.append(this.wrapper, wrapper);
    }
    //创建表格
    private tableInit() {
        let ftable = new FastTable({
            container: this.wrapper,
            cols: [[{name: 'epc', title: 'EPC'}]],
            page: {
                size: 50
            },
            cellFormat: (data) => {
                let fragDoc = document.createDocumentFragment();
                d.append(fragDoc, data);
                d.append(fragDoc, <div className="delete">x</div>);
                return new Promise((resolve, reject) => {
                    resolve({
                        text: fragDoc
                    });
                });
            }
        });

         let that = this;
        ftable.click.add('tr>td>.delete', function () {
            let tr = this.parentElement.parentElement,
                rowIndex = parseInt(tr.dataset.index),
                str = [];

            that.scanNumEl.innerHTML = parseInt(that.scanNumEl.innerHTML) - 1 + '';
            let rowdata = ftable.rowGet(rowIndex).data;
            if (G.tools.isNotEmpty(rowdata)) {
                str.push(rowdata);
            }
            ftable.rowDel([rowIndex]);

            G.Shell.inventory.clearEpc(str, (res) => {

            })

        });


        this.ftable = ftable;
    }

    //获取SKU
    public getSku(para) {
       if (para === '1') {
           G.Shell.inventory.openScan( (res) => {
               if (res.data && res.data !== 'openSuponScan') {
                   this.skuEl.value = res.data;
               }
           })
       }

    }
    private bingCell:object = {};
    //根据后台配置的类型 type 决定是否显示需要输入的barcode值
    public judge(para: IEpcListPara) {

         if (para.bindBtn.type === '0') {
             d.query('.bind-screen-top>label',this.wrapper).style.display = 'none';
            // d.query('.bind-tied-up',this.wrapper).innerText = '已解绑:';
          }
          if(para.bindBtn.nohead) {
              d.query('.bind-data > .bind-tied-up',this.wrapper).style.display = 'none';
          }
        }

        private  colConfig(bindBtn: { itemid: string; elementid: string; caption: string; type:string,param:obj}){
            let param = tools.isNotEmpty(bindBtn.param) ? bindBtn.param : {};
            //epc上传需要传入的参数
            let address = tools.url.addObj(`/inventoryrfid/getdata/${bindBtn.itemid}/${bindBtn.elementid}`, param),
                line = d.query('.bind-data',this.wrapper),
                temp = document.createDocumentFragment();

            BwRule.Ajax.fetch(BW.CONF.siteAppVerUrl + address).then(({response})=>{
                console.log(response.body.bodyList);
                //let data = res.body.bodyList || [];
                if(tools.isNotEmpty(response.body.bodyList)){
                    let data = response.body.bodyList;
                    for(let i=0;i<data.length;i++){

                        data[i].forEach((val)=>{
                            let div = <div className={val.calcField}>
                                {val.calcCaption} : <span>{val.calcValue}</span>
                            </div>
                            this.bingCell[val.calcField] = d.query('span',div);
                            d.append(temp,div)
                        })

                    }
                    console.log(this.bingCell);
                    d.append(line,temp);
                }
                //console.log(data)
            })
        }

        public updataCellData (bindBtn: { itemid: string; elementid: string; caption: string; type:string,param:obj}){
            let param = tools.isNotEmpty(bindBtn.param) ? bindBtn.param : {};
            let address = tools.url.addObj(`/inventoryrfid/getdata/${bindBtn.itemid}/${bindBtn.elementid}`, param);

         this.bindBarTime = setInterval(()=>{
             BwRule.Ajax.fetch(BW.CONF.siteAppVerUrl + address,{
                 type: 'post',
                 data: {
                     info: bindBtn.type === '0' ? {
                         epc: this.ftable.data.filter(data => !!data).map(res => res.epc)
                     } : {
                         sku: this.skuEl.value,
                         epc: this.ftable.data.filter(data => !!data).map(res => res.epc)
                     }
                 }
             }).then(({response})=>{

                   if(tools.isNotEmpty(response.body.bodyList)){
                       let data = response.body.bodyList;
                       console.log(data);
                       for(let i = 0;i<data.length;i++){;
                           data[i].forEach((val)=>{

                               this.bingCell[val.calcField].innerHTML = val.calcValue + "";
                           })
                       }
                   }else {
                       clearInterval(this.bindtimer);
                   }
             })

         },1009)

        }
        public senData(bindBtn: { itemid: string; elementid: string; caption: string; type:string,param:obj}){
              //监听表格的动态

            let param = tools.isNotEmpty(bindBtn.param) ? bindBtn.param : {};
                let address = tools.url.addObj(`/inventoryrfid/getdata/${bindBtn.itemid}/${bindBtn.elementid}`, param);
                BwRule.Ajax.fetch(BW.CONF.siteAppVerUrl + address, {
                    type: 'post',
                    data: {
                        info: bindBtn.type === '0' ? {
                            epc: this.ftable.data.filter(data => !!data).map(res => res.epc)
                        } : {
                            sku: this.skuEl.value,
                            epc: this.ftable.data.filter(data => !!data).map(res => res.epc)
                        }
                    }
                }).then(({response}) => {

                })

        }


}