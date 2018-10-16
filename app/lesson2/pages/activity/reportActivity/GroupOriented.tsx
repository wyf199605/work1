/// <amd-module name="GroupOriented"/>

import tools = G.tools;

import {GroupCheckModule} from "./groupOriented/GroupCheckModule";
import {GroupRadioModule} from "./groupOriented/GroupRadioModule";
import {Button} from "../../../../global/components/general/button/Button";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {ReportActivityPage} from "./ReportActivityPage";
import {LeRule} from "../../../common/rule/LeRule";
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {MajorPara, ObjectSettingPara} from "./ReportActivityData";
import SPA = G.SPA;
import {buttonAction} from "../../../modules/LeButton/LeButtonGroup";

interface IGroupOrientedPara extends IComponentPara {
    isNotShow?: boolean;
    preStepHandler?: () => void;
}

export class GroupOriented extends Component {
    protected wrapperInit(para: IGroupOrientedPara): HTMLElement {
        let groupOrientedWrapper = <div className="groupOriented">
            <GroupCheckModule c-var="college" title="面向学院" clickHandle={(id, isCheck) => {
                let getData = () => {
                    let college = this.innerCom.college as GroupCheckModule,
                        major = this.innerCom.major as GroupCheckModule,
                        clbum = this.innerCom.clbum as GroupCheckModule,
                        grade = this.innerCom.grade as GroupCheckModule;
                    if (id === '0') {
                        if (isCheck === true) {
                            major.set([]);
                            major.setCheckedValue(['0']);
                            // clbum.setCheckedValue(['0']);
                            // clbum.disabled = true;
                        } else {
                            major.setCheckedValue([]);
                            // clbum.setCheckedValue([]);
                            // clbum.disabled = false;
                        }
                    } else {
                        let collegeValues = college.getCheckedValue(),
                            majorValues = major.getCheckedValue();
                        // gradeValues = grade.getCheckedValue(),
                        // clbumValues = clbum.getCheckedValue();
                        this.getMajor(collegeValues).then((res) => {
                            if (tools.isEmpty(res)) {
                                major.set([]);
                                major.setSelectAll();
                            } else {
                                major.set(res);
                                major.setCheckedValue(majorValues);
                            }
                        });
                        // this.getClbum(majorValues, gradeValues).then((res) => {
                        //     if (tools.isEmpty(res)) {
                        //         clbum.set([]);
                        //         clbum.setSelectAll();
                        //     } else {
                        //         clbum.set(res);
                        //         clbum.setCheckedValue(clbumValues);
                        //     }
                        // })
                    }
                };
                let func = tools.pattern.debounce(getData, 30);
                func();
            }}/>
            <GroupCheckModule c-var="major" title="面向专业" clickHandle={(id, ischeck) => {
                let getData = () => {
                    let major = this.innerCom.major as GroupCheckModule,
                        clbum = this.innerCom.clbum as GroupCheckModule,
                        grade = this.innerCom.grade as GroupCheckModule;
                    let majorValues = major.getCheckedValue(),
                        gradeValues = grade.getCheckedValue(),
                        clbumValues = clbum.classGetCheckedValue();
                    this.getClbum(majorValues, gradeValues).then((res) => {
                        if (tools.isEmpty(res)) {
                            clbum.set([]);
                        } else {
                            clbum.set(res);
                            clbum.setCheckedValue(clbumValues);
                        }
                        if (id === '0') {
                            if (ischeck === true && grade.getIsSelectFirst()) {
                                clbum.setSelectAll();
                            }
                        }
                    })
                };
                let func = tools.pattern.debounce(getData, 30);
                func();
            }}/>
            <GroupCheckModule c-var="clbum" title="面向班级"/>
            <GroupCheckModule c-var="grade" title="面向年级" clickHandle={(id, ischeck) => {
                let getData = () => {
                    let major = this.innerCom.major as GroupCheckModule,
                        clbum = this.innerCom.clbum as GroupCheckModule,
                        grade = this.innerCom.grade as GroupCheckModule,
                        majorValues = major.getCheckedValue(),
                        gradeValues = grade.getCheckedValue(),
                        clbumValues = clbum.classGetCheckedValue();

                    this.getClbum(majorValues, gradeValues).then((res) => {
                        if (tools.isEmpty(res)) {
                            clbum.set([]);
                        } else {
                            clbum.set(res);
                            clbum.setCheckedValue(clbumValues);
                        }
                        if (id === '0') {
                            if (ischeck === true && major.getIsSelectFirst()) {
                                clbum.setSelectAll();
                            }
                        }
                    })
                };
                let func = tools.pattern.debounce(getData, 30);
                func();
            }}/>
            <GroupRadioModule c-var="otherCollege" title="其他学院" value={['不限制', '允许报名但不给成绩', '不允许报名']}
                              field="otherCollege"/>
            <GroupRadioModule c-var="otherMajor" title="其他专业" value={['不限制', '允许报名但不给成绩', '不允许报名']} field="otherMajor"/>
            <GroupRadioModule c-var="otherClass" title="其他班级" value={['不限制', '允许报名但不给成绩', '不允许报名']} field="otherClass"/>
            <GroupRadioModule c-var="otherGrade" title="其他年级" value={['不限制', '允许报名但不给成绩', '不允许报名']} field="otherGrade"/>
            <div className="row btns">
                <div className="lesson-form-group">
                    <Button content="上一步" onClick={function () {
                        para.preStepHandler();
                    }} className="preBtn nextBtn"/>
                    <Button c-var="publish" content="发布" className="publish addBtn" onClick={() => {
                        let isValidate = this.get();
                        if (!!isValidate) {
                            let para = ReportActivityPage.reportData.get(),
                                type = 'PUT';
                            if (ReportActivityPage.state === '不通过' || ReportActivityPage.state === '草稿') {
                                para.baseInfo.activity['activityId'] = ReportActivityPage.activityId;
                                type = 'POST';
                            }
                            LeRule.Ajax.fetch(LE.CONF.ajaxUrl.activityDetail + '?activity_status_id=1', {
                                type: type,
                                data: para
                            }).then(({response}) => {
                                Modal.toast(response.msg);
                                buttonAction.btnRefresh(3);
                            })
                        }
                    }}/>
                    <Button content="保存为草稿" onClick={() => {
                        let isValidate = this.get();
                        if (!!isValidate) {
                            let para = ReportActivityPage.reportData.get(),
                                type = 'POST',
                                url = LE.CONF.ajaxUrl.activityDetail;
                            if (ReportActivityPage.state === '新增') {
                                type = 'PUT';
                                url = url + '?activity_status_id=7';
                            } else {
                                para.baseInfo.activity['activityId'] = ReportActivityPage.activityId;
                            }
                            LeRule.Ajax.fetch(url, {
                                type: type,
                                data: para
                            }).then(({response}) => {
                                Modal.toast(response.msg);
                                buttonAction.btnRefresh(3);
                            })
                        }
                    }} className="publish addBtn" c-var="save" />
                </div>
            </div>
        </div>;
        return groupOrientedWrapper;
    }

