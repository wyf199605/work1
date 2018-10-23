define(["require","exports","BasicPage","Button","TextInput","Modal","BwRule"],function(e,a,t,o,r,l,i){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var p=G.d,c=G.tools,u=BW.CONF,n=function(t){function n(e){var a=t.call(this,e)||this;return a.para=e,a.isMb||a.initPcPage(),n.changePassword(a.para.dom),a}return __extends(n,t),n.prototype.initPcPage=function(){var e=this.para.dom,a=p.create('<div class="change-password-detail"></div>'),t=p.create('<div class="content">\n                    <form action="#">\n                    <div class="form-group">\n                        <div data-type="old-password">\n                            <label class="control-label">旧密码</label>\n                        </div>\n                        <div data-type="new-password">\n                            <label class="control-label">新密码</label>\n                        </div>\n                        <div data-type="again-password">\n                            <label class="control-label">确认密码</label>\n                        </div>\n                        <div data-type="submit"></div>\n                    </div>\n                    </form>\n                </div>');p.append(a,t),p.append(e,a),new r.TextInput({container:e.querySelector('div[data-type="old-password"]'),type:"password",placeholder:"请输入当前密码",icons:["iconfont icon-suo4"]}),new r.TextInput({container:e.querySelector('div[data-type="new-password"]'),type:"password",placeholder:"请输入新密码",icons:["iconfont icon-suo4"]}),new r.TextInput({container:e.querySelector('div[data-type="again-password"]'),type:"password",placeholder:"请再次输入密码",icons:["iconfont icon-suo4"]}),new o.Button({container:e.querySelector("[data-type=submit]"),content:"确定",type:"primary"}),t.querySelector("[data-type=submit]>button").type="submit"},n.changePassword=function(e){var a=e.querySelector("form"),r=p.query("[data-type=old-password] input",a),s=p.query("[data-type=new-password] input",a),d=p.query("[data-type=again-password] input",a);p.on(a,"submit",function(e){e.preventDefault();var a=r.value,t=s.value,n=d.value;if(c.str.toEmpty(a)&&c.str.toEmpty(t)&&c.str.toEmpty(n))if(t!==n)l.Modal.alert("密码不一致");else{var o=u.ajaxUrl.changePassword;i.BwRule.Ajax.fetch(o,{type:"POST",data:{old_password:a,new_password:t}}).then(function(e){var a=e.response.msg;l.Modal.toast(a),-1<a.indexOf("成功")&&(r.value="",s.value="",d.value="")})}else l.Modal.alert("密码不能为空")})},n}(t.default);a.ChangePasswordPage=n});