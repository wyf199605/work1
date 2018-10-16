<template>
    <div class="stu-minepage page">
        <div>
            <stuMine :confirm="confirm">
                <img slot="cell-title" class="headerImg" :src="headerImgUrl || 'http://placekitten.com/g/120/120'"
                     alt="">
                <div slot="cell-content" class="info">
                    <p class="name">{{nickName || '未知'}}</p>
                </div>
            </stuMine>
        </div>
        <div class="Icon-cell">
            <div v-for="val in IconCellData" @click="pathJump(val.type)">
                <p>{{val.number}}</p>
                <p>{{val.text}}</p>
            </div>
        </div>
        <div class="Icon-cell">
            <div v-for="(data, index) in CellData" class="classify-cell" @click="toCommonPage(index)">
                <mt-badge v-if="data.num > 0" :number="data.id" size="small" color="red">{{data.num}}</mt-badge>
                <p :class="['sec', data.Icon]" style="font-size: 0.6rem"></p>
                <p>{{data.text}}</p>
            </div>
        </div>
        <div class="line-cell">
            <lineCell v-for="cell in LineData" :text=cell.text :icon=cell.icon :number=cell.number
                      :iconColor="cell.iconColor" @click.native="cellClick(cell.link)" v-on:test="qrcode"></lineCell>
        </div>
        <tabBar :selected="selected"></tabBar>
    </div>
</template>

