import CONF = BW.CONF;
import sys = BW.sys;
import d = G.d;
export = class mainMbPage {
    constructor() {
        let pages = {
            home : CONF.url.home,
            message : CONF.url.message,
            contacts : CONF.url.contact,
            myselfMenu : CONF.url.myselfMenu
        };

        let hideMenu = localStorage.getItem('hideBaseMenu'),
            noShow = hideMenu ? JSON.parse(hideMenu) : [];
        noShow.forEach((name) => {
            let navbar = d.query('.mui-bar-tab');
            if(navbar){
                let el = d.query(`[data-page-name=${name}]`, navbar);
                el && el.classList.add('hide');
                delete pages[name];
            }
        });

        let SUB_PAGE = {
            pagesContainer : document.getElementById('pagesContainer'),
            pages,
            lastShowPage : null,
            createIframes : function (pageName) {
                if(this.pages.hasOwnProperty(pageName)){
                    let pageUrl = this.pages[pageName];
                    let iframe = d.create('<iframe data-page-name="' + pageName + '" class="full-height has-footer-tab hide" src="' + pageUrl + '"> </iframe>');
                    SUB_PAGE.pagesContainer.appendChild(iframe);
                }
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
                setTimeout(function () {
                    SUB_PAGE.autoShow();
                }, 500);

                let list = d.query('.mui-bar.mui-bar-tab'),
                    page = {
                        home : SUB_PAGE.createIframes('home')
                    };
                d.on(list, 'click', '[data-page-name]', function (e) {
                    let el = d.closest((e.target as HTMLElement), '[data-page-name]'),
                        name = el.dataset.pageName;
                    if(!page[name]){
                        page[name] = SUB_PAGE.createIframes(name);
                    }

                    d.queryAll('[data-page-name]', list).forEach((el) => {
                        el.classList.remove('mui-active');
                    });
                    d.closest((e.target as HTMLElement), '[data-page-name]').classList.add('mui-active');
                    SUB_PAGE.showIframe(this.dataset.pageName);
                });

            }
        };
        SUB_PAGE.initPages();
        sys.window.close = double_back;
    }
}