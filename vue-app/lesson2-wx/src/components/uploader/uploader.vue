<template>
    <div class="uploader">
        <div v-if="isUseCamera">
            <input v-if="isIos" hidden ref="upload" class="file" name="file" type="file" accept="image/png,image/jpg,image/gif,image/jpeg"
                   @change="update"/>
            <input v-else hidden ref="upload" class="file" name="file" type="file" :accept="accept"
                   capture="camera"
                   @change="update"/>
            <mt-actionsheet
                :actions="actions"
                v-model="sheetVisible">
            </mt-actionsheet>
        </div>
        <div v-else>
            <i v-if="isShowIcon" class="sec seclesson-xiangji1" @click="selectImg"></i>
            <span v-else @click="selectImg">{{text}}</span>
            <input v-if="isIos" hidden ref="upload" class="file" name="file" type="file" accept="image/png,image/jpg,image/gif,image/jpeg"
                   @change="update"/>
            <input v-else hidden ref="upload" class="file" name="file" type="file" :accept="accept"
                   capture="camera"
                   @change="update"/>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import tools from '../../utils/tool'
    import {Indicator, MessageBox, Toast} from 'mint-ui'
    import {CONF} from '../../utils/URLConfig'

    export default {
        data() {
            return {
                url: '',
                isIos: tools.isIosDevice(),
                accept:this.acceptType,
                actions: [{
                    name: '从相册中选择',
                    method: this.getLibrary
                }, {
                    name: '拍照',
                    method: this.getCamera
                }],
                sheetVisible: false
            }
        },
        props: {
            text: {
                type: String,
                default: '上传文件'
            },
            isGetExcelData: {
                type: Boolean,
                default: false
            },
            nameField: {
                type: String,
                default: ''
            },
            isShowIcon: {
                type: Boolean,
                default: false
            },
            field: {
                type: String,
                default: ''
            },
            acceptType:{
                type:String,
                default:'image/png,image/jpg,image/gif,image/jpeg'
            },
            isUseCamera:{
                type:Boolean,
                default:false
            },
            isOnlyCamera: {
                type: Boolean,
                default: false
            }
        },
        mounted(){
            this.setOnlyCamera(this.isOnlyCamera);
        },
        watch:{
            acceptType:function (val) {
                this.accept = val
            },
            isOnlyCamera(val){
                this.setOnlyCamera(val);
            }
        },
        created() {
            if (this.isGetExcelData) {
                this.url = CONF.ajaxUrl.getExcelData
                this.accept = '.xlsx'
            } else {
                this.url = CONF.ajaxUrl.fileUpload
            }
        },
        methods: {
            setOnlyCamera(val){
                if(val){
                    if(this.isIos){
                        this.$refs.upload.setAttribute('capture', 'camera');
                    }else{
                        this.actions = [{
                            name: '拍照',
                            method: this.getCamera
                        }];
                    }
                }else{
                    if(this.isIos){
                        this.$refs.upload.removeAttribute("capture");
                    }else{
                        this.actions = [{
                            name: '从相册中选择',
                            method: this.getLibrary
                        }, {
                            name: '拍照',
                            method: this.getCamera
                        }];
                    }
                }
            },
            selectActionSheet(){
                if(this.isIos){
                    this.$refs.upload.click();
                }else{
                    this.sheetVisible = true
                }
            },
            getLibrary() {
                this.accept = 'image/png,image/jpg,image/gif,image/jpeg';
                setTimeout(() => {
                    this.selectImg()
                    this.sheetVisible = false;
                }, 100)
            },
            getCamera() {
                this.accept = 'image/*';
                setTimeout(() => {
                    this.selectImg()
                    this.sheetVisible = false;
                }, 100)
            },
            update(e) {
                let file = e.target.files[0]
                if (tools.isNotEmpty(file)) {
                    let reader = new FileReader();
                    reader.onload = event => {
                        let binary = event.target.result
                        let file_md5 = tools.strToMD5(binary)
                        //创建form对象
                        let param = new FormData()
                        //通过append向form对象添加数据
                        param.append('file', file, file.name)
                        param.append('md5', file_md5)
                        //FormData私有类对象，访问不到，可以通过get判断值是否传进去
                        let config = {
                            headers: {'Content-Type': 'multipart/form-data'}
                        }
                        Indicator.open()
                        axios
                            .post(this.url, param, config)
                            .then(response => {
                                let uniqueFileName = tools.strToMD5(
                                    '' + file.name + file.type + file.lastModifiedDate + file.size
                                    ),
                                    chunksTotal = 0,
                                    chunkSize = 5000 * 1024
                                if ((chunksTotal = Math.ceil(file.size / chunkSize)) >= 1) {
                                    let data = {
                                        status: 'chunksMerge',
                                        name: uniqueFileName,
                                        chunks: chunksTotal,
                                        md5: file_md5.toUpperCase(),
                                        file_name: file.name,
                                        namefield: this.nameField
                                    }
                                    axios({
                                        method: 'POST',
                                        url: this.url,
                                        data: data,
                                        transformRequest: [
                                            function (data) {
                                                let ret = ''
                                                for (let it in data) {
                                                    ret +=
                                                        encodeURIComponent(it) +
                                                        '=' +
                                                        encodeURIComponent(data[it]) +
                                                        '&'
                                                }
                                                ret = ret.substr(0, ret.length - 1)
                                                return ret
                                            }
                                        ],
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }
                                    })
                                        .then(response => {
                                            Indicator.close()
                                            if (response.data.code === 0) {
                                                Toast('上传成功')
                                                if (this.isGetExcelData) {
                                                    this.$emit('getExcelData', response.data.data)
                                                } else {
                                                    this.$emit('uploadFile', response.data.data[this.field])
                                                }
                                            } else {
                                                Toast('上传失败')
                                            }
                                            this.$refs.upload.value = '';
                                        })
                                        .catch((error) => {
                                            Indicator.close()
                                            MessageBox('温馨提示', '上传失败')
                                        })
                                }
                            })
                            .catch(() => {
                                Indicator.close()
                                MessageBox('温馨提示', '上传失败')
                            })
                    };
                    reader.readAsBinaryString(file);

                    let imgReader = new FileReader();
                    imgReader.readAsDataURL(file);
                    imgReader.onload = (e) => {
                        this.$emit('getImg', imgReader.result);
                    }
                }
            },
            selectImg() {
                this.$refs.upload.click();
            }
        }
    }
</script>

<style scoped lang="scss">
    .uploader {
        z-index: 1;
        span {
            font-size: 0.4rem;
        }
        i.sec {
            width: 2.2667rem;
            height: 1.6rem;
            background-color: rgba(34, 34, 34, 0.4);
            border-radius: 0.2667rem;
            color: #ffffff;
            font-size: 1.2667rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
</style>
