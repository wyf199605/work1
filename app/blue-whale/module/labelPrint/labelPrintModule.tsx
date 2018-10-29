/// <amd-module name="LabelPrintModule"/>

import dom = G.d;
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import {Modal} from "global/components/feedback/modal/Modal";
import {Button} from "global/components/general/button/Button";
import {FormCom} from "../../../global/components/form/basic";
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {NumInput} from "../../../global/components/form/numInput/numInput";
import {TextInput} from "../../../global/components/form/text/text";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {Tooltip} from "../../../global/components/ui/tooltip/tooltip";
import {Tab} from "../../../global/components/ui/tab/tab";
import {QrCode} from "../../../global/utils/QRCode";
import {BarCode} from "../../../global/utils/barCode";
import {DrawSvg} from "../../../global/utils/drawSvg";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import d = G.d;
import {TableColumn} from "../../../global/components/newTable/base/TableColumn";
import Rule = G.Rule;
import Shell = G.Shell;

interface IPagePara {
    paperWidth?: number,
    paperHeight?: number,
    labelWidth?: number,
    labelHeight?: number,
    up?: number,
    down?: number,
    left?: number,
    right?: number,
    rowSpace?: number,
    colSpace?: number,
    copies?: number
}

interface LabelPrintModulePara {
    printList: any[];
    container: HTMLElement;

    getData(): obj[];

    selectedData(): obj[];

    cols?: TableColumn[];
    callBack?: Function,
    moneys: objOf<obj>;
    defaultVal: obj;
    onSetDefault?: (data: string) => void;
}

interface rowAndCol {
    rowNum: number,//行的数量
    colNum: number //列的数量
}

