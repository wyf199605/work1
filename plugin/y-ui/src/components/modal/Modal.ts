/// <reference path="../utils/Utils.ts" />
namespace $y{	

	export class Modal extends AbstractModal{
		
		constructor(options: any) {
			super(options);
			this._bindEvent();
		}
		isShow(): boolean {
			if(!this.$el) {
				return;
			}
			if( this.$el.style.display === 'none' ) {
				return false;
			}
			else {
				return true;
			}
		}
		show() {
			if(!this.$el) {
				return;
			}
			this.$el.classList.add('y-modal'); 

			// 初始化显示的位置
			this._setPosition();
			this.$el.classList.remove('fade'); 			
			this.$el.style.display = 'block'; 
			this.$el.classList.add('y-modal-opening');

			setTimeout(()=> {
				this.$el.classList.remove('y-modal-opening');
			}, 500);
		}
		hide() {
			if(!this.$el) {
				return;
			}			 
			this.$el.classList.add('y-modal-closing');
			setTimeout(()=> {
				this.$el.classList.add('fade'); 
				this.$el.style.display = 'none';
				this.$el.classList.remove('y-modal-closing');
			}, 450);
		}
		// 对话框位置设置
		private _setPosition() {
			let left,
				modalBody = this.$el,
				isHide = this.$el.style.display != 'block';
			if(isHide) {
				this.$el.classList.remove('fade'); 
				this.$el.style.display = 'block';
			}			
			left = document.body.scrollWidth/2 - (modalBody.getBoundingClientRect().width/2);
			if(isHide) {
				this.$el.style.display = 'none';
				this.$el.classList.add('fade');
			}
			this.$el.style.top = this.top + 'px';
			this.$el.style.left = (left<0? 0: left) + 'px';
		}

