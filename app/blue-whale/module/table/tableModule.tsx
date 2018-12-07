/// <amd-module name="TableModule"/>
import {QueryModule} from 'module/query/queryModule';
import tools = G.tools;
import CONF = BW.CONF;
import sys = BW.sys;
import d = G.d;
import {Paging, PG_Reset} from "../../../global/components/ui/paging/paging";
import {BasicTable} from "../../../global/components/table/basicTable";
import {Modal} from "global/components/feedback/modal/Modal";
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import ChartBasic =  require("../statistic/chart");
import {Button} from "../../../global/components/general/button/Button";
import {QueryBuilder} from "../query/queryBuilder";
import {InputBox} from 'global/components/general/inputBox/InputBox';
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {TableEdit} from "./edit/TableEdit";
import {TableDataModule} from "./TableDataModule";
import {TableImgEdit} from "./edit/TableImgEdit";
import {ImgModal} from "../../../global/components/ui/img/img";
import {BwRule} from "../../common/rule/BwRule";

export abstract class TableModule {
    protected subTableData: TableModulePara;

    protected abstract initTable(btPara: BT_Para);

    // protected abstract initQuery(queryModule:typeof QueryModuleData, para : QueryModulePara);

    protected abstract handleSubTable: (subUrl, ajaxData, onShow, onClose) => void;

    protected abstract imgHtmlGet(url): string;

    protected abstract initWrapper(tableDom: HTMLTableElement);

    protected abstract onComplete();

    protected onLoad;

    public wrapper: HTMLElement = null;
    protected queryModule: QueryModule;

    public refresher: TableRefresher = null;

    // public statisticConfGet : (cols : string[], stats : {title : string, method : (nums : number[]) => number}[], col : string) => BT_Para;

    public table: BasicTable = null; // 主表
    public subTable: TableModule = null; // 从表
    public isSub = false; // 是否是从表
    public defaultData: obj = {};

    protected pageUrl:string = '';

    protected isDrill: boolean;

    // protected maxCellWidth = sys.isMb ? (document.body.offsetWidth > 600 ? 30 : 15) : 30;
    protected maxCellWidth = tools.isMb ? (document.body.offsetWidth > 600 ? 30 : 15) : 30;
    protected cols: R_Field[] = [];

    /**
     * 业务按钮集
     */
    public subBtn: InputBox;

    public tableData: TableDataModule = null;
    /**
     *
     * @param {TableModuleConf} tableConf
     * @param {TableModulePara} para
     */
    constructor(protected tableConf: TableModuleConf, protected para: TableModulePara) {
        let self = this,
            tableDom = tableConf.tableEl,
            ajaxUrl = (this.para.dataAddr ? CONF.siteUrl + BwRule.reqAddr(this.para.dataAddr) : null),
            subTableList = para.subTableList;

        // 初始化列
        this.colsInit();

        this.isSub = this.para.isSub;

        // this.tableData = new TableDataModule({
        //     tableModule: this,
        //     tableConf,
        //     para
        // });

        // 钻取
        this.isDrill = ['web', 'webdrill', 'drill'].indexOf(this.para.uiType) > -1;

        // 子表判断
        if(subTableList && subTableList[0]) {
            subTableList[0].isSub = true;
            this.subTableData = subTableList[0];
            this.subTableData.tableAddr = this.para.tableAddr;
        }

        // 初始化dom
        this.initWrapper(tableDom);

        if(!this.wrapper) {
            this.wrapper = tableDom.parentElement;
        }

        // 界面url
        this.pageUrl = (() => {
            if(tools.isMb){
                return location.href;
            } else{
                let pageContainer = d.closest(this.wrapper, '.page-container[data-src]');
                return pageContainer ? pageContainer.dataset.src : '';
            }
        })();

        this.tableData = new TableDataModule({
            tableModule : this,
            tableConf : tableConf,
            para :para,
            pageUrl : this.pageUrl
        });

        // debugger;
        let isQuery = para.querier && (para.querier.queryType === 3);

        // 交叉制表
        if (para.relateType === 'P') {
            if (isQuery) {
                self.refresher = function (newAjaxData, cb) {
                    self.initPivotTable(tableDom, para, newAjaxData, cb);
                };
            } else {
                self.initPivotTable(tableDom, para, null);
            }
        } else {
            let isAbsField = false;
            for(let i = 0;i < this.cols.length;i++){
                if(this.cols[i].subcols) {
                    isAbsField = true;
                    break;
                }
            }
            // 非交叉制表
            let btPara = {
                table: tableDom,
                cols: this.cols
            };

            // 抽象字段
            if(isAbsField) {
                btPara['multi'] = {
                    enabled: true,
                    cols: this.getMulitPara.getMulitCols(this.cols, false),
                };
                btPara.cols = this.getMulitPara.getColsIndex();
            }

            // 创建表格
            this.initTableModule(btPara, para, function(){
                self.onComplete();
            });

            onComplete();

            // 有查询器分页刷新方法
            self.refresher = (reqPara: obj, after:Function, before?:Function)=>{
                this.tableData.innerRefresher(reqPara, after, before);
            };
            // 查询器自动查询
            if(ajaxUrl && !isQuery) {
                let ajaxData = self.pagination.getParam(true);
                if(typeof tableConf.ajaxData === 'object') {
                    ajaxData = tools.obj.merge(ajaxData, tableConf.ajaxData );
                }
                setTimeout(() => {
                    this.tableData.innerRefresher(ajaxData, this.tableData.cbFun.getOuterAfter(), this.tableData.cbFun.getOuterBefore());
                })
            }
            // 默认设置空数据
            else{
                if(self.para.data) {
                    let data = self.para.data;
                    this.tableData.dealData(data,data.length);
                }
                else{
                    this.tableData.dealData([], 0);
                }
            }
        }

        function onComplete(){
            // TODO 判断是否开始异步查询

            self.initTableEvent.init(self.table);
            if(!self.para.isSub) {
                self.aggregate.get();
            }
        }

        if(isQuery){
            // 有查询器
            let queryModuleName = tools.isMb ? 'QueryModuleMb' : 'QueryModulePc';
            let modalWrapper = d.closest(this.wrapper, 'div.modal-wrapper');

            if(para.querier.autTag === 1) {
                modalWrapper && modalWrapper.classList.add('hide');
            }

            // 动态加载查询模块
            require([queryModuleName], Query => {

                this.queryModule = new Query({
                    qm: this.para.querier,
                    refresher: (ajaxData, after, before) => {
                        this.refresher(ajaxData, after, before);
                        modalWrapper && modalWrapper.classList.remove('hide');
                    },
                    cols: this.cols,
                    url: ajaxUrl,
                    container: d.closest(tableDom, '.page-container'),
                    tableGet: () => self.table
                });

                if(tools.isMb) {
                    //打开查询面板
                    d.on(d.query('body > header [data-action="showQuery"]'), 'click',  () => {
                        this.queryModule.show();
                    });
                }

                if(para.querier.autTag === 0) {
                    this.queryModule.hide();
                } else {
                    modalWrapper && modalWrapper.classList.add('hide');
                }
            });
        }
    }

    private colsInit() {
        let cols = this.para.cols;

        cols.forEach(col => {
            if(BwRule.NoShowFields.indexOf(col.name) > -1){
                col.noShow = true;
            }

            if(col.dataType === BwRule.DT_DATETIME && !col.displayFormat) {
                col.displayFormat = 'yyyy-MM-dd HH:mm:ss';
            }

            if(col.dataType === BwRule.DT_TIME && !col.displayFormat){
                col.displayFormat = 'HH:mm:ss';
            }
        });

        this.defaultData = BwRule.getDefaultByFields(cols);
        this.cols = cols.filter(col => !col.noShow);
    }

