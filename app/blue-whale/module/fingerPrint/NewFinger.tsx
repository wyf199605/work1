///<amd-module name="NewFinger"/>

import {NewIDB} from "../../../global/NewIDB";
import Shell = G.Shell;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import d = G.d;
import tools = G.tools;

interface FingerEvent {
    userid: string;
    type: number | string;
    print: string;
    verify:string;
}

export interface IFingerPara{
    autoCache?: boolean;
    callFinger?: (text: string) => any;
    fingerFinish?: (fingerObj: FingerEvent) => Promise<any>;
}

export class NewFinger {
    protected static FINGER_TABLE = 'fingers';
    protected IDB: NewIDB;
    protected autoCache: boolean;

    constructor(para?: IFingerPara){
        para = para || {};
        this.autoCache = tools.isEmpty(para.autoCache) ? true : para.autoCache;
        this.callFinger = para.callFinger;
        this.fingerFinish = para.fingerFinish;
        this.IDB = new NewIDB({
            name: 'fingerDB',
            version: 2,
            tableConf: {
                [NewFinger.FINGER_TABLE]: ['userid', 'prints'],
            }
        });

        this.initFingerOpen();
    }

    protected initFingerOpen(){
        Shell.finger.cancel();
        setTimeout(() => {
            Shell.finger.get({
                type: 0,
                option: 0
            }, (ev) => {
                // console.log(ev);
                if (ev.success) {
                    let print = ev.data.finger,
                        type = ev.data.fingerType;
                    this.findFinger({type, print});
                } else {
                    // this.againOpen();
                    Modal.alert('指纹获取失败！');
                    this.initFingerOpen();
                }
            }, (ev) => {
                /*
                * 实时返回指纹设备的信息
                * */
                // console.log(ev);
                this._callFinger && this._callFinger(ev.data.text);
            }, true);
        }, 100);

    }

    /*
    * 根据fingerType 和fingerPrint 获取indexedDB 中的userid
    * */
    protected findFinger(obj: {type: number, print: string}){
        let type = obj.type,
            print = obj.print;

        this.IDB.getCollection(NewFinger.FINGER_TABLE).then((store) => {
            store.find((val) => {
                // Modal.alert(val.prints['type' + type])
                if(!val.prints['type' + type]){
                    return false;
                }
                let matchPrint = val.prints['type' + type][0];
                if(!matchPrint){
                    return false;
                }
                let data = Shell.finger.verify(print, matchPrint, type);
                return data.data.matched;
            }).then((response) => {
                new Promise<FingerEvent>((resolve, reject) => {
                    let fingerObj: FingerEvent;
                    if (tools.isEmpty(response)) {
                        fingerObj = {
                            userid: '',
                            type: type,
                            print: print,
                            verify: '1',
                        };
                        // fingerObj.verify = '1';
                        // fingerObj.type = type;
                        this.getUserId(fingerObj).then((data) => {
                            resolve(data);
                        }).catch(() => {
                            reject();
                        });

                    }else{
                        fingerObj = {
                            userid: response[0].userid,
                            type: type,
                            print: print,
                            verify: '0',
                        };
                        resolve(fingerObj);
                    }
                }).then((data) => {
                    if(typeof this.fingerFinish === 'function'){
                        this.fingerFinish(data).then((print) => {
                            if(data.verify === '1'){
                                let printData = Object.assign({}, data, {print});
                                this.autoCache && this.addFinger(printData).catch((e) => {
                                    console.log(e);
                                }).finally(() => {
                                    this.initFingerOpen();
                                });
                            }else{
                                this.initFingerOpen();
                            }
                        }).catch(() => {
                            this.initFingerOpen();
                        });
                    }
                    // else{
                    //     this.autoCache && this.addFinger(data).finally(() => {
                    //         this.initFingerOpen();
                    //     }).catch((e) => {
                    //         console.log(e);
                    //     });
                    // }
                }).catch((e) => {
                    console.log(e);
                    Modal.toast('请重新获取指纹');
                    this.initFingerOpen();
                })
            });
        })
    }

