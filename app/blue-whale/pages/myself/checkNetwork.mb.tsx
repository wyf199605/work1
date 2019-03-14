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
    let wraper = <svg id="myGauge" width="80" height="108" ></svg>
    wrapper.append(wraper)
  }
}