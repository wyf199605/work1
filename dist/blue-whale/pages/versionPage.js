define(["require", "exports", "BasicPage"], function (require, exports, basicPage_1) {
    "use strict";
    return /** @class */ (function (_super) {
        __extends(versionPage, _super);
        function versionPage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            var versionData = para.version, versionHTML = '';
            versionData.version_memo.split("<br>").forEach(function (row) {
                versionHTML += '<p>' + row + '</p>';
            });
            _this.dom.querySelector('.versionNo').innerHTML = versionData.version_no;
            _this.dom.querySelector('.versionMemo').innerHTML = versionHTML;
            return _this;
        }
        return versionPage;
    }(basicPage_1.default));
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

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
