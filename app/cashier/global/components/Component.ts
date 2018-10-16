/// <amd-module name="Component"/>
import tools = C.tools;
import d = C.d;

export interface IComponent {
    // guid?: string;
    // key?: string;
    container?:HTMLElement;
    wrapper?: HTMLElement;
    // className?: string;
    data?: any;

}
export interface IComponentPara {
    // guid?: string;
    // key?: string;
    container?: HTMLElement;
    className?: string;
    data?: obj;
    disabled? :boolean;
    tabIndex? : boolean;
    tabIndexKey? : number;
}

export abstract class Component{

    protected abstract wrapperInit(para: IComponentPara): HTMLElement;

    constructor(para: IComponentPara = {}) {
        // this._guid = tools.getGuid();
        this.data = para.data;
        this._wrapper = this.wrapperInit(para);
        this.container = para.container || document.body;
        this.className = para.className;
        this._tabIndexKey = para.tabIndexKey;
        this.tabIndex = para.tabIndex;
        // this.key = component.key;
    }

    private _tabIndexKey : number;
    private _tabIndex : boolean = false;
    get tabIndex(){
        return this._tabIndex;
    }
    set tabIndex(tabIndex : boolean){
        tabIndex = !!tabIndex;
        if(this._tabIndex === tabIndex){
            return;
        }
        this._tabIndex = tabIndex;
        if(tabIndex){
            this.wrapper.tabIndex = parseInt(tools.getGuid(''));
            d.on(this.wrapper, 'keydown', this.keyHandle);
        }else {
            d.off(this.wrapper, 'keydown', this.keyHandle);
            this.wrapper.removeAttribute('tabIndex');
        }
    }

    get isFocused() {
        return this.wrapper === document.activeElement;
    }

    protected keyHandle = (e : KeyboardEvent) => {};

    /**
     * 包装组件dom的根元素
     */
    private _wrapper: HTMLElement;
    get wrapper() {
        // if(!this._wrapper){
        //     this._wrapper = this.wrapperInit();
        // }

        return this._wrapper;
    }

    protected _className: string;
    set className(str: string) {
        let old = this._className;

        if(str && this.wrapper && typeof str === 'string' && str !== old){
            if(typeof old === 'string'){
                this.wrapper.classList.remove(...old.split(' '));
            }
            this.wrapper.classList.add(str);
            this._className = str;
        }
    }
    get className(){
        return this._className;
    }

    // /**
    //  * 组件编号
    //  */
    // private _guid?: string;
    // get guid() {
    //     return this._guid;
    // }

    // /**
    //  * 组件的键
    //  *
    //  * */
    // protected _key: string;
    // set key(key: string) {
    //     this._key = tools.isEmpty(key) ? this._guid : key;
    // }
    // get key() {
    //     return this._key;
    // }

    /**
     * 组件数据
     *
     * */
    public data;

    /**
     * 指定dom挂载的 HTML 节点
     * 默认document.body
     */

    protected _container: HTMLElement;
    set container(container: HTMLElement) {
        // 容器发生改变，组件的dom元素也转移到相应容器中
        let wrapper = this.wrapper;
        if (container && this._container !== container) {

            if(wrapper && container !== wrapper) { // 特殊情况下, wrapper 和 container可以是同一个元素
                d.append(container, wrapper);
            }

            this._container = container;
        }
    }
    get container() {
        return this._container;
    }

    /**
     * 移除组件
     */
    remove() {
        d.remove(this._wrapper, false);
        this._container = null;
    }

    destroy(){
        d.remove(this._wrapper);
        this._wrapper = null;
        this.data = null;
        this._container = null;
        this._className = null;
    }

    public eventHandlers: objOf<Function[]> = {};

    on(name: string, handler: Function) {
        if(!this.eventHandlers[name]){
            this.eventHandlers[name] = []
        }
        this.eventHandlers[name].push(handler);
    }
    off(name: string, handler?: Function){
        if(this.eventHandlers[name]){
            if(typeof handler === 'function'){
                this.eventHandlers[name].forEach((item, index) => {
                    if(item === handler){
                        this.eventHandlers[name].splice(index, 1);
                    }
                })
            }else{
                delete this.eventHandlers[name];
            }
        }
    }

    trigger(type: string, ...para){
        const handlers = this.eventHandlers[type];
        handlers && handlers.forEach((item) => {
            typeof item === 'function' && item(para);
        });
    }
}