/// <amd-module name="EventAction"/>
/// <reference path="module/keyModal/KeyModal.ts"/>
import tools = C.tools;
import {KeyModal} from "./module/keyModal/KeyModal";
import {Com} from "./com";
import {CashierRequest} from "./request/CashierRequest";
import d = C.d;
import {ItemList} from "./module/itemList/ItemList";
import SPA = C.SPA;
import Shell = C.Shell;

/**
 * 按键操作控制台
 */

let scanGunValue = '';
let timer : number;

/**
 * 主界面扫码
 * @param {ICashierPagePara} data
 * @param {KeyboardEvent} e
 */
export function mainKeyDownEvent(data: ICashierPagePara, e: KeyboardEvent) {
    if(scanGunValue === ''){
        timer = Date.now();
    }
    let code = e.keyCode || e.which || e.charCode;
    // A-Z,数字键盘0-9,小键盘0-9，字符-_
    if (((65 <= code && code <= 90) || (48 <= code && code <= 57) || (96 <= code && code <= 105)) || code === 189) {
        scanGunValue += e.key;
    }
    // 扫码录会员卡与商品
    if (code === 13) {
        let type = Com.checkScan(timer, scanGunValue),
            index = scanGunValue.indexOf('_'),
            elements = data.elements || [];

        if (index > -1) { // 去掉'_'后面的字符串
            scanGunValue = scanGunValue.slice(0, index);
        }

        elements.forEach(elem => {
            if (elem.inputs) {
                if (Com.keyFlag) {
                    Com.keyFlag = false;
                } else {
                    return;
                }
                inputs(type, elem, scanGunValue)
            }
        });
        scanGunValue = '';
    }
}

/**
 * 主界面按键F1-F6，esc，后台配置
 * @param {ICashierPagePara} data
 * @param {KeyboardEvent} e
 */
export function eventActionHandler(data: ICashierPagePara, e: KeyboardEvent) {
    let shortcuts = data.shortcuts || [];

    //取消的浏览器默认行为
    e.preventDefault();
    let keyCode = e.keyCode || e.which || e.charCode,
        altKey = e.altKey;

    if(altKey && keyCode === 115){ // alt+F4
        Com.resetCom();
    }else if (shortcuts) {
        if (Com.keyFlag) {
            Com.keyFlag = false;
        } else {
            return;
        }
        let hasKey = false;
        shortcuts.forEach((s: IShortcutsPara) => {
            if (s.shortKey === e.key) {
                hasKey = true;
                createPanel(s, null);
            }
        });
        if (!hasKey) {
            // 若没有匹配到按键
            Com.keyFlag = true;
        }
    } else {
        Com.keyFlag = true;
    }
}

/**
 * 匹配input，执行按键操作
 * @param {string} type 输入类型1.扫码枪，2.按键输入，3.按键选择，5.rfid
 * @param {ICashierPanel} response
 * @param {string} value
 * @param {obj} nextField
 */
