import request from '@/utils/request'
import {CONF} from "../utils/URLConfig";
import { Indicator } from 'mint-ui'
// 登录绑定
export function loginByUserid(userid, password, openid) {
    Indicator.open('登录中...')
    const data = {
        userid,
        password,
        openid
    }
    return request.post(CONF.url.teacherLogin, data)
}

// 登出
export function logout() {
    return request.get('')
}

// 判断用户是否绑定
export function isLogin(params) {
    return request.get(CONF.url.isBind, params)
}

// 获取用户信息
export function getUserInfo(params) {
    return request.get(CONF.url.getUserInfo,params)
}

// 获取学生是否绑定
export function getStudentIsBind(params) {
    return request.get(CONF.url.studentIsBind,params)
}
