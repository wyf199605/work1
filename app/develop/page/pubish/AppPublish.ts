/// <amd-module name="AppPublish"/>
import SPAPage = G.SPAPage;
import d = G.d;
import {Button} from "../../../global/components/general/button/Button";
import {Uploader} from "../../../global/components/form/upload/uploader";
import {Modal} from "../../../global/components/feedback/modal/Modal";

// import {StepBar} from "../../module/stepBar/StepBar";

export class AppPublish extends SPAPage {
    set title(title: string) {
        this._title = title;
    }

    get title() {
        return this._title;
    }

    protected wrapperInit(): Node {
        return d.create(`<div class="app-publish">
<div class="uploadBtn function-btn"></div>
<!--<div class="stepBar"></div>-->
<!--<div class="content">-->
<!--<div class="app-item buttons"></div>-->
<!--<div class="app-item hide">-->
<!--<div class="table"></div>-->
<!--<div class="btn"></div>-->
<!--</div>-->
<!--<div class="app-item buttons hide"></div>-->
</div>
</div>`);
    }

    // private stepBar: StepBar;

    protected init(para: Primitive[], data?) {
        this.title = "应用发布";
        // 步骤条
        // this.stepBar = new StepBar({
        //     btnArr:['导入脚本','功能列表','发布'],
        //     // changePage:(index)=>{
        //     //     this.showItem(index);
        //     // },
        //     container:d.query('.stepBar',this.wrapper),
        //     allowClickNum:false
        // });

        // let items = d.queryAll('.app-item',this.wrapper);
        // items.forEach((item,index)=>{
        //     if (index === 0){
        //         // 导入脚本
        //         new Button({
        //             content:'导入脚本',
        //             container:item,
        //             className:'function-btn',
        //             onClick:()=>{
        //
        //             }
        //         });
        //         new Button({
        //             content:'下一步',
        //             container:item,
        //             className:'step-btn',
        //             onClick:()=>{
        //                 this.showItem(1);
        //                 this.stepBar.currentIndex = 1;
        //             }
        //         });
        //     }
        //     else if (index === 1){
        //         // 功能列表
        //         new Button({
        //             content:'上一步',
        //             container:d.query('.btn',item),
        //             className:'prev-step-btn',
        //             onClick:()=>{
        //                 this.showItem(0);
        //                 this.stepBar.currentIndex = 0;
        //             }
        //         });
        //         new Button({
        //             content:'下一步',
        //             container:d.query('.btn',item),
        //             className:'step-btn',
        //             onClick:()=>{
        //                 this.showItem(2);
        //                 this.stepBar.currentIndex = 2;
        //             }
        //         });
        //     }
        //     else {
        //         // 发布
        //         new Button({
        //             content:'发布',
        //             container:item,
        //             className:'function-btn',
        //             onClick:()=>{
        //
        //             }
        //         });
        //         new Button({
        //             content:'上一步',
        //             container:item,
        //             className:'step-btn',
        //             onClick:()=>{
        //                 this.showItem(1);
        //                 this.stepBar.currentIndex = 1;
        //             }
        //         });
        //     }
        // })
        let uploader = new Uploader({
            // uploadUrl: DV.CONF.ajaxUrl.uploadfile,
            uploadUrl: 'http://192.168.10.225:8080/panda-dp/rest/dp/upload/file',
            nameField: 'FILE_ID',
            onComplete: (res) => {
                if (parseInt(res.code) === 200){
                    Modal.toast('上传并发布成功');
                }
            },
            container: d.query('.uploadBtn', this.wrapper),
            text: '导入脚本并发布'
        });

        let ext = ['txt','sql'];
        uploader.on('fileQueued', (file) => {
            if (ext.indexOf(file.ext) !== -1){
                uploader.upload();
            }else{
                Modal.alert('请导入以sql或txt为后缀的文件');
            }
        });

        // new Button({
        //     content: '发布',
        //     container: d.query('.app-publish', this.wrapper),
        //     className: 'function-btn',
        //     onClick: () => {
        //
        // });
    }

    // 切换步骤显示
    // private showItem(index:number){
    //     let items = d.queryAll('.app-item',this.wrapper);
    //     items.forEach((item,i)=>{
    //         item.classList.toggle('hide',i !== index);
    //     })
    // }
}