onmessage=function(a){var n=null;switch(a.data.type){case"cols":n=crossTable.getCols(a.data.data.config);break;case"data":n=crossTable.getData(a.data.data)}postMessage({type:a.data.type,result:n},void 0)};var crossTable=function(){var c=[],a=function(a,e,n,t){var c=e.length,l=0,f=Array.from({length:t},function(){return[]});if(a.forEach(function(o,r){n.forEach(function(a,n){var t=c;f[r].push({title:a[o],name:o+"-"+n,colspan:t}),l+=t})}),1<c)for(var o=function(a,n){var o=a/n;e.forEach(function(a,n){var t=h(a);f[f.length-1].push({title:t,name:a+"-"+o})})},r=0,u=e.length;r<l;r+=u)o(r,u);else{var i=f.length-1,s=function(t,o){var r=e[t];f[i].forEach(function(a,n){(n-t)%o==0&&(a.name=r+"-"+(n-t)/o)})};for(r=0,u=e.length;r<u;r++)s(r,u)}return f},n=function(a,n,t,o){var e=a.length,c=n.length,l=0,f=Array.from({length:o},function(){return[]});a.forEach(function(o,r){t.forEach(function(a,n){var t=(e-r)*c;f[r].push({title:a[o],name:o+"-"+n,colspan:t}),0<r?f[r].push({title:"合计",name:o+"-total-"+n,rowspan:e-r,colspan:c}):l+=t})}),f[0].push({title:"合计",name:"total",rowspan:e,colspan:c});var r=0;if(1<c)for(var u=0,i=n.length;u<l;u+=i){n.forEach(function(a,n){var t=h(a);f[f.length-1].push({title:t,name:a+"-total-"+r})}),r++}else{var s=n[0];f[0].forEach(function(a,n){a.name=s+"-"+n})}return n.forEach(function(a,n){var t=h(a);f[f.length-1].push({title:t,name:a+"-total"})}),f},h=function(a){for(var n=0,t=c;n<t.length;n++){var o=t[n];if(Object.values(o).includes(a))return o.title}return""};return{getCols:function(o){var r=null,e=o.col.length+(1===o.val.length?0:1);return c=o.cols,r=o.colsSum?n(o.col,o.val,o.data,e):a(o.col,o.val,o.data,e),o.row.forEach(function(a,n){var t=h(a);r[0].splice(n,0,{title:t,name:a,rowspan:e,isFixed:o.isFixed})}),r},getData:function(a){for(var n,e,c,t=a.cols,o=a.config,r=[],l={},f=0,u=t;f<u.length;f++)l[u[f].name]=null;return o.colsSum?(o.data.forEach(function(){}),r=[]):(e=l,c=[],(n=o).data.forEach(function(t,o){var r={};n.row.forEach(function(a,n){r[a]=t[a]}),n.val.forEach(function(a,n){r[a+"-"+o]=t[a]}),c.push(Object.assign({},e,r))}),r=c),r}}}();