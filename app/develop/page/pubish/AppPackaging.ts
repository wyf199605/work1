/// <amd-module name="AppPackaging"/>
import SPAPage = G.SPAPage;
import d = G.d;
import {DVAjax} from "../../module/util/DVAjax";
import {FastTable, IFastTableCol} from "../../../global/components/newTable/FastTable";
import config = DV.CONF;
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {TextInputModule} from "../../module/textInput/TextInputModule";
import {Datetime} from "../../../global/components/form/datetime/datetime";
import {Modal} from "../../../global/components/feedback/modal/Modal";

export class AppPackaging extends SPAPage {
    set title(title: string) {
        this._title = title;
    }

    get title() {
        return this._title;
    }

    protected wrapperInit(): Node {
        return d.create(`<div class="app-packaging">
            <div class="conditions"></div>
            <div class="table"></div>
            <div class="publish-btn"></div>
</div>`);
    }

    protected init(para: Primitive[], data?) {
        this.title = "应用打包";

        this.initConditions();
        this.initTable();

        new Button({
            content: '生成脚本并打包',
            container: d.query('.publish-btn', this.wrapper),
            onClick: () => {
                let selectRows = this.table.selectedRows;
                if (selectRows.length <= 0) {
                    Modal.alert('请先选择一条数据!');
                } else {
                    let dmlLogId: string[] = [];
                    selectRows.forEach((row) => {
                        dmlLogId.push(row.cells[0].text);
                    });
                    DVAjax.packaing(dmlLogId);
                    this.clearAjaxData();
                }
            }
        })
    }

    private clearAjaxData() {
        let cond = this.conditions;
        cond['resourceType'].set('');
        cond['appId'].set('');
        cond['dmlOperatorId'].set('');
        cond['dmlTime'].set('');
        this.getAllconditionsData();
    }

    private conditions: obj;

    private initConditions() {
        let inputData = [
            {
                title: '类型',
                id: 'resourceType'
            },
            {
                title: '应用ID',
                id: 'appId'
            },
            {
                title: '操作用户',
                id: 'dmlOperatorId'
            }
        ];
        this.conditions = {
            resourceType: '',
            appId: '',
            dmlOperatorId: '',
            dmlTime: ''
        };
        let container = d.query('.conditions', this.wrapper);
        for (let i = 0; i < inputData.length; i++) {
            let module = new TextInputModule({
                container: container,
                title: inputData[i].title
            });
            module.textInput.on('blur', (e) => {
                this.getAllconditionsData();
            });
            this.conditions[inputData[i].id] = module;
        }
        container.appendChild(d.create('<div class="time"' +
            '><label>操作时间:</label></div>'));
        let currentTime = new Date().getTime(),
            maxDate = new Date(currentTime + 24 * 60 * 60);
        let dmlTime = new Datetime({
            isRange: true,
            container: d.query('.time', container),
            format: 'Y-M-d H:m:s',
            onClose: () => {
                this.getAllconditionsData();
            },
            maxDate: maxDate
        });
        d.query('.time', container).appendChild(d.create('<div class="clear"></div>'));
        this.conditions['dmlTime'] = dmlTime;
    }

    private getAllconditionsData() {
        let cond = this.conditions,
            resourceType = cond['resourceType'].get(),
            appId = cond['appId'].get(),
            dmlOperatorId = cond['dmlOperatorId'].get(),
            dmlTime = cond['dmlTime'].get(),
            timeData = [];
        if (dmlTime.indexOf(' 至 ') !== -1) {
            let timeArr = dmlTime.split(' 至 '),
                time1 = timeArr[0],
                time2 = timeArr[1];
            timeData.push(time1, time2);
        }
        let paraObj = {
            resource_type: resourceType,
            dml_time: timeData,
            dml_operator_id: dmlOperatorId,
            app_id: appId
        };
        this.tableAjaxPara = paraObj;
    }

    private _tableCols: IFastTableCol[];
    get tableCols() {
        if (!this._tableCols) {
            this._tableCols = [
                {name: 'dmlLogId', title: '日志ID'},
                {name: 'appId', title: '应用ID'},
                {name: 'dmlOperatorId', title: '操作用户'},
                {name: 'dmlTime', title: '时间'},
                {name: 'resourceType', title: '类型'},
                {name: 'dmlSql', title: 'DML语句'},
                {name: 'exportflag', title: '是否已经导出'}
            ]
        }
        return this._tableCols;
    }

    private table: FastTable;

    private initTable() {
        this.table = new FastTable({
            container: d.query('.table', this.wrapper),
            cols: [this.tableCols],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = config.ajaxUrl.dmlsql + '?pageparams=' + queryStr;
                    url = url + this.handlerAjaxPara();
                    return DVAjax.Ajax.fetch(url).then(({response}) => {
                        let data = response.dataArr,
                            total = 0;
                        tools.isNotEmptyArray(data) && data.map((row) => {
                            row.exportflag = row.exportflag === 0 ? '否' : '是';
                        });
                        tools.isNotEmptyArray(data) && (total = response.head.total);
                        return {data: data, total: total};
                    })
                },
                auto: true,
                once: false
            },
            page: {
                size: 50,
                options: [50, 100]
            }
        });
    }

    private _tableAjaxPara: obj;
    set tableAjaxPara(para: obj) {
        this._tableAjaxPara = para;
        this.table && this.table._clearAllSelectedCells();
        this.table && this.table.tableData.refresh();
    }

    get tableAjaxPara() {
        if (!this._tableAjaxPara) {
            this._tableAjaxPara = {
                resource_type: '',
                dml_time: [],
                dml_operator_id: '',
                app_id: ''
            }
        }
        return this._tableAjaxPara;
    }

    private handlerAjaxPara(): string {
        let str = '&fuzzyparams={',
            paraStr = '';
        for (let key in this.tableAjaxPara) {
            if (tools.isNotEmpty(this.tableAjaxPara[key])) {
                if (key === 'dml_time') {
                    let timeData = this.tableAjaxPara[key];
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(timeData) ? '"' + timeData[0] + ',' + timeData[1] + '"' : '""') + ',';
                } else {
                    let data = this.tableAjaxPara[key];
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(data) ? '"' + data + '"' : '""') + ',';
                }
            }
        }
        if (tools.isNotEmpty(paraStr)) {
            paraStr = paraStr.slice(0, paraStr.length - 1);
            str = str + paraStr + '}';
            return encodeURI(str);
        } else {
            return '';
        }
    }
}