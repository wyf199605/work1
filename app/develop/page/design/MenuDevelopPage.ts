/// <amd-module name="MenuDevelopPage"/>

import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import {OverviewModule} from "../../module/queryDevice/OverviewModule";
import {Button} from "../../../global/components/general/button/Button";
import {DVAjax} from "../../module/util/DVAjax";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {QueryDevicePage} from "./QueryDevicePage";

export class MenuDevelopPage extends SPAPage {
    protected wrapperInit(): Node {
        return d.create(`
        <div class="menu-develop">
        <div class="item"></div>
        <div class="saveBtn"></div>
</div>
        `);
    }

    static itemId: string;

    protected init(para: Primitive[], data?) {
        this.title = '目录开发';
        if (tools.isNotEmpty(data)) {
            MenuDevelopPage.itemId = data[0] || ''; // 获取传过来的itemId
        }else{
            MenuDevelopPage.itemId = '';
        }
        this.initItems();
        new Button({
            content: '保存',
            container: d.query('.saveBtn', this.wrapper),
            className: 'save',
            onClick: () => {
                let editType = 'insert';
                if (tools.isNotEmpty(MenuDevelopPage.itemId)) {
                    // 修改
                    editType = 'update';
                }
                let para = {
                    type: 'menu',
                };
                para[editType] = [this.formElementToItem()];
                DVAjax.itemQueryAjax((res)=> {
                    Modal.toast(res.msg);
                    if (editType === 'insert'){
                        this.item.allItems['itemId'].set(res.data['itemId']);
                        // this.itemId = res.data['itemId'];
                    }
                }, MenuDevelopPage.itemId, {type: 'POST', data: para});
            }
        })
    }

    private formElementToItem() {
        let obj = {};
        for (let key in this.item.allItems) {
            if (tools.isNotEmpty(this.item.allItems[key].get())) {
                obj[key] = this.item.allItems[key].get();
            } else {
                obj[key] = '';
            }
        }
        return obj;
    }

    set title(str: string) {
        this._title = str;
    }

    get title() {
        return this._title;
    }

    private item: OverviewModule;

    private initItems() {
        this.item = new OverviewModule({
            container: d.query('.item', this.wrapper)
        });
        this.item.isShow = true;
        this.item.allItems['itemId'].disabled = true;
    }
}