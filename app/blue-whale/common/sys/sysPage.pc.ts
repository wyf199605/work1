interface Page {
    url: string;
    dom: HTMLDivElement;
    data?: any;
}
interface Pages {
    [id : string]: Page;
}
namespace BW{
    import d = G.d;
    import Ajax = G.Ajax;
    import tools = G.tools;

    export class sysPcPage {

        constructor(private container : HTMLElement){
        }
        private pages = (function (self) {
            let allPage: Pages = {};

            function add (p : Page){
                allPage[p.url] = p;
            }


            return {
                add: (p:Page) => {add(p)},
                remove : function (url) {
                    let page = allPage[url];
                    delete allPage[url];
                    },
                contains: (url:string) => url in allPage,
                last: ():Page => {
                    let lastUrl = sysPcHistory.last();
                    if(lastUrl){
                        return allPage[lastUrl] || null
                    }else{
                        return null;
                    }

                },
                get: (url) => allPage[url] || null
            }
        }(this));

        // private static pageHtmlSet(dom:HTMLElement, html:string){
        //     dom.innerHTML = html;
        //
        //     let scripts:NodeListOf<HTMLScriptElement> = dom.querySelectorAll('script');
        //     for(let i = 0, s:HTMLScriptElement = null; s = scripts.item(i); i++){
        //         let newSc:HTMLScriptElement = document.createElement('script');
        //         newSc.text = s.text;
        //         s.parentNode.replaceChild(newSc, s);
        //     }
        // }

        private pageCreate(o: winOpen, callback: (page:HTMLElement) => void){
            let page = pageDivCreate(o.url);

            // 打开内网
            if(o.url.indexOf(location.hostname) > -1) {
                Ajax.fetch(o.url).then(({response}) => {
                    d.setHTML(page, response);
                    callback(page);
                    typeof o.callback === 'function' && o.callback();
                });
            }else{
                // 外网url, 创建iframe
                let iframe = <HTMLIFrameElement>d.create(`<iframe width="100%" src="${o.url}"></iframe>`);
                d.append(page, iframe);
                page.classList.add('iframe');
                callback(page);

                typeof o.callback === 'function' && o.callback();
            }
            return page;
        }
        private pageDestroy(url: string) {
            let page = this.pages.get(url);
            if(page){
                tools.event.fire('page.destroy', null, page.dom);
                page.dom.style.display = 'none';
                setTimeout(((dom) =>{
                    d.remove(dom);
                })(page.dom), 30);
            }
        }

        private pageOpen(o: winOpen) {

            let page = this.pageCreate(o, p => {
                d.append(this.container, p)
            });

            // 添加记录
            this.pages.add({
                url : o.url,
                dom : page,
                data : o.data,
            });
        }

        private pageShow(url: string){
            let page = this.pages.get(url);
            if(page){
                page.dom.style.display = 'block';
            }
        }
        /**
         * 关闭窗口方法 窗口必须为导航存在的窗口
         * @param {string} url - 关闭窗口的唯一id
         */
        public close(url: string) {

            // dom清除
            this.pageDestroy(url);
            this.pages.remove(url);
        }

        /**
         *
         * @param o
         * @returns {boolean} - 返回true代表是新窗口，false则是旧窗口
         */
        public open (o: winOpen): boolean{
            // 隐藏上次打开的page
            let lastPage = this.pages.last();
            if(lastPage !== null){
                lastPage.dom.style.display = 'none';
            }

            //是否打开过
            if(this.pages.contains(o.url)){
                //显示已经打开的的页面
                this.pageShow(o.url);
                return false;
            }else{
                //打开新的页面
                this.pageOpen(o);

                return true;
            }
        }


        public refresh(url: string, callback?: Function){
            let page = this.pages.get(url);
            if(page){
                // let nextPageDom = this.
                this.pageDestroy(url);
                // debugger
                page.dom = <HTMLDivElement>this.pageCreate({url}, (pageDom) => {
                    if(url !== this.pages.last().url){
                        pageDom.style.display = 'none';
                    }
                    d.append(this.container, pageDom);
                    typeof callback === 'function' && callback();
                })
            }
        }

        public get(url: string){
            return this.pages.get(url);
        }
    }

    function pageDivCreate(url:string) : HTMLDivElement{
        let dom = document.createElement('div');
        dom.classList.add('page-container');
        dom.dataset['src'] = url;// tools.str.htmlEncode(url);
        return dom;
    }
}