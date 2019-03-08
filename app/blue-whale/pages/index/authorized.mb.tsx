/** 
  * 授权页面  登录模块 
*/
/// <amd-module name="Authorized"/>
import BasicPage from "basicPage";
import { BwRule } from "../../common/rule/BwRule";
import tools = G.tools;
import CONF = BW.CONF;
import { Modal } from "global/components/feedback/modal/Modal";
interface pagePara {
  dom?: HTMLElement,
  title?: string
}
type Name = string | number;
interface formPara {
  response_type: Name;///url上的query
  client_id: Name;///url上的query
  redirect_uri: Name;//url上的query
  userid?: Name;//用户名
  password?: Name;//密码
}
export class Authorized extends BasicPage {
  private container: HTMLElement; //页面挂载的父元素
  private showPassword: HTMLElement;//查看密码的按钮
  private userid: HTMLInputElement;//账号Input
  private password: HTMLInputElement;//密码Input
  private submitBtn: HTMLElement;//提交按钮
  private state: formPara;//提交给服务端的数据
  constructor(para: pagePara) {
    super(para);
    let urlObj = tools.url.getObjPara(location.href) as formPara;
    this.state = {
      response_type: urlObj.response_type,
      client_id: urlObj.client_id,
      redirect_uri: urlObj.redirect_uri
    }
    this.container = para.dom;
    G.d.append(this.container, this.render())
    this.event();
  }
  /**
   * 页面的事件绑定
   */
  event() {
    G.d.on(this.showPassword, 'click', (e) => {
      e.preventDefault();
      this.showPassword.classList.contains('active') ? this.showPassword.classList.remove('active') : this.showPassword.classList.add('active');
      this.password.type = this.password.type == 'password' ? 'text' : 'password';
    });
    G.d.on(this.submitBtn, "click", (e) => {
      e.preventDefault();
      if (!this.userid.value) {
        Modal.toast("请输入员工号/手机号")
        return false;
      }
      if (!this.password.value) {
        Modal.toast("请输入密码")
        return false;
      }
      Object.assign(this.state, {
        userid: this.userid.value,
        password: this.password.value
      })
      this.req_author();
    })

  }
  /**
   * 提交授权按钮
   */
  req_author() {

    BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
      data: { str: this.state.password }
    }).then(({ response }) => {
      let encodePassword = response.body.bodyList[0];
      this.state.password = encodePassword;
      BwRule.Ajax.fetch(CONF.siteUrl + "/auth", {
        type: 'post',
        data: this.state
      }).then(({ response }) => {

      }).catch((ev) => {

      });
    })



  }
  /**
    * 页面模板
    */
  render() {
    return (
      <div className="authorized_page">
        <div className="login-logo">
          <img src={G.requireBaseUrl + "../img/fastlion_logo.png"} alt="fastlion" />
        </div>
        <div className="form_content">
          <div className="form_item">
            <label>账号</label>
            {
              this.userid = <input type="text" placeholder="请输入员工号/手机号" />
            }
          </div>
          <div className="form_item">
            <label>密码</label>
            {
              this.password = <input type="password" placeholder="请输入密码" id="js_password" />
            }
            {
              this.showPassword = <div className="password-show" type="button">
                <i className="appcommon app-xianxingyanjing" />
              </div>
            }
          </div>
          {
            this.submitBtn = <button className="authorized_btn">授权</button>
          }
        </div>

      </div>
    )
  }
}