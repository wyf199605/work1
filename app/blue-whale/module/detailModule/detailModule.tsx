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
import {EditModule} from "../edit/editModule";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";

export interface IDetailModulePara extends IComponentPara {
    ui: IBW_Detail;
    current?: number;
}

export class DetailModule extends Component {
    protected wrapperInit() {
        return <div className="detail-wrapper">
            <div className="detail-content"/>
        </div>;
    }

    protected ui: IBW_Detail;
    protected fields: R_Field[];
    protected items: DetailItem[];
    protected current: number = 1;
    protected total: number = -1;

    constructor(para: IDetailModulePara) {
        super(para);
        console.log(para);
        this.current = para.current || 1;
        this.ui = para.ui;
        BwRule.beforeHandle.detail(this.ui);
        this.fields = this.ui.fields;

        this.initItems();
        this.refresh().catch(e => {
            console.log(e);
        });

        this.clickEvent.on();
    }

    protected initItems() {
        let content = d.query('.detail-content', this.wrapper);
        this.items = this.fields.map((field) => {
            return <DetailItem field={field} detail={this} container={content}
                               format={(f, cellData, rowData) => {
                                   return this.format(f, cellData, rowData);
                               }}/>
        })
    }

    getDetailItem(name: string): DetailItem{
        return this.items ? this.items.filter((item) => {
            return item.name === name;
        })[0] || null : null;
    }

    protected clickEvent = (() => {
        let handler;
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.cell-link .detail-item-content', handler = (e) => {
                    let itemEl = d.closest(e.target as HTMLElement, '.detail-item');
                    if(itemEl){
                        let name = itemEl.dataset.name,
                            item = this.getDetailItem(name);
                        if(item){
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

    itemClick(field: R_Field, rowData){
        if (!field) {
            return;
        }
        let link = field.link,
            dataType = field.dataType || (field.atrrs && field.atrrs.dataType);

        if (tools.isEmpty(rowData[field.name])) {
            return;
        }

        if(BwRule.isNewFile(dataType)){
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

    getOldField(){
        let btns = this.ui.subButtons,
            varList: R_VarList[] = [];
        Array.isArray(btns) && btns.forEach(btn => {
            let addr = btn.actionAddr;
            if(addr && Array.isArray(addr.varList)){
                varList = varList.concat(addr.varList)
            }
        });
        return BwRule.getOldField(varList);
    }

    protected _detailData: obj = {};
    get detailData(){
        return this._detailData;
    }
    set detailData(data){
        this._detailData = data;
        BwRule.addOldField(this.getOldField(), data);
        this.render(data);
    }

    get data(){
        let data = {};
        this.items && this.items.forEach((item) => {
            data[item.name] = item.data;
        });
        return data;
    }

    protected ajaxData = {};
    refresh(ajaxData: obj = this.ajaxData): Promise<any> {
        return new Promise((resolve, reject) => {
            this.ajaxData = ajaxData;

            let ui = this.ui,
                url = tools.isNotEmpty(ui.dataAddr) ? BW.CONF.siteUrl + BwRule.reqAddr(ui.dataAddr, ajaxData) : '';
            if (tools.isNotEmpty(url)) {
                Promise.all([
                    BwRule.Ajax.fetch(url, {
                        data: {
                            pageparams: '{"index"=' + this.current + ', "size"=' + 1 + ',"total"=1}'
                        },
                        needGps: ui.dataAddr.needGps,
                        timeout: 30000,
                        loading: {
                            msg: '数据加载中...',
                            disableEl: this.wrapper
                        }
                    }),
                    this.lookup
                ]).then(([{response}]) => {
                    console.log(response);
                    let data = tools.keysVal(response, 'data', 0) || {};
                    this.total = tools.keysVal(response, 'head', 'totalNum');
                    this.detailData = data;
                    resolve();
                }).catch((e) => {
                    reject(e);
                })
            }else{
                reject();
            }
        })
    }

    render(data: obj = this.detailData) {
        Array.isArray(this.items) && this.items.forEach((item: DetailItem) => {
            let field: R_Field = item.custom,
                name = field.name;
            item.itemData = data[name];
        })
    }

    private _lookUpData: objOf<ListItem[]> = {};
    get lookUpData() {
        return this._lookUpData || {};
    }

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

    protected _editing: boolean = false;
    get editing(){
        return this._editing;
    }
    set editing(flag: boolean){
        this._editing = flag;
        this.wrapper.classList.toggle('editing', flag);
    }

    protected edit = (() => {
        let editModule: EditModule,
            btn: R_Button;
        let start = (subBtn: R_Button) => {
            btn = subBtn;
            this.editing = true;
            this.clickEvent.off();
            editModule = new EditModule({
                auto: true,
                type: 'table',
                fields: this.items.map(item => {
                    let contentEl = item.contentEl;
                    contentEl && (contentEl.innerHTML = '');
                    return {
                        dom: contentEl,
                        field: item.custom
                    }
                }),
                container: this.container,
                cols: this.fields
            });
            editModule.set(this.detailData);
            this.fields.forEach(() => {

            })
        };
        let save = () => {
            if(editModule && btn){
                let data = Object.assign({}, this.detailData, editModule.get());
                ButtonAction.get().clickHandle(btn, data, response => {
                    if(response){
                        btn.buttonType = 2;
                        let data = response.data && response.data[0] ? response.data[0] : null;
                        cancel();
                        this.detailData = data;

                        // typeof callback === 'function' && callback(response);
                    }
                },this.pageUrl);
            }
        };
        let cancel = () => {
            this.editing = false;
            this.clickEvent.on();
            editModule && editModule.destroy();
            editModule = null;
        };
        return {
            start: (btn) => {
                start(btn);
            },
            save: () => {
                save();
            },
            cancel: () => {
                cancel();
                this.render();
            }
        }
    })();

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

    format(field: R_Field, cellData: any, rowData: obj): Promise<IDetailFormatData> {
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
                    let url = tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(field.link, rowData), this.ajaxData, true, true);
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
                            console.log(response);
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
