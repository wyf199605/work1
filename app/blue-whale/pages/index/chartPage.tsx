/// <amd-dependency path="echarts" name="echarts"/>
/// <amd-module name="ChartPage"/>
import BasicPage from "basicPage";
import d = G.d;
// import stackedHistogramComponnet from '../../module/chartPageComponents/stacked-histogram-component/stacked-histogram.component';
declare const echarts;


interface ICollectPara {
  dom?: HTMLElement,
  title?: string
}
export class ChartPage extends BasicPage {
  container: HTMLElement;
  constructor(para: ICollectPara) {
    super(para);
    this.container = para.dom;
    G.d.append(para.dom, this.render());
    this.stackedHistogramFn();
    // console.log(stackedHistogramComponnet())
    this.lineChartFn();
    this.areaChartFn();
  }
  render() {
    return (
        <main class="chart-page">
            <div class="main-first-part">
                <section class="first-part-section this-week">
                    <div class="mg-right-10">FIRST</div>
                    <div>second</div>
                </section>
                { this.myBaseInfoFn() }
                <section class="first-part-section common-chart">
                    <div id="stacked-histogram" style="width: 100%;height:100%"></div>
                </section>
                <section class="first-part-section common-chart">
                    <div id="line-chart" style="width: 100%;height:100%"></div>    
                </section>
                <section class="first-part-section common-chart">
                <div id="area-chart" style="width: 100%;height:100%"></div> 
                </section>
                <section class="first-part-section common-chart">4</section>
            </div>
            <div class="main-map"></div>
            <div class="main-last-part"></div>
        </main>
    )
  }
  
  myBaseInfoFn() {
      return (
        <section class="first-part-section my-base-info">
            <p class="wait-rewiew">
                <span class="base-info-span-bg iconfont icon-buoumaotubiao12">
                </span>
                <span>待审核</span>
                <span>15</span>
            </p>
            <p class="info-notice">
                <span class="base-info-span-bg iconfont icon-buoumaotubiao12">
                </span>
                <span>消息通知</span>
                <span>15</span>
            </p>
            <p class="leave-review">
                <span class="base-info-span-bg iconfont icon-buoumaotubiao12">
                </span>
                <span>请假审核</span>
                <span>15</span>
            </p>
            <p class="my-application">
                <span class="base-info-span-bg iconfont icon-buoumaotubiao12">
                </span>
                <span>我的申请</span>
                <span>15</span>
            </p>
        </section>
      )
  }

  /**
   * 柱状图
   */
  stackedHistogramFn() {
    // app.title = '堆叠柱状图';
    let stackedHistogram = echarts.init(document.getElementById('stacked-histogram'));
    const stackedHistogramOption = {
        title: {
            text: '本月经营分析',
            textStyle: {
                fontFamily: 'monospace',
                fontSize: 18,
                color: '#333'
                // fontWeight: 'bold',
                
            },
            padding: 15,
        },
        grid: {
            // top: 15,
            left: 15,
            right: 15,
            bottom: 15,
            containLabel: true
        },
        tooltip: {},
        legend: {
            data:['销量','购买力'],
            top: 15,
        },
        xAxis: {
            data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"],
            splitLine: {
                lineStyle: {
                    // 使用深浅的间隔色
                    color: '#f7f7f8'
                }, 
            },
            axisLine: {
                lineStyle: {
                    color: '#d5d5d5'
                }
            },
            axisLabel: {
                color: '#333333'
            }
        },
        
        yAxis: {
            splitLine: {
                lineStyle: {
                    // 使用深浅的间隔色
                    color: '#f7f7f8'
                }, 
            },
            axisLine: {
                lineStyle: {
                    color: '#d5d5d5'
                }
            },
            axisLabel: {
                color: '#333333'
            }
        },
        series: [
            {
                name: '销量',
                type: 'bar',
                color: '#609ee9',
                barMaxWidth: '10',
                data: [5, 20, 36, 10, 10, 20]
            },
            {
                name: '购买力',
                type: 'bar',
                color: '#f7ba2a',
                barMaxWidth: '10',
                data: [7, 18, 46, 52, 60, 16]
            },
            {
                name: '进货量',
                type: 'bar',
                color: '#39ca74',
                barMaxWidth: '10',
                data: [55, 24, 36, 33, 42, 28]
            },
    ]
    };
    // return option;
    stackedHistogram.setOption(stackedHistogramOption);
    // setTimeout(function (){
	    
    // },200)
    window.onresize = function () {
        stackedHistogram.resize();
    }
  }

