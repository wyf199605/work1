/// <amd-module name="Tab"/>
import tools = C.tools;
import d = C.d;
export interface TabPara{
    tabParent? : HTMLElement;
    panelParent? : HTMLElement;
    tabs : {
        name? : string;
        title? : string;
        titleDom? : HTMLElement;
        dom? : HTMLElement;
    }[];
    tabIndex? : boolean;
    tabIndexKey? : number;
    onClick?(index : number) : void
}
export class Tab{
    private tabContainer : HTMLElement; // tab容器
    private panelContainer : HTMLElement; // panel容器
    private clickEvent;  // 点击事件
    private activeList : HTMLElement[] = [null, null];
    len : number;
    constructor(para : TabPara){
        this.panelContainer = Tab.createPanelContainer();
        this.tabContainer = Tab.createTabContainer();

        // 构造tab 界面
        this.len = para.tabs.length;
        this.addTab(para.tabs, true);

        // 载入到界面
        para.tabParent && para.tabParent.appendChild(this.tabContainer);
        para.panelParent && para.panelParent.appendChild(this.panelContainer);

        // 点击事件绑定
        this.clickEvent =  (el) => {
            let index = parseInt(el.dataset.index);
            this.active(index);
            if(typeof para.onClick === 'function'){
                para.onClick.call( this, index );
            }
        };
        let self = this;
        d.on(this.tabContainer, 'click', 'li[data-index]',  function () {
            self.clickEvent(this);
        });

        //默认激活第一个
        if(this.len > 0){
            this.active(0);
        }

        this.tabIndexKey = para.tabIndexKey;
        this.tabIndex = para.tabIndex;
    }

    protected tabIndexKey : number;
    private _tabIndex : boolean = false;
    get tabIndex(){
        return this._tabIndex;
    }

    set tabIndex(tabIndex : boolean){
        tabIndex = !!tabIndex;
        if(this._tabIndex === tabIndex){
            return;
        }
        this._tabIndex = tabIndex;
        let lis = d.queryAll('li[data-index]', this.tabContainer);
        lis.forEach(li => {
            let keyHandle = (e : KeyboardEvent) => {
                let keyCode = e.keyCode || e.which || e.charCode;
                if(tools.isNotEmpty(this.tabIndexKey)){
                    if(keyCode === this.tabIndexKey){
                        this.clickEvent(li);
                    }
                }else if(keyCode === 13){
                    this.clickEvent(li);
                }
            };
            if(tabIndex){
                li.tabIndex = parseInt(tools.getGuid(''));
                d.on(li, 'keydown', keyHandle);
            }else {
                li.removeAttribute('tabIndex');
                d.off(li, 'keydown', keyHandle);
            }
        });
    }

    /**
     * 添加tab
     * @param tabs
     * @param isInit
     */
    addTab(tabs : obj[], isInit = false){
        tabs.forEach((p, i) => {
            let index = isInit === true ?i : i + this.len;
            this.panelContainer.appendChild(Tab.createPanel(p.dom, index));
            this.tabContainer.appendChild(Tab.createTab({
                index : index,
                title : p.titleDom ? p.titleDom : p.title
            }));
        });
        if(isInit === false){
            this.len += tabs.length;
        }

    }

    deleteTab(tab :obj){
        d.remove(tab.dom.parentElement);
        d.remove(tab.titleDom.parentElement);
        this.len--;
        let curPanelChilds = this.panelContainer.children,
            curTabChilds = this.tabContainer.children;
        curPanelChilds && resetIndex(curPanelChilds);
        curTabChilds && resetIndex(curTabChilds);
        function resetIndex(parEl){
            for(let i = 0,l = parEl.length;i < l;i++){
                let tempDom = <HTMLElement>parEl[i];
                tempDom.dataset.index = i.toString();
            }
        }
    }

    /**
     * 激活某个tab
     * @param index
     */
    active(index:number){
        let tab = d.query(`li[data-index="${index}"]`, this.tabContainer),
            panel = d.query(`div.tab-pane[data-index="${index}"]`, this.panelContainer);

        let activeClass = 'active';

        this.activeList.forEach(a => d.classRemove(a, activeClass));
        if(tab && panel) {
            d.classAdd(tab, activeClass);
            d.classAdd(panel, activeClass);
            this.activeList = [tab, panel];
        }
    }

    getTab(){
        return this.tabContainer;
    }

    getPanel(){
        return this.panelContainer;
    }
    /**
     * 创建一个panel
     * @param dom
     * @param index
     * @return {HTMLElement}
     */
    private static createPanel(dom:HTMLElement, index:number) : HTMLElement{
        let panel = document.createElement('div');
        panel.classList.add('tab-pane');
        panel.dataset.index = index.toString();
        panel.appendChild(dom);
        return panel;
    }
    private static createPanelContainer(){
        return d.create('<div class="tab-content"></div>');
    }

    private static createTabContainer(){
        return d.create(`<ul class="nav nav-tabs nav-tabs-line"></ul>`);
    }
    private static createTab(obj:obj){
        if(typeof obj.title === 'string'){
            return d.create(
                `<li data-index="${obj.index}" tabindex="${tools.getGuid('')}"><a>${obj.title}</a></li>`,'ul');
        }
        else{
            let tempLi = d.create(`<li data-index="${obj.index}" tabindex="${tools.getGuid('')}"></li>`,'ul');
            d.append(tempLi,obj.title);
            return tempLi;
        }
    }
}