define("BasicPage",["require","exports","ButtonAction","Modal"],function(e,t,r,u){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var l=BW.sys,n=G.d,i=G.tools,d=BW.CONF,o=function(){function t(e){var o=this;if(this.isMb=i.isMb,this.isMb?(this.dom=document.body,this.url=window.location.href):(this.dom=e.dom,this.url=e.dom.parentElement.dataset.src,this.url?this.setTitle(e.title):this.url=n.closest(e.dom,".page-container[data-src]").dataset.src),this.on("page.destroy",function(){o.destroy()}),l.isMb){var t=null;n.on(document,"touchstart",function(){var t=n.query(".blue-gesture",document.body);t?t.style.display="block":o.initGesture(e)}),n.on(document,"touchend",function(){clearTimeout(t),t=setTimeout(function(){n.query(".blue-gesture",document.body).style.display="none"},3e3)})}this.initWebscoket(),this.initHelpMsg(e)}return t.prototype.initHelpMsg=function(t){},t.prototype.initWebscoket=function(){G.tools.isMb&&e(["webscoket"],function(t){new t({mgrPath:BW.CONF.siteUrl,wsUrl:BW.CONF.webscoketUrl})})},t.prototype.setTitle=function(t){l&&l.window.setTitle(this.url,t)},t.prototype.on=function(t,e){n.on(this.isMb?window:this.dom.parentElement,t,e)},t.prototype.initGesture=function(c){var t=n.create('<i class="iconfont icon-gesture blue-gesture"></i>');t.setAttribute("style","position:fixed; right:40px; bottom : 40px; z-index:900; font-size:40px; color:rgb(0,122,255);"),n.on(t,"click",function(){var s={circle:"cycle",delete:"cross",triangle:"tri",caret:"backHome"};e(["Gesture"],function(t){new t({container:document.body,onFinsh:function(t){console.log(t);var e=!1;if("backHome"===s[t])u.Modal.confirm({msg:"是否跳转到首页？",callback:function(t){t&&l.window.open({url:d.url.main})}}),e=!0;else for(var o=c.subButtons||{},n=0,i=o.length;n<i;n++)o[n].signId===s[t]&&(r.ButtonAction.get().clickHandle(o[n],{},function(){}),e=!0);e||u.Modal.toast("未匹配到手势相应操作")}})})}),document.body.appendChild(t)},t.prototype.destroy=function(){},t.prototype.initPcSys=function(){},t}();t.default=o});