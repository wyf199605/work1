/// <amd-module name="DetailDataManager"/>

import {DataManager, IDataManagerAjax} from "../../../global/components/DataManager/DataManager";

interface IDetailDataManagerPara{
    container?: HTMLElement;
    ajax?: IDataManagerAjax;
    data?: obj;
    render: () => void
}

export class DetailDataManager extends DataManager{
    constructor(para: IDetailDataManagerPara){
        super({
            isMb: false,
            loading: {
                msg: '数据加载中...',
                disableEl: para.container
            },
            page: {
                size: 1,
                options: [1],
                container: para.container
            },
            data: para.data ? null : [para.data],
            ajax: para.ajax,
            render(start, length, isRefresh){
                para.render && para.render();
            },
        });
    }

    get total(){
        return this.pagination ? this.pagination.total : 0;
    }

    get isToNext(){
        return this.total - 1 > this.current
    }
    get isToPrev(){
        return this.current > 0
    }

    toNext(){
        if(this.isToNext){
            this.pagination.current ++;
            return true;
        }
        return false;
    }
    toPrev(){
        if(this.isToPrev) {
            this.pagination.current--;
            return true;
        }
        return false;
    }

}