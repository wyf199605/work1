import request from '@/utils/request'
import {CONF} from '../utils/URLConfig'

export default {
    // 获取活动平台
    getActivityPlatform() {
        return request.get(CONF.url.getActivityPlatform)
    },
    // 获取活动级别
    getActivityLevel() {
        return request.get(CONF.url.getActivityLevel)
    },
    // 获取成绩列表
    getGradeList(params) {
        return request.get(CONF.url.getGradeList, params)
    },
    // 获取签到信息
    getSignInfoData(params) {
        return request.get(CONF.url.getSignInfoData, params)
    },
    // 查看积分
    lookIntegral() {
        return request.get(CONF.url.lookIntegral)
    },
    // 获取活动详情
    queryReportDataById(params) {
        return request.get(CONF.url.activityDetail, params)
    },
    // 获取二维码有效时间
    getQrCodeTime() {
        return request.get(CONF.url.qrCodeTime)
    }
}
