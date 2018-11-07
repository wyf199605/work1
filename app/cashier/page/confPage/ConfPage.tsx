///<amd-module name="LoginReg"/>
import SPAPage = C.SPAPage;
import Shell = C.Shell;
import {Modal} from "../../global/components/feedback/modal/Modal";
import {CashierRequest} from "../../request/CashierRequest";
import {Com} from "../../com";
import SPA = C.SPA;
import d = C.d;
import {OffLine} from "../../offLine/OffLine";

export class ConfPage extends SPAPage{
    private p: IMainPagePara;
    private printConf : IPrintConfPara;
    private rfidConf : IRfidConfPara;

    protected init(para : Primitive[], p : IMainPagePara){
        this.p = Object.assign({}, p);

        if(!Com.isShell){
            Modal.alert('未获取到设备信息，请使用速狮客户端登陆。');
            if(CA.Config.isProduct){
                  return;
            }
        }
        if(!CA.Config.isProduct){
            d.on(document, 'keydown', function (e) {
                if(e.key === 'F11'){
                    window.location.reload();
                }
            });
        }


        this.printConf  = {
            printer: 0,
            row: 0,
            text: '本单为退换凭据，退换货条款详见店堂公告',
            check: false,
            scenes : 'cashier',
            boot : false,
            shutDown : false
        };
        this.rfidConf = {
            line : 0,
            ip : '192.168.1.200',
            port : 100,
            com : 'COM1',
            baud : 115200,
            aerial : 5,
            buzz : false,
            led : false,
        };

        let rfidConf = Com.local.getItem('rfidConf'),
            conf = Com.local.getItem('printerConf');

        !rfidConf && Com.local.setItem('rfidConf',this.rfidConf);
        !conf && Com.local.setItem('printerConf', this.printConf);

        let cashierConf : IPrintConfPara =  Com.local.getItem('printerConf'),
            serverUrl = window.localStorage.getItem('serverUrl');

        Com.urlSite = serverUrl + 'cashier';

        this.getConfig(cashierConf.scenes)
            .then(() => {
                this.startAction();
            })
            .catch(() => {
                this.clearUrl();
        });
    }

    private startAction(){
        if(!window.navigator.onLine || !CA.Config.onLine){
            if(window.localStorage.getItem('hasOffLineData')){
                Com.scene().then(() => {
                    this.wrapper.classList.add('hide');
                });
            }else {
                Modal.alert('网络异常，首次登陆请确保网络连接正常,并保持登录一段时间下载离线数据!');
            }
            return;
        }
        CashierRequest({
            dataAddr : Com.url.registered,
            type : 'item',
            objId : Com.getConfigValue('pos_register')
        }).then(({response}) => {
            switch (response.req){
                case '0':  // 注册成功
                    if(!CA.Config.isProduct){
                        new OffLine().init();
                    }

                    Com.scene().then(() => {
                        this.wrapper.classList.add('hide');
                    });
                    break;
                case '1':  // 未注册
                    this.wrapper.classList.add('hide');
                    SPA.open(SPA.hashCreate('index', 'reg'), response.req);
                    break;
            }
        }).catch(() => {
            this.clearUrl();
        });
    }

    private clearUrl(){
        Modal.confirm({
            msg : '登录失败，是否清除服务器配置并回到启动页？',
            callback : (flag) => {
                if(flag){
                    window.localStorage.removeItem('serverUrl');
                    window.history.back();
                }
            }
        })
    }

    /**
     * 获取全局变量配置信息
     */
    private getConfig(scenes){

        return CashierRequest({
            dataAddr : Com.url.config + '?setmode=' + scenes,
            type : 'config'
        }).then(({response}) => {
            Com._config = response.dataArr;
            Com.local.setItem('config', response)
        })
    }

    protected wrapperInit() : Node{
        return <div class="main">
            <div className='text-loading'>页面跳转中...</div>
        </div>;
    }

    set title(title: string) {
        this._title = '配置页';
    }

    get title() {
        return this._title;
    }
}
