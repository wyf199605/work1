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

    constructor(para: IMbListView) {
        super(para);
        let listUi: R_SubTable_Field = para.ui.body.elements[0];
        let tabsTitle = ['详情'],
            listUIUrls = [];
        listUi.subTableList.forEach(ele => {
            listUIUrls.push(BW.CONF.siteUrl + ele.uiAddr.dataAddr);
            tabsTitle.push(ele.caption);
        });
        let tabWrapper = para.container || document.body, tabs: ITab[] = [],
            tab = new Tab({
            panelParent: tabWrapper,
            tabParent: tabWrapper,
            tabs: tabs,
            className: 'first',
            onClick: (i) => {
                this.currentIndex = i;
                if (tools.isEmpty(this.subLists[i])) {
                    // 不存在
                    if (i === 0){
                        this.subLists[0] = new ListItemDetail({
                            uiType: 'view',
                            fm: listUi
                        });
                    }else{
                        BwRule.Ajax.fetch(listUIUrls[i]).then(({response}) => {
                            let tabEl = d.query(`.tab-pane.first[data-index="${i}"]`, tab.getPanel());
                            let bwTableEl = response.body.elements[0];
                            bwTableEl.subButtons = (bwTableEl.subButtons || []).concat(response.body.subButtons || []);
                            this.subLists[i] = new MbListModule({
                                ui: response.body,
                                container: tabEl
                            })
                        });
                    }
                } else {
                    // 存在
                }
            }
        });
        tabsTitle.forEach((sub) => {
            tab.addTab([{
                title: sub,
                dom: null
            }]);
        });
        tab.active(0);
    }
}