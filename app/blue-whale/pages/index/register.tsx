/// <amd-module name="RegPage"/>
import sys = BW.sys;
import CONF = BW.CONF;
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "global/components/feedback/modal/Modal";
import {ShellAction} from "global/action/ShellAction";
import d = G.d;
import tools = G.tools;
import Shell = G.Shell;
import {UnBinding} from "../../module/unBinding/UnBinding";
import {Button} from "../../../global/components/general/button/Button";
import {Loading} from "../../../global/components/ui/loading/loading";
import {Spinner} from "../../../global/components/ui/spinner/spinner";

interface IProps {
    goLogin: HTMLElement,   // 返回登录
    saveReg: HTMLElement,   // 注册
    sendVerify: HTMLElement,// 获取短信验证码
    tel: HTMLInputElement,  // 输入手机号
    verifyELCodeInput?:HTMLInputElement,    // 输入前端的验证码
    verifyELCode?: HTMLCanvasElement,       // 显示前端的验证码
    smsCheckCode: HTMLInputElement;         // 输入短信验证码
    fqaBtn?: Button,
}
declare const double_back: any;
/**
 * 移动和电脑的注册页面
 */
export class RegPage {
    constructor(private props: IProps) {
        let self = this;
        self.getDevice();
        // self.setVerifyCode();
        d.on(props.goLogin, 'click',() => {
            sys.window.load(CONF.url.login);
        });
        if(tools.isMb){
            this.code = this.renderCheckCode(props.verifyELCode);
            d.on(props.verifyELCode.parentElement, 'click', ()=>{
                // self.setVerifyCode();
                let canvas = <canvas width="80" height="30"/>;
                d.replace(canvas, props.verifyELCode);
                props.verifyELCode = canvas;
                this.code = this.renderCheckCode(props.verifyELCode);
            });
        }
        d.on(props.saveReg, 'click',() => {
            if (props.tel.value.trim().length === 0) {
                Modal.alert('请输入手机号');
                return;
            }
            if (props.verifyELCodeInput){
                if (!self.confirmLocalCode()) {
                    return;
                }
            }
            if(props.smsCheckCode.value.trim().length === 0){
                Modal.alert('请输入短信验证码');
                return;
            }
            if(!this.deviceData['uuid']){
                Modal.alert('获取不到设备UUID');
                return;
            }
            
            BwRule.Ajax.fetch(CONF.ajaxUrl.register, {
                type: 'POST',
                data: {
                    check_code: props.smsCheckCode.value,
                    mobile: props.tel.value,
                    uuid: this.deviceData['uuid'],
                    os_name: this.deviceData['name'],
                    os_version: this.deviceData['version'],
                    model: this.deviceData['model'],
                    vendor: this.deviceData['vendor'],
                    screen_width: this.deviceData['resolutionWidth'],
                    screen_height: this.deviceData['resolutionHeight'],
                    screen_size: this.deviceData['scale'],
                    support_finger: '1',
                    finger_type: '1',
                },
                data2url: true,
            }).then(({response}) => {
                if (response.msg.indexOf('成功')>-1) {
                    Modal.toast('注册成功!');
                    sys.window.logout();
                } else {
                    Modal.confirm({
                        msg: response.msg,
                        btns: ['取消', '前往解绑'],
                        callback: (index) => {
                            if (index === true) {
                                new UnBinding(response.data)
                                // self.deviceMange(response.data);
                            }
                        }
                    });
                }
            });
        });

        d.on(props.sendVerify,'click', function(e) {
            let sendVerify = this;
            let mobile = G.tools.str.toEmpty(props.tel.value);
            if (G.tools.isEmpty(mobile) || !G.tools.valid.isTel(mobile)) {
                Modal.alert('手机号格式有误');
                return;
            }
            // mb端，验证本地验证码
            if (props.verifyELCodeInput){
                if (!self.confirmLocalCode()) {
                    return;
                }
            }
            let countdown = 60;
            sendVerify.classList.add('disabled');
            sendVerify.innerHTML = countdown + 's';

            let timer = setInterval(function () {
                countdown --;
                if (countdown == 0) {
                    clearInterval(timer);
                    sendVerify.classList.remove('disabled');
                    sendVerify.innerHTML = '获取';
                } else {
                    sendVerify.classList.add('disabled');
                    sendVerify.innerHTML = countdown + 's';
                }
            }, 1000);

            BwRule.Ajax.fetch(CONF.ajaxUrl.smsSend, {
                data: {
                    mobile: mobile,
                    uuid: self.deviceData['uuid']
                },
                data2url: true,
                type: 'POST',
                headers: {uuid: self.deviceData['uuid']}
            }).then(() => {
                Modal.toast('验证码发送成功');
            }).catch(() => {

            }).finally(() => {
                sendVerify.innerHTML = '获取';
                sendVerify.classList.add('disabled');
            });
            e.stopPropagation();
        });
        if (sys.os !== 'pc') {
            sys.window.close = double_back;
        }

        if(props.fqaBtn){
            props.fqaBtn.onClick = tools.pattern.throttling(() => {
                // 使用异步加载fqa模块，防止一进入页面直接加载，堵塞
                props.fqaBtn.disabled = true;
                let spinner = new Spinner({
                    type: Spinner.SHOW_TYPE.replace,
                    el: props.fqaBtn.wrapper
                });
                spinner.show();
                new Promise((resolve, reject) => {
                    if(tools.isMb){
                        require(['FqaModal'], (f) => {
                            new f.FqaModal({});
                            resolve();
                        });
                    }
                    else{
                        require(['FqaPcModal'], (f) => {
                            new f.FqaPcModal({});
                            resolve();
                        });
                    }
                }).then(() => {
                    spinner.hide();
                    props.fqaBtn.disabled = false;
                })
            }, 1000);
        }
    }

