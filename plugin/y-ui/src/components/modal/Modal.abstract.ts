namespace $y{

	export abstract class AbstractModal{
		protected $el: any;					// 模态框主对象
		protected $panel?: any;  			// 外容器对象，限制在某个div中拖动，默认全屏幕边界内可拖动
		// $autoWidthTarget 内部容器对象，用于改变窗口宽度实际控制对象，无配置默认获取 modal-body(控制高) 
		protected $resizeWidthTarget?: any;  
		// $autoHeightTarget 内部容器对象，用于改变窗口高度实际控制对象，无配置默认获取 modal-dialog（控制宽）	
		protected $resizeHeightTarget?: any;  			
		protected $title: any;				// 标题栏对象
		protected $close: any;				// 关闭按钮对象
		protected top?: number = 100;		// 模态框初始top
		protected _moveing: boolean = false;// 是否处于移动状态
		protected _scaleing: boolean = false;// 是否处于缩放状态
		protected _panelInfo: any;			// 用于缓存外边框边界数据，提高移动效率
		protected _dragState: any;			// 记录鼠标按下时，坐标信息，用于位移计算
		constructor(options: any) {
			if(options.top) {
				this.top = options.top;
			}
			this.$el = typeof options.el === 'string' ? document.querySelector(options.el): options.el;
			this.$title = typeof options.title === 'string' ? document.querySelector(options.title): options.title;
			this.$close = typeof options.close === 'string' ? document.querySelector(options.close): options.close;
			this.$panel = typeof options.panel === 'string' ? document.querySelector(options.panel): options.panel;
		}
		// 判断是否是显示状态
		abstract isShow(): Boolean;
		// 显示
		abstract show(): void;
		// 隐藏
		abstract hide(): void;
		// 绑定事件
		abstract _bindEvent(): void;
		// 销毁组件
		abstract destroy(): void;
	}

}
