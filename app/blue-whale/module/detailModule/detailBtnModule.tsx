/// <amd-module name="DetailBtnModule"/>

import {DetailModule} from "./detailModule";

export class DetailBtnModule extends DetailModule{
    constructor(para){
        super(para);
    }

    protected _btnWrapper: HTMLElement;
    set btnWrapper(btnWrapper: HTMLElement){

    }
    get btnWrapper(){
        return this._btnWrapper
    }
}