    // 聚合字段
    public aggregate = (() => {

        let aggrWrap: HTMLElement = null,
            aggrList = this.para.aggrList,
            urlData:obj = null;

        /**
         * 初始化
         * @return {boolean} - 初始成功或者失败
         */
        let init = () => {
            if(!Array.isArray(aggrList) || !aggrList[0]) {
                return false;
            }
            aggrWrap = (<div className="aggr-wrapper"></div>);
            d.before(this.table.wrapperGet(), aggrWrap);
            return true;
        };

        let get = (data? : obj) => {
            if(aggrWrap === null && !init()){
                return; // 初始化失败
            }

            if(data) {
                urlData = data
            }

            aggrWrap.innerHTML = '';
            aggrList.forEach(aggr => {
                let valSpan = <span>{aggr.caption}:</span>;
                d.append(aggrWrap, valSpan);

                BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(aggr.dataAddr, urlData))
                    .then(({response}) => {
                        let value = tools.keysVal(response, 'data', 0, tools.keysVal(response, 'meta', 0));
                        valSpan.innerHTML = `${aggr.caption}:${value || 0} &nbsp;&nbsp;`;
                    });
            });
        };

        return {get};
    })();

    private initTableModule(btPara,para,callback: Function){
        this.table = this.initTable(
            this.tableConfGet({
                tmPara: para,
                btPara: btPara
            })
        );
        callback();
    }

    protected tableConfGet(para : TableComConfGetPara) : BT_Para{
        let self = this,
            tmPara = para.tmPara,
            btPara = para.btPara;

        let tm2conf: BT_Para = {
            lockColNum: tmPara.fixedNum,
            // length: tmPara.pageLen,
            move: false,
            // indexCol: sys.isMb ? 'select': 'number',
            indexCol: 'number',
            indexColMulti: 'multiSelect' in tmPara ? tmPara.multiSelect : true,
            cols: btPara.cols || tmPara.cols
        };

        if('fixTop' in this.tableConf){
            tm2conf.lockRow = true;
            tm2conf.lockRowTop = this.tableConf.fixTop;
        }

        let basicConf: BT_Para = {
            sort: self.para.multPage === 1 ? 2 : 1,
            thead: true,
            Container : this.tableConf.scrollEl,
            colMenu: [{
                multi: true,
                title: '复制列',
                callback: (btn, cols) => {
                    sys && sys.window.copy(this.table.copy.col(cols[0].dataset.col, true));
                }
            }],
            rowMenu: [{
                multi: true,
                title: '复制行',
                callback: (btn, rows) => {
                    sys && sys.window.copy(this.table.copy.selectedRow(true));
                }
            }],
            textFormat: (trData, col:R_Field, index) => {
                let text:string,
                    tdDate = trData[col.name];

                if((col.dataType === BwRule.DT_IMAGE || col.dataType === BwRule.DT_SIGN) && col.link){

                    // 缩略图
                    text = self.imgHtmlGet(
                        tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(col.link, trData), this.tableData.getQueryPara()));
                } else if(col.name === 'STDCOLORVALUE'){

                    // 显示颜色
                    let {r, g, b} = tools.val2RGB(tdDate);
                    text = `<div style="background-color:rgb(${r},${g},${b});height: 100%;"></div>`;
                } else if(col.elementType === 'lookup'){

                    let options = this.tableData.lookUpData[col.name] || [];
                    for(let opt of options){
                        if(opt.value == tdDate){
                            text = opt.text;
                        }
                    }
                } else {

                    // 其他文字
                    text = BwRule.formatTableText(tdDate, col);
                }

                // 控制字符串最大长度
                let maxLen = this.maxCellWidth,
                    textType = '';

                if(!col.dataType){
                    textType = 'string';
                } else if(col.dataType === BwRule.DT_HTML){
                    textType = 'html';
                } else if (col.dataType === BwRule.DT_MULTI_TEXT) {
                    textType = 'multiText';
                }

                if (textType) {
                    let beforeText = text = tools.str.toEmpty(text);
                    text = tools.str.cut(text.toString(), maxLen);

                    if(beforeText !== text) {
                        text += `${tools.isMb ? '　　' : ''}<div class="more-text-button detail-more"  data-text-type="${textType}">...</div>`;
                    }
                }

                return text;
            },
            beforeShow: function (trData, colsData) {
                return self.dataFormat(para.tmPara, trData, colsData);
            }
        };
        if(!btPara.multi){
            basicConf.colMenu.push({
                multi: true,
                title: '锁定/解锁列',
                callback: (btn, cols) => {
                    this.table.colToggleLock(cols[0].dataset.col);
                }
            });
        }

        let pictureAddrList = self.para.pictureAddrList;
        if(Array.isArray(pictureAddrList) && this.para.cols.some(col => col.atrrs && col.atrrs.dataType == '20' && col.noShow)){
            basicConf.rowMenu.push({
                multi: false,
                title: '查看图片',
                callback: (btn, cols) => {
                    let bt = this.table,
                        selected = bt.trSelected[0];

                    if(!selected) {return;}

                    let index = parseInt(selected.dataset.index),
                        imgs = pictureAddrList.map((addr) => {
                            return CONF.siteUrl + BwRule.reqAddr(addr, bt.rowDataGet(index));
                        });

                    self.handleImg(imgs, index);
                }
            });

            basicConf.rowMenu.push({
                multi: true,
                title: '并列图片',
                callback: (btn, cols) => {
                    let imgs: string[] = [],
                        textArr:string[] = [],
                        bt = this.table,
                        selected = bt.trSelected,
                        addr = pictureAddrList && pictureAddrList[0];

                    if(!selected || !addr) {return;}
                    selected.forEach(tr => {
                        let index = parseInt(tr.dataset.index),
                            rowData = bt.rowDataGet(index);
                        imgs.push( CONF.siteUrl + BwRule.reqAddr(addr, rowData));
                        let pattern = rowData.PATTERN || '';
                        textArr.push(pattern);
                    });

                    ImgModal.show({
                        img: imgs,
                        isThumbnail: true,
                        textArr: textArr
                    })
                    // self.handleImg(imgs, index);
                }
            });
        }

        let paraConf:BT_Para = this.tableConf.tablePara ? this.tableConf.tablePara : {};

        if(Array.isArray(paraConf.rowMenu)){
            basicConf.rowMenu = basicConf.rowMenu.concat(paraConf.rowMenu);
            delete  paraConf.rowMenu;
        }

        if(Array.isArray(paraConf.colMenu)){
            basicConf.colMenu = basicConf.colMenu.concat(paraConf.colMenu);
            delete  paraConf.colMenu;
        }

        return tools.obj.merge(basicConf, paraConf, tm2conf, btPara);
    }

    protected dataFormat(tmPara: TableModulePara, trData: obj, cols: R_Field[]){
        let row = {tr: {}, td: []},
            isImg = tmPara.pictureAddrList && tmPara.pictureAddrList[0];

        // 从表
        if (tmPara.subTableList && tmPara.subTableList[0]) {
            // row.tr['data-sub-url'] = rule.reqAddr(this.subTableData.dataAddr, trData);
            row.tr['data-sub-url'] =  tmPara.subTableList[0].dataAddr.dataAddr;
        }

        // 行背景和文字变色
        ['GRIDBACKCOLOR', 'GRIDFORECOLOR'].forEach((name, i) => {
            let colorVal = trData[name];
            if(colorVal){
                // 显示颜色
                let {r, g, b} = tools.val2RGB(colorVal);
                row.tr['style'] = `${i === 0 ? 'background-color' : 'color'}:rgb(${r},${g},${b});`;
                if(i === 1){
                    row.tr['class'] = 'tr-color';
                }
            }
        });

        // 图片
        if (isImg && !this.cols.some(col => BwRule.DT_IMAGE === col.atrrs.dataType)) {
            row.tr['data-click-type'] = 'img';
        }
        let subBtns = this.para.subButtons,
            btnsLinkName = Array.isArray(subBtns) ? subBtns.map(btn => btn.linkName) : [];

        cols.forEach(function (col, index) {
            // 时间
            if(trData[col.name] && BwRule.isTime(col.dataType)){
                trData[col.name] = BwRule.strDateFormat(trData[col.name],col.displayFormat );
            }

            let classes = [],
                text = trData[col.name],
                attrs = {},
                colIsImg = col.dataType === BwRule.DT_IMAGE;

            // 样式处理
            if (typeof text === 'number') {
                classes.push('text-right');
            }

            if(colIsImg){
                classes.push('td-img');
            } else if(col.dataType === BwRule.DT_MULTI_TEXT){
                classes.push('td-multi-text');
            }

            if(col.drillAddr && col.drillAddr.dataAddr){
                let drillAddr = BwRule.drillAddr(col.drillAddr, trData, tmPara.keyField);
                if (drillAddr) {
                    attrs['data-href'] = drillAddr;
                    attrs['data-gps'] = col.drillAddr.needGps;
                    classes.push('blue');
                }
            }
            if(col.webDrillAddr && col.webDrillAddr.dataAddr){
                let webDrillAddr = BwRule.webDrillAddr(col.webDrillAddr, trData, tmPara.keyField);
                if (webDrillAddr) {
                    attrs['data-href'] = webDrillAddr;
                    attrs['data-gps'] = col.webDrillAddr.needGps;
                    classes.push('blue');
                }
            }
            if(col.webDrillAddrWithNull && col.webDrillAddrWithNull.dataAddr){
                let webDrillAddrWithNull = BwRule.webDrillAddrWithNull(col.webDrillAddrWithNull, trData, tmPara.keyField);
                if (webDrillAddrWithNull) {
                    attrs['data-href'] = webDrillAddrWithNull;
                    attrs['data-gps'] = col.webDrillAddrWithNull.needGps;
                    classes.push('blue');
                }
            }

            if (col.link && !colIsImg && (col.endField ? trData[col.endField] === 1 : true)) {
                let {addr, data} = BwRule.reqAddrFull(col.link, trData);
                if(!tools.isEmpty(data)){
                    attrs['data-href'] = tools.url.addObj(addr, data);
                    attrs['data-gps'] = col.link.needGps;
                    classes.push('blue');
                    switch (col.link.type){
                        case 'file':
                            attrs['data-href-type'] = 'file';
                            break;
                    }
                }
            }

            if(btnsLinkName.some(name => name === col.name)){
                attrs['data-click-type'] = 'btn';
                classes.push('blue');
            }

            if(classes[0]){
                attrs['class'] = classes.join(' ');
            }

            row.td.push(attrs);
        });
        return row;
    }

    /**
     * 初始化表格点击事件
     */
    public initTableEvent = (()=>{
        let self = this,
            pagesortparams = [],//当前表格排序信息
            sortMethod = {};//字段升降序缓存对象
        let init = (bt:BasicTable)=>{
            bt.clickEvent.add('td[data-href], td[data-click-type]', function (e) {

                if(this.dataset.hrefType === 'file'){
                    BwRule.link({
                        link: this.dataset.href,
                        dataType: BwRule.DT_FILE,
                        callback: function (act, data, allAct) {
                            sys && sys.window.download(data.DOWNADDR);
                        }
                    });
                } else if(this.dataset.clickType === 'btn') {
                    // linkName 快捷点击按键
                    let allBtn = self.subBtn.children || [],
                        colName = this.dataset.col;

                    self.table.rowSelect(this.parentElement);

                    for(let btn of allBtn){
                        let rBtn:R_Button = btn.data;
                        if(rBtn && rBtn.linkName && rBtn.linkName === colName) {
                            btn.onClick.call(btn, null);
                        }
                    }

                } else {
                    // 打开新窗口
                     sys && sys.window.open({
                        url : CONF.siteUrl + this.dataset.href,
                        gps: !!parseInt(this.dataset.gps)
                    }, self.pageUrl);
                }
                e.stopPropagation();

            });
            bt.clickEvent.add('tr td.td-img, tr[data-click-type]', function (e) {
                // 查看图片

                let isTd = this.tagName === 'TD',
                    index = parseInt(isTd ? this.parentElement.dataset.index :  this.dataset.index),
                    imgs = self.para.pictureAddrList.map( (addr) => {
                        return CONF.siteUrl + BwRule.reqAddr(addr, bt.rowDataGet(index));
                    });

                self.handleImg(imgs, index);

            });

            if(tools.isMb) {
                bt.clickEvent.add('td > .more-text-button', function (e) {
                    // 查看文字详情
                    let colName = d.closest(this, 'td').dataset.col,
                        rowIndex = parseInt(d.closest(this, 'tr').dataset.index),
                        fullText = self.table.rowDataGet(rowIndex)[colName];

                    Modal.alert(tools.str.removeHtmlTags(fullText));
                });
            }

            if(this.subTableData) {
                let subTableHandler = function (e) {
                    // 显示从表
                    let index = parseInt(this.dataset.index),
                        ajaxData = BwRule.varList(self.subTableData.dataAddr.varList, bt.rowDataGet(index)),
                        mtAjaxData: any = self.tableData.getQueryPara();

                    ajaxData = tools.obj.merge(mtAjaxData, ajaxData);

                    // 查询从表时不需要带上选项参数
                    delete ajaxData['queryoptionsparam'];

                    self.handleSubTable(this.dataset.subUrl, ajaxData, () => {
                        bt.rowSelect(this);
                    }, function () {
                        bt.rowDeselect(this);
                    });
                };

                bt.clickEvent.add('tr[data-sub-url]', subTableHandler);

                d.on(this.wrapper, 'editChange', function (e:CustomEvent) {
                    bt.clickEvent[e.detail.status === 1 ? 'remove' : 'add']('tr[data-sub-url]', subTableHandler);
                });
            }
            // TODO 之后换成事件
            if(this.para.multPage === 1) {
                //后台排序
                bt.clickEvent.add('thead th[data-col]',function(e:KeyboardEvent){
                    let getColByName = (name)=>{
                        let cols = self.para.cols;
                        for(let i = 0,l = cols.length;i < l; i++) {
                            if(cols[i].name === name){
                                return cols[i].dataType;
                            }
                        }
                    };
                    let dataType = getColByName(this.dataset.col);
                    if(BwRule.DT_IMAGE === dataType || BwRule.DT_HTML === dataType || BwRule.DT_MULTI_TEXT === dataType || BwRule.DT_FILE === dataType){
                        return ;
                    }
                    if (this.classList.contains('disabled') || bt.colResize.dragging || bt.moving) {
                        return;
                    }

                    let spinner = null,
                        colName = this.dataset.col;
                    if(tools.isMb){
                        spinner = new Spinner({
                            el : document.body,
                            type : Spinner.SHOW_TYPE.cover,
                            className: 'text-center'
                        });
                    }
                    spinner&&spinner.show();
                    self.pagination.setParam(1);
                    let queryPara = self.tableData.getQueryPara();

                    if(!sortMethod[colName]){
                        sortMethod[colName] = 'asc';
                    }
                    if(!(e.ctrlKey || e.shiftKey)){
                        let temp;
                        pagesortparams = [];
                        sortMethod[colName] && (temp = sortMethod[colName]);
                        sortMethod = {};
                        sortMethod[colName] = temp ? temp : 'asc';
                    }
                    else{
                        for(let i=0;i<pagesortparams.length;i++){
                            if(pagesortparams[i] === `${colName},${sortMethod[colName]}`){
                                pagesortparams.splice(i,1);
                            }
                        }
                    }
                    sortMethod[colName] = sortMethod[colName] === 'asc' ? 'desc' : 'asc';
                    pagesortparams.push(`${colName},${sortMethod[colName]}`);
                    queryPara['pagesortparams'] = JSON.stringify(pagesortparams);
                    //后台排序回到第一页，并加载第一页的排序数据
                    self.pagination.setParam(1);
                    self.tableData.refresh(queryPara, (response) => {
                        let totalNum = response.head.totalNum ? response.head.totalNum : response.data.length;
                        if(self.para.multPage !==0 && totalNum > self.pagination.pageLen) {
                            self.pagination.reset({
                                offset: 0,
                                recordTotal: response.head.totalNum ? response.head.totalNum : response.data.length
                            });
                        }
                        spinner&&spinner.hide();
                    });
                });
            }
            bt.clickEvent.on();
        };
        //获取当前排序字段信息
        let getPageSortParams = ()=>{
            return {"pagesortparams":JSON.stringify(pagesortparams)};
        };
        return {init, getPageSortParams};
    })();

    /**
     * 分页插件处理函数
     * @type {{reset: ((state: PG_Reset) => any); getParam: ((isDef?: boolean) => obj); getCurrentState: (() => {count: number; current: number; size: number; offset: number}); setParam: ((current) => any); isShow: ((response) => any); pageLen: number}}
     */
    public pagination = (() => {
        let page: Paging = null,
            param : obj = {},//当前的pageparams请求字段
            self = this,
            currentState = {count:1,current:0,size:50,offset:0},//缓存当前的分页信息
            pageLen = 50;//分页条大小
        param = getDefParam();

        function getDefParam(){
            return {
                pageparams : `{"index"=1 , "size"=${self.para.multPage===1 ? pageLen : 3000} ,"total"=1}`
            }
        }

        /**
         * 初始化分页插件
         * @param {PG_Reset} state
         */
        let init = (state: PG_Reset) => {
            let tableBottom = <div className="table-out-bottom"></div>,
                btTable = this.table,
                btWrap = btTable.wrapperGet();
            let scrollEl = this.tableConf.scrollEl;
            btWrap.appendChild(tableBottom);

            page = new Paging({
                el: tools.isMb ? this.para.isSub ? this.wrapper : btWrap : tableBottom,
                pageOption: tools.isMb ? null : [50, 200, 500],
                pageSize: pageLen,
                recordTotal: state.recordTotal,
                change: (state) => {
                    let {count, current, offset, size} = state;
                    if(!tools.isMb){//当点击分页的时候将表格滚动条调至最顶部
                        let pageContainer = this.tableConf.scrollEl as HTMLElement;
                        pageContainer && (pageContainer.scrollTop = 0);
                    }
                    if (self.para.multPage === 1) {
                        currentState = state;
                        setParam(current);
                        self.tableData.ajax(null,function (res) {
                            if(res) {
                                self.tableData.dealTable(res.data, !tools.isMb);
                                //后台分页时，每次点击重新设置前台查询的缓存数据
                                self.localSearch.setOriginData(self.table.data.get());
                            }
                            tools.isMb && page.reset({last: false});  // 加载完成
                            setTimeout(()=> {
                                self.onLoad && self.onLoad.getscrollBar() && self.onLoad.getscrollBar().updateStyle(); //更新锁尾滚动条状态
                            }, 0);
                        })
                    } else {
                        if(tools.isMb){
                            setTimeout(function(){
                                btTable.render((current - 1) * size, current * size,false);
                                tools.isMb && page.reset({last: false});  // 加载完成
                            }, 500);
                        }
                        else{
                            btTable.render((current - 1) * size, current * size);
                            setTimeout(()=> {
                                self.onLoad && self.onLoad.getscrollBar() && self.onLoad.getscrollBar().updateStyle(); //更新锁尾滚动条状态
                            }, 0);
                        }
                    }

                },
                scroll: tools.isMb ? {
                    Container: this.para.isSub ? this.wrapper : (scrollEl === window) ? null : scrollEl as HTMLElement,
                    auto: true,
                    content: '加载中...',
                    nomore : '已加载完全部数据'
                } : null
            });
            page.go(1);
        };
        /**
         * 设置当前分页请求字段pageparams
         * @param current
         */
        let setParam = (current) => {
            param = {
                pageparams : `{"index"=${current} , "size"=${self.para.multPage===1 ? currentState.size : 3000} ,"total"=1}`
            };
        };
        /**
         * 获取当前分页请求字段pageparams
         * @param {boolean} isDef
         * @returns {obj}
         */
        let getParam = (isDef = false) =>{
            if(isDef){
                param = getDefParam();
            }
            return param;
        };
        /**
         * 获取当前分页信息
         * @returns {{count: number; current: number; size: number; offset: number}}
         */
        let getCurrentState = () => {
            return currentState;
        };
        /**
         * 重置分页条状态
         * @param {PG_Reset} state
         */
        let reset = function(state: PG_Reset){
            //为空则第一次渲染分页条插件
            if(page === null){
                init(state);
            }
            //重新渲染插件信息
            else{
                page.reset(state);
            }
        };
        /**
         * 根据返回信息，判断当前分页条是否需要显示
         * @param response
         */
        let isShow = (response) =>{
            let data  = response.data ? response.data : response,
                totalNum;
            response.head &&  (totalNum = response.head.totalNum);
            let isShow = totalNum ?  totalNum > self.pagination.pageLen : data.length > self.pagination.pageLen;
            show(isShow)
        };

        let show = (flag:boolean) => {
            let pagingBottom = d.query('.table-out-bottom',this.wrapper);
            pagingBottom && (pagingBottom.style.display = flag ? 'block' : 'none');//当返回数据为空的时候不显示分页条

            tools.event.fire('pageToggle', {isShow: flag}, this.wrapper);

        };

        return {reset, getParam,getCurrentState,setParam,isShow,pageLen, show}
    })();

    lockBottom(isWake : boolean = false){
        if(!tools.isMb){
            let pageContainer = this.tableConf.scrollEl as HTMLElement;
            if(pageContainer.getBoundingClientRect().width !== 0){
                //将表格滚动条调至最顶部
                !isWake && pageContainer && (pageContainer.scrollTop = 0);
                this.onLoad.getscrollBar() && this.onLoad.getBottomPaging() ? this.onLoad.getscrollBar().updateStyle() : this.onLoad.init();
            }
            if(this.subTable){
                this.subTable.lockBottom(isWake)
            }
        }
    };

    private getMulitPara = (function(){
        let multiCols = [],titleArr = [],maxRow = 0,colsIndex = [];
        function dealData(data){
            function hasInMultiCols(title){
                for(let j=0;j<multiCols.length;j++){
                    for(let i=0;i<multiCols[j].length;i++){
                        if(multiCols[j][i].title === title){
                            return true;
                        }
                    }
                }
                return false;
            }
            if(data instanceof Array){
                for(let i=0;i<data.length;i++){
                    !hasInMultiCols(data[i]) && multiCols[i].push(
                        {
                            title:data[i].indexOf('|') > 0 ? data[i].split("|")[0] : data[i],
                            name:data[i].indexOf('|') > 0 ? data[i].split("|")[1] : null,
                            rowspan:parseInt(data[i].indexOf('|') > 0 ? data[i].split("|")[2] : 1),
                            parent:i===0?null:data[i-1]
                        });
                }
            }
        }
        function childenCounts(title){
            let i,j,count = 0;
            for(i=0;i<multiCols.length;i++){
                for(j=0;j<multiCols[i].length;j++){
                    if(multiCols[i][j].parent === title){
                        count++;
                    }
                }
            }
            return count === 0 ? 1 : count;
        }
        let getMulitCols = (cols,isAcross:boolean)=>{
            colsIndex = [],multiCols = [],titleArr = [];//重新初始化
            if(!isAcross){
                let cache = cols;
                cols = [];
                for(let i = 0,len1 = cache.length;i < len1;i++){
                    if(cache[i].subcols){
                        for(let j = 0,len2 = cache[i].subcols.length;j < len2;j++){
                            cols.push({name:cache[i].subcols[j].name,title:`${cache[i].title}.${cache[i].subcols[j].caption}`});
                        }
                    }
                    else{
                        cols.push({name:cache[i].name,title:cache[i].title});
                    }
                }
            }

            let i,j;
            function dealCols(fn){
                for(i = 0;i < cols.length;i++) {
                    fn(cols[i],i);
                }
            }
            function dealTitleArr(fn){
                for(i = 0;i < titleArr.length;i++) {
                    fn(titleArr[i]);
                }
            }
            function dealMultiCols(fn){
                for(i=0;i<multiCols.length;i++) {
                    for (j = 0; j < multiCols[i].length; j++) {
                        fn(multiCols[i][j]);
                    }
                }
            }
            dealCols(function(para,i){
                titleArr[i] = para.title.split('.');
                titleArr[i][titleArr[i].length-1] += `|${para.name}`;
                colsIndex.push(para);
            });
            dealTitleArr(function (para) {
                if(maxRow < para.length){
                    maxRow = para.length
                }
            });
            dealCols(function (para,i) {
                let tempArr = para.title.split('.');
                titleArr[i][titleArr[i].length-1] += `|${maxRow-(tempArr.length-1)}`;
            });
            for(i = 0;i < maxRow;i++){
                multiCols[i] = [];
            }
            dealTitleArr(function (para) {
                dealData(para);
            });
            dealMultiCols(function (para) {
                para['colspan'] = childenCounts(para.title);
            });
            dealMultiCols(function (para) {
                delete para.parent;
            });

            return multiCols;
        };
        let getColsIndex = ()=>{
            return   colsIndex;
        };
        return {getMulitCols, getColsIndex}
    })();

    protected initPivotTable(tableDom, tableConf : TableModulePara, ajaxData = {}, cb?:Function) {
        let isFirst = tableDom.classList.contains('mobileTable');
        //设置初始分页条件
        this.localSearch.getOriginMultPage() !== null &&
        (this.para.multPage = this.localSearch.getOriginMultPage());
        this.tableData.ajax(ajaxData,(response) =>{
            cb && cb(response);
            if(!response){
                return;
            }
            let responseData = response.data,
                newTableData = BwRule.getCrossTableCols(response.meta, tableConf.cols);

            let tempCount = [],tempCols = [];
            for(let i = 0;i < newTableData.cols.length;i++){
                let col = newTableData.cols[i];
                if(((col.title.indexOf('.') > -1) && (col.name.indexOf('小计') > -1)) || col.title.indexOf('.') === -1) {
                    tempCount.push(newTableData.cols[i]);
                }
                else{
                    tempCols.push(newTableData.cols[i]);
                }
            }
            newTableData.cols = tempCount.concat(tempCols);
            // tableConf.cols = newTableData.cols;
            tableConf.fixedNum = newTableData.lockNum >= 2 ? 2 : newTableData.lockNum;
            tableDom.classList.add('min-width');

            let btPara:BT_Para = {
                table : tableDom,
                multi : {
                    enabled:true,
                    cols:this.getMulitPara.getMulitCols(newTableData.cols, true),
                },
                cols:this.getMulitPara.getColsIndex()
            };
            this.initTableModule(btPara,tableConf,()=>{
                isFirst && this.onComplete();
                this.initTableEvent.init(this.table);
            });

            this.tableData.dealTable(responseData,true);

            let totalNum = response.head.totalNum ? response.head.totalNum : response.data.length;
            if(this.para.multPage !==0 && totalNum > this.pagination.pageLen) {
                this.pagination.reset({
                    offset: 0,
                    recordTotal: totalNum
                });
            }
            this.lockBottom();
            // mt.attr('ajax', this.tableCommonAjax(url));
            this.refresher = (ajaxData, after:Function, before?:Function)=> {
                this.table.destroy();
                let newTable = <table></table>;
                this.wrapper.appendChild(newTable);
                this.initPivotTable(newTable,tableConf,ajaxData,after);
            };
            //设置前台查询缓存数据
            this.localSearch.setOriginMultPage(this.para.multPage);
            this.localSearch.setOriginData(this.table.data.get());
        });
    }

    public localSearch = ((self) => {
        let originData: obj[] = null;
        let originMultPage: number = null;
        let start = (conditions: QueryParam[]) => {
            let cacheData = originData,
                resultData = [];
            getFirstData();
            //获取满足第一个查询的所有值
            function getFirstData(){
                for(let i = 0,l = cacheData.length;i < l;i++){
                    let val = cacheData[i][conditions[0].field];
                    if(conditions[0].not){ //如果为not
                        if(!queryOp(val,conditions[0])){ //不符合后面条件的加入结果集
                            resultData.push(cacheData[i]);
                        }
                    }
                    else{ //如果为非not
                        if(queryOp(val,conditions[0])){ //符合后面条件的加入结果集
                            resultData.push(cacheData[i]);
                        }
                    }
                }
            }
            //过滤获取到的第一个查询结果
            function doFilter(filterPara : QueryParam){
                for(let i = 0;i < resultData.length;i++){
                    let val = resultData[i][filterPara.field];
                    if(filterPara.not){ //如果为not
                        if(queryOp(val,filterPara)){ //不符合后面条件的则为满足过滤条件
                            resultData.splice(i,1);
                            i--;
                        }
                    }
                    else{ //如果为非not
                        if(!queryOp(val,filterPara)){ //符合后面条件的则为满足过滤条件
                            resultData.splice(i,1);
                            i--;
                        }
                    }
                }
            }
            //运算符运算结果 true满足条件  false 不满足条件
            function queryOp(val :any,condition : QueryParam){
                switch(condition.op)
                {
                    case 2: //等于
                        if(val == condition.values[0]){
                            return true;
                        }
                        break;
                    case 3://大于
                        if(val > condition.values[0]){
                            return true;
                        }
                        break;
                    case 4://大于等于
                        if(val >= condition.values[0]){
                            return true;
                        }
                        break;
                    case 5://小于
                        if(val < condition.values[0]){
                            return true;
                        }
                        break;
                    case 6://小于等于
                        if(val <= condition.values[0]){
                            return true;
                        }
                        break;
                    case 7://介于 between
                        if(val >= condition.values[0] && val <= condition.values[1]){
                            return true;
                        }
                        break;
                    case 9://包含 like
                        if((typeof val === "string") && (val.indexOf(condition.values[0]) > -1)){
                            return true;
                        }
                        break;
                    case 10://为空 isnull
                        if(!val && val!==0){
                            return true;
                        }
                        break;
                }
                return false;
            }
            for(let i = 1,l = conditions.length;i < l;i++){ //从第二项开始过滤resultData
                doFilter(conditions[i]);
            }
            return resultData;
        };

        let showOriginTable = () => {
            self.para.multPage = originMultPage;
            self.tableData.dealTable(originData,true);
            if(originMultPage !== 0 && originData.length > self.pagination.pageLen) {
                self.pagination.reset({
                    offset: 0,
                    recordTotal: originData.length
                });
            }
            self.pagination.isShow(originData);
        };
        let builder:QueryBuilder = null;

        let search = () => {
            let searchData = builder.dataGet();
            if(searchData && searchData.params){
                let result = start(searchData.params);
                this.para.multPage = 2;
                this.pagination.setParam(1);
                this.tableData.dealTable(result, true);
                if(originMultPage !==0 && result.length > this.pagination.pageLen) {
                    this.pagination.reset({
                        offset: 0,
                        recordTotal: result.length
                    });
                }
                this.pagination.isShow(result);
            }
        };

        let show = (() => {

            let modal:Modal = null;

            let searchHandler = () => {
                search();
                modal.isShow = false;
            };

            let init = () => {
                if(builder === null) {
                    let body = tools.isMb ?
                        <div className="mui-content">
                            <ul className="mui-table-view" data-query-name="local"></ul>
                            <div data-action="add" data-name="local" className="mui-btn mui-btn-block mui-btn-primary">
                                <span className="mui-icon mui-icon-plusempty"></span> 添加条件
                            </div>
                        </div>
                        :
                        <form className="filter-form" data-query-name="local">
                            <span data-action="add" className="iconfont blue icon-jiahao"></span>
                        </form>;

                    modal = new Modal({
                        container: d.closest(this.wrapper, '.page-container'),
                        header: '本地过滤',
                        body: body,
                        position: tools.isMb ? 'full' : '',
                        width: '730px',
                        className: 'local queryBuilder'
                    });
                    modal.className = '';
                    modal.className = '';

                    if(tools.isMb){

                        modal.modalHeader.rightPanel = (()=>{
                            let rightInputBox = new InputBox(),
                                clearBtn = new Button({
                                    content: '清除',
                                    onClick: () => {
                                        showOriginTable();
                                        modal.isShow = false;
                                    }
                                }),
                                saveBtn = new Button({
                                    icon: 'sousuo',
                                    onClick:searchHandler
                                });
                            rightInputBox.addItem(clearBtn);
                            rightInputBox.addItem(saveBtn);
                            return rightInputBox;
                        })();

                        mui(body).on('tap', '[data-action="add"]', function () {
                            builder.rowAdd();

                            let ul = (this as HTMLElement).previousElementSibling;
                            ul.scrollTop = ul.scrollHeight;

                        });
                    } else {

                        modal.footer = {
                            rightPanel: (() => {
                                let rightBox = new InputBox();
                                rightBox.addItem(new Button({
                                    content: '取消',
                                    type: 'default',
                                    key: 'cancelBtn'
                                }));
                                rightBox.addItem(new Button({
                                    content: '清除',
                                    type: 'default',
                                    key: 'clearBtn',
                                    onClick: () => {
                                        showOriginTable();
                                        modal.isShow = false;
                                    }
                                }));
                                rightBox.addItem(new Button({
                                    content: '查询',
                                    type: 'primary',
                                    onClick: searchHandler,
                                    key: 'queryBtn'
                                }));

                                return rightBox;
                            })()
                        }
                    }

                    builder = new QueryBuilder({
                        queryConfigs: initQueryConfigs(this.cols), // 查询字段名、值等一些配置，后台数据直接传入
                        resultDom: tools.isMb ? d.query('ul.mui-table-view', body) : body, // 查询条件容器
                        setting: null  // 默认值
                    });

                }

                function initQueryConfigs(cols: R_Field[]): QueryConf[] {
                    return cols.map(col => {
                        return {
                            caption: col.title,
                            field_name: col.name,
                            dynamic: 0,
                            link: '',
                            type: '',
                            atrrs: col.atrrs
                        }
                    });
                }
            };

            return () => {
                init();
                modal.isShow = true;
            }
        })();
        let setOriginData = (newData: obj[])=>{
            originData = newData;
        };
        let setOriginMultPage = (multPage: number)=>{
            originMultPage = multPage;
        };

        let getOriginMultPage = ()=>{
            return originMultPage;
        };

        let queryDataGet = ():QueryParam => {
            return builder ? builder.dataGet() : null;
        };
        return {show, search,queryDataGet, setOriginData,setOriginMultPage,getOriginMultPage}
    })(this);

    /**
     * 统计公共方法
     * @type {{initStatistic: ((target) => boolean); initChart: ((target) => boolean); initCrosstab: ((target) => boolean); initAnalysis: ((target) => boolean)}}
     */
    protected statistic = (()=>{
        let chart = null, crosstab = null, analysis = null, statistic = null,count = null;
        let hasStatistic = () => {
            for (let i = 0; i < this.cols.length; i++) {
                if (BwRule.isNumber(this.cols[i].dataType)) {
                    return true;
                }
            }
            return false;
        };
        let initStatistic =(target? :HTMLElement)=>{
            if(!hasStatistic()){
                Modal.alert('无可统计字段');
                return false;
            }
            let init = ()=>{
                let temp = new statistic({
                    container: d.closest(this.wrapper, 'div.page-container'),
                    cols: this.cols as R_Field[],
                    colDataGet: (index) => {
                        return this.table.colDataGet(index);
                    },
                    paraGet: () => {
                        let tempResult = this.tableConfGet({
                            tmPara: this.para,
                            btPara: {}
                        });
                        delete tempResult.cellMaxWidth;
                        delete tempResult.onComplete;
                        return tempResult;
                    },
                    getVisibleCol : ()=>{
                        return this.table.getVisibleCol();
                    }
                });
                temp.getModal().isShow = true;
            };
            if (!statistic && hasStatistic()) {
                let sp = null;
                target  && (sp = new Spinner({
                    el : target,
                    size : 14,
                    type  : Spinner.SHOW_TYPE.replace,
                }));
                sp && sp.show();
                require(['StatisticBasic'], (Statistic) => {
                    statistic = Statistic;
                    init();
                    sp && sp.hide();
                });
            } else {
                init();
            }
        };
        let initChart = (target? :HTMLElement) => {
            if(!hasStatistic()){
                Modal.alert('无可统计字段');
                return false;
            }
            let init = ()=>{
                let temp = new chart({
                    container: d.closest(this.wrapper, 'div.page-container'),
                    cols: this.cols as R_Field[],
                    allData: () => {
                        return this.table.data.get()
                    },
                    selectedData: () => {
                        return this.table.rowSelectDataGet();
                    },
                    colDataGet: (index) => {
                        return this.table.colDataGet(index);
                    },
                    getTablePara : () =>{
                        return this.para;
                    },
                    getWrapper : ()=>{
                        return this.wrapper;
                    },
                    getVisibleCol : ()=>{
                        return this.table.getVisibleCol();
                    }
                });
                temp.getModal().isShow = true;
            };
            if (!chart && hasStatistic()) {
                let sp = null;
                target && (sp= new Spinner({
                    el : target,
                    size : 14,
                    type  : Spinner.SHOW_TYPE.replace,
                }));
                sp && sp.show();
                require(['ChartBasic'], (Chart : typeof ChartBasic) => {
                    chart = Chart;
                    init();
                    sp && sp.hide();
                });
            }
            else{
                init();
            }
        };
        let initCrosstab = (target? :HTMLElement) => {
            if(!hasStatistic()){
                Modal.alert('无可统计字段');
                return false;
            }
            let init = ()=>{
                let temp = new crosstab({
                    container: d.closest(this.wrapper, 'div.page-container'),
                    cols: this.cols as R_Field[],
                    allData: () => {
                        return this.table.data.get()
                    },
                    selectedData: () => {
                        return this.table.rowSelectDataGet();
                    },
                    paraGet: () => {
                        let tempResult = this.tableConfGet({
                            tmPara: this.para,
                            btPara: {}
                        });
                        delete tempResult.cellMaxWidth;
                        delete tempResult.onComplete;
                        return tempResult;
                    },
                    getVisibleCol : ()=>{
                        return this.table.getVisibleCol();
                    }
                });
                temp.getModal().isShow = true;
            };
            if (!crosstab && hasStatistic()) {
                let sp = null;
                target && (sp = new Spinner({
                    el : target,
                    size : 14,
                    type  : Spinner.SHOW_TYPE.replace,
                }));
                sp && sp.show();
                require(['CrossTabBasic'], (CrossTab) => {
                    crosstab =  CrossTab;
                    init();
                    sp && sp.hide();
                });
            }
            else{
                init();
            }
        };
        let initAnalysis = (target? :HTMLElement) => {
            if(!hasStatistic()){
                Modal.alert('无可统计字段');
                return false;
            }
            let init = ()=>{
                let temp = new analysis({
                    container: d.closest(this.wrapper, 'div.page-container'),
                    cols: this.cols ,
                    allData: () => {
                        return this.table.data.get()
                    },
                    selectedData: () => {
                        return this.table.rowSelectDataGet();
                    },
                    paraGet: () => {
                        let tempResult = this.tableConfGet({
                            tmPara: this.para,
                            btPara: {}
                        });
                        delete tempResult.cellMaxWidth;
                        delete tempResult.onComplete;
                        return tempResult;
                    },
                    getVisibleCol : ()=>{
                        return this.table.getVisibleCol();
                    }
                });
                temp.getModal().isShow = true;
            };
            if (!analysis && hasStatistic()) {
                let sp = null;
                target && (sp = new Spinner({
                    el : target,
                    size : 14,
                    type  : Spinner.SHOW_TYPE.replace,
                }));
                sp && sp.show();
                require(['AnalysisBasic'], (Analysis) => {
                    analysis = Analysis;
                    init();
                    sp && sp.hide();
                });
            }
            else{
                init();
            }
        };
        let initCount = (target?: HTMLElement) => {
            let init = ()=>{
                let temp = new count({
                    container: d.closest(this.wrapper, 'div.page-container'),
                    cols: this.cols,
                    colDataGet : (colName)=> this.table.colDataGet(colName),
                    getVisibleCol : ()=>{
                        return this.table.getVisibleCol();
                    }
                });
                temp.getModal().isShow = true;
            };
            if (!count) {
                require(['Count'], (Count) => {
                    count = Count;
                    init();
                });
            }
            else{
                init();
            }
        };
        return{initStatistic,initChart,initCrosstab,initAnalysis,initCount}
    })();

    /**
     * 钻取表格图形统计
     * @type {{init: ((wrapper: HTMLElement) => any); getChartBut: (() => any); getTableBut: (() => any)}}
     */
    protected initDrillBut = (function(self){
        let tempBut = null,chartBut = null,tableBut = null;
        let init = (wrapper : HTMLElement)=>{
            tempBut = <div></div>;
            chartBut = <div></div>;
            tableBut = <div></div>;
            chartBut.style.display = 'inline-block';
            tableBut.style.display = 'none';
            let but = new Button({
                container: chartBut,
                icon:'bingzhuangtu',
                size:'large',
                type:'text',
                onClick : (e)=>{
                    self.statistic.initChart(chartBut);
                }
            });
            new Button({
                container: tableBut,
                size:'large',
                icon:'biaoge',
                type:'text',
                onClick : (e)=>{
                    let hasChart = d.query('.Echart_body', wrapper);
                    if (hasChart) {
                        hasChart.style.display = 'none';
                    }
                    let child = d.query('.mobileTableWrapper', wrapper);
                    child.style.display = 'block';
                    tableBut.style.display = 'none';
                }
            });
            tempBut.classList.add('statisticsChart');
            tempBut.appendChild(chartBut);
            tempBut.appendChild(tableBut);
            let par = d.closest(wrapper,'li');
            d.append(tools.isMb ? par.firstElementChild : wrapper.parentElement, tempBut);
        };
        let getChartBut = function(){
            return chartBut;
        };
        let getTableBut = function(){
            return tableBut;
        };
        return {init,getChartBut,getTableBut}
    })(this);

    public autoSubTable() {
        if(!this.para.isSub && this.subTableData ){
            let firstTr = d.query('table tbody tr', this.table.wrapperGet());
            if(firstTr){
                firstTr.click();
                if(this.subTable){
                    this.subTable.wrapper.classList.remove('hide')
                }
            }else if(this.subTable){
                this.subTable.wrapper.classList.add('hide')
            }
        }
    }

    /**
     * 初始化构造业务按钮组
     */
    protected initSubBtns(wrapper: HTMLElement) {
        let self = this,
            table = this.table,
            btnsData: R_Button[] = self.para.subButtons;

        // btnsData[0].multiselect = 2;
        // btnsData[0].selectionFlag = 1;

        self.subBtn = new InputBox({
            container: wrapper,
            isResponsive: !tools.isMb
        });
        btnsData && btnsData[0] && btnsData.forEach((btnData) => {
            let btn = new Button({
                icon   : btnData.icon,
                content: btnData.title,
                isDisabled: !(btnData.multiselect === 0 || btnData.multiselect === 2 && btnData.selectionFlag),
                data: btnData
            });
            btn.onClick= () => {
                let btnData: R_Button = btn.data,
                    selectedData = btnData.multiselect === 2 && btnData.selectionFlag ?
                        table.rowUnselectDataGet() : table.rowSelectDataGet();


                // if (btnData.multiselect === 2 && !selectedData[0]) {
                //     // 验证多选
                //     Modal.alert('请至少选一条数据');
                //     return;
                // } else if (btn.data.multiselect === 1 && (!selectedData[0] || selectedData[1])) {
                //     // 单选验证
                //     Modal.alert('请选最多一条数据');
                //     return;
                // }

                ButtonAction.get().clickHandle(btn.data as R_Button, btn.data.multiselect === 1 ? selectedData[0] : selectedData,(res)=>{},self.pageUrl);
            };
            self.subBtn.addItem(btn);
        });

        //根据选中行数判断按钮是否可操作，暂时做法
        self.table.on('rowSelect', function () {

            // let i = self.table.rowSelectDataGet().length;
            //
            // if(i === 0) {
            //     self.subBtn.children.forEach((btn)=>{
            //         btn.isDisabled = !(btn.data.multiselect === 0 || btn.data.multiselect === 2 && btn.data.selectionFlag);
            //         // btn.isDisabled = btn.data.multiselect > 0 || !(btn.data.multiselect === 2 && btn.data.selectionFlag);
            //     })
            // } else if(i === 1) {
            //     self.subBtn.children.forEach(btn => {
            //         btn.isDisabled = false;
            //     })
            // } else {
            //     self.subBtn.children.forEach(btn => {
            //         btn.isDisabled = btn.data.multiselect !== 2 ;
            //     })
            // }
            let selectedLen = self.table.rowSelectDataGet().length,
                allLen = self.table.rowGetAll().length;

            self.subBtn.children.forEach(btn => {
                let selectionFlag = btn.data.selectionFlag,
                    len = selectionFlag ? allLen - selectedLen : selectedLen;

                if (len === 0) {
                    btn.isDisabled = selectionFlag ? false : btn.data.multiselect > 0;
                } else if (selectedLen === 1) {
                    btn.isDisabled = false;
                } else {
                    btn.isDisabled = btn.data.multiselect !== 2;
                }
            });
        });
    }

    public tableEdit: TableEdit = null;

    public editBtns = (() => {

        let isEditing = false,
            btns: objOf<Button> = {},
            editBtnData = [],
            isMain = true,
            subVarList: IBW_TableAddrParam = null,
            mainVarList: IBW_TableAddrParam = null;

        let dbclick = (() => {
            let self = this,
                handler = function () {
                    isEditing = true;
                    self.tableEdit.init(() => {
                        start();
                        this.click();
                    });
                };
            return{
                on: () => {
                    d.on(this.wrapper.parentNode, 'dblclick', '.table-module-wrapper tbody td', handler);
                },
                off : () => {
                    d.off(this.wrapper.parentNode, 'dblclick', '.table-module-wrapper tbody td', handler);
                }
            }
        })();

        let btnStatus = {
            end: (isMain: boolean) => {
                let addr = isMain ? mainVarList : subVarList,
                    status = {
                        edit: editVarHas(mainVarList, ['update']) || editVarHas(subVarList, ['update']),
                        insert: editVarHas(addr, ['insert']),
                        del: editVarHas(addr, ['delete']),
                        save: false,
                        cancel: false
                    };

                for(let key in btns) {
                    if(btns[key]) {
                        btns[key].isDisabled = !status[key]
                    }
                }
            },
            start: (isMain: boolean, isDel = false) => {
                let addr = isMain ? mainVarList : subVarList,
                    status = {
                        edit: false,
                        insert: editVarHas(addr, ['insert']),
                        del: editVarHas(addr, ['delete']),
                        save: true,
                        cancel: true
                    };

                for(let key in btns){
                    if(btns[key] && (isDel ? key !== 'edit' : true)) {
                        btns[key].isDisabled = !status[key]
                    }
                }
            }
        };

        let init = () => {
            btnStatus.end(isMain);
            if(!tools.isMb) {
                dbclick.on();
            }
        };

        let start = (isDel = false) => {

            btnStatus.start(isMain, isDel);
            this.pagination.show(false);
            if(!tools.isMb) {
                dbclick.off();
            }
            isEditing = true;
        };

        let end = () => {
            isEditing = false;

            btnStatus.end(isMain);

            this.pagination.show(true);
            if(!tools.isMb) {
                dbclick.on();
            }
        };

        let op = {
            insert: () => {
                if (isEditing) {
                    this.tableEdit.add();
                } else {
                    this.tableEdit.init(() => {
                        isEditing = true;
                        start();
                        this.tableEdit.add();
                    });
                }
            },

            del: () => {
                let isEmpty = tools.isEmpty,
                    subTable = this.subTable && this.subTable.table;
                if (isEmpty(this.table.rowSelectDataGet()) && isEmpty((subTable && subTable.rowSelectDataGet()))) {
                    return;
                }
                start(true);
                this.tableEdit.del();
            },

            save: () => {
                this.tableEdit.save(() => end());
            },

            cancel: () => {
                this.tableEdit.cancel();
                end();
            },

            edit: () => {
                this.tableEdit.init(() => {
                    start();
                    isEditing = true;
                });
            }
        };

        let initInner = (wrapper: HTMLElement) => {

            let tableAddr = this.para.tableAddr,
                temp = getMainSubVarList(tableAddr);

            subVarList = temp.subVarList;
            mainVarList = temp.mainVarList;

            if(!mainVarList && !subVarList) {
                return;
            }

            this.tableEdit = new TableEdit({
                tm: this,
                tableAddr: tableAddr,
                cols: this.para.cols // 需要用到隐藏列 用原始cols
            });

            this.tableEdit.onFocusChange(isMain => {
                btnStatus[isEditing ? 'start' : 'end'](isMain);
            });

            d.once(this.wrapper, 'subTableInit', () => {
                this.tableEdit.subTm = this.subTable;
            });

            editBtnData = [
                {content: '编辑',subType: 'edit' },
                {content: '新增',subType: 'insert'},
                {content: '删除',subType: 'del' },
                {content: '保存',subType: 'save' },
                {content: '取消', subType: 'cancel'}
            ];

            let editBtns = new InputBox({container: wrapper});

            editBtnData.forEach((btnData)=>{
                let btn = new Button({
                    content: btnData.content,
                    data: btnData
                });

                btn.onClick= () => {
                    let subType = btn.data.subType;
                    op[subType] && op[subType]();
                };
                editBtns.addItem(btn);
                btns[btnData.subType] = btn;
            });

        };

        let has = () => {
            let {mainVarList, subVarList} = getMainSubVarList(this.para.tableAddr);
            return mainVarList || subVarList;
        };

        return {
            init: (wrapper: HTMLElement) => {
                initInner(wrapper);
                init();
            },
            edit: () => op.edit(),
            has,
            btnStart: start,
            btnSave: () => op.save()

        }
    })();

    private tableImgEdit: TableImgEdit;

    protected handleImg(urls: string[], rowIndex: number) {

        if(!this.tableImgEdit){
            let imgFields = [],
                thumbField: string = '';

            this.para.cols.forEach(col => {
                if(col.atrrs.dataType === '20') {
                    if(col.noShow){
                        imgFields.push(col);
                    } else {
                        thumbField = col.name;
                    }
                }
            });

            let {mainVarList} = getMainSubVarList(this.para.tableAddr),
                fieldsName = imgFields.map(f => f.name),
                delVarList:R_VarList[] = mainVarList && mainVarList[mainVarList.deleteType] || [],
                upVarList:R_VarList[] = mainVarList && mainVarList[mainVarList.updateType] || [];

            this.tableImgEdit = new TableImgEdit({
                // pictures: urls,
                // index: rowIndex,
                thumbField,
                fields: imgFields,
                deletable: delVarList.some(v => fieldsName.includes(v.varName)),
                updatable: upVarList.some(v => fieldsName.includes(v.varName)),
                onUploaded: md5s => {
                    // this.tableEdit.
                    this.editBtns.btnStart(true);
                    this.tableEdit.rowData(rowIndex, md5s);
                },
                onSave: () => {
                    this.editBtns && this.editBtns.btnSave();
                }
            });
        }
        this.tableImgEdit.isShow = true;

        // this.table.rowDataGet()
        let rowData = this.tableEdit ? this.tableEdit.rowData(rowIndex) : {},
            md5s: string[] = [];

        this.tableImgEdit.fields.forEach(field => {
            md5s.push(rowData[field.name]);
        });

        // this.tableImgEdit.indexSet(rowIndex, urls);
        this.tableImgEdit.showImg(urls.map(url => tools.url.addObj(url, this.tableData.getQueryPara())), md5s);
    }

    public destroy() {
        d.remove(this.table.wrapperGet());
        this.table.destroy();
        this.table = null;
        d.remove(this.wrapper);

        if(this.subTable) {
            this.subTable.table.destroy();
            d.remove(this.subTable.table.wrapperGet());
            d.remove(this.subTable.wrapper);
            this.subTable = null;
            this.subTableData = null;
            this.para = null;
            this.tableEdit = null;
            this.table = null;
        }
    }

    public getKeyField(){
        return this.para.keyField;
    }

    public getDefAddr(){
        return this.para.defDataAddrList;
    }
    /**
     * 导出报表
     */
    protected export(action : string){
        require(['tableExport'], (tableExport) => {
            let tableDom = this.tableConf.tableEl,
                background = tableDom.style.backgroundColor;

            tableDom.style.backgroundColor = '#fff';
            tableExport(tableDom, this.para.caption, action);
            tableDom.style.backgroundColor = background;
        })
    }

}

function editVarHas(varList:IBW_TableAddrParam, hasTypes:string[]) {
    let types = ['update', 'insert', 'delete'];
    if(varList){
        for(let t of types){
            if(hasTypes.indexOf(varList[`${t}Type`]) > -1){
                return true
            }
        }
    }

    return false;
}

function getMainSubVarList(addr: IBW_TableAddr){
    let varlist = {
        mainVarList : null as IBW_TableAddrParam,
        subVarList : null as IBW_TableAddrParam,
    };

    addr && Array.isArray(addr.param) && addr.param.forEach(p => {
        if(p.type === 'sub'){
            varlist.subVarList = p;
        }else if(p.type === 'main'){
            varlist.mainVarList = p;
        }
    });

    return varlist;
}