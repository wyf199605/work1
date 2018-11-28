import CONF = BW.CONF;
import tools = G.tools;
import sys = BW.sys;
import d = G.d;
export = class mainMbPage {
    constructor(private para) {
//         mui.init({
//             swipeBack: false
//         });
//         mui.plusReady(function () {
//             //iOS防止回退
// //        if (mui.os.ios) {
//             let currentWebview = plus.webview.currentWebview();
//             // 关闭侧滑返回功能
//             currentWebview.setStyle({'popGesture':'none'});
// //        }
//         });

        let SUB_PAGE = {
            pagesContainer : document.getElementById('pagesContainer'),
            pages : {
                home : CONF.url.home,
                message : CONF.url.message,
                contacts : CONF.url.contact,
                myselfMenu : CONF.url.myselfMenu
            },
            lastShowPage : null,
            createIframes : function () {
                let pageName ,
                    iframes = [],
                    thisSubPage = this;
                for(pageName in this.pages){
                    if(this.pages.hasOwnProperty(pageName)){
                        let pageUrl = this.pages[pageName];
                        let iframe = d.create('<iframe data-page-name="' + pageName + '" class="full-height has-footer-tab hide" src="' + pageUrl + '"> </iframe>');
                        iframes.push(iframe);
                        thisSubPage.pagesContainer.appendChild(iframe);
                    }
                }
                return iframes;
            },
            autoShow : function () {
                this.pagesContainer.classList.remove('has-spinner');
                let firstIframe = this.pagesContainer.querySelector('[src="' + this.pages.home + '"]');
                this.lastShowPage = firstIframe;
                firstIframe.classList.remove('hide');
            },
            showIframe : function (pageName) {
                let iframe = this.pagesContainer.querySelector('[data-page-name="' + pageName + '"]');
                if(this.lastShowPage !== null){
                    this.lastShowPage.classList.add('hide');
                }
                iframe.classList.remove('hide');
                this.lastShowPage = iframe;
            },
            initPages : function () {
                let thisSubPage = this;
                let iframes = thisSubPage.createIframes();
                setTimeout(function () {
                    thisSubPage.autoShow();
                }, 500);

                let list = d.query('.mui-bar.mui-bar-tab');
                d.on(list, 'click', '[data-page-name]', function (e) {
                    d.queryAll('[data-page-name]', list).forEach((el) => {
                        el.classList.remove('mui-active');
                    });
                    d.closest((e.target as HTMLElement), '[data-page-name]').classList.add('mui-active');
                    thisSubPage.showIframe(this.dataset.pageName);
                });

                return iframes;
            }
        };
        let iframes = SUB_PAGE.initPages();
        sys.window.close = double_back;

        let hideMenu = localStorage.getItem('hideBaseMenu'),
            noShow = hideMenu ? JSON.parse(hideMenu) : [];
        noShow.forEach((name) => {
            let el = d.query(`[data-page-name=${name}]`, document.body);
            el && el.classList.add('hide');
        });
    }
}