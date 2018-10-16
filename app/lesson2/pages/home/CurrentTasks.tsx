/// <amd-module name="CurrentTasks"/>
import d = G.d;
import tools = G.tools;
import IComponentPara = G.IComponentPara;
import Component = G.Component;

interface ICurrentTasksPara extends IComponentPara {
    taskData?: obj;
}

export class CurrentTasks extends Component {

    private tasksNum: number; // 任务数量

    protected wrapperInit(para: ICurrentTasksPara): HTMLElement {
        let currentTasksWrapper = <div className="current-tasks">
            <div className="title">
                <span className="caption"/>
                <div className="slider-btn">
                        <span
                            className="toggle-btn disabled prev sec seclesson-zuojiantou hide"/>
                    <span
                        className="toggle-btn next sec seclesson-youjiantou hide"/>
                </div>
            </div>
            <div className="tasks-items">

            </div>
        </div>;
        return currentTasksWrapper;
    }

    constructor(para: ICurrentTasksPara) {
        super(para);
        this.toggleTaskEvent.on();
    }

    set(tdata) {
        let tasks = tdata.data.filter(task => {
            return task.COUNT > 0;
        });
        if (tasks.length > 5) {
            d.queryAll('.slider-btn span').forEach(span => {
                span.classList.remove('hide');
            })
        }
        this.tasksNum = tasks.length;
        let tasksWrapper = d.query('.tasks-items', this.wrapper),
            caption = d.query('.title .caption', this.wrapper);
        caption.innerText = tdata.caption;
        let colorArr = ['check', 'auth', 'doing'];
        tools.isNotEmpty(tasks) && tasks.forEach((task) => {
            let random = Math.floor(Math.random() * 3);
            let url = '#/lesson2/home';
            if (tools.isNotEmpty(task.LINK)){
                url = '#/lesson2/common?url=' + task.LINK;
            }
            let taskHTML = <div className="task-item-out-wrapper">
                <div className="task-item" date-item={task.ITEMID}>
                    <a href={url}>
                        <span className={'bold-text ' + colorArr[random]}>{task.COUNT}</span>
                        <span className="task-gray-text">{task.CAPTION}</span>
                    </a>
                </div>
            </div>;
            tasksWrapper.appendChild(taskHTML);
        });
    }

    private toggleTaskEvent = (() => {
        let index = 0; // 当前页数
        let translateTasks = (isNext: Boolean) => {
            let tasksWrapper = d.query('.tasks-items', this.wrapper);
            if (isNext) {
                let lastNumber = Number(this.tasksNum) - 5 * index;// 剩余项目的个数
                tasksWrapper.style.transform = `translateX(${-((index - 1) * 5 + lastNumber) * 20}%) translateZ(0)`;
            } else {
                tasksWrapper.style.transform = `translateX(${-(index * 5) * 20}%) translateZ(0)`;
            }
        };
        let checkDisabled = () => {
            if (index === 0) {
                d.query('span.prev', this.wrapper).classList.add('disabled');
                d.query('span.next', this.wrapper).classList.remove('disabled');
            } else if (index === Math.ceil(this.tasksNum / 5) - 1) {
                d.query('span.next', this.wrapper).classList.add('disabled');
                d.query('span.prev', this.wrapper).classList.remove('disabled');
            } else {
                d.query('span.prev', this.wrapper).classList.remove('disabled');
                d.query('span.next', this.wrapper).classList.remove('disabled');
            }
        };
        let toggleTask = (e) => {
            let target = d.closest(e.target, '.toggle-btn'),
                isNext = true;
            if (target.classList.contains('next')) {
                index += 1;
            } else {
                isNext = false;
                index -= 1;
            }
            checkDisabled();
            translateTasks(isNext);
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.slider-btn span', toggleTask),
            off: () => d.off(this.wrapper, 'click', '.slider-btn span', toggleTask),
        }
    })();

    destroy() {
        super.destroy();
        this.tasksNum = 0;
        this.toggleTaskEvent.off();
    }
}