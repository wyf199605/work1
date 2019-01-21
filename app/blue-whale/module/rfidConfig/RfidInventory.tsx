/// <amd-module name="RfidInventory"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import d = G.d;
import Shell = G.Shell;
import {Loading} from "../../../global/components/ui/loading/loading";
import CONF = BW.CONF;
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
    title : string
    subTitle? : string
    keyField : string
    nameField : string
    amount? : number
    classifyInfo : obj[]
}
interface IRfidInventoryPara {
    data ; obj
    onClose : () => void
}
export class RfidInventory {
    private allCount: number = 0;
    private thisCount: number = 0;
    private allEl: HTMLElement;
    private thisEl: HTMLElement;
    private sortEl: HTMLElement;
    private titleEl : HTMLElement;
    private stopEl: HTMLElement;
    private beginEl: HTMLElement;
    private contentEl: HTMLElement;
    private barCodeEl : HTMLElement;
    private atvarEl : HTMLElement;
    private p: obj;
    private modal: Modal;
    private value: string = '';
    private recentData ; obj;
    private epc : string[] = [];
    private token : string;

    constructor(data: IRfidInventoryPara) {
        console.log(data);
        this.p = data;
        this.init(data);
    }

    private init(data) {
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
                        this.commit();
                    }
                }],
                rightPanel: [{
                    content: '停止',
                    className: 'rfid-stop',
                    onClick: () => {
                        this.stop();
                    }
                }]
            }
        });
        this.token = window.localStorage.getItem('token');
        this.stopEl = d.query('.rfid-stop', this.modal.wrapper);
        this.beginEl = d.query('.rfid-begin', this.modal.wrapper);
        this.stopEl.classList.add('disabled-none');
        this.sortUi();
        this.atvar(data.data.body.elements[0])
    }

    private keyHandle = (e) => {
        let code = e.keyCode || e.which || e.charCode;
        if (code === 13) {
            this.scan();
        } else {
            this.value += e.key;
        }
    };

    private dataGet() : ISortUiPara[]{
        return Object.assign(this.recentData, {RFIDEPC : this.epc.join(',')})
    }

    private scan(){
        Shell.rfid.scanCode(this.value,result => {
            this.recentData = result.data;
            'BARCODE' in this.recentData ? this.commit().then(() => this.setValue()) : this.setValue();
        });
    }

    private setValue(){
        let els = d.queryAll('[data-name]', this.sortEl);
        els.forEach( el => {
            let name = el.dataset.name.split(','),
                value = '';
            name.forEach((n, i) => {
                if(n in this.recentData){
                    if(i !== 0){
                        value += '-'
                    }
                    value += this.recentData[n];
                }
            });
            el.innerHTML = value;
        });

        this.value = '';
    }

    private modalBody() : HTMLElement{
        return <div className="rfid-inventory">
            {this.titleEl = <div className="rfid-title"></div>}
            {this.sortEl = <div className="rfid-sort"></div>}
            {this.contentEl = <div className="rfid-content"></div>}
            {this.atvarEl = <div className="rfid-atvar"></div>}
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
    private atVarBuilder : any;
    private atvar(res : obj){
        let atvarparams = res.atvarparams;
        if(!atvarparams){
            return;
        }
        require(['QueryBuilder'], (q) => {
            this.atVarBuilder = new q.AtVarBuilder({
                queryConfigs: atvarparams,
                resultDom: this.atvarEl,
                tpl: () => d.create(`<div class="atvarDom atvar-auto"><div style="display: inline-block;" data-type="title"></div>
                    <div data-type="input"></div></div>`),
                setting: res.setting
            });
        });
    }

    private stop() {
        this.stopEl.classList.add('disabled-none');
        this.beginEl.classList.remove('disabled-none');
        Shell.rfid.stop((result) => {
            this.contentEl.appendChild(<div class="r">{result.msg}</div>);
        });
        this.modal.wrapper.focus();
    }

    private start() {
        this.beginEl.classList.add('disabled-none');
        this.stopEl.classList.remove('disabled-none');

        let conf = JSON.parse(window.localStorage.getItem('rfidConf')),
            port = this.getRfidPort(conf);

        Shell.rfid.start(port.str, port.num, (result) => {
            let msg = result.success ? 'rfid开启成功' : 'rfid开启失败';
            if (result.data) {
                msg = result.msg + '：' + result.data[0];
            }
            this.contentEl.appendChild(<div class="r">{msg}</div>);
            this.contentEl.scrollTop = 100000000;
            this.allCount++;
            this.thisCount++;
            this.allEl.innerHTML = this.allCount + '';
            this.thisEl.innerHTML = this.thisCount + '';
            this.epc = this.epc.concat(result.data);
        });
    }

    private commit() {
        return new Promise(resolve => {
            let loading = new Loading({
                msg : '数据上传中...',
                disableEl : this.modal.wrapper
            });

            if(this.barCodeEl && !('BARCODE' in this.recentData)){
                this.epc = [];
                this.clearData();
                this.modal.wrapper.focus();
                resolve();
                return;
            }

            let url = CONF.siteUrl + this.p.data.body.elements[0].uploadAddr.dataAddr;
            url = G.tools.url.addObj(url, {
                token : this.token,
                atvarparams: JSON.stringify(this.atVarBuilder.dataGet())
            });
            BwRule.Ajax.fetch(url, {
                data: this.dataGet(),
                type: 'post',
            }).then(({response}) => {
                console.log(response);
                Modal.toast('上传成功');
                this.epc = [];
                this.clearData();
                this.modal.wrapper.focus();
                resolve();
            }).finally(() => {
                loading.hide();
                this.focus();
            })
        });


    }

    private clearData(){
        let els = d.queryAll('[data-name]', this.sortEl);
        els.forEach( el => el.innerHTML = '');
        this.contentEl.innerHTML = '';
        this.thisCount = 0;
        this.thisEl.innerHTML = this.thisCount + '';
    }

    private sortUi() {
        let loading = new Loading({
            msg : '下载数据中',
            disableEl : this.modal.wrapper
        });

        let element = this.p.data.body.elements[0],
            uniqueFlag = element.uniqueFlag,
            url = element.uploadAddr.dataAddr;
        Shell.rfid.downLoad(CONF.siteUrl +  url, this.token, uniqueFlag,(result) => {
            let data : ISortUiPara = result.data;
            data.classifyInfo.forEach(obj => {
                let keys = Object.keys(obj),
                    li = <div class="rfid-li">
                        <div>{obj[keys[0]]}：</div>
                        <div data-name={keys.join(',')}></div>
                    </div>;
                d.append(this.sortEl, li);
            });
            if(data.keyField){
                d.append(this.sortEl, <div className="rfid-li">
                    <div>{data.nameField}：</div>
                    <div data-name={data.keyField}></div>
                </div>)
            }
            this.titleEl.innerHTML = data.title;
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
        return {str, num}
    };

    private focus(){
        this.modal.wrapper.focus();
    }
}
