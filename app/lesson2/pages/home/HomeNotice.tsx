/// <amd-module name="HomeNotice"/>

import tools = G.tools;
import d = G.d;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import SPA = G.SPA;

export class HomeNotice extends Component {
    protected wrapperInit(para: IComponentPara): HTMLElement {
        return <div className="home-notice">
            <div className="title"/>
            <ul/>
        </div>;
    }

    constructor(para: IComponentPara) {
        super(para);
    }

    set(notices: obj) {
        d.query('.title', this.wrapper).innerText = notices.caption;
        let ns = notices.data,
            notWrapper = d.query('ul', this.wrapper);
        notWrapper.innerHTML = '';
        tools.isNotEmpty(ns) && ns.forEach((not) => {
            let notHTML = <li title={not.CAPTION}>
                <a href={'#' + SPA.hashCreate('lesson2', 'NoticePage', {id:not.ITEMID})}>
                    <span className="notice-content">{not.CAPTION}</span>
                    <span className="notice-time">{not.TIMES}</span>
                </a>
            </li>;
            notWrapper.appendChild(notHTML);
        });
    }
}