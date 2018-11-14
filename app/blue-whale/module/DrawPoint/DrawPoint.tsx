/// <amd-dependency path="D3" name="D3"/>
/// <amd-module name="DrawPoint"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IDrawFormatData} from "../plan/planModule";
import tools = G.tools;
import d = G.d;
import {SubBtnMenu} from "../contextMenu/subBtnMenu";

declare const D3;
//开启描点连线功能
//开启地图放大功能以及拖动功能
//开启绘制区域功能 （） 设置区域的动画 样式 标旗 ！默认出现弹窗样式显示信息

interface IDrapPoint extends IComponentPara {
    width: number | string
    height: number | string
    image?: string;
    format?: (data: obj) => IDrawFormatData[];
    onAreaClick?: (areaType: IAreaType) => Promise<any>;
    isShow?: boolean; // 默认false
    subButton?: R_Button[];
}

interface IAreaType {
    type: 'edit' | 'pick' | 'btn'| 'link';
    data?: obj;
    name?: string;
    content?: any;
}

export class DrawPoint extends Component {
    protected contextMenu: SubBtnMenu;
    public svg;
    public g;
    public index = 0;
    public points = [];//存入当前的信息
    public map
    public selected
    public line;
    public r;
    public isDrawLine: boolean = false;
    public indexStr;//保存当前选中的path 下标
    public drag;
    private onAreaClick: (areaType: IAreaType) => Promise<any>;
    private format;
    private renderData;
    private LV;
    private LR;
    public zoom;
    private isShowStatus:boolean;
    private tooltip ;
    protected selectedData: obj;
    static POINT_FIELD = '__POINT_FIELD___';
    static EVT_AREA_CLICK = '__event_draw_area_click__';
    // static EVT_INSERT_DATA = '__event_insert_area_click__';
    // static EVT_DELETE_DATA = '__event_delete_area_click__';
    // static EVT_IMG_INIT = '__event_image_area_click__';

    protected wrapperInit() {
        return <div className="draw-point-wrapper"/>;
    }

    constructor(protected para: IDrapPoint) {
        super(para);

        d.on(this.wrapper,'contextmenu', (e) =>{
            e.preventDefault()
        })
        //初始化右键菜单
        this.contextMenu = new SubBtnMenu({
            container:this.wrapper,
            buttons: para.subButton,
            onClick: (btn) => {
                this.onAreaClick({
                    type: 'btn',
                    data: this.selectedData,
                    content: {
                        button: btn
                    }
                });
            }
        })

        this.onAreaClick = para.onAreaClick;
        this.format = para.format;
        this.map = D3.map(this.points, function (d, i) {
            return i;
        })
        this.r = D3.scale.linear()
            .domain([1, 6])
            .range([5.5, 1])
        this.line = D3.svg.line();
        //拖动
        this.isShowStatus = para.isShow
         this.ZoomStart(para);
         this.InitDrag();
         this.InitSvg(para);
         this.LV = D3.scale.linear()
            .domain([1,6])
            .range([3,0.5]);
         this.LR = D3.scale.linear()
            .domain([1,6])
            .range([5,0.3])
        this.tooltip = D3.select(this.wrapper).append('div').attr('class','tooltip').style('opacity',0.0)
        let events = this.eventHandlers[DrawPoint.EVT_AREA_CLICK];


        events && events.forEach((f) => {
            f && f();
        });
    }

    public InitSvg(para) {
        this.svg = D3.select('.draw-point-wrapper').append('svg')
            .attr('width', para.width)
            .attr('height', para.height)
            .on('mousedown', (e) => {
                this.contextMenu.show = false;
                if (!this.isDrawLine) {
                    return
                }
                this.mousedown();
                this.redraw();
            })


        this.g = this.svg.append('g').attr('class', 'g-wrapper').attr('user-select',"none");
        this.g.append('image').attr('href', para.image).attr('width', para.width).attr('height', para.height)//添加背景图
    }

    set imgUrl(url) {

        this.g.select('image').attr('href', url).attr('width', this.para.width).attr('height', this.para.height)//添加背景图
    }

