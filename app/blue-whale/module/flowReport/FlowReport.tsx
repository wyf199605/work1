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

export class FlowReport extends BasicPage {
    private editModule: EditModule;
    private para: EditPagePara;
    private instance: number;

    constructor(para: EditPagePara) {
        super(para);
        this.instance = Number(tools.url.getPara('instance'));
        this.para = para;
        let emPara: EditModulePara = {fields: []};
        let nameFields: { [name: string]: R_Field } = {};
        let form = this.createFormWrapper(para.fm.fields);
        para.fm.fields.forEach(function (f) {
            nameFields[f.name] = f;
            let field = {
                dom: d.query(`[data-name="${f.name}"] [data-input-type]`, form),
                field: nameFields[f.name]
            };
            emPara.fields.push(field);
            if (['insert', 'associate'].indexOf(para.uiType) > -1 ? field.field.noModify : field.field.noEdit) {
                field.dom && field.dom.classList.add('disabled');
            }
        });
        this.editModule = new EditModule(emPara);

        // 编辑标识
        this.initData();
        this.initEvent();
    }

    private createFormWrapper(fields: R_Field[]): HTMLElement {
        if (tools.isMb) {
            let muiContent = d.query('.mui-content'),
                formWrapper = <div className="form-wrapper"/>;
            muiContent.appendChild(formWrapper);
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && field.noAdd) || (this.para.uiType == 'update' && field.noShow) || (this.para.uiType == 'flow' && field.noShow)) {
                    continue;
                }
                let span = null;
                if (field.comType == 'tagsInput') {
                    span = <span class="mui-icon mui-icon-plus" data-action="picker"/>;
                } else if (field.comType == 'file') {
                    span = <span class="mui-icon mui-icon-paperclip"/>;
                }
                let elementType = tools.isNotEmpty(field.elementType) ? field.elementType : '';
                let formGroupWrapper = <div class="mui-input-row label-input" data-name={field.name}
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
            let formWrapper = d.query('#flowForm', this.para.dom);
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                if (((this.para.uiType == 'insert' || this.para.uiType == 'associate') && field.noAdd) || (this.para.uiType == 'update' && field.noShow) || (this.para.uiType == 'flow' && field.noShow)) {
                    continue;
                }
                let formGroupWrapper: HTMLElement = null;
                let isHide = ((this.para.uiType == 'insert' || this.para.uiType == 'associate') && field.noAdd) || (this.para.uiType == 'update' && field.noShow);
                switch (field.comType) {
                    case 'input': {
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
                            <div className="list-left width-8" title={field.caption}><label>{field.caption}</label></div>
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

    private initEvent() {
        let self = this,
            para = this.para,
            saveBtn = (function () {
                for (let btn of para.fm.subButtons) {
                    if (btn.subType === 'save') {
                        return btn;
                    }
                }
                return null;
            }());

        // 事件绑定
        if (tools.isMb) {
            let muiContent = d.query('.mui-content'),
                target: HTMLElement = null;
            if (tools.isNotEmptyArray(para.fm.subButtons)) {
                muiContent.style.paddingBottom = '70px';
                target = <div className="sub-btns"/>;
                muiContent.appendChild(target);
                para.fm.subButtons.map((item, index) => {
                    let btnWrapper: HTMLElement = <div className="sub-btn-item" data-index={index}>{item.caption}</div>;
                    target.appendChild(btnWrapper);
                });
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
                    if (!self.validate(pageData)) {
                        return false;
                    }
                    btn.hintAfterAction = true;
                    self.save(btn, pageData, function () {
                        if (tools.isMb){
                            sys.window.open({
                                url: BW.CONF.url.myApplication
                            });
                        }else{
                            sys.window.open({
                                url: BW.CONF.url.myApplicationPC
                            });
                        }
                    });
                    break;
                case 'submit':
                    if (!self.validate(pageData)) {
                        return false;
                    }
                    saveBtn.hintAfterAction = false;
                    // 先保存再发送
                    self.save(saveBtn, pageData, function () {
                        saveBtn.hintAfterAction = true;
                        ButtonAction.get().clickHandle(btn, self.dataGet(), () => {
                            // 提交成功回退到上一页
                            if (tools.isMb){
                                sys.window.open({
                                    url: BW.CONF.url.myApplication
                                });
                            }else{
                                sys.window.open({
                                    url: BW.CONF.url.myApplicationPC
                                });
                            }
                        }, self.url);
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
                    btn.hintAfterAction = true;
                    ButtonAction.get().clickHandle(btn, self.dataGet(), (response) => {
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
                                ButtonAction.get().clickHandle(btn, self.dataGet(), (response) => {
                                    modal.destroy();
                                }, self.url);
                            } else {
                                Modal.alert('备注不能为空!');
                            }
                        }
                    });
                }
                    break;
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

    private validate(pageData?: obj) {
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
        }, this.url);
    }

    /**
     * 初始化数据
     */
    private initData() {
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
            BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(form.dataAddr))
                .then(({response}) => {
                    //	    alert(JSON.stringify(response));
                    let data = response.data[0];
                    if (!data) {
                        Modal.alert('数据为空');
                        return;
                    }
                    data = addOldField(data);
                    this.editModule.set(data);
                    //    初始数据获取，不包含收件人id
                    if (form.updatefileData) {
                        BwRule.Ajax.fetch(BwRule.reqAddr(form.updatefileData, data), {
                            silent: true
                        });
                    }
                });
        }
    }
}

