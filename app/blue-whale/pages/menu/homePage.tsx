import {MENU_FAVORITE, popoverToggle} from "../../module/menuMrg/menuMrg";
import sys = BW.sys;
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import tools = G.tools;
import {Search} from "../../module/search/search";
import d = G.d;
import {SlideTab} from "../../../global/components/ui/slideTab/slideTab";
import {Modal} from "../../../global/components/feedback/modal/Modal";

export = class homePage {

    protected slideTab: SlideTab;
    protected homeList: HTMLElement;
    protected favoritesList: HTMLElement;
    protected recentList: HTMLElement;

    protected initHomeList(data, isRefresh = false){
        if(isRefresh){
            this.homeList.innerHTML = '';
        }
        data && tools.toArray(data).forEach((item) => {
            d.append(this.homeList, homePage.createHomeList(item));
        });
        this.homeList.classList.toggle('no-data', this.homeList.innerHTML === '');
    }

    initRecentList(data, isRefresh = false){
        if(isRefresh){
            this.recentList.innerHTML = '';
        }
        data.forEach((item) => {
            if (item.url) {
                item.url = CONF.siteUrl + item.url;
            }
            // tmpDocument.appendChild(G.d.create(tools.str.parseTpl(menuTplStr, d), 'ul'));
            d.append(this.recentList, menuElGet(item));
        });
        this.recentList.classList.toggle('no-data', this.recentList.innerHTML === '');
    }

    initFavorList(data, isRefresh = false){
        if(isRefresh){
            this.favoritesList.innerHTML = '';
        }
        data.forEach((d) => {
            let p = document.createElement("span"),
                div = document.createElement("div"),
                title = document.createElement("div"),
                span = document.createElement("span");
            if (d.tag === "") {
                if (d.favs.length != 0) {
                    p.innerText = "默认分组";
                }
            }
            else {
                p.innerText = d.tag;
            }
            p.setAttribute("class", "conFavGroup");
            span.setAttribute("class", "editBook mui-icon mui-icon-compose");
            span.setAttribute("data-edit", d.tag);
            title.appendChild(p);
            title.appendChild(span);
            div.appendChild(title);
            d.favs.forEach(function (d) {
                if (d.url) {
                    d.url = CONF.siteUrl + d.url;
                }
                div.appendChild(menuElGet(d));
            });
            this.favoritesList.appendChild(div);
            let editBook = div.querySelector('.editBook');
            editBook.addEventListener('click', function () {
                let txt_edit = document.querySelector('.txt_edit') as HTMLInputElement,
                    pValue = p.innerHTML;
                popoverToggle(MENU_FAVORITE.favEditDom);
                // mui().popover('toggle');
//                               txt_edit.focus();
                if (this.dataset.edit === "") {
                    txt_edit.value = "默认分组";
                }
                else {
                    txt_edit.value = pValue;
                }
                MENU_FAVORITE.valueObtain = pValue;
                MENU_FAVORITE.parentNode = this;
                if (MENU_FAVORITE.funcNumber) {
                    MENU_FAVORITE.toggleConGroup();
                    MENU_FAVORITE.toggleEditGroup();
                    MENU_FAVORITE.funcNumber = false;
                }

            });
        });
        this.favoritesList.classList.toggle('no-data', this.favoritesList.innerHTML === '');
    }

    constructor(private para) {
        let content = <div class="slide-panel-wrapper"/>;
        d.append(para.container, content);
        let isAndroid4 = false;
        if(/(Android)/i.test(navigator.userAgent)){
            let andrVersionArr = navigator.userAgent.match(/Android\s*(\d+)/);
            //去除匹配的第一个下标的元素
            let version = andrVersionArr && andrVersionArr[1] ? parseInt(andrVersionArr[1]) : 5;
            isAndroid4 = version <= 4
        }
        let str = navigator.userAgent.toLowerCase();
        let ver = str.match(/cpu iphone os (.*?) like mac os/);
        if(ver && ver[1]){
            let version = parseInt(ver[1]);
            if(version <= 10){
                document.documentElement.classList.add('no-overflow-scrolling');
            }
        }
        // 实例化Tab控件
        this.slideTab = new SlideTab({
            tabParent: content,
            panelParent: content,
            onChange: (index) => {
                console.log(index);
            },
            isPulldownRefresh: isAndroid4 ? -1 : 0,
            tabs: [
                {
                    title: '首页',
                    dom:  this.homeList = <ul class="mui-table-view mui-grid-view mui-grid-9 full-height has-header has-search"/>,
                },
                {
                    title: '收藏',
                    dom:  this.favoritesList = <ul class="mui-table-view mui-grid-view mui-grid-9 full-height has-header has-search"/>,
                    dataManager: {
                        render: (start, length, data, isRefresh) => {
                            this.initFavorList(data.slice(start, start + length), isRefresh);
                        },
                        isPulldownRefresh: true,
                        ajaxFun: (obj) => {
                            return new Promise<{data: obj[], total: number}>((resolve, reject) => {
                                let ajaxData = {
                                    pageparams: '{"index"=' + obj.current + ', "size"=' + obj.pageSize + '}',
                                    action: 'query'
                                };

                                BwRule.Ajax.fetch(CONF.ajaxUrl.menuFavor, {
                                    data: ajaxData
                                }).then(({response}) => {
                                    console.log(response);
                                    resolve({
                                        data: response.data || [],
                                        total: response.head ? (response.head.totalNum || 0): 0,
                                    });
                                    // fav.appendChild(fragment);
                                })
                            })
                        }
                    }
                },
                {
                    title: '最近',
                    dom:  this.recentList = <ul class="mui-table-view mui-grid-view mui-grid-9 full-height has-header has-search"/>,
                    dataManager: {
                        render: (start, length, data, isRefresh) => {
                            this.initRecentList(data.slice(start, start + length), isRefresh);
                        },
                        isPulldownRefresh: true,
                        ajaxFun: (obj) => {
                            return new Promise<{data: obj[], total: number}>((resolve, reject) => {
                                let ajaxData = {
                                    pageparams: '{"index"=' + obj.current + ', "size"=' + obj.pageSize + '}',
                                    action: 'query'
                                };

                                BwRule.Ajax.fetch(CONF.ajaxUrl.menuHistory, {
                                    data: ajaxData
                                }).then(({response}) => {
                                    console.log(response);
                                    resolve({
                                        data: response.data || [],
                                        total: response.head ? (response.head.totalNum || 0): 0
                                    });
                                    // fav.appendChild(fragment);
                                })
                            })
                        }
                    }
                }
            ],
        });

        // 添加样式
        let tabWrapper = this.slideTab.tabContainer,
            panelWrapper = this.slideTab.panelContainer;
        // tabWrapper.className = tabWrapper.className +
        //     ' mui-slider-indicator mui-segmented-control mui-segmented-control-inverted';
        // d.queryAll('li', tabWrapper).forEach((li) => {
        //     li.classList.add('mui-control-item');
        // });
        // panelWrapper.classList.add('mui-slider-group');
        // d.queryAll('.tab-pane', panelWrapper).forEach((el) => {
        //     el.className = el.className + ' mui-slider-item mui-control-content mui-active';
        // });


        d.on(panelWrapper, 'click', 'li[data-href]', function () {
            sys.window.open({url: this.dataset.href, gps: !!parseInt(this.dataset.gps)});
        });

        d.on(d.query('.tab-pane[data-index="1"]', panelWrapper), 'press', 'li.mui-table-view-cell', function () {
            let type = 'cancel';
            MENU_FAVORITE.toggleFavSheet(this, type, {
                favid: this.dataset.favid,
                link: this.dataset.href
            });
        });

        this.getHomeData(para);
        d.on(content, 'click', '.home-load-error', () => {
            this.getHomeData(para);
        });

        sys.window.close = double_back;
        sys.window.wake("refreshHomeData", null);

    }

    protected getHomeData(para){
        BwRule.Ajax.fetch(tools.url.addObj(CONF.ajaxUrl.menu, {output: 'json'}), {
            loading: {
                msg: '首页数据加载中...'
            }
        }).then(({response}) => {
            console.log(response);
            let data = tools.keysVal(response, 'body', 'elements'),
                nodeId = response.nodeId || '';

            if(data){
                // 初始化首页数据
                this.initHomeList(data, true);
            }else{
                Modal.alert('获取首页数据失败');
            }

            new Search({
                nodeId: para.nodeId,
                baseUrl: para.baseUrl,
                searchBtn: para.searchBtn
            })
        }).catch(() => {
            this.homeList.innerHTML = '<div class="home-load-error"></div>';
            // Modal.alert('获取首页数据失败');
        });
    }

    protected static createHomeList(menu: obj): HTMLLIElement{
        return  <li data-href={BW.CONF.siteUrl + menu.menuPath.dataAddr} data-gps={menu.menuPath.needGps} class="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3">
            <a>
                <span className={'mui-icon' + ' ' + menu.menuIcon}/>
                <div class="mui-media-body">{menu.menuName}</div>
            </a>
        </li>
    }
}

function menuElGet(menu: obj) {
    return <li
        style="border-style: none"
        data-favid={menu.favid}
        data-href={menu.url}
        data-gps={menu.gps}
        className="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3">
        <a>
            <span className={`mui-icon${menu.icon}`}></span>
            <div className="mui-media-body">{menu.caption}</div>
        </a>
    </li>
}