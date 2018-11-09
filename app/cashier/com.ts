/// <amd-module name="Com"/>
import {ItemList} from "./module/itemList/ItemList";
import tools = C.tools;
import Rule = C.Rule;
import {CashierRequest} from "./request/CashierRequest";
import Shell = C.Shell;
import {KeyModal} from "./module/keyModal/KeyModal";
import SPA = C.SPA;
import {Modal} from "./global/components/feedback/modal/Modal";
import d = C.d;
import {cashReceiptPrint} from "./module/print/Print";
/**
 * 全局变量，全局函数方法
 */
export class Com{
    static SCAN = '1';
    static KEYBOARD = '2';
    static KEYSELECT = '3';
    static SCANANDKEYBOARD = '4';
    static RFID = '5';
    static isShell = ('AppShell' in window);

    static confModal : Modal; // 登录页f2配置
    static urlSite : string;
    static url = {
        registered : '/pos/posregistered',  // 注册验证
        register : '/pos/posregister',  // 注册
        index : '/index?output=json', //
        config : '/pos/config/cashier', // 获取配置信息
        login: '/pos/poslogin/s0',  // 登录验证
        page : '/pos/page/cashier/{sceneId}',
        printer : '/pos/posprint/s0/s0_p1', // 打印地址
        posClear : '/pos/pclear', // 注销
        reset : '/pos/posclear',
        macList : '/pos/posconfig/mac_list' // mac_id列表地址
    };

    static itemList : obj = {};   // 表格
    static keyModal : KeyModal[] = [];
    static data = [];  // 表格数据
    static mainAddr : R_ReqAddr;  // loginAddr登录页和mainAddr主页地址，若无loginAddr则直接进入到主页
    static isClose : boolean = false; // 是否关闭上一个模态框
    static mainItemList : ItemList;  // p3主表
    static countItemList : ItemList; // p4结账
    static modalMainItemList : ItemList; // F6主表
    static tipEl : HTMLElement; // 提示
    static loadingEl : HTMLElement;  // 加载效果
    static sceneVersion : ISceneVerPara; // 场景版本数据，离线使用
    static keyFlag : boolean = true;  // 处理按键多次触发,只有当前按键操作并加载完成后才可以执行下一次按键
    static status : number = 0; //
    static clearItem = {}; // 需要清空数据的item
    static _config : obj[]; // 全局变量配置信息

    /**
     * 根据cfgName取全局变量的value值
     * @param {string} cfgName
     * @returns {any}
     */
    static getConfigValue(cfgName : string){
        let value = null;
        Com.config.forEach(obj => {
            if(obj.cfgName === cfgName){
                value = obj.cfgValue
            }
        });
        return value;
    }

    static get config() : obj[]{
        if(!Com._config){
            Com._config = Com.local.getItem('config');
        }
        return Com._config;
    }

    /**
     * 下岗回到登录页，清空数据
     * @param {boolean} isClear
     */
    static resetCom(isClear = true){
        Com.itemList = {};
        Com.keyModal = [];
        Com.data = [];
        Com.mainAddr = null;
        Com.isClose = false;
        Com.mainItemList = null;
        Com.countItemList = null;
        Com.modalMainItemList = null;
        Com.tipEl = null;
        Com.loadingEl = null;
        Com.sceneVersion = null;
        Com.keyFlag = true;
        Com.status = 0;
        Com.clearItem = {};
        Com._config = null;
        Shell.rfid.stop(function () {});
        if(isClear){
            Com.posClear(Com.url.posClear).then(() => {
                SPA.open(SPA.hashCreate('index', 'login'));
            });
        }else {
            SPA.open(SPA.hashCreate('index', 'login'));
        }

    }

    /**
     * 关闭最后一个弹框
     */
    static closeLastModalPanel(){
        let modal = Com.keyModal[Com.keyModal.length - 1];
        if(!modal){
            return;
        }
        let src = window.location.href;
        let str : string = src.substr(src.indexOf('#') + 1, src.length);

        SPA.close(str)
    }

