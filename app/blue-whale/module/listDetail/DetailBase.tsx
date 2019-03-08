/// <amd-module name="DetailBase"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {BwRule} from "../../common/rule/BwRule";
import {DetailFormModule} from "./DetailFormModule";
import {Button} from "../../../global/components/general/button/Button";
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;

export interface IDetailBasePara extends IComponentPara {
    isEdit?: boolean;  // 是否可编辑
    uiType?: string;
    fm: {
        caption?: string;//panel 标题，有可能为空
        fields?: R_Field [];//面板中元素列表  input date 下拉等
        subButtons?: R_Button[];//操作按钮列表
        defDataAddrList?: R_ReqAddr[];//默认值获取地址列表
        dataAddr?: R_ReqAddr;//获取数据后台地址
        updatefileData?: R_ReqAddr;
        groupInfo?: IGroupInfo[];
        signField?: string;
        inputs?: R_Input[]
    },
    url: string;
}

export abstract class DetailBase extends Component {

    static detailTypes = ['edit_detail', 'noedit_detail']; // edit_view
    protected para: IDetailBasePara;
    protected fields: R_Field[];

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 容器固定，所有可编辑的单页变种都以该容器为主
     */
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="edit-detail-module">
            <div className="edit-detail-content"/>
        </div>;
    }

    protected ajaxUrl: string = ''; // 获取数据URL
    public defaultData: obj = {};  // 页面数据
    public currentPage: number = 1; // 当前页
    public totalNumber: number = 0; // 总页数
    protected keyStepData: obj[] = []; // KeyStep数据
    protected isKeyStep: boolean = false; // 是否是keystep

    constructor(para: IDetailBasePara) {
        super(para);
        this.para = para;
        this.fields = para.fm.fields || [];
        this.ajaxUrl = tools.isNotEmpty(para.fm.dataAddr) ? BW.CONF.siteUrl + BwRule.reqAddr(para.fm.dataAddr) : '';
        this.initDetailFormModule();
        this.initDetailButtonsModule();
        this.getDetailData().then((data) => {
            this.inputs(para.fm.inputs, this.wrapper);
            this.detailForm.editData = data;
            this.isEdit = this.para.isEdit;
        });
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: KeyStep
     */
    protected inputs(inputs, dom) {
        if (!inputs) {
            return;
        }
        require(['Inputs'], (i) => {
            new i.Inputs({
                inputs: inputs,
                container: dom,
                setListItemData: (data) => {
                    if (tools.isNotEmptyArray(data)) {
                        this.isKeyStep = true;
                        this.currentPage = 1;
                        this.totalNumber = data.length || 0;
                        this.keyStepData = data;
                        this.refresh();
                    }
                }
            })
        });
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 初始化表单模块
     */
    protected detailForm: DetailFormModule;

    protected initDetailFormModule() {
        let fm = this.para.fm;
        this.detailForm = new DetailFormModule({
            uiType: this.para.uiType,
            fields: fm.fields,
            defDataAddrList: fm.defDataAddrList,
            groupInfo: fm.groupInfo,
            container: d.query('.edit-detail-content', this.wrapper)
        })
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 初始化按钮
     */
    protected abstract initDetailButtonsModule();

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 是否可以编辑
     */
    protected _isEdit: boolean;
    abstract get isEdit(): boolean;
    abstract set isEdit(val);

    /**
     * @author WUML
     * @date 2019/1/31
     * @Description: 表单校验
     */
    protected validate() {
        let result: obj = this.detailForm.editModule.validate.start();
        if (tools.isNotEmpty(result)) {
            for (let key in result) {
                let errMsg = result[key].errMsg;
                if (tools.isNotEmpty(errMsg)) {
                    Modal.alert(result[key]);
                    return false;
                }
            }
        } else {
            return true;
        }
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 刷新方法
     */
    public refresh(page?: number) {
        if (this.para.uiType !== 'edit_view') {
            if (tools.isNotEmpty(page)) {
                if (page > 0) {
                    if (page > this.totalNumber) {
                        this.currentPage = this.totalNumber;
                    } else {
                        this.currentPage = page;
                    }
                } else {
                    this.totalNumber = 0;
                    this.currentPage = 1;
                }
            }
            this.checkPageButtonDisabled();
        }
        this.scrollToTop();
        return this.getDetailData().then(data => {
            this.detailForm.editData = data;
            this.isEdit = this.para.isEdit;
        });
    };

    protected prev: Button = null;
    protected next: Button = null;

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 判断上一页下一页按钮是否可用
     */
    protected checkPageButtonDisabled = () => {
        if (this.totalNumber === 1 || this.totalNumber === 0) {
            this.prev.disabled = true;
            this.next.disabled = true;
            return;
        }
        if (this.currentPage === 1) {
            this.prev.disabled = true;
            this.next.disabled = false;
        } else if (this.currentPage === this.totalNumber) {
            this.next.disabled = true;
            this.prev.disabled = false;
        } else {
            this.prev.disabled = false;
            this.next.disabled = false;
        }
    };

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 回到顶部
     */
    private scrollToTop() {
        (function smoothscroll() {
            let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                window.scrollTo(0, currentScroll - (currentScroll / 5));
            }
        })();
    }

    /**
     * @author WUML
     * @date 2019/1/30
     * @Description: 获取数据
     */
    protected getDetailData(): Promise<obj> {
        return new Promise((resolve) => {
            if (this.isKeyStep === true) {
                let keyStepData = this.keyStepData || [],
                    data = keyStepData[this.currentPage - 1];
                this.defaultData = data;
                resolve(data);
            } else {
                if (tools.isNotEmpty(this.ajaxUrl)) {
                    let url = tools.url.addObj(this.ajaxUrl, {
                        pageparams: '{"index"=' + this.currentPage + ', "size"=' + 1 + ',"total"=1}'
                    });
                    BwRule.Ajax.fetch(url, {
                        loading: {
                            msg: '数据加载中...',
                            disableEl: this.wrapper
                        }
                    }).then(({response}) => {
                        if (tools.isNotEmpty(response.body.bodyList[0]) && tools.isNotEmpty(response.body.bodyList[0].dataList)) {
                            let res: obj = {},
                                body = response.body.bodyList[0],
                                meta = body.meta,
                                dataTab = body.dataList[0];
                            for (let i = 0, len = meta.length; i < len; i++) {
                                res[meta[i]] = dataTab[i];
                            }
                            if (~DetailBase.detailTypes.indexOf(this.para.uiType)) {
                                this.totalNumber = response.head.totalNum;
                            }
                            this.defaultData = res;
                            resolve(res);
                        } else {
                            resolve({});
                        }
                    });
                } else {
                    resolve({});
                }
            }
        })
    }

    destroy() {
        this.para = null;
        this.fields = null;
        this.detailForm.destroy();
        this.defaultData = null;
        this.keyStepData = null;
        this.prev && this.prev.destroy();
        this.next && this.next.destroy();
        super.destroy();
    }
}