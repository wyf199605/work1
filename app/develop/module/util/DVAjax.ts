/// <amd-module name="DVAjax" />
import Ajax = G.Ajax;
import config = DV.CONF;
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import SPA = G.SPA;

export class DVAjax {
    // treeList管理
    static menuQueryAjax(nodeId: string, cb: Function, setting?: IRAjaxSetting, treeIdUrl?: string) {
        let url = config.ajaxUrl.menuQuery;
        url = tools.isNotEmpty(nodeId) ? url + '/' + nodeId : url;
        url = tools.isNotEmpty(treeIdUrl) ? url + treeIdUrl : url;
        setting = setting || {type: 'GET', data: []};
        DVAjax.Ajax.fetch(url, setting).then(({response}) => {
            cb(response);
        }).catch((error) => {
            console.log(error);
        });
    }

    // 查询数据库资源
    static dataSourceQueryAjax(cb: Function) {
        let url = config.ajaxUrl.datasourceQuery;
        DVAjax.Ajax.fetch(url).then(({response}) => {
            let arr = [];
            response.dataArr.forEach((item) => {
                arr.push(item['DATA_SOURCE']);
            });
            cb(arr);
        });
    }

    // 查询基表字段
    static baseTableQueryAjax(baseTable: string, cb: Function) {
        let url = config.ajaxUrl.baseTableQuery + '/' + baseTable;
        DVAjax.Ajax.fetch(url).then(({response}) => {
            cb(response);
        });
    }

    // 主功能
    static primaryFunctionAjax(itemId: string, cb: Function) {
        let url = config.ajaxUrl.primaryFunction + '/' + itemId;
        DVAjax.Ajax.fetch(url).then(({response}) => {
            cb(response);
        });
    }

    // item查询
    static itemQueryAjax(cb: Function, itemId?: string, settings?: IRAjaxSetting) {
        let url = config.ajaxUrl.itemQuery;
        if (itemId) {
            url = config.ajaxUrl.itemQuery + '/' + itemId;
        }
        DVAjax.Ajax.fetch(url, settings).then(({response}) => {
            cb(response);
        });
    }

    // item新增
    static itemAddAndUpdateAjax(cb: Function, setting: IRAjaxSetting) {
        DVAjax.Ajax.fetch(config.ajaxUrl.primaryFunction, setting).then(({response}) => {
            cb(response);
        });
    }

    // item删除list类型
    static itemDelete(cb: Function, setting: IRAjaxSetting,type?:string) {
        let url = type === 'list' ?config.ajaxUrl.primaryFunction : config.ajaxUrl.itemMenuDelete;
        DVAjax.Ajax.fetch(url, setting).then(({response}) => {
            cb(response);
        });
    }
    // 变量管理
    static varDesignAjax(cb: Function, settings?: IRAjaxSetting) {
        let url = config.ajaxUrl.varDesign;
        settings = settings || {type: 'GET', data: []};
        DVAjax.Ajax.fetch(url, settings).then(({response}) => {
            cb(response);
        });
    }

    // 元素管理
    static elementDesignAjax(elementType: string, cb: Function, settings?: IRAjaxSetting) {
        let url = config.ajaxUrl.elementDesign;
        if (elementType !== '') {
            url = config.ajaxUrl.elementDesign + '/' + elementType;
        }
        settings = settings || {type: 'GET', data: []};
        DVAjax.Ajax.fetch(url, settings).then(({response}) => {
            cb(response);
        }).catch((error) => {
            console.log(error);
        })
    }

    // 字段编辑器
    static fieldManagerAjax(setting: IRAjaxSetting, cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.fieldEditor, setting).then(({response}) => {
            cb(response);
        }).catch((error) => {
            console.log(error);
        })
    }

    // 加密密码
    static encyptionPassword(pwd: string, cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.encyption + pwd).then(({response}) => {
            cb(response);
        })
    }

    // 登录
    static login(setting: IRAjaxSetting, cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.login, setting).then(({response}) => {
            cb(response);
        })
    }

    //  登出
    static logout(cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.logout).then(({response}) => {
            cb(response);
        })
    }

    // 查询item关联的element元素
    static queryItemRelatedElements(itemId: string, elementType: string, cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.queryItemRelatedElements + '/' + itemId + '?elementtype=' + elementType)
            .then(({response}) => {
                cb(response);
            })
    }

    // 查询item关联的条件
    static queryItemRelatedConds(itemId: string, cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.queryItemRelatedCond + '/' + itemId)
            .then(({response}) => {
                cb(response);
            })
    }

    // 新增/修改/删除Cond
    static handlerConditons(settings: IRAjaxSetting, cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.queryCondition, settings).then(({response}) => {
            cb(response);
        })
    }

    // 获取APPID
    static getAppId(cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.getAppId).then(({response}) => {
            cb(response.dataArr);
        })
    }

    // 菜单预览
    static interface(cb: Function) {
        DVAjax.Ajax.fetch(config.ajaxUrl.interface).then(({response}) => {
            cb(response);
        })
    }

    // item预览
    static itemInterface(itemId:string,cb:Function,errorcb?:Function){
        DVAjax.Ajax.fetch(tools.url.addObj(config.ajaxUrl.itemInterface,{item_id:itemId})).then(({response}) => {
            cb(response);
        }).catch((error)=>{
            errorcb(error);
        })
    }

    // 生成脚本并打包
    static packaing(id: string[]) {
        let str = '?id=',
            len = id.length;
        if (tools.isNotEmpty(id)) {
            id.forEach((idStr, index) => {
                if (index !== len - 1) {
                    str = str + idStr + ','
                } else {
                    str = str + idStr;
                }
            })
        }
        // 打开新页面进行下载
        window.open(config.ajaxUrl.downloadScript + str);
    }

    // 统一错误处理
    static Ajax = class extends Ajax {
        fetch(url: string, setting: IRAjaxSetting = {}) {

            function alert(msg: string) {
                !setting.silent && Modal.alert(msg);
            }

            setting.dataType = setting.dataType || 'json';

            // setting.xhrFields = {
            //     withCredentials: true
            // };
            return new Promise<IAjaxSuccess>((resolve, reject) => {
                super.fetch(url, setting).then((result) => {
                    let {response, xhr} = result;

                    if (tools.isEmpty(response)) {
                        alert('后台数据为空');
                        reject(Ajax.errRes(xhr, 'emptyData', ''));
                        return;
                    }
                    if (typeof response === 'object') {
                        let isLogout = response.errorCode === 50001;
                        if (isLogout) {
                            SPA.open(SPA.hashCreate('loginReg', 'login'));
                            reject(Ajax.errRes(xhr, 'logout', ''));
                            return;
                        }

                        if (response.errorCode && response.errorCode !== 0 && !isLogout) {
                            response.errorCode !== 30007 && alert(response.msg || response.errorMsg || '后台错误');
                            reject(Ajax.errRes(xhr, 'errorCode', ''));
                            return;
                        }
                        if (!response.errorCode) {
                            resolve(result);
                        }
                    } else {
                        resolve(result);
                    }

                }).catch(reason => {

                    let xhr = reason.xhr;
                    if (xhr.status == 0) {
                        alert('系统正忙,可稍后再试哦~');
                    } else {
                        alert('请求错误,code:' + xhr.status + ',' + xhr.statusText);
                    }
                    reject(reason);
                });
            })
        }

        static fetch(url: string, setting: IRAjaxSetting = {}) {
            return new DVAjax.Ajax().fetch(url, setting);
        }
    }
}