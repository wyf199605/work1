<template>
    <div class="auth-list-page">
        <NarBar
            @onChange="switchTab"
            class="nav"
            :list="['待审核', '已认证', '未通过']"
            :isSearch="false"
            :isFixed="true">

        </NarBar>
        <div v-show="selected === 0">
            <AuthListItem
                :link="'/auth-detail/' + item.no"
                v-for="item in authing"
                :no="item.no"
                :type="item.type"
                :level="item.level"
                :time="item.time"
                :name="item.name"
                :point="item.point"
                :reason="item.reason"
                :status="0">
            </AuthListItem>
        </div>
        <div v-show="selected === 1">
            <AuthListItem
                :link="'/auth-detail/' + item.no"
                v-for="item in authed"
                :no="item.no"
                :type="item.type"
                :level="item.level"
                :time="item.time"
                :point="item.point"
                :reason="item.reason"
                :name="item.name"
                :status="2">
            </AuthListItem>
        </div>
        <div v-show="selected === 2">
            <AuthListItem
                :link="'/auth-detail/' + item.no"
                v-for="item in unauth"
                :no="item.no"
                :type="item.type"
                :level="item.level"
                :time="item.time"
                :point="item.point"
                :reason="item.reason"
                :name="item.name"
                :status="3"
                @deleted="load(2, false)"
            >
            </AuthListItem>
        </div>

        <Button type="primary" class="button" @click="go('/auth-edit')">
            添加新证书
        </Button>
    </div>
</template>

<script>
    import NarBar from "../../../components/navbar/Navbar"
    import AuthListItem from "./AuthListItem"
    import request from "../../../utils/request";
    import {CONF} from "../../../utils/URLConfig";
    import tools from "../../../utils/tool";
    import { Button,MessageBox } from 'mint-ui';
    export default {
        name: "AuthListPage",
        components: {
            NarBar,
            AuthListItem,
            Button
        },
        created:function() {
            this.switchTab(0);
        },
        beforeRouteEnter(to, from,next) {
            if(from.fullPath === '/auth-edit') {
                next(vm => {
                    vm.load(0, false);
                })
            }else{
                next();
            }
        },
        methods: {
            go(path) {
                this.$router.push({
                    path: path
                })
            },
            switchTab(index) {
                this.selected = index;
                this.load(index);
            },

            load(index, flag = true){
                let self = this;
                let status = [0, 2, 3],
                    dataName = ['authing', 'authed', 'unauth'][index];

                if (!flag || !this.dataLoaded[dataName]) {
                    request.get(CONF.ajaxUrl.authList, {status: status[index]})
                        .then((res) => {
                            if (res.code === 0) {
                                let data = res.data.body || {},
                                    meta = data.meta || [];
                                self[dataName] = tools.getCrossTableData(meta.map(m => m.toLowerCase()), data.dataList);

                                this.dataLoaded[dataName] = true;
                            } else {
                                MessageBox.alert(res.msg || '后台错误')
                            }
                        })
                }
            }
        },
        data () {
            return {
                selected: 0,
                authing: [],
                authed: [],
                unauth: [],
                dataLoaded: {
                    authing: false,
                    authed: false,
                    unauth: false,
                }
            }
        }
    }

</script>

<style scoped lang="scss">
.auth-list-page {
    padding-top: 46px;
    padding-bottom: 66px;
    height: 100vh;

    .nav {
        background: #fff;
    }

    .button {
        position: fixed;
        bottom: 20px;
        right: 0;
        left: 0;
        margin: 0 auto;
        width: 85%;
    }

}
</style>
