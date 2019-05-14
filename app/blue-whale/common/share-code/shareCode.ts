/// <amd-module name="ShareCode"/>
import { BwRule } from "../rule/BwRule";
import CONF = BW.CONF;
import sys = BW.sys;

/**
* 二维码分享扫码
*/
export class ShareCode {

    constructor() {
        this.shareCode();
    }
    shareCode() {
        let _this = this;
        console.log('share start');
        let code = "";
        let lastTime, nextTime;
        let lastCode, nextCode;
        document.onkeypress = function (e) {
            nextCode = e.which;
            if (e.which === 13) {
                if (code.length < 2) { //手动输入的时间不会让code的长度大于2，所以这里只会对扫码枪有效
                    return
                }
                lastTime = null;
                lastCode = null;
                code = '';
                return;
            }
            nextTime = new Date().getTime();
            if (!lastTime && !lastCode) {
                code += e.key;
            }
            if (lastCode != null && lastTime != null && nextTime - lastTime <= 30) {
                code += e.key;
            } else if (lastCode != null && lastTime != null && nextTime - lastTime > 500) {//当扫码前有keypress事件时,防止首字缺失
                code = e.key;
                console.log(code);
            }


            lastCode = nextCode;
            lastTime = nextTime;
            // console.log(code, code.length);
            if (code.length === 38) {
                console.log(code, nextCode, nextTime);
                _this.codeXhr(code)
            }
        };



    }
    codeXhr(code) {
        BwRule.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/null/commonsvc/scan", {
            data: {
                code
            }
        }).then(({ response }) => {
            console.log(response);

            if (response.errorCode === 0) {
                console.log(code);

                BwRule.Ajax.fetch(CONF.siteUrl + response.next.url, {
                    data: {
                        [response.next.vars[0]]: code
                    }

                }).then(({ response }) => {
                    console.log('test', response);
                    // sys.window.opentab(void 0, void 0, noShow);
                    let lockKey: string, hidden: [];

                    response.dataArr.forEach((col, index) => {
                        switch (col.NAME) {

                            case 'are_id':

                                break;
                            case 'USERNAME':
                                break;
                            case 'userid':
                                lockKey = col.VALUE
                                break;
                            case 'auth_code':
                                break;
                            case 'hideBaseMenu':
                                hidden = col.VALUE.split(',');
                                break;
                            case 'PLATFORM_NAME':
                                break;


                        }
                    });
                    BW.sysPcHistory.setLockKey(lockKey);
                    BW.sysPcHistory.setInitType('1');
                    // sys.window.opentab(void 0, void 0, hidden);
                }).catch(err => {
                    console.log(err);
                })

            }
        });
    }
}