/// <amd-module name="LineItem"/>
/// <amd-dependency path="raphael" name="Raphael"/>

import d = G.d;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {FlowDesigner} from "./FlowDesigner";
import {FlowEditor, IFieldPara} from "./FlowEditor";
import {FlowItem} from "./FlowItem";
import tools = G.tools;

export interface ILineItemPara extends IComponentPara {
    startNode: any;     // 连接线的来源
    endNode: any;       // 连接线的去向
    fields?: IFieldPara;     // 用于初始化flowEditor
    fromItem?:FlowItem; // 连接线起点元素
    toItem?:FlowItem; // 连接线终点元素
}

export class LineItem extends Component {

    static counter = 0;

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="lineItem"/>;
    }

    static removeAllActive() {
        let arr = FlowDesigner.AllLineItems || [];
        arr.forEach((item) => {
            item.line.attr({
                stroke: '#b6d1e0'
            });
            item.active = false;
            item.flowEditor.show = false;
        });
    }

    public setTextWrapperPosition() {
        let path = this.line.attrs && this.line.attrs.path,
            x1 = path[0][1],
            y1 = path[0][2],
            x2 = path[1][5],
            y2 = path[1][6];
        try {
            let style = window.getComputedStyle(this.wrapper),
                widthStr = style.width,
                heightStr = style.height,
                width = Number(widthStr.slice(0, widthStr.length - 2)),
                height = Number(heightStr.slice(0, heightStr.length - 2));
            this.wrapper.style.left = x1 + (x2 - x1) / 2 - width / 2 + 'px';
            this.wrapper.style.top = y1 + (y2 - y1) / 2 - height / 2 + 'px';
        } catch (e) {

        }
    }

    constructor(para: ILineItemPara) {
        super(para);
        if (FlowDesigner.FlowType === 'look'){
            this.toItem = para.toItem || null;
            this.fromItem = para.fromItem || null;
        }
        let arr = FlowDesigner.connections || [];
        this.from = para.startNode;
        this.to = para.endNode;
        let line = FlowDesigner.PAPER.connection(this.from, this.to);
        FlowDesigner.connections = arr.concat([line]);
        line && (this.line = line.line);
        this.wrapper.innerText = (para.fields && para.fields.displayName) || '';
        this.setTextWrapperPosition();
        let _this = this;
        line.line.click(function () {
            if (_this.active === false && FlowDesigner.FlowType !== 'look') {
                FlowDesigner.removeAllActive();
                _this.line.attr({
                    stroke: '#005bac'
                });
                _this.line.toFront();
               tools.isPc && (_this.active = true);
            }
        });

        para.fields && para.fields.name && para.fields.name.indexOf('path') > -1 &&
        (LineItem.counter = parseInt(para.fields.name.slice(4)));
        this.flowEditor = new FlowEditor({
            type: 'transition',
            container: d.query('#design-canvas'),
            owner: this,
            fields: Object.assign({name: `path${++LineItem.counter}`}, para.fields),
        });
        this.initEvents.on();
    }

    private _line: any;
    set line(line: any) {
        this._line = line;
    }

    get line() {
        return this._line;
    }

    private _toItem:FlowItem;
    set toItem(item:FlowItem){
        this._toItem = item;
    }
    get toItem(){
        return this._toItem;
    }
    private _fromItem:FlowItem;
    set fromItem(item:FlowItem){
        this._fromItem = item;
    }
    get fromItem(){
        return this._fromItem;
    }

    // 是否完成
    private _isComplete: number;
    get isComplete() {
        return this._isComplete;
    }

    set isComplete(isComplete: number) {
        this.line.attr({
            stroke: FlowItem.lookItemColor[isComplete]
        });
        this._isComplete = isComplete;
    }

    // 编辑器
    private _flowEditor: FlowEditor;
    set flowEditor(flowEditor: FlowEditor) {
        this._flowEditor = flowEditor;
    }

    get flowEditor() {
        return this._flowEditor;
    }

    // from节点
    private _from: FlowItem;
    set from(from: FlowItem) {
        this._from = from;
    }

    get from() {
        return this._from;
    }

    // to节点
    private _to: FlowItem;
    set to(to: FlowItem) {
        this._to = to;
    }

    get to() {
        return this._to;
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
                this.line.toFront();
                tools.isPc && (this.active = true);
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
        FlowDesigner.connections.forEach((conn, index, arr) => conn.line === this.line && arr.splice(index, 1));
        this.initEvents.off();
        // 注意绘制连接线时会有两条，需要将两条都删除
        this.flowEditor.destroy();
        this.line.node.remove();
        this.line.prev.remove();
        super.destroy();
    }
}