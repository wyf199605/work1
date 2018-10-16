<template>
    <div>
        <cell :text="'申请单号'" :arrow="false" :rightText="no" ></cell>
        <div class="margin-bottom"></div>
        <cell :text="'申报平台'" :arrow="false" :rightText="base.platform_name"></cell>
        <cell :text="'证书类型'" :arrow="false" :rightText="base.type_name"></cell>
        <cell :text="'证书等级'" :arrow="false" :rightText="base.level_name"></cell>
        <cell :text="'公类'" :arrow="false" :rightText="base.party_name"></cell>
        <cell :text="'作者'" :arrow="false" :rightText="base.author_name"></cell>
        <div class="margin-bottom"></div>
        <div v-for="item in info">
            <cell v-if="item.type !== 3" :key="item.id" :text="item.name" :rightText="item.value" :arrow="false"></cell>
            <div v-if="item.type === 3" class="imgs">
                <p>{{item.name}}</p>
                <div v-for="url in item.value.split(';')" class="img">
                    <img :src="siteUrl + url" alt="">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import NormalCell from "../../../components/cell/NormalCell"
    import request from "../../../utils/request";
    import {CONF} from "../../../utils/URLConfig";
    export default {
        name: "AuthDetailPage",
        components:{
            cell: NormalCell
        },
        created(){
            request.get(CONF.ajaxUrl.authDetail, {apply_id: this.no})
                .then((response) => {
                    if(response.code === 0 && response.data){
                        this.base = response.data.base;
                        this.info = response.data.info;
                    }
                })
        },
        data () {
            return {
                siteUrl: CONF.siteUrl,
                no: this.$route.params.no,
                base:{
                    apply_id:"",//申请编号
                    platform_id:"",//此时不能编辑
                    platform_name:"",//此时不能编辑
                    type_id:"",//此时不能编辑
                    type_name:"",//此时不能编辑
                    level_id:"",
                    level_name:"",
                    party_id:"",
                    party_name:"",
                    author_id:"",
                    author_name:"",
                },
                info:[
                ]
            }
        }
    }
</script>

<style scoped lang="scss">

    .margin-bottom {
        margin-bottom: 5px
    }

    .imgs {
        margin-top: 5px;
        padding: 0.4267rem;
        background: #fff;
        p {
            font-size: 0.4267rem;
            margin: 0;
        }
        .img {
            width: calc((100vw - 0.4267rem * 2) / 4);
            padding: 5px;
            height: calc((100vw - 0.4267rem * 2) / 4);
            line-height: calc((100vw - 0.4267rem * 2) / 4);
            display: inline-block;
            overflow: hidden;
            img {
                max-width: 100%;
            }
        }
    }
</style>
