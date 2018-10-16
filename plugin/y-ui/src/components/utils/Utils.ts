namespace $y{
	export let Uitls = {
		uuid: 0,
		isArray: function(obj: any): boolean { 
			return Object.prototype.toString.call(obj) === '[object Array]'; 
		},
		mousedown: function(type: string, dom: any, callback: any){
			this[type](this.isMobile()? 'touchstart': 'mousedown', dom, callback);
		},
		mouseup(type: string, dom: any, callback: any): void{
			this[type](this.isMobile()? 'touchend': 'mouseup', dom, callback);
		},
		mousemove(type: string, dom: any, callback: any): void{
			this[type](this.isMobile()? 'touchmove': 'mousemove', dom, callback);
		},
		on(event: string, dom: any, callback: any): void {
			let doc = document;
			(<any>doc).addEventListener && (<any>dom).addEventListener(event, callback, false);
		},
		off(event: string, dom: any, callback: any): void {
			let doc = document;
			(<any>doc).removeEventListener && (<any>dom).removeEventListener(event, callback, false);
		},
		isMobile(): boolean {
			return 'ontouchmove' in document;
		},
		dragStart() {
			document.onselectstart = function() { return false; };
			document.ondragstart = function() { return false; };
		},
		dragStop() {
			document.onselectstart = null;
	  		document.ondragstart = null;
		}
	}
}