/// <amd-module name="ActiveConfig"/>
import {CommonConfig, ICommonConfigPara} from "./commonConfig";
interface IActiveDataPara {
    creuumber? : string,
    creunit? : string,
    radius? : string,
    assess? : string,
    intmanager? : string,
    intorganizer? : string
}
export class ActiveConfig extends CommonConfig{
    constructor(para : ICommonConfigPara){
        super(para);

    }
    protected getSaveUrl(){
        return LE.CONF.ajaxUrl.activeConfigSave;
    }
    protected getSettingUrl(){
        return LE.CONF.ajaxUrl.activeConfig
    }
    protected bodyInit() : HTMLElement{
        if(!this._tpl){
            this._tpl = <div className="setting config-param-page">
                <div className="set credit-setting">
                    <div>1学分&nbsp;=&nbsp;</div>
                    <div className="line"></div>
                    <div className="credit-content">
                        <div className="credit-num">
                            <input data-name="crenumber" min="0" className="default"  type="number"></input> 注:数值，如100
                        </div>
                        <div className="credit-unit">
                            <input data-name="creunit" className="default"  type="text"></input> 注:单位，如积分
                        </div>
                    </div>
                </div>
                <div className="set default-radius">默认签到半径:&nbsp;&nbsp;
                    <input data-name="radius" min="0" className="default"  type="number"></input> 米
                </div>
                <div className="set default-evaluate-time">默认评价截止时间: &nbsp;&nbsp;活动后&nbsp;&nbsp;
                    <input data-name="assess" min="0" className="default"  type="number"></input> 天
                </div>
                <div className="set default-evaluate-time">默认角色积分倍数: &nbsp;&nbsp;管理者&nbsp;&nbsp;
                    <input data-name="intmanager" min="0" className="default"  type="number"></input> &nbsp;&nbsp;组织者&nbsp;&nbsp;
                    <input data-name="intorganizer" min="0" className="default"  type="number"></input> 倍
                </div>
                <div className="set btns">
                    <div className="btn editing">编辑</div>
                    <div className="btn save">保存</div>
                </div>
            </div>;
        }
        return this._tpl;
    }
}