  /**
   * 折线图
   */
  lineChartFn() {
    let lineChart = echarts.init(document.getElementById('line-chart'));
    const lineChartData = {
        title: {
            text: '本月经营分析',
            textStyle: {
                fontFamily: 'monospace',
                fontSize: 18,
                color: '#333'
                // fontWeight: 'bold',
                
            },
            padding: 15,
        },
        grid: {
            // top: 15,
            left: 15,
            right: 15,
            bottom: 15,
            containLabel: true
        },
        tooltip: {},
        legend: {
            data:['销量','购买力'],
            top: 15,
        },
        xAxis: {
            data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"],
            splitLine: {
                lineStyle: {
                    // 使用深浅的间隔色
                    color: '#f7f7f8'
                }, 
            },
            axisLine: {
                lineStyle: {
                    color: '#d5d5d5'
                }
            },
            axisLabel: {
                color: '#333333'
            }
        },
        
        yAxis: {
            splitLine: {
                lineStyle: {
                    // 使用深浅的间隔色
                    color: '#f7f7f8'
                }, 
            },
            axisLine: {
                lineStyle: {
                    color: '#d5d5d5'
                }
            },
            axisLabel: {
                color: '#333333'
            }
        },
        series: [
            {
                name: '销量',
                type: 'line',
                color: '#609ee9',
                lineMaxWidth: '10',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: [5, 20, 36, 10, 10, 20]
            },
            {
                name: '购买力',
                type: 'line',
                color: '#f7ba2a',
                smooth: true,
                lineMaxWidth: '10',
                symbol: 'circle',
                symbolSize: 8,
                data: [7, 18, 46, 52, 60, 16]
            },
            {
                name: '进货量',
                type: 'line',
                smooth: true,
                color: '#39ca74',
                lineMaxWidth: '10',
                symbol: 'circle',
                symbolSize: 8,
                data: [55, 24, 36, 33, 42, 28]
            },
    ]
    };
    lineChart.setOption(lineChartData);
  }

  /**
   * 折线图（背景）
   */
  areaChartFn() {
    let areaChart = echarts.init(document.getElementById('area-chart'));
    const areaChartData = {
        title: {
            text: '本月经营分析',
            textStyle: {
                fontFamily: 'monospace',
                fontSize: 18,
                color: '#333'
                // fontWeight: 'bold',
                
            },
            padding: 15,
        },
        grid: {
            // top: 15,
            left: 15,
            right: 15,
            bottom: 15,
            containLabel: true
        },
        tooltip: {},
        legend: {
            data:['销量','购买力'],
            top: 15,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"],
            splitLine: {
                lineStyle: {
                    // 使用深浅的间隔色
                    color: '#f7f7f8'
                }, 
            },
            axisLine: {
                lineStyle: {
                    color: '#d5d5d5'
                }
            },
            axisLabel: {
                color: '#333333'
            },
        },
        
        yAxis: {
            splitLine: {
                lineStyle: {
                    // 使用深浅的间隔色
                    color: '#f7f7f8'
                }, 
            },
            axisLine: {
                lineStyle: {
                    color: '#d5d5d5'
                }
            },
            axisLabel: {
                color: '#333333'
            }
        },
        series: [
            {
                name: '销量',
                type: 'line',
                color: '#609ee9',
                lineMaxWidth: '10',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: [5, 20, 36, 10, 10, 20],
                areaStyle: {}
            },
            {
                name: '购买力',
                type: 'line',
                color: '#f7ba2a',
                smooth: true,
                lineMaxWidth: '10',
                symbol: 'circle',
                symbolSize: 8,
                data: [7, 18, 46, 52, 60, 16],
                areaStyle: {}
            },
            {
                name: '进货量',
                type: 'line',
                smooth: true,
                color: '#cfdce8',
                lineMaxWidth: '10',
                symbol: 'circle',
                symbolSize: 8,
                data: [55, 24, 36, 33, 42, 28],
                areaStyle: {}
            },
    ]
    };
    areaChart.setOption(areaChartData);
  }
}