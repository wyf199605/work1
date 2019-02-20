///<amd-module name="CollectPC"/>
import { Modal } from "global/components/feedback/modal/Modal";
import { Button } from 'global/components/general/button/Button';
import { SelectInput } from "../../../global/components/form/selectInput/selectInput";
import { BaseCollect } from "./collect";
import tools = G.tools;
import d = G.d
import CONF = BW.CONF;
import sys = BW.sys;
export class CollectPC extends BaseCollect {
  private modal: Modal;//模态框
  private body: HTMLElement; //模态框body的dom
  private groupItem: HTMLElement; //分组dom
  private menuItem: HTMLElement; //菜单dom
  private footer: HTMLElement; //底部dom
  private cancelBtn: Button;
  private newMenuBtn: Button;
  private _GroupName: string;
  private Item: { value: string, text: string }[] = [];
  private selectVal: any;
  private pageUrl: string = CONF.siteUrl + "/app_sanfu_retail/null/commonui/pageroute?page=collect";
  private _menuUrl: string;
  set GroupName(groupName: string) {
    this._GroupName = groupName;
  }
  get GroupName() {
    return this._GroupName;
  }
  set menuUrl(menuUrl: string) {
    this._menuUrl = menuUrl
  }
  get menuUrl() {
    return this._menuUrl;
  }
  // isEdit 是否编辑编
  show(isEdit?: boolean, GroupName?: string) {
    this.addCollect();
    this.appendFoot(isEdit);
    if (isEdit) {
      this.groupItem.style.display = "none";
      this.menuItem.style.display = "block";
    } else {
      this.Item = [];
      this.groupItem.style.display = "block";
      this.menuItem.style.display = "none";
    }
    this.modal.isShow = true;
  }
  // isEdit 是否编辑  true: 分组管理  false: 非自身分组
  appendFoot(isEdit?: boolean) {
    let BtnList = [];
    d.query(".modal_footer", this.body).innerHTML = "";
    this.footer = d.query(".modal_footer", this.body)
    if (!isEdit) {
      BtnList = [
        {
          content: "取消",
          container: this.footer,
          className: "cancel_btn",
          onClick: () => {
            let url = CONF.siteUrl + "/app_sanfu_retail/null/commonui/pageroute?page=collect";
            sys.window.refresh(url)
            this.modal.isShow = false;
          }
        },
        {
          content: "确认",
          container: this.footer,
          className: "sure_btn",
          onClick: () => {
            // console.log(this.newMenuBtn.isDisabled)
            if (this.newMenuBtn.isDisabled) {

            } else {
              console.log(this.menuUrl)
              console.log(this.selectVal)
              this.req_addCollect(this.menuUrl, this.selectVal.text).then(() => {
                sys.window.refresh(this.pageUrl)
                this.modal.isShow = false;
              })
            }
          }
        }
      ]
      this.newMenuBtn = new Button({
        content: "新建收藏夹",
        container: this.footer,
        onClick: () => {
          this.toggleBody(true)
        }
      })
      BtnList.forEach(item => {
        new Button(item)
      })
    } else {
      let inputEl = d.query(".menu_name", this.menuItem) as HTMLInputElement;
      inputEl.value = this.GroupName
      BtnList = [
        {
          content: "删除",
          container: this.footer,
          onClick: () => {
            Modal.confirm({
              msg: "确认删除？",
              callback: index => {
                if (index) {
                  this.req_delGroup(this.GroupName).then(() => {
                    sys.window.refresh(this.pageUrl)
                    this.modal.isShow = false;
                  })
                }
              }
            });
          }
        },
        {
          content: "取消",
          container: this.footer,
          className: "cancel_btn",
          onClick: () => {
            this.modal.isShow = false;
          }
        },
        {
          content: "保存",
          container: this.footer,
          className: "sure_btn",
          onClick: () => {
            this.req_rename(this.GroupName, inputEl.value).then(() => {
              sys.window.refresh(this.pageUrl)
              this.modal.isShow = false;
            })
          }
        }
      ]
      BtnList.forEach(item => {
        new Button(item)
      })
    }
  }
  addCollect() {
    this.groupItem = <div className="colect_body_group">
      <div>
        <label>名称</label>
        <input placeholder="菜单名称" type="text" class="menu_name" id="inputDom" disabled />
      </div>
      <div>
        <label>收藏夹</label>
        <div class="select_comp" />
      </div>
    </div>
    this.menuItem = <div className="collect_body_menu">
      <label>名称</label>
      <input placeholder="菜单名称" type="text" class="menu_name" />
    </div>
    this.body = <div class="collect_pc_model_bocy">
      <div class="collect_body">
        {this.groupItem}
        {this.menuItem}
      </div>
      <div class="modal_footer" />
    </div>
    if (!this.modal) {
      this.modal = new Modal({
        body: this.body,
        header: {
          title: '收藏',
          isDrag: false
        },
        width: '360px',
        top: 160,
      });
    }
    let select = d.query(".select_comp", this.body);
    this.req_groupName().then(({ response }) => {
      this.Item = response.data.map(item => {
        return { value: item.tag ? item.tag : "默认分组", text: item.tag ? item.tag : "默认分组" }
      })
      let inputEl = d.query("#inputDom", this.groupItem) as HTMLInputElement;
      console.log(inputEl)
      console.log(this.GroupName+"------")
      inputEl.value = this.GroupName;
      new SelectInput({
        container: select,
        data: this.Item,
        readonly: true,
        clickType: 0,
        onSet: (item) => {
          this.selectVal = item;
        }
      });
    })
   

  }
  toggleBody(isGroup: boolean) {
    if (isGroup) {
      this.groupItem.style.display = "none";
      this.menuItem.style.display = "block";
      this.newMenuBtn.isDisabled = true;
    } else {
      this.groupItem.style.display = "block";
      this.menuItem.style.display = "none";
      this.newMenuBtn.isDisabled = false;
    }
  }
}