/// <amd-module name="PlanModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {DrawPoint} from "../DrawPoint/DrawPoint";
import d = G.d;
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import {LayoutImage} from "../../../global/components/view/LayoutImg/LayoutImage";
import CONF = BW.CONF;
import {Button, IButton} from "../../../global/components/general/button/Button";

export interface IPlanModulePara extends IComponentPara{
    ui: IBW_Plan_Table;
}

export class PlanModule extends Component{

    wrapperInit(){
        let buttons: IButton[] = [
            {
                content: '撤销',
                icon: 'chexiao',
                color: 'error',
                tip: 'Backspace键',
                onClick: () => {
                    let btn = d.queryAll('.plan-opera>div');
                    btn.forEach((res)=>{
                        d.classRemove(res,'custom-button');
                    });
                    let currBtn = d.query('.plan-opera>.back-opera');
                    d.classAdd(currBtn,'custom-button');

                    this.draw.reback();                },
            },
            {
                content: '完成编辑',
                icon: 'wanchengbianji',
                color: 'success',
                onClick: () => {
                    //完成编辑--------

                    //把point 清楚
                    let paths = G.d.queryAll(".drawPage>svg>g>path");

                    console.log(this.draw.getPoints());
                    this.draw.setIsDrawLine(false);
                    this.draw.fished(paths.length);

                    let btn = d.queryAll('.plan-opera>div');
                    btn.forEach((res) => {
                        d.classRemove(res, 'custom-button');
                    });
                    let currBtn = d.query('.plan-opera>.finsh-point');
                    d.classAdd(currBtn, 'custom-button');
                },
            },
            {
                content: '描点',
                icon: 'maodian',
                color: 'info',
                onClick: () => {
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
                },
            },
            {
                content: '编辑描点',
                icon: 'bianjimaodian',
                color: 'info',
                onClick: () => {
                    console.log('开始编辑')
                    let btn = d.queryAll('.plan-opera>div');
                    btn.forEach((res) => {
                        d.classRemove(res, 'custom-button');
                    });

                    let currBtn = d.query('.plan-opera>.edit-dian');
                    d.classAdd(currBtn, 'custom-button');
                    //------------------开始绘图

                    this.draw.editPoint();
                },
            },
            {
                content: '拖动',
                icon: 'tuodong',
                color: 'info',
                tip: "空格键+左击",
                onClick: () => {
                },
            },
            {
                content: '缩放',
                icon: 'suofang',
                color: 'info',
                tip: '滚轮',
                onClick: () => {
                },
            },
            {
                content: '保存',
                icon: 'baocun',
                color: 'success',
                onClick: () => {
                },
            }
        ];

        return <div className="plan-content">
            <div class="plan-opera">
                {this.buttons = buttons.map(btn => new Button(btn))}
            </div>
        </div>;
    }

    protected buttons: Button[];
    protected draw: DrawPoint;
    protected ui: IBW_Plan_Table;
    protected ajax = new BwRule.Ajax();

    constructor(para: IPlanModulePara){
        super(para);
        let ui = this.ui = para.ui;

        this.initDraw(BW.CONF.siteUrl + ui['backGround']['dataAddr']);
    }

    protected initDraw(imageUrl: string){
        let ui = this.ui,
            cols = ui.cols;

        this.draw = new DrawPoint({
            height: 500,
            width: 800,
            image: imageUrl + "&sho_id=20",
            container: this.wrapper,
            format: (data: obj) => {
                let res: obj[] = [];
                cols && cols.forEach((col) => {
                    let name = col.name;
                    if(data[name]){
                        res.push(this.format(col, data[name], data));
                    }
                });
                return res;
            }
        });

        this.draw.on(DrawPoint.EVT_AREA_CLICK, () => {

        });
    }

    protected bgPicture: string;
    protected setBackground(obj: obj){
        let backGround = this.ui.backGround;
        if(backGround){
            let url = BwRule.reqAddr(backGround, obj);
            if(url != this.bgPicture){
                this.bgPicture = url;
                console.log(url);

                // TODO 设置drawPoint图片
            }
        }
    }

