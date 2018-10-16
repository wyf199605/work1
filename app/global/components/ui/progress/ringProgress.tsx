///<amd-module name="RingProgress"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;

export interface IRingProgressPara extends IComponentPara{
    percent?: number; //进度条初始位置，默认0；
    showInfo?: boolean; // 是否显示当前进度详细信息

}

export class RingProgress extends Component{
    constructor(para: IRingProgressPara){
        super(para)
    }

    wrapperInit(){
        return null
    }

    protected _percent = 0;
    set percent(len: number){
        this._percent = len;
    }
    get percent(){
        return this._percent;
    }

    protected _isEnd = false;
    set isEnd(len: boolean){
        this._isEnd = len;
    }
    get isEnd(){
        return this._isEnd;
    }

    destroy(){
        //销毁
    }
}