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
            line: this.path(path).attr({stroke: color, fill: "none"}),
            from: obj1,
            to: obj2
        };
    }
};

const Method = {
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
        FlowEditor.ATTR_LIMIT[type].forEach(item => {
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
    static CURRENT_SELECT_TYPE: string;
    static PAPER;
    static ALLITEMS: FlowItem[] = [];
    static connections: any[] = [];
    static AllLineItems: LineItem[] = [];
    static flowEditor: FlowEditor;
    static rootElement: Element;

    constructor(url?: string) {
        FlowEditor.EXIST_NAME = [];
        let body = <div className="design-canvas" id="design-canvas"/>;
        let modal = new Modal({
            body: body,
            header: {
                title: '新增流程',
                rightPanel: <i className="add-flow icon-jiahao"></i>,
            },
            className: 'flow-modal',
            width: '90%',
            height: '90%',
            onClose: () => {
                this.destroy();
                modal.destroy();
            }
        });
        let Tip: Tips;
        tools.isEmpty(url) && (Tip = new Tips({
            container: body
        }));

        let paper = window.getComputedStyle(body),
            paperWidth = paper.width,
            paperHeight = paper.height;
        FlowDesigner.PAPER = Raphael('design-canvas', parseInt(paperWidth.slice(0, paperWidth.length - 2)), parseInt(paperHeight.slice(0, paperHeight.length - 2)));

        FlowDesigner.flowEditor = new FlowEditor({
            type: 'flow-designer',
            container: d.query('#design-canvas'),
            owner: this,
        });
        this.initEvents.on();
        let _this = this;

        // 如果有url传入，根据url获取xml==>根据xml绘制流程（流程不可修改）
        // 如果没有则需要自己绘制流程
        if (tools.isNotEmpty(url)) {
            BwRule.Ajax.fetch(url).then(({response}) => {
                // 从xml中读取时，改变标题、隐藏流程的属性、移除保存功能
                FlowDesigner.flowEditor.show = false;
                modal.modalHeader.title = '查看流程';
                _this.initEvents.closeAddFlow();
                d.remove(d.query('.header-btn-right'));

                let xmlStr = response.body.bodyList[0].dataList[0].toString(),
                    rootElement = Method.loadXMLStr(xmlStr).documentElement;

                // 设置FlowDesigner的属性
                let fields = Method.getFields(rootElement, 'flow-designer');
                FlowDesigner.flowEditor.set(fields);

                // 绘制xml中的所有节点
                rootElement.childNodes.forEach((child) => {
                    if (child.nodeType === 1) {
                        let layout = child.attributes.layout.value.split(',').map(item => parseInt(item)),
                            isComplete: boolean = false,
                            fields = Method.getFields(child);

                        // 存在xml中没有isComplete属性情况
                        'isComplete' in child.attributes && (
                            isComplete = child.attributes.isComplete.value === 'true'
                        );
                        let shape = new FlowItem({
                            type: child.tagName,
                            text: fields['displayName'],
                            position: {x: layout[0], y: layout[1]},
                            width: layout[2],
                            height: layout[3],
                            isComplete: isComplete,
                            container: d.query('#design-canvas'),
                            fields: fields,
                        });

                        // 设置节点的data-name
                        shape.wrapper.dataset.name = child.attributes.name.value;
                        let arr = FlowDesigner.ALLITEMS || [];
                        FlowDesigner.ALLITEMS = arr.concat([shape]);

                        // 开始节点的內圆也要改变颜色
                        if(shape.isStart && shape.isComplete){
                            d.query('.inner-circle', shape.wrapper).style.backgroundColor = '#31ccff';
                        }
                    }
                });

                // 绘制连接线
                rootElement.childNodes.forEach(child => {
                    if (child.nodeType === 1) {
                        let transitions = d.queryAll('transition', child);
                        transitions.forEach(transition => {
                            if (tools.isNotEmpty(transition) && tools.isNotEmpty(transition.attributes['to'].value)) {
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
                FlowDesigner.ALLITEMS.filter(item => item.isComplete).forEach(item => {
                    tools.isNotEmptyArray(item.lineItems) && item.lineItems.forEach(lineItem => {
                        lineItem.isComplete = true;
                    });
                });

                // FlowDesigner.flowEditor.disabled = true;
                // 设置节点不可移动但可以点击查看属性
                FlowDesigner.ALLITEMS.forEach(item => {
                    item.initEvents.closeDrag();
                    // item.flowEditor.disabled = true;
                });
                // FlowDesigner.AllLineItems.forEach(item => {
                //     item.flowEditor.disabled = true;
                // });

                // 禁用所有input
                d.queryAll('input').forEach(input => {
                    (input as HTMLInputElement).disabled = true;
                });

                // FlowDesigner.flowEditor.show = true;
            }).catch(err => {
                console.log(err);
            });
        }
    }

    static removeAllActive() {
        FlowItem.removeAllActiveClass();
        LineItem.removeAllActive();
        FlowEditor.hideAllDropdown();
    }

    private initEvents = (() => {
        let clickSVG = (e) => {
            let target = e.target;
            if (target.tagName === 'svg') {
                FlowDesigner.removeAllActive();
                FlowDesigner.flowEditor.show = true;
            }
        };
        let addFlowHandler = (e) => {
            // 初始化rootElement并设置其属性
            let xmlDoc = Method.loadXMLStr(`<?xml version="1.0" encoding="UTF-8"?><process></process>`);
            FlowDesigner.rootElement = xmlDoc.documentElement;
            Method.parseToXml.setAttr(FlowDesigner.rootElement, FlowDesigner.flowEditor.get());

            FlowDesigner.ALLITEMS.forEach(item => {
                // 创建节点、设置属性、添加到xml节点树中
                let type = item.flowEditor.type,
                    xmlNode = Method.parseToXml.createXmlElement(type),
                    attrs = item.rectNode.attrs,
                    layoutStr = [attrs.cx || attrs.x, attrs.cy || attrs.y, attrs.r || attrs.width, attrs.r || attrs.height].join(),
                    dropdownField: IFieldPara = {};
                Method.parseToXml.setAttr(xmlNode, Object.assign({layout: layoutStr}, item.flowEditor.get(), dropdownField));
                // 对于下拉选择的属性，因为要传给后台的数据和input里的值不同，所以要根据DROPDOWN_KEYVALUE进行转换，将'真'数据传给后台
                Object.keys(FlowEditor.DROPDOWN_KEYVALUE).forEach(attr => {
                    FlowEditor.DROPDOWN_KEYVALUE[attr].forEach(listItem => {
                        listItem.text === item.flowEditor.get()[attr] && (dropdownField = {[attr]: listItem.value});
                    });
                    Method.parseToXml.setAttr(xmlNode, dropdownField);
                });
                FlowDesigner.rootElement.appendChild(xmlNode);
            });
            // 再创建所有的连接线，并设置属性和作为谁的子节点
            FlowDesigner.AllLineItems.forEach(line => {
                let xmlNode = Method.parseToXml.createXmlElement(line.flowEditor.type),
                    toItem = FlowDesigner.ALLITEMS.filter(item => item.rectNode === line.to)[0];
                // 根据连接线的目标节点的属性设置连接线的属性
                Method.parseToXml.setAttr(xmlNode, Object.assign({to: toItem.flowEditor.get().name}, line.flowEditor.get()));
                // 首先获取连接线的来源节点，然后将连接线作为来源节点的子节点添加到xml节点树中
                let fromItem = FlowDesigner.ALLITEMS.filter(item => item.rectNode === line.from)[0];
                let fromNode;
                FlowDesigner.rootElement.childNodes['forEach'](item => {
                    if('name' in item['attributes'] && fromItem.flowEditor.get().name === item['attributes'].getNamedItem('name').value){
                        fromNode = item;
                    }
                });
                fromNode && fromNode.appendChild(xmlNode);
            });

            if(tools.isEmpty(FlowDesigner.flowEditor.get().processTypeId)){
                Modal.toast('流程类型不能为空!');
                return;
            }
            if([].concat(FlowDesigner.ALLITEMS).concat(FlowDesigner.AllLineItems).some(item => tools.isEmpty(item.flowEditor.get().name))){
                Modal.toast('名称不能为空!');
                return;
            }

            let url = 'https://bwd.sanfu.com/sf/app_sanfu_retail/null/process/save',
            // let url = 'http://127.0.0.1:8080/sf/app_sanfu_retail/null/process/save',
                xmlStr = new XMLSerializer().serializeToString(xmlDoc); // 将流程转为xml字符串
            BwRule.Ajax.fetch(url, {
                type: 'POST',
                data: {process: xmlStr},
            }).then(({response}) => {
                Modal.toast(response.msg);
            }).catch((err) => {
                console.log(err);
            });

            // BwRule.Ajax.fetch(`https://bwd.sanfu.com/sf/app_sanfu_retail/null/process/select/${FlowDesigner.flowEditor.get().processTypeId}`, {
            //     type: 'GET',
            // }).then(({response}) => {
            //     console.log(response);
            // }).catch(err => {
            //     console.log(err);
            // });
        };

        return {
            on: () => {
                d.on(d.query('#design-canvas'), 'click', 'svg', clickSVG);
                d.on(d.query('.add-flow'), 'click', addFlowHandler);
            },
            off: () => {
                d.off(d.query('#design-canvas'), 'click', 'svg', clickSVG);
                d.off(d.query('.add-flow'), 'click', addFlowHandler);
            },
            // 关闭新增流程按钮的点击事件，从xml中读取时不能新增流程
            closeAddFlow: () => {
                d.off(d.query('.add-flow'), 'click', addFlowHandler);
            },
        }
    })();

    destroy() {
        FlowDesigner.AllLineItems = [];
        FlowDesigner.CURRENT_SELECT_TYPE = '';
        FlowDesigner.PAPER = null;
        FlowDesigner.ALLITEMS = [];
        FlowDesigner.connections = [];
        FlowEditor.EXIST_NAME = [];
        this.initEvents.off();
    }
}