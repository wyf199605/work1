/// <amd-module name="FlowItem"/>
/// <amd-dependency path="raphael" name="Raphael"/>

import d = G.d;
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {FlowDesigner, Method} from "./FlowDesigner";
import {FlowEditor, IFieldPara} from "./FlowEditor";
import {Tips} from "./Tips";
import {LineItem} from "./LineItem";
import {FlowInfo} from "./FlowInfo";

export interface IFlowItemPara extends IComponentPara {
    type?: string;      // 节点的类型
    text?: string;      // 显示的文本
    position?: {        // 节点的位置
        x: number,
        y: number
    };
    width?: number;     // 宽
    height?: number;    // 高
    isComplete?: number;   // 表示该节点是否已经完成
    fields?: IFieldPara;     // 用于初始化flowEditor
    minTop?: number;
    minLeft?: number;
    auditTime?: string; // 审批时间
    auditUser?: string; // 审批用户
}

export class FlowItem extends Component {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="flow-item"/>;
    }

    static startCounter = 0;    // start节点的个数
    static endCounter = 0;      // end节点的个数
    // static itemColor = {
    //     task: '#65b3f0',
    //     custom: '#71d189',
    //     subprocess: '#f56767',
    //     decision: '#f8b14b',
    //     fork: '#db7bd8',
    //     join: '#f5896c',
    // };
    static lookItemColor = ['#005bac', '#12a094', '#ff7928']; // 完成未完成颜色
    private para: IFlowItemPara;

    // 工具集里的start和end节点是否可用
    static toggleDisabledStartAndEnd() {
        let start = d.query('.tip-item-inner[data-name=start]'),
            end = d.query('.tip-item-inner[data-name=end]');
        if (!(start || end)) {
            return;
        }
        FlowItem.startCounter >= 1 ? start.style.pointerEvents = 'none' : start.style.pointerEvents = 'auto';
        FlowItem.startCounter >= 1 ? start.style.opacity = '0.5' : start.style.opacity = '1.0';
        FlowItem.endCounter >= 1 ? end.style.pointerEvents = 'none' : end.style.pointerEvents = 'auto';
        FlowItem.endCounter >= 1 ? end.style.opacity = '0.5' : end.style.opacity = '1.0';
    }

    constructor(para: IFlowItemPara) {
        super(para);
        if (tools.isMb) {
            para.position.x = para.position.x - (tools.isNotEmpty(para.minLeft) ? para.minLeft : 170);
            para.position.y = para.position.y - (tools.isNotEmpty(para.minTop) ? para.minTop : 0);
            this.x = para.position.x;
            this.y = para.position.y;
        } else {
            this.x = para.position.x;
            this.y = para.position.y;
        }
        this.para = para;

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
            if (diamondArr.indexOf(para.type) >= 0) {
                this.width = para.width || 50;
                this.height = para.height || 50;
                this.isDiamond = true;
                this.wrapper.classList.add('diamond');
                this.wrapper.appendChild(<div className="diamond-text">{para.text || para.type}</div>);
                this.rectNode = FlowDesigner.PAPER.rect(para.position.x, para.position.y, this.width, this.height)
                    .attr(this.getDefaultAttr(para.position.x, para.position.y)).transform('r45');
            } else {
                this.width = para.width || 100;
                this.height = para.height || 50;
                this.text = para.text || para.type;
                let areaObj = this.calcWidthAndHeight();
                this.width = areaObj.width;
                this.height = areaObj.height;
                this.rectNode = FlowDesigner.PAPER.rect(para.position.x, para.position.y, para.width || areaObj.width, para.height || areaObj.height, 5)
                    .attr(this.getDefaultAttr(para.position.x, para.position.y));
            }
        }
        if (FlowDesigner.FlowType === 'look') {
            this.isComplete = tools.isNotEmpty(para.isComplete) ? para.isComplete : 0;
        }
        this.initEvents.on();

        let fields: IFieldPara = {};
        this.isStart && FlowItem.startCounter++;
        this.isEnd && FlowItem.endCounter++;
        (this.isStart || this.isEnd) && FlowItem.toggleDisabledStartAndEnd();
        this.flowEditor = new FlowEditor({
            type: para.type,
            container: d.query('#design-canvas'),
            owner: this,
            fields: para.fields || fields,
        });
        let arr = [];
        if (tools.isNotEmpty(para.auditUser) && Method.isShowAuditUser(this.para.type)) {
            arr.push(new FlowInfo({
                text: para.auditUser,
                position: {
                    x: this.x,
                    y: this.y - 20
                },
                width: this.width,
                isTop: true,
                container: d.query('#design-canvas')
            }))
        }
        if (tools.isNotEmpty(para.auditTime) && Method.isShowAuditUser(this.para.type)) {
            arr.push(new FlowInfo({
                text: para.auditTime,
                position: {
                    x: this.x,
                    y: this.y + this.height
                },
                width: this.width,
                isTop: false,
                container: d.query('#design-canvas')
            }))
        }
        this.infoItems = arr;
    }

    private _infoItems: FlowInfo[];
    set infoItems(infoItems: FlowInfo[]) {
        this._infoItems = infoItems;
    }

    get infoItems() {
        return this._infoItems;
    }

    // 当前绘制出的 raphael 节点
    private _rectNode: any;
    get rectNode() {
        return this._rectNode;
    }

    set rectNode(rectNode) {
        this._rectNode = rectNode;
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
    private _isComplete: number;
    get isComplete() {
        return this._isComplete;
    }

    set isComplete(isComplete: number) {
        this._isComplete = isComplete;
        let type = this.para.type;
        if (['start', 'end'].indexOf(type) >= 0) {
            this.wrapper.classList.add('complete')
        } else {
            this.wrapper.style.borderColor = FlowItem.lookItemColor[isComplete];
            this.wrapper.style.backgroundColor = FlowItem.lookItemColor[isComplete];
        }
    }

    // 文本内容
    private _text: string;
    set text(text: string) {
        let limitLength = 50,
            limitText = text.length > limitLength ? text.slice(0, limitLength) + '...' : text;
        this._text = limitText;
        this.wrapper.innerHTML = limitText;
    }

    get text() {
        return this._text;
    }

    public initEvents = (() => {
        return {
            on: () => {
                this.rectNode.click(this.clickHandler());
                tools.isPc && this.rectNode.drag(this.draggerMoveHandler(), this.draggerStartHandler(), this.draggerEndHandler());
            },
            off: () => {
                this.rectNode.unclick(this.clickHandler());
                tools.isPc && this.rectNode.undrag(this.draggerMoveHandler(), this.draggerStartHandler(), this.draggerEndHandler());
            }
        }
    })();

    private clickHandler(): () => void {
        let self = this;

        return function () {
            FlowDesigner.removeAllActive();
            self.active === false && (self.active = true);
            if (FlowDesigner.CURRENT_SELECT_TYPE === 'transition') {
                let arr = Tips.TransitionItems || [];

                // 连接自己或连接相同名称的节点
                let transitionFlag = null;
                if (self === Tips.TransitionItems[0]) {
                    // Modal.toast('不能连接自己！');
                } else if (Tips.TransitionItems[0] && self.flowEditor.get().name &&
                    self.flowEditor.get().name === Tips.TransitionItems[0].flowEditor.get().name) {
                    // Modal.toast('名称相同，无法连接！');
                } else if (Tips.TransitionItems[0] && FlowDesigner.AllLineItems.filter(line =>
                        (line.from === Tips.TransitionItems[0].rectNode && line.to === self.rectNode && (transitionFlag = 'repeat')) ||
                        (line.from === self.rectNode && line.to === Tips.TransitionItems[0].rectNode && (transitionFlag = 'reverse')))[0]) {
                    // transitionFlag === 'repeat' && Modal.toast('不能重复连线！');
                    // transitionFlag === 'reverse' && Modal.toast('不能反向连线！');
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
            _this.x = this.ox + dx;
            _this.y = this.oy + dy;

            // 重绘连线
            FlowDesigner.AllLineItems && FlowDesigner.AllLineItems.forEach(line => line.setTextWrapperPosition());
            FlowDesigner.connections && FlowDesigner.connections.forEach(connection => FlowDesigner.PAPER.connection(connection));

            // 移动info 这里不需要移动，只有查看时才有审批人等，查看时节点不能拖动
            // let infoItems = _this.infoItems || [];
            // if (tools.isNotEmpty(infoItems)) {
            //     infoItems.forEach(item => {
            //         let y = _this.y - 20;
            //         if (!item.isTop) {
            //             y = y + _this.height + 20;
            //         }
            //         item.setPosition({
            //             x: _this.x,
            //             y: y,
            //             width: _this.width
            //         })
            //     })
            // }
        };
    }

    private draggerEndHandler(): () => void {
        let _this = this;
        return function () {
            // 超出边界时刷新svg的宽高
            let boundary = Method.getBoundary();
            FlowDesigner.PAPER.setSize(boundary.width, boundary.height);
            d.query('#design-canvas').style.width = boundary.width + 'px';
            d.query('#design-canvas').style.height = boundary.height + 'px';

            let diamondArr = ['decision', 'fork', 'join'];
            if (diamondArr.indexOf(_this.para.type) >= 0) {
                this.transform('r45');
            }
            this.animate({"fill-opacity": 0}, 500);
        };
    }

    // 计算文本内容的宽高
    public calcWidthAndHeight(): { width: number, height: number } {
        let style = window.getComputedStyle(this.wrapper),
            widthStr = style.width,
            heightStr = style.height;
        this.rectNode && this.rectNode.attr({width: parseInt(widthStr), height: parseInt(heightStr)});
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
        d.queryAll('.flow-item').forEach((item) => {
            item.classList.remove('active');
        });
        let arr = FlowDesigner.ALLITEMS || [];
        arr.forEach(item => {
            item && (
                item._active = false,
                    item.flowEditor.show = false
            )
        })
    }

    // 设置 active 样式
    private _active: boolean;
    set active(active: boolean) {
        this.wrapper.classList.toggle('active', active);
        this._active = active;
        tools.isPc && (this.flowEditor.show = active);
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

    public reDraw() {
        if (this.para.type === 'task') {
            let areaObj = this.calcWidthAndHeight();
            this.rectNode.attr.width = areaObj.width;
            this.rectNode.attr.height = areaObj.height;
            // 重绘所有的线
            FlowDesigner.AllLineItems && FlowDesigner.AllLineItems.forEach(line => line.setTextWrapperPosition());
            FlowDesigner.connections && FlowDesigner.connections.forEach(connection => FlowDesigner.PAPER.connection(connection));
        }
    }

    destroy() {
        this.infoItems = null;
        this.lineItems = null;
        this.isStart && FlowItem.startCounter--;
        this.isEnd && FlowItem.endCounter--;
        FlowItem.toggleDisabledStartAndEnd();
        this.rectNode.remove();
        FlowDesigner.ALLITEMS.forEach((item, index, arr) => item === this && arr.splice(index, 1));
        this.initEvents.off();
        this.flowEditor.destroy();
        super.destroy();
    }
}
