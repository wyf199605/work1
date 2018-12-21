/// <amd-module name="MbListView"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {ListItemDetail} from "../listDetail/ListItemDetail";
import {BwRule} from "../../common/rule/BwRule";
import {ITab, Tab} from "../../../global/components/ui/tab/tab";
import {MbListModule} from "./mbListModule";
import tools = G.tools;
import d = G.d;

interface IMbListView extends IComponentPara {
    ui: IBW_UI<R_SubTable_Field>;
}

export class MbListView extends Component {
    protected wrapperInit(para: IMbListView): HTMLElement {
        return <div className="mb-list-view"/>;
    }

    private currentIndex: number = 0;
    private subLists: MbListModule | ListItemDetail[] = [];
    private tab: Tab;

    constructor(para: IMbListView) {
        super(para);
        let listUi: R_SubTable_Field = para.ui.body.elements[0];
        let tabsTitle = ['详情'],
            listUIUrls = [];
        tools.isNotEmpty(listUi.subTableList) && listUi.subTableList.forEach(ele => {
            listUIUrls.push(tools.url.addObj(BW.CONF.siteUrl + ele.uiAddr.dataAddr,{
                output:"json"
            }));
            tabsTitle.push(ele.caption);
        });
        let tabs: ITab[] = [];
        this.tab = new Tab({
            panelParent: this.wrapper,
            tabParent: this.wrapper,
            tabs: tabs,
            className: 'mbListView',
            onClick: (i) => {
                this.currentIndex = i;
                if (tools.isEmpty(this.subLists[i])) {
                    // 不存在
                    if (i === 0) {
                        let tabEl = d.query(`.tab-pane.mbListView[data-index="0"]`, this.tab.getPanel());
                        this.subLists[0] = new ListItemDetail({
                            uiType: 'view',
                            fm: listUi,
                            dom: tabEl
                        });
                    } else {
                        BwRule.Ajax.fetch(listUIUrls[i-1]).then(({response}) => {
                            let tabEl = d.query(`.tab-pane.mbListView[data-index="${i}"]`, this.tab.getPanel());
                            let uiType = response.uiType;
                            switch (uiType){
                                case 'layout':{
                                    this.subLists[i] = new MbListModule({
                                        ui: response,
                                        container: tabEl
                                    })
                                }
                                break;
                            }
                        });
                    }
                } else {
                    // 存在
                }
            }
        });
        tabsTitle.forEach((sub) => {
            this.tab.addTab([{
                title: sub,
                dom: null
            }]);
        });
        this.tab.active(0);
        if (tools.isMb) {
            let width = this.calcNavUlWidth();
            if (width < document.documentElement.clientWidth){
                d.query('ul.nav.nav-tabs.nav-tabs-line',this.wrapper).classList.add('space-around');
            }
        }
    }

    private calcNavUlWidth() {
        let lis = d.queryAll('li.mbListView', this.tab.getTab()),
            width: number = 0;
        lis.forEach(li => {
            width += getWidth(window.getComputedStyle(li).width);
        });

        function getWidth(width: string) {
            return tools.isNotEmpty(width) ? parseInt(width.slice(0, width.length - 2)) : 0;
        }

        return width;
    }
}