    constructor(para: IGroupOrientedPara) {
        super(para);
        this.isShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
    }

    private isShowPublishButton() {
        let states = ['不通过', '草稿', '新增'];
        if (states.indexOf(ReportActivityPage.state) >= 0) {
            (this.innerCom.publish as Button).isShow = true;
        } else {
            (this.innerCom.publish as Button).isShow = false;
        }
        let statesTitle = ['报名中','进行中','待开展','已结束','不通过'];
        if (statesTitle.indexOf(ReportActivityPage.state) >= 0){
            (this.innerCom.save as Button).content = '提交';
        }else{
            if(ReportActivityPage.state === '草稿'){
                (this.innerCom.save as Button).content = '保存';
            }
        }
    }

    set disabled(dis: boolean) {
        if (tools.isEmpty(dis)) {
            return;
        }
        this._disabled = dis;
        (this.innerCom.otherCollege as GroupRadioModule).disabled = dis;
        (this.innerCom.otherMajor as GroupRadioModule).disabled = dis;
        (this.innerCom.otherGrade as GroupRadioModule).disabled = dis;
        (this.innerCom.otherClass as GroupRadioModule).disabled = dis;
        (this.innerCom.major as GroupCheckModule).disabled = dis;
        (this.innerCom.clbum as GroupCheckModule).disabled = dis;
        (this.innerCom.grade as GroupCheckModule).disabled = dis;
        (this.innerCom.college as GroupCheckModule).disabled = dis;
    }

    get disabled() {
        return this._disabled;
    }

    private _isShow: boolean;
    set isShow(show: boolean) {
        this._isShow = show;
        this.wrapper.classList.toggle('hide', show);
    }

