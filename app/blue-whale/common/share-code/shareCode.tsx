/// <amd-module name="ShareCode"/>
import { BwRule } from "../rule/BwRule";
import CONF = BW.CONF;
import sys = BW.sys;
import { QrCode } from "../../../global/utils/QRCode";
import { DataManager } from '../../../global/components/DataManager/DataManager';
import { Paging } from "global/components/navigation/pagination/pagination";
import { Button, IButton } from "global/components/general/button/Button";
import d = G.d;
import { ButtonAction } from "../rule/ButtonAction/ButtonAction";

/** 
 * 分页器
*/
interface pageparams {
    index: number,
    size: number,
    total: number,
}

/**
* 二维码分享扫码
*/
export class ShareCode {
    url: string; // 当前路由
    queryer: { queryparams0?: any, queryoptionsparam: any }; // 查询器的数据
    pageparams: pageparams;   // 当前页
    currentAddr: string; // 当前节点的UI地址
    currentEnv: string; // 当前环境 恒裕/三福/速狮
    keyField: string;  // 根据ui接口获取keyField
    selectedRow: Array<object> // 表格选中的行
    shareDiv:HTMLElement; // 分享


    constructor(selectedRow) {
        
        console.log(selectedRow);
        this.selectedRow = selectedRow;
        this.url = sessionStorage.getItem('tableUrl');
        this.currentAddr = this.url.split('sf')[1]
        this.currentEnv = (this.url.split('sf')[1]).split('/')[1];
        

        this.createCodeBtnEle();

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
                    let lockKey: string, hidden;

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
    /**
     * 生成分享二维码
     */
    generateCode() {
        this.pageparams = JSON.parse(sessionStorage.getItem('pageparams'));
        this.queryer = JSON.parse(sessionStorage.getItem('queryer'));
        let selectObj = {
            pageparams: this.pageparams,
        }
        Object.keys(this.queryer).forEach(key => {
            selectObj[key] = JSON.parse(this.queryer[key]);
        })
        
        BwRule.Ajax.fetch(`${this.url}?output=json`).then(({response}) => {
            this.keyField = response.body.elements[0].keyField || null;
            let data = [];
            if(this.keyField) {
                data = this.selectedRow.map(item => item[this.keyField]);
            }
            let address = `${CONF.siteUrl}/${this.currentEnv}/null/sharecode/code`;
            BwRule.Ajax.fetch(address, {
                type: 'POST',
                data: {
                    data,
                    select: selectObj,
                    addr: this.currentEnv
                }
            }).then(({response}) => {
                let sharePage:HTMLDivElement = <div class="share-page">
                        <div class="share-page-qrcode"></div>
                </div>
                d.query('body').append(sharePage);
                QrCode.toCanvas(response.code, 180, 180, d.query(".share-page-qrcode"));

                let shareBtnList: HTMLElement = <div class="share-page-methods">
                    <ul>
                        <li ><i class="mui-icon iconfont iconweixin" data-type="weixin"></i><span>微信</span></li>
                        <li ><i class="mui-icon iconfont iconlianjie" data-type="link"></i><span>复制链接</span></li>
                        <li ><i class="mui-icon iconfont iconqq" data-type="qq"></i><span>QQ</span></li>
                        <li ><i class="mui-icon iconfont iconyoujian" data-type="email"></i><span>邮件</span></li>
                        <li ><i class="mui-icon iconfont icontupian" data-type="img"></i><span>保存图片</span></li>
                    </ul>
                    <p class="share-page-cancel" data-type="cancel">取消</p>
                </div>
                sharePage.appendChild(shareBtnList);
                shareBtnList.onclick = (e:Event) => {
                    let type = e.target['dataset']? e.target['dataset'].type : '';
                    switch(type) {
                        case 'weixin':
                            break;
                        case 'link':
                            break;
                        case 'qq':
                            break;
                        case 'email':
                            break;
                        case 'cancel':
                            d.query('body').removeChild(sharePage);
                            break;
        
                    }
                }
            })
        })

    }

    /**
     * 二维码分享按钮事件
     */
    btnClk = () => {
        // console.log('click');
        console.log(ButtonAction.get());
        this.shareDiv.classList.remove('show');
        this.shareDiv.classList.add('hide');
        // this.generateCode();
        let shareEle: HTMLDivElement = <div class="share-baffle ">
            <p class="qr-code-share">二维码分享</p>
            <p class="fastlion-share">速狮分享</p>
            <p class="cancel-share">取消</p>
        </div>

        shareEle.addEventListener('click',(e:Event) => {
            switch(e.target['className']) {
                case 'qr-code-share':
                    this.generateCode();
                    d.query('body').removeChild(shareEle);
                    break;
                case 'fastlion-share':
                    d.query('body').removeChild(shareEle);
                    break;
                case 'cancel-share':
                default: 
                    d.query('body').removeChild(shareEle);
                    break;
            }
        })

        d.query('body').appendChild(shareEle);
    }
    
    /**
     * 生成二维码点击按钮
     */
    createCodeBtnEle(): void {
        let ele: HTMLDivElement= <div class="share-code-list "></div>
        this.shareDiv = <div class="share-code ">
            <div class="share-code-square"></div>
            {ele}
        </div>
        
        
        d.query('body>header').appendChild(this.shareDiv);
        this.shareDiv.onclick = () => {
            console.log(123);
            // this.shareDiv.classList.add('hide-code');
            d.query('body>header').removeChild(this.shareDiv);
        }
        
        let buttonData: IButton = {
            container: ele,
            content: '分享',
            icon: 'iconfenxiang',
            iconNoPre: true,
            onClick: this.btnClk,
            className: 'share-code-btn '
        }
        new Button(buttonData)
        
        // $('body > header').append(dom);
          
    }
    
}