/// <amd-module name="RecentPage"/>
import BasicPage from "blue-whale/pages/basicPage";
import d = G.d;
import { BwRule } from "../../common/rule/BwRule";
import CONF = BW.CONF;
import sys = BW.sys;
interface ICollectPara {
  dom?: HTMLElement,
  title?: string
}
export class CollectPage extends BasicPage {
  container: HTMLElement;
  constructor(para: ICollectPara) {
    super(para);
    this.container = para.dom;
    this.render();
  }
  private eventBind() {
    let wrap = d.query("#recent_wrap");
    d.on(wrap, "click", (e) => {
      let target: any = e.srcElement || e.target;
      while (target.tagName !== 'LI') {
        if (target.tagName === 'UL') {
          target = null
          break;
        }
        target = target.parentNode
      }
      if (target) {
        let url = CONF.siteUrl + target.dataset.href;
        // sys.window.redirect({url:url})
        // return false;
        // debugger;
        sys.window.open({ url: url })
      }

    })
  }
  render() {
    BwRule.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/v1/common/history", {
      data: { action: "query" }
    }).then(({ response }) => {
      let dom = <ul class="recent_parent" id="recent_wrap">
        {
          response.data && response.data.length > 0 ?
            response.data.map(menu => {
              return <li
                style="border-style: none"
                data-favid={menu.favid}
                data-href={menu.url}
                data-gps={menu.gps}
                className="collect_li"
              >
                <a>
                  <div className="wrap_self_icon">
                    <span className={`self_icon  ${menu.icon} `}></span>
                  </div>
                  <div className="collect_caption">{menu.caption}</div>
                </a>
              </li>;
            }) : <div className="recent_null">暂无数据</div>
        }
      </ul>
      G.d.append(this.container, dom);
      this.eventBind();
    })

  }
}
