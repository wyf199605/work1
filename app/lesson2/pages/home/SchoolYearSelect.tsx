/// <amd-module name="SchoolYearSelect"/>

import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {SchoolYearItem} from "./SchoolYearItem";
import d = G.d;
import tools = G.tools;
import {Utils} from "../../common/utils";
import {LeRule} from "../../common/rule/LeRule";

interface DropItemPara {
    text?: string;
    value?: string;
}

export class SchoolYearSelect extends Component {
    private dropUrl: string;
    private first: boolean;
    static select_item: DropItemPara;

    protected wrapperInit(para: IComponentPara): HTMLElement {
        let loginData = JSON.parse(localStorage.getItem('loginData')),
            student_flag = loginData.filter((user) => {
                return user.NAME === 'student_flag';
            })[0];
        let items = null;
        if (parseInt(student_flag.VALUE) === 0) {
            // 教师
            items = <div className="school-year-items">
                <SchoolYearItem c-var="student" className="student" icon="seclesson-xuesheng"/>
                <SchoolYearItem c-var="course" className="lesson" icon="seclesson-kecheng"/>
                <SchoolYearItem c-var="ctr" className="ctr" icon="seclesson-zhengshu"/>
            </div>;
        } else {
            // 学生
            items = <div className="school-year-items">
                <SchoolYearItem c-var="student" className="student" icon="seclesson-xuesheng"/>
                <SchoolYearItem c-var="course" className="lesson" icon="seclesson-huodongguanli-mianxing1"/>
                <SchoolYearItem c-var="ctr" className="ctr" icon="seclesson-zhengshu"/>
            </div>;
        }
        let schoolYearWrapper = <div className="school-year-module">
            <div className="title school-year-title">
                <span className="caption"/>
                <SelectInput dropClassName="selectYear" onSet={listItem => {
                    !!!this.first && LeRule.Ajax.fetch(this.dropUrl + '&school_year=' + listItem.text).then(({response}) => {
                        if (tools.isNotEmpty(response.data)){
                            if (tools.isNotEmpty(response.data.dataList)){
                                (this.innerCom.student as SchoolYearItem).set(response.data.dataList[0]);
                                (this.innerCom.course as SchoolYearItem).set(response.data.dataList[1]);
                                (this.innerCom.ctr as SchoolYearItem).set(response.data.dataList[2]);
                            }else{
                                (this.innerCom.student as SchoolYearItem).set({});
                                (this.innerCom.course as SchoolYearItem).set({});
                                (this.innerCom.ctr as SchoolYearItem).set({});
                            }
                            d.query('.title .caption', this.wrapper).innerText = response.data.caption;
                        }else{
                            (this.innerCom.student as SchoolYearItem).set({});
                            (this.innerCom.course as SchoolYearItem).set({});
                            (this.innerCom.ctr as SchoolYearItem).set({});
                            d.query('.title .caption', this.wrapper).innerText = '';
                        }
                    });
                    SchoolYearSelect.select_item = listItem;
                }} arrowIcon="seclesson-xiala" arrowIconPre="sec" c-var="drop"/>
            </div>
            {items}
        </div>;
        return schoolYearWrapper;
    }

    constructor(para: IComponentPara) {
        super(para);
        this.first = true;
    }

    set(sdata) {
        this.first = true;
        d.query('.title .caption', this.wrapper).innerText = sdata.caption;
        let drop = this.innerCom.drop as SelectInput,
            dropData = Utils.getDropDownList_Obj(sdata.querier.list.dataList);
        drop.setPara({
            data: dropData
        });
        this.dropUrl = LE.CONF.siteUrl + sdata.querier.link;
        let value = dropData.filter((dr) => {
            return dr.text === sdata.querier.defaultStr;
        })[0].value;
        SchoolYearSelect.select_item = {
            value: value,
            text: sdata.querier.defaultStr
        };
        drop.set(SchoolYearSelect.select_item);
        this.first = false;
        (this.innerCom.student as SchoolYearItem).set(sdata.data[0]);
        (this.innerCom.course as SchoolYearItem).set(sdata.data[1]);
        (this.innerCom.ctr as SchoolYearItem).set(sdata.data[2]);
    }

    destroy() {
        super.destroy();
        (this.innerCom.drop as SelectInput).destroy();
    }
}