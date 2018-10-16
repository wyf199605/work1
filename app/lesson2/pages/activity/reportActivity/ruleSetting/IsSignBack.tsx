/// <amd-module name="IsSignBack"/>

import d = G.d;
import IComponentPara = G.IComponentPara;
import Component = G.Component;

interface IIsSignBackPara extends IComponentPara {
    title?: string;
    itemArr?: string[];
    changeItems?: (index:number) => void;
    isRequired?:boolean;
}

export class IsSignBack extends Component {
    protected wrapperInit(para: IIsSignBackPara): HTMLElement {
        let title = para.isRequired === true ? <div className="lesson-label"><span>{para.isRequired === true ? '*' : ''}</span>&nbsp;{para.title}&nbsp;:</div> : <div className="lesson-label">{para.title}&nbsp;:</div>
        let signTypeWrapper = <div className="row isSignBack">
            <div className="lesson-form-group">
                {title}
                <div className="type">
                    <div className="sign-item active" data-name="sign-in">{para.itemArr[0]}</div>
                    <div className="sign-item" data-name="sign-out">{para.itemArr[1]}</div>
                </div>
            </div>
        </div>;
        return signTypeWrapper;
    }

    private changeHandle:(index:number)=>void;
    constructor(para: IIsSignBackPara) {
        super(para);
        this.changeHandle = para.changeItems;
        this.initEvent.on();
    }

    private initEvent = (() => {
        let signInTypeEvent = (e) => {
            let signItem = d.closest(e.target, '.sign-item'),
                allSignItem = d.queryAll('.sign-item',this.wrapper);
            allSignItem.forEach(item => {
                item.classList.toggle('active', item === signItem);
            });
            this.changeHandle(allSignItem.indexOf(signItem));
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.sign-item', signInTypeEvent);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.sign-item', signInTypeEvent);
            }
        }
    })();

    set(num: number) {
        let allSignItem = d.queryAll('.sign-item',this.wrapper);
        allSignItem.forEach((item, i) => {
            item.classList.toggle('active', i === num);
        })
    }

    destroy() {
        super.destroy();
        this.initEvent.off();
    }
}