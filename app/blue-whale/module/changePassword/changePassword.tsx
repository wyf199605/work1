/// <amd-module name="ChangePassword"/>
import d = G.d;
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";

export interface IChangePasswordPara{
    container:HTMLElement;
    confirm?: (obj) => Promise<any> ;
    cancel?: () => void;
    data?: obj;
}

export class ChangePassword{
   constructor(para:IChangePasswordPara){
       let body=<div className="cpw-content">
           {ChangePassword.initInput(para.data)}
       </div>;
       let confirmBtn = d.query('.btn-confirm', body);
       let cancelBtn = d.query('.btn-cancel', body)
       let confirm = new Button({
           container: confirmBtn,
           content:'确定',
           className:'btn-confirm',
           onClick:() => {
               let data = this.dataGet(body);
               if(tools.isFunction( para.confirm )){
                   para.confirm(data);
               }
           }
       });
       let cancel = new Button({
           container: cancelBtn,
           content:'取消',
           className:'btn-cancel',
           onClick:() =>{
               if(tools.isFunction( para.cancel )){
                   para.cancel();
               }
           }
       });
       d.append(para.container, body);
       let newPassword = d.query('.new-password', body) as HTMLInputElement;
       let confirmPassword = d.query('.confirm-password', body) as HTMLInputElement;
       this.bindBlur(confirmPassword, newPassword, '.confirm-password', body);
       this.bindBlur(newPassword, confirmPassword, '.new-password', body);
       this.bindFocus('.confirm-password',body);
       this.bindFocus('.new-password',body);
   }
   private dataGet(el:HTMLElement){
       let oldPassword = d.query('.old-password', el) as HTMLInputElement;
       let newPassword = d.query('.new-password', el) as HTMLInputElement;
       let confirmPassword = d.query('.confirm-password', el) as HTMLInputElement;
       let data = {};
       if(oldPassword.value == '' || newPassword.value == '' || confirmPassword.value == ''){
           Modal.alert('您有未填写的项目');
           data = {};
       }else{
           if(confirmPassword.value !== newPassword.value){
               data = {};
           }else{
               data['old_password'] = oldPassword.value;
               data['new_password'] = newPassword.value;
           }
       }
       return data;
   }
   // 绑定输入框失焦事件
   bindBlur(para:obj,other:obj,classString:string,el:HTMLElement){
       d.on(d.query(classString,el), 'blur',()=>{
           if( para.value ==''){
               d.append(d.query('.confirm-group',el),<div class="password-tip">提示：密码不能为空</div>);
           }
           else if(para.value !== other.value){
               d.append(d.query('.confirm-group',el),<div class="password-tip">提示：两次输入的密码不一致</div>);
           }
           else{
               d.append(d.query('.confirm-group',el),<div class="password-tip same">提示：密码一致</div>);
           }
       })
   }
   // 绑定输入框聚焦事件
   bindFocus(para:string,el:HTMLElement){
       d.on(d.query(para,el), 'focus',()=>{
           let tip = d.query('.password-tip');
           if(tip){
               d.remove(tip);
           }
       })
   }
   static initInput(para?:obj): HTMLElement{
       let form = <form action="#" class="password-form">
           {para ? Object.keys(para).map((key) => <div className="form-group"><span>{key=='user_id'?'用户名':key}：</span><input type="text" className="input-username" readOnly value={para[key]}/></div>) : null}
       </form>
       let oldPassword = <div className="form-group"><span>旧密码：</span><input className="old-password" type="password" placeholder="请输入旧密码"/></div>;
       let newPassword = <div className="form-group"><span>新密码：</span><input className="new-password" type="password" placeholder="请输入新密码"/></div>;
       let confirmPassword = <div className="form-group confirm-group"><span>确认密码：</span><input className="confirm-password" type="password" placeholder="确认新密码"/></div>;
       let btn = <div className="btn-group"><div className="btn-confirm change-btn"/><div className="btn-cancel change-btn"/></div>;
       let input = h("div",{'class':'input-form'},oldPassword,newPassword,confirmPassword,btn);
       d.append(form,input);
       return form;
   }

   destory(){
       document.body.classList.remove('cpw-content');
   }
}