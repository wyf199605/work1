/// <amd-module name="BaseCollect"/>
import { Modal } from "global/components/feedback/modal/Modal";
import { ActionSheet } from "global/components/ui/actionSheet/actionSheet";
import { Button } from 'global/components/general/button/Button';
import { BwRule } from "../../common/rule/BwRule";
import sys = BW.sys;
import tools = G.tools;
import d = G.d
export class BaseCollect {
  //新增收藏时候 拉取分组名 插入到select下
  req_groupName() {
    BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
      data2url: true,
      data: {
        action: 'tags'
      }
    }).then(({ response }) => {
      let set_s = d.query(".select_group");
      set_s.innerHTML = '';
      let len = response.data ? response.data.length : 0;
      if (len === 0) {
        let nopt = document.createElement('option');
        nopt.setAttribute('value', '默认分组');
        nopt.text = '默认分组';
        set_s.appendChild(nopt);
      }
      for (let i = 0; i <= len - 1; i++) {
        let opt = document.createElement('option');
        if (response.data[i].tag) {
          let tagg = response.data[i].tag;
          opt.setAttribute('value', tagg);
          opt.text = tagg;
        }
        else {
          opt.setAttribute('value', '');
          opt.text = '默认分组';
        }
        set_s.appendChild(opt);
      }
    });
  }
  //添加收藏  发起接口请求
  req_addCollect(link: string, modal: Modal, itemDom: HTMLElement) {
    let InputBlock = <HTMLElement>d.query(".collect_input");
    let InputDom = <HTMLInputElement>d.query(".inp_name");
    let SelectBlock = <HTMLSelectElement>d.query(".select_group");
    let newval = null;
    if (InputBlock.style.display === 'block') {
      let options = SelectBlock.options;
      let tValue = InputDom.value.trim();
      let exist: Boolean = false;
      for (let i = 0; i < options.length; i++) {
        if (options[i].text == tValue) {
          exist = true;
        }
      }
      if (tValue === '') {
        Modal.alert('内容不能为空！');
      } else if (exist) {
        Modal.alert('该命名已存在！');
      } else {
        newval = tValue;
      }
    } else {
      newval = SelectBlock.options[SelectBlock.selectedIndex].value;
    }
    BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
      type: 'POST',
      data2url: true,
      data: {
        action: 'add',
        link: link,
        tag: newval.trim()
      }
    }).then(({ response }) => {
      Modal.toast('收藏成功');
      itemDom.dataset.favid = response.data[0].favid;
      modal.isShow = false;
    });
  }
  //取消收藏
  req_delCollect(favid: string | number, itemDom: HTMLElement) {
    let ajaxData = {
      action: 'del',
      favid: favid
    }
    BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
      data: ajaxData,
      data2url: true,
      type: 'POST'
    }).then(({ response }) => {
      if (itemDom.parentNode.nodeName.toString() == "DIV") {
        itemDom.remove();
      } else {
        itemDom.dataset.favid = "";
      }
      Modal.toast('取消收藏成功');
    })
  }
  //分组重命名
  req_rename(beforeName: string, modal: Modal) {
    let renameDom = <HTMLInputElement>d.query('.group_input'),
      rename = renameDom.value.trim(),
      len = G.tools.str.utf8Len(rename);
    if (len === 0) {
      Modal.alert('命名不能为空！');
    }
    else if (len > 20) {
      Modal.alert('超出命名长度！');
    } else {
      BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
        data2url: true,
        data: {
          action: 'renameTag',
          tag: beforeName,
          rename: rename
        }
      }).then(({ response }) => {
        Modal.toast("重命名成功")
        modal.isShow = false;

      });
    }
  }
  //删除分组
  req_delGroup(beforeName: string, modal: Modal) {
    Modal.confirm({
      msg: '确认删除？',
      callback: (index) => {
        if (index) {
          BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
            data2url: true,
            data: {
              action: 'delTag',
              tag: beforeName
            }
          }).then(() => {
            Modal.toast("删除成功")
            modal.isShow = false;
          });
        }
      }
    });
  }
}