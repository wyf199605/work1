/// <amd-module name="NewStatisticBasic"/>
import dom = G.d;
import {BwRule} from "../../common/rule/BwRule";
import {FormCom} from "../../../global/components/form/basic";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {Statistic} from "../../../global/utils/statistic";
import {Modal} from 'global/components/feedback/modal/Modal';
import {ModalFooter} from "../../../global/components/feedback/modal/ModalFooter";
import sys = BW.sys;
import {Button} from "../../../global/components/general/button/Button";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {ModalHeader} from "../../../global/components/feedback/modal/ModalHeader";
import {TableModule} from "../table/tableModule";
import {NewStatisticBase} from "./statisticBasic";
import {ITableCol} from "../../../global/components/newTable/base/TableBase";
interface StatisticBasicPara {
    cols : ITableCol[];//获取所有的列
    container : HTMLElement;//模态框所放的父容器
    colDataGet(data : string) : any[];//根据列名获取列所有数据
    // paraGet() : obj//表格参数的获取
    getVisibleCol() : obj;
}

// declare const tablePageObj:PcTablePage;
export = class NewStatisticBasic extends NewStatisticBase{
    private modal: Modal = null;//统计表的模态框
    private body : HTMLElement;//统计表的模态框body部分
    private coms : objOf<FormCom> = {};//存放data-type节点
    private statisticsContent : any[] = [];//存放内容
    private statisticsField : any[] = [];//存放统计字段
    private statisticsRange : any[] = [];//存放范围
    private groupingField : any[] = [];//存放分组字段
    private lastIndex : number; //存放上次禁止的复选框
    constructor(private para : StatisticBasicPara){
        super();
        this.initModal();
        this.getSelectData();
        this.replaceDataName();
    }
    /*
     * 获取统计表的模态框
     * */
    private getModal(){
        return this.modal;
    }
    /*
     * 初始化弹框中需要统计的字段
     * */
    private getSelectData(){
        let statisticsOptions = [],i,groupingOptions = [];
        let visibleCol = this.para.getVisibleCol();
        for (i = 0; i < this.para.cols.length; i++) {
            if (this.para.cols[i].isNumber && visibleCol.indexOf(this.para.cols[i].name) > -1) {
                statisticsOptions.push({value:this.para.cols[i].name,text:this.para.cols[i].title});
            }
        }
        for (i = 0; i < this.para.cols.length; i++) {
            if(visibleCol.indexOf(this.para.cols[i].name) > -1) {
                groupingOptions.push({value: this.para.cols[i].name, text: this.para.cols[i].title});
            }
        }
        this.groupingField = groupingOptions;
        this.statisticsField = statisticsOptions;
        this.statisticsContent = [{value : 'sum',text : '合计值'},
            {value : 'avg',text : '平均值'},
            {value : 'max',text : '最大值'},
            {value : 'min',text : '最小值'},
            {value : 'stDev',text : '标准差'},
            {value : 'nullCount',text : '空值数'},
            {value : 'percent',text : '百分比'},
            {value : 'groupPercent',text : '组内百分比'}];
        this.statisticsRange = [{value : '0',text : '全部数据'},
            {value : '1',text : '选定数据'}];
    }
    /*
     * 替换data-name属性为相应的节点并且将所有节点保存到coms数组中
     * */
    private initDataName(name : string,el : HTMLElement){
        let self = this;
        switch (name){
            case 'statisticsContent':
                this.coms['statisticsContent'] = new SelectBox({
                    container : el,
                    select : {
                        multi : true,
                        callback : function(index){
                            let statisticsContent = <SelectBox>self.coms['statisticsContent'];
                            function contains(val){
                                 for(let i = 0;i < statisticsContent.get().length; i++){
                                     if(statisticsContent.get()[i] === val){
                                         return true;
                                     }
                                 }
                                 return false;
                            }
                            if(index === 6){
                                statisticsContent.unSet([7]);
                                if(contains(6)){
                                    statisticsContent.unsetDisabled([7]);
                                }
                                else{
                                    statisticsContent.setDisabled([7]);
                                }
                            }
                        }
                    },
                    data : this.statisticsContent
                });
                break;
            case 'statisticsField':
                if(this.statisticsField.length > 0){
                    this.coms['statisticsField'] = new SelectBox({
                        container : el,
                        select : {
                            multi : true
                        },
                        data : this.statisticsField
                    });
                }
                else {
                    el.innerHTML = "无可统计的字段";
                }
                break;
            case 'statisticsRange':
                this.coms['statisticsRange'] = new SelectBox({
                    container : el,
                    select : {
                        multi : false
                    },
                    data : this.statisticsRange
                });
                break;
            case 'groupingField':
                if(this.statisticsField.length > 0) {
                    this.coms['groupingField'] = new SelectBox({
                        container: el,
                        select: {
                            multi: false,
                            isRadioNotchecked : true,
                            callback : function(index){
                                function getIndex(){
                                    for(let i = 0;i < self.statisticsField.length; i++){
                                        if(self.statisticsField[i].value === self.groupingField[index].value){
                                                    return i;
                                        }
                                    }
                                }
                                let statisticsField = <SelectBox>self.coms['statisticsField'],
                                     statisticsContent = <SelectBox>self.coms['statisticsContent'],
                                    groupingField = <SelectBox>self.coms['groupingField'];
                                if(self.lastIndex >= 0){
                                    statisticsField.unsetDisabled([self.lastIndex])
                                }
                                if(getIndex() >= 0){
                                    statisticsField.unSet([getIndex()]);
                                    statisticsField.setDisabled([getIndex()]);
                                    self.lastIndex = getIndex();
                                }
                                statisticsContent.unSet([1,2,3,4,5]);
                                if(groupingField.get().length > 0){
                                    statisticsContent.setDisabled([1,2,3,4,5]);
                                    statisticsContent.unsetDisabled([6]);

                                }
                               else{
                                    statisticsContent.unSet([1,2,3,4,5,6,7]);
                                    statisticsContent.unsetDisabled([1,2,3,4,5]);
                                    statisticsContent.setDisabled([6]);
                                    if(self.lastIndex >= 0){
                                        statisticsField.unsetDisabled([self.lastIndex])
                                    }

                                }

                            }
                        },
                        data: this.groupingField
                    });
                }
                else {
                    el.innerHTML = "无可统计的字段";
                }
                break;
        }
    }
    /*
     * 初始化统计表模态框
     * */
    private initModal(){
        let self = this;
        let okFun = () => {
            if (self.statisticsField.length === 0) {
                return false;
            }
            let stats = [], i = 0, cols = [], result,
                statisticsContent = self.coms['statisticsContent'].get(),
                statisticsField = self.coms['statisticsField'].get(),
                groupingField = '';
            for (i = 0; i < statisticsContent.length; i++) {
                if (statisticsContent[i] === 7) {
                    statisticsContent.splice(i, 1);
                }
            }
            if (self.coms['groupingField'].get().length > 0) {
                groupingField = self.groupingField[self.coms['groupingField'].get()[0]].value;
            }
            for (i = 0; i < statisticsContent.length; i++) {
                stats.push({
                    title: NewStatisticBasic.mathMethodCn[self.statisticsContent[statisticsContent[i]].value],
                    method: Statistic.math[self.statisticsContent[statisticsContent[i]].value]
                })
            }
            for (i = 0; i < statisticsField.length; i++) {
                cols.push(self.statisticsField[self.coms['statisticsField'].get()[i]].value)
            }
            result = self.colStatistic(cols, stats, groupingField);
            self.tableRender(result,self.para.container);
            return false;
        };
        if(sys.isMb){
            this.modal = new Modal({
                header: '统计',
                position:'full',
                isOnceDestroy: true,
                // isMb: false,
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
            this.modal.bodyWrapper.parentElement.classList.add('statistic');
        }
        else {
            this.modal = new Modal({
                header: '统计',
                className: 'statistic',
                width: '560px',
                container: this.para.container,
                isBackground: false,
                footer: {},
                isOnceDestroy: true
            });
        }
        this.modal.onOk = okFun;
    }
    /*
     * 替换dom中含有data-name属性的节点
     * */
    private replaceDataName(){
        this.body = <HTMLElement> this.modal.bodyWrapper;
        let tpl = NewStatisticBasic.getDom();
        this.body.innerHTML = tpl;
        dom.queryAll('[data-name]',this.body).forEach(el => {
            this.initDataName(el.dataset.name,el);
        });
        let statisticsContent = <SelectBox>this.coms['statisticsContent'];
        statisticsContent.setDisabled([6,7]);
    }
    /*
    * 获取某一列在表格数据中的序号
    * */
    private colName2index(col){
            for(let i = 0;i < this.para.cols.length; i++){
                if(this.para.cols[i].name === col){
                    return i;
                }
            }
    }
    /*
    * 统计过程
    * */
    private colStatistic(cols: string[], stats: { title: string, method: (nums: number[]) => number }[], groupCol: string) {
        let self = this,
            confCols: Array<any> = cols.map((col) => self.para.cols[self.colName2index(col)]), // 参数 cols
            colsData: any[][] = cols.map((col) => self.para.colDataGet(col)),
            groupColData: { [any: string]: any[][] } = {},
            statConf: any = {
                cols: null,
                data: null,
                // beforeShow: self.conf.beforeShow
            };
        if (groupCol) {
            // 用分组的数据作为键值
            let groupConfCol = self.para.cols [self.colName2index(groupCol)];
            self.para.colDataGet(groupCol).forEach((data, i) => {
               // data = <string>data;
               let colData: any[][] = cols.map((col, j) => {
                    return colsData[j][i];
                });
                if (!(<any>data in groupColData)) {
                    groupColData[<any>data] = [];
                }

                if (!groupColData[<any>data][0]) {
                    groupColData[<any>data] = colData.map((cd) => [cd]);
                } else {
                    groupColData[<any>data].forEach((arr, i) => {
                        arr.push(colData[i]);
                    });
                }
            });

          let totalArr = [];
            for (let col in groupColData) {
                let i = 0;
                groupColData[col].map((data) => {
                    if(!totalArr[i]){
                        totalArr[i] = 0;
                    }
                    totalArr[i] = totalArr[i] + Statistic.math.sum(data);
                    i++;
                });
            }
            for (let col in groupColData) {
                if (!groupColData.hasOwnProperty(col)) {
                    continue;
                }
                let j = -1;
                groupColData[col] = groupColData[col].map((data) => {
                    return stats.map((stat) =>
                    {
                        if(stat.title !== '百分比'){
                            return stat.method(data)
                        }
                        else{
                            j++;
                            return Statistic.math.percent(data,totalArr[j]);
                        }
                    });
                });

            }

            statConf.cols = [groupConfCol].concat((function () {
                let newCols = [];
                confCols.forEach((confCol) => {
                    stats.forEach((stat) => {
                        let tmpConfCol: COL = G.tools.obj.copy(confCol);
                        tmpConfCol.title = tmpConfCol.title + stat.title;
                        tmpConfCol.name = tmpConfCol.name + stat.title;
                        if(tmpConfCol.name.match('百分比')){
                            tmpConfCol.dataType = BwRule.DT_PERCENT;
                        }
                        newCols.push(tmpConfCol);
                    })
                });
                return newCols;
            })());

            statConf.data = (function () {
                let data = [];
                Object.keys(groupColData).forEach((groupData) => {
                    let d: any = {};
                    d[groupCol] = groupData;
                    groupColData[groupData].forEach((statData, colIndex) => {

                        stats.forEach((stat, statIndex) => {
                            d[confCols[colIndex].name + stat.title] = statData[statIndex];
                        });

                    });
                    data.push(d);
                });
                return data;
            })();
        }
        else {
            statConf.cols = [{title: '统计', name: '_method'}].concat(confCols);

            statConf.data = stats.map((stat) => {
                let data = {'_method': stat.title};
                // data['_method'] = stat.title;
                colsData.forEach((dataArr, i) => {
                    data[cols[i]] = stat.method(dataArr.slice(0));
                });
                return data;
            });
        }
        return statConf;
    }
    /*
     * 初始化界面Dom
     * */
    private static getDom() {
        return '<div class="row">' +
            '<div class="col-xs-5">' +
            '<fieldset class="col-xs-12">' +
            '<legend>内容</legend>' +
            '<div class="statisticsContent">' +
            '<div data-name="statisticsContent"></div>' +
            '</div>' +
            '</fieldset>' +
            '<fieldset class="col-xs-12">' +
            '<legend>范围</legend>' +
            '<div class="statisticsRange">' +
            '<div data-name="statisticsRange"></div>' +
            '</div>' +
            '</fieldset>' +
            '</div>' +
            '<fieldset class="col-xs-3">' +
            '<legend>统计字段</legend>' +
            '<div class="statisticsField">' +
            '<div data-name="statisticsField"></div>' +
            '</div>' +
            '</fieldset>' +
            '<fieldset class="col-xs-3 groupingField_grouping">' +
            '<legend>分组字段</legend>' +
            '<div class="groupingField">' +
            '<div data-name="groupingField"></div>' +
            '</div>' +
            '</fieldset>' +
            '</div>';
    }
    static mathMethodCn = {
        'sum' : '合计值',
        'avg' : '平均值',
        'max' : '最大值',
        'min' : '最小值',
        'stDev' : '标准差',
        'nullCount' : '空值数',
        'percent' : '百分比',
        'groupPercent' : '组内百分比',
    }
}
