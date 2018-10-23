/// <amd-module name="ListItemDetailCell"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;

export type DetailCellType = 'text' | 'file' | 'date' | 'datetime' | 'textarea' | 'img'

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
                    <div c-var="content" className="detail-cell-content"></div>
                </div>;
            }
                break;
            case 'img': {
                wrapper = <div className="detail-cell-img">
                    <div c-var="title" className="detail-cell-title">{para.caption}</div>
                    <div c-var="imgs" className="detail-cell-imgs"/>
                </div>;
            }
                break;
            case 'textarea': {
                wrapper = <div className="detail-cell">
                    <div c-var="title" className="detail-cell-title">{para.caption}</div>
                    <div c-var="content" className="detail-cell-content"></div>
                </div>;
            }
                break;
            case 'file': {
                wrapper = <div className="detail-cell">
                    <div c-var="title" className="detail-cell-title">{para.caption}</div>
                    <div c-var="content" className="detail-cell-content"></div>
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
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((v) => {
                d.append(imgsWrapper, <img src={v} alt={this.para.caption + '详情图片'}/>);
            })
        } else {
            d.append(imgsWrapper, <img src={value} alt={this.para.caption + '详情图片'}/>);
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
                this.innerEl.content.innerText = data as string || '';
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


}