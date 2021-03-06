/// <amd-module name="ButtonAction"/>
import tools = G.tools;
import {InputBox} from "../../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../../global/components/general/button/Button";
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {SelectBox} from "../../../../global/components/form/selectBox/selectBox";
import CONF = BW.CONF;
import d = G.d;
import {ShellErpManagePc} from "../../../../global/shell/pcImpl/ShellErpManage";
import {SelectInput} from "../../../../global/components/form/selectInput/selectInput";
import {Loading} from "../../../../global/components/ui/loading/loading";
import {BwRule} from "../BwRule";
import {SelectInputMb} from "../../../../global/components/form/selectInput/selectInput.mb";
// import {RfidBarCode} from "../../../pages/rfid/RfidBarCode/RfidBarCode";
// import {NewTablePage} from "../../../pages/table/newTablePage";


/**
 * Created by zhengchao on 2017/12/21.
 * 业务按钮统一控制器
 */
export class ButtonAction {

    /**
     * button点击后业务操作规则
     */
    clickHandle(btn: R_Button, data: obj | obj[], callback = (r) => {
    }, url?: string, itemId?: string) {
        let self = this;
        if (btn.subType === 'excel') {

            let com;
            let uploderModal = new Modal({
                header: '选择导入的文件',
                body: d.create(`<div></div>`),
                className: 'upload-modal',
                isOnceDestroy: true,
                onClose: () => {
                    com = null;
                    uploderModal.destroy();
                },
                footer: {
                    rightPanel: [
                        {
                            content: '取消',
                            onClick: () => {
                                com && com.destroy();
                                com = null;
                                uploderModal.destroy();
                            }
                        }
                    ]
                },
                // onOk: () => {
                //     // let arr = []; //表格数据构造
                //     // arr.push(tableData.meta.join('\t'));
                //     let meta = tableData.meta;
                //     let data = tableData.dataList.map(data => {
                //         let obj = {};
                //         data.forEach((d, index) => {
                //             obj[meta[index]] = d;
                //         });
                //         return obj;
                //     });
                //     G.tools.event.fire(NewTableModule.EVT_EXPORT_DATA, data);
                //     // BW.sys.window.fire('table-data-add', <any>arr.join('\r\n'), url);
                //     uploderModal.destroy();
                // }
            });

            //TODO 将UploadModule过程效果整合到upload组件
            require(['UploadModule'], function (upload) {
                let loadUrl = CONF.siteUrl + btn.actionAddr.dataAddr;
                com = new upload.default({
                    container: <HTMLElement>uploderModal.body,
                    uploadUrl: loadUrl + (loadUrl.indexOf('?') > -1 ? '&' : '?') + "item_id=" + itemId,
                    onChange: () => {

                    },
                    onComplete: (resuult) => {
                        // console.log(data);
                        //后台表格数据返回
                        // tableData = resuult.data;
                        // let meta = tableData.meta;
                        // let data = tableData.dataList.map(data => {
                        //     let obj = {};
                        //     data.forEach((d, index) => {
                        //         obj[meta[index]] = d;
                        //     });
                        //     return obj;
                        // });
                        uploderModal.destroy();
                        setTimeout(() => {
                            com && com.destroy();
                            com = null;
                            self.btnRefresh(btn.refresh, url);
                        }, 100)
                        // G.tools.event.fire(NewTableModule.EVT_EXPORT_DATA, data);
                    }
                })
            });
        } else {
            if (btn.hintBeforeAction || btn.buttonType === 3) {
                let hintWords = ['查询', '新增', '修改', '删除'],
                    word = hintWords[btn.buttonType];
                if (btn.subType === 'with_draw') {
                    word = '撤销';
                }else if(btn.subType === 'reject'){
                    word = '退回';
                }
                Modal.confirm({
                    msg: `确定要${word}吗?`,
                    callback: (index) => {
                        if (index === true) {
                            self.btnAction(btn, data, callback, url);
                        }
                    }
                });
            } else {
                self.btnAction(btn, data, callback, url);
            }
        }
    }

