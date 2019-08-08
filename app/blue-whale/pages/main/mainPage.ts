///<amd-module name="mainPage"/>
import SideBarMrg from "sideBar";
import tools = G.tools;
import sys = BW.sys;
import CONF = BW.CONF;
import localMsg = G.localMsg;
import d = G.d;
import { Modal } from 'global/components/feedback/modal/Modal';
import { User } from "../../../global/entity/User";
import { Device } from "../../../global/entity/Device";
import { Search } from "../../module/search/search";
import { SearchInput } from "../../../global/components/form/searchInput/searchInput";
import { Loading } from "../../../global/components/ui/loading/loading";
import { BwRule } from "../../common/rule/BwRule";
import { IPopoverItemPara, Popover } from "../../../global/components/ui/popover/popover";
import { BugReportModal } from "../../module/BugReport/BugReport";
import sysPcHistory = BW.sysPcHistory;
import { Spinner } from "../../../global/components/ui/spinner/spinner";
import { Notify } from "../../../global/components/feedback/notify/Notify";
import { RfidConfig } from "../../module/rfid/RfidConfig";
import Shell = G.Shell;

interface IProps {
    pageContainer: HTMLDivElement;
    navBar: HTMLDivElement;
    menu: HTMLUListElement; // 导航菜单dom
    shortMenu: HTMLUListElement; // 最近收藏dom
    nodeId: string;
    baseUrl: string;
    searchDom: HTMLElement;
}

/**
 * 电脑端主界面
 */
