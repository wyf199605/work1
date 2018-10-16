/// <amd-module name="CancelTimeModule"/>

import d = G.d;
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import tools = G.tools;
import {TimeModule} from "./TimeModule";

export interface CancelTimePara {
    index?:number;
    startTime?:number;
    endTime?:number;
}

interface ICancelTimeModulePara extends IComponentPara {
    title?: string;
    field?: string;
    value?: string[];
    timeTile?:string;
}

export class CancelTimeModule extends Component {
    private values: string[];

    protected wrapperInit(para: ICancelTimeModulePara): HTMLElement {
        this.values = para.value;
        let date = new Date().getTime(),
            randomStr = this.getRandomStr(),
            field = tools.isNotEmpty(para.field) ? para.field : '',
            r1 = date + randomStr + field + 'no', r2 = date + randomStr + field + 'yes',
            activityRadioWrapper = <div className="row">
                <div className="lesson-form-group" style="height:46px">
                    <div className="lesson-label">{para.title}&nbsp;:</div>
                    <div className="radio-group" c-var="group">
                        <div className="radio-wrapper">
                            <input type="radio" className="import-list radio-normal" value={para.value[0]} checked
                                   name={para.field}
                                   id={r1}/>
                            <label htmlFor={r1}>{para.value[0]}</label>
                        </div>
                        <div className="radio-wrapper">
                            <input type="radio" className="import-list radio-normal" value={para.value[1]}
                                   name={para.field}
                                   id={r2}/>
                            <label htmlFor={r2}>{para.value[1]}</label>
                        </div>
                    </div>
                    <div className="showOrHide hide" c-var="showTime" style={{paddingLeft: "12px"}}>
                        <TimeModule c-var="time" title={para.timeTile} preAlert={para.timeTile}/>
                    </div>
                </div>
            </div>;
        return activityRadioWrapper;
    }

    constructor(para: ICancelTimeModulePara) {
        super(para);
        this.initEvents.on();
    }

    private initEvents = (() => {
        let checkedEvent = (e) => {
            let target = e.target as HTMLFormElement,
                showOrHide = d.query('.showOrHide', this.wrapper);
            if (target.value === '是'){
                showOrHide.classList.remove('hide');
            }else{
                showOrHide.classList.add('hide')
            }

        };
        let downloadHandler = () => {
            // 下载名单模板
            window.open(LE.CONF.ajaxUrl.downloadTem);
        };
        return {
            on: () => {
                d.on(this.wrapper, 'change', 'input[type="radio"]', checkedEvent);
                d.on(this.wrapper, 'click', '.download', downloadHandler);
            },
            off: () => {
                d.off(this.wrapper, 'change', 'input[type="radio"]', checkedEvent);
                d.off(this.wrapper, 'click', '.download', downloadHandler);
            }
        }
    })();

    private getRandomStr() {
        let str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        let pwd = '';
        for (let i = 0; i < 5; i++) {
            pwd += str.charAt(Math.floor(Math.random() * str.length));
        }
        return pwd;
    }

    set(data:CancelTimePara) {
        if (tools.isNotEmpty(data)){
            let radiosArr = d.queryAll('input.import-list', this.wrapper).map(input =>{
                return input as HTMLFormElement;
            });
            radiosArr[data.index].checked = true;
            if (data.index === 1){
                this.innerEl.showTime.classList.remove('hide');
                (this.innerCom.time as TimeModule).set([data.startTime,data.endTime]);
            }
        }
    }

    get() {
        let index = this.values.indexOf((d.query('input.import-list:checked', this.wrapper)  as HTMLFormElement).value);
        let obj = {
            radio:index,
            startTime:0,
            endTime:0
        };
        if (index === 1){
            let timeValue = (this.innerCom.time as TimeModule).get();
            if (timeValue === false){
                return false;
            }
            obj.startTime = timeValue[0];
            obj.endTime = timeValue[1];
        }
        return obj;
    }

    set disabled(disabled:boolean){
        if (tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        this.innerEl.group.classList.toggle('disabled',disabled);
        (this.innerCom.time as TimeModule).disabled = disabled;
    }
    get disabled(){
        return this._disabled;
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}