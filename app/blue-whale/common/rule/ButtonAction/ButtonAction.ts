/// <amd-module name="ButtonAction"/>
import tools = G.tools;
import {InputBox} from "../../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../../global/components/general/button/Button";
import {IModal, Modal} from "../../../../global/components/feedback/modal/Modal";
import {SelectBox} from "../../../../global/components/form/selectBox/selectBox";
import CONF = BW.CONF;
import d = G.d;
import {ShellErpManagePc} from "../../../../global/shell/pcImpl/ShellErpManage";
import {SelectInput} from "../../../../global/components/form/selectInput/selectInput";
import {Loading} from "../../../../global/components/ui/loading/loading";
import {BwRule} from "../BwRule";
import {SelectInputMb} from "../../../../global/components/form/selectInput/selectInput.mb";
import {User} from "../../../../global/entity/User";
import {RingProgress} from "../../../../global/components/ui/progress/ringProgress";
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
    }, url?: string, itemId?: string, atvData?: obj) {
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
            require(['BwUploader'], function (BwUploader) {
                let loadUrl = CONF.siteUrl + btn.actionAddr.dataAddr;
                com = new BwUploader.BwUploader({
                    container: <HTMLElement>uploderModal.body,
                    uploadUrl: loadUrl + (loadUrl.indexOf('?') > -1 ? '&' : '?') + "item_id=" + itemId,
                    onSuccess: (result) => {
                        console.log(result);
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
                        }, 100);
                        callback(result);
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
                } else if (btn.subType === 'reject') {
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
                self.btnAction(btn, data, callback, url, atvData);
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
                    if (tools.isMb && tools.isEmpty(tools.url.getPara('instance')) && tools.url.getPara('page') === 'flowReport'){
                        BW.sys.window.reOpen({
                            url:url
                        })
                    } else{
                        BW.sys.window.close(BwRule.EVT_REFRESH, null, url);
                    }
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
    }, url?: string, avtData?: obj) {
        let {addr, data} = BwRule.reqAddrFull(btn.actionAddr, dataObj),
            self = this,
            ajaxType = ['GET', 'POST', 'PUT', 'DELETE'][btn.buttonType];

        if (dataObj && (!Array.isArray(dataObj) || dataObj.length === 1)) {
            addr && (addr = tools.url.replaceTmpUrl(addr, Array.isArray(dataObj) ? dataObj[0] : dataObj));
        }
        if (avtData) {
            addr && (addr = tools.url.addObj(addr, {'atvarparams': JSON.stringify(BwRule.atvar.dataGet())}));
        }
        let varType = btn.actionAddr.varType, res: any = data;

        if (varType === 3 && typeof data !== 'string') {
            // 如果varType === 3 则都转为数组传到后台
            let tmp = data;
            if (tools.isEmpty(data)) {
                // 不传任何数据

            } else if (!Array.isArray(tmp)) {
                tmp = [tmp];
                res = JSON.stringify(tmp);
            } else {
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
                }, () => callback(null));
                break;
            case 'popup':
                if (!ajaxType) {
                    Modal.alert('buttonType不在0-3之间, 找不到请求类型!');
                    return;
                }

                addr = tools.url.addObj(addr, {output: 'json'});
                self.checkAction(btn, dataObj, addr, ajaxType, res, url).then(response => {
                    //创建条码扫码页面
                        self.btnPopup(response, () => {
                            self.btnRefresh(btn.refresh, url);
                        }, url);
                    callback(response);
                }, () => callback(null));
                break;
            case  'barcode_inventory':
                if (!ajaxType) {
                    Modal.alert('buttonType不在0-3之间, 找不到请求类型!');
                    return;
                }
                addr = tools.url.addObj(addr, {output: 'json'});
                let can2dScan = G.Shell.inventory.can2dScan;

                if(can2dScan || tools.isMb){
                    self.checkAction(btn, dataObj, addr, ajaxType, res, url).then(response => {
                        //创建条码扫码页面
                        if (response.uiType === 'inventory' && tools.isMb) {
                            this.initBarCode(response, data, dataObj);
                            self.btnRefresh(btn.refresh, url);
                        }
                        callback(response);
                    }, () => callback(null))
                }else {
                    callback(null);
                    Modal.alert('目前不支持PC端功能');
                }
                break;
            case 'newwin':
            default:
                let openUrl = tools.url.addObj(BW.CONF.siteUrl + addr, data);
                if (varType === 3 && res) {
                    openUrl = tools.url.addObj(openUrl, {bodyParams: res}, false)
                }
                callback(null);
                BW.sys.window.open({
                    url: openUrl,
                    gps: !!btn.actionAddr.needGps,
                }, url);
                self.btnRefresh(btn.refresh, url);
        }
    }

    private initBarCode(res, data, dataObj) {
        // console.log(res.body.elements)
        let dataAddr = res.body.elements,
            codeStype: object[],
            url: string,
            uniqueFlag: string,
            ajaxUrl: string,
            uploadUrl: string,
            downUrl: string,
            picAddr:string,
            picFields:string;

        for (let i = 0; i < dataAddr.length; i++) {
            url = dataAddr[i].downloadAddr.dataAddr;
            if(dataAddr[i].atvarparams){
                codeStype = dataAddr[i].atvarparams[0] ? dataAddr[i].atvarparams[0].data : [];//可能需要做判断
            }
            uniqueFlag = dataAddr[i].uniqueFlag;
            uploadUrl = dataAddr[i].uploadAddr.dataAddr;
            picFields = dataAddr[i].picFields || '';
            picAddr = dataAddr[i].picAddr ? dataAddr[i].picAddr.dataAddr : '';

        }
        let USER = User.get().userid,
            SHO = User.get().are_id;

        require(['RfidBarCode'], (p) => {
            new p.RfidBarCode({
                codeStype: codeStype,
                SHO_ID: SHO,
                USERID: USER,
                uploadUrl: uploadUrl,
                downUrl: url,
                uniqueFlag: uniqueFlag,
                picFields:picFields,
                picAddr:CONF.siteUrl+picAddr
            })
        })

    }

    /**
     * 后台有配置actionHandle情况下的处理
     */
    private checkAction(btn: R_Button, dataObj: obj | obj[], addr?: string, ajaxType?: string, ajaxData?: any, url?: string): Promise<any> {
        let self = this;
        return new Promise((resolve, reject) => {
            BwRule.Ajax.fetch(BW.CONF.siteUrl + addr, {
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
                    } else if(data.type === 2) {
                        this.progressPopup(data.url, data.showText);
                        resolve()
                    } else {
                        Modal.confirm({
                            msg: data.showText,
                            callback: (confirmed) => {
                                if (confirmed) {
                                    self.checkAction(btn, dataObj, data.url, ajaxType, ajaxData, url).then((response) => {
                                        resolve(response);
                                    });
                                }else{
                                    reject();
                                }
                            }
                        });
                    }
                } else {
                    // 默认提示
                    if (!('hintAfterAction' in btn) || btn.hintAfterAction) {
                        if (data && data.showText) {
                            Modal.alert(data.showText);
                        } else if (btn.openType !== 'popup') {
                            Modal.toast(response.msg || `${btn.title}成功`);
                        }
                    }

                    resolve(response);
                    // callback(response);
                }
            });
        })

    }

    progressPopup(url: string, msg: string){
        if(url){
            let body = d.create(`<div style="padding: 4px 15px;"></div>`),
                text = d.create(`<p>${msg}</p>`),
                time = 5000;
            let progress = new RingProgress({
                container: body,
                textColor: '#fff'
            });
            msg && d.append(body, text);
            let modal = new Modal({
                isMb: false,
                isBackground: false,
                body: body,
                top: 200,
                className: 'modal-toast'
            });

            let getProgress = () => {
                let percent = 0;
                return BwRule.Ajax.fetch(BW.CONF.siteUrl + url).then(({response}) => {
                    let {
                        allAccount: all,
                        curAccount: current,
                        message,
                        errorCode
                    } = response;
                    if(errorCode === 0){
                        percent = current / all * 100;
                        if(percent >= 100){
                            progress.format(percent, false, 250);
                            setTimeout(() => {
                                modal.destroy();
                                Modal.alert(message);
                            }, 500)
                        }else{
                            progress.format(percent, false, time - 300);
                            setTimeout(() => {
                                getProgress();
                            }, time);
                        }
                    }else{
                        modalDestroy(percent, msg);
                    }
                }).catch(() => {
                    modalDestroy(percent, '执行操作失败');
                })
            };

            let modalDestroy = (percent, msg) => {
                text.innerText = msg;
                progress.format(percent, true);
                setTimeout(() => {
                    modal.destroy();
                }, time);
            };

            getProgress();
        }

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
            width: number,    //模态框宽度
            progress, //进度条
            tipDom,   //盘点机信息提示
            table;    //表格模块

        BwRule.atvar = null;
        if (type === 3 || type === 5) {
            if (len > 6) {
                width = 100 * 10;
            }
        } else {
            width = 260;
        }
        //模态框参数
        let body = d.create(`<div></div>`);
        if (res.downloadAddr) {
            body = d.create(`<div><div class="avatar-load"><div class="conf-left"></div><div class="conf-right">
                </div></div><div class="avatar-progress"><div class="progress-title">传输尚未开始</div></div></div>`)
        }
        let caption = response.caption,
            para: IModal = {
                body: body,
                header: caption,
                isOnceDestroy: true,
                width: width + 'px',
                isAdaptiveCenter: true,
                isMb: false,
                top: tools.isMb ? 80 : null,
                onClose: () => {
                    modal.destroy(() => {
                        if (res.downloadAddr) {
                            offShellMonitor();
                        }
                    });
                    if (type === 3) {
                        BW.sys.window.fire(BwRule.EVT_REFRESH, null, url);
                    }
                }
            };

        if (type === 3 || type === 5) {
            para['className'] = tools.isMb ? 'mb-action-type-5' : 'action-type-5';
        } else if (type === 4) {
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
                            if (res.atvarparams) {
                                data[0] = selectInput;

                                let errTip = '',
                                    atvData = BwRule.atvar.dataGet(),
                                    atvarparams = res.atvarparams;
                                atvarparams.forEach(obj => {
                                    if (obj.atrrs.requiredFlag === 1 && atvData[obj.field_name] === '') {
                                        errTip += obj.caption + ',';
                                    }
                                });
                                if (errTip !== '') {
                                    Modal.alert(errTip.substring(0, errTip.length - 1) + '不能为空');
                                    return;
                                }
                            } else if (type === 5) {
                                data[0] = table.main.ftable.selectedRowsData;
                            }
                            data[1] = res;
                            modal.destroy();
                        }

                        this.clickHandle(obj, data, (r) => {
                            onOk();
                        }, url, null, BwRule.atvar && BwRule.atvar.dataGet());
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
                            Modal.alert(event && typeof event.mag === 'string' ? event.msg : '调用接口失败，请重试！');
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


        if (type === 3 || type === 5) {
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
                tools.isMb && (modal.position = 'comCenter');
            });
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
