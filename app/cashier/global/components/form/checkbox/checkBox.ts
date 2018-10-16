/// <amd-module name="CheckBox"/>
import tools = C.tools;
import {BasicCom} from "../basic";
import d = C.d;

interface CheckBoxPara extends ComPara {
    className?: string;
    text?: string;
    tabIndex? : boolean;
    tabIndexKey? : number;
    onSelect?(isChecked: boolean): void;

    onSet?(isChecked: boolean): void;
}

export class CheckBox extends BasicCom {
    onSet: (isChecked: boolean) => void;
    private com: HTMLInputElement;
    private _tabIndexKey : number;

    constructor(private para: CheckBoxPara) {
        super();

        this._wrapper = CheckBox.initCom(tools.getGuid(), para.text);
        this._tabIndexKey = para.tabIndexKey;
        this.tabIndex = para.tabIndex;
        if (para.className) {
            this._wrapper.classList.add(para.className)
        }

        this.com = this._wrapper.querySelector('input');
        para.container.appendChild(this._wrapper);

        if (this.para.onSet) {
            this.onSet = this.para.onSet;
        }

        d.on(this._wrapper, 'click', '.check-span', (e) => {
            if (typeof para.onSelect === 'function') {
                this.para.onSelect(!!this.get());
            }
            if (typeof this.onSet === 'function') {
                this.onSet(!!this.get());
            }
        });
    }

    static initCom(guidName, text?, type = 'checkbox') {
        text = tools.str.toEmpty(text);

        let checkBox = d.create(`<div title="${text}" class ="select-box"></div>`),
            input = <HTMLInputElement> d.create(`<input name="${guidName}" type="${type}">`),
            span = d.create(`<span class="check-span label-${type}">${text}</span>`);

        //手动绑定label点击后input的选中状态
        d.on(span, 'click', function (e) {
            input.checked = !input.checked;
        });

        checkBox.appendChild(input);
        checkBox.appendChild(span);

        return checkBox;
    }

    get(): any {
        return this.com.checked ? 1 : 0;
    }

    set(flag: number | boolean = 0): void {
        this.com.checked = !!flag;
        if (typeof this.onSet === 'function') {
            this.onSet(!!flag);
        }
    }

    destroy() {
        d.remove(this.wrapper)
    }

    setSelected() {
        d.query('.check-span', this.wrapper).click();
    }

    protected keyHandle = (e : KeyboardEvent) => {
        let keyCode = e.keyCode || e.which || e.charCode;
        if(tools.isNotEmpty(this._tabIndexKey)){
            if(keyCode === this._tabIndexKey){
                this.set(!this.get());
            }
        }else if(keyCode === 13){
            this.set(!this.get());
        }
    };

}

interface ICheckBoxPara extends ComPara {
    className?: string;
    text?: string;
    status?: number; // 0未选中 1选中 2半选中
    size?: number;
    onClick?(isChecked: boolean): void;
    clickArea?: 'all' | 'box';
    onSet?(isChecked: boolean): void;
    container: HTMLElement;
    custom?: ICustomCheck;
    disabled?: boolean;
}
interface ICustomCheck {
    check?: string;
    noCheck?: string;
    indeterminate?: string;
}

let checkBoxEvent = (() => {
    let count = 0;
    function checkEvent(ev) {
        let el = d.closest(ev.target, '.new-select-box');
        if (el !== null && !el.classList.contains('disabled')) {
            let checkBox: NewCheckBox = d.data(el);
            if (checkBox.clickArea === 'all') {
                ev.stopPropagation();
                checkBox.checked = !checkBox.checked;
                tools.isFunction(checkBox.onClick) && checkBox.onClick(checkBox.checked);
            } else if (checkBox.clickArea === 'box') {
                let box: HTMLElement = el.querySelector('.check-span');
                if (d.closest(ev.target, '.check-span') === box) {
                    ev.stopPropagation();
                    checkBox.checked = !checkBox.checked;
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

export class NewCheckBox extends BasicCom {
    protected container: HTMLElement;
    onSet: (val) => void;
    protected input: HTMLInputElement;
    protected checkSpan: HTMLElement;
    readonly clickArea: 'all' | 'box';
    protected guid: string;

    constructor(para: ICheckBoxPara) {
        super();
        this.guid = tools.getGuid();
        this.container = para.container;
        this._wrapper = NewCheckBox.initCom(this.guid, tools.str.toEmpty(para.text));
        this.custom = para.custom;
        this.input = this._wrapper.querySelector('input');
        this.checkSpan = this._wrapper.querySelector('.check-span');
        this.size = para.size;
        this.status = para.status;
        this.onSet = para.onSet;
        this.onClick = para.onClick;

        if (para.className) {
            this._wrapper.classList.add(para.className)
        }

        this.clickArea = tools.isEmpty(para.clickArea) ? 'all' : para.clickArea;

        this.container.appendChild(this._wrapper);
        this.disabled = para.disabled;
        d.data(this.wrapper, this);
        checkBoxEvent.plus();
    }

    static initCom(guidName, text: string, type = 'checkbox') {
        let box = d.create(`<div id="${guidName}" title="${text}" class ="new-select-box"></div>`),
            input = <HTMLInputElement>d.create(`<input type="${type}" name="${guidName}"/>`),
            checkSpan = d.create(`<span class="check-span label-${type}"></span>`);

        box.appendChild(input);
        box.appendChild(checkSpan);
        if (text !== '') {
            let textSpan = d.create(`<span class="check-text">${text}</span>`);
            box.appendChild(textSpan);
        }
        return box;
    }

    protected change(status?: number) {
        this._checked = status === 1;
        this._status = tools.isEmpty(status) ? 0 : status;
        if (status === 2) {
            this.input.checked = false;
            this.checkSpan.classList.add('indeterminate');
        } else {
            this.input.checked = !!status;
            this.checkSpan.classList.remove('indeterminate');
        }
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

    protected _checked: boolean = false;
    get checked() {
        return this._checked;
    }

    set checked(checked: boolean) {
        if (this._checked !== checked) {
            this.change(checked ? 1 : 0);
        }
        if (typeof this.onSet === 'function') {
            this.onSet(checked);
        }
    }

    protected _status: number = 0;
    set status(status: number) {
        if (this._status !== status) {
            this.change(status);
        }
    }

    get status() {
        return this._status;
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

    protected _disabled: boolean = false;
    set disabled(e: boolean) {
        if (this._disabled !== e) {
            if (tools.isNotEmpty(e)) {
                this._disabled = e;
                if (this._disabled) {
                    this.wrapper.classList.add('disabled');
                } else {
                    this.wrapper.classList.remove('disabled');
                }
            }
        }
    }

    get disabled() {
        return this._disabled;
    }

    protected _custom: ICustomCheck;
    set custom(obj: ICustomCheck) {
        this._custom = obj;
        if (tools.isNotEmpty(obj)) {
            let el = d.create('<style></style>');
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
}