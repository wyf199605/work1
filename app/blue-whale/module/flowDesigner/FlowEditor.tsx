/// <amd-module name="FlowEditor"/>
/// <amd-dependency path="raphael" name="Raphael"/>

import d = G.d;
import tools = G.tools;
import Component = G.Component;
import {FlowDesigner} from "./FlowDesigner";
import {FormCom, IFormComPara} from "../../../global/components/form/basic";
import {LineItem} from "./LineItem";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {DropDown} from "../../../global/components/ui/dropdown/dropdown";
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import {ContactsModule} from "./ContactsModule";

export interface IFieldPara {
    name?: string;  // 名称
    displayName?: string;   // 显示名称
    expr?: string;  // 决策表达式
    processName?: string;   // 子流程名称
    form?: string;          // 任务表单
    assignee?: string;      // 参与者
    taskType?: string;      // 任务类型
    performType?: string;   // 参与类型
    processTypeId?: number; // 流程类型
}

export interface IFlowEditorPara extends IFormComPara {
    type?: string;  // 节点类型
    owner?: Component | FlowDesigner;   // flowEditor的所有者
    fields?: IFieldPara;                // 传入表示对flowEditor进行初始化
}

export class FlowEditor extends FormCom {

    static EXIST_NAME = []; // 存放已被使用的name
    static DropDowns: DropDown[] = [];  // 存放所有下拉列表

    // 类型对应的属性列表（类型属性限定表）
    static ATTR_LIMIT = {
        other: ['name', 'displayName'],
        custom: ['name', 'displayName'],
        decision: ['name', 'displayName', 'expr'],
        start: ['name', 'displayName'],
        end: ['name', 'displayName'],
        subprocess: ['name', 'displayName', 'processName'],
        task: ['name', 'displayName', 'form', 'assignee', 'taskType', 'performType'],
        transition: ['name', 'displayName'],
    };

    // 属性对应的名称
    static ATTR_DESCRIPTION = {
        name: '名称',
        displayName: '显示名称',
        expr: '决策表达式',
        processName: '子流程名称',
        form: '任务表单',
        assignee: '参与者',
        taskType: '任务类型',
        performType: '参与类型',
    };

    static DROPDOWN_KEYVALUE: ListItem = {
        // 新增下拉列表时在此处添加键值
        performType: [{value: 'ANY', text: '普通参与'}, {value: 'ALL', text: '会签参与'}],
        taskType: [{value: 'Major', text: '主办任务'}, {value: 'Aidant', text: '协办任务'}],
        assignee: [
            {value: ':currentuserid', text: '登录用户'},
            {value: '', text: '角色'},
            {value: '_group', text: '用户组'},
            {value: '#', text: 'valueList用户配置'},
        ]
    };

    static addressList = [
        {text: 'valueList用户配置', address: CONF.ajaxUrl.test}
    ];

    private owner: Component | FlowDesigner;

    protected wrapperInit(para: IFlowEditorPara): HTMLElement {
        return <div className="flow-editor">
            <div className="tip-header">属性</div>
            <div className="tip-body"></div>
        </div>;
    }

    constructor(para: IFlowEditorPara) {
        super(para);
        this.type = para.type;
        para.owner && (this.owner = para.owner);
        // flowEditor初始化
        this.initFlowEditor(para);
        this.initEvents.on();
        if (para.fields) {
            let fields = para.fields;
            // 查看流程时获取的数据也要进行转换
            Object.keys(fields).forEach(key => {
                if (key in FlowEditor.DROPDOWN_KEYVALUE) {
                    let valueText = FlowEditor.DROPDOWN_KEYVALUE[key].filter(item => item.value === fields[key])[0];
                    valueText && (fields[key] = valueText.text);
                }
            });
            this.set(fields);
        }
    }

    // 隐藏所有下拉列表
    static hideAllDropdown() {
        FlowEditor.DropDowns.forEach(dropdown => dropdown.hideList());
    }

