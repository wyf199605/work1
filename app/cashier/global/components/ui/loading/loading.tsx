/// <amd-module name="Loading"/>
import d = C.d;
import tools = C.tools;
import {Modal} from 'global/components/feedback/modal/Modal';

export interface ILoadingPara {
    msg?: string;
    disableEl?: HTMLElement;
    duration?: number;  //延时关闭，默认3s
    container?: HTMLElement;
}

export class Loading {
    private modal: Modal = null;
    constructor(private para?: ILoadingPara) {
        para.msg = para.msg ? para.msg : '加载中...';
        let body = document.body;
        let container = tools.isEmpty(para.container) ? body : para.container;
        this.modal = new Modal({
            container,
            width: '158px',
            height:'120px',
            body: <div><div className="spinner"></div><div>{para.msg}</div></div>,
            className: 'modal-loading',
            isBackground: false
        });
        this.delayHied();
        if(container !== body){
            this.modal.className = 'container-loading';
            let offset: ClientRect = para.container.getBoundingClientRect();
            let wrapper = this.modal.wrapper;
            wrapper.style.position = 'absolute';
            wrapper.style.left = (offset.width - 158) / 2 + 'px';
            wrapper.style.top = Math.max(0, (offset.height - 120) / 2) + 'px';
        }
        //禁用元素
        if (this.para.disableEl) {
            this.para.disableEl.classList.add('disabled');
        }
    }

    /**
     * 显示加载框
     * */
    public show() {
        this.modal.isShow = true;
        this.delayHied();
    }

    /**
     * 销毁加载框
     * */
    public destroy() {
        if (this.para && this.para.disableEl) {
            this.para.disableEl.classList.remove('disabled');
        }
        this.modal && this.modal.destroy();
        this.para = null;
        this.modal = null;
    }

    /**
     * 延迟隐藏，默认3秒后销毁
     * */
    private delayHied() {
        let duration = tools.isEmpty(this.para.duration) ? 30 : this.para.duration;
        setTimeout(() => {
            if(this.modal && this.modal.wrapper) {
                this.hide();
            }
        }, duration * 1000);
    }
    /*
     * 隐藏加载框
     * */
    public hide() {
        if(this.modal.wrapper) {
            this.modal.isShow = false;
        }
    }
}
