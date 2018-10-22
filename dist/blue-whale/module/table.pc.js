define("BasicTable", ["require", "exports", "CheckBox"], function (require, exports, checkBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="BasicTable"/>
    var tools = G.tools;
    var d = G.d;
    var BasicTable = /** @class */ (function () {
        /**
         * 构造函数
         * @param paraConf
         */
        function BasicTable(paraConf) {
            var _this = this;
            // protected currentPage: number; // 当前页数
            this.tbodyLength = 0; // 当前页面显示多少条数据
            this.startIndex = 0; // 当前页面显示开始的index
            // protected ajaxData: any = null; // 上一次请求ajax的参数
            this.trSelected = []; //被选中的tr
            this.draging = false; // 鼠标是否按下拖拽中
            this.styleList = {}; // 鼠标是否按下拖拽中
            this.styleListReady = false; // 列宽度是否初始化缓存
            this.theadHeight = 0; // 当前表头高度
            this.cellHeight = 30; // 表格行高
            this.lockCol = {
                table: null,
                Container: null // 锁列外容器
            };
            this.lockRow = {
                table: null,
                fixed: null,
                Container: null,
                ContainInner: null,
                fixedContainer: null,
                fixedTable: null,
            };
            // 序列号
            this.indexCol = {
                width: 0,
                show: true,
                col: null
            };
            // 伪列
            this.pseudoCol = {
                width: 30,
                show: true,
                Container: null,
                fixedCol: null,
                confList: []
            };
            // 列宽调整
            this.colResize = {
                dragging: false,
                column: null,
                resizeProxy: null // 拖拽辅助线
            };
            // 行列交换
            this.move = {
                col: null,
                hoverCol: null,
                hoverRow: null,
                moving: false,
                timeout: null
            };
            // 隐藏的列
            this.colHide = {
                ready: false,
                status: {}
            };
            // 行展开树
            this.treegrid = {
                data: []
            };
            this.movingColumn = null; // 拖拽中的列信息
            this.movingHoverColumn = null; // 拖拽悬浮中的列信息
            this.movingHoverRow = null; // 拖拽悬浮中的列信息
            this.moving = false; // 是否拖拽中
            // 拖拽选择
            this.dragSelect = {
                selected: {} // 被选中的单元格对应的数据
            };
            // 拖拽行选中
            this.dragRows = {
                selected: {}
            };
            // 拖拽框
            this.dragControl = {
                dragging: false,
            };
            // 行展开
            this.expand = {
                toggler: {},
                Container: null
            };
            this.tableStatus = true; // 当前是否隐藏状态  [true: 显示, false: 隐藏]
            // 树形展开行
            this.treegridFunc = (function (self) {
                var _style = {
                    hitInfo: function (td) {
                        var hit = d.query('.tree-hit', td), icon = self.conf.treegrid.icon;
                        return {
                            hit: hit,
                            icon: icon
                        };
                    },
                    iconOpen: function (td) {
                        var info = this.hitInfo(td);
                        info.hit.classList.remove(_getIcon(false));
                        info.hit.classList.add(_getIcon(true));
                        info.hit.classList.remove(_getIcon('loading'));
                    },
                    iconClose: function (td) {
                        var info = this.hitInfo(td);
                        info.hit.classList.remove(_getIcon(true));
                        info.hit.classList.add(_getIcon(false));
                        info.hit.classList.remove(_getIcon('loading'));
                    },
                    iconLoading: function (td) {
                        var info = this.hitInfo(td);
                        info.hit.classList.remove(_getIcon(false));
                        info.hit.classList.add(_getIcon('loading'));
                    },
                    sysOpen: function (index) {
                        var trIndex = _treeDom.getRootIndex(index);
                        if (trIndex != null) {
                            // 计算展开的子项总条数
                            var startTr = d.query("tr[data-index=\"" + trIndex + "\"]", self.table), endTr = d.query("tr[data-index=\"" + (trIndex + 1) + "\"]", self.table), startTop = startTr.offsetTop, endTop = void 0, expandHeight = 0;
                            if (endTr) {
                                endTop = endTr.offsetTop;
                            }
                            else {
                                endTop = self.table.offsetHeight;
                            }
                            expandHeight = endTop - startTop;
                            self.sysColOpen(trIndex, expandHeight);
                        }
                    },
                    sysClose: function (index) {
                        if (!/^\d+$/.test(index)) {
                            this.sysOpen(index);
                        }
                        else {
                            var trIndex = _treeDom.getRootIndex(index);
                            if (trIndex != null) {
                                self.sysColClose(trIndex);
                            }
                        }
                    }
                };
                // 缓存树
                var _tree = {
                    /*
                     * 节点缓存结构：
                     * 1: {
                     *      level: 0,
                     *      children: [
                     *          1:{ data: {'field1':1,'field2':2,...}, children: [...], open: false, level: 1},
                     *          2:{ data: {'field1':1,'field2':2,...}, children: [...], open: false, level: 1},
                     *          ...
                     *      ]
                     * }
                     * */
                    getNodeIndex: function (index) {
                        var NodeIndex = index.split('-');
                        function getNode(indexs, data) {
                            if (indexs.length === 1) {
                                return data[indexs[0]];
                            }
                            else {
                                var childIndex = indexs.shift();
                                if (!data[childIndex] || !data[childIndex].children) {
                                    return null;
                                }
                                else {
                                    return getNode(indexs, data[childIndex].children);
                                }
                            }
                        }
                        return getNode(NodeIndex, self.treegrid.data);
                    },
                    addNodes: function (parentNode, newNodes, level) {
                        var newData = [];
                        /*function setNode(indexs, data, newData) {
                            if(indexs.length === 1) {
                                data[indexs[0]] = data[indexs[0]] || {};
                                data[indexs[0]].children = newData;
                                data[indexs[0]].open = false;
                                data[indexs[0]].level = level;
                            }
                            else {
                                let childIndex = indexs.pop();
                                setNode(indexs, data[childIndex].children, newData);
                            }
                        }*/
                        // 添加缓存数据
                        newNodes.forEach(function (item) {
                            newData.push({
                                data: item,
                                level: level,
                                open: false
                            });
                        });
                        parentNode.children = newData;
                    },
                    init: function (data) {
                        // 根结点数据初始化
                        self.treegrid.data = [];
                        data.forEach(function (item, i) {
                            self.treegrid.data[i] = {
                                open: false,
                                level: 0,
                                data: item
                            };
                        });
                    }
                };
                var _treeDom = {
                    // 添加表格子项
                    addChilds: function (index, newData) {
                        var tableTr = d.query("tr[data-index=\"" + index + "\"]", self.table), toInsert = tableTr.nextSibling ? tableTr.nextSibling : null, lockTableTr, toLockInsert;
                        if (self.conf.lockColNum > 0) {
                            lockTableTr = d.query("tr[data-index=\"" + index + "\"]", self.lockCol.table);
                            toLockInsert = lockTableTr.nextSibling ? lockTableTr.nextSibling : null;
                        }
                        // 表格主体
                        newData.forEach(function (item, i) {
                            var TR = self.rowCreate(item, index + "-" + i);
                            if (toInsert) {
                                self.table.tBodies[0].insertBefore(TR, toInsert);
                            }
                            else {
                                self.table.tBodies[0].appendChild(TR);
                            }
                            // 锁列
                            if (self.conf.lockColNum > 0) {
                                var lockTR = self.lock.rowCreate(TR);
                                if (toLockInsert) {
                                    self.lockCol.table.tBodies[0].insertBefore(lockTR, toLockInsert);
                                }
                                else {
                                    self.lockCol.table.tBodies[0].appendChild(lockTR);
                                }
                            }
                        });
                    },
                    // 获取根级index
                    getRootIndex: function (index) {
                        var findIndex = index.indexOf('-'), rootIndex;
                        if (!!~findIndex) {
                            rootIndex = index.substring(0, findIndex);
                        }
                        else {
                            rootIndex = index;
                        }
                        return parseInt(rootIndex);
                    },
                    // 获取上一级index
                    getParentIndex: function (index) {
                        var findIndex = index.toString().lastIndexOf('-');
                        if (!!~findIndex) {
                            return index.substring(0, findIndex);
                        }
                        else {
                            return index;
                        }
                    },
                    // 获取下一个同级节点
                    getNextIndex: function (index) {
                        var findIndex = index.toString().match(/(.*)-(\d+)/), nextIndex;
                        if (findIndex) {
                            var parent_1 = findIndex[1], child = parseInt(findIndex[2]) + 1;
                            nextIndex = parent_1 + "-" + child;
                        }
                        else {
                            nextIndex = parseInt(index) + 1;
                        }
                        // 检查是否最后一个元素
                        if (d.query("tr[data-index=\"" + nextIndex + "\"]", self.table)) {
                            return nextIndex;
                        }
                        else if (!findIndex) {
                            // 最外层结束
                            return '';
                        }
                        else {
                            // 当前是最后一个子项，重新定位到父节点下一级
                            var parentIndex = this.getParentIndex(nextIndex);
                            return this.getNextIndex(parentIndex);
                        }
                    },
                    /*
                     * 移除|隐藏行
                     * @param   index   目标index
                     * @param   cache   是否开启缓存(缓存开启，隐藏行/无缓存，删除行)
                     * */
                    hideChilds: function (index, cache) {
                        if (cache === void 0) { cache = false; }
                        if (index) {
                            var startTr = d.query("tr[data-index=\"" + index + "\"]", self.table), nextIndex = this.getNextIndex(index), nextTr = startTr;
                            while (nextTr = cache ? nextTr.nextSibling : startTr.nextSibling) {
                                var nextSIndex = nextTr.dataset.index;
                                if (nextSIndex === nextIndex.toString()) {
                                    break;
                                }
                                if (cache) {
                                    nextTr.style.display = 'none';
                                    // 锁列
                                    if (self.conf.lockColNum > 0) {
                                        var lockTr = d.query("tr[data-index=\"" + nextSIndex + "\"]", self.lockCol.table);
                                        lockTr.style.display = 'none';
                                    }
                                }
                                else {
                                    d.remove(nextTr);
                                    // 锁列
                                    if (self.conf.lockColNum > 0) {
                                        var lockTr = d.query("tr[data-index=\"" + nextSIndex + "\"]", self.lockCol.table);
                                        d.remove(lockTr);
                                    }
                                }
                            }
                        }
                    }
                };
                function open(td, index) {
                    var nodeData = _tree.getNodeIndex(index);
                    _style.iconLoading(td);
                    self.conf.treegrid.render(nodeData, index, function (childData) {
                        nodeData.open = true;
                        if (childData && childData.length > 0) {
                            // 更新缓存
                            _tree.addNodes(nodeData, childData, nodeData.level + 1);
                            // 添加dom
                            _treeDom.addChilds(index, childData);
                            // 更新伪列、序号行高
                            _style.sysOpen(index);
                        }
                        _style.iconOpen(td);
                    });
                }
                function close(td, index) {
                    var nodeData = _tree.getNodeIndex(index), cache = self.conf.treegrid.cache;
                    nodeData.open = false;
                    _style.iconClose(td);
                    // 移除|隐藏行
                    _treeDom.hideChilds(index, cache);
                    // 更新伪列、序号行高
                    _style.sysClose(index);
                }
                function _addChildRow(tr, rowData, level) {
                }
                function _mousedownHandle(event) {
                    var e = self.getEvent(event), tr = d.closest(e.target, 'tr'), index = tr.dataset.index;
                    if (index) {
                        var td = d.closest(e.target, 'td'), nodeData = _tree.getNodeIndex(index);
                        if (nodeData.open) {
                            // 折叠行
                            close(td, index);
                        }
                        else {
                            // 展开行
                            open(td, index);
                        }
                    }
                }
                function _getIcon(status) {
                    var icon;
                    switch (status) {
                        case false:
                            icon = self.conf.treegrid.icon[0];
                            break;
                        case true:
                            icon = self.conf.treegrid.icon[1];
                            break;
                        case 'loading':
                            icon = 'shuaxin1';
                            break;
                    }
                    return "icon-" + icon;
                }
                function _bindEvent() {
                    d.on(self.tableContainer, self.mousedownName, '.treegrid', _mousedownHandle);
                }
                function init() {
                    update();
                    _bindEvent();
                }
                function exchangeTd(treeGridTd, td) {
                    if (self.conf.treegrid.enabled && td && td.tagName === 'TD') {
                        var tdContent = td.innerHTML, temp = tdContent;
                        td.innerHTML = treeGridTd.innerHTML;
                        treeGridTd.innerHTML = td.querySelector('.tree-title').innerHTML;
                        td.querySelector('.tree-title').innerHTML = temp;
                    }
                }
                function addBtn(index, td) {
                    if (self.conf.treegrid.enabled && td && td.tagName === 'TD') {
                        var nodeData = _tree.getNodeIndex(index.toString());
                        if (nodeData) {
                            var indent = '', level = parseInt(nodeData.level), text = td.innerHTML, icon = _getIcon(nodeData.open), treeBtn = '';
                            for (var i = 0; i < level; i++) {
                                indent += "<span class=\"tree-indent\"></span>";
                            }
                            if (self.conf.treegrid.expand(nodeData, index)) {
                                treeBtn = "<i class=\"tree-hit iconfont " + icon + "\"></i>";
                            }
                            else {
                                treeBtn = "<i class=\"tree-hit-blank\"></i>";
                            }
                            td.innerHTML = "<div class=\"treegrid\">" + indent + treeBtn + "<span class=\"tree-title\">" + text + "</span></div>";
                        }
                    }
                }
                function removeBtn(td) {
                    if (self.conf.treegrid.enabled) {
                        var treegrid = d.query('.treegrid', td);
                        if (treegrid) {
                            var treetitle = d.query('.tree-title');
                            td.innerHTML = treetitle.innerHTML;
                        }
                    }
                }
                // 一列添加展开按钮
                function add(col) {
                    if (self.conf.treegrid.enabled) {
                        var added = col[1] && d.query('.treegrid', col[1]);
                        if (!added) {
                            col.forEach(function (item, i) {
                                addBtn(i, item);
                            });
                        }
                    }
                }
                // 一列移除展开按钮
                function remove(col) {
                    if (self.conf.treegrid.enabled) {
                        var added = col[1] && d.query('.treegrid', col[1]);
                        if (added) {
                            col.forEach(function (item) {
                                removeBtn(item);
                            });
                        }
                    }
                }
                // 数据初始化更新
                function update(data) {
                    if (data === void 0) { data = self.tableData; }
                    _tree.init(data);
                }
                return {
                    init: init,
                    addBtn: addBtn,
                    add: add,
                    removeBtn: removeBtn,
                    remove: remove,
                    update: update,
                    exchangeTd: exchangeTd
                };
            }(this));
            this.expandFunc = ((function (self) {
                var arrow = {
                    right: 'icon-arrow-right',
                    down: 'icon-arrow-down',
                    loading: 'icon-shuaxin1'
                };
                var _style = {
                    show: function (target) {
                        target.classList.remove(arrow.right);
                        target.classList.add(arrow.down);
                        target.dataset.status = '1';
                    },
                    hide: function (pseudoIndex, index, target) {
                        var Container = _getExpandContainer(index), expendRow;
                        if (!Container) {
                            return;
                        }
                        expendRow = _getExpandRow(index);
                        Container.style.display = 'none';
                        expendRow.forEach(function (item) {
                            item.style.display = 'none';
                        });
                        target.classList.add(arrow.right);
                        target.classList.remove(arrow.down);
                        target.dataset.status = '0';
                        self.sysColClose(index);
                        _style.ContainerUpdate();
                    },
                    loading: function (target) {
                        target.classList.remove(arrow.right, arrow.down);
                        target.classList.add(arrow.loading);
                    },
                    unloading: function (target) {
                        target.classList.remove(arrow.loading);
                        target.classList.add(arrow.down);
                    },
                    // 展开行top位置同步更新
                    ContainerUpdate: function () {
                        var Container = d.queryAll('.tableExpandContainer');
                        Container.forEach(function (item) {
                            var index = item.dataset.expandIndex, targetRow = d.query("tr[data-index=\"" + index + "\"]", self.table), top = tools.offset.top(targetRow) + targetRow.offsetHeight - tools.offset.top(self.tableContainer);
                            item.style.top = top + "px";
                        });
                    }
                };
                /**
                 * 把TR节点DOM 插入到 index位置
                 * @param TR
                 * @param index
                 * @param table
                 */
                function _rowInsertTo(index, TR, table) {
                    if (table === void 0) { table = self.table; }
                    var toInsert = self.rowGet(index + 1, table);
                    if (toInsert) {
                        table.tBodies[0].insertBefore(TR, toInsert);
                    }
                    else {
                        table.tBodies[0].appendChild(TR);
                    }
                }
                function _getExpandContainer(index) {
                    return d.query("div[data-expand-index=\"" + index + "\"]", self.tableContainer);
                }
                function _getExpandRow(index) {
                    return d.queryAll("tr[data-expand-index=\"" + index + "\"]", self.tableContainer);
                }
                // 创建扩展行dom
                function _createRow(pseudoIndex, index, html) {
                    var expendRow = _getExpandRow(index), Container = _getExpandContainer(index), ContainerHeight, sysColHeight;
                    // 表格占位
                    if (expendRow.length > 0) {
                        expendRow.forEach(function (item) {
                            item.style.display = 'table-row';
                        });
                        Container.style.display = 'block';
                    }
                    else {
                        var row = document.createElement('tr');
                        row.setAttribute('data-expand-index', index);
                        _rowInsertTo(index, row);
                        Container = d.create("<div class=\"tableExpandContainer\" data-expand-index=\"" + index + "\"></div>");
                        self.tableContainer.appendChild(Container);
                        expendRow.push(row);
                        if (self.conf.lockColNum > 0) {
                            var lockRow = row.cloneNode(true);
                            _rowInsertTo(index, lockRow, self.lockCol.table);
                            expendRow.push(lockRow);
                        }
                    }
                    Container.innerHTML = html;
                    self.expand.toggler[index] = html;
                    // 更新 索引列跟伪劣高度
                    ContainerHeight = Container.offsetHeight;
                    sysColHeight = ContainerHeight + self.cellHeight;
                    expendRow.forEach(function (item) {
                        item.style.height = ContainerHeight + "px";
                    });
                    self.sysColOpen(index, sysColHeight);
                    _style.ContainerUpdate();
                }
                function _expandRender(html, renderType) {
                    if (renderType === void 0) { renderType = 'dl'; }
                    function renderDl(html) {
                        var resultArr = [];
                        for (var item in html) {
                            if (html.hasOwnProperty(item)) {
                                resultArr.push("<dl class=\"tableExpandDl\"><dt>" + item + "</dt><dd>" + html[item] + "</dd></dl>");
                            }
                        }
                        return resultArr.join('');
                    }
                    var result = 'null';
                    switch (renderType) {
                        case 'dl':
                            result = renderDl(html);
                            break;
                    }
                    return result;
                }
                // 添加扩展行
                function _addRow(pseudoIndex, index, target, callback) {
                    var expand = self.conf.expand, data = self.tableData[index], html;
                    // 读取缓存
                    if (expand.cache) {
                        html = self.expand.toggler[index];
                    }
                    // 首次加载|未使用缓存
                    if (typeof html === 'undefined') {
                        if (expand.render) {
                            _style.loading(target);
                            expand.render(data, index, function (html, renderType) {
                                if (!html) {
                                    html = data;
                                }
                                if (typeof html === 'object') {
                                    var result = _expandRender(html, renderType);
                                    _createRow(pseudoIndex, index, result);
                                }
                                else {
                                    _createRow(pseudoIndex, index, html);
                                }
                                callback();
                                _style.unloading(target);
                            });
                        }
                        else {
                            _createRow(pseudoIndex, index, 'error');
                        }
                    }
                    else {
                        _createRow(pseudoIndex, index, html);
                        callback();
                    }
                }
                // 显示
                function _show(pseudoIndex, index, target) {
                    _addRow(pseudoIndex, index, target, function () {
                        _style.show(target);
                    });
                }
                // 隐藏
                function _hide(pseudoIndex, index, target) {
                    _style.hide(pseudoIndex, index, target);
                }
                // 展开/关闭
                function expandToggle(pseudoIndex, index, event) {
                    var status = event.target.dataset.status;
                    if (status) {
                        if (status === '0') {
                            _show(pseudoIndex, index, event.target);
                        }
                        else {
                            _hide(pseudoIndex, index, event.target);
                        }
                    }
                }
                // 展开/关闭
                function expandAccordion(pseudoIndex, index, event) {
                    var status = event.target.dataset.status, pseudoCol = d.queryAll(".pseudoCol[data-pseudo=\"" + pseudoIndex + "\"] [data-status=\"1\"]", self.pseudoCol.Container);
                    pseudoCol.forEach(function (item) {
                        var pseudo = d.closest(item, '.pseudoCol-item'), itemIndex = parseInt(pseudo.dataset.index);
                        if (itemIndex != index) {
                            if (pseudo) {
                                _hide(pseudoIndex, itemIndex, d.query('.tableExpand', pseudo));
                            }
                        }
                    });
                    if (status) {
                        if (status === '0') {
                            _show(pseudoIndex, index, event.target);
                        }
                        else {
                            _hide(pseudoIndex, index, event.target);
                        }
                    }
                }
                function clickHandle(index, event) {
                    var e = self.getEvent(event), pseudoCol = d.closest(e.target, '.pseudoCol'), pseudoIndex;
                    if (!pseudoCol) {
                        return;
                    }
                    pseudoIndex = pseudoCol.dataset.pseudo;
                    index = parseInt(index);
                    switch (self.conf.expand.mode) {
                        case 'toggler':
                            expandToggle(pseudoIndex, index, e);
                            break;
                        case 'accordion':
                            expandAccordion(pseudoIndex, index, e);
                            break;
                    }
                }
                function createPseudoCol() {
                    var expand = self.conf.expand;
                    self.pseudoColFun.init({
                        render: function (index) { return "<i class=\"iconfont tableExpand icon-" + expand.icon[0] + "\" data-status=\"0\"></i>"; },
                        click: clickHandle
                    });
                }
                function init() {
                    createPseudoCol();
                }
                return {
                    init: init
                };
            })(this));
            this.moveEvent = (function (self) {
                /**
                 * 列拖动
                 * @private
                 * @author yrh
                 */
                function col() {
                    var mousedownHandle = function (event) {
                        var _this = this;
                        var target = event.target, columnRect, moveTable, columnIndex, docWidth = document.body.scrollWidth, movingRect = null, rectInfo = null, show = false, lastMoveIndex, timeOut, scrollTime, delay = false, boundaryLeft = 0, boundaryRight = 0;
                        if (event.which !== 1) {
                            // 只有左键单击触发
                            return;
                        }
                        function getRectInfo() {
                            var info = { locktable: [], table: [] };
                            if (self.conf.lockColNum > 0) {
                                d.queryAll('th', self.lockCol.table.tHead).forEach(function (item) {
                                    var rect = item.getBoundingClientRect();
                                    info.locktable.push([rect.left, rect.right]);
                                });
                            }
                            d.queryAll('th', self.table.tHead).forEach(function (item) {
                                var rect = item.getBoundingClientRect();
                                info.table.push([rect.left, rect.right]);
                            });
                            return info;
                        }
                        /**
                         * 获取当前鼠标悬停的列（非起始列）
                         * @private
                         * @author yrh
                         */
                        function getHoverCol(x, rect) {
                            var lockRight = 0, result = null, index = null;
                            if ((x > rect.left && x < rect.right) ||
                                !rectInfo ||
                                x < rectInfo.table[0][0] ||
                                x > rectInfo.table[rectInfo.table.length - 1][1] ||
                                x > docWidth) {
                                //console.log((x>rect.left && x<rect.right), !rectInfo, x<rectInfo.table[0][0], x>rectInfo.table[rectInfo.table.length-1][1], x>docWidth);
                                return result;
                            }
                            else {
                                for (var i = 0, l = rectInfo.locktable.length; i < l; i++) {
                                    lockRight = rectInfo.locktable[i][1];
                                    if (x > rectInfo.locktable[i][0] && x < rectInfo.locktable[i][1]) {
                                        index = i;
                                        return index;
                                    }
                                }
                                if (index === null) {
                                    index = 0;
                                    for (var i = 0, l = rectInfo.table.length; i < l; i++) {
                                        if (rectInfo.table[i][1] > lockRight) {
                                            if (x > rectInfo.table[i][0] && x < rectInfo.table[i][1]) {
                                                index = i;
                                                return index;
                                            }
                                        }
                                    }
                                    if (index === 0) {
                                        return result;
                                    }
                                }
                            }
                            return index;
                            // console.log(x, rect.left, rect.right);
                        }
                        function scrollLeft() {
                            var left = self.tableMiddle.scrollLeft;
                            self.tableMiddle.scrollLeft = left > 0 ? (left - 5) : 0;
                            clearScroll();
                            scrollTime = setTimeout(scrollLeft);
                        }
                        function scrollRight() {
                            self.tableMiddle.scrollLeft += 5;
                            clearScroll();
                            scrollTime = setTimeout(scrollRight);
                        }
                        function clearScroll() {
                            scrollTime && clearTimeout(scrollTime);
                        }
                        // 超过边界，滚动条自动滑动
                        function boundaryScroll(event) {
                            //console.log(event.clientX, boundaryLeft, boundaryRight);
                            if (event.clientX < boundaryLeft) {
                                //左边界
                                scrollLeft();
                            }
                            else if (event.clientX > boundaryRight) {
                                //右边界
                                scrollRight();
                            }
                            else {
                                clearScroll();
                            }
                        }
                        function mouseMove(event) {
                            event.preventDefault();
                            event = self.getEvent(event);
                            clearTimeout(self.move.timeout);
                            boundaryScroll(event);
                            var currentIndex, left = (event.clientX - 10) - boundaryLeft, index = parseInt(self.movingHoverColumn.dataset.index), maxLeft = docWidth - movingRect.width - 10;
                            if (event.clientX > maxLeft) {
                                left = maxLeft;
                            }
                            currentIndex = getHoverCol(event.clientX, movingRect);
                            //self.movingHoverColumn.style.top = (event.pageY - 10) + 'px';
                            self.movingHoverColumn.style.top = '0px';
                            self.movingHoverColumn.style.left = left + 'px';
                            !show && (self.movingHoverColumn.style.display = 'block');
                            show = true;
                            // 延迟，解决抖动
                            if (index === null || currentIndex === null || (lastMoveIndex === currentIndex && delay)) {
                                return;
                            }
                            lastMoveIndex = index;
                            delay = true;
                            timeOut && clearTimeout(timeOut);
                            timeOut = setTimeout(function () {
                                delay = false;
                            }, 1000);
                            self.colInsertTo(index, currentIndex);
                            self.movingHoverColumn.dataset.index = currentIndex;
                            rectInfo = getRectInfo();
                            movingRect = {
                                left: rectInfo.table[currentIndex][0],
                                right: rectInfo.table[currentIndex][1]
                            };
                            movingRect.width = movingRect.right - movingRect.left;
                        }
                        var disabledCol = function () {
                            self.colGet(columnIndex, self.table).forEach(function (tr) {
                                tr.classList.add('col-disabled');
                            });
                            if (self.conf.lockColNum > 0) {
                                self.colGet(columnIndex, self.lockCol.table).forEach(function (tr) {
                                    tr.classList.add('col-disabled');
                                });
                            }
                            if (self.conf.lockRow) {
                                self.colGet(columnIndex, self.lockRow.table).forEach(function (tr) {
                                    tr.classList.add('col-disabled');
                                });
                            }
                            if (self.conf.lockColNum > 0 && self.conf.lockRow) {
                                self.colGet(columnIndex, self.lockRow.fixedTable).forEach(function (tr) {
                                    tr.classList.add('col-disabled');
                                });
                            }
                        };
                        var mouseUp = function () {
                            d.queryAll('.col-disabled', _this.tableWrapper).forEach(function (item) {
                                item.classList.remove('col-disabled');
                            });
                            clearScroll();
                            d.remove(self.movingHoverColumn);
                            d.off(document, self.mousemoveName, mouseMove);
                            d.off(document, self.mouseupName, mouseUp);
                            document.onselectstart = null;
                            document.ondragstart = null;
                            self.movingColumn = null;
                            self.moving = false;
                            movingRect = null;
                            rectInfo = null;
                            self.unlockScreen();
                            // 列分组事件重新绑定
                            if (self.conf.colGroup) {
                                self.colGroup.on();
                            }
                        };
                        var createMovingContainer = function () {
                            var thead = self.table.tHead.cloneNode(), tbody = self.table.tBodies.item(0).cloneNode();
                            moveTable = self.table.cloneNode();
                            moveTable.removeAttribute('id');
                            moveTable.classList.remove('hideLock');
                            moveTable.appendChild(thead);
                            moveTable.appendChild(tbody);
                            self.movingHoverColumn.appendChild(moveTable);
                            self.tableWrapper.appendChild(self.movingHoverColumn);
                            //console.log(columnIndex);
                            self.colGet(columnIndex, self.table).forEach(function (item) {
                                var tr = document.createElement('tr'), td = item.cloneNode(true);
                                td.classList.remove('col-disabled');
                                tr.appendChild(td);
                                if (item.tagName === 'TH') {
                                    thead.appendChild(tr);
                                }
                                else if (item.tagName === 'TD') {
                                    tbody.appendChild(tr);
                                }
                                if (!movingRect) {
                                    movingRect = {};
                                    movingRect.left = tools.offset.left(item);
                                    movingRect.right = movingRect.left + item.offsetWidth;
                                    movingRect.width = item.offsetWidth;
                                }
                                // PROFITRATIO
                                self.movingHoverColumn.setAttribute('data-index', self.colName2index(item.dataset.col) + '');
                                //console.log(item.dataset.col, self.colName2index(item.dataset.col));
                            });
                        };
                        if (self.conf.Container) {
                            boundaryLeft = tools.offset.left(self.conf.Container);
                            boundaryRight = boundaryLeft + self.conf.Container.offsetWidth;
                        }
                        else {
                            boundaryLeft = tools.offset.left(self.tableWrapper);
                            boundaryRight = boundaryLeft + self.tableWrapper.offsetWidth;
                        }
                        self.movingHoverColumn = d.query('.tableMovingContainer') || d.create('<div class="tableMovingContainer"></div>');
                        self.lockScreen();
                        document.onselectstart = function () {
                            return false;
                        };
                        document.ondragstart = function () {
                            return false;
                        };
                        self.timeOut = setTimeout(function () {
                            if (self.colResize.dragging) {
                                return;
                            }
                            while (target && target.tagName !== 'TH') {
                                target = target.parentNode;
                            }
                            self.movingColumn = target;
                            if (self.movingColumn) {
                                rectInfo = getRectInfo();
                                columnIndex = self.colName2index(self.movingColumn.dataset.col);
                                disabledCol();
                                createMovingContainer();
                                self.moving = true;
                                d.on(document, self.mousemoveName, mouseMove);
                                d.on(document, self.mouseupName, mouseUp);
                            }
                        }, 300);
                    };
                    function mouseupHandle() {
                        document.onselectstart = null;
                        document.ondragstart = null;
                        self.timeOut && clearTimeout(self.timeOut);
                    }
                    d.on(self.tableContainer, self.mousedownName, 'th', mousedownHandle);
                    d.on(self.tableContainer, self.mouseupName, 'th', mouseupHandle);
                }
                /**
                 * 行拖动
                 * @private
                 * @author yrh
                 */
                function row() {
                    var moveTable, movingRect, rectInfo, offsetTop, offsetLeft, maxTop = 0, lockLeft = 0, minTop = 0, docHeight, scrollTop = 0;
                    /**
                     * 行拖动事件
                     * @private
                     * @author yrh
                     */
                    var movedownHandle = function () {
                        var _this = this;
                        minTop = self.table.tHead.getBoundingClientRect().bottom;
                        // 分组行
                        if (self.conf.colGroup) {
                            minTop += 30;
                        }
                        if (self.conf.Container) {
                            // 表格内嵌容器，校正top
                            offsetTop = tools.offset.top(self.conf.Container);
                            minTop -= scrollTop;
                        }
                        else {
                            offsetTop = tools.offset.top(self.tableContainer);
                        }
                        self.lockScreen();
                        offsetLeft = tools.offset.left(self.tableContainer);
                        self.movingHoverRow = document.querySelector('.tableMovingContainer') || d.create('<div class="tableMovingContainer"></div>');
                        function createMovingContainer() {
                            var tr = self.trMoveSelected.cloneNode(true), tbody = self.table.tBodies.item(0).cloneNode();
                            tbody.appendChild(tr);
                            moveTable = self.table.cloneNode();
                            moveTable.removeAttribute('id');
                            moveTable.classList.remove('hideLock');
                            moveTable.appendChild(tbody);
                            self.movingHoverRow.appendChild(moveTable);
                            self.tableContainer.appendChild(self.movingHoverRow);
                            if (!movingRect) {
                                movingRect = {
                                    top: tools.offset.top(self.trMoveSelected),
                                    bottom: self.trMoveSelected.offsetHeight
                                };
                            }
                            self.movingHoverRow.setAttribute('data-index', tr.dataset.index);
                        }
                        function getRectInfo() {
                            var info = { locktable: [], table: [] };
                            //scrollTop = self.conf.Container.scrollTop;
                            d.queryAll('tr', self.table.tBodies.item(0)).forEach(function (item) {
                                var top = tools.offset.top(item), left = tools.offset.left(item);
                                info.table.push([top, top + item.offsetHeight]);
                                maxTop = top + scrollTop;
                                lockLeft = left;
                            });
                            return info;
                        }
                        /**
                         * 获取当前鼠标悬停的行（非起始列）
                         * @private
                         * @author yrh
                         */
                        function getHoverRow(y, rect) {
                            var lockBottom = 0, result = null, index = null, deviation = self.conf.colGroup ? -1 : 0;
                            if (!rect) {
                                return;
                            }
                            if ((y > rect.top && y < rect.bottom) ||
                                !rectInfo ||
                                y < rectInfo.table[0][0] ||
                                y > rectInfo.table[rectInfo.table.length - 1][1] ||
                                y > docHeight) {
                                return result;
                            }
                            else {
                                for (var i = 0, l = rectInfo.locktable.length; i < l; i++) {
                                    lockBottom = rectInfo.locktable[i][1];
                                    if (y > rectInfo.locktable[i][0] && y < rectInfo.locktable[i][1]) {
                                        index = i;
                                        return index + deviation;
                                    }
                                }
                                if (index === null) {
                                    index = 0;
                                    for (var i = 0, l = rectInfo.table.length; i < l; i++) {
                                        if (rectInfo.table[i][1] > lockBottom) {
                                            if (y > rectInfo.table[i][0] && y < rectInfo.table[i][1]) {
                                                index = i;
                                                return index + deviation;
                                            }
                                        }
                                    }
                                    if (index === 0) {
                                        return result;
                                    }
                                }
                            }
                            return index + deviation;
                        }
                        function mouseMove(event) {
                            //event.preventDefault();
                            event = self.getEvent(event);
                            var currentIndex, top = event.pageY - offsetTop - 15, index = self.movingHoverRow.dataset.index;
                            scrollTop = 0;
                            clearTimeout(self.move.timeout);
                            if (self.conf.Container) {
                                // 表格内嵌容器，校正top
                                scrollTop = self.conf.Container.scrollTop;
                                top += scrollTop;
                            }
                            if (event.pageY > maxTop - scrollTop) {
                                top = maxTop - offsetTop - scrollTop;
                            }
                            //console.log(event.pageY, minTop, scrollTop, minTop-scrollTop);
                            if (event.pageY < minTop - scrollTop) {
                                top = minTop - offsetTop - scrollTop;
                            }
                            currentIndex = getHoverRow(event.pageY + scrollTop, movingRect);
                            self.movingHoverRow.style.left = (lockLeft - offsetLeft) + 'px';
                            self.movingHoverRow.style.top = top + 'px';
                            self.movingHoverRow.style.display = 'block';
                            if (currentIndex === null) {
                                return;
                            }
                            self.rowInsertTo(parseInt(index), currentIndex);
                            self.movingHoverRow.dataset.index = currentIndex;
                            movingRect = {
                                top: rectInfo.table[currentIndex][0],
                                bottom: rectInfo.table[currentIndex][1]
                            };
                        }
                        function mouseUp() {
                            self.unlockScreen();
                            d.queryAll('.col-disabled', self.tableWrapper).forEach(function (item) {
                                item.classList.remove('col-disabled');
                            });
                            d.remove(self.movingHoverRow);
                            d.off(document, self.mousemoveName, mouseMove);
                            d.off(document, self.mouseupName, mouseUp);
                            document.onselectstart = null;
                            document.ondragstart = null;
                            self.trMoveSelected = null;
                            movingRect = null;
                            rectInfo = null;
                            setTimeout(function () {
                                self.moving = false;
                            }, 10);
                        }
                        document.onselectstart = function () {
                            return false;
                        };
                        document.ondragstart = function () {
                            return false;
                        };
                        self.timeOut = setTimeout(function () {
                            var index = _this.dataset.index ? parseInt(_this.dataset.index) : -1;
                            self.trMoveSelected = self.rowGet(index);
                            docHeight = document.body.scrollHeight;
                            rectInfo = getRectInfo();
                            disabledRow();
                            createMovingContainer();
                            self.moving = true;
                            //rowMoveHide();
                            d.on(document, self.mousemoveName, mouseMove);
                            d.on(document, self.mouseupName, mouseUp);
                        }, 300);
                    };
                    /**
                     * disabled行样式
                     * @private
                     * @author yrh
                     */
                    var disabledRow = function () {
                        var index = parseInt(self.trMoveSelected.dataset.index), selectedRow;
                        self.trMoveSelected.classList.add('col-disabled');
                        selectedRow = self.rowGet(index, self.lockCol.table);
                        selectedRow && selectedRow.classList.add('col-disabled');
                        selectedRow = self.rowGet(index, self.lockRow.fixedTable);
                        selectedRow && selectedRow.classList.add('col-disabled');
                        selectedRow = self.rowGet(index, self.lockRow.table);
                        selectedRow && selectedRow.classList.add('col-disabled');
                    };
                    function moveupHandle() {
                        document.onselectstart = null;
                        document.ondragstart = null;
                        self.timeOut && clearTimeout(self.timeOut);
                    }
                    d.on(self.tableWrapper, self.mousedownName, 'div.indexCol-item', movedownHandle);
                    d.on(self.tableWrapper, self.mouseupName, 'div.indexCol-item', moveupHandle);
                }
                return { col: col, row: row };
            })(this);
            this.unlockScreen = function () {
                var container = this.conf.Container, body = document.body;
                if (container) {
                    container.style.overflowY = 'auto';
                    //container.style.height = '';
                }
                this.tableMiddle.style.overflowX = 'auto';
                this.tableMiddle.style.width = '';
                body.style.overflow = '';
                body.style.height = '';
            };
            this.indexColFun = (function (self) {
                var lockFixedIndexCol = null; // 左上角锁头序列号
                /**
                /**
                 * 序号列渲染
                 * @param len - 长度
                 * @param refresh - 刷新还是外后附加
                 */
                // function render(len : number, refresh : boolean){
                //     let tmpDoc,
                //         offset = 0, // 显示开始的数字
                //         plus = 0; // data-index开始的数字
                //     if(refresh){
                //         self.indexCol.col.innerHTML = '';
                //     }else{
                //         offset = self.tableData.length;
                //     }
                //     if(!refresh || self.bodyRenderRefresh) {
                //         plus = (self.currentPage - 1) * self.conf.length;
                //     }
                //     tmpDoc = createIndexCol(offset, len, plus);
                //     self.indexCol.col.appendChild(tmpDoc);
                // }
                var init = function () {
                    var html = '<div class="indexCol"></div>';
                    self.indexCol.col = d.create(html);
                    self.tableWrapper.appendChild(self.indexCol.col);
                    self.tableWrapper.classList.add('hasIndexCol');
                    self.indexCol.width = self.indexCol.col.getBoundingClientRect().width;
                    d.on(self.tableWrapper, self.eventClickName, 'div.indexCol > div', function () {
                        var index = this.dataset.index ? parseInt(this.dataset.index) : -1, allRow = self.rowGetAll();
                        if (index === -1 && self.conf.indexColMulti) {
                            var isAllSelect_1 = allRow.length === self.trSelected.length;
                            if (self.conf.indexCol === 'select') {
                                checkSelect(this, !isAllSelect_1);
                            }
                            allRow.forEach(function (tr) {
                                isAllSelect_1 ? self.rowDeselect(tr) : self.rowSelect(tr, true);
                            });
                            this.innerHTML = isAllSelect_1 ? '全选' : '取消';
                            return;
                            // self.rowSelect();
                        }
                        var tr = self.rowGet(index);
                        if (self.conf.indexColMulti) {
                            self.rowToggle(tr);
                        }
                        else {
                            if (self.trSelected[0] === tr) {
                                self.rowDeselect(tr);
                            }
                            else {
                                self.rowSelect(tr);
                            }
                        }
                        checkSelect(self.indexCol.col.firstChild, allRow.length === self.trSelected.length);
                    });
                    // self.on('page', function (e:CustomEvent) {
                    //
                    //     let start = (self.currentPage - 1 ) * self.conf.length;
                    //     render(start, e.detail.len, e.detail.type ==='refresh' || !self.conf.appendPage);
                    // });
                    if (self.conf.indexCol === 'select') {
                        self.on('rowSelect', function (e) {
                            var detail = e.detail;
                            setTimeout(function () {
                                detail.indexes.forEach(function (index) {
                                    checkSelect(d.query("div[data-index=\"" + index + "\"]", self.indexCol.col), detail.select);
                                    // let input = <HTMLInputElement>d.query(`div[data-index="${index}"] > .select-box input`, self.indexCol.col);
                                    //
                                    // input.checked = detail.select;
                                });
                            }, 10);
                        });
                    }
                    function checkSelect(indexColDiv, isSelect) {
                        var input = d.query('.select-box input', indexColDiv);
                        input && (input.checked = isSelect);
                    }
                };
                /**
                 * 序号列渲染
                 * @param {number} start
                 * @param {number} len
                 * @param {boolean} refresh
                 */
                function render(start, len, refresh) {
                    var offset = start, colType = 'index';
                    if (refresh) {
                        self.indexCol.col.innerHTML = '';
                        start = 0;
                    }
                    var childNode = self.conf.indexCol === 'select' ? function () { return getCheckBox(self.ssid); } : null;
                    var tmpDoc = self.createSysCol({
                        Container: self.indexCol.col,
                        offset: offset,
                        len: len,
                        start: start,
                        colType: colType,
                        childNode: childNode
                    });
                    if (self.table.tBodies.item(0).firstElementChild !== null) {
                        self.indexCol.show = true;
                    }
                    self.indexCol.col.appendChild(tmpDoc);
                }
                /**
                 * 固定行序号列渲染
                 */
                function refreshIndex() {
                    d.queryAll('div:not(.hide)', self.indexCol.col).forEach(function (div, i) {
                        div.innerHTML = i === 0 ? '' : i.toString();
                    });
                }
                function show(flag) {
                    if (self.indexCol.col) {
                        self.indexCol.show = flag;
                        self.indexCol.col.classList[flag ? 'remove' : 'add']('hide');
                        self.tableWrapper.classList[!flag ? 'remove' : 'add']('hasIndexCol');
                        self.pseudoColFun.resize();
                        self.resize();
                    }
                }
                return {
                    render: render,
                    refreshIndex: refreshIndex,
                    init: init,
                    show: show,
                    fixedRender: function () {
                        var _indexItem = d.create('<div>全选</div>');
                        if (!lockFixedIndexCol) {
                            lockFixedIndexCol = self.indexCol.col.cloneNode();
                        }
                        lockFixedIndexCol.innerHTML = '';
                        lockFixedIndexCol.appendChild(_indexItem);
                        self.lockRow.fixed.querySelector('.Container').appendChild(lockFixedIndexCol);
                    },
                    divGet: self.indexColDivGet
                };
            })(this);
            this.pseudoColFun = (function (self) {
                /**
                 * 序号列渲染
                 * @param {number} start
                 * @param {number} len
                 * @param {boolean} refresh
                 *
                 */
                function render(start, len, refresh) {
                    var offset = start, colType = 'pseudo';
                    self.pseudoCol.confList.forEach(function (item) {
                        var childNode = item.render;
                        if (refresh) {
                            item.col.innerHTML = '';
                            offset = 0;
                        }
                        var tmpDoc = self.createSysCol({
                            Container: item.col,
                            offset: offset,
                            len: len,
                            start: start,
                            colType: colType,
                            childNode: childNode
                        });
                        item.col.appendChild(tmpDoc);
                    });
                    resize();
                }
                /*function render(start: number, len: number, refresh: boolean) {
                    let offset = start, colType = 'index';
                    if(refresh) {
                        self.indexCol.col.innerHTML = '';
                        offset = 0;
                    }
                    let childNode = self.conf.indexCol === 'select' ? () => {
                        let checkbox = CheckBox.initCom(self.ssid);
                        checkbox.classList.add('circle');
                        d.off(d.query('.check-span', checkbox));
                        return checkbox;
                    } : null;
        
                    let tmpDoc = self.createSysCol({
                        Container: <HTMLDivElement>self.indexCol.col,
                        offset,
                        len,
                        colType,
                        childNode
                    });
        
                    self.indexCol.col.appendChild(tmpDoc);
                }*/
                function width() {
                    var indexWidth = 0, pseudoWidth = 0, tableLeft;
                    if (self.indexCol.show && self.indexCol.col) {
                        indexWidth = self.indexCol.col.offsetWidth;
                    }
                    if (self.pseudoCol.show && self.pseudoCol.Container) {
                        pseudoWidth = self.pseudoCol.Container.offsetWidth;
                    }
                    tableLeft = indexWidth + pseudoWidth;
                    return {
                        indexWidth: indexWidth,
                        pseudoWidth: pseudoWidth,
                        tableLeft: tableLeft
                    };
                }
                function resize() {
                    var size = width();
                    self.tableContainer.style.left = size.tableLeft === 0 ? '' : size.tableLeft + "px";
                    self.tableContainer.style.width = size.tableLeft === 0 ? '' : "calc(100% - " + size.tableLeft + "px)";
                    self.pseudoCol.Container ? self.pseudoCol.Container.style.left = size.indexWidth + "px" : 0;
                    if (self.lockRow.fixedTable && self.lockRow.Container) {
                        var pseudoCol = d.query('.pseudoContainer', self.lockRow.Container);
                        if (pseudoCol) {
                            pseudoCol.style.left = size.indexWidth + "px";
                        }
                    }
                    if (self.lockRow.Container) {
                        self.lockRow.Container.style.width = (self.tableContainer.offsetWidth - size.tableLeft) + 'px';
                    }
                }
                function destroy() {
                    d.remove(self.pseudoCol.fixedCol);
                    self.pseudoCol.fixedCol = null;
                }
                return {
                    init: function (config) {
                        var conf = self.conf;
                        !config && (config = conf.pseudoCol);
                        config.width || (config.width = self.pseudoCol.width);
                        config.index = self.pseudoCol.confList.length;
                        self.pseudoCol.confList.push(config);
                        if (!self.pseudoCol.Container) {
                            self.pseudoCol.Container = d.create("<div class=\"pseudoContainer\"></div>");
                            self.tableWrapper.appendChild(self.pseudoCol.Container);
                            self.tableWrapper.classList.add('hasPseudoCol');
                            d.on(self.tableWrapper, self.mousedownName, 'div.pseudoCol-item', function (event) {
                                var e = self.getEvent(event), pseudoIndex = parseInt(d.closest(e.target, '.pseudoCol').dataset.pseudo), clickHandle = self.pseudoCol.confList[pseudoIndex].click;
                                clickHandle && clickHandle(this.dataset.index, event);
                            });
                            // self.on('pseudoColPage', function (e:CustomEvent) {
                            //     let start = (self.currentPage -1 ) * self.conf.length;
                            //     render(start, start + e.detail.len, !self.conf.appendPage);
                            // });
                        }
                        config.col = d.create("<div class=\"pseudoCol\" data-pseudo=\"" + config.index + "\"></div>");
                        config.col.style.width = config.width + 'px';
                        self.pseudoCol.Container.appendChild(config.col);
                        resize();
                        this.fixedRender();
                        self.theadSizeSync();
                    },
                    fixedRender: function () {
                        if (!self.lockRow.fixed) {
                            return;
                        }
                        var len = self.pseudoCol.confList.length;
                        if (!self.pseudoCol.fixedCol) {
                            self.pseudoCol.fixedCol = self.pseudoCol.Container.cloneNode();
                            self.lockRow.fixed.querySelector('.Container').appendChild(self.pseudoCol.fixedCol);
                        }
                        self.pseudoCol.fixedCol.innerHTML = '';
                        for (var i = 0; i < len; i++) {
                            var _indexItem = d.create("<div class=\"pseudoCol\"><div></div></div>");
                            self.pseudoCol.fixedCol.appendChild(_indexItem);
                        }
                    },
                    width: width,
                    render: render,
                    destroy: destroy,
                    resize: resize
                };
            })(this);
            this.menu = (function (self) {
                var menuFun = self.menuConfGet();
                /**
                 * 菜单弹出事件绑定
                 * @param conf - 默认配置
                 * @param clickCb - 显示菜单时的回调函数
                 */
                function initMenu(conf, clickCb) {
                    var identifier = conf.identifier, btns = conf.btns, 
                    //点击菜单按钮后 返回的相应dom数组
                    targets, target;
                    var menuHandler = function (e) {
                        clickCb(this);
                        if ('eventHandle' in conf) {
                            conf.eventHandle(this, e);
                        }
                        targets = conf.targetGet(this);
                        target = (e.target);
                        if (self.popMenuDom.dataset.identifier === identifier) {
                            self.popMenu.show(identifier);
                        }
                        else {
                            self.popMenu.show(identifier, btns, function (btn, menuDom) {
                                if (typeof btn.callback === 'function') {
                                    btn.callback(btn, targets, target);
                                }
                            });
                            self.popMenuDom.dataset.identifier = identifier;
                        }
                    };
                    return {
                        on: function () {
                            d.on(self.tableWrapper, self.menuEventName, conf.targetSelector, menuHandler);
                        },
                        off: function () {
                            d.off(self.tableWrapper, self.menuEventName, conf.targetSelector, menuHandler);
                        }
                    };
                }
                var getFuns = function () {
                    var on = function () {
                    }, off = function () {
                    }, init = function (type, clickCb) {
                        if (clickCb === void 0) { clickCb = function (target) {
                        }; }
                        var menuConf = type === 'row' ? menuFun.rowConfGet() : menuFun.colConfGet();
                        if (!menuConf.btns[0]) {
                            return;
                        }
                        var fun = initMenu(menuConf, clickCb);
                        on = fun.on;
                        off = fun.off;
                        on();
                    };
                    return { on: on, off: off, init: init };
                };
                return {
                    row: getFuns(),
                    col: getFuns(),
                    popInit: function () {
                        var menuListDom = null, currentCallback, currentBtns = [], btnSelector = 'data-action="tableMenuBtn"';
                        function setBtn(btns) {
                            var itemHtml = menuFun.btnHtmlGet(btns);
                            menuListDom.innerHTML = itemHtml;
                        }
                        self.popMenuDom = menuFun.popDomGet();
                        menuListDom = menuFun.listDomGet(self.popMenuDom);
                        menuFun.init();
                        var clickHandler = function () {
                            var index = parseInt(this.dataset.index), currentBtn;
                            var rootArr = [];
                            function getRoot(curDom) {
                                var par = curDom.parentElement.parentElement;
                                if (par.classList.contains('listItem')) {
                                    rootArr.unshift(parseInt(par.dataset.index));
                                    getRoot(par);
                                }
                            }
                            getRoot(this);
                            rootArr.push(index);
                            currentBtn = currentBtns[rootArr[0]];
                            for (var i = 1; i < rootArr.length; i++) {
                                currentBtn.children && (currentBtn = currentBtn.children[rootArr[i]]);
                            }
                            if (!this.classList.contains('disabled')) {
                                currentCallback(currentBtn, this);
                                menuFun.hide();
                            }
                            // self.rowDeselect();
                        };
                        var eventOn = function () {
                            d.on(menuListDom, self.eventClickName, "[" + btnSelector + "]", clickHandler);
                        };
                        var eventOff = function () {
                            d.off(menuListDom, self.eventClickName, "[" + btnSelector + "]", clickHandler);
                        };
                        eventOn();
                        self.popMenu = {
                            show: function (identifier, btns, btnHandle) {
                                if (btns === void 0) { btns = null; }
                                if (btnHandle === void 0) { btnHandle = null; }
                                //跟上次打开不一样的菜单时才需要重新生成菜单
                                if (Array.isArray(btns) && typeof btnHandle === 'function') {
                                    setBtn(btns);
                                    currentCallback = btnHandle;
                                    currentBtns = btns;
                                }
                                // 多选单选按钮控制
                                var isMulti = self.trSelected[1];
                                currentBtns.forEach(function (btn, i) {
                                    if (!btn.multi) {
                                        var btnDom = menuListDom.querySelector("[" + btnSelector + "][data-index=\"" + i + "\"]");
                                        isMulti ? btnDom.classList.add('disabled') : btnDom.classList.remove('disabled');
                                    }
                                });
                                menuFun.show();
                            },
                            hide: function () {
                                menuFun.hide();
                            }
                        };
                    }
                };
            }(this));
            this.noData = (function () {
                var noDataEl = null;
                var isShow = function () {
                    if (_this.table.tBodies.item(0).firstElementChild === null) {
                        if (!noDataEl) {
                            noDataEl = createNoDataEl();
                            d.after(_this.table, noDataEl);
                            isShowIndexCol(false);
                        }
                    }
                    else {
                        if (noDataEl) {
                            d.remove(noDataEl);
                            noDataEl = null;
                            isShowIndexCol(true);
                        }
                    }
                };
                var isShowIndexCol = function (flag) {
                    if (!_this.pseudoCol.show) {
                        return;
                    }
                    if (_this.indexCol.col && _this.pseudoCol.Container) {
                        _this.pseudoCol.Container.classList[flag ? 'remove' : 'add']('hide');
                        _this.tableWrapper.classList[flag ? 'add' : 'remove']('hasPseudoCol');
                    }
                    // if (this.pseudoCol.Container) {
                    //     // this.pseudoCol.show = flag;
                    //     this.pseudoCol.Container.classList[flag ? 'remove' : 'add']('hide');
                    //     this.tableWrapper.classList[flag ? 'add' : 'remove']('hasPseudoCol');
                    // }
                };
                function createNoDataEl() {
                    return d.create('<div class="nodata no-padding"><span class="iconfont icon-gongyongwushuju"></span></div>');
                }
                return { isShow: isShow };
            })();
            this.colGroup = (function () {
                var colGroupFilter = {}, // 已选分组过滤条件
                colGroupArr = {}, // 用于缓存列分组下拉菜单信息
                colGroupData = []; // 用于备份表格原始数据
                /**
                 * 创建列分组功能行
                 * @param data
                 * @return {HTMLTableRowElement}
                 */
                var rowCreate = function (data) {
                    var trDom = document.createElement('tr');
                    trDom.classList.add('colGroup');
                    _this.conf.cols.forEach(function (col) {
                        var name = col.name;
                        if (!_this.colHide.ready || _this.colHide.status[col.name]) { // 隐藏列
                            if (!(name in data)) {
                                data[name] = null;
                            }
                            var selectArr = data[name], tdDom = document.createElement('td'), tdContent = groupCreate(name, selectArr);
                            //td默认属性
                            tdDom.dataset.col = name;
                            tdDom.classList.add('td-select', _this.cellClass(name));
                            tdContent && tdDom.appendChild(tdContent);
                            trDom.appendChild(tdDom);
                        }
                    });
                    return trDom;
                };
                /**
                 * 创建列分组select单元格
                 * @param name   列name
                 * @param arr    下拉选项
                 */
                var groupCreate = function (name, arr) {
                    if (!Array.isArray(arr)) {
                        return;
                    }
                    var selectHTML = document.createElement('select');
                    arr.sort(function (a, b) {
                        return b - a;
                    });
                    // tdContent.classList.add('td-content', 'td-select', this.cellClass(name));
                    selectHTML.appendChild(d.create('<option></option>'));
                    arr.forEach(function (item) {
                        if (item != '') {
                            var option = document.createElement('option'), text = document.createTextNode(item);
                            option.appendChild(text);
                            option.setAttribute('value', item);
                            selectHTML.appendChild(option);
                        }
                    });
                    selectHTML.setAttribute('data-col', name);
                    // tdContent.appendChild(selectHTML);
                    return selectHTML;
                };
                var on = function () {
                    var selectList = d.queryAll('.colGroup select', _this.tableWrapper), self = _this;
                    function changeHandler() {
                        var col = this.dataset.col, result = [];
                        colGroupFilter[col] = this.value;
                        colGroupData.forEach(function (item) {
                            var check = true;
                            for (var filter in colGroupFilter) {
                                if (item[filter] && colGroupFilter[filter] != '' && item[filter].toString() != colGroupFilter[filter]) {
                                    check = false;
                                }
                            }
                            check && (result.push(tools.obj.merge({}, item)));
                        });
                        var length = result.length;
                        self.tableData = result;
                        self.indexColFun.render(0, length, true);
                        self.pseudoColFun.render(0, length, true);
                        self.tbodyRender(self.tableData, true);
                    }
                    selectList.forEach(function (sel) {
                        var colName = sel.dataset.col;
                        sel.selectedIndex = -1;
                        d.off(sel, 'change', changeHandler);
                        d.on(sel, 'change', changeHandler);
                        // 设置默认选中
                        if (colGroupFilter && colName in colGroupFilter) {
                            tools.selVal(sel, colGroupFilter[colName]);
                        }
                    });
                };
                var clear = function () {
                    colGroupData = [];
                    colGroupFilter = {};
                    colGroupArr = {};
                };
                var dataCreate = function (dataArr) {
                    if (!colGroupData[0]) {
                        dataArr.forEach(function (data) {
                            // 保存数据，用于列分组
                            for (var s in data) {
                                colGroupArr[s] = colGroupArr[s] || [];
                                if (!~colGroupArr[s].indexOf(data[s])) {
                                    colGroupArr[s].push(data[s]);
                                }
                            }
                        });
                        colGroupData = dataArr;
                    }
                };
                return {
                    on: on,
                    clear: clear,
                    rowCreate: function (dataArr) {
                        dataCreate(dataArr);
                        return rowCreate(colGroupArr);
                    }
                };
            })();
            // 设置指定列排序
            // private toggleColSort(col:string, sort:string) {
            //     let self = this, newSort, oldSort,
            //         tableTh = self.table.querySelector(`th[data-col="${col}"]`); // 主表
            //
            //     if (sort === 'desc') {
            //         newSort = 'sort-desc';
            //         oldSort = 'sort-asc';
            //     } else {
            //         newSort = 'sort-asc';
            //         oldSort = 'sort-desc';
            //     }
            //
            //     tableTh.classList.remove(oldSort);
            //     tableTh.classList.add(newSort);
            //     if(self.conf.lockColNum>0) { // 锁列
            //         let lockTh = <any>self.lockCol.table.querySelector(`th[data-col="${col}"]`);
            //         if(lockTh) {
            //             lockTh.classList.remove(oldSort);
            //             lockTh.classList.add(newSort);
            //         }
            //     }
            //     if(self.conf.lockRow) { // 锁行
            //         let lockRowTh = <any>self.lockRow.table.querySelector(`th[data-col="${col}"]`);
            //         lockRowTh.classList.remove(oldSort);
            //         lockRowTh.classList.add(newSort);
            //     }
            //     if(self.conf.lockColNum>0 && self.conf.lockRow) { // 锁行固定角
            //         let lockFixedTh = <any>self.lockRow.fixedTable.querySelector(`th[data-col="${col}"]`);
            //         if(lockFixedTh) {
            //             lockFixedTh.classList.remove(oldSort);
            //             lockFixedTh.classList.add(newSort);
            //         }
            //     }
            // }
            //
            // private clearSort() {
            //     let self = this,
            //         tableSort = self.table.querySelectorAll('.sort-desc,.sort-asc');
            //
            //     Array.prototype.forEach.call(tableSort, function (th, index) {
            //         th.classList.remove('sort-desc', 'sort-asc');
            //     });
            //     if(self.conf.lockColNum>0) {
            //         let lockColSort = self.lockCol.table.querySelectorAll('.sort-desc,.sort-asc');
            //         Array.prototype.forEach.call(lockColSort, function (th, index) {
            //             th.classList.remove('sort-desc', 'sort-asc');
            //         });
            //     }
            //     if(self.conf.lockRow) {
            //         let lockRowSort = self.lockRow.table.querySelectorAll('.sort-desc,.sort-asc');
            //         Array.prototype.forEach.call(lockRowSort, function (th, index) {
            //             th.classList.remove('sort-desc', 'sort-asc');
            //         });
            //     }
            //
            //     if(self.conf.lockColNum>0 && self.conf.lockRow) {
            //         let lockFixedSort = self.lockRow.fixedTable.querySelectorAll('.sort-desc,.sort-asc');
            //         Array.prototype.forEach.call(lockFixedSort, function (th, index) {
            //             th.classList.remove('sort-desc', 'sort-asc');
            //         });
            //     }
            //
            // }
            /**
             * 列排序
             * @type {(col:string, tr:HTMLElement)=>any}
             */
            this.colSort = (function () {
                var sortList = [], sortDic = {};
                function getVal(value) {
                    var vType = typeof value;
                    return (value || value === 0) ? value : (vType === 'number' ? -Infinity : '');
                }
                // 递归排序
                function getFlag(a, b, index) {
                    if (index === void 0) { index = 0; }
                    var flag;
                    var v1 = getVal(a[sortList[index]]);
                    var v2 = getVal(b[sortList[index]]);
                    v1 = v1 === '--' ? Number.NEGATIVE_INFINITY : v1;
                    v2 = v2 === '--' ? Number.NEGATIVE_INFINITY : v2;
                    if (v1 > v2) {
                        flag = 1;
                    }
                    else if (v1 === v2) {
                        flag = 0;
                    }
                    else {
                        flag = -1;
                    }
                    if (flag === 0 && index < sortList.length - 1) {
                        return getFlag(a, b, ++index);
                    }
                    else {
                        return sortDic[sortList[index]] === 'desc' ? -flag : flag;
                    }
                }
                var toggleColSort = function (col, sort) {
                    var self = _this, newSort, oldSort, tableTh = self.table.querySelector("th[data-col=\"" + col + "\"]"); // 主表
                    if (sort === 'desc') {
                        newSort = 'sort-desc';
                        oldSort = 'sort-asc';
                    }
                    else {
                        newSort = 'sort-asc';
                        oldSort = 'sort-desc';
                    }
                    tableTh.classList.remove(oldSort);
                    tableTh.classList.add(newSort);
                    if (self.conf.lockColNum > 0) { // 锁列
                        var lockTh = self.lockCol.table.querySelector("th[data-col=\"" + col + "\"]");
                        if (lockTh) {
                            lockTh.classList.remove(oldSort);
                            lockTh.classList.add(newSort);
                        }
                    }
                    if (self.conf.lockRow) { // 锁行
                        var lockRowTh = self.lockRow.table.querySelector("th[data-col=\"" + col + "\"]");
                        lockRowTh.classList.remove(oldSort);
                        lockRowTh.classList.add(newSort);
                    }
                    if (!tools.keysVal(_this.conf, 'multi', 'enabled')) {
                        if (self.conf.lockColNum > 0 && self.conf.lockRow) { // 锁行固定角
                            var lockFixedTh = self.lockRow.fixedTable.querySelector("th[data-col=\"" + col + "\"]");
                            if (lockFixedTh) {
                                lockFixedTh.classList.remove(oldSort);
                                lockFixedTh.classList.add(newSort);
                            }
                        }
                    }
                };
                var clearSort = function () {
                    var classNames = '.sort-desc,.sort-asc';
                    d.queryAll(classNames, _this.table).forEach(function (th) {
                        th.classList.remove('sort-desc', 'sort-asc');
                    });
                    if (_this.conf.lockColNum > 0) {
                        d.queryAll(classNames, _this.lockCol.table).forEach(function (th) {
                            th.classList.remove('sort-desc', 'sort-asc');
                        });
                    }
                    if (_this.conf.lockRow) {
                        d.queryAll(classNames, _this.lockRow.table).forEach(function (th) {
                            th.classList.remove('sort-desc', 'sort-asc');
                        });
                    }
                    if (!tools.keysVal(_this.conf, 'multi', 'enabled')) {
                        if (_this.conf.lockColNum > 0 && _this.conf.lockRow && _this.lockRow.fixedTable) {
                            d.queryAll(classNames, _this.lockRow.fixedTable).forEach(function (th) {
                                th.classList.remove('sort-desc', 'sort-asc');
                            });
                        }
                    }
                };
                // isMulti
                var sort = function (isMulti, col) {
                    var _a;
                    var self = _this, sort = sortDic[col];
                    if (!self.tableData[0]) {
                        return;
                    }
                    if (sort) {
                        sort = sort === 'desc' ? 'asc' : 'desc';
                    }
                    else {
                        sort = 'desc';
                    }
                    if (isMulti) {
                        sortDic[col] = sort;
                        if (!~sortList.indexOf(col)) {
                            sortList.push(col);
                        }
                    }
                    else {
                        clearSort();
                        sortDic = (_a = {},
                            _a[col] = sort,
                            _a);
                        sortList = [col];
                    }
                    toggleColSort(col, sort);
                    if (self.conf.sort === 1) {
                        self.tableData.sort(function (a, b) {
                            return getFlag(a, b);
                        });
                        self.render(_this.startIndex, _this.tbodyLength + _this.startIndex, true);
                        // self.tbodyRender(self.tableData, true);
                    }
                };
                return { sort: sort };
            })();
            this.theadSort = (function (self) {
                var sortHandle = null;
                function eventBind() {
                    if (sortHandle === null) {
                        sortHandle = function (e) {
                            if (!this.classList.contains('disabled') && !self.colResize.dragging && !self.moving) {
                                self.colSort.sort(e.ctrlKey || e.shiftKey, this.dataset.col);
                            }
                        };
                    }
                    d.on(self.tableWrapper, self.eventClickName, 'th', sortHandle);
                }
                var on = function () {
                    d.queryAll('tr th', self.table.tHead).forEach(function (th) {
                        th.classList.add('sort');
                    });
                    eventBind();
                    on = eventBind;
                };
                return {
                    on: on,
                    off: function () {
                        if (sortHandle) {
                            d.off(self.tableWrapper, self.eventClickName, 'th', sortHandle);
                            sortHandle = null;
                        }
                    }
                };
            }(this));
            this.lock = (function (self) {
                /**
                 * 初始化锁列
                 */
                var table = null, lockTable = null, lockTableContain = null;
                function init() {
                    table = self.table;
                    lockTable = table.cloneNode();
                    var lockThead = table.tHead.cloneNode(true), lockTheadTr = lockThead.querySelector('tr'), lockThs = d.queryAll('th', lockTheadTr), tbodyTr = d.queryAll('tr', table.tBodies.item(0)), lockThsLen = lockThs.length, lockColNum = self.conf.lockColNum;
                    lockTable.classList.add('mobileTableLock', 'hide');
                    lockTable.removeAttribute('id');
                    for (var i = 0; i < lockThsLen; i++) {
                        if (i >= lockColNum) {
                            d.remove(lockThs[i]);
                        }
                    }
                    if (lockTable.tHead) {
                        // android 4.4.2 bug  - cloneNode复制了子元素
                        lockTable.replaceChild(lockThead, lockTable.tHead);
                    }
                    else {
                        lockTable.appendChild(lockThead);
                    }
                    lockTable.appendChild((function () {
                        var tbody = table.tBodies.item(0).cloneNode();
                        for (var i = 0, tr = null; tr = tbodyTr[i]; i++) {
                            tbody.appendChild(tr.cloneNode());
                        }
                        return tbody;
                    })());
                    if (lockTableContain === null) {
                        lockTableContain = d.create('<div class="mobileTableLeftLock"></div>');
                        self.tableContainer.insertBefore(lockTableContain, self.tableContainer.firstElementChild);
                    }
                    else {
                        lockTableContain.innerHTML = '';
                    }
                    lockTableContain.appendChild(lockTable);
                    self.lockCol.table = lockTable;
                    self.lockCol.Container = lockTableContain;
                    table.dataset['lockNum'] = self.conf.lockColNum.toString();
                }
                /**
                 * 加载所列表中数据
                 * @param rows 正常表中tr，包含所有的 td
                 * @param isRefresh 是刷新还是加载
                 * @private
                 */
                function render(rows, isRefresh) {
                    // 创建lock列DOM前, 显示原来的列，隐藏lock
                    if (!table || !lockTable) {
                        return;
                    }
                    table.classList.remove('hideLock');
                    lockTable.classList.add('hide');
                    if (isRefresh) {
                        lockTable.tBodies.item(0).innerHTML = '';
                    }
                    rows.forEach(function (tr) {
                        lockTable.tBodies.item(0).appendChild(rowCreate(tr));
                    });
                    //创建完lock列DOM, 显示lock，隐藏原来的列
                    lockTable && lockTable.classList.remove('hide');
                    table.classList.add('hideLock');
                }
                /**
                 * 生成锁列的行
                 * @param tr
                 * @return {HTMLTableRowElement}
                 */
                function rowCreate(tr) {
                    var newTr = tr.cloneNode(true), tds = d.queryAll('td', newTr);
                    tds.forEach(function (td, index) {
                        if (index >= self.conf.lockColNum) {
                            d.remove(td);
                        }
                    });
                    return newTr;
                }
                function colLock(index) {
                    var newIndexCols = self.colInsertTo(index, self.conf.lockColNum, true);
                    // console.log(newIndexCols);
                    self.colAdd(self.conf.lockColNum, newIndexCols, lockTable);
                    self.conf.lockColNum++;
                    self.theadSizeSync();
                    self.theadSizeCache(index);
                }
                function colUnlock(index) {
                    //把此列移动到锁列的最后一列
                    self.colInsertTo(index, self.conf.lockColNum - 1, true);
                    //删除取消那列锁列
                    self.colDel(index, lockTable);
                    if (self.lockRow.fixedTable) {
                        self.colDel(index, self.lockRow.fixedTable);
                    }
                    self.theadSizeSync();
                    self.theadSizeCache(index);
                    self.conf.lockColNum--;
                }
                function colToggle(col) {
                    var index = -1, toggleFlag = -1;
                    if (typeof col === 'string') {
                        index = self.colName2index(col);
                    }
                    else {
                        index = col;
                    }
                    if (index === -1) {
                        return;
                    }
                    if (lockTable === null) {
                        init();
                        table.classList.add('hideLock');
                        lockTable.classList.remove('hide');
                    }
                    if (index > self.conf.lockColNum - 1) {
                        colLock(index);
                        toggleFlag = 1;
                    }
                    else {
                        colUnlock(index);
                        toggleFlag = 0;
                    }
                    table.dataset['lockNum'] = self.conf.lockColNum.toString();
                    return toggleFlag;
                }
                /**
                 * 获取锁列的行
                 * @param tr
                 * @return {HTMLTableRowElement}
                 */
                function rowGet(tr) {
                    if (lockTable) {
                        return lockTable.querySelector("tr[data-index=\"" + tr.dataset.index + "\"]");
                    }
                    return null;
                }
                function hide() {
                    lockTableContain.classList.add('hide');
                    table.dataset.lockNum = '0';
                }
                function show() {
                    lockTableContain.classList.remove('hide');
                    table.dataset.lockNum = self.conf.lockColNum + '';
                }
                function destroy() {
                    d.remove(lockTableContain);
                    lockTable = null;
                    lockTableContain = null;
                    table.dataset.lockNum = '0';
                    //window.removeEventListener('resize', resizeHandle);
                }
                return {
                    init: init,
                    render: render,
                    rowCreate: rowCreate,
                    rowGet: rowGet,
                    hide: hide,
                    show: show,
                    destroy: destroy,
                    colToggle: colToggle,
                    colLock: colLock,
                    colUnlock: colUnlock // 动态解锁列
                };
            }(this));
            // public rowsDelete(indexes: number[]){
            //     indexes.forEach(index => {
            //         this.tableData.splice(index, 1);
            //
            //
            //     });
            // }
            /**
             * 创建列分组功能行
             * @param data
             * @return {HTMLTableRowElement}
             */
            // protected colGroupCreate(data: any): HTMLTableRowElement {
            //     let self = this;
            //
            //     let trDom = document.createElement('tr');
            //     trDom.classList.add('colGroup');
            //
            //     self.conf.cols.forEach(function (col,) {
            //
            //         if (!self.colHide.ready || self.colHide.status[col.name]) { // 隐藏列
            //             if (!(col.name in data)) {
            //                 data[col.name] = null;
            //             }
            //
            //             let td = {},
            //                 selectArr = data[col.name];
            //             //td默认属性
            //             td['data-col'] = col.name;
            //
            //             let tdDom = document.createElement('td'),
            //                 tdContent = self.groutCreate(col.name, selectArr);
            //
            //             for (let attr in td) {
            //                 if (!td.hasOwnProperty(attr)) {
            //                     continue;
            //                 }
            //                 tdDom.setAttribute(attr, td[attr]);
            //             }
            //             tdDom.appendChild(tdContent);
            //             trDom.appendChild(tdDom);
            //         }
            //
            //     });
            //
            //     return trDom;
            // }
            // 列隐藏
            this.col = (function (self) {
                self.colHide.ready = false;
                function show(col) {
                    _initColumn();
                    if (_getStatus(col) === false) {
                        _setStatus(col, true);
                    }
                }
                function hide(col) {
                    _initColumn();
                    if (_getStatus(col) === true) {
                        _setStatus(col, false);
                    }
                }
                function _getStatus(col) {
                    if (col in self.colHide.status) {
                        return self.colHide.status[col];
                    }
                    else {
                        return false;
                    }
                }
                function _setStatus(col, status) {
                    _colVisible(col, status);
                    self.colHide.status[col] = status;
                }
                // 获取隐藏后的index
                function getHideIndex(col) {
                    _initColumn();
                    var index = 0, cols = self.conf.cols;
                    for (var i = 0, l = cols.length; i < l; i++) {
                        var colName = cols[i].name;
                        if (col === colName) {
                            return index;
                        }
                        if (self.colHide.status[colName]) {
                            index++;
                        }
                    }
                    return -1;
                }
                // 获取未隐藏的conf.cols真实index
                function getIndex(name) {
                    // 根据col.name找到index
                    for (var i = 0, col = void 0; col = self.conf.cols[i]; i++) {
                        if (col.name === name) {
                            return i;
                        }
                    }
                    return -1;
                }
                function _initColumn() {
                    if (!self.colHide.ready) {
                        self.conf.cols.forEach(function (c) {
                            self.colHide.status[c.name] = true;
                        });
                        self.colHide.ready = true;
                    }
                }
                /*function clean() {
                    self.colHide.ready = false;
                    self.colHide.status = {};
                    _initColumn();
                }*/
                function _colVisible(col, visible) {
                    var index = getIndex(col), hideIndex = getHideIndex(col), tableCol;
                    if (visible) {
                        // 显示
                        createCol(index);
                    }
                    else {
                        // 隐藏
                        self.colDel(hideIndex);
                        if (self.conf.lockRow) {
                            self.colDel(hideIndex, self.lockRow.table);
                        }
                    }
                    tableCol = self.colGet(0);
                    if (tableCol > 0) {
                        self.resize(true);
                    }
                    if (self.conf.lockColNum > 0) {
                        if (hideIndex < self.conf.lockColNum) {
                            if (tableCol.length !== 0) {
                                var lockTableLen = self.lockCol.table.querySelectorAll('th').length;
                                if (lockTableLen === 0) {
                                    for (var i = 0; i < self.conf.lockColNum; i++) {
                                        var colDom = _getColDom(index);
                                        _colAdd(hideIndex, colDom, self.lockCol.table);
                                        if (self.lockRow.fixedTable) {
                                            _colAdd(hideIndex, colDom, self.lockRow.fixedTable);
                                        }
                                    }
                                }
                                else {
                                    // 锁列重新渲染
                                    self.lockColReplace(hideIndex, self.colGet(hideIndex));
                                    return;
                                }
                            }
                            else {
                                self.colDel(hideIndex, self.lockCol.table);
                                if (self.lockRow.fixedTable) {
                                    self.colDel(hideIndex, self.lockRow.fixedTable);
                                }
                                return;
                            }
                        }
                    }
                    self.theadSizeSync();
                }
                // 读取列显/隐状态
                /*function getHide() {
                    return self.colHide.status;
                }*/
                // 通过隐藏列index 获取对应this.conf.cols中的index
                function hideIndex2Index(hideIndex) {
                    var index = 0, cols = self.conf.cols;
                    for (var i = 0, l = cols.length; i < l; i++) {
                        if (self.colHide.status[cols[i].name]) {
                            if (hideIndex === index) {
                                return i;
                            }
                            index++;
                        }
                    }
                }
                // 获取index对应的隐藏列index位置，用于隐藏列插入
                function _index2HideIndex(index) {
                    var hideIndex = 0, cols = self.conf.cols;
                    for (var i = 0; i <= index; i++) {
                        if (self.colHide.status[cols[i].name]) {
                            hideIndex++;
                        }
                    }
                    return hideIndex;
                }
                function _getColDom(index) {
                    var colData = self.conf.cols[index], colDom = [];
                    colDom.push(self.col.theadCell(colData));
                    self.tableData.forEach(function (item, i) {
                        colDom.push(tbodyCell(item, colData, i));
                    });
                    return colDom;
                }
                // 创建一列 (创建隐藏列)
                function createCol(index) {
                    var colDom = _getColDom(index), hideIndex = _index2HideIndex(index);
                    //console.log(hideIndex);
                    _colAdd(hideIndex, colDom);
                    if (self.conf.lockRow) {
                        _colAdd(hideIndex, colDom, self.lockRow.table);
                    }
                }
                function _colAdd(index, newCol, table) {
                    if (table === void 0) { table = self.table; }
                    var toInsert = self.colGet(index === 0 ? 0 : index, table);
                    if (toInsert[0]) {
                        toInsert.forEach(function (insert, i) {
                            d.before(insert, newCol[i].cloneNode(true));
                            // insert.parentNode.insertBefore(newCol[i].cloneNode(true), insert);
                        });
                    }
                    else {
                        d.queryAll('tr', table).forEach(function (tr, i) {
                            tr.appendChild(newCol[i].cloneNode(true));
                        });
                    }
                }
                function tbodyCell(item, col, i) {
                    var textFormat = typeof self.conf.textFormat === 'function' ? self.conf.textFormat : null, td = {}, text = textFormat ? textFormat(item, col, i) : item[col.name], tdDom = document.createElement('td');
                    //td默认属性
                    td['data-col'] = col.name;
                    td['class'] = td['class'] ? td['class'] + " " + self.cellClass(col.name) : self.cellClass(col.name);
                    for (var attr in td) {
                        if (!td.hasOwnProperty(attr)) {
                            continue;
                        }
                        tdDom.setAttribute(attr, td[attr]);
                    }
                    tdDom.innerHTML = text;
                    return tdDom;
                }
                /**
                 * 创建td-content单元格dom
                 * @param name   列name
                 * @param text   单元格内容
                 * @param addClass
                 */
                function _cellCreate(name, text, addClass) {
                    if (addClass === void 0) { addClass = true; }
                    var tdContent = document.createElement('div');
                    if (addClass) {
                        tdContent.classList.add('td-content', self.cellClass(name));
                    }
                    tdContent.innerHTML = tools.str.toEmpty(text);
                    return tdContent;
                }
                function theadCell(item) {
                    var className = self.cellClass(item.name), attr = {
                        'data-col': item.name
                    };
                    if (self.conf.sort) {
                        attr['class'] = 'sort';
                    }
                    if (item.colspan) {
                        attr.colspan = item.colspan;
                        delete item.width;
                        delete item.name;
                    }
                    if (item.rowspan) {
                        attr.rowspan = item.rowspan;
                    }
                    if (!item.name) {
                        item.name = (new Date().getTime()).toString();
                    }
                    if (!item.colspan && item.width && self.conf.colResize) {
                        self.styleList[className] = item.width;
                    }
                    return d.create("<th" + tools.obj.toAttr(attr) + ">" + _cellCreate(item.name, item.title, !item.colspan).outerHTML + "</th>", 'tr');
                }
                var titleSet = function (name, newTitle) {
                    d.queryAll('thead th[data-col="' + name + '"]').forEach(function (th) {
                        th.querySelector('div').innerText = newTitle;
                    });
                    for (var i = 0, col = void 0; col = self.conf.cols[i]; i++) {
                        if (col.name === name) {
                            col.title = newTitle;
                            break;
                        }
                    }
                    self.resize(true);
                };
                return {
                    show: show,
                    hide: hide,
                    //getHide,
                    getIndex: getIndex,
                    getHideIndex: getHideIndex,
                    hideIndex2Index: hideIndex2Index,
                    theadCell: theadCell,
                    titleSet: titleSet
                };
            }(this));
            /**
             * 设置表格临时样式
             * @private
             * @author yrh
             */
            this.tableStyle = ((function (self) {
                var styleDom, styleName = 'tableTempStyle';
                function _addDom() {
                    if (!styleDom) {
                        styleDom = document.createElement('style');
                        styleDom.setAttribute('type', 'text/css');
                        self.tableContainer.classList.add(styleName + "-" + self.ssid);
                        self.tableContainer.appendChild(styleDom);
                    }
                }
                function add(styleArr) {
                    var prefix = "." + styleName + "-" + self.ssid;
                    _addDom();
                    styleArr.forEach(function (item, i) {
                        styleArr[i] = prefix + " " + item;
                        styleArr[i] = styleArr[i].replace(/,/g, "," + prefix + " ");
                    });
                    styleDom.innerHTML = styleArr.join('');
                }
                function del() {
                    d.remove(styleDom);
                    styleDom = null;
                }
                return {
                    add: add,
                    del: del
                };
            })(this));
            /**
             * 开启表头拖拽宽度
             * @private
             * @author yrh
             */
            this.colResizeFun = (function (self) {
                function winCb() {
                    // 清除列宽状态
                    self.resize(true);
                }
                /**
                 * 表格尺寸调整
                 * @private
                 * @author yrh
                 * @param width 列调整后的宽
                 * @param columnEl  待调整的列对象
                 * @param deltaLeft 偏移量
                 */
                function theadSizeRender(width, columnEl, deltaLeft) {
                    var changeCellWidth = 0, siblingCol, siblingNewWidth = 0, colName = self.cellClass(columnEl.dataset.col);
                    for (var item in self.styleList) {
                        changeCellWidth += self.styleList[item] + 1;
                    }
                    // 防止表格破裂
                    if (self.table.offsetWidth === self.tableContainer.offsetWidth) {
                        // 单元格宽度小于表格宽度，调整相邻单元格宽度
                        var index = self.colName2index(columnEl.dataset.col), tableTh = self.table.tHead.querySelector("tr > *:nth-child(" + (index + 1) + ")"), sibling = tableTh.nextElementSibling, selfWidth = self.styleList[colName], siblingWidth = void 0;
                        tableTh.style.width = width + 'px';
                        if (tableTh.offsetWidth > width) {
                            width = selfWidth;
                        }
                        tableTh.style.width = '';
                        if (sibling) {
                            var siblingName = void 0, siblingTH = self.table.tHead.querySelector("tr th[data-col=\"" + sibling.dataset.col + "\"]");
                            siblingCol = sibling.dataset.col;
                            siblingName = self.cellClass(siblingCol);
                            siblingWidth = self.styleList[siblingName];
                            siblingNewWidth = siblingWidth + (selfWidth - width);
                            siblingTH.style.width = siblingNewWidth + 'px';
                            if (siblingTH.offsetWidth > siblingNewWidth + 1) {
                                siblingNewWidth = siblingWidth;
                            }
                            siblingTH.style.width = '';
                            self.styleList[siblingName] = siblingNewWidth;
                        }
                    }
                    self.styleList[colName] = width;
                    // 更新配置，用于保存宽度
                    for (var i = 0, l = self.conf.cols.length; i < l; i++) {
                        if (self.conf.cols[i]['name'] === columnEl.dataset.col) {
                            self.conf.cols[i]['width'] = width;
                            //break;
                        }
                        if (siblingCol && self.conf.cols[i]['name'] === siblingCol) {
                            self.conf.cols[i]['width'] = siblingNewWidth;
                        }
                    }
                    //self.updateStyle();
                }
                function mousemoveHandle(event) {
                    var target = event.target, columnRect;
                    if (!self.styleListReady) {
                        self.initStyleList();
                    }
                    d.queryAll('th', self.table.tHead).forEach(function (th) {
                        self.styleList[self.cellClass(th.dataset.name)] = th.offsetWidth;
                    });
                    while (target && target.tagName !== 'TH') {
                        target = target.parentNode;
                    }
                    columnRect = target.getBoundingClientRect();
                    if (columnRect.width > 12 && columnRect.right - event.pageX < 15 && !self.colResize.dragging) {
                        target.style.cursor = 'col-resize';
                        self.colResize.column = target;
                        self.colResize.column = target;
                    }
                    else if (!self.colResize.dragging) {
                        target.style.cursor = '';
                        self.colResize.column = null;
                    }
                }
                function mousedownHandle(event) {
                    var columnEl, columnRect, dragState, scrollLeft = self.tableMiddle.scrollLeft;
                    var tableLeft = self.table.getBoundingClientRect().left + scrollLeft;
                    // 拖动宽度改变
                    var mouseMove = function (event) {
                        var deltaLeft = event.clientX - dragState.startMouseLeft;
                        var proxyLeft = dragState.startLeft - dragState.tableLeft + deltaLeft;
                        var minLeft = columnRect.left - tableLeft + self.conf.cellWidth;
                        var left = Math.max(minLeft, proxyLeft);
                        var width = left - (columnRect.left - dragState.tableLeft);
                        /* + self.indexCol.width*/
                        self.colResize.resizeProxy.style.left = left + 'px';
                        theadSizeRender(width, columnEl, deltaLeft);
                        self.theadSizeSync();
                    };
                    var mouseUp = function (event) {
                        self.colResize.resizeProxy.style.display = 'none';
                        d.off(document, self.mousemoveName, mouseMove);
                        d.off(document, self.mouseupName, mouseUp);
                        //document.body.style.cursor = '';
                        d.queryAll('th', self.table.tHead).forEach(function (th, i) {
                            th.style.cursor = '';
                        });
                        document.onselectstart = null;
                        document.ondragstart = null;
                        dragState = null;
                        // 晚于排序点击事件执行
                        setTimeout(function () {
                            self.colResize.dragging = false;
                        }, 10);
                    };
                    if (self.colResize.column) {
                        self.colResize.dragging = true;
                        document.onselectstart = function () {
                            return false;
                        };
                        document.ondragstart = function () {
                            return false;
                        };
                        columnEl = self.colResize.column;
                        columnRect = columnEl.getBoundingClientRect();
                        dragState = {
                            startMouseLeft: event.clientX,
                            startLeft: columnRect.right,
                            startColumnLeft: columnRect.left,
                            tableLeft: tableLeft // 表格左偏移
                        };
                        self.colResize.resizeProxy.style.display = 'block';
                        self.colResize.resizeProxy.style.left = (dragState.startLeft - dragState.tableLeft) + 'px';
                        d.on(document, self.mousemoveName, mouseMove);
                        d.on(document, self.mouseupName, mouseUp);
                        // document.addEventListener(self.mousemoveName, mouseMove);
                        // document.addEventListener(self.mouseupName, mouseUp);
                    }
                }
                function colSize() {
                    d.on(self.tableContainer, self.mousedownName, 'th', mousedownHandle);
                    d.on(self.tableContainer, self.mousemoveName, 'th', mousemoveHandle);
                    d.on(window, 'resize', winCb);
                }
                function init() {
                    // 添加辅助线
                    var resizeProxy = document.createElement('div');
                    resizeProxy.classList.add('resize-proxy');
                    self.tableContainer.appendChild(resizeProxy);
                    self.colResize.resizeProxy = resizeProxy;
                    colSize();
                }
                function off() {
                    d.off(window, 'resize', winCb);
                }
                return {
                    init: init, off: off
                };
            })(this);
            /**
             * 锁头
             * @private
             * @author yrh
             */
            this.theadLock = (function (self) {
                /**
                 * 初始化锁头
                 */
                var table = null, lockTable = null, lockThead, lockTbody, scrollReset = false, // 滚动后表头高度是否重置
                conf = null;
                function scrollHandle() {
                    //setTimeout(()=> {
                    if (self.lockRow.Container) {
                        var style = self.lockRow.Container.style, offsetTop = tools.offset.top(self.tableWrapper), containerScrollTop = self.scrollTop() + tools.offset.top(self.conf.Container), scrollTop = containerScrollTop + self.theadHeight + self.conf.lockRowTop, tableBottom = self.tableWrapper.offsetHeight + offsetTop;
                        if (containerScrollTop > offsetTop) {
                            style.position = 'fixed';
                            style.width = self.tableContainer.offsetWidth + 'px';
                            if (!self.conf.Container) {
                                // 当表格嵌套在dom层中，不设置top，默认相对父窗口
                                style.top = conf.lockRowTop + 'px';
                            }
                            else {
                                if (conf.lockRowTop > 0) {
                                    style.top = conf.lockRowTop + 'px';
                                }
                                else {
                                    style.top = 'initial';
                                }
                            }
                            if (!self.indexCol.col && !self.pseudoCol.Container) {
                                style.overflow = 'hidden';
                            }
                            style.left = tools.offset.left(self.table) + 'px';
                        }
                        else {
                            style.position = 'absolute';
                            style.top = '';
                            style.left = '0px';
                        }
                        // 滚动条超过表格，隐藏表头
                        if (scrollTop > tableBottom) {
                            var height = self.theadHeight - (scrollTop - tableBottom);
                            height = height < 0 ? 0 : height;
                            self.lockRow.fixedContainer && (self.lockRow.fixedContainer.style.height = (height + 1) + 'px');
                            self.lockRow.ContainInner.style.height = height + 'px';
                            scrollReset = true;
                        }
                        else if (scrollReset) {
                            self.lockRow.fixedContainer && (self.lockRow.fixedContainer.style.height = (self.theadHeight + 1) + 'px');
                            self.lockRow.ContainInner.style.height = self.theadHeight + 'px';
                            scrollReset = false;
                        }
                    }
                    //}, 200);
                }
                function tableScrollHandle() {
                    self.lockRow.ContainInner.scrollLeft = self.tableMiddle.scrollLeft;
                }
                function init() {
                    table = self.table;
                    conf = self.conf;
                    lockTable = table.cloneNode();
                    lockTable.removeAttribute('id');
                    lockThead = table.tHead.cloneNode(true);
                    lockTbody = table.tBodies.item(0).cloneNode();
                    //lockTable.classList.add('mobileTableRowLock', 'hideLock');
                    lockTable.classList.add('mobileTableRowLock');
                    lockTable.classList.remove('hideLock');
                    if (lockTable.tHead) {
                        // android 4.4.2 bug  - cloneNode复制了子元素
                        lockTable.replaceChild(lockThead, lockTable.tHead);
                    }
                    else {
                        lockTable.appendChild(lockThead);
                    }
                    if (lockTable.tBodies.item(0)) {
                        lockTable.replaceChild(lockTbody, lockTable.tBodies.item(0));
                    }
                    else {
                        lockTable.appendChild(lockTbody);
                    }
                    if (self.lockRow.Container === null) {
                        self.lockRow.Container = d.create('<div class="mobileTableTopLock"></div>');
                        self.lockRow.ContainInner = d.create('<div class="mobileTableTopLock-inner"></div>');
                        self.lockRow.Container.appendChild(self.lockRow.ContainInner);
                    }
                    self.lockRow.ContainInner.appendChild(lockTable);
                    self.tableContainer.insertBefore(self.lockRow.Container, self.tableContainer.firstElementChild);
                    self.lockRow.table = lockTable;
                    d.on(window, 'scroll', scrollHandle);
                    self.conf.Container && d.on(self.conf.Container, 'scroll', scrollHandle);
                    d.on(self.tableMiddle, 'scroll', tableScrollHandle);
                }
                // 创建/更新 锁头固定区
                function createFixedBox() {
                    if (!self.lockRow.fixed && self.lockRow.Container) {
                        self.lockRow.fixedContainer = d.create('<div class="Container"></div>');
                        self.lockRow.fixed = d.create('<div class="mobileTableTopFixedLock"></div>');
                        self.lockRow.fixed.appendChild(self.lockRow.fixedContainer);
                        self.lockRow.Container.insertBefore(self.lockRow.fixed, self.lockRow.Container.firstElementChild);
                        fixedTableRefresh();
                        if (self.indexCol.col) {
                            self.indexColFun.fixedRender();
                        }
                        if (self.pseudoCol.Container) {
                            self.pseudoColFun.fixedRender();
                        }
                        self.theadSizeSync();
                    }
                    /*if(!self.conf.lockRow || self.conf.lockColNum===0) {
                        return;
                    }*/
                }
                // 刷新锁头固定区表格
                function fixedTableRefresh() {
                    if (self.lockCol.table) {
                        if (self.lockRow.fixedTable) {
                            d.remove(self.lockRow.fixedTable);
                        }
                        if (self.lockRow && self.lockRow.fixedContainer) {
                            self.lockRow.fixedTable = self.lockCol.table.cloneNode(true);
                            self.lockRow.fixedTable.removeAttribute('id');
                            // 拷贝锁列
                            self.lockRow.fixedContainer.appendChild(self.lockRow.fixedTable);
                            self.lockRow.fixedTable.tBodies.item(0).innerHTML = '';
                        }
                    }
                }
                /**
                 * 加载所列表中数据
                 * @private
                 */
                function render() {
                    if (!table) {
                        return;
                    }
                    createFixedBox();
                    resizeHeight();
                }
                /**
                 * 计算锁头高度
                 * @private
                 */
                function resizeHeight() {
                    self.lockRow.fixedContainer.style.height = (lockThead.offsetHeight + 1) + 'px';
                }
                /**
                 * 生成锁列的行
                 * @param tr
                 * @return {HTMLTableRowElement}
                 */
                function rowCreate(tr) {
                    var newTr = tr.cloneNode(true);
                    return newTr;
                }
                function rowLock() {
                    init();
                    render();
                }
                function rowUnlock() {
                    destroy();
                }
                // 锁行切换
                function rowToggle() {
                    self.conf.lockRow = !self.conf.lockRow;
                    if (self.conf.lockRow) {
                        rowLock();
                    }
                    else {
                        rowUnlock();
                    }
                    return self.conf.lockRow;
                }
                function hide() {
                    self.lockRow.table.classList.add('hideLock');
                }
                function show() {
                    self.lockRow.table.classList.remove('hideLock');
                }
                function destroy() {
                    d.off(window, 'scroll', scrollHandle);
                    // 伪列销毁
                    self.pseudoColFun.destroy();
                    self.conf.Container && d.off(self.conf.Container, 'scroll', scrollHandle);
                    d.off(self.tableMiddle, 'scroll', tableScrollHandle);
                    d.remove(self.lockRow.Container);
                    d.remove(self.lockRow.fixed);
                    lockTable = null;
                    self.lockRow.Container = null;
                    self.lockRow.fixed = null;
                }
                return {
                    init: init,
                    render: render,
                    rowCreate: rowCreate,
                    hide: hide,
                    show: show,
                    destroy: destroy,
                    rowToggle: rowToggle,
                    rowLock: rowLock,
                    rowUnlock: rowUnlock,
                    fixedTableRefresh: fixedTableRefresh // 刷新锁头固定区
                };
            }(this));
            this.cell = (function () {
                var setText = function (name, index, text) {
                    d.queryAll("table tr[data-index=\"" + index + "\"] td[data-col=\"" + name + "\"]", _this.tableWrapper).forEach(function (td) {
                        td.innerText = tools.str.toEmpty(text);
                    });
                };
                return {
                    setText: setText
                };
            })();
            this.data = (function () {
                return {
                    get: function (start, end) {
                        if (start === void 0) { start = 0; }
                        return _this.tableData.slice(start, end);
                    },
                    add: function (data) {
                        Array.isArray(data) && (_this.tableData = _this.tableData.concat(data));
                    },
                    set: function (data) {
                        Array.isArray(data) && (_this.tableData = data);
                    }
                };
            })();
            this.clickEvent = (function () {
                var selectorHandlers = {}, //存放event事件
                isOn = false; //判断是否已经触发on事件
                /**
                 * 添加事件数组
                 *
                 * 1.缓存handler
                 * 2.判断当前是否为开启状态
                 * 3.是 - 用d.on 添加监听
                 * 4.否 - 不用处理
                 *
                 * @param {string} selector 代理对象
                 * @param {EventListener} handler 事件函数
                 */
                var add = function (selector, handler) {
                    if (!selectorHandlers[selector]) {
                        selectorHandlers[selector] = [];
                    }
                    selectorHandlers[selector].push(handler);
                    if (isOn) {
                        d.on(_this.tableContainer, 'click', selector, handler);
                    }
                };
                /**
                 * 删除事件数组
                 *
                 * 1.从缓存删除handler
                 * 2.判断当前是否为开启状态
                 * 3.是 - 用d.off 移除监听
                 * 4.否 - 不用处理
                 *
                 * @param {string} selector 代理对象
                 * @param [handler]
                 */
                var remove = function (selector, handler) {
                    if (handler && selectorHandlers[selector]) {
                        for (var i = 0; i < selectorHandlers[selector].length; i++) {
                            if (selectorHandlers[selector][i] === handler) {
                                selectorHandlers[selector].splice(i, 1);
                                break;
                            }
                        }
                        if (selectorHandlers[selector].length === 0) {
                            delete selectorHandlers[selector];
                        }
                        if (isOn) {
                            d.off(_this.tableContainer, 'click', selector, handler);
                        }
                    }
                };
                /**
                 * 取消点击事件
                 */
                var off = function () {
                    isOn = false;
                    var _loop_1 = function (selector) {
                        selectorHandlers[selector].forEach(function (handler) {
                            d.off(_this.tableContainer, 'click', selector, handler);
                        });
                    };
                    for (var selector in selectorHandlers) {
                        _loop_1(selector);
                    }
                };
                /**
                 * 触发点击事件
                 */
                var on = function () {
                    off();
                    isOn = true;
                    var _loop_2 = function (selector) {
                        selectorHandlers[selector].forEach(function (handler) {
                            d.on(_this.tableContainer, 'click', selector, handler);
                        });
                    };
                    for (var selector in selectorHandlers) {
                        _loop_2(selector);
                    }
                };
                return { add: add, remove: remove, off: off, on: on };
            })();
            /**
             * 复制数据, 目前只支持PC上的浏览器
             */
            this.copy = (function () {
                var localHash = '__BasicTableCopyLocal__', localOriginHash = '__BasicTableCopyLocalOrigin__';
                function setLocal(copyText, originData) {
                    window.localStorage.setItem(localHash, copyText);
                    window.localStorage.setItem(localOriginHash, JSON.stringify(originData));
                }
                /**
                 * 与localStorage中的缓存匹配
                 * @param {string} copyText
                 * @return {obj[]}
                 */
                var matchLocal = function (copyText) {
                    if (copyText === window.localStorage.getItem(localHash)) {
                        var originText = window.localStorage.getItem(localOriginHash);
                        return JSON.parse(originText);
                    }
                    else {
                        return null;
                    }
                };
                /**
                 * 根据复制内容的第一行的内容来匹配col的title
                 * @param {string} copyText
                 */
                var matchColTitle = function (copyText) {
                    var cols = _this.conf.cols, rows = copyText.split("\r\n").filter(function (row) { return !!row; }), 
                    // rows = copyText.split("\r\n").map(text => text.trim()).filter(row => !!row),
                    colsNames = [];
                    // 如果不足两行 直接return
                    if (rows.length <= 1) {
                        return null;
                    }
                    // 根据中文名称匹配col的name
                    var first = rows.shift();
                    first.split("\t").forEach(function (title, i) {
                        for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
                            var col = cols_1[_i];
                            if (col.title === title) {
                                colsNames[i] = col.name;
                                break;
                            }
                        }
                    });
                    // 没有根据中文匹配到colName
                    if (colsNames.length === 0) {
                        return null;
                    }
                    return rows.map(function (row) {
                        var dataObj = {};
                        row.split("\t").forEach(function (text, i) {
                            var name = colsNames[i];
                            if (name) {
                                dataObj[name] = text;
                            }
                        });
                        return dataObj;
                    });
                };
                return {
                    col: function (name, isReturn) {
                        if (isReturn === void 0) { isReturn = false; }
                        var arr = _this.colDataGet(name).map(function (text) { return tools.str.toEmpty(text); });
                        // 去重
                        arr = (function () {
                            var noRepeat = [], hash = {};
                            arr.forEach(function (a) {
                                if (!hash[a]) {
                                    hash[a] = true;
                                    noRepeat.push(a);
                                }
                            });
                            return noRepeat;
                        })();
                        var text = Array.isArray(arr) ? arr.join("\r\n") : '';
                        if (isReturn) {
                            return text;
                        }
                        tools.copy(text);
                    },
                    row: function (indexes, isReturn, colsName) {
                        if (isReturn === void 0) { isReturn = false; }
                        if (colsName === void 0) { colsName = null; }
                        var cols = null;
                        if (Array.isArray(colsName)) {
                            cols = colsName.map(function (name) { return _this.nameCol[name]; });
                        }
                        else {
                            cols = _this.conf.cols;
                        }
                        var rowsData = indexes.map(function (index) { return _this.rowDataGet(index); }), rowsArr = rowsData.map(function (rowData) {
                            return cols.map(function (col) { return tools.str.toEmpty(rowData[col.name]); }).join("\t");
                        });
                        if (rowsArr[0]) {
                            rowsArr.unshift(cols.map(function (col) { return col.title; }).join("\t"));
                        }
                        var text = rowsArr.join("\r\n");
                        setLocal(text, rowsData);
                        if (isReturn) {
                            return text;
                        }
                        tools.copy(text);
                    },
                    selectedRow: function (isReturn) {
                        if (isReturn === void 0) { isReturn = false; }
                        var indexes = _this.trSelected.map(function (tr) { return parseInt(tr.dataset.index); });
                        return _this.copy.row(indexes, isReturn);
                    },
                    match: function (copyText, except) {
                        if (except === void 0) { except = []; }
                        var dataArr = matchLocal(copyText);
                        if (dataArr === null) {
                            dataArr = matchColTitle(copyText);
                        }
                        // 去掉为空的字段 或者 排除的字段
                        Array.isArray(dataArr) && dataArr.forEach(function (data) {
                            for (var name_1 in data) {
                                // 判读是否是空的字段 或者 排除的字段
                                if (tools.isEmpty(data[name_1]) || except.indexOf(name_1) >= 0) {
                                    delete data[name_1];
                                }
                            }
                        });
                        return dataArr;
                    }
                };
            })();
            this.edit = (function () {
                var modifyPara = null, editing = getEditingInit(), deletedIndexes = [], addIndex = 0, editedData = [];
                var clickEvent = (function () {
                    var self = _this;
                    var clickHandle = function () {
                        var canInit = modifyPara.canInit, canRowInit = modifyPara.canRowInit, colConf = self.nameCol[this.dataset.col], td = this, tr = d.closest(td, 'tr'), index = parseInt(tr.dataset.index), rowData = self.rowDataGet(index);
                        reshowEditing();
                        if (typeof canRowInit === 'function' && !canRowInit(rowData)) {
                            return false;
                        }
                        if (typeof canInit === 'function' && !canInit(colConf, tr.classList.contains('added') ? 1 : 0)) {
                            return;
                        }
                        var editingData = tools.obj.merge(rowData, editedData[index]);
                        this.classList.add('editing');
                        modifyPara.comInit(td, editingData, colConf);
                        editing.td = td;
                        editing.index = index;
                        editing.col = colConf;
                        editing.data = editingData;
                    };
                    return {
                        on: function () {
                            d.on(_this.tableWrapper, 'click', 'tr td:not(.editing)', clickHandle);
                            // window.addEventListener('click', reshowEditing, true);
                        },
                        off: function () {
                            d.off(_this.tableWrapper, 'click', 'tr td:not(.editing)', clickHandle);
                            // window.removeEventListener('click', reshowEditing);
                        }
                    };
                })();
                /**
                 * 初始化编辑 - 添加 删除
                 */
                var init = function () {
                    _this.theadSort.off();
                    if (_this.conf.lockColNum) {
                        _this.lock.destroy();
                    }
                    if (_this.conf.lockRow) {
                        _this.theadLock.rowUnlock();
                    }
                    _this.clickEvent.off();
                    if (_this.menu) {
                        _this.menu.col.off();
                        _this.menu.row.off();
                    }
                    _this.fire('editChange', { status: 1 });
                    _this.tableWrapper.classList.add('stand-text');
                };
                var cancel = function () {
                    if (_this.conf.lockRow) {
                        _this.theadLock.rowLock();
                    }
                    modifyPara = null;
                    addIndex = 0;
                    deletedIndexes = [];
                    editedData = [];
                    editing = getEditingInit();
                    _this.theadSort.on();
                    if (_this.conf.lockColNum) {
                        _this.lock.init();
                        _this.lock.render(d.queryAll('tbody tr', _this.table), true);
                    }
                    //this.click.on();
                    _this.clickEvent.on();
                    if (_this.menu) {
                        _this.menu.col.on();
                        _this.menu.row.on();
                    }
                    ctrlIEvent.off();
                    pasteEvent.off();
                    _this.theadSizeCache();
                    _this.theadSizeSync();
                    _this.tableWrapper.classList.remove('stand-text');
                    clickEvent.off();
                    _this.render(_this.startIndex, _this.startIndex + _this.tbodyLength, true);
                };
                /**
                 * 初始化修改
                 * @param para
                 */
                var initModify = function (para) {
                    modifyPara = para;
                    clickEvent.on();
                    pasteEvent.on();
                    ctrlIEvent.on();
                    _this.conf.cols.forEach(function (col, i) {
                        if (!modifyPara.canInit(col, 0)) {
                            _this.colGet(i).forEach(function (cell, j) {
                                if (j > 0) {
                                    cellSetDisable(cell);
                                }
                            });
                        }
                    });
                    _this.colGet(0).forEach(function (cell, j) {
                        if (j !== 0) {
                            if (!modifyPara.canRowInit(_this.rowDataGet(j - 1))) {
                                cell.parentElement.classList.add('col-disabled');
                            }
                            else {
                                cell.parentElement.classList.remove('col-disabled');
                            }
                        }
                    });
                };
                function cellSetDisable(cell) {
                    cell && cell.classList.add('col-disabled');
                }
                function getEditingInit() {
                    return {
                        td: null,
                        col: null,
                        index: -1,
                        data: null
                    };
                }
                // 添加行
                var addRow = function (rowData) {
                    var defData = modifyPara.defData;
                    addIndex = addIndex > 0 ? addIndex : _this.tableData.length;
                    rowData = rowData ? tools.obj.merge(defData, rowData) : defData;
                    var row = _this.rowCreate(rowData, addIndex);
                    row.classList.add('added');
                    _this.conf.cols.forEach(function (col) {
                        if (!modifyPara.canInit(col, 1)) {
                            cellSetDisable(d.query("td[data-col=\"" + col.name + "\"]", row));
                        }
                    });
                    d.prepend(_this.table.tBodies[0], row);
                    //增加一条indexCol
                    if (_this.indexCol.col) {
                        d.after(_this.indexCol.col.firstElementChild, _this.indexColFun.divGet(addIndex));
                        _this.indexColFun.refreshIndex();
                    }
                    editedData[addIndex] = rowData;
                    addIndex++;
                    _this.noData.isShow();
                    if (addIndex === 1) {
                        _this.resize(true);
                    }
                    // console.log(row);
                };
                var deleteRow = function (canDel) {
                    var canRowInit = null;
                    modifyPara && (canRowInit = modifyPara.canRowInit);
                    _this.trSelected.forEach(function (tr) {
                        // this.lockRowApply(tr, (t) => {
                        // });
                        var index = parseInt(tr.dataset.index);
                        if (canDel && !canDel(_this.rowDataGet(index))) {
                            return false;
                        }
                        else if (canRowInit && !canRowInit(_this.rowDataGet(index))) {
                            return false;
                        }
                        _this.rowHide(index);
                        // 删除的如果是新增的行 就不需要加入此数组
                        if (_this.tableData[index]) {
                            deletedIndexes.push(index);
                        }
                        delete editedData[index];
                    });
                };
                var modifyTd = function (td, newVal) {
                    var _a, _b;
                    var tr = d.closest(td, 'tr'), name = td.dataset.col, index = parseInt(tr.dataset.index), col = _this.nameCol[name], textFormat = typeof _this.conf.textFormat === 'function' ? _this.conf.textFormat : null, originRowData = _this.rowDataGet(index), originTdVal = originRowData[name];
                    // editedTdVal = tools.obj.merge(originRowData, editedData[index])[name];
                    // 样式
                    td.innerHTML = textFormat ? textFormat((_a = {}, _a[name] = newVal, _a), col, index) : newVal;
                    td.classList.remove('editing');
                    // 此处不使用全等，因为用户输入的类型皆为字符串
                    if (tools.str.toEmpty(originTdVal) != tools.str.toEmpty(newVal)) {
                        // 数据
                        rowData(index, (_b = {}, _b[name] = newVal, _b));
                        td.classList.add('edited');
                    }
                    else {
                        // editRowData[name] = tdVal;
                        td.classList.remove('edited');
                    }
                };
                var rowData = function (index, data) {
                    var rowData = editedData[index] || {};
                    if (data) {
                        editedData[index] = tools.obj.merge(rowData, data);
                    }
                    else {
                        return rowData;
                    }
                };
                // 销毁输入控件，更新td数据
                var reshowEditing = function () {
                    if (!editing.col) {
                        return;
                    }
                    // debugger;
                    var merge = tools.obj.merge, 
                    // editRowData =  {},
                    // trIndex = editing.index,
                    rowData = editing.data, newData = modifyPara.valGet(editing.col);
                    // tr = d.closest(editing.td, 'tr');
                    // validateResult = modifyPara.validate ? modifyPara.validate(editing.td, editing.col) : true;
                    modifyPara.validate && modifyPara.validate(editing.td, editing.col, merge(rowData, newData), function (td, noError) {
                        if (noError) {
                            td.classList.remove('error');
                        }
                        else {
                            td.classList.add('error');
                        }
                    });
                    modifyPara.comDestroy(editing.col);
                    modifyTd(editing.td, newData[editing.col.name]);
                    // 清理正在编辑的状态
                    editing = getEditingInit();
                };
                var errorLen = function () {
                    return d.queryAll('td.edited.error', _this.table).length;
                };
                var getData = function () {
                    var tableLen = _this.tableData.length, // 表格数据原始长度
                    editData = {
                        update: [],
                        insert: [],
                        delete: []
                    };
                    editedData.forEach(function (data, index) {
                        var rowData = _this.tableData[index];
                        if (tools.isEmpty(rowData) && tools.isEmpty(data)) {
                            return;
                        }
                        if (index <= tableLen - 1) {
                            // 修改
                            editData.update.push(tools.obj.merge(rowData, data));
                        }
                        else if (!tools.isEmpty(data)) {
                            // 新增
                            editData.insert.push(tools.obj.merge(rowData, data));
                        }
                    });
                    // 删除
                    deletedIndexes.forEach(function (index) {
                        editData.delete.push(_this.tableData[index]);
                    });
                    return editData;
                };
                var pasteEvent = (function () {
                    var pasteHandler = function (e) {
                        var copyText = e.clipboardData.getData('Text'), rowsData = _this.copy.match(copyText, modifyPara.pasteExceptCols);
                        if (Array.isArray(rowsData)) {
                            rowsData.forEach(function (data) {
                                addRow(data);
                            });
                        }
                    };
                    return {
                        on: function () { return d.on(_this.tableWrapper, 'paste', pasteHandler); },
                        off: function () { return d.off(_this.tableWrapper, 'paste', pasteHandler); }
                    };
                })();
                var ctrlIEvent = (function () {
                    var handler = function (e) {
                        if (e.ctrlKey && String.fromCharCode(e.keyCode) === 'I') {
                            var selectData = _this.rowSelectDataGet();
                            selectData[0] || (selectData = [modifyPara.defData]);
                            selectData.forEach(function (data) { return addRow(data); });
                        }
                    };
                    return {
                        on: function () { return d.on(_this.tableWrapper, 'keydown', handler); },
                        off: function () { return d.off(_this.tableWrapper, 'keydown', handler); }
                    };
                })();
                return {
                    errorLen: errorLen,
                    init: init,
                    initModify: initModify,
                    addRow: addRow,
                    deleteRow: deleteRow,
                    reshowEditing: reshowEditing,
                    cancel: cancel,
                    getData: getData,
                    modifyTd: modifyTd,
                    rowData: rowData,
                    getEditing: function () { return editing; }
                };
            })();
            var defaultConf = {
                Container: null,
                cols: [],
                // ajax: null,// function(mt, customer, callback){}
                // ajaxData: null,
                data: [],
                table: null,
                // length: 20, //
                // appendPage: false, // 分页方式 true是内容往下叠加, false为刷新表格
                sort: 1,
                move: false,
                indexColMulti: true,
                indexCol: null,
                pseudoCol: null,
                lockColNum: 0,
                lockRow: false,
                lockRowTop: 0,
                colResize: false,
                //   dragSelect: false,     // 拖拽选中数据
                dragRows: false,
                expand: {
                    enabled: false,
                    cache: false,
                    icon: ['arrow-right', 'arrow-down'],
                    mode: 'toggler',
                    render: function (row, index, callback) {
                        callback();
                    } // 展开行的回调填充函数
                },
                multi: {
                    enabled: false,
                    cols: []
                },
                treegrid: {
                    enabled: false,
                    cache: false,
                    icon: ['arrow-right', 'arrow-down'],
                    expand: function (nodeData, index) {
                        return true;
                    },
                    render: function (nodeData, index, callback) {
                        callback([]);
                    } // 展开行的回调填充函数
                },
                thead: false,
                colMenu: [],
                rowMenu: [],
                colGroup: false,
                // click: null,
                // clickSelector : null,
                textFormat: null,
                beforeShow: null,
                onComplete: function () {
                },
                cellWidth: 70,
                cellMaxWidth: null // 设置初始加载最大宽度
            };
            this.ssid = tools.getGuid('');
            paraConf.expand && (paraConf.expand = tools.obj.merge(defaultConf.expand, paraConf.expand));
            paraConf.treegrid && (paraConf.treegrid = tools.obj.merge(defaultConf.treegrid, paraConf.treegrid));
            this.conf = tools.obj.merge(defaultConf, paraConf);
            var conf = this.conf;
            this.table = conf.table;
            this.tableData = [];
            // self.currentPage = 0;
            // self.ajaxData = paraConf.ajaxData;
            this.tableWrapper = null;
            this.lockCol.table = null;
            this.table.classList.add('mobileTable');
            if (!this.table.tBodies.item(0)) {
                d.append(this.table, document.createElement('tbody'));
            }
            var eventConf = this.getEventConf();
            this.menuEventName = eventConf.menuName;
            this.eventClickName = eventConf.clickName;
            this.mousemoveName = eventConf.mousemoveName;
            this.mouseoutName = eventConf.mouseoutName;
            this.mousedownName = eventConf.mousedownName;
            this.mouseupName = eventConf.mouseupName;
            this.nameCol = {};
            // 多行表头
            if (tools.keysVal(conf, 'multi', 'enabled')) {
                conf.multi.cols.forEach(function (col) {
                    col.forEach(function (cell) {
                        _this.nameCol[cell.name] = cell;
                    });
                });
                // conf.cols = conf.multi.colsIndex;
            }
            else {
                conf.cols.forEach(function (col) {
                    _this.nameCol[col.name] = col;
                });
            }
            // 生成表头
            if (conf.thead || this.table.tHead === null) {
                this.theadRender();
            }
            this.wrapperInit();
            if (conf.indexCol) {
                this.indexColFun.init();
            }
            // 拖拽选中行
            /* if (conf.dragRows) {
                 this.dragRowsFunc.init();
             }*/
            // 展开行
            if (conf.expand.enabled) {
                this.expandFunc.init();
            }
            // 伪列
            if (conf.pseudoCol) {
                this.pseudoColFun.init();
            }
            // 树形展开行
            if (conf.treegrid.enabled) {
                this.treegridFunc.init();
            }
            // 排序初始化
            if (conf.sort && conf.sort !== 0) {
                this.theadSort.on();
            }
            // 锁列初始化
            if (conf.lockColNum > 0) {
                this.lock.init();
            }
            // 锁头初始化
            if (conf.lockRow) {
                this.theadLock.init();
            }
            // 列宽拖拽
            if (conf.colResize) {
                this.colResizeFun.init();
            }
            // 行列拖动
            if (this.conf.move) {
                this.moveOn();
            }
            // 拖拽选择
            /*  if (typeof conf.dragSelect === 'function') {
                  this.dragSelectFunc.init();
              }*/
            // 弹出菜单初始化
            var colMenu = conf.colMenu, rowMenu = conf.rowMenu;
            if ((colMenu && colMenu[0]) || (rowMenu && rowMenu[0])) {
                this.menu.popInit();
                this.menu.col.init('col');
                if (!tools.isMb) {
                    this.menu.row.init('row', function (target) {
                        if (!_this.trSelected[0] || !_this.trSelected[1]) {
                            _this.rowSelect(target);
                        }
                    });
                }
            }
            if (Array.isArray(conf.data) && conf.data[0]) {
                this.data.set(conf.data);
                this.render(0, conf.data.length);
            }
        }
        BasicTable.prototype.getVisibleCol = function () {
            var visibleCol = [], status = this.colHide.status;
            for (var _i = 0, _a = this.conf.cols; _i < _a.length; _i++) {
                var col = _a[_i];
                var name_2 = col.name;
                if (name_2 in status) {
                    status[name_2] && visibleCol.push(name_2);
                }
                else {
                    visibleCol.push(name_2);
                }
            }
            return visibleCol;
        };
        BasicTable.prototype.sysColOpen = function (index, height) {
            var pseudoCol = d.queryAll("div[data-index=\"" + index + "\"]", this.pseudoCol.Container);
            pseudoCol.forEach(function (item) {
                item.style.height = height + "px";
            });
            if (this.conf.indexCol) {
                var indexCol = d.query("div[data-index=\"" + index + "\"]", this.indexCol.col);
                if (indexCol) {
                    indexCol.style.height = height + "px";
                }
            }
        };
        BasicTable.prototype.sysColClose = function (index) {
            var _this = this;
            var pseudoCol = d.queryAll("div[data-index=\"" + index + "\"]", this.pseudoCol.Container);
            pseudoCol.forEach(function (item) {
                item.style.height = _this.cellHeight + "px";
            });
            if (this.conf.indexCol) {
                var indexCol = d.query("div[data-index=\"" + index + "\"]", this.indexCol.col);
                if (indexCol) {
                    indexCol.style.height = this.cellHeight + "px";
                }
            }
        };
        BasicTable.prototype.getEvent = function (event) {
            return event.changedTouches ? event.changedTouches[0] : event;
        };
        BasicTable.prototype.checkHidden = function () {
            var self = this;
            self.tableStatus = self.table.offsetWidth !== 0;
            return self.tableStatus;
        };
        /**
         * 行列拖动
         * @protected
         * @author yrh
         */
        BasicTable.prototype.moveOn = function () {
            this.moveEvent.col();
            this.moveEvent.row();
        };
        /**
         * 创建功能列
         * @param config
         * @returns {DocumentFragment}
         */
        BasicTable.prototype.createSysCol = function (config) {
            var self = this, tmpDoc = document.createDocumentFragment();
            if (config.Container.firstElementChild === null) {
                var blankDiv = d.create('<div>全选</div>');
                if (self.theadHeight) {
                    blankDiv.style.height = self.theadHeight + 'px';
                    blankDiv.style.lineHeight = self.theadHeight + 'px';
                }
                tmpDoc.appendChild(blankDiv);
                if (this.conf.indexCol === 'select') {
                    d.append(blankDiv, getCheckBox(self.ssid));
                }
                if (self.conf.colGroup) {
                    tmpDoc.appendChild(document.createElement('div'));
                }
            }
            for (var i = 0; i < config.len; i++) {
                var index = i, textTemp = void 0;
                if (config.childNode) {
                    index = index + config.start;
                    if (typeof config.childNode === 'function') {
                        textTemp = config.childNode(index);
                    }
                    else {
                        var node = config.childNode;
                        textTemp = node.toString();
                    }
                }
                else {
                    index = index + config.offset;
                    textTemp = (index + 1).toString();
                }
                tmpDoc.appendChild(self.indexColDivGet(index, textTemp, config.colType));
            }
            return tmpDoc;
        };
        BasicTable.prototype.indexColDivGet = function (index, text, colType) {
            if (text === void 0) { text = ''; }
            if (colType === void 0) { colType = 'index'; }
            var div = document.createElement('div');
            div.classList.add(colType + "Col-item");
            if (typeof text === 'string') {
                div.innerHTML = text;
                div.title = text;
            }
            else {
                div.appendChild(text);
            }
            div.dataset['index'] = index + '';
            return div;
        };
        /**
         * 渲染表格主体
         * @param dataArr
         * @param isRefresh
         * @param startIndex
         * @param highlight
         * @private
         */
        BasicTable.prototype.tbodyRender = function (dataArr, isRefresh, startIndex, highlight) {
            var _this = this;
            if (startIndex === void 0) { startIndex = 0; }
            if (highlight === void 0) { highlight = ''; }
            var trArray = [], tmpDoc = document.createDocumentFragment();
            //是否刷新
            if (isRefresh) {
                this.table.tBodies[0].innerHTML = '';
            }
            // //
            // if(!isRefresh || this.bodyRenderRefresh) {
            //     startIndex = (this.currentPage - 1) * this.conf.length;
            // }
            //判断是否为数组
            dataArr = Array.isArray(dataArr) ? dataArr : [];
            dataArr.forEach(function (data, i) {
                trArray.push(_this.rowCreate(data, i + startIndex, highlight));
            });
            // 添加列分组
            if (this.conf.colGroup) {
                trArray.unshift(this.colGroup.rowCreate(dataArr));
            }
            //添加到tbody
            trArray.forEach(function (tr) {
                tmpDoc.appendChild(tr);
            });
            var highIndex = 0;
            d.queryAll('td > span.red', tmpDoc).forEach(function (span) {
                var td = d.closest(span, 'td');
                if (td && !('highIndex' in td.dataset)) {
                    td.dataset.highIndex = highIndex + '';
                    highIndex++;
                }
            });
            this.table.tBodies[0].appendChild(tmpDoc);
            if (!tools.keysVal(this.conf, 'multi', 'enabled')) {
                if (this.conf.lockColNum > 0) {
                    this.lock.render(trArray, isRefresh);
                }
                if (this.conf.lockRow) {
                    // 锁头更新
                    this.theadLock.render();
                }
            }
            // 为列分组添加事件
            if (this.conf.colGroup) {
                this.colGroup.on();
            }
            this.noData.isShow();
            this.theadSizeSync();
        };
        /**
         * 初始化表格Wrapper
         * @private
         */
        BasicTable.prototype.wrapperInit = function () {
            var t = this.table;
            var tableWrapper = d.create("<div class=\"mobileTableWrapper\" tabindex=\"" + this.ssid + "\"><div class=\"tableContainer\">" +
                '<div class="mobileTableMiddle"></div></div></div>');
            this.table.parentNode.replaceChild(tableWrapper, this.table);
            this.tableContainer = tableWrapper.querySelector('.tableContainer');
            this.tableMiddle = this.tableContainer.querySelector('.mobileTableMiddle');
            this.tableMiddle.appendChild(t);
            this.tableWrapper = tableWrapper;
        };
        // 列分组事件
        // protected colGroupEvent() {
        //     let self = this,
        //         selectList = d.queryAll('.colGroup select', self.tableWrapper);
        //
        //     function changeHandlefunction(event) {
        //         let val = this.value,
        //             col = this.dataset.col,
        //             result = [];
        //         debugger;
        //         self.colGroupFilter = self.colGroupFilter || {};
        //         self.colGroupFilter[col] = val;
        //         self.colGroupData.forEach((item) => {
        //             let check = true;
        //             for (let filter in self.colGroupFilter) {
        //                 if (self.colGroupFilter.hasOwnProperty(filter)) {
        //                     if (item[filter] && self.colGroupFilter[filter] != '' && item[filter].toString() != self.colGroupFilter[filter]) {
        //                         check = false;
        //                     }
        //                 }
        //             }
        //             check && (result.push(tools.obj.merge({}, item)));
        //         });
        //         self.tableData = result;
        //         self.indexColFun.render(0, self.tableData.length, true);
        //         self.pseudoColFun.render(0, self.tableData.length, true);
        //         self.tbodyRender(self.tableData, true);
        //     }
        //
        //     Array.prototype.forEach.call(selectList, function (sel) {
        //         let colName = sel.dataset.col;
        //         sel.selectedIndex = -1;
        //         d.off(sel, 'change', changeHandlefunction);
        //         d.on(sel, 'change', changeHandlefunction);
        //
        //         // 设置默认选中
        //         if (self.colGroupFilter && typeof self.colGroupFilter[colName] != 'undefined') {
        //             tools.selVal(sel, self.colGroupFilter[colName]);
        //         }
        //     });
        // }
        //
        // private clearColGroup() {
        //     let self = this;
        //     self.colGroupData = null;
        //     self.colGroupFilter = null;
        // }
        /**
         * 获取某一列的cells ，
         * @param index
         * @param table
         * @return {HTMLTableCellElement[]} //item(0) 为表头的cell
         *
         */
        BasicTable.prototype.colGet = function (index, table) {
            if (table === void 0) { table = this.conf.table; }
            if (!table) {
                return null;
            }
            else {
                return d.queryAll("tr > *:nth-child(" + (index + 1) + ")", table);
            }
        };
        /**
         * 删除一列 (只针对DOM操作，不删除conf.cols中的数据)
         * @param index
         * @param table
         * @return {HTMLTableCellElement[]} - 返回删除的col
         * @private
         */
        BasicTable.prototype.colDel = function (index, table) {
            if (table === void 0) { table = this.table; }
            var cells = this.colGet(index, table);
            for (var _i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
                var cell = cells_1[_i];
                d.remove(cell);
            }
            return cells;
        };
        /**
         * 添加一列 (只针对DOM操作，不删除conf.cols中的数据)
         * @param index 插入的位置
         * @param newCol 新的列
         * @param table 添加到哪个表(table, lockTable)
         * @private
         */
        BasicTable.prototype.colAdd = function (index, newCol, table) {
            if (table === void 0) { table = this.table; }
            var toInsert = this.colGet(index + 1, table);
            if (toInsert[0]) {
                toInsert.forEach(function (insert, i) {
                    insert.parentNode.insertBefore(insert.cloneNode(true), newCol[i]);
                });
            }
            else {
                Array.prototype.forEach.call(table.querySelectorAll('tr'), function (tr, i) {
                    tr.appendChild(newCol[i].cloneNode(true));
                });
            }
        };
        /**
         * 把oldIndex 位置的列插入到 newIndex位置
         * @param oldIndex
         * @param newIndex
         * @return {HTMLTableCellElement[]}
         */
        BasicTable.prototype.colInsertTo = function (oldIndex, newIndex, forLock) {
            if (forLock === void 0) { forLock = false; }
            var self = this, confCols = this.conf.cols, confColsLen = confCols.length;
            if (this.colHide.ready) { // 隐藏列校正
                var len = 0, status_1 = this.colHide.status;
                for (var i in status_1) {
                    if (status_1.hasOwnProperty(i) && status_1[i]) {
                        len++;
                    }
                }
                confColsLen = len;
            }
            if (!(oldIndex >= 0 && oldIndex < confColsLen && newIndex >= 0 && newIndex < confColsLen)) {
                return [];
            }
            var replaced = this.colGet(oldIndex);
            if (oldIndex == newIndex) {
                return replaced;
            }
            var lockRowreplaced = this.colGet(oldIndex, this.lockRow.table);
            //cols
            var toOldIndex = this.col.hideIndex2Index(oldIndex), toNewIndex = this.col.hideIndex2Index(newIndex), delCol = confCols.splice(toOldIndex, 1), treeGrigCol;
            if (self.conf.treegrid.enabled) {
                treeGrigCol = this.colGet(0);
            }
            confCols.splice(toNewIndex, 0, delCol[0]);
            //如果newIndex > oldIndex 则需要插入到 newIndex后一位的前面
            var toInsert = this.colGet(newIndex + (newIndex > oldIndex ? 1 : 0)), toRowInsert = this.colGet(newIndex + (newIndex > oldIndex ? 1 : 0), this.lockRow.table);
            if (newIndex === confColsLen - 1) {
                replaced.forEach(function (cell, i) {
                    cell.parentNode.appendChild(cell);
                    // 展开行，展开按钮交换
                    if (self.conf.treegrid.enabled) {
                        if (oldIndex === 0 || newIndex === 0) {
                            self.treegridFunc.exchangeTd(treeGrigCol[i], cell.parentNode.firstChild);
                        }
                    }
                });
                Array.isArray(lockRowreplaced) && lockRowreplaced.forEach(function (cell) {
                    cell.parentNode.appendChild(cell);
                });
            }
            else {
                toInsert.forEach(function (cell, i) {
                    cell.parentNode.insertBefore(replaced[i], cell);
                    // 展开行，展开按钮交换
                    if (self.conf.treegrid.enabled) {
                        if (oldIndex === 0 || newIndex === 0) {
                            self.treegridFunc.exchangeTd(treeGrigCol[i], cell.parentNode.firstChild);
                        }
                    }
                });
                Array.isArray(toRowInsert) && toRowInsert.forEach(function (cell, i) {
                    cell.parentNode.insertBefore(lockRowreplaced[i], cell);
                });
            }
            if (forLock) {
                if (oldIndex < this.conf.lockColNum - 1 && newIndex < this.conf.lockColNum - 1) {
                    this.lockColReplace(oldIndex, this.colGet(oldIndex));
                    this.lockColReplace(newIndex, this.colGet(newIndex));
                    this.theadSizeSync();
                }
            }
            else {
                //有锁列的情况，则把交换后的列替换给锁列的列
                if (oldIndex < this.conf.lockColNum) {
                    this.lockColReplace(oldIndex, this.colGet(oldIndex));
                }
                if (newIndex < this.conf.lockColNum) {
                    this.lockColReplace(newIndex, this.colGet(newIndex));
                }
                this.theadSizeSync();
            }
            //
            //
            // if (oldIndex < this.conf.lockColNum || newIndex < this.conf.lockColNum) {
            // }
            return replaced;
        };
        // 锁列替换
        BasicTable.prototype.lockColReplace = function (index, col) {
            var lockReplaced = this.colGet(index, this.lockCol.table), lockFixedReplaced = this.colGet(index, this.lockRow.fixedTable), lockToInsert = col;
            lockReplaced.forEach(function (cell, i) {
                cell.parentNode.replaceChild(lockToInsert[i].cloneNode(true), cell);
            });
            Array.isArray(lockFixedReplaced) && lockFixedReplaced.forEach(function (cell, i) {
                cell.parentNode.replaceChild(lockToInsert[i].cloneNode(true), cell);
            });
            this.theadSizeSync();
        };
        /**
         * 通过列获取序号
         * @param name
         * @return {number}
         */
        BasicTable.prototype.colName2index = function (name) {
            // 根据col.name找到index
            /*this.conf.cols.forEach(function (c, i) {
                if (c.name === name) {
                    index = i;
                }
            });*/
            //console.log(index, name);
            return this.col.getHideIndex(name);
        };
        /**
         * 锁定/解锁某列
         * @param col - 列名或者index
         * @return {number}
         */
        BasicTable.prototype.colToggleLock = function (col) {
            var toggleFlag = this.lock.colToggle(col);
            this.theadLock.fixedTableRefresh();
            return toggleFlag;
        };
        /**
         * 锁定/解锁某行
         */
        BasicTable.prototype.rowToggleLock = function () {
            this.theadLock.rowToggle();
        };
        // _columnExchange(index1: number, index2 : number) : void{
        //     //cols配置交换
        //     let cols = this._conf.cols;
        //     [cols[index1], cols[index2]] = [cols[index2], cols[index1]];
        //
        //     // DOM 交换-先隐藏再交换减少repaint和reflow
        //     this._tableWrapper.style.display = 'none';
        //     let lockCols1, lockCols2,
        //         cols1 = this._columnGet(index1),
        //         cols2 = this._columnGet(index2);
        //
        //
        //     for(let i = 0, c1, c2; c1 = cols1[i]; i++){
        //         c2 = cols2[i];
        //         let cTmp = c2.cloneNode(true);
        //         let parent = <Element>c1.parentNode;
        //         parent.replaceChild(cTmp, c1);
        //
        //         parent.replaceChild(c1, c2);
        //
        //         //对于锁列的交换
        //         // if(this._conf.lockColNum > 0){
        //         //     lockCols1 = this._getColumn(index1, this._lockTable);
        //         //     lockCols2 = this._getColumn(index2, this._lockTable);
        //         // }
        //     }
        //     // if(this._conf.lockColNum > 0){
        //     //     lockCols1 = this._getColumn(index1, this._lockTable);
        //     //     lockCols2 = this._getColumn(index2, this._lockTable);
        //     //
        //     //     for (let i = 0; )
        //     // }
        //
        //
        //     this._tableWrapper.style.display = 'block';
        // }
        /**
         * 确保锁列的宽度和高度与普通列宽度一致
         * @private
         */
        BasicTable.prototype.theadSizeSync = function () {
            var _this = this;
            var tableThs = d.queryAll('tr th', this.table.tHead), padding = getPadding(tableThs[0]), indexCol = this.indexCol, lockRow = this.lockRow, lockColTable = this.lockCol.table;
            this.initStyleList();
            this.updateStyle();
            this.theadSizeCache();
            // 调整序列号高度
            if (!tools.keysVal(this.conf, 'multi', 'enabled')) {
                if (indexCol.col && indexCol.show && indexCol.col.firstChild) {
                    var blankDiv = indexCol.col.firstChild, height = this.theadHeight + 1;
                    blankDiv.style.height = height + 'px';
                    blankDiv.style.lineHeight = height + 'px';
                    if (this.conf.lockRow && lockRow.fixed) {
                        var indexFixedDiv = lockRow.fixed.querySelector('.indexCol').firstChild;
                        if (indexFixedDiv) {
                            indexFixedDiv.style.height = height + 'px';
                            indexFixedDiv.style.lineHeight = height + 'px';
                        }
                    }
                }
            }
            // 调整伪列高度
            if (this.pseudoCol.confList.length > 0 && this.pseudoCol.show) {
                var height_1 = this.theadHeight + 1;
                this.pseudoCol.confList.forEach(function (item) {
                    if (item.col.firstChild) {
                        item.col.firstChild.style.height = height_1 + 'px';
                        item.col.firstChild.style.lineHeight = height_1 + 'px';
                    }
                });
                if (this.conf.lockRow && lockRow.fixed) {
                    if (!lockRow.fixed.querySelector('.pseudoCol')) {
                        this.pseudoColFun.fixedRender();
                        this.theadSizeSync();
                    }
                    d.queryAll('.pseudoCol div', lockRow.fixed).forEach(function (item) {
                        item.style.height = height_1 + 'px';
                    });
                }
            }
            // 锁头固定区占位符
            if ((indexCol.col || this.pseudoCol.Container) && lockRow.fixed) {
                var Container = d.query('.Container', lockRow.fixed), left = this.tableContainer.offsetLeft;
                Container.style.left = -1 * left + 'px';
                Container.style.paddingLeft = left + 'px';
            }
            //  调整表头换行，导致高度错位
            if (!tools.keysVal(this.conf, 'multi', 'enabled')) {
                if (this.conf.lockColNum > 0 && lockColTable) {
                    var lockTheadThs_1 = d.queryAll('tr th div', lockColTable.tHead);
                    d.queryAll('tr th', this.table.tHead).forEach(function (th, index) {
                        var lockTh = lockTheadThs_1[index];
                        if (!lockTh) {
                            return;
                        }
                        // lockTh.style.width = th.dataset['width'] + 'px';
                        lockTh.style.width = (th.offsetWidth - padding) + 'px';
                        if (_this.theadHeight) {
                            lockTh.style.height = (_this.theadHeight - 12) + 'px';
                        }
                    });
                    lockColTable.classList.remove('hide');
                    // 横向滚动条被锁列遮挡
                    //self.lockScrollBar();
                }
            }
            if (this.conf.lockRow) {
                // 锁头单元格宽度同步
                if (lockRow.table) {
                    var lockTheadThs_2 = d.queryAll('tr th div', lockRow.table.tHead);
                    tableThs = tableThs || d.queryAll('tr th', this.table.tHead);
                    tableThs.forEach(function (th, index) {
                        var lockTh = lockTheadThs_2[index];
                        if (!lockTh) {
                            return;
                        }
                        lockTh.style.width = (th.offsetWidth - padding) + 'px';
                    });
                }
                // 锁头固定区单元格宽度同步
                if (lockRow.fixedTable) {
                    var fixedThead = lockRow.fixedTable.tHead, th = d.query("tr th", fixedThead), lockTheadThs_3 = d.queryAll('tr th div', fixedThead);
                    tableThs = tableThs || d.queryAll('tr th', this.table.tHead);
                    th && (th.style.height = this.theadHeight + 'px');
                    tableThs.forEach(function (th, index) {
                        var lockTh = lockTheadThs_3[index];
                        if (!lockTh) {
                            return;
                        }
                        lockTh.style.width = (th.offsetWidth - padding) + 'px';
                    });
                }
                var styleHeight = (this.theadHeight + 1) + 'px';
                lockRow.fixedContainer && (lockRow.fixedContainer.style.height = styleHeight);
                lockRow.ContainInner && (lockRow.ContainInner.style.height = styleHeight);
            }
        };
        // 滚动条被左侧锁列遮挡
        /*private lockScrollBar() {
            let self = this,
                time;
            function scrollBar() {
                if(self.table.offsetWidth > self.tableMiddle.offsetWidth) {
                    self.lockCol.Container.style.height = (self.table.offsetHeight - 10) + 'px';
                }
                //console.log(self.table.offsetWidth, self.tableMiddle.offsetWidth);
                time && clearTimeout(time);
                time = setTimeout(()=>{
                    self.lockCol.Container.style.height = '';
                }, 200);
            }
            d.on(self.tableMiddle, 'scroll', scrollBar);
        }*/
        /**
         * 将thead 中的th 缓存在dataset中, 默认个数为左边的conf.lockNum个
         * @param index - th的index
         */
        BasicTable.prototype.theadSizeCache = function (index) {
            if (index === void 0) { index = -1; }
            var self = this;
            self.theadHeight = self.table.tHead.offsetHeight;
        };
        /**
         * 生成表头
         * update 2017-6-10 for yrh
         */
        BasicTable.prototype.theadRender = function () {
            var thead, tmpDoc, self = this, conf = self.conf;
            // 设置标题
            thead = this.table.tHead;
            if (thead === null) {
                thead = d.create('<thead></thead>', 'table');
                this.table.insertBefore(thead, this.table.tBodies.item(0));
            }
            thead.innerHTML = '';
            // 多列表头
            if (tools.keysVal(conf, 'multi', 'enabled')) {
                var colsData = this.conf.multi.cols;
                colsData.forEach(function (row) {
                    tmpDoc = document.createElement('tr');
                    row.forEach(function (item) {
                        tmpDoc.appendChild(self.col.theadCell(item));
                    });
                    thead.appendChild(tmpDoc);
                });
            }
            else {
                var colsData = this.conf.cols;
                tmpDoc = document.createElement('tr');
                colsData.forEach(function (col) {
                    if (!self.colHide.ready || self.colHide.status[col.name]) { // 隐藏列
                        tmpDoc.appendChild(self.col.theadCell(col));
                        thead.appendChild(tmpDoc);
                    }
                });
            }
            // }
            // else if (colsData[0] && 'title' in colsData[0]) {
            //
            //     let tmpDoc = document.createElement('tr');
            //     // 单行表头
            //     colsData.forEach(function (col) {
            //         let attr: any = {
            //                 'data-col': col.name
            //             };
            //         if (self.conf.sort) {
            //             attr['class'] = 'sort';
            //         }
            //
            //         tmpDoc.appendChild(
            //             d.createByHTML(`<th${tools.obj.toAttr(attr)}>${self.cellCreate(col.name, col.title).outerHTML}</th>`, 'tr'));
            //
            //         if(col.width && self.conf.colResize) {
            //             self.styleList[self.cellClass(col.name)] = col.width;
            //         }
            //     });
            //     thead.appendChild(tmpDoc);
            // }
        };
        //TODO
        // _initLockThead(){
        //
        // }
        //
        //
        // _createLockThead(thead : Element) : HTMLTableElement{
        //
        // }
        /**
         * 有锁列时，获取同一层的tr
         * @param tr
         * @return {Array}
         * @private
         */
        BasicTable.prototype.rowsGetWithLock = function (tr) {
            var wrapper = this.tableWrapper || this.table;
            return d.queryAll("tr[data-index=\"" + tr.dataset.index + "\"]", wrapper);
        };
        /**
         * 选择行
         * @param {HTMLTableRowElement} tr
         * @param {boolean} [multi=false] - 是否多选
         */
        BasicTable.prototype.rowSelect = function (tr, multi) {
            if (multi === void 0) { multi = false; }
            if (!multi) {
                this.rowDeselect(null, true);
                // this.trSelected.forEach((tr2) => {
                //     this.lockRowApply(tr2, (t) => {
                //         t.classList.remove('selected')
                //     })
                // });
                // this.trSelected = [];
            }
            tr = this.getMainTr(tr);
            if (this.trSelected.indexOf(tr) > -1) {
                return;
            }
            this.lockRowApply(tr, function (t) {
                t.classList.add('selected');
            });
            this.trSelected.push(tr);
            this.fire('rowSelect', { indexes: [parseInt(tr.dataset.index)], select: true });
        };
        BasicTable.prototype.getMainTr = function (tr) {
            if (this.table.contains(tr)) {
                return tr;
            }
            else {
                return d.query("tbody tr[data-index=\"" + tr.dataset.index + "\"]", this.table);
            }
        };
        BasicTable.prototype.rowToggle = function (tr) {
            tr = this.getMainTr(tr);
            if (this.trSelected.indexOf(tr) > -1) {
                this.rowDeselect(tr);
            }
            else {
                this.rowSelect(tr, true);
            }
        };
        /**
         * 删除选择行
         * @param tr
         * @param noEvent
         */
        BasicTable.prototype.rowDeselect = function (tr, noEvent) {
            if (tr === void 0) { tr = null; }
            if (noEvent === void 0) { noEvent = false; }
            var self = this;
            if (tr === null) {
                var indexes_1 = [];
                self.trSelected.forEach(function (tr) {
                    self.lockRowApply(tr, function (t) {
                        t.classList.remove('selected');
                    });
                    indexes_1.push(parseInt(tr.dataset.index));
                });
                self.trSelected = [];
                if (!noEvent) {
                    this.fire('rowSelect', { indexes: indexes_1, select: false });
                }
            }
            else {
                tr = this.getMainTr(tr);
                self.lockRowApply(tr, function (t) {
                    t.classList.remove('selected');
                });
                // 删除数组中的tr
                for (var i = 0, t = null; t = self.trSelected[i]; i++) {
                    if (t === tr) {
                        self.trSelected.splice(i, 1);
                        break;
                    }
                }
                if (!noEvent) {
                    this.fire('rowSelect', { indexes: [parseInt(tr.dataset.index)], select: false });
                }
            }
            // this.fire('rowSelect', {indexes : parseInt(tr.dataset.index), select : true});
        };
        /**
         * 选择行数据获取
         * @return {Array}
         */
        BasicTable.prototype.rowSelectDataGet = function () {
            var _this = this;
            return this.trSelected.map(function (tr) { return _this.rowDataGet(parseInt(tr.dataset.index)); });
        };
        BasicTable.prototype.rowUnselectDataGet = function () {
            var _this = this;
            var allTr = d.queryAll('tbody tr', this.table), unSelected = allTr.filter(function (tr) { return !_this.trSelected.includes(tr); });
            return unSelected.map(function (tr) {
                return _this.rowDataGet(parseInt(tr.dataset.index));
            });
        };
        /**
         * 创建行
         * @param data
         * @param index
         * @param highlight
         * @return {HTMLTableRowElement}
         */
        BasicTable.prototype.rowCreate = function (data, index, highlight) {
            if (highlight === void 0) { highlight = ''; }
            var self = this, row;
            //展示前从外部获取 每行的html属性 与 数据
            if (typeof self.conf.beforeShow === 'function') {
                row = self.conf.beforeShow(data, self.conf.cols);
            }
            else {
                row = { tr: {}, td: [] };
            }
            //tr默认属性
            row.tr['data-index'] = index;
            var trDom = document.createElement('tr');
            for (var attr in row.tr) {
                trDom.setAttribute(attr, row.tr[attr]);
            }
            var textFormat = typeof self.conf.textFormat === 'function' ? self.conf.textFormat : null;
            self.conf.cols.forEach(function (col, i) {
                if (!self.colHide.ready || self.colHide.status[col.name]) { // 隐藏列
                    if (!(col.name in data)) {
                        data[col.name] = null;
                    }
                    var td = row.td[i] || {}, text = textFormat ? textFormat(data, col, index) : data[col.name], tdDom = document.createElement('td');
                    text = tools.highlight(text, highlight, 'red');
                    // textNode = document.createTextNode(text);
                    //td默认属性
                    td['data-col'] = col.name;
                    td['class'] = td['class'] ? td['class'] + " " + self.cellClass(col.name) : self.cellClass(col.name);
                    for (var attr in td) {
                        tdDom.setAttribute(attr, td[attr]);
                    }
                    tdDom.innerHTML = text;
                    // tdDom.appendChild(textNode);
                    trDom.appendChild(tdDom);
                    if (i === 0) {
                        // 树形展开
                        self.treegridFunc.addBtn(index, tdDom);
                    }
                }
            });
            return trDom;
        };
        BasicTable.prototype.rowHide = function (index) {
            d.queryAll("table tbody > tr[data-index=\"" + index + "\"]", this.tableWrapper)
                .forEach(function (table) { return table.classList.add('hide'); });
            var col = this.indexCol.col;
            if (col) {
                d.query("div[data-index=\"" + index + "\"]", col).classList.add('hide');
                if (this.conf.indexCol === 'number') {
                    this.indexColFun.refreshIndex();
                }
            }
        };
        /**
         * 创建单元格class
         * @param name   列name
         */
        BasicTable.prototype.cellClass = function (name) {
            return "td-" + this.ssid + "-" + name;
        };
        /**
         * 创建列分组select单元格
         * @param name   列name
         * @param arr    下拉选项
         */
        BasicTable.prototype.groutCreate = function (name, arr) {
            var self = this, tdContent = document.createElement('div'), selectHTML = document.createElement('select');
            arr.sort(function (a, b) {
                return b - a;
            });
            tdContent.classList.add('td-content', 'td-select', self.cellClass(name));
            selectHTML.appendChild(d.create('<option></option>'));
            arr.forEach(function (item) {
                if (item != '') {
                    var option = document.createElement('option'), text = document.createTextNode(item);
                    option.appendChild(text);
                    option.setAttribute('value', item);
                    selectHTML.appendChild(option);
                }
            });
            selectHTML.setAttribute('data-col', name);
            tdContent.appendChild(selectHTML);
            return tdContent;
        };
        /**
         * 行替换
         * @param newRow
         * @param oldRow
         */
        BasicTable.prototype.rowReplace = function (newRow, oldRow) {
            if (this.lockCol.table) {
                this.lockCol.table.tBodies[0].replaceChild(this.lock.rowCreate(newRow), this.lock.rowGet(oldRow));
            }
            this.table.tBodies[0].replaceChild(newRow, oldRow);
        };
        /**
         * 行获取
         * @param index
         * @param table
         * @return {HTMLTableRowElement}
         */
        BasicTable.prototype.rowGet = function (index, table) {
            if (table === void 0) { table = this.table; }
            if (!table) {
                return null;
            }
            else {
                return table.tBodies.item(0).querySelector("[data-index=\"" + index + "\"]");
            }
        };
        BasicTable.prototype.rowGetAll = function (table) {
            if (table === void 0) { table = this.table; }
            return d.queryAll('tbody > tr:not(.hide)', table);
        };
        ;
        /**
         * 返回表格数据
         * @param type='data'
         * @return {[]}
         */
        BasicTable.prototype.dataGet = function (type) {
            if (type === void 0) { type = 'data'; }
            var tData = null;
            switch (type) {
                case 'data':
                    tData = this.tableData;
                    break;
                case 'display':
                    //TODO 将display的数据保存起来
                    tData = this.tableData;
                    break;
            }
            return tData;
        };
        BasicTable.prototype.onLoad = function (isEnd) {
        };
        ;
        BasicTable.prototype.lockRowApply = function (tr, callback) {
            var trs = this.rowsGetWithLock(tr);
            trs.forEach(function (t, i) {
                callback(t, i);
            });
        };
        /**
         * 获取conf中的参数
         * @param name
         * @param value
         * @return {*}
         */
        BasicTable.prototype.attr = function (name, value) {
            if (typeof value === 'undefined') {
                return this.conf[name];
            }
            else {
                this.conf[name] = value;
            }
        };
        /**
         *
         * @return {HTMLDivElement}
         */
        BasicTable.prototype.wrapperGet = function () {
            return this.tableWrapper;
        };
        // -------------- yrh update --------------
        /**
         * 更新表格样式
         * @private
         * @author yrh
         */
        BasicTable.prototype.updateStyle = function () {
            var self = this;
            if (!this.conf.colResize || !self.tableContainer || !self.checkHidden()) {
                return;
            }
            var styleArr = [], style = document.querySelector("style[y-ui=\"table-" + self.ssid + "\"]");
            if (!style) {
                style = document.createElement('style');
                style.setAttribute('type', 'text/css');
                style.setAttribute('y-ui', "table-" + self.ssid);
                self.tableContainer.appendChild(style);
            }
            for (var styleItem in self.styleList) {
                var width = self.styleList[styleItem];
                styleArr.push("." + styleItem + "{ width: " + (width - 1) + "px; max-width: " + (width - 1) + "px;}");
            }
            //console.log('updateStyle');
            style.innerHTML = styleArr.join('');
        };
        /**
         * 取Contianer 的 scrollTop
         * @return
         */
        BasicTable.prototype.scrollTop = function () {
            if (this.conf.Container) {
                return this.conf.Container.scrollTop || window.scrollY;
            }
            else {
                return tools.scrollTop();
            }
        };
        BasicTable.prototype.initStyleList = function () {
            var self = this;
            if (!self.styleListReady) {
                var ths = d.queryAll('th', self.table.tHead);
                if (!ths[0]) {
                    return;
                }
                var padding_1 = getPadding(ths[0]);
                if (tools.keysVal(self.conf, 'multi', 'enabled')) {
                    // 多列表头，移除多余列
                    var filterTh_1 = [];
                    ths.forEach(function (th) {
                        if (!th.getAttribute('colspan')) {
                            filterTh_1.push(th);
                        }
                    });
                    ths = filterTh_1;
                }
                if (self.conf.cellMaxWidth) {
                    self.tableStyle.add(["table th, table td{width:${self.conf.cellMaxWidth - padding}px;max-width:" + (self.conf.cellMaxWidth - padding_1) + "px;}"]);
                }
                if (self.conf.cellMaxWidth && !self.conf.colResize) {
                    // 只设置了 cellMaxWidth，且列数不足以支撑最大宽度(列太少，导致列宽必须超过cellMaxWidth)
                    if (ths[0].offsetWidth > self.conf.cellMaxWidth) {
                        self.tableStyle.del();
                    }
                }
                else if (self.conf.colResize) {
                    // 设置了 colResize
                    ths.forEach(function (th) {
                        self.styleList[self.cellClass(th.dataset.col)] = th.offsetWidth - padding_1;
                    });
                    if (self.conf.cellMaxWidth) {
                        self.tableStyle.del();
                    }
                }
                self.styleListReady = true;
            }
        };
        BasicTable.prototype.resize = function (type) {
            if (type === void 0) { type = false; }
            var self = this;
            function handle() {
                self.styleListReady = false;
                self.styleList = {};
                self.updateStyle();
                self.initStyleList();
                self.updateStyle();
                if (self.lockRow.Container) {
                    self.lockRow.Container.style.width = self.tableContainer.offsetWidth + 'px';
                }
                self.theadSizeSync();
            }
            if (!self.tableStatus && !type) {
                handle();
            }
            else if (type) {
                self.checkHidden() && handle();
            }
        };
        BasicTable.prototype.setTableWidth = function (width) {
            var self = this;
            self.table.style.width = width + 'px';
            self.lockRow.table.style.width = width + 'px';
            //self.lockRow.fixedTable.style.width = width + 'px';
        };
        /**
         * 把oldIndex 位置的行插入到 newIndex位置
         * @param oldIndex
         * @param newIndex
         */
        BasicTable.prototype.rowInsertTo = function (oldIndex, newIndex) {
            var self = this, len = self.tbodyLength, index = 0;
            // if(self.conf.length>0) {
            //     len = len>self.conf.length? self.conf.length: len;
            // }
            if (!(oldIndex >= 0 && oldIndex < len && newIndex >= 0 && newIndex < len)) {
                return null;
            }
            var replaced = self.rowGet(oldIndex);
            if (oldIndex == newIndex) {
                return replaced;
            }
            var lockTablereplaced = self.rowGet(oldIndex, self.lockCol.table);
            //如果newIndex > oldIndex 则需要插入到 newIndex后一位的前面
            index = newIndex + (newIndex > oldIndex ? 1 : 0);
            var toInsert = self.rowGet(index), toLockInsert = self.rowGet(index, self.lockCol.table);
            if (newIndex === len - 1) {
                self.table.tBodies[0].appendChild(replaced);
                self.lockCol.table && self.lockCol.table.tBodies[0].appendChild(lockTablereplaced);
            }
            else {
                self.table.tBodies[0].insertBefore(replaced, toInsert);
                self.lockCol.table && self.lockCol.table.tBodies[0].insertBefore(lockTablereplaced, toLockInsert);
            }
            // 更新序号
            self.updateRowIndex(self.table);
            self.updateRowIndex(self.lockCol.table);
        };
        /**
         * 更新列序号
         */
        BasicTable.prototype.updateRowIndex = function (table) {
            var self = this;
            if (table) {
                d.queryAll('tbody tr', table).forEach(function (tr, i) {
                    if (self.conf.colGroup) {
                        tr.dataset.index = i > 0 ? (i - 1).toString() : '';
                    }
                    else {
                        tr.dataset.index = i.toString();
                    }
                });
            }
        };
        /**
         * TODO 销毁此表
         */
        BasicTable.prototype.destroy = function () {
            this.theadLock.destroy();
            this.colResizeFun.off();
            d.remove(this.tableWrapper);
        };
        /**
         * 获取某列数据
         * @param index
         * @param type
         * @return {null}
         */
        BasicTable.prototype.colDataGet = function (index, type) {
            if (type === void 0) { type = 'data'; }
            var colData = null, self = this, col;
            if (typeof index === 'string') {
                index = this.col.getIndex(index);
            }
            col = self.conf.cols[index];
            if (col) {
                if (type === 'data') {
                    colData = self.dataGet().map(function (data) { return data[col.name]; });
                }
                else if (type === 'display') {
                    colData = self.colGet(index).map(function (cell) { return tools.str.removeHtmlTags(cell.innerHTML); });
                }
            }
            return colData;
        };
        BasicTable.prototype.rowDataGet = function (index) {
            return tools.obj.copy(this.dataGet()[index]);
        };
        // public ajaxDataGet(): any {
        //     return this.ajaxData;
        // }
        //
        // public currentPageGet():number{
        //     return this.currentPage;
        // }
        BasicTable.prototype.on = function (type, cb) {
            d.on(this.tableWrapper, "bt." + type, cb);
        };
        BasicTable.prototype.fire = function (type, detail) {
            tools.event.fire("bt." + type, detail, this.tableWrapper);
        };
        BasicTable.prototype.getSearchData = function (val, dataArr) {
            var _this = this;
            if (dataArr === void 0) { dataArr = this.tableData; }
            var conf = this.conf, displayText = [], visibleCol = this.getVisibleCol();
            // 清除查询
            if (tools.isEmpty(val)) {
                this.render(0, this.tbodyLength);
                return;
            }
            dataArr.forEach(function (trData, index) {
                displayText.push({});
                for (var name_3 in trData) {
                    var col = conf.cols[_this.col.getIndex(name_3)];
                    if (col && visibleCol.indexOf(name_3) > -1) {
                        displayText[index][name_3] = conf.textFormat(trData, col, index);
                    }
                }
            });
            return dataArr.filter(function (data, index) {
                var trText = displayText[index];
                for (var name_4 in trText) {
                    var tdText = tools.str.removeHtmlTags(trText[name_4] + '');
                    if (tdText.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                        return true;
                    }
                }
                return false;
            });
        };
        BasicTable.prototype.search = function (val, dataArr) {
            if (dataArr === void 0) { dataArr = this.tableData; }
            var filterData = this.getSearchData(val, dataArr);
            if (!tools.isEmpty(filterData)) {
                var dataLen = filterData.length, indexLen = dataLen < this.tbodyLength ? dataLen : this.tbodyLength;
                this.tbodyRender(filterData, true, 0, val);
                this.indexColFun.render(0, indexLen, true);
                this.pseudoColFun.render(0, indexLen, true);
                this.resize(true);
            }
        };
        /**
         * 将表格的数据渲染到页面上, 参数start和end直接传入数组的slice方法
         * @param {number} start - 表格数据数组开始下标
         * @param {number} end - 表格数据数组结束下标
         * @param {boolean} isRefresh - 刷新还是附加数据
         */
        BasicTable.prototype.render = function (start, end, isRefresh) {
            if (isRefresh === void 0) { isRefresh = true; }
            var data = this.tableData.slice(start, end), length = data.length;
            if (isRefresh) {
                this.trSelected = [];
                this.colGroup.clear();
            }
            this.tbodyRender(data, isRefresh, start);
            this.indexColFun.render(start, length, isRefresh);
            this.pseudoColFun.render(start, length, isRefresh);
            this.startIndex = isRefresh ? start : this.startIndex;
            this.tbodyLength = isRefresh ? length : this.tbodyLength + length;
            this.resize(true);
            this.fire('render');
        };
        BasicTable.prototype.highlight = function (str) {
            var _this = this;
            // let data = this.tableData.slice(this.startIndex, this.startIndex + this.tbodyLength);
            //
            //
            // this.tbodyRender(data, true, this.startIndex, str);
            var getSameTd = function (td) {
                var trIndex = td.parentElement.dataset.index, tdCol = td.dataset.col;
                return d.queryAll("tbody tr[data-index=\"" + trIndex + "\"] td[data-col=\"" + tdCol + "\"]", _this.tableWrapper);
            };
            var highIndex = 0;
            d.queryAll('tbody td', this.table).forEach(function (cell) {
                var has = false;
                getSameTd(cell).forEach(function (td) {
                    if (td.dataset.highIndex) {
                        delete td.dataset.highIndex;
                        td.innerHTML = tools.str.removeHtmlTags(td.innerHTML);
                    }
                    var tdText = td.innerHTML, hlTdText = tools.highlight(tdText, str, 'red');
                    if (tdText !== hlTdText) {
                        td.innerHTML = hlTdText;
                        td.dataset.highIndex = highIndex + '';
                        has = true;
                    }
                });
                has && highIndex++;
            });
        };
        BasicTable.prototype.tableELGet = function () { return this.table; };
        return BasicTable;
    }());
    exports.BasicTable = BasicTable;
    /**
     * 取表格单元格内边距
     * @param dom
     * @return {number}
     */
    function getPadding(dom) {
        var style = getComputedStyle(dom, null), paddingLeft = parseInt(style.paddingLeft.replace('px', '')), paddingRight = parseInt(style.paddingRight.replace('px', ''));
        return paddingLeft + paddingRight;
    }
    function getCheckBox(ssid) {
        var checkbox = checkBox_1.CheckBox.initCom(ssid);
        checkbox.classList.add('circle');
        d.off(d.query('.check-span', checkbox));
        return checkbox;
    }
});

define("PcTable", ["require", "exports", "BasicTable"], function (require, exports, basicTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var PcTable = /** @class */ (function (_super) {
        __extends(PcTable, _super);
        function PcTable(para) {
            var _this = _super.call(this, para) || this;
            _this.wrapperRect = null;
            _this.hoverFun = (function (self) {
                var wrapper = self.tableWrapper, colHoverHandler = function () {
                    colHoverToggle(this);
                }, rowHoverHandler = function () {
                    rowHoverToggle(this);
                }, colHoverOn = function () {
                    d.on(wrapper, 'mouseover', 'thead th', colHoverHandler);
                    d.on(wrapper, 'mouseout', 'thead th', colHoverHandler);
                }, colHoverOff = function () {
                    d.off(wrapper, 'mouseover', 'thead th', colHoverHandler);
                    d.off(wrapper, 'mouseout', 'thead th', colHoverHandler);
                }, rowHoverOn = function () {
                    d.on(wrapper, 'mouseover', 'tbody tr', rowHoverHandler);
                    d.on(wrapper, 'mouseout', 'tbody tr', rowHoverHandler);
                }, rowHoverOff = function () {
                    d.off(wrapper, 'mouseover', 'tbody tr', rowHoverHandler);
                    d.off(wrapper, 'mouseout', 'tbody tr', rowHoverHandler);
                };
                function colHoverToggle(th) {
                    var index = self.colName2index(th.dataset.col), isHover = th.classList.contains('col-hover'), table = d.closest(th, '.mobileTableLock') ? self.lockTable : self.table;
                    d.queryAll('.col-hover', wrapper).forEach(function (item, i) {
                        item.classList.remove('col-hover');
                    });
                    self.colGet(index, table).forEach(function (tr) {
                        isHover || tr.classList.add('col-hover');
                    });
                    if (self.conf.lockRow) {
                        self.colGet(index, self.lockRow.table).forEach(function (tr) {
                            isHover || tr.classList.add('col-hover');
                        });
                    }
                    if (self.conf.lockColNum > 0) {
                        self.colGet(index, self.lockCol.table).forEach(function (tr) {
                            isHover || tr.classList.add('col-hover');
                        });
                    }
                    if (d.closest(th, '.mobileTableTopFixedLock')) {
                        self.colGet(index, self.lockRow.fixedTable).forEach(function (tr) {
                            isHover || tr.classList.add('col-hover');
                        });
                    }
                }
                function rowHoverToggle(row) {
                    var isHover = row.classList.contains('col-hover');
                    isHover ? row.classList.remove('col-hover') : row.classList.add('col-hover');
                    self.lockRowApply(row, function (tr) {
                        isHover ? tr.classList.remove('col-hover') : tr.classList.add('col-hover');
                    });
                }
                return {
                    row: {
                        on: rowHoverOn,
                        off: rowHoverOff
                    },
                    col: {
                        on: colHoverOn,
                        off: colHoverOff
                    }
                };
            })(_this);
            // protected isShowNoData() {
            //     let noDataDom = this.table.nextElementSibling;
            //     noDataDom = noDataDom && noDataDom.classList.contains('nodata') ? noDataDom : null;
            //
            //     // 当前页没有tbody中没有tr
            //     if (this.table.tBodies.item(0).firstElementChild === null) {
            //         if (!noDataDom) {
            //             noDataDom = d.createByHTML('<div class="nodata no-padding"><span class="iconfont icon-gongyongwushuju"></span></div>');
            //             d.after(this.table, noDataDom);
            //
            //             if (this.indexCol.col) {
            //                 this.indexColFun.show(false);
            //             }
            //             if (this.pseudoCol.Container) {
            //                 this.pseudoCol.show = false;
            //                 this.pseudoCol.Container.classList.add('hide');
            //                 this.tableWrapper.classList.remove('hasPseudoCol');
            //             }
            //         }
            //     } else {
            //         if (noDataDom) {
            //             d.remove(noDataDom);
            //
            //             if (this.indexCol.col) {
            //                 this.indexColFun.show(true);
            //             }
            //             if (this.pseudoCol.Container) {
            //                 this.pseudoCol.show = true;
            //                 this.pseudoCol.Container.classList.remove('hide');
            //                 this.tableWrapper.classList.add('hasPseudoCol');
            //             }
            //         }
            //     }
            //
            // }
            // 拖拽框选
            _this.drag = (function (self) {
                var start_name, end_name, start_index, end_index, startTd, startCol, mouseStart, mouseEnd, shadeLayer, maxSize, outLayer = false, callbackQueue = []; // 回调函数队列
                function getPosition(e) {
                    return { x: e.pageX, y: e.pageY };
                }
                // 创建遮罩
                function createLayer() {
                    if (!shadeLayer) {
                        shadeLayer = document.getElementById('tableDragSelect' + self.ssid);
                        if (!shadeLayer) {
                            shadeLayer = document.createElement('div');
                            shadeLayer.classList.add('tableDragSelect');
                            shadeLayer.setAttribute('id', 'tableDragSelect' + self.ssid);
                            self.tableWrapper.appendChild(shadeLayer);
                        }
                    }
                }
                // 更新遮罩尺寸
                function updatePosition() {
                    var left = mouseStart.x < mouseEnd.x ? mouseStart.x : mouseEnd.x, top = mouseStart.y < mouseEnd.y ? mouseStart.y : mouseEnd.y, width = Math.abs(mouseEnd.x - mouseStart.x), height = Math.abs(mouseEnd.y - mouseStart.y), offsetTop = G.tools.offset.top(self.tableWrapper), offsetLeft = G.tools.offset.left(self.tableWrapper), scrollTop = self.conf.Container ? self.conf.Container.scrollTop : 0;
                    outLayer = false;
                    // 边界限制
                    if (left < maxSize.left) {
                        left = maxSize.left;
                        width = Math.abs(left - mouseStart.x);
                        outLayer = true;
                    }
                    if (top < maxSize.top) {
                        top = maxSize.top;
                        height = Math.abs(top - mouseStart.y);
                        outLayer = true;
                    }
                    if (left + width > maxSize.right) {
                        width = maxSize.right - left;
                        outLayer = true;
                    }
                    if (top + height > maxSize.bottom) {
                        height = maxSize.bottom - top;
                        outLayer = true;
                    }
                    shadeLayer.style.left = (left - offsetLeft) + 'px';
                    shadeLayer.style.top = (top - offsetTop + scrollTop) + 'px';
                    shadeLayer.style.width = width + 'px';
                    shadeLayer.style.height = height + 'px';
                }
                // 拖拽
                function mouseMove(event) {
                    event = self.getEvent(event);
                    if (self.dragControl.dragging) {
                        mouseEnd = getPosition(event);
                        if (Math.abs(mouseEnd.x - mouseStart.x) > 10 || Math.abs(mouseEnd.y - mouseStart.y) > 10) {
                            createLayer();
                            updatePosition();
                        }
                        /*if(!outLayer && !event.target.classList.contains('tableDragSelect')) {
                            endTd = event.target;
                        }*/
                    }
                }
                // 获取边界
                function getMax() {
                    var tableContainer = self.tableContainer, table = self.table.tBodies.item(0), top = tools.offset.top(table), left = tools.offset.left(tableContainer), colGroupHeight = self.conf.colGroup ? 30 : 0;
                    return {
                        top: top + colGroupHeight,
                        left: left,
                        right: left + tableContainer.offsetWidth,
                        bottom: top + table.offsetHeight
                    };
                }
                // 鼠标按下
                function mousedownHandle(event) {
                    //event.preventDefault();
                    if (d.closest(event.target, '.colGroup')) {
                        return;
                    }
                    event = self.getEvent(event);
                    startTd = d.closest(event.target, 'td');
                    if (!startTd) {
                        return;
                    }
                    startCol = startTd.dataset.col;
                    mouseStart = getPosition(event);
                    maxSize = getMax();
                    //endTd = null;
                    self.dragControl.dragging = true;
                    document.onselectstart = function () {
                        return false;
                    };
                    document.ondragstart = function () {
                        return false;
                    };
                    d.on(document, self.mousemoveName, mouseMove);
                    d.on(document, self.mouseupName, mouseupHandle);
                }
                // 鼠标松开
                function mouseupHandle(e) {
                    document.onselectstart = null;
                    document.ondragstart = null;
                    d.off(document, self.mousemoveName, mouseMove);
                    d.off(document, self.mouseupName, mouseupHandle);
                    if (self.dragControl.dragging) {
                        var startTr = d.closest(startTd, 'tr');
                        if (!shadeLayer) {
                            start_name = end_name = startCol;
                            start_index = end_index = startTr.dataset.index;
                        }
                        else {
                            var event_1 = e.changedTouches ? e.changedTouches[0] : e, theadTh = d.queryAll('tr th', self.table.tHead), thLen = theadTh.length, end_col = void 0, end_td = void 0;
                            // 获取结束的单元格位置
                            if (theadTh[thLen - 1].getBoundingClientRect().right < event_1.clientX) {
                                var th = theadTh[thLen - 1];
                                end_name = th.dataset.col;
                                end_col = thLen - 1;
                            }
                            else {
                                for (var i = 0; i < thLen; i++) {
                                    var right = theadTh[i].getBoundingClientRect().right;
                                    if (right > event_1.clientX) {
                                        var th = theadTh[i];
                                        end_name = th.dataset.col;
                                        end_col = i;
                                        break;
                                    }
                                }
                            }
                            end_td = self.colGet(end_col);
                            if (end_td[end_td.length - 1].getBoundingClientRect().bottom < event_1.clientY) {
                                end_index = end_td[end_td.length - 1].parentNode.dataset.index;
                            }
                            else {
                                for (var i = 0, l = end_td.length; i < l; i++) {
                                    if (self.conf.colGroup && i < 2) {
                                        continue;
                                    }
                                    var bottom = end_td[i].getBoundingClientRect().bottom;
                                    if (bottom > event_1.clientY) {
                                        end_index = end_td[i].parentNode.dataset.index;
                                        break;
                                    }
                                }
                            }
                            start_name = startCol;
                            start_index = parseInt(startTr.dataset.index);
                            // 顺序调整
                            if (start_index > end_index) {
                                var temp = start_index;
                                start_index = end_index;
                                end_index = temp;
                            }
                            if (start_name != end_name && mouseStart.x > mouseEnd.x) {
                                var temp = start_name;
                                start_name = end_name;
                                end_name = temp;
                            }
                        }
                        shadeLayer && d.remove(shadeLayer);
                        shadeLayer = null;
                        mouseStart = null;
                        //endTd = null;
                        startTd = null;
                        startCol = null;
                        self.dragControl.dragging = false;
                        if ((start_index === end_index) && e.button === 2) {
                            return;
                        }
                        callbackQueue.forEach(function (callback) {
                            callback(start_name, end_name, start_index, end_index);
                        });
                    }
                }
                function on(handle) {
                    if (callbackQueue.length === 0) {
                        d.on(self.tableContainer, self.mousedownName, mousedownHandle);
                    }
                    callbackQueue.push(handle);
                }
                function off() {
                    d.off(self.tableContainer, self.mousedownName, mousedownHandle);
                    callbackQueue = [];
                    //移除有选中的单元格
                    d.queryAll('td.cellSelect', self.tableContainer).forEach(function (td) {
                        td.classList.remove('cellSelect');
                        var classArr = ['topBorder', 'bottomBorder', 'leftBorder', 'rightBorder'];
                        for (var i = 0, l = classArr.length; i < l; i++) {
                            if (td.classList.contains(classArr[i])) {
                                td.classList.remove(classArr[i]);
                            }
                        }
                    });
                }
                function getData() {
                    return self.dragSelectFunc.getResult();
                }
                return {
                    on: on,
                    off: off,
                    getData: getData
                };
            }(_this));
            // 拖拽选择
            _this.dragSelectFunc = (function (self) {
                var selectData = {};
                // 添加选中样式
                function cellSelect(start_name, end_name, start_index, end_index) {
                    var hasLock = false;
                    d.queryAll('td.cellSelect', self.tableContainer).forEach(function (td) {
                        td.classList.remove('cellSelect');
                        var classArr = ['topBorder', 'bottomBorder', 'leftBorder', 'rightBorder'];
                        for (var i = 0, l = classArr.length; i < l; i++) {
                            if (td.classList.contains(classArr[i])) {
                                td.classList.remove(classArr[i]);
                            }
                        }
                    });
                    if (self.conf.lockColNum > 0) {
                        // 锁列
                        for (var _i = 0, _a = self.conf.cols; _i < _a.length; _i++) {
                            var arr = _a[_i];
                            if (arr.name === start_name) {
                                hasLock = true;
                                break;
                            }
                        }
                    }
                    var _loop_1 = function (i) {
                        var tr = self.rowGet(i), isSelected = false;
                        d.queryAll('td', tr).forEach(function (td) {
                            if (td.dataset.col === start_name) {
                                td.classList.add('leftBorder');
                                isSelected = true;
                            }
                            if (isSelected) {
                                td.classList.add('cellSelect');
                            }
                            if (isSelected && i == start_index) {
                                td.classList.add('topBorder');
                            }
                            if (isSelected && i == end_index) {
                                td.classList.add('bottomBorder');
                            }
                            if (td.dataset.col === end_name) {
                                td.classList.add('rightBorder');
                                isSelected = false;
                            }
                        });
                        if (self.conf.lockColNum > 0 && hasLock) {
                            var lockTr = self.rowGet(i, self.lockCol.table), isLockSelected = void 0;
                            d.queryAll('td', lockTr).forEach(function (td) {
                                if (td.dataset.col === start_name) {
                                    td.classList.add('leftBorder');
                                    isSelected = true;
                                }
                                if (isSelected) {
                                    td.classList.add('cellSelect');
                                }
                                if (isSelected && i == start_index) {
                                    td.classList.add('topBorder');
                                }
                                if (isSelected && i == end_index) {
                                    td.classList.add('bottomBorder');
                                }
                                if (td.dataset.col === end_name) {
                                    td.classList.add('rightBorder');
                                    isSelected = false;
                                }
                            });
                        }
                    };
                    for (var i = start_index; i <= end_index; i++) {
                        _loop_1(i);
                    }
                }
                // 筛选被框选的单元格
                function checkSelected(start_name, end_name, start_index, end_index) {
                    if (!!~start_index.toString().indexOf('-') || !!~end_index.toString().indexOf('-')) {
                        return;
                    }
                    cellSelect(start_name, end_name, start_index, end_index);
                    // 构造数据
                    var cols = [], data = [];
                    //if(start_index) {
                    for (var i = start_index; i <= end_index; i++) {
                        var isdata = false, row = {};
                        for (var _i = 0, _a = self.conf.cols; _i < _a.length; _i++) {
                            var col = _a[_i];
                            if (col.name === start_name) {
                                isdata = true;
                            }
                            if (isdata) {
                                if (i === start_index) {
                                    cols.push(tools.obj.merge(col, {}));
                                }
                                row[col.name] = self.tableData[i][col.name];
                            }
                            if (col.name === end_name) {
                                isdata = false;
                            }
                        }
                        data.push(row);
                    }
                    //}
                    var result = { cols: cols, data: data };
                    self.dragSelect.selected = result;
                    var indexes = [parseInt(start_index), parseInt(end_index)];
                    selectData = {
                        indexes: indexes,
                        cols: cols
                    };
                    // self.conf.dragSelect && self.conf.dragSelect(result);
                }
                function on() {
                    self.dragSelect.selected = {};
                    self.drag.on(checkSelected);
                }
                function off() {
                    self.dragSelect.selected = {};
                    self.drag.off();
                }
                function getResult() {
                    return selectData;
                }
                return {
                    on: on, off: off, getResult: getResult
                };
            })(_this);
            _this.dragRowsFunc = (function (self) {
                /*function checkboxHandle() {
        
                }*/
                function clickHandle(index, event) {
                    var e = self.getEvent(event), checkbox = e.target, action = checkbox.checked ? 'add' : 'remove', result = [];
                    if (checkbox.tagName !== 'INPUT') {
                        return;
                    }
                    var tr = self.rowGet(index);
                    tr.classList[action]('selected');
                    if (self.conf.lockColNum > 0) {
                        var lockTr = self.rowGet(index, self.lockCol.table);
                        lockTr.classList[action]('selected');
                    }
                    // 更新选中值
                    d.queryAll('input[name="checkedrows"]', self.pseudoCol.Container).forEach(function (item) {
                        if (item.checked) {
                            var pseudoCol = item.parentNode, val = pseudoCol.dataset.index;
                            result.push(self.tableData[val]);
                        }
                    });
                    self.dragRows.selected = result;
                    self.conf.dragRows && self.conf.dragRows(result);
                }
                function createPseudoCol() {
                    self.pseudoColFun.init({
                        render: function (index) { return '<input type="checkbox" name="checkedrows" class="checkedRows" />'; },
                        click: clickHandle
                    });
                }
                // 添加选中样式
                function cellSelect(start_name, end_name, start_index, end_index) {
                    d.queryAll('tr.selected', self.tableContainer).forEach(function (td, i) {
                        td.classList.remove('selected');
                    });
                    d.queryAll('input[type="checkbox"]', self.pseudoCol.Container).forEach(function (item) {
                        item.checked = false;
                    });
                    for (var i = start_index; i <= end_index; i++) {
                        var tr = self.rowGet(i);
                        tr.classList.add('selected');
                        if (self.conf.lockColNum > 0) {
                            var lockTr = self.rowGet(i, self.lockCol.table);
                            lockTr.classList.add('selected');
                        }
                        var pseudo = self.pseudoCol.Container.querySelector(".pseudoCol-item[data-index=\"" + i + "\"] input[type=\"checkbox\"]");
                        pseudo && (pseudo.checked = true);
                    }
                }
                // 筛选被框选的单元格
                function checkSelected(start_name, end_name, start_index, end_index) {
                    if (!!~start_index.toString().indexOf('-') || !!~end_index.toString().indexOf('-')) {
                        return;
                    }
                    cellSelect(start_name, end_name, start_index, end_index);
                    // 构造数据
                    var result = [];
                    if (start_index) {
                        for (var i = start_index; i <= end_index; i++) {
                            result.push(self.tableData[i]);
                        }
                    }
                    self.dragRows.selected = result;
                    self.conf.dragRows && self.conf.dragRows(result);
                }
                function init() {
                    createPseudoCol();
                    self.drag.on(checkSelected);
                }
                return {
                    init: init
                };
            }(_this));
            var defaultConf = {
                colReorder: false,
            };
            // console.log(defaultConf, this.conf);
            _this.conf = tools.obj.merge(true, defaultConf, _this.conf);
            if (!tools.keysVal(_this.conf, 'multi', 'enabled')) {
                _this.hoverFun.col.on();
                _this.hoverFun.row.on();
            }
            var self = _this, handler = function (e) {
                if (e.ctrlKey && self.conf.indexColMulti) {
                    self.rowToggle(this);
                }
                else {
                    self.rowSelect(this);
                }
            };
            _this.clickEvent.add('tbody tr', handler);
            _this.on('editChange', function (e) {
                if (e.detail.status === 1) {
                    _this.hoverFun.row.off();
                    _this.hoverFun.col.off();
                    _this.dragSelectFunc.off();
                }
                else {
                    _this.hoverFun.row.on();
                    _this.hoverFun.col.on();
                    _this.dragSelectFunc.on();
                }
            });
            _this.conf.onComplete && _this.conf.onComplete();
            // this.conf.onComplete(this, false);
            //开启拖拽选择
            _this.dragSelectFunc.on();
            return _this;
        }
        PcTable.prototype.getEventConf = function () {
            return {
                menuName: 'contextmenu',
                clickName: 'click',
                mousemoveName: 'mousemove',
                mouseoutName: 'mouseout',
                mousedownName: 'mousedown',
                mouseupName: 'mouseup'
            };
        };
        PcTable.prototype.wrapperRectGet = function () {
            if (!this.wrapperRect) {
                this.wrapperRect = this.tableWrapper.getBoundingClientRect();
            }
            return this.wrapperRect;
        };
        PcTable.prototype.menuConfGet = function () {
            var self = this;
            return {
                colConfGet: function () {
                    // rect = self.wrapperRectGet();
                    return {
                        identifier: 'col',
                        targetGet: function (selector) { return [selector]; },
                        targetSelector: 'thead tr th',
                        btns: self.conf.colMenu,
                        eventHandle: function (target, e) {
                            e.preventDefault();
                            var rect = self.tableWrapper.getBoundingClientRect();
                            var pos = [e.clientX - rect.left, e.clientY - rect.top];
                            self.popMenuDom.style.left = pos[0] + "px";
                            self.popMenuDom.style.top = pos[1] + "px";
                        }
                    };
                },
                rowConfGet: function () {
                    return {
                        identifier: 'row',
                        targetGet: function (selector) { return self.trSelected; },
                        targetSelector: 'tbody tr',
                        btns: self.conf.rowMenu,
                        eventHandle: function (target, e) {
                            e.preventDefault();
                            var rect = self.tableWrapper.getBoundingClientRect();
                            var pos = [e.clientX - rect.left, e.clientY - rect.top];
                            self.popMenuDom.style.left = pos[0] + "px";
                            self.popMenuDom.style.top = pos[1] + "px";
                        }
                    };
                },
                popDomGet: function () {
                    var popHtml = "<ul class=\"pcTableMenu list-group col-menu\" style=\"position: absolute;z-index: 3\"></ul>";
                    return d.create(popHtml);
                },
                listDomGet: function (popMenu) {
                    return popMenu;
                },
                btnHtmlGet: function (btns) {
                    var itemsHtml = { val: "" };
                    var btnSelector = 'data-action="tableMenuBtn"';
                    function getChildDom(btns, itemsHtml) {
                        if (btns && btns.length > 0) {
                            for (var i = 0; i < btns.length; i++) {
                                var attr = "data-index=\"" + i + "\" " + btnSelector;
                                itemsHtml.val += "<li class=\"list-group-item listItem\" " + attr + ">" + btns[i].title;
                                if (btns[i].children && (btns[i].children.length > 0)) {
                                    itemsHtml.val += '<span style="position:absolute; top: 8px; right: 4px;">></span>';
                                    itemsHtml.val += '<ul class="pcTableMenu list-group col-menu ul-list">';
                                    getChildDom(btns[i].children, itemsHtml);
                                    itemsHtml.val += '</ul>';
                                }
                                itemsHtml.val += '</li>';
                            }
                        }
                    }
                    getChildDom(btns, itemsHtml);
                    return itemsHtml.val;
                },
                show: function () {
                    self.popMenuDom.style.display = 'block';
                },
                hide: function () {
                    self.popMenuDom.style.display = 'none';
                },
                init: function () {
                    // document.body.appendChild(this.popMenuDom);
                    self.tableWrapper.appendChild(self.popMenuDom);
                    d.on(document, 'click', function () {
                        self.popMenu.hide();
                        // self.rowDeselect();
                    });
                }
            };
        };
        // private trClick = (() => {
        //     let self = this;
        //
        // })();
        // private rowEditInit(tr : HTMLTableRowElement){
        //     let self = this,
        //         rowData = self.rowDataGet(parseInt(tr.dataset.index)),
        //         confirm =  self.rowEditConfirmInit();
        //
        //     confirm.show(tr);
        //     self.editRow = tr;
        //     self.lockRowApply(tr, (t)=>{
        //
        //         let tds : NodeListOf<HTMLTableCellElement> = t.querySelectorAll('td');
        //         t.classList.add('edit');
        //         for(let i = 0, td:HTMLTableCellElement = null; td = tds.item(i); i++){
        //             // t.replaceChild(tools)
        //
        //             td.innerHTML = `<input data-col="${td.dataset.col}" value="${tools.str.htmlEncode(rowData[td.dataset.col])}">`;
        //         }
        //
        //         self.theadWidthCache();
        //         self.theadSizeSync();
        //     });
        // }
        //
        // private rowEditConfirmInit = (function(self){
        //     let dom = d.createByHTML('<ul class="pcTableConfirm list-group col-menu row">' +
        //         '<li class="col-xs-6 list-group-item" data-action="confirm"><span class="iconfont icon-dagou"></span></li>' +
        //         '<li class="col-xs-6 list-group-item" data-action="cancel"><span class="iconfont icon-close"></span></li></ul>');
        //
        //     document.body.appendChild(dom);
        //     $(dom).on('click', '[data-action]', function () {
        //         switch (this.dataset.action){
        //             case 'confirm':
        //                 let data :any = {},
        //                     inputs:NodeListOf<HTMLInputElement> = self.editRow.querySelectorAll('input');
        //                 for(let i = 0, input:HTMLInputElement = null; input = inputs.item(i); i++){
        //                     let value = input.value;
        //                     data[input.dataset.col] = value === '' ? null : value;
        //                 }
        //
        //                 let newRow = self.rowCreate(data, parseInt( self.editRow.dataset.index ) );
        //                 self.rowReplace(newRow, self.editRow);
        //
        //                 self.theadWidthCache();
        //                 self.theadSizeSync();
        //
        //                 hide();
        //
        //                 // TODO 数据更新
        //                 break;
        //             case 'cancel':
        //                 hide();
        //
        //                 break;
        //         }
        //     });
        //     let domHeight = 0;
        //
        //     function getHeight(){
        //         if(domHeight === 0){
        //             domHeight = dom.offsetHeight;
        //         }
        //         return domHeight;
        //     }
        //
        //     function hide(){
        //         dom.style.display = 'none';
        //         self.editBtn.classList.remove('hide');
        //     }
        //     return function () {
        //         return {
        //             show : function(tr:HTMLTableRowElement){
        //                 let rect = tr.getBoundingClientRect();
        //                 dom.style.left = rect.left + 'px';
        //                 dom.style.display= 'block';
        //                 dom.style.top = (rect.top  + document.body.scrollTop - getHeight() +1)+ 'px';
        //
        //                 self.editBtn.classList.add('hide');
        //             },
        //             hide: function(){
        //                 hide();
        //             }
        //         };
        //     };
        // }(this));
        PcTable.prototype.lockScreen = function () {
        };
        ;
        PcTable.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return PcTable;
    }(basicTable_1.BasicTable));
    exports.PcTable = PcTable;
});

define("Scrollbar", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Scrollbar" />
    var tools = G.tools;
    var d = G.d;
    var Scrollbar = /** @class */ (function () {
        /**
         * 构造函数
         */
        function Scrollbar(paraConf) {
            this.scrollType = ''; // 滚动类型  bar：滚动条滚动  def：容器dom滚动
            this.bindEvent = (function (self) {
                var timeout, el;
                // 滚动条超出显示范围隐藏
                function checkHide() {
                    var result = true, scrollTop = tools.scrollTop(), clientHeight = document.documentElement.clientHeight, scrollbarTop = scrollTop + clientHeight - self.conf.bottom;
                    //console.log('====>', scrollbarTop, self.elOffsetTop, self.elHeight);
                    if (scrollbarTop > self.elOffsetTop + self.elHeight || // 超过下边界
                        scrollbarTop < self.elOffsetTop // 超过上边界
                    ) {
                        result = false;
                    }
                    if (result) {
                        self.panelWrapper.style.display = 'block';
                    }
                    else {
                        self.panelWrapper.style.display = 'none';
                    }
                }
                // 内嵌
                function checkContainerHide() {
                    var result = true, containerHeight = self.conf.Container.scrollHeight, offsetHeight = self.conf.Container.offsetHeight, clientHeight = containerHeight - self.conf.marginBottom, scrollbarTop = self.conf.Container.scrollTop + offsetHeight;
                    // console.log(self.conf.Container.scrollHeight)
                    if (clientHeight < offsetHeight ||
                        scrollbarTop - self.conf.bottom > clientHeight // 超过下边界
                    ) {
                        result = false;
                    }
                    /*if(
                        scrollbarTop>self.elOffsetTop+self.elHeight ||  // 超过下边界
                        scrollbarTop<self.elOffsetTop     // 超过上边界
                    ) {
                        result = false;
                    }*/
                    if (result) {
                        self.panelWrapper.style.width = el.offsetWidth + "px";
                        self.panelWrapper.style.top = scrollbarTop - 12 - self.conf.bottom + "px";
                        self.panelWrapper.style.display = 'block';
                        self.panelWrapper.scrollLeft = el.scrollLeft;
                    }
                    else {
                        self.panelWrapper.style.display = 'none';
                    }
                }
                function checkFunc() {
                    if (self.conf.Container) {
                        checkContainerHide();
                    }
                    else {
                        checkHide();
                    }
                }
                // type: 是否纵向滚动
                function updateStyle(type) {
                    if (type === void 0) { type = false; }
                    if (!self.styleThrottle) {
                        self.styleThrottle = self.throttle(1000, function (type) {
                            self.panelInner.style.width = el.scrollWidth + "px";
                            if (self.conf.Container) {
                                // 内容器
                                self.elOffsetTop = 0;
                                self.elHeight = el.offsetHeight - self.conf.marginBottom;
                                self.panelWrapper.style.left = tools.offset.left(el) - tools.offset.left(self.conf.Container) + "px";
                            }
                            else {
                                self.elOffsetTop = tools.offset.top(el);
                                self.elHeight = el.offsetHeight;
                            }
                            type || checkFunc();
                        });
                    }
                    type && checkFunc();
                    self.styleThrottle(type);
                }
                function elScrollXHandle() {
                    if (self.scrollType === '' || self.scrollType === 'def') {
                        self.scrollType = 'def';
                        timeout && clearTimeout(timeout);
                        timeout = setTimeout(function () {
                            self.scrollType = '';
                        }, 100);
                        //  console.log(self.panelWrapper)
                        updateStyle();
                        self.panelWrapper.style.display === 'block' && (self.panelWrapper.scrollLeft = el.scrollLeft);
                    }
                }
                function barScrollXHandle() {
                    if (self.scrollType === '' || self.scrollType === 'bar') {
                        self.scrollType = 'bar';
                        timeout && clearTimeout(timeout);
                        timeout = setTimeout(function () {
                            self.scrollType = '';
                        }, 100);
                        el.scrollLeft = self.panelWrapper.scrollLeft;
                    }
                }
                var scrollYHandle = function () {
                    updateStyle(true);
                };
                var init = function () {
                    el = self.conf.el;
                    d.on(el, 'scroll', elScrollXHandle);
                    d.on(self.panelWrapper, 'scroll', barScrollXHandle);
                    if (self.conf.Container) {
                        setTimeout(function () {
                            scrollYHandle();
                        }, 0);
                        d.on(self.conf.Container, 'scroll', scrollYHandle);
                        d.on(window, 'resize', function () {
                            scrollYHandle();
                        });
                        //d.on(window, 'scroll', scrollYHandle);
                    }
                    else {
                        d.on(window, 'scroll', scrollYHandle);
                    }
                };
                return { scrollYHandle: scrollYHandle, init: init };
            })(this);
            var self = this, defaultConf = {
                el: null,
                Container: null,
                bottom: 0,
                marginBottom: 0 // 当有滚动外框，设置内容区下边距(场景：表格下出现加载中...的情况)
            };
            self.conf = tools.obj.merge(defaultConf, paraConf);
            this.create();
            this.bindEvent.init();
        }
        // 节流
        Scrollbar.prototype.throttle = function (delay, action) {
            var last = 0;
            return function () {
                var curr = +new Date();
                if (curr - last > delay) {
                    action.apply(this, arguments);
                    last = curr;
                }
            };
        };
        Scrollbar.prototype.updateStyle = function () {
            this.bindEvent.scrollYHandle();
        };
        Scrollbar.prototype.setConfBottom = function (bottom) {
            this.conf.bottom = bottom;
            this.updateStyle();
        };
        Scrollbar.prototype.create = function () {
            var self = this;
            function createStyle() {
                var style = document.createElement('style'), styleContent;
                style.setAttribute('type', 'text/css');
                styleContent = "\n            .sbarWrapper{ height: 12px; position: fixed; overflow-x: auto; overflow-y: hidden; z-index:10;}\n            .sbarWrapper::-webkit-scrollbar{ width: 8px; height: 8px;}\n            .sbarWrapper::-webkit-scrollbar-thumb{ width: 8px; height: 8px;border-radius: 4px;background-color: #7f7f7f;}\n            .sbarWrapper div{height:12px;}\n        ";
                style.innerHTML = styleContent;
                if (self.conf.Container) {
                    self.conf.Container.style.position = 'relative';
                }
                document.body.appendChild(style);
            }
            function createWrapper() {
                var el = self.conf.el;
                self.panelInner = document.createElement('div');
                self.panelWrapper = d.create('<div class="sbarWrapper"></div>');
                self.panelWrapper.style.width = el.offsetWidth + "px";
                self.panelInner.style.width = el.scrollWidth + "px";
                self.panelWrapper.appendChild(self.panelInner);
                if (self.conf.Container) {
                    //self.panelInner.style.width = `${el.scrollWidth}px`;
                    self.panelWrapper.style.position = 'absolute';
                    self.panelWrapper.style.paddingTop = '0px';
                    self.panelWrapper.style.paddingBottom = '0px';
                    self.conf.Container.appendChild(self.panelWrapper);
                }
                else {
                    self.panelWrapper.style.left = tools.offset.left(el) + "px";
                    self.panelWrapper.style.bottom = self.conf.bottom + "px";
                    document.body.appendChild(self.panelWrapper);
                }
            }
            createStyle();
            createWrapper();
        };
        return Scrollbar;
    }());
    exports.Scrollbar = Scrollbar;
});

define("TableImgEdit", ["require", "exports", "Modal", "UploadModule", "Button"], function (require, exports, Modal_1, uploadModule_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="TableImgEdit"/>
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    var TableImgEdit = /** @class */ (function () {
        function TableImgEdit(para) {
            // set onUploaded(handler: IEditImgModuleUploadHandler) {
            //     this._onUploaded = handler;
            // }
            // get onUploaded(){
            //     return this._onUploaded;
            // }
            this.modal = null;
            this.imgs = [];
            // this.pictures = para.pictures;
            this.fields = para.fields;
            this.thumbField = para.thumbField;
            this.deletable = para.deletable;
            this.updatable = para.updatable;
            this.onUploaded = para.onUploaded;
            this.onSave = para.onSave;
            this.modalInit();
        }
        TableImgEdit.prototype.modalInit = function () {
            var _this = this;
            var doc = document.createDocumentFragment();
            this.fields.forEach(function (field, i) {
                // let pic = this.pictures[i];
                doc.appendChild(_this.imgWrapperGet(field, i));
            });
            this.imgs = d.queryAll('img', doc);
            this.modal = new Modal_1.Modal({
                header: '图片查看',
                width: '700px',
                body: doc
            });
        };
        TableImgEdit.prototype.imgWrapperGet = function (field, imgIndex) {
            var _this = this;
            var nameField = field.name, wrapper = d.create("<div class=\"table-img-wrapper\" data-field=\"" + nameField + "\">" +
                '<div class="table-img-wrapper-btns"></div>' +
                ("<div class=\"table-img\"><img data-index=\"" + imgIndex + "\" style=\"max-height:500px;max-width:700px\"></div>") +
                '</div>');
            if (!this.updatable && !this.deletable) {
                return wrapper;
            }
            var btnWrapper = d.query('.table-img-wrapper-btns', wrapper), img = d.query('img', wrapper);
            if (this.updatable) {
                var imgContainer = d.create('<div class="table-img-uploader"></div>');
                d.append(btnWrapper, imgContainer);
                new uploadModule_1.default({
                    nameField: nameField,
                    thumbField: this.thumbField,
                    container: imgContainer,
                    text: '选择图片',
                    accept: {
                        title: '图片',
                        extensions: 'jpg,png,gif',
                        mimeTypes: 'image/*'
                    },
                    uploadUrl: CONF.ajaxUrl.fileUpload,
                    showNameOnComplete: false,
                    onComplete: function (response, file) {
                        var data = response.data, md5Data = {};
                        for (var fieldKey in data) {
                            md5Data[data[fieldKey].key] = data[fieldKey].value;
                        }
                        // let src = imgUrlCreate(file.name),
                        //     index = this.currentKeyField;
                        //
                        // img.src = src;
                        // this.newKeyFieldImgs[index] = this.newKeyFieldImgs[index] || [];
                        // this.newKeyFieldImgs[index][imgIndex] = src;
                        // let src = ;
                        // debugger;
                        img.src = _this.imgUrlCreate(md5Data[nameField]);
                        tools.isFunction(_this.onUploaded) && _this.onUploaded(md5Data);
                        // saveBtn.isDisabled = false;
                    }
                });
            }
            if (this.deletable) {
                new Button_1.Button({
                    content: '删除图片',
                    container: btnWrapper,
                    onClick: function () {
                        var _a;
                        // this.md5s[nameField] = '';
                        img.src = '';
                        tools.isFunction(_this.onUploaded) && _this.onUploaded((_a = {}, _a[nameField] = '', _a));
                    }
                });
            }
            // let saveBtn = new Button({
            //     content: '保存图片',
            //     container: btnWrapper,
            //     isDisabled: true,
            //     onClick: () => {
            //         // debugger;
            //         tools.isFunction(this.onSave) && this.onSave();
            //         saveBtn.isDisabled = true;
            //     }
            // });
            // let imgUrlCreate = (fileName: string) => {
            //     return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
            //         name_field: nameField,
            //         md5_field: 'FILE_ID',
            //         file_id: this.md5s[nameField],
            //         [nameField]: fileName,
            //         down: 'allow'
            //
            //     });
            // };
            return wrapper;
        };
        TableImgEdit.prototype.imgUrlCreate = function (md5) {
            return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                // name_field: nameField,
                md5_field: 'FILE_ID',
                file_id: md5,
                // [nameField]: fileName,
                down: 'allow'
            });
        };
        Object.defineProperty(TableImgEdit.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (flag) {
                this._isShow = !!flag;
                this.modal && (this.modal.isShow = this._isShow);
            },
            enumerable: true,
            configurable: true
        });
        // private keyFieldImgs:objOf<string[]> = {};
        // private newKeyFieldImgs: objOf<string[]> = {};
        //
        // indexSet(keyField:string, pics:string[]) {
        //     if(!this.keyFieldImgs[keyField]){
        //         this.keyFieldImgs[keyField] = pics;
        //     }
        //
        //     let newImgs = this.newKeyFieldImgs[keyField] || [];
        //     this.imgs.forEach((img, i) => img.src = newImgs[i] || pics[i]);
        //     this.currentKeyField = keyField;
        // }
        //
        // private currentKeyField = '';
        TableImgEdit.prototype.showImg = function (urls, md5s) {
            var _this = this;
            // debugger;
            this.imgs.forEach(function (img, i) {
                img.src = md5s[i] ? _this.imgUrlCreate(md5s[i]) : urls[i];
                // img.src = md5s[i] ? this.imgUrlCreate(md5s[i]) : tools.url.addObj(urls[i], {'_': Date.now()});
            });
        };
        return TableImgEdit;
    }());
    exports.TableImgEdit = TableImgEdit;
});

/// <amd-module name="TableEdit"/>
define("TableEdit", ["require", "exports", "Modal", "Tooltip", "Loading", "BwRule"], function (require, exports, Modal_1, tooltip_1, loading_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var TableEdit = /** @class */ (function () {
        function TableEdit(p) {
            this.p = p;
            this.isEditing = false;
            this.inMain = true;
            this.tm = p.tm;
        }
        TableEdit.prototype.canRowInit = function (isMain, rowData) {
            if (isMain) {
                return !(rowData && (rowData['EDITEXPRESS'] === 0));
            }
            else {
                var mainRowData = this.tm.table.rowSelectDataGet()[0];
                return this.canRowInit(true, mainRowData);
            }
        };
        Object.defineProperty(TableEdit.prototype, "subTm", {
            get: function () {
                return this._subTm;
            },
            set: function (subTm) {
                var _this = this;
                if (subTm) {
                    this._subTm = subTm;
                    this.mainSub(function (tm, isMain) {
                        d.on(tm.table.wrapperGet(), 'click', function () {
                            _this.inMain = isMain;
                            if (typeof _this.onFocusChangeHandler === 'function') {
                                _this.onFocusChangeHandler(isMain);
                            }
                        });
                    });
                }
            },
            enumerable: true,
            configurable: true
        });
        TableEdit.prototype.init = function (callback) {
            var p = this.p, tableAddr = p.tableAddr, _a = getMainSubVarList(tableAddr), mainVarList = _a.mainVarList, subVarList = _a.subVarList;
            if (!editVarHas(mainVarList, ['update', 'insert']) && !editVarHas(subVarList, ['update', 'insert'])) {
                typeof callback === 'function' && callback();
                return;
            }
            this.editModuleLoad(callback);
        };
        TableEdit.prototype.editModuleLoad = function (callback) {
            var _this = this;
            this.mainSub(function (tm) {
                tm.table.edit.init();
                tm.table.wrapperGet().classList.add('disabled');
            });
            require(['EditModule'], function (edit) {
                // editVarHas()
                var promises = [];
                _this.mainSub(function (tm, isMain, index, len) {
                    promises.push(_this.initEditModule(edit.EditModule, tm)
                        .then(function () {
                        tm.table.wrapperGet().classList.remove('disabled');
                    }));
                });
                Promise.all(promises).then(function () {
                    typeof callback === 'function' && callback();
                });
                tools.event.fire('editChange', { status: 1 }, _this.tm.wrapper);
                _this.isEditing = true;
            });
        };
        TableEdit.prototype.initEditModule = function (EditModule, tm) {
            var _this = this;
            var table = tm.table, defData = tm.defaultData, pasteExceptCols = [tm.getKeyField()], defUrl = tm.getDefAddr();
            var init = function (defData) {
                var editModule = new EditModule({
                    auto: false,
                    type: 'table',
                    fields: _this.p.cols.map(function (f) {
                        return {
                            dom: null,
                            field: f
                        };
                    })
                });
                var comInit = function (td, trData, col) {
                    var _a;
                    td.innerHTML = '';
                    // debugger;
                    editModule.init(col.name, {
                        dom: td,
                        data: trData,
                        field: col,
                        onExtra: function (data, relateCols, isEmptyClear) {
                            // console.log(data);
                            if (isEmptyClear === void 0) { isEmptyClear = false; }
                            // debugger;
                            // 如果找不到assign， 则删除本身
                            if (tools.isEmpty(data) && isEmptyClear) {
                                table.edit.modifyTd(td, '');
                                return;
                            }
                            relateCols.forEach(function (key) {
                                var _a;
                                if (key === col.name) { //|| (!tools.isEmpty(trData[key]) && tools.isEmpty(data[key]))
                                    return;
                                }
                                var assignTd = getSiblingTd(td, key), dataStr = tools.str.toEmpty(data[key]);
                                if (assignTd) {
                                    table.edit.modifyTd(assignTd, dataStr);
                                }
                                else {
                                    table.edit.rowData(parseInt(td.parentElement.dataset.index), (_a = {}, _a[key] = dataStr, _a));
                                }
                            });
                        }
                    });
                    editModule.set((_a = {},
                        _a[col.name] = trData[col.name],
                        _a));
                    var input = td.querySelector('input');
                    if (input) {
                        input.select();
                    }
                };
                var validate = function (td, col, rowData, callback) {
                    // debugger;
                    var name = col.name, result = editModule.validate.start(name);
                    var errorStyle = function (colName, el, msg) {
                        var visibleCols = table.getVisibleCol(), isLastCol = visibleCols.indexOf(colName) > visibleCols.length / 2;
                        new tooltip_1.Tooltip({
                            visible: false,
                            errorMsg: msg,
                            el: el,
                            length: 'medium',
                            pos: isLastCol ? 'left' : 'right'
                        });
                    };
                    if (result && result[name]) {
                        errorStyle(name, getSiblingTd(td, name), result[name].errMsg);
                        callback(td, false);
                    }
                    else if (col.chkAddr && !tools.isEmpty(rowData[col.name])) {
                        EditModule.checkValue(col, rowData, function () { return table.edit.modifyTd(td, ''); })
                            .then(function (res) {
                            // debugger;
                            if (res.errors) {
                                res.errors.forEach(function (err) {
                                    var el = getSiblingTd(td, err.name);
                                    if (el) {
                                        errorStyle(err.name, el, err.msg);
                                        callback(el, false);
                                    }
                                });
                            }
                            if (res.okNames) {
                                res.okNames.forEach(function (name) {
                                    var el = getSiblingTd(td, name);
                                    if (el) {
                                        tooltip_1.Tooltip.clear(el);
                                        callback(el, true);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        callback(td, true);
                    }
                };
                table.edit.initModify({
                    defData: defData,
                    pasteExceptCols: pasteExceptCols,
                    comInit: comInit,
                    validate: validate,
                    comDestroy: function (col) {
                        var _a;
                        var name = col.name;
                        editModule.set((_a = {}, _a[name] = editModule.get(name)[name], _a));
                        editModule.destroy(name);
                    },
                    valGet: function (c) { return editModule.get(c.name); },
                    canInit: function (c, type) {
                        return type === 1 ? !c.noModify : !c.noEdit;
                    },
                    canRowInit: function (data) {
                        return _this.canRowInit(!tm.isSub, tm.isSub ? null : data);
                        //当为0时不可编辑
                    }
                });
            };
            function getSiblingTd(td, colName) {
                return d.query("td[data-col=\"" + colName + "\"]", td.parentElement);
            }
            return new Promise((function (resolve, reject) {
                if (tools.isNotEmpty(defUrl)) {
                    var data_1 = {};
                    Promise.all(defUrl.map(function (url) {
                        return BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + BwRule_1.BwRule.reqAddr(url))
                            .then(function (_a) {
                            var response = _a.response;
                            data_1 = Object.assign(data_1, defData, response.data[0] || {});
                            // cb();
                        });
                    })).then(function () {
                        init(data_1);
                        resolve();
                    });
                }
                else {
                    init(defData);
                    // cb();
                    resolve();
                }
            }));
        };
        /**
         * 主表从表执行相同动作
         * @param {(tm: TableModule, isMain: boolean) => void} fun
         * @param {boolean} inEditing - 判断是否能够进入编辑模式
         */
        TableEdit.prototype.mainSub = function (fun, inEditing) {
            if (inEditing === void 0) { inEditing = true; }
            var len = 0, hasMain = false, hasSub = false, _a = inEditing ? getMainSubVarList(this.p.tableAddr) : { mainVarList: null, subVarList: null }, mainVarList = _a.mainVarList, subVarList = _a.subVarList;
            if (this.tm && (inEditing ? editVarHas(mainVarList, ['insert', 'update']) : true)) {
                hasMain = true;
                len++;
            }
            if (this.subTm && (inEditing ? editVarHas(subVarList, ['insert', 'update']) : true)) {
                len++;
                hasSub = true;
            }
            if (hasMain) {
                fun(this.tm, true, 0, len);
            }
            if (hasSub) {
                fun(this.subTm, false, hasMain ? 1 : 0, len);
            }
        };
        TableEdit.prototype.checkError = function () {
            var table = this.tm.table, subTable = this.subTm ? this.subTm.table : null;
            var errorLen = table.edit.errorLen();
            if (errorLen > 0) {
                Modal_1.Modal.alert((subTable ? '主表' : '') + "\u6709" + errorLen + "\u4E2A\u9519\u8BEF\u9700\u8981\u4FEE\u6539");
                return false;
            }
            if (subTable) {
                errorLen = subTable.edit.errorLen();
                if (errorLen > 0) {
                    Modal_1.Modal.alert("\u4ECE\u8868\u6709" + errorLen + "\u4E2A\u9519\u8BEF\u9700\u8981\u4FEE\u6539");
                    return false;
                }
            }
            return true;
        };
        TableEdit.prototype.getData = function (tableData, varList) {
            var postData = {};
            varList && ['update', 'delete', 'insert'].forEach(function (key) {
                var dataKey = varList[key + "Type"];
                if (varList[key] && tableData[dataKey][0]) {
                    // 数字类型空转0
                    // this.p.cols.forEach(col => {
                    //     if(BwRule.isNumber(col.atrrs.dataType)){
                    //         tableData[dataKey].forEach(data => {
                    //             if(tools.isEmpty(data[col.name])) {
                    //                 data[col.name] = 0;
                    //             }
                    //         });
                    //     }
                    // });
                    var data = BwRule_1.BwRule.varList(varList[key], tableData[dataKey], true);
                    if (data) {
                        postData[key] = data;
                    }
                }
            });
            if (!tools.isEmpty(postData)) {
                postData.itemId = varList.itemId;
            }
            return postData;
        };
        ;
        Object.defineProperty(TableEdit.prototype, "ctm", {
            get: function () {
                return this.inMain ? this.tm : this.subTm;
            },
            enumerable: true,
            configurable: true
        });
        TableEdit.prototype.cancel = function () {
            if (this.isEditing) {
                this.mainSub(function (tm) { return tm.table.edit.cancel(); });
                this.isEditing = false;
                // setTimeout(() => {
                //     debugger;
                this.tm.wrapper.classList.remove('disabled');
                tools.event.fire('editChange', { status: 0 }, this.tm.wrapper);
                // this.tm.wrapper.classList.add('disabled');
                // }, 500);
            }
        };
        ;
        TableEdit.prototype.save = function (callback) {
            var _this = this;
            var postData = {
                param: []
            }, _a = getMainSubVarList(this.p.tableAddr), mainVarList = _a.mainVarList, subVarList = _a.subVarList;
            this.mainSub(function (tm) { return tm.table.edit.reshowEditing(); });
            // 错误提示
            if (!this.checkError()) {
                return;
            }
            var loading = new loading_1.Loading({
                msg: '保存中',
                disableEl: this.tm.wrapper
            });
            // 等待assign, 临时做法
            setTimeout(function () {
                _this.mainSub(function (tm, isMain) {
                    var mainData = _this.tm.table.rowSelectDataGet()[0];
                    var editData = tm.table.edit.getData();
                    if (!isMain) {
                        var _loop_1 = function (key) {
                            var subData = editData[key][0];
                            if (subData) {
                                editData[key].forEach(function (obj, i) {
                                    editData[key][i] = tools.obj.merge(mainData, obj);
                                });
                            }
                        };
                        for (var key in editData) {
                            _loop_1(key);
                        }
                    }
                    var data = _this.getData(editData, isMain ? mainVarList : subVarList);
                    tm.table.edit.reshowEditing();
                    if (!tools.isEmpty(data)) {
                        postData.param.push(data);
                    }
                }, false);
                if (!tools.isEmpty(postData.param)) {
                    BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + _this.p.tableAddr.dataAddr, {
                        type: 'POST',
                        data: postData,
                    }).then(function (_a) {
                        // debugger;
                        var response = _a.response;
                        BwRule_1.BwRule.checkValue(response, postData, function () {
                            // debugger;
                            _this.mainSub(function (tm) {
                                // tm.table.edit.cancel();
                                if (document.body.classList.contains('mui-android-4')) {
                                    sys.window.load(location.href);
                                }
                                else {
                                    tm.tableData.refresh(null, function () {
                                        tm.aggregate.get();
                                        tools.event.fire('table-edit-saved', null, _this.tm.wrapper);
                                    });
                                }
                            });
                            Modal_1.Modal.toast(response.msg);
                            callback && callback();
                            _this.cancel();
                        });
                    }).finally(function () {
                        loading.destroy();
                    });
                }
                else {
                    // table.edit.save();
                    loading.destroy();
                    _this.cancel();
                    Modal_1.Modal.toast('没有数据改变');
                    callback && callback();
                }
            }, 1800);
        };
        ;
        TableEdit.prototype.add = function (obj) {
            if (this.inMain) {
                this.tm.table.edit.addRow(obj);
            }
            else {
                this.subTm.table.edit.addRow(obj);
            }
        };
        TableEdit.prototype.del = function () {
            var _this = this;
            var subTable = this.subTm ? this.subTm.table : null;
            if (!subTable || tools.isEmpty(subTable.data.get())) {
                this.tm.table.edit.deleteRow(function (data) { return _this.canRowInit(_this.tm.isSub, _this.tm.isSub ? null : data); });
            }
            else if (subTable && !tools.isEmpty(subTable.rowSelectDataGet())) {
                subTable.edit.deleteRow(function (data) { return _this.canRowInit(_this.tm.isSub, _this.tm.isSub ? null : data); });
            }
            else {
                Modal_1.Modal.alert('不能删除有明细的主表数据');
            }
        };
        ;
        TableEdit.prototype.getStatus = function () {
            return this.isEditing;
        };
        TableEdit.prototype.onFocusChange = function (cb) {
            this.onFocusChangeHandler = cb;
        };
        TableEdit.prototype.reshowEditing = function () {
            this.ctm && this.ctm.table.edit.reshowEditing();
        };
        TableEdit.prototype.rowData = function (index, data) {
            return this.ctm && this.ctm.table.edit.rowData(index, data);
        };
        return TableEdit;
    }());
    exports.TableEdit = TableEdit;
    function editVarHas(varList, hasTypes) {
        var types = ['update', 'insert', 'delete'];
        if (varList) {
            for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                var t = types_1[_i];
                if (hasTypes.indexOf(varList[t + "Type"]) > -1) {
                    return true;
                }
            }
        }
        return false;
    }
    function getMainSubVarList(addr) {
        var varlist = {
            mainVarList: null,
            subVarList: null,
        };
        addr && Array.isArray(addr.param) && addr.param.forEach(function (p) {
            if (p.type === 'sub') {
                varlist.subVarList = p;
            }
            else if (p.type === 'main') {
                varlist.mainVarList = p;
            }
        });
        return varlist;
    }
});

define("TableModulePc", ["require", "exports", "TableModule", "Spinner", "Modal", "PcTable", "Scrollbar", "Affix", "InputBox", "Button", "TextInput", "DropDown"], function (require, exports, tableModule_1, spinner_1, Modal_1, pcTable_1, scrollbar_1, Affix_1, InputBox_1, Button_1, text_1, dropdown_1) {
    "use strict";
    var tools = G.tools;
    var sys = BW.sys;
    var d = G.d;
    return /** @class */ (function (_super) {
        __extends(TableModulePc, _super);
        function TableModulePc() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.onLoad = (function (self) {
                var scrollBar = null, bottomPaging = null;
                var init = function () {
                    if (!scrollBar && !self.isDrill || (!bottomPaging && !self.isDrill)) {
                        var container_1 = self.tableConf.scrollEl;
                        var bottomPag = d.query('.sbarWrapper', container_1);
                        bottomPag && container_1.removeChild(bottomPag);
                        var scrollEl_1 = self.table['tableMiddle'];
                        var bottom = d.query('.table-out-bottom', self.wrapper);
                        var bottomSize = bottom ? bottom.offsetHeight + 23 : 23;
                        if (container_1.classList.contains('main-table')) {
                            var topHeight_1 = d.query('.topBtns', container_1).offsetHeight;
                            var aggrWrapper_1 = d.query('.aggr-wrapper', container_1);
                            setTimeout(function () {
                                var wrapperHeight = d.query('.mobileTableWrapper', container_1).offsetHeight;
                                var tableHeight = aggrWrapper_1 ? container_1.offsetHeight - wrapperHeight - 38 - 12 : container_1.offsetHeight - topHeight_1 - wrapperHeight - 12;
                                scrollEl_1.style.paddingBottom = tableHeight + 'px';
                            }, 0);
                        }
                        var scrollBarPara = {
                            el: scrollEl_1,
                            Container: container_1,
                            marginBottom: bottomSize
                        };
                        if (bottom) {
                            scrollBarPara['bottom'] = bottom.offsetHeight + 10;
                            scrollBar = new scrollbar_1.Scrollbar(scrollBarPara);
                            setStyle(bottom, container_1);
                            bottomPaging = new Affix_1.Affix({
                                el: bottom,
                                target: container_1
                            });
                        }
                        else {
                            scrollBar = new scrollbar_1.Scrollbar(scrollBarPara);
                        }
                        //target大小变化调整事件
                        var resizeEvent = function () {
                            var element = container_1, lastWidth = element.offsetWidth, lastHeight = element.offsetHeight, lastInner = element.innerHTML;
                            setInterval(function () {
                                if (lastInner !== element.innerHTML) {
                                    scrollBar.updateStyle();
                                    lastInner = element.innerHTML;
                                }
                                if (lastWidth === element.offsetWidth && lastHeight === element.offsetHeight) {
                                    return;
                                }
                                scrollBar.updateStyle();
                                lastWidth = element.offsetWidth;
                                lastHeight = element.offsetHeight;
                            }, 100);
                        };
                        resizeEvent();
                        setTopBtns();
                    }
                };
                var getBottomPaging = function () {
                    return bottomPaging;
                };
                var setTopBtns = function () {
                    var container = self.tableConf.scrollEl;
                    var topBtns = d.query('.topBtns', container);
                    var aggrWrapper = d.query('.aggr-wrapper', container);
                    var breadcrumb = d.query('.breadcrumb', container);
                    var btnsHei = topBtns ? topBtns.offsetHeight : 0;
                    var aggrHei = aggrWrapper ? aggrWrapper.offsetHeight : 0;
                    var breadcrumbHei = breadcrumb ? breadcrumb.offsetHeight : 0;
                    topBtns && (topBtns.style.width = '100%');
                    topBtns && (topBtns.style.backgroundColor = 'rgb(247,247,248)');
                    if (aggrWrapper) {
                        container.style.paddingTop = btnsHei + aggrHei + breadcrumbHei + "px";
                    }
                    if (topBtns && aggrWrapper) {
                        new Affix_1.Affix({
                            el: topBtns,
                            target: container,
                            offsetTop: 0
                        });
                        /**ToDo
                         * 临时做法   先将顶部导航也固定住
                         */
                        breadcrumb && new Affix_1.Affix({
                            el: breadcrumb,
                            target: container,
                            offsetTop: 0
                        });
                    }
                    if (aggrWrapper) {
                        new Affix_1.Affix({
                            el: aggrWrapper,
                            target: container,
                            offsetTop: topBtns ? 24 : 0
                        });
                    }
                };
                var setStyle = function (pagDom, container) {
                    var pagDomSty = pagDom.style;
                    pagDomSty.backgroundColor = 'rgb(247,247,248)';
                    pagDomSty.textAlign = 'center';
                    pagDomSty.width = '100%';
                    var height = container.classList.contains('main-table') ||
                        container.classList.contains('sub-table') ||
                        container.classList.contains('privilege-select-content')
                        ? pagDom.offsetHeight + 9 : pagDom.offsetHeight + 14;
                    container.style.paddingBottom = height + 'px';
                };
                var getscrollBar = function () {
                    return scrollBar;
                };
                return { getscrollBar: getscrollBar, init: init, getBottomPaging: getBottomPaging };
            })(_this);
            _this.rightBtns = (function () {
                var rightBtns = _this.wrapper.querySelector('.topBtns .btn-group.btnsRight'), buttonExport = null, buttonExportSta = null, formPriBut = null;
                var inputBox = new InputBox_1.InputBox({
                    container: rightBtns
                });
                var init = function () {
                    if (!_this.para.isSub) {
                        var but_1 = null;
                        var dropJson = [{ content: '导出', icon: 'daochu2', type: 'default' },
                            { content: '统计', icon: 'tongji', type: 'default' }];
                        var exportStaBut = [{ content: '列统计', icon: 'pinlei', type: 'default', onClick: function () { _this.statistic.initCount(but_1.wrapper); } },
                            { content: '数据统计', icon: 'statistic', type: 'default', onClick: function () { _this.statistic.initStatistic(but_1.wrapper); } },
                            { content: '图形报表', icon: 'bingzhuangtu', type: 'default', onClick: function () { _this.statistic.initChart(but_1.wrapper); } },
                            { content: '交叉制表', icon: 'shejiqijiaohuanxinglie', type: 'default', onClick: function () { _this.statistic.initCrosstab(but_1.wrapper); } },
                            { content: 'abc分析', icon: 'tongji', type: 'default', onClick: function () { _this.statistic.initAnalysis(but_1.wrapper); } }];
                        var exportBut = [{ content: 'csv', icon: 'csv1', type: 'default', onClick: function () { return _this.export('csv'); } },
                            { content: 'excel', icon: 'excel', type: 'default', onClick: function () { return _this.export('xls'); } },
                            { content: 'word', icon: 'word', type: 'default', onClick: function () { return _this.export('doc'); } },
                            { content: 'pdf', icon: 'pdf', type: 'default', onClick: function () { _this.export('pdf'); } },
                            { content: 'png', icon: 'png', type: 'default', onClick: function () { _this.export('image'); } }];
                        buttonExport = new Button_1.Button(dropJson[0]);
                        buttonExportSta = new Button_1.Button(dropJson[1]);
                        buttonExport.dropDown = new dropdown_1.DropDown({
                            el: buttonExport.wrapper,
                            inline: false,
                            data: [],
                            multi: null,
                            className: "input-box-morebtn"
                        });
                        buttonExportSta.dropDown = new dropdown_1.DropDown({
                            el: buttonExportSta.wrapper,
                            inline: false,
                            data: [],
                            multi: null,
                            className: "input-box-morebtn"
                        });
                        for (var i = 0, l = exportStaBut.length; i < l; i++) {
                            but_1 = new Button_1.Button(exportStaBut[i]);
                            buttonExportSta.dropDown.getUlDom().appendChild(but_1.wrapper);
                        }
                        for (var i = 0, l = exportBut.length; i < l; i++) {
                            buttonExport.dropDown.getUlDom().appendChild(new Button_1.Button(exportBut[i]).wrapper);
                        }
                        if (_this.para.printList && _this.para.printList.length > 0) {
                            _this.labelBtn = new Button_1.Button({ content: '标签打印', type: 'default', icon: 'label', onClick: function () { _this.labelPrint.show(_this.labelBtn.wrapper); } });
                            add(_this.labelBtn);
                        }
                        formPriBut = new Button_1.Button({ content: '报表打印', type: 'default', icon: 'label', onClick: function () { _this.formPrint.show(formPriBut.wrapper); } });
                    }
                    var buttonQuery;
                    if (_this.para.querier && _this.para.querier.queryType === 3) {
                        buttonQuery = new Button_1.Button({ content: '查询器', type: 'default', icon: 'shaixuan', onClick: function () { _this.queryModule.show(); } });
                        add(buttonQuery);
                    }
                    if (!_this.para.isSub || buttonQuery) {
                        add(new Button_1.Button({
                            // type: 'default',
                            icon: 'wangyuanjing',
                            content: '本地查找',
                            onClick: function () {
                                _this.searchReplace.show();
                            },
                        }));
                        add(new Button_1.Button({
                            // type: 'default',
                            icon: 'sousuo',
                            content: '本地过滤',
                            onClick: function () {
                                _this.localSearch.show();
                            },
                        }));
                    }
                    add(formPriBut);
                    /*  let chatBut = new Button({content: '聊天',type:'default', icon: 'label',onClick:()=>{
               let chat = new ChatController({
                   container: d.closest(this.wrapper, 'div.page-container')
               });
           }});
           add(chatBut);*/
                    add(buttonExportSta);
                    add(buttonExport);
                    d.on(_this.wrapper, 'editChange', function (e) {
                        var isEdting = e.detail.status;
                        buttonExport.isDisabled = isEdting;
                        buttonExportSta.isDisabled = isEdting;
                        buttonQuery && (buttonQuery.isDisabled = isEdting);
                        _this.labelBtn && (_this.labelBtn.isDisabled = isEdting);
                    });
                };
                var add = function (but) {
                    but && inputBox.addItem(but);
                };
                return { init: init, add: add };
            })();
            _this.labelPrint = (function (self) {
                var label = null;
                var init = function (target, printList, cb) {
                    if (self.para.printList) {
                        var sp_1 = new spinner_1.Spinner({
                            el: target,
                            size: 14,
                            type: spinner_1.Spinner.SHOW_TYPE.replace,
                        });
                        sp_1.show();
                        require(['LabelPrintModule'], function (Print) {
                            label = new Print({
                                printList: printList ? printList : self.para.printList,
                                container: d.closest(self.wrapper, 'div.page-container'),
                                cols: self.table.getVisibleCol(),
                                getData: function () {
                                    return self.table.dataGet();
                                },
                                selectedData: function () {
                                    return self.table.rowSelectDataGet();
                                },
                                callBack: function () {
                                    cb && cb();
                                }
                            });
                            label.modal.isShow = true;
                            sp_1.hide();
                        });
                    }
                };
                var show = function (target, printList, cb) {
                    if (label === null) {
                        init(target, printList, cb);
                    }
                    else {
                        label.modal.isShow = true;
                    }
                };
                return { show: show };
            }(_this));
            _this.formPrint = (function (self) {
                var formPri = null;
                var init = function (target, printList, cb) {
                    if (self.para.printList) {
                        var sp_2 = new spinner_1.Spinner({
                            el: target,
                            size: 14,
                            type: spinner_1.Spinner.SHOW_TYPE.replace,
                        });
                        sp_2.show();
                        require(['FormPrintModule'], function (formPrint) {
                            formPri = new formPrint({
                                container: d.closest(self.wrapper, 'div.page-container'),
                                cols: self.para.cols,
                                middleTable: self.table.tableELGet(),
                                tableData: function () {
                                    return self.table.dataGet();
                                }
                            });
                            formPri.modal.isShow = true;
                            sp_2.hide();
                        });
                    }
                };
                var show = function (target, printList, cb) {
                    if (formPri === null) {
                        init(target, printList, cb);
                    }
                    else {
                        formPri.modal.isShow = true;
                    }
                };
                return { show: show };
            }(_this));
            _this.searchReplace = (function () {
                var modal = null, btns = {}, texts = {}, searchStr = '', inSub = false;
                var init = function () {
                    if (modal) {
                        return;
                    }
                    var inputFactory = {
                        search: function (container) {
                            texts.search = new text_1.TextInput({
                                container: container,
                                placeholder: '查找...',
                            });
                        },
                        replace: function (container) {
                            texts.replace = new text_1.TextInput({
                                container: container,
                                placeholder: '替换为...',
                            });
                        }
                    };
                    var btnFactory = {
                        next: function (container) {
                            btns.next = new Button_1.Button({
                                container: container,
                                content: '查找下一个',
                                onClick: function () {
                                    var str = texts.search.get();
                                    search.next(str);
                                }
                            });
                        },
                        replace: function (container) {
                            btns.replace = new Button_1.Button({
                                container: container,
                                content: '替换',
                                // isDisabled: !this.tableEdit.getStatus(),
                                onClick: function () {
                                    var text = texts.replace.get(), str = texts.search.get();
                                    replace(str, text);
                                }
                            });
                        },
                        replaceAll: function (container) {
                            btns.replaceAll = new Button_1.Button({
                                container: container,
                                content: '替换全部',
                                // isDisabled: !this.tableEdit.getStatus(),
                                onClick: function () {
                                    replaceAll(texts.search.get(), texts.replace.get());
                                }
                            });
                        }
                    };
                    var body = d.create('<div class="rows">' +
                        '<div class="col-xs-6 search">' +
                        '<div data-input="search"></div>' +
                        '<div data-btn="next"></div>' +
                        '</div>' +
                        '<div class="col-xs-6 replace">' +
                        '<div class="rows"><div data-input="replace"></div></div>' +
                        '<div class="rows">' +
                        '<div class="col-xs-4"><div data-btn="replace"></div></div>' +
                        '<div class="col-xs-6"><div data-btn="replaceAll"></div></div>' +
                        '</div>');
                    function changeStatus(isEditing) {
                        var replaceEl = d.query('.replace', body), searchEl = d.query('.search', body);
                        replaceEl.classList[isEditing ? 'remove' : 'add']('hide');
                        searchEl.classList[isEditing ? 'remove' : 'add']('col-xs-12');
                        searchEl.classList[!isEditing ? 'remove' : 'add']('col-xs-6');
                    }
                    var isEditing = _this.tableEdit ? _this.tableEdit.getStatus() : false;
                    if (!isEditing) {
                        changeStatus(isEditing);
                    }
                    initCom(d.queryAll('[data-input], [data-btn]', body));
                    modal = new Modal_1.Modal({
                        className: 'search-replace',
                        header: '查找/替换',
                        body: body,
                        isBackground: false,
                        isShow: false,
                    });
                    d.on(_this.wrapper, 'editChange', function (e) {
                        changeStatus(e.detail.status);
                    });
                    function initCom(containers) {
                        Array.isArray(containers) && containers.forEach(function (container) {
                            var dataSet = container.dataset;
                            if (dataSet.input && inputFactory[dataSet.input]) {
                                inputFactory[dataSet.input](container);
                            }
                            else if (dataSet.btn && btnFactory[dataSet.btn]) {
                                btnFactory[dataSet.btn](container);
                            }
                        });
                    }
                };
                var show = function () {
                    if (!modal) {
                        init();
                    }
                    modal.isShow = true;
                };
                var search = (function () {
                    var currentIndex = -1, lastScrollTop = 0;
                    var getTds = function (index) {
                        return d.queryAll("tbody td[data-high-index=\"" + index + "\"]", _this.table.wrapperGet());
                    };
                    /**
                     * 查找下一个
                     * @param {string} str
                     */
                    var next = function (str) {
                        if (str === void 0) { str = searchStr; }
                        var fromStart = false, scrollEl = _this.tableConf.scrollEl, subTable = null;
                        if (_this.subTable) {
                            subTable = _this.subTable;
                        }
                        if (str != searchStr) {
                            _this.table.highlight(str);
                            if (subTable) {
                                subTable.table.highlight(str);
                                subTable.searchReplace.search.setSearchStr(str);
                            }
                            setSearchStr(str);
                            fromStart = true;
                            inSub = false;
                        }
                        if (subTable && inSub) {
                            inSub = subTable.searchReplace.search.next(str);
                            return !inSub;
                        }
                        else {
                            if (fromStart) {
                                // 清空从头开始定位
                                d.queryAll('tbody td.searched', _this.table.wrapperGet()).forEach(function (td) {
                                    td.classList.remove('searched');
                                });
                                currentIndex = -1;
                            }
                            // 清理上一个状态
                            getTds(currentIndex).forEach(function (td) {
                                td.classList.remove('searched');
                            });
                            // 查找下一个
                            currentIndex++;
                            var searchedTd = getTds(currentIndex);
                            if (searchedTd[0]) {
                                searchedTd.forEach(function (td) {
                                    td.classList.add('searched');
                                    if ('scrollIntoViewIfNeeded' in td) {
                                        td['scrollIntoViewIfNeeded'](false);
                                    }
                                    else {
                                        td.scrollIntoView(false);
                                    }
                                });
                                var distance = scrollEl.getBoundingClientRect().bottom - searchedTd[0].getBoundingClientRect().bottom;
                                if (distance < 80) {
                                    scrollEl.scrollTop = scrollEl.scrollTop + (80 - distance);
                                }
                                subTable && (inSub = false);
                                return true;
                            }
                            else {
                                currentIndex = -1;
                                if (subTable) {
                                    inSub = true;
                                    subTable.searchReplace.search.next();
                                }
                                return false;
                            }
                        }
                    };
                    var clear = function (index) {
                        if (index === void 0) { index = currentIndex; }
                        var allSearch = d.queryAll("tbody td[data-high-index]", _this.table.wrapperGet());
                        allSearch.forEach(function (td) {
                            var highIndex = parseInt(td.dataset.highIndex);
                            if (highIndex >= index) {
                                if (highIndex === index) {
                                    delete td.dataset.highIndex;
                                }
                                else {
                                    td.dataset.highIndex = (highIndex - 1) + '';
                                }
                            }
                        });
                        if (currentIndex >= index) {
                            currentIndex--;
                        }
                        next();
                    };
                    var clearAll = function () {
                        d.queryAll("tbody td.searched", _this.table.wrapperGet()).forEach(function (td) {
                            td.classList.remove('searched');
                        });
                        currentIndex = -1;
                        searchStr = '';
                        lastScrollTop = 0;
                    };
                    var setSearchStr = function (str) {
                        searchStr = str;
                    };
                    return { next: next, clear: clear, clearAll: clearAll, setSearchStr: setSearchStr };
                })();
                /**
                 * 替换
                 * @param {string} seStr
                 * @param {string} reStr
                 * @return {boolean} 返回能否继续替换
                 */
                var replace = function (seStr, reStr) {
                    if (seStr != searchStr) {
                        if (btns.next && btns.next.onClick) {
                            btns.next.onClick(null);
                            return true;
                        }
                    }
                    var subTable = null;
                    if (_this.subTable) {
                        subTable = _this.subTable;
                    }
                    if (inSub) {
                        return subTable.searchReplace.replace(seStr, reStr);
                    }
                    else {
                        if (!d.query('tbody td[data-high-index]', _this.table.wrapperGet())) {
                            if (btns.next && btns.next.onClick) {
                                btns.next.onClick(null);
                                return true;
                            }
                            else {
                                search.next(seStr);
                                return !!d.query('tbody td[data-high-index]', _this.table.wrapperGet());
                            }
                        }
                        var td = d.query('tbody td.searched', _this.table.wrapperGet());
                        if (!td) {
                            return !_this.para.isSub;
                        }
                        var originText = tools.str.removeHtmlTags(td.innerHTML);
                        td.click();
                        var input = d.query('input', td);
                        if (input) {
                            var searchPara = new RegExp("(" + tools.escapeRegExp(seStr) + ")", 'ig');
                            input.value = originText.replace(searchPara, reStr);
                            search.clear(parseInt(td.dataset.highIndex));
                            td.classList.remove('searched');
                            _this.tableEdit.reshowEditing();
                            return true;
                        }
                        else {
                            search.next();
                            return true;
                        }
                    }
                };
                var replaceAll = function (seStr, reStr) {
                    while (replace(seStr, reStr)) { }
                    search.clearAll();
                    // debugger;
                    // if(this.subTable) {
                    //     (<TableModulePc>this.subTable).searchReplace.replaceAll(seStr, reStr);
                    // }
                };
                return { show: show, search: search, replace: replace, replaceAll: replaceAll };
            })();
            _this.handleSubTable = (function () {
                // 初始化子表Wrapper
                var subWrapper = d.create('<div class="table-module-wrapper sub-table"></div>'), subTableEl = d.create('<table class="subTable"><tbody></tbody></table>');
                return function (subUrl, ajaxData, onShow, onClose) {
                    if (_this.subTable === null) {
                        d.closest(_this.wrapper, '.tablePage').classList.add('has-subTable');
                        _this.wrapper.classList.add('main-table');
                        // this.tableConf.scrollEl = this.wrapper;
                        d.append(subWrapper, subTableEl);
                        d.after(_this.wrapper, subWrapper);
                        _this.subTableData.tableAddr = _this.para.tableAddr;
                        var fixTop = subWrapper.getBoundingClientRect().top;
                        _this.subTable = new TableModulePc({
                            tableEl: subTableEl,
                            scrollEl: subWrapper,
                            ajaxData: ajaxData,
                            fixTop: fixTop
                        }, _this.subTableData);
                        tools.event.fire('subTableInit', null, _this.wrapper);
                    }
                    else {
                        _this.subTable.refresher(ajaxData);
                    }
                    onShow();
                    var selectedData = _this.table.rowSelectDataGet();
                    _this.subTable.aggregate.get(selectedData && selectedData[0] ? selectedData[0] : null);
                };
            })();
            return _this;
        }
        TableModulePc.prototype.initWrapper = function (tableDom) {
            var wrapper = d.create("<div class=\"table-module-wrapper\"></div>"), topBtns = d.create('<div class="topBtns">' +
                '<div class="btn-group btnsRight"></div>' +
                '<div style="clear:both"></div></div>');
            d.replace(wrapper, tableDom);
            d.append(wrapper, topBtns);
            d.append(wrapper, tableDom);
            this.wrapper = wrapper;
            if (!this.para.isSub) {
                var leftBtns = d.create('<div class="btn-group btnsLeft"></div>'), middleBtns = d.create('<div class="btn-group btnsMiddle"></div>');
                d.prepend(topBtns, middleBtns);
                d.prepend(topBtns, leftBtns);
                if (this.subTableData) {
                    this.tableConf.scrollEl = wrapper;
                }
            }
        };
        TableModulePc.prototype.onComplete = function () {
            var _this = this;
            if (!this.para.isSub) {
                if (!this.isDrill) {
                    this.editBtns.init(d.query('.topBtns .btn-group.btnsMiddle', this.wrapper));
                    this.initSubBtns(d.query('.topBtns .btn-group.btnsLeft', this.wrapper));
                }
                else {
                    this.initDrillBut.init(this.wrapper);
                }
            }
            setTimeout(function () {
                _this.rightBtns.init();
            }, 0);
            d.on(this.wrapper, 'pageToggle', function (e) {
                if (e.detail.isShow) {
                    var bottom = d.query('.table-out-bottom', _this.wrapper), bottomHeight = void 0;
                    if (bottom) {
                        bottomHeight = bottom.offsetHeight;
                        _this.onLoad.getscrollBar().setConfBottom(bottomHeight);
                        var container = d.closest(_this.wrapper, 'div.modal-body') ||
                            d.closest(_this.wrapper, 'div.page-container');
                        tools.event.fire('scroll', {}, container);
                    }
                }
                else {
                    _this.onLoad.getscrollBar() && _this.onLoad.getscrollBar().setConfBottom(0);
                }
            });
            this.showDetailBut();
            // setTimeout(() => {
            //     //monitorKey键盘输入
            //     if(this.para.inputs){
            //         new Inputs({
            //             inputs : this.para.inputs,
            //             container : this.tableConf.tableEl,
            //             table : this,
            //         })
            //     }
            // },200);
        };
        TableModulePc.prototype.showDetailBut = function () {
            var table = this.table, self = this, multiText = null;
            d.on(table.wrapperGet(), 'mouseover', 'tbody td .detail-more', function (e) {
                initText(this.dataset.textType);
                var rowIndex = parseInt(d.closest(this, 'tr').dataset.index), colName = d.closest(this, 'td').dataset.col, rect = this.getBoundingClientRect(), tableRect = self.para.isSub || self.subTableData ? self.wrapper.getBoundingClientRect() : document.body.getBoundingClientRect();
                multiText.classList.remove('hide');
                multiText.innerHTML = "" + table.rowDataGet(rowIndex)[colName];
                var multiHeight = multiText.offsetHeight, multiWidth = multiText.offsetWidth, bottom = rect.bottom + multiHeight, right = rect.left + multiWidth;
                multiText.style.top = (bottom > tableRect.bottom ? rect.top - multiHeight : rect.bottom) + "px";
                multiText.style.left = (right > rect.right ? rect.left - (right - rect.right) : rect.left - 40) + "px";
            });
            d.on(table.wrapperGet(), 'mouseout', 'tbody td .detail-more', function (e) {
                multiText.classList.add('hide');
            });
            function initText(type) {
                if (multiText) {
                    d.remove(multiText);
                    d.off(multiText, 'mouseover', over);
                    d.off(multiText, 'mouseout', out);
                }
                switch (type) {
                    case 'string':
                    case 'html':
                        multiText = d.create("<div class=\"hide showDetail\"></div>");
                        break;
                    case 'multiText':
                        multiText = d.create("<pre class=\"hide showDetail\"></pre>");
                        break;
                }
                d.append(self.wrapper, multiText);
                d.on(multiText, 'mouseover', over);
                d.on(multiText, 'mouseout', out);
            }
            function over() {
                multiText.classList.remove('hide');
            }
            function out() {
                multiText.classList.add('hide');
            }
        };
        TableModulePc.prototype.tableConfGet = function (para) {
            var _this = this;
            var initTableConf = _super.prototype.tableConfGet.call(this, para);
            var pcConf = {
                colResize: true,
                move: true,
                colGroup: this.isDrill,
                cellMaxWidth: 200,
                onComplete: function () {
                    typeof initTableConf.onComplete === 'function' && initTableConf.onComplete();
                }
            };
            var colsBtn = [];
            this.para.cols.forEach(function (col) {
                var title = col.title;
                var cb = function (btn, rows, target) {
                    if (rows && rows[0]) {
                        var curChild = d.query('[data-col="' + col.name + '"]', rows[0]);
                        sys.window.copy(curChild.innerHTML);
                    }
                };
                colsBtn.push({
                    multi: false,
                    title: title,
                    callback: cb
                });
            });
            initTableConf.rowMenu.push({
                multi: false,
                title: '列复制',
                callback: function (btn, rows, target) { },
                children: colsBtn
            });
            initTableConf.rowMenu.push({
                multi: false,
                title: '复制单元格',
                callback: function (btn, rows, target) {
                    sys.window.copy(d.closest(target, 'td').innerHTML);
                }
            });
            initTableConf.rowMenu.push({
                multi: true,
                title: '复制选中区域',
                callback: function (btn, rows) {
                    var colsName = [], indexes = [], table = _this.table;
                    var data = table.drag.getData();
                    for (var i = 0, l = data['cols'].length; i < l; i++) {
                        colsName.push(data['cols'][i].name);
                    }
                    for (var i = data['indexes'][0]; i <= data['indexes'][1]; i++) {
                        indexes.push(i);
                    }
                    _this.table.copy.row(indexes, false, colsName);
                }
            });
            return tools.obj.merge(true, initTableConf, pcConf);
        };
        TableModulePc.prototype.initTable = function (para) {
            return new pcTable_1.PcTable(para);
        };
        TableModulePc.prototype.imgHtmlGet = function (url) {
            return "<img style=\"max-height: 100%\" src=\"" + url + "\" alt=\"\">";
        };
        return TableModulePc;
    }(tableModule_1.TableModule));
});

define("TableModule", ["require", "exports", "paging", "Modal", "Spinner", "Button", "QueryBuilder", "InputBox", "ButtonAction", "TableEdit", "TableDataModule", "TableImgEdit", "ImgModal", "BwRule"], function (require, exports, paging_1, Modal_1, spinner_1, Button_1, queryBuilder_1, InputBox_1, ButtonAction_1, TableEdit_1, TableDataModule_1, TableImgEdit_1, img_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var d = G.d;
    var TableModule = /** @class */ (function () {
        /**
         *
         * @param {TableModuleConf} tableConf
         * @param {TableModulePara} para
         */
        function TableModule(tableConf, para) {
            var _this = this;
            this.tableConf = tableConf;
            this.para = para;
            this.wrapper = null;
            this.refresher = null;
            // public statisticConfGet : (cols : string[], stats : {title : string, method : (nums : number[]) => number}[], col : string) => BT_Para;
            this.table = null; // 主表
            this.subTable = null; // 从表
            this.isSub = false; // 是否是从表
            this.defaultData = {};
            this.pageUrl = '';
            // protected maxCellWidth = sys.isMb ? (document.body.offsetWidth > 600 ? 30 : 15) : 30;
            this.maxCellWidth = tools.isMb ? (document.body.offsetWidth > 600 ? 30 : 15) : 30;
            this.cols = [];
            this.tableData = null;
            // 聚合字段
            this.aggregate = (function () {
                var aggrWrap = null, aggrList = _this.para.aggrList, urlData = null;
                /**
                 * 初始化
                 * @return {boolean} - 初始成功或者失败
                 */
                var init = function () {
                    if (!Array.isArray(aggrList) || !aggrList[0]) {
                        return false;
                    }
                    aggrWrap = (h("div", { className: "aggr-wrapper" }));
                    d.before(_this.table.wrapperGet(), aggrWrap);
                    return true;
                };
                var get = function (data) {
                    if (aggrWrap === null && !init()) {
                        return; // 初始化失败
                    }
                    if (data) {
                        urlData = data;
                    }
                    aggrWrap.innerHTML = '';
                    aggrList.forEach(function (aggr) {
                        var valSpan = h("span", null,
                            aggr.caption,
                            ":");
                        d.append(aggrWrap, valSpan);
                        BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + BwRule_1.BwRule.reqAddr(aggr.dataAddr, urlData))
                            .then(function (_a) {
                            var response = _a.response;
                            var value = tools.keysVal(response, 'data', 0, tools.keysVal(response, 'meta', 0));
                            valSpan.innerHTML = aggr.caption + ":" + (value || 0) + " &nbsp;&nbsp;";
                        });
                    });
                };
                return { get: get };
            })();
            /**
             * 初始化表格点击事件
             */
            this.initTableEvent = (function () {
                var self = _this, pagesortparams = [], //当前表格排序信息
                sortMethod = {}; //字段升降序缓存对象
                var init = function (bt) {
                    bt.clickEvent.add('td[data-href], td[data-click-type]', function (e) {
                        if (this.dataset.hrefType === 'file') {
                            BwRule_1.BwRule.link({
                                link: this.dataset.href,
                                dataType: BwRule_1.BwRule.DT_FILE,
                                callback: function (act, data, allAct) {
                                    sys && sys.window.download(data.DOWNADDR);
                                }
                            });
                        }
                        else if (this.dataset.clickType === 'btn') {
                            // linkName 快捷点击按键
                            var allBtn = self.subBtn.children || [], colName = this.dataset.col;
                            self.table.rowSelect(this.parentElement);
                            for (var _i = 0, allBtn_1 = allBtn; _i < allBtn_1.length; _i++) {
                                var btn = allBtn_1[_i];
                                var rBtn = btn.data;
                                if (rBtn && rBtn.linkName && rBtn.linkName === colName) {
                                    btn.onClick.call(btn, null);
                                }
                            }
                        }
                        else {
                            // 打开新窗口
                            sys && sys.window.open({
                                url: CONF.siteUrl + this.dataset.href,
                                gps: !!parseInt(this.dataset.gps)
                            }, self.pageUrl);
                        }
                        e.stopPropagation();
                    });
                    bt.clickEvent.add('tr td.td-img, tr[data-click-type]', function (e) {
                        // 查看图片
                        var isTd = this.tagName === 'TD', index = parseInt(isTd ? this.parentElement.dataset.index : this.dataset.index), imgs = self.para.pictureAddrList.map(function (addr) {
                            return CONF.siteUrl + BwRule_1.BwRule.reqAddr(addr, bt.rowDataGet(index));
                        });
                        self.handleImg(imgs, index);
                    });
                    if (tools.isMb) {
                        bt.clickEvent.add('td > .more-text-button', function (e) {
                            // 查看文字详情
                            var colName = d.closest(this, 'td').dataset.col, rowIndex = parseInt(d.closest(this, 'tr').dataset.index), fullText = self.table.rowDataGet(rowIndex)[colName];
                            Modal_1.Modal.alert(tools.str.removeHtmlTags(fullText));
                        });
                    }
                    if (_this.subTableData) {
                        var subTableHandler_1 = function (e) {
                            var _this = this;
                            // 显示从表
                            var index = parseInt(this.dataset.index), ajaxData = BwRule_1.BwRule.varList(self.subTableData.dataAddr.varList, bt.rowDataGet(index)), mtAjaxData = self.tableData.getQueryPara();
                            ajaxData = tools.obj.merge(mtAjaxData, ajaxData);
                            // 查询从表时不需要带上选项参数
                            delete ajaxData['queryoptionsparam'];
                            self.handleSubTable(this.dataset.subUrl, ajaxData, function () {
                                bt.rowSelect(_this);
                            }, function () {
                                bt.rowDeselect(this);
                            });
                        };
                        bt.clickEvent.add('tr[data-sub-url]', subTableHandler_1);
                        d.on(_this.wrapper, 'editChange', function (e) {
                            bt.clickEvent[e.detail.status === 1 ? 'remove' : 'add']('tr[data-sub-url]', subTableHandler_1);
                        });
                    }
                    // TODO 之后换成事件
                    if (_this.para.multPage === 1) {
                        //后台排序
                        bt.clickEvent.add('thead th[data-col]', function (e) {
                            var getColByName = function (name) {
                                var cols = self.para.cols;
                                for (var i = 0, l = cols.length; i < l; i++) {
                                    if (cols[i].name === name) {
                                        return cols[i].dataType;
                                    }
                                }
                            };
                            var dataType = getColByName(this.dataset.col);
                            if (BwRule_1.BwRule.DT_IMAGE === dataType || BwRule_1.BwRule.DT_HTML === dataType || BwRule_1.BwRule.DT_MULTI_TEXT === dataType || BwRule_1.BwRule.DT_FILE === dataType) {
                                return;
                            }
                            if (this.classList.contains('disabled') || bt.colResize.dragging || bt.moving) {
                                return;
                            }
                            var spinner = null, colName = this.dataset.col;
                            if (tools.isMb) {
                                spinner = new spinner_1.Spinner({
                                    el: document.body,
                                    type: spinner_1.Spinner.SHOW_TYPE.cover,
                                    className: 'text-center'
                                });
                            }
                            spinner && spinner.show();
                            self.pagination.setParam(1);
                            var queryPara = self.tableData.getQueryPara();
                            if (!sortMethod[colName]) {
                                sortMethod[colName] = 'asc';
                            }
                            if (!(e.ctrlKey || e.shiftKey)) {
                                var temp = void 0;
                                pagesortparams = [];
                                sortMethod[colName] && (temp = sortMethod[colName]);
                                sortMethod = {};
                                sortMethod[colName] = temp ? temp : 'asc';
                            }
                            else {
                                for (var i = 0; i < pagesortparams.length; i++) {
                                    if (pagesortparams[i] === colName + "," + sortMethod[colName]) {
                                        pagesortparams.splice(i, 1);
                                    }
                                }
                            }
                            sortMethod[colName] = sortMethod[colName] === 'asc' ? 'desc' : 'asc';
                            pagesortparams.push(colName + "," + sortMethod[colName]);
                            queryPara['pagesortparams'] = JSON.stringify(pagesortparams);
                            //后台排序回到第一页，并加载第一页的排序数据
                            self.pagination.setParam(1);
                            self.tableData.refresh(queryPara, function (response) {
                                var totalNum = response.head.totalNum ? response.head.totalNum : response.data.length;
                                if (self.para.multPage !== 0 && totalNum > self.pagination.pageLen) {
                                    self.pagination.reset({
                                        offset: 0,
                                        recordTotal: response.head.totalNum ? response.head.totalNum : response.data.length
                                    });
                                }
                                spinner && spinner.hide();
                            });
                        });
                    }
                    bt.clickEvent.on();
                };
                //获取当前排序字段信息
                var getPageSortParams = function () {
                    return { "pagesortparams": JSON.stringify(pagesortparams) };
                };
                return { init: init, getPageSortParams: getPageSortParams };
            })();
            /**
             * 分页插件处理函数
             * @type {{reset: ((state: PG_Reset) => any); getParam: ((isDef?: boolean) => obj); getCurrentState: (() => {count: number; current: number; size: number; offset: number}); setParam: ((current) => any); isShow: ((response) => any); pageLen: number}}
             */
            this.pagination = (function () {
                var page = null, param = {}, //当前的pageparams请求字段
                self = _this, currentState = { count: 1, current: 0, size: 50, offset: 0 }, //缓存当前的分页信息
                pageLen = 50; //分页条大小
                param = getDefParam();
                function getDefParam() {
                    return {
                        pageparams: "{\"index\"=1 , \"size\"=" + (self.para.multPage === 1 ? pageLen : 3000) + " ,\"total\"=1}"
                    };
                }
                /**
                 * 初始化分页插件
                 * @param {PG_Reset} state
                 */
                var init = function (state) {
                    var tableBottom = h("div", { className: "table-out-bottom" }), btTable = _this.table, btWrap = btTable.wrapperGet();
                    var scrollEl = _this.tableConf.scrollEl;
                    btWrap.appendChild(tableBottom);
                    page = new paging_1.Paging({
                        el: tools.isMb ? _this.para.isSub ? _this.wrapper : btWrap : tableBottom,
                        pageOption: tools.isMb ? null : [50, 200, 500],
                        pageSize: pageLen,
                        recordTotal: state.recordTotal,
                        change: function (state) {
                            var count = state.count, current = state.current, offset = state.offset, size = state.size;
                            if (!tools.isMb) { //当点击分页的时候将表格滚动条调至最顶部
                                var pageContainer = _this.tableConf.scrollEl;
                                pageContainer && (pageContainer.scrollTop = 0);
                            }
                            if (self.para.multPage === 1) {
                                currentState = state;
                                setParam(current);
                                self.tableData.ajax(null, function (res) {
                                    if (res) {
                                        self.tableData.dealTable(res.data, !tools.isMb);
                                        //后台分页时，每次点击重新设置前台查询的缓存数据
                                        self.localSearch.setOriginData(self.table.data.get());
                                    }
                                    tools.isMb && page.reset({ last: false }); // 加载完成
                                    setTimeout(function () {
                                        self.onLoad && self.onLoad.getscrollBar() && self.onLoad.getscrollBar().updateStyle(); //更新锁尾滚动条状态
                                    }, 0);
                                });
                            }
                            else {
                                if (tools.isMb) {
                                    setTimeout(function () {
                                        btTable.render((current - 1) * size, current * size, false);
                                        tools.isMb && page.reset({ last: false }); // 加载完成
                                    }, 500);
                                }
                                else {
                                    btTable.render((current - 1) * size, current * size);
                                    setTimeout(function () {
                                        self.onLoad && self.onLoad.getscrollBar() && self.onLoad.getscrollBar().updateStyle(); //更新锁尾滚动条状态
                                    }, 0);
                                }
                            }
                        },
                        scroll: tools.isMb ? {
                            Container: _this.para.isSub ? _this.wrapper : (scrollEl === window) ? null : scrollEl,
                            auto: true,
                            content: '加载中...',
                            nomore: '已加载完全部数据'
                        } : null
                    });
                    page.go(1);
                };
                /**
                 * 设置当前分页请求字段pageparams
                 * @param current
                 */
                var setParam = function (current) {
                    param = {
                        pageparams: "{\"index\"=" + current + " , \"size\"=" + (self.para.multPage === 1 ? currentState.size : 3000) + " ,\"total\"=1}"
                    };
                };
                /**
                 * 获取当前分页请求字段pageparams
                 * @param {boolean} isDef
                 * @returns {obj}
                 */
                var getParam = function (isDef) {
                    if (isDef === void 0) { isDef = false; }
                    if (isDef) {
                        param = getDefParam();
                    }
                    return param;
                };
                /**
                 * 获取当前分页信息
                 * @returns {{count: number; current: number; size: number; offset: number}}
                 */
                var getCurrentState = function () {
                    return currentState;
                };
                /**
                 * 重置分页条状态
                 * @param {PG_Reset} state
                 */
                var reset = function (state) {
                    //为空则第一次渲染分页条插件
                    if (page === null) {
                        init(state);
                    }
                    //重新渲染插件信息
                    else {
                        page.reset(state);
                    }
                };
                /**
                 * 根据返回信息，判断当前分页条是否需要显示
                 * @param response
                 */
                var isShow = function (response) {
                    var data = response.data ? response.data : response, totalNum;
                    response.head && (totalNum = response.head.totalNum);
                    var isShow = totalNum ? totalNum > self.pagination.pageLen : data.length > self.pagination.pageLen;
                    show(isShow);
                };
                var show = function (flag) {
                    var pagingBottom = d.query('.table-out-bottom', _this.wrapper);
                    pagingBottom && (pagingBottom.style.display = flag ? 'block' : 'none'); //当返回数据为空的时候不显示分页条
                    tools.event.fire('pageToggle', { isShow: flag }, _this.wrapper);
                };
                return { reset: reset, getParam: getParam, getCurrentState: getCurrentState, setParam: setParam, isShow: isShow, pageLen: pageLen, show: show };
            })();
            this.getMulitPara = (function () {
                var multiCols = [], titleArr = [], maxRow = 0, colsIndex = [];
                function dealData(data) {
                    function hasInMultiCols(title) {
                        for (var j = 0; j < multiCols.length; j++) {
                            for (var i = 0; i < multiCols[j].length; i++) {
                                if (multiCols[j][i].title === title) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    if (data instanceof Array) {
                        for (var i = 0; i < data.length; i++) {
                            !hasInMultiCols(data[i]) && multiCols[i].push({
                                title: data[i].indexOf('|') > 0 ? data[i].split("|")[0] : data[i],
                                name: data[i].indexOf('|') > 0 ? data[i].split("|")[1] : null,
                                rowspan: parseInt(data[i].indexOf('|') > 0 ? data[i].split("|")[2] : 1),
                                parent: i === 0 ? null : data[i - 1]
                            });
                        }
                    }
                }
                function childenCounts(title) {
                    var i, j, count = 0;
                    for (i = 0; i < multiCols.length; i++) {
                        for (j = 0; j < multiCols[i].length; j++) {
                            if (multiCols[i][j].parent === title) {
                                count++;
                            }
                        }
                    }
                    return count === 0 ? 1 : count;
                }
                var getMulitCols = function (cols, isAcross) {
                    colsIndex = [], multiCols = [], titleArr = []; //重新初始化
                    if (!isAcross) {
                        var cache = cols;
                        cols = [];
                        for (var i_1 = 0, len1 = cache.length; i_1 < len1; i_1++) {
                            if (cache[i_1].subcols) {
                                for (var j_1 = 0, len2 = cache[i_1].subcols.length; j_1 < len2; j_1++) {
                                    cols.push({ name: cache[i_1].subcols[j_1].name, title: cache[i_1].title + "." + cache[i_1].subcols[j_1].caption });
                                }
                            }
                            else {
                                cols.push({ name: cache[i_1].name, title: cache[i_1].title });
                            }
                        }
                    }
                    var i, j;
                    function dealCols(fn) {
                        for (i = 0; i < cols.length; i++) {
                            fn(cols[i], i);
                        }
                    }
                    function dealTitleArr(fn) {
                        for (i = 0; i < titleArr.length; i++) {
                            fn(titleArr[i]);
                        }
                    }
                    function dealMultiCols(fn) {
                        for (i = 0; i < multiCols.length; i++) {
                            for (j = 0; j < multiCols[i].length; j++) {
                                fn(multiCols[i][j]);
                            }
                        }
                    }
                    dealCols(function (para, i) {
                        titleArr[i] = para.title.split('.');
                        titleArr[i][titleArr[i].length - 1] += "|" + para.name;
                        colsIndex.push(para);
                    });
                    dealTitleArr(function (para) {
                        if (maxRow < para.length) {
                            maxRow = para.length;
                        }
                    });
                    dealCols(function (para, i) {
                        var tempArr = para.title.split('.');
                        titleArr[i][titleArr[i].length - 1] += "|" + (maxRow - (tempArr.length - 1));
                    });
                    for (i = 0; i < maxRow; i++) {
                        multiCols[i] = [];
                    }
                    dealTitleArr(function (para) {
                        dealData(para);
                    });
                    dealMultiCols(function (para) {
                        para['colspan'] = childenCounts(para.title);
                    });
                    dealMultiCols(function (para) {
                        delete para.parent;
                    });
                    return multiCols;
                };
                var getColsIndex = function () {
                    return colsIndex;
                };
                return { getMulitCols: getMulitCols, getColsIndex: getColsIndex };
            })();
            this.localSearch = (function (self) {
                var originData = null;
                var originMultPage = null;
                var start = function (conditions) {
                    var cacheData = originData, resultData = [];
                    getFirstData();
                    //获取满足第一个查询的所有值
                    function getFirstData() {
                        for (var i = 0, l = cacheData.length; i < l; i++) {
                            var val = cacheData[i][conditions[0].field];
                            if (conditions[0].not) { //如果为not
                                if (!queryOp(val, conditions[0])) { //不符合后面条件的加入结果集
                                    resultData.push(cacheData[i]);
                                }
                            }
                            else { //如果为非not
                                if (queryOp(val, conditions[0])) { //符合后面条件的加入结果集
                                    resultData.push(cacheData[i]);
                                }
                            }
                        }
                    }
                    //过滤获取到的第一个查询结果
                    function doFilter(filterPara) {
                        for (var i = 0; i < resultData.length; i++) {
                            var val = resultData[i][filterPara.field];
                            if (filterPara.not) { //如果为not
                                if (queryOp(val, filterPara)) { //不符合后面条件的则为满足过滤条件
                                    resultData.splice(i, 1);
                                    i--;
                                }
                            }
                            else { //如果为非not
                                if (!queryOp(val, filterPara)) { //符合后面条件的则为满足过滤条件
                                    resultData.splice(i, 1);
                                    i--;
                                }
                            }
                        }
                    }
                    //运算符运算结果 true满足条件  false 不满足条件
                    function queryOp(val, condition) {
                        switch (condition.op) {
                            case 2: //等于
                                if (val == condition.values[0]) {
                                    return true;
                                }
                                break;
                            case 3: //大于
                                if (val > condition.values[0]) {
                                    return true;
                                }
                                break;
                            case 4: //大于等于
                                if (val >= condition.values[0]) {
                                    return true;
                                }
                                break;
                            case 5: //小于
                                if (val < condition.values[0]) {
                                    return true;
                                }
                                break;
                            case 6: //小于等于
                                if (val <= condition.values[0]) {
                                    return true;
                                }
                                break;
                            case 7: //介于 between
                                if (val >= condition.values[0] && val <= condition.values[1]) {
                                    return true;
                                }
                                break;
                            case 9: //包含 like
                                if ((typeof val === "string") && (val.indexOf(condition.values[0]) > -1)) {
                                    return true;
                                }
                                break;
                            case 10: //为空 isnull
                                if (!val && val !== 0) {
                                    return true;
                                }
                                break;
                        }
                        return false;
                    }
                    for (var i = 1, l = conditions.length; i < l; i++) { //从第二项开始过滤resultData
                        doFilter(conditions[i]);
                    }
                    return resultData;
                };
                var showOriginTable = function () {
                    self.para.multPage = originMultPage;
                    self.tableData.dealTable(originData, true);
                    if (originMultPage !== 0 && originData.length > self.pagination.pageLen) {
                        self.pagination.reset({
                            offset: 0,
                            recordTotal: originData.length
                        });
                    }
                    self.pagination.isShow(originData);
                };
                var builder = null;
                var search = function () {
                    var searchData = builder.dataGet();
                    if (searchData && searchData.params) {
                        var result = start(searchData.params);
                        _this.para.multPage = 2;
                        _this.pagination.setParam(1);
                        _this.tableData.dealTable(result, true);
                        if (originMultPage !== 0 && result.length > _this.pagination.pageLen) {
                            _this.pagination.reset({
                                offset: 0,
                                recordTotal: result.length
                            });
                        }
                        _this.pagination.isShow(result);
                    }
                };
                var show = (function () {
                    var modal = null;
                    var searchHandler = function () {
                        search();
                        modal.isShow = false;
                    };
                    var init = function () {
                        if (builder === null) {
                            var body = tools.isMb ?
                                h("div", { className: "mui-content" },
                                    h("ul", { className: "mui-table-view", "data-query-name": "local" }),
                                    h("div", { "data-action": "add", "data-name": "local", className: "mui-btn mui-btn-block mui-btn-primary" },
                                        h("span", { className: "mui-icon mui-icon-plusempty" }),
                                        " \u6DFB\u52A0\u6761\u4EF6"))
                                :
                                    h("form", { className: "filter-form", "data-query-name": "local" },
                                        h("span", { "data-action": "add", className: "iconfont blue icon-jiahao" }));
                            modal = new Modal_1.Modal({
                                container: d.closest(_this.wrapper, '.page-container'),
                                header: '本地过滤',
                                body: body,
                                position: tools.isMb ? 'full' : '',
                                width: '730px',
                                className: 'local queryBuilder'
                            });
                            modal.className = '';
                            modal.className = '';
                            if (tools.isMb) {
                                modal.modalHeader.rightPanel = (function () {
                                    var rightInputBox = new InputBox_1.InputBox(), clearBtn = new Button_1.Button({
                                        content: '清除',
                                        onClick: function () {
                                            showOriginTable();
                                            modal.isShow = false;
                                        }
                                    }), saveBtn = new Button_1.Button({
                                        icon: 'sousuo',
                                        onClick: searchHandler
                                    });
                                    rightInputBox.addItem(clearBtn);
                                    rightInputBox.addItem(saveBtn);
                                    return rightInputBox;
                                })();
                                mui(body).on('tap', '[data-action="add"]', function () {
                                    builder.rowAdd();
                                    var ul = this.previousElementSibling;
                                    ul.scrollTop = ul.scrollHeight;
                                });
                            }
                            else {
                                modal.footer = {
                                    rightPanel: (function () {
                                        var rightBox = new InputBox_1.InputBox();
                                        rightBox.addItem(new Button_1.Button({
                                            content: '取消',
                                            type: 'default',
                                            key: 'cancelBtn'
                                        }));
                                        rightBox.addItem(new Button_1.Button({
                                            content: '清除',
                                            type: 'default',
                                            key: 'clearBtn',
                                            onClick: function () {
                                                showOriginTable();
                                                modal.isShow = false;
                                            }
                                        }));
                                        rightBox.addItem(new Button_1.Button({
                                            content: '查询',
                                            type: 'primary',
                                            onClick: searchHandler,
                                            key: 'queryBtn'
                                        }));
                                        return rightBox;
                                    })()
                                };
                            }
                            builder = new queryBuilder_1.QueryBuilder({
                                queryConfigs: initQueryConfigs(_this.cols),
                                resultDom: tools.isMb ? d.query('ul.mui-table-view', body) : body,
                                setting: null // 默认值
                            });
                        }
                        function initQueryConfigs(cols) {
                            return cols.map(function (col) {
                                return {
                                    caption: col.title,
                                    field_name: col.name,
                                    dynamic: 0,
                                    link: '',
                                    type: '',
                                    atrrs: col.atrrs
                                };
                            });
                        }
                    };
                    return function () {
                        init();
                        modal.isShow = true;
                    };
                })();
                var setOriginData = function (newData) {
                    originData = newData;
                };
                var setOriginMultPage = function (multPage) {
                    originMultPage = multPage;
                };
                var getOriginMultPage = function () {
                    return originMultPage;
                };
                var queryDataGet = function () {
                    return builder ? builder.dataGet() : null;
                };
                return { show: show, search: search, queryDataGet: queryDataGet, setOriginData: setOriginData, setOriginMultPage: setOriginMultPage, getOriginMultPage: getOriginMultPage };
            })(this);
            /**
             * 统计公共方法
             * @type {{initStatistic: ((target) => boolean); initChart: ((target) => boolean); initCrosstab: ((target) => boolean); initAnalysis: ((target) => boolean)}}
             */
            this.statistic = (function () {
                var chart = null, crosstab = null, analysis = null, statistic = null, count = null;
                var hasStatistic = function () {
                    for (var i = 0; i < _this.cols.length; i++) {
                        if (BwRule_1.BwRule.isNumber(_this.cols[i].dataType)) {
                            return true;
                        }
                    }
                    return false;
                };
                var initStatistic = function (target) {
                    if (!hasStatistic()) {
                        Modal_1.Modal.alert('无可统计字段');
                        return false;
                    }
                    var init = function () {
                        var temp = new statistic({
                            container: d.closest(_this.wrapper, 'div.page-container'),
                            cols: _this.cols,
                            colDataGet: function (index) {
                                return _this.table.colDataGet(index);
                            },
                            paraGet: function () {
                                var tempResult = _this.tableConfGet({
                                    tmPara: _this.para,
                                    btPara: {}
                                });
                                delete tempResult.cellMaxWidth;
                                delete tempResult.onComplete;
                                return tempResult;
                            },
                            getVisibleCol: function () {
                                return _this.table.getVisibleCol();
                            }
                        });
                        temp.getModal().isShow = true;
                    };
                    if (!statistic && hasStatistic()) {
                        var sp_1 = null;
                        target && (sp_1 = new spinner_1.Spinner({
                            el: target,
                            size: 14,
                            type: spinner_1.Spinner.SHOW_TYPE.replace,
                        }));
                        sp_1 && sp_1.show();
                        require(['StatisticBasic'], function (Statistic) {
                            statistic = Statistic;
                            init();
                            sp_1 && sp_1.hide();
                        });
                    }
                    else {
                        init();
                    }
                };
                var initChart = function (target) {
                    if (!hasStatistic()) {
                        Modal_1.Modal.alert('无可统计字段');
                        return false;
                    }
                    var init = function () {
                        var temp = new chart({
                            container: d.closest(_this.wrapper, 'div.page-container'),
                            cols: _this.cols,
                            allData: function () {
                                return _this.table.data.get();
                            },
                            selectedData: function () {
                                return _this.table.rowSelectDataGet();
                            },
                            colDataGet: function (index) {
                                return _this.table.colDataGet(index);
                            },
                            getTablePara: function () {
                                return _this.para;
                            },
                            getWrapper: function () {
                                return _this.wrapper;
                            },
                            getVisibleCol: function () {
                                return _this.table.getVisibleCol();
                            }
                        });
                        temp.getModal().isShow = true;
                    };
                    if (!chart && hasStatistic()) {
                        var sp_2 = null;
                        target && (sp_2 = new spinner_1.Spinner({
                            el: target,
                            size: 14,
                            type: spinner_1.Spinner.SHOW_TYPE.replace,
                        }));
                        sp_2 && sp_2.show();
                        require(['ChartBasic'], function (Chart) {
                            chart = Chart;
                            init();
                            sp_2 && sp_2.hide();
                        });
                    }
                    else {
                        init();
                    }
                };
                var initCrosstab = function (target) {
                    if (!hasStatistic()) {
                        Modal_1.Modal.alert('无可统计字段');
                        return false;
                    }
                    var init = function () {
                        var temp = new crosstab({
                            container: d.closest(_this.wrapper, 'div.page-container'),
                            cols: _this.cols,
                            allData: function () {
                                return _this.table.data.get();
                            },
                            selectedData: function () {
                                return _this.table.rowSelectDataGet();
                            },
                            paraGet: function () {
                                var tempResult = _this.tableConfGet({
                                    tmPara: _this.para,
                                    btPara: {}
                                });
                                delete tempResult.cellMaxWidth;
                                delete tempResult.onComplete;
                                return tempResult;
                            },
                            getVisibleCol: function () {
                                return _this.table.getVisibleCol();
                            }
                        });
                        temp.getModal().isShow = true;
                    };
                    if (!crosstab && hasStatistic()) {
                        var sp_3 = null;
                        target && (sp_3 = new spinner_1.Spinner({
                            el: target,
                            size: 14,
                            type: spinner_1.Spinner.SHOW_TYPE.replace,
                        }));
                        sp_3 && sp_3.show();
                        require(['CrossTabBasic'], function (CrossTab) {
                            crosstab = CrossTab;
                            init();
                            sp_3 && sp_3.hide();
                        });
                    }
                    else {
                        init();
                    }
                };
                var initAnalysis = function (target) {
                    if (!hasStatistic()) {
                        Modal_1.Modal.alert('无可统计字段');
                        return false;
                    }
                    var init = function () {
                        var temp = new analysis({
                            container: d.closest(_this.wrapper, 'div.page-container'),
                            cols: _this.cols,
                            allData: function () {
                                return _this.table.data.get();
                            },
                            selectedData: function () {
                                return _this.table.rowSelectDataGet();
                            },
                            paraGet: function () {
                                var tempResult = _this.tableConfGet({
                                    tmPara: _this.para,
                                    btPara: {}
                                });
                                delete tempResult.cellMaxWidth;
                                delete tempResult.onComplete;
                                return tempResult;
                            },
                            getVisibleCol: function () {
                                return _this.table.getVisibleCol();
                            }
                        });
                        temp.getModal().isShow = true;
                    };
                    if (!analysis && hasStatistic()) {
                        var sp_4 = null;
                        target && (sp_4 = new spinner_1.Spinner({
                            el: target,
                            size: 14,
                            type: spinner_1.Spinner.SHOW_TYPE.replace,
                        }));
                        sp_4 && sp_4.show();
                        require(['AnalysisBasic'], function (Analysis) {
                            analysis = Analysis;
                            init();
                            sp_4 && sp_4.hide();
                        });
                    }
                    else {
                        init();
                    }
                };
                var initCount = function (target) {
                    var init = function () {
                        var temp = new count({
                            container: d.closest(_this.wrapper, 'div.page-container'),
                            cols: _this.cols,
                            colDataGet: function (colName) { return _this.table.colDataGet(colName); },
                            getVisibleCol: function () {
                                return _this.table.getVisibleCol();
                            }
                        });
                        temp.getModal().isShow = true;
                    };
                    if (!count) {
                        require(['Count'], function (Count) {
                            count = Count;
                            init();
                        });
                    }
                    else {
                        init();
                    }
                };
                return { initStatistic: initStatistic, initChart: initChart, initCrosstab: initCrosstab, initAnalysis: initAnalysis, initCount: initCount };
            })();
            /**
             * 钻取表格图形统计
             * @type {{init: ((wrapper: HTMLElement) => any); getChartBut: (() => any); getTableBut: (() => any)}}
             */
            this.initDrillBut = (function (self) {
                var tempBut = null, chartBut = null, tableBut = null;
                var init = function (wrapper) {
                    tempBut = h("div", null);
                    chartBut = h("div", null);
                    tableBut = h("div", null);
                    chartBut.style.display = 'inline-block';
                    tableBut.style.display = 'none';
                    var but = new Button_1.Button({
                        container: chartBut,
                        icon: 'bingzhuangtu',
                        size: 'large',
                        type: 'text',
                        onClick: function (e) {
                            self.statistic.initChart(chartBut);
                        }
                    });
                    new Button_1.Button({
                        container: tableBut,
                        size: 'large',
                        icon: 'biaoge',
                        type: 'text',
                        onClick: function (e) {
                            var hasChart = d.query('.Echart_body', wrapper);
                            if (hasChart) {
                                hasChart.style.display = 'none';
                            }
                            var child = d.query('.mobileTableWrapper', wrapper);
                            child.style.display = 'block';
                            tableBut.style.display = 'none';
                        }
                    });
                    tempBut.classList.add('statisticsChart');
                    tempBut.appendChild(chartBut);
                    tempBut.appendChild(tableBut);
                    var par = d.closest(wrapper, 'li');
                    d.append(tools.isMb ? par.firstElementChild : wrapper.parentElement, tempBut);
                };
                var getChartBut = function () {
                    return chartBut;
                };
                var getTableBut = function () {
                    return tableBut;
                };
                return { init: init, getChartBut: getChartBut, getTableBut: getTableBut };
            })(this);
            this.tableEdit = null;
            this.editBtns = (function () {
                var isEditing = false, btns = {}, editBtnData = [], isMain = true, subVarList = null, mainVarList = null;
                var dbclick = (function () {
                    var self = _this, handler = function () {
                        var _this = this;
                        isEditing = true;
                        self.tableEdit.init(function () {
                            start();
                            _this.click();
                        });
                    };
                    return {
                        on: function () {
                            d.on(_this.wrapper.parentNode, 'dblclick', '.table-module-wrapper tbody td', handler);
                        },
                        off: function () {
                            d.off(_this.wrapper.parentNode, 'dblclick', '.table-module-wrapper tbody td', handler);
                        }
                    };
                })();
                var btnStatus = {
                    end: function (isMain) {
                        var addr = isMain ? mainVarList : subVarList, status = {
                            edit: editVarHas(mainVarList, ['update']) || editVarHas(subVarList, ['update']),
                            insert: editVarHas(addr, ['insert']),
                            del: editVarHas(addr, ['delete']),
                            save: false,
                            cancel: false
                        };
                        for (var key in btns) {
                            if (btns[key]) {
                                btns[key].isDisabled = !status[key];
                            }
                        }
                    },
                    start: function (isMain, isDel) {
                        if (isDel === void 0) { isDel = false; }
                        var addr = isMain ? mainVarList : subVarList, status = {
                            edit: false,
                            insert: editVarHas(addr, ['insert']),
                            del: editVarHas(addr, ['delete']),
                            save: true,
                            cancel: true
                        };
                        for (var key in btns) {
                            if (btns[key] && (isDel ? key !== 'edit' : true)) {
                                btns[key].isDisabled = !status[key];
                            }
                        }
                    }
                };
                var init = function () {
                    btnStatus.end(isMain);
                    if (!tools.isMb) {
                        dbclick.on();
                    }
                };
                var start = function (isDel) {
                    if (isDel === void 0) { isDel = false; }
                    btnStatus.start(isMain, isDel);
                    _this.pagination.show(false);
                    if (!tools.isMb) {
                        dbclick.off();
                    }
                    isEditing = true;
                };
                var end = function () {
                    isEditing = false;
                    btnStatus.end(isMain);
                    _this.pagination.show(true);
                    if (!tools.isMb) {
                        dbclick.on();
                    }
                };
                var op = {
                    insert: function () {
                        if (isEditing) {
                            _this.tableEdit.add();
                        }
                        else {
                            _this.tableEdit.init(function () {
                                isEditing = true;
                                start();
                                _this.tableEdit.add();
                            });
                        }
                    },
                    del: function () {
                        var isEmpty = tools.isEmpty, subTable = _this.subTable && _this.subTable.table;
                        if (isEmpty(_this.table.rowSelectDataGet()) && isEmpty((subTable && subTable.rowSelectDataGet()))) {
                            return;
                        }
                        start(true);
                        _this.tableEdit.del();
                    },
                    save: function () {
                        _this.tableEdit.save(function () { return end(); });
                    },
                    cancel: function () {
                        _this.tableEdit.cancel();
                        end();
                    },
                    edit: function () {
                        _this.tableEdit.init(function () {
                            start();
                            isEditing = true;
                        });
                    }
                };
                var initInner = function (wrapper) {
                    var tableAddr = _this.para.tableAddr, temp = getMainSubVarList(tableAddr);
                    subVarList = temp.subVarList;
                    mainVarList = temp.mainVarList;
                    if (!mainVarList && !subVarList) {
                        return;
                    }
                    _this.tableEdit = new TableEdit_1.TableEdit({
                        tm: _this,
                        tableAddr: tableAddr,
                        cols: _this.para.cols // 需要用到隐藏列 用原始cols
                    });
                    _this.tableEdit.onFocusChange(function (isMain) {
                        btnStatus[isEditing ? 'start' : 'end'](isMain);
                    });
                    d.once(_this.wrapper, 'subTableInit', function () {
                        _this.tableEdit.subTm = _this.subTable;
                    });
                    editBtnData = [
                        { content: '编辑', subType: 'edit' },
                        { content: '新增', subType: 'insert' },
                        { content: '删除', subType: 'del' },
                        { content: '保存', subType: 'save' },
                        { content: '取消', subType: 'cancel' }
                    ];
                    var editBtns = new InputBox_1.InputBox({ container: wrapper });
                    editBtnData.forEach(function (btnData) {
                        var btn = new Button_1.Button({
                            content: btnData.content,
                            data: btnData
                        });
                        btn.onClick = function () {
                            var subType = btn.data.subType;
                            op[subType] && op[subType]();
                        };
                        editBtns.addItem(btn);
                        btns[btnData.subType] = btn;
                    });
                };
                var has = function () {
                    var _a = getMainSubVarList(_this.para.tableAddr), mainVarList = _a.mainVarList, subVarList = _a.subVarList;
                    return mainVarList || subVarList;
                };
                return {
                    init: function (wrapper) {
                        initInner(wrapper);
                        init();
                    },
                    edit: function () { return op.edit(); },
                    has: has,
                    btnStart: start,
                    btnSave: function () { return op.save(); }
                };
            })();
            var self = this, tableDom = tableConf.tableEl, ajaxUrl = (this.para.dataAddr ? CONF.siteUrl + BwRule_1.BwRule.reqAddr(this.para.dataAddr) : null), subTableList = para.subTableList;
            // 初始化列
            this.colsInit();
            this.isSub = this.para.isSub;
            // this.tableData = new TableDataModule({
            //     tableModule: this,
            //     tableConf,
            //     para
            // });
            // 钻取
            this.isDrill = ['web', 'webdrill', 'drill'].indexOf(this.para.uiType) > -1;
            // 子表判断
            if (subTableList && subTableList[0]) {
                subTableList[0].isSub = true;
                this.subTableData = subTableList[0];
                this.subTableData.tableAddr = this.para.tableAddr;
            }
            // 初始化dom
            this.initWrapper(tableDom);
            if (!this.wrapper) {
                this.wrapper = tableDom.parentElement;
            }
            // 界面url
            this.pageUrl = (function () {
                if (tools.isMb) {
                    return location.href;
                }
                else {
                    var pageContainer = d.closest(_this.wrapper, '.page-container[data-src]');
                    return pageContainer ? pageContainer.dataset.src : '';
                }
            })();
            this.tableData = new TableDataModule_1.TableDataModule({
                tableModule: this,
                tableConf: tableConf,
                para: para,
                pageUrl: this.pageUrl
            });
            // debugger;
            var isQuery = para.querier && (para.querier.queryType === 3);
            // 交叉制表
            if (para.relateType === 'P') {
                if (isQuery) {
                    self.refresher = function (newAjaxData, cb) {
                        self.initPivotTable(tableDom, para, newAjaxData, cb);
                    };
                }
                else {
                    self.initPivotTable(tableDom, para, null);
                }
            }
            else {
                var isAbsField = false;
                for (var i = 0; i < this.cols.length; i++) {
                    if (this.cols[i].subcols) {
                        isAbsField = true;
                        break;
                    }
                }
                // 非交叉制表
                var btPara = {
                    table: tableDom,
                    cols: this.cols
                };
                // 抽象字段
                if (isAbsField) {
                    btPara['multi'] = {
                        enabled: true,
                        cols: this.getMulitPara.getMulitCols(this.cols, false),
                    };
                    btPara.cols = this.getMulitPara.getColsIndex();
                }
                // 创建表格
                this.initTableModule(btPara, para, function () {
                    self.onComplete();
                });
                onComplete();
                // 有查询器分页刷新方法
                self.refresher = function (reqPara, after, before) {
                    _this.tableData.innerRefresher(reqPara, after, before);
                };
                // 查询器自动查询
                if (ajaxUrl && !isQuery) {
                    var ajaxData_1 = self.pagination.getParam(true);
                    if (typeof tableConf.ajaxData === 'object') {
                        ajaxData_1 = tools.obj.merge(ajaxData_1, tableConf.ajaxData);
                    }
                    setTimeout(function () {
                        _this.tableData.innerRefresher(ajaxData_1, _this.tableData.cbFun.getOuterAfter(), _this.tableData.cbFun.getOuterBefore());
                    });
                }
                // 默认设置空数据
                else {
                    if (self.para.data) {
                        var data = self.para.data;
                        this.tableData.dealData(data, data.length);
                    }
                    else {
                        this.tableData.dealData([], 0);
                    }
                }
            }
            function onComplete() {
                // TODO 判断是否开始异步查询
                self.initTableEvent.init(self.table);
                if (!self.para.isSub) {
                    self.aggregate.get();
                }
            }
            if (isQuery) {
                // 有查询器
                var queryModuleName = tools.isMb ? 'QueryModuleMb' : 'QueryModulePc';
                var modalWrapper_1 = d.closest(this.wrapper, 'div.modal-wrapper');
                if (para.querier.autTag === 1) {
                    modalWrapper_1 && modalWrapper_1.classList.add('hide');
                }
                // 动态加载查询模块
                require([queryModuleName], function (Query) {
                    _this.queryModule = new Query({
                        qm: _this.para.querier,
                        refresher: function (ajaxData, after, before) {
                            _this.refresher(ajaxData, after, before);
                            modalWrapper_1 && modalWrapper_1.classList.remove('hide');
                        },
                        cols: _this.cols,
                        url: ajaxUrl,
                        container: d.closest(tableDom, '.page-container'),
                        tableGet: function () { return self.table; }
                    });
                    if (tools.isMb) {
                        //打开查询面板
                        d.on(d.query('body > header [data-action="showQuery"]'), 'click', function () {
                            _this.queryModule.show();
                        });
                    }
                    if (para.querier.autTag === 0) {
                        _this.queryModule.hide();
                    }
                    else {
                        modalWrapper_1 && modalWrapper_1.classList.add('hide');
                    }
                });
            }
        }
        TableModule.prototype.colsInit = function () {
            var cols = this.para.cols;
            cols.forEach(function (col) {
                if (BwRule_1.BwRule.NoShowFields.indexOf(col.name) > -1) {
                    col.noShow = true;
                }
                if (col.dataType === BwRule_1.BwRule.DT_DATETIME && !col.displayFormat) {
                    col.displayFormat = 'yyyy-MM-dd HH:mm:ss';
                }
                if (col.dataType === BwRule_1.BwRule.DT_TIME && !col.displayFormat) {
                    col.displayFormat = 'HH:mm:ss';
                }
            });
            this.defaultData = BwRule_1.BwRule.getDefaultByFields(cols);
            this.cols = cols.filter(function (col) { return !col.noShow; });
        };
        TableModule.prototype.initTableModule = function (btPara, para, callback) {
            this.table = this.initTable(this.tableConfGet({
                tmPara: para,
                btPara: btPara
            }));
            callback();
        };
        TableModule.prototype.tableConfGet = function (para) {
            var _this = this;
            var self = this, tmPara = para.tmPara, btPara = para.btPara;
            var tm2conf = {
                lockColNum: tmPara.fixedNum,
                // length: tmPara.pageLen,
                move: false,
                // indexCol: sys.isMb ? 'select': 'number',
                indexCol: 'number',
                indexColMulti: 'multiSelect' in tmPara ? tmPara.multiSelect : true,
                cols: btPara.cols || tmPara.cols
            };
            if ('fixTop' in this.tableConf) {
                tm2conf.lockRow = true;
                tm2conf.lockRowTop = this.tableConf.fixTop;
            }
            var basicConf = {
                sort: self.para.multPage === 1 ? 2 : 1,
                thead: true,
                Container: this.tableConf.scrollEl,
                colMenu: [{
                        multi: true,
                        title: '复制列',
                        callback: function (btn, cols) {
                            sys && sys.window.copy(_this.table.copy.col(cols[0].dataset.col, true));
                        }
                    }],
                rowMenu: [{
                        multi: true,
                        title: '复制行',
                        callback: function (btn, rows) {
                            sys && sys.window.copy(_this.table.copy.selectedRow(true));
                        }
                    }],
                textFormat: function (trData, col, index) {
                    var text, tdDate = trData[col.name];
                    if (col.dataType === BwRule_1.BwRule.DT_IMAGE && col.link) {
                        // 缩略图
                        text = self.imgHtmlGet(tools.url.addObj(CONF.siteUrl + BwRule_1.BwRule.reqAddr(col.link, trData), _this.tableData.getQueryPara()));
                    }
                    else if (col.name === 'STDCOLORVALUE') {
                        // 显示颜色
                        var _a = tools.val2RGB(tdDate), r = _a.r, g = _a.g, b = _a.b;
                        text = "<div style=\"background-color:rgb(" + r + "," + g + "," + b + ");height: 100%;\"></div>";
                    }
                    else if (col.elementType === 'lookup') {
                        var options = _this.tableData.lookUpData[col.name] || [];
                        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                            var opt = options_1[_i];
                            if (opt.value == tdDate) {
                                text = opt.text;
                            }
                        }
                    }
                    else {
                        // 其他文字
                        text = BwRule_1.BwRule.formatTableText(tdDate, col);
                    }
                    // 控制字符串最大长度
                    var maxLen = _this.maxCellWidth, textType = '';
                    if (!col.dataType) {
                        textType = 'string';
                    }
                    else if (col.dataType === BwRule_1.BwRule.DT_HTML) {
                        textType = 'html';
                    }
                    else if (col.dataType === BwRule_1.BwRule.DT_MULTI_TEXT) {
                        textType = 'multiText';
                    }
                    if (textType) {
                        var beforeText = text = tools.str.toEmpty(text);
                        text = tools.str.cut(text.toString(), maxLen);
                        if (beforeText !== text) {
                            text += (tools.isMb ? '　　' : '') + "<div class=\"more-text-button detail-more\"  data-text-type=\"" + textType + "\">...</div>";
                        }
                    }
                    return text;
                },
                beforeShow: function (trData, colsData) {
                    return self.dataFormat(para.tmPara, trData, colsData);
                }
            };
            if (!btPara.multi) {
                basicConf.colMenu.push({
                    multi: true,
                    title: '锁定/解锁列',
                    callback: function (btn, cols) {
                        _this.table.colToggleLock(cols[0].dataset.col);
                    }
                });
            }
            var pictureAddrList = self.para.pictureAddrList;
            if (Array.isArray(pictureAddrList) && this.para.cols.some(function (col) { return col.atrrs && col.atrrs.dataType == '20' && col.noShow; })) {
                basicConf.rowMenu.push({
                    multi: false,
                    title: '查看图片',
                    callback: function (btn, cols) {
                        var bt = _this.table, selected = bt.trSelected[0];
                        if (!selected) {
                            return;
                        }
                        var index = parseInt(selected.dataset.index), imgs = pictureAddrList.map(function (addr) {
                            return CONF.siteUrl + BwRule_1.BwRule.reqAddr(addr, bt.rowDataGet(index));
                        });
                        self.handleImg(imgs, index);
                    }
                });
                basicConf.rowMenu.push({
                    multi: true,
                    title: '并列图片',
                    callback: function (btn, cols) {
                        var imgs = [], textArr = [], bt = _this.table, selected = bt.trSelected, addr = pictureAddrList && pictureAddrList[0];
                        if (!selected || !addr) {
                            return;
                        }
                        selected.forEach(function (tr) {
                            var index = parseInt(tr.dataset.index), rowData = bt.rowDataGet(index);
                            imgs.push(CONF.siteUrl + BwRule_1.BwRule.reqAddr(addr, rowData));
                            var pattern = rowData.PATTERN || '';
                            textArr.push(pattern);
                        });
                        img_1.ImgModal.show({
                            img: imgs,
                            isThumbnail: true,
                            textArr: textArr
                        });
                        // self.handleImg(imgs, index);
                    }
                });
            }
            var paraConf = this.tableConf.tablePara ? this.tableConf.tablePara : {};
            if (Array.isArray(paraConf.rowMenu)) {
                basicConf.rowMenu = basicConf.rowMenu.concat(paraConf.rowMenu);
                delete paraConf.rowMenu;
            }
            if (Array.isArray(paraConf.colMenu)) {
                basicConf.colMenu = basicConf.colMenu.concat(paraConf.colMenu);
                delete paraConf.colMenu;
            }
            return tools.obj.merge(basicConf, paraConf, tm2conf, btPara);
        };
        TableModule.prototype.dataFormat = function (tmPara, trData, cols) {
            var row = { tr: {}, td: [] }, isImg = tmPara.pictureAddrList && tmPara.pictureAddrList[0];
            // 从表
            if (tmPara.subTableList && tmPara.subTableList[0]) {
                // row.tr['data-sub-url'] = rule.reqAddr(this.subTableData.dataAddr, trData);
                row.tr['data-sub-url'] = tmPara.subTableList[0].dataAddr.dataAddr;
            }
            // 行背景和文字变色
            ['GRIDBACKCOLOR', 'GRIDFORECOLOR'].forEach(function (name, i) {
                var colorVal = trData[name];
                if (colorVal) {
                    // 显示颜色
                    var _a = tools.val2RGB(colorVal), r = _a.r, g = _a.g, b = _a.b;
                    row.tr['style'] = (i === 0 ? 'background-color' : 'color') + ":rgb(" + r + "," + g + "," + b + ");";
                    if (i === 1) {
                        row.tr['class'] = 'tr-color';
                    }
                }
            });
            // 图片
            if (isImg && !this.cols.some(function (col) { return BwRule_1.BwRule.DT_IMAGE === col.atrrs.dataType; })) {
                row.tr['data-click-type'] = 'img';
            }
            var subBtns = this.para.subButtons, btnsLinkName = Array.isArray(subBtns) ? subBtns.map(function (btn) { return btn.linkName; }) : [];
            cols.forEach(function (col, index) {
                // 时间
                if (trData[col.name] && BwRule_1.BwRule.isTime(col.dataType)) {
                    trData[col.name] = BwRule_1.BwRule.strDateFormat(trData[col.name], col.displayFormat);
                }
                var classes = [], text = trData[col.name], attrs = {}, colIsImg = col.dataType === BwRule_1.BwRule.DT_IMAGE;
                // 样式处理
                if (typeof text === 'number') {
                    classes.push('text-right');
                }
                if (colIsImg) {
                    classes.push('td-img');
                }
                else if (col.dataType === BwRule_1.BwRule.DT_MULTI_TEXT) {
                    classes.push('td-multi-text');
                }
                if (col.drillAddr && col.drillAddr.dataAddr) {
                    var drillAddr = BwRule_1.BwRule.drillAddr(col.drillAddr, trData, tmPara.keyField);
                    if (drillAddr) {
                        attrs['data-href'] = drillAddr;
                        attrs['data-gps'] = col.drillAddr.needGps;
                        classes.push('blue');
                    }
                }
                if (col.webDrillAddr && col.webDrillAddr.dataAddr) {
                    var webDrillAddr = BwRule_1.BwRule.webDrillAddr(col.webDrillAddr, trData, tmPara.keyField);
                    if (webDrillAddr) {
                        attrs['data-href'] = webDrillAddr;
                        attrs['data-gps'] = col.webDrillAddr.needGps;
                        classes.push('blue');
                    }
                }
                if (col.webDrillAddrWithNull && col.webDrillAddrWithNull.dataAddr) {
                    var webDrillAddrWithNull = BwRule_1.BwRule.webDrillAddrWithNull(col.webDrillAddrWithNull, trData, tmPara.keyField);
                    if (webDrillAddrWithNull) {
                        attrs['data-href'] = webDrillAddrWithNull;
                        attrs['data-gps'] = col.webDrillAddrWithNull.needGps;
                        classes.push('blue');
                    }
                }
                if (col.link && !colIsImg && (col.endField ? trData[col.endField] === 1 : true)) {
                    var _a = BwRule_1.BwRule.reqAddrFull(col.link, trData), addr = _a.addr, data = _a.data;
                    if (!tools.isEmpty(data)) {
                        attrs['data-href'] = tools.url.addObj(addr, data);
                        attrs['data-gps'] = col.link.needGps;
                        classes.push('blue');
                        switch (col.link.type) {
                            case 'file':
                                attrs['data-href-type'] = 'file';
                                break;
                        }
                    }
                }
                if (btnsLinkName.some(function (name) { return name === col.name; })) {
                    attrs['data-click-type'] = 'btn';
                    classes.push('blue');
                }
                if (classes[0]) {
                    attrs['class'] = classes.join(' ');
                }
                row.td.push(attrs);
            });
            return row;
        };
        TableModule.prototype.lockBottom = function (isWake) {
            if (isWake === void 0) { isWake = false; }
            if (!tools.isMb) {
                var pageContainer = this.tableConf.scrollEl;
                if (pageContainer.getBoundingClientRect().width !== 0) {
                    //将表格滚动条调至最顶部
                    !isWake && pageContainer && (pageContainer.scrollTop = 0);
                    this.onLoad.getscrollBar() && this.onLoad.getBottomPaging() ? this.onLoad.getscrollBar().updateStyle() : this.onLoad.init();
                }
                if (this.subTable) {
                    this.subTable.lockBottom(isWake);
                }
            }
        };
        ;
        TableModule.prototype.initPivotTable = function (tableDom, tableConf, ajaxData, cb) {
            var _this = this;
            if (ajaxData === void 0) { ajaxData = {}; }
            var isFirst = tableDom.classList.contains('mobileTable');
            //设置初始分页条件
            this.localSearch.getOriginMultPage() !== null &&
                (this.para.multPage = this.localSearch.getOriginMultPage());
            this.tableData.ajax(ajaxData, function (response) {
                cb && cb(response);
                if (!response) {
                    return;
                }
                var responseData = response.data, newTableData = BwRule_1.BwRule.getCrossTableCols(response.meta, tableConf.cols);
                var tempCount = [], tempCols = [];
                for (var i = 0; i < newTableData.cols.length; i++) {
                    var col = newTableData.cols[i];
                    if (((col.title.indexOf('.') > -1) && (col.name.indexOf('小计') > -1)) || col.title.indexOf('.') === -1) {
                        tempCount.push(newTableData.cols[i]);
                    }
                    else {
                        tempCols.push(newTableData.cols[i]);
                    }
                }
                newTableData.cols = tempCount.concat(tempCols);
                // tableConf.cols = newTableData.cols;
                tableConf.fixedNum = newTableData.lockNum >= 2 ? 2 : newTableData.lockNum;
                tableDom.classList.add('min-width');
                var btPara = {
                    table: tableDom,
                    multi: {
                        enabled: true,
                        cols: _this.getMulitPara.getMulitCols(newTableData.cols, true),
                    },
                    cols: _this.getMulitPara.getColsIndex()
                };
                _this.initTableModule(btPara, tableConf, function () {
                    isFirst && _this.onComplete();
                    _this.initTableEvent.init(_this.table);
                });
                _this.tableData.dealTable(responseData, true);
                var totalNum = response.head.totalNum ? response.head.totalNum : response.data.length;
                if (_this.para.multPage !== 0 && totalNum > _this.pagination.pageLen) {
                    _this.pagination.reset({
                        offset: 0,
                        recordTotal: totalNum
                    });
                }
                _this.lockBottom();
                // mt.attr('ajax', this.tableCommonAjax(url));
                _this.refresher = function (ajaxData, after, before) {
                    _this.table.destroy();
                    var newTable = h("table", null);
                    _this.wrapper.appendChild(newTable);
                    _this.initPivotTable(newTable, tableConf, ajaxData, after);
                };
                //设置前台查询缓存数据
                _this.localSearch.setOriginMultPage(_this.para.multPage);
                _this.localSearch.setOriginData(_this.table.data.get());
            });
        };
        TableModule.prototype.autoSubTable = function () {
            if (!this.para.isSub && this.subTableData) {
                var firstTr = d.query('table tbody tr', this.table.wrapperGet());
                if (firstTr) {
                    firstTr.click();
                    if (this.subTable) {
                        this.subTable.wrapper.classList.remove('hide');
                    }
                }
                else if (this.subTable) {
                    this.subTable.wrapper.classList.add('hide');
                }
            }
        };
        /**
         * 初始化构造业务按钮组
         */
        TableModule.prototype.initSubBtns = function (wrapper) {
            var self = this, table = this.table, btnsData = self.para.subButtons;
            // btnsData[0].multiselect = 2;
            // btnsData[0].selectionFlag = 1;
            self.subBtn = new InputBox_1.InputBox({
                container: wrapper,
                isResponsive: !tools.isMb
            });
            btnsData && btnsData[0] && btnsData.forEach(function (btnData) {
                var btn = new Button_1.Button({
                    icon: btnData.icon,
                    content: btnData.title,
                    isDisabled: !(btnData.multiselect === 0 || btnData.multiselect === 2 && btnData.selectionFlag),
                    data: btnData
                });
                btn.onClick = function () {
                    var btnData = btn.data, selectedData = btnData.multiselect === 2 && btnData.selectionFlag ?
                        table.rowUnselectDataGet() : table.rowSelectDataGet();
                    // if (btnData.multiselect === 2 && !selectedData[0]) {
                    //     // 验证多选
                    //     Modal.alert('请至少选一条数据');
                    //     return;
                    // } else if (btn.data.multiselect === 1 && (!selectedData[0] || selectedData[1])) {
                    //     // 单选验证
                    //     Modal.alert('请选最多一条数据');
                    //     return;
                    // }
                    ButtonAction_1.ButtonAction.get().clickHandle(btn.data, btn.data.multiselect === 1 ? selectedData[0] : selectedData, function (res) { }, self.pageUrl);
                };
                self.subBtn.addItem(btn);
            });
            //根据选中行数判断按钮是否可操作，暂时做法
            self.table.on('rowSelect', function () {
                // let i = self.table.rowSelectDataGet().length;
                //
                // if(i === 0) {
                //     self.subBtn.children.forEach((btn)=>{
                //         btn.isDisabled = !(btn.data.multiselect === 0 || btn.data.multiselect === 2 && btn.data.selectionFlag);
                //         // btn.isDisabled = btn.data.multiselect > 0 || !(btn.data.multiselect === 2 && btn.data.selectionFlag);
                //     })
                // } else if(i === 1) {
                //     self.subBtn.children.forEach(btn => {
                //         btn.isDisabled = false;
                //     })
                // } else {
                //     self.subBtn.children.forEach(btn => {
                //         btn.isDisabled = btn.data.multiselect !== 2 ;
                //     })
                // }
                var selectedLen = self.table.rowSelectDataGet().length, allLen = self.table.rowGetAll().length;
                self.subBtn.children.forEach(function (btn) {
                    var selectionFlag = btn.data.selectionFlag, len = selectionFlag ? allLen - selectedLen : selectedLen;
                    if (len === 0) {
                        btn.isDisabled = selectionFlag ? false : btn.data.multiselect > 0;
                    }
                    else if (selectedLen === 1) {
                        btn.isDisabled = false;
                    }
                    else {
                        btn.isDisabled = btn.data.multiselect !== 2;
                    }
                });
            });
        };
        TableModule.prototype.handleImg = function (urls, rowIndex) {
            var _this = this;
            if (!this.tableImgEdit) {
                var imgFields_1 = [], thumbField_1 = '';
                this.para.cols.forEach(function (col) {
                    if (col.atrrs.dataType === '20') {
                        if (col.noShow) {
                            imgFields_1.push(col);
                        }
                        else {
                            thumbField_1 = col.name;
                        }
                    }
                });
                var mainVarList = getMainSubVarList(this.para.tableAddr).mainVarList, fieldsName_1 = imgFields_1.map(function (f) { return f.name; }), delVarList = mainVarList && mainVarList[mainVarList.deleteType] || [], upVarList = mainVarList && mainVarList[mainVarList.updateType] || [];
                this.tableImgEdit = new TableImgEdit_1.TableImgEdit({
                    // pictures: urls,
                    // index: rowIndex,
                    thumbField: thumbField_1,
                    fields: imgFields_1,
                    deletable: delVarList.some(function (v) { return fieldsName_1.includes(v.varName); }),
                    updatable: upVarList.some(function (v) { return fieldsName_1.includes(v.varName); }),
                    onUploaded: function (md5s) {
                        // this.tableEdit.
                        _this.editBtns.btnStart(true);
                        _this.tableEdit.rowData(rowIndex, md5s);
                    },
                    onSave: function () {
                        _this.editBtns && _this.editBtns.btnSave();
                    }
                });
            }
            this.tableImgEdit.isShow = true;
            // this.table.rowDataGet()
            var rowData = this.tableEdit ? this.tableEdit.rowData(rowIndex) : {}, md5s = [];
            this.tableImgEdit.fields.forEach(function (field) {
                md5s.push(rowData[field.name]);
            });
            // this.tableImgEdit.indexSet(rowIndex, urls);
            this.tableImgEdit.showImg(urls.map(function (url) { return tools.url.addObj(url, _this.tableData.getQueryPara()); }), md5s);
        };
        TableModule.prototype.destroy = function () {
            d.remove(this.table.wrapperGet());
            this.table.destroy();
            this.table = null;
            d.remove(this.wrapper);
            if (this.subTable) {
                this.subTable.table.destroy();
                d.remove(this.subTable.table.wrapperGet());
                d.remove(this.subTable.wrapper);
                this.subTable = null;
                this.subTableData = null;
                this.para = null;
                this.tableEdit = null;
                this.table = null;
            }
        };
        TableModule.prototype.getKeyField = function () {
            return this.para.keyField;
        };
        TableModule.prototype.getDefAddr = function () {
            return this.para.defDataAddrList;
        };
        /**
         * 导出报表
         */
        TableModule.prototype.export = function (action) {
            var _this = this;
            require(['tableExport'], function (tableExport) {
                var tableDom = _this.tableConf.tableEl, background = tableDom.style.backgroundColor;
                tableDom.style.backgroundColor = '#fff';
                tableExport(tableDom, _this.para.caption, action);
                tableDom.style.backgroundColor = background;
            });
        };
        return TableModule;
    }());
    exports.TableModule = TableModule;
    function editVarHas(varList, hasTypes) {
        var types = ['update', 'insert', 'delete'];
        if (varList) {
            for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                var t = types_1[_i];
                if (hasTypes.indexOf(varList[t + "Type"]) > -1) {
                    return true;
                }
            }
        }
        return false;
    }
    function getMainSubVarList(addr) {
        var varlist = {
            mainVarList: null,
            subVarList: null,
        };
        addr && Array.isArray(addr.param) && addr.param.forEach(function (p) {
            if (p.type === 'sub') {
                varlist.subVarList = p;
            }
            else if (p.type === 'main') {
                varlist.mainVarList = p;
            }
        });
        return varlist;
    }
});

/// <amd-module name="TableDataModule"/>
define("TableDataModule", ["require", "exports", "Loading", "Spinner", "BwRule"], function (require, exports, loading_1, spinner_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CONF = BW.CONF;
    var tools = G.tools;
    var TableDataModule = /** @class */ (function () {
        function TableDataModule(modulePara) {
            this.modulePara = modulePara;
            this.ajaxAfterHandlers = [];
            this.ajaxBeforeHandlers = [];
            /**
             * ajax请求
             * @param {obj} reqPara
             * @param callback
             */
            this._lookUpData = {};
            this.cbFun = (function () {
                var outerAfter = null, outerBefore = null;
                var setOuterAfter = function (fun) {
                    outerAfter = fun;
                };
                var getOuterAfter = function () {
                    return outerAfter;
                };
                var setOuterBefore = function (fun) {
                    outerBefore = fun;
                };
                var getOuterBefore = function () {
                    return outerBefore;
                };
                return { setOuterAfter: setOuterAfter, getOuterAfter: getOuterAfter, setOuterBefore: setOuterBefore, getOuterBefore: getOuterBefore };
            })();
            this.ajaxUrl = this.modulePara.para.dataAddr ? CONF.siteUrl + BwRule_1.BwRule.reqAddr(this.modulePara.para.dataAddr) : null;
            this.queryPara = {};
            this.isQuery = this.modulePara.para.querier && (this.modulePara.para.querier.queryType === 3);
        }
        TableDataModule.prototype.ajaxAfterAdd = function (handler) {
            this.ajaxAfterHandlers.push(handler);
        };
        TableDataModule.prototype.ajaxAfterRemove = function (handler) {
            this.ajaxAfterHandlers.indexOf(handler);
            // splice
        };
        TableDataModule.prototype.ajaxBeforeAdd = function (handler) {
            this.ajaxBeforeHandlers.push(handler);
        };
        TableDataModule.prototype.ajaxBeforeRemove = function (handler) {
            this.ajaxBeforeHandlers.indexOf(handler);
            // splice
        };
        Object.defineProperty(TableDataModule.prototype, "lookUpData", {
            get: function () {
                return this._lookUpData || {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TableDataModule.prototype, "lookup", {
            get: function () {
                var _this = this;
                // let allPromise = this.modulePara.para.cols
                //     .filter(col => col.elementType === 'lookup')
                //     .map(col => new Promise(((resolve, reject) =>{
                //         Rule.getLookUpOpts(col)
                //             .then((itemList) => {
                //                 resolve(itemList);
                //             }).catch(() => {
                //                 reject();
                //         })
                //     })));
                // debugger;
                if (tools.isEmpty(this._lookUpData)) {
                    var allPromise = this.modulePara.para.cols
                        .filter(function (col) { return col.elementType === 'lookup'; })
                        .map(function (col) { return BwRule_1.BwRule.getLookUpOpts(col).then(function (items) {
                        // debugger;
                        _this._lookUpData = _this._lookUpData || {};
                        _this._lookUpData[col.name] = items;
                    }); });
                    return Promise.all(allPromise).then(function () {
                        return;
                    });
                }
                else {
                    return Promise.resolve();
                }
            },
            enumerable: true,
            configurable: true
        });
        TableDataModule.prototype.ajax = function (reqPara, callback, isRefresh) {
            var _this = this;
            if (isRefresh === void 0) { isRefresh = false; }
            // debugger;
            var ajaxIsOk = false, spinner = null, doAfter = function () {
                // debugger;
                ajaxIsOk = true;
                spinner && spinner.destroy();
                _this.modulePara.tableModule.wrapper.classList.remove('disabled');
            };
            setTimeout(function () {
                if (!ajaxIsOk) {
                    _this.modulePara.tableModule.wrapper.classList.add('disabled');
                }
            }, 0);
            //若有传入新的查询条件则将新的查询条件缓存到queryPara 并且重新获取当前分页条件
            if (reqPara) {
                var cacheReq = void 0;
                this.queryPara = reqPara;
                cacheReq = tools.obj.merge(this.queryPara, this.modulePara.tableModule.pagination.getParam());
                reqPara = tools.obj.merge(reqPara, cacheReq);
            }
            //若没有新的查询条件则直接重新获取当前分页条件
            else {
                reqPara = tools.obj.merge(this.queryPara, this.modulePara.tableModule.pagination.getParam());
            }
            //后台排序的时候添加当前的排序信息
            if (this.modulePara.para.multPage === 1) {
                reqPara = tools.obj.merge(reqPara, this.modulePara.tableModule.initTableEvent.getPageSortParams());
            }
            //若异步查询，传递uiurl
            if (this.modulePara.para.isAsyn === true) {
                var url = this.modulePara.pageUrl;
                reqPara['uiurl'] = url.substring(find(url, '/', 5), url.length);
            }
            //如果是电脑端且有查询器则初始化加载效果
            if (this.isQuery || !reqPara || reqPara.pagesortparams) {
                if (!tools.isMb || isRefresh) {
                    spinner = new loading_1.Loading({
                        msg: '加载中...'
                    });
                }
            }
            function find(str, cha, num) {
                var x = str.indexOf(cha);
                for (var i = 0; i < num; i++) {
                    x = str.indexOf(cha, x + 1);
                }
                return x;
            }
            this.lookup
                .then(function () {
                BwRule_1.BwRule.Ajax.fetch(_this.ajaxUrl, {
                    timeout: 30000,
                    data: reqPara,
                    // headers: {position: JSON.stringify(gpsData)},
                    needGps: _this.modulePara.para.dataAddr.needGps
                }).then(function (_a) {
                    var response = _a.response;
                    doAfter();
                    if (response.data) {
                        // 加上OLD变量
                        var tableAddr = _this.modulePara.para.tableAddr, editAddrParam_1;
                        tableAddr && Array.isArray(tableAddr.param) && tableAddr.param.forEach(function (p) {
                            if (p && p.itemId === _this.modulePara.para.itemId) {
                                editAddrParam_1 = p;
                            }
                        });
                        if (editAddrParam_1) {
                            var varList_1 = [];
                            ['insert', 'update', 'delete'].forEach(function (type) {
                                var canOld = ['update', 'delete'].indexOf(editAddrParam_1[type + "Type"]) > -1, typeVarList = editAddrParam_1[type];
                                if (canOld && Array.isArray(typeVarList)) {
                                    varList_1 = varList_1.concat(typeVarList);
                                }
                            });
                            BwRule_1.BwRule.addOldField(BwRule_1.BwRule.getOldField(varList_1), response.data);
                        }
                    }
                    callback(response);
                }).catch(function (e) {
                    // Modal.alert(e);
                }).finally(function () {
                    doAfter();
                    callback();
                });
            }).catch(function (e) {
                // Modal.alert(e);
            });
        };
        ;
        /**
         * 表格刷新
         * @param {obj} newAjaxData
         * @param after
         * @param before
         */
        TableDataModule.prototype.refresh = function (newAjaxData, after, before) {
            var _this = this;
            var tableModule = this.modulePara.tableModule;
            newAjaxData && (this.queryPara = newAjaxData); //如果有新的查询条件怎缓存新的查询条件
            this.ajax(newAjaxData, function (res) {
                if (res) {
                    typeof before === 'function' && before(res);
                    _this.dealTable(res.data, true);
                    tableModule.pagination.isShow(res);
                    tableModule.autoSubTable();
                    //设置前台分页本地缓存数据
                    tableModule.localSearch.setOriginData(tableModule.table.data.get());
                    //判断如果存在本地查询条件则自动进行本地查询
                    if (tableModule.localSearch.queryDataGet()) {
                        tableModule.localSearch.search();
                    }
                    typeof after === 'function' && after(res);
                }
            }, true);
        };
        ;
        /**
         * 渲染表格方法
         * @param {obj[]} data
         * @param {boolean} isSet
         */
        TableDataModule.prototype.dealTable = function (data, isSet) {
            var tableModule = this.modulePara.tableModule;
            var cache = tableModule.pagination.getCurrentState();
            isSet ? tableModule.table.data.set(data) : tableModule.table.data.add(data);
            //0 不分页
            if (this.modulePara.para.multPage === 0) {
                tableModule.table.render(0, data.length);
            }
            //1 后台分页
            if (this.modulePara.para.multPage === 1) {
                tableModule.table.render(isSet ? 0 : cache.offset, isSet ? cache.size : cache.offset + cache.size, isSet);
            }
            //2 前台分页
            if (this.modulePara.para.multPage === 2) {
                tableModule.table.render(0, 50);
            }
            tools.event.fire('table-module-render', null, tableModule.wrapper);
        };
        ;
        /**
         * 获取当前请求体信息
         * @returns {{}}
         */
        TableDataModule.prototype.getQueryPara = function () {
            return this.queryPara;
        };
        ;
        /**
         * 重新设置表格数据，进行重新渲染
         * @param {obj[]} newData
         * @param {boolean} isSet
         */
        TableDataModule.prototype.setNewData = function (newData, isSet) {
            if (isSet === void 0) { isSet = true; }
            var tableModule = this.modulePara.tableModule;
            this.modulePara.para.multPage = 2;
            this.dealTable(newData, isSet);
            var oriDataLen = tableModule.table.data.get().length, len = oriDataLen ? oriDataLen : newData.length;
            if (this.modulePara.para.multPage !== 0 && len > tableModule.pagination.pageLen) {
                tableModule.pagination.reset({
                    offset: 0,
                    recordTotal: len
                });
            }
            tableModule.pagination.isShow(newData);
            tableModule.lockBottom();
        };
        ;
        /**
         * 查询器调用函数
         */
        TableDataModule.prototype.innerRefresher = function (reqPara, after, before) {
            var _this = this;
            var tableModule = this.modulePara.tableModule;
            var notQueSpi = new spinner_1.Spinner({
                el: this.modulePara.tableConf.tableEl,
                type: spinner_1.Spinner.SHOW_TYPE.append,
                className: 'text-center padding-30'
            });
            var afterCb = function (response) {
                var totalNum = response.head.totalNum ? response.head.totalNum : response.data.length;
                if (_this.modulePara.para.multPage !== 0 && totalNum > tableModule.pagination.pageLen) {
                    tableModule.pagination.reset({
                        offset: 0,
                        recordTotal: totalNum
                    });
                }
                // 隐藏在表格列当中找不到varlist Name 的按钮
                var meta = response.meta;
                if (Array.isArray(meta) && meta[0] && tableModule.subBtn && tableModule.subBtn.children) {
                    // let visibleCols =  tableModule.table.getVisibleCol();
                    tableModule.subBtn.children.forEach(function (btn) {
                        if (Array.isArray(btn.data.actionAddr && btn.data.actionAddr.varList)) {
                            for (var _i = 0, _a = btn.data.actionAddr.varList; _i < _a.length; _i++) {
                                var v = _a[_i];
                                // 处理OLD字段
                                var varName = v.varName.replace(/^OLD_/, '');
                                // btn.multiSelect === 0 || Tools.v.varValue
                                if (btn.data.multiselect !== 0 && tools.isEmpty(v.varValue)) {
                                    // 有一个参数找不到则隐藏此按钮
                                    btn.isShow = meta.indexOf(varName) !== -1;
                                }
                            }
                        }
                    });
                }
                typeof after === 'function' && after(response);
                setTimeout(function () {
                    tableModule.lockBottom();
                    //设置前台分页本地缓存数据
                    tableModule.localSearch.setOriginData(tableModule.table.data.get());
                    //设置当前表格的分页类型缓存
                    tableModule.localSearch.setOriginMultPage(_this.modulePara.para.multPage);
                    !_this.isQuery && notQueSpi.hide();
                }, 0);
            };
            tableModule.localSearch.getOriginMultPage() !== null &&
                (this.modulePara.para.multPage = tableModule.localSearch.getOriginMultPage());
            tableModule.pagination.setParam(1);
            !this.isQuery && notQueSpi.show();
            this.refresh(reqPara, afterCb, before);
        };
        ;
        /**
         * 重新渲染表格之后的逻辑处理
         * @param {obj[]} data
         * @param {number} dataLen
         */
        TableDataModule.prototype.dealData = function (data, dataLen) {
            var _this = this;
            var tableModule = this.modulePara.tableModule;
            // 1.不分页 2.返回的总数目小于当前每页大小时候  不初始化分页条
            if (this.modulePara.para.multPage !== 0 && dataLen > tableModule.pagination.pageLen) {
                tableModule.pagination.reset({
                    offset: 0,
                    recordTotal: dataLen
                });
            }
            // 渲染表格
            this.dealTable(data, !tools.isMb);
            tableModule.autoSubTable();
            setTimeout(function () {
                tableModule.lockBottom();
                // 设置前台分页本地缓存数据
                tableModule.localSearch.setOriginData(tableModule.table.data.get());
                // 设置当前表格的分页类型缓存
                tableModule.localSearch.setOriginMultPage(_this.modulePara.para.multPage);
            }, 0);
        };
        ;
        return TableDataModule;
    }());
    exports.TableDataModule = TableDataModule;
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
