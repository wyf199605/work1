namespace BW {
    import IComponentPara = G.IComponentPara;
    import Component = G.Component;
    export interface IGroupTabItemPara extends IComponentPara{
        ui?: IBW_Slave_Ui;
        ajaxData?: obj;
        autoLoad?: boolean
    }
    export abstract class AGroupTabItem extends Component{

        constructor(para: IGroupTabItemPara){
            super(para);
        }
        abstract refresh(data?: obj): Promise<any>;
        abstract btnWrapper: HTMLElement;
        abstract getData(): obj;
        abstract onDataChange: Function;
        abstract total: number;
        abstract pageUrl: string;
        abstract onRender: Function;
        editInit(fn: Function){};
    }
}