/// <amd-module name="ChangeProject"/>

import d = G.d;
import tools = G.tools;
import {IModal, Modal} from "../../../global/components/feedback/modal/Modal";
import {DropDown} from "../../../global/components/ui/dropdown/dropdown";
import {BwRule} from "../../common/rule/BwRule";

export interface IChangeProjectPara extends IModal {   // 类构造函数的参数
    current: string;    // 当前项目
}
interface TResponseProjectItem {   // 后台响应的数据
    PLATFORM_SEQ: string;
    PLATFORM_NAME: string;
    CAPTION: string;
}
interface IProjectListItem extends ListItem {   // 列表项的数据类型
    caption?: string;
}
interface TProjectListData extends Array<IProjectListItem>{ // 传递给Dropdown的项目数据

}

export class ChangeProject extends Modal {

    private dropdown: DropDown = null;  // 下拉列表
    private showProject: HTMLInputElement = null;   // 显示当前选择的项目
    private projectList: TProjectListData = null;   // 项目列表

    constructor(para?: IChangeProjectPara) {
        super(Object.assign({
            header: {
                title: '切换项目'
            },
            footer: {

            },
            className: 'modal-change-project',
            width: tools.isMb ? '100%' : '25%',
            height: tools.isMb && '100%',
            isAnimate: true,
            position: 'center',
        }, para));
        this.current = para.current;
        this.initBody();
    }

    private initBody = () => {
        let content = <div className="change-project">
            <div className="current-project-wrapper">
                <span className="description">当前：</span>
                <span type="text" id="current-project" className="current-project">
                    {this.current}
                </span>
            </div>
            <div className="project-list-wrapper">
                <div className="select-project">
                    <span className="description">切换：</span>
                    <div className="show-project-wrapper">
                        <input type="text" className="show-project" readOnly/>
                        <i className="appcommon app-xiala"/>
                    </div>
                </div>
            </div>
        </div>;
        this.showProject = d.query('input.show-project', content) as HTMLInputElement;
        BwRule.Ajax.fetch(BW.CONF.ajaxUrl.projectList, {
            type: 'GET',
        }).then(({response}) => {
            // console.log('in getProjectList: ');
            // console.log(response);

            this.projectList = response.data.map((obj: TResponseProjectItem)  =>
                ({value: parseInt(obj.PLATFORM_SEQ), text: obj.PLATFORM_NAME, caption: obj.CAPTION || ''}));
            this.dropdown = new DropDown({
                el: d.query('.project-list-wrapper', content),
                data: this.projectList,
                inline: true,
                onSelect: (item: IProjectListItem)=> {
                    // item.caption = 'cms3';
                    this.showProject.value = (tools.isNotEmpty(item.caption) ? item.caption + '  ' : '') + item.text;
                    this.dropdown.hideList();
                }
            });
            this.dropdown.hideList();
            d.append(this.bodyWrapper, content);
            this.initStyle();
            this.initEvent.on();
        }).catch(err => {
            console.log(err);
        });
    };

    private initStyle = () => {
        // 设置样式
        d.query('.appcommon.app-xiala', this.wrapper) &&
            (d.query('.appcommon.app-xiala', this.wrapper).style.lineHeight = window.getComputedStyle(this.showProject).height);

        if(tools.isMb){
            this.dropdown.getUlDom().style.width = '100%';
        }else {
            this.dropdown.getUlDom().style.width = window.getComputedStyle(this.showProject).width;
            this.dropdown.getUlDom().style.left = d.query('.show-project-wrapper', this.wrapper).offsetLeft + 'px';
        }
    };

    private initEvent = (() => {
        let toggleClickHandler = () => {
            this.dropdown.toggle();
        };

        return {
            on: () => {
                d.on(d.query('.appcommon.app-xiala', this.bodyWrapper), 'click', toggleClickHandler);
                this.onOk = () => {
                    if(this.dropdown.selectedIndex >= 0){
                        let selectItem = this.projectList[this.dropdown.selectedIndex];
                        BwRule.Ajax.fetch(BW.CONF.ajaxUrl.projectList, {
                            type: 'PUT',
                            data: {
                                PLATFORM_SEQ: selectItem['value'],
                                PLATFORM_NAME: selectItem['text'],
                            }
                        }).then(({response}) => {
                            let prevUserInfo = JSON.parse(localStorage.getItem('userInfo'));
                            localStorage.setItem('userInfo', JSON.stringify({...prevUserInfo, platformName: this.showProject.value}));
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
                d.off(d.query('.appcommon.app-xiala', this.bodyWrapper), 'click', toggleClickHandler);
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
        this.initEvent.off();
        super.destroy();
    }
}