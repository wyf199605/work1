/// <amd-module name="LabelPrintModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import Component = G.Component;
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import IComponentPara = G.IComponentPara;
import {Tab} from "../../../global/components/ui/tab/tab";
import {NumInput} from "../../../global/components/form/numInput/numInput";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {TextInput} from "../../../global/components/form/text/text";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {FormCom} from "../../../global/components/form/basic";
import d = G.d;
import {Tooltip} from "../../../global/components/ui/tooltip/tooltip";
import {Spinner} from "../../../global/components/ui/spinner/spinner";

type printType = 'preview' | 'print' | 'setDefault';

export interface ILabelPrintModalPara extends IComponentPara{
    onClick?: (type: printType) => Promise<any>;
    printList: {text: string, value: any}[];
    printerData: {text: string, value: any}[];
}

export class LabelPrintModal extends Component{
    protected modal: Modal;
    protected tab: Tab;
    protected coms: objOf<FormCom> = {};
    protected onClick: (type: printType) => Promise<any>;

    wrapperInit(){
        return <div className="label-print-wrapper"/>;
    }

    constructor(para: ILabelPrintModalPara){
        super(para);
        this.onClick = para.onClick || Promise.resolve;
        this.selectInputJson.printList = para.printList || [];
        this.selectInputJson.printer = para.printerData || [{text: '默认', value: 0}];

        this.initModal(para);
        this.initContent();

    }

    // 设置com的数据
    set data(data: obj){
        for(let key in data){
            let com = this.coms[key];
            com && com.set(data[key]);
        }
    }

    // 获取全部数据
    get data(){
        let data: obj = {};
        for(let key in this.coms){
            data[key] = this.coms[key].get();
        }
        return data;
    }

    // 获取对应com的数据
    getData(name: string){
        let com = this.coms[name];
        return com ? com.get() : null;
    }

    // 生成旋转小图标
    static createSpinner(btn: Button): {close: Function}{
        btn && (btn.isDisabled = true);
        let spinner =  new Spinner({
            el: btn.wrapper,
            type: Spinner.SHOW_TYPE.cover,
            time: 12000,
            onTimeout: () => {
                btn && (btn.isDisabled = false);
                // Modal.toast('当前网络不佳～');
            }
        });
        spinner.show();
        return {
            close: () => {
                btn && (btn.isDisabled = false);
                spinner && spinner.hide();
                spinner = null;
            }
        }
    }

    // 初始化模态框以及对应按钮及事件
    protected initModal(para: ILabelPrintModalPara){
        let leftInputBox = new InputBox(),
            rightInputBox = new InputBox(),
            saveBtn = new Button({
                key: 'saveBtn',
                content: '设为默认值',
                type: 'primary',
                onClick: () => {
                    let obj = LabelPrintModal.createSpinner(saveBtn);
                    this.onClick('setDefault').finally(() => {
                        obj.close();
                    });
                }
            }),
            cancelBtn = new Button({content: '取消', key: 'cancelBtn', type: 'default'}),
            okBtn = new Button({
                key: 'okBtn',
                content: '打印',
                type: 'primary',
                onClick: () => {
                    let obj = LabelPrintModal.createSpinner(okBtn);
                    this.onClick('print').finally(() => {
                        obj.close();
                    });
                }
            }),
            previewBtn = new Button({
                content: '预览',
                type: 'primary',
                onClick: () => {
                    let obj = LabelPrintModal.createSpinner(previewBtn);
                    this.onClick('preview').finally(() => {
                        obj.close();
                    });
                }
            });

        leftInputBox.addItem(saveBtn);
        rightInputBox.addItem(cancelBtn);
        rightInputBox.addItem(okBtn);
        rightInputBox.addItem(previewBtn);

        this.modal = new Modal({
            className: 'labelPrint',
            container: para.container,
            width: '750px',
            header: '标签打印',
            body: this.wrapper,
            footer: {
                leftPanel: leftInputBox,
                rightPanel: rightInputBox
            },
            onClose: () => {
            }
        });
    }

    set show(show: boolean){
        this.modal.isShow = show;
    }
    get show(){
        return this.modal.isShow;
    }