    private deviceData = {};
    private getDevice() {
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
            this.deviceData = Shell.base.device.data;
        } else if ('BlueWhaleShell' in window) {
            let shell:any = ShellAction.get();
            this.deviceData = shell.device().getInfo().data;
        }else{
            //let deviceInfo={"model":"AT/AT COMPATIBLE","name":"Windows 7","version":"6.1.7601","vendor":"LENOVO","scale":16.3,"resolutionWidth":1366,"resolutionHeight":768,"uuid":"28-D2-44-0C-4E-B5"};
            //showDevice(deviceInfo);
        }
        /*function showDevice(deviceInfo) {
            let inputs = self.props.dataSysinfo;
            for (let i = 0; i < inputs.length; i++) {
                let key = inputs[i].dataset.sysinfo.split('.');
                inputs[i].value = deviceInfo[key[1]];
            }
        }*/
    }
    // private deviceMange(data : obj) {
    //     if(!this.modal){
    //         let full;
    //         if(sys.os !== 'pc') {
    //             full = 'full';
    //         }
    //         this.modal = new Modal({
    //             header : '设备管理',
    //             body : <ul className="device-view"/>,
    //             position : full
    //         });
    //         this.modal.isShow = true;
    //     }else {
    //         this.modal.isShow = true
    //     }
    //     let ul = this.modal.bodyWrapper;
    //     //遍历li
    //     ul.innerHTML = null;
    //     data.forEach(d => {
    //         ul.appendChild(this.deviceTpl(d));
    //     });
    //     let self = this;
    //     if(!this.isOne){
    //         //unbind
    //         d.on(ul, 'click', '.unbind', function () {
    //             let data = JSON.stringify([{uuid : this.dataset.name}]);
    //             // Rule.ajax(CONF.ajaxUrl.unbound,{
    //             //     type: 'post',
    //             //     data: data,
    //             //     success : function (r) {
    //             //         self.modal.isShow = false;
    //             //         Modal.toast('解绑成功');
    //             //     }
    //             // });
    //             BwRule.Ajax.fetch(CONF.ajaxUrl.unbound, {
    //                 type: 'post',
    //                 data: data,
    //             }).then(() => {
    //                 self.modal.isShow = false;
    //                 Modal.toast('解绑成功');
    //             });
    //         });
    //         this.isOne = true;
    //     }
    // }
    // private deviceTpl(data) : HTMLUListElement {
    //     return <li className="device-cell">
    //         <div className="icon-box">
    //
    //             <span className={`iconfont ${tools.isMb ? 'icon-device-mb' : 'icon-device-pc'}`}/>
    //         </div>
    //         <div className="device-name">
    //             <div className="device-modal">型号：{data.MODEL}</div>
    //             <div className="device-vendor">品牌：{data.VENDOR}</div>
    //             <div className="device-time">注册时间：{data.REGISTER_TIME}</div>
    //         </div>
    //         <div className="btn-group">
    //             <button className="unbind" data-name={data.UUID}>解绑</button>
    //         </div>
    //     </li>
    // }

    // 用于记录生成的本地验证码
    private code : string;
    /**
     * 生成本地验证码
     */
    protected renderCheckCode(c1: HTMLCanvasElement) {
        function rn(min, max) {
            return parseInt(Math.random() * (max - min) + min);
        }

        //2.新建一个函数产生随机颜色
        function rc(min, max) {
            let r = rn(min, max);
            let g = rn(min, max);
            let b = rn(min, max);
            return `rgb(${r},${g},${b})`;
        }
        let ctx = c1.getContext("2d"),
            result = '';

        //3.填充背景颜色,颜色要浅一点
        let w = c1.width;
        let h = c1.height;
        ctx.clearRect(0, 0, w, h);
        // ctx.fillStyle = rc(180, 230);
        // ctx.fillRect(0, 0, w, h);
        //4.随机产生字符串
        let pool = "1234567890";
        for (let i = 0; i < 4; i++) {
            let c = pool[rn(0, pool.length)];//随机的字
            result += c;
            let fs = rn(h / 3 * 2, h);//字体的大小
            let deg = rn(-30, 30);//字体的旋转角度
            ctx.font = fs + 'px Simhei';
            ctx.textBaseline = "top";
            ctx.fillStyle = rc(80, 150);
            ctx.save();
            ctx.translate(20 * i + 15, 15);
            ctx.rotate(deg * Math.PI / 180);
            ctx.fillText(c, -15 + 5, -15);
            ctx.restore();
        }
        //5.随机产生5条干扰线,干扰线的颜色要浅一点
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(rn(0, w), rn(0, h));
            ctx.lineTo(rn(0, w), rn(0, h));
            ctx.strokeStyle = rc(180, 230);
            ctx.closePath();
            ctx.stroke();
        }
        //6.随机产生40个干扰的小点
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.arc(rn(0, w), rn(0, h), 1, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = rc(150, 200);
            ctx.fill();
        }
        return result;
    }
   /* private getVerifyElCode() : any[]{
        let randomArray = [],
            resultArray = [];
        for (let i = 48; i <= 57; i++) {
            randomArray.push(String.fromCharCode(i));            
        }
        for (let i = 65; i <= 90; i++) {
            randomArray.push(String.fromCharCode(i));            
        }
        for (let i = 97; i <= 122; i++) {
            randomArray.push(String.fromCharCode(i));            
        }
        let len = randomArray.length;
        
        while (resultArray.length < 5){
            let random = Math.floor(Math.random() * len);
            let randomCode = randomArray[random];
            if (resultArray.indexOf(randomCode) == -1) {
                resultArray.push(randomCode);
            }
        }

        return resultArray;
    }*/
    /**
     * 设置本地验证码
     */
    /*private setVerifyCode(){
        let codeArr = this.getVerifyElCode(),
            codeItemArray = d.queryAll(".verifyCodeItem",this.props.verifyELCode),
            len = codeItemArray.length;
        this.code = codeArr.join('');
        for (let i = 0; i < len; i++) {
            let span = codeItemArray[i];
            span.innerHTML = codeArr[i];
            let randomAngle = Math.random() * 20;
            let symbol = Math.random() > 0.5 ? '+' : '-';
            span.style.transform = 'rotate(' + symbol+randomAngle +'deg)';          
        }
    }*/

    /**
     * 验证输入的内容是否和本地验证码一致
     */
    private confirmLocalCode() : Boolean{
        let value = this.props.verifyELCodeInput.value.toLowerCase();
        if (this.code.toLowerCase() !== value) {
            Modal.alert('验证码输入不正确');
            return false;
        }

        return true;
    }
}