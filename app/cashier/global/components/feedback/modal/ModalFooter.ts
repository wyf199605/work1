/// <amd-module name="ModalFooter"/>
import d = C.d;
import tools = C.tools;
import {Component, IComponent} from "../../Component";
import {InputBox} from "../../general/inputBox/InputBox";
import {Button} from "../../general/button/Button";

export interface IModalFooterPara extends IComponent{
    leftPanel ?: InputBox | HTMLElement //存放组件对象集合| 指定dom元素
    rightPanel?: InputBox | HTMLElement //未传参则生成取消|确定两个按钮 ，否则按传入生成
}

/**
 * 模态框尾部
 */
export class ModalFooter extends Component implements IModalFooterPara {

    protected wrapperInit(): HTMLElement {
        return d.create(`<div class="modal-footer"></div>`);
    }
    init(modalFooter?: IModalFooterPara) {
        this.leftPanel = (modalFooter && modalFooter.leftPanel)? modalFooter.leftPanel : void 0;
        this.rightPanel = (modalFooter && modalFooter.rightPanel)? modalFooter.rightPanel : void 0;
    }

    /**
     * 左组件集合
     * 传参：传参：无 | InputBox 组件集合 | HTMLElement: dom元素
     */
    private _leftPanel?:  InputBox | HTMLElement ;
    set leftPanel(leftPanel:  InputBox | HTMLElement ) {
        if (tools.isEmpty(leftPanel)) {
            return;
        }
        let leftComsWrapper = d.query('.left-plane', this.wrapper);
        if (!leftComsWrapper) {
            leftComsWrapper = d.create(`<div class="left-plane" style="display: inline-block;"></div>`);
            this.wrapper.appendChild(leftComsWrapper);
            console.log(this.wrapper);

        } else {
            d.remove(leftComsWrapper);
            leftComsWrapper = d.create(`<div class="left-plane" style="display: inline-block;"></div>`);
            this.wrapper.appendChild(leftComsWrapper);
        }
        if (leftPanel instanceof InputBox) {
            (<InputBox>leftPanel).container = leftComsWrapper;
            (<InputBox>leftPanel).compactWidth = 8;
        } else {
            leftComsWrapper.appendChild(<HTMLElement> leftPanel);
        }
    }

    get leftPanel() {
        return this._leftPanel;
    }

    /**
     * 右组件集合
     * 传参：无:默认创建取消、确定按钮 | InputBox 组件集合 | HTMLElement: dom元素
     */
    private _rightPanel?:  InputBox | HTMLElement ;
    set rightPanel(rightPanel:  InputBox | HTMLElement ) {
        let rightPanelWrapper = d.query('.right-plane',this.wrapper);
        if (!rightPanelWrapper) {
            rightPanelWrapper = d.create(`<div class="right-plane" style="display: inline-block;float: right;"></div>`);
            this.wrapper.appendChild(rightPanelWrapper);
        } else {
            d.remove(rightPanelWrapper);
            rightPanelWrapper = d.create(`<div class="right-plane" style="display: inline-block;float: right;"></div>`);
            this.wrapper.appendChild(rightPanelWrapper);
        }

        if (tools.isEmpty(rightPanel)) {
            rightPanel = new InputBox({
                compactWidth:8
            });
            let cancelBtn = new Button({content: '取消', type: 'default',key:'cancelBtn'}),
                okBtn = new Button({content: '确认',  type: 'primary',key:'okBtn'});
            (<InputBox>rightPanel).addItem(cancelBtn);
            (<InputBox>rightPanel).addItem(okBtn);
            (<InputBox>rightPanel).container = rightPanelWrapper;
        }
        else if (rightPanel instanceof InputBox) {
            (<InputBox>rightPanel).container = rightPanelWrapper;
            (<InputBox>rightPanel).compactWidth = 8;
        } else {
            rightPanelWrapper.appendChild(<HTMLElement> rightPanel);
        }
        this._rightPanel = rightPanel;
    }

    get rightPanel() {
        return this._rightPanel;
    }

    constructor(private modalFooter?: IModalFooterPara) {
        super(modalFooter);
        if (tools.isEmpty(modalFooter))
            modalFooter = {};
        this.init(modalFooter);
    }
}