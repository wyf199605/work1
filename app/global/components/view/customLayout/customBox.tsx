/// <amd-module name="CustomBox"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {CustomBoxLayout} from "./customBoxLayout";
import d = G.d;
import {Modal} from "../../feedback/modal/Modal";

export interface ICustomBox{
    width: number;
    height: number;
    resize: boolean; // 是否可改变宽高
    fullScreen: boolean; // 是否放大
    drag?: boolean; // 是否可拖拽
    content?: HTMLElement;
}

export interface ICustomBoxPara extends ICustomBox, IComponentPara{
    parent: CustomBoxLayout;
    resetBoxes?;
    index?: number; // 排序优先级 越小越在前面支持负数

}

export class CustomBox extends Component{

    private _fullScreen = false; // 是否已经放大
    private _width = 0;
    private  _height = 0;
    protected _content: HTMLElement; // 内容
    protected  _drag: boolean; // 是否能拖拽
    private  _parent;
    private  resetBoxes; //改变排序的函数

    set content(el: HTMLElement){
        let contentBox = d.query('.content-box', this.wrapper);
        contentBox.innerHTML = '';
        el && d.append(contentBox, el);
        this._content = el;
    }
    get content(){
        return this._content;
    }

    protected wrapperInit( para: ICustomBoxPara ){
        return <div className="custom-box"  style={{
            width: para.width + 'px',
            height: para.height + 'px',
            // order: para.index || 0,
        }} c-var={ para.index }>
            { para.drag? <div className="drag-corner"/>: null }
            { para.resize? <i className="resize-corner"/>: null }
            { para.fullScreen? <i className="fullScreen-corner"/>: null }
            <div className="content-box">box</div>
        </div>;
    }
    constructor(para: ICustomBoxPara){
        super(para);
        console.log(para,'customBox-Constructor');
        // 初始化设置一些数据
        this.resize = para.resize;
        this.content = para.content;
        this.fullScreen = para.fullScreen;

        this.drag = para.drag;
        this._parent = para.parent;

        this.resetBoxes = para.resetBoxes;
    }


    // 改变大小的函数
    protected resizeEvent = (() => {
        let downHandler;
        let moveHandler;
        let upHandler;
        let rightCorner = d.query('.resize-corner', this.wrapper);
        return {
            on: () => {
                d.on(rightCorner,'mousedown', downHandler = (ev)=> {
                    let disX = ev.clientX - rightCorner.offsetLeft;
                    let disY = ev.clientY - rightCorner.offsetTop;

                    d.on(document,'mousemove', moveHandler = (e) => {
                        this._width = e.clientX - disX+rightCorner.offsetWidth;
                        this.wrapper .style.width = this._width + 'px';
                        this._height = e.clientY - disY+rightCorner.offsetHeight;
                        this.wrapper .style.height = this._height + 'px';
                    });
                    d.on(document,'mouseup',upHandler=() => {
                        d.off(document, 'mousemove', moveHandler);
                        d.off(document, 'mouseup', upHandler);
                    })
                })
            },
            off: () => {
                d.off(rightCorner, 'mousedown', downHandler);
            }
        }
    })();

    set resize(flag: boolean){
        this.resizeEvent.off();
        if(flag){
            this.resizeEvent.on();
        }
    }

    //  全屏放大的函数
    protected fullModal: Modal; // modal的实例化对象

    // 设置当前是否全屏
    set fullScreen(fullScreen: boolean) {
        if(fullScreen){
            if ( this.fullModal ) {
                this.fullModal.isShow = true;
            } else {
                this.fullModal = new Modal({
                    header: '提示',
                    body: this._content,
                    className: '',
                    position: 'full',
                    isShow: true,
                    isOnceDestroy: true,
                    onClose: () => {
                        d.append(this.wrapper, this.content);
                        this.fullModal = null;
                    }
                });
            }
        }else{
            this.fullModal && ( this.fullModal.isShow = false );
        }
        this._fullScreen = fullScreen;
    }
    get fullScreen(){
        return this._fullScreen;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }

