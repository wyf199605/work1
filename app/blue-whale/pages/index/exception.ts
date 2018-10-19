import sys = BW.sys;
import d = G.d;
import {BugReportModal} from "../../module/BugReport/BugReport";

export = class errorPage {
    constructor(para) {
        d.on(para.buttons, 'click', '[data-action]', function () {
            switch (this.dataset.action) {
                case 'bugReport' :
                    new BugReportModal(-1, false, {
                        url: location.href,
                        param: '',
                        reqType: '0',
                        errMsg: para.errMsg
                    });
                    break;
                case 'back':
                    sys.window.backHome();
                    break;
                case 'goLogin':
                    sys.window.logout();
                    break;
            }
        });
    }
}
