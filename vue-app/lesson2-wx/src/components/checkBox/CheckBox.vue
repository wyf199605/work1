<template>
    <div @click="change" :title="boxData.text" :class="[type + '-wrapper', 'select-box']">
        <input :name="name" :type="type" :checked="checked"/>
        <span :class="['check-span', 'label-' + type]"></span>
        <span v-if="!!boxData.text" class="check-text">{{boxData.text}}</span>
    </div>
</template>

<script>
    export default {
        name: "check-box",
        props: {
            type: {
                type: String, // 'checkbox' | 'radio'
                default: 'checkbox'
            },
            boxData: {
                type: Object,
                required: true,
            },
            name: {
                type: String,
                required: false,
            },
            isChecked: {
                type: Boolean,
                default: false,
            }
        },
        methods: {
            change(){
                this.type === 'radio' && (this.checked = false);
                this.checked = !this.checked;
                this.$emit('change', {
                    data: this.boxData,
                    checked: this.checked,
                    value: this.boxData.value,
                })
            }
        },
        data(){
            return {
                checked: this.isChecked,
            }
        }
    }
</script>

<style lang="scss">
    .select-box {
        cursor: pointer;
        display: inline-block;
        height: auto;
        font-size: 12px;
        &.circle {
            .check-span {
                &.label-checkbox::before {
                    border-radius: 99px;
                    border: 1px solid #ccc;
                }
                &.label-checkbox::after {
                    border-radius: 99px;
                    background-color: #007AFF;
                    border: 1px solid #007AFF;
                    color: #fff !important;
                }
            }
        }
        input {
            position: absolute;
            width: 20px;
            height: 20px;
            display: none;
            &[type=checkbox] + .check-span.indeterminate::after {
                position: absolute;
                top: 21%;
                left: 21%;
                display: inline-block;
                content: "";
                width: 58%;
                height: 58%;
                border-radius: 2px;
                background: #007AFF;
            }
            &[type=checkbox]:checked + .check-span::after {
                font-family: "sec";
                content: "\e600";
                font-size: 16px;
                position: absolute;
                top: 0;
                left: 0;
                display: inline-block;
                width: 100%;
                height: 100%;
                padding-top: 1px;
                font-weight: bold;
                color: #007AFF;
                text-align: center;
                background: transparent;
            }
            &[type=radio]:checked + .check-span::after {
                background-color: #007AFF;
                content: "";
                position: absolute;
                top: 30%;
                left: 30%;
                display: inline-block;
                width: 40%;
                height: 40%;
                padding-top: 1px;
                font-weight: bold;
                color: #007AFF;
                text-align: center;
                border-radius: 99px;
            }
        }
        .check-text {
            vertical-align: middle;
            margin-bottom: 0;
            font-weight: 300;
            padding-left: 5px;
        }
        .check-span {
            position: relative;
            vertical-align: middle;
            display: inline-block;
            width: 20px;
            height: 20px;
            line-height: 20px;
            margin-bottom: 0;
            &.label-checkbox::before {
                position: absolute;
                left: 0;
                display: inline-block;
                width: 100%;
                height: 100%;
                content: "";
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 3px;
                transition: all .1s ease-in-out 0s;
            }
            &.label-radio::before {
                background-color: #ffffff;
                border: 1px solid #ccc;
                content: "";
                display: inline-block;
                height: 100%;
                left: 0;
                margin-right: 10px;
                position: absolute;
                width: 100%;
                border-radius: 99px;
                top: 0;
                transition: all 0.1s cubic-bezier(0.455, 0.03, 0.215, 1.33) 0s;
            }
        }
    }

</style>
