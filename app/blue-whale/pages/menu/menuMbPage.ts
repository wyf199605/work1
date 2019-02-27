import { MENU_FAVORITE } from "../../module/menuMrg/menuMrg";
import sys = BW.sys;
import tools = G.tools;
import { BwRule } from "../../common/rule/BwRule";
import CONF = BW.CONF;
import d = G.d;
import { Search } from "../../module/search/search";
import { Collect } from "../../module/collect/collect.mb";
function setBadge(badge, num) {
    if (num > 0) {
        badge.classList.remove('hide');
        badge.textContent = num;
    }
    else {
        badge.classList.add('hide');
    }
}
export = class menuMbPage {
    constructor(public para) {
        d.on(d.query('#list'), 'click', 'li.mui-table-view-cell[data-href]', function () {
            sys.window.open({ url: CONF.siteUrl + this.dataset.href, gps: !!parseInt(this.dataset.gps) });
        });

        d.on(d.query('#list'), 'press', 'li.mui-table-view-cell', function () {
            let test = true;
            if (test) {
                new Collect().addCollect({
                    dom:this,
                    favid: this.dataset.favid,
                    link: this.dataset.href
                });
            } else {
                let type = tools.isEmpty(this.dataset.favid) ? 'add' : 'cancel';
                MENU_FAVORITE.toggleFavSheet(this, type, {
                    favid: this.dataset.favid,
                    link: this.dataset.href
                });
            }


        });
        (function () {
            let badgesDom = document.querySelectorAll('.mui-badge:not([data-url=""])');
            function loadBadge(badges) {
                for (let i = 0, len = badges.length; i < len; i++) {
                    ((el) => {
                        // Rule.ajax(CONF.siteUrl + el.dataset.url, {
                        //     success : function (r) {
                        //         if(r.data[0].N !== undefined){
                        //             setBadge(el, parseInt(r.data[0].N));
                        //         }
                        //     }
                        // });
                        BwRule.Ajax.fetch(CONF.siteUrl + el.dataset.url)
                            .then(({ response }) => {
                                if (response.data[0].N !== undefined) {
                                    setBadge(el, parseInt(response.data[0].N));
                                }
                            });
                    })(badges[i]);
                }
            }
            loadBadge(badgesDom);
            window.addEventListener('refreshBadge', function () {
                loadBadge(badgesDom);
            });
        }());
        //sys.window.wake('wake');
        window.addEventListener('wake', function () {
            d.queryAll('.mui-badge:not([data-url=""])').forEach(function (el) {
                BwRule.Ajax.fetch(CONF.siteUrl + el.dataset.url)
                    .then(({ response }) => {
                        if (response.data[0].N !== undefined) {
                            setBadge(el, parseInt(response.data[0].N));
                        }
                    });

                // Rule.ajax(CONF.siteUrl + el.dataset.url, {
                //     success : function (r) {
                //         if(r.data[0].N !== undefined){
                //             setBadge(el, parseInt(r.data[0].N));
                //         }
                //     }
                // });
            });
        });
        new Search({
            nodeId: para.nodeId,
            baseUrl: para.baseUrl,
            searchBtn: para.searchBtn
        });
    }

}