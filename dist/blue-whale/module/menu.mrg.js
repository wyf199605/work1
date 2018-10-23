/// <amd-module name="menuMrg"/>
define("menuMrg", ["require", "exports", "Modal", "BwRule", "Mask"], function (require, exports, Modal_1, BwRule_1, mask_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    function popoverToggle(dom, isActive) {
        if (isActive === void 0) { isActive = !dom.classList.contains('mui-active'); }
        var mask = mask_1.Mask.getInstance();
        if (!isActive) {
            dom.classList.remove('mui-active');
            mask.hide();
        }
        else {
            mask.addClick(dom, function () {
                dom.classList.remove('mui-active');
                mask.hide();
            });
            dom.classList.add('mui-active');
            mask.show(dom);
        }
    }
    exports.popoverToggle = popoverToggle;
    exports.MENU_FAVORITE = {
        currentMenuDom: null,
        valueObtain: null,
        parentNode: null,
        currentConDom: true,
        funcNumber: true,
        currentGroupDom: false,
        openGroupDom: (function (n) {
            var open = G.d.create(n.getElementById('openGroupTpl').text);
            n.body.appendChild(open);
            var reqGroup = open.querySelector('.reqGroup'), closeBtn = open.querySelector('.btn-close'), set_s = (open.querySelector('.set_s')), txt = open.querySelector('.txt_row'), txt_t = open.querySelector('.txt_t'), newval = null;
            //确定按钮事件
            d.on(closeBtn, 'click', function () {
                popoverToggle(exports.MENU_FAVORITE.openGroupDom, false);
            });
            reqGroup.addEventListener('click', function () {
                if (txt.style.display === 'block') {
                    var options = set_s.options;
                    exports.MENU_FAVORITE.currentGroupDom = false;
                    for (var i = 0; i < length; i++) {
                        if (options[i].text == txt_t.value) {
                            exports.MENU_FAVORITE.currentGroupDom = true;
                        }
                    }
                    var tValue = txt_t.value.trim();
                    if (tValue === '') {
                        Modal_1.Modal.alert('内容不能为空！');
                        exports.MENU_FAVORITE.currentGroupDom = true;
                    }
                    else if (tValue === '默认分组') {
                        Modal_1.Modal.alert('该命名已存在！');
                    }
                    else {
                        var add = document.createElement('option');
                        newval = tValue;
                        add.value = newval;
                        add.text = newval;
                        set_s.appendChild(add);
                    }
                }
                else {
                    newval = set_s.options[set_s.selectedIndex].value;
                }
                if (!exports.MENU_FAVORITE.currentGroupDom) {
                    var currentData = document.getElementById('favSheet');
                    var data = currentData.dataset.link;
                    BwRule_1.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
                        type: 'POST',
                        data2url: true,
                        data: {
                            action: 'add',
                            link: data,
                            tag: newval.trim()
                        }
                    }).then(function (_a) {
                        var response = _a.response;
                        exports.MENU_FAVORITE.currentMenuDom.dataset.favid = response.data[0].favid;
                        // mui(MENU_FAVORITE.openGroupDom).popover('toggle');
                        popoverToggle(exports.MENU_FAVORITE.openGroupDom);
                        Modal_1.Modal.toast('收藏成功');
                    });
                    // Rule.ajax(BW.CONF.ajaxUrl.menuFavor,{
                    //     type : 'POST',
                    //     urlData : true,
                    //     data : {
                    //         action : 'add',
                    //         link : data,
                    //         tag : newval.trim()
                    //     },
                    //     success: function(response){
                    //         MENU_FAVORITE.currentMenuDom.dataset.favid = response.data[0].favid;
                    //         mui(MENU_FAVORITE.openGroupDom).popover('toggle');
                    //         mui.toast('收藏成功');
                    //     },
                    //     error :function(){
                    //     }
                    // });
                }
            });
            return open;
        }(document)),
        favEditDom: (function (d) {
            var edit = G.d.create(d.getElementById('favEditTpl').text);
            d.body.appendChild(edit);
            return edit;
        }(document)),
        favSheetDom: (function (d) {
            var sheet = G.d.create(d.getElementById('favSheetTpl').text);
            G.d.on(sheet, 'click', 'li[data-action]', function (e) {
                e.preventDefault();
                switch (this.dataset.action) {
                    case 'favAdd':
                        exports.MENU_FAVORITE.favActionHandle('add', sheet.dataset.link);
                        break;
                    case 'favCancel':
                        exports.MENU_FAVORITE.favActionHandle('cancel', sheet.dataset.favid);
                        break;
                    case 'close':
                    default:
                        popoverToggle(exports.MENU_FAVORITE.favSheetDom, false);
                        break;
                }
            });
            d.body.appendChild(sheet);
            return sheet;
        }(document)),
        toggleEditGroup: function () {
            var edit = document.getElementById('favEdit'), edit_req = edit.querySelector('.edit-req'), txt_edit = edit.querySelector('.txt_edit'), closeBtn = edit.querySelector('.edit-close'), blur = document.querySelector('.mui-backdrop'), edit_del = edit.querySelector('.edit-del');
            d.on(closeBtn, 'click', function () {
                popoverToggle(exports.MENU_FAVORITE.favEditDom, false);
            });
            d.on(edit_req, 'click', function () {
                var editBook = document.querySelector('.editBook'), tag = exports.MENU_FAVORITE.valueObtain, rename = txt_edit.value, len = G.tools.str.utf8Len(txt_edit.value);
                if (len === 0) {
                    Modal_1.Modal.alert('命名不能为空！');
                }
                else if (len > 20) {
                    Modal_1.Modal.alert('超出命名长度！');
                }
                else if (tag === rename || tag === "" && rename === '默认分组') {
                    // mui(MENU_FAVORITE.favEditDom).popover('toggle');
                    popoverToggle(exports.MENU_FAVORITE.favEditDom);
                }
                else {
                    BwRule_1.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
                        data2url: true,
                        data: {
                            action: 'renameTag',
                            tag: tag,
                            rename: rename
                        }
                    }).then(function (_a) {
                        var response = _a.response;
                        // mui(MENU_FAVORITE.favEditDom).popover('toggle');
                        popoverToggle(exports.MENU_FAVORITE.favEditDom);
                        var dom = exports.MENU_FAVORITE.parentNode.parentNode.parentNode, dataName = dom.parentNode.querySelector('[data-edit="' + rename + '"]'), fragment = document.createDocumentFragment();
                        dom.querySelector('.conFavGroup').innerHTML = rename;
                        if (dataName) {
                            var liDom = dom.querySelectorAll('li[data-favid]'), len_1 = liDom.length;
                            for (var i = 0; i <= len_1 - 1; i++) {
                                fragment.appendChild(liDom[i]);
                            }
                            dataName.parentNode.parentNode.appendChild(fragment);
                            dom.remove();
                        }
                        exports.MENU_FAVORITE.parentNode.dataset.edit = rename;
                    });
                    // Rule.ajax(BW.CONF.ajaxUrl.menuFavor, {
                    //     urlData : true,
                    //     data :{
                    //         action : 'renameTag',
                    //         tag : tag,
                    //         rename : rename
                    //     },
                    //     success : function (response) {
                    //         mui( MENU_FAVORITE.favEditDom).popover('toggle');
                    //         let dom = MENU_FAVORITE.parentNode.parentNode.parentNode,
                    //             dataName =dom.parentNode.querySelector('[data-edit="' + rename + '"]'),
                    //             fragment = document.createDocumentFragment();
                    //         dom.querySelector('.conFavGroup').innerHTML = rename;
                    //         if( dataName ){
                    //             let liDom = dom.querySelectorAll( 'li[data-favid]' ),
                    //                 len = liDom.length;
                    //             for( let i = 0; i <= len-1; i++ ){
                    //                 fragment.appendChild(liDom[i]);
                    //             }
                    //             dataName.parentNode.parentNode.appendChild(fragment);
                    //             dom.remove();
                    //         }
                    //         MENU_FAVORITE.parentNode.dataset.edit = rename;
                    //     },
                    //     error : function () {
                    //     }
                    // });
                }
            });
            d.on(edit_del, 'click', function () {
                var tag = exports.MENU_FAVORITE.valueObtain;
                Modal_1.Modal.confirm({
                    msg: '确认删除？',
                    callback: function (index) {
                        if (index) {
                            BwRule_1.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
                                data2url: true,
                                data: {
                                    action: 'delTag',
                                    tag: tag
                                }
                            }).then(function () {
                                exports.MENU_FAVORITE.parentNode.parentNode.parentNode.remove();
                                // mui(MENU_FAVORITE.favEditDom).popover('toggle');
                                popoverToggle(exports.MENU_FAVORITE.favEditDom);
                            });
                        }
                        //
                        //     Rule.ajax(BW.CONF.ajaxUrl.menuFavor, {
                        //         urlData : true,
                        //         data :{
                        //             action : 'delTag',
                        //             tag : tag
                        //         },
                        //         success : function (response) {
                        //             MENU_FAVORITE.parentNode.parentNode.parentNode.remove();
                        //             mui(MENU_FAVORITE.favEditDom).popover('toggle');
                        //         },
                        //         error : function () {
                        //         }
                        //     });
                        // }
                    }
                });
            });
            // d.on(edit, 'click',function () {
            //     edit_req.focus();
            // });
            // d.on(blur, 'click',function () {
            //     edit_req.focus();
            // });
        },
        toggleConGroup: function () {
            var open = document.getElementById('openGroup'), set = open.querySelector('.set_row'), add_g = open.querySelector('.add_g'), add_d = open.querySelector('.add_d'), txt_t = open.querySelector('.txt_t'), set_s = open.querySelector('.set_s'), blur = document.querySelector('.mui-backdrop'), txt = open.querySelector('.txt_row');
            d.on(add_g, 'click', function () {
                set.style.display = 'none';
                txt.style.display = 'block';
            });
            d.on(add_d, 'click', function () {
                txt.style.display = 'none';
                set.style.display = 'block';
            });
            blur && blur.addEventListener('click', function () {
                set_s.blur();
                txt_t.blur();
            }, false);
            open && open.addEventListener('click', function () {
                set_s.blur();
                txt_t.blur();
            }, false);
        },
        /**
         * 显示或关闭favSheet
         * @param menuDom
         * @param [type] 不填则关闭，填cancel则出现取消收藏，填add出现添加收藏按钮
         * @param [data] 显示时加在dataset中的数据
         */
        toggleFavSheet: function (menuDom, type, data) {
            var datasetKey;
            var openGroup = document.getElementById('openGroup'), set = openGroup.querySelector('.set_row'), txt = openGroup.querySelector('.txt_row'), txt_t = openGroup.querySelector('.txt_t'), addGroup = document.querySelector('.addGroup');
            this.currentMenuDom = menuDom;
            if (!G.tools.isEmpty(type)) {
                data = data || {};
                if (type === 'cancel') {
                    this.favSheetDom.classList.add('fav-cancel');
                }
                else {
                    this.favSheetDom.classList.remove('fav-cancel');
                    if (exports.MENU_FAVORITE.currentConDom) {
                        addGroup.addEventListener('click', function () {
                            // mui(MENU_FAVORITE.favSheetDom).popover('toggle');
                            // mui(MENU_FAVORITE.openGroupDom).popover('toggle');
                            popoverToggle(exports.MENU_FAVORITE.favSheetDom);
                            popoverToggle(exports.MENU_FAVORITE.openGroupDom);
                            txt.style.display = 'none';
                            set.style.display = 'block';
                            txt_t.value = '';
                            BwRule_1.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
                                data2url: true,
                                data: {
                                    action: 'tags'
                                }
                            }).then(function (_a) {
                                var response = _a.response;
                                //查询遍历收藏分组
                                var set_s = set.querySelector('.set_s'), len = response.data.length, fragment = document.createDocumentFragment();
                                set_s.innerHTML = '';
                                if (len === 0) {
                                    var nopt = document.createElement('option');
                                    nopt.setAttribute('value', '默认分组');
                                    nopt.text = '默认分组';
                                    set_s.appendChild(nopt);
                                }
                                for (var i = 0; i <= len - 1; i++) {
                                    var opt = document.createElement('option');
                                    if (response.data[i].tag) {
                                        var tagg = response.data[i].tag;
                                        opt.setAttribute('value', tagg);
                                        opt.text = tagg;
                                    }
                                    else {
                                        opt.setAttribute('value', '');
                                        opt.text = '默认分组';
                                    }
                                    fragment.appendChild(opt);
                                }
                                set_s.appendChild(fragment);
                            });
                            // Rule.ajax(BW.CONF.ajaxUrl.menuFavor, {
                            //     urlData : true,
                            //     data :{
                            //         action : 'tags'
                            //     },
                            //     //查询遍历收藏分组
                            //     success : function (response) {
                            //         let set_s = set.querySelector('.set_s'),
                            //             len = response.data.length,
                            //             fragment = document.createDocumentFragment();
                            //         set_s.innerHTML = '';
                            //         if( len === 0){
                            //             let nopt = document.createElement('option');
                            //             nopt.setAttribute('value','默认分组');
                            //             nopt.text = '默认分组';
                            //             set_s.appendChild(nopt);
                            //         }
                            //         for(let i=0;i <= len - 1;i ++){
                            //             let opt = document.createElement('option');
                            //             if( response.data[i].tag){
                            //                 let tagg = response.data[i].tag;
                            //                 opt.setAttribute('value',tagg);
                            //                 opt.text = tagg;
                            //             }
                            //             else{
                            //                 opt.setAttribute('value','');
                            //                 opt.text = '默认分组';
                            //             }
                            //             fragment.appendChild(opt);
                            //         }
                            //         set_s.appendChild(fragment);
                            //
                            //     },
                            //     error : function () {
                            //     }
                            // });
                            exports.MENU_FAVORITE.toggleConGroup();
                            exports.MENU_FAVORITE.currentConDom = false;
                        });
                    }
                }
                //     console.log(1 ,data);
                for (datasetKey in data) {
                    if (data.hasOwnProperty(datasetKey)) {
                        this.favSheetDom.dataset[datasetKey] = data[datasetKey];
                    }
                }
            }
            // mui(this.favSheetDom).popover('toggle');
            popoverToggle(this.favSheetDom);
        },
        /**
         * 取消或者添加收藏
         * @param {"add"|"cancel"} actionType
         * @param {url|id} data 如果cationType 为 add 则 data为url, cancel则data为menuId
         */
        favActionHandle: function (actionType, data) {
            var ajaxData, thisMenu = this;
            if (actionType === 'add') {
                ajaxData = {
                    action: 'add',
                    link: data
                };
            }
            else {
                ajaxData = {
                    action: 'del',
                    favid: data
                };
            }
            //         Rule.ajax(BW.CONF.ajaxUrl.menuFavor, {
            //             data : ajaxData,
            //             urlData : true,
            //             type : 'POST',
            //             success : function (response) {
            //                 if(ajaxData.action === 'add'){
            // //                        thisMenu.currentMenuDom.dataset.favid = response.data[0].favid;
            // //                        mui(MENU_FAVORITE.openGroupDom).popover('toggle');
            // //                        mui.toast('收藏成功');
            //                 }else{
            //                     mui.toast('取消收藏成功');
            //                     thisMenu.currentMenuDom.dataset.favid = '';
            //                     if( document.getElementById('favorites')){
            //                         thisMenu.currentMenuDom.querySelector('a').remove();
            //                         let parent = thisMenu.currentMenuDom.parentNode,
            //                             hasLi = parent.querySelector('a');
            //                         if(!hasLi){
            //                             parent.remove();
            //                         }
            //                     }
            //                     thisMenu.toggleFavSheet();
            //                 }
            //             },
            //             error : function () {
            //             }
            //         })
            BwRule_1.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.menuFavor, {
                data: ajaxData,
                data2url: true,
                type: 'POST'
            }).then(function (_a) {
                var response = _a.response;
                if (ajaxData.action === 'add') {
                    //                        thisMenu.currentMenuDom.dataset.favid = response.data[0].favid;
                    //                        mui(MENU_FAVORITE.openGroupDom).popover('toggle');
                    //                        mui.toast('收藏成功');
                }
                else {
                    Modal_1.Modal.toast('取消收藏成功');
                    thisMenu.currentMenuDom.dataset.favid = '';
                    if (d.query('.tab-pane[data-index="1"]')) {
                        thisMenu.currentMenuDom.querySelector('a').remove();
                        var parent_1 = d.closest(thisMenu.currentMenuDom, '.mui-table-view-cell'), hasLi = parent_1.querySelector('a');
                        if (!hasLi) {
                            parent_1.remove();
                        }
                    }
                    thisMenu.toggleFavSheet();
                }
            });
        }
    };
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
