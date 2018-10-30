/// <amd-module name="ListItemDetailCell"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import d = G.d;
export type DetailCellType = 'text' | 'file' | 'date' | 'datetime' | 'textarea' | 'img'

// 文件信息
interface IFile {
    fileSize?: number;
    fileName?: string;
    addr?: string;
}

interface IDetailCell extends IComponentPara {
    type?: DetailCellType;
    caption?: string;
    value?: string | string[];
}

export class ListItemDetailCell extends Component {
    private para: IDetailCell;

    protected wrapperInit(para: IDetailCell): HTMLElement {
        let wrapper: HTMLElement = null;
        switch (para.type) {
            case 'date':
            case 'datetime':
            case 'text': {
                wrapper = <div className="detail-cell">
                    <div c-var="title" className="detail-cell-title">{para.caption}</div>
                    <div c-var="content" className="detail-cell-content"/>
                </div>;
            }
                break;
            case 'img': {
                wrapper = <div className="detail-cell-img-wrapper">
                    <div c-var="title" className="detail-cell-imgs-title">{para.caption}</div>
                    <div c-var="imgs" className="detail-cell-imgs"/>
                </div>;
            }
                break;
            case 'textarea': {
                wrapper = <div className="detail-cell-textarea-wrapper">
                    <div c-var="title" className="detail-cell-imgs-title">{para.caption || '图片'}</div>
                    <div className="detail-cell-mutil-content">
                        <div c-var="content" className="detail-cell-textarea"/>
                    </div>
                </div>;
            }
                break;
            case 'file': {
                wrapper = <div className="detail-cell-file-wrapper">
                    <div c-var="title" className="detail-cell-imgs-title">{para.caption || '附件'}</div>
                    <div c-var="file" className="detail-cell-files"/>
                </div>;
            }
                break;
        }
        return wrapper;
    }

    constructor(para: IDetailCell) {
        super(para);
        this.para = para;
        para.value && this.render(para.value);
    }

    createImgs(value: string | string[], imgsWrapper: HTMLElement) {
        imgsWrapper.innerHTML = '';
        if (tools.isEmpty(value)) {
            d.append(imgsWrapper, <i className="appcommon app-zanwushuju"/>);
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((v) => {
                d.append(imgsWrapper, <img src={v} alt={this.para.caption}/>);
            })
        }
    }

    createAllFiles(value: IFile[], fileWrapper: HTMLElement) {
        fileWrapper.innerHTML = '';
        if(tools.isNotEmpty(value)){
            value.forEach(f => {
                d.append(fileWrapper, <div className="detail-cell-file-item">
                    <div className="file-icon"><i className="appcommon app-wenjian"/></div>
                    <div className="file-info" data-file-url={BW.CONF.siteUrl + f.addr}>
                        <div className="file-name">{f.fileName}</div>
                        <div className="file-size">{this.calcFileSize(f.fileSize)}</div>
                    </div>
                    <i className="file-option appcommon app-gengduo1"/>
                </div>);
            })
        }else{
            d.append(fileWrapper, <i className="appcommon app-zanwushuju"/>);
        }
    }

    render(data: string | string[]) {
        switch (this.para.type) {
            case 'text': {
                this.innerEl.content.innerText = data as string || '';
            }
                break;
            case 'img': {
                this.createImgs(data, this.innerEl.imgs);
            }
                break;
            case 'textarea': {
                this.innerEl.content.innerText = data as string || '';
            }
                break;
            case 'file': {
                if (tools.isNotEmpty(data)) {
                    BwRule.Ajax.fetch(data).then(({response}) => {
                        let dataArr = response.dataArr;
                        this.createAllFiles(dataArr, this.innerEl.files);
                    })
                } else {
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
    private calcFileSize(limit: number): string {
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

    destroy(){
        this.para = null;
        super.destroy();
    }
}