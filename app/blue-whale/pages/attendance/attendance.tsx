import BasicPage from "../basicPage";
import d = G.d;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import CONF = BW.CONF;
import {BwRule} from "../../common/rule/BwRule";
import {NewFinger} from "../../module/fingerPrint/NewFinger";

export = class AttendancePage extends BasicPage {
    // protected shell: any = null;
    protected timer: number = null;
    protected fingerNode: HTMLElement = null;

    constructor(private para) {
        super(para);
        // this.shell = ShellAction.get();
        let parent = para.dom.parentNode;
        let height: number = parent.offsetHeight - parent.firstChild.offsetHeight;
        para.dom.style.height = height + 'px';
        this.initPage();
    }

    /*
    * 初始化页面
    * */
    protected initPage() {
        let self = this, para = self.para;
        let detail = <div class="attend-detail"/>;
        //创建左侧框
        let content = <div class="attend-content">
            <h4 class="datetime"/>
        </div>;
        //指纹考勤块
        self.fingerNode = <div class="finger-content">
            <p class="finger-title">考勤信息</p>
            <p class="finger-msg">指纹机准备就绪，请按下手指...</p>
        </div>;

        //创建右侧考勤展示框
        let listMsg = <div class="attend-msg">
            <ul class="list-msg"/>
        </div>;
        content.appendChild(self.fingerNode);
        detail.appendChild(content);
        para.dom.appendChild(detail);
        para.dom.appendChild(listMsg);

        //显示时间'
        let dateEl = detail.querySelector('.datetime');
        dateEl.innerHTML = getDate();
        self.timer = setInterval(() => {
            dateEl.innerHTML = getDate()
        }, 1000);

        /*
        * 获取时间
        * */
        function getDate() {
            let date = new Date();
            let two = (num) => num < 10 ? '0' + num : '' + num;
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
                two(date.getHours()) + ':' + two(date.getMinutes()) + ':' + two(date.getSeconds());
        }
        //调用指纹考勤
        self.attendFinger();
    }

    /*
    * 指纹考勤
    * */
    protected attendFinger() {
        let self = this;
        let fingerMsg = this.fingerNode.querySelector('.finger-msg') as HTMLElement;
        let fingerTitle = this.fingerNode.querySelector('.finger-title');
        let myDB = {
            storeName: 'fingers',
            version: 3
        };
        let fingerObj = new NewFinger({
            callFinger: (text) => {
                fingerMsg.innerHTML = '<span>' + text + '</span>';
            },
            fingerFinish: (e) => {
                fingerMsg.innerHTML = '<span>指纹获取成功，正在匹配中...</span>';
                return ajaxValid({
                    userid: e.userid,
                    fingerprint: e.print,
                    fingertype: e.type,
                    verify: e.verify
                });
            }
        });

        //根据获取的指纹信息通过Ajax验证
        function ajaxValid(data) {
            // Rule.ajax(CONF.ajaxUrl.atdFingerAtd, {
            //     type: 'POST',
            //     data: '[' + JSON.stringify(data) + ']',
            //     success: (response) => {
            //         let result = response.body.bodyList[0];
            //         self.addList(result);
            //         fingerTitle.innerHTML = '<span class="green">' + result.userName + result.result + '</span>';
            //         fingerObj.addFinger(result.fingerData);
            //         fingerObj.againOpen();
            //     },
            //     error: () => {
            //         Modal.toast('考勤失败请重试');
            //         fingerTitle.innerHTML = '<span class="red">考勤失败，请重新录入</span>';
            //         fingerObj.againOpen()
            //     },
            //     netError: () => {
            //         Modal.toast('网络错误');
            //         fingerObj.againOpen()
            //     }
            // });
            return new Promise((resolve, reject) => {
                BwRule.Ajax.fetch(CONF.ajaxUrl.atdFingerAtd, {
                    type: 'POST',
                    data: [data]
                }).then(({response}) => {
                    let result = response.body.bodyList[0];
                    self.addList(result);
                    fingerTitle.innerHTML = '<span class="green">' + result.userName + result.result + '</span>';
                    // fingerObj.addFinger(result.fingerData);
                    resolve()
                }).catch(() => {
                    Modal.toast('考勤失败请重试');
                    fingerTitle.innerHTML = '<span class="red">考勤失败，请重新录入</span>';
                    reject();
                }).finally(() => {
                    // fingerObj.againOpen();
                });
            })

        }
    }

    //右侧展示考勤成功信息
    protected addList(result) {
        let list = this.dom.querySelector('.list-msg');
        let li = d.create(`<li class="animated">
                        <span class="arrow">${result.datetime}</span>
                        <span>${result.userName + result.result}</span></li>`);
        list.insertBefore(li, list.firstChild);
        let timer = setTimeout(() => {
            li.className = '';
            clearTimeout(timer);
        }, 1000);
    }

    //销毁
    protected destroy() {
        clearInterval(this.timer);
        // this.shell.erp().cancelFinger();
    }

}
