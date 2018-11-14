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
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {PickModule} from "../edit/pickModule";

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
        return <div className="plan-content"/>;
    }

    protected btnWrapper: HTMLElement;
    protected buttons: Button[];
    protected draw: DrawPoint;
    protected isEditPlan: boolean;
    protected ui: IBW_Plan_Table;
    protected ajax = new BwRule.Ajax();

    constructor(para: IPlanModulePara){
        super(para);
        let ui = this.ui = para.ui;
        this.isEditPlan = ui.tableAddr && tools.isNotEmpty(ui.tableAddr.param);
        //this.isEditPlan = false;

        if(this.isEditPlan){
            this.btnWrapper = <div class="plan-opera"/>;
            d.append(this.wrapper, this.btnWrapper);
            this.plotBtn.init();
            this.plotBtn.disabled = true;
        }
        this.initDraw();
        this.initSubBtn();
    }

    protected initSubBtn(){
        let btnWrapper = d.query('.query-form',this.container),
            ui = this.ui,
            subButtons = ui.subButtons.filter((btn) => btn.multiselect === 0);

        subButtons.forEach((btnUi) => {
            d.append(btnWrapper, <div className="form-com-item">
                <Button icon={btnUi.icon} content={btnUi.title} data={btnUi}
                    onClick={() => {
                        ButtonAction.get().clickHandle(btnUi, void 0, (res) => {
                        }, void 0 , ui.itemId);
                }}/>
            </div>)
        })
    }

    protected initDraw(){
        let ui = this.ui,
            sunButtons = ui.subButtons.filter((btn) => btn.multiselect !== 0),
            cols = ui.cols;

        this.draw = new DrawPoint({
            height: 800,
            width: 1200,
            container: this.wrapper,
            isShow: !this.isEditPlan,
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
                    switch (areaType.type){
                        case 'edit':
                            return this.edit.editData(areaType.data, (data) => {
                                resolve(data)
                            });
                        case 'pick':
                            return new Promise((resolve, reject) => {
                                for(let col of cols){
                                    if(col.elementType === 'pick'){
                                        let pick = new PickModule({
                                            container: document.body,
                                            field: col,
                                            data: areaType.data,
                                            dataGet: () => areaType.data,
                                            onGetData: (dataArr: obj[], otherField: string) => {
                                                resolve(dataArr[0] ? dataArr[0] : null);
                                                pick.destroy();
                                            }
                                        });
                                        pick.wrapper.classList.add('hide');
                                        pick.pickInit();
                                    }
                                }
                            })
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
            this.plotBtn.disabled = false;
            this.draw.render(data);
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

        if((name === 'GRIDBACKCOLOR' || name === 'GRIDFORECOLOR') && text){
            let {r, g, b} = tools.val2RGB(text);
            name === 'GRIDBACKCOLOR' ? bgColor = `rgb(${r},${g},${b})` : color = `rgb(${r},${g},${b})`;
        }

        if (field && field.atrrs) {
            let dataType = field.atrrs.dataType,
                isImg = dataType === BwRule.DT_IMAGE;

            if(dataType === '77'){
                if(DrawPoint.POINT_FIELD in rowData){
                    text = rowData[DrawPoint.POINT_FIELD]
                }
                if(text && !Array.isArray(text)){
                    try{
                        text = JSON.parse(text);
                    }catch (e){
                        text = null;
                    }
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
        if(isShow && !isPoint && tools.isNotEmpty(text)){
            text = field.caption + '：' + text;
        }

        return {data: text, classes, name, bgColor, color, isShow, isPoint};
    }

    protected plotBtn = (() => {
        let plotBox: InputBox, editBox: InputBox;

        let editBtnToggle = (isEdit: boolean) => {
            plotBox && (plotBox.disabled = isEdit);
            if(editBox){
                editBox.getItem('edit').isDisabled = isEdit;
                editBox.getItem('save').isDisabled = !isEdit;
                editBox.getItem('cancel').isDisabled = !isEdit;
            }
            // plotBox.getItem('end-drawing').isDisabled = !isEdit;
            // plotBox.getItem('star-drawing').isDisabled = !isEdit;
            // plotBox.getItem('star-edit').isDisabled = isEdit;
            // plotBox.getItem('end-edit').isDisabled = isEdit;
        };

        let init = () => {
            let buttons: IButton[] = [
                {
                    key:'star-drawing',
                    content: '开始描点',
                    icon: 'maodian',
                    color: 'info',
                    onClick: () => {
                        buttons.forEach((val)=>{
                            if(val.content == '编辑描点' || val.content == '结束编辑'){
                                plotBox.getItem('end-edit').isDisabled = true;
                                plotBox.getItem('star-edit').isDisabled = true;

                            }
                        })

                        console.log('开始描点')

                        //------------------开始绘图
                        this.draw.setIsDrawLine(true);
                        this.draw.createPath();
                    },
                },
                {   key:'end-drawing',
                    content: '结束描点',
                    icon: 'wanchengbianji',
                    color: 'success',
                    isDisabled:false,
                    onClick: () => {
                        //完成编辑--------
                        buttons.forEach((val)=>{
                            if(val.content == '编辑描点' || val.content == '结束编辑'){
                                plotBox.getItem('end-edit').isDisabled = false;
                                plotBox.getItem('star-edit').isDisabled = false;

                            }
                        })

                        //把point 清楚

                        this.draw.setIsDrawLine(false);
                        this.draw.fished();

                    },
                },
                {
                    key:'star-edit',
                    content: '编辑描点',
                    icon: 'bianjimaodian',
                    color: 'info',
                    onClick: () => {
                         buttons.forEach((val)=>{
                            if(val.content == '开始描点' || val.content == '结束描点'){
                                plotBox.getItem('end-drawing').isDisabled = true;
                                plotBox.getItem('star-drawing').isDisabled = true;
                            }
                        })
                        console.log('开始编辑')
                        //------------------开始绘图

                        this.draw.editPoint();
                    },
                },
                {
                    key:'end-edit',
                    content: '结束编辑',
                    icon: 'tuodong',
                    color: 'success',
                    onClick: () => {
                       buttons.forEach((val)=>{
                            if(val.content == '开始描点' || val.content == '结束描点'){
                                plotBox.getItem('end-drawing').isDisabled = false;
                                plotBox.getItem('star-drawing').isDisabled = false;
                            }
                        })
                        this.draw.setIsDrawLine(false);
                        this.draw.editFished();
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