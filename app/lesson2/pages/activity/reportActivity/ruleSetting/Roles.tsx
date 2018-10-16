/// <amd-module name="Roles"/>

import Component = G.Component;
import {LeRolePara, RoleModule} from "./RoleModule";
import IComponentPara = G.IComponentPara;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import {Button} from "../../../../../global/components/general/button/Button";
import {FastTable} from "../../../../../global/components/newTable/FastTable";
import {LeRule} from "../../../../common/rule/LeRule";
import {ControllerTypePara, StudentPara} from "../ReportActivityData";
import {ReportActivityPage} from "../ReportActivityPage";

export interface RolesPara {
    controllerType?: ControllerTypePara;
    controller?: StudentPara[];
    organizerType?: ControllerTypePara;
    organizer?: StudentPara[];
    participantType?: ControllerTypePara;
    participant?: StudentPara[];
}

export class Roles extends Component {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        let roleWrapper = <div className="row select-role">
            <RoleModule c-var="controller" isMutil={true} title="选择角色" roleName="管理者"/>
            <RoleModule c-var="organizer" isMutil={false} title="" roleName="组织者"/>
            <RoleModule c-var="participant" className="participant" isMutil={false} title="" roleName="参与者"/>
            <div className="role-item viewCredit" c-var='look'>
                <div className="lesson-label"/>
                <div className="mutil-select"/>
                <Button content="查看积分" className="addBtn look" onClick={() => {
                    let activityLevel = ReportActivityPage.reportData.activityLevel,
                        platformCategory = ReportActivityPage.reportData.platformCategory,
                        activitycategory = ReportActivityPage.reportData.activityCategory;
                    let paramsData = {},
                        contorller = (this.innerCom.controller as RoleModule).get(),
                        organizer = (this.innerCom.organizer as RoleModule).get(),
                        participant = (this.innerCom.participant as RoleModule).get();
                    if (tools.isNotEmpty(contorller)) {
                        paramsData['controllerType'] = (contorller as LeRolePara).type;
                    }
                    if (tools.isNotEmpty(organizer)) {
                        paramsData['organizerType'] = (organizer as LeRolePara).type;
                    }
                    if (tools.isNotEmpty(participant)) {
                        paramsData['participantType'] = (participant as LeRolePara).type;
                    }
                    LeRule.Ajax.fetch(tools.url.addObj(LE.CONF.ajaxUrl.lookIntegral, {
                        activitycategory: activitycategory,
                        activitylevel: activityLevel,
                        platformcategory: platformCategory
                    }), {
                        type: 'POST',
                        data: JSON.stringify(paramsData)
                    }).then(({response}) => {
                        let body = <div/>;
                        let modal = new Modal({
                            header: {
                                title: response.data.caption
                            },
                            isAdaptiveCenter: true,
                            width: '60%',
                            height: '500px',
                            body: body,
                            className: 'table-modal'
                        });
                        let cols = [];
                        response.data.sysFieldsList.forEach((colObj) => {
                            let col = {
                                name: colObj.field,
                                title: colObj.caption
                            };
                            cols.push(col);
                        });
                        let table = new FastTable({
                            container: body,
                            cols: [cols],
                            data: response.data.data
                        });
                    });
                }}/>
                <Button className="nextBtn downloadTemplate" onClick={()=>{
                    window.open(LE.CONF.ajaxUrl.downloadTem);
                }} content="名单模板下载"/>
            </div>
        </div>;
        return roleWrapper;
    }

    constructor(para: IComponentPara) {
        super(para);
    }


    set disabled(disabled: boolean) {
        if (tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        (this.innerCom.controller as RoleModule).disabled = disabled;
        (this.innerCom.organizer as RoleModule).disabled = disabled;
        (this.innerCom.participant as RoleModule).disabled = disabled;
        this.innerEl.look.classList.toggle('disabled',disabled);
    }

    get disabled() {
        return this._disabled;
    }

    set(data: RolesPara) {
        if (!tools.isEmpty(data.controller) || !tools.isEmpty(data.controllerType)) {
            (this.innerCom.controller as RoleModule).set({
                students: data.controller,
                type: data.controllerType
            })
        }
        if (!tools.isEmpty(data.organizer) || !tools.isEmpty(data.organizerType)) {
            (this.innerCom.organizer as RoleModule).set({
                students: data.organizer,
                type: data.organizerType
            })
        }
        if (!tools.isEmpty(data.participant) || !tools.isEmpty(data.participantType)) {
            (this.innerCom.participant as RoleModule).set({
                students: data.participant,
                type: data.participantType
            })
        }
    }

    get() {
        let contorller = (this.innerCom.controller as RoleModule).get();
        if (contorller === false) {
            return false;
        }
        let organizer = (this.innerCom.organizer as RoleModule).get();
        if (organizer === false) {
            return false;
        }
        let participant = (this.innerCom.participant as RoleModule).get();
        if (participant === false) {
            return false;
        }
        if (G.tools.isEmpty(contorller) && G.tools.isEmpty(organizer) && G.tools.isEmpty(participant)) {
            Modal.alert('请至少选择一个角色!');
            return false;
        }

        return {
            organizer: organizer,
            contorller: contorller,
            participant: participant
        }
    }

    destroy() {
        super.destroy();
    }
}