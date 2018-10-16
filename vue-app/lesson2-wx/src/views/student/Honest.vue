<template>
<div class="stu-honest page">
    <div class="get-honest">
         <p style="color: rgb(17,159,254)">获取诚信值:{{this.num}}</p>
         <p @click="pop">诚信规则</p>
    </div>
    <div class="init-honest">
       <p style="color: rgb(148,148,148)">初始诚信值:{{this.initNum}}</p>
    </div>
    <div class="honest-list" v-for="cell in honsetList">
        <div>
            <p>{{cell.UPDATE_RESON}}</p>
        </div>
        <div>
            <p style="color: #00a6ed" v-if=" parseInt(cell.VALUE_NUM) > 0">{{cell.VALUE_NUM}}</p>
            <p  style="color: #62c462 " v-else>{{cell.VALUE_NUM}}</p>
        </div>
    </div>
    <mt-popup
        v-model="popupVisible"
        popup-transition="popup-fade">
        <div class="popup-div">
           <p>
               1）报名打卡参加活动一次，诚信值+X；报名未打卡参加活动一次，诚信值-Y；
           </p>
            <p>
                2）评价活动一次，诚信值+X；未评价活动一次，诚信值-Y；
                证书提交一次，诚信值+X；提交之后，被管理员审核发现重复，管理员可以选择惩罚，也可以退回警告，再不听继续提交，可以按“删除并扣除诚信值”执行惩罚
            </p>

        </div>

    </mt-popup>
</div>
</template>

<script>
    import request from '../../utils/request'
    import {CONF} from "../../utils/URLConfig"
    import { Popup } from 'mint-ui';
    export default {
        name: "Honest",

        data(){
            return {
                popupVisible:false,
                initNum:0,
                num:0,
                honsetList:[

                ]
            }
        },
        created(){
            request.get(CONF.url.credibility).then((res)=>{
                console.log(res);
                let data = res.data;
                this.initNum = data.head.initNum;
                this.num = data.head.num;
                this.honsetList = data.list
            })
        },
        methods:{
            pop(){
                this.popupVisible = true
            }
        }

    }
</script>

<style lang="scss" scoped>
.stu-honest{
    background-color: white;
    .get-honest{
        display: flex;
        justify-content: space-between;
        font-size: 0.42rem;
        border-bottom: 0.01rem solid rgb(216, 216, 216);
        padding: 0 0.34rem;
        p:last-child{
            border: 0.01rem solid black;
            padding: 0.06rem 0.19rem;
        }
    }
    .init-honest{
        font-size:0.42rem;
        padding: 0 0.34rem;
        border-bottom: 0.1rem solid rgb(248,248,248)
    }
    .honest-list{
        display: flex;
        justify-content: space-between;
        margin-left: 0.34rem;
        font-size: 0.36rem;
        padding-right: 0.54rem;
        border-bottom: 0.01rem solid rgb(216, 216, 216)
    }
    .popup-div{
        width: 8.2rem;
        padding: 0.2rem;
    }
}

</style>
