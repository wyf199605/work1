/// <amd-module name="CustomBoxLayout"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {CustomBox, ICustomBox, ICustomBoxPara} from "./customBox";

export interface ICustomBoxLayoutPara extends IComponentPara{
    drag?: boolean; // 是否可拖拽
}

export class CustomBoxLayout extends Component{
    protected wrapperInit(){
        return null
    }

    constructor(para: ICustomBoxLayoutPara){
        super(para);
    }

    render(){

    }

    addBox(para: ICustomBox, position?: number){

    }

    getBox(index: number){

    }

    delBox(index: number){

    }

    destroy(){
        super.destroy();
    }
}
