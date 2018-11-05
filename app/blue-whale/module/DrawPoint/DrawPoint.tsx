/// <amd-dependency path="D3" name="D3"/>
/// <amd-module name="DrawPoint"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IDrawFormatData} from "../plan/planModule";
import tools = G.tools;

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
}

interface IAreaType {
    type: 'edit';
    data?: obj;
    name?: string;
}

export class DrawPoint extends Component {
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
    private guid: string;
    public zoom;
    static POINT_FIELD = '__POINT_FIELD___';
    static EVT_AREA_CLICK = '__event_draw_area_click__';
    static EVT_INSERT_DATA = '__event_insert_area_click__';
    static EVT_DELETE_DATA = '__event_delete_area_click__';
    static EVT_IMG_INIT = '__event_image_area_click__';

    protected wrapperInit() {
        return <div className="draw-point-wrapper"/>;
    }

    constructor(protected para: IDrapPoint) {
        super(para);

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
        this.ZoomStart(para);
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
            .on('mousedown', () => {
                if (!this.isDrawLine) {
                    return
                }
                this.mousedown();
                this.redraw();
            })


        this.g = this.svg.append('g').attr('class', 'g-wrapper');
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
                    D3.select(this).select('path').attr('fill', 'gold').attr('fill-opacity', 0.7)
                }).on('mouseout', function () {
                    D3.select(this).select('path').attr('fill', 'white').attr('fill-opacity', 0)
                });
            },
            off: () => {
                this.g.selectAll('g').on('click', null).on('mouseover', null).on('mouseout', null)
            }
        }
    })()

    private _data;

    public render(data?: obj[]) {
        this._data = data && data.map((obj) => Object.assign({}, obj || {}));
        //清空上一轮数据
        this.editEvent.off();
        if (!this.g.selectAll('g').empty()) {
            D3.select('.g-wrapper').selectAll('g').remove();
            D3.select('.g-wrapper').selectAll('circle').remove();
        }

        this.renderData = data;
        this.index = data.length + 1 || 0;//初始化index

        let points = [],
            svg = D3.select('svg').select('g');
        if (tools.isEmpty(data)) {
            return
        }
        data.forEach((d, index) => {
            let group = this.g.append('g').datum(d);
            let point = [];
            this.format(d)
                .sort((a) => {
                    if (a.isPoint) {
                        return -1;
                    } else {
                        return 0;
                    }
                }).forEach((data, I) => {
                //  需要用到有point的data
                if (data.isPoint) {
                    group.append('path').datum(data.name)
                        .attr("class", 'line')
                        .attr('fill', 'white')
                        .attr('fill-opacity', 0)
                        .attr("id", (d, i) => {
                            return 'path' + index;
                        })
                        .attr("d", (d, i) => {
                            point = data.data;
                            this.map.set(index, data.data)
                            return this.line(data.data)
                        })
                } else {
                    //绘字
                    let text = group.append('text').datum(data.name)
                        .attr('fill', 'black')
                        .attr('font-size', '14px')
                        .attr("text-anchor", "middle")
                        .attr('x', (d, i) => {
                            return this.findCenter(point)[0]

                        })
                        .attr('y', (d, i) => {
                            return this.findCenter(point)[1]
                        })
                        .attr('dx', 5)
                        .attr('dy', 16 * I)
                        .text(function (d) {
                            return data.data;

                        })
                }
            })

        });
        this.editEvent.on();

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
            .attr('r', 5)
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
        let that = this,
            index = this.map.size();
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
        let group = svg.append('g');
        group.append("path")
            .datum(this.map.get(this.index))
            .attr("class", 'line')
            .attr('fill', 'white')
            .attr('fill-opacity', 0)
            .attr("id", 'path' + this.index)
            .attr('stroke-width', 2)
        // .on('click',function(d,i){
        //      that.indexStr = D3.select(this).attr('id');
        //
        // })
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

    public fished() {
        let that = this;
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
        this.g.selectAll('g').attr('class', function (d) {
            if ('path' + currentIndex == D3.select(this).select('path').attr('id')) {
                return 'insert';
            }
        })
        this.points = [];
        this.index = this.map.size() + 1;
        this.isDrawLine = false;
        this.map.get(currentIndex);
        this.editEvent.on();

    }

    get editedData() {
    let update =  this.g.selectAll('.update'),
        updateStr = [];
        update.each(function (d) {
            updateStr.push(d);
        })

        return {
            insert: [],
            update: updateStr,
            delete: []
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
            that.redraw();


        }).on('mouseover', null).on('mouseout', null)

    }

    private InitDrag() {
        let _this = this;
        this.drag = D3.behavior.drag()
            .origin(function (d, i) {

                return {x: d[0], y: d[1]}
            })
            .on("dragstart", (d, i) => {
                this.selected = d;
                // debugger;
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
                D3.event.sourceEvent.stopPropagation();
            })
            .on("drag", function (d, i) {
                D3.select(this)
                    .attr("cx", d[0] = D3.event.x)
                    .attr("cy", d[1] = D3.event.y)
                _this.redraw();

            })
    }

    //回显方法！已经字段编辑 以及无字段添加 显示
    private showData(data, sl) {
        //这里要data放入更新区域
        //整个方法判断空编辑 或者已有编辑
        if (sl.selectAll('text').empty()) {
            let newDelivery = {}
            this.format(data).forEach((anl, I) => {
                if (!anl.isPoint) {
                    let text = sl.append('text').datum(anl.name)
                        .attr('fill', 'black')
                        .attr('font-size', '14px')
                        .attr("text-anchor", "middle")
                        .attr('x', (d, i) => {
                            let idStr = sl.select('path').attr('id'),
                                id = parseInt(idStr.slice(4, idStr.length))
                            return this.findCenter(this.map.get(id))[0]

                        })
                        .attr('y', (d, i) => {
                            let idStr = sl.select('path').attr('id'),
                                id = parseInt(idStr.slice(4, idStr.length))
                            return this.findCenter(this.map.get(id))[1]
                        })
                        .attr('dx', 5)
                        .attr('dy', 16 * I)
                        .text(function (d) {
                            newDelivery[d] = anl.data;
                            return anl.data;

                        })
                }
            })

            //给新增的path绑定数据
            let path = sl.select('path').attr('id'),
                i = parseInt(path.slice(4, path.length));

            newDelivery[DrawPoint.POINT_FIELD] = JSON.stringify(this.map.get(i));
            sl.datum(newDelivery);

        } else {
            //已经有文字的情况下
            let delivery = {}
            this.format(data)
                .forEach((analysis) => {
                    if (!analysis.isPoint) {
                        sl.selectAll('text').each(function (d) {

                            console.log(d)
                            if (d == analysis.name) {
                                D3.select(this).text(function () {
                                    delivery[d] = analysis.data;
                                    return analysis.data
                                })

                            }
                        })

                    }

                })
            let path = sl.select('path').attr('id'),
                i = parseInt(path.slice(4, path.length));

            delivery[DrawPoint.POINT_FIELD] = JSON.stringify(this.map.get(i));

            sl.attr('class', function (d) {
                debugger
                let num = 0;
                for (let des in delivery) {
                    if (d[des] !== delivery[des]) {
                        num++;
                    }
                }
                if (num >= 1 && D3.select(this).attr('class') !== 'insert') {
                    return 'update';
                } else {
                    return D3.select(this).attr('class');
                }
            }).datum(delivery)

        }


    }

    reback() {
        D3.select(window)
            .on("keydown", () => {

                switch (D3.event.keyCode) {

                    case 8: { // delete
                        if (!this.selected) {
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

    public OnZoom() {
        this.svg.call(this.zoom);
    }

    public ZoomStart(para) {
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
                // if(D3.event.scale > 6) {
                //     rLate = 6;
                //     lineLate = 6
                //     d3.selectAll('circle').attr('r',r(rLate));
                //     d3.selectAll('path').attr('stroke-width',l(lineLate))
                // }else{
                //     lineLate = rLate = d3.event.scale;
                //
                //     d3.selectAll('circle').attr('r',r(rLate));
                //     d3.selectAll('path').attr('stroke-width',l(lineLate))
                //
                // }
                //if(dragged ){
                D3.select('svg').select('.g-wrapper').attr('transform', "translate(" + D3.event.translate + ")" + "scale(" + D3.event.scale + ")");

                // }


            }).on("zoomend", function (d) {

                console.log("结束")
            })

    }

}