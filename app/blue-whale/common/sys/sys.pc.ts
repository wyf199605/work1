interface SYSInitPara {
    pageContainer: HTMLDivElement;
    navBar: HTMLDivElement;
}

namespace BW {
    import d = G.d;
    declare const toastr: any;
    import tools = G.tools;
    import Shell = G.Shell;

    export class SYSPC implements SYS_Type {
        private pages: sysPcPage = null;
        private tabs: sysPcTab = null;
        private tabContainer: HTMLUListElement = null;
        private pageContainer: HTMLDivElement;
        private navBar: HTMLDivElement;
        private inMain: boolean;

        private tabMenu:TabMenuI[] = [{
            title: '刷新',
            callback: (url:string) => {
                this.window.refresh(url);
            }
        },{
            title: '锁定/解锁',
            callback: (url) => {
                let tab = this.tabs.getTab(url);
                if(tab) {
                    this.window.lockToggle(url, !tab.classList.contains('locked'));
                }
            }
        }];

        constructor(para: SYSInitPara) {
            if (para && para.pageContainer && para.navBar) {
                this.inMain = true;
                this.pageContainer = para.pageContainer;
                this.navBar = para.navBar;
                this.tabContainer = <HTMLUListElement>para.navBar.querySelector('ul.page-tabs-content');
                this.pages = new sysPcPage(para.pageContainer);
                this.tabs = new sysPcTab(this.tabContainer, this.tabMenu);

                setTimeout(() => {
                    let hash = location.hash,
                        autoUrl = '';
                    if(hash) {
                        hash = hash.substring(1);
                        let [page, url] = hash.split('=');
                        if(page === 'page' && url){

                            autoUrl = CONF.siteAppVerUrl + url;
                        }
                    }
                    location.hash = '';
                    if(sysPcHistory.isUseLockInit()) {
                        sysPcHistory.setInitType('0');

                        setTimeout(() => {
                            sysPcHistory.lockGet(tabArr => {
                                // debugger;

                                sysPcHistory.removeAll();
                                tabArr = tabArr.map(tab => {
                                    tab.isLock = true;
                                    sysPcHistory.add(tab);
                                    return tab;
                                });

                                if(autoUrl) {
                                    let autoTab = {
                                        isLock: false,
                                        title: '',
                                        url: autoUrl
                                    };
                                    tabArr.push(autoTab);
                                    sysPcHistory.add(autoTab);
                                }

                                // debugger;
                                this.tabs.initHistory(tabArr);

                                if(tools.isNotEmpty(tabArr)){
                                    this.window.open({url: tabArr.pop().url});
                                }
                            });
                        }, 200);
                    } else {
                        if(autoUrl) {
                            let autoTab = {
                                isLock: false,
                                title: '',
                                url: autoUrl
                            };
                            sysPcHistory.add(autoTab);
                        }
                        let lastUrl = sysPcHistory.last();
                        if (lastUrl) {
                            this.tabs.initHistory((() => {
                                let tabs: UrlData[] = [],
                                    menus = sysPcHistory.getMenuOrder();

                                for(let url in menus){
                                    let menu = menus[url];
                                    tabs.push({
                                        url: url,
                                        title: menu.title,
                                        isLock: menu.isLock,
                                        refer: menu.refer
                                    })
                                }


                                return tabs;
                            })());
                            this.window.open({url: lastUrl});
                        }
                    }
                }, 100)



            } else {
                this.inMain = false;
            }
        }
        public os: string;
        public isMb: boolean;
        public window = (function (self) {
            return {
                open: function (o: winOpen, refer?: string) {
                    let url = o.url;
                    if (self.inMain) {
                        let isNew = self.pages.open(o),
                            isNotBtl = url.indexOf('newPage') > -1;
                        if(isNotBtl){ // 不走btl模板的页面
                            let title = o.title;
                            self.tabs.open(url, title);
                            sysPcHistory.add({url: url, refer, title: title});
                        }else {
                            self.tabs.open(o.url);
                            sysPcHistory.add({url: url, refer, title: ''});
                        }
                        if (!isNew) {
                            if(isNotBtl){
                                self.window.refresh(url);
                            }else {
                                self.window.fire('wake', self.pages.get(url).dom, url);
                            }
                        }
                    } else {
                        location.assign(url);
                    }
                    localStorage.setItem('viewData', JSON.stringify(o.extras));
                },

                close: function (event: string = '', data: any = null, url?: string) {
                    let lastUrl = sysPcHistory.last();
                    typeof url === 'undefined' && (url = lastUrl);
                    if (sysPcHistory.indexOf(url) > -1) {
                        let isLast = lastUrl === url;
                        //事件发送
                        self.window.fire(event, data, sysPcHistory.getRefer(url)[0]);
                        // 历史清除
                        sysPcHistory.remove(url);
                        self.pages.close(url);
                        self.tabs.close(url);
                        // 如果关闭当前打开的页面，则关闭后打开历史倒数第二位置的页面
                        if (sysPcHistory.len() > 0 && isLast) {
                            self.window.open({url: sysPcHistory.last()});
                        }
                    }
                },
                closeAll: function () {
                    sysPcHistory.get().forEach(url => {
                        self.pages.close(url);
                        self.tabs.close(url);
                    });
                    sysPcHistory.removeAll();
                },
                closeOther: function () {
                    let lastUrl = sysPcHistory.last();
                    sysPcHistory.get().slice(0).forEach(url => {
                        if (url !== lastUrl) {
                            self.pages.close(url);
                            self.tabs.close(url);
                            sysPcHistory.remove(url);
                        }
                    })
                },
                uploadVersion: function () {

                },
                refresh: function (url: string, callback?:Function) {
                    self.pages.refresh(url, () => {
                        // self.window.setBreadcrumb(url);
                        typeof callback === 'function' && callback();
                    });
                },
                lockToggle: function (url: string, isLock: boolean) {
                    sysPcHistory.lockToggle(url, isLock);
                    self.tabs.lockToggle(url, isLock);
                },
                load: function (url: string) {
                    location.assign(url);
                },

                back: function (event: string, data: object) {
                    window.history.back();
                },

                setTitle: function (url: string, title: string) {
                    self.tabs.setTabTitle(url, title);
                    sysPcHistory.setMenuName(url, title);
                    // 打开后设置面包屑
                    self.window.setBreadcrumb(url);
                },

                opentab: function () {
                    location.assign(CONF.url.main);
                },

                logout: function () {
                    let uuid = '',
                        json = this.getDevice();
                    if(json){
                        uuid = json.uuid;
                    }
                    window.location.assign(tools.url.addObj(CONF.url.index, {uuid}));
                },

                firePreviousPage: function (...any) {

                },
                getDevice: function (key?: string): obj{
                    let data = SYSPC.handle('getDevice');
                    if('AppShell' in window){
                        data = Shell.base.device
                    }
                    return data && data.msg;
                    // let json = this.pcHandle('getDevice','');
                    // if(!tools.isEmpty(json)){
                    //     result.data = JSON.parse(json).msg;

                    // return result;
                },
                quit: function () {
                },
                copy: function (text: string) {
                   tools.copy(text);
                },
                getGps: function (callback?: Function) {
                    callback({gps:{},success:true});
                },
                openGps: function(){

                },
                update: function () {
                    // G.Modal.toast('已经是最新版本');
                    if('AppShell' in window){
                        Shell.base.versionUpdate(CONF.ajaxUrl.pcVersion, (e) => {
                            if(!e.success){
                                require(['Modal'], (m) => {
                                    m.Modal.toast('已经是最新版本');
                                })
                            }
                        }, (e) => {
                            console.log(e);
                        });
                    }else{
                        require(['Modal'], (m) => {
                            m.Modal.toast('已经是最新版本');
                        })
                    }
                },
                clear: function () {
                    // G.Modal.toast('清除成功');
                    require(['Modal'], (m) => {
                        m.Modal.toast('清除成功');
                    })
                },
                openImg: function (url: string) {

                },
                download: function (url: string, fileName: string = '') {
                    let a = d.create(`<a href="${url}" download="${fileName}"></a>`);
                    d.append(document.body, a);
                    a.click();
                    d.remove(a);
                    a = null;
                },
                wake: function (event, data) {
                },
                getFile: function (callback: (file: CustomFile[]) => void, multi: boolean = false, accpet: string, error: Function) {
                    let input = <HTMLInputElement>d.create('<input type="file" class="hide"/>');
                    input.multiple = multi;
                    accpet && (input.accept = accpet);
                    d.on(input, 'change', () => {
                        callback && callback(Array.prototype.slice.call(input.files).map((file: File): CustomFile => {
                            return {
                                blob: file,
                                name: file.name,
                                lastModifiedDate: file.lastModifiedDate,
                                type: file.type,
                                size: file.size
                            }
                        }));
                        input = null;
                    });
                    input.click();
                },
                fire: function (type: string, data?: obj, url?: string) {
                    let page = self.pages.get(url);
                    if (page) {
                        tools.event.fire(type, data, page.dom);
                    }
                },
                setBreadcrumb: function (url: string) {
                    let page = self.pages.get(url);

                    if (page && page.dom) {
                        let refers = sysPcHistory.getRefer(url, -1),
                                liHtml = '<li><span class="iconfont icon-house"></span></li>',
                            menu = sysPcHistory.getMenuOrder();

                        refers.unshift(url);
                        for (let len = refers.length - 1; len >= 0; len--) {
                            let m = menu[refers[len]];
                            if (m && m.title) {
                                if (len > 0) {
                                    liHtml += '<li><a data-href="' + refers[len] + '">' + m.title + '</a></li>';
                                } else {
                                    liHtml += '<li class="active">' + m.title + '</li>';
                                }
                            }
                        }
                        let breadcrumb = d.query('.breadcrumb', page.dom);
                        if(breadcrumb){
                            breadcrumb.innerHTML = liHtml;
                        }else{
                            let liHtmlDom = d.create('<ol class="breadcrumb">' + liHtml + '</ol>');

                            d.on(liHtmlDom, 'click', 'a[data-href]', function () {
                                self.window.open({url: this.dataset.href});
                            });
                            page.dom.insertBefore(liHtmlDom, page.dom.firstElementChild);
                        }
                    }

                },
                reOpen: function (o: winOpen){
                    sys.window.open(o);
                }
            };
        }(this));