    /**
     * 根据button的refresh属性
     * @param {int} refresh
     * @param url - pc端本页url
     * 0 - 本页面不刷新
     * 1 - 本页面刷新
     * 2 - 关闭本页面 页面并不刷新
     * 3 - 关闭本页面 页面并刷新
     * 4 - 本页不刷新 手动返回上级时刷新上级
     */
    btnRefresh(refresh: number, url?: string) {
        switch (refresh) {
            case 1 :
                BW.sys.window.fire(BwRule.EVT_REFRESH, null, url);
                break;
            case 2 :
                setTimeout(function () {
                    BW.sys.window.close('', null, url);
                }, 1000);
                break;
            case 3 :
                setTimeout(function () {
                    BW.sys.window.close(BwRule.EVT_REFRESH, null, url);
                }, 1000);
                break;
            case 4 :
                BW.sys.window.firePreviousPage(BwRule.EVT_REFRESH, null, url);
                break;
            default:
        }
    }

    /**
     * 将页面dom转换为button业务对象
     */
    dom2Obj(btn: HTMLElement): R_Button {
        let obj: R_Button = {
            subType: btn.dataset.subType,
            openType: btn.dataset.openType,
            buttonType: parseInt(btn.dataset.buttonType, 10),
            actionAddr: {
                varList: JSON.parse(btn.dataset.varList),
                dataAddr: btn.dataset.actionAddr
            },
            refresh: parseInt(btn.dataset.refresh, 10)
        };
        return obj;
    }

    /**
     * openTyp="popup";//弹出新窗口,"newwin";//打开新窗口,"none";//保持在原界面
     * 处理按钮规则buttonType=0:get,1:post,2put,3delete
     */
    private btnAction(btn: R_Button, dataObj: obj | obj[], callback = (r) => {
    }, url?: string) {
        let {addr, data} = BwRule.reqAddrFull(btn.actionAddr, dataObj),
            self = this,
            ajaxType = ['GET', 'POST', 'PUT', 'DELETE'][btn.buttonType];

        if(!Array.isArray(dataObj) || dataObj.length === 1){
            addr = tools.url.replaceTmpUrl(addr, Array.isArray(dataObj) ? dataObj[0] : dataObj);
        }
        let varType = btn.actionAddr.varType, res: any = data;

        if (varType === 3 && typeof data !== 'string') {
            // 如果varType === 3 则都转为数组传到后台
            let tmp = data;
            if (tools.isEmpty(data)){
                // 不传任何数据

            }else if(!Array.isArray(tmp)) {
                tmp = [tmp];
                res = JSON.stringify(tmp);
            }else{
                res = JSON.stringify(tmp);
            }
        }
        switch (btn.openType) {
            case 'none' :
                if (!ajaxType) {
                    Modal.alert('buttonType不在0-3之间, 找不到请求类型!');
                    return;
                }
                self.checkAction(btn, dataObj, addr, ajaxType, res, url).then(response => {
                    callback(response);
                    self.btnRefresh(btn.refresh, url);
                }).catch((e) => {
                    console.log(e);
                });
                break;
            case 'popup':
                if (!ajaxType) {
                    Modal.alert('buttonType不在0-3之间, 找不到请求类型!');
                    return;
                }

                addr = tools.url.addObj(addr, {output: 'json'});
                self.checkAction(btn, dataObj, addr, ajaxType, res, url).then(response => {
                    console.log(response);
                    //创建条码扫码页面
                    if(response.uiType === 'inventory' && tools.isMb){
                        this.initBarCode(response,data,dataObj);
                    }else{
                        self.btnPopup(response, () => {
                            self.btnRefresh(btn.refresh, url);
                        }, url);
                    }
                }).catch(() => {
                });
                break;
            case 'newwin':
            default:
                let openUrl = tools.url.addObj(BW.CONF.siteUrl + addr, data);
                if(res){
                    openUrl = tools.url.addObj(openUrl, {bodyParams: res}, false)
                }
                BW.sys.window.open({
                    url: openUrl,
                    gps: !!btn.actionAddr.needGps,
                }, url);
                self.btnRefresh(btn.refresh, url);
        }
    }

