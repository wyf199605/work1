<template>
    <div class="query-module-wrapper">
        <selectedText v-for="(item, index) in listData" :placeholder="item.caption" :link="item.link"
                      :titleField="item.titleField" :dataList="item.data" :getData="getAjaxData"
                      :name="item.name" @select="request" :default-value="getDefault(item.name)"></selectedText>
    </div>
</template>

<script>
    import selectedText from '../selectText/selectText';
    import rule from '../../utils/rule';
    export default {
        name: "query-module",
        components: {
            selectedText,
        },
        props: {
            fields: {
                type: Array,
                required: false,
            },
            cond: {
                type: Array,
                required: true,
            },
            defaultValues:{
                type: Object,
                required: false,
            },
            linkData: {
                type: Object,
                default: function () {
                    return {}
                },
            }
        },
        computed: {
            listData(){
                return this.cond.map((cond) => {
                    let caption = cond.caption,
                        fileName = cond.titleField || cond.fieldName;

                    this.fields && this.fields.forEach((field) => {
                        if(field.name === fileName){
                            caption = field.caption;
                        }
                    });
                    return {
                        caption: caption,
                        data: cond.data,
                        link: cond.link,
                        name: cond.relateFields,
                        titleField: fileName
                    }
                })
            },
            time(){

            }
        },
        methods: {
            getDefault(name){
                if(!this.defaultValues){
                    return '';
                }
                if(name in this.defaultValues){
                  return this.defaultValues[name];
                }else{
                  return '';
                }
            },
            getAjaxData(res){
                let self = this;
                // console.log(link);
                return new Promise((resolve, reject) => {
                    console.log(res.link);
                    if(res.link){
                        console.log(this.linkData);
                        rule.linkReq(res.link, Object.assign({}, this.linkData, this.params)).then((data) => {
                            let body = data.body,
                                dataList = body ? body.data : [],
                                result = [];
                            dataList.forEach((item) => {
                                let json = {};
                                for(let key in item){
                                    if(res.name === key){
                                        json.value = item[key]
                                    }
                                    if(res.titleField === key){
                                        json.title = item[key];
                                    }
                                }
                                result.push(json);
                            });
                            console.log(result);
                            resolve(result);
                        }).catch(() => {
                            reject();
                        })
                    }else {
                        reject();
                    }
                });
            },
            request(result){
                this.params[result.name] = result.value;
                let res = [];
                for(let key in this.params){
                    res.push([key, [this.params[key]]]);
                }
                this.$emit('query', {params: JSON.stringify(res)});
            }
        },
        data(){
            return {
                params: {},
            }
        },
    }
</script>

<style lang="scss">
    .query-module-wrapper {
        padding: .25rem 0;
        display: flex;
        justify-content: space-around;
        margin-bottom: .1rem;
        background-color: #fff;
    }

</style>
