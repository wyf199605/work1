/// <amd-module name="RegistModule2"/>

import {StudentBind} from "./StudentBind";
import d = G.d;
import tools = G.tools;
import {TeacherBind} from "./TeacherBind";
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {LeRule} from "../../../common/rule/LeRule";
import {Button} from "../../../../global/components/general/button/Button";

interface IRegistModule2Para extends IComponentPara {
    submitHandler?: (data:obj) => void;
    loginPwd?: string;
}

export class RegistModule2 extends Component {
    private roles: obj;
    private submitHandler: (data:obj) => void;
    private loginPwd: string;
    private isStudent: boolean;

    protected wrapperInit(para: IRegistModule2Para): HTMLElement {
        let registModule2HTML = <div className="regist-module regist-module2">
            <div className="binding">
                <div className="explain">请绑定您的身份</div>
                <div className="radio-group">
                    <div className="radio-wrapper">
                        <input type="radio" className="radio-normal" value="学生" checked name="identity" id="student"/>
                        <label htmlFor="student">学生</label>
                    </div>
                    <div className="radio-wrapper">
                        <input type="radio" className="radio-normal" value="教师" name="identity" id="teacher"/>
                        <label htmlFor="teacher">教师</label>
                    </div>
                </div>
            </div>
            <div className="role-wrapper">

            </div>
            <Button className="log-btn submit sys-btn" content="提交" onClick={()=>{
                let radioInputchecked = d.query('input[type=radio]:checked', this.wrapper) as HTMLFormElement,
                    formValue = {},
                    roles = this.roles;
                if (radioInputchecked.value === '教师') {
                    formValue = roles.teacher.get();
                } else {
                    formValue = roles.student.get();
                }
                if (tools.isNotEmpty(formValue)) {
                    // 提交
                    let para = Object.assign({password: this.loginPwd}, formValue),
                        url = LE.CONF.ajaxUrl.binding + '?' + (this.isStudent ? 'type=student' : 'type=teacher');
                    LeRule.Ajax.fetch(url,{
                        type:'POST',
                        data:[para]
                    }).then(({response})=>{
                        let obj = {};
                        if (this.isStudent){
                            obj = {
                                userid:response.data.userid,
                                password:response.data.password,
                                mobile_id:response.data.mobile_id,
                                identity_id:response.data.identity_id
                            }
                        }else{
                            obj = {
                                userid:response.data.userid,
                                password:response.data.password,
                                mobile_id:response.data.mobile_id
                            }
                        }
                        this.submitHandler(obj);
                    });
                }
            }}/>
        </div>;
        let roleWrapper = d.query('.role-wrapper', registModule2HTML),
            student = new StudentBind({
                container: roleWrapper
            }),
            teacher = new TeacherBind({
                container: roleWrapper
            });
        this.roles = {
            student, teacher
        };
        return registModule2HTML;
    }

    constructor(para: IRegistModule2Para) {
        super(para);
        this.loginPwd = para.loginPwd;
        this.submitHandler = para.submitHandler;
        this.initEvents.on();
        this.isStudent = true;
    }

    private initEvents = (() => {
        let radioEvent = (e) => {
            let input = e.target as HTMLFormElement,
                student = this.roles.student,
                teacher = this.roles.teacher;
            if (input.value === '教师') {
                teacher.isShow = true;
                student.isShow = false;
                this.isStudent = false;
            } else {
                teacher.isShow = false;
                student.isShow = true;
                this.isStudent = true;
            }
        };
        return {
            on: () => {
                d.on(this.wrapper, 'change', 'input[type=radio]', radioEvent);
            },
            off: () => {
                d.off(this.wrapper, 'change', 'input[type=radio]', radioEvent);
            }
        }
    })();

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}