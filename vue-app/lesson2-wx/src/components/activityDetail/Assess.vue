<template>
    <div class="activity-evaluate">
        <div class="header">
            <span>综合评价</span>
            <start-group v-if="starCount !== -1" :total="5" :default="starCount" :is-change="false"></start-group>
            <span>（共{{total}}条评论）</span>
        </div>
        <div class="content" v-if="rowData && rowData.length > 0">
            <data-manager :page-size="pageSize" ref="pagination"
                          :total="total" :on-load="loadMore" :on-refresh="refresh">
                <eval-cell v-for="cellData in rowData" :cell-data="cellData"></eval-cell>
            </data-manager>
        </div>
    </div>
</template>

<script>
    import startGroup from '../starGroup/starGroup';
    import evalCell from '../evalCell/EvalCell';
    import dataManager from '../dataManager/DataManager';
    import request from '../../utils/request';
    import tools from '../../utils/tool';
    import {CONF} from '../../utils/URLConfig';
    import { MessageBox, Indicator, Toast } from 'mint-ui';
    export default {
        name: "evaluate",
        components: {
            'start-group': startGroup,
            'eval-cell': evalCell,
            'data-manager': dataManager,
        },
        props:{
            activityid: {
                required: true,
                type: String,
            }
        },
        created(){
            this.loadTotalPoint();
            Indicator.open();
            this.loadData().then((res) => {
                this.total = res.total;
                this.rowData = res.data;
            }).catch(() => {
                MessageBox.confirm('数据加载失败，是否重试?', '温馨提示').then(action => {
                    this.loadData();
                }).catch(() => {});
            }).finally(() => {
                Indicator.close();
            });
        },
        methods:{
            refresh(){
                Indicator.open();
                return new Promise((resolve, reject) => {
                    this.loadData().then((res) => {
                        this.total = res.total;
                        this.rowData = res.data;
                        resolve();
                    }).catch(() => {
                        reject();
                        this.refs.pagination.refresh();
                    }).finally(() => {
                        Indicator.close();
                    });
                })
            },
            loadTotalPoint(){
                request.get(CONF.url.detailAssessTotal, {activity_id: this.activityId}).then((res) => {
                    let data = res.data,
                        body = data.body,
                        dataList = body.dataList;

                    this.starCount = dataList[0][0] ? Math.round(parseFloat(dataList[0][0])) : 0;
                }).catch((e) => {
                    console.log(e);
                    this.starCount = 0;
                });
            },
            loadMore(e){
                return new Promise((resolve, reject) => {
                    this.loadData(e.current + 2, e.pageSize).then((res) => {

                        this.rowData = this.rowData.concat(res.data);
                        console.log(res.data);
                        console.log(!(res.data.length > 0));
                        resolve(!(res.data.length > 0));
                    }).catch((e) => {
                        reject(e);
                        Toast('数据加载失败，请重试！');
                    })
                })
            },
            loadData(current, pageSize){
                pageSize = pageSize || 50;
                current = current || 1;
                return new Promise((resolve, reject) => {
                    request.get(tools.url.addObj(CONF.url.activityComment, {
                            pageparams: '{"index"=' + current + ',"size"=' + pageSize + ',"total"=1}',
                            activity_id: this.activityId
                        })).then((res) => {
                        let data = res.data,
                            body = data.body,
                            dataList = body.dataList,
                            meta = body.meta,
                            head = data.head,
                            result = [];
                        if(Array.isArray(dataList) && Array.isArray(meta)){
                            dataList.forEach((list) => {
                                let json = {};
                                list.forEach((item, index) => {
                                    json[meta[index]] = item;
                                });
                                result.push(json);
                            });
                            resolve({
                                data: result,
                                total: head.totalNum || result.length
                            })
                        }else{
                            resolve({
                                data: [],
                                total: 0,
                            })
                        }
                    }).catch((e) => {
                        Indicator.close();
                        reject(e);
                    });
                })

            }
        },
        watch: {
            activityid(e){
                console.log(e);
                this.activityId = e;
            }
        },
        data(){
            return {
                loadCount: 0,
                starCount: -1,
                total: 0,
                rowData: [],
                pageSize: 50,
                activityId: this.activityid,
            }
        }
    }
</script>

<style lang="scss">
    .activity-evaluate{
        height: 100%;
        .header{
            padding: .3rem .4rem;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;

            span{
                line-height: inherit;
            }
        }
        .content{
            height: calc(100% - 1.5rem);
            overflow: auto;
        }
    }
</style>
