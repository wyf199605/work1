/// <amd-module name="AnalysisBasic"/>
import dom = G.d;
import tools = G.tools;
import {FormCom} from "../../../global/components/form/basic";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {Statistic} from "../../../global/utils/statistic";
import {TextInput} from "../../../global/components/form/text/text";
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "global/components/feedback/modal/Modal";
import {Button} from "global/components/general/button/Button";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";

import {StatisticBase} from "./statisticBasic";

interface AnalysisBasicPara {
    cols: R_Field[],//获取所有的列
    allData(): any[],//基于全部的数据
    selectedData(): any[],//基于选定的数据
    container: HTMLElement;//模态框所放的父容器
    paraGet(): obj//表格参数的获取
    getVisibleCol() : obj;
}

export = class AnalysisBasic extends StatisticBase{
    private modal: Modal = null;//ABC分析的模态框
    private body: HTMLElement;//ABC分析的模态框body部分
    private coms: objOf<FormCom> = {};//存放data-type节点
    private statisticClassify: any[] = [];//存放所有分类数据
    private statisticValue: any[] = [];//存放所有值的数据
    constructor(private conf: AnalysisBasicPara) {
        super();
        this.initModal();
        this.getSelectData();
        this.replaceDataName();
    }

    /*
    * 获取ABC分析的模态框
    * */
    private getModal() {
        return this.modal;
    }

    /*
    * 初始化弹框中需要统计的字段
    * */
    private getSelectData() {
        let statisticsClassifyOptions = [], i, statisticsValueOptions = [];
        let visibleCol = this.conf.getVisibleCol();
        for (i = 0; i < this.conf.cols.length; i++) {
            if (BwRule.isNumber(this.conf.cols[i].dataType) && visibleCol.indexOf(this.conf.cols[i].name) > -1) {
                statisticsValueOptions.push({value: this.conf.cols[i].name, text: this.conf.cols[i].title});
            }
        }
        for (i = 0; i < this.conf.cols.length; i++) {
            if(visibleCol.indexOf(this.conf.cols[i].name) > -1) {
                statisticsClassifyOptions.push({value: this.conf.cols[i].name, text: this.conf.cols[i].title});
            }
        }
        this.statisticClassify = statisticsClassifyOptions;
        this.statisticValue = statisticsValueOptions;
    }

    /*
    * 初始化ABC分析表模态框
    * */
    private initModal() {
        let self = this,
            inputBox = new InputBox(),
            savaBtn = new Button({
                content: '设为默认值',
                key: 'savaBtn',
                type: 'primary',
                onClick: () => {
                    this.modal.isShow = false;
                }
            });
        inputBox.addItem(savaBtn);

        let okFun = ()=>{
            let proport = <SelectBox>self.coms['proport'],
                statistic_select = <SelectBox>self.coms['statistic_select'],
                statistic_showClass = <SelectBox>self.coms['statistic_showClass'],
                result, statistic, statisticResult;
            statisticResult = self.getUserInput();
            if (statisticResult && statistic_select.get()[0] === 1) {
                statisticResult.data = self.conf.selectedData();
            }
            if (!self.checkIsOk(statisticResult)) {
                return false;
            }
            statistic = new Statistic();
            result = statistic.abc(statisticResult);
            self.tableRender(result,self.conf.container);
            // self.modal.isShow = false;
            return false;
        };

        if(tools.isMb){
            this.modal = new Modal({
                position:'full',
                isOnceDestroy : true,
                body: G.d.create(`<div>${AnalysisBasic.getDom()}</div>`),
                header: 'abc分析'
            });
            this.modal.modalHeader.rightPanel =(()=>{
                let rightInputBox = new InputBox(),
                    okBtn = new Button({
                        key:'okBtn',
                        content: '确认',
                        type: 'primary',
                        onClick:okFun
                    });
                rightInputBox.addItem(okBtn);
                return rightInputBox;
            })();
            this.modal.bodyWrapper.setAttribute('style','height:calc(100vh - 44px);');
            this.modal.bodyWrapper.parentElement.classList.add('analysis');
        } else {
            this.modal = new Modal({
                className: 'analysis',
                container: this.conf.container,
                header: 'ABC分析',
                body: G.d.create(`<div>${AnalysisBasic.getDom()}</div>`),
                isBackground: false,
                footer: {
                    leftPanel: inputBox
                },
                isOnceDestroy: true
            });
        }
        this.modal.onOk = okFun;
    }



    /*
    * 替换data-name属性为相应的节点并且将所有节点保存到coms数组中
    * */
    private initDataName(name: string, el: HTMLElement) {
        let self = this;
        switch (name) {
            case 'classify':
                this.coms['classify'] = new SelectBox({
                    container: el,
                    select: {
                        multi: false,
                        callback: function (index) {

                        }
                    },
                    data: this.statisticClassify
                });
                break;
            case 'value':
                this.coms['value'] = new SelectBox({
                    container: el,
                    select: {
                        multi: false,
                        callback: function (index) {

                        }
                    },
                    data: this.statisticValue
                });
                break;
            case 'proport':
                this.coms['proport'] = new SelectBox({
                    container: el,
                    select: {
                        multi: false,
                        callback: function (index) {

                        }
                    },
                    data: [{value: 0, text: '自动查找'}, {value: 1, text: '手工设置'}]
                });
                break;
            case 'aClass':
                this.coms['aClass'] = new TextInput({
                    container: el
                });
                break;
            case 'bClass':
                this.coms['bClass'] = new TextInput({
                    container: el
                });
                break;
            case 'statistic_select':
                this.coms['statistic_select'] = new SelectBox({
                    container: el,
                    select: {
                        multi: false,
                        callback: function (index) {
                        }
                    },
                    data: [{value: 0, text: '基于全部数据'}, {value: 1, text: '基于选定数据'}]
                });
                break;
        /*    case 'statistic_showClass':
                this.coms['statistic_showClass'] = new SelectBox({
                    container: el,
                    select: {
                        multi: true,
                        callback: function (index) {
                        }
                    },
                    data: [{value: 0, text: '显示每一类的列表'}]
                });
                break;*/
        }
    }

    /*
    * 判断用户输入是否合法
    * */
    private checkIsOk(statisticResult: obj = {}) {
        let aClass = <TextInput>this.coms['aClass'],
            bClass = <TextInput>this.coms['bClass'];
        if (isNaN(parseInt(aClass.get()))) {
            Modal.alert("A类不允许为空或字符串");
            return false;
        }
        else if (parseInt(aClass.get()) > 99 || parseInt(aClass.get()) < 0) {
            Modal.alert("A类输入范围为0-99");
            return false;
        }
        else if (isNaN(parseInt(bClass.get()))) {
            Modal.alert("B类不允许为空或字符串");
            return false;
        }
        else if (parseInt(bClass.get()) > 99 || parseInt(bClass.get()) < 0) {
            Modal.alert("B类输入范围为0-99");
            return false;
        }
        else if (parseInt(bClass.get()) < parseInt(aClass.get())) {
            Modal.alert("B类范围不可小于A类");
            return false;
        }
        else if (statisticResult.data.length === 0) {
            Modal.alert("数据为空，无法统计");
            return false;
        }
        else if (statisticResult.a > statisticResult.b) {
            Modal.alert("A类不可高于B类");
            return false;
        }
        return true;
    }

    /*
    * 替换dom中含有data-name属性的节点
    * */
    private replaceDataName() {
        this.body = <HTMLElement> this.modal.bodyWrapper;
        // let tpl = AnalysisBasic.getDom();
        let self = this;
        // this.body.innerHTML = tpl;
        dom.queryAll('[data-name]', this.body).forEach(el => {
            this.initDataName(el.dataset.name, el);
        });
        let aClass = <TextInput>this.coms['aClass'],
            bClass = <TextInput>this.coms['bClass'],
            aInput = <HTMLInputElement>aClass['wrapper'].firstChild,
            bInput = <HTMLInputElement>bClass['wrapper'].firstChild;
        aInput.value = '65';
        bInput.value = '85';
        aClass.on('blur', function () {
            aClass.get() !== '' && (dom.query('.bFirst', self.body).innerText = aClass.get());
        });
        bClass.on('blur', function () {
            bClass.get() !== '' && (dom.query('.cFirst', self.body).innerText = bClass.get());
        })
    }

    /*
    * 获取用户输入
    * */
    private getUserInput() {
        let classify = <SelectBox>this.coms['classify'],
            value = <SelectBox>this.coms['value'],
            bClass = <TextInput>this.coms['bClass'],
            aClass = <TextInput>this.coms['aClass'],
            i;
        if (value.get().length > 0 && aClass.get() && bClass.get()) {
            return {
                classify: this.statisticClassify[classify.get()[0]].value,
                val: this.statisticValue[value.get()[0]].value,
                a: parseInt(aClass.get()),
                b: parseInt(bClass.get()),
                cols: this.conf.cols,
                data: this.conf.allData()
            };
        }
        return false;
    }

    /*
    * 初始化界面Dom
    * */
    private static getDom() {
        return '<div class="row">' +
            '<div class="col-xs-4">' +
            '<fieldset class="col-xs-12">' +
            '<legend>分类</legend>' +
            '<div class="statistic_classify">' +
            '<div data-name="classify"></div>' +
            '</div>' +
            '</legend>' +
            '</fieldset>' +
            '</div>' +
            '<div class="col-xs-4">' +
            '<fieldset class="col-xs-12">' +
            '<legend>值</legend>' +
            '<div class="statistic_value">' +
            '<div data-name="value"></div>' +
            '</div>' +
            '</legend>' +
            '</fieldset>' +
            '</div>' +
            '<div class="col-xs-4">' +
            '<fieldset class="col-xs-12">' +
            '<legend>占比段</legend>' +
            '<div class="statistic_proport">' +
            '<div data-name="proport"></div>' +
            '<div class = "aClass" data-name="aClass"><span>A类:<span>0%-</span></span></div>' +
            '<div class = "bClass" data-name="bClass"><span>B类:<span><span class="bFirst">65</span>%-</span></span></div>' +
            '<div class = "cClass"><span>C类:<span><span class="cFirst">85</span>%-100%</span></span></div>' +
            '</div>' +
            '</legend>' +
            '</fieldset>' +
            '</div>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-xs-8">' +
            '<div data-name="statistic_select" class="statistic_select"></div>' +
            '</div>' +
           /* '<div class="col-xs-4">' +
            '<div data-name="statistic_showClass" class="statistic_showClass"></div>' +
            '</div>' +*/
            '</div>';
    }
}