/// <amd-module name="ChartBasic" />
/// <amd-dependency path="echarts" name="echarts"/>
import {Modal} from "global/components/feedback/modal/Modal";
import tools = G.tools;
import dom = G.d;
import {FormCom} from "../../../global/components/form/basic";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {Echart} from "../../../global/utils/echart";
import {Button} from "../../../global/components/general/button/Button";
import d = G.d;
import sys = BW.sys;
import CONF = BW.CONF;
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {BwRule} from "../../common/rule/BwRule";
declare const echarts;
interface  EChartPara{
    container? : HTMLElement;
    cols? : R_Field[];
    allData() : any[];//基于全部的数据
    selectedData() : any[];//基于选定的数据
    colDataGet(data : string) : obj[];
    getTablePara() : obj;
    getWrapper() : HTMLElement;//获取当前图形报表按钮的容器
    getVisibleCol() : obj;
}
export = class ChartBasic{
    private modal : Modal;
    private body : HTMLElement;
    private coms : objOf<FormCom> = {};//存放data-type节点
    private chartType: any[] = [];//存放图形的类型数组
    private chartRow : any[] = [];//存放横坐标的类型数组
    private chartCol : any[] = [];//存放纵坐标的类型数组
    private myChart : any;//存放产生的echart表格实例
    private isPie : boolean = false;//判断是否为饼状图
    private isLarge : boolean = true;//判断是否放大图形
    private hasLinkCol : obj = {};//存放钻取数据的链接列
    constructor(private para : EChartPara){
        this.initModal();
        this.getSelectData();
        this.replaceDataName();
        let allData = para.allData();
        let keyField = this.para.getTablePara().keyField;
        for(let i = 0;i < allData.length;i++){
            this.getLinkCol(allData[i],keyField);
        }
    }
    /**
     * 获取表格中的统计字段
     */
    private getSelectData(){
        let visibleCol = this.para.getVisibleCol();
        let statisticsRow = [],i,statisticsCol = [];
        for (i = 0; i < this.para.cols.length; i++) {
            if (BwRule.isNumber(this.para.cols[i].dataType) && visibleCol.indexOf(this.para.cols[i].name) > -1) {
                statisticsCol.push({value:this.para.cols[i].name,text:this.para.cols[i].title});
            }
        }
        for (i = 0; i < this.para.cols.length; i++) {
            if(visibleCol.indexOf(this.para.cols[i].name) > -1){
                statisticsRow.push({value:this.para.cols[i].name,text:this.para.cols[i].title});
            }
        }
        this.chartRow = statisticsRow;
        this.chartCol = statisticsCol;

        this.chartType = [{value : 0,text : '折线图'},
                            {value : 1,text : '柱形图'},
                            {value : 2,text : '饼图'},
                            {value : 3,text : '面积图'},
                            ];
    }
    /**
     * 初始化弹框
     */
    private initModal(){
        let self = this,
            inputBox = new InputBox(),
            okBtn = new Button({
                key:'okBtn',
                content: '确认',
                type: 'primary',
                onClick:()=>{

                    let doSta = true;
                    if(this.chartCol.length === 0){
                        Modal.toast('纵坐标无统计字段，无法统计');
                        doSta = false;
                    }
                    if((<SelectBox>this.coms['col']).get().length===0){
                        Modal.toast('请选择至少一个纵坐标');
                        doSta = false;
                    }
                    if((this.coms['range'].get()[0] ? this.para.selectedData().length : this.para.allData().length)===0){
                        Modal.toast('无可统计数据，请重新选择');
                        doSta = false;
                    }
                    if(doSta) {
                        this.modal.isShow = false;
                        let isDrill = ['web', 'webdrill', 'drill'].indexOf(this.para.getTablePara().uiType) > -1;
                        //如果是钻取则初始化钻取的按钮（图形统计，返回表格）
                        if (isDrill) {
                            let wrapper = this.para.getWrapper(),
                                wrapperParent = sys.isMb ? <HTMLElement>d.closest(wrapper,'li') : wrapper.parentElement,
                                child, echartBody, tableBut, fullScreenBut;
                            child = d.query('.mobileTableWrapper', wrapper);
                            child.style.display = 'none';
                            echartBody = document.createElement('div');
                            echartBody.className = 'Echart_body';
                            echartBody.style.height = sys.isMb ? '82vh' : '450px';
                            echartBody.style.width = sys.isMb ? '700px' : wrapper.offsetWidth + 'px';
                            let hasChart = d.query('.Echart_body', wrapper);
                            if (hasChart) {
                                wrapper.removeChild(hasChart);
                            }
                            wrapper.appendChild(echartBody);
                            let chartType = <SelectBox>self.coms['type'],
                                jsonData = self.getChartInput();
                            self.generateGraph(echartBody, chartType.get()[0], jsonData);
                            echartBody.style.background = 'white';

                            tableBut = <HTMLElement>d.query('.statisticsChart', wrapperParent).lastChild;
                            tableBut.style.display = 'inline-block';

                            //处理电脑端放大之后的图形统计重新渲染事件
                            let firstHeight = wrapperParent.offsetHeight;
                            fullScreenBut = d.query('.panel-tools', wrapperParent.parentElement);
                            fullScreenBut && d.on(fullScreenBut, 'click', '.panel-heading', (e) => {
                                setTimeout(() => {
                                    let parEle = wrapperParent.parentElement,
                                        hasFull = parEle.classList.contains('is-fullscreen');
                                    let shouldHeight = firstHeight > parEle.offsetHeight ? firstHeight : parEle.offsetHeight;
                                    let tempWidth = parEle.offsetWidth + 'px';
                                    let tempHeight = hasFull ? shouldHeight - d.query('.panel-heading', parEle).offsetHeight : firstHeight;
                                    echartBody.style.width = tempWidth;
                                    echartBody.style.height = tempHeight + 'px';
                                    parEle.style.overflowY = 'scroll';
                                    parEle.style.overflowX = 'hidden';
                                    this.myChart.resize();
                                }, 0);
                            });
                        }
                        else if(!isDrill && sys.isMb){
                            require(['Modal','Button'], function(M,B){
                                let chartBody = d.create('<div class="Echart_body" style="width: 100vw; height: calc(100vh - 44px); overflow-x: hidden;"></div>');
                                let m = new M.Modal({
                                    position:'full',
                                    body:chartBody,
                                    isOnceDestroy: true
                                });
                                m.body.parentElement.parentElement.classList.add('myChart');
                                m.body.parentElement.style.maxHeight = 'none';
                                m.body.parentElement.setAttribute('style','height:calc(100vh - 44px);');
                                let chartType = <SelectBox>self.coms['type'],
                                    jsonData = self.getChartInput();
                                self.generateGraph(m.body, chartType.get()[0], jsonData);
                            })
                        }
                        //否则初始化图形统计的弹框显示
                        else {
                            let tempModal = new Modal({
                                className: 'tempModal',
                                body: dom.create(`<div class="Echart_body" style="height:450px; width: 700px;"></div>`),
                                container: self.para.container,
                                isOnceDestroy: true,
                                isBackground: false,
                                onLarge: () => {
                                    let cacheModal = d.query('.tempModal', document.body),
                                        cacheHeader = d.query('.head-wrapper', cacheModal),
                                        cacheEchart = d.query('.Echart_body', cacheModal),
                                        lHeight = cacheModal.offsetHeight - cacheHeader.offsetHeight,
                                        lWidth = cacheModal.offsetWidth - 40,
                                        echartSty = cacheEchart.style,
                                        echartParSty = cacheEchart.parentElement.style;
                                    if (this.isLarge) {
                                        echartParSty.height = lHeight + 'px';
                                        echartParSty.maxHeight = 'none';
                                    }
                                    else {
                                        echartSty.width = '700px';
                                        echartParSty.height = '500px';
                                    }
                                    if (this.isLarge && !this.isPie) {
                                        echartSty.width = lWidth + 'px';
                                        echartSty.height = lHeight + 'px';
                                        this.isLarge = false;
                                    }
                                    else if (!this.isLarge && !this.isPie) {
                                        echartSty.height = '450px';
                                        this.isLarge = true;
                                    }
                                    else if (this.isLarge && this.isPie) {
                                        echartSty.width = lWidth + 'px';
                                        this.isLarge = false;
                                    }
                                    else if (!this.isLarge && this.isPie) {
                                        this.isLarge = true;
                                    }
                                    this.myChart.resize();
                                },
                                header:{
                                    title : '统计结果',
                                    isFullScreen: true
                                }
                            });

                            let chartType = <SelectBox>self.coms['type'],
                                jsonData = self.getChartInput();
                            self.generateGraph(tempModal.body, chartType.get()[0], jsonData);
                        }
                    }
                }
            });
        inputBox.addItem(okBtn);
        if(sys.isMb){
                this.modal = new Modal({
                    header: '图表统计',
                    position:'full',
                    container: this.para.container,
                    isOnceDestroy : true
                });

                this.modal.modalHeader.rightPanel =inputBox;
                 this.modal.bodyWrapper.parentElement.classList.add('myChart');
        }
        else {
            this.modal = new Modal({
                header: '图表统计',
                container: this.para.container,
                className: 'echart',
                width: sys.isMb ? null : '500px',
                isBackground: false,
                footer: {
                    rightPanel: inputBox
                }
            });
        }
    }
    /**
     * 内部方法由initHtmlTpl调用
     * @param {string} name
     * @param {HTMLElement} el
     */
    private initHtmlTpl(name : string,el : HTMLElement){
        let self = this;
        switch (name){
            case 'type':
                this.coms['type'] = new SelectBox({
                    container : el,
                    select : {
                        multi : false,
                        callback : function(index){}
                    },
                    data : this.chartType
                });
                break;
            case 'row':
                this.coms['row'] = new SelectInput({
                    container : el,
                    data : this.chartRow,
                    onSet : function(item,index){
                    },
                    className : 'selectInput',
                    clickType : 1,
                    readonly : true
                });
                break;
            case 'col':
                this.coms['col'] = new SelectBox({
                    container : el,
                    select : {
                        multi : true,
                        callback : function(index){
                            let tempType = self.getDataType(self.chartCol[index].text),
                                      col = <SelectBox>self.coms['col'],i;
                            if(tempType === BwRule.DT_DATETIME || tempType === BwRule.DT_TIME){
                                  for(i = 0;i < self.chartCol.length;i++){
                                      let tempType2 = self.getDataType(self.chartCol[i].text);
                                      if(tempType2 != BwRule.DT_DATETIME && tempType2 != BwRule.DT_TIME){
                                          col.unSet([i]);
                                      }
                                  }
                            }
                            else{
                                for(i = 0;i < self.chartCol.length;i++){
                                    let tempType2 = self.getDataType(self.chartCol[i].text);
                                    if(tempType2 === BwRule.DT_DATETIME || tempType2 === BwRule.DT_TIME){
                                        col.unSet([i]);
                                    }
                                }
                            }
                        }
                    },
                    data : this.chartCol
                });
                let moneyArr = [];
                for(let i = 0;i < this.chartCol.length;i++){
                    if(self.getDataType(this.chartCol[i].text) === BwRule.DT_MONEY){
                        moneyArr.push(i);
                    }
                }
                this.coms['col'].set(moneyArr);
                break;
            case 'range':
                this.coms['range'] = new SelectBox({
                    container : el,
                    select : {
                        multi : false,
                        callback : function(index){}
                    },
                    data : [{value : 0,text : '全部数据'},{value : 1,text : '选定数据'}]
                });
                break;
        }
    }
    /**
     * 替换data-name为具体的节点
     */
    private replaceDataName(){
        this.body = <HTMLElement>this.modal.bodyWrapper;
        let tpl = this.htmlTpl();
        this.body.innerHTML = tpl;
        dom.queryAll('[data-name]',this.body).forEach(el => {
            this.initHtmlTpl(el.dataset.name,el);
        });
        let row = <SelectInput>this.coms['row'];
        this.chartRow[0]&&row.set(this.chartRow[0].value);
    }
    /**
     * 调用echart插件方法，生成对应图表
     * @param parentEle
     * @param type
     * @param para
     */
    private generateGraph(parentEle,type,para){
         this.myChart = echarts.init(parentEle);
         let option = this.generateChartOption[type].call(this,para) , chartHeight;
        if(option.series[0]&&(option.series[0].type==='pie')){
            parentEle.parentElement.style.overflowY = 'scroll';
            parentEle.parentElement.parentElement.style.overflowY = 'scroll';
            chartHeight = 400;
            parentEle.style.height = chartHeight*option.series.length+ 'px';
            this.isPie = true;
            this.myChart.resize();
        }
        else{
            this.isPie = false;
        }
        this.isLarge = true;
        this.myChart.setOption(option);
        this.myChart.on('click',  (params)=>{
            let hasLink = false;
            let getDetail = (fn)=>{
                let i,key;
                for(key in this.hasLinkCol){
                    for(i = 0;i < this.hasLinkCol[key].length;i++){
                        if(this.hasLinkCol[key][i].name == params.value){
                            fn(this.hasLinkCol[key][i].src);
                            break;
                        }
                    }
                }
            };
            if(sys.isMb) {
                getDetail(()=>{
                    hasLink = true;
                });
                let removeDiv = d.query('.detailDiv', parentEle);
                removeDiv && parentEle.removeChild(removeDiv);
                let val = params.value;
                if(params.seriesName) {
                    val = BwRule.formatText(params.value, this.getCols(params.seriesName), false);
                }
                let divInner;
                if (params.componentType === 'xAxis') {
                    divInner = `<p style="color:white; margin:0 0;">${params.value}</p> `;
                }
                else {
                    divInner = `<p style="color:white; margin:0 0;">${params.name}</p>
                            <p style="color:white; margin:0 0;">${params.seriesName}:${val}</p>
                            `;
                }
                let tempDiv = document.createElement("div");
                tempDiv.className = 'detailDiv';
                tempDiv.setAttribute('style', `top:${params.event.offsetY - 55}px;left:${params.event.offsetX+10}px`);
                tempDiv.innerHTML = divInner;
                if(hasLink) {
                    let but = document.createElement('p');
                    but.setAttribute('style', 'color:white;text-align:center;');
                    but.innerHTML = '点击查看>>';
                    tempDiv.appendChild(but);
                    d.on(but, 'click', (e) => {
                        getDetail((para)=>{
                            let tempUrl = CONF.siteUrl + para;
                            sys.window.open({url:tempUrl});
                        });
                    });
                }
                parentEle.appendChild(tempDiv);
            }
            else{
                getDetail((para)=>{
                    let tempUrl = CONF.siteUrl + para;
                    sys.window.open({url:tempUrl});
                });
            }
        });

    }
    /**
     * 模态框html模版
     * @returns {string}
     */
    private htmlTpl(){
           return     '<div class="EChart_tabFirst">' +
                           '<div class="row">' +
                            '<div class="col-xs-4">' +
                                '<fieldset>' +
                                '<legend>类型</legend>' +
                                '<div data-name="type">' +
                                '</div>'+
                                '</fieldset>'+
                            '</div>'+
                            '<div class="col-xs-4">' +
                           '<fieldset>' +
                           '<legend>纵坐标</legend>' +
                                '<div class="colClass">' +
                                    '<div data-name="col"></div>'+
                                '</div>'+
                           '</fieldset>'+
                            '</div>'+
                            '<div class="col-xs-4">' +
                               '<fieldset>' +
                               '<legend>横坐标</legend>' +
                               '<div class="rowClass">' +
                               '<div data-name="row"></div>'+
                               '</div>'+
                               '</fieldset>'+
                                '<fieldset>' +
                                '<legend>范围</legend>' +
                                '<div data-name="range">' +
                                '</div>'+
                                '</fieldset>'+
                            '</div>'+
                        '</div>'+
                   '</div>'
    }
    /**
     * 获取模态框
     * @returns {Modal}
     */
    private getModal(){
        return this.modal;
    }
    private getCols = function(title){
        let cols = this.para.cols;
        for(let i = 0,l = cols.length;i < l;i++){
            if(cols[i].title === title){
                return cols[i];
            }
        }
    }
    /**
     * 获取相应图形的echart参数
     * @type {Array}
     */
    private generateChartOption = (function(self){
        let chartArr = [];
        chartArr[0] = function(para){
            let series = [],echart,count = -1,yAxis = [],color:string[] = [],fontSize = sys.isMb ? 8 : 12;
           for(let key1 in para['ySeries']){
               if(!tools.isEmpty(para['ySeries'][key1])){
                   count++;
                   for(let key2 in para['ySeries'][key1]){
                       series.push({
                           name : key2,
                           type : 'line',
                           yAxisIndex:count,
                           symbolSize : 12,
                           data : para['ySeries'][key1][key2]
                       })
                   }
                   yAxis.push({
                       name : ChartBasic.yType[key1],
                       type: ChartBasic.yType[key1] === '时间' ? 'time' : 'value',
                       axisLabel : {
                           fontSize : fontSize
                       }
                   })
               }
           }
            // 指定图表的配置项和数据
             echart = new Echart();
             echart.legend = sys.isMb ? {
                 type: 'scroll',
                 bottom: "0px",
                 left:0,
                 data:para['legend']
             }:
                 {
                 type: 'scroll',
                 orient: 'vertical',
                 right: '3%',
                 top: 20,
                 bottom:0,
                 data:para['legend']
             };
             echart.xAxis = {
                type: 'category',
                boundaryGap: false,
                data: para['xData'],
                 triggerEvent : true
             };
            let isDrill = ['web', 'webdrill', 'drill'].indexOf(self.para.getTablePara().uiType) > -1;
              if((sys.isMb && !isDrill) || (!sys.isMb)){
                  echart.dataZoom = [
                      {
                          type: 'inside',
                          show: true,
                          xAxisIndex: [0]
                      },
                      {
                          type: 'inside',
                          show: true,
                          yAxisIndex: [0]
                      }];
              }
             if(!sys.isMb){
                 echart.tooltip = {
                     trigger: 'axis',
                     show:true,
                     axisPointer: {
                         type: 'cross',
                         crossStyle: {
                             color: '#999'
                         }
                     },
                     formatter: function(datas)
                     {
                         let res = datas[0].name + '<br/>', val;
                         for(let i = 0, length = datas.length; i < length; i++) {
                             val = BwRule.formatText(datas[i].value,self.getCols(datas[i].seriesName),false);
                             res += datas[i].seriesName + '：' + val + '<br/>';
                         }
                         return res;
                     }
                 };
             }
             echart.yAxis = yAxis;
             echart.series = series;
            for(let i=0;i<para['legend'].length;i++){
                color.push(ChartBasic.getRandomCol());
            }
            echart.color = color;
            return echart.getOption();
        };//折线图参数
        chartArr[1] = function(para){
            let series = [],echart,count = -1,yAxis = [],color : string[] = [],fontSize = sys.isMb ? 8 : 12;
            for(let key1 in para['ySeries']){
                if(!tools.isEmpty(para['ySeries'][key1])){
                    count++;
                    for(let key2 in para['ySeries'][key1]){
                        series.push({
                            name : key2,
                            type : 'bar',
                            yAxisIndex:count,
                            data : para['ySeries'][key1][key2]
                        })
                    }
                    yAxis.push({
                        name : ChartBasic.yType[key1],
                        type: ChartBasic.yType[key1] === '时间' ? 'time' : 'value',
                        axisLabel : {
                            fontSize : fontSize
                        }
                    })
                }
            }
            // 指定图表的配置项和数据
            echart = new Echart();
            echart.legend = sys.isMb ? {
                type: 'scroll',
                bottom: "0px",
                left:0,
                data:para['legend']
            }:{
                type: 'scroll',
                orient: 'vertical',
                right: '3%',
                top: 20,
                bottom:0,
                data:para['legend']
            };
            echart.xAxis = {
                type: 'category',
                data: para['xData'],
                triggerEvent : true,
                axisPointer: {
                    type: 'shadow'
                }
            };
            for(let i=0;i<para['legend'].length;i++){
                color.push(ChartBasic.getRandomCol());
            }
            echart.color = color;
            echart.yAxis = yAxis;
            echart.series = series;
            let isDrill = ['web', 'webdrill', 'drill'].indexOf(self.para.getTablePara().uiType) > -1;
            if((sys.isMb && !isDrill) || (!sys.isMb)){
                echart.dataZoom = [
                    {
                        type: 'inside',
                        show: true,
                        xAxisIndex: [0]
                    },
                    {
                        type: 'inside',
                        show: true,
                        yAxisIndex: [0]
                    }];
            }
            if(!sys.isMb) {
                echart.tooltip = {
                    trigger: 'axis',
                    show: true,
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        }
                    },
                    formatter: function (datas) {
                        let res = datas[0].name + '<br/>', val;
                        for (let i = 0, length = datas.length; i < length; i++) {
                            val = BwRule.formatText(datas[i].value, self.getCols(datas[i].seriesName), false);
                            res += datas[i].seriesName + '：' + val + '<br/>';
                        }
                        return res;
                    }
                };
            }
            return echart.getOption();
        };//柱状图参数
        chartArr[2] = function(para){
            let series = [],echart,count=0,color : string[] = [];
            for(let key1 in para['ySeries']){
                if(!tools.isEmpty(para['ySeries'][key1])){
                    for(let key2 in para['ySeries'][key1]){
                        let data = [];
                        for(let i = 0;i < para['xData'].length;i++){
                                data.push({
                                    value : para['ySeries'][key1][key2][i],
                                    name : para['xData'][i]
                                });
                        }
                        series.push({
                            name : key2,
                            type : 'pie',
                            radius : sys.isMb ? '120px' :'150px',
                            center: ['50%',`${count*400 + 200}px`],
                            label:{
                                normal: {
                                    formatter: sys.isMb ?'{b}\n{d}%' :'{a}\n {b}: {d}%'
                                }
                            },
                            data : data
                        });
                        count++;
                    }
                }
            }
            // 指定图表的配置项和数据
            echart = new Echart();
            echart.title = {
                text: '订单明细图',
                x:'center'
            };
            if(!sys.isMb) {
                echart.tooltip = {
                    trigger: 'item',
                    show: true,
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        }
                    },
                    formatter: function (datas) {
                        let res = '', val;
                        val = BwRule.formatText(datas.value, self.getCols(datas.seriesName), false);
                        res += datas.seriesName + '：' + val + '<br/>';
                        return res;
                    }
                };
            }
            echart.title =  sys.isMb ? {
                text : '订单明细图',
                x : 'center',
                top : '20px'
            } : {
                text : '订单明细图',
                x : 'center'
            };
            echart.legend = sys.isMb ? {
                type: 'scroll',
                top: "0%",
                left:0,
                data:para['legend']
            }:{
                type: 'scroll',
                orient: 'vertical',
                right: '3%',
                top: 20,
                bottom:0,
                data:para['xData'],
                pageIconColor:'red'
            };
            for(let i=0;i<para['xData'].length;i++){
                color.push(ChartBasic.getRandomCol());
            }
            echart.color = color;
            echart.series = series;
            return echart.getOption();
        };//饼状图参数
        chartArr[3] = function(para){
           let lineOption = chartArr[0].call(this,para),i;
           for(i = 0;i < lineOption.series.length;i++){
               lineOption.series[i]['smooth'] = true;
               lineOption.series[i]['areaStyle'] =  {
                   normal: {
                       color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                           offset: 0,
                           color: lineOption.color[i],
                           opacity:1
                       }, {
                           offset: 1,
                           color: lineOption.color[i],
                           opacity:1
                       }])
                   }
               }
           }

           return lineOption;
        };//面积图参数
        return chartArr;
    })(this);
    /**
     * 获取用户输入数据，并统计数据以及构造数据格式
     * @returns {{}}
     */
    private getChartInput(){
        function unique(arr){
            let res = [],json = {},i;
            for(i = 0; i < arr.length; i++){
                if(!json[arr[i]]){
                    res.push(arr[i]);
                    json[arr[i]] = 1;
                }
            }
            return res;
        }
        let rowSel = this.coms['row'].get(),//选择的x轴
            colSel = this.coms['col'].get(),
            colSelArr = [],//y轴选择的value值，用来获取相应列的具体数据
            legend = [],//y轴统计的字段的名称(text);
            xData = [],//x轴数组
            yData = {},//y轴统计字段的具体数值之和对象
            statisticData = this.coms['range'].get()[0] ? this.para.selectedData() : this.para.allData(),i,j,k;
        for(i = 0;i < colSel.length;i++){
            colSelArr.push(this.chartCol[colSel[i]].value);
            legend.push(this.chartCol[colSel[i]].text);
        }
        xData = unique(this.para.colDataGet(rowSel));//去重之后的x轴横坐标数组
        if(xData.indexOf(null) > -1){
            xData.splice(xData.indexOf(null),1);//去除横坐标为null的情况
        }

        for(j = 0;j < xData.length; j++){
            for (i = 0; i < statisticData.length; i++) {
                if (statisticData[i][rowSel] === xData[j]) {
                    for(k = 0;k < colSelArr.length; k++) {
                        if(!yData[legend[k]]){
                            yData[legend[k]] = {};
                        }
                        if(!yData[legend[k]][xData[j]]) {
                            yData[legend[k]][xData[j]] = 0;
                        }
                            yData[legend[k]][xData[j]] = yData[legend[k]][xData[j]] + statisticData[i][colSelArr[k]];
                    }
                }
            }
        }
        let ySeries = {
            'money' : {},
            'count' : {},
            'time'  : {}
        };

        for(let key1 in yData){
            let tempType = this.getDataType(key1);
            if(tempType === BwRule.DT_MONEY){
                ySeries['money'][key1] = [];
            }
            else if(tempType === BwRule.DT_DATETIME || tempType === BwRule.DT_TIME){
                ySeries['time'][key1] = [];
            }
            else{
                ySeries['count'][key1] = [];
            }
            xData = [];
            for(let key2 in yData[key1]){
                xData.push(key2);
                if(tempType === BwRule.DT_MONEY) {
                    ySeries['money'][key1].push(yData[key1][key2]);
                }
                else if(tempType === BwRule.DT_DATETIME || tempType === BwRule.DT_TIME){
                    ySeries['time'][key1].push(yData[key1][key2]);
                }
                else{
                    ySeries['count'][key1].push(yData[key1][key2]);
                }
            }
        }
        let jsonData = {};
        jsonData['legend'] = legend;
        jsonData['ySeries'] = ySeries;
        jsonData['xData'] = xData;
        return jsonData;
    }
    /**
     * 内部方法，用来判断列的数值类型
     * @param {string} name
     * @returns {string}
     */
    private getDataType(name:string){
        for(let i = 0;i < this.para.cols.length;i++){
            if(this.para.cols[i].title === name){
                return this.para.cols[i].dataType;
            }
        }
    };
    private getLinkCol(trData,keyField){
        let cols = this.para.cols;
        let inLinkCol = (col,src)=>{
            if(!this.hasLinkCol[col.caption]){
                this.hasLinkCol[col.caption] = [];
            }
            this.hasLinkCol[col.caption].push({
                name : trData[col.name],
                src : src
            });
        };
        cols.forEach((col, index)=>{
            if(col.drillAddr && col.drillAddr.dataAddr){
                let drillAddr = BwRule.drillAddr(col.drillAddr.dataAddr, trData, keyField);
                if(drillAddr){
                    inLinkCol(col,drillAddr);
                }
            }
            if(col.webDrillAddr && col.webDrillAddr.dataAddr){
                let webDrillAddr = BwRule.webDrillAddr(col.webDrillAddr, trData, keyField);
                if(webDrillAddr) {
                    inLinkCol(col,webDrillAddr);
                }
            }
            if(col.webDrillAddrWithNull && col.webDrillAddrWithNull.dataAddr){
                let webDrillAddrWithNull = BwRule.webDrillAddrWithNull(col.webDrillAddrWithNull, trData, keyField);
                if(webDrillAddrWithNull) {
                    inLinkCol(col,webDrillAddrWithNull);
                }
            }
        })
    }
    static getRandomCol = function(){
        let r = Math.floor(Math.random()*256);
        let g = Math.floor(Math.random()*256);
        let b = Math.floor(Math.random()*256);
        return "rgb("+r+','+g+','+b+")";
    };
    /**
     * 图标统计的三种统计字段类型
     * @type {{money: string; count: string; time: string}}
     */
    static yType = {
        'money' : '金额',
        'count' : '数量',
        'time'  : '时间'
    };
}