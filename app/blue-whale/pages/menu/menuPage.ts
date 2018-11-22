import BasicPage from "basicPage";

export = class menuPage extends BasicPage {
    constructor(private para) {
        super(para);
        let MENU = {
            openWindowWithBadge : (url, dom) => {
                let badge = dom.querySelector('[data-url]');
                let num = 0;
                if(badge){
                    num = parseInt(badge.textContent);
                }
                let data = badge ? {badge : num} : {};
                BW.sys.window.open({url:url,data:data}, this.url);
            }
        };
        $('.file-box').on('click', 'a[data-href]', function () {
            let parseVarList = JSON.parse(this.dataset.parse);
            MENU.openWindowWithBadge(tools.url.addObj(BW.CONF.siteUrl + this.dataset.href,G.Rule.parseVarList(parseVarList, {})), this);
        });
        function animationHover(element, animation) {
            element = $(element);
            element.hover(
                function () {
                    element.addClass('animated ' + animation);
                },
                function () {
                    setTimeout(function () {
                        element.removeClass('animated ' + animation);
                    }, 2000);
                });
        }
        $(document).ready(function(){
            $('.file-box').each(function() {
                animationHover(this, 'pulse');
            });
        });
    }

}