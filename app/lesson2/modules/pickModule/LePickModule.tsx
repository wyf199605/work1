/// <amd-module name="LePickModule"/>
import {ITextInputPara, TextInput} from "../../../global/components/form/text/text";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {LeRule} from "../../common/rule/LeRule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {LeBaseTable} from "../LeTable/LeBaseTable";
import {LeTableModule} from "../LeTable/LeTableModule";

interface ILePickModulePara extends ITextInputPara {
    ui: ILE_PickUi;
    fields?: ILE_Field[];
}

export class LePickModule extends TextInput {
    private modal: Modal;
    private lebaseTable: LeTableModule;
    private uiData: ILE_Table = {
        id: "",
        caption: "",
        fieldnames: [],

    };
    constructor(para: ILePickModulePara) {
        super(Object.assign({}, para, {
            icons: ['sec seclesson-xiala'],
            iconHandle: () => {
                if (!this.modal) {
                    let body = <div/>;
                    this.modal = new Modal({
                        className:"ile-pick",
                        top: 10,
                        header: {
                            // title : para.title
                        },
                        body: body,
                        footer: {},
                        onOk: () => {
                            let key = para.ui.fieldname,
                                valueRow = this.lebaseTable.main.ftable.selectedRowsData
                                    .map(data=> data[key]).join(',');

                            this.set(valueRow);
                            this.modal.isShow = false;
                        }
                    });

                    if (para.ui) {
                        for (let obj in para.ui) {
                            if(obj ==  "fieldnames"){
                               para.ui['fieldnames'].forEach((value, index)=>{
                                   this.uiData[obj].push({fieldname:value,type:""})
                               })

                            }else {
                                this.uiData[obj] = para.ui[obj];
                            }

                        }
                    }

                    this.lebaseTable = <LeTableModule
                        container={this.modal.bodyWrapper}
                        tableUi={this.uiData}
                        fields={para.fields}
                    />

                } else {
                    this.modal.isShow = true;
                }

            }
        }));
        this.wrapper.classList.add('le-pick');
    }

    protected ajax = new LeRule.Ajax();

}