///<amd-module name="defaultTab"/>
import BasicPage from "../basicPage";
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import menuPage = require('../menu/menuPage')
import drillPage = require('../drill/drillPage')
import d = G.d;

export  class defaultTab extends BasicPage{
    private container;
    private history : obj = {};//最近
    private favorites : obj = {};//收藏
    constructor(private para){
        super(para);
        this.container = para.dom;
        this.initPage();
    }
    private initPage(){
        let count = 0 ,
            callback = ()=>{
                count ++;
                if(count === 2){
                    this.initDeafultTab();
                }
        };
        // Rule.ajax(CONF.ajaxUrl.menuHistory + '?action=query', {
        //     success : (res)=>{
        //         this.history = res;
        //         callback();
        //     }
        // });
        // Rule.ajax(CONF.ajaxUrl.menuFavor + '?action=query', {
        //     success : (res)=>{
        //         this.favorites['data'] = res.data[0].favs;
        //         callback();
        //     }
        // });

        BwRule.Ajax.fetch(CONF.ajaxUrl.menuHistory, {
            data: {action: 'query'}
        }).then(({response}) => {
            this.history = response;
            callback();
        });

        BwRule.Ajax.fetch(CONF.ajaxUrl.menuFavor, {
            data: {action: 'query'}
        }).then(({response}) => {
            this.favorites['data'] = response.data[0].favs;
            callback();
        });
    }
    private initDeafultTab(){

        let initFileBox = (res,uniqueId)=>{
            let fileTpl = `<div id="${uniqueId}" class="container-fluid container-fullw">`;
            let fileBox = '';
            let length = res.data.length > 15 ? 15: res.data.length;
            for(let i = 0;i < length;i++) {
                fileBox +=
                    `<div class="file-box col-xs-2 col-md-2 card-white">
<div class="file"><a data-href="${res.data[i].url}">
<span class="corner"></span>
<div class="icon"><i class="ti ${res.data[i].icon}"></i></div>
<div class="file-name">${res.data[i].caption}</div>
</a></div>
</div>`;
            }
            fileTpl = fileTpl + fileBox + '</div>';
            return fileTpl;
        };
        let initDrill = (panelBody,name) => {
            return `<div class="marginTop"><div class="panel panel-white ">
    <div class="panel-heading">
        <div class="panel-collapse upDown" data-index="0"  data-load="1" data-toggle="tab" data-placement="top" >
            <div class="panel-title text-primary">${name}<span class="iconfont icon-arrow-down"></span><span class="iconfont icon-arrow-up"></span></div>
        </div>
        <div class="panel-tools" ><a class="btn btn-transparent btn-sm panel-fullscreen"><i class="iconfont icon-enlarge"></i></a></div>
    </div>
    <div class="panel-body">${panelBody}</div>
</div></div>`;
        };


        this.container.innerHTML = `<div id="drillTplTabPage"  class="drillPage"> 
    ${initDrill(initFileBox(this.history,'historyDefaultOpenTabPage'),'最近')}
    ${initDrill(initFileBox(this.favorites,'favoritesDefaultOpenTabPage'),'收藏')}
 </div>`;;
        require(['menuPage'], (menuPage) => {
            new menuPage({
                dom     : d.query('#historyDefaultOpenTabPage',this.container),
                title   : '',
            });
            new menuPage({
                dom     : d.query('#favoritesDefaultOpenTabPage',this.container),
                title   : '',
            });
        });

        require(['drillPage'],(drillPage) =>{
            let pageDom = d.query('#drillTplTabPage',this.container);
            let uniqueDom = $('#drillTplTabPage .panel-collapse');
            new drillPage({
                dom       : pageDom,
                title     : '',
                subTables : null,
                tableDom : null,
                uniqueDom : uniqueDom
            });
        })

    }
}