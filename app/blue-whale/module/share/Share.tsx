/// <amd-module name="Share"/>
import d = G.d;
import Shell = G.Shell;
import {Button, IButton} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import Ajax = G.Ajax;
interface ISharePara {
    onClose? : Function
    strArr? : string[]
    md5? : string
}
export class Graffiti {
    private share : Share;
    constructor(para? : string[]){
        d.append(document.body, this.graffitiBtn());
        d.on(this._graffitiBtnEl, 'click', () => {
            this.hideBtn();
            setTimeout(() => {
                this.getEditImg(para);
            });
        });
    }

    private getEditImg(para : string[]){
        let even = G.tools.pattern.debounce((e) => {
            if(!this.share){
                this.share = new Share({
                    strArr : para ? para : ['weChat', 'mail', 'downLoad', 'print'],
                    md5 : e.data,
                    onClose : () => {
                        this.showBtn();
                    }
                });
            }else {
                this.hideBtn();
                this.share.show();
                this.share.setImg(e.data);
            }
        },1000);
       Shell.base.getEditImg(null, null, even);
    }

    private _graffitiBtnEl : HTMLElement;
    private graffitiBtn(){
        if(!this._graffitiBtnEl){
            this._graffitiBtnEl = <div className="graffiti-btn">
                <span className="appcommon app-tuya">
                </span>
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
    private btnArr : IButton[] = [];
    private p : ISharePara;
    constructor(para : ISharePara){
        this.p = para;
        d.append(document.body,  this.wrapperInit());
        this.initBtn();
        this.setImg(para.md5);
        this.setBtn();
        this.evenInit();
    }

    private initBtn(){
        let btnPush = (icon : string, className : string, content : string, onClick : Function) => {
            this.btnArr.push({icon , className, content, onClick : () => onClick()});
        };
        this.p.strArr.forEach(str => {
            switch (str) {
                case 'weChat':
                    btnPush('app-weixin', 'bg-green', '微信转发', () => {
                        Shell.base.wxShare(this._img.src);
                    });
                    break;
                case 'mail':
                    btnPush('app-youjian', 'bg-blue', '邮件转发', () => {
                        Ajax.fetch('', {
                            type : 'get'
                        }).then(({response}) => {
                            BW.sys.window.open({
                                url : ''
                            });
                        });

                    });
                    break;
                case 'downLoad':
                    btnPush('app-xiazaidaobendi', 'bg-grey', '下载至本地', () => {

                    });
                    break;
                case 'print':
                    btnPush('app-dayin', 'bg-orange', '打印', () => {

                    });
                    break;
            }
        });
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
    }

    setBtn(){
        this.btnArr.forEach(obj => {
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

    private evenInit(){
        let even =  G.tools.pattern.debounce(() => {
            this.hide();
            Shell.base.getEditImg(null, this._img.src, (result) => {
                this.show();
                this.setImg(result.data)
            });
        },1000);

        d.on(this._edit, 'click', even);

        d.on(this._img, 'click', () => {
            this._header.classList.toggle('share-hide');
            this._body.classList.toggle('share-hide');
        });

        d.on(this._cancel, 'click', () => {
            this.hide();
            this.callBack();
        })
    }


    hide(){
        this._wrapper.classList.add('hide');
    }

    show(){
        this._wrapper.classList.remove('hide');
    }

    callBack(){
        G.tools.isFunction(this.p.onClose) && this.p.onClose();
    }
}

