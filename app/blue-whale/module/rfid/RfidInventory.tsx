/// <amd-module name="RfidInventory"/>
import { Modal } from "../../../global/components/feedback/modal/Modal";
import { BwRule } from "../../common/rule/BwRule";
import d = G.d;
import Shell = G.Shell;
import { Loading } from "../../../global/components/ui/loading/loading";
import CONF = BW.CONF;
import { Device } from "../../../global/entity/Device";
import { ButtonAction } from "../../common/rule/ButtonAction/ButtonAction";
interface IRfidConfPara {
    line: number,
    ip: string,
    port: number,
    com: string,
    baud: number,
    aerial: number,
    buzz: boolean,
    led: boolean,
}
interface ISortUiPara {
    title: string
    subTitle?: string
    keyField: string
    keyName: string
    nameField: string
    amount?: number
    classifyInfo: obj[]
}
interface IRfidInventoryPara {
    data; obj
    onClose: () => void
}
export class RfidInventory {
    private allCount: number = 0;
    private thisCount: number = 0;
    private allEl: HTMLElement;
    private thisEl: HTMLElement;
    private sortEl: HTMLElement;
    private titleEl: HTMLElement;
    private stopEl: HTMLElement;
    private beginEl: HTMLElement;
    private contentEl: HTMLElement;
    private barCodeEl: HTMLElement;
    private atvarEl: HTMLElement;
    private p: obj;
    private modal: Modal;
    private value: string = '';
    private recentData = {};
    private epc: string[] = [];
    private token: string;
    private isNew: boolean;
    private oldValue: string;
    constructor(data: IRfidInventoryPara) {
        this.p = data;
        this.init(data);
    }

    private init(data: IRfidInventoryPara) {
        this.modal = new Modal({
            header: {
                title: data.data.caption
            },
            tabIndex: true,
            className: 'rfid-modal',
            isOnceDestroy: true,
            body: this.modalBody(),
            keyDownHandle: this.keyHandle,
            footer: {
                leftPanel: [{
                    content: '开始',
                    className: 'rfid-begin',
                    onClick: () => {
                        this.start();
                    }
                }, {
                    content: "提交",
                    onClick: () => {
                        this.commit().then((msg) => {
                            Modal.toast(msg);
                        });
                    }
                }],
                rightPanel: [{
                    content: '停止',
                    className: 'rfid-stop',
                    onClick: () => {
                        this.stop();
                    }
                }]
            },
            onClose: () => {
                if (G.tools.isNotEmptyArray(this.epc)) {
                    Modal.confirm({
                        msg: '退出前是否要提交尚未处理的' + this.epc.length + '个RFID标签？',
                        callback: (flag) => {
                            flag && this.commit();
                            Shell.rfid.stop(() => { });
                            data.onClose && data.onClose();
                        }
                    })
                } else {
                    Shell.rfid.stop(() => { });
                    data.onClose && data.onClose();
                }
            }
        });
        this.token = window.localStorage.getItem('token');
        this.stopEl = d.query('.rfid-stop', this.modal.wrapper);
        this.beginEl = d.query('.rfid-begin', this.modal.wrapper);
        this.stopEl.classList.add('disabled-none');

        this.atvar(data.data.body.elements[0]);
    }

    private keyHandle = (e) => {
        let code = e.keyCode || e.which || e.charCode;
        //8 :退格  9:制表 16 shiftleft 20 capsLock 
        if (![8, 9, 16, 20, 32, 33, 34, 35, 37, 38, 39, 40, 46].includes(code)) {
            if (code === 13) {
                // console.log(this.value)
                this.scan(this.value);
                this.value = '';
            } else {
                this.value += e.key;
            }
        }

    };

    private dataGet() {
        let obj: any = this.recentData
        let splitObj: obj = {};
        if (this.ui && this.ui.classifyInfo) {
            let str: any = this.ui.classifyInfo
            let list = str.split(",");
            list.forEach(item => {
                if (obj[item]) {
                    splitObj[item] = obj[item];
                }
            })
        }
        if (this.ui && this.ui.keyField) {
            // BARCODE: obj.BARCODE
            splitObj[this.ui.keyField] = obj[this.ui.keyField];
        }
        // console.log(Object.assign(splitObj, {rfidepc : this.epc.join(',')}))
        return Object.assign(splitObj, { rfidepc: this.epc.join(',') })
    }