    private initFlowEditor(para: IFlowEditorPara) {
        // 根据类型判断节点具有的属性(如果在类型属性限定表中没有该类型的话，则类型默认为other，只有name和displayName两个属性)
        FlowEditor.ATTR_LIMIT[para.type in FlowEditor.ATTR_LIMIT ? para.type : 'other'].forEach(attr => {
            // 初始化时将start和end节点的name设为start/end
            let name = ((para.type === 'start' || para.type === 'end') && attr === 'name') ? para.type : '',
                attrEditorWrapper = <div className="attr-editor-wrapper" data-attr={attr}>
                    <div className="attr-editor-description">{FlowEditor.ATTR_DESCRIPTION[attr]}:</div>
                    <div className="attr-editor-input">
                        <input type="text" value={name} readOnly={attr in FlowEditor.DROPDOWN_KEYVALUE}/>
                    </div>
                </div>;
            if (attr in FlowEditor.DROPDOWN_KEYVALUE) {
                // 添加下拉按钮
                d.append(d.query('.attr-editor-input', attrEditorWrapper),
                    <i className="floweditor-dropdown appcommon app-xiala"></i>);
                let dropdownWrapper = <div className="dropdown-wrapper" data-attr={attr}>
                    {/*<div className="dropdown-title"></div>*/}
                </div>;
                let dropdown = new DropDown({
                    data: FlowEditor.DROPDOWN_KEYVALUE[attr],
                    el: dropdownWrapper,
                    inline: true,
                    onSelect: (item, index) => {
                        this.set({[attr]: item.text});
                        FlowEditor.hideAllDropdown();
                        if (item.text === FlowEditor.addressList[0].text) {
                            BwRule.Ajax.fetch(FlowEditor.addressList[0].address).then(({response}) => {
                                let field = response.body.elements[0].fields[1];
                                new ContactsModule({
                                    field: field,
                                    onGetData: (data) => {
                                        console.log(data);
                                    }
                                });
                            }).catch(err => {
                                console.log(err);
                            });
                        }
                    }
                });
                dropdown.hideList();    // 初始设置为隐藏
                d.append(d.closest(this.wrapper, '.design-canvas'), dropdownWrapper);
                // 将下拉列表存到FlowEditor类和实例中，方便之后隐藏/显示列表
                this.dropdowns[attr] = dropdown;
                FlowEditor.DropDowns.push(dropdown);
            }
            d.append(d.query('.tip-body', this.wrapper), attrEditorWrapper);
        });
    }

    public initEvents = (() => {
        let clickHandler = (e) => {
                // 点击文字描述也能使input获得焦点,并且记录当前input的值为旧值
                let input;
                if (e.target.className.split().includes('attr-editor-wrapper')) {
                    input = d.query('input', e.target) as HTMLInputElement;
                } else {
                    input = d.query('input', e.target.parentElement) as HTMLInputElement;
                }
                input.focus();
                input.dataset.old = input.value;
            },
            changeHandler = (e) => {
                // name不能相同
                if (FlowEditor.EXIST_NAME.includes(e.target.value)) {
                    // 如果name已经存在，则重置为旧值
                    Modal.toast('该名称已存在!');
                    e.target.value = e.target.dataset.old;
                } else {
                    // 否则将改变的值从已存在name中删除，并将旧值置为当前值
                    let currentValue = e.target.value;
                    FlowEditor.EXIST_NAME.forEach((value, index, arr) => {
                        if (value === e.target.dataset.old) {
                            arr.splice(index, 1);
                        }
                    });
                    e.target.dataset.old = currentValue;
                    // 添加到已存在name列表中
                    currentValue && !FlowEditor.EXIST_NAME.includes(currentValue) && FlowEditor.EXIST_NAME.push(currentValue);
                }
            },
            dropdownToggleClickHandler = (e) => {
                // 首先隐藏所有下拉列表，然后（显示/隐藏）当前选择的下拉列表
                let dropdown = this.dropdowns[d.closest(e.target, '.attr-editor-wrapper', this.wrapper).dataset['attr']],
                    prevState = dropdown.isVisible;
                FlowEditor.hideAllDropdown();
                prevState ? dropdown.hideList() : dropdown.showList();
            };

        // 使用this.wrapper会使得点击.tip-header时，第一个input获得焦点，对change事件没有影响
        // let tipBody = d.query('.tip-body', this.wrapper);
        return {
            on: () => {
                d.on(this.wrapper, 'click', clickHandler);
                d.on(d.query('.attr-editor-wrapper[data-attr=name]', this.wrapper), 'change', changeHandler);
                Object.keys(FlowEditor.DROPDOWN_KEYVALUE).forEach(attr => {
                    // 所有下拉按钮的点击事件
                    d.on(
                        d.query('.floweditor-dropdown', d.query(`.attr-editor-wrapper[data-attr=${attr}]`, this.wrapper)),
                        'click',
                        dropdownToggleClickHandler
                    );
                });
            },
            off: () => {
                d.off(this.wrapper, 'click', clickHandler);
                d.off(d.query('.attr-editor-wrapper[data-attr=name]', this.wrapper), 'change', changeHandler);
                Object.keys(FlowEditor.DROPDOWN_KEYVALUE).forEach(attr => {
                    d.off(
                        d.query('.floweditor-dropdown', d.query(`.attr-editor-wrapper[data-attr=${attr}]`, this.wrapper)),
                        'click',
                        dropdownToggleClickHandler
                    );
                });
            }
        }
    })();

