/// <amd-module name="RegistModule1"/>
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {Button} from "../../../../global/components/general/button/Button";
import d = G.d;
import tools = G.tools;
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {TextInput} from "../../../../global/components/form/text/text";
import {LeRule} from "../../../common/rule/LeRule";

interface IRegistModule1Para extends IComponentPara {
    submitHandler?: (objData?: obj) => void;
    loginTitle?: string;
    isRegist?:boolean;
}

export class RegistModule1 extends Component {
    private graphCode: string;
    private submitHandler: (objData?: obj) => void;
    private isGetMsgCode: boolean = false;
    private canvas: HTMLCanvasElement;
    private timer: number;

    protected wrapperInit(para: IRegistModule1Para): HTMLElement {
        let registModule1HTML = <div className="regist-module regist-module1">
            <div className="input-wrapper group">
                <TextInput c-var="phone" placeholder="请输入手机号"></TextInput>
            </div>
            <div className="confirm-code group">
                <div className="input-wrapper">
                    <TextInput c-var="graphCode" placeholder="请输入图形验证码"></TextInput>
                </div>
                {this.canvas = <canvas width={90} height={40} className="graphValidateCode"></canvas>}
                <Button c-var="msgBtn" content="获取短信验证码" onClick={() => {
                    let graphCodeValue = (this.innerCom.graphCode as TextInput).get(),
                        phone = (this.innerCom.phone as TextInput).get();
                    if (tools.isEmpty(phone)) {
                        Modal.alert('请输入手机号');
                    } else {
                        if (tools.valid.isTel(phone)) {
                            if (tools.isEmpty(graphCodeValue)) {
                                Modal.alert("请输入图形验证码");
                            } else if (graphCodeValue.toUpperCase() !== this.graphCode) {
                                Modal.alert("请输入正确的图形验证码");
                            } else {
                                LeRule.Ajax.fetch(LE.CONF.ajaxUrl.smsCode, {
                                    type: 'POST',
                                    data: {
                                        mobile_id: phone
                                    }
                                }).then(({response}) => {
                                    Modal.toast('验证码发送成功!');
                                    (this.innerCom.msgBtn as Button).disabled = true;
                                    this.setMsgBtnTtile(60);
                                    // 点击获取短信验证码，获取成功设置isGetMsgCode
                                    this.isGetMsgCode = true;
                                })
                            }
                        } else {
                            Modal.alert('请输入合法的手机号');
                        }
                    }
                }
                }/>
            </div>
            <div className="input-wrapper group">
                <TextInput c-var="msgCode" placeholder="请输入短信验证码"></TextInput>
            </div>
            <div className="input-wrapper group">
                <TextInput c-var="password" type="password" placeholder={para.loginTitle}></TextInput>
            </div>
            <Button className="log-btn submit sys-btn" content="提交" onClick={()=>{
                let phoneNumber = (this.innerCom.phone as TextInput).get().replace(/\s/g, ''),
                    msgCode = (this.innerCom.msgCode as TextInput).get().replace(/\s/g, ''),
                    loginPsw = (this.innerCom.password as TextInput).get().replace(/\s/g, '');
                if (!this.isGetMsgCode) {
                    Modal.alert('请先获取短信验证码!');
                    return;
                }
                if (tools.isEmpty(phoneNumber)) {
                    Modal.alert('手机号不能为空!');
                    return;
                }
                if (!tools.valid.isTel(phoneNumber)) {
                    Modal.alert('请输入合法的手机号');
                    return;
                }
                if (tools.isEmpty(msgCode)) {
                    Modal.alert('短信验证码不能为空!');
                    return;
                }
                if (tools.isEmpty(loginPsw)) {
                    Modal.alert('登录密码不能为空!');
                    return;
                }
                let url = para.isRegist === true ? LE.CONF.ajaxUrl.mjregister : LE.CONF.ajaxUrl.resetpwd;
                let postPara = {};
                if (para.isRegist){
                    postPara = {
                        mobile_id: phoneNumber,
                        check_mode: msgCode
                    }
                }else{
                    postPara = {
                        mobile_id: phoneNumber,
                        check_mode: msgCode,
                        password: loginPsw
                    }
                }
                LeRule.Ajax.fetch(url, {
                    type: 'POST',
                    data: [postPara]
                }).then(({response}) => {
                    if(para.isRegist){
                        this.submitHandler({password:loginPsw});
                    }else{
                        this.submitHandler({
                            userid:response.data.userid,
                            password:loginPsw,
                            mobile_id:response.data.mobile_id,
                            identity_id:tools.isEmpty(response.data.identity_id) ? '' : response.data.identity_id
                        });
                    }
                })}
            }/>
            <div className="back-login"><a href="#/loginReg/login">返回登录</a></div>
        </div>;
        this.graphCode = this.renderCheckCode(this.canvas);
        return registModule1HTML;
    }

    constructor(para: IRegistModule1Para) {
        super(para);
        this.submitHandler = para.submitHandler;
        this.initEvents.on();
    }

    private setMsgBtnTtile(count) {
        count--;
        if (count > 0) {
            (this.innerCom.msgBtn as Button).content = count + 's';
            this.timer = setTimeout(() => {
                this.setMsgBtnTtile(count);
            }, 1000);
        } else {
            (this.innerCom.msgBtn as Button).disabled = false;
            (this.innerCom.msgBtn as Button).content = '获取短信验证码';
            clearTimeout(this.timer);
        }
    }

    private initEvents = (() => {
        let canvasClickEvent = (e) => {
            this.graphCode = this.renderCheckCode(e.target);
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', 'canvas', canvasClickEvent);
            },
            off: () => {
                d.off(this.wrapper, 'click', 'canvas', canvasClickEvent);
            }
        }
    })();

    // 生成图形验证码
    private renderCheckCode(c1: HTMLCanvasElement) {
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
        let pool = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
            ctx.fillText(c, -15 + 5, -10);
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

    destroy() {
        super.destroy();
        clearTimeout(this.timer);
        this.canvas = null;
        this.graphCode = null;
        this.submitHandler = null;
    }
}