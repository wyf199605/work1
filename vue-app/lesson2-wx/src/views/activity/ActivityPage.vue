<template>
    <div class="activity-page">
        <common-page :ui-url="url"></common-page>
        <tabbar :selected="title"></tabbar>
    </div>
</template>

<script>
    import commonPage from '../../components/commonPage/CommonPage';
    import tabbar from '../../components/tabbar/Tabbar';
    import {CONF} from '../../utils/URLConfig';

    export default {
        components: {
            commonPage,
            tabbar
        },
        data() {
            return {
                title: "activity",
                url: CONF.ajaxUrl.activityUI
            }
        },
        computed: {

        },
    }
</script>

<style lang="scss">
    .activity-page {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        padding-bottom: 55px;
        background-color: #f8f8f8;
        box-sizing: border-box;

        .query-module-wrapper, .activity-header, .table-item-wrapper {
            background: #fff;
        }
        .activity-body {
            height: calc(100% - 2.6rem);
            overflow: hidden;
            position: relative;
            .activity-tab {
                height: 100%;
                position: relative;
                .table-list-wrapper {
                    height: calc(100% - 1.3rem);
                }
            }
        }
    }
</style>
