define("mainPage", ["require", "exports", "SideBarMrg", "Modal", "User", "Device", "SearchInput", "Loading", "BwRule", "Popover"], function (require, exports, sideBar_1, Modal_1, User_1, Device_1, searchInput_1, loading_1, BwRule_1, popover_1) {
    "use strict";
    var _a;
    var tools = G.tools;
    var sys = BW.sys;
    var CONF = BW.CONF;
    var localMsg = G.localMsg;
    var d = G.d;
    return (_a = /** @class */ (function () {
            function MainPage() {
            }
            MainPage.init = function (props) {
                MainPage.pageContainer = props.pageContainer;
                MainPage.navBar = props.navBar;
                MainPage.tabContainer = props.navBar.querySelector('ul.page-tabs-content');
                // MainPage.pages = new PageMrg(para.pageContainer);
                // MainPage.tabs = new TabMrg(MainPage.tabContainer);
                MainPage.sidsBar = new sideBar_1.default({
                    menu: props.menu,
                    shortMenu: props.shortMenu,
                    favUrl: CONF.ajaxUrl.menuFavor,
                    recentUrl: CONF.ajaxUrl.menuHistory,
                    menuUrl: CONF.ajaxUrl.menu
                });
                MainPage.topNavMenu.init();
                MainPage.myselfMenu.init();
                MainPage.rightSidebar.init();
                MainPage.search.init(props);
                /*let url = `${conf.urlAppid}/v1/commonui/pageroute?page=defaultTab`;
                  sys.window.open({url});*/
            };
            return MainPage;
        }()),
        _a.sidsBar = null,
        _a.tabContainer = null,
        _a.search = (function () {
            var ajax = new BwRule_1.BwRule.Ajax();
            function init(props) {
                new searchInput_1.SearchInput({
                    container: props.searchDom,
                    className: 'search-form',
                    placeholder: '搜索',
                    ajax: {
                        url: props.baseUrl,
                        fun: function (url, data, recentValue, cb) {
                            if (!_a.spinner) {
                                _a.spinner = new loading_1.Loading({});
                            }
                            else {
                                _a.spinner.show();
                            }
                            ajax.fetch(CONF.siteUrl + props.baseUrl, {
                                type: 'POST',
                                data2url: true,
                                cache: true,
                                data: {
                                    currentNode: props.nodeId,
                                    keywords: recentValue
                                }
                            }).then(function (_b) {
                                var response = _b.response;
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
                    var fragment = document.createDocumentFragment(), div = d.create("<div></div>");
                    if (data) {
                        data.forEach(function (obj) {
                            fragment.appendChild(menuTpl(obj));
                        });
                    }
                    else {
                        fragment.appendChild(d.create("<div>\u6682\u65E0\u6570\u636E</div>"));
                    }
                    div.appendChild(fragment);
                    if (!_a.searchModal) {
                        _a.searchModal = new Modal_1.Modal({
                            header: '菜单搜索结果',
                            position: 'left',
                            className: 'menuPage',
                            body: div,
                            isBackground: false,
                        });
                        _a.searchModal.body.parentElement.classList.add('padding-1');
                    }
                    else {
                        _a.searchModal.body = div;
                        _a.searchModal.isShow = true;
                    }
                    d.on(div, 'click', 'a[data-href]', function () {
                        _a.searchModal.isShow = false;
                        var badge = this.querySelector('[data-url]');
                        var num = 0;
                        if (badge) {
                            num = parseInt(badge.textContent);
                        }
                        var data = badge ? { badge: num } : {};
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
                    _a.spinner.hide();
                }
                function menuTpl(obj) {
                    var menu = obj.menuItem;
                    return d.create("  <div class=\"file-box col-xs-2 col-md-2 card-white\" data-favid=\"" + menu.favid + "\">\n                    <div class=\"file\" title=\"" + obj.menuLocation + "\">\n                        <a data-href=\"" + menu.menuPath.dataAddr + "\" >\n                            <span class=\"corner\"></span>\n                            <span data-url=\"" + menu.subScriptUrl + "\" class=\"partition-red hide\"></span>\n                            <div class=\"icon\">\n                                <i class=\"ti " + menu.menuIcon + "\"></i>\n                            </div>\n                            <div class=\"file-name\">" + menu.menuName + "</div>\n                        </a>\n                    </div>\n                </div>");
                }
            }
            return {
                init: function (props) {
                    init(props);
                }
            };
        }()),
        _a.topNavMenu = (function () {
            function init() {
                var navBar = _a.navBar, tabBar = _a.tabContainer, faTabBar = tabBar.parentElement.parentElement, contentPage = _a.pageContainer, navScroll = (function () {
                    var scroller = $(tabBar.parentElement);
                    function scroll(left) {
                        scroller.animate({
                            scrollLeft: left
                        });
                    }
                    function scrollToActive() {
                        var active = tabBar.querySelector('li.open'), left, topWidth;
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
                            scroll(scroller.scrollLeft() - 500);
                        },
                        right: function () {
                            scroll(scroller.scrollLeft() + 500);
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
                    };
                }());
                //给open方法加入默认回调
                (function () {
                    var open = sys.window.open;
                    sys.window.open = function (obj, refer) {
                        obj.callback = typeof obj.callback === 'function' ? obj.callback : function () { };
                        var cb = obj.callback;
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
                    }
                    else {
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
                    var close = this.dataset.close;
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
                init: function () {
                    init();
                }
            };
        }()),
        _a.myselfMenu = (function () {
            //顶部个人信息下拉窗口点击事件
            var items = [
                {
                    title: '<a href="javascript:void(0)" data-page-name="myself" data-action="myself">个人资料</a>',
                },
                // {
                //     title: '<a href="javascript:void(0)" data-action="account">账号与安全</a>'
                // },
                {
                    title: '<a href="javascript:void(0)" data-action="check">检查新版本</a>'
                },
                {
                    title: '<a href="javascript:void(0)" data-action="clear">清理缓存</a>'
                },
                {
                    title: '<a href="javascript:void(0)" data-page-name="bugReport" data-action="bugReport">故障申告</a>'
                },
                {
                    title: '<a href="javascript:void(0)" data-page-name="myApplication" data-action="application">我的申请</a>'
                },
                {
                    title: '<a href="javascript:void(0)" data-page-name="myApproval" data-action="approval">我的审核</a>'
                },
            ];
            if (CONF.appid === 'app_fastlion_retail') {
                items = items.concat([{
                        title: '<a href="javascript:void(0)" data-page-name="changePassword" data-action="changePassword">修改个人密码</a>',
                    }]);
            }
            items.push({
                title: '<a data-action="logout">退出登录</a>'
            });
            function myselfMenu() {
                var popover = new popover_1.Popover({
                    target: d.query('.popover-toggle'),
                    // container: <HTMLElement>d.query('.popover-toggle').parentNode.parentNode,
                    isWatch: true,
                    items: items,
                    isBackground: false,
                    onClick: function (index) {
                        hide();
                        var str = d.query('a', this).dataset.action;
                        switch (str) {
                            case 'myself':
                                sys.window.open({
                                    url: tools.url.addObj(CONF.url.myself, {
                                        userid: User_1.User.get().userid
                                    })
                                });
                                break;
                            case 'account':
                                break;
                            case 'check':
                                sys.window.update();
                                break;
                            case 'clear':
                                sys.window.clear();
                                break;
                            case 'bugReport':
                                sys.window.open({ url: CONF.url.bugReport });
                                break;
                            case 'application':
                                sys.window.open({ url: CONF.url.myApplicationPC });
                                break;
                            case 'approval':
                                sys.window.open({ url: CONF.url.myApprovalPC });
                                break;
                            case 'changePassword':
                                sys.window.open({
                                    url: CONF.url.changePassword
                                });
                                break;
                            case 'logout':
                                Modal_1.Modal.confirm({
                                    msg: "\u60A8\u786E\u5B9A\u8981\u9000\u51FA\u767B\u5F55\u5417",
                                    callback: function (index) {
                                        if (index) {
                                            var device = Device_1.Device.get();
                                            // if(G.tools.isEmpty(device.uuid)) {
                                            //     sys.window.logout();
                                            // }else{
                                            sys.window.logout();
                                            // }
                                        }
                                    }
                                });
                                break;
                        }
                    }
                });
                function hide() {
                    popover.show = false;
                }
                // popover.position = "down";
                /* $('.dropdown-menu').on('click', '[data-action]', function () {
                     let action = this.dataset.action;
                     switch (action) {
                         case 'myself':
                             sys.window.open({
                                 url: tools.url.addObj(CONF.url.myself, {
                                     userid: User.get().userid
                                 })
                             });
                             break;
                         case 'account':
                             break;
                         case 'check':
                             sys.window.update();
                             break;
                         case 'clear':
                             sys.window.clear();
                             break;
                         case 'bugReport':
                             sys.window.open({url: CONF.url[this.dataset.pageName]});
                             break;
                         case 'logout':
                             Modal.confirm({
                                 msg: `您确定要退出登录吗`,
                                 callback: (index) => {
                                     if (index) {
                                         let device = Device.get();
                                         // if(G.tools.isEmpty(device.uuid)) {
                                         //     sys.window.logout();
                                         // }else{
                                             sys.window.logout(CONF.url.login);
                                         // }
                                     }
                                 }
                             });
                             break;
                     }
                 });*/
            }
            function init() {
                //消息提示窗口点击事件
                $('.messageList').on('click', 'li', function () {
                    var src = CONF.siteUrl + $(this).data('url');
                    sys.window.open({ url: src });
                    $(this).remove();
                    localMsg.remove(this.dataset.notifyid);
                });
                document.querySelector('[data-action=topSeeAllMsg]').addEventListener('click', function () {
                    sys.window.open({ url: CONF.url.message });
                });
                myselfMenu();
            }
            return {
                init: function () {
                    init();
                }
            };
        }()),
        _a.rightSidebar = (function () {
            var $html = $('html'), $win = $(window), wrap = $('.app-aside'), MEDIAQUERY = {}, app = $('#app');
            MEDIAQUERY = {
                desktopXL: 1200,
                desktop: 992,
                tablet: 768,
                mobile: 480
            };
            // $(".current-year").text((new Date()).getFullYear());
            //sidebar
            var sidebarHandler = function () {
                var eventObject = isTouch() ? 'click' : 'mouseenter', elem = $('#sidebar'), ul = null, menuTitle, _this, sidebarMobileToggler = $('.sidebar-mobile-toggler'), $winOffsetTop = 0, $winScrollTop = 0, $appWidth;
                elem.on('click', 'a', function (e) {
                    _this = $(this);
                    var id = this.parentNode.dataset.menuId;
                    var $id = $('#' + id);
                    if (isSidebarClosed() && !isSmallDevice() && !_this.closest("ul").hasClass("sub-menu"))
                        return;
                    _this.closest("ul").find(".open").not(".active").children("ul").not(_this.next()).slideUp(200).parent('.open').removeClass("open");
                    if (_this.next().is('ul') && _this.parent().toggleClass('open')) {
                        _this.next().slideToggle(200, function () {
                            $win.trigger("resize");
                        });
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    else {
                        // _this.parent().addClass("active");
                    }
                    if (app.hasClass('app-sidebar-closed')) {
                        elem.find('.sub-menu').each(function () {
                            if ($(this).find('li.active').length > 0 && !$(this).parent().hasClass('open')) {
                                $(this).parent().addClass('active');
                            }
                        });
                        var mainThis = $id.children('a');
                        mainThis.parents('li.active').removeClass('active').addClass('open').children('.sub-menu').show();
                        if (_this.next().length > 0) {
                            if (_this.closest("ul").find(".open").not(".active").children("ul").css('display') == undefined) {
                                mainThis.next().hide().parent().removeClass('open');
                                if (mainThis.next().find('li.active').length > 0) {
                                    mainThis.next().parent().addClass('active');
                                }
                            }
                            else {
                                mainThis.next().show().parent().addClass('open');
                                if (mainThis.next().find('li.active').length > 0) {
                                    mainThis.next().parent().removeClass('active');
                                }
                            }
                        }
                        else {
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
                    }
                    else {
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
                        var offset = $("#sidebar").position().top;
                        var itemTop = isSidebarFixed() ? _this.parent().position().top + offset : (_this.parent().position().top);
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
                            }
                            else {
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
                        }
                        else {
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
                    }
                    else {
                        resetSidebar();
                    }
                });
                $(document).on("mousedown touchstart", function (e) {
                    if (elem.has(e.target).length === 0 && !elem.is(e.target) && !sidebarMobileToggler.is(e.target) && ($('#app').hasClass('app-slide-off') || $('#app').hasClass('app-offsidebar-open'))) {
                        resetSidebar();
                    }
                });
                var resetSidebar = function () {
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
            var toggleClassOnElement = function () {
                var toggleAttribute = $('*[data-toggle-class]');
                toggleAttribute.each(function () {
                    var _this = $(this);
                    var toggleClass = _this.attr('data-toggle-class');
                    var outsideElement;
                    var toggleElement;
                    typeof _this.attr('data-toggle-target') !== 'undefined' ? toggleElement = $(_this.attr('data-toggle-target')) : toggleElement = _this;
                    _this.on("click", function (e) {
                        if (_this.attr('data-toggle-type') !== 'undefined' && _this.attr('data-toggle-type') == "on") {
                            toggleElement.addClass(toggleClass);
                        }
                        else if (_this.attr('data-toggle-type') !== 'undefined' && _this.attr('data-toggle-type') == "off") {
                            toggleElement.removeClass(toggleClass);
                        }
                        else {
                            toggleElement.toggleClass(toggleClass);
                        }
                        e.preventDefault();
                        if (_this.attr('data-toggle-click-outside')) {
                            outsideElement = $(_this.attr('data-toggle-click-outside'));
                            $(document).on("mousedown touchstart", toggleOutside);
                        }
                    });
                    var toggleOutside = function (e) {
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
                    toggleClassOnElement(); //left toggle
                }
            };
        }()),
        _a);
});

define("SideBarMrg", ["require", "exports", "BwRule", "DragDeform", "Menu"], function (require, exports, BwRule_1, dragDeform_1, Menu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name="SideBarMrg"/>
    var tools = G.tools;
    var sys = BW.sys;
    var CONF = BW.CONF;
    var d = G.d;
    var sysPcHistory = BW.sysPcHistory;
    var SideBarMrg = /** @class */ (function () {
        function SideBarMrg(para) {
            this.para = para;
            this.menu = null;
            this.favRecTree = null;
            this.openWindow = function (url, title) {
                if (sysPcHistory.indexOf(url) >= 0) {
                    sys.window.refresh(url);
                }
                sys.window.open({ url: url, title: title });
            };
            this.initMainNavMenu();
            this.initFavRecent();
            // if (!~location.href.indexOf('bw.sanfu.com')) {
            //     this.initTestMenu();
            // }
            setTimeout(function () {
                //拉拽
                new dragDeform_1.DragDeform({
                    dragDom: d.query('#sidebar'),
                    border: ['right'],
                    minWidth: 190,
                    maxWidth: 290
                });
                //关于蓝鲸
                d.on(d.query('#msgVersion'), 'click', '.button-o', function () {
                    sys.window.open({ url: CONF.url.msgVersion });
                });
            }, 10);
        }
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
        SideBarMrg.prototype.initMainNavMenu = function () {
            var _this = this;
            var firstLoadSpinner = SideBarMrg.loadTpl();
            d.append(this.para.menu, firstLoadSpinner);
            this.menu = new Menu_1.Menu({
                expand: true,
                container: this.para.menu,
                isAccordion: true,
                content: this.para.menuUrl,
                isLeaf: false,
                // isShowCheckBox: true,
                ajax: function (node) {
                    var content = node.content, url = typeof content === 'string' ? content : (CONF.siteUrl + BwRule_1.BwRule.reqAddr(node.content.menuPath));
                    return Promise.resolve(BwRule_1.BwRule.Ajax.fetch(url, {
                        data: { output: 'json' }
                    }).then(function (_a) {
                        var response = _a.response;
                        if (firstLoadSpinner) {
                            d.remove(firstLoadSpinner);
                            firstLoadSpinner = null;
                        }
                        return _this.convertToTreePara(response);
                    }));
                }
            });
            this.menu.onOpen = function (node) {
                if (node.isLeaf) {
                    var addr = node.content.menuPath;
                    if (addr) {
                        var url = CONF.siteUrl + BwRule_1.BwRule.reqAddr(addr);
                        _this.openWindow(url, node.content.menuName);
                    }
                }
            };
        };
        /**
         * 初始化最近与收藏
         */
        SideBarMrg.prototype.initFavRecent = function () {
            var _this = this;
            this.favRecTree = new Menu_1.Menu({
                text: 'virtualNode',
                container: this.para.shortMenu,
                isAccordion: true,
                expand: true,
                children: [{
                        text: '最近',
                        icon: 'ti-time',
                        isLeaf: false,
                        ajax: function () {
                            return _this.recFavMenuGet('recent');
                        }
                    }, {
                        text: '收藏',
                        icon: 'ti-save',
                        isLeaf: false,
                        ajax: function () {
                            // debugger;
                            return _this.recFavMenuGet('fav');
                        }
                    }]
            });
            this.favRecTree.onOpen = (function (node) {
                if (node.isLeaf) {
                    _this.openWindow(CONF.siteUrl + node.content.url, node.content.caption);
                }
            });
        };
        /**
         * 最近收藏ajax
         * @param {"fav" | "recent"} type
         */
        SideBarMrg.prototype.recFavMenuGet = function (type) {
            var isFav = type === 'fav';
            return BwRule_1.BwRule.Ajax.fetch(this.para[isFav ? 'favUrl' : 'recentUrl'], {
                data: { action: 'query' }
            }).then(function (_a) {
                var response = _a.response;
                // debugger;
                var data = response.data, treePara = [];
                if (!Array.isArray(data)) {
                    return;
                }
                if (isFav) {
                    data.forEach(function (tag) {
                        var tagChild = {
                            text: tag.tag || '默认分组',
                            expand: true,
                            icon: 'ti-folder',
                            ajax: false
                        };
                        if (Array.isArray(tag.favs)) {
                            tagChild.children = tag.favs.map(function (item) { return item2para(item); });
                        }
                        treePara.push(tagChild);
                    });
                }
                else {
                    treePara = Array.isArray(data) ? data.map(function (item) { return item2para(item); }) : [];
                }
                return treePara;
            }).catch(function () {
                return null;
            });
            function item2para(item) {
                return {
                    text: item.caption,
                    icon: item.icon,
                    content: item,
                    isLeaf: true,
                    ajax: false
                };
            }
        };
        /**
         * 后台对象转为菜单控件参数
         * @param {obj} response
         * @returns {IMenuPara[]}
         */
        SideBarMrg.prototype.convertToTreePara = function (response) {
            var elements = response.body.elements;
            if (tools.isEmpty(elements)) {
                return null;
            }
            return elements.map(function (menuData) {
                return {
                    text: menuData.menuName,
                    icon: G.tools.str.removeEmpty(menuData.menuIcon),
                    // children: menuData.menuType ? undefined : [],
                    isLeaf: !!menuData.menuType,
                    content: menuData,
                };
            });
        };
        SideBarMrg.prototype.initTree = function (child) {
        };
        SideBarMrg.loadTpl = function () {
            return d.create('<div class="loadSpinner"><span class="spinner"></span><span class="loadTitle">加载中....</span></div>');
        };
        return SideBarMrg;
    }());
    exports.default = SideBarMrg;
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="components/Component.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
