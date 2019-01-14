/// <amd-module name="FlowInfo"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;

interface FlowInfoPara extends IComponentPara {
    text: string;
    position: {
        x: number;
        y: number;
    };
    width: number
}

export class FlowInfo extends Component {
    protected wrapperInit(para: FlowInfoPara): HTMLElement {
        return <div className="flow-info"/>;
    }

    constructor(para: FlowInfoPara) {
        super(para);
        this.wrapper.innerText = para.text || '';
        this.setPosition({
            x: para.position.x,
            y: para.position.y,
            width: para.width
        });
    }

    setPosition({x, y, width}) {
        this.wrapper.style.top = y + 'px';
        this.wrapper.style.left = x + 'px';
        this.wrapper.style.width = width + 'px';
    }

    destroy(){
        super.destroy();
    }
}