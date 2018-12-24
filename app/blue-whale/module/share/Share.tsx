/// <amd-module name="Share"/>
import d = G.d;
import Shell = G.Shell;
import {Button, IButton} from "../../../global/components/general/button/Button";
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import sys = BW.sys;

interface ISharePara {
    onClose? : () => void
    btnArr? : IButton[]
    md5? : string
}
let btnArr = [{
    icon : 'app-weixin',
    className : 'bg-green',
    content : '微信转发',
    onClick : () => {

    }
},{
    icon : 'app-youjian',
    className : 'bg-blue',
    content : '邮件转发',
    onClick : () => {

    }
},{
    icon : 'app-xiazaidaobendi',
    className : 'bg-grey',
    content : '下载至本地',
    onClick : () => {

    }
},{
    icon : 'app-dayin',
    className : 'bg-orange',
    content : '打印',
    onClick : () => {

    }
},];
export class Graffiti {
    private share : Share;
    constructor(){
        d.append(document.body, this.graffitiBtn());
        d.on(this._graffitiBtnEl, 'click', () => {
            this.hideBtn();
            setTimeout(() => {
                this.getEditImg();
            });
        });
    }

    private getEditImg(){
       Shell.base.getEditImg(null, null, (e) => {
           if(!this.share){
               this.share = new Share({
                   btnArr : btnArr,
                   md5 : e.data,
                   onClose : () => {
                       this.showBtn();
                   }
               });
           }else {
               this.share.toggle();
               this.share.setImg(e.data);
           }
       });
        // sys.window.getSignImg(null,null, (e) => {
        //     if(!this.share){
        //         this.share = new Share({
        //                 btnArr : btnArr,
        //                 md5 : e.data,
        //                 onClose : () => {
        //                     this.showBtn();
        //                 }
        //             });
        //         }else {
        //             this.share.toggle();
        //             this.share.setImg(e.data);
        //         }
        // });
    }

    private _graffitiBtnEl : HTMLElement;
    private graffitiBtn(){
        if(!this._graffitiBtnEl){
            this._graffitiBtnEl = <div className="graffiti-btn">
                <span className="appcommon app-tuya"></span>
            </div>
        }
        return this._graffitiBtnEl;
    }

    private showBtn(){
        this._graffitiBtnEl.classList.remove('hide');
    }
    private hideBtn(){
        this._graffitiBtnEl.classList.add('hide');
    }
}

export class Share {
    private _header : HTMLElement;
    private _edit : HTMLElement;
    private _img : HTMLImageElement;
    private _body : HTMLImageElement;
    private _cancel : HTMLElement;
    private _wrapper : HTMLElement;
    constructor(para : ISharePara){
        d.append(document.body,  this.wrapperInit());
        this.setImg(para.md5);
        this.setBtn(para.btnArr);
        this.evenInit(para);
    }

    private wrapperInit(){
        return this._wrapper = <div className="share-container">
            {this._header = <div className="share-header">
                {this._edit = <div className="share-edit">编辑</div>}
                {this._cancel = <div className="share-cancel">取消</div>}
            </div>}
            {this._img = <img src="" alt="" className="share-img"/>}
            {this._body = <div className="share-body">
            </div>}
        </div>
    }


    setImg(md5 : string){
        this._img.src = md5;
        this._img.dataset.md5 = md5;
    }

    setBtn(data : IButton[]){
        data.forEach(obj => {
            let btnEl = <div class="share-btnEl"></div>;
            new Button({
                container : btnEl,
                className : obj.className,
                icon : obj.icon,
                iconPre : 'appcommon',
                onClick : obj.onClick
            });
            d.append(btnEl, <div className="share-text">{obj.content}</div>);
            d.append(this._body, btnEl);
        })
    }

    private evenInit(para : ISharePara){
        d.on(this._edit, 'click', () => {
            Shell.base.getEditImg(null, this._img.dataset.md5, (result) => {
                this.toggle();
                this.setImg(result.data)
            });
            // sys.window.getSignImg(this._img.dataset.md5,null, (result) => {
            //     this.toggle();
            //     this.setImg(result.data)
            // });
        });

        d.on(this._img, 'click', () => {
            this._header.classList.toggle('share-hide');
            this._body.classList.toggle('share-hide');
        });

        d.on(this._cancel, 'click', () => {
            this._wrapper.classList.toggle('hide');
            G.tools.isFunction(para.onClose) && para.onClose();
        })
    }


    toggle(){
        this._wrapper.classList.toggle('hide');
    }
}

