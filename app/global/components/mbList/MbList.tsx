/// <amd-module name="MbList"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IMbListItemPara, MbListItem, MbListItemData} from "./MbListItem";
import d = G.d;
import tools = G.tools;

export interface IMbListPara extends IComponentPara{
    data?: MbListItemData[];
    isImg?: boolean; // 是否有图片
    isMulti?: boolean;  // 是否多选
}

export class MbList extends Component{
    protected wrapperInit(){
        return <div className="mb-list-wrapper"/>;
    }
    constructor(para: IMbListPara){
        super(para);
        this._isImg = tools.isEmpty(para.isImg) ? true : para.isImg;
        this._multiple = para.isMulti || false;
        this.render(para.data || []);

        window['l'] = this;
    }

    protected _isImg: boolean;
    get isImg(){
        return this._isImg;
    }

    render(data: MbListItemData[]){
        d.diff(data, this.listItems, {
            create: (n) => {
                this._listItems.push(this.createListItem({data: n}));
            },
            replace: (n, o) => {
                o.data = n || {};
                o.render(o.data);
            },
            destroy: (o) => {
                o.destroy();
                let index = this._listItems.indexOf(o);
                if(index > -1)
                    delete this._listItems[index]
            }
        });
        this._listItems = this._listItems.filter((item) => item);
        this.refreshIndex();
    }

    delItem(index){
        let item = this._listItems[index];
        if(item){
            item.destroy();
            this._listItems.splice(index, 1);
        }
    }

    refreshIndex(){
        this._listItems.forEach((item, index) => {
            item.index = index;
        });
    }

    protected _listItems: MbListItem[] = [];
    get listItems(){
        return this._listItems.slice();
    }

    // 设置是否多选
    protected _multiple: boolean = false;
    set multiple(flag: boolean){
        if(this._multiple !== flag){
            this._multiple = flag;
            this._listItems.forEach((item, index) => {
                item.isShowCheckBox = flag;
            });
        }
    }
    get multiple(){
        return this._multiple
    }

    // 实例化MbListItem
    protected createListItem(para: IMbListItemPara){
        para = Object.assign({}, para, {
            container: this.wrapper,
            isImg: this.isImg,
            isCheckBox: this.multiple
        });
        return new MbListItem(para);
    }
}