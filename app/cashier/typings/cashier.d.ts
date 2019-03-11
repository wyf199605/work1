/**
 * ui构造参数
 */
interface C_R_ReqAddr extends R_ReqAddr{
    method?: string; // GET,POST,PUT
    objId?: string;
    data?: obj;
    // addr? : R_ReqAddr
    loadData?: number
    addParam?: string // 拼接在url后面
    notVarList? : boolean   // 不从varList中查找数据
    cfgName? : string   // 全局变量名
}

interface TableLiteColPara{
    caption: string;
    fieldName : string;
    noShow? : boolean;
    toFixed? : number;
    required?: number;
    showField? : string
    dataType? : string;
    assignAddr? : obj;
    displayFormat : string
    assignSelectFields? : string[];
}

interface TableListPara{
    dataAddr? : C_R_ReqAddr;
    loadData? : number;
    itemId? : string;
    cols? : TableLiteColPara[]
    keyField? : string
}

/**
 * type
 * 0：弹出“确定”按钮窗口，不执行该操作
 * 1：弹出“确定”、“取消”按钮窗口，根据按钮选择操作。
 * 10:弹出指纹验证，不通过则在当前页面提示重新输入指纹
 * 11:在界面下方提示框显示提示信息并进入下一步
 * 12:在界面下方提示框显示提示信息但仍在当前步骤
 * 13:结账校验通过，bill添加通过字段
 * 14:输券，提示信息，进入下一步
 */
interface IConditionPara{
    showText : string;
    type : string;
    addparam? : string
    clearGlobal? : number;
    printAddr? : R_ReqAddr
    increase? : string
}
interface ICashierPanel{   // 主面板
    height? : string,
    width? : string,
    panelId? : string,
    panelName? : string,
    panelPos? : number,
    uiTmpl? : string,
    cols? : TableLiteColPara[],
    tabeList : TableListPara[]
    inputs? : IInputPara[],
    dataRules? : IDataRulesPara[],
    printAddr ? : R_ReqAddr,
    clearGlobal? : number, // 清空全局变量
    inputType? : string[]
    tag ? : number //1.3.5.7可选中 4,5,6,7添加序号 0,1,4,5菜单
}
/**
 * 计算规则参数
 */
interface IDataRulesPara{
    fieldName : string,
    itemId : string,
    fieldRule : string,
    toPanelId : string,
    upType : number, // 1.取当前面板数据 2.取toPanelId数据
}

interface IProps {
    dom? : HTMLElement
    data? : ICashierPanel
    urlSite? : string
}
/**
 * 收银主界面参数
 */
interface IMainPagePara {
    data: obj,
    urlSite: string
}

interface ICashierPagePara {
    shortcuts?: IKeyModalPara[];
    elements? : ICashierPanel[];
    padDatas? : IInputPad[];
}
/**
 * 模态框ui构造参数
 */
interface IShortcutsPara extends IInputPara{
    needSel? : number,
    // uiAddr? : R_ReqAddr,
    // chkAddr? : R_ReqAddr,
    // dataAddr? : R_ReqAddr,
    shortId? : string,
    shortKey? : string,
    shortIcon? : string,
    shortName? : string,
    panelId? : string,
    ui? : boolean
    shortcuts? : IKeyModalPara[],
    handlerMain?: void,
    itemList?,
    uiType? : number
    hint? : string
    nextField? : obj
    status? : number
    uiTmpl? : string
}

interface IKeyModalPara extends IShortcutsPara{
    title? : string,
    body? : HTMLElement,
    container? : HTMLElement,
    foot? : obj,
    handlerMain? : void,
    callback? (key?, content?, type?) : void,
    keyDownHandle? (e): void
    data? : ICashierPanel,
    inputs? : IInputPara[],
    type? : string
}
/**
 * input
 */
interface IInputPara{
    fieldName? : string,
    fieldRegex? : string,
    inputId? : string,
    inputType? : string,  //1扫描枪；2键盘输入；3键盘选择；4键盘输入后进行扫描
    // uiType : number,   //0数据，1生成模态框，2弹出非模态框窗口
    atrrs? : {
        caption : string,
        currency : string
        dataType : string,
        displayFormat : string
        displayWidth : string
        editFormat : string
        fieldName : string
        readOnly : string
        required : string
        visible : string
    }
    uiAddr? : R_ReqAddr,
    chkAddr? : R_ReqAddr,
    dataAddr? : R_ReqAddr,
    padDatas?: IInputPad[],
    hint? : string
    hintAddr? : R_ReqAddr,
    status? : number, // 前台状态0-->1:前台记录状态1; 前台状态1-->0:执行清空操作
    caption? : string
    nextFields? : string  // nextField影响下个界面取参
    outputField? : string  // outputField在本界面(影响padData和ui)和下个界面生效取参
    fieldRule? : string // 全局变量规则
    panelId? : string   // shortcut中的panelId
}

interface IInputPad{
    // 10.清空全局变量11.清空数据；12.刷新；13.添加；
    // 21.情况fieldName值；22.修改；23.修改fieldName值为负数；
    // 24.修改原fieldName全部行的值；25.当前值为正则改为整数，为负则改为负数
    // 26.数值叠加；27.取单不触发assign
    padType : number,
    executeAddr? : C_R_ReqAddr
    panelId : string  //关联的面板id
    itemId : string  // 匹配itemAddrs中的其中一个
    fieldName? : string
    locFieldName ? : string   // 要取的字段值
    dataList? : obj[]
    excNext? : number // 0.执行dataRule规则，1不执行
}

interface IPrintConfPara {
    printer: number;
    row: number;
    text: string;
    check: boolean;
    scenes : string
    boot : boolean;
    shutDown : boolean
}

interface IRfidConfPara{
    line : number,
    ip : string,
    port : number,
    com : string,
    baud : number,
    aerial : number,
    buzz : boolean,
    led : boolean,
}

interface IDataRulesPara{
    fieldName : string,
    fieldRule : string,
    objType : string,
    toPanelId : string,
    when : string,
    upType : number // 0.不操作 1.从当前panelId取数据改变toPanelId 2.从toPanelId取数据改变当前panelId
    ruleType : number   // 1.计算值 2字符串拼接
}
/* ----- OffLine接口参数 ----- */
interface IFileDataPara{
    version : string;
    fileurl : string;
    filetxt : string;
}
interface ICondPara{
    condId : string
    condType : number
    clientSql : string
    showText : number
}

interface IOffLinePara{
    scene : string;
    sceneId? : string;
    version? : number;
    instance? : string[];
    table? : obj[]
    uuid? : string
}
interface IPosVerPara{
    upData : number;
    upDataUrl : string;
}
interface IPosDataPara{
    upTable : number;
    upTableUrl : string;
}
interface ICreateTablePara{
    tableName : string;
    sql : string;
    uptype : number; // 0不删除表 1删除表
    data : obj[]
    meta : string[]
    dataList : string[][]
}
interface ISceneVerPara{
    scene : string;
    sceneId : string;
    version : number;
    json : string;
    panel : obj[];
    item : obj[];
    cond : obj[];
}
/* ----- OffLine接口参数 ----- */