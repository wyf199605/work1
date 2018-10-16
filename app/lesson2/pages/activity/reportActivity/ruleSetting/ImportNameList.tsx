/// <amd-module name="ImportNameList"/>

import d = G.d;
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {StudentPara} from "../ReportActivityData";
import {LeUploadModule} from "../../../../modules/upload/UploadModule";
import tools = G.tools;
import {FastTable} from "../../../../../global/components/newTable/FastTable";
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {Button} from "../../../../../global/components/general/button/Button";

interface IImportNameListPara extends IComponentPara {
    title?: string;
    field?: string;
    value?: string[];
}

export class ImportNameList extends Component {
    private field: string;
    private values: string[];
    private _students: StudentPara[];
    set students(s: StudentPara[]) {
        this._students = s;
    }
    get students() {
        return this._students;
    }

    protected wrapperInit(para: IImportNameListPara): HTMLElement {
        this.field = para.field;
        this.values = para.value;
        let date = new Date().getTime(),
            randomStr = this.getRandomStr(),
            r1 = date + randomStr + 'no', r2 = date + randomStr + 'yes',
            activityRadioWrapper = <div className="row">
                <div className="lesson-form-group" style="height:46px">
                    <div className="lesson-label">{para.title}&nbsp;:</div>
                    <div className="radio-group" c-var="group">
                        <div className="radio-wrapper">
                            <input type="radio" className="import-list radio-normal" value={para.value[0]} checked
                                   name={para.field}
                                   id={r1}/>
                            <label htmlFor={r1}>{para.value[0]}</label>
                        </div>
                        <div className="radio-wrapper">
                            <input type="radio" className="import-list radio-normal" value={para.value[1]}
                                   name={para.field}
                                   id={r2}/>
                            <label htmlFor={r2}>{para.value[1]}</label>
                        </div>
                    </div>
                    <div className="showOrHide hide" style={{paddingLeft: "12px"}} c-var="hide">
                        <LeUploadModule nameField="activitiesList" isAutoUpload={true} accept={{extensions: 'xlsx'}}
                                        isChangeText={false} successHandler={(data)=>{
                            data.forEach((item) => {
                                // 上传成功
                                let arr = [],
                                    res = item.data;
                                res.data.forEach(stu=>{
                                    let student:StudentPara = {
                                        userid:stu.STU_NO,
                                        username:stu.STU_NAME,
                                        userschool:stu.SCHOOL_NAME
                                    };
                                    arr.push(student);
                                });
                                this.students = arr;
                            });
                            this.setStudentNum();
                        }
                        } c-var="uploader" url={LE.CONF.ajaxUrl.getExcelData} text="选择文件"
                                                 className='select-file-btn'/>
                        <span>(注:格式为xls)</span>
                        <span className="download">已上传<span c-var='number'>0名</span>学生</span>
                    </div>
                </div>
            </div>;
        return activityRadioWrapper;
    }

    constructor(para: IImportNameListPara) {
        super(para);
        this.initEvents.on();
    }

    private initEvents = (() => {
        let checkedEvent = (e) => {
            let target = e.target as HTMLFormElement,
                showOrHide = d.query('.showOrHide', this.wrapper);
            if (target.value === '是'){
                showOrHide.classList.remove('hide');
            }else{
                showOrHide.classList.add('hide')
            }

        };
        let downloadHandler = () => {
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
            new Modal({
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
            on: () => {
                d.on(this.wrapper, 'change', 'input[type="radio"]', checkedEvent);
                d.on(this.wrapper, 'click', '.download', downloadHandler);
            },
            off: () => {
                d.off(this.wrapper, 'change', 'input[type="radio"]', checkedEvent);
                d.off(this.wrapper, 'click', '.download', downloadHandler);
            }
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
    private setStudentNum() {
        let index = tools.isNotEmptyArray(this.students) ? this.students.length : 0;
        (this.innerEl.number as HTMLElement).innerText = index + '名';
    }

    private getRandomStr() {
        let str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        let pwd = '';
        for (let i = 0; i < 5; i++) {
            pwd += str.charAt(Math.floor(Math.random() * str.length));
        }
        return pwd;
    }

    set(num: number, students: StudentPara[]) {
        (d.query('input', d.queryAll('.radio-wrapper', this.wrapper)[num]) as HTMLFormElement).checked = true;
        if (num === 1) {
            d.query('.showOrHide', this.wrapper).classList.remove('hide');
            this.students = students;
        }
        this.setStudentNum();
    }

    get() {
        let index = this.values.indexOf((d.query('input.import-list:checked', this.wrapper)  as HTMLFormElement).value);
        let students = tools.isNotEmptyArray(this.students) ? this.students : [];
        return {
            activitiesList: index,
            activitieList: students
        };
    }

    set disabled(disabled:boolean){
        if (tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        (this.innerCom.uploader as LeUploadModule).disabled = disabled;
        this.innerEl.group.classList.toggle('disabled',disabled);
        this.innerEl.hide.classList.toggle('disabled',disabled);
    }

    get disabled(){
        return this._disabled;
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}