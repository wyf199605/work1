// import tools = G.tools;
// import CONF = BW.CONF;
// import d = G.d;
// import {Modal} from "../../../global/components/feedback/modal/Modal";
// import {Mail} from "../../module/mail/mail";
// import {DragDeform} from "../../../global/components/ui/dragDeform/dragDeform";
// import sys = BW.sys;
//
// interface ListPagePara {
//     table : any
//     dom : HTMLElement,
//     subButtons : R_Button[]
// }
// export = class ListPagePc {
//     private modal : Modal;
//     private mail : Mail;
//     private urlArr : string[] = [];   //表格url集合
//     private drag : DragDeform;
//     private p : ListPagePara;
//     mailModule : HTMLElement;
//     private len : number;             //表格数据数量
//     private height : number;          //页面加载时记录的表格高度
//     constructor(private para: ListPagePara) {
//         this.p = para;
//         //刷新表格
//         d.on(this.p.table.wrapper, 'table-module-render',  () =>{
//             this.reform();
//         });
//
//         console.log(para);
//         para.table.table.clickEvent.add('tbody tr',  (e) =>{
//             this.click(d.closest(e.target, 'tr'));
//         });
//
//     }
//
//     /**
//      * 行点击调用事件
//      * @param tr
//      */
//     click(tr : HTMLElement){
//         let index = tr.dataset.index,
//             data = this.p.table.table.data.get();
//         //行选中
//         this.p.table.table.rowSelect(tr);
//
//         if(!this.modal){
//             this.mailModule = d.create(`<div class="mail-module"></div>`);
//             this.p.dom.appendChild(this.mailModule);
//             this.modal = new Modal({
//                 body : d.create(`<div class="mail-container"></div>`),
//                 position : 'down',
//                 fullPosition : 'fixed',
//                 container : this.mailModule,
//                 isBackground : false,
//                 className : 'modal-mail',
//                 isAnimate : false,
//                 header : {
//                     title : '邮件详情',
//                     isFullScreen: true
//                 },
//             });
//             this.modal.isShow = false;
//             // d.on(this.modal.body, 'mousedown',  (e) => {
//             //     d.closest(e.currentTarget,'body').classList.add('user-select-none');
//             //     console.log(23431)
//             //     d.on(document, 'mouseup')
//             // });
//             // console.log(d.query('.mobileTableWrapper', this.p.table.wrapper),'221321321')
//             this.mail = new Mail({
//                 urlArr: this.urlArr,
//                 index: parseInt(index),
//                 container: <HTMLElement>this.modal.body,
//                 modal: this.modal,
//                 table: this.p.table,
//                 subButtons: this.p.subButtons,
//             });
//             setTimeout(()=>{
//                 this.beforeDrag(this.mailModule);
//             },200);
//
//         }else {
//             this.modal.isShow = true;
//             this.mail.ajaxLoad(this.urlArr[index], parseInt(index));
//         }
//         tr.classList.remove('tr-read');
//     }
//
//     /**
//      * 初始设置邮件列表高度
//      * @param mailModule
//      * @param type
//      * @returns {{minHeight: number, maxHeight: number}}
//      */
//     beforeDrag(mailModule,type?){
//         if(!this.height){
//             let offsetHeight = this.p.table.wrapper.offsetHeight;
//             if(offsetHeight === 0 || !mailModule){
//                 return;
//             }else {
//                 this.height = offsetHeight;
//             }
//         }
//         if(type === 'delete'){
//             this.height = this.height - 25;
//         }else if(type === 'add'){
//             this.height = this.height + 25;
//         }
//         let minHeight = this.height,
//             maxHeight = this.height;
//
//         minHeight > 144 && (minHeight = 144);
//         maxHeight > 400 && (maxHeight = 400);
//         //邮件详情高度计算
//         let mailHeight = minHeight,
//             tableHeight = minHeight;
//         if(maxHeight < 144){
//             tableHeight = minHeight - 36;
//         }else {
//             mailHeight = minHeight + 36;
//         }
//         mailModule.style.top = mailHeight + 'px';
//         mailModule.style.height = 'calc(100% - '+ mailHeight + 'px)';
//         mailModule.style.maxHeight = 'calc(100% - '+ minHeight + 'px)';
//         //表格初始高度
//         d.query('.mobileTableWrapper', this.p.table.wrapper).style.height = tableHeight + 'px';
//
//         if(!this.drag){
//             this.drag = new DragDeform({
//                 container : this.p.dom,
//                 dom : d.query('.mobileTableWrapper',this.p.table.wrapper),
//                 dragDom : mailModule,
//                 maxHeight : maxHeight,
//                 minHeight : minHeight,
//                 border : ['top'],
//                 top : 36,
//             });
//         }
//         return {
//             minHeight : minHeight,
//             maxHeight : maxHeight
//         }
//     }
//
//     /**
//      * 获取所有tr的url，设置当前表格数据量（邮件数目）
//      */
//     reform(){
//         this.urlArr = [];
//         let len = this.p.table.table.dataGet().length,
//             trs = d.queryAll('.mobileTableMiddle td[data-col="READSTATE"]',this.p.table.wrapper),
//             type;
//         trs.forEach(obj => {
//             this.urlArr.push(obj.dataset.href);
//         });
//
//         //记录当刷新表格前执行的操作（删除or新增），拉拽操作需计算高度用
//         if(this.len){
//             //删除操作
//             if(this.len > len){
//                 type = 'delete';
//             }else if(this.len < len){
//                 //新增操作
//                 type = 'add';
//             }
//         }
//         this.len = len;
//
//         if(this.len === 0){
//             this.modal && (this.modal.isShow = false);
//         }
//
//         //表格刷新，重新设置表格数据量
//         if(this.mail){
//             this.mail.setArr(this.urlArr,this.urlArr.length);
//         }
//         if(this.drag){
//             setTimeout(()=> {
//                 let data = this.beforeDrag(this.mailModule, type);
//                 this.drag.modify({
//                     minHeight : data.minHeight,
//                     maxHeight : data.maxHeight,
//                 });
//             });
//         }
//
//         //打开第一条邮件
//         trs[0] && this.click(trs[0].parentElement);
//
//     }
// }