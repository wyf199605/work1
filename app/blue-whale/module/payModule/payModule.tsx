///<amd-module name="PayModule"/>
/// <amd-dependency path="QRCode" name="QRCode"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import Rule = G.Rule;
import d = G.d;
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";

declare const QRCode;

export interface IPayModulePara{
    url: string; // 二维码地址
    fee?: string; // 金额
    orderQueryUrl?: string; // 请求订单是否成功的地址;
    timeout?: number; // 二维码超时时长
}

export class PayModule{
    protected fee: string;
    protected modal: Modal;
    protected wrapper: HTMLElement;
    constructor(protected para: IPayModulePara){
        this.fee = '￥' + Rule.parseNumber(parseFloat(para.fee), '###,###.##');

        this.modal = new Modal({
            header: '收款',
            isShow: true,
            width: tools.isMb ? void 0 : '350px',
            height: tools.isMb ? void 0 : '500px',
            className: 'pay-code-modal',
            onClose: () => {
                this.destroy();
            }
        });
        this.init(para);
    }

    protected overTimer: number;
    init(para: IPayModulePara){
        let overtime = para.timeout || 120,
            time: HTMLElement,
            qrCodeWrapper: HTMLElement;
        this.wrapper = <div className="pay-code-wrapper">
            <p className="pay-code-msg">扫一扫向我付钱</p>
            <p className="pay-code-msg pay-code-time">
                {time = <span className="time">{getTime(overtime)}</span>}
                后失效
            </p>
            {qrCodeWrapper = <div className="qrcode"/>}
            <p className="pay-code-msg">应收金额</p>
            <p className="pay-code-msg pay-code-fee">{this.fee}</p>
        </div>;
        new QRCode(qrCodeWrapper,{
            text: para.url,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        this.modal.body = this.wrapper;

        this.overTimer = setInterval(() => {
            overtime --;
            if(overtime === 0){
                this.setError('二维码已过期');
            }else{
                time.innerText = getTime(overtime);
            }
        }, 1000);

        let orderQueryUrl = para.orderQueryUrl;
        this.isOrderQuery = true;
        orderQueryUrl && this.orderQuery(orderQueryUrl);
    }

    protected setSuccess(){
        this.isOrderQuery = false;
        clearTimeout(this.orderQueryTime);
        clearInterval(this.overTimer);
        this.wrapper.innerHTML = '';
        d.append(this.wrapper, <div className="pay-statue pay-success">
            <div className="content">
                <div className="close-code">
                    <span className="iconfont icon-dagou"/>
                </div>
                <div className="msg">收款成功</div>
                <p className="pay-code-msg pay-code-fee">{this.fee}</p>
            </div>
        </div>)

    }

    protected setError(msg: string = '收款失败'){
        this.isOrderQuery = false;
        clearTimeout(this.orderQueryTime);
        clearInterval(this.overTimer);
        this.wrapper.innerHTML = '';
        d.append(this.wrapper, <div className="pay-statue pay-error">
            <div className="content">
                <div className="close-code">
                    <span className="iconfont icon-close"/>
                </div>
                <div className="msg">{msg}</div>

            </div>
            {/*<Button content="重新加载" onClick={() => {*/}
                {/*this.init(this.para);*/}
            {/*}} type="primary"/>*/}
        </div>)
    }

    protected isOrderQuery = true;
    protected orderQueryTime;
    orderQuery(url: string){
        new Promise((resolve, reject) => {
            G.Ajax.fetch(BW.CONF.siteUrl + url).then(({response}) => {
                console.log(response);
                response = JSON.parse(response);
                let errorCode = response.errorCode;
                if(errorCode === 0){
                    resolve();
                }else{
                    reject();
                }
            }).catch(() => reject());
        }).then(() => {
            this.setSuccess();
        }).catch(() => {
            if(this.isOrderQuery){
                this.orderQueryTime = setTimeout(() => {
                    this.orderQuery(url);
                }, PayModule.orderQueryTime)
            }
        })

    }

    destroy(){
        this.isOrderQuery = false;
        clearTimeout(this.orderQueryTime);
        clearInterval(this.overTimer);
        this.modal.destroy();
        this.modal = null;
        this.wrapper = null;
    }

    static orderQueryTime = 5000; // 轮询请求时间间隔
}
function getTime(overtime: number){
    return `${Math.floor(overtime / 60)}分${two(overtime % 60)}秒`;
}
function two(num: number){
    return num >= 10 ? num + '' : '0' + num;
}
