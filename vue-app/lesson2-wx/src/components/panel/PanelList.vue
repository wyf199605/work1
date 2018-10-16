<template>
    <div class="panel-list-wrapper">
        <le-panel v-if="!!panelData" v-for="(item, index) in panelData" :key="index" :title="item.text"
                  :is-show="index===0">
            <div class="panel-item-body">
                <button type="button" class="panel-item-btn" v-if="item.children"
                        v-for="child in item.children"
                        @click="clickHandler(child.value)">{{child.text}}
                </button>
            </div>
        </le-panel>
    </div>
</template>

<script>
    import panel from './Panel';
    export default {
        name: "panel-list",
        components: {
            'le-panel': panel,
        },
        props: {
            panelData: {
                type: Array,
                required: true,
            }
        },
        data() {
            return {
                data: this.panelData,
            }
        },
        mounted(){
            // console.log(this.panelData)
        },
        methods: {
            clickHandler(obj) {
                this.$emit('select', obj)
            }
        }
    }
</script>

<style lang="scss">
    .panel-list-wrapper {
        .panel-item-body {
            margin-right: -.5rem;
            margin-bottom: -.35rem;
            font-size: 14px;
            .panel-item-btn {
                width: 4.307rem;
                height: 1.173rem;
                background-color: #eff5f7;
                margin-right: .5rem;
                margin-bottom: .35rem;
                border: none;
                font-weight: normal;

                &:hover {

                    color: #0099ff;
                    background-color: #cfeaff;
                }
            }
        }
    }
</style>
