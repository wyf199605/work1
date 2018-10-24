define("QueryBuilder",["require","exports","BwRule","SelectInput","CheckBox","TextInput","DatetimeMb","Datetime","DropDown","NumInput","SelectInputMb","Modal","Picker"],function(t,e,l,s,n,r,c,u,o,d,p,m,f){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var y=G.tools,v=BW.sys,g=G.d,a=y.date.range,w=[{text:"今天",value:a.today()},{text:"昨天",value:a.yesterday()},{text:"本周",value:a.thisWeek()},{text:"上周",value:a.lastWeek()},{text:"本月",value:a.thisMonth()},{text:"上月",value:a.lastMonth()},{text:"本季度",value:a.thisSeason()},{text:"上季度",value:a.lastSeason()},{text:"今年",value:a.thisYear()},{text:"去年",value:a.lastYear()}];function q(a,t,e,i,n){switch(e){case"datetime":o(n?c.DatetimeMb:u.Datetime,t);break;case"text":(!a||a.constructor===r.TextInput)&&a instanceof r.TextInput||o(r.TextInput,t);break;case"select":case"bool":a instanceof s.SelectInput?a.setPara(t):o(n?p.SelectInputMb:s.SelectInput,t);break;case"number":a instanceof d.NumInput||o(d.NumInput,t)}return y.isMb&&a&&(a.isScan=t&&t.isScan),a;function o(t,e){a&&a.destroy(),e.container=i,(a=new t(e)).on("paste",function(t){var e=t.clipboardData.getData("Text").replace(/\r\n/g,",");a.set(e),t.preventDefault()})}}function x(a,i){var t=v.isMb?"longtap":"contextmenu",e=function(t){if(v.isMb)h(f.PickerList,{onSet:function(t){a.set(t[0].value[0]),i.set(t[0].value[1])}},h(f.Picker,{optionData:w}));else{t.preventDefault();var e=new o.DropDown({el:this,data:w,onSelect:function(t){a.set(t.value[0]),i.set(t.value[1]),e.destroy()}});e.showList()}};g.on(a.wrapper,t,e),g.on(i.wrapper,t,e)}var i=function(){function o(t){var e,i=this;this.para=t,this.rowsCom=[],this.rowsLen=0,this.rowsIndex=0,this.ajax=new l.BwRule.Ajax,this.rowInitFactory={field:function(t,a){return q(null,{clickType:0,readonly:!0,data:i.fieldOptions,onSet:function(t,e){i.fieldSet(e,i.rowsCom[a])}},"select",t,v.isMb)},not:function(t,e){return new n.CheckBox({container:t,text:y.isPc?"不":""})},operator:function(t,a){return q(null,{clickType:0,readonly:!0,data:l.BwRule.QUERY_OP,onSet:function(t,e){i.operateSet(e,i.rowsCom[a])}},"select",t,v.isMb)},input1:e=function(t,e){return null},input2:e,andOr:function(a,t){return new n.CheckBox({container:a,onSet:function(t){var e=g.closest(a,"[data-index]");e&&e.classList[t?"remove":"add"]("orCondition")}})}};var a=this;t.tpl||(t.tpl=v.isMb?'<li class="mui-table-view-cell"><div class="mui-slider-right mui-disabled" data-action="del"><a class="mui-btn mui-btn-red">删除</a></div><div class="mui-slider-left mui-disabled"><a class="mui-btn" data-type="andOr"></a></div><div class="mui-slider-handle inner-padding-row"><div data-type="field"></div><div data-type="not"></div><div data-type="operator"></div><div data-type="input1"></div><div data-type="input2"></div></div></li>':'<div class="row"> <div class="col-sm-3" data-type="field"></div> <div class="col-sm-1" data-type="not"></div> <div class="col-sm-2" data-type="operator"></div> <div class="col-sm-3" data-type="input1"></div> <div class="col-sm-3" data-type="input2"></div> <span data-action="del" class="iconfont red icon-close"></span> <span data-type="andOr"></span></div>'),this.queryConfigs=t.queryConfigs,a.fieldOptions=o.config2Options(this.queryConfigs),this.initSettings(),this.rowsCom[0]||this.rowAdd(),g.on(t.resultDom,"click","[data-action]",function(){switch(this.dataset.action){case"add":a.rowAdd();break;case"del":if(1<a.rowsLen){var t=parseInt(g.closest(this.parentElement,"[data-index]").dataset.index);a.rowDel(t)}else m.Modal.toast("至少需要一个条件")}})}return o.config2Options=function(t){return t.map(function(t){return{text:t.caption,value:t.field_name}})},o.prototype.initSettings=function(){var e=this,t=this.para.setting;t&&t.params&&t.params[0]&&t.params.forEach(function(t){if(e.confGetByFieldName(t.field)){e.rowAdd(t);var a=e.rowsCom[e.rowsIndex-1];a.not.set(t.not),a.operator.set(t.op),a.andOr.set(t.andOr),Array.isArray(t.values)&&t.values.forEach(function(t,e){a["input"+(e+1)].set(t)})}})},o.prototype.defaultParamGet=function(){for(var t=this.rowsCom.map(function(t){return t.field.get()}),e=this.queryConfigs,a=0,i=e;a<i.length;a++){var n=i[a];if(-1===t.indexOf(n.field_name))return{field:n.field_name,not:!1,andOr:!0}}return{field:e[0].field_name,not:!1,andOr:!0}},o.prototype.rowDel=function(t){var e=this.rowsCom[t];e&&(y.obj.toArr(e).forEach(function(t){return t.destroy()}),e=null,delete this.rowsCom[t],g.remove(g.query(':scope > [data-index="'+t+'"]',this.para.resultDom)),this.rowsLen--)},o.prototype.rowAdd=function(t){void 0===t&&(t=this.defaultParamGet());var e=this.rowCreate(this.rowsIndex);e&&(e.field.set(t.field),e.not.set(t.not),e.andOr.set(t.andOr),this.rowsIndex++,this.rowsLen++)},o.prototype.rowCreate=function(a){var i=this,t=g.create(this.para.tpl),n={};return t.dataset.index=a.toString(),g.queryAll("[data-type]",t).forEach(function(t){var e=t.dataset.type;n[e]=i.rowInitFactory[e](t,a)}),n&&(this.rowsCom.push(n),g.append(this.para.resultDom,t)),n},o.prototype.fieldSet=function(t,e){var a=this.queryConfigs[t],i=l.BwRule.isTime(a.atrrs.dataType)?5:0,n=o.displayControl(a);e.operator.showItems(l.BwRule.isNumber(a.atrrs.dataType)?[0,1,2,3,4,5,6,8]:null),e.operator.set(l.BwRule.QUERY_OP[i].value),this.domDisplayMethod(n,e)},o.prototype.operateSet=function(t,e){var a={};switch(e.operator.get()){case 2:case 5:case 6:a.input1=!0,a.input2=!1;break;case 3:case 4:case 8:case 9:a.input1=!1,a.input2=!0;break;case 7:a.input1=!0,a.input2=!0;break;case 10:a.input1=!1,a.input2=!1}this.domDisplayMethod(a,e)},o.displayControl=function(t){var e=l.BwRule.isTime(t.atrrs.dataType),a=t.atrrs.dataType===l.BwRule.DT_BOOL,i=[],n={placeholder:"",inputType:"text"};return(t.type||e||a)&&(t.type?(i.push("下拉选择"),n.inputType="select"):e?(n.inputType="datetime",i.push(v.isMb?"长按快捷选择":"右键快捷选择")):a&&(n.inputType="bool",i.push("下拉选择"))),n.readonly=e||a,n.readonly||i.length<1&&i.push("输入值"),n.placeholder="请"+i.join("、")+"...",n},o.prototype.confGetByFieldName=function(t){for(var e=0,a=null;a=this.queryConfigs[e];e++)if(a.field_name===t)return this.queryConfigs[e];return null},o.prototype.domDisplayMethod=function(a,i){var t=this.rowsCom.indexOf(i),e=this.confGetByFieldName(i.field.get()),n=this.para.resultDom,o={input1:g.query('[data-index="'+t+'"] [data-type="input1"]',n),input2:g.query('[data-index="'+t+'"] [data-type="input2"]',n)},s=this.conf2comPara(a.inputType,e,t);["input1","input2"].forEach(function(t){!s&&(s={}),"datetime"===a.inputType&&"input2"===t&&Object.assign(s,{defaultHour:23,defaultMinute:59,defaultSeconds:59});var e=i[t]=q(i[t],s,a.inputType,o[t],v.isMb);t in a&&o[t].classList[a[t]?"remove":"add"]("hide"),"readonly"in a&&e.readonly(a.readonly),"placeholder"in a&&e.placeholder(a.placeholder)}),"datetime"===a.inputType&&i.input1&&i.input2&&x(i.input1,i.input2),"input1"in a&&"input2"in a&&o.input1.classList[a.input1&&a.input2?"add":"remove"]("has-two-input")},o.prototype.conf2comPara=function(t,r,l){var c=this,e=r.atrrs,a=1===r.atrrs.allowScan;switch(t){case"datetime":return{format:e.displayFormat};case"text":return a?{isScan:a}:{};case"select":return{data:"VALUELIST"===r.type&&Array.isArray(r.value_list)?r.value_list:null,ajax:r.type&&r.link?{fun:function(t,e,n){var a={};if("QRYVALUE"===r.type&&(a.inputedtext=e),1===r.dynamic){var i=c.dataGet(l);a[c.para.queryName]=null===i?"":JSON.stringify(i);var o=c.para.atVarDataGet;if("function"==typeof o){var s=o();a.atvarparams=null===s?"":JSON.stringify(s)}}c.ajax.fetch(t,{data:a,cache:!0}).then(function(t){var e=t.response,a=[];e.data[0]&&(a=Object.keys(e.data[0]));var i=e.data.map(function(e){return{value:e[r.field_name],text:a.map(function(t){return e[t]}).join(",")}});n(i)}).catch(function(){n()})},url:BW.CONF.siteUrl+r.link}:null,useInputVal:!0,isScan:a};case"bool":return{data:[{value:e.trueExpr,text:"是"},{value:e.falseExpr,text:"否"}],useInputVal:!1}}},o.prototype.paramBuild=function(t){if(t){var e={},a=t.input1.get(),i=t.input2.get();e.op=t.operator.get(),e.field=t.field.get(),e.not=!!t.not.get(),e.andOr=!!t.andOr.get();var n=this.confGetByFieldName(e.field);if((!this.para.isTransCase||this.para.isTransCase&&!this.para.isTransCase())&&(a=l.BwRule.maxValue(a,n.atrrs.dataType,n.atrrs.maxValue),i=l.BwRule.maxValue(i,n.atrrs.dataType,n.atrrs.maxValue)),10===e.op)e.values=[];else{if(3===e.op||4===e.op||9===e.op)e.values=[i];else if(2===e.op||5===e.op||6===e.op)e.values=[a];else if(7===e.op){if(e.values=[a],y.isEmpty(i))return null;e.values.push(i)}else 8===e.op&&(i.replace("，",","),e.values=i.split(","));if(e.values.every(function(t){return y.isEmpty(t)}))return null}return e}},o.dataBuild=function(t,e,a){void 0===a&&(a=!1);var i={not:!1,op:0,params:[]},n=t.length;e=-1===e?n:e;for(var o=0,s=void 0;o<e;o++)if(s=t[o]){var r=t[o-1],l={not:s.not,op:s.op,field:s.field,values:s.values};a&&(l.andOr=s.andOr),!a&&1<o&&r.andOr!==s.andOr?i={not:!1,op:s.andOr?0:1,params:[i,l]}:(a||1!==o||(i.op=s.andOr?0:1),i.params.push(l))}return i.params[0]?i:null},o.prototype.dataGet=function(t,e){var a=this;void 0===t&&(t=-1),void 0===e&&(e=!1);var i=this.rowsCom.map(function(t){return a.paramBuild(t)}).filter(function(t){return t});return o.dataBuild(i,t,e)},o}();e.QueryBuilder=i;var b=function(){function t(t){var i=this;this.para=t,this.coms={},this.queryConfigs=this.para.queryConfigs,this.initSettings(),this.queryConfigs.forEach(function(t,e){var a=y.str.toEmpty(t.atrrs.defaultValue);i.rowAdd(e,t,a)})}return t.prototype.initSettings=function(){var e=this.para.setting;e&&this.queryConfigs.forEach(function(t){t.atrrs.defaultValue=e[t.field_name]})},t.prototype.conf2comPara=function(t,e){var a=e.atrrs,i=1===e.atrrs.allowScan;switch(t){case"datetime":return{format:a.displayFormat};case"text":return{isScan:i,on2dScan:this.para.on2dScan};case"select":var n=Object.keys(e.data[0]);return{data:e.data.map(function(e){return{text:n.map(function(t){return e[t]}).join(","),value:y.str.toEmpty(e[n[0]])}}),useInputVal:!0,multi:1===(e.atrrs&&e.atrrs.multiValueFlag),isScan:i};case"number":return{max:a.maxValue,min:a.minValue,isScan:i}}},t.prototype.rowAdd=function(n,o,s){var r=this,t=g.create(this.para.tpl);t.dataset.index=n.toString(),g.queryAll("[data-type]",t).forEach(function(t){var e=t.dataset.type;if("title"===e)t.innerHTML=r.queryConfigs[n].caption;else if("input"===e){var a="valueStep"in o.atrrs?"number":l.BwRule.isTime(o.atrrs.dataType)?"datetime":"data"in o?"select":"text",i=q(null,r.conf2comPara(a,o),a,t,v.isMb);i.set(s),r.coms[o.field_name]=i}}),this.queryConfigs.forEach(function(t){if(l.BwRule.isTime(t.atrrs.dataType)){var e=void 0,a=void 0;t.startFieldName?(e=t.startFieldName,a=t.field_name):t.endFieldName&&(e=t.field_name,a=t.endFieldName),r.coms[e]&&r.coms[a]&&x(r.coms[e],r.coms[a])}}),g.append(this.para.resultDom,t)},t.prototype.dataGet=function(t,e){var a=this;void 0===t&&(t=-1),void 0===e&&(e=!1);var i={};return this.queryConfigs.forEach(function(t,e){i[t.field_name]=a.coms[t.field_name].get()}),i},t}();e.AtVarBuilder=b}),define("QueryModule",["require","exports","QueryBuilder","QueryConfig","BwRule","Loading","Modal","CheckBox"],function(t,e,l,a,c,i,u,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var d=G.tools,o=BW.CONF,p=BW.sys,m=G.d,s=function(){function t(o){var a,s=this;for(var t in this.para=o,this.queriesCpt={},this.hasOption=!0,this.textCase=(a=null,{init:function(t){var e=m.query('[data-com-type="textCase"]',s.queryDomGet());e&&(a=new n.CheckBox({container:e,text:p.isMb?"":"区分大小写",onClick:p.isMb?function(){u.Modal.toast(a.get()?"区分大小写":"不区分大小写")}:null})).set(t)},get:function(){return!!a&&a.get()}}),this.settingConf=o.qm.setting&&o.qm.setting.setContent?JSON.parse(o.qm.setting.setContent):null,this.settingConf)this.settingConf[t]=JSON.parse(this.settingConf[t]);this.textCase.init();var r=this.queriesCpt;m.queryAll("[data-query-name]",this.queryDomGet()).forEach(function(t){var e,a=t.dataset.queryName;if(0<=a.indexOf("queryparam"))for(var i=0,n=void 0;n=o.qm[a][i];i++)n.atrrs&&c.BwRule.isTime(n.atrrs.dataType)&&(o.qm[a].splice(i,1),o.qm[a].unshift(n));d.isEmpty(o.qm[a])||(r[a]="atvarparams"!==a?new l.QueryBuilder({tpl:s.queryParamTplGet(),queryName:a,queryConfigs:o.qm[a],resultDom:t,setting:s.settingConf&&s.settingConf[a],atVarDataGet:(e=r.atvarparams,e?function(){return e.dataGet()}:null),isTransCase:function(){return s.textCase.get()}}):new l.AtVarBuilder({tpl:s.atVarTplGet(),queryConfigs:o.qm[a],resultDom:t,setting:s.settingConf&&s.settingConf[a],on2dScan:function(t){s.search()}}))}),13===o.qm.queryType&&this.hide(),0===o.qm.autTag&&setTimeout(function(){s.search()},10)}return Object.defineProperty(t.prototype,"wrapper",{get:function(){return this},enumerable:!0,configurable:!0}),t.prototype.settingSave=function(){var t=o.siteAppVerUrl+"/setting/"+this.para.qm.setting.settingId,e=this.getQueryJson(!0);e.textCase=this.textCase.get(),console.log(e),c.BwRule.Ajax.fetch(t,{type:"PUT",data2url:!0,data:e}).then(function(){u.Modal.toast("保存成功")})},t.prototype.search=function(t,e){void 0===e&&(e=!1);var a=this.getQueryJson(!1);if(t&&(a=Object.assign(a,t)),"atvarparams"in a){var i=JSON.parse(a.atvarparams),n="";if(this.para.qm.atvarparams.forEach(function(t){1===t.atrrs.requiredFlag&&""===i[t.field_name]&&(n+=t.caption+",")}),""!==n)return u.Modal.alert(n.substring(0,n.length-1)+"不能为空"),Promise.reject("")}if(e){var o=t;o.atvarparams=a.atvarparams,a=o}if(this.para.qm.hasOption&&this.hasOption&&!e){var s=JSON.parse(a.queryoptionsparam);return s.showFields&&0===s.showFields.length&&(s.itemSumCount||s.groupByFields&&s.groupByFields[0])?(u.Modal.alert("未设置显示字段"),Promise.reject("")):s.section&&!s.sectionParams.sections?(u.Modal.alert("段位列表中无内容"),Promise.reject("")):s.itemCount&&s.showFields&&!s.showFields[0]?this.optionLoad(a):this.queryLoad(a)}return this.queryLoad(a)},t.prototype.queryLoad=function(t){return this.hide(),this.para.refresher(t)},t.prototype.optionLoad=function(t){var a=this;return this.spinner?a.spinner.show():this.spinner=new i.Loading({msg:"加载中..."}),t.pageparams=JSON.stringify({index:1,size:3e3}),c.BwRule.Ajax.fetch(this.para.url,{data:t}).then(function(t){var e=t.response.body.bodyList[0].dataList[0];u.Modal.alert("项数："+e[0]),a.spinner.hide()})},t.prototype.getQueryJson=function(t){void 0===t&&(t=!1);var e={},a=0;for(var i in this.queriesCpt)if(this.queriesCpt.hasOwnProperty(i)){var n=this.queriesCpt[i].dataGet(-1,t);null!==n&&(e[i]=JSON.stringify(n),a++)}if(this.para.qm.hasOption){var o=this.getOptionJson(t);if(1===Object.keys(o).length&&o.showFields&&!o.showFields[0])return this.hasOption=!1,e;if(this.hasOption=!0,0===a&&!o)return null;e.queryoptionsparam=JSON.stringify(o)}return e},t.prototype.optionDomGet=function(){return h("div",{className:"option"},h("div",{className:"option-limit"},h("div",{"data-action":"value",className:"checkbox-custom","data-name":"itemRepeat"}),h("div",{"data-action":"value",className:"checkbox-custom","data-name":"itemCount"}),h("div",{"data-action":"value",className:"checkbox-custom","data-name":"itemSumCount"}),h("div",{className:"limitInput","data-name":"topN"},"限查前",h("div",{className:"topN"}),"项"),h("div",{"data-action":"value",className:"checkbox-custom","data-name":"restrictionFirst"})),h("div",{className:"multi-select"},h("div",{className:"select-left"},h("label",{className:"show-word"},"显示字段"),h("span",{className:"all-dec"},"全清"),h("span",{className:"all-select"},"全选/")),h("div",{className:"icon-box"},h("span",{className:"iconfont icon-arrow-right-2 sort"}),h("span",{className:"iconfont icon-close sort"}),h("span",{className:"iconfont icon-arrow-right-2 group"}),h("span",{className:"iconfont icon-close group"})),h("div",{className:"select-right"},h("label",{className:"sort-word"},"排序字段"),h("label",{className:"group-word"},"分组字段"))),h("div",{className:"option-section"},h("div",{className:"section-checkbox"},h("div",{"data-name":"sectionQuery"}),h("div",{"data-name":"leftOpenRightClose"})),h("div",{className:"section"},h("div",{className:"section-col"},h("div",{className:"section-6","data-name":"sectionField"},h("label",null,"分段字段")),h("div",{className:"section-6 hide","data-name":"sectionNorm"},h("label",null,"分段标准"))),h("div",{"data-name":"avgSection"}),h("div",{className:"customGrading"},h("div",{"data-name":"numSection"},h("label",{className:"segment hide"},"段位"),h("label",{className:"width"},"宽度")),h("div",{className:"icon-box-2 hide"},h("span",{className:"iconfont icon-arrow-right-2 col"}),h("span",{className:"iconfont icon-close col"})),h("div",{className:"section-6 hide","data-name":"fieldCol"},h("label",null,"段位列表"))))))},t.prototype.initQueryConf=function(){var t=this;t.optionDom=t.optionDomGet(),t.queryConfig=new a.QueryConfig({limitDom:t.optionDom,cols:t.cols,setting:t.settingConf&&t.settingConf.queryoptionsparam})},t.prototype.getOptionJson=function(t){return void 0===t&&(t=!1),this.queryConfig.getPara(t)},t}();e.QueryModule=s}),define("QueryModulePc",["require","exports","QueryModule","Tab","Modal","Button","InputBox"],function(t,e,a,c,u,d,p){"use strict";var n=G.d,o=G.tools;return function(l){function t(t){var e=l.call(this,t)||this;e.cols=t.cols;var a=e,i=new p.InputBox,n=new p.InputBox,o=new d.Button({content:"取消",type:"default",key:"cancelBtn"}),s=new d.Button({content:"查询",type:"primary",onClick:function(){a.search().then(function(){a.modal.isShow=!1}).catch(function(){a.spinner&&a.spinner.hide()})},key:"queryBtn"});e.para.qm.setting&&e.para.qm.setting.settingId&&i.addItem(new d.Button({content:"设置默认值",type:"primary",onClick:function(){a.settingSave()},key:"saveBtn"})),n.addItem(o),n.addItem(s),e.modal=new u.Modal({container:t.container,header:"查询器",body:document.createElement("span"),className:"queryBuilder",isBackground:!1,isShow:0!==e.para.qm.autTag,footer:{leftPanel:i,rightPanel:n}});var r=[{title:"查询",dom:e.queryDom}];return!0===t.qm.hasOption&&(e.initQueryConf(),r.push({title:"选项",dom:e.optionDom})),e.tab=new c.Tab({tabParent:e.modal.bodyWrapper,panelParent:e.modal.bodyWrapper,tabs:r}),0!==e.para.qm.autTag&&(e.modal.isShow=!0),e}return __extends(t,l),t.prototype.toggleCancle=function(){var t=n.query(".queryBuilder .close",this.para.container),e=n.query(".right-plane button",this.para.container),a=function(t){t.classList.toggle("hide")};a(t),a(e)},t.prototype.queryDomGet=function(){var a=this;if(!this.queryDom){var i=document.createElement("div");["atvarparams","queryparams0","queryparams1"].forEach(function(t,e){o.isNotEmpty(a.para.qm[t])&&i.appendChild(h("div",{className:"filter-form "+(0===e?"row":""),"data-query-name":t},0<e?h("span",{"data-action":"add",className:"iconfont blue icon-jiahao"}):""))}),n.append(i,h("div",{"data-com-type":"textCase"})),this.queryDom=i}return this.queryDom},t.prototype.queryParamTplGet=function(){return'<div class="row"> <div class="col-xs-3" data-type="field"></div> <div class="col-xs-1" data-type="not"></div> <div class="col-xs-2" data-type="operator"></div> <div class="col-xs-3" data-type="input1"></div> <div class="col-xs-3" data-type="input2"></div> <span data-action="del" class="iconfont red icon-close"></span> <span data-type="andOr"></span></div>'},t.prototype.atVarTplGet=function(){return'<div class="col-sm-5"><div data-type="title"></div><div data-type="input"></div></div>'},t.prototype.show=function(){this.modal&&(this.modal.isShow=!0)},t.prototype.hide=function(){this.modal&&(this.modal.isShow=!1)},t}(a.QueryModule)}),define("QueryConfig",["require","exports","NumInput","CheckBox","SelectBox","DropDown","SelectInput","BwRule"],function(t,e,y,v,g,w,q,x){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var b=G.tools,C=G.d,a=function(){function t(t){this.para=t,this.p={showFields:[],sectionParams:{leftOpenRightClose:!1,sectionField:"",sectionNorm:"",avgSection:!0,sections:[1]}},this.isNorm=!1,this.caption=[],this.numbers=[],this.hasNumber=!0,this.normField=[{text:"年",value:"year"},{text:"季度",value:"quarter"},{text:"月",value:"month"},{text:"周",value:"week"},{text:"日",value:"day"},{text:"天",value:"dayofyear"},{text:"时",value:"hour"},{text:"分",value:"minute"},{text:"秒",value:"second"}],this.dom=t,this.initLimit(),this.initSort(),this.initSection(),this.showFields.setAll(),this.para.setting&&this.setting()}return t.prototype.initSection=function(){var i=this,t=i.dom.limitDom,e=C.query(".option-section",t),n=f('[data-name="leftOpenRightClose"]'),a=f('[data-name="sectionQuery"]'),o=f('[data-name="sectionField"]'),s=f('[data-name="sectionNorm"]'),r=f('[data-name="avgSection"]'),l=f('[data-name="numSection"]'),c=f('[data-name="fieldCol"]'),u=f(".section"),d=(f(".customGrading"),f(".icon-arrow-right-2.col")),p=f(".icon-close.col"),m=C.query(".icon-arrow-right-2.sort",t),h=C.query(".icon-close.sort",t);function f(t){return C.query(t,e)}i.para.cols.forEach(function(t,e){var a=t.atrrs.dataType;(x.BwRule.isTime(a)||x.BwRule.isNumber(a)||a===x.BwRule.DT_BOOL)&&(i.caption.push({text:t.caption,value:t.name,dataType:a,noSum:t.noSum}),x.BwRule.isNumber(a)&&1!==t.noSum&&i.numbers.push(e))}),i.caption[0]||(i.caption.push({text:"",value:"",dataType:""}),i.hasNumber=!1),i.section=new v.CheckBox({container:a,text:"分段查询",onSet:function(t){var e=[n,u],a=[m,h];i.sortFields.dataDelAll(),t?(i.delDisabled(e),i.itemCount.get()||i.setDisabled(a),i.showNumField(),i.showFields.unSet(i.showFields.transIndex([i.sectionField.get()]))):(i.setDisabled(e),i.itemCount.get()||i.delDisabled(a))}}),i.leftOpenRightClose=new v.CheckBox({container:n,text:"区间左开右闭"}),i.sectionField=new q.SelectInput({container:o,data:i.caption,readonly:!0,clickType:0,onSet:function(t){i.toggleNorm(t.dataType),i.showNumField(),i.showFields.unSet(i.showFields.transIndex([t.value]))}}),i.sectionNorm=new q.SelectInput({container:s,readonly:!0,clickType:0,data:i.normField}),i.avgSectionTrue=new y.NumInput({container:l,className:"average",defaultNum:1,min:1}),i.avgSectionFalse=new y.NumInput({container:l,className:"customize",defaultNum:0}),i.avgSection=new g.SelectBox({select:{multi:!1,callback:function(){i.toggleAvg()}},container:r,data:[{value:"1",text:"平均段位"},{value:"2",text:"自定义段位"}]}),i.fieldCol=new w.DropDown({el:c,inline:!0,className:"field-col"}),i.listSelect(i.fieldCol.getUlDom()),C.on(d,"click",function(){var e=i.avgSectionFalse.get(),t=i.fieldCol.getData(),a=!1;t.forEach(function(t){e===t.value&&(a=!0)}),a||i.fieldCol.dataAdd([{text:e.toString(),value:e}])}),i.deleteField(p,c,i.fieldCol),i.sectionField.set(i.caption[0].value),i.sectionNorm.set("dayofyear"),i.setDisabled([n,u]),C.query(".customize",t).classList.add("hide"),i.hasNumber||i.setDisabled([a])},t.prototype.initLimit=function(){var a=this,e=a.dom.limitDom,i=h(".option-limit"),t=m('[data-name="itemRepeat"]'),n=m('[data-name="itemCount"]'),o=m('[data-name="itemSumCount"]'),s=m('[data-name="topN"] .topN'),r=m('[data-name="restrictionFirst"]'),l=(h('[data-name="sectionQuery"]'),h(".icon-arrow-right-2.sort")),c=h(".icon-arrow-right-2.group"),u=h(".icon-close.sort"),d=h(".option-section"),p=h(".icon-close.group");function m(t){return C.query(t,i)}function h(t){return C.query(t,e)}a.topN=new y.NumInput({container:s,min:0,className:"topN-input",callback:function(){a.topN&&0<=a.topN.get()?a.delDisabled([r]):a.setDisabled([r])}}),a.itemRepeat=new v.CheckBox({container:t,text:"项不重复"}),a.itemCount=new v.CheckBox({container:n,text:"仅查项数",onSet:function(t){var e=[o,l,u];t?(a.section.get()?a.setDisabled([o]):a.setDisabled(e),a.sortFields.dataDelAll(),a.showFields.set([])):a.section.get()?a.delDisabled([o]):a.delDisabled(e)}}),a.itemSumCount=new v.CheckBox({container:o,text:"仅查总数",onSet:function(t){var e=[n,l,u,p,c];a.sortFields.dataDelAll(),a.groupByFields.dataDelAll(),t?(a.setDisabled(e),a.showNumField()):a.delDisabled(e),a.hasNumber&&a.toggleDisabled([d])}}),a.restrictionFirst=new v.CheckBox({container:r,text:"限制在先"}),r.classList.add("disabled")},t.prototype.initSort=function(){var s=this,r=C.query(".multi-select",s.para.limitDom),l=C.query(".select-left",r),t=C.query(".select-right",r),e=C.query(".icon-box",r),a=C.query(".all-select",r),i=C.query(".all-dec",r),n=[];s.para.cols.forEach(function(t){n.push({text:t.caption,value:t.name,dataType:t.dataType,noSum:t.noSum})}),this.showFields=new w.DropDown({el:l,data:n,multi:!0,inline:!0,className:"show-field"}),this.sortFields=new w.DropDown({el:t,multi:!0,inline:!0,className:"sort-field"}),this.groupByFields=new w.DropDown({el:t,inline:!0,className:"group-field"}),this.listSelect(s.showFields.getUlDom()),this.listSelect(s.groupByFields.getUlDom()),this.listSelect(s.sortFields.getUlDom()),s.rightBtnEven(C.query(".icon-arrow-right-2.sort",e),s.sortFields),s.rightBtnEven(C.query(".icon-arrow-right-2.group",e),s.groupByFields),C.on(C.query(".icon-arrow-right-2.group",e),"click",function(){if(C.query("li.select",l)){var t=s.groupByFields.getData(),e=s.showFields.getData(),n=s.numbers.slice(0);t.forEach(function(i){e.forEach(function(t,e){if(i.value===t.value){var a=!1;n.forEach(function(t){t===e&&(a=!0)}),a||(n.push(e),a=!1)}})}),s.showFields.set([]),s.showFields.addSelected(n);var a=s.showFields.get(),i=C.query("li.select",r)?parseInt(C.query("li.select",r).dataset.index):null,o=!1;i&&(a.forEach(function(t){t===i&&(o=!0)}),o||s.showFields.addSelected([i]))}}),s.deleteField(C.query(".icon-close.sort",e),C.query(".sort-field",t),s.sortFields),s.deleteField(C.query(".icon-close.group",e),C.query(".group-field",t),s.groupByFields),C.on(i,"click",function(){s.showFields.set([]),s.showFields.transIndex(["1"])}),C.on(a,"click",function(){s.showFields.setAll()})},t.prototype.getPara=function(t){void 0===t&&(t=!1);var e=this,a=e.p;if(a.itemRepeat=e.itemRepeat.get(),e.itemCount.get()?(a.itemCount=!0,a.itemSumCount=!1):e.itemSumCount.get()?(a.itemCount=!1,a.itemSumCount=!0):(a.itemCount=!1,a.itemSumCount=!1),e.topN.get()||0===e.topN.get()?e.p.topN=e.topN.get():e.p.topN=null,a.restrictionFirst=0<=e.p.topN&&e.restrictionFirst.get(),null===e.p.topN&&(a.restrictionFirst=!1),e.section.get()&&!e.itemSumCount.get()||t)if(a.section=e.section.get(),a.sectionParams.leftOpenRightClose=e.leftOpenRightClose.get(),a.sectionParams.sectionField=e.sectionField.get(),e.isNorm?a.sectionParams.sectionNorm=e.sectionNorm.get():a.sectionParams.sectionNorm="",0===e.avgSection.get()[0])a.sectionParams.avgSection=!0,a.sectionParams.sections=[e.avgSectionTrue.get()];else{a.sectionParams.avgSection=!1;var i=e.fieldCol.getData(),n=[];i.forEach(function(t){n.push(t.value)}),a.sectionParams.sections=n}else a.section=!1;var o=e.groupByFields.getData(),s=[];o&&o.forEach(function(t){s.push(t.value)}),a.groupByFields=s;var r=e.showFields.getData(),l=e.showFields.get()||[],c=[];l&&l[0]&&l.forEach(function(t){c.push(t.value)}),s.forEach(function(e){var a=!1;c.forEach(function(t){e===t&&(a=!0)}),a||c.push(e)}),r.length===l.length&&(c=null),a.showFields=c;var u=e.sortFields.getData(),d=e.sortFields.get(),p=[];u&&u.forEach(function(e,a){var i=e.value;d.forEach(function(t){a===t&&(i=e.value+",desc")}),void 0!==i&&p.push(i)}),a.sortFields=p;var m={};for(var h in(!0===a.section||t)&&(m={sectionParams:{}}),a){var f=a[h];if(!1===f||null===f);else if("sortFields"===h&&!f[0]||"groupByFields"===h&&!f[0]);else if("sectionParams"===h){if(!0===a.section||t)for(var y in a.sectionParams)b.isEmpty(f[y])||(m.sectionParams[y]=f[y])}else b.isEmpty(a)||(m[h]=f)}return t&&(m.sectionNumber=e.avgSectionFalse.get()),m},t.prototype.getColCaption=function(t,a){var i=this.para.cols,n=[];return t.forEach(function(e){i.forEach(function(t){t.name===e&&n.push(t[a])})}),n},t.prototype.setting=function(){var n=this,e=n.para.setting,a=e.sectionParams;for(var t in a&&(n.section.checked=!0,e.sectionParams.leftOpenRightClose&&(n.leftOpenRightClose.checked=!0),n.sectionField.set(a.sectionField),n.sectionNorm&&n.normField.forEach(function(t){t.value===a.sectionNorm&&n.sectionNorm.set(t.value)}),!1===a.avgSection?(n.avgSection.addSelected([1]),n.toggleAvg(),n.avgSectionFalse.set(e.sectionNumber),a.sections&&a.sections.forEach(function(t){n.fieldCol.dataAdd([{text:t.toString(),value:t}])})):n.avgSectionTrue.set(a.sections[0]),!e.section&&(n.section.checked=!1)),e){var i=e[t];!0===i&&"section"!==t&&"restrictionFirst"!==t?n[t].checked=!0:"topN"===t&&(n.topN.set(i),e.restrictionFirst&&(n.restrictionFirst.checked=!0))}var o=function(i){var t=e[i];e.showFields||s.showFields.setAll(),"showFields"===i?t[0]&&n.showFields.set(n.showFields.transIndex(t)):"sortFields"!==i&&"groupByFields"!==i||t.forEach(function(t){var e=t.replace(",desc",""),a=n.getColCaption([e],"caption")[0];b.isNotEmpty(a)&&(n[i].dataAdd([{text:a,value:t.replace(",desc","")}]),0<=t.indexOf(",desc")&&n.sortFields.addSelected(n.sortFields.transIndex([e])))})},s=this;for(var t in e)o(t)},t.prototype.listSelect=function(e){C.on(e,"click","li.drop-item",function(){var t=C.query("li.select",e);t&&t.classList.remove("select"),this.classList.add("select")})},t.prototype.deleteField=function(t,a,i){C.on(t,"click",function(){var t=C.query("li.select",a);if(t){var e=parseInt(t.dataset.index);i.dataDel(e)}})},t.prototype.rightBtnEven=function(t,n){var o=this,s=C.query(".select-left",o.para.limitDom);C.on(t,"click",function(){var e=C.query("li.select",s),a=!1;if(e){var t=parseInt(e.dataset.index);n===o.sortFields?i(o.sortFields):i(o.groupByFields),a||n.dataAdd([{text:o.dom.cols[t].caption,value:o.dom.cols[t].name}])}function i(t){t.getData()&&t.getData().forEach(function(t){t.text===e.textContent&&(a=!0)})}})},t.prototype.showNumField=function(){this.showFields.set(this.numbers)},t.prototype.toggleAvg=function(){var t=this,e=t.dom.limitDom,a=C.query(".option-section .section",e),i=c(".average"),n=c(".segment"),o=c(".width"),s=(c(".customGrading"),c(".icon-box-2")),r=c('[data-name="fieldCol"]'),l=C.query(".customize",a);function c(t){return C.query(t,a)}0===t.avgSection.get()[0]?(t.addHide([s,r,n,l]),t.removeHide([o,i])):1===t.avgSection.get()[0]&&(t.removeHide([s,r,n,l]),t.addHide([o,i]))},t.prototype.toggleNorm=function(t){var e=C.query('[data-name="sectionNorm"]',this.para.limitDom);x.BwRule.isTime(t)?(this.isNorm=!0,e.classList.remove("hide")):(this.isNorm=!1,e.classList.add("hide"))},t.prototype.toggleDisabled=function(t){t.forEach(function(t){t.classList.contains("disabled")?t.classList.remove("disabled"):t.classList.add("disabled")})},t.prototype.setDisabled=function(t){t.forEach(function(t){t.classList.add("disabled")})},t.prototype.delDisabled=function(t){t.forEach(function(t){t.classList.remove("disabled")})},t.prototype.addHide=function(t){t.forEach(function(t){t.classList.add("hide")})},t.prototype.removeHide=function(t){t.forEach(function(t){t.classList.remove("hide")})},t.prototype.getSection=function(){return C.query('[data-name="sectionField"] input',this.dom.limitDom).value},t}();e.QueryConfig=a}),define("AsynQuery",["require","exports","Button","SlideUp"],function(s,t,r,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var l=G.d,c=G.tools,e=function(){function t(t){this.query=[],this.para=t,console.log(t,"asyn"),this.init()}return t.prototype.init=function(){var e=this,t=this.para.asynData,a=l.create('<ul class="asyn-ul"></ul>');t.forEach(function(t){e.liTpl(t,a)}),new i.SlideUp({container:this.para.dom?this.para.dom:document.body,contentEl:a,contentTitle:"查询记录",width:305,isShow:!0,className:"asynQuery"})},t.prototype.liTpl=function(i,t){var e,n=this,a=!1;switch(i.taskState){case"0":e="查看";break;case"1":e="查询失败",a=!0;break;case"2":e="正在查询",a=!0}var o=l.create('<li class="asyn-li">\n            <div class="asyn-left">\n                <div class="asyn-time">时间：'+i.createTime+'</div>\n            </div>\n            <div class="asyn-right">\n               \n            </div>       \n        </li>');t.appendChild(o),new r.Button({container:l.query(".asyn-left",o),type:"link",icon:"history-record",onClick:function(){for(var t in c.isMb&&n.para.query.hide(),n.query)t!==i.taskId&&n.query[t].hide();if(i.taskId in n.query)n.query[i.taskId].show();else{var e=BW.sys.isMb?"QueryModuleMb":"QueryModulePc",a=n.para.qm;a.setting.setContent=JSON.stringify(i.queryStr),s([e],function(t){n.query[i.taskId]=new t({qm:a,refresher:function(){},cols:[],url:null,container:n.para.container,tableGet:function(){return null}});var e=n.query[i.taskId].modal;c.isMb?(l.query(".mbPage-body",e.bodyWrapper).classList.add("disabled"),l.query(".mbPage-right",e.bodyWrapper).classList.add("disabled")):(l.query(".tab-content",e.bodyWrapper).classList.add("disabled"),l.query("h1",e.modalHeader.wrapper).innerHTML="时间："+i.createTime,e.modalFooter.wrapper.classList.add("hide"))})}}}).getDom().title="查看记录",new r.Button({content:e,container:l.query(".asyn-right",o),type:"primary",isDisabled:a,onClick:function(){for(var t in n.para.query.para.refresher({taskId:i.taskId},function(){}),n.para.query.hide(),n.query)n.query[t].hide()}})},t}();t.AsynQuery=e});