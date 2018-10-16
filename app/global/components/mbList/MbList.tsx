/// <amd-module name="MbList"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {MbListItemData} from "./MbListItem";

export interface IMbListPara extends IComponentPara{
    data: MbListItemData[];
}

export class MbList extends Component{
    protected wrapperInit(){
        return <div class="mb-list-wrapper"/>;
    }

    constructor(para: IMbListPara){
        super(para);
    }


}