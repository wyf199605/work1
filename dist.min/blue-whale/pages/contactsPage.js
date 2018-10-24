define(["require","exports","BwRule","DataManager"],function(e,t,E,p){"use strict";var x=G.tools,k=G.d,v=BW.CONF,h=(x.isMb,"click");return function(L){this.para=L;var d=this,f=k.query("#list",document);f.style.height="100%",f.style.overflow="auto",f.style.position="relative";var m,t,b=L.levelField.split(",").map(function(e,t,a){return e.toUpperCase()}),w=L.treeField.split(",").map(function(e,t,a){return e.toUpperCase()}),q=L.fromField,a=(function(){var n,t,a,i,r,l,e=localStorage.getItem("fromPickData"),s=v.siteUrl+E.BwRule.reqAddr(L.dataAddr,e?JSON.parse(e):null),o={queryparam:"",pageparams:""};function c(e,s,n){E.BwRule.Ajax.fetch(e,{cache:!0,data:s}).then(function(e){var t=e.response;console.log(t),d.response=t;var a=G.tools.obj.merge(!0,t);if(s.queryparam){var r=w.length-1,l=[];a.data.forEach(function(e){var a="",t=G.tools.obj.merge(!0,e),n=Object.keys(t).map(function(e){return G.tools.str.toEmpty(t[e])}),i=n.length;n.forEach(function(e,t){e=x.highlight(e,s.queryparam,"red"),a+=e,2===t?a+="<br>":t<i-1&&(a+=", ")}),t[w[r]]=a,l.push(t)}),a.data=l}n(a)}).finally(function(){})}function u(e,u,t,a){var d,f,m,p=e.querySelector("ul.mui-table-view"),v=b[u],h=w[u],g=h===w[w.length-1],y=k.query(g?"#leaf":"#notLeaf").text;if(a=void 0!==a&&a,0===u&&(p.innerHTML=""),!a){if(0===t.length)return!(p.innerHTML='<li style="text-align: center;font-size: 12px;padding: 5px;">暂无数据</li>');p.innerHTML=""}var n,r=[];if(w[u-1],""===L.levelField){var l=k.query("a[data-id]",e);if(1===L.recursion)d=w[0],f=w[2],m=w[1],t.forEach(function(e){0===u?e[m]||r.push(e):e[m]===l.dataset.id&&r.push(e)});else if(0===L.recursion){var i=[];t.forEach(function(t){n=!1,i.forEach(function(e){t[h]===e[h]&&(n=!0)}),n||(i.push(t),n=!1)}),i.forEach(function(e,t){for(var a in e)if(0===u)a===w[u]&&r.push(e);else{var n="";if(a===w[u]){for(var i=0;i<u;i++)n+=e[w[i]];n===l.dataset.id&&r.push(e)}}})}}else r=t;return r.forEach(function(t){var e;if(""===L.levelField){if(1===L.recursion)e={name:t[f],level:u,id:t[d],valueJson:JSON.stringify(t)};else if(0===L.recursion){var a=w[u],n=w[u-1],i=t[a];n&&(i=t[n]+t[a]),e={name:t[w[u]],level:u,id:i,valueJson:JSON.stringify(t)}}}else e={name:t[h],from:t[q],level:u,valueJson:JSON.stringify(t)};if(1===L.recursion){var r=!1;t.forEach(function(e){t[d]===e[m]&&(r=!0)}),y=G.d.query(r?"#notLeaf":"#leaf").text}if(g||(e.query=v&&v.toLowerCase()+"="+t[v]),~Object.keys(t).indexOf(E.BwRule.ColorField)){var l=x.val2RGB(t[E.BwRule.ColorField]),s=l.r,o=l.g,c=l.b;e.name=t[h]+'<span style="height: 14px;display: inline-block;margin-left: 10px;height: 14px; width:50px; background: rgb('+s+","+o+","+c+')"></span>'}p.appendChild(G.d.create(G.tools.str.parseTpl(y,e,!1)))}),!0}c(s,o,function(e){u(f,0,e.data)}),k.on(f,h,".mui-table-view-cell.mui-collapse a",function(e){var a=this;setTimeout(function(){var e,t;void 0===n&&(n=a.parentElement.classList.contains("mui-active")),n||(e=a.parentElement,(t=e).classList.contains("mui-active")?t.classList.remove("mui-active"):t.classList.add("mui-active"))},0)}),k.on(f,h,".mui-table-view-cell a.notLoad[data-query]",function(e){var t=this,a=s+(~s.indexOf("?")?"&":"?")+function e(t,a){void 0===a&&(a="");var n=k.closest(t.parentElement,"li.mui-table-view-cell",f),i=k.query("[data-query]",t),r=a?a+"&"+i.dataset.query:i.dataset.query;return n?e(n,r):r}(t.parentElement);""===d.para.levelField?u(t.parentNode,parseInt(t.dataset.level)+1,d.response.data,null)&&t.classList.remove("notLoad"):c(a,o,function(e){u(t.parentNode,parseInt(t.dataset.level)+1,e.data,null)&&t.classList.remove("notLoad")})}),t=function(e){var t=e.value,a=t.length;(0===a||/\S/.test(t[a-1]))&&(f.querySelector("ul.mui-table-view").innerHTML='<li class="mui-table-view-cell" style="text-align: center"> <span class="mui-spinner" style="vertical-align: bottom;"></span> </li>',0===a?(o={queryparam:"",pageparams:""},m&&m.destroy(),m=null,c(s,o,function(e){var t=w.length-1;o.queryparam?(t=w.length-1,f.classList.add("search")):(t=0,f.classList.remove("search")),e.data.length,u(f,t,e.data)})):(o.queryparam=t.toUpperCase().replace(/'/g,""),m=new p.DataManager({render:function(e){console.log(e)},page:{size:20,container:f},ajax:{auto:!0,fun:function(n){return console.log(n),o.pageparams='{"index"='+(n.current+1)+', "size"='+n.pageSize+"}",console.log(o.pageparams),new Promise(function(a,e){c(s,o,function(e){var t=w.length-1;o.queryparam?(t=w.length-1,f.classList.add("search")):(t=0,f.classList.remove("search")),e.data.length,u(f,t,e.data,0!==n.current),a({data:e.data,total:1e3})})})}}})))},a=null,r=i=0,(l=document.getElementById("searchInput"))&&l.addEventListener("input",function(){var e=this;i=(new Date).getTime(),0===r&&(r=i),i-r<300&&(a&&clearTimeout(a),a=setTimeout(function(){t(e),r=0,a=null},600)),r=i}),l&&setTimeout(function(){l.nextElementSibling&&l.nextElementSibling.addEventListener("click",function(e){e.target.classList.contains("mui-icon-clear")&&(t(l),l.blur(),l.focus())})},1e3)}(),L.multValue),i=document.getElementById("done");t=null,k.on(f,"change","input[type=checkbox]",function(){a||null===t||t.isSameNode(this)||(t.checked=!1);var e=f.querySelectorAll('input[type="checkbox"]:checked').length;i.innerHTML=e?"完成("+e+")":"完成",e?i.classList.contains("mui-disabled")&&i.classList.remove("mui-disabled"):i.classList.contains("mui-disabled")||i.classList.add("mui-disabled"),t=this}),k.on(k.query("#list .mui-table-view"),h,".mui-table-view-cell[data-user-id]",function(e){BW.sys&&BW.sys.window.open({url:x.url.addObj(v.url.myself,{userid:this.dataset.userId})})}),BW.sys&&(BW.sys.window.close=function(){window.parent.document.getElementById("iframe_"+localStorage.getItem("fromPickCaption")).classList.remove("active")}),i&&k.on(i,h,function(){var e=k.queryAll('input[type="checkbox"]:checked',f),t=[];e.forEach(function(e){t.push(JSON.parse(e.dataset.value))});var a=localStorage.getItem("fromPickCaption"),n={caption:a,data:t,otherField:L.otherField,fromField:L.fromField};0<t.length&&(setTimeout(function(){e.forEach(function(e){e.checked=!1}),i.innerHTML="完成",i.classList.add("mui-disabled")},400),G.tools.event.fire("selectContact",n,window.parent),"pc"!==BW.sys.os&&window.parent.document.getElementById("iframe_"+a).classList.remove("active"))})}});