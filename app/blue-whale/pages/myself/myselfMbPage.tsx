import sys = BW.sys;
import tools = G.tools;
import CONF = BW.CONF;
import d = G.d;
import { BwRule } from "../../common/rule/BwRule";
import { Modal } from 'global/components/feedback/modal/Modal';
import { User } from "../../../global/entity/User";
import { ShellAction } from "../../../global/action/ShellAction";
import Ajax = G.Ajax;
import { RfidSettingModal } from "../rfid/RfidSetting/RfidSetting";
import Shell = G.Shell;
import sysPcHistory = BW.sysPcHistory;
import { Loading } from "../../../global/components/ui/loading/loading";
import { checkNetwork } from './checkNetwork.mb'
import { QueryBuilder } from "blue-whale/module/query/queryBuilder";
export = class myselfMbPage {
    constructor() {
        // mui.init();
        // '.mui-scroll-wrapper').scroll();
        let items = [];
        let loading = new Loading({});
        loading.show();
        G.Ajax.fetch(CONF.ajaxUrl.personalmenu).then(({ response }) => {
            response = JSON.parse(response);
            let menus = response.body && response.body.elements;
            // console.log('in mb');
            // console.log(menus);
            menus && menus.forEach((menu: IBW_Menu) => {
                /*
                *   0： pc和mb都显示
                *   1： 仅pc显示
                *   2： 仅mb显示
                * */
                (menu.isPc === 0 || menu.isPc === 2) && items.push({
                    content: menu.menuName,
                    icon: menu.menuIcon,
                    onClick: () => {
                        BwRule.reqAddrMenu(menu);
                    }
                })
            });
        }).finally(() => {
            loading && loading.hide();
            loading = null;
            this.init(items);
        });
    }

    protected init(items: obj[]) {
        let self = this;
        let user = User.get();
        d.setHTML(d.query('#userid'), user.are_id + ' ' + user.department);
        d.setHTML(d.query('#name'), user.username + ' ' + user.userid);

        let list = d.query('#table-list');

        if (tools.isMb) {
            this.setFontSize(list);
            this.rfidSettingInit(list);
        }

        items.forEach((item) => {
            let li = <li className="mui-table-view-cell">
                <a href="#" className="mui-navigate-right">
                    <i className={item.icon} />
                    {item.content}
                </a>
            </li>;
            d.on(li, 'click', () => {
                item.onClick();
            });
            d.append(list, li);
        });
        // 安卓判断
        // if (sys.os === 'ad') {
        //     let li1 = <li className="mui-table-view-cell" data-page-name="powerManager">
        //             <a href="#" className="mui-navigate-right"> <i class="iconfont icon-023tuceng-copy-copy" style="color:#f15054;margin-right:10px"></i>权限管理</a>
        //         </li>,
        //         li2 = <li className="mui-table-view-cell" data-page-name="whiteBat">
        //             <a href="#" className="mui-navigate-right"> <i class="iconfont icon-renyuan" style="color:#4ea6f1;margin-right:10px"></i>电池白名单</a>
        //         </li>;
        //
        //     d.append(list, li1);
        //     d.append(list, li2);
        //
        //     d.on(d.query('[data-page-name=powerManager]'), 'click', function () {
        //         sys.window.powerManager();
        //     });
        //
        //     d.on(d.query('[data-page-name=whiteBat]'), 'click', () => {
        //         sys.window.whiteBat();
        //     });
        // }
        // if (CONF.appid === 'app_fastlion_retail') {
        //     let li = <li className="mui-table-view-cell" id="changePassword">
        //         <a href="#" className="mui-navigate-right"> <i className="iconfont icon-renyuan" style="color:#FFB741;margin-right:10px"></i>密码修改</a>
        //     </li>;
        //     d.append(list, li);
        // }
        if (sys.window.toClient) {
            let li = <li className="mui-table-view-cell">
                <a href="#" className="mui-navigate-right">更改客户代码</a>
            </li>;
            d.append(list, li);
            d.on(li, 'click', (e) => {
                e.preventDefault();
                sys.window.toClient();
            })
        }

        d.on(d.query('.selfMenuPage'), 'click', '.mui-table-view>.mui-table-view-cell[data-page-name]', function (e) {
            let dataset = d.closest(e.target as HTMLElement, '.mui-table-view-cell[data-page-name]').dataset.pageName;
            let pageUrl = BW.CONF.url[dataset];
            if (pageUrl) {
                if (dataset === 'myself') {
                    sys.window.open({
                        url: tools.url.addObj(CONF.url.myself, {
                            userid: user.userid
                        })
                    });
                } else if (dataset === 'bugReport') {
                    sys.window.open({
                        url: CONF.url.bugList
                    });
                } else if (dataset === 'myApplication') {
                    sys.window.open({
                        url: CONF.url.myApplication
                    });
                } else if (dataset === 'myApproval') {
                    sys.window.open({
                        url: CONF.url.myApproval
                    });
                } else {
                    sys.window.open({
                        url: pageUrl
                    });
                }
            }
        });
        d.on(d.query('#changPassword'), 'click', () => {
            sys.window.open({
                url: CONF.url.changePassword
            });
        });
        d.on(d.query('#check'), 'click', function () {
            sys.window.update();
        });
        /**清理缓存 */
        d.on(d.query('#clear'), 'click', function () {
            sys.window.clear();
            Modal.toast('清理成功');
        });
        /**扫一扫 */
        d.on(d.query('#scan'), 'click', function () {
            (ShellAction.get()).device().scan({
                callback: (e) => {
                    alert(e.detail);
                }
            });
        });
        /**退出登录 */
        d.on(d.query('[data-action="logout"]'), 'click', function () {
            BwRule.Ajax.fetch(CONF.ajaxUrl.logout)
                .then(({ }) => {
                    Modal.toast('退出成功');
                    sys.window.logout();
                });
        });
        /**网络测试 */
        d.on(d.query('#testNetwork'), 'click', () => {
            modal.isShow = true;
            new checkNetwork({ modal: modal })
        });
        let modal = new Modal({
            header: '网络监控',
            className:'modal_class',
            body: d.create('<div id="check_net_id"></div>'),
            position: sys.isMb ? 'full' : '',
            isShow: false
        });
        d.query('#check_net_id').style.height="100%";
    }

    private rfidSettingInit(list: HTMLElement) {

        if (Shell.inventory.canRfid == true) {
            let li = <li className="mui-table-view-cell" id="rfidSettingIn">
                <a href="#" className="mui-navigate-right"><i className="iconfont icon-pinlei" style="color:#FFB741;margin-right:10px"></i>rfid设置配置</a>
            </li>;
            d.after(list.children[1], li);
            d.on(li, 'click', function () {
                //let setting = new RfidSettingModal();
                sys.window.open({
                    url: (CONF.siteAppVerUrl + "/commonui/pageroute?page=rfidSetting")
                });
            })
        }
    }


    private setFontSize(list: HTMLElement) {
        let li = <li className="mui-table-view-cell" id="setFontSize">
            <a href="#" className="mui-navigate-right"><i class="iconfont icon-icon-test" style="color:#4ea6f1;"></i> 设置字体大小</a>
        </li>;
        d.append(list, li);
        let selectPanel = <div className="select-panel hide">
            <div className="fs-item small" data-index="0">中(默认)</div>
            <div className="fs-item middle" data-index="1">大</div>
            <div className="fs-item big" data-index="2">特大</div>
        </div>;
        d.append(list, selectPanel);
        d.on(d.query('#setFontSize'), 'click', function () {
            d.query('.select-panel').classList.toggle('hide');
            d.query('#setFontSize').classList.toggle('active');
        });
        this.setFontSizeItemClass();
        let classArr = ['defalut', 'big', 'super-fontsize'];
        d.on(d.query('.select-panel'), 'click', '.fs-item', (e) => {
            let target = e.target as HTMLElement,
                className = classArr[target.dataset['index']];
            d.query('.select-panel').classList.add('hide');
            d.query('#setFontSize').classList.remove('active');
            if (className === localStorage.getItem('bw-fontsize')) {
                return;
            }
            Modal.confirm({
                msg: '需要重新登录，确认更改字体大小？',
                title: '温馨提示',
                callback: (flag) => {
                    if (flag) {
                        if (className === 'default') {
                            className = '';
                        }
                        localStorage.setItem('bw-fontsize', className);
                        sys.window.logout();
                    } else {
                        this.setFontSizeItemClass();
                    }
                }
            });
        });
    }

    private setFontSizeItemClass() {
        d.queryAll('.fs-item').forEach((el) => {
            el.classList.remove('active');
        });
        let classArr = ['defalut', 'big', 'super-fontsize'];
        let localClass = localStorage.getItem('bw-fontsize');
        if (tools.isEmpty(localClass)) {
            localClass = 'defalut';
        }
        d.queryAll('.fs-item')[classArr.indexOf(localClass)].classList.add('active');
    }
}

