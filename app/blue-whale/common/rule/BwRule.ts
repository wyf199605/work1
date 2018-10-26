/// <amd-module name="BwRule"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import CONF = BW.CONF;
import sys = BW.sys;
import Rule = G.Rule;
import tools = G.tools;
import Ajax = G.Ajax;
import {ImgModal, ImgModalPara} from "../../../global/components/ui/img/img";
import {ImgModalMobile} from "../ImgModalMobile";
import {BugReportModal} from "../../module/BugReport/BugReport";

export class BwRule extends Rule {
    /**
     *
     * fieldList 中 dataType 数值
     */


    static EVT_REFRESH = 'refreshData';

    static EVT_ASYN_QUERY = '__TABLE_ASYN_QUERY__';

    static NoShowFields = ['GRIDBACKCOLOR', 'GRIDFORECOLOR'];

    static ColorField = 'STDCOLORVALUE';

    static QUERY_OP: ListItem[] = [
        // {}, // {value: 0,text: 'and'}
        // {}, //{value: 1,text: 'or' }
        {value: 2, text: '等于'},
        {value: 3, text: '大于'},
        {value: 4, text: '大于等于'},
        {value: 5, text: '小于'},
        {value: 6, text: '小于等于'},
        {value: 7, text: '介于'}, // between
        {value: 8, text: '包含于'}, // in
        {value: 9, text: '包含'}, // like
        {value: 10, text: '为空'} // isnull
    ];

    static SQL_SF = null;
    static getSqlRandom(){
        if(!this.SQL_SF){
            this.SQL_SF = 'SQL_SF_' + new Date().getTime() + Math.random();
        }
        return this.SQL_SF;
    }


    static isTime(dataType: string) {
        return dataType === BwRule.DT_DATETIME || dataType === BwRule.DT_TIME
    }

    static isImage(dataType: string) {
        return dataType === BwRule.DT_MUL_IMAGE || dataType === BwRule.DT_IMAGE
    }

    static Ajax = class extends Ajax {

        fetch(url: string, setting: IRAjaxSetting = {}) {

            // setting.silent = setting.silent === void 0 ? false
            function alert(msg: string) {
                !setting.silent && Modal.alert(msg);
            }

            setting.dataType = setting.dataType || 'json';

            return new Promise((resolve, reject) => {
                // debugger;
                if (setting.needGps) {
                    // 超时报错
                    sys.window.getGps((gps) => {
                        let gpsData = gps.success && gps.gps;
                        if (gpsData) {
                            resolve(gpsData)
                        } else {
                            reject('获取gps失败, 请重试')
                        }
                    });
                } else {
                    resolve({})
                }
            }).then((gps) => {
                return new Promise<IAjaxSuccess>((resolve, reject) => {

                    setting.headers = Object.assign(setting.headers || {}, {position: JSON.stringify(gps)});

                    super.fetch(url, setting).then((result) => {
                        // debugger;
                        let {response, xhr} = result;
                        if (tools.isEmpty(response)) {
                            alert('后台数据为空');
                            reject(Ajax.errRes(xhr, 'emptyData', ''));
                            return;
                        }

                        if (typeof response === 'object') {
                            let isLogout = response.errorCode === 50001;
                            if (isLogout) {
                                Modal.confirm({
                                    msg: '登录已超时,是否跳转到登录页',
                                    callback: (index) => {
                                        if (index) {
                                            BW.sys.window.logout();
                                        }
                                    }
                                });
                                reject(Ajax.errRes(xhr, 'logout', ''));
                                return;
                            }
                            if (response.errorCode && response.errorCode !== 0 && !isLogout) {
                                if (tools.isPc || (response.errorCode >= 10000 && response.errorCode <= 100001)) {
                                    alert(response.msg || response.errorMsg || '后台错误');
                                } else {
                                    Modal.confirm({
                                        msg: response.msg || response.errorMsg || '后台错误',
                                        title: '错误提示',
                                        btns: ['取消', '申报故障'],
                                        callback: (flag) => {
                                            if (flag) {
                                                require(['BugReport'], function (bugReport) {
                                                    let pageInfo = {
                                                        param: '',
                                                        url: '',
                                                        reqType: '',
                                                        errMsg: ''
                                                    };
                                                    pageInfo.url = url;
                                                    pageInfo.param = tools.isNotEmpty(setting.data) ? JSON.stringify(setting.data) : '';
                                                    let methods = ['GET', 'POST', 'PUT', 'DELETE'];
                                                    pageInfo.reqType = methods.indexOf(setting.type).toString();
                                                    pageInfo.errMsg = response.msg || response.errorMsg || '后台错误';
                                                    new bugReport.BugReportModal(-1, false, pageInfo);
                                                });
                                            }
                                        }
                                    })
                                }
                                reject(Ajax.errRes(xhr, 'errorCode', ''));
                                return;
                            }
                            if (!response.errorCode) {
                                let dataList = [];
                                let meta = [];
                                if (response.body && response.body.bodyList && response.body.bodyList[0]) {
                                    let data = response.body.bodyList[0];
                                    dataList = data.dataList;
                                    meta = Array.isArray(data.meta) ? data.meta : [];
                                    response.data = BwRule.getCrossTableData(meta, dataList);
                                    response.meta = meta;
                                }

                                resolve(result);
                            }
                        } else {
                            resolve(result);
                        }
                    }).catch(reason => {

                        let xhr = reason.xhr;
                        if (reason.statusText === 'timeout') {
                            alert('请求超时, 可稍后再试哦~');
                        } else if (xhr.status == 0) {
                            alert('系统正忙, 可稍后再试哦~');
                        } else {
                            alert('请求错误,code:' + xhr.status + ',' + xhr.statusText);
                        }

                        reject(reason);
                    });

                })
            })
        }

        protected request(url: string, setting: IRAjaxSetting, success: IRequestSuccessFun, error: IRequestErrorFun) {

            let data = setting.data;
            if (tools.isNotEmpty(data) && typeof data === 'object') {
                // 清理空的数据
                for (let key in data) {
                    if (tools.isEmpty(data[key])) {
                        delete data[key];
                    }
                }

                // 数据添加到url后面
                if (setting.data2url) {
                    url = tools.url.addObj(url, data);
                    delete setting.data;
                }
            }

            super.request(url, setting, success, error);
        }

        static fetch(url: string, setting: IRAjaxSetting = {}) {
            return new BwRule.Ajax().fetch(url, setting);
        }
    };

