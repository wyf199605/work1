define(["require","exports","Rule","Modal"],function(t,e,o,l){"use strict";var d=G.sys,c=G.conf,r=G.d;return function(){function t(n){this.props=n,this.isOne=!1;var a=this;a.getDevice(),r.on(n.goLogin,"click",function(){d.window.load(c.url.login)}),r.on(n.saveReg,"click",function(){if(0!==n.tel.value.trim().length){for(var t=n.dataAjax,e={},i=0;i<t.length;i++)e[t[i].dataset.ajax]=t[i].value;o.Rule.ajax(c.ajaxUrl.register,{type:"post",data:e,urlData:!0,success:function(e){-1<e.msg.indexOf("成功")?(l.Modal.toast("注册成功!"),d.window.logout()):l.Modal.confirm({msg:e.msg,btns:["取消","前往解绑"],callback:function(t){!0===t&&a.deviceMange(e.data)}})}})}else l.Modal.alert("请输入手机号")}),r.on(n.sendVerify,"click",function(t){var e=this,i=G.tools.str.toEmpty(n.tel.value);if(!G.tools.valid.isEmpty(i)&&G.tools.valid.isTel(i)){var a=60,s=setInterval(function(){0==--a?(clearInterval(s),e.classList.remove("disabled"),e.innerHTML="获取"):(e.classList.add("disabled"),e.innerHTML=a+"s")},1e3);o.Rule.ajax(c.ajaxUrl.smsSend,{data:{mobile:i,uuid:n.dataAjaxUuid.value},urlData:!0,type:"POST",headers:{uuid:n.dataAjaxUuid.value},success:function(t){e.classList.add("disabled"),e.innerHTML="获取",l.Modal.toast("验证码发送成功")},error:function(){e.innerHTML="获取",e.classList.add("disabled")},netError:function(){e.innerHTML="获取",e.classList.add("disabled")}}),t.stopPropagation()}else l.Modal.alert("手机号格式有误")}),"pc"!==d.os&&(d.window.close=double_back)}return t.prototype.getDevice=function(){var s=this;function i(t){for(var e=s.props.dataSysinfo,i=0;i<e.length;i++){var a=e[i].dataset.sysinfo.split(".");e[i].value=t[a[1]]}}"ip"===d.os?(d.window.getDevice(),window.addEventListener("getDevice",function(t){var e=JSON.parse(t.detail);e.success?i(e.msg):l.Modal.toast(e.msg)})):"ad"===d.os?i(d.window.getDevice().msg):"BlueWhaleShell"in window&&i(JSON.parse(BlueWhaleShell.postMessage("getDevice","")).msg)},t.prototype.deviceMange=function(t){var e=this;if(this.modal)this.modal.isShow=!0;else{var i=void 0,a=void 0;"pc"!==d.os&&(i="full",a="modal-mobile"),this.modal=new l.Modal({title:"设备管理",body:r.createByHTML('<ul class="device-view"></ul>'),className:a,position:i}),this.modal.isShow=!0}var s=this.modal.body;s.innerHTML=null,t.forEach(function(t){s.appendChild(e.deviceTpl(t))});var n=this;this.isOne||(r.on(s,"click",".unbind",function(){var t=c.url.site+"/app_sanfu_retail/null/commonsvc/unbound",e=JSON.stringify([{uuid:this.dataset.name}]);o.Rule.ajax(t,{type:"post",data:e,success:function(t){n.modal.isShow=!1,l.Modal.toast("解绑成功")}})}),this.isOne=!0)},t.prototype.deviceTpl=function(t){var e;return e="pc"===d.os?"icon-device-pc":"icon-device-mb",r.createByHTML('\n        <li class="device-cell"> \n\t\t\t\t<div class="icon-box">\n\t\t\t\t\t<span class="iconfont '+e+'"></span>\n\t\t\t\t</div>\n\t\t\t\t<div class="device-name">\n\t\t\t\t\t<div class="device-modal">型号：'+t.MODEL+'</div>\n\t\t\t\t\t<div class="device-vendor">品牌：'+t.VENDOR+'</div>\n\t\t\t\t\t<div class="device-time">注册时间：'+t.REGISTER_TIME+'</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="btn-group">\n\t\t\t\t\t<button class="unbind" data-name='+t.UUID+">解绑</button>\n\t\t\t\t</div>\n\t\t\t</li>\n         ")},t}()});