/// <amd-module name="ProductScriptModule"/>

import {Button} from "global/components/general/button/Button";
import {QueryDevicePage} from "../../page/design/QueryDevicePage";
import {DVAjax} from "../util/DVAjax";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {TextInput} from "../../../global/components/form/text/text";
import {MountMenuModal} from "../mountMenu/MountMenu";
import IComponentPara = G.IComponentPara;
import Component = G.Component;

let d = G.d;
let tools = G.tools;

interface IProductScriptModulePara extends IComponentPara {

}

export class ProductScriptModule extends Component {
    protected wrapperInit(): HTMLElement {
        return d.create(`
        <div class="productScript hide">
              <div class="buttons"></div>
        </div>
        `);
    }


    private init(para: IProductScriptModulePara) {
        this.initButtons();
        this.isSave = false;
    }

    private _isSave: boolean;
    set isSave(save: boolean) {
        this._isSave = save;
    }

    get isSave() {
        return this._isSave;
    }

    private initButtons() {
        let saveBtn = new Button({
            content: '保存',
            icon: 'de-baocunchenggong',
            iconPre: 'dev',
            container: d.query('.buttons', this.wrapper),
            className: 'save',
            onClick: (e) => {
                let newItem = this.handlerDataToItem();
                let para = {type: 'list'};
                if (tools.isNotEmpty(QueryDevicePage.itemId)) {
                    para['update'] = [newItem];
                } else {
                    para['insert'] = [newItem];
                }
                // 新增/修改item
                DVAjax.itemAddAndUpdateAjax((res) => {
                    Modal.toast(res.msg);
                    this.isSave = true;
                    QueryDevicePage.itemId = res.data.itemId;
                }, {type: 'POST', data: para});
            }
        });
        let previewBtn = new Button({
            content: '预览',
            icon: 'de-yulan',
            iconPre: 'dev',
            container: d.query('.buttons', this.wrapper),
            className: 'preview',
            onClick: (e) => {
                let itemId = QueryDevicePage.itemId;
                if (this.isSave || itemId) {
                    DVAjax.itemInterface(itemId, (res) => {
                        if (res.errorCode === 0) {
                            let body = d.create('<div class="inputModal"></div>'),
                                loginUrl = res.data.sso.loginUrl,
                                nodeId = res.data.nodeId,
                                userInput = new TextInput({
                                    container: body,
                                    className: 'userInput'
                                });
                            let m = new Modal({
                                header: '请输入预览登录用户名',
                                body: body,
                                footer: {},
                                isOnceDestroy: true,
                                onOk: () => {
                                    let userId = userInput.get().replace(/\s+/g, '');
                                    if (tools.isEmpty(userId)) {
                                        Modal.alert('登录用户名不能为空!');
                                    } else {
                                        let url = tools.url.addObj(loginUrl, {
                                            userid: userId.toUpperCase(),
                                            forwardurl: 'commonui/pageroute?page=static%2Fmain'
                                        });
                                        url = url + `#page=/ui/select/${nodeId}`;
                                        window.open(url);
                                        m.destroy();
                                    }
                                },
                                onCancel: () => {
                                    m.destroy();
                                }
                            })
                        }
                    },(error)=>{
                        let errorRes = JSON.parse(error.xhr.responseText);
                        let itemObj = this.handlerDataToItem(),
                            itemCaption = itemObj.sysItemList.captionSql;
                        Modal.confirm({
                            msg:errorRes.msg,
                            title:'预览提示',
                            btns:['取消预览','挂载菜单'],
                            callback:(flag)=>{
                                if (flag){
                                    new MountMenuModal(itemId,itemCaption);
                                }
                            }
                        })
                    })
                } else {
                    Modal.alert('请先保存当前数据！');
                }
            }
        })
    }

    private handlerDataToItem(): obj {
        let item = {
            sysItemList: {
                queryType: 0,
                queryCount: 0,
                editExpress: '',
                selectSql: '',
                updateSql: '',
                insertSql: '',
                deleteSql: '',
                noshowFields: '',
                multiPageFlag: 1,
                subselectSql: '',
                showCheckbox: 0,
                itemId: '',
                itemType: 'list',
                captionSql: '',
                dataSource: '',
                baseTable: '',
                keyField: '',
                nameField: '',
                settingId: 7502,
                pause: 0
            },
            sysItemElementRela: [],
            sysCondRela: []
        };
        let itemId = tools.isNotEmpty(QueryDevicePage.itemId) ? QueryDevicePage.itemId : '';
        for (let key in QueryDevicePage._allQDData[0]) {
            if (item.sysItemList.hasOwnProperty(key)) {
                item.sysItemList[key] = QueryDevicePage._allQDData[0][key];
            }
        }
        for (let key in QueryDevicePage._allQDData[1]) {
            if (item.sysItemList.hasOwnProperty(key)) {
                item.sysItemList[key] = QueryDevicePage._allQDData[1][key];
            }
        }


        let obj = QueryDevicePage._allQDData[1]['cond'],
            condIndex = 1;
        for (let key in obj) {
            let arr = obj[key];
            let ctlType = 0;
            if (key === 'back') {
                ctlType = 1;
            }
            if (tools.isNotEmpty(arr)) {
                arr.forEach((cond) => {
                    let obj = {
                        condId: cond.condId,
                        objType: 14,
                        ctlId: itemId,
                        ctlType: ctlType,
                        seqNo: condIndex,
                        pause: 0
                    };
                    item.sysCondRela.push(obj);
                    condIndex += 1;
                })
            }
        }

        let elementIndex = 1;
        for (let key in QueryDevicePage._allQDData[2]) {
            let arr = QueryDevicePage._allQDData[2][key];
            if (tools.isNotEmpty(arr)) {
                arr.forEach((element) => {
                    let obj = {
                        itemId: itemId,
                        seqNo: elementIndex,
                        elementId: element.elementId,
                        pause: 0
                    };
                    item.sysItemElementRela.push(obj);
                    elementIndex += 1;
                })
            }
        }
        return item;
    }


    private _isShow: Boolean;
    set isShow(isShow) {
        this._isShow = isShow;
        if (this._isShow) {
            this.wrapper.classList.add('show');
            this.wrapper.classList.remove('hide');
        } else {
            this.wrapper.classList.remove('show');
            this.wrapper.classList.add('hide');
        }
    }

    constructor(para: IProductScriptModulePara) {
        super(para);
        if (tools.isEmpty(para)) {
            para = {};
        }
        this.init(para);
    }
}