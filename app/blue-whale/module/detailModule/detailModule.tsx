/// <amd-module name="DetailModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {BwRule} from "../../common/rule/BwRule";
import {DetailItem, IDetailFormatData} from "./detailItem";
import d = G.d;
import tools = G.tools;
import {LayoutImage} from "../../../global/components/view/LayoutImg/LayoutImage";
import CONF = BW.CONF;
import sys = BW.sys;
import {DetailDataManager} from "./detailDataManager";
import {ImgModal, ImgModalPara} from "../../../global/components/ui/img/img";
import {DetailEditModule} from "./detailEditModule";
import AGroupTabItem = BW.AGroupTabItem;
import IGroupTabItemPara = BW.IGroupTabItemPara;

export interface IDetailModulePara extends IGroupTabItemPara {
    ui: IBW_Detail; // 根据ui生成detail页
    ajaxData?: obj;
}

export class DetailModule extends AGroupTabItem {
    protected wrapperInit() {
        return <div className="detail-wrapper">
            <div className="detail-content"/>
        </div>;
    }

    public ajaxData = {}; // 关联数据
    protected dataManager: DetailDataManager; // 数据管理
    protected ui: IBW_Detail; // ui 数据
    protected fields: R_Field[]; // ui 中的fields字段数据，用于构建detailItem
    items: DetailItem[]; // 存放实例化的detailItem
    editType: 'current' | 'modal'; // 存放实例化的detailItem

    onRender: Function;
    onDataChange: Function;

    // 放置按钮的元素
    protected _btnWrapper: HTMLElement;
    get btnWrapper() {
        if (!this._btnWrapper) {
            this._btnWrapper = <div className="detail-btn-group"/>;
            d.append(this.wrapper, this._btnWrapper);
        }
        return this._btnWrapper
    }

    constructor(para: IDetailModulePara) {
        super(para);
        this.ui = para.ui as IBW_Detail;
        this.ajaxData = para.ajaxData || {};
        BwRule.beforeHandle.detail(this.ui); // 处理ui的fields字段
        this.fields = this.ui.fields;
        this.editType = this.ui.operationType.editType || 'current';

        let content = d.query('.detail-content', this.wrapper);
        this.items = this.initItems(content);
        this.initDataManager();
        this.refresh().catch(e => {
            console.log(e);
        });

        this.clickEvent.on();

    }

    static EVT_RENDERED = '__event_detail_rendered__';

    get total() {
        return this.dataManager ? this.dataManager.total : 0;
    }

    protected initDataManager() {
        // 初始化数据管理模块
        this.dataManager = new DetailDataManager({
            render: () => {
                // 渲染方法
                this.render(this.dataManager.data[0] || {});
            },
            container: this.wrapper,
            ajax: {
                auto: false,
                resetCurrent: false, // 是否重新设置当前页
                fun: ({pageSize, current, sort, custom}) => {
                    return new Promise((resolve, reject) => {
                        let ui = this.ui,
                            url = tools.isNotEmpty(ui.dataAddr) ? BW.CONF.siteUrl + BwRule.reqAddr(ui.dataAddr) : '';
                        current++;
                        if (tools.isNotEmpty(url)) {
                            Promise.all([
                                BwRule.Ajax.fetch(url, {
                                    data: Object.assign({
                                        pageparams: '{"index"=' + current + ', "size"=' + pageSize + ',"total"=1}'
                                    }, custom),
                                    needGps: ui.dataAddr.needGps,
                                    timeout: 30000,
                                    loading: {
                                        msg: '数据加载中...',
                                        disableEl: this.wrapper
                                    }
                                }),
                                this.lookup // 获取lookup数据
                            ]).then(([{response}]) => {
                                console.log(response);
                                let data = tools.keysVal(response, 'data') || [{}], // 数据
                                    total = tools.keysVal(response, 'head', 'totalNum'); // 总条数
                                // this.detailData = data;

                                // 生成`old_${name}`数据
                                BwRule.addOldField(this.getOldField(), data);
                                resolve({
                                    data,
                                    total
                                });
                            }).catch((e) => {
                                reject(e);
                            })
                        } else {
                            reject();
                        }
                    })
                }
            }
        })
    }

