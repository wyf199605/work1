/// <amd-module name="ActionSheet"/>

import tools = G.tools;
import d = G.d;
import {Modal, IModal} from "../../feedback/modal/Modal";
import {IButton} from "../../general/button/Button";

export interface IActionSheetButton extends IButton {
    content: string;        // 内容（必须）
    icon?: string;           // 图标
    onClick: () => void; // 点击事件（必须）
}

interface IActionSheet extends IModal{
    buttons?: IActionSheetButton[]; // 是否有按钮组
}

export class ActionSheet extends Modal {
    private actionSheetWrapper: HTMLElement;
    private buttons: IActionSheetButton[] = [];

    constructor(para: IActionSheet) {
        super(Object.assign({
            width: '100%',
            position: 'down',
            // isBackground: true,
            isShow: false
        }, para));
        // 要给Modal.wrapper的的top属性设置important才能从下方弹出
        this.buttons = para.buttons;
        this.wrapper.style.setProperty('top', 'auto', 'important');
        this.createActionSheet(para);
        this.initEvents.on();
    }

    // 设置actionSheet的默认样式
    private createActionSheet(para: IActionSheet) {
        this.actionSheetWrapper = <div className="action-sheet-wrapper"/>;

        if (tools.isNotEmptyArray(para.buttons)) {
            let buttonsWrapper = <div className="action-sheet-buttons"/>;
            d.append(this.actionSheetWrapper, buttonsWrapper);
            if (para.buttons.length > 9) {
                // 如果按钮大于9个 则单行滑动显示
                buttonsWrapper.classList.add('single-line');
            }
            // 将各个按钮添加到action-sheet-buttons中
            para.buttons.forEach((item, index) => {
                let btnWrapper = <div className="btn-wrapper" data-index={index}>
                    <i className={item.icon || 'appcommon app-morenicon'}/>
                    <div class="btn-content">{item.content || ''}</div>
                </div>;
                d.append(buttonsWrapper, btnWrapper);
            });
        }
        d.append(this.actionSheetWrapper, <div className="action-sheet-cancel">取消</div>);
        this.bodyWrapper.appendChild(this.actionSheetWrapper);
        this.wrapper.style.height = window.getComputedStyle(this.actionSheetWrapper).height;
    }
    private initEvents = (() => {
        let buttonClick = (e) => {
            let index = parseInt(d.closest(e.target, '.btn-wrapper').dataset.index),
                onClick = this.buttons[index].onClick;
            if (onClick && typeof onClick === 'function') {
                onClick();
            }
        };
        let cancel = () => {
            this.isShow = false;
        };
        return {
            on: () => {
                d.on(this.actionSheetWrapper, 'click', '.btn-wrapper', buttonClick);
                d.on(this.actionSheetWrapper, 'click', '.action-sheet-cancel', cancel);
            },
            off: () => {
                d.off(this.actionSheetWrapper, 'click', '.btn-wrapper', buttonClick);
                d.off(this.actionSheetWrapper, 'click', '.action-sheet-cancel', cancel);
            }
        }
    })();

    destroy() {
        this.actionSheetWrapper = null;
        this.initEvents.off();
        super.destroy();
    }
}