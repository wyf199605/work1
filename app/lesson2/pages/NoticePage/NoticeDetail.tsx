///<reference path="../../../blue-whale/pages/pick/indexedPage.ts"/>
/// <amd-module name="NoticeDetail"/>
import SPAPage = G.SPAPage;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {DataManager} from "../../../global/components/DataManager/DataManager";
import d = G.d;
import {LeRule} from "../../common/rule/LeRule";
import {Loading} from "../../../global/components/ui/loading/loading";

export class NoticeDetail extends Component{

    protected wrapperInit(para: IComponentPara): HTMLFormElement {

        return <div class="notice-dt-rg">
            <div class="notice-detail-title"/>
            <div class="notice-detail-content"/>
        </div>;
    }

    constructor(para){
        super(para);
        let id= G.tools.url.getPara('id', location.hash);
        setTimeout(()=>{
            let s = new Loading ({
                container:this.wrapper.parentElement,
                duration:3
            })
            this.load(id);
        },20)

    }
    public load (id:string){
        let detail: HTMLElement,
        title = d.query('.notice-detail-title', this.wrapper.parentElement),
        content = d.query('.notice-detail-content', this.wrapper.parentElement);
        title.innerHTML = "";
        content.innerHTML= "";
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.noticeDetail + `?id=${id}`,{
            loading:{
                container:this.wrapper.parentElement
            }
        }).then(({response})=>{
            let data = response.data.data;
            console.log(data)
            if(data[0]){
                data.forEach((value)=>{
                    title.innerHTML = value.TITLE;
                    content.innerHTML= value.CONTENT;
                })
            }
        })

    }
}