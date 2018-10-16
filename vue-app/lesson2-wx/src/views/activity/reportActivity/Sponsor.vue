<template>
    <div class="sponsor">
        <div class="sponsor-wrapper" v-for="(item,index) in defaultData" :key="index">
            <div v-if="index === 0" class="sponsor-left">
                <div>{{title}}</div>
                <span v-if="isRequired" class="isrequired-span">*</span></div>
            <div class="sponsor-right">
                <input ref="inputs" type="text" :value="item.name" placeholder="请填写">
                <i v-if="index === 0" class="sec seclesson-jiayihang" @click="addNewLine"></i>
                <i v-else class="sec seclesson-jianyihang" @click="removeLine(index)"></i>
            </div>
        </div>
    </div>
</template>

<script>
    import tools from '../../../utils/tool'
    import {mapGetters, mapMutations} from 'vuex'
    import * as types from '../../../store/mutations-types'

    export default {
        data() {
            return {
                defaultData: []
            }
        },
        computed: {
            ...mapGetters([
                'assist', 'sponsor', 'contractor', 'tempAssist', 'tempSponsor', 'tempContractor'
            ])
        },
        props: {
            title: {
                type: String,
                default: ''
            },
            field: {
                type: String,
                default: ''
            },
            isRequired: {
                type: Boolean,
                default: false
            }
        },
        created() {
            switch (this.field) {
                case 'sponsor': {
                    this.defaultData = this.tempSponsor
                }
                    break;
                case 'assist': {
                    this.defaultData = this.tempAssist
                }
                    break;
                case 'contractor': {
                    this.defaultData = this.tempContractor
                }
                    break;
            }
            if (tools.isEmpty(this.defaultData)){
                this.defaultData = [{
                    name:''
                }]
            }
        },
        methods: {
            ...mapMutations({
                setTempSponsor: types.SET_TEMP_SPONSOR,
                setTempAssist: types.SET_TEMP_ASSIST,
                setTempContractor: types.SET_TEMP_CONTRACTOR
            }),
            addNewLine() {
                let arr = this.getAllData()
                arr.push('')
                this.sponsorData = arr
            },
            removeLine(index) {
                let arr = this.getAllData()
                arr.splice(index, 1)
                this.sponsorData = arr
            },
            getAllData() {
                let arr = []
                this.$refs.inputs.forEach(input => {
                    arr.push({
                        name: input.value
                    })
                })
                return arr
            },
            getResults() {
                let arr = [],
                    inputs = this.$refs.inputs
                for (let i = 0; i < inputs.length; i++) {
                    let input = inputs[i]
                    if (tools.isEmpty(input.value)) {
                        continue
                    }
                    arr.push({
                        name: input.value
                    })
                }
                return arr
            }
        }
    }
</script>

<style lang="scss" scoped>
    .sponsor {
        width: 100%;
        height: auto;
        padding-left: 0.4267rem;
        background-color: #ffffff;
        font-size: 0.4rem;
        .sponsor-wrapper:nth-child(n + 2) {
            justify-content: flex-end;
        }
        .sponsor-wrapper {
            background-color: #ffffff;
            width: 100%;
            height: 1.3333rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e9e9e9;
            padding-right: 0.4rem;
            font-size: 0.4rem;
            input {
                text-align: right;
            }
            input::-webkit-input-placeholder {
                color: #91a8b0;
                font-size: 0.4rem;
            }
            .sponsor-right {
                display: flex;
                align-items: center;
                div {
                    color: #91a8b0;
                    padding-right: 0.1333rem;
                }
                div.showText {
                    color: #33484f;
                }
            }
            .sponsor-left {
                display: flex;
                align-items: center;
            }
            .isrequired-span {
                color: #f56767;
                font-size: 0.4rem;
            }
            i {
                position: relative;
                font-size: 0.4rem;
                width: 0.5333rem;
                height: 0.5333rem;
                color: #91a8b0;
                margin-top: 0.0267rem;
            }
            i::before {
                position: absolute;
                top: 0;
                right: 0;
                line-height: 0.5333rem;
            }
        }
    }
</style>

