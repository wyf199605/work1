/// <amd-module name="CollectPage"/>
import BasicPage from "basicPage";
import { BaseCollect, dataObj } from "../../module/collect/collect";
import { Modal } from "global/components/feedback/modal/Modal";
import { CollectPC } from "../../module/collect/collect.pc"
import { BwRule } from "../../common/rule/BwRule";
import CONF = BW.CONF;
import sys = BW.sys;
import d = G.d;
interface ICollectPara {
  dom?: HTMLElement,
  title?: string
}
export class CollectPage extends BasicPage {
  container: HTMLElement;
  CollectObj: BaseCollect = new BaseCollect();
  Collect: CollectPC = new CollectPC();
  private pageUrl: string = CONF.siteUrl + "/app_sanfu_retail/null/commonui/pageroute?page=collect";
  constructor(para: ICollectPara) {
    super(para);
    this.container = para.dom;
    this.initPage();
  }
  initPage() {
    this.CollectObj.req_getFavoi({ size: 50, index: 1 }).then(res => {
      if (res.response.data) {
        let dom = <div id="collect_page_wrap">{this.render(res.response.data)}</div>
        G.d.append(this.container, dom);
        this.eventBind();
      } else {
        let dom = <div id="collect_null">
          暂无收藏内容
        </div>
        G.d.append(this.container, dom);
      }

    })
  }
  private eventBind() {
    let list = d.queryAll(".collect_li")
    list.forEach(item => {
      d.on(item, "click", (event) => {
        this.open(event.srcElement);
      })
    })
    let editList = d.queryAll(".edit_btn");
    editList.forEach(item => {
      d.on(item, "click", (event) => {
        this.open(event.srcElement, "collect_nav")
      })
    })

  }
  open(e: any, className: string = "collect_li") {
    if (e.className.toLowerCase().indexOf(className) > -1) {
      if (className == "collect_li") {
        let url = CONF.siteUrl + e.dataset.href
        sys.window.open({ url: url })
      } else {
        this.Collect.GroupName = e.childNodes[0].innerText
        this.Collect.show(true)
      }
    } else if (e.className.toLowerCase().indexOf("collect_delete") > -1) {
      Modal.confirm({
        msg: "确认删除？",
        callback: index => {
          if (index) {
            this.Collect.req_delCollect(e.parentNode.dataset.favid).then(() => {
              sys.window.refresh(this.pageUrl)
            })
          }
        }
      });

    } else if (e.parentNode) {
      this.open(e.parentNode, className)
    }
  }
  render(item: Array<dataObj>) {
    return item.map((child) => {
      return <div class="collect_block">
        <div class="collect_nav">
          <span>{child.tag}</span>
          <span class="edit_btn"></span>
        </div>
        <ul class="collect_item">
          {
            child.favs.map(menu => {
              return <li
                style="border-style: none"
                data-favid={menu.favid}
                data-href={menu.url}
                data-gps={menu.gps}
                className="collect_li"
              >
                <a>
                  <span className={`self_icon  ${menu.icon} `}></span>
                  <div className="collect_caption">{menu.caption}</div>
                </a>
                <span className="collect_delete" />
              </li>;
            })
          }
        </ul>
      </div>
    })
  }
}