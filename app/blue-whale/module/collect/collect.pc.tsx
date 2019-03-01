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
  private newMenuBtn: Button;//收藏夹按钮
  private _GroupName: string; //编辑分组名
  private Item: { value: string, text: string }[] = [];
  private selectVal: any; //选中的分组
  private pageUrl: string = CONF.siteUrl + "/app_sanfu_retail/null/commonui/pageroute?page=collect";
  private _menuUrl: string; //收藏块的地址
  private sel: SelectInput; 
  private _collectDom: any; //选中收藏的MenuItem
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
  set collectDom(collectDom) {
    this._collectDom = collectDom;
  }
  get collectDom() {
    return this._collectDom
  }
  //成功和取消收藏后都要去刷新右侧的星星
  refreshDom(favid?: number | string) {
    let node = this.collectDom;
    let dom = d.query(".collect_btn>.iconfont", node.wrapper) as HTMLElement;
    if (dom.classList.contains("un_collect")) {
      let newNode = d.create(`<i class="iconfont icon-shoucang_fill has_collect"/>`) as HTMLElement;
      dom.parentNode.replaceChild(newNode, dom);
      (newNode.parentNode as HTMLElement).classList.remove("un_collect_btn")
      node.content.favid = favid;
    } else {
      let newNode = d.create(`<i class="iconfont icon-shoucang un_collect"/>`) as HTMLElement;
      dom.parentNode.replaceChild(newNode, dom);
      (newNode.parentNode as HTMLElement).classList.add("un_collect_btn");
      node.content.favid = null;
    }
  }
  //取消收藏
  delete() {
    this.req_delCollect(this.collectDom.content.favid).then(() => {
      this.refreshDom();
      Modal.toast("成功取消删除");
      sys.window.refresh(this.pageUrl)
    })
  }
  // isEdit 是否编辑编
  show(isEdit?: boolean, GroupName?: string) {
    this.addCollect();
    this.appendFoot(isEdit);
    if (isEdit) {
      d.query(".colect_body_group").style.display = "none";
      d.query(".collect_body_menu").style.display = "block";
    } else {
      this.Item = [];
      d.query(".colect_body_group").style.display = "block";
      d.query(".collect_body_menu").style.display = "none";
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
            this.modal.isShow = false;
          }
        },
        {
          content: "确认",
          container: this.footer,
          className: "sure_btn",
          onClick: () => {
            let status = d.query(".new_group_btn").classList.contains("disabled")
            if (status) {
              let group = d.query("#js_new_groupName") as HTMLInputElement;
              this.req_addCollect(this.menuUrl, group.value).then(({ response }) => {
                sys.window.refresh(this.pageUrl)
                this.refreshDom(response.data[0].favid)
                Modal.toast("添加成功")
                this.modal.isShow = false;
              })
            } else {
              this.req_addCollect(this.menuUrl, this.selectVal.text).then(({ response }) => {
                sys.window.refresh(this.pageUrl)
                this.refreshDom(response.data[0].favid)
                Modal.toast("添加成功")
                this.modal.isShow = false;
              })
            }
          }
        }
      ]
      this.newMenuBtn = new Button({
        content: "新建收藏夹",
        container: this.footer,
        className: "new_group_btn",
        onClick: () => {
          d.query(".colect_body_group").style.display = "none";
          d.query(".collect_body_menu").style.display = "block";;
          d.query(".new_group_btn").classList.add("disabled");
        }
      })
      d.query(".new_group_btn").classList.remove("disabled");
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
        <input placeholder="菜单名称" type="text" class="menu_name" id="inputDom" value="" disabled />
      </div>
      <div>
        <label>收藏夹</label>
        <div class="select_comp" />
      </div>
    </div>
    this.menuItem = <div className="collect_body_menu">
      <label>名称</label>
      <input placeholder="菜单名称" type="text" class="menu_name" id="js_new_groupName" />
    </div>
    this.body = <div class="collect_pc_model_bocy">
      <div class="collect_body">
        {this.groupItem}
        {this.menuItem}
      </div>
      <div class="modal_footer" />
    </div>
    let list = d.queryAll(".modal-wrapper")
    if (list.length >= 1) {
      for (var i = 0; i < list.length; i++) {
        list[i].parentNode.removeChild(list[i])
      }
    }
    this.modal = new Modal({
      body: this.body,
      header: {
        title: '收藏',
        isDrag: false
      },
      width: '360px',
      top: 160,
    });
    let inputEl = d.query("#inputDom") as HTMLInputElement
    inputEl.value = this.GroupName;
    let select = d.query(".select_comp", this.body);
    this.req_groupName().then(({ response }) => {
      if(Array.isArray(response.data)){
        this.Item = response.data.map(item => {
          return { value: item.tag ? item.tag : "默认分组", text: item.tag ? item.tag : "默认分组" }
        })
      }else{
        this.Item=[{value:"默认分组",text:"默认分组"}]
      }
      
      if (this.sel) {
        this.sel.value = {}
        this.sel = null;
        this.selectVal = [];
      }
      this.sel = new SelectInput({
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
}