export function inputs(type: string, response: ICashierPanel, value: string, nextField?: obj) {

    let regInput: IInputPara = null,
        keyModal: KeyModal = Com.keyModal[Com.keyModal.length - 1],
        inputs: IInputPara[] = response.inputs,
        bill: HTMLElement = keyModal && keyModal.bill,
        billContent: string = bill && bill.innerHTML; // 结账显示框

    // 匹配唯一的input
    let uiAddr: R_ReqAddr,
        dataAddr: R_ReqAddr,
        chkAddr: R_ReqAddr,
        nextFieldParam : obj = {},
        param: obj = {};

    if (!inputs) {
        Com.keyFlag = true;
        return;
    }
    let select = keyModal && keyModal.getSelect();
    if (select) {
        type = Com.KEYSELECT;
    }

    // 匹配input值
    inputs.forEach(i => {
        let inputType = i.inputType;
        if (regInput) {
            return;
        }

        if (inputType === type || tools.isEmpty(type) || (inputType === '4' && (type === '2' || type === '1'))) {
            switch (inputType) {
                case '1': // 扫描枪
                case '2': // 键盘输入
                case '4': // 扫描枪or键盘输入
                case '5': // rfid输入
                    regInput = regExpMatch(i, value);
                    break;
                case '3': // 键盘选中
                    value = select[i.fieldName];
                    regInput = i;
                    break;
            }
        }
    });
    if (!regInput) {
        Com.keyFlag = true;
        return;
    }

    // 带上F6窗口数据---写死
    if(Com.countItemList && Com.modalMainItemList){
        let countData = Com.modalMainItemList.getData();
        param = countData && countData[0] || {};
    }

    let input: IInputPara = Object.assign({}, regInput),
        inputType = input.inputType;
    if(input.inputId === 's0_i100h'){  // 后台要求写死
        input.dataAddr.varList.push({
            varName : 'SELLERID'
        })
    }

    // 全局变量规则执行，判断会员卡是否超时。
    let rule = Com.fieldRule(input.fieldRule, value);

    if (rule.isTimeOut) {
        Com.logTip(rule.msg);
        return;
    }

    input.dataAddr && (dataAddr = input.dataAddr);
    input.uiAddr && (uiAddr = input.uiAddr);
    input.chkAddr && (chkAddr = input.chkAddr);

    let fieldName = input.fieldName;
    if (tools.isNotEmpty(value) && fieldName) {
        param[fieldName] = value;
    }

    // 结账，有billBox时
    if (bill) {
        // 提交，当输入值为空时
        let dAddr = dataAddr.dataAddr;
        if (tools.isEmpty(value) && input.dataAddr) {
            input.dataAddr.dataAddr = tools.url.addObj(dAddr, {
                selection: tools.isNotEmpty(billContent) ? billContent : -1
            })
        }
    }
    if (response && response.uiTmpl === 'sale-bill') {
        if (chkAddr) {
            chkAddr.varList = [{
                varName: fieldName
            }]
        }
    }

    // chkAddr验证,当输入值不为空时
    if (chkAddr && tools.isNotEmpty(value)) {
        let cAddr = chkAddr.dataAddr;
        if (hasVarList(chkAddr, fieldName) && fieldName) {
            chkAddr.dataAddr = tools.url.addObj(cAddr, {
                [fieldName]: value
            });
        }
    }

    let outField: obj = {};
    // 新面板的开启需要在padData规则执行完成之后在打开
    let padDone = () => {
        if (input.hintAddr) {
            CashierRequest(input.hintAddr).then(({response}) => {
                let msg = response && response.req && response.req.dataList && response.req.dataList[0] && response.req.dataList[0][0];
                msg && Com.logTip(msg);
            })
        }

        if (response.printAddr && inputType !== '1') { // 打印
            Com.printReceipt(response.printAddr);
        }

        let status = input.status;
        if (uiAddr) {
            let initUi = () => {
                if (keyModal) {
                    Com.isClose = true;
                }
                nextFieldParam = tools.obj.merge(nextFieldParam, param);
                // nextField,outputField影响下个界面
                let nextField = getNextField(input.nextFields, nextFieldParam);
                createPanel(input, tools.obj.merge(param, nextField), tools.obj.merge(outField, nextField));
            };
            if(tools.isNotEmpty(status)){
                Com.statusJudge(input.status, () => {
                    initUi();
                });
            }else {
                initUi();
            }
        }else if (Com.keyModal[Com.keyModal.length - 1]) { // 若当前有弹框且无ui,f6交易
            if(tools.isNotEmpty(status)){
                Com.statusJudge(input.status, () => {});
            }
            Com.keyFlag = true;
            if(input.fieldName === "PCOUPONCODE" && Com.keyModal.length === 1){ // F6用完优惠券后不关闭F6框

            }else {
                Com.closeLastModalPanel();
            }
            input.hint && Com.logTip(input.hint);
        }else {
            Com.keyFlag = true;
            input.hint && Com.logTip(input.hint);
        }
    };


    param = tools.obj.merge(param, nextField);
    // response为dataAddr返回的数据
    check(input, param).then((response) => {

        let itemData = response && response.data,
            fieldName = input.fieldName;

        // 除了复杂促销，field只会有一条数据，复杂促销不会有outputField
        outField = getOutPutField(input.outputField, itemData && itemData[0], value);
        param = tools.obj.merge(param, outField);
        nextFieldParam = itemData && itemData[0] || {};

        // 挂单
        let ftPadDatas = response && response.ftToPanel;
        if (ftPadDatas) {
            padData(ftPadDatas.padDatas, fieldName, param, padDone, response, value);
        } else {
            padData(input.padDatas, fieldName, param, padDone, response, value);
        }
    })
}

