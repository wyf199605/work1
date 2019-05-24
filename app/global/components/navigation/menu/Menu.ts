/// <amd-module name="Menu"/>
import d = G.d;
import tools = G.tools;

import {
    ElementTreeNode,
    IElementTreeAjax,
    IElementTreeNodePara
} from "../elementTreeBase/ElementTreeNode";

export interface IMenuPara extends IElementTreeNodePara {
    children?: IMenuPara[];
    isOutline?: boolean; // 是否展开到外部    默认false ,继承
    isHorizontal?: boolean; // 是否水平展示      默认false ,继承
    isHoverExpand?: boolean; // 是否鼠标移入展示  默认false  ,继承
    isCollect?: boolean;//是否含有收藏功能
    ajax?: IElementTreeAjax<Menu, IMenuPara>; // 继承
    // onOpen?(node: Menu): void; // 继承
}
/**
 * 菜单组件对象
 */
export class Menu extends ElementTreeNode {
    static CollectFunc: (node: any) => void;
    constructor(para: IMenuPara) {
        super(para);
        // console.log('menu', para);
        
    }

    protected init(para: IMenuPara) {
        super.init(para)
        // console.log('init',para);
        // 收藏按钮  引入isCollect 
        if (this.isCollect) {
            if ((this.deep == 1 && para.isLeaf) || this.deep !== 1) {
                let dom = "";
                if (this.content.favid) {
                    dom = `<span class="collect_btn"><i class="iconfont icon-shoucang_fill has_collect"/></span>`
                } else {
                    dom = `<span class="collect_btn un_collect_btn"><i class="iconfont icon-shoucang un_collect"/></span>`
                }
                d.query(".tree-text-wrapper", this.wrapper).appendChild(d.create(dom))
            }
        }

        // 设置角标 （渔人码头：设置菜单栏标红）
        window.localStorage.setItem('subScriptStatus','1');
        setInterval(()=> {
            let subScriptStatus = window.localStorage.getItem('subScriptStatus');
            if(subScriptStatus === '1') {
                this.setSubScript(para);
                // localStorage.setItem('subScriptStatus', '0');
            } 
        },500);



        if (para.container) {
            this.container = para.container;
            para.width && (this.wrapper.style.width = `${para.width}px`);
        }
        // debugger;
        this.isHoverExpand = tools.isUndefined(para.isHoverExpand)
            ? this.inherit("isHoverExpand")
            : para.isHoverExpand;
        this.isOutline = tools.isUndefined(para.isOutline)
            ? this.inherit("_isOutline")
            : para.isOutline;
        this.isHorizontal = tools.isUndefined(para.isHorizontal)
            ? this.inherit("_isHorizontal")
            : para.isHorizontal;
        this.eventInit();
    }

    /**
     * // 设置角标 （渔人码头：设置菜单栏标红）
     * @param menuItem 获取菜单栏
     */
    setSubScript(menuItem) {
        
        if( !menuItem || !menuItem.content || !menuItem.content.subScriptUrl ) return ;
        window.localStorage.setItem('subScriptStatus','0');
        let url = sessionStorage.getItem('siteUrl') + menuItem.content.subScriptUrl;
        $.get(url,(res) => {
            console.log('subscript', res);
            
            if(res.body && res.body.bodyList && res.body.bodyList.length > 0){
                
                let num = res.body.bodyList[0].dataList[0][0];
                let subScriptParent = d.query(".tree-text-wrapper>.menu-sub-script", this.wrapper);
                console.log(subScriptParent);
                if( subScriptParent ) {
                    return subScriptParent.textContent = `(${num})`;
                } 
                let dom = `<span class="menu-sub-script">(${num})</span>`;
                // this.wrapper.removeChild(d.query('.menu-sub-script'))
                
                d.query(".tree-text-wrapper", this.wrapper).appendChild(d.create(dom))
            }
        });
    }

    private isHoverExpand: boolean;

