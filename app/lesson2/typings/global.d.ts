/**
 * rule
 */

interface ILE_JSON {
    code: number;
    data: any;
    msg: string;
    type: 'ui' | 'data'
}

// interface TableConf{
//     table : HTMLTableElement;
//     tableData : TableDataConf;
//     isQuery : boolean;
//     btnArr: BT_Btn[];
// }

interface ILE_Button{
    caption: string,
    icon: string,
    type: 'excel' | 'download';
    link: ILE_Link,
    hint: string,
    refresh?: 0 | 1 | 2 | 3 | 4,
    /*0- 本页面不刷新 并停留在本页
    1 -本页面刷新  并停留在本页
    2- 关闭本页面返回上级页面并不刷新
    3-关闭本页面返回上级页面并刷新
    4-本页不刷新，停留在本页 手动返回上级时刷新上级
     */
    multi?:0 | 1 | 2; // 0不选;1单选,2多选"
    judgefield?: string
    buttonName?: string
}
interface ILE_TableEditSelect {
    fieldname: string
    link: ILE_Link
    multi: boolean
    relateFields: string
    titleField: string
    type: string
}

interface ILE_Table{
    id: string;
    queryId?: string;
    caption: string;
    subCaption?: string;
    key?: string;
    refresh?: boolean;
    multPage?: number; // 0: 不分页;1：后端分页;2：前端分页",
    fieldnames: {fieldname: string, type: string}[];
    edit?: {
        picks?: obj[];
        selects?: ILE_TableEditSelect[]
    };

    noShowField?: string;
    aggregates?: any[];
    button?: ILE_Button[];
    link?: ILE_Link;
    children?: ILE_Table[]
    multivalue?: 0 | 1
}


interface ILE_Query{
    id: string,
    caption: string,
    cond: ILE_Query_Cond[],
    options?: ILE_Query_Option[];
}

interface ILE_Query_Option{
    caption: string,
    type: string,
    fieldNames: string[];
}

interface ILE_Editor {
    id: string;
    caption: string;
    key: string;
    fields: ILE_Editor_Cond[];
    link: ILE_Link;
    defaults: {
        link: ILE_Link;
    },
    button: ILE_Button[];
    noShowField: string;
    noEditField: string;
    assigns?: LE_Assign[];
    edit?: {
        picks?: obj[];
        selects?: ILE_TableEditSelect[]
    };
    view?: boolean,
}

interface LE_Assign{
    fieldname: string,
    id: string,
    link: ILE_Link;
}

interface ILE_Query_Cond extends ILE_Form{
    auto: boolean, // 值改变时是否自动查询
}

interface ILE_Editor_Cond extends ILE_Form{
    assign: ILE_Link,
    showFlag: boolean;
}

interface ILE_Form{
    fieldName: string,
    caption: string,
    tip: string,
    type: 'text' | 'selectText' | 'date' | 'datetime' | 'tag' | 'selectBox'
        | 'number' | 'img' | 'file' | 'richText' | 'pick' | 'textarea' | 'qrcode',
    // text: 文字, selectText: 下拉框, date: 日期, relateTag: 选项查询，显示或隐藏, datetime: 日期时间, tag: 标签, selectBox: 选择框, number: 数字
    multi: boolean, // 多选单选: selectText, tag, selectBox
    extra?: obj, // 其他,预留
    link?: ILE_Link,
    data: {value: string, title:string}[],   //sysfieldlist中的valuelist, link和data异或关系,后台(link优先)
    titleField?: string,
    relateFields?: string,
}

interface ILE_Link {
    dataAddr: string; //后台地址
    varList: {//变量列表，请求获取数据时候带上这些变量
        varName: string,
        varValue: string
    }[];
    varType: number, //参数类型：0:默认参数（在数据库中为昌号开头）;2：selection(以逗号相隔);3.将参数存以数组放在body中
    requestType: 'POST' | 'GET' | 'PUT' | 'DELETE';
    openType: 'popup' | 'newwin' | 'none' | 'download' | 'data';//"popup";//弹出新窗口//"newwin";//打开新窗口//"none";//保持在原界面//"download";//下载界面//"data"数据回填
}

interface ILE_PickUi {
    fieldname:string
    fieldnames:string[]
    id:string
    link:{
        dataArr:string
        openType:string
        requestType:string
        varType:number
        multivalue:number
        recursion:number
    }
}


interface ILE_Field {
    name: string;
    minLength?: number;
    caption: string;
    inputHint?: string;
    minValue?: number;
    checkExpress?: string;
    insertFlag?: boolean;
    modifyFlag?: boolean;
    valueLists?: any;
    defaultValue?: Primitive;
    maxValue?: number;
    dataType?: string;
    displayFormat?: string;
    displayWidth?: number;
    maxLength?: number;


    showFlag?: boolean; // 前台自己加的
}
interface ILE_Page {
    head: {
        caption: string,
        id: string
    },
    body: {
        container?: {
            tab: {
                id: string;
                caption: string;
                querier?: string[],
                table?: string[],
                editor?: string[],
                custom?: string[]
            }[]
            deftPage: number;
        }
        table?: ILE_Table[];
        querier?: ILE_Query[];
        editor?: ILE_Editor[];
        buttons?:ILE_Button[];
    },
    common: {
        fields: ILE_Field[]
    }
}
interface TableRefresher{
    (ajaxData?: obj, after?:(res:obj)=>void, before?:(res:obj)=>void ) : void
}