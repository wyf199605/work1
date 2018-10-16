<template>
    <div class="share">
        <div class="content">
            <div class="one">
                <span>1.点击右上角</span>
                <span class="point">···</span>
                <span class="sec seclesson-zhishi"></span>
            </div>
            <div class="two">
                <span>2.点击</span>
                <div>
                    <span class="sec seclesson-fenxiang"></span>
                    <span class="text">发送给朋友</span>
                </div>

                <span>或</span>
                <div>
                    <span class="sec seclesson-pengyouquan"></span>
                    <span class="text">分享朋友圈</span>
                </div>
                <span>分享</span>
            </div>
        </div>
        <div class="btn">
            <span @click="know">我知道了</span>
        </div>
        <div class="bg-share"></div>
    </div>
</template>

<script>
    export default {
        name: "share",
        methods:{
            know(){
                this.$emit('changeShare', false)
            }
        }
    }
</script>

<style scoped lang="scss">
    .share{
        position: fixed;
        -webkit-transform:translateZ(0);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color:rgba(0,0,0,0.60);
        z-index: 1001;
        color: white;
        text-align: center;
        .content{
            margin-top: 100px;
            font-size: 18px;
            width: 80%;
            margin-left: auto;
            .one{
                padding: 10px 0;
                float: left;
                >span{
                    display: inline-block;
                }
                .point{
                  }
                .seclesson-zhishi{
                    font-size: 83px;
                    top: 20px;
                    position: absolute;
                    right: 20px;
                }
            }
            .two{
                float: left;
                >span,>div{
                    display: inline-block;
                    float: left;
                }
                >span{
                    margin-top: 20px;
                }
                >div{
                    position: relative;
                    margin-left: 15px;
                    .sec:before{
                        position: absolute;
                        font-size: 23px;
                        padding: 10px;
                        border-radius: 4px;
                        border: 1.5px solid;
                    }
                    .text{
                        font-size: 14px;
                        margin-top: 50px;
                        margin-left: -11px;
                        display: block;
                    }
                }
            }
        }
        .btn{
            margin-top: 280px;
            >span{
                border: 1px solid;
                padding: 15px 70px;
                border-radius: 5px;
                font-size: 18px;
            }
        }
    }
</style>
