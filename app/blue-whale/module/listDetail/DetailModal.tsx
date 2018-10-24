/// <amd-module name="DetailModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";

export class DetailModal{
    constructor(para:EditPagePara){
        let modal = new Modal({
            isMb:true,
            header:{
                title:para.fm.caption
            },
            className:'detail-modal',
            footer:{
                leftPanel:[{
                    content:'取消',
                    className:'modal-btn edit-cancel',
                    onClick:()=>{
                        Modal.confirm({
                            msg:'确定取消编辑吗?',
                            callback:(flag) => {
                                flag && modal.destroy();
                            }
                        })
                    }
                }],
                rightPanel:[{
                    content:'确定',
                    className:'modal-btn eidt-confirm',
                    onClick:()=>{

                    }
                }]
            }
        })
    }

    destroy(){

    }
}