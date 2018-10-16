///<amd-module name="LoginPage"/>
import SPAPage = C.SPAPage;
import {TextInput} from "../../global/components/form/text/text";
import {SelectInput} from "../../global/components/form/selectInput/selectInput";
import {CheckBox} from "../../global/components/form/checkbox/checkBox";
import {Modal} from "../../global/components/feedback/modal/Modal";
import {NumInput} from "../../global/components/form/numInput/numInput";
import d = C.d;
import {Tab} from "../../global/components/ui/tab/tab";
import {Com} from "../../com";
import SPA = C.SPA;
import {CashierRequest} from "../../request/CashierRequest";
import {cashReceiptPrint} from "../../module/print/Print";
import {Button} from "../../global/components/general/button/Button";
import {SelectBox} from "../../global/components/form/selectBox/selectBox";
import Shell = C.Shell;
import {Loading} from "../../global/components/ui/loading/loading";

export class LoginPage extends SPAPage {
    private tpl: HTMLElement;
    private tip: HTMLElement;
    // 收银设置
    private sever: SelectInput;
    private serverText : TextInput;
    private print: SelectInput;
    private scenes: SelectInput;
    private row: NumInput;
    private doubleCoupon: CheckBox;
    private boot: CheckBox;
    private showDown: CheckBox;
    private text: TextInput;
    private btn : Button;

    // RFID设置
    private com : SelectInput;
    private select : SelectBox;
    private baud : SelectInput;
    private ip : TextInput;
    private port : TextInput;
    private aerial : NumInput;
    private buzz : CheckBox;
    private led : CheckBox;
    private reset : Button;
    private test : Button;
    private end: Button;

    private handle : (e) => void;
    protected init(para: Primitive[]) {
       this.handle = (e) => {
            e.preventDefault();

           let keyCode = e.keyCode || e.which || e.charCode;

           switch (keyCode){
                case 113:  // F2
                    Shell.finger.cancel(function () {});
                    if (!Com.confModal) {
                        Com.confModal = new Modal({
                            header : {
                                title: '收银台设置',
                            },
                            body: d.create(`<div></div>`),
                            className : 'cashier-conf',
                            isBackground : false,
                            width : '360px',
                            keyDownHandle : this.confModalHandle,
                            footer: {}
                        });
                        this.initTab();
                        Com.confModal.onOk = () => {
                            this.confModalOnOk();
                        };
                        Com.confModal.onCancel = () => {
                            Com.confModal.isShow = false;
                            this.finger();
                        };

                    } else {
                        Com.confModal.isShow = true;
                        Com.confModal.wrapper.focus();
                    }
                    break;
                case 123:  // F12
                    cashReceiptPrint({
                        isTest : true
                    });
                    break;
                case 27:
                     let conf : IPrintConfPara = Com.local.getItem('printerConf');
                     // 自动关机
                     if(conf && conf.shutDown){
                         Shell.startUp.shutDown(function () {
                             window.close();
                         });
                     }else {
                         window.close();
                     }
                     break;

            }
        };
       this.show();
    }


    private confModalOnOk(){
        let msgDom : HTMLElement = d.query('.print-msg', this._printTpl),
            status : string = msgDom.dataset.status;

        switch (status){
            case '0':
                Com.local.setItem('rfidConf',{
                    line : this.select.getChecked()[0],
                    ip : this.ip.get(),
                    port : parseInt(this.port.get()),
                    com : this.com.get(),
                    baud : this.baud.get(),
                    aerial : this.aerial.get(),
                    buzz : this.buzz.get() === 1,
                    led : this.led.get() === 1,
                });

                let server = this.serverText.get(),
                    boot = this.boot.get() === 1,
                    showDown = this.showDown.get() === 1,
                    scenes = this.scenes.get();

                let print = Com.local.getItem('printerConf');

                Com.local.setItem('printerConf', {
                    scenes : scenes,
                    printer : this.print.get(),
                    row : this.row.get(),
                    check : this.doubleCoupon.get() === 1,
                    text : this.text.get(),
                    boot : boot,
                    shutDown : showDown,
                });

                window.localStorage.setItem('serverUrl', server);

                // 开机启动项
                Shell.startUp.start(boot);
                let loading = new Loading({
                    msg : '配置保存中',
                    disableEl : Com.confModal.wrapper
                });

                // 延时5秒解决壳保存数据到localstory存在延时问题
                setTimeout(() => {
                    loading.destroy();
                    let urlSite = server + 'cashier';
                    if(Com.urlSite !== urlSite || (print.scenes !== scenes)){
                        Com.urlSite = urlSite;
                        window.location.reload();
                    }else {
                        this.finger();
                        Com.confModal.isShow = false;
                    }
                },5000);
                break;
            case '1':
                Modal.alert('服务器连接失败。');
                break;
            case '2':
                Modal.alert('请先点击测试连接，确保服务器能正常连接。');
                break;
            case '3':
                Modal.alert('服务器地址手动修改过，请先点击测试连接。');
                break;
        }
    }

