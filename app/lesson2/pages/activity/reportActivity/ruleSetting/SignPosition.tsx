/// <amd-module name="SignPosition"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Button} from "../../../../../global/components/general/button/Button";
import {TextInput} from "../../../../../global/components/form/text/text";
import d = G.d;
import tools = G.tools;
import {ReportActivityPage} from "../ReportActivityPage";
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {FastTable} from "../../../../../global/components/newTable/FastTable";
import {LeRule} from "../../../../common/rule/LeRule";
import SPA = G.SPA;

export interface SignPositionData {
    latitude: string;
    longitude: string;
    distance: number;
    signPosition: number;
    signCaption: string;
}

interface ISignPositionPara extends IComponentPara {
    isSignIn?: boolean;
}

export class SignPosition extends Component {

    private values: string[];
    private isSignIn: boolean;
    private latitude: string;
    private longitude: string;
    private signCaption: string;

    protected wrapperInit(para: ISignPositionPara): HTMLElement {
        this.values = ['不限', '活动地图库选择', '现在选择'];
        this.isSignIn = para.isSignIn;
        let date = new Date().getTime(),
            randomStr = this.getRandomStr(),
            r1 = date + randomStr + 'a', r2 = date + randomStr + 'b', r3 = date + randomStr + 'c';
        let spanTitle = para.isSignIn ? '签到限制距离' : '签退限制距离',
            name = 'signPosition' + randomStr;
        let signPositionWrapper = <div className="group-oriented-radio">
            <div className="check-title">{para.isSignIn === true ? '签到位置' : '签退位置'}</div>
            <div className="radio-group">
                <div className="radio-wrapper">
                    <input type="radio" className="radio-normal position-radio" value="不限" checked name={name}
                           id={r1}/>
                    <label htmlFor={r1}>不限</label>
                </div>
                <div className="selectMap">
                    <div className="radio-wrapper">
                        <input type="radio" className="radio-normal position-radio" value="活动地图库选择" name={name}
                               id={r2}/>
                        <label htmlFor={r2}>活动地图库选择</label>
                    </div>
                    <div className="position-setting hide">
                        <div className="select-pos">
                            <Button content="选择" className="addBtn" onClick={() => {
                                LeRule.Ajax.fetch(LE.CONF.ajaxUrl.selectPosition).then(({response}) => {
                                    let body = <div/>;
                                    let modal = new Modal({
                                        header: {
                                            title: response.data.caption
                                        },
                                        isAdaptiveCenter: true,
                                        width: '60%',
                                        height: '500px',
                                        body: body,
                                        className: 'table-modal',
                                        footer: {},
                                        onOk: () => {
                                            let tableSelects = table.selectedRowsData;
                                            if (tools.isNotEmptyArray(tableSelects)) {
                                                if (tableSelects.length >= 2) {
                                                    Modal.alert('请最多选择一个位置!');
                                                } else {
                                                    let row = tableSelects[0],
                                                        position = row.LOCATION;
                                                    this.longitude = position.split(',')[0];
                                                    this.latitude = position.split(',')[1];
                                                    this.innerEl.showPos.innerText = row.FOCUSNAME;
                                                    this.signCaption = row.FOCUSNAME;
                                                    (this.innerCom.map as TextInput).set(row.ACTIVITY_LOCATION_RADIUS);
                                                    modal.destroy();
                                                }
                                            } else {
                                                Modal.alert('请选择一个位置!');
                                            }
                                        }
                                    });
                                    let cols = [];
                                    response.data.sysFieldsList.forEach((colObj) => {
                                        let col = {
                                            name: colObj.field,
                                            title: colObj.caption
                                        };
                                        cols.push(col);
                                    });
                                    let table = new FastTable({
                                        container: body,
                                        cols: [cols],
                                        data: response.data.data,
                                        pseudo: {
                                            type: 'checkbox'
                                        }
                                    });
                                });
                            }}/>
                            <span>{spanTitle}</span>
                            <TextInput c-var="map" type="number"/>
                        </div>
                        <div className="showLocation">
                            <span>位置&nbsp;:</span>&nbsp;&nbsp;<span c-var="showPos"></span>
                        </div>
                    </div>
                </div>
                <div className="selectMap">
                    <div className="radio-wrapper">
                        <input type="radio" className="radio-normal position-radio" value='现在选择' name={name}
                               id={r3}/>
                        <label htmlFor={r3}>现在选择</label>
                    </div>
                    <div className="position-setting hide">
                        <div className="select-pos">
                            <Button content="选择" className="addBtn" onClick={() => {
                                SPA.open(['lesson2', 'mapModalModify', {
                                    inModal: true,
                                    _noHide: true,
                                    title: para.isSignIn ? '选择签到位置' : '选择签退位置',
                                    address: '',
                                    notRequest: true,
                                    radius: parseInt((this.innerCom.now as TextInput).get()),
                                }], {
                                    onClose: (lng, lat, radius,caption) => {
                                        this.longitude = tools.isNotEmpty(lng) ? lng.toString() : '';
                                        this.latitude = tools.isNotEmpty(lat) ? lat.toString() : '';
                                        this.signCaption = tools.isNotEmpty(caption) ? caption : '';
                                        this.innerEl.showNowPos.innerText = caption || '未知';
                                        (this.innerCom.now as TextInput).set(radius);
                                    }
                                }, true);
                            }}/>
                            <span>{spanTitle}</span>
                            <TextInput c-var="now" type="number"/>
                        </div>
                        <div className="showLocation">
                            <span>位置&nbsp;:</span>&nbsp;&nbsp;<span c-var="showNowPos"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
        return signPositionWrapper;
    }

