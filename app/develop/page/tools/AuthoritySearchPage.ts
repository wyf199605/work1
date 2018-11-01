/// <amd-module name="AuthoritySearchPage"/>

import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import {PrivilegeControl} from "../../../blue-whale/module/privilege/privilegeControl";
import {DVAjax} from "../../module/util/DVAjax";

export class AuthoritySearchPage extends SPAPage {

    set title(title: string) {
        this._title = title;
    }

    get title() {
        return this._title;
    }

    protected wrapperInit(): Node {
        return d.create('<div class="authoritySearchPage" data-src="http://127.0.0.1?uiTypeTest=privilegeSearch"></div>');
    }

    protected init(para: Primitive[], data?) {
        this.title = "权限查询";
        this.wrapper.dataset.src = "http://127.0.0.1?uiTypeTest=privilegeSearch";
        let url = tools.url.addObj('http://bwd.fastlion.cn:7776/sf/app_sanfu_retail/v1/sso', {
            userid: localStorage.getItem('userId'),
            forwardurl: tools.url.addObj('ui/pick/n1174_data-4/pick-4', {isMb: true, output: 'json'})
        });
        DVAjax.Ajax.fetch(url).then(({response})=>{
            let body = response.body;
            if (tools.isNotEmpty(body)){
                let dataAddr = body.elements[0].dataAddr.dataAddr,pick = dataAddr.split('/'),urlStrem = '';
                for (let i = 3;i<pick.length;i++){
                    if (i === 3){
                        urlStrem = urlStrem +  pick[i];
                    }else{
                        urlStrem = urlStrem + '/'+ pick[i];
                    }
                }
                dataAddr = tools.url.addObj('/app_sanfu_retail/v1/sso', {
                    userid: localStorage.getItem('userId'),
                    forwardurl: urlStrem
                });
                body.elements[0].dataAddr.dataAddr = dataAddr;
                localStorage.setItem('authority_search_elements',JSON.stringify(response.body.elements[0]));
            }
        });
        new PrivilegeControl({
            dom: d.query('.authoritySearchPage', this.wrapper),
            url: 'http://bwd.fastlion.cn:7776/sf/app_sanfu_retail/v1/inter/dp/priv-1/privsget',
            iurl:'./tpl.html'
        })
    }
}