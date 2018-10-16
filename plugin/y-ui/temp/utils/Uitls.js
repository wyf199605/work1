var $y;
(function ($y) {
    $y.Uitls = {
        isArray: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        mousedown: function (type, dom, callback) {
            this[type](this.isMobile() ? 'touchstart' : 'mousedown', dom, callback);
        },
        mouseup: function (type, dom, callback) {
            this[type](this.isMobile() ? 'touchend' : 'mouseup', dom, callback);
        },
        mousemove: function (type, dom, callback) {
            this[type](this.isMobile() ? 'touchmove' : 'mousemove', dom, callback);
        },
        on: function (event, dom, callback) {
            var doc = document;
            doc.addEventListener && dom.addEventListener(event, callback, false);
        },
        off: function (event, dom, callback) {
            var doc = document;
            doc.removeEventListener && dom.removeEventListener(event, callback, false);
        },
        isMobile: function () {
            return 'ontouchmove' in document;
        },
        dragStart: function () {
            document.onselectstart = function () { return false; };
            document.ondragstart = function () { return false; };
        },
        dragStop: function () {
            document.onselectstart = null;
            document.ondragstart = null;
        }
    };
})($y || ($y = {}));
