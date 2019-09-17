/// <amd-module name="PickModule"/>
import d = G.d;
import CONF = BW.CONF;
import sys = BW.sys;
import {Modal} from "global/components/feedback/modal/Modal";
import {SelectBox} from "global/components/form/selectBox/selectBox";
import {DropDown} from "global/components/ui/dropdown/dropdown";
import {TextInput, ITextInputBasicPara, ITextInputPara} from "global/components/form/text/text";
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {BwRule} from "../../common/rule/BwRule";
import {BwTableElement} from "../../pages/table/newTablePage";

interface PickModulePara extends ITextInputBasicPara {
    field: R_Field,
    data : obj,
    dataGet(): obj,
    onGetData?(data: obj[], otherField: string): void
}

interface resDataPara {
    ELEMENTID: string;
    PARENTID: string;
    ELEMENTNAME: string;
    ELEMENTTYPEID: number;
    REQUIRED: number;
    MEMO: string;
}

/**
 *  这里不支持multiPick
 */
export class PickModule extends TextInput {
    private Dom: HTMLElement;
    private body: HTMLElement;
    private component: SelectBox[] | DropDown[] = [];
    private bwTable : BwTableElement;

    private p: PickModulePara;
    private fromField: string;
    private otherField: string;
    private modal: Modal;
    private spinner: Spinner;

    constructor(para: PickModulePara) {

        super({
            icons: ['iconfont icon-arrow-down'],
            readonly : false,
            iconHandle: () => {
                this.pickInit();
            },
            container: para.container,
        } as ITextInputPara);
        this.p = para;
    }

    pickInit() {
        if (!this.modal) {
            let self = this,
                isDefault = true,
                // dataGet = this.p.dataGet(),
                ajaxData,
                dataAddr;
            if (this.p.field.multiPick) {
                //元素列表
                dataAddr = self.p.field.multiPick.dataAddr;
                // ajaxUrl = CONF.siteUrl + Rule.reqAddr(dataAddr, dataGet);
            } else if (this.p.field.elementType === 'pick') {
                //表格pick
                dataAddr = self.p.field.dataAddr;

                self.body = <div></div>;
                ajaxData = {output: 'json'};
                isDefault = false;
            }

            self.ajaxLoad(CONF.siteUrl + BwRule.reqAddr(dataAddr, this.p.dataGet()), ajaxData, isDefault);
        } else {
            this.modal.isShow = true;
            let tableModule = this.bwTable && this.bwTable.tableModule;
            tableModule && tableModule.responsive();
        }
    }

    private getData() {
        let self = this;
        let elementData: string = '';
        //获取数据
        if (!self.p.field.multiPick) {
            let data = [],
                getData = self.bwTable.tableModule.main.ftable.selectedRowsData;

            getData.forEach(s => {
                for (let key in s) {
                    if (key === self.fromField) {
                        data.push(s[key]);
                    }
                }
            });

            // set数据
            self.set(data.join(';'));

            // 传给后台的otherField
            self.p.onGetData(getData, self.otherField);

        } else {
            // let comsExtraData = [] ;
            for (let item in self.component) {
                let data = self.component[item].getSelect();
                data[0] && data.forEach((d: ListItem, i) => {
                    elementData += d.text + ';';
                    // comsExtraData.push(data[i]);
                });
            }
            elementData = elementData.substr(0, elementData.length - 1);
            //set数据
            self.set(elementData);
        }

        self.modal.isShow = false;
    }

    /**
     * 数据加载
     * @param ajaxUrl
     * @param ajaxData
     * @param isDefault
     */
    private ajaxLoad(ajaxUrl: string, ajaxData : obj, isDefault: boolean) {
        let self = this;
        //加载效果
        self.spinner = new Spinner({
            el: d.query('.btn-group', self.p.container),
            type: 1
        });
        self.spinner.show();
        this.disabled = true;

        BwRule.Ajax.fetch(ajaxUrl, {
            data: ajaxData
        }).then(({response}) => {
            if (self.p.field.multiPick) {
                self.multiPick(response);
            } else {
                let res = response.body.elements[0];
                self.modalInit();

                self.bwTable = new BwTableElement({
                    tableEl: res,
                    container : self.body,
                    multi: res.multiValue
                });

                self.fromField = res.fromField;
                self.otherField = res.otherField;
            }
        }).finally(() => {
            self.spinner.hide();
            this.disabled = false;
        });
    }