    private confModalHandle = (e : KeyboardEvent) => {
        let keyCode = e.keyCode || e.which || e.charCode,
            altKey = e.altKey;
        this.altCombKey(altKey, keyCode);

        switch (keyCode){
            case 27:
                this.finger();
                break;

            case 9: // Tab
                let okDom = d.query('.button-type-primary', Com.confModal.modalFooter.wrapper);

                okDom.onblur = (e) => {
                    setTimeout(function () {
                        Com.confModal.wrapper.focus();
                    }, 100)
                };
                break;
            case 13:
                this.confModalOnOk();
                break;
        }
    };

    private altCombKey(altKey : boolean, keyCode : number){
        if(altKey){
            switch (keyCode){
                case 83: // S服务器
                    this.sever.tabIndexElGet().focus();
                    break;
                case 84: // T测试连接
                    this.btn.wrapper.focus();
                    break;
                case 80: // P打印机
                    this.print.tabIndexElGet().focus();
                    break;
                case 70: // F固定行数
                    this.row.tabIndexElGet().focus();
                    break;
                case 68: // D为促销
                    this.doubleCoupon.tabIndexElGet().focus();
                    break;
                case 77: // M收银模式
                    this.scenes.tabIndexElGet().focus();
                    break;
                case 78: // N备注
                    this.text.tabIndexElGet().focus();
                    break;
                case 66: // B自动启动
                    this.boot.wrapper.focus();
                    break;
                case 79: // O自动关机
                    this.showDown.wrapper.focus();
                    break;

            }
        }
    }


    private finger(){
        if(!CA.Config.isProduct){
            d.once(this.tpl, 'click', ()=> {
                CashierRequest({
                    dataAddr : Com.url.login,
                    method : 'post',
                    addParam : CA.Config.cpuserialno,
                    objId : Com.getConfigValue('user_login'),
                    type : 'finger',
                    data : {
                        fingertype : CA.Config.fingertype,
                        fingerprint : CA.Config.fingerprint
                    },
                    notVarList : true
                }).then(({response}) => {
                    this.tip.innerHTML = response.msg;
                    let type = response.type;
                    if(type === '1'){
                        this.openMainPage();
                    }else if(type === '0'){
                        // 失败
                        // this.p.fingerCb(response);
                    }
                });
            });
        }else {
            Com.finger(this.tip, Com.url.login, (res) => {
                this.openMainPage();
            });
        }



    }

    private openMainPage(){
        this.tip.innerHTML = '正在前往主界面...';
        CashierRequest(Com.mainAddr).then(({response}) => {
            SPA.open(SPA.hashCreate('main', ''), response);
        });
    }

    on() {
        d.on(document, 'keydown', this.handle);
    }

    off() {
        d.off(document, 'keydown', this.handle);
    }

    show(){
        this.on();
        this.finger();
        this.onLineTip();
    }

    private initTab() {
        new Tab({
            tabParent: Com.confModal.body as HTMLElement,
            panelParent: Com.confModal.body as HTMLElement,
            tabs: [{
                title: '收银设置',
                dom: this.printTpl(),
            },{
                title: 'RFID设置',
                dom: this.rfidTpl(),
            }],
            tabIndex : true,
            tabIndexKey : 32
        });
    }

    private onLineTip(){
        let dom = d.query('.msg-login', this.tpl),
            version = 'V ' + window.localStorage.getItem('sqlQueryData'),
            onlineMsg = version + ' 网络连接正常',
            offlineMsg = version + ' 网络连接断开';

        if(!window.navigator.onLine){
            dom.innerHTML = offlineMsg;
        }else {
            dom.innerHTML = onlineMsg;

        }
        d.on(window, 'online', (r) => {
            dom.innerHTML = onlineMsg;
        });
        d.on(window, 'offline', (r) => {
            dom.innerHTML = offlineMsg;
        });
    }

