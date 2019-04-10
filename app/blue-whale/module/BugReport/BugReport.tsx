/// <amd-module name="BugReport"/>
import IComponentPara = G.IComponentPara; import Component = G.Component;
import {TextAreaInput, TextInput1} from "../../../global/components/form/text/TextInput";
import d = G.d;
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Button} from "../../../global/components/general/button/Button";
import UploadModule from "../uploadModule/uploadModule";
import CONF = BW.CONF;
import {BwRule} from "../../common/rule/BwRule";
import sys = BW.sys;
import {BwUploader} from "../uploadModule/bwUploader";

type addType = 'img' | 'video';

interface PageInfo {
    url: string;
    param: string;
    reqType: string;
    errMsg: string;
}

export class BugReportModal extends Modal {
    constructor(id?: number, isRefresh?: boolean, pageInfo?: PageInfo) {
        let bugReport = new BugReport({
            success: () => {
                this.destroy();
                isRefresh && sys.window.load(location.href);
            },
            bugId: id,
            pageInfo: pageInfo
        });
        super({
            header: {
                title: '故障申报'
            },
            body: bugReport.wrapper,
            isShow: true,
            width: '730px',
            className: 'bug-report',
            position: 'full'
        });
    }
}

interface IBugReportPara extends IComponentPara {
    success?: () => void;
    bugId?: number;
    pageInfo: obj;
}

export class BugReport extends Component {
    private formEle: obj;
    private success: () => void;
    private _isUpload: boolean;
    private pageInfo: obj;

    set isUpload(up) {
        this._isUpload = up;
    }

    get isUpload() {
        return this._isUpload;
    }

