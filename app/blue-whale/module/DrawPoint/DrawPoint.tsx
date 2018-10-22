/// <amd-dependency path="D3" name="D3"/>

declare const D3;
//开启描点连线功能
//开启地图放大功能以及拖动功能
//开启绘制区域功能 （） 设置区域的动画 样式 标旗 ！默认出现弹窗样式显示信息

interface IDrapPoint {
    wraperId?:string //父元素
    width:number
    height:number
}
export  class DrawPoint {
    public svg;
    public g;
    public index;
    public points = [];
    public map
    public selected
    public line;
    public r;


    constructor(para: IDrapPoint) {
        this.map = D3.map(this.points, function (d, i) {
            return i;
        })
        this.line = D3.svg.line();
        this.r = D3.scale.linear()
            .domain([1,6])
            .range([5.5,1])
        this.InitSvg(para)
    }

    public InitSvg(para) {
        this.svg = D3.select(para.wraperId).append('svg')
            .attr('width', para.width)
            .attr('height', para.height)
            .on('mousedown', this.mousedown)
        this.g = this.svg.append('g');
        this.g.append('image')//添加背景图

    }

    private mousedown() {
        var svg = D3.select('svg').select('g')

        this.points.push(this.selected = D3.mouse(svg.node()))
        console.log(this.points)
        this.map.set(this.index, this.points)
        console.log(this.map);
        this.redraw();

    }

    //绘图
    private redraw() {
        var svg = D3.select('svg').select('g')
        svg.select("#path" + this.index)
            .attr("d",  (d, i)=> {
                return this.line(this.map.get(this.index))
            })
            .style("stroke-dasharray", "10 5")
        // .on("mouseover",function(d,i){
        //     d3.select(this).style("stroke-width", 8)
        //
        //     lineSelect = true
        // })
        // .on("mouseout", function (d, i) {
        //
        //     d3.select(this).style("stroke-width", 4)
        //
        //     lineSelect = false

        // });

        var circle = svg.selectAll("circle").data(this.map.get(this.index), function (d, i) {
            return d;
        })

        circle.enter().append("circle")
            .attr("r", 1e-2)
            .transition()
            .duration(750)
            .ease("elastic")
            .attr('r', this.r(2))


        circle.classed("selected", function (d) {
            return d === this.selected;
        }).attr("cx", function (d) {
            return d[0];
        })
            .attr("cy", function (d) {
                return d[1];
            })


        circle.exit().remove();


        if (D3.event) {


            //d3.event.stopPropagation();

        }
        //svg.selectAll("circle").call(drag);

    }



    private createPath()
    {
        if(this.map.get(this.index) == undefined){
            this.map.set(this.index,[]);
        }
        console.log("创建了" + this.map.get(this.index))
        var svg = D3.select('svg').select('g')

        svg.append("path")
            .datum(this.map.get(this.index))
            .attr("class",'line')
            .attr("id","path" + this.index)
            .attr('stroke-width',3)
            .on('click',(d,i)=>{
                let indexStr = D3.select(this).attr('id');
                this.index = parseInt(indexStr.slice(4,indexStr.length));
                this.points = this.map.get(this.index);
                alert("这是区域")
            })
    }
    //开启描点
    public Drawing(){
        this.createPath();
    }
}