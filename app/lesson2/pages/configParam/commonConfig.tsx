/// <amd-module name="CommonConfig"/>
import d = G.d;
import {LeRule} from "../../common/rule/LeRule";
import {LeBasicPage} from "../LeBasicPage";
export interface ICommonConfigPara {
    container : HTMLElement
}
export class CommonConfig extends LeBasicPage{
    isSetting : boolean = false;

    init(){
        d.append(this.para.container, this.tpl());
        this.initEven();
        this.setting(this.getSettingUrl());
    }

    protected getSettingUrl(){
        return '';
    }
    initEven(){
        let tpl = this.tpl(),
            editBtn = d.query('.editing',tpl),
            saveBtn = d.query('.save',tpl);

        d.on(editBtn, 'click', () => {
            tpl.classList.add('edit');
        });
        d.on(saveBtn, 'click', () => {
            tpl.classList.remove('edit');
            this.ajaxLoad(this.getSaveUrl(),{
                dataType : 'json',
                data : JSON.stringify(this.getAjaxData()),
                type : 'post'
            }).then(({response}) => {
                console.log(response)
            })
        });
    }

    protected getAjaxData(){
        let inputs = d.queryAll('input[data-name]', this.tpl()),
            ajaxData = {};

        inputs.forEach((obj : HTMLInputElement) => {
            ajaxData[obj.dataset.name] = obj.value;
        });
        ajaxData = this.radioSave(ajaxData);
        console.log({saveparam : ajaxData});
        return {saveparam : ajaxData};

    }

    protected radioSave(ajaxData) : obj{
        return ajaxData;
    }

    protected getSaveUrl(){
        return '';
    }

    setting(item:string){
        if(this.isSetting){
            return;
        }
        this.isSetting = true;

        this.ajaxLoad(item, {
            dataType: 'json'
        }).then(({response}) => {
            let setting = response && response.data && response.data.data[0],
                texts = d.queryAll('input[data-name][type="text"]', this.tpl()),
                nums = d.queryAll('input[data-name][type="number"]', this.tpl()),
                checks = d.queryAll('input[data-name][type="checkbox"]', this.tpl());

            texts = texts.concat(nums);
            if(G.tools.isEmpty(setting)){
                return;
            }
            texts.forEach((obj : HTMLInputElement) => {
                let dataName = obj.dataset.name.toLocaleUpperCase();
                if(dataName in setting){
                    obj.value = setting[dataName];
                }
            });

            checks.forEach((obj : HTMLInputElement) => {
                let dataName = obj.dataset.name.toLocaleUpperCase();
                if(dataName in setting){
                    let num = setting[dataName];
                    if(num === 0){
                        obj.checked = true;
                    }else if (num === 1){
                        obj.checked = false;
                    }
                }
            });

            let obj = {};
            for(let item in setting){
                obj[item.toLocaleLowerCase()] = setting[item];
            }

            this.radioSetting(obj);
        });
    }

    protected radioSetting(setting){

    }

    protected ajaxLoad(url : string, setting){
        return LeRule.Ajax.fetch(url,setting)
    }

    protected _tpl : HTMLElement;
    protected tpl() : HTMLElement{
        if(!this._tpl){
            this._tpl = <div></div>;
        }
        return this._tpl;
    }
}