/// <amd-module name="ReportCardModal"/>
/// <amd-dependency path="echarts" name="echarts"/>
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Button} from "../../../global/components/general/button/Button";
import tools = G.tools;
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {LeRule} from "../../common/rule/LeRule";
import d = G.d;
import {Utils} from "../../common/utils";
import {QrCode} from "../../../global/utils/QRCode";
import {LeBasicPage} from "../../pages/LeBasicPage";

declare const echarts;

interface IReportCardModalPara extends IComponentPara {
    name?: string  // report.成绩单  modal.学生模型详情 warning.预警单
    title?: string
    onChange?: Function
    ajaxData?: string
}

interface IBaseDataPara {
    NAME: string;
    COLLEGE: string;
    STUDENTID: string;
    MAJOR: string;
    PICTURE: string;
}


export class ReportCardModal extends LeBasicPage {
    init() {
    }

    domReady = function () {
        if (this.para.name === 'warning') {
            return;
        }

        let width = window.getComputedStyle(d.query('.report-imgs', this.body)).width,
            widthNum = parseInt(width.substr(0, width.length - 2));
        d.query('.report-imgs', this.body).style.height = (widthNum * 0.25) + 'px';
    };

    protected modalParaGet() {
        this.para.name = this.cardType();
        this.para.title = this.cardTitle();
        let reportCard = new ReportCard(this.para);
        let btn = new Button({
            className: 'print',
            content: '打印',
            onClick: () => {
                let image = new Image(),
                    canvas = d.query('.canvasInner canvas', this.modal.bodyWrapper) as HTMLCanvasElement,
                    win = window.open('', '打印');

                image.src = canvas.toDataURL("image/png"); // canvas转img
                image.onload = () => {
                    let img = <img width="306" height="200" src={image.src} alt=""/>;
                    d.append(canvas.parentElement, img);
                    canvas.classList.add('hide');

                    let printHtml = document.head.innerHTML + '<div class="report-card print-card">' +
                        this.modal.bodyWrapper.innerHTML + '</div>';

                    win.document.write(printHtml);
                    img.remove();

                    canvas.classList.remove('hide');
                    setTimeout(function () {
                        win.print();
                        win.close();
                    })
                };
            }
        });
        return {
            header: {
                title: this.para.title,
                rightPanel: btn.wrapper,
                isDrag: false
            },
            body: reportCard.wrapper,
            isShow: true,
            width: '71%',
            className: 'report-card',
            position: 'full',
            isDrag: false
        }
    }

    protected cardType() {
        return '';
    }

    protected cardTitle() {
        return '';
    }
}

export class StuReport extends ReportCardModal {
    protected cardType() {
        return 'report';
    }

    protected cardTitle() {
        return '成绩单';
    }
}

export class StuModal extends ReportCardModal {
    protected cardType() {
        return 'modal';
    }

    protected cardTitle() {
        return '学生成绩模型';
    }
}

export class SutWarning extends ReportCardModal {
    protected cardType() {
        return 'warning';
    }

    protected cardTitle() {
        return '预警单';
    }
}


class ReportCard extends Component {
    private reportTable: ReportTable;
    private ajaxUrl: string;

    protected wrapperInit(para: IReportCardModalPara): HTMLElement {
        let wrapper: HTMLElement;

        switch (para.name) {
            case 'report':
                wrapper = this.reportWrapper(para);
                this.ajaxUrl = LE.CONF.ajaxUrl.schoolReport;
                break;
            case 'modal':
                wrapper = this.modalWrapper();
                this.ajaxUrl = LE.CONF.ajaxUrl.reportModal;
                break;
            case 'warning':
                wrapper = this.warningWrapper(para);
                this.ajaxUrl = LE.CONF.ajaxUrl.earlyWarning;
                break;
        }
        return wrapper;
    }

