/// <amd-module name="BwUploader"/>


import Component = G.Component;
import IComponentPara = G.IComponentPara;

interface IBwUploaderPara extends IComponentPara{

}

export class BwUploader extends Component{
    protected wrapperInit(){
        return null;
    }

    constructor(para: IBwUploaderPara){
        super(para)
    }
}