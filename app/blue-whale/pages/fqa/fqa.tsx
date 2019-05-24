/// <amd-module name="FqaModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Panel} from "../../../global/components/view/panel/Panel";
import tools = G.tools;
import d = G.d;
import {ShellAction} from "../../../global/action/ShellAction";
import sys = BW.sys;

export interface IFqaModalPara {
    container?: HTMLElement,
}

export class FqaModal {
    protected modal: Modal;
    constructor(para: IFqaModalPara) {
        FqaModal.getDevice();
        let body = <div className="fqa-content"/>;
        FqaModal.initPanel(body);
        this.modal = new Modal({
            container: para.container,
            header: '常见问题',
            body,
            isShow: true,
            position: tools.isMb ? 'full' : '',
            width: '730px',
            className: 'fqa-modal',
            isOnceDestroy: true,
        });
    }

    // get isShow(){
    //     return this.modal.isShow;
    // }
    // set isShow(isShow: boolean){
    //     this.modal.isShow = isShow;
    // }

    static initPanel(el: HTMLElement) {
        let panel = new Panel({
            container: el,
            isOpenFirst: false,
            panelItems: [
                {
                    title: '手机如何下载蓝鲸后台？',
                    content: FqaModal.initDownloadTap(),
                },
                {
                    title: '如何安装？',
                    content: FqaModal.initInstallTap(),
                },
                {
                    title: '如何正确注册手机号码及遇到问题该如何处理？',
                    content: FqaModal.initRegisterTap(),
                },
                {
                    title: '如何正确登录蓝鲸后台？',
                    content: FqaModal.initLoginTap(),
                },
                {
                    title: '遇到手机/手机号码更换导致登录失败？',
                    content: FqaModal.initLoginErrorTap(),
                },
                {
                    title : '如果都无法解决注册问题，查看该选项',
                    content : <div> </div>
                }
            ],
            onChange: (data) => {
                let item = data.item,
                    wrapper = item.wrapper;
                if(item.selected) {
                    d.queryAll('img[data-src]', wrapper).forEach((img: HTMLImageElement) => {
                        img.src = img.dataset['src'];
                        img.removeAttribute('data-src');
                    });
                }
                if(data.index === 5){
                    item.content = this.initDeviceMsg();
                }
            }
        });
        d.on(d.query('a[data-href]', panel.wrapper), 'click', function() {
            let url = this.dataset["href"];
            if(url){
                BW.sys.window.open({url, isDownLoad: true});
            }
        });
    }

    static initDownloadTap(): HTMLElement{
        // sys.window.open({ url: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.sanfu.blue.whale'});
        return <div>
            <p>打开链接<a data-href="http://a.app.qq.com/o/simple.jsp?pkgname=com.sanfu.blue.whale">http://a.app.qq.com/o/simple.jsp?pkgname=com.sanfu.blue.whale</a>, 为了方便用户下载，这里也提供一个二维码，使用手机浏览器或者苹果相机（也可以使用qq或者微信扫一扫功能）， 都能扫码下载，二维码如图：</p>
            <img className="qrcode" src="" data-src={FqaModal.initUrl("../img/fqa/qrcode.png")} alt="下载二维码"/>
            <p>如果是安卓手机，界面如图所示：</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/androidDownload.png")} alt="安卓下载页面"/>
            <p>请点击<span className="bold">普通下载</span>,如果点击安全下载，会下载应用宝（不是我们想要的）。</p>
            <p>如果是苹果手机，界面如图所示:</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/IOSDownload.png")} alt="苹果下载页面"/>
            <p>会自动跳转到苹果商店，请直接点击下载。</p>
        </div>
    }

    static initInstallTap(): HTMLElement{
        return <div>
            <p>苹果手机在苹果商店下载，下载完成后会自动安装（苹果仅支持9.0及以上系统，如果低于9.0将无法安装）如图所示：</p>
            {/*<img src="" data-src={FqaModal.initUrl("../img/fqa/IOSDownloadError.png")} alt="苹果手机下载失败"/>*/}
            <p>现在主要讲解下安卓手机的安装步骤，下载成功后，会弹出类似图3所示：</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/androidDownloadSuccess.png")} alt="安卓手机下载成功"/>
            <p>请点击“仅允许本次安装”，会进入开始安装界面，这时候提示该app需要的权限，请点击信任或者默认情况下点击下一步或者安装，开始等待安装结束。如图所示：</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/androidInstallSuccess.png")} alt="安卓手机安装成功"/>
            <p>其它牌子手机，如oppo，vivo这两款手机，他们在安装的时候可能需要先验证身份，如图所示，请按照手机的方法输入账号对应的密码，或者去权限里面讲指纹功能用于安装选项打开，如图所示：</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/androidVerify.png")} alt="安卓手机验证身份"/>
        </div>
    }

