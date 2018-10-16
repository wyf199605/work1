define("MapDimension", ["require", "exports", "Modal", "NumInput", "LeBasicPage", "Button", "BDMap", "LeRule", "LeButtonGroup"], function (require, exports, Modal_1, numInput_1, LeBasicPage_1, Button_1, BMap_1, LeRule_1, LeButtonGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var SPA = G.SPA;
    var MapDimensionModal = /** @class */ (function (_super) {
        __extends(MapDimensionModal, _super);
        function MapDimensionModal() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MapDimensionModal.prototype.init = function (para, data) {
            if (!para.position) {
                para.position = [119.173392, 26.071787];
            }
            this.ajaxData = para && para.ajaxData && JSON.parse(para.ajaxData);
            if (G.tools.isNotEmpty(this.ajaxData)) {
                para.position = [Number(this.ajaxData.activity_longitude), Number(this.ajaxData.activity_latitude)];
                para.radius = this.ajaxData.activity_location_radius;
                para.address = this.ajaxData.activity_location_name;
            }
            this.mapDimension = new MapDimension();
            this.mapDimension.init(para, this.modal.bodyWrapper, data, this.saveBtnHandle);
            this.modal.position = 'center';
        };
        MapDimensionModal.prototype.modalParaGet = function () {
            return {
                header: {
                    title: this.para.title
                },
                className: 'lesson-modal',
            };
        };
        MapDimensionModal.prototype.saveBtnHandle = function (para, data, num) { };
        return MapDimensionModal;
    }(LeBasicPage_1.LeBasicPage));
    exports.MapDimensionModal = MapDimensionModal;
    var MapModalModify = /** @class */ (function (_super) {
        __extends(MapModalModify, _super);
        function MapModalModify() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MapModalModify.prototype.saveBtnHandle = function (map, para, num) {
            request(map, para, num, LE.CONF.ajaxUrl.mapSave, true);
        };
        return MapModalModify;
    }(MapDimensionModal));
    exports.MapModalModify = MapModalModify;
    var MapModalAdd = /** @class */ (function (_super) {
        __extends(MapModalAdd, _super);
        function MapModalAdd() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MapModalAdd.prototype.saveBtnHandle = function (map, data, num) {
            request(map, data, num, LE.CONF.ajaxUrl.mapAdd);
        };
        return MapModalAdd;
    }(MapDimensionModal));
    exports.MapModalAdd = MapModalAdd;
    function request(map, para, num, url, isAdd) {
        if (isAdd === void 0) { isAdd = false; }
        var position = map.position.value.split(','), ajaxData = isAdd && para.ajaxData && ('?activity_location_id=' + JSON.parse(para.ajaxData).activity_location_id) || '';
        LeRule_1.LeRule.Ajax.fetch(url + ajaxData, {
            type: 'post',
            data: [{
                    activity_location_name: map.address.value,
                    activity_location_radius: num,
                    activity_longitude: position[0],
                    activity_latitude: position[1]
                }],
            dataType: 'json'
        }).then(function () {
            LeButtonGroup_1.buttonAction.btnRefresh(3);
        });
    }
    var MapDimension = /** @class */ (function () {
        function MapDimension() {
        }
        MapDimension.prototype.init = function (para, container, data, saveBtnHandle) {
            var _this = this;
            var mapEL, reset, search, searchInput, radius, tpl = h("div", { class: "map-module" },
                h("div", { class: "map-module-header" },
                    searchInput = h("input", { className: "default", "data-name": "search", type: "text" }),
                    search = h("div", { className: "btn btn-dark" }, "\u641C\u7D22"),
                    reset = h("div", { className: "btn btn-dark" }, "\u91CD\u7F6E")),
                mapEL = h("div", { className: "map-module-container" }),
                h("div", { class: "map-module-footer" },
                    h("div", { class: "map-module-item" },
                        h("span", null, "\u5730\u70B9\u540D\u79F0"),
                        this.address = h("input", { placeholder: "\u8BF7\u8F93\u5165\u5730\u70B9\u540D\u79F0", className: "default", "data-name": "address", type: "text" }, para.address)),
                    h("div", { class: "map-module-item" },
                        h("span", { className: "left-20" }, "\u534A\u5F84"),
                        radius = h("div", { "data-name": "radius" })),
                    h("div", { class: "map-module-item" },
                        h("span", null, "\u4F4D\u7F6E"),
                        this.position = h("input", { className: "default position", "data-name": "position", type: "text" }))),
                h("div", { className: "map-group-btns" },
                    h("div", null,
                        h(Button_1.Button, { content: "\u53D6\u6D88", size: "large", onClick: function () {
                                SPA.close();
                            } }),
                        h(Button_1.Button, { className: "save", content: "\u4FDD\u5B58", size: "large", type: "primary", onClick: function () {
                                var num = _this.numInput.get();
                                if (tools.isEmpty(_this.address.value)) {
                                    Modal_1.Modal.alert('地点不能为空');
                                    return;
                                }
                                if (tools.isEmpty(_this.numInput.value)) {
                                    Modal_1.Modal.alert('半径不能为空');
                                    return;
                                }
                                if (num > 1000) {
                                    Modal_1.Modal.toast('请输入小于1000的半径');
                                    return;
                                }
                                var pos = _this.BDMap.getPosition();
                                data && data.onClose && data.onClose(tools.isNotEmpty(pos) ? pos.lng : null, tools.isNotEmpty(pos) ? pos.lat : null, num, _this.address.value);
                                if (!para.notRequest) {
                                    saveBtnHandle(_this, para, num);
                                }
                                else {
                                    SPA.close();
                                }
                            } }))));
            this.numInput = new numInput_1.NumInput({
                container: radius,
            });
            this.setValue(para);
            d.on(search, 'click', function () {
                _this.BDMap.search(searchInput.value);
            });
            d.on(reset, 'click', function () {
                var point = {
                    lat: para.position[1],
                    lng: para.position[0]
                };
                _this.BDMap.panTo(point);
                _this.BDMap.clearOverlays();
                _this.BDMap.addOverlay(point);
                _this.setValue(para);
            });
            this.mapInit(mapEL, para.position);
            d.append(container, tpl);
        };
        MapDimension.prototype.setValue = function (para) {
            this.address.value = para.address || '';
            this.position.value = para.position.join(',');
            this.numInput.set(para.radius);
        };
        MapDimension.prototype.mapInit = function (container, position) {
            var _this = this;
            // 延时操作，解决第二次打开地图，地图显示不全的bug
            setTimeout(function () {
                _this.BDMap = new BMap_1.BDMap({
                    container: container,
                    position: position,
                    scroll: true,
                    mapClick: function (e) {
                        var point = e.point;
                        _this.BDMap.clearOverlays();
                        _this.BDMap.addOverlay(point);
                        _this.position.value = point.lng + ',' + point.lat;
                        _this.BDMap.surroundingPois(point).then(function (obj) {
                            _this.address.value = obj && obj.address;
                        });
                    }
                });
            });
        };
        return MapDimension;
    }());
    exports.MapDimension = MapDimension;
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

/// <reference path="index.ts"/>
/// <reference path="common/Config.ts"/>
/// <reference path="common/rule/LeRule.tsx"/>