    /**
     * 重新生成交叉制表的cols数据
     * @param {Array} metaData 数据数组
     * @param {Array} colData 原始cols数据
     * @return {{cols , lockNum}} 返回新的cols与需要的锁列数
     */
    static getCrossTableCols(metaData, colData) {
        let fields, tmpCol, keys,
            name2Col = {},
            newColData = [],
            noDotData = [];
        let isSameBol = true;
        isSame(metaData);

        function isSame(meta) {
            let lastName = '';

            function dealMeta(fn) {
                for (let name of meta) {
                    if (name.indexOf('.') > -1) {
                        if (fn(name)) {
                            break;
                        }
                    }
                }
            }

            dealMeta(function (name) {
                let tempNameArr = name.split('.');
                lastName = tempNameArr[tempNameArr.length - 1];
                return true;
            });
            dealMeta(function (name) {
                let tmpName = name.split('.').pop();
                isSameBol = (tmpName === lastName);
                lastName = tmpName;
                if (!isSameBol) {
                    return true;
                }
            });
        }

        function getColsByName(name: string) {
            for (let i = 0, l = colData.length; i < l; i++) {
                if (colData[i].name === name) {
                    return colData[i];
                }
            }
        }

        keys = metaData.slice(0);
        // console.log(keys);
        colData.forEach(function (col) {
            name2Col[col.name] = col;
        });

        keys.forEach(function (key) {
            fields = key.split('.');
            let fieldLen = fields.length;
            //如果字段中有"."字符，则代表交叉制表，需要替换表格的cols参数
            if (fieldLen > 1) {
                let lastName = fields.pop();
                tmpCol = tools.obj.copy(name2Col[lastName]);
                tmpCol.name = key;
                tmpCol.data = key;
                if (isSameBol) {
                    tmpCol.title = fields.join('.');
                }
                else {
                    tmpCol.title = fields.join('.') + `.${getColsByName(lastName).title}`;
                }
                newColData.push(tmpCol);

            } else {
                tmpCol = tools.obj.copy(name2Col[key]);
                tmpCol.title = tmpCol.caption;
                (tmpCol.title) && noDotData.push(tmpCol);
            }
        });
        newColData = noDotData.concat(newColData);
        return {
            cols: newColData,
            lockNum: noDotData.length
        }
    };

