/// <amd-module name="PasswdModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {TextInput} from "../../../global/components/form/text/text";
import d = G.d;
import tools = G.tools;
import {Tooltip} from "../../../global/components/ui/tooltip/tooltip";

export interface IPasswdModalPara{
    data?: Array<passwdObj>;
    cancel?: () => void;
    confirm?: (data: obj) => void;
}

interface passwdObj{
    title: string;
    name: string;
    value: string;
}

export class PasswdModal{
    constructor(para: IPasswdModalPara){
        let ajaxData: obj = {},
            body = <div>
            {para.data ? para.data.map((data) => {
                let input = <TextInput readonly={true}/>;
                input.set(data.value);
                ajaxData[data.name] = data.value;
                return <div className="form-group">
                    <label className="control-label">{data.title}</label>
                    {input}
                </div>
            }) : null}
        </div>;
        let input1 = <TextInput type="password" placeholder="请输入新密码"/>,
            input2 = <TextInput type="password" placeholder="请确认新密码"/>;

        d.append(body, <div className="form-group">
            <label className="control-label">新密码</label>
            {input1}
        </div>);
        d.append(body, <div className="form-group">
            <label className="control-label">确认密码</label>
            {input2}
        </div>);

        let modal = new Modal({
            header: '修改密码',
            className: 'passwd-modal',
            width: '250px',
            body,
            isOnceDestroy: true,
            footer: {
                rightPanel: [
                    {
                        content: '取消',
                        onClick: () => {
                            modal && modal.destroy();
                            modal = null;
                        }
                    },
                    {
                        content: '确定',
                        type: 'primary',
                        onClick: () => {
                            let value1 = input1.get(),
                                value2 = input2.get();
                            if(tools.isEmpty(value1) || tools.isEmpty(value2)){
                                Modal.toast('密码不能为空')
                            }
                            ajaxData['new_password'] = input1.get();
                        }
                    }
                ]
            }
        })
    }
}
