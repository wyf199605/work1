/// <amd-module name="LeBasicPage"/>
import SPAPage = G.SPAPage;
import {Modal} from "../../global/components/feedback/modal/Modal";
import SPA = G.SPA;
import {LeBasicPageHeader} from "./LeBasicPageHeader";
import d = G.d;

export abstract class LeBasicPage extends SPAPage{
    protected isModal: boolean;
    protected modal: Modal;
    protected abstract init(para: obj, data?);
    protected header: LeBasicPageHeader;
    // private _titleEl : HTMLElement;
    set title(t: string) {
        if(this.header){
            this.header.title = t;
        }else if(this.modal) {
            this.modal.modalHeader.title = t;
        }
    }

    get title() {
        if(this.header){
            return this.header.title;
        }else if(this.modal) {
            return this.modal.modalHeader.title;
        }
        return '';
    }

    private _bodyEl : HTMLElement;
    // set body(html : HTMLElement){
    //     this._bodyEl.innerHTML = null;
    //     this._bodyEl.appendChild(html);
    // }
    get body(){
        return this._bodyEl;
    }
    protected _buttonGroupEl : HTMLElement;
    get buttonGroupEl(){
        return this.header ? this.header.buttonGroupEl : this._buttonGroupEl;
    }

    protected modalParaGet(){
        return {};
    }

    protected basicPageEl : HTMLElement;
    protected wrapperInit() {
        let para: obj = this.para;
        this.isModal = !!para.inModal;
        if(this.isModal){
            this.modal = <Modal
                className="le-page-modal"
                header="页面"
                isBackground={false}
                isOnceDestroy
                onClose={() => {
                    SPA.close();
                }} {...this.modalParaGet()}/>;
            this._bodyEl = this.modal.bodyWrapper;
        } else {
            this.basicPageEl = <div className="basic-page">
                {this.header = para.inTab ? null : <LeBasicPageHeader/>}
                {this._buttonGroupEl = para.inTab ? <div className="basic-page-btns"/> : null}
                {this._bodyEl = <div className="basic-page-body">{this.bodyInit()}</div>}
            </div>;
            return this.basicPageEl;
        }
    }

    protected bodyInit(): HTMLElement{
        return null;
    }

    protected destroy() {
        super.destroy();
        if (this.basicPageEl) {
            d.remove(this.basicPageEl);
            this.basicPageEl = null;
        }
        if (this.modal) {
            this.modal.destroy();
            this.modal = null;
        }
    }
}
