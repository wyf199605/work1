import BasicPage from "../basicPage";
import {EditModule} from "../../module/edit/editModule";
import d = G.d;
import {Validate} from "../../../global/utils/validate";
import {Modal} from "global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import sys = BW.sys;
import tools = G.tools;
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {Popover} from "../../../global/components/ui/popover/popover";
export = class FormPage extends BasicPage {
    private editModule : EditModule;
    private validate : Validate;
    // private loading =  document.querySelector('.loading');

    constructor(form: HTMLElement, private para: EditPagePara) {
        super(para);
        let emPara: EditModulePara = {fields : []};
        let nameFields : {[name : string] : R_Field} = {};
        para.fm.fields.forEach(function (f) {
            nameFields[f.name] = f;

            let field = {

                dom: d.query(`[data-name="${f.name}"] [data-input-type]`, form),
                field: nameFields[f.name]
            };

            emPara.fields.push(field);

            if(['insert', 'associate'].indexOf(para.uiType) > -1 ? field.field.noModify : field.field.noEdit){
                field.dom && field.dom.classList.add('disabled');
            }

        });

        // for (let i = 0,dom; dom = domList.item(i); i ++){
        //
        //     let field = {
        //         dom : <HTMLElement>dom.querySelector('[data-input-type]'),
        //         field : nameFields[dom.dataset.name]
        //     };
        //
        //     emPara.fields.push(field);
        //
        //     if(['insert', 'associate'].indexOf(para.uiType) > -1 ? field.field.noModify : field.field.noEdit){
        //         field.dom.classList.add('disabled');
        //     }
        // }

        this.editModule = new EditModule(emPara);

        // 编辑标识
        this.initData();
        this.initEvent();
        // this.initValidate();
    }


    private initEvent(){
        let self = this,
            para = this.para,
            saveBtn = (function () {
                for(let btn of para.fm.subButtons){
                    if(btn.subType === 'save'){
                        return btn;
                    }
                }
                return null;
            }());

        // 事件绑定

        // 1. subButtons > 1 or == 1
        // > 1 => new Popover()
        // == 1
        let target: HTMLElement = this.para.dom.querySelector('.btn-group.sub-btn');
        if(tools.isMb) {
            if (para.fm.subButtons.length > 1) {
                let items = para.fm.subButtons.map((item) => {
                    return {
                        title: item.title,
                        icon: item.icon
                    };
                });
                let popover = new Popover({
                    items: items,
                    target: target,
                    isBackground: false,
                    onClick: (index) => {
                        popover.show = false;
                        subBtnEvent(index);
                    }
                });
            } else {
                d.on(target, 'click', (e: Event) => {
                    e.stopPropagation();
                    subBtnEvent(0);
                })
            }
        }else{
            d.on(target, 'click', 'button', function (e: Event) {
                e.stopPropagation();
                subBtnEvent(this.dataset.index);
            })
        }

        function subBtnEvent(index){
            let btn = para.fm.subButtons[index],
                pageData = self.dataGet();
            switch (btn.subType) {
                case 'save' :
                    // if(!self.validateFormData(pageData)){
                    //     return false;
                    // }
                    btn.hintAfterAction = true;
                    self.save(btn, pageData);
                    break;
                case 'action':
                    // if(!self.validateFormData(pageData)){
                    //     return false;
                    // }
                    saveBtn.hintAfterAction = false;
                    // 先保存再发送
                    self.save(saveBtn, pageData, function () {
                        ButtonAction.get().clickHandle(btn, self.dataGet(), ()=>{}, self.url);
                    });
                    break;
            }
        }
    };
    private dataGet(){
        let data = this.editModule.get();
        this.para.fm.fields.forEach(field => {
            let name = field.name,
                val = field.atrrs.defaultValue;

            if(field.noEdit && !tools.isEmpty(val)){
                data[name] = val;
            }
        });

        return data;
    }

    private initValidate(){
        let fields = this.para.fm.fields;
        this.validate = new Validate();
        fields.forEach((field) => {
            let attrArr = [];
            for(let key in field.atrrs) {
                attrArr.push({
                    title: field.caption,
                    name: key,
                    value: field.atrrs[key]
                });
            }
            this.validate.add(field.name, attrArr);
        });
    }

    private validateFormData(pageData: obj){
        // let errorResult = this.validate.start(pageData);
        //
        // if(sys.isMb){
        //     // let res = errorResult[0];
        //     // if(res){
        //     //     Modal.alert(res.errMsg);
        //     // }
        //
        //     return true;
        // }else{
        //     this.para.fm.fields.forEach(field => {
        //         this.editModule.getDom(field.name).error(false);
        //     });
        //
        //     errorResult.forEach(res => {
        //         this.editModule.getDom(res.dataName).error(true,res.errMsg);
        //     });
        //
        //     return !errorResult[0];
        // }


    }
    /**
     * 新增/修改
     * @param btn
     * @param pageData
     * @param callback
     */
    private save(btn:R_Button, pageData : obj, callback?){
        ButtonAction.get().clickHandle(btn, pageData, response => {
            btn.buttonType = 2;
            let data = response.data && response.data[0] ? response.data[0] : null;
            if(data){
                this.editModule.set(data);
            }

            typeof callback === 'function' && callback(response);
        },this.url);
    }

    /**
     * 初始化数据
     */
    private initData(){
        let form = this.para.fm;
        let addOldField = (data: obj) => {

            // 获取有OLD_开头的字段
            let btns = form.subButtons,
                varList: R_VarList[] = [];
            Array.isArray(btns) && btns.forEach(btn => {
                let addr = btn.actionAddr;
                if(addr && Array.isArray(addr.varList)){
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
        if(form.dataAddr){
            BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(form.dataAddr))
                .then(({response}) => {
                    //	    alert(JSON.stringify(response));
                    let data = response.data[0];
                    if (!data) {
                        Modal.alert('数据为空');
                        return;
                    }

                    // debugger;
                    data = addOldField(data);

                    //    ajaxLoadedData = response.data[0];
                    this.editModule.set(data);
                    //    初始数据获取，不包含收件人id
                    // startData = getPageData();
                    if (form.updatefileData) {
                        BwRule.Ajax.fetch(BwRule.reqAddr(form.updatefileData, data), {
                            silent: true
                        });
                    }
                });
                // Rule.ajax(BW.CONF.siteUrl + Rule.reqAddr(form.dataAddr), {
            //     success: (response) => {
            //         //	    alert(JSON.stringify(response));
            //         let data = response.data[0];
            //         if (!data) {
            //             Modal.alert('数据为空');
            //             return;
            //         }
            //
            //         // debugger;
            //         data = addOldField(data);
            //
            //         //    ajaxLoadedData = response.data[0];
            //         this.editModule.set(data);
            //         //    初始数据获取，不包含收件人id
            //         // startData = getPageData();
            //         if (form.updatefileData) {
            //             Rule.ajax(Rule.reqAddr(form.updatefileData,  data), {
            //                 silent: true
            //             });
            //         }
            //     }
            // });
        }
    }
}