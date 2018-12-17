/// <amd-module name="Share"/>
import d = G.d;
import Shell = G.Shell;

interface ISharePara {
    data : string
    onClose : () => void
}

export class Graffiti {
    private image : string;
    private share : Share;
    constructor(){
        d.append(document.body, this.header());
        d.append(document.body, this.graffitiBtn());
        this.evenInit();
    }

    private evenInit(){
        d.on(this._graffitiBtnEl, 'click', () => {
            this.image = null;
            this._graffitiBtnEl.classList.add('hide');
            this.getEditImg(null, '');
        });

        d.on(this._back, 'click', () => {
            this.getEditImg(0, this.image)
        });

        d.on(this._share, "click", () => {
            if(!this.share){
                this.share = new Share({
                    data : this.image,
                    onClose : () => {
                        this._graffitiBtnEl.classList.remove('hide');
                    }
                });
            }else {
                this.share.show(this.image);
            }
        });
    }

    private getEditImg(type : number, img : string){
        Shell.base.getEditImg(type,img, (result) => {
            this.image = result.data;
            this._header.classList.remove('hide');

        })
    }

    private _header : HTMLElement;
    private _back : HTMLElement;
    private _share : HTMLElement;
    private header(){
        if(!this._header){
            this._header = <div className="graffiti-header hide">
                {this._back = <div className="graffiti-back">返回</div>}
                {this._share = <div className="graffiti-share">···</div>}
            </div>
        }
        return this._header;
    }

    private _graffitiBtnEl : HTMLElement;
    private graffitiBtn(){
        if(!this._graffitiBtnEl){
            this._graffitiBtnEl = <div className="graffiti-btn">
                <span className="iconfont icon-app-tuya"></span>
            </div>
        }
        return this._graffitiBtnEl;
    }
}

export class Share {
    constructor(para : ISharePara){

    }

    private tpl(){
        return <div className="share-container">

            <div class="share-background"></div>
            <div class="share-body">

            </div>
        </div>
    }

    show(data : string){

    }

    hide(){

    }
}

