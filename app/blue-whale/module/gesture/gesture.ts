/// <amd-module name="Gesture"/>
import d = G.d;
interface recobj{
    x : number;
    y : number;
    width : number;
    height : number;
}
interface GesturePara{
    container? : HTMLElement;
    onFinsh?(ges): void;
}
declare const Point;
declare const DollarRecognizer;
export = class  Gesture{
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private dollarRecognizer;
    private points : Array<any>;
    private rect : recobj;
    private isDown : boolean;
    private shape : string;
    private container : HTMLElement;
    constructor(private GesturePara : GesturePara){
            this.initHtml();
            this.initEvent();
    }
    private initHtml(){
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.screen.availWidth;
        this.canvas.height = window.screen.availHeight;
        this.canvas.style.background = 'rgba(0,0,0,0.3)';
        this.initIcon();
        this.drawText('请绘制手势');
    }

    private initIcon(){
        this.container = document.createElement('div');
        this.container.setAttribute('style','z-index:1001; position:fixed;top:0px;');

        let iconGes = document.createElement('i');
        iconGes.setAttribute('style','z-index:-1;position:absolute; top:50%; left:50%; margin-top:0px; margin-left:-100px; font-size:200px; color:rgb(130,130,130);');
        iconGes.className = 'iconfont icon-gesture';

        this.container.appendChild(this.canvas);
        this.container.appendChild(iconGes);
        this.GesturePara.container.appendChild(this.container);
    }
    private initEvent(){
        this.points = new Array();
        this.dollarRecognizer = new DollarRecognizer();
        this.ctx.fillStyle = "rgb(0,0,225)";
        this.ctx.strokeStyle = "rgb(0,0,225)";
        this.ctx.lineWidth = 3;
        this.ctx.font = "16px Gentilis";
        this.rect = this.getCanvasRect();
        this.isDown = false;
        d.on(this.canvas,'touchstart',(event : TouchEvent)=>{
            let el = <HTMLElement>event.target;
            if(!(el.classList.contains('icon-quxiao') || el.classList.contains('icon-fasongyoujian'))){
                this.mouseDownEvent(event.targetTouches[0].clientX, event.targetTouches[0].clientY)
            }
        });
        d.on(this.canvas,'touchmove',(event: TouchEvent)=>{
            let el = <HTMLElement>event.target;
            if(!(el.classList.contains('icon-quxiao') || el.classList.contains('icon-fasongyoujian'))){
                this.mouseMoveEvent(event.targetTouches[0].clientX, event.targetTouches[0].clientY)
            }
            event.preventDefault();
            event.stopPropagation();
        });
        d.on(this.canvas,'touchend',(event: TouchEvent)=>{
            let el = <HTMLElement>event.target;
            if(!(el.classList.contains('icon-quxiao') || el.classList.contains('icon-fasongyoujian'))){
                this.mouseUpEvent(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
            }
            this.container.remove(); //关闭时删除该节点
            this.GesturePara.onFinsh.call(this,this.shape);
        });
    }
    private getCanvasRect(){
        let w = this.canvas.width;
        let h = this.canvas.height;

        let cx = this.canvas.offsetLeft;
        let cy = this.canvas.offsetTop;
        while (this.canvas.offsetParent != null)
        {
            this.canvas = <HTMLCanvasElement>this.canvas.offsetParent;
            cx += this.canvas.offsetLeft;
            cy += this.canvas.offsetTop;
        }
        return {x: cx, y: cy, width: w, height: h};
    }
    private getScrollY(){
        let scrollY = document.body.scrollTop;
        return scrollY;
    }
    private mouseDownEvent(x, y)
    {
        document.onselectstart = function() { return false; };
        document.ontouchstart = function() { return false; };
        this.isDown = true;
        x -= this.rect.x;
        y -= this.rect.y - this.getScrollY();
        if (this.points.length > 0)
            this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
        this.points.length = 1; // clear
        this.points[0] = new Point(x, y);
      //  this.drawText("Recording unistroke...");
        this.ctx.fillRect(x - 4, y - 3, 9, 9);
    }
    private  mouseMoveEvent(x, y)
    {
        if (this.isDown)
        {
            x -= this.rect.x;
            y -= this.rect.y - this.getScrollY();
            this.points[this.points.length] = new Point(x, y); // append
            this.drawConnectedPoint(this.points.length - 2, this.points.length - 1);
        }
    }
    private  mouseUpEvent(x, y)
    {
        document.onselectstart = function() { return true; };
        document.ontouchstart = function() { return true; };
        if (this.isDown)
        {
            this.isDown = false;
            if (this.points.length >= 10)
            {
                let result = this.dollarRecognizer.Recognize(this.points, true);
              //  this.drawText("Result: " + result.Name + " (" + this.round(result.Score,2) + ").");
                this.shape = result.Name;
            }
            else
            {
                this.shape = "无法识别";
             //   this.drawText("Too few points made. Please try again.");
            }
        }
    }
    private drawText(str)
    {
        this.ctx.font = "25px Arial";
        let textWidth = this.ctx.measureText(str).width;
        this.ctx.fillText(str,this.canvas.width/2-textWidth/2, this.canvas.height/2 + 150);
    }
    private drawConnectedPoint(from, to)
    {
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[from].X, this.points[from].Y);
        this.ctx.lineTo(this.points[to].X, this.points[to].Y);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    private round(n, d)
    {
        d = Math.pow(10, d);
        return Math.round(n * d) / d
    }
}


