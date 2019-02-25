/// <amd-module name="ManagerImages"/>

import {BwUploader, IBwUploaderPara} from "./bwUploader";
import tools = G.tools;
import d = G.d;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwLayoutImg} from "./bwLayoutImg";
import {FormCom} from "../../../global/components/form/basic";

export interface IManagerImagesPara extends IBwUploaderPara {
    imagesContainer: HTMLElement;
    onFinish?: (files: CustomFile[]) => void;
}

export class ManagerImages extends FormCom{

    protected wrapperInit(){
        return null;
    }

    get(){

    }
    set(value){

    }

    get value(){
        return this.get();
    }
    set value(value){
        this.set(value)
    }

    protected multi: boolean;
    protected files: CustomFile[] = [];
    protected imgManager: ImagesWrapper;
    protected onFinish: (files: CustomFile[]) => void;
    protected bwUpload: BwUploader;

    constructor(para: IManagerImagesPara) {
        super(para);
        this.multi = tools.isEmpty(para.multi) ? true : para.multi;
        this.onFinish = para.onFinish || function () {
            return Promise.resolve();
        };
        this.initUploader(para);
        this.initImagesWrapper(para);
    }

    private initImagesWrapper(para: IManagerImagesPara) {
        this.imgManager = new ImagesWrapper({
            container: para.imagesContainer,
            onDelete: (index) => {
                this.files.splice(index, 1);
                this.onFinish(this.files);
            }
        });
    }

    private initUploader(para: IManagerImagesPara) {
        para.accept = {
            title: '图片',
            extensions: 'jpg,png,gif,jpeg',
            mimeTypes: 'image/*'
        };
        para.className = 'manager-images-uploader';
        this.bwUpload = new BwUploader(para);
        this.bwUpload.on(BwUploader.EVT_FILE_JOIN_QUEUE, (files: CustomFile[]) => {
            let file = files[0];
            BwLayoutImg.fileToImg(file).then((url) => {
                if (!this.multi) {
                    this.files = [];
                    this.imgManager.delImage();
                }
                this.files.push(files[0]);
                this.imgManager.addImage(url);
                this.onFinish(this.files);
            }).catch(() => {
                Modal.alert('获取图片失败');
            })
        });
    }

    getBase64(): Promise<string[]> {
        return this.imgManager ? this.imgManager.getBase64() : Promise.resolve([]);
    }

    click() {
        this.bwUpload && this.bwUpload.click();
    }

    destroy() {
        this.files = null;
        this.imgManager.destroy();
    }
}


interface IImageItem extends IComponentPara {
    url: string;
    index: number;
}

interface IImageWrapperPara extends IComponentPara {
    onDelete: (index) => void;
}

class ImagesWrapper extends Component {
    protected wrapperInit(para: IImageWrapperPara): HTMLElement {
        return <div className="manager-images-wrapper"/>;
    }

    private onDelete: (index) => void;

    constructor(para: IImageWrapperPara) {
        super(para);
        this.onDelete = para.onDelete;
        this.deleteEvent.on();
    }

    private deleteEvent = (() => {
        let deleteItem = (e) => {
            let index = parseInt(d.closest(e.target, '.image-item').dataset.index);
            this.delImage(index);
            this.onDelete(index);
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.close-image', deleteItem),
            off: () => d.off(this.wrapper, 'click', '.close-image', deleteItem)
        }
    })();

    protected imagesUrls: string[] = [];

    private _images: ImageItem[] = [];
    get images() {
        let images = this._images || [];
        return [...images];
    }

    addImage(url: string) {
        this.imagesUrls.push(url);
        this.render();
    }

    delImage(index?: number) {
        typeof index === 'number' ? this.imagesUrls.splice(index, 1) : (this.imagesUrls = []);
        this.render();
    }

    render() {
        let items = this.images || [];
        d.diff(this.imagesUrls, items, {
            create: (url: string) => {
                this.createImage(url)
            },
            replace: (url: string, item: ImageItem) => {
                if (item.src !== url) {
                    item.src = url;
                }
            },
            destroy: (item: ImageItem) => {
                let index = item.index;
                if (index > -1) {
                    delete this._images[index];
                }
                item.remove();
            }
        });
        this._images = this._images.filter((item) => item);
        this.refreshIndexes();
    }

    private createImage(url: string) {
        let images = this.images || [],
            index = images.length;
        this._images.push(new ImageItem({
            url: url,
            index: index,
            container: this.wrapper
        }));
    }

    private refreshIndexes() {
        let images = this.images || [];
        images.forEach((item, index) => {
            item.index = index;
        })
    }

    getBase64(): Promise<string[]> {
        return Promise.all(this.imagesUrls.map(url => getBase64(url)));
    }

    destroy() {
        this.deleteEvent.off();
        super.destroy();
    }
}

function getBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.setAttribute("crossOrigin", 'anonymous');
        image.onload = () => {
            let canvas = document.createElement("canvas");   //创建canvas DOM元素，并设置其宽高和图片一样
            // canvas.style.backgroundColor = '#fff';
            canvas.width = image.width;
            canvas.height = image.height;
            let ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, image.width, image.height); //使用画布画图

            //console.log(url);
            let dataURL = canvas.toDataURL("image/png");
            console.log(dataURL);
            resolve(dataURL);
            canvas = null;
        };
        image.onerror = () => {
            reject();
        };
        image.src = url;
    })
}

class ImageItem extends Component {
    private img: HTMLImageElement;

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="image-item">
            {this.img = <img src="" alt=""/>}
            <div className="close-image"><i className="appcommon app-guanbi2"/></div>
        </div>;
    }

    constructor(para: IImageItem) {
        super(para);
        this.render(para.url);
        this.index = para.index;
    }

    private _index: number;
    set index(idx: number) {
        this._index = idx;
        this.wrapper.dataset.index = idx.toString();
    }

    get index() {
        return this._index;
    }

    private _src: string;
    set src(src: string) {
        this._src = src;
        this.img.src = src;
    }

    get() {
        return this._src
    }

    render(url: string) {
        if (tools.isEmpty(url)) {
            return;
        }
        this.img.src = url;
    }

    destroy() {
        super.destroy();
    }
}