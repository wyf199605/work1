/// <amd-module name="FaceRecognition"/>
import {CommonConfig, ICommonConfigPara} from "./commonConfig";
import d = G.d;
interface IFaceRecognitionDataPara {
    facerecognition : string,
    isopen : number
}
export class FaceRecognition extends CommonConfig{
    constructor(para : ICommonConfigPara){
        super(para);
    }
    protected getSettingUrl(){
        return LE.CONF.ajaxUrl.faceRecognition
    }

    protected radioSetting(setting : IFaceRecognitionDataPara){
        let isOpen = setting.isopen,
            yes = d.query('#yes', this.tpl()) as HTMLInputElement,
            no = d.query('#no', this.tpl()) as HTMLInputElement;

        if(isOpen === 0){
            yes.checked = true;
            no.checked = false
        }else if(isOpen === 1){
            yes.checked = false;
            no.checked = true
        }
    }

    protected getSaveUrl(){
        return LE.CONF.ajaxUrl.faceRecognitionSave;
    }

    protected radioSave(ajaxData) : obj{
        let yes = d.query('#yes', this.tpl()) as HTMLInputElement;
        if(yes.checked){
            ajaxData.isopen = 0;
        }else {
            ajaxData.isopen = 1;
        }
        return ajaxData;
    }

    protected bodyInit() : HTMLElement{
        if(!this._tpl){
            this._tpl = <div className="setting config-param-page">
                <div className="set">签到人脸通过率:
                    <input data-name="facerecognition" className="default" placeholder="百分数，如60%" type="text"></input> %
                </div>
                <div className="set select-set">
                    <span className="explain">启用状态</span>
                    <input type="radio" className="normal" checked name="status" id="yes"></input>
                    <label htmlFor="yes">启用</label>
                    <input type="radio" className="normal" name="status" id="no"></input>
                    <label htmlFor="no">禁用</label>
                </div>
                <div className="set btns">
                    <div className="btn editing">编辑</div>
                    <div className="btn save">保存</div>
                </div>
            </div>
        }
        return this._tpl;
    }
}