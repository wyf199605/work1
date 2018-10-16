/// <amd-module name="SqlMonitor"/>
import {Component} from "../global/components/Component";
import {BasicCom} from "../global/components/form/basic";
import {Modal} from "../global/components/feedback/modal/Modal";
import {Button} from "../global/components/general/button/Button";
import {TextInput} from "../global/components/form/text/text";
import {SelectInput} from "../global/components/form/selectInput/selectInput";
import d = C.d;
const site = 'https://bwt.sanfu.com/';
const sqlUrl = {
    open : site +'cashier/pos/posmonitor/log/posstart',
    stop : site + 'cashier/pos/posmonitor/log/posstop'
};
interface ISqlMonitorPara {
    container : HTMLElement
}
export class SqlMonitor extends Component{
    private btns : obj = {};//存放button节点
    private coms: objOf<BasicCom> = {};//存放data-type节点
    constructor(private para : ISqlMonitorPara){
        super(para);
        this.init();
    }

    init(){
        d.append(this.container, <div id='sqlMonitorContent' className='content'></div>);

        this.replaceType();

        this.btns['end'].wrapper.classList.add('disabled');
        let sqlMonitorContent = d.query('.content',this.container);

        let searchInp = d.query('.searchInp',this.container);
        let inputDom = d.query('input',searchInp);
        let searchFun = ()=>{
            let searchInp = this.coms['search'].get() as string;
            let curContent = sqlMonitorContent.innerText;
            let reg = new RegExp("(" + searchInp + ")", "g");
            if(curContent.indexOf(searchInp) === -1 || searchInp === ""){
                Modal.toast('没有查到相关数据');
                return false;
            }
            curContent = curContent.replace(/<span style="color:red;">([\s\S]*?)<\/span>/g, "$1");
            curContent = curContent.replace(reg, "<span style='color:red;'>$1</span>");
            curContent = curContent.replace(/([\n]+)/g,'</br></br>');
            curContent = curContent.slice(5, curContent.length);
            sqlMonitorContent.innerHTML = curContent;
        };
        d.on(inputDom,'keydown',(e : KeyboardEvent)=>{
            if(e.keyCode === 13){
                searchFun();
            }
        });
        let endBut = d.query('.end > .btn',this.container);
        endBut.classList.remove('disabled');
        endBut.click();
    }
    protected wrapperInit(){
        return <div className="sqlTop">
            <div className="sql-input">
                <div data-name="appid" className="inputArea"><span>APPID:</span></div>
                <div data-name="clientIp" className="inputArea"><span>数据库:</span></div>
                <div data-name="clientUser" className="inputArea"><span>用户工号:</span></div>
                <div data-name="deviceType" className="inputArea"><span>设备类型:</span></div>
                <div data-name="urlAddr" className="inputArea"><span>地址:</span></div>

                <div data-name="uuid" className="inputArea"><span>MAC地址:</span></div>
                <div data-name="nodeId" className="inputArea"><span>节点:</span></div>
                <div data-name="monitorType" className="inputArea"><span>显示类型:</span></div>
                <div data-name="sqlType" className="inputArea"><span>SQL类型:</span></div>
            </div>
            <div data-name="search" className="inputArea searchInp">
                <span>查找:</span></div>
            <div style="clear: both;"></div>
            <div data-name="clearBut" className="clearBut" style="margin-right: 70px;"></div>
            <div data-name="end" className="end"></div>
            <div data-name="start" className="start">
            </div>
        </div>;
    }
    private replaceType(){
        let self = this;
        d.queryAll('[data-name]',document.body).forEach(el => {
            switch (el.dataset.name) {
                case 'start':
                    this.btns['start'] = new Button({
                        container : el,
                        content : '开始',
                        type : 'primary',
                        onClick : function(e){
                            debugger;
                            let sqlInput = d.query('.sql-input', self.container);
                            self.startSqlMonitor();
                            sqlInput.classList.add('disabled');
                            // searchInp.classList.add('disabled');
                            self.btns['start'].wrapper.classList.add('disabled');
                            self.btns['end'].wrapper.classList.remove('disabled');
                        }
                    });
                    break;
                case 'end':
                    this.btns['end'] = new Button({
                        container : el,
                        content : '停止',
                        type : 'primary',
                        onClick : function(e){
                            let  searchInp = d.query('.searchInp',self.container),
                                sqlInput = d.query('.sql-input', self.container);
                            self.stopSqlMonitor();
                            sqlInput.classList.remove('disabled');
                            // searchInp.classList.remove('disabled');
                            self.btns['start'].wrapper.classList.remove('disabled');
                            self.btns['end'].wrapper.classList.add('disabled');
                        }
                    });
                    break;
                case 'clearBut':
                    this.btns['clearBut'] = new Button({
                        container : el,
                        content : '清空',
                        type : 'primary',
                        onClick : function(e){
                            let sqlMonitorContent = d.query('.content',self.container);
                            let pageContainer = d.closest(self.container,'.page-container');
                            sqlMonitorContent.innerHTML = "";
                            pageContainer.scrollTop = 0;
                        }
                    });
                    break;
                case 'search':
                    this.coms['search'] =  new TextInput({
                        container: el,
                        className: 'text',
                        placeholder: '请输入查找关键字'
                    });
                    break;
                case 'appid':
                    this.coms['appid'] =  new TextInput({
                        container: el,
                        className: 'text'
                    });
                    this.coms['appid'].set('pos');
                    break;
                case 'appserver':
                    // ajaxLoad('/lookup/n1000_monitor-01/monitor-01','appserver', el);
                    break;
                case 'clientIp':
                    // ajaxLoad('/lookup/n1000_monitor-01/monitor-02','clientIp', el);
                    break;
                case 'clientUser':
                    this.coms['clientUser'] =  new TextInput({
                        container: el,
                        // readonly : true,
                        className: 'text'
                    });
                    // this.coms['clientUser'].set(User.get().userid);
                    break;
                case 'deviceType':
                    this.coms['deviceType'] =  new SelectInput({
                        container: el,
                        readonly : true,
                        data: SqlMonitor.deviceType,
                        className: 'selectInput',
                        clickType: 0
                    });
                    this.coms['deviceType'].set(0);
                    break;
                case 'uuid':
                    this.coms['uuid'] =  new TextInput({
                        container: el,
                        className: 'text'
                    });
                    break;
                case 'nodeId':
                    this.coms['nodeId'] =  new TextInput({
                        container: el,
                        className: 'text'
                    });
                    break;
                case 'urlAddr':
                    this.coms['urlAddr'] =  new TextInput({
                        container: el,
                        placeholder : '可输入部分地址',
                        className: 'text'
                    });
                    break;
                case 'monitorType':
                    this.coms['monitorType'] =  new SelectInput({
                        container: el,
                        readonly : true,
                        data: [{value:2,text:'--- ---'},{value:0,text:'平台'},{value:1,text:'业务'}],
                        placeholder: '默认',
                        onSet: function (item, index) {

                        },
                        className: 'selectInput',
                        clickType: 0
                    });
                    this.coms['monitorType'].set(2);
                    break;
                case 'sqlType':
                    this.coms['sqlType'] =  new SelectInput({
                        container: el,
                        readonly : true,
                        data: [{value:0,text:'原始sql'},{value:1,text:'带参sql'}],
                        className: 'selectInput',
                        clickType: 0
                    });
                    this.coms['sqlType'].set(0);
                    break;
            }
        });
        function ajaxLoad(url:string, name : string, el : HTMLElement){
            C.Ajax.fetch( url, {
                type: 'POST'
            }).then(({response}) => {
                let data = [],
                    caption = response.meta[0];

                response.data.forEach(obj => {
                    if(!obj[caption]){
                        data.unshift({
                            value : '',
                            text : '--- ---'
                        })
                    }else {
                        data.push({
                            value : obj[caption],
                            text : obj[caption]
                        })
                    }
                });

                self.coms[name] =  new SelectInput({
                    container: el,
                    data: data,
                    readonly : true,
                    placeholder: '默认',
                    onSet: function (item, index) {
                        console.log(item)
                    },
                    className: 'selectInput',
                    clickType: 0
                });
                self.coms[name].set('');
            });
        }
    }


