/// <amd-module name="Tips"/>
/// <amd-dependency path="raphael" name="Raphael"/>

import d = G.d;
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {FlowDesigner, Method} from "./FlowDesigner";
import {FlowItem} from "./FlowItem";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FlowEditor, IFieldPara} from "./FlowEditor";
import {BwRule} from "../../common/rule/BwRule";

export class Tips extends Component {
    static TransitionItems: FlowItem[];

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="tips">
            <div className="tip-header">工具集</div>
            <div className="tip-items">
                <div className="tip-item">
                    <div className="tip-item-inner save-flow" id="save"><i className="appcommon app-baocun1"/>保存</div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner delete-item" id="delete-item"><i className="appcommon app-shanchu"/>删除</div>
                </div>
                <div className="tip-line"/>
                <div className="tip-item">
                    <div className="tip-item-inner click-item" data-name="select"><i
                        className="appcommon app-Select"/>Select
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner click-item" data-name="transition"><i
                        className="appcommon app-transition"/>Transition
                    </div>
                </div>
                <div className="tip-line"/>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="start"><i className="appcommon app-start"/>Start
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="end"><i className="appcommon app-end"/>End
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item task-item" data-name="task"><i
                        className="appcommon app-task"/>task
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="custom"><i
                        className="appcommon app-custom"/>custom
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="subprocess"><i
                        className="appcommon app-subprocess"/>subprocess
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="decision"><i
                        className="appcommon app-decision1"/>decision
                    </div>
                </div>
                {/*<div className="tip-item">*/}
                    {/*<div className="tip-item-inner drag-item" data-name="fork"><i className="appcommon app-fork"/>fork*/}
                    {/*</div>*/}
                {/*</div>*/}
                {/*<div className="tip-item">*/}
                    {/*<div className="tip-item-inner drag-item" data-name="join"><i className="appcommon app-join"/>join*/}
                    {/*</div>*/}
                {/*</div>*/}
            </div>
        </div>;
    }

    constructor(para: IComponentPara) {
        super(para);
        this.initEvents.on();
    }

    public initEvents = (() => {
        let selectItem = (e) => {
            let movefollow = <span className="move-follow"/>;
            movefollow.innerHTML = d.closest(e.target, '.drag-item').innerHTML;
            movefollow.style.left = e.clientX + 12 + 'px';
            movefollow.style.top = e.clientY + 12 + 'px';
            document.body.appendChild(movefollow);
            setActive(d.closest(e.target, '.tip-item-inner'));
            Tips.TransitionItems = [];
            let selectItemMove = tools.pattern.throttling((moveEvent) => {
                movefollow.style.left = moveEvent.clientX + 12 + 'px';
                movefollow.style.top = moveEvent.clientY + 12 + 'px';
            }, 10);
            d.on(document, 'mousemove', selectItemMove);
            let selectItemMoveUp = (moveUpEvent) => {
                document.body.removeChild(movefollow);
                // 画对应的圆
                if (moveUpEvent.target.nodeName === 'svg') {
                    // FlowDesigner.CURRENT_SELECT_TYPE = d.closest(e.target, '.drag-item').dataset.name;
                    FlowDesigner.CURRENT_SELECT_TYPE = '';
                    let top = Number(tools.offset.top(d.query('#design-canvas'))),
                        left = Number(tools.offset.left(d.query('#design-canvas')));
                    let flowItem = new FlowItem({
                        type: d.closest(e.target, '.drag-item').dataset.name,
                        text: '',
                        position: {
                            x: moveUpEvent.clientX - left + 15,
                            y: moveUpEvent.clientY - top + 15
                        },
                        container: d.query('#design-canvas')
                    });
                    let arr = FlowDesigner.ALLITEMS || [];
                    FlowDesigner.ALLITEMS = arr.concat([flowItem]);
                    FlowDesigner.removeAllActive();
                    flowItem.active = true;
                    FlowItem.toggleDisabledStartAndEnd();
                }
                d.off(document, 'mousemove', selectItemMove);
                d.off(document, 'mouseup', selectItemMoveUp);
            };
            d.on(document, 'mouseup', selectItemMoveUp);
        };

        let clickItemHandler = (e) => {
            FlowDesigner.CURRENT_SELECT_TYPE = d.closest(e.target, '.click-item').dataset.name;
            setActive(d.closest(e.target, '.tip-item-inner'));
            Tips.TransitionItems = [];
            if (FlowDesigner.CURRENT_SELECT_TYPE === 'transition') {
                if (tools.isNotEmpty(FlowDesigner.ALLITEMS)) {
                    FlowDesigner.ALLITEMS.forEach(item => {
                        item && item.active && (Tips.TransitionItems = [item]);
                    });
                }
            }
        };

        let setActive = (target: HTMLElement) => {
            d.queryAll('.tip-item-inner').forEach((tip) => {
                tip.classList.remove('active');
            });
            target.classList.add('active');
        };

        let saveFlowHandler = () => {
            let allItems = [].concat(FlowDesigner.ALLITEMS).concat(FlowDesigner.AllLineItems),
                allNames = [];
            if(allItems.some(item => tools.isEmpty(item.flowEditor.get().name))){
                Modal.toast('名称不能为空!');
                return;
            }
            allItems.forEach(item => item.flowEditor.get().name &&
                (allNames[item.flowEditor.get().name] =  allNames[item.flowEditor.get().name] + 1 || 1));
            for(let attr of Object.keys(allNames)){
                if(allNames[attr] > 1){
                    Modal.toast(`名称${attr}重复！`);
                    return;
                }
            }

            let xmlDoc = Method.loadXMLStr(`<?xml version="1.0" encoding="UTF-8"?><process></process>`);
            FlowDesigner.rootElement = xmlDoc.documentElement;
            FlowDesigner.ALLITEMS.forEach(item => {
                // 创建节点、设置属性、添加到xml节点树中
                if(tools.isNotEmpty(item)){
                    let xmlNode = Method.parseToXml.createXmlElement(item.flowEditor.type),
                        attrs = item.rectNode.attrs,
                        layoutStr = [attrs.cx || attrs.x, attrs.cy || attrs.y, attrs.r || attrs.width, attrs.r || attrs.height].join(),
                        dropdowns = item.flowEditor.dropdowns,
                        dropdownField: IFieldPara = {};
                    // 对于下拉选择的属性，因为要传给后台的数据和input里的值不同，所以要根据DROPDOWN_KEYVALUE进行转换，将'真'数据传给后台
                    Object.keys(dropdowns).forEach((attr) => {
                        if(dropdowns[attr].selectIndex >= 0){
                            dropdownField[attr] = dropdowns[attr].data[dropdowns[attr].selectIndex].value;
                        }else{
                            // 如果没有选择，则用原来的值
                            if(attr === 'assignee'){
                                tools.isNotEmpty(item.flowEditor.value[attr]) ?
                                    (dropdownField[attr] = item.flowEditor.value[attr]) :
                                    (dropdownField[attr] = item.flowEditor.get()[attr]);
                            }else {
                                let valueText = FlowEditor.DROPDOWN_KEYVALUE[attr].filter(valueText => valueText.text === item.flowEditor.value[attr])[0];
                                dropdownField[attr] = valueText && valueText.value;
                            }
                        }
                    });
                    // Object.keys(dropdowns).forEach(attr => dropdowns[attr].selectIndex >= 0 &&
                    //             (dropdownField[attr] = dropdowns[attr].data[dropdowns[attr].selectIndex].value));
                    Method.parseToXml.setAttr(xmlNode, Object.assign({layout: layoutStr}, item.flowEditor.get(), dropdownField));
                    FlowDesigner.rootElement.appendChild(xmlNode);
                }
            });
            // 再创建所有的连接线，并设置属性和作为谁的子节点
            FlowDesigner.AllLineItems.forEach(line => {
                let xmlNode = Method.parseToXml.createXmlElement(line.flowEditor.type),
                    toItem = FlowDesigner.ALLITEMS.filter(item => item.rectNode === line.to)[0];
                // 根据连接线的目标节点的属性设置连接线的属性
                toItem && line.flowEditor && Method.parseToXml.setAttr(xmlNode, Object.assign(
                        {to: toItem.flowEditor.get().name}, line.flowEditor.get()));
                // 首先获取连接线的来源节点，然后将连接线作为来源节点的子节点添加到xml节点树中
                let fromItem = FlowDesigner.ALLITEMS.filter(item => item.rectNode === line.from)[0],
                    fromNode = null;
                FlowDesigner.rootElement.childNodes['forEach'](item => {
                    if(fromItem && 'name' in item['attributes'] &&
                        fromItem.flowEditor.get().name === item['attributes'].getNamedItem('name').value){
                        fromNode = item;
                    }
                });
                fromNode && fromNode.appendChild(xmlNode);
            });

            let xmlStr = new XMLSerializer().serializeToString(xmlDoc); // 将流程转为xml字符串
            // console.log('save xml: ');
            // console.log(xmlStr);
            BwRule.Ajax.fetch(BW.CONF.ajaxUrl.modifyFlow + FlowDesigner.processId, {
                type: 'POST',
                data: {process: xmlStr},
            }).then(({response}) => {
                Modal.toast(response.msg);
            }).catch((err) => {
                console.log(err);
            });
        };

        let deleteItem = () => {
            // 删除选中的节点和节点相关联的连接线
            let deleteLine = [];
            for(let item of FlowDesigner.ALLITEMS){
                if(item && item.active && item.flowEditor && item.flowEditor.show){
                    for(let line of FlowDesigner.AllLineItems){
                        if(line.from === item.rectNode || line.to === item.rectNode){
                            deleteLine.push(line);
                            line.destroy();
                        }
                    }
                    deleteLine.forEach(line => FlowDesigner.AllLineItems.splice(FlowDesigner.AllLineItems.indexOf(line), 1));
                    item.destroy() && FlowDesigner.removeAllActive();
                    return;
                }
            }
            FlowDesigner.AllLineItems.filter((line, index, arr) => line.active && arr.splice(index, 1) && line.destroy());
            // console.log('after delete: ');
            // console.log(FlowDesigner.ALLITEMS);
            // console.log(FlowDesigner.AllLineItems);
        };
        return {
            on: () => {
                d.on(this.wrapper, 'mousedown', '.drag-item', selectItem);
                d.on(this.wrapper, 'click', '.click-item', clickItemHandler);
                d.on(d.query('.save-flow'), 'click', saveFlowHandler);
                d.on(this.wrapper, 'click', '.delete-item', deleteItem);
            },
            off: () => {
                d.off(this.wrapper, 'mousedown', '.drag-item', selectItem);
                d.off(this.wrapper, 'click', '.click-item', clickItemHandler);
                d.off(d.query('.save-flow'), 'click', saveFlowHandler);
                d.off(this.wrapper, 'click', '.delete-item', deleteItem);
            },
        }
    })();

    // 移除所有item的active效果
    static removeActive() {
        d.queryAll('.tip-item-inner').forEach((tip) => {
            tip.classList.remove('active');
        });
        Tips.TransitionItems = [];
    }

    destroy() {
        Tips.TransitionItems = [];
        this.initEvents.off();
        super.destroy();
    }
}