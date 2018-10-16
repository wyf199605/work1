///<amd-module name="MainPage"/>
import SPAPage = C.SPAPage;
import d = C.d;
import {Com} from "../../com";
import {eventActionHandler, inputs, mainKeyDownEvent} from "../../EvenAction";
import {ItemList} from "../../module/itemList/ItemList";
import Shell = C.Shell;

export class MainPage extends SPAPage{
    private p : ICashierPagePara;
    private handlerMain : (e) => void;
    private focusHandle : () => void;
    protected init(para: Primitive[], data : ICashierPagePara) {
        this.p = data;
        let container = d.query('.cash-content', this.wrapper),
            elem = this.p.elements || [];

        elem.forEach((obj: ICashierPanel) => {
            let uiTmpl = obj.uiTmpl,
                el: HTMLElement,
                panelId = obj.panelId,
                height = uiTmpl === 'sale-table' ? obj.height + '% - 10px' : obj.height + '%',
                dom = <div className={`${uiTmpl} align-center`} style={`height:calc(${height})`} data-name={panelId}></div>;

            container.appendChild(dom);

            if (uiTmpl === 'hot-key'){
                el = this.hotKeyInit();
            }else {
                if (uiTmpl === 'sale-header') {
                    el = this.initHeader();
                }
                this.initTable(obj, dom);
            }

            el && dom.appendChild(el);
            Com.data[panelId] = obj;
        });

        let keyData = {
            shortcuts : this.p.shortcuts,
            elements : this.p.elements
        };
        this.handlerMain = (e) => {
            if(Com.keyModal[0]){
                return;
            }
            eventActionHandler(keyData, e);
            mainKeyDownEvent(keyData, e);
        };


        let tagArr = [], timer;

        let element = null;
        keyData.elements.forEach(obj => {
            if(obj.inputType && obj.inputType.includes(Com.RFID)){
                element = obj;
            }
        });

        // 开启rfid
        let rfidConf : IRfidConfPara = Com.local.getItem('rfidConf'),
            str = rfidConf.ip,
            num = rfidConf.port;

        if(rfidConf.line){
            str = rfidConf.com;
            num = rfidConf.baud;
        }

        // console.log(str, num);
        Shell.rfid.start(str, num, (data) => {
            let modal = Com.keyModal[Com.keyModal.length - 1],
                value = data && data.data && data.data[0];
            if(modal || !value){
                return;
            }
            timer && clearTimeout(timer);
            timer = setTimeout(function () {
                tagArr = [];
            }, 1000);
            if (Com.keyFlag) {
                Com.keyFlag = false;
            } else {
                return;
            }
            if(!tagArr.includes(value)){
                tagArr.push(value);
                inputs(Com.RFID, element, value);
            }else {
                Com.keyFlag = true;
            }
        });

        this.focusHandle =  () => {
            Com.focusHandle();
        };

        this.on();
    }

    private initTable(panel : ICashierPanel, dom : HTMLElement){
        let uiTmpl = panel.uiTmpl, panelId = panel.panelId;
        Com.itemList[panelId] = {};
        panel.tabeList.forEach((table: TableListPara) => {
            // debugger;
            let itemId = table.itemId;
            Com.itemList[panelId][itemId] = new ItemList({
                dom: dom,
                data: panel,
                table: table,
                hasEvent: uiTmpl === 'sale-table',
            });
            if (uiTmpl === 'sale-table') {
                Com.mainItemList = Com.itemList[panelId][itemId];
            }
            if(uiTmpl === 'sale-count'){
                Com.countItemList = Com.itemList[panelId][itemId];
            }

            if (uiTmpl !== 'sale-header') {
                if (uiTmpl === 'sale-count') {
                    itemId = 'sale-count';
                }
                Com.clearItem[itemId] = Com.itemList[panelId][table.itemId];
            }

        });
    }

    on() {
        d.on(document.body, 'keydown', this.handlerMain);
        // 聚焦到当前模态框
        d.on(document.body, 'click', this.focusHandle)
    }

    off(){
        d.off(document.body, 'keydown', this.handlerMain);
        d.off(document.body, 'click', this.focusHandle);
    }

    beforeClose =  (page: SPAPage) => {
        this.off();
    };

    domReady = () => {
        // 禁用鼠标
        this.wrapper.onmousedown = function (e) {
            return false;
        };
    };


    /**
     * 按键图标面板
     */
    private hotKeyInit () {
        let shortcuts = this.p.shortcuts || [];
        let el = <div className="sale-navigation"><div className="sale-hotkey"></div></div>,
            saleHotKeyEl = d.query('.sale-hotkey', el);

        shortcuts.forEach(s =>
            d.append(saleHotKeyEl,
                <div><img height="50" src={"img/"+s.shortIcon+".png"} alt=""/><p>{s.shortKey + s.shortName}</p></div>));
        return el;
    }

    /**
     * 标题面板
     */
    initHeader(): HTMLElement {
        let tpl = <div>
            <div className="sale-title">
                <div className="sale-light">
                    <span class="online"><img src="img/onLine.png" width="35px" alt=""/>在线</span>
                    <span class="disconnect"><img src="img/disconnect.png" width="35px" alt=""/>断开</span>
                </div>
                <table className="table-container"></table>
                <span className="sale-time"></span>
            </div>
        </div>;

        this.onLineMonitor(tpl);
        let timeDom = d.query('.sale-time', tpl);
        let time = () => {
            timeDom.innerHTML = new Date().toLocaleString();
        };
        setInterval(time, 1000);
        time();
        return tpl;
    }

    /**
     * online or offline监听
     */
    private onLineMonitor(dom : HTMLElement){
        let light = d.query('.sale-light', dom),
            onLine = d.query('.online', light),
            disconnect = d.query('.disconnect', light),
            isOnLine = window.navigator.onLine;

        // d.classToggle(light, 'green', window.navigator.onLine);
        d.classToggle(onLine, 'hide', !isOnLine);
        d.classToggle(disconnect, 'hide', isOnLine);

        d.on(window, 'online', (r) => {
            disconnect.classList.add('hide');
            onLine.classList.remove('hide');
        });
        d.on(window, 'offline', (r) => {
            onLine.classList.add('hide');
            disconnect.classList.remove('hide');
        });
    }

    protected wrapperInit(): Node {
        return <div tabindex={C.tools.getGuid('')} id="container" style="height: 100%"  oncontextmenu="return false;"  oncopy="return false;" oncut="return false;" onselectstart="return false">
            <div className="cash-content"></div>
            <div className="sale-log">
                <span class="iconfont icon-xinxi"></span>
                <label className="reminder-msg"></label>
                <div class="log-loading"><span></span>
                    <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
            </div>
        </div>;
    }

    set title(title: string) {
        this._title = '主页';
    }

    get title() {
        return this._title;
    }


}