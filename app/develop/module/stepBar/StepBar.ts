/// <amd-module name="StepBar"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import IComponentPara = G.IComponentPara;
import Component = G.Component;

let d = G.d;
let tools = G.tools;

interface IStepBarPara extends IComponentPara {
    btnArr?: string[];
    changePage?:(index:number)=>void;
    allowClickNum?:boolean;
}

export class StepBar extends Component {
    protected wrapperInit(): HTMLElement {
        return d.create(`
        <div class="browserDevelopNav"></div>
        `);
    }
    public changePage:(index:number)=>void;
    private init(para: IStepBarPara) {
        this.btnArray = para.btnArr;
        this.initButtons();
        this.currentIndex = 0;
        let self = this;
        this.isAll = true;
        this.changePage = para.changePage;
        para.allowClickNum && this.clickEvent.on();
    }

    private clickEvent = (()=>{
        let clickHandler = (e)=>{
            let ele = <HTMLElement>e.target;
            let index = parseInt(ele.dataset.index);
            if ( index > this.currentIndex + 1 && this.isAll === true) {
                Modal.alert('请按照顺序操作');
                return;
            }  else if (index === this.currentIndex) {
                return;
            }else {
                this.currentIndex = index;
                this.changePage(index);
            }
        };
        return {
            on: ()=>d.on(this.wrapper, 'click', '.num',clickHandler),
            off: ()=>d.off(this.wrapper, 'click', '.num',clickHandler)
        }
    })();
    private _isAll:boolean;
    private set isAll(isAll){
        this._isAll = isAll;
    }
    private get isAll(){
        return this._isAll;
    }
    private _currentIndex: number;
    set currentIndex(index) {
        if (index >= this.btnArray.length - 1){
            this._currentIndex = this.btnArray.length - 1;
            this.isAll = false;
        }else{
            this._currentIndex = index;
        }
        this.changeStep(this._currentIndex);
    }

    get currentIndex() {
        return this._currentIndex;
    }

    private btnArray: string[];

    private initButtons() {
        let self = this;
        this.wrapper.appendChild(d.create(`<div class="line"></div>`));
        this.wrapper.appendChild(d.create(`<div class="items"></div>`));
        let buttonContainer = d.query('.items', this.wrapper);
        this.btnArray.forEach((value, index) => {
            let htmlStr = `
                <div class="item">
                    <div class="num" data-name="num" data-index="${index}">${index + 1}</div>
                    <div class="text">${value}</div>
                </div>
                `;
            let htmlEle = d.create(htmlStr);
            if (index === 0) {
                d.query('.num', htmlEle).classList.add('active');
            }
            buttonContainer.appendChild(htmlEle);
        });
    }

    constructor(para: IStepBarPara) {
        super(para);
        this.init(para);
    }

    changeStep(index) {
        let allNum = d.queryAll('.num', this.wrapper),
            len = allNum.length;
        if (index >= len) {
            return;
        }
        for (let i = 0; i < len; i++) {
            if (i === index) {
                if (!allNum[i].classList.contains('active')) {
                    allNum[i].classList.add('active');
                }
            } else {
                if (allNum[i].classList.contains('active')) {
                    allNum[i].classList.remove('active');
                }
            }
        }
    }
}