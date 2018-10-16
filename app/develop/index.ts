/// <amd-module name="DevelopApp"/>
import SPA = G.SPA;
import ISPARouter = G.ISPARouter;
import {MainPage} from "./page/main/MainPage";
import {HomePage} from "./page/home/HomePage";
import {MenuDesignPage} from "./page/design/MenuDesignPage";
import {QueryDevicePage} from "./page/design/QueryDevicePage";
import {FieldEditorPage} from "./page/tools/FieldEditorPage";
import SPATab = G.SPATab;
import d = G.d;
import {PageDesignPage} from "./page/design/PageDesignPage";
import {VarDesignPage} from "./page/design/VarDesignPage";
import {ElementDesignPage} from "./page/design/ElementDesignPage";
import {MenuDevelopPage} from "./page/design/MenuDevelopPage";
import {LoginPage} from "./page/login/LoginPage";
import {AppPackaging} from "./page/pubish/AppPackaging";
import {AppPublish} from "./page/pubish/AppPublish";
import {CondDesignPage} from "./page/design/CondDesignPage";
import {AuthorityConfigPage} from "./page/tools/AuthorityConfigPage";
import {AuthoritySearchPage} from "./page/tools/AuthoritySearchPage";

let developRouter: ISPARouter = {
    main: MainPage,
    home: HomePage,
    menuDesign: MenuDesignPage,
    queryDevice: QueryDevicePage,
    elementDesign: ElementDesignPage,
    fieldEditor: FieldEditorPage,
    pageDesign: PageDesignPage,
    varDesign: VarDesignPage,
    menuDevelop: MenuDevelopPage,
    appPublish:AppPublish,
    appPackaging:AppPackaging,
    condDesign:CondDesignPage,
    authorityConfig:AuthorityConfigPage,
    authoritySearch:AuthoritySearchPage
};


export function init() {
    SPA.init([
        {   // 第一个单页应用
            name: 'loginReg', // 登录注册
            container: 'body',
            max: 1, // 最大页面 默认10
            router: { // 路由配置
                login: LoginPage
            },
            defaultRouter: { // 默认打开
                login: null,
            }
        },
        {
            name: 'develop', // 单页应用的名称
            container: '#body',
            router: developRouter, // 路由配置
            main: {
                router: ['main', []],
                container: '.dev-main',
            },
            defaultRouter: {
                home: null
            },
            // index0: routerName, index1: router's para
            max: 9, // 最大页面 默认10
            // isLocalHistory?: boolean;
            tab: {
                container: d.query('.dev-tab'),
                TabClass: DVTab
            }
        }]);
}

class DVTab extends SPATab {
    protected wrapperInit(): HTMLElement {
        return d.create("<div class='dev-tab'></div>");
    }

    protected itemCreate(): HTMLElement {
        return d.create(`<div data-role="item">
            <span data-role="title"></span>
            <span data-role="close" class="dev de-guanbi"></span>
        </div>`);
    }

}