<template>
    <div class="sign-in-page">
        <div class="header">
            <div class="activity-detail">
                <table-item v-if="rowData" :rowData="rowData">
                    <div class="address">{{rowData.address}}</div>
                </table-item>
            </div>
        </div>
        <div class="body">
            <div class="address"><i class="sec seclesson-dingwei"></i>{{address}}</div>
            <div class="pic-wrapper">
                <div class="pic-group">
                    <div class="pic-item" @click="uploadImg">
                        <div v-if="img" class="pic">
                            <img :src="img" alt="">
                        </div>
                        <div class="pic pic-add" v-else>
                            <i class="sec seclesson-xiangji1"></i>
                            <span>请用自拍模式拍</span>
                            <span>摄一张现场照片</span>
                        </div>
                        <upload :isUseCamera="isUseCamera" :isOnlyCamera="true"
                                nameField="img" field="IMG" @uploadFile="upload"
                                ref="upload" @getImg="getImg"></upload>
                        <!--<template v-else>-->
                            <!--<div class="tip">照片参照</div>-->
                            <!--<div class="pic">-->
                                <!--<img :src="img" alt="">-->
                            <!--</div>-->
                        <!--</template>-->
                    </div>
                    <!--<div class="pic-item">-->
                        <!---->
                    <!--</div>-->
                </div>
            </div>
            <div class="btn-group">
                <mt-button @click="submit" type="primary" size="large">提交</mt-button>
            </div>
        </div>
    </div>
</template>

<script>
    import upload from '../../components/uploader/uploader';
    import tableItem from '../../components/table/tableItem';
    import tools from '../../utils/tool';
    import {CONF} from '../../utils/URLConfig';
    import request from '../../utils/request';
    import wx from 'weixin-js-sdk'
    import { Toast, MessageBox, Indicator } from 'mint-ui';

    export default {
        name: "sign-in-page",
        components: {
            upload,
            tableItem,
        },
        computed: {
            image(){
                return this.md5 === '' ? '' : tools.fileUrlGet(this.md5, 'IMG');
            }
        },
        methods: {
            getImg(img){
                this.img = img;
            },
            initData(data){
                if(data){
                    this.rowData = {
                        img: data.img,
                        title: data.activityName,
                        body: [data.time],
                        label: data.label,
                        address: data.address
                    };
                    this.activityId = data.activityId;
                    this.isCheckIn = data.isCheckIn == 0;
                }
            },
            submit(){
                if(!this.md5){
                    MessageBox('温馨提示', '请用自拍模式拍摄一张现场照片');
                    return ;
                }
                let formData = {
                    img: this.md5,
                    longitude: this.longitude,
                    latitude: this.latitude
                };
                Indicator.open();
                request.post(CONF.url.signIn +
                    '?activityid=' + this.activityId +
                    // '/activitysign?activityid=3006&userid=7153'
                    (this.isCheckIn ? '' : '&&signtype=2'), formData).then((e) => {
                    // console.log(e);
                    Indicator.close();
                    if(e.code === 0){
                        Toast(e.msg);
                        window.history.back();
                    }else{
                        MessageBox('提示', e.msg);
                    }
                }).catch((e) => {
                    console.log(e);
                    Indicator.close();
                    MessageBox(e.msg);
                })
            },
            uploadImg(){
                this.$refs.upload.selectActionSheet();
            },
            upload(md5){
                this.md5 = md5;
            },
            getPosition(){
                return new Promise((resolve, reject) => {
                    wx.getLocation({
                        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        success: function (res) {
                            let latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                            let longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                            // MessageBox('纬度' + latitude + '，经度' + longitude +
                            //     ',name:' + res.name + ',address:' + res.address);
                            resolve({
                                latitude,
                                longitude
                            })
                        }
                    });
                })
            }
        },
        data(){
            return {
                address: '我的位置',
                longitude: null,
                latitude: null,
                isCheckIn: true,
                md5: '',
                activityId: '',
                rowData: null,
                isUseCamera:true,
                img: null,
                // img: 'https://ss1.baidu.com/-4o3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=e420291c58e736d147138a08ab514ffc/241f95cad1c8a78695392dce6b09c93d71cf50da.jpg'
            }
        },
        beforeRouteEnter(to, from, next){
            next((vm) => {
                // let geolocation = new BMap.Geolocation();
                // geolocation.getCurrentPosition(function(r){
                //     if(this.getStatus() == BMAP_STATUS_SUCCESS){
                //         vm.longitude = r.point.lng;
                //         vm.latitude = r.point.lat;
                //         // console.log(r.point.lng, r.point.lat);
                //         // let map = new BMap.Map("l-map");
                //         // map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
                //         // 创建地理编码实例
                //         let myGeo = new BMap.Geocoder();
                //         // 根据坐标得到地址描述
                //         myGeo.getLocation(new BMap.Point(r.point.lng, r.point.lat), function(result){
                //             if (result){
                //                 vm.address = result.address;
                //             }
                //         });
                //     }
                //     else {
                //         // console.log('failed'+this.getStatus());
                //     }
                // });

                vm.initData(to.query);
                vm.getPosition().then(({latitude, longitude}) => {
                    vm.longitude = longitude;
                    vm.latitude = latitude;
                    let myGeo = new BMap.Geocoder();
                    // 根据坐标得到地址描述
                    myGeo.getLocation(new BMap.Point(longitude, latitude), function(result){
                        if (result){
                            vm.address = result.address;
                        }
                    });
                });
            })
        }
    }
</script>

<style lang="scss">
    .sign-in-page{
        .header{
            background: #fff;
            margin-bottom: .2rem;
            .activity-detail{
                .table-item-wrapper{
                    padding-bottom: 0;
                    margin-top: 0;
                    .more{
                        color: #91a8b0;
                        font-size: 15px;
                        padding: .3rem 0;
                    }
                }
            }
        }
        .body{
            background: #fff;
            padding: 0 .4rem;
            .address{
                padding: .4rem 0;
                font-size: 16px;
                border-bottom: 1px solid #ccc;
                i{
                    margin-right: .2rem;
                    font-size: 20px;
                    color: #0099ff;
                }
            }

            .pic-wrapper{
                padding: 0.4rem 0 1.15rem;

                .pic-group{
                    display: flex;
                    justify-content: space-between;
                    .pic-item{
                        padding-top: .7rem;
                        box-sizing: content-box;
                        width: 3.733rem;
                        height: 4.427rem;
                        position: relative;

                        .tip{
                            position: absolute;
                            left: 0;
                            top: 0;
                            text-align: center;
                            width: 100%;
                            font-size: 14px;
                        }
                        .pic{
                            background-color: #ffffff;
                            border: solid 0.013rem #d8e3e9;
                            width: 100%;
                            height: 100%;
                            overflow: hidden;

                            img{
                                height: 100%;
                                width: 100%;
                            }

                            &.pic-add{
                                text-align: center;
                                padding: 1rem 0 0;
                                color: #94a8af;
                                font-size: 14px;

                                i{
                                    display: block;
                                    font-size: 40px;
                                }
                                span{
                                    display: block;
                                }
                                /*.uploader{*/
                                    /*display: none;*/
                                /*}*/
                            }
                        }
                    }

                }
            }
        }
    }
</style>
