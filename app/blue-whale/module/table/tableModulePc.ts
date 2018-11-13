/// <amd-module name="TableModulePc"/>
import {TableModule} from 'blue-whale/module/table/tableModule'
import tools = G.tools;
import sys = BW.sys;
import d = G.d;
import LabelPrintModule = require('../../module/labelPrint/labelPrintModule');
import FormPrintModule = require('../../module/labelPrint/formPrintModule');
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {Modal} from "global/components/feedback/modal/Modal";
import {PcTable} from "../../../global/components/table/pcTable";
import {Scrollbar} from "../../../global/components/scrollbar/scrollbar";
import {Affix} from "../../../global/components/affix/Affix";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import {TextInput} from "../../../global/components/form/text/text";
import {Inputs} from "../inputs/inputs";
import {DropDown} from "../../../global/components/ui/dropdown/dropdown";
import {TableColumn} from "../../../global/components/newTable/base/TableColumn";

export = class TableModulePc extends TableModule {

    protected initWrapper(tableDom: HTMLTableElement) {
        let wrapper = d.create(`<div class="table-module-wrapper"></div>`),
            topBtns = d.create('<div class="topBtns">' +
                '<div class="btn-group btnsRight"></div>' +
                '<div style="clear:both"></div></div>');

        d.replace(wrapper, tableDom);
        d.append(wrapper, topBtns);
        d.append(wrapper, tableDom);

        this.wrapper = wrapper;

        if(!this.para.isSub){
            let leftBtns = d.create('<div class="btn-group btnsLeft"></div>'),
                middleBtns = d.create('<div class="btn-group btnsMiddle"></div>');

            d.prepend(topBtns, middleBtns);
            d.prepend(topBtns, leftBtns);

            if(this.subTableData) {
                this.tableConf.scrollEl = wrapper;
            }
        }
    }

    protected onComplete() {
        if (!this.para.isSub) {
            if(!this.isDrill) {
                this.editBtns.init(d.query('.topBtns .btn-group.btnsMiddle', this.wrapper));
                this.initSubBtns(d.query('.topBtns .btn-group.btnsLeft', this.wrapper));
            } else {
                this.initDrillBut.init(this.wrapper);
            }
        }

        setTimeout(()=>{
            this.rightBtns.init();
        }, 0);

        d.on(this.wrapper, 'pageToggle',(e:CustomEvent)=>{
            if(e.detail.isShow){
                let bottom = d.query('.table-out-bottom',this.wrapper),bottomHeight;
                if(bottom){
                    bottomHeight = bottom.offsetHeight;
                    this.onLoad.getscrollBar().setConfBottom(bottomHeight);
                    let container = d.closest(this.wrapper, 'div.modal-body') ||
                        d.closest(this.wrapper, 'div.page-container');
                    tools.event.fire('scroll', {}, container);
                }
            }
            else{
                this.onLoad.getscrollBar() && this.onLoad.getscrollBar().setConfBottom(0);
            }
        });

       this.showDetailBut();

        // setTimeout(() => {
        //     //monitorKey键盘输入
        //     if(this.para.inputs){
        //         new Inputs({
        //             inputs : this.para.inputs,
        //             container : this.tableConf.tableEl,
        //             table : this,
        //         })
        //     }
        // },200);

    }

    private showDetailBut(){
        let table = this.table,
            self = this,
            multiText = null;

        d.on(table.wrapperGet(), 'mouseover', 'tbody td .detail-more', function (e:MouseEvent) {
            initText(this.dataset.textType);
            let rowIndex = parseInt(d.closest(this, 'tr').dataset.index),
                colName = d.closest(this, 'td').dataset.col,
                rect = this.getBoundingClientRect(),
                tableRect = self.para.isSub || self.subTableData ? self.wrapper.getBoundingClientRect() : document.body.getBoundingClientRect();

            multiText.classList.remove('hide');
            multiText.innerHTML = `${table.rowDataGet(rowIndex)[colName]}`;

            let multiHeight = multiText.offsetHeight,
                multiWidth = multiText.offsetWidth,
                bottom = rect.bottom + multiHeight,
                right = rect.left + multiWidth;

            multiText.style.top = `${bottom > tableRect.bottom ? rect.top - multiHeight : rect.bottom}px`;

            multiText.style.left = `${right > rect.right ? rect.left - (right - rect.right) : rect.left -40}px`;

        });

        d.on(table.wrapperGet(), 'mouseout', 'tbody td .detail-more', function (e:MouseEvent) {
            multiText.classList.add('hide');
        });
        function initText(type:string){
            if(multiText){
                d.remove(multiText);
                d.off(multiText, 'mouseover', over);
                d.off(multiText, 'mouseout', out);
            }
            switch (type) {
                case 'string':
                case 'html':
                    multiText = d.create(
                        `<div class="hide showDetail"></div>`);
                    break;
                case 'multiText':
                    multiText = d.create(
                        `<pre class="hide showDetail"></pre>`);
                    break;
            }
            d.append(self.wrapper, multiText);
            d.on(multiText, 'mouseover', over);
            d.on(multiText, 'mouseout', out);
        }
        function over(){
            multiText.classList.remove('hide');
        }
        function out(){
            multiText.classList.add('hide');
        }
    }

    protected onLoad = (function(self){
        let scrollBar : Scrollbar = null,
            bottomPaging : Affix = null;
        let init = function(){
            if(!scrollBar && !self.isDrill || (!bottomPaging && !self.isDrill)){
                let container = <HTMLElement>self.tableConf.scrollEl;
                let bottomPag = d.query('.sbarWrapper',container);
                bottomPag && container.removeChild(bottomPag);
                let scrollEl = self.table['tableMiddle'];
                let bottom = d.query('.table-out-bottom',self.wrapper);
                let bottomSize = bottom ? bottom.offsetHeight + 23 : 23;

                if(container.classList.contains('main-table')) {
                    let topHeight = d.query('.topBtns',container).offsetHeight;
                    let aggrWrapper = d.query('.aggr-wrapper',container);
                    setTimeout(()=>{
                        let wrapperHeight = d.query('.mobileTableWrapper',container).offsetHeight;
                        let tableHeight = aggrWrapper ? container.offsetHeight - wrapperHeight - 38- 12 :container.offsetHeight - topHeight -wrapperHeight - 12;
                        scrollEl.style.paddingBottom = tableHeight + 'px';
                    },0);
                }

                let scrollBarPara = {
                    el : scrollEl,
                    Container : container,
                    marginBottom : bottomSize
                };

                if(bottom) {
                    scrollBarPara['bottom'] = bottom.offsetHeight + 10;
                    scrollBar = new Scrollbar(scrollBarPara);
                    setStyle(bottom,container);
                    bottomPaging = new Affix({
                        el : bottom,
                        target : container
                    });
                }
                else{
                    scrollBar = new Scrollbar(scrollBarPara);
                }
                //target大小变化调整事件
                let resizeEvent =  () =>{
                    let element = container,
                        lastWidth = element.offsetWidth,
                        lastHeight = element.offsetHeight,
                        lastInner = element.innerHTML;

                    setInterval(() => {
                        if(lastInner !== element.innerHTML){
                            scrollBar.updateStyle();
                            lastInner = element.innerHTML;
                        }
                        if (lastWidth === element.offsetWidth && lastHeight === element.offsetHeight){
                            return;
                        }

                        scrollBar.updateStyle();
                        lastWidth = element.offsetWidth;
                        lastHeight = element.offsetHeight;

                    }, 100);
                };
                resizeEvent();
                setTopBtns();
            }
        };
        let getBottomPaging = ()=>{
            return bottomPaging;
        };

        let setTopBtns = function(){
            let container = <HTMLElement>self.tableConf.scrollEl;
            let topBtns = d.query('.topBtns',container);
            let aggrWrapper = d.query('.aggr-wrapper',container);
            let breadcrumb = d.query('.breadcrumb',container);
            let btnsHei = topBtns ? topBtns.offsetHeight : 0;
            let aggrHei = aggrWrapper ? aggrWrapper.offsetHeight : 0;
            let breadcrumbHei = breadcrumb ? breadcrumb.offsetHeight : 0;
            topBtns && (topBtns.style.width = '100%');
            topBtns && (topBtns.style.backgroundColor = 'rgb(247,247,248)');
            if(aggrWrapper){
                container.style.paddingTop = `${btnsHei + aggrHei + breadcrumbHei}px`;
            }
            if(topBtns && aggrWrapper){
                new Affix({
                    el : topBtns,
                    target : container,
                    offsetTop : 0
                });
                /**ToDo
                 * 临时做法   先将顶部导航也固定住
                 */
                breadcrumb && new Affix({
                    el : breadcrumb,
                    target : container,
                    offsetTop : 0
                });
            }
            if(aggrWrapper){
                new Affix({
                    el : aggrWrapper,
                    target : container,
                    offsetTop : topBtns ? 24 : 0
                });
            }
        };
        let setStyle = function(pagDom : HTMLElement,container :HTMLElement){
            let pagDomSty = pagDom.style;
            pagDomSty.backgroundColor = 'rgb(247,247,248)';
            pagDomSty.textAlign = 'center';
            pagDomSty.width = '100%';
            let height = container.classList.contains('main-table') ||
            container.classList.contains('sub-table') ||
            container.classList.contains('privilege-select-content')
                ? pagDom.offsetHeight + 9 : pagDom.offsetHeight + 14;
            container.style.paddingBottom = height + 'px';
        };
        let getscrollBar = function(){
            return scrollBar;
        };
        return {getscrollBar,init,getBottomPaging}
    })(this);

    private labelBtn: Button;

    public rightBtns = (() => {
        let rightBtns = this.wrapper.querySelector('.topBtns .btn-group.btnsRight'),
            buttonExport = null,
            buttonExportSta = null,
            formPriBut = null;

        let inputBox = new InputBox({
            container:<HTMLElement>rightBtns
        });

        let init = () => {
            if(!this.para.isSub){
                let but : Button = null;
                let dropJson = [{content:'导出',icon: 'daochu2',type:'default'},
                    {content:'统计',icon: 'tongji',type:'default'}];
                let exportStaBut = [{content: '列统计', icon: 'pinlei',type:'default',onClick : ()=>{this.statistic.initCount(but.wrapper);}},
                    {content: '数据统计', icon: 'statistic',type:'default',onClick : ()=>{this.statistic.initStatistic(but.wrapper);}},
                    {content: '图形报表', icon: 'bingzhuangtu',type:'default',onClick:()=>{this.statistic.initChart(but.wrapper);}},
                    {content: '交叉制表', icon: 'shejiqijiaohuanxinglie',type:'default',onClick:()=>{this.statistic.initCrosstab(but.wrapper);}},
                    {content: 'abc分析', icon: 'tongji',type:'default',onClick:()=>{ this.statistic.initAnalysis(but.wrapper); }}];
                let exportBut = [{content: 'csv',icon: 'csv1',type:'default',onClick:()=>this.export('csv')},
                    {content: 'excel',icon: 'excel',type:'default',onClick:()=>this.export('xls')},
                    {content: 'word',icon: 'word',type:'default',onClick:()=>this.export('doc')},
                    {content: 'pdf',icon: 'pdf',type:'default', onClick:()=>{this.export('pdf');}},
                    {content: 'png',icon: 'png',type:'default',onClick:()=>{this.export('image');}}];
                buttonExport = new Button(dropJson[0]);
                buttonExportSta = new Button(dropJson[1]);
                buttonExport.dropDown = new DropDown({
                    el: buttonExport.wrapper,
                    inline: false,
                    data: [],
                    multi: null,
                    className: "input-box-morebtn"
                });
                buttonExportSta.dropDown = new DropDown({
                    el: buttonExportSta.wrapper,
                    inline: false,
                    data: [],
                    multi: null,
                    className: "input-box-morebtn"
                });
                for(let i = 0,l = exportStaBut.length;i < l;i++){
                    but = new Button(exportStaBut[i]);
                    buttonExportSta.dropDown.getUlDom().appendChild(but.wrapper);
                }
                for(let i = 0,l = exportBut.length;i < l;i++){
                    buttonExport.dropDown.getUlDom().appendChild(new Button(exportBut[i]).wrapper);
                }

                if (this.para.printList && this.para.printList.length > 0) {
                    this.labelBtn = new Button({content: '标签打印',type:'default', icon: 'label',onClick:()=>{this.labelPrint.show(this.labelBtn.wrapper);}});
                    add(this.labelBtn);
                }

                formPriBut  = new Button({content: '报表打印',type:'default', icon: 'label',onClick:()=>{this.formPrint.show(formPriBut.wrapper);}});

            }

            let buttonQuery:Button;
            if (this.para.querier && this.para.querier.queryType === 3) {
                buttonQuery = new Button({content: '查询器', type:'default',icon: 'shaixuan',onClick:()=>{ this.queryModule.show();}});
                add(buttonQuery);
            }
            if(!this.para.isSub || buttonQuery) {
                add(new Button({
                    // type: 'default',
                    icon: 'wangyuanjing',
                    content: '本地查找',
                    onClick: () => {
                        this.searchReplace.show();
                    },
                }));
                add(new Button({
                    // type: 'default',
                    icon: 'sousuo',
                    content: '本地过滤',
                    onClick: () => {
                        this.localSearch.show();
                    },
                }));
            }

            add(formPriBut);

            /*  let chatBut = new Button({content: '聊天',type:'default', icon: 'label',onClick:()=>{
       let chat = new ChatController({
           container: d.closest(this.wrapper, 'div.page-container')
       });
   }});
   add(chatBut);*/
            add(buttonExportSta);
            add(buttonExport);

            d.on(this.wrapper, 'editChange', (e:CustomEvent) => {

                let isEdting = e.detail.status;
                buttonExport.isDisabled = isEdting;
                buttonExportSta.isDisabled = isEdting;
                buttonQuery && (buttonQuery.isDisabled = isEdting);
                this.labelBtn && (this.labelBtn.isDisabled = isEdting);
            });
        };
        let add = (but : Button)=>{
            but && inputBox.addItem(but);
        };
        return {init,add};
    })();

    private labelPrint = (function (self) {
        let label = null;
        let init = function (target:HTMLElement,printList? :printListArr[],cb? : Function) {
            if(self.para.printList){
                let sp = new Spinner({
                    el : target,
                    size : 14,
                    type  : Spinner.SHOW_TYPE.replace,
                });
                sp.show();

                require(['LabelPrintModule'], (Print : typeof LabelPrintModule) => {
                    label = new Print({
                        printList: printList ? printList : self.para.printList,
                        container: d.closest(self.wrapper, 'div.page-container'),
                        cols : self.table.getVisibleCol() as any,
                        getData: function () {
                            return self.table.dataGet();
                        },
                        selectedData : function(){
                            return self.table.rowSelectDataGet();
                        },
                        callBack : function(){
                            cb && cb();
                        }
                    });
                    label.modal.isShow = true;
                    sp.hide();
                });
            }
        };
        let show = function(target:HTMLElement,printList? :printListArr[],cb? : Function){
            if(label === null){
                init(target,printList,cb);
            }else {
                label.modal.isShow = true;
            }
        };
        return {show};
    }(this));

    private formPrint = (function (self) {
        let formPri = null;
        let init = function (target:HTMLElement,printList? :printListArr[],cb? : Function) {
            if(self.para.printList){
                let sp = new Spinner({
                    el : target,
                    size : 14,
                    type  : Spinner.SHOW_TYPE.replace,
                });
                sp.show();

                require(['FormPrintModule'], (formPrint : typeof FormPrintModule) => {
                    formPri = new formPrint({
                        container: d.closest(self.wrapper, 'div.page-container'),
                        cols : self.para.cols,
                        middleTable : self.table.tableELGet(),
                        tableData: function () {
                            return self.table.dataGet();
                        }
                    });
                    formPri.modal.isShow = true;
                    sp.hide();
                });
            }
        };
        let show = function(target:HTMLElement,printList? :printListArr[],cb? : Function){
            if(formPri === null){
                init(target,printList,cb);
            }else {
                formPri.modal.isShow = true;
            }
        };
        return {show};
    }(this));

    public searchReplace = (() => {
        let modal: Modal = null,
            btns: objOf<Button> = {},
            texts: objOf<TextInput> = {},
            searchStr:string = '',
            inSub = false;

        let init = () => {
            if (modal) {
                return;
            }
            let inputFactory = {
                search: (container) => {
                    texts.search = new TextInput({
                        container: container,
                        placeholder: '查找...',
                    })
                },
                replace: (container) => {
                    texts.replace = new TextInput({
                        container: container,
                        placeholder: '替换为...',
                        // disabled: !this.tableEdit.getStatus()
                    })
                }
            };

            let btnFactory = {
                next: container => {
                    btns.next = new Button({
                        container: container,
                        content: '查找下一个',
                        onClick: () => {
                            let str = texts.search.get();
                            search.next(str);
                        }
                    });
                },
                replace: container => {
                    btns.replace = new Button({
                        container: container,
                        content: '替换',
                        // isDisabled: !this.tableEdit.getStatus(),
                        onClick: () => {
                            let text = texts.replace.get(),
                                str = texts.search.get();

                            replace(str, text);
                        }
                    });
                },
                replaceAll: container => {
                    btns.replaceAll = new Button({
                        container: container,
                        content: '替换全部',
                        // isDisabled: !this.tableEdit.getStatus(),
                        onClick: () => {
                            replaceAll(texts.search.get(), texts.replace.get());
                        }
                    });
                }
            };

            let body = d.create('<div class="rows">' +
                '<div class="col-xs-6 search">' +
                '<div data-input="search"></div>' +
                '<div data-btn="next"></div>' +
                '</div>' +
                '<div class="col-xs-6 replace">' +
                '<div class="rows"><div data-input="replace"></div></div>' +
                '<div class="rows">' +
                '<div class="col-xs-4"><div data-btn="replace"></div></div>' +
                '<div class="col-xs-6"><div data-btn="replaceAll"></div></div>' +
                '</div>');


            function changeStatus(isEditing: boolean){
                let replaceEl = d.query('.replace', body),
                    searchEl = d.query('.search', body);

                replaceEl.classList[isEditing ? 'remove' : 'add']('hide');
                searchEl.classList[isEditing ? 'remove' : 'add']('col-xs-12');
                searchEl.classList[!isEditing ? 'remove' : 'add']('col-xs-6');
            }

            let isEditing = this.tableEdit ? this.tableEdit.getStatus() : false;

            if(!isEditing){
                changeStatus(isEditing);
            }

            initCom(d.queryAll('[data-input], [data-btn]', body));

            modal = new Modal({
                className: 'search-replace',
                header: '查找/替换',
                body: body,
                isBackground: false,
                isShow : false,
                // width: '500px'
            });

            d.on(this.wrapper, 'editChange', (e:CustomEvent) => {
                changeStatus(e.detail.status)
            });

            function initCom(containers: HTMLElement[]){
                Array.isArray(containers) && containers.forEach(container => {
                    let dataSet = container.dataset;
                    if(dataSet.input && inputFactory[dataSet.input]){
                        inputFactory[dataSet.input](container);

                    }else if(dataSet.btn && btnFactory[dataSet.btn]){
                        btnFactory[dataSet.btn](container);
                    }
                });
            }
        };

        let show = () => {
            if(!modal){
                init();
            }
            modal.isShow = true;
        };


        let search = (() => {
            let currentIndex = -1,
                lastScrollTop = 0;

            let getTds = (index) => {
                return d.queryAll(`tbody td[data-high-index="${index}"]`, this.table.wrapperGet());
            };

            /**
             * 查找下一个
             * @param {string} str
             */
            let next = (str: string = searchStr) => {
                let fromStart = false,
                    scrollEl = <HTMLElement>this.tableConf.scrollEl,
                    subTable: TableModulePc = null;

                if(this.subTable) {
                    subTable = <TableModulePc>this.subTable;
                }
                if(str != searchStr){
                    this.table.highlight(str);

                    if(subTable){
                        subTable.table.highlight(str);
                        subTable.searchReplace.search.setSearchStr(str);
                    }

                    setSearchStr(str);
                    fromStart = true;
                    inSub = false;
                }

                if(subTable && inSub){
                    inSub = subTable.searchReplace.search.next(str);
                    return !inSub;
                }else{
                    if(fromStart) {
                        // 清空从头开始定位
                        d.queryAll('tbody td.searched', this.table.wrapperGet()).forEach(td => {
                            td.classList.remove('searched');
                        });
                        currentIndex = -1;
                    }
                    // 清理上一个状态
                    getTds(currentIndex).forEach(td => {
                        td.classList.remove('searched');
                    });

                    // 查找下一个
                    currentIndex ++;
                    let searchedTd = getTds(currentIndex);
                    if(searchedTd[0]){
                        searchedTd.forEach(td => {
                            td.classList.add('searched');
                            if('scrollIntoViewIfNeeded' in td){
                                td['scrollIntoViewIfNeeded'](false)
                            }else{
                                td.scrollIntoView(false);
                            }
                        });

                        let distance = scrollEl.getBoundingClientRect().bottom - searchedTd[0].getBoundingClientRect().bottom;
                        if(distance < 80){
                            scrollEl.scrollTop = scrollEl.scrollTop + (80 - distance);
                        }
                        subTable && (inSub = false);
                        return true;
                    }else{
                        currentIndex = -1;
                        if(subTable){
                            inSub = true;
                            subTable.searchReplace.search.next();
                        }
                        return false;
                    }
                }

            };

            let clear = (index: number = currentIndex) => {
                let allSearch = d.queryAll(`tbody td[data-high-index]`, this.table.wrapperGet());

                allSearch.forEach(td => {
                    let highIndex = parseInt(td.dataset.highIndex);
                    if(highIndex >= index) {
                        if(highIndex === index) {
                            delete td.dataset.highIndex;
                        }else{
                            td.dataset.highIndex = (highIndex - 1) + '';
                        }
                    }
                });

                if(currentIndex >= index) {
                    currentIndex --;
                }

                next();

            };

            let clearAll = () => {
                d.queryAll(`tbody td.searched`, this.table.wrapperGet()).forEach(td => {
                    td.classList.remove('searched');
                });
                currentIndex = -1;
                searchStr = '';
                lastScrollTop = 0;
            };

            let setSearchStr = (str: string) => {
                searchStr = str;
            };

            return {next, clear, clearAll, setSearchStr}
        })();

        /**
         * 替换
         * @param {string} seStr
         * @param {string} reStr
         * @return {boolean} 返回能否继续替换
         */
        let replace = (seStr: string, reStr:string) => {

            if(seStr != searchStr){
                if(btns.next && btns.next.onClick){
                    btns.next.onClick(null);
                    return true;
                }
            }

            let subTable: TableModulePc = null;
            if(this.subTable) {
                subTable = <TableModulePc>this.subTable;
            }

            if(inSub){
                return subTable.searchReplace.replace(seStr, reStr);

            }else{
                if(!d.query('tbody td[data-high-index]', this.table.wrapperGet())){
                    if(btns.next && btns.next.onClick){
                        btns.next.onClick(null);
                        return true;
                    }else{
                        search.next(seStr);
                        return !!d.query('tbody td[data-high-index]', this.table.wrapperGet());
                    }
                }
                let td = d.query('tbody td.searched', this.table.wrapperGet());

                if(!td){
                    return !this.para.isSub;
                }

                let originText = tools.str.removeHtmlTags(td.innerHTML);
                td.click();
                let input = <HTMLInputElement>d.query('input', td);

                if(input){
                    let searchPara = new RegExp(`(${tools.escapeRegExp(seStr)})`, 'ig');
                    input.value = originText.replace(searchPara, reStr);
                    search.clear(parseInt(td.dataset.highIndex));
                    td.classList.remove('searched');

                    this.tableEdit.reshowEditing();
                    return true;
                }else{
                    search.next();
                    return true;
                }
            }

        };

        let replaceAll = (seStr: string, reStr:string) => {

            while(replace(seStr, reStr)){}

            search.clearAll();

            // debugger;
            // if(this.subTable) {
            //     (<TableModulePc>this.subTable).searchReplace.replaceAll(seStr, reStr);
            // }
        };

        return {show, search, replace, replaceAll};
    })();

    protected tableConfGet(para: TableComConfGetPara):BT_Para {
        let initTableConf = super.tableConfGet(para);
        let pcConf: BT_Para = {
            colResize: true,
            move: true,
            colGroup: this.isDrill,
            cellMaxWidth: 200,

            onComplete: () => {
                typeof initTableConf.onComplete === 'function' && initTableConf.onComplete();
            }
        };

        let colsBtn = [];
        this.para.cols.forEach(col => {
            let title = col.title;
            let cb = (btn, rows, target) => {
                if(rows && rows[0]){
                    let curChild = <HTMLElement>d.query('[data-col="'+col.name+'"]',rows[0]);
                    sys.window.copy(curChild.innerHTML);
                }
            };
            colsBtn.push({
                multi: false,
                title: title,
                callback: cb
            })
        });

        initTableConf.rowMenu.push({
            multi: false,
            title: '列复制',
            callback: (btn, rows, target) => {},
            children: colsBtn
        });

        initTableConf.rowMenu.push({
            multi: false,
            title: '复制单元格',
            callback: (btn, rows, target) => {
                sys.window.copy(d.closest(target, 'td').innerHTML);
            }
        });

        initTableConf.rowMenu.push({
            multi: true,
            title: '复制选中区域',
            callback: (btn, rows) => {
                 let colsName = [],indexes = [],
                     table = <PcTable>this.table;
                 let data = table.drag.getData();
                 for(let i = 0,l = data['cols'].length;i < l;i++){
                     colsName.push(data['cols'][i].name);
                 }
                 for(let i = data['indexes'][0];i <= data['indexes'][1];i++){
                     indexes.push(i);
                 }
                 this.table.copy.row(indexes,false,colsName);
            }
        });

        return tools.obj.merge(true, initTableConf, pcConf);
    }

    protected initTable(para: BT_Para) {
        return new PcTable(para);
    }

    protected imgHtmlGet(url) {
        return `<img style="max-height: 100%" src="${url}" alt="">`;
    }


    protected handleSubTable = (() => {
        // 初始化子表Wrapper
        let subWrapper = d.create('<div class="table-module-wrapper sub-table"></div>'),
            subTableEl = <HTMLTableElement>d.create('<table class="subTable"><tbody></tbody></table>');
        return (subUrl, ajaxData, onShow, onClose) => {

            if (this.subTable === null) {

                d.closest(this.wrapper, '.tablePage').classList.add('has-subTable');
                this.wrapper.classList.add('main-table');

                // this.tableConf.scrollEl = this.wrapper;

                d.append(subWrapper, subTableEl);
                d.after(this.wrapper, subWrapper);

                this.subTableData.tableAddr = this.para.tableAddr;


                let fixTop = subWrapper.getBoundingClientRect().top;

                this.subTable = new TableModulePc({
                    tableEl: subTableEl,
                    scrollEl: subWrapper,
                    ajaxData: ajaxData,
                    fixTop: fixTop
                }, this.subTableData);

                tools.event.fire('subTableInit', null, this.wrapper);
            } else {
                this.subTable.refresher(ajaxData);
            }

            onShow();

            let selectedData = this.table.rowSelectDataGet();
            this.subTable.aggregate.get( selectedData && selectedData[0] ? selectedData[0] : null);

        }
    })();
}

