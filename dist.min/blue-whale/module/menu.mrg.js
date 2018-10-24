define("menuMrg",["require","exports","Modal","BwRule","Mask"],function(e,i,u,s,o){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var t,a,n,r,v=G.d;function m(e,t){void 0===t&&(t=!e.classList.contains("mui-active"));var a=o.Mask.getInstance();t?(a.addClick(e,function(){e.classList.remove("mui-active"),a.hide()}),e.classList.add("mui-active"),a.show(e)):(e.classList.remove("mui-active"),a.hide())}i.popoverToggle=m,i.MENU_FAVORITE={currentMenuDom:null,valueObtain:null,parentNode:null,currentConDom:!0,funcNumber:!0,currentGroupDom:!1,openGroupDom:function(e){var t=G.d.create(e.getElementById("openGroupTpl").text);e.body.appendChild(t);var a=t.querySelector(".reqGroup"),o=t.querySelector(".btn-close"),r=t.querySelector(".set_s"),l=t.querySelector(".txt_row"),c=t.querySelector(".txt_t"),d=null;return v.on(o,"click",function(){m(i.MENU_FAVORITE.openGroupDom,!1)}),a.addEventListener("click",function(){if("block"===l.style.display){var e=r.options;i.MENU_FAVORITE.currentGroupDom=!1;for(var t=0;t<length;t++)e[t].text==c.value&&(i.MENU_FAVORITE.currentGroupDom=!0);var a=c.value.trim();if(""===a)u.Modal.alert("内容不能为空！"),i.MENU_FAVORITE.currentGroupDom=!0;else if("默认分组"===a)u.Modal.alert("该命名已存在！");else{var o=document.createElement("option");d=a,o.value=d,o.text=d,r.appendChild(o)}}else d=r.options[r.selectedIndex].value;if(!i.MENU_FAVORITE.currentGroupDom){var n=document.getElementById("favSheet").dataset.link;s.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor,{type:"POST",data2url:!0,data:{action:"add",link:n,tag:d.trim()}}).then(function(e){var t=e.response;i.MENU_FAVORITE.currentMenuDom.dataset.favid=t.data[0].favid,m(i.MENU_FAVORITE.openGroupDom),u.Modal.toast("收藏成功")})}}),t}(document),favEditDom:(n=document,r=G.d.create(n.getElementById("favEditTpl").text),n.body.appendChild(r),r),favSheetDom:(t=document,a=G.d.create(t.getElementById("favSheetTpl").text),G.d.on(a,"click","li[data-action]",function(e){switch(e.preventDefault(),this.dataset.action){case"favAdd":i.MENU_FAVORITE.favActionHandle("add",a.dataset.link);break;case"favCancel":i.MENU_FAVORITE.favActionHandle("cancel",a.dataset.favid);break;case"close":default:m(i.MENU_FAVORITE.favSheetDom,!1)}}),t.body.appendChild(a),a),toggleEditGroup:function(){var e=document.getElementById("favEdit"),t=e.querySelector(".edit-req"),a=e.querySelector(".txt_edit"),o=e.querySelector(".edit-close"),n=(document.querySelector(".mui-backdrop"),e.querySelector(".edit-del"));v.on(o,"click",function(){m(i.MENU_FAVORITE.favEditDom,!1)}),v.on(t,"click",function(){document.querySelector(".editBook");var e=i.MENU_FAVORITE.valueObtain,c=a.value,t=G.tools.str.utf8Len(a.value);0===t?u.Modal.alert("命名不能为空！"):20<t?u.Modal.alert("超出命名长度！"):e===c||""===e&&"默认分组"===c?m(i.MENU_FAVORITE.favEditDom):s.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor,{data2url:!0,data:{action:"renameTag",tag:e,rename:c}}).then(function(e){e.response;m(i.MENU_FAVORITE.favEditDom);var t=i.MENU_FAVORITE.parentNode.parentNode.parentNode,a=t.parentNode.querySelector('[data-edit="'+c+'"]'),o=document.createDocumentFragment();if(t.querySelector(".conFavGroup").innerHTML=c,a){for(var n=t.querySelectorAll("li[data-favid]"),r=n.length,l=0;l<=r-1;l++)o.appendChild(n[l]);a.parentNode.parentNode.appendChild(o),t.remove()}i.MENU_FAVORITE.parentNode.dataset.edit=c})}),v.on(n,"click",function(){var t=i.MENU_FAVORITE.valueObtain;u.Modal.confirm({msg:"确认删除？",callback:function(e){e&&s.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor,{data2url:!0,data:{action:"delTag",tag:t}}).then(function(){i.MENU_FAVORITE.parentNode.parentNode.parentNode.remove(),m(i.MENU_FAVORITE.favEditDom)})}})})},toggleConGroup:function(){var e=document.getElementById("openGroup"),t=e.querySelector(".set_row"),a=e.querySelector(".add_g"),o=e.querySelector(".add_d"),n=e.querySelector(".txt_t"),r=e.querySelector(".set_s"),l=document.querySelector(".mui-backdrop"),c=e.querySelector(".txt_row");v.on(a,"click",function(){t.style.display="none",c.style.display="block"}),v.on(o,"click",function(){c.style.display="none",t.style.display="block"}),l&&l.addEventListener("click",function(){r.blur(),n.blur()},!1),e&&e.addEventListener("click",function(){r.blur(),n.blur()},!1)},toggleFavSheet:function(e,t,a){var o,n=document.getElementById("openGroup"),u=n.querySelector(".set_row"),r=n.querySelector(".txt_row"),l=n.querySelector(".txt_t"),c=document.querySelector(".addGroup");if(this.currentMenuDom=e,!G.tools.isEmpty(t))for(o in a=a||{},"cancel"===t?this.favSheetDom.classList.add("fav-cancel"):(this.favSheetDom.classList.remove("fav-cancel"),i.MENU_FAVORITE.currentConDom&&c.addEventListener("click",function(){m(i.MENU_FAVORITE.favSheetDom),m(i.MENU_FAVORITE.openGroupDom),r.style.display="none",u.style.display="block",l.value="",s.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor,{data2url:!0,data:{action:"tags"}}).then(function(e){var t=e.response,a=u.querySelector(".set_s"),o=t.data.length,n=document.createDocumentFragment();if(a.innerHTML="",0===o){var r=document.createElement("option");r.setAttribute("value","默认分组"),r.text="默认分组",a.appendChild(r)}for(var l=0;l<=o-1;l++){var c=document.createElement("option");if(t.data[l].tag){var d=t.data[l].tag;c.setAttribute("value",d),c.text=d}else c.setAttribute("value",""),c.text="默认分组";n.appendChild(c)}a.appendChild(n)}),i.MENU_FAVORITE.toggleConGroup(),i.MENU_FAVORITE.currentConDom=!1})),a)a.hasOwnProperty(o)&&(this.favSheetDom.dataset[o]=a[o]);m(this.favSheetDom)},favActionHandle:function(e,t){var a,o=this;a="add"===e?{action:"add",link:t}:{action:"del",favid:t},s.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor,{data:a,data2url:!0,type:"POST"}).then(function(e){e.response;if("add"===a.action);else{if(u.Modal.toast("取消收藏成功"),o.currentMenuDom.dataset.favid="",v.query('.tab-pane[data-index="1"]')){o.currentMenuDom.querySelector("a").remove();var t=v.closest(o.currentMenuDom,".mui-table-view-cell");t.querySelector("a")||t.remove()}o.toggleFavSheet()}})}}});