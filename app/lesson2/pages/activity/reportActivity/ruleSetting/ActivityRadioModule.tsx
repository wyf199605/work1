/// <amd-module name="ActivityRadioModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;

interface IAvtivityRadioPara extends IComponentPara {
    title?: string;
    field?: string;
    value?: string[];
    isRequired?: boolean;
}

export class ActivityRadioModule extends Component {
    private values: string[];

    protected wrapperInit(para: IAvtivityRadioPara): HTMLElement {
        this.values = para.value;
        let date = new Date().getTime(),
            randomStr = this.getRandomStr(),
            r1 = date + randomStr + 'no', r2 = date + randomStr + 'yes',
            name = para.field + randomStr,
            activityRadioWrapper =
                <div className="lesson-form-group">
                    <div className="lesson-label">
                        <span>{para.isRequired === true ? '*' : ''}</span>&nbsp;{para.title}&nbsp;:
                    </div>
                    <div className="radio-group" c-var='radioGroup'>
                        <div className="radio-wrapper">
                            <input type="radio" className="radio-normal" value={para.value[0]} checked name={name}
                                   id={r1}/>
                            <label htmlFor={r1}>{para.value[0]}</label>
                        </div>
                        <div className="radio-wrapper">
                            <input type="radio" className="radio-normal" value={para.value[1]} name={name}
                                   id={r2}/>
                            <label htmlFor={r2}>{para.value[1]}</label>
                        </div>
                    </div>
                </div>;
        return activityRadioWrapper;
    }

    constructor(para: IAvtivityRadioPara) {
        super(para);
    }

    public onChange(handle: EventListener) {
        d.on(this.wrapper, 'change', 'input[type=radio]', handle);
    }

    private getRandomStr() {
        let str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        let pwd = '';
        for (let i = 0; i < 5; i++) {
            pwd += str.charAt(Math.floor(Math.random() * str.length));
        }
        return pwd;
    }

    get() {
        let index = this.values.indexOf((d.query('input:checked', this.wrapper)  as HTMLFormElement).value);
        ;
        return index;
    }

    set(num: number) {
        if (tools.isNotEmpty(num) && Number(num) < 2) {
            (d.queryAll('input.radio-normal', this.wrapper)[Number(num)] as HTMLFormElement).checked = true;
        } else {
            (d.queryAll('input.radio-normal', this.wrapper)[0] as HTMLFormElement).checked = true;
        }
    }

    set disabled(dis: boolean) {
        if(tools.isEmpty(dis)){
            return;
        }
        this._disabled = dis;
        this.innerEl.radioGroup.classList.toggle('disabled', dis);
    }

    get disabled() {
        return this._disabled;
    }
}