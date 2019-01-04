///<amd-module name="RingProgress"/>

import tools = G.tools;
import d = G.d;
import Component = G.Component;
import IComponentPara = G.IComponentPara;

interface IColorPara{
    ring: string;  // 环的颜色
    out?: string;   // 外圆的颜色
    inner?: string; // 內圆的颜色
    font?: string;  // 字体颜色
}
interface IFontPara{
    style?: string;     // 字体样式(normal / italic / oblique)
    variant?: string;   // 字体的变体(normal / small-caps)
    weight?: string;    // 字体粗细(normal / bold / bolder / lighter)
    size?: number;       // 字体大小
    family?: string;     // 字体系列
}

export interface IRingProgressPara extends IComponentPara{
    percent?: number; //进度环初始位置，默认0；
    showInfo?: boolean; // 是否显示当前进度详细信息
    // 圆心位置（相对于父元素）
    position: {
        x: number,
        y: number
    };
    radius: number; // 外圆的半径
    ringWidth: number; // 环的宽度
    color: IColorPara;  // 颜色相关
    font?: IFontPara,   // 字体相关
    interval?: number;  // 间隔时间（毫秒）
    step?: number;      // 步长（百分比）
}

export class RingProgress extends Component{

    private timer = null;
    private x: number;
    private y: number;
    private radius: number;
    private ringWidth: number;
    private color: IColorPara;
    private font: IFontPara;
    private interval: number;
    private step: number;
    private ctx: CanvasRenderingContext2D;

    constructor(para: IRingProgressPara){
        super(para);

        this.paraValidator(para);
        this.initCanvas();
        this.drawRingProgress();
        this.isRun = true;
        !this.isEnd && (this.timer = setInterval(this.drawRingProgress, this.interval));

        d.on(this.wrapper, 'click', this.clickHandler);
        d.on(this.wrapper, 'dblclick', this.dblclickHandler);
    }

    wrapperInit(){
        return <canvas id={`ringProgress-${tools.getGuid()}`} className="ring-progress"></canvas>;
    }

    private paraValidator(para: IRingProgressPara){

        // 设置各参数的默认值
        this.percent = para.percent;
        this.showInfo = para.showInfo;
        this.x = para.position.x;
        this.y = para.position.y;
        this.radius = para.radius;
        this.ringWidth = para.ringWidth;
        this.color = {
            ring: para.color.ring,
            out: para.color.out || getComputedStyle(this.container).backgroundColor,
            inner: para.color.inner || getComputedStyle(this.container).backgroundColor,
            font: para.color.font || 'black'
        };
        tools.isNotEmpty(para.font) && (this.font = {
            style: para.font.style || 'normal',
            variant: para.font.variant || 'normal',
            weight: para.font.weight || 'normal',
            size: para.font.size || 10,
            family: para.font.family || 'sans-serif'
        });
        this.interval = para.interval || 100;
        this.step = para.step || 1;
    }

    private initCanvas(){

        // 初始化画布
        this.wrapper.style.width = this.radius * 2 + 'px';
        this.wrapper.style.height = this.radius * 2 + 'px';
        this.wrapper.style.position = 'absolute';
        this.wrapper.style.left = this.x - this.radius + 'px';
        this.wrapper.style.top = this.y - this.radius + 'px';
        (this.wrapper as HTMLCanvasElement).width = this.radius * 2;
        (this.wrapper as HTMLCanvasElement).height = this.radius * 2;
        this.ctx = (this.wrapper as HTMLCanvasElement).getContext('2d');
    }