    constructor(para: ISignPositionPara) {
        super(para);
        this.initEvents.on();
        (this.innerCom.map as TextInput).set('150');
        (this.innerCom.now as TextInput).set('150');
    }

    private getRandomStr() {
        let str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        let pwd = '';
        for (let i = 0; i < 5; i++) {
            pwd += str.charAt(Math.floor(Math.random() * str.length));
        }
        return pwd;
    }


    private initEvents = (() => {
        let inputChangeEvent = (e) => {
            this.setCheckedInput(e.target);
        };
        return {
            on: () => {
                d.on(this.wrapper, 'change', 'input[type=radio]', inputChangeEvent);
            },
            off: () => {
                d.off(this.wrapper, 'change', 'input[type=radio]', inputChangeEvent);
            }
        }
    })();

    private setCheckedInput(target: HTMLElement) {
        let selectMap = d.closest(target, '.selectMap'),
            setPositions = d.queryAll('.position-setting', this.wrapper);
        setPositions.forEach(pos => {
            pos.classList.add('hide');
        });
        if (tools.isNotEmpty(selectMap)) {
            d.query('.position-setting', selectMap).classList.remove('hide');
        }
    }

    set(data: SignPositionData) {
        if (tools.isNotEmpty(data)) {
            let signPositionRadios = d.queryAll('input.position-radio', this.wrapper).map(input => {
                return input as HTMLFormElement;
            });
            let position:number = 0;
            if (tools.isNotEmpty(data.signPosition)){
                position = Number(data.signPosition)
            }
            signPositionRadios[position].checked = true;
            this.setCheckedInput(signPositionRadios[data.signPosition]);
            if (position !== 0) {
                if (position === 1) {
                    (this.innerCom.map as TextInput).set(data.distance);
                    this.innerEl.showPos.innerText = tools.isNotEmpty(data.signCaption) ? data.signCaption : '未知';
                } else {
                    (this.innerCom.now as TextInput).set(data.distance);
                    this.innerEl.showNowPos.innerText = tools.isNotEmpty(data.signCaption) ? data.signCaption : '未知';
                }
                this.signCaption = tools.isNotEmpty(data.signCaption) ? data.signCaption : '';
                this.latitude = data.latitude;
                this.longitude = data.longitude;
            }
        }
    }

    get() {
        let signName = this.isSignIn === true ? '签到' : '签退';
        if (this.isSignIn === true) {
            let signPosition = this.values.indexOf((d.query('input.position-radio:checked', this.wrapper) as HTMLFormElement).value);
            if (signPosition !== 0) {
                if (tools.isEmpty(this.longitude) || tools.isEmpty(this.latitude)) {
                    Modal.alert('请选择' + signName + '位置');
                    return false;
                }
            }
            let distance = 0,
                signCaption = '',
                latitude = '',
                longitude = '';
            if(signPosition !== 0){
                signCaption = tools.isNotEmpty(this.signCaption) ? this.signCaption : '';
                latitude = tools.isEmpty(this.latitude) ? '' : this.latitude;
                longitude = tools.isEmpty(this.longitude) ? '' : this.longitude;
                if (signPosition === 1) {
                    distance = parseInt((this.innerCom.map as TextInput).get());
                } else {
                    distance = parseInt((this.innerCom.now as TextInput).get());
                }
            }
            return {
                latitude: latitude,
                longitude: longitude,
                distance: distance,
                signPosition: signPosition,
                signCaption:signCaption
            }
        } else {
            let signPosition = this.values.indexOf((d.query('input.position-radio:checked', this.wrapper) as HTMLFormElement).value);
            if (signPosition !== 0) {
                if (tools.isEmpty(this.longitude) || tools.isEmpty(this.latitude)) {
                    Modal.alert('请选择位置');
                    return false;
                }
            }
            ReportActivityPage.reportData.signPosition = signPosition;
            ReportActivityPage.reportData.longitude = this.longitude;
            ReportActivityPage.reportData.latitude = this.latitude;
            let distance = 0,
                signCaption = '';
            if (signPosition === 1) {
                distance = parseInt((this.innerCom.map as TextInput).get());
                signCaption = tools.isNotEmpty(this.signCaption) ? this.signCaption : '';
            } else {
                distance = parseInt((this.innerCom.now as TextInput).get());
            }
            ReportActivityPage.reportData.distance = distance;
            ReportActivityPage.reportData.signCaption = signCaption;
            return true;
        }
    }


    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}