/// <amd-module name="HomePage"/>

import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import {SchoolYearSelect} from "./SchoolYearSelect";
import {CurrentTasks} from "./CurrentTasks";
import {HomeNotice} from "./HomeNotice";
import {WeekCourse} from "./WeekCourse";
import {LeRule} from "../../common/rule/LeRule";

export class HomePage extends SPAPage {
    set title(t: string) {
        this._title = t;
    }

    get titlt() {
        return this._title;
    }

    protected wrapperInit() {
        return <div className="homePage">
            <div className="module1">
                <div className="m1-left"/>
                <div className="m1-right"/>
            </div>
            <div className="module2"/>
        </div>;
    }

    private staticsSchool:SchoolYearSelect;
    protected init(para: Primitive[], data?) {
        // 学年选择
        let statics = new SchoolYearSelect({
            container: d.query('.m1-left', this.wrapper)
        });

        this.staticsSchool = statics;

        // 当前任务
        let task = new CurrentTasks({
            container: d.query('.m1-left', this.wrapper)
        });

        // 公告
        let notice = new HomeNotice({
            container: d.query('.m1-right', this.wrapper)
        });

        // 课程
        let weekCourse = new WeekCourse({
            container: d.query('.module2', this.wrapper)
        });

        // 首页数据
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.home).then(({response}) => {
            tools.isNotEmpty(response.data) && statics.set(response.data.statics);
            tools.isNotEmpty(response.data) && task.set(response.data.task);
            tools.isNotEmpty(response.data) && notice.set(response.data.inform);
            tools.isNotEmpty(response.data) && weekCourse.set(response.data.calendar);
        });
    }

    destroy(){
        super.destroy();
        this.staticsSchool.destroy();
    }
}