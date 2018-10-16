/// <amd-module name="RoleModule"/>
import {CheckBox} from "../../../../../global/components/form/checkbox/checkBox";
import {TextInput} from "../../../../../global/components/form/text/text";
import {Button} from "../../../../../global/components/general/button/Button";
import tools = G.tools;
import d = G.d;
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {ControllerTypePara, StudentPara} from "../ReportActivityData";
import {LeUploadModule} from "../../../../modules/upload/UploadModule";
import {FastTable} from "../../../../../global/components/newTable/FastTable";
import {LeRule} from "../../../../common/rule/LeRule";
import {LeTablePage} from "../../../table/LeTablePage";

interface IRoleModulePara extends IComponentPara {
    isMutil?: boolean;
    roleName?: string;
    title?: string;
}

export interface LeRoleModulePara {
    students: StudentPara[];
    type?: ControllerTypePara;
}

export interface LeRolePara {
    type: {
        maxPlayers: number;
        integralMultiple: number;
    };
    students: StudentPara[];
}

export class RoleModule extends Component {
    private title: string;
    private _students: StudentPara[];
    set students(s: StudentPara[]) {
        this._students = s;
    }

    get students() {
        return this._students;
    }

    protected wrapperInit(para: IRoleModulePara): HTMLElement {
        this.title = para.roleName;
        let uploader = null;
        let titleHtml = tools.isNotEmpty(para.title) ?
            <div className="lesson-label"><span>*&nbsp;</span>{para.title}&nbsp;:</div> :
            <div className="lesson-label"/>;
        let roleModuleWrapper = <div className="role-item">
            <div className="role-item-row">
                {titleHtml}
                <div className="mutil-select">{para.isMutil ? '(多选)' : ''}</div>
                <div className="role-row-right">
                    <div className="check-wrapper"><CheckBox c-var="check" text={para.roleName}/></div>
                    <TextInput c-var="maxPlayers" type="number" placeholder="不输入人数将不限制人数" className="count"/>
                    <LeUploadModule isExcel={true} isAutoUpload={true} accept={{extensions: 'xlsx'}}
                                    isChangeText={false} successHandler={(data) => {
                        // 上传成功
                        data.forEach((item) => {
                            let res = item.data;
                            if (tools.isNotEmptyArray(res.data)) {
                                let resData = res.data;
                                resData.forEach((stu) => {
                                    this.addStudent(stu);
                                });
                                this.setStudentNum();
                            }
                        })
                    }
                    }
                                    c-var="uploader" url={LE.CONF.ajaxUrl.getExcelData} text="上传学生"
                                    className='addBtn'/>
                </div>
            </div>
            <div className="role-item-row">
                <div className="lesson-label"/>
                <div className="mutil-select"/>
                <div className="role-row-right">
                    <div className="check-wrapper"/>
                    <div className="role-label">指定用户</div>
                    <Button content="添加学生" c-var="addStudent" className="addBtn" onClick={() => {
                        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.addStudent).then(({response})=>{
                            let body = <div/>;
                            let modal = new Modal({
                                header: {
                                    title: "选择学生"
                                },
                                footer: {},
                                isAdaptiveCenter: true,
                                width: '60%',
                                height: '600px',
                                body: body,
                                onOk: () => {
                                    let tableSelects = table.tableModule.main.ftable.selectedRowsData;
                                    if (tools.isNotEmptyArray(tableSelects)) {
                                        tableSelects.forEach((row) => {
                                            this.addStudent(row);
                                        });
                                        this.setStudentNum();
                                        modal.destroy();
                                    } else {
                                        Modal.alert('请选择学生');
                                    }
                                }
                            });
                            let table = new LeTablePage({
                                table:response.data.body.table[0],
                                querier:response.data.body.querier[0],
                                common:response.data.common,
                                basePage:null,
                                container:body,
                                inTab:false,
                                onReady:()=>{
                                    table.tableModule.main.ftable.on(FastTable.EVT_RENDERED,()=>{
                                        let tableData = table.tableModule.main.ftable.data;
                                        if (tools.isNotEmpty(this.students)){
                                            tableData.forEach((tableRowData, index) => {
                                                for (let i = 0; i < this.students.length; i++) {
                                                    if (tableRowData.STU_NO === this.students[i].userid) {
                                                        table.tableModule.main.ftable.pseudoTable._setCellsSelected(index,1)
                                                        table.tableModule.main.ftable.rows[index].selected = true;
                                                        break
                                                    }
                                                }
                                            });
                                            table.tableModule.main.ftable._drawSelectedCells();
                                            table.tableModule.main.ftable.pseudoTable.setCheckBoxStatus();
                                        }
                                    })
                                }
                            });
                        })
                    }}/>
                    <div className="upload-student-number">已上传<span c-var="stuNum">0名</span>学生</div>
                </div>
            </div>
            <div className="role-item-row">
                <div className="lesson-label"/>
                <div className="mutil-select"/>
                <div className="role-row-right">
                    <div className="check-wrapper"/>
                    <div className="role-label">积分倍数</div>
                    <TextInput c-var="integralMultiple" type="number"/>倍
                </div>
            </div>
        </div>;
        return roleModuleWrapper;
    }

    constructor(para: IRoleModulePara) {
        super(para);
        (this.innerCom.integralMultiple as TextInput).set('1');
        this.initEvents.on();
    }

    private initEvents = (() => {
        let lookUploadStuHandler = () => {
            let body = <div>
                <div className="modal-row-btn" style={{
                    display: "flex",
                    marginBottom: '20px'
                }}>
                    <Button content="删除学生" className="addBtn" onClick={() => {
                        let selectRows = table.selectedRows;
                        if (tools.isNotEmptyArray(selectRows)) {
                            let indexes = [];
                            selectRows.forEach(row => {
                                this.deleteStudent(row.data);
                                indexes.push(row.index);
                            });
                            table.rowDel(indexes);
                            table.pseudoTable._clearCellSelected();
                            this.setStudentNum();
                        } else {
                            Modal.alert('请先选择需要删除的学生！');
                        }
                    }
                    }/>
                </div>
            </div>;
            let modal = new Modal({
                header: {
                    title: "查看学生"
                },
                isAdaptiveCenter: true,
                width: '60%',
                height: '500px',
                body: body,
                className: 'table-modal'
            });
            let data = [];
            tools.isNotEmptyArray(this.students) && this.students.forEach((stu) => {
                let obj = {
                    SCHOOL_NAME: stu.userschool,
                    STU_NO: stu.userid,
                    STU_NAME: stu.username
                };
                data.push(obj);
            });
            let table = new FastTable({
                container: body,
                cols: [[
                    {
                        name: 'STU_NO',
                        title: '学号'
                    },
                    {
                        name: 'STU_NAME',
                        title: '学生姓名'
                    },
                    {
                        name: 'SCHOOL_NAME',
                        title: '所在学校'
                    }
                ]],
                pseudo: {
                    type: 'checkbox'
                },
                data: data
            });

        };
        return {
            on: () => d.on(this.wrapper, 'click', '.upload-student-number span', lookUploadStuHandler),
            off: () => d.off(this.wrapper, 'click', '.upload-student-number span', lookUploadStuHandler)
        }
    })();

    private deleteStudent(row: obj) {
        let students = this.students;
        for (let i = 0; i < students.length; i++) {
            let stu = students[i];
            if (stu.userid === row.STU_NO) {
                students.splice(i, 1);
                this.students = students;
                return;
            }
        }
    }

    private addStudent(row: obj) {
        let students = tools.isNotEmptyArray(this.students) ? this.students : [];
        for (let i = 0; i < students.length; i++) {
            let stu = students[i];
            if (stu.userid === row.STU_NO.toString()) {
                return;
            }
        }
        students.push({
            userid: row.STU_NO,
            username: row.STU_NAME,
            userschool: row.SCHOOL_NAME
        });
        this.students = students;
    }

    private setStudentNum() {
        let index = tools.isNotEmptyArray(this.students) ? this.students.length : 0;
        (this.innerEl.stuNum as HTMLElement).innerText = index + '名';
    }

    set disabled(dis: boolean) {
        if (tools.isEmpty(dis)) {
            return;
        }
        this._disabled = dis;
        (this.innerCom.check as CheckBox).disabled = dis;
        (this.innerCom.maxPlayers as TextInput).disabled = dis;
        (this.innerCom.addStudent as Button).disabled = dis;
        (this.innerCom.uploader as LeUploadModule).disabled = dis;
        (this.innerCom.integralMultiple as TextInput).disabled = dis;
        this.innerEl.stuNum.classList.toggle('disabled', dis);
    }

    get disabled() {
        return this._disabled;
    }

    set(data: LeRoleModulePara) {
        if (tools.isNotEmpty(data)) {
            (this.innerCom.check as CheckBox).checked = true;
            if (tools.isNotEmpty(data.students)) {
                this.students = data.students;
                this.setStudentNum();
            } else {
                this.students = [];
            }
            let maxPlayers = tools.isNotEmpty(data.type) ? data.type.maxPlayers : '';
            let integralMultiple = tools.isNotEmpty(data.type) ? data.type.integralMultiple : 1;
            (this.innerCom.maxPlayers as TextInput).set(maxPlayers);
            (this.innerCom.integralMultiple as TextInput).set(integralMultiple);
        }
    }

    get() {
        let maxPlayers = (this.innerCom.maxPlayers as TextInput).get(),
            integralMultiple = (this.innerCom.integralMultiple as TextInput).get(),
            check = (this.innerCom.check as CheckBox).get(),
            students = tools.isNotEmptyArray(this.students) ? this.students : [];
        if (!!check) {
            if (tools.isNotEmpty(students)) {
                if (tools.isNotEmpty(maxPlayers) && parseInt(maxPlayers) !== 0) {
                    if (parseInt(maxPlayers) < students.length) {
                        Modal.alert('上传学生人数不能大于限制人数！');
                        return false;
                    }
                }
            }
            return {
                type: {
                    maxPlayers: tools.isNotEmpty(maxPlayers) ? parseInt(maxPlayers) : 0,
                    integralMultiple: parseFloat(integralMultiple)
                },
                students: students
            }
        }
        return {};
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}