    private stopSqlMonitor(){
        C.Ajax.fetch(sqlUrl.stop);
    }
    private startSqlMonitor(){
        let appid = this.coms['appid'] as TextInput,
            // appserver = <SelectInput>this.coms['appserver'],
            // clientIp = this.coms['clientIp'] as SelectInput,
            clientUser = this.coms['clientUser'] as TextInput,
            deviceType = this.coms['deviceType'] as SelectInput,
            uuid = this.coms['uuid'] as TextInput,
            urlAddr = this.coms['urlAddr'] as TextInput,
            nodeId = this.coms['nodeId'] as TextInput,
            monitorType = this.coms['monitorType'] as SelectInput,
            sqlType = this.coms['sqlType'] as SelectInput,
            data = {
                "appId":appid.get(),
                // "appServer":appserver.get(),
                // "dataSource":clientIp.get(),
                "clientUser":clientUser.get(),
                "deviceType":SqlMonitor.deviceType[deviceType.get()].value === 0 ? '' : SqlMonitor.deviceType[deviceType.get()].text,
                "uuid":uuid.get(),
                "urlAddr":urlAddr.get(),
                "nodeId":nodeId.get(),
                "monitorType":monitorType.get()
            };
        if(sqlType.get()!==2){
            data["sqlType"] = sqlType.get()
        }
        for(let key in data){
            if(data[key] === ""){
                delete data[key];
            }
        }
       C.Ajax.fetch(sqlUrl.open, {
            type: 'POST',
            data: data
        });
    }
    static deviceType = [{value: 0,text:'--- ---'},{value:1,text:'Android'},{value:2,text:'IOS'},{value:3,text:'PC'}];

}