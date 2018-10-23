define("UploadModule",["require","exports","Uploader","FormCom","Modal"],function(e,o,n,t,c){"use strict";Object.defineProperty(o,"__esModule",{value:!0});var r=function(o){function e(e){var t=o.call(this,e)||this;t.para=e,t.uploadState=0;var r="",a=t;return t.com=new n.Uploader({container:e.container,uploadUrl:e.uploadUrl,accept:e.accept,nameField:e.nameField,thumbField:e.thumbField,onComplete:function(e,o){200==e.code||0===e.errorCode?(t.com.text=!1!==t.para.showNameOnComplete?r:"点击上传",a.uploadState=10,t.para.onComplete&&t.para.onComplete.call(t,e,o)):(t.para.onError&&t.para.onError.call(t,o),c.Modal.alert(e.message))}}),t.com.on("fileQueued",function(e){t.para.onChange&&t.para.onChange(),t.com.text="上传中...",r=e.name,a.uploadState=1,t.com.upload()}),t.com.on("error",function(e){var o={Q_TYPE_DENIED:"文件类型有误",F_EXCEED_SIZE:"文件大小不能超过4M"};c.Modal.alert(o[e]?o[e]:"文件出错, 类型:"+e)}),t.com.on("uploadProgress",function(e,o){}),t}return __extends(e,o),e.prototype.get=function(){return this.value},e.prototype.set=function(e){this.com.text=e,this.com.set(e)},e.prototype.destroy=function(){this.com&&this.com.destroy(),o.prototype.destroy.call(this)},Object.defineProperty(e.prototype,"value",{get:function(){return this.com.get()},set:function(e){this.com.text=e,this.com.set(e)},enumerable:!0,configurable:!0}),e.prototype.wrapperInit=function(e){},e}(t.FormCom);o.default=r});