    private _rfidTpl : HTMLElement;
    private rfidTpl(){
        this._rfidTpl = d.create(`<div class="rfid-conf">
            <div class="rfid-row">
                <div class="row-left">
                    <div class="rfid-select"></div>
                </div>
                <div class="row-right">
                     <div class="rfid-row line">
                         <div class="text">ip</div>
                         <div class="rfid-ip"></div>
                         <div class="text text-port">端口</div>
                         <div class="rfid-port"></div>
                    </div>
                     <div class="rfid-row unline">
                        <div class="text">串口</div>
                        <div class="rfid-com"></div>
                        <div class="text text-baud">波特率</div>
                        <div class="rfid-baud"></div>
                    </div>
                </div>
                
            </div>
            <div class="rfid-row">
                <div class="text">天线功率</div>
                <div class="rfid-aerial"></div>
                <div class="rfid-buzz"></div>
                <div class="rfid-led"></div>
            </div>
            <div class="rfid-content"></div>
            <div class="rfid-row btn-group"">
                <div class="btn-left reset"></div>
                <div class="btn-center begin-test"></div>
                <div class="btn-right end-test"></div>
            </div></div>`);
        let q = (name) => {
            return d.query(name, this._rfidTpl);
        };

        let com = q('.rfid-com'),
            select = q('.rfid-select'),
            line = q('.line'),
            unLine = q('.unline'),
            baud = q('.rfid-baud'),
            ip = q('.rfid-ip'),
            port = q('.rfid-port'),
            aerial = q('.rfid-aerial'),
            buzz = q('.rfid-buzz'),
            led = q('.rfid-led'),
            content = q('.rfid-content'),
            reset = q('.reset'),
            test = q('.begin-test'),
            end = q('.end-test'),
            ipInput : HTMLElement,
            portInput : HTMLElement;

        let rfidConf : IRfidConfPara = Com.local.getItem('rfidConf'),
            lineDisabled = () => {
                ipInput.setAttribute('disabled', '');
                portInput.setAttribute('disabled', '');
                unLine.classList.remove('disabled');
                line.classList.add('disabled');
            },
            unLineDisabled = () => {
                ipInput.removeAttribute('disabled');
                portInput.removeAttribute('disabled');
                line.classList.remove('disabled');
                unLine.classList.add('disabled');
            };

        this.com = new SelectInput({
            container : com,
            clickType : 0,
            tabIndex : true,
            readonly : true,
            data : [{
                text : 'COM1',
                value : 'COM1',
            },{
                text : 'COM2',
                value : 'COM2',
            },{
                text : 'COM3',
                value : 'COM3',
            },{
                text : 'COM4',
                value : 'COM4',
            },{
                text : 'COM5',
                value : 'COM5',
            },{
                text : 'COM6',
                value : 'COM6',
            },{
                text : 'COM7',
                value : 'COM7',
            },{
                text : 'COM8',
                value : 'COM8',
            },{
                text : 'COM9',
                value : 'COM9',
            }]
        });
        this.select = new SelectBox({
            container : select,
            tabIndex : true,
            tabIndexKey : 32,
            select : {
                multi : false,
                callback : (index) => {
                    if(index === 0){
                        unLineDisabled();
                    }else if(index === 1){
                        lineDisabled();
                    }
                }
            },
            data : [{
                text : '网线',
                value : 'unLine'
            },{
                text : '串口',
                value : 'line'
            }],

        });
        this.baud = new SelectInput({
            container: baud,
            clickType: 0,
            readonly : true,
            tabIndex : true,
            data :  [{
                text: '2400',
                value: '2400',
            }, {
                text: '4800',
                value: '4800',
            },{
                text: '9600',
                value: '9600',
            },{
                text: '19200',
                value: '19200',
            },{
                text: '38400',
                value: '38400',
            },{
                text: '57600',
                value: '57600',
            },{
                text: '115200',
                value: '115200',
            }]
        });
        this.ip = new TextInput({
            container : ip,
        });
        this.port = new TextInput({
            container : port,
        });

        this.aerial = new NumInput({
            container : aerial,
            max : 9999,
            min : 1,
            tabIndex : true,
            defaultNum : 5,
        });
        this.buzz = new CheckBox({
            container : buzz,
            tabIndex : true,
            tabIndexKey : 32,
            text : '蜂鸣器'
        });
        this.led = new CheckBox({
            container : led,
            tabIndex : true,
            tabIndexKey : 32,
            text : 'LED灯'
        });
        let back = (result, msg) => {
            if(result.data){
                msg = result.msg + '：' + result.data[0];
            }
            content.appendChild(d.create(`<div class="r">${msg}</div>`));
            content.scrollTop = 100000;
        };
        this.reset = new Button({
            container : reset,
            content : '复位',
            tabIndex : true,
            size : 'small',
            tabIndexKey : 32,
            onClick : () => {
                let conf = this.getRfidPreConf(),
                    isFirst = true;
                Shell.rfid.config(conf.str, conf.num, {
                    power : this.aerial.get(),
                    buzzer : this.buzz.get() === 1,
                    led : this.led.get() === 1
                },function (result) {
                    back(result, result.success ? '天线功率、蜂鸣器和led配置成功' : '天线功率、蜂鸣器和led配置失败');
                    if(isFirst){
                        isFirst = false;
                        Shell.rfid.reset(conf.str, conf.num, function (result) {
                            back(result, result.success ? '重启读写器成功' : '重启读写器失败');
                        })
                    }
                });
            }
        });
        this.test = new Button({
            container : test,
            content : '开始测试',
            size : 'small',
            onClick : () => {
                end.classList.remove('disabled');
                test.classList.add('disabled');
                content.innerHTML = null;

                let conf = this.getRfidPreConf();

                Shell.rfid.start(conf.str, conf.num, (result) => {
                    back(result, result.success ? 'rfid开启成功' : 'rfid开启失败');
                });
            }
        });
        this.end = new Button({
            container : end,
            content : '结束测试',
            size : 'small',
            tabIndex : true,
            tabIndexKey : 32,
            onClick : () => {
                test.classList.remove('disabled');
                end.classList.add('disabled');
                content.innerHTML = '';
                Shell.rfid.stop(function (result) {
                    content.innerHTML = result && result.msg;
                })
            }
        });
        end.classList.add('disabled');

        this.select.set([rfidConf.line]);
        this.ip.set(rfidConf.ip);
        this.port.set(rfidConf.port);
        this.com.set(rfidConf.com);
        this.baud.set(rfidConf.baud);
        this.aerial.set(rfidConf.aerial);
        this.buzz.set(rfidConf.buzz);
        this.led.set(rfidConf.led);

        ipInput = q('.rfid-ip input');
        portInput = q('.rfid-port input');
        if(rfidConf.line === 0){
            unLineDisabled();
        }else {
            lineDisabled();
        }

        return this._rfidTpl;
    }