    /**
     * 开启指纹验证
     * @param msgDom  指纹信息提示的Dom
     * @param url
     * @param cb
     */
    static finger(msgDom : HTMLElement, url : string, cb : Function){
        if(CA.Config.isProduct){
            let device = Shell.base.device,
                devData = device && device.data;
            Shell.finger.get({
                type: 0,
                option: 0,
            }, (ev : obj) => {
                msgDom.innerHTML = ev.msg;
                if(ev.success === true) {
                    let data : obj = ev.data;
                    msgDom.innerHTML = '正在加载数据';
                    CashierRequest({
                        dataAddr : url,
                        method : 'post',
                        objId : Com.getConfigValue('user_login'),
                        type : 'finger',
                        addParam :'cpuserialno=' + (devData && devData.cpu),
                        data:  {
                            fingertype : data.fingerType,
                            fingerprint : data.fingerPrint,
                        },
                        notVarList : true
                    }).then(({response}) => {
                        msgDom.innerHTML = response.msg;
                        let type = response.type;
                        if (type === '1') {
                            cb(response);
                        }else {
                            Com.finger(msgDom, url, cb);
                        }
                    }).catch((e) => {
                        Com.finger(msgDom, url, cb);
                    })
                }
            }, (ev) => {
                //指纹实时信息返回
                msgDom.innerHTML = ev.msg;
            });
        }else {
            CashierRequest({
                dataAddr : url,
                method : 'post',
                addParam : CA.Config.cpuserialno,
                data:  {
                    fingertype : CA.Config.fingertype,
                    fingerprint : CA.Config.fingerprint,
                },
                notVarList : true
            }).then(({response}) => {
                let type = response.type;
                if (type === '1') {
                    cb(response);
                }else {
                    Com.finger(msgDom, url, cb);
                }
            }).catch((e) => {
                Com.finger(msgDom, url, cb);
            })
        }

    }

    /**
     * 全局变量规则
     * @param fieldName 变量名
     * @param value
     */
    static fieldRule(fieldName : string, value : string) : obj{
        let rule = {};
        switch (fieldName) {
            case 'CURCUSID':   // 时间戳判定
                let val = 0;
                Com.config.forEach(obj => {
                    if (obj.cfgName === "TimeStampSeconds") {
                        val = parseInt(obj.cfgValue);
                    }
                });

                let timestamp = Date.parse(new Date().toString()) / 1000,
                    time;
                let index = value.indexOf('_');
                if (index > -1) {
                    time = value.slice(index + 1, value.length);
                }

                let isTimeOut = timestamp - parseInt(time) > val;
                rule = {
                    isTimeOut : isTimeOut,
                    msg :  '会员卡号已失效：10  ' + Com.timestamp(time * 1000)
                }
        }
        return rule;
    }