    private reportWrapper(para) {
        return <div className="reportCardBody">
            <div className="report-header">
                <img src="../../img/lesson2/logo.png" alt=""/>
                <div className="report-title">
                    <div className="lang-ch">第二课堂成绩单</div>
                    <div className="lang-en">Extracurricular Activities Record</div>
                </div>
                <div className="report-card-num" c-var="reportNumber"/>
            </div>
            <div className="report-body">
                <UserInfo name={para.name} ajaxData={para.ajaxData} c-var="userinfo" onChange={(data) => {
                    // 表格数据
                    let tables = d.query('.tables', this.wrapper);
                    tables.innerHTML = '';
                    data.tables.forEach((tableData) => {
                        let table = new ReportTable({
                            container: d.query('.tables', this.wrapper)
                        });
                        table.set(tableData);
                    });
                    this.setCharts(data.diagram);
                    this.innerEl.totalCredit.innerText = tools.isNotEmpty(data.aggreate.ABSBUDGETMONEY) ? data.aggreate.ABSBUDGETMONEY : 0;
                    this.innerEl.ranking.innerText = tools.isNotEmpty(data.aggreate.RANKING) ? data.aggreate.RANKING : 0;
                    this.setQRCode(data.shareLink);
                }}/>
                <div className="tables">

                </div>
                <div className="total">
                    <div>总学分&nbsp;:&nbsp;<span c-var="totalCredit"/></div>
                    <div>在本届学生中排名前&nbsp;:&nbsp;<span c-var="ranking"/></div>
                </div>
                <div className="report-imgs" style={{width: '100%'}}>
                    <div className="img-item qrcode" c-var="qrcode"/>
                    <div className="img-item charts" c-var="charts"/>
                    <div className="img-item signature">
                        <span className="stamp">（签章）</span>
                        <span className="signature-name">闽江学院教务处</span>
                    </div>
                    <div className="img-item signature">
                        <span className="stamp">（签章）</span>
                        <span className="signature-name">共青团闽江学院委员会</span>
                    </div>
                </div>
            </div>
        </div>;
    }

    private modalWrapper() {
        return <div className="reportCardBody">
            <div className="student-header">
                <div>
                    <img width="180" src="../../img/lesson2/logo.png" alt=""/>
                    <div className="student-title">
                        <div className="lang-ch">第二课堂成绩单</div>
                        <div className="lang-en">Extracurricular Activities Record</div>
                    </div>

                </div>
                <div className="flex-layout">
                    <div className="student-modal-left">
                        {/*学生信息*/}
                        <div c-var="userInfo">

                        </div>
                        <div className="stu-total">
                            <img width="114" height="114" src="../../img/lesson2/rank.png" alt=""/>
                            <p c-var="ranking" class="rank"></p>
                            <div className="total-score">总学分：<span c-var="totalCredit"></span></div>
                        </div>
                    </div>
                    <div className="student-modal-right">
                        {/*<img width="120" src="../../img/lesson2/rank.png" alt=""/>*/}
                        <img height="140" width="120" c-var="stuImg" src="" alt=""/>
                        {/*<img src={LeRule.fileUrlGet('c7578331c9f6bc26f0b365f8a344f01f')} alt=""/>*/}
                    </div>
                </div>
            </div>

            <div className="report-body">
                <div className="tables">

                </div>

                <div className="report-imgs" style={{width: '100%'}}>
                    <div className="img-item qrcode" c-var="qrcode"></div>
                    <div className="img-item charts" c-var="charts"></div>
                    <div className="img-item signature stu">
                        <span className="stamp">（签章）</span>
                        <span className="signature-name">共青团闽江学院委员会</span>
                    </div>
                </div>
                <div className="report-card-num" c-var="reportNumber"></div>
            </div>
        </div>;
    }

    private warningWrapper(para) {
        return <div className="reportCardBody">
            <div className="report-header">

            </div>
            <div className="report-body">
                <UserInfo name={para.name} ajaxData={para.ajaxData} c-var="userinfo" onChange={(data) => {
                    this.reportTable.reset(data);
                }}/>
                <div className="tables">

                </div>
            </div>
        </div>;
    }

