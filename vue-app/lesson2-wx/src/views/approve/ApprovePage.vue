<template>
    <div class="approve-page">
        <commonPage :ui-url="null"></commonPage>
        <tabbar :selected="selected"></tabbar>
    </div>
</template>

<script>
    import tabbar from '../../components/tabbar/Tabbar'
    import commonPage from '../../components/commonPage/CommonPage'

    export default {
        components: {
            tabbar,
            commonPage
        },
        data() {
            return {
                selected: 'approve'
            }
        },
        methods: {

        }
    }
</script>

<style lang="scss" scoped>
    .approve-page {
        position: absolute;
        top: 0;
        left: 0;
        min-height: 100%;
        width: 100%;
        background-color: #f8f8f8;
    }
</style>