function getOutPutField(outPutField: string, field: obj, value: string) {
    // console.log(field, 'dataAddr返回的数据');
    // outputField在本界面(影响padData和ui)和下个界面生效
    let data = {};
    if (outPutField) {
        let arr = outPutField.split(',');
        arr.forEach(obj => {
            data[obj] = field ? field[obj] : value;
        })
    }
    return data;
}

/**
 * 根据后台返回类型执行相应操作
 * @param response
 * @returns {Promise<{isNext: boolean; isRepeat: boolean}>}
 */
function condition(response): Promise<{ isNext: boolean, isRepeat: boolean }> {
    return new Promise((resolve, reject) => {
        let condition: IConditionPara = response && response.req,
            type = condition && condition.type,
            text = condition && condition.showText,
            modal = Com.keyModal[Com.keyModal.length - 1],
            isNext = false,
            isRepeat = false;

        // 无condition，直接进入下一步
        if (tools.isEmpty(type)) {
            isNext = true;
            resolve({isNext, isRepeat});
            return;
        }
        Com.keyFlag = true;
        let msgDom = d.create(`<div class="padding-30">${text}</div>`),
            para: IKeyModalPara = {
                body: msgDom,
                type: type,
                callback: (e) => {
                    let code = e.keyCode || e.which || e.charCode;
                    switch (type) {
                        case '0':
                        case '2':
                        case '6':
                        case '13':
                            if (code === 13) {
                                Com.closeLastModalPanel();
                            }
                            break;
                        case '1':
                            if (code === 13) { // 重复操作
                                Com.isClose = true;
                                isRepeat = true;
                                resolve({isNext, isRepeat});
                            }
                            break;
                        case '10':
                            if(code === 27){
                                Shell.finger.cancel(function () {});
                            }
                            if(!CA.Config.isProduct && code === 13){
                                // 开启指纹
                                let url = Com.url.login + '';
                                if (condition.addparam) {
                                    url = url + (url.indexOf('?') > -1 ? '&' : '?' + condition.addparam);
                                }
                                url = url + (url.indexOf('?') > -1 ? '&' : '?') + 'accounts=1';
                                Com.finger(msgDom, url, () => {
                                    isRepeat = true;
                                    Com.closeLastModalPanel();
                                    resolve({isNext, isRepeat});
                                });
                            }
                            break;
                    }
                }
            };

        let box = modal && modal.inputBox,
            bill = modal && modal.bill;

        if(type === '6' || (type === '12' && condition && condition.clearGlobal === 1)){
            let data = Com.countItemList.getData()[0];
            Com.countItemList.resetData('RECEIVABLES', data['RECEIVABLE']);
            Com.countItemList.resetData('CHANGE', '0');
        }
        switch (type) {
            case '0':  // 关闭当前框，弹出提示框
            case '1':
                Com.isClose = true;
                initModal(para);
                break;
            case '2': // 弹出提示框
                initModal(para);
                break;
            case '6':  // 不创建ui，打印
                Com.printReceipt({
                    dataAddr : Com.url.printer,
                    type : 'GET',
                    varType : 0
                });
                Com.closeLastModalPanel();
                setTimeout(function () {
                    Com.closeLastModalPanel();
                    initModal(para);
                },1);
                break;
            case '10': // 指纹录入
                let fingerTip = d.create(`<div class="iconfont icon-zhiwen"></div>`);
                d.append(msgDom, fingerTip);
                Com.isClose = true;
                initModal(para);

                if(!CA.Config.isProduct){
                    return;
                }

                // 开启指纹
                let url = Com.url.login + '';
                if (condition.addparam) {
                    url = url + (url.indexOf('?') > -1 ? '&' : '?' + condition.addparam);
                }
                url = url + (url.indexOf('?') > -1 ? '&' : '?') + 'accounts=1';
                Com.finger(fingerTip, url, () => {
                    isRepeat = true;
                    Com.closeLastModalPanel();
                    resolve({isNext, isRepeat});
                });
                break;
            case '11': // 关闭当前弹框、提示信息（非弹框）、进入下一步
                Com.closeLastModalPanel();
                Com.logTip(text);
                isNext = true;
                resolve({isNext, isRepeat});
                break;
            case '12':  // 提示信息，清空输入框，
                if(condition && condition.clearGlobal === 1){
                    Com.printReceipt(condition.printAddr);
                }
                Com.logTip(text);
                box && (box.innerHTML = '');
                modal && (modal.isClear = true);
                break;
            case '13': // 结账，生成提示框
                if (bill) {
                    // 结账校验通过

                    let boxInner = box.innerHTML,
                        billInner = bill.innerHTML,
                        isExist = false,
                        arr = billInner.split(',');
                    arr.forEach(obj => {
                        if(obj === boxInner){
                            isExist = true;
                        }
                    });
                    if(!isExist) {
                        if (bill.innerHTML) {
                            bill.innerHTML += ',';
                        }
                        bill.innerHTML += boxInner;
                    }
                    box.innerHTML = '';
                    modal && (modal.isClear = true);
                }
                initModal(para);
                break;
            case '14':  // 提示信息-》进入下一步
                Com.logTip(text, false, true);
                if(condition && condition.increase){ // 用优惠券后禁用掉f6的esc
                    let keyModal = Com.keyModal[0];
                    keyModal.disabledEsc = true;
                }
                isNext = true;
                resolve({isNext, isRepeat});
                break;
        }

    })
}

