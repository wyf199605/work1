/// <amd-module name="RangeInputItem"/>

import {FormCom, IFormComPara} from "../../../global/components/form/basic";
import tools = G.tools;
import d = G.d;
import {DatetimeMb} from "../../../global/components/form/datetime/datetimeInput.mb";
import {IModal, Modal} from "../../../global/components/feedback/modal/Modal";
import {Button} from "../../../global/components/general/button/Button";
import Shell = G.Shell;

interface IRangeInputItem extends IFormComPara {
    isFirst?: boolean;
    interval?: number;
    caption?: string;
}

export class RangeInputItem extends FormCom {
    get(): string {
        let val: string = '';
        switch (this.para.interval) {
            case 0:
            case 5: {
                val = this.input ? this.input.value : '';
            }
                break;
            case 1:
            case 2: {
                val = (this.innerCom.time as DatetimeMb).get();
            }
        }
        return val;
    }

    set(val: string) {
        switch (this.para.interval) {
            case 0:
            case 5: {
                this.input.value = tools.str.toEmpty(val);
            }
                break;
            case 1:
            case 2: {
                (this.innerCom.time as DatetimeMb).set(val);
            }
        }

        this._value = val;
        typeof this.onSet === 'function' && this.onSet(val);
    }

    set value(val: string) {
        this.set(val);
    }

    get value() {
        return this.input ? this.input.value : '';
    }

    private input: HTMLFormElement;

    protected wrapperInit(para: IRangeInputItem): HTMLElement {
        let placeStr = '',
            wrapper: HTMLElement;
        if (para.interval === 0) {
            placeStr = para.isFirst ? '最低值' : '最高值';
        } else if (para.interval === 5) {
            placeStr = '请输入' + para.caption;
        } else {
            placeStr = para.isFirst ? '最小时间' : '最大时间';
        }
        switch (para.interval) {
            case 0:
            case 5: {
                wrapper = <div className="query-range-input-item new-query-input-wrapper">
                    {this.input = <input type="text" placeholder={placeStr}/>}
                    <div className="audio-icon"><i className="appcommon app-maikefeng"/></div>
                </div>;
            }
                break;
            case 1: {
                wrapper = <div className="new-query-item-time new-query-input-wrapper">
                    <DatetimeMb c-var="time" format="yyyy-MM-dd" placeholder={placeStr}/>
                </div>;
            }
                break;
            case 2: {
                wrapper =
                    <div className="new-query-item-time new-query-input-wrapper">
                        <DatetimeMb c-var="time"
                                    format="yyyy-MM-dd HH:mm:ss"
                                    placeholder={placeStr}/>
                    </div>;
            }
                break;
        }
        return wrapper;
    }

    constructor(private para: IRangeInputItem) {
        super(para);
        this.initEvents.on();
    }

    private initEvents = (() => {
        let audio = () => {
            Shell.base.speak(0, null, (e) => {

            });
            this.createSpeakModal(() => {

            });
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.audio-icon', audio),
            off: () => d.on(this.wrapper, 'click', '.audio-icon', audio)
        }
    })();

    private createSpeakModal(callback: () => void) {
        let bodyWrapper = <div className="speak-modal-body-wrapper">
            <i className="appcommon app-maikefeng"/>
            <div className="please-speak">请说话</div>
            <div className="exemple">例如:女装</div>
            <div className="speak-buttons">
                <Button content="取消" onClick={() => {
                    modal.isShow = false;
                }} className="speak-cancel"/>
                <Button content="说完了" onClick={() => {
                    callback && callback();
                    modal.isShow = false;
                }} className="speak-done"/>
            </div>
        </div>;
        let modal = new Modal({
            header: '',
            isBackground: true,
            isOnceDestroy: true,
            body: bodyWrapper,
            isMb: false,
            className: 'speak-modal',
            position: 'center',
            zIndex: 10000
        });
    }

    destroy() {
        this.input = null;
        this.initEvents.off();
        this.para = null;
        super.destroy();
    }
}
