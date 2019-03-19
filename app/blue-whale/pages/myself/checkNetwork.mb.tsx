/// <amd-dependency path="echarts" name="echarts"/>
///<amd-module name="checkNetwork"/>
import BasicPage from "basicPage";
import tools = G.tools;
import CONF = BW.CONF;
import d = G.d;
import { BwRule } from "../../common/rule/BwRule";
import { Modal } from "global/components/feedback/modal/Modal";
declare const echarts;
interface pagePara {
  dom?: HTMLElement,
  title?: string
}
export class checkNetwork extends BasicPage {
  private testBtn: HTMLElement;
  private pingBtn: HTMLElement;
  private submitBtn: HTMLElement;
  private myChart: any;
  private option: any;
  constructor(para: pagePara) {
    super(para)
    this.render(para.dom);
    this.event();
    this.renderCircle()
  }
  /** 事件绑定 */
  event() {
    G.d.on(this.testBtn, "click", (e) => {
      let dom = e.target as HTMLElement;
      let parent = dom.parentNode.lastChild as HTMLElement;
      parent.classList.remove("active");
      dom.classList.add("active");
      this.submitBtn.removeAttribute("disabled");
      this.renderCircle()
    })
    G.d.on(this.pingBtn, "click", (e) => {
      let dom = e.target as HTMLElement;
      let parent = dom.parentNode.firstChild as HTMLElement;
      parent.classList.remove("active");
      dom.classList.add("active");
      this.submitBtn.removeAttribute("disabled");
      this.renderFullCircle();
    })
    G.d.on(G.d.query("#check_back"), "click", () => {
      BW.sys.window.back('');
    })
    G.d.on(this.submitBtn, "click", () => {
      this.submitBtn.setAttribute("disabled", "true");
      if (this.submitBtn.innerText === "开始测试") {
        this.submitBtn.innerText = "测试中..."
        this.netTest();
      } else {
        this.submitBtn.innerText = "运行中..."
        this.pingTest();
      }
    })
  }
  //网络测试
  netTest() {
    let url = tools.url.addObj(CONF.ajaxUrl.speedTest, { size: 1000 })
    let results = [];
    this.option.series[0].data[0].value = 0;
    this.myChart.setOption(this.option, true);
    for (var j = 0; j < 5; j++) {
      ((i) => {
        setTimeout(() => {
          this.req_net(url).then(num => {
            results.push(num)
            let sum = results.reduce(function (pre, cur) { return pre + cur }) / (i + 1)
            this.option.series[0].data[0].value = sum ? sum.toString().split(".")[0] : 0;
            this.myChart.setOption(this.option, true);
            if (i === 4 && (this.submitBtn.innerText !== '运行' && this.submitBtn.innerText !== '运行中...')) {
              this.submitBtn.innerText = "开始测试"
              this.submitBtn.removeAttribute("disabled");
            }
          }).catch(() => {
            if (this.submitBtn.innerText !== '运行' && this.submitBtn.innerText !== '运行中...') {
              this.submitBtn.innerText = "开始测试"
              this.submitBtn.removeAttribute("disabled");
            }
          })
        }, i * 500);
      })(j)
    }
  }
  req_net(url) {
    let startTime = new Date().getTime();
    return new Promise((resolve, reject) => {
      G.Ajax.fetch(url).then(({ response }) => {
        let size = tools.str.utf8Len(response);
        let time = new Date().getTime() - startTime;
        resolve((size / 1024) / (time / 1000))
      }).catch(err => {
        reject();
      })
    })
  }
  pingTest() {
    let total = 0
    this.req_getIp().then(data => {
      G.Shell.network.startPing(data, (res) => {
        total = res.data * 100
        if (total <= 100) {
          this.option.title.text = total + "%";
          this.option.series.data[0].value = total;
          this.option.series.data[1].value = 100 - total;
          this.myChart.setOption(this.option, true);
          if (this.submitBtn.innerText !== '测试中...' && this.submitBtn.innerText !== '网络测试') {
            this.submitBtn.innerText = "运行"
          }
          this.submitBtn.removeAttribute("disabled");
        }
      }, (res) => {
        total = res.data * 100
        if (total <= 100) {
          this.option.title.text = total + "%";
          this.option.series.data[0].value = total;
          this.option.series.data[1].value = 100 - total;
          this.myChart.setOption(this.option, true);
        }
      })
    }).catch(() => {
      if (this.submitBtn.innerText !== '测试中...' && this.submitBtn.innerText !== '网络测试') {
        this.submitBtn.innerText = "运行"
      }
      this.submitBtn.removeAttribute("disabled");
    })
  }
  req_getIp() {
    return new Promise((resolve, reject) => {
      BwRule.Ajax.fetch(CONF.ajaxUrl.pingUrl).then(({ response }) => {
        resolve(response.data)
      }).catch(err => {
        reject();
      })
    })
  }
  renderCircle() {
    let parent = G.d.query(".check_pane");
    parent.innerHTML = "";
    let dom = <div id="speedometer"></div>
    G.d.append(parent, dom)
    this.myChart = null;
    this.myChart = echarts.init(document.getElementById('speedometer'));
    // 指定图表的配置项和数据
    this.option = {
      series: [{
        type: 'gauge',
        min: 0,                     // 最小值
        max: 10240,                   // 最大值
        axisLine: {            // 坐标轴线
          show: true,        // 默认显示，属性show控制显示与否
          lineStyle: {       // 属性lineStyle控制线条样式
            color: [[0.2, 'lightgreen'], [0.4, 'orange'], [0.8, 'skyblue'], [1, '#ff4500']],
            width: 10
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {           // 分隔线
          show: true,        // 默认显示，属性show控制显示与否
          length: 16,         // 属性length控制线长
        },
        axisLabel: {
          formatter: function (v) {
            switch (v + '') {
              case '0': return '0k';
              case '1024': return '1M';
              case '2048': return '2M';
              case '3072': return '3M';
              case '4096': return '4M';
              case '5120': return '5M';
              case '6144': return '6M';
              case '7168': return '7M';
              case '8192': return '8M';
              case '9216': return '9M';
              case '10240': return '10M';
              default: return '';
            }
          },
          textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
            color: 'white'
          }
        },
        detail: { formatter: '{value}kb/s', color: 'white', fontSize: 18, padding: [80, 0, 0, 0] },
        data: [{ value: 0 }]
      }]

    }
    // 使用刚指定的配置项和数据显示图表。
    this.myChart.setOption(this.option);
    G.d.query(".check_btn").innerText = "开始测试"
  }
  renderFullCircle() {
    let parent = G.d.query(".check_pane");
    parent.innerHTML = "";
    let dom = <div id="speedometer"></div>
    G.d.append(parent, dom)
    this.myChart = null;
    this.myChart = echarts.init(document.getElementById('speedometer'));
    this.option = {
      title: {
        show: true,
        text: '0%',
        x: 'center',
        y: 'center',
        textStyle: {
          fontSize: '45',
          color: 'white',
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: "{d}%",
        show: false
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        show: false
      },
      color: ['#FD5457', '#BEE0FF'],
      series: {
        name: '',
        type: 'pie',
        radius: ['60%', '70%'],
        avoidLabelOverlap: true,
        hoverAnimation: false,
        label: {
          normal: {
            show: false,
            position: 'center'
          },
          emphasis: {
            show: false
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: [
          { value: 0, name: '' },
          { value: 100, name: '' }
        ]
      }
    };
    // 使用刚指定的配置项和数据显示图表。
    this.myChart.setOption(this.option);
    // let txt = <div className="center_txt">50%</div>
    // G.d.append(document.querySelector(".check_pane"), txt);
    G.d.query(".check_btn").innerText = "运行"
  }
  render(wrapper: HTMLElement) {
    let wraper = <div className="check_netWork">
      <div className="check_wrap">
        <div className="check_Header">
          <span id="check_back">
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
        <div className="check_pane"></div>
      </div>
      {
        this.submitBtn = <button className="check_btn">开始测试</button>
      }
    </div>
    wrapper.append(wraper);
  }
}




