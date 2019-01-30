/// <amd-module name="BtnGroup"/>
import {DropDown, ListData} from "../dropdown/dropdown";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Button, IButton} from "../../general/button/Button";

interface IBtnGroupPara extends IComponentPara{
    container : HTMLElement;
    buttons : IButton[];
    clickHandle(btn : Btn, target? : HTMLElement);
    maxBtn? : number;//允许按钮显示的最大数量
}
export class BtnGroup extends Component{
    private dropDown : DropDown;
    constructor(para : IBtnGroupPara){
        super(para);
        this._buttons = para.buttons;
        this.maxBtn = para.maxBtn ? para.maxBtn : 999;
    }

    private _buttons : IButton[];
    private _maxBtn : number;
    get maxBtn(){
        return this._maxBtn;
    }

    set maxBtn(maxBtn : number){
        let len = this._buttons.length;
        this._buttons.forEach((btn, i) => {
            if(maxBtn > i){
                new Button(Object.assign(btn, {
                    container : this.wrapper,
                }))
            }
        });
        if(maxBtn > len){
            let moreBtn = this._buttons.slice(maxBtn, len),
                data = moreBtn.map(btn => {
                    return {
                        title : btn.content,
                        click : btn.onClick
                    }
                });
            this.dropDown = new DropDown({
                el : this.wrapper,
                inline : false,
                onSelect : (item) => {
                    this.dropDown.toggle();
                    let click = item.click;
                    typeof click === 'function' && click();
                },
                data : data,
                multi : null,
                className : "more-btn"
            })
        }
    }

    wrapperInit(para : IBtnGroupPara){
        return <div class="btn-group-container"/>
    }
}