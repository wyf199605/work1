/// <amd-module name="InputBox"/>
import d = C.d;
import tools = C.tools;
import {Component, IComponentPara} from "../../Component";
import {Button} from "../button/Button";
import {DropDown} from "../../ui/dropdown/dropdown";

interface IInputBoxPara extends IComponentPara{
    //width?: string | number;//  ，则不支持响应式
    isVertical?: boolean;
    size?: string;
    shape?: string;
    compactWidth?: number;
    children?: Button[];
    moreBtn?: Button;
    isResponsive?: boolean;

    responsive?(): void;

    remove?(): void;

    addItem?(com: Button | any, key?: string): void;

    delItem?(item: string | number): any;

    getItem?(key): any;
}

/**
 * 组件集合对象
 */
export class InputBox extends Component {


    private _lastNotMoreIndex: number; //记录最后一个未放入更多下拉列表容器的下标

    protected wrapperInit(): HTMLElement {
        return d.create(`<div class="input-box"></div>`);
    }

    private init(inputBox: IInputBoxPara) {
        // debugger;
        this.isVertical = !!inputBox.isVertical;
        this.wrapper.classList.add(this.isVertical ? 'input-box-vertical' : 'input-box-horizontal');

        this.children = inputBox.children;
        this._lastNotMoreIndex = -1;
        this.size = inputBox.size;
        this.compactWidth = inputBox.compactWidth;
        this.isResponsive = inputBox.isResponsive;
        this.moreBtn = inputBox.moreBtn;
        this.shape = inputBox.shape;
        // this.container = inputBox.container;
        // this.container.appendChild(this.wrapper);
        this.responsive();

    }

    private isVertical:boolean;

    /**
     * 子组件集合
     */
    private _children: Array<Button>;
    set children(children:Array<Button>) {
        this._children = tools.isEmpty(children)? []: children;
    }
    get children() {
        return this._children;
    }

    /*
    * 按钮组合形状，可选值为circle或者不设置
    * */
    private _shape?:string;
    set shape(shape:string) {
        if(tools.isEmpty(shape)) {
            return;
        }
        if(shape === 'circle') {
            this.wrapper.classList.add('input-box-circle');
        } else {
            this.wrapper.classList.remove('input-box-circle');
        }
    }
    get shape() {
        return this._shape;
    }
    /*
    * 组件集合大小
    * 类型：string
    * 默认：middle | small | large
    * */
    private _size: string;
    set size(size: string) {
        if (this._size) {
            this.wrapper.classList.remove(`input-box-${this._size}`);
        }
        size = tools.isEmpty(size) ? 'small' : size;
        switch (size) {
            case 'small':
                this.wrapper.classList.add('input-box-small');
                break;
            case 'middle':
                this.wrapper.classList.add('input-box-middle');
                break;
            case 'large':
                this.wrapper.classList.add('input-box-large');
                break;
        }
        this._size = size;
    } 

    get size() {
        return this._size;
    }

