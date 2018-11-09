/// <amd-module name="MbListItem"/>

import {MbList} from "./MbList";
import d = G.d;
import tools = G.tools;
import {CheckBox} from "../form/checkbox/checkBox";
import Component = G.Component;
import IComponentPara = G.IComponentPara;

export interface IMbListItemPara extends IComponentPara{
    list?: MbList;
    index?: number;
    data?: MbListItemData;
    isImg?: boolean;
    isCheckBox?: boolean;
    btns?: string[];
    buttonClick?:(index)=>void;
    imgLabelColor?:string;
    statusColor?:string;
}

export interface MbListItemData{
    body?: [string, string][];
    label?: string[];
    title?: string;
    img?: string;
    imgLabel?: string;
    status?: number;
    countDown?: number;
}

export class MbListItem extends Component {
    protected list: MbList;
    protected checkBox: CheckBox;
    protected imgWrapper: HTMLElement;
    protected btnWrapper: HTMLElement;
    protected details: objOf<HTMLElement>;

    constructor(protected para: IMbListItemPara) {
        super(para);
        this.list = para.list;
        this._index = para.index;
        this.isShowCheckBox = para.isCheckBox || false;
        this.render(para.data || {});
        if (tools.isNotEmptyArray(para.btns)){
            this.initBtn(para.btns);
            this.initEvents.on();
        }
    }

    protected wrapperInit(para: IMbListItemPara) {
        let isImg = tools.isEmpty(para.isImg) ? true : para.isImg;
        this._isImg = isImg;
        this.details = {};
        let statusColor = {
            color:para.statusColor
        };
        return <div className="list-item-wrapper" data-index={para.index}>
            <div className="list-item-body-container">
                {this.checkBox = <CheckBox className="hide" onClick={(isChecked)=>{
                    para.list && para.list.setSelectStatus(isChecked);
                }
                }/>}
                <div className="list-item-content">
                    {this.imgWrapper = isImg ? <div className="list-item-img"/> : null}
                    <div className="list-item-details">
                        {this.details['title'] = <div className="list-detail-item list-item-title"/>}
                        {this.details['body'] = <div className="list-detail-item list-item-body"/>}
                        {this.details['label'] = <div className="list-detail-item list-item-labels"/>}
                        {this.details['countDown'] = <div className="list-detail-item list-item-count-down"/>}
                        {this.details['status'] = <div className="list-detail-item list-item-status" style={tools.isNotEmpty(para.statusColor) ? statusColor : {}} />}
                    </div>
                </div>
            </div>
        </div>;
    }

    // 获取当前listItem是否有图片
    protected _isImg: boolean;
    get isImg(){
        return this._isImg;
    }

    // 获取当前索引
    protected _index: number;
    get index() {
        return this._index;
    }

    set index(index: number) {
        this._index = index;
        this.wrapper && (this.wrapper.dataset['index'] = index + '');
    }

    // 获取、设置当前行是否是选中
    get selected() {
        return this.checkBox.checked;
    }

    set selected(selected: boolean) {
        this.checkBox && (this.checkBox.checked = selected);
    }

    // 获取、设置是否显示checkBox
    set isShowCheckBox(flag: boolean) {
        if (!flag) {
            this.selected = false;
        }
        this.checkBox && this.checkBox.wrapper.classList.toggle('hide', !flag);
    }

    get isShowCheckBox() {
        return this.checkBox ? this.checkBox.wrapper.classList.contains('hide') : false;
    }

