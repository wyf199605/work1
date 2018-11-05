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
import {DetailModal} from "../listDetail/DetailModal";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Loading} from "../../../global/components/ui/loading/loading";

export interface IPlanModulePara extends IComponentPara{
    ui: IBW_Plan_Table;
}

export interface IDrawFormatData{
    data: any; //
    name: string;
    isPoint?: boolean;
    isShow?: boolean;
    classes?: string[];
    bgColor?: string;
    color?: string;
}

export class PlanModule extends Component{

    wrapperInit(){
        return <div className="plan-content">
            {this.btnWrapper = <div class="plan-opera"/>}
        </div>;
    }

    protected btnWrapper: HTMLElement;
    protected buttons: Button[];
    protected draw: DrawPoint;
    protected ui: IBW_Plan_Table;
    protected ajax = new BwRule.Ajax();

    constructor(para: IPlanModulePara){
        super(para);
        let ui = this.ui = para.ui;

        this.plotBtn.init();
        this.plotBtn.disabled = true;
        this.initDraw(BW.CONF.siteUrl + ui['backGround']['dataAddr']);
    }

    protected initDraw(imageUrl: string){
        let ui = this.ui,
            cols = ui.cols;

        this.draw = new DrawPoint({
            height: 500,
            width: 800,
            container: this.wrapper,
            format: (data: obj) => {
                let res: IDrawFormatData[] = [];
                cols && cols.forEach((col) => {
                    let name = col.name;
                    if(name in data){
                        res.push(this.format(col, data[name], data));
                    }
                });
                return res;
            },
            onAreaClick: (areaType) => {
                return new Promise((resolve, reject) => {
                    if(areaType.type === 'edit'){
                        return this.edit.editData(areaType.data, (data) => {
                            resolve(data)
                        });
                    }
                })

            }
        });

    }

    protected bgPicture: string;
    protected setBackground(obj: obj){
        let backGround = this.ui.backGround;
        if(backGround){
            let url = CONF.siteUrl + BwRule.reqAddr(backGround, obj);
            if(url != this.bgPicture){
                this.bgPicture = url;
                console.log(url);
                this.draw.imgUrl = url;
                // TODO 设置drawPoint图片
            }
        }
    }

    protected _ajaxData;
    refresh(ajaxData?: obj){
        this._ajaxData = ajaxData;
        let ui = this.ui,
            url = CONF.siteUrl + BwRule.reqAddr(ui.dataAddr);
        this.setBackground(ajaxData);

        this.ajax.fetch(tools.url.addObj(url, {nopage: true}), {
            needGps: ui.dataAddr.needGps,
            timeout: 30000,
            data: PlanModule.initQueryParams(ajaxData)
        }).then(({response}) => {
            console.log(response);
            let data = response.data;
            if (data) {
                let editParam = ui.tableAddr.param[0];
                if (editParam) {
                    let varList = [];
                    ['insert', 'update', 'delete'].forEach(type => {
                        let canOld = ['update', 'delete'].indexOf(editParam[`${type}Type`]) > -1,
                            typeVarList = editParam[type];

                        if (canOld && Array.isArray(typeVarList)) {
                            varList = varList.concat(typeVarList)
                        }
                    });
                    // 加上OLD变量
                    BwRule.addOldField(BwRule.getOldField(varList), data);
                }
            }
            console.log(data);
            this.draw.render(data);
            this.plotBtn.disabled = false;
        }).catch(e => {
            console.log(e);
        })
    }

