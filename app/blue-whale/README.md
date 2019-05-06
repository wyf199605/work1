# 速狮开发环境配置

## 1.git仓库
- 拉取[http://114.116.73.147/front](http://114.116.73.147/front)目录下
的[fastlion-img](http://114.116.73.147/front/fastlion-img)和[release](http://114.116.73.147/publish/release)这两个项目

## 2.环境：java jdk、tomcat、iNode智能客户端
   - iNode连三福环境必须打开VPN
   - iNode账号：fastlion03 / fastSANFU@567

## 3.运行
### 3.1：修改release/master/sf/WEB_INF/conf.properties文件
   - sys.isProduce 改为false
   - sys.appserver 改为本地ip比如：http://192.168.1.222:8080/sf
   - sys.imgserver 改为本地ip比如：http://192.168.1.222:8080/img
   - sys.sockserver 改为本地ip比如：ws://192.168.1.222:8080/sf
   - sys.envName表示运行的环境： master目录下可选速狮测试与三福测试；develop目录下可选速狮开发与三福开发；

### 3.2：iNodeVpn连接：
   - 账号/密码:fastlion02/fastSANFU@567    fastlion01/fastSANFU@325

### 3.3：开启tomcat服务器

### 3.4：fastlion-img 项目下
   - cd app 安装下npm包
   - cd blue-whale 运行gulp BW_Start开启编译出dist文件; 开发调试开启gulp BW_Watch任务;打包压缩执行gulp BW_Compressor任务编译dist.min文件夹;
   - cd global 运行gulp G_Start 开启编译出dist文件 开发调试开启G_Watch任务， 打包压缩运行 gulp G_Compressor任务编译dist.min文件夹

## 4.开发服务器
   - 安装ftp
   - 登录： bwadmin / Rt6Qy9W2 =》192.168.0.142:22
   - 速狮开发服务器地址：/opt/nginx/html/k_img/dist

## 5.蓝鲸代码说明
   - 目录说明
      - blue-whale  为蓝鲸后台逻辑代码
      - global代码为底层与业务无关的代码，比如ui组件，基础方法封装等
   - 构建说明
      - globa项目和blue-whale项目各有一个gulpfile文件，项目运行两个项目必须要同时开启任务，项目中加入模块或页面都必须手打到gulpfile添加文件流