<template>
    <div class="eval-cell">
        <div class="eval-cell-header">
            <div class="user-pic">
                <img :src="data.AVATAR" alt="">
            </div>
            <div class="title">
                <span>{{hiddenName(data.USER_NAME)}}</span>
                <start-group :title="5" :is-change="false" :default="data.POINT || 0"></start-group>
            </div>
        </div>
        <div class="eval-cell-body">
            <p class="eval-cell-details" v-if="!!data.TEXT">{{data.TEXT}}</p>
            <div v-if="!!data.PICTURE" class="pic-group">
                <div class="pic" v-for="img in data.PICTURE">
                    <img :src="img" alt="">
                </div>
            </div>
            <div class="eval-cell-more">
                <span v-if="!!data.CREATETIME" class="time">{{data.CREATETIME}}</span>
            </div>
        </div>
    </div>
</template>

<script>
    import startGroup from '../../components/starGroup/starGroup';
    export default {
        name: "eval-cell",
        components: {
            'start-group': startGroup
        },
        props: {
            cellData: {
                type: Object,
                required: true,
            }
        },
        methods: {
            hiddenName(name){
                return name.slice(0, 1) + '**';
            }
        },
        data() {
            return {
                data: this.cellData
            }
        }
    }
</script>

<style lang="scss">
    .eval-cell{
        padding: 0 0.45rem;
        .eval-cell-header{
            padding: .3rem 0 0.3rem 1.2rem;
            height: 1.4rem;
            line-height: .8rem;
            position: relative;
            font-size: 16px;
            .user-pic{
                position: absolute;
                left: 0;
                top: .3rem;
                width: .8rem;
                height: .8rem;
                border-radius: 50%;
                overflow: hidden;
                img{
                    width: 100%;
                    height: 100%;
                }
            }

            .star-group{
                position: absolute;
                right: 0;
                top: .3rem;
                font-size: 16px;
            }
        }
        .eval-cell-body{
            padding: 0 0 0.3rem 1.2rem;

            .eval-cell-details{
                margin: 0;
                font-size: 14px;
                line-height: 1.6;
                word-break: break-all;
            }

            .pic-group{
                padding: .2rem 0;
                margin-right: -0.2rem;

                &::after{
                    content: "";
                    clear: both;
                    display: block;
                }

                .pic{
                    width: 2.5rem;
                    height: 2.5rem;
                    overflow: hidden;
                    float: left;
                    margin-right: 0.2rem;
                    img{
                        height: 100%;
                    }
                }
            }

            .eval-cell-more{
                padding: .2rem 0;
                .time{
                    color: #91a8b0;
                    font-size: 13px;
                }
            }
        }
    }
</style>
