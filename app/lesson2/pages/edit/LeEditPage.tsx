/// <amd-module name="LeEditPage"/>

import Component = G.Component;
import {LeBasicPage} from "../LeBasicPage";
import IComponentPara = G.IComponentPara;
import {LeTableEditModule} from "../../modules/edit/LeTableEditModule";
import d = G.d;


interface ILeEditPagePara extends IComponentPara{
    pageEl: ILE_Page;
    basePage: LeBasicPage;
}

export class LeEditPage extends Component{
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return para.container;
    }

    protected editModules: LeTableEditModule[];
    protected editWrapper: HTMLElement;

    constructor(para: ILeEditPagePara){
        super(para);

        this.editWrapper = <div className="edit-page-wrapper"/>;
        d.append(this.wrapper, this.editWrapper);
        this.initEditModule(para.pageEl.body.editor, para.pageEl.common && para.pageEl.common.fields);
    }

    protected initEditModule(editor: ILE_Editor[], fields){
        if(Array.isArray(editor)){
            this.editModules = [];
            editor.forEach((edit) => {
                this.editModules.push(new LeTableEditModule({
                    ui: edit,
                    container: this.editWrapper,
                    fields,
                }));
            });
        }
    }

}
