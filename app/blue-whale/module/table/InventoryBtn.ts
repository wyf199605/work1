/// <amd-module name="BwInventoryBtnFun"/>
import {ITextInputPara} from "../../../global/components/form/text/TextInput";
import {BwTableModule} from "./BwTableModule";
import {Button} from "../../../global/components/general/button/Button";
import d = G.d;
import CONF = BW.CONF;
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import Shell = G.Shell;
import {EpcList, RfidBingModal} from "../../pages/rfid/RfidBing/RfidBing";
import sys = BW.sys;
import Ajax = G.Ajax;

interface IInventoryBtnPara extends ITextInputPara {
    bwTable: BwTableModule
}

export function InventoryBtn(btn: Button, bwTable: BwTableModule,) {
    let rBtn: R_Button = btn.data;
    let session;
    if (rBtn.openType === 'rfid_down') {
        //盘点下载
        //获取下载地址
        let uploadUrl: string = "";
        bwTable.ui.subButtons.forEach((value, index) => {
            if (value.openType == "rfid_up") {
                uploadUrl = value.actionAddr.dataAddr;
            }
        })
        console.log(uploadUrl);
        down(rBtn.actionAddr.dataAddr + "", uploadUrl + "", btn, bwTable).then(function () {
            bwTable.rfidDownAndUpInitHead();
            btn.isDisabled = false;
            //bwTable.rfidColthead(true,700);
            btn.content = btn.content.replace(/下载/g, "更新");

        });
    } else if (rBtn.openType === 'rfid_up') {
        up(rBtn.actionAddr.dataAddr, bwTable);

        //btn.content = btn.content.replace(/上传/g,"更新");
    } else if (rBtn.openType === 'rfid_begin' || rBtn.openType === 'rfid_stop') {
        //开始盘点
        start(rBtn.openType, btn, bwTable);
        //检索数据中FIELD是行数

    } else if (rBtn.openType === 'rfid_find' || rBtn.openType === 'rfid_nofind') {
        //开始扫货
        search(rBtn.openType, btn, bwTable);
    } else if (rBtn.openType === 'rfid_import') {
        sys.window.open({
            url: tools.url.addObj(CONF.siteUrl + rBtn.actionAddr.dataAddr, {
                param1: JSON.stringify(bwTable.ajaxData)
            })
        });

    }


}

//数据实时更新方法
export function ontimeRefresh(invenData: obj[], bwTable: BwTableModule, rfidCol: obj) {
    let ftable = bwTable.ftable,
        tableData = ftable.data,
        tableKeyData: objOf<{ rowData: obj, index: number }> = {},
        classifyField = rfidCol.classify.toUpperCase(),
        scanamountField = rfidCol.amount.toUpperCase();

    tableData.forEach((rowData, i) => {
        tableKeyData[rowData[classifyField]] = {
            rowData: rowData,
            index: i
        };
    });


    // let iii = 0;
    for (let data of invenData) {

        let tempRow = tableKeyData[data.field];
        if (tools.isEmpty(tempRow)) {
            continue;
        }
        let {rowData, index} = tempRow,
            row = ftable.rowGet(index);
        rowData[scanamountField] = data.count;

        if (rfidCol.ruleFields) {
            for (let val of rfidCol.ruleFields) {
                // debugger;
                let diffValue = tools.str.parseTpl(val.amountRule.toUpperCase(), rowData);
                rowData[val.amountField.toUpperCase()] = tools.calc(diffValue);
                row.data = rowData;
            }
        } else {
            row.data = rowData;
        }


    }
}

let sessionInve;