export = class MainPage {
    private static sidsBar: SideBarMrg = null;
    private static tabContainer: HTMLUListElement = null;
    private static pageContainer: HTMLDivElement;
    private static navBar: HTMLDivElement;
    private static searchModal: Modal;
    private static spinner: Loading;

    constructor() {
    }
    //下载
    static downloadFile = (fileName, content) => {
        let aLink = document.createElement('a');
        let blob = MainPage.base64ToBlob(content); //new Blob([content]);

        let evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);

        // aLink.dispatchEvent(evt);
        //aLink.click()
        aLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));//兼容火狐
    }
    //base64转blob
    static base64ToBlob = (code) => {
        let parts = code.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;

        let uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    }
    public static init = (props: IProps) => {
        document.oncontextmenu = (event: obj) => {
            if (event.target.nodeName == 'IMG') {
                event.preventDefault();
                let modal = Modal.confirm({
                    msg: "是否保存图片?",
                    callback: (status) => {
                        if (status) {
                            let str1 = "abcdefghijklmnopqrstuvwxyz";
                            let array = str1.split("");
                            let str = "";
                            for (var i = 0; i < 5; i++) {
                                let n = Math.round(Math.random() * (array.length - 1));//此处注意越界问题
                                str += array[n]
                            }
                            if(/^http(s)?/.test(event.target.currentSrc)){
                                sys.window.download(event.target.currentSrc, str + '.png');
                            } else {
                                MainPage.downloadFile(str + ".png", event.target.currentSrc);
                            }
                        }
                    }
                })
                let dom = d.query(`.${modal.className}`);
                let str = dom.style.cssText;
                dom.style.cssText = str + 'z-index:99999!important;'
            }
        };
        MainPage.pageContainer = props.pageContainer;
        MainPage.navBar = props.navBar;
        MainPage.tabContainer = <HTMLUListElement>props.navBar.querySelector('ul.page-tabs-content');
        // MainPage.pages = new PageMrg(para.pageContainer);
        // MainPage.tabs = new TabMrg(MainPage.tabContainer);
        MainPage.sidsBar = new SideBarMrg({
            menu: props.menu,
            shortMenu: props.shortMenu,
            favUrl: CONF.ajaxUrl.menuFavor,
            recentUrl: CONF.ajaxUrl.menuHistory,
            menuUrl: CONF.ajaxUrl.menu
        });
        MainPage.systemMenu.init();
        MainPage.topNavMenu.init();
        MainPage.myselfMenu.init();
        MainPage.rightSidebar.init();
        MainPage.search.init(props);
        let platformName = User.get().platformName;
        d.query('.navbar-brand .nav-bluewhale', window.document.body).innerText = platformName || '速狮';
        /*let url = `${conf.urlAppid}/v1/commonui/pageroute?page=defaultTab`;
          sys.window.open({url});*/
          
    sys.window.open({url: CONF.siteUrl + "/app_sanfu_retail/null/home_page/workbench?modulesId=1"})
    }

    private static search = (function () {
        let ajax = new BwRule.Ajax();

        function init(props: IProps) {
            new SearchInput({
                container: props.searchDom,
                className: 'search-form',
                placeholder: '搜索',
                ajax: {
                    url: props.baseUrl,
                    fun(url, data, recentValue, cb) {
                        if (!MainPage.spinner) {
                            MainPage.spinner = new Loading({})
                        } else {
                            MainPage.spinner.show();
                        }

                        ajax.fetch(CONF.siteUrl + props.baseUrl, {
                            type: 'POST',
                            data2url: true,
                            cache: true,
                            data: {
                                currentNode: props.nodeId,
                                keywords: recentValue
                            }
                        }).then(({ response }) => {
                            menuPanel(response.body.bodyList);
                        });

                        // Rule.ajax(CONF.siteUrl + props.baseUrl + 'currentNode=' + props.nodeId + '&keywords=' + recentValue,{
                        //     type : 'POST',
                        //     cache : true,
                        //     success : (res) => {
                        //        menuPanel(res.body.bodyList);
                        //     }
                        // })
                    }
                }
            });

            function menuPanel(data) {
                let fragment = document.createDocumentFragment(),
                    div = d.create(`<div></div>`);
                if (data) {
                    data.forEach(obj => {
                        fragment.appendChild(menuTpl(obj));
                    });
                } else {
                    fragment.appendChild(d.create(`<div>暂无数据</div>`));
                }
                div.appendChild(fragment);
                if (!MainPage.searchModal) {
                    MainPage.searchModal = new Modal({
                        header: '菜单搜索结果',
                        position: 'left',
                        className: 'menuPage',
                        body: div,
                        isBackground: false,
                    });
                    MainPage.searchModal.body.parentElement.classList.add('padding-1');
                } else {
                    MainPage.searchModal.body = div;
                    MainPage.searchModal.isShow = true;
                }
                d.on(div, 'click', 'a[data-href]', function () {
                    MainPage.searchModal.isShow = false;
                    let badge = this.querySelector('[data-url]');
                    let num = 0;
                    if (badge) {
                        num = parseInt(badge.textContent);
                    }
                    let data = badge ? { badge: num } : {};
                    BW.sys.window.open({
                        url: CONF.siteUrl + this.dataset.href,
                        data: data
                    });
                });
                // function animationHover(element, animation) {
                //     element = $(element);
                //     element.hover(
                //         function () {
                //             element.addClass('animated ' + animation);
                //         },
                //         function () {
                //             window.setTimeout(function () {
                //                 element.removeClass('animated ' + animation);
                //             }, 2000);
                //         });
                // }
                // $(div).ready(function(){
                //     $('.file-box').each(function() {
                //         animationHover(this, 'pulse');
                //     });
                // });
                MainPage.spinner.hide();
            }

            function menuTpl(obj: obj) {
                let menu = obj.menuItem;
                return d.create(`  <div class="file-box col-xs-2 col-md-2 card-white" data-favid="${menu.favid}">
                    <div class="file" title="${obj.menuLocation}">
                        <a data-href="${menu.menuPath.dataAddr}" >
                            <span class="corner"></span>
                            <span data-url="${menu.subScriptUrl}" class="partition-red hide"></span>
                            <div class="icon">
                                <i class="ti ${menu.menuIcon}"></i>
                            </div>
                            <div class="file-name">${menu.menuName}</div>
                        </a>
                    </div>
                </div>`)
            }
        }

        return {
            init: (props) => {
                init(props)
            }
        }
    }());

    private static topNavMenu = (function () {

        function init() {
            let navBar = MainPage.navBar,
                tabBar = MainPage.tabContainer,
                faTabBar = tabBar.parentElement.parentElement,
                contentPage = MainPage.pageContainer,
                navScroll = (function () {
                    let scroller = $(tabBar.parentElement);

                    function scroll(left: number) {
                        scroller.animate({
                            scrollLeft: left
                        });
                    }

                    function scrollToActive() {
                        let active = <HTMLLIElement>tabBar.querySelector('li.open'),
                            left: number,
                            topWidth: number;

                        if (active) {
                            // left = active.position().left + active.width();
                            left = active.offsetLeft + active.offsetWidth;
                            topWidth = navBar.offsetWidth;

                            if (left < 0 || left > topWidth) {
                                scroll((left + scroller.scrollLeft()) - topWidth + 20);
                            }
                        }
                    }

                    function toggleBtn() {
                        navBar.classList[tabBar.offsetWidth > navBar.offsetWidth ? 'add' : 'remove']('hover');
                    }

                    return {
                        left: function () {
                            scroll(scroller.scrollLeft() - 500)
                        },
                        right: function () {
                            scroll(scroller.scrollLeft() + 500)
                        },
                        toActive: function () {
                            scrollToActive();
                        },
                        toggleBtn: function () {
                            toggleBtn();
                        },
                        calc: function () {
                            scrollToActive();
                            toggleBtn();
                        }
                    }
                }());

            //给open方法加入默认回调
            (function () {
                let open = sys.window.open;
                sys.window.open = function (obj, refer) {
                    obj.callback = typeof obj.callback === 'function' ? obj.callback : () => {
                    };
                    let cb = obj.callback;
                    obj.callback = function () {
                        navScroll.calc();
                        cb();
                    };
                    open(obj, refer);
                    navScroll.calc();
                };
            }());

            // sys.window.init(function () {
            //     navScroll.calc();
            // });

            navScroll.calc();

            d.on(faTabBar, 'click', '.tab-ctl-btn', function () {
                if (this.classList.contains('J_tabLeft')) {
                    navScroll.left();
                } else {
                    navScroll.right();
                }
            });

            $(tabBar).on('click', 'li[data-href]', function () {
                sys.window.open({ url: this.dataset.href });
            }).on('click', '.close[data-href]', function (e) {
                sys.window.close('', null, this.dataset.href);
                navScroll.toggleBtn();
                e.stopPropagation();
            });
            // d.on(tabBar,'click', 'li[data-href]', function () {
            //     sys.window.open({url:this.dataset.href});
            // });
            // d.on(tabBar, 'click', '.close[data-href]', function (e) {
            //     sys.window.close('', null, this.dataset.href);
            //     navScroll.toggleBtn();
            //     e.stopPropagation();
            // });
            d.on(d.query('.topControlBtns'), 'click', 'li[data-close]', function () {
                let close = this.dataset.close;
                switch (close) {
                    case 'focusCur':
                        navScroll.toActive();
                        break;
                    case 'closeAll':
                        sys.window.closeAll();
                        break;
                    case 'closeOther':
                        sys.window.closeOther();
                        break;
                }
            });

        }

        return {
            init: () => {
                init()
            }
        }
    }());

    protected static systemMenu = (() => {
        let result = {};

        let init = () => {
            let container = d.query('.content-tabs'),
                li = d.create(`<li class="dropdown-system dropdown pull-right"><a href="#">
                    <span>打开系统</span>
                    </a>
                    <i class="more-btn iconfont icon-expanse" style="color: #000;"></i>
                    </li>`);
            let span = d.query('a', li),
                icon = d.query('i', li);
            BwRule.Ajax.fetch(CONF.ajaxUrl.systemMenu).then(({ response }) => {
                d.append(container, li);
                let data: obj[] = tools.keysVal(response, 'body', 'bodyList');
                if (tools.isNotEmpty(data)) {
                    let item = data[0];
                    span.innerHTML = `<span class="${'icon-system iconfont ' + item.systemIcon}"></span>${item.systemName}`;
                    d.on(span, 'click', () => {
                        handlerClick(item);
                    });
                    if(data.length > 1){
                        let popover = new Popover({
                            className: 'system-menu-popover',
                            target: icon,
                            // container: <HTMLElement>d.query('.popover-toggle').parentNode.parentNode,
                            isWatch: true,
                            items: data.slice(1).map((item) => {
                                return {
                                    title: item.systemName,
                                    icon: 'iconfont ' + item.systemIcon,
                                    onClick: () => {
                                        handlerClick(item);
                                    }
                                }
                            }),
                            isBackground: false,
                            onClick: function () {
                                popover.show = false;
                            }
                        });
                    }else{
                        d.remove(icon);
                    }
                    /*if (data.length === 1) {
                        let item = data[0],
                            el = d.create(`<li class="dropdown pull-right">
                                    <a href="#">
                                        <span class="${'iconfont icon-' + item.systemIcon}"></span>
                                        ${item.systemName}
                                    </a>
                                </li>`);
                        d.on(el, 'click', () => {
                            handlerClick(item);
                        });
                        d.replace(el, li);
                    } else {
                        let popover = new Popover({
                            target: li,
                            // container: <HTMLElement>d.query('.popover-toggle').parentNode.parentNode,
                            isWatch: true,
                            items: data.map((item) => {
                                return {
                                    title: item.systemName,
                                    icon: 'iconfont icon-' + item.systemIcon,
                                    onClick: () => {
                                        handlerClick(item);
                                    }
                                }
                            }),
                            isBackground: false,
                            onClick: function () {
                                popover.show = false;
                            }
                        });
                    }*/
                } else {
                    d.remove(li);
                }
            });

        };
        let handlerClick = (item) => {
            getSystemMsg(item.systemId).then((response) => {
                console.log(response);
                let loading: Loading,
                    path = tools.keysVal(response, 'LOGIN_VAR', 'SYSTEM_PATH') || '',
                    params = tools.keysVal(response, 'LOGIN_VAR', 'PARAMS') || '';

                let flag = Shell.openSystem(path, params, (result) => {
                    loading && loading.hide();
                    loading = null;
                    if (!result.success) {
                        Modal.alert(result.msg || '打开失败');
                    }
                });

                if (flag) {
                    loading = new Loading({
                        msg: '打开中...',
                        duration: 10
                    });
                    loading.show();
                } else {
                    Modal.alert('打开失败');
                }
            })
        };

        let getSystemMsg = (systemId: string): Promise<any> => {
            if (systemId in result) {
                return Promise.resolve(result[systemId]);
            } else {
                return BwRule.Ajax.fetch(tools.url.addObj(CONF.ajaxUrl.systemMsg, {
                    tdsourcetag: 's_pctim_aiomsg',
                    systemid: systemId
                })).then(({ response }) => {
                    result[systemId] = response;
                    return response;
                });
            }
        };

        return { init }
    })();

    private static myselfMenu = (function () {
        //顶部个人信息下拉窗口点击事件
        let rfid: RfidConfig,
            conf = Shell.other.getData();
            // console.log(conf);
        tools.isEmpty(conf)&& Shell.other.putData(JSON.stringify({
            line: 0,
            ip: '192.168.1.200',
            port: 100,
            com: 'COM1',
            baud: 115200,
            mode: 1,
            buzz: false,
            led: false,
        }));
        let items: IPopoverItemPara[] = [
            {
                title: '<a href="javascript:void(0)" data-page-name="myself" data-action="myself">个人资料</a>',
                onClick: () => {
                    sys.window.open({
                        url: tools.url.addObj(CONF.url.myself, {
                            userid: User.get().userid
                        })
                    });
                }
            },
            {
                title: '<a href="javascript:void(0)" data-action="check">检查新版本</a>',
                onClick: () => {
                    sys.window.update();
                }
            },
            {
                title: '<a href="javascript:void(0)" data-action="check">清理缓存</a>',
                onClick: () => {
                    Shell.clearCache((result) => {
                        if (result.success) {
                            Modal.alert(result.msg || '成功清理缓存');
                        } else {
                            Modal.alert(result.msg || '清理缓存失败')
                        }
                    });
                }
            },
            {
                title: '<a href="javascript:void(0)" data-action="check">RFID设置</a>',
                onClick: () => rfid ? rfid.show() : rfid = new RfidConfig()
            }
            // {
            //     title: '<a href="javascript:void(0)" data-action="clear">清理缓存</a>',
            //     onClick: () => {
            //         sys.window.clear();
            //     }
            // },
            // {
            //     title: '<a href="javascript:void(0)" data-page-name="bugReport" data-action="bugReport">故障申告</a>',
            //     onClick: () => {
            //         sys.window.open({url: CONF.url.bugReport});
            //     }
            // },
            // {
            //     title: '<a href="javascript:void(0)" data-page-name="myApplication" data-action="application">我的申请</a>',
            //     onClick: () => {
            //         sys.window.open({url: CONF.url.myApplicationPC});
            //     }
            // },
            // {
            //     title: '<a href="javascript:void(0)" data-page-name="myApproval" data-action="approval">我的审核</a>',
            //     onClick: () => {
            //         sys.window.open({url: CONF.url.myApprovalPC});
            //     }
            // },
        ];


        function myselfMenu() {
            let wrapper = d.query('.popover-toggle');
            let popover = new Popover({
                target: wrapper,
                // container: <HTMLElement>d.query('.popover-toggle').parentNode.parentNode,
                isWatch: true,
                items,
                isBackground: false,
                onClick: function (index, content) {
                    hide();
                }
            });
            popover.wrapper.classList.add('home-self-menu');

            function hide() {
                popover.show = false;
            }

        }

        function openWindow(url: string, title: string) {
            if (sysPcHistory.indexOf(url) >= 0) {
                sys.window.refresh(url);
            }
            sys.window.open({ url, title })
        }

        function init() {
            let toggleEl = d.query('.popover-toggle');
            toggleEl.classList.add('disabled');
            let spinner = new Spinner({
                el: toggleEl,
                type: Spinner.SHOW_TYPE.cover
            });
            spinner.show();
            G.Ajax.fetch(CONF.ajaxUrl.personalmenu).then(({ response }) => {
                response = JSON.parse(response);
                let menus = response.body && response.body.elements;
                // console.log('in pc');
                // console.log(menus);
                menus && menus.forEach((menu: IBW_Menu) => {
                    /*
                    *   0： pc和mb都显示
                    *   1： 仅pc显示
                    *   2： 仅mb显示
                    * */
                    (menu.isPc === 0 || menu.isPc === 1) && items.push({
                        title: `<a href="javascript:void(0)">${menu.menuName}</a>`,
                        onClick: () => {
                            BwRule.reqAddrMenu(menu);
                        }
                    })
                });

            }).finally(() => {
                spinner && spinner.hide();
                spinner = null;
                toggleEl.classList.remove('disabled');
                // if (CONF.appid === 'app_fastlion_retail') {
                //     items = items.concat([{
                //         title: '<a href="javascript:void(0)" data-page-name="changePassword" data-action="changePassword">修改个人密码</a>',
                //         onClick: () => {
                //             sys.window.open({
                //                 url: CONF.url.changePassword
                //             });
                //         }
                //     }]
                //     );
                // }

                items.push({
                    title: '<a data-action="logout">退出登录</a>',
                    onClick: () => {
                        Modal.confirm({
                            msg: `您确定要退出登录吗`,
                            callback: (index) => {
                                if (index) {
                                    let device = Device.get();
                                    // if(G.tools.isEmpty(device.uuid)) {
                                    //     sys.window.logout();
                                    // }else{
                                    sys.window.logout();
                                    // }
                                }
                            }
                        });
                    }
                });
                myselfMenu();

                //消息提示窗口点击事件
                let msgDom = d.query('.messagesContent'),
                    unreadMsgNum = d.query('#unreadMsgNum'),
                    num = localMsg.getUnreadCount();
                if (num > 0) {
                    unreadMsgNum.classList.remove('hide');
                    unreadMsgNum.innerText = num + '';
                }
                d.on(msgDom, 'click', function () {
                    sys.window.open({ url: CONF.url.msgList, title: '消息' });
                });
            });
        }

        return {
            init: () => {
                init()
            }
        }
    }());

    private static rightSidebar = (function () {
        let $html = $('html'), $win = $(window), wrap = $('.app-aside'), MEDIAQUERY: obj = {}, app = $('#app');
        MEDIAQUERY = {
            desktopXL: 1200,
            desktop: 992,
            tablet: 768,
            mobile: 480
        };
        // $(".current-year").text((new Date()).getFullYear());
        //sidebar
        let sidebarHandler = function () {
            let eventObject = isTouch() ? 'click' : 'mouseenter', elem = $('#sidebar'), ul: JQuery = null, menuTitle,
                _this, sidebarMobileToggler = $('.sidebar-mobile-toggler'), $winOffsetTop = 0, $winScrollTop = 0,
                $appWidth;
            elem.on('click', 'a', function (e) {
                _this = $(this);
                let id = this.parentNode.dataset.menuId;
                let $id = $('#' + id);
                if (isSidebarClosed() && !isSmallDevice() && !_this.closest("ul").hasClass("sub-menu"))
                    return;
                _this.closest("ul").find(".open").not(".active").children("ul").not(_this.next()).slideUp(200).parent('.open').removeClass("open");
                if (_this.next().is('ul') && _this.parent().toggleClass('open')) {
                    _this.next().slideToggle(200, function () {
                        $win.trigger("resize");

                    });
                    e.stopPropagation();
                    e.preventDefault();
                } else {
                    // _this.parent().addClass("active");
                }
                if (app.hasClass('app-sidebar-closed')) {
                    elem.find('.sub-menu').each(function () {
                        if ($(this).find('li.active').length > 0 && !$(this).parent().hasClass('open')) {
                            $(this).parent().addClass('active');
                        }
                    });
                    let mainThis = $id.children('a');
                    mainThis.parents('li.active').removeClass('active').addClass('open').children('.sub-menu').show();
                    if (_this.next().length > 0) {
                        if (_this.closest("ul").find(".open").not(".active").children("ul").css('display') == undefined) {
                            mainThis.next().hide().parent().removeClass('open');
                            if (mainThis.next().find('li.active').length > 0) {
                                mainThis.next().parent().addClass('active');
                            }
                        } else {
                            mainThis.next().show().parent().addClass('open');
                            if (mainThis.next().find('li.active').length > 0) {
                                mainThis.next().parent().removeClass('active');
                            }
                        }
                    } else {
                        return;
                    }
                }
            });
            //contact的dropMenu事件初始化
            $('#list').on('click', 'a', function (e) {
                _this = $(this);
                if (isSidebarClosed() && !isSmallDevice() && !_this.closest("ul").hasClass("sub-menu"))
                    return;
                _this.closest("ul").find(".open").not(".active").children("ul").not(_this.next()).slideUp(200).delay(200).parent('.open').removeClass("open");
                if (_this.next().is('ul') && _this.parent().toggleClass('open')) {
                    _this.next().slideToggle(200, function () {
                        $win.trigger("resize");
                    });
                    e.stopPropagation();
                    e.preventDefault();
                } else {
                    // _this.parent().addClass("active");
                }
            });
            elem.on(eventObject, 'a', function (e) {
                if (!isSidebarClosed() || isSmallDevice())
                    return;
                _this = $(this);

                if (!_this.parent().hasClass('hover') && !_this.closest("ul").hasClass("sub-menu")) {
                    wrapLeave();
                    _this.parent().addClass('hover');
                    menuTitle = _this.find(".item-inner").clone();
                    if (_this.parent().hasClass('active')) {
                        menuTitle.addClass("active");
                    }
                    let offset = $("#sidebar").position().top;
                    let itemTop = isSidebarFixed() ? _this.parent().position().top + offset : (_this.parent().position().top);
                    menuTitle.css({
                        position: isSidebarFixed() ? 'fixed' : 'absolute',
                        height: _this.outerHeight(),
                        top: itemTop
                    }).appendTo(wrap);
                    if (_this.next().is('ul')) {
                        ul = _this.next().clone(true);

                        ul.appendTo(wrap).css({
                            top: itemTop + _this.outerHeight(),
                            position: isSidebarFixed() ? 'fixed' : 'absolute',
                        });
                        if (_this.parent().position().top + _this.outerHeight() + offset + ul.height() > $win.height() && isSidebarFixed()) {
                            ul.css('bottom', 0);
                        } else {
                            ul.css('bottom', 'auto');
                        }

                        wrap.children().first().scroll(function () {
                            if (isSidebarFixed())
                                wrapLeave();
                        });

                        setTimeout(function () {

                            if (!wrap.is(':empty')) {
                                $(document).on('click tap', wrapLeave);
                            }
                        }, 300);

                    } else {
                        ul = null;
                        return;
                    }

                }
            });
            wrap.on('mouseleave', function (e) {
                $(document).off('click tap', wrapLeave);
                $('.hover', wrap).removeClass('hover');
                $('> .item-inner', wrap).remove();
                $('> ul', wrap).remove();
            });
            sidebarMobileToggler.on('click', function () {
                $winScrollTop = $winOffsetTop;
                if (!$('#app').hasClass('app-slide-off') && !$('#app').hasClass('app-offsidebar-open')) {
                    $winOffsetTop = $win.scrollTop();
                    $winScrollTop = 0;
                    $('footer').hide();
                    $appWidth = $('#app .main-content').innerWidth();
                    $('#app .main-content').css({
                        position: 'absolute',
                        top: -$winOffsetTop,
                        width: $appWidth
                    });
                } else {
                    resetSidebar();
                }

            });
            $(document).on("mousedown touchstart", function (e) {
                if (elem.has(e.target).length === 0 && !elem.is(e.target) && !sidebarMobileToggler.is(e.target) && ($('#app').hasClass('app-slide-off') || $('#app').hasClass('app-offsidebar-open'))) {
                    resetSidebar();
                }
            });
            let resetSidebar = function () {
                $winScrollTop = $winOffsetTop;
                $("#app .app-content").one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
                    if (!$('#app').hasClass('app-slide-off') && !$('#app').hasClass('app-offsidebar-open')) {
                        $('#app .main-content').css({
                            position: 'relative',
                            top: 'auto',
                            width: 'auto'
                        });
                        window.scrollTo(0, $winScrollTop);
                        $('footer').show();
                        $("#app .app-content").off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
                    }
                });
            };
        };

        function wrapLeave() {
            wrap.trigger('mouseleave');
        }

        function isTouch() {
            return $html.hasClass('touch');
        }

        function isSmallDevice() {
            return $win.width() < MEDIAQUERY.desktop;
        }

        function isSidebarClosed() {
            return $('.app-sidebar-closed').length;
        }

        function isSidebarFixed() {
            return $('.app-sidebar-fixed').length;
        }

        let toggleClassOnElement = function () {
            let toggleAttribute = $('*[data-toggle-class]');
            toggleAttribute.each(function () {
                let _this = $(this);
                let toggleClass = _this.attr('data-toggle-class');
                let outsideElement;
                let toggleElement;
                typeof _this.attr('data-toggle-target') !== 'undefined' ? toggleElement = $(_this.attr('data-toggle-target')) : toggleElement = _this;
                _this.on("click", function (e) {
                    if (_this.attr('data-toggle-type') !== 'undefined' && _this.attr('data-toggle-type') == "on") {
                        toggleElement.addClass(toggleClass);
                    } else if (_this.attr('data-toggle-type') !== 'undefined' && _this.attr('data-toggle-type') == "off") {
                        toggleElement.removeClass(toggleClass);
                    } else {
                        toggleElement.toggleClass(toggleClass);
                    }
                    e.preventDefault();
                    if (_this.attr('data-toggle-click-outside')) {

                        outsideElement = $(_this.attr('data-toggle-click-outside'));
                        $(document).on("mousedown touchstart", toggleOutside);

                    }

                });

                let toggleOutside = function (e) {
                    if (outsideElement.has(e.target).length === 0 && !outsideElement.is(e.target) && !toggleAttribute.is(e.target) && toggleElement.hasClass(toggleClass)) {
                        toggleElement.removeClass(toggleClass);
                        $(document).off("mousedown touchstart", toggleOutside);
                    }
                };

            });
        };
        return {
            init: function () {
                // settingsHandler();//left right nav
                // sidebarHandler();//right nav
                toggleClassOnElement();//left toggle
            }
        };
    }())
}
