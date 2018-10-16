/// <amd-module name="Chat"/>

import d = G.d;
import {Button} from "../../../global/components/general/button/Button";
import tools = G.tools;

export interface ChatItem{
    userName? : string;//用户名
    avatar? : string;//头像
}

export interface Msg{
    content : string;//内容
    userName? : string;//用户名
    avatar? : string;//头像
    msgTime? : string;//信息时间
}

interface LastMsg{
    content : string;//内容
    msgTime? : string;//信息时间
}

interface chatPara{
    chatItem? : ChatItem;
    msgList? : Array<Msg>;
    deleteList(chat : Chat,deleteDom : HTMLElement) : void;
}

export class Chat{
    private titleDom : HTMLElement;//聊天列表节点
    private dom : HTMLElement;//聊天主页面节点
    private userName : string;//当前对话框用户名
    constructor(private para : chatPara){
        this.lastMsg = this.para.msgList[this.para.msgList.length-1];
        this.initChatList(this.para.chatItem);
        this.initChatMain(this.para.msgList);
    }

    /**
     * 初始化当前用户聊天窗口
     * @param {Array<Msg>} msgList
     */
    private initChatMain(msgList : Array<Msg>){
        this.dom = this.tpl.chatMain();
        for(let i = 0,l = msgList.length;i < l;i++){
            this.dialogMethod.addMsg(msgList[i],'left');
        }
        this.initComponent();
    }

    /**
     * 添加用户到当前聊天列表
     * @param {ChatItem} chatItem
     */
    private initChatList(chatItem : ChatItem){
        this.userName = chatItem.userName;
        this.titleDom = this.tpl.chatItem();
        d.on(d.query('.deleteUser',this.titleDom),'click',this.initEvent.deleteUser);
    }

    private initEvent = (()=>{
        let deleteUser = (e)=>{
            e.stopPropagation();
            this.para.deleteList(this,d.closest(<HTMLElement>e.target,'[data-index]'));
        };
        return {deleteUser};
    })();

    /**
     * 初始化当前聊天主页面的所有控件
     */
    private initComponent(){
        new Button({
            container: d.query('.sendBtn',this.dom),
            content: '发送',
            onClick : (e)=>{
                this.dialogMethod.sendMsg();
            }});
    }

    /**
     * 获取当前对话框节点
     * @returns {{titleDom: HTMLElement; dom: HTMLElement}}
     */
    public getTabEl(){
        return {
            titleDom : this.titleDom,
            dom : this.dom
        }
    }

    /**
     * 最后一条信息
     */
    private _lastMsg : LastMsg;
    set lastMsg(lastMsg : LastMsg){
        this._lastMsg = lastMsg;
        if(this.titleDom){
            let lastMsgDom = d.query('.lastMsg',this.titleDom),
                lastTimeDom = d.query('.lastTime',this.titleDom);
            lastMsgDom.innerText = lastMsg.content;
            lastTimeDom.innerText = lastMsg.msgTime;
        }
    }
    get lastMsg(){
        return this._lastMsg;
    }

    /**
     * 销毁该对象
     */
    public destory(){
        d.off(d.query('.deleteUser',this.titleDom),'click',this.initEvent.deleteUser);
    }

    /**
     * 对话框处理方法
     * @type {{addMsg: (msgContainer: HTMLElement, msg: Msg, msgPos?: string) => void; sendMsg: (par: HTMLElement) => void}}
     */
    public dialogMethod = (()=>{
        let addMsg = (msg : Msg,msgPos : string = 'right')=>{
            let msgContainer = d.query('.midBox',this.dom)
            d.append(msgContainer,this.tpl.mesTpl(msg,msgPos === 'left' ? 'leftMsg' : 'rightMsg'));
            let scrollHeight = msgContainer.scrollHeight;
            msgContainer.scrollTop = scrollHeight;
        };
        let sendMsg = ()=>{
            let sendText = d.query('.inputMessage',this.dom);
            let data = sendText.innerHTML;
            if(data !== ''){
                addMsg({
                    content :data,
                    userName : 'me',
                    avatar :null
                });
                sendText.innerHTML = '';
                sendText.focus();
                this.lastMsg = {
                    content : data,
                    msgTime : tools.date.format(new Date(),'HH:mm:ss')
                };
            }
        };
        return {addMsg,sendMsg};
    })();

    /**
     * 公共模版
     * @type {{chatItem: () => HTMLElement; chatMain: () => HTMLElement; mesTpl: (msg: Msg, msgPos?: string) => HTMLElement}}
     */
    private tpl = {
        chatItem : ()=>{
            return d.create(`
                    <div class="listItem">
                        <div class="listAvatar"></div>
                        <div class="detail">
                            <p class="userName">${this.userName}</p>                     
                            <p class="lastMsg">${this.lastMsg.content}</p>
                        </div>                     
                        <div class="lastTime">${this.lastMsg.msgTime}</div>
                        <i class="iconfont icon-quxiao deleteUser"></i>
                    </div>
            `);
        },
        chatMain : ()=>{
            return d.create(`
                <div class="rightBox">
                    <div class="topBox">
                        <div class="head">${this.userName}</div>                                        
                    </div>
                    <div class="midBox">
                       
                    </div>
                    <div class="bottomBox">
                         <div class="inputMessage" contenteditable="true"></div>
                         <div class="sendBtn"></div>
                    </div>
               </div>   
            `);
        },
        mesTpl : (msg : Msg,msgPos : string = 'rightMes')=>{
            return d.create(`
                    <div class="${msgPos}">
                        <div class="messAvatar"></div>
                        <span class="userName">${msg.userName}</span>
                        <div class="content">${msg.content}</div>
                    </div>              
            `);
        }
    }
}