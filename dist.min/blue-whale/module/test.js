define("Test",["require","exports","BasicPage","Modal","ModalFooter","Button"],function(n,e,t,b,a,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=G.d,o=function(t){function n(n){var e=t.call(this,n)||this;return e.para=n,e.but={},e.container=n.dom,e.initPage(),e}return __extends(n,t),n.prototype.initPage=function(){this.container.innerHTML='<div data-name = "demo1" class="demo1"></div><br><div data-name = "demo2" class="demo2"></div><br><div data-name = "demo3" class="demo3"></div>',this.replaceType()},n.prototype.replaceType=function(){var e=this,t=G.d.createByHTML("<div>var modal = new Modal();</div>"),o=G.d.createByHTML("<div>var modal = new Modal({<br>&nbsp&nbsp&nbsptitle:'简单构造一个模态框',<br>&nbsp&nbsp&nbspposition:'left',,<br>&nbsp&nbsp&nbspwidth:'500',<br>&nbsp&nbsp&nbspisBackground:false,<br>});</div>"),s=G.d.createByHTML("<div>var modal = new Modal({<br>&nbsp&nbsp&nbsptitle:'1',<br>&nbsp&nbsp&nbspfooter:new ModalFooter()<br>});<br>modal.onOk(){<br>&nbsp&nbsp&nbspif(modal.title=='1'){<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbspmodal.isBackground=false;<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbspmodal.title=2;<br>&nbsp&nbsp&nbsp}else(){<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbspmodal.isBackground=true;<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbspmodal.title=1;<br>&nbsp&nbsp&nbsp}<br>}</div>");r.queryAll("[data-name]",document.body).forEach(function(n){switch(n.dataset.name){case"demo1":e.but.demo1=new i.Button({container:n,content:"默认值",type:"primary",onClick:function(n){new b.Modal({body:t})}});break;case"demo2":e.but.demo2=new i.Button({container:n,content:"简单构造",type:"primary",onClick:function(n){new b.Modal({title:"简单构造一个模态框",position:"left",width:"500",isBackground:!1,body:o})}});break;case"demo3":e.but.demo3=new i.Button({container:n,content:"运行中动态变化",type:"primary",onClick:function(n){var e=new b.Modal({title:"1",body:s,footer:new a.ModalFooter});e.onOk=function(){"1"==e.title?(e.isBackground=!1,e.title=2):(e.isBackground=!0,e.title=1)}}})}})},n}(t.default);e.Test=o});