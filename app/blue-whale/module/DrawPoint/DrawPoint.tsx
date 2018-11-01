/// <amd-dependency path="D3" name="D3"/>
/// <amd-module name="DrawPoint"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;

declare const D3;
//开启描点连线功能
//开启地图放大功能以及拖动功能
//开启绘制区域功能 （） 设置区域的动画 样式 标旗 ！默认出现弹窗样式显示信息

interface IDrapPoint extends IComponentPara{
    width:number | string
    height:number | string
    image?:string;
    format?: (data: obj) => obj;
    onAreaClick?: (areaType: IAreaType) => Promise<any>;
}

interface IAreaType{
    type: 'edit';
    data: obj;
    name: string;
}

export  class DrawPoint extends Component{
    public svg;
    public g;
    public index = 0;
    public points = [];//存入当前的信息
    public map
    public selected
    public line;
    public r;
    public isDrawLine:boolean = false;
    public indexStr;//保存当前选中的path 下标
    public drag

    static EVT_AREA_CLICK = '__event_draw_area_click__';
    static EVT_INSERT_DATA = '__event_insert_area_click__';
    static EVT_DELETE_DATA = '__event_delete_area_click__';
    static EVT_EDIT_DATA = '__event_edit_area_click__';
    static EVT_IMG_INIT = '__event_image_area_click__';

    protected wrapperInit(){
        return <div className="draw-point-wrapper"/>;
    }

    constructor(para: IDrapPoint) {
        super(para);
        this.map = D3.map(this.points, function (d, i) {
            return i;
        })
        this.r = D3.scale.linear()
            .domain([1,6])
            .range([5.5,1])
        this.line = D3.svg.line();
        //拖动
        this.InitDrag();
        this.InitSvg(para);


        let events = this.eventHandlers[DrawPoint.EVT_AREA_CLICK];
        events && events.forEach((f) => {
            f && f();
        });
    }

    public InitSvg(para) {
        this.svg = D3.select('.draw-point-wrapper').append('svg')
            .attr('width', para.width)
            .attr('height', para.height)
            .on('mousedown',()=>{
                if(!this.isDrawLine){
                    return
                }
                this.mousedown();
                this.redraw();
            })
        console.log(para.wraperId);
        console.log(D3.select(para.wraperId));
        this.g = this.svg.append('g');
        this.g.append('image').attr('href',para.image).attr('width',para.width).attr('height',para.height)//添加背景图
    }

    private mousedown() {

        let svg = D3.select('svg').select('g')
        this.points.push(this.selected = D3.mouse(svg.node()))
        console.log(this.points)
        this.map.set(this.index, this.points)
    }

    public  render(data1?:obj[]){
        //
     let   data = [
           {'point':[[308, 41.33333206176758],[307, 147.3333282470703],[212, 148.3333282470703],[215, 42.33333206176758],[308, 41.33333206176758]],
            'edit_one':'KFC',
            'edit_two':'20000/月',
            'index':'0'},
           {'point':[[355, 97.3333358764648],[335, 206.3333282470703],[408, 170.3333282470703],[413, 97.33333587646484],[355, 97.33333587646484]],
             'edit_one':'McDonload',
             'edit_two':'10000/月',
             'index':'1'}
       ]
        let svg = D3.select('svg').select('g');

         svg.selectAll('path').data(data).enter().append('path')
            .attr("class",'line')
            .attr("id",function (d) {
                return 'path'+d.index;
            })
            .attr("d", (d,i)=> {
                return this.line(data[i]['point']);
            })

            let text =  svg.selectAll('text').data(data).enter().append('text')
             .attr('fill','black')
             .attr('font-size','14px')
             .attr("text-anchor","middle")
             .attr('x',function (d,i) {
                 return d['point'][0][0];
             })
             .attr('y',function (d,i) {
                 return d['point'][0][1];
             })
             .attr('dx',10)
             .attr('dy',10)
             .text(function (d) {
                 console.log(d)
                 return d.edit_one;

             })

                 text.append('tspan').data(data)
                 .attr('x',function (d) {
                     return d['point'][0][0];
                 })
                 .attr('dy','1em')
                 .text(function (d) {
                     return d.edit_two
                 })



    }