    // 初始化detailItem
    initItems(container: HTMLElement): DetailItem[] {
        return this.fields.map((field) => {
            return <DetailItem field={field} detail={this} container={container}
                               format={(f, cellData, rowData) => {
                                   return this.format(f, cellData, rowData);
                               }}
            />
        })
    }

    // 根据field name获取对应的detailItem
    getDetailItem(name: string): DetailItem {
        return this.items ? this.items.filter((item) => {
            return item.name === name;
        })[0] || null : null;
    }

    // 事件管理
    protected clickEvent = (() => {
        return {
            on: () => {
                this.linkManager.on();
                this.imgManager.on();
            },
            off: () => {
                this.linkManager.off();
                this.imgManager.off();
            }
        }
    })();

    // 下钻事件管理
    protected linkManager = (() => {
        let handler;
        return {
            on: () => {
                d.off(this.wrapper, 'click', '.cell-link .detail-item-content', handler);
                d.on(this.wrapper, 'click', '.cell-link .detail-item-content', handler = (e) => {
                    let itemEl = d.closest(e.target as HTMLElement, '.detail-item');
                    if (itemEl) {
                        let name = itemEl.dataset.name,
                            item = this.getDetailItem(name);
                        if (item) {
                            this.itemClick(item.custom, this.detailData);
                        }
                    }
                })
            },
            off: () => {
                d.off(this.wrapper, 'click', '.cell-link .detail-item-content', handler);
            }
        }
    })();

    // 查看图片事件管理
    protected imgManager = (() => {
        let handler;
        return {
            on: () => {
                d.off(this.wrapper, 'click', '.cell-img img', handler);
                d.on(this.wrapper, 'click', '.cell-img img', handler = (e) => {
                    let img = e.target as HTMLImageElement,
                        url = img.src;
                    let imgData: ImgModalPara = {
                        img: [url]
                    };
                    ImgModal.show(imgData);
                })
            },
            off: () => {
                d.off(this.wrapper, 'click', '.cell-img img', handler);
            }
        }
    })();

