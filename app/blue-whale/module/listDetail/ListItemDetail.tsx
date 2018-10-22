/// <amd-module name="ListItemDetail"/>

export class ListItemDetail{
    // DOM容器
    private wrapper:HTMLElement;

    constructor(private para:EditPagePara){
        this.wrapper = para.dom;
    }

    // 初始化详情DOM
    initDetailTpl(fields:R_Field[]){

    }

    // 设置详情数据
    render(data:obj){

    }

    // 初始化详情按钮
    initDetailButtons(buttons:R_Button[]){

    }
}