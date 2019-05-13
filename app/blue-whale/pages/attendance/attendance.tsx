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
    protected msgTimer = null;
    protected initPage() {
        let self = this, para = self.para, text = '指纹机正在初始化，请稍后';
        let detail = <div class="attend-detail"/>;
        //创建左侧框
        let content = <div class="attend-content">
            <h4 class="datetime"/>
        </div>;
        //指纹考勤块
        self.fingerNode = <div class="finger-content">
            <p class="finger-title">考勤信息</p>
            <p class="finger-msg">{text}</p>
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

        let i = 0,
            dots = '';
        let fingerMsg = this.fingerNode.querySelector('.finger-msg') as HTMLElement;
        self.msgTimer = setInterval(() => {
            // if(i >= 10){
            //     Modal.alert('初始化指纹机失败，请重新刷新!');
            //     fingerMsg.innerHTML = '初始化指纹机失败！';
            //     clearInterval(self.msgTimer);
            //     return ;
            // }
            dots += '.';
            fingerMsg.innerHTML = text + dots;
            if(i ++ % 3 === 0) {
                dots = '';
            }

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
    protected fingerObj: NewFinger;
    protected attendFinger() {
        let self = this;
        let fingerMsg = this.fingerNode.querySelector('.finger-msg') as HTMLElement;
        let fingerTitle = this.fingerNode.querySelector('.finger-title');
        this.fingerObj = new NewFinger({
            callFinger: (text) => {
                if(self.msgTimer !== null){
                    clearInterval(self.msgTimer);
                    self.msgTimer = null;
                }
                fingerMsg.innerHTML = '<span>' + text + '</span>';
            },
            fingerFinish: (e) => {
                fingerMsg.innerHTML = '<span>指纹获取成功，正在匹配中...</span>';
                return ajaxValid({
                    userid: e.userid,
                    fingerprint: e.print,
                    fingertype: e.type,
                    verify: e.verify // verfiy 为1时，后台需返回正确的指纹信息
                });
            }
        });

        //根据获取的指纹信息通过Ajax验证
        function ajaxValid(data) {
            return new Promise((resolve, reject) => {
                BwRule.Ajax.fetch(CONF.ajaxUrl.atdFingerAtd, {
                    type: 'POST',
                    data: [data]
                }).then(({response}) => {
                    let result = response.body.bodyList[0];
                    self.addList(result);
                    fingerTitle.innerHTML = '<span class="green">' + result.userName + result.result + '</span>';
                    // fingerObj.addFinger(result.fingerData);
                    resolve(result.fingerData)
                }).catch((e) => {
                    console.log(e);
                    Modal.toast('考勤失败请重试');
                    fingerTitle.innerHTML = '<span class="red">考勤失败，请重新录入</span>';
                    reject();
                })
            })

        }
    }

    //右侧展示考勤成功信息
    protected addList(result) {
        let list = this.dom.querySelector('.list-msg');
        let li = d.create(`<li>
                        <span class="arrow">${result.datetime}</span>
                        <span>${result.userName + result.result}</span></li>`);
        list.insertBefore(li, list.firstChild);
        let timer = setTimeout(() => {
            li.className = 'animated';
            clearTimeout(timer);
        }, 300);
    }

    //销毁
    protected destroy() {
        clearInterval(this.timer);
        this.fingerObj && this.fingerObj.destroy();
        this.fingerObj = null;
        // this.shell.erp().cancelFinger();
    }

}