/**
 * 创建面板
 * @param {IShortcutsPara} shortcut或者input
 * @param {obj} nextField 由上一级传下来的outputField和nextField
 * @param {obj} field 本界面请求参数
 */
function createPanel(shortcut: IShortcutsPara, field: obj, nextField?: obj) {

    let cb = (addParam?, chkData?) => {
        // 若有addParam需要添加在url后
        let uiAddr: C_R_ReqAddr = shortcut.uiAddr && Object.assign({}, shortcut.uiAddr);
        addParam && (uiAddr['addParam'] = addParam);

        // chkData为check返回的表格数据,返回的数据只有一条
        if (chkData && chkData[0]) {
            field = tools.obj.merge(field, chkData[0])
        }

        if (uiAddr) {
            ajaxLoad(uiAddr, getMainTableData(shortcut, uiAddr.method, field))
                .then(({response, shortcuts, padDatas}) => {
                    let openPage = () => {
                        shortcut && shortcut.hint && Com.logTip(shortcut.hint);
                        // 下岗
                        if (uiAddr.type === 'posloginout') {
                            Com.resetCom(false);
                        } else {
                            condition(response).then(({isNext, isRepeat}) => {
                                if (isNext) {
                                    if(response){
                                        initModal({
                                            data: <ICashierPanel>response,
                                            shortcuts: shortcuts,
                                            nextField: field,
                                        });
                                    }else {
                                        Com.keyFlag = true;
                                        Com.closeLastModalPanel();
                                    }

                                } else if (isRepeat) {
                                    let f = checkOutParam(response);
                                    cb(f.addParam, f.data);
                                }
                            });
                        }
                    };
                    // element同层的padDatas需要在执行所有操作之前先执行
                    if(padDatas && padDatas[0]){
                        padData(padDatas, null, tools.obj.merge(field, nextField), function () {
                            openPage();
                        }, null, null);
                    }else {
                        openPage();
                    }

                });
        }else {
            shortcut && shortcut.hint && Com.logTip(shortcut.hint);
            Com.keyFlag = true;
        }
    };


    if(!shortcut.inputId){
        // F6
        if(shortcut.shortId === 's0_sh6'){
            shortcut.dataAddr.varList.push({
                varName : 'DIS_NAME'
            },{
                varName : 'SELLERID'
            },{
                varName : 'GOODSID'
            })
        }
        check(shortcut, field).then((response) => {
            let f = checkOutParam(response);
            if (shortcut.padDatas) {
                padData(shortcut.padDatas, '', null, function () {
                    cb(f.addParam, f.data);
                }, response, '');
            } else {
                cb(f.addParam, f.data);
            }
        });
    }else {
        cb();  // input已执行完成chkAddr-dataAddr，直接创建ui，无需check；
    }

}

/**
 * check返回参数重新构造
 * @param {obj} response
 * @returns {{addParam: string; data: obj[]}}
 */
function checkOutParam(response: obj): { addParam: string, data: obj[] } {
    let addParam = response && response.req && response.req.addparam,
        data = response && response.data;
    return {addParam, data};
}

