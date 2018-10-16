export const CONF = {
    appid: 'dekt',
    version: 'null',
    siteUrl: 'http://2ndclass.cn/dekt',
    siteAppVerUrl: '',
    webscoketUrl: '',
    ajaxUrl: {
        fileUpload: `rest/attachment/upload/file`, // 文件上传
        fileDownload: 'rest/attachment/download/file', // 文件下载
        getExcelData: 'rest/excel/getData?temp_name=importStu', //获取excel数据
        imgDownload: 'rest/attachment/download/picture', // 文件下载 name_field=ATTACHNAME&md5_field=FILE_ID&app_id=app_sanfu_retail&sys_version_id=null&file_id=276260655F7E2FF824980FB4DACF78BB&attachname=adLogo.png
        detail: 'spacialhandle/scdata-1017-apply', // 活动详情
        registerNow: 'dektwx/student/commit', // 活动详情-报名提交
        cancelRegister: 'dektwx/student/cancel', // 活动详情-取消报名
        signNumber: 'dektwx/student/enroll', // 活动详情-报名人数
        collect: 'dektwx/student/collection',// 活动详情-收藏
        activitySignInData: 'dektwx/teacher/activitysign',  // 活动详情-签到数据
        activityUI: 'ui/manylist/node_scdata-wx-tt1?output=json', // 活动UI
        authList: 'dektwx/student/getcenterinfo',
        authDetail: 'dektwx/student/certificateview', // 认证详情
        authEditLookup: 'lookup/system/certificate-base', // 认证编辑下拉列表
        authDelete: 'dektwx/student/certificateDelete', // 认证列表删除
        authType: 'dektwx/student/certificateinfo', // 认证类型
        authSubmit: 'dektwx/student/certificatemodify', // 认证提交
        searchStudent:'dektwx/student/search', // 查看学生
        signLocation:'dektwx/teacher/location', //签到位置获取
        keepaliveLine:'rest/invent/keeponline',// 保持链接,获取session
        college:'qryvalue/node_object/sub_college_id', // 获取所有学院
        mineTab:'ui/manylist/node_scdata-wx-1003', //签到位置获取
        major:'qryvalue/node_object/major_id', // 获取专业
        clbum:'qryvalue/node_object/class_id', // 获取班级
        grade:'lookup/node_scdata-1017/look-grade-scdata-1017', // 获取年级
        report:'spacialhandle/scdata-1017-apply?activity_status_id=1', //申报活动
    },
    url: {
        homePic: 'dektwx/tea_stu/carousel', // 首页轮播图
        homeAllUI: 'ui/select/node_scdata-wx-1002?output=json', // 首页UI
        homeRecUI: 'ui/select/node_scdata-wx-1001?output=json', // 首页推荐UI
        homeAllData: 'list/node_scdata-wx-1002?output=json', // 首页数据
        homeRecData: 'list/node_scdata-wx-1001?output=json', // 首页数据
        teacherLogin: '/loginvalidate?state=teacher', // 教师登录绑定
        isBind: '/wxlogin',// 教师是否绑定微信,获取微信登录授权地址，获取微信登录信息
        wxshare: '/wxshare', //微信分享
        getActivityPlatform: '/pick/node_scdata-1017/pick-scdata-2', //获取活动分类
        getActivityLevel: '/lookup/node_scdata-1017/look-scdata-1017', // 获取活动级别
        getGradeList: '/dektwx/teacher/stuachievement', //教师端成绩查询
        getSignInfoData: '/dektwx/student/signinfo', //获取签到信息
        lookIntegral: '/dektpc/activeintegral?item_id=scdata-1017-1', //查看积分
        getUserInfo:'/dektwx/teacher/wxinfo', // 获取用户信息
        studentIndividual:'/dektwx/student/individual', //学生个人中心
        studentAuthentication:'/loginvalidate?state=student', // 学生认证
        signIn:'/dektwx/student/activitysign', // 签到 签退 补签
        activityComment: '/list/node_scdata-wx-101', // 活动评论
        classify: '/pick/node_scdata-1017/pick-scdata-2', // 分类
        detailAssessTotal: '/list/node_scdata-wx-100', // 分类
        activitySignIn: 'dektwx/teacher/initactivitysign', // 活动详情-签到
        studentScore:"/dektwx/student/score", //学生成绩列表
        // studentGrade:"/dektwx/student/getGrade",//学生成绩 下拉框
        studentDetail:"/dektwx/student/scoredetail",//我的成绩详情,
        credibility:"/dektwx/student/credibility",//我的诚信
        studentAdvice:"/dektwx/tea_stu/advice",//学生通知
        studentNews:"/config/scdata-16",//学生活动公告
        teachNopage:"/list/node_scdata-wx-2?nopage=true",//教师端查看
        teachFaculty:"/lookup/node_scdata-wx-2/look-scdata-25",//所属院系下拉框
        teachProfessor:"/lookup/node_scdata-wx-2/look-scdata-17",//老师职称下拉框
        studentNopage:"/list/node_scdata-wx-1?nopage=true",//学生端查看
        studentSex:"/lookup/node_scdata-wx-1/look-scdata-24",//学生性别下拉框
        studentCollege:"/lookup/node_scdata-wx-1/look-scdata-25",//学生院系下拉框
        studentMajor:"/lookup/node_scdata-wx-1/look-scdata-26",//学生专业下拉框
        studentGrade:"/dektwx/student/getGrade",//学生年纪下拉框
        studentClass:"/lookup/node_scdata-wx-1/look-scdata-28",//班级下拉框
        POLITICAL:"/lookup/node_scdata-wx-1/look-scdata-29",//政治面貌
        studentIsBind:'/wxlogin?state=isbind', // 学生是否绑定
        activityDetail:'/spacialhandle/scdata-1017-apply' , // 活动详情
        teachInfo:'/dektwx/tea_stu/info',//教师主页个人信息
        classifyData: 'list/node_scdata-wx-1004?output=json', //
        classifyUI: 'ui/select/node_scdata-wx-1004?output=json', // 首页UI
        qrCodeTime: '/lookup/node_scdata-1017/look-code-scdata-1017', // 二维码有效时间,
        signCode:'dektwx/student/signCode' ,//扫码签到
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
