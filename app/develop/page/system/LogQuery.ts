/// <amd-module name="LogQuery"/>
import SPAPage = G.SPAPage;
import d = G.d;
export class LogQuery extends SPAPage{
    set title(title:string){
        this._title = title;
    }
    get title(){
        return this._title;
    }
    protected wrapperInit(): Node {
        return d.create(`<div class="log-query"></div>`);
    }

    protected init(para: Primitive[], data?) {
        this.title = "日志查询";
    }
}