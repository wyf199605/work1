define(["require","exports","BasicPage","BwSubTableModule"],function(e,t,a,o){"use strict";return function(t){function e(s){var n=t.call(this,s)||this;n.para=s,n.tableModules=[];var l=s.subTables,e=s.uniqueDom;return e.on("shown.bs.tab",function(e){if("1"!==e.target.dataset.load){var t=parseInt(e.target.dataset.index),a=l[t];n.tableModules[t]=new o.BwSubTableModule({container:s.tableDom[t],ui:a}),e.target.dataset.load="1"}}),e.first().tab("show"),e.first().parent().find(".panel-tools").show(),n.panelInit(),n}return __extends(e,t),e.prototype.panelInit=function(){var e=$(this.para.dom),l=this.para.uniqueDom;function o(e){var t=$(e).closest(".panel");t.children(".panel-body").slideToggle(200,function(){t.toggleClass("collapses")})}e.on("click",".panel-collapse",function(e){$(this.parentNode).find(".panel-tools").toggle();var t=$(l[this.dataset.index]);e.preventDefault(),o(this),t.trigger("shown.bs.tab")}),e.on("click",".panel-fullscreen",function(e){var t=this.parentNode.parentNode.querySelector(".panel-collapse"),a=t.parentNode.parentNode,s=t.dataset.index,n=$(l[s]);a.classList.contains("is-fullscreen")?a.classList.remove("is-fullscreen"):(a.classList.add("is-fullscreen"),a.classList.contains("collapses")&&o(this)),n.trigger("shown.bs.tab")})},e}(a.default)});