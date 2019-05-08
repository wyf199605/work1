/// <amd-module name="RichTextModal"/>
import {RichText} from "../richText/richText";
import {Modal} from "../../feedback/modal/Modal";

import {TextInput, ITextInputBasicPara, ITextInputPara} from "../text/text";
import tools = G.tools;
import {IFormComPara} from "../basic";
import {RichTextMb} from "../richText/richTextMb";
import d = G.d;

interface RichTextModalPara extends ITextInputBasicPara, IFormComPara{
    onClose?: (value: string) => void
}

export class RichTextModal extends TextInput{
    onSet: (val) => void;
    protected richText : RichText | RichTextMb;
    protected modal : Modal;

    constructor(para: RichTextModalPara){
        super(Object.assign({}, para, {
            readonly : true,
            // icons : ['iconfont icon-arrow-down'],
            // iconHandle: () => {
            // }
        }) as ITextInputPara);
        d.on(this.input, 'click', () => {
            if(!this.modal){
                this.initRichText();
            }
            this.modal.isShow = true;
            this.richText && this.richText.set(this._value);
        });

        this.onClose = para.onClose;
        this.initRichText();
        this.modal.isShow = false;
    }

    protected initRichText(){
        let body = <div className="rich-text-modal-body"/>;
        this.modal = new Modal({
            container: document.body,
            header: '编辑',
            body,
            isAdaptiveCenter: true,
            className: 'rich-text-modal',
            width: '750px',
            height: '425px',
            isShow: true,
            onClose: () => {
                // this.modal = null;
            },
            footer: {},
            onOk: () => {
                this.input.value = tools.str.removeHtmlTags(this.richText.get());
                this._value = this.richText.get();
                typeof this.onSet === 'function' && this.onSet(this.get());
                this.modal && (this.modal.isShow = false);
            }
        });

        this.richText = new (tools.isMb ? RichTextMb : RichText)({container: body});
        this.richText.set(this._value);
    }

    protected _onClose: (value) => void;
    get onClose(){
        return this._onClose;
    }
    set onClose(onClose: (value) => void){
        this._onClose = onClose;
    }

    protected _value: string = '';
    get(){
        return this.richText.get();
    }
    set (str:string){
        this._value = str;
        this.input.value = tools.str.removeHtmlTags(str);
        this.richText.set(str);
    }

    destroy(){
        this.modal && this.modal.destroy();
        this.modal = null;
        this.richText.destroy();
        super.destroy();
    }
}