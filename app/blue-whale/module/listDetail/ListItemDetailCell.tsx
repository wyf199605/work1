/// <amd-module name="ListItemDetailCell"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import d = G.d;
import {ActionSheet} from "../../../global/components/ui/actionSheet/actionSheet";
import {ListItemDetail} from "./ListItemDetail";
import sys = BW.sys;
import {ImgModalMobile} from "../../common/ImgModalMobile";
import {ImgModal, ImgModalPara} from "../../../global/components/ui/img/img";

export type DetailCellType = 'text' | 'file' | 'date' | 'datetime' | 'textarea' | 'img'

// 文件信息
interface IFile {
    unique?: string;
    filesize?: number;
    filename?: string;
    addr?: string;
}

interface IDetailCell extends IComponentPara {
    detailPage?: ListItemDetail;
    type?: DetailCellType;
    caption?: string;
    value?: string | string[];
    field?: R_Field;
    className?: string;
}

export class ListItemDetailCell extends Component {
    private para: IDetailCell;
    private files: IFile[] = [];
    private imgs: string[] = [];
    private actionSheet: ActionSheet;
    private _currentFile: IFile;
    private fileType: string = '';

    set currentFile(fileInfo: IFile) {
        this._currentFile = fileInfo;
    }

    get currentFile() {
        return this._currentFile;
    }

    protected wrapperInit(para: IDetailCell): HTMLElement {
        let wrapper: HTMLElement = null,
            className = tools.isNotEmpty(para.className) ? para.className : '';
        switch (para.type) {
            case 'date':
            case 'datetime':
            case 'text': {
                className = tools.isNotEmpty(className) ? 'detail-cell ' + className : 'detail-cell';
                wrapper = <div className={className}>
                    <div c-var="title" className="detail-cell-title">{para.caption}</div>
                    <div c-var="content" className="detail-cell-content"/>
                </div>;
            }
                break;
            case 'img': {
                className = tools.isNotEmpty(className) ? 'detail-cell-img-wrapper ' + className : 'detail-cell-img-wrapper';
                wrapper = <div className={className}>
                    <div c-var="title" className="detail-cell-imgs-title">{para.caption}</div>
                    <div c-var="imgs" className="detail-cell-imgs"/>
                </div>;
            }
                break;
            case 'textarea': {
                className = tools.isNotEmpty(className) ? 'detail-cell-textarea-wrapper ' + className : 'detail-cell-textarea-wrapper';
                wrapper = <div className={className}>
                    <div c-var="title" className="detail-cell-imgs-title">{para.caption || '图片'}</div>
                    <div className="detail-cell-mutil-content">
                        <div c-var="content" className="detail-cell-textarea"/>
                    </div>
                </div>;
            }
                break;
            case 'file': {
                className = tools.isNotEmpty(className) ? 'detail-cell-file-wrapper ' + className : 'detail-cell-file-wrapper';
                wrapper = <div className={className}>
                    <div c-var="title" className="detail-cell-imgs-title">{para.caption || '附件'}</div>
                    <div c-var="files" className="detail-cell-files"/>
                </div>;
            }
                break;
        }
        return wrapper;
    }

    constructor(para: IDetailCell) {
        super(para);
        this.para = para;
        this.fileType = para.field.dataType || para.field.atrrs.dataType;
        para.value && this.render(para.value);
    }

    createImgs(value: string | string[], imgsWrapper: HTMLElement) {
        imgsWrapper.innerHTML = '';
        if (tools.isEmpty(value)) {
            d.append(imgsWrapper, <i className="appcommon app-zanwushuju"/>);
            return;
        }
        if (Array.isArray(value) && tools.isNotEmpty(value)) {
            let imgHtml = [];
            value.forEach((v, i) => {
                imgHtml.push(`<img src=${v} alt=${this.para.caption} data-index=${i}/>`);
            });
            imgsWrapper.innerHTML = imgHtml.join();
            this.imgEvent.on();
        }
    }

