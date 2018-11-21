///<amd-module name="SideBarMrg"/>
import tools = G.tools;
import sys = BW.sys;
import CONF = BW.CONF;
import {BwRule} from "../../common/rule/BwRule";
import d = G.d;
import sysPcHistory = BW.sysPcHistory;
import {DragDeform} from "../../../global/components/ui/dragDeform/dragDeform";
import {IMenuPara, Menu} from "../../../global/components/navigation/menu/Menu";
import {Tree} from "../../../global/components/navigation/tree/Tree";

interface SideBarMrgPara {
    menu: HTMLUListElement; // 导航菜单dom
    shortMenu: HTMLUListElement; // 最近收藏dom
    favUrl: string; // 收藏ajax地址
    recentUrl: string; // 最近ajax地址
    menuUrl: string; //菜单加载地址
    onClick?: () => void,
    onLoaded?: () => void,
}

export default class SideBarMrg {
    private menu: Menu = null;
    private favRecTree: Menu = null;

    constructor(private para: SideBarMrgPara) {
        this.initMainNavMenu();
        this.initFavRecent();

        // if (!~location.href.indexOf('bw.sanfu.com')) {
        //     this.initTestMenu();
        // }

        setTimeout(() => {
            //拉拽
            new DragDeform({
                dragDom: d.query('#sidebar'),
                border: ['right'],
                minWidth: 190,
                maxWidth: 290
            });

            //关于蓝鲸
            d.on(d.query('#msgVersion'), 'click', '.button-o', function () {
                sys.window.open({url: CONF.url.msgVersion});
            });
        }, 10);
    }

    private openWindow = (url: string, title: string) => {
        if (sysPcHistory.indexOf(url) >= 0) {
            sys.window.refresh(url);
        }
        sys.window.open({url, title})
    };

    // 测试节点初始化
    // private initTestMenu() {
    //     let container = d.query('#customNavMenu');
    //     if (!container) {
    //         return;
    //     }
    //     let menu = new Menu({
    //         container: container,
    //         isAccordion: true,
    //         expand: true,
    //         children: [{
    //             text: '流程引擎',
    //             icon: 'fa fa-briefcase',
    //             children: [{
    //                 text: '请假表单',
    //                 icon: 'ti-pencil-alt red',
    //                 content: CONF.url.processLeave
    //             }, {
    //                 text: '待签核表单列表',
    //                 icon: 'ti-pencil-alt red',
    //                 content: CONF.url.processAuditList
    //             }, {
    //                 text: '追寻表单列表',
    //                 icon: 'ti-pencil-alt red',
    //                 content: CONF.url.processSeekList
    //
    //             }]
    //         }, {
    //             text: 'SQL监控',
    //             icon: 'fa fa-briefcase',
    //             content: CONF.url.sqlMonitor
    //         },
    //         //     {
    //         //     text: '权限控制',
    //         //     icon: 'fa fa-briefcase',
    //         //     children: [{
    //         //         text: '权限配置',
    //         //         icon: 'ti-pencil-alt red',
    //         //         content: CONF.url.privilegeConfigure
    //         //     }, {
    //         //         text: '权限查询',
    //         //         icon: 'ti-package',
    //         //         content: CONF.url.privilegeSearch
    //         //     }]
    //         //
    //         // }
    //         ]
    //     });
    //
    //     menu.onOpen = (node) => {
    //         if (node.isLeaf && node.content) {
    //             this.openWindow(node.content, node.text);
    //         }
    //     }
    // }

    /**
     * 初始化主要菜单
     */
    private initMainNavMenu() {
        let firstLoadSpinner = SideBarMrg.loadTpl();
        d.append(this.para.menu, firstLoadSpinner);


        this.menu = new Menu({
            expand: true,
            container: this.para.menu,
            isAccordion: true,
            content: this.para.menuUrl,
            isLeaf: false,
            // isShowCheckBox: true,
            ajax: (node): Promise<any> => {
                let content = node.content,
                    url = typeof content === 'string' ? content : (CONF.siteUrl + BwRule.reqAddr(node.content.menuPath));

                return Promise.resolve(BwRule.Ajax.fetch(url, {
                    data: {output: 'json'}
                }).then(({response}) => {

                    if (firstLoadSpinner) {
                        d.remove(firstLoadSpinner);
                        firstLoadSpinner = null;
                    }

                    return this.convertToTreePara(response);
                }))
            }
        });

        this.menu.onOpen = tools.pattern.throttling((node) => {
            if (node.isLeaf) {
                let addr = <R_ReqAddr>node.content.menuPath;
                if (addr) {
                    let url = CONF.siteUrl + BwRule.reqAddr(addr);
                    this.openWindow(url, node.content.menuName)
                }
            }
        }, 300);
    }

    /**
     * 初始化最近与收藏
     */
    private initFavRecent() {
        this.favRecTree = new Menu({
            text: 'virtualNode',
            container: this.para.shortMenu,
            isAccordion: true,
            expand: true,
            children: [{
                text: '最近',
                icon: 'ti-time',
                isLeaf: false,
                ajax: () => {
                    return this.recFavMenuGet('recent');
                }

            }, {
                text: '收藏',
                icon: 'ti-save',
                isLeaf: false,
                ajax: () => {
                    // debugger;
                    return this.recFavMenuGet('fav');
                }
            }]
        });

        this.favRecTree.onOpen = (node => {
            if (node.isLeaf) {
                this.openWindow(CONF.siteUrl + node.content.url, node.content.caption);
            }
        })
    }

    /**
     * 最近收藏ajax
     * @param {"fav" | "recent"} type
     */
    private recFavMenuGet(type: 'fav' | 'recent') {
        let isFav = type === 'fav';

        return BwRule.Ajax.fetch(this.para[isFav ? 'favUrl' : 'recentUrl'], {
            data: {action: 'query'}
        }).then(({response}) => {
            // debugger;
            let data = response.data,
                treePara: IMenuPara[] = [];

            if (!Array.isArray(data)) {
                return;
            }

            if (isFav) {
                data.forEach(tag => {
                    let tagChild: IMenuPara = {
                        text: tag.tag || '默认分组',
                        expand: true,
                        icon: 'ti-folder',
                        ajax: false
                    };
                    if (Array.isArray(tag.favs)) {
                        tagChild.children = tag.favs.map(item => item2para(item))
                    }
                    treePara.push(tagChild)
                })
            } else {
                treePara = Array.isArray(data) ? data.map((item) => item2para(item)) : [];
            }
            return treePara;

        }).catch(() => {
            return null
        });

        function item2para(item: obj): IMenuPara {
            return {
                text: item.caption,
                icon: item.icon,
                content: item,
                isLeaf: true,
                ajax: false
            }
        }
    }

    /**
     * 后台对象转为菜单控件参数
     * @param {obj} response
     * @returns {IMenuPara[]}
     */
    private convertToTreePara(response: obj): IMenuPara[] {
        let elements = response.body.elements;
        if (tools.isEmpty(elements)) {
            return null;
        }
        return elements.map(menuData => {
            return <IMenuPara>{
                text: menuData.menuName,
                icon: G.tools.str.removeEmpty(menuData.menuIcon),
                // children: menuData.menuType ? undefined : [],
                isLeaf: !!menuData.menuType,
                content: menuData,

            }
        });
    }

    private initTree(child: Array<any>) {

    }

    static loadTpl = () => {
        return d.create('<div class="loadSpinner"><span class="spinner"></span><span class="loadTitle">加载中....</span></div>')
    };
}