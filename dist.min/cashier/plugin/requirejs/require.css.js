define(function(){if("undefined"==typeof window)return{load:function(e,t,n){n()}};var e=document.querySelector("head"),t=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/)||0,n=!1,r=!0;t[1]||t[7]?n=parseInt(t[1])<6||parseInt(t[7])<=9:t[2]||t[8]||"WebkitAppearance"in document.documentElement.style?r=!1:t[4]&&(n=parseInt(t[4])<18);var o={};o.pluginBuilder="./css-builder";var i,l,a,s=function(){i=document.createElement("style"),e.appendChild(i),l=i.styleSheet||i.sheet},u=0,c=[],d=function(e){l.addImport(e),i.onload=function(){f()},31==++u&&(s(),u=0)},f=function(){a();var e=c.shift();e?(a=e[1],d(e[0])):a=null},p=function(e,t){if(l&&l.addImport||s(),l&&l.addImport)a?c.push([e,t]):(d(e),a=t);else{i.textContent='@import "'+e+'";';var n=setInterval(function(){try{i.sheet.cssRules,clearInterval(n),t()}catch(e){}},10)}},h=function(t,n){var o=document.createElement("link");if(o.type="text/css",o.rel="stylesheet",r)o.onload=function(){o.onload=function(){},setTimeout(n,7)};else var i=setInterval(function(){for(var e=0;e<document.styleSheets.length;e++)if(document.styleSheets[e].href==o.href)return clearInterval(i),n()},10);o.href=t,e.appendChild(o)};return o.normalize=function(e,t){return".css"==e.substr(e.length-4,4)&&(e=e.substr(0,e.length-4)),t(e)},o.load=function(e,t,r,o){(n?p:h)(t.toUrl(e+".css"),r)},o});