    get isShow() {
        return this._isShow;
    }

    private handlerData(cd: string[][]) {
        let resultArr = [];
        cd.forEach((arr) => {
            let obj = {
                ID: '',
                NAME: ''
            };
            arr.forEach((str, index) => {
                if (index === 0) {
                    obj.ID = str;
                } else {
                    obj.NAME = str;
                }
            });
            resultArr.push(obj);
        });
        return resultArr;
    }

    private getMajor(values): Promise<string[][]> {
        let val = [];
        if (tools.isEmpty(values)) {
            val.push('')
        } else {
            let allStr = '';
            values.forEach((str, index) => {
                if (index === 0) {
                    allStr += str;
                } else {
                    allStr += `,${str}`;
                }
            });
            val.push(allStr);
        }
        let url = tools.url.addObj(LE.CONF.ajaxUrl.major, {
            queryparams0: JSON.stringify({
                not: false,
                op: 0,
                params: [{
                    not: false,
                    op: 2,
                    field: "sub_college_id",
                    values: val
                }]
            })
        });
        return new Promise((resolve, reject) => {
            LeRule.Ajax.fetch(url).then(({response}) => {
                resolve(this.handlerData(response.data.body.dataList));
            }).catch(() => {
                reject();
            })
        })
    }

    private getClbum(majorValues: string[], gradeValues: string[]): Promise<string[][]> {
        let valMajor = [];
        if (tools.isEmpty(majorValues)) {
            valMajor.push('')
        } else {
            let allStr = '';
            majorValues.forEach((str, index) => {
                if (index === 0) {
                    allStr += str;
                } else {
                    allStr += `,${str}`;
                }
            });
            valMajor.push(allStr);
        }
        let valGrade = [];
        if (tools.isEmpty(majorValues)) {
            valGrade.push('')
        } else {
            let allStr = '';
            gradeValues.forEach((str, index) => {
                if (index === 0) {
                    allStr += str;
                } else {
                    allStr += `,${str}`;
                }
            });
            valGrade.push(allStr);
        }
        let url = tools.url.addObj(LE.CONF.ajaxUrl.clbum, {
            queryparams0: JSON.stringify({
                not: false,
                op: 0,
                params: [{
                    not: false,
                    op: 2,
                    field: "major_id",
                    values: valMajor
                }, {
                    not: false,
                    op: 2,
                    field: "grade_name",
                    values: valGrade
                }]
            })
        });
        return new Promise((resolve, reject) => {
            LeRule.Ajax.fetch(url).then(({response}) => {
                resolve(this.handlerData(response.data.body.dataList));
            }).catch(() => {
                reject();
            })
        })
    }

