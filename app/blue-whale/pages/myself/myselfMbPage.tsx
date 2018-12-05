import sys = BW.sys;
import tools = G.tools;
import CONF = BW.CONF;
import d = G.d;
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from 'global/components/feedback/modal/Modal';
import {User} from "../../../global/entity/User";
import {ShellAction} from "../../../global/action/ShellAction";
import Ajax = G.Ajax;
import {RfidSettingModal} from "../rfid/RfidSetting/RfidSetting";
import Shell = G.Shell;
import sysPcHistory = BW.sysPcHistory;
import {Loading} from "../../../global/components/ui/loading/loading";

export = class myselfMbPage {
    constructor() {
        // mui.init();
        // '.mui-scroll-wrapper').scroll();
        let items = [];
        let loading = new Loading({});
        loading.show();
        G.Ajax.fetch(CONF.ajaxUrl.personalmenu).then(({response}) => {
            response = JSON.parse(response);
            let menus = response.body && response.body.elements;
            // console.log('in mb');
            // console.log(menus);
            menus && menus.forEach((menu) => {
                (menu.isPc === 0 || menu.isPc === 2) && items.push({
                    content: menu.menuName,
                    icon: menu.menuIcon,
                    onClick: () => {
                        let addr = menu.menuPath as R_ReqAddr;
                        if (addr) {
                            let url = CONF.siteUrl + BwRule.reqAddr(addr);
                            sys.window.open({url, title: menu.menuName})
                        }
                    }
                })
            });
        }).finally(() => {
            loading && loading.hide();
            loading = null;
            this.init(items);
        });
    }

    protected init(items: obj[]){
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
                    <i className={item.icon}/>
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
        if (CONF.appid === 'app_fastlion_retail') {
            let li = <li className="mui-table-view-cell" id="changePassword">
                <a href="#" className="mui-navigate-right"> <i className="iconfont icon-renyuan" style="color:#FFB741;margin-right:10px"></i>密码修改</a>
            </li>;
            d.append(list, li);
        }

        d.on(d.query('.selfMenuPage'), 'click', '.mui-table-view>.mui-table-view-cell[data-page-name]', function (e) {
            let dataset = d.closest(e.target as HTMLElement,'.mui-table-view-cell[data-page-name]').dataset.pageName;
            let pageUrl = BW.CONF.url[dataset];
            if (pageUrl) {
                if (dataset === 'myself') {
                    sys.window.open({
                        url: tools.url.addObj(CONF.url.myself, {
                            userid: user.userid
                        })
                    });
                }else if (dataset === 'bugReport') {
                    sys.window.open({
                        url: CONF.url.bugList
                    });
                }else if (dataset === 'myApplication') {
                    sys.window.open({
                        url: CONF.url.myApplication
                    });
                }else if (dataset === 'myApproval') {
                    sys.window.open({
                        url: CONF.url.myApproval
                    });
                }else {
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
        d.on(d.query('#clear'), 'click', function () {
            sys.window.clear();
            Modal.toast('清理成功');
        });

        d.on(d.query('#scan'), 'click', function () {
            (ShellAction.get()).device().scan({
                callback: (e) => {

                    alert(e.detail);
                }
            });
        });

        d.on(d.query('[data-action="logout"]'), 'click', function () {
            // Rule.ajax(CONF.ajaxUrl.logout, {
            //     success : function () {
            //         Modal.toast('退出成功');
            //         sys.window.logout(CONF.siteAppVerUrl + "/index?uuid="+Device.get().uuid);
            //     }
            // });
            BwRule.Ajax.fetch(CONF.ajaxUrl.logout)
                .then(({}) => {
                    Modal.toast('退出成功');
                    sys.window.logout();
                });
        });

        d.on(d.query('#testNetwork'), 'click', () => {
            modal.isShow = true;
        });
        let modal = this.initModal();
        let urls = Array.from({length: 5}, () => 1000).map(num => tools.url.addObj(CONF.ajaxUrl.speedTest, {size: num}));
        let testStart = true;

        d.on(d.query('body'), 'click', '.mui-rotate-box', function () {
            if (testStart) {
                let progressBar = d.query('.mui-progress-bar', this.parentElement);
                let progressWidth = d.query('.mui-progress', this.parentElement).offsetWidth;
                progressBar.style.width = 0 + 'px';
                testStart = false;
                this.className += ' animate_start';
                let interval = null;
                let timeout = null;
                let width = 0;
                let scroll = 0;
                let addWidth = (): void => {
                    progressBar.style.transition = 0 + 's';
                    progressBar.style.webkitTransition = 0 + 's';
                    interval = setInterval(() => {
                        width++;
                        this.querySelector('.box-content').innerHTML = '测速中...';
                        progressBar.style.width = width + 'px';
                        if (width / progressWidth >= scroll) {
                            clearInterval(interval);
                        }
                    }, 100);
                };
                addWidth();
                self.speedTest(urls, (results: number[]) => {
                    clearInterval(interval);
                    clearInterval(timeout);
                    scroll = (results.length + 1) / urls.length;
                    progressBar.style.transition = .8 + 's';
                    progressBar.style.webkitTransition = .8 + 's';
                    width = progressWidth * (results.length / urls.length);
                    progressBar.style.width = width + 'px';
                    timeout = setTimeout(() => {
                        addWidth();
                    }, 800);
                    if (results.length === urls.length) {
                        clearInterval(interval);
                        clearInterval(timeout);
                        let sum: number = 0;
                        results.forEach((val) => {
                            sum += val;
                        });
                        setTimeout(() => {
                            this.className = this.classList[0];
                            this.querySelector('.box-content').innerHTML =
                                (sum / results.length).toFixed(2) + 'KB/s';
                            testStart = true;
                        }, 1000);
                    }
                });
            }
        });
        sys.window.close = double_back;
    }

    private rfidSettingInit(list:HTMLElement){

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


    private initModal() {
        let wrapper = <div className="test-module-wrapper"></div>;
        let body = <div className="mui-content">
            <div className="mui-rotate-box">
                <div className="box-content">点击测速</div>
                <div className="circle-box1"></div>
                <div className="circle-box2"></div>
            </div>
            <div className="mui-progress">
                <div className="mui-progress-bar"></div>
            </div>
        </div>;

        return new Modal({
            container: d.closest(wrapper, '.page-container'),
            header: '网络测速',
            body: body,
            position: sys.isMb ? 'full' : '',
            width: '730px',
            isShow: false
        });
    }

    private speedTest(urls: string[], callback: Function) {
        test(urls);
        let results: number[] = [];

        function test(urls: string[], num = 0) {
            if (urls.length === num) {
                return;
            }
            let startTime = new Date().getTime();
            Ajax.fetch(urls[num])
                .then(({response}) => {
                    let time = new Date().getTime() - startTime;
                    num++;
                    let size = tools.str.utf8Len(response);
                    results.push((size / 1024) / (time / 1000));
                    callback && callback(results);
                    test(urls, num);
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

