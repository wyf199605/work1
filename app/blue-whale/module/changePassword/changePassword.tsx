/// <amd-module name="ChangePassword"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";

export interface IChangePasswordPara{
    container?:HTMLElement;
    confirm?: (obj) => Promise<any> ;
}

export class ChangePassword{
   protected modal:Modal;
   constructor(para:IChangePasswordPara){
       let body=<div className="cpw-content">
           {ChangePassword.initInput()}
       </div>;
       let confirm = new Button({
           content:'确定',
           className:'btn-confirm',
           onClick:() =>{
               if(this.validate(body)){
                   let data = this.dataGet(body);
                   if(tools.isFunction( para.confirm )){
                       para.confirm(data).then(() => {
                           this.modal.isShow = false;
                           this.destory();
                       });
                   }
               }
           }
       });
       let cancel = new Button({
           content:'取消',
           className:'btn-cancel',
           onClick:() =>{
                       this.modal.isShow = false;
                       this.destory();
           }
       });
       let footer = {
           rightPanel:[confirm,cancel]
       };

       this.modal = new Modal({
           container: para.container,
           body,
           footer: footer,
           isShow: true,
           position: tools.isMb ? 'full' : '',
           className: 'cpw-modal',
           isOnceDestroy: true,
           header: '修改密码'
       });

   }
   private validate(el:HTMLElement){
       let oldPassword = d.query('#old-password', el) as HTMLInputElement;
       let newPassword = d.query('#new-password', el) as HTMLInputElement;
       let confirmPassword = d.query('#confirm-password', el) as HTMLInputElement;
       if(oldPassword.value == '' || newPassword.value == '' || confirmPassword.value == ''){
           alert('您有未填写的项目');
           return false;
       }else{
           if( confirmPassword.value !== newPassword.value){
               alert('两次输入的密码不一致');

               return false;
           }
       }
       return true;
   }
   private dataGet(el:HTMLElement){
       let oldPassword = d.query('#old-password', el) as HTMLInputElement;
       let newPassword = d.query('#new-password', el) as HTMLInputElement;
       let confirmPassword = d.query('#confirm-password', el) as HTMLInputElement;
       let data = [];
       data['old'] = oldPassword.value;
       data['new'] = newPassword.value;
       data['confirm'] = confirmPassword.value;
       return data;
   }

   static initInput(): HTMLElement{
       return <form action="#" class="password-form">
           <div class="form-group">
               <span>旧密码：</span><input id="old-password" type="password" placeholder="请输入旧密码"/>
           </div>
           <div class="form-group">
               <span>新密码：</span><input id="new-password" type="password" placeholder="请输入新密码"/>
           </div>
           <div class="form-group">
               <span>确认密码：</span><input id="confirm-password" type="password" placeholder="确认新密码"/>
           </div>
           <div class="btn-group"></div>
       </form>
   }
   destory(){
       document.body.classList.remove('cpw-content');
       this.modal && this.modal.destroy();
       this.modal = null;
   }
}



