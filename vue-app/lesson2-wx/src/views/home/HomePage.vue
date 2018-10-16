<template>
    <div class="home-page">
        <div class="home-header">
            <le-navbar :list="titles" @onChange="onChange" @onSearch="onSearch"></le-navbar>
        </div>
        <div class="home-body">
            <div v-show="selected===0" class="home-recommend">
                <div class="home-slideshow" v-if="pictures && pictures.length > 0">
                    <mt-swipe :auto="5000">
                        <mt-swipe-item v-for="(pic,index) in pictures" :key="index">
                            <img @click="openUrl(pic)" :src="getImgUrl(pic.img, pic.imgtype)" alt="">
                        </mt-swipe-item>
                    </mt-swipe>
                </div>
                <div class="home-content">
                    <div class="home-recommend-label">
                        为你推荐
                    </div>
                    <div class="home-data-list">
                        <le-table-list v-if="recommend.table && recommend.table[0]"
                                       :fields="recFields" :page-size="50" ref="recTable"
                                       :layout="recommend.table[0].layout" :total="recTotal" :data="recData"
                                       :load-data="loadRecMoreData" :refresh="refreshRecData"/>

                    </div>
                </div>
            </div>
            <div v-show="selected===1" class="home-all">
                <le-query v-if="all.querier.length > 0" @query="onQuery" :fields="fields" :cond="all.querier[0].cond"/>
                <le-table-list ref="tableList" v-if="all.table && all.table[0]" :fields="fields"
                               :layout="all.table[0].layout" :total="allTotal" :page-size="50"
                               :data="allData" :load-data="loadAllMoreData" :refresh="refreshAllData"/>
            </div>
        </div>
        <le-tabbar :selected="selectedTab"></le-tabbar>
    </div>
</template>

