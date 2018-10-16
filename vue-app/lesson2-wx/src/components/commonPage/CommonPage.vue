<template>
    <div class="common-page">
        <div class="common-header">
            <le-navbar v-if="selected !== -1" :list="captions" @onChange="onChange" :is-search="isSearch"
                       @onSearch="onSearch" :defaultSelect="selected"></le-navbar>
        </div>
        <div class="common-body" v-if="!!container">
            <div class="common-tab" v-if="!!tab">
                <le-query v-if="tab.querier && tab.querier[0]"
                          :cond="objOfQueries[tab.querier[0]].cond"
                          @query="onQuery"
                          :fields="fields"/>
                <le-table-list v-if="tab.table[0]"
                           :layout="objOfTable[tab.table[0]].layout"
                           :data="data"
                           :load-data="loadMoreData"
                           :refresh="refresh"
                           :total="total"
                           :pageSize="pageSize"
                           :buttons="objOfTable[tab.table[0]].buttons"
                           :fields="fields"/>
            </div>
        </div>
    </div>
</template>

<script>
    import Tabbar from '../../components/tabbar/Tabbar';
    import Navbar from '../../components/navbar/Navbar';
    import Query from '../../components/query/query';
    import TableList from '../../components/table/tableList';
    import {MessageBox, Indicator, Toast} from 'mint-ui';
    import tools from '../../utils/tool';
    import request from '../../utils/request';
    import rule from '../../utils/rule';

    export default {
        components: {
            "le-tabbar": Tabbar,
            "le-navbar": Navbar,
            "le-query": Query,
            "le-table-list": TableList
        },
        props: {
            uiUrl: {
                type: String,
                required: true,
            },
            isSearch: {
                type: Boolean,
                default: true,
            }
        },
        watch:{
            uiUrl(uiUrl){
                this.url = uiUrl;
            }
        },
        data() {
            return {
                selected: -1,
                pageSize: 50,
                container: null,
                querier: [],
                table: [],
                allData: [],
                fields: [],
                totals: [],
                url: this.uiUrl,
            }
        },
        computed: {
            captions() {
                return this.container ? this.container.tab.map((tab) => {
                    return tab.caption;
                }) : null;
            },
            objOfTable() {
                let json = {};
                this.table.forEach((table) => {
                    json[table.id] = table;
                });
                return json;
            },
            objOfQueries() {
                let json = {};
                this.querier.forEach((query) => {
                    json[query.id] = query;
                });
                return json;
            },
            tab() {
                let tabs = this.container && this.container.tab;
                return tabs ? tabs[this.selected] : {};
            },
            data() {
                return this.allData[this.selected] || []
            },
            total(){
                return this.totals[this.selected] || 0;
            }
        },
        created() {
            // 加载ajax数据
            Indicator.open('加载中...');
            this.loadUI().then(() => {
                let index = 0;
                console.log(this.container.deftPage);
                if(typeof this.container.deftPage === 'number'){
                    index = this.container.deftPage;
                }
                this.initData(index);
            }).catch(() => {
                MessageBox('提示', '获取数据失败，请重试');
                Indicator.close();
            })
        },
        methods: {
            refresh(){
                Indicator.open('加载中...');
                return new Promise((resolve, reject) => {
                    this.getAjaxData(this.selected).then((res) => {
                        this.allData[this.selected] = res.data;
                        this.totals[this.selected] = res.total;
                        let index = this.selected;
                        this.selected = -1;
                        this.selected = index;
                        resolve();
                        Indicator.close();
                    }).catch(() => {
                        reject();
                        Indicator.close();
                        Toast('刷新失败，请重试');
                    });
                });
            },
            loadMoreData(e){
                return new Promise((resolve, reject) => {
                    this.getAjaxData(this.selected, e.current + 2, e.pageSize).then((res) => {
                        this.allData[this.selected] = this.allData[this.selected].concat(res.data);
                        let index = this.selected;
                        this.selected = -1;
                        this.selected = index;
                        resolve();
                    }).catch(() => {
                        reject();
                    });
                })
            },
            getAjaxData(index, current, pageSize){
                current = current || 1;
                pageSize = pageSize || 50;
                return new Promise((resolve, reject) => {
                    if (this.table[index].link) {
                        let url = rule.linkParse2Url(this.table[index].link);
                        request.get('http://sc.fastlion.cn/dekt' + url + '?pageparams=' +
                            encodeURIComponent('{"index":' + current + ',"size":' + pageSize + ',"total":1}')).then((res) => {

                            // console.log(res);
                            let data = res.data,
                                body = data.body,
                                head = data.head,
                                dataList = body.dataList,
                                meta = body.meta,
                                result = [];

                            dataList.forEach((list) => {
                                let json = {};
                                list.forEach((item, index) => {
                                    json[meta[index]] = item;
                                });
                                result.push(json);
                            });

                            resolve({data: result, total: head.totalNum});
                        }).catch((e) => {
                            console.log(e);
                            reject(e)
                        })
                    }else{
                        reject()
                    }
                })

            },
            initData(index){
                return new Promise(() => {
                    if(!this.allData[index]){
                        Indicator.open('加载中...');
                        this.getAjaxData(index).then((res) => {
                            this.allData[index] = res.data;
                            this.totals[index] = res.total;
                            this.selected = -1;
                            this.selected = index;
                            Indicator.close();
                        }).catch(() => {
                            MessageBox('数据加载失败');
                            this.selected = index;
                            Indicator.close();
                        });
                    }else{
                        this.selected = index;
                    }
                })

            },
            loadUI() {
                return new Promise((resolve, reject) => {
                    if(this.url){
                        request.get(this.url)
                            .then((response) => {
                                let data = response.data,
                                    body = response.data.body,
                                    container = body.container,
                                    table = body.table,
                                    querier = body.querier;
                                // console.log(response);
                                this.fields = data.common.fields;
                                this.container = container;
                                querier && (this.querier = querier);
                                this.table = table;
                                console.log(response);
                                resolve();
                            }).catch(() => {
                            reject()
                        })
                    }else{
                        reject();
                    }
                })

            },
            onChange(selected) {
                this.selected = selected;
                this.initData(selected);
            },
            onSearch(e) {
                console.log(e)
            },
            onQuery(e) {
                console.log(e)
            },
        }
    }
</script>

<style lang="scss">
    .common-page {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        padding-bottom: 55px;
        box-sizing: border-box;

        .query-module-wrapper, .common-header, .table-item-wrapper {
            background: #fff;
        }
        .common-body {
            height: calc(100% - 2.6rem);
            overflow: hidden;
            position: relative;
            .common-tab {
                height: 100%;
                position: relative;
                .table-list-wrapper {
                    height: calc(100% - 1.3rem);
                }
            }
        }
    }
</style>
