/// <amd-dependency path="D3" name="D3"/>
/// <amd-module name="DrawPoint"/>
declare const D3;
//开启描点连线功能
//开启地图放大功能以及拖动功能
//开启绘制区域功能 （） 设置区域的动画 样式 标旗 ！默认出现弹窗样式显示信息

interface IDrapPoint {
    wraperId?:string //父元素
    width:number | string
    height:number | string
    image?:string
}
export  class DrawPoint {
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


    constructor(para: IDrapPoint) {
        this.map = D3.map(this.points, function (d, i) {
            return i;
        })
        this.r = D3.scale.linear()
            .domain([1,6])
            .range([5.5,1])
        this.line = D3.svg.line();
        this.InitSvg(para)
    }

    public InitSvg(para) {
        this.svg = D3.select(para.wraperId).append('svg')
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
            console.log(d + "this")
            return d === this.selected;
        })


        circle.exit().remove();
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

       if(!(D3.select('path'+ index).empty()) && index !== 0){
            return;
       }
        //！！每一次创建都会开辟一个新得path
        var svg = D3.select('svg').select('g')

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
        this.points = [];
        this.index = index;
    }

    public editPoint(){
        //先把isdraline  打开
       //获取到当前的编辑path的下标
        // 然后把ponit的点加进去
        let that = this;
        D3.selectAll('path').on('click',function(d,i){
            that.indexStr = D3.select(this).attr('id');
            console.log(that.indexStr);
            that.index = parseInt(that.indexStr.slice(4,that.indexStr.length));
            that.points = that.map.get(that.index);
            that.isDrawLine = true;
            that.redraw();

        })

    }

}