import tools from './tool';
import request from './request';
import {CONF} from './URLConfig';

export default {
    linkReq: function (link, dataObj) {
        let _a = this.linkParse(link, dataObj), addr = _a.addr, data = _a.data;
        if (link.openType === 'data' || link.openType === 'none') {
            return new Promise((resolve, reject) => {
                request.ajax({
                    url: CONF.siteUrl + addr,
                    data: data,
                    type: link.requestType
                }).then((response) => {
                    if(response.code === 0){
                        let res = response.data,
                            dataList = res.body.dataList,
                            meta = res.body.meta,
                            result = {
                                body: res.body,
                                head: res.head,
                            },
                            data = [];

                        dataList.forEach((list, index) => {
                            let json = {};
                            list.forEach((item, index) => {
                                json[meta[index]] = item;
                            });
                            data.push(json);
                        });
                        console.log(data);
                        result.body.data = data;
                        resolve(result);
                    }else{
                        reject();
                    }
                }).catch((e) => {
                    console.log(e);
                    reject()
                });
            });
        }
        return Promise.reject('');
    },
    linkParse2Url: function (link, dataObj) {
        let _a = this.linkParse(link, dataObj), addr = _a.addr, data = _a.data;
        return tools.url.addObj(addr, data);
    },
    linkOpen: function (link, dataObj, callback) {
        if (['popup', 'newwin'].includes(link.openType)) {
            var _a = this.linkParse(link, dataObj),
                addr = _a.addr,
                data = _a.data,
                isCustom = ~link.dataAddr.indexOf('/'),
                para = {
                inModal: link.openType === 'popup',
                url: isCustom ? tools.url.addObj(addr, data) : null,
                ajaxData: JSON.stringify(isCustom ? data : null)
            };

            //TODO 需要测试一下
            typeof callback === 'function' && callback(para.url, para.ajaxData);

        }
    },
    linkParse: function (link, dataObj) {
        let varData = this.varList(link.varList, dataObj, true), urlPara = {};
        if (link.varType === 2) {
            if (!Array.isArray(varData)) {
                varData = [varData];
            }
            varData.forEach(function (d) {
                for (let key in d) {
                    if (!urlPara[key]) {
                        urlPara[key] = [];
                    }
                    urlPara[key].push(d[key]);
                }
            });
            if (!tools.isEmpty(link.varList) && !link.varList[1]) {
                // 长度等于1
                let varName = link.varList[0].varName.toLowerCase();
                urlPara['selection'] = urlPara[varName];
                delete urlPara[varName];
            }
            for (let key in urlPara) {
                let para = urlPara[key];
                if (Array.isArray(para)) {
                    urlPara[key.toLocaleLowerCase()] = para.join(',');
                }
            }
        }
        return {
            addr: link.dataAddr,
            data: link.varType === 2 ? urlPara : varData
        };
    },
    varList: function (varList, data, isLowerKey) {
        if (varList === void 0) { varList = []; }
        if (isLowerKey === void 0) { isLowerKey = false; }
        if (typeof data === 'undefined') {
            return {};
        }
        let isMulti = Array.isArray(data);
        isMulti || (data = [data]);
        varList = Array.isArray(varList) ? varList : [];
        let varData = data.map(function (d) {
            let tmpData = {};
            varList.forEach(function (v) {
                let value = null, varName = v.varName;
                if (d[varName] !== null && d[varName] !== undefined) {
                    //优先从用户给的data取值
                    value = d[varName];
                }
                else if (!tools.isEmpty(v.varValue)) {
                    //再从服务器给的value
                    value = v.varValue;
                }
                // if (value !== null) {
                let key = isLowerKey ? varName.toLowerCase() : varName;
                tmpData[key] = value;
                // }
            });
            return tmpData;
        });
        if (isMulti) {
            varData = varData.filter(function (data) { return !tools.isEmpty(data); });
            if (tools.isEmpty(varData)) {
                varData = null;
            }
        }
        return isMulti ? varData : varData[0];
    }
}
