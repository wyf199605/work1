interface TableModuleCol extends COL{
    link? : R_ReqAddr,
    atrrs? : obj,
    caption?: string,
    noEdit?: boolean,
    noShow?: boolean,
    noAdd?: boolean,
    supportLink?: boolean
}

interface TableModulePara {
    itemId?: string;
    querier?: IBw_Query;
    defDataAddrList?: R_ReqAddr[],
    caption?: string,
    keyField?: string,
    cols: R_Field[],
    subButtons?: R_Button[],
    dataAddr?: R_ReqAddr,
    relateType? : string,
    fixedNum?: number,
    nextAddrs?: R_ReqAddr[],
    subTableList?:TableModulePara []
    multPage: number;
    pictureAddrList?: R_ReqAddr[];
    tableAddr?: IBW_TableAddr;
    printList?: printListArr[];
    uiType?: string;
    aggrList?:R_Aggr[];
    inputs? : R_Input[];
    asynData? : obj[]; // 异步数据
    isAsyn? : boolean //是否异步
    scannableField?: string // 扫码
    scannableType? : number // 0:扫码(RFID设备为扫码枪，手机为二维码)   1.RFID扫码（支持多个）
    scannableTime? : number
    showCheckbox? : boolean // 是否显示按钮
    multiSelect?: boolean; //多选单选
    isSub?:boolean; // 是否为子表,
    data?: obj[];
    isInModal?: boolean;
    uiPath?: R_ReqAddr
}

interface TableModuleConf {
    tableEl: HTMLTableElement,
    scrollEl: HTMLElement | Window,
    headEl?: HTMLElement; // 移动端头部
    fixTop?: number;
    ajaxData?: obj;
    tablePara?: BT_Para;
    hasIndexCol?: boolean;
}


interface printListArr{
    caption:string,
    dataAddr:R_ReqAddr[],
    labelId:number,
    templateLink:R_ReqAddr[]
}




interface TableComConfGetPara {
    tmPara : TableModulePara,
    btPara : BT_Para
}