    constructor(para: IReportCardModalPara) {
        super(para);
        LeRule.Ajax.fetch(this.ajaxUrl, {
            data: JSON.parse(para.ajaxData)
        }).then(({response}) => {
            let base = response.data.base;
            response.data.tables.forEach((tableData) => {
                this.reportTable = new ReportTable({
                    container: d.query('.tables', this.wrapper)
                });
                this.reportTable.set(tableData);
            });
            switch (para.name) {
                case 'report': // 成绩单
                    (this.innerCom.userinfo as UserInfo).set(this.getUserInfoData(base));
                    break;
                case 'modal': // 模型
                    this.stuUserInfo(base.data);
                    break;
                case 'warning': // 预警单
                    (this.innerCom.userinfo as UserInfo).set(this.getUserInfoData(base));
                    return
            }
            this.innerEl.reportNumber.innerText = response.data.base.caption;
            this.innerEl.totalCredit.innerText = tools.isNotEmpty(response.data.aggreate.ABSBUDGETMONEY) ? response.data.aggreate.ABSBUDGETMONEY : 0;
            this.innerEl.ranking.innerText = tools.isNotEmpty(response.data.aggreate.RANKING) ? response.data.aggreate.RANKING : 0;
            this.setQRCode(response.data.shareLink);
            this.setCharts(response.data.diagram);
        })
    }

    private setQRCode(shareLink) {
        this.innerEl.qrcode.innerHTML = '';
        let qrCodeEl = <div class="qrCodeEl"/>;
        this.innerEl.qrcode.appendChild(qrCodeEl);
        QrCode.toCanvas(shareLink, 180, 180, qrCodeEl);
    }

    private setCharts(data) {
        this.innerEl.charts.innerHTML = '';
        let divEl = <div className="canvasInner"/>;
        this.innerEl.charts.appendChild(divEl);
        let myChart = echarts.init(divEl);
        // 指定图表的配置项和数据
        let option = {
            title: {text: ''},
            tooltip: {},
            radar: {
                top: 'middle',
                name: {
                    show: true,
                    textStyle:
                        {fontSize: 12, color: "#33484f"}
                },
                indicator: [
                    {text: '学习能力', max: 1},
                    {text: '心理素质', max: 1},
                    {text: '创新能力', max: 1},
                    {text: '实践能力', max: 1},
                    {text: '组织能力', max: 1}
                ],
            },
            series: [
                {
                    type: 'radar',
                    data: [
                        {
                            value: tools.isEmpty(data) ? [0, 0, 0, 0, 0] : data,
                            name: '学生能力分析'
                        }
                    ]
                }
            ]
        };
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    }

    private stuUserInfo(data: IBaseDataPara) {
        this.innerEl.stuImg.setAttribute('src', LeRule.fileUrlGet(data.PICTURE));
        d.append(this.innerEl.userInfo, <div>
            <p>
                <img src="../../img/lesson2/name.png" alt=""/>
                <span>姓名：{data.NAME}</span>
            </p>
            <p>
                <img src="../../img/lesson2/college.png" alt=""/>
                <span>院系：{data.COLLEGE}</span>
            </p>
            <p>
                <img src="../../img/lesson2/student_id.png" alt=""/>
                <span>学号：{data.STUDENTID}</span>
            </p>
            <p>
                <img src="../../img/lesson2/profession.png" alt=""/>
                <span>专业：{data.MAJOR}</span>
            </p>
        </div>);
    }

    private getUserInfoData(res: obj) {
        let fields = res.sysFieldsList,
            data = res.data,
            userInfo = [];
        fields.forEach(field => {
            let userItem = {};
            if (field.hasOwnProperty('list')) {
                let dropData = Utils.getDropDownList_Obj(field.list.dataList);
                userItem = Object.assign(field, {list: dropData});
            } else {
                for (let key in data) {
                    if (field.field === key) {
                        userItem = Object.assign(field, {value: data[key]});
                        break;
                    }
                }
            }
            userInfo.push(userItem);
        });

        return userInfo;
    }
}

class UserInfo extends Component {
    private p: IReportCardModalPara;

    protected wrapperInit(para: IReportCardModalPara): HTMLElement {
        let userInfoWrapper = <div className="userInfo">

        </div>;
        return userInfoWrapper;
    }

    constructor(para: IReportCardModalPara) {
        super(para);
        this.p = para;
    }

