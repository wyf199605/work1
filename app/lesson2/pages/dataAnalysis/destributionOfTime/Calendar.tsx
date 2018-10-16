/// <amd-module name="Calendar"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;

export class Calendar extends Component {
    protected wrapperInit(para: IComponentPara): HTMLElement {
        let calendarWrapper = <div className="left-content">
            <div className="statistics">
                <div className="item forenoon">
                    <div className="time">上午</div>
                    <div className="num"></div>
                </div>
                <div className="item afternoon">
                    <div className="time">下午</div>
                    <div className="num"></div>
                </div>
                <div className="item night">
                    <div className="time">晚上</div>
                    <div className="num"></div>
                </div>
            </div>
            <div className="detail">
                <div className="week">
                    <div className="week-item">周一</div>
                    <div className="week-item">周二</div>
                    <div className="week-item">周三</div>
                    <div className="week-item">周四</div>
                    <div className="week-item">周五</div>
                    <div className="week-item">周六</div>
                    <div className="week-item">周日</div>
                </div>
                <div c-var="calendar" className="calendar">

                </div>
            </div>
        </div>;
        return calendarWrapper;
    }

    constructor(para: IComponentPara) {
        super(para);
    }

    set(cdata: obj, year, month) {
        let calendarWrapper = this.innerEl.calendar;
        calendarWrapper.innerHTML = '';
        let timeArr = [],
            canData = cdata.data,
            forenoonNum = 0,
            afternoonNum = 0,
            nightNum = 0;
        // 把时间戳转化为时间字符串
        tools.isNotEmpty(canData) && canData.forEach((item) => {
            timeArr.push(this.formatTime(item[0]));
        });
        let compareDate = new Date(year, month - 1, 1),// 对比时间
            date = new Date(year, month - 1, 1),
            week = date.getDay() === 0 ? 7 : date.getDay(), // 本月1号是周几
            days = this.getDaysNum(year, month), // 当前月份的天数
            startDate = new Date(date.setDate(-week + 2)),//开始月份
            rowsNum = 6;
        if (days <= 29) {
            rowsNum = 5;
            if (days === 28 && startDate.getMonth() === compareDate.getMonth()) {
                rowsNum = 4;
            }
        } else {
            if (startDate.getMonth() === compareDate.getMonth()) {
                rowsNum = 5;
            }
        }
        for (let i = 0; i < rowsNum; i++) {
            if (startDate.getMonth() === compareDate.getMonth() + 1) {
                break;
            }
            for (let j = 0; j < 7; j++) {
                let daysWrapper = null;
                if (startDate.getMonth() === compareDate.getMonth()) {
                    let content = null,
                        curDate = (startDate.getMonth() + 1) + '-' + startDate.getDate();
                    if (timeArr.length === 0) {
                        content = <div className="no-record current-month">无记录</div>;
                    } else {
                        content = <div className="no-record current-month">无记录</div>;
                        for (let k = 0; k < timeArr.length; k++) {
                            if (timeArr[k] === curDate) {
                                content = <div className="courseContent">
                                    <div>上午 : <span>{canData[k][1]}</span></div>
                                    <div>下午 : <span>{canData[k][2]}</span></div>
                                    <div>晚上 : <span>{canData[k][3]}</span></div>
                                </div>;
                                forenoonNum += parseInt(canData[k][1]);
                                afternoonNum += parseInt(canData[k][2]);
                                nightNum += parseInt(canData[k][3]);
                                break;
                            }
                        }
                    }
                    daysWrapper = <div
                        className={'day'}>
                        <div className="day-num">{startDate.getDate()}</div>
                        {content}
                    </div>;
                } else {
                    daysWrapper = <div
                        className={'day'}>
                        <div className="no-record">无记录</div>
                    </div>;
                }
                calendarWrapper.appendChild(daysWrapper);
                startDate.setDate(startDate.getDate() + 1);
            }
        }
        this.setStatistics([forenoonNum, afternoonNum, nightNum]);
    }

    private getDaysNum(year: number, month: number) {
        let de = new Date(year, month, 0);
        return de.getDate();
    }

    private setStatistics(arr: number[]) {
        let nums = d.queryAll('.num', d.query('.statistics', this.wrapper));
        nums.forEach((num, i) => {
            num.innerText = arr[i].toString()
        })
    }

    private formatTime(time: number) {
        let date = new Date(time * 1000);
        return (date.getMonth() + 1) + '-' + date.getDate();
    }

    private getDate(index: number, time: number) {
        let date = new Date(time + index * 24 * 60 * 60 * 1000),
            week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return (date.getMonth() + 1) + '-' + date.getDate() + ' ' + week[date.getDay()];
    }

}