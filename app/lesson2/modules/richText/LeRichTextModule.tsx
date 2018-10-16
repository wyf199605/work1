/// <amd-module name="LeRichTextModule"/>

import {RichText} from "../../../global/components/form/richText/richText";
import d = G.d;
import tools = G.tools;
import {IFormComPara} from "../../../global/components/form/basic";
import {LeUploadModule} from "../upload/UploadModule";
import {LeRule} from "../../common/rule/LeRule";

export interface ILeRichTextPara extends IFormComPara{
    nameField?: string;
    field?: string;
}

export class LeRichTextModule extends RichText {
    protected upload: LeUploadModule;
    protected field: string;

    constructor(para: ILeRichTextPara) {
        super(para);
    }

    protected initCom(para: ILeRichTextPara) {
        this.field = para.field;
        this.addImgBtn(para);
    }

    protected addImgBtn(para: ILeRichTextPara) {
        let accept = {extensions: 'jpg,png'},
            container = this.para.container,
            button,
            btnWrapper = d.query('.note-toolbar.panel-headin', container);

        d.append(btnWrapper, <div class="note-btn-group btn-group note-table">
            <div class="note-btn-group">
                {button = <button type="button" class="note-btn btn btn-default btn-sm" tabindex="-1" title=""
                        data-original-title="Unordered list (CTRL+SHIFT+NUM7)">
                    <i class="note-icon-unorderedlist"></i>
                </button>}
                <div style="display: none;">
                    {this.upload = <LeUploadModule nameField={para.nameField} isAutoUpload={true}
                                                   text={'选择图片'} isMulti={true}
                                                   url={LE.CONF.ajaxUrl.fileUpload} accept={accept}
                                                   successHandler={(data) => {
                                                       this.addPictures(data);
                                                   }} isChangeText={false}/>}
                </div>
            </div>
        </div>);

        d.on(button, 'click', () => {
            this.upload.open();
        });
    }

    protected addPictures(data){
        let content = d.query('.note-editable.panel-body', this.para.container);
        let md5s = [];
        data && data.forEach((item) => {
            let res = item.data;
            md5s.push(res.data[this.field]);
        });
        md5s.forEach((md5) => {
            d.append(content, LeRichTextModule.initPicEl(LeRule.fileUrlGet(md5, this.field)));
        });
    }

    static initPicEl(url): HTMLImageElement{
        return <img src={url} alt=""/>
    }
}