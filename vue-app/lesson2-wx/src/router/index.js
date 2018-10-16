import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'
import tools from '@/utils/tool'
import auth from '@/api/auth'
import {MessageBox} from 'mint-ui'
import {isLogin} from '@/api/login'
import axios from 'axios'
import {CONF} from '../utils/URLConfig'
import {
    setOpenId,
    getOpenId,
    setNickName,
    setHeaderImgUrl,
    getRole,
    setRole,
    setStuIsLogin,
    getUserInfoByOpenId,
    getIsLoginByOpenId
} from '../utils/setUserInfo'

Vue.use(Router)

const router = new Router({
    routes: routes
})
let keepalive = () => {
    setInterval(() => {
        axios.get(CONF.ajaxUrl.keepaliveLine)
    }, 9 * 60 * 1000)
}
const OAUTH2 = '/auth'
const ERROR = '/error'
const TEACHER = 'teacher'
router.beforeEach((to, from, next) => {
    // 设置标题
    let title = to.meta.title
    title && (document.title = to.meta.title)
    // 判断角色
    let role = getRole()
    let openid = getOpenId()
    if (tools.isNotEmpty(role)) {
        let state = window.location.href.split('?')[1]
        if (to.path === '/' && state.indexOf('state=') >= 0) {
            role = state.split('=')[1]
            setRole(role)
            if (role === TEACHER) {
                next({path: '/activity'})
            } else {
                if (tools.isNotEmpty(openid)) {
                    getIsLoginByOpenId(openid).then(() => {
                        if (tools.isNotEmpty(openid)) {
                            getUserInfoByOpenId(openid)
                        }
                        keepalive()
                        next({path: '/home'})
                    }).catch(() => {
                        MessageBox('提示', '验证绑定失败，请重新登录!');
                        next({path: '/error'})
                    })
                } else {
                    next({path: '/home'})
                }
            }
        }
        if (role === TEACHER) {
            // 教师授权登录
            if (to.path === ERROR) {
                next()
            } else {
                if (tools.isEmpty(openid) && to.path !== OAUTH2) {
                    // openId为空,需要授权登录
                    auth.oauth2().then(res => {
                        window.location.href = res.data.url
                    }).catch(() => {
                        next({path: '/error'})
                    })
                } else if (tools.isEmpty(openid) && to.path === OAUTH2) {
                    let code = window.location.href.split('?')[1].split('&')[0].split('code=')[1]
                    let params = {code: code}
                    // api接口登录
                    auth.getToken(params).then(res => {
                        // 保存openId等
                        setOpenId(res.data.openid)
                        setHeaderImgUrl(res.data.headimgurl)
                        setNickName(res.data.nickname)
                        // 授权成功后跳转到登录绑定，进行账号绑定
                        window.location.href = window.location.origin + '/dist/index.html#/login'
                    }).catch(() => {
                        next({path: ERROR})
                    })
                } else {
                    if (to.path === '/login') {
                        // 如果是登录，则直接到登录
                        next()
                    } else {
                        // openId存在,判断是否绑定
                        isLogin({openid}).then((res) => {
                            // 判断是否绑定，如果没有绑定，跳转登录页，绑定进入首页
                            if (res.data.islogin === true) {
                                next()
                            } else {
                                next({path: '/login'})
                            }
                        }).catch(() => {
                            next({path: '/login'})
                        })
                    }
                }
            }
        } else {
            // 学生授权登录
            if (to.path === ERROR) {
                next()
            } else {
                if (tools.isEmpty(openid) && to.path !== OAUTH2) {
                    // openId为空,需要授权登录
                    auth.oauth2().then((res) => {
                        window.location.href = res.data.url
                    }).catch(() => {
                        next({path: ERROR})
                    })
                } else if (tools.isEmpty(openid) && to.path === OAUTH2) {
                    let code = window.location.href.split('?')[1].split('&')[0].split('code=')[1]
                    let params = {code: code}
                    // api接口登录
                    auth.getToken(params).then((res) => {
                        // 保存openId等
                        setOpenId(res.data.openid)
                        setHeaderImgUrl(res.data.headimgurl)
                        setNickName(res.data.nickname)
                        setStuIsLogin(res.data.islogin)
                        // 授权成功
                        keepalive()
                        next({path: '/home'})
                    }).catch(() => {
                        next({path: ERROR})
                    })
                } else {
                    next()
                }
            }
        }
        // next()
    } else {
        // 角色不存在
        let state = window.location.href.split('?')[1]
        if (to.path === '/' && state.indexOf('state=') >= 0) {
            role = state.split('=')[1]
            setRole(role)
            if (role === TEACHER) {
                next({path: '/activity'})
            } else {
                if (tools.isNotEmpty(openid)) {
                    getIsLoginByOpenId(openid).then(() => {
                        if (tools.isNotEmpty(openid)) {
                            getUserInfoByOpenId(openid)
                        }
                        keepalive()
                        next({path: '/home'})
                    }).catch(() => {
                        MessageBox('提示', '验证绑定失败，请重新登录!');
                        next({path: '/error'})
                    })
                } else {
                    next({path: '/home'})
                }
            }
        }
    }
})

router.afterEach((to) => {
    window.scrollTo(0, 0);
})

export default router
