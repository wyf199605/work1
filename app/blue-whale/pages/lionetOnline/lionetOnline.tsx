/// <amd-module name="LionetOnline"/>

import d = G.d;
import sys = BW.sys;
import Shell = G.Shell;
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;

const speak = Shell.base.speak;

interface IRes {
    devMsg?: string;
    type: 0 | 1 | 2 | 3;
    dataSet?: Array<any>;
    userMsg: string
}

export class LionetOnline {
    static myself_class_name = 'myself-msg';

    protected wrapper: HTMLElement;
    protected content: HTMLElement;

    constructor() {
        d.append(document.body, this.wrapper = this.render());
        this.content = d.query('.lionet-content', this.wrapper);

        // 默认返回
        this.setLionetMsg({
            type: 3,
            userMsg:'HI,我是小狮，很高兴为您服务，请问有什么需要帮助吗？'
        });
    }

    // 设置我的语音输出
    setMyselfMsg(text: string){
        this.renderMsg(text, LionetOnline.myself_class_name);
        this.reqLionetOnlone(text);
    }

    // 设置小狮的语音输出
    setLionetMsg({type, userMsg, dataSet, devMsg}: IRes){
        speak(2, userMsg, () => {});
        switch (type) {
            case 0:
                // 展示dataset中的数据
                break;
            case 1:
                // 让用户选择dataset的数据
                this.renderMsg(<div className="lionet-select">
                    <p>{userMsg}</p>
                    <ul>
                        {dataSet.map((text, index) => {
                            return <li>
                                <a href="#" onclick={() => {
                                    this.reqLionetOnlone(text, 1);
                                }}>{text}</a>
                            </li>
                        })}
                    </ul>
                </div>);
                break;
            case 2:
                // 跳转到dataset中的url
                break;
            case 3:
            default:
                // 输出userMsg
                this.renderMsg(userMsg);
        }
    }

    // 根据语音或选择结果向后台请求
    reqLionetOnlone(text: string, reqtype: 0 | 1 = 0){
        BwRule.Ajax.fetch(CONF.ajaxUrl.fastlionOnline, {
            type: "POST",
            data: {
                token: localStorage.getItem("token"), // token值
                sentence: text, // 用户输入的内容(语音转文字,用户选择)
                reqtype, // 0 表示语音输入 1表示用户选择(不传默认为语音输入)
                stype: 0 // 用户使用语音输入的场景 0: 全局小狮子在线输入 1:菜单搜索语音输入 2:已经打开页面中唤醒
            }
        }).then(({response}: {response: IRes}) => {
            this.setLionetMsg(response);
        });
    }

    // 点击输入语音事件
    speakHandler = (e: TouchEvent) => {
        let handler,
            target = d.query('.spinner-siri', this.wrapper);
        target && target.classList.add('animation');
        speak(0, '', () => {});

        d.on(document, 'touchend', handler = () => {
            d.off(document, 'touchend', handler);
            target && target.classList.remove('animation');
            speak(1, '', (e) => {
                e.data && this.setMyselfMsg(e.data);
            });
            this.setMyselfMsg(window['usermsg']);
        });
    };

    // dom渲染
    render(){
        return <div className="lionet-page">
            <header className="lionet-header">
                <h1 className="lionet-title">
                    <a onclick={() => sys.window.close('')}
                       className="lionet-back mui-icon mui-icon-left-nav mui-pull-left sys-action-back"/>
                    <img src={G.requireBaseUrl + "../img/lionet.png"} alt=""/>
                </h1>
            </header>
            <section className="lionet-container">
                <div className="lionet-content"/>
                <div className="lionet-siri" ontouchstart={this.speakHandler}>
                    <div className="spinner-siri">
                        {
                            Array.from({length: 10}).map((a, index) => {
                                return <div className={"rect" + index} style={
                                    {
                                        "animation-delay": -(Math.random() * 0.8) + 's'
                                    }
                                }/>
                            })
                        }
                    </div>
                </div>
            </section>
        </div>
    }

    // 渲染输出结果
    renderMsg(msg: string | HTMLElement, className: string = ''): HTMLElement{
        let el = <div className={"lionet-msg " + className}>{msg}</div>;
        d.append(this.content, el);
        if ('scrollIntoViewIfNeeded' in el) {
            el.scrollIntoViewIfNeeded(false)
        } else {
            el.scrollIntoView(false);
        }
        return el;
    }

}
