///<amd-module name="Collect"/>
import { Modal } from "global/components/feedback/modal/Modal";
import { ActionSheet } from "global/components/ui/actionSheet/actionSheet";
import { Button } from 'global/components/general/button/Button';
import {BaseCollect} from  "./collect";
import tools = G.tools;
import d = G.d
interface CollectPara {
  dom: HTMLElement,
  favid: number | string,
  link: string;
}
export class Collect extends BaseCollect {
  //新增和取消收藏
  static addCollect(para: CollectPara) {
    console.log(para.dom)
    let type = tools.isEmpty(para.favid) ? 'add' : 'cancel';
    let arr = [];
    if (type == "cancel") {
      arr = [{
        content: "取消收藏",
        onClick: () => {
          this.req_delCollect(para.favid, para.dom)
        }
      }]
    } else {
      arr = [{
        content: "添加收藏",
        onClick: () => {

          let arr = [{
            content: "取消", onClick: () => {
              m.isShow = false;
            }
          }, {
            content: "确定", onClick: () => {
              Collect.req_addCollect(para.link, m, para.dom)
            }
          }];
          let dom = G.d.create(`
                <div class="collect_modal-body">
                    <div class="collect_select">
                        <div class="collect">
                            <select class="select_group">
                              <option value="">默认分组</option>
                              <option value="">默认分组22</option>
                            </select>
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
          Collect.req_groupName();
          let collect_select = d.query(".collect_select")
          let collect_input = d.query(".collect_input")
          d.on(d.query(".add_s"), 'click', function () {
            console.log("dd")
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
  static editCollectGroup(GroupName: string) {
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
        color:"",
        onClick: () => {
          m.isShow = false
        }
      },
      {
        content: "删除",
        container: wrapper,
        className:"del_btn",
        onClick: () => {
          Collect.req_delGroup(GroupName, m)
        }
      },
      {
        content: "重命名",
        container: wrapper,
        className:"rename_btn",
        onClick: () => {
          Collect.req_rename(GroupName, m)
        }
      }
    ];
    arr.forEach(item => {
      new Button(item)
    })
  }

}
