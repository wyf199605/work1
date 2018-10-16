namespace C{
    // export let localUser = (function () {
    //     let u = window.localStorage.getItem('local_uuid_info');
    //     let uu = window.localStorage.getItem('local_user_info');
    //     let autoFillInput = window.localStorage.getItem('local_autoFillInput');
    //     try{
    //         u = u ? JSON.parse(u) : {};
    //         uu = uu ? JSON.parse(uu) : {};
    //     }catch(e){
    //     }
    //     return {
    //         /**
    //          * 获取用户资料
    //          * @param {string }[field]
    //          * @return {*}
    //          */
    //         getUser: function (field) {
    //             return typeof field === 'undefined' ? u : u[field.toUpperCase()];
    //         },
    //         setUser: function (user) {
    //             u = user;
    //             window.localStorage.setItem('local_uuid_info', JSON.stringify(user));
    //         },
    //         getUUser: function (field?) {
    //             return typeof field === 'undefined' ? uu : uu[field.toUpperCase()];
    //         },
    //         setUUser: function (user) {
    //             uu = user;
    //             window.localStorage.setItem('local_user_info', JSON.stringify(user));
    //         },
    //         isSavePassword: autoFillInput,
    //         setSavePassword: function (state) {
    //             if (state) {
    //                 window.localStorage.setItem('local_autoFillInput', '1');
    //             } else {
    //                 window.localStorage.removeItem('local_autoFillInput');
    //             }
    //         },
    //
    //         /**
    //          *
    //          * @param type 1指纹登录 0 密码登录
    //          */
    //         setLoginMethod: function (type) {
    //             window.localStorage.setItem('TouchIdLogin', type);
    //         },
    //         getCurrentUserId: function () {
    //             return this.getUser('userid');
    //         }
    //     }
    // })();

    export let localMsg = (function () {
        let _storage = window.localStorage;

        let _get = function () {
            let s = _storage.getItem('local_msg');
            return s ? JSON.parse(s) : [];
        };
        let _save = function (array) {
            if (!Array.isArray(array)) {
                array = [];
            }
            _storage.setItem('local_msg', JSON.stringify(array));
        };
        let _add = function (arr) {
            //     console.log(_get(), arr);
            //  alert(JSON.stringify(arr) + '11');
            _save(arr.concat(_get()));
        };
        let _read = function (notifyId) {
            let t = _get();
            let l = t.length;
            for (let i = 0; i < l; i++) {
                if (t[i].notifyId === notifyId) {
                    //    console.log(t[i]);
                    t[i].isread = 1;
                    break;
                }
            }
            _save(t);
        };
        let _remove = function (notifyId) {
            let t = _get();
            let l = t.length;
            for (let i = 0; i < l; i++) {
                if (t[i].notifyId === notifyId) {
                    t.splice(i, 1);
                    break;
                }
            }
            _save(t);
        };
        let _getUnreadCount = function () {
            let count = 0;
            _get().forEach(function (m) {
                if (m.isread === 0) {
                    count++;
                }
            });
            return count;
        };
        return {
            remove: _remove,
            get: _get,
            add: _add,
            read: _read,
            getUnreadCount: _getUnreadCount
        }
    }());


    // export class IDB{
    //
    //     private dbName = 'BW';
    //     private request: IDBOpenDBRequest = null;
    //
    //     private static open() {
    //
    //     }
    //
    //
    // }
}