    format(field: R_Field, cellData: any, rowData: obj): IDrawFormatData{
        let text: any = cellData, // 文字 或 Node
            name = field.name,
            isPoint = false,
            isShow = !field.noShow,
            color: string,                  // 文字颜色
            bgColor: string,                // 背景颜色
            classes: string[] = [];         // 类名

        if (field && !field.noShow && field.atrrs) {
            let dataType = field.atrrs.dataType,
                isImg = dataType === BwRule.DT_IMAGE;

            if(dataType === '77'){
                if(DrawPoint.POINT_FIELD in rowData){
                    text = rowData[DrawPoint.POINT_FIELD]
                }
                if(text && !Array.isArray(text)){
                    text = JSON.parse(text);
                }
                isPoint = true;
            }else{
                if (dataType === '50') {
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
            }
        }

        return {data: text, classes, name, bgColor, color, isShow, isPoint};
    }

    protected plotBtn = (() => {
        let plotBox: InputBox, editBox: InputBox;

        let editBtnToggle = (isEdit: boolean) => {
            plotBox && (plotBox.disabled = isEdit);
            editBox.getItem('edit').isDisabled = isEdit;
            editBox.getItem('save').isDisabled = !isEdit;
            editBox.getItem('cancel').isDisabled = !isEdit;
        };

        let init = () => {
            let buttons: IButton[] = [
                {
                    content: '撤销',
                    icon: 'chexiao',
                    color: 'error',
                    tip: 'ctrl + z 撤销',
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
                        let paths = G.d.queryAll(".draw-point-wrapper>svg>g>path");

                        console.log(this.draw.getPoints());
                        this.draw.setIsDrawLine(false);
                        this.draw.fished();

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
                        let paths = G.d.queryAll(".draw-point-wrapper>svg>g>path");
                        this.draw.setIsDrawLine(true);
                        this.draw.createPath();
                    },
                },
                {
                    content: '编辑描点',
                    icon: 'bianjimaodian',
                    color: 'info',
                    onClick: () => {
                        buttons.forEach((val)=>{
                            if(val.content == '描点'){
                                val.isDisabled = true;

                            }
                        })
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
                        this.draw.OnZoom();
                    },
                }
            ];
            let editButtons: IButton[] = [
                {
                    key: 'edit',
                    content: '编辑',
                    iconPre: 'appcommon',
                    icon: 'app-bianji',
                    onClick: () => {
                        this.edit.start();
                    }
                },
                {
                    key: 'save',
                    content: '保存',
                    iconPre: 'appcommon',
                    icon: 'app-baocun',
                    isDisabled: true,
                    onClick: () => {
                        this.edit.save();
                    }
                },
                {
                    key: 'cancel',
                    content: '取消',
                    isDisabled: true,
                    iconPre: 'appcommon',
                    icon: 'app-quxiao',
                    onClick: () => {
                        this.edit.cancel();
                    }
                }
            ];

            // 初始化绘图按钮
            plotBox = new InputBox({
                container: this.btnWrapper,
                size: 'middle'
            });
            buttons.map((b) => new Button(b)).forEach((b) => {
                plotBox.addItem(b)
            });

            // 初始化编辑按钮
            editBox = new InputBox({
                container: this.btnWrapper,
                size: 'middle'
            });
            editButtons.map((b) => new Button(b)).forEach((b) => {
                editBox.addItem(b)
            });
        };

        return {
            init,
            editBtnToggle,
            set disabled(disabled: boolean){
                plotBox && (plotBox.disabled = disabled);
                editBox && (editBox.disabled = disabled);
            }
        }
    })();

    edit = (() => {

        // 将获取到的编辑数据处理成传送给后台的数据
        let editParamDataGet = (tableData, varList: IBW_TableAddrParam) => {
            let paramData: obj = {};
            varList && ['update', 'delete', 'insert'].forEach(key => {
                let dataKey = varList[`${key}Type`];
                if (varList[key] && tableData[dataKey][0]) {

                    let data = BwRule.varList(varList[key], tableData[dataKey], true);
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

        // 获取编辑的数据
        let getEditData = () => {
            let ui = this.ui,
                pointField: string,
                postData = {
                param: [] as obj[]
            };
            for(let col of ui.cols){
                if(col.dataType === '77' || (col.atrrs && col.atrrs.dataType === '77')){
                    pointField = col.name;
                    break;
                }
            }
            let editedData = this.draw.editedData,
                getPointData = (data: obj): obj => {
                let res = Object.assign({}, data);
                if(pointField && res[DrawPoint.POINT_FIELD]){
                    res[pointField] = res[DrawPoint.POINT_FIELD];
                    delete res[DrawPoint.POINT_FIELD];
                }
                return res;
            };

            let data = editParamDataGet({
                insert: editedData.insert.map(getPointData),
                update: editedData.update.map(getPointData),
                delete: editedData.delete.map(getPointData),
            }, ui.tableAddr.param[0]);
            if (!tools.isEmpty(data)) {
                postData.param.push(data);
            }
            return postData;
        };

        // 保存
        let save = () => {
            console.log(this.draw.editedData);
            let saveData = getEditData();
            if (tools.isEmpty(saveData.param)) {
                Modal.toast('没有数据改变');
                cancel();
                return
            }
            console.log(saveData);
            let loading = new Loading({
                msg: '保存中',
                disableEl: this.wrapper
            });

            let ui= this.ui;

            BwRule.Ajax.fetch(CONF.siteUrl + ui.tableAddr.dataAddr, {
                type: 'POST',
                data: saveData,
            }).then(({response}) => {
                BwRule.checkValue(response, saveData, () => {
                    cancel();
                    this.refresh(this._ajaxData);
                });
            }).finally(() => {
                loading && loading.destroy();
                loading = null;
            });
        };

        // 编辑修改
        let editData = (data: obj, callback: (data: obj) => void) => {
            console.log(data);
            new DetailModal({
                uiType: this.ui.uiType,
                fm: {
                    caption: this.ui.caption,
                    fields: this.ui.cols,
                    defDataAddrList: this.ui.defDataAddrList,
                    dataAddr: this.ui.dataAddr
                },
                defaultData: data,
                confirm: (data) => {
                    debugger;
                    return new Promise<any>((resolve) => {
                        callback && callback(data);
                        resolve();
                    })
                }
            })
        };

        let start = () => {
            this.draw && this.draw.editOpen();
            this.plotBtn.editBtnToggle(true);
        };

        let cancel = () => {
            this.draw && this.draw.editCancel();
            this.plotBtn.editBtnToggle(false);
        };

        return {
            save,
            editData,
            cancel,
            start
        };
    })();

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
}