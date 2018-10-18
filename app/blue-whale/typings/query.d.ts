/**
 * 查询器
 */

interface QueryConf {
    caption: string;
    field_name: string;
    dynamic: number;
    link: string;
    type: string;
    value_list?: string[];
    atrrs? : obj;
    data? : obj[];
    endFieldName? : string;
    startFieldName? : string;
}


interface QueryParam {
    field?: string;
    values?: any[];
    not?: boolean;
    op?: number;
    params?: QueryParam[];

    andOr?: boolean;

}
interface IBw_Query{
    queryType: number;
    atvarparams? : QueryConf[]
    queryparams0? : QueryConf;
    queryparams1? : QueryConf[];
    hasOption : boolean;
    scannableField? : string;
    scannableType? : number;
    scannableTime? : number
    autTag: number;
    uiPath?: R_ReqAddr;
    setting? : {
        settingId: number;
        setContent : string;
    }
}


interface QueryConfigPara{
    showFields? : ListItem[];
    showFieldsDataType? : string[];
    sortFields? : string[];
    groupByFields? : string[];
    itemRepeat? : boolean;
    itemCount? : boolean;
    itemSumCount? : boolean;
    topN? : number;
    restrictionFirst? : boolean;
    section? : boolean;
    sectionParams? : {
        leftOpenRightClose? : boolean,
        sectionField? : string,
        sectionNorm? : string,
        avgSection? : boolean,
        sections? : number[]
    }
}

interface QueryConfigDom {
    limitDom : HTMLElement;
    cols : R_Field[];
    setting : saveConfigPara;
}

interface saveConfigPara extends QueryConfigPara{
    sectionNumber? : number
}