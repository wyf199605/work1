///<amd-module name="CollectPC"/>
import { Modal } from "global/components/feedback/modal/Modal";
import { Button } from 'global/components/general/button/Button';
import { SelectInput } from "../../../global/components/form/selectInput/selectInput";
import { BaseCollect } from "./collect";
import tools = G.tools;
import d = G.d
export class CollectPC extends BaseCollect {
  private modal: Modal;
  private body: HTMLElement;
  private groupItem: HTMLElement;
  private menuItem: HTMLElement;
  private footer: HTMLElement;
  private cancelBtn: Button;
  private newMenuBtn: Button;
  // isEdit 是否编辑编
  show(isEdit?: boolean) {
    if (this.modal) {
      this.appendFoot(isEdit);
      this.groupItem.style.display = "none";
      this.menuItem.style.display = "block";
      this.modal.isShow = true;
    } else {
      this.addCollect();
      this.groupItem.style.display = "none";
      this.menuItem.style.display = "block";
      this.appendFoot(isEdit);

    }
  }
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
            this.modal.isShow = false;
          }
        },
        {
          content: "确认",
          container: this.footer,
          className: "sure_btn",
          onClick: () => {
            console.log(this.newMenuBtn.isDisabled)
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
      BtnList = [
        {
          content: "删除",
          container: this.footer,
          onClick: () => {

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
          content: "确认",
          container: this.footer,
          className: "sure_btn",
          onClick: () => {
            console.log(this.cancelBtn.isDisabled)
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
        <input placeholder="菜单名称" type="text" class="menu_name" disabled />
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
    this.modal = new Modal({
      body: this.body,
      header: {
        title: '收藏',
        isDrag: false
      },
      width: '360px',
      isShow: true,
      top: 160,
    });
    let select = d.query(".select_comp", this.body);
    new SelectInput({
      container: select,
      data: [{ value: 0, text: '默认分组' }, { value: 1, text: '测试' }],
      readonly: true,
      clickType: 0,
      onSet: function (item) {

      }
    });

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