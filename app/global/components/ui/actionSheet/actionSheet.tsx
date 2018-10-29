/// <amd-module name="ActionSheet"/>

import tools = G.tools;
import d = G.d;
import {Modal} from "../../feedback/modal/Modal";
import {IButton} from "../../general/button/Button";

interface IActionSheetButton extends IButton{
    content: string;        // 内容（必须）
    icon?: string;           // 图标
    onClick: EventListener; // 点击事件（必须）
}

interface ActionSheetPara{
    buttons?: IActionSheetButton[]; // 是否有按钮组
}

export class ActionSheet extends Modal{

    private cancelWrapper: HTMLElement;
    private buttonsWrapper: HTMLElement;

    constructor(para: ActionSheetPara){
        super(Object.assign({
            width: '100%',
            height: '319px',
            position: 'down',
            isBackground: true,
        }, para));
        this.hasButtons = !!tools.isNotEmptyArray(para.buttons);
        this.setDefaultStyle(para);
    }

    // 设置actionSheet的默认样式
    private setDefaultStyle(para){
        this.body = <div className="action-sheet-wrapper"/>;

        // 要给Modal.wrapper的的top属性设置important才能从下方弹出
        this.wrapper.style.setProperty('top', 'auto', 'important');

        let bodyHeight = 88;
        if(this.hasButtons){
            this.buttonsWrapper = <div className="action-sheet-buttons"/>;
            d.append(this.body, this.buttonsWrapper);

            // 将各个按钮添加到action-sheet-buttons中
            para.buttons.forEach((item, index) => {
                // 必须有的参数
                if('content' in item && 'onClick' in item){
                    let btnWrapper = <div className="btn-wrapper">
                            <i className={item.icon || 'appcommon app-morenicon'}></i>
                            <p class="btn-content">{item.content}</p>
                        </div>;
                    d.append(this.buttonsWrapper, btnWrapper);

                    d.on(btnWrapper, 'click', item.onClick);
                }
            });

            bodyHeight += 230;
        }
        this.cancelWrapper = <div className="action-sheet-cancel">
            <div class="cancel-wrapper">取消</div>
        </div>;
        d.append(this.body, this.cancelWrapper);
        d.on(this.cancelWrapper, 'click', () => {
            this.destroy();
        });

        this.body['style'].height = `${bodyHeight}px`;
        this.wrapper.style.height = `${bodyHeight}px`;
    }

    private _hasButtons = true;
    get hasButtons(){
        return this._hasButtons;
    }
    set hasButtons(val){
        this._hasButtons = val;
    }

    destroy(){
        super.destroy();
    }
}