    public drawRingProgress = () => {
        this.ctx.clearRect(0, 0, (this.wrapper as HTMLCanvasElement).width, (this.wrapper as HTMLCanvasElement).height);

        // 绘制的顺序是外圆==>环==>內圆==>文本（在globalCompositeOperation=source-over的情况下）
        // 绘制外圆
        this.ctx.beginPath();
        this.ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color.out;
        this.ctx.closePath();
        this.ctx.fill();

        // 绘制环（实际是扇形，需要內圆遮盖为环形）
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color.ring;
        this.ctx.moveTo(this.radius, this.radius);
        this.ctx.arc(this.radius, this.radius, this.radius, Math.PI / 2, Math.PI / 2 + this.percent / 100 * 2 * Math.PI, false);
        this.ctx.closePath();
        this.ctx.fill();

        // 绘制內圆
        this.ctx.beginPath();
        this.ctx.arc(this.radius, this.radius, this.radius - this.ringWidth, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color.inner;
        this.ctx.closePath();
        this.ctx.fill();

        // 显示文本
        let text = `${this.percent}%`,
            top = parseInt(this.ctx.font) / 2;
        this.showInfo && (
            tools.isNotEmpty(this.font) && (
                this.ctx.font = `${this.font.style} ${this.font.variant} ${this.font.weight} ${this.font.size}px ${this.font.family}`,
                top = this.font.size / 2
            ),
            this.ctx.fillStyle = this.color.font,
            this.ctx.fillText(text, this.radius - this.ctx.measureText(text).width / 2, this.radius + top)
        );

        if(this.isEnd){
            clearInterval(this.timer);
        }
        this.percent += this.step;
    }

    public reset = () => {
        this.percent = 0;
        clearInterval(this.timer);
        this.timer = setInterval(this.drawRingProgress, this.interval);
    }

    private clickHandler = () => {
        if(this.isRun && this.timer){
            clearInterval(this.timer);
            this.isRun = false;
        }else{
            this.timer = setInterval(this.drawRingProgress, this.interval);
            this.isRun = true;
        }
    }

    private dblclickHandler = () => {
        this.reset();
    }

    protected _percent = 0;
    set percent(len: number){
        this.isEnd = len > 100;
        this._percent = len > 100 ? 100 : len;
    }
    get percent(){
        return this._percent;
    }

    protected _showInfo = true;
    set showInfo(showInfo: boolean){
        this._showInfo = showInfo;
    }
    get showInfo(){
        return this._showInfo;
    }

    protected _isEnd = false;
    set isEnd(isEnd: boolean){
        this.isRun = !this.isEnd;
        this._isEnd = isEnd;
    }
    get isEnd(){
        return this._isEnd;
    }

    protected _isRun = false;
    set isRun(isRun: boolean){
        this._isRun = isRun;
    }
    get isRun(){
        return this._isRun;
    }

    destroy(){
        //销毁
        super.destroy();
    }
}

interface INewRingProgressPara extends IComponentPara{
    strokeWidth?: number;
    progressColor?: string;
    ringColor?: string;
}

export class NewRingProgress extends Component{

    protected wrapperInit(){
        return <div className="ring-progress-wrapper"/>
    }

    protected radius = 50;

    constructor(para: INewRingProgressPara){
        super(para);
        let {
            strokeWidth,
            ringColor,
            progressColor
        } = para;
        this.wrapper.innerHTML = NewRingProgress.getSvgTmp(strokeWidth, progressColor, ringColor, this.radius);

    }

    protected percent = 0;
    protected timer = null;

    format(percent: number, isError: boolean = false, time: number = 300){
        if(percent === this.percent){
            return
        }
        clearInterval(this.timer);

        let circle = this.wrapper.querySelector('.ring-progress-circle2'),
            text = this.wrapper.querySelector('.ring-progress-text'),
            circleLength = Math.floor(2 * Math.PI * this.radius),
            progress = percent / 100,
            diffVal = Math.abs(percent - this.percent),
            isAdd = percent > this.percent;

        circle.removeAttribute('style');
        circle.setAttribute('stroke', NewRingProgress.progressColor);
        circle.setAttribute('style', 'transition-duration: ' + time + 'ms');

        circle.setAttribute('stroke-dasharray', (circleLength * progress) + ",10000");

        isAdd ? this.percent ++ : this.percent --;
        text.innerHTML = this.percent + '%';
        this.timer = setInterval(() => {
            isAdd ? this.percent ++ : this.percent --;
            if(this.percent === percent){
                clearInterval(this.timer);
                circle.removeAttribute('style');
                if(progress >= 1){
                    circle.setAttribute('stroke', NewRingProgress.successColor);
                }
                if(isError){
                    circle.setAttribute('stroke', NewRingProgress.errorColor);
                }
            }
            text.innerHTML = this.percent + '%';
        }, (time - 10) / diffVal);
    }

    protected _isEnd: boolean = false;
    get isEnd(){
        return this._isEnd;
    }
    set isEnd(isEnd: boolean){
        this._isEnd = isEnd;
    }

    static errorColor = '#f04134';
    static successColor = '#00a854';
    static progressColor = '#108ee9';

    static getSvgTmp(strokeWidth: number = 10, progressColor = NewRingProgress.progressColor, ringColor = '#fff', radius = 50){
        let center = 55,
            length = 120;

        return `
        <svg class="ring-progress-svg" xmlns="http://www.w3.org/200/svg" height="${length}" width="${length}">
            <circle class="ring-progress-circle1" cx="${center}" cy="${center}" r="${radius}" 
            fill="none" stroke="${ringColor}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
            <circle class="ring-progress-circle2" cx="${center}" cy="${center}" r="${radius}" 
            fill="none" stroke="${progressColor}" stroke-width="${strokeWidth}" stroke-dasharray="0,10000"/>
            <text class="ring-progress-text" x="55" y="55"
             text-anchor="middle" dominant-baseline="middle" font-size="18">0%</text>
        </svg>
        `
    }
}
