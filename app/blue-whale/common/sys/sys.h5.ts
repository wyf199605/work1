// import GLOBAL_CONF = require('conf.ts');
namespace BW{
    import tools = G.tools;
    import d = G.d;

    export class SYSH5 implements SYS_Type{
        public os: string;
        public isMb : boolean;
        public window = (function(self){
            let closeConfirmConfig: ICloseConfirmPara = null;

            return {
                uploadVersion: function () {

                },
                backHome: function (){
                    sys.window.open({
                        url: CONF.url.main
                    });
                },
                open: function (o: winOpen) {
                    localStorage.setItem('viewData', JSON.stringify(o.extras));
                    let win = window.parent ? window.parent : window;
                    win.location.href = o.url;
                },
                close: function (event: string, data: object) {
                    closeConfirmConfig = closeConfirmConfig || {};
                    let {msg, noHandler, btn, condition} = closeConfirmConfig ;
                    if(msg && typeof condition !== 'function') {
                        condition = () => true;
                    }
                    if(msg) {
                        let flagPromise =  condition() ;
                        if(!(flagPromise instanceof Promise)){
                            flagPromise = Promise.resolve(!!flagPromise);
                        }
                        flagPromise.then(flag => {
                            if(!flag){
                                close();
                                return;
                            }
                            require(['Modal'], function (m) {
                                m.Modal.confirm({
                                    msg:  msg,
                                    btns: btn ? btn : ['不关闭', '关闭'],
                                    callback: (flag: boolean) => {
                                        if(flag){
                                            tools.isFunction(noHandler) && noHandler();
                                        }else{
                                            close();
                                        }
                                    }
                                })
                            })
                        });
                        return;
                    }
                    history.back();
                },
                set closeConfirm(obj: ICloseConfirmPara) {
                    if(obj) {
                        closeConfirmConfig = Object.assign({msg: '是否关闭页面？'}, obj);
                    } else {
                        closeConfirmConfig = null;
                    }
                },

                load: function (url: string) {
                    let win = window.parent ? window.parent : window;
                    win.location.href = url;
                },
                back: function (event: string, data: object) {
                    history.back();
                },
                wake: function (event: string, data: object) {
                },
                clear: function () {
                    // self.ui.toast('清除成功');
                },
                opentab: function (url, accessToken, noShow: string[] = null) {
                    let win = window.parent ? window.parent : window;
                    win.location.href = CONF.url.main;
                    localStorage.setItem('hideBaseMenu', JSON.stringify(noShow));
                },
                logout: function () {
                    let win = window.parent ? window.parent : window;
                    win.location.href = CONF.url.login;
                },
                copy: function (text: string) {
                    toast('您的设备暂不支持复制');
                },
                getGps: function (callback: Function) {
                    callback({gps:{},success:true});
                },
                openGps: function(){

                },
                update: function () {
                    toast('已经是最新版本');
                },
                getDevice: function (key) {

                },
                openImg: function (url: string) {

                },
                download: function (url: string, fileName: string = '') {
                    let a = d.create(`<a href="${url}" download="${fileName}"></a>`);
                    d.append(document.body, a);
                    a.click();
                    d.remove(a);
                    a = null;
                },
                firePreviousPage: function () {
                    
                },
                fire : function (type : string, data? : obj,) {
                    tools.event.fire(type, data, window);
                },
                getFile: function (callback: (file: CustomFile[]) => void, multi: boolean = false, accpet: string, error: Function) {
                    let input = <HTMLInputElement>d.create('<input type="file" class="hide"/>');
                    input.multiple = multi;
                    accpet && (input.accept = accpet);
                    d.on(input, 'change', () => {
                        callback && callback(Array.prototype.slice.call(input.files).map((file: File): CustomFile => {
                            return {
                                blob: file,
                                name: file.name,
                                lastModifiedDate: file.lastModifiedDate,
                                type: file.type,
                                size: file.size
                            }
                        }));
                        input = null;
                    });
                    input.click();
                }
            }
        })(this);
        public ui = {
            notice: function (obj) {
                toast(obj.msg);
            },
        };

    }
}
