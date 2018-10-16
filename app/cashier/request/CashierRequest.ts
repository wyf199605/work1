///<reference path="../com.ts"/>
/// <amd-module name="SqlLiteRequest"/>
import Ajax = C.Ajax;
import tools = C.tools;
import {Com} from "../com";
import {Modal} from "../global/components/feedback/modal/Modal";
interface ISqlLiteRequestSetting{
    // data?: obj | string | number;
    // timeout?: number;
}

export function CashierRequest(dataAddr : C_R_ReqAddr, error?){
    let ajaxUrl: string = '', setting: IAjaxSetting,
        addr = Object.assign({}, dataAddr),
        method = addr.method,
        data = addr.data;

    if(!Com.sceneVersion){
        Com.sceneVersion = Com.local.getItem('sceneVersion');
    }
    let timeOut = 5000;
    if(dataAddr && (dataAddr.type === 'wxpay')){
        timeOut = 120000;
    }

    let ajaxData: obj = null;
    if(!method){
        method = 'GET';
    }
    if(method === 'GET'){
        ajaxUrl = Com.reqAddr(addr, data);
    }else if(dataAddr.notVarList){
        // 无需匹配varList
        ajaxData = data;
        ajaxUrl = Com.addParam(dataAddr).dataAddr;
    }else {
        if(data && !Array.isArray(data)){
            data = [data];
        }
        let addrFull = data ? Com.reqAddrFull(addr, data) : Com.reqAddrFull(addr);
        ajaxUrl = addrFull.addr;
        ajaxData = addrFull.data;

        !setting && (setting = {});
    }
    Com.loading();
    return new Promise<IAjaxSuccess>(((resolve, reject) => {
        (() => {
            if(window.navigator.onLine && CA.Config.onLine &&
                !(Com.sceneVersion && addr.type === 'panel')){ // ui取离线数据
                return Ajax.fetch(Com.urlSite + ajaxUrl,{
                    type: method,
                    timeout : timeOut,
                    dataType : 'json',
                    headers : {
                        uuid :  CA.Config.isProduct ? Com.geTuuid() : CA.Config.UUID,
                        clientversion : CA.Config.isProduct ? Com.getVersion() : CA.Config.clientversion,
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    data : ajaxData
                });
            }else {
                return SqlLiteRequest.fetch(addr, setting);
            }
        })().then(({response,statusText, xhr }) => {
            Com.loading(false);
            response = restartData(response);
            if(tools.isNotEmpty(response.errorCode) && response.errorCode !== 0){
                Com.keyFlag = true;
                Modal.alert(response && response.msg);
                reject({response,statusText, xhr });
            }else {
                resolve({response, statusText, xhr})
            }
        }).catch(({response, statusText, xhr}) => {
            Com.loading(false);
            Com.keyFlag = true;
            if(statusText === 'timeout'){
                Modal.alert('请求超时')
            }else {
                Modal.alert(response || statusText);
            }
            reject({response,statusText, xhr });
        })
    }))
}

class SqlLiteRequest {
    get(addr : C_R_ReqAddr){
        return new Promise((resolve) => {
            // 根据itemId查找sql或json
            let verPara = Com.sceneVersion,
                data,
                json,
                sql = '',
                msg = '',
                type = addr.type;

            switch (type){
                case 'cond':
                case 'checkaction':
                    data = verPara.cond;
                    break;
                case 'panel':
                    data = verPara.panel;
                    break;
                case 'item':
                case 'finger':
                    data = verPara.item;
                    break;
                case 'config':  // 全局配置
                    json = Com.local.getItem('config');
                    break;
                case 'json': // loginAddr、mainAddr
                    json = JSON.parse(verPara.json);
                    break;
            }

            if(data){
                try {
                    data.forEach(obj => {
                        if(obj[0].split(',')[0] === addr.objId){
                            sql = obj[2];
                            msg = obj[4];
                            throw 'break';
                        }
                    });
                }catch (e){
                    if(e !== 'break'){
                        throw e;
                    }
                }
                switch (type){
                    case 'panel':
                        resolve(JSON.parse(sql));
                        break;
                    case 'item':
                    case 'finger':
                        // 查询sqlLite数据
                        Com.sql.run(sql).then((response) => {
                            response = restartData(response);
                            console.log(response);
                            if(type === 'finger'){
                                resolve(finger(response, addr.data));
                            }
                            resolve(response);
                        });
                        break;
                }
            }else {
                resolve(json);
            }
        })
    }

    fetch(addr : R_ReqAddr, setting?: ISqlLiteRequestSetting) {
        return new Promise( (resolve:IRequestSuccessFun, reject:IRequestErrorFun) => {
            this.request(addr, setting, (result) => {
                resolve(result)
            }, (result) => {
                reject(result)
            })
        })
    }

    protected request(addr : R_ReqAddr, setting: ISqlLiteRequestSetting, success: IRequestSuccessFun, error: IRequestErrorFun){
        // Modal.alert('网络连接断开');
        Com.keyFlag = true;
        Com.loading(false);

        this.get(addr).then((response) => {
            success({
                response : response,
                statusText: '0',
                xhr: null
            });
        })
    }

    protected static errRes(xhr: XMLHttpRequest, statusText: string, errorThrown: string): IAjaxError {
        return {xhr, statusText, errorThrown}
    }

    protected static sucRes(response, statusText?: string, xhr?: XMLHttpRequest): IAjaxSuccess{
        return {response, statusText, xhr}
    }

    static fetch(addr : R_ReqAddr, setting?: IAjaxSetting) {
        return new SqlLiteRequest().fetch(addr, setting);
    }
}

function cpxPromotion() {
    
}

function transaction() {
    
}

function pendOrder() {

}

function takeOrder() {

}

function mainEsc() {

}


/**
 * 指纹校验
 * @param {obj} response
 * @param data
 * @returns {{errorCode: number; msg: string; type: string}}
 */
function finger(response : obj, data) {
    // TODO 校验指纹
    return {
        errorCode : 0,
        msg : '指纹验证成功',
        type : '1'
    }
}

/**
 * 请求数据改造
 * @param response
 * @returns {any}
 */
function restartData(response){
    if(!response) return;
    let dataList = [], meta = [], newData = [];
    if (response.data && response.data.dataList && response.data.dataList[0]) {
        let data = response.data;
        dataList = data.dataList;
        meta = Array.isArray(data.meta) ? data.meta : [];
    }else if( response.data && response.data.body && response.data.body.bodyList &&
        response.data.body.bodyList[0] && response.data.body.bodyList[0].dataList &&
        response.data.body.bodyList[0].dataList[0]){
        let data = response.data.body.bodyList[0];
        dataList = data.dataList;
        meta = Array.isArray(data.meta) ? data.meta : [];
    }
    dataList.forEach(function (datas, keyIndex) {
        newData.push({});
        meta.forEach(function (key, dataIndex) {
            newData[keyIndex][key] = datas[dataIndex];
        });
    });
    response.req = response.data;
    response.data = newData;
    response.meta = meta;
    return response;
}
