/// <amd-module name="MainPage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import {LoginInfoModule} from "../../module/loginInfo/LoginInfoModule";
import {Button} from "global/components/general/button/Button";
import {Menu} from "global/components/navigation/menu/Menu";
import {IMenuPara} from "../../../global/components/navigation/menu/Menu";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import SPA = G.SPA;
import tools = G.tools;


export class MainPage extends SPAPage {
    set title(str: string) {
        this._title = str;
    }

    get title() {
        return this._title;
    }
    protected wrapperInit() {
        return d.create('<div></div>');
    }
    private modules: obj;

    init(para, data) {
        let mainHeaderArray = d.queryAll('[data-name]', d.query('.dev-main'));
        this.modules = {
            menu: <Menu>null,
            quickDevelopButton: <Button>null,
            userInfo: <LoginInfoModule>null,
        };
        mainHeaderArray.forEach((ele) => {
            let dataName = ele.dataset['name'];
            // 左侧菜单
            if (dataName === 'header-menu') {
                let leftMenuData: IMenuPara[] = [
                    {
                        text: '首页',
                        icon: 'dev de-shouye f-font',
                        content: 'home'
                    },
                    {
                        text: '设计',
                        icon: 'dev de-sheji f-font',
                        children: [
                            {
                                text: '页面设计',
                                icon: 'dev de-yemiansheji',
                                content: 'pageDesign'
                            },
                            {
                                text: '元素设计',
                                icon: 'dev de-yuansusheji',
                                content: 'elementDesign'
                            },
                            {
                                text: '变量设计',
                                content: 'varDesign',
                                icon:'dev de-bianliangsheji'
                            },
                            {
                                text:'条件设计',
                                content:'condDesign',
                                icon:'dev de-tiaojiansheji'
                            },
                            {
                                text: '菜单设计',
                                icon: 'dev de-caidansheji',
                                content: 'menuDesign'
                            }
                        ]
                    },
                    {
                        text: '工具',
                        icon: 'dev de-gongju f-font',
                        children: [
                            {
                                text: '权限编辑器',
                                icon: 'dev de-quanxianshezhi',
                                children:[
                                    {
                                        text:'权限配置',
                                        content: 'authorityConfig'
                                    },
                                    {
                                        text:'权限查询',
                                        content:'authoritySearch'
                                    }
                                ]
                            },
                            {
                                text: '字段编辑器',
                                content: 'fieldEditor',
                                icon: 'dev de-ziduanbianjiqi'
                            }
                        ]
                    },
                    {
                        text: '发布管理',
                        icon: 'dev de-fabuguanli f-font',
                        children: [
                            {
                                text: '应用打包',
                                icon: 'dev de-yingyongdabao',
                                content:'appPackaging'
                            },
                            {
                                text: '应用发布',
                                icon: 'dev de-yingyongfabu',
                                content:'appPublish'
                            }
                        ]
                    },
                    // {
                    //     text: '系统管理',
                    //     icon: 'dev de-xitongguanli f-font',
                    //     children: [
                    //         {
                    //             text: '日志查询',
                    //             icon: 'dev de-rizhichaxun'
                    //         }
                    //     ]
                    // }
                ];
                let leftMenu = new Menu({
                    container: ele,
                    children: leftMenuData,
                    expand: true,
                    isOutline: true,
                    isHoverExpand: true,
                });
                let self = this;
                leftMenu.onOpen = function (node) {
                    if (node.content !== undefined) {
                        SPA.open(SPA.hashCreate('develop', node.content));
                    }
                };
                this.modules.menu = leftMenu;
            }
            // 快速开发按钮
            if (dataName === 'quick-develop-btn') {
                let btn = new Button({
                    container: ele,
                    content: '快速开发',
                    onClick: function (event) {
                        let modalBody = d.create(`<div class="modalBody"></div>`);
                        new Button({
                            content: '查询器快速开发',
                            container: modalBody,
                            onClick: (e) => {
                                SPA.open(SPA.hashCreate('develop', 'queryDevice'));
                                modal.destroy();
                            }
                        });
                        new Button({
                            content: '目录开发',
                            container: modalBody,
                            onClick: (e) => {
                                SPA.open(SPA.hashCreate('develop', 'menuDevelop'));
                                modal.destroy();
                            }
                        });
                        let modal = new Modal({
                            body: modalBody,
                            top: 150
                        })
                    },
                    icon: 'de-kuaisukaifa',
                    iconPre: 'dev'
                });
                this.modules.quickDevelopButton = btn;
            }

            //个人信息
            if (dataName === 'user-info') {
                let userInfo = new LoginInfoModule({
                    container: ele,
                    headerImgUrl: '../../img/develop/user.png'
                });
                this.modules.userInfo = userInfo;
            }
        });
        d.query('.dev-main').style.display = 'block';

        SPA.onChange((newHash, oldHash) => {
            if (newHash.routeName === 'authority') {
                let userId = localStorage.getItem('userId');
                if (tools.isEmpty(userId)){
                    SPA.open(SPA.hashCreate('loginReg', 'login'));
                }
            }
        })
    }
    destroy(){
        super.destroy();
        this.modules['menu'].destroy();
        this.modules['quickDevelopButton'].destroy();
        this.modules['userInfo'].destroy();
        this.modules = null;
    }
}