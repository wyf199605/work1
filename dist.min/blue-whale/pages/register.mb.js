define("RegisterMbPage",["require","exports","Button","RegPage"],function(e,r,o,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s=G.d,a=function(n){function e(e){var r=h("header",{className:"register-header mui-bar mui-bar-nav ios-top"},h("a",{id:"goLogin",className:"mui-icon mui-pull-left mui-icon-left-nav"})),t=h("div",{className:"register-content mui-content"},h("div",{className:"register-title"},"账号注册"),h("form",{className:"register-form"},h("div",{className:"form-group"},h("input",{id:"tel",type:"text",placeholder:"输入手机号码"})),h("div",{className:"form-group"},h("input",{id:"verifyCodeInput",type:"text",maxlength:"5",placeholder:"输入验证码"}),h("div",{className:"more-group"},h("canvas",{width:"80",height:"30"},"您的浏览器不支持canvas，请用其他浏览器打开。"))),h("div",{className:"form-group"},h("input",{id:"verify",type:"text",placeholder:"输入短信验证码"}),h("div",{className:"more-group"})),h("div",{className:"btn-group"})));s.on(s.query(".register-form",t),"submit",function(e){e.preventDefault()});var a=new o.Button({container:s.query(".btn-group",t),content:"注册",className:"register-submit"}),i=new o.Button({container:s.queryAll(".more-group",t)[1],content:"获取验证码",className:"check-code"});return s.append(e.container,r),s.append(e.container,t),n.call(this,{goLogin:s.query("#goLogin",r),saveReg:a.wrapper,tel:s.query("#tel",t),verifyELCodeInput:s.query("#verifyCodeInput",t),verifyELCode:s.query(".more-group>canvas",t),sendVerify:i.wrapper,smsCheckCode:s.query("#verify",t)})||this}return __extends(e,n),e}(t.RegPage);r.RegisterMbPage=a});