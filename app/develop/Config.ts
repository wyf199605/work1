namespace DV {
    export const CONF = {
        app_id: 'app_sanfu_retail',
        rootUrl: 'http://bwd.fastlion.cn:7776/dp',
        ajaxUrl: {
            menuQuery: 'root/app_dp/tree/app_id', // 菜单管理
            datasourceQuery: 'root/app_dp/global/datasource', // 数据源
            baseTableQuery: 'root/app_dp/global/keyfield', // 根据基表查询主键字段
            varDesign: 'root/app_dp/global/var', // 变量
            itemQuery: 'root/app_dp/sysitem/dplist',// 查询item
            primaryFunction: 'root/app_dp/dplist',// 查询器开发--主功能
            elementDesign: 'root/app_dp/syselement',// 元素
            fieldEditor: 'root/app_dp/global/field', //字段
            encyption: 'root/app_dp/dpcommon/encyption?str=', // 加密密码
            login: 'root/app_dp/dplogin',//登录
            logout: 'root/app_dp/dplogout',//登出
            queryCondition: 'root/app_dp/global/cond', //查询条件
            queryItemRelatedElements: 'root/app_dp/related/element', // 查询item关联的element
            queryItemRelatedCond: 'root/app_dp/related/cond', // 查询item关联的条件
            getAppId: 'root/app_dp/dpcommon/init', // 查询APPID
            interface: 'root/app_dp/dpoutinterface/menu', // 预览
            dmlsql:'root/app_dp/global/dmlsql', //查询dml
            downloadScript:'root/rest/dp/download/file', //下载
            uploadfile:'root/rest/dp/upload/file',//上传
            itemMenuDelete:'root/app_dp/sysitem', //item删除menu类型
            itemInterface:'root/app_dp/dpoutinterface/item', //item预览
        }
    }
}
for (const key in DV.CONF.ajaxUrl) {
    let urlStr = DV.CONF.ajaxUrl[key];
    if (urlStr.indexOf('root/') === 0) {
        urlStr = urlStr.replace('root', DV.CONF.rootUrl);
    }
    if (urlStr.indexOf('app_id') !== -1) {
        urlStr = urlStr.replace('app_id', DV.CONF.app_id);
    }
    DV.CONF.ajaxUrl[key] = urlStr;
}
