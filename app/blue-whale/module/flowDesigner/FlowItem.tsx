/// <amd-module name="FlowItem"/>
/// <amd-dependency path="raphael" name="Raphael"/>

import d = G.d;
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {FlowDesigner} from "./FlowDesigner";
import {FlowEditor, IFieldPara} from "./FlowEditor";
import {Tips} from "./Tips";
import {LineItem} from "./LineItem";

export interface IFlowItemPara extends IComponentPara {
    type?: string;
    text?: string;
    position?: {
        x: number,
        y: number
    };
    width?: number;
    height?: number;
    isComplete?: boolean;   // 表示该节点是否已经完成
    fields?: IFieldPara;     // 用于初始化flowEditor
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
                this.isDiamond = true;
                this.wrapper.classList.add('diamond');
                this.wrapper.appendChild(<div className="diamond-text">{para.type}</div>);
                this.rectNode = FlowDesigner.PAPER.rect(para.position.x, para.position.y, this.width, this.height).attr(this.getDefaultAttr(para.position.x, para.position.y)).transform('r45');
            } else {
                this.text = para.text || para.type;
                let areaObj = this.calcWidthAndHeight();
                this.rectNode = FlowDesigner.PAPER.rect(para.position.x, para.position.y, para.width || areaObj.width, para.height || areaObj.height, 5).attr(this.getDefaultAttr(para.position.x, para.position.y));
            }
        }
        let self = this;
        this.initEvents.on();
        this.flowEditor = new FlowEditor({
            type: para.type,
            container: d.query('#design-canvas'),
            owner: this,
            fields: para.fields,
        });
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
            this.wrapper.classList.add('complete');
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

    initEvents = (() => {
        return {
            on: () => {
                this.rectNode.click(this.clickHandler());
                this.rectNode.drag(this.draggerMoveHandler(), this.draggerStartHandler(), this.draggerEndHandler());
            },
            off: () => {
                this.rectNode.unclick(this.clickHandler());
                this.rectNode.undrag(this.draggerMoveHandler(), this.draggerStartHandler(), this.draggerEndHandler());
            },
            // 关闭节点的移动事件，从xml中解析时，只能查看属性，所以要将移动事件关闭（或打开点击事件）
            closeDrag: () => {
                this.rectNode.undrag(this.draggerMoveHandler(), this.draggerStartHandler(), this.draggerEndHandler());
            },
        }
    })();

    private clickHandler(): () => void{
        let self = this;

        return function () {
            FlowDesigner.removeAllActive();
            FlowDesigner.flowEditor.show = false;
            self.active === false && (self.active = true);
            if (FlowDesigner.CURRENT_SELECT_TYPE === 'transition') {
                let arr = Tips.TransitionItems || [];

                // 是否连接自己
                if (self === Tips.TransitionItems[0]) {
                    self.active = false;
                    FlowDesigner.flowEditor.show = true;
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
                    FlowDesigner.flowEditor.show = false;
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

    private draggerStartHandler(): () => void {
        let _this = this;
        return function () {
            LineItem.removeAllActive();
            FlowDesigner.flowEditor.show = false;
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
        FlowDesigner.flowEditor.show = false;
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

    // 是否是菱形
    private _isDiamond: boolean = false;
    set isDiamond(isDiamond: boolean) {
        this._isDiamond = isDiamond;
    }

    get isDiamond() {
        return this._isDiamond;
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
        this.initEvents.off();
    }
}
