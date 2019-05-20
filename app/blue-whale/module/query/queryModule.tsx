/// <amd-module name="QueryModule"/>
import tools = G.tools;
import CONF = BW.CONF;
import sys = BW.sys;
import {AtVarBuilder, QueryBuilder} from "./queryBuilder";
import {QueryConfig} from "./queryConfig";
import {BwRule} from "../../common/rule/BwRule";
import d = G.d;
import {Loading} from "../../../global/components/ui/loading/loading";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {MobileScan} from "../mobileScan/MobileScan";
import {BwMainTableModule} from "../table/BwMainTable";
import {Inputs} from "../inputs/inputs";

export interface QueryModulePara{
    qm: IBw_Query,
    container: HTMLElement,
    refresher : (obj?:obj) => Promise<any>,
    cols : R_Field[],
    url : string,
    // table?: BasicTable,
    tableGet(): BwMainTableModule;
}


export abstract class QueryModule {
    protected queriesCpt : objOf<QueryBuilder | AtVarBuilder> = {};
    protected settingConf : obj;
    protected abstract queryParamTplGet() : HTMLElement;
    protected abstract atVarTplGet() : HTMLElement;

    public abstract show(); // 显示查询框
    public abstract hide(); // 隐藏查询框
    private initStatus:boolean=false;
    //
    // public abstract loadingShow();
    // public abstract loadingHide();

    // public abstract getOptionJson():obj;

    protected abstract queryDomGet():HTMLElement | DocumentFragment;

    private queryConfig: QueryConfig;
    protected optionDom: HTMLElement;
    protected cols : R_Field[];

    protected spinner : Loading;
    private hasOption : boolean = true;
    mbScan : MobileScan;  // 商品扫码

    /**
     * 1. 默认值初始化
     * 2. 大小写初始化
     * 3. 将时间类型的字段提前
     * 4. 初始化查询控件
     * 5. 是否自动查询
     * @param para
     */
    constructor(protected para: QueryModulePara) {
        // 初始化setting默认值
        this.settingConf = para.qm.setting && para.qm.setting.setContent ? JSON.parse(para.qm.setting.setContent) : null;
        for (let name in this.settingConf) {
            this.settingConf[name] = JSON.parse(this.settingConf[name]);
        }

        // 初始化是否大小写选项
        this.textCase.init();

        //查询
        let queriesCpt = this.queriesCpt;

        d.queryAll('[data-query-name]', this.queryDomGet()).forEach(form => {
            let queryName = form.dataset.queryName;
            // 将时间类型的字段提前
            if(queryName.indexOf('queryparam') >= 0) {
                for (let j = 0, conf; conf = para.qm[queryName][j]; j++) {
                    if (conf.atrrs && (BwRule.isTime(conf.atrrs.dataType))) {
                        para.qm[queryName].splice(j, 1);
                        para.qm[queryName].unshift(conf);
                    }
                }
            }

            if(tools.isEmpty(para.qm[queryName])){
                return;
            }
            if(queryName !== 'atvarparams'){
                queriesCpt[queryName] = new QueryBuilder({
                    tpl: this.queryParamTplGet,
                    queryName,
                    queryConfigs: para.qm[queryName],
                    resultDom: form,
                    setting: this.settingConf && this.settingConf[queryName],
                    atVarDataGet : (function () {
                        let atVar = queriesCpt['atvarparams'];
                        if(atVar){
                            return () => atVar.dataGet();
                        }else{
                            return null;
                        }
                    }()),
                    isTransCase: () => this.textCase.get()
                });
            }else{
                queriesCpt[queryName] = new AtVarBuilder({
                    tpl: this.atVarTplGet,
                    queryConfigs: para.qm[queryName],
                    resultDom: form,
                    setting: this.settingConf && this.settingConf[queryName],
                    on2dScan: code => {
                        this.search();
                    }
                });
            }
        });

        if(para.qm.queryType === 13){
            this.hide();
        }
        if(para.qm.autTag === 0) {
            setTimeout( () => {
                this.search();
            },10);
        }

        if(!this.para.qm.scannableField){
            this.inputs(this.para.qm.inputs)
        }
    }

    protected _inputs: Inputs;
    get Inputs(){
        return this._inputs;
    }
    private inputs(inputs){
        if(!inputs){
            return;
        }
        require(['Inputs'], (i) => {
            this.inputs = new i.Inputs({
                inputs: inputs,
                container: this.para.container,
                table : () => {
                    return this.para.tableGet() && this.para.tableGet().ftable
                },
                queryModule : () => {
                    return this
                },
            })
        })

    }

