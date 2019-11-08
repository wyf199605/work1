/// <amd-module name="AssignModule"/>
import tools = G.tools;
import {AssignModuleBasic} from "./assignModuleBasic";
import {ITagsInputPara, TagsInput} from "../../../../global/components/form/tagsInput/tagsInput";
import {Modal} from "global/components/feedback/modal/Modal";
import {BwRule} from "../../../common/rule/BwRule";
interface AssignPara extends ITagsInputPara{
    onSet?(assignData :{[key : string]: any[]}): void;
    pickerUrl: string;
    ajaxUrl: string;
    data: obj;
    onGetData(data: obj[], otherField: string): void
}
export default class AssignModule extends AssignModuleBasic{
    onSet: (val) => void;

    private tagsInput: TagsInput;
    // private assignData : obj[] = [];
    private assignData: {[key : string]: any[]} = {};
    // private contactModal : G.Modal;
    private ajax = new BwRule.Ajax();
    protected selectedData;

    constructor(private para: AssignPara){
        super(para);

        this.para = this.paraInit(para);

        this.tagsInput = new TagsInput(this.para);
        this.tagsInput.onItemRemove = (values) => {
            let data = [],
                res = values.map((val) => val.value),
                detail = this.selectedData;
            detail && detail.data && detail.data.forEach((obj) => {
                let val = obj[detail.fromField];
                if(res.indexOf(val) > -1){
                    data.push(obj);
                }
            });
            this.para.onGetData && this.para.onGetData(data, detail ? detail.otherField : '');
        };

        this.initDeleteEvent();

        let pickDom = <HTMLElement>para.container.parentElement.querySelector('span[data-action="picker"]');

        this.para.container.parentElement.dataset.name = para.name;

        this.initPicker(pickDom, null, this.para.pickerUrl, para.data, (detail) => {
            this.selectedData = detail;
            if(!para.multi){
                this.tagsInput.removeItems();
            }
            let dataStr = detail.data.map(obj => obj[detail.fromField]).join(';');
            this.set(dataStr);
            this.para.onGetData(detail.data, detail.otherField);
        });
    }

    private paraInit(para: AssignPara){
        if(!para.ajaxUrl){
            return para
        }
        para.ajax = (data) => {

            return this.ajax.fetch(para.ajaxUrl, {
                cache: true,
                data: {[para.name]: data},
            }).then(({response}) => {
                return ajaxSuccess(data, response);
            });
        };

        let ajaxSuccess = (data: string, response) => {

            let resData = response.data[0],
                keyArr = Object.keys(resData),
                items: Array<{value:any, text:string}> = [];

            if (!resData[keyArr[0]]) {
                Modal.alert(`查询"${data}"无结果`);
                return [];
            }

            this.assignData = this.assignDataGet(data, resData);

            // let assignValueArr = {};
            // keyArr.forEach( (key) => {
            //     assignValueArr[key] = resData[key].split(this.sepValue);
            // });
            //
            data.split(para.sepValue).forEach( (v, i) => {
                if (tools.isEmpty(v)) {
                    return;
                }

                items.push({
                    value: v,
                    text: this.assignData[keyArr[0]][i] + '(' + v + ')',
                });

            });

            this.para.onSet(this.assignData);
            return items;
        };
        return para;
    }

    private initDeleteEvent(){
        this.tagsInput.on('beforeItemRemove', (event) => {
            let deleteIndex:number = -1;
            this.tagsInput.get().forEach(function (value, index) {
                value === event.item && (deleteIndex = index);
            });
            for(let key in this.assignData){
                this.assignData[key].splice(deleteIndex, 1);
            }
            this.para.onSet(this.assignData);
        });
    }
    get() {
        let tagsValue = '';
        this.tagsInput.get().forEach((tag) => {
            tagsValue += tag.value;
            tagsValue += this.sepValue;
        });
        return tagsValue.slice(0, -1);
    }
    set(data: string): void {
        this.tagsInput.set(data);
    }

    get value(){
        let tagsValue = '';
        this.tagsInput.get().forEach((tag) => {
            tagsValue += tag.value;
            tagsValue += this.sepValue;
        });
        return tagsValue.slice(0, -1);
    }
    set value(data: string){
        this.tagsInput.set(data);
    }
}