function start(content: string, btn: Button, bwTable: BwTableModule) {
    let invenData;
    if (content === 'rfid_begin') {
        let rfidCol = bwTable.ui.rfidCols;
        let when = rfidCol.calc.when;
        //判断rfidCol 如果为空 就直接退出；
        if (G.tools.isEmpty(rfidCol)) {
            return;
        }
        btn.content = '结束扫描';
        btn.data.openType = 'rfid_stop';

        sessionInve = setInterval(() => {
            Ajax.fetch(CONF.ajaxUrl.rfidLoginTime)
        }, 9 * 60 * 1000);

        if (rfidCol.classify) {
            G.Shell.inventory.startCheck({
                "memSearch": "S1",
                "memTime": "20",
                "field": rfidCol.classify.toUpperCase()
            }, function (res) {
                invenData = res.data;

                ontimeRefresh(invenData, bwTable, rfidCol);
                // bwTable.rfidColStatistics();
            });

            bwTable.rfidColthead();
        }


    } else {
        let rfidCol = bwTable.ui.rfidCols;
        G.Shell.inventory.stopCheck({}, function (res) {
            Modal.alert("结束扫描");
        });
        btn.content = '开始';
        btn.data.openType = 'rfid_begin';
        //close

        Shell.inventory.columnCountOff({}, 1, rfidCol.inventoryKey, (res) => {
        });
        clearInterval(sessionInve);
    }


}

function up(url: string, bwTable: BwTableModule) {
    let inventoryKey = "";
    bwTable.ui.subButtons.forEach((value, index, array) => {
        if (value.openType == "rfid_up") {
            inventoryKey = value.inventoryKey;
        }
    });
    if (inventoryKey) {
        G.Shell.inventory.uploadData(tools.url.addObj(CONF.siteUrl + url, bwTable.ajaxData), inventoryKey, function (res) {
            // alert(JSON.stringify(res));
        })
    }

}

function down(url: string, uploadUrl: string, btn: Button, bwTable: BwTableModule) {
    let uploadUrl1 = tools.url.addObj(CONF.siteUrl + uploadUrl, bwTable.ajaxData);
    let url1 = tools.url.addObj(CONF.siteUrl + url, bwTable.ajaxData);

    return new Promise((resolve => {
        btn.isDisabled = true;
        let inVen,
            inventoryKey = "";
        bwTable.ui.subButtons.forEach((value, index) => {
            if (value.openType == "rfid_down") {
                inventoryKey = value.inventoryKey;
            }
        });
        if (inventoryKey) {
            inVen = G.Shell.inventory.loadData(url1, uploadUrl1, inventoryKey, function (res) {
                // alert('盘点信息:' + JSON.stringify(res));
                resolve();

            });
            if(!inVen){
                btn.isDisabled = false;
            }

        }

    }))
}

function search(openType: string, btn: Button, bwTable: BwTableModule) {
    let ftable = bwTable.ftable,
        rfidCol = bwTable.ui.rfidCols,
        epcs = ftable.columnGet(rfidCol.searchField.toUpperCase()).data;

    if (G.tools.isEmpty(epcs)) {
        Modal.alert('无EPC码数据');
    } else {
        //测试
        if (openType === 'rfid_find') {

            Shell.inventory.findGoods(epcs, function (res) {
                //实时渲染扫描状态
                let resData = res.data,
                    wifiStrength = ['无信号', '弱', '中', '强', '超强'];
                // 页面上的epc 和 陈乾的数据 两个EPC 相同 就渲染该行的 是否扫描 和 信号强号强弱
                for (let row of ftable.rows) {
                    let data = row.data;
                    for (let val of resData) {
                        if (data[rfidCol.searchField.toUpperCase()] === val.epc) {
                            data[rfidCol.amount.toUpperCase()] = val.isScan;
                            data[rfidCol.wifiField.toUpperCase()] = wifiStrength[val.strength];
                            row.data = data;
                            break;
                        }
                    }
                }
            });
            btn.content = '停止找货';
            btn.data.openType = 'rfid_nofind';
        } else {

            Shell.inventory.stopFind({}, function (res) {
                Modal.alert('停止找货');
            });
            btn.content = '开始找货';
            btn.data.openType = 'rfid_find';
        }
    }


}
