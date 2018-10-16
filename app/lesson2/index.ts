/// <amd-module name="LessonApp"/>
import SPA = G.SPA;
import ISPARouter = G.ISPARouter;
import SPAPage = G.SPAPage;

function pageLoad(moduleName: string, constructorName = moduleName):Promise<typeof SPAPage> {
    return new Promise((resolve, reject) => {
        let timer = setTimeout(() => {
            reject('页面加载超时, 请重试')
        }, 7000);

        require([moduleName], function (m) {
            clearTimeout(timer);
            resolve(m[constructorName]);
        });
    })
}

let lessonRouter: ISPARouter = {
    main: () => pageLoad('MainPage'),
    common: () => pageLoad('LeCommonPage'),
    home: () => pageLoad('HomePage'), // 首页
    distributionOfTime: () => pageLoad('DestributionOfTimePage'), // 活动时间分布页面
    reportActivity: () => pageLoad('ReportActivityPage'), // 活动申报页面
    configParam : () => pageLoad('ConfigParamPage'), // 基础管理-参配配置
    personCenter : () => pageLoad('PersonCenter'), // 系统管理 个人中心
    feedBack : () => pageLoad('FeedBack'), // 学生管理-问题反馈
    ActivityDetailModule : ()=>pageLoad('ActivityDetailModule', 'ActivityDetailPage'), // 活动详情
    NoticePage :() => pageLoad('NoticePage'),
    privilege : () => pageLoad('Privilege', 'PrivilegeModal'), // 权限管理
    reportCard : () =>  pageLoad('ReportCardModal','StuReport'), // 成绩单
    modalCard : () =>  pageLoad('ReportCardModal','StuModal'), // 成绩模型
    warningCard : () =>  pageLoad('ReportCardModal','SutWarning'), // 预警单
    mapModalAdd : () => pageLoad('MapDimension', 'MapModalAdd'), // 活动定位-地图-新增
    mapModalModify : () => pageLoad('MapDimension', 'MapModalModify'), // 活动定位-地图-修改
    activeConfig : () => pageLoad('ActiveConfig'), // 基础管理-参配配置-活动配置
    integrityNorm : () => pageLoad('IntegrityNorm'), // 基础管理-参配配置-诚信配置
    faceRecognition : () => pageLoad('FaceRecognition'), // 基础管理-参配配置-人脸识别
    autoReview : () => pageLoad('AutoReview'), // 基础管理-参配配置-自动审核

};

export function init() {
    SPA.init([
        {   // 第一个单页应用
            name: 'loginReg', // 登录注册
            container: 'body',
            max: 1, // 最大页面 默认10
            router: { // 路由配置
                login: () => pageLoad('LoginPage'), // 登录
                regist: () => pageLoad('RegistPage'), // 注册
                forget: () => pageLoad('ForgetPwdPage') // 忘记密码
            },
            defaultRouter: { // 默认打开
                login: null,
            }
        },
        {
            name: 'lesson2', // 单页应用的名称
            container: '#lesson-body',
            router: lessonRouter, // 路由配置
            main: {
                router: ['main', {}],
                container: document.body,
            },
            defaultRouter: {
                home: null
            }
            // index0: routerName, index1: router's para
        }]
    );
}