    private mousedown() {
        this.points.push(this.selected = D3.mouse(this.g.node()))
        this.map.set(this.index, this.points)
    }


    private editEvent = (() => {
        let self = this;
        return {
            on: () => {
                this.g.selectAll('g').on('click', function (d, i) {
                    self.onAreaClick && self.onAreaClick({
                        type: 'edit',
                        data: d
                    }).then((data) => {
                        self.showData(data, D3.select(this))
                    })
                }).on('mouseover', function (d, i) {
                    D3.select(this).select('path').attr('fill', 'gold').attr('fill-opacity', 0.5)
                }).on('mouseout', function () {
                    D3.select(this).select('path').attr('fill', 'white').attr('fill-opacity', 0)
                });
            },
            off: () => {
                this.g.selectAll('g').on('click', null).on('mouseover', null).on('mouseout', null)
            }
        }
    })()

    //点击取消
   public editCancel(){
       this.g.attr('cursor','default')
        this.render(this._data);
    }

    //点击编辑
    public editOpen(){
        this.g.attr('cursor','pointer')
        this.editEvent.on();
    }

    //点击删除整个
    public delArea(){

    }

    private _data;

    public render(data?: obj[]) {

        let that = this;
        this._data = data && data.map((obj) => Object.assign({}, obj || {}));
        //清空上一轮数据
        this.selectedG = null;
        this.editEvent.off();
        this.keyDownEvent.off();
        this.isDrawLine = false;
        this.points = [];
        //如果为false 则为展示状态  （增加小图标，显示边框 ，区域颜色）

        let size = this.map.size();
        for(let i = 0; i <= size; i++){
            this.map.remove(i)
        }
        if (!this.g.selectAll('g').empty()) {
            D3.select('.g-wrapper').selectAll('g').remove();
            D3.select('.g-wrapper').selectAll('circle').remove();
        }

        this.renderData = data;
        this.index = data.length || 0;//初始化index
        this.keyDownEvent.on();
        this.keyUpEvent.on();
        this.fishe = true;

        let points = [],
            svg = D3.select('svg').select('g');
        if (tools.isEmpty(data)) {
            return
        }
        //this.g.selectAll('g').data(data).enter().append('g').html().exit().remove();
        data.forEach((d, index) => {
            let group = this.g.append('g').datum(d).on('contextmenu',()=>{
                if(this.isShowStatus){
                    this.selectedData = d
                    D3.event.preventDefault();
                    console.log(D3.mouse(this.svg.node()));
                    let x = D3.mouse(this.svg.node())[0],y = D3.mouse(this.svg.node())[1]
                    this.contextMenu.setPosition(x,y);
                    this.contextMenu.show = true;
                }
            });

            let point = [],
                I = 0,
                toolData = [];
            this.format(d)
                .sort((a) => {
                    if (a.isPoint) {
                        return -1;
                    } else {
                        return 0;
                    }
                }).forEach((data) => {
                //  需要用到有point的data
                if (data.isPoint && data.data) {
                        group.append('path').datum(data.name)
                            .attr("class", 'line')
                            .attr('fill', 'white')
                            .attr('style',function (d) {
                                if(!data.isShow && that.isShowStatus){
                                    return 'stroke:none';
                                }else {
                                    return 'stroke:teeblue';
                                }
                            })
                            .attr('fill-opacity', 0)
                            .attr("id", (d, i) => {
                                return 'path' + index;
                            })
                            .attr("d", (d, i) => {
                                point = data.data;
                                this.map.set(index, data.data)
                                return that.line(data.data)
                            })
                        // 判断是否是编辑状态
                        //显示边框 以及 背景颜色
                        if(this.isShowStatus){
                            this.InitIcon(group,point);

                        }

                } else if(data.isShow && tools.isNotEmpty(data.data) && tools.isNotEmpty(point)){

                    //绘字
                         I++;
                         // if(I > 1){
                         //     return
                         // }
                    let text = group.append('text').datum(data.name)
                        .attr('fill', 'black')
                        .attr("text-anchor", "middle")
                        .attr('x', (d, i) => {
                            return this.findCenter(point)[0]

                        })
                        .attr('y', (d, i) => {
                            return this.findCenter(point)[1] - 15;
                        })
                        .attr('dx', 5)
                        .attr('dy', 15)
                        .text(function (d) {
                            toolData.push(data.data)
                            return data.data;

                        }) .attr('font-size', function (d) {
                            let w = group.select('path').node().getBBox().width,g = group.select('path').node().getBBox().height;
                            console.log(w,g)
                            let size = parseInt(w)* parseInt(g)+ '',
                                val = parseInt(w) * parseInt(g),
                                font;
                            if(val < 1000){
                                font = 2;
                            }else if(val > 10000){
                               font = 16;
                            }
                            else{
                                font = Math.floor(val/(Math.pow(10,size.length - 1)))
                            }

                            return font + "px"
                        }).on('mouseover',function (d) {
                            let str = '';
                            for(let i = 0; i < I; i++){
                                  str += (toolData[i] + "<br/>");
                            }
                            that.tooltip.html(str)
                                .style('left',(D3.mouse(that.svg.node())[0]) + 'px')
                                .style('top',(D3.mouse(that.svg.node())[1]) + 'px')
                                .style('opacity',1.0)
                        }).on('mouseout',function (d) {
                            that.tooltip.style('opacity',0);
                        })
                        .style("pointer-events",()=>{
                            if(this.isDrawLine){
                              return 'none'
                            }else {
                                return 'auto'
                            }
                        }).attr('display',function (d) {
                            if(I > 1){
                                return 'none'
                            }
                        });
                }else if(tools.isNotEmpty(data.bgColor) && this.isShowStatus){
                    //并且是查看状态下
                    group.select('path').attr('fill',function (d) {
                        return data.bgColor;
                    }).attr('fill-opacity',function (d) {
                        return '0.56'
                    })
                }
            })

        });
        //this.editEvent.on();

    }
    private setIconPos(str){
        let max = 0,maxStr = [];
        if (str.length >= 0) {
            for (let i = 0; i < str.length; i++) {
                //先找最高点或者最低点(右边 )
                 max =  str[i][0] + str[i][1];
                 maxStr.push(max)
            }

           let val = Math.min(...maxStr),
              index =  maxStr.indexOf(val)
            return str[index];

        }

    }

