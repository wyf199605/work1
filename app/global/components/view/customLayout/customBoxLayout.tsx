/// <amd-module name="CustomBoxLayout"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {CustomBox, ICustomBox, ICustomBoxPara} from "./customBox";
import d = G.d;

export interface ICustomBoxLayoutPara extends IComponentPara{
    items?: ICustomBox[];
}

export class CustomBoxLayout extends Component{
    protected wrapperInit(){
        return <div className="custom-box-layout-wrapper"></div>
    }

    protected boxes: CustomBox[] = [];

    constructor(para: ICustomBoxLayoutPara){
        super(para);
        para.items && para.items.forEach((item, index) => {
            this.addBox(item,index);
        })
    }

    render(){

    }

    resetBoxes( para ) {
        this.wrapper.innerHTML = null;

        para.forEach((item, index) => {
            console.log( para,123,item );
            d.append( item, this.wrapper );
        })
    }

    addBox(para: ICustomBox, position?: number){
        <CustomBox parent={this} {...para} index={ position || 0 } container={this.wrapper} resetBoxes={ (arrBox)=> { this.resetBoxes(arrBox) } }/>
    }

    getBox(index: number){
        let box = d.queryAll('.custom-box', this.wrapper);
        return box[index];
    }

    delBox(index: number){
        let box = d.queryAll('.custom-box', this.wrapper);
        box.splice(index,1);
    }

    destroy(){
        super.destroy();
    }
}
