/// <amd-module name="NoticeList"/>
import SPAPage = G.SPAPage;
import {DataManager} from "../../../global/components/DataManager/DataManager";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {LeRule} from "../../common/rule/LeRule";
import d = G.d;

interface INoticeListPara extends IComponentPara{
   onChange?:Function
}
export class NoticeList extends Component{

    protected wrapperInit(para: IComponentPara): HTMLFormElement {
        return <div class="notice-li-lf">
            <div class="notice-li-title">公告</div>
            <div class="notice-list">
                <div>公告</div>
            </div>
            <div class="notice-paging"></div>
        </div>;
    }

    protected dataManage: DataManager;
    protected AjaxData;
    constructor(para: INoticeListPara){
        super(para);
        this.getJava().then((val)=>{
            this.AjaxData = val;
            console.log(this.AjaxData );

            let paging = d.query('.notice-paging',this.wrapper);
            console.log(this.AjaxData );
            this.dataManage = new DataManager({
                data:this.AjaxData,
                page:{
                    size: 7,
                    options: [7, 14],
                    container: paging
                },

                render:(start,length,isRefresh)=>{
                    let data: obj[] = this.dataManage.data.slice(start, length + start);
                    this.dataList(data,true,para.onChange);

                }
            })
        });



    }
    private getJava(){
        return new Promise((resolve, reject)=>{
            LeRule.Ajax.fetch(LE.CONF.ajaxUrl.noticeList).then(({response})=>{
                if((response.data.data)){
                    resolve(response.data.data) ;
                }
            })
        })


    }


    private  dataList (data: obj[], refresh:boolean,fun:Function) {
        let list = d.query('.notice-list',this.wrapper);
        if(refresh){
            list.innerHTML = "";
        }
        let datawrapp = <ul>{

            data.map((value, index)=>
            {
               return   <li data-role={value.ID}><p>{value.TITLE}</p><p>{value.ACTIME}</p></li>
            })
        }</ul>
        if(datawrapp){
            let lis= d.queryAll('li',datawrapp);
             lis.forEach((value, index)=>{
                 d.on(value,'click',()=>{
                     fun(value.dataset.role)
                 })
             })
        }
        d.append(list,datawrapp);
    }



}