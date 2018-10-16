/// <amd-module name="ChatController"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import {Tab} from "../../../global/components/ui/tab/tab";
import {Chat, ChatItem, Msg} from "./chat";

interface ChatControllerPara{
    container : HTMLElement;
}
export class ChatController {
    private container : HTMLElement;//聊天界面父容器
    private tab : Tab;
    private chatList : Array<Chat> = [];
    constructor(private chatPara : ChatControllerPara){
        let modal = new Modal({
            header: 'chat',
            width: '900px',
            className : 'chatModal',
            body : d.create('<div class="chatBox"></div>'),
            container: chatPara.container,
            isBackground: false,
            isOnceDestroy: true
        });
        this.container = <HTMLElement>modal.body;
        d.append(this.container,d.create(`<div class="leftBox"></div>`));
        this.init();
    }

    private init(){
        this.tab = new Tab({
            tabParent: <HTMLElement> d.query('.leftBox',this.container),
            panelParent: <HTMLElement> this.container,
            tabs :[]
        });

        let tempList = [
            {
            userName : 'user1',
            avatar : null
        },{
            userName : 'user2user2user2user2user2',
            avatar : null
        },{
            userName : 'user3',
            avatar : null
        },{
            userName : 'user4',
            avatar : null
        }];
        let msgList = [
            [{content : 'user1',userName : '你好user1',avatar :null,msgTime : '2017-09-30'}],
            [{content : 'user2',userName : '你好user2',avatar :null,msgTime : '2017-09-30'}],
            [{content : 'user3',userName : '你好user3',avatar :null,msgTime : '2017-09-30'}],
            [{content : 'user4',userName : '你好user4',avatar :null,msgTime : '2017-09-30'}]
        ];
        this.showChat(tempList,msgList);
    }

    /**
     * 添加新的聊天
     * @param {ChatItem} chatItem
     */
    private addUserChat(chatItem : ChatItem,msgList : Array<Msg> = null){
        let chat = new Chat({
            chatItem : chatItem,
            msgList : msgList,
            deleteList : (deleChat :Chat,deleteDom : HTMLElement)=>{
                this.deleteUserChat(deleChat,deleteDom);
            }
        });
        this.chatList.push(chat);
        this.tab.addTab([{
            titleDom : chat.getTabEl().titleDom,
            dom : chat.getTabEl().dom
        }]);
    }

    private deleteUserChat(chat : Chat,deleteDom : HTMLElement){
        chat.destory();
        this.tab.deleteTab(chat.getTabEl());
        this.chatList.splice(this.chatList.indexOf(chat),1);
        deleteDom.classList.contains('active') && this.tab.active(parseInt(deleteDom.dataset.index));
    }

    private showChat(chatItem : Array<ChatItem>,msgList : Array<Msg[]>){

        for(let i = 0,l = chatItem.length;i < l;i++){
            this.addUserChat(chatItem[i],msgList[i]);
        }

        this.tab.active(0);
    }
}