/// <amd-module name="MainPage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import {MainPageHeader} from "./MainPageHeader";
import {MainPageSideBar} from "./MainPageSideBar";
import SPA = G.SPA;
import {LeBasicPageHeader} from "../LeBasicPageHeader";
export class MainPage extends SPAPage {
    set title(t: string) {
        this._title = t;
    }
    get title() {
        return this._title;
    }

    private sideBar: MainPageSideBar;
    private header: MainPageHeader;
    private tabsEl: HTMLElement;
    private pageHeader: LeBasicPageHeader;

    constructor(props) {
        super(props);

        this.hashEvent.on();
    }

    protected hashEvent = (() => {
        let handler = (e: HashChangeEvent) => {
            let hash =  e.newURL.split('#')[1],
                {para} = SPA.hashAnalyze(hash);

            if(para.inTab) {
                this.tabsActive(hash);
            }
            if(!para.inTab && !para.inModal){
                this.tabsClear();
            }
        };

        return {
            on: () => {
                d.on(window, 'hashchange', handler);
            },
            off: () => {
                d.off(window, 'hashchange', handler);
            }
        }

    })();

    protected wrapperInit() {
        return <div className="lesson-main">
            {this.header = <MainPageHeader/>}
            <div className="lesson-container">
                <div className="lesson-menu" data-name="lesson-menu">
                    {this.sideBar = <MainPageSideBar mainPage={this} />}
                </div>
                <div className="lesson-content" id="body">
                    {this.tabsEl = <div className="main-tabs menu-tabs"/>}
                    <div id="lesson-body"/>
                </div>
            </div>
        </div>;
    }

    tabsRender(tabs: {title: string, hash: string}[], title = '页面') {
        this.tabsEl.innerHTML = '';
        if(tabs[0] && tabs[0].hash) {
            this.pageHeader = <LeBasicPageHeader title={title} container={this.tabsEl}/>;
            d.append(this.tabsEl, <ul className="nav nav-tabs nav-tabs-line">
                {(tabs || []).map(tab => <li><a href={'#' + tab.hash}>{tab.title}</a></li>)}
            </ul>);


            SPA.open(tabs[0].hash);
            this.tabsActive(tabs[0].hash);
        }
    }

    tabsClear() {
        this.tabsEl.innerHTML = '';
    }

    private tabsActive(hash: string) {
        const activeClass = 'active';
        let actived = d.query(`li.${activeClass}`, this.tabsEl),
            tabEl = d.query(`li a[href="#${hash}"]`, this.tabsEl);

        d.classRemove(actived, activeClass);
        tabEl && d.classAdd(tabEl.parentElement, activeClass);
    }

    protected init(para: Primitive[], data?) {
        this.title = '首页';
    }

    destroy() {
        super.destroy();
        this.sideBar.destroy();
        this.header.destroy();
        this.hashEvent.off();
        this.hashEvent = null;
        this.sideBar = null;
        this.header = null;
    }
}