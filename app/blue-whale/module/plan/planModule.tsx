/// <amd-module name="PlanModule"/>

import Component = G.Component;

export class PlanModule extends Component{
    wrapperInit(){
        return <div className="plan-content"></div>;
    }

    constructor(){
        super();
    }
}