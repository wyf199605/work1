/// <amd-module name="PrivilegeControl"/>
import {PrivilegeConfigure} from "./privilegeConfigure";
import d = G.d;

import {PrivilegeQuery} from "blue-whale/module/privilege/privilegeQuery";

export class PrivilegeControl {
    private container: HTMLElement;
    private url: string;
    private iurl: string;

    constructor(para) {
        this.container = para.dom;
        this.url = d.closest(this.container, '[data-src]').dataset.src;
        this.initPage(para);
    }


    //根据url参数生成不同页面
    initPage(para) {
        let self = this,
            urlPara = G.tools.url.getPara('uiTypeTest', this.url);
        switch (urlPara) {
            //权限组配置页面
            case 'privilegeConfigure':
                new PrivilegeConfigure({
                    container: this.container,//HTMLElement
                    title: '权限配置',
                    dom: self.container,
                    url: para.url,
                    controllUrl: para.controllUrl
                });
                break;
            case 'privilegeSearch':
                new PrivilegeQuery({
                    container: this.container,
                    title: '权限查询',
                    dom: self.container,
                    url: para.url,
                    iurl: para.iurl
                });
                break;
        }
    }
}