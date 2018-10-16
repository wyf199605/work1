/// <amd-module name="BugList"/>
import IComponentPara = G.IComponentPara; import Component = G.Component;
import {BugReportModal} from "./BugReport";
import {DataManager} from "../../../global/components/DataManager/DataManager";
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import sys = BW.sys;
import d = G.d;
import tools = G.tools;


interface IBugListPara extends IComponentPara {
    ajaxUrl?: string;
    allowUpdate?: boolean;
}

export class BugList extends Component {

    static readonly BUGLISt_NOT_DATA_CLASS = 'buglist-nodata';

    protected wrapperInit(): HTMLElement {
        return <div className="bug-container"></div>;
    }

    private currentBugItemId: number;
    dataManager: DataManager;
    private allowUpdate: boolean;

    constructor(para: IBugListPara) {
        super();
        this.currentBugItemId = -1;
        this.noData.toggle(true);
        // setTimeout(() => {
            // 查询所有列表
            let muiContent = d.query('.mui-content');
            let dataManager = new DataManager({
                loading: {
                    msg: '正在加载，请稍后...',
                    disableEl: muiContent,
                    container: document.body
                },
                ajax: {
                    fun: ({current, pageSize, isRefresh}) => {
                        let ajaxPara = `{"index"=${current + 1},"size"=${pageSize},"total"=1}`;
                        return BwRule.Ajax.fetch(para.ajaxUrl, {
                            data: {
                                pageparams: ajaxPara
                            }
                        }).then(({response}) => {
                            return {data: response.data, total: response.head.totalNum}
                        });
                    },
                    auto: true,
                },
                page: {
                    size: 20,
                    options: [20],
                    container: this.wrapper.parentElement
                },
                render: (start, length) => {
                    let data: obj[] = dataManager.data.slice(start, length);
                    this.noData.toggle(data.length === 0);
                    this.initDom(data);
                }
            });
            this.dataManager = dataManager;
            this.detailEvent.on();
            this.allowUpdate = tools.isNotEmpty(para.allowUpdate) ? para.allowUpdate : false;
            this.swipeEvent.on();
            this.updateEvent.on();
        // }, 50);
    }

    private noData = (() => {
        return {
            toggle: (isShow: boolean) => {
                this.wrapper.classList.toggle(BugList.BUGLISt_NOT_DATA_CLASS, isShow);
            }
        };
    })();
    private _currentItem: HTMLElement;
    set currentItem(item: HTMLElement) {
        this._currentItem = item;
    }

    get currentItem() {
        return this._currentItem;
    }

    private detailEvent = (() => {
        let detailHandler = (e) => {
            let bugItem = d.closest(e.target, '.bug-item'),
                id = bugItem.dataset.id;
            sys.window.open({
                url: tools.url.addObj(CONF.url.bugDetail, {
                    bugid: id,
                    isself: this.allowUpdate
                })
            });
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.bug-item', detailHandler),
            off: () => d.off(this.wrapper, 'click', '.bug-item', detailHandler)
        }
    })();
    private swipeEvent = (() => {
        let expansion: HTMLElement = null,
            x = 0,
            y = 0,
            X = 0,
            Y = 0,
            swipeX = false,
            swipeY = false;
        let swipeHandler = (event) => {
            this.currentItem && this.currentItem.classList.remove('active');
            let bugItem = d.closest(event.target as HTMLElement, '.bug-item');
            bugItem.classList.add('active');
            this.currentItem = bugItem;
            if (this.allowUpdate) {
                x = event.changedTouches[0].pageX;
                y = event.changedTouches[0].pageY;
                swipeX = true;
                swipeY = true;
                if (expansion) { //判断是否展开，如果展开则收起
                    expansion.classList.remove('swipeleft');
                }
                let moveHandler = (e) => {
                    e.stopPropagation();
                    X = e.changedTouches[0].pageX;
                    Y = e.changedTouches[0].pageY;
                    let target = d.closest(e.target as HTMLElement, '.bug-item'),
                        swipeout = d.query('.swipeout', target);
                    // 左右滑动
                    if (swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0) {
                        // 阻止事件冒泡
                        e.stopPropagation();
                        if (X - x > 10) { //右滑
                            swipeout.classList.remove('swipeleft'); //右滑收起
                        }
                        if (x - X > 10) { //左滑
                            swipeout.classList.add('swipeleft'); //左滑展开
                            expansion = swipeout;
                        }
                        swipeY = false;
                    }
                    // 上下滑动
                    if (swipeY && Math.abs(X - x) - Math.abs(Y - y) < 0) {
                        swipeX = false;
                    }
                };
                let endHandler;
                d.on(this.wrapper, 'touchmove', '.bug-item', moveHandler);
                d.on(this.wrapper, 'touchend', '.bug-item', endHandler = () => {
                    d.off(this.wrapper, 'touchmove', '.bug-item', moveHandler);
                    d.off(this.wrapper, 'touchend', '.bug-item', endHandler);
                })
            } else {
                let endHandler;
                d.on(this.wrapper, 'touchend', '.bug-item', endHandler = () => {
                    d.off(this.wrapper, 'touchend', '.bug-item', endHandler);
                })
            }
        };
        return {
            on: () => d.on(this.wrapper, 'touchstart', '.bug-item', swipeHandler),
            off: () => d.off(this.wrapper, 'touchstart', '.bug-item', swipeHandler)
        }
    })();

    private updateEvent = (() => {
        let tapHanlder = (e) => {
            e.stopPropagation();
            let bugItem = d.closest(e.target, '.bug-item');
            new BugReportModal(parseInt(bugItem.dataset.id), true);
        };
        return {
            on: () => d.on(this.wrapper, 'touchstart', '.swipeout', tapHanlder),
            off: () => d.off(this.wrapper, 'touchstart', '.swipeout', tapHanlder)
        }
    })();


    private initDom(bugList: obj[]) {
        this.wrapper.innerHTML = '';
        let status = ['未处理', '处理中', '已解决', '重新申报'], // 0,1,2,3
            statusClass = ['open', 'close', 'doing', 'redo'];
        bugList.forEach((bug) => {
            let message = bug.MESSAGE;
            message = tools.isNotEmpty(message) ? message : '用户未描述';
            let bugItemWrapper = <div className="bug-item" data-id={bug.BUG_ID}>
                <div className="title-wrapper">
                    <div className="title">{bug.TITLE}</div>
                    <div className={"status " + statusClass[bug.BUG_STATUS]}>{status[bug.BUG_STATUS]}</div>
                    <div className="time">{this.handlerTime(bug.UPDATE_TIME)}</div>
                </div>
                <div className="content">
                    {message}
                </div>
                <div className="line"></div>
                <div className="swipeout">修改</div>
            </div>;
            this.wrapper.appendChild(bugItemWrapper);
        })
    }

    private handlerTime(time: number): string {
        let date = new Date(time * 1000),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            monthStr = month < 10 ? '0' + month : month,
            dayStr = day < 10 ? '0' + day : day;
        return year + '/' + monthStr + '/' + dayStr;
    }

    destory() {
        this.updateEvent.off();
        this.swipeEvent.off();
        this.detailEvent.off();
        this.currentBugItemId = -1;
    }
}