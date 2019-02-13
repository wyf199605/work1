/// <amd-module name="CollectPage"/>
import BasicPage from "basicPage";
interface ICollectPara {
  dom?: HTMLElement,
  title?: string
}
export class CollectPage extends BasicPage {
  container: HTMLElement;
  constructor(para: ICollectPara) {
    super(para)
    this.container = para.dom;
    this.initPage();
  }
  initPage() {
    G.d.append(this.container, G.d.create("<div>测试</div>"));
  }
}