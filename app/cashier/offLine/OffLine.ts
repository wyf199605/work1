/// <amd-module name="OffLine"/>
import {CashierRequest} from "../request/CashierRequest";
import {Modal} from "../global/components/feedback/modal/Modal";
import {BwWebsocket} from "../global/utils/websocket";
import {Com} from "../com";
import Shell = C.Shell;
import tools = C.tools;

/**
 * 离线操作，首次登陆要确保网络连接正常并下载后台数据posdata（存储在sqlLite中）和posVer（存储在localstorage）
 */
export class OffLine{
    private endPosData : boolean = false;
    private endPosVer : boolean = false;
    private url = {
        frontFile : '/pos/frontFile/',
        data : '/pos/data/'
    };

    init(){
        this.upLoadData().then(() => {
            this.websocket();
        });
    }


    upLoadData(){
        return new Promise((resolve, reject) => {
            // TODO 获取离线数据

            resolve();
        })
    }


    /**
     * 开启websocket
     */
    private websocket(){
        // console.log( 'wss:' + Com.urlSite.match(/\/\/(\S*)\//)[0] + 'cashier/pos/websocket/',JSON.stringify(this.confGet()))
        new BwWebsocket({
            url : 'wss:' + Com.urlSite.match(/\/\/(\S*)\//)[0] + 'cashier/pos/websocket/',
            sendData : JSON.stringify(this.confGet()),
            onMessage : r => {
                let data = JSON.parse(r && r.data);
                switch (data.respType){
                    case 'posver':
                        this.posVer(data);
                        break;
                    case 'posdata':
                        this.posData(data);
                        break;
                }
            }
        });
    }


    /**
     * 1.从shell获取离线数据传
     * 2.从本地提取配置信息
     */
    private confGet(){
        // 获取配置信息
        let verData : ISceneVerPara = Com.local.getItem('sceneVersion'),
            id, ver, instance = [], table = [];
        if(C.tools.isNotEmpty(verData)){
            let panel = verData.panel;
            panel && panel.forEach(obj => {
                instance.push(obj[0]);
            });

            // table = Shell.sqlite('');// TODO 从shell获取
            id = verData.sceneId;
            ver = verData.version;
        }

        let data : IOffLinePara = {
            scene : Com.local.getItem('printerConf').scenes, // 场景
            instance : instance,
            table : table,
            uuid : CA.Config.UUID
        };
        id && (data['sceneId'] = id);
        ver && (data['version'] = ver);
        return {
            reqType: "posver",
            data : data
        };
    }

    /**
     * H5传递数据给shell，shell创建表
     * upType : 0不处理 1删除表 2删除数据
     */
    private posData(addr){
        console.log(addr,'posData');
        if(!addr.data || !addr.data.dataAddr){
            return
        }


        CashierRequest(addr.data,{
            dataType: 'json'
        }).then(({response}) => {
            let dataArr = response.dataArr,
                index = 0;

            let sqlLite = () => {
                let data : ICreateTablePara = dataArr && dataArr[index];
                if(!data){
                    Modal.alert('over');
                    this.endPosData = true;
                    this.resolve();
                    return;
                }
                index ++;
                let tableName = data.tableName,
                    meta = data.meta;

                switch (data.uptype){
                    case 1:
                        Com.sql.dropTable(tableName).then((e) => {

                        });
                        // Com.sql.selectData(tableName).then((e) => {
                        //     Modal.alert(e)
                        // })
                        break;
                    case 2:
                        Com.sql.deleteData(tableName).then((e) => {
                            // alert('删除数据')
                            // Modal.alert(e )
                        });
                        break;
                }

                if(tools.isNotEmpty(data.sql)){
                    Com.sql.run(data.sql).then((e) => {
                        // Modal.alert(e)
                    });
                }

                // 构造sql语句
                let list = data.dataList,
                    listLen = list.length - 1;
                if(Array.isArray(list)){
                    list.forEach((obj, i) => {
                        Com.sql.insertData(tableName, meta, obj).then((e) => {
                            if(i === listLen){
                                sqlLite();
                            }
                        });
                    });
                }else {
                    sqlLite();
                }
                Com.sql.selectData(data.tableName).then((e) => {
                    // Modal.alert(e)
                })
            };
            sqlLite();
        });
    }

    /**
     * 版本请求，存储版本信息及ui数据，panel,item,(cond权限判断)
     */
    private posVer(addr){
        console.log(addr,'posVer');
        if(!addr.data || !addr.data.dataAddr){
            return
        }

        CashierRequest(addr.data).then(({response}) => {
            // console.log(response,'setScene');
            Com.local.setItem('sceneVersion', response);
            this.endPosVer = true;
            this.resolve();
        });
    }

    private resolve(){
        if(this.endPosData && this.endPosVer){
            this.endPosData = false;
            this.endPosVer = false;
            window.localStorage.setItem('hasOffLineData', "true");
        }
    }

}