    // 渲染数据
    render(data: MbListItemData) {
        // 渲染图片
        if(this.isImg && this.imgWrapper){
            this.imgWrapper.innerHTML = '';
            let img = data.img || G.requireBaseUrl + '../img/fastlion_logo.png';
            d.append(this.imgWrapper, <img src={img} alt=""/>);
            if(tools.isNotEmpty(data.imgLabel)){
                let imgLabelColor= {
                    backgroundColor:this.para.imgLabelColor
                };
                d.append(this.imgWrapper, <div className='img-label' style={tools.isNotEmpty(this.para.imgLabelColor) ? imgLabelColor : {}}>{data.imgLabel}</div>);
            }
        }

        // 渲染内容
        for(let name in this.details){
            let el = this.details[name],
                content = data[name];
            el.classList.toggle('hide', tools.isEmpty(content));

            switch (name){
                case 'body':
                    el.innerHTML = '';
                    content && content.forEach((arr) => {
                        d.append(el, <p>
                            <span className="body-title">{arr[0] + '：'}</span><span className="body-value">{arr[1]}</span>
                        </p>)
                    });
                    break;
                case 'label':
                    el.innerHTML = '';
                    content && content.forEach((label) => {
                        d.append(el, <span className="label">{label}</span>)
                    });
                    break;
                case 'status':
                    // el.style.color = this.para.statusColor;
                    el.innerHTML = content || '';
                    break;
                case 'countDown':
                    this.initCountDown(el, content);
                    break;
                case 'title':
                default:
                    el.innerHTML = content || '';
                    break;
            }
        }
    }

    // 设置倒计时定时器
    protected timer: number;
    protected initCountDown(el: HTMLElement, countDown: number){
        let toTwo = (num) => {
            return num < 10 ? '0' + num : num + '';
        };
        clearInterval(this.timer);
        typeof countDown === 'number' && (this.timer = setInterval(() => {
            let date = new Date(),
                html = '',
                targetTime = new Date(countDown),
                total = (targetTime.getTime() - date.getTime()) / 1000;

            if (targetTime.getTime() < date.getTime()) {
                html = '活动已开始';
                el.innerHTML = html;
                clearInterval(this.timer);
                this.timer = null;
                return;
            }
            let day = Math.floor(total / (24 * 60 * 60)),
                afterDay = total - day * 24 * 60 * 60,
                hour = Math.floor(afterDay / (60 * 60)),
                afterHour = total - day * 24 * 60 * 60 - hour * 60 * 60,
                min = Math.floor(afterHour / 60),
                sec = Math.floor(total - day * 24 * 60 * 60 - hour * 60 * 60 - min * 60);

            el.innerText = '倒计时：' +
                (day > 0 ? day + '天' : '') + ' ' +
                toTwo(hour) + ':' + toTwo(min) + ':' + toTwo(sec);
        }, 1000));
    }
    //是否显示按钮
    protected _isShowBtns: boolean = false;
    set isShowBtns(flag: boolean){
        this._isShowBtns = flag;
        this.btnWrapper && this.btnWrapper.classList.toggle('hide', !flag);
    }
    get isShowBtns(){
        return this.btnWrapper ? this._isShowBtns : false;
    }

    // 初始化按钮配置
    initBtn(btns: string[]){
        let btnWrapper = <div className="btn-group">{this.btnWrapper = <div className="buttons-wrapper"/>}</div>
        let btnsArr = [];
        btns.forEach((btn,index) => {
            btnsArr.push(`<div class="item-button ${index === 1 ? 'first' : ''}" data-index="${index}">${btn}</div>`);
        });
        this.btnWrapper.innerHTML = btnsArr.join('');
        this.wrapper.appendChild(btnWrapper);
    }

    private initEvents = (()=>{
        let clickEvent = (e)=>{
            let index = parseInt(d.closest(e.target,'.item-button').dataset.index);
            tools.isFunction(this.para.buttonClick) && this.para.buttonClick(index);
        };
        return {
            on:()=>d.on(this.wrapper,'click','.btn-group .item-button',clickEvent),
            off:()=>d.off(this.wrapper,'click','.btn-group .item-button',clickEvent)
        }
    })();
    destroy(){
        clearInterval(this.timer);
        this.checkBox && this.checkBox.destroy();
        this.checkBox = null;
        this.details = null;
        this.list = null;
        this.imgWrapper = null;
        this.para = null;
        this.initEvents.off();
        super.destroy();
    }
}


