/// <amd-module name="FqaPcModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Panel} from "../../../global/components/view/panel/Panel";
import {IFqaModalPara} from "./fqa";
import tools = G.tools;
import d = G.d;
export class FqaPcModal{
    protected modal: Modal;
    constructor(para: IFqaModalPara){
        let body = <div className="pc-fqa-content"/>;
        FqaPcModal.initPanel(body);
        this.modal = new Modal({
            container: para.container,
            body,
            isShow: true,
            position:'full',
            className: 'pc-fqa-modal',
            isOnceDestroy: true,
            header:'常见问题',
        });
        this.modal.className = 'full-screen-fixed';
        this.modal.className = 'fqa-pc-modal';
    }
    static initPanel(el: HTMLElement) {
        d.append(el,FqaPcModal.initDownloadTap());
        d.append(el,FqaPcModal.initInstallTap());
        d.append(el,FqaPcModal.initRegisterTap());
        d.append(el,FqaPcModal.initLoginTap());
        d.append(el,FqaPcModal.initLoginErrorTap());
        d.queryAll('img[data-src]', el).forEach((img: HTMLImageElement) => {
            img.src = img.dataset['src'];
            img.removeAttribute('data-src');
        });
        d.on(d.query('a[data-href]', el), 'click', function() {
            let url = this.dataset["href"];
            if(url){
                BW.sys.window.open({url, isDownLoad: true});
            }
        });
    }
    static initDownloadTap():HTMLElement{
        return <div className="fqa-modal-item">
            <div className="fqa-modal-title"><i class="question fqa-font">Q</i>1.PC端如何下载速狮后台 </div>
            <div className="fqa-modal-content">
                <p><i class="answer fqa-font">A</i>浏览器打开链接<a data-href="https://bw.sanfu.com/FastLion.msi">https://bw.sanfu.com/FastLion.msi</a>下载后双击进行安装</p>
                <p><b>注意：</b>默认的安装路径是C:\\FastLion\\【安装路径最好是没有中文，空格，特殊符号，最好直接安装在磁盘路径下】</p>
                <p>安装成功后会在桌面创建一个快捷图标，双击图标即可登录</p>
                <p>卸载跟升级：在开始->所有程序->速狮软件->速狮后台下有卸载和启动的快捷图标，如果后续有更新，可以重新下载安装，或者根据系统提示自动更新</p>
            </div>
        </div>
    }
    static initInstallTap(): HTMLElement{
        return <div className="fqa-modal-item">
            <div className="fqa-modal-title"><i class="question fqa-font">Q</i>2.指纹设备安装问题</div>
            <div className="fqa-modal-content">
                <p><i class="answer fqa-font">A</i>指纹设备分为3种（银色，黑色，紫色），速狮后台已经集成了三种指纹仪设备，所以无需安装设备即可使用。</p>
                <p>由于使用指纹设备可能需要启动时间，如若遇到指纹启动时间太长，或者启动失败，需关闭该页面，重新打开即可。或者关闭APP，重新打开应用。</p>
                <p>以上方法若仍然无效，请联系工作人员</p>
            </div>
        </div>
    }
    static initRegisterTap():HTMLElement{
        return <div className="fqa-modal-item">
            <div className="fqa-modal-title"><i class="question fqa-font">Q</i>3.如何正确注册手机号码及遇到问题该如何处理</div>
            <div className="fqa-modal-content">
                <p><i class="answer fqa-font">A</i>安装成功后，打开速狮后台，正常情况下会出现如图1所示界面</p>
                <div class="fqa-modal-img"><img src="" data-src={FqaPcModal.initUrl("../img/fqa-pc/register.png")} alt="注册页面"/></div>
                <p>如果出现图1所示，请输入熊猫后台的手机号码和验证码，如果手机号码和熊猫里面的号码不匹配，将会出现如图2所示，出现这种情况，请自行去bpm更改手机号码</p>
                <div class="fqa-modal-img"><img src="" data-src={FqaPcModal.initUrl("../img/fqa-pc/register1.png")} alt="手机号码错误"/></div>
                <p>如果点击注册提示“设备注册数量已达上限”，如图3所示。请点击前往解绑按钮，然后点击解绑，成功返回后直接注册按钮，如果解绑完后再次点击注册出现图3情况，请按照图3情况再次操作。</p>
                <div class="fqa-modal-img"><img src="" data-src={FqaPcModal.initUrl("../img/fqa-pc/register2.png")} alt="设备注册数量已达上限"/></div>
                <p>通过以上事项，基本上可以注册成功，如果还是未能注册成功，请联系QQ：1726015841。</p>
            </div>
        </div>
    }
    static initLoginTap():HTMLElement{
        return <div className="fqa-modal-item">
            <div className="fqa-modal-title"><i class="question fqa-font">Q</i>4.如何正确登录速狮后台</div>
            <div className="fqa-modal-content">
                <p><i class="answer fqa-font">A</i>注册成功后，会进入登录界面，如图4所示，在注册界面有2种登录方式，分别是帐号密码登录，指纹登录。下面分别介绍下这2种登录</p>
                <div class="fqa-modal-img"><img src="" data-src={FqaPcModal.initUrl("../img/fqa-pc/login.png")} alt="登录"/></div>
                <p>帐号密码登录：帐号为员工号，密码需要联系QQ：2276799304，重置或询问相关密码事项。 如果在该设备上登录不属于自己的员工号，会提示如图信息</p>
                <div class="fqa-modal-img"><img src="" data-src={FqaPcModal.initUrl("../img/fqa-pc/login1.png")} alt="账号密码登录"/></div>
                <p> 指纹登录：指纹登录跟熊猫的指纹登陆一样，需插入指纹仪</p>
            </div>
        </div>
    }
    static initLoginErrorTap(): HTMLElement{
        return <div className="fqa-modal-item">
            <div className="fqa-modal-title"><i class="question fqa-font">Q</i>5.遇到PC/手机号码更换导致登录失败</div>
            <div className="fqa-modal-content">
                <p><i class="answer fqa-font">A</i>更换PC</p>
                <p>在新电脑上,用原先手机号码注册,然后会提示前往解绑,然后点击解绑,再点注册</p>
                <div class="fqa-modal-img"><img src="" data-src={FqaPcModal.initUrl("../img/fqa-pc/loginerror.png")}/></div>
                <p>更换手机号码</p>
                <p>例如:旧号码1500000000---->新号码1800000000</p>
                <p>1.先用:1500000000在 其他未注册过的手机上点击注册,然后前往解绑,解绑后就不要在点击注册了.</p>
                <p>2.需要找人事更改手机号码为1800000000,然后才能用1800000000去注册.</p>
            </div>
        </div>
    }

    static initUrl(url){
        return G.requireBaseUrl + url;
    }
}