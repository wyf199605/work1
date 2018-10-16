/// <amd-module name="SelectTeacher"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Button} from "../../../../../global/components/general/button/Button";
import {TeacherInfo} from "../ReportActivityData";
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import {LeTablePage} from "../../../table/LeTablePage";
import {LeRule} from "../../../../common/rule/LeRule";

interface ISelectTeeacherPara extends IComponentPara {

}

export class SelectTeacher extends Component {
    private teacherInfo: TeacherInfo;

    protected wrapperInit(para: ISelectTeeacherPara): HTMLElement {
        let selectWrapper = <div className="lesson-form-group">
            <div className="lesson-label">
                <span>*</span>&nbsp;开课老师&nbsp;:
            </div>
            <Button content="选择教师" c-var="selectTeacher" className="addBtn" onClick={() => {
                LeRule.Ajax.fetch(LE.CONF.ajaxUrl.addTeacher).then(({response})=>{
                    let body = <div/>;
                    let modal = new Modal({
                        header: {
                            title: "选择教师"
                        },
                        footer: {},
                        isAdaptiveCenter: true,
                        width: '60%',
                        height: '600px',
                        body: body,
                        onOk: () => {
                            let tableSelects = table.tableModule.main.ftable.selectedRowsData;
                            if (tools.isNotEmptyArray(tableSelects)) {
                                if (tableSelects.length >= 2) {
                                    Modal.alert('请最多选择一个教师!');
                                } else {
                                    let row = tableSelects[0];
                                    this.teacherInfo = {
                                        teacherId: row.JOB_NO,
                                        teacherName: row.TEA_NAME,
                                        teacherPosition: row.JOB_TITLE
                                    };
                                    (this.innerEl.teacher as HTMLElement).innerText = `${row.TEA_NAME} (${row.JOB_TITLE})`;
                                    modal.destroy();
                                }
                            } else {
                                Modal.alert('请选择一个教师!');
                            }
                        }
                    });
                    let table = new LeTablePage({
                        table:response.data.body.table[0],
                        querier:response.data.body.querier[0],
                        common:response.data.common,
                        basePage:null,
                        container:body,
                        inTab:false
                    })
                });
            }} />
            <div c-var="teacher" style={{
                marginLeft: '20px'
            }}/>
        </div>;
        return selectWrapper;
    }

    constructor(para: ISelectTeeacherPara) {
        super(para);
    }

    set(info: TeacherInfo) {
        this.teacherInfo = info;
        if (tools.isNotEmpty(info)){
            this.innerEl.teacher.innerText = `${info.teacherName} (${info.teacherPosition})`;
        }
    }

    get() {
        if (tools.isEmpty(this.teacherInfo)) {
            Modal.alert('请选择教师!');
            return false;
        }
        return this.teacherInfo;
    }
    set disabled(dis:boolean){
        if(tools.isEmpty(dis)){
            return;
        }
        this._disabled = dis;
        (this.innerCom.selectTeacher as Button).disabled = dis;
    }
    get disabled(){
        return this._disabled;
    }
}