/**
 * rule
 */


// interface R_Button extends Btn{
//     varList : R_VarList[];
//     subType : string;
//     buttonType : number;
//     actionAddr : string;
//     refresh : number;
//     [any : string] : any
// }




// interface TableConf{
//     table : HTMLTableElement;
//     tableData : TableDataConf;
//     isQuery : boolean;
//     btnArr: BT_Btn[];
// }



interface IBW_UI<U>{
    body:{
        elements: [U, any];
        subButtons: R_Button[];
    }
    caption: string; // 标题
    uiType: string;
}

interface IBW_Plan_Table extends IBW_Table{
    backGround: R_ReqAddr;
}

interface IBW_Table{
    caption: string;
    settingId: string;  // 列顺序保存数据
    reportTitle?: string; // 副标题
    cols: R_Field[];      // 列
    dataAddr: R_ReqAddr;  // 获取数据地址
    defDataAddrList: R_ReqAddr[]; // 新增时获取默认值地址
    asynData? : obj[]; // 异步数据
    isAsyn: boolean;   // 是否异步查询
    itemId: string;    // 节点ID
    keyField: string;  // 主键
    multPage: number; // 1时后台分页, 0 不分页, 2,前台分页
    multiValue : boolean //表格点击单选多选
    nameField: string;
    pictureAddrList: R_ReqAddr[]; // 图片地址
    printList: printListArr[];    // 报表打印, 标签打印
    querier: IBw_Query;           // 查询器
    subButtons: R_Button[];       // 按钮
    tableAddr?: IBW_TableAddr;    // 表格编辑数据
    uiType: string;
    relateType? : string,         // 值为P为时表示交叉制表
    subTableList?:IBW_Table[];    // 子表
    aggrList?:R_Aggr[];           // 聚合字段地址
    inputs? : R_Input[];          // 快捷输入
    autoRefresh?:number;          // 回到本页面时表格是否自动刷新
    scannableField?: string // 扫码
    scannableLocationLine? : string // 扫码定位
    scannableType? : number // 0:扫码(RFID设备为扫码枪，手机为二维码)   1.RFID扫码（支持多个）
    scannableTime? : number // 获取配置时间扫到的数据
    rfidCols?:IBW_TableRfidCol;  // rfid配置
    rfidFlag?:number;
    printSetting?: string;
}

interface IBW_TableRfidCol{
    classify: string;
    amount: string;
    amountFlag: number;
    ruleFields: {
        amountField: string;
        amountRule: string;
    }[];
    inventoryKey:string;
    searchField:string;
    wifiField:string;
    scanFieldName?:string;
    calcData?:{
        calcField:string;
        calcCaption:string;
        calcValue:string;
    }[];
    scanField:string;
    //calculate?:string;
    //计算字段
    amountField?:string;
    //计算规则
    amountRule?:string;
    calc?:{
        when?:{
            categoryno?: string;
        }
        cols:{
            calculate?:string;
            calculateScan?:string;
            calculateDiff?:string;
            calculateAdd?:string;
        }
        calcRule?:{
            field:string;
            rule:string
        }[]
    }
}
interface IBW_TableAddr{
    dataAddr : string;	//后台地址
    param: IBW_TableAddrParam[]
}

interface IBW_TableAddrParam{
    itemId: string;
    type: string;
    insert?: R_VarList[];  // 新增变量列表
    insertType?:string;

    update?: R_VarList[];  // 修改变量列表
    updateType?: string;

    delete?: R_VarList[];  // 删除变量列表
    deleteType?:string;
}

interface TableRefresher{
    (ajaxData?: obj, after?:(res:obj)=>void, before?:(res:obj)=>void ) : void
}

interface TableDataConf{
    cols: any[]; //列数据
    keyField : string;
    fixedNum :number; //锁列数
    dataAddr :string; //表格数据加载地址
    uiPath : R_ReqAddr; // 表格某行往下点的链接数据 对应SYS.rule.uiPath
    relateType: string; //交叉字表使用标志：为P表示为交叉字表，null表示其它
    varList : R_VarList[];
    pageLen :number;
    subTables : TableDataConf[];
    picturePath? : R_ReqAddr;
    thumbnailPath? : R_ReqAddr;
}

interface SubPage{
    create : () => HTMLDivElement;
    show: (...any) => void;
    onClose: (any) => void;
    getLoading?: () => HTMLDivElement;
}

interface DomTree{
    tag : string;
    attr : object;
    text : string;
    child : DomTree[];
}

declare const double_back : any;
