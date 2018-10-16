/// <amd-module name="QueryDevicePage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import {OverviewModule} from "../../module/queryDevice/OverviewModule";
import {MainFuncModule} from "../../module/queryDevice/MainFuncModule";
import {ProductScriptModule} from "../../module/queryDevice/ProductScriptModule";
import {Button} from "../../../global/components/general/button/Button";
import {OperationModule} from "../../module/queryDevice/OperationModule";
import {StepBar} from "../../module/stepBar/StepBar";

export class QueryDevicePage extends SPAPage {
    set title(str:string){
        this._title = str;
    }
    get title(){
        return this._title;
    }
    init(para, data) {
        if (tools.isNotEmpty(data)){
            QueryDevicePage.itemId = data[0] || ''; // 获取传过来的itemId
        }else{
            QueryDevicePage.itemId = '';
        }
        this.title = "查询器开发";
        this.initNav();
        this.initItems();
        this.initStepBtn();
        this.previousIndex = 0;
    }
    protected wrapperInit() {
        return d.create(`
        <div class="queryDevicePage">
            <div class="queryItems"></div>
            <div class="queryContent">
                <div class="item1 item-container"></div>
                <div class="item2 item-container"></div>
                <div class="item3 item-container"></div>
                <div class="item4 item-container"></div>
            </div>
            <div class="stepBtn"></div>
        </div>`);
    }

    static itemId:string;
    private navStep: StepBar;

    private initNav() {
        let btnTitleArray = ['概述', '主功能', '操作', '保存预览'];
        this.navStep = new StepBar({
            container: this.wrapper.querySelector('.queryItems'),
            btnArr: btnTitleArray,
            changePage: (index) => {
                this.qdChangePage(index);
            },
            allowClickNum:true
        });
    }
    private _previousIndex:number;
    set previousIndex(index){
        this._previousIndex = index;
    }
    get previousIndex(){
        return this._previousIndex;
    }
    static _allQDData:obj[] = [{},{},{}];
    private qdChangePage(index) {
        if (index === 3){
            this.stepBtn.isShow = false;
        }else{
            this.stepBtn.isShow = true;
        }
        if (index === this.previousIndex){
            return;
        }
        if (this._previousIndex < 3){
            // 离开的页面保存数据
            let leaveItem = this.allItems[this._previousIndex];
            QueryDevicePage._allQDData[this._previousIndex] = leaveItem.get();
        }

        this.allItems.forEach((item, i) => {
            if (index === i) {
                item.isShow = true;
            } else {
                item.isShow = false;
            }
        });
        this.previousIndex = index;
    }
    private handleResponse(res:obj):obj[]{
       let data = [];
       res.dataArr.forEach((item)=>{
           let obj = {
               itemId:'',
               captionSql:'',
               itemType:'',
               dataSource:'',
               baseTable:'',
               keyField:'',
               nameField:'',
               settingId:'',
               pause:0
           };
            let newObj = tools.obj.merge(obj,item);
            data.push(newObj);
       });
        return data;
    }
    private stepBtn:Button;
    private initStepBtn() {
        this.stepBtn = new Button({
            container: d.query('.stepBtn', this.wrapper),
            content: '下一步',
            onClick: (e) => {
                this.navStep.currentIndex += 1;
                this.qdChangePage(this.navStep.currentIndex);
            }
        })
    }

    // 4个模块
    public allItems: any[];
    private initItems() {
        this.allItems = [];
        let itemId = QueryDevicePage.itemId;
        // 概述
        let overview = new OverviewModule({
            container: this.wrapper.querySelector('.item1'),
            isQuery:true
        });
        overview.isShow = true;
        this.allItems.push(overview);

        // 主功能
        let mainFunc = new MainFuncModule({
            container: this.wrapper.querySelector('.item2')
        });
        this.allItems.push(mainFunc);

        // 操作
        let operation = new OperationModule({
            container:this.wrapper.querySelector('.item3')
        });
        this.allItems.push(operation);

        // 保存预览
        let productScript = new ProductScriptModule({
            container: this.wrapper.querySelector('.item4')
        });
        this.allItems.push(productScript);
    }

    private _elementRelatedData:obj;
    get elementRelatedData(){
        if (!this._elementRelatedData){
            this._elementRelatedData ={
                action: [],
                handle: [],
                assign: [],
                default: [],
                adt: [],
                aggregate: [],
                associate: [],
                calculate: [],
                import: [],
                lookup: [],
                pick: [],
                value: []
            }
        }
        return this._elementRelatedData;
    }
}