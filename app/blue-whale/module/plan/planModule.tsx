/// <amd-module name="PlanModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {DrawPoint} from "../DrawPoint/DrawPoint";
import d = G.d;

export interface IPlanModulePara extends IComponentPara{
    ui: IBW_Plan_Table;
}

export class PlanModule extends Component{
    wrapperInit(){
        return <div className="plan-content" />;
    }

    protected draw: DrawPoint;
    protected ui: IBW_Plan_Table;


    constructor(para){
        super(para);
        let ui = this.ui = para.ui;

        this.initDraw(BW.CONF.siteUrl + ui['backGround']['dataAddr']);
    }

    protected initDraw(imageUrl: string){
        d.append(this.wrapper, <div class="plan-opera">
                <div class="back-opera" onclick={
                    ()=>{
                        let btn = d.queryAll('.plan-opera>div');
                        btn.forEach((res)=>{
                            d.classRemove(res,'custom-button');
                        });
                        let currBtn = d.query('.plan-opera>.back-opera');
                        d.classAdd(currBtn,'custom-button');

                        this.draw.reback();
                    }
                }>
                    <i className="iconfont icon-chexiao"></i><span>撤消(Backspace键)</span>
                </div>
                <div class="finsh-point" onclick={
                    () => {
                        //完成编辑--------

                        //把point 清楚
                        let paths = G.d.queryAll(".drawPage>svg>g>path");
                        console.log(paths.length);
                        console.log(this.draw.getPoints());
                        this.draw.setIsDrawLine(false);
                        this.draw.fished(paths.length);

                        let btn = d.queryAll('.plan-opera>div');
                        btn.forEach((res) => {
                            d.classRemove(res, 'custom-button');
                        });
                        let currBtn = d.query('.plan-opera>.finsh-point');
                        d.classAdd(currBtn, 'custom-button');

                    }
                }>
                    <i class="iconfont icon-wanchengbianji"><span>完成编辑</span></i>
                </div>
                <div class="miao-dian" onclick={
                    () => {
                        console.log('开始描点')
                        let btn = d.queryAll('.plan-opera>div');
                        btn.forEach((res) => {
                            d.classRemove(res, 'custom-button');
                        });

                        let currBtn = d.query('.plan-opera>.miao-dian');
                        d.classAdd(currBtn, 'custom-button');
                        //------------------开始绘图
                        let paths = G.d.queryAll(".drawPage>svg>g>path");
                        this.draw.setIsDrawLine(true);
                        this.draw.createPath(paths.length);


                    }
                }>
                    <i class="iconfont icon-maodian"><span>描点</span></i>
                </div>
                <div class="edit-dian" onclick={
                    () => {
                        console.log('开始编辑')
                        let btn = d.queryAll('.plan-opera>div');
                        btn.forEach((res) => {
                            d.classRemove(res, 'custom-button');
                        });

                        let currBtn = d.query('.plan-opera>.edit-dian');
                        d.classAdd(currBtn, 'custom-button');
                        //------------------开始绘图

                        this.draw.editPoint();


                    }
                }>
                    <i className="iconfont icon-bianjimaodian"><span>编辑描点</span></i>
                </div>
                <div>
                    <i className="iconfont icon-tuodong"><span>拖动(空格键+左击)</span></i>
                </div>
                <div>
                    <i className="iconfont icon-suofang"><span>缩放(滚轮)</span></i>
                </div>
            </div>);

        this.draw = new DrawPoint({
            wraperId: '.plan-content',
            height: 400,
            width: 700,
            image: imageUrl + "&sho_id=20"
        })
    }
}