    private InitIcon(group,points){
        let x = this.setIconPos(points)[0],
            y = this.setIconPos(points)[1];
        group.append("text").attr('class','iconfont icon-dianpubiaoji')
            .attr('font-family','iconfont')
            .attr('x',()=>{
              return x;
            }).attr('y',()=>{
            return y;
        }).attr('width',35).attr('height',35)
            .attr('fill','#666666')
            .text("\ue6e1")
            .on('mouseover',function (d) {
               D3.select(this).transition().attr('y',y+4).ease("bounce");
            }).on('mouseout',function (d) {
            D3.select(this).transition().attr('y',y).ease("bounce");
            }).on('click', tools.pattern.throttling((d)=> {
               console.log(D3.event);
             this.onAreaClick({
                 type:'pick',
                 data:this._data

             }).then((data)=>{
                 alert(data)
             })
        }, 1000))
    }


    private OnDragText(){
        this.selectedG.selectAll('text').remove();
        let w = this.selectedG.node().getBBox().width,g = this.selectedG.node().getBBox().height;
        this.selectedG.attr('id', (data)=>{
                let point = this.map.get(this.index),
                    I = 0;
                this.format(data)
                    .sort((a) => {
                        if (a.isPoint) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }).forEach((data) => {
                    //  需要用到有point的dataif (data.isPoint) {
                    if(data.isShow && tools.isNotEmpty(data.data) && !data.isPoint){
                        //绘字
                        I++;
                        if(I > 1){
                            return
                        }
                        let text = this.selectedG.append('text').datum(data.name)
                            .attr('fill', 'black')
                            .attr('font-size', function () {
                                let size = parseInt(w)* parseInt(g)+ '',
                                    val = parseInt(w) * parseInt(g),
                                    font;
                                if(val < 1000){
                                    font = 2;
                                }else if(val > 10000){
                                    font = 16;
                                }
                                else{
                                    font = Math.floor(val/(Math.pow(10,size.length - 1)))
                                }
                                return font + "px"
                            })
                            .attr("text-anchor", "middle")
                            .attr('x', (d, i) => {
                                return this.findCenter(point)[0]

                            })
                            .attr('y', (d, i) => {
                                return this.findCenter(point)[1] - 15;
                            })
                            .attr('dx', 5)
                            .attr('dy', 15)
                            .text(function (d) {
                                return data.data;

                            })
                    }
                })

            });

    }

