/// <amd-module name="LabelPrint"/>
import {Draw} from "../../../global/utils/draw";

interface location{
    x:number,//横坐标
    y:number,//纵坐标
    w?:number,
    h?:number
}
interface fontSty{
    name?:string,
    size?:number,
    color?:string,
    style?:number
}
interface textSty{
    align?:string,//文字的对齐方式
    textBackColor?,//文字的背景颜色
    autoFill?:boolean,//文字是否充满宽高   目前只能充满高  宽度canvas不支持充满
    wordWrap?:boolean,//是否换行
    font?:fontSty,//字体样式
    isShow?:boolean//判断是否显示
}
interface fillSty{
    color?:string,//默认为黑色，填充图形里面的颜色
    /**
     * 0:实心填充
     * 1:空心
     * 2:水平平行线填充
     * 3:垂直平行线
     * 4:右斜线
     * 5:左斜线
     * 6:方格填充
     * 7::斜方格
     */
    style?:number,//默认为实心填充 图形的填充类型
    width?:number//填充线条的宽度
}
interface boderSty{
    color?:string,//图形边框的颜色 默认为黑色
    /**
     * 0:实线
     * 1:虚线
     * 2:点线
     * 3:虚点线
     * 4:虚点点线
     * 5:无线
     * 6:透视效果
     */
    style?:number,//默认为实线 图形边框的类型  实线 虚线等
    width?:number//图形边框的宽度
}
interface graphSty{
    angle?:number,//默认为0不旋转
    fill?:fillSty
    border?:boderSty
    isShow?:boolean//判断是否显示
}
interface canvasStyle{
    width:number,
    height:number
}
export class LabelPrint{
    private draw;
    constructor(can:canvasStyle){
        this.init(can);
    }
    init(can){
        this.draw = new Draw(can);
    }
    text(data, loc:location, sty:textSty){
        let style = Object.assign({}, LabelPrint.defaultPara.textDefaultPara, sty);
        let newRuler = {};
        for(let key1 in style){
            let result = LabelPrint.textRuler[key1].call(this,style[key1]);
                for(let key2 in result){
                    newRuler[key2] = result[key2];
                }
        }
        sty.isShow ? sty.isShow===true ? this.draw.text(data,loc,newRuler) : '' : this.draw.text(data,loc,newRuler);
    }
    graph(shapeKind:number,loc:location,sty:graphSty) {//画图形
        sty = Object.assign({}, LabelPrint.defaultPara.shapeDefaultPara, sty);
        let newRuler = {};
        for (let key1 in sty) {
            let result = LabelPrint.graphRuler[key1].call(this, sty[key1]);
            for (let key2 in result) {
                newRuler[key2] = result[key2];
            }
        }
        sty.isShow ? sty.isShow === true ? this.draw.graph(shapeKind, loc, newRuler) : '' : this.draw.graph(shapeKind, loc, newRuler);
    }
    getCtx(){
        return this.draw.getCanvasCt();
    }
    static textRuler = {
        align:function(value){
            if(value=='left'){
                return {alignment:0};
            }
            else if(value=='right'){
                return {alignment:1};
            }
            else{
                return {alignment:2};
            }
        },
        textBackColor:function(value){
            function hex(x){
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            value = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?(\d+(\.\d+)?)?\)$/);
            return {backColor:parseInt((hex(value[1]) + hex(value[2]) + hex(value[3])),16),transparent:Number(value[4])};
        },
        font:function(value){
            function hex(x){
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            let result = value.color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?(\d+(\.\d+)?)?\)$/);
            let fontSty = {font:{}};
            for(let key in value){
                key=='name'?fontSty.font['fontName']=value[key]:'';
                key=='size'?fontSty.font['fontSize']=value[key]:'';
                key=='color'?fontSty.font['fontColor']=parseInt((hex(result[1]) + hex(result[2]) + hex(result[3])),16):'';
                key=='name'?fontSty.font['fontName']=value[key]:'';
            }
            return fontSty;
        },
        autoFill:function(value){
            if(value){
                return {autoSize:false,stretch:true}
            }
            else{
                return {autoSize:true};
            }
        },
        isShow:function(value){},
        wordWrap:function(value){
            return {wrapping:value};
        }
    }
    static graphRuler ={
        angle:function(value){
            return {angle:value};
        },
        fill:function(value){
            function hex(x){
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            let result = value.color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return{brushColor:parseInt((hex(result[1]) + hex(result[2]) + hex(result[3])),16),brushStyle:value.style,fillPenWidth:value.width};
        },
        border:function(value){
            function hex(x){
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            let result = value.color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return{penColor:parseInt((hex(result[1]) + hex(result[2]) + hex(result[3])),16),penStyle:value.style,borderPenWidth:value.width};
        },
        isShow:function(value){

        }
    }
    static  graphKind ={//形状类型对应的执行函数
        rectangle:0,//矩形
        circle:1,//圆或者椭圆
        verticalLine:2,//竖线
        line:3,//直线
        parallelLine:4//上下平行线
    }
    static defaultPara = {//默认参数
        textDefaultPara:{
            align:'left',
            textBackColor:'rgba(255,255,255,1)',
            autoFill:false,
            wordWrap:false,
            font:{name:'宋体',size:10,color:'rgb(0,0,0)'}
        },
        shapeDefaultPara:{
            fill:{color:'rgb(0,0,0)',style:1,width:1},//默认填充颜色黑色
            border: {color:'rgb(0,0,0)',style:0,width:1}
        }
    }
}