    // 元素拖放
    protected dragEvent = (() => {
        let downHandler;
        let moveHandler;
        let upHandler;
        let dragCorner = d.query('.drag-corner', this.wrapper);

        return {
            on: () => {
                d.on(dragCorner,'mousedown', downHandler = (ev)=> {
                    let oldX = ev.clientX;
                    let oldY = ev.clientY;
                    let disX = dragCorner.getBoundingClientRect().left;
                    let disY = dragCorner.getBoundingClientRect().top;

                    let copyDom = null;

                    // 创建一个虚拟框
                    copyDom = this.wrapper.cloneNode(true);
                    copyDom.classList.add('copy');

                    copyDom.style.position = "absolute";
                    copyDom.style.left = disX + 'px';
                    copyDom.style.top = disY + 'px';
                    copyDom.style.zIndex = '9999';
                    console.log( this._parent.wrapper );
                    this._parent.wrapper.appendChild(copyDom);
                    ev.preventDefault();

                    let newX;
                    let newY;
                    let resX;
                    let resY;

                    let wrapperIndexOnBoxes; // 当前移动的DOM在数组中的索引
                    d.on(document ,'mousemove', moveHandler = (e) => {
                        newX = e.clientX;
                        newY = e.clientY;
                        resX = disX + newX - oldX;
                        resY = disY + newY - oldY;

                        copyDom.style.left = resX + 'px';
                        copyDom.style.top = resY + 'px';
                        e.preventDefault();
                    });
                    d.on(document,'mouseup',upHandler=() => {

                        d.off(document, 'mousemove', moveHandler);
                        // 判断是否创建了copyDom
                        if ( !copyDom ) return;

                        // 计算位置!!!

                        // 获取所有的框集合
                        let resBox = d.queryAll('.custom-box', this._parent.wrapper);
                        let resultBoom = null;


                        // 重合判断
                        for ( let i = 0; i < resBox.length; i++ ) {

                            // 去除当前选择的框与克隆的框
                            if ( resBox[i] == this.wrapper ) {
                                wrapperIndexOnBoxes = i;
                                continue
                            }
                            if( resBox[i] == copyDom  ) {
                                continue
                            }
                            // 当前各个BOX的信息
                            let myObj = {};
                            myObj['el'] = resBox[i];
                            myObj['left'] = resBox[i].getBoundingClientRect().left;
                            myObj['top'] = resBox[i].getBoundingClientRect().top;
                            myObj['right'] = resBox[i].getBoundingClientRect().right;
                            myObj['bottom'] = resBox[i].getBoundingClientRect().bottom;
                            myObj['area'] = 0; // 重叠的面积
                            myObj['index'] = null; // 当前重叠在数组中的位置

                            // 将要移动到位置的信息
                            let moveLeft = copyDom.getBoundingClientRect().left;
                            let moveTop = copyDom.getBoundingClientRect().top;
                            let moveRight = copyDom.getBoundingClientRect().right;
                            let moveBottom = copyDom.getBoundingClientRect().bottom;

                            // 首先判断鼠标有没在目标位置中
                            // 如果有直接结束，否则判断是否有重叠面积
                            if (  (newX > myObj['left'] && newX < myObj['right'])  && ( newY > myObj['top'] && newY < myObj['bottom'] )  ) {
                                myObj['index'] = i;
                                resultBoom = myObj;
                                break;
                            } else {
                                // 碰撞检测
                                if ( (moveRight > myObj['left'] && moveLeft < myObj['right']) && (moveBottom > myObj['top'] && moveTop < myObj['bottom'])  ) {
                                    // 判断是否有多个重叠，取重叠的最大值
                                    // 计算当前重重的面积
                                    let x = 0;
                                    let y = 0;

                                    // 计算X轴
                                    if ( moveLeft <= myObj['left'] ) {
                                        x = moveRight - myObj['left']
                                    } else {
                                        x = myObj['right'] - moveLeft;
                                    }
                                    // 计算Y轴
                                    if ( moveTop <= myObj['top'] ) {
                                        y = moveBottom - myObj['top']
                                    } else {
                                        y = myObj['bottom'] - moveTop;
                                    }

                                    let s = x * y; // 重叠的面积
                                    myObj['area'] = s;
                                    myObj['index'] = i;
                                    if ( resultBoom ) {
                                        // 比较重叠面积的大小
                                        if( s > resultBoom.area ) {
                                            resultBoom = myObj
                                        }
                                    } else {
                                        resultBoom = myObj
                                    }
                                }
                            }
                        }
                        if ( copyDom ) {
                            copyDom.onmousemove = null;
                            this._parent.wrapper.removeChild(copyDom);
                            copyDom = null;
                        }
                        // 插入移动前的位置
                        if ( resultBoom ) {
                            let dom = d.queryAll('.custom-box', this._parent.wrapper);
                            this._parent.wrapper.removeChild(this.wrapper);
                            // 判断是否是往后移
                            if( wrapperIndexOnBoxes < resultBoom['index'] ) {
                                d.after(  dom[ resultBoom['index'] ], this.wrapper );
                            } else  {
                                d.before(  dom[ resultBoom['index'] ], this.wrapper );
                            }
                        }
                    })
                })
            },
            off: () => {
                d.off(dragCorner, 'mousedown', downHandler);
            }
        }
    })();

    set drag(flag: boolean){
        this.dragEvent.off();
        if(flag){
            this.dragEvent.on();
        }
    }
}
