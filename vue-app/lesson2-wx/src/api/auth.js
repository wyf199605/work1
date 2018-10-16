import request from '@/utils/request'
import { CONF } from "../utils/URLConfig"
export default {
    // 获取微信授权地址
    oauth2() {
        return request.get(CONF.url.isBind)
    },
    getToken(params) {
        return request.get(CONF.url.isBind, params)
    },
    // 获取JSSDK
    jssdk(data) {
        return request.post(CONF.url.wxshare, data)
    }
}
