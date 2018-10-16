///<amd-module name="CashierPage"/>
import SPA = C.SPA;
import ISPARouter = C.ISPARouter;
import {ConfPage} from "./page/confPage/ConfPage";
import {LoginPage} from "./page/loginPage/LoginPage";
import {RegPage} from "./page/regPage/RegPage";
import {MainPage} from "./page/mainPage/MainPage";
import {KeyModalPage} from "./page/keyModalPage/KeyModalPage";

let cashierRouter : ISPARouter ={
    mainPage : MainPage,
    keyModalPage : KeyModalPage
};

let loginRegRouter : ISPARouter = {
    login: LoginPage,
    reg : RegPage,
    index : ConfPage
};
export function  init(){
    SPA.init([
        {   // 第一个单页应用
            name: 'index', // 登录注册
            main: {
                router: ['index', []],
                container: '#loginReg',
            },
            container: 'body',
            max: 1, // 最大页面 默认10
            router: loginRegRouter,
        },
        {
            name: 'main', //
            router: cashierRouter, // 路由配置
            main: {
                router: ['mainPage', []],
                container: 'body',
            },
            max: 100,
        }
    ]);
}

