/// <amd-module name="BasicPage"/>

import sys = BW.sys;
import d = G.d;
import tools = G.tools;
import Gesture = require("../module/gesture/gesture");
import {ButtonAction} from "../common/rule/ButtonAction/ButtonAction";
import {Modal} from "../../global/components/feedback/modal/Modal";
import {HelpMsg} from "../module/helpMsg/HelpMsg";
import CONF = BW.CONF;


export default class BasicPage{
    protected dom : HTMLElement;
    protected isMb : boolean;
    protected url : string;
    protected param: obj = {};
    constructor(para? : BasicPagePara){
        // this.isMb = sys.os !== 'pc';
        this.isMb = tools.isMb;
        if(this.isMb){
            this.dom = document.body;
            this.url = window.location.href;
        }else{
            this.dom = para.dom;
            this.url = para.dom.parentElement.dataset.src;

            /*面包屑处理*/
            if(this.url){
                this.setTitle(para.title);
            }else{
                /*在当前页面打开时*/
                this.url = d.closest(para.dom , '.page-container[data-src]').dataset.src;
            }
        }
        this.param = tools.url.getObjPara(this.url);

        this.on('page.destroy', () => {
            this.destroy();
        });

        let str = navigator.userAgent.toLowerCase();
        let ver = str.match(/cpu iphone os (.*?) like mac os/);
        if(ver && ver[1]){
            let version = parseInt(ver[1]);
            if(version <= 10){
                document.documentElement.classList.add('no-overflow-scrolling');
            }
        }

        //判断是否是安卓5及以上版本才开启手势
        let version = 5;
        if(/(Android)/i.test(navigator.userAgent)){
            let andrVersionArr = navigator.userAgent.match(/Android\s*(\d+)/);
            //去除匹配的第一个下标的元素
            version = andrVersionArr && andrVersionArr[1] ? parseInt(andrVersionArr[1]) : 5;
        }
        if(/*para.subButtons && */version > 4 && tools.isMb){
            let timeOut = null;
            d.on(document,'touchstart',()=>{
                let gestureIcon = d.query('.blue-gesture',document.body);
                // console.log(gestureIcon);
                if(!gestureIcon){
                    this.initGesture(para);
                }
                else{
                    gestureIcon.style.display = 'block';
                }
            });
            d.on(document,'touchend',()=>{
                clearTimeout(timeOut);
                timeOut = setTimeout(()=>{
                    let gestureIcon = d.query('.blue-gesture',document.body);
                    gestureIcon.style.display = 'none';
                },3000);
            });
        }
        this.initWebscoket();
        this.initHelpMsg(para);

        this._pageWrapper = this.wrapperInit();
        this._pageWrapper && d.append(para.dom, this._pageWrapper)
    }

    protected wrapperInit() : HTMLElement{
        return null;
    }

    protected _pageWrapper: HTMLElement;
    get pageWrapper(){
        return this._pageWrapper
    }


    protected initHelpMsg(para){
        // let element = para.ui && para.ui.body && para.ui.body.elements && para.ui.body.elements[0],
        //     helpId = element && element.helpId;
        // if(tools.isNotEmpty(helpId)){
        //     new HelpMsg({
        //         helpId : helpId
        //     });
        // }
    }

    protected initWebscoket(){
        if(!G.tools.isMb){
            return;
        }
        require(['webscoket'], function (webscoket) {
            new webscoket({
                mgrPath : BW.CONF.siteUrl,
                wsUrl : BW.CONF.webscoketUrl
            });
        });
    }

    protected setTitle(title:string){
        sys && sys.window.setTitle(this.url, title);
    }

    protected on(type : string, cb : EventListener){
        d.on(this.isMb ? window : this.dom.parentElement, type, cb);
    }

