<template>
    <div class="le-btn-group">
        <mt-button v-if="!buttons" v-for="button in buttons" @click="clickHandler(button)"
                   type="default" size="small">{{button.caption}}</mt-button>
    </div>
</template>

<script>
    import tools from '../../utils/tool';
    import rule from '../../utils/rule';
    import { MessageBox } from 'mint-ui';
    export default {
        name: "le-button-group",
        props: {
            buttons: {
                type: Array,
                required: false,
            },
            dataGet: {
                type: Function,
                required: false,
            }
        },
        methods: {
            clickHandler(btn){
                if(btn.hint){
                    MessageBox.confirm(`确定要${btn.hint}吗?`).then(() => {
                        this.btnAction(btn, this.dataGet && this.dataGet());
                    }).catch(() => {

                    })
                }
            },
            btnAction(btn, dataObj){
                let self = this;
                switch (btn.type) {
                    case 'download':
                        window.open(rule.linkParse2Url(btn.link, dataObj));
                        break;
                    case 'excel':
                        break;
                    default:
                        let openType = btn.link && btn.link.openType;
                        switch (openType) {
                            case 'data' :
                            case 'none' :
                                return rule.linkReq(btn.link, dataObj);
                            case 'popup':
                            case 'newwin':
                                return rule.linkOpen(btn.link, dataObj, function(url, data){
                                    self.$route.push({ name: url, params: { data }})
                                });
                        }
                }
            }
        },
    }
</script>

<style lang="scss">
    .le-btn-group{
        .mint-button:not(:last-child){
            margin-right: .25rem;
        }
        .mint-button{
            color: #0099ff;
            background: #fff;
            border: 1px solid #0099ff;
        }
    }
</style>