<script>
    import Navbar from '../../components/navbar/Navbar';
    import Tabbar from '../../components/tabbar/Tabbar';
    import TableList from '../../components/table/tableList';
    import DataManager from '../../components/dataManager/DataManager';
    import Query from '../../components/query/query';
    import {CONF} from '../../utils/URLConfig';
    import {MessageBox, Indicator, Toast} from 'mint-ui';
    import request from '../../utils/request';
    import tools from '../../utils/tool';

    export default {
        name: "home-page",
        data() {
            return {
                selectedTab: "home",
                titles: ['为你推荐', '全部列表'],
                all: {
                    querier: [],
                    table: [],
                },
                fields: [],
                recFields: [],
                recommend: {
                    querier: [],
                    table: [],
                },
                allData: [],
                allTotal: 1000,
                recData: [],
                recTotal: 1000,
                selected: 0,
                pictures: [],
                requestData: {},
            }
        },
        components: {
            "le-navbar": Navbar,
            "le-tabbar": Tabbar,
            "le-table-list": TableList,
            "le-data-manager": DataManager,
            "le-query": Query,
        },
        computed: {},
        methods: {
            getImgUrl(url, type){
                if(type === 1){
                    return tools.fileUrlGet(url, 'img')
                }else{
                    return url;
                }
            },
            openUrl(obj) {
                if(obj.activityid){
                    this.$router.push({
                        path: 'detail',
                        query: {
                            activityid: obj.activityid
                        },
                    })
                }else if(obj.url){
                    window.open(obj.url);
                }
                // console.log(url);
            },
            loadPic() {
                request.get(CONF.url.homePic).then((res) => {
                    // console.log(res);
                    let data = res.data,
                        pic = data.pictures;
                    this.pictures = pic;
                }).catch((e) => {
                    Toast('图片加载失败！');
                    console.log(e);
                })
            },
            refreshAllData() {
                Indicator.open('加载中...');
                return new Promise((resolve, reject) => {
                    this.loadData(null, null, false).then((res) => {
                        this.allTotal = res.total;
                        this.allData = res.data;
                        resolve();
                        Indicator.close();
                        this.$refs.tableList.pageRefresh && this.$refs.tableList.pageRefresh();
                    }).catch((e) => {
                        Toast('数据加载失败，请重试！');
                        reject(e);
                        Indicator.close();
                    });
                })
            },
            refreshRecData() {
                Indicator.open('加载中...');
                return new Promise((resolve, reject) => {
                    this.loadData(null, null, false, CONF.url.homeRecData).then((res) => {
                        this.recTotal = res.total;
                        this.recData = res.data;
                        resolve();
                        Indicator.close();
                        this.$refs.recTable.pageRefresh && this.$refs.recTable.pageRefresh();
                    }).catch((e) => {
                        Toast('数据加载失败，请重试！');
                        reject(e);
                        Indicator.close();
                    });
                })
            },
            loadAllMoreData(pagination) {
                return new Promise((resolve, reject) => {
                    let current = pagination.current,
                        pageSize = pagination.pageSize;
                    this.loadData(current + 2, pageSize, true).then((res) => {
                        this.allData = this.allData.concat(res.data);
                        // console.log(this.allData);
                        resolve();
                    }).catch((e) => {
                        reject(e);
                        Toast('数据加载失败，请重试！');
                    })
                })
            },
            loadRecMoreData(pagination) {
                return new Promise((resolve, reject) => {
                    let current = pagination.current,
                        pageSize = pagination.pageSize;
                    this.loadData(current + 2, pageSize, true, CONF.url.homeRecData).then((res) => {
                        this.recData = this.recData.concat(res.data);
                        // console.log(this.allData);
                        resolve();
                    }).catch((e) => {
                        reject(e);
                        Toast('数据加载失败，请重试！');
                    })
                })
            },
            onChange(e) {
                this.selected = e;
                if (e === 1) {
                    if (tools.isEmpty(this.all.querier) && tools.isEmpty(this.all.table)) {
                        Indicator.open('加载中...');
                        this.loadAllUI().then(() => {
                            this.refreshAllData();
                        }).catch(() => {
                            MessageBox('数据加载失败，请重试！', '温馨提示');
                            Indicator.close();
                        });
                    }
                }
            },
            onSearch(e){
                if(e !== ''){
                    let dataUrl, uiUrl;
                    if(this.selected === 1){
                        dataUrl = CONF.url.homeAllData;
                        uiUrl = CONF.url.homeAllUI;
                    }else{
                        dataUrl = CONF.url.homeRecData;
                        uiUrl = CONF.url.homeRecUI;
                    }
                    this.$router.push({
                        path: 'commonPage',
                        query: {
                            search: e,
                            dataUrl,
                            uiUrl,
                            title: '活动搜索',
                        }
                    });
                }
            },
            loadAllUI() {
                return request.get(CONF.url.homeAllUI).then((res) => {
                    // console.log(res);
                    let data = res.data,
                        body = data.body;
                    this.fields = data.common.fields;
                    this.all.querier = body.querier;
                    this.all.table = body.table;
                    console.log(this.fields);
                })
            },
            loadRecUI() {
                return request.get(CONF.url.homeRecUI).then((res) => {
                    // console.log(res);
                    let data = res.data,
                        body = data.body;
                    // this.recommend.querier = body.querier;
                    this.recFields = data.common.fields;
                    this.recommend.table = body.table;
                })
            },
            loadData(current, pageSize, isLocal = false, url = CONF.url.homeAllData) {
                current = current || 1;
                pageSize = pageSize || 50;
                return new Promise((resolve, reject) => {
                    request.get(tools.url.addObj(url , Object.assign({}, {
                        pageparams: '{"index"=' + current + ',"size"=' + pageSize + ',"total"=' + 1 + '}',
                    }, this.requestData)), void 0, isLocal).then((res) => {
                        if(res.code === 0){
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
                        }else{
                            reject()
                        }
                        // console.log(res);

                    }).catch((e) => {
                        console.log(e);
                        reject(e)
                    });
                })
            },
            onQuery(e){
                this.requestData = {
                    params: e.params
                };
                console.log(e);
                this.refreshAllData();

            }
        },
        mounted() {
            document.title = '首页';
            let self = this;
            loadUI();
            this.loadPic();
            function loadUI(){
                Indicator.open('加载中...');
                self.loadRecUI().then(() => {
                    self.refreshRecData();
                }).catch(() => {
                    Indicator.close();
                    MessageBox.confirm('数据加载失败，是否重试?', '温馨提示').then(() => {
                        loadUI();
                    });
                });
            }
        }
    }
</script>

<style lang="scss">
    .home-page {
        height: 100%;
        padding-bottom: 55px;
        box-sizing: border-box;

        .home-header {
            background: #fff;
            .lesson2-navbar {
                .navbar-list {
                    padding-left: 2rem;
                    padding-right: 2rem;
                }

            }
        }
        .home-body {
            box-sizing: border-box;
            height: calc(100% - 2.45rem);
            .home-recommend {
                height: 100%;
                overflow: hidden;
                .home-slideshow {
                    height: 4.8rem;
                    img {
                        width: 100%;
                        height: 100%;
                    }
                }
                .home-content {
                    height: calc(100% - 4.8rem);
                    .home-recommend-label {
                        background: #fff;
                        position: relative;
                        box-sizing: border-box;
                        height: 1rem;
                        padding: .2rem .7rem;
                        font-size: 16px;

                        &::before {
                            content: "";
                            display: block;
                            position: absolute;
                            width: 0.08rem;
                            height: 0.48rem;
                            background-color: #0099ff;
                            left: 0.4rem;
                            top: 0.25rem;
                        }
                    }
                    .home-data-list {
                        height: calc(100% - 1rem);
                        overflow: hidden;
                        position: relative;
                        .table-list-wrapper {
                            position: relative;
                            height: 100%;
                        }
                    }
                }
            }

            .home-all {
                height: 100%;
                .table-list-wrapper {
                    height: calc(100% - 52px);
                }
            }
        }
    }
</style>
