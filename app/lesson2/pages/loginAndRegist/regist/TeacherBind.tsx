/// <amd-module name="TeacherBind"/>

import d = G.d;
import tools = G.tools;
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {TextInput} from "../../../../global/components/form/text/text";

export class TeacherBind extends Component {
    protected wrapperInit(para: IComponentPara): HTMLElement {
        return <div className="teacher-bind">
            <div className="input-wrapper group">
                <TextInput c-var="jobNumber" placeholder="请输入您的工号"></TextInput>
            </div>
            <div className="input-wrapper group">
                <TextInput c-var="yourName" placeholder="请输入您的姓名"></TextInput>
            </div>
        </div>;
    }

    constructor(para: IComponentPara) {
        super(para);
        this.isShow = false;
    }

    private _isShow: boolean;
    set isShow(show: boolean) {
        this._isShow = show;
        show ? this.wrapper.classList.remove('hide') : this.wrapper.classList.add('hide');
    }

    get isShow() {
        return this._isShow;
    }

    get(): obj {
        let jobNumberValue = (this.innerCom.jobNumber as TextInput).get().replace(/\s/g,''),
            nameValue = (this.innerCom.yourName as TextInput).get().replace(/\s/g,'');
        if (tools.isEmpty(jobNumberValue)){
            Modal.alert('工号不能为空!');
            return null;
        }
        if (tools.isEmpty(nameValue)){
            Modal.alert('姓名不能为空!');
            return null;
        }
        let obj = {
            user_name:nameValue,
            job_id:jobNumberValue
        };
        return obj;
    }
}