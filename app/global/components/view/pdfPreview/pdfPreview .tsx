/// <amd-module name="PDFPreview" />

import {Modal} from "../../feedback/modal/Modal";

interface PDFObject{
    pdfobjectversion: string;
    supportsPDFs: boolean;
    embed: (url: string, el: string | HTMLElement, options?: obj) => HTMLEmbedElement;
}

export interface IPDFPreviewPara{
    url: string;
}

export class PDFPreview{

    constructor(para: IPDFPreviewPara){
        let body = <div className='pdf-preview-content'/>;
        let modal = new Modal({
            body: body,
            isShow: true,
            position: 'full',
            header: 'PDF预览',
            className: 'pdf-preview-modal',
            isOnceDestroy: true
        });
        // if(G.tools.isMb){
            require(['pdfjs', 'pdfh5'], (pdfjsLib, Pdfh5) => {
                window['pdfjsLib'] = pdfjsLib;
                pdfjsLib.GlobalWorkerOptions.workerSrc = requirejs.toUrl('../plugin/pdfjs/pdf.worker.js');
                let pdfh5 = new Pdfh5(body, {
                    scrollEnable: true,//是否允许pdf滚动
                    pdfurl: para.url
                });
            });
        // }else{
        //     require(['pdfObject'], (pdfObject: PDFObject) => {
        //         if(pdfObject.supportsPDFs){
        //             pdfObject.embed(para.url, body);
        //         }else{
        //             Modal.alert('该浏览器不支持PDF预览');
        //             modal.isShow = false;
        //         }
        //     })
        // }
    }
}