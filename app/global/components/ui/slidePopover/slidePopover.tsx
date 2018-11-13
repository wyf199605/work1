/// <amd-module name="SlidePopover"/>

import d = G.d;
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Button, IButton} from "../../general/button/Button";
import {Modal, IModal} from "../../feedback/modal/Modal";

export interface ISlidePopoverPara extends IComponentPara {
    buttons?: IButton[];
    modal?: IModal;
}

export class SlidePopover extends Component {

    protected wrapperInit() {
        return <div className="slide-popover-wrapper">
            <div className="slide-buttons"></div>
            <div className="popover-toggle icon-arrow-down"></div>
        </div>;
    }

    // 弹出的模态框
    private _modal: Modal = null;
    get modal() {
        return this._modal;
    }
    set modal(modal: Modal) {
        this._modal = modal;
    }

    // 所有按钮
    private _buttons: IButton[] = [];
    get buttons() {
        return this._buttons;
    }
    set buttons(buttons: IButton[]) {
        this._buttons = buttons;
    }

    private paraModal = null;

    constructor(para: ISlidePopoverPara) {
        super(para);
        para.buttons && (
            this.buttons = para.buttons,
            this.createButtons()
        );
       this.paraModal = para.modal;
       this.createModal();
       this.initEvent.on();
    }

    // 创建按钮组
    private createButtons(){
        this.buttons.forEach((button, index) => {
            let slideButtonWrapper = <div className="slide-button-wrapper">
                {new Button(Object.assign(button, {size: 'large'})).wrapper}
            </div>;
            d.append(d.query('.slide-buttons', this.wrapper), slideButtonWrapper);
        });
    }

    // 创建模态框
    private createModal(){
        this.modal = new Modal(Object.assign({
            width: '100%',
            isShow: false,
            isBackground: true,
            position: 'up',
        }, this.paraModal));
        let rows = this.buttons.length / 3;
        this.modal.height = 42 * rows + 10 * 2 + 'px';  // 10*2是指上下的padding
        for (let i = 0; i < rows; i++) {
            let buttonRow = <div className="button-row"></div>;
            this.buttons.filter((button, index) => Math.floor(index / 3) === i).forEach(button => {
                d.append(buttonRow, new Button(Object.assign({container: d.query('.modal-body'), size: 'small'}, button)).wrapper);
            });
            d.append(d.query('.modal-body'), buttonRow);
        }
    }

    // 初始化事件
    private initEvent = (() => {
        let toggleClickHandler = (e) => {
            // 显示模态框
            this.modal.isShow = true;
        },
        buttonClickHandler = (e) => {
            // 点击按钮改变对应边框的颜色
            d.queryAll('button.selected', this.wrapper).forEach(button => {
                button.classList.remove('selected');
            });
            let buttonWrapper = d.closest(e.target.parentElement, 'button', this.wrapper);
            buttonWrapper && buttonWrapper.classList.add('selected');
        },
        modalButtonsClickHandler = (e) => {
            // 点击模态框的按钮改变对应边框的颜色
            d.queryAll('button.selected', d.query('.modal-body')).forEach(button => {
                button.classList.remove('selected');
            });
            let buttonWrapper = d.closest(e.target.parentElement, 'button', this.wrapper);
            buttonWrapper && buttonWrapper.classList.add('selected');
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.popover-toggle', toggleClickHandler);
                this.wrapper.addEventListener('click', buttonClickHandler, true);
                this.modal.bodyWrapper.addEventListener('click', modalButtonsClickHandler, true);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.popover-toggle', toggleClickHandler);
                this.wrapper.removeEventListener('click', buttonClickHandler, true);
                this.modal.bodyWrapper.removeEventListener('click', modalButtonsClickHandler, true);
            }
        }
    })();

    // 销毁
    destroy() {
        this.initEvent.off();
        this.modal.destroy();
        super.destroy();
    }
}