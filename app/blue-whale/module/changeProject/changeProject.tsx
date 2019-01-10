/// <amd-module name="ChangeProject"/>

import d = G.d;
import tools = G.tools;
import {IModal, Modal} from "../../../global/components/feedback/modal/Modal";
import {DropDown, ListData} from "../../../global/components/ui/dropdown/dropdown";
import {BwRule} from "../../common/rule/BwRule";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {TextInput} from "../../../global/components/form/text/text";

export interface IChangeProjectPara extends IModal {   // 类构造函数的参数
    current: string;    // 当前项目
}

interface IResponseProjectItem {   // 后台响应的数据
    PLATFORM_SEQ: string;
    PLATFORM_NAME: string;
    CAPTION: string;
}

export class ChangeProject extends Modal {

    protected select: SelectInput | SelectInputMb;
    private showProject: HTMLInputElement = null;   // 显示当前选择的项目
    private projectList:  Array<ListItem> = null;   // 项目列表

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
        let SelectClass: typeof SelectInputMb | typeof SelectInput
            = tools.isMb ? SelectInputMb : SelectInput,
            textInput: TextInput;
        let content = <div className="change-project">
            <div className="current-project-wrapper">
                <span className="description">当前：</span>
                {textInput = <TextInput readonly={true}/>}
            </div>
            <div className="project-list-wrapper">
                <div className="select-project">
                    <span className="description">切换：</span>
                    {this.select = <SelectClass readonly={true} clickType={0} ajax={{
                        url: BW.CONF.ajaxUrl.projectList,
                        fun: (url, value, callback) => {
                            BwRule.Ajax.fetch(BW.CONF.ajaxUrl.projectList, {
                                type: 'GET',
                            }).then(({response}) => {
                                // console.log('in getProjectList: ');
                                // console.log(response);
                                this.projectList = response.data.map((obj: IResponseProjectItem) =>
                                    ({
                                        value: obj.PLATFORM_SEQ,
                                        text: obj.PLATFORM_NAME
                                    }));
                                callback(this.projectList);
                                this.initEvent.on();
                            }).catch(err => {
                                console.log(err);
                            });
                        }
                    }}/>}
                </div>
            </div>
        </div>;
        textInput.value = this.current
        this.showProject = d.query('input.show-project', content) as HTMLInputElement;
        d.append(this.bodyWrapper, content);
    };

    private initEvent = (() => {

        return {
            on: () => {
                this.onOk = () => {
                    let value = this.select.get(),
                        ajaxData: obj = {};
                    for(let item of this.projectList){
                        if(item.value === value){
                            ajaxData = {
                                platform_seq: item.value,
                                platform_name: item.text,
                            };
                            break;
                        }
                    }
                    console.log(ajaxData);
                    BwRule.Ajax.fetch(BW.CONF.ajaxUrl.projectList, {
                        type: 'PUT',
                        data: ajaxData
                    }).then(({response}) => {
                        let prevUserInfo = JSON.parse(localStorage.getItem('userInfo'));
                        localStorage.setItem('userInfo', JSON.stringify({
                            ...prevUserInfo,
                            platformName: this.showProject.value
                        }));
                        Modal.toast(response.msg);
                        location.reload();
                    }).catch(err => {
                        console.log(err);
                    });

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
        // this.dropdown.destroy();
        this.initEvent.off();
        super.destroy();
    }
}