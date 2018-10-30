/// <amd-module name="bugListPage"/>
import d = G.d;
import CONF = BW.CONF;
import {Tab} from "../../../global/components/ui/tab/tab";
import {BugList} from "../../module/BugReport/BugList";
import {BugReportModal} from "../../module/BugReport/BugReport";

export = class BugListPage {
    constructor() {
        let muiContent = d.query('.mui-content'),
            tabParent = <div className="tabParent"/>,
            panelParent = <div className="panelParent"/>;
        muiContent.appendChild(tabParent);
        muiContent.appendChild(panelParent);
        let mine = new BugList({
            allowUpdate: true,
            ajaxUrl: CONF.ajaxUrl.bugList + '?self=1'
        });
        let all = new BugList({
            ajaxUrl: CONF.ajaxUrl.bugList
        });
        let tab = new Tab({
            tabParent: tabParent,
            panelParent: panelParent,
            tabs: [
                {
                    name: 'mine',
                    title: '我的',
                    dom: mine.wrapper
                },
                {
                    name: 'all',
                    title: '全部',
                    dom: all.wrapper
                }
            ],
            onClick: index => {
                index === 0 ? mine.dataManager.refresh() : all.dataManager.refresh();
            }
        });
        this.addEvent.on();
    }

    private addEvent = (() => {
        let eidtHanlder = (e) => {
            new BugReportModal(-1,true);
        };
        return {
            on: () => d.on(d.query('.mui-bar'), 'click', '#editBug', eidtHanlder),
            off: () => d.off(d.query('.mui-bar'), 'click', '#editBug', eidtHanlder)
        }
    })();
}