/**
 * check校验chkAddr和dataAddr
 * @param {IShortcutsPara | IInputPara} s
 * @param field
 * @returns {Promise<IAjaxSuccess>}
 */
function check(s: IShortcutsPara | IInputPara, field) {
    let chkAddr = s.chkAddr,
        dataAddr = s.dataAddr,
        status = s.status;

    return new Promise(((resolve) => {
        if (chkAddr) {
            accessDataAddr(chkAddr, field, s).then(() => {
                resolve();
            })
        } else {
            resolve();
        }
    })).then(() => {
        if (dataAddr) {
            return accessDataAddr(dataAddr, field, s).then((response) => {
                if(response.dataAddr){
                    return CashierRequest(response.dataAddr)
                }
                Com.statusJudge(status);
                return response;
            })
        }else {
            Com.statusJudge(status);
        }
    });
}

/**
 * 判断varlist中是否有指定name的varName
 * @param dataAddr
 * @param name
 * @returns {boolean} true 不存在， false 存在
 */
function hasVarList(dataAddr : R_ReqAddr, name : string) {
    let tag = true;
    dataAddr.varList && dataAddr.varList.forEach(v => {
        if (v.varName === name) {
            tag = false;
        }
    });

    return tag;
}

function getMainTableData(s: IShortcutsPara, method: string, field: obj) {
    // 从panelId中取数据
    let panelId = s.panelId,
        mainData = null,
        panelItem;

    // 访问chkAddr前需取出panelId表格数据
    if (panelId) {
        panelItem = Com.itemList[panelId];
    }

    // 获取主表数据，这里只支持有一个itemList，F6表格
    if(panelItem){
        for (let item in panelItem) {
            mainData = panelItem[item].getData()[0];
        }
    }

    // F1-4,F1-5, 复杂，挂单 复杂促销及挂单，写死,获取主表选中的数据
    if (['s0_i100d', 's0_i100e', 's0_i100i','s0_i100h' ].includes(s.inputId)) {
        mainData = tools.obj.merge(Com.mainItemList.getSelect(), mainData);
    }

    let newData = [];
    if (method === 'GET' || s.inputId === "s0_i102100") { // put请求赠送礼品操作写死
        // GET请求时候只传一条数据
        field = tools.obj.merge( mainData, field)
    } else {
        // 挂单操作
        newData = Com.mainItemList.getData();
    }

    return newData[0] ? newData : field;
}

/**
 * check请求
 * @param {C_R_ReqAddr} dataAddr或itemAddr
 * @param {obj} field
 * @param {IShortcutsPara} s
 * @returns {Promise<{isNext: any; isRepeat: any}>}
 */
function accessDataAddr(addr: C_R_ReqAddr, field: obj, s: IShortcutsPara) {
    let cb = (addParam?: string, chkData?: obj[]) => {
        let dataAddr = Object.assign({}, addr);
        addParam && (dataAddr['addParam'] = addParam);

        // chkData为check返回的表格数据,返回的数据只有一条
        if (chkData && chkData[0]) {
            field = tools.obj.merge(field, chkData[0])
        }

        // 访问dataAddr获取数据
        return ajaxLoad(dataAddr, getMainTableData(s, dataAddr && dataAddr.method, field))
            .then(({response}) => {
                // 若为chkAddr执行condition操作，否者next
                return condition(response).then(({isNext, isRepeat}) => {
                    if (isRepeat) {
                        // chk 返回的addParam需拼接在url后面
                        let f = checkOutParam(response);
                        return cb(f.addParam, f.data);
                    } else if (isNext) {
                        return response
                    }
                });
            });
    };

    return cb();
}

/**
 * 复杂促销，匹配fieldName对应的值是否相等
 * @param {obj} res
 * @param {ItemList} itemList
 * @param {Function} cb
 */
function keyField(res : obj, itemList : ItemList, cb : Function) {
    let key = res && res.fieldName,
        discount = (res.cusDiscount || 1) * 10,
        itemData = itemList.getData(),
        arr = [];

    res.data.forEach(r => {
        itemData.forEach((item, y) => {
            let disName = tools.isEmpty(item.DIS);
            if (r[key] === item[key] && (disName || (!disName && (discount === item.DIS)))) {
                arr.push({
                    index: y,
                    data: r,
                })
            }
        });
    });
    arr.forEach(obj => {
        cb(obj.data, obj.index);
    })

}

