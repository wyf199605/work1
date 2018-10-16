
require(['PcTable','paging'], function (pcTable, paging) {
    let d = G.d,
        tools = G.tools;

    let btTable = new pcTable.PcTable({
        table: d.query('table'),
        cols: getCols1(),
        indexCol: 'number'
    });

    let pagination = (function () {
        let page = null,
            currentState = { count: 1, current: 0, size: 20, offset: 0 }, //缓存当前的分页信息
            pageLen = 20; //分页条大小

        /**
         * 初始化分页插件
         * @param {PG_Reset} state
         */
        let init = function (state) {
            let tableBottom = d.createByHTML('<div class="table-out-bottom"></div>');

            btTable.wrapperGet().appendChild(tableBottom);

            page = new paging.Paging({
                el: tableBottom,
                pageOption: [20, 50, 100],
                pageSize: pageLen,
                recordTotal: state.recordTotal,
                change: function (state) {
                    let {count, current, offset, size} = state;

                    currentState = state;

                    btTable.render((current - 1) * size, current * size, true);
                }
            });
            page.go(1);
        };

        /**
         * 获取当前分页信息
         * @returns {{count: number; current: number; size: number; offset: number}}
         */
        let getCurrentState = function () {
            return currentState;
        };
        /**
         * 重置分页条状态
         * @param {PG_Reset} state
         *
         */
        let reset = function (state) {
            //为空则第一次渲染分页条插件
            if (page === null) {
                init(state);
            } else {
                page.reset(state);
            }
        };
        /**
         * 根据返回信息，判断当前分页条是否需要显示
         * @param response
         */
        let isShow = function (response) {
            let pageingBottom = d.query('.table-out-bottom');
            if (pageingBottom) {
                pageingBottom.style.display = response.data.length < pagination.pageLen ? 'none' : 'block'; //当返回数据为空的时候不显示分页条
            }
        };
        return {reset, getCurrentState, isShow, pageLen};
    })();

    let tableData = (function () {

        /**
         * ajax请求
         * @param callback
         */
        let ajax = function (callback) {

            setTimeout(function () {
                callback(getData1());
            }, 20);
        };
        /**
         * 表格刷新
         * @param after
         * @param before
         */
        let refresh = function (after, before) {
            ajax(function (res) {
                if (res) {
                    typeof before === 'function' && before(res);
                    dealTable(res.data, true, btTable);
                    pagination.isShow(res);
                    typeof after === 'function' && after(res);
                }
            });
        };

        /**
         * 渲染表格方法
         * @param {obj[]} data
         * @param {boolean} isSet
         * @param table
         */
        let dealTable = function (data, isSet, table) {
            let cache = pagination.getCurrentState();
            isSet ? table.data.set(data) : table.data.insert(data);
            table.render(isSet ? 0 : cache.offset, isSet ? cache.size : cache.offset + cache.size, isSet);

        };
        return {refresh, ajax, dealTable};
    })();

    tableData.refresh(function (res) {
        pagination.reset({
            offset: 0,
            recordTotal: res.data.length
        });
    })


});