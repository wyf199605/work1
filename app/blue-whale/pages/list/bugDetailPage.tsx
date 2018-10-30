/// <amd-module name="bugDetailPage"/>

import d = G.d;
import tools = G.tools;
import CONF = BW.CONF;
import {BwRule} from "../../common/rule/BwRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";

export = class BugDetailPage {

    private bugDetailWrapper: HTMLElement;
    private bugId: string;
    private currentStatus: number;
    private isSelf:boolean;
    constructor() {
        this.bugId = tools.url.getPara('bugid');
        this.isSelf = tools.url.getPara('isself') === 'true' ? true : false;
        this.bugDetailWrapper = <div className="bug-detail-container"></div>;
        d.query('.mui-content').appendChild(this.bugDetailWrapper);
        tools.isNotEmpty(this.bugId) && BwRule.Ajax.fetch(CONF.ajaxUrl.bugDetail + '?bugid=' + this.bugId)
            .then(({response}) => {
                response.errorCode === 0 && this.initDom(response.data);
            });
        this.isSelf && this.tapEvent.on();
        !this.isSelf && this.statusTap.on();
    }
    private statusTap = (()=>{
        let statusTap = (e) => {
            let target = d.closest(e.target,'.status');
            target && Modal.alert('请到我的标签页中点击进入详情页修改！');
        };
        return {
            on: () => d.on(this.bugDetailWrapper, 'click', statusTap),
            off: () => d.off(this.bugDetailWrapper, 'click', statusTap)
        }
    })();
    private tapEvent = (() => {
        let closeTap = (e) => {
            let allStatus = d.queryAll('.status', this.bugDetailWrapper),
                currentStatus = allStatus[this.currentStatus],
                closeStatus = allStatus[2],
                reopenStatus = allStatus[3];
            let url = tools.url.addObj(CONF.ajaxUrl.bugstatus, {
                bugid: this.bugId,
                bugstatus: 2
            });
            BwRule.Ajax.fetch(url).then(({response}) => {
                Modal.toast('状态修改成功');
                currentStatus.classList.remove('active');
                closeStatus.classList.add('active');
                closeStatus.classList.add('disabled');
                reopenStatus.classList.remove('disabled');
                reopenStatus.classList.remove('active');
            })
        };
        let redoTap = (e) => {
            let allStatus = d.queryAll('.status', this.bugDetailWrapper),
                redoStatus = allStatus[3],
                closeStatus = allStatus[2];
            let url = tools.url.addObj(CONF.ajaxUrl.bugstatus, {
                bugid: this.bugId,
                bugstatus: 3
            });
            BwRule.Ajax.fetch(url).then(({response}) => {
                Modal.toast('状态修改成功');
                closeStatus.classList.remove('active');
                closeStatus.classList.remove('disabled');
                redoStatus.classList.add('active');
                redoStatus.classList.add('disabled');
            })
        };
        return {
            on: () => {
                d.on(this.bugDetailWrapper, 'click', '.close', closeTap);
                d.on(this.bugDetailWrapper, 'click', '.redo', redoTap);
            },
            off: () => {
                d.off(this.bugDetailWrapper, 'click', '.close', closeTap);
                d.off(this.bugDetailWrapper, 'click', '.redo', redoTap);
            }
        }
    })();

    private initDom(bugDetail: obj) {
        let message = bugDetail.info.message;
        message = tools.isNotEmpty(message) ? message : '用户未描述';
        // info
        let infoWrapper =  <div>
            <h1 className="title">{bugDetail.info.title}</h1>
            <p className="time">申告时间: {this.handlerTime(bugDetail.info.createTime)}</p>
            <p className="message">{message}</p>
        </div>;
        this.bugDetailWrapper.appendChild(infoWrapper);

        // picture
        let picture = bugDetail.picture;
        if (tools.isNotEmpty(picture)) {
            picture.forEach((pic) => {
                this.bugDetailWrapper.appendChild(<img src={this.getFileUrl(pic.fileId)} />);
            });
        }

        // video
        let video = bugDetail.video;
        if (tools.isNotEmpty(video)) {
            this.bugDetailWrapper.appendChild(<div className="video">
                <video src={this.getFileUrl(video[0].fileId)}></video>
                <i className="video-btn appcommon app-shipin"></i>
            </div>)
        }

        // voice
        let voice = bugDetail.voice;
        if (tools.isNotEmpty(voice)) {

        }
        let stautsTitleArr = ['未处理', '处理中', '已解决', '重新申报'], // 0,1,2,3
            statusWrapper = <div className="status-wrapper"></div>,
            statusClassArr = ['status disabled', 'status disabled', 'status close', 'status disabled redo'];
        if (this.isSelf){
            if (parseInt(bugDetail.info.bugStatus) === 0) {
                // 未处理
                statusClassArr = ['status disabled', 'status disabled', 'status close', 'status disabled redo'];
            } else if (parseInt(bugDetail.info.bugStatus) === 1) {
                // 处理中
                statusClassArr = ['status disabled', 'status disabled', 'status close', 'status disbled redo'];
            } else if (parseInt(bugDetail.info.bugStatus) === 2) {
                statusClassArr = ['status disabled', 'status disabled', 'status disabled close', 'status redo'];
            } else if (parseInt(bugDetail.info.bugStatus) === 3) {
                statusClassArr = ['status disabled', 'status disabled', 'status close', 'status disabled redo'];
            }
        }else{
            statusClassArr = ['status disabled', 'status disabled', 'status disabled close', 'status disabled redo'];
        }
        let currentStatus = parseInt(bugDetail.info.bugStatus);
        this.currentStatus = currentStatus;
        stautsTitleArr.forEach((title, index) => {
            let status: HTMLElement = null;
            if (index === currentStatus) {
                status = <div className={'active ' + statusClassArr[index]}>{title}</div>;
            } else {
                status = <div className={statusClassArr[index]}>{title}</div>;
            }
            statusWrapper.appendChild(status);
        });
        this.bugDetailWrapper.appendChild(statusWrapper);
    }

    private getFileUrl(fileId) {
        return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
            md5_field: 'FILE_ID',
            file_id: fileId,
            down: 'allow'
        })
    }

    private handlerTime(time: number): string {
        let date = new Date(time * 1000),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            monthStr = month < 10 ? '0' + month : month,
            dayStr = day < 10 ? '0' + day : day,
            hourStr = hour< 10 ? '0' + hour : hour,
            minutesStr = minutes < 10 ? '0' + minutes : minutes,
            secondsStr = seconds < 10 ? '0' + seconds : seconds;

        return year + '-' + monthStr + '-' + dayStr + ' ' + hourStr + ':' + minutesStr + ':' + secondsStr;
    }

    destory() {
        this.isSelf && this.tapEvent.off();
        !this.isSelf && this.statusTap.off();
        d.remove(this.bugDetailWrapper);
    }
}