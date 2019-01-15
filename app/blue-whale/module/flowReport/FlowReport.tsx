/// <amd-module name="FlowReport"/>
import BasicPage from "../../pages/basicPage";
import {EditModule} from "../../module/edit/editModule";
import d = G.d;
import {Modal} from "global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import tools = G.tools;
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import sys = BW.sys;
import {TextInput} from "../../../global/components/form/text/text";
import {ContactsModule} from "../flowDesigner/ContactsModule";
import {FlowEditor} from "../flowDesigner/FlowEditor";
import {ButtonBox} from "../../../global/components/mbList/ButtonBox";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import {PopBtnBox} from "../../../global/components/ui/actionSheet/popBtnBox";
import {FlowDesigner} from "../flowDesigner/FlowDesigner";

export class FlowReport extends BasicPage {
    private editModule: EditModule;
    private para: EditPagePara;
    private instance: number;
    private agreeBtn: R_Button = null;
    private rejectBtn: R_Button = null;

    constructor(para: EditPagePara) {
        super(para);
        this.instance = Number(tools.url.getPara('instance'));
        this.para = para;
        let emPara: EditModulePara = {fields: []},
            nameFields: { [name: string]: R_Field } = {},
            form = this.createFormWrapper(para.fm.fields),
            self = this,
            isInsert = tools.isNotEmpty(tools.url.getPara('task_id')) ? false : true,
            fields = para.fm.fields;
        para.fm.fields.forEach(function (f) {
            nameFields[f.name] = f;
            let field = {
                dom: d.query(`[data-name="${f.name}"] [data-input-type]`, form),
                field: nameFields[f.name],
                onExtra: (data, relateCols, isEmptyClear = false) => {
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
                                        let data = self.dataGet();
                                        fields.forEach((field) => {
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
            emPara.fields.push(field);
        });
        this.editModule = new EditModule(emPara);
        emPara.fields.forEach((f) => {
            let field = f.field,
                name = field.name,
                isNotEdit = isInsert ? field.noModify : field.noEdit;
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
        // 编辑标识
        this.initData(isInsert);
        this.initEvent();
        this.touchEvent.on();
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

    private createFormWrapper(fields: R_Field[]): HTMLElement {
        if (tools.isMb) {
            let muiContent = d.query('.mui-content'),
                formWrapper = <div className="form-wrapper"/>;
            muiContent.appendChild(formWrapper);
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i],
                    isHide = ((this.para.uiType == 'insert' || this.para.uiType == 'associate') && field.noAdd) || (this.para.uiType == 'update' && field.noShow) || field.noShow,
                    span = null;
                if (field.comType == 'tagsInput') {
                    span = <span class="mui-icon mui-icon-plus" data-action="picker"/>;
                } else if (field.comType == 'file') {
                    span = <span class="mui-icon mui-icon-paperclip"/>;
                }
                let elementType = tools.isNotEmpty(field.elementType) ? field.elementType : '';
                let formGroupWrapper = <div class={"mui-input-row label-input " + (isHide ? 'hide' : '')}
                                            data-name={field.name}
                                            data-type={field.comType} data-element-type={elementType}>
                    <label>{field.caption}</label>
                    <div data-input-type={field.comType}>
                        {span}
                    </div>
                </div>;
                formWrapper.appendChild(formGroupWrapper);
            }
            return muiContent;
        } else {
            // debugger
            let formWrapper = d.query('#flowForm', this.para.dom);
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                let formGroupWrapper: HTMLElement = null;
                let isHide = ((this.para.uiType == 'insert' || this.para.uiType == 'associate') && field.noAdd) || (this.para.uiType == 'update' && field.noShow) || field.noShow;
                switch (field.comType) {
                    case 'input':
                    case 'selectInput': {
                        formGroupWrapper =
                            <div className={'list-group-item col-xs-12 col-md-4 col-sm-6 ' + (isHide ? 'hide' : '')}
                                 data-name={field.name}>
                                <div className="list-left" title={field.caption}><label>{field.caption}</label></div>
                                <div className="list-right" data-input-type={field.comType}/>
                            </div>;
                    }
                        break;
                    case 'tagsInput': {
                        formGroupWrapper = <div className="list-group-item col-md-12" data-name={field.name}>
                            <div className="list-left width-8" title={field.caption}><label>{field.caption}</label>
                            </div>
                            <div className="list-right width-125" data-input-type={field.comType}
                                 title={field.caption}/>
                            <span className="fa fa-plus-square" data-action="picker"
                                  data-href={BW.CONF.siteUrl + field.dataAddr.dataAddr}/>
                        </div>;
                    }
                        break;
                    case 'file': {
                        formGroupWrapper =
                            <div className='list-group-item col-xs-12 col-md-4 col-sm-6' data-name={field.name}>
                                <div className="list-left" title={field.caption}><label>{field.caption}</label></div>
                                <div className="list-right" data-input-type={field.comType}/>
                            </div>;
                    }
                        break;
                    case 'richText': {
                        formGroupWrapper = <div className="list-group-item col-xs-12" data-name={field.name}>
                            <div className="list-left" title={field.caption}><label>{field.caption}</label></div>
                            <div className="list-right" data-input-type={field.comType} style="left: 9.5%"/>
                        </div>;
                    }
                        break;
                    case 'datetime': {
                        formGroupWrapper = <div className="list-group-item col-xs-12 col-md-4 col-sm-6 label-input"
                                                data-name={field.name}>
                            <div className="list-left" title={field.caption}><label>{field.caption}</label></div>
                            <div className="list-right" data-input-type={field.comType}/>
                        </div>;
                    }
                        break;
                    case 'toggle': {
                        formGroupWrapper =
                            <div className="list-group-item col-xs-12 col-md-4 col-sm-6" data-name={field.name}>
                                <div className="list-left" title={field.caption}><label>{field.caption}</label></div>
                                <div className="list-right" data-input-type={field.comType}/>
                            </div>;
                    }
                        break;
                }
                formWrapper.appendChild(formGroupWrapper);
            }
            return formWrapper;
        }
    }

    private touchEvent = (() => {
        let touch = (e) => {
            let detail = e.detail;
            switch (detail) {
                case 'cycle': {
                    let btn = this.agreeBtn;
                    btn.actionAddr.dataAddr += '&audit_memo=同意';
                    btn.hintAfterAction = true;
                    ButtonAction.get().clickHandle(btn, this.dataGet(), () => {
                        // sys.window.close();
                    }, this.url);
                }
                    break;
                case 'cross': {
                    let btn = this.rejectBtn;
                    btn.hintAfterAction = true;
                    let text: TextInput = null,
                        body = <div className='remark-wrapper'>
                            <div className="remark-title">操作备注:</div>
                            {text = <TextInput className='remark-input-wrapper'/>}
                        </div>;
                    let modal = new Modal({
                        body: body,
                        className: 'flow-remark-modal',
                        footer: {},
                        width: '310px',
                        isMb: false,
                        top: 120,
                        onOk: () => {
                            let audit_memo = text.get();
                            if (tools.isNotEmpty(audit_memo)) {
                                btn.actionAddr.dataAddr = tools.url.addObj(btn.actionAddr.dataAddr, {
                                    audit_memo: audit_memo
                                });
                                ButtonAction.get().clickHandle(btn, this.dataGet(), () => {
                                    modal.destroy();
                                }, this.url);
                            } else {
                                Modal.alert('备注不能为空!');
                            }
                        }
                    });
                }
                    break;
            }
        };
        return {
            on: () => d.on(this.dom, BasicPage.FlowReortRouch, touch),
            off: () => d.off(this.dom, BasicPage.FlowReortRouch, touch)
        }
    })();

    private initEvent() {
        let self = this,
            para = this.para,
            saveBtn = null,
            isShowContacts = false;
        for (let btn of para.fm.subButtons) {
            switch (btn.subType) {
                case 'save':
                    saveBtn = btn;
                    break;
                case 'agree':
                    self.agreeBtn = btn;
                    break;
                case 'reject':
                    self.rejectBtn = btn;
                    break;
            }
        }
        // 事件绑定
        if (tools.isMb) {
            let muiContent = d.query('.mui-content'),
                target: HTMLElement = null;
            if (tools.isNotEmptyArray(para.fm.subButtons)) {
                muiContent.style.paddingBottom = '70px';
                target = <div className="sub-btns"/>;
                muiContent.appendChild(target);
                let buttons = para.fm.subButtons || [];
                if (buttons.length <= 2) {
                    buttons.map((item, index) => {
                        let btnWrapper: HTMLElement = <div className="sub-btn-item" data-index={index}
                                                           data-type={item.subType}>{item.caption}</div>;
                        target.appendChild(btnWrapper);
                    });
                } else {
                    let showButtons = buttons.slice(0, 2),
                        hideButtons = buttons.slice(2);
                    if (tools.isNotEmpty(hideButtons)) {
                        let boxButtons = [];
                        hideButtons.forEach((btn, index) => {
                            boxButtons.push({
                                content: btn.caption,
                                onClick: () => {
                                    subBtnEvent(index + 2);
                                }
                            })
                        });
                        new PopBtnBox({
                            container: target,
                            buttons: boxButtons
                        });
                    }
                    showButtons.map((item, index) => {
                        let btnWrapper: HTMLElement = <div className="sub-btn-item" data-index={index}
                                                           data-type={item.subType}>{item.caption}</div>;
                        target.appendChild(btnWrapper);
                    });
                }
            }
            d.on(target, 'click', '.sub-btn-item', function (e: Event) {
                e.stopPropagation();
                subBtnEvent(this.dataset.index);
            });
        } else {
            let target: HTMLElement = this.para.dom.querySelector('.btn-group.sub-btn');
            d.on(target, 'click', 'button', function (e: Event) {
                e.stopPropagation();
                subBtnEvent(this.dataset.index);
            })
        }

        function subBtnEvent(index) {
            let btn = para.fm.subButtons[index],
                pageData = self.dataGet();
            switch (btn.subType) {
                case 'save':
                    if (!self.validate()) {
                        return false;
                    }
                    btn.hintAfterAction = true;
                    self.save(btn, pageData, () => {
                        if (tools.isPc) {
                            sys.window.open({
                                url: BW.CONF.url.myApplicationPC
                            })
                        }
                    });
                    break;
                case 'submit':
                    if (!self.validate()) {
                        return false;
                    }
                    saveBtn.hintAfterAction = false;
                    // 先保存再发送
                    saveBtn.refresh = 1;
                    self.save(saveBtn, pageData, function () {
                        btn.hintAfterAction = true;
                        ButtonAction.get().clickHandle(btn, pageData, () => {
                            // 提交成功回退到上一页
                            if (tools.isPc) {
                                sys.window.open({
                                    url: BW.CONF.url.myApplicationPC
                                })
                            }
                        }, tools.isMb ? BW.CONF.url.myApplication : self.url);
                    });
                    break;
                case 'with_draw':
                    btn.hintBeforeAction = true;
                    ButtonAction.get().clickHandle(btn, self.dataGet(), (response) => {
                        sys.window.open({
                            url: BW.CONF.siteUrl + '/' + response.body.bodyList[0].dataList[0] + '&page=flowReport'
                        });
                    }, self.url);
                    break;
                case 'agree': {
                    btn.actionAddr.dataAddr += '&audit_memo=同意';
                    btn.hintAfterAction = true;
                    ButtonAction.get().clickHandle(btn, self.dataGet(), () => {
                        // sys.window.close();
                    }, self.url);
                }
                    break;
                case 'reject': {
                    btn.hintAfterAction = true;
                    let text: TextInput = null,
                        body = <div className='remark-wrapper'>
                            <div className="remark-title">操作备注:</div>
                            {text = <TextInput className='remark-input-wrapper'/>}
                        </div>;
                    let modal = new Modal({
                        body: body,
                        className: 'flow-remark-modal',
                        footer: {},
                        width: '310px',
                        isMb: false,
                        top: 120,
                        onOk: () => {
                            let audit_memo = text.get();
                            if (tools.isNotEmpty(audit_memo)) {
                                btn.actionAddr.dataAddr = tools.url.addObj(btn.actionAddr.dataAddr, {
                                    audit_memo: audit_memo
                                });
                                ButtonAction.get().clickHandle(btn, self.dataGet(), () => {
                                    modal.destroy();
                                }, self.url);
                            } else {
                                Modal.alert('备注不能为空!');
                            }
                        }
                    });
                }
                    break;
                case 'add_sign': {
                    if (isShowContacts === false) {
                        isShowContacts = true;
                        BwRule.Ajax.fetch(BW.CONF.ajaxUrl.useAddressList_user,{
                            loading:{
                                msg:'加载中...',
                                disableEl:document.body
                            }
                        }).then(({response}) => {
                            let field = response.body.elements[0].cols[0];
                            new ContactsModule({
                                field: field,
                                onGetData: (datas) => {
                                    let userId = [];
                                    datas.forEach(data => {
                                        data['USERID'] && userId.push(data['USERID'].toLowerCase());
                                    });
                                    ButtonAction.get().clickHandle(btn, {USERID: userId}, () => {
                                        isShowContacts = false;
                                    }, self.url);
                                },
                                onDestroy: () => {
                                    isShowContacts = false;
                                }
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                }
                    break;
                case 'check': {
                    let dataAddr = BW.CONF.siteUrl + BwRule.reqAddr(btn.actionAddr,pageData);
                    BwRule.Ajax.fetch(dataAddr).then(({response}) => {
                        new FlowDesigner(response, 'look');
                    }).catch(err => {
                        console.log(err);
                    });
                }
                    break;
                default: {
                    ButtonAction.get().clickHandle(btn, pageData, () => {
                    }, self.url);
                }
                    break
            }
        }
    };

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

    private validate() {
        let result = this.editModule.validate.start();
        if (tools.isNotEmpty(result)) {
            for (let key in result) {
                Modal.alert(result[key].errMsg);
                return false;
            }
        } else {
            return true;
        }
    }


    /**
     * 新增/修改
     * @param btn
     * @param pageData
     * @param callback
     */
    private save(btn: R_Button, pageData: obj, callback?) {
        ButtonAction.get().clickHandle(btn, pageData, response => {
            btn.buttonType = 2;
            let data = response.data && response.data[0] ? response.data[0] : null;
            if (data) {
                this.editModule.set(data);
            }
            typeof callback === 'function' && callback(response);
        }, tools.isMb ? BW.CONF.url.myApplication : this.url);
    }

    /**
     * 初始化数据
     */
    private initData(isInsert?: boolean) {
        let form = this.para.fm;
        let addOldField = (data: obj) => {
            // 获取有OLD_开头的字段
            let btns = form.subButtons,
                varList: R_VarList[] = [];
            Array.isArray(btns) && btns.forEach(btn => {
                let addr = btn.actionAddr;
                if (addr && Array.isArray(addr.varList)) {
                    varList = varList.concat(addr.varList)
                }
            });
            BwRule.addOldField(BwRule.getOldField(varList), data);
            return data;
        };

        // 字段默认值
        let defaultVal = BwRule.getDefaultByFields(form.fields);
        this.editModule.set(defaultVal);

        // url请求默认值
        if (form.dataAddr) {
            Promise.all([BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(form.dataAddr)), this.lookup]).then(([{response}]) => {
                //	    alert(JSON.stringify(response));
                let data = response.data[0];
                if (!data) {
                    Modal.alert('数据为空');
                    return;
                }
                data = addOldField(data);
                if (isInsert) {
                    for (let key in data) {
                        tools.isEmpty(data[key]) && (delete data[key]);
                    }
                }
                this.editModule.set(data);
                form.fields.forEach((field) => {
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
                });
                //    初始数据获取，不包含收件人id
                if (form.updatefileData) {
                    BwRule.Ajax.fetch(BwRule.reqAddr(form.updatefileData, data), {
                        silent: true
                    });
                }
            });
        }
    }

    destroy() {
        this.touchEvent.off();
        this.editModule = null;
        this.para = null;
        this.agreeBtn = null;
        this.rejectBtn = null;
        super.destroy();
    }
}

