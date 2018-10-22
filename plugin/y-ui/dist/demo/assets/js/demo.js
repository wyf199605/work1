'use strict';

// menuControl
(function () {
	var leftmenu = document.querySelector('#leftmenu');

	function closest(cls) {
		var dom = this;
		while (dom && dom.nodeType == 1) {
			if (dom.tagName === cls.toUpperCase() || dom.classList.contains(cls.replace('.', ''))) {
				return dom;
			}
			dom = dom.parentNode;
		}
		return null;
	}
	function getFileName() {
		var reg = new RegExp(".*/(.*?).html");
		var name = window.location.pathname.match(reg);
		return name ? name[1] : '';
	};
	function closeMenu() {
		[].forEach.call(leftmenu.querySelectorAll('.in'), function (a) {
			a.classList.remove('in');
		});
	}
	function selectMenu() {
		var currentFileName = getFileName();
		var currentLink = leftmenu.querySelectorAll('.panel-collapse a');
		for (var i = 0; i < currentLink.length; i++) {
			var linkName = currentLink[i].getAttribute('href').replace('.html', '');
			if (linkName == currentFileName) {
				var current = closest.apply(currentLink[i], ['.panel-collapse']);
				if (current) {
					currentLink[i].classList.add('active');
					current.classList.add('in');
					break;
				}
			}
		}
	}
	function preventDefault() {
		[].forEach.call(leftmenu.querySelectorAll('.panel-title a'), function (a) {
			a.addEventListener('click', function (event) {
				event.preventDefault();
			});
		});
	}

	// 菜单交互事件
	function bindEvent() {
		[].forEach.call(leftmenu.querySelectorAll('.panel-title'), function (a) {
			a.addEventListener('click', function (event) {
				var panel = closest.apply(event.target, ['.panel']);
				closeMenu();

				panel = panel.querySelector('.panel-collapse');
				if (panel.classList.contains("in")) {
					panel.classList.remove('in');
				} else {
					panel.classList.add('in');
				}
			});
		});
	}

	// 选中菜单
	selectMenu();
	preventDefault();
	bindEvent();
})();