    private scan(value: string) {
        let scanCode = Shell.rfid.scanCode(value, this.uniqueFlag),
            data = null;
        // debugger;
        if (!this.beginEl.classList.contains('disabled-none')) {
            this.value = '';
            return;
        }
        if (scanCode.success) {
            data = scanCode.data[0];
            if (this.recentData && this.recentData[this.ui.keyField] == data[this.ui.keyField]) {
                this.isNew = true;
            } else {
                this.isNew = false;
            }
            // if (this.isNew) {
            //     if (this.recentData) {
            //         if (this.recentData[this.ui.keyField] == data[this.ui.keyField]) {
            //             this.isNew = true;
            //         }else{
            //             this.isNew = false;
            //         }
            //     }else{
            //         this.isNew = false;
            //     }
            // } else {
            //     this.isNew = false;
            // }



        } else {
            this.alert(scanCode.msg);
            return;
        }
        // 若扫入条码
        if ('BARCODE' in data) {
            // 若已有条码，先提交数据
            if (G.tools.isNotEmpty(this.recentData['BARCODE']) && !this.isNew) {
                this.commit(true).then(() => this.setValue(data));
            } else {
                // 若分类为空，不可设置条码值
                if (this.isSortEmpty()) {
                    this.alert('分类为空，需先扫入分类值');
                    return
                }
                this.setValue(data)
            }
        } else {
            this.setValue(data);
            if (this.isSortEmpty()) {
                this.barCodeEl && (this.barCodeEl.innerHTML = '');
                this.recentData[this.ui.keyField] = '';
            }
        }
    }

    private setValue(data: obj) {
        this.recentData = Object.assign(this.recentData, data);
        this.sortEls.forEach(el => {
            let name = el.dataset.name.split(','),
                value = '';
            if (name[0] === this.ui.keyField) {
                //
                this.ui.nameField.split(",").forEach(item => {
                    let caption = this.recentData[item];
                    value = value + (caption ? caption : '') + " "
                })

            } else {
                name.forEach((n, i) => {
                    if (n in this.recentData) {
                        if (i !== 0) {
                            value += '-'
                        }
                        value += this.recentData[n];
                    }
                });
            }
            el.innerHTML = value;
        });
        this.clearData();
    }

    private modalBody(): HTMLElement {
        return <div className="rfid-inventory">
            {this.titleEl = <div className="rfid-title" />}
            {this.sortEl = <div className="rfid-sort" />}
            {this.contentEl = <div className="rfid-content" />}
            {this.atvarEl = <div className="rfid-atvar" />}
            <div className="rfid-footer">
                <div>
                    <div>累计：</div>
                    {this.allEl = <div className="rfid-all">0</div>}
                </div>
                <div>
                    <div>本次：</div>
                    {this.thisEl = <div className="rfid-this">0</div>}
                </div>
            </div>
        </div>;
    }

    /**
     * at变量生成
     * @param res
     */
    private atVarBuilder: any;
    private atvar(res: obj) {
        let atvarparams = res.atvarparams;
        if (!atvarparams) {
            return;
        }
        require(['QueryBuilder'], (q) => {
            this.atVarBuilder = new q.AtVarBuilder({
                queryConfigs: atvarparams,
                resultDom: this.atvarEl,
                tpl: () => <div class="atvarDom  atvar-auto">
                    <div style="display: inline-block;" data-type="title" />
                    <div data-type="input" />
                </div>,
                setting: res.setting
            });
        });
    }

    private alert(msg: string) {
        Modal.alert(msg, null, () => this.focus());
    }

    private stop() {
        this.stopEl.classList.add('disabled-none');
        this.beginEl.classList.remove('disabled-none');
        this.recentData = {};
        Shell.rfid.stop((result) => {
            this.contentEl.appendChild(<div class="r">{result.msg}</div>);
        });
        this.focus();
    }

    private start() {
        this.beginEl.classList.add('disabled-none');
        this.stopEl.classList.remove('disabled-none');
        let ipResult: any = Shell.other.getData();
        let conf = ipResult,
            port = this.getRfidPort(conf);

        Shell.rfid.start(port.str, port.num, (result) => {
            let msg = result.success ? 'rfid开启成功' : 'rfid开启失败',
                data = result.data;
            // alert(JSON.stringify(result))
            if (result.success && G.tools.isEmpty(result.data)) {
                this.sortUi();
            }
            if (data) {
                msg = result.msg + '：' + data[0];
            }
            Array.isArray(data) && data.forEach(d => {
                if (this.epc.indexOf(d) === -1) {
                    this.epc.push(d);
                    this.contentEl.appendChild(<div class="r">{msg}</div>);
                    this.contentEl.scrollTop = 100000000;
                    this.thisCount++;
                    this.thisEl.innerHTML = this.thisCount + '';
                }
            });
        });
    }

