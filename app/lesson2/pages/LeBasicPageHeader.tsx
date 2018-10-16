/// <amd-module name="LeBasicPageHeader"/>
import Component = G.Component;
import tools = G.tools;
import IComponentPara = G.IComponentPara;
interface ILeBasicPageHeaderPara extends IComponentPara{
    title?: string
}
export class LeBasicPageHeader extends Component{
    constructor(props: ILeBasicPageHeaderPara) {
        super(props);
        this.title = props.title;
    }

    protected wrapperInit(para: IComponentPara): HTMLElement {
        return <div className="basic-page-header">
            <span c-var="title" className="basic-page-line"/>
            <div c-var="buttonGroup" className="basic-page-header-btns"/>
        </div>;
    }

    set title(title: string){
        if(title && this.innerEl && this.innerEl.title){
            this.innerEl.title.innerHTML = tools.str.toEmpty(title);
        }
    }
    get title(){
        return this.innerEl && this.innerEl.title ? this.innerEl.title.innerHTML : '';
    }

    get buttonGroupEl(): HTMLElement{
        return this.innerEl.buttonGroup;
    }
}