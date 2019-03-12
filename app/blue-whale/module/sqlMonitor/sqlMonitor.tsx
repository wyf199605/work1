/// <amd-module name="SqlMonitor"/>
import BasicPage from "../../pages/basicPage";
import d = G.d;
import {Button} from "../../../global/components/general/button/Button";
import {FormCom} from "../../../global/components/form/basic";
import {TextInput} from "../../../global/components/form/text/text";
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {User} from "../../../global/entity/User";

/**
 * 页面数据写死，sql数据通过websocket传给前端，前端索引sql页ID固定添加到sql页面
 */
export class SqlMonitor extends BasicPage{
    private container: HTMLElement;
    private btns : obj = {};//存放button节点
    private sqlUrl = {
        start : `${CONF.siteAppVerUrl}/monitor/log/start` + this.identification(),
        stop : `${CONF.siteAppVerUrl}/monitor/log/stop` + this.identification(),
    };
    private coms: objOf<FormCom> = {};//存放data-type节点
    constructor(private para){
        super(para);
        this.container = para.dom;
        this.initPage();
    }
    private initPage(){
        // let html:string,
        //     butHtml:string,
        //     inputHtml:string,
        //     content:string;
        // inputHtml =    `
        //                 <div data-name = "appid"  class="inputArea" ><span >APPID:</span></div>
        //                 <!--<div data-name = "appserver" class="inputArea"><span >服务器:</span></div>-->
        //                 <div data-name = "clientIp" class="inputArea" ><span >数据库:</span></div>
        //                 <div data-name = "clientUser" class="inputArea" ><span>用户工号:</span></div>
        //                 <div data-name = "deviceType"  class="inputArea" ><span >设备类型:</span></div>
        //                 <div data-name = "urlAddr" class="inputArea"><span>地址:</span></div>
        //
        //                 <div data-name = "uuid" class="inputArea"><span >MAC地址:</span></div>
        //                 <div data-name = "nodeId" class="inputArea"><span>节点:</span></div>
        //                 <div data-name = "monitorType" class="inputArea"><span>显示类型:</span></div>
        //                 <div data-name = "sqlType" class="inputArea"><span >SQL类型:</span></div>`
        // butHtml =  `<div data-name = "search" class="inputArea searchInp"><span >查找:</span></div>
        //             <div style="clear: both;"></div>
        //             <div data-name = "clearBut" class="clearBut" style="margin-right: 70px;"></div>
        //             <div data-name = "end" class="end"></div>
        //             <div data-name = "start" class="start"></div>
        //             `;
        // content = `<div id='sqlMonitorContent' class = 'content'></div>`;
        // html =  '<div class="sqlTop"><div class="sql-input">'+ inputHtml +'</div>' + butHtml + '</div>' + content;

        d.append(this.container, <div className="sqlTop">
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
        </div>);

        d.append(this.container, <div id='sqlMonitorContent' className='content'></div>);

        this.replaceType();

        this.btns['end'].wrapper.classList.add('disabled');
        let sqlMonitorContent = d.query('.content',this.container);
        let sqlTop = d.query('.sqlTop',this.container);
        let pageContainer = d.closest(this.container,'.page-container');
        let breadcrumb = d.query('.breadcrumb',pageContainer);
        sqlMonitorContent.style.marginTop = sqlTop.offsetHeight + breadcrumb.offsetHeight +  'px';
        pageContainer.style.backgroundColor = 'white';
        breadcrumb.style.position = 'fixed';
        breadcrumb.style.top = '40px';


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
                            let  clientUser = self.coms['clientUser'] as TextInput,
                                searchInp = d.query('.searchInp',self.container),
                                sqlInput = d.query('.sql-input', self.container);
                            // if(clientUser.get() === ""){
                            //     Modal.toast("请输入用户工号");
                            //     return;
                            // }
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
                            let searchInp = d.query('.searchInp',self.container),
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
                    this.coms['appid'].set(CONF.appid);
                    break;
                case 'appserver':
                    // ajaxLoad('/lookup/n1000_monitor-01/monitor-01','appserver', el);
                    break;
                case 'clientIp':
                    ajaxLoad('/lookup/n1000_monitor-01/monitor-02','clientIp', el);
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
            BwRule.Ajax.fetch(CONF.siteAppVerUrl + url, {
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
         BwRule.Ajax.fetch(this.sqlUrl.stop, {
                 defaultCallback: false,
             }
         );
     }
    private startSqlMonitor(){
        let appid = this.coms['appid'] as TextInput,
            // appserver = <SelectInput>this.coms['appserver'],
            clientIp = this.coms['clientIp'] as SelectInput,
            clientUser = this.coms['clientUser'] as TextInput,
            deviceType = this.coms['deviceType'] as SelectInput,
            uuid = this.coms['uuid'] as TextInput,
            urlAddr = this.coms['urlAddr'] as TextInput,
            nodeId = this.coms['nodeId'] as TextInput,
            monitorType = this.coms['monitorType'] as SelectInput,
            sqlType = this.coms['sqlType'] as SelectInput,
            data = {
                "application":appid.get(),
                // "appServer":appserver.get(),
                "dataSource":clientIp.get(),
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
            BwRule.Ajax.fetch(this.sqlUrl.start, {
                type: 'POST',
                defaultCallback: false,
                data: data
            });
    }
    static deviceType = [{value: 0,text:'--- ---'},{value:1,text:'Android'},{value:2,text:'IOS'},{value:3,text:'PC'}];

    private identification(){
        // return '';
        return '?identification=' + BwRule.getSqlRandom();
    }
}