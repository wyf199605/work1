<template>
    <div class="upload-cover-picture">
        <img :src="imgSrc">
        <uploader text="" field="COVERPICTURE" :isGetExcelData="false" :isShowIcon="true" nameField="coverPicture"
                  v-on:uploadFile="uploadFile"/>
    </div>
</template>

<script>
    import Uploader from '../../../components/uploader/uploader'
    import Bus from '../../../bus'
    import tools from '../../../utils/tool'
    import {mapGetters} from 'vuex'
    export default {
        components: {
            Uploader
        },
        data() {
            return {
                imgSrc: ''
            }
        },
        computed:{
            ...mapGetters([
                'coverPicture'
            ])
        },
        created() {
            if (tools.isNotEmpty(this.coverPicture)){
                this.imgSrc = tools.fileUrlGet(this.coverPicture,'COVERPICTURE')
            }
        },
        methods: {
            uploadFile(val) {
                this.imgSrc = tools.fileUrlGet(val,'COVERPICTURE')
                Bus.$emit('coverimg', val)
            }
        }
    }
</script>

<style lang="scss">
    .upload-cover-picture {
        width: 100%;
        height: 6.4667rem;
        background-color: #33484f;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        img {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }
        img[src=''] {
            opacity: 0;
        }

    }
</style>
