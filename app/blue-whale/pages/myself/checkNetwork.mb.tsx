/// <amd-dependency path="echarts" name="echarts"/>
///<amd-module name="checkNetwork"/>
import BasicPage from "basicPage";
declare const echarts;
interface pagePara {
  dom?: HTMLElement,
  title?: string
}
export class checkNetwork extends BasicPage {
  private testBtn: HTMLElement;
  private pingBtn: HTMLElement;
  constructor(para: pagePara) {
    super(para)
    this.render(para.dom);
    this.event();
  }
  /** 事件绑定 */
  event() {
    G.d.on(this.testBtn, "click", (e) => {
      let dom = e.target as HTMLElement;
      let parent = dom.parentNode.lastChild as HTMLElement;
      parent.classList.remove("active");
      dom.classList.add("active");
    })
    G.d.on(this.pingBtn, "click", (e) => {
      let dom = e.target as HTMLElement;
      let parent = dom.parentNode.firstChild as HTMLElement;
      parent.classList.remove("active");
      dom.classList.add("active");
    })
  }
  render(wrapper: HTMLElement) {
    let wraper = <div className="check_netWork">
      <div className="check_wrap">
        <div className="check_Header">
          <span>
            <i class="iconfont icon-arrow-left"></i>
          </span>
          <span>网络监控</span>
        </div>
        <div className="check_Tab">
          {
            this.testBtn = <p className="active">  网络测速 </p>
          }
          {
            this.pingBtn = <p>网络检查 </p>
          }
        </div>
        <div className="check_pane" id="speedometer">
        </div>
      </div>

      <button className="check_btn">开始测试</button>
    </div>
    wrapper.append(wraper);
    var myChart = echarts.init(document.getElementById('speedometer'));
    // 指定图表的配置项和数据
    var option = {
      series: [{
        name: '业务指标',
        type: 'gauge',
        min: 0,
        max: 2048,
        splitNumber: 7,
        axisLabel: {
          color:"white",
          distance:8,
          formatter: function (value,i) {
            console.log(value,i)
            return value.toString().indexOf(".")>-1?value.toString().split(".")[0]:value + 'k';
          }
        },
        detail: { formatter: '{value}kb/s', color: 'white', fontSize: 18, padding: [80, 0, 0, 0] },
        data: [{ value: 45 }]
      }]

    }
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
  }
}




