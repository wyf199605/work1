/// <amd-module name="EditDetailModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {EditModule} from "../edit/editModule";
import {BwRule} from "../../common/rule/BwRule";
import {DetailModal} from "./DetailModal";
import {ListItemDetail} from "./ListItemDetail";
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Button} from "../../../global/components/general/button/Button";
import {ActionSheet, IActionSheetButton} from "../../../global/components/ui/actionSheet/actionSheet";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import d= G.d;

interface IEditDetailPara extends IComponentPara {
    isEdit: boolean;
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
    },
    url: string;
}

export class EditDetailModule extends Component {

    private editModule: EditModule;
    private fields: R_Field[] = [];
    public defaultData: obj = {};
    public currentPage: number = 1;
    public totalNumber: number = 0;
    private ajaxUrl: string = '';

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="edit-detail-module">
            <div className="edit-detail-content"/>
        </div>;
    }

    constructor(private para: IEditDetailPara) {
        super(para);
        this.fields = para.fm.fields;
        this.ajaxUrl = tools.isNotEmpty(para.fm.dataAddr) ? BW.CONF.siteUrl + BwRule.reqAddr(para.fm.dataAddr) : '';
        this.getDefaultData().then((data) => {
            this.initAllButtons();
            this.initEditModule(para, data);
        });
    }

    // 获取数据
    private getDefaultData(): Promise<obj> {
        return new Promise((resolve) => {
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
                        this.totalNumber = response.head.totalNum;
                        this.defaultData = res;
                        resolve(res);
                    } else {
                        let data = BwRule.getDefaultByFields(this.fields);
                        this.defaultData = data;
                        resolve(data);
                    }
                });
            } else {
                resolve({});
            }
        })
    }

    private initEditModule(para: IEditDetailPara, defaultData: obj) {
        let emPara: EditModulePara = {fields: [], defaultData: defaultData},
            formWrapper = tools.os.ios ? <div className="form-wrapper ios-form"/> : <div className="form-wrapper"/>,
            fields = para.fm.fields || [],
            groupInfo = para.fm.groupInfo;
        d.append(d.query('.edit-detail-content', this.wrapper), formWrapper);
        BwRule.beforeHandle.fields(fields, para.uiType);
        if (tools.isMb || tools.isEmpty(groupInfo)) {
            tools.isPc && formWrapper.classList.add('no-group');
            for (let i = 0, len = fields.length; i < len; i++) {
                let f = fields[i];
                emPara.fields.push(this.handleField(f, formWrapper));
            }
        } else {
            let fieldsArr = [...fields];
            groupInfo.forEach(group => {
                let result = this.getGroupFormPara(group, fieldsArr, formWrapper);
                emPara.fields = emPara.fields.concat(result.para);
                fieldsArr = result.fields;
            });
            // 不在组中的字段，一般为隐藏字段
            if (tools.isNotEmpty(fieldsArr)) {
                fieldsArr.forEach(f => {
                    emPara.fields.push(this.handleField(f, formWrapper, '', true));
                })
            }
        }
        this.editModule = new EditModule(emPara);
        emPara.fields.forEach((f) => {
            let field = f.field,
                name = field.name,
                isNotEdit = field.noEdit;
            if (isNotEdit && !field.noShow) {
                let com = this.editModule.getDom(name);
                com && (com.disabled = true);
                if (tools.isMb) {
                    let wrapper = com.wrapper || com.container;
                    wrapper && wrapper.addEventListener('click', () => {
                        Modal.toast(field.caption + '不可以修改～');
                    });
                }
            }
        });
        if (tools.isNotEmpty(para.fm.defDataAddrList)) {
            BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(para.fm.defDataAddrList[0])).then(({response}) => {
                // 字段默认值
                let dafVal = BwRule.getDefaultByFields(this.para.fm.fields);
                // 新增时的默认值
                let res: obj = {};
                let meta = response.body.bodyList[0].meta,
                    dataTab = response.body.bodyList[0].dataList[0];
                for (let i = 0, len = meta.length; i < len; i++) {
                    res[meta[i]] = dataTab[i];
                }
                if (tools.isNotEmpty(dafVal)) {
                    dafVal = Object.assign({}, dafVal, defaultData, res);
                }
                this.editModule.set(dafVal);
                this.setLookUp(dafVal);
            })
        } else {
            let dafVal = BwRule.getDefaultByFields(this.para.fm.fields);
            if (tools.isNotEmpty(defaultData)) {
                dafVal = Object.assign({}, dafVal, defaultData);
            }
            this.editModule.set(dafVal);
            this.setLookUp(dafVal);
        }
        this.isEdit = para.isEdit;
    }

    private handleField(f: R_Field, wrapper: HTMLElement, className?: string, isVirtual = false): ComInitP {
        let self = this;
        if (f.comType === 'file') {
            f.comType = 'newFile';
        }
        if (isVirtual === true) {
            f.comType = 'virtual';
        }
        if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && f.noAdd) || f.noShow) {
            f.comType = 'virtual';
        }
        if (f.comType === 'textarea') {
            className = tools.isNotEmpty(className) ? className + ' textarea' : 'textarea';
        }
        return {
            dom: f.comType === 'virtual' ? null : DetailModal.createFormWrapper(f, wrapper, className || ''),
            field: f,
            data: this.defaultData,
            onExtra: (data, relateCols) => {
                let com = self.editModule.getDom(f.name);
                for (let key of relateCols) {
                    let hCom = self.editModule.getDom(key);
                    if (hCom && hCom !== com) {
                        let hField = hCom.custom as R_Field;
                        hCom.set(data[key] || '');
                        if (hField.assignSelectFields && hField.assignAddr) {
                            BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(hField.assignAddr, this.dataGet()), {
                                cache: true,
                            }).then(({response}) => {
                                let res = response.data;
                                if (res && res[0]) {
                                    hField.assignSelectFields.forEach((name) => {
                                        let assignCom = self.editModule.getDom(name);
                                        assignCom && assignCom.set(res[0][name]);
                                    });
                                    let data = this.dataGet();
                                    this.fields.forEach((field) => {
                                        if (field.elementType === 'lookup') {
                                            let lCom = self.editModule.getDom(field.name);
                                            if (!data[field.lookUpKeyField]) {
                                                lCom.set('');
                                            } else {
                                                let options = this.lookUpData[field.name] || [];
                                                for (let opt of options) {
                                                    if (opt.value == data[field.lookUpKeyField]) {
                                                        lCom.set(opt.value);
                                                    }
                                                }
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    }
                }
            }
        };
    }

    private _lookUpData: objOf<ListItem[]> = {};
    get lookUpData() {
        return this._lookUpData || {};
    }

    private get lookup(): Promise<void> {
        if (tools.isEmpty(this._lookUpData)) {
            let allPromise = this.para.fm.fields.filter(col => col.elementType === 'lookup')
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

    private setLookUp(data:obj){
        if (tools.isEmpty(data)){
            return;
        }
        this.lookup.then(()=>{
            this.para.fm.fields.forEach((field) => {
                if (field.elementType === 'lookup') {
                    let lCom = this.editModule.getDom(field.name);
                    if (field.elementType === 'lookup') {
                        let lCom = this.editModule.getDom(field.name);
                        if (!data[field.lookUpKeyField]) {
                            lCom.set('');
                        } else {
                            let options = this.lookUpData[field.name] || [];
                            for (let opt of options) {
                                if (opt.value == data[field.lookUpKeyField]) {
                                    lCom.set(opt.value);
                                }
                            }
                        }
                    }
                }
            });
        })
    }
    // 处理分组
    private getGroupFormPara(groupInfo: IGroupInfo, fields: R_Field[], wrapper: HTMLElement): obj {
        if (tools.isEmpty(groupInfo.cloNames)) {
            return fields;
        }
        let groupsArr = groupInfo.cloNames.split(','),
            groupFields: R_Field[] = [],
            fieldsArr = [...fields];
        groupsArr.forEach(field => {
            let gFields = fieldsArr.filter(f => f.name === field);
            if (tools.isNotEmptyArray(gFields)) {
                groupFields.push(gFields[0]);
                let index = fieldsArr.indexOf(gFields[0]);
                fieldsArr.splice(index, 1);
            }
        });
        let cellsWrapper, groupWrapper = <div className="group-wrapper">
                <div className="group-title">{groupInfo.groupName}</div>
                {cellsWrapper = <div className="group-cells-wrapper"/>}
            </div>,
            emPara: ComInitP[] = [];
        wrapper.appendChild(groupWrapper);
        for (let i = 0; i < groupFields.length; i++) {
            let f = groupFields[i],
                className = ListItemDetail.COLUMN_CLASS_ARR[parseInt(groupInfo.columnNumber) - 1],
                type = DetailModal.getType(f.dataType || f.atrrs.dataType || '');
            if (~['textarea', 'file', 'img'].indexOf(type)) {
                className = 'one-column';
            }
            emPara.push(this.handleField(f, cellsWrapper, className));
        }
        return {
            fields: fieldsArr,
            para: emPara
        };
    }

    // 获取数据
    private dataGet() {
        let data = this.editModule.get();
        this.para.fm.fields.forEach(field => {
            let name = field.name,
                val = field.atrrs.defaultValue;
            if (field.noEdit && !tools.isEmpty(val)) {
                data[name.toLowerCase()] = val;
            }
        });
        return data;
    }

    // 上一页下一页加载数据
    changePage(page?: number):Promise<void> {
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
        this.scrollToTop();
        return this.getDefaultData().then(data => {
            if (tools.isEmpty(data)) {
                this.fields.forEach(f => {
                    if (!f.noShow) {
                        this.editModule.getDom(f.name).set('');
                    }
                });
            } else {
                this.editModule.set(data);
                this.setLookUp(data);
            }
            this.isEdit = this.para.isEdit;
        });
    }

    // 加载数据后滚动到最顶部
    private scrollToTop() {
        (function smoothscroll() {
            let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                window.scrollTo(0, currentScroll - (currentScroll / 5));
            }
        })();
    }

    // 初始化上一页下一页按钮
    private prev: Button = null;
    private next: Button = null;

    private initPageButtons(wrapper?: HTMLElement) {
        let btnWrapper = wrapper ? wrapper : <div className="page-buttons"/>;
        this.wrapper.appendChild(btnWrapper);
        this.prev = new Button({
            content: '上一页',
            className: 'list-detail-btn',
            container: btnWrapper,
            onClick: () => {
                if (this.currentPage !== 1) {
                    if (this.isEdit && this.checkIsSave()) {
                        Modal.confirm({
                            msg: '还有数据未保存，确定跳转上一页吗?',
                            callback: (flag) => {
                                if (flag) {
                                    let current = this.currentPage - 1;
                                    this.changePage(current);
                                }
                            }
                        })
                    } else {
                        let current = this.currentPage - 1;
                        this.changePage(current);
                    }
                }
            }
        });
        this.next = new Button({
            content: '下一页',
            container: btnWrapper,
            onClick: () => {
                if (this.currentPage !== this.totalNumber) {
                    if (this.isEdit && this.checkIsSave()) {
                        Modal.confirm({
                            msg: '还有数据未保存，确定跳转下一页吗?',
                            callback: (flag) => {
                                if (flag) {
                                    let current = this.currentPage + 1;
                                    this.changePage(current);
                                }
                            }
                        })
                    } else {
                        let current = this.currentPage + 1;
                        this.changePage(current);
                    }
                }
            },
            className: 'list-detail-btn'
        });
        this.checkPageButtonDisabled();
    }

    private checkIsSave(): boolean {
        let data = this.editModule.get(),
            defaultData = this.defaultData;
        for (let key in defaultData) {
            if (tools.isNotEmpty(defaultData[key])) {
                if (defaultData[key] != data[key]) {
                    return true;
                }
            } else {
                if (tools.isNotEmpty(data[key])) {
                    return true;
                }
            }
        }
        return false;
    }

    // 检测上一页下一页按钮是否可用
    private checkPageButtonDisabled = () => {
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

    private actionSheet: ActionSheet;
    private saveBtn: Button;
    private updateBtn: Button;
    private cancelBtn: Button;
    private updateBtnPara: R_Button;
    private moreBtn: Button;
    private actionButtons: Button[] = []; // PC端专用

    private initAllButtons() {
        let subButtons: R_Button[] = this.para.fm.subButtons,
            buttons: R_Button[] = [],
            self = this;

        // 更多按钮
        function createMoreBtn(buttons: R_Button[], wrapper: HTMLElement) {
            self.moreBtn = new Button({
                content: '更多',
                className: 'more',
                container: wrapper,
                onClick: () => {
                    // 点击更多
                    self.actionSheet.isShow = true;
                }
            });
            let actionBtns: IActionSheetButton[] = [];
            buttons.forEach((b) => {
                actionBtns.push({
                    content: b.caption,
                    onClick: () => {
                        subBtnEvent(b);
                    }
                });
            });
            self.actionSheet = new ActionSheet({
                buttons: actionBtns
            });
        }

        // 创建PC按钮
        function createPcButtons(buttons: R_Button[], wrapper: HTMLElement) {
            buttons.forEach((btn) => {
                self.actionButtons.push(new Button({
                    content: btn.caption,
                    // icon: btn.icon && btn.icon.split(' ')[1],
                    // iconPre: btn.icon && btn.icon.split(' ')[0],
                    custom: btn,
                    className: 'action-btn',
                    onClick: () => {
                        subBtnEvent(btn);
                    },
                    container: wrapper
                }));
            });
        }

        function createEditBtn(wrapper: HTMLElement) {
            self.updateBtn = new Button({
                content: '编辑',
                className: 'edit-btn',
                container: wrapper,
                onClick: () => {
                    self.isEdit = true;
                }
            });
            self.saveBtn = new Button({
                content: '保存',
                className: 'edit-btn',
                container: wrapper,
                onClick: () => {
                    if (self.validate()) {
                        // 验证成功
                        self.updateBtnPara.refresh = 0;
                        ButtonAction.get().clickHandle(self.updateBtnPara, self.editModule.get(), () => {
                            self.isEdit = false;
                        }, self.para.url || '');
                    }
                }
            });
            self.cancelBtn = new Button({
                content: '取消',
                className: 'edit-btn',
                container: wrapper,
                onClick: () => {
                    self.getDefaultData().then((data) => {
                        self.editModule.set(data);
                        self.setLookUp(data);
                        self.isEdit = false;
                    });
                }
            })
        }

        if (tools.isNotEmpty(subButtons)) {
            subButtons.forEach(btn => {
                if (btn.subType === 'update_save') {
                    this.updateBtnPara = btn;
                } else {
                    buttons.push(btn);
                }
            });
            if (tools.isNotEmpty(buttons)) {
                let btnWrapper = <div className="list-item-detail-buttons"/>;
                this.wrapper.appendChild(btnWrapper);
                if (tools.isMb) {
                    createMoreBtn(buttons, btnWrapper);
                    createEditBtn(btnWrapper);
                    this.initPageButtons();
                } else {
                    // PC 按钮
                    let pcBtnWrapper = <div className="item-buttons"/>,
                        pageBtnWrapper = <div className="page-buttons"/>;
                    if (tools.isNotEmpty(buttons)) {
                        btnWrapper.appendChild(pcBtnWrapper);
                        createEditBtn(pcBtnWrapper);
                        createPcButtons(buttons, pcBtnWrapper);
                    }
                    this.initPageButtons(pageBtnWrapper);
                    btnWrapper.appendChild(pageBtnWrapper);
                }
            }
        }

        // 处理按钮触发
        function subBtnEvent(btn: R_Button) {
            switch (btn.subType) {
                case 'insert_save':
                    btn.refresh = 0;
                    new DetailModal(Object.assign({}, self.para, {
                        defaultData: {},
                        isAdd: true,
                        isPC: !tools.isMb,
                        confirm(data) {
                            return new Promise((resolve) => {
                                ButtonAction.get().clickHandle(btn, data, () => {
                                    self.totalNumber += 1;
                                    self.changePage();
                                    resolve();
                                });
                            })
                        }
                    }));
                    break;
                case 'delete_save': {
                    if (self.totalNumber !== 0) {
                        btn.refresh = 0;
                        ButtonAction.get().clickHandle(btn, self.defaultData, () => {
                            // 删除后显示下一页，如果已是最后一页，则显示上一页
                            let currentPage = self.currentPage >= self.totalNumber ? self.currentPage - 1 : self.currentPage;
                            self.totalNumber = self.totalNumber - 1;
                            self.changePage(currentPage);
                        });
                    } else {
                        Modal.alert('无数据可以删除!');
                    }
                }
                    break;
                default:
                    // 其他按钮
                    ButtonAction.get().clickHandle(btn, self.defaultData, () => {
                    }, self.para.url || '');
                    break;
            }
        }
    }

    private _isEdit: boolean;
    set isEdit(isEdit: boolean) {
        this._isEdit = isEdit;
        if (this.totalNumber === 0) {
            this.cancelBtn.disabled = true;
            this.updateBtn.disabled = true;
            this.saveBtn.disabled = true;
            tools.isNotEmpty(this.moreBtn) && (this.moreBtn.disabled = false);
            this.fields.forEach(f => {
                if (!f.noShow && !f.noEdit) {
                    this.editModule.getDom(f.name).disabled = true;
                }
            });
            if (tools.isPc) {
                this.actionButtons.forEach(btn => {
                    btn.disabled = btn.custom.subType !== 'insert_save';
                })
            }
        } else {
            if (tools.isPc) {
                this.actionButtons.forEach(btn => {
                    btn.disabled = isEdit;
                })
            }
            this.cancelBtn.disabled = !isEdit;
            this.updateBtn.disabled = isEdit;
            this.saveBtn.disabled = !isEdit;
            tools.isNotEmpty(this.moreBtn) && (this.moreBtn.disabled = isEdit);
            this.fields.forEach(f => {
                if (!f.noShow && !f.noEdit) {
                    this.editModule.getDom(f.name).disabled = !isEdit;
                }
            })
        }
    }

    get isEdit() {
        return this._isEdit;
    }

    private validate() {
        let result: obj = this.editModule.validate.start();
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


    destroy() {
        this.fields.forEach(field => {
            if (!field.noShow) {
                let com = this.editModule.getDom(field.name);
                com.destroy();
            }
        });
        this.fields = null;
        this.editModule = null;
        this.defaultData = null;
        this.prev.destroy();
        this.next.destroy();
        super.destroy();
    }
}