    protected wrapperInit(): HTMLElement {
        let form = <form className="bug-report-form">
            <div className="form-group">
                <div className="form-text" data-name="title">
                </div>
                <div className="form-textarea" data-name="detail"/>
                <div className="form-img" data-name="uploader">
                    <div className="uploader-wrapper"/>
                </div>
                <div className="msg">温馨提示: 最多可上传5张图片和1个短视频</div>
            </div>
            <div className="submit" data-name="submit"/>
        </form>;

        this.formEle = {
            title: null,
            detail: null,
            upload: null,
            submit: null
        };
        d.queryAll('[data-name]', form).forEach(el => {
            let name = el.dataset.name;
            switch (name) {

                case 'title':
                    let titleModule = new TextInput1({
                        placeholder: '添加标题',
                        type: 'text',
                        labelWidth: 0,
                        container: el,
                    });
                    el.appendChild(<span className="title-num">30</span>);
                    this.formEle['title'] = titleModule;
                    let previousValue = '';
                    d.on(titleModule.wrapper, 'input', 'input', function (e) {
                        let input = e.target as HTMLFormElement,
                            strLen = tools.str.utf8Len(input.value);
                        if (strLen > 60) {
                            input.value = previousValue;
                            Modal.toast('最多可输入30个字');
                        } else {
                            previousValue = input.value;
                            let len = Math.floor((60 - strLen) / 2);
                            d.query('.title-num', el).innerHTML = len < 0 ? '0' : len.toString();
                        }
                    });
                    break;

                case 'detail':
                    this.formEle['detail'] = new TextAreaInput({
                        className: 'report-textarea',
                        container: el,
                        placeholder: '请描述具体故障问题'
                    });
                    break;
                case 'uploader':
                    let addImg = <div className="addImage">
                            <div className="upload"/>
                        </div>,
                        elWrap = d.query('.uploader-wrapper', el);
                    let type = '',
                        videoName = '';
                    this.formEle['upload'] = addImg;
                    elWrap.appendChild(addImg);
                    let uploader = new BwUploader({
                        uploadUrl: CONF.ajaxUrl.fileUpload,
                        nameField: 'BUG_PICTURE',
                        // 上传成功
                        onSuccess: (res, file: CustomFile) => {
                            let fileId = res.data.unique;
                            if (type === 'img') {
                                let name = file.name;
                                let pics = this.bugReportItem.picture;
                                for (let i = 0, len = pics.length; i < len; i++) {
                                    let pic = pics[i];
                                    if (tools.isEmpty(pic.fileId) && pic.fileName === name) {
                                        pic.fileId = fileId;
                                        break;
                                    }
                                }
                            } else {
                                this.bugReportItem.video[0]['fileId'] = fileId;
                            }
                        },
                        container: d.query('.upload', addImg),
                        text: '+'
                    });
                    uploader.on(BwUploader.EVT_UPLOAD_ERROR, (file: CustomFile) => {
                        if (type === 'img') {
                            let name = file.name;
                            let pics = this.bugReportItem.picture;
                            for (let i = 0, len = pics.length; i < len; i++) {
                                let pic = pics[i];
                                if (pic.fileName === name && tools.isEmpty(pic.fileId)) {
                                    let imgWrapper = d.query(`.upload-img[data-index="${i}"]`, this.wrapper);
                                    this.addErrorMark(imgWrapper);
                                    pics.splice(i, 1);
                                    break;
                                }
                            }
                        } else {
                            this.bugReportItem.video = [];
                            let img = d.query('.upload-img[data-type=video]', this.wrapper);
                            this.addErrorMark(img, false);
                            videoName = '';
                        }
                    });
                    // 上传失败
                    // uploader.com.on('uploadError', (file) => {
                    //
                    // });
                    // 所有文件上传完成时调用
                    uploader.on(BwUploader.EVT_UPLOAD_SUCCESS, () => {
                        this.isUpload = true;
                    });
                    // 文件加入上传队列
                    uploader.on(BwUploader.EVT_FILE_JOIN_QUEUE, (files: CustomFile[]) => {
                        let file = files[0];
                        if (file && file.type.split('/')[0] === 'image') {
                            if (this.bugReportItem.picture.length <= 4) {
                                let pics = this.bugReportItem.picture;
                                let name = file.name;
                                for (let i = 0, len = pics.length; i < len; i++) {
                                    let pic = pics[i];
                                    if (pic.fileName === name) {
                                        Modal.alert('已经添加过该图片');
                                        return false;
                                    }
                                }
                                this.isUpload = false;
                                let obj = {
                                    fileId: '',
                                    fileName: name
                                };
                                this.bugReportItem.picture.push(obj);
                                let url = window.URL.createObjectURL(file.blob);
                                d.before(addImg, this.addImg(url, 'img'));
                                d.query('.form-img', this.wrapper).scrollLeft = d.query('.form-img', this.wrapper).scrollLeft + 100;
                                type = 'img';
                                uploader.upload();
                            } else {
                                Modal.alert('最多可添加5张图片和1个视频');
                                return false;
                            }
                        } else if (file.type.split('/')[0] === 'video') {
                            if (tools.isNotEmpty(videoName)) {
                                if (file.name === videoName) {
                                    Modal.alert('已经添加过该视频了');
                                    return false;
                                }
                                Modal.alert('最多可添加一个视频');
                                return false;
                            }
                            this.isUpload = false;
                            let obj = {
                                fileId: '',
                                fileName: file.name
                            };
                            this.bugReportItem.video.push(obj);
                            videoName = file.name;
                            let url = window.URL.createObjectURL(file.blob);
                            d.before(addImg, this.addImg(url, 'video'));
                            type = 'video';
                            uploader.upload();
                        }
                    });
                    break;
                case 'speak':
                    new Button({
                        content: '按住说话',
                        icon: 'app-maikefeng',
                        iconPre: 'appcommon',
                        container: el,
                        onClick: () => {

                        },
                        className: 'speak-btn'
                    });
                    new Button({
                        content: '录制视频',
                        icon: 'app-shipin',
                        iconPre: 'appcommon',
                        container: el,
                        onClick: () => {

                        }
                    });
                    break;
                case 'submit':
                    this.formEle['submit'] = new Button({
                        content: '提交',
                        container: el,
                        className: 'submit-btn',
                        onClick: () => {
                            let info = this.bugReportItem.info,
                                formEle = this.formEle;
                            info.title = formEle['title'].value;
                            info.message = formEle['detail'].value;
                            let pageInfo = this.pageInfo;
                            if (tools.isNotEmpty(pageInfo)) {
                                info.url = pageInfo.url;
                                info.param = pageInfo.param;
                                info.reqType = pageInfo.reqType;
                                info.errMsg = pageInfo.errMsg;
                            }
                            if (tools.isNotEmpty(info.title)) {
                                if (this.isUpload) {
                                    if (tools.isNotEmpty(this.bugData)) {
                                        let para = tools.obj.merge(this.bugReportItem);
                                        para.info['bugId'] = this.bugData.info.bugId;
                                        BwRule.Ajax.fetch(CONF.ajaxUrl.bugReport, {
                                            type: 'POST',
                                            data: para
                                        }).then(({response}) => {
                                            response.errorCode === 0 && Modal.toast('修改成功');
                                            this.success();
                                        })
                                    } else {
                                        BwRule.Ajax.fetch(CONF.ajaxUrl.bugReport, {
                                            type: 'POST',
                                            data: this.bugReportItem
                                        }).then(({response}) => {
                                            response.errorCode === 0 && Modal.toast('提交故障成功');
                                            this.success();
                                        })
                                    }
                                } else {
                                    Modal.alert('图片或视频正在上传，请稍候...');
                                }
                            } else {
                                Modal.alert('标题不能为空!');
                            }
                        }
                    });
                    break;
                default:
                    break;
            }
        });

        return form;
    }