export = class LabelPrintModule {
    public modal: Modal;//该实例化模态框
    private previewModal;
    private pageSvgArray: any[] = [];//一张纸大小canvas的预览缓存数组
    private userInputValObj: IPagePara;//用户输入结果对象
    private pageData: IPagePara;//一张纸布局所需要的数据
    private onePageRowAndCol: rowAndCol;//一张纸排列的canvas的数量 {rowNum,colNum}
    private currentPage: number;//纸张分页的当前页数
    private totalPage: number;//纸张分页的总共页数
    private labelType: number;//当前所选择的标签类型
    private jsonData: any[] = [];//后台数据转换之后的数据
    private coms: objOf<FormCom> = {};//存放data-type节点
    private allTableData: obj[];//所要打印的所有表格数据
    private template: string;//存放模板
    private isLarge: boolean = false;//判断预览框是否放大
    protected defaultData: obj = {};

    constructor(private para: LabelPrintModulePara) {
        try {
            let printList = Shell.printer.get();
            if(printList.data && Array.isArray(printList.data.driveList)){
                let result = printList.data.driveList,
                    printer = [];
                for(let item of result){
                    printer.push({
                        text: item.driveName,
                        value: item.driveCode,
                    });
                }
                this.selectInputJson.printer = printer;
            }
        }catch (e){
            console.log(e);
        }
        this.defaultData = tools.isEmpty(para.defaultVal) ? LabelPrintModule.getDefaultData() : para.defaultVal;
        this.initModal();
        this.printUtil.getPrinterList();
    }

    protected static getDefaultData() {
        return {
            printer: 0,
            port: 25,
            paper: '215.9*279.4',
            labelType: 0,
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            rowSpace: 10,
            colSpace: 10,
        };
    }

    /**
     * 初始化模态框
     */
    private initModal() {
        let leftInputBox = new InputBox(),
            savaBtn = new Button({
                key: 'savaBtn',
                content: '设为默认值',
                type: 'primary',
                onClick: () => {
                    let defaultValue = {};
                    for (let key in this.coms) {
                        defaultValue[key] = this.coms[key].get();
                    }
                    this.para.onSetDefault && this.para.onSetDefault(JSON.stringify(defaultValue));
                    return false;
                }
            }),
            rightInputBox = new InputBox(),
            cancelBtn = new Button({content: '取消', key: 'cancelBtn', type: 'default'}),
            okBtn = new Button({
                key: 'okBtn',
                content: '打印',
                type: 'primary',
                onClick: () => {
                    this.printHandle(okBtn);
                }
            }),
            previewBtn = new Button({
                content: '预览',
                type: 'primary',
                onClick: () => {
                    this.previewHanle(previewBtn);
                    return false;
                }
            });

        leftInputBox.addItem(savaBtn);
        rightInputBox.addItem(cancelBtn);
        rightInputBox.addItem(okBtn);
        rightInputBox.addItem(previewBtn);

        this.modal = new Modal({
            className: 'labelPrint',
            container: this.para.container,
            width: '750px',
            header: '标签打印',
            body: <div/>,
            footer: {
                leftPanel: leftInputBox,
                rightPanel: rightInputBox
            },
            onClose: () => {
                this.para.callBack();
            }
        });
        //初始化下拉框
        for (let num = 0; num < this.para.printList.length; num++) {
            this.selectInputJson.labelType.push({text: `${this.para.printList[num].caption}`, value: num});
        }

        let bodyHtml = LabelPrintModule.htmlTpl();
        let body = this.modal.bodyWrapper;

        new Tab({
            tabParent: this.modal.bodyWrapper,
            panelParent: this.modal.bodyWrapper,
            tabs: [{title: '设置', dom: d.query('.setDom', bodyHtml)},
                {title: '选项', dom: d.query('.labelTypeDom', bodyHtml)}
            ]
        });

        d.queryAll('[data-name]', this.modal.bodyWrapper).forEach(el => {
            this.replaceNameDom(el.dataset.name, el);
        });

        new Tooltip({
            el: dom.query('.printer', body),
            errorMsg: "\ue6bb 打印机",
            length: 'medium'
        });
        new Tooltip({
            el: dom.query('.port', body),
            errorMsg: '\ue609 端口',
            length: 'small'
        });
        new Tooltip({
            el: dom.query('.paper', body),
            errorMsg: '\ue879 纸型',
            length: 'medium'
        });
        this.printUtil.setInputDefault();//设置初始化输入框等数值
    }

    /**
     * ajax请求后台模板
     * @param {string} url
     * @param {string} type
     * @param {Spinner} sp
     */
    private doAjax(url: string, type: string, sp: Spinner) {
        let self = this,
            userInp = self.userInputValObj;

        self.allTableData = self.coms['printData'].get()[0] ? self.para.selectedData() : self.para.getData();

        BwRule.Ajax.fetch(url)
            .then(({response}) => {
                self.template = JSON.stringify(response);
                //设置页面分布数据
                self.pageData = Object.assign({
                    labelWidth: response.body.bodyList[0].width * 3.78,
                    labelHeight: response.body.bodyList[0].height * 3.78
                }, userInp);
                self.onePageRowAndCol = self.printUtil.onePageSize(self.pageData);//获取一张纸排布的行和列的值
                let totalLabel = self.allTableData.length,//一共多少个标签
                    pageSize = self.onePageRowAndCol.rowNum * self.onePageRowAndCol.colNum;
                self.totalPage = Math.ceil(totalLabel / pageSize);

                if (type === 'preview') {//处理预览
                    let sizeCache = self.allTableData.slice(0, pageSize);
                    let {addr, data} = BwRule.reqAddrFull(self.para.printList[self.labelType].dataAddr, sizeCache);
                    self.getPrintData(addr, self.printUtil.dealVarType(data), type, sp, sizeCache);
                }
                if (type === 'print') {//处理打印
                    for (let i = 0; i < self.totalPage; i++) {
                        let para = self.allTableData.slice(i * pageSize,
                            (i + 1) * pageSize);
                        let {addr, data} = BwRule.reqAddrFull(self.para.printList[self.labelType].dataAddr, para);
                        self.getPrintData(addr, self.printUtil.dealVarType(data), 'print', sp, para);
                    }
                }
            })

            .catch(() => {
                sp.hide();//隐藏预览按钮loading
            })

    }


    /**
     * 请求后台具体数据用来替换模板
     * @param tempUrl
     * @param ajaxObj
     * @param type
     * @param sp
     * @param shouldData
     */
    private getPrintData(tempUrl, ajaxObj, type?, sp?, shouldData?) {
        let self = this,
            printList = self.para.printList[self.labelType],
            tempTemplateData,
            shouldLength = shouldData.length,
            selectFieldNames = printList.selectFields,
            isAjax: boolean = false; // 判断selectFieldNames中的所有字段在表格中是否存在  都存在直接使用表格数据，不存在则请求后台


        // 循环替换模板数据
        function re(data: objOf<obj>, jsonData) {
            let parseURLReg = /\[(\S+?)]/g;
            for (let key in data) {
                if (typeof data[key] === 'object') {
                    for (let key2 in data[key]) {
                        let value = data[key][key2];
                        if (typeof value === 'string') {
                            let isJs = value.match(/^javascript:/i),
                                tempResult: string;
                            tempResult = data[key][key2].replace(parseURLReg, function (word, $1) {
                                let replaced = G.tools.str.toEmpty(jsonData[$1.toUpperCase()]).toString();
                                return isJs ? `'${replaced.replace(/'/g, "/'")}'` : replaced;
                            });

                            if (isJs) {
                                tempResult = tempResult.replace(/^javascript:/i, '');
                                tempResult = '(function(){' + tempResult;
                                tempResult = tempResult + '}())';
                                try{
                                    data[key][key2] = eval(tempResult);
                                }catch (e){
                                    console.log(e);
                                    data[key][key2] = '';
                                }
                            }
                            else {
                                data[key][key2] = tempResult;
                            }
                        }
                    }
                }
            }
        }

        //根据返回数据执行预览或者打印
        function dealData(data) {
            let templateData = self.template;
            for (let i = 0; i < data.length; i++) {
                tempTemplateData = templateData;
                tempTemplateData = JSON.parse(tempTemplateData);
                re(tempTemplateData.body.bodyList[0].lableCodes, data[i]);
                re(tempTemplateData.body.bodyList[0].lableDatas, data[i]);
                self.jsonData.push(tempTemplateData);
            }
            if (data.length < shouldLength) {
                for (let i = 0; i < shouldLength - data.length; i++) {
                    self.jsonData.push({});
                }
            }
            if (type === 'preview') {
                self.dealPreview();
                sp.hide();
            }
            else if (type === 'print') {
                if (self.jsonData.length === self.allTableData.length) {//当数据加载完之后执行打印任务
                    self.dealPrint();
                    sp.hide();
                }
            }
            else if (type === 'next') {
                let tRow = self.onePageRowAndCol.rowNum,
                    tCol = self.onePageRowAndCol.colNum,
                    tPaData = self.pageData,
                    curSize = (self.currentPage - 1) * tRow * tCol;
                for (let row = 0; row < tRow; row++) {
                    for (let col = 0; col < tCol; col++) {
                        let cursize = curSize + (row) * tCol + col;
                        if (self.jsonData[cursize]) {
                            self.printUtil.printLabel(
                                self.jsonData[cursize],
                                tPaData.left + col * (tPaData.labelWidth + tPaData.colSpace),
                                tPaData.up + row * (tPaData.labelHeight + tPaData.rowSpace),
                                self.currentPage - 1);
                        }
                    }
                }
                self.para.container.getElementsByClassName('previewBody')[0].appendChild(self.pageSvgArray[self.currentPage - 1]);
                sp.hide();
            }
        }

        let colName = self.para.cols.map((col) => col.name);
        //判断selectFieldNames中所有字段是否在表格字段中都存在
        for (let j = 0; j < selectFieldNames.length; j++) {
            if (selectFieldNames[j] && selectFieldNames[j].atrrs) {
                if (colName.indexOf(selectFieldNames[j].atrrs.fieldName) === -1) {
                    isAjax = true;
                    break;
                }
            }
        }
        // isAjax = true;
        if (isAjax) {
            BwRule.Ajax.fetch(CONF.siteUrl + tempUrl, {
                data2url: ajaxObj.varType !== 3,
                // type: 'GET',
                data: ajaxObj.ajaxData,
            }).then(({response}) => {
                if ((response.data instanceof Array) && response.data.length > 0) {
                    dealData(formatData(response.data));
                }
                else {
                    Modal.toast("暂无数据");
                    sp.hide();//隐藏预览按钮loading
                }
            }).catch(() => {
                sp.hide();//隐藏预览按钮loading
            });
        }
        else {
            dealData(formatData(shouldData));
        }

        function formatData(data: obj[]) {
            let moneys = {};
            selectFieldNames.forEach((field) => {
                if (field.atrrs && field.atrrs.dataType === '11') {
                    moneys[field.atrrs.fieldName] = field.atrrs.displayFormat || '';
                }
            });
            console.log(moneys);
            let res = data.map((item) => {
                let obj = Object.assign({}, item || {});
                for (let key in moneys) {
                    if (obj[key]) {
                        obj[key] = '¥' + Rule.parseNumber(obj[key], moneys[key].slice(1));
                    }
                }
                return obj;
            });
            console.log(res);
            return res;
        }
    }

    /**
     * 处理页面绘制逻辑
     */
    private dealPreview() {
        this.currentPage = 1;
        let tRow = this.onePageRowAndCol.rowNum,
            tCol = this.onePageRowAndCol.colNum,
            tPaData = this.pageData,
            curSize = (this.currentPage - 1) * tRow * tCol;
        if (this.allTableData.length <= tRow * tCol) {
            dom.queryAll('.btn', this.previewModal.wrapper)[2].setAttribute('disabled', 'disabled');
        }//设置开始时下一页为禁止点击状态，当后台返回的数据小于等于页面分页的数据
        else {
            dom.queryAll('.btn', this.previewModal.wrapper)[2].removeAttribute('disabled');
        }
        //循环绘制图形
        for (let row = 0; row < tRow; row++) {
            for (let col = 0; col < tCol; col++) {
                let size = curSize + (row) * tCol + col;
                if (this.jsonData[size]) {
                    this.printUtil.printLabel(
                        this.jsonData[size],
                        tPaData.left + col * (tPaData.labelWidth + tPaData.colSpace),
                        tPaData.up + row * (tPaData.labelHeight + tPaData.rowSpace),
                        this.currentPage - 1);
                }
            }
        }
        this.para.container.getElementsByClassName('previewBody')[0].appendChild(this.pageSvgArray[0]);
        this.previewModal.isShow = true;

    }

    /**
     * 处理打印功能的函数
     */
    private dealPrint() {
        let tRow = this.onePageRowAndCol.rowNum,
            tCol = this.onePageRowAndCol.colNum,
            self = this,
            tPaData = this.pageData;
        for (let num = 0; num < this.totalPage; num++) {//循环生成每页的图像
            let pageSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            pageSvg.setAttribute('width', `${this.userInputValObj.paperWidth}`);
            pageSvg.setAttribute('height', `${this.userInputValObj.paperHeight}`);
            pageSvg.setAttribute('style', 'background-color:white;');
            pageSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            this.pageSvgArray.push(pageSvg);
            let curSize = num * tRow * tCol;
            for (let row = 0; row < tRow; row++) {
                for (let col = 0; col < tCol; col++) {
                    let size = curSize + row * tCol + col;
                    if (this.jsonData[size]) {
                        this.printUtil.printLabel(
                            this.jsonData[size],
                            tPaData.left + col * (tPaData.labelWidth + tPaData.colSpace),
                            tPaData.up + row * (tPaData.labelHeight + tPaData.rowSpace),
                            num);
                    }
                }
            }
        }
        let dealPrintData = function (uri) {
            if ('BlueWhaleShell' in window) {
                let result = BlueWhaleShell.postMessage('callPrint', '{"quantity":1,"driveCode":"3","image":"' + uri + '"}');
                Modal.alert(result);
            } else if ('AppShell' in window) {
                let code = self.coms['printer'].get();
                Shell.printer.labelPrint(1, code, uri, () => {
                    Modal.toast('打印成功');
                })
            } else {
                Modal.alert('无法连接到打印机')
            }
        };
        let innerHTML = this.pageSvgArray[0].innerHTML;
        let image = new Image();
        image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(innerHTML)));
        image.onload = () => {
            let canvas = document.createElement("canvas");   //创建canvas DOM元素，并设置其宽高和图片一样
            canvas.style.backgroundColor = '#fff';
            canvas.width = image.width;
            canvas.height = image.height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, image.width, image.height); //使用画布画图
            let dataURL = canvas.toDataURL("image/jpeg");  //返回的是一串Base64编码的URL并指定格式
            canvas = null; //释放
            dealPrintData(dataURL.replace('data:jpeg/png;base64,', ''));
        }
        /* for(let i = 0,l = this.pageSvgArray.length;i < l;i++){
             let s = new XMLSerializer().serializeToString(this.pageSvgArray[i]);
             let encodedData = Base64.encode(s);
             dealPrintData(encodedData);
             if(i = l-1){
                 this.para.callBack();
             }
         }*/
    }

    /**
     * 打印按钮点击之后的回调函数
     * @param {Button} okBtn
     * @returns {boolean}
     */
    private printHandle(okBtn: Button) {
        let btn = okBtn.wrapper,
            par = this.para, data, sp;
        data = this.coms['printData'].get()[0] ? par.selectedData() : par.getData();
        if (data.length === 0) {//判断打印是否有数据
            Modal.alert("暂无数据，无法打印");
            return false;
        }
        sp = new Spinner({
            el: btn,
            size: 14,
            type: Spinner.SHOW_TYPE.replace,
        });
        sp.show();
        this.printUtil.getUserInputVal();//获取用户输入数据
        this.pageSvgArray = [];//清空页面缓存的canvas数组
        this.jsonData = []; //清空存放后台数据转换之后的数据
        this.doAjax(CONF.siteUrl + par.printList[this.labelType].templateLink.dataAddr, 'print', sp);//执行ajax调用后台操作
    }

    /**
     * 预览按钮点击之后的回调函数
     * @param {Button} previewBtn
     * @returns {boolean}
     */
    private previewHanle(previewBtn: Button) {
        let sp,//加载效果对象
            data;//用户选择的打印数据临时对象
        this.printUtil.getUserInputVal();//更新this.userInputValObj的值

        if (this.previewModal) {
            d.closest(this.previewModal.body, '.modal-wrapper').style.width = `${this.userInputValObj.paperWidth}px`;
        }
        let btn = previewBtn.wrapper;
        data = this.coms['printData'].get()[0] ? this.para.selectedData() : this.para.getData();
        if (data.length === 0) {
            Modal.alert("暂无数据，无法打印");
            return false;
        }
        sp = new Spinner({
            el: btn,
            size: 14,
            type: Spinner.SHOW_TYPE.replace,
        });
        sp.show();
        this.pageSvgArray = [];//清空存放页面canvas数组
        this.jsonData = [];//清空存放后台数据转换之后的数据
        let userInp = this.userInputValObj;
        if (!this.previewModal) {
            let previewRB = new InputBox(),
                cancelBtn = new Button({content: '取消', key: 'cancelBtn', type: 'default'}),
                okBtn = new Button({
                    key: 'okBtn',
                    content: '上一页',
                    type: 'primary',
                    onClick: () => {
                        let tempEl = this.para.container.getElementsByClassName('previewBody')[0];
                        this.currentPage--;
                        if (this.currentPage <= 1) {
                            dom.queryAll('.btn', this.previewModal.wrapper)[1].setAttribute('disabled', 'disabled');
                        }
                        if (this.currentPage == this.totalPage - 1) {
                            dom.queryAll('.btn', this.previewModal.wrapper)[2].removeAttribute('disabled');
                        }
                        if (this.pageSvgArray[this.currentPage - 1]) {
                            tempEl.innerHTML = '';
                            tempEl.appendChild(this.pageSvgArray[this.currentPage - 1]);
                        }
                        return false;
                    }
                }),
                nextPageBtn = new Button({
                    content: '下一页',
                    type: 'primary',
                    onClick: () => {
                        let tempEl = this.para.container.getElementsByClassName('previewBody')[0];
                        this.currentPage++;
                        if (this.currentPage >= this.totalPage) {
                            dom.queryAll('.btn', this.previewModal.wrapper)[2].setAttribute('disabled', 'disabled');
                        }
                        if (this.currentPage == 2) {
                            dom.queryAll('.btn', this.previewModal.wrapper)[1].removeAttribute('disabled');
                        }
                        if (this.pageSvgArray[this.currentPage - 1]) {
                            tempEl.innerHTML = '';
                            tempEl.appendChild(this.pageSvgArray[this.currentPage - 1]);
                        }
                        else {
                            sp = new Spinner({
                                el: nextPageBtn.wrapper,
                                size: 14,
                                type: Spinner.SHOW_TYPE.replace,
                            });
                            sp.show();
                            tempEl.innerHTML = '';

                            let pageSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            pageSvg.setAttribute('width', `${this.userInputValObj.paperWidth}`);
                            pageSvg.setAttribute('height', `${this.userInputValObj.paperHeight}`);
                            pageSvg.setAttribute('style', 'background-color:white;');
                            pageSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

                            this.pageSvgArray.push(pageSvg);

                            let pageSize = this.onePageRowAndCol.rowNum * this.onePageRowAndCol.colNum;
                            let para = this.allTableData.slice((this.currentPage - 1) * pageSize,
                                this.currentPage * pageSize);
                            let {addr, data} = BwRule.reqAddrFull(this.para.printList[this.labelType].dataAddr, para);

                            this.getPrintData(addr, this.printUtil.dealVarType(data), 'next', sp, para);

                        }
                        return false;
                    }
                });
            previewRB.addItem(cancelBtn);
            previewRB.addItem(okBtn);
            previewRB.addItem(nextPageBtn);

            this.previewModal = new Modal({
                body: <div className="previewBody"/>,
                className: 'preview',
                container: this.para.container,
                width: `${userInp.paperWidth}px`,
                footer: {
                    rightPanel: previewRB
                },
                header: {
                    title: '预览',
                    isFullScreen: true
                },
                top: 0,
                onLarge: () => {
                    let previewBody = this.previewModal.body,
                        preParSty = previewBody.parentElement.style,
                        preFirPar = previewBody.parentElement.parentElement,
                        header = dom.query('.head-wrapper', preFirPar),
                        footer = dom.query('.modal-footer', preFirPar),
                        bodyHeight = preFirPar.offsetHeight - header.offsetHeight - footer.offsetHeight,
                        bodyWidth = previewBody.scrollWidth;
                    if (!this.isLarge) {
                        preParSty.maxHeight = 'none';
                        preParSty.marginLeft = '50%';
                        preParSty.left = `-${bodyWidth / 2}px`;
                        preParSty.height = bodyHeight + 'px';
                        this.isLarge = true;
                    }
                    else {
                        preParSty.maxHeight = '500px';
                        preParSty.left = '0px';
                        preParSty.marginLeft = '0px';
                        this.isLarge = false;
                    }
                }
            });

            this.previewModal.onClose = () => {
                if (this.isLarge) {
                    let fullBut = dom.query('span[data-fullscreen="enlarge"]', this.previewModal.body.parentElement.parentElement);
                    fullBut.click();
                }
            };
            this.previewModal.isShow = false;
            //添加预览放大缩小拖拽等效果
            this.commonUtil.bindPreviewEvent();
        }
        dom.queryAll('.btn', this.previewModal.wrapper)[1].setAttribute('disabled', 'disabled');//设置开始时上一页为禁止点击状态
        this.para.container.getElementsByClassName('previewBody')[0].innerHTML = '';
        this.para.container.getElementsByClassName('preview')[0].getElementsByClassName('modal-body')[0].setAttribute('style',
            `width:${userInp.paperWidth}px;
             height:${userInp.paperHeight}px`
        );
        //初始化一张纸大小的cancas的宽高
        let pageSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        pageSvg.setAttribute('width', `${userInp.paperWidth}`);
        pageSvg.setAttribute('height', `${userInp.paperHeight}`);
        pageSvg.setAttribute('style', 'background-color:white;');
        pageSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        this.pageSvgArray.push(pageSvg);
        //执行ajax调用后台操作
        this.doAjax(CONF.siteUrl + this.para.printList[this.labelType].templateLink.dataAddr, 'preview', sp);
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
                    data: this.selectInputJson['printer'],
                    placeholder: '默认',
                    onSet: function (item, index) {
                    },
                    className: 'selectInput',
                    clickType: 1
                });
                break;
            case 'port':
                this.coms['port'] = new SelectInput({
                    container: el,
                    data: this.selectInputJson['port'],
                    placeholder: '默认',
                    onSet: function (item, index) {
                    },
                    className: 'selectInput',
                    clickType: 1
                });
                break;
            case 'paper':
                this.coms['paper'] = new SelectInput({
                    container: el,
                    data: this.selectInputJson['paper'],
                    placeholder: '默认',
                    onSet: function (item, index) {
                        if (item.value != 0) {
                            let widthAndHeight = item.value.split('*');
                            self.coms['width'].set(widthAndHeight[0]);
                            self.coms['height'].set(widthAndHeight[1]);
                        }
                    },
                    className: 'selectInput',
                    clickType: 1
                });
                break;
            case 'scale':
                this.coms['scale'] = new NumInput({
                    container: el,
                    defaultNum: 1,
                    max: 100,
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
                    defaultNum: 1,
                    max: 100,
                    min: 1,
                    step: 1,
                    className: 'numInput'
                });
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
                    data: this.selectInputJson['labelType'],
                    placeholder: '默认',
                    onSet: function (item, index) {
                        self.labelType = index;
                    },
                    className: 'selectInput',
                    clickType: 0
                });
                break;
        }
    }

    /**
     * 工具方法
     * @type {{getPrinterList: (() => any); dealVarType: ((data) => obj); setInputDefault: (() => any); onePageSize: ((pageData: IPagePara) => {rowNum: number; colNum: number}); getUserInputVal: (() => any); printLabel: ((data, x: number, y: number, currentPageCanvas: number) => any)}}
     */
    private printUtil = (function (self) {
        /**
         * 获取打印机数据
         */
        let getPrinterList = () => {
            if ('BlueWhaleShell' in window) {
                let printerListStr = BlueWhaleShell.postMessage('getPrintDrive', '{}').replace(/\\/g, ""), driveList;
                let printerList = JSON.parse(printerListStr);
                printerList.msg && (driveList = printerList.msg.driveList);
                if (driveList) {
                    this.selectInputJson.printer = [];
                    this.selectInputJson.printer.push(
                        {text: "默认", value: driveList[0].driveCode}
                    );
                    if (driveList.length > 1) {
                        for (let i = 1, l = driveList.length; i < l; i++) {
                            this.selectInputJson.printer.push(
                                {text: driveList[i].driveName, value: driveList[i].driveCode}
                            )
                        }
                    }
                }
            }
        };

        /**
         * 设置页面输入框默认值
         */
        let setInputDefault = () => {
            for (let key in self.defaultData) {
                let com = self.coms[key];
                com && com.set(self.defaultData[key]);
            }

            // self.coms['printer'].get() !== 0 && self.coms['printer'].set(0);
            //  self.coms['port'].get() !== 25 && self.coms['port'].set(25);
            //  self.coms['paper'].get() !== '215.9*279.4' && self.coms['paper'].set('215.9*279.4');
            //  self.coms['labelType'].get() !== 0 && self.coms['labelType'].set(0);
            //  self.coms['up'].set(0);
            //  self.coms['down'].set(0);
            //  self.coms['left'].set(0);
            //  self.coms['right'].set(0);
            //  self.coms['rowSpace'].set(10);
            //  self.coms['colSpace'].set(10);
            //
             let width = self.coms['width'],
                 height = self.coms['height'];

             width.on('change', function () {
                 self.coms['paper'].set(0);
             });

             height.on('change', function () {
                 self.coms['paper'].set(0);
             });
            //
             self.labelType = self.defaultData['labelType'];
        };

        /**
         * 判断一页纸张能放几个标签
         * @param {IPagePara} pageData
         * @returns {{rowNum: number; colNum: number}}
         */
        let onePageSize = (pageData: IPagePara) => {
            let rowNum = 0;
            let colNum = 0;
            let rowCurSize = pageData.left + pageData.right;
            let colCurSize = pageData.up + pageData.down;
            while (rowCurSize <= pageData.paperWidth) {
                rowCurSize = rowCurSize + pageData.labelWidth;
                if (rowCurSize <= pageData.paperWidth) {
                    colNum++;
                }
                rowCurSize = rowCurSize + pageData.colSpace
            }
            while (colCurSize <= pageData.paperHeight) {
                colCurSize = colCurSize + pageData.labelHeight;
                if (colCurSize <= pageData.paperHeight) {
                    rowNum++;
                }
                colCurSize = colCurSize + pageData.rowSpace;
            }
            return {
                rowNum: rowNum === 0 ? 1 : rowNum,
                colNum: colNum === 0 ? 1 : colNum
            }
        };

        /**
         * 获取用户输入的各种数值
         */
        let getUserInputVal = () => {
            let tempObj = {
                paperWidth: self.coms['width'].get() * 3.78,
                paperHeight: self.coms['height'].get() * 3.78,
                up: self.coms['up'].get() * 3.78,
                down: self.coms['down'].get() * 3.78,
                left: self.coms['left'].get() * 3.78,
                right: self.coms['right'].get() * 3.78,
                rowSpace: self.coms['rowSpace'].get() * 3.78,
                colSpace: self.coms['colSpace'].get() * 3.78,
                copies: self.coms['copies'].get()
            };
            self.userInputValObj = tempObj;
        };

        /**
         打印标签的业务逻辑
         * data（Ajax获取的数据)
         * @param data
         * @param {number} x
         * @param {number} y
         * @param {number} currentPageCanvas
         */
        let printLabel = (data, x: number, y: number, currentPageCanvas: number) => {
            if (data.body !== undefined) {
                let svgWidth = data.body.bodyList[0].width * 3.78,
                    svgHeight = data.body.bodyList[0].height * 3.78;
                let drawSvg = new DrawSvg({
                    width: svgWidth,
                    height: svgHeight
                });
                //渲染到大纸张上
                let svgData = drawSvg.getSvg();
                svgData.setAttribute('x', `${x}`);
                svgData.setAttribute('y', `${y}`);
                self.pageSvgArray[currentPageCanvas].appendChild(svgData);
                let codeData = data.body.bodyList[0].lableCodes;//一维码以及二维码数据
                let textData = data.body.bodyList[0].lableDatas;//文字的数据
                let shapeData = data.body.bodyList[0].lableShapes;//图形的数据
                let lableGraphs = data.body.bodyList[0].lableGraphs;//小图标数据
                if (lableGraphs) {
                    for (let j = 0; j < lableGraphs.length; j++) {
                        if ((typeof lableGraphs[j].condition) === 'undefined' || lableGraphs[j].condition) {
                            drawSvg.icon(lableGraphs[j].lgraphId,
                                {
                                    x: lableGraphs[j].leftPos * 3.78,
                                    y: lableGraphs[j].topPos * 3.78,
                                    w: lableGraphs[j].width ? lableGraphs[j].width * 3.78 : 0,
                                    h: lableGraphs[j].height ? lableGraphs[j].height * 3.78 : 0
                                }
                            );
                        }
                    }
                }
                if (shapeData) {
                    for (let j = 0; j < shapeData.length; j++) {
                        if ((typeof shapeData[j].condition) === 'undefined' || shapeData[j].condition) {
                            drawSvg.graph(shapeData[j].shapeKind,
                                {
                                    x: shapeData[j].leftPos * 3.78,
                                    y: shapeData[j].topPos * 3.78,
                                    w: shapeData[j].width ? shapeData[j].width * 3.78 : 0,
                                    h: shapeData[j].height ? shapeData[j].height * 3.78 : 0
                                },
                                {
                                    brushColor: shapeData[j].brushColor !== undefined ? shapeData[j].brushColor : 0,
                                    penColor: shapeData[j].penColor !== undefined ? shapeData[j].penColor : 0,
                                    brushStyle: shapeData[j].brushStyle !== undefined ? shapeData[j].brushStyle : 1,
                                    penStyle: shapeData[j].penStyle !== undefined ? shapeData[j].penStyle : 0,
                                    penWidth: shapeData[j].penWidth !== undefined ? shapeData[j].penWidth : 1
                                })
                        }
                    }//循环调用绘制图形方法进行图形绘制
                }
                if (textData) {
                    for (let i = 0; i < textData.length; i++) {
                        if ((typeof textData[i].condition) === 'undefined' || textData[i].condition) {
                            let tempFont = G.tools.obj.merge({}, textData[i].font ? textData[i].font : data.body.bodyList[0].defaultFont);
                            tempFont.fontSize = tempFont.fontSize * 3.78;
                            drawSvg.text(textData[i].dataName,
                                {
                                    x: textData[i].leftPos * 3.78,
                                    y: textData[i].topPos * 3.78,
                                    w: textData[i].width ? textData[i].width * 3.78 : 0,
                                    h: textData[i].height ? textData[i].height * 3.78 : 0
                                },
                                {
                                    alignment: textData[i].alignment !== undefined ? textData[i].alignment : 0,
                                    backColor: textData[i].backColor !== undefined ? textData[i].backColor : 16777215,
                                    font: tempFont,
                                    forFill: textData[i].forFill !== undefined ? textData[i].forFill : false,
                                    autoSize: textData[i].autoSize !== undefined ? textData[i].autoSize : false,
                                    stretch: textData[i].stretch !== undefined ? textData[i].stretch : false,
                                    transparent: textData[i].transparent !== undefined ? textData[i].transparent : false,
                                    wrapping: textData[i].wrapping !== undefined ? textData[i].wrapping : false
                                }
                            );
                        }
                    }//循环调用绘制文字方法进行文字绘制
                }
                if (codeData) {
                    for (let k = 0; k < codeData.length; k++) {
                        if ((typeof codeData[k].condition) === 'undefined' || codeData[k].condition) {
                            let x = codeData[k].leftPos * 3.78,
                                w = codeData[k].width * 3.78;
                            // switch (codeData[k].alignment) {
                            //     case 0:
                            //         break;
                            //     case 1:
                            //         x = svgWidth - w;
                            //         break;
                            //     case 2:
                            //         x = x + (svgWidth - w - x) / 2;
                            //         break;
                            // }
                            if (codeData[k].codeType === 99) {

                                new QrCode(drawSvg.getSvg(), {
                                        x: x,
                                        y: codeData[k].topPos * 3.78,
                                        w: w,
                                        h: codeData[k].height * 3.78
                                    },
                                    {
                                        codeData: codeData[k].codeData ? codeData[k].codeData : 'noData'
                                    });
                            }
                            else {
                                new BarCode(drawSvg.getSvg(),
                                    {
                                        x: x + 5,
                                        y: codeData[k].topPos * 3.78,
                                        w: w,
                                        h: codeData[k].height * 3.78
                                    },
                                    {
                                        codeData: codeData[k].codeData ? codeData[k].codeData : 'noData',
                                        codeType: codeData[k].codeType
                                    });
                            }
                        }
                    }//循环调用绘制一维码或者二维码
                }
            }
        };

        let dealVarType = (data) => {
            let varType = self.para.printList[self.labelType].dataAddr.dataAddr.varType, ajaxData: any = data,
                ajaxObj: obj = {};
            if (varType === 3) {
                if (!Array.isArray(data)) {
                    ajaxData = [data];
                }
                ajaxData = JSON.stringify(data);
            }
            ajaxObj['ajaxData'] = ajaxData;
            ajaxObj['varType'] = varType;
            return ajaxObj;
        };

        return {getPrinterList, dealVarType, setInputDefault, onePageSize, getUserInputVal, printLabel}
    })(this);

    /**
     * 公共工具方法
     * @type {{dealScroll: ((direction: number) => any); scrollFunc: ((e) => any)}}
     */
    private commonUtil = (function (self) {

        let dealScroll = (direction: number) => {
            let previewBody = self.previewModal.body,
                previewBodyFot = self.previewModal.modalFooter.wrapper,
                slideInput = dom.query('.range', previewBodyFot) as HTMLInputElement,
                rangeSize = dom.query('.rangeSize', previewBodyFot),
                currentVal = parseInt(slideInput.value);

            function setZoom(val: number) {
                (val > 30) && (val = 30);
                (val <= 10) && (val = 10);
                slideInput.value = `${val}`;
                rangeSize.innerText = `${val * 10}%`;
                previewBody.style.zoom = val / 10;
            }

            if (direction > 0) {//放大
                currentVal = currentVal + 5;
                setZoom(currentVal);
            }
            else {//缩小
                currentVal = currentVal - 5;
                setZoom(currentVal);
            }
        };

        let scrollFunc = (e) => {
            e = e || window.event;
            e.preventDefault();
            if (e.wheelDelta) {//IE/Opera/Chrome
                dealScroll(e.wheelDelta);
            } else if (e.detail) {//Firefox
                dealScroll(e.detail);
            }
        };

        let bindPreviewEvent = () => {
            //动态添加滑动组件用作svg画布的放大缩小
            let sliderDiv = <div>
                    <span className="rangeLabel">缩放比例:</span>
                    <input className="range" type="range" min="10" max="30" value="10"/>
                    <span className="rangeSize">100%</span>
                </div>,
                modalFooter = self.previewModal.modalFooter.wrapper;

            modalFooter.appendChild(sliderDiv);
            let slideInput = dom.query('.range', sliderDiv) as HTMLInputElement;
            let rangeSize = dom.query('.rangeSize', sliderDiv);
            let previewBody = self.previewModal.body,
                previewBodyPar = previewBody.parentElement;
            dom.on(slideInput, 'input', () => {
                let rangeValue = parseInt(slideInput.value);
                previewBody.style.zoom = rangeValue / 10;
                rangeSize.innerText = `${rangeValue * 10}%`;
            });
            /*注册滚动事件*/
            if (document.addEventListener) {
                previewBody.parentElement.addEventListener('DOMMouseScroll', scrollFunc, false);
            }
            previewBody.parentElement.onmousewheel = previewBody.parentElement.onmousewheel = scrollFunc;//IE/Opera/Chrome


            previewBody.onmousedown = function (ev) //鼠标按下DIV
            {
                let lastX = null,
                    lastY = null;
                document.onmousemove = function (event) //为了防止鼠标移动太快而离开了DIV产生了bug，所以要给整个页面加onmousemove事件
                {
                    let curX = event.clientX,
                        curY = event.clientY;
                    if (lastX == null || lastY == null) {
                        lastX = curX;
                        lastY = curY;
                        return;
                    }
                    if (curX - lastX > 10) {
                        previewBodyPar.scrollLeft = previewBodyPar.scrollLeft - 45;
                    } else if (lastX - curX > 10) {
                        previewBodyPar.scrollLeft = previewBodyPar.scrollLeft + 45;
                    }

                    if (curY - lastY > 10) {
                        previewBodyPar.scrollTop = previewBodyPar.scrollTop - 45;
                    } else if (lastY - curY > 10) {
                        previewBodyPar.scrollTop = previewBodyPar.scrollTop + 45;
                    }
                    lastX = curX;
                    lastY = curY;
                };
                document.onmouseup = function () //鼠标松开时
                {
                    document.onmousemove = null; //把鼠标移动清楚
                    document.onmouseup = null; //把鼠标松开清楚
                };
            }
        };

        return {bindPreviewEvent}
    })(this);

    /**
     * 下拉框数据
     * @type {{printer: [{text: string; value: number}]; port: [{text: string; value: number} , {text: string; value: number}]; paper: [{value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: string; text: string} , {value: number; text: string}]; labelType: Array}}
     */
    selectInputJson = {
        printer: [{text: '默认', value: 0}],
        port: [{text: '25', value: 25}, {text: '8080', value: 8080}],
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
            {value: 0, text: '自定义'}],
        labelType: []
    };

    /**
     * 获取打印标签html模板
     * @returns {string}
     */
    static htmlTpl = () => {
        return <div>
            <div className="setDom">
                <div className='leftSet'>
                    <div className="printer" data-name="printer"></div>
                    <div className="port" data-name="port"></div>
                    <div className="scale" data-name="scale"><span>缩放</span></div>
                    <div className="ratio" data-name="ratio"><span>分辨率</span></div>
                    <div className="range">
                        <fieldset>
                            <legend>范围</legend>
                            <div data-name="pageRange"></div>
                            <div className="inline" data-name="from"><span>从</span></div>
                            <div className="inline" data-name="to"><span>到</span></div>
                        </fieldset>
                    </div>
                    <div className="direction">
                        <fieldset className="col-xs-12">
                            <legend>方向</legend>
                            <div data-name="direction"></div>
                        </fieldset>
                    </div>
                    <div className="content">
                        <fieldset className="col-xs-12">
                            <legend>内容</legend>
                            <div data-name="printData"></div>
                        </fieldset>
                    </div>
                </div>
                <div className='rightSet'>
                    <div className="paper" data-name="paper"></div>
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
                        <div data-name="horizontalRank"></div>
                        <div data-name="fillMethod"></div>
                        <div data-name="rowSpace"><span>行距</span></div>
                        <div data-name="colSpace"><span>列距</span></div>
                    </div>
                    <div className="copies" data-name="copies"><span>份数</span></div>
                </div>
            </div>
            <div className="labelTypeDom">
                <div data-name="labelType"><span> 标签类型 </span></div>
            </div>
        </div>
    }
}