    get wrapper(){
        return this
    }

    /**
     * 初始化是否大小写
     */
    protected textCase = (()=>{
        let checkBox:CheckBox = null;
        let init = (value?:boolean) => {
            let div = d.query('[data-com-type="textCase"]', this.queryDomGet());
            if(div){
                checkBox = new CheckBox({
                    container: div,
                    text: sys.isMb ? '' : '区分大小写',
                    onClick : sys.isMb ? () => {
                        Modal.toast(checkBox.get() ? '区分大小写' : '不区分大小写');
                    } : null
                });
                checkBox.set(value);
            }
        };

        let get = ()=>{
            return checkBox ? checkBox.get() : false;
        };

        return {init, get};
    })();

    protected settingSave(){
        let settingSaveUrl = `${CONF.siteAppVerUrl}/setting/${this.para.qm.setting.settingId}`,
            queryJson = this.getQueryJson(true);

        queryJson.textCase = this.textCase.get();
        console.log(queryJson);
     
        BwRule.Ajax.fetch(settingSaveUrl, {
            type: 'PUT',
            data2url: true,
            data: queryJson
        }).then(() => {
            Modal.toast('保存成功');
        });

    // Rule.ajax(settingSaveUrl, {
    //         type: 'PUT',
    //         urlData: true,
    //         data: queryJson,
    //         success: function (response) {
    //             Modal.toast('保存成功');
    //         }
    //     });
    }

    /**
     * 查询
     * @param param
     * @param {boolean} noQuery 扫码的时候不带非扫码的查询条件
     * @returns {any}
     */
    public search(param?, noQuery = false){
        // if(sys.os === 'pc'){
        //     this.spinner = new Loading({
        //         msg : '加载中...'
        //     });
        // }

        let queryJson = this.getQueryJson(false);
        if(param){
            queryJson = Object.assign(queryJson, param);
        }

        //必选判断
        if('atvarparams' in queryJson){
            let paramsData = JSON.parse(queryJson.atvarparams),errTip = '';
            this.para.qm['atvarparams'].forEach(obj => {
                if(obj.atrrs.requiredFlag === 1 && paramsData[obj.field_name] === ''){
                    errTip += obj.caption + ',';
                }
            });
            if(errTip !== ''){
                Modal.alert(errTip.substring(0,errTip.length - 1) + '不能为空');
                return Promise.reject('');
            }
        }
        // if (Object.keys(queryJson).length === 0) {
        //     return  '请先添加一个条件';
        //
        // }


        // 扫码不带查询条件，atv为必选条件需要带上
        if(noQuery){
            let noQueryParam = param;
            noQueryParam.atvarparams = queryJson.atvarparams;
            queryJson = noQueryParam;
        }
        // debugger;
        // 选项
        if(this.para.qm.hasOption && this.hasOption && !noQuery){
            
            let data = JSON.parse(queryJson.queryoptionsparam);
            if(data.showFields && data.showFields.length === 0 && (data.itemSumCount || (data.groupByFields && data.groupByFields[0]))){
                Modal.alert('未设置显示字段');
                return Promise.reject('');
            }
            if(data.section && !data.sectionParams.sections){
                Modal.alert('段位列表中无内容');
                return Promise.reject('');
            }

            if(data.itemCount && data.showFields && !data.showFields[0]){
                return this.optionLoad(queryJson);
            }else {
                // return this.queryLoad(queryJson);
                if(!this.initStatus&&this.para.qm.queryType===2 ){
                    this.initStatus=true;
                    return this.queryLoad('');
                }else{
                    return this.queryLoad(queryJson);
                }
            }
        }else{
            /** queryType==2的时候，首次亲求不给后端带入queryJson（查询器的默认值） */
            if(!this.initStatus&&this.para.qm.queryType===2 ){
                this.initStatus=true;
                return this.queryLoad('');
            }else{
                return this.queryLoad(queryJson);
            }
           
          
        }


    }

    //查询
    private queryLoad(queryJson){
        sessionStorage.setItem('queryer', JSON.stringify(queryJson));
        this.hide();
        return this.para.refresher(queryJson);
    }

