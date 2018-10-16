/// <amd-module name="MenuDesignModule"/>
define("MenuDesignModule", ["require", "exports", "TextInputModule", "CheckBox"], function (require, exports, TextInputModule_1, checkBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var MenuDesignModule = /** @class */ (function (_super) {
        __extends(MenuDesignModule, _super);
        function MenuDesignModule(para) {
            var _this = _super.call(this, para) || this;
            if (tools.isEmpty(para))
                para = {};
            _this.init(para);
            return _this;
        }
        MenuDesignModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"designContentItems\">\n                <div class=\"designContentItem\"></div>\n                <div class=\"designContentItem\"></div>\n                <div class=\"designContentItem\"></div>\n                <div class=\"designContentItem\"></div>\n                <div class=\"designContentItem\"></div>\n                <div class=\"designContentItem\"></div>\n                <div class=\"designContentItem\"></div>\n                <div class=\"designContentItem\" style=\"padding-left: 60px\"></div>\n                <div class=\"clear\"></div>\n        </div>\n        ");
        };
        MenuDesignModule.prototype.init = function (para) {
            var data = [
                {
                    title: "菜单编码",
                    id: 'nodeId'
                },
                {
                    title: "页面编码",
                    id: 'itemId'
                },
                {
                    title: "页面标题",
                    id: 'caption'
                },
                {
                    title: "菜单名称",
                    id: 'captionExplain'
                },
                {
                    title: "父页面编码",
                    id: 'parentId'
                },
                {
                    title: "图标",
                    id: 'iconName'
                },
                {
                    title: '变量',
                    id: 'varId',
                }
            ];
            this.menuDesignData = tools.isNotEmpty(para.menuDesignData) ? para.menuDesignData : data;
            this.isShow = para.isShow || false;
        };
        Object.defineProperty(MenuDesignModule.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (isShow) {
                this._isShow = isShow;
                if (this._isShow === true) {
                    this.wrapper.classList.remove('menuDesignHide');
                }
                else {
                    this.wrapper.classList.add('menuDesignHide');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MenuDesignModule.prototype, "allItems", {
            get: function () {
                if (!this._allItems) {
                    this._allItems = {
                        nodeId: null,
                        caption: null,
                        captionExplain: null,
                        itemId: null,
                        parentId: null,
                        iconName: null,
                        varId: null,
                        isLeaf: null
                    };
                }
                return this._allItems;
            },
            set: function (obj) {
                if (tools.isEmpty(obj)) {
                    obj = {};
                }
                this._allItems = obj;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MenuDesignModule.prototype, "menuDesignData", {
            get: function () {
                return this._menuDesignData;
            },
            set: function (arr) {
                if (tools.isEmpty(arr)) {
                    arr = [];
                }
                this._menuDesignData = arr;
                var contentContainers = d.queryAll('.designContentItem', this.wrapper);
                var length = contentContainers.length;
                for (var i = 0; i < length - 1; i++) {
                    var container = contentContainers[i];
                    var module = new TextInputModule_1.TextInputModule({
                        container: container,
                        title: this._menuDesignData[i].title,
                        value: this._menuDesignData[i].value,
                        disabled: true
                    });
                    this.allItems[this._menuDesignData[i].id] = module;
                }
                var isLeaf = new checkBox_1.CheckBox({
                    text: '叶子节点',
                    container: contentContainers[length - 1],
                    disabled: true
                });
                this.allItems['isLeaf'] = isLeaf;
            },
            enumerable: true,
            configurable: true
        });
        return MenuDesignModule;
    }(Component));
    exports.MenuDesignModule = MenuDesignModule;
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
