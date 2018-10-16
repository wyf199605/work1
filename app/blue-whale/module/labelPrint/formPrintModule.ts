/// <amd-module name="FormPrintModule"/>
import {DrawSvg} from "../../../global/utils/drawSvg";

import d = G.d;
import tools = G.tools;
import {Modal} from "global/components/feedback/modal/Modal";
import {ModalFooter} from "global/components/feedback/modal/ModalFooter";
import {Button} from "../../../global/components/general/button/Button";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Tab} from "../../../global/components/ui/tab/tab";
import {FormCom} from "../../../global/components/form/basic";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {TextInput} from "../../../global/components/form/text/text";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {NumInput} from "../../../global/components/form/numInput/numInput";

interface FormPrintModulePara{
    container: HTMLElement;
    cols?: any;
    tableData(): obj[];
    middleTable : HTMLElement;
}
interface tableCon{
    row : number;
    col : number;
    widthLeave : number;
    heightLeave : number;
}
export = class FormPrintModule {
    public modal: Modal;
    private coms: objOf<FormCom> = {};//存放data-type节点
    private colSize : obj;//当前表格每一列的宽度
    private indexToName : obj;
    private userInp : obj;//缓存用户设置属性
    private previewModal : Modal;
    private tableConf : tableCon;//绘制表格相关配置数据
    private pageSvgArray: any[] = [];//一张纸大小svg的预览缓存数组
    private currentPage: number;//纸张分页的当前页数
    private totalPage: number;//纸张分页的总共页数
    private tableData ; obj;
    constructor(private para : FormPrintModulePara) {
        this.printUtil.getPrinterList();
        this.initModal();
    }

    private getVisableCols(){
        return this.para.cols;
    }

    /**
     * 初始化模态框
     */
    private initModal(){
        // 模态框初始化
        let leftBox = new InputBox(),
            rightBox = new InputBox(),
            savaBtn = new Button({
                content: '设置默认值',
                type: 'primary',
                onClick: () => {},
                key:'saveBtn'
            }),
            cancelBtn = new Button({content: '取消', type: 'default',key:'cancelBtn'}),
            printBtn = new Button({
                content: '打印',
                type: 'primary',
                onClick: () => {},
                key:'printBtn'
            }),
            previewBtn = new Button({
                content: '预览',
                type: 'primary',
                onClick: () => {
                   this.dealPreview();
                },
                key:'previewBtn'
            });

        leftBox.addItem(savaBtn);
        rightBox.addItem(printBtn);
        rightBox.addItem(previewBtn);
        rightBox.addItem(cancelBtn);

        this.modal = new Modal({
            container: this.para.container,
            header: '报表打印',
            body: document.createElement('div'),
            className: 'formPrint',
            footer: {
                leftPanel: leftBox,
                rightPanel: rightBox
            }
        });

        let bodyHtml = FormPrintModule.tpl();
        new Tab({
            tabParent: this.modal.bodyWrapper,
            panelParent: this.modal.bodyWrapper,
            tabs: [{title:'设置',dom: d.query('.setDom',bodyHtml)},
                {title:'选项',dom: d.query('.optionDom',bodyHtml)},
                {title:'数据',dom: d.query('.dataDom',bodyHtml)},
                {title:'补充',dom: d.query('.suppleDom',bodyHtml)}]
        });
        d.queryAll('[data-name]', this.modal.bodyWrapper).forEach(el => {
            this.replaceNameDom(el.dataset.name, el);
        });
        this.modal.isShow = true;
    }

    /**
     * 画报表表格
     * @param drawSvg
     * @param startX
     * @param startY
     * @param tableWidth
     * @param tableHeight
     */
    private drawTable(drawSvg: DrawSvg,startX,startY,tableWidth,tableHeight){
        let graphConf = {
            brushColor:0,
            penColor:0,
            brushStyle:1,
            penStyle:0,
            penWidth:1
        };
        let rowSpa = 30+ this.userInp.rowSpace;
        let rowWidth = tableWidth - this.tableConf.widthLeave;
        let colHeight = tableHeight - this.tableConf.heightLeave;

        //循环绘制表格横向
        for(let i = 0;i <= this.tableConf.row;i++){
            drawSvg.graph(DrawSvg.graphKind.line, {
                    x: startX,
                    y: i*rowSpa + startY,
                    w: rowWidth,
                    h: 1.5},graphConf );
        }
        //画表格第一条竖线
        drawSvg.graph(DrawSvg.graphKind.verticalLine, {x: startX, y: startY, w: 1.5,h: colHeight},graphConf);
        let offsetX = 0;
        //循环绘制表格其它竖线
        for(let i = 0;i < this.tableConf.col;i++){
            offsetX += this.colSize[i];
            drawSvg.graph(DrawSvg.graphKind.verticalLine, {
                x: offsetX + startX,
                y: startY,
                w: 1.5,
                h: colHeight},graphConf);
        }
    }

    /**
     * 画报表头部信息
     * @param drawSvg
     * @param title
     */
    private drawTop(drawSvg: DrawSvg,title) {
        let textConf = {
            alignment: 0,
            backColor: 16777215,
            font: {fontColor: 0, fontName: "宋体", fontSize: 12, fontStyle: 1},
            forFill: false,
            autoSize: false,
            stretch: false,
            transparent: false,
            wrapping: false
        };

        drawSvg.icon(3, {
                x: this.userInp.left,
                y: this.userInp.up + 7,
                w: 60,
                h: 60
            }
        );

        drawSvg.text(title, {
            x: this.userInp.left + 60,
            y: this.userInp.up + 30,
            w: 0,
            h: 0
        }, textConf);

        drawSvg.text(title, {
            x: this.userInp.paperWidth / 2 - 30,
            y: this.userInp.up + 80,
            w: 0,
            h: 0
        }, textConf);
    }

    /**
     * 画报表底部信息
     * @param drawSvg
     */
    private drawBottom(drawSvg){
        let textConf = {
            alignment: 0,
            backColor: 16777215,
            font: {fontColor: 0, fontName: "宋体", fontSize: 12,fontStyle: 1},
            forFill: false,
            autoSize: false,
            stretch: false,
            transparent: false,
            wrapping: false
        },
            graphConf = {
            brushColor:0,
            penColor:0,
            brushStyle:1,
            penStyle:0,
            penWidth:1
        };

        drawSvg.graph(3, {
            x: this.userInp.left,
            y: this.userInp.paperHeight - this.userInp.down - 20,
            w: this.userInp.paperWidth - this.userInp.left - this.userInp.right,
            h: 1.5},graphConf );

        drawSvg.text("打印者：肖映崎",
            {
                x: this.userInp.left,
                y: this.userInp.paperHeight - this.userInp.down - 10,
                w: 0,
                h: 0
            },textConf);

        drawSvg.text(`打印时间：${G.tools.date.format(new Date,'yyyy-MM-dd HH:mm:ss')}`,
            {
                x: this.userInp.paperWidth / 2 - 100,
                y: this.userInp.paperHeight - this.userInp.down - 10,
                w: 0,
                h: 0
            },textConf);

        drawSvg.text(`第 ${this.currentPage} 页 共 ${this.totalPage} 页`,
            {
                x: this.userInp.paperWidth - this.userInp.right - 90,
                y: this.userInp.paperHeight - this.userInp.down - 10,
                w: 0,
                h: 0
            },textConf);
    }

    /**
     * 画报表表格表体内容信息
     * @param drawSvg
     */
    private drawText(drawSvg: DrawSvg) {
        let getColsIndex = (name) => {
            let cols = this.para.cols;
            for (let i = 0, l = cols.length; i < l; i++) {
                if (cols[i].name === name) {
                    return i;
                }
            }
            return null;
        };

        let colsCache = this.para.cols;//缓存列数据
        let tableLeft = this.userInp.left + this.tableConf.widthLeave / 2, //表格距离左侧距离
            tableTop = this.userInp.up + 100;//表格距离上侧距离
        let textConf = {
            alignment: 0,
            backColor: 16777215,
            font: {fontColor: 0, fontName: "宋体", fontSize: 12, fontStyle: 1},
            forFill: false,
            autoSize: false,
            stretch: false,
            transparent: false,
            wrapping: true
        };
        let middleText = (30 + this.userInp.rowSpace - 12) / 2;//一个单元格的y轴中间点位置
        let leftCache = 0;//缓存当前单元格距离表格右侧距离 叠加

        let headCache = {
            x: 10 + tableLeft,
            y: middleText + tableTop
        };
        //填写表头
        for (let col = -1; col < this.tableConf.col - 1; col++) {
            col !== -1 && (leftCache += this.colSize[col]);

            let index = getColsIndex(this.indexToName[col + 1]);
            // 通过当前单元格的name获取title
            if(index !== null) {
                drawSvg.text(colsCache[index].title, {
                    x: (col === -1) ? headCache.x : (leftCache + headCache.x),
                    y: headCache.y,
                    w: 0,
                    h: 0
                }, textConf);
            }
        }

        let bodyCache = {
            x: 10 + tableLeft, //10为内部单元格文字距离右侧的距离 之后设置为动态
            y1: this.userInp.rowSpace + 30,
            y2: middleText + tableTop
        };

        //填写表体
        for (let row = 1; row < this.tableConf.row; row++) {
            let curRowData = this.tableData.shift();
            leftCache = 0;
            if (curRowData) {
                for (let col = -1; col < this.tableConf.col - 1; col++) {
                    col !== -1 && (leftCache += this.colSize[col]);
                    let text = tools.str.toEmpty(curRowData[this.indexToName[col + 1]]);
                    let width = this.colSize[col + 1] - 10;
                    // text = `<span class="svgText" style="width: ${width}px;">${text}</span>`;//通过添加span标签用来控制文本溢出
                    //获取当前表格数据的第row+1项因为每一个表格都有表头 所以要加一
                    drawSvg.text(text, {
                        x: (col === -1) ? bodyCache.x : (leftCache + bodyCache.x),
                        y: row * (bodyCache.y1) + bodyCache.y2,
                        w: width,
                        h: 0
                    }, textConf);
                }
            }
            else {
                break;
            }
        }
    }

    /**
     * 初始化模板标签
     * @param {string} name
     * @param {HTMLElement} el
     */
    private replaceNameDom(name: string, el: HTMLElement) {
        let self = this;
        switch (name) {
            case 'printer':
                this.coms['printer'] = new SelectInput({
                    container: el,
                    data: FormPrintModule.selectInputJson['printer'],
                    placeholder: '默认',
                    onSet: function (item, index) {},
                    className: 'selectInput',
                    clickType: 1
                });
                break;
            case 'paper':
                this.coms['paper'] = new SelectInput({
                    container: el,
                    data: FormPrintModule.selectInputJson['paper'],
                    placeholder: '默认',
                    onSet: function (item, index) {
                        if(self.coms['width'] && self.coms['height']){
                            let size = self.coms['paper'].get().split("*");
                            self.coms['width'].set(size[0]);
                            self.coms['height'].set(size[1]);
                        }
                    },
                    className: 'selectInput',
                    clickType: 1
                });
                this.coms['paper'].set('210.0*297.0');
                break;
            case 'width':
                this.coms['width'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                if(this.coms['paper']){
                    let width = this.coms['paper'].get().split("*");
                    this.coms['width'].set(width[0]);
                }
                break;
            case 'height':
                this.coms['height'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                if(this.coms['paper']){
                    let height = this.coms['paper'].get().split("*");
                    this.coms['height'].set(height[1]);
                }
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
                this.coms['up'].set(0);
                break;
            case 'down':
                this.coms['down'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                this.coms['down'].set(10);
                break;
            case 'left':
                this.coms['left'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                this.coms['left'].set(10);
                break;
            case 'right':
                this.coms['right'] = new TextInput({
                    container: el,
                    placeholder: '请输入',
                    className: 'text'
                });
                this.coms['right'].set(10);
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
            case 'rowSpace':
                this.coms['rowSpace'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                this.coms['rowSpace'].set(1);
                break;
            case 'colSpace':
                this.coms['colSpace'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                this.coms['colSpace'].set(1);
                break;
            case 'lanNum':
                this.coms['lanNum'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                break;
            case 'lanSpace':
                this.coms['lanSpace'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
                break;
        }
    }

    private dealPreview(){
        this.currentPage = 1;
        let previewRB = new InputBox(),
            cancelBtn = new Button({content: '取消', key: 'cancelBtn', type: 'default'}),
            okBtn = new Button({
                key: 'okBtn',
                content: '上一页',
                type: 'primary',
                onClick: () => {
                    this.currentPage--;
                    let previewBody = <HTMLElement>this.previewModal.body;
                    if (this.currentPage <= 1) {
                        d.queryAll('.btn', this.previewModal.wrapper)[1].setAttribute('disabled', 'disabled');
                    }
                    if (this.currentPage == this.totalPage - 1) {
                        d.queryAll('.btn', this.previewModal.wrapper)[2].removeAttribute('disabled');
                    }
                    if (this.pageSvgArray[this.currentPage - 1]) {
                        previewBody.innerHTML = '';
                        previewBody.appendChild(this.pageSvgArray[this.currentPage - 1]);
                    }
                    return false;
                }
            }),
            nextPageBtn = new Button({
                content: '下一页',
                type: 'primary',
                onClick: () => {
                    this.currentPage++;
                    if (this.currentPage >= this.totalPage) {
                        d.queryAll('.btn', this.previewModal.wrapper)[2].setAttribute('disabled', 'disabled');
                    }
                    if (this.currentPage == 2) {
                        d.queryAll('.btn', this.previewModal.wrapper)[1].removeAttribute('disabled');
                    }
                    let previewBody = <HTMLElement>this.previewModal.body;

                    if (this.pageSvgArray[this.currentPage - 1]) {
                        previewBody.innerHTML = '';
                        previewBody.appendChild(this.pageSvgArray[this.currentPage - 1]);
                    }
                    else {
                        previewBody.innerHTML = '';
                        let drawSvg = new DrawSvg({
                            width: this.userInp.paperWidth,
                            height: this.userInp.paperHeight
                        });

                        this.pageSvgArray.push(drawSvg.getSvg());
                        previewBody.appendChild(drawSvg.getSvg());

                        this.drawTable(drawSvg,
                            userInp.left + this.tableConf.widthLeave/2, //表格距离左侧距离
                            userInp.up + 100,//表格距离上侧距离
                            tableWidth,
                            tableHeight
                        ); //表格高度
                        this.drawTop(drawSvg,'条码库存表');

                        this.drawBottom(drawSvg);

                        this.drawText(drawSvg);

                    }
                    return false;
                }
            });

        previewRB.addItem(cancelBtn);
        previewRB.addItem(okBtn);
        previewRB.addItem(nextPageBtn);

        let userInp = this.printUtil.getUserInput();
        this.previewModal = new Modal({
            body: d.create(`<div class="previewBody"></div>`),
            className: 'preview',
            container: this.para.container,
            header: '预览',
            width: `${userInp.paperWidth}px`,
            footer:{
                rightPanel: previewRB
            },
            top: 0,
        });

        d.queryAll('.btn', this.previewModal.wrapper)[1].setAttribute('disabled', 'disabled');//设置开始时上一页为禁止点击状态
        this.printUtil.getColsSize();
        let drawSvg = new DrawSvg({
            width: this.userInp.paperWidth,
            height: this.userInp.paperHeight
        });
        this.pageSvgArray = [];
        this.pageSvgArray[0] = drawSvg.getSvg();
        this.previewModal.body.appendChild(drawSvg.getSvg());

        let tableWidth = userInp.paperWidth-userInp.left-userInp.right, //表格宽度 纸张宽度-纸张左间距-纸张右间距
            tableHeight = userInp.paperHeight - userInp.up - userInp.down - 100 - 30;

        this.tableConf = this.printUtil.getTableConf(tableWidth,tableHeight,30 + this.userInp.rowSpace);
        this.totalPage = Math.ceil(this.para.tableData().length / this.tableConf.row);
        this.tableData = JSON.parse(JSON.stringify(this.para.tableData()));//缓存表格数据，深度复制

        this.drawTable(drawSvg,
            userInp.left + this.tableConf.widthLeave/2, //表格距离左侧距离
            userInp.up + 100,//表格距离上侧距离
            tableWidth,
            tableHeight
        ); //表格高度
        this.drawTop(drawSvg,'条码库存表');
        this.drawBottom(drawSvg);
        this.drawText(drawSvg);
    }

    private printUtil = (function(self){
        /**
         * 获取表格的行列大小信息
         */
        let getColsSize = ()=>{
            let ths = d.queryAll('.section-inner-wrapper:not(.pseudo-table) th', self.para.middleTable);
            let size = {},indexToName = {};
            for(let i = 0,l = ths.length;i < l;i++){
                let temp = ths[i].offsetWidth;
                size[i] =  temp <= 150 ? temp : 150;
                indexToName[i] = ths[i].dataset['name'];
            }
            self.colSize = size;
            self.indexToName = indexToName;
        };

        /**
         * 获取能放多少行与列
         * @param width 宽度
         * @param height 高度
         * @param lineHeight 行高
         */
        let getTableConf = (width:number,height:number,lineHeight:number)=>{
            let col = 0,row = 0,temp = 0,widthLeave,heightLeave;
            for(let key in self.colSize){
                col++;
                temp += self.colSize[key];
                if(temp > width){
                    col--;
                    widthLeave = width - (temp -  self.colSize[key]);
                    break;
                }
            }
            !widthLeave && (widthLeave = width-temp);
            temp = 0;
            while(temp < height){
                row++;
                temp += lineHeight;
            }
            heightLeave = height - (temp - lineHeight);
            row = Math.floor(height/lineHeight);
            return {
                row : row,
                col : col,
                widthLeave : widthLeave,
                heightLeave : heightLeave
            }
        };

        /**
         * 获取用户输入数据
         */
        let getUserInput = ()=>{
            let tempObj = {
                paperWidth: self.coms['width'].get() * 3.78,
                paperHeight: self.coms['height'].get() * 3.78,
                up: self.coms['up'].get() * 3.78,
                down: self.coms['down'].get() * 3.78,
                left: self.coms['left'].get() * 3.78,
                right: self.coms['right'].get() * 3.78,
                rowSpace: self.coms['rowSpace'].get() * 3.78,
                colSpace: self.coms['colSpace'].get() * 3.78
            };
            self.userInp = tempObj;
            return tempObj;
        };

        /**
         * 获取打印机数据
         */
        let getPrinterList = ()=> {
            if ('BlueWhaleShell' in window) {
                let printerListStr = BlueWhaleShell.postMessage('getPrintDrive', '{}').replace(/\\/g, ""), driveList;
                let printerList = JSON.parse(printerListStr);
                printerList.msg && (driveList = printerList.msg.driveList);
                if (driveList) {
                    FormPrintModule.selectInputJson.printer = [];
                    FormPrintModule.selectInputJson.printer.push(
                        {text: "默认", value: driveList[0].driveCode}
                    );
                    if (driveList.length > 1) {
                        for (let i = 1, l = driveList.length; i < l; i++) {
                            FormPrintModule.selectInputJson.printer.push(
                                {text: driveList[i].driveName, value: driveList[i].driveCode}
                            )
                        }
                    }
                }
            }
        }

        return{getColsSize,getTableConf,getUserInput,getPrinterList}
    })(this);

    //报表html模版
    static tpl = ()=>{
        return d.create(
            `<div><div class = "setDom">
                      <div class = 'leftSet'>
                          <div class="printer" data-name="printer" ></div>
                          <div class = "range">
                                <fieldset>
                                <legend>范围</legend>
                                <div data-name="pageRange"></div>
                                <div class = "inline" data-name="from"><span>从</span></div>
                                <div class = "inline" data-name="to"><span>到</span></div>
                                </fieldset>
                          </div>
                          <div class="direction">
                                <fieldset class="col-xs-12">
                                <legend>方向</legend>
                                <div data-name="direction"></div>
                                </fieldset>
                          </div>
                          <div class="content">
                                <fieldset class="col-xs-12">
                                <legend>内容</legend>
                                <div data-name="printData"></div>
                                </fieldset>
                           </div>
                      </div>
                      <div class = 'rightSet'>
                          <div class="paper" data-name="paper" ></div>
                          <div class = 'size'>
                               <div  data-name="width"><span>宽度</span></div>
                               <div  data-name="height"><span>高度</span></div>
                          </div>
                          <div class = "pagePadding">                                               
                                <div data-name="up"><span>上边距</span></div>
                                <div data-name="down"><span>下边距</span></div>                         
                                <div data-name="left"><span>左边距</span></div>
                                <div data-name="right"><span>右边距</span></div>                      
                          </div>   
                           <div class = "otherSetting">                                               
                                <div  data-name="lanNum"><span>栏数</span></div>
                                <div  data-name="lanSpace"><span>栏距</span></div>
                                <div  data-name="rowSpace"><span>行距</span></div>
                                <div  data-name="colSpace"><span>列距</span></div>
                          </div>              
                      </div>
             </div>
            <div class = "optionDom">
                               
            </div>
            <div class = "dataDom">
                                
            </div>
            <div class = "suppleDom">
                               
            </div></div>`
        )
    }

    /*
     * 下拉框数据
     * */
    static selectInputJson = {
        printer: [{text: '默认', value: 0}],
        paper: [{value: '215.9*279.4', text: '信纸(215.9*279.4毫米)'},
            {value: '279.4*431.8', text: '小报(279.4*431.8毫米)'},
            {value: '215.9*355.6', text: '文书(215.9*355.6毫米)'},
            {value: '139.7*215.9', text: '申明(139.7*215.9毫米)'},
            {value: '190.5*254.0', text: '公函(190.5*254.0毫米)'},
            {value: '297.0*420.0', text: 'A3(297.0*420.0毫米)'},
            {value: '210.0*297.0', text: 'A4(210.0*297.0毫米)'},
            {value: '148.0*210.0', text: 'A5(148.0*210.0毫米)'},
            {value: '250.0*354.0', text: 'B4(250.0*354.0毫米)'},
            {value: '182.0*257.0', text: 'B5(182.0*257.0毫米)'},
            {value: '215.9*330.2', text: '2开(215.9*330.2毫米)'},
            {value: '215.0*275.0', text: '4开(215.0*275.0毫米)'},
            {value: '254.0*355.6', text: '大4开(254.0*355.6毫米)'},
            {value: '215.9*279.0', text: '便条(215.9*279.0毫米)'},
            {value: '98.4*225.4', text: '9号信封(98.4*225.4毫米)'},
            {value: '104.8*241.3', text: '10号信封(104.8*241.3毫米)'},
            {value: '114.3*263.5', text: '11号信封(114.3*263.5毫米)'},
            {value: '101.6*279.4', text: '12号信封(101.6*279.4毫米)'},
            {value: '127.0*292.1', text: '14号信封(127.0*292.1毫米)'},
            {value: '100.0*100.0', text: '方纸(100.0*100.0毫米)'},
            {value: 0, text: '自定义'}]
    };
}