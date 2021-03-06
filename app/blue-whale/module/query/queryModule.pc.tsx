/// <amd-module name="QueryModulePc"/>
import {QueryModule, QueryModulePara} from "blue-whale/module/query/queryModule";
import d = G.d;
import tools = G.tools;
import {Tab} from "../../../global/components/ui/tab/tab";
import {Modal} from "global/components/feedback/modal/Modal";
import {ModalHeader} from "global/components/feedback/modal/ModalHeader";
import {ModalFooter} from "global/components/feedback/modal/ModalFooter";
import {Button} from "../../../global/components/general/button/Button";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";

export = class QueryModulePc extends QueryModule {
    private modal: Modal;
    private tab: Tab;
    private queryDom: HTMLElement;
    // private cols: R_Field[];
    // private optionDom: HTMLElement;

    /**
     * 初始化模态框
     * @param para
     */
    constructor(para: QueryModulePara) {
        super(para);

        this.cols = para.cols;
        // 模态框初始化
        let self = this,
            leftBox = new InputBox(),
            rightBox = new InputBox(),
            cancelBtn = new Button({content: '取消', type: 'default',key:'cancelBtn'}),
            queryBtn = new Button({
                content: '查询',
                type: 'primary',
                onClick: () => {
                    self.search()
                        .then(() => {
                            self.modal.isShow = false;
                        })
                        .catch(() => {
                            self.spinner && self.spinner.hide();
                        });
                },
                key: 'queryBtn'
            });

        if(this.para.qm.setting && this.para.qm.setting.settingId){
            leftBox.addItem( new Button({
                content: '设置默认值',
                type: 'primary',
                onClick: () => {
                    self.settingSave();
                },
                key:'saveBtn'
            }));
        }
        rightBox.addItem(cancelBtn);
        rightBox.addItem(queryBtn);

        this.modal = new Modal({
            container: para.container,
            header: '查询器',
            body: document.createElement('span'),
            className: 'queryBuilder',
            isBackground : false,
            isShow: this.para.qm.autTag !== 0,
            footer:{
                leftPanel: leftBox,
                rightPanel: rightBox
            }
        }); 

        let tab = [{
            title: '查询',
            dom: this.queryDom
        }];
        //是否有选项
        if (para.qm.hasOption === true) {
            this.initQueryConf();
            tab.push({
                title: '选项',
                dom: this.optionDom
            });
        }
        this.tab = new Tab({
            tabParent: this.modal.bodyWrapper,
            panelParent: this.modal.bodyWrapper,
            tabs: tab
        });
        if(this.para.qm.autTag !== 0){
            this.modal.isShow = true;
        }
    }

    // 隐藏显示关闭按钮
    public toggleCancle(){
        let closeIcon = d.query('.queryBuilder .close',this.para.container),
            closeBut = d.query('.right-plane button',this.para.container),
            toggle = (dom : HTMLElement)=> {
                dom.classList.toggle('hide');
            };

        toggle(closeIcon);
        toggle(closeBut);
    }

    protected queryDomGet() {
        if (!this.queryDom) {
            let container = document.createElement('div');

            ['atvarparams', 'queryparams0', 'queryparams1'].forEach((name, i) => {
                tools.isNotEmpty(this.para.qm[name]) && container.appendChild(
                    <div className={`filter-form ${i === 0 ? 'row' : ''}`} data-query-name={name}>
                    {i > 0 ? <span data-action="add" className="iconfont blue icon-jiahao"></span> : ''}
                </div>)
            });

            // 是否大小写
            d.append(container, <div data-com-type="textCase"></div>);
            this.queryDom = container;
        }
        return this.queryDom;
    }

    protected queryParamTplGet(): HTMLElement {
        return <div class="row">
            <div class="col-xs-3" data-type="field"></div>
            <div class="col-xs-1" data-type="not"></div>
            <div class="col-xs-2" data-type="operator"></div>
            <div class="col-xs-3" data-type="input1"></div>
            <div class="col-xs-3" data-type="input2"></div>
            <span data-action="del" class="iconfont red icon-close"></span>
            <span data-type="andOr"></span>
            </div>;
    }

    protected atVarTplGet(): HTMLElement {
        return <div class="col-sm-5"><div data-type="title"></div><div data-type="input"></div></div>;
    }

    public show() {
        if(this.modal){
            this.modal.isShow = true;
        }
    }

    public hide() {
        if(this.modal){
            this.modal.isShow = false;
        }
    }
}
