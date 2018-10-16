<template>
    <div class="mine-tab-page">
        <common-page v-if="url" :ui-url="url" :is-search="false"></common-page>
    </div>
</template>

<script>
    import commonPage from '../../components/commonPage/CommonPage';
    import {CONF} from '../../utils/URLConfig';

    export default {
        components: {
            commonPage
        },
        data() {
            return {
                url: null,
            }
        },
        computed: {

        },
        beforeRouteEnter(to, from, next){
            next(vm => {
                if(to.query.url){
                    vm.url = to.query.url;
                }
            })
        }
    }
</script>

<style lang="scss">
    .mine-tab-page {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: #f8f8f8;
        box-sizing: border-box;
        .common-page{
            padding-bottom: 0!important;
        }

        .lesson2-navbar{
            .navbar-list{
                padding: 0.2rem .5rem;
                a.navbar-item{
                    min-width: 80px;
                    margin-right: .15rem!important;
                }
            }
        }

        .query-module-wrapper, .activity-header, .table-item-wrapper {
            background: #fff;
        }
        .common-body {
            height: calc(100% - 1.2rem)!important;

            .table-list-wrapper{
                height: 100% !important;
            }
        }
    }
</style>