    set(data: ObjectSettingPara) {
        this.isShowPublishButton();
        if (tools.isNotEmpty(data) && tools.isNotEmpty(data.object)) {
            (this.innerCom.otherCollege as GroupRadioModule).set(data.object.otherCollege);
            (this.innerCom.otherMajor as GroupRadioModule).set(data.object.otherMajor);
            (this.innerCom.otherGrade as GroupRadioModule).set(data.object.otherGrade);
            (this.innerCom.otherClass as GroupRadioModule).set(data.object.otherClass);
            let p1 = new Promise((resolve, reject) => {
                LeRule.Ajax.fetch(LE.CONF.ajaxUrl.colleges).then(({response}) => {
                    (this.innerCom.college as GroupCheckModule).set(this.handlerData(response.data.body.dataList));
                    resolve();
                }).catch(() => {
                    reject();
                });
            });
            let p2 = new Promise((resolve, reject) => {
                LeRule.Ajax.fetch(LE.CONF.ajaxUrl.grade).then(({response}) => {
                    (this.innerCom.grade as GroupCheckModule).set(this.handlerData(response.data.body.dataList));
                    resolve();
                }).catch(() => {
                    reject();
                });
            });
            Promise.all([p1, p2]).then(() => {
                let collegeData = this.getResultData(data.college),
                    majorData = this.getResultData(data.major),
                    clbumData = this.getResultData(data.clbum),
                    gradeData = this.getResultData(data.grade);
                this.getClbum(majorData, gradeData).then((res) => {
                    (this.innerCom.clbum as GroupCheckModule).set(res);
                    let states = ['草稿', '新增', '不通过'];
                    if (states.indexOf(ReportActivityPage.state) >= 0) {
                        this.disabled = false;
                    } else {
                        this.disabled = true;
                    }
                    if(data.object.limitMajor === 0 && data.object.limitGrade === 0){
                        (this.innerCom.clbum as GroupCheckModule).setSelectAll();
                    }else{
                        (this.innerCom.clbum as GroupCheckModule).setCheckedValue(clbumData);
                    }
                    if(data.object.limitCollege === 0){
                        (this.innerCom.college as GroupCheckModule).setSelectAll();
                        (this.innerCom.major as GroupCheckModule).setSelectAll();
                        if(data.object.limitGrade === 0){
                            (this.innerCom.grade as GroupCheckModule).setSelectAll();
                        }else{
                            (this.innerCom.grade as GroupCheckModule).setCheckedValue(gradeData);
                        }
                    }else{
                        (this.innerCom.college as GroupCheckModule).setCheckedValue(collegeData);
                        this.getMajor(collegeData).then((res) => {
                            (this.innerCom.major as GroupCheckModule).set(res);
                            let states = ['草稿', '新增', '不通过'];
                            if (states.indexOf(ReportActivityPage.state) >= 0) {
                                this.disabled = false;
                            } else {
                                this.disabled = true;
                            }
                            if(data.object.limitMajor === 0){
                                (this.innerCom.major as GroupCheckModule).setSelectAll();
                            }else{
                                (this.innerCom.major as GroupCheckModule).setCheckedValue(majorData);
                            }
                            if(data.object.limitGrade === 0){
                                (this.innerCom.grade as GroupCheckModule).setSelectAll();
                            }else{
                                (this.innerCom.grade as GroupCheckModule).setCheckedValue(gradeData);
                            }
                        });
                    }
                });
            })
        } else {
            LeRule.Ajax.fetch(LE.CONF.ajaxUrl.colleges).then(({response}) => {
                (this.innerCom.college as GroupCheckModule).set(this.handlerData(response.data.body.dataList));
            }).catch(() => {
            });
            LeRule.Ajax.fetch(LE.CONF.ajaxUrl.grade).then(({response}) => {
                (this.innerCom.grade as GroupCheckModule).set(this.handlerData(response.data.body.dataList));
            }).catch(() => {
            });
            let states = ['草稿', '新增', '不通过'];
            if (states.indexOf(ReportActivityPage.state) >= 0) {
                this.disabled = false;
            } else {
                this.disabled = true;
            }
        }
    }

    private getResultData(data: MajorPara[]) {
        let result = [];
        if (tools.isNotEmpty(data)) {
            data.forEach(d => {
                result.push(d.id);
            })
        }
        return result;
    }

    get() {
        let college = (this.innerCom.college as GroupCheckModule).get();
        if (college === false) {
            return false;
        }
        let major = (this.innerCom.major as GroupCheckModule).get();
        if (major === false) {
            return false;
        }
        let clbum = (this.innerCom.clbum as GroupCheckModule).get();
        if (clbum === false) {
            return false;
        }
        let grade = (this.innerCom.grade as GroupCheckModule).get();
        if (grade === false) {
            return false;
        }

        let otherCollege = (this.innerCom.otherCollege as GroupRadioModule).get();
        let otherMajor = (this.innerCom.otherMajor as GroupRadioModule).get();
        let otherClass = (this.innerCom.otherClass as GroupRadioModule).get();
        let otherGrade = (this.innerCom.otherGrade as GroupRadioModule).get();


        let limitCollege = college.limit,
            collegeData = college.array;
        ReportActivityPage.reportData.limitCollege = limitCollege;
        ReportActivityPage.reportData.college = collegeData;

        let limitMajor = major.limit,
            majorData = major.array;
        ReportActivityPage.reportData.limitMajor = limitMajor;
        ReportActivityPage.reportData.major = majorData;

        let limitGrade = grade.limit,
            gradeData = grade.array;
        ReportActivityPage.reportData.limitGrade = limitGrade;
        ReportActivityPage.reportData.grade = gradeData;

        let limitClass = clbum.limit,
            clbumData = clbum.array;
        ReportActivityPage.reportData.limitClass = limitClass;
        ReportActivityPage.reportData.clbum = clbumData;

        ReportActivityPage.reportData.otherClass = otherClass;
        ReportActivityPage.reportData.otherGrade = otherGrade;
        ReportActivityPage.reportData.otherMajor = otherMajor;
        ReportActivityPage.reportData.otherCollege = otherCollege;

        return true;
    }
}