/**
 * 影响其他面板数据规则
 * @param {IInputPad[]} padData
 * @param {string} fieldName 要修改的字段名
 * @param {obj} param
 * @param {Function} cb 所有padData规则执行结束后的回调（padData存在异步）
 * @param {obj} res
 * @param {string} value
 */
function padData(padData: IInputPad[], fieldName : string, param : obj, cb : Function, res : obj, value : string) {
    let keyModal = Com.keyModal[Com.keyModal.length - 1];
    let pad = (obj, isArr = true) => {  // 如果是数组循环执行pad，需要在所有pad执行结束之后再调用回调
        if (obj) {
            param = tools.obj.merge(param, obj);
        }

        let padDatas = (index) => {
            let p: IInputPad = padData && padData[index];
            if (!p && isArr) {
                cb();
                return;
            }else if(!p){
                return;
            }

            let panelId = p.panelId,
                itemId = p.itemId,
                dataList = p.dataList,
                excNext = p.excNext,
                data = Com.data[panelId],
                tableList = data && data.tabeList || [];

            let ajaxData = keyModal && keyModal.getSelect();

            // 有itemId时只匹配并访问当前一个地址
            itemId && tableList.forEach(obj => {
                if (obj.dataAddr.objId === itemId) {
                    tableList = [];
                    tableList.push(obj);
                }
            });

            let request = (n) => {
                let table: TableListPara = tableList[n],
                    padType = p.padType,
                    executeAddr = p.executeAddr;

                n++;
                if (!table) {
                    if (!panelId) {
                        tableDataModify(padType);
                    }
                    if (padType !== 11 && excNext !== 1) {
                        let dataRules = data && data.dataRules,
                            panelId = data && data.panelId;
                        dataRules && Com.count(dataRules, panelId, value, itemId);
                    }
                    index++;
                    padDatas(index);
                    return;
                }

                let addr = table.dataAddr,
                    tItemId = table.itemId,
                    itemList = Com.itemList[panelId][tItemId],
                    select = d.query('.tr-select', itemList.props.dom),
                    num = select && select.dataset.index;

                let tableOperate = (tableData?) => {
                    // 复杂促销
                    let key = res && res.fieldName;
                    if (key && ([22, 24, 25].includes(padType))) {
                        keyField(res, itemList, (d, index) => {
                            if (padType === 22) {
                                for (let name in d) {
                                    if (name !== key) {
                                        tableDataModify(padType, itemList, d, name, index, d, table);
                                    }
                                }
                            } else {
                                tableDataModify(padType, itemList, d, fieldName, index, d, table, null, p.locFieldName);
                            }
                        });

                        // 复杂促销结束后需执行进位计算
                        let mainTableData = Com.mainItemList.getData(),
                            discount = res.cusDiscount;
                        mainTableData.forEach((obj, i) => {
                            let price = obj.REALPRICE || '',
                                str = price + '',
                                arr = str.split('.'),
                                len = arr[1] && arr[1].length || 0,// 实售价小数位数
                                pow = Math.pow(10, len),
                                nums = obj.SALEAMOUNT || 0, // 数量
                                result = Math.round(price * nums * pow)/pow + '',
                                decimal = result.split('.')[1];

                            // 规则2：实售价*件数的结果如果分及分以下有值或数量为奇数直接，实售价四舍五入保留一位
                            let n = 1, isFixed = false;
                            while (n <= len - 1 && tools.isNotEmpty(decimal)) {
                                let value = decimal[n];
                                if(tools.isNotEmpty(value) && value !== '0'){
                                    isFixed = true;
                                }
                                n ++;
                            }
                            if(isFixed || nums%2 !== 0){
                                price = Math.round(price * 10)/10 + '';
                                Com.mainItemList.resetData('REALPRICE', price, i);
                            }
                            // 规则1：如果有贵宾卡（打折低于九折以下），并且应售价>30,实售价的角<5，把实售价的5毛以下抹掉。
                            if(10*discount < 9 && obj.SALEPRICE > 30){
                                price = price + '';
                                let value = price[price.indexOf('.') + 1];
                                if(parseInt(value) < 5){
                                    Com.mainItemList.resetData('REALPRICE', Math.round(price) + '', i);
                                }
                            }
                        });

                    }
                    else {
                        // padData有fieldName时候匹配padData的fieldName
                        if (p.fieldName) {
                            fieldName = p.fieldName.toUpperCase();
                        }
                        tableDataModify(padType, itemList, tableData, fieldName, num, param, table, value, p.locFieldName);
                    }
                    request(n);
                };

                // 刷新，添加数据时候先请求dataAddr获取表格数据
                if (padType === 12 || padType === 13) {
                    param = tools.obj.merge(param, ajaxData);

                    let newData = [];
                    if (padType === 12) {
                        // 如果是刷新数据，需取出原表格数据匹配varList,表格数据优先级低
                        let itemData = itemList.getData(), method = executeAddr && executeAddr.method || addr.method;
                        if (itemData && method === 'GET') {
                            param = tools.obj.merge(itemData[0], param);
                        } else {
                            itemData[0] && itemData.forEach(obj => {
                                newData.push(tools.obj.merge(obj, param));
                            })
                        }
                    }
                    addr['data'] = newData[0] ? newData : param;
                    if(executeAddr){
                        executeAddr['data'] = newData[0] ? newData : param;
                    }
                    CashierRequest(executeAddr || addr).then(({response}) => {
                        tools.isNotEmpty(response.showText) && Com.logTip(response.showText);
                        tableOperate(response.data);
                    });
                } else {
                    tableOperate(dataList);
                }

            };
            request(0);
        };
        padDatas(0);
    };

    let data = res && res.data;
    if (Array.isArray(data) && data[0]) {
        data.forEach((obj, i) => {
            pad(obj, i === data.length -1);
        });
    } else {
        pad(data);
    }
}

