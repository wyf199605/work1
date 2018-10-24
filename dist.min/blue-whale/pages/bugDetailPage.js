define("bugDetailPage",["require","exports","BwRule","Modal"],function(t,s,u,d){"use strict";var o=G.d,n=G.tools,p=BW.CONF;return function(){function t(){var t,s,a,r=this;this.statusTap=(t=function(t){o.closest(t.target,".status")&&d.Modal.alert("请到我的标签页中点击进入详情页修改！")},{on:function(){return o.on(r.bugDetailWrapper,"tap",t)},off:function(){return o.off(r.bugDetailWrapper,"tap",t)}}),this.tapEvent=(s=function(t){var s=o.queryAll(".status",r.bugDetailWrapper),a=s[r.currentStatus],e=s[2],i=s[3],l=n.url.addObj(p.ajaxUrl.bugstatus,{bugid:r.bugId,bugstatus:2});u.BwRule.Ajax.fetch(l).then(function(t){t.response;d.Modal.toast("状态修改成功"),a.classList.remove("active"),e.classList.add("active"),e.classList.add("disabled"),i.classList.remove("disabled"),i.classList.remove("active")})},a=function(t){var s=o.queryAll(".status",r.bugDetailWrapper),a=s[3],e=s[2],i=n.url.addObj(p.ajaxUrl.bugstatus,{bugid:r.bugId,bugstatus:3});u.BwRule.Ajax.fetch(i).then(function(t){t.response;d.Modal.toast("状态修改成功"),e.classList.remove("active"),e.classList.remove("disabled"),a.classList.add("active"),a.classList.add("disabled")})},{on:function(){o.on(r.bugDetailWrapper,"tap",".close",s),o.on(r.bugDetailWrapper,"tap",".redo",a)},off:function(){o.off(r.bugDetailWrapper,"tap",".close",s),o.off(r.bugDetailWrapper,"tap",".redo",a)}}),this.bugId=n.url.getPara("bugid"),this.isSelf="true"===n.url.getPara("isself"),this.bugDetailWrapper=h("div",{className:"bug-detail-container"}),o.query(".mui-content").appendChild(this.bugDetailWrapper),n.isNotEmpty(this.bugId)&&u.BwRule.Ajax.fetch(p.ajaxUrl.bugDetail+"?bugid="+this.bugId).then(function(t){var s=t.response;0===s.errorCode&&r.initDom(s.data)}),this.isSelf&&this.tapEvent.on(),!this.isSelf&&this.statusTap.on()}return t.prototype.initDom=function(t){var s=this,a=t.info.message;a=n.isNotEmpty(a)?a:"用户未描述";var e=h("div",null,h("h1",{className:"title"},t.info.title),h("p",{className:"time"},"申告时间: ",this.handlerTime(t.info.createTime)),h("p",{className:"message"},a));this.bugDetailWrapper.appendChild(e);var i=t.picture;n.isNotEmpty(i)&&i.forEach(function(t){s.bugDetailWrapper.appendChild(h("img",{src:s.getFileUrl(t.fileId)}))});var l=t.video;n.isNotEmpty(l)&&this.bugDetailWrapper.appendChild(h("div",{className:"video"},h("video",{src:this.getFileUrl(l[0].fileId)}),h("i",{className:"video-btn appcommon app-shipin"})));var r=t.voice;n.isNotEmpty(r);var u=h("div",{className:"status-wrapper"}),d=["status disabled","status disabled","status close","status disabled redo"];this.isSelf?0===parseInt(t.info.bugStatus)?d=["status disabled","status disabled","status close","status disabled redo"]:1===parseInt(t.info.bugStatus)?d=["status disabled","status disabled","status close","status disbled redo"]:2===parseInt(t.info.bugStatus)?d=["status disabled","status disabled","status disabled close","status redo"]:3===parseInt(t.info.bugStatus)&&(d=["status disabled","status disabled","status close","status disabled redo"]):d=["status disabled","status disabled","status disabled close","status disabled redo"];var o=parseInt(t.info.bugStatus);this.currentStatus=o,["未处理","处理中","已解决","重新申报"].forEach(function(t,s){var a=null;a=s===o?h("div",{className:"active "+d[s]},t):h("div",{className:d[s]},t),u.appendChild(a)}),this.bugDetailWrapper.appendChild(u)},t.prototype.getFileUrl=function(t){return n.url.addObj(p.ajaxUrl.fileDownload,{md5_field:"FILE_ID",file_id:t,down:"allow"})},t.prototype.handlerTime=function(t){var s=new Date(1e3*t),a=s.getFullYear(),e=s.getMonth()+1,i=s.getDate(),l=s.getHours(),r=s.getMinutes(),u=s.getSeconds();return a+"-"+(e<10?"0"+e:e)+"-"+(i<10?"0"+i:i)+" "+(l<10?"0"+l:l)+":"+(r<10?"0"+r:r)+":"+(u<10?"0"+u:u)},t.prototype.destory=function(){this.isSelf&&this.tapEvent.off(),!this.isSelf&&this.statusTap.off(),o.remove(this.bugDetailWrapper)},t}()});