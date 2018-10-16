/// <amd-module name="ActivityType"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {LeRule} from "../../../../common/rule/LeRule";
import {IMenuPara, Menu} from "../../../../../global/components/navigation/menu/Menu";
import {ReportActivityPage} from "../ReportActivityPage";

export class ActivityType extends Component {
    private activityPlatform: string;
    private platformCategory: string;

    protected wrapperInit(para: IComponentPara): HTMLElement {
        let typeWrapper = <div className="lesson-form-group">
            <div className="lesson-label"><span>*</span>&nbsp;活动分类&nbsp;:</div>
            <div class="text-input" c-var="textTitle">
                <input type="text" c-var="input" disabled="disabled" value="请选择活动分类" style={{
                    color: '#91a8b0',
                    opacity: 1,
                    width: ' calc(100% - 20px)'
                }}/>
                <div class="btn-group">
                    <a class="btn btn-sm icon sec seclesson-xiala" data-index="0"></a>
                </div>
            </div>
        </div>;
        return typeWrapper;
    }

    constructor(para: IComponentPara) {
        super(para);
        this.initEvents.on();
    }

    private initEvents = (() => {
        let dropHandler = () => {
            let tree = new Menu({
                isVirtual: true,
                isLeaf: false,
                expand: true,
                expandIconArr: ['seclesson-youjiantou', 'seclesson-xiala'],
                expandIconPre: 'sec',
                ajax: () => {
                    return LeRule.Ajax.fetch(LE.CONF.ajaxUrl.activityType).then(({response}) => {
                        let arr = [];
                        response.data.forEach((node) => {
                            arr.push(handlerNode(node));
                        });
                        return arr;
                    })
                }
            });

            function handlerNode(obj): IMenuPara {
                let nodeObj: IMenuPara = {
                        text: '',
                        content: obj,
                        children: []
                    },
                    content = {},
                    children = [];
                nodeObj['text'] = obj['TITLE'];
                content['ID'] = obj['ID'];
                if (tools.isNotEmptyArray(obj.CHILDREN)) {
                    obj.CHILDREN.forEach((nc) => {
                        children.push(handlerNode(nc));
                    })
                }
                nodeObj['children'] = children;
                return nodeObj;
            }

            // 弹出模态框
            let modal = new Modal({
                header: {
                    title: '请选择活动平台',
                },
                width: '500px',
                height: '600px',
                body: tree.wrapper,
                className: 'tree-modal',
                footer: {},
                onOk: () => {
                    let selectNodes = tree.getSelectedNodes();

                    if (tools.isNotEmptyArray(selectNodes)) {
                        let node = selectNodes[0];
                        if (node.isLeaf === true){
                            this.platformCategory = node.content.ID;
                            let parentNode = node.backFind(node => node.deep==1);
                            this.activityPlatform = parentNode.content.ID;
                            let input = this.innerEl.input as HTMLFormElement,
                                textTitle = this.innerEl.textTitle;
                            input.value = node.text;
                            textTitle.title = parentNode.text + '-' + node.text;
                            modal.destroy();
                        }else{
                            Modal.alert('请选择平台类别');
                        }
                    } else {
                        Modal.alert('请选择活动分类');
                    }
                }
            });
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.seclesson-xiala', dropHandler),
            off: () => d.off(this.wrapper, 'click', '.seclesson-xiala', dropHandler)
        }
    })();

    set disabled(d:boolean){
        if(tools.isEmpty(d)){
            return;
        }
        this._disabled = d;
        this.innerEl.textTitle.classList.toggle('disabled',d);
    }
    get disabled(){
        return this._disabled;
    }

    set(values: string[]) {
        if (tools.isNotEmpty(values)){
            tools.isNotEmpty(values[3]) && ((this.innerEl.input as HTMLFormElement).value = values[3]);
            tools.isNotEmpty(values[2]) && tools.isNotEmpty(values[3]) && (this.innerEl.textTitle.title = values[2] + values[3]);
            this.activityPlatform = values[0];
            this.platformCategory = values[1];
        }
    }

    get() {
        if (tools.isEmpty(this.activityPlatform)) {
            Modal.alert('请选择活动平台!');
            return false;
        }
        if (tools.isEmpty(this.platformCategory)) {
            Modal.alert('请选择平台类别!');
            return false;
        }

        return {
            activityPlatform: this.activityPlatform,
            platformCategory: this.platformCategory
        }
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}