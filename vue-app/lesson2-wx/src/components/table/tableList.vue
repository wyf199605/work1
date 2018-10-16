<template>
    <div class="table-list-wrapper">
            <data-manager v-if="rowsData && (rowsData.length > 0)" ref="pagination" :pageSize="pageSize" :onLoad="loadData"
                          :total="total" :on-refresh="refresh">
                <table-item v-for="(rowData, index) in rowsData" :key="index" :highlight="highlight"
                            :rowData="rowData" :buttons="buttons" @click="clickHandler(rowData)"></table-item>
            </data-manager>
            <data-manager v-else ref="pagination" :pageSize="pageSize" :on-refresh="refresh" :isLoadEnd="true">
                <div class="table-no-data">
                    <span class="sec seclesson-zanwushuju"></span>
                </div>
            </data-manager>
    </div>
</template>

<script>
    import tableItem from './tableItem';
    import dataManager from '../dataManager/DataManager';
    import request from '../../utils/request';
    import rule from '../../utils/rule';

    export default {
        name: "table-list",
        components: {
            "table-item": tableItem,
            "data-manager": dataManager,
        },
        props: {
            layout: {
                type: Object,
                required: true,
            },
            total: {
                type: Number,
                default: 0,
            },
            pageSize: {
                type: Number,
                default: 50,
            },
            data: {
                type: Array,
                default: [],
            },
            buttons: {
                type: Array,
                required: false,
            },
            loadData: { // 返回一个Promise对象
                type: Function,
                required: false,
            },
            refresh:{// 返回一个Promise对象
                type: Function,
                required: false,
            },
            highlight:{
                type: String,
                required: false,
            },
            fields: {
                type: Array,
                required: false,
            }
        },
        data(){
            return {
                innerData: this.data,
            }
        },
        computed: {
            itemLayout(){
                let itemLayout = {
                    title: '',
                    body: [],
                    img: '',
                    imgStatue: '',
                    label: '',
                    status: '',
                    countDown: '',
                };
                for(let name in this.layout){
                    let key= this.layout[name];
                    if(Array.isArray(itemLayout[key])){
                        itemLayout[key].push(name);
                    }else{
                        itemLayout[key] = name;
                    }
                }
                return itemLayout
            },
            rowsData(){
                let layout = this.itemLayout;
                return this.innerData && this.innerData.map((data) => {
                    return {
                        title: data[layout.title],
                        img: data[layout.img],
                        imgField: layout.img,
                        label: data[layout.label],
                        imgStatue: data[layout.imgStatue],
                        status: data[layout.status],
                        countDown: data[layout.countDown],
                        body: layout.body ? layout.body.map((name) => {
                            let str = '';
                            if(this.fields){
                                for(let field of this.fields){
                                    if(field.name === name){
                                        str += field.caption + '：';
                                        break;
                                    }
                                }
                            }
                            str += data[name];
                            return str;
                        }) : null,
                        id: data['ACTIVITY_ID'],
                    };
                });
            }
        },
        watch: {
            data(e){
                this.innerData = e;
            }
        },
        methods: {
            clickHandler(data){
                // console.log(data);
                this.$router.push({
                    path: 'detail',
                    query: {
                        activityid: data.id
                    },
                })
            },
            pageRefresh(){
                this.$refs.pagination && this.$refs.pagination.refresh();
            }
        }
    }
</script>

<style lang="scss">
    .table-list-wrapper{
        overflow: auto;
        height: 100%;
    }
    .table-no-data{
        height: 300px;
        line-height: 300px;
        text-align: center;
        color: #91a8b0;
        .sec{
            font-size: 150px;
        }
    }
</style>