    //仅查项数,不勾选显示字段
    private optionLoad(ajaxData){
        let self = this;

        // if(sys.os === 'pc'){
        if(!this.spinner){
            this.spinner = new Loading({
                msg : '加载中...'
            });
        }else {
            self.spinner.show();
        }
        // }

        ajaxData.pageparams =  JSON.stringify({
            index : 1,
            size : 3000
        });

        return BwRule.Ajax.fetch(this.para.url, {
            data: ajaxData,
        }).then(({response}) => {
            let meta = response.body.bodyList[0].dataList[0],
                caption = ['项数'];

            Modal.alert(caption[0] + '：' +  meta[0]);

            self.spinner.hide();
        });
    }


    public getQueryJson(isSave : boolean = false) {
        let queryJson:obj = {},
            self = this,
            queryNum = 0;

        for (let queryName in this.queriesCpt) {
            if (!this.queriesCpt.hasOwnProperty(queryName)) {
                continue;
            }
            let obj : any = this.queriesCpt[queryName],
                queryConfigs = obj.queryConfigs,
                paramsData = obj.dataGet(-1, isSave);

            if(isSave && Array.isArray(queryConfigs)){
                queryConfigs.forEach((q : QueryConf) => {
                    if(q.nosave){
                        delete paramsData[q.field_name]
                    }
                })
            }
            if (paramsData !== null) {
                queryJson[queryName] = JSON.stringify(paramsData);
                queryNum++;
            }
        }


        //是否有选项
        if(this.para.qm.hasOption ){
            let optionJson = this.getOptionJson(isSave),
                 keys = Object.keys(optionJson);

            if(keys.length === 1 && optionJson.showFields && !optionJson.showFields[0]){
                self.hasOption = false;
                return queryJson;
            }
            self.hasOption = true;
            if (queryNum === 0 && !optionJson) {
                return null;
            }
            //参数合并
            queryJson.queryoptionsparam = JSON.stringify(optionJson);

        }

        return queryJson;
    }

    /**
     * 选项dom init
     * @returns {HTMLElement}
     */
    protected optionDomGet() {
        return <div className="option">
            <div className="option-limit">
                <div data-action="value" className="checkbox-custom" data-name="itemRepeat">
                    {/*<label>项不重复</label>*/}
                </div>
                <div data-action="value" className="checkbox-custom" data-name="itemCount">
                    {/*<label>仅查项数</label>*/}
                </div>
                <div data-action="value" className="checkbox-custom" data-name="itemSumCount">
                    {/*<label>仅查总数</label>*/}
                </div>
                <div className="limitInput" data-name="topN">
                    限查前
                    <div className="topN"></div>
                    项
                </div>
                <div data-action="value" className="checkbox-custom" data-name="restrictionFirst">
                    {/*<label>限制在先</label>*/}
                </div>
            </div>
            <div className="multi-select">
                <div className="select-left">
                    <label className="show-word">显示字段</label>
                    <span className="all-dec">全清</span>
                    <span className="all-select">全选/</span>
                </div>
                <div className="icon-box">
                    <span className="iconfont icon-arrow-right-2 sort"></span>
                    <span className="iconfont icon-close sort"></span>
                    <span className="iconfont icon-arrow-right-2 group"></span>
                    <span className="iconfont icon-close group"></span>
                </div>
                <div className="select-right"><label className="sort-word">排序字段</label><label
                    className="group-word">分组字段</label>
                </div>
            </div>
            <div className="option-section">
                <div className="section-checkbox">
                    <div data-name="sectionQuery"></div>
                    <div data-name="leftOpenRightClose"></div>
                </div>
                <div className="section">
                    <div className="section-col">
                        <div className="section-6" data-name="sectionField">
                            <label>分段字段</label>
                        </div>
                        <div className="section-6 hide" data-name="sectionNorm">
                            <label>分段标准</label>
                        </div>
                    </div>
                    <div data-name="avgSection"></div>
                    <div className="customGrading">
                        <div data-name="numSection">
                            <label className="segment hide">段位</label>
                            <label className="width">宽度</label>
                        </div>
                        <div className="icon-box-2 hide">
                            <span className="iconfont icon-arrow-right-2 col"></span>
                            <span className="iconfont icon-close col"></span>
                        </div>
                        <div className="section-6 hide" data-name="fieldCol">
                            <label>段位列表</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }

    /**
     * 选项init
     */
    protected initQueryConf(){
        let self = this;

        self.optionDom = self.optionDomGet();

        self.queryConfig = new QueryConfig({
            limitDom: self.optionDom,
            cols: self.cols,
            setting : self.settingConf && self.settingConf.queryoptionsparam
        });
    }

    /**
     * 获取选项参数
     * @returns {QueryConfigPara}
     */
    private getOptionJson(save : boolean = false){
        return this.queryConfig.getPara(save);
    }
}
