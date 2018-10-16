<template>
    <div class="panel-modal-wrapper">
        <le-panel v-if="!!panelData" v-for="(item, index) in panelData"
                  :title="item.TITLE" :is-show="index===0">
            <div class="panel-item-body">
                <button type="button" class="panel-item-btn" v-for="child in item.CHILDREN"
                        @click="clickHandler(child.ID)">{{child.TITLE}}
                </button>
            </div>
        </le-panel>
        <div class="btn-wrapper"></div>
    </div>
</template>

<script>
    export default {
        name: "panel-modal",
        props: {
            data: {
                type: Array,
                required: [],
            },
            link: {
                type: String,
                required: false
            },
            isShow: {
                type: Boolean,
                default: false,
            }
        },
        data() {
            return {
                panelData: [],
            }
        }
    }
</script>

<style lang="scss">
    .panel-modal-wrapper{
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
</style>
