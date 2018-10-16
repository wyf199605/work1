<template>
    <mt-loadmore :top-method="!!onRefresh ? loadBottom : void 0" :bottom-all-loaded="isEnd"
                 :bottom-method="loadMore" ref="loadmore">
        <slot></slot>
    </mt-loadmore>
</template>

<script>
    import { Toast } from 'mint-ui';
    import tools from '../../utils/tool';
    export default {
        name: "data-manager",
        props: {
            total: {
                type: Number,
                default: 0,
            },
            pageSize: {
                type: Number,
                default: 50,
            },
            onLoad: {
                type: Function,
                required: false,
            },
            onRefresh: {
                type: Function,
                required: false,
            },
            isLoadEnd: {
                type: Boolean,
                default: false,
            }
        },
        methods: {
            refresh(){
                this.current = 0;
                this.count = 0;
                this.isEnd = false;
                this.$refs.loadmore.onTopLoaded();
                this.$refs.loadmore.onBottomLoaded();
            },
            loadBottom(){
                // console.log("下拉");
                this.onRefresh && this.onRefresh(this.pagination).then(() => {
                    this.current = 0;
                    this.count = 0;
                    this.isEnd = false;
                    this.$refs.loadmore.onTopLoaded()
                });
            },
            loadTop(){
                let self = this;
                console.log("上啦");
                // console.log(this.allLoaded);
                // this.isEnd = false;
                if(this.total !== 0){
                    if(this.allLoaded){
                        setTimeout(() => {
                            this.isEnd = true;
                            self.$refs.loadmore.onBottomLoaded();
                            Toast('已无更多数据');
                        }, 500);
                    }else{
                        this.onLoad && this.onLoad(this.pagination).then((isEnd) => {
                            if(isEnd){
                                this.isEnd = true;
                                Toast('已无更多数据');
                                self.$refs.loadmore.onBottomLoaded();
                            }else{
                                self.current ++;
                            }
                            // self.$refs.loadmore.onBottomLoaded();
                        }).catch(() => {
                            this.count ++;
                            if(this.count > 5){
                                this.isEnd = true;
                            }
                            // self.$refs.loadmore.onBottomLoaded();
                        }).finally(() => {
                            setTimeout(() => {
                                self.$refs.loadmore.onBottomLoaded();
                            }, 500);
                        });
                    }
                }

            }
        },
        data(){
            return {
                loadmore: null,
                current: 0,
                isEnd: this.isLoadEnd,
                allLoaded: this.pageSize * (this.current + 1) >= this.total,
                count: 0,
            }
        },
        watch:{
            total(val){
                this.allLoaded = this.pageSize * (this.current + 1) >= val;
                // this.isEnd = val > 0;
            },
            current(val){
                this.allLoaded = this.pageSize * (val + 1) >= this.total
            },
            pageSize(val){
                this.allLoaded = val * (this.current + 1) >= this.total
            }
        },
        computed: {
            pagination(){
                return {
                    isEnd: this.isEnd,
                    total: this.total,
                    pageSize: this.pageSize,
                    current: this.current,
                }
            },
            loadMore(){
                return tools.pattern.debounce(() => this.loadTop(), 1000);
            }
        }
    }
</script>

<style>

</style>
