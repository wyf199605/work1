# 开发流程

## 安装步骤
    1.下载并配置Tomcat环境，
    2.配置tomcat编译文件的路径的conf/servcer.xml文件
    ```
    <!--前端fastlion-img的dist上一级目录 -->
    <Context docBase="/Users/gaoqiusheng/fastlion/fastlion-img" path="/img" reloadable="true"/>
    <!--前端panda-parent上一级目录-->
    <Context docBase="/Users/gaoqiusheng/fastlion/release/develop/sf" path="/sf" reloadable="true"/>
    ```
    3.修改后端代码配合前端开发
        （1）替换conf.properties 文件 ，路径 release/develop/sf/WEB-INF/classes/
            代码
            ```
                #the port of the server
                thread.offlineMessageThread.use=false
                thread.offlineMessageThread2.intervalTime=300
                thread.clientMonitorThread.timeOut=1800
                db.websocket.db_source=websocket
                db.data_source=oracle_nsfdata
                #user permissions
                permission.use=true
                deviceFilter.use=false
                splitUiQuery.use=false
                JobQuartz.use=false
                #message CLUSTER_NAME
                cluster.name=FF
                #app
                appid=app_sanfu_retail
                version=v1
                useMobile=false
                #sys.appserver=http://172.31.2.58:8080/RESTServer
                sys.appserver=http://192.168.1.222:8080/sf
                sys.imgserver=http://192.168.1.222:8080/img
                sys.sockserver=ws://192.168.1.222:8080/sf
                sys.mode=debug
                biz.record=yes
                finger.url=http://172.28.6.112:8080/sf/app_sanfu_retail/null/drom/login/black
                hideBaseMenu = contacts
                #System environment
                sys.isProduce=false
                Thesaurus.path=D:/opt/Thesaurus.txt
                picture_path=/mnt/zyb/

            ```
            (注意事项：sys.appserver和sys.imgserver，sys.sockserver配置本地IP地址，每天需要替换，如果配置成127.0.0.1，只能查看pc端代码)

        (2) 目前配置的环境有(位置：release/develop/sf/WEB-INF/classes/c3p0-config.xml)：
            a. 三福测试环境,conf.properties中sys.envName=sanfuTest加载此配置
            b. 速狮测试环境,conf.properties中sys.envName=fastlionTest加载此配置
            c. 恒裕地产开发环境,conf.properties中sys.envName=hengyuDev加载此配置
            d. 速狮开发环境,conf.properties中sys.envName=fastlionDev加载此配置
            e. 三福开发环境,conf.properties中sys.envName=sanfuDev加载此配置
            f. 三福准生产环境,conf.properties中sys.envName=sanfuPe加载此配置

##启动项目： 
    1. 启动tomcat
    2. 切到路径 global,启动项目 gulp G_Start
    3. 切到路径 blue-whale,启动项目 gulp BW_Start
    4. 切到路径 global, 启动监控 gulp G_Watch
    5. 切到路径 blue-whale, 启动监控 gulp BW_Watch 
    6. 编译成功后，打开 ip:8080/sf;

    
