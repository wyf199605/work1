/// <amd-module name="PersonCenter"/>
import SPAPage = G.SPAPage;
import {LeRule} from "../../common/rule/LeRule";
import d = G.d;
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {ListData} from "../../../global/components/ui/dropdown/dropdown";
interface ISysManagerPagePara {
    department : string,
    id : string,
    personname : string,
    jobnumber : string,
    personpassword : string,
    phonenumber : string,
    jobtitle : string,
    research : string,
    img : string
}
export class PersonCenter extends SPAPage{
    private select : SelectInput;
    protected init(para: Primitive[], data?) {
        this.setting();
    }

    private setting(){
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.personCenter).then(({response}) => {
            let setting = response && response.data && response.data[0],
                texts = d.queryAll('input[data-name][type="text"]', this.wrapper),
                textArea = d.query('[data-name="research"]',this.wrapper);

            textArea && texts.push(textArea);
            texts.forEach((obj: HTMLInputElement) => {
                let dataName = obj.dataset.name.toLocaleUpperCase();
                if (dataName in setting) {
                    obj.value = setting[dataName];
                }
            });
            if('JOBTITLE' in setting){
                this.select.set(setting['JOBTITLE']);
            }
        })
    }

    set title(t: string) {
        this._title = t;
    }

    get titlt() {
        return this._title;
    }

    protected wrapperInit() {
        let tpl = <div className="system-manager-page">
            <div className="sys-item-group">
                <span className="sys-title">所属院系：</span>
                <input data-name="department" className="base-system-input sys-disabled" type="text"/>
            </div>
            <div className="sys-item-group">
                <span className="sys-title">账户：</span>
                <input data-name="id" className="base-system-input sys-disabled" type="text"/>
            </div>
            <div className="sys-item-group">
                <span className="sys-title">姓名：</span>
                <input data-name="personname" className="base-system-input" type="text"/>
            </div>
            <div className="sys-item-group">
                <span className="sys-title">工号：</span>
                <input data-name="jobnumber" className="base-system-input" type="text"/>
            </div>
            <div className="sys-item-group">
                <span className="sys-title">新密码：</span>
                <input data-name="personpassword" className="base-system-input" type="text"/>
            </div>
            <div className="sys-item-group">
                <span className="sys-title">手机号码：</span>
                <input placeholder="请输入新密码" data-name="phonenumber" className="base-system-input" type="text"/>
            </div>
            <div className="sys-item-group">
                <span className="sys-title">职称：</span>
                <div data-name="jobtitle" class=""></div>
            </div>
            <div className="sys-item-group">
                <span className="sys-title">研究方向：</span>
                <textarea placeholder="不超过64个字" data-name="research" maxlength="64" name="" id="" cols="30" rows="6"></textarea>
            </div>
            <div className="sys-item-group">
                <span className="sys-title">图片：</span>
                <input  className="base-system-input" type="text"/>
            </div>
            <div className="sys-item-group">
                <div class="save btn">保存</div>
            </div>
        </div>,
            jobTitle = d.query('[data-name="jobtitle"]', tpl),
            saveBtn = d.query('.save', tpl);

        this.select = new SelectInput({
            container : jobTitle,
            readonly : true,
            ajax : {
                fun : (url, value, callback : (data: ListData) => void) => {
                    LeRule.Ajax.fetch(url,{
                        type : 'json'
                    }).then(({response}) => {
                        let data = [];
                        response.data.forEach(obj => {
                            data.push({
                                value : obj.JOBTITLE,
                                text : obj.JOBTITLE,
                            })
                        });
                        callback(data);
                    });
                },
                url : LE.CONF.ajaxUrl.jobTitle
            }
        });

        d.on(saveBtn, 'click', () => {
            let texts = d.queryAll('[data-name]', this.wrapper),
                ajaxData = {};

            texts.forEach((input : HTMLInputElement) =>{
                let name = input.dataset.name;
                ajaxData[name] = input.value;
                if(name === 'jobtitle'){
                    ajaxData[name] = this.select.getText();
                }
            });
            console.log(ajaxData);
        });
        return tpl;
    }
}