/// <amd-module name="PopBtnBox"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import d = G.d;

interface IPopBtnItemPara {
    content: string;        // 内容（必须）
    onClick: () => void; // 点击事件（必须）
}

interface IPopBtnBoxPara extends IComponentPara {
    buttons: IPopBtnItemPara[]; // 按钮数组
}

export class PopBtnBox extends Component {
    protected wrapperInit(para: IPopBtnBoxPara): HTMLElement {
        return <div className="pop-btn-box" data-guid={tools.getGuid('pop-box')}>
            <div className="pop-more-btn"><i className="appcommon app-gengduo"/>更多</div>
        </div>;
    }

    constructor(para: IPopBtnBoxPara) {
        super(para);
        this.initPopBtns(para.buttons);
        this.initEvent.on();

    }

    private popBtnsWrapper: HTMLElement;
    private buttons: IPopBtnItemPara[] = [];

    private initPopBtns(buttons: IPopBtnItemPara[]) {
        let popWrapper = <div className="pop-btns-wrapper hide"/>,
            buttonHtml = [];
        buttons.forEach((btn, index) => {
            buttonHtml.push(`
            <div class="pop-btn-item" data-index="${index}">${btn.content}</div>
            `)
        });
        this.buttons = buttons;
        popWrapper.innerHTML = buttonHtml.join();
        this.popBtnsWrapper = popWrapper;
        this.wrapper.appendChild(popWrapper);
        this.popBtnsWrapper.style.height = buttons.length * 32 + 'px';
    }

    private _show: boolean;
    set show(show: boolean) {
        this._show = show;
        if (this.wrapper.offsetWidth > 5){
            this.popBtnsWrapper.style.left = '-5px';
        }else{
            this.popBtnsWrapper.style.left = 5 - this.wrapper.offsetWidth + 'px';
        }
        this.popBtnsWrapper.classList.toggle('hide', !show);
    }

    get show() {
        return this._show;
    }

    private initEvent = (() => {
        let clickMore = () => {
            this.show = !this.show;
        };
        let clickBtn = (e) => {
            let index = parseInt(d.closest(e.target,'.pop-btn-item').dataset.index),
                fun = this.buttons[index].onClick;
            tools.isFunction(fun) && fun();
            this.show = false;
        };
        let hideClick = (e)=>{
            let guid = this.wrapper.dataset.guid;
            let el = d.closest(e.target,`.pop-btn-box[data-guid="${guid}"]`);
            if (tools.isEmpty(el)){
                this.show = false;
            }
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.pop-more-btn', clickMore);
                d.on(this.wrapper, 'click', '.pop-btn-item', clickBtn);
                d.on(document.body,'click',hideClick);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.pop-more-btn', clickMore);
                d.off(this.wrapper, 'click', '.pop-btn-item', clickBtn);
                d.off(document.body,'click',hideClick);
            }
        }
    })();

    destroy() {
        this.popBtnsWrapper = null;
        this.initEvent.off();
        super.destroy();
    }
}