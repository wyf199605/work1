/// <amd-module name="Authorized"/>
/** 
  * 授权页面  登录模块 
*/
import BasicPage from "basicPage";
interface pagePara {
  dom?: HTMLElement,
  title?: string
}
export class Authorized extends BasicPage {
  private container: HTMLElement; //页面挂载的父元素
  constructor(para: pagePara) {
    super(para);
    this.container = para.dom;
    d.append(this.container, this.render())
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
          <div>
            <label>账号</label>
            <input type="text" placeholder="请输入员工号/手机号" />
          </div>
          <div>
            <label>密码</label>
            <input type="text" placeholder="请输入密码" />
          </div>
        </div>
        <button>授权</button>
      </div>
    )
  }
}