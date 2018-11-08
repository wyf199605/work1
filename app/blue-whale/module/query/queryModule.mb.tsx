/// <amd-module name="QueryModuleMb"/>
import {QueryModule, QueryModulePara} from "blue-whale/module/query/queryModule";
import {QueryBuilder} from "./queryBuilder";
import {Modal} from "global/components/feedback/modal/Modal";
import {MbPage} from "../../../global/components/view/mbPage/MbPage";
import d = G.d;
import {SwipeOut} from "../../../global/components/other/SwipeOut/SwipeOut";
import {Inputs} from "../inputs/inputs";

export = class QueryModuleMb extends QueryModule {
    // loadingShow() {
    // }
    //
    // loadingHide() {
    // }

    // private popup : HTMLDivElement;
    // private loading : HTMLDivElement;
    // private tab : Tab;
    private body: HTMLElement;
    private mbPage: MbPage;
    private modal: Modal;
    // private cols : R_Field[];
    // private optionDom: HTMLElement;
    // private queryDom: HTMLElement;

    constructor(para: QueryModulePara) {
        super(para);
    }

    private initEvent() {
        let self = this;
        d.on(this.modal.bodyWrapper, 'click', '[data-action]', function () {
            switch (this.dataset.action) {
                case 'hide':
                    self.hide();
                    break;
                case 'search':
                    let errMsg = self.search();
                    if (typeof errMsg === 'string') {
                        Modal.alert(errMsg);
                        return false;
                    }
                    break;
                case 'save':
                    // 默认值保存
                    self.settingSave();
                    break;
            }
        });

        d.on(this.modal.bodyWrapper, 'click', '[data-action="add"]', function () {
            let name = this.dataset.name,
                qryBuilder = self.queriesCpt[name] as QueryBuilder;

            if (qryBuilder) {
                qryBuilder.rowAdd();
                let ul = (this as HTMLElement).previousElementSibling;
                ul.scrollTop = ul.scrollHeight;
            }
        });

        //点击loading 时隐藏loading
        // this.loading.addEventListener('tap', function () {
        //     this.classList.add('hide');
        // });

        this.mobileScan();
    }

    private mobileScan() {
        let field = this.para.qm && this.para.qm.scannableField;
        if (!field) {
            return;
        }

        let cols: R_Field[] = [],
            q = this.para.qm.queryparams1;
        Array.isArray(q) && q.forEach(obj => {
            cols.push({
                name: obj.field_name,
                title: obj.caption,
                caption: obj.caption
            })
        });
        require(['MobileScan'], (M) => {
            this.mbScan = new M.MobileScan({
                container: document.body,
                cols: cols,
                scannableField: field.toUpperCase(),
                scannableType: this.para.qm.scannableType,
                scannableTime: this.para.qm.scannableTime,
                callback: (ajaxData) => {
                    this.hide();
                    return this.search(ajaxData, true);
                }
            });
        })

    }


    protected queryDomGet() {
        this.cols = this.para.cols;
        if (this.modal) {
            return this.modal.bodyWrapper;
        }
        let body, title, qm = this.para.qm;
        this.body = this.bodyTpl(qm);
        // d.append(this.body, this.loading);

        if (qm.hasOption) {
            this.initQueryConf();
            body = {
                tabs: [
                    {
                        title: '查询',
                        dom: this.body
                    }, {
                        title: '选项',
                        dom: this.optionDom
                    }
                ]
            };
        } else {
            title = '查询条件设置';
            body = this.body
        }

        this.modal = new Modal({
            // body : <div></div>,
            className: 'modal-mbPage queryBuilder',
            isBackground: false,
            zIndex : 500,
            isShow: this.para.qm.autTag !== 0
        });
        this.mbPage = new MbPage({
            container: this.modal.bodyWrapper,
            body: body,
            left: <a className="mui-icon mui-icon-left-nav mui-pull-left" data-action="hide"/>,
            right: this.rightTpl(qm),
            title: title,
            className: 'mbPage-query'
        });
        this.initEvent();

        return this.modal.bodyWrapper;
    }

    protected queryParamTplGet() {
        let li = <li class="mui-table-view-cell">
            {/*<div class="mui-slider-right mui-disabled" data-action="del"><a class="mui-btn mui-btn-red">删除</a></div>*/}

            <div class="mui-slider-left mui-disabled">
                <a class="mui-btn" data-type="andOr"></a>
            </div>
            <div class="mui-slider-handle inner-padding-row">
                <div data-type="field"></div>
                <div data-type="not"></div>
                <div data-type="operator"></div>
                <div data-type="input1"></div>
                <div data-type="input2"></div>
            </div>
        </li>;

        setTimeout(() => {
            let wrapper = d.query('.mui-slider-left', li),
                left = [wrapper];

            if(li.dataset['index'] === '0'){
                left = void 0 ;
            }
            console.log(left);

            new SwipeOut({
                target: li,
                right: [
                    <button data-action="del" class="mui-btn mui-btn-red">删除</button>,
                ],
                left
            });
        }, 100);
        return li;
    }

    protected atVarTplGet() {
        return <li class="mui-table-view-cell mui-row">
            <div class="mui-col-xs-4" data-type="title"></div>
            <div class="mui-col-xs-8" data-type="input"></div>
        </li>
    }


    public show() {
        if (this.modal) {
            this.modal.isShow = true;
        }
    }

    public hide() {
        if (this.modal) {
            this.modal.isShow = false;
        }
    }

    // public loadingShow(){
    //     this.loading.classList.remove('hide');
    //
    // }
    // public loadingHide(){
    //     this.loading.classList.add('hide');
    //
    // }


    private rightTpl(qm) {
        return <a className="mui-btn mui-btn-link mui-pull-right">
            <button data-com-type="textCase"></button>
            {qm.setting ? <button className="btn button-type-link button-blue iconfont icon-baocun"
                                  data-action="save"></button> : ``}
            <button className="btn button-type-link button-blue iconfont icon-sousuo" data-action="search"></button>
        </a>
    }

    private bodyTpl(qm) {
        let atvarHeight = 0, atva = qm.atvarparams,
            q0 = qm.queryparams0, q1 = qm.queryparams1;

        atva && (atvarHeight = atva.length * 41);

        return <div className="query">
            <div style={`height:${atvarHeight + 1}px`}>
                {atva ? <ul className="mui-table-view" data-query-name="atvarparams"></ul> : ''}
            </div>
            <div style={`height: calc(100% - ${atvarHeight}px)`}>
                {q0 ? <ul className="mui-table-view" data-query-name="queryparams0"></ul> : ''}
                {q0 ? <div data-action="add" data-name="queryparams0" className="mui-btn mui-btn-block mui-btn-primary">
                    <span className="mui-icon mui-icon-plusempty"></span> 添加条件</div> : ''}
                {q1 ? <ul className="mui-table-view" data-query-name="queryparams1"></ul> : ''}
                {q1 ? <div data-action="add" data-name="queryparams1" className="mui-btn mui-btn-block mui-btn-primary">
                    <span className="mui-icon mui-icon-plusempty"></span> 添加条件</div> : ''}
            </div>
        </div>;
    }
}