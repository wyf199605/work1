/// <amd-module name="ImageManager"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import {Modal} from "../../feedback/modal/Modal";
import {InputBox} from "../../general/inputBox/InputBox";
import {Button} from "../../general/button/Button";

export interface IImageManagerPara extends IComponentPara{
    isAdd?: boolean; // 默认false
}

export class ImageManager extends Component{

    static EVT_IMG_DELETE = '__event_image_delete__';
    static EVT_ADD_IMG = '__event_add_image__';

    protected addEl: HTMLElement;
    protected wrapperInit(para: IImageManagerPara){
        this.addEl = <div className="img-add manager-img-item">+</div>;
        !para.isAdd && this.addEl.classList.add('hide');
        return <div className="image-manager-wrapper">
            {this.addEl}
        </div>;
    }

    constructor(para: IImageManagerPara){
        super(para);
        this.closeEvent.on();
        this.imgShowEvent.on();

        d.on(this.addEl, 'click', () => {
            this.trigger(ImageManager.EVT_ADD_IMG);
        });
    }

    protected imgShowEvent = (() => {
        let handler = null,
            current = -1,
            img = <img src="" alt=""/>,
            delEl = <i className="app-shanchu appcommon"/>;

        let modal = new Modal({
            header: {
                title: '图片预览',
                rightPanel: delEl
            },
            isShow: false,
            body: <div className="img-manager-show">
                {img}
            </div>
        });

        d.on(delEl, 'click', () => {
            Modal.confirm({
                msg: '是否删除该图片',
                callback: (flag) => {
                    if(flag){
                        modal.isShow = false;
                        this.delImg(current);
                        this.trigger(ImageManager.EVT_IMG_DELETE, current);
                    }
                }
            })
        });
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.img-wrapper', handler = (ev) => {
                    let el = ev.target as HTMLElement,
                        parent = d.closest(el, '.manager-img-item'),
                        url = parent.dataset['url'];
                    current = parseInt(parent.dataset['index']);
                    modal.isShow = true;
                    img.setAttribute('src', url);
                });
            },
            off: () => {
                d.off(this.wrapper, 'click', '.img-wrapper', handler);
            }
        }
    })();

    protected closeEvent = (() => {
        let handler = null;
        return {
            on: () => {
                d.on(this.wrapper, 'click', '.img-close', handler = (ev) => {
                    ev.preventDefault();
                    let el = ev.target as HTMLElement,
                        parent = d.closest(el, '.manager-img-item'),
                        index = parseInt(parent.dataset['index']);

                    this.trigger(ImageManager.EVT_IMG_DELETE, index);
                    d.remove(parent);
                    let items: HTMLElement[] = d.queryAll('.manager-img-item:not(.img-add)', this.wrapper);
                    this.images = items.map(item => item.dataset['url']);
                })
            },
            off: () => {
                d.off(this.wrapper, 'click', '.img-close', handler);
            }
        }
    })();

    protected images: string[] = [];

    render(){
        let items: HTMLElement[] = d.queryAll('.manager-img-item:not(.img-add)', this.wrapper);
        d.diff(this.images, items, {
            create: (url: string, index: number) => {
                d.before(this.addEl, ImageManager.createImg(url, index));
            },
            replace: (url: string, el: HTMLElement, index: number) => {
                let img = d.query('img', el) as HTMLImageElement;
                if(img && img.src !== url){
                    img.setAttribute('src', url);
                    el.dataset['url'] = url;
                }
                el.dataset['index'] = index + '';
            },
            destroy: (el: HTMLElement) => {
                d.remove(el);
            }
        });
    }

    addImg(url: string){
        this.images.push(url);
        this.render();
    }

    delImg(index?: number){
        typeof index === 'number' ? this.images.splice(index, 1) : (this.images = []);
        this.render();
    }

    get(): string[]{
        return this.images;
    }

    getBase64(): Promise<string[]>{
        return Promise.all(this.images.map(url => getBase64(url)));
    }

    set(urls: string[]){
        this.images = urls;
        this.render();
    }

    destroy(){
        this.closeEvent.off();
        this.imgShowEvent.off();
        super.destroy();
    }

    static createImg(src: string, index: number){
        return <div className="manager-img-item" data-url={src} data-index={index + ''}>
            <div class="img-wrapper">
                <img src={src} alt=""/>
            </div>
            <div className="img-close">
                <i className="appcommon app-guanbi2"/>
            </div>
        </div>
    }
}

function getBase64(url: string): Promise<string>{
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.setAttribute("crossOrigin",'anonymous');
        image.onload = () => {
            let canvas = document.createElement("canvas");   //创建canvas DOM元素，并设置其宽高和图片一样
            // canvas.style.backgroundColor = '#fff';
            canvas.width = image.width;
            canvas.height = image.height;
            let ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, image.width, image.height); //使用画布画图

            console.log(url);
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