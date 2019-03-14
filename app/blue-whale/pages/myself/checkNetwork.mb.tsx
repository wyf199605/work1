/// <amd-dependency path="D3" name="D3"/>
///<amd-module name="checkNetwork"/>
import BasicPage from "basicPage";
declare const D3;
interface pagePara {
  dom?: HTMLElement,
  title?: string
}
export class checkNetwork extends BasicPage {
  private container: HTMLElement;
  constructor(para: pagePara) {
    super(para)
    this.render(para.dom);
    D3.select("#myGauge").text("weee")
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
          <p>
            网络测速
           </p>
          <p>
            网络检查
           </p>
        </div>

      </div>
    </div>
    wrapper.append(wraper)
  }
}