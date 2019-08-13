interface TabMenuI {
    icon?: string,
    title: string,
    callback: (url: string) => void
}
namespace BW{

    import d = G.d;

    export class sysPcTab {

        private tabs:{[url:string] : HTMLLIElement} = {};
        private menuEl:HTMLElement = null;
        constructor(private headerNavBar: HTMLUListElement = null, private menu: TabMenuI[]) {
            this.menuCreate(menu);
            this.menuEventInit();
        }

        open(url:string, title?: string){
            if(!this.tabs[url]) {
                this.createNewTab(url, title);
            }
            this.activeTab(url);
        }

        close(url:string) {
            let tab = this.tabs[url];
            if(tab){
                // debugger;
                // this.lockToggle(url, false);
                d.remove(tab);
                delete this.tabs[url];
            }
        }

        getTab(url){
            return this.tabs[url] || null;
        }

        // 激活已经打开的tab
        activeTab(url:string) {
            let active = this.tabs[url],
                lastUrl = sysPcHistory.last();
            if (lastUrl) {
                // console.log(this.tabs[lastUrl])
                this.tabs[lastUrl] && this.tabs[lastUrl].classList.remove('open');
                
            }else {
                this.tabs[Object.keys(this.tabs)[0]] && this.tabs[Object.keys(this.tabs)[0]].classList.remove('open');
                let dom: HTMLElement = document.querySelector('.page-container');
                dom && (dom.style.display = 'none');
            }
            console.log(Object.keys(this.tabs));
            if (active) {
                active.classList.add('open');
            }
        }

        createNewTab(url:string, title:string = '<div class="spinner"></div>', isLock:boolean = false) {
            let navTab = <HTMLLIElement>d.create(
                `<li class="dropdown" data-href="${url}"><a>` +
                `<span class="title">${title ? title : '空'}</span>`+
                `<span class="close ti-plus" data-href="${url}"></span>` +
                `<span class="lock-icon iconfont icon-pin4"></span>` +
                `</a></li>`);

            this.tabs[url] = navTab;

            d.append(this.headerNavBar, navTab);
            if(isLock){
                this.lockToggle(url, true);
            }
        }

        lockToggle(url: string, isLock:boolean){
            let tab = this.tabs[url],
                bar = this.headerNavBar;

            if(!tab) {
                return;
            }

            let edge = d.query('li:not(.locked)', bar);
            if(edge === null){
                d.append(bar, tab);
            }else{
                d.before(edge, tab);
            }

            tab.classList.toggle('locked', isLock);

        }

        private menuCreate(menus: TabMenuI[]) {
            let menuHtml = '',
                menuEl = d.create('<ul class="tab-menu"></ul>');


            menus.forEach((menu, i) => {
                let content = menu.icon ? `<span class="iconfont ${menu.icon}"></span>` : menu.title;
                menuHtml += `<li data-index="${i}" title="${menu.title}">${content}</li>`;
            });
            menuEl.innerHTML = menuHtml;

            d.on(menuEl, 'click', 'li[data-index]', function(e) {
                let index = parseInt(this.dataset.index);
                if(menus[index]) {
                    menus[index].callback(menuEl.dataset.href);
                }
                e.stopPropagation();
            });

            d.append(document.body, menuEl);
            this.menuEl = menuEl;
        }

        private menuEventInit (){
            let self = this;
            d.on(this.headerNavBar, 'contextmenu', 'li[data-href]', function (e:MouseEvent) {
                e.preventDefault();
                e.stopPropagation();
                if(self.menuEl) {
                    self.menuEl.style.top = `${e.clientY}px`;
                    self.menuEl.style.left = `${e.clientX}px`;
                    self.menuEl.classList.remove('hide');
                    self.menuEl.dataset.href = this.dataset.href;
                }
            });

            window.addEventListener('click', function () {
                self.menuEl.classList.add('hide');
            }, true);
        }

        setTabTitle(url:string = sysPcHistory.last(), title:string , callback?) {
            if(this.tabs[url]){
                this.tabs[url].querySelector('span.title').innerHTML = title;
                if (typeof callback === 'function') {
                    callback();
                }
            }
        }

        initHistory(tabArr: UrlData[]) {
        // initHistory() {


            // let order = sysPcHistory.getMenuOrder();
            // for(let url in order){
            //     if(order.hasOwnProperty(url)) {
            //         this.createNewTab(url, order[url].title, order[url].isLock);
            //     }
            // }
            tabArr.forEach(tab => {
                this.createNewTab(tab.url, tab.title, tab.isLock)
            })
        }

    }

}
