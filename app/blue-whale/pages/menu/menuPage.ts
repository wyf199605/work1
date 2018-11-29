import BasicPage from "basicPage";
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";

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
            let parse = this.dataset.parse, menuPath;
            try {
                menuPath = parse && JSON.parse(this.dataset.parse);
            }catch (e) {
                Modal.alert('后台返回JSON格式错误');
            }
            MENU.openWindowWithBadge(tools.url.addObj(BW.CONF.siteUrl + this.dataset.href,G.Rule.parseVarList(menuPath.parseVarList, {})), this);
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