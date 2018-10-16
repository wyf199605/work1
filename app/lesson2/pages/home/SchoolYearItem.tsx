/// <amd-module name="SchoolYearItem"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import CONF = LE.CONF;
import {SchoolYearSelect} from "./SchoolYearSelect";
import SPA = G.SPA;

interface ISchoolYearItemPara extends IComponentPara {
    icon?: string;
}

export class SchoolYearItem extends Component {
    protected wrapperInit(para: ISchoolYearItemPara): HTMLElement {
        let wrapper = <div className='school-year-item'>
            <a c-var="link" href="#">
                <div className="number">
                    <span className="caption"></span>
                    <span className="count num-bold"></span>
                </div>
                <div className="right-icon">
                    <i className={'sec ' + para.icon}></i>
                </div>
            </a>
        </div>;
        return wrapper;
    }

    constructor(para: ISchoolYearItemPara) {
        super(para);
    }

    set(data: obj) {
        if (tools.isNotEmpty(data)) {
            d.query('.number span.caption', this.wrapper).innerText = data.CAPTION;
            if (tools.isNotEmpty( data.LINK)){
                let route = SPA.hashCreate('lesson2', 'common', {
                    url: data.LINK,
                    query: JSON.stringify({
                        GRADE_ID: SchoolYearSelect.select_item
                    })
                });
                // this.innerEl.link.setAttribute('href', '#/lesson2/common?url=' + encodeURIComponent(data.LINK)+'&school_year=' + SchoolYearSelect.select_year);
                this.innerEl.link.setAttribute('href','#'+ route);
            }else{
                this.innerEl.link.setAttribute('href', '#/lesson2/home');
            }
            d.query('.number span.count', this.wrapper).innerText = data.COUNT;
        } else {
            this.innerEl.link.setAttribute('href', '#/lesson2/home');
            d.query('.number span.count', this.wrapper).innerText = '0';
        }
    }
}