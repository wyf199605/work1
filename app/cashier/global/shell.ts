namespace C {

    export const Shell = ((window, document) => {

        let _device: obj;
        const base = {
            get device() {
                if (!_device) {
                    _device = ShellBase.handler('deviceGet', {});
                }
                return _device;
            },
            fullScreenSet(fullScreen: boolean, back: IShellEventHandler) {
                return ShellBase.handler('setFullScreen', {fullScreen}, back);
            },
            versionGet() {
                return ShellBase.handler('versionGet', {});
            },
            versionUpdate(url: string, back: IShellEventHandler, info: IShellEventHandler) {
                let versionGet = Shell.base.versionGet();

                return Ajax.fetch(url, {
                    type: 'POST',
                    data: {msg: versionGet && versionGet.data},
                    dataType: 'json'
                }).then(({response}) => {
                    if (response && response.data && response.data.byteLength > 0) {
                        ShellBase.handler('versionUpdate', {
                            byteLength: response.data.byteLength,
                            file: response.data.file
                        }, back, info);
                    }
                    return response;
                });

            }
        };

        const finger = {
            get(para: obj, back: IShellEventHandler, info: IShellEventHandler, isKeepOn = false) {
                return ShellBase.handler('fingerGet', para, back, info, isKeepOn);
            },
            cancel(back: IShellEventHandler) {
                ShellBase.eventOff('fingerGet');
                return ShellBase.handler('fingerCancel', {}, back);
            },
            verify(enterFinger: string, matchFinger: string, fingerType: number) {
                return ShellBase.handler('fingerVerify', {
                    enterFinger: enterFinger, // 用户输入的指纹
                    matchFinger: matchFinger, // 本地需要匹配的指纹
                    fingerType: fingerType   // 是那一种指纹器，值为0或1或2
                });
            }
        };

        const file = {
            save(path: string, file: string, isAppend = false, back, info?) {
                return ShellBase.handler('fileSave', {
                    path: path, // 保存文件到path，例如C:/text.txt
                    file: file, // base64的二进制码
                    isAppend: isAppend // false覆盖，true添加
                }, back, info)
            },
            syncSave(path: string, file: string, isAppend = false) {
                return ShellBase.handler('fileSave', {
                    path: path,
                    file: file,
                    isAppend: isAppend // false覆盖，true添加
                })
            },
            remove(path: string, back, info?) {
                return ShellBase.handler('fileDelete', {
                    path: path
                }, back, info)
            },
            syncRemove(path: string) {
                return ShellBase.handler('fileDelete', {
                    path: path
                })
            },
            directoryDelete(path) {  // 删除当前文件
                return ShellBase.handler('directoryDelete', {
                    path: path
                })
            },
            unZip(path: string, outdir: string, back?, info?) {
                return ShellBase.handler('fileUnzip', {
                    path: path,
                    outdir: outdir
                }, back, info)
            },
            syncUnZip(path: string, outdir: string) {
                return ShellBase.handler('fileUnzip', {
                    path: path,
                    outdir: outdir
                })
            },
            read(path: string, back, info) {
                return ShellBase.handler('fileRead', {
                    path: path
                }, back, info)
            },
            syncRead(path: string) {
                return ShellBase.handler('fileRead', {
                    path: path
                })
            },
        };

        const casio = {
            upload(port: string, speed: string, back: IShellEventHandler, infor: IShellEventHandler) {
                let innerBack = function () {
                    back(ShellBase.handler('casioDataGet', {}));
                };
                return ShellBase.handler('casioUpload', {port, speed}, innerBack, infor);
            },
            download(port: string, speed: string, data: obj, back: IShellEventHandler, infor: IShellEventHandler) {
                return ShellBase.handler('casioDownload', {port, speed}, back, infor);
            }
        };

        const sqlite = (() => {
            function query(str: string, back: IShellEventHandler): boolean;
            function query(str: string): IShellResult;
            function query(str: string, back?) {
                return back ? ShellBase.handler('sqliteQuery', {query: str}, back) :
                    ShellBase.handler('sqliteQuery', {query: str});
            }

            return {query};
        })();

        const rfid = (() => {
            // comPort:"COM1",comBaud:115200
            // ipAddress:"192.168.1.234",ipPort:100
            // config :{led:true;buzzer:false;power:5}
            function start(str: string, num: number, back: IShellEventHandler) {
                // 判断是否是ip
                let data = str.split('.').length === 4 ? {ipAddress: str, ipPort: num} : {comPort: str, comBaud: num};

                return ShellBase.handler('rfidStart', data, back, null, false);
            }

            function reset(str: string, num: number, back: IShellEventHandler) {
                let data = str.split('.').length === 4 ? {ipAddress: str, ipPort: num} : {comPort: str, comBaud: num};

                return ShellBase.handler('rfidReset', data, back, null, false);
            }

            function config(str: string, num: number, config: { led?: boolean, buzzer?: boolean, power?: number }, back: IShellEventHandler) {
                // 判断是否是ip
                let data = str.split('.').length === 4 ? {ipAddress: str, ipPort: num} : {comPort: str, comBaud: num};
                // document.body.innerHTML = JSON.stringify( Object.assign(data, {config}));
                return ShellBase.handler('rfidConfig', Object.assign(data, {config}), back, null, false);
            }


            function stop(back: IShellEventHandler) {
                // ShellBase.eventOff('rfidStart');
                return ShellBase.handler('rfidStop', null, back);
            }

            return {start, stop, config, reset}
        })();

        const startUp = {

            start(autoStart: boolean) {
                return ShellBase.handler('setAutoStart', {autoStart});
            },
            query() {
                return ShellBase.handler('queryAutoStart', {});
            },
            shutDown(back: IShellEventHandler) {
                return ShellBase.handler('powerOff', {}, back);
            }
        };

        const printer = {
            get() {
                return ShellBase.handler('printersGet', {});
            },
            labelPrint(quantity: number, driveCode: number, image: string, back: IShellEventHandler) {
                return ShellBase.handler('labelPrint', {quantity, driveCode, image}, back);
            }
        };
        const inventory = {
            getDeviceAddress() {
                return ShellBase.handler('getDeviceAddress', function (res) {
                    alert(res);
                });
            },
            loadData(url: string, uploadUrl: string, inventoryKey: string, back: IShellEventHandler) {
                return ShellBase.handler('loadData', {url, uploadUrl, inventoryKey}, back);
            },
            uploadData(url: string, inventoryKey: string, back: IShellEventHandler) {
                return ShellBase.handler('uploadData', {url, inventoryKey}, back);
            },
            insertData(data: { gooId: string, barcode: string, epc: string, check: boolean }[], inventoryKey: string, back: IShellEventHandler) {
                return ShellBase.handler('insertData', {data, inventoryKey}, back);
            },
            delData(data: { goodId: string, barcode: string, epc: string, check: boolean }[], inventoryKey: string, back: IShellEventHandler) {
                return ShellBase.handler('delData', {data, inventoryKey}, back);
            },
            clearData(dbName: string, back: IShellEventHandler) {
                return ShellBase.handler('clearData', {dbName}, back);
            },
            rfidOpen(back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'open'}, back, null, false);
            },
            rfidClose(back: IShellEventHandler) {
                ShellBase.eventOff('rfid');
                return ShellBase.handler('rfid', {type: 'close'}, back);
            },
            /**
             *
             * @param {obj} value - 获取频段
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            getBand(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'getBand', value}, back);
            },
            /**
             *
             * @param {obj} value - 获取功率
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            getMinMaxBand(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'getMinMaxBand', value}, back);
            },
            /**
             *
             * @param {obj} value - 开始盘点
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            startCheck(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'startCheck', value}, back, null, false);
            },
            stopCheck(value: obj, back: IShellEventHandler) {
                ShellBase.eventOff('rfid');
                return ShellBase.handler('rfid', {type: 'endCheck', value}, back);
            },
            /**
             *
             * @param {obj} value - 设置参数
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            rfidSetParam(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'setParam', value}, back);
            },
            /**
             *
             * @param {obj} value - 获取设置参数
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            rfidGetParam(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'getParam', value}, back);
            },
            /**
             *
             * @param {obj} value - 开始找货
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            findGoods(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'findGoods', value}, back, null, false);
            },
            /**
             *
             * @param {obj} value - 停止找货
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            stopFind(value: obj, back: IShellEventHandler) {
                ShellBase.eventOff('rfid');
                return ShellBase.handler('rfid', {type: 'stopFind', value}, back);
            },
            /**
             *
             * @param {obj} value - 开始扫描epc
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            startEpc(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'startEpc', value}, back, null, false);
            },
            stopEpc(value: obj, back: IShellEventHandler) {
                ShellBase.eventOff('rfid');
                return ShellBase.handler('rfid', {type: 'stopEpc', value}, back);
            },
            /**
             *
             * @param {obj} value - clearEpc 清除epc
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            clearEpc(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'clearEpc', value}, back);
            },
            setPwm(value: obj, back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'setPwm', value}, back);
            },
            getPwn(back: IShellEventHandler) {
                return ShellBase.handler('rfid', {type: 'getPwm'}, back);
            },
            /**
             *
             * @param {obj} value - 打开扫码功能
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            openScan(back: IShellEventHandler) {
                return ShellBase.handler('supon', {type: 'openScanFunction'}, back, null, false);
            },
            /**
             *
             * @param {obj} value - 关闭扫码功能
             * * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            closeScan(back: IShellEventHandler) {
                ShellBase.eventOff('supon');
                return ShellBase.handler('supon', {type: 'closeScanFunction'}, back, null, false);
            },
            /**
             *
             * @param {obj} value -加载盘点数据（已下载的本地的盘点数据，包括已盘点与未盘点）
             * @param {C.IShellEventHandler} back
             * @returns {boolean}
             */
            getData(inventoryKey: string, field: string, back: IShellEventHandler) {

                return ShellBase.handler('getData', {inventoryKey, field}, back, null, false);
            },
            getScanCount(summary: string, back: IShellEventHandler) {
                return ShellBase.handler('getScanCount', {summary}, back, null, false);
            },
            // scan2dOn(back: IShellEventHandler) {
            //     return ShellBase.handler('startScan2DResult', '', back, null, false);
            // },
            // scan2dOff() {
            //     ShellBase.eventOff('startScan2DResult');
            //     return ShellBase.handler('closeScan2D', '')
            // },
            get canRfid() {
                if (!tools.os.android) {
                    return false
                }
                let isSupport = ShellBase.handler('isSupport', 'rfid');
                if (typeof isSupport === 'object') {
                    return isSupport.data;
                } else {
                    return isSupport
                }
            },
            get can2dScan() {
                if (!tools.os.android) {
                    return false
                }
                let isSupport = ShellBase.handler('isSupport', '2dScan');
                if (typeof isSupport === 'object') {
                    return isSupport.data;
                } else {
                    return isSupport
                }
            }
        };


        return {

            base, finger, file, casio, sqlite, printer, rfid, inventory, startUp
        }
    })(window, document);


    declare const AppShell: {
        syncFunction(name: string, data: string): string;
        asyncFunction(name: string, data: string, back: string, infor?: string): boolean;
    };

    enum ShellTypes {
        IOS,
        ANDROID,
        WINDOWS
    }

    interface IShellEventHandler {
        (result: IShellResult): void;
    }

    interface IShellHandler {
        (action: string, data: obj | string): IShellResult;

        (action: string, data: obj | string, back: IShellEventHandler, infor?: IShellEventHandler, isAutoOff?: boolean): boolean;

    }

    interface IShellResult {
        success: boolean,
        msg: string,
        data: any
    }

    const ShellBase = (() => {
        const userAgent = navigator.userAgent || navigator.vendor,
            shellType: ShellTypes = typeDetect(),
            shellHandler: IShellHandler = windowsHandler,
            action2eventName: objOf<string[]> = {};


        function eventNameGet() {
            return '__SHELL_EVENT__' + tools.getGuid();
        }

        function eventOff(action: string) {
            let events = action2eventName[action] || [];
            events.forEach(event => d.off(window, event));
            delete events[action];
        }

        function windowsHandler<IShellHandler>(action: string, data, back?, infor?, isAutoOff = true) {
            if (typeof AppShell === 'object' && tools.isFunction(AppShell.asyncFunction) && tools.isFunction(AppShell.syncFunction)) {
                let dataStr = typeof data === 'string' ? data : JSON.stringify(data);

                if (tools.isEmpty(back) && tools.isEmpty(infor)) {
                    return JSON.parse(AppShell.syncFunction(action, dataStr));
                } else {
                    // 生成唯一事件名称
                    let eventBack = back ? eventNameGet() : '',
                        eventInfor = infor ? eventNameGet() : '';

                    // 异步调用
                    let flag = AppShell.asyncFunction(action, dataStr, eventBack, eventInfor);

                    // 过程通知
                    if (flag) {
                        if (!isAutoOff) {
                            action2eventName[action] = action2eventName[action] || [];
                            let events = action2eventName[action];
                            events.push(eventBack, eventInfor);
                        }

                        if (eventInfor) {
                            d.on(window, eventInfor, function (e: CustomEvent) {
                                // alert(typeof e.detail === 'string' ? e.detail : e);
                                let detail = e.detail;
                                infor(typeof detail === 'string' ? JSON.parse(detail) : detail);
                            })
                        }

                        // 异步完成通知
                        if (eventBack) {
                            d.on(window, eventBack, function (e: CustomEvent) {
                                let detail = e.detail;
                                if (isAutoOff) {
                                    d.off(window, eventInfor);
                                    d.off(window, eventBack);
                                }
                                try {
                                    detail = typeof detail === 'string' ? JSON.parse(detail) : detail;
                                } catch (e) {
                                    alert('JSON解析错误');
                                    return;
                                }
                                // alert(JSON.stringify(e.detail));
                                back(detail);
                            })
                        }
                    }
                    return flag;
                }
            } else {
                return false;
            }
        }

        // function androidHandler() {
        //
        // }
        // function iosHandler() {
        //
        // }

        function typeDetect() {
            if (/OursAndroid/i.test(userAgent)) {
                return ShellTypes.ANDROID;
            }
            if (/OursIos/i.test(userAgent)) {
                return ShellTypes.IOS;
            }
            if (/OursWindows/.test(userAgent)) {
                return ShellTypes.WINDOWS;
            }
            return -1;
        }

        return {
            eventOff,
            get handler() {
                return shellHandler;
            }
        }
    })();
}