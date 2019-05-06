/// <amd-module name="NewLabelPrint"/>
/// <amd-dependency path="D3" name="D3"/>

import {LabelPrintModal} from "./labelPrintModal";
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import CONF = BW.CONF;
import {SvgDraw} from "../../../global/utils/svgDraw";
import d = G.d;
import {Loading} from "../../../global/components/ui/loading/loading";
import Rule = G.Rule;
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import Shell = G.Shell;

// 标签 打印文字
interface ILabelText {
    alignment: number;
    autoSize: boolean;
    dataName: string;
    font: ILabelTextFont;
    forFill: true;
    leftPos: number;
    topPos: number;
    transparent: boolean;
    stretch: boolean;
    wrapping: boolean;
    width: number;
    height: number;
}

// 标签打印文字字体
interface ILabelTextFont {
    fontColor: number;
    fontName: string;
    fontSize: number;
    fontStyle: number
}

// 二维码与条形码
interface ILabelCode {
    alignment: number;
    codeData: string;
    codeType: number;
    width: number;
    height: number;
    leftPos: number;
    topPos: number;
    forFill: boolean;
    codeRate: number;
}

// 字段数据
interface ILabelField {
    fieldName: string;
    atrrs: {
        displayFormat: string;
        dataType: string;
    }
}

// 图像
interface ILabelGraph {
    autoSize: boolean;
    graphId: string;
    lgraphId: number;
    width: number;
    height: number;
    leftPos: number;
    topPos: number;
    stretch: boolean;
    transparent: boolean;
    middle: boolean;
    forFill: boolean;
}

interface ILabelPrintResponse {
    defaultFont: ILabelTextFont;
    height: number;
    width: number;
    lableCodes: ILabelCode[];
    lableDatas: ILabelText[];
    lableGraphs: ILabelGraph[];
    selectFields: ILabelField[];
}

interface INewLabelPrintPara {
    container: HTMLElement;

    getData(): obj[];

    getSelectedData(): obj[];

    ui: IBW_Table;
}

export class NewLabelPrint {

    protected container: HTMLElement;
    protected printModal: LabelPrintModal;
    protected getData: () => obj[];
    protected getSelectedData: () => obj[];
    protected ui: IBW_Table;

