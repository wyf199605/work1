/// <amd-module name="TableModuleMb"/>
import {TableModule} from 'blue-whale/module/table/tableModule'
import tools = G.tools;
import d = G.d;
import {MbTable} from "../../../global/components/table/mbTable";
import {SubPage} from "../../../global/components/ui/subPage/subPage";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";

import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";

import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Popover} from "../../../global/components/ui/popover/popover";

export = class TableModuleMb extends TableModule{

    private subBtnWrapper: HTMLElement;

    protected initWrapper(tableDom:HTMLElement){
        this.wrapper = <div className="table-module-wrapper"></div>;
        d.append(tableDom.parentElement, this.wrapper);
        d.append(this.wrapper, tableDom);
    }
    protected onComplete(){
        /**
         * 如果是钻取的表格则初始化图表统计的按钮和返回表格的按钮
         * @type {boolean}
         */
        // if('showCheckbox' in this.para && !this.para.showCheckbox) {
        //     this.table.indexColFun.show(false);
        // }

        if(this.isDrill) {
            this.initDrillBut.init(this.wrapper);
        }

        this.footerBtnsInit();
        this.mobileScan();

        if(!this.isDrill && !this.para.isSub && !this.para.isInModal){
            this.initSearch();
            setTimeout(()=>{
                this.indexColShowBtn.init();
                this.frontBtnsInit.init();
            }, 0);
        }
    }

    private initSearch() {
        let tableWrap = this.table.wrapperGet(),
            searchEl =
                <div className="search-input mui-input-row">
                    <label><span className="mui-icon mui-icon-search grey"></span></label>
                    <input type="text"
                           placeholder="请输入..."
                           className="mui-input-clear mui-input"
                           autocapitalize="off"
                           autocorrect="off"/>
                </div>;

        d.before(tableWrap, searchEl);

        let height = searchEl.clientHeight;

        if (this.para.isSub) {
            tableWrap.parentElement.scrollTop = height;
        } else {
            window.scrollTo(0, height);
        }

        let input = d.query('input', searchEl) as HTMLInputElement;

        // 初始化
        mui(input).input();

        inputOnChange(() => this.table.search(input.value));

        function inputOnChange(callback) {
            let timer = null, nowTime = 0, lastTime = 0,

                timeInterval = 500;//节流，300毫秒触发一次

            d.on(input, 'input', function () {

                nowTime = new Date().getTime();
                if (lastTime === 0) {
                    lastTime = nowTime;
                }
                if (nowTime - lastTime < 300) {
                    if (timer) {
                        clearTimeout(timer);
                    }

                    timer = setTimeout(function () {
                        callback();
                        lastTime = 0;
                        timer = null;
                    }, timeInterval);
                }
                lastTime = nowTime;
            });

            setTimeout(function () {
                d.on(input.nextElementSibling, 'tap', function (e: Event) {

                    callback();
                    input.blur();
                    input.focus();
                });
            }, 1000);
        }
    }
    // 扫码
    private mobileScan() {
        let field = this.para.scannableField;
        if (!field) {
            return;
        }
// console.log(this.para)
        require(['MobileScan'],  (M) => {
            new M.MobileScan({
                container : this.wrapper,
                cols : this.para.cols,
                scannableField : field.toUpperCase(),
                scannableType : this.para.scannableType,
                scannableTime : this.para.scannableTime,
                callback : (ajaxData) => {
                    if(this.queryModule){
                        this.queryModule.hide();
                        return this.queryModule.search(ajaxData, true);
                    }else {
                        return this.refresher(ajaxData);
                    }
                }
           });
        })
    }

    private footerBtnsInit(){
        // 初始化按钮
        let hasSub = !tools.isEmpty(this.para.subButtons),
            hasEdit = this.editBtns.has();

        if(hasSub || hasEdit){
            this.subBtnWrapper = <footer className="mui-bar mui-bar-footer"></footer>;

            let btnWrapper: HTMLElement = null;

            if(hasSub && hasEdit){
                btnWrapper = <div className="all-btn"></div>;
                let sub: HTMLElement = null,
                    edit:HTMLElement = null;

                new CheckBox({
                    className: 'edit-toggle',
                    container: this.subBtnWrapper,
                    onClick: (isChecked) => {
                        sub.classList[isChecked ? 'add' : 'remove']('hide');
                        edit.classList[!isChecked ? 'add' : 'remove']('hide');
                    }
                });

                d.append(this.subBtnWrapper, btnWrapper);

                setTimeout(() => {
                    [sub, edit] = d.queryAll('.input-box', btnWrapper);
                    edit.classList.add('hide');
                }, 50);
            } else {
                btnWrapper = this.subBtnWrapper;
            }

            if(hasSub) {
                this.initSubBtns(btnWrapper);
            }

            if(hasEdit) {
                this.editBtns.init(btnWrapper);
            }

            this.wrapper.style.paddingBottom = '35px';
            d.append(this.wrapper, this.subBtnWrapper);
        }
    }

    protected frontBtnsInit = (() =>{
        let target = d.query('[data-target="popover"]'),
            btns: Btn[] = [
                {title: '本地搜索', action: 'localSearch'},
                {title: '图表统计', action: 'chartStatistic'},
                {title: '交叉制表', action: 'anaStatistic'},
                {title: '数据统计', action: 'dataStatistic'},
                {title: 'abc分析', action: 'analysisStatistic'},
                {title: '导出报表', action: 'export'}
                ],
            self = this,
            popover:Popover,
            items = btns.map((item) => {
                return {
                    title: item.title,
                    icon: item.icon
                };
            });

        function _clickHandle(index){
                switch (btns[index].action) {
                    case 'localSearch':
                        self.localSearch.show();
                        popover.show = false;
                        break;
                    case 'chartStatistic':
                        self.statistic.initChart();
                        popover.show = false;
                        break;
                    case 'anaStatistic':
                        self.statistic.initCrosstab();
                        popover.show = false;
                        break;
                    case 'dataStatistic':
                        self.statistic.initStatistic();
                        popover.show = false;
                        break;
                    case 'analysisStatistic':
                        self.statistic.initAnalysis();
                        popover.show = false;
                        break;
                    case 'export':
                        self.doExport();
                        popover.show = false;
                        break;
                    default:
                }
        }
        let init = () => {
            popover = new Popover({
                target: target,
                items: items,
                onClick: (index) => {
                    _clickHandle(index);
                }
            });
        };

        let destroy = ()=>{
            if(!tools.isEmpty(popover)){
                popover.destroy();
            }
        };
        return {init, destroy}
    })();

    // 导出报表
    private doExport(){
        let body = <div data-name="export"></div>;
        let data = [{value: 'csv', text: '导出csv'},
            {value: 'xls', text: '导出excel'},
            {value: 'doc', text: '导出word'},
            {value: 'pdf', text: '导出pdf'},
            {value: 'image', text: '导出png'}];
        let sel = new SelectBox({
            container: body,
            select: {
                multi: false,
                isRadioNotchecked: false
            },
            data: data
        });
        let previewRB = new InputBox();
        let okBtn = new Button({
            key: 'okBtn',
            content: '确定',
            type: 'primary',
            onClick: () => {
                this.export(data[sel.get()[0]].value);
            }
        });
        previewRB.addItem(okBtn);
        new Modal({
            header: '导出报表',
            body: body,
            position:'center',
            container : this.wrapper,
            isOnceDestroy: true,
            footer: {
                rightPanel: previewRB
            }
        });
    }

    protected indexColShowBtn = (()=>{
        let checkBox: CheckBox = null;
        let init = ()=>{
            if(this.para.isSub){
                return;
            }
            let header = d.query('body > header.mui-bar.mui-bar-nav > [data-action="indexCol"]');
                checkBox = new CheckBox({
                    container: header,
                    text: '',
                    status: 1,
                    // status: !('showCheckbox' in this.para) || this.para.showCheckbox ? 1 : 0,
                    onSet: (isChecked) => {
                        this.table.indexColFun.show(isChecked);
                        if(this.subTable && this.subTable.table) {
                            this.subTable.table.indexColFun.show(isChecked);
                        }
                    }
                });
        };

        let destroy = ()=>{
            checkBox.destroy();
        };
        return{init, destroy}
    })();

    protected tableConfGet(para: TableComConfGetPara){
        let initTableConf = super.tableConfGet(para);

        if(!para.btPara.multi){
            initTableConf.colMenu.push({
                multi: true,
                title: '列排序',
                callback: (btn, cols) => {
                    let table = this.table as MbTable;
                    table.showColReorder();
                }
            });
        }


        let pcConf : BT_Para = {
            // appendPage:true,
            onComplete:  initTableConf.onComplete


        };
        return tools.obj.merge(true, initTableConf, pcConf);

    }

    protected initTable(para: BT_Para){
        return new MbTable(para);
    }

    protected imgHtmlGet(url){
        return `<img src="${url}" alt=""/>`;
    }

    // protected handleImg(url : string[]){
    //     ImgModalMb.show({ img: url } );
    // }

    protected handleSubTable = (() => {
        let subContent: HTMLElement = null,
            subTable: HTMLTableElement = null;

        return (subUrl, ajaxData, onShow, onClose) => {

            // 初始化subPage
            if (subContent === null) {
                subContent = SubPage.create();

                // 创建子表dom并添加到subPage的content区域中
                subTable = <table className="mobileTable subTable"></table>;
                subContent.appendChild(subTable);
            }
            // 展示subPage
            SubPage.show(() => {
                // 初始化子表
                if (this.subTable === null) {
                    this.subTable = new TableModuleMb({
                        tableEl: subTable,
                        scrollEl: subContent,
                        ajaxData: ajaxData,
                        // fixTop: subContent.getBoundingClientRect().top

                    }, this.subTableData);

                    tools.event.fire('subTableInit', null, this.wrapper);
                }else{
                    SubPage.getLoading().classList.remove('hide');
                    this.subTable.refresher(ajaxData, () => {
                        SubPage.getLoading().classList.add('hide');
                    });
                }
            });

            onShow();

            setTimeout(() => {
                let selectedData = this.table.rowSelectDataGet();
                this.subTable.aggregate.get( selectedData && selectedData[0] ? selectedData[0] : null);
            }, 100);


            SubPage.onClose(onClose);
        };
    })();

    public destroy(){
        this.table.destroy();
        this.frontBtnsInit.destroy();
        this.indexColShowBtn.destroy();
        d.remove(this.table.wrapperGet());
        d.remove(this.wrapper);
    }
}
