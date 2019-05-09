/// <amd-module name="ImgModal"/>
// import sys = G.sys;
import d = G.d;
import tools = G.tools;
import Shell = G.Shell;

import { Modal } from "../../feedback/modal/Modal";
import { Loading } from "../loading/loading";


export interface ImgModalPara {
    downAddr?: string;
    title?: string;
    img: string[];
    page?: boolean; //是否显示页数
    container?: HTMLElement;
    isThumbnail?: boolean; // 默认false,
    textArr?: string[];
    onDownload?(url: string);
    turnPage?(next?: boolean)
}

export const ImgModal = (() => {
    let gallery = null,
        wrapper: HTMLElement,
        container: HTMLElement,
        downAddr: string,
        onDownload: Function;

    function showPhotoSwipe(para: ImgModalPara, index = 0) {
        if (gallery === null) {
            let loading = new Loading({
                msg: '图片加载中...'
            });
            loading.show();
            // let self = this;
            require(['photoSwipe', 'photoSwipeUi'], (photoSwipe, PhotoSwipeUI_Default) => {
                downAddr = para.downAddr;
                onDownload = para.onDownload;
                if (!wrapper) {
                    //加载tpl
                    wrapper = d.create(imgModalTpl);
                    container = para.container ? para.container : document.body;
                    container.appendChild(wrapper);

                    //下载按钮
                    if (downAddr && onDownload) {
                        d.on(container, 'click', () => {
                            // onDownload(downAddr);
                            console.log(1111);
                        });
                    } else {
                        if (tools.isPc) {
                            d.query('.icon-download', wrapper).classList.add('hide');
                        }
                    }
                    // ImgModal.initTag = false;
                }

                // let pre = d.query('.pre-page', wrapper),
                //     next = d.query('.next-page', wrapper);
                // console.log('prev');
                // if (typeof para.turnPage === 'function') {
                //     console.log('prev')
                //     d.on(pre, 'click', () => {
                //         para.turnPage(false);
                //     });

                //     d.on(next, 'click', () => {
                //         para.turnPage(true);
                //     });
                // } else {
                //     // pre.classList.add('hide');
                //     // next.classList.add('hide');
                // }


                let pswpElement = d.query('.pswp', container),
                    len = para.img.length,
                    pros = [];
                for (let i = 0; i <= len - 1; i++) {
                    pros.push(new Promise((resolve) => {
                        let imgTep = new Image();
                        imgTep.src = para.img[i];
                        imgTep.onload = function () {
                            resolve({
                                src: para.img[i],
                                w: imgTep.width,
                                h: imgTep.height
                            });
                        }
                    }));
                }

                Promise.all(pros).then(items => {
                    if (tools.isNotEmpty(items)) {
                        gallery = new photoSwipe(pswpElement, PhotoSwipeUI_Default, items, {
                            // history & focus options are disabled on CodePen
                            history: false
                            , focus: false
                            , page: false
                            , pinchToClose: false
                            , closeOnScroll: false
                            , closeOnVerticalDrag: false
                            , mouseUsed: false
                            , escKey: true
                            , arrowKeys: true
                            , modal: false
                            , clickToCloseNonZoomable: false
                            , closeElClasses: []
                            // , fullscreenEl: false
                            , shareEl: false
                            , showAnimationDuration: 0
                            , hideAnimationDuration: 0
                            , index: index
                        });
                        gallery.init();
                        gallery.listen('close', function () {
                            let timer = setTimeout(() => {
                                destroy();
                                console.log(123);
                                clearTimeout(timer);
                            },310);
                        });
                        gallery.listen('download', function () {
                            // var base64 = Shell.image.getBase64Image(para.img[0]);
                            // Shell.image.downloadImg(base64, (res) => {});
                            console.log('download');
                            var image = new Image();
                            image.src = para.img[0]; //s是图片的路径
                            image.onload = function () { //image.onload是等待图片加载完毕，等待图片加载完毕之后，才能对图片进行操作
                                var width = image.width; //根据图片的宽高，将图片进行压缩
                                var height = image.height;
                                var canvas = document.createElement("canvas");
                                var cax = canvas.getContext('2d');
                                canvas.width = width;
                                canvas.height = height;
                                cax.drawImage(image, 0, 0, width, height); //重绘
                                var dataUrl = canvas.toDataURL("image/png"); //dataUrl 即为base编码字符串
                                // alert(dataUrl);
                                // return dataUrl;
                                Shell.image.downloadImg(dataUrl, () => { });
                            }
                        });
                        // gallery.listen('prevImg', function () {
                        //     console.log(para);
                        //     // para.turnPage(false);
                        // });
                        // gallery.listen('nextImg', function () {
                        //     console.log(321);
                        //     // para.turnPage(true);
                        // });
                    }
                }).finally(() => {
                    loading && loading.hide();
                    loading = null;
                })
            });
        }
    }

    function destroy() {
        gallery && gallery.close();
        gallery = null;
        d.remove(d.query('.pswp'));
        wrapper = null;
        if (tools.isMb) {
            document.body.style.overflow = '';
        }
    }

    function show(para: ImgModalPara, index = 0) {
        if (para.isThumbnail) {
            //    显示缩略图
            showModalThumbnail(para);
        } else {
            showPhotoSwipe(para, index);
        }
    }

    function showModalThumbnail(para: ImgModalPara) {
        let body = createImgThumbnail(para);
        let modal = new Modal({
            body: body,
            width: '750px',
            header: '查看缩略图',
            isOnceDestroy: true
        })
    }

    function createImgThumbnail(para: ImgModalPara): HTMLElement {
        let div = document.createElement('div');
        div.classList.add('thumbnail-container');
        para.img.forEach((value, index) => {
            let imgCon = document.createElement('div');
            imgCon.classList.add('img-container');
            let img = document.createElement('img');
            img.src = value;
            imgCon.appendChild(img);
            div.appendChild(imgCon);
        });
        if (para.textArr) {
            let allImgContainer = d.queryAll('.img-container', div);
            para.textArr.forEach((value, index) => {
                let p = document.createElement('p');
                p.innerText = value;
                allImgContainer[index].appendChild(p);
            })
        }
        d.on(div, 'click', 'img', function (e) {
            let index = d.queryAll('img').indexOf(<HTMLElement>e.target);
            showPhotoSwipe(para, index);
        });
        return div;
    }

    return {
        show,
        destroy
    }
})();