    private _sortEls: HTMLElement[];
    get sortEls() {
        if (!this._sortEls) {
            this._sortEls = d.queryAll('[data-name]', this.sortEl);
        }
        return this._sortEls
    }

    private isSortEmpty() {
        let isEmpty = false;
        this.sortEls.forEach(el => {
            if (el.innerHTML === '' && el.dataset.name !== this.ui.keyField) {
                isEmpty = true;
            }
        });
        return isEmpty;
    }

    private commit(come: boolean = false) {
        return new Promise(resolve => {
            if (!this.epc[0]) {
                this.alert('无盘点数据');
                resolve();
                return;
            }

            if (this.isSortEmpty()) {
                this.alert('分类数据不能为空');
                return;
            }
            if (this._keyFildEl && this.isNew) {
                this.alert('条码数据不能为空!');
                return;
            }
            if (this._keyFildEl && G.tools.isEmpty(this._keyFildEl.innerHTML)) {
                this.alert('条码数据不能为空');
                return;
            }

            let loading = new Loading({
                msg: '数据上传中...',
                disableEl: this.modal.wrapper
            });

            let url = CONF.siteUrl + this.p.data.body.elements[0].uploadAddr.dataAddr,
                addData = {
                    token: this.token,
                    uuid: Device.get().uuid
                };
            if (this.atVarBuilder) {
                addData['atvarparams'] = JSON.stringify(this.atVarBuilder.dataGet())
            }
            url = G.tools.url.addObj(url, addData);

            BwRule.Ajax.fetch(url, {
                data: this.dataGet(),
                type: 'post',
            }).then(({ response }) => {
                let msg = response.msg;
                // Modal.toast(response.msg);
                BwRule.checkValue(response, this.dataGet(), (e) => {
                    if (!come) {
                        //扫码提交上次纪律不值true
                        this.isNew = true;
                    }
                    this.allCount = this.allCount + this.epc.length;
                    this.allEl.innerHTML = this.allCount + '';
                    this.modal.wrapper.focus();
                    this.clearData();
                    resolve(msg);
                });
                // console.log(response);
            }).finally(() => {
                loading.hide();
                this.focus();
            })
        });
    }

    private clearData() {
        this.epc = [];
        this.contentEl.innerHTML = '';
        this.thisCount = 0;
        this.thisEl.innerHTML = this.thisCount + '';
    }

    private uniqueFlag: string;
    private ui: ISortUiPara;
    private _keyFildEl: HTMLElement;
    private sortUi() {
        let loading = new Loading({
            msg: '下载数据中',
            disableEl: this.modal.wrapper
        });

        let element = this.p.data.body.elements[0],
            url = element.downloadAddr.dataAddr;
        this.uniqueFlag = element.uniqueFlag;
        Shell.rfid.downLoad(CONF.siteUrl + url, this.token, this.uniqueFlag, (result) => {
            if (result && result.success) {
                this.ui = result.data;
                let info = this.ui && this.ui.classifyInfo;
                // Array.isArray(info) && info.forEach(obj => {
                //     let keys = Object.keys(obj),
                //         li = <div class="rfid-li">
                //             <div>{obj[keys[0]]}：</div>
                //             <div data-name={keys.join(',')} />
                //         </div>;
                //     d.append(this.sortEl, li);
                // });
                //    let domlist= d.queryAll(".rfid-li",this.sortEl);
                //    if(domlist&&domlist.length>0){
                //        for(var i=0;i<domlist.length;i++){
                //            domlist[i].remove();
                //        }
                //    }
                this.sortEl.innerHTML = "<div></div>";
                if (info) {
                    let li = <div class="rfid-li">
                        <div data-name={info} />
                    </div>;
                    d.append(this.sortEl, li);
                }
                if (this.ui && this.ui.keyField) {
                    d.append(this.sortEl, <div className="rfid-li">
                        {/* <div>{this.ui.keyName}：</div> */}
                        {this._keyFildEl = <div data-name={this.ui.keyField} />}
                    </div>)
                }
                this.titleEl.innerHTML = this.ui && this.ui.title || '';
            } else {
                Modal.alert(result.msg, null, () => this.focus());
            }
            loading.destroy();
            this.focus();
        });
    };

    private getRfidPort = (conf: IRfidConfPara) => {
        let str, num;
        if (conf.line === 1) {
            str = conf.com;
            num = conf.baud;
        } else {
            str = conf.ip;
            num = conf.port;
        }
        num = parseInt(num);
        return { str, num }
    };

    private focus() {
        this.modal && this.modal.wrapper && this.modal.wrapper.focus();
    }
}
