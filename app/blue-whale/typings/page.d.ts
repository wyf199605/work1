interface BasicPagePara{
    dom? : HTMLElement
    title? : string;
    subButtons? :string;
    ui? :obj
}


interface TablePagePara extends BasicPagePara{
    tableDom : HTMLTableElement;
    mtPara : TableModulePara;
    queryPanel? : HTMLDivElement ;
    queryTpl? : string;
    bodySubButtons : R_Button[];
}

interface DetailPagePara extends BasicPagePara{
    ajaxUrl:string;
}

interface IGroupInfo{
    groupName?:string;
    cloNames?:string;
    columnNumber?:string;
}

interface EditPagePara extends BasicPagePara{
    uiType?: string;
    fm: {
        caption? : string;//panel 标题，有可能为空
        fields? : R_Field [];//面板中元素列表  input date 下拉等
        subButtons? : R_Button[];//操作按钮列表
        defDataAddrList? : R_ReqAddr[];//默认值获取地址列表
        dataAddr? : R_ReqAddr;//获取数据后台地址
        updatefileData? : R_ReqAddr;
        groupInfo?:IGroupInfo[];
    }
}