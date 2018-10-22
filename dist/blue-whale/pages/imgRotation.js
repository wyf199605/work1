define(["require", "exports", "photoSwipe", "photoSwipeUi"], function (require, exports, PhotoSwipe, PhotoSwipeUI_Default) {
    "use strict";
    /// <amd-dependency path="photoSwipe" name="PhotoSwipe"/>
    /// <amd-dependency path="photoSwipeUi" name="PhotoSwipeUI_Default"/>
    var sys = BW.sys;
    return /** @class */ (function () {
        function class_1() {
            var imgData = JSON.parse(window.localStorage.getItem('imgRotateData')), sliderItems = imgData.img, pageNum = sliderItems.length, slider = document.querySelector('.pswp'), headerBar = document.getElementById('headerBar'), imgPageNone = headerBar.querySelector('.imgPage'), footerBar = document.getElementById('footerBar'), imgPage = document.getElementById('imgPage'), maxPageNum1 = document.getElementById('maxPageNum1'), rangeInput = footerBar.querySelector('input[type=range]'), pageNone = footerBar.querySelector('.mui-input-range'), page = imgData.page;
            //隐藏分页
            if (pageNum === 1 && page === undefined || page === false) {
                pageNone.style.display = 'none';
                imgPageNone.style.display = 'none';
            }
            //生成图片
            //        for(let i = 0, item; i <= pageNum - 1; i++ ){
            //            item =  {src : imgSrc[i]};
            //            sliderItems.push( item );
            //        }
            //获取图片宽高
            if (sliderItems[0]) {
                var tmpImg_1 = new Image();
                var items_1 = [];
                tmpImg_1.src = sliderItems[0];
                //            console.log(sliderItems[0].src);
                tmpImg_1.onload = function () {
                    items_1 = sliderItems.map(function (item) {
                        return {
                            h: tmpImg_1.height,
                            w: tmpImg_1.width,
                            src: item
                        };
                    });
                    // 初始化slider
                    initSlider(items_1);
                };
            }
            //显示文件名
            headerBar.querySelector('.mui-title').textContent = imgData.title;
            //设置最大页数
            if (pageNum > 1) {
                footerBar.querySelector('#maxPageNum').textContent = pageNum;
                rangeInput.setAttribute('max', pageNum);
                maxPageNum1.textContent = pageNum;
            }
            //设置下载按钮
            if (imgData.downAddr) {
                footerBar.classList.add('download');
                footerBar.querySelector('[data-action="download"]').addEventListener('tap', function () {
                    sys.window.download(imgData.downAddr);
                });
            }
            function initSlider(items) {
                //初始化photo swipe
                var gallery = new PhotoSwipe(slider, PhotoSwipeUI_Default, items, {
                    index: 0 // start at first slide
                    ,
                    pinchToClose: false,
                    closeOnScroll: false,
                    closeOnVerticalDrag: false,
                    mouseUsed: false,
                    escKey: false,
                    arrowKeys: false,
                    history: false,
                    modal: false,
                    clickToCloseNonZoomable: false,
                    closeElClasses: [],
                    fullscreenEl: false,
                    shareEl: false,
                    zoomEl: false,
                    arrowEl: false,
                    captionEl: false
                });
                gallery.init();
                gallery.listen('afterChange', function () {
                    rangeInput.value = this.getCurrentIndex() + 1;
                    imgPage.innerHTML = this.getCurrentIndex() + 1;
                });
                //选择页数
                rangeInput.addEventListener('change', function () {
                    gallery.goTo(parseInt(this.value) - 1);
                    imgPage.innerHTML = this.value;
                });
            }
            //点击消失与出现
            slider.addEventListener('tap', function () {
                headerBar.classList.toggle('hide');
                footerBar.classList.toggle('hide');
            });
        }
        return class_1;
    }());
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="components/Component.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
