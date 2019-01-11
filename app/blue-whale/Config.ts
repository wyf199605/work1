namespace BW {
    export const CONF = {
        appid: '',
        version: '',
        siteUrl: '',
        siteAppVerUrl: '',
        webscoketUrl: '',
        url: {
            index: `index`,
            login: `index?page=login`,
            reg: `index?page=reg`,
            update: `index?page=update`,
            selectServer: `index?page=static%2FserverSelect`,

            main: `commonui/pageroute?page=static%2Fmain`,
            message: `commonui/pageroute?page=static%2Fmessage`,
            msgDetail: `commonui/pageroute?page=static%2Fmessage_detail`,
            myselfMenu: `commonui/pageroute?page=static%2FmyselfMenu`,
            msgVersion: `commonui/pageroute?page=static%2FmsgVersion`,
            imgRotate: `commonui/pageroute?page=static%2FimgRotation`,
            changePassword: `commonui/pageroute?page=static%2FchangePassword`,

            privilegeConfigure: `commonui/pageroute?page=privilege&uiTypeTest=privilegeConfigure`,
            privilegeSearch: 'commonui/pageroute?page=privilege&uiTypeTest=privilegeSearch',
            sqlMonitor: `commonui/pageroute?page=sqlMonitor`,
            personPassword: `commonui/pageroute?page=changePassword`,
            test: `commonui/pageroute?page=test`,

            home: `commonui/pageroute?page=static%2Fhome`,
            contact: `ui/pick/system/pick-4?page=static%2Fcontacts`,
            myself: `ui/view/n1093_data-30?page=static%2Fmyself`,
            bugList: `commonui/pageroute?page=bugList`,
            bugDetail: `commonui/pageroute?page=bugDetail`,
            notifyCard: `ui/menu?page=static%2FnotifyCard`,
            bugReport: `ui/select/n1676_data-95110?page=table`,
            mail: 'ui/insert/n1174_data-4',

            processLeave: `flowui/flow/n_flow-1/insert?page=processLeave`,
            processAuditList: `flowui/flow/n_flow-1/insert?page=processAuditList`,
            processSeekList: `flowui/flow/n_flow-1/insert?page=processSeekList`,
            myApplication: `commonui/pageroute?page=myApplication`,
            myApplicationPC: `ui/menu/n3008_data-3008?page=myApplication`,
            myApproval: `commonui/pageroute?page=myApproval`,
            myApprovalPC: `ui/menu/n3009_data-3009?page=myApplication`,
            flowDetail: `commonui/pageroute?page=flowDetail`,

            /*-- url带有newPage，不走btl模板MsgListPage为页面名称 --*/
            msgList : 'newPage/MsgListPage',
        },
        ajaxUrl: {
            getVersion: 'rest/version/fastlion', // 获取版本号
            personalmenu: `common/personalmenu`, // 个人中心按钮
            personPassword: `common/modpwd`, // 修改密码
            labelDefault: 'common/savelabel', // 标签打印默认值
            fileUpload: `rest/attachment/upload/file`, // 文件上传
            fileDownload: 'rest/attachment/download/file', // 文件下载 name_field=ATTACHNAME&md5_field=FILE_ID&app_id=app_sanfu_retail&sys_version_id=null&file_id=276260655F7E2FF824980FB4DACF78BB&attachname=adLogo.png
            imgDownload: 'rest/attachment/download/picture', // 文件下载 name_field=ATTACHNAME&md5_field=FILE_ID&app_id=app_sanfu_retail&sys_version_id=null&file_id=276260655F7E2FF824980FB4DACF78BB&attachname=adLogo.png

            logout: `logout`, //退出
            loginFinger: `login/finger_drom`, //电脑指纹登陆
            loginTouchID: `login/finger_client`, //手机指纹登陆
            loginPassword: `login/password`, //帐号密码登录
            loginWeiXin: `login/wx`, //微信地址
            loginCode: 'login/message', // 手机短信验证码登录
            unBinding: 'commonsvc/alldevice', // 手机短信验证解绑

            mailForward: 'tag/mail', // 邮件转发
            mailTemp : 'tag/temp', // 保存图片

            atdPwdReg: 'attendance/pwdregister/node_attend-3',
            atdFingerReg: 'attendance/fingerregister/node_attend-2',
            atdFingerAtd: 'attendance/fingerattend/node_attend-1',

            passwordEncrypt: `commonsvc/encyption`, //密码加密
            register: `commonsvc/register`,
            smsSend: `commonsvc/sms`,
            unbound: 'commonsvc/unbound', // 解绑
            bindWeChat: 'common/wxbound', //绑定微信
            speedTest: 'commonsvc/interaction/KB', // 测速 ?size=100
            menu: `ui/menu`,
            menuHistory: `common/history`, //菜单历史
            menuFavor: `favorites`, //菜单收藏
            versionInfo: `list/n1679_data-95113`,
            pcVersion: `commonsvc/shellfile`,

            rmprivsSelect: 'rmprivs/privsget/select',
            rmprivsInsert: 'rmprivs/privsget/insert',
            changePassword: 'common/modify', //修改密码

            bugReport: 'common/obstacle', //报障
            helpMsg: 'common/help', // 帮助
            bugList: 'common/obstacles', // 报障列表
            bugDetail: 'common/obdetail', //申告详情
            bugstatus: 'common/obstate', //申告状态
            myself: `common/userinfo`,
            rfidLoginTime: 'rest/invent/keeponline',//盘点页面 间隔请求 防止一直登陆

            flowListCheck: 'flow/system/auditlist', // 流程引擎-审核
            flowListApply: 'flow/system/list', // 流程引擎-申请
            modifyFlow: 'process/modify/',      // 流程修改
            getProcessTypeId: 'process/type',   // 流程引擎-获取流程类型
            useAddressList_user: 'ui/select/n3023_data-3023?output=json',   // 流程引擎-属性编辑-使用通讯录-用户
            useAddressList_userGroup: 'ui/select/n3024_data-3024?output=json',  // 流程引擎-属性编辑-使用通讯录-用户组
            useAddressList_scriptSetting: 'ui/select/n3022_data-3022?output=json',  // 流程引擎-属性编辑-使用通讯录-脚本配置
            projectList: 'common/changepf',  // 切换项目（工作平台）
            queryTest:'ui/select/node_nobugs?output=json'
        },

        init(siteUrl: string, appid: string, version: string, webscoket) {
            this.siteUrl = siteUrl;
            this.appid = appid;
            this.version = version;
            this.webscoketUrl = webscoket;
            this.siteAppVerUrl = `${siteUrl}/${appid}/${version}`;

            for (let key in this.url) {
                let url = this.url[key];
                // prefix = url.indexOf('index?') === 0 ? this.siteUrl : this.siteAppVerUrl;
                this.url[key] = this.siteAppVerUrl + '/' + url;
            }

            for (let key in this.ajaxUrl) {
                let url = this.ajaxUrl[key],
                    prefix = url.indexOf('rest/') === 0 ? this.siteUrl : this.siteAppVerUrl;

                this.ajaxUrl[key] = prefix + '/' + url;
            }
        }
    };

}
