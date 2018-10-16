/// <amd-module name="StudentBind"/>

import {Modal} from "../../../../global/components/feedback/modal/Modal";
import d = G.d;
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {TextInput} from "../../../../global/components/form/text/text";

export class StudentBind extends Component {
    protected wrapperInit(para: IComponentPara): HTMLElement {
        return <div className="student-bind">
            <div className="input-wrapper group">
                <TextInput c-var="studentNumber" placeholder="请输入您的学号"></TextInput>
            </div>
            <div className="input-wrapper group">
                <TextInput c-var="yourName" placeholder="请输入您的姓名"></TextInput>
            </div>
            <div className="input-wrapper group">
                <TextInput c-var="idCardNum" placeholder="请输入您的身份证号"></TextInput>
            </div>
        </div>;
    }

    constructor(para: IComponentPara) {
        super(para);
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
        let jobNumberValue = (this.innerCom.studentNumber as TextInput).get().replace(/\s/g, ''),
            nameValue = (this.innerCom.yourName as TextInput).get().replace(/\s/g, ''),
            idCardNum = (this.innerCom.idCardNum as TextInput).get().replace(/\s/g, '');
        if (tools.isEmpty(jobNumberValue)) {
            Modal.alert('学号不能为空!');
            return null;
        }
        if (tools.isEmpty(nameValue)) {
            Modal.alert('姓名不能为空!');
            return null;
        }
        if (tools.isEmpty(idCardNum)) {
            Modal.alert('身份证号不能为空!');
            return null;
        }
        let obj = {
            user_name: nameValue,
            student_id: jobNumberValue,
            identity_id: idCardNum
        };
        return obj;
    }
}