/// <amd-module name="Tips"/>
/// <amd-dependency path="raphael" name="Raphael"/>

import d = G.d;
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {FlowDesigner} from "./FlowDesigner";
import {FlowItem} from "./FlowItem";

export class Tips extends Component {
    static TransitionItems: FlowItem[];

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="tips">
            <div className="tip-header">工具集</div>
            <div className="tip-items">
                <div className="tip-item">
                    <div className="tip-item-inner" id="save"><i className="appcommon app-baocun1"/>保存</div>
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
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="fork"><i className="appcommon app-fork"/>fork
                    </div>
                </div>
                <div className="tip-item">
                    <div className="tip-item-inner drag-item" data-name="join"><i className="appcommon app-join"/>join
                    </div>
                </div>
            </div>
        </div>;
    }

    constructor(para: IComponentPara) {
        super(para);
        this.initEvents.on();
    }

    private initEvents = (() => {
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
                        item.active === true && (Tips.TransitionItems = [item]);
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
        let deleteItem = () => {
            let deleteLine = [];
            FlowDesigner.ALLITEMS.forEach(item => {
                if(item && item.active){
                    FlowDesigner.AllLineItems.forEach((line) => {
                        line.from === item.rectNode && deleteLine.push(line) && line.destroy();
                        line.to === item.rectNode && deleteLine.push(line) && line.destroy();
                    });
                    item.destroy() && FlowDesigner.removeAllActive();
                }
            });
            FlowDesigner.AllLineItems.forEach((line, index, arr) => {
                deleteLine.forEach(dLine => {
                    line === dLine && arr.splice(index, 1);
                })
            });
        };
        return {
            on: () => {
                d.on(this.wrapper, 'mousedown', '.drag-item', selectItem);
                d.on(this.wrapper, 'click', '.click-item', clickItemHandler);
                d.on(this.wrapper, 'click', '.delete-item', deleteItem);
            },
            off: () => {
                d.off(this.wrapper, 'mousedown', '.drag-item', selectItem);
                d.off(this.wrapper, 'click', '.click-item', clickItemHandler);
                d.off(this.wrapper, 'click', '.delete-item', deleteItem);
            }
        }
    })();

    // 移除所有item的active效果
    static removeActive() {
        d.queryAll('.tip-item-inner').forEach((tip) => {
            tip.classList.remove('active');
        });
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}