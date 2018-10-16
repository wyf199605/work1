/// <amd-module name="BasicCom"/>
import tools = C.tools;
import {Tooltip} from "../ui/tooltip/tooltip";
import d = C.d;
import {Component, IComponentPara} from "../Component";
export interface IFormComPara extends IComponentPara{
    value?: any;
}
export abstract class FormCom extends Component{
    abstract get():any;
    abstract set(...any):void;

    abstract onSet: (val) => void;

    // protected _value: any;
    // abstract get value():any;
    // abstract set value(val);

    // get value(){
    //     return this.valueGet();
    // }
    //
    // set value(any){
    //     return this.valueSet();
    // }

    private toolTips: Tooltip;
    error(isError: boolean, errorMsg: string = "", parentEle : HTMLElement = this.wrapper){
        if(!parentEle) {
            return ;
        }
        if(isError) {
            parentEle.classList.add("error");
            this.toolTips = new Tooltip({
                pos: "up",
                length: "medium",
                visible: true,
                errorMsg: "\ue633 "+errorMsg,
                el: parentEle
            });
        } else {
            parentEle.classList.remove("error");
            this.toolTips ? this.toolTips.hide() : '';
        }
    }
}

export abstract class BasicCom{
    abstract get():any;
    abstract set(...any):void;
    abstract onSet: (val)=>void;

    protected _wrapper : HTMLElement;
    get wrapper(){
        return this._wrapper
    }

    protected _value:any;
    private toolTips;
    error(isError : boolean, errorMsg: string = "", parentEle : HTMLElement = this._wrapper){
        if(!parentEle) {
            return ;
        }
        if(isError) {
            parentEle.classList.add("error");
             this.toolTips =  new Tooltip({
                pos: "up",
                length: "medium",
                visible: true,
                errorMsg: "\ue633 "+errorMsg,
                el: parentEle
            });
        } else {
            parentEle.classList.remove("error");
            this.toolTips ? this.toolTips.hide() : '';
        }
    }



    destroy(){
        if(this._wrapper){
            d.remove(this._wrapper);
        }
    }

    tabIndexElGet() : HTMLElement{
        return this.wrapper
    }
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
        let wrapper = this.tabIndexElGet();
        if(tabIndex){
            wrapper.tabIndex = parseInt(tools.getGuid(''));
            d.on(wrapper, 'keydown', this.keyHandle);
        }else {
            d.off(wrapper, 'keydown', this.keyHandle);
            wrapper.removeAttribute('tabIndex');
        }
    }

    protected keyHandle = (e : KeyboardEvent) => {};
}