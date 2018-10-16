<template>
    <div class="common-page">
        <div class="common-header" v-if="isSearch">
            <le-navbar :isSearch="isSearch" @onSearch="onSearch" :default-value="defaultValue"></le-navbar>
        </div>
        <div class="common-body">
            <le-query v-if="isQuery && all.querier[0] && all.querier[0].cond"
                      :default-values="defaultValues" :fields="fields"
                      :cond="all.querier[0].cond" @query="onQuery"/>
            <le-table-list v-if="all.table[0] && allData" :layout="all.table[0].layout"
                       :fields="fields"  :total="allTotal" ref="tableList" :data="allData"
                       :load-data="loadMoreData" :refresh="refreshAllData" :highlight="value"/>
        </div>
    </div>
</template>

<script>
    import TableList from '../../components/table/tableList';
    import Navbar from '../../components/navbar/Navbar';
    import DataManager from '../../components/dataManager/DataManager';
    import Query from '../../components/query/query';
    import {CONF} from '../../utils/URLConfig';
    import {MessageBox, Indicator, Toast} from 'mint-ui';
    import axios from 'axios';
    import tools from '../../utils/tool';
    import request from "../../utils/request";

    export default {
        name: "common-page",
        data() {
            return {
                all: {
                    querier: [],
                    table: [],
                },
                fields: [],
                allData: [],
                allTotal: 0,
                value: '',
                defaultValue: '',
                dataUrl: '',
                uiUrl: '',
                requestObj: {},
                defaultValues: null,
                isSearch: true,
                isQuery: true,
            }
        },
        components: {
            "le-table-list": TableList,
            "le-data-manager": DataManager,
            "le-query": Query,
            "le-navbar": Navbar,
        },
        computed: {},
        methods: {
            onQuery(e){
                document.title = '活动列表';
                this.requestObj.params = e.params;

                this.refreshAllData();
            },
            onSearch(e){
                document.title = '活动搜索';
                this.value = e;

                this.requestObj.queryparam = this.value;
                // if(e !== ''){
                //     this.$router.push({
                //         path: 'commonPage',
                //         query: {
                //             search: e,
                //         }
                //     });
                // }
                this.refreshAllData();
            },
            refreshAllData() {
                Indicator.open('加载中...');
                return new Promise((resolve, reject) => {
                    this.loadAllData().then((res) => {
                        this.allTotal = res.total;
                        this.allData = res.data;

                        resolve();
                        Indicator.close();
                    }).catch((e) => {
                        console.log(e);
                        Toast('数据加载失败，请重试！');
                        reject(e);
                        Indicator.close();
                    }).finally(() => {
                        this.$refs.tableList.pageRefresh();
                    });
                })
            },
            loadMoreData(pagination) {
                return new Promise((resolve, reject) => {
                    let current = pagination.current,
                        pageSize = pagination.pageSize;
                    this.loadAllData(current + 2, pageSize).then((res) => {
                        this.allData = this.allData.concat(res.data);
                        // console.log(this.allData);
                        resolve(res.data.length === 0);
                    }).catch((e) => {
                        reject(e);
                        Toast('数据加载失败，请重试！');
                    })
                })
            },
            loadAllUI() {
                return request.get(this.uiUrl).then((res) => {
                    console.log(res);
                    let data = res.data,
                        body = data.body;

                    this.fields = data.common.fields;
                    if(body.querier){
                        this.all.querier = body.querier;
                    }
                    this.all.table = body.table;
                })
            },
            loadAllData(curren, pageSize) {
                curren = curren || 1;
                pageSize = pageSize || 50;
                return new Promise((resolve, reject) => {
                    request.get(tools.url.addObj(this.dataUrl, Object.assign({}, {
                        pageparams: '{"index"=' + curren + ',"size"=' + pageSize + ',"total"=1}',
                    }, this.requestObj))).then((res) => {
                        // console.log(res);
                        let data = res.data,
                            body = data.body,
                            head = data.head,
                            meta = body.meta,
                            dataList = body.dataList,
                            result = [];

                        for (let list of dataList) {
                            let json = {};
                            list.forEach((item, index) => {
                                json[meta[index]] = item;
                            });
                            result.push(json);
                        }
                        // console.log(result);
                        resolve({
                            data: result,
                            total: head.totalNum
                        });
                    }).catch((e) => {
                        console.log(e);
                        reject(e)
                    });
                })
            },
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                let isSearch = tools.isEmpty(to.query.isSearch) ? true : to.query.isSearch != 0,
                    isQuery = tools.isEmpty(to.query.isQuery) ? true : to.query.isQuery != 0,
                    search = to.query.search || '',
                    defaultValues = to.query.defaultValues,
                    param = to.query.param;

                console.log(isSearch);
                vm.dataUrl = to.query.dataUrl;
                vm.uiUrl = to.query.uiUrl;
                vm.isSearch = isSearch;
                vm.isQuery = isQuery;
                vm.defaultValues = defaultValues ? JSON.parse(defaultValues) : null;
                if(isSearch && search){
                    vm.value = search;
                    vm.defaultValue = search;
                    vm.requestObj.queryparam = search;
                }
                if(param){
                    vm.requestObj.params = param;
                }

                Indicator.open('加载中...');
                vm.loadAllUI().then(() => {
                    vm.refreshAllData();
                }).catch((e) => {
                    console.log(e);
                    MessageBox('数据加载失败，请重试！', '温馨提示');
                    Indicator.close();
                });
            })
        },
        mounted() {
            if(this.$route.query.title){
                document.title = this.$route.query.title;
            }
        }
    }
</script>

<style lang="scss">
    .common-page {
        height: 100%;
        box-sizing: border-box;

        .common-header + .common-body {
            height: calc(100% - 1.5rem);
        }
        .common-body {

            box-sizing: border-box;
            height: 100vh;

            .table-list-wrapper {
                height: calc(100% - 1.2rem);
            }

        }
    }
</style>