		// 获取拖拽边界
		private _getPanelInfo(): any {			
			if(!this._panelInfo) {
				if(this.$panel) {
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
		}
		// 获取模态框坐标信息
		private _getDragState(event:any, elInfo: any, type: boolean): any {			
			if(!this._dragState || type) {
				return {
					startMouseTop: event.pageY,
					startMouseLeft: event.pageX,
					startTop: elInfo.top + (document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset),
					startRight: elInfo.left + elInfo.width,
					startLeft: elInfo.left + (document.documentElement.scrollLeft || document.body.scrollLeft || window.pageXOffset),
					startBottom: elInfo.top + elInfo.height,
					width: elInfo.width,
					height: elInfo.height
				};
			}
			else {
				return this._dragState;
			}
		}
		// 鼠标按下
		private _mousedownHandle(event: any) {
			let _elInfo = this.$el.getBoundingClientRect(),
				_event = Uitls.isMobile()? event.targetTouches[0]: event,
				_minTop: number = 0,
				_minLeft: number = 0,
				_maxTop: number = 0,
				_maxLeft: number = 0;
			this._moveing = true;
			Uitls.dragStart();
    		this.$el.classList.add('y-modal-graging');
			this._panelInfo = this._getPanelInfo();
			this._dragState = this._getDragState(_event, _elInfo, true);
			_minTop = this._panelInfo.top;
			_maxTop = this._panelInfo.bottom-this._dragState.height;
			_minLeft = this._panelInfo.left;
			_maxLeft = this._panelInfo.right-this._dragState.width;

			console.log(this._dragState, _event.pageY, _event.clientY, _event);
			

			// 对话框移动主事件
			const _mousemoveHandle = (event: any) => {
				let _event = Uitls.isMobile()? event.targetTouches[0]: event;
				if(this._moveing) {
					//alert('startMouseLeft:'+this._dragState.startMouseLeft + '|startMouseTop:' + this._dragState.startMouseTop);
					// 控制边界
					let top = this._dragState.startTop + (_event.pageY-this._dragState.startMouseTop),
						left = this._dragState.startLeft + (_event.pageX-this._dragState.startMouseLeft);
					// 上边界
					top = top < _minTop? _minTop: top;
					// 下边界
					top = top > _maxTop?_maxTop : top; 
					// 左边界 
					left = left < _minLeft?_minLeft : left; 
					// 右边界
					left = left > _maxLeft? _maxLeft: left;
					this.$el.style.top = top + 'px';
					this.$el.style.left = left + 'px';
				}				
			}
			// 鼠标释放
			const _mouseupHandle = (event: any) => {
				this._moveing = false;
				this._panelInfo = null;
				this._dragState = null;
				this.$el.classList.remove('y-modal-graging');
				Uitls.dragStop();				
				Uitls.mousemove('off', document, _mousemoveHandle);
				Uitls.mouseup('off', document, _mouseupHandle);
			}

			Uitls.mousemove('on', document, _mousemoveHandle);
			Uitls.mouseup('on', document, _mouseupHandle);
		}
		// 鼠标划过，变换鼠标样式
		private _mouseoverHandle(event: any) {
			document.body.style.cursor = 'move';
		}

		// 移除鼠标样式
		private _removeCursorHandle(): void {
			document.body.style.cursor = '';
		}
		// 标题栏拖拽事件
		private _dragEvent() {
			Uitls.mousedown('on', this.$title, (event: any)=>{ this._mousedownHandle(event) });
			Uitls.on('mouseover', this.$title, this._mouseoverHandle );
			Uitls.on('mouseout', this.$title, this._removeCursorHandle );
			Uitls.on('mouseout', this.$el, this._removeCursorHandle );
		}
		// 关闭按钮事件
		private _closeEvent() {
			if(this.$close) {
				Uitls.on('mouseup', this.$close, (event: any)=>{ this.hide(); });
			}			
		}
		// 窗口重置，调整对话框显示位置
		private _winResize() {
			let timeOut: any;
			Uitls.on('resize', window, ()=> {
				timeOut && clearTimeout(timeOut);
				timeOut = setTimeout(()=> {
					this._setPosition();
				}, 100);
			});
		}
		// 改变窗口大小
		private _changeResize(event: any) {
			let _elInfo = this.$el.getBoundingClientRect(),
				_event = Uitls.isMobile()? event.targetTouches[0]: event,
				_modalWidth: any, _modalHeight: any,
				_minWidth: number = 100,
				_minHeight: number = 50,
				_maxWidth: number = 0,
				_maxHeight: number = 0,
				temp;
			Uitls.dragStart();
			this._scaleing = true;
			this._panelInfo = this._getPanelInfo();
			this._dragState = this._getDragState(_event, _elInfo, true);
			if(!this.$resizeWidthTarget) {
				if(temp=  this.$el.querySelector('.modal-dialog')) {
					this.$resizeWidthTarget = temp;
					temp = null;
				}
				else {
					this.$resizeWidthTarget = this.$el;
				}
				
			}
			if(!this.$resizeHeightTarget) {
				if(temp=  this.$el.querySelector('.modal-body')) {
					this.$resizeHeightTarget = temp;
					temp = null;
				}
				else {
					this.$resizeWidthTarget = this.$el;
				}				
			}
			_modalWidth = this.$resizeWidthTarget.getBoundingClientRect();
			_modalHeight = this.$resizeHeightTarget.getBoundingClientRect();			
			_maxWidth = this._panelInfo.right-_modalWidth.left;
			_maxHeight = this._panelInfo.bottom-_modalHeight.top;
			_modalWidth = _modalWidth.width;
			_modalHeight = _modalHeight.height;
			
			// 对话框移动主事件
			const _mousemoveHandle = (event: any) => {
				let _event = Uitls.isMobile()? event.targetTouches[0]: event;
				if(this._scaleing) {
					//alert('startMouseLeft:'+this._dragState.startMouseLeft + '|startMouseTop:' + this._dragState.startMouseTop);
					// 控制边界
					let width = _modalWidth + (_event.pageX-this._dragState.startMouseLeft),
						height = _modalHeight + (_event.pageY-this._dragState.startMouseTop);					

					width = width > _maxWidth? _maxWidth: width;
					width = width < _minWidth? _minWidth: width;
					height = height > _maxHeight? _maxHeight: height;
					height = height < _minHeight? _minHeight: height;

					if(this.$resizeWidthTarget) {
						this.$resizeWidthTarget.style.width = width + 'px';
					}
					if(this.$resizeHeightTarget) {
						this.$resizeHeightTarget.style.height = height + 'px';
					}
				}				
			}
			// 鼠标释放
			const _mouseupHandle = (event: any) => {
				this._scaleing = false;
				this._panelInfo = null;
				this._dragState = null;
				Uitls.dragStop();				
				Uitls.mousemove('off', document, _mousemoveHandle);
				Uitls.mouseup('off', document, _mouseupHandle);
			}

			Uitls.mousemove('on', document, _mousemoveHandle);
			Uitls.mouseup('on', document, _mouseupHandle);
		}
		private _createResize() {
			let em = document.createElement('em');
			em.classList.add('y-modal-btn-resize');
			this.$el.appendChild(em);

			Uitls.mousedown('on', em, (event: any)=>{ this._changeResize(event) });
		}
		_bindEvent() {
			this._createResize();
			this._dragEvent();
			this._winResize();
			this._closeEvent();
		}
		destroy() {
			this.$el = null;
			this.$panel = null;
			this.$title = null;
			this.$close = null;
			this._panelInfo = null;
			this._dragState = null;
			document.body.style.cursor = '';
		}

	}

}