    /*
    * 若为非紧凑型，则传入欲指定的紧凑间距(>0)，否则视为紧凑型
    * */
    private _compactWidth: number;
    set compactWidth(compactWidth: number) {
        if (compactWidth > 0) {
            this.wrapper.classList.remove('compact');
        } else {
            this.wrapper.classList.add('compact');
        }
        this.responsive();
        // compactWidth = tools.isEmpty(compactWidth) ? 0 : compactWidth;
        //
        // if (compactWidth > 0) {
        //     this.wrapper.classList.remove('not-compact');
        //     let count = 0;
        //     for (let d of this.children) {
        //         if (count === 0) {
        //             count++;
        //             continue;
        //         }
        //         if (count > this._lastNotMoreIndex && this._lastNotMoreIndex > 0) {
        //             break;
        //         }
        //         let comKey = Object.keys(d)[0],
        //             com = d[comKey],
        //             marginWidth = 0;
        //         if (com) {
        //             marginWidth = parseInt(getComputedStyle(com._wrapper)['margin-left']) > 0 ? parseInt(getComputedStyle(com._wrapper)['margin-left']) : 0;
        //             com._wrapper.style.marginLeft = compactWidth + 'px';
        //         }
        //         this.wrapper.style.width = parseInt(this.wrapper.style.width) + compactWidth - marginWidth + 'px';
        //         if (parseInt(this.wrapper.style.width) > this._maxWidth) {
        //             let guid = Object.keys(this.children[this._lastNotMoreIndex])[0],
        //                 lastCom = this.children[this._lastNotMoreIndex][guid],
        //                 lastMargin = 0;
        //             if (lastCom) {
        //                 lastMargin = parseInt(getComputedStyle(lastCom._wrapper)['margin-left']) > 0 ? parseInt(getComputedStyle(lastCom._wrapper)['margin-left']) : 0;
        //                 if (this._compactWidth && this._lastNotMoreIndex > -1) {
        //                     lastCom._wrapper.style.marginLeft = 0 + 'px';
        //                 }
        //                 //仅从dom结构上改变了组件，并未改变组件的container属性
        //                 if (this._dropDown) {
        //                     this._dropDown.getUlDom().insertBefore(lastCom._wrapper, this._dropDown.getUlDom().firstChild);
        //                 }
        //                 this.wrapper.style.width = parseInt(this.wrapper.style.width) - parseInt(getComputedStyle(lastCom._wrapper)['width']) + 5 + 'px';
        //                 this._lastNotMoreIndex -= 1;
        //             }
        //         }
        //         count++;
        //     }
        // }
        // else {
        //     this.wrapper.classList.add('not-compact');
        //     // if(this._compactWidth > 0) { }
        // }
        this._compactWidth = compactWidth;
    }

    get compactWidth() {
        return this._compactWidth;
    }

    /*
    * 更多按钮 | 仅在_isResponsive为真时有效
    * 若传入则根据传入值，未传入则默认生成  | type默认为second
    * (根据其dropDown是否为空，判断当前组件集合中是否已经存在更多下拉列表)
    * */
    private _moreBtn?: Button;
    set moreBtn(moreBtn: Button) {
        if(this._isResponsive) {
            this._moreBtn = moreBtn;
        }
    }

    get moreBtn() {
        return this._moreBtn;
    }

    private _isResponsive: boolean;
    set isResponsive(isResponsive: boolean) {
        this._isResponsive = tools.isEmpty(isResponsive) ? false : isResponsive;

    }

    get isResponsive() {
        return this._isResponsive;
    }

    // 【待改...】
    responsive() {
        if(!this.isResponsive){
            return ;
        }
        //如果获取不到父容器宽度，则无响应式
        // let paWidth = parseInt(getComputedStyle(<HTMLElement>this._container)['width']);
        // console.log('paWidth:',paWidth);
        // if (paWidth < 1) {
        //     return;
        // }
        //如果当前组件集合宽度 > 父容器宽度
        // if (parseInt(this.wrapper.style.width) > paWidth && this.children.length > 0) {
        if (this.children.length > 4) {
            //判断是否有更多下拉列表
            tools.isEmpty(this._moreBtn) && (this._moreBtn = new Button({
                content: '更多',
                size: this._size,
            }));
            //不存在更多下拉列表，则生成更多下拉列表
            if (!this._moreBtn || !this._moreBtn.dropDown) {
                this.wrapper.appendChild(this.moreBtn.wrapper);
                this.wrapper.style.width = parseInt(this.wrapper.style.width) + parseInt(getComputedStyle(this._moreBtn.wrapper)['width']) + 'px';
                // console.log('更多：',parseInt(getComputedStyle(this._moreBtn.wrapper)['width']));
                let self = this;
                this.moreBtn.dropDown = new DropDown({
                    el: self.moreBtn.wrapper,
                    inline: false,
                    data: [],
                    multi: null,
                    className: "input-box-morebtn"
                });
            }
            //从组件集合末尾倒序调整
            let len = this.children.length;
            for (let i = len - 1; i >= 0; i--) {
                //当组件集合宽度超过限制的最大宽度时，将最后一个非更多下拉列表内的组件放置于更多下拉列表容器内（插入到其第一个子元素之前）
                // if (parseInt(this.wrapper.style.width) > paWidth) {
                    let com = this.children[i];
                    if (com) {
                        if (this._compactWidth && i > -1) {
                            com.wrapper.style.marginLeft = 0 + 'px';
                        }
                        this.wrapper.style.width = parseInt(this.wrapper.style.width) - parseInt(getComputedStyle(com.wrapper)['width']) + 5 + 'px';
                        //仅从dom结构上改变了组件，并未改变组件的container属性
                        if (this.moreBtn.dropDown) {
                                this.moreBtn.dropDown.getUlDom().appendChild(com.wrapper);
                        }
                        this._lastNotMoreIndex = i;
                    }
                // }
            }
        }
    }