    //find图形中心点的位置
    private findCenter(str) {
        let y, x;
        let rightStr = [], leftStr = [];

        if (str.length >= 0) {
            for (let i = 0; i < str.length; i++) {
                //先找最高点或者最低点(右边 )
                rightStr.push(str[i][1])
                leftStr.push(str[i][0])
            }

        }

        y = (Math.max(...rightStr) + Math.min(...rightStr)) / 2;

        x = (Math.min(...leftStr) + Math.max(...leftStr)) / 2;

        return [x, y]
    }

    //绘图
    private redraw() {
        let svg = D3.select('svg').select('.g-wrapper');
        svg.selectAll('g').select('#path' + this.index)
            .attr("d", (d, i) => {
                return this.line(this.map.get(this.index))
            })
            .style("stroke-dasharray", "10 5");

        //绘制圆形
        let circle = svg.selectAll("circle").data(this.map.get(this.index), (d, i) => {
            return d;
        })
        circle.enter().append('circle')
            .attr('r', 1e-2)
            .transition()
            .duration(750)
            .ease("elastic")
            .attr('r', this.LR(this.rLate))
            .attr('cx', function (d) {
                return d[0]
            })
            .attr('cy', function (d) {
                return d[1]
            })

        circle.classed("selected", (d) => {
            return d === this.selected;
        })


        circle.exit().remove();
        svg.selectAll("circle").call(this.drag);
    }


    public createPath() {
        let that = this
        if (!this.isDrawLine) {
            return;
        }

        if (this.map.has(this.index)) {
            return
        }
        if (this.map.get(this.index) == undefined) {
            this.map.set(this.index, []);
        }
        this.editEvent.off();
        //！！每一次创建都会开辟一个新得path
        var svg = D3.select('svg').select('.g-wrapper')
        let group = svg.append('g').attr('class',function (d) {
            return 'insert'
        });

        group.append("path")
            .datum(this.map.get(this.index))
            .attr("class", 'line')
            .attr('fill', 'white')
            .attr('fill-opacity', 0)
            .attr("id", 'path' + this.index)
            .attr('stroke-width', this.lineLate)
        // .on('click',function(d,i){
        //      that.indexStr = D3.select(this).attr('id');
        //
        // })
        this.fishe = false;
    }

    public getPoints() {
        let points = this.points;
        return points;
    }

    public setPoint(para) {
        this.points = para;
    }

    public setIsDrawLine(para) {
        this.isDrawLine = para;
    }
   private fishe:boolean;

    public editFished(){

        let that = this;
        D3.selectAll('circle').remove();
        D3.selectAll('path').style("stroke-dasharray", null);
        let currentIndex = this.index;
        console.log(that.selectedG);

        // that.selectedG && (that.selectedG.attr('class') !== 'insert') && that.selectedG.attr('id',function (d) {
        //     d[DrawPoint.POINT_FIELD] = JSON.stringify(that.map.get(currentIndex));
        // })
        if(that.selectedG){
            if(that.selectedG.attr('class') !== 'insert'){
                that.selectedG.attr('id',function (d) {
                    if(d){
                        d[DrawPoint.POINT_FIELD] = JSON.stringify(that.map.get(currentIndex));
                    }
                })
            }
        }

        this.points = [];
        this.index = this.map.size() + 1;
        this.isDrawLine = false;
        this.map.get(currentIndex);
        this.editEvent.off();
        this.fishe = true;
        that.selectedG = null;

    }


