///<amd-module name="Collect"/>
import { Modal } from "global/components/feedback/modal/Modal";
import { ActionSheet } from "global/components/ui/actionSheet/actionSheet";
import { Button } from 'global/components/general/button/Button';
import { BaseCollect } from "./collect";
import tools = G.tools;
import d = G.d
interface CollectPara {
  dom: HTMLElement,
  favid: number | string,
  link: string;
}
export class Collect extends BaseCollect {
  //新增和取消收藏
  addCollect(para: CollectPara) {
    let type = tools.isEmpty(para.favid) ? 'add' : 'cancel';
    let arr = [];
    if (type == "cancel") {
      arr = [{
        content: "取消收藏",
        onClick: () => {
          this.req_delCollect(para.favid).then(response => {
            if (para.dom.parentNode.nodeName.toString() == "DIV") {
              para.dom.remove();
            } else {
              para.dom.dataset.favid = "";
            }
            Modal.toast("取消收藏成功");
          })
        }
      }]
    } else {
      arr = [{
        content: "添加收藏",
        onClick: () => {
          let arr = [
            {
              content: "取消",
              onClick: () => {
                m.isShow = false;
              }
            },
            {
              content: "确定",
              onClick: () => {
                let InputBlock = <HTMLElement>d.query(".collect_input"),
                  InputDom = <HTMLInputElement>d.query(".inp_name"),
                  SelectBlock = <HTMLSelectElement>d.query(".select_group"),
                  newval = null;
                if (InputBlock.style.display === "block") {
                  let options = SelectBlock.options;
                  let tValue = InputDom.value.trim();
                  let exist: Boolean = false;
                  for (let i = 0; i < options.length; i++) {
                    if (options[i].text == tValue) {
                      exist = true;
                    }
                  }
                  if (tValue === "") {
                    Modal.alert("内容不能为空！");
                  } else if (exist) {
                    Modal.alert("该命名已存在！");
                  } else {
                    newval = tValue;
                  }
                } else {
                  newval = SelectBlock.options[SelectBlock.selectedIndex].value;
                }
                this.req_addCollect(para.link, newval).then(({ response }) => {
                  Modal.toast("收藏成功");
                  para.dom.dataset.favid = response.data[0].favid;
                  m.isShow = false;
                })
              }
            }
          ];
          let dom = G.d.create(`
                <div class="collect_modal-body">
                    <div class="collect_select">
                        <div class="collect">
                            <select class="select_group"></select>
                            <span class="mui-icon mui-icon-plusempty add_s"></span>
                        </div>
                    </div>
                    <div class="collect_input">
                      <div class="collect">
                        <input placeholder="请输入分组名" type="text" class="inp_name">
                        <span class="mui-icon mui-icon-plusempty add_i"></span>
                      </div>
                    </div>
                </div>
          `)
          let m = new Modal({
            isOnceDestroy: true,
            header: "收藏分组",
            width: '300px',
            position: 'center',
            className: 'modal-prompt',
            body: dom,
            isMb: false,
            footer: {
              rightPanel: arr
            }
          })
          this.req_groupName().then(({ response }) => {
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
          })
          let collect_select = d.query(".collect_select")
          let collect_input = d.query(".collect_input")
          d.on(d.query(".add_s"), 'click', function () {
            collect_select.style.display = 'none';
            collect_input.style.display = 'block';

          });
          d.on(d.query(".add_i"), 'click', function () {
            collect_input.style.display = 'none';
            collect_select.style.display = 'block';
          });
        }
      }]
    }

    new ActionSheet({ buttons: arr }).isShow = true
  }
  //分组管理（重命名和删除）
  editCollectGroup(GroupName: string, HandleDOM: HTMLElement) {
    let dom = G.d.create(`
        <div class="collect_modal-body">
          <div class="mui-input-row">
               <input type="text" class="group_input">
          </div>
          <div class="group_btn"></div>
        </div>
    `)
    let m = new Modal({
      isOnceDestroy: true,
      header: "分组管理",
      width: '300px',
      position: 'center',
      className: 'modal-prompt',
      body: dom,
      isMb: false
    })
    let wrapper = d.query(".group_btn")
    let Input = <HTMLInputElement>d.query(".group_input");
    Input.value = GroupName;
    let arr = [
      {
        content: "取消",
        container: wrapper,
        onClick: () => {
          m.isShow = false
        }
      },
      {
        content: "删除",
        container: wrapper,
        className: "del_btn",
        onClick: () => {
          if (GroupName !== "") {
            Modal.confirm({
              msg: "确认删除？",
              callback: index => {
                if (index) {
                  this.req_delGroup(GroupName).then(() => {
                    HandleDOM.parentNode.parentNode.parentNode.removeChild(HandleDOM.parentNode.parentNode)
                    Modal.toast("删除成功");
                    m.isShow = false;
                  })
                }
              }
            });
          }
        }
      },
      {
        content: "重命名",
        container: wrapper,
        className: "rename_btn",
        onClick: () => {
          let renameDom = <HTMLInputElement>d.query(".group_input"),
            rename = renameDom.value.trim(),
            len = G.tools.str.utf8Len(rename);
          if (len === 0) {
            Modal.alert("命名不能为空！");
          } else if (len > 20) {
            Modal.alert("超出命名长度！");
          } else if (
            GroupName === rename ||
            (GroupName === "" && rename === "默认分组")
          ) {
            m.isShow = false;
          } else {
            this.req_rename(GroupName, rename).then(() => {
              let dataName = HandleDOM.querySelector('[data-edit="' + rename + '"]');
              let fragment = document.createDocumentFragment();
              // console.log(HandleDOM);
              // HandleDOM.previousSibling.
              HandleDOM.previousSibling.textContent = rename;
              if (dataName) {
                let liDom = HandleDOM.querySelectorAll("li[data-favid]"),
                  len = liDom.length;
                for (let i = 0; i <= len - 1; i++) {
                  fragment.appendChild(liDom[i]);
                }
                dataName.parentNode.parentNode.appendChild(fragment);
                HandleDOM.remove();
              }
              Modal.toast("重命名成功");
              m.isShow = false;
            })
          }
        }
      }
    ];
    arr.forEach(item => {
      new Button(item)
    })
  }
}
