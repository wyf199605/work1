/// <amd-module name="NewCrossTabBasic"/>
import {Button} from "global/components/general/button/Button";
import {Modal} from "global/components/feedback/modal/Modal";
import dom = G.d;
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {Statistic} from "../../../global/utils/statistic";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import sys = BW.sys;
import {NewStatisticBase, resType} from "./statisticBasic";
interface CrossTabBasicPara{
    cols : R_Field[],//获取所有的列
    allData() : any[],//基于全部的数据
    selectedData() : any[],//基于选定的数据
    container : HTMLElement;//模态框所放的父容器
    paraGet() : obj//表格参数的获取
    getVisibleCol() : obj;
}
export = class NewCrossTabBasic extends NewStatisticBase{
    private modal: Modal = null;//交叉制表的模态框
    private body : HTMLElement;//交叉制表的模态框body部分
    private coms : objOf<SelectBox> = {};//存放data-type节点
    private statisticRow : any[] = [];//存放行数据
    private statisticCol : any[] = [];//存放列数据
    private statisticVal : any[] = [];//存放值数据
    constructor(private conf:CrossTabBasicPara){
        super();
        this.initModal();
        this.getSelectData();
        this.replaceDataName();
    }
    /*
     * 获取交叉制表的模态框
     * */
    private getModal(){
        return this.modal;
    }
    /*
     * 初始化弹框中需要统计的字段
     * */
    private getSelectData(){
        let statisticsRowAndColOptions = [],i,statisticsValOptions = [];
        let visibleCol = this.conf.getVisibleCol();
        for (i = 0; i < this.conf.cols.length; i++) {
            if (this.conf.cols[i].isNumber && visibleCol.indexOf(this.conf.cols[i].name) > -1) {
                statisticsValOptions.push({value:this.conf.cols[i].name,text:this.conf.cols[i].title});
            }
        }
        for (i = 0; i < this.conf.cols.length; i++) {
            if(visibleCol.indexOf(this.conf.cols[i].name) > -1) {
                statisticsRowAndColOptions.push({value: this.conf.cols[i].name, text: this.conf.cols[i].title});
            }
        }
        this.statisticRow = statisticsRowAndColOptions;
        this.statisticCol = statisticsRowAndColOptions;
        this.statisticVal = statisticsValOptions;
    }
    /*
     * 替换data-name属性为相应的节点并且将所有节点保存到coms数组中
     * */
    private initDataName(name : string,el : HTMLElement){
        let self = this;
        switch (name){
            case 'row':
                this.coms['row'] = new SelectBox({
                    container : el,
                    select : {
                        multi : true,
                        callback : function(index){
                           self.cancleSame('row',index);
                        }
                    },
                    data : this.statisticRow
                });
                break;
            case 'col':
                this.coms['col'] = new SelectBox({
                    container : el,
                    select : {
                        multi : true,
                        callback : function(index){
                            self.cancleSame('col',index);
                        }
                    },
                    data : this.statisticCol
                });
                break;
            case 'val':
                this.coms['val'] = new SelectBox({
                    container : el,
                    select : {
                        multi : true,
                        callback : function(index){
                            self.cancleSame('val' ,index);
                        }
                    },
                    data : this.statisticVal
                });
                break;
            case 'statistic_select':
                this.coms['statistic_select'] = new SelectBox({
                    container : el,
                    select : {
                        multi : false,
                        callback : function(index){}
                    },
                    data : [{value : 0,text : '基于全部数据'},{value : 1,text : '基于选定数据'}]
                });
                break;
            case 'statistic_sum':
                this.coms['statistic_sum'] = new SelectBox({
                    container : el,
                    select : {
                        multi : true,
                        callback : function(index){}
                    },
                    data : [{value : 0,text : '生成合计值'}]
                });
                break;
            // case 'statistic_fixed':
            //     this.coms['statistic_fixed'] = new SelectBox({
            //         container : el,
            //         select : {
            //             multi : true,
            //             callback : function(index){}
            //         },
            //         data : [{value : 0,text : '是否锁列'}]
            //     });
            //     this.coms['statistic_fixed'].setAll();
            //     break;
        }
    }
    /*
     * 初始化交叉制表模态框
     * */
    private initModal(){
        let self = this,
            inputBox = new InputBox(),
            savaBtn = new Button({
                key:'savaBtn',
                content: '设为默认值',
                type: 'primary',
                onClick:()=>{
                    self.modal.isShow = false;
                }
            });
        let okFun = ()=>{
            let row = <SelectBox>self.coms['row'],
                col = <SelectBox>self.coms['col'],
                val = <SelectBox>self.coms['val'],
                colsSum = self.coms['statistic_sum'],
                rowTmp = [],colTmp = [],valTmp = [],i,statistic,result;
            if(row.get().length === 0 || col.get().length === 0 || val.get().length === 0){
                Modal.alert('行,列,值不允许为空');
                return false;
            }
            for (i = 0; i < row.get().length; i++) {
                rowTmp.push(self.statisticRow[row.get()[i]].value);
            }
            for (i = 0; i < col.get().length; i++) {
                colTmp.push(self.statisticCol[col.get()[i]].value);
            }
            for (i = 0; i < val.get().length; i++) {
                valTmp.push(self.statisticVal[val.get()[i]].value);
            }
            if(self.coms['statistic_select'].get()[0] === 1){
                if(self.conf.selectedData().length === 0){
                    Modal.alert("数据为空，无法统计");
                    return;
                }
            }

            // statistic = new Statistic();
            result = Statistic.crossTable.init({
                row: rowTmp,
                col: colTmp,
                val: valTmp,
                cols: self.conf.cols,
                data: self.coms['statistic_select'].get()[0] === 0 ? self.conf.allData() : self.conf.selectedData(),
                colsSum: colsSum.get().length === 1,
                // isFixed: this.coms['statistic_fixed'].get().length === 1,
            });
            self.tableRender(result, self.conf.container,true);
            // self.modal.isShow = false;
            return false;
        };
        if(sys.isMb){
            this.modal = new Modal({
                position:'full',
                isOnceDestroy : true,
                header: '交叉制表',
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
            this.modal.bodyWrapper.parentElement.classList.add('crossTab');
        }
        else{
            this.modal = new Modal({
                className : 'crossTab',
                width : '560px',
                container : this.conf.container,
                header: '交叉制表',
                isBackground : false,
                footer: {
                    leftPanel:inputBox
                },
                isOnceDestroy : true
            });
        }
        this.modal.onOk  = okFun;
    }
    /*
     * 替换dom中含有data-name属性的节点
     * */
    private replaceDataName(){
        this.body = <HTMLElement> this.modal.bodyWrapper;
        let tpl = NewCrossTabBasic.getDom();
        this.body.innerHTML = tpl;
        dom.queryAll('[data-name]',this.body).forEach(el => {
            this.initDataName(el.dataset.name, el);

        });
    }
    /*
    * 取消选择相同的行列或者值
    * */
    private cancleSame(type : string,index : number){
        let row = <SelectBox>this.coms['row'],
            col = <SelectBox>this.coms['col'],
            val = <SelectBox>this.coms['val'],
            rowSel = <number[]>G.tools.obj.merge(true,[],row.get()),
            colSel = <number[]>G.tools.obj.merge(true,[],col.get()),
            valSel =<number[]>G.tools.obj.merge(true,[],val.get()),i;
        rowSel = G.tools.obj.toArr(rowSel);
        colSel = G.tools.obj.toArr(colSel);
        valSel = G.tools.obj.toArr(valSel);
        if(type === 'row'){
            col.set([]);
            val.set([]);
            for(i = 0;i < colSel.length;i++){
                if(this.statisticRow[index].value === this.statisticCol[colSel[i]].value){
                    colSel.splice(i,1);
                }
            }
            for(i = 0;i < valSel.length;i++){
                if(this.statisticRow[index].value === this.statisticVal[valSel[i]].value){
                    valSel.splice(i,1);
                }
            }
            col.set(colSel);
            val.set(valSel);
        }
        else if(type === 'col'){
            row.set([]);
            val.set([]);
            for(i = 0;i < rowSel.length;i++){
                if(this.statisticCol[index].value === this.statisticRow[rowSel[i]].value){
                    rowSel.splice(i,1);
                }
            }
            for(i = 0;i < valSel.length;i++){
                if(this.statisticCol[index].value === this.statisticVal[valSel[i]].value){
                    valSel.splice(i,1);
                }
            }
            row.set(rowSel);
            val.set(valSel);
        }
        else{
            row.set([]);
            col.set([]);
            for(i = 0;i < rowSel.length;i++){
                if(this.statisticVal[index].value === this.statisticRow[rowSel[i]].value){
                    rowSel.splice(i,1);
                }
            }
            for(i = 0;i < colSel.length;i++){
                if(this.statisticVal[index].value === this.statisticCol[colSel[i]].value){
                    colSel.splice(i,1);
                }
            }
            row.set(rowSel);
            col.set(colSel);
        }

    }
    /*
     * 初始化界面Dom
     * */
    private static getDom() {
        return  '<div class="row">' +
                    '<div class="col-xs-4">' +
                        '<fieldset class="col-xs-12">' +
                            '<legend>行</legend>' +
                                '<div class="statistic_row">' +
                                  '<div data-name="row"></div>'+
                                '</div>'+
                             '</legend>'+
                        '</fieldset>'+
                    '</div>'+
                    '<div class="col-xs-4">' +
                        '<fieldset class="col-xs-12">' +
                            '<legend>列</legend>' +
                                '<div class="statistic_col">' +
                                  '<div data-name="col"></div>'+
                                '</div>'+
                            '</legend>'+
                        '</fieldset>'+
                    '</div>'+
                    '<div class="col-xs-4">' +
                        '<fieldset class="col-xs-12">' +
                            '<legend>值</legend>' +
                                '<div class="statistic_val">' +
                                  '<div data-name="val"></div>'+
                                '</div>'+
                            '</legend>'+
                        '</fieldset>'+
                    '</div>'+
                '</div>'+
           '<div class="row">' +
                '<div class="col-xs-8">' +
                   '<div data-name="statistic_select" class="statistic_select"></div>'+
                '</div>'+
                '<div class="col-xs-4">' +
                    '<div data-name="statistic_sum" class="statistic_sum"></div>'+
                '</div>'+
                // '<div class="col-xs-3">' +
                // '<div data-name="statistic_fixed" class="statistic_sum"></div>'+
                // '</div>'+
            '</div>';
    }
}