/// <amd-module name="NoticePage"/>
import SPAPage = G.SPAPage;
import {NoticeList} from "./NoticeList";
import {NoticeDetail} from "./NoticeDetail";

 export  class NoticePage extends SPAPage{

    protected init(para: obj, data?) {
    }


    protected list: NoticeList;
    protected detail: NoticeDetail;
    protected wrapperInit(): Node {
        return  <div class="notice-page">
            {this.list = <NoticeList onChange={(id:string)=>{
               this.detail.load(id);
             }
            }/>}
            {this.detail = <NoticeDetail/>}
        </div>;
    }


     set title(str: string) {
     }

     get title(){
        return
     }

}