    static getCrossTableData(meta: string[], data: obj[] = []) {
        let newData = [];
        data.forEach(function (datas, keyIndex) {
            newData.push({});
            meta.forEach(function (key, dataIndex) {
                newData[keyIndex][key] = datas[dataIndex];
            });
        });
        return newData;
    };

    /**
     * fieldList 中link属性会触发的动作，link方法的回调函数中最后一个参数，需要对每一个动作编写对应的执行代码
     */

    /**
     * fieldList中 link属性的处理规则
     * @param {object} para
     * @param {string} para.link - link
     * @param {Array} para.varList - linkVarList
     * @param {string} para.dataType - fieldList.dataType
     * @param {object} para.data - 页面的数据
     * @param {function} para.callback - 点击link执行的回调函数, 参数为 (需要执行的动作，动作需要的数据，所有的动作)
     */
    static link(para) {
        let _linkAct = {
            OPEN_WIN: 1,
            DOWNLOAD: 2,
            SHOW_IMG: 3,
            SHOW_IMGS: 4
        };

        let url, rData, action;
        para = Object.assign({
            dataType: '',
            varList: [],
            data: {}
        }, para);

        url = tools.url.addObj(CONF.siteUrl + para.link, BwRule.varList(para.varList, para.data));
        if (para.dataType === BwRule.DT_FILE) {

            BwRule.Ajax.fetch(url)
                .then(({response}) => {
                    rData = response.data[0];
                    //地址加上域名
                    if (rData.IMGADDR) {
                        rData.IMGADDR = CONF.siteUrl + rData.IMGADDR;
                    }
                    if (rData.DOWNADDR) {
                        rData.DOWNADDR = CONF.siteUrl + rData.DOWNADDR;
                    }
                    //执行动作判断
                    if (rData.IMGADDR) {
                        action = _linkAct.SHOW_IMGS;
                    } else {
                        let fileExt = '';
                        if (rData.FILENAME) {
                            fileExt = rData.FILENAME.split('.').pop().toLowerCase();
                        }
                        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'ttif'].indexOf(fileExt) !== -1) {
                            action = _linkAct.SHOW_IMG;
                        } else {
                            action = _linkAct.DOWNLOAD;
                        }
                    }

                    // para.callback(action, rData, _linkAct);
                    switch (action) {
                        case _linkAct.OPEN_WIN :
                            sys.window.open({url: rData.url}, para.openUrl);
                            break;
                        case _linkAct.SHOW_IMGS :
                            let img = [],
                                len = rData.PAGENUM,
                                imgAddr = rData.IMGADDR;
                            for (let i = 1, d, item; i <= len; i++) {
                                d = {page: i};
                                item = BwRule.parseURL(imgAddr, d);
                                img.push(item)
                            }
                            let imgData: ImgModalPara = {
                                downAddr: rData.DOWNADDR,
                                title: rData.FILENAME,
                                img: img,
                                onDownload(url) {
                                    sys.window.download(url);
                                }
                            };
                            // ImgModalMb.show(imgData);
                            if (tools.isMb) {
                                ImgModalMobile.show(imgData);
                            } else {
                                ImgModal.show(imgData);
                            }
                            break;
                        case _linkAct.SHOW_IMG :
                            if (sys.os === 'ad' || sys.os === 'ip') {
                                sys.window.openImg(rData.DOWNADDR);
                            } else if (tools.isMb) {
                                sys.window.download(rData.DOWNADDR);
                            } else {
                                window.location.href = rData.DOWNADDR;
                            }
                            break;
                        case _linkAct.DOWNLOAD :
                            sys.window.download(rData.DOWNADDR);
                            break;
                        default:
                    }
                });
        } else {
            // action = _linkAct.OPEN_WIN;
            sys.window.open({url, gps: para.needGps}, para.openUrl);
            // para.callback(action, rData, _linkAct);
        }
    };

    public static atvar: any;


    /**
     * 解析url的正则 （缓存作用，避免重复解析正则）
     */
    private static parseURLReg = /\{\S+?}/g;

    /**
     * 解析url中{}包起来的参数
     */
    static parseURL(url: string, data) {
        return url.replace(BwRule.parseURLReg, function (w) {
            return encodeURIComponent(tools.str.toEmpty(data[w.slice(1, -1)]));
        });
    };

    static drillAddr(drillAddr: R_ReqAddr, trData: obj, keyField: string) {
        if (drillAddr && !tools.isEmpty(trData[keyField])) {
            return BwRule.parseURL(drillAddr.dataAddr, trData) + '&page=drill'
        } else {
            return '';
        }
    };

    static webDrillAddr(webDrillAddr: R_ReqAddr, trData: obj, keyField: string) {
        if (webDrillAddr && !tools.isEmpty(trData[keyField])) {
            return BwRule.reqAddr(webDrillAddr, trData);
        } else {
            return '';
        }
    };

    static webDrillAddrWithNull(webDrillAddrWithNull: R_ReqAddr, trData: obj, keyField: string) {
        if (webDrillAddrWithNull && tools.isEmpty(trData[keyField])) {
            return BwRule.reqAddr(webDrillAddrWithNull, trData);
        } else {
            return '';
        }
    };


    static checkValue(rs, postData, confirm) {
        let data = tools.keysVal(rs, 'body', 'bodyList', 0),
            sure = () => {
                BwRule.Ajax.fetch(BW.CONF.siteUrl + data.url, {
                    type: 'POST',
                    data: JSON.stringify(postData),
                }).then(() => {
                    typeof confirm === 'function' && confirm();
                });
                // BwRule.ajax(BW.CONF.siteUrl + data.url, {
                //     type: 'POST',
                //     data: JSON.stringify(postData),
                //     success: function (r) {
                //         confirm();
                //     }
                // });
            };
        if (!tools.isEmpty(data) && !tools.isEmpty(data.type)) {
            if (data.type === 0) {
                Modal.alert(data.showText);

            } else {
                Modal.confirm({
                    msg: data.showText,
                    callback: (index) => {
                        // debugger;
                        if (index == true) {
                            sure()
                        }
                    }
                });
            }
            //  typeof callback === 'function' && callback();
        } else {
            typeof confirm === 'function' && confirm();
            // typeof callback === 'function' && callback();
        }
    }

    static getLookUpOpts(field: R_Field, data?: obj): Promise<ListItem[]> {
        return BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(field.dataAddr, data), {
            needGps: field.dataAddr.needGps
        }).then(({response}) => {
                return response.data.map(data => {
                    return {
                        text: data[field.name],
                        value: data[field.lookUpKeyField]
                    };
                });
            });
    }

    static getDefaultByFields(cols: R_Field[]): obj {
        let defaultData: obj = {};
        cols.forEach(col => {
            let attrs = col.atrrs;
            let defVal = attrs && attrs.defaultValue;
            if (!tools.isEmpty(defVal)) {
                defaultData[col.name] = defVal.toString().toLowerCase() === '%date%' ?
                    tools.date.format(new Date(), attrs.displayFormat) : defVal;
            }
        });
        return defaultData;
    }

    /**
     * 通过varlist获取old变量数组, 返回的字段名
     * @param {R_VarList[]} varList
     * @return {string[]}
     */
    static getOldField(varList: R_VarList[]) {
        // 获取有OLD_开头的字段
        let olds: string[] = [];
        Array.isArray(varList) && varList.forEach(v => {
            if (v.varName.match(/^OLD_/)) {
                olds.push(v.varName.slice(4));
            }
        });

        return olds;
    }

    static addOldField(olds: string[], data: obj[] | obj) {
        let multi = Array.isArray(data);
        if (!multi) {
            data = [data]
        }

        // 给old字段赋值
        olds.forEach(name => {
            (<obj[]>data).forEach(function (o) {
                if (name in o) {
                    o[`OLD_${name}`] = o[name];
                }
            });
        });

        return multi ? data : data[0];
    }

    static maxValue(val, dataType: string, maxValue: number) {

        if (typeof maxValue !== 'number' || (typeof val !== 'string' || dataType)) {
            return val;
        }

        let maxStr = maxValue.toString(2),
            len = maxStr.length;

        if (maxStr[len - 1] === '1') {
            val = (<string>val).toUpperCase();
        } else if (maxStr[len - 2] === '1') {
            val = (<string>val).toLowerCase();
        }

        return val;
    }

    static beforeHandle = {
        table(tableData: any): void {

            !tools.isEmpty(tableData.cols) && BwRule.beforeHandle.fields(tableData.cols, tableData.uiType); //列数据
            tableData.fixedNum = 1; //锁列数
            tableData.uiType = tools.isEmpty(tableData.uiType) ? null : tableData.uiType;


            return null;
        },
        fields(cols: R_Field[], uiType: string) {

            for (let col of cols) {

                col.title = col.caption;
                col.valueLists = tools.isEmpty(col.atrrs) ? "" : col.atrrs.valueLists;
                col.noSum = tools.isEmpty(col.atrrs) ? "" : col.atrrs.noSum;
                // col.multiPick = tools.isEmpty(col.multiPick) ? null : col.multiPick;
                col.dataType = tools.isEmpty(col.atrrs) ? "" : col.atrrs.dataType;
                col.displayFormat = tools.isEmpty(col.atrrs) ? "" : col.atrrs.displayFormat;
                col.trueExpr = tools.isEmpty(col.atrrs) ? "" : col.atrrs.trueExpr;
                col.displayWidth = tools.isEmpty(col.atrrs) ? "" : col.atrrs.displayWidth;
                col.isCanSort = true;

                if (col.elementType == 'lookup') {
                    //look up
                    col.comType = 'selectInput';// --------------
                    col.isCanSort = false;

                } else if ((col.elementType == 'treepick' || col.elementType == 'pick')) {

                    //PICK UP
                    col.comType = 'tagsInput';// --------------
                    col.multiValue = col.atrrs.multValue; //单选或多选
                    col.relateFields = col.assignSelectFields;

                } else if (col.atrrs && col.atrrs.dataType == '43') {
                    //文件上传
                    col.comType = 'file';// --------------
                    col.relateFields = ['FILE_ID'];// --------------

                } else if (col.atrrs && col.atrrs.dataType == '30') {

                    //富文本
                    col.comType = 'richText';// --------------
                    col.isCanSort = false;

                } else if (col.atrrs && col.atrrs.dataType == '17') {
                    //toggle
                    col.comType = 'toggle';// --------------
                } else if (col.atrrs && col.atrrs.dataType == '12') {
                    //日期时间控件
                    col.comType = 'datetime';// --------------

                } else {
                    col.comType = 'input';// --------------
                }

                if (tools.isNotEmpty(col.subcols)) {
                    BwRule.beforeHandle.fields(<R_Field[]>col.subcols, uiType);
                }
            }

        },
    };

    // static field2inputType(field: R_Field) {
    //
    //     let attrs = field.atrrs,
    //         dataType = attrs && attrs.dataType,
    //         elementType = field.elementType,
    //         inputType = '';
    //
    //     if(elementType === 'value' || elementType === 'lookup' || attrs.valueLists){
    //         //look up
    //         inputType = 'selectInput';
    //
    //     } else if((elementType == 'treepick' || elementType == 'pick')){
    //         //PICK UP
    //         if(field.multiPick && field.name === 'ELEMENTNAMELIST' || elementType === 'pick'){
    //             inputType = 'pickInput';
    //         }else{
    //             inputType = 'tagsInput';//
    //         }
    //
    //     } else if(dataType == '43'){
    //         //文件上传
    //         inputType = 'file';
    //
    //     } else if(dataType == '30'){
    //
    //         //富文本
    //         inputType = 'richText';// --------------
    //
    //     } else if(dataType == '17'){
    //         //toggle
    //         inputType = 'toggle';// --------------
    //     } else if(dataType == '12'){
    //         //日期时间控件
    //         inputType = 'datetime';// --------------
    //
    //     }else{
    //         inputType = 'text';// --------------
    //     }
    //
    //     return inputType;
    // }


    static reqAddrCommit = {
        1: Rule.reqAddrCommit[1],
        2: function (reqAddr: R_ReqAddr, data?: obj | obj[]) {
            //参数构造
            let newData = [],
                params: any = data;
            if (data && data[0]) {
                data[0].forEach((s, i) => {
                    newData.push({});
                    for (let item in s) {
                        reqAddr.varList.forEach(v => {
                            if (v.varName === item) {
                                newData[i][item.toLowerCase()] = s[item];
                            }
                        })
                    }
                });

                params = JSON.stringify({
                    param: [{
                        insert: newData,
                        itemId: data[1].itemId
                    }]
                });
            }
            return {
                addr: reqAddr.dataAddr,
                data: params
            }
        },
        3: function (reqAddr: R_ReqAddr, data?: obj | obj[]) {
            return {
                addr: tools.url.addObj(reqAddr.dataAddr, {'atvarparams': JSON.stringify(BwRule.atvar.dataGet())}),
                data: {}
            }
        }
    };


    static fileUrlGet(md5: string, fieldName = 'FILE_ID', isThumb = false) {
        return tools.url.addObj(CONF.ajaxUrl.imgDownload, {
            md5_field: fieldName,
            [fieldName]: md5,
            down: 'allow',
            imagetype: isThumb ? 'thumbnail' : 'picture'
        });
    }
}
