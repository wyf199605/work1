/// <amd-module name="FlowDesigner"/>
/// <amd-dependency path="raphael" name="Raphael"/>

import d = G.d;
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import {FlowItem} from "./FlowItem";
import {LineItem} from "./LineItem";
import {FlowEditor, IFieldPara} from "./FlowEditor";
import {Tips} from "./Tips";
import Component = G.Component;

declare const Raphael;

Raphael.fn.connection = function (obj1, obj2, line, bg) {
    bg = '#b6d1e0';
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }

    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
            {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
            {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
            {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
            {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
            {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
            {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
            {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#b6d1e0";
        return {
            bg: bg && bg.split && this.path(path).attr({
                stroke: bg.split("|")[0],
                fill: "none",
                "stroke-width": bg.split("|")[1] || 2
            }),
            line: this.path(path).attr({stroke: color, fill: "none", 'arrow-end': 'block-wide-long', 'stroke-width': 2.5}),
            from: obj1,
            to: obj2
        };
    }
};

export const Method = {
    // 方法集合
    loadXMLStr: function (xmlStr: string) {
        // 从xml字符串中加载xml对象
        let parseXML: any;
        if (typeof DOMParser == "function") {
            parseXML = function (xmlStr) {
                return (new DOMParser()).parseFromString(xmlStr, "text/xml");
            }
        } else if (typeof window['ActiveXObject'] != 'undefined' && new Window['ActiveXObject']('Microsoft.XMLDOM')) {
            parseXML = function (xmlStr) {
                let xmlDOC = new Window['ActiveXObject']("Microsoft.XMLDOM");
                xmlDOC.async = 'false';
                xmlDOC.loadXML(xmlStr);
                return xmlDOC;
            };
        } else {
            throw new Error("No XML parser found");
        }
        return parseXML(xmlStr);
    },
    searchFlowItem: function (name: string) {
        // 根据data-name寻找对应的节点
        return FlowDesigner.ALLITEMS.filter(item => item.wrapper.dataset.name === name)[0];
    },
    getFields: function(node: Node, type: string = node['tagName']){
        // 根据类型属性限定表(ATTR_LIMIT)中的属性查找节点的所有属性值，返回该节点所有属性和值的集合
        let fields = {};
        FlowEditor.ATTR_LIMIT[type] && FlowEditor.ATTR_LIMIT[type].forEach(item => {
            item in node['attributes'] && (fields[item] = node['attributes'].getNamedItem(item).value);
        });
        return fields;
    },
    parseToXml: (() => {
        let xmlDoc=document.implementation.createDocument("","",null);
        xmlDoc['async']="false";
        return {
            // 创建新的xml节点
            createXmlElement: (tagNames: string[] | string) => {
                let elements;
                if(tagNames instanceof Array){
                    elements = {};
                    tagNames.forEach(tagName => {
                        elements[tagName] = xmlDoc.createElement(tagName);
                    });
                }else{
                    elements = xmlDoc.createElement(tagNames);
                }
                return elements;
            },
            // 设置xml节点的属性
            setAttr: (targetEle: Element, keyValue: object) => {
                Object.keys(keyValue).forEach(key => {
                    tools.isNotEmpty(keyValue[key]) && targetEle.setAttribute(key, keyValue[key]);
                })
            },
        }
    })(),
};

export class FlowDesigner {
    static CURRENT_SELECT_TYPE: string;     // 当前选择的节点的类型
    static PAPER;
    static ALLITEMS: FlowItem[] = [];       // 所有的节点
    static connections: any[] = [];
    static AllLineItems: LineItem[] = [];   // 所有的连接线
    static rootElement: Element;            // 当前流程的xml节点树
    static processId: number;               // 当前流程的id
    static FlowType: string;                // 当前操作的类型（设计design或查看状态look）
    static removeAllActive() {
        FlowItem.removeAllActiveClass();
        LineItem.removeAllActive();
        FlowEditor.hideAllDropdown();
    }

    constructor(responseData?: any, type?: string) {
        type && (FlowDesigner.FlowType = type);
        FlowEditor.EXIST_NAME = [];
        let body = <div className="design-canvas" id="design-canvas"/>;
        this.modal = new Modal({
            body: body,
            header: {
                title: '流程设计',
                rightPanel: <i className={'icon-fullscreen iconfont icon-zuidahua'}></i>
            },
            className: 'flow-modal',
            width: '90%',
            height: '90%',
            onClose: () => {
                this.destroy();
                this.modal.destroy();
            }
        });
        let Tip: Tips = null;
        FlowDesigner.FlowType === 'design' && (
            Tip = new Tips({
                container: this.modal.wrapper
            })
        );

        let paper = window.getComputedStyle(body),
            paperWidth = paper.width,
            paperHeight = paper.height;
        FlowDesigner.PAPER = Raphael('design-canvas', parseInt(paperWidth.slice(0, paperWidth.length - 2)), parseInt(paperHeight.slice(0, paperHeight.length - 2)));

        this.initEvents.on();
        let _this = this;

        // 如果有responseData传入，根据responseData获取xml==>根据xml绘制流程；如果没有则需要自己绘制流程
        if (tools.isNotEmpty(responseData)){
            // 从xml中读取时，改变标题、隐藏流程的属性、移除保存功能
            if(FlowDesigner.FlowType === 'look'){
                this.modal.modalHeader.title = '查看流程';
                d.query('#design-canvas').style.left = '0px';
                d.query('#design-canvas').style.width = '100%';
                d.query('#design-canvas').style.pointerEvents = 'none';
            }else{
                FlowDesigner.processId = responseData.data[0]['process_id'];
            }

            let xmlStr = responseData.data[0].process,
                rootElement = Method.loadXMLStr(xmlStr).documentElement;
            // console.log('xml initial: ');
            // console.log(xmlStr);

            // 在绘制前，需要根据layout重设画布的大小
            let maxWidth = 0,
                maxHeight = 0,
                maxItemWidth = 0,
                maxItemHeight = 0;
            rootElement.childNodes.forEach((child) => {
                if(child.nodeType === 1){
                    let layout = child.attributes.layout && child.attributes.layout.value.split(',')
                        .map(item => parseInt(item));
                    if(tools.isNotEmptyArray(layout)){
                        maxWidth = Math.max(layout[0], maxWidth);
                        maxHeight = Math.max(layout[1], maxHeight);
                        maxItemWidth = Math.max(layout[2], maxItemWidth);
                        maxItemHeight = Math.max(layout[3], maxItemHeight);
                    }
                }
            });
            FlowDesigner.PAPER.setSize(Math.max(FlowDesigner.PAPER.width, maxWidth + maxItemWidth),
                Math.max(FlowDesigner.PAPER.height, maxHeight + maxItemHeight));

            // 绘制xml中的所有节点
            rootElement.childNodes.forEach((child) => {
                if (child.nodeType === 1) {
                    let layout = child.attributes.layout && child.attributes.layout.value.split(',')
                            .map(item => parseInt(item)),
                        isComplete: boolean = false,
                        fields = Method.getFields(child);
                    // 存在xml中没有isComplete属性情况
                    'isComplete' in child.attributes && (
                        isComplete = child.attributes.isComplete.value === 'true'
                    );
                    let shape: FlowItem = null;
                    layout && (shape = new FlowItem({
                        type: child.tagName,
                        text: fields['displayName'],
                        position: {x: layout[0], y: layout[1]},
                        width: layout[2],
                        height: layout[3],
                        isComplete: isComplete,
                        container: d.query('#design-canvas'),
                        fields: fields,
                    }));

                    if(tools.isNotEmpty(shape)){
                        // 设置节点的data-name
                        let arr = FlowDesigner.ALLITEMS || [];
                        FlowDesigner.ALLITEMS = arr.concat([shape]);
                        shape.calcWidthAndHeight();
                        shape.wrapper.dataset.name = child.attributes.name.value;

                        if(FlowDesigner.FlowType === 'look'){
                            if(shape.isComplete){
                                shape.wrapper.style.color = 'white';
                                shape.wrapper.style.backgroundColor = FlowItem.itemColor[child.tagName];
                            }
                            else{
                                shape.wrapper.style.backgroundColor = '#ffffff';
                                shape.wrapper.style.borderColor = FlowItem.itemColor[child.tagName];
                            }
                            if(shape.isStart && shape.isComplete){
                                d.query('.inner-circle', shape.wrapper).style.backgroundColor = '#ffffff';
                            }
                        }
                    }
                }
            });

            // 绘制连接线
            rootElement.childNodes.forEach(child => {
                if (child.nodeType === 1) {
                    let transitions = d.queryAll('transition', child);
                    transitions.forEach(transition => {
                        if (tools.isNotEmpty(transition) && transition.attributes['to'] &&
                            tools.isNotEmpty(transition.attributes['to'].value)) {
                            let start = Method.searchFlowItem(child.attributes.name.value),
                                end = Method.searchFlowItem(transition.attributes['to'].value) || null;

                            // xml中最后的节点可能有to属性，但是最后的节点是没有连线的
                            if (tools.isEmpty(end)) {
                                return;
                            }
                            let lineItem = new LineItem({
                                startNode: start.rectNode,
                                endNode: end.rectNode,
                                container: d.query('#design-canvas'),
                                fields: Method.getFields(transition),
                            });
                            lineItem.active = false;

                            let relationsArr = start.relations || [],
                                lineItems = start.lineItems || [],
                                allLineItems = FlowDesigner.AllLineItems || [];
                            FlowDesigner.AllLineItems = allLineItems.concat([lineItem]);
                            start.relations = relationsArr.concat(end);
                            start.lineItems = lineItems.concat([lineItem]);
                            FlowDesigner.removeAllActive();
                        }
                    })
                }
            });

            // 如果节点已经完成，则对应的连接线的颜色也要改变
            FlowDesigner.ALLITEMS.filter(item => item && item.isComplete).forEach((item, index, arr) => {
                tools.isNotEmptyArray(item.lineItems) && item.lineItems.forEach(lineItem => {
                    arr[index + 1] && arr[index + 1].isComplete && (lineItem.isComplete = true);
                });
            });

            // 所有的下拉列表都不可用
            FlowDesigner.FlowType === 'look' && (
                // 禁用所有input
                d.queryAll('input').forEach(input => {
                    (input as HTMLInputElement).readOnly = true;
                }),
                    [].concat(FlowDesigner).concat(FlowDesigner.AllLineItems).concat(FlowDesigner.ALLITEMS)
                        .forEach(item => item.flowEditor && item.flowEditor.initEvents.off()),
                    d.queryAll('.floweditor-dropdown').forEach(item => d.remove(item))
            );
        }
    }

    private _modal = null;
    get modal(){
        return this._modal;
    }
    set modal(modal){
        this._modal = modal;
    }

    private initEvents = (() => {
        let clickSVG = (e) => {
            let target = e.target;
            if (target.tagName === 'svg') {
                FlowDesigner.removeAllActive();
                Tips.removeActive();
                FlowItem.toggleDisabledStartAndEnd();
            }
        };
        let resizeHandler = (e) => {
            // 窗口大小改变时需要重新设置paper的大小，并且重绘连接线
            FlowDesigner.PAPER.setSize(
                Math.max(d.query('#design-canvas').clientWidth, FlowDesigner.PAPER.width),
                Math.max(d.query('#design-canvas').clientHeight, FlowDesigner.PAPER.height)
            );
            FlowDesigner.ALLITEMS && FlowDesigner.ALLITEMS.forEach(item => item.calcWidthAndHeight());
            FlowDesigner.AllLineItems && FlowDesigner.AllLineItems.forEach(line => line.setTextWrapperPosition());
            FlowDesigner.connections && FlowDesigner.connections.forEach(connection => FlowDesigner.PAPER.connection(connection));
        };
        let clickFullscreenHandler = (e) => {
            this.modal.wrapper.classList.toggle('full-screen');
            d.query('.icon-fullscreen').classList.toggle('icon-zuidahua');
            d.query('.icon-fullscreen').classList.toggle('icon-chuangkouhua');
        };
        let mouseWheelHandler = (e) => {

        };

        return {
            on: () => {
                d.on(d.query('#design-canvas'), 'click', 'svg', clickSVG);
                d.on(window, 'resize', resizeHandler);
                d.on(d.query('#design-canvas'), 'mousewheel', mouseWheelHandler);
                d.on(d.query('.icon-fullscreen'), 'click', clickFullscreenHandler);
            },
            off: () => {
                d.off(d.query('#design-canvas'), 'click', 'svg', clickSVG);
                d.off(window, 'resize', resizeHandler);
                d.off(d.query('#design-canvas'), 'mousewheel', mouseWheelHandler);
                d.off(d.query('.icon-fullscreen'), 'click', clickFullscreenHandler);
            },
        }
    })();

    destroy() {
        FlowDesigner.FlowType = null;
        FlowDesigner.AllLineItems = [];
        FlowDesigner.CURRENT_SELECT_TYPE = '';
        FlowDesigner.PAPER = null;
        FlowDesigner.ALLITEMS = [];
        FlowDesigner.connections = [];
        FlowEditor.EXIST_NAME = [];
        FlowDesigner.rootElement = null;
        FlowItem.endCounter = 0;
        FlowItem.startCounter = 0;
        LineItem.counter = 0;
        this.initEvents.off();
    }
}