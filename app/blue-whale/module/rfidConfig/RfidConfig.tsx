/// <amd-module name="RfidConfig"/>
import {Button} from "../../../global/components/general/button/Button";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {NumInput} from "../../../global/components/form/numInput/numInput";
import {TextInput} from "../../../global/components/form/text/text";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import Shell = G.Shell;
interface IRfidConfPara{
    line : number,
    ip : string,
    port : number,
    com : string,
    baud : number,
    mode : number,
    buzz : boolean,
    led : boolean,
}
export class RfidConfig {
    // RFID设置
    private com : SelectInput;
    private select : SelectBox;
    private baud : SelectInput;
    private ip : TextInput;
    private port : TextInput;
    private mode : SelectInput;
    private buzz : CheckBox;
    private led : CheckBox;
    private reset : Button;
    private test : Button;
    private end: Button;
    private save: Button;
    private modal : Modal;
    constructor(){
        this.modal = new Modal({
            header : {
                title : 'RFID设置'
            },
            className : 'rfid-conf',
            body : this.rfidTpl(),
        })
    }

    private _rfidTpl : HTMLElement;
    private rfidTpl(){
        let q = (name) => {
            return d.query(name, this._rfidTpl);
        };

        let com, select, line, unLine, baud, ip, port, mode,
            buzz, led, content, reset, test, end, save,
            ipInput : HTMLElement,
            portInput : HTMLElement;
        this._rfidTpl = <div class="rfid-conf">
            <div class="rfid-row">
                <div class="row-left">
                    {select = <div className="rfid-select"> </div>}
                </div>
                <div class="row-right">
                    {line = <div className="rfid-row line">
                        <div className="text">ip</div>
                        {ip = <div className="rfid-ip"> </div>}
                        <div className="text text-port">端口</div>
                        {port = <div className="rfid-port"> </div>}
                    </div>}
                    {unLine = <div className="rfid-row unline">
                        <div className="text">串口</div>
                        {com = <div className="rfid-com"> </div>}
                        <div className="text text-baud">波特率</div>
                        {baud =  <div className="rfid-baud"> </div>}
                    </div>}
                </div>
            </div>
            <div class="rfid-row">
                <div class="text">工作模式</div>
                {mode = <div className="rfid-mode"> </div>}
                {buzz = <div className="rfid-buzz"> </div>}
                {led = <div className="rfid-led"> </div>}
            </div>
            {content = <div className="rfid-content"> </div>}
            <div class="rfid-row btn-group">
                {reset = <div className="btn-left reset"> </div>}
                {test = <div className="btn-center begin-test"> </div>}
                {end = <div className="btn-right end-test"> </div>}
                {save = <div className="btn-right save"> </div>}
            </div>
        </div>;



        let rfidConf : IRfidConfPara = JSON.parse(window.localStorage.getItem('rfidConf')),
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

        this.mode = new SelectInput({
            container : mode,
            clickType: 0,
            readonly : true,
            data : [{
                text : '命令',
                value : 1
            },{
                text : '自动',
                value : 2
            },{
                text : '触发',
                value : 3
            }]
        });
        this.buzz = new CheckBox({
            container : buzz,
            text : '蜂鸣器'
        });
        this.led = new CheckBox({
            container : led,
            text : 'LED灯'
        });
        let back = (result, msg) => {
            if(result.data){
                msg = result.msg + '：' + result.data[0];
            }
            content.appendChild(d.create(`<div class="r">${msg}</div>`));
            content.scrollTop = 10000000;
        };
        this.reset = new Button({
            container : reset,
            content : '复位',
            size : 'small',
            onClick : () => {
                let conf = this.getRfidPreConf(),
                    isFirst = true;
                Shell.rfid.config(conf.str, conf.num, {
                    mode : this.mode.get(),
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
        this.save = new Button({
            container : save,
            content : '保存',
            size : 'small',
            onClick : () => {
                window.localStorage.setItem('rfidConf',JSON.stringify({
                    line : this.select.getChecked()[0],
                    ip : this.ip.get(),
                    port : parseInt(this.port.get()),
                    com : this.com.get(),
                    baud : this.baud.get(),
                    mode : this.mode.get(),
                    buzz : this.buzz.get() === 1,
                    led : this.led.get() === 1,
                }));
                Modal.alert('保存成功');
            }
        });

        this.select.set([rfidConf.line]);
        this.ip.set(rfidConf.ip);
        this.port.set(rfidConf.port);
        this.com.set(rfidConf.com);
        this.baud.set(rfidConf.baud);
        this.mode.set(rfidConf.mode);
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
            mode = this.mode.get(),
            buzzer = this.buzz.get() === 1,
            led = this.led.get() === 1;

        if(line === 1){
            str = this.com.get();
            num = this.baud.get();
        }
        num = parseInt(num);
        return {str, num, mode, buzzer, led}
    }

    show(){
        this.modal.isShow = true;
    }

}