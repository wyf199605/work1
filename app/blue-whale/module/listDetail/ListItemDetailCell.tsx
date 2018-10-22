/// <amd-module name="ListItemDetailCell"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;

interface IDetailCell extends IComponentPara{
    isImg?:boolean;
    caption?:string;
    value?:string | string[];
}

export class ListItemDetailCell extends Component{
    private para:IDetailCell;
    protected wrapperInit(para: IDetailCell): HTMLElement {
        let wrapper:HTMLElement = null;
        if (!!para.isImg){
            wrapper = <div className="detail-cell-img">
                <div c-var="title" className="detail-cell-title"/>
                <div c-var="imgs" className="detail-cell-imgs"/>
            </div>;
        }else{
            wrapper = <div className="detail-cell">
                <div c-var="title" className="detail-cell-title"/>
                <div c-var="content" className="detail-cell-content"></div>
            </div>;
        }
        return wrapper;
    }

    constructor(para:IDetailCell){
        super(para);
        this.para = para;
        this.render(para);
    }

    createImgs(value:string | string[],imgsWrapper:HTMLElement){
        imgsWrapper.innerHTML = '';
        if (tools.isEmpty(value)){
            return;
        }
        if (Array.isArray(value)){
            value.forEach((v)=>{
                d.append(imgsWrapper,<img src={v} alt={this.para.caption + '详情图片'}/>);
            })
        }else{
            d.append(imgsWrapper,<img src={value} alt={this.para.caption + '详情图片'}/>);
        }
    }

    render(data:IDetailCell){
        if (!!this.para.isImg){
            this.innerEl.title.innerText = data.caption || '';
            this.createImgs(data.value,this.innerEl.imgs);
        }else{
            this.innerEl.title.innerText = data.caption || '';
            this.innerEl.content.innerText = data.value as string || '';
        }
    }
}