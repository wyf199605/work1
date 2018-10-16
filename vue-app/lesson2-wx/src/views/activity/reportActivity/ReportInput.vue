<template>
    <div class="report-input">
        <div class="report-input-wrapper">
            <div class="report-input-left">
                <div>{{title}}</div>
                <span v-if="isRequired" class="isrequired-span">*</span></div>
            <div class="report-input-right" @click="edit">
                <div :class="isTextArea ? 'textarea-defaultValue' : 'defaultValue'" v-if="isNull">
                    {{showText}}
                </div>
                <div v-else :class="isTextArea ? 'textarea-showText' : 'showText'">{{showText}}</div>
                <i v-if="showIcon" class="sec seclesson-youjiantou"></i>
            </div>
        </div>
    </div>
</template>

<script>
    import tools from '../../../utils/tool'
    import {mapGetters} from 'vuex'

    export default {
        data() {
            return {
                showText: '',
                isNull: true
            }
        },
        props: {
            isRequired: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            showIcon: {
                type: Boolean,
                default: true
            },
            field: {
                type: String,
                default: ''
            },
            isTextArea: {
                type: Boolean,
                default: false
            },
            defaultValue: {
                type: String,
                default: ''
            }
        },
        watch: {
            defaultValue: function (newVal) {
                this.showText = newVal;
                this.isNull = tools.isNotEmpty(newVal) ? false : true;
            }
        },
        computed: {
            ...mapGetters([
                'charge', 'college', 'roleCancelBeginTime', 'activityRetroBeginTime', 'commentEndTime',
                'teacherId', 'teacherName', 'teacherPosition', 'courseCollege', 'signContent', 'controllerType',
                'controller',
                'organizerType',
                'organizer',
                'participantType',
                'participant'
            ])
        },
        created() {
            let fieldsArr = ['activityType', 'activityLevel', 'activityBeginTime', 'activityEndTime', 'otherCollege', 'student', 'otherMajor', 'sponsorInfo', 'otherGrade', 'otherClbum', 'college', 'major', 'clbum', 'grade',
                'roleCancel', 'activityRetroactive', 'roles', 'activityComment', 'signType', 'course-student', 'teacher', 'course-otherCollege', 'course-otherMajor', 'course-otherGrade', 'course-otherClbum', 'course-college', 'course-major', 'course-clbum', 'course-grade',];
            if (fieldsArr.indexOf(this.field) >= 0) {
                if (this.field === 'sponsorInfo') {
                    if (tools.isEmpty(this.charge)) {
                        this.showText = '请选择'
                    } else {
                        this.showText = '已设置'
                        this.isNull = false
                    }
                } else if (this.field === 'student') {
                    if (tools.isEmpty(this.college)) {
                        this.showText = '请选择'
                    } else {
                        this.showText = '已设置'
                        this.isNull = false
                    }
                } else if (this.field === 'course-student') {
                    if (tools.isEmpty(this.courseCollege)) {
                        this.showText = '请选择'
                    } else {
                        this.showText = '已设置'
                        this.isNull = false
                    }
                } else if (this.field === 'roleCancel') {
                    if (this.roleCancelBeginTime !== 0 && tools.isNotEmpty(this.roleCancelBeginTime)) {
                        this.showText = '已设置'
                        this.isNull = false
                    } else {
                        this.showText = '请选择'
                    }
                } else if (this.field === 'activityRetroactive') {
                    if (this.activityRetroBeginTime !== 0 && tools.isNotEmpty(this.activityRetroBeginTime)) {
                        this.showText = '已设置'
                        this.isNull = false
                    } else {
                        this.showText = '请选择'
                    }
                } else if (this.field === 'activityComment') {
                    if (this.commentEndTime !== 0 && tools.isNotEmpty(this.commentEndTime)) {
                        this.showText = '已设置'
                        this.isNull = false
                    } else {
                        this.showText = '请选择'
                    }
                } else if (this.field === 'signType') {
                    if (tools.isNotEmpty(this.signContent)) {
                        this.showText = '已设置'
                        this.isNull = false
                    } else {
                        this.showText = '请选择'
                    }
                }
                else if (this.field === 'roles') {
                    if (tools.isEmpty(this.controllerType) && tools.isEmpty(this.controller) && tools.isEmpty(this.organizerType) && tools.isEmpty(this.organizer) && tools.isEmpty(this.participantType) && tools.isEmpty(this.participant)) {
                        this.showText = '请选择'
                    } else {
                        this.showText = '已设置'
                        this.isNull = false
                    }

                } else if (this.field === 'teacher') {
                    if (tools.isNotEmpty(this.teacherName)) {
                        if (tools.isNotEmpty(this.teacherPosition)) {
                            this.showText = this.teacherName + '(' + this.teacherPosition + ')'
                        } else {
                            this.showText = this.teacherName
                        }
                        this.isNull = false
                    } else {
                        this.showText = '请选择'
                    }
                } else {
                    this.showText = tools.isNotEmpty(this.defaultValue) ? this.defaultValue : '请选择';
                    this.isNull = tools.isNotEmpty(this.defaultValue) ? false : true;
                }
            } else {
                this.showText = tools.isNotEmpty(this.defaultValue) ? this.defaultValue : '请填写';
                if (this.defaultValue === '请设置') {
                    this.isNull = true;
                } else {
                    this.isNull = tools.isNotEmpty(this.defaultValue) ? false : true;
                }
            }
        },
        methods: {
            edit() {
                this.$emit('reportInputEdit', this.field)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .report-input {
        width: 100%;
        height: 1.3333rem;
        padding-left: 0.4267rem;
        background-color: #ffffff;
        font-size: 0.4rem;
        .report-input-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e9e9e9;
            padding-right: 0.4rem;
            .report-input-right {
                display: flex;
                align-items: center;
                height: 100%;
                div {
                    color: #91a8b0;
                    padding-right: 0.1333rem;
                }
                div.textarea-showText {
                    color: #33484f;
                    width: 5.3333rem;
                    height: 100%;
                    word-break: break-all;
                    text-align: right;
                }
                div.showText {
                    color: #33484f;
                    width: 5.3333rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    text-align: right;
                }
                div.textarea-defaultValue {
                    width: 5.3333rem;
                    text-align: right;
                }
                div.defaultValue {
                    width: 5.3333rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    text-align: right;
                }
            }
            .report-input-left {
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
                width: 0.4rem;
                height: 0.56rem;
                color: #91a8b0;
                margin-top: 0.0267rem;
            }
            i::before {
                position: absolute;
                top: 0;
                right: 0;
                line-height: 0.56rem;
            }
        }
    }
</style>
