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
        return <div className="custom-box-layout-wrapper" />
    }

    protected boxes: CustomBox[] = [];
    protected _drag: boolean = true;

    constructor(para: ICustomBoxLayoutPara){
        super(para);

        para.items && para.items.forEach((item, index) => {
            this.addBox(item,index);
        })
    }

    render(){

    }

    get drag() {
        return this._drag
    }

    set drag( flag: boolean ) {
        this._drag = flag;
        this.wrapper.innerHTML = null;
        this.boxes.forEach( (item) => {
            return item
        } )
    }

    addBox(para: ICustomBox, position?: number){
        let dom = <CustomBox parent={this} {...para} index={ position || 0 } container={this.wrapper} drag={this._drag}/>;
        if ( position ) {
            this.boxes.splice( position, 0 , dom );
        } else {
            this.boxes.unshift( dom );
        }
        return dom;
    }

    getBox(index: number){
        // let box = d.queryAll('.custom-box', this.wrapper);
        return this.boxes[index];
    }

    delBox(index: number){
        // let box = d.queryAll('.custom-box', this.wrapper);
        // box.splice(index,1);
        this.boxes.splice( index, 1 );
        this.boxes.forEach( (item) => {
            return item
        } )
    }

    destroy(){
        super.destroy();
    }
}
