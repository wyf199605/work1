/// <amd-module name="KeyModal"/>
import tools = C.tools;
import d = C.d;
import {Modal} from "../../global/components/feedback/modal/Modal";
import {ItemList} from "../itemList/ItemList";
import {Com} from "../../com";
import {eventActionHandler} from "../../EvenAction";

/**
 * 模态框模块
 */
export class KeyModal extends Modal{
    public inputArr = [];
    public inputBox: HTMLElement;
    public scanGun: HTMLElement;
    private p: IKeyModalPara;
    private handlerKey: any;
    disabledEsc : boolean = false;  // 禁用esc
    itemList: ItemList;
    constructor(para: IKeyModalPara) {
        super({
            header: para.title,
            body: para.body,
            container: para.container,
            className :  'modal-cashier',
            isBackground: false,
            isAdaptiveCenter : true,
            isOnceDestroy: true,
            keyDownHandle : para.keyDownHandle
        });
        this.wrapper.style.top = '40%';
        this.wrapper.style.transform = 'translate(-50%, -40%)';
        Com.keyModal.push(this);
        this.p = para;

        if(para.data && para.data.panelId === "s0_p312"){
            this.wrapper.classList.add( 'width-500');
        }
        let pData = para.data,
            inputs = pData && pData.inputs,
            panelId = pData && pData.panelId,
            uiTmpl = pData && pData.uiTmpl,
            shortcuts = para.shortcuts;


        let parent = this.bodyWrapper;
        parent.dataset.name = panelId;
        // 表格
        let tableList = pData && pData.tabeList;

        // 按键事件
        if (shortcuts) {
            this.handlerKey = (e: KeyboardEvent) => {
                eventActionHandler(para, e);
            };

            // 添加按键ui
            let fragment = document.createDocumentFragment();
            shortcuts.forEach((p: IKeyModalPara) => {
                let dom = d.create(`<div class="swipe">${p.shortKey}${p.shortName}</div>`);
                fragment.appendChild(dom);
            });
            para.body.appendChild(fragment);
        }

        if (uiTmpl === 'sale-bill') {
            d.append(para.body, this.billTpl());
        }

        //输入类型
        inputs && inputs.forEach((i: IInputPara) => {
            // 标题
            if (i.caption) {
                d.append(parent, d.create(`<div class="cashier-caption">${i.caption}</div>`))
            }

            // 输入框
            let type = i.inputType;
            if (!this.inputBox && (['1','2','4'].includes(type))) {
                this.inputBox = d.create(`<div class="inputBox" data-name="${i.fieldName}" data-type="${i.atrrs && i.atrrs.displayFormat || ''}"></div>`);
            }
        });

        // 提示框
        if(shortcuts){
            d.append(parent, d.create(`<div class="modal-short-tip"></div>`));
        }
        this.inputBox && d.append(parent,this.inputBox);


        if (tableList && tableList[0]) {
            Com.itemList[panelId] = {};
            let tableInit = (index) => {
                let table = tableList[index];
                index ++;
                if(!table){
                    Com.keyFlag = true;
                    return;
                }
                Com.itemList[panelId][table.itemId] = new ItemList({
                    dom: <HTMLElement>this.body,
                    data: pData,
                    table: table,
                    nextField: para.nextField,
                    afterInit : () => {
                        tableInit(index);
                    }
                });

                this.itemList = Com.itemList[panelId][table.itemId];
                if(shortcuts){
                    Com.modalMainItemList = this.itemList;
                }
            };
            tableInit(0);
        } else {
            Com.keyFlag = true;
        }

        if(uiTmpl){
            para.body.parentElement.classList.add(uiTmpl);
        }
        para.body.parentElement.classList.add('cashier-body');
        //打开模态框自身的键盘监听事件
        this.on();
    }

    isClear : boolean = false;
    /**
     * 基础按键操作
     * @param e
     */
    private timer : number;
    private handler = (e) => {
        e.preventDefault();
        let box = this.inputBox,
            code =  e.keyCode || e.which || e.charCode;

        if (this.inputBox) {
            // 清空
            if(this.isClear){
                box.innerHTML = '';
                this.isClear = false;
            }
            if(box.innerHTML === ''){
                this.timer = Date.now();
            }

            let len = box.innerHTML.length,
                format = box.dataset.type;
            // 如果有小数点，只能输入到小数点后一位
            let index = box.innerHTML.indexOf('.');

            if (((48 <= code && code <= 57) || (65 <= code && code <= 90) || (96 <= code && code <= 105)) && len < 19 ||
                ((format.indexOf('.') > -1) && (code === 110 || code === 190) && tools.isNotEmpty(box.innerHTML))) {

                // 存在“.”且小数点后只能输入一位
                if(index > -1 && (len > index + 1 || [110,190].includes(code))){

                }else {
                    box.innerHTML += e.key;
                }
            }
            //回退
            if (code === 8) {
                box.innerHTML = box.innerHTML.substr(0, box.innerHTML.length - 1);
            }
        }

        if(code === 27 && this.escKey){
            Com.keyFlag = true;
            Com.closeLastModalPanel();
        }

        if(code === 13){
            let type = Com.checkScan(this.timer, box && box.innerHTML);
            if(!box){ // 键盘选择表格数据
                type = Com.KEYSELECT
            }

            this.p.callback(e, box && box.innerHTML, type);
            box && !this.bill && (box.innerHTML = '');
        }
    };


    bill: HTMLElement;

    /**
     * 结账
     * @returns {HTMLElement|DocumentFragment|HTMLElement|null}
     */
    private billTpl() {
        let bill = d.create(`<div class="sale-bill"></div>`);
        this.bill = d.create(`<div class="bill-content"></div>`);
        d.append(bill, this.bill);

        return bill;
    }

    destroy() {
        Com.keyModal = Com.keyModal.filter(km => km !== this);
        // console.trace();
        super.destroy();
        if(Com.modalMainItemList === this.itemList){
            Com.modalMainItemList = null;
        }
        this.itemList && this.itemList.destroy();
        // this.off();
        this.inputArr = [];
        this.inputBox = null;
        this.scanGun = null;
        this.p = null;
        this.handlerKey = null;
        this.itemList = null;


        // 所有模态框关闭时候都必须是销毁，除了f2设置
        if((Modal.count === 0 || (Modal.count === 1 && Com.confModal)) && Com.mainItemList && Com.mainItemList.mainTable){
            Com.mainItemList.mainTable.wrapper.focus();
        }



    }

    get() {
        return this.inputBox.innerHTML;
    }

    on() {
        let wrapper = this.wrapper;
        d.on(wrapper, 'keydown', this.handler);
        this.handlerKey && d.on(wrapper, 'keydown', this.handlerKey);
    }

    getSelect() {
        return this.itemList && this.itemList.getSelect();
    }
}