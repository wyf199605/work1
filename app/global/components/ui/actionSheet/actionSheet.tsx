/// <amd-module name="ActionSheet"/>

import tools = G.tools;
import d = G.d;
import {Modal} from "../../feedback/modal/Modal";

interface IActionSheetButton{
    content: string;        // 内容（必须）
    icon: string;           // 图标（必须），例：zhiwen / weixin
    iconColor?: string;      // 图标的颜色（默认#666666）
    bg?: string;            // 图标的背景颜色（默认#ffffff）
    onClick: EventListener; // 点击事件（必须）
}

interface ActionSheetPara{
    hasCancel?: boolean;    // 是否有取消按钮
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
        this.hasCancel = tools.isNotEmpty(para.hasCancel);
        this.setDefaultStyle(para);
    }

    // 设置actionSheet的默认样式
    private setDefaultStyle(para){
        this.body = <div className="action-sheet-wrapper"/>;

        // 要给Modal.wrapper的的top属性设置important才能从下方弹出
        this.wrapper.style.setProperty('top', 'auto', 'important');

        let bodyHeight = 0;
        if(this.hasButtons){
            this.buttonsWrapper = <div className="action-sheet-buttons"/>;
            d.append(this.body, this.buttonsWrapper);

            // 将各个按钮添加到action-sheet-buttons中
            para.buttons.forEach((item, index) => {
                // 必须有的参数
                if('content' in item && 'onClick' in item && 'icon' in item){
                    let btnWrapper = <div className="btn-wrapper">
                        <a href="#" className={`${item.icon}`}><i className={`iconfont icon-${item.icon}`}></i></a>
                        <p class="btn-content">{item.content}</p>
                    </div>;
                    d.append(this.buttonsWrapper, btnWrapper);

                    'bg' in item && (
                        d.query('.iconfont', btnWrapper).style.backgroundColor = item.bg
                    );
                    'iconColor' in item && (
                        d.query('.iconfont', btnWrapper).style.color = item.iconColor
                    );

                    d.on(btnWrapper, 'click', item.onClick);
                }
            });

            bodyHeight += 230;
            this.buttonsWrapper.style.bottom = '0px';
        }
        if(this.hasCancel){
            this.cancelWrapper = <div className="action-sheet-cancel">
                <div class="cancel-wrapper">取消</div>
            </div>;
            d.append(this.body, this.cancelWrapper);
            d.on(this.cancelWrapper, 'click', () => {
                this.destroy();
            });

            bodyHeight += 88;
            this.hasButtons && (this.buttonsWrapper.style.bottom = '88px');
        }
        this.body['style'].height = `${bodyHeight}px`;
        this.wrapper.style.height = `${bodyHeight}px`;
    }

    private _hasCancel = true;
    get hasCancel(){
        return this._hasCancel;
    }
    set hasCancel(val){
        this._hasCancel = val;
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