    createAllFiles(value: IFile[], fileWrapper: HTMLElement) {
        fileWrapper.innerHTML = '';
        if (tools.isNotEmpty(value)) {
            this.fileEvent.on();
            if (!this.actionSheet) {
                this.actionSheet = new ActionSheet({
                    buttons: [
                        {
                            content: '下载至本地',
                            icon: 'bg-download fg-white appcommon app-xiazaidaobendi',
                            onClick: () => {
                                if (this.fileType === '43') {
                                    BwRule.link({
                                        link: this.para.field.link.dataAddr,
                                        varList: this.para.field.link.varList,
                                        dataType: this.para.field.dataType || this.para.field.atrrs.dataType,
                                        data: this.para.detailPage.defaultData,
                                        type: this.para.field.link.type
                                    });
                                } else {
                                    // this.downloadFile(BW.CONF.siteUrl + this.currentFile.addr);
                                    let fileName = this.currentFile.filename,
                                        fileAddr = this.currentFile.addr,
                                        nameArr = fileName.split('.'),
                                        extensionName = nameArr[nameArr.length - 1],
                                        imgs = ['jpg', 'png', 'jpeg', 'gif'];
                                    if (~imgs.indexOf(extensionName)) {
                                        sys.window.openImg(BW.CONF.siteUrl + fileAddr);
                                    } else {
                                        sys.window.download(BW.CONF.siteUrl + fileAddr);
                                    }
                                }
                            }
                        }
                    ]
                });
            }
            let htmlArr = [];
            Array.isArray(value) && value.forEach((f, index) => {
                let wrapper = tools.isMb ? `<div class="detail-cell-file-item" data-index=${index}>
                    <div class="file-icon"><i class="appcommon app-wenjian"></i></div>
                    <div class="file-info">
                        <div class="file-name">${f.filename}</div>
                        <div class="file-size">${ListItemDetailCell.calcFileSize(f.filesize)}</div>
                    </div>
                    <i class="file-option appcommon app-gengduo1"></i>
                </div>` : `<div class="detail-cell-file-item" data-index=${index}>
                    <i class="iconfont icon-annex"></i>
                    <div class="file-name" title="${f.filename}">${f.filename}</div>
                    <div class="file-size">(${ListItemDetailCell.calcFileSize(f.filesize)})</div>
                    <i class="file-option appcommon app-gengduo1"></i>
                </div>`;
                htmlArr.push(wrapper);
            });
            tools.isNotEmpty(htmlArr) && (fileWrapper.innerHTML = htmlArr.join(''));
        } else {
            d.append(fileWrapper, <i className="appcommon app-zanwushuju"/>);
        }
    }

    private fileEvent = (() => {
        let fileOption = (e) => {
            let index = parseInt(d.closest(e.target, '.detail-cell-file-item').dataset.index),
                files = this.files || [];
            this.currentFile = files[index];
            this.actionSheet.isShow = true;
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.file-option', fileOption);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.file-option', fileOption);
            }
        }
    })();

    private imgEvent = (() => {
        let imgOption = (e) => {
            let imgs = this.imgs || [];
            let imgData: ImgModalPara = {
                img: ListItemDetailCell.getBigPicture(imgs),
                onDownload: function (url: string) {
                    sys.window.download(url);
                }
            };
            ImgModal.show(imgData);
            if (tools.isMb) {
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    d.query('.pswp', document.body).style.top = tools.getScrollTop(d.query('.list-item-detail-wrapper')) + 'px';
                }, 200);
            }
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.detail-cell-imgs img', imgOption);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.detail-cell-imgs img', imgOption);
            }
        }
    })();

    render(data: string | string[]) {
        switch (this.para.type) {
            case 'text': {
                this.innerEl.content.innerText = data as string || '';
                this.innerEl.content.title = data as string || '';
            }
                break;
            case 'img': {
                this.imgs = data as string[] || [];
                this.createImgs(data, this.innerEl.imgs);
            }
                break;
            case 'textarea': {
                this.innerEl.content.innerText = data as string || '';
            }
                break;
            case 'file': {
                if (tools.isNotEmpty(data)) {
                    switch (this.fileType) {
                        case '47':
                        case '48': {
                            BwRule.Ajax.fetch(data).then(({response}) => {
                                let dataArr = response.dataArr;
                                this.files = dataArr;
                                this.createAllFiles(dataArr, this.innerEl.files);
                            })
                        }
                            break;
                        case '40':
                        case '43': {
                            let file: string = data as string,
                                files = JSON.parse(file);
                            this.createAllFiles(files, this.innerEl.files);
                        }
                            break;
                    }
                } else {
                    this.files = [];
                    this.createAllFiles([], this.innerEl.files);
                }
            }
                break;
            case 'date': {
                this.innerEl.content.innerText = data as string || '';
            }
                break;
            case 'datetime': {
                this.innerEl.content.innerText = data as string || '';
            }
                break;
        }
    }

    // 计算文件大小
    static calcFileSize(limit: number): string {
        if (limit <= 0) {
            return '未知';
        }
        let size: string = "";
        if (limit < 0.1 * 1024) { //如果小于0.1KB转化成B
            size = limit.toFixed(2) + "B";
        } else if (limit < 0.1 * 1024 * 1024) {//如果小于0.1MB转化成KB
            size = (limit / 1024).toFixed(2) + "KB";
        } else if (limit < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB
            size = (limit / (1024 * 1024)).toFixed(2) + "MB";
        } else { //其他转化成GB
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
        }

        let len = size.indexOf("\."), dec = size.substr(len + 1, 2);
        if (dec == "00") {//当小数点后为00时 去掉小数部分
            return size.substring(0, len) + size.substr(len + 3, 2);
        }
        return size;
    }

    static getBigPicture(imgs: string[]): string[] {
        let result = [];
        imgs.forEach(img => {
            result.push(tools.url.addObj(img, {
                imagetype: 'picture',
            }, true, true));
        });
        return result;
    };

    destroy() {
        this.para = null;
        this.files && this.fileEvent.off();
        this.files = null;
        this.imgs && this.imgEvent.off();
        this.imgs = null;
        this.actionSheet && this.actionSheet.destroy();
        this.actionSheet = null;
        this.currentFile = null;
        super.destroy();
    }
}