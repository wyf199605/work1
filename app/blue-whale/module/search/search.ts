/// <amd-module name="Search"/>
import d = G.d;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import CONF = BW.CONF;
import sys = BW.sys;
import tools = G.tools;
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {BwRule} from "../../common/rule/BwRule";
interface SearchPara{
    baseUrl : string,
    nodeId : string,
    searchBtn : HTMLElement,
}
interface MenuItemPara{
    menuItem : MenuPara
    menuLocation : string
}
interface MenuPara{
    menuIcon : string,
    menuName : string,
    menuPath : MenuPathPara,
    menuType : number,
    favid : string
}
interface MenuPathPara{
    addrType : boolean,
    commitType : number,
    dataAddr : string,
    needGps : number,
    type : string,
    varType : number
}
export class Search{
    private modal : Modal;
    private spinner : Spinner;
    constructor(private para : SearchPara){
        this.searchInit(para);
    }

    private searchInit(para : SearchPara){
        //查询按钮
        d.on(para.searchBtn, 'click',  () => {
                if(!this.modal){
                    this.modal = new Modal({
                        header : '查询',
                        footer : {},
                        body : this.searchTpl(),
                    });
                    this.modal.bodyWrapper.classList.add('modal-search');
                    let searchInput = <HTMLInputElement>d.query('.searchInput',this.modal.bodyWrapper),
                        closeBtn = <HTMLElement>searchInput.nextElementSibling;
                    //搜索
                    this.input(searchInput,closeBtn);
                    searchInput && setTimeout(function () {
                        d.on(closeBtn, 'click', function (e) {
                            searchInput.value = '';
                            closeBtn.classList.add('mui-hidden');
                        });
                    }, 1000);
                    //content页面生成
                    this.modal.bodyWrapper.appendChild(this.contentTpl());
                    // mui('.mui-scroll').scroll();
                    (function () {
                        d.on(d.query('#menuSearch'), 'click', 'li.mui-table-view-cell[data-href]', function () {
                            sys.window.open({url: CONF.siteUrl + this.dataset.href});
                        });
                        // mui('#menuSearch').on('longtap', 'li.mui-table-view-cell', function () {
                        //     let type = tools.isEmpty(this.dataset.favid) ? 'add' : 'cancel';
                        //     MENU_FAVORITE.toggleFavSheet(this, type, {
                        //         favid : this.dataset.favid,
                        //         link : this.dataset.href
                        //     });
                        // });
                    }());
                }else {
                    this.modal.isShow = true;
                }

            });
    }

    /**
     * 键入搜索
     * @param searchInput 搜索输入框dom
     * @param closeBtn 清空图标dom
     */
    private input(searchInput : HTMLInputElement, closeBtn : HTMLElement){
        let timer = null;
        d.on(searchInput, 'input',()=>{
            let value = searchInput.value;
            if(value !== ''){
                closeBtn.classList.remove('mui-hidden');
            }else {
                closeBtn.classList.add('mui-hidden');
            }

            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() =>{
                this.search(value);
                timer = null;
            }, 300);
        });

    }

    /**
     * ui构造
     * @param para
     * @param msg   错误信息
     */
    private uiMake(para : MenuItemPara[], msg : string){
        let ul = d.query('#menuSearch', this.modal.bodyWrapper),
            fragment = document.createDocumentFragment();
        if(para && para[0]){
            para.forEach((obj : MenuItemPara) => {
                fragment.appendChild(this.liTpl(obj));
            });
        }else {
            fragment.appendChild(d.create(`<li class="no-data">暂无数据</li>`));
        }
        ul.appendChild(fragment);

    }

    /**
     * 查询
     * @param value
     */
    private ajax = new BwRule.Ajax();
    private search(value : string){
        console.log('sear');
        if(value === ''){

        }else {
            let ul = d.query('#menuSearch', this.modal.bodyWrapper);
            ul.innerHTML = null;

            if(!this.spinner){
                this.spinner = new Spinner({
                    el : ul,
                    type : Spinner.SHOW_TYPE.append
                });
            }
            this.spinner.show();
            let url = CONF.siteUrl + this.para.baseUrl + 'currentNode=' + this.para.nodeId + '&keywords=' + value;
            this.ajax.fetch(url, {
                type: 'POST',
                cache: true
            }).then(({response}) => {
                this.uiMake(response.body.bodyList, response.msg);
            }).finally(() => {
                this.spinner.hide();

            });
        }

    }

    /**
     * 初始化搜索框
     * @returns {HTMLElement}
     */
    private searchTpl() : HTMLElement{
        return d.create(`<div class="search-input mui-input-row">
        <label><span class="mui-icon mui-icon-search grey"></span></label>
        <input type="text" placeholder="搜索功能名称" class="searchInput mui-input-clear mui-input" autocapitalize="off" autocorrect="off">
        <span class="mui-icon mui-icon-clear mui-hidden"></span>
        </div>`);
    }

    /**
     * 容器
     * @returns {HTMLElement}
     */
    private contentTpl() : HTMLElement{
        return d.create(`<div class="mui-content  mui-scroll-wrapper search-content">
             <div class="mui-scroll search-scroll">
               <ul id="menuSearch" class="mui-table-view mui-grid-view mui-grid-9">
              
               </ul>
           </div>
    </div>`);
    }

    private liTpl(obj : MenuItemPara) : HTMLElement{
        let menuPath = obj.menuItem.menuPath;
        return d.create(` <li class="mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3" data-href="${menuPath.dataAddr}" data-gps="${menuPath.needGps}" data-favid="${obj.menuItem.favid}">
                    <a href="javascript:void(0)">
                        <span class="mui-icon ${obj.menuItem.menuIcon}">
                        </span>
                        <div class="mui-media-body">${obj.menuItem.menuName}</div>
                    </a>
                </li>`);
    }
}