    set(userInfo: obj[]) {
        userInfo.forEach(userItem => {
            if (userItem.hasOwnProperty('list')) {
                let list = null;
                this.wrapper.appendChild(<div className="item">
                    <div className="caption">{userItem.caption + ' : '}</div>
                    {list = <SelectInput className="grade-input" dropClassName="report-list" data={userItem.list} arrowIconPre="sec"
                                         arrowIcon="seclesson-xiala" onSet={(item, index) => {

                        d.query('input',list.wrapper).setAttribute('value', item.text);
                        if (this.p.name === 'warning') {
                            let dropData = list.getData();
                            if (dropData.indexOf(item.value) === dropData.length - 1) {
                                index = 0;
                            } else {
                                index = index + 1;
                            }
                            if (this.p.onChange) {
                                LeRule.Ajax.fetch(LE.CONF.ajaxUrl.earlyWarning, {
                                    data: {
                                        student_id: JSON.parse(this.p.ajaxData).student_id,
                                        schoolyear: index
                                    },
                                    dataType: 'json'
                                }).then(({response}) => {
                                    this.p.onChange(response.data);
                                })
                            }
                        } else if (this.p.name === 'report') {
                            let query_value = item.value;
                            if (this.p.onChange) {
                                LeRule.Ajax.fetch(LE.CONF.ajaxUrl.gradeList, {
                                    data: {
                                        user_id: JSON.parse(this.p.ajaxData).user_id,
                                        major: query_value
                                    },
                                    dataType: 'json'
                                }).then(({response}) => {
                                    this.p.onChange(response.data);
                                })
                            }
                        }
                    }}/>}
                </div>);

                if(this.p.name === 'warning'){
                    let index = parseInt(userItem.value);
                    if (index === 0) {
                        list.set(userItem.list[userItem.list.length - 1]);
                    } else {
                        list.set(userItem.list[index - 1]);
                    }
                }else if(this.p.name === 'report'){
                    let item = userItem.list.filter((i)=>{return i.value === userItem.value})[0];
                    list.set(item);
                }
            } else {
                this.wrapper.appendChild(<div className="item">
                    <div className="caption">{userItem.caption + ' :'}</div>
                    <div className="value">&nbsp;{userItem.value}</div>
                </div>);
            }
        });
    }
}

class ReportTable extends Component {
    protected wrapperInit(para: IComponentPara): HTMLElement {
        let reportTableWrapper = <div className="report-table">
            <div className="table-title">
                <div c-var="caption" className="caption"/>
                <div c-var="credit" className="credit"/>
            </div>
        </div>;
        return reportTableWrapper;
    }

    constructor(para: IComponentPara) {
        super(para);
    }

    set(tdata: obj) {
        // 标题
        tdata.caption && (this.innerEl.caption.innerText = tdata.caption);
        // 学分
        tdata.countCredit && (this.innerEl.credit.innerText = tdata.countCredit + '学分');
        let tableWrapper = null,
            data = tdata.data,
            fields = tdata.sysFieldsList,
            tHead = null,
            tBody = null;
        if (tools.isNotEmptyArray(data)) {
            tableWrapper = <table>
                {tHead = <thead></thead>}
                {tBody = <tbody></tbody>}
            </table>;
            this.wrapper.appendChild(tableWrapper);
            let trTh = <tr className="table-head"></tr>;
            fields.forEach(th => {
                trTh.appendChild(<th data-name={th.field}>{th.caption}</th>)
            });
            tHead.appendChild(trTh);
            data.forEach(trData => {
                let tr = <tr></tr>;
                for (let key in trData) {
                    tr.appendChild(<td>{trData[key]}</td>)
                }
                tBody.appendChild(tr);
            });
        }

    }

    reset(data) {
        let tBody = d.query('tbody', this.wrapper);
        tBody.innerHTML = null;
        data.forEach(trData => {
            let tr = <tr></tr>;
            for (let key in trData) {
                tr.appendChild(<td>{trData[key]}</td>)
            }
            tBody.appendChild(tr);
        });
    }

    private formatTime(time: number) {
        let date = new Date(time),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            minute = date.getMinutes(),
            seconds = date.getSeconds();
        return `${year}-${month}-${day} ${this.handlerTime(hour)}:${this.handlerTime(minute)}:${this.handlerTime(seconds)}`;
    }

    private handlerTime(num: number) {
        return num < 10 ? '0' + num : num;
    }
}

