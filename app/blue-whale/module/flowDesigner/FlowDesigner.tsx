/// <amd-module name="FlowDesigner"/>
/// <amd-dependency path="raphael" name="Raphael"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";

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

export class FlowDesigner {
    static CURRENT_SELECT_TYPE: string;
    static PAPER;
    static ALLITEMS: FlowItem[];
    static connections: any[];
    static AllLineItems: LineItem[];
    static flowEditor: FlowEditor;

    constructor(url?: string) {
        let body = <div className="design-canvas" id="design-canvas"/>;
        let modal = new Modal({
            body: body,
            header: '新增流程',
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

        // FlowDesigner.flowEditor = new FlowEditor({
        //     type: 'flow-designer',
        //     container: d.query('#design-canvas')
        // });
        this.initEvents.on();

        // 如果有url传入，根据url获取xml==>根据xml绘制流程（流程不可修改）
        // 如果没有则需要自己绘制流程
        if (tools.isNotEmpty(url)) {
            BwRule.Ajax.fetch(url).then(({response}) => {

                // 从xml中读取时，节点、连接线都不可操作,标题需要改变
                d.query('#design-canvas').style.pointerEvents = 'none';
                modal.modalHeader.title = '查看流程';

                // 从字符串中加载
                function LoadXMLStr(xmlStr) {
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
                }

                let xmlStr = response.body.bodyList[0].dataList[0].toString(),
                    rootElement = LoadXMLStr(xmlStr).documentElement;

                // 绘制xml中的所有节点
                rootElement.childNodes.forEach((child) => {
                    if (child.nodeType === 1) {
                        let layout = child.attributes.layout.value.split(',').map(item => parseInt(item)),
                            isComplete: boolean = false,
                            displayName: string;
                        // 存在xml中没有isComplete属性情况
                        'isComplete' in child.attributes && (
                            isComplete = child.attributes.isComplete.value === 'true' ? true : false
                        );
                        'displayName' in child.attributes && (
                            displayName = child.attributes.displayName.value
                        )
                        let shape = new FlowItem({
                            type: child.tagName,
                            text: displayName,
                            position: {x: layout[0], y: layout[1]},
                            width: layout[2],
                            height: layout[3],
                            isComplete: isComplete,
                            container: d.query('#design-canvas')
                        });

                        // 设置节点的data-id
                        shape.wrapper.dataset.id = child.attributes.name.value;
                        let arr = FlowDesigner.ALLITEMS || [];
                        FlowDesigner.ALLITEMS = arr.concat([shape]);

                        // 开始节点的內圆也要改变颜色
                        if(shape.isStart && shape.isComplete){
                            d.query('.inner-circle', shape.wrapper).style.backgroundColor = '#31ccff';
                        }
                    }
                });

                // 根据data-id寻找对应的节点
                function searchFlowItem(id) {
                    return FlowDesigner.ALLITEMS.filter(item => item.wrapper.dataset.id === id)[0];
                }

                // 绘制连接线
                rootElement.childNodes.forEach(child => {
                    if (child.nodeType === 1) {
                        let transition = d.query('transition', child);
                        if (tools.isNotEmpty(transition) && tools.isNotEmpty(transition.attributes['to'].value)) {
                            let start = searchFlowItem(child.attributes.name.value),
                                end = searchFlowItem(transition.attributes['to'].value) || null;

                            // xml中最后的节点可能有to属性，但是最后的节点是没有连线的
                            if (tools.isEmpty(end)) {
                                return;
                            }
                            let lineItem = new LineItem({
                                startNode: start.rectNode,
                                endNode: end.rectNode,
                                container: d.query('#design-canvas')
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

                    }
                });

                // 如果节点已经完成，则对应的连接线的颜色也要改变
                FlowDesigner.ALLITEMS.filter(item => item.isComplete).forEach(item => {
                    tools.isNotEmptyArray(item.lineItems) && item.lineItems.forEach(lineItem => {
                        lineItem.line.attr({
                            stroke: '#31ccff'
                        });
                    });
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
    }

    private initEvents = (() => {
        let clickSVG = (e) => {
            let target = e.target;
            if (target.tagName === 'svg') {
                FlowDesigner.removeAllActive();
                // FlowDesigner.flowEditor.show = true;
            }
        };
        return {
            on: () => {
                d.on(d.query('#design-canvas'), 'click', 'svg', clickSVG);
            },
            off: () => {
                d.off(d.query('#design-canvas'), 'click', 'svg', clickSVG);
            }
        }
    })();

    destroy() {
        FlowDesigner.AllLineItems = [];
        FlowDesigner.CURRENT_SELECT_TYPE = '';
        FlowDesigner.PAPER = null;
        FlowDesigner.ALLITEMS = [];
        FlowDesigner.connections = [];
        this.initEvents.off();
    }
}

interface IFlowItemPara extends IComponentPara {
    type?: string;
    text?: string;
    position?: {
        x: number,
        y: number
    }
    width?: number,
    height?: number,
    isComplete?: boolean
}

export class FlowItem extends Component {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="flow-item"/>;
    }

    // 当前绘制出的 raphael 节点
    private _rectNode: any;
    get rectNode() {
        return this._rectNode;
    }

    set rectNode(rectNode) {
        this._rectNode = rectNode;
    }

    private para: IFlowItemPara;

    constructor(para: IFlowItemPara) {
        super(para);
        this.para = para;
        this.x = para.position.x;
        this.y = para.position.y;
        this.isComplete = para.isComplete || false;
        if (para.type === 'start') {
            // 开始节点
            this.isStart = true;
            this.isEnd = false;
            this.wrapper.style.left = (para.position.x - 20) + 'px';
            this.wrapper.style.top = (para.position.y - 20) + 'px';
            this.wrapper.classList.add('start-circle');
            this.wrapper.appendChild(<div className="inner-circle"/>);
            this.rectNode = FlowDesigner.PAPER.circle(para.position.x, para.position.y, 20).attr(this.getDefaultAttr(para.position.x, para.position.y));
        } else if (para.type === 'end') {
            // 结束节点
            this.isEnd = true;
            this.isStart = false;
            this.wrapper.style.left = (para.position.x - 20) + 'px';
            this.wrapper.style.top = (para.position.y - 20) + 'px';
            this.wrapper.classList.add('end-circle');
            this.rectNode = FlowDesigner.PAPER.circle(para.position.x, para.position.y, 20).attr(this.getDefaultAttr(para.position.x, para.position.y));
        } else {
            // 其他节点
            this.isStart = false;
            this.isEnd = false;
            let diamondArr = ['decision', 'fork', 'join'];
            this.wrapper.style.left = para.position.x + 'px';
            this.wrapper.style.top = para.position.y + 'px';
            this.width = para.width || 50;
            this.height = para.height || 50;
            if (diamondArr.indexOf(para.type) >= 0) {
                this.wrapper.classList.add('diamond');
                this.wrapper.appendChild(<div className="diamond-text">{para.type}</div>)
                this.rectNode = FlowDesigner.PAPER.rect(para.position.x, para.position.y, this.width, this.height).attr(this.getDefaultAttr(para.position.x, para.position.y)).transform('r45');
            } else {
                this.text = para.text || para.type;
                let areaObj = this.calcWidthAndHeight();
                this.rectNode = FlowDesigner.PAPER.rect(para.position.x, para.position.y, para.width || areaObj.width, para.height || areaObj.height, 5).attr(this.getDefaultAttr(para.position.x, para.position.y));
            }
        }
        let self = this;
        this.rectNode.drag(this.draggerMoveHandler(), this.draggerStartHandler(), this.draggerEndHandler());
        this.flowEditor = new FlowEditor({
            type: para.type,
            container: d.query('#design-canvas')
        });

        this.rectNode.click(this.clickHandler());
        this.rectNode.dblclick(this.dblclickHandler()); // 双击编辑属性
    }

    // 所有关联的item
    private _relations: FlowItem[];
    set relations(relations: FlowItem[]) {
        this._relations = relations;
    }

    get relations() {
        return this._relations;
    }

    // 所有的线
    private _lineItems: LineItem[];
    set lineItems(lineItems: LineItem[]) {
        this._lineItems = lineItems;
    }

    get lineItems() {
        return this._lineItems;
    }

    // 位置：x
    private _x: number;
    set x(x: number) {
        this._x = x;
    }

    get x() {
        return this._x;
    }

    // 位置：y
    private _y: number;
    set y(y: number) {
        this._y = y;
    }

    get y() {
        return this._y;
    }

    // 宽度
    private _width: number;
    set width(width: number) {
        this._width = width;
    }

    get width() {
        return this._width;
    }

    // 高度
    private _height: number;
    set height(height: number) {
        this._height = height;
    }

    get height() {
        return this._height;
    }

    // 该节点是否已完成
    private _isComplete: boolean;
    get isComplete() {
        return this._isComplete;
    }

    set isComplete(isComplete) {
        if (isComplete) {
            this.wrapper.style.borderColor = '#31ccff';
        } else {
            this.wrapper.style.borderColor = '#b6d1e0';
        }
        this._isComplete = isComplete;
    }

    // 文本内容
    private _text: string;
    set text(text: string) {
        this._text = text;
        this.wrapper.innerHTML = text;
    }

    get text() {
        return this._text;
    }

    private clickHandler(): () => void{
        let self = this;
        return function () {
            LineItem.removeAllActive();
            // FlowDesigner.flowEditor.show = false;
            self.active === false && (self.active = true);
            if (FlowDesigner.CURRENT_SELECT_TYPE === 'transition') {
                let arr = Tips.TransitionItems || [];

                // 是否连接自己
                if (self === Tips.TransitionItems[0]) {
                    self.active = false;
                    // FlowDesigner.flowEditor.show = true;
                } else {
                    Tips.TransitionItems = arr.concat([self]);
                }

                if (Tips.TransitionItems.length === 2) {
                    let lineItem = new LineItem({
                        startNode: Tips.TransitionItems[0].rectNode,
                        endNode: Tips.TransitionItems[1].rectNode,
                        container: d.query('#design-canvas')
                    });
                    FlowDesigner.removeAllActive();
                    // FlowDesigner.flowEditor.show = false;
                    lineItem.line.attr({
                        stroke: '#005bac'
                    });
                    lineItem.active = true;
                    let relationsArr = Tips.TransitionItems[0].relations || [],
                        lineItems = Tips.TransitionItems[0].lineItems || [],
                        allLineItems = FlowDesigner.AllLineItems || [];
                    FlowDesigner.AllLineItems = allLineItems.concat([lineItem]);
                    Tips.TransitionItems[0].relations = relationsArr.concat([Tips.TransitionItems[1]]);
                    Tips.TransitionItems[0].lineItems = lineItems.concat([lineItem]);
                    Tips.TransitionItems = [];
                }
                FlowDesigner.CURRENT_SELECT_TYPE = '';
                Tips.removeActive();
            }
        }
    }

    private dblclickHandler(): () => void{
        let self = this;
        return function () {
            // 双击节点进行编辑属性时，flowEditor的第一个属性获得焦点，并成为可编辑状态
            if(self.isStart || self.isEnd){
                return;
            }
            let input = document.createElement("input"),
                attr = d.queryAll('div', self.flowEditor.wrapper)[1];

            d.append(self.flowEditor.wrapper, input);
            input.value = attr.textContent;
            attr.textContent = '';
            input.focus();
            d.on(input, 'blur', function (focusEvent) {
                // 失去焦点时，将input移除并将input的值更新到流程编辑的属性和节点的文本上
                attr.textContent = input.value;
                self.wrapper.textContent = input.value;
                d.remove(input);
            });
        };
    }

    private draggerStartHandler(): () => void {
        let _this = this;
        return function () {
            LineItem.removeAllActive();
            // FlowDesigner.flowEditor.show = false;
            if (_this.active !== true) {
                FlowItem.removeAllActiveClass();
                _this.active = true;
            }
            this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
            this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
            let diamondArr = ['decision', 'fork', 'join'];
            if (diamondArr.indexOf(_this.para.type) >= 0) {
                this.transform('r0');
            }
            this.animate({"fill-opacity": .2}, 500);
        };
    }

    private draggerMoveHandler(): (dx, dy) => void {
        let _this = this;
        return function (dx, dy) {

            if (this.type !== 'rect') {
                let att = {cx: this.ox + dx, cy: this.oy + dy};
                this.attr(att);
                _this.wrapper.style.top = (this.oy - 20 + dy) + 'px';
                _this.wrapper.style.left = (this.ox - 20 + dx) + 'px';
            } else {
                let att = {x: this.ox + dx, y: this.oy + dy};
                this.attr(att);
                _this.wrapper.style.top = this.oy + dy + 'px';
                _this.wrapper.style.left = this.ox + dx + 'px';
            }
            this.x = this.ox + dx;
            this.y = this.oy + dy;

            // 移动flow-item
            if (tools.isNotEmpty(FlowDesigner.connections)) {
                for (let i = FlowDesigner.connections.length; i--; i >= 0) {
                    FlowDesigner.PAPER.connection(FlowDesigner.connections[i]);
                }
            }
            if (tools.isNotEmpty(FlowDesigner.AllLineItems)) {
                for (let i = 0; i < FlowDesigner.AllLineItems.length; i++) {
                    FlowDesigner.AllLineItems[i].setTextWrapperPosition();
                }
            }
        };
    }

    private draggerEndHandler(): () => void {
        let _this = this;
        return function () {
            let diamondArr = ['decision', 'fork', 'join'];
            if (diamondArr.indexOf(_this.para.type) >= 0) {
                this.transform('r45');
            }
            this.animate({"fill-opacity": 0}, 500);
        };
    }

    // 计算文本内容的宽高
    private calcWidthAndHeight(): { width: number, height: number } {
        let style = window.getComputedStyle(this.wrapper),
            widthStr = style.width,
            heightStr = style.height;
        return {
            width: Number(widthStr.slice(0, widthStr.length - 2)),
            height: Number(heightStr.slice(0, heightStr.length - 2))
        }
    }

    // 默认的样式
    private getDefaultAttr(x?: number, y?: number): obj {
        if (this.isStart === true || this.isEnd === true) {
            return {
                stroke: 'none',
                fill: '#ffffff',
                "fill-opacity": 0,
                cx: x,
                cy: y
            }
        } else {
            return {
                stroke: 'none',
                fill: '#ffffff',
                "fill-opacity": 0,
                x: x,
                y: y
            }
        }
    }

    // 移除所有 flow-item 的 active 样式
    static removeAllActiveClass() {
        // FlowDesigner.flowEditor.show = false;
        d.queryAll('.flow-item').forEach((item) => {
            item.classList.remove('active');
            item.classList.remove('active');
        });
        let arr = FlowDesigner.ALLITEMS || [];
        arr.forEach(item => {
            item._active = false;
            item.flowEditor.show = false;
        })
    }

    // 设置 active 样式
    private _active: boolean;
    set active(active: boolean) {
        this.wrapper.classList.toggle('active', active);
        this._active = active;
        this.flowEditor.show = active;
    }

    get active() {
        return this._active;
    }

    // 是否是开始节点
    private _isStart: boolean;
    set isStart(isStart: boolean) {
        this._isStart = isStart;
    }

    get isStart() {
        return this._isStart;
    }

    // 是否是结束节点
    private _isEnd: boolean;
    set isEnd(isEnd: boolean) {
        this._isEnd = isEnd;
    }

    get isEnd() {
        return this._isEnd;
    }

    // 编辑器
    private _flowEditor: FlowEditor;
    set flowEditor(flowEditor: FlowEditor) {
        this._flowEditor = flowEditor;
    }

    get flowEditor() {
        return this._flowEditor;
    }

    destroy() {
        super.destroy();
    }
}


interface ILineItemPara extends IComponentPara {
    startNode: any;
    endNode: any;
}

class LineItem extends Component {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="lineItem"/>;
    }

    private _line: any;
    set line(line: any) {
        this._line = line;
    }

    get line() {
        return this._line;
    }

    // 编辑器
    private _flowEditor: FlowEditor;
    set flowEditor(flowEditor: FlowEditor) {
        this._flowEditor = flowEditor;
    }

    get flowEditor() {
        return this._flowEditor;
    }

    setTextWrapperPosition() {
        let path = this.line.attrs.path,
            x1 = path[0][1],
            y1 = path[0][2],
            x2 = path[1][5],
            y2 = path[1][6];
        let style = window.getComputedStyle(this.wrapper),
            widthStr = style.width,
            heightStr = style.height,
            width = Number(widthStr.slice(0, widthStr.length - 2)),
            height = Number(heightStr.slice(0, heightStr.length - 2));
        this.wrapper.style.left = x1 + (x2 - x1) / 2 - width / 2 + 'px';
        this.wrapper.style.top = y1 + (y2 - y1) / 2 - height / 2 + 'px';
    }

    constructor(para: ILineItemPara) {
        super(para);
        let arr = FlowDesigner.connections || [];
        let line = FlowDesigner.PAPER.connection(para.startNode, para.endNode);
        FlowDesigner.connections = arr.concat([line]);
        this.line = line.line;
        this.wrapper.innerText = '';
        this.setTextWrapperPosition();
        let _this = this;
        line.line.click(function () {
            if (_this.active === false) {
                FlowDesigner.removeAllActive();
                _this.line.attr({
                    stroke: '#005bac'
                });
                _this.active = true;
            }
        });

        this.flowEditor = new FlowEditor({
            type: 'line',
            container: d.query('#design-canvas')
        });
        this.initEvents.on();
    }

    static removeAllActive() {
        // FlowDesigner.flowEditor.show = false;
        let arr = FlowDesigner.AllLineItems || [];
        arr.forEach((item) => {
            item.line.attr({
                stroke: '#b6d1e0'
            });
            item.active = false;
            item.flowEditor.show = false;
        });
    }

    private _active: boolean;
    set active(active: boolean) {
        this.flowEditor.show = active;
        this._active = active;
    }

    get active() {
        return this._active;
    }

    private initEvents = (() => {
        let clickWrapper = () => {
            if (this.active === false) {
                FlowDesigner.removeAllActive();
                this.line.attr({
                    stroke: '#005bac'
                });
                this.active = true;
            }
        };

        return {
            on: () => {
                d.on(this.wrapper, 'click', clickWrapper);
            },
            off: () => {
                d.off(this.wrapper, 'click', clickWrapper);
            }
        }
    })();

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}

class Tips extends Component {
    static TransitionItems: FlowItem[];

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="tips">
            <div className="tip-header">工具集</div>
            <div className="tip-items">
                <div className="tip-item">
                    <div className="tip-item-inner" id="save"><i className="appcommon app-baocun1"/>保存</div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner" id="otherSave"><i className="appcommon app-baocun1"/>另存为</div>
                </div>
                <div className="tip-line"/>
                <div className="tip-item">
                    <div className="tip-item-inner click-item" data-name="select"><i
                        className="appcommon app-Select"/>Select
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner click-item" data-name="transition"><i
                        className="appcommon app-transition"/>Transition
                    </div>
                </div>
                <div className="tip-line"/>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="start"><i className="appcommon app-start"/>Start
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="end"><i className="appcommon app-end"/>End
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item task-item" data-name="task"><i
                        className="appcommon app-task"/>task
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="custom"><i
                        className="appcommon app-custom"/>custom
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="subprocess"><i
                        className="appcommon app-subprocess"/>subprocess
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="decision"><i
                        className="appcommon app-decision1"/>decision
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="fork"><i className="appcommon app-fork"/>fork
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="join"><i className="appcommon app-join"/>join
                    </div>
                </div>
            </div>
        </div>;
    }

    constructor(para: IComponentPara) {
        super(para);
        this.initEvents.on();
    }

    private initEvents = (() => {
        let selectItem = (e) => {
            let movefollow = <span className="move-follow"/>;
            movefollow.innerHTML = d.closest(e.target, '.drag-item').innerHTML;
            movefollow.style.left = e.clientX + 12 + 'px';
            movefollow.style.top = e.clientY + 12 + 'px';
            document.body.appendChild(movefollow);
            setActive(d.closest(e.target, '.tip-item-inner'));
            Tips.TransitionItems = [];
            let selectItemMove = tools.pattern.throttling((moveEvent) => {
                movefollow.style.left = moveEvent.clientX + 12 + 'px';
                movefollow.style.top = moveEvent.clientY + 12 + 'px';
            }, 10);
            d.on(document, 'mousemove', selectItemMove);
            let selectItemMoveUp = (moveUpEvent) => {
                document.body.removeChild(movefollow);
                // 画对应的圆
                if (moveUpEvent.target.nodeName === 'svg') {
                    // FlowDesigner.CURRENT_SELECT_TYPE = d.closest(e.target, '.drag-item').dataset.name;
                    FlowDesigner.CURRENT_SELECT_TYPE = '';
                    let top = Number(tools.offset.top(d.query('#design-canvas'))),
                        left = Number(tools.offset.left(d.query('#design-canvas')));
                    let flowItem = new FlowItem({
                        type: d.closest(e.target, '.drag-item').dataset.name,
                        text: '',
                        position: {
                            x: moveUpEvent.clientX - left + 15,
                            y: moveUpEvent.clientY - top + 15
                        },
                        container: d.query('#design-canvas')
                    });
                    let arr = FlowDesigner.ALLITEMS || [];
                    FlowDesigner.ALLITEMS = arr.concat([flowItem]);
                    FlowDesigner.removeAllActive();
                    flowItem.active = true;
                }
                d.off(document, 'mousemove', selectItemMove);
                d.off(document, 'mouseup', selectItemMoveUp);
            };
            d.on(document, 'mouseup', selectItemMoveUp);
        };

        let clickItemHandler = (e) => {
            FlowDesigner.CURRENT_SELECT_TYPE = d.closest(e.target, '.click-item').dataset.name;
            setActive(d.closest(e.target, '.tip-item-inner'));
            Tips.TransitionItems = [];
            if (FlowDesigner.CURRENT_SELECT_TYPE === 'transition') {
                if (tools.isNotEmpty(FlowDesigner.ALLITEMS)) {
                    FlowDesigner.ALLITEMS.forEach(item => {
                        item.active === true && (Tips.TransitionItems = [item]);
                    });
                }
            }
        };

        let setActive = (target: HTMLElement) => {
            d.queryAll('.tip-item-inner').forEach((tip) => {
                tip.classList.remove('active');
            });
            target.classList.add('active');
        };
        return {
            on: () => {
                d.on(this.wrapper, 'mousedown', '.drag-item', selectItem);
                d.on(this.wrapper, 'click', '.click-item', clickItemHandler);
            },
            off: () => {
                d.off(this.wrapper, 'mousedown', '.drag-item', selectItem);
                d.off(this.wrapper, 'click', '.click-item', clickItemHandler);
            }
        }
    })();

    // 移除所有item的active效果
    static removeActive() {
        d.queryAll('.tip-item-inner').forEach((tip) => {
            tip.classList.remove('active');
        });
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}

interface IFlowEditorPara extends IComponentPara {
    type?: string;
}

class FlowEditor extends Component {
    protected wrapperInit(para: IFlowEditorPara): HTMLElement {
        return <div className="flow-editor">
            <div className="tip-header">属性</div>
            <div>{para.type}</div>
        </div>;
    }

    constructor(para: IFlowEditorPara) {
        super(para);
    }

    private _show: boolean;
    set show(show: boolean) {
        this._show = show;
        this.wrapper.classList.toggle('hide', !show);
    }

    get show() {
        return this._show;
    }
}