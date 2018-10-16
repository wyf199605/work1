/// <amd-module name="GroupRadioModule"/>


import d = G.d;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
interface IGroupRadioPara extends IComponentPara {
    title?: string;
    field?: string;
    value?: string[];
}

export class GroupRadioModule extends Component {
    private values: string[];
    protected wrapperInit(para: IGroupRadioPara): HTMLElement {
        this.values = para.value;
        let date = new Date().getTime(),
            randomStr = this.getRandomStr(),
            r1 = date + randomStr + 'a' + para.field, r2 = date + randomStr + 'b' + para.field,r3 = date + randomStr + 'c' + para.field,
            groupRadioModule = <div className="group-oriented-radio">
                    <div className="check-title">{para.title}</div>
                    <div className="radio-group" c-var="group">
                        <div className="radio-wrapper">
                            <input type="radio" className="radio-normal other-radio" value={para.value[0]} checked name={para.field}
                                   id={r1}/>
                            <label htmlFor={r1}>{para.value[0]}</label>
                        </div>
                        <div className="radio-wrapper">
                            <input type="radio" className="radio-normal other-radio" value={para.value[1]} name={para.field}
                                   id={r2}/>
                            <label htmlFor={r2}>{para.value[1]}</label>
                        </div>
                        <div className="radio-wrapper">
                            <input type="radio" className="radio-normal other-radio" value={para.value[2]} name={para.field}
                                   id={r3}/>
                            <label htmlFor={r3}>{para.value[2]}</label>
                        </div>
                    </div>
            </div>;
        return groupRadioModule;
    }

    constructor(para: IGroupRadioPara) {
        super(para);
    }

    private getRandomStr(){
        let str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        let pwd = '';
        for (let i = 0; i < 5; i++) {
            pwd += str.charAt(Math.floor(Math.random() * str.length));
        }
        return pwd;
    }

    set(num:number){
        if (tools.isNotEmpty(num) && Number(num) < 3){
            (d.queryAll('.other-radio',this.wrapper)[Number(num)] as HTMLFormElement).checked = true;
        }else{
            (d.queryAll('.other-radio',this.wrapper)[0] as HTMLFormElement).checked = true;
        }
    }

    get() {
        return this.values.indexOf((d.query('input.other-radio:checked', this.wrapper)  as HTMLFormElement).value);
    }

    set disabled(dis:boolean){
        this._disabled = dis;
        this.innerEl.group.classList.toggle('disabled',dis);
    }
    get disabled(){
        return this._disabled;
    }
}

