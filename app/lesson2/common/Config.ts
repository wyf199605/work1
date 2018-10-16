namespace LE {
    export const CONF = {
        appid: 'dekt',
        version: 'null',
        siteUrl: 'http://sc.fastlion.cn/dekt',
        siteAppVerUrl: '',
        webscoketUrl: '',
        ajaxUrl: {
            fileUpload: `rest/attachment/upload/file`, // 文件上传
            fileDownload: 'rest/attachment/download/file', // 文件下载 name_field=ATTACHNAME&md5_field=FILE_ID&app_id=app_sanfu_retail&sys_version_id=null&file_id=276260655F7E2FF824980FB4DACF78BB&attachname=adLogo.png
            imgDownload: 'rest/attachment/download/picture', // 文件下载 name_field=ATTACHNAME&md5_field=FILE_ID&app_id=app_sanfu_retail&sys_version_id=null&file_id=276260655F7E2FF824980FB4DACF78BB&attachname=adLogo.png

            excelUpload: 'rest/excel/upload',//上传excel
            logout: `logout/password`, //退出
            loginPassword: `login/password`, //帐号密码登录
            loginCode: 'login/message', // 手机短信验证码登录

            register: `commonsvc/register`,
            menu: `ui/menu?output=json`,

            activeConfig: 'config/scdata-5', // 活动配置
            integrityNorm: 'config/scdata-6', // 诚信配置
            faceRecognition: 'config/scdata-7', // 脸部识别
            autoReview: 'config/scdata-8', // 自动审核

            activeConfigSave: 'saveconfig/scdata-5', // 活动配置保存
            integrityNormSave: 'saveconfig/scdata-6', // 诚信配置保存
            faceRecognitionSave: 'saveconfig/scdata-7', // 脸部识别保存
            autoReviewSave: 'saveconfig/scdata-8', // 自动审核保存

            feedBack: 'config/scdata-15', // 学生管理-问题反馈

            personCenter: 'config/scdata-9', // 个人中心
            personCenterSave: 'saveconfig/scdata-9', // 个人中心保存
            jobTitle: 'title/jobtitle', // 个人中心-职称

            home: 'dektpc/homepage',//首页
            activityTime: 'dektpc/delener', //活动时间分布

            earlyWarning: 'earlywarning', // 预警单
            schoolReport: 'dektpc/schoolreport', // 成绩单
            reportModal: 'dektpc/reportmodel', // 成绩单模型
            smsCode: 'smscode', //短信验证码
            mjregister: 'mjregister', //注册
            binding: 'binding',//绑定
            resetpwd: 'resetpwd', // 重置密码
            feedBackSelect: 'lookup/node-scdata-15/look-scdata-15', // 问题反馈下拉
            feedBackQuery: 'config/scdata-15', // 问题反馈查询

            delener: 'commonsvc/delener', //活动时间分布查询地址
            noticeList: 'config/scdata-16', //公告列表地址
            noticeDetail: 'config/scdata-17',
            privilege: 'jurisdiction', // 权限管理
            privilegeSave: 'savepermissions', // 权限保存

            mapSave : 'action/node_scdata-1013/action-scdata-1013', // 活动定位-修改
            mapAdd : 'action/node_scdata-1013/action-scdata-1013-1', // 活动定位-新增

            activityLevel: 'lookup/node_scdata-1017/look-scdata-1017', // 活动申报-活动级别
            getExcelData: 'rest/excel/getData?temp_name=importStu', //获取excel数据
            qrCodeTime: 'lookup/node_scdata-1017/look-code-scdata-1017', // 二维码有效时间
            downloadTem: 'rest/excel/downloadExcel?temp_name=importStu', // 下载模板接口
            colleges: 'qryvalue/node_object/sub_college_id', //获取所有学院
            major: 'qryvalue/node_object/major_id',// 获取专业
            clbum: 'qryvalue/node_object/class_id',//获取班级
            grade: 'lookup/node_scdata-1017/look-grade-scdata-1017',//获取年级
            activityType: 'pick/node_scdata-1017/pick-scdata-2', // 活动平台
            addStudent: 'ui/select/node_scdata-student-1?output=json',//添加学生
            addTeacher: 'ui/select/node_scdata-teacher-1?output=json', // 添加教师
            lookIntegral: 'dektpc/activeintegral?item_id=scdata-1017-1', //查看积分
            selectPosition: 'dektpc/activeintegral?item_id=scdata-1017-2', //位置选择
            activityAttribution: 'lookup/node_scdata-1017/look-attribution-scdata-1017', //活动归属
            activityDetail:'spacialhandle/scdata-1017-apply', // 活动详情
            gradeList:'dektpc/qryreport', // 成绩单
        },

        init() {
            this.siteAppVerUrl = `${this.siteUrl}/${this.appid}/${this.version}`;

            for (let key in this.ajaxUrl) {
                let url = this.ajaxUrl[key],
                    prefix = url.indexOf('rest/') === 0 ? this.siteUrl : this.siteAppVerUrl;

                this.ajaxUrl[key] = prefix + '/' + url;
            }
        }
    };

    CONF.init();
}