    //创建模态框获取userid
    protected getUserId(fingerObj: FingerEvent): Promise<FingerEvent> {
        return new Promise<FingerEvent>((resolve, reject) => {
            let inputBox = new InputBox({}),
                okBtn = new Button({content: '确定', type: 'primary', key: 'okBtn'});
            inputBox.addItem(okBtn);
            let submitUserId = (): void => {
                let userid = (fingerModal.body as HTMLElement).querySelector('input').value.toUpperCase();
                if (!tools.str.toEmpty(userid)) {
                    // self.againOpen();
                    fingerModal.destroy();
                    Modal.toast('请重新录入指纹');
                    reject();
                } else {
                    fingerModal.destroy();
                    // self._success && self._success(fingers);
                    resolve(Object.assign(fingerObj, {userid}));
                }
            };
            //创建模态框手动输入userID
            let fingerModal = new Modal({
                header: '登记本地指纹ID',
                isOnceDestroy: true,
                body: <div data-action="fingerModal">
                    <form>
                        <label>请输入您的员工号</label>
                        <input type="text" />
                    </form>
                </div>,
                footer: {
                    rightPanel: inputBox
                },
                isBackground: false,
                onOk: () => {
                    submitUserId();
                },
                onClose:()=>{
                    Modal.toast('请重新录入指纹');
                    // self.againOpen();
                    reject();
                }
            });
            //表单提交触发onOK事件
            d.on(fingerModal.bodyWrapper.querySelector('form'), 'submit', function (ev) {
                ev.preventDefault();
                submitUserId();
            });

            // debugger;
            setTimeout(() => {
                //自动获取焦点
                fingerModal.bodyWrapper.querySelector('input').focus();
            }, 150);
        })

    }

    /*
    * indexedDB 无缓存的userid
    * 则调用addFinger 添加本地userid
    * */
    public addFinger(fingerObj: FingerEvent): Promise<any> {
        let userid = fingerObj.userid,
            type = fingerObj.type,
            print = fingerObj.print,
            verify = fingerObj.verify;
        return new Promise((resolve, reject) => {
            if(verify === '1' && tools.isNotEmpty(print)){
                this.IDB.getCollection(NewFinger.FINGER_TABLE).then((store) => {
                    /*
                    * 查询数据仓库是否有存在userid,
                    * 有就更新，没有就添加
                    * */
                    store.update((result) => {
                        return (result.userid === userid);
                    }, (result) => {
                        result = Object.assign({}, result || {});
                        result.userid = userid;
                        if(!result.prints){
                            result.prints = {};
                        }
                        if(!result.prints['type' + type]){
                            result.prints['type' + type] = [];
                        }
                        result.prints['type' + type].unshift(print);
                        if(result.prints['type' + type].length > 1){
                            result.prints['type' + type].pop();
                        }
                        return result;
                    }).then(() => {
                        resolve();
                    }).catch(() => {
                        let data = {
                            userid: userid,
                            prints: {
                                "type0": [],
                                "type1": [],
                                "type2": [],
                            },
                        };
                        data.prints[ 'type' + type ].push(print);
                        store.insert(data).then((e) => {
                            console.log(e);
                            resolve(e);
                            store.findAll().then((e) => console.log(e)).catch(e => console.log(e));
                        }).catch((e) => {
                            console.log(e);
                            reject(e);
                        })
                    });
                });
            }else{
                reject();
            }
        });
    }

    /*
        * _callFinger接收一个参数text
        * 实时返回指纹设备的信息
        * */
    protected _callFinger: (text: string) => any;
    set callFinger(cb: (text: string) => any) {
        this._callFinger = cb;
    }
    get callFinger(){
        return this._callFinger;
    }

    /*
    * 指纹数据获取成功调用_fingerFinish
    * _fingerFinish返回一个参数FingerEvent
    * */
    protected _fingerFinish: (fingerObj: FingerEvent) => Promise<any> = () => Promise.resolve();
    set fingerFinish(cb: (fingerObj: FingerEvent) => Promise<any>) {
        this._fingerFinish = cb;
    }
    get fingerFinish(){
        return this._fingerFinish;
    }

    /*
    * 销毁
    * */
    public destroy() {
        Shell.finger.cancel();
        try{
            this.IDB.destroy();
        }catch (e){
            console.log(e);
        }
    }
}