/**
 * 表格操作
 * @param {number} padType 类型
 * @param {ItemList} itemList 要操作的表格
 * @param {obj[]} tableData 刷新，添加多条表格数据
 * @param {string} fieldName 要修改的字段名
 * @param num  要修改的第几行的数据
 * @param data 取数据的参数
 * @param {TableListPara} table 复杂促销时候要取table中的keyField
 * @param {string} inputValue  输入框的值
 * @param {string} locFieldName 要取的数据字段名
 */
function tableDataModify(padType: number, itemList?: ItemList, tableData?: obj[], fieldName? : string, num?, data?, table?: TableListPara, inputValue? : string, locFieldName? : string) {
    let selectData: obj,
        locField = locFieldName ? locFieldName : fieldName;
    locField = locField && locField.toLocaleUpperCase();

    switch (padType) {
        case 9:
            Com.resetCom();
            break;
        case 10: // 清空主界面所有数据
            Com.empty();
            Com.posClear();
            break;
        case 11: // 清空
            itemList.emptied();
            break;
        case 12: // 刷新
            itemList.refresh(tableData);
            break;
        case 13: // 添加
            if(fieldName === 'EPC'){
                let itemData = itemList.getData(), barCode = '';
                tableData.forEach(addData => {
                    let isExist = false;
                    itemData.forEach((item, n) => {
                        if(addData.BARCODE && addData.BARCODE === item.BARCODE){
                            isExist = true;
                            let epcCol : string = item.RFIDLIST,
                                epcArr = epcCol.split(','),
                                saleMount = item.SALEAMOUNT || '0',
                                epcExist = false;

                            epcArr.forEach(epc => {
                                if(epc === inputValue){
                                    epcExist = true;
                                }
                            });
                            if(epcExist){
                                return;
                            }
                            // 数量加1

                            itemList.resetData('SALEAMOUNT', eval(saleMount + '+1'), n);
                            itemList.resetData('RFIDLIST', epcCol + ',' + inputValue, n);
                        }
                    });
                    if(!isExist){
                        addData.RFIDLIST = inputValue;
                        itemList.addByData([addData]);
                    }
                });
            }else {
                let keyField = table.keyField, isExist = false, n = null;
                if (keyField) {
                    let data = itemList.getData();
                    tableData.forEach((d, m) => {
                        data.forEach((obj, i) => {
                            if (obj[keyField] === d[keyField]) {
                                isExist = true;
                                n = i;
                            }
                        });
                        if (isExist) {
                            itemList.select(n);
                            Com.logTip('已定位到当前商品数据');
                        } else {
                            itemList.addByData(tableData[m]);
                        }
                        isExist = false;
                    });
                } else {
                    itemList.addByData(tableData);
                }
            }
            break;
        case 21: // 清空fieldName值
            itemList.resetData(fieldName, '', num);
            break;
        case 22: // 修改fieldName值
            itemList.resetData(fieldName, data[locField], num);
            break;
        case 23: // 修改fieldName值为负数
            selectData = itemList.getSelect();
            let resetField = '-' + selectData[locField];
            if(resetField.indexOf('--') > -1){
                resetField = resetField.substr(2, resetField.length);
            }
            itemList.resetData(fieldName, resetField, num);
            break;
        case 24: // 修改原fieldName全部行的值
            let datas = itemList.getData();
            datas.forEach((obj, i) => {
                itemList.resetData(fieldName, data[fieldName], i);
            });
            break;
        case 25: // 当前值为正则改为整数，为负则改为负数
            selectData = itemList.getSelect();
            let value = selectData[locField],
                preValue = data[locField];

            if (typeof value !== 'string') {
                value = value.toString();
            }

            itemList.resetData(fieldName, (value && value.indexOf('-') > -1 ? '-' : '') + preValue, num);
            break;
        case 26:  // 数值叠加
            let tData = itemList.getData(),
                tValue = tData[0] && tData[0][locField];
            itemList.resetData(fieldName, eval(data[locField] + '+' + (tValue ? tValue : '0')));
            break;
        case 27: // 取单不触发assign
            itemList.refresh(tableData, false);
            break;
    }

}

