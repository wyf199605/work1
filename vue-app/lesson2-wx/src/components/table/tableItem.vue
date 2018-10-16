<template>
    <div class="table-item-wrapper">
        <div class="table-item-content" @click="clickHandler">
            <div v-if="isImage" class="table-item-left">
                <img :src="getImage(img)" alt="图片">
                <div v-if="!!imgLabel" class="table-item-img-label">
                    {{imgLabel}}
                </div>
            </div>
            <div class="table-item-right">
                <div v-if="!!title" class="table-item-title" v-html="getTitle"></div>
                <div v-if="!!countDown" class="table-item-count">{{time}}</div>
                <div v-if="!!label" class="table-item-labels">
                    <div v-for="item in labels" class="table-item-label item-btn default">{{item}}</div>
                </div>
                <div v-if="Array.isArray(body)" class="table-item-body">
                    <p v-for="item in body" v-if="!!item">{{item}}</p>
                </div>
                <div v-if="!!status" :class="['item-btn', 'table-item-status', getStatusClass(status)]">{{status}}</div>
            </div>
        </div>
        <div class="more">
            <slot></slot>
        </div>
        <div v-if="Array.isArray(buttons)" class="table-item-btns-group">
            <le-button-group :buttons="buttons"></le-button-group>
        </div>
    </div>
</template>

<script>
    import LeButtonGroup from '../buttonGroup/LeButtonGroup';
    import tools from '../../utils/tool';

    export default {
        name: "table-item",
        props: {
            rowData: {
                type: Object,
                required: true
            },
            buttons: {
                type: Array,
                required: false,
            },
            highlight: {
                type: String,
                default: ''
            }
        },
        components: {
            "le-button-group": LeButtonGroup,
        },
        computed: {
            labels() {
                return this.label.split(',');
            },
            isImage() {
                return 'img' in this.rowData;
            },
            getTitle(){
                return tools.highlight(this.title, this.identify, 'red');
            }
        },
        methods: {
            getImage(img){
                if(img && this.imgField){
                    return tools.fileUrlGet(img, this.imgField ? this.imgField.toUpperCase() : '', true);
                }else{
                    return img || '';
                }
            },
            getStatusClass(state){
                switch (state){
                    case '进行中':
                        return 'info';
                    case '已发布':
                        return 'primary';
                    case '报名中':
                        return 'running';
                    case '待开展':
                        return 'wait';
                    case '已结束':
                    default:
                        return 'default';
                }
            },
            getTime() {
                if(!this.countDown){
                    clearInterval(this.timer);
                    return;
                }
                let date = new Date(),
                    targetTime = new Date(this.countDown.replace(/-/g, "/")),
                    total = (targetTime.getTime() - date.getTime()) / 1000;

                if (targetTime.getTime() < date.getTime()) {
                    this.time = '活动已开始';
                    clearInterval(this.timer);
                    return;
                }
                let day = parseInt(total / (24 * 60 * 60)),
                    afterDay = total - day * 24 * 60 * 60,
                    hour = parseInt(afterDay / (60 * 60)),
                    afterHour = total - day * 24 * 60 * 60 - hour * 60 * 60,
                    min = parseInt(afterHour / 60),
                    sec = parseInt(total - day * 24 * 60 * 60 - hour * 60 * 60 - min * 60);
                // let targetDate = new Date(timestamp),
                //     year = targetDate.getFullYear() - date.getFullYear(),
                //     month = targetDate.getMonth() - date.getMonth(),
                //     day = targetDate.getDate() - date.getDate(),
                //     hour = targetDate.getHours() - date.getHours(),
                //     min = targetDate.getMinutes() - date.getMinutes(),
                //     sec = targetDate.getSeconds() - date.getSeconds();
                // if (sec < 0) {
                //     sec += 60;
                //     min--;
                // }
                // if (min < 0) {
                //     min += 60;
                //     hour--;
                // }
                // if (hour < 0) {
                //     hour += 24;
                //     day--;
                // }

                this.time = '距活动开始时间：' +
                    (day > 0 ? day + '天' : '') + ' ' +
                    this.two(hour) + ':' + this.two(min) + ':' + this.two(sec);

            },
            two(num){
                return num > 9 ? num + '' : '0' + num;
            },
            clickHandler() {
                this.$emit('click');
            }
        },
        mounted() {
            this.getTime();
            this.timer = setInterval(this.getTime, 1000);
        },
        data() {
            return {
                img: this.rowData.img, // 图片
                imgField: this.rowData.imgField, // 图片
                imgLabel: this.rowData.imgLabel, // 图片左上角状态
                title: this.rowData.title,  // 标题
                label: this.rowData.label,  // 标签类型
                status: this.rowData.status,  // 状态  #报名是否结束？
                countDown: this.rowData.countDown, // 倒计时
                body: this.rowData.body, // 内容
                time: '',
                timer: null,
                identify: this.highlight,
            }
        },
        watch: {
            rowData(rowData) {
                this.img = rowData.img; // 图片
                this.imgLabel = rowData.imgLabel; // 图片左上角状态
                this.title = rowData.title;  // 标题
                this.label = rowData.label;  // 标签类型
                this.status = rowData.status;  // 状态  #报名是否结束？
                this.countDown = rowData.countDown; // 倒计时
                this.body = rowData.body; // 内容
                this.imgField = rowData.imgField; // 内容
            },
            highlight(e){
                this.identify = e;
            }
        }
    }
