<template>
    <div :class="['select-box-wrapper', sizeClass, styleClass]">
        <check-box v-for="(item, index) in boxesData" :type="type" @change="change(index, $event)" :isChecked="selected === index"
                   :boxData="item" :name="type==='radio' ? name : null"></check-box>
    </div>
</template>

<script>
    import checkBox from '../checkBox/CheckBox'
    import tools from '../../utils/tool'
    import Bus from '../../bus'
    export default {
        name: "check-box-group",
        components: {
            'check-box': checkBox,
        },
        props: {
            type: {
                type: String, // 'checkbox' | 'radio'
                default: 'checkbox'
            },
            selected: {
                type: Number,
                default: 0,
            },
            styleType: {
                type: String, // 'button' | 'default' | 'tag'
                default: 'default'
            },
            size: {
                type: String, //'small' | 'middle' | 'big' | 'super-big'
                default: 'small'
            },
            boxesData: {
                type: Array,
                required: true,
            }
        },
        methods: {
            change(index, res){
                if(this.type === 'radio'){
                    this.checkedArray = this.checkedArray.map(() => false);
                }
                this.checkedArray[index] = res.checked;
                this.$emit('change', {
                    index,
                    checked: res.checked,
                    value: res.value,
                });
            }
        },
        computed: {
            styleClass(){
                switch (this.styleType){
                    case 'button':
                        return 'selected-btn-box-wrapper';
                    case 'tag':
                        return  'selected-tag-wrapper';
                    default:
                        return '';
                }
            },
            sizeClass(){
                return this.size + '-select-box-wrapper'
            }
        },
        data(){
            return {
                name: tools.getGuid(),
                checkedArray: [],
            }
        },
        created(){
            this.checkedArray = this.boxesData ? this.boxesData.map(() => false): [];
        }
    }
</script>

<style lang="scss">
    .select-box-wrapper{
        $selectedColor: #0099ff;

        &.selected-tag-wrapper{
            .select-box {
                &:not(:last-child){
                    margin-right: 20px;
                }
                input + span {
                    display: none;
                }
                input + span + span {
                    display: inline-block;
                    background-color: #d8e3e9;
                    height: 34px;
                    line-height: 34px;
                    padding: 0 24px;
                    position: relative;
                    overflow: hidden;
                    transition: background-color 0.2s linear 0s, color 0.2s linear 0s;
                    font-weight: inherit;
                    user-select: none;
                    &:before{
                        content: "";
                        display: block;
                        position: absolute;
                        width: 12px;
                        height: 6px;
                        transform-origin: center center;
                        transform: rotateZ(-45deg);
                        right: 3px;
                        bottom: 6px;
                        z-index: 1;
                        user-select: none;
                        transition: border 0.2s linear 0.2s;
                        border: none;
                    }
                    &:after {
                        display: block;
                        content: "";
                        position: absolute;
                        width: 0;
                        height: 0;
                        right: -20px;
                        bottom: -20px;
                        user-select: none;
                        transition: border 0.2s linear 0s;
                        transform-origin: center center;
                        transform: rotateZ(45deg);
                        border: 0 solid #00a6ed;
                    }
                }
                input:checked + span + span {
                    background-color: #e7f8ff;
                    color: $selectedColor;
                    &:before{
                        border-bottom: 2px solid #fff;
                        border-left: 2px solid #fff;
                    }
                    &:after{
                        border: 20px solid #00a6ed;
                    }
                }
            }

        }

        &.selected-btn-box-wrapper {
            &.small-select-box-wrapper{
                .select-box {
                    input + span + span {
                        padding: 4px 12px;
                        font-size: 12px;
                    }

                    &:first-child{
                        input + span + span {
                            border-top-left-radius: 5px;
                            border-bottom-left-radius: 5px;
                        }
                    }
                    &:last-child{
                        input + span + span {
                            border-top-right-radius: 5px;
                            border-bottom-right-radius: 5px;
                        }
                    }
                }
            }
            &.middle-select-box-wrapper{
                .select-box {
                    input + span + span {
                        padding: 8px 24px;
                        font-size: 16px;
                    }

                    &:first-child{
                        input + span + span {
                            border-top-left-radius: 10px;
                            border-bottom-left-radius: 10px;
                        }
                    }
                    &:last-child{
                        input + span + span {
                            border-top-right-radius: 10px;
                            border-bottom-right-radius: 10px;
                        }
                    }
                }
            }
            &.big-select-box-wrapper{
                .select-box {
                    input + span + span {
                        padding: 12px 36px;
                        font-size: 20px;
                    }

                    &:first-child{
                        input + span + span {
                            border-top-left-radius: 15px;
                            border-bottom-left-radius: 15px;
                        }
                    }
                    &:last-child{
                        input + span + span {
                            border-top-right-radius: 15px;
                            border-bottom-right-radius: 15px;
                        }
                    }
                }
            }
            &.super-big-select-box-wrapper{
                .select-box {
                    input + span + span {
                        padding: 16px 48px;
                        font-size: 24px;
                    }

                    &:first-child{
                        input + span + span {
                            border-top-left-radius: 20px;
                            border-bottom-left-radius: 20px;
                        }
                    }
                    &:last-child{
                        input + span + span {
                            border-top-right-radius: 20px;
                            border-bottom-right-radius: 20px;
                        }
                    }
                }
            }

            .select-box {
                input + span {
                    display: none;
                }
                input + span + span {
                    display: inline-block;
                    border: 1px solid $selectedColor;
                    background: #fff;
                    color: $selectedColor;
                    font-weight: inherit;
                }
                input:checked + span + span {
                    color: #fff;
                    background-color: $selectedColor;
                }
                &:not(:first-child) {
                    input + span + span {
                        border-left: none;
                    }
                }
                &:not(:last-child) {
                    input[type=checkbox]:checked + span + span {
                        border-right-color: #fff;
                    }
                }
            }
        }
    }
</style>
