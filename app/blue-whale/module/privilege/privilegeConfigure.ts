/// <amd-module name="PrivilegeConfigure"/>

import CONF = BW.CONF;
import d = G.d;
import tools = G.tools;
import BasicPage from "../../pages/basicPage";
import {PrivilegeDefault} from "./privilegeDefault";
import {PrivilegePersonal} from "./privilegePersonal";

export class PrivilegeConfigure extends BasicPage {

    /**
     * 【权限配置模块】
     * */
    private privilegeDefault: PrivilegeDefault;//用于构造缺省权限页面
    private privilegePersonal: PrivilegePersonal;//用于构造个性权限页面
    protected url: string;  //权限配置模块通用url
    protected dpConfMenuDom: HTMLElement;//顶部【缺省/个性权限配置】切换栏容器


    private ajaxUrl: string;
    private controllUrl: string;

    constructor(private para) {
        super(para);
        this.ajaxUrl = para.url;
        this.controllUrl = para.controllUrl;
        this.url = tools.isNotEmpty(para.url) ? para.url : CONF.ajaxUrl.rmprivsSelect;
        this.generate();
    }

    /**
     * 构建主页面
     * */
    private generate() {

        // 生成顶部【缺省/个性权限配置】切换栏和装载容器
        this.dpConfMenuDom = d.create(`<ul class="df-conf-menu"></ul>`);
        //【缺省权限配置】的装载容器
        let defaultContentDom = d.create(`<div class="default-content"></div>`);
        //【个性权限配置】的装载容器
        let personalContentDom = d.create(`<div class="personal-content"></div>`);
        let dpConfContentDom = d.create(`<div class="df-conf-content"></div>`),
            defaultLi = d.create(`<li>缺省权限配置</li>`),
            personalLi = d.create(`<li>个性权限配置</li>`);


        //装载容器
        this.dpConfMenuDom.appendChild(defaultLi);
        this.dpConfMenuDom.appendChild(personalLi);
        dpConfContentDom.appendChild(defaultContentDom);
        dpConfContentDom.appendChild(personalContentDom);
        this.para.container.appendChild(this.dpConfMenuDom);
        this.para.container.appendChild(dpConfContentDom);

        //【缺省/个性权限配置】切换，默认显示为缺省权限配置页面
        personalContentDom.style.display = 'none';
        defaultLi.classList.add('li-select');
        this.privilegeDefault = tools.isNotEmpty(this.ajaxUrl) ? new PrivilegeDefault(defaultContentDom, this.url) : new PrivilegeDefault(defaultContentDom);


        d.on(defaultLi, 'click', () => {
            personalLi.classList.remove('li-select');
            defaultLi.classList.add('li-select');
            personalContentDom.style.display = 'none';
            defaultContentDom.style.display = 'block';
        });
        d.on(personalLi, 'click', () => {
            if (!this.privilegePersonal) {
                this.privilegePersonal = tools.isNotEmpty(this.ajaxUrl) ? new PrivilegePersonal(personalContentDom, this.url,this.controllUrl) : new PrivilegePersonal(personalContentDom);
            }
            defaultLi.classList.remove('li-select');
            personalLi.classList.add('li-select');
            defaultContentDom.style.display = 'none';
            personalContentDom.style.display = 'block';
        });
    }
}
