/// <amd-module name="IntegrityNorm"/>
import {CommonConfig, ICommonConfigPara} from "./commonConfig";
interface IIntegrityNormData {
    intValue? : string,
    signIn? : string,
    absence? : string,
    assess? : string,
    missComment? : string,
    crePass? : string,
    crePunish? : string,
    signPunish? : string,
}
export class IntegrityNorm extends CommonConfig{
    constructor(para : ICommonConfigPara){
        super(para);
    }
    protected getSaveUrl(){
        return LE.CONF.ajaxUrl.integrityNormSave;
    }
    protected getSettingUrl(){
        return LE.CONF.ajaxUrl.integrityNorm;
    }
    protected bodyInit() : HTMLElement{
        if(!this._tpl){
            this._tpl = <div className="setting config-param-page">
                <div className="set">学生诚信初始值:
                    <input data-name="intvalue" className="base-manager-input default" type="text"></input>
                </div>
                <div className="set">
                    <div className="set-title">奖惩配置
                        <span className="set-tips">提示：奖励请输入正值；惩罚或扣分请输入负值；没奖没扣请输入0</span>
                    </div>
                    <div className="set-content">
                        <div className="set-item-group">
                            <span className="no-shrink">活动报名一次</span>
                            <input data-name="signin" className="base-manager-input default" type="text"></input>
                                <span className="no-shrink">活动缺勤一次</span>
                            <input data-name="absence" className="base-manager-input default" type="text"></input>
                                    <span>( 单课时活动，缺勤扣回报名所得诚信值，又按缺勤值惩罚；多课时活动签到其中一节课不回扣报名所得诚信值 )</span>
                        </div>
                        <div className="set-item-group">
                            <span className="no-shrink">活动评价一次</span>
                            <input data-name="assess" className="base-manager-input default" type="text"></input>
                                <span className="no-shrink">活动缺评一次</span>
                            <input data-name="misscomment" className="base-manager-input default" type="text"></input>
                        </div>
                        <div className="set-item-group">
                            <span className="no-shrink">证书通过一次</span>
                            <input data-name="crepass" className="base-manager-input default" type="text"></input>
                                <span className="no-shrink">证书惩罚一次</span>
                                <input data-name="crepunish" className="default" type="text"></input>
                                    <span>( 证书删除后，扣回证书通过所得诚信值。证书删除，扣回通过所得诚信值后再扣惩罚的诚信值 )</span>
                        </div>
                        <div className="set-item-group">
                            <span className="no-shrink">签到惩罚一次</span>
                            <input data-name="signpunish"  className="default" type="text"></input>
                                <span>( 违规签到或签到逃课，扣回报名所得诚信值，再扣该惩罚的诚信值 )</span>
                        </div>
                    </div>
                </div>
                <div className="set">
                    <div className="set-title">诚信规则（建议：文本描述）：</div>
                    <div className="set-content">
                        <p>"通知1：至2018.05.07起，诚信规则按以下调整</p>
                        <p>【活动诚信值】</p>
                        <p>1）单课时活动：报名活动一次得诚信值 +1； 缺勤活动一次扣除报名该活动所得诚信值 -1，再扣除缺勤诚信值 -1 。</p>
                        <p>2）多课时活动：报名活动一次的诚信值 +1； 当学生多课时中签到课时≥1，缺勤其中一节课，就扣除该节课的缺勤诚信值 -1。</p>
                        <p>3）课程被教师关闭后，学生所得诚信值不扣除。</p>
                        <p>【评价诚信值】</p>
                        <p>注：本系统中，不管单课时活动还是多课时活动，只能在评价期间内评价一次。参与其他学生评价的互评不算诚信值</p>
                        <p>4）评价活动一次得诚信值 +1；缺评活动一次扣诚信值 -1。</p>
                        <p>【证书诚信值】</p>
                        <p>5）证书申请认证通过一次得诚信值 +1；证书被删除将扣回该证书所得诚信值 -1。</p>
                        <p>6）若恶意重复提交证书，被审核员发现，删除且惩罚，则将扣回原来该证书所得诚信值 -1，再惩罚诚信值 -1。</p>
                        <p>【成绩补录诚信值】</p>
                        <p>注：因系统或其他非学生本人因素，造成无法签到，诚信值被扣。经联络员确认登记，可以通过补成绩返回被扣诚信值</p>
                        <p>7）单课时活动：补录学生成绩通过后，将补回，缺勤所扣的报名活动所得诚信值 +1；和补回缺勤扣除的诚信值 +1。</p>
                        <p>8）多课时活动：补录学生成绩通过后，将补回学生的缺勤扣除的诚信值 +1；若扣除报名所得诚信值，将补回该诚信值。</p>
                        <p>通知2：至2018.05.19起，学生签到违规或签到逃课被抽查到，将根据实际情况授予成绩或不授予成绩。诚信值将扣回报名所得诚信值 -1，再惩罚诚信值-1。"</p>
                    </div>
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


