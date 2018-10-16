<template>
    <div :class="{ 'picker-div': true, 'just-bottom':pop }">
        <div class="picker-top">
            <mt-button type="default" size="small" @click="pickerCancle">取消</mt-button>
            <mt-button type="danger" size="small" @click="pickerConfirm">确定</mt-button>
        </div>
        <mt-picker :slots="slots" @change="onValuesChange">

        </mt-picker>
    </div>
</template>

<script>
    import {Picker} from 'mint-ui';

    export default {
        name: "stu-picker",
        components: {
            Picker
        },
        props: {
            pop: {
                default: false
            },
            first: {
                default: []
            }
        },
        methods: {
            onValuesChange(picker, values) {
                // if (values[0] > values[1]) {
                //     picker.setSlotValue(1, values[0]);
                // }
                this.selValue = picker.getValues()[0];

            },
            pickerCancle() {
                this.selectType(true)

            },
            pickerConfirm() {
                this.selectType(true)
                this.selectConfirm()
            },
            selectType(type) {
                this.$emit('select-type', type)
            },
            selectConfirm() {
                this.$emit('select-confirm')
            }

        },
        created(){

        },
        watch:{
            first(value){
                this.slots = [
                    {
                        flex: 1,
                        values: value,
                        className: 'slot1',
                        textAlign: 'center',
                        showToolbar: true,
                    },
                ]
            }
        },
        data() {
            return {
                slots: [
                    {
                        flex: 1,
                        values: this.first,
                        className: 'slot1',
                        textAlign: 'center',
                        showToolbar: true,
                    },
                ],
                cancleClass: false,
                selValue: ""
            }
        }

    }
</script>

<style lang="scss" scoped>
    .just-bottom {
        bottom: -7rem !important;
    }

    .picker-div {
        position: fixed;
        bottom: 0;
        right: 0;
        -webkit-transition: bottom 0.2s linear;
        transition: bottom 0.2s linear;
        left: 0;
        height: 5.8rem;
        z-index: 10;
        background-color: rgb(248, 248, 248);
        .picker-top {
            display: flex;
            justify-content: space-between;
            padding: 0.34rem 0.45rem;
            border-top: 0.03rem solid rgb(168, 168, 168);

        }
    }
</style>
