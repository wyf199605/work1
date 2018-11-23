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
            <div className="slide-buttons"/>
            <div className="popover-toggle iconfont icon-arrow-down"/>
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

    private paraModal:IModal = {};
    constructor(para: ISlidePopoverPara) {
        super(para);
        if (tools.isNotEmpty(para.buttons)) {
            this.buttons = para.buttons;
            this.createButtons();
            this.createModal();
        }
        this.paraModal = para.modal || {};
        this.initEvent.on();
    }

    // 创建按钮组
    private createButtons() {
        this.buttons.forEach((button) => {
            let slideButtonWrapper = <div className="slide-button-wrapper">
                <Button {...Object.assign(button, {size: 'large'})}/>
            </div>;
            d.append(d.query('.slide-buttons', this.wrapper), slideButtonWrapper);
        });
    }

    // 创建模态框
    private createModal() {
        let buttonsWrapper = <div className="buttons-wrapper"/>;
        this.buttons.forEach(button => {
            buttonsWrapper.appendChild(<div className="btn-wrapper"><Button {...Object.assign({},button,{size:'small'})}/></div>);
        });
        this.modal = new Modal(Object.assign({
            width: '100%',
            isShow: false,
            isBackground: true,
            position: 'up',
            container: this.wrapper,
            body:buttonsWrapper
        }, this.paraModal));
        let rows = this.buttons.length / 3;
        this.modal.height = 42 * rows + 10 * 2 + 'px';  // 10*2是指上下的padding
    }

    // 初始化事件
    private initEvent = (() => {
        let toggleClickHandler = () => {
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