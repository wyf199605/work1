var BW;(BW||(BW={})).CONF={appid:"",version:"",siteUrl:"",siteAppVerUrl:"",webscoketUrl:"",url:{index:"index",login:"index?page=login",reg:"index?page=reg",update:"index?page=update",selectServer:"index?page=static%2FserverSelect",main:"commonui/pageroute?page=static%2Fmain",message:"commonui/pageroute?page=static%2Fmessage",msgDetail:"commonui/pageroute?page=static%2Fmessage_detail",myselfMenu:"commonui/pageroute?page=static%2FmyselfMenu",msgVersion:"commonui/pageroute?page=static%2FmsgVersion",imgRotate:"commonui/pageroute?page=static%2FimgRotation",changePassword:"commonui/pageroute?page=static%2FchangePassword",privilegeConfigure:"commonui/pageroute?page=privilege&uiTypeTest=privilegeConfigure",privilegeSearch:"commonui/pageroute?page=privilege&uiTypeTest=privilegeSearch",sqlMonitor:"commonui/pageroute?page=sqlMonitor",test:"commonui/pageroute?page=test",home:"ui/menu?page=static%2Fhome",contact:"ui/pick/system/pick-4?page=static%2Fcontacts",myself:"ui/view/n1093_data-30?page=static%2Fmyself",bugList:"commonui/pageroute?page=bugList",bugDetail:"commonui/pageroute?page=bugDetail",notifyCard:"ui/menu?page=static%2FnotifyCard",bugReport:"ui/select/n1676_data-95110?page=table",mail:"ui/insert/n1174_data-4",processLeave:"flowui/flow/n_flow-1/insert?page=processLeave",processAuditList:"flowui/flow/n_flow-1/insert?page=processAuditList",processSeekList:"flowui/flow/n_flow-1/insert?page=processSeekList",myApplication:"commonui/pageroute?page=myApplication",myApproval:"commonui/pageroute?page=myApproval",flowDetail:"commonui/pageroute?page=flowDetail"},ajaxUrl:{fileUpload:"rest/attachment/upload/file",fileDownload:"rest/attachment/download/file",imgDownload:"rest/attachment/download/picture",logout:"logout",loginFinger:"login/finger_drom",loginTouchID:"login/finger_client",loginPassword:"login/password",loginWeiXin:"login/wx",loginCode:"login/message",unBinding:"commonsvc/alldevice",atdPwdReg:"attendance/pwdregister/node_attend-3",atdFingerReg:"attendance/fingerregister/node_attend-2",atdFingerAtd:"attendance/fingerattend/node_attend-1",passwordEncrypt:"commonsvc/encyption",register:"commonsvc/register",smsSend:"commonsvc/sms",unbound:"commonsvc/unbound",bindWeChat:"common/wxbound",speedTest:"commonsvc/interaction/KB",menu:"ui/menu",menuHistory:"common/history",menuFavor:"favorites",versionInfo:"list/n1679_data-95113",pcVersion:"commonsvc/version",rmprivsSelect:"rmprivs/privsget/select",rmprivsInsert:"rmprivs/privsget/insert",changePassword:"common/modify",bugReport:"common/obstacle",helpMsg:"common/help",bugList:"common/obstacles",bugDetail:"common/obdetail",bugstatus:"common/obstate",myself:"common/userinfo",rfidLoginTime:"rest/invent/keeponline",flowListCheck:"flow/system/auditlist",flowListApply:"flow/system/list"},init:function(e,t,n,o){for(var i in this.siteUrl=e,this.appid=t,this.version=n,this.webscoketUrl=o,this.siteAppVerUrl=e+"/"+t+"/"+n,this.url){var a=this.url[i];this.url[i]=this.siteAppVerUrl+"/"+a}for(var i in this.ajaxUrl){var r=0===(a=this.ajaxUrl[i]).indexOf("rest/")?this.siteUrl:this.siteAppVerUrl;this.ajaxUrl[i]=r+"/"+a}}},define("ImgModalMobile",["require","exports"],function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=BW.CONF,o=function(){function e(){}return e.show=function(e){BW.sys.window.open({url:n.url.imgRotate}),window.localStorage.setItem("imgRotateData",JSON.stringify(e))},e}();t.ImgModalMobile=o}),define("BwRule",["require","exports","Modal","ImgModal","ImgModalMobile"],function(p,e,f,y,v){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var w=BW.CONF,b=BW.sys,t=G.Rule,T=G.tools,g=G.Ajax,n=function(e){function h(){return null!==e&&e.apply(this,arguments)||this}return __extends(h,e),h.isTime=function(e){return e===h.DT_DATETIME||e===h.DT_TIME},h.isImage=function(e){return e===h.DT_MUL_IMAGE||e===h.DT_IMAGE},h.getCrossTableCols=function(e,o){var n,i,t,a={},r=[],s=[],c=!0;return function(i){var n="";function e(e){for(var t=0,n=i;t<n.length;t++){var o=n[t];if(-1<o.indexOf(".")&&e(o))break}}e(function(e){var t=e.split(".");return n=t[t.length-1],!0}),e(function(e){var t=e.split(".").pop();if(c=t===n,n=t,!c)return!0})}(e),t=e.slice(0),o.forEach(function(e){a[e.name]=e}),t.forEach(function(e){if(1<(n=e.split(".")).length){var t=n.pop();(i=T.obj.copy(a[t])).name=e,i.data=e,i.title=c?n.join("."):n.join(".")+"."+function(e){for(var t=0,n=o.length;t<n;t++)if(o[t].name===e)return o[t]}(t).title,r.push(i)}else(i=T.obj.copy(a[e])).title=i.caption,i.title&&s.push(i)}),{cols:r=s.concat(r),lockNum:s.length}},h.getCrossTableData=function(e,t){void 0===t&&(t=[]);var i=[];return t.forEach(function(n,o){i.push({}),e.forEach(function(e,t){i[o][e]=n[t]})}),i},h.link=function(l){var e,u,d,p=1,f=2,g=3,m=4;l=Object.assign({dataType:"",varList:[],data:{}},l),e=T.url.addObj(w.siteUrl+l.link,h.varList(l.varList,l.data)),l.dataType===h.DT_FILE?h.Ajax.fetch(e).then(function(e){var t=e.response;if((u=t.data[0]).IMGADDR&&(u.IMGADDR=w.siteUrl+u.IMGADDR),u.DOWNADDR&&(u.DOWNADDR=w.siteUrl+u.DOWNADDR),u.IMGADDR)d=m;else{var n="";u.FILENAME&&(n=u.FILENAME.split(".").pop().toLowerCase()),d=-1!==["jpg","jpeg","png","gif","bmp","ttif"].indexOf(n)?g:f}switch(d){case p:b.window.open({url:u.url},l.openUrl);break;case m:for(var o=[],i=u.PAGENUM,a=u.IMGADDR,r=1,s=void 0;r<=i;r++)s=h.parseURL(a,{page:r}),o.push(s);var c={downAddr:u.DOWNADDR,title:u.FILENAME,img:o,onDownload:function(e){b.window.download(e)}};T.isMb?v.ImgModalMobile.show(c):y.ImgModal.show(c);break;case g:"ad"===b.os||"ip"===b.os?b.window.openImg(u.DOWNADDR):T.isMb?b.window.download(u.DOWNADDR):window.location.href=u.DOWNADDR;break;case f:b.window.download(u.DOWNADDR)}}):b.window.open({url:e,gps:l.needGps},l.openUrl)},h.parseURL=function(e,t){return e.replace(h.parseURLReg,function(e){return encodeURIComponent(T.str.toEmpty(t[e.slice(1,-1)]))})},h.drillAddr=function(e,t,n){return e&&!T.isEmpty(t[n])?h.parseURL(e.dataAddr,t)+"&page=drill":""},h.webDrillAddr=function(e,t,n){return e&&!T.isEmpty(t[n])?h.reqAddr(e,t):""},h.webDrillAddrWithNull=function(e,t,n){return e&&T.isEmpty(t[n])?h.reqAddr(e,t):""},h.checkValue=function(e,t,n){var o=T.keysVal(e,"body","bodyList",0);T.isEmpty(o)||T.isEmpty(o.type)?"function"==typeof n&&n():0===o.type?f.Modal.alert(o.showText):f.Modal.confirm({msg:o.showText,callback:function(e){1==e&&h.Ajax.fetch(BW.CONF.siteUrl+o.url,{type:"POST",data:JSON.stringify(t)}).then(function(){"function"==typeof n&&n()})}})},h.getLookUpOpts=function(t,e){return h.Ajax.fetch(w.siteUrl+h.reqAddr(t.dataAddr,e),{needGps:t.dataAddr.needGps}).then(function(e){return e.response.data.map(function(e){return{text:e[t.name],value:e[t.lookUpKeyField]}})})},h.getDefaultByFields=function(e){var o={};return e.forEach(function(e){var t=e.atrrs,n=t&&t.defaultValue;T.isEmpty(n)||(o[e.name]="%date%"===n.toString().toLowerCase()?T.date.format(new Date,t.displayFormat):n)}),o},h.getOldField=function(e){var t=[];return Array.isArray(e)&&e.forEach(function(e){e.varName.match(/^OLD_/)&&t.push(e.varName.slice(4))}),t},h.addOldField=function(e,n){var t=Array.isArray(n);return t||(n=[n]),e.forEach(function(t){n.forEach(function(e){t in e&&(e["OLD_"+t]=e[t])})}),t?n:n[0]},h.maxValue=function(e,t,n){if("number"!=typeof n||"string"!=typeof e||t)return e;var o=n.toString(2),i=o.length;return"1"===o[i-1]?e=e.toUpperCase():"1"===o[i-2]&&(e=e.toLowerCase()),e},h.fileUrlGet=function(e,t,n){var o;return void 0===t&&(t="FILE_ID"),void 0===n&&(n=!1),T.url.addObj(w.ajaxUrl.imgDownload,((o={md5_field:t})[t]=e,o.down="allow",o.imagetype=n?"thumbnail":"picture",o))},h.EVT_REFRESH="refreshData",h.EVT_ASYN_QUERY="__TABLE_ASYN_QUERY__",h.NoShowFields=["GRIDBACKCOLOR","GRIDFORECOLOR"],h.ColorField="STDCOLORVALUE",h.QUERY_OP=[{value:2,text:"等于"},{value:3,text:"大于"},{value:4,text:"大于等于"},{value:5,text:"小于"},{value:6,text:"小于等于"},{value:7,text:"介于"},{value:8,text:"包含于"},{value:9,text:"包含"},{value:10,text:"为空"}],h.Ajax=function(r){function e(){return null!==r&&r.apply(this,arguments)||this}return __extends(e,r),e.prototype.fetch=function(l,u){var t=this;function d(e){!u.silent&&f.Modal.alert(e)}return void 0===u&&(u={}),u.dataType=u.dataType||"json",new Promise(function(n,o){u.needGps?b.window.getGps(function(e){var t=e.success&&e.gps;t?n(t):o("获取gps失败, 请重试")}):n({})}).then(function(e){return new Promise(function(s,c){u.headers=Object.assign(u.headers||{},{position:JSON.stringify(e)}),r.prototype.fetch.call(t,l,u).then(function(e){var n=e.response,t=e.xhr;if(T.isEmpty(n))return d("后台数据为空"),void c(g.errRes(t,"emptyData",""));if("object"==typeof n){var o=50001===n.errorCode;if(o)return f.Modal.confirm({msg:"登录已超时,是否跳转到登录页",callback:function(e){e&&BW.sys.window.logout()}}),void c(g.errRes(t,"logout",""));if(n.errorCode&&0!==n.errorCode&&!o)return T.isPc||1e4<=n.errorCode&&n.errorCode<=100001?d(n.msg||n.errorMsg||"后台错误"):f.Modal.confirm({msg:n.msg||n.errorMsg||"后台错误",title:"错误提示",btns:["取消","申报故障"],callback:function(e){e&&p(["BugReport"],function(e){var t={param:"",url:"",reqType:"",errMsg:""};t.url=l,t.param=T.isNotEmpty(u.data)?JSON.stringify(u.data):"";t.reqType=["GET","POST","PUT","DELETE"].indexOf(u.type).toString(),t.errMsg=n.msg||n.errorMsg||"后台错误",new e.BugReportModal(-1,!1,t)})}}),void c(g.errRes(t,"errorCode",""));if(!n.errorCode){var i=[],a=[];if(n.body&&n.body.bodyList&&n.body.bodyList[0]){var r=n.body.bodyList[0];i=r.dataList,a=Array.isArray(r.meta)?r.meta:[],n.data=h.getCrossTableData(a,i),n.meta=a}s(e)}}else s(e)}).catch(function(e){var t=e.xhr;"timeout"===e.statusText?d("请求超时, 可稍后再试哦~"):0==t.status?d("系统正忙, 可稍后再试哦~"):d("请求错误,code:"+t.status+","+t.statusText),c(e)})})})},e.prototype.request=function(e,t,n,o){var i=t.data;if(T.isNotEmpty(i)&&"object"==typeof i){for(var a in i)T.isEmpty(i[a])&&delete i[a];t.data2url&&(e=T.url.addObj(e,i),delete t.data)}r.prototype.request.call(this,e,t,n,o)},e.fetch=function(e,t){return void 0===t&&(t={}),(new h.Ajax).fetch(e,t)},e}(g),h.parseURLReg=/\{\S+?}/g,h.beforeHandle={table:function(e){return!T.isEmpty(e.cols)&&h.beforeHandle.fields(e.cols,e.uiType),e.fixedNum=1,e.uiType=T.isEmpty(e.uiType)?null:e.uiType,null},fields:function(e,t){for(var n=0,o=e;n<o.length;n++){var i=o[n];i.title=i.caption,i.valueLists=T.isEmpty(i.atrrs)?"":i.atrrs.valueLists,i.noSum=T.isEmpty(i.atrrs)?"":i.atrrs.noSum,i.dataType=T.isEmpty(i.atrrs)?"":i.atrrs.dataType,i.displayFormat=T.isEmpty(i.atrrs)?"":i.atrrs.displayFormat,i.trueExpr=T.isEmpty(i.atrrs)?"":i.atrrs.trueExpr,i.displayWidth=T.isEmpty(i.atrrs)?"":i.atrrs.displayWidth,"lookup"==i.elementType?i.comType="selectInput":"treepick"==i.elementType||"pick"==i.elementType?(i.comType="tagsInput",i.multiValue=i.atrrs.multValue,i.relateFields=i.assignSelectFields):i.atrrs&&"43"==i.atrrs.dataType?(i.comType="file",i.relateFields=["FILE_ID"]):i.atrrs&&"30"==i.atrrs.dataType?i.comType="richText":i.atrrs&&"17"==i.atrrs.dataType?i.comType="toggle":i.atrrs&&"12"==i.atrrs.dataType?i.comType="datetime":i.comType="input",T.isNotEmpty(i.subcols)&&h.beforeHandle.fields(i.subcols,t)}}},h.reqAddrCommit={1:t.reqAddrCommit[1],2:function(i,e){var t,a=[];return e&&(e[0].forEach(function(n,o){a.push({});var e=function(t){i.varList.forEach(function(e){e.varName===t&&(a[o][t.toLowerCase()]=n[t])})};for(var t in n)e(t)}),t=JSON.stringify({param:[{insert:a,itemId:e[1].itemId}]})),{addr:i.dataAddr,data:t}},3:function(e,t){return{addr:T.url.addObj(e.dataAddr,{atvarparams:JSON.stringify(h.atvar.dataGet())}),data:{}}}},h}(t);e.BwRule=n}),define("ButtonAction",["require","exports","InputBox","Button","Modal","SelectBox","ShellErpManagePc","SelectInput","Loading","BwRule","SelectInputMb"],function(H,e,U,j,W,_,q,J,V,Y,K){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var Q=G.tools,X=BW.CONF,$=G.d,t=function(){function e(){}return e.prototype.clickHandle=function(n,t,o,i,a){void 0===o&&(o=function(e){});var r=this;if("excel"===n.subType){var s=new W.Modal({header:"选择导入的文件",body:$.create("<div></div>"),className:"upload-modal",isOnceDestroy:!0,footer:{rightPanel:[{content:"取消",onClick:function(){s.destroy()}}]}});H(["UploadModule"],function(e){var t=X.siteUrl+n.actionAddr.dataAddr;new e.default({container:s.body,uploadUrl:t+(-1<t.indexOf("?")?"&":"?")+"item_id="+a,onChange:function(){},onComplete:function(e){s.destroy(),setTimeout(function(){r.btnRefresh(n.refresh,i)},100)}})})}else if(n.hintBeforeAction||3===n.buttonType){var e=["查询","新增","修改","删除"][n.buttonType];"with_draw"===n.subType?e="撤销":"reject"===n.subType&&(e="退回"),W.Modal.confirm({msg:"确定要"+e+"吗?",callback:function(e){!0===e&&r.btnAction(n,t,o,i)}})}else r.btnAction(n,t,o,i)},e.prototype.btnRefresh=function(e,t){switch(e){case 1:BW.sys.window.fire(Y.BwRule.EVT_REFRESH,null,t);break;case 2:setTimeout(function(){BW.sys.window.close("",null,t)},1e3);break;case 3:setTimeout(function(){BW.sys.window.close(Y.BwRule.EVT_REFRESH,null,t)},1e3);break;case 4:BW.sys.window.firePreviousPage(Y.BwRule.EVT_REFRESH,null,t)}},e.prototype.dom2Obj=function(e){return{subType:e.dataset.subType,openType:e.dataset.openType,buttonType:parseInt(e.dataset.buttonType,10),actionAddr:{varList:JSON.parse(e.dataset.varList),dataAddr:e.dataset.actionAddr},refresh:parseInt(e.dataset.refresh,10)}},e.prototype.btnAction=function(t,e,n,o){var i=this;void 0===n&&(n=function(e){});var a=Y.BwRule.reqAddrFull(t.actionAddr,e),r=a.addr,s=a.data,c=this,l=["GET","POST","PUT","DELETE"][t.buttonType];switch(t.openType){case"none":if(!l)return void W.Modal.alert("buttonType不在0-3之间, 找不到请求类型!");c.checkAction(t,e,r,l,s,o).then(function(e){n(e)}).catch(function(){});break;case"popup":if(!l)return void W.Modal.alert("buttonType不在0-3之间, 找不到请求类型!");r=Q.url.addObj(r,{output:"json"}),c.checkAction(t,e,r,l,s,o).then(function(e){console.log(e),"inventory"===e.uiType&&Q.isMb?i.initBarCode(e):c.btnPopup(e,function(){c.btnRefresh(t.refresh,o)},o)}).catch(function(){});break;case"newwin":default:BW.sys.window.open({url:Q.url.addObj(BW.CONF.siteUrl+r,s),gps:!!t.actionAddr.needGps},o),c.btnRefresh(t.refresh,o)}},e.prototype.initBarCode=function(e){console.log(e.body.elements)},e.prototype.checkAction=function(o,i,e,a,r,s){var t=o.actionAddr.varType,c=this;return 3===t&&"string"!=typeof r&&(Array.isArray(r)||(r=[r]),r=JSON.stringify(r)),Y.BwRule.Ajax.fetch(BW.CONF.siteUrl+e,{data2url:3!==t,type:a,data:r,needGps:o.actionAddr.needGps}).then(function(e){var t=e.response,n=Q.keysVal(t,"body","bodyList",0);return!n||!n.type&&0!==n.type?("hintAfterAction"in o&&!o.hintAfterAction||(n&&n.showText?W.Modal.alert(n.showText):"popup"!==o.openType&&(W.Modal.toast(t.msg||o.title+"成功"),c.btnRefresh(o.refresh,s))),t):0!==n.type?new Promise(function(t){W.Modal.confirm({msg:n.showText,callback:function(e){e&&c.checkAction(o,i,n.url,a,r,s).then(function(){t()})}})}):void W.Modal.alert(n.showText)})},e.prototype.btnPopup=function(e,n,l){var u,t,o,i,d,p,f,a,r,s,c,g=this,m=e.body.elements[0],h=m.cols&&m.cols.length,y=[],v=m.actionType;3===v||5===v?a=6<h?1e3:180*h:m.downloadAddr&&(a=260);var w=$.create("<div></div>");m.downloadAddr&&(w=$.create('<div><div class="avatar-load"><div class="conf-left"></div><div class="conf-right">\n                </div></div><div class="avatar-progress"><div class="progress-title">传输尚未开始</div></div></div>'));var b=e.caption,T={body:w,header:b,isOnceDestroy:!0,width:a,isAdaptiveCenter:!0,isMb:!1};if(3!==v&&5!==v||(T.className=Q.isMb?"mb-action-type-5":"action-type-5"),4===v&&(T.className="action-type-4"),3!==v){var O,A,k,M,S,E=new U.InputBox,D=m.subButtons;if(D&&D.forEach(function(t){E.addItem(new j.Button({content:t.caption,type:"primary",onClick:function(){var e=[];m.downloadAddr||(u.destroy(),m.atvarparams?e[0]=y:5===v&&(e[0]=c.main.ftable.selectedRowsData),e[1]=m),g.clickHandle(t,e,function(e){},l)}}))}),m.downloadAddr)p=function(e){if(console.log(e),"AppShell"in window)if(e.success){var t=e.data;s.innerHTML=e.msg,r.format(t?t.progress:0),t&&2===t.state&&("upload"===O?x(JSON.stringify([{inventdata:t.data}]),A):(W.Modal.alert("下载数据完成"),u.destroy(function(){F()})))}else W.Modal.alert("调用接口失败，请重试！");else{var n=(t=JSON.parse(e.detail)).msg,o=n.substring(n.indexOf("(")+1,n.indexOf("%"));if(s.innerHTML=n.substr(0,n.indexOf("(")),r.format(o),"100"===o)if("upload"===O){var i=M.inventory({msg:"getUploadData"})._data;x(JSON.stringify([{inventdata:JSON.parse(i).msg.data}]),A)}else"download"===O&&(W.Modal.alert("下载数据完成"),u.destroy(function(){F()}))}},f=function(e){console.log(e);var t=JSON.parse(e.detail);s&&(s.innerHTML=t.msg),A&&A.classList.remove("disabled")},E.addItem(new j.Button({content:"确定",type:"primary",onClick:function(e){if(!("BlueWhaleShell"in window||"AppShell"in window))return W.Modal.alert("当前操作仅支持在蓝鲸PC客户端使用"),null;O=t.getSelect()[0].value,(A=e.currentTarget).classList.add("disabled"),M="AppShell"in window?G.Shell:new q.ShellErpManagePc,S={port:o.get(),speed:i.get()},"upload"===O?(l=Q.url.addObj(m.uploadAddr.dataAddr,{atvarparams:JSON.stringify(Y.BwRule.atvar.dataGet())}),k="callUpload","AppShell"in window&&Q.isPc?M.casio.upload(S.port,S.speed,function(e){f(e)},function(e){p(e)}):M.inventory({msg:k,data:S})):"download"===O&&(k="callDownload",l=m.downloadAddr.dataAddr,x(null,A,S,M,k))}})),"BlueWhaleShell"in window&&($.on(window,"sendMessage",function(e){p(e)}),$.on(window,"sendFinish",function(e){f(e)}));Q.isMb&&5===v&&(T.header={rightPanel:E,title:b}),T.footer={rightPanel:E}}function x(o,i,a,r,s){function c(e){d&&d.hide(),W.Modal.alert(e.msg),n(),u.destroy(function(){F()})}d?d&&d.show():d=new V.Loading({msg:"正在获取数据..."}),Y.BwRule.Ajax.fetch(X.siteUrl+l,{type:"POST",data:o}).then(function(e){var t=e.response;if("callDownload"===s)a.data=t.body.bodyList[0].inventData,"AppShell"in window&&Q.isPc?r.casio.download(a.port,a.speed,a.data,function(e){f&&f(e)},function(e){p&&p(e)}):r.inventory({msg:s,data:a});else{var n=t.body&&t.body.bodyList&&t.body.bodyList[0];n&&n.showText?W.Modal.confirm({msg:n.showText,callback:function(e){1==e?(d&&d.show(),Y.BwRule.Ajax.fetch(X.siteUrl+n.url,{type:"post",data:o}).then(function(e){c(e.response)})):i.classList.remove("disabled")}}):c(t)}}).finally(function(){d&&d.hide()})}if(u=new W.Modal(T),s=$.query(".progress-title",u.bodyWrapper),u.onClose=function(){u.destroy(function(){m.downloadAddr&&F()})},3===v)R();else if(m.atvarparams){var N,C=u.body,L=void 0,B=void 0,P="";if(m.downloadAddr){var I=u.bodyWrapper;C=$.query(".avatar-load",I),B=$.query(".conf-right",I),L=$.query(".conf-left",I),N=$.query(".avatar-progress",I),t=new _.SelectBox({select:{multi:!1,callback:function(e){var t=$.query(".atvarDom",I);0===e?t.classList.add("disabled"):t.classList.remove("disabled")}},container:L,data:[{value:"download",text:"下载数据"},{value:"upload",text:"上传数据"}]}),i=new J.SelectInput({container:B,className:"speed-select",data:[{text:"1200bps",value:"1200"},{text:"2400bps",value:"2400"},{text:"4800bps",value:"4800"},{text:"9600bps",value:"9600"},{text:"19200bps",value:"19200"},{text:"1280000bps",value:"1280000"}]}),(o=new J.SelectInput({container:B,className:"com-select",data:[{text:"COM1",value:"COM1"},{text:"COM2",value:"COM2"}]})).set("COM1"),i.set("19200"),P="disabled",H(["Progress"],function(e){r=new e.Progress({container:N})})}H(["QueryBuilder"],function(e){Y.BwRule.atvar=new e.AtVarBuilder({queryConfigs:m.atvarparams,resultDom:C,tpl:'<div class="atvarDom '+P+'"><div style="display: inline-block;" data-type="title"></div>\n                    <span>：</span><div data-type="input"></div></div>',setting:m.setting});var t=Y.BwRule.atvar.coms,n=Object.keys(t);n&&1===n.length&&t[n[0]]instanceof K.SelectInputMb&&t[n[0]].showList()})}else 5===v&&R();function R(){u.body=$.create('<div style="height: 70vh;"></div>'),m.cols.forEach(function(e){e.title=e.caption});var t=Q.obj.merge(m,{multiSelect:!m.multiValue||m.multiValue,isInModal:!0});H(["newTableModule"],function(e){(c=new e.NewTableModule({bwEl:Object.assign(t,{subButtons:[]}),container:u.body})).refresh(),3===v&&$.on(window,e.NewTableModule.EVT_EDIT_SAVE,function(){n()})})}function F(){$.off(window,"sendMessage"),$.off(window,"sendFinish")}},e.prototype.test=function(e){console.log("test.buttonAction."+e)},e.get=function(){return e.buttonAction||(e.buttonAction=new e),e.buttonAction},e.buttonAction=null,e}();e.ButtonAction=t}),function(a){var r=G.d,u=G.tools,e=function(){function e(){var c,l,t;this.window=(c=this,l=null,{backHome:function(){},open:function(o){"string"==typeof o.data&&(o.data=JSON.parse(o.data)),o.extras={viewData:JSON.stringify(o.extras)},new Promise(function(t,n){o.gps?c.window.getGps(function(e){e.success?t(e.gps):n(e)}):t({})}).then(function(e){o.header=e?Object.assign(o.header||{},{position:e}):o.header,c.handle("open",JSON.stringify(o))}).catch(function(e){e.flag?alert(e.msg):(alert("gps未打开, 点击确定去开启."),c.window.openGps())})},set closeConfirm(e){l=e?Object.assign({msg:"是否关闭页面？"},e):null},close:function(e,t){var n=(l=l||{}).msg,o=l.noHandler,i=l.btn,a=l.condition;if(n&&"function"!=typeof a&&(a=function(){return!0}),n){var r=a();return r instanceof Promise||(r=Promise.resolve(!!r)),void r.then(function(e){e?require(["Modal"],function(e){e.Modal.confirm({msg:n,btns:i||["不关闭","关闭"],callback:function(e){e?u.isFunction(o)&&o():s()}})}):s()})}function s(){c.handle("close",'{event:"'+e+'",data:"'+t+'"}')}s()},load:function(e,t){c.handle("load",'{url:"'+e+'",event:"windowData",data:"'+t+'"}')},back:function(e,t){c.handle("back",'{event:"'+e+'",data:"'+t+'"}')},wake:function(e,t){c.handle("wake",'{event:"'+e+'",data:"'+t+'"}')},opentab:function(e,t){void 0===e&&(e=""),void 0===t&&(t="");var n=[{icon:"home",name:"首页",url:a.CONF.url.home},{icon:"contacts",name:"通讯",url:a.CONF.url.contact},{icon:"message",name:"消息",url:a.CONF.url.message},{icon:"myselfMenu",name:"我的",url:a.CONF.url.myselfMenu}],o={data:JSON.stringify(n),userid:e,accessToken:t};c.handle("opentab",JSON.stringify(o))},logout:function(e){void 0===e&&(e=a.CONF.url.index);var t=this.getDevice("uuid").msg;e=u.url.addObj(e,{uuid:t}),c.handle("logout",'{url:"'+e+'"}')},quit:function(){c.handle("quit")},copy:function(e){e=u.str.toEmpty(e).trim(),c.handle("copy",'{data:"'+e+'"}'),a.toast("复制成功")},getGps:function(n){c.handle("getGps",'{type:1,event:"putGps"}'),a.toast("gps获取中, 请稍等");var o=setTimeout(function(){r.off(window,"putGps",i),n({success:!1,msg:"获取gps超时, 请重试..."})},5e3),i=function(e){r.off(window,"putGps",i),clearInterval(o);var t=JSON.parse(e.detail);n(t)};r.on(window,"putGps",i)},openGps:function(){c.handle("openGps")},update:function(){c.handle("checkUpdate"),a.toast("已经是最新版本")},clear:function(){c.handle("clear")},getDevice:function(e){return u.isEmpty(e)?c.handle("getDevice"):c.handle("getDevice","{key:"+e+"}")},openImg:function(e){c.handle("openImg",'{url:"'+e+'"}')},download:function(e){c.handle("download",'{url:"'+e+'"}')},touchid:function(t){var e="touchidCallback";c.handle("touchid",'{event:"'+e+'"}'),r.once(window,e,function(e){t(e)})},wechatin:function(t){var e="wechatCallback";c.handle("wechatin",'{event:"'+e+'"}'),r.once(window,e,function(e){t(e)})},firePreviousPage:function(){},fire:function(e,t){u.event.fire(e,t,window)},scan:function(e){c.handle("scan",'{event:"'+e+'"}')},shake:function(e){c.handle("shake",'{event:"'+e+'"}')},powerManager:function(){this.adHandle("powerManager","")},whiteBat:function(){this.adHandle("whiteBat","")}}),this.ui=(t=this,{notice:function(e){t.handle("callMsg",e.msg)}})}return e.prototype.handle=function(e,t){return u.isEmpty(t)?JSON.parse(AppShell.postMessage(e)):JSON.parse(AppShell.postMessage(e,t))},e}();a.SYSAD=e}(BW||(BW={})),function(t){var c=G.tools,e=function(){var s;this.window=(s=null,{backHome:function(){t.sys.window.open({url:t.CONF.url.main})},open:function(e){localStorage.setItem("viewData",JSON.stringify(e.extras)),(window.parent?window.parent:window).location.href=e.url},close:function(e,t){var n=(s=s||{}).msg,o=s.noHandler,i=s.btn,a=s.condition;if(n&&"function"!=typeof a&&(a=function(){return!0}),n){var r=a();return r instanceof Promise||(r=Promise.resolve(!!r)),void r.then(function(e){e?require(["Modal"],function(e){e.Modal.confirm({msg:n,btns:i||["不关闭","关闭"],callback:function(e){e?c.isFunction(o)&&o():close()}})}):close()})}history.back()},set closeConfirm(e){s=e?Object.assign({msg:"是否关闭页面？"},e):null},load:function(e){(window.parent?window.parent:window).location.href=e},back:function(e,t){history.back()},wake:function(e,t){},clear:function(){},opentab:function(){(window.parent?window.parent:window).location.href=t.CONF.url.main},logout:function(){(window.parent?window.parent:window).location.href=t.CONF.url.login},copy:function(e){t.toast("您的设备暂不支持复制")},getGps:function(e){e({gps:{},success:!0})},openGps:function(){},update:function(){t.toast("已经是最新版本")},getDevice:function(e){},openImg:function(e){},download:function(e){window.location.href=e},firePreviousPage:function(){},fire:function(e,t){c.event.fire(e,t,window)}}),this.ui={notice:function(e){t.toast(e.msg)}}};t.SYSH5=e}(BW||(BW={})),function(i){var r=G.d,s=G.tools,e=function(){function e(){var a,n;this.window=(a=this,{backHome:function(){},open:function(o){"object"==typeof o.data&&(o.data=JSON.stringify(o.data)),window.localStorage.setItem("viewData",JSON.stringify(o.extras)),o.url,o.header,JSON.stringify(o.extras),o.data,new Promise(function(t,n){o.gps?a.window.getGps(function(e){e.success?t(e.gps):n(e.msg)}):t({})}).then(function(e){o.header=e?Object.assign(o.header||{},{position:JSON.stringify(e)}):o.header,a.handle("open",o)}).catch(function(e){alert(e)})},close:function(e,t){var n={};n.data=t,n.event=e,a.handle("close",n)},load:function(e,t){var n={};n.url=e,n.data=t,n.event="windowData",a.handle("load",n)},back:function(e,t){var n={};n.event=e,n.data=t,a.handle("back",n)},wake:function(e,t){var n={};n.data=t,n.event=e,a.handle("wake",n)},opentab:function(e,t){void 0===e&&(e=""),void 0===t&&(t="");var n=[{icon:"home",name:"首页",url:i.CONF.url.home},{icon:"contacts",name:"通讯",url:i.CONF.url.contact},{icon:"message",name:"消息",url:i.CONF.url.message},{icon:"myselfMenu",name:"我的",url:i.CONF.url.myselfMenu}],o={data:JSON.stringify(n),userid:e,accessToken:t};a.handle("opentab",o)},logout:function(o){void 0===o&&(o=i.CONF.url.login),this.getDevice("uuid"),r.once(window,"getDevice",function(e){var t=JSON.parse(e.detail);if(t.success){var n=t.msg.uuid;o=s.url.addObj(o,{uuid:n}),a.handle("logout",{url:o})}})},quit:function(){a.handle("quit")},copy:function(e){e=G.tools.str.toEmpty(e).trim(),a.handle("copy",{data:e}),i.toast("复制成功")},getGps:function(n){a.handle("getGps",{type:1,event:"putGps"});var o=setTimeout(function(){r.off(window,"putGps",i),n({success:!1,msg:"定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务"})},1e3),i=function(e){r.off(window,"putGps",i),clearTimeout(o);try{var t=JSON.parse(e.detail);t.success?t.gps=t.msg:t.msg="定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务",n(t)}catch(e){n({success:!1,msg:"定位服务未开启,请进入系统设置>隐私>定位服务中打开开关,并允许App使用定位服务"})}};r.on(window,"putGps",i)},openGps:function(){a.handle("openGps")},update:function(){a.handle("checkUpdate")},clear:function(){a.handle("clear")},getDevice:function(e){var t={};G.tools.isEmpty(e)||(t.key=e),t.event="getDevice",a.handle("getDevice",t)},openImg:function(e){var t={};t.url=e,a.handle("openImg",t)},download:function(e){var t={};t.url=e,a.handle("download",t)},touchid:function(t){var e="touchidCallback";a.handle("touchid",{event:e}),r.once(window,e,function(e){t(e)})},wechatin:function(t){var e="wechatCallback";a.handle("wechatin",{event:e}),r.once(window,e,function(e){t(e)})},firePreviousPage:function(){},fire:function(e,t){s.event.fire(e,t,window)}}),this.ui=(n=this,{notice:function(e){var t={};t.data=e.msg,n.handle("callMsg",t)}})}return e.prototype.handle=function(e,t){s.isEmpty(t)&&(t={}),t.action=e,webkit.messageHandlers.AppShell.postMessage(t)},e}();i.SYSIP=e}(BW||(BW={})),function(u){var d=G.d,p=G.tools,t=G.Shell,e=function(){function n(e){var c,l,s=this;this.pages=null,this.tabs=null,this.tabContainer=null,this.tabMenu=[{title:"刷新",callback:function(e){s.window.refresh(e)}},{title:"锁定/解锁",callback:function(e){var t=s.tabs.getTab(e);t&&s.window.lockToggle(e,!t.classList.contains("locked"))}}],this.window=(c=this,{open:function(e,t){if(c.inMain){var n=c.pages.open(e);c.tabs.open(e.url),u.sysPcHistory.add({url:e.url,refer:t,title:""}),n||c.window.fire("wake",c.pages.get(e.url).dom,e.url)}else location.assign(e.url);localStorage.setItem("viewData",JSON.stringify(e.extras))},close:function(e,t,n){void 0===e&&(e=""),void 0===t&&(t=null);var o=u.sysPcHistory.last();if(void 0===n&&(n=o),-1<u.sysPcHistory.indexOf(n)){var i=o===n;c.window.fire(e,t,u.sysPcHistory.getRefer(n)[0]),u.sysPcHistory.remove(n),c.pages.close(n),c.tabs.close(n),0<u.sysPcHistory.len()&&i&&c.window.open({url:u.sysPcHistory.last()})}},closeAll:function(){u.sysPcHistory.get().forEach(function(e){c.pages.close(e),c.tabs.close(e)}),u.sysPcHistory.removeAll()},closeOther:function(){var t=u.sysPcHistory.last();u.sysPcHistory.get().slice(0).forEach(function(e){e!==t&&(c.pages.close(e),c.tabs.close(e),u.sysPcHistory.remove(e))})},refresh:function(e,t){c.pages.refresh(e,function(){"function"==typeof t&&t()})},lockToggle:function(e,t){u.sysPcHistory.lockToggle(e,t),c.tabs.lockToggle(e,t)},load:function(e){location.assign(e)},back:function(e,t){window.history.back()},setTitle:function(e,t){c.tabs.setTabTitle(e,t),u.sysPcHistory.setMenuName(e,t),c.window.setBreadcrumb(e)},opentab:function(){location.assign(u.CONF.url.main)},logout:function(){var e="",t=this.getDevice();t&&(e=t.uuid),window.location.assign(p.url.addObj(u.CONF.url.index,{uuid:e}))},firePreviousPage:function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t]},getDevice:function(e){var t=n.handle("getDevice");return t&&t.msg},quit:function(){},copy:function(e){p.copy(e)},getGps:function(e){e({gps:{},success:!0})},openGps:function(){},update:function(){"AppShell"in window?t.base.versionUpdate(u.CONF.ajaxUrl.pcVersion,function(e){e.success||require(["Modal"],function(e){e.Modal.toast("已经是最新版本")})},function(e){console.log(e)}):require(["Modal"],function(e){e.Modal.toast("已经是最新版本")})},clear:function(){require(["Modal"],function(e){e.Modal.toast("清除成功")})},openImg:function(e){},download:function(e){window.location.href=e},wake:function(e,t){},fire:function(e,t,n){var o=c.pages.get(n);o&&p.event.fire(e,t,o.dom)},setBreadcrumb:function(e){var t=c.pages.get(e);if(t&&t.dom){var n=u.sysPcHistory.getRefer(e,-1),o='<li><span class="iconfont icon-house"></span></li>',i=u.sysPcHistory.getMenuOrder();n.unshift(e);for(var a=n.length-1;0<=a;a--){var r=i[n[a]];r&&r.title&&(o+=0<a?'<li><a data-href="'+n[a]+'">'+r.title+"</a></li>":'<li class="active">'+r.title+"</li>")}var s=d.create('<ol class="breadcrumb">'+o+"</ol>");d.on(s,"click","a[data-href]",function(){c.window.open({url:this.dataset.href})}),t.dom.insertBefore(s,t.dom.firstElementChild)}}}),this.ui=(l=this,{notice:function(e){console.log(e);var t=e.title,n=e.msg,o=e.type,i=e.url,a=e.position,r=e.time,s=e.callback;toastr.options={positionId:a,positionClass:a||"toast-bottom-right",onclick:null,closeButton:!1,showDuration:1e3,hideDuration:1e3,timeOut:r||5e3,extendedTimeOut:1e3,showEasing:"swing",hideEasing:"linear",showMethod:"fadeIn",hideMethod:"fadeOut"},null!=i?(toastr.options.closeButton=!0,toastr.options.onclick=function(){l.window.open({url:u.CONF.siteUrl+i}),$(".messageList").find("li").each(function(){this.dataset.url==i&&$(this).remove()})}):toastr[o||"info"](n,t),setTimeout(s,1500)},indexed:function(e,t){}}),e&&e.pageContainer&&e.navBar?(this.inMain=!0,this.pageContainer=e.pageContainer,this.navBar=e.navBar,this.tabContainer=e.navBar.querySelector("ul.page-tabs-content"),this.pages=new u.sysPcPage(e.pageContainer),this.tabs=new u.sysPcTab(this.tabContainer,this.tabMenu),setTimeout(function(){var e=location.hash,n="";if(e){var t=(e=e.substring(1)).split("="),o=t[0],i=t[1];"page"===o&&i&&(n=u.CONF.siteAppVerUrl+i)}if(location.hash="",u.sysPcHistory.isUseLockInit())u.sysPcHistory.setInitType("0"),setTimeout(function(){u.sysPcHistory.lockGet(function(e){if(u.sysPcHistory.removeAll(),e=e.map(function(e){return e.isLock=!0,u.sysPcHistory.add(e),e}),n){var t={isLock:!1,title:"",url:n};e.push(t),u.sysPcHistory.add(t)}s.tabs.initHistory(e),p.isNotEmpty(e)&&s.window.open({url:e.pop().url})})},200);else{if(n){var a={isLock:!1,title:"",url:n};u.sysPcHistory.add(a)}var r=u.sysPcHistory.last();r&&(s.tabs.initHistory(function(){var e=[],t=u.sysPcHistory.getMenuOrder();for(var n in t){var o=t[n];e.push({url:n,title:o.title,isLock:o.isLock,refer:o.refer})}return e}()),s.window.open({url:r}))}},100)):this.inMain=!1}return n.handle=function(e,t){return"BlueWhaleShell"in window?void 0===t?BlueWhaleShell.postMessage(e):("string"!=typeof t&&(t=JSON.stringify(t)),BlueWhaleShell.postMessage(e,t)):null},n}();u.SYSPC=e}(BW||(BW={})),function(n){n.sys=null,n.__initSys=function(e,t){switch(e){case"pc":n.sys=new n.SYSPC(t);break;case"ad":n.sys=new n.SYSAD;break;case"ip":n.sys=new n.SYSIP;break;case"h5":n.sys=new n.SYSH5}n.sys.os=e,n.sys.isMb="pc"!==e},n.toast=function(t){require(["Modal"],function(e){e.Modal.toast(t)})}}(BW||(BW={})),function(n){var e,t,o,i,a,r,s,c,l,u,d,p,f,g,m,h=G.tools;n.sysPcHistory=(e="openedIframeHash",t="openedMenuOrder",o="lockedMenuKey",i="menuInitType",a=window.localStorage,r=a.getItem(e),s=a.getItem(t),c=a.getItem(o),l=r?r.split(","):[],u=s?JSON.parse(s):{},d=l.length,p=function(e){var t=l.indexOf(e);return 0<=t&&l.splice(t,1),t},f=function(){a.setItem(e,l.join(","))},g=function(){a.setItem(t,JSON.stringify(u))},{len:function(){return d},last:function(){return l[d-1]},getMenuOrder:function(){return u},indexOf:function(e){return l.indexOf(e)},isUseLockInit:function(){return"1"===a.getItem(i)},setInitType:function(e){a.setItem(i,e)},lockGet:(m=function(){var t="lockTab",o=null;if(c&&window.indexedDB){var n=indexedDB.open("BW",1);n.onsuccess=function(e){o=n.result},n.onupgradeneeded=function(e){c&&e.target.result.createObjectStore(t,{keyPath:"lockKey"}).createIndex("tabArr","tabArr",{unique:!1})}}var i=function(e){return void 0===e&&(e=!1),o?o.transaction([t],e?"readwrite":"readonly").objectStore(t):null},e=function(e){o?i().get(c).onsuccess=function(){e(this.result?this.result.tabArr:[])}:e([])};return{get:e,add:function(n){c&&o&&e(function(e){var t=u[n];(e=e||[]).push({url:n,title:t.title,refer:t.refer}),i(!0).put({lockKey:c,tabArr:e})})},del:function(t){c&&o&&e(function(e){Array.isArray(e)&&(e=e.filter(function(e){return e.url!==t}),i(!0).put({lockKey:c,tabArr:e}))})}}}()).get,lockToggle:function(e,t){var n=u[e];n&&((n.isLock=t)?m.add(e):m.del(e),g())},add:function(e){var t=e.url;-1===p(t)&&(d++,u[t]={title:h.str.toEmpty(e.title)},e.refer&&(u[t].refer=e.refer),e.isLock&&(u[t].isLock=e.isLock),g()),l.push(t),f()},remove:function(e){p(e),delete u[e],d--,f(),g()},removeAll:function(){a.removeItem(e),a.removeItem(t),u={},l=[],f(),g(),d=0},setMenuName:function(e,t){u[e]&&(u[e].title=t,g())},get:function(){return l},getRefer:function(e,t){void 0===t&&(t=1);for(var n=[],o=0,i=e;-1===t||o<t;o++){var a,r=u[i];if(!r)break;if(!(a=r.refer)||0<=n.indexOf(a))break;n.push(a),i=a}return n},setLockKey:function(e){a.setItem(o,e)},remainLockOnly:function(t){m.get(function(e){l.filter(function(t){return!e.some(function(e){return e.url===t})}).forEach(function(e){return n.sysPcHistory.remove(e)}),t()})}})}(BW||(BW={})),function(t){var r=G.d,s=G.Ajax,o=G.tools,e=function(){function e(e){var n;this.container=e,this.pages=(n={},{add:function(e){var t;n[(t=e).url]=t},remove:function(e){n[e],delete n[e]},contains:function(e){return e in n},last:function(){var e=t.sysPcHistory.last();return e&&n[e]||null},get:function(e){return n[e]||null}})}return e.prototype.pageCreate=function(n,o){var e,t,i=(e=n.url,(t=document.createElement("div")).classList.add("page-container"),t.dataset.src=e,t);if(-1<n.url.indexOf(location.hostname))s.fetch(n.url).then(function(e){var t=e.response;r.setHTML(i,t),o(i),"function"==typeof n.callback&&n.callback()});else{var a=r.create('<iframe width="100%" src="'+n.url+'"></iframe>');r.append(i,a),i.classList.add("iframe"),o(i),"function"==typeof n.callback&&n.callback()}return i},e.prototype.pageDestroy=function(e){var t,n=this.pages.get(e);n&&(o.event.fire("page.destroy",null,n.dom),n.dom.style.display="none",setTimeout((t=n.dom,void r.remove(t)),30))},e.prototype.pageOpen=function(e){var t=this,n=this.pageCreate(e,function(e){r.append(t.container,e)});this.pages.add({url:e.url,dom:n,data:e.data})},e.prototype.pageShow=function(e){var t=this.pages.get(e);t&&(t.dom.style.display="block")},e.prototype.close=function(e){this.pageDestroy(e),this.pages.remove(e)},e.prototype.open=function(e){var t=this.pages.last();return null!==t&&(t.dom.style.display="none"),this.pages.contains(e.url)?(this.pageShow(e.url),!1):(this.pageOpen(e),!0)},e.prototype.refresh=function(t,n){var o=this,e=this.pages.get(t);e&&(this.pageDestroy(t),e.dom=this.pageCreate({url:t},function(e){t!==o.pages.last().url&&(e.style.display="none"),r.append(o.container,e),"function"==typeof n&&n()}))},e.prototype.get=function(e){return this.pages.get(e)},e}();t.sysPcPage=e}(BW||(BW={})),function(o){var a=G.d,e=function(){function e(e,t){void 0===e&&(e=null),this.headerNavBar=e,this.menu=t,this.tabs={},this.menuEl=null,this.menuCreate(t),this.menuEventInit()}return e.prototype.open=function(e){this.tabs[e]||this.createNewTab(e,void 0),this.activeTab(e)},e.prototype.close=function(e){var t=this.tabs[e];t&&(a.remove(t),delete this.tabs[e])},e.prototype.getTab=function(e){return this.tabs[e]||null},e.prototype.activeTab=function(e){var t=this.tabs[e],n=o.sysPcHistory.last();n&&this.tabs[n].classList.remove("open"),t&&t.classList.add("open")},e.prototype.createNewTab=function(e,t,n){void 0===t&&(t='<div class="spinner"></div>'),void 0===n&&(n=!1);var o=a.create('<li class="dropdown" data-href="'+e+'"><a><span class="title">'+(t||"空")+'</span><span class="close ti-plus" data-href="'+e+'"></span><span class="lock-icon iconfont icon-pin4"></span></a></li>');this.tabs[e]=o,a.append(this.headerNavBar,o),n&&this.lockToggle(e,!0)},e.prototype.lockToggle=function(e,t){var n=this.tabs[e],o=this.headerNavBar;if(n){var i=a.query("li:not(.locked)",o);null===i?a.append(o,n):a.before(i,n),n.classList.toggle("locked",t)}},e.prototype.menuCreate=function(n){var o="",i=a.create('<ul class="tab-menu"></ul>');n.forEach(function(e,t){var n=e.icon?'<span class="iconfont '+e.icon+'"></span>':e.title;o+='<li data-index="'+t+'" title="'+e.title+'">'+n+"</li>"}),i.innerHTML=o,a.on(i,"click","li[data-index]",function(e){var t=parseInt(this.dataset.index);n[t]&&n[t].callback(i.dataset.href),e.stopPropagation()}),a.append(document.body,i),this.menuEl=i},e.prototype.menuEventInit=function(){var t=this;a.on(this.headerNavBar,"contextmenu","li[data-href]",function(e){e.preventDefault(),e.stopPropagation(),t.menuEl&&(t.menuEl.style.top=e.clientY+"px",t.menuEl.style.left=e.clientX+"px",t.menuEl.classList.remove("hide"),t.menuEl.dataset.href=this.dataset.href)}),window.addEventListener("click",function(){t.menuEl.classList.add("hide")},!0)},e.prototype.setTabTitle=function(e,t,n){void 0===e&&(e=o.sysPcHistory.last()),this.tabs[e]&&(this.tabs[e].querySelector("span.title").innerHTML=t,"function"==typeof n&&n())},e.prototype.initHistory=function(e){var t=this;e.forEach(function(e){t.createNewTab(e.url,e.title,e.isLock)})},e}();o.sysPcTab=e}(BW||(BW={}));