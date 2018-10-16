/// <amd-module name="TurnPage"/>
import Component = G.Component;
import {Button} from "../../../global/components/general/button/Button";
import IComponentPara = G.IComponentPara;

interface ITurnPagePara extends IComponentPara{
    curIndex? : number,
    len : number
    onChange : (index) => void
}
export class TurnPage extends Component{
    protected wrapperInit() : HTMLElement{
        return <div class="turn-page"></div>;
    }
    private prePage : Button;
    private nextPage : Button;
    private curIndex : number;
    constructor(para : ITurnPagePara){
        super();
        let len = para.len;
        this.curIndex = G.tools.isNotEmpty(para.curIndex) && para.curIndex || 0;
        this.prePage = new Button({
            content : '上一条',
            container : this.wrapper,
            size : 'small',
            className: 'pre-page',
            onClick : () => {
                this.curIndex --;
                if(this.curIndex === 0){
                    this.prePage.disabled = true;
                }
                this.nextPage.disabled = false;
                para.onChange(this.curIndex);
            }
        });
        if(this.curIndex === 0){
            this.prePage.disabled = true;
        }


        this.nextPage = new Button({
            content : '下一条',
            container : this.wrapper,
            size : 'small',
            disabled : this.curIndex === len,
            className: 'next-page',
            onClick : () => {
                this.curIndex ++;
                if(this.curIndex === len - 1){
                    this.nextPage.disabled = true;
                }
                this.prePage.disabled = false;
                para.onChange(this.curIndex);
            }
        });

        if(this.curIndex === len - 1){
            this.prePage.disabled = true;
        }
    }
}