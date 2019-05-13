import BasicPage from "../basicPage";
import {TextInput} from "../../../global/components/form/text/text";
import {Tab} from "../../../global/components/ui/tab/tab";
import {Button} from "../../../global/components/general/button/Button";
import d = G.d;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import CONF = BW.CONF;
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import Shell = G.Shell;
import {ShellAction} from "../../../global/action/ShellAction";

export = class CheckInPage extends BasicPage {
    protected passwordEl: HTMLElement = null;
    protected userid: string;

    constructor(private para) {
        super(para);
        this.userid = tools.url.getPara('userid', this.url) || '';
        console.log(this.userid);
        let parent = para.dom.parentNode;
        let height: number = parent.offsetHeight - parent.firstChild.offsetHeight;
        para.dom.style.height = height + 'px';
        this.initPage();
    }

    public initPage() {
        let self = this, para = self.para;
        let detail = <div class="checkIn-detail"/>;
        //创建左侧框
        let content = <div class="checkIn-content"><h4 class="datetime"/></div>;

        //输入userid进行密码修改
        self.passwordEl = <div class="password-content">
            <form>
                <div class="from-group">
                    <div data-type="text" type="text"/>
                    <div data-type="password" type="text"/>
                    <div data-type="submit"/>
                </div>
            </form>
        </div>;
        let text = new TextInput({
            container: self.passwordEl.querySelector('[data-type="text"]'),
            type: 'text',
            placeholder: '请输入用户名',
            icons: ['iconfont icon-avatar']
        });
        // 设置默认用户id
        text.set(this.userid);
        let password = new TextInput({
            container: self.passwordEl.querySelector('[data-type="password"]'),
            type: 'password',
            placeholder: '请输入密码',
            icons: ['iconfont icon-suo4']
        });
        let submit = new Button({
            container: self.passwordEl.querySelector('[data-type=submit]'),
            content: '确定',
            type: 'primary'
        });

        //指纹考勤与密码考勤切换
        let attendTab = new Tab({
            tabParent: detail,
            panelParent: content,
            tabs: [
                {
                    title: '密码修改',
                    dom: self.passwordEl
                },
                {
                    title: '指纹登记',
                    dom: <div class="register-finger"></div>
                }
            ],
            onClick(index) {
                if (index === 1) {
                    self.registerFinger();//调用指纹录入
                }
            }
        });
        detail.appendChild(content);
        para.dom.appendChild(detail);
        this.registerPassword();
    }

    /*
   *指纹登记
   * */
    protected registerFinger() {
        //创建确定与关闭按钮
        let self = this,
            inputBox = new InputBox({}),
            cancelBtn = new Button({content: '取消', type: 'danger', key: 'cancelBtn',}),
            okBtn = new Button({
                content: '确定',
                type: 'primary',
                onClick: tools.pattern.debounce((e) => {
                    if (tools.isEmpty(text.get())) {
                        Modal.toast('员工号不能为空');
                    } else {
                        let flag: any = false;
                        if('AppShell' in window || 'BlueWhaleShell' in window){
                            let userid = text.get().toUpperCase();
                            if('AppShell' in window) {
                                flag = fingerPrint(userid);
                            }else if('BlueWhaleShell' in window) {
                                flag = oldFingerPrint(userid)
                            }
                        }
                        if(flag){
                            finger.style.opacity = '1';
                        }else{
                            finger.style.opacity = '0';
                            Modal.alert('无法使用指纹设备')
                        }
                    }
                }, 500),
            });
        inputBox.addItem(okBtn);
        inputBox.addItem(cancelBtn);
        //生成录入userid的模态框
        let main = new Modal({
            header: '注册指纹',
            body: <div class="main" style="padding:13px 18px">
                <div class="form">
                    <div data-type="text" style="border:1px solid #ccc;border-radius:5px;"/>
                    <p class="help-block">输入员工号后按确定录入指纹</p>
                    <div data-type="button"/>
                </div>
                <div style="opacity:0;transition:1s" class="finger">
                    <h4>请按下指纹</h4>
                    <p data-msg="msg"/>
                </div>
            </div>,
            footer: {
                rightPanel: inputBox,
            },
            onClose: () => {
                // 关闭指纹
                if('AppShell' in window){
                    Shell.finger.cancel();
                }else if('BlueWhaleShell' in window){
                    (ShellAction.get() as any).erp().cancelFinger();
                }
            }
        });
        let finger = main.bodyWrapper.querySelector('.finger') as HTMLElement;
        let text = new TextInput({
            container: main.bodyWrapper.querySelector('[data-type="text"]'),
            type: 'text'
        });
        if(this.userid){
            text.set(this.userid);
        }else{
            text.focus();
        }

        //指纹登记
        function fingerPrint(userid) {
            let msg = finger.querySelector('[data-msg="msg"]');
            G.Shell.finger.cancel();
            let flag = G.Shell.finger.get({
                type: 1,
                option: 1
            }, (e) => {
                console.log(e);
                if (e.success) {
                    let data = e.data,
                        print = data.finger,
                        type = data.fingerType;
                    msg.innerHTML = '<span>指纹数据正在录入中，请稍后...</span>';
                    let url = CONF.ajaxUrl.atdFingerReg;
                    // Rule.ajax(url, {
                    //     type: 'POST',
                    //     data: '[' + JSON.stringify({
                    //         userid: userid,
                    //         fingertype: type,
                    //         fingerprint: print
                    //     }) + ']',
                    //     success(response) {
                    //         finger.style.opacity = '0';
                    //         main.destroy();
                    //         Modal.alert('指纹录入成功');
                    //         text.set('');
                    //         (<any>ShellAction.get()).erp().cancelFinger();
                    //     },
                    //     error(err) {
                    //         main.destroy();
                    //         text.set('');
                    //         Modal.alert('指纹录入失败');
                    //         (<any>ShellAction.get()).erp().cancelFinger();
                    //     }
                    // })
                    BwRule.Ajax.fetch(url, {
                        type: 'POST',
                        data: [{
                            userid: userid,
                            fingertype: type,
                            fingerprint: print
                        }]
                    }).then(({response}) => {
                        finger.style.opacity = '0';
                        Modal.alert('指纹录入成功');
                    }).catch(() => {
                        // main.destroy();
                        // text.set('');
                        Modal.alert('指纹录入失败');
                        // (<any>ShellAction.get()).erp().cancelFinger();

                    }).finally(() => {
                        main.destroy();
                        text.set('');
                        Shell.finger.cancel();
                    })
                } else {
                    main.destroy();
                    text.set('');
                    Shell.finger.cancel();
                    Modal.toast(e.msg || '指纹录入失败');
                    // msg.innerHTML = '<span>' + e.msg + '</span>';
                    self.registerFinger();//调用指纹录入
                }
            }, (ev) => {
                msg.innerHTML = '<span>' + ev.data.text + '</span>';
            }, true);
            return flag;
        }

        function oldFingerPrint(userid) {
            let erp = (ShellAction.get() as any).erp(), self = this;
            let msg = finger.querySelector('[data-msg="msg"]');
            erp.callFinger({type: 1});
            erp.callFingerMsg({
                callback: (event: CustomEvent) => {
                    let text = JSON.parse(event.detail);
                    msg.innerHTML = '<span>' + text.msg + '</span>';
                }
            });
            erp.setFinger({
                callback: (event: CustomEvent) => {
                    let result = JSON.parse(event.detail);
                    let print = result.msg.fingerPrint;
                    let type = result.msg.fingerType;
                    if (result.success) {
                        msg.innerHTML = '<span>指纹数据正在录入中，请稍后...</span>';
                        let url = CONF.ajaxUrl.atdFingerReg;

                        BwRule.Ajax.fetch(url, {
                            type: 'POST',
                            data: [{
                                userid: userid,
                                fingertype: type,
                                fingerprint: print
                            }]
                        }).then(({response}) => {
                            finger.style.opacity = '0';
                            Modal.alert('指纹录入成功');
                        }).catch(() => {
                            // main.destroy();
                            // text.set('');
                            Modal.alert('指纹录入失败');
                            // (<any>ShellAction.get()).erp().cancelFinger();

                        }).finally(() => {
                            main.destroy();
                            text.set('');
                            (ShellAction.get()).erp().cancelFinger();
                        })
                    } else {
                        (ShellAction.get()).erp().cancelFinger();
                        msg.innerHTML = '<span>' + result.msg + '</span>';
                        self.registerFinger();//调用指纹录入
                    }
                }
            });
            return true;
        }
    }


    /*
   * 密码登记
   * */
    protected registerPassword() {
        let self = this;
        let form = self.passwordEl.querySelector('form');
        (form.querySelector('[data-type=submit]>button') as HTMLButtonElement).type = 'submit';
        d.on(form, 'submit', function (ev) {
            ev.preventDefault();
            let username = (form.querySelector('input[type=text]') as HTMLInputElement).value.toUpperCase();
            let password = (form.querySelector('input[type=password]') as HTMLInputElement).value;
            if (!tools.str.toEmpty(username) || !tools.str.toEmpty(password)) {
                Modal.alert('密码不能为空');
            } else {
                let url = CONF.ajaxUrl.atdPwdReg;
                BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
                    data: {str: password}
                }).then(({response}) => {
                    let encodePassword = response.body.bodyList[0];

                    return BwRule.Ajax.fetch(url, {
                        type: "POST",
                        data: JSON.stringify({
                            userid: username,
                            password: encodePassword
                        })
                    })
                }).then(({response}) => {
                    let result = response.msg;
                    (form.querySelector('input[type=text]') as HTMLInputElement).value = '';
                    (form.querySelector('input[type=password]') as HTMLInputElement).value = '';
                    Modal.toast(response.msg);
                });
            }
        });
    }

    protected destroy() {
        Shell.finger.cancel();
    }

}