    private initGesture(para){
        let gestureIcon = d.create('<i class="iconfont icon-gesture blue-gesture"></i>');
        let sty = "position:fixed; right:40px; bottom : 85px; z-index:900; font-size:40px; color:rgb(0,122,255);";
        gestureIcon.setAttribute('style',sty);
        d.on(gestureIcon,'click',()=>{
            let gesture = {
                'circle' : 'cycle',
                'delete' : 'cross',
                'triangle' : 'tri',
                'caret' : 'backHome'
            };
            require(['Gesture'], (ges : typeof Gesture) => {
                new ges({
                    container : document.body,
                    onFinsh : (ges)=>{
                        let hasGesture = false;
                        if(gesture[ges] === 'backHome'){
                            Modal.confirm({
                                msg: '是否跳转到首页？',
                                callback: (flag) => {
                                    if(flag){
                                        sys.window.backHome();
                                    }
                                }
                            });
                            // 画个"/\"表示跳转到首页
                            hasGesture = true;
                        }else{
                            let subButtomsPara = para.subButtons || {};
                            for(let i = 0,l = subButtomsPara.length;i < l;i++){
                                if(subButtomsPara[i].signId === gesture[ges]){
                                    ButtonAction.get().clickHandle(subButtomsPara[i],{},()=>{});
                                    hasGesture = true;
                                }
                            }
                        }

                        if(!hasGesture){
                            Modal.toast('未匹配到手势相应操作');
                        }
                    }
                });
            });
        });
        document.body.appendChild(gestureIcon);
    }

    protected destroy(){

    }
    protected initPcSys(){
        // let u =  this.url,
        //     close = sys.window.close;
        // sys.window.close = (event, type, url = u) => {
        //     close(event, type, url);
        // };
        //
        // let fire = sys.window.fire;
        // sys.window.fire = (event, data, url = u) =>{
        //     fire(event, data, url);
        // };
        //
        // let open = sys.window.open;
        // sys.window.open = (o : winOpen, url = u) => {
        //     console.log(url);
        //     open(o, url);
        // }
    }

    // static beforeHandle  = {
    //     table(tableData: TableModulePara) {
    //
    //         !tools.isEmpty(tableData.cols) && BasicPage.beforeHandle.fields(tableData.cols,tableData.uiType); //列数据
    //         tableData.fixedNum = 1; //锁列数
    //         tableData.uiType = tools.isEmpty(tableData.uiType) ? null : tableData.uiType;
    //
    //         return null;
    //     },
    //
    //     fields(cols: R_Field[],uiType : string){
    //
    //         for(let col of cols){
    //
    //             col.title = col.caption;
    //             col.valueLists = tools.isEmpty(col.atrrs) ? "" : col.atrrs.valueLists;
    //             col.noSum = tools.isEmpty(col.atrrs) ? "" : col.atrrs.noSum;
    //             col.multiPick = tools.isEmpty(col.multiPick) ? null : col.multiPick;
    //             col.dataType = tools.isEmpty(col.atrrs) ? "" : col.atrrs.dataType;
    //             col.displayFormat = tools.isEmpty(col.atrrs) ? "" : col.atrrs.displayFormat;
    //             col.trueExpr = tools.isEmpty(col.atrrs) ? "" : col.atrrs.trueExpr;
    //             col.displayWidth = tools.isEmpty(col.atrrs) ? "" : col.atrrs.displayWidth;
    //
    //
    //
    //             if(col.elementType == 'lookup'){
    //                 //look up
    //                 col.comType = 'selectInput';// --------------
    //
    //
    //             }else if((col.elementType == 'treepick' || col.elementType == 'pick')){
    //
    //                 //PICK UP
    //                 col.comType = 'tagsInput';// --------------
    //                 col.multiValue = col.atrrs.multValue; //单选或多选
    //                 col.relateFields = col.assignSelectFields;
    //
    //             }else if(col.atrrs.dataType == '43'){
    //                 //文件上传
    //                 col.comType = 'file';// --------------
    //                 col.relateFields = ['FILE_ID'];// --------------
    //
    //             } else if(col.atrrs.dataType == '30'){
    //
    //                 //富文本
    //                 col.comType = 'richText';// --------------
    //
    //             } else if(col.atrrs.dataType == '17'){
    //                 //toggle
    //                 col.comType = 'toggle';// --------------
    //             } else if(col.atrrs.dataType == '12'){
    //                 //日期时间控件
    //                 col.comType = 'datetime';// --------------
    //
    //             }else{
    //                 col.comType = 'input';// --------------
    //             }
    //         }
    //
    //     },
    // }
}