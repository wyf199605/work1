/// <amd-module name="MbListView"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;

interface IMbListView extends IComponentPara {
    ui: IBW_UI<R_SubTable_Field>;
}

export class MbListView extends Component {
    protected wrapperInit(para: IMbListView): HTMLElement {
        return <div className="mb-list-view"/>;
    }

    constructor(para: IMbListView) {
        super(para);
    }
}