// const imgModalTpl = `
// <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"> 
//     <div class="pswp__bg"></div> 
//     <div class="pswp__scroll-wrap"> 
//         <div class="pswp__container"> 
//             <div class="pswp__item"></div> 
//             <div class="pswp__item"></div> 
//             <div class="pswp__item"></div> 
//         </div> 
//         <div class="pswp__ui pswp__ui--hidden"> 
//             <div class="pswp__top-bar"> 
//                 <div class="pswp__counter"></div> 
//                     <button class="pswp__button pswp__button--close iconfont icon-close"></button> 
//                     <button class="pswp__button pswp__button--download iconfont icon-download"> </button> 
//                     <button class="pswp__button pswp__button--next next-page iconfont icon-arrow-right "></button> 
//                      <button class="pswp__button pswp__button--prev pre-page iconfont icon-arrow-left "></button> 
//                     <div class="pswp__preloader"> 
//                         <div class="pswp__preloader__icn"> 
//                             <div class="pswp__preloader__cut"> 
//                                 <div class="pswp__preloader__donut"></div> 
//                             </div>
//                         </div>
//                     </div>
//                 </div> 
//                 <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"> 
//                     <div class="pswp__share-tooltip"></div> 
//                 </div> 
//                 <button class="pswp__button pswp__button--arrow--left  iconfont icon-arrow-left"> 
//                     <span class=" iconfont icon-arrow-left"></span> 
//                 </button> 
//                 <button class="pswp__button pswp__button--arrow--right "> 
//                      <span class=" iconfont icon-arrow-right"></span> 
//                 </button> 
//                  <div class="pswp__caption">  
//                     <div class="pswp__caption__center">
//                 </div>
//             </div>
//         </div>
//     </div>
// </div>`;
const imgModalTpl = `
<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">

    <div class="pswp__bg"></div>
    <div class="pswp__scroll-wrap">

        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>

        <div class="pswp__ui pswp__ui--hidden">

            <div class="pswp__top-bar">


                <div class="pswp__counter"></div>

                <button class="pswp__button pswp__button--close iconfont icon-close"></button> 

                <button class="pswp__button pswp__button--download iconfont icon-download"> </button> 

                <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                        <div class="pswp__preloader__cut">
                            <div class="pswp__preloader__donut"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                <div class="pswp__share-tooltip"></div>
            </div>

            <button class="pswp__button pswp__button--arrow--left  iconfont icon-arrow-left" >
                <span class=" iconfont icon-arrow-left"></span> 
            </button>

            <button class="pswp__button pswp__button--arrow--right  iconfont icon-arrow-right" >
            <span class=" iconfont icon-arrow-right"></span> 
            </button>

            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>

        </div>

    </div>

</div>
`

