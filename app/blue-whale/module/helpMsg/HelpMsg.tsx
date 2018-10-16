/// <amd-module name="HelpMsg"/>
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import d = G.d;

interface IHelpMsgPage {
    className?: string
    title?: string
    helpId: string
}

interface IMedioPara {
    fileId: string,
    fileName: string,
}

interface IHelpDataPara {
    helpId: string,
    content: string[],
    picture: IMedioPara[],
    video: IMedioPara[],
    voice: IMedioPara[],
}

export class HelpMsg extends Button {
    private modal: Modal;

    constructor(para: IHelpMsgPage) {
        super({
            icon: 'iconfont icon-xinxi',
            className: 'help-module',
            onClick: () => {
                if (!this.modal) {
                    this.modal = new Modal({
                        header: {
                            title: para && para.title || '帮助'
                        },
                        body : <div class="help-body"></div>,
                        className: 'help-modal',
                        position: G.tools.isMb ? 'full' : '',
                        footer: {}
                    });
                    this.getBodyHtml(para);
                } else {
                    this.modal.isShow = true;
                }
            }
        });
    }

    private getBodyHtml(para) {
        BwRule.Ajax.fetch(BW.CONF.ajaxUrl.helpMsg, {
            data: {
                helpid: para.helpId
            },
            type: 'get',
        }).then(({response}) => {
            console.log(response)
            this.createHtml(response && response.data);
        })
    }

    private createHtml(data: IHelpDataPara) {
        let body = this.modal.body;

        data.content = ['文字内容','文字内容','文字内容','文字内容']
        Array.isArray(data.content) && data.content.forEach(obj => {
            d.append(body, <div class="help-text">${obj}</div>);
        });

        data.picture=[{fileId:'', fileName: 'http://127.0.0.1:8080/img/dist/../img/fqa/androidDownload.png'}]
        Array.isArray(data.picture) && data.picture.forEach(img => {
            d.append(body, <div class="help-img">
                <img src={img.fileName} alt=""/>
            </div>);
        });

        data.voice = [{fileId: '',fileName:''}]
        Array.isArray(data.voice) && data.voice.forEach(v => {
            d.append(body, <div>
                <audio src={v.fileName} controls="controls">
                    你的有浏览器不支持该音频播放
                </audio>
            </div>)
        });

        data.video = [{fileId: '',fileName:''}]

        Array.isArray(data.video) && data.video.forEach(v => {
            d.append(body, <div class="help-video">
                <video src={v.fileName} controls="controls">
                    你的有浏览器不支持该视频播放
                </video>
            </div>)
        });

console.log(body)
        return body;
    }
}