    private getRfidPreConf(){
        let line = this.select.get()[0],
            str = this.ip.get(),
            num = this.port.get(),
            power = this.aerial.get(),
            buzzer = this.buzz.get() === 1,
            led = this.led.get() === 1;

        if(line === 1){
            str = this.com.get();
            num = this.baud.get();
        }
        num = parseInt(num);
        return {str, num, power, buzzer, led}
    }

    private _printTpl : HTMLElement;
    private printTpl(){
        this._printTpl = d.create(`<div class="print-conf">
            <div class="conf-row">
                <div class="text">服务器(S)</div>
                <div class="print-server"></div>
            </div>
        
             <div class="conf-row">
                <div class="print-btn"></div>
                <div class="print-server-text"></div>
                <div class="print-msg" data-status="2">未测试</div>
            </div>
             <div class="conf-row">
                <div class="text">模式(M)</div>
                <div class="print-scenes"></div>
            </div>
            <div class="conf-row">
                <div class="text">打印机(P)</div>
                <div class="print-printer"></div>
            </div>
            <div class="conf-row">
                <div class="text">固定行数(F)</div>
                <div class="print-row"></div>
            </div>
            <div class="conf-row">
                <div class="print-check"></div>
            </div>
            <div class="conf-row">
                <div class="text">收银备注(N)</div>
                <div class="print-text"></div>      
            </div>
            <div class="conf-row">
                <div class="print-boot"></div>
                <div class="print-showdown"></div>
            </div> 
        </div>`);

        let q = (name) => {
            return d.query(name, this._printTpl);
        };
        let server = q('.print-server'),
            serverText = q('.print-server-text'),
            printer = q('.print-printer'),
            scenes = q('.print-scenes'),
            row = q('.print-row'),
            text = q('.print-text'),
            btn = q('.print-btn'),
            check = q('.print-check'),
            boot = q('.print-boot'),
            showdown = q('.print-showdown'),
            msgDom = q('.print-msg');

        let conf : IPrintConfPara = Com.local.getItem('printerConf');


        this.sever = new SelectInput({
            container : server,
            clickType : 0,
            tabIndex : true,
            readonly : true,
            useInputVal : false,
            data : [{
                text : '三福生产环境',
                value : 'https://pos.sanfu.com/',
            },{
                text : '三福开发环境',
                value : 'https://bwd.sanfu.com/',
            },{
                text : '三福测试环境',
                value : 'https://bwt.sanfu.com/',
            }],
            onSet : (data) => {
                this.serverText.set(data.value);
                this.checkLink();
            }
        });


        this.serverText = new TextInput({
            container : serverText
        });

        d.on(d.query('input', serverText), 'input',  () => {
            msgDom.dataset.status = '3';
        });


        this.btn = new Button({
            container : btn,
            content : '测试连接(T)',
            size : 'small',
            type : 'primary',
            className : 'link-test',
            onClick : () => {
                this.checkLink();
            }
        });
        this.scenes = new SelectInput({
            container : scenes,
            clickType : 0,
            tabIndex : true,
            readonly : true,
            useInputVal : false,
            data : [{
                text : '收银模式',
                value : 'cashier',
            },{
                text : '练习模式',
                value : 'practice',
            }]
        });

        this.row = new NumInput({
            container : row,
            defaultNum : 10,
            tabIndex : true,
            min : 0,
            max : 100,
        });

        this.text = new TextInput({
            container : text,
        });

        this.doubleCoupon = new CheckBox({
            container : check,
            tabIndex : true,
            tabIndexKey : 32,
            text : '为促销多打印一份收银条(D)'
        });

        this.boot = new CheckBox({
            container : boot,
            tabIndex : true,
            tabIndexKey : 32,
            text : '自动启动(B)',
        });
        this.showDown = new CheckBox({
            container : showdown,
            tabIndex : true,
            tabIndexKey : 32,
            text : '自动关机(O)',
        });

        let result = C.Shell.printer.get(), printData = [];
        result && result.data && result.data.driveList && result.data.driveList.forEach(d => {
            printData.push({
                text : d.driveName,
                value : d.driveCode,
            })
        });
        this.print = new SelectInput({
            container : printer,
            readonly : true,
            tabIndex : true,
            useInputVal : false,
            clickType : 0,
            data : printData
        });

        let str = window.localStorage.getItem('serverUrl');

        if(!str){
            window.localStorage.setItem('serverUrl', 'https://pos.sanfu.com/')
        }

        let serverUrl = window.localStorage.getItem('serverUrl');
        this.text.set(conf.text);
        this.doubleCoupon.set(conf.check);
        this.serverText.set(serverUrl);
        this.row.set(conf.row);
        this.scenes.set(conf.scenes);
        this.sever.set(serverUrl);  // 需要在scenes.set之后执行
        printData[0] && this.print.set(conf.printer);
        this.boot.set(conf.boot);
        this.showDown.set(conf.shutDown);

        return this._printTpl;
    }

