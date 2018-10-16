<template>
    <div class="auth-edit-page">
        <cell v-if="no" :text="'申请单号'" :rightText="no" :arrow="false"></cell>
        <div v-if="no" class="margin-bottom"></div>

        <cell :text="'申报平台'" :rightText="base.platform_name" :arrow="!no"
              @click="!no ? openPicker('platform', {parent_id: 'root'}) : null"></cell>

        <cell :text="'证书类型'" :rightText="base.type_name" :arrow="!no"
              @click="!no ? openPicker('type', {parent_id: base.platform_id}) : null"></cell>

        <cell :text="'证书等级'" :rightText="base.level_name"
              @click="openPicker('level', {parent_id: base.type_id})"></cell>

        <cell :text="'公类'" :rightText="base.party_name"
              @click="openPicker('party', {parent_id: base.level_id})"></cell>

        <cell :text="'作者'" :rightText="base.author_name"
              @click="openPicker('author', {parent_id: base.party_id})"></cell>

        <div class="margin-bottom"></div>

        <div v-for="(item, index) in info">
            <cell v-if="item.type === 1" :key="item.id" :text="item.name" :rightText="item.value" @click="openText(index)"></cell>
            <cell v-if="item.type === 2" :key="item.id" :text="item.name" :rightText="item.value" @click="openTimePicker(index)"></cell>
            <div v-if="item.type === 3" class="imgs">
                <p>{{item.name}}</p>
                <div v-for="url in (item.value ? item.value.split(';') : [])" class="img">
                    <span class="close" @click="imgDel(url)">x</span>
                    <img :src="siteUrl + url" alt="">
                </div>
                <div class="img uploader-container" @click="imgSelect">
                    <span class="sec seclesson-xiangji1"></span>
                    <uploader ref="uploadImg" nameField="authentication" field="AUTHENTICATION" text="" @uploadFile="imgAdd"></uploader>
                </div>
            </div>
        </div>

        <Button type="primary" class="button" @click="submit">提交</Button>

        <mt-datetime-picker ref="timePicker" type="date" v-model="currentDate" @confirm="confirmTimePicker"></mt-datetime-picker>
        <picker :pop="pop" :first="dropdownText" @select-type="onselectType" ref="picker" @select-confirm="confirm"></picker>
    </div>
</template>