    /*
    *  将组件添加到组件集合
    *  参数：com:组件
    * */
    addItem(com: any, position?: number) {
        if (!com) {
            return;
        }
        if(typeof position === 'number'){
            position = Math.max(0, position);
            position = position >= this.children.length ? void 0 : position;
        }

        com.size = this._size;
        //将组件元素添加进组件集合容器（仅改变dom）,如果存在更多按钮下拉列表，则将组件插入到更多按钮之前。
        if (this._moreBtn && this._moreBtn.dropDown) {
            this.wrapper.insertBefore(com.wrapper, this.wrapper.lastChild);
        } else {
            if(typeof position === 'number'){
                d.before(this.wrapper.children[position], com.wrapper);
            }else{
                this.wrapper.appendChild(com.wrapper);
            }
        }
        //添加至组件集合children
        if(typeof position === 'number'){
            this.children.splice(position, 0, com);
        }else {
            this.children.push(com);
        }

        //水平
        // if (this.inputBox && !this.inputBox.isVertical && this.isResponsive) {
        if (!this.isVertical && this.isResponsive) {
            //第一个组件元素
            if (this.wrapper.children.length < 2) {
                this.wrapper.style.width = com.wrapper.clientWidth + 2 + 'px';
            } else {
                this.wrapper.style.width =parseInt(this.wrapper.style.width) + com.wrapper.clientWidth + 2 + 'px';
            }
            this.responsive();
        }
    }

    /*
    * 获取组件集合
    * 参数：number | string | void
    * number：按照组件集合的下标获取组件（下标由添加时决定,从0起）  |  string： 根据组件集合的键获取组件
    * */
    getItem(item?: string | number) {
        if (!this.children || !this.children[0]) {
            return null;
        }
        if (typeof item === 'number') {
            return this.children[item];
        }
        for (let d of this.children) {
            if (d.key === item) {
                return d;
            }
        }
        return null;
    }


    /*
    * 删除组件集合
    * 参数：number | string
    * number：按照组件集合的下标删除组件（下标由添加时决定,从0起）  |  string： 根据组件集合的键删除组件
    * 返回值：返回被删除的组件，若未找到要删除的组件则返回null
    * */
    delItem(item: string | number) {
        if (!this.children || !this.children[0]) {
            return null;
        }
        if (typeof item === 'number') {
            let curCom = this.children[item];
            if (curCom) {
                this.children[item].remove();
                this.children.splice(item, 1);
            }
            return curCom;
        }
        let index = 0;
        for (let d of this.children) {
            if (d.key === item) {
                let curCom = d;
                if (d) {
                    this.children.splice(index, 1);
                    d.remove();
                }
                return curCom;
            }
            index++;
        }
        return null;
    }

    /*
    * 根据窗口变化改变限制的最大宽度
    * */
    // private resizeHandler() {
    //     /**/let timer = null;
        /*d.on(window, 'resize', () => {
            if (timer === null) {
                timer = setTimeout(() => {
                    this.responsive();
                    timer = null;
                }, 1000);
            }
        });*/
    // }

    set isShow(flag: boolean){
        d.hide(this.wrapper, !flag);
    }

    constructor(inputBox: IInputBoxPara = {}) {
        super(inputBox);
        this.init(inputBox);
    }
}