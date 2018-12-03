/// <amd-module name="NewQueryItem"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;

export interface IQueryItem extends IComponentPara {
    filedName?: string; // 字段名称
    caption?: string; // 字段标题
    interval?: number; // 0: 文本区间 1：日期区间 2：时间区间 3:单选(key,value) 4：多选(key,value)
    optionValue?: string[][]; // 值
}

export class NewQueryItem extends Component {
    protected wrapperInit(para: IQueryItem): HTMLElement {
        return <div className="new-query-item"/>;
    }

    constructor(para: IQueryItem) {
        super(para);
        this.initTitle(para.caption);
    }

    private initTitle(caption: string) {
        let titleWrapper = <div className="new-query-item-title"><span>{caption}</span><i
            className="iconfont icon-arrow-down"/></div>;
        d.append(this.wrapper, titleWrapper);
    }
}