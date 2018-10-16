/// <amd-module name="HomePage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import { Tree } from "global/components/navigation/tree/Tree";

export class HomePage extends SPAPage {
    set title(str:string){
        this._title = str;
    }
    get title(){
        return this._title;
    }
    init(para, data) {
        this.title = "首页";
        this.treeInit();
    }

    protected wrapperInit() {
        return d.create(`<div class="homepage trees">
        <img src="../../img/develop/sy.jpg" alt="">
        </div>`);
    }

    private treeDataArr = [];
    private treeInit() {
        // this.treeDataArr = [
        //
        // ];
        // this.treeDataArr.forEach((value, index, arr) => {
        //     new Tree({
        //         text: arr[index].title,
        //         container: this.wrapper.querySelector('.tree' + (index + 1)),
        //         children:arr[index].content,
        //         isShowCheckBox:false,
        //         expand:true,
        //         isVirtual:false
        //     })
        // })
    }
}