    private checkLink(){
        let msgDom = d.query('.print-msg', this._printTpl),
            url = this.serverText.get() + 'cashier',
            scenes = this.scenes.get();
        msgDom.innerHTML = '测试中...';

        C.Ajax.fetch(url+ Com.url.config + '?setmode=' + scenes,{
            dataType : 'json',
        }).then(({response}) => {
            if(response && response.dataArr){
                msgDom.innerHTML = '连接成功！';
                msgDom.dataset.status = '0';
            }
        }).catch((e) => {
            // console.log(e);
            msgDom.dataset.status = '1';
            msgDom.innerHTML = '连接失败！'
        })

    }

    protected wrapperInit(): Node {
        this.tpl = d.create(`<div id="login">
            <div class="main-login">
                <div class="center-title">
                    <img src="img/logo.png" data-action="selectServer">
                        <span>速狮收银台</span>
                </div>
                <div class="center-log">正在等待收银员上岗</div>
                <div class="info">
                    <div class="status status_browser js_status normal">
                        <p>设备准备就绪，正在等待指纹录入</p>
                    </div>
                </div>
            </div>
            <div class="msg-login"></div>
        </div>`);
        this.tip = d.query('.status p', this.tpl);

        return this.tpl;
    }

    set title(title: string) {
        this._title = '登录';
    }

    get title() {
        return this._title;
    }

    afterClose = (hash:string) => {
        this.off();
    };
}