    constructor(para: IBugReportPara) {
        super();
        this.success = para.success;
        this.isUpload = true;
        let bugId = tools.isEmpty(para.bugId) ? -1 : para.bugId;
        this.pageInfo = para.pageInfo;
        bugId >= 0 && BwRule.Ajax.fetch(CONF.ajaxUrl.bugDetail + '?bugid=' + bugId)
            .then(({response}) => {
                response.errorCode === 0 && (this.bugData = response.data);
            });
        this.closeImgEvent.on();
        this.playVideoEvent.on();
    }

    private setDataIndex() {
        let imgs = d.queryAll('.upload-img[data-type="img"]', this.wrapper);
        imgs = imgs.filter((img) => {
            return img.dataset.index !== '-1';
        });
        if (tools.isNotEmpty(imgs)) {
            imgs.forEach((img, index) => {
                img.dataset.index = index.toString();
            })
        }
    }

    private _bugData: obj;

    set bugData(bugData: obj) {
        this._bugData = bugData;
        // 设置数据
        let bugItem = this.bugReportItem;
        bugItem.info.title = bugData.info.title;
        bugItem.info.message = bugData.info.message;
        bugItem.picture = bugData.picture;
        bugItem.video = bugData.video;
        bugItem.voice = bugData.voice;

        // 设置界面
        this.formEle['title'].value = bugData.info.title;
        this.formEle['detail'].value = bugData.info.message;
        let strLen = tools.str.utf8Len(bugData.info.title);
        let len = Math.floor((60 - strLen) / 2);
        d.query('.title-num', this.wrapper).innerHTML = len < 0 ? '0' : len.toString();

        let imgs: obj[] = bugData.picture,
            addImg = this.formEle['upload'];
        tools.isNotEmpty(imgs) && imgs.forEach((img) => {
            let url = this.getFileUrl(img.fileId);
            d.before(addImg, this.addImg(url, 'img'));
        });
        let videos: obj[] = bugData.video;
        tools.isNotEmpty(videos) && videos.forEach((vi) => {
            let url = this.getFileUrl(vi.fileId);
            d.before(addImg, this.addImg(url, 'video'));
        });
    }

    get bugData() {
        return this._bugData;
    }

    private addImg(url: string, type: addType) {
        let imgs = d.queryAll('.upload-img', this.wrapper);
        imgs.length > 0 && (imgs = imgs.filter((img) => {
            return img.dataset.index !== '-1';
        }));
        let len = imgs.length;
        let imgWrapper: HTMLElement = null;
        if (type === 'img') {
            imgWrapper = <div className="upload-img" data-index={len} data-type="img">
                <img src={url} alt="故障截图"/>
                <div className="close-ball">×</div>
            </div>;
        } else {
            imgWrapper = <div className="upload-img" data-index="0" data-type="video">
                <video src={url}></video>
                <i className="appcommon app-shipin"/>
                <div className="close-ball">×</div>
            </div>;
        }
        return imgWrapper;
    }

    private addErrorMark(imgWrapper: HTMLElement, isImg = true) {
        if (isImg) {
            imgWrapper.dataset.index = '-1'
        } else {
            imgWrapper.dataset.type = 'video-error';
        }
        imgWrapper.appendChild(<div className="bug-error"><i className="appcommon app-shibai"/><br/>传输失败</div>);
        isImg && this.setDataIndex();
    }

    private _bugReportItem: obj;
    get bugReportItem() {
        if (!this._bugReportItem) {
            let deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            this._bugReportItem = {
                info: {
                    title: '',
                    uuid: deviceInfo && deviceInfo.uuid,
                    message: '',
                    url: '',
                    param: '',
                    reqType: '',
                    errMsg: ''
                },
                picture: [],
                voice: [],
                video: []
            }
        }
        return this._bugReportItem;
    }

    private getFileUrl(fileId) {
        return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
            md5_field: 'FILE_ID',
            file_id: fileId,
            down: 'allow'
        })
    }

    private closeImgEvent = (()=>{
        let removeImg = (e) => {
            setTimeout(() => {
                let img = d.closest((e.target as HTMLElement), '.upload-img'),
                    i = parseInt(img.dataset.index),
                    type = img.dataset.type;
                d.remove(img);
                if (type === 'img') {
                    this.setDataIndex();
                    i >= 0 && this.bugReportItem.picture.splice(i, 1);
                } else {
                    if (type === 'video') {
                        this.bugReportItem.video.shift();
                    }
                }
            }, 10);
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.close-ball', removeImg),
            off: () => d.off(this.wrapper, 'click', '.close-ball', removeImg)
        }
    })();

    // 播放视频
    private playVideoEvent = (() => {
        let playVideo = (e) => {

        };
        return {
            on: () => d.on(this.wrapper, 'click', '.app-shipin', playVideo),
            off: () => d.off(this.wrapper, 'click', '.app-shipin', playVideo)
        }
    })();

    destroy(){
        super.destroy();
        this.playVideoEvent.off();
        this.closeImgEvent.off();
    }

}
