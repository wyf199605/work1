/// <amd-module name="PasswdModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {TextInput} from "../../../global/components/form/text/text";

export interface IPasswdModalPara{
    data?: Array<[string, string]>;
    cancel?: () => void;
    confirm?: (data: obj) => void;
}

export class PasswdModal{
    constructor(para: IPasswdModalPara){
        let body = <div>
            {para.data ? para.data.map((data) => {
                return <div class="form-group">
                    <label>{data[0]}</label>
                    <TextInput readonly={true} value={data[1]}/>
                </div>
            }) : null}
        </div>;
        let modal = new Modal({
            header: '修改密码',
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

                        }
                    }
                ]
            }
        })
    }
}
