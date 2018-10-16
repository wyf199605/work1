/// <amd-module name="WeekCourse"/>
import d = G.d;
import tools = G.tools;
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import SPA = G.SPA;

interface IWeekCoursePara extends IComponentPara {

}

export class WeekCourse extends Component {
    protected wrapperInit(para: IWeekCoursePara): HTMLElement {
        let weekCourseWrapper = <div className="week-course">
            <div className="title"></div>
            <div className="course-table">
                <div className="table-col first-col">
                    <div className="table-title table-th">日期</div>
                    <div className="table-title table-cell">上午</div>
                    <div className="table-title table-cell">下午</div>
                    <div className="table-title table-cell">晚上</div>
                </div>
            </div>
        </div>;
        return weekCourseWrapper;
    }

    constructor(para: IWeekCoursePara) {
        super(para);
        this.initEvents.on();
    }

    private initEvents = (() => {
        let queryDetail = (e) => {
            let target = d.closest(e.target, '.queryDetail');
            let startTime = target.dataset.start,
                endTime = target.dataset.end;
            let time = JSON.stringify({
                START_TIME: startTime,
                END_TIME: endTime
            });
            SPA.open(SPA.hashCreate('lesson2', 'common', {
                url: this.url,
                query: time
            }));
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.queryDetail', queryDetail),
            off: () => d.off(this.wrapper, 'click', '.queryDetail', queryDetail)
        }
    })();

    private addClass(courNum: number): string {
        if (courNum > 0) {
            return 'has-course';
        } else {
            return '';
        }
    }

    private url: string;

    set(courses: obj) {
        this.url = courses.link; // url地址
        let caption = courses.caption;
        d.query('.title', this.wrapper).innerText = caption.split('（')[0];
        d.query('.title', this.wrapper).appendChild(<span>{caption.split('（')[1].split('）')[0]}</span>);
        let cs = courses.data,
            coursesWrapper = d.query('.course-table', this.wrapper);
        let timeArr = [];
        // 把时间戳转化为时间字符串
        tools.isNotEmpty(cs) && cs.forEach((course) => {
            timeArr.push(this.formatTime(course[0]));
        });
        let curDate = new Date(),
            day = curDate.getDay(),
            date = curDate.getDate();
        day = day === 0 ? 7 : day;
        let firstDate = new Date(curDate.setDate(date - day + 1)).getTime();
        if (timeArr.length === 0) {
            for (let i = 0; i < 7; i++) {
                let date = this.getDate(i, firstDate);
                let courWrapper = <div className="table-col">
                    <div className="table-th">{date}</div>
                    <div className='table-cell'>{0}</div>
                    <div className='table-cell'>{0}</div>
                    <div className='table-cell'>{0}</div>
                </div>;
                coursesWrapper.appendChild(courWrapper);
            }
        } else {
            for (let i = 0; i < 7; i++) {
                let date = this.getDate(i, firstDate);
                let currentCS = [];
                for (let i = 0; i < timeArr.length; i++) {
                    if (timeArr[i] === date) {
                        currentCS = cs[i];
                        break;
                    }
                }
                let courWrapper = null;
                if (tools.isNotEmpty(currentCS)) {
                    courWrapper = this.getTableCell(currentCS, date);
                } else {
                    courWrapper = <div className="table-col">
                        <div className="table-th">{date}</div>
                        <div className={'table-cell'}>0</div>
                        <div className={'table-cell'}>0</div>
                        <div className={'table-cell'}>0</div>
                    </div>;
                }
                coursesWrapper.appendChild(courWrapper);
            }
        }
    }

    private getTableCell(currentCS: string | number[], date: string) {
        let a = Number(currentCS[1]), b = Number(currentCS[2]), c = Number(currentCS[3]);
        let dateStr = this.formatTime(Number(currentCS[0]), false);
        let currentWrapper = <div className="table-col">
            <div className="table-th">{date}</div>
            {a === 0 ? <div className='table-cell'>0</div> :
                <div className='table-cell has-course queryDetail' data-start={dateStr + '  07:00'}
                     data-end={dateStr + '  12:00'}>{a}</div>}
            {b === 0 ? <div className='table-cell'>0</div> :
                <div className='table-cell has-course queryDetail' data-start={dateStr + '  12:00'}
                     data-end={dateStr + '  18:00'}>{b}</div>}
            {c === 0 ? <div className='table-cell'>0</div> :
                <div className='table-cell has-course queryDetail' data-start={dateStr + '  18:00'}
                     data-end={dateStr + '  23:59'}>{c}</div>}
        </div>;
        return currentWrapper;
    }

    private formatTime(time: number, hasWeek = true) {
        let date = new Date(time * 1000),
            week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return hasWeek === true ? (date.getMonth() + 1) + '-' + date.getDate() + ' ' + week[date.getDay()] : date.getFullYear() + '-' + this.handleNum(date.getMonth() + 1) + '-' + this.handleNum(date.getDate());
    }

    private handleNum(num: Number): String {
        return num < 10 ? '0' + num : num.toString();
    }

    private getDate(index: number, time: number) {
        let date = new Date(time + index * 24 * 60 * 60 * 1000),
            week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return (date.getMonth() + 1) + '-' + date.getDate() + ' ' + week[date.getDay()];
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}