    constructor(para: INewLabelPrintPara) {
        this.ui = para.ui;
        this.getData = para.getData;
        this.getSelectedData = para.getSelectedData;
        this.container = para.container;

        // 根据printList生成打印标签类型
        let printList: { text: string, value: any }[] = [];
        if (Array.isArray(this.ui.printList)) {
            printList = this.ui.printList.map((item, index) => {
                return {
                    text: item.caption,
                    value: index
                }
            })
        }

        // 获取壳接口的打印机信息，生成打印机选项
        let printerData = [{text: '默认', value: 0}];
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
                printerData = printer;
            }
        }catch (e){
            console.log(e);
        }

        // 初始化模态框组件
        this.printModal = new LabelPrintModal({
            container: para.container,
            onClick: (type) => {
                let promise: Promise<any>,
                    loading = new Loading({
                        msg: '加载中...'
                    });
                loading.show();
                switch (type) {
                    case 'setDefault':
                        promise = this.setDefaultProp();
                        break;
                    case 'print':
                        // if(!('BlueWhaleShell' in window || 'AppShell' in window)){
                        //     Modal.alert('无法连接到打印机');
                        //     promise = Promise.reject();
                        // }else{
                        //     promise = this.preview(true).catch((e) => {
                        //         console.log(e);
                        //         Modal.alert('打印失败');
                        //     });
                        // }
                        this.scale = getDpi() * 3;
                        promise = this.preview(true).catch((e) => {
                            console.log(e);
                            Modal.alert('打印失败');
                        });
                        break;
                    case 'preview':
                    default:
                        this.scale = getDpi();
                        promise = this.preview().catch((e) => {
                            console.log(e);
                            Modal.alert('预览失败');
                        });
                        break;
                }
                return promise.finally(() => {
                    loading && loading.hide();
                    loading = null;
                });
            },
            printList,
            printerData
        });
        // 设置默认数据
        this.printModal.data = this.getDefaultProp();
    }

    set modalShow(show: boolean) {
        this.printModal.show = show;
    }

    getDefaultProp(): obj {
        // 获取默认数据
        let defaultVal = {};
        try {
            defaultVal = JSON.parse(this.ui.printSetting);
        } catch (e) {
            console.log(e);
        }
        console.log(defaultVal);
        return defaultVal;
    }

    setDefaultProp(): Promise<any> {
        // 设置默认数据
        let data = this.printModal.data;
        return BwRule.Ajax.fetch(tools.url.addObj(BW.CONF.ajaxUrl.labelDefault, {'item_id': this.ui.itemId}), {
            type: 'POST',
            data: {
                printSetting: JSON.stringify(data)
            }
        }).then(() => {
            Modal.toast('设置默认值成功');
        }).catch(() => {
            Modal.toast('设置默认值失败');
        })
    }

    protected tmpResults: obj[] = [];
    // 获取模板数据与需打印的表格数据
    getPrintData(): Promise<{ tmp: ILabelPrintResponse, data: obj[], title: string }> {
        let index = this.printModal.getData('labelType'),
            tmpPromise: Promise<any>,
            dataAddr = this.ui.printList[index].dataAddr,
            caption = this.ui.printList[index].caption,
            templateLink = this.ui.printList[index].templateLink,
            isAll = !!this.printModal.getData('printData')[0],
            tableData = isAll ? this.getSelectedData() : this.getData(), //获取选中数据或全部数据
            ajaxData: any;

        // 没有获取到数据则不继续
        if (tableData.length === 0) {
            Modal.alert('没有数据选中');
            return Promise.reject();
        }
        let {addr, data} = BwRule.reqAddrFull(dataAddr, tableData);
        ajaxData = data;
        if (dataAddr.varType === 3) {
            if (!Array.isArray(ajaxData)) {
                ajaxData = [ajaxData];
            }
            ajaxData = JSON.stringify(ajaxData);
        }

        // 判断tmp模板是否已请求
        if(index in this.tmpResults){
            tmpPromise = Promise.resolve(this.tmpResults[index]);
        }else{
            tmpPromise = BwRule.Ajax.fetch(CONF.siteUrl + templateLink.dataAddr).then((result) => {
                this.tmpResults[index] = result;
                return result;
            });
        }

        return new Promise((resolve, reject) => {
            tmpPromise.then(({response}) => {
                let tmp = tools.keysVal(response, 'body', 'bodyList', 0) as ILabelPrintResponse,
                    names = this.ui.cols.map((field) => field.name),
                    tmpNames = tmp.selectFields.map((field) => field.fieldName);
                if(tmpNames.every((name) => !!~names.indexOf(name))){
                    resolve({
                        tmp: tmp,
                        data: tableData,
                        title: caption
                    })
                }else{
                    BwRule.Ajax.fetch(CONF.siteUrl + addr, {
                        data2url: dataAddr.varType !== 3,
                        // type: 'GET',
                        data: ajaxData,
                    }).then(({response}) => {
                        let data = tools.keysVal(response, 'data') as obj[];
                        resolve({
                            tmp: tmp,
                            data: data,
                            title: caption
                        })
                    });
                }
            }).catch((e) => {
                reject(e);
            })
        });
    }

    // 根据模板数据与表格数据，获取全部生成的svg标签
    getLabels(): Promise<{svgList: SvgDraw[], wrapper: HTMLElement, tmp: ILabelPrintResponse, data: obj[], title: string}>{
        return new Promise((resolve, reject) => {

            this.getPrintData().then(({tmp, data, title}) => {
                let svgList: SvgDraw[] = [],
                    wrapper = <div/>;

                // 获取需要金额格式化的字段名称
                let moneys = tmp.selectFields.filter((field) => {
                    return field.atrrs ? field.atrrs.dataType == '11' : false;
                });

                data.forEach((item, index) => {
                    let data = Object.assign({}, item || {});
                    // 格式化金额数据
                    for (let money of moneys) {
                        let key = money.fieldName;
                        if (data[key]) {
                            data[key] = '¥' + Rule.parseNumber(data[key], money.atrrs.displayFormat);
                        }
                    }
                    // 默认将svg放置到body上
                    let svg = this.initPrintSvg(tmp, data);
                    svgList.push(svg);
                    d.append(wrapper, svg.svgEl);
                });


                resolve({
                    svgList,
                    wrapper,
                    tmp,
                    data,
                    title
                })
            }).catch((e) => {
                reject(e);
            });
        });
    }

    print(svgEl: SVGSVGElement){
        require(['canvg', 'rgbcolor', 'stackblur-canvas'], (canvg) => {
            // console.log(canvg);

            let canvas = <canvas/>,
                copies = this.printModal.getData('copies');

            svgEl.innerHTML = new Array(11).join(svgEl.innerHTML);
            d.append(document.body, canvas);

            canvg(canvas, svgEl.outerHTML, {
                renderCallback: () => {
                    let scale = 1,
                        printCanvas = <canvas width={canvas.width * scale} height={canvas.height * scale}/>,
                        cxt = printCanvas.getContext('2d');
                    cxt.scale(scale, scale);
                    cxt.fillStyle = "#fff";
                    cxt.fillRect(0, 0, printCanvas.width, printCanvas.height);
                    cxt.drawImage(canvas, 0, 0);
                    d.remove(canvas);
                    canvas = null;
                    new Modal({
                        body: printCanvas,
                        header: '展示',
                    });
                    let dataURL = printCanvas.toDataURL("image/png", 1),
                        url = dataURL.replace('data:image/png;base64,', '');

                    if ('BlueWhaleShell' in window) {
                        BlueWhaleShell.postMessage('callPrint', '{"quantity":1,"driveCode":"3","image":"' + url + '"}');
                    } else if ('AppShell' in window) {
                        let code = this.printModal.getData('printer');
                        let settingData: obj = this.printModal.data;
                        Shell.printer.labelPrint(copies, code, url, () => {
                            Modal.toast('打印成功');
                        }, {
                            width: parseFloat(settingData.width),
                            height: parseFloat(settingData.height),
                        })
                    } else {
                        Modal.alert('无法连接到打印机');
                    }
                }
            });
        });

    }

    /*print(){
        return new Promise((resolve, reject) => {
            if(!('BlueWhaleShell' in window || 'AppShell' in window)){
                Modal.alert('无法连接到打印机');
                resolve();
                return ;
            }

            this.getLabels().then(({svgList, tmp, data}) => {
                let copies = this.printModal.getData('copies'),
                    promises: Promise<string>[] = [];

                for(let svg of svgList){

                    promises.push(new Promise<string>((resolve) => {
                        // svg.svgEl.style.transformOrigin = '0 0';
                        // svg.svgEl.style.transform = 'scale(10)';

                        require(['canvg', 'rgbcolor', 'stackblur-canvas'], (canvg) => {
                            // console.log(canvg);
                            let scale = 5,
                                svgWidth = parseFloat(svg.svg.attr('width')),
                                svgHeight = parseFloat(svg.svg.attr('height'));
                            svg.svg.attr('width', svgWidth * scale);
                            svg.svg.attr('height', svgHeight * scale);
                            svg.svg.style('margin-right', 0);
                            svg.svg.style('margin-bottom', 0);
                            svg.g.attr('transform', 'scale(' + scale + ')');
                            let canvas = <canvas/>,
                                svgEl = svg.svgEl;
                            svgEl.innerHTML = new Array(8).join(svgEl.innerHTML);
                            d.append(document.body, canvas);

                            canvg(canvas, svgEl.outerHTML, {
                                renderCallback: () => {
                                    let scale = 2,
                                        printCanvas = <canvas width={canvas.width * scale} height={canvas.height * scale}/>,
                                        cxt = printCanvas.getContext('2d');
                                    cxt.scale(scale, scale);
                                    cxt.fillStyle = "#fff";
                                    cxt.fillRect(0, 0, printCanvas.width, printCanvas.height);
                                    cxt.drawImage(canvas, 0, 0);
                                    d.remove(canvas);
                                    canvas = null;
                                    // new Modal({
                                    //     body: printCanvas,
                                    //     header: '展示',
                                    // });
                                    let dataURL = printCanvas.toDataURL("image/png", 1),
                                        url = dataURL.replace('data:image/png;base64,', '');
                                    // console.log(dataURL);
                                    if ('BlueWhaleShell' in window) {
                                        BlueWhaleShell.postMessage('callPrint', '{"quantity":1,"driveCode":"3","image":"' + url + '"}');
                                    } else if ('AppShell' in window) {
                                        let code = this.printModal.getData('printer');
                                        Shell.printer.labelPrint(copies, code, url, () => {
                                            Modal.toast('打印成功');
                                        })
                                    } else {
                                        Modal.alert('无法连接到打印机');
                                    }
                                    resolve();
                                }
                            });
                        });
                    }));

                }

                Promise.all(promises).then(() => {
                    resolve();
                }).catch((e) => {
                    reject(e);
                })
            }).catch((e) => {
                reject(e);
            });
        })
    }*/

    // 预览方法
    preview(isPrint = false){
        return this.getLabels().then(({svgList, tmp, data, title}) => {
            let settingData: obj = this.printModal.data,
                dpi = this.scale, // 分辨率，宽高边距均为毫米，乘分辨率便为像素
                width = settingData.width * dpi,
                height = settingData.height * dpi,
                paddingLeft = settingData.left * dpi,
                paddingRight = settingData.right * dpi,
                paddingTop = settingData.up * dpi,
                paddingBottom = settingData.down * dpi,
                rowSpace = this.printModal.getData('rowSpace') * dpi,
                colSpace = this.printModal.getData('colSpace') * dpi,
                isLengthWays = !settingData.horizontalRank,
                isHorizontal = !settingData.direction[0], // 横向时，将宽高互换
                scale = settingData.scale;

            if(isHorizontal){
                [width, height] = [height, width];
            }

            let xLinear = d3.scale.linear().domain([0, width]).range([0, width]),
                yLinear = d3.scale.linear().domain([0, height]).range([0, height]),
                zoom = d3.behavior.zoom()
                    .size([width, height])
                    .x(xLinear)
                    .y(yLinear)
                    .scaleExtent([0.5, 5])
                    .scale(scale)
                    .on('zoomstart', function () {
                        // d3.select(this).on("dblclick.zoom", null);
                    })
                    .on('zoom', function () {
                        let event = d3.event as d3.ZoomEvent,
                            x = event.translate[0],
                            y = event.translate[1],
                            scale = event.scale;
                        d3.select(wrapper)
                            .style('transform', `translate(${x}px, ${y}px) scale(${scale})`)
                    });

            let wrapper = <svg className="label-print-content" style={{
                width: width + 'px',
                height: height + 'px',
                "-webkit-flex-direction": isLengthWays ? 'column' : 'row',
                "flex-direction": isLengthWays ? 'column' : 'row',
                padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
            }}/>;

            let svgHeight = tmp.height * this.scale,
                svgWidth = tmp.width * this.scale,
                row = Math.floor((height - paddingTop - paddingBottom + rowSpace) / (svgHeight + rowSpace)),
                col = Math.floor((width - paddingLeft - paddingRight + colSpace) / (svgWidth + colSpace));
            if(isLengthWays){
                [row, col] = [col, row];
            }
            let pageSize = (row * col) || 1,
                total = Math.ceil(data.length / (pageSize)),
                marginRight = 'marginRight',
                marginBottom = 'marginBottom';

            svgList.slice(0, pageSize).forEach((svg, index, {length}) => {
                if((index + 1) % col !== 0){
                    svg.svgEl.style[marginRight] = colSpace + 'px';
                }
                if(index < length - col){
                    svg.svgEl.style[marginBottom] = rowSpace + 'px';
                }

                d.append(wrapper, svg.svgEl);
            });

            let current = 0;
            function toPageSvg(num: number){
                let arr = svgList.slice(num * pageSize, (num + 1) * pageSize);
                wrapper.innerHTML = '';
                arr.forEach((svg, index, {length}) => {
                    if((index + 1) % col !== 0){
                        svg.svgEl.style[marginRight] = colSpace + 'px';
                    }
                    if(index < length - col){
                        svg.svgEl.style[marginBottom] = rowSpace + 'px';
                    }
                    d.append(wrapper, svg.svgEl);
                });
                zoom.scale(1).translate([0, 0]);
                d3.select(wrapper)
                    .style('transform', `translate(0, 0) scale(${1})`);
            }
            let inputBox = new InputBox(),
                prevBtn = new Button({
                    key: 'prev',
                    content: '上一页',
                    type: 'primary',
                    isDisabled: true,
                    onClick: () => {
                        current --;
                        current = Math.max(0, current);
                        current = Math.min(total - 1, current);
                        toPageSvg(current);
                        prevBtn.isDisabled = current === 0;
                        nextBtn.isDisabled = false;
                    }
                }),
                nextBtn = new Button({
                    key: 'next',
                    content: '下一页',
                    type: 'primary',
                    isDisabled: total <= 1,
                    onClick: () => {
                        current ++;
                        current = Math.max(0, current);
                        current = Math.min(total - 1, current);
                        toPageSvg(current);
                        nextBtn.isDisabled = current === total - 1;
                        prevBtn.isDisabled = false;
                    }
                });

            inputBox.addItem(prevBtn);
            inputBox.addItem(nextBtn);

            title = title ? '预览 - ' + title : '预览';
            let modal = new Modal({
                header: {
                    title: title,
                    isFullScreen: true
                },
                container: this.container,
                width: width + 'px',
                height: '80%',
                body: wrapper,
                isOnceDestroy: true,
                className: 'new-label-print-modal',
                footer: {
                    rightPanel: inputBox
                }
                // top: 0,
            });
            d3.select(modal.bodyWrapper).call(zoom);
            d3.select(wrapper)
                .style('transform', `translate(0, 0) scale(${scale})`);

            if(isPrint){
                this.print(wrapper.cloneNode(true));
                while(current < total - 1){
                    current ++;
                    toPageSvg(current);
                    this.print(wrapper.cloneNode(true));
                }
                modal.isShow = false;
            }
        });
    }

    initPrintSvg(tmp: ILabelPrintResponse, data: obj, isPrint = false): SvgDraw {
        let height = tmp.height,
            width = tmp.width,
            defaultFont = tmp.defaultFont,
            lableDatas = tmp.lableDatas,
            lableCodes = tmp.lableCodes,
            lableGraphs = tmp.lableGraphs,
            scale = this.scale;

        let svg = new SvgDraw({
            height: height * scale,
            width: width * scale,
            container: document.body
        });

        // 生成文字信息
        lableDatas && lableDatas.forEach((item) => {
            // forFill为false时，则不打印，可以预览，以下类型一样
            if (!isPrint || (tools.isEmpty(item.forFill) || item.forFill)) {
                let fontObj = Object.assign({}, defaultFont, item.font) as ILabelTextFont,
                    {r, g, b} = tools.val2RGB(fontObj.fontColor),
                    text = NewLabelPrint.getTmpData(item.dataName, data);

                svg.drawText({
                    data: text, // 文字信息
                    width: (item.width || 0) * scale,
                    x: item.leftPos * scale,
                    y: item.topPos * scale,
                    height: item.height * scale,
                    font: { // 字体相关
                        size: fontObj.fontSize * scale,
                        family: fontObj.fontName,
                        color: `rgb(${r}, ${g}, ${b})`,
                        weight: fontObj.fontStyle == 1 && 'bold'
                    },
                    align: NewLabelPrint.alignTag[item.alignment], // 对齐方式
                    isWrap: item.wrapping || false // 是否换行
                })
            }
        });

        // 生成二维码或条形码
        lableCodes && lableCodes.forEach((item) => {
            if (!isPrint || (tools.isEmpty(item.forFill) || item.forFill)) {
                let type = item.codeType;
                // codeType为99 时为二维码
                if (type === 99) {
                    svg.drawQrCode({
                        width: item.width * scale,
                        height: item.height * scale,
                        x: item.leftPos * scale,
                        y: item.topPos * scale,
                        data: NewLabelPrint.getTmpData(item.codeData, data)
                    });
                } else {
                    // 其余为条形码
                    svg.drawBarCode({
                        data: NewLabelPrint.getTmpData(item.codeData, data),
                        width: item.width * scale,
                        height: item.height * scale,
                        x: item.leftPos * scale,
                        y: item.topPos * scale,
                        barCodeWidth: (item.codeRate || 0.2) * scale,
                        align: NewLabelPrint.alignTag[item.alignment], // 对齐方式
                        format: NewLabelPrint.codeType[type] // 条形码类型
                    });
                }

            }
        });

        // 打印图片
        lableGraphs && lableGraphs.forEach((item) => {
            if (!isPrint || (tools.isEmpty(item.forFill) || item.forFill)) {
                svg.drawImage({
                    data: G.requireBaseUrl + `../img/label/${item.lgraphId}${NewLabelPrint.iconSuffix[item.lgraphId]}`,
                    x: item.leftPos * scale,
                    y: item.topPos * scale,
                    width: item.width * scale,
                    height: item.height * scale
                });
            }
        });

        return svg;
    }

    protected scale = 1; // 固定放大倍数
    static iconSuffix = {
        1: '.bmp',
        2: '.bmp',
        3: '.gif',
        4: '.bmp',
        50000: '.bmp',
        50001: '.bmp',
        90000: '.jpeg',
        90001: '.jpeg'
    };
    static codeType = {
        0: 'ITF',
        3: 'CODE39',
        4: 'CODE39',
        5: 'CODE128A',
        6: 'CODE128B',
        7: 'CODE128C',
    };
    static alignTag: Array<'start' | 'end' | 'middle'> = ['start', 'end', 'middle'];

    static getTmpData(value: string, data: obj): string {
        let str = '',
            parseURLReg = /\[(\S+?)]/g;
        if (typeof value === 'string') {
            let isJs = value.match(/^javascript:/i),
                tempResult: string;
            tempResult = value.replace(parseURLReg, function (word, $1) {
                let replaced = G.tools.str.toEmpty(data[$1.toUpperCase()]).toString();
                return isJs ? `'${replaced.replace(/'/g, "/'")}'` : replaced;
            });

            if (isJs) {
                tempResult = tempResult.replace(/^javascript:/i, '');
                tempResult = '(function(){' + tempResult;
                tempResult = tempResult + '}())';
                try {
                    tempResult = eval(tempResult);
                } catch (e) {
                    console.log(e);
                    tempResult = '';
                }
            }
            str = tempResult;
        }
        return str;
    }


}

const getDpi = (() => {
    let deviceDpi: number = null;
    return function(): number{
        if(deviceDpi){
            return deviceDpi;
        }
        let arrDPI = [];
        let tmpNode = document.createElement("div");
        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
        document.body.appendChild(tmpNode);
        arrDPI[0] = tmpNode.offsetWidth;
        arrDPI[1] = tmpNode.offsetHeight;
        tmpNode.parentNode.removeChild(tmpNode);
        deviceDpi = arrDPI[0] / 25.4;
        deviceDpi = deviceDpi || 3.78;
        return deviceDpi;
    }
})();