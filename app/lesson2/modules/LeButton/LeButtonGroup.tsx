/// <amd-module name="LeButtonGroup"/>
import {Button} from "../../../global/components/general/button/Button";
import Component = G.Component;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {LeRule} from "../../common/rule/LeRule";
import SPA = G.SPA;
import {LeUploadModule} from "../upload/UploadModule";
import CONF = LE.CONF;
import tools = G.tools;

interface ILeButtonGroupPara extends G.IComponentPara{
    buttons: ILE_Button[];
    dataGet?(): obj | obj[]
}
export class LeButtonGroup extends Component{
    private dataGet: () => obj | obj[];
    constructor(props: ILeButtonGroupPara) {
        super(props);
        this.dataGet = props.dataGet;
    }

    protected wrapperInit(para: ILeButtonGroupPara): HTMLElement {
        let buttons = (para.buttons || []).filter(btn => {
            if(btn.judgefield){
                let data = para.dataGet() || {};
                return btn.judgefield.split(',').every(field => data[field]);
            }
            return true;
        });

        function type2color(btn:ILE_Button) {
            if(btn){
                if(btn.link && btn.link.requestType === 'DELETE') {
                    return 'red';
                }
                if(btn.type === 'download'){
                    return 'green'
                }
                if(btn.type === 'excel'){
                    return 'light-blue'
                }
            }
            return '';
        }
        return <div className="le-button-group">{
            buttons.map(button =>
                button.type === 'excel' ?
                    <LeUploadModule
                        isAutoUpload={true}
                        className="btn le-button light-blue"
                        url={LeRule.linkParse2Url(button.link)}
                        isChangeText={false}
                        text={button.caption}
                        successHandler={function() {
                            Modal.toast(`上传成功`)
                        }}/> :
                    <Button
                        className={`le-button ${type2color(button)}`}
                        content={button.caption}
                        onClick={() => {
                            buttonAction.click(button, this.dataGet())
                        }}/>
            )
        }
        </div>;
    }
}

// class LeButton extends Button{
//     private _bgColor: string;
//
// }

export let buttonAction = {

    /**
     * button点击后业务操作规则
     */
    click(btn: ILE_Button, data: obj | obj[]) {
        let self = this;
        if(tools.isEmpty(btn.link.varList)){
            data = undefined;
        }
        if (btn.hint) {
            Modal.confirm({
                msg: `确定要${btn.caption}吗?`,
                callback: (flag) => {
                    if (flag) {
                        self.btnAction(btn, data)
                            .then(() => {
                                this.btnRefresh(btn.refresh)
                            });
                    }
                }
            });
        } else {
            self.btnAction(btn, data).then(() => {
                this.btnRefresh(btn.refresh)
            });
        }
    },


    /**
     * openTyp="popup";//弹出新窗口,"newwin";//打开新窗口,"none";//保持在原界面
     * 处理按钮规则buttonType=0:get,1:post,2put,3delete
     */
    btnAction(btn: ILE_Button, dataObj: obj | obj[]) {
        if(btn.multi === 0 && Array.isArray(dataObj)) {
            dataObj = dataObj[0] || {};
        }
        switch (btn.type) {
            case 'download':
                window.open(LeRule.linkParse2Url(btn.link, dataObj));
                return Promise.resolve();
            case 'excel':
                break;
            default:
                let openType = btn.link.openType;
                switch (openType) {
                    case 'data' :
                    case 'none' :
                        return buttonAction.checkAction(btn.link, dataObj);
                    case 'popup':
                    case 'newwin':
                        LeRule.linkOpen(btn.link, dataObj);
                        return Promise.resolve();
                }
        }
        return Promise.resolve();
    },

    checkAction(link: ILE_Link, dataObj: obj | obj[], url?: string) {

        let {addr, data} = url ? {addr: url, data: null} : LeRule.linkParse(link, dataObj);

        return LeRule.Ajax.fetch(CONF.siteUrl + addr, {
            data,
            data2url: link.varType !== 3,
            type: link.requestType
        }).then(({response}) => {
            let data = response.data;
            if (data && (data.type || data.type === 0)) {
                if (data.type === 0) {
                    Modal.alert(data.showText);
                    return Promise.reject('');
                } else {
                    return new Promise((resolve, reject) => {
                        Modal.confirm({
                            msg: data.showText,
                            callback: (confirmed) => {
                                if (confirmed) {
                                    buttonAction.checkAction(link, dataObj, data.url)
                                        .then(() => {
                                            resolve();
                                        }).catch(() =>{
                                            reject();
                                    });
                                }else{
                                    reject();
                                }
                            }
                        });
                    })

                }
            } else {
                // 默认提示
                response.msg && Modal.toast(response.msg);
            }
        });
    },
    /**
     * 根据button的refresh属性
     * @param {int} refresh
     * 0 - 本页面不刷新
     * 1 - 本页面刷新
     * 2 - 关闭本页面 页面并不刷新
     * 3 - 关闭本页面 页面并刷新
     * 4 - 本页不刷新 手动返回上级时刷新上级
     */
    btnRefresh(refresh: number) {
        switch (refresh) {
            case 1 :
                let page = SPA.pageGet();
                page && page.refresh();
                // BW.sys.window.fire(LeRule.EVT_REFRESH);
                break;
            case 2 :
                setTimeout(function () {
                    SPA.close();
                }, 900);
                break;
            case 3 :

                setTimeout(function () {
                    SPA.close();
                    setTimeout(() => {
                        let page = SPA.pageGet();
                        page && page.refresh();
                    }, 100)


                }, 900);
                break;
            case 4 :
                // BW.sys.window.firePreviousPage(BwRule.EVT_REFRESH, null, url);
                break;
            default:
        }
    }

};