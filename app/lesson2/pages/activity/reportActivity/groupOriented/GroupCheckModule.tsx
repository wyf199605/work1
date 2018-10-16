/// <amd-module name="GroupCheckModule"/>

import {CheckBox} from "../../../../../global/components/form/checkbox/checkBox";
import d = G.d;
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";

interface IGroupCheckPara extends IComponentPara {
    title?: string;
    clickHandle?: (id: string, isCheck: boolean) => void;
}

export class GroupCheckModule extends Component {
    private title: string;
    private clickHandle: (id: string, isCheck: boolean) => void;

    protected wrapperInit(para: IGroupCheckPara): HTMLElement {
        this.title = para.title.substr(2, 2);
        let groupCheckWrapper = <div className="checkWrapper">
            <div className="check-title">{para.title}</div>
            <div className="all-checkbox">
                <CheckBox c-var="first" text="不限" value="0"></CheckBox>
            </div>
        </div>;
        return groupCheckWrapper;
    }

    constructor(para: IGroupCheckPara) {
        super(para);
        this.checkArr = [this.innerCom.first as CheckBox];
        this.clickHandle = para.clickHandle;
    }

    private _checkArr: CheckBox[];
    set checkArr(c: CheckBox[]) {
        this._checkArr = c;
    }

    get checkArr() {
        return this._checkArr;
    }

    classGetCheckedValue(): string[] {
        let checkedArr = [],
            cArr = this.checkArr.slice(1);
        tools.isNotEmptyArray(cArr) && cArr.forEach(check => {
            check.checked && checkedArr.push(check.value);
        });
        return checkedArr;
    }

    // 获取当前选中的check
    getCheckedValue(): string[] {
        let checkedArr = [],
            cArr = this.checkArr.slice(1),
            firstCheck = this.checkArr[0];
        if (firstCheck.checked === true) {
            tools.isNotEmptyArray(cArr) && cArr.forEach(check => {
                checkedArr.push(check.value);
            });
        } else {
            tools.isNotEmptyArray(cArr) && cArr.forEach(check => {
                check.checked && checkedArr.push(check.value);
            });
        }
        return checkedArr;
    }

    private checkedAll() {
        let checkArr = this.checkArr.slice(1);
        let a = 0;
        checkArr.forEach(check => {
            if (check.checked === false){
                a+=1;
            }
        })
        return a === 0 ? true : false;
    }

    // 设置选中的check
    setCheckedValue(values: string[]) {
        tools.isNotEmptyArray(this.checkArr) && this.checkArr.forEach(check => {
            check.checked = false;
        });
        if (tools.isNotEmptyArray(values)) {
            tools.isNotEmptyArray(this.checkArr) && this.checkArr.forEach(check => {
                for (let i = 0; i < values.length; i++) {
                    let value = values[i];
                    if (check.value === value) {
                        check.checked = true;
                        break;
                    }
                }
            })
        }
    }

    // 设置选中不限
    setSelectAll() {
        this.checkArr[0].checked = true;
        let checkArr = this.checkArr.slice(1);
        tools.isNotEmptyArray(checkArr) && checkArr.forEach(check => {
            check.checked = false;
            check.disabled = true;
        })
    }

    getIsSelectFirst() {
        let firstCheck = this.checkArr[0];
        return firstCheck.checked;
    }

    // 设置所有的checkbox
    set(hdata: obj[]) {
        let wrapper = d.query('.all-checkbox', this.wrapper);
        wrapper.innerHTML = '';
        let arr = [],
            firstObj = {
                ID: '0',
                NAME: '不限'
            };
        hdata.unshift(firstObj);
        hdata.forEach((checkValue, index) => {
            let checkbox: CheckBox = new CheckBox({
                container: wrapper,
                text: checkValue.NAME,
                value: checkValue.ID,
                onClick: (isChecked) => {
                    if (index === 0) {
                        if (isChecked) {
                            if (checkbox.value === '0') {
                                this.checkArr.slice(1).forEach(cb => {
                                    cb.checked = false;
                                    cb.disabled = true;
                                })
                            }
                        } else {
                            if (checkbox.value === '0') {
                                this.checkArr.slice(1).forEach(cb => {
                                    cb.disabled = false;
                                })
                            }
                        }
                    }else{
                        if (isChecked){
                            this.checkedAll() && this.setSelectAll();
                        }
                    }
                    tools.isNotEmpty(this.clickHandle) && this.clickHandle(checkValue.ID, isChecked);
                }
            });
            arr.push(checkbox);
        });
        this.checkArr = arr;
    }

    set disabled(disabled: boolean) {
        if (tools.isEmpty(disabled)) {
            return;
        }
        this._disabled = disabled;
        tools.isNotEmptyArray(this.checkArr) && this.checkArr.forEach((check) => {
            check.disabled = disabled;
        })
    }

    get disabled() {
        return this._disabled;
    }

    get() {
        let checkedArr = [],
            cArr = this.checkArr.slice(1),
            firstCheck = this.checkArr[0],
            isLimit = 0;
        if (firstCheck.checked === true) {
            tools.isNotEmptyArray(cArr) && cArr.forEach(check => {
                checkedArr.push({name: check.text, id: check.value});
            });
        } else {
            isLimit = 1;
            tools.isNotEmptyArray(cArr) && cArr.forEach(check => {
                check.checked && checkedArr.push({name: check.text, id: check.value});
            });
        }
        if (tools.isEmpty(checkedArr) && this.title === '班级') {
            Modal.alert('无法确定活动对象，请重新选择班级!');
            return false;
        }
        if (isLimit === 1 && this.title !== '班级' && tools.isEmpty(checkedArr)) {
            Modal.alert('请选择' + this.title + '!');
            return false;
        }
        return {
            array: checkedArr,
            limit: isLimit
        };
    }
}