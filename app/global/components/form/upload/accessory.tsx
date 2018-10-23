/// <amd-module name="Accessory"/>

import {FormCom, IFormComPara} from "../basic";
import tools = G.tools;
import d = G.d;

export interface IFileInfo {
    type?: string;
    size?: string;
    name?: string;
    downloadUrl?: string;
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
                    <div className="uplaod"><i className="appcommon app-jia"/>添加附件</div>
                </div>
            }
        </div>;
    }

    constructor(para: IAccessory) {
        super(para);
        tools.isNotEmpty(para.files) && (this.value = para.files);
        this.initEvent.on();
    }

    // 渲染附件列表
    render(data: IFileInfo[]) {

    }

    private initEvent = (() => {
        let uplaodEt = () => {

        };

        let deleteEt = (e)=>{
            let index = parseInt(e.closest(e.target,'.accessory-item'));
            // 删除
        };

        return {
            on: () => {
                d.on(this.wrapper,'click','.uplaod',uplaodEt);
                d.on(this.wrapper,'click','.deleteBtn',deleteEt);
            },
            off: () => {
                d.off(this.wrapper,'click','.uplaod',uplaodEt);
                d.off(this.wrapper,'click','.deleteBtn',deleteEt);
            }
        }
    })();

    destroy() {
        super.destroy();
        this.initEvent.off();
    }

}