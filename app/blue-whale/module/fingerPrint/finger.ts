///<amd-module name="Finger"/>

import {ShellAction} from "../../../global/action/ShellAction";
import {Modal} from "../../../global/components/feedback/modal/Modal";

import {Button} from "../../../global/components/general/button/Button";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import d = G.d;
import tools = G.tools;
import {IDB} from "../../../global/core/IDB";

interface FingerEvent {
    userid: string;
    type: number | string;
    print: string;
    verify:string;
}

export class Finger {
    protected erp = null;
    protected db: IDB = null; //IDB
    protected store; //操作indexedDB的属性
    protected DBConf = { //默认indexDB配置
        storeName: '',
        version: 1
    };
    protected storeConf;
    protected verify = '0';
    protected type: number|string;
    protected userid: string;

    constructor(conf: { storeName: string, version?: number }) {
        this.erp = (<any>ShellAction.get()).erp();
        //修改默认配置
        for (let attr in conf) {
            this.DBConf[attr] = conf[attr];
        }
        this.storeConf = {
            [this.DBConf.storeName]: ['userid', 'prints']//[type0,type1,type2]
        };
        //指纹方法调用
        this.erp.callFinger({type: 0});
        this.callFingerMsg();
        this.setFinger();
    }

    /*
    * 再次调用指纹
    * */
    public againOpen() {
        this.erp.callFinger({type: 0});
    }

    /*
    * 指纹数据获取成功调用success
    * success返回一个参数FingerEvent
    * */
    protected _success: (e: FingerEvent) => any = () => {
    };
    set success(cb: (e: FingerEvent) => any) {
        this._success = cb;
    }

    /*
    * _callFinger接收一个参数text
    * 实时返回指纹设备的信息
    * */
    protected _callFinger: (text: obj) => any = () => {
    };
    set callFinger(cb: (text: obj) => any) {
        this._callFinger = cb;
    }


    /*
    * 实时返回指纹设备的信息
    * */
    protected callFingerMsg() {
        this.erp.callFingerMsg({
            callback: (event: CustomEvent) => {
                let text = JSON.parse(event.detail);
                this._callFinger && this._callFinger(text);
            }
        });
    }

    /*
    * 获取到指纹信息调用
    * */
    protected setFinger() {
        let self = this;
        self.erp.setFinger({
            callback: (event: CustomEvent) => {
                let text = JSON.parse(event.detail);
                let print = text.msg.fingerPrint;
                let type = text.msg.fingerType;
                if (text.success) {
                    this.findFinger(type, print);
                } else {
                    this.againOpen();
                    Modal.alert('指纹获取失败！');
                }
            }
        })
    }

    //创建模态框获取userid
    protected getUserId(type: number | string, print: string) {
        let self = this;
        let inputBox = new InputBox({}),
            okBtn = new Button({content: '确定', type: 'primary', key: 'okBtn'});
        inputBox.addItem(okBtn);
        let submitUserId = (fingerModal): void => {
            let userid = fingerModal.body.querySelector('input').value.toUpperCase();
            if (!tools.str.toEmpty(userid)) {
                self.againOpen();
                fingerModal.destroy();
                Modal.toast('请重新录入指纹');
            } else {
                fingerModal.destroy();
                self.userid = userid;
                let fingers: FingerEvent = {
                    userid: userid,
                    type: type,
                    print: print,
                    verify:self.verify,
                };
                self._success && self._success(fingers);
            }
        };
        //创建模态框手动输入userID
        let fingerModal = new Modal({
            header: '登记本地指纹ID',
            isOnceDestroy: true,
            body: d.create(`<div data-action="fingerModal">
                                        <form>
                                            <label>请输入您的员工号</label>
                                            <input type="text" >
                                        </form>
                                    </div>`),
            footer: {
                rightPanel: inputBox
            },
            isBackground: false,
            onOk: () => {
                submitUserId(fingerModal);
            },
            onClose:()=>{
                Modal.toast('请重新录入指纹');
                self.againOpen();
            }
        });
        //自动获取焦点
        fingerModal.bodyWrapper.querySelector('input').focus();
        //表单提交触发onOK事件
        d.on(fingerModal.bodyWrapper.querySelector('form'), 'submit', function (ev) {
            ev.preventDefault();
            submitUserId(fingerModal);
        });
    }

    /*
    * 根据fingerType 和fingerPrint 获取indexedDB 中的userid
    * */
    protected findFinger(type: string | number, print: string) {
        let self = this;
        self.db = new IDB('fingerDB', self.DBConf.version, self.storeConf);
        self.db.success = () => {
            let store = self.db.collection(self.DBConf.storeName);
            store.find((val) => {
                // Modal.alert(val.prints['type' + type])
                if(typeof val.prints['type' + type] === "undefined"){
                    return false;
                }
                let data = JSON.parse(self.erp.verifyFinger({
                    data: {
                        enterFinger: print,
                        matchFinger: val.prints['type' + type][0],
                        fingerType: type,
                    }
                }).data);
                return data.success;
            }, (response) => {
                if (tools.isEmpty(response)) {
                    self.verify = '1';
                    self.type = type;
                    self.getUserId(type, print);
                } else {
                    self.verify = '0';
                    let fingers: FingerEvent = {
                        userid: response[0].userid,
                        type: type,
                        print: print,
                        verify:self.verify,
                    };
                    self._success && self._success(fingers);
                }
            })
        };
    }

    /*
    * indexedDB 无缓存的userid
    * 则调用addFinger 添加本地userid
    * */
    public addFinger( print: string, callback?:Function) {
        let self = this, userid = self.userid, type = self.type;
        if(self.verify === '1' && typeof print !== 'undefined'){
            self.db = new IDB('fingerDB', self.DBConf.version, self.storeConf);
            self.db.success = () => {
                let store = self.store = self.db.collection(self.DBConf.storeName);
                /*
                * 查询数据仓库是否有存在userid,
                * 有就更新，没有就添加
                * */

                store.update((result) => {
                    return (result.userid === userid);
                }, (result) => {
                    result.userid = userid;
                    if(typeof result.prints['type' + type] === 'undefined'){
                        result.prints['type' + type] = [];
                    }
                    result.prints['type' + type].unshift(print);
                    if(result.prints['type' + type].length > 1){
                        result.prints['type' + type].pop();
                    }
                    return result;
                }, () => {
                    typeof callback === 'function' && callback();
                }, () => {
                    let data = {
                        userid: userid,
                        prints: {
                            "type0": [],
                            "type1": [],
                            "type2": [],
                        },
                    };
                    data.prints[ 'type' + type ].push(print);
                    store.insert(data, () => {
                        typeof callback === 'function' && callback();
                    })
                });
            };
        }

    }

    /*
    * 销毁
    * */
    public destroy() {
        this.erp.cancelFinger();
        try{
            this.db.destroy();
        }catch (e){
            console.log(e);
        }
    }

}