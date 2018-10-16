/// <amd-module name="TextInput"/>
import tools = C.tools;
import {BasicCom} from "../basic";
import d = C.d;
import Shell = C.Shell;
export interface TextInputPara extends TextInputBasicPara {
    icons?: string[];
    iconHandle?(index?: number, icon?: HTMLElement): void;
    isScan?: boolean;
    on2dScan?(code: string):void
}

export interface TextInputBasicPara extends ComPara{
    className?: string;
    placeholder?: string;
    readonly?: boolean;
    disabled?: boolean;
    type?: string;
}

export class TextInput extends BasicCom {
    onSet: (val) => void;
    protected input: HTMLInputElement;
    protected iconGroup: HTMLElement;
    protected isReadonly: boolean;
    protected props : TextInputPara;

    constructor(protected para: TextInputPara) {
        super();
        this.props = para;
        let defaultPara = {
            className: '',
            placeholder: '',
            readonly: false,
            disabled: false
        };

        this.para = <TextInputPara>tools.obj.merge(defaultPara, para);
        this.isReadonly = !!this.para.readonly ;

        this.initInput();

        this.initIcons();

        para.container.appendChild(this._wrapper);

        d.on(this.input, 'change', () => {
            // debugger;
            this.set(this.get());
        });

    }

    protected keyHandle = (e : KeyboardEvent) => {};
    tabIndexElGet() : HTMLElement{
        return this.input
    }
    /**
     * 初始化输入框
     * @return {HTMLInputElement}
     */
    private initInput() {
        let div = document.createElement('div');
        div.classList.add('text-input');
        this._wrapper = div;

        let input = document.createElement('input');
        input.type = (typeof this.para.type === 'undefined') ?  'text' :this.para.type;

        input.className = this.para.className;
        input.placeholder = this.para.placeholder;
        input.readOnly = this.para.readonly;
        input.disabled = this.para.disabled;

        this.input = input;

        div.appendChild(input);
    }
    /**
     * 初始化输入框按钮图标
     */
    private initIcons(){
        let icons = this.para.icons;

        if(icons && icons[0]){
            let iconGroup = d.create(`<div class="btn-group"></div>`);
            icons.forEach((icon, i) => {
                iconGroup.appendChild(
                    d.create(`<a class="btn btn-sm icon ${icon}" data-index="${i}"></a>`))
            });

            this.input.style.width = `calc(100% - ${icons.length * 20}px)`;

            this._wrapper.appendChild(iconGroup);

            // 事件绑定
            if(typeof this.para.iconHandle === 'function'){
               this.initIconEven(iconGroup);
            }
            // console.log(iconGroup)
            this.iconGroup = iconGroup;
        }
    }
    private initIconEven(iconGroup){
        let  self = this,
             can2dScan = Shell.inventory.can2dScan;
       if(can2dScan) {
           Shell.inventory.openScan((res) => {
               if(res.success && res.data !== 'openSuponScan') {
                   self.set(res.data);
                   if(tools.isFunction(this.para.on2dScan)){
                       this.para.on2dScan(res.data);
                   }
               }
           });
       }else {
           d.on(iconGroup, 'click', 'a[data-index]', function (e:Event) {
               let index = parseInt(this.dataset.index);
               if(this.dataset.type === 'scan'){
                   //扫码
                   // (<any>ShellAction.get()).device().scan({
                   //     callback: (even) => {
                   //         self.set(JSON.parse(even.detail).data)
                   //     }
                   // });
               }else{
                   self.props.iconHandle(index, this);
               }

               e.stopPropagation();
           });
       }

    }

    private _scanEl : HTMLElement;
    private _isScan: boolean;
    set isScan(flag: boolean){
        if(!flag && this._scanEl){
            this._scanEl.remove();
            this._scanEl = null;
        }
        if(!this._scanEl && flag){
            if(!this.iconGroup){
                this.iconGroup = d.create(`<div class="btn-group"></div>`);
                this._wrapper.appendChild(this.iconGroup);
                this.initIconEven(this.iconGroup);
            }
            this._scanEl = d.create(`<a data-index="-1" class="btn btn-sm icon iconfont icon-richscan_icon" data-type="scan"></a>`);
            d.append(this.iconGroup, this._scanEl);
        }
    }
    get isScan(){
        return this._isScan
    }


    /**
     * 事件绑定
     * @param type - HTMLInputElement 原生事件
     * @param handle - 事件处理
     */
    public on(type:string, handle: EventListener){
        d.on(this.input, type, handle);
    }

    get(): string | any {
        return this.input.value;
    }

    set(str: string | number): void {
        this.input.value = tools.str.toEmpty(str);
        typeof this.onSet === 'function' && this.onSet(str);
    }

    readonly (is? : boolean){
        if(typeof is === 'undefined') {
            return this.isReadonly;
        }else {
            this.input.readOnly = is;
            return is;
        }
    }
    placeholder (str : string){
        this.input.placeholder = str;
    }
    destroy(){
        d.remove(this._wrapper);
        this._wrapper = null;
        this.input = null;
        this.para = null;
    }
    wrapperGet(){
        return this._wrapper;
    }
    disable(flag: boolean){
        this.input.disabled = flag;
        this._wrapper.classList.toggle('disabled', flag);
    }
    focus(){
        this.input.focus();
    }
}