        public ui = (function (self) {
            return {
                /**
                 * 浮出提示框
                 * @param {string} title - 标题
                 * @param {string} msg - 内容
                 * @param {int} type - 1.success,默认2.info,3.warning,4.error
                 * @param {object} url 1.property:url 有url则可以打开新页面 2.property:notifyId 判断是否打开过的notifyId
                 * @param {int} position - 默认1.toast-top-right,2.toast-bottom-right,3.toast-bottom-left,4.toast-top-left,5.toast-top-full-width,6.toast-bottom-full-width,7.toast-myToast(自定义样式、在中间显示)
                 * @param {int} time - 默认5000毫秒
                 */
                notice: function (obj) {
                    console.log(obj);
                    let title = obj.title, msg = obj.msg, type = obj.type, url = obj.url,
                        position = obj.position, time = obj.time, callback = obj.callback;
                    toastr.options = {
                        positionId: position,
                        positionClass: position || "toast-bottom-right",
                        onclick: null,
                        closeButton: false,
                        showDuration: 1000,
                        hideDuration: 1000,
                        timeOut: time || 5000,
                        extendedTimeOut: 1000,
                        showEasing: "swing",
                        hideEasing: "linear",
                        showMethod: "fadeIn",
                        hideMethod: "fadeOut"
                    };
                    if (url != null) {
                        toastr.options.closeButton = true;
                        toastr.options.onclick = function () {
                            self.window.open({url: CONF.siteUrl + url})
                            $('.messageList').find('li').each(function () {
                                if (this.dataset.url == url) {
                                    $(this).remove();
                                }
                            });
                        };
                        setTimeout(callback, 1500);
                    } else {
                        toastr[type || 'info'](msg, title);
                        setTimeout(callback, 1500);
                    }
                },
                indexed: function (ajaxUrl, title) {
                    // if ($('ul.ps-container>li.loading').length > 0) {
                    //     picker(ajaxUrl, function () {
                    //         $('#indexedDom  .modal-title').html(title);
                    //         $('#indexedDom').modal()
                    //     })
                    // } else {
                    //     $('#indexedDom').modal()
                    // }
                }
            };
        }(this));

        static handle (action:string,dict?:string) {
            if(!('BlueWhaleShell' in window)) {
                return null;
            }
            if(typeof dict === 'undefined'){
                return BlueWhaleShell.postMessage(action);
            }else{
                if(typeof dict !== 'string'){
                    dict = JSON.stringify(dict);
                }
                return BlueWhaleShell.postMessage(action,dict);
            }

        }
    }

}
