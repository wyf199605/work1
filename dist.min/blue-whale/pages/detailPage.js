define(["require","exports","BasicPage","BwRule","Modal","PopMenu","InputBox","Button","ButtonAction","TurnPage"],function(d,t,a,f,p,h,g,m,y,b){"use strict";var v=G.tools,w=BW.sys,B=G.d;return function(u){function t(o){var i,t=u.call(this,o)||this,n=(t.para=o).ajaxUrl,a=t;if(r(n,{}),t.on("refreshData",function(){r(n,{})}),t.isMb){B.on(o.ulDom,"click",'.mui-table-view-cell[data-href]:not([data-href=""])',function(){var t=B.query("[data-col]",this);f.BwRule.link({link:this.dataset.href,varList:JSON.parse(this.dataset.varList),data:i,dataType:t.dataset.dataType,openUrl:a.url})}),B.on(o.ulDom,"click",".fold",function(){this.classList.toggle("ellipsis-row3")});var l=new h.PopMenu({arr:["复制"],callback:function(t,a){w.window.copy(a)}});B.on(o.ulDom,"longtap",".mui-col-xs-8, [data-col=CONTENT]",function(t){var a=this.getBoundingClientRect(),n=this.offsetWidth/2+a.left,e=a.top;l.show(e,n,v.str.removeHtmlTags(this.innerHTML))}),B.on(o.btns,"click","span[data-button-type]",function(t){y.ButtonAction.get().clickHandle(y.ButtonAction.get().dom2Obj(this),i)});var e=JSON.parse(window.localStorage.getItem("nextKeyField")),s=window.localStorage.getItem("currentKeyField");v.isNotEmpty(s)&&new b.TurnPage({curIndex:parseInt(s),len:e.length,onChange:function(t){r(n.substr(0,n.indexOf("?")),Object.assign({nopage:!0},e[t]))}});var c=o.ui.scannableField;v.isNotEmpty(c)&&d(["MobileScan"],function(t){var a=o.ui;new t.MobileScan({scannableType:a.scannableType,scannableTime:a.scannableTime,callback:function(t){var a;r(n,((a={})[c]=t.mobilescan,a))}})})}else B.on(o.btns,"click","[data-button-type]",function(t){y.ButtonAction.get().clickHandle(y.ButtonAction.get().dom2Obj(this),i,function(){},a.url)}),B.on(o.list,"click",'.list-group-item[data-href]:not([data-href=""])',function(){var t=B.query("[data-col]",this);f.BwRule.link({link:this.dataset.href,varList:JSON.parse(this.dataset.varList),data:i,dataType:t.dataset.dataType})});function r(t,a){f.BwRule.Ajax.fetch(t,{data:a}).then(function(t){var n=t.response;if(0!==n.data.length){o.dataCols&&o.dataCols.forEach(function(t){var a=n.data[0][t.dataset.col];null==a?B.remove(t.parentNode):t.innerHTML=f.BwRule.formatText(a,{dataType:t.dataset.dataType,displayFormat:t.dataset.displayFormat})}),i=n.data[0];var e=new g.InputBox({container:o.btns,size:"small"});Array.isArray(o.data)&&o.data.forEach(function(t){var a=new m.Button({content:t.title,icon:t.icon,onClick:function(){y.ButtonAction.get().clickHandle(t,i)}});e.addItem(a)})}else p.Modal.alert("数据为空")})}return t}return __extends(t,u),t}(a.default)});