</script>

<style lang="scss">
    .table-item-wrapper {
        position: relative;
        padding: 0.4rem 0.427rem;
        overflow: hidden;
        margin-top: .2rem;
        background-color: #fff;

        .table-item-content {
            border-bottom: 1px solid #ccc;
            padding-bottom: .4rem;

            &::after {
                content: "";
                clear: both;
                display: block;
            }
            .table-item-left {
                width: 35%;
                float: left;
                img {
                    width: 100%;
                    max-height: 3.8rem;
                }
            }
            .table-item-left + .table-item-right {
                box-sizing: border-box;
                width: 65%;
                float: left;
                padding-left: .3rem;

                & > * {
                    margin-bottom: .25rem;
                }
                .table-item-count {
                    font-size: 13px;
                    color: #f5956b;
                }
                .table-item-title {
                    font-size: 14px;
                    line-height: 20px;
                    font-weight: normal;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;

                    .red{
                        color: red;
                    }
                }
                .table-item-labels {
                    .table-item-label:not(:last-child) {
                        margin-right: .15rem;
                    }
                }

                .item-btn {
                    padding: .005rem .08rem;
                    border: 1px solid #ccc;
                    border-radius: .1rem;
                    font-size: 12px;
                    display: inline-block;
                }

                .item-btn.default {
                    color: #91a8b0;
                    background: #fff;
                }
                .item-btn.primary {
                    color: #fff;
                    background-color: #65b3f1;
                    border-color: #65b3f1;
                }

                .table-item-status {
                    display: inline-block;
                    color: #91a8b0;
                    font-size: 13px;
                    background-color: #eff5f7;
                    padding: .04rem .2rem .08rem;
                    border: none;
                    border-radius: 5px;

                    &.default{
                        background-color: #d8e3e9;
                        color: #91a8b0;
                    }
                    &.info{
                        background-color: #41cbbb;
                        color: #fff;
                    }
                    &.primary{
                        background-color: #65b3f1;
                        color: #fff;
                    }
                    &.wait{
                        background-color: #8fd285;
                        color: #fff;
                    }
                    &.running{
                        background-color: #f5956b;
                        color: #fff;
                    }
                }

                .table-item-body {
                    font-size: 14px;
                    line-height: 16px;
                    letter-spacing: 0;
                    margin: 0;
                    color: #91a8b0;
                    p {
                        margin: 0 0 .2rem;
                        padding: 0;
                        /*white-space: nowrap;*/
                        /*text-overflow: ellipsis;*/
                        /*overflow: hidden;*/
                    }
                }
            }
        }
        .table-item-btns-group {
            padding: .3rem 0 0;
            &::after {
                content: "";
                clear: both;
                display: block;
            }

            .le-btn-group {
                float: right;
            }
        }
    }
</style>
