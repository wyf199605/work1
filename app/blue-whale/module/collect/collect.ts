/// <amd-module name="BaseCollect"/>
import { Modal } from "global/components/feedback/modal/Modal";
import { ActionSheet } from "global/components/ui/actionSheet/actionSheet";
import { Button } from "global/components/general/button/Button";
import { BwRule } from "../../common/rule/BwRule";
import sys = BW.sys;
import tools = G.tools;
import d = G.d;
import CONF = BW.CONF;
interface favsObj {
  url: string;
  caption: string;
  gps: number;
  icon: string;
  type: string;
  favid: string | number;
}
interface addResponse {
  favid: any;
}
export interface dataObj {
  tag: string;
  favs: Array<favsObj>
}
export class BaseCollect {
  //新增收藏时候 拉取分组名 插入到select下
  req_groupName() {
    BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
      data2url: true,
      data: {
        action: "tags"
      }
    }).then(({ response }) => {
      let set_s = d.query(".select_group");
      set_s.innerHTML = "";
      let len = response.data ? response.data.length : 0;
      if (len === 0) {
        let nopt = document.createElement("option");
        nopt.setAttribute("value", "默认分组");
        nopt.text = "默认分组";
        set_s.appendChild(nopt);
      }
      for (let i = 0; i <= len - 1; i++) {
        let opt = document.createElement("option");
        if (response.data[i].tag) {
          let tagg = response.data[i].tag;
          opt.setAttribute("value", tagg);
          opt.text = tagg;
        } else {
          opt.setAttribute("value", "默认分组");
          opt.text = "默认分组";
        }
        set_s.appendChild(opt);
      }
    });
  }
  //添加收藏  发起接口请求
  req_addCollect(link: string, newVal: string): Promise<{ response: { data: Array<addResponse> } }> {
    return BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
      type: "POST",
      data2url: true,
      data: {
        action: "add",
        link: link,
        tag: newVal.trim()
      }
    })
  }
  //取消收藏
  req_delCollect(favid: string | number) {
    return new Promise((resolve, reject) => {
      let ajaxData = {
        action: "del",
        favid: favid
      };
      BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
        data: ajaxData,
        data2url: true,
        type: "POST"
      }).then(({ response }) => {
        resolve(response)
      });
    })

  }
  //分组重命名
  req_rename(beforeName: string, rename: string) {
    return BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
      data2url: true,
      data: {
        action: "renameTag",
        tag: beforeName,
        rename: rename
      }
    })
  }
  //删除分组
  req_delGroup(beforeName: string) {
    return BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
      data2url: true,
      data: {
        action: "delTag",
        tag: beforeName
      }
    })

  }
  req_getFavoi(obj: { index: number, size: number }): Promise<{ response: { data: Array<dataObj> } }> {
    let ajaxData = {
      pageparams: '{"index"=' + obj.index + ', "size"=' + obj.size + '}',
      action: 'query'
    };
    return BwRule.Ajax.fetch(CONF.ajaxUrl.menuFavor, {
      data: ajaxData
    })
  }
}
