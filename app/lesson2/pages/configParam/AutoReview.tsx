/// <amd-module name="AutoReview"/>
import {CommonConfig, ICommonConfigPara} from "./commonConfig";
import d = G.d;
interface IAutoReviewDataPara {
    gradefirstcheck? : number,
    gradefinalcheck? : number,
    pass? : number,
    refuse? : number,
    declarefirstcheck? : number,
    declarefinalcheck? : number,
    crefirstcheck? : number,
    crefinalcheck? : number,
}

export class AutoReview extends CommonConfig {
    constructor(para: ICommonConfigPara) {
        super(para);
    }
    protected getSaveUrl(){
        return LE.CONF.ajaxUrl.autoReviewSave;
    }
    protected getSettingUrl(){
        return LE.CONF.ajaxUrl.autoReview
    }
    protected getAjaxData(){
        let inputs = d.queryAll('[data-name][type="checkbox"]', this.tpl()),
            radios = d.queryAll('input[type="radio"]', this.tpl()),
            ajaxData : IAutoReviewDataPara = {};
        inputs.forEach((check : HTMLInputElement) => {
            ajaxData[check.dataset.name] = check.checked ? 0 : 1;
        });
        radios.forEach((radio : HTMLInputElement) => {
            if(radio.checked){
                switch (radio.id){
                    case 'signsuccess':
                        ajaxData.pass = 0;
                        break;
                    case 'comment':
                        ajaxData.pass = 1;
                        break;
                    case 'nosign':
                        ajaxData.pass = 2;
                        break;
                    case 'signfail':
                        ajaxData.refuse = 0;
                        break;
                    case 'nocomment':
                        ajaxData.refuse = 1;
                        break;
                }
            }
        });

        return {saveparam : ajaxData}
        // console.log(ajaxData);
    }
    protected radioSetting(setting : IAutoReviewDataPara){
        switch (setting.pass){
            case 0:
                (d.query('#signsuccess', this.tpl()) as HTMLInputElement).checked = true;
                break;
            case 1:
                (d.query('#comment', this.tpl()) as HTMLInputElement).checked = true;
                break;
            case 2:
                (d.query('#nosign', this.tpl()) as HTMLInputElement).checked = true;
                break;
        }
        switch (setting.refuse){
            case 0:
                (d.query('#signfail', this.tpl()) as HTMLInputElement).checked = true;
                break;
            case 1:
                (d.query('#nocomment', this.tpl()) as HTMLInputElement).checked = true;
                break;
        }
    }

    protected bodyInit() {
        if (!this._tpl) {
            this._tpl = <div className="setting config-param-page">
               <div className="auto-review">
                   <div className="set tips">
                       <span className="set-tips">提示：自动审核执行数据为配置保存后开始生效，以往数据依然需要手动审核。</span>
                   </div>
                   <div className="set select line">
                       <div className="select-set">
                           <span className="explain bold-text">积分审批流程:</span>
                           <input data-name="gradefirstcheck" type="checkbox" className="normal" name="grade" id="start"></input>
                           <label htmlFor="start">成绩初审</label>
                           <input data-name="gradefinalcheck" type="checkbox" className="normal" name="grade" id="end"></input>
                           <label htmlFor="end">成绩终审</label>
                       </div>
                       <div className="select-set">
                           <span className="explain">通过/评分:</span>
                           <input type="radio" className="normal" checked name="sign" id="signsuccess"></input>
                           <label htmlFor="signsuccess">签到成功</label>
                           <input type="radio" className="normal" name="sign" id="comment"></input>
                           <label htmlFor="comment">签到成功且有评论</label>
                           <input type="radio" className="normal" name="sign" id="nosign"></input>
                           <label htmlFor="nosign">有无签到都可以</label>
                       </div>
                       <div className="select-set">
                           <span className="explain">拒绝/不评分:</span>
                           <input type="radio" className="normal" checked name="nsign" id="signfail"></input>
                           <label htmlFor="signfail">签到失败</label>
                           <input type="radio" className="normal" name="nsign" id="nocomment"></input>
                           <label htmlFor="nocomment">签到成功但未评论</label>
                       </div>
                   </div>
                   <div className="set select line">
                       <div className="flow"><span className="explain bold-text">活动申报流程:</span> <span
                           className="set-tips">（勾选的角色无需审核业务直接到达上一级审核，当所有的角色都勾选，代表直接所有角色都是直接执行终审权限）</span></div>
                       <div className="select-set">
                           <span className="explain"></span>
                           <input data-name="declarefirstcheck" type="checkbox" className="normal" name="apply" id="applystart"></input>
                           <label htmlFor="applystart">申报初审</label>
                           <input data-name="declarefinalcheck" type="checkbox" className="normal" name="apply" id="applyend"></input>
                           <label htmlFor="applyend">申报终审</label>
                       </div>
                   </div>
                   <div className="set select">
                       <div className="flow"><span className="explain bold-text">活动申报流程:</span> <span
                           className="set-tips">（勾选的角色无需审核，当最后一审无需审核，证书直接认证得分）</span></div>
                       <div className="select-set">
                           <span className="explain"></span>
                           <input data-name="crefirstcheck" type="checkbox" className="normal" name="auth" id="authstart"></input>
                           <label htmlFor="authstart">认证初审</label>
                           <input data-name="crefinalcheck" type="checkbox" className="normal" name="auth" id="authend"></input>
                           <label htmlFor="authend">认证终审</label>
                       </div>
                   </div>
                   <div className="set btns">
                       <div className="btn editing">编辑</div>
                       <div className="btn save">保存</div>
                   </div>
               </div>
            </div>

        }
        return this._tpl;
    }
}