    public fished() {
        let that = this;
        that.selectedG = null;
        D3.selectAll('circle').remove();
        D3.selectAll('path').style("stroke-dasharray", null);
        let currentIndex = this.index;
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
        this.index = this.map.size() + 1;
        this.isDrawLine = false;
       // this.map.get(currentIndex);
        this.editEvent.off();
        this.fishe = true;

    }

    get editedData() {
        this.g.attr('cursor','default')
        let update = this.g.selectAll('.update'),
            updateStr = [];
        update.each(function (d) {
            updateStr.push(d);
        })
        let insert = this.g.selectAll('.insert'),
            insertStr = [];
        insert.each(function (d) {
            insertStr.push(d);
        })

        let del = this.g.selectAll('.delete'),
            delStr = [];
        del.each(function (d) {
            delStr.push(d);
        })

        return {
            insert: insertStr,
            update: updateStr,
            delete: delStr
        }
    }

    public editPoint() {
        //先把isdraline  打开
        //获取到当前的编辑path的下标
        // 然后把ponit的点加进去
        let that = this;
        this.g.selectAll('g').on('click', function (d, i) {
            //点击完成后 不允许触发click事件
            that.indexStr = D3.select(this).select('path').attr('id');

            that.index = parseInt(that.indexStr.slice(4, that.indexStr.length));
            that.points = that.map.get(that.index);
            that.isDrawLine = true;
            this.fishe = false;
            that.redraw();
            that.selectedG = D3.select(this);
            D3.select(this).attr('class',function (d) {
               // d[DrawPoint.POINT_FIELD] = JSON.stringify(that.map.get(that.index));
                let clas =  D3.select(this).attr('class');
                if(clas !== 'insert' || clas == null){
                    return 'update';
                }else {
                    return clas;
                }
            })

        }).on('mouseover', null).on('mouseout', null)

    }

    protected selectedG;

    private InitDrag() {
        let _this = this;
        this.drag = D3.behavior.drag()
            .origin(function (d, i) {

                return {x: d[0], y: d[1]}
            })
            .on("dragstart", (d, i) => {
                this.selected = d;
                if ((this.points.indexOf(d) == 0) && (this.points.length > 2)) {
                    this.points.push(d)
                    this.redraw();
                    //clo = false;
                }
                D3.event.sourceEvent.stopPropagation();
            })
            .on("dragend", (d, i) => {
                this.selected = d;
                this.redraw();
                //this.selectedG && (this.showData(this._data,this.selectedG));
                if(_this.selectedG){
                    let val = _this.selectedG.attr('class');
                    if(val !== 'insert'){
                        _this.OnDragText();
                    }
                }
                D3.event.sourceEvent.stopPropagation();
            })
            .on("drag", function (d, i) {
                D3.select(this)
                    .attr("cx", d[0] = D3.event.x)
                    .attr("cy", d[1] = D3.event.y)
                _this.redraw();
                D3.event.sourceEvent.stopPropagation();
            })
    }

    //回显方法！已经字段编辑 以及无字段添加 显示
    private showData(data, sl) {
        //这里要data放入更新区域
        //整个方法判断空编辑 或者已有编辑
        let w = sl.node().getBBox().width,g = sl.node().getBBox().height;
        sl.selectAll('text').remove();
        let index = 0;
            this.format(data).forEach((anl, I) => {
                console.log(anl);
                if (!anl.isPoint && tools.isNotEmpty(anl.data) && anl.isShow) {
                    index++;
                    let text = sl.append('text').datum(anl.name)
                        .attr('fill', 'black')
                        .attr('font-size', function (d) {
                            let size = parseInt(w)* parseInt(g)+ '',
                                val = parseInt(w) * parseInt(g),
                                font;
                            if(val < 1000){
                                font = 2;
                            }else if(val > 10000){
                                font = 16;
                            }
                            else{
                                font = Math.floor(val/(Math.pow(10,size.length - 1)))
                            }
                                 return font + "px"

                        })
                        .attr("text-anchor", "middle")
                        .attr('x', (d, i) => {
                            let idStr = sl.select('path').attr('id'),
                                id = parseInt(idStr.slice(4, idStr.length))
                            return this.findCenter(this.map.get(id))[0]

                        })
                        .attr('y', (d, i) => {
                            let idStr = sl.select('path').attr('id'),
                                id = parseInt(idStr.slice(4, idStr.length))
                            return this.findCenter(this.map.get(id))[1] - 20;
                        })
                        .attr('dx', 5)
                        .attr('dy', 16 * index)
                        .text(function (d) {
                            return anl.data;

                        })
                }
            })

            //给新增的path绑定数据
            let path = sl.select('path').attr('id'),
                i = parseInt(path.slice(4, path.length));

            data[DrawPoint.POINT_FIELD] = JSON.stringify(this.map.get(i));
            sl.datum(data);
            let cla = sl.attr('class');
            sl.attr('class', function (d) {
                if(cla == 'insert'){
                    return 'insert'
                }else {
                    return 'update'
                }
            })

        }



