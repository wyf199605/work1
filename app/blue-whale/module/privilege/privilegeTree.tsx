/// <amd-module name="PrivilegeTree"/>
import {Tree} from "../../../global/components/navigation/tree/Tree";

interface IPrivilegeTreePara {
    cols : COL[],
    data : ICheckPara[]
}
interface ICheckPara{
    TEXT : string,
    ELEMENTID : string
    PARENTID? : string
    CHILDREN? : ICheckPara[]
    CHECKED? : boolean
}
export class PrivilegeTree {
    private len : number;
    constructor(para : IPrivilegeTreePara){
        this.len = para.cols.length;
    }

    private tHead(cols : COL[]){
        return <table className="privilege-table">
            <thead>
            <tr>
                {
                    cols.forEach(obj => {
                        return <th>{obj.title}</th>
                    })
                }
            </tr>
            </thead>
        </table>
    }

    private tBody(data : ICheckPara[]){
        let tBodyCreate = (obj) => {
            Array.isArray(obj) && obj.forEach((f, i) => {
                let child = f.CHILDREN,
                    tbody = <tbody></tbody>,
                    len = child && child.length,
                    td = <td rowSpan={len} data-name={f.ELEMENTID}>
                        {this.checkBox(f, (e) => {
                            let allCheck = d.queryAll('input', tbody),
                                checked = e.target.checked;

                            allCheck.forEach((obj: HTMLInputElement) => {
                                obj.checked = checked === true;
                            })
                        })}
                    </td>;
                if (Array.isArray(child)) {
                    child.forEach(m => {
                        let tr = <tr></tr>,
                            cTd = <td data-name={m.ELEMENTID}>
                            </td>;

                    });
                } else {
                    let tr = <tr></tr>;
                    d.append(tr, td);
                    d.append(tbody, tr)
                }

            })
        };
        tBodyCreate(data);

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