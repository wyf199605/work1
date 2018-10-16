namespace C{
interface ISPAPara {
    name: string; // 单页应用的名称
    container?: HTMLElement | string;
    router: ISPARouter; // 路由配置
    main?: ISPAMainPara;
    defaultRouter?: objOf<string[]>;
    max?: number; // 最大页面 默认10
    isLocalHistory?: boolean;
    tab?: {
        container: HTMLElement;
        TabClass: typeof SPATab;
    }
}
interface ISPAMainPara {
    router: [string, string[]];
    container?: HTMLElement | string;
}
interface ISPAHash{
    spaName:string;
    routeName:string;
    para?:string[]
}
export interface ISPARouter {
    [name:string] : typeof SPAPage | ((para:any[]) => typeof SPAPage)
}


const SPA_PAGE_FLAG = '__IS_SPA_PAGE__'; // SPAPage类的标识, 用于判断路由是普通函数还是SPAPage构造函数
export const SPA = ((document, window) => {

    const PARA_NAME = encodeURIComponent('para');

    let currentHash: string = '',
        spaItems: objOf<SPAItem> = null,
        hash2data:obj = {};

    class SPAItem {
        name: string = '';
        pages: SPAPage[] = null;
        max:number = 10;
        router: ISPARouter = null;
        history: SPAHistory = null;
        container: HTMLElement = null;

        main: ISPAMainPara;
        mainPage: SPAPage;
        defaultRouter: objOf<string[]>;
        tab: SPATab;
        tabPara:obj;

        constructor({name, max, router, container, main, defaultRouter, tab}: ISPAPara) {
            this.name = name;
            this.max = max || 10;
            this.router = router;
            this.container = typeof container === 'string' ? d.query(container) : container;

            this.main = main;
            this.defaultRouter = defaultRouter;

            this.history = new SPAHistory(name);

            this.tabPara = tab;
        }

        // 初始化main 和 default
        public init() {
            // init main
            let main = this.main;
            if(main){
                let [mainName, mainPara] = main.router;
                this.mainPage = this.pageCreate(mainName, mainPara, this.main.container);
            }

            let tabPara = this.tabPara;
            if(tools.isNotEmpty(tabPara)) {
                this.tab = new (<any>tabPara.TabClass)({container: tabPara.container})
            }

            // init default
            if(this.defaultRouter){
                for(let routeName in this.defaultRouter) {
                    open(hashCreate(this.name, routeName, this.defaultRouter[routeName]));
                }
            }

        }
        /**
         * 打开页面，内部调用
         * @param {string} hash
         */
        public open(hash:string) {
            let {routeName, para} = hashAnalyze(hash);
            // 防止打开main页面
            let mainName = this.main && this.main.router && this.main.router[0];
            if(!routeName || mainName === routeName){
                return;
            }

            let page = this.pageGet(hash),
                tab = this.tab;

            // debugger;
            this.clearMax();

            // 隐藏当前页面
            let currentPage = this.pageGet(currentHash);
            if(currentPage) {
                currentPage.isShow = false;
            }

            if(page) {
                page.isShow = true;
            } else {
                page = this.pageCreate(routeName, para);
                if(page){
                    page['_hash'] = hash;
                    this.pages || (this.pages = []);
                    this.pages.push(page);

                    tab && tab.add(hash, page.title);
                }
            }

            // debugger;
            this.history.add({hash});

            tab && tab.active(hash);

            return page;
        }

        public pageCreate(routeName: string, para?: any[], container?:HTMLElement | string): SPAPage{

            if(!this.router[routeName]) {
                return null;
            }

            let page: SPAPage = null,
                PageConstructor = null,
                routerFun =this.router[routeName],
                mainName = this.main && this.main.router && this.main.router[0],
                hash = hashCreate(this.name, routeName === mainName ? '' : routeName, para),
                data = hash2data[hash];

            if(routerFun[SPA_PAGE_FLAG]){
                // 是构造函数
                PageConstructor = routerFun;
            } else if(typeof routerFun === 'function') {
                //是返回构造函数的函数
                PageConstructor = (<(para:any[]) => typeof SPAPage>routerFun)(para ? [...para] : null);
            }

            if(PageConstructor) {
                page = new PageConstructor(para, data);
                if(!page.container){
                    page.container = container || this.container;
                    tools.isFunction(page.domReady) && page.domReady();
                }
            }

            delete hash2data[hash];

            return page;
        }

        public pageGet(hash: string): SPAPage {
            if(this.pages){
                for (let page of this.pages) {
                    if(page.hash === hash){
                        return page;
                    }
                }
            }
            return null;
        }

        public clearMax() {
            while(this.history.length >= this.max && this.max > 0) {
                let first = this.history.all[0];
                this.close(first.hash);
            }
        }

        public close(hash: string) {
            let currentPage = this.pageGet(hash);
            if(!currentPage) { return;}

            let isCurrent = currentPage === this.pageGet(currentHash);
            currentPage.close();
            this.history.remove(hash);
            this.pages = this.pages.filter(page => page !== currentPage);
            this.tab && this.tab.remove(hash);

            // 显示上一个页面
            if(this.history.length > 0 && isCurrent) {
                open(this.history.last.hash);
            }
        }

        public closeAll() {
            this.pages && this.pages.forEach(page => page.close());
            this.pages = null;
        }

        public disappear() {
            Array.isArray(this.pages) && this.pages.forEach(page => page.close());
            this.mainPage && this.mainPage.close();
            this.tab && this.tab.destroy();
            this.tab = null;
            this.mainPage = null;
            this.pages = null;
            this.history.removeAll();
        }

        public destroy() {
            this.name = '';
            this.container = null;
            this.router = null;
            this.disappear();
            this.history = null;
        }
    }

    /**
     * 事件初始化, 整个页面通过hashChange来
     */
    let hashChangeEvent = (() => {
        let customOnChange: (newHash: ISPAHash, oldHash: ISPAHash) => void = null;
        let handler = function (ev:HashChangeEvent) {
            // openInner(ev.newURL.split('#')[1], unusedPageData);
            hashChange(ev.newURL);
            if(tools.isFunction(customOnChange)) {
                customOnChange(url2hash(ev.newURL, 1), url2hash(ev.oldURL, 1))
            }
        };

        return {
            on : () => {
                d.on(window, 'hashchange', handler);
            },
            off: () => {
                d.on(window, 'hashchange', handler);
            },
            onChange(handler: (newHash: ISPAHash, oldHash: ISPAHash) => void){
                customOnChange = handler;
            }
        }
    })();

    function url2hash(url:string, type:0): string;
    function url2hash(url:string, type:1): ISPAHash;
    function url2hash(url, type=1) {
        let hash =  url.split('#')[1];
        return type === 0 ? hash : hashAnalyze(hash);
    }

    function hashChange(url: string) {
        // debugger;
        let hash = url2hash(url, 0),
            {spaName} = hashAnalyze(hash);

        let spaItem = spaItems[spaName];
        if(spaItem) {
            let oldSpaName = hashAnalyze(currentHash).spaName;
            if(oldSpaName !== spaName && spaItems[oldSpaName]){
                // 如果换了一个单页应用, 则清理到之前的所有页面
                spaItems[oldSpaName].disappear();
                // 初始化新的应用
                spaItem.init();
            }

            spaItem.open(hash);

            currentHash = hash;
        }
        // debugger;
    }


    /**
     * 初始化
     */
    function init(paras: ISPAPara[]) {
        // destroy();
        if(tools.isEmpty(paras)) {
            return false;
        }


        spaItems = {};
        paras.forEach(para => {
            spaItems[para.name] = new SPAItem(para);
        });

        let hash = location.hash;
        location.hash = '';

        hashChangeEvent.on();

        //
        // // 数组第一个作为默认打开单页应用
        spaItems[paras[0].name].init();

        if(hash){
            open(hash);
        }
    }

    /**
     * 打开页面，外部调用，其实只是修改url的hash
     */
    function open(hash:string, data?){
        location.hash = hash;
        hash2data[hash] = data;
    }

    /**
     * 返回
     */
    function back() {
        history.back();
    }

    /**
     * 分解url的hash值, 返回hash, routeName, para
     * @param {string} hash
     * @return
     */
    function hashAnalyze(hash: string):ISPAHash {
        if(hash) {
            let hashArr = hash.split('?'),
                [, spaName, routeName] = hashArr[0].split('/'),
                para: string[] = null;

            if (hashArr[1]) {
                let search = {};
                hashArr[1].split('&').forEach((keyVal) => {
                    let arr = keyVal.split('=');
                    search[arr[0]] = arr[1] || '';
                });

                para = typeof search[PARA_NAME] === 'string' ? search[PARA_NAME].split(',') : null;
            }

            return {spaName, routeName, para};

        }
        return {spaName:'', routeName:'', para:null};
    }

    function hashCreate(spaName:string, routeName:string, para?:string[]) {
        spaName = encodeURIComponent(spaName);
        routeName = encodeURIComponent(routeName);
        let paraStr = Array.isArray(para) ? encodeURIComponent(para.join(',')) : '';

        return `/${spaName}/${routeName}` + (paraStr ? `?${PARA_NAME}=${paraStr}` : '');
    }

    function hashCompare(hash1:string, hash2:string) {
        let {spaName: spaName1, routeName: routeName1, para: para1} = hashAnalyze(hash1),
            {spaName: spaName2, routeName: routeName2, para: para2} = hashAnalyze(hash1);

        if(spaName1 === spaName2 && routeName1 === routeName2) {
            if(Array.isArray(para1) && Array.isArray(para2)) {

            } else {
                return
            }
        }
    }

    function close(hash: string) {
        let route = spaItems[hashAnalyze(hash).spaName];
        route.close(hash);
    }

    function destroy() {
        hashChangeEvent.off();
        hash2data = null;
        currentHash = null;
        spaItems && Object.values(spaItems).forEach(item => item.destroy());
        spaItems = null;
    }
    /**
     * 对外提供公共属性与方法
     */

    function pageGet({routeName, spaName, para}: ISPAHash):SPAPage {
        let route = spaItems[routeName];
        return route ? route.pageGet(hashCreate(routeName, spaName, para)) : null;
    }
    return {
        init, open, close, pageGet, hashAnalyze, hashCreate, onChange: hashChangeEvent.onChange
    };
})(document, window);

export abstract class SPAPage {

    protected abstract wrapperInit(): Node;
    protected abstract init(para:Primitive[], data?);

    protected _title:string;
    abstract get title();
    abstract set title(str:string);

    constructor(protected para?: Primitive[], protected data?) {
        this.initInner();
    }

    // 初始化, 刷新
    private initInner() {
        if(this.wrapper){
            d.append(this.wrapper, this.wrapperInit());
        }
        this.init(this.para, this.data);
    }

    private _hash: string;
    get hash() {
        return this._hash;
    }

    private _wrapper: HTMLElement;
    get wrapper() {
        if(!this._wrapper) {
            this._wrapper = this.wrapperCreate();
        }
        return this._wrapper;
    }

    protected wrapperCreate():HTMLElement {
        let dom = document.createElement('div');
        dom.classList.add('page-container');
        d.data(dom, {hash: this.hash});
        return dom;
    }

    private _container: HTMLElement = null;
    set container(el: HTMLElement | string) {
        if(el) {
            this._container = typeof el === 'string' ? document.querySelector(el) : el;
            d.append(this._container, this.wrapper);
        }
    }
    get container(){
        return this._container;
    }


    private _isShow = false;
    set isShow(isShow:boolean){
        this.wrapper && this.wrapper.classList.toggle('hide', !isShow);
        this._isShow = !!isShow;
    }

    get isShow(){
        return this._isShow;
    }

    refresh() {
        this.destroy();
        this.initInner();
    }

    close() {
        this.beforeClose(this);
        this.destroy();
        this.afterClose(this._hash);
        this._hash = null;
        this.beforeClose = null;
        this.afterClose = null;
        this._container = null;
        this.para = null;
        this.data = null;
    }

    protected destroy() {
        d.remove(this._wrapper);
        this._wrapper = null;
    }

    beforeClose = function (page: SPAPage) {

    };

    afterClose = function (hash:string) {

    };

    domReady = function () {}
}
SPAPage[SPA_PAGE_FLAG] = true;


interface ISPATabPara {
    container: HTMLElement;
}
const ITEM_SELECTOR = '[data-role="item"]',
    CLOSE_SELECTOR = '[data-role="close"]',
    TITLE_SELECTOR = '[data-role="title"]';
export abstract class SPATab {
    private wrapper: HTMLElement;
    private container: HTMLElement;

    protected abstract wrapperInit(): HTMLElement;
    protected abstract itemCreate(): HTMLElement;

    protected constructor(para: ISPATabPara) {
        this.wrapper = this.wrapperInit();
        this.container = para.container;
        d.append(this.container, this.wrapper);
        this.initInner();
        this.init();
    }

    private initInner() {
        this.clickEvent.on();
    }

    protected init(){};

    private clickEvent = (() => {
        let selector = `${ITEM_SELECTOR}, ${CLOSE_SELECTOR}`,
            itemHandler = function (e) {
                let role = this.dataset.role,
                    isClose = role === 'close',
                    item = isClose ? d.closest(this, ITEM_SELECTOR) : this,
                    hash = d.data(item);

                if (isClose) {
                    SPA.close(hash);
                } else {
                    SPA.open(hash);
                }

                e.stopPropagation();
            };

        return {
            on: () => {
                d.on(this.wrapper, 'click', selector, itemHandler);
            },
            off: () => {
                d.off(this.wrapper, 'click', selector, itemHandler);
            }
        }
    })();


    private items: objOf<SPATabItem> = {};

    add(hash: string, title?: string) {
        let wrapper = this.itemCreate();

        d.data(wrapper, hash);

        d.append(this.wrapper, wrapper);

        this.items[hash] = new SPATabItem({wrapper, hash, title});
    }

    remove(hash: string) {
        let items = this.items;
        items[hash].destroy();
        delete items[hash];
    }

    get(hash: string){
        return this.items[hash] || null
    }

    protected _active: string;
    active(hash: string){
        if(this._active){
            let prev = this.get(this._active);
            prev && (prev.active = false);
        }
        let current = this.get(hash);
        if(current){
            current.active = true;
            this._active = hash;
        }
    }

    destroy(){
        Object.values(this.items).forEach(item => {
            item.active;
        });
        this.items = {};
        d.remove(this.wrapper);
        this.container = null;
        this.wrapper = null;
    }

}
interface ISPATabItemPara {
    wrapper: HTMLElement;
    hash: string;
    title?: string;
}
class SPATabItem {
    private wrapper: HTMLElement;
    public hash: string;

    constructor(para: ISPATabItemPara){
        this.wrapper = para.wrapper;
        this.hash = para.hash;
        this.title = para.title;
    }

    private _titleEl: HTMLElement;
    get titleEl (){
        if(!this._titleEl) {
            this._titleEl = d.query(TITLE_SELECTOR, this.wrapper);
        }
        return this._titleEl;
    }

    private _title: string;
    set title(str: string) {
        this.titleEl.innerHTML = tools.str.toEmpty(str);
        this._title = str;
    }
    get title(){
        return this._title;
    }

    set active(flag:boolean){
        this.wrapper.classList.toggle('active', flag);
    }
    get active(){
        return this.wrapper.classList.contains('active');
    }

    destroy(){
        d.remove(this.wrapper);
        this.wrapper = null;
        this._titleEl = null;
        this._title = null;
        this.hash = null;
    }
}



interface ISPAHistoryPara{
    spaName: string;
    // isLocal
}

interface ISPAHistoryItem {
    hash: string;
    data?: string | number | obj;
    refer?: string;
    // locked: boolean;
}

class SPAHistory {
    private _localKey = '__SAP_LOCAL_HISTORY__';
    private isLocal = false;
    private spaName: string;

    constructor(spaName: string) {
        this.spaName = spaName;
    }

    get localKey() {
        this.spaName = this.spaName || '';
        return this._localKey + this.spaName;
    }

    private items: ISPAHistoryItem[] = null;
    get all(): ISPAHistoryItem[] {
        return this.items ? [...this.items] : null;
    }

    get last(): ISPAHistoryItem{
        return this.all ? this.all.pop() : null;
    }

    get length() {
        return this.items ? this.items.length : 0;
    }

    add(newItem: ISPAHistoryItem) {
        if(!newItem || !newItem.hash) {
            return
        }
        let oldItemIndex = this.indexOf(newItem.hash);
        if(~oldItemIndex) {
            let oldItem = this.items.splice(oldItemIndex, 1)[0];
            newItem.data = newItem.data === void 0 ? oldItem.data : newItem.data;
        }
        this.items = this.items || [];
        this.items.push(newItem);
    }

    remove(hash:string) {
        let index = this.indexOf(hash);
        if(~index){
            this.items.splice(index, 1)
        }
    }

    removeAll(){
        this.items = [];
    }

    has(hash:string){
        return ~this.indexOf(hash);
    }

    get(hash:string) {
        let index = this.indexOf(hash);
        return index >= 0 ? this.items[index] : null;
    }

    indexOf(hash:string){
        if(!this.items){
            return -1;
        }

        for (let i = 0, item:ISPAHistoryItem; item = this.items[i]; i++){
            if(item.hash === hash){
                return i;
            }
        }
        return -1;
    }

}
}