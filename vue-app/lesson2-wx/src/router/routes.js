export default [
    // 错误页
    {
        path: '/error',
        component: () => import('@/views/ErrorPage'),
        meta: {
            title: '抱歉，出错了'
        }
    },
    // 授权页
    {
        path: '/auth',
        component: () => import('@/views/login/AuthPage'),
        meta: {
            title: '授权中...'
        }
    },
    // 登录页
    {
        path: '/login',
        component: () => import('@/views/login/LoginPage'),
        meta: {
            title: '登录'
        }
    },
    // 活动管理
    {
        path: '/activity',
        component: () => import('@/views/activity/ActivityPage'),
        meta: {
            title: '活动管理'
        }
    },
    // 申报活动
    {
        path: '/reportActivity',
        component: () => import('@/views/activity/ReportActivityPage'),
        meta: {
            title: '活动申报'
        }
    },
    {
        path: '/activityReport',
        component: () => import('@/views/activity/ActivityStepTwoPage'),
        meta: {
            title: '活动申报'
        }
    },
    {
        path: '/reportEdit',
        component: () => import('@/views/activity/EditContacts'),
        meta: {
            title: '编辑'
        }
    },
    {
        path: '/selectActivityType',
        component: () => import('@/views/activity/SelectActivityClass'),
        meta: {
            title: '选择活动分类'
        }
    },
    {
        path: '/sponsorInfo',
        component: () => import('@/views/activity/SponsorInfo'),
        meta: {
            title: '主办信息'
        }
    },
    {
        path: '/charge',
        component: () => import('@/views/activity/ChargeList'),
        meta: {
            title: '咨询人'
        }
    },
    {
        path: '/roles',
        component: () => import('@/views/activity/Roles'),
        meta: {
            title: '选择角色'
        }
    },
    {
        path: '/searchStudent',
        component: () => import('@/views/activity/AddStudent'),
        meta: {
            title: '选择学生'
        }
    },
    {
        path: '/showStudent',
        component: () => import('@/views/activity/ShowStudent'),
        meta: {
            title: '查看学生'
        }
    },
    {
        path: '/signType',
        component: () => import('@/views/activity/SignType'),
        meta: {
            title: '签到类型'
        }
    },
    {
        path: '/addSign',
        component: () => import('@/views/activity/AddNewSignItem'),
        meta: {
            title: '新增'
        }
    },
    {
        path: '/selectAddress',
        component: () => import('@/views/activity/SelectAddress'),
        meta: {
            title: '选择地址'
        }
    },
    {
        path: '/roleCancel',
        component: () => import('@/views/activity/RoleCancelPage'),
        meta: {
            title: ''
        }
    },
    {
        path: '/faceStudent',
        component: () => import('@/views/activity/FaceStudentPage'),
        meta: {
            title: '面向学生'
        }
    },
    {
        path: '/selectCollege',
        component: () => import('@/views/activity/SelectCollegePage'),
        meta: {
            title: ''
        }
    },
    {
        path: '/selectTeacher',
        component: () => import('@/views/activity/AddTeacher'),
        meta: {
            title: '选择教师'
        }
    },
    {
        path: '/courseFaceStudent',
        component: () => import('@/views/activity/CourseFaceStudentPage'),
        meta: {
            title: '面向学生'
        }
    },
    {
        path: '/courseSelectCollege',
        component: () => import('@/views/activity/CourseSelectCollegePage'),
        meta: {
            title: ''
        }
    },
    // 审批中心
    {
        path: '/approve',
        component: () => import('@/views/approve/ApprovePage'),
        meta: {
            title: '审批中心'
        }
    },

    // 个人中心
    {
        path: '/stu-mine',
        component: () => import('@/views/student/mine'),
        meta: {
            title: '个人中心'
        }
    },
    {
        path: '/stu-status',
        component: () => import('@/views/student/status'),
        meta: {
            title: '认证中心'
        }
    }, {
        path: '/stu-person',
        component: () => import('@/views/student/personal'),
        meta: {
            title: '编辑信息'
        }
    },
    {
        path: '/stu-grade',
        component: () => import('@/views/student/grade'),
        meta: {
            title: '学生成绩'
        }
    },
    {
        path: '/stu-gradeDetail/:user?',
        component: () => import('@/views/student/gradeDetail'),
        meta: {
            title:'成绩详情'
        }
    },
    {
        path: '/stu-honest',
        component: () => import('@/views/student/Honest'),
        meta: {
            title: '诚信中心'
        }
    },
    {
        path: '/stu-news',
        component: () => import('@/views/student/News'),
        meta: {
            title: '公告'
        }
    },
    {
        path: '/stu-messages',
        component: () => import('@/views/student/messages'),
        meta: {
            title: '通知'
        }
    },
    {
        path: '/mine',
        component: () => import('@/views/student/TechMinePage'),
        meta: {
            title: '个人中心'
        }
    },
    {
        path: '/techPerson',
        component: () => import('@/views/student/TechPersonal'),
        meta: {
            title: '编辑信息'
        }
    },
    // 学生端首页
    {
        path: '/home',
        component: () => import('@/views/home/HomePage'),
        meta: {
            title: '首页'
        }
    },
    // 学生端分类
    {
        path: '/classify',
        component: () => import('@/views/classify/classifyPage'),
        meta: {
            title: '分类'
        }
    },
    // 学生端评论
    {
        path: '/comment',
        component: () => import('@/views/comment/StudentCommentPage'),
        meta: {
            title: '评论'
        }
    },
    // 活动详情
    {
        path: '/detail',
        component: () => import('@/views/activityDetail/DetailPage'),
        meta: {
            title: '活动详情'
        }
    },
    {
        path: '/signInfo/:stuId',
        component: () => import('@/views/activityDetail/SignInfoPage'),
        meta: {
            title: '签到记录'
        }
    },
    // 认证列表
    {
        path: '/auth-list',
        component: () => import('@/views/auth/list/AuthListPage'),
        meta: {
            title: '认证'
        }
    },
    // 认证详情
    {
        path: '/auth-detail/:no?',
        component: () => import('@/views/auth/detail/AuthDetailPage'),
        meta: {
            title: '认证详情'
        }
    },
    // 认证详情
    {
        path: '/auth-edit/:no?',
        component: () => import('@/views/auth/edit/AuthEditPage'),
        meta: {
            title: '认证编辑'
        }
    },
    // 补签
    {
        path: '/retroactive',
        component: () => import('@/views/comment/retroactive'),
        meta: {
            title: '补签'
        }
    },
    // 签到or签退
    {
        path: '/checkIn',
        component: () => import('@/views/comment/SignInPage'),
        meta: {
            title: '签到或签退'
        }
    },
    //分类页下级页面
    {
        path: '/commonPage',
        component: () => import('@/views/commonPage/commonPage'),
    },
    {
        path: '/mineTab',
        component: () => import('@/views/student/mineTab'),
    },
]
