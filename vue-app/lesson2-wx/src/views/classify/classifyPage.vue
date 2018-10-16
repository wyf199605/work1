<template>
    <div class="classify-page">
        <div class="classify-header">
            <le-navbar :isSearch="true" @onSearch="onSearch"></le-navbar>
        </div>
        <div class="classify-content">
            <le-panel-list :panelData="data" @select="onSelect"></le-panel-list>
        </div>
        <le-tabbar :selected="selected"></le-tabbar>
    </div>
</template>

<script>
    import navbar from '../../components/navbar/Navbar';
    import panelList from '../../components/panel/PanelList';
    import request from '../../utils/request';
    import {CONF} from '../../utils/URLConfig';
    import { MessageBox, Indicator } from 'mint-ui';
    import Tabbar from '../../components/tabbar/Tabbar';
    export default {
        name: "classify-page",
        components: {
            "le-navbar": navbar,
            "le-panel-list": panelList,
            "le-tabbar":Tabbar
        },
        methods: {
            onSearch(e){
                if(e !== ''){
                    let dataUrl = CONF.url.classifyData,
                        uiUrl = CONF.url.classifyUI;
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
            onSelect(obj){
                console.log(obj);
                this.$router.push({
                    path: 'commonPage',
                    query:{
                        param: JSON.stringify([['ACTIVITY_CATALOG_ID2', [obj.ID]]]),
                        dataUrl: CONF.url.classifyData,
                        uiUrl: CONF.url.classifyUI,
                        isSearch: 0,
                        title: obj.TITLE,
                        defaultValues: JSON.stringify({ACTIVITY_CATALOG_ID2: obj.TITLE})
                    }
                })
            },
            loadData(){
                Indicator.open('加载中...');
                request.get(CONF.url.classify).then((res) => {
                    // console.log(res);
                    this.data = res.data.map((data) => {
                        return {
                            text: data.TITLE,
                            value: data,
                            children: Array.isArray(data.CHILDREN) ? data.CHILDREN.map((d) => {
                                return {
                                    text: d.TITLE,
                                    value: d,
                                }
                            }) : null,
                        }
                    });
                    Indicator.close();
                }).catch((e) => {
                    console.log(e);
                    Indicator.close();
                    MessageBox.confirm('数据加载失败，是否重试?', '温馨提示').then(action => {
                        this.loadData();
                    }).catch(() => {

                    });
                })
            }
        },
        created(){
            document.title = '分类';
            this.loadData();
        },
        data(){
            return {
                data: [],
                selected:'classify'
            }
        }
    }
</script>

<style lang="scss">
    .classify-page{
        background-color: #ffffff;
        padding-bottom: 55px;
        height: 100%;
        overflow: hidden;
        .classify-content{
            margin-top: .3rem;
            height: calc(100% - 1.5rem);
            overflow: auto;
        }
    }
</style>
