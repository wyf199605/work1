interface ComInitP {
    dom: HTMLElement;
    field: R_Field;
    data?: obj;

    onExtra?(data: obj, relateCols: string[], isEmptyClear?, isValid?, isReplace?): void
}

interface EditModulePara {
    fields?: ComInitP[],
    auto?: boolean; //是否自动初始化dom
    type?: string;
    container?: HTMLElement;
    defaultData?: obj;
}

//
// interface EditModuleSinglePara{
//     field : R_Field;
//     para: ComInitP
// }
interface CheckValueResult {
    errors?: {
        name: string;
        msg: string;
    }[];

    okNames?: string[];
}
