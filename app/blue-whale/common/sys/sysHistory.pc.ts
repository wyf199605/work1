namespace BW{
    import tools = G.tools;
    export interface UrlData{
        title : string,
        url?: string;
        refer? : string,
        isLock?: boolean;
    }
    export const sysPcHistory = (function () {
        let lsHashField = 'openedIframeHash',
            lsMenuOrder = 'openedMenuOrder',
            // lsLockMenuOrder = 'lockedMenuOrder',
            lsLockKey = 'lockedMenuKey',
            lsInitType = 'menuInitType',

            storage = window.localStorage,

            history = storage.getItem(lsHashField),
            order = storage.getItem(lsMenuOrder),
            // lock = storage.getItem(lsLockMenuOrder),
            lockKey = storage.getItem(lsLockKey),

            historyArr: string[] = history ? history.split(',') : [],
            menuOrder: objOf<UrlData> = order ? JSON.parse(order) : {},
            // lockMenu: objOf<UrlData> = lock ? JSON.parse(lock) : {},

            historyLen = historyArr.length;

        /**
         * 删除一条历史，返回被删除的index，如果url不在历史中，则返回-1
         * @param url
         * @returns {number}
         */
        let historyRemove = function (url:string):number {
            let removed = historyArr.indexOf(url);
            if(removed >= 0){
                historyArr.splice(removed, 1);
            }
            return removed;
        };

        let saveLocal = function () {
            storage.setItem(lsHashField, historyArr.join(','));
        };

        let saveOrder = function () {
            storage.setItem(lsMenuOrder, JSON.stringify( menuOrder ));
        };


        let lockFun = (() => {

            // 使用indexDB储存
            let storeName = 'lockTab',
                db: IDBDatabase = null;

            if(lockKey && window.indexedDB){
                let req = indexedDB.open('BW', 1);

                req.onsuccess = function (e) {
                    db = <IDBDatabase>(req.result);
                };

                // 创建数据库以及结构
                req.onupgradeneeded = function (event: IDBVersionChangeEvent) {


                    if(!lockKey){
                        return;
                    }

                    let db = <IDBDatabase>(<IDBOpenDBRequest>event.target).result,
                        objectStore = db.createObjectStore(storeName, {keyPath: 'lockKey'});
                    // console.log(db.objectStoreNames);

                    objectStore.createIndex('tabArr', 'tabArr', {unique: false});
                    // objectStore.createIndex('refer', 'refer', {unique: false});
                    // objectStore.createIndex('createTime', 'createTime', {unique: false});

                    // let tabArr: UrlData[] = [];
                    // for(let url in lockMenu){
                    //     let menu = lockMenu[url];
                    //     tabArr.push({
                    //         url,
                    //         title: menu.title,
                    //         refer: menu.refer
                    //     });
                    // }
                    // objectStore.add({lockKey, tabArr});
                };
            }


            let getStore = (writable:boolean = false) => {
                if(db){
                    return db.transaction([storeName], writable ? 'readwrite' : 'readonly').objectStore(storeName)
                }else{
                    return null;
                }
            };

            let get = (callback: (tabArr:UrlData[]) => void) => {

                if(db){
                    // debugger;
                    getStore().get(lockKey).onsuccess = function () {
                        // debugger;
                        callback(this.result ? this.result.tabArr : []);
                    };
                }else{
                    callback([]);
                }

            };

            let add = (url: string) => {
                if(!lockKey || !db){
                    return ;
                }
                get((tabArr) => {
                    let menu = menuOrder[url];

                    tabArr = tabArr || [];

                    tabArr.push({
                        url,
                        title: menu.title,
                        refer: menu.refer
                    });

                    getStore(true).put({lockKey, tabArr});
                });
            };

            let del = (url: string) => {
                if(!lockKey || !db){
                    return ;
                }

                get((tabArr) => {
                    if(Array.isArray(tabArr)){
                        tabArr = tabArr.filter(tab => tab.url !== url);
                        getStore(true).put({lockKey, tabArr});
                    }
                })
            };

            return {get, add, del};

        })();

        let isUseLockInit = () => storage.getItem(lsInitType) === '1';

        return {
            len: ():number => historyLen,
            last: ():string => historyArr[historyLen - 1],
            getMenuOrder: () => menuOrder,
            indexOf: url => historyArr.indexOf(url),
            isUseLockInit,
            setInitType: (type: string) => {storage.setItem(lsInitType, type)},
            lockGet: lockFun.get,
            lockToggle: (url: string, isLock: boolean) => {
                let menu = menuOrder[url];
                if(menu) {
                    menu.isLock = isLock;
                    if(isLock){
                        lockFun.add(url);
                        // lockMenu[url] = menu;
                    } else {
                        lockFun.del(url);
                        // delete lockMenu[url];
                    }
                    saveOrder();
                    // saveLock();
                }
            },
            add: function (urlData: UrlData) {
                //非重复添加时
                let url = urlData.url;
                if(historyRemove(url) === -1){
                    historyLen ++ ;
                    menuOrder[url] = {
                        title : tools.str.toEmpty(urlData.title)
                    };
                    urlData.refer && (menuOrder[url].refer = urlData.refer);
                    urlData.isLock && (menuOrder[url].isLock = urlData.isLock);
                    saveOrder();
                }
                historyArr.push(url);
                saveLocal();
            },

            remove : function (url) {
                historyRemove(url);
                delete menuOrder[url];
                // delete lockMenu[url];
                historyLen -- ;
                saveLocal();
                saveOrder();
                // saveLock();
            },
            removeAll : function () {
                storage.removeItem(lsHashField);
                storage.removeItem(lsMenuOrder);
                menuOrder = {};
                historyArr = [];
                saveLocal();
                saveOrder();
                historyLen = 0;
            },
            setMenuName : function (url, name) {
                // console.log(menuOrder, url, name);
                if( menuOrder[url]){
                    menuOrder[url].title = name;
                    saveOrder();
                }
            },
            get : () => historyArr,
            /**
             * 获取引用链
             * @param url
             * @param deep - 引用链的最大长度 ， -1表示没有限制
             */
            getRefer : (url:string, deep:number = 1):string[] => {
                let refers:string[] = [];

                for (let i = 0, currUrl = url; deep === -1 || i < deep; i ++){
                    let refer,
                        urlData = menuOrder[currUrl];

                    if(!urlData){
                        break;
                    }

                    refer = urlData.refer;

                    // 第二个条件判断是否形成循环
                    if(!refer || refers.indexOf(refer) >= 0){
                        break;
                    }

                    refers.push(refer);
                    currUrl = refer;
                }
                return refers;
            },

            setLockKey (key:string){

                storage.setItem(lsLockKey, key);
                // if(isNewLockKey()){
                // sysPcHistory.removeAll();
                // }else{
                //
                // }
            },

            remainLockOnly(callback:Function){
                // let lockOrder = sysPcHistory.getMenuOrder(true),
                //     delHistories = sysPcHistory.get().filter(url => !(url in lockOrder));
                //
                //
                // delHistories.forEach(url => sysPcHistory.remove(url));


                lockFun.get(tabArr => {
                    historyArr
                        .filter(url => !tabArr.some(tab => tab.url === url))
                        .forEach(url => sysPcHistory.remove(url));

                    callback();
                    // saveOrder();
                    // saveLocal();
                });
            }
        };
    }());
}
