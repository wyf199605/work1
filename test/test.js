/// <amd-module name="GlobalTestModule"/>
define("GlobalTestModule", ["require", "exports", "Button"], function (require, exports, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var a = h(Button_1.Button, { content: "dddd", disaxxxbled: true });
    document.body.appendChild(h("div", { style: { color: '#fff', position: 'fixed' } }, a));
    console.log(a);
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>