    //绘图
    private redraw(){
        let svg = D3.select('svg').select('g');
        svg.select("#path"+ this.index)
            .attr("d", (d,i)=> {
                return this.line(this.map.get(this.index))
            })
            .style("stroke-dasharray", "10 5");

        //绘制圆形
        let circle = svg.selectAll("circle").data(this.map.get(this.index), (d,i)=> {
            return d;
        })
        circle.enter().append('circle')
            .attr('r',1e-2)
            .transition()
            .duration(750)
            .ease("elastic")
            .attr('r',5)
            .attr('cx',function (d) {
                return d[0]
            })
            .attr('cy',function (d) {
                return d[1]
            })

        circle.classed("selected",  (d)=> {
            return d === this.selected;
        })


        circle.exit().remove();
        svg.selectAll("circle").call(this.drag);
    }


    public createPath(index)
    {
        let that = this;
        if (!this.isDrawLine ){
            return;
        }

        if(this.map.get(this.index) == undefined){
            this.map.set(this.index,[]);
        }
        //再做一层判断 如果已经有当前路径 就不创建


        //！！每一次创建都会开辟一个新得path
        var svg = D3.select('svg').select('g')
       if((index - 1) == this.index && index !== 0){
            return
       }
        svg.append("path")
            .datum(this.map.get(this.index))
            .attr("class",'line')
            .attr("id","path" + this.index)
            .attr('stroke-width',3)
            // .on('click',function(d,i){
            //      that.indexStr = D3.select(this).attr('id');
            //
            // })
    }

    public getPoints(){
        let points = this.points;
        return points;
    }
    public  setPoint(para){
        this.points = para;
    }

    public setIsDrawLine(para){
        this.isDrawLine = para;
    }
    public fished (index){
        D3.selectAll('circle').remove();
        D3.selectAll('path').style("stroke-dasharray",null);
        // let dots = this.svg.select('g')
        //     .append('g')
        //     .attr('class',function (d,i) {
        //         console.log(d)
        //         return 'dot';
        //     })
        //    for(let i = 0;i<this.map.size();i++){
        //       let dotsCi  =  dots.append('g').attr('class','ci'+i)
        //        dotsCi.append("text").attr('class','iconfont icon-tuodong')
        //            .attr('font-family','iconfont')
        //            .attr('x',100).attr('y',100).attr('width',30).attr('height',30)
        //            .attr('fill','firebrick')
        //            .text("\ue63a")
        //    }
        //

        this.points = [];
        this.index = index ;
        this.isDrawLine = false;
        D3.selectAll('path').on('click',null);
        console.log(this.map);
    }

    public editPoint(){
        //先把isdraline  打开
       //获取到当前的编辑path的下标
        // 然后把ponit的点加进去
        let that = this;
        D3.selectAll('path').on('click',function(d,i){
           //点击完成后 不允许触发click事件

                that.indexStr = D3.select(this).attr('id');
                console.log(that.indexStr);
                that.index = parseInt(that.indexStr.slice(4,that.indexStr.length));
                that.points = that.map.get(that.index);
                that.isDrawLine = true;
                that.redraw();



        })

    }
    private  InitDrag(){
        let _this = this;
        this.drag = D3.behavior.drag()
            .origin(function (d,i) {

                return {x:d[0],y:d[1]}
            })
            .on("dragstart", (d,i)=> {
                console.log("拖拽开始")
                this.selected  = d;
                // debugger;
                if(  ( this.points.indexOf(d) == 0) && (this.points.length > 2) ) {
                    console.log("这是第一个")
                    this.points.push(d)
                    this.redraw();
                    //clo = false;
                }
                D3.event.sourceEvent.stopPropagation();
            })
            .on("dragend", (d,i)=>{
                this.selected  = d;
                this.redraw();
                D3.event.sourceEvent.stopPropagation();
                console.log("拖拽结束")
            })
            .on("drag", function(d,i) {
                console.log(D3.event.x)
                D3.select(this)
                    .attr("cx",d[0] = D3.event.x)
                    .attr("cy",d[1] = D3.event.y)
                _this.redraw();

            })
    }

    reback(){
        D3.select(window)
            .on("keydown",()=> {

                switch (D3.event.keyCode) {

                    case 8: { // delete
                        if (!this.selected){
                            return
                        }

                        let i = this.points.lastIndexOf(this.selected);

                        this.points.splice(i, 1);

                        this.selected = this.points.length ? this.points[i > 0 ? i - 1 : 0] : null;

                        this.redraw();
                        console.log('撤回')
                        break;

                    }

                }
            })
    }

}