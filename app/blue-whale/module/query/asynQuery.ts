/// <amd-module name="AsynQuery"/>
import d = G.d;
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {SlideUp} from "../../../global/components/view/slideUp/SlideUp";
import {Loading} from "../../../global/components/ui/loading/loading";
import {Modal} from "../../../global/components/feedback/modal/Modal";
interface AsynQueryPara{
    createTime : string
    queryStr : string[]
    taskId : string
    tableModule : any
    taskState : string
}
interface QueryDataPara{
    qm : obj,
    query ,
    container : HTMLElement,
    asynData : AsynQueryPara[]
}
export class AsynQuery {
    private para;
    private loading : Loading;
    private query = [];
    constructor (para : QueryDataPara){
        this.para = para;
        console.log(para,'asyn');
        this.init();
    }
    init(){
        let asynData = this.para.asynData,
            body = d.create(`<ul class="asyn-ul"></ul>`);

        asynData.forEach(obj => {
            this.liTpl(obj, body);
        });
        new SlideUp({
            container : this.para.dom? this.para.dom : document.body,
            contentEl : body,
            contentTitle : '查询记录',
            width : 305,
            isShow : true,
            className : 'asynQuery'
        });
    }

    liTpl(data : AsynQueryPara, body){
        let state : string, isDisabled = false, query;
        switch (data.taskState){
            case '0':
                state = '查看';
                break;
            case '1':
                state = '查询失败';
                isDisabled = true;
                break;
            case '2':
                state = '正在查询';
                isDisabled = true;
                break;
        }
        let li = d.create(`<li class="asyn-li">
            <div class="asyn-left">
                <div class="asyn-time">时间：${data.createTime}</div>
            </div>
            <div class="asyn-right">
               
            </div>       
        </li>`);
        body.appendChild(li);

        let btn = new Button({
            container : d.query('.asyn-left', li),
            type : 'link',
            icon : 'history-record',
            onClick : () => {
                // 隐藏其他查询框
                tools.isMb && this.para.query.hide();
                for(let item in this.query){
                    if(item !== data.taskId){
                        this.query[item].hide();
                    }
                }
                if(data.taskId in this.query){
                    this.query[data.taskId].show();
                    return;
                }
                // 生成查询
                let queryModuleName = BW.sys.isMb ? 'QueryModuleMb' : 'QueryModulePc',
                    qm = this.para.qm;

                qm.setting.setContent = JSON.stringify(data.queryStr);
                require([queryModuleName], Query => {
                    this.query[data.taskId] = new Query({
                        qm: qm,
                        refresher: () => {},
                        cols: [],
                        url: null,
                        container: this.para.container,
                        tableGet: () => null
                    });

                    let modal:Modal =  this.query[data.taskId].modal;
                   if(tools.isMb){
                       d.query('.mbPage-body', modal.bodyWrapper).classList.add('disabled');
                       d.query('.mbPage-right', modal.bodyWrapper).classList.add('disabled');
                   }else {
                       d.query('.tab-content', modal.bodyWrapper).classList.add('disabled');
                       d.query('h1', modal.modalHeader.wrapper).innerHTML = '时间：' + data.createTime;
                       modal.modalFooter.wrapper.classList.add('hide');
                   }
                });
            }
        });
        btn.getDom().title = '查看记录';

        new Button({
            content : state,
            container : d.query('.asyn-right', li),
            type : 'primary',
            isDisabled : isDisabled,
            onClick : () => {
                // if(!this.loading){
                //     this.loading = new Loading({});
                // }else {
                //     this.loading.show()
                // }
                this.para.query.para.refresher({
                    taskId : data.taskId
                },()=>{
                    // this.loading.hide();
                });
                this.para.query.hide();
                for(let item in this.query){
                    this.query[item].hide();
                }
            }
        });
    }

}
