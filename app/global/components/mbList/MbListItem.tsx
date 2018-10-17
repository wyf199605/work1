/// <amd-module name="MbListItem"/>

import {MbList} from "./MbList";
import d = G.d;

export interface IMbListItemPara {
    list: MbList;
    index: number;
    data?: MbListItemData;
    isImage?: boolean;
}

export interface MbListItemData{
    body?: [string, string][];
    title?: string;
    label?: string[];
    img?: string;
    imgLabel?: string;
    status?: number;
    statusColor?: string;
    countDown?: number;
}

export class MbListItem {
    protected list: MbList;
    public index: number;
    constructor(private para: IMbListItemPara){
        this.list = para.list;
        this.index = para.index;
        tools.isNotEmpty(para.data) && this.render(para.data);
    }

    protected _wrapper: HTMLElement = null;
    get wrapper() {
        if(this._wrapper === null){
            this._wrapper = <div class="list-item"/>;
        }
        return this._wrapper;
    }

    render(data: MbListItemData){
        let isImage = this.para.isImage;
        if(!!isImage){
            // img模板
            let itemContent:HTMLElement = null;
            this.wrapper.appendChild(<div className="item-body">
                <img className="item-img" src={data.img || '../img/noimg.jpg'} alt=""/>
                <div className="item-content">

                </div>
            </div>);
        }else{
            // status模板

        }
    }
}
