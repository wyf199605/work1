/// <amd-module name="BasicCheckBox"/>

import {FormCom, IFormComPara} from "../basic";
import d = G.d;
import tools = G.tools;

export interface IBasicBoxPara extends IFormComPara {
    type?: "checkbox" | "radio";
    text?: string;
    size?: number;
    name?: string;
    onClick?(isChecked: boolean): void;
    clickArea?: 'all' | 'box';
    onSet?(isChecked: boolean): void;
    custom?: ICustomCheck;
    value?: any;
}
export interface ICustomCheck {
    check?: string;
    noCheck?: string;
    indeterminate?: string;
}

let checkBoxEvent = (() => {
    let count = 0;
    function checkEvent(ev) {
        let el = d.closest(ev.target, '.select-box');
        if (el !== null && !el.classList.contains('disabled')) {
            let checkBox: BasicCheckBox = d.data(el);
            let isRadio = checkBox.type === 'radio';
            let checked = checkBox.wrapper.querySelector('input').checked;
            if (checkBox.clickArea === 'all') {
                ev.stopPropagation();
                checkBox.checked = isRadio || !checked;
                tools.isFunction(checkBox.onClick) && checkBox.onClick(checkBox.checked);
            } else if (checkBox.clickArea === 'box') {
                let box: HTMLElement = el.querySelector('.check-span');
                if (d.closest(ev.target, '.check-span') === box) {
                    ev.stopPropagation();
                    checkBox.checked = isRadio || !checked;
                    tools.isFunction(checkBox.onClick) && checkBox.onClick(checkBox.checked);
                }
            }
        }
    }
    return {
        plus() {
            count++;
            if (count === 1) {
                document.body.addEventListener('click', checkEvent, true);
                // d.on(document.body, 'click', '.new-select-box',checkEvent);
            }
        },
        minus() {
            count--;
            if (count === 0) {
                document.body.removeEventListener('click', checkEvent, true);
                // d.off(document.body, 'click', '.new-select-box',checkEvent);
            }
        },
    }
})();
export class BasicCheckBox extends FormCom {
    static EVT_CHECK_BOX_CHANGE = 'EVENT_SELECT_BOX_CHECKED';
    protected input: HTMLInputElement;
    protected checkSpan: HTMLElement;

    constructor(para: IBasicBoxPara) {
        super(para);

        // this.container = para.container;
        this.custom = para.custom;
        this._value = para.value;
        this.size = para.size;
        this.onSet = para.onSet;
        this.onClick = para.onClick;

        // if (para.className) {
        //     this._wrapper.classList.add(para.className)
        // }

        this.clickArea = para.clickArea;

        // this.container.appendChild(this._wrapper);
        d.data(this.wrapper, this);
        checkBoxEvent.plus();
    }

    protected wrapperInit(para: IBasicBoxPara): HTMLElement {
        this.guid = tools.getGuid();
        this._name = tools.isEmpty(para.name) ? this.guid : para.name;
        this._type = para.type;
        let wrapper = BasicCheckBox.initCom(this.guid, tools.str.toEmpty(para.text), para.type, this._name);
        this.input = wrapper.querySelector('input');
        this.checkSpan = wrapper.querySelector('.check-span');
        this.text = para.text;
        return wrapper;
    }

    static initCom(guid, text?: string, type = 'checkbox', name: string = guid) {
        return <div id={guid} title={text} className={type + '-wrapper select-box'}>
            <input type={type} name={name}/>
            <span className={`check-span label-${type}`}></span>
            {text ? <span className="check-text">{text}</span> : null}
        </div>;
    }

    private _text:string;
    get text(){
        return this._text;
    }
    set text(t:string){
        this._text = t;
    }

    protected _value: any;
    get value(){
        return this._value;
    }
    set value(value: any){
        this._value = value;
    }

    protected _clickArea: 'all' | 'box';
    get clickArea(){
        return this._clickArea;
    }
    set clickArea(clickArea: 'all' | 'box'){
        this._clickArea = clickArea || 'all';
    }
    protected _type: "checkbox" | "radio";
    get type(){
        return this._type;
    }

    protected _name: string;
    get name(){
        return this._name;
    }
    set name(name: string){
        this.input.name = name;
        this._name = name;
    }
    protected guid: string;

    get checked() {
        return this.input.checked;
    }

    set checked(checked: boolean) {
        if(this.input.checked !== checked) {
            this.input.checked = checked;
            this.input.value = checked ? 'true' : 'false';
            if (typeof this.onSet === 'function') {
                this.onSet(checked);
            }
            let events = this.eventHandlers[BasicCheckBox.EVT_CHECK_BOX_CHANGE];
            tools.isNotEmpty(events) && events.forEach((handler) => {
                handler && handler(checked);
            });
        }
    }

    protected _size: number = 20;
        set size(size: number) {
            if (this._size !== size) {
                if (!tools.isEmpty(size) && typeof size === 'number') {
                    this._size = size;
                    this.checkSpan.style.height = size + 'px';
                    this.checkSpan.style.width = size + 'px';
                    this.checkSpan.style.lineHeight = size + 'px';
                    this.wrapper.style.fontSize = size / 10 * 6 + 'px';
                }
            }
        }
        get size() {
            return this._size;
        }

    protected _custom: ICustomCheck;
    set custom(obj: ICustomCheck) {
        this._custom = obj;
        if (tools.isNotEmpty(obj)) {
            let el = <style></style>;
            let style = '';
            if (tools.isNotEmpty(obj.noCheck)) {
                style += `
             #${this.guid} input[type=checkbox]:not(:checked)+.check-span:not(.indeterminate):after{
                  display: inline-block;
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  content:"${obj.noCheck}";
                  color: #007AFF;
                  text-align: center;
                  font-weight: lighter;
             }
            `;
            }
            if (tools.isNotEmpty(obj.indeterminate)) {
                style += `
            #${this.guid} input[type=checkbox]+.check-span.indeterminate:after {
                  position: absolute;
                  top: 0;
                  left: 0;
                  background: transparent;
                  content:"${obj.indeterminate}";
                  width: 100%;
                  height: 100%;
                  text-align: center;
                  font-weight: lighter;
                  color: #007AFF;
            }
            `;
            }
            if (tools.isNotEmpty(obj.check)) {
                style += `
             #${this.guid} input[type=checkbox]:checked+.check-span:after{
                  content:"${obj.check}";
                  text-align: center;
                  font-weight: lighter;
             }
            `;
            }
            el.innerHTML = style;
            this.wrapper.insertBefore(el, this.wrapper.firstChild);
        }
    }

    get custom() {
        return this._custom;
    }

    protected _onClick: (isChecked: boolean) => void;
    set onClick(e: (isChecked: boolean) => void) {
        this._onClick = e;
    }

    get onClick() {
        return this._onClick;
    }

    destroy() {
        super.destroy();
        checkBoxEvent.minus();
    }

    get(): any {
        return this.checked;
    }

    set(flag: number | boolean = 0): void {
        this.checked = !!flag;
        // if (typeof this.onSet === 'function') {
        //     this.onSet(!!flag);
        // }
    }

    onSet: (val) => void;

    protected keyHandle = (e : KeyboardEvent) => {
        let keyCode = e.keyCode || e.which || e.charCode;
        if(tools.isNotEmpty(this.tabIndexKey)){
            if(keyCode === this.tabIndexKey){
                this.set(!this.get());
            }
        }else if(keyCode === 13){
            this.set(!this.get());
        }
    };
}