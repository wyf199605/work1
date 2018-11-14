/// <amd-module name="ChangePassword"/>
import d = G.d;
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";

export interface IChangePasswordPara{
    container:HTMLElement;
    confirm?: (obj) => Promise<any> ;
    data?: obj;
}

export class ChangePassword{
   constructor(para:IChangePasswordPara){
       let body=<div className="cpw-content">
           {ChangePassword.initInput(para.data)}
       </div>;
       let btnGroup = d.query('.btn-group', body);
       let confirm = new Button({
           container: btnGroup,
           content:'确定',
           className:'btn-confirm',
           onClick:() =>{
               let data = this.dataGet(body);
               if(tools.isFunction( para.confirm )){
                   para.confirm(data).then(() => {
                       this.destory();
                   });
               }
           }
       });
       let cancel = new Button({
           container: btnGroup,
           content:'取消',
           className:'btn-cancel',
           onClick:() =>{
               this.destory();
           }
       });
       d.append(para.container, body);
   }
   private dataGet(el:HTMLElement){
       let oldPassword = d.query('.old-password', el) as HTMLInputElement;
       let newPassword = d.query('.new-password', el) as HTMLInputElement;
       let confirmPassword = d.query('.confirm-password', el) as HTMLInputElement;
       let data = [];
       if(oldPassword.value == '' || newPassword.value == '' || confirmPassword.value == ''){
           alert('您有未填写的项目');
           data = null;
       }else{
           if(confirmPassword.value !== newPassword.value){
               alert('两次输入的密码不一致');
               data = null;
           }else{
               data['old_password'] = oldPassword.value;
               data['new_password'] = newPassword.value;
           }
       }
       return data;
   }

   static initInput(para:obj): HTMLElement{
       console.log(para);

       return <form action="#" class="password-form">
           {Object.keys(para).map((key) => <div className="form-group"><span>{key}：</span><input type="text" readOnly value={para[key]}/></div>)}
           <div className="form-group">
               <span>旧密码：</span><input className="old-password" type="password" placeholder="请输入旧密码"/>
           </div>
           <div className="form-group">
               <span>新密码：</span><input className="new-password" type="password" placeholder="请输入新密码"/>
           </div>
           <div className="form-group">
               <span>确认密码：</span><input className="confirm-password" type="password" placeholder="确认新密码"/>
           </div>
           <div className="btn-group">
           </div>
       </form>
   }
   destory(){
       document.body.classList.remove('cpw-content');
   }
}



