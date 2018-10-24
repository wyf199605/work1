/// <amd-module name="Accessory"/>

import {FormCom, IFormComPara} from "../basic";
import tools = G.tools;
import d = G.d;
import {AccessoryItem, IAccessoryItem} from "./accessoryItem";

export interface IFileInfo {
    fileSize?: number;
    fileName?: string;
    addr?: string;
}

export interface IAccessory extends IFormComPara {
    caption?: string;
    files?: IFileInfo[];
}

export class Accessory extends FormCom {
    get(): any {
        return this.value;
    }

    set(data: IFileInfo[]): void {
        this.value = data;
    }

    set value(value: IFileInfo[]) {
        this._value = value;
        this.render(value);
    }


    get value() {
        return this._value;
    }

    private accessoryBodyWrapper: HTMLElement = null;
    protected wrapperInit(para: IAccessory): HTMLElement {
        return <div className="accessory-wrapper">
            <div className="accessory-title">{para.caption || '附件'}</div>
            {
                this.accessoryBodyWrapper = <div className="accessory-body">
                    <div className="upload"><i className="appcommon app-jia"/>添加附件</div>
                </div>
            }
        </div>;
    }

    constructor(para: IAccessory) {
        super(para);
        tools.isNotEmpty(para.files) && (this.value = para.files);
        this.initEvent.on();
    }

    protected _listItems: AccessoryItem[] = [];
    get listItems(){
        return this._listItems.slice();
    }

    // 渲染附件列表
    render(data: IFileInfo[]) {
        d.diff(data, this.listItems, {
            create: (n:IFileInfo) => {
                this._listItems.push(this.createListItem({data: n}));
            },
            replace: (n:IFileInfo, o:AccessoryItem) => {
                o.render(n || {});
            },
            destroy: (o:AccessoryItem) => {
                o.destroy();
                let index = this._listItems.indexOf(o);
                if(index > -1)
                    delete this._listItems[index]
            }
        });
        this._listItems = this._listItems.filter((item) => item);
        this.refreshIndex();
    }

    refreshIndex(){
        this._listItems.forEach((item, index) => {
            item.index = index;
        });
    }

    // 实例化MvListItem
    protected createListItem(para: IAccessoryItem){
        para = Object.assign({}, para, {
            container: this.wrapper
        });
        return new AccessoryItem(para);
    }
    private initEvent = (() => {
        let uploadEt = () => {
            // let el = d.closest(<div/>,'.accessory-wrapper');
            // d.append(el,<div className="accessory-item">
            //     <div className="file-wrapper">
            //         <i className="appcommon app-wenjian"/>
            //         <div className="file-info">
            //             <div c-var="fileName" className="file-name">test.pdf</div>
            //             <div c-var="fileSize" className="file-size">89</div>
            //         </div>
            //     </div>
            //     <div className="deleteBtn">删除</div>
            // </div>);
        };

        let deleteEt = (e)=>{
            let indexEl = d.closest(e.target,'.accessory-item'),
                index = parseInt(indexEl.dataset.index);
            let value = this.value || [];
            delete value[index];
            this.value = value;
            // 删除
            indexEl.remove();
        };

        return {
            on: () => {
                d.on(this.wrapper,'click','.upload',uploadEt);
                d.on(this.wrapper,'click','.deleteBtn',deleteEt);
            },
            off: () => {
                d.off(this.wrapper,'click','.upload',uploadEt);
                d.off(this.wrapper,'click','.deleteBtn',deleteEt);
            }
        }
    })();

    destroy() {
        super.destroy();
        this.initEvent.off();
    }

}