    // 初始化模态框里面的数据
    protected initContent(){
        this.tab = new Tab({
            tabParent: this.wrapper,
            panelParent: this.wrapper,
            tabs: [
                {
                    title: '设置',
                    dom: LabelPrintModal.createSettingPage()
                },
                {
                    title: '选项',
                    dom: LabelPrintModal.createOptionPage()
                }
            ]
        });

        d.queryAll('[data-name]', this.wrapper).forEach(el => {
            this.createCom(el.dataset.name, el);
        });
        new Tooltip({
            el: d.query('.printer', this.wrapper),
            errorMsg: "\ue6bb 打印机",
            length: 'medium'
        });
        new Tooltip({
            el: d.query('.port', this.wrapper),
            errorMsg: '\ue609 端口',
            length: 'small'
        });
        new Tooltip({
            el: d.query('.paper', this.wrapper),
            errorMsg: '\ue879 纸型',
            length: 'medium'
        });
    }

    destroy(){
        this.modal.destroy();
        this.modal = null;
        this.coms = null;
        this.tab = null;
        super.destroy();
    }

    /**
     * 初始化模板标签控件
     * @param {string} name
     * @param {HTMLElement} el
     */
    private createCom(name: string, el: HTMLElement) {
        let self = this;
        switch (name) {
            case 'printer':
                this.coms['printer'] = new SelectInput({
                    container: el,
                    placeholder: '默认',
                    data: this.selectInputJson.printer,
                    onSet: function (item, index) {
                    },
                    className: 'selectInput',
                    clickType: 0
                });
                break;
            case 'port':
                this.coms['port'] = new SelectInput({
                    container: el,
                    placeholder: '默认',
                    data: this.selectInputJson.port,
                    onSet: function (item, index) {
                    },
                    className: 'selectInput',
                    clickType: 0
                });
                break;
            case 'paper':
                this.coms['paper'] = new SelectInput({
                    container: el,
                    placeholder: '默认',
                    data: this.selectInputJson.paper,
                    onSet: function (item, index) {
                        if (item.value != 0) {
                            let widthAndHeight = item.value.split('*');
                            self.coms['width'].set(widthAndHeight[0]);
                            self.coms['height'].set(widthAndHeight[1]);
                        }
                    },
                    className: 'selectInput',
                    clickType: 0
                });
                break;
            case 'scale':
                this.coms['scale'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 5,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                break;
            case 'ratio':
                this.coms['ratio'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                break;
            case 'width':
                this.coms['width'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                break;
            case 'height':
                this.coms['height'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                break;
            case 'pageRange':
                this.coms['pageRange'] = new SelectBox({
                    container: el,
                    select: {
                        multi: false,
                        isRadioNotchecked: false,
                        callback(index) {
                        }
                    },
                    data: [{value: 0, text: '所有页'}, {value: 1, text: '指定页'}]
                });
                break;
            case 'from':
                this.coms['from'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                break;
            case 'to':
                this.coms['to'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                break;
            case 'up':
                this.coms['up'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                break;
            case 'down':
                this.coms['down'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                break;
            case 'left':
                this.coms['left'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                break;
            case 'right':
                this.coms['right'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                break;
            case 'direction':
                this.coms['direction'] = new SelectBox({
                    container: el,
                    select: {
                        multi: false,
                        isRadioNotchecked: false,
                        callback(index) {
                        }
                    },
                    data: [{value: 0, text: '横向'}, {value: 1, text: '纵向'}]
                });
                break;
            case 'rowSpace':
                this.coms['rowSpace'] = new NumInput({
                    container: el,
                    defaultNum: 0,
                    max: 100,
                    min: 0,
                    step: 1,
                    className: 'numInput'
                });
                break;
            case 'colSpace':
                this.coms['colSpace'] = new NumInput({
                    container: el,
                    defaultNum: 0,
                    max: 100,
                    min: 0,
                    step: 1,
                    className: 'numInput'
                });
                break;
            case 'horizontalRank':
                this.coms['horizontalRank'] = new CheckBox({
                    container: el,
                    text: '横向排列'
                });
                break;
            case 'fillMethod':
                this.coms['fillMethod'] = new CheckBox({
                    container: el,
                    text: '填空方式'
                });
                break;
            case 'printData':
                this.coms['printData'] = new SelectBox({
                    container: el,
                    select: {
                        multi: false,
                        isRadioNotchecked: false,
                        callback(index) {
                        }
                    },
                    data: [{value: 0, text: '全部数据'}, {value: 1, text: '选定数据'}]
                });
                break;
            case 'copies':
                this.coms['copies'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                break;
            case 'labelType':
                this.coms['labelType'] = new SelectInput({
                    container: el,
                    placeholder: '默认',
                    onSet: function (item, index) {
                        // self.labelType = index;
                    },
                    className: 'selectInput',
                    clickType: 0,
                    data: this.selectInputJson.printList,
                });
                break;
        }
    }

    // 生成设置对应的dom
    protected static createSettingPage(): HTMLElement{
        return <div className="setDom">
            <div className='leftSet'>
                <div className="printer" data-name="printer"/>
                <div className="port" data-name="port"/>
                <div className="scale" data-name="scale"><span>缩放</span></div>
                <div className="ratio" data-name="ratio"><span>分辨率</span></div>
                <div className="range">
                    <fieldset>
                        <legend>范围</legend>
                        <div data-name="pageRange"/>
                        <div className="inline" data-name="from"><span>从</span></div>
                        <div className="inline" data-name="to"><span>到</span></div>
                    </fieldset>
                </div>
                <div className="direction">
                    <fieldset className="col-xs-12">
                        <legend>方向</legend>
                        <div data-name="direction"/>
                    </fieldset>
                </div>
                <div className="content">
                    <fieldset className="col-xs-12">
                        <legend>内容</legend>
                        <div data-name="printData"/>
                    </fieldset>
                </div>
            </div>
            <div className='rightSet'>
                <div className="paper" data-name="paper"/>
                <div className='size'>
                    <div data-name="width"><span>宽度</span></div>
                    <div data-name="height"><span>高度</span></div>
                </div>
                <div className="pagePadding">
                    <div data-name="up"><span>上边距</span></div>
                    <div data-name="down"><span>下边距</span></div>
                    <div data-name="left"><span>左边距</span></div>
                    <div data-name="right"><span>右边距</span></div>
                </div>
                <div className="otherSetting">
                    <div data-name="horizontalRank"/>
                    <div data-name="fillMethod"/>
                    <div data-name="rowSpace"><span>行距</span></div>
                    <div data-name="colSpace"><span>列距</span></div>
                </div>
                <div className="copies" data-name="copies"><span>份数</span></div>
            </div>
        </div>
    }

    // 生成选项对应的dom
    protected static createOptionPage(): HTMLElement{
        return <div className="labelTypeDom">
            <div data-name="labelType"> <span>标签类型</span> </div>
        </div>
    }

    // 下拉框数据社会
    selectInputJson = {
        printer: [{text: '默认', value: 0}],
        port: [{text: '25', value: 25}, {text: '8080', value: 8080}],
        paper: [{value: '210.0*297.0', text: 'A4(210.0*297.0毫米)'},
            {value: '297.0*420.0', text: 'A3(297.0*420.0毫米)'},
            {value: '148.0*210.0', text: 'A5(148.0*210.0毫米)'},
            {value: '250.0*354.0', text: 'B4(250.0*354.0毫米)'},
            {value: '182.0*257.0', text: 'B5(182.0*257.0毫米)'},
            {value: '98.4*225.4', text: '9号信封(98.4*225.4毫米)'},
            {value: '104.8*241.3', text: '10号信封(104.8*241.3毫米)'},
            {value: '114.3*263.5', text: '11号信封(114.3*263.5毫米)'},
            {value: '101.6*279.4', text: '12号信封(101.6*279.4毫米)'},
            {value: '127.0*292.1', text: '14号信封(127.0*292.1毫米)'},
            {value: '215.9*330.2', text: '2开(215.9*330.2毫米)'},
            {value: '215.0*275.0', text: '4开(215.0*275.0毫米)'},
            {value: '254.0*355.6', text: '大4开(254.0*355.6毫米)'},
            {value: '215.9*279.4', text: '信纸(215.9*279.4毫米)'},
            {value: '279.4*431.8', text: '小报(279.4*431.8毫米)'},
            {value: '215.9*355.6', text: '文书(215.9*355.6毫米)'},
            {value: '139.7*215.9', text: '申明(139.7*215.9毫米)'},
            {value: '190.5*254.0', text: '公函(190.5*254.0毫米)'},
            {value: '215.9*279.0', text: '便条(215.9*279.0毫米)'},
            {value: '100.0*100.0', text: '方纸(100.0*100.0毫米)'},
            {value: 0, text: '自定义'}],
        printList: []
    };
}