/**
 * 获取nextField字段作用于下个面板
 * @param {string} nextField
 * @param {obj} field
 * @returns {obj}
 */
function getNextField(nextField: string, field: obj): obj {
    let data = field ? field : {}, keyModal = Com.keyModal[Com.keyModal.length - 1];
    if (!keyModal || !keyModal.bodyWrapper) {
        return data;
    }
    let select = keyModal.getSelect();

    nextField && nextField.split(',').forEach(item => {
        // 本层nextField优先级大于上一层
        if (select) {
            data[item] = select[item];
        }
    });

    return data;
}

/**
 * 初始化弹框
 * @param {IKeyModalPara} para
 */
function initModal(para: IKeyModalPara) {
    if (Com.isClose) {
        Com.isClose = false;
        Com.closeLastModalPanel();
    }
    let id = para.data && para.data.panelId || '';
    id += Date.now().toString();

    let hash = SPA.hashCreate('main', 'keyModalPage', [id]);

    SPA.open(hash, para);
}

/**
 *
 * @param {R_ReqAddr} addr
 * @param {obj} field 参数
 * @returns {Promise<{response: obj; shortcuts: IKeyModalPara[]; padDatas: IInputPad[]}>}
 */
function ajaxLoad(addr: R_ReqAddr, field: obj): Promise<{ response: obj, shortcuts: IKeyModalPara[],padDatas : IInputPad[] }> {
    if (!addr) {
        return;
    }

    tools.isNotEmpty(field) && (addr['data'] = field);
    return CashierRequest(addr).then(({response}) => {
        tools.isNotEmpty(response.showText) && Com.logTip(response.showText);
        let elem = response.elements,
            data = elem ? elem[0] : response;
        if (elem && elem[0]) {
            Com.data[(<any>elem[0]).panelId] = data;
        }
        return {
            response: data,
            shortcuts: response.shortcuts,
            padDatas : response.padDatas
        };
    });
}

/**
 * input正则匹配
 * @param input
 * @param {number | string} inputContent
 * @returns {any}
 */
function regExpMatch(input, inputContent: number | string) {
    if (!input) {
        return;
    }
    let regArr, data = null;
    if (inputContent && typeof inputContent !== 'string') {
        inputContent = inputContent.toString();
    }
    // inputs.forEach(input => {
    if (input.fieldRegex) {
        regArr = input.fieldRegex.split(';');
        regArr.forEach(r => {
            let patt = (<string>inputContent).match(r);
            if (patt && patt[0] === inputContent) {
                data = input;
            }
        });
        // 正则为空时，匹配任何值
    } else if (input.fieldRegex === '') {
        data = input;
    }
    // });
    return data;
}