    //键盘事件的关闭和开启
    private keyUpEvent = (()=>{
        let self = this;
        return {
            on:()=>{
                D3.select(window)
                    .on("keyup", () => {
                        switch (D3.event.keyCode) {
                            case 16:{
                                //继续开启描点操作
                                //如果是已完成状态就不开启
                                if(!self.fishe){
                                    self.isDrawLine = true;
                                }
                                self.g.attr('cursor','defalut')
                                D3.select('svg').on('.zoom',null)
                            }
                        }
                    })
            }
        }
    })()

    private  keyDownEvent = (() => {
        let self = this;
        return {
            on: () => {
                D3.select(window)
                    .on("keydown", () => {

                        switch (D3.event.keyCode) {

                            case 90: { // delete
                                if(D3.event.ctrlKey){
                                    if (!this.selected) {
                                        return
                                    }

                                    let i = this.points.lastIndexOf(this.selected);

                                    this.points.splice(i, 1);

                                    this.selected = this.points.length ? this.points[i > 0 ? i - 1 : 0] : null;

                                    this.redraw();
                                    console.log('撤回')
                                }

                                break;

                            }
                            case 8:{
                                //关闭描点操作
                                //如果是insert的状态就是真删，如果是其他的就是DISPLAY='NONE'
                                this.selectedG && this.selectedG.attr('class','delete').attr('display','none');
                                this.map.set(this.index,[]);
                                this.points = [];
                                this.isDrawLine = false;
                                D3.selectAll('circle').remove();
                                break;
                            }
                            case 16:{
                                //暂停描点操作
                                self.isDrawLine = false;
                                self.g.attr('cursor','move')
                                self.OnZoom();
                                break;
                            }

                        }
                    })
            },
            off: () => {
                D3.select(window)
                    .on("keydown", null)
            }
        }
    })()


    reback() {
        this.keyDownEvent.on()
    }

    public OnZoom() {
        this.svg.call(this.zoom);
    }

    private rLate = 1;
    private lineLate = 3;
    public ZoomStart(para) {
        let _this = this;
        let X = D3.scale.linear()
                .domain([0, para.width])
                .range([0, para.width]),
            Y = D3.scale.linear()
                .domain([0, para.height])
                .range([0, para.height]);

        this.zoom = D3.behavior.zoom()
            .x(X)
            .y(Y)
            .scaleExtent([1, 10])
            .on('zoomstart', function () {
                D3.select("svg").on("dblclick.zoom", null);
            })
            .on('zoom', function (d) {
                if(D3.event.scale > 6) {

                    D3.selectAll('circle').attr('r',_this.LR(6));
                    D3.selectAll('path').attr('stroke-width',_this.LV(6))
                }else{
                    _this.rLate = _this.lineLate = D3.event.scale;

                    D3.selectAll('circle').attr('r',_this.LR(_this.rLate));
                    _this.g.selectAll('path').attr('stroke-width',_this.LV(_this.lineLate));

                }
                   console.log(D3.event.scale);
                       D3.select('svg').select('.g-wrapper').attr('transform', "translate(" + D3.event.translate + ")" + "scale(" + D3.event.scale + ")");


            }).on("zoomend", function (d) {

                console.log("结束")
            })

    }

}