    // 节点类型
    private _type: string;
    get type() {
        return this._type;
    }

    set type(type: string) {
        this._type = type;
    }

    // 存放当前flowEditor的下拉列表
    private _dropdowns = {};
    get dropdowns() {
        return this._dropdowns;
    }

    set dropdowns(dropdowns: object) {
        this._dropdowns = dropdowns;
    }

    // 控制是否显示（以及更新）
    private _show: boolean;
    set show(show: boolean) {
        /*
        *   因为this.owner是联合类型FlowDesigner | Component，使用时需用this.owner instanceof FlowDesigner判断this.owner是哪种类型
        *   如果是FlowDesigner就不用更新文本，并且在#designe-canvas上更新data-name
        *   如果是Component，那么只有当前为显示状态并且准备隐藏的时候，才更新节点的data-name和文本
        * */
        let fields = this.get();
        if (this.owner && this.owner['wrapper'] && !(this.owner instanceof FlowDesigner) &&
            tools.isNotEmpty(this.show) && !show && this.show !== show) {
            this.owner['wrapper'].dataset.name = fields.name;
            let limitLength = 50,
                limitDisplayName = fields.displayName.length > limitLength ? fields.displayName.slice(0, limitLength) + '...' : fields.displayName;
            if (this.owner['isEnd'] || this.owner['isStart']) {
                // 如果节点是开始或结束节点，则不需要更新文本
            } else if (this.owner['isDiamond']) {
                // 如果是菱形，则更新diamond-text里的文本
                d.query('.diamond-text', this.owner['wrapper']).textContent = limitDisplayName || this.type;
            } else if (this.owner instanceof LineItem) {
                // 是连接线，除非有值否则不显示文本，并且要设置文本显示的位置
                this.owner['wrapper'].textContent = limitDisplayName || '';
                this.owner.setTextWrapperPosition();
            } else {
                // 是矩形就在wrapper上更新
                this.owner['wrapper'].textContent = limitDisplayName || this.type;
            }
        } else if (this.owner instanceof FlowDesigner) {
            fields.name && (d.query('#design-canvas').dataset.name = fields.name);
        }
        this._show = show;
        this.wrapper && this.wrapper.classList.toggle('hide', !show);
    }

    get show() {
        return this._show;
    }

    // 获取和设置flowEditor
    get() {
        let fields: IFieldPara = {};
        d.queryAll('.attr-editor-wrapper', this.wrapper).forEach(item => {
            fields[item.dataset.attr] = d.query('input', item)['value'];
        });
        return fields;
    }

    set(fields: IFieldPara) {
        for (let attr in fields) {
            let attrEditorWrapper = d.queryAll('.attr-editor-wrapper', this.wrapper)
                .filter(item => item.dataset.attr === attr)[0];
            d.query('input', attrEditorWrapper)['value'] = fields[attr];
        }
    }

    public _value: IFieldPara;
    get value() {
        this._value = this.get();
        return this._value;
    }

    set value(value: IFieldPara) {
        this.set(value);
    }

    destroy() {
        this.initEvents.off();
        FlowEditor.EXIST_NAME.indexOf(this.get().name) >= 0 &&
        FlowEditor.EXIST_NAME.splice(FlowEditor.EXIST_NAME.indexOf(this.get().name), 1);
        FlowEditor.DropDowns.forEach(dropdown => {
            Object.keys(this.dropdowns).forEach(attr => {
                d.remove(d.closest(this.dropdowns[attr].ulDom, '.dropdown-wrapper', d.query('#design-canvas')));
            });
        });
        this.owner = null;
        super.destroy();
    }
}