    initBarCode(res,data,dataObj){
        // console.log(res.body.elements)
        let dataAddr = res.body.elements,
            codeStype:object[],
            url:string,
            uniqueFlag:string,
            ajaxUrl:string;
        for(let i = 0;i < dataAddr.length;i++){
            url =   dataAddr[i].downloadAddr.dataAddr;
            codeStype = dataAddr[i].atvarparams[0].data;//可能需要做判断
            uniqueFlag = dataAddr[i].uniqueFlag;
        }

        BwRule.Ajax.fetch(BW.CONF.siteUrl + url,{
            data:data
        }).then(({response})=>{

            response.body && (ajaxUrl =  response.body.bodyList[0].inventData)
        })

        // new RfidBarCode({
        //      codeStype:codeStype,
        //      SHO_ID:dataObj['SHO_ID'],
        //      USERID:dataObj['USERID'],
        //      url:ajaxUrl,
        //     uniqueFlag
        // })
    }

    /**
     * 后台有配置actionHandle情况下的处理
     */
    // private checkAction(btn: R_Button, dataObj: obj|obj[], callback = (r) => {}, url?:string, addr?:string, ajaxType?:string, ajaxData?:any) {
    //     let varType = btn.actionAddr.varType, self = this;
    //     if (varType === 3 && typeof ajaxData !== 'string') {
    //         // 如果varType === 3 则都转为数组传到后台
    //         if (!Array.isArray(ajaxData)) {
    //             ajaxData = [ajaxData];
    //         }
    //         ajaxData = JSON.stringify(ajaxData);
    //     }
    //     BwRule.ajax(BW.CONF.siteUrl + addr, {
    //         urlData: varType !== 3,
    //         type: ajaxType,
    //         defaultCallback : btn.openType !== 'popup',
    //         data: ajaxData,
    //         success: function (r) {
    //             let data = tools.keysVal(r, ['body', 'bodyList', 0]);
    //             if (data && (data.type || data.type === 0)) {
    //                 if (data.type === 0) {
    //                     Modal.alert(data.showText);
    //                 } else {
    //                     Modal.confirm({
    //                         msg: data.showText,
    //                         callback: (index) => {
    //                             if (index == true) {
    //                                 self.checkAction(btn, dataObj, callback, url, data.url, ajaxType, ajaxData);
    //                             }
    //                         }
    //                     });
    //                 }
    //             }else{
    //                 // 默认提示
    //                 if (!('hintAfterAction' in btn) || btn.hintAfterAction) {
    //                     if (data && data.showText) {
    //                         Modal.alert(data.showText);
    //                     } else if(btn.openType !== 'popup'){
    //                         Modal.toast(`${btn.title}成功`);
    //                         self.btnRefresh(btn.refresh, url);
    //                     }
    //                 }
    //                 callback(r);
    //             }
    //         }
    //     });
    // }
    private checkAction(btn: R_Button, dataObj: obj | obj[], addr?: string, ajaxType?: string, ajaxData?: any, url?: string) {
        let self = this;
        return BwRule.Ajax.fetch(BW.CONF.siteUrl + addr, {
            data2url: btn.actionAddr.varType !== 3,
            type: ajaxType,
            // defaultCallback : btn.openType !== 'popup',
            data: ajaxData,
            needGps: btn.actionAddr.needGps

        }).then(({response}) => {
            let data = tools.keysVal(response, 'body', 'bodyList', 0);
            if (data && (data.type || data.type === 0)) {
                if (data.type === 0) {
                    Modal.alert(data.showText);
                } else {
                    return new Promise((resolve) => {
                        Modal.confirm({
                            msg: data.showText,
                            callback: (confirmed) => {
                                if (confirmed) {
                                    self.checkAction(btn, dataObj, data.url, ajaxType, ajaxData, url).then(() => {
                                        resolve();
                                    });
                                }
                            }
                        });
                    })

                }
            } else {
                // 默认提示
                if (!('hintAfterAction' in btn) || btn.hintAfterAction) {
                    if (data && data.showText) {
                        Modal.alert(data.showText);
                    } else if (btn.openType !== 'popup') {
                        Modal.toast(response.msg || `${btn.title}成功`);
                        self.btnRefresh(btn.refresh, url);
                    }
                }
                return response;
                // callback(response);
            }
        });
    }

