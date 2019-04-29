/// <amd-module name="AuthorityConfigPage"/>

import SPAPage = G.SPAPage;
import d = G.d;
// import {PrivilegeControl} from "../../../blue-whale/module/privilege/privilegeControl";

export class AuthorityConfigPage extends SPAPage{

    set title(title:string){
        this._title = title;
    }
    get title(){
        return this._title;
    }
    protected wrapperInit(): Node {
        return d.create('<div class="authorityConfigPage" data-src="http://127.0.0.1?uiTypeTest=privilegeConfigure"></div>');
    }

    protected init(para: Primitive[], data?) {
        this.title = "权限配置";
        this.wrapper.dataset.src = "http://127.0.0.1?uiTypeTest=privilegeConfigure";
        // new PrivilegeControl({
        //     dom:d.query('.authorityConfigPage',this.wrapper),
        //     url:'http://bwd.fastlion.cn:7776/sf/app_sanfu_retail/v1/inter/dp/priv-1/privsget',
        //     controllUrl:'http://bwd.fastlion.cn:7776/sf/app_sanfu_retail/v1/inter/dp/priv-1/privsget?deal_type=insert'
        // })
    }
}