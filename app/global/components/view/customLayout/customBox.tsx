/// <amd-module name="CustomBox"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {CustomBoxLayout} from "./customBoxLayout";

export interface ICustomBox{
    width: number;
    height: number;
    resize: boolean; // 是否可改变宽高
    fullScreen: boolean; // 是否可以放大
}

export interface ICustomBoxPara extends ICustomBox, IComponentPara{
    parent: CustomBoxLayout;
}

export class CustomBox extends Component{
    protected wrapperInit(){
        return null;
    }

    constructor(para: ICustomBoxPara){
        super(para);
    }


}
