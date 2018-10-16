<template>
    <div class="select-input-wrapper">
    <div class="text-input" @click="readonly ? showPicker() : null">
        <input v-model="value" :disabled="readonly" :readonly="readonly" :placeholder="placeholder" type="text">
        <a class="icon sec seclesson-daosanjiao" @click="readonly ? null : showPicker()"></a>
    </div>
    <mt-popup :position="position" v-model="isShow">
        <div class="btn-group">
            <mt-button size="small" type="default" @click="hidePicker()">取消</mt-button>
            <span>{{pickerTitle}}</span>
            <mt-button size="small" type="primary" @click="selectHandler()">确定</mt-button>
        </div>
        <mt-spinner v-show="loading" :type="0"></mt-spinner>
        <mt-picker v-show="!loading" :slots="listData" @change="onValuesChange"></mt-picker>
    </mt-popup>
    </div>
</template>

<script>
    import { Toast } from 'mint-ui';
    export default {
        name: "select-text",
        props: {
            placeholder: {
                type: String,
                default: '',
            },
            title: {
                type: String,
            },
            titleField: {
                type: String,
            },
            dataList: {
                type: Array,
                required: false
            },
            link: {
                required: false
            },
            readonly: {
                type: Boolean,
                default: true,
            },
            name: String,
            getData: {
                type: Function,
                required: false
            },
            defaultValue: {
                type: String,
                default: '',
            }
        },
        computed: {
            pickerTitle(){
                return this.title || this.placeholder;
            }
        },
        methods: {
            showPicker(){
                this.loading = false;
                if(Array.isArray(this.dataList)){
                    // let data = this.dataList.map((data) => {
                    //     return typeof data === 'object' ? data.title : data;
                    // });
                    // this.listData = [{values: data}];
                    this.listData = [{values: this.dataList.map((data) => {
                            return typeof data === 'object' ? data.title : data;
                        })
                    }];
                    this.values = this.dataList.map((data) => {
                        return typeof data === 'object' ? data.value : data;
                    });
                }else{
                    this.loading = true;
                    this.getData && this.getData({
                        link: this.link,
                        name: this.name,
                        titleField: this.titleField
                    }).then((res) => {
                        // let data = res.map((data) => {
                        //     return typeof data === 'object' ? data.title : data;
                        // });
                        console.log(res.map((data) => {
                            return typeof data === 'object' ? data.title : data;
                        }));
                        this.listData = [{values: res.map((data) => {
                                return typeof data === 'object' ? data.title || '' : data || '';
                            })
                        }];
                        this.values = res.map((data) => {
                            return typeof data === 'object' ? data.value : data;
                        });
                        this.loading = false;
                    }).catch((e) => {
                        console.log(e);
                        this.loading = false;
                        Toast('加载数据失败')
                    });
                }
                this.isShow = true;
            },
            hidePicker(){
                this.isShow = false;
            },
            selectHandler(){
                this.value = this.selectedValue;
                let self = this,
                    index = this.listData[0].values.indexOf(this.value);
                this.$emit('select', {
                    index: index,
                    value: this.values[index],
                    title: this.value,
                    name: this.name,
                    titleField: this.titleField
                });
                this.isShow = false;
            },
            onValuesChange(picker, values){
                this.selectedValue = values[0];
            }
        },
        data() {
            return {
                listData: [{values:[]}],
                isShow: false,
                position: 'bottom',
                value: this.defaultValue,
                selectedValue: '',
                loading: false,
                values: []
            }
        }
    }
</script>

<style lang="scss" scoped>
.select-input-wrapper{
    display: inline-block;
    height: auto;
    position: relative;
    .text-input {
        position: relative;
        /*overflow: hidden;*/
        padding-right: .6rem;
        height: .6rem;

        input {
            display: block;
            height: .6rem;
            line-height: .6rem;
            font-size: 16px;
            max-width: 2.3rem;
            background: transparent;
            border: none;
            width: auto;
            color: #666;
            &::-webkit-input-placeholder {
                color: #666;
            }
        }
        .icon {
            font-size: 25px;
            width: .6rem;
            color: #666;
            background: transparent;
            text-align: center;
            padding: 0;
            position: absolute;
            top: -.15rem;
            right: 0;
        }
    }

    .mint-popup {
        width: 100%;
        .btn-group {
            line-height: .8rem;
            padding: 6px 10px;
            display: -webkit-flex;
            display: flex;
            -webkit-justify-content: space-between;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            font-size: 16px;
        }
    }
}
</style>
