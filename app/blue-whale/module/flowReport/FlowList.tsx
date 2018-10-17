/// <amd-module name="FlowList"/>
import d = G.d;
import {SlideTab} from "../../../global/components/ui/slideTab/slideTab";
import {BwRule} from "../../common/rule/BwRule";
import sys = BW.sys;
import tools = G.tools;

export class FlowList {
    private flowType:string;
    constructor(para) {
        let flow = para.flow,
            titles = [],
            url = '';
        this.flowType = para.flow;
        switch (flow){
            case 'application':{
                titles = ['全部','进行中','已完成'];
                url = BW.CONF.ajaxUrl.flowListApply;
            }
            break;
            case 'approval':{
                titles = ['全部','待审批','已审批'];
                url = BW.CONF.ajaxUrl.flowListCheck;
            }
                break;
        }
        let muiContent = d.query('.mui-content.flowList'),
            tabParent = <div className="tabParent"/>,
            panelParent = <div className="panelParent"/>;
        muiContent.appendChild(tabParent);
        muiContent.appendChild(panelParent);
        this.initEvents.on();
        let dom1 = <div/>,
            dom2 = <div/>,
            dom3 = <div/>;
        let tab = new SlideTab({
            tabParent: tabParent,
            panelParent: panelParent,
            tabs: [
                {
                    title: titles[0],
                    dom: dom1,
                    dataManager: {
                        render: (start: number, length: number, data: obj[], isRefresh: boolean) => {
                            let result = [];
                            if (isRefresh) {
                                dom1.innerHTML = '';
                                result = data;
                            } else {
                                result = data.slice(length - 10);
                            }
                            result.forEach((item) => {
                                dom1.appendChild(this.createItem(item));
                            });
                        },
                        ajaxFun: ({current, pageSize, isRefresh}) => {
                            let ajaxPara = `{"index"=${current + 1},"size"=${pageSize},"total"=1}`;
                            return BwRule.Ajax.fetch(url + '?state=all', {
                                data: {
                                    pageparams: ajaxPara
                                }
                            }).then(({response}) => {
                                if (current === 0){
                                    d.query('a',d.queryAll('li',tab.getTab())[0]).innerText = `${titles[0]}(${response.head.totalNum}条)`;
                                }
                                return {data: response.data, total: response.head.totalNum}
                            });
                        },
                        pageSize: 10,
                        isPulldownRefresh: true
                    }
                },
                {
                    title:  titles[1],
                    dom: dom2,
                    dataManager: {
                        render: (start: number, length: number, data: obj[], isRefresh: boolean) => {
                            let result = [];
                            if (isRefresh) {
                                dom2.innerHTML = '';
                                result = data;
                            } else {
                                result = data.slice(length - 10);
                            }
                            result.forEach((item) => {
                                dom2.appendChild(this.createItem(item));
                            });
                        },
                        ajaxFun: ({current, pageSize, isRefresh}) => {
                            let ajaxPara = `{"index"=${current + 1},"size"=${pageSize},"total"=1}`;
                            return BwRule.Ajax.fetch(url, {
                                data: {
                                    pageparams: ajaxPara
                                }
                            }).then(({response}) => {
                                if (current === 0){
                                    d.query('a',d.queryAll('li',tab.getTab())[1]).innerText = `${titles[1]}(${response.head.totalNum}条)`;
                                }
                                return {data: response.data, total: response.head.totalNum}
                            });
                        },
                        pageSize: 10,
                        isPulldownRefresh: true
                    }
                },
                {
                    title:  titles[2],
                    dom: dom3,
                    dataManager: {
                        render: (start: number, length: number, data: obj[], isRefresh: boolean) => {
                            let result = [];
                            if (isRefresh) {
                                dom3.innerHTML = '';
                                result = data;
                            } else {
                                result = data.slice(length - 10);
                            }
                            result.forEach((item) => {
                                dom3.appendChild(this.createItem(item));
                            });
                        },
                        ajaxFun: ({current, pageSize, isRefresh}) => {
                            let ajaxPara = `{"index"=${current + 1},"size"=${pageSize},"total"=1}`;
                            return BwRule.Ajax.fetch(url + '?state=already', {
                                data: {
                                    pageparams: ajaxPara
                                }
                            }).then(({response}) => {
                                if (current === 0){
                                    d.query('a',d.queryAll('li',tab.getTab())[2]).innerText = `${titles[2]}(${response.head.totalNum}条)`;
                                }
                                return {data: response.data, total: response.head.totalNum}
                            });
                        },
                        pageSize: 10,
                        isPulldownRefresh: true
                    }
                }
            ]
        })
    }

    private initEvents = (() => {
        let clickHandler = (e) => {
            let url = d.closest(e.target,'.item-wrapper').dataset.url;
                // instance = d.closest(e.target,'.item-wrapper').dataset.instance;
            sys.window.open({
                url:url
            })
        };
        return {
            on: () => {
                d.on(d.query('.mui-content.flowList'),'click','.item-wrapper',clickHandler);
            },
            off: () => {
                d.off(d.query('.mui-content.flowList'),'click','.item-wrapper',clickHandler);
            }
        }
    })();

    private createItem(data?: obj) {
        let state = '',
            stateClass = '';
        if (this.flowType === 'application'){
            switch (Number(data.instanceState)) {
                case 0: {
                    state = '草稿';
                    stateClass = 'draft'
                }
                    break;
                case 1: {
                    state = '待审核';
                    stateClass = 'check'
                }
                    break;
                case 2: {
                    state = '已撤回';
                    stateClass = 'withdraw'
                }
                    break;
                case 3: {
                    state = '已退回';
                    stateClass = 'sendBack'
                }
                    break;
                case 4: {
                    state = '已同意';
                    stateClass = 'agree'
                }
                    break;
                case 90: {
                    state = '已结案';
                    stateClass = 'close'
                }
                    break;
            }
        }else{
            let taskName =  data.taskName;
            switch (Number(data.taskState)) {
                case 0: {
                    state =  taskName + '-' + '待审批';
                    stateClass = 'check';
                }
                    break;
                case 1: {
                    state = taskName + '-' +  '已审批';
                    stateClass = 'agree';
                }
                    break;
            }
        }

        return <div className="item-wrapper" data-url={BW.CONF.siteUrl + data.auditUrl + '&page=flowReport'} data-instance={data.instanceState}>
            <div className="item-title"><span>{data.processName}-{data.createUserName}</span><i
                className="iconfont icon-arrow-right"/></div>
            <div className="item-content">
                <div class="item-info">
                    <div className="item-time">{this.handlerTime(data.lastUpdateTime)}</div>
                    <div className={"item-state " + stateClass}>{state}</div>
                </div>
            </div>
        </div>;
    }
    private handlerTime(dateStr: string) {
        let date = new Date(dateStr),
            year = date.getFullYear(),
            yearStr = year.toString().slice(2),
            month = date.getMonth() + 1,
            monthStr = month >= 10 ? month : '0' + month,
            day = date.getDate(),
            dayStr = day >= 10 ? day : '0' + day;
        return `${yearStr}/${monthStr}/${dayStr}`
    }

    destroy(){
        this.initEvents.off();
    }
}