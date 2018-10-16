/// <amd-module name="MainPageSideBar"/>

import {IMenuPara, Menu} from "../../../global/components/navigation/menu/Menu";
import SPA = G.SPA;
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {LeRule} from "../../common/rule/LeRule";
import {MainPage} from "./MainPage";
import {Modal} from "../../../global/components/feedback/modal/Modal";
interface IMainPageSideBarPara extends IComponentPara{
    mainPage: MainPage;
}
export class MainPageSideBar extends Component {
    private menu:Menu;
    private mainPage: MainPage;
    protected wrapperInit(): HTMLElement {
        return <div className="side-bar"></div>;
    }

    constructor(para: IMainPageSideBarPara) {
        super(para);
        this.mainPage = para.mainPage;

        this.menu = new Menu({
            container: this.wrapper,
            isVirtual: true,
            isLeaf: false,
            expand: true,
            expandIconArr: ['seclesson-youjiantou', 'seclesson-xiala'],
            expandIconPre: 'sec',
            ajax: (node) => {
                let url = '',
                    menu =  node.content;
                if (tools.isNotEmpty(menu)) {
                    let path = menu && menu.menuPath;
                    if(path){
                        url = LE.CONF.siteUrl + path.dataAddr + '?output=json';
                    }
                } else {
                    url = LE.CONF.ajaxUrl.menu;
                }
                if(url){
                    return LeRule.Ajax.fetch(url).then(({response}) => {
                        let children = [],
                            elements = tools.keysVal(response, 'body', 'elements');
                        Array.isArray(elements) && elements.forEach(item => {
                            children.push(obj2NodeItem(item, node.deep + 1));
                        });
                        return children;
                    }).catch((e) => {
                        console.log(e)
                    })
                }else {
                    return Promise.reject('menuPath参数为空')
                }

            }
        });
        this.menu.onOpen = (node) => {

            let menu = node.content,
                menuType = menu.menuType,
                menuPath = menu.menuPath;
            if (menuType === 1) {
                SPA.open(hashGet(menuPath));

            }else if(menuType === 0 && node.deep === 2) {
                let url = LE.CONF.siteUrl + menuPath.dataAddr + '?output=json';
                LeRule.Ajax.fetch(url).then(({response}) => {

                    let elements = tools.keysVal(response, 'body', 'elements') || [];
                    if(tools.isEmpty(elements)) {
                        Modal.alert('此菜单下页面为空');
                        return;
                    }
                    this.mainPage.tabsRender(elements.map(element => {
                        return {title: element.menuName, hash: hashGet(element.menuPath, true)}
                    }), response.caption);

                })
            }

            function hashGet(menuPath:obj, inTab = false) {
                let isCustom = menuPath.type === 'custom',
                    para = {
                        inTab: inTab,
                        url: isCustom ? null : menuPath.dataAddr
                    };

                if(menuPath.type === 'custom') {
                    return SPA.hashCreate('lesson2', menuPath.dataAddr, para)
                }else {
                    return SPA.hashCreate('lesson2', 'common', para)
                }
            }
        };
    }

    destroy(){
        super.destroy();
        this.menu.destroy();
        this.menu = null;
        this.mainPage = null;
    }
}
function obj2NodeItem(ele: obj, deep: number): IMenuPara {
    return {
        text: ele.menuName,
        icon: tools.isNotEmpty(ele.menuIcon) ? ele.menuIcon : 'icon',
        isLeaf: deep === 2 || ele.menuType !== 0,
        content: ele || {}
    };
}