    static initQueryParams(data: obj){
        if(tools.isEmpty(data)){
            return void 0;
        }
        let params = [];
        for(let key in data){
            params.push({
                field: key.toUpperCase(),
                values: [data[key]],
                not: false,
                op: 2
            });
        }
        return JSON.stringify({
            queryparams1: {"not":false, "op":0, "params": params}
        });
    }

    refresh(ajaxData?: obj){
        let ui = this.ui,
            url = CONF.siteUrl + BwRule.reqAddr(ui.dataAddr);
        this.setBackground(ajaxData);

        this.ajax.fetch(tools.url.addObj(url, {nopage: true}), {
            needGps: ui.dataAddr.needGps,
            timeout: 30000,
            data: PlanModule.initQueryParams(ajaxData)
        }).then(({response}) => {
            console.log(response);
        }).catch(e => {
            console.log(e);
        })
    }

    format(field: R_Field, cellData: any, rowData: obj): obj{
        let text: string | Node = cellData, // 文字 或 Node
            name = field.name,
            show = !field.noShow,
            color: string,                  // 文字颜色
            bgColor: string,                // 背景颜色
            classes: string[] = [];         // 类名
        if (field && !field.noShow && field.atrrs) {
            let dataType = field.atrrs.dataType,
                isImg = dataType === BwRule.DT_IMAGE;

            if (isImg && field.link) {
                // 缩略图
                // let url = tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(field.link, rowData), this.ajaxData);
                // text = <img src={url}/>;
                // classes.push('cell-img');

            } else if (dataType === BwRule.DT_MUL_IMAGE) {
                // 多图缩略图
                if (typeof cellData === 'string' && cellData[0]) {
                    // url生成
                    let urls = cellData.split(',')
                        .map(md5 => BwRule.fileUrlGet(md5, field.name, true))
                        .filter(url => url);

                    // 多图缩略图控件
                    if (tools.isNotEmptyArray(urls)) {
                        text = new LayoutImage({urls}).wrapper;
                    }
                }

                classes.push('cell-img');

            } else if (dataType === '50') {
                // 打钩打叉
                text = <div
                    className={`appcommon ${cellData === 1 ? 'app-xuanzhong' : 'app-guanbi1'}`}
                    style={`color: ${cellData === 1 ? 'green' : 'red'}`}>
                </div>;

            } else if (field.name === 'STDCOLORVALUE') {
                // 显示颜色
                let {r, g, b} = tools.val2RGB(cellData);
                text = <div style={`backgroundColor: rgb(${r},${g},${b})`} height="100%"></div>;

            } else {
                // 其他文字(金额,百分比,数字 等)
                text = BwRule.formatTableText(cellData, field);
            }

            // 时间
            if (cellData && BwRule.isTime(dataType)) {
                text = BwRule.strDateFormat(cellData, field.atrrs.displayFormat);
            }

            // 可点击单元格样式
            if (field.link && !isImg && (field.endField ? rowData[field.endField] === 1 : true)) {
                color = 'blue';
                classes.push("cell-link");
            }

            // if (this.btnsLinkName.includes(field.name)) {
            //     classes.push("cell-link");
            //     color = 'blue';
            // }

        }

        return {text, classes, name, bgColor, color, show};
    }

    edit = (() => {

        let editParamDataGet = (tableData, varList: IBW_TableAddrParam, isPivot = false) => {
            let paramData: obj = {};
            varList && ['update', 'delete', 'insert'].forEach(key => {
                let dataKey = varList[`${key}Type`];
                if (varList[key] && tableData[dataKey][0]) {

                    let data = BwRule.varList(varList[key], tableData[dataKey], true,
                        !isPivot);
                    if (data) {
                        paramData[key] = data;
                    }
                }
            });

            if (!tools.isEmpty(paramData)) {
                paramData.itemId = varList.itemId;
            }
            return paramData;
        };

        let save = () => {

        }

        return {
            save
        };
    })();
}