    private eventInit() {
        if (this.isVirtual) {
            return;
        }

        if (this.isHoverExpand) {
            d.on(this.wrapper, "mouseenter", event => {
                event.preventDefault();
                this.expand = true;
            });
            d.on(this.wrapper, "mouseleave", event => {
                event.stopPropagation();
                if (this.parent) {
                    this.expand = false;
                }
            });
            d.on(this.textWrapper, "click", event => {
                event.stopPropagation();
                if (this.isLeaf && !this.isOnTop) {
                    this.parent.expand = !this.parent.expand;
                }
                this.selected = true;
                this.onOpen && this.onOpen(this);
            });
        } else {
            d.on(this.textWrapper, "click", (event: MouseEvent) => {
                event.stopPropagation();
                let list = event.srcElement.classList
                let status = list.contains("collect_btn") || list.contains("icon-shoucang_fill") || list.contains("icon-shoucang")
                if (this.isCollect && status) {
                    Menu.CollectFunc(this);
                } else {
                    this.expand = !this.expand;
                    //   (!this.children) && (this.selected = !this.selected);
                    this.selected = true;
                    this.onOpen && this.onOpen(this);
                }


            });
            // d.on(d.query(".collect_btn", this.textWrapper),"click",(event:MouseEvent)=>{
            //   console.log("2222")
            // })
        }
    }

    private _isOutline: boolean;
    set isOutline(flag: boolean) {
        if (flag !== this._isOutline) {
            this.parent && this.wrapper.classList.toggle("menu-node-outline", flag);
            this._isOutline = !!flag;
        }
    }

    get isOutline() {
        return this._isOutline;
    }

    private _isHorizontal: boolean;
    set isHorizontal(flag: boolean) {
        if (flag !== this._isHorizontal) {
            this.wrapper.classList.toggle("menu-node-horizontal", flag);
            this._isHorizontal = !!flag;
        }
    }

    get isHorizontal() {
        return this._isHorizontal;
    }

    // 设置是否是虚拟节点
    // protected isVirtualSet(flag:boolean) {
    //
    //     super.isVirtualSet(flag);
    // }

    protected _expandIconEl: HTMLElement;
    protected get expandIconEl() {
        if (!this._expandIconEl) {
            let pre = this.inherit("_expandIconPre"),
                p = tools.isNotEmpty(pre) ? pre : "iconfont";
            this._expandIconEl = d.create(
                `<i class="${p} ${this.getCurrentExpandIcon()} tree-open-icon"></i>`
            );
            d.prepend(this.textWrapper, this._expandIconEl);
        }
        return this._expandIconEl;
    }

    // 打开的按钮
    protected expandIcon() {
        let iconArr = this.inherit("_expandIconArr");
        iconArr = tools.isNotEmpty(iconArr) ? iconArr : ["icon-arrow-up"];
        return this.isHorizontal ? ["icon-arrow-up", "icon-arrow-down"] : iconArr;
    }

    childrenAdd(tnode: this | IMenuPara | (this | IMenuPara)[]): this[] {
        // debugger;
        let tnodes = super.childrenAdd(tnode);
        tnodes.forEach(node => {
            node.each(menu => {
                if (menu.isOutline) {
                    menu.textWrapper.style.position = "relative";
                    let topDeep = 0;
                    let leftDeep = 0;
                    if (menu.deep - 2 > 0) {
                        leftDeep = menu.deep - 2;
                        topDeep = menu.deep - 2;
                    }
                    menu.textWrapper.style.left = leftDeep * 135 + "px";
                    menu.textWrapper.style.top = -topDeep * 33 + "px";
                } else {
                    if (!menu.isHorizontal) {
                        menu.textWrapper.style.paddingLeft = menu.deep * 12 + "px"; //如果子菜单模式为纵向  则需要计算间隔
                    }
                }
                node.container = this.childrenEl;
            });
        });
        return tnodes;
    }

    protected wrapperCreate() {
        let wrapper = super.wrapperCreate();
        wrapper.classList.add("menu-node");
        // if (this.deep == 1) {
        //   let list = G.d.queryAll("#mainNavMenu>.element-tree-node>.tree-child-wrapper>.element-tree-node")
        //   for (var i = 0; i < list.length; i++) {
        //     if (!list[i].querySelector(".element-tree-node>.tree-text-wrapper>.invisible")) {
        //       let collect = list[i].querySelector(".element-tree-node>.tree-text-wrapper>.collect_btn");
        //       if (collect) {
        //         collect.parentNode.removeChild(collect);
        //       }
        //     }
        //   }
        // }
        d.data(wrapper, this);
        return wrapper;
    }

    setPosition(x: number, y: number) {
        this.wrapper.style.top = y + "px";
        this.wrapper.style.left = x + "px";
    }
}