    static initRegisterTap(): HTMLElement{
        return <div>
            <p>安装成功后，打开蓝鲸后台app，正常情况下会出现如图所示界面。</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/register.png")} alt="注册页面"/>
            <p>如果出现图5所示，请输入熊猫后台的手机号码和验证码，如果手机号码和熊猫里面的号码不匹配，将会出现如图7所示，出现这种情况，请自行去bpm更改手机号码：</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/registerError.png")} alt="注册失败"/>
            <p>如果点击获取验证码出现手机号格式有误，如图所示，请联系QQ：1726015841</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/telError.png")} alt="手机号码错误"/>
            <p>如果点击注册的时候提示“验证码有误或已失效，请重新获取验证码”。如图所示，请重新获取，获取成功输入点击注册按钮。</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/checkCodeError.png")} alt="验证码错误"/>
            <p>如果点击注册提示“设备注册数量已达上限”，如图所示。请点击前往解绑按钮，然后点击解绑，成功后返回点击注册按钮。</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/registerCountError.png")} alt="注册数量已达上限"/>
            <p>如果点击注册提示“设备注册数量已达上限”，如图所示。请点击前往解绑按钮，然后点击解绑，成功后返回点击注册按钮。</p>
        </div>
    }

    static initLoginTap(): HTMLElement{
        return <div>
            <p>注册成功后，会进入登录界面，如图所示，在注册界面有4种登录方式，分别是帐号密码登录，指纹登录，微信登录,短信验证码登录。下面分别介绍下这三种登录：</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/login.png")} alt=""/>
            <p>1.帐号密码登录：帐号为员工号，密码需要联系QQ：2276799304，重置或询问相关密码事项。 如果在该设备上登录不属于自己的员工号，会提示如图信息</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/login2.png")} alt=""/>
            <p>2.指纹登录：指纹登录需要手机设备上有指纹识别功能，并且在指纹登录的时候验证通过才能登录。</p>
            <p>3.微信登录：使用微信登录的时候需要本机的微信登录和熊猫微信后台的微信一直才能登录，否则会出现如图12所示，如果出现该问题，请在手机上登录熊猫后台绑定的微信，或者在熊猫里面的微信账号修改为当前登录的帐号（正确的帐号能够收到每个季度的优惠券）。</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/login3.png")} alt=""/>
            <p>4.短信验证码登录：输入注册该设备的手机号码，点击获取短信验证码，验证码时效性1分钟，否则需要重新获取。</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/login4.png")} alt=""/>
        </div>
    }

    static initLoginErrorTap(): HTMLElement{
        return <div>
            <p>1.更换手机</p>
            <p>在新手机上，用原先手机号码注册，然后会提示前往解绑，然后点击解绑，再点注册。</p>
            <img src="" data-src={FqaModal.initUrl("../img/fqa/loginError.png")} alt=""/>
            <p>2.更换手机号码</p>
            <p>例如：旧号码1500000000---->新号码1800000000；</p>
            <p>先用1500000000在其他未注册过的手机上点击注册，然后前往解绑，解绑后就不要在点击注册了。</p>
            <p>需要找人事更改手机号码为1800000000，然后才能用1800000000去注册。</p>
        </div>;
    }

    static deviceData = {};
    static getDevice() {
        if (sys.os === 'ip') {
            let shell:any = ShellAction.get();
            shell.device().getInfo({callback:(e:CustomEvent) => {
                    let json = JSON.parse(e.detail);
                    if (json.success) {
                        this.deviceData = json.msg;
                    } else {
                        Modal.toast(json.msg);
                    }
                }});
        } else if (sys.os === 'ad') {
            let shell:any = ShellAction.get();
            let data = shell.device().getInfo().data;
            if(data.success) {
                this.deviceData = (data.msg);
            } else {
                Modal.toast(data.msg);
            }
        } else if('AppShell' in window) {
            this.deviceData = G.Shell.base.device.data;
        } else if ('BlueWhaleShell' in window) {
            let shell:any = ShellAction.get();
            this.deviceData = shell.device().getInfo().data;
        }
    }
    static initDeviceMsg() : HTMLElement{
        let device = this.deviceData as any;
        return <div>
            <p>请截图以下信息，发送给后台人员(QQ:303200649)或测试群</p>
            <p>uuid：{device.uuid}</p>
            <p>os_name：{device.name}</p>
            <p>os_version：{device.version}</p>
            <p>vendor：{device.vendor}</p>
            <p>model：{device.model}</p>
        </div>
    }

    static initUrl(url){
        return G.requireBaseUrl + url;
    }
}