    /**
     * 时间戳转日期
     * @param value
     * @returns {any}
     */
    static timestamp(value : number) : string{
        (<any>Date.prototype).Format = function (fmt) { //author: meizz
            let o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (let k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };
        return (<any>new Date(value)).Format("yyyy-MM-dd hh:mm:ss");
    }

    /**
     * 清空主界面表格数据
     */
    static empty(){
        for(let item in Com.clearItem){
            let itemList = Com.clearItem[item];
            if(itemList){
                itemList.emptied();
            }
        }
    }

    /**
     * 全局变量状态位判断
     * @param status
     * @param cb
     */
    static statusJudge(status : number, cb? : Function){
        // 从1->0清空,置0
        if(status === 0 && Com.status === 1){
            Com.status = 0;
            Com.empty();

            Com.posClear().then(() => {
                cb && cb();
            });
        }else if(status === 1 && Com.status === 0){
            // 从0->1，置1
            Com.status = 1;
            cb && cb();
        }else {
            cb && cb();
        }
    }


    static posClear(url?){
        return CashierRequest({
            dataAddr : url ? url : Com.url.reset
        })
    }

    /**
     * 1.计算金额 2.字符串连接 3.条件判断
     * @param dataRules
     * @param content 手动输入的值
     * @param itemId
     * @param panelId  父节点id
     */
    static count(dataRules : IDataRulesPara[], panelId : string, content? : string, itemId? : string){
        dataRules && dataRules.forEach((obj : IDataRulesPara) => {
            if(itemId){
                // 若有配置itemId，只有itemId等于dataRule中的itemId时候才出发dataRule（p2有多个item情况）
                if(itemId !== obj.itemId){
                    return;
                }
            }
            let fieldRule = obj.fieldRule.replace(')', '').split('('),
                itemList = Com.itemList[panelId],
                toItemList = Com.itemList[obj.toPanelId],
                res = Com.data[panelId],
                when = obj.when,
                data = [],
                changeItems, // 数据变动的item
                whenData = [],
                pass = true,
                upType = obj.upType,
                ruleType = obj.ruleType,
                resData = {},
                sum : any = 0,
                items;

            if(res && res.inputs){
                res.inputs.forEach(r => {
                    resData[r.fieldName] = content;
                });
            }

            if(upType === 1){
                items = itemList;
                changeItems = toItemList;
            }else if(upType === 2){
                items = toItemList;
                changeItems = itemList;
            }else if(upType === 0){
                return;
            }

            if(!itemList || !toItemList){
                return;
            }

// debugger;
            Object.keys(items).forEach(key => {
                let item = <ItemList>items[key],
                    getData = item.getData();

                getData && getData.forEach(p => {
                    // 浅拷贝、对象属性的合并
                    let newObj = (<any>Object).assign(resData,p);
                    // 添加（解析模版 模板中的{{xxx}} 对应 data中的属性名xxx）
                    data.push(tools.str.parseTpl(fieldRule[1]? fieldRule[1] : fieldRule[0],newObj));

                    when && (whenData.push(tools.str.parseTpl(when, newObj)));
                });

                // 后台条件判断
                whenData.forEach(w => {
                    if(!eval(w)){
                        pass = false;
                    }
                });
                if(!pass){
                    return;
                }
                // 写死，实售价
                // if(obj.fieldRule.indexOf('REALPRICE') > -1){
                    // isPrice = true;
                // }

                if(ruleType === 1){
                    //值计算
                    data.forEach(d => {
                        if(tools.isEmpty(d)){
                            return;
                        }
                        d = d.replace('--','-').replace('¥', '');  // 减去一个负值会出现 -- 情况
                        if(fieldRule[0] === 'sum'){
                            sum += tools.calc(d);
                        }else {
                            sum = tools.calc(d);
                        }
                    });
                }else if (ruleType === 2){
                    sum = '';
                    data.forEach(d => {
                        sum += d;
                    })
                }


                let fieldName = obj.fieldName;
                Object.keys(changeItems).forEach(o => {
                    <ItemList>(changeItems[o]).resetData(fieldName, sum);
                });
            });
        });

    }

    static reqAddrFull(addr: C_R_ReqAddr, data?: obj | obj[]){
        return Rule.reqAddrFull(Com.addParam(addr), data);
    }

    static reqAddr(addr : C_R_ReqAddr, data? : obj | obj[]){
        return Rule.reqAddr(Com.addParam(addr), data);
    }

    static addParam(addr : C_R_ReqAddr){
        let dataAddr = Object.assign({}, addr);
        if(dataAddr.addParam){
            if(typeof dataAddr.addParam === 'string'){
                dataAddr.dataAddr = dataAddr.dataAddr + (dataAddr.dataAddr.indexOf('?') > -1 ? '&' : '?') + dataAddr.addParam;
            }
        }
        return dataAddr;
    }

    static scene(){
        return CashierRequest({
            dataAddr: Com.url.index,
            type : 'json'
        }).then(({response}) => {
            Com.mainAddr =  response && response.elements && response.elements[0].mainAddr;
            if(response && response.elements && response.elements[0].loginAddr){
                SPA.open(SPA.hashCreate('index', 'login'));
            }else {
                //主界面
                SPA.open(SPA.hashCreate('main', ''));
            }
        });

    }


    /**
     * 提示信息1.主界面底部提示信息2.f6提示信息。若f6开启状态默认提示信息在f6中显示
     * @param {string} str
     * @param {boolean} isRed 字体是否红色
     * @param {boolean} isOverLay true时候不清除原提示信息，如f6用券后提示已使用券
     */
    static logTip(str: string, isRed = false, isOverLay = false) {
        if(tools.isEmpty(str)){
            return;
        }
        let modalTip = d.query('.modal-short-tip');
        if (modalTip) {
            if (!isOverLay) {
                modalTip.innerHTML = '';
            }
            let dom = d.create(`<div class="padding-2-7">${str}</div>`);
            modalTip.appendChild(dom);
            return;
        }

        if(!Com.tipEl){
            Com.tipEl = d.query('.reminder-msg', document);
        }
        if(!Com.tipEl){
            return;
        }

        Com.tipEl.innerHTML = str;
        if (isRed) {
            Com.tipEl.classList.add('color-red');
        } else {
            Com.tipEl.classList.remove('color-red');
        }
    }

    /**
     * 焦点移到最后一个弹窗上
     */
    static focusHandle(){
        let modal = Com.keyModal[Com.keyModal.length - 1];
        if(modal){
            if(modal.itemList && modal.itemList.wrapper){
                modal.itemList.wrapper.focus();
            }else {
                modal.wrapper.focus();
            }
        }

    }

    static local ={
        setItem : (name : string, data : obj) => {
            window.localStorage.setItem(name, JSON.stringify(data));
        },
        getItem : (name : string) => {
            let data = window.localStorage.getItem(name);
            return data && JSON.parse(data) || data;
        }

    };

    /**
     * 打印
     * @param {R_ReqAddr} printAddr
     */
    static printReceipt(printAddr : R_ReqAddr){
        if (printAddr) {
            CashierRequest(printAddr).then(({response}) => {
                cashReceiptPrint({
                    data:  response && response.req,
                });
                Com.posClear();
            })
        } else {
            Com.posClear();
        }
    }

    /**
     * 电脑uuid获取
     * @returns {any}
     */
    static getUuid(){
        let device = Shell.base.device,
            data = device && device.data;

        return data && data.uuid;
    }

    /**
     * 壳版本获取
     * @returns {any}
     */
    static getVersion(){
        let device = Shell.base.device,
            data = device && device.data;

        return data && data.version;
    }

    /**
     * 主界面右下方异步加载效果
     * @param {boolean} isShow
     */
    static loadCount : number = 0;
    static loading(isShow = true){
        isShow ? Com.loadCount ++ : Com.loadCount --;
        if(!Com.loadingEl){
            Com.loadingEl = d.query('.log-loading');
        }
        if(!Com.loadingEl){
            return
        }
        d.classToggle(Com.loadingEl, 'loading', isShow && Com.loadCount !== 0);
    }

    /**
     * 通过计算输入的长度和时间戳判断扫码枪or键盘输入
     * @param timer 开始时间
     * @param scanGunValue 值
     * @returns {string} 1.扫码枪 2.键盘输入
     */
    static checkScan(timer, scanGunValue) : string{
        let time = Date.now() - timer,
            len = scanGunValue && scanGunValue.length,
            type = Com.KEYBOARD;
        if(len && len > 5 && time/len < 10){  // 扫码枪
            type = Com.SCAN;
        }
        return type;
    }

    static sql = {
        run(sql : string){
            return new Promise(resolve => {
                Shell.sqlite.query(sql, (result) => {
                    resolve(result);
                })
            })
        },
        deleteData(tableName : string){
            return new Promise(resolve => {
                Shell.sqlite.query('.DELETE FROM ' + tableName, (result) => {
                    resolve(result);
                })
            })
        },
        dropTable(tableName : string){
            return new Promise(resolve => {
                Shell.sqlite.query('.DROP TABLE ' + tableName, (result) => {
                    resolve(result);
                })
            })
        },
        insertData(tableName : string, meta : string[], values : string[]){
            return new Promise(resolve => {
                let valArr = values.map(obj => "'" + obj + "'");

                let sql = '.INSERT INTO ' + tableName + ' ( '+ meta.join(',') + ')\n' + 'VALUES(' + valArr.join(',') + ');\n';
                Shell.sqlite.query(sql, (result) => {
                    resolve({result, sql});
                })
            })
        },
        selectData(tableName : string){
            return new Promise(resolve => {
                Shell.sqlite.query('SELECT * FROM ' + tableName, (result) => {
                    resolve(result);
                })
            })
        }
    }
}


