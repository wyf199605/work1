/// <amd-module name="StuModalDetail"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Button} from "../../../global/components/general/button/Button";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {LeRule} from "../../common/rule/LeRule";

export class StuModalDetailModal extends Modal{
    constructor(){
        let btn = new Button({
            className: 'print',
            content: '打印',
            onClick: () => {

            }
        });
        super({
            header: {
                title: '学生成绩',
                rightPanel: btn.wrapper,
                isDrag: false
            },
            body: new StuModalDetail().wrapper,
            isShow: true,
            width: '71%',
            className: 'student-modal',
            position: 'full',
            isDrag: false
        });

    }

}
class StuModalDetail extends Component{
    protected wrapperInit(para : IComponentPara) : HTMLElement{
        let tpl = <div className="student-modal-detail">
            <div className="student-modal-header">
                <div className="student-modal-title">
                    <img width="180" src="../../img/lesson2/logo.png" alt=""/>
                    <div className="modal-title">
                        <div className="lang-ch">第二课堂成绩单</div>
                        <div className="lang-en">Extracurricular Activities Record</div>
                    </div>

                </div>
                <div className="flex-layout">
                    <div className="student-modal-left">
                        <div>
                            <p>
                                <img src="../../img/lesson2/name.png" alt=""/>
                                <span>姓名：薛琳</span>
                            </p>
                            <p>
                                <img src="../../img/lesson2/college.png" alt=""/>
                                <span>院系：物理学与电子信息工程</span>
                            </p>
                            <p>
                                <img src="../../img/lesson2/student_id.png" alt=""/>
                                <span>学号：5145678</span>
                            </p>
                            <p>
                                <img src="../../img/lesson2/profession.png" alt=""/>
                                <span>专业：机械电子工程</span>
                            </p>
                        </div>
                        <p className="img-rank">100.00%</p>
                    </div>
                    <div className="student-modal-right">
                        <img width="120" src="../../img/lesson2/rank.png" alt=""/>
                        {/*<img src={LeRule.fileUrlGet('c7578331c9f6bc26f0b365f8a344f01f')} alt=""/>*/}
                    </div>
                </div>
            </div>

        </div>;
        return tpl
    }
}