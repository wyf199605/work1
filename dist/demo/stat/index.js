
require(['PcTable', 'paging', 'statistic'], function (pcTable, paging, statistic) {
    let d = G.d,
        tools = G.tools,
        cols = getCols1();

    let btTable = new pcTable.PcTable({
        table: d.query('#table'),
        cols,
        indexCol: 'number'
    });

    let tableData = (function () {
        
        /**
         * ajax请求
         * @param callback
         */
        let ajax = function (callback) {

            setTimeout(function () {
                let data = getData1();
                callback(data);
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
            isSet ? table.data.set(data) : table.data.insert(data);
            table.render(0, 200, isSet);

        };
        return {refresh, ajax, dealTable};
    })();


    // 交叉表
    let crossTable = (function() {
        let stat = new statistic.Statistic();
        function create(config) {
            data = stat.crossTab(config);
            new pcTable.PcTable({
                table: d.query('#table2'),
                indexCol: true,
                multi: {
                    enabled: true,
                    cols: data.cols,
                    colsIndex: data.colsIndex
                },
                data: data.data
            });
        }
        return {create}
    })();




    tableData.refresh();
    crossTable.create({
        colsSum: false,      // 是否聚合计算每列汇总数据
        row: ['BRA_ID', 'GOO_ID'],     // 行
        col: ['GOO_NAME', 'THEME'],             // 列
        val: ['PASSIGNAMOUNT'],           // 值
        cols: getCols1(),
        data: getData1().data
    });


});