<script>
    import NormalCell from "../../../components/cell/NormalCell";
    import { DatetimePicker, MessageBox, Button, Toast  } from 'mint-ui';
    import uploader from '../../../components/uploader/uploader';
    import request from "../../../utils/request";
    import {CONF} from "../../../utils/URLConfig"
    import tools from "../../../utils/tool"
    import picker from "../../../components/stu/stu-picker"

    export default {
        name: "AuthEditPage",
        components: {
            cell: NormalCell,
            'mt-datetime-picker': DatetimePicker,
            picker,
            uploader,
            Button
        },

        beforeCreate() {
            if (!this.no) {
                document.title = '添加新证书';
            }
        },
        created() {
            if (this.no) {
                request.get(CONF.ajaxUrl.authDetail, {apply_id: this.no})
                    .then((response) => {
                        if (response.code === 0 && response.data) {
                            this.base = response.data.base;
                            this.info = response.data.info;
                        }
                    })
            }

        },
        data() {
            return {
                siteUrl: CONF.siteUrl,
                basePath: ['platform', 'type', 'level', 'party', 'author'],
                currentPath: '',
                currentDate: null,
                currentInfoIndex: -1,
                imgInfoIndex: -1,
                no: this.$route.params.no,
                base: {
                    apply_id: "",//申请编号
                    platform_id: "",//此时不能编辑
                    platform_name: "",//此时不能编辑
                    type_id: "",//此时不能编辑
                    type_name: "",//此时不能编辑
                    level_id: "",
                    level_name: "",
                    party_id: "",
                    party_name: "",
                    author_id: "",
                    author_name: "",
                },
                info: [],
                dropdownText: [],
                dropdownValue: [],
                pop: true
            }
        },
        methods: {
            submit() {
                if (this.no) {
                    request.post(CONF.ajaxUrl.authSubmit, {
                        base: this.base,
                        info: this.info,
                        no: this.no
                    }).then((res) => {
                        if(res.code === 0) {
                            this.$router.go(-1);
                        }
                        Toast(res.msg)
                    });
                } else {
                    request.put(CONF.ajaxUrl.authSubmit, {
                        base: this.base,
                        info: this.info,
                    }).then((res) => {
                        if(res.code === 0) {
                            this.$router.go(-1);
                        }
                        Toast(res.msg)
                    });
                }
            },
            imgSelect() {
                this.$refs.uploadImg[0].selectImg()
            },
            imgAdd(md5) {
                let imgInfo;
                for (let i = 0, item; item = this.info[i]; i++) {
                    if (item.type === 3) {
                        imgInfo = item;
                        break;
                    }
                }

                if (imgInfo) {
                    imgInfo.value = imgInfo.value || "";
                    if (imgInfo.value) {
                        imgInfo.value += ';'
                    }
                    imgInfo.value += tools.fileUrlGet(md5, 'AUTHENTICATION').substr(CONF.siteUrl.length);
                }
            },
            imgDel(delUrl) {
                let imgInfo;
                for (let i = 0, item; item = this.info[i]; i++) {
                    if (item.type === 3) {
                        imgInfo = item;
                        break;
                    }
                }

                if (imgInfo) {
                    imgInfo.value = imgInfo.value || "";
                    imgInfo.value = imgInfo.value.split(';').filter(url => url !== delUrl).join(';');
                }

            },
            openTimePicker(infoIndex) {
                let info = this.info[infoIndex];
                this.currentInfoIndex = infoIndex;
                this.$refs.timePicker.open();
                this.currentDate = info.value;
            },
            confirmTimePicker(value) {
                let info = this.info[this.currentInfoIndex];
                if (info) {
                    info.value = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`;
                }
            },
            openText(infoIndex) {
                let info = this.info[infoIndex];

                MessageBox.prompt("", {
                    message: "请输入" + info.name,
                    inputValue: info.value,
                    cancelButtonText: "取消",
                    closeOnClickModal: false
                }).then(({value, action}) => {
                    info.value = value;
                }).catch(err => {
                    // if (err == 'cancel') {//点击暂不的回调
                    //
                    // }
                });
            },
            onselectType(type) {
                this.pop = type
            },
            openPicker(key1, ajaxData) {
                this.currentPath = key1;
                this.dropdownText = [];
                this.dropdownValue = [];

                if (ajaxData.parent_id) {
                    request.get(CONF.ajaxUrl.authEditLookup, ajaxData)
                        .then((response) => {
                            let {code, data} = response;
                            if (code === 0 && data && data.body) {
                                let dataArr = tools.getCrossTableData(data.body.meta, data.body.dataList),
                                    values = [],
                                    texts = [];

                                dataArr && dataArr.forEach(obj => {
                                    values.push(obj.ID);
                                    texts.push(obj.NAME);
                                });

                                this.dropdownText = texts;
                                this.dropdownValue = values;
                            }
                        });
                }


                this.pop = false; // 打开下拉框

            },
            confirm() {
                let pickerIndex = this.dropdownText.indexOf(this.$refs.picker.selValue),
                    pathIndex = this.basePath.indexOf(this.currentPath);

                this.base[this.currentPath + '_id'] = this.dropdownValue[pickerIndex];
                this.base[this.currentPath + '_name'] = this.dropdownText[pickerIndex];

                this.basePath.forEach((path, index) => {
                    if (index > pathIndex) {
                        this.base[path + '_id'] = '';
                        this.base[path + '_name'] = '';
                    }
                });

                if (this.currentPath === 'type') {
                    request.get(CONF.ajaxUrl.authType, {id: this.dropdownValue[pickerIndex]})
                        .then((res) => {
                            if (res.code === 0) {

                                if (res.data && res.data.info) {
                                    res.data.info.forEach((item) => {
                                        ['id', 'name', 'type', 'value'].forEach((key) => {
                                            if (!(key in item)) {
                                                item[key] = '';
                                            }
                                        })
                                    });

                                    this.info = res.data.info
                                }
                            } else {
                                MessageBox.alert(res.msg)
                            }
                        })
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .button {
        margin: 30px auto;
        width: 85%;
        display: block;
    }
    .margin-bottom {
        margin-bottom: 5px
    }
    .imgs {
        margin-top: 5px;
        padding: 0.4267rem;
        background: #fff;
        p {
            font-size: 0.4267rem;
            margin: 0;
        }
        .img {
            width: calc((100vw - 0.4267rem * 2) / 4);
            margin: 5px;
            height: calc((100vw - 0.4267rem * 2) / 4);
            line-height: calc((100vw - 0.4267rem * 2) / 4);
            display: inline-block;
            overflow: hidden;
            background: #fafafa;
            position: relative;

            .close {
                position: absolute;
                right: 0;
                top: 0;
                height: 20px;
                width: 20px;
                color: #fff;
                background: #333;
                line-height: 15px;
                text-align: center;
                border-radius: 15px;
                font-size: 17px;
            }
            img {
                max-width: 100%;
            }

            &.uploader-container {
                background: transparent;
                line-height: 1;
                text-align: center;
                position: relative;
                border: 1px #d8e3e9 dashed;
                padding-top: 7px;

                span.sec {
                    font-size: 1.3rem;
                    color: #d8e3e9;

                    &:after {
                        content: "上传图片";
                        display: block;
                        font-size: 0.4rem;
                    }
                }

                .uploader {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                }
            }
        }

    }

</style>
