/// <amd-module name="ReportUploadModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import d = G.d;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {LeUploadModule} from "../../../../modules/upload/UploadModule";
import {LeRule} from "../../../../common/rule/LeRule";

interface IReportUploadModulePara extends IComponentPara {
    title?: string;
    isRequired?: boolean;
    buttonClassName?: string;
    remark?: string;
    remarkClassName?: string;
    content?: string;
    isShowImg?: boolean;
    preTitle?: string;
    isExcel?: boolean;
    nameField?: string;
    field?: string;
}

export class ReportUploadModule extends Component {
    private fileNameMd5: string;
    private isShowImg: boolean;
    private isRequired: boolean;
    private field: string;

    protected wrapperInit(para: IReportUploadModulePara): HTMLElement {
        let img: HTMLElement = null,
            placehold: HTMLElement = null;
        this.isShowImg = para.isShowImg;
        this.field = para.field;
        let accept = para.isExcel === true ? {extensions: 'ppt,jpg,doc,docx,png,zip,rar,pdf'} : {extensions: 'jpg,png'};
        let uploadWrapper = <div className="row addRow upload">
            <div className="lesson-form-group">
                {tools.isEmpty(para.title) ? null : <div className="lesson-label">
                    <span>{para.isRequired === true ? '*' : ''}</span>&nbsp;{para.title + ' :'}
                </div>}
                <LeUploadModule nameField={para.nameField} isAutoUpload={true} isExcel={para.isExcel} accept={accept}
                                isChangeText={false} c-var="uploader" successHandler={(data) => {
                    let res = data[0].data,
                        file = data[0].file;
                    if (para.isShowImg === true) {
                        img.classList.remove('hide');
                        placehold.classList.add('hide');
                        img.setAttribute('src', LeRule.fileUrlGet(res.data[para.field], para.field));
                    } else {
                        this.innerEl.fileName.classList.remove('hide');
                        this.innerEl.fileName.innerText = file.name;
                    }
                    this.fileNameMd5 = res.data[para.field];
                }} url={LE.CONF.ajaxUrl.fileUpload} text={para.content}
                                className={tools.isNotEmpty(para.buttonClassName) ? para.buttonClassName : "select-file-btn"}/>
                <div c-var="fileName" className="hide" style={{
                    color: '#0099ff',
                    marginRight:'12px'
                }}/>
                <div className={para.remarkClassName}>{para.remark}</div>
            </div>
            <div className={'lesson-form-group ' + (para.isShowImg ? '' : 'hide')} c-var="showImg">
                <div className="lesson-label"/>
                {placehold = <div c-var="placehold" className="placeholder-img">第二课堂</div>}
                {img = <img c-var="img" className="coverImg hide" alt="封面图"/>}
            </div>
        </div>;
        return uploadWrapper;
    }

    constructor(para: IReportUploadModulePara) {
        super(para);
        this.isRequired = para.isRequired;
        this.initEvents.on();
    }

    private initEvents = (() => {
        let clickImgHandler = (e) => {
            let img = e.target as HTMLMediaElement,
                src = img.src;
            if (tools.isNotEmpty(src)) {
                let body = <div style="height: 100%; width: 100%; text-align: center;"/>;
                new Modal({
                    header: {
                        title: '查看大图'
                    },
                    width: '800px',
                    height: '600px',
                    body: body,
                    isOnceDestroy: true
                });

                d.append(body, <img style="max-height: 100%; width: auto;" src={src} alt=""/>)
            }
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.upload img.coverImg', clickImgHandler);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.upload img.coverImg', clickImgHandler);
            }
        }
    })();

    set(md5Str) {
        if (this.isShowImg === true) {
            let img = this.innerEl.img as HTMLMediaElement,
                placehold = this.innerEl.placehold;
            img.classList.remove('hide');
            placehold.classList.add('hide');
            img.setAttribute('src', LeRule.fileUrlGet(md5Str, this.field));
        } else {
            this.innerEl.fileName.classList.remove('hide');
            this.innerEl.fileName.innerText = tools.isNotEmpty(md5Str) ? '已上传' : '';
        }
        this.fileNameMd5 = tools.isNotEmpty(md5Str) ? md5Str : '';
    }

    get() {
        let md5 = tools.isNotEmpty(this.fileNameMd5) ? this.fileNameMd5 : '';
        if (this.isRequired === true) {
            if (tools.isEmpty(md5)) {
                return false;
            }
        }
        return md5;
    }

    set disabled(dis: boolean) {
        if(tools.isEmpty(dis)){
            return;
        }
        this._disabled = dis;
        (this.innerCom.uploader as LeUploadModule).disabled = dis;
        this.innerEl.showImg.classList.toggle('disabled',dis);
    }

    get disabled() {
        return this._disabled;
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}