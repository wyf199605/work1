/// <amd-module name="RegPage"/>
import Shell = C.Shell;
import d = C.d;
import SPAPage = C.SPAPage;
import {Modal} from "../../global/components/feedback/modal/Modal";
import Ajax = C.Ajax;
import {Com} from "../../com";
import {Loading} from "../../global/components/ui/loading/loading";
import {SelectInput} from "../../global/components/form/selectInput/selectInput";
import {CashierRequest} from "../../request/CashierRequest";

export class RegPage extends SPAPage{
    private tpl : HTMLElement;
    private spinner : Loading;
    protected init(para : Primitive[], data : string){

    }

    set title(title: string) {
        this._title = '注册';
    }

    get title() {
        return this._title;
    }

    show(){
        this.tpl.classList.remove('hide');
    }

    hide(){
        this.tpl.classList.add('hide');
    }

    // private deviceCheck(msg?){
    //     this.wrapper.classList.add('disabled');
    //     new Modal({
    //         header : {
    //           title : '提示'
    //         },
    //         body : d.create(`<div class="font-size-16">${msg ? msg : '设备审核中'}</div>`),
    //         isBackground : false
    //     });
    //     let inputs = d.queryAll('.msg-device .input-row [type="text"]', this.wrapper);
    //     inputs.forEach(input => {
    //         input.setAttribute('readonly', '');
    //     })
    // }

    protected wrapperInit() : Node{
        let device = Shell.base.device,
            data = device && device.data;

        this.tpl = d.create(`<div class="content">
            <div class="reg-head">
                <h2 class="reg-title">注册设备</h2>
            </div>
            <div class="reg-content">
                <div class="msg-tip">
                    <h5>输入手机号码完成注册，请确保手机号码正确，方便我们有问题与您联系</h5>
                </div>
                <form class="msg-device" style="color: #777" >
                    <div class="input-row">
                        <label>店号</label>
                        <input type="text" data-name="sho_id" placeholder="请输入店号" maxlength="4">
                    </div>
                    <div class="input-row">
                        <label>款台号</label>
                        <div data-name="mac_id"></div>
                    </div>
                      <div class="input-row">
                        <label>电话号码</label>
                        <input type="text" data-name="mobile" placeholder="请输入联系人电话号码" maxlength="11">
                    </div>
                    <div class="input-row">
                        <label>CPU</label>
                        <input value="${data && data.cpu}" type="text" data-name="cpuserialno" readonly>
                    </div>
                    <div class="input-row">
                        <label>网卡</label>
                        <input value="${data && data.uuid}" type="text" data-name="adapteraddress" readonly>
                    </div>
                    <div class="input-row">
                        <label>硬盘</label>
                        <input value="${data && data.disk}" type="text" data-name="diskserialno" readonly>
                    </div>
                </form>
                <div class="reg-btn">
                    <button id="saveReg">注册</button>
                </div>
            </div>
        </div>`);

        let btn = d.query('#saveReg', this.tpl),
            inputs = d.queryAll('input[data-name]', this.tpl),
            macEl = d.query('[data-name="mac_id"]', this.tpl),
            sho_id, mac_id,
            mobile, macData = [],
            mac : SelectInput;

        CashierRequest({
            dataAddr : Com.url.macList,
        }).then(({response}) => {
            console.log(response);
            let data = response && response.req && response.req.dataList || [];
            data.forEach(obj => {
                macData.push({
                    text : obj[0],
                    value : obj[0],
                })
            });
            mac = new SelectInput({
                container : macEl,
                clickType: 0,
                readonly : true,
                tabIndex : true,
                data : macData
            });
        });


        let isOne = true;
        d.on(btn, 'click', () => {
            let p = {};
            inputs.forEach((i : HTMLInputElement) => {
                let name = i.dataset.name;
                switch (name){
                    case 'sho_id':
                        sho_id = i.value;
                        break;
                    case 'mobile':
                        mobile = i.value;
                        break;
                }

                p[name] = i.value;
            });
            mac_id = mac.getText();
            p['mac_id'] = mac_id;
            if(!isOne){
                return;
            }else {
                isOne = false;
            }

            if(!sho_id){
                let m = Modal.alert('店号不能为空');
                m.onClose = () => {
                    isOne = true
                };
                return;
            }
            if(!mac_id){
                let m = Modal.alert('款台号不能为空');
                m.onClose = () => {
                    isOne = true
                };
                return;
            }
            if(!mobile){
                let m = Modal.alert('电话号码不能为空');
                m.onClose = () => {
                    isOne = true
                };
                return;
            }

            if(!this.spinner){
                this.spinner = new Loading({});
            }else {
                this.spinner.show();
            }
            Ajax.fetch(Com.urlSite + Com.url.register,{
                type: 'get',
                dataType : 'json',
                headers : {
                    uuid : Com.geTuuid()
                },
                xhrFields: {
                    withCredentials: true
                },
                data : p
            }).then(({response}) => {
                this.spinner.hide();
                let data = response && response.data,
                    type = data && data.type,
                    showText = data && data.showText;

                switch (type){
                    case '1':
                        let m = Modal.alert(showText);
                        m.onClose = () => {
                            isOne = true
                        };
                        return;
                }

                if(data === '2'){
                    Modal.alert('注册失败,请联系IT人员处理');
                }else if(data === '1'){
                    Modal.alert(response && response.msg)
                }else if(data === '0'){
                    Modal.alert('注册成功', '提示', () => {
                        Com.scene();
                    })
                }
                isOne = true;
            }).catch((e) => {
                Modal.alert('请求超时或后台出错');
                this.spinner.hide();
                isOne = true;
            })
        });

        return this.tpl;
    };
}