<script>
    import stuMine from '../../components/stu/stu-cell'
    import tabBar from '../../components/tabbar/Tabbar'
    import lineCell from '../../components/stu/stu-LineCell'
    import request from '../../utils/request'
    import {MessageBox} from 'mint-ui'
    import wx from 'weixin-js-sdk'
    import {
        getStuIsLogin,
        getNickName,
        getHeaderImgUrl,
        getRole
    } from '../../utils/setUserInfo'
    import {CONF} from "../../utils/URLConfig"
    import share from '../../utils/share'

    export default {
        name: 'mine',
        components: {
            stuMine,
            tabBar,
            lineCell
        },
        data() {
            return {
                confirm: 0,
                selected: 'stu-mine',
                headerImgUrl: '',
                nickName: '',
                IconCellData: [
                    {
                        text: '积分',
                        number: 0,
                        type: 1,
                        id: 'score'
                    },
                    {
                        text: '诚信值',
                        number: 0,
                        type: 2,
                        id: 'credit'
                    },
                    {
                        text: '收藏',
                        number: 0,
                        type: 3,
                        id: 'mark'
                    }
                ],
                CellData: [
                    {
                        text: '报名中',
                        Icon: 'seclesson-shijian',
                        id: 'regidter',
                        num: 0
                    },
                    {
                        text: '待签到',
                        Icon: 'seclesson-daiqiandao',
                        id: 'sign',
                        num: 0
                    },
                    {
                        text: '待评价',
                        Icon: 'seclesson-daipingjia',
                        id: 'comment',
                        num: 0
                    },
                    {
                        text: '待评分',
                        Icon: 'seclesson-daipingfen',
                        id: 'evaluate',
                        num: 0
                    },
                    {
                        text: '全部',
                        Icon: 'seclesson-fenlei'
                    }
                ],
                LineData: [
                    {
                        text: '认证中心',
                        icon: 'seclesson-renzhengzhongxin',
                        number: 0,
                        iconColor: '#4ea6f1',
                        link: '/auth-list'
                    },
                    {
                        text: '我的成绩',
                        icon: 'seclesson-wodechengji',
                        number: 0,
                        iconColor: '#F6956B',
                        link: '/stu-grade'
                    },
                    {
                        text: '我的活动',
                        icon: 'seclesson-huodongguanli-mianxing1',
                        number: 0,
                        iconColor: '#4ea6f1'
                    },
                    {
                        text: '扫码签到',
                        icon: 'seclesson-saoyisao',
                        number: 0,
                        iconColor: '#f15054',
                    },
                    {
                        text: '通知',
                        icon: 'seclesson-gonggao',
                        number: 0,
                        iconColor: '#FFB741',
                        link: '/stu-messages'
                    },
                    {
                        text: '公告',
                        icon: 'seclesson-tongzhi1',
                        number: 0,
                        iconColor: '#F6956B',
                        link: '/stu-news'
                    },
                    {
                        text: '切换身份',
                        icon: 'seclesson-qiehuanshenfen',
                        number: 0,
                        iconColor: '#4ea6f1'
                    },
                    {
                        text: '学籍修改',
                        icon: 'seclesson-xuejixiugai',
                        number: 0,
                        iconColor: '#4ea6f1'
                    },
                    {
                        text: '切换后台',
                        icon: 'seclesson-qiehuan1',
                        number: 0,
                        iconColor: '#41CBBB'
                    }
                ]
            }
        },

        methods: {
            toCommonPage(index){
                this.$router.push({
                    path: 'mineTab',
                    query: {
                        url: CONF.ajaxUrl.mineTab + '?output=json&tab_itemid=scdata-wx-110' + (index + 1),
                    }
                })
            },
            qrcode(val){
               console.log(val)
                if(val == "扫码签到"){
                   console.log('进来了')
                    share.getJSSDKAsync(window.location.href.split('#')[0]).then( ()=> {
                        wx.error(function (res) {

                            alert("出错了：" + res.errMsg );//这个地方的好处就是wx.config配置错误，会弹出窗口哪里错误，然后根据微信文档查询即可。

                        })
                        wx.ready(function () {
                            wx.scanQRCode({
                                needResult: 1,
                                scanType: ["qrCode", "barCode"],
                                success: function (res) {

                                    let result = res.resultStr;
                                    request.get(CONF.url.signCode + '?signvalue=' + `${result}`).then((resdata)=>{
                                        if(resdata.code == 0){
                                            MessageBox.alert(resdata.msg, '提示');
                                        }else {
                                            MessageBox.alert(resdata.msg,'提示');
                                        }
                                    })
                                },
                                fail: function (res) {
                                    console.log(res)
                                    alert(JSON.stringify(res));
                                    let instance = Toast({
                                        message: JSON.stringify(res),
                                        iconClass: ' sec seclesson-guanbi'
                                    });

                                }
                            })
                        })


                    })
                }
            },
            pathJump(type) {
                if (type == 1) {
                } else if (type == 2) {
                    this.$router.push({path: `/stu-honest`})
                }
            },
            cellClick(link) {
                let role = getRole()
                if (role === 'student') {
                    let isLogin = getStuIsLogin()
                    if (isLogin === 'true'){
                        this.$router.push({
                            path: link
                        })
                    }else{
                        MessageBox('提示','请先认证!')
                    }
                } else {
                    this.$router.push({
                        path: link
                    })
                }
            }
        },
        created() {
            let re = getStuIsLogin();
            console.log(re);
            if (re === 'true' || re === true) {
                this.confirm = 1;
            }else {
                this.confirm = 0;
            }
            this.headerImgUrl = getHeaderImgUrl()
            this.nickName = getNickName()
            request
                .get(CONF.url.studentIndividual)
                .then(res => {
                    let json = res.data
                    // console.log(json)
                    this.IconCellData.forEach((val, index) => {
                        for (let data in json) {
                            if (val.id === data) {
                                // console.log(json[data])
                                val.number = json[data]
                            }
                        }
                    });
                    this.CellData.forEach((val, idex) => {
                        for (let data in json) {
                            if (val.id === data) {
                                val.num = json[data]
                            }
                        }
                    })
                })
                .catch(e => {
                    console.log(e)
                })
        }
    }
</script>

<style lang="scss" scoped>
    .stu-minepage {
        background: white;
        padding-bottom: 55px;
        .headerImg {
            margin: 0.35rem 0;
            border-radius: 50%;
            display: inline-block;
            width: 1.6rem;
            position: absolute;
            left: 0.45rem;
        }
        .info {
            display: inline-block;
            font-size: 0.44rem;
            font-weight: bold;
            position: absolute;
            left: 2.5rem;
            top: 0.5rem;
        }
        .Icon-cell {
            display: flex;
            justify-content: space-around;
            text-align: center;
            border-bottom: 0.2rem solid rgb(248, 248, 248);
            padding: 0.1rem 0;
            div {
                font-size: 0.38rem;
                p:last-child {
                    color: rgb(148, 148, 148);
                }
            }
            .classify-cell {
                padding: 0px;
                position: relative;
                span {
                    position: absolute;
                }
                p {
                    padding: 0;
                    margin: 0.24rem 0;
                }
            }
        }
    }
</style>