    // detailItem点击事件
    itemClick(field: R_Field, rowData) {
        if (!field) {
            return;
        }
        let link = field.link,
            dataType = field.dataType || (field.atrrs && field.atrrs.dataType);

        if (tools.isEmpty(rowData[field.name])) {
            return;
        }

        if (BwRule.isNewFile(dataType)) {
            let url = tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                "md5_field": field.name,
                [field.name]: rowData[field.name],
                down: 'allow'
            });
            sys.window.download(url);
            return;
        }

        if (link && (field.endField ? rowData[field.endField] === 1 : true)) {
            BwRule.link({
                link: tools.url.addObj(link.dataAddr, G.Rule.parseVarList(link.parseVarList, rowData)),
                varList: link.varList,
                dataType: field.atrrs.dataType,
                data: rowData,
                needGps: link.needGps === 1,
                type: link.type
            });

            return;
        }
    }

    // 获取`old_${name}`数据
    getOldField() {
        let btns = this.ui.subButtons,
            varList: R_VarList[] = [];
        Array.isArray(btns) && btns.forEach(btn => {
            let addr = btn.actionAddr;
            if (addr && Array.isArray(addr.varList)) {
                varList = varList.concat(addr.varList)
            }
        });
        return BwRule.getOldField(varList);
    }

    get detailData(): obj {
        return this.dataManager ? this.dataManager.data[0] || {} : {};
    }

    getData() {
        return this.detailData;
    }

    // 刷新方法
    refresh(ajaxData?: obj): Promise<any> {
        this.ajaxData = ajaxData || this.ajaxData;
        return this.dataManager ? this.dataManager.refresh(this.ajaxData) : Promise.reject('未实例化dataManager控件');
    }

    protected currentPage = -1; // 当前页
    noData = false; // 有没有数据
    // 渲染方法
    render(data: obj = this.detailData) {
        let noData = this.noData = tools.isEmpty(data),
            content = d.query('.detail-content', this.wrapper);
        this.wrapper.classList.toggle('no-data', noData);
        // 判断是否有数据，没有则隐藏数据展示的元素
        if (noData) {
            content.classList.add('hide');
            return
        }
        content.classList.remove('hide');
        Array.isArray(this.items) && this.items.forEach((item: DetailItem) => {
            let field: R_Field = item.custom,
                name = field.name;
            item.itemData = data[name];
        });
        this.trigger(DetailModule.EVT_RENDERED);
        this.onRender && this.onRender();
        let current = this.dataManager ? this.dataManager.current : 0;
        // 当前页与数据管理的页面不一致，则滚动到头部
        if (this.currentPage !== current) {
            this.currentPage = current;
            content.scrollTop = 0;
            this.onDataChange && this.onDataChange();
        }
    }

    // 存放lookup数据
    private _lookUpData: objOf<ListItem[]> = {};
    get lookUpData() {
        return this._lookUpData || {};
    }

    // 获取lookup数据
    private get lookup(): Promise<void> {
        if (tools.isEmpty(this._lookUpData)) {
            let allPromise = this.fields.filter(col => col.elementType === 'lookup')
                .map(col => BwRule.getLookUpOpts(col).then((items) => {
                    // debugger;
                    this._lookUpData = this._lookUpData || {};
                    this._lookUpData[col.name] = items;
                }));

            return Promise.all(allPromise).then(() => {
            })
        } else {
            return Promise.resolve();
        }
    }

    // 设置编辑状态
    protected _editing: boolean = false;
    get editing() {
        return this._editing;
    }

    set editing(flag: boolean) {
        this._editing = flag;
        this.wrapper.classList.toggle('editing', flag);
        this.detailEdit && this.detailEdit.start();
    }

    // detailEdit模块
    protected _detailEdit: DetailEditModule;
    get detailEdit() {
        if (this._detailEdit) {
            return this._detailEdit;
        }

        let tableAddr = this.ui.tableAddr;
        if (tools.isEmpty(tableAddr && tableAddr.param)) {
            return null;
        }
        this._detailEdit = new DetailEditModule({
            url: tableAddr.dataAddr,
            editParam: tableAddr.param[0],
            detail: this,
            field: this.fields
        });
        return this._detailEdit;

    }

    protected pageContainer: HTMLElement;
    protected _pageUrl: string;
    get pageUrl() {
        if (!this._pageUrl) {
            if (sys.isMb) {
                this._pageUrl = location.href;
            } else {
                let pageContainer = d.closest(this.wrapper, '.page-container[data-src]');
                this.pageContainer = pageContainer;
                this._pageUrl = pageContainer ? pageContainer.dataset.src : '';
            }
        }
        return this._pageUrl;
    }

    // 格式化数据
    format(field: R_Field, cellData: any, rowData: obj): Promise<IDetailFormatData> {
        // console.log(rowData);
        return new Promise((resolve, reject) => {
            let text: string | Node = cellData, // 文字 或 Node
                data = null,
                color: string,                  // 文字颜色
                bgColor: string,                // 背景颜色
                classes: string[] = [];         // 类名
            if (field && !field.noShow && field.atrrs) {
                let dataType = field.atrrs.dataType,
                    isImg = dataType === BwRule.DT_IMAGE;

                if (isImg && field.link) {
                    // 缩略图
                    let ajaxData = this.dataManager ? this.dataManager.ajaxData : {};
                    let url = tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(field.link, rowData), ajaxData, true, true);
                    url = tools.url.addObj(url, {version: new Date().getTime()});

                    text = <img src={url}/>;
                    classes.push('cell-img');

                } else if (BwRule.isNewImg(dataType)) {
                    classes.push('cell-img');
                    if (cellData && typeof cellData === 'string') {
                        let urls = [];
                        cellData.split(',').forEach((data) => {
                            urls.push(tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                                "md5_field": field.name,
                                [field.name]: data,
                                down: 'allow'
                            }))
                        });
                        text = <div>
                            {urls.map((url) => {
                                let width = 100 / urls.length;
                                return <img style={{
                                    maxWidth: width - 2 + '%',
                                    marginRight: '2%'
                                }} src={url} alt=""/>
                            })}
                        </div>;
                    }
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

                } else if (BwRule.isNewFile(dataType)) {
                    classes.push('cell-link');
                    color = 'blue';
                    if (cellData) {
                        BwRule.getFileInfo(field.name, cellData).then(({response}) => {
                            response = JSON.parse(response);
                            if (response && response.dataArr && response.dataArr[0]) {
                                let data = response.dataArr[0],
                                    filename = data.filename;
                                text = filename;
                            }
                            resolve({text, classes, bgColor, color, data});
                        }).catch(() => {
                            resolve({text, classes, bgColor, color, data});
                        });
                        return;
                    }
                } else if (dataType === '50') {
                    // 打钩打叉
                    text = <div
                        className={`appcommon ${cellData === 1 ? 'app-xuanzhong' : 'app-guanbi1'}`}
                        style={`color: ${cellData === 1 ? 'green' : 'red'}`}>
                    </div>;

                } else if (field.name === 'STDCOLORVALUE') {
                    // 显示颜色
                    let {r, g, b} = tools.val2RGB(cellData);
                    text = <div style={`backgroundColor: rgb(${r},${g},${b})`} height="100%"/>;

                } else if (field.elementType === 'lookup') {
                    // lookUp替换
                    let options = this.lookUpData[field.name] || [];
                    for (let opt of options) {
                        if (opt.value == rowData[field.lookUpKeyField]) {
                            text = opt.text;
                            data = opt.text;
                        }
                    }
                } else {
                    // 其他文字(金额,百分比,数字 等)
                    text = BwRule.formatTableText(cellData, field);
                }

                // 时间
                if (cellData && BwRule.isTime(dataType)) {
                    text = BwRule.strDateFormat(cellData, field.atrrs.displayFormat);
                }

                // 数字默认右对齐
                if (BwRule.isNumber(dataType)) {
                    classes.push('text-right');
                }

                // // 可点击单元格样式
                // ['drillAddr', 'webDrillAddr', 'webDrillAddrWithNull'].forEach((addr, i) => {
                //     // debugger;
                //     let reqAddr: R_ReqAddr = field[addr],
                //         keyFieldData = rowData[this.ui.keyField];
                //     if (reqAddr && reqAddr.dataAddr) {
                //         if (i === 2 ? tools.isEmpty(keyFieldData) : tools.isNotEmpty(keyFieldData)) {
                //             color = 'blue';
                //             classes.push("cell-link");
                //         }
                //     }
                // });

                // 可点击单元格样式
                if (field.link && !isImg && (field.endField ? rowData[field.endField] === 1 : true)) {
                    color = 'blue';
                    classes.push("cell-link");
                }

                // if (this.btnsLinkName.includes(field.name)) {
                //     classes.push("cell-link");
                //     color = 'blue';
                // }

                // 后台计算规则
                let when = field.backWhen;
                if (when) {
                    if (eval(tools.str.parseTpl(when, rowData))) {
                        let {r, g, b} = tools.val2RGB(field.backColor);
                        bgColor = `rgb(${r},${g},${b})`
                    }
                }
            }

            resolve({text, classes, bgColor, color, data});
        })
    }
}
