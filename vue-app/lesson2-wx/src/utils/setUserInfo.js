import {getUserInfo,getStudentIsBind} from '../api/login'

export const OPENID_KEY = 'openid'
export const NICKNAME_KEY = 'nickname'
export const HEADERIMG_KEY = 'headimgurl'
export const ROLE_KEY = 'role'
export const STU_IS_LOGIN = 'stuIsLogin'

export const setOpenId = (openId) => {
    localStorage.setItem(OPENID_KEY, openId)
}

export const getOpenId = () => {
    return localStorage.getItem(OPENID_KEY)
}

export const removeOpenId = () => {
    localStorage.removeItem(OPENID_KEY)
}

export const setNickName = (nickName) => {
    localStorage.setItem(NICKNAME_KEY, nickName)
}

export const getNickName = () => {
    return localStorage.getItem(NICKNAME_KEY)
}

export const getRole = () => {
    return localStorage.getItem(ROLE_KEY)
}

export const setRole = (role) => {
    return localStorage.setItem(ROLE_KEY, role)
}

export const setHeaderImgUrl = (headerImgUrl) => {
    localStorage.setItem(HEADERIMG_KEY, headerImgUrl)
}

export const getHeaderImgUrl = () => {
    return localStorage.getItem(HEADERIMG_KEY)
}

export const setStuIsLogin = (isLogin) => {
    localStorage.setItem(STU_IS_LOGIN, isLogin)
}

export const getStuIsLogin = () => {
    return localStorage.getItem(STU_IS_LOGIN)
}

export function getUserInfoByOpenId(openId) {
    return new Promise((resolve, reject) => {
        getUserInfo({
            openid: openId
        }).then((res) => {
            setHeaderImgUrl(res.data.headimgurl);
            setNickName(res.data.nickname);
            resolve(res.data);
        }).catch(() => {
            reject();
        })
    })
}

export function getIsLoginByOpenId(openId) {
    return new Promise((resolve, reject) => {
        getStudentIsBind({
            openid: openId
        }).then((res) => {
            setStuIsLogin(res.data.islogin);
            resolve(res.data);
        }).catch(() => {
            reject();
        })
    })
}
