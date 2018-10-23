define("Mail",["require","exports","InputBox","Button","Loading","UserSelect","BwRule","BwInventoryBtnFun","ButtonAction"],function(t,a,d,o,n,e,c,r,p){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var u=G.d,v=G.tools,l=BW.CONF,i=function(){function t(t){this.isOne=!0,this.ajax=new c.BwRule.Ajax,this.p=t,this.len=t.table.ftable.data.length,this.ajaxLoad(t.link,t.index),new e.UserSelect({target:t.container})}return t.prototype.btnEvent=function(t){var a=this;this.tpl=this.detailTpl(t),this.p.container.appendChild(this.tpl);var n=u.query(".icon-arrow-down",this.tpl),e=u.query(".icon-arrow-up",this.tpl),i=u.query(".mail-hide",this.tpl),s=(u.query(".mail-avatar",this.tpl),u.query(".btn-group-right",this.tpl)),l=(u.query(".mail-title",this.tpl),new d.InputBox({container:s,size:"small"}));this.prePage=new o.Button({content:"上一封",size:"small",onClick:function(){0<a.index&&a.turnPage(a.index-1)}}),this.nextPage=new o.Button({content:"下一封",size:"small",onClick:function(){a.index<a.len-1&&a.turnPage(a.index+1)}}),l.addItem(this.prePage),l.addItem(this.nextPage),n&&(u.on(n,"click",function(){i.classList.remove("mail-hide")}),u.on(e,"click",function(){i.classList.add("mail-hide")}));var r=this;u.on(this.p.container,"click",'.txt-left [data-href]:not([data-href=""])',function(){c.BwRule.link({link:this.dataset.href,varList:JSON.parse(this.dataset.varList),data:r.ajaxData,dataType:this.dataset.dataType})})},t.prototype.turnPage=function(t){"function"==typeof this.p.onChange&&this.p.onChange(t)},t.prototype.dataAdd=function(t,a){for(var n in 0===(this.index=a)?this.prePage.getDom().classList.add("disabled"):this.prePage.getDom().classList.remove("disabled"),a===this.len-1?this.nextPage.getDom().classList.add("disabled"):this.nextPage.getDom().classList.remove("disabled"),t)if("READSTATE"!==n){var e=u.query('[data-name="'+n+'"]',this.tpl);if(e){e.innerHTML=t[n];var i=e.parentElement.classList;"ATTACHNAME"===n&&(i=e.parentElement.parentElement.classList),t[n]?i.remove("hide"):i.add("hide")}}},t.prototype.initSubBtns=function(t){var s=this;this.btnWrapper=h("div",{className:"mail-btn-group"});var a=new d.InputBox({container:this.btnWrapper,isResponsive:!v.isMb}),l=this.p.table.ftable;Array.isArray(t)&&t.forEach(function(t){var i=new o.Button({icon:t.icon,content:t.title,isDisabled:!(0===t.multiselect||2===t.multiselect&&t.selectionFlag),data:t,onClick:function(){if(-1===i.data.openType.indexOf("rfid")){var t=i.data,a=t.multiselect,n=t.selectionFlag,e=2===a&&n?l.unselectedRowsData:l.selectedRowsData;console.log(1===a?e[0]:e),p.ButtonAction.get().clickHandle(t,1===a?e[0]:e,function(t){},s.p.table.pageUrl)}else r.InventoryBtn(i,s.p.table)}});a.addItem(i)});var e=l.selectedRows.length,i=l.rows.length;a.children.forEach(function(t){var a=t.data.selectionFlag,n=t.data.selectionFlag?i-e:e;t.isDisabled=0===n?!a&&0<t.data.multiselect:1!==e&&2!==t.data.multiselect})},t.prototype.ajaxLoad=function(t,i){var s=this;this.spinner?this.spinner.show():this.spinner=new n.Loading({}),this.ajax.fetch(l.siteUrl+t,{cache:!0,data:{output:"json"}}).then(function(t){var a=t.response,n=a.body.elements[0],e=n.subButtons;return!Array.isArray(e)&&(e=[]),Array.isArray(a.body.subButtons)&&a.body.subButtons.forEach(function(t){e.push(t)}),s.initSubBtns(e),s.isOne&&s.btnEvent(n.fields),s.ajax.fetch(l.siteUrl+n.dataAddr.dataAddr,{cache:!0}).then(function(t){var a=t.response;s.ajaxData=a.data[0],s.dataAdd(s.ajaxData,i),s.isOne&&(s.p.modal.isShow=!0,s.isOne=!1)})}).finally(function(){s.spinner.hide()})},t.prototype.detailTpl=function(t){var s,l,r,d="",o="",c=0,a="";t.forEach(function(t){var a=t.link?t.link.dataAddr:"",n=JSON.stringify(t.link?t.link.varList:""),e='<div class="txt-left"><span class="caption">'+t.caption+'：</span>\n            <span data-name="'+t.name+'" data-href="'+a+'" data-var-list='+n+' data-data-type="'+t.atrrs.dataType+'" \n            data-display-format="'+!t.atrrs.displayFormat+'"></span></div>',i='<div class="txt-left">\n            <span data-name="'+t.name+'" data-href="'+a+'" data-var-list='+n+' data-data-type="'+t.atrrs.dataType+'" \n            data-display-format="'+!t.atrrs.displayFormat+'"></span></div>';"READSTATE"!==t.name&&("TITLE"===t.name?s=i:"ATTACHNAME"===t.name?l=e:"CONTENT"===t.name?r=i:c<3?(c++,o+=e):d+=e)}),""!==d&&(a=' <div class="mail-icon"><span class="iconfont icon-arrow-down"></span><span\n                            class="iconfont icon-arrow-up"></span>\n                    </div>');var n=u.create('<div>\n            <div class="mail-head mail-hide">\n                <div class="mail-title">\n                    '+s+'\n                    <div class="btn-group-right"></div>\n                    <div class="avatar-right">\n                        <div class="mail-avatar"></div>\n                        '+a+'\n                    </div>\n                </div>\n                <div class="mail-three">\n                    '+o+'\n                </div>\n                <div class="mail-more">\n                    '+d+'\n                </div>\n            </div>\n            <div class="mail-body">'+l+'</div>\n            <div class="mail-content">\n                '+r+"\n            </div>\n        </div>");return h("div",{className:"mail-detail"},this.btnWrapper,n)},t}();a.Mail=i});