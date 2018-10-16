/// <amd-module name="LoginInfoModule"/>
import d = G.d;
import tools = G.tools;
import SPA = G.SPA;
import {DVAjax} from "../util/DVAjax";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import Component = G.Component;
import IComponentPara = G.IComponentPara;

export interface ILoginInfo extends IComponentPara {
    userName?: string;
    department?: string;
    headerImgUrl?: string;
}

export class LoginInfoModule extends Component implements ILoginInfo {
    protected wrapperInit(loginInfo: ILoginInfo): HTMLElement {
        return d.create(`<div data-loginInfo="loginInfo" class="login-info">
        <div class="item"><img src='../../img/develop/user.png'></div>
        <div class="login-detail"></div>
        <div class="clear"></div>
        </div>`);
    }

    private init(loginInfo: ILoginInfo) {
        // this.department = loginInfo.department;
        // this.userName = loginInfo.userName;
        // this.headerImgUrl = loginInfo.headerImgUrl;
        let detail: HTMLElement = null;
        if (localStorage.getItem('userId')) {
            detail = d.create(`<div>
<div class="item userName">平台部 ${localStorage.getItem('userId')}</div>
<div class="item line"> | </div>
<div class="item logout">退出</div>
</div>`);
        } else {
            detail = d.create(`<div class="item login">登录</div>`)
        }

        d.query('.login-detail', this.wrapper).appendChild(detail);

        d.on(d.query('.logout', this.wrapper), 'click', function (e) {
            DVAjax.logout(function (res) {
                if(res.errorCode === 0){
                    localStorage.removeItem('userId');
                    Modal.toast('退出成功!');
                    SPA.open(SPA.hashCreate('loginReg', 'login'));
                }
            })
        });

        d.on(d.query('.login', this.wrapper), 'click', function (e) {
            SPA.open(SPA.hashCreate('loginReg', 'login'));
        });
    }

    private _department: string;
    set department(department: string) {
        if (tools.isEmpty(department)) {
            department = '';
        }
        this._department = department;
    }

    get department() {
        return this._department;
    }

    private _userName: string;
    set userName(userName: string) {
        if (tools.isEmpty(userName)) {
            userName = '';
        }
        this._userName = userName;
    }

    get userName() {
        return this._userName;
    }

    private _headerImgUrl: string;
    set headerImgUrl(headerImgUrl: string) {
        if (tools.isEmpty(headerImgUrl)) {
            headerImgUrl = '';
        }
        this._headerImgUrl = headerImgUrl;
    }

    get headerImgUrl() {
        return this._headerImgUrl;
    }

    constructor(private loginInfo: ILoginInfo) {
        super(loginInfo);
        if (tools.isEmpty(loginInfo))
            loginInfo = {};
        this.init(loginInfo);
    }

    destroy(){
        super.destroy();
        d.off(this.wrapper);
        d.remove(this.wrapper);
    }
}