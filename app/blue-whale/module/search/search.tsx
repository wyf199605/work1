/// <amd-module name="Search"/>
import d = G.d;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import CONF = BW.CONF;
import sys = BW.sys;
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {BwRule} from "../../common/rule/BwRule";
import Shell = G.Shell;

interface SearchPara {
    baseUrl: string,
    nodeId: string,
    searchBtn: HTMLElement,
}

interface MenuItemPara {
    menuItem: MenuPara
    menuLocation: string
}

interface MenuPara {
    menuIcon: string,
    menuName: string,
    menuPath: MenuPathPara,
    menuType: number,
    favid: string
}

interface MenuPathPara {
    addrType: boolean,
    commitType: number,
    dataAddr: string,
    needGps: number,
    type: string,
    varType: number
}

export class Search {
    private modal: Modal;
    private spinner: Spinner;

    constructor(private para: SearchPara) {
        this.searchInit(para);
    }

    private searchInit(para: SearchPara) {
        //查询按钮
        d.on(para.searchBtn, 'click', () => {
            if (!this.modal) {
                this.modal = new Modal({
                    header: '查询',
                    footer: {},
                    className: 'modal-search',
                    body: this.searchTpl(),
                });
                this.evenInit();
            } else {
                this.modal.isShow = true;
            }
        });
    }

    /**
     * 键入搜索
     */
    private evenInit() {
        let debounce = G.tools.pattern.debounce(this.search, 300);
        let query = () => {
            if (this.input !== '') {
                this.closeEl.classList.remove('hide');
            } else {
                this.closeEl.classList.add('hide');
            }
            debounce();
        };
        d.on(this.inputEl, 'input', () => query());

        d.on(this.closeEl, 'click', () => {
            this.input = '';
            this.closeEl.classList.add('hide');
        });

        d.on(this.voiceEl, 'click', () => {
            this.dotEl.classList.remove('hide');
            Shell.base.speak(3, null, result => {
                this.dotEl.classList.add('hide');
            }, result => {
                this.input = result.data;
                query();
            })
        });

        d.on(this.menuEl, 'click', 'li.mui-table-view-cell[data-href]', function () {
            sys.window.open({url: CONF.siteUrl + this.dataset.href});
        });

    }

    /**
     * ui构造
     * @param para
     * @param msg   错误信息
     */
    private uiMake(para: MenuItemPara[], msg: string) {
        let fragment = document.createDocumentFragment();
        if (para && para[0]) {
            para.forEach((obj: MenuItemPara) => {
                fragment.appendChild(this.liTpl(obj));
            });
        } else {
            fragment.appendChild(<li class="no-data">暂无数据</li>);
        }
        this.menuEl.appendChild(fragment);
    }

    /**
     * 查询
     * @param value
     */
    private ajax = new BwRule.Ajax();
    private search = () => {
        if (this.input !== '') {
            this.menuEl.innerHTML = null;

            if (!this.spinner) {
                this.spinner = new Spinner({
                    el: this.menuEl,
                    type: Spinner.SHOW_TYPE.append
                });
            }
            this.spinner.show();
            let url = CONF.siteUrl + this.para.baseUrl + 'currentNode=' + this.para.nodeId + '&keywords=' + this.input;
            this.ajax.fetch(url, {
                type: 'POST',
                cache: true
            }).then(({response}) => {
                this.uiMake(response.body.bodyList, response.msg);
            }).finally(() => {
                this.spinner.hide();
            });
        }
    };

    set input(value : string){
        this.inputEl.value = value;
    }

    get input(){
        return this.inputEl.value;
    }

    /**
     * 初始化搜索框
     * @returns {HTMLElement}
     */
    private dotEl: HTMLElement;
    private inputEl: HTMLInputElement;
    private voiceEl: HTMLElement;
    private closeEl: HTMLElement;
    private menuEl : HTMLElement;
    private searchTpl(): HTMLElement {
        return <div>
            <div className="search-input mui-input-row">
                <label>
                    {this.voiceEl = <span className="iconfont icon-huatong grey"></span>}
                    {this.dotEl = <span className="dot grey hide">···</span>}
                </label>
                {this.inputEl = <input type="text" placeholder="搜索功能名称" className="searchInput mui-input-clear mui-input" autoCapitalize="off" autoCorrect="off"></input>}
                {this.closeEl = <span className="mui-icon mui-icon-clear hide"></span>}
            </div>
            <div className="mui-content  mui-scroll-wrapper search-content">
                <div className="mui-scroll search-scroll">
                    {this.menuEl = <ul className="mui-table-view mui-grid-view mui-grid-9"></ul>}
                </div>
            </div>
        </div>
    }
    
    private liTpl(obj: MenuItemPara): HTMLElement {
        let menuItem = obj.menuItem,
            menuPath = menuItem.menuPath;
        return <li class="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3" data-href={menuPath.dataAddr} data-gps={menuPath.needGps} data-favid={menuItem.favid}>
            <a href="javascript:void(0)">
                    <span class={"mui-icon " + menuItem.menuIcon}>
                    </span>
                <div class="mui-media-body">{menuItem.menuName}</div>
            </a>
        </li>;
    }
}