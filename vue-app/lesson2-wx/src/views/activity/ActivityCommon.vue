<template>
    <div>
        <le-query v-if="all.querier[0]" :cond="all.querier[0].cond"/>
        <le-table-list v-if="all.table[0]" :layout="all.table[0].layout" :total="allTotal"
                       :data="allData" :load-data="loadMoreData" :refresh="refreshAllData"/>
    </div>
</template>

<script>
    export default {
        name: "activity-common",
        data(){
            return {

            }
        }
    }
</script>

<style scoped>

</style>
