/// <amd-module name="LeRule"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import Ajax = G.Ajax;
import Rule = G.Rule;
import CONF = LE.CONF;
import SPA = G.SPA;
import {Loading} from "../../../global/components/ui/loading/loading";
export class LeRule extends Rule{
    static NoShowFields = ['GRIDBACKCOLOR', 'GRIDFORECOLOR'];
    static EVT_REFRESH = 'refreshData';

    static isTime(dataType: string) {
        return dataType === LeRule.DT_DATETIME || dataType === LeRule.DT_TIME
    }

    static isImage(dataType: string) {
        return dataType === LeRule.DT_MUL_IMAGE || dataType === LeRule.DT_IMAGE
    }

    static linkParse2Url (link: ILE_Link, dataObj?: obj){
        let {addr, data} = LeRule.linkParse(link, dataObj);
        return CONF.siteUrl + tools.url.addObj(addr, data);
    }
    static linkParse(link: ILE_Link, dataObj?: obj){
        let varData = Rule.varList(link.varList, dataObj, true),
            urlPara: { [key: string]: obj[] | string } = {};

        if (link.varType === 2) {
            if (!Array.isArray(varData)) {
                varData = [varData];
            }
            (varData as obj[]).forEach(function (d) {
                for (let key in d) {
                    if (!urlPara[key]) {
                        urlPara[key] = [];
                    }
                    (urlPara[key] as obj[]).push(d[key])
                }
            });

            if (!tools.isEmpty(link.varList) && !link.varList[1]) {
                // 长度等于1
                let varName = link.varList[0].varName.toLowerCase();
                urlPara['selection'] = tools.str.toEmpty(urlPara[varName]);
                delete urlPara[varName];
            }
            for (let key in urlPara) {
                let para = urlPara[key] as obj[];
                if (Array.isArray(para)) {
                    urlPara[key.toLocaleLowerCase()] = para.join(',');
                }
            }
        }

        let returnData = {
            addr: link.dataAddr,
            data: link.varType === 2 ? urlPara as obj : varData
        };

        if(link.varType === 3 && returnData.data && !Array.isArray(returnData.data)) {
            returnData.data = [returnData.data]
        }
        return returnData;
    }

    static linkOpen(link: ILE_Link, dataObj?: obj) {
        if(['popup', 'newwin'].includes(link.openType)) {

            let {addr, data} = LeRule.linkParse(link, dataObj),
                isCustom = link.dataAddr.indexOf('/') === -1,
                inModal = link.openType === 'popup',
                para = {
                    inModal: inModal,
                    _noHide: inModal,
                    url: !isCustom ? tools.url.addObj(addr, data) : null,
                    ajaxData: JSON.stringify(isCustom ? data : null)
                };
            if(isCustom) {// 通用界面
                SPA.open(['lesson2', addr, para], null, inModal);
            } else { // 自定义
                SPA.open(['lesson2', 'common', para], null, inModal)
            }
        }
    }

    static linkReq(link: ILE_Link, dataObj?: obj) {
        if(link.openType === 'data' || link.openType === 'none') {
            let {addr, data} = LeRule.linkParse(link, dataObj);


            return LeRule.Ajax.fetch(CONF.siteUrl + addr, {
                data,
                data2url: link.varType !== 3,
                type: link.requestType
            })
        }
        return Promise.reject('');
    }

    static Ajax = class extends Ajax {

        fetch(url: string, setting: IRAjaxSetting = {}) {

            // setting.silent = setting.silent === void 0 ? false
            function alert(msg: string) {
                !setting.silent && Modal.alert(msg);
            }

            setting.dataType = setting.dataType || 'json';

            return new Promise<IAjaxSuccess>((resolve, reject) => {

                setting.headers = setting.headers || {};

                let loading: Loading = null;
                if(setting.loading && setting.loading.msg){
                    loading = new Loading(setting.loading);
                }

                super.fetch(url, setting).then((result) => {
                    let {response, xhr} = result;
                    if (G.tools.isEmpty(response)) {
                        loading && loading.destroy();
                        loading = null;
                        Modal.alert('后台数据为空');
                        reject(Ajax.errRes(xhr, 'emptyData', ''));
                        return;
                    }

                    if (typeof response === 'object') {
                        let {code, msg, data} = response;

                        let isLogout = code === 50001;
                        if (isLogout) {
                            loading && loading.destroy();
                            loading = null;

                            Modal.confirm({
                                msg: '登录已超时,是否跳转到登录页',
                                callback: (index) => {
                                    if (index) {
                                        SPA.open(['loginReg', 'login'])
                                        // BW.sys.window.logout();
                                    }
                                }
                            });
                            reject(Ajax.errRes(xhr, 'logout', ''));
                            return;
                        }
                        if (code && code !== 0 && !isLogout) {
                            loading && loading.destroy();
                            loading = null;

                            Modal.alert(msg || '后台错误');

                            reject(Ajax.errRes(xhr, 'code', ''));
                            return;
                        }
                        if (!code) {
                            let dataList = [];
                            let meta = [];
                            if (data && data.body && data.body.dataList && data.body.dataList) {
                                let body = data.body;
                                dataList = body.dataList;
                                meta = Array.isArray(body.meta) ? body.meta : [];
                                data.data = LeRule.getCrossTableData(meta, dataList);
                            }
                            loading && loading.destroy();
                            loading = null;

                            resolve(result);
                        }
                    } else {
                        loading && loading.destroy();
                        loading = null;
                        resolve(result);
                    }
                }).catch(reason => {
                    loading && loading.destroy();
                    loading = null;

                    let xhr = reason.xhr;
                    if (reason.statusText === 'timeout') {
                        Modal.alert('请求超时, 可稍后再试哦~');
                    } else if (xhr.status == 0) {
                        Modal.alert('系统正忙, 可稍后再试哦~');
                    } else {
                        Modal.alert('请求错误,code:' + xhr.status + ',' + xhr.statusText);
                    }

                    reject(reason);
                });

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
            return new LeRule.Ajax().fetch(url, setting);
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
                tmpCol = Object.assign({}, name2Col[lastName]);
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
                tmpCol = Object.assign({}, name2Col[key]);
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

    static getDefaultByFields(cols: ILE_Field[]): obj {
        let defaultData: obj = {};
        cols.forEach(col => {
            let defVal = col.defaultValue;
            if (!tools.isEmpty(defVal)) {
                defaultData[col.name] = defVal.toString().toLowerCase() === '%date%' ?
                    tools.date.format(new Date(), col.displayFormat) : defVal;
            }
        });
        return defaultData;
    }

    static getLookUpOpts(field: ILE_TableEditSelect): Promise<ListItem[]> {
        let titleFiled = field.titleField || field.fieldname;
        return LeRule.Ajax.fetch(CONF.siteUrl + LeRule.reqAddr(field.link))
            .then(({response}) => {
                let data = tools.keysVal(response, 'data' , 'data') || [];
                return data.map(data => {
                    return {
                        text: data[titleFiled],
                        value: data[field.relateFields]
                    };
                });
            });
    }

    static fileUrlGet(md5: string, fieldName = 'FILE_ID') {
        return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
            md5_field: fieldName,
            [fieldName]: md5,
            down: 'allow'
        });
    }

    static imgUrlGet(md5: string, fieldName = 'FILE_ID', isThumb = false) {
        return tools.url.addObj(CONF.ajaxUrl.imgDownload, {
            md5_field: fieldName,
            [fieldName]: md5,
            down: 'allow',
            imagetype: isThumb ? 'thumbnail' : 'picture'
        });
    }
}
