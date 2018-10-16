import axios from 'axios'
import cache from './cache'

const ajaxUrl = process.env.NODE_ENV === 'development'
    // 测试环境api接口
    ? 'http://2ndclass.cn/dekt/dekt/null'
    // 线上环境api接口
    : 'http://2ndclass.cn/dekt/dekt/null'

const axiosInstance = axios.create({
    baseURL: ajaxUrl,
    timeout: 15000
})
axiosInstance.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json; charset=UTF-8'
    return config
}, error => {
    Promise.reject(error)
})

axiosInstance.interceptors.response.use(response => {
    return Promise.resolve(response.data)
}, error => {
    return Promise.reject(error)
})

export default {
    post(url, data, isLocal = false) {
        return axiosInstance({
            method: 'post',
            url: url,
            data: data,
            adapter: isLocal ? cache({
                local: false // 是否永久保留在本地，默认为false
            }) : null
        })
    },

    get(url, params, isLocal = false) {
        return axiosInstance({
            method: 'get',
            url: url,
            params,
            adapter: isLocal ? cache({
                local: false // 是否永久保留在本地，默认为false
            }) : null
        })
    },

    delete(url, params, isLocal = false) {
        return axiosInstance({
            method: 'delete',
            url: url,
            params,
            adapter: isLocal ? cache({
                local: false // 是否永久保留在本地，默认为false
            }) : null
        })
    },

    put(url, data, isLocal = false) {
        return axiosInstance({
            method: 'put',
            url: url,
            data: data,
            adapter: isLocal ? cache({
                local: false // 是否永久保留在本地，默认为false
            }) : null
        })
    },

    ajax(obj) {
        let type = obj.type ? obj.type.toLowerCase() : '',
            data = obj.data,
            isLocal = obj.isLocal,
            url = obj.url;
        if (this[type]) {
            return this[type](url, data, isLocal);
        }else{
            return null;
        }
    }
}
