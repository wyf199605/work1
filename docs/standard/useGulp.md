
### watch任务

开启监听任务，监听打包后的dist文件夹，如文件变动可自动刷新页面

浏览器上需要下载livereload插件，或者btl中的header.tag/header.mb.tag中加入
```
 <script>
document.write('<script src="http://'+ (location.host||'localhost').split(':')[0]+':35729/livereload.js"></'+'script>')
</script> 

```

### css任务

编译css任务，将项目所有的scss文件，按照移动端和pc的类型进行划分分别打包出app.mb.css与app.pc.css

备注：项目中pc端的页面的scss文件，通常 xxx.pc.scss形式命名，移动端则 xxx.mb.scss形式命名

### js任务

编译项目中的脚本文件，分别有两个函数gulpTsModule、gulpTsPage;其中gulpTsPage编译页面文件对应项目中的pages目录下的ts/tsx，gulpTsModule编译项目中的module目录下的ts/tsx

备注:每加一个ts文件则必须在ts项目下手动加入   gulpTsModule('源文件', '编译后文件');  gulpTsPage('源文件', '编译后文件');

### BW_Start任务

将所有的css、js任务都跑一遍编译出dist/blue-whale文件夹

### BW_Watch任务

监听项目中ts/tsx，scss的文件，一旦文件变动立即执行js/css任务，输出dist文件夹下对应的文件，则触发watch任务，刷新页面

### BW_Compressor任务

将dist目录下的所有代码进行压缩，输出dist.min文件夹

备注：运行代码主要跑BW_Start+BW_Watch任务，发布生产跑BW_Start+BW_Compressor任务 对应指令 **gulp+任务名**