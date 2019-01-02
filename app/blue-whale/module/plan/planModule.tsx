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
import {HorizontalQueryModule} from "../query/horizontalFormFactory";

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
        tools.isPc && this.initSubBtn();
        this.initStatusBar();
        //this.initScale();
    }

    initScale(){
        if(tools.isMb){
            let div = <div class="initScale">
                <div class="search iconfont icon-suoxiao" onclick={()=>{
                    //alert('缩小')
                }
                }></div>
                <div className="search iconfont icon-fangda" onclick={() => {
                    //alert('放大')
                }
                }></div>
            </div>
            d.append(this.container,div)
        }

    }
    initStatusBar(){
        let ui = this.ui,
            backColors = ui.backColor;
        if(tools.isNotEmpty(backColors)){
            let body = <div class="status-list"/>;
            let modal = new Modal({
                className: 'plan-status-modal',
                isMb: false,
                body,
                header: tools.isMb ? null : {
                    isClose: false,
                    title: '状态',
                    isDrag: true
                },
                isBackground: false,
                escKey: false,
                width: '100px',
                container: this.container,
                top: 160,
                zIndex: 499
            });
            modal.wrapper.style.left = (tools.isMb ? -5 :document.body.offsetWidth - 150) + 'px';
            backColors.forEach((item) => {
                let {r, g, b} = tools.val2RGB(item.GRIDBACKCOLOR),
                    color = `rgb(${r}, ${g}, ${b})`;
                d.append(body, <div className="status-item">
                    <div className="status-ball" style={'background: ' + color}/>
                    {item.STATUS_NAME}
                </div>)
            });

            if(tools.isMb){
                d.on(this.container, 'touchstart', (ev) => {
                    if(!d.closest(ev.target as HTMLElement, '.plan-status-modal')){
                        modal.wrapper.style.transform = 'translateX(-80px)';
                    }
                });
                d.on(modal.wrapper, 'touchstart', () => {
                    modal.wrapper.style.transform = 'translateX(0)';
                });
            }
        }
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
                        }, this.pageUrl , ui.itemId);
                }}/>
            </div>)
        })
    }

    protected pageContainer: HTMLElement;
    protected _pageUrl: string;
    get pageUrl() {
        if (!this._pageUrl) {
            if (tools.isMb) {
                this._pageUrl = location.href;
            } else {
                let pageContainer = d.closest(this.wrapper, '.page-container[data-src]');
                this.pageContainer = pageContainer;
                this._pageUrl = pageContainer ? pageContainer.dataset.src : '';
            }
        }
        return this._pageUrl;
    }

    protected detailModal: Modal;
    protected initDraw(){
        let ui = this.ui,
            timer = null,
            subButton = ui.subButtons.filter((btn) => btn.multiselect !== 0),
            cols = ui.cols;

        this.draw = new DrawPoint({
            height: 800,
            width: 1200,
            subButton,
            ui,
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
                let {data, type, name, content} = areaType;
                return new Promise((resolve, reject) => {
                    switch (type){
                        case 'edit':
                            this.edit.editData(data, (d) => {
                                resolve(d)
                            });
                            break;
                        case 'pick':
                            for(let col of cols){
                                if(col.elementType === 'pick'){
                                    let pick = new PickModule({
                                        container: document.body,
                                        field: col,
                                        data,
                                        dataGet: () => data,
                                        onGetData: (dataArr: obj[], otherField: string) => {
                                            resolve(dataArr[0] ? dataArr[0] : null);
                                            pick.destroy();
                                        }
                                    });
                                    pick.wrapper.classList.add('hide');
                                    pick.pickInit();
                                    break;
                                }
                            }
                            break;
                        case 'btn':
                            ButtonAction.get().clickHandle(content.button, data, () => {
                                resolve();
                            }, this.pageUrl , ui.itemId);
                            break;
                        case 'link':
                            for(let col of cols){
                                let link = col.link;
                                if(tools.isNotEmpty(link)) {
                                    BwRule.link({
                                        link: link.dataAddr,
                                        varList: link.varList,
                                        dataType: col.atrrs.dataType,
                                        data,
                                        needGps: link.needGps === 1,
                                        type: link.type
                                    });
                                    break;
                                }
                            }
                            break;
                        case 'modal':
                            let formatTexts: IDrawFormatData[] = [],
                                title = '',
                                contents = [];

                            cols && cols.forEach((col) => {
                                let name = col.name;
                                if(name in data){
                                    formatTexts.push(this.format(col, data[name], data));
                                }
                            });
                            formatTexts.forEach((item) => {
                                if(item.name === ui.keyField){
                                    title = item.data || '详情';
                                }else if(tools.isNotEmpty(item.data) && item.isShow && !item.isPoint){
                                    contents.push(item.data);
                                }
                            });
                            this.detailModal && (this.detailModal.isShow = false);
                            clearTimeout(timer);
                            let body = <div className="plan-item-detail">
                                <div className="plan-item-content">
                                    {contents.map((text) => <span className="text">{text}</span>)}
                                </div>
                                <div className="plan-btn-groups">
                                    {subButton.map((btn) => {
                                        let button: Button = <Button content={btn.caption} color="primary" onClick={() => {
                                            button.isDisabled = true;
                                            button.isLoading = true;
                                            ButtonAction.get().clickHandle(btn, data, () => {
                                                button.isDisabled = false;
                                                button.isLoading = false;
                                                resolve();
                                            }, this.pageUrl , ui.itemId);
                                        }}/>;
                                        return button;
                                    })}
                                </div>
                            </div>;
                            this.detailModal = new Modal({
                                className: 'plan-detail-modal',
                                isOnceDestroy: true,
                                position: "down",
                                isMb: false,
                                isBackground: false,
                                onClose: () => {
                                    this.detailModal = null;
                                    timer = setTimeout(() => {
                                        this.draw.wrapper.style.paddingBottom = '0px';
                                    }, 100);
                                    reject();
                                },
                                header: {
                                    title,
                                },
                                body,
                            });
                            this.draw.wrapper.style.paddingBottom = '240px';
                            break;
                    }
                })
            }
        });

    }

    protected setBackground(obj: obj): Promise<any>{
        return new Promise((resolve, reject) => {
            let backGround = this.ui.backGround;
            if(backGround){
                let ajaxObj:obj = {};
                for (let key in obj) {
                    for (let ok in obj[key]) {
                        tools.isNotEmpty(obj[key][ok]) && (ajaxObj[ok] = obj[key][ok]);
                    }
                }
                let url = CONF.siteUrl + BwRule.reqAddr(backGround, Object.assign({}, ajaxObj || {}));
                url = url && tools.url.addObj(url, {version: new Date().getTime() + ''});

                let img = new Image();
                img.src = url;
                img.onload = ()=>{
                    this.draw.imgUrl = url;
                    resolve();
                };
                img.onerror = () => {
                    reject();
                    this.draw.imgUrl = null;
                }

            }else {
                reject();
                this.draw.imgUrl = null;
            }
        });

    }

    protected _ajaxData;
    get ajaxData(){
        return this._ajaxData;
    }
    refresh(ajaxData?: obj): Promise<any>{
        this.detailModal && (this.detailModal.isShow = false);
        return new Promise((resolve, reject) => {
            this._ajaxData = ajaxData;
            let ui = this.ui,
                url = CONF.siteUrl + BwRule.reqAddr(ui.dataAddr);
            let loading = new Loading({
                msg: '数据加载中...'
            });
            loading.show();
            this.setBackground(ajaxData).then(() => {
                let data = Object.assign({nopage: true,atvarparams:JSON.stringify(ajaxData.atvarparams) || ''}, PlanModule.initQueryParams(ajaxData.queryparams1));
                this.ajax.fetch(tools.url.addObj(url, data), {
                    needGps: ui.dataAddr.needGps,
                    timeout: 30000,
                }).then(({response}) => {
                    console.log(response);
                    let data = response.data;
                    if (data && ui.tableAddr && ui.tableAddr.param) {
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
                }).finally(() => {
                    loading && loading.hide();
                    loading = null;
                    resolve();
                })
            }).catch(() => {
                Modal.alert('图层不存在');
                this.plotBtn.disabled = true;
                loading && loading.hide();
                loading = null;
                reject();
            });
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
                isImg = dataType === BwRule.DT_IMAGE || dataType === BwRule.DT_SIGN;

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
                    className:'star-drawing',
                    color: 'info',
                    onClick: () => {
                        buttons.forEach((val)=>{
                            if(val.content == '编辑描点' || val.content == '结束编辑'){
                                plotBox.getItem('end-edit').isDisabled = true;
                                plotBox.getItem('star-edit').isDisabled = true;
                            }

                        })
                        plotBox.children.forEach((c) => {
                            c.wrapper.classList.remove('custom-button');
                        })
                        plotBox.getItem('star-drawing').wrapper.classList.add('custom-button');

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
                    className:'end-drawing',
                    isDisabled:false,
                    onClick: () => {
                        //完成编辑--------
                        buttons.forEach((val)=>{
                            if(val.content == '编辑描点' || val.content == '结束编辑'){
                                plotBox.getItem('end-edit').isDisabled = false;
                                plotBox.getItem('star-edit').isDisabled = false;

                            }
                        })

                        plotBox.children.forEach((c) => {
                            c.wrapper.classList.remove('custom-button');
                        })
                        plotBox.getItem('end-drawing').wrapper.classList.add('custom-button');

                        //把point 清楚

                        this.draw.setIsDrawLine(false);
                        this.draw.fished();

                    },
                },
                {
                    key:'star-edit',
                    content: '编辑描点',
                    icon: 'bianjimaodian',
                    className:'star-edit',
                    color: 'info',
                    onClick: () => {
                         buttons.forEach((val)=>{
                            if(val.content == '开始描点' || val.content == '结束描点'){
                                plotBox.getItem('end-drawing').isDisabled = true;
                                plotBox.getItem('star-drawing').isDisabled = true;
                            }
                        })
                        editBox.getItem('edit').isDisabled = true;
                        console.log('开始编辑')
                        //------------------开始绘图
                        plotBox.children.forEach((c) => {
                            c.wrapper.classList.remove('custom-button');
                        })
                        plotBox.getItem('star-edit').wrapper.classList.add('custom-button');
                        this.draw.editPoint();
                    },
                },
                {
                    key:'end-edit',
                    content: '结束编辑',
                    icon: 'tuodong',
                    className:'end-edit',
                    color: 'success',
                    onClick: () => {
                       buttons.forEach((val)=>{
                            if(val.content == '开始描点' || val.content == '结束描点'){
                                plotBox.getItem('end-drawing').isDisabled = false;
                                plotBox.getItem('star-drawing').isDisabled = false;
                            }
                        })
                        plotBox.children.forEach((c) => {
                            c.wrapper.classList.remove('custom-button');
                        })
                        plotBox.getItem('end-edit').wrapper.classList.add('custom-button');
                        this.draw.editPoint();
                        editBox.getItem('edit').isDisabled = false;
                        this.draw.setIsDrawLine(false);
                        this.draw.editFished();
                    },
                }

            ];
            let editButtons: IButton[] = [
                {
                    key: 'edit',
                    content: '绑定',
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
                width:'600px',
                height:'600px',
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
            if(data[key]){
                params.push({
                    field: key.toUpperCase(),
                    values: [data[key]],
                    not: false,
                    op: 2
                });
            }
        }
        return {
            queryparams1: JSON.stringify({"not":false, "op":0, "params": params})
        }
    }
}