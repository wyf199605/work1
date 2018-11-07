/// <amd-module name="FlowListPC"/>
import BasicPage from "../../pages/basicPage";
import {NewTableModule} from "../table/newTableModule";
import {ITab, Tab} from "../../../global/components/ui/tab/tab";
import tools = G.tools;
import d = G.d;
import {BwRule} from "../../common/rule/BwRule";
interface MenuPara{
    menuIcon : string,
    menuName : string,
    menuPath : MenuPathPara,
    menuType : number,
}
interface MenuPathPara{
    addrType : boolean,
    commitType : number,
    dataAddr : string,
    needGps : number,
    type : string,
    varType : number
}
interface FlowListPara extends BasicPagePara{
    elements:MenuPara[]
}

export class FlowListPC extends BasicPage{
    private tableUIUrls:string[] = [];
    private subTables:obj = {};
    constructor(para:FlowListPara){
        super(para);
        if (tools.isNotEmpty(para.elements)){
            let elements = para.elements,
                tabsTitle = [];
            elements.forEach(ele => {
                this.tableUIUrls.push(tools.url.addObj(BW.CONF.siteUrl+ele.menuPath.dataAddr,{
                    output:'json'
                }));
                tabsTitle.push(ele.menuName);
            });
            let tabWrapper = para.dom || document.body,tabs: ITab[] = [];
            let tab = new Tab({
                panelParent: tabWrapper,
                tabParent: tabWrapper,
                tabs: tabs,
                panelClass:'first',
                onClick: (index) => {
                    if (tools.isEmpty(this.subTables[index])) {
                        // 表格不存在
                        BwRule.Ajax.fetch(this.tableUIUrls[index]).then(({response}) => {
                            let tabEl = d.query(`.tab-pane.first[data-index="${index}"]`, tab.getPanel());
                            this.subTables[index] = new NewTableModule({
                                bwEl:response.body.elements[0],
                                container:tabEl
                            })
                        })
                    } else {
                        // 表格存在 刷新并显示
                        this.subTables[index].refresh().catch();
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
}