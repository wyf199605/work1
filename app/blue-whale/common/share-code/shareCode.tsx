/// <amd-module name="ShareCode"/>
/// <amd-dependency path="html2canvas" name="html2canvas"/>
import { BwRule } from "../rule/BwRule";
import CONF = BW.CONF;
import sys = BW.sys;
import { QrCode } from "../../../global/utils/QRCode";
import { Button, IButton } from "global/components/general/button/Button";
import d = G.d;
import tools = G.tools;
import Shell = G.Shell;
import { Modal } from "../../../global/components/feedback/modal/Modal";
import { ShellAction } from "global/action/ShellAction";

declare const html2canvas;

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
    shareDiv: HTMLElement; // 分享
    websocket: any;
    tagId: string; // 邮件分享

    constructor(selectedRow, tagId?: string) {


        // console.log(selectedRow);
        this.selectedRow = selectedRow;
        this.tagId = tagId;
        this.url = localStorage.getItem('tableUrl');
        // alert('lc'+this.url);
        this.currentAddr = this.url.split('sf')[1];

        this.currentEnv = (this.url.split('sf')[1]).split('/')[1];
        // alert('t'+tools.isMb)
        tools.isMb ? this.createCodeBtnEle() : this.generateCode();
        this.initWebscoket();

    }

    protected initWebscoket() {
        if (!G.tools.isMb) {
            return;
        }
        require(['webscoket'], (webscoket) => {
            this.websocket = new webscoket({
                mgrPath: BW.CONF.siteUrl,
                wsUrl: BW.CONF.webscoketUrl
            });
        });
    }

    /**
     * pc分享页面
     */
    createShareCodePage(code) {
        let btnParent: HTMLElement = <section class="share-code-pc-btns"></section>;
        let cancelEle: HTMLSpanElement = <span class="share-code-pc-cancel">x</span>
        let sharePcEle: HTMLDivElement = <div class="share-code-pc">
            <div class="share-code-pc-container">
                <section class="share-code-pc-header">
                    <span>分享</span>
                    {cancelEle}
                </section>
                <section class="share-code-pc-main"></section>
                {/* {btnParent} */}

            </div>
        </div>
        d.query('body').appendChild(sharePcEle);
        console.log(code);
        QrCode.toCanvas(code, 180, 180, d.query(".share-code-pc-main"));
        let copyLinkBtn: IButton = {
            container: btnParent,
            content: '复制链接',
            onClick: () => {

            },
            className: 'share-code-pc-btns-btn'
        }
        let saveQrCode: IButton = {
            container: btnParent,
            content: '保存二维码',
            onClick: () => {
                let imgSrc = d.query('.share-code-pc-main > img')['src'];
                console.log(imgSrc);
                ShareCode.downloadImg('二维码.png', imgSrc);
            },
            className: 'share-code-pc-btns-btn'
        }
        new Button(copyLinkBtn);
        new Button(saveQrCode);
        cancelEle.onclick = () => {
            d.query('body').removeChild(sharePcEle);
        }
    }
    //pc下载图片
    static downloadImg = (fileName, content) => {
        let aLink = document.createElement('a');
        let blob = ShareCode.base64ToBlob(content); //new Blob([content]);

        let evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        Modal.toast('下载成功')
        // aLink.dispatchEvent(evt);
        //aLink.click()
        aLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));//兼容火狐
    }
    //base64转blob
    static base64ToBlob = (code) => {
        let parts = code.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;

        let uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    }

    /**
     * 扫码 获得分享数据
     */
    static scanCode() {
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
    static codeXhr(code) {

        let tableUrl = location.href;
        let currentEnv = (tableUrl.split('sf')[1]).split('/')[1];

        BwRule.Ajax.fetch(CONF.siteUrl + `/${currentEnv}/null/commonsvc/scan`, {
            data: {
                code
            }
        }).then(({ response }) => {

            if (response.errorCode === 0) {
                console.log(code);
                BwRule.Ajax.fetch(CONF.siteUrl + response.next.url, {
                    data: {
                        [response.next.vars[0]]: code
                    }

                }).then(({ response }) => {
                    if (response.errorCode === 0) {
                        let url = `${CONF.siteUrl}${response.body.bodyList[0].addr}`;

                        // params = params.length > 0 ? params.substring(0,params.length - 1) : params;
                        // url += params;
                        let keyField = {
                            data: response.body.bodyList[0].data ? response.body.bodyList[0].data : [],
                            key: response.body.bodyList[0].keyField ? response.body.bodyList[0].keyField : ''
                        }
                        localStorage.setItem('keyField', JSON.stringify(keyField));
                        localStorage.setItem('autTag', '0');
                        localStorage.setItem('queryer', JSON.stringify(response.body.bodyList[0].select));
                        console.log(JSON.stringify(response.body.bodyList[0].select))
                        // console.log('sssss', params);
                        sys.window.open({ url });

                    }
                    // console.log('test', response);
                    // // sys.window.opentab(void 0, void 0, noShow);
                    // let lockKey: string, hidden;

                    // response.dataArr.forEach((col, index) => {
                    //     switch (col.NAME) {

                    //         case 'are_id':

                    //             break;
                    //         case 'USERNAME':
                    //             break;
                    //         case 'userid':
                    //             lockKey = col.VALUE
                    //             break;
                    //         case 'auth_code':
                    //             break;
                    //         case 'hideBaseMenu':
                    //             hidden = col.VALUE.split(',');
                    //             break;
                    //         case 'PLATFORM_NAME':
                    //             break;


                    //     }
                    // });
                    // BW.sysPcHistory.setLockKey(lockKey);
                    // BW.sysPcHistory.setInitType('1');
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
        this.pageparams = JSON.parse(localStorage.getItem('pageparams'));
        this.queryer = JSON.parse(localStorage.getItem('queryer'));
        let selectObj = {
            pageparams: this.pageparams,
        }
        // // debugger;
        // alert(this.queryer);
        this.queryer && Object.keys(this.queryer).forEach(key => {
            selectObj[key] = this.queryer[key];
        })
        let getUrl = this.url.indexOf('?') === -1 ? `${this.url}?output=json` : `${this.url}&output=json`
        BwRule.Ajax.fetch(getUrl).then(({ response }) => {
            this.keyField = response.body.elements[0].keyField || null;
            let data = [];
            if (this.keyField) {
                data = this.selectedRow.map(item => item[this.keyField]);
            }
            let address = `${CONF.siteUrl}/${this.currentEnv}/null/sharecode/code`;
            BwRule.Ajax.fetch(address, {
                type: 'POST',
                data: {
                    data,
                    keyField: this.keyField,
                    select: selectObj,
                    addr: this.currentAddr
                }
            }).then(({ response }) => {
                if (tools.isMb) {
                    
                    let sharePage: HTMLDivElement = <div class="share-page">
                        <div class="share-page-qrcode"></div>
                    </div>
                    // d.query('body').removeChild(d.query('.share-page'))
                    d.query('body').appendChild(sharePage);
                    let qr = QrCode.toCanvas(response.code, 180, 180, d.query(".share-page-qrcode"));
	    // var cas = document.createElement( 'canvas' );
	    // var ctx = cas.getContext( '2d' );
 
	    // cas.width = 100, cas.height = 100;
	    // ctx.fillStyle = 'pink';
	    // ctx.fillRect( 0, 0, 100, 100 );
 
	    // 把画布的内容转换为base64编码格式的图片
        // var data = cas.toDataURL( 'image/png', 1 );  //1表示质量(无损压缩)
      
 
        // 把画布的内容转换为base64编码格式的图片

                    let emailDom: HTMLElement = this.tagId ?
                        <li ><i class="mui-icon iconfont iconyoujian" data-type="email"></i><span>邮件</span></li>
                        : <li class="disabled"><i class="mui-icon iconfont iconyoujian disabled" data-type="email"></i><span>邮件</span></li>;
                    let shareBtnList: HTMLElement = <div class="share-page-methods">
                        <ul>
                            <li ><i class="mui-icon iconfont iconweixin" data-type="weixin"></i><span>微信</span></li>
                            {/* <li ><i class="mui-icon iconfont iconlianjie" data-type="link"></i><span>复制链接</span></li>
                            <li ><i class="mui-icon iconfont iconqq" data-type="qq"></i><span>QQ</span></li> */}
                            {/* <li ><i class="mui-icon iconfont iconyoujian" data-type="email"></i><span>邮件</span></li> */}
                            {emailDom}
                            <li ><i class="mui-icon iconfont icontupian" data-type="saveImg"></i><span>保存图片</span></li>
                        </ul>
                        <p class="share-page-cancel" data-type="cancel">取消</p>
                    </div>
                    sharePage.appendChild(shareBtnList);
                    let qrWhiteBorder;
                    html2canvas(qr).then(function(canvas) {
                        qrWhiteBorder = canvas;
                    });
                    shareBtnList.onclick = (e: Event) => {
                        let type = e.target['dataset'] ? e.target['dataset'].type : '';

                        let imgSrc = qrWhiteBorder.toDataURL( 'image/png', 1 );
                        
                        switch (type) {
                            case 'weixin':
                                Shell.base.wxShare(imgSrc);
                                break;
                            // case 'link':
                            //     break;
                            // case 'qq':
                            //     break;
                            case 'email':
                                if (!this.tagId) return;
                                BwRule.Ajax.fetch(CONF.ajaxUrl.mailTemp + '?output=json', {
                                    type: 'post',
                                    data: {
                                        tag_id: this.tagId,
                                        file_name: '邮件分享',
                                        content: imgSrc,
                                    }
                                }).then(({ response }) => {
                                    let tempId = response && response.body && response.body.bodyList
                                        && response.body.bodyList[0] && response.body.bodyList[0].temp_id;
                                    sys.window.open({
                                        url: CONF.ajaxUrl.mailForward + '?temp_id=' + tempId,
                                    })
                                })
                                break;
                            case 'saveImg':
                                Shell.image.downloadImg(imgSrc, () => { });
                                break;
                            case 'cancel':
                                d.query('body').removeChild(sharePage);
                                break;

                        }
                    }
                } else {
                    console.log(response.code)
                    this.createShareCodePage(response.code);
                }

            })
        })

    }

    /**
     * 移动端二维码分享按钮事件
     */
    btnClk = () => {
        // d.query('body>header').removeChild(this.shareDiv);
        this.shareDiv.remove();
        let shareEle: HTMLDivElement = <div class="share-baffle ">
            <p class="qr-code-share">二维码分享</p>
            {/* <p class="fastlion-share">涂鸦分享</p> */}
            <p class="cancel-share">取消</p>
        </div>

        shareEle.addEventListener('click', (e: Event) => {

            switch (e.target['className']) {
                case 'qr-code-share':
                    this.generateCode();
                    d.query('body').removeChild(shareEle);
                    break;
                case 'fastlion-share':
                    d.query('body').removeChild(shareEle);
                    // alert('test');
                    let timer = setTimeout(() => {
                        clearTimeout(timer);
                        tools.isMb && Shell.image.getSignImg((res) => {
                            alert(123);
                            let emailDom: HTMLElement = this.tagId ?
                                <li ><i class="mui-icon iconfont iconyoujian" data-type="email"></i><span>邮件</span></li>
                                : <li class="disabled"><i class="mui-icon iconfont iconyoujian " data-type="email"></i><span>邮件</span></li>;
                            let shareBtnList: HTMLElement = <div class="share-page-methods">
                                <ul>
                                    <li ><i class="mui-icon iconfont iconweixin" data-type="weixin"></i><span>微信</span></li>
                                    {/* <li ><i class="mui-icon iconfont iconlianjie" data-type="link"></i><span>复制链接</span></li> */}
                                    {/* <li ><i class="mui-icon iconfont iconqq" data-type="qq"></i><span>QQ</span></li> */}
                                    {/* <li ><i class="mui-icon iconfont iconyoujian" data-type="email"></i><span>邮件</span></li> */}
                                    {emailDom}
                                    <li ><i class="mui-icon iconfont icontupian" data-type="saveImg"></i><span>保存图片</span></li>
                                </ul>
                                <p class="share-page-cancel" data-type="cancel">取消</p>
                            </div>

                            let sharePage: HTMLDivElement = <div class="share-page"></div>
                            d.query('body').appendChild(sharePage);
                            sharePage.appendChild(shareBtnList);
                            shareBtnList.onclick = (e: Event) => {
                                let type = e.target['dataset'] ? e.target['dataset'].type : '';
                                switch (type) {
                                    case 'weixin':
                                        Shell.base.wxShare(res.data);
                                        break;
                                    // case 'link':
                                    //     break;
                                    // case 'qq':
                                    //     break;
                                    case 'email':
                                        break;
                                    case 'saveImg':
                                        // const imgSrc = d.query('.share-page-qrcode img')['src'];
                                        Shell.image.downloadImg(res.data, () => { });
                                        break;
                                    case 'cancel':
                                        d.query('body').removeChild(sharePage);
                                        break;

                                }
                            }
                        });
                    }, 100);
                    break;
                case 'cancel-share':
                default:
                    document.querySelector('body').removeChild(shareEle);
                    break;
            }
        })

        d.query('body').appendChild(shareEle);
    }

    /**
     * 生成移动端二维码点击按钮
     */
    createCodeBtnEle(): void {
        let ele: HTMLDivElement = <div class="share-code-list "></div>
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
        let flag = false;
        let ScanBtn: IButton = {
            container: ele,
            content: '扫码',
            icon: 'iconsaoma',
            iconNoPre: true,
            onClick: () => {
                if (flag) {
                    return false;
                }
                flag = true;
                setTimeout(() => {
                    flag = false;
                }, 1500);
                ShellAction.get().device().scan({
                    callback: (event) => {
                        let detail = JSON.parse(event.detail);
                        if (detail.data.indexOf('share-') !== -1) {
                            ShareCode.codeXhr(detail.data);
                            return;
                        }

                        this.websocket.handleUrl(detail.data);
                    }
                });
            },
            className: 'share-code-btn '
        }
        new Button(buttonData);
        new Button(ScanBtn);

        // $('body > header').append(dom);

    }



}