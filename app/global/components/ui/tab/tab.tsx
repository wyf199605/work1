/// <amd-module name="Tab"/>
import tools = G.tools;
import d = G.d;
export interface TabPara{
    tabParent? : HTMLElement;
    panelParent? : HTMLElement;
    tabs?:ITab[];
    tabIndex? : boolean;
    tabIndexKey? : number;
    onClick?(index : number) : void
    onChange?: (index: number) => void;
}
export interface ITab {
    name? : string;
    title? : string;
    titleDom? : HTMLElement;
    dom? : HTMLElement;
}

export class Tab{
    public tabContainer : HTMLElement; // tab容器
    public panelContainer : HTMLElement; // panel容器
    protected clickEvent: (tabEl: HTMLElement) => void;  // 点击事件
    protected activeList : HTMLElement[] = [null, null];
    len : number = 0;
    constructor(protected para : TabPara){
        this.panelContainer = Tab.createPanelContainer();
        this.tabContainer = Tab.createTabContainer();
        this._onChange = para.onChange;

        // 构造tab 界面
        this.addTab(para.tabs);

        // 载入到界面
        para.tabParent && para.tabParent.appendChild(this.tabContainer);
        para.panelParent && para.panelParent.appendChild(this.panelContainer);

        // 点击事件绑定
        this.clickEvent =  (el) => {
            let index = parseInt(el.dataset.index);
            this.active(index);
            // if(typeof para.onClick === 'function'){
            //     para.onClick.call( this, index );
            // }
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

    protected _onChange: (index: number) => void;
    get onChange(){
        return this._onChange;
    }

    protected tabIndexKey : number;
    protected _tabIndex : boolean = false;
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
     */
    addTab(tabs : ITab[]){

        Array.isArray(tabs) && tabs.forEach((p) => {
            d.append(this.panelContainer, Tab.createPanel(p.dom, this.len));
            d.append(this.tabContainer, Tab.createTab({
                index : this.len ,
                title : p.titleDom ? p.titleDom : p.title
            }));

            this.len ++;
        });
    }

    deleteTab(index :number){
        let tab = d.query(`li[data-index="${index}"]`, this.tabContainer),
            panel = d.query(`div.tab-pane[data-index="${index}"]`, this.panelContainer);
        tab && d.remove(tab);
        panel && d.remove(panel);
        this.len--;
        let curPanelChilds = this.panelContainer.children,
            curTabChilds = this.tabContainer.children;
        curPanelChilds && resetIndex(curPanelChilds);
        curTabChilds && resetIndex(curTabChilds);
        function resetIndex(parEl){
            for(let i = 0,l = parEl.length;i < l;i++){
                let tempDom = parEl[i] ;
                tempDom.dataset.index = i.toString();
            }
        }
    }

    /**
     * 激活某个tab
     * @param index
     */
    protected firstIndex = [];
    active(index:number){
        let tab = d.query(`li[data-index="${index}"]`, this.tabContainer),
            panel = d.query(`div.tab-pane[data-index="${index}"]`, this.panelContainer);

        let activeClass = 'active';

        this.activeList.forEach(a => d.classRemove(a, activeClass));
        if(tab && panel) {
            d.classAdd(tab, activeClass);
            d.classAdd(panel, activeClass);
            this.activeList = [tab, panel];
            if(typeof this.para.onClick === 'function'){
                this.para.onClick.call( this, index );
            }
        }
        if(this.firstIndex.indexOf(index) === -1){
            typeof this.onChange === 'function' && this.onChange(index);
            this.firstIndex.push(index);
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
    protected static createPanel(dom:HTMLElement, index:number) : HTMLElement{
        return <div className="tab-pane" data-index={index}>{dom}</div>;
    }
    protected static createPanelContainer(){
        return <div className="tab-content"></div>;
    }

    protected static createTabContainer(){
        return <ul className="nav nav-tabs nav-tabs-line"></ul>;
    }
    protected static createTab(obj:obj){
        if(typeof obj.title === 'string'){
            return <li data-index={obj.index} tabIndex={tools.getGuid('')}><a>{obj.title}</a></li>;
        }
        else{
            let tempLi = <li data-index={obj.index} tabIndex={tools.getGuid('')}></li>;
            d.append(tempLi,obj.title);
            return tempLi;
        }
    }
}