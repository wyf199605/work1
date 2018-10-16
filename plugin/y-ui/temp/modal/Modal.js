var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var $y;
(function ($y) {
    var Modal = (function (_super) {
        __extends(Modal, _super);
        function Modal(options) {
            var _this = _super.call(this, options) || this;
            _this._bindEvent();
            return _this;
        }
        Modal.prototype.isShow = function () {
            if (!this.$el) {
                return;
            }
            if (this.$el.style.display === 'none') {
                return false;
            }
            else {
                return true;
            }
        };
        Modal.prototype.show = function () {
            var _this = this;
            if (!this.$el) {
                return;
            }
            this.$el.classList.add('y-modal');
            // 初始化显示的位置
            this._setPosition();
            this.$el.classList.remove('fade');
            this.$el.style.display = 'block';
            this.$el.classList.add('y-modal-opening');
            setTimeout(function () {
                _this.$el.classList.remove('y-modal-opening');
            }, 500);
        };
        Modal.prototype.hide = function () {
            var _this = this;
            if (!this.$el) {
                return;
            }
            this.$el.classList.add('y-modal-closing');
            setTimeout(function () {
                _this.$el.classList.add('fade');
                _this.$el.style.display = 'none';
                _this.$el.classList.remove('y-modal-closing');
            }, 450);
        };
        // 对话框位置设置
        Modal.prototype._setPosition = function () {
            var left, modalBody = this.$el, isHide = this.$el.style.display != 'block';
            if (isHide) {
                this.$el.classList.remove('fade');
                this.$el.style.display = 'block';
            }
            left = document.body.scrollWidth / 2 - (modalBody.getBoundingClientRect().width / 2);
            if (isHide) {
                this.$el.style.display = 'none';
                this.$el.classList.add('fade');
            }
            this.$el.style.top = this.top + 'px';
            this.$el.style.left = (left < 0 ? 0 : left) + 'px';
        };
        // 获取拖拽边界
        Modal.prototype._getPanelInfo = function () {
            if (!this._panelInfo) {
                if (this.$panel) {
                    return this.$panel.getBoundingClientRect();
                }
                else {
                    return {
                        top: 0,
                        left: 0,
                        right: document.body.scrollWidth,
                        bottom: document.body.scrollHeight
                    };
                }
            }
            else {
                return this._panelInfo;
            }
        };
        // 获取模态框坐标信息
        Modal.prototype._getDragState = function (event, elInfo, type) {
            if (!this._dragState || type) {
                return {
                    startMouseTop: event.clientY,
                    startMouseLeft: event.clientX,
                    startTop: elInfo.top,
                    startRight: elInfo.left + elInfo.width,
                    startLeft: elInfo.left,
                    startBottom: elInfo.top + elInfo.height,
                    width: elInfo.width,
                    height: elInfo.height
                };
            }
            else {
                return this._dragState;
            }
        };
        // 鼠标按下
        Modal.prototype._mousedownHandle = function (event) {
            var _this = this;
            var _elInfo = this.$el.getBoundingClientRect(), _event = $y.Uitls.isMobile() ? event.targetTouches[0] : event, _minTop = 0, _minLeft = 0, _maxTop = 0, _maxLeft = 0;
            this._moveing = true;
            $y.Uitls.dragStart();
            this.$el.classList.add('y-modal-graging');
            this._panelInfo = this._getPanelInfo();
            this._dragState = this._getDragState(_event, _elInfo, true);
            _minTop = this._panelInfo.top;
            _maxTop = this._panelInfo.bottom - this._dragState.height;
            _minLeft = this._panelInfo.left;
            _maxLeft = this._panelInfo.right - this._dragState.width;
            // 对话框移动主事件
            var _mousemoveHandle = function (event) {
                var _event = $y.Uitls.isMobile() ? event.targetTouches[0] : event;
                if (_this._moveing) {
                    //alert('startMouseLeft:'+this._dragState.startMouseLeft + '|startMouseTop:' + this._dragState.startMouseTop);
                    // 控制边界
                    var top_1 = _this._dragState.startTop + (_event.clientY - _this._dragState.startMouseTop), left = _this._dragState.startLeft + (_event.clientX - _this._dragState.startMouseLeft);
                    // 上边界
                    top_1 = top_1 < _minTop ? _minTop : top_1;
                    // 下边界
                    top_1 = top_1 > _maxTop ? _maxTop : top_1;
                    // 左边界 
                    left = left < _minLeft ? _minLeft : left;
                    // 右边界
                    left = left > _maxLeft ? _maxLeft : left;
                    _this.$el.style.top = top_1 + 'px';
                    _this.$el.style.left = left + 'px';
                }
            };
            // 鼠标释放
            var _mouseupHandle = function (event) {
                _this._moveing = false;
                _this._panelInfo = null;
                _this._dragState = null;
                _this.$el.classList.remove('y-modal-graging');
                $y.Uitls.dragStop();
                $y.Uitls.mousemove('off', document, _mousemoveHandle);
                $y.Uitls.mouseup('off', document, _mouseupHandle);
            };
            $y.Uitls.mousemove('on', document, _mousemoveHandle);
            $y.Uitls.mouseup('on', document, _mouseupHandle);
        };
        // 鼠标划过，变换鼠标样式
        Modal.prototype._mouseoverHandle = function (event) {
            document.body.style.cursor = 'move';
        };
        // 移除鼠标样式
        Modal.prototype._removeCursorHandle = function () {
            document.body.style.cursor = '';
        };
        // 标题栏拖拽事件
        Modal.prototype._dragEvent = function () {
            var _this = this;
            $y.Uitls.mousedown('on', this.$title, function (event) { _this._mousedownHandle(event); });
            $y.Uitls.on('mouseover', this.$title, this._mouseoverHandle);
            $y.Uitls.on('mouseout', this.$title, this._removeCursorHandle);
            $y.Uitls.on('mouseout', this.$el, this._removeCursorHandle);
        };
        // 关闭按钮事件
        Modal.prototype._closeEvent = function () {
            var _this = this;
            if (this.$close) {
                $y.Uitls.on('mouseup', this.$close, function (event) { _this.hide(); });
            }
        };
        // 窗口重置，调整对话框显示位置
        Modal.prototype._winResize = function () {
            var _this = this;
            var timeOut;
            $y.Uitls.on('resize', window, function () {
                timeOut && clearTimeout(timeOut);
                timeOut = setTimeout(function () {
                    _this._setPosition();
                }, 100);
            });
        };
        // 改变窗口大小
        Modal.prototype._changeResize = function (event) {
            var _this = this;
            var _elInfo = this.$el.getBoundingClientRect(), _event = $y.Uitls.isMobile() ? event.targetTouches[0] : event, _modalWidth, _modalHeight, _minWidth = 100, _minHeight = 50, _maxWidth = 0, _maxHeight = 0, temp;
            $y.Uitls.dragStart();
            this._scaleing = true;
            this._panelInfo = this._getPanelInfo();
            this._dragState = this._getDragState(_event, _elInfo, true);
            if (!this.$resizeWidthTarget) {
                if (temp = this.$el.querySelector('.modal-dialog')) {
                    this.$resizeWidthTarget = temp;
                    temp = null;
                }
                else {
                    this.$resizeWidthTarget = this.$el;
                }
            }
            if (!this.$resizeHeightTarget) {
                if (temp = this.$el.querySelector('.modal-body')) {
                    this.$resizeHeightTarget = temp;
                    temp = null;
                }
                else {
                    this.$resizeWidthTarget = this.$el;
                }
            }
            _modalWidth = this.$resizeWidthTarget.getBoundingClientRect();
            _modalHeight = this.$resizeHeightTarget.getBoundingClientRect();
            _maxWidth = this._panelInfo.right - _modalWidth.left;
            _maxHeight = this._panelInfo.bottom - _modalHeight.top;
            _modalWidth = _modalWidth.width;
            _modalHeight = _modalHeight.height;
            // 对话框移动主事件
            var _mousemoveHandle = function (event) {
                var _event = $y.Uitls.isMobile() ? event.targetTouches[0] : event;
                if (_this._scaleing) {
                    //alert('startMouseLeft:'+this._dragState.startMouseLeft + '|startMouseTop:' + this._dragState.startMouseTop);
                    // 控制边界
                    var width = _modalWidth + (_event.clientX - _this._dragState.startMouseLeft), height = _modalHeight + (_event.clientY - _this._dragState.startMouseTop);
                    width = width > _maxWidth ? _maxWidth : width;
                    width = width < _minWidth ? _minWidth : width;
                    height = height > _maxHeight ? _maxHeight : height;
                    height = height < _minHeight ? _minHeight : height;
                    if (_this.$resizeWidthTarget) {
                        _this.$resizeWidthTarget.style.width = width + 'px';
                    }
                    if (_this.$resizeHeightTarget) {
                        _this.$resizeHeightTarget.style.height = height + 'px';
                    }
                }
            };
            // 鼠标释放
            var _mouseupHandle = function (event) {
                _this._scaleing = false;
                _this._panelInfo = null;
                _this._dragState = null;
                $y.Uitls.dragStop();
                $y.Uitls.mousemove('off', document, _mousemoveHandle);
                $y.Uitls.mouseup('off', document, _mouseupHandle);
            };
            $y.Uitls.mousemove('on', document, _mousemoveHandle);
            $y.Uitls.mouseup('on', document, _mouseupHandle);
        };
        Modal.prototype._createResize = function () {
            var _this = this;
            var em = document.createElement('em');
            em.classList.add('y-modal-btn-resize');
            this.$el.appendChild(em);
            $y.Uitls.mousedown('on', em, function (event) { _this._changeResize(event); });
        };
        Modal.prototype._bindEvent = function () {
            this._createResize();
            this._dragEvent();
            this._winResize();
            this._closeEvent();
        };
        Modal.prototype.destroy = function () {
            this.$el = null;
            this.$panel = null;
            this.$title = null;
            this.$close = null;
            this._panelInfo = null;
            this._dragState = null;
            document.body.style.cursor = '';
        };
        return Modal;
    }($y.AbstractModal));
    $y.Modal = Modal;
})($y || ($y = {}));