    private modalInit() {
        let width = '',
            className = 'modal-pick';
        if (sys.os === 'pc') {
            width = '500px';
        } else {
            if (this.p.field.multiPick) {
                className = 'modal-multiPick';
            }else{
                width = '300px';
            }
        }
        this.modal = new Modal({
            body: this.body,
            header: this.p.field.caption,
            className: className,
            width: width,
            height: '80%',
            container: d.closest(this.para.container, '.page-container[data-src]'),
            isBackground: true,
            footer: {},
            top: 40,
            isMb: false
        });
        this.modal.onOk = () => {
            this.getData();
        };
    }


    /**
     * 生成multi
     * @param response
     */
    private multiPick(response) {
        let self = this;
        let data = response.data;
        // console.log(data,7)
        if (data[0]) {
            this.body = <div className="element-box"></div>;
        } else {
            this.body = <div>暂无数据</div>;
        }
        //第一层
        data.forEach(o => {
            self.Dom = <div className="element-col"></div>;
            self.body.appendChild(self.Dom);

            self.titleAppend(o, 'one-trees');

            let oneFloor = [];

            //第二层
            o.child.forEach((t) => {
                if (t.child[0]) {
                    let twoFloor = [];
                    self.titleAppend(t, 'two-trees', o);

                    //第三层
                    t.child.forEach(s => {
                        if (s.child[0]) {
                            let threeFloor = [];
                            self.titleAppend(s, 'three-trees', o);

                            //第四层
                            s.child.forEach(f => {
                                self.dataPush(threeFloor, f)
                            });
                            //创建组件
                            threeFloor[0] && self.createComponent(threeFloor, s, 'four-trees');
                        } else {
                            self.dataPush(twoFloor, s);
                        }
                    });
                    //创建组件
                    twoFloor[0] && self.createComponent(twoFloor, t, 'three-trees');
                } else {
                    self.dataPush(oneFloor, t);
                }
            });
            //创建组件
            oneFloor[0] && self.createComponent(oneFloor, o, 'two-trees');
        });
        self.modalInit();
    }


    /**
     * 生成multi的title
     * @param element
     * @param parentElement
     * @param style 类
     */
    private titleAppend(element: resDataPara, style: string, parentElement?: resDataPara) {
        let parentId = parentElement && parentElement.ELEMENTTYPEID;
        if (parentElement && parentId === 1 || parentId === 2) {
            this.createComponent([{
                text: element.ELEMENTNAME,
                value: element.ELEMENTID
            }], element, 'two-trees');
        } else {
            //title
            let title = <h5 className={style}>{element.ELEMENTNAME}</h5>;
            element.MEMO && title.setAttribute('title', element.MEMO);
            this.Dom.appendChild(title);
        }

    }

    /**
     * 获取数据集
     * @param arr
     * @param element
     */
    private dataPush(arr: ListItem[], element: resDataPara) {
        arr.push({
            value: element.ELEMENTID,
            text: element.ELEMENTNAME
        })
    }

    /**
     * 生成selectBox或dropDown
     * @param data
     * @param resData
     * @param style
     */
    private createComponent(data: ListItem[], resData: resDataPara, style: string) {
        //生成selectBox
        if (resData.ELEMENTTYPEID === 1) {
            let dropDom = <div className={style}></div>;
            this.Dom.appendChild(dropDom);
            this.component[resData.ELEMENTID] = new SelectBox({
                select: {
                    multi: false,
                    isRadioNotchecked: resData.REQUIRED === 0,
                    callback: function () {
                        // console.log(resData)
                    }
                },
                container: dropDom,
                data: data,
            });

            //生成dropDown
        } else {
            this.component[resData.ELEMENTID] = new DropDown({
                el: this.Dom,
                data: data,
                multi: true,
                inline: true,
                className: style,
                onMultiSelect: function () {
                    // console.log(12)
                }
            });
        }

    }

}