    /**
     * 下拉和列表弹出框
     * @param response
     * @param onOk 回调
     * @param url
     */
    private btnPopup(response, onOk, url) {
        let res = <any>response.body.elements[0],
            len = res.cols && res.cols.length,
            selectInput = [],
            type = res.actionType,
            modal: Modal,
            selectBox: SelectBox,
            comSelectInput: SelectInput,
            speedInput: SelectInput,
            loading: Loading,
            sendMsg,
            sendFinish,
            width,    //模态框宽度
            progress, //进度条
            tipDom,   //盘点机信息提示
            table;    //表格模块

        if (type === 3 || type === 5) {
            if (len > 6) {
                width = 100 * 10;
            } else {
                width = 180 * len;
            }
        } else if (res.downloadAddr) {
            width = 260;
        }
        //模态框参数
        let body = d.create(`<div></div>`);
        if (res.downloadAddr) {
            body = d.create(`<div><div class="avatar-load"><div class="conf-left"></div><div class="conf-right">
                </div></div><div class="avatar-progress"><div class="progress-title">传输尚未开始</div></div></div>`)
        }
        let caption = response.caption;
        let para = {
            body: body,
            header: caption,
            isOnceDestroy: true,
            width: width,
            isAdaptiveCenter: true,
            isMb: false
        };
        if (type === 3 || type === 5) {
            para['className'] = tools.isMb ? 'mb-action-type-5' : 'action-type-5';
        }

        if (type === 4) {
            para['className'] = 'action-type-4';
        }

        //type3模态框无footer
        if (type !== 3) {
            let inputBox = new InputBox(),
                subButtons = res.subButtons;
            subButtons && subButtons.forEach(obj => {
                inputBox.addItem(new Button({
                    content: obj.caption,
                    type: 'primary',
                    onClick: () => {
                        let data = [];
                        if (!res.downloadAddr) {
                            modal.destroy();
                            if (res.atvarparams) {
                                data[0] = selectInput;
                            } else if (type === 5) {
                                data[0] = table.main.ftable.selectedRowsData;
                            }
                            data[1] = res;
                        }

                        this.clickHandle(obj, data, (r) => {

                        }, url);
                    }
                }));
            });

            //盘点机操作
            if (res.downloadAddr) {
                let action, btn, msg, pos, shellData;

                sendMsg = (event) => {
                    console.log(event);
                    if ('AppShell' in window) {
                        if (event.success) {
                            let data = event.data;
                            tipDom.innerHTML = event.msg;
                            progress.format(data ? data.progress : 0);
                            if (data && data.state === 2) {
                                if (action === 'upload') {
                                    inventoryAjax(JSON.stringify([{
                                        inventdata: data.data,
                                    }]), btn);
                                } else {
                                    Modal.alert('下载数据完成');
                                    modal.destroy(() => {
                                        offShellMonitor();
                                    });
                                }
                            }
                        } else {
                            Modal.alert('调用接口失败，请重试！');
                        }

                    } else {
                        let data = JSON.parse(event.detail),
                            tip = data.msg,
                            percent = tip.substring(tip.indexOf('(') + 1, tip.indexOf('%'));

                        tipDom.innerHTML = tip.substr(0, tip.indexOf('('));
                        progress.format(percent);
                        if (percent === '100') {
                            if (action === 'upload') {
                                let upLoadData = pos.inventory({
                                    msg: 'getUploadData',
                                })._data;
                                inventoryAjax(JSON.stringify([{
                                    inventdata: JSON.parse(upLoadData).msg.data,
                                }]), btn);
                                // tipDom.innerHTML = upLoadData.msg;
                            } else if (action === 'download') {
                                Modal.alert('下载数据完成');
                                modal.destroy(() => {
                                    offShellMonitor();
                                });
                            }
                        }
                    }
                };

                sendFinish = (event: CustomEvent) => {
                    console.log(event);
                    let detail = JSON.parse(event.detail);
                    // Modal.alert(detail.msg);
                    tipDom && (tipDom.innerHTML = detail.msg);
                    btn && btn.classList.remove('disabled');
                };

                inputBox.addItem(new Button({
                    content: '确定',
                    type: 'primary',
                    onClick: (e) => {
                        if (!('BlueWhaleShell' in window || 'AppShell' in window)) {
                            Modal.alert('当前操作仅支持在蓝鲸PC客户端使用');
                            return null;
                        }
                        action = selectBox.getSelect()[0].value;
                        btn = (<HTMLElement>e.currentTarget);
                        btn.classList.add('disabled');
                        pos = 'AppShell' in window ? G.Shell : new ShellErpManagePc();
                        shellData = {
                            port: comSelectInput.get(),
                            speed: speedInput.get(),
                        };
                        //上传操作
                        if (action === 'upload') {
                            url = tools.url.addObj(res.uploadAddr.dataAddr, {'atvarparams': JSON.stringify(BwRule.atvar.dataGet())});
                            msg = 'callUpload';
                            if ("AppShell" in window) {
                                pos.casio.upload(shellData.port, shellData.speed, (e) => {
                                    sendFinish(e);
                                }, (e) => {
                                    sendMsg(e);
                                })
                            } else {
                                pos.inventory({
                                    msg: msg,
                                    data: shellData,
                                });
                            }
                        } else if (action === 'download') {
                            //下载操作
                            msg = 'callDownload';
                            url = res.downloadAddr.dataAddr;
                            inventoryAjax(null, btn, shellData, pos, msg);
                        }
                    }
                }));

                if ('BlueWhaleShell' in window) {
                    //上传下载过程中，shell返回给前端信息
                    d.on(window, 'sendMessage', (event: CustomEvent) => {
                        sendMsg(event);
                    });
                    //结束时，shell返回信息
                    d.on(window, 'sendFinish', (event: CustomEvent) => {
                        sendFinish(event);
                    });
                }
            }

            if (tools.isMb && type === 5) {
                para['header'] = {
                    rightPanel: inputBox,
                    title: caption
                };
            }
            para['footer'] = {
                rightPanel: inputBox
            };
        }
        modal = new Modal(para);
        tipDom = d.query('.progress-title', modal.bodyWrapper); //盘点机提示


        /**
         * 盘点机上传下载
         * @param ajaxData
         * @param shellData  传递给shell的数据
         * @param pos
         * @param msg
         * @param btn  确定按钮
         */
        function inventoryAjax(ajaxData: obj | string, btn?: HTMLElement, shellData?: obj, pos?: any, msg?: string) {
            if (!loading) {
                // TODO
                loading = new Loading({
                    msg: '正在获取数据...'
                });
            } else {
                loading && loading.show();
            }

            BwRule.Ajax.fetch(CONF.siteUrl + url, {
                type: 'POST',
                data: ajaxData
            }).then(({response}) => {
                if (msg === 'callDownload') {
                    shellData['data'] = response.body.bodyList[0].inventData;

                    if ("AppShell" in window) {
                        pos.casio.download(shellData.port, shellData.speed, shellData.data, (e) => {
                            sendFinish && sendFinish(e);
                        }, (e) => {
                            sendMsg && sendMsg(e);
                        })
                    } else {
                        pos.inventory({
                            msg: msg,
                            data: shellData,
                        });
                    }
                } else {
                    let resData = response.body && response.body.bodyList && response.body.bodyList[0];
                    if (resData && resData.showText) {
                        Modal.confirm({
                            msg: resData.showText,
                            callback: (index) => {
                                if (index == true) {
                                    loading && loading.show();
                                    // BwRule.ajax(CONF.siteUrl + resData.url,{
                                    //     type : 'post',
                                    //     data : ajaxData,
                                    //     success : (res) => {
                                    //         successCb(res)
                                    //     }
                                    // })
                                    BwRule.Ajax.fetch(CONF.siteUrl + resData.url, {
                                        type: 'post',
                                        data: ajaxData,
                                    }).then(({response}) => {
                                        successCb(response)

                                    });
                                } else {
                                    btn.classList.remove('disabled');
                                }
                            }
                        })
                    } else {
                        successCb(response)
                    }
                }
            }).finally(() => {
                loading && loading.hide();
            });

            function successCb(datas) {
                loading && loading.hide();
                Modal.alert(datas.msg);
                onOk();
                modal.destroy(() => {
                    offShellMonitor();
                });
            }
        }

        modal.onClose = () => {
            modal.destroy(() => {
                if (res.downloadAddr) {
                    offShellMonitor();
                }
            });
            return;
        };

        if (type === 3) {
            list();
        } else if (res.atvarparams) {
            //type4 or handle or
            let avatarLoad = modal.body,
                avatarProgress, confLeft, confRight, disabled = '';
            if (res.downloadAddr) {
                let body = modal.bodyWrapper;
                avatarLoad = d.query('.avatar-load', body);
                confRight = d.query(`.conf-right`, body);
                confLeft = d.query('.conf-left', body);
                avatarProgress = d.query('.avatar-progress', body);
                //下载上传
                selectBox = new SelectBox({
                    select: {
                        multi: false,
                        callback: function (index) {
                            let atvar = d.query('.atvarDom', body);
                            if (index === 0) {
                                atvar.classList.add('disabled');
                            } else {
                                atvar.classList.remove('disabled');
                            }
                        }
                    },
                    container: <HTMLElement>confLeft,
                    data: [{
                        value: 'download',
                        text: '下载数据'
                    }, {
                        value: 'upload',
                        text: '上传数据'
                    }]
                });

                //前台写死默认端口、速度
                speedInput = new SelectInput({
                    container: <HTMLElement>confRight,
                    className: 'speed-select',
                    data: [{
                        text: '1200bps',
                        value: '1200',
                    }, {
                        text: '2400bps',
                        value: '2400',
                    }, {
                        text: '4800bps',
                        value: '4800',
                    }, {
                        text: '9600bps',
                        value: '9600',
                    }, {
                        text: '19200bps',
                        value: '19200',
                    }, {
                        text: '1280000bps',
                        value: '1280000',
                    },]
                });
                comSelectInput = new SelectInput({
                    container: <HTMLElement>confRight,
                    className: 'com-select',
                    data: [{
                        text: 'COM1',
                        value: 'COM1'
                    }, {
                        text: 'COM2',
                        value: 'COM2'
                    }]
                });
                comSelectInput.set('COM1');
                speedInput.set('19200');
                disabled = 'disabled';
                require(['Progress'], (p) => {
                    progress = new p.Progress({
                        container: avatarProgress
                    })
                });
            }
            //TODO BwRule.atvar需改良成非静态
            require(['QueryBuilder'], (q) => {
                BwRule.atvar = new q.AtVarBuilder({
                    queryConfigs: res.atvarparams,
                    resultDom: avatarLoad,
                    tpl: () => d.create(`<div class="atvarDom ${disabled}"><div style="display: inline-block;" data-type="title"></div>
                    <span>：</span><div data-type="input"></div></div>`),
                    setting: res.setting
                });
                let coms = BwRule.atvar.coms,
                    keys = Object.keys(coms);
                if (keys && keys.length === 1 && coms[keys[0]] instanceof SelectInputMb) {
                    coms[keys[0]].showList();
                }
            });
        } else if (type === 5) {
            list();
        }

        function list() {
            modal.body = d.create(`<div style="height: 70vh;"></div>`);
            res.cols.forEach(c => {
                c['title'] = c.caption;
            });

            let tableData = tools.obj.merge(res, {
                multiSelect: res.multiValue ? res.multiValue : true,
                // isSub : type !== 3,
                isInModal: true,
            });

            require(['newTableModule'], (e) => {
                // debugger;
                table = new e.NewTableModule({
                    bwEl: Object.assign(tableData, {subButtons: []}),
                    container: modal.body as HTMLElement,
                });
                table.refresh();
                //编辑并保存之后调用回调
                if (type === 3) {
                    d.on(window, e.NewTableModule.EVT_EDIT_SAVE, () => {
                        onOk();
                    });
                }
            });
        }

        function offShellMonitor() {
            d.off(window, 'sendMessage');
            d.off(window, 'sendFinish');
        }
    }


    test(i) {
        console.log("test.buttonAction." + i);
    }

    static buttonAction: ButtonAction = null;

    private constructor() {
    }

    static get() {
        if (!ButtonAction.buttonAction)
            ButtonAction.buttonAction = new ButtonAction();
        return ButtonAction.buttonAction;
    }
}