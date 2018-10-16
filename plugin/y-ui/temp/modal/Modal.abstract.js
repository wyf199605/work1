var $y;
(function ($y) {
    var AbstractModal = (function () {
        function AbstractModal(options) {
            this.top = 100; // 模态框初始top
            this._moveing = false; // 是否处于移动状态
            this._scaleing = false; // 是否处于缩放状态
            if (options.top) {
                this.top = options.top;
            }
            this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
            this.$title = typeof options.title === 'string' ? document.querySelector(options.title) : options.title;
            this.$close = typeof options.close === 'string' ? document.querySelector(options.close) : options.close;
            this.$panel = typeof options.panel === 'string' ? document.querySelector(options.panel) : options.panel;
        }
        return AbstractModal;
    }());
    $y.AbstractModal = AbstractModal;
})($y || ($y = {}));
