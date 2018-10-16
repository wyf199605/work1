<template>
    <div class="stu-edit page">
        <div class="edit-content">
            <input v-model="value" type="text">
            <i v-show="!!value" @click="clearValue" class="sec seclesson-guanbi"></i>
        </div>
        <mt-button class="mt-button" type="primary" size="large">保存</mt-button>
        <mt-button class="mt-button" type="default" size="large">取消</mt-button>

    </div>
</template>

<script>
    export default {
        name: "edit",
        data() {
            return {
                value: '',
            }
        },
        methods: {
            clearValue() {
                this.value = '';
            }
        }
    }
</script>

<style scoped lang="scss">
    .stu-edit {
        .edit-content {
            height: 1.6rem;
            margin: 0.65rem 0;
            border-top: 1px solid silver;
            border-bottom: 1px solid silver;
            padding: 0.2rem 0;
            input:first-child {
                width: 80%;
                border: 0px;
                height: 100%;
                font-size: 0.56rem;
            }
            i {
                width: 1.6rem;
                height: 1.6rem;
                background-color: lightgrey;
                color: white;
                border-radius: 50%;
                border-top-width: 1px;
                padding-top: 1px;
                border-bottom-width: 1px;
                padding-right: 1px;
            }
        }
        .mt-button {
            margin-bottom: 0.45rem;
            height: 1.34rem;
        }
    }
</style>
