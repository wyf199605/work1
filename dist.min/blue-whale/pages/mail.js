define("Mail",["require","exports","InputBox","Button","Rule","Loading"],function(a,t,l,o,c,e){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var p=G.d,s=G.conf,i=function(){function a(a){this.isOne=!0,console.log(a),this.p=a,this.len=a.table.table.data.get().length,this.ajaxLoad(a.urlArr[a.index],a.index)}return a.prototype.btnEvent=function(a){var t=this;this.tpl=this.detailTpl(a),this.p.container.appendChild(this.tpl);var i=p.query(".icon-arrow-down",this.tpl),n=p.query(".icon-arrow-up",this.tpl),e=p.query(".mail-hide",this.tpl),s=(p.query(".mail-avatar",this.tpl),p.query(".btn-group-right",this.tpl)),r=(p.query(".mail-title",this.tpl),new l.InputBox({container:s,size:"small"}));this.prePage=new o.Button({content:"上一封",size:"small",onClick:function(){0<t.index&&t.turnPage(t.index-1)}}),this.nextPage=new o.Button({content:"下一封",size:"small",onClick:function(){t.index<t.len-1&&t.turnPage(t.index+1)}}),r.addItem(this.prePage),r.addItem(this.nextPage),i&&(p.on(i,"click",function(){e.classList.remove("mail-hide")}),p.on(n,"click",function(){e.classList.add("mail-hide")}));var d=this;p.on(this.p.container,"click",'.txt-left [data-href]:not([data-href=""])',function(){c.Rule.link({link:this.dataset.href,varList:JSON.parse(this.dataset.varList),data:d.ajaxData,dataType:this.dataset.dataType,openUrl:this.url})})},a.prototype.setArr=function(a,t){this.p.urlArr=a,this.len=t},a.prototype.turnPage=function(a){var t=p.queryAll("tbody tr[data-index]",this.p.table.wrapper);this.ajaxLoad(this.p.urlArr[a],a),t[a].classList.remove("tr-read"),this.p.table.table.rowSelect(t[a])},a.prototype.dataAdd=function(a,t){for(var i in 0===(this.index=t)?this.prePage.getDom().classList.add("disabled"):this.prePage.getDom().classList.remove("disabled"),t===this.len-1?this.nextPage.getDom().classList.add("disabled"):this.nextPage.getDom().classList.remove("disabled"),a)if("READSTATE"!==i){var n=p.query('[data-name="'+i+'"]',this.tpl);if(n){n.innerHTML=a[i];var e=n.parentElement.classList;"ATTACHNAME"===i&&(e=n.parentElement.parentElement.classList),a[i]?e.remove("hide"):e.add("hide")}}},a.prototype.ajaxLoad=function(a,i){var n=this;this.spinner?this.spinner.show():this.spinner=new e.Loading({}),c.Rule.ajax(s.url.site+a+"&output=json",{cache:!0,defaultCallback:!1,success:function(a){var t=a.body.elements[0];n.isOne&&n.btnEvent(t.fields),c.Rule.ajax(s.url.site+t.dataAddr.dataAddr,{success:function(a){n.ajaxData=a.data[0],n.dataAdd(a.data[0],i),n.spinner.hide(),n.isOne&&(n.p.modal.isShow=!0,n.isOne=!1)}})},error:function(){n.spinner.hide()},netError:function(){n.spinner.hide()}})},a.prototype.detailTpl=function(a){var s,r,d,l="",o="",c=0,t="";return a.forEach(function(a){var t=a.link?a.link.dataAddr:"",i=JSON.stringify(a.link?a.link.varList:""),n='<div class="txt-left"><span class="caption">'+a.caption+'：</span>\n            <span data-name="'+a.name+'" data-href="'+t+'" data-var-list='+i+' data-data-type="'+a.atrrs.dataType+'" \n            data-display-format="'+!a.atrrs.displayFormat+'"></span></div>',e='<div class="txt-left">\n            <span data-name="'+a.name+'" data-href="'+t+'" data-var-list='+i+' data-data-type="'+a.atrrs.dataType+'" \n            data-display-format="'+!a.atrrs.displayFormat+'"></span></div>';"READSTATE"!==a.name&&("TITLE"===a.name?s=e:"ATTACHNAME"===a.name?r=n:"CONTENT"===a.name?d=e:c<3?(c++,o+=n):l+=n)}),""!==l&&(t=' <div class="mail-icon"><span class="iconfont icon-arrow-down"></span><span\n                            class="iconfont icon-arrow-up"></span>\n                    </div>'),p.createByHTML(' <div class="mail-detail">\n       \n        <div class="mail-head mail-hide">\n            <div class="mail-title">\n                '+s+'\n                <div class="btn-group-right"></div>\n                <div class="avatar-right">\n                    <div class="mail-avatar"></div>\n                    '+t+'\n                </div>\n            </div>\n            <div class="mail-three">\n                '+o+'\n            </div>\n            <div class="mail-more">\n                '+l+'\n            </div>\n        </div>\n        <div class="mail-body">'+r+'</div>\n        <div class="mail-content">\n            '+d+"\n        \n        </div>\n\n    </div>")},a}();t.Mail=i});