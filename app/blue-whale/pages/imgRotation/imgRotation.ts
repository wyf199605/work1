/// <amd-dependency path="photoSwipe" name="PhotoSwipe"/>
/// <amd-dependency path="photoSwipeUi" name="PhotoSwipeUI_Default"/>
import sys = BW.sys;

declare const PhotoSwipe :any;
declare const PhotoSwipeUI_Default :any;
export = class{
    constructor(){
        let imgData = JSON.parse(window.localStorage.getItem('imgRotateData')),
            sliderItems = imgData.img,
            pageNum = sliderItems.length,
            slider = document.querySelector('.pswp'),
            headerBar = document.getElementById('headerBar'),
            imgPageNone = <HTMLElement>headerBar.querySelector('.imgPage'),
            footerBar = document.getElementById('footerBar'),
            imgPage = document.getElementById('imgPage'),
            maxPageNum1 = document.getElementById('maxPageNum1'),
            rangeInput = <HTMLInputElement>footerBar.querySelector('input[type=range]'),
            pageNone = <HTMLElement>footerBar.querySelector('.mui-input-range'),
            page = imgData.page;

        //隐藏分页
        if(pageNum === 1 && page === undefined || page === false){
            pageNone.style.display = 'none';
            imgPageNone.style.display = 'none';
        }

        //生成图片
//        for(let i = 0, item; i <= pageNum - 1; i++ ){
//            item =  {src : imgSrc[i]};
//            sliderItems.push( item );
//        }

        //获取图片宽高
        if(sliderItems[0]) {
            let tmpImg = new Image();
            let items = [];
            tmpImg.src = sliderItems[0];
//            console.log(sliderItems[0].src);
            tmpImg.onload = function () {
                items = sliderItems.map(function (item) {
                    return {
                        h: tmpImg.height,
                        w: tmpImg.width,
                        src: item
                    }
                });

                // 初始化slider
                initSlider(items);
            }
        }

        //显示文件名
        headerBar.querySelector('.mui-title').textContent = imgData.title;
        //设置最大页数
        if(pageNum > 1){
            footerBar.querySelector('#maxPageNum').textContent = pageNum;
            rangeInput.setAttribute('max', pageNum);
            maxPageNum1.textContent = pageNum;
        }

        //设置下载按钮
        if(imgData.downAddr){
            footerBar.classList.add('download');
            footerBar.querySelector('[data-action="download"]').addEventListener('tap', function () {
                sys.window.download(imgData.downAddr);
            });
        }

        function initSlider(items) {
            //初始化photo swipe
            let gallery = new PhotoSwipe(slider, PhotoSwipeUI_Default, items,  {
                index: 0 // start at first slide
                , pinchToClose: false
                , closeOnScroll: false
                , closeOnVerticalDrag: false
                , mouseUsed: false
                , escKey: false
                , arrowKeys: false
                , history: false
                , modal: false
                , clickToCloseNonZoomable: false
                , closeElClasses: []
                , fullscreenEl: false
                , shareEl: false
                , zoomEl : false
                , arrowEl : false
                , captionEl : false
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
        slider.addEventListener('tap',function (){
            headerBar.classList.toggle('hide');
            footerBar.classList.toggle('hide');
        });
    }
}