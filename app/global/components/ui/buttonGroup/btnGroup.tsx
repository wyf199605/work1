/// <amd-module name="BtnGroup"/>
import { DropDown, ListData } from "../dropdown/dropdown";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import { Button, IButton } from "../../general/button/Button";

interface IBtnGroupPara extends IComponentPara {
  container: HTMLElement;
  buttons: IButton[];
  maxBtn?: number;//允许按钮显示的最大数量
}
export class BtnGroup extends Component {
  private dropDown: DropDown;
  constructor(para: IBtnGroupPara) {
    super(para);
    console.log(para)
    this._buttons = para.buttons;
    this.maxBtn = para.maxBtn ? para.maxBtn : 999;
  }

  private _buttons: IButton[];
  private _maxBtn: number;
  get maxBtn() {
    return this._maxBtn;
  }

  set maxBtn(maxBtn: number) {
    let len = this._buttons.length;
    this._buttons.forEach((btn, i) => {
      if (maxBtn > i) {
        new Button(Object.assign(btn, {
          container: this.wrapper,
        }))
      }
    });

    if (len > maxBtn) {
      let moreBtn = this._buttons.slice(maxBtn, len);
      let data = moreBtn.map(btn => {
        return {
          title: btn.content,
          click: btn.onClick
        }
      });
      let redundantList:ListItem[] = [];
      moreBtn.forEach(item => {
        redundantList.push({text:item.content})
      })
      let more = new Button(Object.assign({ content: "更多" }, {
        container: this.wrapper,
        onClick: () => {
          if (!this.dropDown) {
            this.dropDown = new DropDown({
              el: more.wrapper,
              inline: false,
              onSelect: (item) => {
                this.dropDown.toggle();
                let click = item.click;
                typeof click === 'function' && click();
              },
              data: redundantList,
              multi: false,
              className: "more-btn"
            });
          } else {
            this.dropDown.toggle()
          }
        }
      }))

      // let ss=<div>xx</div>
      // G.d.append(d.query('.btn-group-container'),ss)

    }
  }

  wrapperInit(para: IBtnGroupPara) {
    return <div class="btn-group-container">
      <div className="Btn_Group">

      </div>

    </div>


  }
}