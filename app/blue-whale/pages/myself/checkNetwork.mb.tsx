/// <amd-dependency path="echarts" name="echarts"/>
///<amd-module name="checkNetwork"/>
import tools = G.tools;
import CONF = BW.CONF;
import d = G.d;
import { BwRule } from "../../common/rule/BwRule";
import BasicPage from "blue-whale/pages/basicPage";
interface pagePara extends BasicPagePara{
    version : obj
}
// import { Modal } from "global/components/feedback/modal/Modal";
declare const echarts;
// interface pagePara {
//   modal: Modal
// }
export class checkNetwork {
  private submitBtn: HTMLElement;
  private myChart: any;
  private option: any;
  // private modal: Modal;
  constructor(para: pagePara) {
    // this.modal = para.modal;
    let net = d.query(".check_netWork")
    if (net) {
      net.remove();
    }
    // d.query(".modal-header", para.modal.headWrapper).style.cssText = "background-color:#005BAC!important";
    // d.query(".modal-title", para.modal.headWrapper).style.cssText = 'color:white!important';
    // d.query(".close", para.modal.headWrapper).style.cssText = 'color:white!important';
    this.render(d.query("#check-network"));
    this.event();
    this.renderCircle()
  }
  /** 事件绑定 */
  event() {
    //tab切换
    let tab = d.query("#js_tab");
    G.d.on(tab, "click", (e) => {
      let dom = e.target as HTMLElement;
      for (var i = 0; i < tab.childNodes.length; i++) {
        let item = tab.childNodes[i] as HTMLElement;
        item.classList.remove("active")
      }
      dom.classList.add("active");
      this.submitBtn.removeAttribute("disabled");
      if (dom.innerText == '网络测速') {
        this.renderCircle()
      } else {
        this.renderFullCircle();
      }
    })
    //关闭
    // G.d.on(G.d.query("#check_back"), "click", () => {

    //   this.modal.isShow = false;
    // })
    //点击测试或运行按钮
    G.d.on(this.submitBtn, "click", () => {
      this.submitBtn.setAttribute("disabled", "true");
      if (this.submitBtn.innerText === "开始测试") {
        this.submitBtn.innerText = "测试中..."
        this.networkTest();
      } else {
        this.submitBtn.innerText = "运行中..."
        this.pingTest();
      }
    })
  }
  /**网络测试 */
  networkTest() {
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
  /**ping调用壳的startPing指令 */
  pingTest() {
    let total = 0;
    this.option.title.text = total + "%";
    this.option.series.data[0].value = total;
    this.option.series.data[1].value = 100 - total;
    this.myChart.setOption(this.option, true);
    this.req_getIp().then(data => {
      G.Shell.network.startPing(data, (res) => {
        total = Math.ceil(res.data * 100);
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
        total = Math.ceil(res.data * 100);
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
  /** 从后端获取ip列表给壳 */
  req_getIp() {
    return new Promise((resolve, reject) => {
      BwRule.Ajax.fetch(CONF.ajaxUrl.pingUrl).then(({ response }) => {
        resolve(response.data)
      }).catch(err => {
        reject();
      })
    })
  }
  /**请求网络速度 */
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
  /**网络测试的仪表盘配置 */
  renderCircle() {
    let parent = G.d.query(".check_pane");
    if(parent){
      parent.innerHTML = "";
    }
    let dom = <div id="speedometer"></div>
    G.d.append(parent, dom)
    this.myChart = null;
    this.myChart = echarts.init(document.getElementById('speedometer'));
    // 指定图表的配置项和数据
    this.option = {
      series: [{
        type: 'gauge',             //类型
        min: 0,                     // 最小值 0k
        max: 10240,                   // 最大值  10M
        axisLine: {            // 坐标轴线
          show: true,        // 默认显示，属性show控制显示与否
          lineStyle: {       // 属性lineStyle控制线条样式
            color: [[0.2, 'lightgreen'], [0.4, 'orange'], [0.8, 'skyblue'], [1, '#ff4500']],  //每段的颜色
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
  /** 渲染环形ping进度条 */
  renderFullCircle() {
    let parent = G.d.query(".check_pane");
    if (parent) {
      parent.innerHTML = "";
    }
    let dom = <div id="speedometer"></div>
    G.d.append(parent, dom)
    this.myChart = null;
    this.myChart = echarts.init(document.getElementById('speedometer'));
    this.option = {
      //百分比字体样式设置
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
      //面板提示 show=false
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
      //进度条颜色
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
    G.d.query(".check_btn").innerText = "运行"
  }
  /**页面渲染 */
  render(wrapper: HTMLElement | Node) {
    //   <div className="check_Header">
    //   <span id="check_back">
    //     <i class="iconfont icon-arrow-left"></i>
    //   </span>
    //   <span>网络监控</span>
    // </div>
    let dom = <div className="check_netWork">
      <div className="check_wrap">

        <div className="check_Tab" id="js_tab">
          <p className="active">  网络测速 </p>
          <p>网络检查 </p>
        </div>
        <div className="check_pane"></div>
      </div>
      {
        this.submitBtn = <button className="check_btn">开始测试</button>
      }
    </div>
    wrapper.appendChild(dom);
  }
}




