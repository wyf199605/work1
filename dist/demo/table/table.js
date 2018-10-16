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
                        info.hit.classList.insert(_getIcon(true));
                        info.hit.classList.remove(_getIcon('loading'));
                    },
                    iconClose: function (td) {
                        var info = this.hitInfo(td);
                        info.hit.classList.remove(_getIcon(true));
                        info.hit.classList.insert(_getIcon(false));
                        info.hit.classList.remove(_getIcon('loading'));
                    },
                    iconLoading: function (td) {
                        var info = this.hitInfo(td);
                        info.hit.classList.remove(_getIcon(false));
                        info.hit.classList.insert(_getIcon('loading'));
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
                            var treetitle = d.query('.tree-title'), text = treetitle.innerHTML;
                            td.innerHTML = text;
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
                    insert: add,
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
                        target.classList.insert(arrow.down);
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
                        target.classList.insert(arrow.right);
                        target.classList.remove(arrow.down);
                        target.dataset.status = '0';
                        self.sysColClose(index);
                        _style.ContainerUpdate();
                    },
                    loading: function (target) {
                        target.classList.remove(arrow.right, arrow.down);
                        target.classList.insert(arrow.loading);
                    },
                    unloading: function (target) {
                        target.classList.remove(arrow.loading);
                        target.classList.insert(arrow.down);
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
                        Container = d.createByHTML("<div class=\"tableExpandContainer\" data-expand-index=\"" + index + "\"></div>");
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
                                resultArr.push("\n                            <dl class=\"tableExpandDl\">\n                                <dt>" + item + "</dt>\n                                <dd>" + html[item] + "</dd>\n                            </dl>\n                        ");
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
            this.dragRowsFunc = (function (self) {
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
                        tr.classList.insert('selected');
                        if (self.conf.lockColNum > 0) {
                            var lockTr = self.rowGet(i, self.lockCol.table);
                            lockTr.classList.insert('selected');
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
                    self.drag.init(checkSelected);
                }
                return {
                    init: init
                };
            }(this));
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
                                tr.classList.insert('col-disabled');
                            });
                            if (self.conf.lockColNum > 0) {
                                self.colGet(columnIndex, self.lockCol.table).forEach(function (tr) {
                                    tr.classList.insert('col-disabled');
                                });
                            }
                            if (self.conf.lockRow) {
                                self.colGet(columnIndex, self.lockRow.table).forEach(function (tr) {
                                    tr.classList.insert('col-disabled');
                                });
                            }
                            if (self.conf.lockColNum > 0 && self.conf.lockRow) {
                                self.colGet(columnIndex, self.lockRow.fixedTable).forEach(function (tr) {
                                    tr.classList.insert('col-disabled');
                                });
                            }
                        };
                        var mouseUp = function (event) {
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
                                self.movingHoverColumn.setAttribute('data-index', self.colName2index(item.dataset.col));
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
                        self.movingHoverColumn = document.querySelector('.tableMovingContainer') || d.createByHTML('<div class="tableMovingContainer"></div>');
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
                    var movedownHandle = function (event) {
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
                        self.movingHoverRow = document.querySelector('.tableMovingContainer') || d.createByHTML('<div class="tableMovingContainer"></div>');
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
                            d.queryAll('tr', self.table.tBodies.item(0)).forEach(function (item, index) {
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
                        self.trMoveSelected.classList.insert('col-disabled');
                        selectedRow = self.rowGet(index, self.lockCol.table);
                        selectedRow && selectedRow.classList.insert('col-disabled');
                        selectedRow = self.rowGet(index, self.lockRow.fixedTable);
                        selectedRow && selectedRow.classList.insert('col-disabled');
                        selectedRow = self.rowGet(index, self.lockRow.table);
                        selectedRow && selectedRow.classList.insert('col-disabled');
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
            // 拖拽框选
            this.drag = (function (self) {
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
                            shadeLayer.classList.insert('tableDragSelect');
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
                        callbackQueue.forEach(function (callback) {
                            callback(start_name, end_name, start_index, end_index);
                        });
                    }
                }
                function init(handle) {
                    if (callbackQueue.length === 0) {
                        d.on(self.tableContainer, self.mousedownName, mousedownHandle);
                    }
                    callbackQueue.push(handle);
                }
                return {
                    init: init
                };
            }(this));
            // 拖拽选择
            this.dragSelectFunc = (function (self) {
                // 添加选中样式
                function cellSelect(start_name, end_name, start_index, end_index) {
                    var hasLock = false;
                    d.queryAll('td.cellSelect', self.tableContainer).forEach(function (td, i) {
                        td.classList.remove('cellSelect');
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
                                isSelected = true;
                            }
                            if (isSelected) {
                                td.classList.insert('cellSelect');
                            }
                            if (td.dataset.col === end_name) {
                                isSelected = false;
                            }
                        });
                        if (self.conf.lockColNum > 0 && hasLock) {
                            var lockTr = self.rowGet(i, self.lockCol.table), isLockSelected_1;
                            d.queryAll('td', lockTr).forEach(function (td, i) {
                                if (td.dataset.col === start_name) {
                                    isLockSelected_1 = true;
                                }
                                if (isLockSelected_1) {
                                    td.classList.insert('cellSelect');
                                }
                                if (td.dataset.col === end_name) {
                                    isLockSelected_1 = false;
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
                    self.conf.dragSelect && self.conf.dragSelect(result);
                }
                function init() {
                    self.dragSelect.selected = {};
                    self.drag.init(checkSelected);
                }
                return {
                    init: init
                };
            })(this);
            this.indexColFun = (function (self) {
                var lockFixedIndexCol = null; // 左上角锁头序列号
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
                    var childNode = self.conf.indexCol === 'select' ? function () {
                        var checkbox = checkBox_1.CheckBox.initCom(self.ssid);
                        checkbox.classList.insert('circle');
                        d.off(d.query('.check-span', checkbox));
                        return checkbox;
                    } : null;
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
                return {
                    render: render,
                    refreshIndex: refreshIndex,
                    init: function () {
                        var html = '<div class="indexCol"></div>';
                        self.indexCol.col = d.createByHTML(html);
                        self.tableWrapper.appendChild(self.indexCol.col);
                        self.tableWrapper.classList.insert('hasIndexCol');
                        self.indexCol.width = self.indexCol.col.getBoundingClientRect().width;
                        d.on(self.tableWrapper, self.eventClickName, 'div.indexCol-item', function (evt) {
                            var index = this.dataset.index ? parseInt(this.dataset.index) : -1, tr = self.rowGet(index);
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
                                        var input = d.query("div[data-index=\"" + index + "\"] > .select-box input", self.indexCol.col);
                                        input.checked = detail.select;
                                    });
                                }, 10);
                            });
                        }
                    },
                    fixedRender: function () {
                        var _indexItem = document.createElement('div');
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
                    if (self.lockRow.fixedTable) {
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
                            self.pseudoCol.Container = d.createByHTML("<div class=\"pseudoContainer\"></div>");
                            self.tableWrapper.appendChild(self.pseudoCol.Container);
                            self.tableWrapper.classList.insert('hasPseudoCol');
                            d.on(self.tableWrapper, self.mousedownName, 'div.pseudoCol-item', function (event) {
                                var e = self.getEvent(event), pseudoIndex = parseInt(d.closest(e.target, '.pseudoCol').dataset.pseudo), clickHandle = self.pseudoCol.confList[pseudoIndex].click;
                                clickHandle && clickHandle(this.dataset.index, event);
                            });
                            // self.on('pseudoColPage', function (e:CustomEvent) {
                            //     let start = (self.currentPage -1 ) * self.conf.length;
                            //     render(start, start + e.detail.len, !self.conf.appendPage);
                            // });
                        }
                        config.col = d.createByHTML("<div class=\"pseudoCol\" data-pseudo=\"" + config.index + "\"></div>");
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
                            var _indexItem = d.createByHTML("<div class=\"pseudoCol\"><div></div></div>");
                            self.pseudoCol.fixedCol.appendChild(_indexItem);
                        }
                    },
                    width: width,
                    render: render,
                    destroy: destroy
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
                    targets;
                    var menuHandler = function (e) {
                        if ('eventHandle' in conf) {
                            conf.eventHandle(this, e);
                        }
                        targets = conf.targetGet(this);
                        if (self.popMenuDom.dataset.identifier === identifier) {
                            self.popMenu.show(identifier);
                        }
                        else {
                            self.popMenu.show(identifier, btns, function (btn, menuDom) {
                                if (typeof btn.callback === 'function') {
                                    btn.callback(btn, targets, menuDom);
                                }
                            });
                            self.popMenuDom.dataset.identifier = identifier;
                        }
                        clickCb(this);
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
                            var itemsHtml = '';
                            btns.forEach(function (btn, i) {
                                if (btn) {
                                    var attr = "data-index=\"" + i + "\" " + btnSelector;
                                    itemsHtml += menuFun.btnHtmlGet(btn, attr);
                                }
                            });
                            menuListDom.innerHTML = itemsHtml;
                        }
                        self.popMenuDom = menuFun.popDomGet();
                        menuListDom = menuFun.listDomGet(self.popMenuDom);
                        menuFun.init();
                        var clickHandler = function () {
                            var index = parseInt(this.dataset.index);
                            currentCallback(currentBtns[index], this);
                            menuFun.hide();
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
                                var isMulti = self.trSelected[2];
                                currentBtns.forEach(function (btn, i) {
                                    if (!btn.multi) {
                                        var btnDom = menuListDom.querySelector("[" + btnSelector + "][data-index=\"" + i + "\"]");
                                        isMulti ? btnDom.classList.insert('disabled') : btnDom.classList.remove('disabled');
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
                    trDom.classList.insert('colGroup');
                    _this.conf.cols.forEach(function (col) {
                        if (!_this.colHide.ready || _this.colHide.status[col.name]) {
                            if (!(col.name in data)) {
                                data[col.name] = null;
                            }
                            var selectArr = data[col.name], tdDom = document.createElement('td'), tdContent = groupCreate(col.name, selectArr);
                            //td默认属性
                            tdDom.dataset.col = col.name;
                            tdDom.appendChild(tdContent);
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
                    var tdContent = document.createElement('div'), selectHTML = document.createElement('select');
                    arr.sort(function (a, b) {
                        return b - a;
                    });
                    tdContent.classList.insert('td-content', 'td-select', _this.cellClass(name));
                    selectHTML.appendChild(d.createByHTML('<option></option>'));
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
                var on = function () {
                    var selectList = d.queryAll('.colGroup select', _this.tableWrapper), self = _this;
                    function changeHandler() {
                        // debugger;
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
                    // debugger;
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
                    console.log(v1, v2);
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
                    tableTh.classList.insert(newSort);
                    if (self.conf.lockColNum > 0) {
                        var lockTh = self.lockCol.table.querySelector("th[data-col=\"" + col + "\"]");
                        if (lockTh) {
                            lockTh.classList.remove(oldSort);
                            lockTh.classList.insert(newSort);
                        }
                    }
                    if (self.conf.lockRow) {
                        var lockRowTh = self.lockRow.table.querySelector("th[data-col=\"" + col + "\"]");
                        lockRowTh.classList.remove(oldSort);
                        lockRowTh.classList.insert(newSort);
                    }
                    if (self.conf.lockColNum > 0 && self.conf.lockRow) {
                        var lockFixedTh = self.lockRow.fixedTable.querySelector("th[data-col=\"" + col + "\"]");
                        if (lockFixedTh) {
                            lockFixedTh.classList.remove(oldSort);
                            lockFixedTh.classList.insert(newSort);
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
                    if (_this.conf.lockColNum > 0 && _this.conf.lockRow) {
                        d.queryAll(classNames, _this.lockRow.fixedTable).forEach(function (th) {
                            th.classList.remove('sort-desc', 'sort-asc');
                        });
                    }
                };
                // isMulti
                var sort = function (isMulti, col) {
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
                    console.log(123);
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
                    var _a;
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
                        th.classList.insert('sort');
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
                var table = null, lockTable = null, lockTableContain = null, conf = null;
                function init() {
                    table = self.table;
                    conf = self.conf;
                    lockTable = table.cloneNode();
                    var lockThead = table.tHead.cloneNode(true), lockTheadTr = lockThead.querySelector('tr'), lockThs = d.queryAll('th', lockTheadTr), tbodyTr = d.queryAll('tr', table.tBodies.item(0)), lockThsLen = lockThs.length, lockColNum = conf.lockColNum;
                    lockTable.classList.insert('mobileTableLock', 'hide');
                    lockTable.removeAttribute('id');
                    table.dataset['lockNum'] = conf.lockColNum.toString();
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
                        lockTableContain = d.createByHTML('<div class="mobileTableLeftLock"></div>');
                        self.tableContainer.insertBefore(lockTableContain, self.tableContainer.firstElementChild);
                    }
                    else {
                        lockTableContain.innerHTML = '';
                    }
                    lockTableContain.appendChild(lockTable);
                    self.lockCol.table = lockTable;
                    self.lockCol.Container = lockTableContain;
                }
                /**
                 * 加载所列表中数据
                 * @param rows 正常表中tr，包含所有的 td
                 * @param isRefresh 是刷新还是加载
                 * @private
                 */
                function render(rows, isRefresh) {
                    // 创建lock列DOM前, 显示原来的列，隐藏lock
                    if (!table) {
                        return;
                    }
                    table.classList.remove('hideLock');
                    lockTable.classList.insert('hide');
                    if (isRefresh) {
                        lockTable.tBodies.item(0).innerHTML = '';
                    }
                    rows.forEach(function (tr) {
                        lockTable.tBodies.item(0).appendChild(rowCreate(tr));
                    });
                    //创建完lock列DOM, 显示lock，隐藏原来的列
                    lockTable && lockTable.classList.remove('hide');
                    table.classList.insert('hideLock');
                }
                /**
                 * 生成锁列的行
                 * @param tr
                 * @return {HTMLTableRowElement}
                 */
                function rowCreate(tr) {
                    var newTr = tr.cloneNode(true), tds = d.queryAll('td', newTr);
                    tds.forEach(function (td, index) {
                        if (index >= conf.lockColNum) {
                            d.remove(td);
                        }
                    });
                    return newTr;
                }
                function colLock(index) {
                    var newIndexCols = self.colInsertTo(index, conf.lockColNum);
                    // console.log(newIndexCols);
                    self.colAdd(conf.lockColNum, newIndexCols, lockTable);
                    conf.lockColNum++;
                    self.theadSizeSync();
                    self.theadSizeCache(index);
                }
                function colUnlock(index) {
                    //把此列移动到锁列的最后一列
                    self.colInsertTo(index, conf.lockColNum - 1);
                    //删除锁列的最后列
                    self.colDel(conf.lockColNum - 1, lockTable);
                    conf.lockColNum--;
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
                        table.classList.insert('hideLock');
                        lockTable.classList.remove('hide');
                    }
                    if (index > conf.lockColNum - 1) {
                        colLock(index);
                        toggleFlag = 1;
                    }
                    else {
                        colUnlock(index);
                        toggleFlag = 0;
                    }
                    table.dataset['lockNum'] = conf.lockColNum.toString();
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
                    lockTableContain.classList.insert('hide');
                    table.dataset.lockNum = '0';
                }
                function show() {
                    lockTableContain.classList.remove('hide');
                    table.dataset.lockNum = conf.lockColNum + '';
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
                    var index = -1;
                    // 根据col.name找到index
                    self.conf.cols.forEach(function (c, i) {
                        if (c.name === name) {
                            index = i;
                        }
                    });
                    return index;
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
                        tdContent.classList.insert('td-content', self.cellClass(name));
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
                    return d.createByHTML("<th" + tools.obj.toAttr(attr) + ">" + _cellCreate(item.name, item.title, !item.colspan).outerHTML + "</th>", 'tr');
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
                        self.tableContainer.classList.insert(styleName + "-" + self.ssid);
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
                    insert: add,
                    del: del
                };
            })(this));
            /**
             * 开启表头拖拽宽度
             * @private
             * @author yrh
             */
            this.colResizeFun = (function (self) {
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
                    d.on(window, 'resize', function () {
                        // 清除列宽状态
                        self.resize(true);
                    });
                }
                function init() {
                    // 添加辅助线
                    var resizeProxy = document.createElement('div');
                    resizeProxy.classList.insert('resize-proxy');
                    self.tableContainer.appendChild(resizeProxy);
                    self.colResize.resizeProxy = resizeProxy;
                    colSize();
                }
                return {
                    init: init
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
                    var style = self.lockRow.Container.style, scrollTop = self.scrollTop() + self.theadHeight + self.conf.lockRowTop, offsetTop = tools.offset.top(self.tableWrapper), tableBottom = self.tableWrapper.offsetHeight + offsetTop;
                    if (self.scrollTop() > offsetTop) {
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
                    lockTable.classList.insert('mobileTableRowLock');
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
                        self.lockRow.Container = d.createByHTML('<div class="mobileTableTopLock"></div>');
                        self.lockRow.ContainInner = d.createByHTML('<div class="mobileTableTopLock-inner"></div>');
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
                    if (!self.lockRow.fixed) {
                        self.lockRow.fixedContainer = d.createByHTML('<div class="Container"></div>');
                        self.lockRow.fixed = d.createByHTML('<div class="mobileTableTopFixedLock"></div>');
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
                        if (self.lockRow.fixedContainer) {
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
                    self.lockRow.table.classList.insert('hideLock');
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
                    insert: function (data) {
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
                 *添加事件数组
                 * @param {string} selector 代理对象
                 * @param {EventListener} handler 事件函数
                 */
                var add = function (selector, handler) {
                    if (!selectorHandlers[selector]) {
                        selectorHandlers[selector] = [];
                    }
                    selectorHandlers[selector].push(handler);
                    if (isOn) {
                        on();
                    }
                };
                /**
                 *删除事件数组
                 * @param {string} selector 代理对象
                 * @param [handler]
                 */
                var remove = function (selector, handler) {
                    if (handler && selectorHandlers[selector]) {
                        for (var i = 0; i < selectorHandlers[selector].length; i++) {
                            if (selectorHandlers[selector][i] === handler) {
                                selectorHandlers[selector].splice(i, 1);
                            }
                        }
                        if (selectorHandlers[selector].length === 0) {
                            delete selectorHandlers[selector];
                        }
                    }
                };
                /**
                 * 取消点击事件
                 */
                var off = function () {
                    isOn = false;
                    var _loop_2 = function (selector) {
                        selectorHandlers[selector].forEach(function (handler) {
                            d.off(_this.tableContainer, 'click', selector, handler);
                        });
                    };
                    for (var selector in selectorHandlers) {
                        _loop_2(selector);
                    }
                };
                /**
                 * 触发点击事件
                 */
                var on = function () {
                    isOn = true;
                    var _loop_3 = function (selector) {
                        selectorHandlers[selector].forEach(function (handler) {
                            d.on(_this.tableContainer, 'click', selector, handler);
                        });
                    };
                    for (var selector in selectorHandlers) {
                        _loop_3(selector);
                    }
                };
                return { insert: add, remove: remove, off: off, on: on };
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
                    var cols = _this.conf.cols, rows = copyText.split("\r\n").map(function (text) { return text.trim(); }).filter(function (row) { return !!row; }), colsNames = [];
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
                    row: function (indexes, isReturn) {
                        if (isReturn === void 0) { isReturn = false; }
                        var rowsData = indexes.map(function (index) { return _this.rowDataGet(index); }), rowsArr = rowsData.map(function (rowData) {
                            return _this.conf.cols.map(function (col) { return tools.str.toEmpty(rowData[col.name]); }).join("\t");
                        });
                        if (rowsArr[0]) {
                            rowsArr.unshift(_this.conf.cols.map(function (col) { return col.title; }).join("\t"));
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
                        dataArr.forEach(function (data) {
                            for (var name_1 in data) {
                                // 判读是否是空的字段 或者 排除的字段
                                if (tools.valid.isEmpty(data[name_1]) || except.indexOf(name_1) >= 0) {
                                    delete data[name_1];
                                }
                            }
                        });
                        return dataArr;
                    }
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
                dragSelect: false,
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
                    colsIndex: [],
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
            this.table.classList.insert('mobileTable');
            var eventConf = this.getEventConf();
            this.menuEventName = eventConf.menuName;
            this.eventClickName = eventConf.clickName;
            this.mousemoveName = eventConf.mousemoveName;
            this.mouseoutName = eventConf.mouseoutName;
            this.mousedownName = eventConf.mousedownName;
            this.mouseupName = eventConf.mouseupName;
            this.nameCol = {};
            // 多行表头
            if (conf.multi.enabled) {
                conf.multi.cols.forEach(function (col) {
                    col.forEach(function (cell) {
                        _this.nameCol[cell.name] = cell;
                    });
                });
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
            if (conf.dragRows) {
                this.dragRowsFunc.init();
            }
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
            //
            // // 点击事件初始
            // if(typeof conf.click === 'function' && typeof conf.clickSelector === 'string'){
            //     self.click.on();
            // }
            // 拖拽选择
            if (typeof conf.dragSelect === 'function') {
                this.dragSelectFunc.init();
            }
            // 弹出菜单初始化
            var colMenu = conf.colMenu, rowMenu = conf.rowMenu;
            if ((colMenu && colMenu[0]) || (rowMenu && rowMenu[0])) {
                this.menu.popInit();
                this.menu.col.init('col');
                this.menu.row.init('row', function (target) {
                    if (!this.trSelected[0]) {
                        this.rowSelect(target);
                    }
                });
            }
            if (Array.isArray(conf.data) && conf.data[0]) {
                this.data.set(conf.data);
                this.render(0, conf.data.length);
            }
        }
        BasicTable.prototype.getVisibleCol = function () {
            var visableCol = [], key;
            for (key in this.colHide.status) {
                this.colHide.status[key] && visableCol.push(key);
            }
            return visableCol;
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
                var blankDiv = document.createElement('div');
                if (self.theadHeight) {
                    blankDiv.style.height = self.theadHeight + 'px';
                }
                tmpDoc.appendChild(blankDiv);
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
            div.classList.insert(colType + "Col-item");
            if (typeof text === 'string') {
                div.innerHTML = text;
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
         * @private
         */
        BasicTable.prototype.tbodyRender = function (dataArr, isRefresh, startIndex) {
            var _this = this;
            if (startIndex === void 0) { startIndex = 0; }
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
            // if(data.length>0) {
            //     console.log(data);
            //     return;
            // }
            dataArr.forEach(function (data, i) {
                // console.log(d, i);
                trArray.push(_this.rowCreate(data, i + startIndex));
                // console.log(trArray);
                // 保存数据，用于列分组
                // if (this.conf.colGroup && !this.colGroupData) {
                //     this.colGroupArr = this.colGroupArr || {};
                //
                //     for (let s in data) {
                //         this.colGroupArr[s] = this.colGroupArr[s] || [];
                //         if (!~this.colGroupArr[s].indexOf(data[s])) {
                //             this.colGroupArr[s].push(data[s]);
                //         }
                //     }
                // }
            });
            // if (this.conf.colGroup && !this.colGroupData) {
            //     this.colGroupData = dataArr;
            // }
            // 添加列分组
            if (this.conf.colGroup) {
                trArray.unshift(this.colGroup.rowCreate(dataArr));
            }
            //添加到tbody
            trArray.forEach(function (tr) {
                tmpDoc.appendChild(tr);
            });
            this.table.tBodies[0].appendChild(tmpDoc);
            if (this.conf.lockColNum > 0) {
                this.lock.render(trArray, isRefresh);
            }
            if (this.conf.lockRow) {
                // 锁头更新
                this.theadLock.render();
            }
            // 为列分组添加事件
            if (this.conf.colGroup) {
                this.colGroup.on();
            }
            this.isShowNoData();
            this.theadSizeSync();
        };
        BasicTable.prototype.isShowNoData = function () {
            var noDataDom = this.table.nextElementSibling;
            noDataDom = noDataDom && noDataDom.classList.contains('nodata') ? noDataDom : null;
            // 当前页没有tbody中没有tr
            if (this.table.tBodies.item(0).firstElementChild === null) {
                if (!noDataDom) {
                    noDataDom = d.createByHTML('<div class="nodata no-padding"><span class="iconfont icon-gongyongwushuju"></span></div>');
                    d.after(this.table, noDataDom);
                    if (this.indexCol.col) {
                        this.indexCol.show = false;
                        this.indexCol.col.classList.insert('hide');
                        this.tableWrapper.classList.remove('hasIndexCol');
                    }
                    if (this.pseudoCol.Container) {
                        this.pseudoCol.show = false;
                        this.pseudoCol.Container.classList.insert('hide');
                        this.tableWrapper.classList.remove('hasPseudoCol');
                    }
                }
            }
            else {
                if (noDataDom) {
                    d.remove(noDataDom);
                    if (this.indexCol.col) {
                        this.indexCol.show = true;
                        this.indexCol.col.classList.remove('hide');
                        this.tableWrapper.classList.insert('hasIndexCol');
                    }
                    if (this.pseudoCol.Container) {
                        this.pseudoCol.show = true;
                        this.pseudoCol.Container.classList.remove('hide');
                        this.tableWrapper.classList.insert('hasPseudoCol');
                    }
                }
            }
        };
        /**
         * 初始化表格Wrapper
         * @private
         */
        BasicTable.prototype.wrapperInit = function () {
            var t = this.table;
            var tableWrapper = d.createByHTML("<div class=\"mobileTableWrapper\" tabindex=\"" + this.ssid + "\"><div class=\"tableContainer\">" +
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
        BasicTable.prototype.colInsertTo = function (oldIndex, newIndex) {
            var self = this, confCols = this.conf.cols, confColsLen = confCols.length;
            if (this.colHide.ready) {
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
            //有锁列的情况，则把交换后的列替换给锁列的列
            if (oldIndex < this.conf.lockColNum) {
                this.lockColReplace(oldIndex, this.colGet(oldIndex));
            }
            if (newIndex < this.conf.lockColNum) {
                this.lockColReplace(newIndex, replaced);
            }
            if (oldIndex < this.conf.lockColNum || newIndex < this.conf.lockColNum) {
                this.theadSizeSync();
            }
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
            if (indexCol.col && indexCol.show && indexCol.col.firstChild) {
                var blankDiv = indexCol.col.firstChild, height = this.theadHeight + 1;
                blankDiv.style.height = height + 'px';
                if (this.conf.lockRow) {
                    var indexFixedDiv = lockRow.fixed.querySelector('.indexCol').firstChild;
                    if (indexFixedDiv) {
                        indexFixedDiv.style.height = height + 'px';
                    }
                }
            }
            // 调整伪列高度
            if (this.pseudoCol.confList.length > 0 && this.pseudoCol.show) {
                var height_1 = this.theadHeight + 1;
                this.pseudoCol.confList.forEach(function (item) {
                    if (item.col.firstChild) {
                        item.col.firstChild.style.height = height_1 + 'px';
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
                thead = d.createByHTML('<thead></thead>', 'table');
                this.table.insertBefore(thead, this.table.tBodies.item(0));
            }
            thead.innerHTML = '';
            // 多列表头
            if (conf.multi.enabled) {
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
                    if (!self.colHide.ready || self.colHide.status[col.name]) {
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
                this.rowDeselect();
                // this.trSelected.forEach((tr2) => {
                //     this.lockRowApply(tr2, (t) => {
                //         t.classList.remove('selected')
                //     })
                // });
                // this.trSelected = [];
            }
            this.lockRowApply(tr, function (t) {
                t.classList.insert('selected');
            });
            this.trSelected.push(tr);
            this.fire('rowSelect', { indexes: [parseInt(tr.dataset.index)], select: true });
        };
        BasicTable.prototype.rowToggle = function (tr) {
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
         */
        BasicTable.prototype.rowDeselect = function (tr) {
            if (tr === void 0) { tr = null; }
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
                this.fire('rowSelect', { indexes: indexes_1, select: false });
            }
            else {
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
                this.fire('rowSelect', { indexes: [parseInt(tr.dataset.index)], select: false });
            }
            // this.fire('rowSelect', {indexes : parseInt(tr.dataset.index), select : true});
        };
        /**
         * 选择行数据获取
         * @return {Array}
         */
        BasicTable.prototype.rowSelectDataGet = function () {
            var data = [], self = this;
            this.trSelected.forEach(function (tr) {
                data.push(self.rowDataGet(parseInt(tr.dataset.index)));
            });
            return data;
        };
        /**
         * 创建行
         * @param data
         * @param index
         * @return {HTMLTableRowElement}
         */
        BasicTable.prototype.rowCreate = function (data, index) {
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
                if (!row.tr.hasOwnProperty(attr)) {
                    continue;
                }
                trDom.setAttribute(attr, row.tr[attr]);
            }
            var textFormat = typeof self.conf.textFormat === 'function' ? self.conf.textFormat : null;
            if (self.conf.multi.enabled) {
                // 多维表
                /*data.forEach(function (col, i) {
                    let td = row.td[i] || {},
                        text = col.title,
                        tdDom = document.createElement('td');
                    //td默认属性
                    td['data-col'] = col.name;
                    td['class'] = td['class'] ? `${td['class']} ${self.cellClass(col.name)}` : self.cellClass(col.name);
                    if (col.rowspan) {
                        td['rowspan'] = col.rowspan;
                    }
    
                    for (let attr in td) {
                        if (!td.hasOwnProperty(attr)) {
                            continue;
                        }
                        tdDom.setAttribute(attr, td[attr]);
                    }
                    tdDom.innerHTML = text;
                    trDom.appendChild(tdDom);
                    if (i === 0) {
                        // 树形展开
                        self.treegridFunc.addBtn(index, tdDom);
                    }
                });*/
                self.conf.multi.colsIndex.forEach(function (col, i) {
                    if (!(col.name in data)) {
                        data[col.name] = null;
                    }
                    var td = row.td[i] || {}, text = textFormat ? textFormat(data, col, index) : data[col.name], tdDom = document.createElement('td');
                    // textNode = document.createTextNode(text);
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
                    // tdDom.appendChild(textNode);
                    trDom.appendChild(tdDom);
                    if (i === 0) {
                        // 树形展开
                        self.treegridFunc.addBtn(index, tdDom);
                    }
                });
            }
            else {
                self.conf.cols.forEach(function (col, i) {
                    if (!self.colHide.ready || self.colHide.status[col.name]) {
                        if (!(col.name in data)) {
                            data[col.name] = null;
                        }
                        var td = row.td[i] || {}, text = textFormat ? textFormat(data, col, index) : data[col.name], tdDom = document.createElement('td');
                        // textNode = document.createTextNode(text);
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
                        // tdDom.appendChild(textNode);
                        trDom.appendChild(tdDom);
                        if (i === 0) {
                            // 树形展开
                            self.treegridFunc.addBtn(index, tdDom);
                        }
                    }
                });
            }
            return trDom;
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
            tdContent.classList.insert('td-content', 'td-select', self.cellClass(name));
            selectHTML.appendChild(d.createByHTML('<option></option>'));
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
                styleArr.push("." + styleItem + "{ width: " + width + "px; max-width: " + width + "px;}");
            }
            //console.log('updateStyle');
            style.innerHTML = styleArr.join('');
        };
        BasicTable.prototype.addStyle = function () {
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
                styleArr.push("." + styleItem + "{ width: " + width + "px; max-width: " + width + "px;}");
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
                return this.conf.Container.scrollTop;
            }
            else {
                return tools.scrollTop();
            }
        };
        BasicTable.prototype.initStyleList = function () {
            var self = this;
            if (!self.styleListReady) {
                var ths = d.queryAll('th', self.table.tHead), padding_1 = getPadding(ths[0]);
                if (self.conf.multi.enabled) {
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
                    self.tableStyle.insert(["table th, table td{width:${self.conf.cellMaxWidth - padding}px;max-width:" + (self.conf.cellMaxWidth - padding_1) + "px;}"]);
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
                index = this.colName2index(index);
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
                this.resize(true);
            }
            this.tbodyRender(data, isRefresh, start);
            this.indexColFun.render(start, length, isRefresh);
            this.pseudoColFun.render(start, length, isRefresh);
            this.startIndex = isRefresh ? start : this.startIndex;
            this.tbodyLength = isRefresh ? length : this.tbodyLength + length;
        };
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
});

define("MbTable", ["require", "exports", "BasicTable"], function (require, exports, basicTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var MbTable = /** @class */ (function (_super) {
        __extends(MbTable, _super);
        function MbTable(para) {
            var _this = _super.call(this, para) || this;
            _this.reorderPanel = null;
            _this.isPanelShowed = false;
            _this.cellHeight = 40; // 表格行高
            var defaultConf = {
                colReorder: false
            };
            // console.log(defaultConf, this.conf);
            _this.conf = G.tools.obj.merge(true, defaultConf, _this.conf);
            //
            // let loading = G.d.createByHTML('<span class="mui-spinner" style="vertical-align: bottom;margin-left: 48%;margin-top: 10px;"></span>');
            // d.after(this.tableWrapper, loading);
            //
            // if(this.conf.indexCol === 'select'){
            //     this.indexCol.col.classList.add('stripe');
            // }
            //
            // this.page.go(1, (isEnd) => {
            //     loading.remove();
            //     loading = null;
            //
            //     this.conf.onComplete(this, isEnd);
            // });
            _this.conf.onComplete && _this.conf.onComplete();
            return _this;
        }
        MbTable.prototype.getEventConf = function () {
            return {
                menuName: 'longtap',
                clickName: 'tap',
                mousemoveName: 'touchmove',
                mouseoutName: '',
                mousedownName: 'touchstart',
                mouseupName: 'touchend'
            };
        };
        MbTable.prototype.menuConfGet = function () {
            var self = this;
            // let menuDisplay = (function (self) {
            //     let muiML = mui(self.popMenuDom);
            //     console.log(self.popMenuDom);
            //     return {
            //         hide: function () {
            //             muiML.popover('toggle');
            //         },
            //         show: function () {
            //             console.log(muiML);
            //             muiML.popover('toggle');
            //         }
            //     }
            // }(this));
            return {
                colConfGet: function () {
                    return {
                        identifier: 'col',
                        targetGet: function (selector) { return [selector]; },
                        targetSelector: 'thead tr th',
                        btns: self.conf.colMenu
                    };
                },
                rowConfGet: function () {
                    return {
                        identifier: 'row',
                        targetGet: function (selector) { return self.trSelected; },
                        targetSelector: 'tbody tr',
                        btns: self.conf.rowMenu,
                        eventHandle: function (target) {
                            // self.rowSelect(<HTMLTableRowElement>target)
                        }
                    };
                },
                popDomGet: function () {
                    var timestamp = (new Date()).getTime(), popHtml = "<div id=\"mobileTable_popMenu_" + timestamp + "\" class=\"mui-popover mui-popover-bottom mui-popover-action\">" +
                        '<ul class="mui-table-view"></ul>' +
                        '<ul class="mui-table-view">' +
                        ("<li class=\"mui-table-view-cell\"><a data-action=\"cancel\" href=\"#mobileTable_popMenu_" + timestamp + "\" style=\"color: red\">\u53D6\u6D88</a>") +
                        '</li></ul></div>';
                    return G.d.createByHTML(popHtml);
                },
                listDomGet: function (popMenu) {
                    return popMenu.firstElementChild;
                },
                btnHtmlGet: function (btn, attr) {
                    return "<li class=\"mui-table-view-cell\" " + attr + ">" + btn.title + "</li>";
                },
                show: function (row) {
                    mui(self.popMenuDom).popover('toggle');
                },
                hide: function (row) {
                    mui(self.popMenuDom).popover('toggle');
                },
                init: function () {
                    document.body.appendChild(self.popMenuDom);
                    // self.popMenuDom.querySelector('[data-action]').addEventListener('tap', function () {
                    //     self.rowDeselect();
                    // });
                }
            };
        };
        MbTable.prototype.initColReorder = function () {
            //  console.log(234);
            var reorderPanel = G.d.createByHTML('<div class="mobileTableReorderPanel"><div class="buttons">' +
                '<button class="mui-btn mui-btn-link cancel" data-action="cancel">取消</button>' +
                '<button class="mui-pull-right mui-btn-link mui-btn" data-action="sure">确定</button></div></div>'), colList = G.d.createByHTML('<ul class="colList"></ul>');
            reorderPanel.appendChild(colList);
            document.body.appendChild(reorderPanel);
            this.initColReorderDragEvent(reorderPanel);
            this.reorderPanel = reorderPanel;
        };
        MbTable.prototype.initColReorderDragEvent = function (reorderPanel) {
            var dragingDom = null, colListDom = reorderPanel.querySelector('.colList'), allCol = colListDom.getElementsByTagName('li'), commonHeight = 0, insertBeforeCol = null, self = this, colListDomPaddingTop = 10, colListDomPaddingLeft = 10, colListDomTop = colListDom.offsetTop + colListDomPaddingTop; //padding top 10
            mui(reorderPanel).on('dragstart', '.colList>li', function () {
                if (commonHeight === 0) {
                    commonHeight = allCol[0].offsetHeight;
                }
                dragingDom = this.cloneNode(true);
                dragingDom.classList.insert('draging');
                colListDom.appendChild(dragingDom);
                this.classList.insert('placeholder');
            });
            mui(reorderPanel).on('drag', '.colList>li', function (e) {
                if (!dragingDom) {
                    return;
                }
                var lastColHalfWidth = 0, thisPos = e.detail.center, thisWidth = parseInt(this.dataset.width), thisTop = thisPos.y - colListDomTop - (commonHeight * 0.8), thisLeftX = thisPos.x - colListDomPaddingLeft - (thisWidth * 0.8);
                if (insertBeforeCol) {
                    insertBeforeCol.classList.remove('before');
                    insertBeforeCol = null;
                }
                dragingDom.setAttribute('style', "left:" + thisLeftX + "px; top:" + thisTop + "px;");
                for (var i = 0, col = void 0; col = allCol.item(i); i++) {
                    var colHalfWidth = parseInt(col.dataset.width) / 2, colTop = parseInt(col.dataset.top);
                    // 判断在不在此行
                    // console.log(`${colTop} + ${commonHeight} < ${thisTop} + ${commonHeight / 2}`);
                    if (colTop + commonHeight < thisTop + (commonHeight / 2)) {
                        lastColHalfWidth = colHalfWidth;
                        continue;
                    }
                    var colLeftX = parseInt(col.dataset.left), colCenterX = colLeftX + colHalfWidth;
                    // 确认行之后判断此行的具体项
                    if (colTop > thisTop || (thisLeftX >= colLeftX - lastColHalfWidth && thisLeftX <= colCenterX)) {
                        insertBeforeCol = col;
                        insertBeforeCol.classList.insert('before');
                        break;
                    }
                    lastColHalfWidth = colHalfWidth;
                }
            });
            mui(reorderPanel).on('dragend', '.colList>li', function () {
                colListDom.removeChild(dragingDom);
                dragingDom = null;
                this.classList.remove('placeholder');
                colListDom.insertBefore(this, insertBeforeCol);
                if (insertBeforeCol) {
                    insertBeforeCol.classList.remove('before');
                }
                MbTable.calcReorderColsPos(allCol, null, true);
            });
            // reorderPanel.querySelector('.buttons').addEventListener('tap', G.tools.event.delegate('.mui-btn', function () {
            d.on(d.query('.buttons', reorderPanel), 'tap', '.mui-btn', function () {
                switch (this.dataset.action) {
                    case 'cancel':
                        reorderPanel.style.display = 'none';
                        break;
                    case 'sure':
                        reorderPanel.style.display = 'none';
                        var newOrderCols = [];
                        for (var i = 0, col = void 0; col = allCol.item(i); i++) {
                            newOrderCols.push(self.conf.cols[parseInt(col.dataset.colIndex)]);
                        }
                        self.conf.cols = newOrderCols;
                        self.theadRender();
                        self.tbodyRender(self.tableData, true);
                        break;
                }
            });
        };
        MbTable.calcReorderColsPos = function (allCol, stopCol, noWidth) {
            if (stopCol === void 0) { stopCol = null; }
            if (noWidth === void 0) { noWidth = false; }
            for (var i = 0, col = void 0; col = allCol.item(i); i++) {
                // TODO 判断仅计算移动过的col
                if (col.isEqualNode(stopCol)) {
                    break;
                }
                if (!noWidth) {
                    col.dataset['width'] = col.offsetWidth.toString();
                }
                col.dataset['top'] = col.offsetTop.toString();
                col.dataset['left'] = col.offsetLeft.toString();
            }
        };
        MbTable.prototype.showColReorder = function () {
            if (!this.conf.colReorder) {
                return;
            }
            if (!this.isPanelShowed) {
                this.initColReorder();
                this.isPanelShowed = true;
            }
            var colListDom = this.reorderPanel.querySelector('.colList');
            colListDom.innerHTML = '';
            this.conf.cols.forEach(function (col, i) {
                colListDom.appendChild(G.d.createByHTML("<li data-col-index=\"" + i + "\"><span>" + col.title + "</span></li>"));
            });
            this.reorderPanel.style.display = 'block';
            MbTable.calcReorderColsPos(colListDom.getElementsByTagName('li'));
        };
        MbTable.prototype.lockScreen = function () {
            var _this = this;
            var container = this.conf.Container, body = document.body;
            if (container) {
                container.style.overflowY = 'hidden';
                //container.style.height = '100%';
            }
            this.tableMiddle.style.overflowX = 'hidden';
            this.tableMiddle.style.width = '100%';
            body.style.overflow = 'hidden';
            body.style.height = '100%';
            this.move.timeout = setTimeout(function () { _this.unlockScreen(); }, 1000);
        };
        ;
        return MbTable;
    }(basicTable_1.BasicTable));
    exports.MbTable = MbTable;
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
                        isHover || tr.classList.insert('col-hover');
                    });
                    if (self.conf.lockRow) {
                        self.colGet(index, self.lockRow.table).forEach(function (tr) {
                            isHover || tr.classList.insert('col-hover');
                        });
                    }
                    if (self.conf.lockColNum > 0) {
                        self.colGet(index, self.lockCol.table).forEach(function (tr) {
                            isHover || tr.classList.insert('col-hover');
                        });
                    }
                    if (d.closest(th, '.mobileTableTopFixedLock')) {
                        self.colGet(index, self.lockRow.fixedTable).forEach(function (tr) {
                            isHover || tr.classList.insert('col-hover');
                        });
                    }
                }
                function rowHoverToggle(row) {
                    var isHover = row.classList.contains('col-hover');
                    isHover ? row.classList.remove('col-hover') : row.classList.insert('col-hover');
                    self.lockRowApply(row, function (tr) {
                        isHover ? tr.classList.remove('col-hover') : tr.classList.insert('col-hover');
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
            _this.edit = (function () {
                var tBody = _this.table.tBodies[0], modifyPara = null, editing = getEditingInit(), textFormat = typeof _this.conf.textFormat === 'function' ? _this.conf.textFormat : null, wrapper = _this.tableWrapper, deletedIndexes = [], addIndex = 0, editedData = [];
                var clickEvent = (function () {
                    var self = _this;
                    var clickHandle = function () {
                        var canInit = modifyPara.canInit, colConf = self.nameCol[this.dataset.col], td = this, tr = d.closest(td, 'tr');
                        reshowEditing();
                        if (typeof canInit === 'function' && !canInit(colConf, tr.classList.contains('added') ? 1 : 0)) {
                            return;
                        }
                        var index = parseInt(tr.dataset.index), rowData = self.rowDataGet(index);
                        this.classList.insert('editing');
                        modifyPara.comInit(td, tools.obj.merge(rowData, editedData[index]), colConf);
                        editing.td = td;
                        editing.index = index;
                        editing.col = colConf;
                        editing.data = rowData;
                    };
                    return {
                        on: function () {
                            d.on(wrapper, 'click', 'tr td:not(.editing)', clickHandle);
                            // window.addEventListener('click', reshowEditing, true);
                        },
                        off: function () {
                            d.off(wrapper, 'click', 'tr td:not(.editing)', clickHandle);
                            // window.removeEventListener('click', reshowEditing);
                        }
                    };
                })();
                /**
                 * 初始化编辑 - 添加 删除
                 */
                var init = function () {
                    _this.theadSort.off();
                    _this.lock.destroy();
                    // this.theadLock.destroy();
                    _this.clickEvent.off();
                    _this.hoverFun.row.off();
                    _this.hoverFun.col.off();
                    if (_this.menu) {
                        _this.menu.col.off();
                        _this.menu.row.off();
                    }
                    wrapper.classList.insert('stand-text');
                };
                var cancel = function () {
                    modifyPara = null;
                    addIndex = 0;
                    deletedIndexes = [];
                    editedData = [];
                    editing = getEditingInit();
                    _this.theadSort.on();
                    _this.lock.init();
                    _this.lock.render(d.queryAll('tbody tr', _this.table), true);
                    //this.click.on();
                    _this.clickEvent.on();
                    _this.hoverFun.row.on();
                    _this.hoverFun.col.on();
                    if (_this.menu) {
                        _this.menu.col.on();
                        _this.menu.row.on();
                    }
                    ctrlIEvent.off();
                    pasteEvent.off();
                    _this.theadSizeCache();
                    _this.theadSizeSync();
                    wrapper.classList.remove('stand-text');
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
                            _this.colGet(i).forEach(function (cell, i) {
                                if (i > 0) {
                                    cellSetDisable(cell);
                                }
                            });
                        }
                    });
                };
                function cellSetDisable(cell) {
                    cell && cell.classList.insert('col-disabled');
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
                    row.classList.insert('added');
                    _this.conf.cols.forEach(function (col) {
                        if (!modifyPara.canInit(col, 1)) {
                            cellSetDisable(d.query("td[data-col=\"" + col.name + "\"]", row));
                        }
                    });
                    d.prepend(tBody, row);
                    //增加一条indexCol
                    if (_this.indexCol.col) {
                        d.after(_this.indexCol.col.firstElementChild, _this.indexColFun.divGet(addIndex));
                        _this.indexColFun.refreshIndex();
                    }
                    editedData[addIndex] = rowData;
                    addIndex++;
                    _this.isShowNoData();
                    if (addIndex === 1) {
                        _this.resize(true);
                    }
                    // console.log(row);
                };
                var deleteRow = function () {
                    _this.trSelected.forEach(function (tr) {
                        // this.lockRowApply(tr, (t) => {
                        // });
                        var index = tr.dataset.index;
                        tr.classList.insert('hide');
                        if (_this.indexCol.col) {
                            _this.indexCol.col.querySelector("div[data-index=\"" + index + "\"]").classList.insert('hide');
                        }
                        // 删除的如果是新增的行 就不需要加入此数组
                        if (_this.tableData[index]) {
                            deletedIndexes.push(parseInt(index));
                        }
                        delete editedData[index];
                    });
                    if (_this.indexCol.col) {
                        _this.indexColFun.refreshIndex();
                    }
                };
                // 销毁输入控件，更新td数据
                var reshowEditing = function () {
                    if (!editing.col) {
                        return;
                    }
                    var editRowData = {}, trIndex = editing.index, rowData = editing.data, newData = modifyPara.valGet(editing.col), tr = d.closest(editing.td, 'tr');
                    for (var name_1 in newData) {
                        var col = _this.nameCol[name_1], newVal = newData[name_1];
                        if (col) {
                            var td = tr.querySelector("td[data-col=\"" + name_1 + "\"]"), tdVal = rowData ? rowData[name_1] : '';
                            td.innerHTML = textFormat ? textFormat((_a = {}, _a[name_1] = newVal, _a), col, trIndex) : newVal;
                            td.classList.remove('editing');
                            // 此处不使用全等，因为用户输入的类型皆为字符串
                            if (tools.str.toEmpty(tdVal) != tools.str.toEmpty(newVal)) {
                                td.classList.insert('edited');
                                editRowData[name_1] = newVal;
                            }
                        }
                        else {
                            editRowData[name_1] = newVal;
                        }
                    }
                    editedData[trIndex] = tools.obj.merge(editedData[trIndex], editRowData);
                    // 清理正在编辑的状态
                    editing = getEditingInit();
                    var _a;
                };
                var getData = function () {
                    var tableLen = _this.tableData.length, // 表格数据原始长度
                    editData = {
                        update: [],
                        insert: [],
                        del: []
                    };
                    editedData.forEach(function (data, index) {
                        if (index <= tableLen - 1) {
                            // 修改
                            editData.update.push(tools.obj.merge(_this.tableData[index], data));
                        }
                        else if (!tools.valid.isEmpty(data)) {
                            // 新增
                            editData.insert.push(tools.obj.merge(_this.tableData[index], data));
                        }
                    });
                    // 删除
                    deletedIndexes.forEach(function (index) {
                        editData.del.push(_this.tableData[index]);
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
                    init: init,
                    initModify: initModify,
                    addRow: addRow,
                    deleteRow: deleteRow,
                    reshowEditing: reshowEditing,
                    cancel: cancel,
                    getData: getData
                };
            })();
            var defaultConf = {
                colReorder: false,
            };
            // console.log(defaultConf, this.conf);
            _this.conf = tools.obj.merge(true, defaultConf, _this.conf);
            _this.hoverFun.col.on();
            _this.hoverFun.row.on();
            // let loading = d.createByHTML('<div class="text-center padding-30"><span class="spinner"></span></div>');
            // this.tableWrapper.parentElement.insertBefore(loading, this.tableWrapper.nextElementSibling);
            // let loading = new Spinner({
            //     el: this.tableWrapper,
            //     type: Spinner.SHOW_TYPE.append,
            //     className: 'text-center padding-30'
            // });
            // loading.show();
            //
            // this.page.go(1, isEnd => {
            //     loading.hide();
            //     loading = null;
            // });
            _this.conf.onComplete && _this.conf.onComplete();
            return _this;
            // this.conf.onComplete(this, false);
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
                    return d.createByHTML(popHtml);
                },
                listDomGet: function (popMenu) {
                    return popMenu;
                },
                btnHtmlGet: function (btn, attr) {
                    return "<li class=\"list-group-item\" " + attr + ">" + btn.title + "</li>";
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
        return PcTable;
    }(basicTable_1.BasicTable));
    exports.PcTable = PcTable;
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="conf.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="sys.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="shell/sys.ad.ts"/>
/// <reference path="shell/sys.h5.ts"/>
/// <reference path="shell/sys.ip.ts"/>
/// <reference path="shell/sys.pc.ts"/>
/// <reference path="shell/sysHistory.pc.ts"/>
/// <reference path="shell/sysPage.pc.ts"/>
/// <reference path="shell/sysTab.pc.ts"/>
/// <reference path="components/index.ts"/>
