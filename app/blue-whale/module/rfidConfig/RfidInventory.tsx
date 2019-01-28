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
    private recentData = {};
    private epc : string[] = [];
    private token : string;

    constructor(data: IRfidInventoryPara) {
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
                        this.commit().then();
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
            onClose : () => {
                Shell.rfid.stop(() => {});
            }
        });
        this.token = window.localStorage.getItem('token');
        this.stopEl = d.query('.rfid-stop', this.modal.wrapper);
        this.beginEl = d.query('.rfid-begin', this.modal.wrapper);
        this.stopEl.classList.add('disabled-none');
        this.sortUi();
        this.atvar(data.data.body.elements[0]);
    }

    private keyHandle = (e) => {
        let code = e.keyCode || e.which || e.charCode;
        if (code === 13) {
            this.scan(this.value);
            this.value = '';
        } else {
            this.value += e.key;
        }
    };

    private dataGet(){
        return Object.assign(this.recentData, {rfidepc : this.epc.join(',')})
    }

    private scan(value : string){
        let scanCode = Shell.rfid.scanCode(value,this.uniqueFlag),
            data = null;

        if(scanCode.success){
            data = scanCode.data[0]
        }else {
            Modal.alert(scanCode.msg, null, () => {
                this.focus();
            });
            return;
        }
        if('BARCODE' in data){
            if(this.isEmpty()){
                Modal.alert('分类数据不能为空', null, () => this.focus());
                return;
            }
            this.recentData['BARCODE'] ? this.commit().then(() => this.assign({BARCODE : data.BARCODE})) : this.assign(data);
        }else {
            this.assign(data);
            if(this.isEmpty()){
                this.barCodeEl && (this.barCodeEl.innerHTML = '');
                this.recentData['BARCODE'] = '';
            }
        }
    }

    private assign(data : obj){
        this.recentData = Object.assign(this.recentData, data);
        this.setValue();
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
        this.contentEl.innerHTML = '';
        this.epc = [];
    }

    private modalBody() : HTMLElement{
        return <div className="rfid-inventory">
            {this.titleEl = <div className="rfid-title"/>}
            {this.sortEl = <div className="rfid-sort"/>}
            {this.contentEl = <div className="rfid-content"/>}
            {this.atvarEl = <div className="rfid-atvar"/>}
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
                tpl: () =><div class="atvarDom atvar-auto">
                    <div style="display: inline-block;" data-type="title">
                    </div>
                    <div data-type="input">
                    </div>
                </div>,
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
            let msg = result.success ? 'rfid开启成功' : 'rfid开启失败',
                data = result.data;
            if (data) {
                msg = result.msg + '：' + data[0];
            }
            Array.isArray(data) && data.forEach(d => {
                if(this.epc.indexOf(d) === -1){
                    this.epc.push(d);
                    this.contentEl.appendChild(<div class="r">{msg}</div>);
                    this.contentEl.scrollTop = 100000000;
                    this.allCount++;
                    this.thisCount++;
                    this.allEl.innerHTML = this.allCount + '';
                    this.thisEl.innerHTML = this.thisCount + '';
                }
            });
        });
    }

    private isEmpty(){
        let els = d.queryAll('[data-name]', this.sortEl),
            isEmpty = false;
        els.forEach( el => {
            if(el.innerHTML === '' && el.dataset.name !== 'BARCODE'){
                isEmpty = true;
            }
        });
        return isEmpty;
    }
    private commit() {
        return new Promise(resolve => {
            if(!this.epc[0]){
                Modal.alert('无盘点数据', null, () => {
                    this.focus();
                });
                resolve();
                return;
            }
            let loading = new Loading({
                msg : '数据上传中...',
                disableEl : this.modal.wrapper
            });

            let url = CONF.siteUrl + this.p.data.body.elements[0].uploadAddr.dataAddr,
                addData = {token : this.token};
            if(this.atVarBuilder){
                addData['atvarparams'] = JSON.stringify( this.atVarBuilder.dataGet())
            }
            url = G.tools.url.addObj(url, addData);

            BwRule.Ajax.fetch(url, {
                data: this.dataGet(),
                type: 'post',
            }).then(({response}) => {
                console.log(response);
                Modal.toast(response.msg);
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
        this.contentEl.innerHTML = '';
        this.thisCount = 0;
        this.thisEl.innerHTML = this.thisCount + '';
    }

    private uniqueFlag : string;
    private sortUi() {
        let loading = new Loading({
            msg : '下载数据中',
            disableEl : this.modal.wrapper
        });

        let element = this.p.data.body.elements[0],
            url = element.downloadAddr.dataAddr;
        this.uniqueFlag = element.uniqueFlag;
        Shell.rfid.downLoad(CONF.siteUrl +  url, this.token, this.uniqueFlag,(result) => {
            let data : ISortUiPara = result.data;
            console.log(data,'这是下载数据');
            Array.isArray(data) && data.classifyInfo.forEach(obj => {
                let keys = Object.keys(obj),
                    li = <div class="rfid-li"> 
                        <div>{obj[keys[0]]}：</div>
                        <div data-name={keys.join(',')}/>
                    </div>;
                d.append(this.sortEl, li);
            });
            if(data && data.keyField){
                d.append(this.sortEl, <div className="rfid-li">
                    <div>{data.nameField}：</div>
                    <div data-name={data.keyField}/>
                </div>)
            }
            this.titleEl.innerHTML = data && data.title || '';
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
