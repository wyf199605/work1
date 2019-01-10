/// <amd-module name="ChangeProject"/>

import d = G.d;
import tools = G.tools;
import {IModal, Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {TextInput} from "../../../global/components/form/text/text";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";

export interface IChangeProjectPara extends IModal {   // 类构造函数的参数
    current: string;    // 当前项目
}

interface IResponseProjectItem {   // 后台响应的数据
    PLATFORM_SEQ: string;
    PLATFORM_NAME: string;
    CAPTION: string;
}

export class ChangeProject extends Modal {

    private dropdown: SelectInput;  // 下拉列表
    private showProject: TextInput;   // 显示当前选择的项目
    private selectItem: ListItem = {}; // 选中的项目
    constructor(para?: IChangeProjectPara) {
        super(Object.assign({
            header: {
                title: '切换项目'
            },
            footer: {},
            className: 'modal-change-project',
            width: tools.isMb ? '100%' : '25%',
            height: tools.isMb && '100%',
            isAnimate: true,
            top: 100,
        }, para));
        this.current = para.current;
        this.initBody();
    }

    private initBody = () => {
        let ajaxFun = (url: string, value: string, cb: Function) => {
            BwRule.Ajax.fetch(url, {
                type: 'GET',
            }).then(({response}) => {
                let options = response.data.map((obj: IResponseProjectItem) => {
                    return {
                        value: tools.isNotEmpty(obj.PLATFORM_SEQ) ? obj.PLATFORM_SEQ : '',
                        text: tools.isNotEmpty(obj.PLATFORM_NAME) ? obj.PLATFORM_NAME : ''
                    };
                });
                cb(options);
            }).finally(() => {
                cb();
            });
        };
        let ajax = {
            fun: ajaxFun,
            url: BW.CONF.ajaxUrl.projectList
        };
        let SelectInputComponent:typeof SelectInput | typeof SelectInputMb = tools.isMb ? SelectInputMb : SelectInput;
        let content = <div className="change-project">
            <div className="change-project-list-item">
                <span className="description">当前：</span>
                {this.showProject = <TextInput readonly={true} value={this.current}/>}
            </div>
            <div className="change-project-list-item">
                <span className="description">切换：</span>
                {this.dropdown = <SelectInputComponent readonly={true} clickType={0} ajax={ajax} onSet={(item) => {
                    this.selectItem = item;
                    this.showProject.set(item.text)
                }}/>}
            </div>
        </div>;
        d.append(this.bodyWrapper, content);
        this.initEvent.on();
    };

    private initEvent = (() => {
        return {
            on: () => {
                this.onOk = () => {
                    let selectItem = this.selectItem;
                    if (tools.isNotEmpty(selectItem) && selectItem.text != this.current) {
                        BwRule.Ajax.fetch(BW.CONF.ajaxUrl.projectList, {
                            type: 'PUT',
                            data: {
                                platform_seq: selectItem['value'],
                                platform_name: selectItem['text'],
                            }
                        }).then(({response}) => {
                            let prevUserInfo = JSON.parse(localStorage.getItem('userInfo'));
                            localStorage.setItem('userInfo', JSON.stringify({
                                ...prevUserInfo,
                                platformName: selectItem.text
                            }));
                            Modal.toast(response.msg);
                            location.reload();
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                    this.destroy();
                };
                this.onCancel = () => this.destroy();
                this.onClose = () => this.destroy();
            },
            off: () => {
                this.onOk = null;
                this.onCancel = null;
                this.onClose = null;
            }
        }
    })();

    private _current: string = null;
    get current() {
        return this._current;
    }

    set current(current: string) {
        this._current = current;
    }

    destroy() {
        this.dropdown.destroy();
        this.showProject.destroy();
        this.selectItem = null;
        this.initEvent.off();
        super.destroy();
    }
}