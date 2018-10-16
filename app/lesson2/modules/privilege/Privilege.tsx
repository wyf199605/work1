/// <amd-module name="Privilege"/>
import d = G.d;
import {LeBasicPage} from "../../pages/LeBasicPage";
import {LeRule} from "../../common/rule/LeRule";
import SPA = G.SPA;
import {Button} from "../../../global/components/general/button/Button";
interface IPrivilegeModalPara {
    title : string
    caption? : string
}
interface ICheckPara{
    TEXT : string,
    ELEMENTID : string
    PARENTID? : string
    CHILDREN? : ICheckPara[]
    CHECKED? : boolean
}
interface IAjaxDataPara {
    role_name : string;
    role_id : string;
}

export class PrivilegeModal extends LeBasicPage{
    init(){}

    protected modalParaGet(){
        return {
            header: {
                title: '权限管理'
            },
            width : '800px',
            body : new Privilege().init(this.para),
            className : 'lesson-modal',
        }
    }
}

export class Privilege {
    private tableEl : HTMLElement;
    private inputEl : HTMLInputElement;
    private p : obj;
    private ajaxData : IAjaxDataPara;
    init(para) : HTMLElement {
        this.p = para;
        this.requestData();
        return <div>
            <div className="privilege-header">
                <div className="set">角色名称: &nbsp;&nbsp;
                    {this.inputEl = <input disabled placeholder="角色名称" className="default"  type="text"></input>}
                </div>
            </div>
            {this.tableEl = <table className="privilege-table">
                <thead>
                <tr>
                    <th>模块</th>
                    <th>菜单</th>
                    <th>备注</th>
                </tr>
                </thead>
            </table>}
            <div className="privilege-footer">
                <div>
                    <Button content="取消" size="large" onClick={() => {
                        SPA.close();
                    }}/>
                    <Button content="保存" size="large" type="primary" onClick={() => {
                        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.privilegeSave,{
                            type : 'post',
                            data : JSON.stringify(this.getData()),
                            dataType : 'json',
                        }).then(({response}) => {
                            console.log(response);
                        });
                        SPA.close();
                    }}/>
                </div>
            </div>

        </div>;
    }

    requestData(){
        this.ajaxData = JSON.parse(this.p.ajaxData);
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.privilege,{
            type : 'get',
            data : this.ajaxData,
            dataType : 'json',
        }).then(({response}) => {
            let data : ICheckPara[] = response && response.data;

            // 树形表格生成
            Array.isArray(data) && data.forEach((l: ICheckPara) => {
                let tbody = <tbody></tbody>,
                    lChild = l.CHILDREN,
                    lLen = lChild && lChild.length,
                    firstTd = <td rowSpan={lLen} data-name="first">
                        {this.checkBox(l, (e) => {
                            let allCheck = d.queryAll('input', tbody),
                                checked = e.target.checked;

                            allCheck.forEach((obj: HTMLInputElement) => {
                                obj.checked = checked === true;
                            })
                        })}
                    </td>;

                    if(Array.isArray(lChild)){
                        lChild.forEach((m: ICheckPara, index) => {
                            let tr = <tr></tr>,
                                secondTd = <td data-name="second">
                                    {this.checkBox(m, (e) => {
                                        let input = e.target,
                                            parent = d.query('[data-name="first"] input', tbody) as HTMLInputElement,
                                            thisLevel = d.queryAll(`[data-name="second"] input`, tbody),
                                            children = d.queryAll('[data-name="third"] input', tr);

                                        if (input.checked) {
                                            parent.checked = true;
                                            children.forEach((obj: HTMLInputElement) => {
                                                obj.checked = true;
                                            })
                                        } else {
                                            let isNotCheck = true;
                                            thisLevel.forEach((obj: HTMLInputElement) => {
                                                if (obj.checked) {
                                                    isNotCheck = false;
                                                }
                                            });
                                            if (isNotCheck && parent) {
                                                parent.checked = false;
                                            }

                                            children.forEach((obj: HTMLInputElement) => {
                                                obj.checked = false;
                                            })
                                        }
                                    })}
                                </td>,
                                thirdTd = <td data-name="third"></td>;

                            if (index === 0) {
                                d.append(tr, firstTd);
                            }
                            d.append(tr, secondTd);

                            Array.isArray(m.CHILDREN) && m.CHILDREN.forEach((n: ICheckPara) => {
                                d.append(thirdTd, this.checkBox(n, (e) => {
                                    let firstParent = d.query('[data-name="first"] input', tbody) as HTMLInputElement,
                                        parent = d.query('[data-name="second"] input', tr) as HTMLInputElement;

                                    if(e.target.checked){
                                        parent.checked = true;
                                        firstParent.checked = true;
                                    }
                                }))
                            });
                            d.append(tr, thirdTd);
                            d.append(tbody, tr);
                        });
                    }else {
                        let tr = <tr></tr>;
                        d.append(tr, firstTd);
                        d.append(tbody, tr)
                    }

                d.append(this.tableEl, tbody);
            });

            this.inputEl.value = this.ajaxData.role_name || '';
        })
    }

    getData(){
        let allCheck = d.queryAll('input', this.tableEl),
            ids = [];

        allCheck.forEach((input : HTMLInputElement) => {
            if(input.checked){
                ids.push(input.dataset.id);
            }
        });

        return {
            role_id : this.ajaxData.role_id,
            priv_id : ids
        };
    }

    private checkBox(data : ICheckPara, click){
        let input : HTMLInputElement,
            id = 'CHECKBOXID_' + G.tools.getGuid(),
            checkbox = <div>
            {input = <input data-id={data.ELEMENTID} data-parent-id={data.PARENTID} type="checkbox" className="normal" id={id}></input>}
            <label htmlFor={id}>{data.TEXT}</label>
        </div>;

        if(data.CHECKED){
            input.checked = true;
        }
        d.on(input, 'click', click);
        return checkbox;
    }
}