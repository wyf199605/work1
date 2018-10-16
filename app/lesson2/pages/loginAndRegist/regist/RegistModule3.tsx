/// <amd-module name="RegistModule3"/>

import IComponentPara = G.IComponentPara;
import Component = G.Component;
import tools = G.tools;
interface IRegistModule2Para extends IComponentPara {
    title?:string;
    explain?:string;
    userInfo?:obj;
}
export class RegistModule3 extends Component{
    protected wrapperInit(para: IRegistModule2Para): HTMLElement {
        return <div className="regist-module regist-module3">
        <p>{para.title}:</p>
            <p className="login-info"> <span className="key">您的登录账号&nbsp;:&nbsp;</span><span>{para.userInfo.userid}</span></p>
            <p className="login-info"> <span className="key">您的登录密码&nbsp;:&nbsp;</span><span>{para.userInfo.password}</span></p>
            <p className="login-info"> <span className="key">您的手机号码&nbsp;:&nbsp;</span><span>{para.userInfo.mobile_id}</span></p>
            {tools.isNotEmpty(para.userInfo.identity_id) ?  <p className="login-info"> <span className="key">您的身份证号&nbsp;:&nbsp;</span><span>{para.userInfo.identity_id}</span></p> : ''}
            <p className="explain">{para.explain}</p>
            <a href="#/loginReg/login" className="back-login">返回登录</a>
        </div>;
    }

    constructor(para:IRegistModule2Para){
        super(para);
    }
}