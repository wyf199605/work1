/// <amd-module name="MainPageHeader"/>
import d = G.d;
import {MainPageSideBar} from "./MainPageSideBar";
import {MainPage} from "./MainPage";
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {LeRule} from "../../common/rule/LeRule";
import CONF = LE.CONF;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import SPA = G.SPA;

export class MainPageHeader extends Component {
    protected wrapperInit(para: IComponentPara): HTMLElement {
        let time = this.getCurrentTime(false);
        this.timer = setTimeout(() => {
            this.currentTime = this.getCurrentTime(true);
        }, 1000);
        let loginData = JSON.parse(localStorage.getItem('loginData')),
            userName = loginData.filter((user)=>{return user.NAME === 'user_name'})[0],
            deptName = loginData.filter((user)=>{return user.NAME === 'dept_name'})[0];
        return <div class="lesson-header">
            <div className="header-left-logo">
                <a className="school" href="#/lesson2/home">{deptName.VALUE}</a>
                <i className="sec seclesson-shouqicaidan"></i>
            </div>
            <div className="header-right-info">
                <span class="welcome">欢迎您，{userName.VALUE}！&nbsp;&nbsp;&nbsp;&nbsp;<span
                    className="header-time">{time}</span></span>
                <div className="shortcut-key">
                    <a className="header-link" data-link="home" href="#/lesson2/home">
                        <i className="sec seclesson-shouye"></i> 首页
                    </a>
                    <a className="header-link head-huanfu" data-link="changeSkin">
                        <i className="sec seclesson-huanfu"></i> 换肤
                    </a>
                    <a className="header-link" data-link="help">
                        <i className="sec seclesson-bangzhu"></i> 帮助
                    </a>
                    <a className="header-link" data-link="logout">
                        <i className="sec seclesson-tuichu"></i> 退出
                    </a>
                </div>
            </div>
        </div>;
    }

    constructor(para: IComponentPara) {
        super(para);
        this.mainPageHeaderEvents.on();
        this.changeColor();
        this.colorInit();
    }
    private colorInit(){
        let color = (localStorage.getItem('huanfu'));
        document.body.classList.add(color);
    }

    // 计时器
    private timer: number;
    private _currentTime: string;
    set currentTime(time: string) {
        this._currentTime = time;
        d.query('.header-time', this.wrapper).innerText = this._currentTime;
    }

    get currentTime() {
        return this._currentTime;
    }

    private getCurrentTime(isTimer: boolean): string {
        let nowDate = new Date(),
            weeksArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            year = nowDate.getFullYear(),
            month = this.checkAndAddZeroForTime(nowDate.getMonth() + 1),
            date = this.checkAndAddZeroForTime(nowDate.getDate()),
            hour = this.checkAndAddZeroForTime(nowDate.getHours()),
            minutes = this.checkAndAddZeroForTime(nowDate.getMinutes()),
            seconds = this.checkAndAddZeroForTime(nowDate.getSeconds()),
            week = weeksArr[nowDate.getDay()];
        isTimer && (this.timer = setTimeout(() => {
            this.currentTime = this.getCurrentTime(true);
        }, 1000));
        return year + '.' + month + '.' + date + ' ' + week + ' ' + hour + ' : ' + minutes + ' : ' + seconds;
    }

    // 在时间前加0
    private checkAndAddZeroForTime(time): string {
        return time >= 10 ? time : '0' + time;
    }

    // 隐藏或显示sidebar
    private _isHideSideBar: boolean;
    set isHideSideBar(isHide: boolean) {
        this._isHideSideBar = isHide;
        let angle = isHide ? 180 : 0,
            translate = isHide ? -100 : 0,
            width = isHide ? '100%' : 'calc(100% - 212px)',
            left = isHide ? '0px' : '212px',
            bodyContent = d.query('#body'),
            menu = d.query('.lesson-menu'),
            toggleIcon = d.query('.seclesson-shouqicaidan', this.wrapper);
        toggleIcon.style.transform = `rotate(${angle}deg)`;
        menu.style.transform = `translateX(${translate}%) translateZ(0)`;
        bodyContent.style.width = width;
        bodyContent.style.left = left;
    }

    get isHideSideBar() {
        return this._isHideSideBar;
    }


    private mainPageHeaderEvents = (() => {
        // 点击隐藏或显示sidebar
        let hideOrShowEvent = () => {
            this.isHideSideBar = !this.isHideSideBar;
        };
        let clickSchoolEvent = () => {
            this.isHideSideBar = false;
        };
        let shortcutKeyEvent = (e) => {
            let a = d.closest(e.target, '.header-link'),
                linkName = a.dataset.link;
            switch (linkName) {
                case 'home':
                    // 首页
                    this.isHideSideBar = false;
                    break;
                case 'changeSkin':
                    // 换肤
                    break;
                case 'help':
                    // 帮助
                    break;
                case 'logout':
                    // 登出
                    LeRule.Ajax.fetch(CONF.ajaxUrl.logout).then(({response}) => {
                        Modal.toast(response.msg);
                        SPA.open(SPA.hashCreate('loginReg','login'));
                    });
                    break;
            }

        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.seclesson-shouqicaidan', hideOrShowEvent);
                d.on(this.wrapper, 'click', '.school', clickSchoolEvent);
                d.on(this.wrapper, 'click', '.shortcut-key .header-link', shortcutKeyEvent);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.seclesson-shouqicaidan', hideOrShowEvent);
                d.off(this.wrapper, 'click', '.school', clickSchoolEvent);
                d.off(this.wrapper, 'click', '.shortcut-key .header-link', shortcutKeyEvent);
            }
        }
    })();

    private changeColor(){
        let colorArr = ['skin-1','skin-2','skin-3','skin-4','skin-5'],
            i = 0;
          d.on(this.wrapper,'click','.head-huanfu',()=>{
          let body = document.body,
              classList = body.className;
              localStorage.setItem('huanfu',colorArr[i]);
             body.classList.add(colorArr[i])
             for(let j = 0; j < colorArr.length; j++){
                          if(j == i){
                                continue;
                          }
                            body.classList.remove(colorArr[j])
                           }
              ++i;
              if( i>= colorArr.length){
                 i = 0;
              }
          })
    }


    destroy() {
        super.destroy();
        clearTimeout(this.timer);
        this.timer = null;
        this.mainPageHeaderEvents.off();
    }
}