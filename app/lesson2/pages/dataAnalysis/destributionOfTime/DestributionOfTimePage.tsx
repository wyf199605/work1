/// <amd-module name="DestributionOfTimePage"/>
import SPAPage = G.SPAPage;
import {SelectInput} from "../../../../global/components/form/selectInput/selectInput";
import {Calendar} from "./Calendar";
import tools = G.tools;
import {LeRule} from "../../../common/rule/LeRule";

export class DestributionOfTimePage extends SPAPage {
    set title(t: string) {
        this._title = t;
    }

    get titlt() {
        return this._title;
    }

    private year: SelectInput;
    private month: SelectInput;
    private calendar: Calendar;

    private isFirst:boolean;
    protected wrapperInit(): Node {
        let destributionOfTimeHTML = <div className="destribution-of-time">
            <div className="title">平台课程分析</div>
            <div className="content">
                {this.calendar = <Calendar/>}
                <div className="right-content">
                    <div className="select-date">
                        <span className="text">请选择查询日期</span>
                        {
                            this.year = <SelectInput onSet={(value) => {
                            let y = new Date().getFullYear(),
                                monthArr = [];
                            if (value.text.indexOf(y.toString()) >= 0) {
                                monthArr = this.getMonth(true);
                            } else {
                                monthArr = this.getMonth(false);
                            }
                            this.month.setPara({data: monthArr});
                            let lastMonth = monthArr[monthArr.length - 1],
                                lastMonthNum = parseInt(lastMonth.substr(0, lastMonth.length - 1));
                            if (tools.isEmpty(this.month.get())) {
                                this.month.set(lastMonth);
                            } else {
                                let selectMonth = this.month.get(),
                                    selectMonthNum = parseInt(selectMonth.substr(0, selectMonth.length - 1));
                                if (lastMonthNum < selectMonthNum) {
                                    this.month.set(lastMonth);
                                } else {
                                    // 选项改变，数据改变
                                    !this.isFirst && this.getCalendarData();
                                }
                            }
                        }} dropClassName="select-date" arrowIcon="seclesson-xiala" arrowIconPre="sec"/>}
                        {this.month =
                            <SelectInput useInputVal={true} dropClassName="select-date" arrowIcon="seclesson-xiala"
                                         arrowIconPre="sec" onSet={() => {
                                !this.isFirst && this.getCalendarData();
                            }}/>}
                    </div>
                    <div className="introduce">
                        <span className="text">月份课程分布数据</span>
                        <div>
                            <span>统计介绍</span>
                            <div>这是平台上，每个月份的所有开课数据统计详情，以时间阶段：活动时间07:00-12:00为上午；12:00-18:00为下午；18:00-07:00为晚上，首页可以快速查看当前星期的课程分布。</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
        this.isFirst = true;
        let years = this.getYears();
        this.year.setPara({data: years});
        this.year.set(years[years.length - 1]);
        return destributionOfTimeHTML;
    }

    protected init(para: Primitive[], data?) {
        let yearStr = this.year.get(),
            year = yearStr.substr(0, yearStr.length - 1),
            monthStr = this.month.get(),
            month = monthStr.substr(0, monthStr.length - 1);
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.activityTime).then(({response}) => {
            this.calendar.set(response.data, year, month);
            this.isFirst = false;
        })
    }

    private getCalendarData(){
        let yearStr = this.year.get(),
            year = yearStr.substr(0, yearStr.length - 1),
            monthStr = this.month.get(),
            month = monthStr.substr(0, monthStr.length - 1);
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.delener + `?home_year=${year}&home_month=${month}`).then(({response}) => {
            this.calendar.set(response.data, year, month);
        })
    }

    private getYears(): string[] {
        let yearArr = [], startDate = new Date(2013, 1, 1), year = 2013;
        while (year <= new Date().getFullYear()) {
            yearArr.push(startDate.getFullYear() + '年');
            startDate = new Date(startDate.setFullYear(year += 1));
        }
        return yearArr;
    }

    private getMonth(isCurrentYear: boolean): string[] {
        if (isCurrentYear) {
            let month = new Date().getMonth() + 1,
                monthArr = [];
            for (let i = 0; i < month; i++) {
                monthArr.push((i + 1) + '月');
            }
            return monthArr
        } else {
            return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }
    }
}